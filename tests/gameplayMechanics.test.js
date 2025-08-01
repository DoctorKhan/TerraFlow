const TerraFlowGame = require('../src/main');
const { formatNumber, validateGameState } = require('../src/utils');

describe('Gameplay Mechanics Tests', () => {
    let game;

    beforeEach(() => {
        game = new TerraFlowGame();
    });

    afterEach(() => {
        game.stop();
    });

    describe('Resource Generation and Consumption', () => {
        test('should generate resources at expected rates', () => {
            const state = game.getState();
            
            // With starting units (1 dreamer, 1 weaver), we should have production
            game.gameLogic.updateGameState(1);
            
            const newState = game.getState();
            expect(newState.energyPerSecond).toBeCloseTo(0.1); // 1 weaver * 0.1
            expect(newState.insightPerSecond).toBeCloseTo(0.1); // 1 dreamer * 0.1
            expect(newState.energy).toBeCloseTo(state.energy + 0.1);
            expect(newState.insight).toBeCloseTo(state.insight + 0.1);
        });

        test('should consume resources when creating units', () => {
            const initialState = game.getState();
            const initialDreamers = initialState.units.dreamers;
            const initialEnergy = initialState.energy;

            // Create a dreamer (costs energy)
            const success = game.createUnit('dreamers');
            expect(success).toBe(true);

            const newState = game.getState();

            expect(newState.energy).toBeLessThan(initialEnergy);
            expect(newState.units.dreamers).toBe(initialDreamers + 1);
        });

        test('should prevent resource consumption when insufficient funds', () => {
            // Try to create expensive unit without resources
            game.gameState.setState({ energy: 5, insight: 5 }); // Not enough for either unit
            
            const dreamerResult = game.createUnit('dreamers');
            const weaverResult = game.createUnit('weavers');
            
            expect(dreamerResult).toBe(false);
            expect(weaverResult).toBe(false);
            
            const state = game.getState();
            expect(state.energy).toBe(5); // Should remain unchanged
            expect(state.insight).toBe(5);
        });
    });

    describe('Production Scaling and Bonuses', () => {
        test('should scale production with multiple units', () => {
            game.gameState.setState({
                ...game.getState(),
                units: { dreamers: 5, weavers: 3 }
            });
            
            game.gameLogic.updateGameState(1);
            const state = game.getState();
            
            expect(state.energyPerSecond).toBeCloseTo(0.3); // 3 weavers * 0.1
            expect(state.insightPerSecond).toBeCloseTo(0.5); // 5 dreamers * 0.1
        });

        test('should apply node bonuses correctly', () => {
            const currentState = game.getState();
            game.gameState.setState({
                ...currentState,
                units: { dreamers: 2, weavers: 2 },
                nodes: { sustenance: 1, energy: 1, cohesion: 0, cycling: 0 } // 1.2x multipliers
            });

            game.gameLogic.updateGameState(1);
            const state = game.getState();

            expect(state.energyPerSecond).toBeCloseTo(0.24); // 2 * 0.1 * 1.2
            expect(state.insightPerSecond).toBeCloseTo(0.24); // 2 * 0.1 * 1.2
        });

        test('should apply cohesion bonus to all production', () => {
            const currentState = game.getState();
            game.gameState.setState({
                ...currentState,
                units: { dreamers: 1, weavers: 1 },
                nodes: { sustenance: 0, energy: 0, cohesion: 2, cycling: 0 } // 1.1^2 = 1.21x multiplier
            });

            game.gameLogic.updateGameState(1);
            const state = game.getState();

            const expectedMultiplier = Math.pow(1.1, 2);
            expect(state.energyPerSecond).toBeCloseTo(0.1 * expectedMultiplier);
            expect(state.insightPerSecond).toBeCloseTo(0.1 * expectedMultiplier);
        });
    });

    describe('Cost Scaling and Economics', () => {
        test('should increase costs after each purchase', () => {
            const initialCost = game.getState().unitCosts.dreamers;
            
            // Ensure we have enough resources
            game.gameState.setState({ energy: 1000 });
            
            game.createUnit('dreamers');
            const newCost = game.getState().unitCosts.dreamers;
            
            expect(newCost).toBeCloseTo(initialCost * 1.15);
        });

        test('should scale node costs exponentially', () => {
            const initialCost = game.getState().nodeCosts.cycling;
            
            // Ensure we have enough resources
            game.gameState.setState({ insight: 10000 });
            
            game.upgradeNode('cycling');
            const newCost = game.getState().nodeCosts.cycling;
            
            expect(newCost).toBeCloseTo(initialCost * 2.5);
        });

        test('should maintain economic balance over time', () => {
            // Simulate extended gameplay
            let totalEnergy = 0;
            let totalInsight = 0;
            
            for (let i = 0; i < 100; i++) {
                game.gameLogic.updateGameState(0.1); // 10 seconds total
                const state = game.getState();
                totalEnergy += state.energyPerSecond * 0.1;
                totalInsight += state.insightPerSecond * 0.1;
                
                // Occasionally buy units if we can afford them
                if (i % 20 === 0) {
                    if (game.gameLogic.canAffordUnit('dreamers')) {
                        game.createUnit('dreamers');
                    }
                    if (game.gameLogic.canAffordUnit('weavers')) {
                        game.createUnit('weavers');
                    }
                }
            }
            
            // After 10 seconds, we should have generated significant resources
            expect(totalEnergy).toBeGreaterThan(0.5);
            expect(totalInsight).toBeGreaterThan(0.5);
        });
    });

    describe('Game State Validation', () => {
        test('should maintain valid game state throughout gameplay', () => {
            // Perform various actions
            game.createUnit('dreamers');
            game.gameState.setState({ insight: 300 });
            game.upgradeNode('cycling');
            game.createUnit('weavers');
            game.gameLogic.updateGameState(5);
            
            const state = game.getState();
            expect(validateGameState(state)).toBe(true);
            
            // Check specific constraints
            expect(state.energy).toBeGreaterThanOrEqual(0);
            expect(state.insight).toBeGreaterThanOrEqual(0);
            expect(state.harmony).toBeGreaterThanOrEqual(0);
            expect(state.harmony).toBeLessThanOrEqual(100);
            expect(state.units.dreamers).toBeGreaterThanOrEqual(0);
            expect(state.units.weavers).toBeGreaterThanOrEqual(0);
        });

        test('should handle rapid successive actions', () => {
            game.gameState.setState({ energy: 1000, insight: 1000 });
            
            // Rapidly create units
            for (let i = 0; i < 10; i++) {
                game.createUnit('dreamers');
                game.createUnit('weavers');
            }
            
            const state = game.getState();
            expect(validateGameState(state)).toBe(true);
            expect(state.units.dreamers).toBeGreaterThan(1); // Started with 1
            expect(state.units.weavers).toBeGreaterThan(1); // Started with 1
        });
    });

    describe('Utility Functions', () => {
        test('should format numbers correctly for display', () => {
            expect(formatNumber(0)).toBe('0.0');
            expect(formatNumber(123.456)).toBe('123.5');
            expect(formatNumber(1000)).toBe('1.00k');
            expect(formatNumber(1500000)).toBe('1.50M');
            expect(formatNumber(2000000000)).toBe('2.00B');
        });

        test('should handle edge cases in number formatting', () => {
            expect(formatNumber(999.9)).toBe('999.9');
            expect(formatNumber(1000.1)).toBe('1.00k');
            expect(formatNumber(999999)).toBe('1000.00k');
            expect(formatNumber(1000000)).toBe('1.00M');
        });
    });

    describe('Performance and Stability', () => {
        test('should handle long-running game sessions', () => {
            const startTime = Date.now();
            
            // Simulate 1000 game updates (about 16 seconds at 60fps)
            for (let i = 0; i < 1000; i++) {
                game.gameLogic.updateGameState(0.016);
                
                // Occasionally perform actions
                if (i % 100 === 0) {
                    const state = game.getState();
                    if (state.energy > 50) game.createUnit('dreamers');
                    if (state.insight > 50) game.createUnit('weavers');
                }
            }
            
            const endTime = Date.now();
            const duration = endTime - startTime;
            
            // Should complete in reasonable time (less than 1 second)
            expect(duration).toBeLessThan(1000);
            
            const finalState = game.getState();
            expect(validateGameState(finalState)).toBe(true);
        });

        test('should maintain precision with floating point calculations', () => {
            // Test that repeated small additions don't cause precision errors
            game.gameState.setState({ energy: 0, insight: 0 });
            
            for (let i = 0; i < 1000; i++) {
                game.gameLogic.updateGameState(0.001); // Very small time steps
            }
            
            const state = game.getState();
            // After 1000 * 0.001 = 1 second with starting units
            expect(state.energy).toBeCloseTo(0.1, 2); // 1 weaver * 0.1 * 1 second
            expect(state.insight).toBeCloseTo(0.1, 2); // 1 dreamer * 0.1 * 1 second
        });
    });
});

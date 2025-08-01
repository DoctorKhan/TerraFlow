const GameState = require('../src/gameState');
const GameLogic = require('../src/gameLogic');

describe('GameLogic', () => {
    let gameState;
    let gameLogic;

    beforeEach(() => {
        gameState = new GameState();
        gameLogic = new GameLogic(gameState);
    });

    describe('Unit Creation', () => {
        test('should create dreamer when player has enough energy', () => {
            const result = gameLogic.createUnit('dreamers');

            expect(result).toBe(true);

            const state = gameState.getState();
            expect(state.units.dreamers).toBe(2); // Started with 1, now have 2
            expect(state.energy).toBe(5); // 20 - 15 = 5
            expect(state.unitCosts.dreamers).toBeCloseTo(17.25); // 15 * 1.15
        });

        test('should not create dreamer when player lacks energy', () => {
            gameState.setState({ energy: 5 });

            const result = gameLogic.createUnit('dreamers');

            expect(result).toBe(false);

            const state = gameState.getState();
            expect(state.units.dreamers).toBe(1); // Should remain at starting value
            expect(state.energy).toBe(5); // Should remain unchanged
        });

        test('should create weaver when player has enough insight', () => {
            gameState.setState({ insight: 20 });

            const result = gameLogic.createUnit('weavers');

            expect(result).toBe(true);

            const state = gameState.getState();
            expect(state.units.weavers).toBe(2); // Started with 1, now have 2
            expect(state.insight).toBe(5); // 20 - 15 = 5
            expect(state.unitCosts.weavers).toBeCloseTo(17.25); // 15 * 1.15
        });

        test('should not create weaver when player lacks insight', () => {
            // Reset insight to insufficient amount
            gameState.setState({ insight: 5 }); // Less than 15 needed

            const result = gameLogic.createUnit('weavers');

            expect(result).toBe(false);

            const state = gameState.getState();
            expect(state.units.weavers).toBe(1); // Should remain at starting value
            expect(state.insight).toBe(5); // Should remain unchanged
        });
    });

    describe('Node Upgrades', () => {
        test('should upgrade cycling node and increase harmony', () => {
            gameState.setState({ insight: 250 });
            const initialHarmony = gameState.getState().harmony;
            
            const result = gameLogic.upgradeNode('cycling');
            
            expect(result).toBe(true);
            
            const state = gameState.getState();
            expect(state.nodes.cycling).toBe(1);
            expect(state.insight).toBe(50); // 250 - 200 = 50
            expect(state.harmony).toBe(initialHarmony + 5);
            expect(state.nodeCosts.cycling).toBe(500); // 200 * 2.5
        });

        test('should not upgrade node when player lacks resources', () => {
            const result = gameLogic.upgradeNode('cycling');

            expect(result).toBe(false);

            const state = gameState.getState();
            expect(state.nodes.cycling).toBe(0);
            expect(state.insight).toBe(5); // Initial state has 5 insight
        });

        test('should cap harmony at 100', () => {
            gameState.setState({ insight: 250, harmony: 98 });
            
            gameLogic.upgradeNode('cycling');
            
            const state = gameState.getState();
            expect(state.harmony).toBe(100); // Should be capped at 100
        });
    });

    describe('Game State Updates', () => {
        test('should calculate production correctly with units', () => {
            gameState.setState({
                units: { dreamers: 2, weavers: 3 },
                energy: 20, // Reset to known value
                insight: 5, // Reset to known value
                lastUpdate: Date.now() - 1000 // 1 second ago
            });

            gameLogic.updateGameState(1); // 1 second delta

            const state = gameState.getState();
            expect(state.energyPerSecond).toBeCloseTo(0.3); // 3 weavers * 0.1
            expect(state.insightPerSecond).toBeCloseTo(0.2); // 2 dreamers * 0.1
            expect(state.energy).toBeCloseTo(20.3); // 20 + 0.3
            expect(state.insight).toBeCloseTo(5.2); // 5 + 0.2
        });

        test('should apply node bonuses to production', () => {
            // Set up state with proper structure
            const currentState = gameState.getState();
            gameState.setState({
                ...currentState,
                units: { dreamers: 1, weavers: 1 },
                nodes: { sustenance: 1, energy: 1, cohesion: 0, cycling: 0 }, // 1.2x multipliers
                lastUpdate: Date.now() - 1000
            });

            gameLogic.updateGameState(1);

            const state = gameState.getState();
            expect(state.energyPerSecond).toBeCloseTo(0.12); // 0.1 * 1.2
            expect(state.insightPerSecond).toBeCloseTo(0.12); // 0.1 * 1.2
        });
    });

    describe('Affordability Checks', () => {
        test('should correctly check if player can afford units', () => {
            expect(gameLogic.canAffordUnit('dreamers')).toBe(true); // Has 20 energy, costs 15
            expect(gameLogic.canAffordUnit('weavers')).toBe(false); // Has 5 insight, costs 15
        });

        test('should correctly check if player can afford nodes', () => {
            gameState.setState({ energy: 150, insight: 250 });

            expect(gameLogic.canAffordNode('sustenance')).toBe(true); // Costs 100 energy
            expect(gameLogic.canAffordNode('energy')).toBe(true); // Costs 100 insight
            expect(gameLogic.canAffordNode('cohesion')).toBe(false); // Costs 500 energy
            expect(gameLogic.canAffordNode('cycling')).toBe(true); // Costs 200 insight
        });
    });

    describe('Edge Cases and Error Handling', () => {
        test('should handle invalid unit types gracefully', () => {
            expect(() => gameLogic.createUnit('invalid')).not.toThrow();
            expect(gameLogic.createUnit('invalid')).toBe(false);
        });

        test('should handle invalid node types gracefully', () => {
            expect(() => gameLogic.upgradeNode('invalid')).not.toThrow();
            expect(gameLogic.upgradeNode('invalid')).toBe(false);
        });

        test('should handle negative delta values', () => {
            const initialState = gameState.getState();
            expect(() => gameLogic.updateGameState(-1)).not.toThrow();

            const newState = gameState.getState();
            // Resources should not go negative
            expect(newState.energy).toBeGreaterThanOrEqual(0);
            expect(newState.insight).toBeGreaterThanOrEqual(0);
        });

        test('should handle very large numbers', () => {
            gameState.setState({
                energy: 1e15,
                insight: 1e15,
                units: { dreamers: 1000, weavers: 1000 }
            });

            expect(() => gameLogic.updateGameState(1)).not.toThrow();

            const state = gameState.getState();
            expect(typeof state.energy).toBe('number');
            expect(typeof state.insight).toBe('number');
            expect(state.energy).not.toBeNaN();
            expect(state.insight).not.toBeNaN();
        });
    });

    describe('Game Balance and Progression', () => {
        test('should maintain reasonable cost scaling', () => {
            const initialCost = gameState.getState().unitCosts.dreamers;

            // Create multiple units and check cost scaling
            for (let i = 0; i < 5; i++) {
                gameState.setState({ energy: 1000 }); // Ensure we can afford
                gameLogic.createUnit('dreamers');
            }

            const finalCost = gameState.getState().unitCosts.dreamers;
            const expectedCost = initialCost * Math.pow(1.15, 5);

            expect(finalCost).toBeCloseTo(expectedCost, 2);
        });

        test('should maintain harmony within valid bounds', () => {
            // Test harmony doesn't exceed 100
            gameState.setState({ insight: 10000, harmony: 95 });

            for (let i = 0; i < 10; i++) {
                gameLogic.upgradeNode('cycling'); // Each adds 5 harmony
                gameState.setState({ insight: 10000 }); // Refill resources
            }

            expect(gameState.getState().harmony).toBeLessThanOrEqual(100);
        });

        test('should have balanced production rates', () => {
            gameState.setState({
                units: { dreamers: 10, weavers: 10 },
                nodes: { sustenance: 2, energy: 2, cohesion: 1, cycling: 0 }
            });

            gameLogic.updateGameState(1);
            const state = gameState.getState();

            // Both production rates should be positive and balanced
            expect(state.energyPerSecond).toBeGreaterThan(0);
            expect(state.insightPerSecond).toBeGreaterThan(0);

            // With equal units and upgrades, rates should be similar
            const ratio = state.energyPerSecond / state.insightPerSecond;
            expect(ratio).toBeCloseTo(1, 0.1); // Within 10% of each other
        });
    });
});

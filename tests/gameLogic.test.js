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
            expect(state.units.dreamers).toBe(1);
            expect(state.energy).toBe(0); // 10 - 10 = 0
            expect(state.unitCosts.dreamers).toBeCloseTo(11.5); // 10 * 1.15
        });

        test('should not create dreamer when player lacks energy', () => {
            gameState.setState({ energy: 5 });
            
            const result = gameLogic.createUnit('dreamers');
            
            expect(result).toBe(false);
            
            const state = gameState.getState();
            expect(state.units.dreamers).toBe(0);
            expect(state.energy).toBe(5); // Should remain unchanged
        });

        test('should create weaver when player has enough insight', () => {
            gameState.setState({ insight: 15 });
            
            const result = gameLogic.createUnit('weavers');
            
            expect(result).toBe(true);
            
            const state = gameState.getState();
            expect(state.units.weavers).toBe(1);
            expect(state.insight).toBe(5); // 15 - 10 = 5
            expect(state.unitCosts.weavers).toBeCloseTo(11.5);
        });

        test('should not create weaver when player lacks insight', () => {
            const result = gameLogic.createUnit('weavers');
            
            expect(result).toBe(false);
            
            const state = gameState.getState();
            expect(state.units.weavers).toBe(0);
            expect(state.insight).toBe(0);
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
            expect(state.insight).toBe(0);
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
                lastUpdate: Date.now() - 1000 // 1 second ago
            });
            
            gameLogic.updateGameState(1); // 1 second delta
            
            const state = gameState.getState();
            expect(state.energyPerSecond).toBeCloseTo(0.3); // 3 weavers * 0.1
            expect(state.insightPerSecond).toBeCloseTo(0.2); // 2 dreamers * 0.1
            expect(state.energy).toBeCloseTo(10.3); // 10 + 0.3
            expect(state.insight).toBeCloseTo(0.2); // 0 + 0.2
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
            expect(gameLogic.canAffordUnit('dreamers')).toBe(true); // Has 10 energy
            expect(gameLogic.canAffordUnit('weavers')).toBe(false); // Has 0 insight
        });

        test('should correctly check if player can afford nodes', () => {
            gameState.setState({ energy: 150, insight: 250 });
            
            expect(gameLogic.canAffordNode('sustenance')).toBe(true); // Costs 100 energy
            expect(gameLogic.canAffordNode('energy')).toBe(true); // Costs 100 insight
            expect(gameLogic.canAffordNode('cohesion')).toBe(false); // Costs 500 energy
            expect(gameLogic.canAffordNode('cycling')).toBe(true); // Costs 200 insight
        });
    });
});

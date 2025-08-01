const GameState = require('../src/gameState');

describe('GameState', () => {
    let gameState;

    beforeEach(() => {
        gameState = new GameState();
    });

    describe('Initial State', () => {
        test('should initialize with correct default values', () => {
            const state = gameState.getState();

            expect(state.energy).toBe(20);
            expect(state.energyPerSecond).toBe(0);
            expect(state.insight).toBe(5);
            expect(state.insightPerSecond).toBe(0);
            expect(state.harmony).toBe(50);
        });

        test('should initialize units with starting counts', () => {
            const state = gameState.getState();

            expect(state.units.dreamers).toBe(1);
            expect(state.units.weavers).toBe(1);
        });

        test('should initialize unit costs correctly', () => {
            const state = gameState.getState();

            expect(state.unitCosts.dreamers).toBe(15);
            expect(state.unitCosts.weavers).toBe(15);
        });

        test('should initialize nodes with zero levels', () => {
            const state = gameState.getState();
            
            expect(state.nodes.sustenance).toBe(0);
            expect(state.nodes.energy).toBe(0);
            expect(state.nodes.cohesion).toBe(0);
            expect(state.nodes.cycling).toBe(0);
        });

        test('should initialize node costs correctly', () => {
            const state = gameState.getState();
            
            expect(state.nodeCosts.sustenance).toBe(100);
            expect(state.nodeCosts.energy).toBe(100);
            expect(state.nodeCosts.cohesion).toBe(500);
            expect(state.nodeCosts.cycling).toBe(200);
        });
    });

    describe('State Management', () => {
        test('should update state correctly', () => {
            const newState = { energy: 20, insight: 5 };
            gameState.setState(newState);
            
            const state = gameState.getState();
            expect(state.energy).toBe(20);
            expect(state.insight).toBe(5);
            expect(state.harmony).toBe(50); // Should preserve other values
        });

        test('should reset to initial state', () => {
            // Modify state
            gameState.setState({ energy: 100, insight: 50, harmony: 75 });

            // Reset
            gameState.reset();

            const state = gameState.getState();
            expect(state.energy).toBe(20);
            expect(state.insight).toBe(5);
            expect(state.harmony).toBe(50);
        });
    });
});

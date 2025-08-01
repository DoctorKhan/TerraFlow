const TerraFlowGame = require('../src/main');

describe('TerraFlow Integration Tests', () => {
    let game;

    beforeEach(() => {
        game = new TerraFlowGame();
    });

    afterEach(() => {
        game.stop();
    });

    describe('Game Initialization', () => {
        test('should initialize with correct starting state', () => {
            const state = game.getState();

            expect(state.energy).toBe(20);
            expect(state.insight).toBe(5);
            expect(state.harmony).toBe(50);
            expect(state.units.dreamers).toBe(1);
            expect(state.units.weavers).toBe(1);
        });
    });

    describe('Basic Gameplay Flow', () => {
        test('should allow creating dreamers with initial energy', () => {
            const success = game.createUnit('dreamers');
            expect(success).toBe(true);

            const state = game.getState();
            expect(state.units.dreamers).toBe(2); // Started with 1, now have 2
            expect(state.energy).toBe(5); // 20 - 15 = 5
        });

        test('should generate insight with dreamers over time', () => {
            // Create a dreamer
            game.createUnit('dreamers');

            // Manually update game state to simulate time passing
            game.gameLogic.updateGameState(1); // 1 second

            const state = game.getState();
            expect(state.insight).toBeCloseTo(0.1); // 1 dreamer * 0.1 * 1 second
            expect(state.insightPerSecond).toBeCloseTo(0.1);
        });

        test('should allow creating weavers with insight', () => {
            // First create a dreamer and give it some time to generate insight
            game.createUnit('dreamers');
            
            // Manually add insight for testing
            const currentState = game.getState();
            game.gameState.setState({ ...currentState, insight: 15 });
            
            const success = game.createUnit('weavers');
            expect(success).toBe(true);
            
            const state = game.getState();
            expect(state.units.weavers).toBe(1);
            expect(state.insight).toBe(5); // 15 - 10 = 5
        });

        test('should allow upgrading nodes with sufficient resources', () => {
            // Add enough insight to upgrade cycling node
            const currentState = game.getState();
            game.gameState.setState({ ...currentState, insight: 250 });
            
            const success = game.upgradeNode('cycling');
            expect(success).toBe(true);
            
            const state = game.getState();
            expect(state.nodes.cycling).toBe(1);
            expect(state.harmony).toBe(55); // 50 + 5
        });
    });

    describe('Resource Management', () => {
        test('should prevent actions when resources are insufficient', () => {
            // Try to create weaver without insight
            const weaverResult = game.createUnit('weavers');
            expect(weaverResult).toBe(false);
            
            // Try to upgrade expensive node without resources
            const nodeResult = game.upgradeNode('cohesion');
            expect(nodeResult).toBe(false);
            
            const state = game.getState();
            expect(state.units.weavers).toBe(0);
            expect(state.nodes.cohesion).toBe(0);
        });

        test('should increase costs after purchases', () => {
            const initialState = game.getState();
            const initialCost = initialState.unitCosts.dreamers;
            
            game.createUnit('dreamers');
            
            const newState = game.getState();
            expect(newState.unitCosts.dreamers).toBeGreaterThan(initialCost);
            expect(newState.unitCosts.dreamers).toBeCloseTo(initialCost * 1.15);
        });
    });

    describe('Production Scaling', () => {
        test('should scale production with multiple units', () => {
            // Set up state with multiple units
            const state = game.getState();
            game.gameState.setState({
                ...state,
                units: { dreamers: 3, weavers: 2 },
                insight: 100,
                energy: 100
            });
            
            // Update game state to calculate production
            game.gameLogic.updateGameState(1);
            
            const newState = game.getState();
            expect(newState.energyPerSecond).toBeCloseTo(0.2); // 2 weavers * 0.1
            expect(newState.insightPerSecond).toBeCloseTo(0.3); // 3 dreamers * 0.1
        });
    });
});

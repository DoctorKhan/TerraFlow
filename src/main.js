// Main entry point for the game
const GameState = require('./gameState');
const GameLogic = require('./gameLogic');
const { formatNumber } = require('./utils');

class TerraFlowGame {
    constructor() {
        this.gameState = new GameState();
        this.gameLogic = new GameLogic(this.gameState);
        this.isRunning = false;
    }

    start() {
        console.log("🌟 Welcome to Resonant Sanctuary: The Weaver");
        console.log("The sanctuary awakens. Resonate with the cosmos.");
        this.isRunning = true;
        this.gameLoop();
    }

    stop() {
        this.isRunning = false;
    }

    gameLoop() {
        if (!this.isRunning) return;

        const now = Date.now();
        const state = this.gameState.getState();
        const delta = (now - state.lastUpdate) / 1000;

        this.gameLogic.updateGameState(delta);
        
        // Log current state every 5 seconds
        if (Math.floor(now / 5000) !== Math.floor(state.lastUpdate / 5000)) {
            this.logStatus();
        }

        setTimeout(() => this.gameLoop(), 100);
    }

    logStatus() {
        const state = this.gameState.getState();
        console.log(`⚡ Energy: ${formatNumber(state.energy)} (${formatNumber(state.energyPerSecond)}/s)`);
        console.log(`🔮 Insight: ${formatNumber(state.insight)} (${formatNumber(state.insightPerSecond)}/s)`);
        console.log(`🌿 Harmony: ${state.harmony.toFixed(1)}%`);
        console.log(`Units - Dreamers: ${state.units.dreamers}, Weavers: ${state.units.weavers}`);
        console.log('---');
    }

    createUnit(type) {
        return this.gameLogic.createUnit(type);
    }

    upgradeNode(type) {
        return this.gameLogic.upgradeNode(type);
    }

    getState() {
        return this.gameState.getState();
    }
}

// Export for testing
module.exports = TerraFlowGame;

// Run if this is the main module
if (require.main === module) {
    const game = new TerraFlowGame();
    game.start();
    
    // Example gameplay
    setTimeout(() => {
        console.log("Creating a dreamer...");
        game.createUnit('dreamers');
    }, 2000);
    
    setTimeout(() => {
        console.log("Creating a weaver...");
        game.createUnit('weavers');
    }, 4000);
}

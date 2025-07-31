// Game Logic
const { unitsConfig, nodesConfig } = require('./gameConfig');

class GameLogic {
    constructor(gameState) {
        this.gameState = gameState;
    }

    createUnit(key) {
        const state = this.gameState.getState();
        const unitConf = unitsConfig[key];
        const cost = state.unitCosts[key];
        
        if (state[unitConf.costResource] >= cost) {
            const newState = { ...state };
            newState[unitConf.costResource] -= cost;
            newState.units[key]++;
            newState.unitCosts[key] *= 1.15;
            
            this.gameState.setState(newState);
            return true;
        }
        return false;
    }

    upgradeNode(key) {
        const state = this.gameState.getState();
        const nodeConf = nodesConfig[key];
        const cost = state.nodeCosts[key];
        
        if (state[nodeConf.costResource] >= cost) {
            const newState = { ...state };
            newState[nodeConf.costResource] -= cost;
            newState.nodes[key]++;
            newState.nodeCosts[key] *= 2.5;
            
            if (nodeConf.harmony) {
                newState.harmony = Math.min(100, newState.harmony + nodeConf.harmony);
            }
            
            this.gameState.setState(newState);
            return true;
        }
        return false;
    }

    updateGameState(delta) {
        const state = this.gameState.getState();

        // Calculate production per second
        let energyPerSecond = state.units.weavers * unitsConfig.weavers.baseEnergy;
        let insightPerSecond = state.units.dreamers * unitsConfig.dreamers.baseInsight;

        // Apply node bonuses
        energyPerSecond *= Math.pow(nodesConfig.energy.multiplier, state.nodes.energy);
        insightPerSecond *= Math.pow(nodesConfig.sustenance.multiplier, state.nodes.sustenance);

        const cohesionBonus = Math.pow(nodesConfig.cohesion.multiplier, state.nodes.cohesion);
        energyPerSecond *= cohesionBonus;
        insightPerSecond *= cohesionBonus;

        const newState = {
            ...state,
            energyPerSecond,
            insightPerSecond,
            energy: state.energy + energyPerSecond * delta,
            insight: state.insight + insightPerSecond * delta,
            lastUpdate: Date.now()
        };

        this.gameState.setState(newState);
    }

    canAffordUnit(key) {
        const state = this.gameState.getState();
        const unitConf = unitsConfig[key];
        const cost = state.unitCosts[key];
        return state[unitConf.costResource] >= cost;
    }

    canAffordNode(key) {
        const state = this.gameState.getState();
        const nodeConf = nodesConfig[key];
        const cost = state.nodeCosts[key];
        return state[nodeConf.costResource] >= cost;
    }
}

module.exports = GameLogic;

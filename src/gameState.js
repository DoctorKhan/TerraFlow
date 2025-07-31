// Game State Management
class GameState {
    constructor() {
        this.state = {
            energy: 20,
            energyPerSecond: 0,
            insight: 5,
            insightPerSecond: 0,
            harmony: 50,
            units: {
                dreamers: 1,  // Start with 1 dreamer for immediate insight generation
                weavers: 1,   // Start with 1 weaver for immediate energy generation
            },
            unitCosts: {
                dreamers: 15,  // Slightly higher since we start with units
                weavers: 15,
            },
            nodes: {
                sustenance: 0,
                energy: 0,
                cohesion: 0,
                cycling: 0,
            },
            nodeCosts: {
                sustenance: 100,
                energy: 100,
                cohesion: 500,
                cycling: 200,
            },
            villageGrid: [],
            stars: [],
            lastUpdate: Date.now(),
        };
    }

    getState() {
        return this.state;
    }

    setState(newState) {
        this.state = { ...this.state, ...newState };
    }

    reset() {
        this.state = {
            energy: 20,
            energyPerSecond: 0,
            insight: 5,
            insightPerSecond: 0,
            harmony: 50,
            units: {
                dreamers: 1,  // Start with 1 dreamer for immediate insight generation
                weavers: 1,   // Start with 1 weaver for immediate energy generation
            },
            unitCosts: {
                dreamers: 15,  // Slightly higher since we start with units
                weavers: 15,
            },
            nodes: {
                sustenance: 0,
                energy: 0,
                cohesion: 0,
                cycling: 0,
            },
            nodeCosts: {
                sustenance: 100,
                energy: 100,
                cohesion: 500,
                cycling: 200,
            },
            villageGrid: [],
            stars: [],
            lastUpdate: Date.now(),
        };
    }
}

module.exports = GameState;

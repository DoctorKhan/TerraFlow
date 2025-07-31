// Game Configuration
const unitsConfig = {
    dreamers: { 
        name: "Dreamer", 
        description: "Generates Insight.", 
        baseInsight: 0.1, 
        costResource: 'energy' 
    },
    weavers: { 
        name: "Weaver", 
        description: "Generates Energy.", 
        baseEnergy: 0.1, 
        costResource: 'insight' 
    },
};

const nodesConfig = {
    sustenance: { 
        name: "Sustenance Node", 
        description: "Boosts Dreamer insight generation.", 
        effectTarget: 'dreamers', 
        multiplier: 1.2, 
        costResource: 'energy' 
    },
    energy: { 
        name: "Energy Node", 
        description: "Boosts Weaver energy generation.", 
        effectTarget: 'weavers', 
        multiplier: 1.2, 
        costResource: 'insight' 
    },
    cohesion: { 
        name: "Cohesion Node", 
        description: "Boosts all production.", 
        effectTarget: 'all', 
        multiplier: 1.1, 
        costResource: 'energy' 
    },
    cycling: { 
        name: "Recycling Node", 
        description: "Reduces the cost of all units and improves Harmony.", 
        effectTarget: 'cost', 
        multiplier: 0.95, 
        harmony: 5, 
        costResource: 'insight' 
    },
};

module.exports = {
    unitsConfig,
    nodesConfig
};

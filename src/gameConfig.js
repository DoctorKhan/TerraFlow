// Game Configuration - TDD Races: Expanded cosmic beings and alien species
const racesConfig = {
    human: {
        name: "Human",
        description: "The original inhabitants of the sanctuary",
        color: '#8B5CF6',
        symbol: '👤',
        unlocked: true,
        tier: 1
    },
    stellar: {
        name: "Stellar Nomads",
        description: "Wandering beings from distant stars",
        color: '#F59E0B',
        symbol: '⭐',
        unlockCondition: { energy: 50, insight: 25 },
        unlocked: false,
        tier: 2
    },
    void: {
        name: "Void Whisperers",
        description: "Mysterious entities from the space between spaces",
        color: '#1F2937',
        symbol: '🌑',
        unlockCondition: { harmony: 70, energy: 100 },
        unlocked: false,
        tier: 3
    },
    crystal: {
        name: "Crystal Beings",
        description: "Living crystalline entities that resonate with cosmic energy",
        color: '#10B981',
        symbol: '💎',
        unlockCondition: { energy: 200, insight: 100 },
        unlocked: false,
        tier: 3
    },
    plasma: {
        name: "Plasma Dancers",
        description: "Energy beings that exist in pure plasma form",
        color: '#EF4444',
        symbol: '🔥',
        unlockCondition: { energy: 500, harmony: 80 },
        unlocked: false,
        tier: 4
    },
    quantum: {
        name: "Quantum Sages",
        description: "Beings that exist in multiple dimensions simultaneously",
        color: '#8B5CF6',
        symbol: '🌀',
        unlockCondition: { insight: 500, harmony: 85 },
        unlocked: false,
        tier: 5
    },
    nebula: {
        name: "Nebula Shepherds",
        description: "Ancient beings that guide the formation of stars",
        color: '#A78BFA',
        symbol: '🌌',
        unlockCondition: { energy: 1000, insight: 800, harmony: 95 },
        unlocked: false,
        tier: 5
    }
};

const unitsConfig = {
    // Human Units
    dreamers: {
        name: "Dreamer",
        description: "Generates Insight through cosmic meditation.",
        baseInsight: 0.1,
        costResource: 'energy',
        race: 'human',
        special: 'dreamVision'
    },
    weavers: {
        name: "Weaver",
        description: "Generates Energy by weaving cosmic threads.",
        baseEnergy: 0.1,
        costResource: 'insight',
        race: 'human',
        special: 'energyWeaving'
    },

    // Stellar Nomad Units
    stellarNomads: {
        name: "Stellar Nomad",
        description: "Wandering star-travelers who generate both Energy and Insight.",
        baseEnergy: 0.15,
        baseInsight: 0.05,
        costResource: 'energy',
        race: 'stellar',
        special: 'stellarNavigation'
    },

    // Void Whisperer Units
    voidWhisperers: {
        name: "Void Whisperer",
        description: "Mysterious beings who commune with the void, generating Harmony.",
        baseInsight: 0.08,
        baseHarmony: 0.02,
        costResource: 'insight',
        race: 'void',
        special: 'voidCommunion'
    },

    // Crystal Being Units
    crystalBeings: {
        name: "Crystal Being",
        description: "Living crystals that amplify and store cosmic energy.",
        baseEnergy: 0.2,
        costResource: 'energy',
        race: 'crystal',
        special: 'crystalResonance'
    },

    // Plasma Dancer Units
    plasmaDancers: {
        name: "Plasma Dancer",
        description: "Pure energy beings that dance through plasma states.",
        baseEnergy: 0.3,
        costResource: 'insight',
        race: 'plasma',
        special: 'plasmaManipulation'
    },

    // Quantum Sage Units
    quantumSages: {
        name: "Quantum Sage",
        description: "Multi-dimensional beings with vast cosmic knowledge.",
        baseInsight: 0.5,
        costResource: 'energy',
        race: 'quantum',
        special: 'quantumEntanglement'
    },

    // Nebula Shepherd Units
    nebulaShepherds: {
        name: "Nebula Shepherd",
        description: "Ancient beings who birth stars and shape cosmic destiny.",
        baseEnergy: 0.8,
        baseInsight: 0.3,
        baseHarmony: 0.1,
        costResource: 'insight',
        race: 'nebula',
        special: 'starBirth'
    }
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
    racesConfig,
    unitsConfig,
    nodesConfig
};

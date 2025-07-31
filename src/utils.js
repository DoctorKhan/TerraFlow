// Utility Functions
const formatNumber = (num) => {
    if (num < 1000) return num.toFixed(1);
    if (num < 1e6) return (num / 1e3).toFixed(2) + 'k';
    if (num < 1e9) return (num / 1e6).toFixed(2) + 'M';
    return (num / 1e9).toFixed(2) + 'B';
};

const validateGameState = (state) => {
    const requiredFields = [
        'energy', 'energyPerSecond', 'insight', 'insightPerSecond', 
        'harmony', 'units', 'unitCosts', 'nodes', 'nodeCosts'
    ];
    
    for (const field of requiredFields) {
        if (!(field in state)) {
            return false;
        }
    }
    
    // Validate numeric fields are non-negative
    const numericFields = ['energy', 'energyPerSecond', 'insight', 'insightPerSecond', 'harmony'];
    for (const field of numericFields) {
        if (typeof state[field] !== 'number' || state[field] < 0) {
            return false;
        }
    }
    
    return true;
};

const clamp = (value, min, max) => {
    return Math.min(Math.max(value, min), max);
};

module.exports = {
    formatNumber,
    validateGameState,
    clamp
};

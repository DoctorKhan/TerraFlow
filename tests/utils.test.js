const { formatNumber, validateGameState, clamp } = require('../src/utils');

describe('Utils', () => {
    describe('formatNumber', () => {
        test('should format small numbers with one decimal place', () => {
            expect(formatNumber(5)).toBe('5.0');
            expect(formatNumber(123.456)).toBe('123.5');
            expect(formatNumber(999.9)).toBe('999.9');
        });

        test('should format thousands with k suffix', () => {
            expect(formatNumber(1000)).toBe('1.00k');
            expect(formatNumber(1500)).toBe('1.50k');
            expect(formatNumber(999999)).toBe('1000.00k');
        });

        test('should format millions with M suffix', () => {
            expect(formatNumber(1000000)).toBe('1.00M');
            expect(formatNumber(1500000)).toBe('1.50M');
            expect(formatNumber(999999999)).toBe('1000.00M');
        });

        test('should format billions with B suffix', () => {
            expect(formatNumber(1000000000)).toBe('1.00B');
            expect(formatNumber(1500000000)).toBe('1.50B');
        });
    });

    describe('validateGameState', () => {
        test('should validate correct game state', () => {
            const validState = {
                energy: 10,
                energyPerSecond: 0,
                insight: 0,
                insightPerSecond: 0,
                harmony: 50,
                units: { dreamers: 0, weavers: 0 },
                unitCosts: { dreamers: 10, weavers: 10 },
                nodes: { sustenance: 0, energy: 0, cohesion: 0, cycling: 0 },
                nodeCosts: { sustenance: 100, energy: 100, cohesion: 500, cycling: 200 }
            };

            expect(validateGameState(validState)).toBe(true);
        });

        test('should reject state missing required fields', () => {
            const invalidState = {
                energy: 10,
                // Missing other required fields
            };

            expect(validateGameState(invalidState)).toBe(false);
        });

        test('should reject state with negative numeric values', () => {
            const invalidState = {
                energy: -5, // Negative value
                energyPerSecond: 0,
                insight: 0,
                insightPerSecond: 0,
                harmony: 50,
                units: { dreamers: 0, weavers: 0 },
                unitCosts: { dreamers: 10, weavers: 10 },
                nodes: { sustenance: 0, energy: 0, cohesion: 0, cycling: 0 },
                nodeCosts: { sustenance: 100, energy: 100, cohesion: 500, cycling: 200 }
            };

            expect(validateGameState(invalidState)).toBe(false);
        });

        test('should reject state with non-numeric values', () => {
            const invalidState = {
                energy: "10", // String instead of number
                energyPerSecond: 0,
                insight: 0,
                insightPerSecond: 0,
                harmony: 50,
                units: { dreamers: 0, weavers: 0 },
                unitCosts: { dreamers: 10, weavers: 10 },
                nodes: { sustenance: 0, energy: 0, cohesion: 0, cycling: 0 },
                nodeCosts: { sustenance: 100, energy: 100, cohesion: 500, cycling: 200 }
            };

            expect(validateGameState(invalidState)).toBe(false);
        });
    });

    describe('clamp', () => {
        test('should clamp values within range', () => {
            expect(clamp(5, 0, 10)).toBe(5);
            expect(clamp(-5, 0, 10)).toBe(0);
            expect(clamp(15, 0, 10)).toBe(10);
        });

        test('should handle edge cases', () => {
            expect(clamp(0, 0, 10)).toBe(0);
            expect(clamp(10, 0, 10)).toBe(10);
        });
    });
});

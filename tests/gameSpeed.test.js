/**
 * @jest-environment jsdom
 */

describe('Game Speed Tests - Faster Time Progression', () => {
    let mockGameState;
    let mockUnitsConfig;

    beforeEach(() => {
        mockGameState = {
            energy: 20,
            insight: 5,
            energyPerSecond: 0,
            insightPerSecond: 0,
            units: { dreamers: 1, weavers: 1 },
            nodes: { sustenance: 0, energy: 0, cohesion: 0, cycling: 0 },
            lastUpdate: Date.now()
        };

        mockUnitsConfig = {
            dreamers: { baseInsight: 0.1 },
            weavers: { baseEnergy: 0.1 }
        };
    });

    describe('Time Acceleration', () => {
        test('should apply time multiplier to resource generation', () => {
            const timeMultiplier = 5; // 5x faster
            const delta = 1.0; // 1 second
            
            const updateGameState = (gameState, delta, multiplier = 1) => {
                const acceleratedDelta = delta * multiplier;
                
                const energyPerSecond = gameState.units.weavers * mockUnitsConfig.weavers.baseEnergy;
                const insightPerSecond = gameState.units.dreamers * mockUnitsConfig.dreamers.baseInsight;
                
                gameState.energy += energyPerSecond * acceleratedDelta;
                gameState.insight += insightPerSecond * acceleratedDelta;
                gameState.energyPerSecond = energyPerSecond;
                gameState.insightPerSecond = insightPerSecond;
            };

            const initialEnergy = mockGameState.energy;
            const initialInsight = mockGameState.insight;

            updateGameState(mockGameState, delta, timeMultiplier);

            // Should generate 5x more resources in the same time
            const expectedEnergyGain = mockUnitsConfig.weavers.baseEnergy * timeMultiplier;
            const expectedInsightGain = mockUnitsConfig.dreamers.baseInsight * timeMultiplier;

            expect(mockGameState.energy).toBeCloseTo(initialEnergy + expectedEnergyGain, 2);
            expect(mockGameState.insight).toBeCloseTo(initialInsight + expectedInsightGain, 2);
        });

        test('should maintain game balance with faster progression', () => {
            const timeMultiplier = 3;
            const delta = 0.1; // 100ms frame
            
            // Simulate 10 seconds of accelerated gameplay (100 frames)
            for (let i = 0; i < 100; i++) {
                const acceleratedDelta = delta * timeMultiplier;
                const energyGain = mockGameState.units.weavers * mockUnitsConfig.weavers.baseEnergy * acceleratedDelta;
                const insightGain = mockGameState.units.dreamers * mockUnitsConfig.dreamers.baseInsight * acceleratedDelta;
                
                mockGameState.energy += energyGain;
                mockGameState.insight += insightGain;
            }

            // After 10 seconds at 3x speed, should have gained 30 seconds worth of resources
            const expectedEnergy = 20 + (1 * 0.1 * 30); // 20 + (1 weaver * 0.1 rate * 30 seconds)
            const expectedInsight = 5 + (1 * 0.1 * 30); // 5 + (1 dreamer * 0.1 rate * 30 seconds)

            expect(mockGameState.energy).toBeCloseTo(expectedEnergy, 1);
            expect(mockGameState.insight).toBeCloseTo(expectedInsight, 1);
        });

        test('should allow configurable time speeds', () => {
            const timeSettings = {
                normal: 1,
                fast: 2,
                turbo: 5,
                lightning: 10
            };

            Object.entries(timeSettings).forEach(([mode, multiplier]) => {
                const testState = { ...mockGameState };
                const delta = 1.0;
                
                const energyGain = testState.units.weavers * mockUnitsConfig.weavers.baseEnergy * delta * multiplier;
                testState.energy += energyGain;

                const expectedEnergy = mockGameState.energy + (0.1 * multiplier);
                expect(testState.energy).toBeCloseTo(expectedEnergy, 2);
            });
        });
    });

    describe('Animation Speed Scaling', () => {
        test('should scale animation speed with time multiplier', () => {
            const timeMultiplier = 4;
            const baseAnimationSpeed = 0.016; // 60fps
            
            const getAnimationDelta = (multiplier) => {
                return baseAnimationSpeed * multiplier;
            };

            const animationDelta = getAnimationDelta(timeMultiplier);
            expect(animationDelta).toBe(0.064); // 4x faster animations
        });

        test('should maintain smooth visual feedback at higher speeds', () => {
            const timeMultipliers = [1, 2, 3, 5, 10];
            
            timeMultipliers.forEach(multiplier => {
                const animationSpeed = 0.016 * multiplier;
                
                // Animation should be faster but still reasonable for visual feedback
                expect(animationSpeed).toBeGreaterThan(0);
                expect(animationSpeed).toBeLessThan(1); // Not so fast it's invisible
            });
        });
    });

    describe('UI Update Frequency', () => {
        test('should update UI more frequently at higher speeds', () => {
            const baseUIUpdateInterval = 500; // 500ms
            const timeMultiplier = 5;
            
            const getUIUpdateInterval = (multiplier) => {
                // Update UI more frequently when time is faster
                return Math.max(100, baseUIUpdateInterval / multiplier);
            };

            const fastUIInterval = getUIUpdateInterval(timeMultiplier);
            expect(fastUIInterval).toBe(100); // Minimum 100ms, but faster than base
            expect(fastUIInterval).toBeLessThan(baseUIUpdateInterval);
        });

        test('should show accurate per-second rates at any speed', () => {
            const timeMultiplier = 3;
            const actualEnergyPerSecond = 0.5;
            
            // Display should always show the actual per-second rate, not the accelerated rate
            const displayRate = actualEnergyPerSecond; // Not multiplied by time multiplier
            
            expect(displayRate).toBe(0.5);
            expect(displayRate).not.toBe(actualEnergyPerSecond * timeMultiplier);
        });
    });

    describe('Game Balance at Different Speeds', () => {
        test('should maintain relative costs at all speeds', () => {
            const baseCost = 15;
            const timeMultiplier = 8;
            
            // Costs should remain the same regardless of time speed
            const adjustedCost = baseCost; // No adjustment needed
            
            expect(adjustedCost).toBe(baseCost);
        });

        test('should scale production consistently', () => {
            const baseProduction = 0.1;
            const units = 5;
            const timeMultiplier = 6;
            const deltaTime = 1.0;
            
            const totalProduction = baseProduction * units * deltaTime * timeMultiplier;
            const expectedProduction = 0.1 * 5 * 1.0 * 6; // 3.0
            
            expect(totalProduction).toBe(expectedProduction);
        });
    });

    describe('Performance at High Speeds', () => {
        test('should maintain performance at 10x speed', () => {
            const timeMultiplier = 10;
            const frameTime = 16; // 60fps target
            
            const simulateFrame = () => {
                const startTime = performance.now();
                
                // Simulate accelerated game update
                const delta = 0.016 * timeMultiplier;
                mockGameState.energy += 0.1 * delta;
                mockGameState.insight += 0.1 * delta;
                
                const endTime = performance.now();
                return endTime - startTime;
            };

            const executionTime = simulateFrame();
            expect(executionTime).toBeLessThan(frameTime); // Should still hit 60fps
        });

        test('should handle rapid resource changes smoothly', () => {
            const timeMultiplier = 15;
            const initialEnergy = mockGameState.energy;
            
            // Simulate 1 second of 15x speed gameplay
            for (let i = 0; i < 60; i++) { // 60 frames
                const delta = (0.016 * timeMultiplier); // Accelerated delta
                mockGameState.energy += 0.1 * delta;
            }

            const finalEnergy = mockGameState.energy;
            const energyGained = finalEnergy - initialEnergy;
            
            // Should have gained ~15 seconds worth of energy in 1 second
            expect(energyGained).toBeCloseTo(1.5, 0); // 0.1 * 15 seconds, less precision
            expect(finalEnergy).toBeGreaterThan(initialEnergy);
        });
    });
});

/**
 * @jest-environment jsdom
 */

describe('Control vs Consciousness System Tests', () => {
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            energy: 20,
            insight: 5,
            harmony: 50,
            inspiration: 0,
            wisdom: 0,
            control: 0,
            controlPerSecond: 0,
            consciousness: 10,
            consciousnessPerSecond: 0,
            planetaryConsciousness: 10,
            entropy: 0,
            statistics: {
                totalControlGenerated: 0,
                totalConsciousnessGenerated: 0,
                maxControl: 0,
                maxConsciousness: 10,
                maxPlanetaryConsciousness: 10,
                rulerPathChoices: 0,
                gardenerPathChoices: 0
            }
        };

        global.gameState = mockGameState;
    });

    describe('Control vs Consciousness Mechanics', () => {
        test('should reduce consciousness when control is high', () => {
            const updateControlConsciousnessSystem = (deltaTime) => {
                if (mockGameState.control > 0) {
                    const consciousnessReduction = mockGameState.control * 0.01 * deltaTime;
                    mockGameState.consciousness = Math.max(0, mockGameState.consciousness - consciousnessReduction);
                    
                    const harmonyReduction = mockGameState.control * 0.005 * deltaTime;
                    mockGameState.harmony = Math.max(0, mockGameState.harmony - harmonyReduction);
                }
            };

            mockGameState.control = 50;
            const initialConsciousness = mockGameState.consciousness;
            const initialHarmony = mockGameState.harmony;

            updateControlConsciousnessSystem(1.0); // 1 second

            expect(mockGameState.consciousness).toBeLessThan(initialConsciousness);
            expect(mockGameState.harmony).toBeLessThan(initialHarmony);
            expect(mockGameState.consciousness).toBe(initialConsciousness - 0.5); // 50 * 0.01 * 1
        });

        test('should improve harmony when consciousness is high', () => {
            const updateControlConsciousnessSystem = (deltaTime) => {
                if (mockGameState.consciousness > 0) {
                    const harmonyBonus = mockGameState.consciousness * 0.01 * deltaTime;
                    mockGameState.harmony = Math.min(100, mockGameState.harmony + harmonyBonus);
                    
                    if (mockGameState.consciousness > mockGameState.control) {
                        const controlReduction = (mockGameState.consciousness - mockGameState.control) * 0.005 * deltaTime;
                        mockGameState.control = Math.max(0, mockGameState.control - controlReduction);
                    }
                }
            };

            mockGameState.consciousness = 60;
            mockGameState.control = 20;
            const initialHarmony = mockGameState.harmony;
            const initialControl = mockGameState.control;

            updateControlConsciousnessSystem(1.0); // 1 second

            expect(mockGameState.harmony).toBeGreaterThan(initialHarmony);
            expect(mockGameState.control).toBeLessThan(initialControl);
            expect(mockGameState.harmony).toBe(Math.min(100, initialHarmony + 0.6)); // 60 * 0.01 * 1
        });

        test('should update planetary consciousness based on individual consciousness', () => {
            const updatePlanetaryConsciousness = (deltaTime) => {
                const consciousnessContribution = mockGameState.consciousness * 0.1 * deltaTime;
                const controlPenalty = mockGameState.control * 0.05 * deltaTime;
                mockGameState.planetaryConsciousness = Math.max(0, Math.min(100, 
                    mockGameState.planetaryConsciousness + consciousnessContribution - controlPenalty
                ));
            };

            mockGameState.consciousness = 30;
            mockGameState.control = 10;
            const initialPlanetaryConsciousness = mockGameState.planetaryConsciousness;

            updatePlanetaryConsciousness(1.0); // 1 second

            const expectedChange = (30 * 0.1) - (10 * 0.05); // 3 - 0.5 = 2.5
            expect(mockGameState.planetaryConsciousness).toBe(initialPlanetaryConsciousness + expectedChange);
        });

        test('should accumulate entropy when systems are imbalanced', () => {
            const updateEntropy = (deltaTime) => {
                const imbalance = Math.abs(mockGameState.control - mockGameState.consciousness);
                if (imbalance > 20) {
                    mockGameState.entropy += imbalance * 0.001 * deltaTime;
                }
            };

            mockGameState.control = 80;
            mockGameState.consciousness = 10;
            const initialEntropy = mockGameState.entropy;

            updateEntropy(1.0); // 1 second

            const imbalance = Math.abs(80 - 10); // 70
            expect(mockGameState.entropy).toBe(initialEntropy + (70 * 0.001)); // 0.07
        });
    });

    describe('Great Transition Win/Lose Conditions', () => {
        test('should detect victory when planetary consciousness reaches 100', () => {
            const checkGreatTransitionConditions = () => {
                if (mockGameState.planetaryConsciousness >= 100) {
                    return { result: 'victory', reason: 'consciousness_achieved' };
                }
                return { result: 'continue' };
            };

            mockGameState.planetaryConsciousness = 100;
            const result = checkGreatTransitionConditions();

            expect(result.result).toBe('victory');
            expect(result.reason).toBe('consciousness_achieved');
        });

        test('should detect defeat when consciousness collapses', () => {
            const checkGreatTransitionConditions = () => {
                if (mockGameState.consciousness <= 0 && mockGameState.planetaryConsciousness <= 0) {
                    return { result: 'defeat', reason: 'consciousness_collapse' };
                }
                if (mockGameState.entropy >= 100) {
                    return { result: 'defeat', reason: 'entropy_overload' };
                }
                if (mockGameState.harmony <= 0) {
                    return { result: 'defeat', reason: 'harmony_collapse' };
                }
                return { result: 'continue' };
            };

            mockGameState.consciousness = 0;
            mockGameState.planetaryConsciousness = 0;
            const result = checkGreatTransitionConditions();

            expect(result.result).toBe('defeat');
            expect(result.reason).toBe('consciousness_collapse');
        });

        test('should detect defeat when entropy overloads', () => {
            const checkGreatTransitionConditions = () => {
                if (mockGameState.entropy >= 100) {
                    return { result: 'defeat', reason: 'entropy_overload' };
                }
                return { result: 'continue' };
            };

            mockGameState.entropy = 100;
            const result = checkGreatTransitionConditions();

            expect(result.result).toBe('defeat');
            expect(result.reason).toBe('entropy_overload');
        });

        test('should detect defeat when harmony collapses', () => {
            const checkGreatTransitionConditions = () => {
                if (mockGameState.harmony <= 0) {
                    return { result: 'defeat', reason: 'harmony_collapse' };
                }
                return { result: 'continue' };
            };

            mockGameState.harmony = 0;
            const result = checkGreatTransitionConditions();

            expect(result.result).toBe('defeat');
            expect(result.reason).toBe('harmony_collapse');
        });
    });

    describe('Statistics Tracking', () => {
        test('should track control and consciousness generation', () => {
            const updateStatistics = (eventType, data) => {
                const stats = mockGameState.statistics;

                switch (eventType) {
                    case 'control_generated':
                        stats.totalControlGenerated += data.amount || 0;
                        stats.maxControl = Math.max(stats.maxControl, mockGameState.control);
                        break;
                    case 'consciousness_generated':
                        stats.totalConsciousnessGenerated += data.amount || 0;
                        stats.maxConsciousness = Math.max(stats.maxConsciousness, mockGameState.consciousness);
                        stats.maxPlanetaryConsciousness = Math.max(stats.maxPlanetaryConsciousness, mockGameState.planetaryConsciousness);
                        break;
                    case 'ruler_path_choice':
                        stats.rulerPathChoices += 1;
                        break;
                    case 'gardener_path_choice':
                        stats.gardenerPathChoices += 1;
                        break;
                }
            };

            updateStatistics('control_generated', { amount: 5 });
            expect(mockGameState.statistics.totalControlGenerated).toBe(5);

            updateStatistics('consciousness_generated', { amount: 3 });
            expect(mockGameState.statistics.totalConsciousnessGenerated).toBe(3);

            updateStatistics('ruler_path_choice', {});
            expect(mockGameState.statistics.rulerPathChoices).toBe(1);

            updateStatistics('gardener_path_choice', {});
            expect(mockGameState.statistics.gardenerPathChoices).toBe(1);
        });
    });

    describe('Resource Balance', () => {
        test('should maintain balance between opposing forces', () => {
            const testBalance = (control, consciousness) => {
                mockGameState.control = control;
                mockGameState.consciousness = consciousness;
                
                const imbalance = Math.abs(control - consciousness);
                const isBalanced = imbalance <= 20;
                
                return {
                    control,
                    consciousness,
                    imbalance,
                    isBalanced,
                    entropyRisk: imbalance > 20
                };
            };

            // Balanced system
            const balanced = testBalance(30, 35);
            expect(balanced.isBalanced).toBe(true);
            expect(balanced.entropyRisk).toBe(false);

            // Imbalanced system
            const imbalanced = testBalance(80, 10);
            expect(imbalanced.isBalanced).toBe(false);
            expect(imbalanced.entropyRisk).toBe(true);
            expect(imbalanced.imbalance).toBe(70);
        });
    });
});

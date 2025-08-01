/**
 * @jest-environment jsdom
 */

describe('The Great Transition Objectives Tests', () => {
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

    describe('Game Objective Framework', () => {
        test('should have clear win condition at 100 Planetary Consciousness', () => {
            const checkVictoryCondition = () => {
                return mockGameState.planetaryConsciousness >= 100;
            };

            mockGameState.planetaryConsciousness = 99;
            expect(checkVictoryCondition()).toBe(false);

            mockGameState.planetaryConsciousness = 100;
            expect(checkVictoryCondition()).toBe(true);

            mockGameState.planetaryConsciousness = 101;
            expect(checkVictoryCondition()).toBe(true);
        });

        test('should have multiple defeat conditions', () => {
            const checkDefeatConditions = () => {
                const conditions = [];

                if (mockGameState.consciousness <= 0 && mockGameState.planetaryConsciousness <= 0) {
                    conditions.push('consciousness_collapse');
                }
                if (mockGameState.entropy >= 100) {
                    conditions.push('entropy_overload');
                }
                if (mockGameState.harmony <= 0) {
                    conditions.push('harmony_collapse');
                }

                return conditions;
            };

            // Test consciousness collapse
            mockGameState.consciousness = 0;
            mockGameState.planetaryConsciousness = 0;
            expect(checkDefeatConditions()).toContain('consciousness_collapse');

            // Reset and test entropy overload
            mockGameState.consciousness = 10;
            mockGameState.planetaryConsciousness = 10;
            mockGameState.entropy = 100;
            expect(checkDefeatConditions()).toContain('entropy_overload');

            // Reset and test harmony collapse
            mockGameState.entropy = 0;
            mockGameState.harmony = 0;
            expect(checkDefeatConditions()).toContain('harmony_collapse');
        });

        test('should track progress toward The Great Transition', () => {
            const calculateTransitionProgress = () => {
                const progressMetrics = {
                    planetaryConsciousness: mockGameState.planetaryConsciousness,
                    individualConsciousness: mockGameState.consciousness,
                    controlLevel: mockGameState.control,
                    harmonyLevel: mockGameState.harmony,
                    entropyLevel: mockGameState.entropy,
                    progressPercentage: (mockGameState.planetaryConsciousness / 100) * 100,
                    isBalanced: Math.abs(mockGameState.control - mockGameState.consciousness) <= 20,
                    riskLevel: mockGameState.entropy > 50 ? 'high' : mockGameState.entropy > 25 ? 'medium' : 'low'
                };

                return progressMetrics;
            };

            mockGameState.planetaryConsciousness = 45;
            mockGameState.consciousness = 30;
            mockGameState.control = 25;
            mockGameState.entropy = 15;

            const progress = calculateTransitionProgress();

            expect(progress.progressPercentage).toBe(45);
            expect(progress.isBalanced).toBe(true); // 30 - 25 = 5, which is <= 20
            expect(progress.riskLevel).toBe('low');
        });
    });

    describe('Planetary Consciousness Mechanics', () => {
        test('should increase planetary consciousness based on individual consciousness', () => {
            const updatePlanetaryConsciousness = (deltaTime) => {
                const consciousnessContribution = mockGameState.consciousness * 0.1 * deltaTime;
                const controlPenalty = mockGameState.control * 0.05 * deltaTime;
                
                const change = consciousnessContribution - controlPenalty;
                mockGameState.planetaryConsciousness = Math.max(0, Math.min(100, 
                    mockGameState.planetaryConsciousness + change
                ));

                return change;
            };

            mockGameState.consciousness = 50;
            mockGameState.control = 20;
            const initialPlanetary = mockGameState.planetaryConsciousness;

            const change = updatePlanetaryConsciousness(1.0); // 1 second

            expect(change).toBe(4); // (50 * 0.1) - (20 * 0.05) = 5 - 1 = 4
            expect(mockGameState.planetaryConsciousness).toBe(initialPlanetary + 4);
        });

        test('should cap planetary consciousness at 100', () => {
            const updatePlanetaryConsciousness = (deltaTime) => {
                const consciousnessContribution = mockGameState.consciousness * 0.1 * deltaTime;
                mockGameState.planetaryConsciousness = Math.max(0, Math.min(100, 
                    mockGameState.planetaryConsciousness + consciousnessContribution
                ));
            };

            mockGameState.planetaryConsciousness = 95;
            mockGameState.consciousness = 100;

            updatePlanetaryConsciousness(1.0); // Would add 10, but should cap at 100

            expect(mockGameState.planetaryConsciousness).toBe(100);
        });

        test('should prevent planetary consciousness from going below 0', () => {
            const updatePlanetaryConsciousness = (deltaTime) => {
                const controlPenalty = mockGameState.control * 0.05 * deltaTime;
                mockGameState.planetaryConsciousness = Math.max(0, 
                    mockGameState.planetaryConsciousness - controlPenalty
                );
            };

            mockGameState.planetaryConsciousness = 2;
            mockGameState.control = 100;

            updatePlanetaryConsciousness(1.0); // Would subtract 5, but should floor at 0

            expect(mockGameState.planetaryConsciousness).toBe(0);
        });
    });

    describe('Game Balance and Progression', () => {
        test('should provide meaningful choices between Control and Consciousness', () => {
            const evaluateChoice = (choiceType, amount) => {
                const beforeState = { ...mockGameState };
                
                if (choiceType === 'control') {
                    mockGameState.control += amount;
                    // Control reduces consciousness over time
                    mockGameState.consciousness = Math.max(0, mockGameState.consciousness - amount * 0.5);
                } else if (choiceType === 'consciousness') {
                    mockGameState.consciousness += amount;
                    // Consciousness can reduce control effectiveness
                    if (mockGameState.consciousness > mockGameState.control) {
                        mockGameState.control = Math.max(0, mockGameState.control - amount * 0.2);
                    }
                }

                return {
                    before: beforeState,
                    after: { ...mockGameState },
                    tradeoff: choiceType === 'control' ? 'consciousness_reduced' : 'control_reduced'
                };
            };

            // Test control choice
            mockGameState.consciousness = 30;
            mockGameState.control = 10;
            
            const controlChoice = evaluateChoice('control', 20);
            expect(controlChoice.after.control).toBe(30); // 10 + 20
            expect(controlChoice.after.consciousness).toBe(20); // 30 - (20 * 0.5)
            expect(controlChoice.tradeoff).toBe('consciousness_reduced');

            // Reset and test consciousness choice
            mockGameState.consciousness = 30;
            mockGameState.control = 40;
            
            const consciousnessChoice = evaluateChoice('consciousness', 20);
            expect(consciousnessChoice.after.consciousness).toBe(50); // 30 + 20
            expect(consciousnessChoice.after.control).toBe(36); // 40 - (20 * 0.2)
        });

        test('should create entropy when systems are severely imbalanced', () => {
            const calculateEntropy = (deltaTime) => {
                const imbalance = Math.abs(mockGameState.control - mockGameState.consciousness);
                if (imbalance > 20) {
                    mockGameState.entropy += imbalance * 0.001 * deltaTime;
                }
                return mockGameState.entropy;
            };

            // Balanced system - no entropy
            mockGameState.control = 30;
            mockGameState.consciousness = 35;
            mockGameState.entropy = 0;
            
            calculateEntropy(1.0);
            expect(mockGameState.entropy).toBe(0); // Imbalance is 5, which is <= 20

            // Severely imbalanced system - generates entropy
            mockGameState.control = 80;
            mockGameState.consciousness = 10;
            mockGameState.entropy = 0;
            
            const entropy = calculateEntropy(1.0);
            expect(entropy).toBe(0.07); // |80-10| * 0.001 * 1 = 70 * 0.001 = 0.07
        });
    });

    describe('Victory and Defeat Messages', () => {
        test('should provide thematic victory message', () => {
            const getVictoryMessage = () => {
                return {
                    title: 'THE GREAT TRANSITION ACHIEVED!',
                    description: 'Planetary Consciousness has reached 100. Humanity has awakened from its slumber!',
                    theme: 'consciousness_victory'
                };
            };

            const victory = getVictoryMessage();
            expect(victory.title).toContain('GREAT TRANSITION');
            expect(victory.description).toContain('awakened');
            expect(victory.theme).toBe('consciousness_victory');
        });

        test('should provide thematic defeat messages for different failure modes', () => {
            const getDefeatMessage = (reason) => {
                const messages = {
                    consciousness_collapse: {
                        title: 'CONSCIOUSNESS COLLAPSE',
                        theme: 'ruler_victory'
                    },
                    entropy_overload: {
                        title: 'ENTROPY OVERLOAD',
                        theme: 'chaos_victory'
                    },
                    harmony_collapse: {
                        title: 'HARMONY COLLAPSE',
                        theme: 'system_failure'
                    }
                };
                return messages[reason];
            };

            expect(getDefeatMessage('consciousness_collapse').theme).toBe('ruler_victory');
            expect(getDefeatMessage('entropy_overload').theme).toBe('chaos_victory');
            expect(getDefeatMessage('harmony_collapse').theme).toBe('system_failure');
        });
    });
});

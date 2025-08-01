/**
 * @jest-environment jsdom
 */

describe('Story-Driven Victory System Tests', () => {
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            energy: 200,
            insight: 100,
            wisdom: 100,
            consciousness: 50,
            control: 30,
            planetaryConsciousness: 40,
            entropy: 10,
            harmony: 60,
            
            // Story state
            storyPhase: 'early',
            anomalyDiscovered: false,
            trueLoreRevealed: false,
            rulerPathProgress: 0,
            gardenerPathProgress: 0,
            dominantPath: 'none',
            gameEnded: false,
            
            // Buildings
            rulerBuildings: {
                industrialMine: 0,
                centralizedGrid: 0,
                automatedAgriculture: 0,
                hierarchicalCity: 0,
                propagandaTower: 0,
                surveillanceNetwork: 0,
                thoughtPolice: 0,
                corporateState: 0,
                memoryWipe: 0,
                totalitarianCore: 0,
                exodusArk: 0
            },
            gardenerBuildings: {
                stoneCircle: 0,
                healingGrove: 0,
                wisdomSanctuary: 0,
                permacultureGarden: 0,
                mycelialNetwork: 0,
                planetaryAwakening: 0,
                theAscension: 0
            },
            
            statistics: {
                rulerPathChoices: 0,
                gardenerPathChoices: 0
            }
        };

        global.gameState = mockGameState;
    });

    describe('Story Progression System', () => {
        test('should trigger anomaly discovery when conditions are met', () => {
            const triggerAnomalyDiscovery = () => {
                mockGameState.anomalyDiscovered = true;
                mockGameState.storyPhase = 'midgame_reveal';
                return true;
            };

            const checkStoryProgression = () => {
                if (!mockGameState.anomalyDiscovered && mockGameState.storyPhase === 'early') {
                    const totalBuildings = Object.values(mockGameState.rulerBuildings).reduce((sum, count) => sum + count, 0) +
                                         Object.values(mockGameState.gardenerBuildings).reduce((sum, count) => sum + count, 0);
                    
                    if (totalBuildings >= 5 || mockGameState.consciousness + mockGameState.control >= 50) {
                        return triggerAnomalyDiscovery();
                    }
                }
                return false;
            };

            // Test building threshold
            mockGameState.rulerBuildings.industrialMine = 3;
            mockGameState.gardenerBuildings.stoneCircle = 2;
            
            const result = checkStoryProgression();
            expect(result).toBe(true);
            expect(mockGameState.anomalyDiscovered).toBe(true);
            expect(mockGameState.storyPhase).toBe('midgame_reveal');
        });

        test('should reveal true lore when investigation is complete', () => {
            const revealTrueLore = () => {
                mockGameState.trueLoreRevealed = true;
                mockGameState.storyPhase = 'endgame';
                return true;
            };

            const checkLoreReveal = () => {
                if (mockGameState.anomalyDiscovered && !mockGameState.trueLoreRevealed && mockGameState.storyPhase === 'midgame_reveal') {
                    const investigationProgress = mockGameState.wisdom + mockGameState.insight;
                    if (investigationProgress >= 100) {
                        return revealTrueLore();
                    }
                }
                return false;
            };

            mockGameState.anomalyDiscovered = true;
            mockGameState.storyPhase = 'midgame_reveal';
            mockGameState.wisdom = 60;
            mockGameState.insight = 50;

            const result = checkLoreReveal();
            expect(result).toBe(true);
            expect(mockGameState.trueLoreRevealed).toBe(true);
            expect(mockGameState.storyPhase).toBe('endgame');
        });

        test('should track dominant path based on player choices', () => {
            const updateDominantPath = () => {
                const rulerChoices = mockGameState.statistics.rulerPathChoices || 0;
                const gardenerChoices = mockGameState.statistics.gardenerPathChoices || 0;
                const totalChoices = rulerChoices + gardenerChoices;
                
                if (totalChoices === 0) {
                    mockGameState.dominantPath = 'none';
                } else {
                    const rulerRatio = rulerChoices / totalChoices;
                    if (rulerRatio > 0.6) {
                        mockGameState.dominantPath = 'ruler';
                    } else if (rulerRatio < 0.4) {
                        mockGameState.dominantPath = 'gardener';
                    } else {
                        mockGameState.dominantPath = 'balanced';
                    }
                }
            };

            // Test ruler dominance
            mockGameState.statistics.rulerPathChoices = 8;
            mockGameState.statistics.gardenerPathChoices = 2;
            updateDominantPath();
            expect(mockGameState.dominantPath).toBe('ruler');

            // Test gardener dominance
            mockGameState.statistics.rulerPathChoices = 2;
            mockGameState.statistics.gardenerPathChoices = 8;
            updateDominantPath();
            expect(mockGameState.dominantPath).toBe('gardener');

            // Test balanced
            mockGameState.statistics.rulerPathChoices = 5;
            mockGameState.statistics.gardenerPathChoices = 5;
            updateDominantPath();
            expect(mockGameState.dominantPath).toBe('balanced');
        });
    });

    describe('Victory Conditions', () => {
        test('should trigger Ruler victory when Exodus Ark is built', () => {
            const checkRulerVictory = () => {
                if (mockGameState.rulerPathProgress >= 100) {
                    return 'ruler_victory';
                }
                return null;
            };

            // Simulate building Exodus Ark
            mockGameState.rulerPathProgress = 100;

            const result = checkRulerVictory();
            expect(result).toBe('ruler_victory');
        });

        test('should trigger Gardener victory when Great Ascension is achieved', () => {
            const checkGardenerVictory = () => {
                if (mockGameState.gardenerPathProgress >= 100) {
                    return 'gardener_victory';
                }
                return null;
            };

            // Simulate achieving Great Ascension
            mockGameState.gardenerPathProgress = 100;

            const result = checkGardenerVictory();
            expect(result).toBe('gardener_victory');
        });

        test('should have different victory conditions based on story progression', () => {
            const checkGreatTransitionConditions = () => {
                if (mockGameState.gameEnded) {
                    return { result: 'already_ended' };
                }

                // Check for story-driven victory conditions
                if (mockGameState.rulerPathProgress >= 100) {
                    return { result: 'ruler_victory' };
                }

                if (mockGameState.gardenerPathProgress >= 100) {
                    return { result: 'gardener_victory' };
                }

                // Legacy win condition: Planetary Consciousness reaches 100 (if no story path chosen)
                if (mockGameState.planetaryConsciousness >= 100 && mockGameState.dominantPath === 'none') {
                    return { result: 'generic_victory' };
                }

                return { result: 'continue' };
            };

            // Test Ruler victory
            mockGameState.rulerPathProgress = 100;
            expect(checkGreatTransitionConditions().result).toBe('ruler_victory');

            // Reset and test Gardener victory
            mockGameState.rulerPathProgress = 0;
            mockGameState.gardenerPathProgress = 100;
            expect(checkGreatTransitionConditions().result).toBe('gardener_victory');

            // Reset and test generic victory
            mockGameState.gardenerPathProgress = 0;
            mockGameState.planetaryConsciousness = 100;
            mockGameState.dominantPath = 'none';
            expect(checkGreatTransitionConditions().result).toBe('generic_victory');
        });
    });

    describe('Building Unlock Conditions', () => {
        test('should unlock victory buildings only after true lore is revealed', () => {
            const checkExodusArkUnlock = () => {
                return mockGameState.rulerBuildings.totalitarianCore > 0 && 
                       mockGameState.control > 80 && 
                       mockGameState.trueLoreRevealed;
            };

            const checkAscensionUnlock = () => {
                return mockGameState.gardenerBuildings.planetaryAwakening > 0 && 
                       mockGameState.consciousness > 80 && 
                       mockGameState.trueLoreRevealed;
            };

            // Before lore reveal
            mockGameState.rulerBuildings.totalitarianCore = 1;
            mockGameState.control = 90;
            mockGameState.trueLoreRevealed = false;
            expect(checkExodusArkUnlock()).toBe(false);

            mockGameState.gardenerBuildings.planetaryAwakening = 1;
            mockGameState.consciousness = 90;
            expect(checkAscensionUnlock()).toBe(false);

            // After lore reveal
            mockGameState.trueLoreRevealed = true;
            expect(checkExodusArkUnlock()).toBe(true);
            expect(checkAscensionUnlock()).toBe(true);
        });
    });

    describe('Victory Building Effects', () => {
        test('should apply victory progress when building victory structures', () => {
            const applyBuildingEffects = (effects) => {
                for (const [resource, amount] of Object.entries(effects)) {
                    if (resource === 'rulerPathProgress' || resource === 'gardenerPathProgress') {
                        mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                    } else if (mockGameState[resource] !== undefined) {
                        mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                    }
                }
            };

            // Test Exodus Ark effects
            const exodusArkEffects = { rulerPathProgress: 100 };
            applyBuildingEffects(exodusArkEffects);
            expect(mockGameState.rulerPathProgress).toBe(100);

            // Test Great Ascension effects
            mockGameState.gardenerPathProgress = 0;
            const ascensionEffects = { gardenerPathProgress: 100 };
            applyBuildingEffects(ascensionEffects);
            expect(mockGameState.gardenerPathProgress).toBe(100);
        });
    });

    describe('Save System Integration', () => {
        test('should save and load story progression state', () => {
            const saveStoryState = () => {
                return {
                    storyPhase: mockGameState.storyPhase,
                    anomalyDiscovered: mockGameState.anomalyDiscovered,
                    trueLoreRevealed: mockGameState.trueLoreRevealed,
                    rulerPathProgress: mockGameState.rulerPathProgress,
                    gardenerPathProgress: mockGameState.gardenerPathProgress,
                    dominantPath: mockGameState.dominantPath
                };
            };

            const loadStoryState = (savedState) => {
                mockGameState.storyPhase = savedState.storyPhase || 'early';
                mockGameState.anomalyDiscovered = savedState.anomalyDiscovered || false;
                mockGameState.trueLoreRevealed = savedState.trueLoreRevealed || false;
                mockGameState.rulerPathProgress = savedState.rulerPathProgress || 0;
                mockGameState.gardenerPathProgress = savedState.gardenerPathProgress || 0;
                mockGameState.dominantPath = savedState.dominantPath || 'none';
            };

            // Set up story state
            mockGameState.storyPhase = 'endgame';
            mockGameState.anomalyDiscovered = true;
            mockGameState.trueLoreRevealed = true;
            mockGameState.rulerPathProgress = 50;
            mockGameState.dominantPath = 'ruler';

            // Save and reset
            const saved = saveStoryState();
            mockGameState.storyPhase = 'early';
            mockGameState.anomalyDiscovered = false;
            mockGameState.trueLoreRevealed = false;
            mockGameState.rulerPathProgress = 0;
            mockGameState.dominantPath = 'none';

            // Load and verify
            loadStoryState(saved);
            expect(mockGameState.storyPhase).toBe('endgame');
            expect(mockGameState.anomalyDiscovered).toBe(true);
            expect(mockGameState.trueLoreRevealed).toBe(true);
            expect(mockGameState.rulerPathProgress).toBe(50);
            expect(mockGameState.dominantPath).toBe('ruler');
        });
    });
});

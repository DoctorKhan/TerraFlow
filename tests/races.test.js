/**
 * @jest-environment jsdom
 */

describe('Cosmic Races and Alien Species Tests', () => {
    let mockGameState;
    let racesConfig;

    beforeEach(() => {
        mockGameState = {
            energy: 100,
            insight: 50,
            harmony: 60,
            cosmicEssence: 0,
            voidEnergy: 0,
            units: {
                dreamers: 2,
                weavers: 2,
                stellarNomads: 0,
                voidWhisperers: 0,
                crystalBeings: 0,
                plasmaDancers: 0,
                quantumSages: 0,
                nebulaShepherds: 0
            },
            unitCosts: {
                dreamers: 15,
                weavers: 15,
                stellarNomads: 25,
                voidWhisperers: 40,
                crystalBeings: 60,
                plasmaDancers: 80,
                quantumSages: 120,
                nebulaShepherds: 200
            },
            unlockedRaces: ['human', 'stellar']
        };

        racesConfig = {
            human: {
                name: "Human",
                description: "The original inhabitants of the sanctuary",
                units: ['dreamers', 'weavers'],
                unlocked: true,
                color: '#8B5CF6'
            },
            stellar: {
                name: "Stellar Nomads",
                description: "Wandering beings from distant stars",
                units: ['stellarNomads'],
                unlockCondition: { energy: 50, insight: 25 },
                unlocked: false,
                color: '#F59E0B'
            },
            void: {
                name: "Void Whisperers",
                description: "Mysterious entities from the space between spaces",
                units: ['voidWhisperers'],
                unlockCondition: { harmony: 70, cosmicEssence: 10 },
                unlocked: false,
                color: '#1F2937'
            },
            crystal: {
                name: "Crystal Beings",
                description: "Living crystalline entities that resonate with cosmic energy",
                units: ['crystalBeings'],
                unlockCondition: { energy: 200, insight: 100 },
                unlocked: false,
                color: '#10B981'
            },
            plasma: {
                name: "Plasma Dancers",
                description: "Energy beings that exist in pure plasma form",
                units: ['plasmaDancers'],
                unlockCondition: { voidEnergy: 50, harmony: 80 },
                unlocked: false,
                color: '#EF4444'
            },
            quantum: {
                name: "Quantum Sages",
                description: "Beings that exist in multiple dimensions simultaneously",
                units: ['quantumSages'],
                unlockCondition: { cosmicEssence: 100, insight: 500 },
                unlocked: false,
                color: '#8B5CF6'
            },
            nebula: {
                name: "Nebula Shepherds",
                description: "Ancient beings that guide the formation of stars",
                units: ['nebulaShepherds'],
                unlockCondition: { energy: 1000, harmony: 95 },
                unlocked: false,
                color: '#A78BFA'
            }
        };
    });

    describe('Race Unlock System', () => {
        test('should check unlock conditions correctly', () => {
            const checkRaceUnlock = (raceKey, gameState, racesConfig) => {
                const race = racesConfig[raceKey];
                if (!race.unlockCondition) return true;
                
                return Object.entries(race.unlockCondition).every(([resource, required]) => {
                    return gameState[resource] >= required;
                });
            };

            // Human should always be unlocked
            expect(checkRaceUnlock('human', mockGameState, racesConfig)).toBe(true);

            // Stellar should be unlocked (energy: 100 >= 50, insight: 50 >= 25)
            expect(checkRaceUnlock('stellar', mockGameState, racesConfig)).toBe(true);

            // Void should not be unlocked (harmony: 60 < 70, no cosmicEssence)
            expect(checkRaceUnlock('void', mockGameState, racesConfig)).toBe(false);

            // Crystal should not be unlocked (energy: 100 < 200)
            expect(checkRaceUnlock('crystal', mockGameState, racesConfig)).toBe(false);
        });

        test('should unlock races when conditions are met', () => {
            const unlockRaces = (gameState, racesConfig) => {
                const newlyUnlocked = [];
                
                Object.entries(racesConfig).forEach(([raceKey, race]) => {
                    if (!gameState.unlockedRaces.includes(raceKey) && !race.unlocked) {
                        if (!race.unlockCondition) {
                            gameState.unlockedRaces.push(raceKey);
                            race.unlocked = true;
                            newlyUnlocked.push(raceKey);
                        } else {
                            const canUnlock = Object.entries(race.unlockCondition).every(([resource, required]) => {
                                return gameState[resource] >= required;
                            });
                            
                            if (canUnlock) {
                                gameState.unlockedRaces.push(raceKey);
                                race.unlocked = true;
                                newlyUnlocked.push(raceKey);
                            }
                        }
                    }
                });
                
                return newlyUnlocked;
            };

            const initialUnlocked = mockGameState.unlockedRaces.length;
            const newlyUnlocked = unlockRaces(mockGameState, racesConfig);

            expect(newlyUnlocked).toContain('stellar');
            expect(mockGameState.unlockedRaces.length).toBeGreaterThan(initialUnlocked);
            expect(racesConfig.stellar.unlocked).toBe(true);
        });
    });

    describe('Unit Racial Abilities', () => {
        test('should define unique abilities for each race', () => {
            const unitAbilities = {
                dreamers: { 
                    baseInsight: 0.1, 
                    special: 'dreamVision',
                    race: 'human'
                },
                weavers: { 
                    baseEnergy: 0.1, 
                    special: 'energyWeaving',
                    race: 'human'
                },
                stellarNomads: { 
                    baseEnergy: 0.15, 
                    baseInsight: 0.05,
                    special: 'stellarNavigation',
                    race: 'stellar'
                },
                voidWhisperers: { 
                    baseVoidEnergy: 0.1,
                    baseHarmony: 0.02,
                    special: 'voidCommunion',
                    race: 'void'
                },
                crystalBeings: { 
                    baseEnergy: 0.2,
                    special: 'crystalResonance',
                    race: 'crystal'
                },
                plasmaDancers: { 
                    baseEnergy: 0.3,
                    special: 'plasmaManipulation',
                    race: 'plasma'
                },
                quantumSages: { 
                    baseInsight: 0.5,
                    baseCosmic: 0.1,
                    special: 'quantumEntanglement',
                    race: 'quantum'
                },
                nebulaShepherds: { 
                    baseEnergy: 0.8,
                    baseHarmony: 0.1,
                    special: 'starBirth',
                    race: 'nebula'
                }
            };

            // Each unit should have a race
            Object.values(unitAbilities).forEach(unit => {
                expect(unit.race).toBeDefined();
                expect(typeof unit.race).toBe('string');
            });

            // Each unit should have a special ability
            Object.values(unitAbilities).forEach(unit => {
                expect(unit.special).toBeDefined();
                expect(typeof unit.special).toBe('string');
            });

            // Advanced races should have higher base production
            expect(unitAbilities.nebulaShepherds.baseEnergy).toBeGreaterThan(unitAbilities.dreamers.baseInsight);
            expect(unitAbilities.quantumSages.baseInsight).toBeGreaterThan(unitAbilities.dreamers.baseInsight);
        });

        test('should calculate racial bonuses correctly', () => {
            const calculateRacialBonus = (unitType, count, gameState) => {
                const racialBonuses = {
                    human: { harmonyBonus: 0.1 },
                    stellar: { energyBonus: 0.15 },
                    void: { voidEnergyBonus: 0.2 },
                    crystal: { resonanceBonus: 0.25 },
                    plasma: { energyEfficiency: 0.3 },
                    quantum: { insightMultiplier: 0.4 },
                    nebula: { cosmicHarmony: 0.5 }
                };

                const unitRaces = {
                    dreamers: 'human',
                    weavers: 'human',
                    stellarNomads: 'stellar',
                    voidWhisperers: 'void',
                    crystalBeings: 'crystal',
                    plasmaDancers: 'plasma',
                    quantumSages: 'quantum',
                    nebulaShepherds: 'nebula'
                };

                const race = unitRaces[unitType];
                const bonus = racialBonuses[race];
                
                return bonus ? Object.values(bonus)[0] * count : 0;
            };

            const stellarBonus = calculateRacialBonus('stellarNomads', 3, mockGameState);
            const quantumBonus = calculateRacialBonus('quantumSages', 2, mockGameState);

            expect(stellarBonus).toBe(0.45); // 0.15 * 3
            expect(quantumBonus).toBe(0.8);  // 0.4 * 2
        });
    });

    describe('Visual Representation', () => {
        test('should have unique visual properties for each race', () => {
            const raceVisuals = {
                human: { color: '#8B5CF6', symbol: '👤', size: 1.0 },
                stellar: { color: '#F59E0B', symbol: '⭐', size: 1.2 },
                void: { color: '#1F2937', symbol: '🌑', size: 0.8 },
                crystal: { color: '#10B981', symbol: '💎', size: 1.1 },
                plasma: { color: '#EF4444', symbol: '🔥', size: 1.3 },
                quantum: { color: '#8B5CF6', symbol: '🌀', size: 0.9 },
                nebula: { color: '#A78BFA', symbol: '🌌', size: 1.5 }
            };

            Object.entries(raceVisuals).forEach(([race, visual]) => {
                expect(visual.color).toMatch(/^#[0-9A-F]{6}$/i);
                expect(visual.symbol).toBeDefined();
                expect(visual.size).toBeGreaterThan(0);
                expect(visual.size).toBeLessThan(2);
            });
        });

        test('should generate appropriate sprite animations for each race', () => {
            const generateRaceAnimation = (race, animationTime) => {
                const animations = {
                    human: { 
                        pulse: 1 + Math.sin(animationTime * 2) * 0.1,
                        glow: 0.5
                    },
                    stellar: { 
                        pulse: 1 + Math.sin(animationTime * 3) * 0.2,
                        twinkle: Math.sin(animationTime * 5) * 0.3,
                        glow: 0.8
                    },
                    void: { 
                        pulse: 1 + Math.sin(animationTime * 1.5) * 0.05,
                        fade: 0.3 + Math.sin(animationTime * 2) * 0.2,
                        glow: 0.2
                    },
                    crystal: { 
                        pulse: 1 + Math.sin(animationTime * 4) * 0.15,
                        facets: Math.cos(animationTime * 6) * 0.1,
                        glow: 0.9
                    },
                    plasma: { 
                        pulse: 1 + Math.sin(animationTime * 8) * 0.3,
                        flicker: Math.random() * 0.2,
                        glow: 1.0
                    },
                    quantum: { 
                        pulse: 1 + Math.sin(animationTime * 2.5) * 0.1,
                        phase: Math.sin(animationTime * 4) * 0.5,
                        glow: 0.7
                    },
                    nebula: { 
                        pulse: 1 + Math.sin(animationTime * 1) * 0.25,
                        swirl: animationTime * 0.5,
                        glow: 1.2
                    }
                };

                return animations[race] || animations.human;
            };

            const stellarAnim = generateRaceAnimation('stellar', 1.0);
            const voidAnim = generateRaceAnimation('void', 1.0);

            expect(stellarAnim.twinkle).toBeDefined();
            expect(stellarAnim.glow).toBe(0.8);
            expect(voidAnim.fade).toBeDefined();
            expect(voidAnim.glow).toBe(0.2);
        });
    });

    describe('Race Progression and Balance', () => {
        test('should have balanced progression curve', () => {
            const raceTiers = {
                1: ['human'],
                2: ['stellar'],
                3: ['void', 'crystal'],
                4: ['plasma'],
                5: ['quantum', 'nebula']
            };

            // Each tier should have reasonable unlock requirements
            Object.entries(raceTiers).forEach(([tier, races]) => {
                races.forEach(race => {
                    const config = racesConfig[race];
                    if (config.unlockCondition) {
                        const totalRequirement = Object.values(config.unlockCondition).reduce((sum, val) => sum + val, 0);
                        expect(totalRequirement).toBeGreaterThan(parseInt(tier) * 10);
                    }
                });
            });
        });

        test('should provide meaningful gameplay differences', () => {
            const raceGameplay = {
                human: { focus: 'balanced', difficulty: 'easy' },
                stellar: { focus: 'exploration', difficulty: 'easy' },
                void: { focus: 'mystery', difficulty: 'medium' },
                crystal: { focus: 'energy', difficulty: 'medium' },
                plasma: { focus: 'power', difficulty: 'hard' },
                quantum: { focus: 'knowledge', difficulty: 'hard' },
                nebula: { focus: 'creation', difficulty: 'expert' }
            };

            Object.entries(raceGameplay).forEach(([race, gameplay]) => {
                expect(['balanced', 'exploration', 'mystery', 'energy', 'power', 'knowledge', 'creation']).toContain(gameplay.focus);
                expect(['easy', 'medium', 'hard', 'expert']).toContain(gameplay.difficulty);
            });
        });
    });
});

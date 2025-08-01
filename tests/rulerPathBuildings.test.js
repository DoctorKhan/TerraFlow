/**
 * @jest-environment jsdom
 */

describe('Ruler Path Buildings Tests', () => {
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            energy: 200,
            insight: 150,
            harmony: 50,
            inspiration: 50,
            wisdom: 100,
            control: 10,
            controlPerSecond: 0,
            consciousness: 20,
            consciousnessPerSecond: 0.1,
            planetaryConsciousness: 25,
            entropy: 0,
            energyPerSecond: 1.0,
            wisdomPerSecond: 0.2,
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
                totalitarianCore: 0
            },
            statistics: {
                rulerPathChoices: 0
            }
        };

        global.gameState = mockGameState;
    });

    describe('Building Tier System', () => {
        test('should have buildings organized in 4 tiers', () => {
            const rulerPathBuildings = {
                industrialMine: { tier: 1, unlockCondition: () => true },
                centralizedGrid: { tier: 1, unlockCondition: () => mockGameState.rulerBuildings.industrialMine > 0 },
                automatedAgriculture: { tier: 1, unlockCondition: () => true },
                hierarchicalCity: { tier: 2, unlockCondition: () => mockGameState.rulerBuildings.centralizedGrid > 0 },
                propagandaTower: { tier: 2, unlockCondition: () => mockGameState.rulerBuildings.industrialMine > 0 },
                surveillanceNetwork: { tier: 2, unlockCondition: () => mockGameState.rulerBuildings.propagandaTower > 0 },
                thoughtPolice: { tier: 3, unlockCondition: () => mockGameState.rulerBuildings.surveillanceNetwork > 0 },
                corporateState: { tier: 3, unlockCondition: () => mockGameState.rulerBuildings.hierarchicalCity > 0 },
                memoryWipe: { tier: 3, unlockCondition: () => mockGameState.rulerBuildings.thoughtPolice > 0 },
                totalitarianCore: { tier: 4, unlockCondition: () => mockGameState.rulerBuildings.memoryWipe > 0 && mockGameState.control > 50 }
            };

            const tierCounts = {};
            Object.values(rulerPathBuildings).forEach(building => {
                tierCounts[building.tier] = (tierCounts[building.tier] || 0) + 1;
            });

            expect(tierCounts[1]).toBe(3); // Foundation tier
            expect(tierCounts[2]).toBe(3); // Systems tier
            expect(tierCounts[3]).toBe(3); // Oppression tier
            expect(tierCounts[4]).toBe(1); // Ultimate tier
        });

        test('should enforce unlock conditions correctly', () => {
            const checkUnlockCondition = (buildingKey) => {
                const conditions = {
                    industrialMine: () => true,
                    centralizedGrid: () => mockGameState.rulerBuildings.industrialMine > 0,
                    automatedAgriculture: () => true,
                    hierarchicalCity: () => mockGameState.rulerBuildings.centralizedGrid > 0,
                    propagandaTower: () => mockGameState.rulerBuildings.industrialMine > 0,
                    surveillanceNetwork: () => mockGameState.rulerBuildings.propagandaTower > 0,
                    thoughtPolice: () => mockGameState.rulerBuildings.surveillanceNetwork > 0,
                    corporateState: () => mockGameState.rulerBuildings.hierarchicalCity > 0,
                    memoryWipe: () => mockGameState.rulerBuildings.thoughtPolice > 0,
                    totalitarianCore: () => mockGameState.rulerBuildings.memoryWipe > 0 && mockGameState.control > 50
                };
                return conditions[buildingKey] ? conditions[buildingKey]() : false;
            };

            // Initially, only tier 1 buildings should be unlocked
            expect(checkUnlockCondition('industrialMine')).toBe(true);
            expect(checkUnlockCondition('automatedAgriculture')).toBe(true);
            expect(checkUnlockCondition('centralizedGrid')).toBe(false);
            expect(checkUnlockCondition('hierarchicalCity')).toBe(false);

            // After building industrial mine, centralized grid should unlock
            mockGameState.rulerBuildings.industrialMine = 1;
            expect(checkUnlockCondition('centralizedGrid')).toBe(true);
            expect(checkUnlockCondition('propagandaTower')).toBe(true);

            // After building centralized grid, hierarchical city should unlock
            mockGameState.rulerBuildings.centralizedGrid = 1;
            expect(checkUnlockCondition('hierarchicalCity')).toBe(true);
        });
    });

    describe('Building Effects and Progression', () => {
        test('should apply increasingly severe effects at higher tiers', () => {
            const buildingEffects = {
                industrialMine: { control: 2, energy: 1.5, harmony: -0.5, entropy: 0.1 },
                surveillanceNetwork: { control: 6, consciousness: -2, entropy: 0.3, controlPerSecond: 0.15 },
                thoughtPolice: { control: 8, consciousness: -3, harmony: -1, entropy: 0.4, controlPerSecond: 0.2 },
                totalitarianCore: { control: 20, consciousness: -10, harmony: -5, entropy: 1.0, controlPerSecond: 0.5 }
            };

            const applyBuildingEffects = (effects) => {
                for (const [resource, amount] of Object.entries(effects)) {
                    if (resource.endsWith('PerSecond')) {
                        const baseResource = resource.replace('PerSecond', '');
                        if (mockGameState[resource] !== undefined) {
                            mockGameState[resource] += amount;
                        }
                    } else if (mockGameState[resource] !== undefined) {
                        mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                    }
                }
            };

            // Test tier 1 building (mild effects)
            const initialConsciousness = mockGameState.consciousness;
            applyBuildingEffects(buildingEffects.industrialMine);
            expect(mockGameState.control).toBe(12); // 10 + 2
            expect(mockGameState.consciousness).toBe(initialConsciousness); // No consciousness penalty

            // Test tier 4 building (severe effects)
            mockGameState.consciousness = 20; // Reset
            applyBuildingEffects(buildingEffects.totalitarianCore);
            expect(mockGameState.control).toBe(32); // 12 + 20
            expect(mockGameState.consciousness).toBe(10); // 20 - 10
            expect(mockGameState.controlPerSecond).toBe(0.5);
        });

        test('should track ruler path choices in statistics', () => {
            const buildRulerBuilding = (buildingKey, buildingConfig) => {
                if (mockGameState[buildingConfig.costResource] >= buildingConfig.cost) {
                    mockGameState[buildingConfig.costResource] -= buildingConfig.cost;
                    mockGameState.rulerBuildings[buildingKey] += 1;
                    mockGameState.statistics.rulerPathChoices += 1;
                    return true;
                }
                return false;
            };

            const industrialMine = { cost: 50, costResource: 'energy' };
            const propagandaTower = { cost: 100, costResource: 'insight' };

            buildRulerBuilding('industrialMine', industrialMine);
            buildRulerBuilding('propagandaTower', propagandaTower);

            expect(mockGameState.statistics.rulerPathChoices).toBe(2);
            expect(mockGameState.rulerBuildings.industrialMine).toBe(1);
            expect(mockGameState.rulerBuildings.propagandaTower).toBe(1);
        });
    });

    describe('Special Building Effects', () => {
        test('should apply surveillance network special effects', () => {
            const applySpecialRulerEffects = (buildingKey) => {
                switch (buildingKey) {
                    case 'surveillanceNetwork':
                        mockGameState.consciousnessPerSecond = Math.max(0, mockGameState.consciousnessPerSecond - 0.1);
                        break;
                    case 'thoughtPolice':
                        mockGameState.wisdomPerSecond = Math.max(0, mockGameState.wisdomPerSecond - 0.2);
                        break;
                    case 'memoryWipe':
                        mockGameState.consciousness = Math.max(0, mockGameState.consciousness - 5);
                        mockGameState.wisdom = Math.max(0, mockGameState.wisdom - 10);
                        break;
                    case 'totalitarianCore':
                        mockGameState.consciousness = Math.max(0, mockGameState.consciousness - 20);
                        mockGameState.planetaryConsciousness = Math.max(0, mockGameState.planetaryConsciousness - 15);
                        break;
                }
            };

            const initialConsciousnessPerSecond = mockGameState.consciousnessPerSecond;
            applySpecialRulerEffects('surveillanceNetwork');
            expect(mockGameState.consciousnessPerSecond).toBe(initialConsciousnessPerSecond - 0.1);

            const initialWisdomPerSecond = mockGameState.wisdomPerSecond;
            applySpecialRulerEffects('thoughtPolice');
            expect(mockGameState.wisdomPerSecond).toBe(Math.max(0, initialWisdomPerSecond - 0.2));
        });

        test('should trigger totalitarian defeat condition', () => {
            const checkTotalitarianDefeat = () => {
                if (mockGameState.consciousness <= 0 && mockGameState.planetaryConsciousness <= 5) {
                    return 'totalitarian_victory';
                }
                return null;
            };

            // Set up conditions for totalitarian defeat
            mockGameState.consciousness = 15; // Lower starting value
            mockGameState.planetaryConsciousness = 20; // Lower starting value

            // Apply totalitarian core effects
            mockGameState.consciousness = Math.max(0, mockGameState.consciousness - 20);
            mockGameState.planetaryConsciousness = Math.max(0, mockGameState.planetaryConsciousness - 15);

            const defeatReason = checkTotalitarianDefeat();
            expect(defeatReason).toBe('totalitarian_victory');
            expect(mockGameState.consciousness).toBe(0);
            expect(mockGameState.planetaryConsciousness).toBe(5);
        });
    });

    describe('Building Categories and Themes', () => {
        test('should categorize buildings by their thematic purpose', () => {
            const buildingCategories = {
                industrialMine: 'extraction',
                centralizedGrid: 'infrastructure',
                automatedAgriculture: 'production',
                hierarchicalCity: 'social',
                propagandaTower: 'information',
                surveillanceNetwork: 'security',
                thoughtPolice: 'enforcement',
                corporateState: 'economic',
                memoryWipe: 'psychological',
                totalitarianCore: 'ultimate'
            };

            const categoryCounts = {};
            Object.values(buildingCategories).forEach(category => {
                categoryCounts[category] = (categoryCounts[category] || 0) + 1;
            });

            expect(Object.keys(categoryCounts)).toHaveLength(10); // 10 unique categories
            expect(categoryCounts.ultimate).toBe(1); // Only one ultimate building
        });

        test('should have escalating cost and resource requirements', () => {
            const buildingCosts = {
                industrialMine: { cost: 50, costResource: 'energy' },
                centralizedGrid: { cost: 75, costResource: 'insight' },
                hierarchicalCity: { cost: 120, costResource: 'energy' },
                surveillanceNetwork: { cost: 150, costResource: 'insight' },
                thoughtPolice: { cost: 200, costResource: 'wisdom' },
                memoryWipe: { cost: 400, costResource: 'wisdom' },
                totalitarianCore: { cost: 50, costResource: 'consciousness' } // Ironically cheap in consciousness
            };

            // Costs should generally increase with tier (except totalitarian core which costs consciousness)
            expect(buildingCosts.industrialMine.cost).toBeLessThan(buildingCosts.hierarchicalCity.cost);
            expect(buildingCosts.hierarchicalCity.cost).toBeLessThan(buildingCosts.thoughtPolice.cost);
            expect(buildingCosts.thoughtPolice.cost).toBeLessThan(buildingCosts.memoryWipe.cost);
            
            // Totalitarian core should cost consciousness (the irony)
            expect(buildingCosts.totalitarianCore.costResource).toBe('consciousness');
        });
    });

    describe('Building Unlock Progression', () => {
        test('should create a logical progression tree', () => {
            const progressionTree = {
                // Tier 1 (Foundation)
                industrialMine: [],
                automatedAgriculture: [],
                // Tier 2 (Systems) 
                centralizedGrid: ['industrialMine'],
                propagandaTower: ['industrialMine'],
                hierarchicalCity: ['centralizedGrid'],
                // Tier 3 (Oppression)
                surveillanceNetwork: ['propagandaTower'],
                thoughtPolice: ['surveillanceNetwork'],
                corporateState: ['hierarchicalCity'],
                memoryWipe: ['thoughtPolice'],
                // Tier 4 (Ultimate)
                totalitarianCore: ['memoryWipe', 'control > 50']
            };

            // Verify that each building has logical prerequisites
            expect(progressionTree.industrialMine).toHaveLength(0); // No prerequisites
            expect(progressionTree.centralizedGrid).toContain('industrialMine');
            expect(progressionTree.thoughtPolice).toContain('surveillanceNetwork');
            expect(progressionTree.totalitarianCore).toContain('memoryWipe');
        });
    });
});

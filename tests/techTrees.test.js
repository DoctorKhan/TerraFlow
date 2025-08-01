/**
 * @jest-environment jsdom
 */

describe('Two Divergent Tech Trees Tests', () => {
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            energy: 100,
            insight: 100,
            harmony: 50,
            inspiration: 50,
            wisdom: 50,
            control: 10,
            controlPerSecond: 0,
            consciousness: 15,
            consciousnessPerSecond: 0,
            planetaryConsciousness: 15,
            entropy: 0,
            techTreeUnlocked: false,
            rulerBuildings: {
                industrialMine: 0,
                centralizedGrid: 0,
                hierarchicalCity: 0,
                propagandaTower: 0,
                automatedAgriculture: 0
            },
            gardenerBuildings: {
                stoneCircle: 0,
                healingGrove: 0,
                wisdomSanctuary: 0,
                permacultureGarden: 0,
                mycelialNetwork: 0
            },
            statistics: {
                rulerPathChoices: 0,
                gardenerPathChoices: 0
            }
        };

        global.gameState = mockGameState;
    });

    describe('Tech Tree Unlocking', () => {
        test('should unlock tech tree when total consciousness + control >= 20', () => {
            const checkTechTreeUnlock = () => {
                const totalConsciousness = mockGameState.consciousness + mockGameState.control;
                if (totalConsciousness >= 20 && !mockGameState.techTreeUnlocked) {
                    mockGameState.techTreeUnlocked = true;
                    return true;
                }
                return false;
            };

            // Below threshold
            mockGameState.consciousness = 5;
            mockGameState.control = 10;
            expect(checkTechTreeUnlock()).toBe(false);

            // At threshold
            mockGameState.consciousness = 10;
            mockGameState.control = 10;
            expect(checkTechTreeUnlock()).toBe(true);
            expect(mockGameState.techTreeUnlocked).toBe(true);
        });
    });

    describe('Path of the Rulers Buildings', () => {
        test('should build ruler buildings and apply effects correctly', () => {
            const buildRulerBuilding = (buildingKey, buildingConfig) => {
                if (mockGameState[buildingConfig.costResource] >= buildingConfig.cost) {
                    mockGameState[buildingConfig.costResource] -= buildingConfig.cost;
                    mockGameState.rulerBuildings[buildingKey] += 1;

                    // Apply building effects
                    for (const [resource, amount] of Object.entries(buildingConfig.effects)) {
                        if (resource.endsWith('PerSecond')) {
                            const baseResource = resource.replace('PerSecond', '');
                            if (mockGameState[resource] !== undefined) {
                                mockGameState[resource] += amount;
                            }
                        } else if (mockGameState[resource] !== undefined) {
                            mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                        }
                    }

                    mockGameState.statistics.rulerPathChoices += 1;
                    return true;
                }
                return false;
            };

            const industrialMine = {
                cost: 50,
                costResource: 'energy',
                effects: { control: 2, energy: 1.5, harmony: -0.5, entropy: 0.1 }
            };

            const initialEnergy = mockGameState.energy;
            const initialControl = mockGameState.control;
            const initialHarmony = mockGameState.harmony;
            const initialEntropy = mockGameState.entropy;

            const result = buildRulerBuilding('industrialMine', industrialMine);

            expect(result).toBe(true);
            expect(mockGameState.energy).toBe(initialEnergy - 50 + 1.5); // Cost + effect
            expect(mockGameState.control).toBe(initialControl + 2);
            expect(mockGameState.harmony).toBe(initialHarmony - 0.5);
            expect(mockGameState.entropy).toBe(initialEntropy + 0.1);
            expect(mockGameState.rulerBuildings.industrialMine).toBe(1);
            expect(mockGameState.statistics.rulerPathChoices).toBe(1);
        });

        test('should not build if insufficient resources', () => {
            const buildRulerBuilding = (buildingKey, buildingConfig) => {
                if (mockGameState[buildingConfig.costResource] >= buildingConfig.cost) {
                    mockGameState[buildingConfig.costResource] -= buildingConfig.cost;
                    mockGameState.rulerBuildings[buildingKey] += 1;
                    return true;
                }
                return false;
            };

            const expensiveBuilding = {
                cost: 1000,
                costResource: 'energy',
                effects: { control: 5 }
            };

            mockGameState.energy = 50; // Not enough for 1000 cost
            const result = buildRulerBuilding('hierarchicalCity', expensiveBuilding);

            expect(result).toBe(false);
            expect(mockGameState.rulerBuildings.hierarchicalCity).toBe(0);
            expect(mockGameState.energy).toBe(50); // Unchanged
        });
    });

    describe('Path of the Gardeners Buildings', () => {
        test('should build gardener buildings and apply effects correctly', () => {
            const buildGardenerBuilding = (buildingKey, buildingConfig) => {
                if (mockGameState[buildingConfig.costResource] >= buildingConfig.cost) {
                    mockGameState[buildingConfig.costResource] -= buildingConfig.cost;
                    mockGameState.gardenerBuildings[buildingKey] += 1;

                    // Apply building effects
                    for (const [resource, amount] of Object.entries(buildingConfig.effects)) {
                        if (resource.endsWith('PerSecond')) {
                            const baseResource = resource.replace('PerSecond', '');
                            if (mockGameState[resource] !== undefined) {
                                mockGameState[resource] += amount;
                            }
                        } else if (mockGameState[resource] !== undefined) {
                            mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                        }
                    }

                    mockGameState.statistics.gardenerPathChoices += 1;
                    return true;
                }
                return false;
            };

            const stoneCircle = {
                cost: 40,
                costResource: 'wisdom',
                effects: { consciousness: 2, wisdom: 0.5, harmony: 1, control: -0.2 }
            };

            const initialWisdom = mockGameState.wisdom;
            const initialConsciousness = mockGameState.consciousness;
            const initialHarmony = mockGameState.harmony;
            const initialControl = mockGameState.control;

            const result = buildGardenerBuilding('stoneCircle', stoneCircle);

            expect(result).toBe(true);
            expect(mockGameState.wisdom).toBe(initialWisdom - 40 + 0.5); // Cost + effect
            expect(mockGameState.consciousness).toBe(initialConsciousness + 2);
            expect(mockGameState.harmony).toBe(initialHarmony + 1);
            expect(mockGameState.control).toBe(initialControl - 0.2);
            expect(mockGameState.gardenerBuildings.stoneCircle).toBe(1);
            expect(mockGameState.statistics.gardenerPathChoices).toBe(1);
        });

        test('should handle per-second effects correctly', () => {
            const buildGardenerBuilding = (buildingKey, buildingConfig) => {
                if (mockGameState[buildingConfig.costResource] >= buildingConfig.cost) {
                    mockGameState[buildingConfig.costResource] -= buildingConfig.cost;
                    mockGameState.gardenerBuildings[buildingKey] += 1;

                    // Apply building effects
                    for (const [resource, amount] of Object.entries(buildingConfig.effects)) {
                        if (resource.endsWith('PerSecond')) {
                            if (mockGameState[resource] !== undefined) {
                                mockGameState[resource] += amount;
                            }
                        } else if (mockGameState[resource] !== undefined) {
                            mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                        }
                    }

                    return true;
                }
                return false;
            };

            const healingGrove = {
                cost: 50,
                costResource: 'inspiration',
                effects: { consciousness: 1.5, harmony: 2, consciousnessPerSecond: 0.1, entropy: -0.1 }
            };

            mockGameState.consciousnessPerSecond = 0;
            const result = buildGardenerBuilding('healingGrove', healingGrove);

            expect(result).toBe(true);
            expect(mockGameState.consciousnessPerSecond).toBe(0.1);
            expect(mockGameState.consciousness).toBe(15 + 1.5); // Initial + effect
        });
    });

    describe('Path Divergence and Balance', () => {
        test('should track path choices separately', () => {
            const trackPathChoice = (pathType) => {
                if (pathType === 'ruler') {
                    mockGameState.statistics.rulerPathChoices += 1;
                } else if (pathType === 'gardener') {
                    mockGameState.statistics.gardenerPathChoices += 1;
                }
            };

            trackPathChoice('ruler');
            trackPathChoice('ruler');
            trackPathChoice('gardener');

            expect(mockGameState.statistics.rulerPathChoices).toBe(2);
            expect(mockGameState.statistics.gardenerPathChoices).toBe(1);
        });

        test('should calculate path imbalance and entropy risk', () => {
            const calculatePathImbalance = () => {
                const rulerChoices = mockGameState.statistics.rulerPathChoices;
                const gardenerChoices = mockGameState.statistics.gardenerPathChoices;
                const totalChoices = rulerChoices + gardenerChoices;
                
                if (totalChoices === 0) return { imbalance: 0, dominantPath: 'none' };
                
                const rulerRatio = rulerChoices / totalChoices;
                const gardenerRatio = gardenerChoices / totalChoices;
                const imbalance = Math.abs(rulerRatio - gardenerRatio);
                
                let dominantPath = 'balanced';
                if (rulerRatio > 0.7) dominantPath = 'ruler';
                else if (gardenerRatio > 0.7) dominantPath = 'gardener';
                
                return {
                    imbalance,
                    dominantPath,
                    rulerRatio,
                    gardenerRatio,
                    entropyRisk: imbalance > 0.6
                };
            };

            // Balanced choices
            mockGameState.statistics.rulerPathChoices = 3;
            mockGameState.statistics.gardenerPathChoices = 3;
            
            let balance = calculatePathImbalance();
            expect(balance.imbalance).toBe(0);
            expect(balance.dominantPath).toBe('balanced');
            expect(balance.entropyRisk).toBe(false);

            // Ruler-dominated choices
            mockGameState.statistics.rulerPathChoices = 8;
            mockGameState.statistics.gardenerPathChoices = 2;
            
            balance = calculatePathImbalance();
            expect(balance.dominantPath).toBe('ruler');
            expect(balance.entropyRisk).toBe(true);
        });
    });

    describe('Building Effects Integration', () => {
        test('should format building effects for display', () => {
            const formatBuildingEffects = (effects) => {
                const effectStrings = [];
                for (const [key, value] of Object.entries(effects)) {
                    const sign = value > 0 ? '+' : '';
                    effectStrings.push(`${sign}${value} ${key}`);
                }
                return effectStrings.join(', ');
            };

            const effects = {
                control: 2,
                consciousness: -1,
                harmony: 0.5,
                entropy: 0.1
            };

            const formatted = formatBuildingEffects(effects);
            expect(formatted).toBe('+2 control, -1 consciousness, +0.5 harmony, +0.1 entropy');
        });

        test('should prevent negative resource values', () => {
            const applyBuildingEffects = (effects) => {
                for (const [resource, amount] of Object.entries(effects)) {
                    if (mockGameState[resource] !== undefined) {
                        mockGameState[resource] = Math.max(0, mockGameState[resource] + amount);
                    }
                }
            };

            mockGameState.harmony = 5;
            applyBuildingEffects({ harmony: -10 }); // Would make harmony negative

            expect(mockGameState.harmony).toBe(0); // Should be clamped to 0
        });
    });
});

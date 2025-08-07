/**
 * TDD Test Suite: Game Balance Optimization
 * 
 * This test suite analyzes and validates game balance mechanics
 * compared to SwarmSim standards for optimal difficulty progression.
 */

describe('Game Balance Optimization Tests', () => {
    describe('Current Balance Analysis', () => {
        test('should identify early game difficulty issues', () => {
            const currentBalance = {
                startingResources: { energy: 20, insight: 5 },
                startingUnits: { dreamers: 1, weavers: 1 },
                costMultiplier: 1.15,
                baseProduction: { dreamers: 0.1, weavers: 0.1 }
            };

            const analyzeEarlyGame = (balance) => {
                const issues = [];
                
                // Check if starting with producing units (too easy)
                if (balance.startingUnits.dreamers > 0 || balance.startingUnits.weavers > 0) {
                    issues.push('STARTS_WITH_PRODUCTION');
                }
                
                // Check if cost scaling is too gentle
                if (balance.costMultiplier < 1.2) {
                    issues.push('COST_SCALING_TOO_GENTLE');
                }
                
                // Check if starting resources are too high
                const totalStartingValue = balance.startingResources.energy + balance.startingResources.insight;
                if (totalStartingValue > 20) {
                    issues.push('STARTING_RESOURCES_TOO_HIGH');
                }
                
                return {
                    difficulty: issues.length === 0 ? 'BALANCED' : 'TOO_EASY',
                    issues: issues
                };
            };

            const analysis = analyzeEarlyGame(currentBalance);
            
            expect(analysis.difficulty).toBe('TOO_EASY');
            expect(analysis.issues).toContain('STARTS_WITH_PRODUCTION');
            expect(analysis.issues).toContain('COST_SCALING_TOO_GENTLE');
            expect(analysis.issues).toContain('STARTING_RESOURCES_TOO_HIGH');
        });

        test('should validate production tier scaling', () => {
            const currentTiers = {
                tier1: { dreamers: 0.1, weavers: 0.1 },
                tier2: { stellarNomads: 0.15 }, // Only 1.5x better
                tier3: { voidWhisperers: 0.08, crystalBeings: 0.2 }, // Inconsistent
                tier4: { plasmaDancers: 0.3 },
                tier5: { quantumSages: 0.5, nebulaShepherds: 0.8 }
            };

            const validateTierScaling = (tiers) => {
                const issues = [];
                const expectedMultiplier = 5; // Each tier should be ~5x better
                
                // Check tier 2 scaling
                const tier2Improvement = tiers.tier2.stellarNomads / tiers.tier1.dreamers;
                if (tier2Improvement < expectedMultiplier) {
                    issues.push(`TIER2_WEAK_SCALING: ${tier2Improvement}x instead of ${expectedMultiplier}x`);
                }
                
                // Check tier 3 scaling
                const tier3Max = Math.max(tiers.tier3.voidWhisperers, tiers.tier3.crystalBeings);
                const expectedTier3 = tiers.tier1.dreamers * Math.pow(expectedMultiplier, 2); // 25x
                if (tier3Max < expectedTier3) {
                    issues.push(`TIER3_WEAK_SCALING: ${tier3Max} instead of ${expectedTier3}`);
                }
                
                return {
                    balanced: issues.length === 0,
                    issues: issues
                };
            };

            const validation = validateTierScaling(currentTiers);
            
            expect(validation.balanced).toBe(false);
            expect(validation.issues.some(issue => issue.includes('TIER2_WEAK_SCALING'))).toBe(true);
            expect(validation.issues.some(issue => issue.includes('TIER3_WEAK_SCALING'))).toBe(true);
        });

        test('should analyze node cost scaling issues', () => {
            const currentNodes = {
                sustenance: { cost: 100, multiplier: 1.2, scaling: 2.5 },
                energy: { cost: 100, multiplier: 1.2, scaling: 2.5 },
                cohesion: { cost: 500, multiplier: 1.1, scaling: 2.5 },
                cycling: { cost: 200, multiplier: 0.95, scaling: 2.5 }
            };

            const analyzeNodeBalance = (nodes) => {
                const issues = [];
                
                Object.entries(nodes).forEach(([name, node]) => {
                    // Check if scaling is too steep
                    if (node.scaling > 2.2) {
                        issues.push(`${name.toUpperCase()}_SCALING_TOO_STEEP`);
                    }
                    
                    // Check if multipliers are too weak
                    if (node.multiplier < 1.3 && node.multiplier > 0.8) {
                        issues.push(`${name.toUpperCase()}_MULTIPLIER_TOO_WEAK`);
                    }
                    
                    // Check if costs are too high for early game
                    if (node.cost > 150 && name !== 'cohesion') {
                        issues.push(`${name.toUpperCase()}_COST_TOO_HIGH`);
                    }
                });
                
                return {
                    balanced: issues.length === 0,
                    issues: issues
                };
            };

            const analysis = analyzeNodeBalance(currentNodes);
            
            expect(analysis.balanced).toBe(false);
            expect(analysis.issues).toContain('SUSTENANCE_SCALING_TOO_STEEP');
            expect(analysis.issues).toContain('COHESION_MULTIPLIER_TOO_WEAK');
            expect(analysis.issues).toContain('CYCLING_COST_TOO_HIGH');
        });
    });

    describe('Optimal Balance Recommendations', () => {
        test('should generate improved early game balance', () => {
            const generateOptimalEarlyGame = () => {
                return {
                    startingResources: {
                        energy: 10,    // Reduced from 20
                        insight: 2,    // Reduced from 5
                        harmony: 30    // Reduced from 50
                    },
                    startingUnits: {
                        dreamers: 0,   // Start with 0 (must buy first)
                        weavers: 0     // Start with 0
                    },
                    unitBaseCosts: {
                        dreamers: 10,  // Reduced from 15
                        weavers: 10    // Reduced from 15
                    },
                    costMultiplier: 1.05, // Gentler scaling
                    timeToFirstPurchase: 60 // Target 1 minute to first unit
                };
            };

            const optimal = generateOptimalEarlyGame();
            
            expect(optimal.startingUnits.dreamers).toBe(0);
            expect(optimal.startingUnits.weavers).toBe(0);
            expect(optimal.costMultiplier).toBeLessThan(1.1);
            expect(optimal.startingResources.energy).toBeGreaterThanOrEqual(optimal.unitBaseCosts.dreamers);
        });

        test('should create exponential production tiers', () => {
            const generateOptimalTiers = () => {
                const baseProduction = 0.1;
                const tierMultiplier = 5;
                
                return {
                    tier1: {
                        dreamers: { baseInsight: baseProduction },
                        weavers: { baseEnergy: baseProduction }
                    },
                    tier2: {
                        stellarNomads: { 
                            baseEnergy: baseProduction * tierMultiplier,
                            baseInsight: baseProduction * tierMultiplier * 0.4
                        }
                    },
                    tier3: {
                        voidWhisperers: { 
                            baseInsight: baseProduction * Math.pow(tierMultiplier, 2),
                            baseHarmony: baseProduction * tierMultiplier * 0.2
                        },
                        crystalBeings: { 
                            baseEnergy: baseProduction * Math.pow(tierMultiplier, 2)
                        }
                    },
                    tier4: {
                        plasmaDancers: { 
                            baseEnergy: baseProduction * Math.pow(tierMultiplier, 3)
                        }
                    },
                    tier5: {
                        quantumSages: { 
                            baseInsight: baseProduction * Math.pow(tierMultiplier, 4)
                        },
                        nebulaShepherds: { 
                            baseEnergy: baseProduction * Math.pow(tierMultiplier, 4),
                            baseInsight: baseProduction * Math.pow(tierMultiplier, 3)
                        }
                    }
                };
            };

            const tiers = generateOptimalTiers();
            
            // Verify exponential scaling
            expect(tiers.tier2.stellarNomads.baseEnergy).toBe(0.5); // 5x tier 1
            expect(tiers.tier3.crystalBeings.baseEnergy).toBe(2.5); // 25x tier 1
            expect(tiers.tier4.plasmaDancers.baseEnergy).toBe(12.5); // 125x tier 1
            expect(tiers.tier5.quantumSages.baseInsight).toBe(62.5); // 625x tier 1
        });

        test('should balance node costs and effects', () => {
            const generateOptimalNodes = () => {
                return {
                    // Tier 1: Early game affordable boosts
                    sustenance: {
                        cost: 50,        // Reduced from 100
                        multiplier: 1.5, // Increased from 1.2
                        scaling: 2.0     // Reduced from 2.5
                    },
                    energy: {
                        cost: 50,
                        multiplier: 1.5,
                        scaling: 2.0
                    },
                    
                    // Tier 2: Mid game investments
                    cohesion: {
                        cost: 200,       // Reduced from 500
                        multiplier: 1.25, // Increased from 1.1
                        scaling: 2.0
                    },
                    cycling: {
                        cost: 100,       // Reduced from 200
                        multiplier: 1.1, // 10% production bonus (not cost reduction)
                        scaling: 2.0
                    }
                };
            };

            const nodes = generateOptimalNodes();
            
            // Verify all nodes have reasonable costs and effects
            Object.entries(nodes).forEach(([name, node]) => {
                expect(node.cost).toBeLessThanOrEqual(200);
                expect(node.scaling).toBeLessThanOrEqual(2.0);
                if (name !== 'cycling') { // cycling might have cost reduction
                    expect(node.multiplier).toBeGreaterThan(1.0);
                }
            });
        });
    });

    describe('Dynamic Balance Adjustment', () => {
        test('should detect when game is too easy', () => {
            const playerMetrics = {
                averageSessionLength: 15, // Too short
                purchaseFrequency: 10,    // Too frequent
                idleTimeRatio: 0.1,      // Too little waiting
                frustratedClicks: 0.05   // Very few
            };

            const analyzeDifficulty = (metrics) => {
                let difficulty = 0.5; // Start neutral
                
                if (metrics.averageSessionLength < 30) difficulty -= 0.2;
                if (metrics.purchaseFrequency < 30) difficulty -= 0.2;
                if (metrics.idleTimeRatio < 0.2) difficulty -= 0.2;
                if (metrics.frustratedClicks < 0.1) difficulty -= 0.1;
                
                return {
                    difficulty: difficulty,
                    adjustment: difficulty < 0.3 ? 'INCREASE_CHALLENGE' : 
                               difficulty > 0.7 ? 'DECREASE_CHALLENGE' : 'BALANCED'
                };
            };

            const analysis = analyzeDifficulty(playerMetrics);
            
            expect(analysis.difficulty).toBeLessThan(0.3);
            expect(analysis.adjustment).toBe('INCREASE_CHALLENGE');
        });

        test('should detect when game is too hard', () => {
            const playerMetrics = {
                averageSessionLength: 120, // Very long
                purchaseFrequency: 300,    // Very infrequent
                idleTimeRatio: 0.8,       // Too much waiting
                frustratedClicks: 0.4     // Many frustrated clicks
            };

            const analyzeDifficulty = (metrics) => {
                let difficulty = 0.5;
                
                if (metrics.averageSessionLength > 90) difficulty += 0.2;
                if (metrics.purchaseFrequency > 120) difficulty += 0.2;
                if (metrics.idleTimeRatio > 0.4) difficulty += 0.2;
                if (metrics.frustratedClicks > 0.3) difficulty += 0.3;
                
                return {
                    difficulty: difficulty,
                    adjustment: difficulty < 0.3 ? 'INCREASE_CHALLENGE' : 
                               difficulty > 0.7 ? 'DECREASE_CHALLENGE' : 'BALANCED'
                };
            };

            const analysis = analyzeDifficulty(playerMetrics);
            
            expect(analysis.difficulty).toBeGreaterThan(0.7);
            expect(analysis.adjustment).toBe('DECREASE_CHALLENGE');
        });

        test('should generate balance adjustments', () => {
            const generateBalanceAdjustment = (currentBalance, adjustment) => {
                const newBalance = { ...currentBalance };
                
                if (adjustment === 'INCREASE_CHALLENGE') {
                    newBalance.costMultiplier *= 1.1;
                    newBalance.productionMultiplier *= 0.9;
                } else if (adjustment === 'DECREASE_CHALLENGE') {
                    newBalance.costMultiplier *= 0.9;
                    newBalance.productionMultiplier *= 1.1;
                }
                
                return newBalance;
            };

            const currentBalance = {
                costMultiplier: 1.15,
                productionMultiplier: 1.0
            };

            const harderBalance = generateBalanceAdjustment(currentBalance, 'INCREASE_CHALLENGE');
            const easierBalance = generateBalanceAdjustment(currentBalance, 'DECREASE_CHALLENGE');

            expect(harderBalance.costMultiplier).toBeGreaterThan(currentBalance.costMultiplier);
            expect(harderBalance.productionMultiplier).toBeLessThan(currentBalance.productionMultiplier);
            
            expect(easierBalance.costMultiplier).toBeLessThan(currentBalance.costMultiplier);
            expect(easierBalance.productionMultiplier).toBeGreaterThan(currentBalance.productionMultiplier);
        });
    });

    describe('SwarmSim Parity Validation', () => {
        test('should match SwarmSim engagement patterns', () => {
            const swarmSimTargets = {
                sessionLength: { min: 45, max: 90 },
                purchaseFrequency: { min: 30, max: 120 },
                idleRatio: { min: 0.2, max: 0.4 },
                progressionRate: { newUnlockEvery: 15 } // minutes
            };

            const validateEngagement = (metrics, targets) => {
                const validation = {
                    sessionLength: metrics.sessionLength >= targets.sessionLength.min && 
                                  metrics.sessionLength <= targets.sessionLength.max,
                    purchaseFrequency: metrics.purchaseFrequency >= targets.purchaseFrequency.min && 
                                      metrics.purchaseFrequency <= targets.purchaseFrequency.max,
                    idleRatio: metrics.idleRatio >= targets.idleRatio.min && 
                              metrics.idleRatio <= targets.idleRatio.max
                };

                return {
                    overall: Object.values(validation).every(v => v),
                    details: validation
                };
            };

            // Test optimal metrics
            const optimalMetrics = {
                sessionLength: 60,
                purchaseFrequency: 60,
                idleRatio: 0.3
            };

            const validation = validateEngagement(optimalMetrics, swarmSimTargets);
            
            expect(validation.overall).toBe(true);
            expect(validation.details.sessionLength).toBe(true);
            expect(validation.details.purchaseFrequency).toBe(true);
            expect(validation.details.idleRatio).toBe(true);
        });
    });
});

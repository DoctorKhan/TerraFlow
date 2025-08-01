/**
 * @jest-environment jsdom
 */

describe('Intelligent Creatures Tests', () => {
    let mockGameState, mockCanvas, mockCtx;

    beforeEach(() => {
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            clearRect: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            setLineDash: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            bezierCurveTo: jest.fn()
        };

        mockCanvas = {
            getContext: jest.fn(() => mockCtx),
            getBoundingClientRect: jest.fn(() => ({ 
                left: 0, 
                top: 0, 
                width: 800, 
                height: 600 
            })),
            width: 800,
            height: 600
        };

        mockGameState = {
            energy: 100,
            insight: 50,
            harmony: 75,
            units: {
                dreamers: 2,
                weavers: 1
            },
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20, id: 'dome1' },
                { type: 'crystal_tree', x: 200, y: 200, size: 25, id: 'tree1' },
                { type: 'dreamer', x: 150, y: 150, size: 15, id: 'dreamer1', movable: true }
            ],
            intelligentCreatures: []
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;
        global.gameState = mockGameState;
        global.animationTime = 0;
    });

    describe('Intelligent Creature AI System', () => {
        test('should create intelligent creature with decision-making capabilities', () => {
            const createIntelligentCreature = (type, x, y) => {
                const creature = {
                    id: `creature_${Date.now()}`,
                    type: type,
                    x: x,
                    y: y,
                    size: 25,
                    intelligence: 100,
                    memory: [],
                    goals: [],
                    currentGoal: null,
                    personality: {
                        curiosity: Math.random(),
                        sociability: Math.random(),
                        productivity: Math.random(),
                        exploration: Math.random()
                    },
                    state: 'idle',
                    energy: 100,
                    lastDecision: 0,
                    decisionCooldown: 2000, // 2 seconds between decisions
                    perceptionRadius: 100,
                    movementSpeed: 30
                };

                // Initialize based on creature type
                if (type === 'cosmicSage') {
                    creature.specialAbilities = ['insight_generation', 'knowledge_sharing', 'meditation'];
                    creature.preferredActivities = ['study', 'teach', 'contemplate'];
                } else if (type === 'voidExplorer') {
                    creature.specialAbilities = ['void_navigation', 'resource_discovery', 'pathfinding'];
                    creature.preferredActivities = ['explore', 'scout', 'gather'];
                } else if (type === 'harmonyKeeper') {
                    creature.specialAbilities = ['harmony_restoration', 'conflict_resolution', 'healing'];
                    creature.preferredActivities = ['mediate', 'heal', 'organize'];
                }

                return creature;
            };

            const sage = createIntelligentCreature('cosmicSage', 300, 300);
            const explorer = createIntelligentCreature('voidExplorer', 400, 400);
            const keeper = createIntelligentCreature('harmonyKeeper', 500, 500);

            expect(sage.intelligence).toBe(100);
            expect(sage.specialAbilities).toContain('insight_generation');
            expect(explorer.specialAbilities).toContain('void_navigation');
            expect(keeper.specialAbilities).toContain('harmony_restoration');
            expect(sage.personality.curiosity).toBeGreaterThanOrEqual(0);
            expect(sage.personality.curiosity).toBeLessThanOrEqual(1);
        });

        test('should implement perception system for environmental awareness', () => {
            const perceiveEnvironment = (creature, gameState) => {
                const perception = {
                    nearbyUnits: [],
                    nearbyResources: [],
                    nearbyCreatures: [],
                    threats: [],
                    opportunities: [],
                    environmentalFactors: {}
                };

                // Find nearby entities within perception radius
                gameState.villageGrid.forEach(entity => {
                    const distance = Math.sqrt(
                        Math.pow(entity.x - creature.x, 2) + 
                        Math.pow(entity.y - creature.y, 2)
                    );

                    if (distance <= creature.perceptionRadius) {
                        if (entity.movable) {
                            perception.nearbyUnits.push({
                                entity: entity,
                                distance: distance,
                                relationship: 'neutral'
                            });
                        } else {
                            perception.nearbyResources.push({
                                entity: entity,
                                distance: distance,
                                type: entity.type
                            });
                        }
                    }
                });

                // Find other intelligent creatures
                if (gameState.intelligentCreatures) {
                    gameState.intelligentCreatures.forEach(otherCreature => {
                        if (otherCreature.id !== creature.id) {
                            const distance = Math.sqrt(
                                Math.pow(otherCreature.x - creature.x, 2) + 
                                Math.pow(otherCreature.y - creature.y, 2)
                            );

                            if (distance <= creature.perceptionRadius) {
                                perception.nearbyCreatures.push({
                                    creature: otherCreature,
                                    distance: distance,
                                    relationship: 'friendly'
                                });
                            }
                        }
                    });
                }

                // Analyze environmental factors
                perception.environmentalFactors = {
                    crowding: perception.nearbyUnits.length + perception.nearbyCreatures.length,
                    resourceAvailability: perception.nearbyResources.length,
                    harmonyLevel: gameState.harmony || 50,
                    energyLevel: gameState.energy || 0
                };

                return perception;
            };

            const creature = {
                id: 'test_creature',
                x: 150,
                y: 150,
                perceptionRadius: 100
            };

            const perception = perceiveEnvironment(creature, mockGameState);

            expect(perception.nearbyUnits.length).toBeGreaterThan(0);
            expect(perception.nearbyResources.length).toBeGreaterThan(0);
            expect(perception.environmentalFactors.harmonyLevel).toBe(75);
            expect(perception.environmentalFactors.energyLevel).toBe(100);
        });

        test('should implement goal-based decision making', () => {
            const makeDecision = (creature, perception, currentTime) => {
                // Don't make decisions too frequently
                if (currentTime - creature.lastDecision < creature.decisionCooldown) {
                    return creature.currentGoal;
                }

                const possibleGoals = [];

                // Generate goals based on creature type and personality
                if (creature.type === 'cosmicSage') {
                    if (perception.nearbyUnits.length > 0 && creature.personality.sociability > 0.5) {
                        possibleGoals.push({
                            type: 'teach',
                            priority: creature.personality.sociability * 10,
                            target: perception.nearbyUnits[0].entity,
                            duration: 5000
                        });
                    }

                    if (perception.environmentalFactors.harmonyLevel < 60) {
                        possibleGoals.push({
                            type: 'meditate',
                            priority: (100 - perception.environmentalFactors.harmonyLevel) / 10,
                            target: null,
                            duration: 8000
                        });
                    }
                }

                if (creature.type === 'voidExplorer') {
                    if (creature.personality.exploration > 0.6) {
                        possibleGoals.push({
                            type: 'explore',
                            priority: creature.personality.exploration * 8,
                            target: {
                                x: Math.random() * 800,
                                y: Math.random() * 600
                            },
                            duration: 10000
                        });
                    }

                    if (perception.nearbyResources.length > 0) {
                        possibleGoals.push({
                            type: 'investigate',
                            priority: creature.personality.curiosity * 7,
                            target: perception.nearbyResources[0].entity,
                            duration: 3000
                        });
                    }
                }

                // Select highest priority goal
                if (possibleGoals.length > 0) {
                    possibleGoals.sort((a, b) => b.priority - a.priority);
                    creature.currentGoal = possibleGoals[0];
                    creature.lastDecision = currentTime;
                    creature.state = creature.currentGoal.type;
                }

                return creature.currentGoal;
            };

            const sage = {
                type: 'cosmicSage',
                personality: { sociability: 0.8, curiosity: 0.6 },
                lastDecision: 0,
                decisionCooldown: 1000,
                currentGoal: null
            };

            const perception = {
                nearbyUnits: [{ entity: { id: 'unit1' } }],
                environmentalFactors: { harmonyLevel: 40 }
            };

            const goal = makeDecision(sage, perception, 2000);

            expect(goal).toBeDefined();
            expect(['teach', 'meditate']).toContain(goal.type);
            expect(goal.priority).toBeGreaterThan(0);
        });

        test('should implement memory system for learning', () => {
            const updateMemory = (creature, event) => {
                const memoryEntry = {
                    timestamp: Date.now(),
                    type: event.type,
                    location: { x: creature.x, y: creature.y },
                    data: event.data,
                    importance: event.importance || 1
                };

                creature.memory.push(memoryEntry);

                // Keep memory size manageable
                const maxMemorySize = 50;
                if (creature.memory.length > maxMemorySize) {
                    // Remove least important old memories
                    creature.memory.sort((a, b) => {
                        const ageA = Date.now() - a.timestamp;
                        const ageB = Date.now() - b.timestamp;
                        const scoreA = a.importance - (ageA / 10000);
                        const scoreB = b.importance - (ageB / 10000);
                        return scoreB - scoreA;
                    });
                    creature.memory = creature.memory.slice(0, maxMemorySize);
                }

                return creature.memory.length;
            };

            const recallMemory = (creature, type, maxAge = 60000) => {
                const now = Date.now();
                return creature.memory.filter(memory => 
                    memory.type === type && 
                    (now - memory.timestamp) <= maxAge
                ).sort((a, b) => b.timestamp - a.timestamp);
            };

            const creature = { memory: [] };

            const memoryCount1 = updateMemory(creature, {
                type: 'resource_discovered',
                data: { resourceType: 'crystal_tree', location: { x: 200, y: 200 } },
                importance: 5
            });

            const memoryCount2 = updateMemory(creature, {
                type: 'interaction',
                data: { targetId: 'dreamer1', result: 'positive' },
                importance: 3
            });

            expect(memoryCount1).toBe(1);
            expect(memoryCount2).toBe(2);

            const resourceMemories = recallMemory(creature, 'resource_discovered');
            expect(resourceMemories.length).toBe(1);
            expect(resourceMemories[0].data.resourceType).toBe('crystal_tree');
        });
    });

    describe('Creature Behaviors and Actions', () => {
        test('should implement teaching behavior for cosmic sages', () => {
            const executeTeachingBehavior = (sage, target, gameState) => {
                const result = {
                    success: false,
                    effect: null,
                    duration: 5000
                };

                if (!target || !target.movable) {
                    return result;
                }

                // Teaching increases target's effectiveness
                const distance = Math.sqrt(
                    Math.pow(target.x - sage.x, 2) + 
                    Math.pow(target.y - sage.y, 2)
                );

                if (distance <= 50) { // Close enough to teach
                    result.success = true;
                    result.effect = {
                        type: 'productivity_boost',
                        target: target.id,
                        multiplier: 1.2,
                        duration: 30000 // 30 seconds
                    };

                    // Sage gains experience from teaching
                    sage.intelligence = Math.min(200, sage.intelligence + 1);
                }

                return result;
            };

            const sage = {
                x: 100,
                y: 100,
                intelligence: 100
            };

            const target = {
                id: 'dreamer1',
                x: 110,
                y: 110,
                movable: true
            };

            const result = executeTeachingBehavior(sage, target, mockGameState);

            expect(result.success).toBe(true);
            expect(result.effect.type).toBe('productivity_boost');
            expect(result.effect.multiplier).toBe(1.2);
            expect(sage.intelligence).toBe(101);
        });

        test('should implement exploration behavior for void explorers', () => {
            const executeExplorationBehavior = (explorer, targetLocation, gameState) => {
                const result = {
                    success: false,
                    discoveries: [],
                    newKnowledge: []
                };

                // Move towards target location
                const dx = targetLocation.x - explorer.x;
                const dy = targetLocation.y - explorer.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 5) {
                    const moveSpeed = explorer.movementSpeed || 30;
                    const moveRatio = Math.min(moveSpeed / distance, 1);
                    explorer.x += dx * moveRatio;
                    explorer.y += dy * moveRatio;
                }

                // Check for discoveries at current location
                gameState.villageGrid.forEach(entity => {
                    const entityDistance = Math.sqrt(
                        Math.pow(entity.x - explorer.x, 2) + 
                        Math.pow(entity.y - explorer.y, 2)
                    );

                    if (entityDistance <= 30) {
                        result.discoveries.push({
                            type: entity.type,
                            location: { x: entity.x, y: entity.y },
                            properties: {
                                size: entity.size,
                                id: entity.id
                            }
                        });
                    }
                });

                // Generate new knowledge based on exploration
                if (result.discoveries.length > 0) {
                    result.success = true;
                    result.newKnowledge.push({
                        type: 'area_mapping',
                        data: {
                            location: { x: explorer.x, y: explorer.y },
                            entities: result.discoveries.length,
                            timestamp: Date.now()
                        }
                    });
                }

                return result;
            };

            const explorer = {
                x: 50,
                y: 50,
                movementSpeed: 30
            };

            const targetLocation = { x: 150, y: 150 };

            const result = executeExplorationBehavior(explorer, targetLocation, mockGameState);

            expect(explorer.x).toBeGreaterThan(50);
            expect(explorer.y).toBeGreaterThan(50);
            expect(result.discoveries.length).toBeGreaterThan(0);
            expect(result.success).toBe(true);
        });

        test('should implement harmony restoration for harmony keepers', () => {
            const executeHarmonyRestoration = (keeper, gameState) => {
                const result = {
                    success: false,
                    harmonyIncrease: 0,
                    affectedEntities: []
                };

                // Find entities within influence radius
                const influenceRadius = 80;
                const nearbyEntities = [];

                gameState.villageGrid.forEach(entity => {
                    const distance = Math.sqrt(
                        Math.pow(entity.x - keeper.x, 2) + 
                        Math.pow(entity.y - keeper.y, 2)
                    );

                    if (distance <= influenceRadius) {
                        nearbyEntities.push(entity);
                    }
                });

                if (nearbyEntities.length > 0) {
                    result.success = true;
                    result.harmonyIncrease = Math.min(5, nearbyEntities.length);
                    result.affectedEntities = nearbyEntities.map(e => e.id);

                    // Apply harmony restoration effect
                    gameState.harmony = Math.min(100, gameState.harmony + result.harmonyIncrease);

                    // Boost nearby entities' effectiveness
                    nearbyEntities.forEach(entity => {
                        if (entity.movable) {
                            entity.harmonyBoost = {
                                multiplier: 1.1,
                                duration: 20000,
                                timestamp: Date.now()
                            };
                        }
                    });
                }

                return result;
            };

            const keeper = {
                x: 150,
                y: 150
            };

            const initialHarmony = mockGameState.harmony;
            const result = executeHarmonyRestoration(keeper, mockGameState);

            expect(result.success).toBe(true);
            expect(result.harmonyIncrease).toBeGreaterThan(0);
            expect(mockGameState.harmony).toBeGreaterThan(initialHarmony);
            expect(result.affectedEntities.length).toBeGreaterThan(0);
        });
    });

    describe('Creature Interactions and Social Behavior', () => {
        test('should enable creatures to communicate and share knowledge', () => {
            const communicateBetweenCreatures = (creature1, creature2) => {
                const result = {
                    success: false,
                    knowledgeShared: [],
                    relationshipChange: 0
                };

                const distance = Math.sqrt(
                    Math.pow(creature1.x - creature2.x, 2) + 
                    Math.pow(creature1.y - creature2.y, 2)
                );

                if (distance <= 60) { // Close enough to communicate
                    result.success = true;

                    // Share recent memories
                    const recentMemories1 = creature1.memory.slice(-3);
                    const recentMemories2 = creature2.memory.slice(-3);

                    recentMemories1.forEach(memory => {
                        if (!creature2.memory.some(m => 
                            m.type === memory.type && 
                            Math.abs(m.timestamp - memory.timestamp) < 1000
                        )) {
                            creature2.memory.push({
                                ...memory,
                                source: creature1.id,
                                shared: true
                            });
                            result.knowledgeShared.push(memory.type);
                        }
                    });

                    // Improve relationship
                    result.relationshipChange = 0.1;
                    
                    // Both creatures gain intelligence from interaction
                    creature1.intelligence = Math.min(200, creature1.intelligence + 0.5);
                    creature2.intelligence = Math.min(200, creature2.intelligence + 0.5);
                }

                return result;
            };

            const creature1 = {
                id: 'sage1',
                x: 100,
                y: 100,
                intelligence: 100,
                memory: [
                    { type: 'resource_discovered', timestamp: Date.now() - 1000 },
                    { type: 'teaching_completed', timestamp: Date.now() - 500 }
                ]
            };

            const creature2 = {
                id: 'explorer1',
                x: 120,
                y: 120,
                intelligence: 95,
                memory: []
            };

            const result = communicateBetweenCreatures(creature1, creature2);

            expect(result.success).toBe(true);
            expect(result.knowledgeShared.length).toBeGreaterThan(0);
            expect(creature2.memory.length).toBeGreaterThan(0);
            expect(creature1.intelligence).toBe(100.5);
            expect(creature2.intelligence).toBe(95.5);
        });

        test('should implement collaborative problem solving', () => {
            const solveCollaborativeProblem = (creatures, problem, gameState) => {
                const result = {
                    success: false,
                    solution: null,
                    participatingCreatures: [],
                    timeToSolve: 0
                };

                // Check if creatures have required abilities
                const requiredAbilities = problem.requiredAbilities || [];
                const availableAbilities = [];

                creatures.forEach(creature => {
                    if (creature.specialAbilities) {
                        creature.specialAbilities.forEach(ability => {
                            if (!availableAbilities.includes(ability)) {
                                availableAbilities.push(ability);
                            }
                        });
                        result.participatingCreatures.push(creature.id);
                    }
                });

                // Check if all required abilities are available
                const canSolve = requiredAbilities.every(ability => 
                    availableAbilities.includes(ability)
                );

                if (canSolve && result.participatingCreatures.length >= problem.minCreatures) {
                    result.success = true;
                    result.timeToSolve = Math.max(1000, 5000 - (creatures.length * 500));
                    
                    if (problem.type === 'harmony_crisis') {
                        result.solution = {
                            type: 'harmony_restoration',
                            effect: { harmony: +15 },
                            duration: 30000
                        };
                    } else if (problem.type === 'resource_shortage') {
                        result.solution = {
                            type: 'resource_optimization',
                            effect: { efficiency: 1.3 },
                            duration: 60000
                        };
                    }

                    // All participating creatures gain intelligence
                    creatures.forEach(creature => {
                        creature.intelligence = Math.min(200, creature.intelligence + 2);
                    });
                }

                return result;
            };

            const creatures = [
                {
                    id: 'sage1',
                    specialAbilities: ['insight_generation', 'knowledge_sharing'],
                    intelligence: 100
                },
                {
                    id: 'keeper1',
                    specialAbilities: ['harmony_restoration', 'healing'],
                    intelligence: 95
                }
            ];

            const problem = {
                type: 'harmony_crisis',
                requiredAbilities: ['harmony_restoration', 'insight_generation'],
                minCreatures: 2
            };

            const result = solveCollaborativeProblem(creatures, problem, mockGameState);

            expect(result.success).toBe(true);
            expect(result.participatingCreatures.length).toBe(2);
            expect(result.solution.type).toBe('harmony_restoration');
            expect(creatures[0].intelligence).toBe(102);
            expect(creatures[1].intelligence).toBe(97);
        });
    });
});

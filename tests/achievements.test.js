/**
 * @jest-environment jsdom
 */

describe('Achievement & Goals System Tests', () => {
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
            inspiration: 30,
            wisdom: 40,
            units: {
                dreamers: 2,
                weavers: 1
            },
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20, id: 'dome1' },
                { type: 'dreamer', x: 150, y: 150, size: 15, id: 'dreamer1', movable: true }
            ],
            intelligentCreatures: [],
            conversationalUnits: [],
            activeInteractions: [],
            achievements: {
                unlocked: [],
                progress: {},
                categories: ['basic', 'advanced', 'master', 'secret']
            },
            goals: {
                active: [],
                completed: [],
                available: [],
                milestones: []
            },
            statistics: {
                totalUnitsCreated: 0,
                totalEnergyGenerated: 0,
                totalInsightGenerated: 0,
                totalInteractions: 0,
                totalConversations: 0,
                playTime: 0,
                maxHarmony: 75,
                maxEnergy: 100,
                maxInsight: 50
            }
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;
        global.gameState = mockGameState;
    });

    describe('Achievement System', () => {
        test('should create achievement with proper structure', () => {
            const createAchievement = (id, name, description, category, requirements, rewards) => {
                return {
                    id: id,
                    name: name,
                    description: description,
                    category: category,
                    requirements: requirements,
                    rewards: rewards,
                    unlocked: false,
                    unlockedAt: null,
                    progress: 0,
                    maxProgress: requirements.target || 1,
                    hidden: requirements.hidden || false,
                    rarity: requirements.rarity || 'common'
                };
            };

            const achievement = createAchievement(
                'first_dreamer',
                'Dream Weaver',
                'Create your first Dreamer unit',
                'basic',
                { type: 'unit_creation', unitType: 'dreamers', target: 1 },
                { insight: 10, title: 'Novice Dreamer' }
            );

            expect(achievement.id).toBe('first_dreamer');
            expect(achievement.name).toBe('Dream Weaver');
            expect(achievement.category).toBe('basic');
            expect(achievement.unlocked).toBe(false);
            expect(achievement.maxProgress).toBe(1);
            expect(achievement.requirements.type).toBe('unit_creation');
        });

        test('should check achievement progress correctly', () => {
            const checkAchievementProgress = (achievement, gameState) => {
                const req = achievement.requirements;
                let currentProgress = 0;

                switch (req.type) {
                    case 'unit_creation':
                        currentProgress = gameState.units[req.unitType] || 0;
                        break;
                    case 'resource_threshold':
                        currentProgress = gameState[req.resource] || 0;
                        break;
                    case 'total_interactions':
                        currentProgress = gameState.statistics.totalInteractions || 0;
                        break;
                    case 'harmony_level':
                        currentProgress = gameState.harmony || 0;
                        break;
                    case 'multiple_conditions':
                        currentProgress = req.conditions.every(condition =>
                            checkSingleCondition(condition, gameState)
                        ) ? 1 : 0;
                        break;
                }

                achievement.progress = Math.min(currentProgress, achievement.maxProgress);

                if (achievement.progress >= achievement.maxProgress && !achievement.unlocked) {
                    return { shouldUnlock: true, achievement };
                }

                return { shouldUnlock: false, achievement };
            };

            const checkSingleCondition = (condition, gameState) => {
                switch (condition.type) {
                    case 'min_units':
                        return (gameState.units[condition.unitType] || 0) >= condition.value;
                    case 'min_resource':
                        return (gameState[condition.resource] || 0) >= condition.value;
                    default:
                        return false;
                }
            };

            const achievement = {
                id: 'first_dreamer',
                requirements: { type: 'unit_creation', unitType: 'dreamers', target: 1 },
                maxProgress: 1,
                progress: 0,
                unlocked: false
            };

            const result = checkAchievementProgress(achievement, mockGameState);

            expect(result.shouldUnlock).toBe(true);
            expect(achievement.progress).toBe(1); // Progress is clamped to target (1)
        });

        test('should unlock achievement and apply rewards', () => {
            const unlockAchievement = (achievement, gameState) => {
                if (achievement.unlocked) return false;

                achievement.unlocked = true;
                achievement.unlockedAt = Date.now();

                // Apply rewards
                if (achievement.rewards) {
                    Object.keys(achievement.rewards).forEach(rewardType => {
                        if (rewardType === 'title') {
                            // Handle title rewards
                            gameState.playerTitles = gameState.playerTitles || [];
                            gameState.playerTitles.push(achievement.rewards[rewardType]);
                        } else if (gameState[rewardType] !== undefined) {
                            // Handle resource rewards
                            gameState[rewardType] += achievement.rewards[rewardType];
                        }
                    });
                }

                // Add to unlocked achievements
                gameState.achievements.unlocked.push(achievement.id);

                return {
                    success: true,
                    achievement: achievement,
                    rewards: achievement.rewards
                };
            };

            const achievement = {
                id: 'first_dreamer',
                name: 'Dream Weaver',
                unlocked: false,
                rewards: { insight: 10, energy: 5, title: 'Novice Dreamer' }
            };

            const result = unlockAchievement(achievement, mockGameState);

            expect(result.success).toBe(true);
            expect(achievement.unlocked).toBe(true);
            expect(achievement.unlockedAt).toBeDefined();
            expect(mockGameState.insight).toBe(60); // 50 + 10
            expect(mockGameState.energy).toBe(105); // 100 + 5
            expect(mockGameState.playerTitles).toContain('Novice Dreamer');
            expect(mockGameState.achievements.unlocked).toContain('first_dreamer');
        });
    });

    describe('Goals System', () => {
        test('should create goal with proper structure', () => {
            const createGoal = (id, title, description, type, target, rewards, prerequisites) => {
                return {
                    id: id,
                    title: title,
                    description: description,
                    type: type,
                    target: target,
                    progress: 0,
                    completed: false,
                    completedAt: null,
                    rewards: rewards,
                    prerequisites: prerequisites || [],
                    priority: 'normal',
                    category: 'main',
                    timeLimit: null,
                    hints: []
                };
            };

            const goal = createGoal(
                'sanctuary_growth',
                'Growing Sanctuary',
                'Expand your sanctuary by creating 5 units of any type',
                'unit_count',
                5,
                { energy: 25, insight: 15, harmony: 10 },
                []
            );

            expect(goal.id).toBe('sanctuary_growth');
            expect(goal.title).toBe('Growing Sanctuary');
            expect(goal.type).toBe('unit_count');
            expect(goal.target).toBe(5);
            expect(goal.completed).toBe(false);
        });

        test('should track goal progress correctly', () => {
            const updateGoalProgress = (goal, gameState) => {
                let currentProgress = 0;

                switch (goal.type) {
                    case 'unit_count':
                        currentProgress = Object.values(gameState.units).reduce((sum, count) => sum + count, 0);
                        break;
                    case 'resource_accumulation':
                        currentProgress = gameState[goal.resource] || 0;
                        break;
                    case 'harmony_maintenance':
                        currentProgress = gameState.harmony >= goal.threshold ? 1 : 0;
                        break;
                    case 'interaction_count':
                        currentProgress = gameState.statistics.totalInteractions || 0;
                        break;
                    case 'conversation_count':
                        currentProgress = gameState.statistics.totalConversations || 0;
                        break;
                }

                goal.progress = Math.min(currentProgress, goal.target);

                if (goal.progress >= goal.target && !goal.completed) {
                    return { shouldComplete: true, goal };
                }

                return { shouldComplete: false, goal };
            };

            const goal = {
                id: 'sanctuary_growth',
                type: 'unit_count',
                target: 5,
                progress: 0,
                completed: false
            };

            const result = updateGoalProgress(goal, mockGameState);

            expect(goal.progress).toBe(3); // 2 dreamers + 1 weaver
            expect(result.shouldComplete).toBe(false); // Need 5 total
        });

        test('should complete goal and apply rewards', () => {
            const completeGoal = (goal, gameState) => {
                if (goal.completed) return false;

                goal.completed = true;
                goal.completedAt = Date.now();

                // Apply rewards
                if (goal.rewards) {
                    Object.keys(goal.rewards).forEach(rewardType => {
                        if (gameState[rewardType] !== undefined) {
                            gameState[rewardType] += goal.rewards[rewardType];
                        }
                    });
                }

                // Move to completed goals
                gameState.goals.completed.push(goal.id);
                gameState.goals.active = gameState.goals.active.filter(g => g.id !== goal.id);

                // Check for new goals that might be unlocked
                const newGoals = checkUnlockedGoals(gameState);

                return {
                    success: true,
                    goal: goal,
                    rewards: goal.rewards,
                    newGoalsUnlocked: newGoals
                };
            };

            const checkUnlockedGoals = (gameState) => {
                // Mock function - would check prerequisites
                return [];
            };

            const goal = {
                id: 'sanctuary_growth',
                title: 'Growing Sanctuary',
                completed: false,
                rewards: { energy: 25, insight: 15, harmony: 10 }
            };

            mockGameState.goals.active = [goal];

            const result = completeGoal(goal, mockGameState);

            expect(result.success).toBe(true);
            expect(goal.completed).toBe(true);
            expect(goal.completedAt).toBeDefined();
            expect(mockGameState.energy).toBe(125); // 100 + 25
            expect(mockGameState.insight).toBe(65); // 50 + 15
            expect(mockGameState.harmony).toBe(85); // 75 + 10
            expect(mockGameState.goals.completed).toContain('sanctuary_growth');
            expect(mockGameState.goals.active).toHaveLength(0);
        });
    });

    describe('Statistics Tracking', () => {
        test('should update statistics correctly', () => {
            const updateStatistics = (gameState, eventType, data) => {
                const stats = gameState.statistics;

                switch (eventType) {
                    case 'unit_created':
                        stats.totalUnitsCreated += 1;
                        break;
                    case 'energy_generated':
                        stats.totalEnergyGenerated += data.amount;
                        stats.maxEnergy = Math.max(stats.maxEnergy, gameState.energy);
                        break;
                    case 'interaction_occurred':
                        stats.totalInteractions += 1;
                        break;
                    case 'conversation_started':
                        stats.totalConversations += 1;
                        break;
                    case 'harmony_changed':
                        stats.maxHarmony = Math.max(stats.maxHarmony, gameState.harmony);
                        break;
                }

                return stats;
            };

            updateStatistics(mockGameState, 'unit_created', {});
            expect(mockGameState.statistics.totalUnitsCreated).toBe(1);

            updateStatistics(mockGameState, 'energy_generated', { amount: 50 });
            expect(mockGameState.statistics.totalEnergyGenerated).toBe(50);

            updateStatistics(mockGameState, 'interaction_occurred', {});
            expect(mockGameState.statistics.totalInteractions).toBe(1);
        });
    });
});

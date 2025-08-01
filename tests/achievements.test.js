const TerraFlowGame = require('../src/main');

describe('Achievement System', () => {
    let game;

    beforeEach(() => {
        game = new TerraFlowGame();
    });

    afterEach(() => {
        game.stop();
    });

    describe('Achievement Tracking', () => {
        test('should track first dreamer achievement', () => {
            const state = game.getState();
            expect(state.units.dreamers).toBe(1);
            
            // Should already have first dreamer achievement
            const achievements = game.getAchievements();
            expect(achievements.firstDreamer.unlocked).toBe(true);
        });

        test('should unlock energy milestone achievement', () => {
            // Simulate reaching 100 energy
            game.gameState.setState({ energy: 100 });
            game.checkAchievements();
            
            const achievements = game.getAchievements();
            expect(achievements.energyMilestone.unlocked).toBe(true);
            expect(achievements.energyMilestone.reward).toBeDefined();
        });

        test('should track harmony master achievement', () => {
            // Simulate high harmony
            game.gameState.setState({ harmony: 90 });
            game.checkAchievements();
            
            const achievements = game.getAchievements();
            expect(achievements.harmonyMaster.unlocked).toBe(true);
        });

        test('should provide achievement rewards', () => {
            const initialState = game.getState();
            
            // Unlock achievement with energy bonus
            game.gameState.setState({ energy: 100 });
            game.checkAchievements();
            game.applyAchievementRewards();
            
            const newState = game.getState();
            expect(newState.energyMultiplier).toBeGreaterThan(1);
        });
    });

    describe('Achievement Persistence', () => {
        test('should save achievement progress', () => {
            game.gameState.setState({ energy: 100 });
            game.checkAchievements();
            
            const saveData = game.getSaveData();
            expect(saveData.achievements).toBeDefined();
            expect(saveData.achievements.energyMilestone.unlocked).toBe(true);
        });

        test('should load achievement progress', () => {
            const mockSaveData = {
                gameState: game.getState(),
                achievements: {
                    energyMilestone: { unlocked: true, timestamp: Date.now() }
                }
            };
            
            game.loadSaveData(mockSaveData);
            const achievements = game.getAchievements();
            expect(achievements.energyMilestone.unlocked).toBe(true);
        });
    });

    describe('Achievement UI Integration', () => {
        test('should display achievement notifications', () => {
            const mockNotification = jest.fn();
            game.onAchievementUnlocked = mockNotification;
            
            game.gameState.setState({ energy: 100 });
            game.checkAchievements();
            
            expect(mockNotification).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'energyMilestone',
                    title: expect.any(String),
                    description: expect.any(String)
                })
            );
        });

        test('should show achievement progress', () => {
            const progress = game.getAchievementProgress('cosmicWeaver');
            expect(progress).toHaveProperty('current');
            expect(progress).toHaveProperty('target');
            expect(progress).toHaveProperty('percentage');
        });
    });

    describe('Achievement Balance', () => {
        test('should have reasonable achievement targets', () => {
            const achievements = game.getAllAchievements();
            
            // Early game achievements should be achievable quickly
            expect(achievements.firstDreamer.target).toBeLessThanOrEqual(5);
            expect(achievements.energyMilestone.target).toBeLessThanOrEqual(100);
            
            // Late game achievements should be challenging
            expect(achievements.cosmicMaster.target).toBeGreaterThan(1000);
        });

        test('should provide meaningful rewards', () => {
            const achievements = game.getAllAchievements();
            
            Object.values(achievements).forEach(achievement => {
                expect(achievement.reward).toBeDefined();
                expect(achievement.reward.type).toMatch(/multiplier|unlock|bonus/);
                expect(achievement.reward.value).toBeGreaterThan(0);
            });
        });
    });
});

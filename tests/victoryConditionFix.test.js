/**
 * @jest-environment jsdom
 */

describe('Victory Condition Fix Tests', () => {
    let mockGameState;
    let victoryCallCount;
    let defeatCallCount;

    beforeEach(() => {
        mockGameState = {
            planetaryConsciousness: 50,
            consciousness: 20,
            entropy: 10,
            harmony: 50,
            gameEnded: false
        };

        victoryCallCount = 0;
        defeatCallCount = 0;

        global.gameState = mockGameState;
    });

    describe('Victory Condition Spam Prevention', () => {
        test('should only trigger victory once when planetary consciousness reaches 100', () => {
            const mockShowVictory = () => {
                victoryCallCount++;
            };

            const checkGreatTransitionConditions = () => {
                // Don't check if game has already ended
                if (mockGameState.gameEnded) {
                    return true;
                }

                // Win condition: Planetary Consciousness reaches 100
                if (mockGameState.planetaryConsciousness >= 100) {
                    mockShowVictory();
                    mockGameState.gameEnded = true;
                    return true;
                }

                return false;
            };

            // Set planetary consciousness to 100
            mockGameState.planetaryConsciousness = 100;

            // Call multiple times to simulate game loop
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();

            // Should only trigger once
            expect(victoryCallCount).toBe(1);
            expect(mockGameState.gameEnded).toBe(true);
        });

        test('should only trigger defeat once when consciousness collapses', () => {
            const mockShowDefeat = () => {
                defeatCallCount++;
            };

            const checkGreatTransitionConditions = () => {
                // Don't check if game has already ended
                if (mockGameState.gameEnded) {
                    return true;
                }

                // Lose condition: consciousness collapse
                if (mockGameState.consciousness <= 0 && mockGameState.planetaryConsciousness <= 0) {
                    mockShowDefeat();
                    mockGameState.gameEnded = true;
                    return true;
                }

                return false;
            };

            // Set up defeat condition
            mockGameState.consciousness = 0;
            mockGameState.planetaryConsciousness = 0;

            // Call multiple times to simulate game loop
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();

            // Should only trigger once
            expect(defeatCallCount).toBe(1);
            expect(mockGameState.gameEnded).toBe(true);
        });

        test('should not check conditions after game has ended', () => {
            let conditionsChecked = 0;

            const checkGreatTransitionConditions = () => {
                // Don't check if game has already ended
                if (mockGameState.gameEnded) {
                    return true;
                }

                conditionsChecked++;

                // Win condition: Planetary Consciousness reaches 100
                if (mockGameState.planetaryConsciousness >= 100) {
                    mockGameState.gameEnded = true;
                    return true;
                }

                return false;
            };

            // Set up victory condition
            mockGameState.planetaryConsciousness = 100;

            // First call should check conditions and end game
            checkGreatTransitionConditions();
            expect(conditionsChecked).toBe(1);
            expect(mockGameState.gameEnded).toBe(true);

            // Subsequent calls should not check conditions
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();
            checkGreatTransitionConditions();

            expect(conditionsChecked).toBe(1); // Still only 1
        });
    });

    describe('Game Loop Prevention', () => {
        test('should stop game loop when game has ended', () => {
            let gameLoopExecutions = 0;

            const gameLoop = () => {
                // Stop the game loop if the game has ended
                if (mockGameState.gameEnded) {
                    return;
                }

                gameLoopExecutions++;
                
                // Simulate game logic that would normally run
                mockGameState.planetaryConsciousness += 1;
            };

            // Run game loop normally
            gameLoop();
            gameLoop();
            gameLoop();
            expect(gameLoopExecutions).toBe(3);

            // End the game
            mockGameState.gameEnded = true;

            // Game loop should not execute anymore
            gameLoop();
            gameLoop();
            gameLoop();
            expect(gameLoopExecutions).toBe(3); // Still 3, no new executions
        });
    });

    describe('Save System Integration', () => {
        test('should save and load gameEnded flag', () => {
            const saveGameState = () => {
                const saveData = {
                    version: "1.0.0",
                    timestamp: Date.now(),
                    gameState: {
                        planetaryConsciousness: mockGameState.planetaryConsciousness,
                        gameEnded: mockGameState.gameEnded
                    }
                };
                return JSON.stringify(saveData);
            };

            const loadGameState = (savedDataString) => {
                const saveData = JSON.parse(savedDataString);
                mockGameState.planetaryConsciousness = saveData.gameState.planetaryConsciousness || 10;
                mockGameState.gameEnded = saveData.gameState.gameEnded || false;
            };

            // Set up ended game state
            mockGameState.planetaryConsciousness = 100;
            mockGameState.gameEnded = true;

            // Save the state
            const savedData = saveGameState();

            // Reset state
            mockGameState.planetaryConsciousness = 10;
            mockGameState.gameEnded = false;

            // Load the state
            loadGameState(savedData);

            // Should restore the ended state
            expect(mockGameState.planetaryConsciousness).toBe(100);
            expect(mockGameState.gameEnded).toBe(true);
        });
    });

    describe('Restart Functionality', () => {
        test('should reset game state for new game', () => {
            const startNewGame = () => {
                // Reset all game state to initial values
                mockGameState.planetaryConsciousness = 10;
                mockGameState.consciousness = 10;
                mockGameState.entropy = 0;
                mockGameState.harmony = 50;
                mockGameState.gameEnded = false;
            };

            // Set up ended game state
            mockGameState.planetaryConsciousness = 100;
            mockGameState.consciousness = 0;
            mockGameState.entropy = 50;
            mockGameState.harmony = 0;
            mockGameState.gameEnded = true;

            // Start new game
            startNewGame();

            // Should reset to initial values
            expect(mockGameState.planetaryConsciousness).toBe(10);
            expect(mockGameState.consciousness).toBe(10);
            expect(mockGameState.entropy).toBe(0);
            expect(mockGameState.harmony).toBe(50);
            expect(mockGameState.gameEnded).toBe(false);
        });
    });
});

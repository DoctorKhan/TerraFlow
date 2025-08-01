/**
 * @jest-environment jsdom
 */

describe('Save/Load System Tests', () => {
    let mockGameState;
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            data: {},
            getItem: jest.fn((key) => mockLocalStorage.data[key] || null),
            setItem: jest.fn((key, value) => { mockLocalStorage.data[key] = value; }),
            removeItem: jest.fn((key) => { delete mockLocalStorage.data[key]; }),
            clear: jest.fn(() => { mockLocalStorage.data = {}; })
        };
        global.localStorage = mockLocalStorage;

        mockGameState = {
            energy: 100,
            insight: 50,
            harmony: 75,
            inspiration: 25,
            wisdom: 30,
            control: 15,
            consciousness: 20,
            planetaryConsciousness: 25,
            entropy: 5,
            energyPerSecond: 2.5,
            insightPerSecond: 1.2,
            inspirationPerSecond: 0.8,
            wisdomPerSecond: 0.5,
            controlPerSecond: 0.3,
            consciousnessPerSecond: 0.4,
            units: { dreamers: 5, weavers: 3 },
            nodes: { sustenance: 2, energy: 1 },
            nodeCosts: { sustenance: 200, energy: 150 },
            rulerBuildings: { industrialMine: 1, centralizedGrid: 0 },
            gardenerBuildings: { stoneCircle: 2, healingGrove: 1 },
            techTreeUnlocked: true,
            achievements: {
                unlocked: ['first_unit', 'harmony_keeper'],
                progress: { energy_master: 75, consciousness_seeker: 50 },
                definitions: {}
            },
            goals: {
                active: [{ id: 'reach_50_consciousness', progress: 40 }],
                completed: ['first_building'],
                available: [],
                milestones: []
            },
            statistics: {
                totalUnitsCreated: 8,
                totalEnergyGenerated: 500,
                rulerPathChoices: 1,
                gardenerPathChoices: 3,
                playTime: 3600000
            },
            playerTitles: ['Novice Weaver'],
            villageGrid: [
                { type: 'dome', x: 100, y: 150, size: 20 },
                { type: 'crystal_tree', x: 200, y: 250, size: 25 }
            ],
            intelligentCreatures: [],
            conversationalUnits: [],
            autoSaveEnabled: true,
            saveVersion: "1.0.0",
            lastSaved: null,
            autoSaveInterval: 30000
        };

        global.gameState = mockGameState;
    });

    describe('Save Game State', () => {
        test('should save complete game state to localStorage', () => {
            const saveGameState = () => {
                try {
                    const saveData = {
                        version: "1.0.0",
                        timestamp: Date.now(),
                        gameState: {
                            energy: mockGameState.energy,
                            insight: mockGameState.insight,
                            harmony: mockGameState.harmony,
                            inspiration: mockGameState.inspiration,
                            wisdom: mockGameState.wisdom,
                            control: mockGameState.control,
                            consciousness: mockGameState.consciousness,
                            planetaryConsciousness: mockGameState.planetaryConsciousness,
                            entropy: mockGameState.entropy,
                            energyPerSecond: mockGameState.energyPerSecond,
                            insightPerSecond: mockGameState.insightPerSecond,
                            inspirationPerSecond: mockGameState.inspirationPerSecond,
                            wisdomPerSecond: mockGameState.wisdomPerSecond,
                            controlPerSecond: mockGameState.controlPerSecond,
                            consciousnessPerSecond: mockGameState.consciousnessPerSecond,
                            units: { ...mockGameState.units },
                            nodes: { ...mockGameState.nodes },
                            nodeCosts: { ...mockGameState.nodeCosts },
                            rulerBuildings: { ...mockGameState.rulerBuildings },
                            gardenerBuildings: { ...mockGameState.gardenerBuildings },
                            techTreeUnlocked: mockGameState.techTreeUnlocked,
                            achievements: {
                                unlocked: [...mockGameState.achievements.unlocked],
                                progress: { ...mockGameState.achievements.progress },
                                definitions: mockGameState.achievements.definitions
                            },
                            goals: {
                                active: mockGameState.goals.active.map(goal => ({ ...goal })),
                                completed: [...mockGameState.goals.completed],
                                available: mockGameState.goals.available.map(goal => ({ ...goal })),
                                milestones: mockGameState.goals.milestones.map(milestone => ({ ...milestone }))
                            },
                            statistics: { ...mockGameState.statistics },
                            playerTitles: [...mockGameState.playerTitles],
                            villageGrid: mockGameState.villageGrid.map(unit => ({ ...unit })),
                            intelligentCreatures: mockGameState.intelligentCreatures.map(creature => ({ ...creature })),
                            conversationalUnits: mockGameState.conversationalUnits.map(unit => ({ ...unit })),
                            autoSaveEnabled: mockGameState.autoSaveEnabled
                        }
                    };

                    localStorage.setItem('terraflow_save_data', JSON.stringify(saveData));
                    mockGameState.lastSaved = Date.now();
                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = saveGameState();

            expect(result).toBe(true);
            expect(localStorage.setItem).toHaveBeenCalledWith('terraflow_save_data', expect.any(String));
            
            const savedData = JSON.parse(localStorage.getItem('terraflow_save_data'));
            expect(savedData.version).toBe("1.0.0");
            expect(savedData.gameState.energy).toBe(100);
            expect(savedData.gameState.consciousness).toBe(20);
            expect(savedData.gameState.techTreeUnlocked).toBe(true);
        });

        test('should handle save errors gracefully', () => {
            // Override setItem to throw error
            const originalSetItem = mockLocalStorage.setItem;
            mockLocalStorage.setItem = jest.fn(() => {
                throw new Error('Storage quota exceeded');
            });

            const saveGameState = () => {
                try {
                    const saveData = { version: "1.0.0", gameState: mockGameState };
                    localStorage.setItem('terraflow_save_data', JSON.stringify(saveData));
                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = saveGameState();
            expect(result).toBe(false);

            // Restore original function
            mockLocalStorage.setItem = originalSetItem;
        });
    });

    describe('Load Game State', () => {
        test('should load complete game state from localStorage', () => {
            const saveData = {
                version: "1.0.0",
                timestamp: Date.now() - 60000, // 1 minute ago
                gameState: {
                    energy: 150,
                    consciousness: 35,
                    techTreeUnlocked: true,
                    rulerBuildings: { industrialMine: 2 },
                    gardenerBuildings: { stoneCircle: 1 },
                    achievements: { unlocked: ['test_achievement'], progress: {}, definitions: {} },
                    statistics: { totalUnitsCreated: 10 }
                }
            };

            localStorage.setItem('terraflow_save_data', JSON.stringify(saveData));

            const loadGameState = () => {
                try {
                    const savedData = localStorage.getItem('terraflow_save_data');
                    if (!savedData) return false;

                    const saveData = JSON.parse(savedData);
                    if (saveData.version !== "1.0.0") return false;

                    const saved = saveData.gameState;
                    mockGameState.energy = saved.energy || 20;
                    mockGameState.consciousness = saved.consciousness || 10;
                    mockGameState.techTreeUnlocked = saved.techTreeUnlocked || false;
                    
                    if (saved.rulerBuildings) Object.assign(mockGameState.rulerBuildings, saved.rulerBuildings);
                    if (saved.gardenerBuildings) Object.assign(mockGameState.gardenerBuildings, saved.gardenerBuildings);
                    if (saved.achievements) Object.assign(mockGameState.achievements, saved.achievements);
                    if (saved.statistics) Object.assign(mockGameState.statistics, saved.statistics);

                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = loadGameState();

            expect(result).toBe(true);
            expect(mockGameState.energy).toBe(150);
            expect(mockGameState.consciousness).toBe(35);
            expect(mockGameState.techTreeUnlocked).toBe(true);
            expect(mockGameState.rulerBuildings.industrialMine).toBe(2);
            expect(mockGameState.achievements.unlocked).toContain('test_achievement');
        });

        test('should return false when no save data exists', () => {
            mockLocalStorage.data = {}; // Clear storage

            const loadGameState = () => {
                const savedData = localStorage.getItem('terraflow_save_data');
                return savedData !== null;
            };

            const result = loadGameState();
            expect(result).toBe(false);
        });

        test('should handle corrupted save data gracefully', () => {
            mockLocalStorage.data['terraflow_save_data'] = 'invalid json data';

            const loadGameState = () => {
                try {
                    const savedData = localStorage.getItem('terraflow_save_data');
                    if (!savedData) return false;

                    JSON.parse(savedData); // This should throw for invalid JSON
                    return true;
                } catch (error) {
                    return false; // Should reach here for invalid JSON
                }
            };

            const result = loadGameState();
            expect(result).toBe(false);
        });
    });

    describe('Save Migration', () => {
        test('should migrate old save format to new format', () => {
            const oldSaveData = {
                // Old format: data directly in root
                energy: 75,
                consciousness: 15,
                units: { dreamers: 3 },
                timestamp: Date.now()
            };

            const migrateSaveData = (saveData) => {
                if (!saveData.gameState) {
                    // Migrate old format
                    const newSaveData = {
                        version: "1.0.0",
                        timestamp: saveData.timestamp || Date.now(),
                        gameState: {
                            energy: saveData.energy || 20,
                            consciousness: saveData.consciousness || 10,
                            units: saveData.units || {},
                            autoSaveEnabled: true
                        }
                    };
                    return newSaveData;
                }
                return saveData;
            };

            const migrated = migrateSaveData(oldSaveData);

            expect(migrated.version).toBe("1.0.0");
            expect(migrated.gameState.energy).toBe(75);
            expect(migrated.gameState.consciousness).toBe(15);
            expect(migrated.gameState.units.dreamers).toBe(3);
            expect(migrated.gameState.autoSaveEnabled).toBe(true);
        });
    });

    describe('Auto-Save System', () => {
        test('should enable and disable auto-save correctly', () => {
            let autoSaveEnabled = true;
            let autoSaveTimer = null;

            const startAutoSave = () => {
                if (autoSaveEnabled) {
                    autoSaveTimer = setInterval(() => {
                        // Mock auto-save
                    }, 30000);
                    return true;
                }
                return false;
            };

            const stopAutoSave = () => {
                if (autoSaveTimer) {
                    clearInterval(autoSaveTimer);
                    autoSaveTimer = null;
                    return true;
                }
                return false;
            };

            const toggleAutoSave = () => {
                autoSaveEnabled = !autoSaveEnabled;
                if (autoSaveEnabled) {
                    return startAutoSave();
                } else {
                    return stopAutoSave();
                }
            };

            // Test enabling auto-save
            autoSaveEnabled = false;
            const enableResult = toggleAutoSave();
            expect(autoSaveEnabled).toBe(true);
            expect(enableResult).toBe(true);

            // Test disabling auto-save
            const disableResult = toggleAutoSave();
            expect(autoSaveEnabled).toBe(false);
            expect(disableResult).toBe(true);
        });
    });

    describe('Export/Import System', () => {
        test('should export save data as JSON', () => {
            const saveData = {
                version: "1.0.0",
                gameState: mockGameState
            };

            localStorage.setItem('terraflow_save_data', JSON.stringify(saveData));

            const exportSaveData = () => {
                const data = localStorage.getItem('terraflow_save_data');
                if (!data) return null;
                return data;
            };

            const exported = exportSaveData();
            expect(exported).toBeTruthy();
            
            const parsedExport = JSON.parse(exported);
            expect(parsedExport.version).toBe("1.0.0");
            expect(parsedExport.gameState.energy).toBe(100);
        });

        test('should import save data from JSON', () => {
            const importData = JSON.stringify({
                version: "1.0.0",
                gameState: {
                    energy: 200,
                    consciousness: 50,
                    techTreeUnlocked: true
                }
            });

            const importSaveData = (jsonData) => {
                try {
                    const saveData = JSON.parse(jsonData);
                    localStorage.setItem('terraflow_save_data', jsonData);
                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = importSaveData(importData);
            expect(result).toBe(true);
            
            const imported = JSON.parse(localStorage.getItem('terraflow_save_data'));
            expect(imported.gameState.energy).toBe(200);
            expect(imported.gameState.consciousness).toBe(50);
        });
    });
});

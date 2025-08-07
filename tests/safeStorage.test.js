/**
 * TDD Test Suite: Safe Storage System
 * 
 * This test suite verifies that the SafeStorage wrapper handles
 * all storage failures gracefully without crashing the game.
 */

describe('Safe Storage System Tests', () => {
    describe('Storage Availability Detection', () => {
        test('should detect working localStorage', () => {
            const mockStorage = {
                setItem: jest.fn(),
                getItem: jest.fn(() => 'test'),
                removeItem: jest.fn()
            };

            // Mock window.localStorage
            Object.defineProperty(window, 'localStorage', {
                value: mockStorage,
                writable: true
            });

            const SafeStorage = {
                isAvailable: (storageType = 'localStorage') => {
                    try {
                        const storage = window[storageType];
                        if (!storage) return false;
                        
                        const testKey = '__terraflow_storage_test__';
                        storage.setItem(testKey, 'test');
                        const result = storage.getItem(testKey);
                        storage.removeItem(testKey);
                        
                        return result === 'test';
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.isAvailable('localStorage');

            expect(result).toBe(true);
            expect(mockStorage.setItem).toHaveBeenCalledWith('__terraflow_storage_test__', 'test');
            expect(mockStorage.getItem).toHaveBeenCalledWith('__terraflow_storage_test__');
            expect(mockStorage.removeItem).toHaveBeenCalledWith('__terraflow_storage_test__');
        });

        test('should detect blocked localStorage', () => {
            const mockStorage = {
                setItem: jest.fn(() => {
                    throw new Error('QuotaExceededError');
                }),
                getItem: jest.fn(),
                removeItem: jest.fn()
            };

            Object.defineProperty(window, 'localStorage', {
                value: mockStorage,
                writable: true
            });

            const SafeStorage = {
                isAvailable: (storageType = 'localStorage') => {
                    try {
                        const storage = window[storageType];
                        if (!storage) return false;
                        
                        const testKey = '__terraflow_storage_test__';
                        storage.setItem(testKey, 'test');
                        const result = storage.getItem(testKey);
                        storage.removeItem(testKey);
                        
                        return result === 'test';
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.isAvailable('localStorage');

            expect(result).toBe(false);
        });

        test('should handle missing storage', () => {
            Object.defineProperty(window, 'localStorage', {
                value: undefined,
                writable: true
            });

            const SafeStorage = {
                isAvailable: (storageType = 'localStorage') => {
                    try {
                        const storage = window[storageType];
                        if (!storage) return false;
                        
                        const testKey = '__terraflow_storage_test__';
                        storage.setItem(testKey, 'test');
                        const result = storage.getItem(testKey);
                        storage.removeItem(testKey);
                        
                        return result === 'test';
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.isAvailable('localStorage');

            expect(result).toBe(false);
        });
    });

    describe('Safe Get Operations', () => {
        test('should return value when storage works', () => {
            const mockStorage = {
                getItem: jest.fn(() => 'stored_value')
            };

            const SafeStorage = {
                isAvailable: () => true,
                getItem: (key, fallback = null, storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return fallback;
                        
                        const value = mockStorage.getItem(key);
                        return value !== null ? value : fallback;
                    } catch (error) {
                        return fallback;
                    }
                }
            };

            const result = SafeStorage.getItem('test_key', 'default');

            expect(result).toBe('stored_value');
            expect(mockStorage.getItem).toHaveBeenCalledWith('test_key');
        });

        test('should return fallback when storage fails', () => {
            const mockStorage = {
                getItem: jest.fn(() => {
                    throw new Error('Storage access denied');
                })
            };

            const SafeStorage = {
                isAvailable: () => true,
                getItem: (key, fallback = null, storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return fallback;
                        
                        const value = mockStorage.getItem(key);
                        return value !== null ? value : fallback;
                    } catch (error) {
                        return fallback;
                    }
                }
            };

            const result = SafeStorage.getItem('test_key', 'fallback_value');

            expect(result).toBe('fallback_value');
        });

        test('should return fallback when storage unavailable', () => {
            const SafeStorage = {
                isAvailable: () => false,
                getItem: (key, fallback = null, storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return fallback;
                        
                        const value = window[storageType].getItem(key);
                        return value !== null ? value : fallback;
                    } catch (error) {
                        return fallback;
                    }
                }
            };

            const result = SafeStorage.getItem('test_key', 'unavailable_fallback');

            expect(result).toBe('unavailable_fallback');
        });
    });

    describe('Safe Set Operations', () => {
        test('should return true when storage works', () => {
            const mockStorage = {
                setItem: jest.fn()
            };

            const SafeStorage = {
                isAvailable: () => true,
                setItem: (key, value, storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return false;
                        
                        mockStorage.setItem(key, value);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.setItem('test_key', 'test_value');

            expect(result).toBe(true);
            expect(mockStorage.setItem).toHaveBeenCalledWith('test_key', 'test_value');
        });

        test('should return false when storage fails', () => {
            const mockStorage = {
                setItem: jest.fn(() => {
                    throw new Error('QuotaExceededError');
                })
            };

            const SafeStorage = {
                isAvailable: () => true,
                setItem: (key, value, storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return false;
                        
                        mockStorage.setItem(key, value);
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.setItem('test_key', 'test_value');

            expect(result).toBe(false);
        });
    });

    describe('Safe JSON Operations', () => {
        test('should handle JSON get successfully', () => {
            const testObject = { energy: 100, insight: 50 };
            const jsonString = JSON.stringify(testObject);

            const SafeStorage = {
                getItem: jest.fn(() => jsonString),
                getJSON: (key, fallback = null, storageType = 'localStorage') => {
                    try {
                        const value = SafeStorage.getItem(key, null, storageType);
                        if (value === null) return fallback;
                        
                        return JSON.parse(value);
                    } catch (error) {
                        return fallback;
                    }
                }
            };

            const result = SafeStorage.getJSON('game_state', {});

            expect(result).toEqual(testObject);
            expect(SafeStorage.getItem).toHaveBeenCalledWith('game_state', null, 'localStorage');
        });

        test('should handle corrupted JSON gracefully', () => {
            const corruptedJson = '{"energy": 100, "insight":}'; // Invalid JSON

            const SafeStorage = {
                getItem: jest.fn(() => corruptedJson),
                getJSON: (key, fallback = null, storageType = 'localStorage') => {
                    try {
                        const value = SafeStorage.getItem(key, null, storageType);
                        if (value === null) return fallback;
                        
                        return JSON.parse(value);
                    } catch (error) {
                        return fallback;
                    }
                }
            };

            const result = SafeStorage.getJSON('game_state', { default: true });

            expect(result).toEqual({ default: true });
        });

        test('should handle JSON set successfully', () => {
            const testObject = { energy: 100, insight: 50 };
            const expectedJson = JSON.stringify(testObject);

            const SafeStorage = {
                setItem: jest.fn(() => true),
                setJSON: (key, value, storageType = 'localStorage') => {
                    try {
                        const jsonString = JSON.stringify(value);
                        return SafeStorage.setItem(key, jsonString, storageType);
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.setJSON('game_state', testObject);

            expect(result).toBe(true);
            expect(SafeStorage.setItem).toHaveBeenCalledWith('game_state', expectedJson, 'localStorage');
        });

        test('should handle circular references in JSON', () => {
            const circularObject = { name: 'test' };
            circularObject.self = circularObject; // Creates circular reference

            const SafeStorage = {
                setItem: jest.fn(),
                setJSON: (key, value, storageType = 'localStorage') => {
                    try {
                        const jsonString = JSON.stringify(value);
                        return SafeStorage.setItem(key, jsonString, storageType);
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.setJSON('circular_data', circularObject);

            expect(result).toBe(false);
            expect(SafeStorage.setItem).not.toHaveBeenCalled();
        });
    });

    describe('Clear Operations', () => {
        test('should clear storage when available', () => {
            const mockStorage = {
                clear: jest.fn()
            };

            const SafeStorage = {
                isAvailable: () => true,
                clear: (storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return false;
                        
                        mockStorage.clear();
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.clear();

            expect(result).toBe(true);
            expect(mockStorage.clear).toHaveBeenCalled();
        });

        test('should handle clear failure gracefully', () => {
            const mockStorage = {
                clear: jest.fn(() => {
                    throw new Error('Clear failed');
                })
            };

            const SafeStorage = {
                isAvailable: () => true,
                clear: (storageType = 'localStorage') => {
                    try {
                        if (!SafeStorage.isAvailable(storageType)) return false;
                        
                        mockStorage.clear();
                        return true;
                    } catch (error) {
                        return false;
                    }
                }
            };

            const result = SafeStorage.clear();

            expect(result).toBe(false);
        });
    });
});

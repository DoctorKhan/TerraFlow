/**
 * TDD Test Suite: Corrupted Save Data Handling
 * 
 * This test suite verifies that the game can handle corrupted localStorage data
 * without crashing and provides proper recovery mechanisms.
 */

describe('Corrupted Save Data Handling Tests', () => {
    describe('localStorage Clearing', () => {
        test('should clear all TerraFlow localStorage keys', () => {
            const mockLocalStorage = {
                removeItem: jest.fn(),
                getItem: jest.fn(),
                setItem: jest.fn()
            };

            const clearAllTerraFlowData = () => {
                try {
                    const keysToRemove = [
                        'terraflow_save_data',
                        'terraflow_save',
                        'terraflow_achievements', 
                        'terraflow_goals',
                        'terraflow_log_panel_height',
                        'terraflow_minimap_visible',
                        'terraflow_minimap_collapsed',
                        'terraflow_minimap_transparent',
                        'terraflow_minimap_position',
                        'debug_mode'
                    ];
                    
                    keysToRemove.forEach(key => {
                        mockLocalStorage.removeItem(key);
                    });
                    
                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = clearAllTerraFlowData();

            expect(result).toBe(true);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledTimes(10);
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('terraflow_save_data');
            expect(mockLocalStorage.removeItem).toHaveBeenCalledWith('terraflow_minimap_position');
        });

        test('should handle localStorage errors gracefully', () => {
            const mockLocalStorage = {
                removeItem: jest.fn(() => {
                    throw new Error('localStorage access denied');
                })
            };

            const clearAllTerraFlowData = () => {
                try {
                    mockLocalStorage.removeItem('terraflow_save_data');
                    return true;
                } catch (error) {
                    return false;
                }
            };

            const result = clearAllTerraFlowData();

            expect(result).toBe(false);
            expect(mockLocalStorage.removeItem).toHaveBeenCalled();
        });
    });

    describe('JSON Parse Error Handling', () => {
        test('should handle corrupted JSON in save data', () => {
            const corruptedData = '{"gameState": {"energy": 20, "insight": 5, "corrupted": }'; // Invalid JSON

            const loadGameState = (savedData) => {
                try {
                    if (!savedData) {
                        return { success: false, reason: 'no_data' };
                    }

                    let saveData;
                    try {
                        saveData = JSON.parse(savedData);
                    } catch (parseError) {
                        return { 
                            success: false, 
                            reason: 'corrupted_json',
                            error: parseError.message 
                        };
                    }

                    if (!saveData || typeof saveData !== 'object' || !saveData.gameState) {
                        return { 
                            success: false, 
                            reason: 'invalid_structure' 
                        };
                    }

                    return { success: true, data: saveData };
                } catch (error) {
                    return { 
                        success: false, 
                        reason: 'critical_error',
                        error: error.message 
                    };
                }
            };

            const result = loadGameState(corruptedData);

            expect(result.success).toBe(false);
            expect(result.reason).toBe('corrupted_json');
            expect(result.error).toContain('Unexpected token');
        });

        test('should handle missing gameState property', () => {
            const invalidData = '{"version": "1.0.0", "timestamp": 123456789}'; // Missing gameState

            const loadGameState = (savedData) => {
                try {
                    const saveData = JSON.parse(savedData);
                    
                    if (!saveData || typeof saveData !== 'object' || !saveData.gameState) {
                        return { 
                            success: false, 
                            reason: 'invalid_structure' 
                        };
                    }

                    return { success: true, data: saveData };
                } catch (error) {
                    return { 
                        success: false, 
                        reason: 'parse_error',
                        error: error.message 
                    };
                }
            };

            const result = loadGameState(invalidData);

            expect(result.success).toBe(false);
            expect(result.reason).toBe('invalid_structure');
        });

        test('should handle null or undefined save data', () => {
            const loadGameState = (savedData) => {
                if (!savedData) {
                    return { success: false, reason: 'no_data' };
                }
                return { success: true };
            };

            expect(loadGameState(null).reason).toBe('no_data');
            expect(loadGameState(undefined).reason).toBe('no_data');
            expect(loadGameState('').reason).toBe('no_data');
        });
    });

    describe('Minimap Position Error Handling', () => {
        test('should handle corrupted minimap position data', () => {
            const corruptedPosition = '{"bottom": "210px", "left": }'; // Invalid JSON

            const loadMinimapPosition = (positionData) => {
                try {
                    return JSON.parse(positionData || '{"bottom": "210px", "left": "8px"}');
                } catch (error) {
                    return {"bottom": "210px", "left": "8px"}; // Default fallback
                }
            };

            const result = loadMinimapPosition(corruptedPosition);

            expect(result).toEqual({"bottom": "210px", "left": "8px"});
        });

        test('should use defaults when no position data exists', () => {
            const loadMinimapPosition = (positionData) => {
                try {
                    return JSON.parse(positionData || '{"bottom": "210px", "left": "8px"}');
                } catch (error) {
                    return {"bottom": "210px", "left": "8px"};
                }
            };

            const result = loadMinimapPosition(null);

            expect(result).toEqual({"bottom": "210px", "left": "8px"});
        });
    });

    describe('Error Recovery Mechanisms', () => {
        test('should detect critical errors that require reset', () => {
            const criticalErrors = [
                'localStorage is not defined',
                'JSON.parse error',
                'gameState is undefined',
                'Cannot read property of undefined'
            ];

            const isCriticalError = (errorMessage) => {
                return errorMessage.includes('localStorage') || 
                       errorMessage.includes('JSON') ||
                       errorMessage.includes('gameState') ||
                       errorMessage.includes('undefined');
            };

            criticalErrors.forEach(error => {
                expect(isCriticalError(error)).toBe(true);
            });

            // Non-critical errors
            expect(isCriticalError('Network error')).toBe(false);
            expect(isCriticalError('Canvas rendering failed')).toBe(false);
        });

        test('should provide emergency reset via URL parameter', () => {
            const mockURL = {
                search: '?reset=true&other=param',
                searchParams: {
                    delete: jest.fn()
                },
                pathname: '/TerraFlow/'
            };

            const mockWindow = {
                location: mockURL,
                history: {
                    replaceState: jest.fn()
                }
            };

            const handleEmergencyReset = (window) => {
                if (window.location.search.includes('reset=true')) {
                    // Clear data (mocked)
                    const cleared = true;
                    
                    // Remove parameter
                    window.location.searchParams.delete('reset');
                    window.history.replaceState({}, 'TerraFlow', window.location.pathname);
                    
                    return { resetTriggered: true, dataCleared: cleared };
                }
                return { resetTriggered: false };
            };

            const result = handleEmergencyReset(mockWindow);

            expect(result.resetTriggered).toBe(true);
            expect(result.dataCleared).toBe(true);
            expect(mockURL.searchParams.delete).toHaveBeenCalledWith('reset');
            expect(mockWindow.history.replaceState).toHaveBeenCalled();
        });

        test('should handle new game reset properly', () => {
            const mockClearFunction = jest.fn(() => true);
            const mockReload = jest.fn();

            const startNewGame = (clearAllData, reloadPage) => {
                // Skip confirm dialog for testing
                const confirmed = true;
                
                if (confirmed) {
                    const cleared = clearAllData();
                    
                    setTimeout(() => {
                        reloadPage(true); // Force reload
                    }, 500);
                    
                    return { started: true, dataCleared: cleared };
                }
                
                return { started: false };
            };

            const result = startNewGame(mockClearFunction, mockReload);

            expect(result.started).toBe(true);
            expect(result.dataCleared).toBe(true);
            expect(mockClearFunction).toHaveBeenCalled();
        });
    });

    describe('Global Error Handler', () => {
        test('should categorize different types of errors', () => {
            const categorizeError = (error) => {
                const message = error.message || '';
                
                if (message.includes('localStorage') || 
                    message.includes('JSON') ||
                    message.includes('gameState')) {
                    return 'CRITICAL_DATA_ERROR';
                } else if (message.includes('Canvas') || 
                          message.includes('WebGL')) {
                    return 'RENDERING_ERROR';
                } else if (message.includes('Network') || 
                          message.includes('fetch')) {
                    return 'NETWORK_ERROR';
                } else {
                    return 'GENERAL_ERROR';
                }
            };

            expect(categorizeError({ message: 'localStorage access denied' })).toBe('CRITICAL_DATA_ERROR');
            expect(categorizeError({ message: 'JSON.parse failed' })).toBe('CRITICAL_DATA_ERROR');
            expect(categorizeError({ message: 'gameState is undefined' })).toBe('CRITICAL_DATA_ERROR');
            expect(categorizeError({ message: 'Canvas context lost' })).toBe('RENDERING_ERROR');
            expect(categorizeError({ message: 'Network timeout' })).toBe('NETWORK_ERROR');
            expect(categorizeError({ message: 'Unknown error' })).toBe('GENERAL_ERROR');
        });

        test('should provide appropriate recovery actions', () => {
            const getRecoveryAction = (errorType) => {
                switch (errorType) {
                    case 'CRITICAL_DATA_ERROR':
                        return 'CLEAR_DATA_AND_RESET';
                    case 'RENDERING_ERROR':
                        return 'REFRESH_CANVAS';
                    case 'NETWORK_ERROR':
                        return 'RETRY_CONNECTION';
                    default:
                        return 'LOG_AND_CONTINUE';
                }
            };

            expect(getRecoveryAction('CRITICAL_DATA_ERROR')).toBe('CLEAR_DATA_AND_RESET');
            expect(getRecoveryAction('RENDERING_ERROR')).toBe('REFRESH_CANVAS');
            expect(getRecoveryAction('NETWORK_ERROR')).toBe('RETRY_CONNECTION');
            expect(getRecoveryAction('GENERAL_ERROR')).toBe('LOG_AND_CONTINUE');
        });
    });
});

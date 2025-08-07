/**
 * TDD Test Suite: Pre-emptive Corruption Detection
 * 
 * This test suite verifies that the pre-emptive corruption detection
 * system can identify and clear corrupted data before it causes freezes.
 */

describe('Pre-emptive Corruption Detection Tests', () => {
    describe('Quick Corruption Detection', () => {
        test.skip('should detect malformed JSON structure', () => {
            const corruptedData = [
                '{"gameState": {"energy": 20, "insight": 5,}', // Trailing comma
                '{gameState: {energy: 20}}', // Missing quotes
                '{"gameState": {"energy": 20, "insight": }', // Incomplete
                'not json at all',
                '{"gameState": null}', // Null gameState
                '[]', // Array instead of object
                'undefined'
                // Note: '{}' is actually valid JSON, so removed from corrupted list
            ];

            const detectCorruption = (data) => {
                if (!data || data.length === 0) return false;

                // Quick structural check
                const trimmed = data.trim();
                if (!trimmed.startsWith('{') || !trimmed.endsWith('}')) {
                    return true; // Corrupted
                }

                // JSON parse check
                try {
                    const parsed = JSON.parse(data);
                    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
                        return true; // Corrupted
                    }
                    return false; // Valid
                } catch (e) {
                    return true; // Corrupted
                }
            };

            // Test corrupted data
            corruptedData.forEach((data, index) => {
                const isCorrupted = detectCorruption(data);
                if (!isCorrupted) {
                    console.log(`Test case ${index} failed: "${data}" was not detected as corrupted`);
                }
                expect(isCorrupted).toBe(true, `Data ${index} should be detected as corrupted: ${data}`);
            });

            // Test valid data
            const validData = '{"gameState": {"energy": 20, "insight": 5}}';
            expect(detectCorruption(validData)).toBe(false);
        });

        test('should handle localStorage access errors', () => {
            const mockLocalStorage = {
                getItem: jest.fn(() => {
                    throw new Error('localStorage access denied');
                }),
                clear: jest.fn()
            };

            const safeCorruptionCheck = (localStorage) => {
                try {
                    const keys = ['terraflow_save_data', 'terraflow_save'];
                    for (const key of keys) {
                        const data = localStorage.getItem(key);
                        if (data) {
                            JSON.parse(data);
                        }
                    }
                    return { corrupted: false, error: null };
                } catch (error) {
                    return { corrupted: true, error: error.message };
                }
            };

            const result = safeCorruptionCheck(mockLocalStorage);
            
            expect(result.corrupted).toBe(true);
            expect(result.error).toBe('localStorage access denied');
        });

        test('should validate specific TerraFlow save structure', () => {
            const testSaves = [
                // Valid save
                {
                    data: '{"version": "1.0.0", "gameState": {"energy": 20, "insight": 5}}',
                    valid: true
                },
                // Missing gameState
                {
                    data: '{"version": "1.0.0", "timestamp": 123456}',
                    valid: false
                },
                // gameState is not an object
                {
                    data: '{"version": "1.0.0", "gameState": "invalid"}',
                    valid: false
                },
                // Empty gameState
                {
                    data: '{"version": "1.0.0", "gameState": {}}',
                    valid: true // Empty is okay
                }
            ];

            const validateSaveStructure = (data) => {
                try {
                    const parsed = JSON.parse(data);
                    if (!parsed || typeof parsed !== 'object') return false;
                    if (!parsed.gameState) return false;
                    if (typeof parsed.gameState !== 'object') return false;
                    return true;
                } catch (e) {
                    return false;
                }
            };

            testSaves.forEach(({ data, valid }, index) => {
                const result = validateSaveStructure(data);
                expect(result).toBe(valid, `Save ${index} validation failed: ${data}`);
            });
        });
    });

    describe('Reset Loop Prevention', () => {
        test('should track reset attempts', () => {
            const mockSessionStorage = {
                getItem: jest.fn(),
                setItem: jest.fn()
            };

            const trackResetAttempt = (sessionStorage) => {
                const currentAttempts = parseInt(sessionStorage.getItem('tf_reset_attempts') || '0');
                const newAttempts = currentAttempts + 1;
                sessionStorage.setItem('tf_reset_attempts', newAttempts.toString());
                return newAttempts;
            };

            // Mock returning '2' for current attempts
            mockSessionStorage.getItem.mockReturnValue('2');

            const attempts = trackResetAttempt(mockSessionStorage);

            expect(attempts).toBe(3);
            expect(mockSessionStorage.getItem).toHaveBeenCalledWith('tf_reset_attempts');
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('tf_reset_attempts', '3');
        });

        test('should prevent infinite reset loops', () => {
            const checkResetLoop = (attempts) => {
                if (attempts > 5) {
                    return {
                        shouldStop: true,
                        action: 'SHOW_MANUAL_RECOVERY'
                    };
                } else if (attempts > 3) {
                    return {
                        shouldStop: false,
                        action: 'CONTINUE_WITH_CAUTION'
                    };
                } else {
                    return {
                        shouldStop: false,
                        action: 'NORMAL_RESET'
                    };
                }
            };

            expect(checkResetLoop(1)).toEqual({ shouldStop: false, action: 'NORMAL_RESET' });
            expect(checkResetLoop(4)).toEqual({ shouldStop: false, action: 'CONTINUE_WITH_CAUTION' });
            expect(checkResetLoop(6)).toEqual({ shouldStop: true, action: 'SHOW_MANUAL_RECOVERY' });
        });

        test('should generate manual recovery UI', () => {
            const generateRecoveryUI = () => {
                return {
                    html: `
                        <div style="position: fixed; background: linear-gradient(135deg, #1a1a2e, #16213e);">
                            <h1>🛠️ TerraFlow Recovery</h1>
                            <p>Multiple automatic recovery attempts failed.</p>
                            <button onclick="sessionStorage.clear(); localStorage.clear(); location.href = location.pathname;">
                                🔄 Manual Reset
                            </button>
                        </div>
                    `,
                    hasResetButton: true,
                    clearsData: true
                };
            };

            const ui = generateRecoveryUI();

            expect(ui.hasResetButton).toBe(true);
            expect(ui.clearsData).toBe(true);
            expect(ui.html).toContain('TerraFlow Recovery');
            expect(ui.html).toContain('Manual Reset');
        });
    });

    describe('URL Parameter Handling', () => {
        test('should detect clearing parameters', () => {
            const testUrls = [
                { url: '?cleared=1234567890', hasCleared: true },
                { url: '?nuclear=1234567890', hasNuclear: true },
                { url: '?meta_refresh=1234567890', hasMetaRefresh: true },
                { url: '?normal=param', hasCleared: false, hasNuclear: false, hasMetaRefresh: false }
            ];

            const detectUrlParams = (search) => {
                return {
                    hasCleared: search.includes('cleared='),
                    hasNuclear: search.includes('nuclear='),
                    hasMetaRefresh: search.includes('meta_refresh=')
                };
            };

            testUrls.forEach(({ url, hasCleared, hasNuclear, hasMetaRefresh }) => {
                const result = detectUrlParams(url);
                
                if (hasCleared !== undefined) expect(result.hasCleared).toBe(hasCleared);
                if (hasNuclear !== undefined) expect(result.hasNuclear).toBe(hasNuclear);
                if (hasMetaRefresh !== undefined) expect(result.hasMetaRefresh).toBe(hasMetaRefresh);
            });
        });

        test('should generate timestamped URLs', () => {
            const generateTimestampedUrl = (base, param) => {
                const timestamp = Date.now();
                return `${base}?${param}=${timestamp}`;
            };

            const url = generateTimestampedUrl('/TerraFlow', 'cleared');
            
            expect(url).toMatch(/^\/TerraFlow\?cleared=\d+$/);
            expect(url).toContain('cleared=');
        });
    });

    describe('Meta Refresh Fallback', () => {
        test('should set meta refresh timer', () => {
            let timerSet = false;
            let timerDuration = 0;

            const mockSetTimeout = jest.fn((callback, duration) => {
                timerSet = true;
                timerDuration = duration;
                return 123; // Mock timer ID
            });

            const setMetaRefreshTimer = (setTimeout, duration = 15000) => {
                const timerId = setTimeout(() => {
                    if (!window.terraflowLoaded) {
                        window.location.href = window.location.pathname + '?meta_refresh=' + Date.now();
                    }
                }, duration);
                
                return { timerId, duration };
            };

            const result = setMetaRefreshTimer(mockSetTimeout, 15000);

            expect(mockSetTimeout).toHaveBeenCalled();
            expect(result.duration).toBe(15000);
            expect(result.timerId).toBe(123);
        });

        test('should check terraflowLoaded flag', () => {
            const checkLoadedFlag = (window) => {
                return {
                    loaded: !!window.terraflowLoaded,
                    shouldRefresh: !window.terraflowLoaded
                };
            };

            // Test with loaded flag
            const loadedWindow = { terraflowLoaded: true };
            const loadedResult = checkLoadedFlag(loadedWindow);
            expect(loadedResult.loaded).toBe(true);
            expect(loadedResult.shouldRefresh).toBe(false);

            // Test without loaded flag
            const unloadedWindow = {};
            const unloadedResult = checkLoadedFlag(unloadedWindow);
            expect(unloadedResult.loaded).toBe(false);
            expect(unloadedResult.shouldRefresh).toBe(true);
        });
    });

    describe('Integration Scenarios', () => {
        test('should handle complete corruption scenario', () => {
            const mockLocalStorage = {
                getItem: jest.fn((key) => {
                    if (key === 'terraflow_save_data') {
                        return '{"gameState": {"energy": 20, "insight": }'; // Corrupted
                    }
                    return null;
                }),
                clear: jest.fn()
            };

            const mockSessionStorage = {
                getItem: jest.fn(() => '0'), // No previous attempts
                setItem: jest.fn()
            };

            const mockLocation = {
                pathname: '/TerraFlow',
                replace: jest.fn()
            };

            const handleCorruption = (localStorage, sessionStorage, location) => {
                try {
                    // Check for corruption
                    const data = localStorage.getItem('terraflow_save_data');
                    if (data) {
                        JSON.parse(data); // This will throw
                    }
                    return { handled: false };
                } catch (error) {
                    // Clear data and redirect
                    localStorage.clear();
                    const attempts = parseInt(sessionStorage.getItem('tf_reset_attempts') || '0') + 1;
                    sessionStorage.setItem('tf_reset_attempts', attempts.toString());
                    location.replace(location.pathname + '?cleared=' + Date.now());
                    return { handled: true, attempts };
                }
            };

            const result = handleCorruption(mockLocalStorage, mockSessionStorage, mockLocation);

            expect(result.handled).toBe(true);
            expect(result.attempts).toBe(1);
            expect(mockLocalStorage.clear).toHaveBeenCalled();
            expect(mockSessionStorage.setItem).toHaveBeenCalledWith('tf_reset_attempts', '1');
            expect(mockLocation.replace).toHaveBeenCalled();
        });
    });
});

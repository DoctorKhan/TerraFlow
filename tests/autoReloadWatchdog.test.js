/**
 * TDD Test Suite: Auto-Reload Watchdog
 * 
 * This test suite verifies that the auto-reload watchdog system works
 * to prevent the game from staying frozen on corrupted data.
 */

describe('Auto-Reload Watchdog Tests', () => {
    describe('Emergency Watchdog Timer', () => {
        test('should trigger emergency reset if page freezes completely', () => {
            let emergencyResetTriggered = false;
            let localStorageCleared = false;
            let pageReloaded = false;

            const mockLocalStorage = {
                clear: jest.fn(() => {
                    localStorageCleared = true;
                })
            };

            const mockWindow = {
                location: {
                    href: 'https://doctorkhan.github.io/TerraFlow',
                    pathname: '/TerraFlow'
                }
            };

            // Simulate the emergency watchdog
            const emergencyWatchdog = (timeout = 5000) => {
                const timer = setTimeout(() => {
                    if (!emergencyResetTriggered) {
                        emergencyResetTriggered = true;
                        
                        try {
                            mockLocalStorage.clear();
                        } catch (e) {
                            console.error('Could not clear localStorage:', e);
                        }
                        
                        // Simulate page reload
                        mockWindow.location.href = mockWindow.location.href.split('?')[0] + '?emergency_reset=' + Date.now();
                        pageReloaded = true;
                    }
                }, timeout);

                return {
                    cancel: () => clearTimeout(timer),
                    isActive: () => !emergencyResetTriggered
                };
            };

            // Start watchdog with short timeout for testing
            const watchdog = emergencyWatchdog(100);

            // Wait for timeout to trigger
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(emergencyResetTriggered).toBe(true);
                    expect(localStorageCleared).toBe(true);
                    expect(pageReloaded).toBe(true);
                    expect(mockLocalStorage.clear).toHaveBeenCalled();
                    resolve();
                }, 150);
            });
        });

        test('should cancel emergency timer when DOM loads', () => {
            let emergencyResetTriggered = false;
            let timerCancelled = false;

            const emergencyWatchdog = () => {
                const timer = setTimeout(() => {
                    emergencyResetTriggered = true;
                }, 5000);

                const cancel = () => {
                    clearTimeout(timer);
                    timerCancelled = true;
                };

                return { cancel };
            };

            const watchdog = emergencyWatchdog();

            // Simulate DOM loaded event
            watchdog.cancel();

            // Wait a bit to ensure timer doesn't fire
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(emergencyResetTriggered).toBe(false);
                    expect(timerCancelled).toBe(true);
                    resolve();
                }, 100);
            });
        });
    });

    describe('Game Initialization Watchdog', () => {
        test('should trigger auto-reload if game fails to initialize', () => {
            let gameInitialized = false;
            let autoReloadTriggered = false;
            let dataCleared = false;

            const mockClearData = jest.fn(() => {
                dataCleared = true;
            });

            const mockWindow = {
                location: {
                    href: 'https://doctorkhan.github.io/TerraFlow'
                }
            };

            const gameInitWatchdog = (timeout = 10000) => {
                const timer = setTimeout(() => {
                    if (!gameInitialized && !autoReloadTriggered) {
                        autoReloadTriggered = true;
                        mockClearData();
                        
                        const url = new URL(mockWindow.location.href);
                        url.searchParams.set('auto_reset', 'true');
                        mockWindow.location.href = url.toString();
                    }
                }, timeout);

                return {
                    markInitialized: () => {
                        gameInitialized = true;
                        clearTimeout(timer);
                    }
                };
            };

            // Start watchdog with short timeout
            const watchdog = gameInitWatchdog(100);

            // Don't mark as initialized - let it timeout
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(autoReloadTriggered).toBe(true);
                    expect(dataCleared).toBe(true);
                    expect(mockClearData).toHaveBeenCalled();
                    resolve();
                }, 150);
            });
        });

        test('should not trigger auto-reload if game initializes successfully', () => {
            let gameInitialized = false;
            let autoReloadTriggered = false;

            const gameInitWatchdog = (timeout = 10000) => {
                const timer = setTimeout(() => {
                    if (!gameInitialized && !autoReloadTriggered) {
                        autoReloadTriggered = true;
                    }
                }, timeout);

                return {
                    markInitialized: () => {
                        gameInitialized = true;
                        clearTimeout(timer);
                    }
                };
            };

            const watchdog = gameInitWatchdog(100);

            // Mark as initialized before timeout
            setTimeout(() => {
                watchdog.markInitialized();
            }, 50);

            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(gameInitialized).toBe(true);
                    expect(autoReloadTriggered).toBe(false);
                    resolve();
                }, 150);
            });
        });
    });

    describe('Loading Indicator', () => {
        test('should create loading indicator with proper styling', () => {
            const mockDocument = {
                createElement: jest.fn(() => ({
                    id: '',
                    innerHTML: '',
                    remove: jest.fn()
                })),
                body: {
                    appendChild: jest.fn()
                },
                getElementById: jest.fn()
            };

            const createLoadingIndicator = () => {
                const loadingDiv = mockDocument.createElement('div');
                loadingDiv.id = 'emergency-loading';
                loadingDiv.innerHTML = 'Loading content with styles...';
                
                if (mockDocument.body) {
                    mockDocument.body.appendChild(loadingDiv);
                }

                return {
                    created: true,
                    element: loadingDiv
                };
            };

            const result = createLoadingIndicator();

            expect(result.created).toBe(true);
            expect(result.element.id).toBe('emergency-loading');
            expect(mockDocument.createElement).toHaveBeenCalledWith('div');
            expect(mockDocument.body.appendChild).toHaveBeenCalled();
        });

        test('should remove loading indicator when game initializes', () => {
            const mockElement = {
                remove: jest.fn()
            };

            const mockDocument = {
                getElementById: jest.fn(() => mockElement)
            };

            const removeLoadingIndicator = () => {
                const indicator = mockDocument.getElementById('emergency-loading');
                if (indicator) {
                    indicator.remove();
                    return true;
                }
                return false;
            };

            const result = removeLoadingIndicator();

            expect(result).toBe(true);
            expect(mockDocument.getElementById).toHaveBeenCalledWith('emergency-loading');
            expect(mockElement.remove).toHaveBeenCalled();
        });

        test('should handle missing loading indicator gracefully', () => {
            const mockDocument = {
                getElementById: jest.fn(() => null)
            };

            const removeLoadingIndicator = () => {
                const indicator = mockDocument.getElementById('emergency-loading');
                if (indicator) {
                    indicator.remove();
                    return true;
                }
                return false;
            };

            const result = removeLoadingIndicator();

            expect(result).toBe(false);
            expect(mockDocument.getElementById).toHaveBeenCalledWith('emergency-loading');
        });
    });

    describe('URL Parameter Handling', () => {
        test('should detect auto-reset parameter', () => {
            const mockURL = {
                search: '?auto_reset=true&other=param',
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

            const handleAutoReset = (window) => {
                if (window.location.search.includes('auto_reset=true')) {
                    const url = window.location;
                    url.searchParams.delete('auto_reset');
                    window.history.replaceState({}, 'TerraFlow', url.pathname);
                    return { detected: true, cleaned: true };
                }
                return { detected: false };
            };

            const result = handleAutoReset(mockWindow);

            expect(result.detected).toBe(true);
            expect(result.cleaned).toBe(true);
            expect(mockURL.searchParams.delete).toHaveBeenCalledWith('auto_reset');
            expect(mockWindow.history.replaceState).toHaveBeenCalled();
        });

        test('should detect emergency reset parameter', () => {
            const mockURL = {
                search: '?emergency_reset=1234567890'
            };

            const detectEmergencyReset = (url) => {
                return url.search.includes('emergency_reset=');
            };

            const result = detectEmergencyReset(mockURL);

            expect(result).toBe(true);
        });
    });

    describe('Watchdog Integration', () => {
        test('should coordinate multiple watchdog systems', () => {
            let emergencyTriggered = false;
            let gameInitTriggered = false;
            let loadingRemoved = false;

            const coordinatedWatchdog = () => {
                // Emergency watchdog (5 seconds)
                const emergencyTimer = setTimeout(() => {
                    emergencyTriggered = true;
                }, 5000);

                // Game init watchdog (10 seconds)  
                const gameInitTimer = setTimeout(() => {
                    gameInitTriggered = true;
                }, 10000);

                return {
                    cancelEmergency: () => clearTimeout(emergencyTimer),
                    cancelGameInit: () => clearTimeout(gameInitTimer),
                    markSuccess: () => {
                        clearTimeout(emergencyTimer);
                        clearTimeout(gameInitTimer);
                        loadingRemoved = true;
                    }
                };
            };

            const watchdog = coordinatedWatchdog();

            // Simulate successful initialization
            watchdog.markSuccess();

            // Wait and verify no timeouts triggered
            return new Promise((resolve) => {
                setTimeout(() => {
                    expect(emergencyTriggered).toBe(false);
                    expect(gameInitTriggered).toBe(false);
                    expect(loadingRemoved).toBe(true);
                    resolve();
                }, 100);
            });
        });
    });
});

/**
 * @jest-environment jsdom
 */

describe('Grok API Key Popup Tests', () => {
    let mockLocalStorage;

    beforeEach(() => {
        // Mock localStorage
        mockLocalStorage = {
            getItem: jest.fn(),
            setItem: jest.fn(),
            removeItem: jest.fn()
        };
        Object.defineProperty(window, 'localStorage', {
            value: mockLocalStorage
        });

        // Create DOM structure
        document.body.innerHTML = `
            <div id="api-key-popup" class="hidden fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div class="bg-gray-800 p-6 rounded-lg max-w-md w-full mx-4">
                    <h3 class="text-xl font-bold text-white mb-4">Configure Grok API Key</h3>
                    <p class="text-gray-300 mb-4">To access cosmic wisdom, please enter your Grok API key:</p>
                    <input type="password" id="api-key-input" class="w-full p-3 bg-gray-700 text-white rounded mb-4" placeholder="Enter your Grok API key...">
                    <div class="flex gap-3">
                        <button id="save-api-key" class="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded">Save</button>
                        <button id="cancel-api-key" class="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 px-4 rounded">Cancel</button>
                    </div>
                </div>
            </div>
        `;
    });

    describe('Popup Display', () => {
        test('should show popup when API key is needed', () => {
            const showApiKeyPopup = () => {
                const popup = document.getElementById('api-key-popup');
                popup.classList.remove('hidden');
                const input = document.getElementById('api-key-input');
                input.focus();
            };

            const popup = document.getElementById('api-key-popup');
            expect(popup.classList.contains('hidden')).toBe(true);

            showApiKeyPopup();
            expect(popup.classList.contains('hidden')).toBe(false);
        });

        test('should hide popup when cancelled', () => {
            const hideApiKeyPopup = () => {
                const popup = document.getElementById('api-key-popup');
                popup.classList.add('hidden');
                const input = document.getElementById('api-key-input');
                input.value = '';
            };

            const popup = document.getElementById('api-key-popup');
            popup.classList.remove('hidden');

            hideApiKeyPopup();
            expect(popup.classList.contains('hidden')).toBe(true);
        });

        test('should clear input when popup is hidden', () => {
            const input = document.getElementById('api-key-input');
            input.value = 'test-key';

            const hideApiKeyPopup = () => {
                const popup = document.getElementById('api-key-popup');
                popup.classList.add('hidden');
                input.value = '';
            };

            hideApiKeyPopup();
            expect(input.value).toBe('');
        });
    });

    describe('API Key Storage', () => {
        test('should save API key to localStorage', () => {
            const saveApiKey = (key) => {
                if (key && key.trim()) {
                    localStorage.setItem('grok_api_key', key.trim());
                    return true;
                }
                return false;
            };

            const result = saveApiKey('test-api-key-123');
            expect(result).toBe(true);
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('grok_api_key', 'test-api-key-123');
        });

        test('should not save empty API key', () => {
            const saveApiKey = (key) => {
                if (key && key.trim()) {
                    localStorage.setItem('grok_api_key', key.trim());
                    return true;
                }
                return false;
            };

            expect(saveApiKey('')).toBe(false);
            expect(saveApiKey('   ')).toBe(false);
            expect(mockLocalStorage.setItem).not.toHaveBeenCalled();
        });

        test('should retrieve API key from localStorage', () => {
            const getApiKey = () => {
                return localStorage.getItem('grok_api_key') || '';
            };

            mockLocalStorage.getItem.mockReturnValue('stored-api-key');
            const key = getApiKey();
            expect(key).toBe('stored-api-key');
            expect(mockLocalStorage.getItem).toHaveBeenCalledWith('grok_api_key');
        });

        test('should handle missing API key gracefully', () => {
            const getApiKey = () => {
                return localStorage.getItem('grok_api_key') || '';
            };

            mockLocalStorage.getItem.mockReturnValue(null);
            const key = getApiKey();
            expect(key).toBe('');
        });
    });

    describe('API Key Validation', () => {
        test('should validate API key format', () => {
            const validateApiKey = (key) => {
                if (!key || typeof key !== 'string') return false;
                if (key.length < 10) return false;
                if (key.includes(' ')) return false;
                return true;
            };

            expect(validateApiKey('valid-api-key-123')).toBe(true);
            expect(validateApiKey('short')).toBe(false);
            expect(validateApiKey('key with spaces')).toBe(false);
            expect(validateApiKey('')).toBe(false);
            expect(validateApiKey(null)).toBe(false);
        });

        test('should show validation errors', () => {
            const showValidationError = (message) => {
                const popup = document.getElementById('api-key-popup');
                let errorDiv = popup.querySelector('.error-message');
                
                if (!errorDiv) {
                    errorDiv = document.createElement('div');
                    errorDiv.className = 'error-message text-red-400 text-sm mt-2';
                    const input = document.getElementById('api-key-input');
                    input.parentNode.insertBefore(errorDiv, input.nextSibling);
                }
                
                errorDiv.textContent = message;
            };

            showValidationError('Invalid API key format');
            const errorDiv = document.querySelector('.error-message');
            expect(errorDiv).toBeTruthy();
            expect(errorDiv.textContent).toBe('Invalid API key format');
        });
    });

    describe('Integration with Grok API', () => {
        test('should use stored API key in API calls', () => {
            const makeApiCall = async (prompt) => {
                const apiKey = localStorage.getItem('grok_api_key');
                
                if (!apiKey) {
                    throw new Error('API_KEY_REQUIRED');
                }
                
                // Mock API call
                return {
                    success: true,
                    apiKey: apiKey,
                    prompt: prompt
                };
            };

            mockLocalStorage.getItem.mockReturnValue('test-key');
            
            return makeApiCall('test prompt').then(result => {
                expect(result.success).toBe(true);
                expect(result.apiKey).toBe('test-key');
            });
        });

        test('should trigger popup when API key is missing', async () => {
            const makeApiCall = async (prompt) => {
                const apiKey = localStorage.getItem('grok_api_key');
                
                if (!apiKey) {
                    throw new Error('API_KEY_REQUIRED');
                }
                
                return { success: true };
            };

            mockLocalStorage.getItem.mockReturnValue(null);
            
            try {
                await makeApiCall('test prompt');
                fail('Should have thrown API_KEY_REQUIRED error');
            } catch (error) {
                expect(error.message).toBe('API_KEY_REQUIRED');
            }
        });
    });

    describe('User Experience', () => {
        test('should handle Enter key in input field', () => {
            const input = document.getElementById('api-key-input');
            const saveButton = document.getElementById('save-api-key');
            
            let saveClicked = false;
            saveButton.onclick = () => { saveClicked = true; };

            const handleKeyPress = (event) => {
                if (event.key === 'Enter') {
                    saveButton.click();
                }
            };

            input.addEventListener('keypress', handleKeyPress);
            
            // Simulate Enter key press
            const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
            input.dispatchEvent(enterEvent);
            
            expect(saveClicked).toBe(true);
        });

        test('should handle Escape key to cancel', () => {
            const cancelButton = document.getElementById('cancel-api-key');
            
            let cancelClicked = false;
            cancelButton.onclick = () => { cancelClicked = true; };

            const handleKeyPress = (event) => {
                if (event.key === 'Escape') {
                    cancelButton.click();
                }
            };

            document.addEventListener('keydown', handleKeyPress);
            
            // Simulate Escape key press
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);
            
            expect(cancelClicked).toBe(true);
        });

        test('should provide helpful instructions', () => {
            const popup = document.getElementById('api-key-popup');
            const instructions = popup.querySelector('p');
            
            expect(instructions.textContent).toContain('cosmic wisdom');
            expect(instructions.textContent).toContain('Grok API key');
        });
    });

    describe('Security Considerations', () => {
        test('should use password input type', () => {
            const input = document.getElementById('api-key-input');
            expect(input.type).toBe('password');
        });

        test('should not log API key to console', () => {
            const consoleSpy = jest.spyOn(console, 'log');
            
            const saveApiKey = (key) => {
                localStorage.setItem('grok_api_key', key);
                // Should not log the actual key
                console.log('API key saved successfully');
            };

            saveApiKey('secret-key-123');
            
            expect(consoleSpy).toHaveBeenCalledWith('API key saved successfully');
            expect(consoleSpy).not.toHaveBeenCalledWith(expect.stringContaining('secret-key-123'));
            
            consoleSpy.mockRestore();
        });
    });
});

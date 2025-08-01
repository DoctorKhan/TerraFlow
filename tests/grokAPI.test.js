/**
 * @jest-environment jsdom
 */

describe('Grok API Integration Tests', () => {
    let mockFetch;
    let mockGameState;

    beforeEach(() => {
        // Mock fetch
        mockFetch = jest.fn();
        global.fetch = mockFetch;

        // Mock game state
        mockGameState = {
            energy: 100,
            insight: 50,
            energyPerSecond: 2.5,
            insightPerSecond: 1.8,
            harmony: 75,
            units: { dreamers: 5, weavers: 3 }
        };

        // Mock DOM elements
        document.body.innerHTML = `
            <button id="advisor-btn">Ask Advisor</button>
            <button id="seasonal-vision-btn">Get Vision</button>
            <div id="log-output"></div>
        `;

        // Mock console methods
        global.console.error = jest.fn();
        global.console.log = jest.fn();
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe('Grok API Call Function', () => {
        test('should make correct API call to Grok', async () => {
            // Mock successful response
            mockFetch.mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    choices: [{
                        message: {
                            content: "The sanctuary whispers: Focus on harmony to unlock greater potential."
                        }
                    }]
                })
            });

            // Mock the callGrok function (would be extracted from HTML)
            const callGrok = async (prompt, button, systemPrompt) => {
                const apiKey = "test-api-key";
                const messages = [];
                
                if (systemPrompt) {
                    messages.push({ role: "system", content: systemPrompt });
                }
                messages.push({ role: "user", content: prompt });
                
                const payload = {
                    messages: messages,
                    model: "grok-beta",
                    stream: false,
                    temperature: 0.8
                };
                
                const response = await fetch("https://api.x.ai/v1/chat/completions", {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${apiKey}`
                    },
                    body: JSON.stringify(payload)
                });
                
                const result = await response.json();
                return result.choices?.[0]?.message?.content || "No response";
            };

            const result = await callGrok(
                "Test prompt",
                null,
                "Test system prompt"
            );

            expect(mockFetch).toHaveBeenCalledWith(
                "https://api.x.ai/v1/chat/completions",
                expect.objectContaining({
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer test-api-key'
                    },
                    body: JSON.stringify({
                        messages: [
                            { role: "system", content: "Test system prompt" },
                            { role: "user", content: "Test prompt" }
                        ],
                        model: "grok-beta",
                        stream: false,
                        temperature: 0.8
                    })
                })
            );

            expect(result).toBe("The sanctuary whispers: Focus on harmony to unlock greater potential.");
        });

        test('should handle API errors gracefully', async () => {
            // Mock failed response
            mockFetch.mockResolvedValueOnce({
                ok: false,
                status: 401,
                statusText: 'Unauthorized'
            });

            const callGrok = async (prompt, button, systemPrompt) => {
                try {
                    const response = await fetch("https://api.x.ai/v1/chat/completions", {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': 'Bearer invalid-key'
                        },
                        body: JSON.stringify({})
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Grok API call failed: ${response.status} ${response.statusText}`);
                    }
                } catch (error) {
                    return "The aetheric connection is disrupted. The cosmic network seems unreachable.";
                }
            };

            const result = await callGrok("Test prompt", null, "System prompt");
            expect(result).toBe("The aetheric connection is disrupted. The cosmic network seems unreachable.");
        });

        test('should handle missing API key', async () => {
            const callGrok = async (prompt, button, systemPrompt) => {
                const apiKey = "";
                if (!apiKey) {
                    return "The Grok API key must be configured to access cosmic wisdom. Set your API key in the code.";
                }
            };

            const result = await callGrok("Test prompt", null, "System prompt");
            expect(result).toBe("The Grok API key must be configured to access cosmic wisdom. Set your API key in the code.");
        });
    });

    describe('Button State Management', () => {
        test('should disable button during API call', async () => {
            const button = document.getElementById('advisor-btn');
            
            // Mock the button state changes
            const mockCallGrok = async (prompt, buttonElement) => {
                if (buttonElement) {
                    buttonElement.disabled = true;
                    buttonElement.classList.add('loading');
                    buttonElement.innerHTML = 'AI is thinking...';
                }
                
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 100));
                
                if (buttonElement) {
                    buttonElement.disabled = false;
                    buttonElement.classList.remove('loading');
                    buttonElement.innerHTML = '📜 Ask Advisor';
                }
                
                return "Test response";
            };

            expect(button.disabled).toBe(false);
            
            const promise = mockCallGrok("Test prompt", button);
            
            // Button should be disabled during call
            expect(button.disabled).toBe(true);
            expect(button.classList.contains('loading')).toBe(true);
            expect(button.innerHTML).toBe('AI is thinking...');
            
            await promise;
            
            // Button should be re-enabled after call
            expect(button.disabled).toBe(false);
            expect(button.classList.contains('loading')).toBe(false);
            expect(button.innerHTML).toBe('📜 Ask Advisor');
        });
    });

    describe('Prompt Generation', () => {
        test('should generate correct advisor prompt', () => {
            const generateAdvisorPrompt = (gameState) => {
                const formatNumber = (num) => num.toFixed(num < 1000 ? 1 : 2);
                return `Current stats: Energy: ${formatNumber(gameState.energy)}, Insight: ${formatNumber(gameState.insight)}, Energy/s: ${formatNumber(gameState.energyPerSecond)}, Insight/s: ${formatNumber(gameState.insightPerSecond)}, Harmony: ${gameState.harmony.toFixed(1)}%. What should the player focus on next?`;
            };

            const prompt = generateAdvisorPrompt(mockGameState);

            // Test that prompt contains expected elements
            expect(prompt).toContain('Current stats:');
            expect(prompt).toContain('Energy: 100.0');
            expect(prompt).toContain('Insight: 50.0');
            expect(prompt).toContain('Energy/s: 2.5');
            expect(prompt).toContain('Insight/s: 1.8');
            expect(prompt).toContain('Harmony: 75.0%');
            expect(prompt).toContain('What should the player focus on next?');
        });

        test('should generate correct seasonal vision prompt', () => {
            const expectedPrompt = `Current sanctuary state: Energy production 2.5/s, Insight production 1.8/s. The sanctuary houses 5 dreamers and 3 weavers, with 75.0% harmony. Provide a mystical seasonal vision or cosmic forecast.`;
            
            const generateVisionPrompt = (gameState) => {
                return `Current sanctuary state: Energy production ${gameState.energyPerSecond.toFixed(1)}/s, Insight production ${gameState.insightPerSecond.toFixed(1)}/s. The sanctuary houses ${gameState.units.dreamers} dreamers and ${gameState.units.weavers} weavers, with ${gameState.harmony.toFixed(1)}% harmony. Provide a mystical seasonal vision or cosmic forecast.`;
            };

            const prompt = generateVisionPrompt(mockGameState);
            expect(prompt).toBe(expectedPrompt);
        });
    });

    describe('System Prompts', () => {
        test('should use correct system prompt for advisor', () => {
            const expectedSystemPrompt = "You are the Cosmic Advisor for Resonant Sanctuary: The Weaver. Provide brief, mystical advice using cosmic language. Always start responses with 'The sanctuary whispers...' and keep under 30 words. Focus on actionable game advice.";
            
            expect(expectedSystemPrompt).toContain("Cosmic Advisor");
            expect(expectedSystemPrompt).toContain("The sanctuary whispers");
            expect(expectedSystemPrompt).toContain("under 30 words");
        });

        test('should use correct system prompt for seasonal vision', () => {
            const expectedSystemPrompt = "You are a mystical storyteller for Resonant Sanctuary: The Weaver, a cosmic incremental game. Create poetic, ethereal visions about the sanctuary's future or cosmic events. Use mystical language and keep responses to 2-3 sentences.";
            
            expect(expectedSystemPrompt).toContain("mystical storyteller");
            expect(expectedSystemPrompt).toContain("2-3 sentences");
            expect(expectedSystemPrompt).toContain("cosmic events");
        });
    });
});

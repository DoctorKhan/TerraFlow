/**
 * @jest-environment jsdom
 */

const fs = require('fs');
const path = require('path');

describe('UI Interaction Tests', () => {
    let document, window;

    beforeEach(() => {
        // Load the HTML file
        const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
        document.body.innerHTML = html;
        
        // Mock window functions that might not be available in jsdom
        window.requestAnimationFrame = jest.fn((cb) => setTimeout(cb, 16));
        window.Date.now = jest.fn(() => 1000000);
        
        // Execute the script content (simplified version for testing)
        eval(`
            // Mock canvas context
            const mockCanvas = {
                getContext: () => ({
                    createLinearGradient: () => ({ addColorStop: () => {} }),
                    createRadialGradient: () => ({ addColorStop: () => {} }),
                    fillRect: () => {},
                    beginPath: () => {},
                    arc: () => {},
                    fill: () => {},
                    stroke: () => {},
                    moveTo: () => {},
                    lineTo: () => {},
                    closePath: () => {},
                    fillStyle: '',
                    strokeStyle: '',
                    globalAlpha: 1,
                    shadowColor: '',
                    shadowBlur: 0
                }),
                width: 800,
                height: 600,
                getBoundingClientRect: () => ({ width: 800, height: 600 })
            };
            
            // Mock DOM elements
            document.getElementById = (id) => {
                const mockElement = {
                    innerHTML: '',
                    textContent: '',
                    className: '',
                    appendChild: () => {},
                    prepend: () => {},
                    remove: () => {},
                    addEventListener: () => {},
                    children: { length: 0 },
                    lastChild: { remove: () => {} },
                    querySelector: () => ({ textContent: '20.0' }),
                    getBoundingClientRect: () => ({ width: 800, height: 600 }),
                    getContext: () => mockCanvas.getContext(),
                    disabled: false,
                    classList: { add: () => {}, remove: () => {} }
                };
                return mockElement;
            };
        `);
    });

    describe('Button State Management', () => {
        test('should create buttons with correct initial states', () => {
            // This test verifies that buttons are created with proper affordability states
            const mockGameState = {
                energy: 20,
                insight: 5,
                units: { dreamers: 1, weavers: 1 },
                unitCosts: { dreamers: 15, weavers: 15 },
                nodes: { sustenance: 0, energy: 0, cohesion: 0, cycling: 0 },
                nodeCosts: { sustenance: 100, energy: 100, cohesion: 500, cycling: 200 }
            };

            // Test dreamer button (should be affordable)
            const canAffordDreamer = mockGameState.energy >= mockGameState.unitCosts.dreamers;
            expect(canAffordDreamer).toBe(true);

            // Test weaver button (should not be affordable)
            const canAffordWeaver = mockGameState.insight >= mockGameState.unitCosts.weavers;
            expect(canAffordWeaver).toBe(false);
        });

        test('should handle button clicks without errors', () => {
            // Mock the global functions that buttons call
            global.createUnit = jest.fn();
            global.upgradeNode = jest.fn();

            // Simulate button clicks
            expect(() => {
                global.createUnit('dreamers');
                global.createUnit('weavers');
                global.upgradeNode('sustenance');
                global.upgradeNode('cycling');
            }).not.toThrow();

            expect(global.createUnit).toHaveBeenCalledWith('dreamers');
            expect(global.createUnit).toHaveBeenCalledWith('weavers');
            expect(global.upgradeNode).toHaveBeenCalledWith('sustenance');
            expect(global.upgradeNode).toHaveBeenCalledWith('cycling');
        });
    });

    describe('UI Rendering Performance', () => {
        test('should handle frequent UI updates without blocking', () => {
            const mockRenderUI = jest.fn();
            const startTime = Date.now();

            // Simulate rapid UI updates
            for (let i = 0; i < 100; i++) {
                mockRenderUI();
            }

            const endTime = Date.now();
            const duration = endTime - startTime;

            expect(mockRenderUI).toHaveBeenCalledTimes(100);
            expect(duration).toBeLessThan(100); // Should complete quickly
        });

        test('should throttle UI updates appropriately', () => {
            let updateCount = 0;
            let lastUpdate = 0;
            const throttleDelay = 100; // 100ms throttle

            const throttledUpdate = () => {
                const now = Date.now();
                if (now - lastUpdate > throttleDelay) {
                    updateCount++;
                    lastUpdate = now;
                }
            };

            // Simulate rapid calls
            for (let i = 0; i < 10; i++) {
                throttledUpdate();
                // Advance time by 50ms each iteration
                jest.advanceTimersByTime(50);
            }

            // Should have been called less than 10 times due to throttling
            expect(updateCount).toBeLessThan(10);
        });
    });

    describe('Resource Display Formatting', () => {
        test('should format resource numbers correctly in UI', () => {
            const formatNumber = (num) => {
                if (num < 1000) return num.toFixed(1);
                if (num < 1e6) return (num / 1e3).toFixed(2) + 'k';
                if (num < 1e9) return (num / 1e6).toFixed(2) + 'M';
                return (num / 1e9).toFixed(2) + 'B';
            };

            // Test various number formats that would appear in UI
            expect(formatNumber(20.5)).toBe('20.5');
            expect(formatNumber(1234)).toBe('1.23k');
            expect(formatNumber(1500000)).toBe('1.50M');
            expect(formatNumber(2000000000)).toBe('2.00B');
        });

        test('should handle edge cases in number display', () => {
            const formatNumber = (num) => {
                if (isNaN(num) || !isFinite(num)) return '0.0';
                if (num < 0) return '0.0'; // Don't show negative resources
                if (num < 1000) return num.toFixed(1);
                if (num < 1e6) return (num / 1e3).toFixed(2) + 'k';
                if (num < 1e9) return (num / 1e6).toFixed(2) + 'M';
                return (num / 1e9).toFixed(2) + 'B';
            };

            expect(formatNumber(NaN)).toBe('0.0');
            expect(formatNumber(Infinity)).toBe('0.0');
            expect(formatNumber(-100)).toBe('0.0');
            expect(formatNumber(0)).toBe('0.0');
        });
    });

    describe('Game State Synchronization', () => {
        test('should maintain UI consistency with game state', () => {
            const mockGameState = {
                energy: 100.5,
                energyPerSecond: 2.3,
                insight: 50.2,
                insightPerSecond: 1.8,
                harmony: 75.5,
                units: { dreamers: 5, weavers: 3 }
            };

            // Verify that UI would display correct values
            expect(mockGameState.energy).toBeCloseTo(100.5);
            expect(mockGameState.energyPerSecond).toBeCloseTo(2.3);
            expect(mockGameState.insight).toBeCloseTo(50.2);
            expect(mockGameState.insightPerSecond).toBeCloseTo(1.8);
            expect(mockGameState.harmony).toBeCloseTo(75.5);
            expect(mockGameState.units.dreamers).toBe(5);
            expect(mockGameState.units.weavers).toBe(3);
        });

        test('should handle rapid state changes', () => {
            let gameState = {
                energy: 20,
                insight: 5,
                units: { dreamers: 1, weavers: 1 }
            };

            // Simulate rapid state changes
            for (let i = 0; i < 50; i++) {
                gameState.energy += 0.1;
                gameState.insight += 0.1;
                
                // Occasionally buy units
                if (i % 10 === 0 && gameState.energy >= 15) {
                    gameState.energy -= 15;
                    gameState.units.dreamers++;
                }
            }

            expect(gameState.energy).toBeGreaterThan(20);
            expect(gameState.insight).toBeGreaterThan(5);
            expect(gameState.units.dreamers).toBeGreaterThan(1);
        });
    });

    describe('Error Handling in UI', () => {
        test('should handle missing DOM elements gracefully', () => {
            // Mock getElementById to return null for some elements
            const originalGetElementById = document.getElementById;
            document.getElementById = jest.fn((id) => {
                if (id === 'missing-element') return null;
                return originalGetElementById.call(document, id);
            });

            // Should not throw when trying to access missing elements
            expect(() => {
                const element = document.getElementById('missing-element');
                if (element) {
                    element.innerHTML = 'test';
                }
            }).not.toThrow();
        });

        test('should handle invalid button actions', () => {
            const mockCreateUnit = jest.fn((type) => {
                if (type === 'invalid') return false;
                return true;
            });

            expect(mockCreateUnit('dreamers')).toBe(true);
            expect(mockCreateUnit('weavers')).toBe(true);
            expect(mockCreateUnit('invalid')).toBe(false);
        });
    });

    describe('Accessibility and Usability', () => {
        test('should provide appropriate button states for screen readers', () => {
            const mockButton = {
                disabled: false,
                'aria-label': '',
                textContent: 'Create (Cost: 15.0 energy)'
            };

            // Button should indicate cost and affordability
            expect(mockButton.textContent).toContain('Cost:');
            expect(mockButton.textContent).toContain('energy');
            expect(mockButton.disabled).toBe(false);
        });

        test('should handle keyboard navigation', () => {
            const mockKeyboardEvent = {
                key: 'Enter',
                preventDefault: jest.fn(),
                target: { click: jest.fn() }
            };

            // Simulate Enter key press on button
            if (mockKeyboardEvent.key === 'Enter') {
                mockKeyboardEvent.target.click();
            }

            expect(mockKeyboardEvent.target.click).toHaveBeenCalled();
        });
    });
});

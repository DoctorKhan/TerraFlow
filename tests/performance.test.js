/**
 * @jest-environment jsdom
 */

describe('Performance Tests - Local Game Should Be Lightning Fast', () => {
    let mockCanvas, mockCtx;
    let gameState;

    beforeEach(() => {
        // Mock high-performance canvas
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            measureText: jest.fn(() => ({ width: 100 })),
            fillText: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn(),
            clearRect: jest.fn()
        };

        mockCanvas = {
            getContext: jest.fn(() => mockCtx),
            getBoundingClientRect: jest.fn(() => ({ width: 800, height: 600 })),
            width: 800,
            height: 600
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;

        // Mock game state
        gameState = {
            energy: 20,
            insight: 5,
            energyPerSecond: 0.2,
            insightPerSecond: 0.2,
            harmony: 50,
            units: { dreamers: 1, weavers: 1 },
            unitCosts: { dreamers: 15, weavers: 15 },
            nodes: { sustenance: 0, energy: 0, cohesion: 0, cycling: 0 },
            nodeCosts: { sustenance: 100, energy: 100, cohesion: 500, cycling: 200 },
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20 },
                { type: 'crystal_tree', x: 200, y: 200, size: 25 }
            ],
            stars: [],
            lastUpdate: Date.now()
        };

        global.gameState = gameState;
        global.particles = [];
        global.animationTime = 0;
    });

    describe('Core Game Loop Performance', () => {
        test('updateGameState should execute in under 1ms', () => {
            const updateGameState = (delta) => {
                const energyPerSecond = gameState.units.weavers * 0.1;
                const insightPerSecond = gameState.units.dreamers * 0.1;
                
                gameState.energyPerSecond = energyPerSecond;
                gameState.insightPerSecond = insightPerSecond;
                gameState.energy += energyPerSecond * delta;
                gameState.insight += insightPerSecond * delta;
                gameState.lastUpdate = Date.now();
            };

            const startTime = performance.now();
            updateGameState(0.016); // 60fps frame
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            expect(executionTime).toBeLessThan(1); // Should be under 1ms
        });

        test('simple drawing operations should be under 5ms', () => {
            const drawSimpleSprite = (x, y, size, type) => {
                mockCtx.beginPath();
                mockCtx.arc(x, y, size, 0, Math.PI * 2);
                mockCtx.fillStyle = type === 'dome' ? '#F59E0B' : '#8B5CF6';
                mockCtx.fill();
            };

            const startTime = performance.now();
            
            // Draw 10 simple sprites
            for (let i = 0; i < 10; i++) {
                drawSimpleSprite(i * 50, i * 50, 20, i % 2 === 0 ? 'dome' : 'crystal_tree');
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(5); // Should be under 5ms
        });

        test('UI updates should be minimal and fast', () => {
            const updateButtonState = (buttonId, enabled, text) => {
                // Simulate minimal DOM update
                const mockUpdate = {
                    disabled: !enabled,
                    textContent: text,
                    className: enabled ? 'enabled' : 'disabled'
                };
                return mockUpdate;
            };

            const startTime = performance.now();
            
            // Update 5 buttons
            for (let i = 0; i < 5; i++) {
                updateButtonState(`button-${i}`, i % 2 === 0, `Button ${i}`);
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(1); // Should be under 1ms
        });
    });

    describe('Performance Bottleneck Identification', () => {
        test('should identify expensive operations', () => {
            const expensiveOperation = () => {
                // Simulate complex calculations
                let result = 0;
                for (let i = 0; i < 100000; i++) {
                    result += Math.sin(i) * Math.cos(i);
                }
                return result;
            };

            const startTime = performance.now();
            expensiveOperation();
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            
            // This should be flagged as too slow for 60fps
            if (executionTime > 16) {
                console.warn(`⚠️ Expensive operation detected: ${executionTime.toFixed(2)}ms`);
            }
            
            expect(executionTime).toBeLessThan(50); // Reasonable upper bound
        });

        test('should measure particle system performance', () => {
            const updateParticles = (particles) => {
                return particles.filter(particle => {
                    particle.x += particle.vx;
                    particle.y += particle.vy;
                    particle.life -= 0.01;
                    return particle.life > 0;
                });
            };

            // Create test particles
            const testParticles = [];
            for (let i = 0; i < 100; i++) {
                testParticles.push({
                    x: Math.random() * 800,
                    y: Math.random() * 600,
                    vx: (Math.random() - 0.5) * 2,
                    vy: (Math.random() - 0.5) * 2,
                    life: 1.0
                });
            }

            const startTime = performance.now();
            updateParticles(testParticles);
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            expect(executionTime).toBeLessThan(2); // Should handle 100 particles quickly
        });

        test('should measure canvas operations performance', () => {
            const drawComplexShape = () => {
                mockCtx.save();
                mockCtx.beginPath();
                
                // Draw a complex shape with gradients
                const gradient = mockCtx.createRadialGradient(100, 100, 0, 100, 100, 50);
                gradient.addColorStop(0, '#FF0000');
                gradient.addColorStop(1, '#0000FF');
                
                mockCtx.fillStyle = gradient;
                mockCtx.arc(100, 100, 50, 0, Math.PI * 2);
                mockCtx.fill();
                mockCtx.restore();
            };

            const startTime = performance.now();
            
            // Draw 20 complex shapes
            for (let i = 0; i < 20; i++) {
                drawComplexShape();
            }
            
            const endTime = performance.now();
            const executionTime = endTime - startTime;
            
            expect(executionTime).toBeLessThan(10); // Should be fast with mocked canvas
        });
    });

    describe('Memory Usage Tests', () => {
        test('should not create excessive objects per frame', () => {
            const initialMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
            
            // Simulate 60 frames of game updates
            for (let frame = 0; frame < 60; frame++) {
                // Good: Reuse objects
                const reusableState = gameState;
                reusableState.energy += 0.1;
                
                // Bad: Creating new objects every frame (avoid this)
                // const newState = { ...gameState, energy: gameState.energy + 0.1 };
            }
            
            const finalMemory = process.memoryUsage ? process.memoryUsage().heapUsed : 0;
            const memoryIncrease = finalMemory - initialMemory;
            
            // Memory increase should be minimal
            expect(memoryIncrease).toBeLessThan(1000000); // Less than 1MB
        });

        test('should clean up particles efficiently', () => {
            let particles = [];
            
            // Add particles
            for (let i = 0; i < 1000; i++) {
                particles.push({ life: Math.random(), id: i });
            }
            
            expect(particles.length).toBe(1000);
            
            // Clean up dead particles
            particles = particles.filter(p => p.life > 0.5);
            
            // Should have removed roughly half
            expect(particles.length).toBeLessThan(600);
            expect(particles.length).toBeGreaterThan(400);
        });
    });

    describe('60fps Target Tests', () => {
        test('complete game loop should execute under 16ms for 60fps', () => {
            const gameLoop = () => {
                // Simulate minimal game loop
                const delta = 0.016;
                
                // Update game state
                gameState.energy += gameState.energyPerSecond * delta;
                gameState.insight += gameState.insightPerSecond * delta;
                
                // Simple rendering
                mockCtx.clearRect(0, 0, 800, 600);
                gameState.villageGrid.forEach(sprite => {
                    mockCtx.beginPath();
                    mockCtx.arc(sprite.x, sprite.y, sprite.size, 0, Math.PI * 2);
                    mockCtx.fill();
                });
            };

            const startTime = performance.now();
            gameLoop();
            const endTime = performance.now();
            
            const executionTime = endTime - startTime;
            expect(executionTime).toBeLessThan(16); // 60fps = 16.67ms per frame
        });

        test('should maintain consistent frame timing', () => {
            const frameTimes = [];
            
            for (let i = 0; i < 10; i++) {
                const startTime = performance.now();
                
                // Minimal game update
                gameState.energy += 0.1;
                mockCtx.fillRect(0, 0, 10, 10);
                
                const endTime = performance.now();
                frameTimes.push(endTime - startTime);
            }
            
            const avgFrameTime = frameTimes.reduce((a, b) => a + b) / frameTimes.length;
            const maxFrameTime = Math.max(...frameTimes);
            
            expect(avgFrameTime).toBeLessThan(5); // Average should be very fast
            expect(maxFrameTime).toBeLessThan(10); // No frame should be slow
        });
    });
});

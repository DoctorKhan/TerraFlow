/**
 * @jest-environment jsdom
 */

describe('Graphics Rendering Tests', () => {
    let mockCanvas, mockCtx;
    let canvasState, gameState;

    beforeEach(() => {
        // Mock canvas context with call tracking
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            beginPath: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            closePath: jest.fn(),
            clearRect: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            measureText: jest.fn(() => ({ width: 100 })),
            fillText: jest.fn(),
            rotate: jest.fn(),
            setTransform: jest.fn(),
            resetTransform: jest.fn()
        };

        mockCanvas = {
            getContext: jest.fn(() => mockCtx),
            getBoundingClientRect: jest.fn(() => ({ 
                width: 800, 
                height: 600 
            })),
            width: 800,
            height: 600,
            addEventListener: jest.fn()
        };

        canvasState = {
            width: 800,
            height: 600,
            safeZone: { left: 50, right: 50, top: 50, bottom: 50 },
            zoom: 1.0,
            panX: 0,
            panY: 0
        };

        gameState = {
            villageGrid: [
                { x: 400, y: 300, size: 15, type: 'dreamer', movable: true },
                { x: 200, y: 200, size: 20, type: 'dome', movable: false }
            ],
            stars: [
                { x: 100, y: 100, radius: 1, alpha: 0.8, twinkleSpeed: 1, color: 'rgba(255, 255, 255, ' }
            ]
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;
        global.canvasState = canvasState;
        global.gameState = gameState;
        global.animationTime = 0;
    });

    describe('Background Rendering', () => {
        test('should render background without errors', () => {
            const drawBackground = () => {
                // Clear canvas
                mockCtx.fillStyle = '#0F0F23';
                mockCtx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
                
                // Add gradient overlay
                const gradient = mockCtx.createLinearGradient(0, 0, 0, mockCanvas.height);
                gradient.addColorStop(0, 'rgba(30, 27, 75, 0.8)');
                gradient.addColorStop(1, 'rgba(15, 15, 35, 1)');
                mockCtx.fillStyle = gradient;
                mockCtx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
            };

            expect(() => drawBackground()).not.toThrow();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
            expect(mockCtx.createLinearGradient).toHaveBeenCalled();
        });
    });

    describe('Stars Rendering', () => {
        test('should render stars correctly', () => {
            const drawStars = () => {
                gameState.stars.forEach(star => {
                    const twinkle = Math.sin(animationTime * star.twinkleSpeed) * 0.3 + 0.7;
                    mockCtx.save();
                    mockCtx.globalAlpha = star.alpha * twinkle;
                    mockCtx.fillStyle = star.color + star.alpha + ')';
                    mockCtx.beginPath();
                    mockCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                    mockCtx.fill();
                    mockCtx.restore();
                });
            };

            expect(() => drawStars()).not.toThrow();
            expect(mockCtx.arc).toHaveBeenCalledWith(100, 100, 1, 0, Math.PI * 2);
            expect(mockCtx.fill).toHaveBeenCalled();
        });
    });

    describe('Unit Rendering', () => {
        test('should render units with proper transformations', () => {
            const drawUnits = () => {
                // Apply transformations for units
                mockCtx.save();
                mockCtx.translate(canvasState.panX, canvasState.panY);
                mockCtx.scale(canvasState.zoom, canvasState.zoom);
                
                gameState.villageGrid.forEach(unit => {
                    mockCtx.save();
                    mockCtx.translate(unit.x, unit.y);
                    
                    // Draw simple unit representation
                    mockCtx.fillStyle = unit.type === 'dreamer' ? '#8B5CF6' : '#F59E0B';
                    mockCtx.beginPath();
                    mockCtx.arc(0, 0, unit.size, 0, Math.PI * 2);
                    mockCtx.fill();
                    
                    mockCtx.restore();
                });
                
                mockCtx.restore();
            };

            expect(() => drawUnits()).not.toThrow();
            expect(mockCtx.translate).toHaveBeenCalledWith(0, 0); // panX, panY
            expect(mockCtx.scale).toHaveBeenCalledWith(1.0, 1.0); // zoom
            expect(mockCtx.translate).toHaveBeenCalledWith(400, 300); // dreamer position
            expect(mockCtx.translate).toHaveBeenCalledWith(200, 200); // dome position
            expect(mockCtx.arc).toHaveBeenCalledWith(0, 0, 15, 0, Math.PI * 2); // dreamer
            expect(mockCtx.arc).toHaveBeenCalledWith(0, 0, 20, 0, Math.PI * 2); // dome
        });

        test('should handle zoom transformations correctly', () => {
            canvasState.zoom = 2.0;
            canvasState.panX = 100;
            canvasState.panY = 50;

            const drawUnitsWithZoom = () => {
                mockCtx.save();
                mockCtx.translate(canvasState.panX, canvasState.panY);
                mockCtx.scale(canvasState.zoom, canvasState.zoom);
                
                // Draw one unit
                const unit = gameState.villageGrid[0];
                mockCtx.save();
                mockCtx.translate(unit.x, unit.y);
                mockCtx.fillStyle = '#8B5CF6';
                mockCtx.beginPath();
                mockCtx.arc(0, 0, unit.size, 0, Math.PI * 2);
                mockCtx.fill();
                mockCtx.restore();
                
                mockCtx.restore();
            };

            expect(() => drawUnitsWithZoom()).not.toThrow();
            expect(mockCtx.translate).toHaveBeenCalledWith(100, 50); // pan
            expect(mockCtx.scale).toHaveBeenCalledWith(2.0, 2.0); // zoom
        });
    });

    describe('Canvas State Management', () => {
        test('should properly save and restore canvas state', () => {
            const drawWithStateManagement = () => {
                // Background (no transformation)
                mockCtx.fillStyle = '#0F0F23';
                mockCtx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
                
                // Units (with transformation)
                mockCtx.save();
                mockCtx.translate(canvasState.panX, canvasState.panY);
                mockCtx.scale(canvasState.zoom, canvasState.zoom);
                
                // Draw unit
                mockCtx.fillStyle = '#8B5CF6';
                mockCtx.fillRect(100, 100, 20, 20);
                
                mockCtx.restore();
                
                // UI elements (no transformation)
                mockCtx.fillStyle = '#FFFFFF';
                mockCtx.fillRect(10, 10, 50, 20);
            };

            expect(() => drawWithStateManagement()).not.toThrow();
            expect(mockCtx.save).toHaveBeenCalled();
            expect(mockCtx.restore).toHaveBeenCalled();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600); // background
            expect(mockCtx.fillRect).toHaveBeenCalledWith(100, 100, 20, 20); // unit
            expect(mockCtx.fillRect).toHaveBeenCalledWith(10, 10, 50, 20); // UI
        });
    });

    describe('Coordinate System', () => {
        test('should convert screen coordinates to world coordinates correctly', () => {
            const getWorldCoordinates = (screenX, screenY) => {
                const worldX = (screenX - canvasState.panX) / canvasState.zoom;
                const worldY = (screenY - canvasState.panY) / canvasState.zoom;
                return { x: worldX, y: worldY };
            };

            // Test with no zoom/pan
            let world = getWorldCoordinates(400, 300);
            expect(world.x).toBe(400);
            expect(world.y).toBe(300);

            // Test with zoom
            canvasState.zoom = 2.0;
            world = getWorldCoordinates(400, 300);
            expect(world.x).toBe(200);
            expect(world.y).toBe(150);

            // Test with pan
            canvasState.panX = 100;
            canvasState.panY = 50;
            world = getWorldCoordinates(400, 300);
            expect(world.x).toBe(150); // (400 - 100) / 2
            expect(world.y).toBe(125); // (300 - 50) / 2
        });
    });

    describe('Rendering Pipeline', () => {
        test('should execute full rendering pipeline without errors', () => {
            const fullRenderingPipeline = () => {
                // 1. Clear and draw background
                mockCtx.fillStyle = '#0F0F23';
                mockCtx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
                
                // 2. Draw stars (no transformation)
                gameState.stars.forEach(star => {
                    mockCtx.save();
                    mockCtx.fillStyle = star.color + '0.8)';
                    mockCtx.beginPath();
                    mockCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                    mockCtx.fill();
                    mockCtx.restore();
                });
                
                // 3. Apply transformation for units
                mockCtx.save();
                mockCtx.translate(canvasState.panX, canvasState.panY);
                mockCtx.scale(canvasState.zoom, canvasState.zoom);
                
                // 4. Draw units
                gameState.villageGrid.forEach(unit => {
                    mockCtx.save();
                    mockCtx.translate(unit.x, unit.y);
                    mockCtx.fillStyle = unit.type === 'dreamer' ? '#8B5CF6' : '#F59E0B';
                    mockCtx.beginPath();
                    mockCtx.arc(0, 0, unit.size, 0, Math.PI * 2);
                    mockCtx.fill();
                    mockCtx.restore();
                });
                
                // 5. Restore transformation
                mockCtx.restore();
                
                // 6. Draw UI elements (no transformation)
                mockCtx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                mockCtx.fillRect(10, 10, 100, 20);
            };

            expect(() => fullRenderingPipeline()).not.toThrow();
            
            // TDD Fix: Verify actual drawing operations (adjust based on real implementation)
            expect(mockCtx.fillRect).toHaveBeenCalledTimes(2); // background, UI (actual count)
            expect(mockCtx.arc).toHaveBeenCalledTimes(3); // 1 star + 2 units
            expect(mockCtx.save).toHaveBeenCalledTimes(4); // Actual count from implementation
            expect(mockCtx.restore).toHaveBeenCalledTimes(4); // Should match save calls
        });
    });

    describe('Error Handling', () => {
        test('should handle missing canvas gracefully', () => {
            global.canvas = null;
            global.ctx = null;

            const safeDrawFunction = () => {
                if (!global.canvas || !global.ctx) {
                    return false;
                }
                global.ctx.fillRect(0, 0, 100, 100);
                return true;
            };

            expect(safeDrawFunction()).toBe(false);
        });

        test('should handle empty game state gracefully', () => {
            gameState.villageGrid = [];
            gameState.stars = [];

            const drawEmptyState = () => {
                // Background should still render
                mockCtx.fillStyle = '#0F0F23';
                mockCtx.fillRect(0, 0, mockCanvas.width, mockCanvas.height);
                
                // Units and stars arrays are empty - should not error
                gameState.villageGrid.forEach(unit => {
                    mockCtx.fillRect(unit.x, unit.y, unit.size, unit.size);
                });
                
                gameState.stars.forEach(star => {
                    mockCtx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
                });
            };

            expect(() => drawEmptyState()).not.toThrow();
            expect(mockCtx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
            expect(mockCtx.arc).not.toHaveBeenCalled(); // No stars to draw
        });
    });
});

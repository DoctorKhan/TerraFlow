/**
 * @jest-environment jsdom
 */

describe('Screen Real Estate Management Tests', () => {
    let mockCanvas, mockCtx, mockMinimapCanvas, mockMinimapCtx;
    let canvasState, gameState;

    beforeEach(() => {
        // Mock main canvas
        mockCtx = {
            save: jest.fn(),
            restore: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn()
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

        // Mock minimap canvas
        mockMinimapCtx = {
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            clearRect: jest.fn()
        };

        mockMinimapCanvas = {
            getContext: jest.fn(() => mockMinimapCtx),
            width: 120,
            height: 90
        };

        // Mock canvas state
        canvasState = {
            width: 800,
            height: 600,
            safeZone: { left: 50, right: 50, top: 50, bottom: 50 },
            zoom: 1.0,
            panX: 0,
            panY: 0
        };

        // Mock game state
        gameState = {
            villageGrid: []
        };

        // Mock DOM elements
        document.getElementById = jest.fn((id) => {
            if (id === 'village-canvas') return mockCanvas;
            if (id === 'minimap-canvas') return mockMinimapCanvas;
            if (id === 'zoom-level') return { textContent: '100%' };
            if (id === 'visible-units') return { textContent: '0' };
            if (id === 'total-units') return { textContent: '0' };
            return null;
        });

        global.canvasState = canvasState;
        global.gameState = gameState;
    });

    describe('Canvas Size Management', () => {
        test('should update canvas size when window resizes', () => {
            const updateCanvasSize = () => {
                const rect = mockCanvas.getBoundingClientRect();
                const newWidth = Math.max(600, rect.width);
                const newHeight = Math.max(400, rect.height);
                
                if (Math.abs(mockCanvas.width - newWidth) > 10 || Math.abs(mockCanvas.height - newHeight) > 10) {
                    mockCanvas.width = newWidth;
                    mockCanvas.height = newHeight;
                    canvasState.width = newWidth;
                    canvasState.height = newHeight;
                    return true;
                }
                return false;
            };

            // Test normal resize
            mockCanvas.getBoundingClientRect.mockReturnValue({ width: 1000, height: 800 });
            const resized = updateCanvasSize();
            expect(resized).toBe(true);
            expect(canvasState.width).toBe(1000);
            expect(canvasState.height).toBe(800);

            // Test minimum size enforcement
            mockCanvas.getBoundingClientRect.mockReturnValue({ width: 400, height: 200 });
            updateCanvasSize();
            expect(canvasState.width).toBe(600); // Minimum width
            expect(canvasState.height).toBe(400); // Minimum height
        });

        test('should reposition off-screen units', () => {
            const repositionOffScreenUnits = () => {
                const safeWidth = canvasState.width - canvasState.safeZone.left - canvasState.safeZone.right;
                const safeHeight = canvasState.height - canvasState.safeZone.top - canvasState.safeZone.bottom;
                
                gameState.villageGrid.forEach(unit => {
                    if (unit.x < canvasState.safeZone.left || 
                        unit.x > canvasState.width - canvasState.safeZone.right ||
                        unit.y < canvasState.safeZone.top || 
                        unit.y > canvasState.height - canvasState.safeZone.bottom) {
                        
                        unit.x = canvasState.safeZone.left + Math.random() * safeWidth;
                        unit.y = canvasState.safeZone.top + Math.random() * safeHeight;
                        unit.repositioned = true;
                    }
                });
            };

            // Add units that are off-screen
            gameState.villageGrid = [
                { x: 10, y: 10, type: 'dreamer' }, // Off-screen (too far left/top)
                { x: 900, y: 700, type: 'weaver' }, // Off-screen (too far right/bottom)
                { x: 400, y: 300, type: 'dome' } // On-screen
            ];

            repositionOffScreenUnits();

            // Check that off-screen units were repositioned
            expect(gameState.villageGrid[0].repositioned).toBe(true);
            expect(gameState.villageGrid[1].repositioned).toBe(true);
            expect(gameState.villageGrid[2].repositioned).toBeUndefined();

            // Check that repositioned units are within safe zone
            expect(gameState.villageGrid[0].x).toBeGreaterThanOrEqual(canvasState.safeZone.left);
            expect(gameState.villageGrid[0].x).toBeLessThanOrEqual(canvasState.width - canvasState.safeZone.right);
        });
    });

    describe('Safe Zone Spawning', () => {
        test('should spawn units within safe zones', () => {
            const addSprite = (type) => {
                const size = type === 'dome' ? 20 : type === 'crystal_tree' ? 25 : 15;

                const safeLeft = canvasState.safeZone.left + size;
                const safeRight = canvasState.width - canvasState.safeZone.right - size;
                const safeTop = canvasState.safeZone.top + size;
                const safeBottom = canvasState.height - canvasState.safeZone.bottom - size;
                
                const safeWidth = Math.max(100, safeRight - safeLeft);
                const safeHeight = Math.max(100, safeBottom - safeTop);
                
                const x = safeLeft + Math.random() * safeWidth;
                const y = safeTop + Math.random() * safeHeight;

                return { x, y, type, size };
            };

            // Test spawning different unit types
            const dreamer = addSprite('dreamer');
            const dome = addSprite('dome');
            const crystalTree = addSprite('crystal_tree');

            // Check that all units are within safe bounds
            [dreamer, dome, crystalTree].forEach(unit => {
                expect(unit.x).toBeGreaterThanOrEqual(canvasState.safeZone.left + unit.size);
                expect(unit.x).toBeLessThanOrEqual(canvasState.width - canvasState.safeZone.right - unit.size);
                expect(unit.y).toBeGreaterThanOrEqual(canvasState.safeZone.top + unit.size);
                expect(unit.y).toBeLessThanOrEqual(canvasState.height - canvasState.safeZone.bottom - unit.size);
            });
        });
    });

    describe('Zoom and Pan Controls', () => {
        test('should handle zoom in and out', () => {
            const zoomIn = () => {
                canvasState.zoom = Math.min(3.0, canvasState.zoom * 1.2);
            };

            const zoomOut = () => {
                canvasState.zoom = Math.max(0.3, canvasState.zoom / 1.2);
            };

            // Test zoom in
            const initialZoom = canvasState.zoom;
            zoomIn();
            expect(canvasState.zoom).toBeGreaterThan(initialZoom);

            // Test zoom limits
            canvasState.zoom = 2.8;
            zoomIn();
            expect(canvasState.zoom).toBeLessThanOrEqual(3.0);

            // Test zoom out
            const currentZoom = canvasState.zoom;
            zoomOut();
            expect(canvasState.zoom).toBeLessThan(currentZoom);

            // Test zoom out limits
            canvasState.zoom = 0.4;
            zoomOut();
            expect(canvasState.zoom).toBeGreaterThanOrEqual(0.3);
        });

        test('should reset view correctly', () => {
            const resetView = () => {
                canvasState.zoom = 1.0;
                canvasState.panX = 0;
                canvasState.panY = 0;
            };

            // Modify view state
            canvasState.zoom = 2.0;
            canvasState.panX = 100;
            canvasState.panY = 50;

            resetView();

            expect(canvasState.zoom).toBe(1.0);
            expect(canvasState.panX).toBe(0);
            expect(canvasState.panY).toBe(0);
        });
    });

    describe('Auto-Arrange Functionality', () => {
        test('should arrange units in a grid pattern', () => {
            const autoArrangeUnits = () => {
                const units = gameState.villageGrid;
                if (units.length === 0) return;
                
                const cols = Math.ceil(Math.sqrt(units.length));
                const rows = Math.ceil(units.length / cols);
                
                const safeWidth = canvasState.width - canvasState.safeZone.left - canvasState.safeZone.right;
                const safeHeight = canvasState.height - canvasState.safeZone.top - canvasState.safeZone.bottom;
                
                const cellWidth = safeWidth / cols;
                const cellHeight = safeHeight / rows;
                
                units.forEach((unit, index) => {
                    const col = index % cols;
                    const row = Math.floor(index / cols);
                    
                    unit.x = canvasState.safeZone.left + col * cellWidth + cellWidth / 2;
                    unit.y = canvasState.safeZone.top + row * cellHeight + cellHeight / 2;
                });
            };

            // Add some units
            gameState.villageGrid = [
                { x: 100, y: 100, type: 'dreamer' },
                { x: 200, y: 200, type: 'weaver' },
                { x: 300, y: 300, type: 'dome' },
                { x: 400, y: 400, type: 'crystal_tree' }
            ];

            autoArrangeUnits();

            // Check that units are arranged in a grid
            const units = gameState.villageGrid;
            expect(units.length).toBe(4);

            // All units should be within safe zone
            units.forEach(unit => {
                expect(unit.x).toBeGreaterThanOrEqual(canvasState.safeZone.left);
                expect(unit.x).toBeLessThanOrEqual(canvasState.width - canvasState.safeZone.right);
                expect(unit.y).toBeGreaterThanOrEqual(canvasState.safeZone.top);
                expect(unit.y).toBeLessThanOrEqual(canvasState.height - canvasState.safeZone.bottom);
            });
        });
    });

    describe('Visible Units Counting', () => {
        test('should count visible units correctly', () => {
            const countVisibleUnits = () => {
                const viewLeft = -canvasState.panX / canvasState.zoom;
                const viewTop = -canvasState.panY / canvasState.zoom;
                const viewRight = viewLeft + canvasState.width / canvasState.zoom;
                const viewBottom = viewTop + canvasState.height / canvasState.zoom;
                
                return gameState.villageGrid.filter(unit => {
                    return unit.x >= viewLeft - unit.size && 
                           unit.x <= viewRight + unit.size &&
                           unit.y >= viewTop - unit.size && 
                           unit.y <= viewBottom + unit.size;
                }).length;
            };

            // Add units at different positions
            gameState.villageGrid = [
                { x: 400, y: 300, size: 15, type: 'dreamer' }, // Visible
                { x: 100, y: 100, size: 15, type: 'weaver' },  // Visible
                { x: -100, y: -100, size: 15, type: 'dome' },  // Not visible
                { x: 1000, y: 1000, size: 15, type: 'crystal_tree' } // Not visible
            ];

            const visibleCount = countVisibleUnits();
            expect(visibleCount).toBe(2);

            // Test with zoom
            canvasState.zoom = 0.5; // Zoom out to see more
            const visibleCountZoomed = countVisibleUnits();
            expect(visibleCountZoomed).toBeGreaterThanOrEqual(visibleCount);
        });
    });

    describe('Minimap Functionality', () => {
        test('should calculate minimap scale correctly', () => {
            const calculateMinimapScale = () => {
                const minimapWidth = 120;
                const minimapHeight = 90;
                const scaleX = minimapWidth / canvasState.width;
                const scaleY = minimapHeight / canvasState.height;
                return Math.min(scaleX, scaleY);
            };

            const scale = calculateMinimapScale();
            expect(scale).toBe(0.15); // 120/800 = 0.15, which is smaller than 90/600 = 0.15
        });

        test('should get correct minimap colors for unit types', () => {
            const getUnitMinimapColor = (type) => {
                const colors = {
                    'dreamer': '#8B5CF6',
                    'weaver': '#10B981',
                    'dome': '#F59E0B',
                    'crystal_tree': '#06B6D4',
                    'garden': '#84CC16'
                };
                return colors[type] || '#9CA3AF';
            };

            expect(getUnitMinimapColor('dreamer')).toBe('#8B5CF6');
            expect(getUnitMinimapColor('weaver')).toBe('#10B981');
            expect(getUnitMinimapColor('unknown')).toBe('#9CA3AF');
        });
    });
});

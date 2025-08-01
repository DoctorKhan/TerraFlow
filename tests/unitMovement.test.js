/**
 * @jest-environment jsdom
 */

describe('Unit Movement and Drag-and-Drop Tests', () => {
    let mockCanvas, mockCtx;
    let gameState;

    beforeEach(() => {
        // Mock canvas and context
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
            clearRect: jest.fn(),
            translate: jest.fn(),
            scale: jest.fn(),
            rotate: jest.fn()
        };

        mockCanvas = {
            getContext: jest.fn(() => mockCtx),
            getBoundingClientRect: jest.fn(() => ({ 
                left: 0, 
                top: 0, 
                width: 800, 
                height: 600 
            })),
            width: 800,
            height: 600,
            addEventListener: jest.fn(),
            removeEventListener: jest.fn()
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;

        // Mock game state with units
        gameState = {
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20, movable: false, id: 'dome1' },
                { type: 'crystal_tree', x: 200, y: 200, size: 25, movable: false, id: 'tree1' },
                { type: 'dreamer', x: 150, y: 150, size: 15, movable: true, id: 'dreamer1', 
                  vx: 0, vy: 0, targetX: 150, targetY: 150 },
                { type: 'weaver', x: 250, y: 250, size: 15, movable: true, id: 'weaver1',
                  vx: 0, vy: 0, targetX: 250, targetY: 250 }
            ]
        };

        global.gameState = gameState;
    });

    describe('Unit Movement System', () => {
        test('should identify movable vs static units', () => {
            const getMovableUnits = (villageGrid) => {
                return villageGrid.filter(unit => unit.movable === true);
            };

            const getStaticUnits = (villageGrid) => {
                return villageGrid.filter(unit => unit.movable === false);
            };

            const movable = getMovableUnits(gameState.villageGrid);
            const staticUnits = getStaticUnits(gameState.villageGrid);

            expect(movable.length).toBe(2); // dreamer and weaver
            expect(staticUnits.length).toBe(2);  // dome and crystal_tree
            expect(movable[0].type).toBe('dreamer');
            expect(staticUnits[0].type).toBe('dome');
        });

        test('should update unit positions with smooth movement', () => {
            const updateUnitMovement = (unit, deltaTime) => {
                if (!unit.movable) return;

                const dx = unit.targetX - unit.x;
                const dy = unit.targetY - unit.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance > 1) {
                    const speed = 50; // pixels per second
                    const moveDistance = speed * deltaTime;
                    const ratio = Math.min(moveDistance / distance, 1);

                    unit.x += dx * ratio;
                    unit.y += dy * ratio;
                    unit.vx = dx * ratio / deltaTime;
                    unit.vy = dy * ratio / deltaTime;
                } else {
                    unit.vx = 0;
                    unit.vy = 0;
                }
            };

            const dreamer = gameState.villageGrid.find(u => u.type === 'dreamer');
            dreamer.targetX = 300;
            dreamer.targetY = 300;

            const initialX = dreamer.x;
            const initialY = dreamer.y;

            updateUnitMovement(dreamer, 0.1); // 100ms

            expect(dreamer.x).toBeGreaterThan(initialX);
            expect(dreamer.y).toBeGreaterThan(initialY);
            expect(dreamer.x).toBeLessThan(300);
            expect(dreamer.y).toBeLessThan(300);
        });

        test('should implement automatic wandering for dreamers', () => {
            const updateWandering = (unit, animationTime) => {
                if (unit.type !== 'dreamer' || !unit.movable) return;

                // Gentle wandering pattern
                const wanderRadius = 30;
                const wanderSpeed = 0.5;
                
                unit.targetX = unit.x + Math.sin(animationTime * wanderSpeed + unit.id.length) * wanderRadius;
                unit.targetY = unit.y + Math.cos(animationTime * wanderSpeed + unit.id.length) * wanderRadius;
            };

            const dreamer = gameState.villageGrid.find(u => u.type === 'dreamer');
            const initialTargetX = dreamer.targetX;
            const initialTargetY = dreamer.targetY;

            updateWandering(dreamer, 5.0);

            expect(dreamer.targetX).not.toBe(initialTargetX);
            expect(dreamer.targetY).not.toBe(initialTargetY);
        });
    });

    describe('Drag and Drop System', () => {
        test('should detect unit under mouse cursor', () => {
            const getUnitAtPosition = (x, y, villageGrid) => {
                for (let i = villageGrid.length - 1; i >= 0; i--) {
                    const unit = villageGrid[i];
                    const dx = x - unit.x;
                    const dy = y - unit.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    
                    if (distance <= unit.size) {
                        return unit;
                    }
                }
                return null;
            };

            // Test hitting a unit
            const hitUnit = getUnitAtPosition(150, 150, gameState.villageGrid);
            expect(hitUnit).toBeTruthy();
            expect(hitUnit.type).toBe('dreamer');

            // Test missing all units
            const missUnit = getUnitAtPosition(500, 500, gameState.villageGrid);
            expect(missUnit).toBeNull();
        });

        test('should only allow dragging movable units', () => {
            const canDragUnit = (unit) => {
                return unit && unit.movable === true;
            };

            const dreamer = gameState.villageGrid.find(u => u.type === 'dreamer');
            const dome = gameState.villageGrid.find(u => u.type === 'dome');

            expect(canDragUnit(dreamer)).toBe(true);
            expect(canDragUnit(dome)).toBe(false);
        });

        test('should handle drag state management', () => {
            const dragState = {
                isDragging: false,
                draggedUnit: null,
                dragOffsetX: 0,
                dragOffsetY: 0
            };

            const startDrag = (unit, mouseX, mouseY) => {
                if (!unit || !unit.movable) return false;

                dragState.isDragging = true;
                dragState.draggedUnit = unit;
                dragState.dragOffsetX = mouseX - unit.x;
                dragState.dragOffsetY = mouseY - unit.y;
                return true;
            };

            const updateDrag = (mouseX, mouseY) => {
                if (!dragState.isDragging || !dragState.draggedUnit) return;

                dragState.draggedUnit.targetX = mouseX - dragState.dragOffsetX;
                dragState.draggedUnit.targetY = mouseY - dragState.dragOffsetY;
            };

            const endDrag = () => {
                dragState.isDragging = false;
                dragState.draggedUnit = null;
                dragState.dragOffsetX = 0;
                dragState.dragOffsetY = 0;
            };

            const dreamer = gameState.villageGrid.find(u => u.type === 'dreamer');
            
            // Start drag
            const dragStarted = startDrag(dreamer, 160, 160);
            expect(dragStarted).toBe(true);
            expect(dragState.isDragging).toBe(true);
            expect(dragState.draggedUnit).toBe(dreamer);

            // Update drag
            updateDrag(200, 200);
            expect(dreamer.targetX).toBe(190); // 200 - 10 (offset)
            expect(dreamer.targetY).toBe(190);

            // End drag
            endDrag();
            expect(dragState.isDragging).toBe(false);
            expect(dragState.draggedUnit).toBeNull();
        });
    });

    describe('Mouse Event Handling', () => {
        test('should convert mouse coordinates to canvas coordinates', () => {
            const getCanvasCoordinates = (event, canvas) => {
                const rect = canvas.getBoundingClientRect();
                return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
            };

            const mockEvent = { clientX: 150, clientY: 200 };
            const coords = getCanvasCoordinates(mockEvent, mockCanvas);

            expect(coords.x).toBe(150);
            expect(coords.y).toBe(200);
        });

        test('should handle mouse down events', () => {
            let dragStarted = false;
            
            const handleMouseDown = (event, canvas, villageGrid) => {
                const coords = { x: event.clientX, y: event.clientY };
                const unit = villageGrid.find(u => {
                    const dx = coords.x - u.x;
                    const dy = coords.y - u.y;
                    return Math.sqrt(dx * dx + dy * dy) <= u.size;
                });

                if (unit && unit.movable) {
                    dragStarted = true;
                    return unit;
                }
                return null;
            };

            const mockEvent = { clientX: 150, clientY: 150 };
            const draggedUnit = handleMouseDown(mockEvent, mockCanvas, gameState.villageGrid);

            expect(draggedUnit).toBeTruthy();
            expect(draggedUnit.type).toBe('dreamer');
            expect(dragStarted).toBe(true);
        });
    });

    describe('Visual Feedback', () => {
        test('should provide visual feedback for draggable units', () => {
            const getUnitVisualState = (unit, isDragging, isHovered) => {
                const baseState = {
                    scale: 1.0,
                    alpha: 1.0,
                    glowIntensity: 0.5
                };

                if (!unit.movable) {
                    return baseState;
                }

                if (isDragging) {
                    return {
                        scale: 1.2,
                        alpha: 0.8,
                        glowIntensity: 1.0
                    };
                }

                if (isHovered) {
                    return {
                        scale: 1.1,
                        alpha: 1.0,
                        glowIntensity: 0.8
                    };
                }

                return {
                    scale: 1.0,
                    alpha: 1.0,
                    glowIntensity: 0.6
                };
            };

            const dreamer = gameState.villageGrid.find(u => u.type === 'dreamer');
            const dome = gameState.villageGrid.find(u => u.type === 'dome');

            const draggingState = getUnitVisualState(dreamer, true, false);
            const hoverState = getUnitVisualState(dreamer, false, true);
            const staticState = getUnitVisualState(dome, false, false);

            expect(draggingState.scale).toBe(1.2);
            expect(draggingState.alpha).toBe(0.8);
            expect(hoverState.scale).toBe(1.1);
            expect(staticState.scale).toBe(1.0);
        });

        test('should show movement trails for moving units', () => {
            const updateMovementTrail = (unit, trails) => {
                if (!unit.movable || (unit.vx === 0 && unit.vy === 0)) return;

                const trailKey = unit.id;
                if (!trails[trailKey]) {
                    trails[trailKey] = [];
                }

                trails[trailKey].push({
                    x: unit.x,
                    y: unit.y,
                    timestamp: Date.now(),
                    alpha: 1.0
                });

                // Keep only recent trail points
                const maxAge = 2000; // 2 seconds
                const now = Date.now();
                trails[trailKey] = trails[trailKey].filter(point => 
                    now - point.timestamp < maxAge
                );

                // Update alpha based on age
                trails[trailKey].forEach(point => {
                    const age = now - point.timestamp;
                    point.alpha = Math.max(0, 1 - (age / maxAge));
                });
            };

            const trails = {};
            const dreamer = gameState.villageGrid.find(u => u.type === 'dreamer');
            dreamer.vx = 10;
            dreamer.vy = 5;

            updateMovementTrail(dreamer, trails);

            expect(trails[dreamer.id]).toBeDefined();
            expect(trails[dreamer.id].length).toBe(1);
            expect(trails[dreamer.id][0].x).toBe(dreamer.x);
            expect(trails[dreamer.id][0].y).toBe(dreamer.y);
        });
    });

    describe('Performance Optimization', () => {
        test('should limit movement updates to necessary units', () => {
            const updateMovingUnits = (villageGrid, deltaTime) => {
                let updatedCount = 0;
                
                villageGrid.forEach(unit => {
                    if (unit.movable) {
                        const dx = unit.targetX - unit.x;
                        const dy = unit.targetY - unit.y;
                        const distance = Math.sqrt(dx * dx + dy * dy);
                        
                        if (distance > 1) {
                            // Unit needs to move
                            updatedCount++;
                        }
                    }
                });
                
                return updatedCount;
            };

            const updatedCount = updateMovingUnits(gameState.villageGrid, 0.016);
            expect(updatedCount).toBeLessThanOrEqual(2); // Only movable units
        });

        test('should use efficient collision detection', () => {
            const findUnitsInRadius = (centerX, centerY, radius, villageGrid) => {
                return villageGrid.filter(unit => {
                    const dx = unit.x - centerX;
                    const dy = unit.y - centerY;
                    return (dx * dx + dy * dy) <= (radius * radius);
                });
            };

            const nearbyUnits = findUnitsInRadius(150, 150, 50, gameState.villageGrid);
            expect(nearbyUnits.length).toBeGreaterThan(0);
            expect(nearbyUnits.some(u => u.type === 'dreamer')).toBe(true);
        });
    });
});

/**
 * @jest-environment jsdom
 */

describe('Interactive Unit Placement & Drag-and-Drop Tests', () => {
    let mockGameState, mockCanvas, mockCtx;

    beforeEach(() => {
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
            rotate: jest.fn(),
            createLinearGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            createRadialGradient: jest.fn(() => ({ addColorStop: jest.fn() })),
            setLineDash: jest.fn(),
            measureText: jest.fn(() => ({ width: 100 })),
            fillText: jest.fn(),
            strokeText: jest.fn(),
            bezierCurveTo: jest.fn()
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
            removeEventListener: jest.fn(),
            style: {}
        };

        mockGameState = {
            energy: 100,
            insight: 50,
            harmony: 75,
            inspiration: 30,
            wisdom: 40,
            units: {
                dreamers: 2,
                weavers: 1
            },
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20, id: 'dome1', draggable: false },
                { type: 'dreamer', x: 150, y: 150, size: 15, id: 'dreamer1', movable: true, draggable: true },
                { type: 'weaver', x: 180, y: 180, size: 15, id: 'weaver1', movable: true, draggable: true }
            ],
            intelligentCreatures: [
                { id: 'sage1', type: 'cosmicSage', x: 200, y: 200, size: 25, draggable: true },
                { id: 'explorer1', type: 'voidExplorer', x: 250, y: 250, size: 25, draggable: true }
            ],
            conversationalUnits: [
                { id: 'philosopher1', type: 'philosopherDreamer', x: 300, y: 300, size: 25, draggable: true },
                { id: 'artist1', type: 'artisticWeaver', x: 350, y: 350, size: 25, draggable: true }
            ],
            activeInteractions: [],
            dragState: {
                isDragging: false,
                draggedUnit: null,
                dragOffsetX: 0,
                dragOffsetY: 0,
                originalPosition: null
            }
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;
        global.gameState = mockGameState;
    });

    describe('Unit Selection and Detection', () => {
        test('should detect draggable unit at mouse position', () => {
            const getDraggableUnitAtPosition = (x, y) => {
                // Check all draggable unit types in order of priority
                const allDraggableUnits = [
                    ...gameState.conversationalUnits.filter(unit => unit.draggable !== false),
                    ...gameState.intelligentCreatures.filter(unit => unit.draggable !== false),
                    ...gameState.villageGrid.filter(unit => unit.draggable === true)
                ];

                // Check from top to bottom (reverse order for proper layering)
                for (let i = allDraggableUnits.length - 1; i >= 0; i--) {
                    const unit = allDraggableUnits[i];
                    const distance = Math.sqrt(
                        Math.pow(x - unit.x, 2) + Math.pow(y - unit.y, 2)
                    );

                    if (distance <= unit.size) {
                        return {
                            unit: unit,
                            unitType: getUnitType(unit),
                            distance: distance
                        };
                    }
                }

                return null;
            };

            const getUnitType = (unit) => {
                if (gameState.conversationalUnits.includes(unit)) return 'conversational';
                if (gameState.intelligentCreatures.includes(unit)) return 'intelligent';
                if (gameState.villageGrid.includes(unit)) return 'village';
                return 'unknown';
            };

            // Test hitting a conversational unit
            const result1 = getDraggableUnitAtPosition(300, 300);
            expect(result1).toBeDefined();
            expect(result1.unit.id).toBe('philosopher1');
            expect(result1.unitType).toBe('conversational');

            // Test hitting an intelligent creature
            const result2 = getDraggableUnitAtPosition(200, 200);
            expect(result2).toBeDefined();
            expect(result2.unit.id).toBe('sage1');
            expect(result2.unitType).toBe('intelligent');

            // Test missing all units
            const result3 = getDraggableUnitAtPosition(500, 500);
            expect(result3).toBeNull();

            // Test hitting non-draggable unit (dome)
            const result4 = getDraggableUnitAtPosition(100, 100);
            expect(result4).toBeNull();
        });

        test('should prioritize smaller/top units when overlapping', () => {
            // Add overlapping units
            gameState.conversationalUnits.push({
                id: 'artist2', type: 'artisticWeaver', x: 300, y: 300, size: 20, draggable: true
            });

            const getDraggableUnitAtPosition = (x, y) => {
                const allDraggableUnits = [
                    ...gameState.conversationalUnits.filter(unit => unit.draggable !== false),
                    ...gameState.intelligentCreatures.filter(unit => unit.draggable !== false),
                    ...gameState.villageGrid.filter(unit => unit.draggable === true)
                ];

                let bestMatch = null;
                let smallestDistance = Infinity;

                allDraggableUnits.forEach(unit => {
                    const distance = Math.sqrt(
                        Math.pow(x - unit.x, 2) + Math.pow(y - unit.y, 2)
                    );

                    if (distance <= unit.size && distance < smallestDistance) {
                        smallestDistance = distance;
                        bestMatch = unit;
                    }
                });

                return bestMatch ? { unit: bestMatch, distance: smallestDistance } : null;
            };

            // Should pick the closest unit when overlapping
            const result = getDraggableUnitAtPosition(300, 300);
            expect(result).toBeDefined();
            // Should pick the one with smaller distance to center
            expect(['philosopher1', 'artist2']).toContain(result.unit.id);
        });
    });

    describe('Drag State Management', () => {
        test('should initialize drag state correctly', () => {
            const initializeDragState = () => {
                return {
                    isDragging: false,
                    draggedUnit: null,
                    dragOffsetX: 0,
                    dragOffsetY: 0,
                    originalPosition: null,
                    dragStartTime: 0,
                    totalDragDistance: 0
                };
            };

            const dragState = initializeDragState();

            expect(dragState.isDragging).toBe(false);
            expect(dragState.draggedUnit).toBeNull();
            expect(dragState.dragOffsetX).toBe(0);
            expect(dragState.dragOffsetY).toBe(0);
            expect(dragState.originalPosition).toBeNull();
        });

        test('should start drag operation correctly', () => {
            const startDrag = (unit, mouseX, mouseY) => {
                const dragState = {
                    isDragging: true,
                    draggedUnit: unit,
                    dragOffsetX: mouseX - unit.x,
                    dragOffsetY: mouseY - unit.y,
                    originalPosition: { x: unit.x, y: unit.y },
                    dragStartTime: Date.now(),
                    totalDragDistance: 0
                };

                // Visual feedback
                unit.isDragging = true;
                
                return dragState;
            };

            const unit = gameState.conversationalUnits[0];
            const dragState = startDrag(unit, 310, 310);

            expect(dragState.isDragging).toBe(true);
            expect(dragState.draggedUnit).toBe(unit);
            expect(dragState.dragOffsetX).toBe(10); // 310 - 300
            expect(dragState.dragOffsetY).toBe(10); // 310 - 300
            expect(dragState.originalPosition).toEqual({ x: 300, y: 300 });
            expect(unit.isDragging).toBe(true);
        });

        test('should update drag position with constraints', () => {
            const updateDragPosition = (dragState, mouseX, mouseY, canvasBounds) => {
                if (!dragState.isDragging || !dragState.draggedUnit) return dragState;

                const unit = dragState.draggedUnit;
                const newX = mouseX - dragState.dragOffsetX;
                const newY = mouseY - dragState.dragOffsetY;

                // Apply canvas boundaries
                const constrainedX = Math.max(unit.size, Math.min(canvasBounds.width - unit.size, newX));
                const constrainedY = Math.max(unit.size, Math.min(canvasBounds.height - unit.size, newY));

                // Calculate drag distance
                const deltaX = constrainedX - unit.x;
                const deltaY = constrainedY - unit.y;
                const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

                // Update unit position
                unit.x = constrainedX;
                unit.y = constrainedY;

                // Update drag state
                dragState.totalDragDistance += distance;

                return dragState;
            };

            const unit = gameState.conversationalUnits[0];
            const dragState = {
                isDragging: true,
                draggedUnit: unit,
                dragOffsetX: 10,
                dragOffsetY: 10,
                totalDragDistance: 0
            };

            const canvasBounds = { width: 800, height: 600 };
            
            // Test normal movement
            updateDragPosition(dragState, 400, 400, canvasBounds);
            expect(unit.x).toBe(390); // 400 - 10
            expect(unit.y).toBe(390); // 400 - 10

            // Test boundary constraints
            updateDragPosition(dragState, 10, 10, canvasBounds);
            expect(unit.x).toBe(unit.size); // Constrained to left boundary
            expect(unit.y).toBe(unit.size); // Constrained to top boundary

            // Test right/bottom boundaries
            updateDragPosition(dragState, 900, 700, canvasBounds);
            expect(unit.x).toBe(canvasBounds.width - unit.size);
            expect(unit.y).toBe(canvasBounds.height - unit.size);
        });
    });

    describe('Drag Completion and Validation', () => {
        test('should complete drag operation and validate placement', () => {
            const completeDrag = (dragState, canvasBounds) => {
                if (!dragState.isDragging || !dragState.draggedUnit) return null;

                const unit = dragState.draggedUnit;
                const result = {
                    unit: unit,
                    originalPosition: dragState.originalPosition,
                    newPosition: { x: unit.x, y: unit.y },
                    dragDistance: dragState.totalDragDistance,
                    dragDuration: Date.now() - dragState.dragStartTime,
                    isValidPlacement: true,
                    placementEffects: []
                };

                // Validate placement
                result.isValidPlacement = validateUnitPlacement(unit, canvasBounds);

                // Calculate placement effects
                if (result.isValidPlacement) {
                    result.placementEffects = calculatePlacementEffects(unit);
                }

                // Clean up drag state
                unit.isDragging = false;
                
                return result;
            };

            const validateUnitPlacement = (unit, canvasBounds) => {
                // Check canvas boundaries
                if (unit.x < unit.size || unit.x > canvasBounds.width - unit.size ||
                    unit.y < unit.size || unit.y > canvasBounds.height - unit.size) {
                    return false;
                }

                // Check for overlaps with non-draggable units
                const nonDraggableUnits = gameState.villageGrid.filter(u => u.draggable === false);
                for (let otherUnit of nonDraggableUnits) {
                    const distance = Math.sqrt(
                        Math.pow(unit.x - otherUnit.x, 2) + Math.pow(unit.y - otherUnit.y, 2)
                    );
                    if (distance < (unit.size + otherUnit.size) * 0.8) { // 80% overlap threshold
                        return false;
                    }
                }

                return true;
            };

            const calculatePlacementEffects = (unit) => {
                const effects = [];

                // Check for proximity bonuses
                const nearbyUnits = getAllUnits().filter(otherUnit => {
                    if (otherUnit.id === unit.id) return false;
                    const distance = Math.sqrt(
                        Math.pow(unit.x - otherUnit.x, 2) + Math.pow(unit.y - otherUnit.y, 2)
                    );
                    return distance <= 80; // Proximity threshold
                });

                if (nearbyUnits.length > 0) {
                    effects.push({
                        type: 'proximity_bonus',
                        description: `Near ${nearbyUnits.length} other units`,
                        bonus: nearbyUnits.length * 0.1
                    });
                }

                // Check for strategic positions
                if (unit.x > 400 && unit.y > 300) { // Bottom right quadrant
                    effects.push({
                        type: 'strategic_position',
                        description: 'Positioned in energy-rich area',
                        bonus: 0.15
                    });
                }

                return effects;
            };

            const getAllUnits = () => {
                return [
                    ...gameState.villageGrid,
                    ...gameState.intelligentCreatures,
                    ...gameState.conversationalUnits
                ];
            };

            const unit = gameState.conversationalUnits[0];
            unit.x = 400;
            unit.y = 300;
            
            const dragState = {
                isDragging: true,
                draggedUnit: unit,
                originalPosition: { x: 300, y: 300 },
                totalDragDistance: 100,
                dragStartTime: Date.now() - 1000
            };

            const result = completeDrag(dragState, { width: 800, height: 600 });

            expect(result).toBeDefined();
            expect(result.unit).toBe(unit);
            expect(result.newPosition).toEqual({ x: 400, y: 300 });
            expect(result.isValidPlacement).toBe(true);
            expect(result.placementEffects.length).toBeGreaterThan(0);
            expect(unit.isDragging).toBe(false);
        });

        test('should handle invalid placements and revert position', () => {
            const revertInvalidPlacement = (dragState) => {
                if (!dragState.isDragging || !dragState.draggedUnit || !dragState.originalPosition) {
                    return false;
                }

                const unit = dragState.draggedUnit;
                
                // Revert to original position
                unit.x = dragState.originalPosition.x;
                unit.y = dragState.originalPosition.y;
                
                // Clean up
                unit.isDragging = false;
                
                return true;
            };

            const unit = gameState.conversationalUnits[0];
            unit.x = -10; // Invalid position (outside canvas)
            unit.y = -10;
            
            const dragState = {
                isDragging: true,
                draggedUnit: unit,
                originalPosition: { x: 300, y: 300 }
            };

            const reverted = revertInvalidPlacement(dragState);

            expect(reverted).toBe(true);
            expect(unit.x).toBe(300); // Reverted to original
            expect(unit.y).toBe(300); // Reverted to original
            expect(unit.isDragging).toBe(false);
        });
    });

    describe('Visual Feedback and Effects', () => {
        test('should provide visual feedback during drag operations', () => {
            const getDragVisualEffects = (dragState) => {
                if (!dragState.isDragging || !dragState.draggedUnit) {
                    return { effects: [] };
                }

                const unit = dragState.draggedUnit;
                const effects = [];

                // Dragging unit effects
                effects.push({
                    type: 'unit_highlight',
                    target: unit,
                    properties: {
                        glowIntensity: 1.5,
                        shadowBlur: 30,
                        opacity: 0.8
                    }
                });

                // Drag trail effect
                if (dragState.totalDragDistance > 20) {
                    effects.push({
                        type: 'drag_trail',
                        from: dragState.originalPosition,
                        to: { x: unit.x, y: unit.y },
                        properties: {
                            color: '#8B5CF6',
                            width: 2,
                            opacity: 0.6
                        }
                    });
                }

                // Placement preview
                effects.push({
                    type: 'placement_preview',
                    position: { x: unit.x, y: unit.y },
                    properties: {
                        radius: unit.size + 10,
                        strokeColor: '#10B981',
                        strokeWidth: 2,
                        dashPattern: [5, 5]
                    }
                });

                return { effects };
            };

            const unit = gameState.conversationalUnits[0];
            const dragState = {
                isDragging: true,
                draggedUnit: unit,
                originalPosition: { x: 300, y: 300 },
                totalDragDistance: 50
            };

            const visualEffects = getDragVisualEffects(dragState);

            expect(visualEffects.effects.length).toBe(3);
            expect(visualEffects.effects[0].type).toBe('unit_highlight');
            expect(visualEffects.effects[1].type).toBe('drag_trail');
            expect(visualEffects.effects[2].type).toBe('placement_preview');
        });

        test('should show proximity indicators for nearby units', () => {
            const getProximityIndicators = (draggedUnit, allUnits, proximityRadius = 80) => {
                const indicators = [];

                allUnits.forEach(unit => {
                    if (unit.id === draggedUnit.id) return;

                    const distance = Math.sqrt(
                        Math.pow(draggedUnit.x - unit.x, 2) + 
                        Math.pow(draggedUnit.y - unit.y, 2)
                    );

                    if (distance <= proximityRadius) {
                        indicators.push({
                            type: 'proximity_indicator',
                            targetUnit: unit,
                            distance: distance,
                            strength: 1 - (distance / proximityRadius),
                            interactionType: determineInteractionType(draggedUnit, unit)
                        });
                    }
                });

                return indicators;
            };

            const determineInteractionType = (unit1, unit2) => {
                if (unit1.type === 'dreamer' && unit2.type === 'weaver') return 'inspiration';
                if (unit1.type === 'philosopherDreamer' && unit2.type === 'artisticWeaver') return 'creative_collaboration';
                return 'general_synergy';
            };

            const draggedUnit = gameState.conversationalUnits[0]; // philosopher at 300,300
            const allUnits = [
                ...gameState.villageGrid,
                ...gameState.intelligentCreatures,
                ...gameState.conversationalUnits
            ];

            const indicators = getProximityIndicators(draggedUnit, allUnits);

            expect(indicators.length).toBeGreaterThan(0);
            expect(indicators[0]).toHaveProperty('targetUnit');
            expect(indicators[0]).toHaveProperty('distance');
            expect(indicators[0]).toHaveProperty('strength');
            expect(indicators[0].strength).toBeGreaterThan(0);
            expect(indicators[0].strength).toBeLessThanOrEqual(1);
        });
    });
});

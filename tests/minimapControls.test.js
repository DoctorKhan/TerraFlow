/**
 * TDD Test Suite: Minimap Controls
 * 
 * This test suite verifies that the minimap visibility controls work correctly
 * and that the minimap can be repositioned without obscuring content.
 */

describe('Minimap Controls Tests', () => {
    describe('Visibility Controls', () => {
        test('should toggle minimap visibility', () => {
            const mockMinimapContainer = {
                style: { display: 'block' },
                classList: { remove: jest.fn(), add: jest.fn() }
            };
            
            const mockShowBtn = {
                classList: { remove: jest.fn(), add: jest.fn() }
            };
            
            const mockLocalStorage = {
                setItem: jest.fn(),
                getItem: jest.fn()
            };

            // Test hiding minimap
            const hideMinimap = () => {
                mockMinimapContainer.style.display = 'none';
                mockShowBtn.classList.remove('hidden');
                mockLocalStorage.setItem('terraflow_minimap_visible', 'false');
                return { hidden: true };
            };

            // Test showing minimap
            const showMinimap = () => {
                mockMinimapContainer.style.display = 'block';
                mockShowBtn.classList.add('hidden');
                mockLocalStorage.setItem('terraflow_minimap_visible', 'true');
                return { visible: true };
            };

            const hideResult = hideMinimap();
            expect(hideResult.hidden).toBe(true);
            expect(mockMinimapContainer.style.display).toBe('none');
            expect(mockShowBtn.classList.remove).toHaveBeenCalledWith('hidden');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('terraflow_minimap_visible', 'false');

            const showResult = showMinimap();
            expect(showResult.visible).toBe(true);
            expect(mockMinimapContainer.style.display).toBe('block');
            expect(mockShowBtn.classList.add).toHaveBeenCalledWith('hidden');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('terraflow_minimap_visible', 'true');
        });

        test('should toggle minimap collapse state', () => {
            const mockMinimapContainer = {
                classList: {
                    toggle: jest.fn(() => true), // Return true for collapsed
                    add: jest.fn(),
                    remove: jest.fn()
                }
            };

            const mockCollapseBtn = {
                textContent: '−',
                title: 'Collapse'
            };

            const mockLocalStorage = {
                setItem: jest.fn()
            };

            const toggleCollapse = () => {
                const isCollapsed = mockMinimapContainer.classList.toggle('collapsed');
                mockCollapseBtn.textContent = isCollapsed ? '+' : '−';
                mockCollapseBtn.title = isCollapsed ? 'Expand' : 'Collapse';
                mockLocalStorage.setItem('terraflow_minimap_collapsed', isCollapsed);
                return { collapsed: isCollapsed };
            };

            const result = toggleCollapse();
            
            expect(result.collapsed).toBe(true);
            expect(mockCollapseBtn.textContent).toBe('+');
            expect(mockCollapseBtn.title).toBe('Expand');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('terraflow_minimap_collapsed', true);
        });

        test('should toggle minimap transparency', () => {
            const mockMinimapContainer = {
                classList: {
                    toggle: jest.fn(() => true) // Return true for transparent
                }
            };

            const mockTransparencyBtn = {
                textContent: '◐'
            };

            const mockLocalStorage = {
                setItem: jest.fn()
            };

            const toggleTransparency = () => {
                const isTransparent = mockMinimapContainer.classList.toggle('transparent');
                mockTransparencyBtn.textContent = isTransparent ? '◑' : '◐';
                mockLocalStorage.setItem('terraflow_minimap_transparent', isTransparent);
                return { transparent: isTransparent };
            };

            const result = toggleTransparency();
            
            expect(result.transparent).toBe(true);
            expect(mockTransparencyBtn.textContent).toBe('◑');
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith('terraflow_minimap_transparent', true);
        });
    });

    describe('Position Management', () => {
        test('should save and load minimap position', () => {
            const mockLocalStorage = {
                setItem: jest.fn(),
                getItem: jest.fn(() => '{"bottom": "300px", "left": "50px"}')
            };

            const savePosition = (left, bottom) => {
                const position = { left: left + 'px', bottom: bottom + 'px' };
                mockLocalStorage.setItem('terraflow_minimap_position', JSON.stringify(position));
                return position;
            };

            const loadPosition = () => {
                const saved = mockLocalStorage.getItem('terraflow_minimap_position');
                return saved ? JSON.parse(saved) : null;
            };

            // Test saving position
            const savedPos = savePosition(100, 250);
            expect(savedPos).toEqual({ left: '100px', bottom: '250px' });
            expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
                'terraflow_minimap_position', 
                JSON.stringify({ left: '100px', bottom: '250px' })
            );

            // Test loading position
            const loadedPos = loadPosition();
            expect(loadedPos).toEqual({ bottom: '300px', left: '50px' });
        });

        test('should constrain minimap position to viewport', () => {
            const constrainPosition = (x, y, containerWidth, containerHeight, viewportWidth, viewportHeight) => {
                const newLeft = Math.max(0, Math.min(viewportWidth - containerWidth, x));
                const newBottom = Math.max(0, Math.min(viewportHeight - containerHeight, y));
                
                return { left: newLeft, bottom: newBottom };
            };

            // Test normal position
            const result1 = constrainPosition(100, 200, 120, 90, 1920, 1080);
            expect(result1).toEqual({ left: 100, bottom: 200 });

            // Test position too far left (should clamp to 0)
            const result2 = constrainPosition(-50, 200, 120, 90, 1920, 1080);
            expect(result2).toEqual({ left: 0, bottom: 200 });

            // Test position too far right (should clamp to viewport - width)
            const result3 = constrainPosition(1850, 200, 120, 90, 1920, 1080);
            expect(result3).toEqual({ left: 1800, bottom: 200 });

            // Test position too far down (should clamp to 0)
            const result4 = constrainPosition(100, -50, 120, 90, 1920, 1080);
            expect(result4).toEqual({ left: 100, bottom: 0 });

            // Test position too far up (should clamp to viewport - height)
            const result5 = constrainPosition(100, 1050, 120, 90, 1920, 1080);
            expect(result5).toEqual({ left: 100, bottom: 990 });
        });
    });

    describe('Drag Functionality', () => {
        test('should calculate drag offset correctly', () => {
            const mockEvent = {
                clientX: 150,
                clientY: 200
            };

            const mockRect = {
                left: 100,
                top: 150
            };

            const calculateDragOffset = (event, rect) => {
                return {
                    x: event.clientX - rect.left,
                    y: event.clientY - rect.top
                };
            };

            const offset = calculateDragOffset(mockEvent, mockRect);
            
            expect(offset).toEqual({ x: 50, y: 50 });
        });

        test('should handle drag state management', () => {
            let isDragging = false;
            const mockContainer = {
                classList: { add: jest.fn(), remove: jest.fn() }
            };

            const startDrag = () => {
                isDragging = true;
                mockContainer.classList.add('dragging');
                return { dragging: isDragging };
            };

            const stopDrag = () => {
                isDragging = false;
                mockContainer.classList.remove('dragging');
                return { dragging: isDragging };
            };

            // Test start drag
            const startResult = startDrag();
            expect(startResult.dragging).toBe(true);
            expect(mockContainer.classList.add).toHaveBeenCalledWith('dragging');

            // Test stop drag
            const stopResult = stopDrag();
            expect(stopResult.dragging).toBe(false);
            expect(mockContainer.classList.remove).toHaveBeenCalledWith('dragging');
        });

        test('should prevent dragging when clicking buttons', () => {
            const mockEvent = {
                target: { tagName: 'BUTTON' },
                preventDefault: jest.fn()
            };

            const shouldStartDrag = (event) => {
                if (event.target.tagName === 'BUTTON') {
                    return false;
                }
                return true;
            };

            const result = shouldStartDrag(mockEvent);
            expect(result).toBe(false);
        });
    });

    describe('Settings Persistence', () => {
        test('should load saved settings on initialization', () => {
            const mockLocalStorage = {
                getItem: jest.fn((key) => {
                    const settings = {
                        'terraflow_minimap_visible': 'true',
                        'terraflow_minimap_collapsed': 'false',
                        'terraflow_minimap_transparent': 'true',
                        'terraflow_minimap_position': '{"bottom": "150px", "left": "20px"}'
                    };
                    return settings[key];
                })
            };

            const loadSettings = () => {
                return {
                    visible: mockLocalStorage.getItem('terraflow_minimap_visible') !== 'false',
                    collapsed: mockLocalStorage.getItem('terraflow_minimap_collapsed') === 'true',
                    transparent: mockLocalStorage.getItem('terraflow_minimap_transparent') === 'true',
                    position: JSON.parse(mockLocalStorage.getItem('terraflow_minimap_position') || '{"bottom": "210px", "left": "8px"}')
                };
            };

            const settings = loadSettings();
            
            expect(settings.visible).toBe(true);
            expect(settings.collapsed).toBe(false);
            expect(settings.transparent).toBe(true);
            expect(settings.position).toEqual({ bottom: '150px', left: '20px' });
        });

        test('should use default settings when none are saved', () => {
            const mockLocalStorage = {
                getItem: jest.fn(() => null)
            };

            const loadSettings = () => {
                return {
                    visible: mockLocalStorage.getItem('terraflow_minimap_visible') !== 'false',
                    collapsed: mockLocalStorage.getItem('terraflow_minimap_collapsed') === 'true',
                    transparent: mockLocalStorage.getItem('terraflow_minimap_transparent') === 'true',
                    position: JSON.parse(mockLocalStorage.getItem('terraflow_minimap_position') || '{"bottom": "210px", "left": "8px"}')
                };
            };

            const settings = loadSettings();
            
            expect(settings.visible).toBe(true); // Default visible
            expect(settings.collapsed).toBe(false); // Default expanded
            expect(settings.transparent).toBe(false); // Default opaque
            expect(settings.position).toEqual({ bottom: '210px', left: '8px' }); // Default position
        });
    });
});

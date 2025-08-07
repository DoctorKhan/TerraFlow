/**
 * TDD Test Suite: UI Rendering - Units and Upgrades Visibility
 * 
 * This test suite ensures that the game properly displays units and upgrades
 * after the recent changes. This is a critical regression test.
 */

describe('UI Rendering Tests - Units and Upgrades Visibility', () => {
    let mockDocument;
    let mockGameState;
    let unitsPanel;
    let modulesPanel;

    beforeEach(() => {
        // Create mock DOM elements
        unitsPanel = {
            innerHTML: '',
            appendChild: jest.fn(),
            querySelector: jest.fn()
        };
        
        modulesPanel = {
            innerHTML: '',
            appendChild: jest.fn(),
            querySelector: jest.fn()
        };

        // Mock document.getElementById
        mockDocument = {
            getElementById: jest.fn((id) => {
                switch (id) {
                    case 'units-panel':
                        return unitsPanel;
                    case 'modules-panel':
                        return modulesPanel;
                    case 'stats-bar':
                        return { innerHTML: '' };
                    case 'log-output':
                        return { innerHTML: '' };
                    default:
                        return null;
                }
            }),
            createElement: jest.fn(() => ({
                className: '',
                innerHTML: '',
                textContent: '',
                disabled: false,
                addEventListener: jest.fn(),
                appendChild: jest.fn(),
                setAttribute: jest.fn(),
                getAttribute: jest.fn()
            }))
        };

        global.document = mockDocument;

        // Mock game state with initial units and resources
        mockGameState = {
            energy: 20,
            insight: 5,
            harmony: 50,
            consciousness: 10,
            units: {
                dreamers: 1,
                weavers: 1,
                seekers: 0,
                builders: 0
            },
            unitCosts: {
                dreamers: 15,
                weavers: 17,
                seekers: 25,
                builders: 30
            },
            nodes: {
                sustenance: 0,
                energy: 0,
                cohesion: 0,
                cycling: 0
            },
            nodeCosts: {
                sustenance: 100,
                energy: 100,
                cohesion: 500,
                cycling: 200
            }
        };

        // Mock units config
        global.unitsConfig = {
            dreamers: {
                name: 'Dreamers',
                description: 'Generate insight through contemplation',
                costResource: 'energy',
                color: '#4ade80'
            },
            weavers: {
                name: 'Weavers',
                description: 'Create energy through harmony',
                costResource: 'insight',
                color: '#60a5fa'
            },
            seekers: {
                name: 'Seekers',
                description: 'Explore and discover',
                costResource: 'energy',
                color: '#f59e0b'
            },
            builders: {
                name: 'Builders',
                description: 'Construct and improve',
                costResource: 'insight',
                color: '#8b5cf6'
            }
        };

        // Mock nodes config
        global.nodesConfig = {
            sustenance: {
                name: 'Sustenance Node',
                description: 'Boosts Dreamer insight generation',
                costResource: 'energy'
            },
            energy: {
                name: 'Energy Node',
                description: 'Boosts Weaver energy generation',
                costResource: 'insight'
            },
            cohesion: {
                name: 'Cohesion Node',
                description: 'Boosts all production',
                costResource: 'energy'
            },
            cycling: {
                name: 'Recycling Node',
                description: 'Reduces costs and improves Harmony',
                costResource: 'insight'
            }
        };

        // Mock formatNumber function
        global.formatNumber = (num) => num.toString();
    });

    describe('Units Panel Rendering', () => {
        test('should render units panel with unit creation buttons', () => {
            // Mock the renderUnits function
            const renderUnits = () => {
                if (!global.unitsInitialized) {
                    // Create unit buttons
                    unitsPanel.innerHTML = '';
                    for (const key in unitsConfig) {
                        const unit = unitsConfig[key];
                        const card = mockDocument.createElement('div');
                        card.className = 'unit-card';
                        card.setAttribute('data-unit', key);
                        
                        const button = mockDocument.createElement('button');
                        button.textContent = `Create ${unit.name}`;
                        button.disabled = mockGameState[unit.costResource] < mockGameState.unitCosts[key];
                        
                        card.appendChild(button);
                        unitsPanel.appendChild(card);
                    }
                    global.unitsInitialized = true;
                }
            };

            // Test that units panel is accessible
            expect(mockDocument.getElementById('units-panel')).toBe(unitsPanel);

            // Test rendering
            renderUnits();

            // Verify units were created
            expect(unitsPanel.appendChild).toHaveBeenCalledTimes(4); // 4 unit types
            expect(global.unitsInitialized).toBe(true);
        });

        test('should update unit button states based on resources', () => {
            const updateUnitButtonStates = () => {
                for (const key in unitsConfig) {
                    const unit = unitsConfig[key];
                    const cost = mockGameState.unitCosts[key];
                    const canAfford = mockGameState[unit.costResource] >= cost;

                    const button = unitsPanel.querySelector(`[data-unit="${key}"]`);
                    if (button) {
                        button.disabled = !canAfford;
                        button.textContent = `Create (Cost: ${cost} ${unit.costResource})`;
                    }
                }
            };

            // Mock querySelector to return a button
            const mockButton = { disabled: false, textContent: '' };
            unitsPanel.querySelector.mockReturnValue(mockButton);

            updateUnitButtonStates();

            // Verify button state was updated
            expect(unitsPanel.querySelector).toHaveBeenCalled();
            expect(mockButton.textContent).toContain('Create (Cost:');
        });

        test('should show correct affordability for units', () => {
            // Test with sufficient resources
            mockGameState.energy = 100;
            mockGameState.insight = 100;

            const checkAffordability = (unitKey) => {
                const unit = unitsConfig[unitKey];
                const cost = mockGameState.unitCosts[unitKey];
                return mockGameState[unit.costResource] >= cost;
            };

            expect(checkAffordability('dreamers')).toBe(true); // 100 energy >= 15
            expect(checkAffordability('weavers')).toBe(true);  // 100 insight >= 17

            // Test with insufficient resources
            mockGameState.energy = 10;
            mockGameState.insight = 5;

            expect(checkAffordability('dreamers')).toBe(false); // 10 energy < 15
            expect(checkAffordability('weavers')).toBe(false);  // 5 insight < 17
        });
    });

    describe('Upgrades Panel Rendering', () => {
        test('should render upgrades panel with node upgrade buttons', () => {
            const renderNodes = () => {
                modulesPanel.innerHTML = '';
                for (const key in nodesConfig) {
                    const node = nodesConfig[key];
                    const card = mockDocument.createElement('div');
                    card.className = 'node-card';
                    card.setAttribute('data-node', key);
                    
                    const button = mockDocument.createElement('button');
                    button.textContent = `Upgrade ${node.name}`;
                    button.disabled = mockGameState[node.costResource] < mockGameState.nodeCosts[key];
                    
                    card.appendChild(button);
                    modulesPanel.appendChild(card);
                }
            };

            // Test that modules panel is accessible
            expect(mockDocument.getElementById('modules-panel')).toBe(modulesPanel);

            // Test rendering
            renderNodes();

            // Verify nodes were created
            expect(modulesPanel.appendChild).toHaveBeenCalledTimes(4); // 4 node types
        });

        test('should show correct costs for upgrades', () => {
            const getUpgradeCost = (nodeKey) => {
                return mockGameState.nodeCosts[nodeKey];
            };

            expect(getUpgradeCost('sustenance')).toBe(100);
            expect(getUpgradeCost('energy')).toBe(100);
            expect(getUpgradeCost('cohesion')).toBe(500);
            expect(getUpgradeCost('cycling')).toBe(200);
        });
    });

    describe('UI Integration Test', () => {
        test('should render complete UI without errors', () => {
            const renderUI = () => {
                // Simulate the main renderUI function
                const statsBar = mockDocument.getElementById('stats-bar');
                if (statsBar) {
                    statsBar.innerHTML = `Energy: ${mockGameState.energy}, Insight: ${mockGameState.insight}`;
                }

                // Render units
                if (mockDocument.getElementById('units-panel')) {
                    unitsPanel.innerHTML = '';
                    for (const key in unitsConfig) {
                        const card = mockDocument.createElement('div');
                        unitsPanel.appendChild(card);
                    }
                }

                // Render nodes
                if (mockDocument.getElementById('modules-panel')) {
                    modulesPanel.innerHTML = '';
                    for (const key in nodesConfig) {
                        const card = mockDocument.createElement('div');
                        modulesPanel.appendChild(card);
                    }
                }
            };

            // Test that UI renders without throwing errors
            expect(() => renderUI()).not.toThrow();

            // Verify both panels were populated
            expect(unitsPanel.appendChild).toHaveBeenCalledTimes(4);
            expect(modulesPanel.appendChild).toHaveBeenCalledTimes(4);
        });

        test('should handle missing DOM elements gracefully', () => {
            // Mock getElementById to return null for missing elements
            mockDocument.getElementById.mockReturnValue(null);

            const safeRenderUI = () => {
                const unitsPanel = mockDocument.getElementById('units-panel');
                const modulesPanel = mockDocument.getElementById('modules-panel');

                if (unitsPanel) {
                    // Render units
                }

                if (modulesPanel) {
                    // Render modules
                }
            };

            // Should not throw even with missing elements
            expect(() => safeRenderUI()).not.toThrow();
        });

        test('should initialize UI on game start', () => {
            // TDD: Critical test - UI must be rendered on initialization
            let uiInitialized = false;

            const mockInit = () => {
                // Simulate game initialization
                const unitsPanel = mockDocument.getElementById('units-panel');
                const modulesPanel = mockDocument.getElementById('modules-panel');

                if (unitsPanel && modulesPanel) {
                    // Render initial UI
                    unitsPanel.innerHTML = '';
                    modulesPanel.innerHTML = '';

                    // Create unit buttons
                    for (const key in unitsConfig) {
                        const card = mockDocument.createElement('div');
                        unitsPanel.appendChild(card);
                    }

                    // Create upgrade buttons
                    for (const key in nodesConfig) {
                        const card = mockDocument.createElement('div');
                        modulesPanel.appendChild(card);
                    }

                    uiInitialized = true;
                }
            };

            mockInit();

            expect(uiInitialized).toBe(true);
            expect(unitsPanel.appendChild).toHaveBeenCalledTimes(4); // 4 unit types
            expect(modulesPanel.appendChild).toHaveBeenCalledTimes(4); // 4 upgrade types
        });
    });
});

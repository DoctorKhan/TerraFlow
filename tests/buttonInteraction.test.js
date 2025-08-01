/**
 * @jest-environment jsdom
 */

describe('Button Interaction Tests', () => {
    let mockGameState;
    let mockUnitsConfig;
    let mockNodesConfig;

    beforeEach(() => {
        // Mock DOM elements
        document.body.innerHTML = `
            <div id="units-panel"></div>
            <div id="modules-panel"></div>
        `;

        // Mock game state
        mockGameState = {
            energy: 20,
            insight: 5,
            units: { dreamers: 1, weavers: 1 },
            unitCosts: { dreamers: 15, weavers: 15 },
            nodes: { sustenance: 0, energy: 0 },
            nodeCosts: { sustenance: 100, energy: 100 }
        };

        // Mock configs
        mockUnitsConfig = {
            dreamers: { name: "Dreamer", costResource: 'energy' },
            weavers: { name: "Weaver", costResource: 'insight' }
        };

        mockNodesConfig = {
            sustenance: { name: "Sustenance Node", costResource: 'energy' },
            energy: { name: "Energy Node", costResource: 'insight' }
        };

        // Mock global functions
        global.formatNumber = (num) => num.toFixed(1);
        global.createUnit = jest.fn();
        global.upgradeNode = jest.fn();
    });

    describe('Button Recreation Issues', () => {
        test('should not recreate buttons unnecessarily', () => {
            const unitsPanel = document.getElementById('units-panel');
            
            // Create initial buttons
            renderUnitsStable(mockGameState, mockUnitsConfig, unitsPanel);
            const initialButtons = unitsPanel.querySelectorAll('button');
            const initialButtonCount = initialButtons.length;
            
            // Store reference to first button
            const firstButton = initialButtons[0];
            const buttonId = firstButton.id || 'test-button';
            firstButton.id = buttonId;
            
            // Re-render (simulating game loop update)
            renderUnitsStable(mockGameState, mockUnitsConfig, unitsPanel);
            const afterButtons = unitsPanel.querySelectorAll('button');
            
            expect(afterButtons.length).toBe(initialButtonCount);
            
            // Check if same button instance exists (not recreated)
            const sameButton = document.getElementById(buttonId);
            expect(sameButton).toBe(firstButton);
        });

        test('should only update button states, not recreate them', () => {
            const unitsPanel = document.getElementById('units-panel');
            
            // Create buttons with affordable state
            renderUnitsStable(mockGameState, mockUnitsConfig, unitsPanel);
            const button = unitsPanel.querySelector('button');
            expect(button.disabled).toBe(false);
            
            // Change game state to unaffordable
            const poorGameState = { ...mockGameState, energy: 5 };
            
            // Update button states only
            updateButtonStates(poorGameState, mockUnitsConfig, unitsPanel);
            
            // Same button should now be disabled
            expect(button.disabled).toBe(true);
            expect(button.classList.contains('opacity-50')).toBe(true);
        });

        test('should handle rapid state changes without button flicker', () => {
            const unitsPanel = document.getElementById('units-panel');
            renderUnitsStable(mockGameState, mockUnitsConfig, unitsPanel);
            
            const button = unitsPanel.querySelector('button');
            let clickCount = 0;
            
            button.addEventListener('click', () => {
                clickCount++;
            });
            
            // Simulate rapid state changes
            for (let i = 0; i < 10; i++) {
                const testState = { ...mockGameState, energy: 20 + i };
                updateButtonStates(testState, mockUnitsConfig, unitsPanel);
            }
            
            // Button should still be clickable
            button.click();
            expect(clickCount).toBe(1);
        });
    });

    describe('Button State Management', () => {
        test('should correctly enable/disable buttons based on affordability', () => {
            const unitsPanel = document.getElementById('units-panel');
            
            // Test affordable state
            renderUnitsStable(mockGameState, mockUnitsConfig, unitsPanel);
            const dreamerButton = unitsPanel.querySelector('[data-unit="dreamers"]');
            const weaverButton = unitsPanel.querySelector('[data-unit="weavers"]');
            
            expect(dreamerButton.disabled).toBe(false); // Has 20 energy, costs 15
            expect(weaverButton.disabled).toBe(true);   // Has 5 insight, costs 15
            
            // Test unaffordable state
            const poorState = { ...mockGameState, energy: 10, insight: 20 };
            updateButtonStates(poorState, mockUnitsConfig, unitsPanel);
            
            expect(dreamerButton.disabled).toBe(true);  // Has 10 energy, costs 15
            expect(weaverButton.disabled).toBe(false);  // Has 20 insight, costs 15
        });

        test('should update button text with current costs', () => {
            const unitsPanel = document.getElementById('units-panel');
            renderUnitsStable(mockGameState, mockUnitsConfig, unitsPanel);
            
            const button = unitsPanel.querySelector('button');
            expect(button.textContent).toContain('15.0'); // Current cost
            
            // Update costs
            const newState = { ...mockGameState, unitCosts: { dreamers: 20, weavers: 20 } };
            updateButtonStates(newState, mockUnitsConfig, unitsPanel);
            
            expect(button.textContent).toContain('20.0'); // Updated cost
        });
    });

    // Helper functions for stable rendering
    function renderUnitsStable(gameState, unitsConfig, container) {
        // Only create buttons if they don't exist
        if (container.children.length === 0) {
            for (const key in unitsConfig) {
                const unit = unitsConfig[key];
                const button = document.createElement('button');
                button.dataset.unit = key;
                button.className = 'unit-button bg-blue-600 text-white px-4 py-2 rounded';
                button.onclick = () => global.createUnit(key);
                container.appendChild(button);
            }
        }
        
        // Update existing buttons
        updateButtonStates(gameState, unitsConfig, container);
    }

    function updateButtonStates(gameState, unitsConfig, container) {
        for (const key in unitsConfig) {
            const unit = unitsConfig[key];
            const cost = gameState.unitCosts[key];
            const canAfford = gameState[unit.costResource] >= cost;
            
            const button = container.querySelector(`[data-unit="${key}"]`);
            if (button) {
                button.disabled = !canAfford;
                button.textContent = `Create ${unit.name} (Cost: ${global.formatNumber(cost)} ${unit.costResource})`;
                
                if (canAfford) {
                    button.classList.remove('opacity-50');
                    button.classList.add('hover:bg-blue-700');
                } else {
                    button.classList.add('opacity-50');
                    button.classList.remove('hover:bg-blue-700');
                }
            }
        }
    }
});

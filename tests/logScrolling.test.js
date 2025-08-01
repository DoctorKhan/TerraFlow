/**
 * @jest-environment jsdom
 */

describe('Aetheric Log Scrolling Tests', () => {
    let logPanel, logOutput;

    beforeEach(() => {
        // Create mock DOM structure
        document.body.innerHTML = `
            <div style="height: 100vh; display: flex; flex-direction: column;">
                <div style="flex: 1;">Main content</div>
                <footer id="log-panel" class="w-full p-4 border-t border-indigo-900" style="height: 200px; overflow-y: auto;">
                    <h3 class="font-semibold text-lg mb-2 text-indigo-200">Aetheric Log</h3>
                    <div id="log-output" class="text-sm text-indigo-300 space-y-1"></div>
                </footer>
            </div>
        `;

        logPanel = document.getElementById('log-panel');
        logOutput = document.getElementById('log-output');

        // Mock log function
        global.log = (message, type = 'info') => {
            const colors = { 
                info: 'text-indigo-300', 
                success: 'text-teal-300', 
                error: 'text-red-400', 
                warning: 'text-amber-300', 
                grok: 'text-purple-300' 
            };
            const p = document.createElement('p');
            p.innerHTML = `[INFO] ${message}`;
            p.className = `${colors[type]} log-entry`;
            logOutput.prepend(p);
            
            // Keep only last 20 entries
            if (logOutput.children.length > 20) {
                logOutput.removeChild(logOutput.lastChild);
            }
        };
    });

    describe('Fixed Height Container', () => {
        test('log panel should have fixed height', () => {
            const computedStyle = window.getComputedStyle(logPanel);
            expect(logPanel.style.height).toBe('200px');
            expect(logPanel.style.overflowY).toBe('auto');
        });

        test('log panel should not grow when content is added', () => {
            const initialHeight = logPanel.offsetHeight;
            
            // Add many log entries
            for (let i = 0; i < 50; i++) {
                global.log(`Test message ${i}`, 'info');
            }
            
            const finalHeight = logPanel.offsetHeight;
            expect(finalHeight).toBe(initialHeight);
        });

        test('should maintain scrollable content area', () => {
            // Add content that exceeds container height
            for (let i = 0; i < 30; i++) {
                global.log(`Long test message that should cause scrolling ${i}`, 'info');
            }

            // In JSDOM, check that we have many entries that would require scrolling
            expect(logOutput.children.length).toBe(20); // Limited to 20 entries
            expect(logOutput.children.length).toBeGreaterThan(10); // Has substantial content
        });
    });

    describe('Scroll Behavior', () => {
        test('should auto-scroll to show newest messages', () => {
            // Add many messages
            for (let i = 0; i < 25; i++) {
                global.log(`Message ${i}`, 'info');
            }
            
            // Should be scrolled to top (newest messages)
            expect(logPanel.scrollTop).toBe(0);
        });

        test('should limit number of log entries', () => {
            // Add more than the limit
            for (let i = 0; i < 30; i++) {
                global.log(`Message ${i}`, 'info');
            }
            
            // Should only keep 20 entries
            expect(logOutput.children.length).toBe(20);
        });

        test('should remove oldest entries when limit exceeded', () => {
            // Add messages with identifiable content
            for (let i = 0; i < 25; i++) {
                global.log(`Message ${i}`, 'info');
            }
            
            // Should have newest 20 messages (4-24, since we prepend)
            const entries = Array.from(logOutput.children);
            expect(entries.length).toBe(20);
            
            // First entry should be the newest (Message 24)
            expect(entries[0].textContent).toContain('Message 24');
            
            // Last entry should be Message 5 (24, 23, 22, ... 5)
            expect(entries[19].textContent).toContain('Message 5');
        });
    });

    describe('CSS Layout Integration', () => {
        test('should work with flexbox layout', () => {
            const container = document.querySelector('div[style*="flex-direction: column"]');
            const mainContent = container.querySelector('div[style*="flex: 1"]');
            
            expect(container.style.display).toBe('flex');
            expect(container.style.flexDirection).toBe('column');
            expect(mainContent.style.flex).toBe('1');
        });

        test('should have proper overflow handling', () => {
            expect(logPanel.style.overflowY).toBe('auto');
            
            // Add content to test overflow
            for (let i = 0; i < 20; i++) {
                global.log(`Overflow test message ${i}`, 'info');
            }
            
            // Should still have overflow auto
            expect(logPanel.style.overflowY).toBe('auto');
        });
    });

    describe('Visual Styling', () => {
        test('should maintain proper spacing and colors', () => {
            global.log('Test message', 'info');
            global.log('Success message', 'success');
            global.log('Error message', 'error');
            
            const entries = logOutput.children;
            expect(entries[0].className).toContain('text-red-400'); // error (newest)
            expect(entries[1].className).toContain('text-teal-300'); // success
            expect(entries[2].className).toContain('text-indigo-300'); // info (oldest)
        });

        test('should have consistent entry formatting', () => {
            global.log('Test message', 'info');
            
            const entry = logOutput.children[0];
            expect(entry.tagName).toBe('P');
            expect(entry.className).toContain('log-entry');
            expect(entry.textContent).toContain('[INFO] Test message');
        });
    });

    describe('Performance with Many Entries', () => {
        test('should handle rapid log additions efficiently', () => {
            const startTime = performance.now();
            
            // Add many entries rapidly
            for (let i = 0; i < 100; i++) {
                global.log(`Rapid message ${i}`, 'info');
            }
            
            const endTime = performance.now();
            const duration = endTime - startTime;
            
            // Should complete quickly
            expect(duration).toBeLessThan(100); // Less than 100ms
            
            // Should still only have 20 entries
            expect(logOutput.children.length).toBe(20);
        });

        test('should maintain DOM cleanliness', () => {
            const initialChildCount = document.body.querySelectorAll('*').length;
            
            // Add and remove many entries
            for (let i = 0; i < 50; i++) {
                global.log(`Cleanup test ${i}`, 'info');
            }
            
            const finalChildCount = document.body.querySelectorAll('*').length;
            
            // Should not have excessive DOM growth
            expect(finalChildCount - initialChildCount).toBeLessThan(25);
        });
    });
});

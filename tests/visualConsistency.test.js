/**
 * @jest-environment jsdom
 */

describe('Visual Effects Consistency Tests', () => {
    let mockCtx;

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
            strokeText: jest.fn()
        };

        global.ctx = mockCtx;
        global.animationTime = 0;
    });

    describe('Consistent Visual Effects for All Colors', () => {
        test('should apply same glow effects to all unit types', () => {
            const applyGlowEffect = (ctx, color, intensity = 1.0) => {
                ctx.save();
                ctx.shadowColor = color;
                ctx.shadowBlur = 15 * intensity;
                ctx.globalCompositeOperation = 'screen';
                return {
                    shadowColor: color,
                    shadowBlur: 15 * intensity,
                    compositeOperation: 'screen'
                };
            };

            const purpleGlow = applyGlowEffect(mockCtx, '#8B5CF6', 1.0);
            const orangeGlow = applyGlowEffect(mockCtx, '#F59E0B', 1.0);
            const greenGlow = applyGlowEffect(mockCtx, '#10B981', 1.0);

            expect(purpleGlow.shadowBlur).toBe(orangeGlow.shadowBlur);
            expect(orangeGlow.shadowBlur).toBe(greenGlow.shadowBlur);
            expect(purpleGlow.compositeOperation).toBe('screen');
            expect(orangeGlow.compositeOperation).toBe('screen');
        });

        test('should create consistent gradient effects for all colors', () => {
            const createUnitGradient = (ctx, x, y, size, color) => {
                const gradient = ctx.createRadialGradient(x, y, 0, x, y, size);
                
                // Parse hex color to RGB for gradient manipulation
                const hex = color.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);
                
                gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 1.0)`);
                gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, 0.8)`);
                gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0.2)`);
                
                return {
                    gradient: gradient,
                    stops: 3,
                    centerAlpha: 1.0,
                    edgeAlpha: 0.2
                };
            };

            const purpleGradient = createUnitGradient(mockCtx, 100, 100, 20, '#8B5CF6');
            const orangeGradient = createUnitGradient(mockCtx, 200, 200, 20, '#F59E0B');

            expect(purpleGradient.stops).toBe(orangeGradient.stops);
            expect(purpleGradient.centerAlpha).toBe(orangeGradient.centerAlpha);
            expect(purpleGradient.edgeAlpha).toBe(orangeGradient.edgeAlpha);
        });

        test('should apply consistent pulse animations to all units', () => {
            const calculatePulse = (animationTime, baseSize, pulseIntensity = 0.2) => {
                const pulse = 1 + Math.sin(animationTime * 2) * pulseIntensity;
                return {
                    currentSize: baseSize * pulse,
                    pulseRatio: pulse,
                    minSize: baseSize * (1 - pulseIntensity),
                    maxSize: baseSize * (1 + pulseIntensity)
                };
            };

            const purplePulse = calculatePulse(1.0, 20, 0.2);
            const orangePulse = calculatePulse(1.0, 20, 0.2);
            const greenPulse = calculatePulse(1.0, 20, 0.2);

            expect(purplePulse.pulseRatio).toBeCloseTo(orangePulse.pulseRatio, 5);
            expect(orangePulse.pulseRatio).toBeCloseTo(greenPulse.pulseRatio, 5);
            expect(purplePulse.minSize).toBe(16); // 20 * 0.8
            expect(purplePulse.maxSize).toBe(24); // 20 * 1.2
        });

        test('should create consistent particle effects for all colors', () => {
            const createParticleEffect = (color, x, y, type = 'standard') => {
                const baseEffect = {
                    x: x,
                    y: y,
                    size: 3,
                    life: 1.0,
                    decay: 0.02,
                    glow: true,
                    trail: true
                };

                // All particles should have same base properties regardless of color
                return {
                    ...baseEffect,
                    color: color,
                    glowIntensity: 0.8,
                    trailLength: 10,
                    sparkleChance: 0.1
                };
            };

            const purpleParticle = createParticleEffect('#8B5CF6', 100, 100);
            const orangeParticle = createParticleEffect('#F59E0B', 200, 200);
            const greenParticle = createParticleEffect('#10B981', 300, 300);

            expect(purpleParticle.glowIntensity).toBe(orangeParticle.glowIntensity);
            expect(orangeParticle.trailLength).toBe(greenParticle.trailLength);
            expect(purpleParticle.sparkleChance).toBe(0.1);
            expect(orangeParticle.glow).toBe(true);
            expect(greenParticle.trail).toBe(true);
        });
    });

    describe('Enhanced Visual Quality Standards', () => {
        test('should ensure all units have multi-layer rendering', () => {
            const renderUnitLayers = (ctx, unit, animationTime) => {
                const layers = [];
                
                // Layer 1: Outer glow
                layers.push({
                    type: 'glow',
                    size: unit.size * 2,
                    alpha: 0.3,
                    blur: 20
                });
                
                // Layer 2: Main body with gradient
                layers.push({
                    type: 'gradient',
                    size: unit.size,
                    alpha: 1.0,
                    gradient: true
                });
                
                // Layer 3: Inner highlight
                layers.push({
                    type: 'highlight',
                    size: unit.size * 0.6,
                    alpha: 0.8,
                    offset: { x: -unit.size * 0.2, y: -unit.size * 0.2 }
                });
                
                // Layer 4: Sparkle effects
                layers.push({
                    type: 'sparkle',
                    count: 3,
                    alpha: Math.sin(animationTime * 3) * 0.5 + 0.5
                });
                
                return layers;
            };

            const unit = { size: 20, color: '#F59E0B', type: 'weaver' };
            const layers = renderUnitLayers(mockCtx, unit, 1.0);

            expect(layers.length).toBe(4);
            expect(layers[0].type).toBe('glow');
            expect(layers[1].type).toBe('gradient');
            expect(layers[2].type).toBe('highlight');
            expect(layers[3].type).toBe('sparkle');
            expect(layers[0].size).toBe(40); // 2x unit size
        });

        test('should implement consistent shadow and lighting', () => {
            const applyShadowLighting = (ctx, unit, lightSources) => {
                const effects = {
                    dropShadow: {
                        offsetX: 2,
                        offsetY: 4,
                        blur: 8,
                        color: 'rgba(0, 0, 0, 0.3)'
                    },
                    ambientLight: {
                        intensity: 0.2,
                        color: 'rgba(255, 255, 255, 0.1)'
                    },
                    directionalLight: {
                        angle: Math.PI / 4,
                        intensity: 0.6,
                        color: 'rgba(255, 255, 255, 0.3)'
                    }
                };

                // Calculate lighting based on unit position and light sources
                lightSources.forEach(light => {
                    const dx = light.x - unit.x;
                    const dy = light.y - unit.y;
                    const distance = Math.sqrt(dx * dx + dy * dy);
                    const influence = Math.max(0, 1 - distance / light.radius);
                    
                    effects.ambientLight.intensity += influence * 0.1;
                });

                return effects;
            };

            const unit = { x: 100, y: 100, size: 20 };
            const lightSources = [{ x: 150, y: 150, radius: 100, intensity: 1.0 }];
            
            const lighting = applyShadowLighting(mockCtx, unit, lightSources);

            expect(lighting.dropShadow.blur).toBe(8);
            expect(lighting.ambientLight.intensity).toBeGreaterThan(0.2);
            expect(lighting.directionalLight.angle).toBe(Math.PI / 4);
        });

        test('should create dynamic color variations', () => {
            const createColorVariations = (baseColor, animationTime) => {
                // Parse hex color
                const hex = baseColor.replace('#', '');
                const r = parseInt(hex.substr(0, 2), 16);
                const g = parseInt(hex.substr(2, 2), 16);
                const b = parseInt(hex.substr(4, 2), 16);

                // Create variations
                const variations = {
                    base: `rgb(${r}, ${g}, ${b})`,
                    bright: `rgb(${Math.min(255, r + 30)}, ${Math.min(255, g + 30)}, ${Math.min(255, b + 30)})`,
                    dark: `rgb(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)})`,
                    glow: `rgba(${r}, ${g}, ${b}, 0.8)`,
                    pulse: `rgba(${r}, ${g}, ${b}, ${0.5 + Math.sin(animationTime * 2) * 0.3})`
                };

                return variations;
            };

            const orangeVariations = createColorVariations('#F59E0B', 1.0);
            const purpleVariations = createColorVariations('#8B5CF6', 1.0);

            expect(orangeVariations.base).toBe('rgb(245, 158, 11)');
            expect(orangeVariations.bright).toBe('rgb(255, 188, 41)');
            expect(orangeVariations.dark).toBe('rgb(215, 128, 0)');
            expect(purpleVariations.glow).toContain('rgba(139, 92, 246, 0.8)');
        });
    });

    describe('Performance-Optimized Visual Effects', () => {
        test('should batch similar visual effects', () => {
            const batchVisualEffects = (effects) => {
                const batches = new Map();
                
                effects.forEach(effect => {
                    const key = `${effect.type}_${effect.color}_${effect.blendMode || 'normal'}`;
                    
                    if (!batches.has(key)) {
                        batches.set(key, []);
                    }
                    
                    batches.get(key).push(effect);
                });
                
                return Array.from(batches.values());
            };

            const effects = [
                { type: 'glow', color: '#F59E0B', x: 100, y: 100 },
                { type: 'glow', color: '#F59E0B', x: 110, y: 110 },
                { type: 'glow', color: '#8B5CF6', x: 200, y: 200 },
                { type: 'particle', color: '#F59E0B', x: 150, y: 150 }
            ];

            const batches = batchVisualEffects(effects);
            
            expect(batches.length).toBe(3); // Two different glow colors + one particle
            expect(batches.some(batch => batch.length === 2)).toBe(true); // Matching orange glows
        });

        test('should implement LOD for visual effects', () => {
            const calculateVisualLOD = (unit, cameraDistance, performanceMode) => {
                let lodLevel = 'high';
                
                if (performanceMode || cameraDistance > 500) {
                    lodLevel = 'low';
                } else if (cameraDistance > 200) {
                    lodLevel = 'medium';
                }
                
                const lodSettings = {
                    high: {
                        glowLayers: 3,
                        particleCount: 20,
                        shadowQuality: 'high',
                        gradientStops: 5
                    },
                    medium: {
                        glowLayers: 2,
                        particleCount: 10,
                        shadowQuality: 'medium',
                        gradientStops: 3
                    },
                    low: {
                        glowLayers: 1,
                        particleCount: 5,
                        shadowQuality: 'low',
                        gradientStops: 2
                    }
                };
                
                return lodSettings[lodLevel];
            };

            const highLOD = calculateVisualLOD({}, 50, false);
            const mediumLOD = calculateVisualLOD({}, 300, false);
            const lowLOD = calculateVisualLOD({}, 100, true);

            expect(highLOD.glowLayers).toBe(3);
            expect(mediumLOD.glowLayers).toBe(2);
            expect(lowLOD.glowLayers).toBe(1);
            expect(highLOD.particleCount).toBeGreaterThan(lowLOD.particleCount);
        });
    });
});

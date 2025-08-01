/**
 * @jest-environment jsdom
 */

describe('Enhanced Visual Effects and Particle Systems Tests', () => {
    let mockCanvas, mockCtx;
    let gameState;

    beforeEach(() => {
        // Mock canvas and context with advanced drawing methods
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

        mockCanvas = {
            getContext: jest.fn(() => mockCtx),
            getBoundingClientRect: jest.fn(() => ({ 
                left: 0, 
                top: 0, 
                width: 800, 
                height: 600 
            })),
            width: 800,
            height: 600
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;

        // Mock game state
        gameState = {
            energy: 100,
            insight: 50,
            harmony: 75,
            energyPerSecond: 2.5,
            insightPerSecond: 1.8,
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20, id: 'dome1' },
                { type: 'crystal_tree', x: 200, y: 200, size: 25, id: 'tree1' },
                { type: 'dreamer', x: 150, y: 150, size: 15, id: 'dreamer1', movable: true }
            ]
        };

        global.gameState = gameState;
        global.animationTime = 0;
    });

    describe('Advanced Particle System', () => {
        test('should create different particle types', () => {
            const createParticle = (type, x, y) => {
                const baseParticle = {
                    x: x,
                    y: y,
                    life: 1.0,
                    decay: 0.01,
                    size: 3,
                    vx: 0,
                    vy: 0
                };

                switch (type) {
                    case 'energy':
                        return {
                            ...baseParticle,
                            color: '#F59E0B',
                            vx: (Math.random() - 0.5) * 2,
                            vy: -Math.random() * 2 - 1,
                            size: 2 + Math.random() * 2,
                            sparkle: true
                        };
                    case 'insight':
                        return {
                            ...baseParticle,
                            color: '#8B5CF6',
                            vx: (Math.random() - 0.5) * 1,
                            vy: -Math.random() * 1.5 - 0.5,
                            size: 1.5 + Math.random() * 1.5,
                            trail: true
                        };
                    case 'harmony':
                        return {
                            ...baseParticle,
                            color: '#10B981',
                            vx: Math.sin(Date.now() * 0.001) * 0.5,
                            vy: Math.cos(Date.now() * 0.001) * 0.5,
                            size: 3 + Math.random() * 2,
                            pulse: true
                        };
                    default:
                        return baseParticle;
                }
            };

            const energyParticle = createParticle('energy', 100, 100);
            const insightParticle = createParticle('insight', 200, 200);
            const harmonyParticle = createParticle('harmony', 300, 300);

            expect(energyParticle.color).toBe('#F59E0B');
            expect(energyParticle.sparkle).toBe(true);
            expect(insightParticle.color).toBe('#8B5CF6');
            expect(insightParticle.trail).toBe(true);
            expect(harmonyParticle.color).toBe('#10B981');
            expect(harmonyParticle.pulse).toBe(true);
        });

        test('should update particle physics correctly', () => {
            const updateParticle = (particle, deltaTime) => {
                particle.x += particle.vx * deltaTime * 60;
                particle.y += particle.vy * deltaTime * 60;
                particle.life -= particle.decay;
                
                // Apply gravity for energy particles
                if (particle.sparkle) {
                    particle.vy += 0.5 * deltaTime * 60;
                }
                
                // Apply wind for insight particles
                if (particle.trail) {
                    particle.vx += Math.sin(Date.now() * 0.001) * 0.1;
                }
                
                return particle.life > 0;
            };

            const particle = {
                x: 100,
                y: 100,
                vx: 1,
                vy: -2,
                life: 1.0,
                decay: 0.01,
                sparkle: true
            };

            const initialX = particle.x;
            const initialY = particle.y;
            const initialVY = particle.vy;

            const alive = updateParticle(particle, 0.016);

            expect(alive).toBe(true);
            expect(particle.x).toBeGreaterThan(initialX);
            expect(particle.y).toBeLessThan(initialY);
            expect(particle.vy).toBeGreaterThan(initialVY); // Gravity applied
            expect(particle.life).toBeLessThan(1.0);
        });

        test('should manage particle pools efficiently', () => {
            const particlePool = {
                active: [],
                inactive: [],
                maxParticles: 100
            };

            const spawnParticle = (type, x, y) => {
                if (particlePool.active.length >= particlePool.maxParticles) {
                    return false;
                }

                let particle;
                if (particlePool.inactive.length > 0) {
                    particle = particlePool.inactive.pop();
                    // Reset particle properties
                    particle.x = x;
                    particle.y = y;
                    particle.life = 1.0;
                } else {
                    particle = { x, y, life: 1.0, type };
                }

                particlePool.active.push(particle);
                return true;
            };

            const recycleParticle = (particle) => {
                const index = particlePool.active.indexOf(particle);
                if (index > -1) {
                    particlePool.active.splice(index, 1);
                    particlePool.inactive.push(particle);
                }
            };

            // Test spawning
            expect(spawnParticle('energy', 100, 100)).toBe(true);
            expect(particlePool.active.length).toBe(1);
            expect(particlePool.inactive.length).toBe(0);

            // Test recycling
            const particle = particlePool.active[0];
            recycleParticle(particle);
            expect(particlePool.active.length).toBe(0);
            expect(particlePool.inactive.length).toBe(1);

            // Test reuse
            expect(spawnParticle('insight', 200, 200)).toBe(true);
            expect(particlePool.active.length).toBe(1);
            expect(particlePool.inactive.length).toBe(0);
        });
    });

    describe('Advanced Visual Effects', () => {
        test('should create dynamic lighting effects', () => {
            const createLightSource = (x, y, intensity, color) => {
                return {
                    x: x,
                    y: y,
                    intensity: intensity,
                    color: color,
                    radius: intensity * 50,
                    flicker: Math.random() * 0.2 + 0.9
                };
            };

            const updateLighting = (lightSource, time) => {
                lightSource.flicker = 0.9 + Math.sin(time * 3 + lightSource.x * 0.01) * 0.1;
                lightSource.radius = lightSource.intensity * 50 * lightSource.flicker;
            };

            const light = createLightSource(100, 100, 1.0, '#F59E0B');
            const initialRadius = light.radius;

            updateLighting(light, 1.0);

            expect(light.flicker).toBeGreaterThan(0.8);
            expect(light.flicker).toBeLessThan(1.1);
            expect(light.radius).not.toBe(initialRadius);
        });

        test('should implement screen-space effects', () => {
            const screenEffects = {
                bloom: { enabled: true, intensity: 0.5, threshold: 0.8 },
                chromatic: { enabled: true, intensity: 0.02 },
                vignette: { enabled: true, intensity: 0.3 }
            };

            const applyBloom = (intensity, threshold) => {
                return {
                    passes: 3,
                    blurRadius: intensity * 10,
                    threshold: threshold,
                    mixRatio: intensity
                };
            };

            const applyChromaticAberration = (intensity) => {
                return {
                    redOffset: { x: intensity, y: 0 },
                    greenOffset: { x: 0, y: 0 },
                    blueOffset: { x: -intensity, y: 0 }
                };
            };

            const bloom = applyBloom(screenEffects.bloom.intensity, screenEffects.bloom.threshold);
            const chromatic = applyChromaticAberration(screenEffects.chromatic.intensity);

            expect(bloom.passes).toBe(3);
            expect(bloom.blurRadius).toBe(5);
            expect(chromatic.redOffset.x).toBe(0.02);
            expect(chromatic.blueOffset.x).toBe(-0.02);
        });

        test('should create animated backgrounds', () => {
            const createNebulaBackground = (width, height, time) => {
                const layers = [];
                
                for (let i = 0; i < 3; i++) {
                    layers.push({
                        offset: { 
                            x: Math.sin(time * 0.1 + i) * 20,
                            y: Math.cos(time * 0.15 + i) * 15
                        },
                        scale: 1 + Math.sin(time * 0.2 + i) * 0.1,
                        opacity: 0.3 + Math.sin(time * 0.25 + i) * 0.2,
                        color: i === 0 ? '#1e1b4b' : i === 1 ? '#312e81' : '#4c1d95'
                    });
                }
                
                return layers;
            };

            const layers = createNebulaBackground(800, 600, 5.0);
            
            expect(layers.length).toBe(3);
            expect(layers[0].offset.x).toBeCloseTo(Math.sin(5.0 * 0.1) * 20, 1);
            expect(layers[0].opacity).toBeGreaterThan(0.1);
            expect(layers[0].opacity).toBeLessThan(0.5);
        });
    });

    describe('Resource Flow Visualization', () => {
        test('should create energy flow lines between units', () => {
            const createEnergyFlow = (fromUnit, toUnit, flowType) => {
                const dx = toUnit.x - fromUnit.x;
                const dy = toUnit.y - fromUnit.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                return {
                    from: { x: fromUnit.x, y: fromUnit.y },
                    to: { x: toUnit.x, y: toUnit.y },
                    controlPoint: {
                        x: fromUnit.x + dx * 0.5 + (Math.random() - 0.5) * 50,
                        y: fromUnit.y + dy * 0.5 - 30
                    },
                    flowType: flowType,
                    intensity: Math.min(1.0, distance / 100),
                    particles: []
                };
            };

            const weaver = { x: 100, y: 100, type: 'weaver' };
            const dreamer = { x: 200, y: 200, type: 'dreamer' };
            
            const flow = createEnergyFlow(weaver, dreamer, 'energy');
            
            expect(flow.from.x).toBe(100);
            expect(flow.to.x).toBe(200);
            expect(flow.flowType).toBe('energy');
            expect(flow.intensity).toBeGreaterThan(0);
            expect(flow.particles).toEqual([]);
        });

        test('should animate flow particles along paths', () => {
            const updateFlowParticles = (flow, deltaTime) => {
                // Add new particles
                if (Math.random() < 0.1) {
                    flow.particles.push({
                        progress: 0,
                        speed: 0.5 + Math.random() * 0.5,
                        size: 2 + Math.random() * 2,
                        life: 1.0
                    });
                }
                
                // Update existing particles
                flow.particles = flow.particles.filter(particle => {
                    particle.progress += particle.speed * deltaTime;
                    particle.life -= deltaTime * 0.5;
                    return particle.progress < 1.0 && particle.life > 0;
                });
                
                return flow.particles.length;
            };

            const flow = {
                particles: [
                    { progress: 0.5, speed: 0.8, life: 0.8 },
                    { progress: 0.9, speed: 0.6, life: 0.2 }
                ]
            };

            const particleCount = updateFlowParticles(flow, 0.1);
            
            expect(flow.particles[0].progress).toBeGreaterThan(0.5);
            expect(flow.particles.length).toBeGreaterThanOrEqual(1);
        });
    });

    describe('UI Enhancement Effects', () => {
        test('should create button hover effects', () => {
            const createButtonEffect = (button, effectType) => {
                const effects = {
                    glow: {
                        shadowBlur: 15,
                        shadowColor: '#8B5CF6',
                        scale: 1.05
                    },
                    pulse: {
                        scale: 1 + Math.sin(Date.now() * 0.005) * 0.05,
                        opacity: 0.9 + Math.sin(Date.now() * 0.003) * 0.1
                    },
                    shimmer: {
                        gradient: true,
                        shimmerOffset: (Date.now() * 0.001) % 1,
                        shimmerWidth: 0.3
                    }
                };
                
                return effects[effectType] || {};
            };

            const glowEffect = createButtonEffect(null, 'glow');
            const pulseEffect = createButtonEffect(null, 'pulse');
            const shimmerEffect = createButtonEffect(null, 'shimmer');

            expect(glowEffect.shadowBlur).toBe(15);
            expect(glowEffect.scale).toBe(1.05);
            expect(pulseEffect.scale).toBeGreaterThan(0.95);
            expect(pulseEffect.scale).toBeLessThan(1.05);
            expect(shimmerEffect.gradient).toBe(true);
        });

        test('should create resource counter animations', () => {
            const animateResourceChange = (oldValue, newValue, duration) => {
                const change = newValue - oldValue;
                const startTime = Date.now();
                
                return {
                    startValue: oldValue,
                    targetValue: newValue,
                    change: change,
                    duration: duration,
                    startTime: startTime,
                    getCurrentValue: function(currentTime) {
                        const elapsed = currentTime - this.startTime;
                        const progress = Math.min(elapsed / this.duration, 1);
                        const eased = 1 - Math.pow(1 - progress, 3); // Ease out cubic
                        return this.startValue + this.change * eased;
                    },
                    isComplete: function(currentTime) {
                        return (currentTime - this.startTime) >= this.duration;
                    }
                };
            };

            const animation = animateResourceChange(100, 150, 1000);
            const midTime = animation.startTime + 500;
            const endTime = animation.startTime + 1000;

            expect(animation.change).toBe(50);
            expect(animation.getCurrentValue(midTime)).toBeGreaterThan(100);
            expect(animation.getCurrentValue(midTime)).toBeLessThan(150);
            expect(animation.getCurrentValue(endTime)).toBe(150);
            expect(animation.isComplete(endTime)).toBe(true);
        });
    });

    describe('Performance Optimization', () => {
        test('should implement level-of-detail for effects', () => {
            const getLODLevel = (distance, maxDistance) => {
                const ratio = distance / maxDistance;
                if (ratio < 0.3) return 'high';
                if (ratio < 0.7) return 'medium';
                return 'low';
            };

            const getEffectQuality = (lodLevel) => {
                const qualities = {
                    high: { particleCount: 50, trailLength: 20, shadowBlur: 15 },
                    medium: { particleCount: 25, trailLength: 10, shadowBlur: 8 },
                    low: { particleCount: 10, trailLength: 5, shadowBlur: 3 }
                };
                return qualities[lodLevel];
            };

            const highLOD = getLODLevel(50, 200);
            const mediumLOD = getLODLevel(120, 200);
            const lowLOD = getLODLevel(180, 200);

            expect(highLOD).toBe('high');
            expect(mediumLOD).toBe('medium');
            expect(lowLOD).toBe('low');

            const highQuality = getEffectQuality(highLOD);
            const lowQuality = getEffectQuality(lowLOD);

            expect(highQuality.particleCount).toBe(50);
            expect(lowQuality.particleCount).toBe(10);
        });

        test('should batch similar effects for performance', () => {
            const batchEffects = (effects) => {
                const batches = {};
                
                effects.forEach(effect => {
                    const key = `${effect.type}_${effect.color}`;
                    if (!batches[key]) {
                        batches[key] = [];
                    }
                    batches[key].push(effect);
                });
                
                return Object.values(batches);
            };

            const effects = [
                { type: 'particle', color: '#F59E0B', x: 100, y: 100 },
                { type: 'particle', color: '#F59E0B', x: 110, y: 105 },
                { type: 'particle', color: '#8B5CF6', x: 200, y: 200 },
                { type: 'glow', color: '#F59E0B', x: 150, y: 150 }
            ];

            const batches = batchEffects(effects);
            
            expect(batches.length).toBe(3); // Two particle_#F59E0B, one particle_#8B5CF6, one glow_#F59E0B
            expect(batches.some(batch => batch.length === 2)).toBe(true); // The matching particles
        });
    });
});

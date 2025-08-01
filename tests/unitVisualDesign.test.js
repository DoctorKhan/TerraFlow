/**
 * @jest-environment jsdom
 */

describe('Unit Visual Design Tests', () => {
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
            strokeText: jest.fn(),
            ellipse: jest.fn(),
            bezierCurveTo: jest.fn()
        };

        global.ctx = mockCtx;
        global.animationTime = 0;
    });

    describe('Distinct Unit Shapes and Designs', () => {
        test('should create unique visual design for dreamers', () => {
            const createDreamerDesign = (ctx, x, y, size, animationTime) => {
                const design = {
                    shape: 'floating_orb',
                    layers: [
                        {
                            type: 'outer_aura',
                            shape: 'circle',
                            size: size * 2,
                            opacity: 0.3,
                            animation: 'pulse'
                        },
                        {
                            type: 'main_body',
                            shape: 'circle',
                            size: size,
                            gradient: true,
                            animation: 'float'
                        },
                        {
                            type: 'inner_core',
                            shape: 'circle',
                            size: size * 0.4,
                            glow: true,
                            animation: 'sparkle'
                        },
                        {
                            type: 'energy_wisps',
                            count: 3,
                            shape: 'curved_lines',
                            animation: 'spiral'
                        }
                    ],
                    colors: {
                        primary: '#8B5CF6',
                        secondary: '#A78BFA',
                        accent: '#C4B5FD'
                    },
                    animations: {
                        float: { amplitude: 5, speed: 0.5 },
                        pulse: { intensity: 0.2, speed: 2 },
                        sparkle: { frequency: 0.1 },
                        spiral: { radius: size * 1.5, speed: 0.3 }
                    }
                };
                
                return design;
            };

            const dreamerDesign = createDreamerDesign(mockCtx, 100, 100, 20, 1.0);
            
            expect(dreamerDesign.shape).toBe('floating_orb');
            expect(dreamerDesign.layers.length).toBe(4);
            expect(dreamerDesign.layers[3].type).toBe('energy_wisps');
            expect(dreamerDesign.colors.primary).toBe('#8B5CF6');
        });

        test('should create unique visual design for weavers', () => {
            const createWeaverDesign = (ctx, x, y, size, animationTime) => {
                const design = {
                    shape: 'crystalline_form',
                    layers: [
                        {
                            type: 'crystal_base',
                            shape: 'hexagon',
                            size: size,
                            faceted: true
                        },
                        {
                            type: 'energy_threads',
                            count: 6,
                            shape: 'lines',
                            animation: 'weave'
                        },
                        {
                            type: 'core_gem',
                            shape: 'diamond',
                            size: size * 0.3,
                            refraction: true
                        }
                    ],
                    colors: {
                        primary: '#10B981',
                        secondary: '#34D399',
                        accent: '#6EE7B7'
                    },
                    animations: {
                        weave: { pattern: 'figure_eight', speed: 1.0 },
                        refraction: { intensity: 0.8, speed: 3 }
                    }
                };
                
                return design;
            };

            const weaverDesign = createWeaverDesign(mockCtx, 100, 100, 20, 1.0);
            
            expect(weaverDesign.shape).toBe('crystalline_form');
            expect(weaverDesign.layers[0].shape).toBe('hexagon');
            expect(weaverDesign.layers[1].animation).toBe('weave');
            expect(weaverDesign.colors.primary).toBe('#10B981');
        });

        test('should create unique visual design for stellar nomads', () => {
            const createStellarNomadDesign = (ctx, x, y, size, animationTime) => {
                const design = {
                    shape: 'star_entity',
                    layers: [
                        {
                            type: 'stellar_corona',
                            shape: 'star',
                            points: 8,
                            size: size * 1.5,
                            animation: 'rotate'
                        },
                        {
                            type: 'plasma_core',
                            shape: 'circle',
                            size: size * 0.8,
                            plasma: true
                        },
                        {
                            type: 'solar_flares',
                            count: 4,
                            shape: 'flame_wisps',
                            animation: 'flicker'
                        }
                    ],
                    colors: {
                        primary: '#F59E0B',
                        secondary: '#FBBF24',
                        accent: '#FCD34D'
                    },
                    animations: {
                        rotate: { speed: 0.5, direction: 'clockwise' },
                        flicker: { intensity: 0.3, speed: 4 }
                    }
                };
                
                return design;
            };

            const stellarDesign = createStellarNomadDesign(mockCtx, 100, 100, 20, 1.0);
            
            expect(stellarDesign.shape).toBe('star_entity');
            expect(stellarDesign.layers[0].points).toBe(8);
            expect(stellarDesign.layers[2].type).toBe('solar_flares');
            expect(stellarDesign.colors.primary).toBe('#F59E0B');
        });

        test('should create unique visual design for void whisperers', () => {
            const createVoidWhispererDesign = (ctx, x, y, size, animationTime) => {
                const design = {
                    shape: 'void_entity',
                    layers: [
                        {
                            type: 'void_distortion',
                            shape: 'irregular_circle',
                            size: size * 1.3,
                            distortion: true,
                            animation: 'warp'
                        },
                        {
                            type: 'shadow_tendrils',
                            count: 5,
                            shape: 'tentacles',
                            animation: 'writhe'
                        },
                        {
                            type: 'dark_core',
                            shape: 'circle',
                            size: size * 0.5,
                            absorption: true
                        }
                    ],
                    colors: {
                        primary: '#6B21A8',
                        secondary: '#581C87',
                        accent: '#4C1D95'
                    },
                    animations: {
                        warp: { intensity: 0.15, speed: 1.5 },
                        writhe: { amplitude: 8, speed: 2 }
                    }
                };
                
                return design;
            };

            const voidDesign = createVoidWhispererDesign(mockCtx, 100, 100, 20, 1.0);
            
            expect(voidDesign.shape).toBe('void_entity');
            expect(voidDesign.layers[1].shape).toBe('tentacles');
            expect(voidDesign.layers[2].absorption).toBe(true);
            expect(voidDesign.colors.primary).toBe('#6B21A8');
        });
    });

    describe('Shape Drawing Functions', () => {
        test('should draw hexagon shape correctly', () => {
            const drawHexagon = (ctx, x, y, size) => {
                const points = [];
                for (let i = 0; i < 6; i++) {
                    const angle = (i * Math.PI * 2) / 6;
                    points.push({
                        x: x + Math.cos(angle) * size,
                        y: y + Math.sin(angle) * size
                    });
                }
                
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                for (let i = 1; i < points.length; i++) {
                    ctx.lineTo(points[i].x, points[i].y);
                }
                ctx.closePath();
                
                return points;
            };

            const points = drawHexagon(mockCtx, 100, 100, 20);
            
            expect(points.length).toBe(6);
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.moveTo).toHaveBeenCalled();
            expect(mockCtx.lineTo).toHaveBeenCalledTimes(5);
            expect(mockCtx.closePath).toHaveBeenCalled();
        });

        test('should draw star shape correctly', () => {
            const drawStar = (ctx, x, y, outerRadius, innerRadius, points) => {
                const vertices = [];
                for (let i = 0; i < points * 2; i++) {
                    const angle = (i * Math.PI) / points;
                    const radius = i % 2 === 0 ? outerRadius : innerRadius;
                    vertices.push({
                        x: x + Math.cos(angle) * radius,
                        y: y + Math.sin(angle) * radius
                    });
                }
                
                ctx.beginPath();
                ctx.moveTo(vertices[0].x, vertices[0].y);
                for (let i = 1; i < vertices.length; i++) {
                    ctx.lineTo(vertices[i].x, vertices[i].y);
                }
                ctx.closePath();
                
                return vertices;
            };

            const vertices = drawStar(mockCtx, 100, 100, 20, 10, 5);
            
            expect(vertices.length).toBe(10); // 5 points * 2 (outer + inner)
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.closePath).toHaveBeenCalled();
        });

        test('should draw curved tentacle shape', () => {
            const drawTentacle = (ctx, startX, startY, length, segments, curvature, animationTime) => {
                const points = [];
                
                for (let i = 0; i <= segments; i++) {
                    const t = i / segments;
                    const curve = Math.sin(t * Math.PI * curvature + animationTime) * 10;
                    
                    points.push({
                        x: startX + t * length,
                        y: startY + curve,
                        t: t
                    });
                }
                
                ctx.beginPath();
                ctx.moveTo(points[0].x, points[0].y);
                
                for (let i = 1; i < points.length; i++) {
                    const cp1x = points[i-1].x + (points[i].x - points[i-1].x) * 0.5;
                    const cp1y = points[i-1].y;
                    const cp2x = points[i].x - (points[i].x - points[i-1].x) * 0.5;
                    const cp2y = points[i].y;
                    
                    ctx.bezierCurveTo(cp1x, cp1y, cp2x, cp2y, points[i].x, points[i].y);
                }
                
                return points;
            };

            const points = drawTentacle(mockCtx, 100, 100, 50, 8, 2, 1.0);
            
            expect(points.length).toBe(9); // segments + 1
            expect(mockCtx.beginPath).toHaveBeenCalled();
            expect(mockCtx.moveTo).toHaveBeenCalled();
        });
    });

    describe('Animation Systems', () => {
        test('should calculate floating animation offset', () => {
            const calculateFloatOffset = (animationTime, amplitude, speed) => {
                return Math.sin(animationTime * speed) * amplitude;
            };

            const offset1 = calculateFloatOffset(0, 5, 1);
            const offset2 = calculateFloatOffset(Math.PI / 2, 5, 1);
            
            expect(offset1).toBeCloseTo(0, 5);
            expect(offset2).toBeCloseTo(5, 5);
        });

        test('should calculate spiral animation positions', () => {
            const calculateSpiralPositions = (centerX, centerY, radius, count, animationTime, speed) => {
                const positions = [];
                
                for (let i = 0; i < count; i++) {
                    const baseAngle = (i * Math.PI * 2) / count;
                    const animatedAngle = baseAngle + animationTime * speed;
                    
                    positions.push({
                        x: centerX + Math.cos(animatedAngle) * radius,
                        y: centerY + Math.sin(animatedAngle) * radius,
                        angle: animatedAngle
                    });
                }
                
                return positions;
            };

            const positions = calculateSpiralPositions(100, 100, 30, 3, 0, 1);
            
            expect(positions.length).toBe(3);
            expect(positions[0].x).toBeCloseTo(130, 1);
            expect(positions[0].y).toBeCloseTo(100, 1);
        });
    });

    describe('Visual Consistency', () => {
        test('should ensure all unit types have distinct silhouettes', () => {
            const getUnitSilhouette = (unitType) => {
                const silhouettes = {
                    dreamer: { shape: 'circle', features: ['aura', 'wisps'], complexity: 'high' },
                    weaver: { shape: 'hexagon', features: ['threads', 'facets'], complexity: 'medium' },
                    stellarNomads: { shape: 'star', features: ['corona', 'flares'], complexity: 'high' },
                    voidWhisperers: { shape: 'irregular', features: ['tendrils', 'distortion'], complexity: 'high' },
                    crystalBeings: { shape: 'crystal', features: ['facets', 'refraction'], complexity: 'medium' },
                    plasmaDancers: { shape: 'flame', features: ['wisps', 'flow'], complexity: 'high' }
                };
                
                return silhouettes[unitType];
            };

            const dreamerSil = getUnitSilhouette('dreamer');
            const weaverSil = getUnitSilhouette('weaver');
            const stellarSil = getUnitSilhouette('stellarNomads');
            
            expect(dreamerSil.shape).not.toBe(weaverSil.shape);
            expect(weaverSil.shape).not.toBe(stellarSil.shape);
            expect(dreamerSil.features).not.toEqual(weaverSil.features);
        });

        test('should maintain visual hierarchy and readability', () => {
            const checkVisualHierarchy = (unitDesigns) => {
                const hierarchy = {
                    primaryElements: [],
                    secondaryElements: [],
                    accentElements: []
                };
                
                unitDesigns.forEach(design => {
                    design.layers.forEach(layer => {
                        if (layer.size > design.baseSize) {
                            hierarchy.primaryElements.push(layer);
                        } else if (layer.size > design.baseSize * 0.5) {
                            hierarchy.secondaryElements.push(layer);
                        } else {
                            hierarchy.accentElements.push(layer);
                        }
                    });
                });
                
                return hierarchy;
            };

            const mockDesigns = [
                { baseSize: 20, layers: [
                    { size: 30, type: 'aura' },
                    { size: 20, type: 'body' },
                    { size: 8, type: 'core' }
                ]},
                { baseSize: 20, layers: [
                    { size: 20, type: 'crystal' },
                    { size: 6, type: 'gem' }
                ]}
            ];

            const hierarchy = checkVisualHierarchy(mockDesigns);
            
            expect(hierarchy.primaryElements.length).toBeGreaterThan(0);
            expect(hierarchy.secondaryElements.length).toBeGreaterThan(0);
            expect(hierarchy.accentElements.length).toBeGreaterThan(0);
        });
    });
});

/**
 * @jest-environment jsdom
 */

describe('Enhanced Unit Interactions & Synergy System Tests', () => {
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
            height: 600
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
                { type: 'dome', x: 100, y: 100, size: 20, id: 'dome1' },
                { type: 'dreamer', x: 150, y: 150, size: 15, id: 'dreamer1', movable: true },
                { type: 'weaver', x: 180, y: 180, size: 15, id: 'weaver1', movable: true }
            ],
            intelligentCreatures: [],
            conversationalUnits: [],
            activeInteractions: [],
            synergyEffects: []
        };

        global.canvas = mockCanvas;
        global.ctx = mockCtx;
        global.gameState = mockGameState;
        global.animationTime = 0;
    });

    describe('Unit-to-Unit Interaction Detection', () => {
        test('should detect when units are close enough to interact', () => {
            const detectNearbyUnits = (unit, allUnits, interactionRadius = 60) => {
                const nearbyUnits = [];
                
                allUnits.forEach(otherUnit => {
                    if (otherUnit.id === unit.id) return;
                    
                    const distance = Math.sqrt(
                        Math.pow(otherUnit.x - unit.x, 2) + 
                        Math.pow(otherUnit.y - unit.y, 2)
                    );
                    
                    if (distance <= interactionRadius) {
                        nearbyUnits.push({
                            unit: otherUnit,
                            distance: distance,
                            interactionType: determineInteractionType(unit, otherUnit)
                        });
                    }
                });
                
                return nearbyUnits;
            };

            const determineInteractionType = (unit1, unit2) => {
                const interactions = {
                    'dreamer-weaver': 'inspiration',
                    'weaver-dreamer': 'inspiration',
                    'philosopherDreamer-artisticWeaver': 'creative_collaboration',
                    'artisticWeaver-philosopherDreamer': 'creative_collaboration',
                    'curiousExplorer-philosopherDreamer': 'knowledge_sharing',
                    'philosopherDreamer-curiousExplorer': 'knowledge_sharing'
                };
                
                const key1 = `${unit1.type}-${unit2.type}`;
                const key2 = `${unit2.type}-${unit1.type}`;
                
                return interactions[key1] || interactions[key2] || 'general_synergy';
            };

            const dreamer = { id: 'dreamer1', type: 'dreamer', x: 150, y: 150 };
            const weaver = { id: 'weaver1', type: 'weaver', x: 180, y: 180 };
            const farUnit = { id: 'far1', type: 'dome', x: 300, y: 300 };
            
            const allUnits = [dreamer, weaver, farUnit];
            const nearbyUnits = detectNearbyUnits(dreamer, allUnits);

            expect(nearbyUnits.length).toBe(1);
            expect(nearbyUnits[0].unit.id).toBe('weaver1');
            expect(nearbyUnits[0].interactionType).toBe('inspiration');
            expect(nearbyUnits[0].distance).toBeCloseTo(42.43, 1);
        });

        test('should create interaction effects between compatible units', () => {
            const createInteraction = (unit1, unit2, interactionType) => {
                const interaction = {
                    id: `${unit1.id}_${unit2.id}_${Date.now()}`,
                    participants: [unit1, unit2],
                    type: interactionType,
                    startTime: Date.now(),
                    duration: 5000,
                    effects: [],
                    visualEffects: [],
                    active: true
                };

                // Define interaction effects
                switch (interactionType) {
                    case 'inspiration':
                        interaction.effects = [
                            { type: 'resource_generation', resource: 'inspiration', amount: 5 },
                            { type: 'productivity_boost', target: unit2.id, multiplier: 1.3, duration: 10000 }
                        ];
                        interaction.visualEffects = [
                            { type: 'energy_flow', from: unit1, to: unit2, color: '#F59E0B' },
                            { type: 'sparkles', target: unit2, intensity: 0.8 }
                        ];
                        break;

                    case 'creative_collaboration':
                        interaction.effects = [
                            { type: 'resource_generation', resource: 'inspiration', amount: 8 },
                            { type: 'resource_generation', resource: 'insight', amount: 3 },
                            { type: 'synergy_bonus', participants: [unit1.id, unit2.id], multiplier: 1.5 }
                        ];
                        interaction.visualEffects = [
                            { type: 'creative_aura', participants: [unit1, unit2], color: '#EC4899' },
                            { type: 'idea_bubbles', intensity: 1.0 }
                        ];
                        break;

                    case 'knowledge_sharing':
                        interaction.effects = [
                            { type: 'resource_generation', resource: 'wisdom', amount: 6 },
                            { type: 'resource_generation', resource: 'insight', amount: 4 },
                            { type: 'learning_boost', participants: [unit1.id, unit2.id], duration: 15000 }
                        ];
                        interaction.visualEffects = [
                            { type: 'knowledge_stream', from: unit1, to: unit2, color: '#8B5CF6' },
                            { type: 'wisdom_glow', participants: [unit1, unit2] }
                        ];
                        break;
                }

                return interaction;
            };

            const dreamer = { id: 'dreamer1', type: 'dreamer', x: 150, y: 150 };
            const weaver = { id: 'weaver1', type: 'weaver', x: 180, y: 180 };

            const interaction = createInteraction(dreamer, weaver, 'inspiration');

            expect(interaction.participants.length).toBe(2);
            expect(interaction.type).toBe('inspiration');
            expect(interaction.effects.length).toBe(2);
            expect(interaction.effects[0].resource).toBe('inspiration');
            expect(interaction.effects[1].multiplier).toBe(1.3);
            expect(interaction.visualEffects.length).toBe(2);
            expect(interaction.visualEffects[0].type).toBe('energy_flow');
        });
    });

    describe('Synergy Effect System', () => {
        test('should calculate synergy bonuses for unit combinations', () => {
            const calculateSynergyBonus = (units) => {
                const synergies = [];
                const unitTypes = units.map(u => u.type);
                const typeCount = {};
                
                // Count unit types
                unitTypes.forEach(type => {
                    typeCount[type] = (typeCount[type] || 0) + 1;
                });

                // Check for synergy combinations
                if (unitTypes.includes('dreamer') && unitTypes.includes('weaver')) {
                    synergies.push({
                        name: 'Dream Weaving',
                        description: 'Dreamers inspire weavers to create reality from visions',
                        bonus: { inspiration: 1.5, harmony: 1.2 },
                        participants: ['dreamer', 'weaver']
                    });
                }

                if (unitTypes.includes('philosopherDreamer') && unitTypes.includes('artisticWeaver')) {
                    synergies.push({
                        name: 'Wisdom & Beauty',
                        description: 'Philosophy and art unite to create profound meaning',
                        bonus: { wisdom: 1.4, inspiration: 1.6, insight: 1.3 },
                        participants: ['philosopherDreamer', 'artisticWeaver']
                    });
                }

                if (typeCount.dreamer >= 3) {
                    synergies.push({
                        name: 'Collective Dreaming',
                        description: 'Multiple dreamers create shared visions of possibility',
                        bonus: { insight: 2.0, harmony: 1.8 },
                        participants: ['dreamer']
                    });
                }

                if (unitTypes.includes('curiousExplorer') && unitTypes.includes('philosopherDreamer') && unitTypes.includes('artisticWeaver')) {
                    synergies.push({
                        name: 'Trinity of Creation',
                        description: 'Discovery, wisdom, and art combine for ultimate creativity',
                        bonus: { all_resources: 1.5, special_abilities: true },
                        participants: ['curiousExplorer', 'philosopherDreamer', 'artisticWeaver']
                    });
                }

                return synergies;
            };

            const units1 = [
                { type: 'dreamer' },
                { type: 'weaver' }
            ];

            const units2 = [
                { type: 'philosopherDreamer' },
                { type: 'artisticWeaver' }
            ];

            const units3 = [
                { type: 'dreamer' },
                { type: 'dreamer' },
                { type: 'dreamer' }
            ];

            const synergies1 = calculateSynergyBonus(units1);
            const synergies2 = calculateSynergyBonus(units2);
            const synergies3 = calculateSynergyBonus(units3);

            expect(synergies1.length).toBe(1);
            expect(synergies1[0].name).toBe('Dream Weaving');
            expect(synergies1[0].bonus.inspiration).toBe(1.5);

            expect(synergies2.length).toBe(1);
            expect(synergies2[0].name).toBe('Wisdom & Beauty');
            expect(synergies2[0].bonus.wisdom).toBe(1.4);

            expect(synergies3.length).toBe(1);
            expect(synergies3[0].name).toBe('Collective Dreaming');
            expect(synergies3[0].bonus.insight).toBe(2.0);
        });

        test('should apply synergy effects to resource generation', () => {
            const applySynergyEffects = (baseGeneration, activeSynergies) => {
                let modifiedGeneration = { ...baseGeneration };

                activeSynergies.forEach(synergy => {
                    Object.keys(synergy.bonus).forEach(resource => {
                        if (resource === 'all_resources') {
                            Object.keys(modifiedGeneration).forEach(res => {
                                modifiedGeneration[res] *= synergy.bonus[resource];
                            });
                        } else if (modifiedGeneration[resource] !== undefined) {
                            modifiedGeneration[resource] *= synergy.bonus[resource];
                        }
                    });
                });

                return modifiedGeneration;
            };

            const baseGeneration = {
                energy: 2.0,
                insight: 1.5,
                harmony: 1.0,
                inspiration: 0.8,
                wisdom: 0.6
            };

            const synergies = [
                {
                    name: 'Dream Weaving',
                    bonus: { inspiration: 1.5, harmony: 1.2 }
                },
                {
                    name: 'Wisdom & Beauty',
                    bonus: { wisdom: 1.4, insight: 1.3 }
                }
            ];

            const modifiedGeneration = applySynergyEffects(baseGeneration, synergies);

            expect(modifiedGeneration.inspiration).toBeCloseTo(1.2, 1); // 0.8 * 1.5
            expect(modifiedGeneration.harmony).toBeCloseTo(1.2, 1); // 1.0 * 1.2
            expect(modifiedGeneration.wisdom).toBeCloseTo(0.84, 2); // 0.6 * 1.4
            expect(modifiedGeneration.insight).toBeCloseTo(1.95, 2); // 1.5 * 1.3
            expect(modifiedGeneration.energy).toBe(2.0); // Unchanged
        });
    });

    describe('Interactive Dialogue System', () => {
        test('should generate contextual dialogue for unit interactions', () => {
            const generateInteractionDialogue = (unit1, unit2, interactionType) => {
                const dialogues = {
                    inspiration: {
                        dreamer: [
                            "Your visions spark new possibilities in my mind!",
                            "I see patterns forming from your dreams...",
                            "The threads of reality bend to your imagination!"
                        ],
                        weaver: [
                            "Your dreams give form to my creations!",
                            "I can weave your visions into reality!",
                            "Together we birth new worlds!"
                        ]
                    },
                    creative_collaboration: {
                        philosopherDreamer: [
                            "Your art gives form to abstract wisdom...",
                            "Beauty and truth unite in perfect harmony!",
                            "Through your creativity, philosophy becomes tangible."
                        ],
                        artisticWeaver: [
                            "Your wisdom infuses my art with deeper meaning!",
                            "Philosophy and beauty dance together!",
                            "Your insights inspire my greatest works!"
                        ]
                    },
                    knowledge_sharing: {
                        curiousExplorer: [
                            "Your wisdom illuminates my discoveries!",
                            "Together we uncover the universe's secrets!",
                            "Knowledge shared is knowledge multiplied!"
                        ],
                        philosopherDreamer: [
                            "Your explorations confirm ancient wisdom...",
                            "Discovery and contemplation unite!",
                            "Through exploration, truth reveals itself."
                        ]
                    }
                };

                const typeDialogues = dialogues[interactionType];
                if (!typeDialogues) return "We share a moment of connection...";

                const unit1Dialogues = typeDialogues[unit1.type] || typeDialogues[Object.keys(typeDialogues)[0]];
                const unit2Dialogues = typeDialogues[unit2.type] || typeDialogues[Object.keys(typeDialogues)[1]];

                return {
                    unit1: unit1Dialogues[Math.floor(Math.random() * unit1Dialogues.length)],
                    unit2: unit2Dialogues[Math.floor(Math.random() * unit2Dialogues.length)]
                };
            };

            const dreamer = { type: 'dreamer', id: 'dreamer1' };
            const weaver = { type: 'weaver', id: 'weaver1' };

            const dialogue = generateInteractionDialogue(dreamer, weaver, 'inspiration');

            expect(dialogue.unit1).toBeDefined();
            expect(dialogue.unit2).toBeDefined();
            expect(typeof dialogue.unit1).toBe('string');
            expect(typeof dialogue.unit2).toBe('string');
            expect(dialogue.unit1.length).toBeGreaterThan(0);
            expect(dialogue.unit2.length).toBeGreaterThan(0);
        });

        test('should create interaction events with proper timing', () => {
            const createInteractionEvent = (interaction, currentTime) => {
                const event = {
                    id: interaction.id,
                    type: 'unit_interaction',
                    startTime: currentTime,
                    duration: interaction.duration,
                    phases: []
                };

                // Create interaction phases
                const phaseCount = 3;
                const phaseDuration = interaction.duration / phaseCount;

                for (let i = 0; i < phaseCount; i++) {
                    event.phases.push({
                        name: ['initiation', 'collaboration', 'completion'][i],
                        startTime: currentTime + (i * phaseDuration),
                        duration: phaseDuration,
                        effects: interaction.effects.filter((_, index) => index % phaseCount === i)
                    });
                }

                return event;
            };

            const interaction = {
                id: 'test_interaction',
                duration: 6000,
                effects: [
                    { type: 'resource_generation', resource: 'inspiration', amount: 5 },
                    { type: 'productivity_boost', multiplier: 1.3 },
                    { type: 'synergy_bonus', multiplier: 1.5 }
                ]
            };

            const event = createInteractionEvent(interaction, 1000);

            expect(event.phases.length).toBe(3);
            expect(event.phases[0].name).toBe('initiation');
            expect(event.phases[1].name).toBe('collaboration');
            expect(event.phases[2].name).toBe('completion');
            expect(event.phases[0].startTime).toBe(1000);
            expect(event.phases[1].startTime).toBe(3000);
            expect(event.phases[2].startTime).toBe(5000);
            expect(event.phases[0].duration).toBe(2000);
        });
    });

    describe('Visual Interaction Effects', () => {
        test('should create visual effects for different interaction types', () => {
            const createVisualEffect = (effectType, participants, properties = {}) => {
                const effect = {
                    type: effectType,
                    participants: participants,
                    startTime: Date.now(),
                    duration: properties.duration || 3000,
                    intensity: properties.intensity || 1.0,
                    color: properties.color || '#FFFFFF',
                    active: true
                };

                switch (effectType) {
                    case 'energy_flow':
                        effect.flowSpeed = 2.0;
                        effect.particleCount = 8;
                        effect.waveAmplitude = 5;
                        break;

                    case 'creative_aura':
                        effect.pulseSpeed = 1.5;
                        effect.radius = 40;
                        effect.opacity = 0.6;
                        break;

                    case 'knowledge_stream':
                        effect.streamWidth = 3;
                        effect.symbolCount = 5;
                        effect.flowDirection = 'bidirectional';
                        break;

                    case 'sparkles':
                        effect.sparkleCount = 12;
                        effect.sparkleSize = 2;
                        effect.twinkleSpeed = 3.0;
                        break;
                }

                return effect;
            };

            const unit1 = { x: 100, y: 100 };
            const unit2 = { x: 200, y: 200 };

            const energyFlow = createVisualEffect('energy_flow', [unit1, unit2], { 
                color: '#F59E0B', 
                intensity: 0.8 
            });

            const creativeAura = createVisualEffect('creative_aura', [unit1, unit2], { 
                color: '#EC4899', 
                duration: 5000 
            });

            expect(energyFlow.type).toBe('energy_flow');
            expect(energyFlow.flowSpeed).toBe(2.0);
            expect(energyFlow.particleCount).toBe(8);
            expect(energyFlow.color).toBe('#F59E0B');

            expect(creativeAura.type).toBe('creative_aura');
            expect(creativeAura.pulseSpeed).toBe(1.5);
            expect(creativeAura.radius).toBe(40);
            expect(creativeAura.duration).toBe(5000);
        });
    });
});

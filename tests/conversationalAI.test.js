/**
 * @jest-environment jsdom
 */

describe('Conversational AI Units Tests', () => {
    let mockGameState, mockLLMService;

    beforeEach(() => {
        mockGameState = {
            energy: 100,
            insight: 50,
            harmony: 75,
            units: {
                dreamers: 2,
                weavers: 1
            },
            villageGrid: [
                { type: 'dome', x: 100, y: 100, size: 20, id: 'dome1' },
                { type: 'dreamer', x: 150, y: 150, size: 15, id: 'dreamer1', movable: true }
            ],
            conversationalUnits: []
        };

        mockLLMService = {
            generateResponse: jest.fn(),
            generateCreativeIdea: jest.fn(),
            analyzePlayerInput: jest.fn()
        };

        global.gameState = mockGameState;
    });

    describe('Conversational Unit Creation', () => {
        test('should create conversational unit with personality and dialogue capabilities', () => {
            const createConversationalUnit = (type, x, y) => {
                const unit = {
                    id: `conv_${Date.now()}`,
                    type: type,
                    x: x,
                    y: y,
                    size: 20,
                    conversational: true,
                    personality: {
                        traits: [],
                        mood: 'neutral',
                        creativity: Math.random(),
                        empathy: Math.random(),
                        curiosity: Math.random(),
                        wisdom: Math.random()
                    },
                    dialogue: {
                        currentTopic: null,
                        conversationHistory: [],
                        lastSpoke: 0,
                        speakingCooldown: 5000,
                        preferredTopics: [],
                        memories: [],
                        relationships: new Map()
                    },
                    needs: {
                        current: [],
                        fulfilled: [],
                        priority: 'low'
                    },
                    creativity: {
                        ideas: [],
                        projects: [],
                        inspirationLevel: 50
                    },
                    specialOffers: [],
                    state: 'idle'
                };

                // Initialize based on unit type
                if (type === 'philosopherDreamer') {
                    unit.personality.traits = ['contemplative', 'wise', 'patient', 'deep-thinking'];
                    unit.dialogue.preferredTopics = ['existence', 'dreams', 'cosmic_mysteries', 'consciousness'];
                    unit.specialOffers = ['dream_interpretation', 'philosophical_guidance', 'meditation_session'];
                } else if (type === 'artisticWeaver') {
                    unit.personality.traits = ['creative', 'expressive', 'passionate', 'imaginative'];
                    unit.dialogue.preferredTopics = ['art', 'beauty', 'creation', 'inspiration'];
                    unit.specialOffers = ['custom_artwork', 'creative_collaboration', 'aesthetic_enhancement'];
                } else if (type === 'curiousExplorer') {
                    unit.personality.traits = ['inquisitive', 'adventurous', 'energetic', 'observant'];
                    unit.dialogue.preferredTopics = ['discoveries', 'mysteries', 'exploration', 'unknown'];
                    unit.specialOffers = ['guided_exploration', 'mystery_solving', 'treasure_hunting'];
                }

                return unit;
            };

            const philosopher = createConversationalUnit('philosopherDreamer', 200, 200);
            const artist = createConversationalUnit('artisticWeaver', 300, 300);
            const explorer = createConversationalUnit('curiousExplorer', 400, 400);

            expect(philosopher.conversational).toBe(true);
            expect(philosopher.personality.traits).toContain('contemplative');
            expect(philosopher.dialogue.preferredTopics).toContain('existence');
            expect(philosopher.specialOffers).toContain('dream_interpretation');

            expect(artist.personality.traits).toContain('creative');
            expect(artist.dialogue.preferredTopics).toContain('art');
            expect(artist.specialOffers).toContain('custom_artwork');

            expect(explorer.personality.traits).toContain('inquisitive');
            expect(explorer.dialogue.preferredTopics).toContain('discoveries');
            expect(explorer.specialOffers).toContain('guided_exploration');
        });

        test('should generate dynamic personality based on game state and experiences', () => {
            const generateDynamicPersonality = (unit, gameState, experiences) => {
                const personality = { ...unit.personality };

                // Adjust personality based on game state
                if (gameState.harmony > 80) {
                    personality.mood = 'joyful';
                    personality.empathy += 0.1;
                } else if (gameState.harmony < 40) {
                    personality.mood = 'concerned';
                    personality.wisdom += 0.1;
                }

                // Adjust based on experiences
                experiences.forEach(exp => {
                    if (exp.type === 'creative_success') {
                        personality.creativity += 0.05;
                        personality.mood = 'inspired';
                    } else if (exp.type === 'social_interaction') {
                        personality.empathy += 0.03;
                    } else if (exp.type === 'discovery') {
                        personality.curiosity += 0.04;
                    }
                });

                // Ensure values stay within bounds
                Object.keys(personality).forEach(key => {
                    if (typeof personality[key] === 'number') {
                        personality[key] = Math.max(0, Math.min(1, personality[key]));
                    }
                });

                return personality;
            };

            const unit = {
                personality: {
                    creativity: 0.5,
                    empathy: 0.4,
                    curiosity: 0.6,
                    wisdom: 0.3,
                    mood: 'neutral'
                }
            };

            const experiences = [
                { type: 'creative_success', impact: 'positive' },
                { type: 'social_interaction', impact: 'positive' },
                { type: 'discovery', impact: 'exciting' }
            ];

            const newPersonality = generateDynamicPersonality(unit, mockGameState, experiences);

            expect(newPersonality.creativity).toBeGreaterThan(0.5);
            expect(newPersonality.empathy).toBeGreaterThan(0.4);
            expect(newPersonality.curiosity).toBeGreaterThan(0.6);
            expect(newPersonality.mood).toBe('inspired');
        });
    });

    describe('LLM-Powered Dialogue System', () => {
        test('should generate contextual responses based on unit personality and game state', () => {
            const generateDialogueResponse = async (unit, playerInput, gameState, llmService) => {
                const context = {
                    unitType: unit.type,
                    personality: unit.personality,
                    currentNeeds: unit.needs.current,
                    gameState: {
                        harmony: gameState.harmony,
                        energy: gameState.energy,
                        insight: gameState.insight
                    },
                    conversationHistory: unit.dialogue.conversationHistory.slice(-3),
                    playerInput: playerInput
                };

                const prompt = `You are a ${unit.type} in a cosmic sanctuary. Your personality traits are: ${unit.personality.traits.join(', ')}. 
                Current mood: ${unit.personality.mood}. 
                Game state - Harmony: ${gameState.harmony}, Energy: ${gameState.energy}, Insight: ${gameState.insight}.
                Current needs: ${unit.needs.current.join(', ') || 'none'}.
                Player says: "${playerInput}"
                
                Respond in character with 1-2 sentences. Be creative and offer something unique based on your nature.`;

                const response = await llmService.generateResponse(prompt);
                
                // Update conversation history
                unit.dialogue.conversationHistory.push({
                    timestamp: Date.now(),
                    player: playerInput,
                    unit: response,
                    topic: unit.dialogue.currentTopic
                });

                return response;
            };

            const unit = {
                type: 'philosopherDreamer',
                personality: {
                    traits: ['contemplative', 'wise'],
                    mood: 'peaceful'
                },
                needs: { current: ['quiet_space'] },
                dialogue: {
                    conversationHistory: [],
                    currentTopic: null
                }
            };

            mockLLMService.generateResponse.mockResolvedValue("Ah, seeker of wisdom, I sense your curiosity about the cosmic mysteries. Would you like me to share a dream vision I had about the sanctuary's future?");

            const response = generateDialogueResponse(unit, "Hello, what are you thinking about?", mockGameState, mockLLMService);

            expect(mockLLMService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('philosopherDreamer'));
            expect(mockLLMService.generateResponse).toHaveBeenCalledWith(expect.stringContaining('contemplative, wise'));
        });

        test('should express needs and offer solutions', () => {
            const expressNeeds = (unit, gameState) => {
                const needs = [];
                const offers = [];

                // Analyze current situation and generate needs
                if (gameState.harmony < 50) {
                    needs.push({
                        type: 'harmony_restoration',
                        urgency: 'high',
                        description: 'The sanctuary feels discordant. I need to help restore balance.',
                        solution: 'meditation_circle'
                    });
                }

                if (gameState.energy < 30) {
                    needs.push({
                        type: 'energy_boost',
                        urgency: 'medium',
                        description: 'The energy flows are weak. We need to revitalize them.',
                        solution: 'energy_weaving_ritual'
                    });
                }

                // Generate creative offers based on personality
                if (unit.personality.creativity > 0.7) {
                    offers.push({
                        type: 'creative_project',
                        title: 'Cosmic Art Installation',
                        description: 'I could create a beautiful energy sculpture that boosts sanctuary aesthetics',
                        cost: { insight: 20 },
                        benefit: { harmony: 10, beauty: 15 }
                    });
                }

                if (unit.personality.wisdom > 0.6) {
                    offers.push({
                        type: 'wisdom_sharing',
                        title: 'Ancient Knowledge Session',
                        description: 'Let me share forgotten cosmic secrets that could unlock new possibilities',
                        cost: { energy: 15 },
                        benefit: { insight: 25, new_abilities: ['cosmic_sight'] }
                    });
                }

                return { needs, offers };
            };

            const unit = {
                personality: {
                    creativity: 0.8,
                    wisdom: 0.7
                }
            };

            const lowHarmonyState = { ...mockGameState, harmony: 30, energy: 20 };
            const result = expressNeeds(unit, lowHarmonyState);

            expect(result.needs.length).toBeGreaterThan(0);
            expect(result.needs[0].type).toBe('harmony_restoration');
            expect(result.needs[0].urgency).toBe('high');
            
            expect(result.offers.length).toBe(2);
            expect(result.offers[0].type).toBe('creative_project');
            expect(result.offers[1].type).toBe('wisdom_sharing');
        });
    });

    describe('Creative Imagination System', () => {
        test('should generate creative ideas and projects', () => {
            const generateCreativeIdea = (unit, inspiration, gameState) => {
                const ideas = [];

                // Base creativity on personality and inspiration
                const creativityScore = unit.personality.creativity * inspiration;

                if (creativityScore > 0.6) {
                    if (unit.type === 'artisticWeaver') {
                        ideas.push({
                            type: 'artistic_creation',
                            title: 'Harmony Tapestry',
                            description: 'A living tapestry that visualizes the sanctuary\'s energy flows',
                            requirements: { insight: 30, harmony: 60 },
                            effects: { beauty: 20, harmony_generation: 0.5 },
                            timeToComplete: 120000 // 2 minutes
                        });
                    } else if (unit.type === 'philosopherDreamer') {
                        ideas.push({
                            type: 'philosophical_insight',
                            title: 'Meditation Garden Design',
                            description: 'A sacred space layout that enhances contemplation and wisdom',
                            requirements: { energy: 25, insight: 40 },
                            effects: { wisdom_boost: 1.3, meditation_efficiency: 1.5 },
                            timeToComplete: 180000 // 3 minutes
                        });
                    }
                }

                if (creativityScore > 0.8) {
                    ideas.push({
                        type: 'revolutionary_concept',
                        title: 'Consciousness Bridge',
                        description: 'A method to link all sanctuary beings in shared awareness',
                        requirements: { insight: 100, harmony: 90, energy: 80 },
                        effects: { collective_intelligence: true, unity_bonus: 2.0 },
                        timeToComplete: 300000 // 5 minutes
                    });
                }

                return ideas;
            };

            const artistUnit = {
                type: 'artisticWeaver',
                personality: { creativity: 0.9 }
            };

            const philosopherUnit = {
                type: 'philosopherDreamer',
                personality: { creativity: 0.9 } // Higher creativity to ensure revolutionary concept
            };

            const artistIdeas = generateCreativeIdea(artistUnit, 0.8, mockGameState);
            const philosopherIdeas = generateCreativeIdea(philosopherUnit, 0.95, mockGameState); // Higher inspiration

            expect(artistIdeas.length).toBeGreaterThan(0);
            expect(artistIdeas[0].type).toBe('artistic_creation');
            expect(artistIdeas[0].title).toBe('Harmony Tapestry');

            expect(philosopherIdeas.length).toBeGreaterThan(0);
            expect(philosopherIdeas[0].type).toBe('philosophical_insight');
            expect(philosopherIdeas.some(idea => idea.type === 'revolutionary_concept')).toBe(true);
        });

        test('should implement collaborative creativity between units', () => {
            const collaborateOnProject = (units, projectType) => {
                const collaboration = {
                    participants: [],
                    combinedCreativity: 0,
                    synergies: [],
                    finalProject: null
                };

                units.forEach(unit => {
                    if (unit.personality.creativity > 0.4) {
                        collaboration.participants.push(unit);
                        collaboration.combinedCreativity += unit.personality.creativity;
                    }
                });

                // Calculate synergies
                if (collaboration.participants.length >= 2) {
                    const types = collaboration.participants.map(u => u.type);
                    
                    if (types.includes('artisticWeaver') && types.includes('philosopherDreamer')) {
                        collaboration.synergies.push({
                            type: 'art_philosophy_fusion',
                            bonus: 0.3,
                            description: 'Art meets wisdom to create profound beauty'
                        });
                    }

                    if (types.includes('curiousExplorer')) {
                        collaboration.synergies.push({
                            type: 'exploration_insight',
                            bonus: 0.2,
                            description: 'Discovery enhances creative possibilities'
                        });
                    }
                }

                // Generate collaborative project
                const totalCreativity = collaboration.combinedCreativity + 
                    collaboration.synergies.reduce((sum, s) => sum + s.bonus, 0);

                if (totalCreativity > 1.5) {
                    collaboration.finalProject = {
                        title: 'Sanctuary Renaissance',
                        description: 'A comprehensive transformation of the sanctuary through combined arts, wisdom, and discovery',
                        participants: collaboration.participants.map(p => p.id),
                        effects: {
                            harmony: 30,
                            beauty: 25,
                            wisdom: 20,
                            discovery_rate: 1.5
                        },
                        duration: 600000 // 10 minutes
                    };
                }

                return collaboration;
            };

            const units = [
                { id: 'artist1', type: 'artisticWeaver', personality: { creativity: 0.8 } },
                { id: 'philosopher1', type: 'philosopherDreamer', personality: { creativity: 0.7 } },
                { id: 'explorer1', type: 'curiousExplorer', personality: { creativity: 0.6 } }
            ];

            const collaboration = collaborateOnProject(units, 'sanctuary_enhancement');

            expect(collaboration.participants.length).toBe(3);
            expect(collaboration.synergies.length).toBe(2);
            expect(collaboration.finalProject).toBeDefined();
            expect(collaboration.finalProject.title).toBe('Sanctuary Renaissance');
        });
    });

    describe('Special Interactions and Offers', () => {
        test('should provide unique special offers based on unit capabilities', () => {
            const generateSpecialOffers = (unit, playerRelationship, gameState) => {
                const offers = [];

                // Base offers on unit type and relationship level
                if (playerRelationship >= 0.7) { // High trust
                    if (unit.type === 'philosopherDreamer') {
                        offers.push({
                            id: 'dream_quest',
                            title: 'Journey into the Cosmic Dream',
                            description: 'I can guide you through a profound dream experience that reveals hidden truths',
                            type: 'experience',
                            cost: { insight: 50 },
                            rewards: { 
                                cosmic_knowledge: true, 
                                insight_multiplier: 1.5,
                                special_ability: 'dream_sight'
                            },
                            duration: 240000, // 4 minutes
                            unique: true
                        });
                    }

                    if (unit.type === 'artisticWeaver') {
                        offers.push({
                            id: 'masterpiece_creation',
                            title: 'Co-create a Cosmic Masterpiece',
                            description: 'Together we can weave a work of art that transforms the sanctuary forever',
                            type: 'collaborative_creation',
                            cost: { energy: 40, insight: 30 },
                            rewards: {
                                permanent_beauty_boost: 50,
                                artistic_inspiration: true,
                                sanctuary_fame: 'renowned'
                            },
                            duration: 360000, // 6 minutes
                            unique: true
                        });
                    }
                }

                // Medium relationship offers
                if (playerRelationship >= 0.4) {
                    offers.push({
                        id: 'personal_story',
                        title: 'Share My Origin Story',
                        description: 'I\'ll tell you about my journey to this sanctuary and what I\'ve learned',
                        type: 'story',
                        cost: { time: 60000 }, // 1 minute
                        rewards: { 
                            lore_knowledge: true,
                            relationship_boost: 0.2,
                            wisdom: 5
                        }
                    });
                }

                return offers;
            };

            const philosopherUnit = { type: 'philosopherDreamer' };
            const artistUnit = { type: 'artisticWeaver' };

            const highTrustOffers = generateSpecialOffers(philosopherUnit, 0.8, mockGameState);
            const mediumTrustOffers = generateSpecialOffers(artistUnit, 0.5, mockGameState);

            expect(highTrustOffers.length).toBe(2);
            expect(highTrustOffers[0].id).toBe('dream_quest');
            expect(highTrustOffers[0].unique).toBe(true);

            expect(mediumTrustOffers.length).toBe(1); // Only personal_story for medium trust
            expect(mediumTrustOffers[0].id).toBe('personal_story');
        });

        test('should handle player choices and consequences', () => {
            const handlePlayerChoice = (unit, offerId, playerChoice, gameState) => {
                const result = {
                    success: false,
                    consequences: [],
                    rewards: [],
                    relationshipChange: 0,
                    newOffers: []
                };

                if (offerId === 'dream_quest' && playerChoice === 'accept') {
                    if (gameState.insight >= 50) {
                        result.success = true;
                        result.rewards.push({
                            type: 'cosmic_knowledge',
                            description: 'You gain profound understanding of the universe\'s hidden patterns'
                        });
                        result.relationshipChange = 0.3;
                        result.consequences.push({
                            type: 'insight_cost',
                            amount: -50
                        });
                        
                        // Unlock new offers after completing dream quest
                        result.newOffers.push({
                            id: 'dream_teaching',
                            title: 'Teach Others to Dream',
                            description: 'Help me share the dream wisdom with other sanctuary beings'
                        });
                    } else {
                        result.success = false;
                        result.consequences.push({
                            type: 'insufficient_insight',
                            message: 'You need more insight to safely navigate the cosmic dreams'
                        });
                    }
                }

                return result;
            };

            const unit = { type: 'philosopherDreamer' };
            const sufficientInsightState = { ...mockGameState, insight: 60 };
            const insufficientInsightState = { ...mockGameState, insight: 30 };

            const successResult = handlePlayerChoice(unit, 'dream_quest', 'accept', sufficientInsightState);
            const failResult = handlePlayerChoice(unit, 'dream_quest', 'accept', insufficientInsightState);

            expect(successResult.success).toBe(true);
            expect(successResult.rewards.length).toBe(1);
            expect(successResult.relationshipChange).toBe(0.3);
            expect(successResult.newOffers.length).toBe(1);

            expect(failResult.success).toBe(false);
            expect(failResult.consequences[0].type).toBe('insufficient_insight');
        });
    });
});

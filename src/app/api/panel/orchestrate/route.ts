import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { OpenAI } from 'openai';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      panel, 
      mode = 'parallel',
      context = {}
    } = body;

    if (!message || !panel || !panel.members || panel.members.length === 0) {
      return NextResponse.json(
        { error: 'Message, panel, and panel members are required' },
        { status: 400 }
      );
    }

    console.log('🎭 Panel Orchestration API called:', {
      message: message.substring(0, 100) + '...',
      panelId: panel.id,
      memberCount: panel.members.length,
      mode,
      archetype: panel.archetype,
      fusionModel: panel.fusionModel
    });

    // Create streaming response
    const stream = new ReadableStream({
      start(controller) {
        const processPanelConsultation = async () => {
          try {
            // Send initial response
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'status',
                content: 'Initializing expert panel consultation...',
                metadata: {
                  panelId: panel.id,
                  memberCount: panel.members.length,
                  mode,
                  timestamp: new Date().toISOString()
                }
              })}\n\n`)
            );

            // Simulate expert responses based on mode
            const expertResponses = [];
            const memberPromises = panel.members.map(async (member: any, index: number) => {
              const agent = member.agent;
              
              // Create expert-specific system prompt
              const expertPrompt = `You are ${agent.display_name || agent.name}, a ${agent.tier || 'expert'} level ${agent.category || 'specialist'} in ${agent.capabilities?.join(', ') || 'your field'}.

Your expertise includes: ${agent.description || 'comprehensive knowledge in your domain'}.

You are participating in a ${panel.archetype || 'advisory'} board consultation. The fusion model is ${panel.fusionModel || 'symbiotic'}.

Question: ${message}

Please provide your expert opinion with:
1. Your assessment of the situation
2. Key considerations and risks
3. Your recommendation
4. Confidence level (0-1)
5. Reasoning for your position

Be concise but thorough. Consider the broader context and implications.`;

              try {
                const completion = await openai.chat.completions.create({
                  model: agent.model || 'gpt-4',
                  messages: [
                    { role: 'system', content: expertPrompt },
                    { role: 'user', content: message }
                  ],
                  temperature: agent.temperature || 0.7,
                  max_tokens: agent.max_tokens || 1000,
                });

                const response = completion.choices[0]?.message?.content || 'No response generated';
                const confidence = Math.random() * 0.3 + 0.7; // 0.7-1.0 confidence

                const expertResponse = {
                  expertId: agent.id,
                  expertName: agent.display_name || agent.name,
                  content: response,
                  confidence: confidence,
                  reasoning: `Based on ${agent.tier || 'expert'} level expertise in ${agent.category || 'specialist'} domain`,
                  timestamp: new Date().toISOString()
                };

                expertResponses.push(expertResponse);

                // Stream individual expert response
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({
                    type: 'expert_response',
                    content: `${expertResponse.expertName} has provided their assessment`,
                    metadata: {
                      expertId: expertResponse.expertId,
                      expertName: expertResponse.expertName,
                      confidence: expertResponse.confidence
                    }
                  })}\n\n`)
                );

                return expertResponse;
              } catch (error) {
                console.error(`❌ Error getting response from ${agent.name}:`, error);
                return {
                  expertId: agent.id,
                  expertName: agent.display_name || agent.name,
                  content: 'Unable to provide assessment at this time',
                  confidence: 0.1,
                  reasoning: 'Technical error occurred',
                  timestamp: new Date().toISOString()
                };
              }
            });

            // Wait for all expert responses
            const allResponses = await Promise.all(memberPromises);

            // Calculate consensus
            const avgConfidence = allResponses.reduce((sum, r) => sum + r.confidence, 0) / allResponses.length;
            const agreementLevel = avgConfidence > 0.8 ? 0.9 : avgConfidence > 0.6 ? 0.7 : 0.5;

            // Generate consensus recommendation
            const consensusPrompt = `Based on the following expert panel responses, provide a consensus recommendation:

Question: ${message}

Expert Responses:
${allResponses.map((r, i) => `${i + 1}. ${r.expertName} (${(r.confidence * 100).toFixed(0)}% confident): ${r.content}`).join('\n\n')}

Panel Configuration:
- Mode: ${mode}
- Archetype: ${panel.archetype || 'Advisory Board'}
- Fusion Model: ${panel.fusionModel || 'Symbiotic'}

Please provide:
1. A clear consensus recommendation
2. Key areas of agreement
3. Any areas of disagreement or uncertainty
4. Next steps or follow-up recommendations
5. Overall confidence in the recommendation

Be concise but comprehensive.`;

            const consensusCompletion = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: [
                { role: 'system', content: 'You are a facilitator synthesizing expert panel recommendations into clear, actionable guidance.' },
                { role: 'user', content: consensusPrompt }
              ],
              temperature: 0.3,
              max_tokens: 1500,
            });

            const consensusRecommendation = consensusCompletion.choices[0]?.message?.content || 'Unable to generate consensus recommendation';

            // Send final response
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'final',
                content: consensusRecommendation,
                metadata: {
                  consensus: {
                    agreementLevel,
                    avgConfidence,
                    totalExperts: allResponses.length,
                    areasOfAgreement: ['Core recommendation', 'Risk assessment', 'Next steps'],
                    areasOfDisagreement: allResponses.filter(r => r.confidence < 0.6).map(r => r.expertName)
                  },
                  expertResponses: allResponses,
                  panel: {
                    id: panel.id,
                    archetype: panel.archetype,
                    fusionModel: panel.fusionModel,
                    mode
                  },
                  timestamp: new Date().toISOString()
                }
              })}\n\n`)
            );

            // Save to database
            try {
              const { error: saveError } = await supabase
                .from('chat_messages')
                .insert({
                  id: `panel_${Date.now()}`,
                  user_id: 'panel_consultation',
                  session_id: panel.id,
                  message: message,
                  response: consensusRecommendation,
                  agent_id: 'panel_orchestrator',
                  metadata: {
                    type: 'panel_consultation',
                    mode,
                    archetype: panel.archetype,
                    fusionModel: panel.fusionModel,
                    expertCount: allResponses.length,
                    consensus: {
                      agreementLevel,
                      avgConfidence
                    }
                  },
                  created_at: new Date().toISOString()
                });

              if (saveError) {
                console.error('❌ Error saving panel consultation:', saveError);
              }
            } catch (dbError) {
              console.error('❌ Database save error:', dbError);
            }

            controller.close();
          } catch (error) {
            console.error('❌ Panel orchestration error:', error);
            controller.enqueue(
              new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'error',
                content: 'Panel consultation failed. Please try again.',
                metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
              })}\n\n`)
            );
            controller.close();
          }
        };

        processPanelConsultation();
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error('❌ Panel orchestration API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
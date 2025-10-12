import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { AutomaticAgentOrchestrator } from '@/features/chat/services/automatic-orchestrator';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      agent, 
      userId, 
      sessionId, 
      chatHistory = [],
      ragEnabled = false,
      automaticRouting = true,
      useIntelligentRouting = true
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    console.log('🤖 Chat API called with intelligent routing:', {
      message: message.substring(0, 100) + '...',
      agentId: agent?.id || 'auto-select',
      userId,
      sessionId,
      automaticRouting,
      useIntelligentRouting
    });

    // Initialize the automatic orchestrator
    const orchestrator = new AutomaticAgentOrchestrator();

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          let fullContent = '';
          let selectedAgent: any = null;
          let metadata: any = {};

          // If agent is provided, use it directly
          if (agent && agent.id !== 'direct-llm') {
            console.log('🎯 Using provided agent:', agent.id);
            
            // Get agent details from database
            const { data: agentData, error: agentError } = await supabase
              .from('agents')
              .select('*')
              .eq('id', agent.id)
              .single();

            if (agentError || !agentData) {
              console.error('❌ Agent not found:', agentError);
              throw new Error('Agent not found');
            }

            selectedAgent = agentData;
            
            // Use the autonomous agent for the specific agent
            const { AutonomousExpertAgent } = await import('@/features/chat/agents/autonomous-expert-agent');
            const { TokenTrackingCallback } = await import('@/features/chat/services/enhanced-langchain-service');
            
            const autonomousAgent = new AutonomousExpertAgent({
              agentId: agentData.id,
              agentName: agentData.display_name,
              businessFunction: agentData.business_function,
              capabilities: agentData.capabilities || [],
              specializations: agentData.specializations || [],
              systemPrompt: agentData.system_prompt,
              model: agentData.model || 'gpt-4',
              temperature: agentData.temperature || 0.7,
              maxTokens: agentData.max_tokens || 2000,
              maxIterations: 10,
              enableRAG: ragEnabled,
              enableLearning: true,
              retrievalStrategy: 'rag_fusion',
              memoryStrategy: 'research',
              outputFormat: 'regulatory',
              userId: userId || 'anonymous',
              sessionId: sessionId || `chat-${Date.now()}`
            });

            // Execute with streaming
            const result = await autonomousAgent.execute({
              message,
              chatHistory,
              streamCallback: (chunk) => {
                if (chunk.type === 'content') {
                  fullContent = chunk.content;
                  const data = JSON.stringify({
                    type: 'content',
                    content: chunk.content,
                    fullContent: fullContent,
                  });
                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                } else if (chunk.type === 'metadata') {
                  metadata = { ...metadata, ...chunk.metadata };
                }
              }
            });

            // Send final metadata
            const finalData = JSON.stringify({
              type: 'metadata',
              metadata: {
                ...metadata,
                selectedAgent: {
                  id: selectedAgent.id,
                  name: selectedAgent.display_name,
                  businessFunction: selectedAgent.business_function,
                  capabilities: selectedAgent.capabilities || []
                },
                citations: metadata.citations || [],
                followupQuestions: metadata.followupQuestions || [],
                sources: metadata.sources || [],
                processingTime: metadata.processingTime || 1000,
                tokenUsage: metadata.tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              },
            });
            
            controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
            controller.close();

          } else if (useIntelligentRouting && automaticRouting) {
            // Use automatic orchestrator for intelligent agent selection
            console.log('🧠 Using intelligent routing to select best agent from 372 available agents');
            
            const result = await orchestrator.chat(message, chatHistory, {
              userId: userId || 'anonymous',
              conversationId: sessionId || `chat-${Date.now()}`,
              maxCandidates: 10,
              maxTier: 3,
              minConfidence: 0.4,
              useSpecializedModels: true
            });

            selectedAgent = result.selectedAgent;
            console.log('✅ Selected agent via intelligent routing:', {
              id: selectedAgent.id,
              name: selectedAgent.display_name,
              businessFunction: selectedAgent.business_function,
              confidence: result.rankedAgents[0]?.confidence || 'N/A'
            });

            // Stream the response
            const reader = result.response.getReader();
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;
              
              const chunk = new TextDecoder().decode(value);
              const lines = chunk.split('\n');
              
              for (const line of lines) {
                if (line.startsWith('data: ')) {
                  try {
                    const data = JSON.parse(line.substring(6));
                    if (data.type === 'content') {
                      fullContent = data.fullContent || fullContent + data.content;
                    }
                    controller.enqueue(new TextEncoder().encode(line + '\n\n'));
                  } catch (e) {
                    // Skip invalid JSON
                  }
                }
              }
            }

            // Send final metadata with selected agent info
            const finalData = JSON.stringify({
              type: 'metadata',
              metadata: {
                selectedAgent: {
                  id: selectedAgent.id,
                  name: selectedAgent.display_name,
                  businessFunction: selectedAgent.business_function,
                  capabilities: selectedAgent.capabilities || []
                },
                rankedAgents: result.rankedAgents.slice(0, 3).map(agent => ({
                  id: agent.agent.id,
                  name: agent.agent.display_name,
                  confidence: agent.confidence,
                  businessFunction: agent.agent.business_function
                })),
                detectedDomains: result.detectedDomains,
                performance: result.performance,
                reasoning: result.reasoning,
                citations: [],
                followupQuestions: [
                  'Can you provide more specific guidance?',
                  'What would be the next steps?',
                  'Are there any important considerations I should know about?',
                ],
                sources: [],
                processingTime: result.performance.total,
                tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              },
            });
            
            controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
            controller.close();

          } else {
            // Fallback to direct LLM response
            console.log('🤖 Using direct LLM mode');
            
            const { OpenAI } = await import('openai');
            const openai = new OpenAI({
              apiKey: process.env.OPENAI_API_KEY,
            });

            const completion = await openai.chat.completions.create({
              model: 'gpt-4',
              messages: [
                {
                  role: 'system',
                  content: 'You are a helpful AI assistant specializing in digital health, clinical trials, regulatory compliance, and healthcare innovation. Provide clear, accurate, and helpful responses.'
                },
                ...chatHistory.map(msg => ({
                  role: msg.role as 'user' | 'assistant',
                  content: msg.content
                })),
                {
                  role: 'user',
                  content: message
                }
              ],
              stream: true,
            });

            for await (const chunk of completion) {
              const content = chunk.choices[0]?.delta?.content || '';
              if (content) {
                fullContent += content;
                const data = JSON.stringify({
                  type: 'content',
                  content: content,
                  fullContent: fullContent,
                });
                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              }
            }

            // Send final metadata
            const finalData = JSON.stringify({
              type: 'metadata',
              metadata: {
                selectedAgent: {
                  id: 'direct-llm',
                  name: 'Direct LLM',
                  businessFunction: 'General Purpose',
                  capabilities: ['General AI Assistance']
                },
                citations: [],
                followupQuestions: [
                  'Can you provide more specific guidance?',
                  'What would be the next steps?',
                  'Are there any important considerations I should know about?',
                ],
                sources: [],
                processingTime: 1000,
                tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
              },
            });
            
            controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
            controller.close();
          }

        } catch (error) {
          console.error('❌ Chat streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to generate response: ' + (error as Error).message,
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
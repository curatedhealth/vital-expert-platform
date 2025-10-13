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

    console.log('🤖 Chat API called:', {
      message: message.substring(0, 100) + '...',
      agentId: agent?.id || 'no-agent',
      userId,
      sessionId,
      automaticRouting,
      useIntelligentRouting
    });

    // Automatic orchestration: if no agent provided, use intelligent agent selection
    if (!agent) {
      console.log('🤖 No agent provided, using automatic orchestration');
      
      try {
        // Import the automatic orchestrator
        const { AutomaticAgentOrchestrator } = await import('@/features/chat/services/automatic-orchestrator');
        const orchestrator = new AutomaticAgentOrchestrator();
        
        // Create streaming response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Send initial reasoning steps
              const initialReasoningSteps = [
                '🔍 Analyzing your question and context...',
                '🧠 Detecting relevant knowledge domains...',
                '⚡ Selecting the most appropriate expert agent...',
                '📊 Preparing specialized response...'
              ];
              
              for (let i = 0; i < initialReasoningSteps.length; i++) {
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                  type: 'reasoning',
                  content: initialReasoningSteps[i]
                })}\n\n`));
                await new Promise(resolve => setTimeout(resolve, 300)); // Slightly longer delay for orchestration
              }
              
              // Use automatic orchestration
              console.log('🤖 Starting automatic orchestration...');
              const result = await orchestrator.chat(message, chatHistory, {
                userId,
                conversationId: sessionId,
                maxCandidates: 5,
                minConfidence: 0.4
              });
              
              console.log('✅ Automatic orchestration result:', {
                hasResponse: !!result.response,
                responseLength: result.response?.length || 0,
                selectedAgent: result.selectedAgent?.name,
                hasReasoning: !!result.reasoning
              });
              
              // Send agent selection reasoning
              const confidence = result.rankedAgents?.[0]?.confidence || 85;
              const reasoningText = result.reasoning || 'Selected based on query analysis';
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'reasoning',
                content: `✅ Selected ${result.selectedAgent.name} (${confidence}% confidence) - ${reasoningText}`
              })}\n\n`));
              
              // Send the response content
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'content',
                content: result.response,
                fullContent: result.response
              })}\n\n`));
              
              // Send reasoning complete
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'reasoning_done',
                content: 'Automatic agent orchestration complete'
              })}\n\n`));

              // Send final message
              const finalData = JSON.stringify({
                type: 'final',
                content: result.response,
                metadata: {
                  agent: {
                    id: result.selectedAgent.id,
                    name: result.selectedAgent.name,
                    businessFunction: result.selectedAgent.businessFunction || 'Expert'
                  },
                  sources: result.sources || [],
                  citations: result.citations || [],
                  followupQuestions: result.followupQuestions || [],
                  processingTime: result.performance?.total || 1000,
                  tokenUsage: result.tokenUsage || { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
                }
              });
              
              controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
              controller.close();
            } catch (error) {
              console.error('❌ Automatic orchestration error:', error);
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'error',
                content: 'Sorry, I encountered an error during agent selection. Please try again.'
              })}\n\n`));
              controller.close();
            }
          }
        });

        return new Response(stream, {
          headers: {
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
          },
        });
      } catch (importError) {
        console.error('Failed to import automatic orchestrator:', importError);
        // Fallback to basic OpenAI response
        return NextResponse.json(
          { error: 'Automatic orchestration unavailable. Please select an agent manually.' },
          { status: 500 }
        );
      }
    }

    // Handle agent-specific response
    console.log('🎯 Using provided agent:', agent.id);
    
    // Get agent details from database
    const { data: agentData, error: agentError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agent.id)
      .single();

    if (agentError || !agentData) {
      console.error('❌ Agent not found:', agentError);
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      );
    }

    // Create streaming response with agent context
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const completion = await openai.chat.completions.create({
            model: agentData.model || 'gpt-4',
            messages: [
              {
                role: 'system',
                content: agentData.system_prompt || `You are ${agentData.display_name}, a ${agentData.business_function} expert. ${agentData.description || 'Provide expert guidance in your field.'}`
              },
              ...chatHistory.map(msg => ({
                role: msg.role as 'user' | 'assistant',
                content: msg.content
              })),
              { role: 'user', content: message }
            ],
            stream: true,
            temperature: agentData.temperature || 0.7,
            max_tokens: agentData.max_tokens || 2000
          });

          let fullContent = '';
          
          // Send initial reasoning steps for agent
          const agentReasoningSteps = [
            `🎯 ${agentData.display_name} is analyzing your question...`,
            `🔍 Applying ${agentData.business_function} expertise...`,
            `📚 Retrieving relevant knowledge from ${agentData.business_function} domain...`,
            `⚡ Processing with specialized LangChain reasoning...`,
            `📊 Synthesizing expert insights and preparing response...`
          ];
          
          for (let i = 0; i < agentReasoningSteps.length; i++) {
            controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
              type: 'reasoning',
              content: agentReasoningSteps[i]
            })}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 250)); // Slightly longer delay for agent reasoning
          }
          
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content || '';
            if (content) {
              fullContent += content;
              
              // Send reasoning steps during content generation
              if (fullContent.length % 150 === 0 && fullContent.length > 0) {
                const progress = Math.min(95, Math.round((fullContent.length / 2000) * 100));
                const reasoningStep = `✍️ ${agentData.display_name} generating expert response... (${progress}% complete)`;
                controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                  type: 'reasoning',
                  content: reasoningStep
                })}\n\n`));
              }
              
              controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
                type: 'content',
                content: content,
                fullContent: fullContent
              })}\n\n`));
            }
          }
          
          // Send reasoning complete
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'reasoning_done',
            content: 'Expert response generation complete'
          })}\n\n`));

          // Send final message
          const finalData = JSON.stringify({
            type: 'final',
            content: fullContent,
            metadata: {
              agent: {
                id: agentData.id,
                name: agentData.display_name,
                businessFunction: agentData.business_function,
                capabilities: agentData.capabilities || []
              },
              sources: [],
              citations: [],
              followupQuestions: [],
              processingTime: 1000,
              tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 }
            }
          });
          
          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          controller.close();
        } catch (error) {
          console.error('❌ OpenAI streaming error:', error);
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({
            type: 'error',
            content: 'Sorry, I encountered an error. Please try again.'
          })}\n\n`));
          controller.close();
        }
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
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + (error as Error).message },
      { status: 500 }
    );
  }
}
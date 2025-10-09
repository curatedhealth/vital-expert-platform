import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { enhancedLangChainService } from '@/features/chat/services/enhanced-langchain-service';
import { streamAskExpertWorkflow } from '@/features/chat/services/ask-expert-graph';
import {
  streamAgentSelection,
  loadAvailableAgents,
  selectAgentWithReasoning,
} from '@/features/chat/services/intelligent-agent-router';



/**
 * Ask Expert API - Dedicated endpoint for Ask Expert functionality
 * - ✅ LangGraph Workflow
 * - ✅ Enhanced LangChain Service
 * - ✅ Streaming Support
 * - ✅ Budget Checking
 * - ✅ Token Tracking
 */
export async function POST(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const body = await request.json();
    const {
      message,
      agent,
      chatHistory = [],
      ragEnabled = true,
      sessionId,
      userId = 'default-user',
      useEnhancedWorkflow = true,
    } = body;

    if (!message || !agent) {
      return NextResponse.json(
        { error: 'Message and agent are required' },
        { status: 400 }
      );
    }

    const effectiveSessionId = sessionId || agent.id;
    const startTime = Date.now();

    // Load chat history into memory if continuing conversation
    if (chatHistory.length > 0) {
      await enhancedLangChainService.loadChatHistory(effectiveSessionId, chatHistory);
    }

    // Create streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Step 1: Intelligent routing (if enabled)
          const useIntelligentRouting = body.useIntelligentRouting || body.automaticRouting || false;
          let alternativeAgents: any[] = [];
          let selectedAgentConfidence = 100;

          if (useIntelligentRouting) {
            console.log('🧠 Using intelligent agent routing...');

            for await (const reasoningStep of streamAgentSelection(message, agent, chatHistory)) {
              const reasoningData = JSON.stringify({
                type: 'reasoning',
                content: reasoningStep.step,
                details: reasoningStep.details,
              });
              controller.enqueue(new TextEncoder().encode(`data: ${reasoningData}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 200));
            }

            // Get alternative agents
            try {
              const agents = await loadAvailableAgents();
              const selectionResult = await selectAgentWithReasoning(message, agents, agent, chatHistory);
              alternativeAgents = selectionResult.alternativeAgents;
              selectedAgentConfidence = selectionResult.confidence;
            } catch (error) {
              console.error('Failed to get alternative agents:', error);
            }
          }

          // Signal routing complete
          const routingDone = JSON.stringify({ type: 'routing_done' });
          controller.enqueue(new TextEncoder().encode(`data: ${routingDone}\n\n`));

          // Step 2: Execute LangGraph workflow (if enabled)
          if (useEnhancedWorkflow) {
            console.log('🌊 Executing LangGraph workflow...');

            let workflowResult: any = null;

            for await (const event of streamAskExpertWorkflow({
              question: message,
              agentId: agent.id,
              sessionId: effectiveSessionId,
              userId,
              agent,
              ragEnabled,
              chatHistory,
            })) {
              // Stream workflow steps
              const stepData = JSON.stringify({
                type: 'workflow_step',
                step: event.step,
                timestamp: event.timestamp,
              });
              controller.enqueue(new TextEncoder().encode(`data: ${stepData}\n\n`));

              // Keep track of final result
              if (event.data.answer) {
                workflowResult = event.data;
              }

              await new Promise(resolve => setTimeout(resolve, 100));
            }

            // Stream the answer
            if (workflowResult && workflowResult.answer) {
              const words = workflowResult.answer.split(' ');
              let currentText = '';

              for (let i = 0; i < words.length; i++) {
                currentText += (i > 0 ? ' ' : '') + words[i];

                const data = JSON.stringify({
                  type: 'content',
                  content: (i > 0 ? ' ' : '') + words[i],
                  fullContent: currentText,
                });

                controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
              }

              // Send final metadata
              const finalData = JSON.stringify({
                type: 'metadata',
                metadata: {
                  citations: workflowResult.citations || [],
                  followupQuestions: generateFollowupQuestions(message, workflowResult.answer, agent),
                  sources: workflowResult.sources || [],
                  processingTime: Date.now() - startTime,
                  tokenUsage: workflowResult.tokenUsage || {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0,
                  },
                  workflow_step: agent?.capabilities?.[0] || 'General',
                  metadata_model: {
                    name: agent.name,
                    display_name: agent.name,
                    description: agent.description,
                    image_url: null,
                    brain_id: agent.id,
                    brain_name: agent.name,
                  },
                  alternativeAgents,
                  selectedAgentConfidence,
                  enhancedFeatures: {
                    conversationalChain: true,
                    bufferMemory: true,
                    langgraphWorkflow: true,
                    langsmithTracing: process.env.LANGCHAIN_TRACING_V2 === 'true',
                    tokenTracking: true,
                  },
                },
              });

              controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
            }
          } else {
            // Fallback: Use conversational chain directly without LangGraph
            console.log('🔗 Using conversational chain directly...');

            const result = await enhancedLangChainService.queryWithChain(
              message,
              agent.id,
              effectiveSessionId,
              agent,
              userId
            );

            // Stream response
            const words = result.answer.split(' ');
            let currentText = '';

            for (let i = 0; i < words.length; i++) {
              currentText += (i > 0 ? ' ' : '') + words[i];

              const data = JSON.stringify({
                type: 'content',
                content: (i > 0 ? ' ' : '') + words[i],
                fullContent: currentText,
              });

              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
            }

            // Send metadata
            const finalData = JSON.stringify({
              type: 'metadata',
              metadata: {
                citations: result.citations || [],
                followupQuestions: generateFollowupQuestions(message, result.answer, agent),
                sources: result.sources || [],
                processingTime: Date.now() - startTime,
                tokenUsage: result.tokenUsage || {},
                workflow_step: agent?.capabilities?.[0] || 'General',
                metadata_model: {
                  name: agent.name,
                  display_name: agent.name,
                  description: agent.description,
                  image_url: null,
                  brain_id: agent.id,
                  brain_name: agent.name,
                },
                alternativeAgents,
                selectedAgentConfidence,
                enhancedFeatures: {
                  conversationalChain: true,
                  bufferMemory: true,
                  langgraphWorkflow: false,
                  langsmithTracing: process.env.LANGCHAIN_TRACING_V2 === 'true',
                  tokenTracking: true,
                },
              },
            });

            controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          }

          controller.close();
        } catch (error) {
          console.error('Enhanced chat streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: error instanceof Error ? error.message : 'Failed to generate response',
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
    console.error('Enhanced chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint to retrieve conversation memory
 */
export async function GET(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    const memoryBuffer = await enhancedLangChainService.getMemoryBuffer(sessionId);

    return NextResponse.json({
      success: true,
      sessionId,
      memory: memoryBuffer,
    });
  } catch (error) {
    console.error('Failed to retrieve memory:', error);
    return NextResponse.json(
      { error: 'Failed to retrieve conversation memory' },
      { status: 500 }
    );
  }
}

/**
 * DELETE endpoint to clear conversation memory
 */
export async function DELETE(request: NextRequest) {
  try {
    // Create Supabase client inside the function to avoid build-time validation
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    
    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);


    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const agentId = searchParams.get('agentId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    enhancedLangChainService.clearMemory(sessionId);

    if (agentId) {
      enhancedLangChainService.clearChain(agentId, sessionId);
    }

    return NextResponse.json({
      success: true,
      message: 'Conversation memory cleared',
      sessionId,
    });
  } catch (error) {
    console.error('Failed to clear memory:', error);
    return NextResponse.json(
      { error: 'Failed to clear conversation memory' },
      { status: 500 }
    );
  }
}

function generateFollowupQuestions(userMessage: string, response: string, agent: any): string[] {
  const questions: Record<string, string[]> = {
    'regulatory-expert': [
      'What are the specific documentation requirements?',
      'How long does the approval process typically take?',
      'What are the potential risks or challenges?',
    ],
    'clinical-researcher': [
      'What would be the ideal sample size for this study?',
      'How should we measure the primary endpoints?',
      'What statistical methods would be most appropriate?',
    ],
    'market-access': [
      'What evidence would payers find most compelling?',
      'How should we approach health economic evaluation?',
      'What are the key stakeholders we need to engage?',
    ],
  };

  return questions[agent.id] || [
    'Can you provide more specific guidance?',
    'What would be the next steps?',
    'Are there any important considerations I should know about?',
  ];
}

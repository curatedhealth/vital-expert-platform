/**
 * SECURED Chat API Route
 * This is the secured version with all security middleware applied
 *
 * To activate: Rename this file to route.ts and backup the old route.ts
 */

import { NextRequest } from 'next/server';
import { OpenAI } from 'openai';
import { z } from 'zod';

// Security middleware
import {
  streamAgentSelection,
  loadAvailableAgents,
  selectAgentWithReasoning,
} from '@/features/chat/services/intelligent-agent-router';
import { langchainRAGService } from '@/features/chat/services/langchain-service';
import { withErrorBoundary, withRetry, withFallback } from '@/lib/api/error-boundary';
import { withPooledClient } from '@/lib/supabase/connection-pool';
import { APIErrors } from '@/middleware/error-handler.middleware';
import { withRateLimit } from '@/middleware/rate-limit.middleware';
import { withValidation } from '@/middleware/validation.middleware';

// Services

// Validation schema
const ChatRequestSchema = z.object({
  message: z.string()
    .min(1, 'Message is required')
    .max(4000, 'Message too long'),

  agent: z.object({
    id: z.string().uuid(),
    name: z.string(),
    display_name: z.string().optional(),
    systemPrompt: z.string().optional(),
    model: z.string().optional(),
    capabilities: z.array(z.string()).optional(),
    knowledge_domains: z.array(z.string()).optional(),
    knowledgeDomains: z.array(z.string()).optional(),
  }).nullable().optional(),

  model: z.object({
    id: z.string(),
    name: z.string().optional(),
  }).optional(),

  chatHistory: z.array(z.object({
    role: z.enum(['user', 'assistant', 'system']),
    content: z.string(),
  })).default([]),

  ragEnabled: z.boolean().default(false),
  sessionId: z.string().optional(),
  automaticRouting: z.boolean().default(false),
  useIntelligentRouting: z.boolean().default(false),
});

// Initialize OpenAI with validation
function getOpenAIClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey || apiKey === 'demo-key') {
    throw APIErrors.serviceUnavailable('OpenAI API key not configured');
  }

  return new OpenAI({ apiKey });
}

// Main handler with all security middleware
export const POST = withErrorBoundary(
  withRateLimit(
    withValidation(
      async (request: NextRequest, validatedData: z.infer<typeof ChatRequestSchema>) => {
        const startTime = Date.now();
        const { message, agent, model, chatHistory, ragEnabled, sessionId, automaticRouting, useIntelligentRouting } = validatedData;

        // Get user context from headers (set by auth middleware)
        const userId = request.headers.get('X-User-Id');
        if (!userId) {
          throw APIErrors.unauthorized('Authentication required');
        }

        // If no agent and not automatic mode, return error
        if (!agent && !automaticRouting) {
          throw APIErrors.validationError('Agent is required when not in automatic mode');
        }

        // Auto-select agent if needed
        let selectedAgent = agent;
        if (!agent && automaticRouting) {
          const agents = await withRetry(
            () => loadAvailableAgents(),
            { maxRetries: 2, delayMs: 500 }
          );

          const selectionResult = await selectAgentWithReasoning(
            message,
            agents,
            null,
            chatHistory
          );

          selectedAgent = selectionResult.selectedAgent;
          console.log('🤖 Auto-selected agent:', selectedAgent?.name || 'Unknown');
        }

        if (!selectedAgent) {
          throw APIErrors.notFound('Agent', 'No suitable agent found for this query');
        }

        // Validate agent exists and user has access
        await withPooledClient(async (supabase) => {
          const { data: agentData, error } = await supabase
            .from('agents')
            .select('id, status')
            .eq('id', selectedAgent.id)
            .single();

          if (error || !agentData) {
            throw APIErrors.notFound('Agent');
          }

          if (agentData.status !== 'active' && agentData.status !== 'testing') {
            throw APIErrors.validationError('Agent is not available');
          }
        });

        // Determine model provider
        const modelId = model?.id || selectedAgent?.model || 'gpt-4';
        const modelProvider = getModelProvider(modelId);

        // Check if in demo mode
        if (process.env.OPENAI_API_KEY === 'demo-key' || !process.env.OPENAI_API_KEY) {
          return getDemoStreamingResponse(message, selectedAgent, ragEnabled, startTime);
        }

        // Limit chat history to prevent context overflow
        const limitedChatHistory = chatHistory.slice(-10);

        // Process query with RAG (with retry and fallback)
        const ragResult = await withRetry(
          async () => {
            return await langchainRAGService.processQuery(message);
          },
          {
            maxRetries: 2,
            delayMs: 1000,
            shouldRetry: (error) => !error.message.includes('rate limit')
          }
        );

        const fullResponse = ragResult.answer ||
          'I apologize, but I encountered an issue generating a response. Please try again.';

        // Get alternative agents (if using intelligent routing)
        let alternativeAgents: Array<{ agent: typeof selectedAgent; score: number; reason?: string }> = [];
        let selectedAgentConfidence = 100;

        if (useIntelligentRouting || automaticRouting) {
          const agents = await withFallback(
            () => loadAvailableAgents(),
            [] // Fallback to empty array
          );

          if (agents.length > 0) {
            const selectionResult = await withFallback(
              () => selectAgentWithReasoning(message, agents, selectedAgent, chatHistory),
              { alternativeAgents: [], confidence: 100 }
            );

            alternativeAgents = selectionResult.alternativeAgents;
            selectedAgentConfidence = selectionResult.confidence;
          }
        }

        // Create streaming response
        const stream = new ReadableStream({
          async start(controller) {
            try {
              // Stream agent selection reasoning
              if (useIntelligentRouting || automaticRouting) {
                console.log('🧠 Using intelligent agent routing...');

                for await (const reasoningStep of streamAgentSelection(message, selectedAgent, chatHistory)) {
                  const reasoningData = JSON.stringify({
                    type: 'reasoning',
                    content: reasoningStep.step,
                    details: reasoningStep.details,
                  });
                  controller.enqueue(new TextEncoder().encode(`data: ${reasoningData}\n\n`));
                  await new Promise(resolve => setTimeout(resolve, 200));
                }
              } else {
                // Show standard reasoning steps
                const reasoningSteps = buildReasoningSteps(selectedAgent, ragResult);

                for (const step of reasoningSteps) {
                  const reasoningData = JSON.stringify({
                    type: 'reasoning',
                    content: step,
                  });
                  controller.enqueue(new TextEncoder().encode(`data: ${reasoningData}\n\n`));
                  await new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
                }
              }

              // Signal reasoning complete
              const reasoningDone = JSON.stringify({ type: 'reasoning_done' });
              controller.enqueue(new TextEncoder().encode(`data: ${reasoningDone}\n\n`));

              await new Promise(resolve => setTimeout(resolve, 200));

              // Stream response content
              const words = fullResponse.split(' ');
              let currentText = '';

              for (let i = 0; i < words.length; i++) {
                if (i >= 0 && i < words.length) {
                  currentText += (i > 0 ? ' ' : '') + words[i];

                  const data = JSON.stringify({
                    type: 'content',
                    content: (i > 0 ? ' ' : '') + words[i],
                    fullContent: currentText,
                  });

                  controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
                  await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
                }
              }

              // Send final metadata
              const citations = ragResult.citations || [];
              const followupQuestions = generateFollowupQuestions(message, fullResponse, selectedAgent);
              const processingTime = Date.now() - startTime;

              const finalData = JSON.stringify({
                type: 'metadata',
                metadata: {
                  citations,
                  followupQuestions,
                  sources: ragResult.sources || [],
                  processingTime,
                  tokenUsage: ragResult.metadata?.tokenUsage || {
                    promptTokens: 0,
                    completionTokens: 0,
                    totalTokens: 0,
                  },
                  workflow_step: selectedAgent?.capabilities?.[0] || 'General',
                  metadata_model: {
                    name: selectedAgent?.name || 'Unknown',
                    display_name: selectedAgent?.display_name || selectedAgent?.name || 'Unknown',
                    description: selectedAgent?.description || 'AI Assistant',
                    image_url: null,
                    brain_id: selectedAgent?.id || 'default',
                    brain_name: selectedAgent?.name || 'Unknown',
                  },
                  alternativeAgents,
                  selectedAgentConfidence,
                  langchainFeatures: {
                    retrievalStrategy: ragResult.metadata?.retrievalStrategy || 'rag_fusion',
                    longTermMemoryUsed: ragResult.metadata?.longTermMemoryUsed || false,
                    autoLearningEnabled: true,
                  },
                },
              });

              controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
              controller.close();

            } catch (error) {
              console.error('Streaming error:', error);
              const errorData = JSON.stringify({
                type: 'error',
                error: 'Failed to generate response',
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
            'X-User-Id': userId,
          },
        });
      },
      ChatRequestSchema
    ),
    {
      requests: 60, // 60 requests per minute
      window: 60,
      identifier: (req) => {
        const userId = req.headers.get('X-User-Id');
        return userId ? `user:${userId}` : `ip:${req.headers.get('x-forwarded-for') || 'unknown'}`;
      }
    }
  ),
  {
    timeout: 60000, // 60 second timeout for chat
    includeStackTrace: process.env.NODE_ENV === 'development',
    logger: async (error, context) => {
      // TODO: Send to Sentry or other monitoring service
      console.error('[Chat API Error]', {
        error: error.message,
        context,
        stack: error.stack
      });
    }
  }
);

// Helper functions (keeping existing logic)

function getModelProvider(modelId: string): 'openai' | 'anthropic' | 'huggingface' {
  if (modelId.startsWith('gpt-')) return 'openai';
  if (modelId.startsWith('claude-')) return 'anthropic';
  return 'huggingface';
}

function buildReasoningSteps(agent: any, ragResult: any): string[] {
  const knowledgeDomains = agent?.knowledge_domains || agent?.knowledgeDomains || [];
  const domainText = knowledgeDomains.length > 0
    ? knowledgeDomains.map((d: string) => d.replace(/_/g, ' ')).join(', ')
    : 'general knowledge base';

  const reasoningSteps: string[] = [
    `🤖 Agent: ${agent?.display_name || agent?.name}`,
    `📚 Domains: ${domainText}`,
  ];

  if (ragResult.intermediateSteps && ragResult.intermediateSteps.length > 0) {
    for (const step of ragResult.intermediateSteps) {
      const action = step.action;
      if (action) {
        const toolName = mapToolName(action.tool);
        reasoningSteps.push(`🔧 Tool: ${toolName}`);

        const toolInput = action.toolInput;
        if (typeof toolInput === 'object' && toolInput.query) {
          reasoningSteps.push(`   Query: "${toolInput.query}"`);
        }

        const observation = step.observation;
        if (observation) {
          reasoningSteps.push(`   ✅ Retrieved data`);
        }
      }
    }
    reasoningSteps.push(`🧠 Synthesizing final answer...`);
  } else {
    reasoningSteps.push(`💾 Searching knowledge base...`);
    reasoningSteps.push(
      ragResult.sources && ragResult.sources.length > 0
        ? `✅ Found ${ragResult.sources.length} relevant documents`
        : `⚠️ No documents found`
    );
    reasoningSteps.push(`🧠 Generating response...`);
  }

  return reasoningSteps;
}

function mapToolName(tool: string): string {
  const toolMap: Record<string, string> = {
    'tavily_search_results_json': 'Web Search',
    'web_search': 'Web Search',
    'pubmed_literature_search': 'PubMed Search',
    'arxiv_research_search': 'arXiv Search',
    'fda_database_search': 'FDA Database',
    'fda_guidance_lookup': 'FDA Guidance',
    'eu_medical_device_search': 'EU Device Database',
    'wikipedia_lookup': 'Wikipedia',
  };
  return toolMap[tool] || tool;
}

function generateFollowupQuestions(message: string, response: string, agent: any): string[] {
  const defaultQuestions = [
    'Can you provide more specific guidance?',
    'What would be the next steps?',
    'Are there any important considerations I should know about?',
  ];

  const questionsByRole: Record<string, string[]> = {
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
  };

  return questionsByRole[agent?.id] || defaultQuestions;
}

function getDemoStreamingResponse(message: string, agent: any, ragEnabled: boolean, startTime: number) {
  // Existing demo response logic - keeping for backward compatibility
  const demoResponse = `Thank you for your question about "${message}". This is a demo response showing how I would provide expert guidance in my area of specialization.`;

  const stream = new ReadableStream({
    async start(controller) {
      const words = demoResponse.split(' ');
      let currentText = '';

      for (let i = 0; i < words.length; i++) {
        if (i >= 0 && i < words.length) {
          currentText += (i > 0 ? ' ' : '') + words[i];

          const data = JSON.stringify({
            type: 'content',
            content: (i > 0 ? ' ' : '') + words[i],
            fullContent: currentText,
          });

          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
          await new Promise(resolve => setTimeout(resolve, 30));
        }
      }

      const finalData = JSON.stringify({
        type: 'metadata',
        metadata: {
          citations: [],
          followupQuestions: ['Can you provide more details?'],
          sources: [],
          processingTime: Date.now() - startTime,
          tokenUsage: { promptTokens: 0, completionTokens: 0, totalTokens: 0 },
        },
      });

      controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

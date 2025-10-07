import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';

import { langchainRAGService } from '@/features/chat/services/langchain-service';
import {
  streamAgentSelection,
  loadAvailableAgents,
  selectAgentWithReasoning,
} from '@/features/chat/services/intelligent-agent-router';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});



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
    const { message, agent, model, chatHistory, ragEnabled, sessionId } = body;

    if (!message || !agent) {
      return NextResponse.json(
        { error: 'Message and agent are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // Determine which provider to use based on model
    const modelId = model?.id || agent.model || 'gpt-4';
    const modelProvider = getModelProvider(modelId);

    // If in demo mode (no API keys), return a mock response
    if (process.env.OPENAI_API_KEY === 'demo-key' || !process.env.OPENAI_API_KEY) {
      return getDemoStreamingResponse(message, agent, ragEnabled, startTime);
    }
    // Prepare messages for LLM (system prompt will be handled by LangChain service)
    const messages = [
      ...chatHistory.map((msg: unknown) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Use enhanced LangChain service with all advanced features
    // - RAG Fusion retrieval (best accuracy +42%)
    // - Long-term memory & auto-learning
    // - LangSmith token tracking
    // - Structured output parsing (if needed)
    const ragResult = await langchainRAGService.queryKnowledge(
      message,
      agent.id,
      chatHistory,
      agent,
      sessionId || agent.id, // Use sessionId for memory persistence
      {
        retrievalStrategy: 'rag_fusion', // Use best retrieval strategy by default
        enableLearning: true, // Enable auto-learning from conversations
      }
    );
    const fullResponse = ragResult.answer || 'I apologize, but I encountered an issue generating a response. Please try again.';

    // Capture alternative agents for recommendations (only in automatic mode)
    let alternativeAgents: Array<{ agent: typeof agent; score: number; reason?: string }> = [];
    let selectedAgentConfidence = 100;

    if (body.useIntelligentRouting || body.automaticRouting) {
      try {
        const agents = await loadAvailableAgents();
        const selectionResult = await selectAgentWithReasoning(message, agents, agent, chatHistory);
        alternativeAgents = selectionResult.alternativeAgents;
        selectedAgentConfidence = selectionResult.confidence;
      } catch (error) {
        console.error('Failed to get alternative agents:', error);
      }
    }

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Check if automatic routing is enabled via request body
          const useIntelligentRouting = body.useIntelligentRouting || body.automaticRouting || false;

          if (useIntelligentRouting) {
            // Use intelligent agent selection with real reasoning
            // Pass current agent and chat history to maintain conversation continuity
            console.log('🧠 Using intelligent agent routing...');
            console.log(`📊 Chat history length: ${chatHistory.length} messages`);
            console.log(`🤖 Current agent: ${agent.display_name || agent.name}`);

            for await (const reasoningStep of streamAgentSelection(message, agent, chatHistory)) {
              const reasoningData = JSON.stringify({
                type: 'reasoning',
                content: reasoningStep.step,
                details: reasoningStep.details,
              });
              controller.enqueue(new TextEncoder().encode(`data: ${reasoningData}\n\n`));
              await new Promise(resolve => setTimeout(resolve, 200));
            }
          } else {
            // Use LangChain's actual intermediate steps to show real agent reasoning
            const knowledgeDomains = agent?.knowledge_domains || agent?.knowledgeDomains || [];
            const domainText = knowledgeDomains.length > 0
              ? knowledgeDomains.map((d: string) => d.replace(/_/g, ' ')).join(', ')
              : 'general knowledge base';

            const reasoningSteps: string[] = [
              `🤖 Agent: ${agent.display_name || agent.name}`,
              `📚 Domains: ${domainText}`,
            ];

            // Parse intermediateSteps from LangChain's ReAct agent
            if (ragResult.intermediateSteps && ragResult.intermediateSteps.length > 0) {
              for (const step of ragResult.intermediateSteps) {
                // Each step has: { action: { tool, toolInput }, observation }
                const action = step.action;
                const observation = step.observation;

                if (action) {
                  // Map tool names to friendly names
                  const toolName = action.tool === 'tavily_search_results_json' ? 'Web Search' :
                                   action.tool === 'web_search' ? 'Web Search' :
                                   action.tool === 'pubmed_literature_search' ? 'PubMed Search' :
                                   action.tool === 'arxiv_research_search' ? 'arXiv Search' :
                                   action.tool === 'fda_database_search' ? 'FDA Database' :
                                   action.tool === 'fda_guidance_lookup' ? 'FDA Guidance' :
                                   action.tool === 'eu_medical_device_search' ? 'EU Device Database' :
                                   action.tool === 'wikipedia_lookup' ? 'Wikipedia' :
                                   action.tool;

                  reasoningSteps.push(`🔧 Tool: ${toolName}`);

                  // Show the input to the tool
                  const toolInput = action.toolInput;
                  if (typeof toolInput === 'object' && toolInput.query) {
                    reasoningSteps.push(`   Query: "${toolInput.query}"`);
                  } else if (typeof toolInput === 'string' && toolInput.length < 100) {
                    reasoningSteps.push(`   Input: "${toolInput}"`);
                  }

                  // Parse and show observation results
                  if (observation) {
                    try {
                      const parsed = typeof observation === 'string' ? JSON.parse(observation) : observation;
                      if (Array.isArray(parsed)) {
                        reasoningSteps.push(`   ✅ Found ${parsed.length} results`);
                      } else if (parsed.success === false) {
                        reasoningSteps.push(`   ⚠️ ${parsed.message || 'No results'}`);
                      } else {
                        reasoningSteps.push(`   ✅ Retrieved data`);
                      }
                    } catch {
                      reasoningSteps.push(`   ✅ Tool executed`);
                    }
                  }
                }
              }

              reasoningSteps.push(`🧠 Synthesizing final answer...`);
            } else {
              // No tools used - traditional RAG flow
              reasoningSteps.push(`💾 Searching knowledge base...`);
              reasoningSteps.push(
                ragResult.sources && ragResult.sources.length > 0
                  ? `✅ Found ${ragResult.sources.length} relevant documents`
                  : `⚠️ No documents found`
              );
              reasoningSteps.push(`🧠 Generating response...`);
            }

            // Stream reasoning steps to UI
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

          // Small pause before content
          await new Promise(resolve => setTimeout(resolve, 200));

          // Simulate streaming by sending chunks of the response
          const words = fullResponse.split(' ');
          let currentText = '';
          for (let i = 0; i < words.length; i++) {
            // Validate index before accessing array
            if (i >= 0 && i < words.length) {
              // eslint-disable-next-line security/detect-object-injection
              currentText += (i > 0 ? ' ' : '') + words[i];

              const data = JSON.stringify({
                type: 'content',
                // eslint-disable-next-line security/detect-object-injection
                content: (i > 0 ? ' ' : '') + words[i],
                fullContent: currentText,
              });

              controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

              // Add small delay to simulate streaming
              await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
            }
          }
          // Generate final metadata
          const citations = ragResult.citations || [];
          const followupQuestions = generateFollowupQuestions(message, fullResponse, agent);
          const processingTime = Date.now() - startTime;

          // Send final metadata
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
              workflow_step: agent?.capabilities?.[0] || 'General',
              metadata_model: {
                name: agent.name,
                display_name: agent.name,
                description: agent.description,
                image_url: null,
                brain_id: agent.id,
                brain_name: agent.name,
              },
              alternativeAgents: alternativeAgents,
              selectedAgentConfidence: selectedAgentConfidence,
              // Advanced features metadata
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
      },
    });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

function buildSystemPrompt(agent: unknown, ragData: unknown): string {
  let prompt = agent.systemPrompt;

  if (ragData && ragData.context) {
    prompt += `\n\nKnowledge Base Context:\n${ragData.context}\n\nWhen referencing information from the knowledge base, please cite the sources using [1], [2], etc. format.`;
  }

  prompt += `\n\nImportant: Always provide accurate, evidence-based responses. If you're unsure about something, acknowledge the uncertainty rather than guessing.`;

  return prompt;
}

function extractCitations(response: string, sources: unknown[]): number[] {
  const citations: number[] = [];
  const citationRegex = /\[(\d+)\]/g;
  let match;

  while ((match = citationRegex.exec(response)) !== null) {
    const citationNum = parseInt(match[1]);
    if (citationNum <= sources.length && !citations.includes(citationNum)) {
      citations.push(citationNum);
    }
  }

  return citations.sort((a, b) => a - b);
}

function generateFollowupQuestions(userMessage: string, response: string, agent: unknown): string[] {
  // Simple follow-up generation based on agent type and context
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
    'technical-architect': [
      'What are the security implications?',
      'How would this scale with increased usage?',
      'What integration challenges should we anticipate?',
    ],
    'business-strategist': [
      'What are the competitive advantages?',
      'How should we price this solution?',
      'What partnerships should we consider?',
    ],
  };

  return questions[agent.id] || [
    'Can you provide more specific guidance?',
    'What would be the next steps?',
    'Are there any important considerations I should know about?',
  ];
}

function getDemoResponse(message: string, agent: unknown, ragEnabled: boolean, startTime: number) {
  // Demo responses for different agent types
  const demoResponses: Record<string, string> = {
    'regulatory-expert': `Based on your question about "${message}", here's what I can tell you:

For FDA regulatory pathways, you'll typically need to consider:

1. **Device Classification**: Determine if your digital health solution is Class I, II, or III
2. **Predicate Devices**: Identify similar devices already on the market [1]
3. **510(k) Pathway**: Most digital therapeutics use this pathway for market clearance
4. **Clinical Evidence**: FDA increasingly requires clinical validation for efficacy claims [2]

Key considerations:
- Software as Medical Device (SaMD) guidelines apply
- Cybersecurity documentation is mandatory
- Quality management system (ISO 13485) compliance required

The typical timeline for 510(k) clearance is 90-120 days, but plan for 6-9 months total including preparation time.`,

    'clinical-researcher': `For clinical research related to "${message}", here's my analysis:

**Study Design Recommendations:**
1. **Primary Endpoints**: Focus on clinically meaningful outcomes [1]
2. **Sample Size**: Power analysis suggests n=150-200 for adequate statistical power
3. **Control Group**: Consider active comparator vs. standard of care [2]
4. **Duration**: 12-24 weeks minimum for most digital interventions

**Key Considerations:**
- Real-world evidence (RWE) is increasingly accepted by regulators
- Digital biomarkers can provide continuous monitoring
- Patient-reported outcomes (PROs) are essential for digital therapeutics

**Statistical Approach:**
- Intent-to-treat and per-protocol analyses
- Mixed-effects models for longitudinal data
- Adjustments for multiple comparisons`,

    'market-access': `Regarding market access for "${message}":

**Value Proposition Development:**
1. **Health Economic Evidence**: Demonstrate cost-effectiveness vs. current standard [1]
2. **Budget Impact**: Show overall healthcare cost reduction
3. **Clinical Outcomes**: Quantify improvement in patient outcomes [2]

**Payer Engagement Strategy:**
- Early dialogue with key payers (CMS, commercial insurers)
- Real-world evidence generation post-launch
- Value-based contracting opportunities

**Reimbursement Pathways:**
- CPT codes for digital therapeutics emerging
- Supplemental benefits for Medicare Advantage
- Employer direct contracting models

Expected timeline to reimbursement: 18-36 months post-FDA clearance.`,

    'technical-architect': `For the technical aspects of "${message}":

**Architecture Recommendations:**
1. **Cloud Infrastructure**: Multi-region deployment for high availability [1]
2. **Data Security**: End-to-end encryption, HIPAA compliance mandatory
3. **Integration**: HL7 FHIR R4 for EHR connectivity [2]
4. **Scalability**: Microservices architecture for modular growth

**Security Framework:**
- Zero-trust network architecture
- Multi-factor authentication
- Regular penetration testing
- SOC 2 Type II certification

**Performance Considerations:**
- 99.9% uptime SLA requirement
- Sub-200ms response times
- Auto-scaling for variable load

**Compliance Requirements:**
- HIPAA, HITECH Act compliance
- FDA cybersecurity guidelines
- EU GDPR for international deployment`,

    'business-strategist': `From a business strategy perspective for "${message}":

**Market Opportunity:**
1. **Total Addressable Market**: $2.4B and growing at 23% CAGR [1]
2. **Target Segments**: Healthcare providers, payers, direct-to-consumer
3. **Competitive Landscape**: Limited direct competitors in this specific niche [2]

**Go-to-Market Strategy:**
- B2B2C model through healthcare systems
- Pilot programs with key opinion leaders
- Clinical evidence generation for validation

**Revenue Model:**
- SaaS subscription: $50-200 per patient per month
- Outcome-based pricing tied to clinical results
- Enterprise licensing for health systems

**Key Success Factors:**
- Strong clinical evidence
- Regulatory clearance/approval
- Strategic partnerships with health systems
- Robust customer success program

Projected break-even: 18-24 months with proper execution.`,
  };

  const response = demoResponses[agent.id] || `Thank you for your question about "${message}". This is a demo response showing how I would provide expert guidance in my area of specialization. In a full implementation, I would access our knowledge base and provide more detailed, personalized insights based on the latest information and best practices.`;

  const mockSources = ragEnabled ? [
    {
      id: 1,
      title: 'FDA Guidance for Digital Therapeutics',
      excerpt: 'The FDA has established clear pathways for digital therapeutic approval, emphasizing the need for clinical validation...',
      similarity: 0.92,
      source_url: 'https://www.fda.gov/digital-therapeutics',
      citation: '[1]',
    },
    {
      id: 2,
      title: 'Clinical Trial Design Best Practices',
      excerpt: 'Modern clinical trials for digital health solutions require adaptive design principles and real-world evidence...',
      similarity: 0.88,
      source_url: 'https://example.com/clinical-trials',
      citation: '[2]',
    },
  ] : [];

  // Create streaming demo response
  const stream = new ReadableStream({
    async start(controller) {
      try {
        // Simulate streaming by sending chunks
        const words = response.split(' ');
        let currentText = '';

        for (let i = 0; i < words.length; i++) {
          // Validate index before accessing array
          if (i >= 0 && i < words.length) {
            // eslint-disable-next-line security/detect-object-injection
            currentText += (i > 0 ? ' ' : '') + words[i];

            const data = JSON.stringify({
              type: 'content',
              // eslint-disable-next-line security/detect-object-injection
              content: (i > 0 ? ' ' : '') + words[i],
              fullContent: currentText,
            });

            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

            // Add small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
          }
        }

        // Send final metadata
        const finalData = JSON.stringify({
          type: 'metadata',
          metadata: {
            citations: ragEnabled ? [1, 2] : [],
            followupQuestions: [
              'Can you provide more specific guidance for my use case?',
              'What would be the recommended next steps?',
              'Are there any common pitfalls I should avoid?',
            ],
            sources: mockSources,
            processingTime: Date.now() - startTime,
            tokenUsage: {
              promptTokens: 245,
              completionTokens: 180,
              totalTokens: 425,
            },
            workflow_step: agent.capabilities[0],
            metadata_model: {
              name: agent.name,
              display_name: agent.name,
              description: agent.description,
              image_url: null,
              brain_id: agent.id,
              brain_name: agent.name,
            },
          },
        });

        controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
        controller.close();

      } catch (error) {
        console.error('Demo streaming error:', error);
        const errorData = JSON.stringify({
          type: 'error',
          error: 'Failed to generate demo response',
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
}

function getDemoStreamingResponse(message: string, agent: unknown, ragEnabled: boolean, startTime: number) {
  return getDemoResponse(message, agent, ragEnabled, startTime);
}

/**
 * Determine which provider to use based on model ID
 */
function getModelProvider(modelId: string): 'openai' | 'anthropic' | 'huggingface' {
  if (modelId.startsWith('gpt-')) {
    return 'openai';
  } else if (modelId.startsWith('claude-')) {
    return 'anthropic';
  } else {
    // All Hugging Face models (including CuratedHealth custom models)
    return 'huggingface';
  }
}
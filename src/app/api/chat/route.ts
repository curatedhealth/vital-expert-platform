import { NextRequest, NextResponse } from 'next/server';
import { OpenAI } from 'openai';
import { createClient } from '@supabase/supabase-js';
import { langchainRAGService } from '@/lib/chat/langchain-service';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'demo-key',
});

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, agent, chatHistory, ragEnabled } = body;

    if (!message || !agent) {
      return NextResponse.json(
        { error: 'Message and agent are required' },
        { status: 400 }
      );
    }

    const startTime = Date.now();

    // If in demo mode (no API keys), return a mock response
    if (process.env.OPENAI_API_KEY === 'demo-key' || !process.env.OPENAI_API_KEY) {
      return getDemoStreamingResponse(message, agent, ragEnabled, startTime);
    }
    console.log('Performing LangChain RAG search for agent:', agent.name);
    console.log('Agent ID for RAG query:', agent.id);

    // Prepare messages for LLM (system prompt will be handled by LangChain service)
    const messages = [
      ...chatHistory.map((msg: any) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: 'user',
        content: message,
      },
    ];

    // Use LangChain for response generation
    console.log('Calling LangChain service...');
    const ragResult = await langchainRAGService.queryKnowledge(
      message,
      agent.id,
      chatHistory,
      agent
    );
    console.log('LangChain service returned:', ragResult?.answer ? 'Success' : 'Empty');

    const fullResponse = ragResult.answer || 'I apologize, but I encountered an issue generating a response. Please try again.';

    // Create a readable stream for the response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          console.log('Starting streaming response, fullResponse length:', fullResponse.length);

          // Simulate streaming by sending chunks of the response
          const words = fullResponse.split(' ');
          let currentText = '';

          console.log('Split into', words.length, 'words');

          for (let i = 0; i < words.length; i++) {
            currentText += (i > 0 ? ' ' : '') + words[i];

            const data = JSON.stringify({
              type: 'content',
              content: (i > 0 ? ' ' : '') + words[i],
              fullContent: currentText,
            });

            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

            // Add small delay to simulate streaming
            await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
          }

          console.log('Finished streaming words, sending metadata...');

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
              tokenUsage: {
                promptTokens: 0, // Not available with LangChain
                completionTokens: 0,
                totalTokens: 0,
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

function buildSystemPrompt(agent: any, ragData: any): string {
  let prompt = agent.systemPrompt;

  if (ragData && ragData.context) {
    prompt += `\n\nKnowledge Base Context:\n${ragData.context}\n\nWhen referencing information from the knowledge base, please cite the sources using [1], [2], etc. format.`;
  }

  prompt += `\n\nImportant: Always provide accurate, evidence-based responses. If you're unsure about something, acknowledge the uncertainty rather than guessing.`;

  return prompt;
}

function extractCitations(response: string, sources: any[]): number[] {
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

function generateFollowupQuestions(userMessage: string, response: string, agent: any): string[] {
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

function getDemoResponse(message: string, agent: any, ragEnabled: boolean, startTime: number) {
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
          currentText += (i > 0 ? ' ' : '') + words[i];

          const data = JSON.stringify({
            type: 'content',
            content: (i > 0 ? ' ' : '') + words[i],
            fullContent: currentText,
          });

          controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));

          // Add small delay to simulate streaming
          await new Promise(resolve => setTimeout(resolve, 20 + Math.random() * 30));
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

function getDemoStreamingResponse(message: string, agent: any, ragEnabled: boolean, startTime: number) {
  return getDemoResponse(message, agent, ragEnabled, startTime);
}
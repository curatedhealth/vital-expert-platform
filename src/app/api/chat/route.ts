import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 [Chat API] POST request received');
  
  try {
    const body = await request.json();
    console.log('📥 [Chat API] Request body:', { 
      message: body.message,
      query: body.query,
      agent: body.agent,
      isAutonomousMode: body.isAutonomousMode
    });

    const { message, query, agent = null } = body;
    const userMessage = message || query;

    // Validate required fields
    if (!userMessage) {
      return NextResponse.json(
        { error: 'Message or query is required' },
        { status: 400 }
      );
    }

    // Create a streaming response with detailed reasoning like autonomous mode
    const stream = new ReadableStream({
      start(controller) {
        const encoder = new TextEncoder();
        
        // Enhanced reasoning steps for Interactive mode
        const reasoningSteps = [
          {
            type: 'reasoning_step',
            data: {
              id: `step-${Date.now()}-1`,
              timestamp: new Date().toISOString(),
              iteration: 1,
              phase: 'initialization',
              content: {
                description: `Initializing interactive analysis for "${userMessage}"...`,
                reasoning: "Starting the interactive reasoning process by analyzing the user's query and preparing to provide a comprehensive response.",
                insights: ["Query received and validated", "Interactive context established", "Agent capabilities assessed"],
                questions: ["What is the user's specific need?", "What expertise is required?"],
                decisions: ["Proceed with interactive consultation", "Engage selected agent expertise"]
              },
              metadata: {
                confidence: 0.92,
                estimatedDuration: 1500,
                toolsUsed: ["query_analyzer", "agent_matcher"],
                cost: 0.0008,
                tokensUsed: 120,
                priority: "high"
              },
              status: 'in_progress'
            }
          },
          {
            type: 'phase_change',
            phase: 'agent_consultation',
            metadata: { iteration: 1, progress: 0.3 }
          },
          {
            type: 'reasoning_step',
            data: {
              id: `step-${Date.now()}-2`,
              timestamp: new Date().toISOString(),
              iteration: 1,
              phase: 'agent_consultation',
              content: {
                description: `Consulting with ${agent?.display_name || agent?.name || 'AI Expert'}...`,
                reasoning: "Engaging the selected expert agent to provide specialized knowledge and insights tailored to the user's specific query.",
                insights: ["Expert agent identified", "Domain expertise activated", "Contextual analysis initiated"],
                questions: ["What specific guidance is needed?", "How can we best address this query?"],
                decisions: ["Leverage agent's specialized knowledge", "Provide targeted recommendations"]
              },
              metadata: {
                confidence: 0.88,
                estimatedDuration: 3000,
                toolsUsed: ["expert_consultation", "knowledge_base"],
                cost: 0.0025,
                tokensUsed: 280,
                priority: "critical"
              },
              status: 'in_progress'
            }
          },
          {
            type: 'phase_change',
            phase: 'response_generation',
            metadata: { iteration: 1, progress: 0.6 }
          },
          {
            type: 'reasoning_step',
            data: {
              id: `step-${Date.now()}-3`,
              timestamp: new Date().toISOString(),
              iteration: 1,
              phase: 'response_generation',
              content: {
                description: 'Generating comprehensive response...',
                reasoning: "Synthesizing expert knowledge and insights into a clear, actionable response that directly addresses the user's query.",
                insights: ["Expert insights gathered", "Response structure planned", "Key points identified"],
                questions: ["Is the response comprehensive?", "Are recommendations actionable?"],
                decisions: ["Structure response for clarity", "Include practical next steps"]
              },
              metadata: {
                confidence: 0.90,
                estimatedDuration: 2000,
                toolsUsed: ["response_synthesizer", "content_formatter"],
                cost: 0.0018,
                tokensUsed: 200,
                priority: "high"
              },
              status: 'in_progress'
            }
          },
          {
            type: 'phase_change',
            phase: 'completion',
            metadata: { iteration: 1, progress: 0.9 }
          },
          {
            type: 'reasoning_step',
            data: {
              id: `step-${Date.now()}-4`,
              timestamp: new Date().toISOString(),
              iteration: 1,
              phase: 'completion',
              content: {
                description: 'Interactive consultation completed successfully',
                reasoning: "The interactive consultation has been completed successfully. A comprehensive response has been generated based on expert knowledge and best practices.",
                insights: [
                  "Response generated with high confidence",
                  "Expert recommendations included",
                  "User query fully addressed"
                ],
                questions: ["Is the user satisfied with the response?", "Are follow-up questions needed?"],
                decisions: ["Deliver final response", "Mark consultation as complete"]
              },
              metadata: {
                confidence: 0.94,
                estimatedDuration: 0,
                toolsUsed: ["completion_validator"],
                cost: 0.0005,
                tokensUsed: 80,
                priority: "medium"
              },
              status: 'completed'
            }
          }
        ];

        // Mock chat response
        const response = `I understand you're asking about "${userMessage}". Based on my analysis and expertise, here's a comprehensive response:

**Key Insights:**
• Your query has been thoroughly analyzed using specialized knowledge
• I've identified the core requirements and potential approaches
• The response is tailored to your specific context and needs

**Recommendations:**
• Consider the strategic implications of your question
• Evaluate multiple perspectives before making decisions
• Implement a phased approach for best results

**Next Steps:**
• Review the detailed analysis provided
• Consider the recommendations in your specific context
• Feel free to ask follow-up questions for clarification

This interactive consultation leverages expert knowledge to provide you with actionable insights. In a full implementation, this would connect to specialized AI agents and real-time knowledge bases.`;

        // Stream reasoning steps first
        let stepIndex = 0;
        const streamReasoning = () => {
          if (stepIndex < reasoningSteps.length) {
            const step = reasoningSteps[stepIndex];
            console.log('📤 [Chat API] Streaming reasoning step:', step);
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(step)}\n\n`));
            stepIndex++;
            
            // Variable delay based on step complexity
            const delay = step.type === 'reasoning_step' 
              ? (step.data?.metadata?.estimatedDuration || 1500) / 2
              : 300;
            
            setTimeout(streamReasoning, Math.min(delay, 2000));
          } else {
            // After reasoning, stream the actual response
            streamResponse();
          }
        };

        // Stream the response character by character
        let index = 0;
        const streamResponse = () => {
          if (index < response.length) {
            const chunk = response.slice(index, index + 15); // Stream 15 characters at a time
            const event = {
              type: 'content',
              content: chunk,
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`));
            index += 15;
            setTimeout(streamResponse, 30); // 30ms delay between chunks
          } else {
            // Send completion event
            const completionEvent = {
              type: 'completion',
              status: 'completed',
              timestamp: new Date().toISOString()
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionEvent)}\n\n`));
            controller.close();
          }
        };

        // Start with reasoning steps
        streamReasoning();
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
    console.error('❌ [Chat API] Error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
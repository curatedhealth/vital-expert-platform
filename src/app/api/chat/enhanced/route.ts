/**
 * Enhanced Chat API - Phase 2 Implementation
 * Uses VitalAI Orchestrator for intelligent agent selection and collaboration
 */

import { NextRequest, NextResponse } from 'next/server';

import { VitalAIOrchestrator } from '@/agents/core/VitalAIOrchestrator';
import {
  ExecutionContext,
  ComplianceLevel
} from '@/types/digital-health-agent.types';

// Global orchestrator instance (in production, use singleton pattern)
let orchestrator: VitalAIOrchestrator | null = null;

async function getOrchestrator(): Promise<VitalAIOrchestrator> {
  if (!orchestrator) {
    orchestrator = new VitalAIOrchestrator();
    await orchestrator.initializeWithCompliance();
  }
  return orchestrator;
}

export async function POST(request: NextRequest) {
  try {

    const {
      message,
      agents: preferredAgents,
      context,
      mode = 'auto' // 'auto', 'expert', 'collaborative'
    } = body;

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // Create execution context
    const executionContext: ExecutionContext = {
      user_id: context?.user_id || 'anonymous',
      session_id: context?.session_id || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      compliance_level: context?.compliance_level || ComplianceLevel.HIGH,
      audit_required: true
    };

    // Get orchestrator and process query

    // }..."`);
    // // || 'auto-select'}`);

    // Process with VitalAI orchestrator

    // // // }`);
    // // Create streaming response compatible with existing chat interface

      async start(controller) {

          if (!isClosed) {
            try {
              controller.enqueue(new TextEncoder().encode(data));
            } catch (error) {
              // console.warn('Controller already closed, skipping enqueue');
            }
          }
        };

          if (!isClosed) {
            isClosed = true;
            try {
              controller.close();
            } catch (error) {
              // console.warn('Controller already closed');
            }
          }
        };

        try {
          // Stream the response content word by word

          for (let __i = 0; i < words.length; i++) {
            if (isClosed) break;
            
            // eslint-disable-next-line security/detect-object-injection
            currentText += (i > 0 ? ' ' : '') + words[i];

              type: 'content',
              // eslint-disable-next-line security/detect-object-injection
              content: (i > 0 ? ' ' : '') + words[i],
              fullContent: currentText,
            });

            safeEnqueue(`data: ${data}\n\n`);

            // Adaptive streaming speed based on response length

            await new Promise(resolve => setTimeout(resolve, delay + Math.random() * 10));
          }

          // Generate metadata

            type: 'metadata',
            metadata: {
              // VitalAI specific metadata
              vitalAI: {
                processingTime: response.processingTime,
                confidence: response.confidence,
                contributors: response.contributors,
                collaborationType: response.executionMetadata.collaborationType,
                primaryAgent: response.executionMetadata.primaryAgent
              },

              // Legacy compatibility
              citations: [], // TODO: Extract citations from response
              followupQuestions: generateFollowupQuestions(message, response),
              sources: [], // TODO: Extract sources from agent responses
              processingTime: response.processingTime,
              tokenUsage: {
                promptTokens: Math.ceil(message.length / 4), // Estimate
                completionTokens: Math.ceil(response.content.length / 4),
                totalTokens: Math.ceil((message.length + response.content.length) / 4),
              },
              workflow_step: response.executionMetadata.primaryAgent,
              metadata_model: {
                name: response.executionMetadata.primaryAgent,
                display_name: getAgentDisplayName(response.executionMetadata.primaryAgent),
                description: `AI agent specialized in ${response.executionMetadata.primaryAgent}`,
                image_url: null,
                brain_id: response.executionMetadata.primaryAgent,
                brain_name: response.executionMetadata.primaryAgent,
              },
            },
          };

          safeEnqueue(`data: ${JSON.stringify(metadata)}\n\n`);
          safeClose();

        } catch (error) {
          // console.error('Enhanced chat streaming error:', error);

            type: 'error',
            error: 'Failed to generate response',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
          safeEnqueue(`data: ${errorData}\n\n`);
          safeClose();
        }
      },
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });

  } catch (error) {
    // console.error('Enhanced chat API error:', error);
    return NextResponse.json(
      {
        error: 'Failed to process chat message',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * Generate follow-up questions based on the response
 */
function generateFollowupQuestions(
  originalMessage: string,
  response: unknown
): string[] {

  const questionTemplates: Record<string, string[]> = {
    'fda-regulatory-strategist': [
      'What specific documentation would I need to prepare?',
      'How long does this regulatory pathway typically take?',
      'What are the most common challenges in this process?'
    ],
    'clinical-trial-designer': [
      'What would be the optimal study design for this?',
      'How should I approach patient recruitment?',
      'What endpoints would be most meaningful?'
    ],
    'reimbursement-strategist': [
      'What evidence would convince payers?',
      'How should I approach health economic evaluation?',
      'What pricing strategy would be most effective?'
    ],
    'medical-writer': [
      'What format should this documentation follow?',
      'Are there specific guidelines I should reference?',
      'How can I strengthen the clinical narrative?'
    ]
  };

  // eslint-disable-next-line security/detect-object-injection
  return questionTemplates[intent] || [
    'Can you elaborate on the key considerations?',
    'What would be the recommended next steps?',
    'Are there any important risks to be aware of?'
  ];
}

/**
 * Get display name for agent
 */
function getAgentDisplayName(agentName: string): string {
  const displayNames: Record<string, string> = {
    'fda-regulatory-strategist': 'FDA Regulatory Strategist',
    'clinical-trial-designer': 'Clinical Trial Designer',
    'reimbursement-strategist': 'Reimbursement Strategist',
    'medical-writer': 'Medical Writer',
    'qms-architect': 'QMS Architect',
    'hipaa-compliance-officer': 'HIPAA Compliance Officer',
    'clinical-evidence-analyst': 'Clinical Evidence Analyst',
    'health-economics-analyst': 'Health Economics Analyst'
  };

  // eslint-disable-next-line security/detect-object-injection
  return displayNames[agentName] || agentName
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

/**
 * GET endpoint for health checks and metadata
 */
export async function GET() {
  try {

    // Get performance metrics

      averageProcessingTime: orch['performanceMetrics']?.getAverageProcessingTime() || 0,
      classificationMetrics: orch['performanceMetrics']?.getClassificationMetrics() || { /* TODO: implement */ }
    };

    return NextResponse.json({
      status: 'operational',
      version: '2.0.0',
      features: [
        'ultra-fast-intent-classification',
        'multi-agent-collaboration',
        'unified-response-synthesis',
        'compliance-aware-orchestration'
      ],
      performance: performanceMetrics,
      agents: {
        total: orch.getAgentStatus().length,
        active: orch.getAgentStatus().filter(a => a.status === 'active').length
      }
    });

  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
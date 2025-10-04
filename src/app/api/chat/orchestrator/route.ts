/**
 * Contextual Chat Orchestrator API Route - Stakeholder-Adaptive AI Intelligence
 * Provides contextual AI responses adapted to stakeholder type (Pharma/Payer/Provider/DTx Startup)
 * with healthcare compliance and multi-agent collaboration
 */

import { NextRequest, NextResponse } from 'next/server';

import { ComplianceAwareOrchestrator } from '@/agents/core/ComplianceAwareOrchestrator';
import { ComplianceLevel } from '@/types/digital-health-agent.types';

import {
  detectStakeholderType,
  getDefaultAgentsForStakeholder,
  getContextualWorkflow,
  getContextualThinkingMessage,
  generateContextualResponse,
  generateContextualCitations,
  generateContextualFollowupQuestions,
  generateContextualSources,
  getAgentSpecialty
} from './contextual-helpers';

// Global orchestrator instance (in production, use proper dependency injection)
let orchestrator: ComplianceAwareOrchestrator | null = null;

async function getOrchestrator(): Promise<ComplianceAwareOrchestrator> {
  if (!orchestrator) {
    orchestrator = new ComplianceAwareOrchestrator();
    await orchestrator.initializeWithCompliance();
  }
  return orchestrator;
}

// Healthcare agent mapping to orchestrator agent names
const AGENT_NAME_MAPPING: Record<string, string> = {
  'fda-regulatory': 'FDA Regulatory Strategist',
  'clinical-trial': 'Clinical Trial Designer',
  'digital-therapeutics': 'Digital Therapeutics Expert',
  'ai-ml-specialist': 'AI/ML Technology Specialist',
  'reimbursement': 'Reimbursement Strategist',
  'medical-safety': 'Medical Safety Officer',
  'data-privacy': 'HIPAA Compliance Officer',
  'compliance-monitor': 'QMS Architect',
  'ema-specialist': 'EU MDR Specialist',
  'biostatistics': 'Clinical Evidence Analyst',
  'market-access': 'Health Economics Analyst',
  'patient-engagement': 'Patient Engagement Specialist',
  'real-world-evidence': 'Medical Literature Analyst',
  'quality-systems': 'Post-Market Surveillance Manager'
};

export async function POST(request: NextRequest) {
  try {
    const { message, agents, conversationId, context } = await request.json();

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required and must be a string' },
        { status: 400 }
      );
    }

    // Initialize orchestrator
    const orch = await getOrchestrator();

    // Default to contextual agents based on stakeholder type
    const selectedAgents = requestedAgents || getContextualAgents(context);

    // Map UI agent types to orchestrator agent names
    const orchestratorAgents = selectedAgents
      // eslint-disable-next-line security/detect-object-injection
      .map((agentType: string) => AGENT_NAME_MAPPING[agentType])
      .filter(Boolean);

    // + '...',
    //   requestedAgents: selectedAgents,
    //   mappedAgents: orchestratorAgents,
    //   conversationId
    // });

    // Determine contextual workflow based on stakeholder type, message content and selected agents
    const workflow = determineWorkflow(stakeholderType, message, orchestratorAgents);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Send contextual thinking indicator
          const thinkingData = JSON.stringify({
            type: 'thinking',
            content: getContextualThinkingMessage(stakeholderType),
            agents: orchestratorAgents
          });
          controller.enqueue(new TextEncoder().encode(`data: ${thinkingData}\n\n`));

          // Execute workflow with compliance
          const executionContext: ExecutionContext = {
            user_id: context?.userId || 'anonymous',
            session_id: conversationId || `session-${Date.now()}`,
            timestamp: new Date().toISOString(),
            compliance_level: ComplianceLevel.HIGH,
            audit_required: true
          };

          const queryRequest: QueryRequest = {
            user_query: message,
            selected_agents: orchestratorAgents,
            conversation_context: context?.previousMessages || [],
            requirements: {
              response_style: 'comprehensive',
              include_citations: true,
              compliance_check: true
            }
          };

          const execution = await orch.executeWorkflowWithCompliance(
            workflowId,
            workflowInputs,
            executionContext
          );

          // Generate healthcare response based on execution results
          let finalResponse = '';
          if (execution.interactions && execution.interactions.length > 0) {
            const lastInteraction = execution.interactions[execution.interactions.length - 1];
            if (lastInteraction.outputs?.content) {
              finalResponse = lastInteraction.outputs.content;
            }
          }

          // Fallback response if execution didn't produce content
          if (!finalResponse) {
            finalResponse = generateContextualResponse(message, selectedAgents, execution, stakeholderType);
          }

          // Stream the response word by word
          const words = finalResponse.split(' ');
          let currentText = '';

          for (let i = 0; i < words.length; i++) {
            // eslint-disable-next-line security/detect-object-injection
            currentText += (i > 0 ? ' ' : '') + words[i];

            const data = JSON.stringify({
              type: 'content',
              // eslint-disable-next-line security/detect-object-injection
              content: (i > 0 ? ' ' : '') + words[i],
              fullContent: currentText,
            });

            controller.enqueue(new TextEncoder().encode(`data: ${data}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 30 + Math.random() * 40));
          }

          // Send final metadata
          const finalMetadata = JSON.stringify({
            type: 'metadata',
            metadata: {
              citations: generateContextualCitations(selectedAgents, stakeholderType),
              followupQuestions: generateContextualFollowupQuestions(message, selectedAgents, stakeholderType),
              sources: generateContextualSources(selectedAgents, stakeholderType),
              processingTime: execution.completed_at
                ? new Date(execution.completed_at).getTime() - new Date(execution.started_at).getTime()
                : 2000,
              compliance: execution.compliance_summary,
              agents: selectedAgents.map((agentType: string, index: number) => ({
                id: `agent-${index}`,
                type: agentType,
                // eslint-disable-next-line security/detect-object-injection
                name: AGENT_NAME_MAPPING[agentType] || agentType,
                avatar: getAgentAvatar(agentType),
                specialty: getAgentSpecialty(agentType)
              }))
            },
          });

          controller.enqueue(new TextEncoder().encode(`data: ${finalData}\n\n`));
          controller.close();

        } catch (error) {
          // console.error('❌ Orchestrator streaming error:', error);
          const errorData = JSON.stringify({
            type: 'error',
            error: 'Failed to process your request with our healthcare AI experts',
            details: error instanceof Error ? error.message : 'Unknown error'
          });
          controller.enqueue(new TextEncoder().encode(`data: ${errorData}\n\n`));
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
    // console.error('❌ Chat Orchestrator API Error:', error);

    return NextResponse.json({
      success: false,
      error: {
        code: 'ORCHESTRATOR_ERROR',
        message: 'Failed to process your request with our healthcare AI experts',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    }, { status: 500 });
  }
}

// Agent avatar helper function (still needed for metadata generation)
function getAgentAvatar(agentType: string): string {
  const avatars: Record<string, string> = {
    'fda-regulatory': '🏛️',
    'clinical-trial': '🔬',
    'digital-therapeutics': '📱',
    'ai-ml-specialist': '🧠',
    'reimbursement': '💰',
    'medical-safety': '🛡️',
    'data-privacy': '🔒',
    'compliance-monitor': '⚖️',
    'ema-specialist': '🇪🇺',
    'biostatistics': '📊',
    'market-access': '🏥',
    'patient-engagement': '👥',
    'real-world-evidence': '📈',
    'quality-systems': '✅'
  };
  // eslint-disable-next-line security/detect-object-injection
  return avatars[agentType] || '🤖';
}
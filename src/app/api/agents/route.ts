/**
 * Digital Health Agents API
 * GET /api/agents - List all available agents
 * POST /api/agents/execute - Execute a single agent prompt
 */

import { NextRequest, NextResponse } from 'next/server';
import { ComplianceAwareOrchestrator } from '@/agents/core/ComplianceAwareOrchestrator';
import {
  ExecutePromptRequest,
  AgentListResponse,
  ExecutionContext,
  ComplianceLevel
} from '@/types/digital-health-agent.types';

// Initialize orchestrator (in production, use singleton pattern or dependency injection)
let orchestrator: ComplianceAwareOrchestrator | null = null;

async function getOrchestrator(): Promise<ComplianceAwareOrchestrator> {
  if (!orchestrator) {
    orchestrator = new ComplianceAwareOrchestrator();
    await orchestrator.initializeWithCompliance();
  }
  return orchestrator;
}

/**
 * GET /api/agents
 * Returns list of available agents with their capabilities
 */
export async function GET() {
  try {
    const orch = await getOrchestrator();
    const agentStatuses = orch.getAgentStatus();

    // Get available workflows
    const workflows = orch.getAvailableWorkflows();

    const response: AgentListResponse = {
      agents: agentStatuses.map(agent => ({
        name: agent.name,
        display_name: agent.display_name,
        tier: (agent as any).tier || 1,
        priority: (agent as any).priority || 100,
        domain: (agent as any).domain_expertise || 'general' as any,
        capabilities: orch.getAgentCapabilities(agent.name),
        prompts: orch.getAgentPrompts(agent.name),
        status: agent.status as any
      })),
      total_count: agentStatuses.length,
      tier_breakdown: {
        tier_1: agentStatuses.length,
        tier_2: 0,
        tier_3: 0
      }
    };

    return NextResponse.json({
      success: true,
      data: response,
      workflows: workflows,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch agents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/agents/execute
 * Execute a single agent prompt with HIPAA compliance
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecutePromptRequest = await request.json();

    // Validate required fields
    if (!body.agent_name || !body.prompt_title || !body.user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: 'agent_name, prompt_title, and user_id are required'
        },
        { status: 400 }
      );
    }

    // Create execution context
    const context: ExecutionContext = {
      user_id: body.user_id,
      session_id: body.context?.session_id || `session_${Date.now()}`,
      timestamp: new Date().toISOString(),
      compliance_level: body.context?.compliance_level || ComplianceLevel.HIGH,
      audit_required: true
    };

    const orch = await getOrchestrator();

    // Execute agent with compliance protection
    const result = await orch.executeAgentWithCompliance(
      body.agent_name,
      body.prompt_title,
      body.inputs || {},
      context
    );

    return NextResponse.json({
      success: true,
      data: {
        execution_id: `exec_${Date.now()}`,
        agent_name: body.agent_name,
        prompt_title: body.prompt_title,
        result: result,
        execution_time: result.execution_time,
        compliance_status: result.compliance_status
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing agent:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Agent execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
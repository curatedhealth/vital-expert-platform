/**
 * Digital Health Workflows API
 * GET /api/workflows - List available workflows
 * POST /api/workflows/execute - Execute a multi-agent workflow
 */

import { NextRequest, NextResponse } from 'next/server';

import { ComplianceAwareOrchestrator } from '@/agents/core/ComplianceAwareOrchestrator';
import {
  ExecuteWorkflowRequest,
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
 * GET /api/workflows
 * Returns list of available workflows
 */
export async function GET() {
  try {
    const orch = await getOrchestrator();
    const workflows = orch.getAvailableWorkflows();

    return NextResponse.json({
      success: true,
      data: {
        workflows: workflows,
        total_count: workflows.length,
        categories: {
          regulatory: workflows.filter((w: any) => w.name.toLowerCase().includes('regulatory')).length,
          clinical: workflows.filter((w: any) => w.name.toLowerCase().includes('clinical')).length,
          market_access: workflows.filter((w: any) => w.name.toLowerCase().includes('market')).length
        }
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error fetching workflows:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch workflows',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows/execute
 * Execute a multi-agent workflow with HIPAA compliance
 */
export async function POST(request: NextRequest) {
  try {
    const body: ExecuteWorkflowRequest = await request.json();

    // Validate required fields
    if (!body.workflow_name || !body.user_id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
          details: 'workflow_name and user_id are required'
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

    // Execute workflow with compliance protection
    const execution = await orch.executeWorkflowWithCompliance(
      body.workflow_name,
      body.initial_inputs || { /* TODO: implement */ },
      context
    );

    return NextResponse.json({
      success: true,
      data: {
        execution_id: execution.execution_id,
        workflow_id: execution.workflow_id,
        status: execution.status,
        steps_completed: execution.steps_completed,
        total_steps: execution.total_steps,
        compliance_summary: execution.compliance_summary,
        started_at: execution.started_at,
        completed_at: execution.completed_at,
        interactions: execution.interactions.map(interaction => ({
          interaction_id: interaction.interaction_id,
          agent_name: interaction.agent_name,
          action: interaction.action,
          success: interaction.success,
          execution_time: interaction.execution_time,
          compliance_status: (interaction.outputs as unknown).compliance_status
        }))
      },
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Error executing workflow:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Workflow execution failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
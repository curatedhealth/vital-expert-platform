import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { enhancedJTBDExecutionEngine } from '@/lib/jtbd/enhanced-execution-engine';
import { EnhancedWorkflowDefinition } from '@/types/workflow-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/workflows/execute - Execute a workflow
 */
export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get('user-id');
    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const {
      workflowId,
      workflow,
      executionMode = 'Automated',
      inputData,
      testMode = false
    } = body;

    let workflowDefinition: EnhancedWorkflowDefinition;

    // Get workflow definition
    if (workflow) {
      // Use provided workflow definition
      workflowDefinition = workflow;
    } else if (workflowId) {
      // Fetch workflow from database
      const workflowData = await fetchWorkflowDefinition(workflowId, userId);
      if (!workflowData) {
        return NextResponse.json(
          { error: 'Workflow not found' },
          { status: 404 }
        );
      }
      workflowDefinition = workflowData;
    } else {
      return NextResponse.json(
        { error: 'Either workflowId or workflow definition is required' },
        { status: 400 }
      );
    }

    // Validate execution mode
    const validModes = ['Automated', 'Semi-automated', 'Manual'];
    if (!validModes.includes(executionMode)) {
      return NextResponse.json({
        error: `Invalid execution mode. Valid modes: ${validModes.join(', ')}`
      }, { status: 400 });
    }

    // Start execution using enhanced engine
    try {
      const executionRequest = {
        jtbd_id: workflowDefinition.id,
        user_id: userId,
        execution_mode: executionMode as 'Automated' | 'Semi-automated' | 'Manual',
        input_data: inputData || {},
        test_mode: testMode
      };

      // Use the enhanced execution engine
      const result = await enhancedJTBDExecutionEngine.startExecution(executionRequest);

      // If this is an enhanced workflow, use the enhanced execution method
      if (isEnhancedWorkflow(workflowDefinition)) {
        // Start enhanced execution in background
        enhancedJTBDExecutionEngine.executeEnhancedWorkflow(
          result.execution_id,
          workflowDefinition,
          inputData
        ).catch(error => {
          console.error(`Enhanced execution ${result.execution_id} failed:`, error);
        });
      }

      return NextResponse.json({
        success: true,
        execution_id: result.execution_id,
        status: result.status,
        workflow_id: workflowDefinition.id,
        workflow_name: workflowDefinition.name,
        estimated_duration: calculateEstimatedDuration(workflowDefinition),
        message: testMode ? 'Test execution started' : 'Workflow execution started'
      });

    } catch (executionError) {
      console.error('Execution start failed:', executionError);
      return NextResponse.json({
        error: 'Failed to start workflow execution',
        details: executionError instanceof Error ? executionError.message : 'Unknown error'
      }, { status: 500 });
    }

  } catch (error) {
    console.error('POST /api/workflows/execute error:', error);
    return NextResponse.json({
      error: 'Failed to execute workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * GET /api/workflows/execute/[executionId] - Get execution status
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { executionId: string } }
) {
  try {
    const executionId = parseInt(params.executionId);
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    if (isNaN(executionId)) {
      return NextResponse.json(
        { error: 'Invalid execution ID' },
        { status: 400 }
      );
    }

    // Get execution progress
    const progress = await enhancedJTBDExecutionEngine.getExecutionProgress(executionId);

    if (!progress) {
      return NextResponse.json(
        { error: 'Execution not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this execution
    const { data: execution, error } = await supabase
      .from('jtbd_executions')
      .select('user_id, jtbd_id')
      .eq('id', executionId)
      .single();

    if (error || !execution || execution.user_id !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      execution_id: executionId,
      progress,
      status: 'success'
    });

  } catch (error) {
    console.error('GET execution status error:', error);
    return NextResponse.json({
      error: 'Failed to get execution status',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Helper function for pause execution
 */
async function pauseExecution(executionId: number, userId: string) {
  try {
    // Verify user has access
    const { data: execution, error } = await supabase
      .from('jtbd_executions')
      .select('user_id')
      .eq('id', executionId)
      .single();

    if (error || !execution || execution.user_id !== userId) {
      throw new Error('Access denied');
    }

    const success = await enhancedJTBDExecutionEngine.pauseExecution(executionId);

    return { success };

  } catch (error) {
    console.error('Pause execution error:', error);
    throw error;
  }
}

/**
 * Helper function for resume execution
 */
async function resumeExecution(executionId: number, userId: string, userInput?: any) {
  try {
    // Verify user has access
    const { data: execution, error } = await supabase
      .from('jtbd_executions')
      .select('user_id')
      .eq('id', executionId)
      .single();

    if (error || !execution || execution.user_id !== userId) {
      throw new Error('Access denied');
    }

    const success = await enhancedJTBDExecutionEngine.resumeExecution(executionId, userInput);

    return { success };

  } catch (error) {
    console.error('Resume execution error:', error);
    throw error;
  }
}

/**
 * Fetch workflow definition from various sources
 */
async function fetchWorkflowDefinition(
  workflowId: string,
  userId: string
): Promise<EnhancedWorkflowDefinition | null> {
  try {
    // First try workflow_templates
    const { data: templateData, error: templateError } = await supabase
      .from('workflow_templates')
      .select('template_data, is_public, created_by')
      .eq('id', workflowId)
      .single();

    if (!templateError && templateData) {
      // Check permissions
      if (!templateData.is_public && templateData.created_by !== userId) {
        return null;
      }
      return templateData.template_data as EnhancedWorkflowDefinition;
    }

    // Try workflow_versions
    const { data: versionData, error: versionError } = await supabase
      .from('workflow_versions')
      .select('workflow_definition, created_by')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!versionError && versionData) {
      // Check permissions
      if (versionData.created_by !== userId) {
        return null;
      }
      return versionData.workflow_definition as EnhancedWorkflowDefinition;
    }

    // Fallback: construct from jtbd_process_steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('jtbd_process_steps')
      .select('*')
      .eq('jtbd_id', workflowId)
      .order('step_number', { ascending: true });

    if (stepsError || !stepsData || stepsData.length === 0) {
      return null;
    }

    // Construct enhanced workflow from steps
    const workflow: EnhancedWorkflowDefinition = {
      id: workflowId,
      name: `Workflow ${workflowId}`,
      description: 'Constructed from legacy steps',
      version: '1.0',
      category: 'Custom',
      steps: stepsData,
      conditional_logic: [],
      parallel_branches: [],
      error_strategies: [],
      success_criteria: {
        required_outputs: [],
        quality_thresholds: {}
      },
      metadata: {
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    };

    return workflow;

  } catch (error) {
    console.error('Error fetching workflow definition:', error);
    return null;
  }
}

/**
 * Check if workflow uses enhanced features
 */
function isEnhancedWorkflow(workflow: EnhancedWorkflowDefinition): boolean {
  // Check for enhanced features
  const hasConditionalLogic = workflow.steps.some(step =>
    step.conditional_next && step.conditional_next.length > 0
  );

  const hasParallelExecution = workflow.steps.some(step => step.is_parallel);

  const hasAdvancedAgentSelection = workflow.steps.some(step =>
    step.agent_selection && step.agent_selection.strategy !== 'manual'
  );

  const hasRetryConfig = workflow.steps.some(step => step.retry_config);

  const hasValidationRules = workflow.steps.some(step =>
    step.validation_rules && step.validation_rules.length > 0
  );

  return hasConditionalLogic ||
         hasParallelExecution ||
         hasAdvancedAgentSelection ||
         hasRetryConfig ||
         hasValidationRules ||
         workflow.parallel_branches.length > 0 ||
         workflow.error_strategies.length > 0;
}

/**
 * Calculate estimated execution duration
 */
function calculateEstimatedDuration(workflow: EnhancedWorkflowDefinition): number {
  if (!workflow.steps || workflow.steps.length === 0) {
    return 0;
  }

  // Basic calculation: sum of all step durations
  let totalDuration = workflow.steps.reduce(
    (sum, step) => sum + (step.estimated_duration || 30),
    0
  );

  // Adjust for parallel execution
  if (workflow.parallel_branches && workflow.parallel_branches.length > 0) {
    for (const branch of workflow.parallel_branches) {
      const branchSteps = workflow.steps.filter(step => branch.steps.includes(step.id.toString()));
      const branchDuration = Math.max(
        ...branchSteps.map(step => step.estimated_duration || 30)
      );

      // Subtract the sum of parallel steps and add the longest one
      const parallelSum = branchSteps.reduce(
        (sum, step) => sum + (step.estimated_duration || 30),
        0
      );

      totalDuration = totalDuration - parallelSum + branchDuration;
    }
  }

  // Add buffer for conditional logic and retries
  const hasComplexLogic = workflow.steps.some(step =>
    step.conditional_next && step.conditional_next.length > 1
  );

  if (hasComplexLogic) {
    totalDuration *= 1.2; // 20% buffer
  }

  return Math.round(totalDuration);
}
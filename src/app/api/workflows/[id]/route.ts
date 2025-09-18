import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { EnhancedWorkflowDefinition } from '@/types/workflow-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/workflows/[id] - Get a specific workflow by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    const userId = request.headers.get('user-id');

    // First try to get from workflow_templates
    const { data: templateData, error: templateError } = await supabase
      .from('workflow_templates')
      .select('*')
      .eq('id', workflowId)
      .single();

    if (!templateError && templateData) {
      // Check permissions for private templates
      if (!templateData.is_public && templateData.created_by !== userId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        workflow: templateData.template_data,
        template: templateData,
        source: 'template'
      });
    }

    // Try to get from workflow_versions
    const { data: versionData, error: versionError } = await supabase
      .from('workflow_versions')
      .select('*')
      .eq('workflow_id', workflowId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!versionError && versionData) {
      // Check permissions
      if (versionData.created_by !== userId) {
        return NextResponse.json(
          { error: 'Access denied' },
          { status: 403 }
        );
      }

      return NextResponse.json({
        workflow: versionData.workflow_definition,
        version: versionData,
        source: 'version'
      });
    }

    // Try to construct from process steps
    const { data: stepsData, error: stepsError } = await supabase
      .from('jtbd_process_steps')
      .select('*')
      .eq('jtbd_id', workflowId)
      .order('step_number', { ascending: true });

    if (stepsError || !stepsData || stepsData.length === 0) {
      return NextResponse.json(
        { error: 'Workflow not found' },
        { status: 404 }
      );
    }

    // Construct workflow from steps
    const workflow: EnhancedWorkflowDefinition = {
      id: workflowId,
      name: `Workflow ${workflowId}`,
      description: 'Legacy workflow constructed from steps',
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

    return NextResponse.json({
      workflow,
      source: 'steps'
    });

  } catch (error) {
    console.error('GET /api/workflows/[id] error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/workflows/[id] - Update a specific workflow
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const workflow: EnhancedWorkflowDefinition = body.workflow;
    const changeSummary: string = body.changeSummary || 'Updated workflow';

    // Verify ownership/permissions
    const { data: existingTemplate } = await supabase
      .from('workflow_templates')
      .select('created_by, is_public')
      .eq('id', workflowId)
      .single();

    if (existingTemplate && existingTemplate.created_by !== userId && !existingTemplate.is_public) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Update workflow steps
    const workflowSteps = workflow.steps.map(step => ({
      ...step,
      updated_at: new Date().toISOString()
    }));

    // Delete existing steps and insert new ones
    await supabase
      .from('jtbd_process_steps')
      .delete()
      .eq('jtbd_id', workflowId);

    const { error: stepsError } = await supabase
      .from('jtbd_process_steps')
      .insert(workflowSteps);

    if (stepsError) {
      console.error('Error updating workflow steps:', stepsError);
      throw stepsError;
    }

    // Create new version
    const { error: versionError } = await supabase
      .from('workflow_versions')
      .insert({
        workflow_id: workflowId,
        version: workflow.version,
        workflow_definition: workflow,
        change_summary: changeSummary,
        created_by: userId
      });

    if (versionError) {
      console.error('Error creating workflow version:', versionError);
      throw versionError;
    }

    // Update template if it exists
    if (existingTemplate) {
      await supabase
        .from('workflow_templates')
        .update({
          name: workflow.name,
          description: workflow.description,
          template_data: workflow,
          version: workflow.version,
          updated_at: new Date().toISOString()
        })
        .eq('id', workflowId);
    }

    return NextResponse.json({
      success: true,
      workflowId,
      message: 'Workflow updated successfully'
    });

  } catch (error) {
    console.error('PUT /api/workflows/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to update workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * DELETE /api/workflows/[id] - Delete a specific workflow
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const workflowId = params.id;
    const userId = request.headers.get('user-id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User authentication required' },
        { status: 401 }
      );
    }

    // Verify ownership
    const { data: existingTemplate } = await supabase
      .from('workflow_templates')
      .select('created_by')
      .eq('id', workflowId)
      .single();

    if (existingTemplate && existingTemplate.created_by !== userId) {
      return NextResponse.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }

    // Check if workflow is being used in active executions
    const { data: activeExecutions } = await supabase
      .from('jtbd_executions')
      .select('id')
      .eq('jtbd_id', workflowId)
      .in('status', ['Running', 'Initializing', 'Paused']);

    if (activeExecutions && activeExecutions.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete workflow with active executions',
        activeExecutions: activeExecutions.length
      }, { status: 409 });
    }

    // Delete related data
    await Promise.all([
      // Delete workflow steps
      supabase
        .from('jtbd_process_steps')
        .delete()
        .eq('jtbd_id', workflowId),

      // Delete workflow versions
      supabase
        .from('workflow_versions')
        .delete()
        .eq('workflow_id', workflowId),

      // Delete workflow template
      supabase
        .from('workflow_templates')
        .delete()
        .eq('id', workflowId),

      // Delete analytics data
      supabase
        .from('workflow_analytics')
        .delete()
        .eq('workflow_id', workflowId)
    ]);

    return NextResponse.json({
      success: true,
      message: 'Workflow deleted successfully'
    });

  } catch (error) {
    console.error('DELETE /api/workflows/[id] error:', error);
    return NextResponse.json({
      error: 'Failed to delete workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
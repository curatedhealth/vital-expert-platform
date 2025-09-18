import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  EnhancedWorkflowDefinition,
  WorkflowTemplate,
  ValidationResult,
  WorkflowFilters
} from '@/types/workflow-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * GET /api/workflows - List all workflows with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = request.headers.get('user-id');

    // Parse query parameters
    const filters: WorkflowFilters = {
      category: searchParams.get('category') || undefined,
      complexity: searchParams.get('complexity') as 'Low' | 'Medium' | 'High' || undefined,
      search: searchParams.get('search') || undefined,
      is_public: searchParams.get('is_public') === 'true' || undefined
    };

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = (page - 1) * limit;

    // Build query
    let query = supabase
      .from('workflow_templates')
      .select('*', { count: 'exact' });

    // Apply filters
    if (filters.category) {
      query = query.eq('category', filters.category);
    }

    if (filters.complexity) {
      query = query.eq('complexity_level', filters.complexity);
    }

    if (filters.search) {
      query = query.or(`name.ilike.%${filters.search}%,description.ilike.%${filters.search}%`);
    }

    if (filters.is_public !== undefined) {
      query = query.eq('is_public', filters.is_public);
    }

    // If not requesting public workflows and user is provided, include user's private workflows
    if (userId && filters.is_public !== true) {
      query = query.or(`is_public.eq.true,created_by.eq.${userId}`);
    }

    // Apply pagination and ordering
    const { data, error, count } = await query
      .order('rating', { ascending: false })
      .order('usage_count', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching workflows:', error);
      return NextResponse.json(
        { error: 'Failed to fetch workflows' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      workflows: data || [],
      total: count || 0,
      page,
      limit,
      has_more: (count || 0) > offset + limit
    });

  } catch (error) {
    console.error('GET /api/workflows error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workflows - Create a new workflow
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
    const workflow: EnhancedWorkflowDefinition = body.workflow;
    const saveAsTemplate: boolean = body.saveAsTemplate || false;

    // Validate workflow
    const validation = await validateWorkflow(workflow);
    if (!validation.isValid) {
      return NextResponse.json({
        error: 'Workflow validation failed',
        validation
      }, { status: 400 });
    }

    // Save workflow steps
    const workflowSteps = workflow.steps.map(step => ({
      ...step,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    const { error: stepsError } = await supabase
      .from('jtbd_process_steps')
      .upsert(workflowSteps);

    if (stepsError) {
      console.error('Error saving workflow steps:', stepsError);
      throw stepsError;
    }

    // Save workflow version
    const { error: versionError } = await supabase
      .from('workflow_versions')
      .insert({
        workflow_id: workflow.id,
        version: workflow.version,
        workflow_definition: workflow,
        change_summary: 'Initial creation',
        created_by: userId
      });

    if (versionError) {
      console.error('Error saving workflow version:', versionError);
      throw versionError;
    }

    // Save as template if requested
    let templateId = null;
    if (saveAsTemplate) {
      const template: Partial<WorkflowTemplate> = {
        name: workflow.name,
        description: workflow.description,
        category: workflow.category as any,
        complexity_level: 'Medium', // Default or infer from steps
        estimated_duration: workflow.steps.reduce((sum, step) => sum + (step.estimated_duration || 0), 0),
        template_data: workflow,
        is_public: false,
        version: workflow.version,
        created_by: userId
      };

      const { data: templateData, error: templateError } = await supabase
        .from('workflow_templates')
        .insert([template])
        .select()
        .single();

      if (templateError) {
        console.error('Error saving workflow template:', templateError);
        // Don't fail the entire request for template creation error
      } else {
        templateId = templateData?.id;
      }
    }

    return NextResponse.json({
      success: true,
      workflowId: workflow.id,
      templateId,
      message: 'Workflow created successfully'
    });

  } catch (error) {
    console.error('POST /api/workflows error:', error);
    return NextResponse.json({
      error: 'Failed to create workflow',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

/**
 * Validate workflow structure and requirements
 */
async function validateWorkflow(workflow: EnhancedWorkflowDefinition): Promise<ValidationResult> {
  const errors: any[] = [];
  const warnings: any[] = [];

  // Basic validation
  if (!workflow.name || workflow.name.trim().length === 0) {
    errors.push({
      type: 'missing_field',
      field: 'name',
      message: 'Workflow name is required'
    });
  }

  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push({
      type: 'missing_steps',
      message: 'Workflow must have at least one step'
    });
  }

  // Step validation
  if (workflow.steps) {
    const stepIds = new Set(workflow.steps.map(s => s.id.toString()));

    for (const step of workflow.steps) {
      // Check for required step fields
      if (!step.step_name || step.step_name.trim().length === 0) {
        errors.push({
          type: 'missing_step_name',
          stepId: step.id,
          message: `Step ${step.step_number} is missing a name`
        });
      }

      if (!step.step_description || step.step_description.trim().length === 0) {
        warnings.push({
          type: 'missing_step_description',
          stepId: step.id,
          message: `Step ${step.step_number} is missing a description`
        });
      }

      // Check conditional logic references
      if (step.conditional_next) {
        for (const condition of step.conditional_next) {
          if (!stepIds.has(condition.next_step_id)) {
            errors.push({
              type: 'invalid_reference',
              stepId: step.id,
              message: `Step ${step.step_number} references non-existent step: ${condition.next_step_id}`
            });
          }
        }
      }

      // Check for circular dependencies
      if (hasCircularDependency(workflow, step.id.toString())) {
        errors.push({
          type: 'circular_dependency',
          stepId: step.id,
          message: `Step ${step.step_number} creates a circular dependency`
        });
      }
    }
  }

  // Validate agent assignments
  if (workflow.steps) {
    const agentIds = await getValidAgentIds();

    for (const step of workflow.steps) {
      if (step.agent_id && !agentIds.has(step.agent_id)) {
        warnings.push({
          type: 'agent_not_found',
          stepId: step.id,
          message: `Step ${step.step_number} references unknown agent: ${step.agent_id}`
        });
      }
    }
  }

  // Check success criteria
  if (workflow.success_criteria) {
    const stepOutputs = new Set(
      workflow.steps.flatMap(step => Object.keys(step.output_schema?.properties || {}))
    );

    for (const requiredOutput of workflow.success_criteria.required_outputs || []) {
      if (!stepOutputs.has(requiredOutput)) {
        warnings.push({
          type: 'missing_required_output',
          message: `Required output '${requiredOutput}' is not produced by any step`
        });
      }
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Check for circular dependencies in workflow
 */
function hasCircularDependency(workflow: EnhancedWorkflowDefinition, startStepId?: string): boolean {
  const visited = new Set<string>();
  const recursionStack = new Set<string>();

  function dfs(stepId: string): boolean {
    if (recursionStack.has(stepId)) {
      return true; // Circular dependency found
    }

    if (visited.has(stepId)) {
      return false; // Already processed
    }

    visited.add(stepId);
    recursionStack.add(stepId);

    const step = workflow.steps.find(s => s.id.toString() === stepId);
    if (step?.conditional_next) {
      for (const condition of step.conditional_next) {
        if (dfs(condition.next_step_id)) {
          return true;
        }
      }
    }

    recursionStack.delete(stepId);
    return false;
  }

  if (startStepId) {
    return dfs(startStepId);
  }

  // Check all steps
  for (const step of workflow.steps) {
    if (dfs(step.id.toString())) {
      return true;
    }
  }

  return false;
}

/**
 * Get valid agent IDs from database
 */
async function getValidAgentIds(): Promise<Set<string>> {
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('id')
      .eq('status', 'active');

    if (error) {
      console.error('Error fetching agent IDs:', error);
      return new Set();
    }

    return new Set(data?.map(agent => agent.id) || []);
  } catch (error) {
    console.error('Error in getValidAgentIds:', error);
    return new Set();
  }
}
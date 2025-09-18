import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import {
  EnhancedWorkflowDefinition,
  ValidationResult,
  ValidationError,
  ValidationWarning
} from '@/types/workflow-enhanced';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

/**
 * POST /api/workflows/validate - Validate workflow structure and configuration
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const workflow: EnhancedWorkflowDefinition = body;

    const validation = await validateWorkflow(workflow);

    return NextResponse.json(validation);

  } catch (error) {
    console.error('POST /api/workflows/validate error:', error);
    return NextResponse.json({
      isValid: false,
      errors: [{
        type: 'system_error',
        message: 'Validation service failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }],
      warnings: []
    }, { status: 500 });
  }
}

/**
 * Comprehensive workflow validation
 */
async function validateWorkflow(workflow: EnhancedWorkflowDefinition): Promise<ValidationResult> {
  const errors: ValidationError[] = [];
  const warnings: ValidationWarning[] = [];

  // 1. Basic Structure Validation
  await validateBasicStructure(workflow, errors, warnings);

  // 2. Step Validation
  await validateSteps(workflow, errors, warnings);

  // 3. Conditional Logic Validation
  await validateConditionalLogic(workflow, errors, warnings);

  // 4. Parallel Execution Validation
  await validateParallelExecution(workflow, errors, warnings);

  // 5. Agent Assignment Validation
  await validateAgentAssignments(workflow, errors, warnings);

  // 6. Dependency Validation
  await validateDependencies(workflow, errors, warnings);

  // 7. Success Criteria Validation
  await validateSuccessCriteria(workflow, errors, warnings);

  // 8. Performance and Resource Validation
  await validatePerformanceConstraints(workflow, errors, warnings);

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Validate basic workflow structure
 */
async function validateBasicStructure(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  // Required fields
  if (!workflow.name || workflow.name.trim().length === 0) {
    errors.push({
      type: 'missing_field',
      message: 'Workflow name is required'
    });
  }

  if (!workflow.id || workflow.id.trim().length === 0) {
    errors.push({
      type: 'missing_field',
      message: 'Workflow ID is required'
    });
  }

  if (!workflow.version || workflow.version.trim().length === 0) {
    errors.push({
      type: 'missing_field',
      message: 'Workflow version is required'
    });
  }

  // Version format validation
  if (workflow.version && !/^\d+\.\d+(\.\d+)?$/.test(workflow.version)) {
    errors.push({
      type: 'invalid_format',
      message: 'Version must follow semantic versioning format (e.g., 1.0.0)'
    });
  }

  // Category validation
  const validCategories = ['Regulatory', 'Clinical', 'Market Access', 'Medical Affairs', 'Custom'];
  if (workflow.category && !validCategories.includes(workflow.category)) {
    warnings.push({
      type: 'invalid_category',
      message: `Invalid category '${workflow.category}'. Valid categories: ${validCategories.join(', ')}`
    });
  }

  // Steps presence
  if (!workflow.steps || workflow.steps.length === 0) {
    errors.push({
      type: 'missing_steps',
      message: 'Workflow must have at least one step'
    });
  }

  // Workflow naming conventions
  if (workflow.name && workflow.name.length > 100) {
    warnings.push({
      type: 'naming_convention',
      message: 'Workflow name should be less than 100 characters'
    });
  }

  if (workflow.description && workflow.description.length > 1000) {
    warnings.push({
      type: 'description_length',
      message: 'Workflow description should be less than 1000 characters'
    });
  }
}

/**
 * Validate individual workflow steps
 */
async function validateSteps(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.steps) return;

  const stepIds = new Set(workflow.steps.map(s => s.id.toString()));
  const stepNumbers = new Set<number>();

  for (const step of workflow.steps) {
    const stepContext = `Step ${step.step_number} (${step.step_name || 'unnamed'})`;

    // Required fields
    if (!step.id && step.id !== 0) {
      errors.push({
        type: 'missing_step_id',
        stepId: step.id.toString(),
        message: `${stepContext}: Step ID is required`
      });
    }

    if (!step.step_name || step.step_name.trim().length === 0) {
      errors.push({
        type: 'missing_step_name',
        stepId: step.id.toString(),
        message: `${stepContext}: Step name is required`
      });
    }

    if (!step.step_description || step.step_description.trim().length === 0) {
      warnings.push({
        type: 'missing_step_description',
        stepId: step.id.toString(),
        message: `${stepContext}: Step description is recommended`
      });
    }

    // Step number validation
    if (step.step_number < 1) {
      errors.push({
        type: 'invalid_step_number',
        stepId: step.id.toString(),
        message: `${stepContext}: Step number must be positive`
      });
    }

    if (stepNumbers.has(step.step_number)) {
      errors.push({
        type: 'duplicate_step_number',
        stepId: step.id.toString(),
        message: `${stepContext}: Duplicate step number ${step.step_number}`
      });
    }
    stepNumbers.add(step.step_number);

    // Duration validation
    if (step.estimated_duration && step.estimated_duration < 1) {
      warnings.push({
        type: 'invalid_duration',
        stepId: step.id.toString(),
        message: `${stepContext}: Estimated duration should be at least 1 minute`
      });
    }

    if (step.estimated_duration && step.estimated_duration > 480) { // 8 hours
      warnings.push({
        type: 'long_duration',
        stepId: step.id.toString(),
        message: `${stepContext}: Step duration exceeds 8 hours, consider breaking into smaller steps`
      });
    }

    // Capability validation
    if (step.required_capabilities && step.required_capabilities.length === 0) {
      warnings.push({
        type: 'no_capabilities',
        stepId: step.id.toString(),
        message: `${stepContext}: No required capabilities specified`
      });
    }

    // Validation rules validation
    if (step.validation_rules) {
      for (const rule of step.validation_rules) {
        if (!rule.field || !rule.rule || !rule.message) {
          errors.push({
            type: 'invalid_validation_rule',
            stepId: step.id.toString(),
            message: `${stepContext}: Validation rule missing required fields`
          });
        }
      }
    }

    // Retry configuration validation
    if (step.retry_config) {
      if (step.retry_config.max_retries < 0 || step.retry_config.max_retries > 10) {
        warnings.push({
          type: 'invalid_retry_config',
          stepId: step.id.toString(),
          message: `${stepContext}: Max retries should be between 0 and 10`
        });
      }

      if (step.retry_config.retry_delay_ms < 100 || step.retry_config.retry_delay_ms > 60000) {
        warnings.push({
          type: 'invalid_retry_delay',
          stepId: step.id.toString(),
          message: `${stepContext}: Retry delay should be between 100ms and 60s`
        });
      }
    }

    // Timeout configuration validation
    if (step.timeout_config) {
      if (step.timeout_config.timeout_ms < 1000 || step.timeout_config.timeout_ms > 3600000) {
        warnings.push({
          type: 'invalid_timeout',
          stepId: step.id.toString(),
          message: `${stepContext}: Timeout should be between 1s and 1 hour`
        });
      }
    }
  }
}

/**
 * Validate conditional logic
 */
async function validateConditionalLogic(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.steps) return;

  const stepIds = new Set(workflow.steps.map(s => s.id.toString()));

  for (const step of workflow.steps) {
    if (!step.conditional_next) continue;

    for (const condition of step.conditional_next) {
      const stepContext = `Step ${step.step_number} condition`;

      // Check target step exists
      if (!stepIds.has(condition.next_step_id)) {
        errors.push({
          type: 'invalid_reference',
          stepId: step.id.toString(),
          message: `${stepContext}: References non-existent step '${condition.next_step_id}'`
        });
      }

      // Validate condition expression
      if (!condition.condition || condition.condition.trim().length === 0) {
        errors.push({
          type: 'empty_condition',
          stepId: step.id.toString(),
          message: `${stepContext}: Condition expression cannot be empty`
        });
      }

      // Try to validate JavaScript syntax
      try {
        new Function('output', 'confidence', 'status', `return ${condition.condition}`);
      } catch (error) {
        errors.push({
          type: 'invalid_condition_syntax',
          stepId: step.id.toString(),
          message: `${stepContext}: Invalid condition syntax - ${error instanceof Error ? error.message : 'Unknown error'}`
        });
      }

      // Check for self-reference
      if (condition.next_step_id === step.id.toString()) {
        errors.push({
          type: 'self_reference',
          stepId: step.id.toString(),
          message: `${stepContext}: Step cannot reference itself`
        });
      }

      // Priority validation
      if (condition.priority && (condition.priority < 1 || condition.priority > 100)) {
        warnings.push({
          type: 'invalid_priority',
          stepId: step.id.toString(),
          message: `${stepContext}: Priority should be between 1 and 100`
        });
      }
    }
  }
}

/**
 * Validate parallel execution configuration
 */
async function validateParallelExecution(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.parallel_branches) return;

  const stepIds = new Set(workflow.steps?.map(s => s.id.toString()) || []);

  for (const branch of workflow.parallel_branches) {
    // Check all steps in branch exist
    for (const stepId of branch.steps) {
      if (!stepIds.has(stepId)) {
        errors.push({
          type: 'invalid_parallel_reference',
          message: `Parallel branch '${branch.name}' references non-existent step '${stepId}'`
        });
      }
    }

    // Check merge step exists
    if (branch.merge_step && !stepIds.has(branch.merge_step)) {
      errors.push({
        type: 'invalid_merge_step',
        message: `Parallel branch '${branch.name}' has invalid merge step '${branch.merge_step}'`
      });
    }

    // Validate merge strategy
    const validStrategies = ['wait_all', 'wait_first', 'wait_majority'];
    if (!validStrategies.includes(branch.merge_strategy)) {
      errors.push({
        type: 'invalid_merge_strategy',
        message: `Parallel branch '${branch.name}' has invalid merge strategy '${branch.merge_strategy}'`
      });
    }

    // Check for at least 2 steps in parallel
    if (branch.steps.length < 2) {
      warnings.push({
        type: 'insufficient_parallel_steps',
        message: `Parallel branch '${branch.name}' should have at least 2 steps`
      });
    }
  }
}

/**
 * Validate agent assignments and capabilities
 */
async function validateAgentAssignments(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.steps) return;

  // Get available agents
  const { data: agents, error } = await supabase
    .from('agents')
    .select('id, name, capabilities, status, tier')
    .eq('status', 'active');

  if (error) {
    warnings.push({
      type: 'agent_validation_failed',
      message: 'Could not validate agent assignments - database error'
    });
    return;
  }

  const agentMap = new Map(agents?.map(a => [a.id, a]) || []);

  for (const step of workflow.steps) {
    const stepContext = `Step ${step.step_number}`;

    // Validate specific agent assignment
    if (step.agent_id && !agentMap.has(step.agent_id)) {
      warnings.push({
        type: 'agent_not_found',
        stepId: step.id.toString(),
        message: `${stepContext}: Assigned agent '${step.agent_id}' not found or inactive`
      });
    }

    // Validate agent selection strategy
    if (step.agent_selection) {
      const validStrategies = ['manual', 'automatic', 'consensus', 'load_balanced', 'capability_based'];
      if (!validStrategies.includes(step.agent_selection.strategy)) {
        errors.push({
          type: 'invalid_agent_strategy',
          stepId: step.id.toString(),
          message: `${stepContext}: Invalid agent selection strategy '${step.agent_selection.strategy}'`
        });
      }

      // Validate consensus configuration
      if (step.agent_selection.strategy === 'consensus' && step.agent_selection.consensus_config) {
        const config = step.agent_selection.consensus_config;
        if (config.agent_count && (config.agent_count < 2 || config.agent_count > 5)) {
          warnings.push({
            type: 'invalid_consensus_count',
            stepId: step.id.toString(),
            message: `${stepContext}: Consensus agent count should be between 2 and 5`
          });
        }
      }

      // Validate manual selection
      if (step.agent_selection.strategy === 'manual' && !step.agent_selection.criteria?.preferred_agent_id) {
        errors.push({
          type: 'missing_preferred_agent',
          stepId: step.id.toString(),
          message: `${stepContext}: Manual strategy requires preferred_agent_id`
        });
      }
    }

    // Check capability matching
    if (step.required_capabilities && step.required_capabilities.length > 0) {
      const availableAgentsWithCapabilities = agents?.filter(agent => {
        const agentCaps = agent.capabilities as string[] || [];
        return step.required_capabilities!.some(required =>
          agentCaps.some(cap => cap.toLowerCase().includes(required.toLowerCase()))
        );
      }) || [];

      if (availableAgentsWithCapabilities.length === 0) {
        warnings.push({
          type: 'no_capable_agents',
          stepId: step.id.toString(),
          message: `${stepContext}: No active agents found with required capabilities`
        });
      }
    }
  }
}

/**
 * Validate workflow dependencies and flow
 */
async function validateDependencies(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.steps) return;

  // Check for circular dependencies
  if (hasCircularDependency(workflow)) {
    errors.push({
      type: 'circular_dependency',
      message: 'Workflow contains circular dependencies'
    });
  }

  // Check for unreachable steps
  const reachableSteps = findReachableSteps(workflow);
  const allStepIds = new Set(workflow.steps.map(s => s.id.toString()));

  for (const stepId of allStepIds) {
    if (!reachableSteps.has(stepId)) {
      warnings.push({
        type: 'unreachable_step',
        stepId,
        message: `Step is unreachable from workflow entry points`
      });
    }
  }

  // Check for dead ends (steps with no next steps and not marked as final)
  for (const step of workflow.steps) {
    const hasNextSteps = step.conditional_next && step.conditional_next.length > 0;
    const isInParallelBranch = workflow.parallel_branches?.some(branch =>
      branch.steps.includes(step.id.toString())
    );

    if (!hasNextSteps && !isInParallelBranch) {
      const isLastStep = step.step_number === Math.max(...workflow.steps.map(s => s.step_number));
      if (!isLastStep) {
        warnings.push({
          type: 'potential_dead_end',
          stepId: step.id.toString(),
          message: `Step ${step.step_number} has no next steps and may be a dead end`
        });
      }
    }
  }
}

/**
 * Validate success criteria
 */
async function validateSuccessCriteria(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.success_criteria) {
    warnings.push({
      type: 'missing_success_criteria',
      message: 'Workflow has no defined success criteria'
    });
    return;
  }

  const criteria = workflow.success_criteria;

  // Validate required outputs
  if (criteria.required_outputs && criteria.required_outputs.length > 0) {
    const allPossibleOutputs = new Set(
      workflow.steps?.flatMap(step =>
        Object.keys(step.output_schema?.properties || {})
      ) || []
    );

    for (const requiredOutput of criteria.required_outputs) {
      if (!allPossibleOutputs.has(requiredOutput)) {
        warnings.push({
          type: 'missing_required_output',
          message: `Required output '${requiredOutput}' is not produced by any step`
        });
      }
    }
  }

  // Validate quality thresholds
  if (criteria.quality_thresholds) {
    for (const [metric, threshold] of Object.entries(criteria.quality_thresholds)) {
      if (typeof threshold !== 'number' || threshold < 0 || threshold > 1) {
        errors.push({
          type: 'invalid_quality_threshold',
          message: `Quality threshold for '${metric}' must be a number between 0 and 1`
        });
      }
    }
  }
}

/**
 * Validate performance and resource constraints
 */
async function validatePerformanceConstraints(
  workflow: EnhancedWorkflowDefinition,
  errors: ValidationError[],
  warnings: ValidationWarning[]
): Promise<void> {
  if (!workflow.steps) return;

  const totalEstimatedDuration = workflow.steps.reduce(
    (sum, step) => sum + (step.estimated_duration || 0),
    0
  );

  // Warn about very long workflows
  if (totalEstimatedDuration > 480) { // 8 hours
    warnings.push({
      type: 'long_workflow',
      message: `Workflow estimated duration (${totalEstimatedDuration} minutes) exceeds 8 hours`
    });
  }

  // Check for too many parallel steps
  const maxParallelSteps = Math.max(
    ...workflow.parallel_branches?.map(branch => branch.steps.length) || [1]
  );

  if (maxParallelSteps > 5) {
    warnings.push({
      type: 'high_parallelism',
      message: `High parallel execution (${maxParallelSteps} steps) may impact performance`
    });
  }

  // Check for excessive retry configurations
  for (const step of workflow.steps) {
    if (step.retry_config && step.retry_config.max_retries > 5) {
      warnings.push({
        type: 'excessive_retries',
        stepId: step.id.toString(),
        message: `Step ${step.step_number} has high retry count (${step.retry_config.max_retries})`
      });
    }
  }

  // Estimate resource usage
  const agentRequirements = new Set(
    workflow.steps.map(step => step.agent_id).filter(Boolean)
  ).size;

  if (agentRequirements > 10) {
    warnings.push({
      type: 'high_agent_usage',
      message: `Workflow requires ${agentRequirements} different agents`
    });
  }
}

/**
 * Helper function to detect circular dependencies
 */
function hasCircularDependency(workflow: EnhancedWorkflowDefinition): boolean {
  if (!workflow.steps) return false;

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

  // Check all steps
  for (const step of workflow.steps) {
    if (dfs(step.id.toString())) {
      return true;
    }
  }

  return false;
}

/**
 * Helper function to find reachable steps
 */
function findReachableSteps(workflow: EnhancedWorkflowDefinition): Set<string> {
  if (!workflow.steps) return new Set();

  const reachable = new Set<string>();
  const visited = new Set<string>();

  // Find entry points (steps with no incoming edges)
  const hasIncoming = new Set<string>();
  for (const step of workflow.steps) {
    if (step.conditional_next) {
      for (const condition of step.conditional_next) {
        hasIncoming.add(condition.next_step_id);
      }
    }
  }

  const entryPoints = workflow.steps
    .filter(step => !hasIncoming.has(step.id.toString()))
    .map(step => step.id.toString());

  function dfs(stepId: string) {
    if (visited.has(stepId)) return;

    visited.add(stepId);
    reachable.add(stepId);

    const step = workflow.steps.find(s => s.id.toString() === stepId);
    if (step?.conditional_next) {
      for (const condition of step.conditional_next) {
        dfs(condition.next_step_id);
      }
    }
  }

  // Start DFS from all entry points
  for (const entryPoint of entryPoints) {
    dfs(entryPoint);
  }

  return reachable;
}
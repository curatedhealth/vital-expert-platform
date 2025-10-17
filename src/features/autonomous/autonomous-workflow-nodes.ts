import { BaseMessage, HumanMessage, AIMessage, SystemMessage } from '@langchain/core/messages';
import { ChatOpenAI } from '@langchain/openai';
import { AutonomousState } from './autonomous-state';
import { goalExtractor } from './goal-extractor';
import { taskGenerator } from './task-generator';
import { taskExecutor } from './task-executor';
import { safetyManager } from './safety-manager';

/**
 * Extract goal from user input
 */
export async function extractGoalNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('🎯 [ExtractGoal] Extracting goal from user input');
  
  const lastMessage = state.messages[state.messages.length - 1];
  if (!lastMessage || lastMessage._getType() !== 'human') {
    console.warn('⚠️ [ExtractGoal] No human message found');
    return {};
  }

  try {
    const userInput = lastMessage.content;
    const goalExtraction = await goalExtractor.extractGoal(userInput, {
      userId: state.userId,
      sessionId: state.sessionId
    });

    // Convert to Goal object
    const goal: typeof AutonomousState.State.goal = {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: goalExtraction.goal.description,
      successCriteria: goalExtraction.goal.successCriteria.map(sc => ({
        ...sc,
        id: sc.id || `criteria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      medicalContext: goalExtraction.goal.medicalContext,
      regulatoryRequirements: goalExtraction.goal.regulatoryRequirements,
      evidenceRequirements: goalExtraction.goal.evidenceRequirements,
      maxCost: goalExtraction.goal.maxCost || 50,
      deadline: goalExtraction.goal.deadline ? new Date(goalExtraction.goal.deadline) : undefined,
      createdAt: new Date(),
      status: 'active'
    };

    console.log('✅ [ExtractGoal] Goal extracted successfully:', {
      description: goal.description.substring(0, 100),
      criteriaCount: goal.successCriteria.length,
      complexity: goalExtraction.complexity.score
    });

    return {
      goal,
      currentStep: 'Goal extracted successfully',
      reasoningSteps: [{
        type: 'goal_extraction',
        description: `Extracted goal: ${goal.description}`,
        data: {
          complexity: goalExtraction.complexity,
          context: goalExtraction.context
        },
        timestamp: new Date()
      }]
    };
  } catch (error) {
    console.error('❌ [ExtractGoal] Goal extraction failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Goal extraction failed',
      currentStep: 'Goal extraction failed'
    };
  }
}

/**
 * Generate initial tasks from goal
 */
export async function generateTasksNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('📋 [GenerateTasks] Generating initial tasks');
  
  if (!state.goal) {
    console.warn('⚠️ [GenerateTasks] No goal available');
    return {};
  }

  try {
    const taskGeneration = await taskGenerator.generateInitialTasks(state.goal, {
      availableAgents: state.activeAgents?.map(a => a.name) || [],
      availableTools: getAvailableTools(),
      userPreferences: {}
    });

    // Convert to Task objects
    const tasks: typeof AutonomousState.State.taskQueue = taskGeneration.tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt)
    }));

    console.log('✅ [GenerateTasks] Tasks generated successfully:', {
      taskCount: tasks.length,
      strategy: taskGeneration.reasoning.strategy
    });

    return {
      taskQueue: tasks,
      currentStep: `Generated ${tasks.length} initial tasks`,
      reasoningSteps: [{
        type: 'task_generation',
        description: `Generated ${tasks.length} tasks using ${taskGeneration.reasoning.strategy} strategy`,
        data: {
          strategy: taskGeneration.reasoning.strategy,
          considerations: taskGeneration.reasoning.considerations,
          criticalPath: taskGeneration.reasoning.criticalPath
        },
        timestamp: new Date()
      }]
    };
  } catch (error) {
    console.error('❌ [GenerateTasks] Task generation failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Task generation failed',
      currentStep: 'Task generation failed'
    };
  }
}

/**
 * Select next task to execute
 */
export async function selectNextTaskNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('🎯 [SelectNextTask] Selecting next task');
  
  const pendingTasks = (state.taskQueue || []).filter(t => t.status === 'pending');
  
  if (pendingTasks.length === 0) {
    console.log('⚠️ [SelectNextTask] No pending tasks available');
    return {
      currentStep: 'No pending tasks available',
      requiresIntervention: true
    };
  }

  // Sort by priority and dependencies
  const sortedTasks = pendingTasks.sort((a, b) => {
    // First by priority (higher first)
    if (a.priority !== b.priority) {
      return b.priority - a.priority;
    }
    
    // Then by dependencies (tasks with no dependencies first)
    const aDeps = a.dependencies.length;
    const bDeps = b.dependencies.length;
    return aDeps - bDeps;
  });

  // Find first task with met dependencies
  for (const task of sortedTasks) {
    const dependenciesMet = task.dependencies.every(depId => 
      (state.completedTasks || []).some(ct => ct.id === depId && ct.status === 'completed')
    );
    
    if (dependenciesMet) {
      console.log('✅ [SelectNextTask] Selected task:', {
        id: task.id,
        description: task.description.substring(0, 100),
        priority: task.priority
      });

      return {
        currentTask: task,
        currentStep: `Selected task: ${task.description.substring(0, 50)}...`
      };
    }
  }

  console.log('⚠️ [SelectNextTask] No tasks with met dependencies');
  return {
    currentStep: 'No tasks with met dependencies',
    requiresIntervention: true
  };
}

/**
 * Execute the current task
 */
export async function executeTaskNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('🚀 [ExecuteTask] Executing current task');
  
  if (!state.currentTask) {
    console.warn('⚠️ [ExecuteTask] No current task to execute');
    return {};
  }

  // Check safety limits before execution
  const safetyCheck = safetyManager.canExecute(
    state.currentTask.description,
    state.currentTask.estimatedCost
  );

  if (!safetyCheck.allowed) {
    console.warn('⚠️ [ExecuteTask] Safety check failed:', safetyCheck.violations);
    return {
      error: `Safety check failed: ${safetyCheck.violations.map(v => v.message).join(', ')}`,
      currentStep: 'Task execution blocked by safety manager',
      requiresIntervention: true
    };
  }

  try {
    const taskResult = await taskExecutor.executeTask(state.currentTask, {
      goal: state.goal,
      workingMemory: state.workingMemory,
      previousResults: state.completedTasks?.map(ct => ct.result) || [],
      availableAgents: state.activeAgents,
      maxCost: state.goal?.maxCost,
      ragService: state.ragService
    });

    // Record safety metrics
    safetyManager.recordExecution({
      cost: taskResult.cost,
      apiCalls: taskResult.toolsUsed.length,
      duration: taskResult.duration / 1000 / 60 // Convert to minutes
    });

    if (taskResult.success) {
      // Mark task as completed
      const completedTask: typeof AutonomousState.State.completedTasks[0] = {
        ...state.currentTask,
        status: 'completed',
        result: taskResult.result,
        duration: taskResult.duration,
        cost: taskResult.cost,
        toolsUsed: taskResult.toolsUsed,
        executedBy: state.activeAgents?.[0]?.name || 'autonomous',
        success: true,
        confidence: taskResult.confidence
      };

      console.log('✅ [ExecuteTask] Task completed successfully:', {
        id: completedTask.id,
        duration: `${completedTask.duration}ms`,
        cost: `$${completedTask.cost}`,
        confidence: completedTask.confidence
      });

      return {
        completedTasks: [completedTask],
        taskQueue: (state.taskQueue || []).filter(t => t.id !== state.currentTask!.id),
        currentTask: null,
        totalCost: (state.totalCost || 0) + taskResult.cost,
        confidenceScore: calculateOverallConfidence(state, taskResult.confidence),
        evidenceChain: [...(state.evidenceChain || []), ...taskResult.evidence],
        currentStep: `Task completed: ${completedTask.description.substring(0, 50)}...`,
        reasoningSteps: [{
          type: 'task_execution',
          description: `Executed task: ${completedTask.description}`,
          data: {
            result: taskResult.result,
            toolsUsed: taskResult.toolsUsed,
            duration: taskResult.duration,
            cost: taskResult.cost,
            confidence: taskResult.confidence
          },
          timestamp: new Date()
        }]
      };
    } else {
      // Handle task failure
      const failedTask = {
        ...state.currentTask,
        status: 'failed' as const,
        retryCount: (state.currentTask.retryCount || 0) + 1,
        error: taskResult.error
      };

      console.log('❌ [ExecuteTask] Task failed:', {
        id: failedTask.id,
        error: taskResult.error,
        retryCount: failedTask.retryCount
      });

      if (failedTask.retryCount < (failedTask.maxRetries || 3)) {
        // Retry the task
        failedTask.status = 'pending';
        return {
          taskQueue: (state.taskQueue || []).map(t => 
            t.id === failedTask.id ? failedTask : t
          ),
          currentTask: null,
          currentStep: `Task failed, retrying (${failedTask.retryCount}/${failedTask.maxRetries})`,
          reasoningSteps: [{
            type: 'task_failure',
            description: `Task failed: ${taskResult.error}`,
            data: {
              error: taskResult.error,
              retryCount: failedTask.retryCount,
              maxRetries: failedTask.maxRetries
            },
            timestamp: new Date()
          }]
        };
      } else {
        // Task failed permanently
        return {
          taskQueue: (state.taskQueue || []).map(t => 
            t.id === failedTask.id ? failedTask : t
          ),
          currentTask: null,
          currentStep: `Task failed permanently: ${taskResult.error}`,
          reasoningSteps: [{
            type: 'task_failure_permanent',
            description: `Task failed permanently: ${taskResult.error}`,
            data: {
              error: taskResult.error,
              retryCount: failedTask.retryCount,
              maxRetries: failedTask.maxRetries
            },
            timestamp: new Date()
          }]
        };
      }
    }
  } catch (error) {
    console.error('❌ [ExecuteTask] Task execution failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Task execution failed',
      currentStep: 'Task execution failed',
      currentTask: null
    };
  }
}

/**
 * Reflect on task results and extract insights
 */
export async function reflectOnResultNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('🤔 [ReflectOnResult] Reflecting on task results');
  
  const lastCompletedTask = state.completedTasks?.[state.completedTasks.length - 1];
  if (!lastCompletedTask) {
    console.log('⚠️ [ReflectOnResult] No completed tasks to reflect on');
    return {};
  }

  try {
    // Extract insights from the completed task
    const insights = await extractInsightsFromTask(lastCompletedTask, state);
    
    // Update working memory
    const updatedWorkingMemory = {
      ...state.workingMemory,
      insights: [...(state.workingMemory?.insights || []), ...insights],
      lastUpdated: new Date()
    };

    console.log('✅ [ReflectOnResult] Insights extracted:', {
      taskId: lastCompletedTask.id,
      insightsCount: insights.length
    });

    return {
      workingMemory: updatedWorkingMemory,
      currentStep: `Reflected on task results, extracted ${insights.length} insights`,
      reasoningSteps: [{
        type: 'reflection',
        description: `Reflected on task: ${lastCompletedTask.description}`,
        data: {
          insights,
          taskResult: lastCompletedTask.result,
          confidence: lastCompletedTask.confidence
        },
        timestamp: new Date()
      }]
    };
  } catch (error) {
    console.error('❌ [ReflectOnResult] Reflection failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Reflection failed',
      currentStep: 'Reflection failed'
    };
  }
}

/**
 * Evaluate progress toward goal
 */
export async function evaluateProgressNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('📊 [EvaluateProgress] Evaluating progress toward goal');
  
  if (!state.goal) {
    console.warn('⚠️ [EvaluateProgress] No goal available');
    return {};
  }

  try {
    const progress = calculateProgress(state);
    const goalAchieved = await checkGoalAchievement(state);
    
    console.log('✅ [EvaluateProgress] Progress evaluated:', {
      progress: `${progress}%`,
      goalAchieved,
      completedTasks: state.completedTasks?.length || 0
    });

    return {
      progress,
      currentStep: `Progress: ${progress}% (${state.completedTasks?.length || 0} tasks completed)`,
      reasoningSteps: [{
        type: 'progress_evaluation',
        description: `Evaluated progress: ${progress}%`,
        data: {
          progress,
          goalAchieved,
          completedTasks: state.completedTasks?.length || 0,
          totalTasks: (state.taskQueue?.length || 0) + (state.completedTasks?.length || 0)
        },
        timestamp: new Date()
      }]
    };
  } catch (error) {
    console.error('❌ [EvaluateProgress] Progress evaluation failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Progress evaluation failed',
      currentStep: 'Progress evaluation failed'
    };
  }
}

/**
 * Generate new tasks based on current progress
 */
export async function generateNewTasksNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('🔄 [GenerateNewTasks] Generating new tasks based on progress');
  
  if (!state.goal) {
    console.warn('⚠️ [GenerateNewTasks] No goal available');
    return {};
  }

  try {
    const newTaskGeneration = await taskGenerator.generateFollowUpTasks(
      state.goal,
      state.completedTasks || [],
      state.taskQueue || [],
      {
        insights: state.workingMemory?.insights || []
      }
    );

    // Convert to Task objects
    const newTasks: typeof AutonomousState.State.taskQueue = newTaskGeneration.tasks.map(task => ({
      ...task,
      createdAt: new Date(task.createdAt)
    }));

    console.log('✅ [GenerateNewTasks] New tasks generated:', {
      taskCount: newTasks.length,
      strategy: newTaskGeneration.reasoning.strategy
    });

    return {
      taskQueue: [...(state.taskQueue || []), ...newTasks],
      currentStep: `Generated ${newTasks.length} new tasks`,
      reasoningSteps: [{
        type: 'new_task_generation',
        description: `Generated ${newTasks.length} new tasks using ${newTaskGeneration.reasoning.strategy} strategy`,
        data: {
          strategy: newTaskGeneration.reasoning.strategy,
          considerations: newTaskGeneration.reasoning.considerations,
          parallelOpportunities: newTaskGeneration.reasoning.parallelOpportunities
        },
        timestamp: new Date()
      }]
    };
  } catch (error) {
    console.error('❌ [GenerateNewTasks] New task generation failed:', error);
    return {
      error: error instanceof Error ? error.message : 'New task generation failed',
      currentStep: 'New task generation failed'
    };
  }
}

/**
 * Check if goal has been achieved
 */
export async function checkGoalAchievementNode(
  state: typeof AutonomousState.State
): Promise<Partial<typeof AutonomousState.State>> {
  console.log('🎯 [CheckGoalAchievement] Checking if goal has been achieved');
  
  if (!state.goal) {
    console.warn('⚠️ [CheckGoalAchievement] No goal available');
    return {};
  }

  try {
    const goalAchieved = await checkGoalAchievement(state);
    
    console.log('✅ [CheckGoalAchievement] Goal achievement checked:', {
      goalAchieved,
      completedTasks: state.completedTasks?.length || 0
    });

    return {
      shouldStop: goalAchieved,
      currentStep: goalAchieved ? 'Goal achieved!' : 'Goal not yet achieved',
      reasoningSteps: [{
        type: 'goal_achievement_check',
        description: goalAchieved ? 'Goal has been achieved' : 'Goal not yet achieved',
        data: {
          goalAchieved,
          completedTasks: state.completedTasks?.length || 0,
          successCriteria: state.goal.successCriteria
        },
        timestamp: new Date()
      }]
    };
  } catch (error) {
    console.error('❌ [CheckGoalAchievement] Goal achievement check failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Goal achievement check failed',
      currentStep: 'Goal achievement check failed'
    };
  }
}

// Helper functions

function getAvailableTools(): string[] {
  return [
    'fda_database_search',
    'fda_guidance_lookup',
    'fda_regulatory_calculator',
    'clinical_trials_search',
    'study_design',
    'endpoint_selection',
    'web_search',
    'wikipedia',
    'pubmed',
    'arxiv',
    'rag_query',
    'knowledge_search'
  ];
}

function calculateOverallConfidence(
  state: typeof AutonomousState.State,
  newConfidence: number
): number {
  const completedTasks = state.completedTasks || [];
  if (completedTasks.length === 0) return newConfidence;
  
  const totalConfidence = completedTasks.reduce((sum, task) => sum + task.confidence, 0) + newConfidence;
  return totalConfidence / (completedTasks.length + 1);
}

async function extractInsightsFromTask(
  task: typeof AutonomousState.State.completedTasks[0],
  state: typeof AutonomousState.State
): Promise<string[]> {
  const insights: string[] = [];
  
  // Basic insights from task completion
  insights.push(`Completed ${task.type} task: ${task.description.substring(0, 50)}...`);
  
  if (task.toolsUsed.length > 0) {
    insights.push(`Used tools: ${task.toolsUsed.join(', ')}`);
  }
  
  if (task.confidence > 0.8) {
    insights.push(`High confidence result (${(task.confidence * 100).toFixed(1)}%)`);
  }
  
  // Add task-specific insights
  if (task.result && typeof task.result === 'object') {
    if (task.result.sources && task.result.sources.length > 0) {
      insights.push(`Found ${task.result.sources.length} relevant sources`);
    }
    if (task.result.citations && task.result.citations.length > 0) {
      insights.push(`Generated ${task.result.citations.length} citations`);
    }
  }
  
  return insights;
}

function calculateProgress(state: typeof AutonomousState.State): number {
  const totalTasks = (state.taskQueue?.length || 0) + (state.completedTasks?.length || 0);
  const completedTasks = state.completedTasks?.length || 0;
  
  if (totalTasks === 0) return 0;
  return Math.round((completedTasks / totalTasks) * 100);
}

async function checkGoalAchievement(state: typeof AutonomousState.State): Promise<boolean> {
  if (!state.goal) return false;
  
  const completedTasks = state.completedTasks || [];
  
  // Simple check - in a real implementation, this would be more sophisticated
  const criteriaMet = state.goal.successCriteria.every(criteria => {
    return completedTasks.some(task => 
      task.description.toLowerCase().includes(criteria.description.toLowerCase()) &&
      task.success
    );
  });
  
  return criteriaMet;
}

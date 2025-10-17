import { EventEmitter } from 'events';
import { Goal, Task, CompletedTask, AutonomousState } from './autonomous-state';
import { goalExtractor, GoalExtractionResult } from './goal-extractor';
import { taskGenerator, TaskGenerationResult } from './task-generator';
import { taskExecutor, TaskExecutionResult, TaskExecutionContext } from './task-executor';
import { memoryManager } from './memory-manager';
import { evidenceVerifier } from './evidence-verifier';
import { createAutonomousVERIFYIntegration, AutonomousVERIFYIntegration, VERIFYValidationResult } from './verify-protocol-integration';

export interface AutonomousExecutionOptions {
  mode: 'manual' | 'automatic';
  agent?: any; // For manual mode
  maxIterations?: number;
  maxCost?: number;
  maxDuration?: number; // in minutes
  supervisionLevel?: 'none' | 'low' | 'medium' | 'high';
  userId?: string;
  sessionId?: string;
  ragService?: any; // Enhanced LangChain service
  availableAgents?: any[];
}

export interface AutonomousExecutionResult {
  success: boolean;
  goal: Goal;
  completedTasks: CompletedTask[];
  finalResult: any;
  evidence: any[];
  verificationProofs: any[];
  metrics: {
    totalIterations: number;
    totalCost: number;
    totalDuration: number;
    taskSuccessRate: number;
    goalAchievementRate: number;
  };
  insights: string[];
  error?: string;
}

export class AutonomousOrchestrator extends EventEmitter {
  private isRunning: boolean = false;
  private currentExecution: {
    goal: Goal;
    state: Partial<typeof AutonomousState.State>;
    options: AutonomousExecutionOptions;
  } | null = null;
  private verifyIntegration: AutonomousVERIFYIntegration;

  constructor() {
    super();
    this.verifyIntegration = createAutonomousVERIFYIntegration();
  }

  /**
   * Main entry point for autonomous execution
   */
  async execute(
    userInput: string,
    options: AutonomousExecutionOptions
  ): Promise<AutonomousExecutionResult> {
    console.log('🚀 [AutonomousOrchestrator] Starting autonomous execution');
    console.log(`📝 Input: "${userInput.substring(0, 100)}..."`);
    console.log(`🎯 Mode: ${options.mode}`);

    this.isRunning = true;
    this.emit('start', { userInput, options });

    try {
      // Step 1: Extract and validate goal
      const goalExtraction = await this.extractAndValidateGoal(userInput, options);
      const goal = this.convertToGoal(goalExtraction);
      
      this.emit('goal:extracted', goal);

      // Step 2: Initialize execution state
      const initialState = AutonomousStateManager.createInitialState(goal);
      this.currentExecution = {
        goal,
        state: initialState,
        options
      };

      // Step 3: Generate initial tasks
      const initialTasks = await this.generateInitialTasks(goal, options);
      this.currentExecution.state.taskQueue = initialTasks.tasks;
      
      this.emit('tasks:initial', initialTasks.tasks);

      // Step 4: Main execution loop
      const executionResult = await this.executeMainLoop(options);

      // Step 5: Generate final result
      const finalResult = await this.generateFinalResult(executionResult);

      this.emit('complete', finalResult);

      return finalResult;

    } catch (error) {
      console.error('❌ [AutonomousOrchestrator] Execution failed:', error);
      this.emit('error', error);
      
      return {
        success: false,
        goal: this.currentExecution?.goal || this.createFallbackGoal(userInput),
        completedTasks: [],
        finalResult: null,
        evidence: [],
        verificationProofs: [],
        metrics: {
          totalIterations: 0,
          totalCost: 0,
          totalDuration: 0,
          taskSuccessRate: 0,
          goalAchievementRate: 0
        },
        insights: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    } finally {
      this.isRunning = false;
      this.currentExecution = null;
    }
  }

  /**
   * Stream autonomous execution for real-time updates
   */
  async* streamExecution(
    userInput: string,
    options: AutonomousExecutionOptions
  ): AsyncGenerator<any, void, unknown> {
    console.log('🌊 [AutonomousOrchestrator] Starting streaming execution');

    try {
      // Step 1: Extract goal
      yield { type: 'step', step: 'goal_extraction', message: 'Extracting goal from input...' };
      
      const goalExtraction = await this.extractAndValidateGoal(userInput, options);
      const goal = this.convertToGoal(goalExtraction);
      
      yield { 
        type: 'goal', 
        goal,
        message: `Goal extracted: ${goal.description.substring(0, 100)}...`
      };

      // Step 2: Generate initial tasks
      yield { type: 'step', step: 'task_generation', message: 'Generating initial tasks...' };
      
      const initialTasks = await this.generateInitialTasks(goal, options);
      
      yield { 
        type: 'tasks', 
        tasks: initialTasks.tasks,
        message: `Generated ${initialTasks.tasks.length} initial tasks`
      };

      // Step 3: Initialize state
      const initialState = AutonomousStateManager.createInitialState(goal);
      initialState.taskQueue = initialTasks.tasks;
      
      this.currentExecution = {
        goal,
        state: initialState,
        options
      };

      // Step 4: Main execution loop with streaming
      let iteration = 0;
      const maxIterations = options.maxIterations || 50;

      while (iteration < maxIterations && this.isRunning) {
        iteration++;
        
        yield { 
          type: 'iteration', 
          iteration, 
          message: `Starting iteration ${iteration}/${maxIterations}`
        };

        // Check if goal is achieved
        const goalAchieved = await this.checkGoalAchievement(goal, initialState);
        if (goalAchieved) {
          yield { 
            type: 'goal_achieved', 
            message: 'Goal has been achieved!',
            completedTasks: initialState.completedTasks
          };
          break;
        }

        // Select next task
        const nextTask = this.selectNextTask(initialState);
        if (!nextTask) {
          // Generate new tasks if none available
          yield { type: 'step', step: 'generating_new_tasks', message: 'No tasks available, generating new ones...' };
          
          const newTasks = await this.generateFollowUpTasks(goal, initialState, options);
          initialState.taskQueue.push(...newTasks.tasks);
          
          yield { 
            type: 'new_tasks', 
            tasks: newTasks.tasks,
            message: `Generated ${newTasks.tasks.length} new tasks`
          };
          continue;
        }

        // Execute task
        yield { 
          type: 'task_start', 
          task: nextTask,
          message: `Executing task: ${nextTask.description.substring(0, 100)}...`
        };

        const taskResult = await this.executeTask(nextTask, initialState, options);
        
        if (taskResult.success) {
          // Mark task as completed
          const completedTask: CompletedTask = {
            ...nextTask,
            status: 'completed',
            result: taskResult.result,
            duration: taskResult.duration,
            cost: taskResult.cost,
            toolsUsed: taskResult.toolsUsed,
            executedBy: options.agent?.name || 'autonomous',
            success: true,
            confidence: taskResult.confidence
          };

          initialState.completedTasks.push(completedTask);
          initialState.taskQueue = initialState.taskQueue.filter(t => t.id !== nextTask.id);
          initialState.totalCost += taskResult.cost;
          initialState.confidenceScore = AutonomousStateManager.calculateConfidence(initialState);

          yield { 
            type: 'task_complete', 
            task: completedTask,
            message: `Task completed successfully (${taskResult.duration}ms, $${taskResult.cost})`
          };
        } else {
          // Handle task failure
          nextTask.status = 'failed';
          nextTask.retryCount++;
          nextTask.error = taskResult.error;

          if (nextTask.retryCount < nextTask.maxRetries) {
            nextTask.status = 'pending';
            yield { 
              type: 'task_retry', 
              task: nextTask,
              message: `Task failed, retrying (${nextTask.retryCount}/${nextTask.maxRetries})`
            };
          } else {
            yield { 
              type: 'task_failed', 
              task: nextTask,
              message: `Task failed permanently: ${taskResult.error}`
            };
          }
        }

        // Update progress
        initialState.progress = AutonomousStateManager.updateProgress(initialState);
        initialState.iteration = iteration;

        yield { 
          type: 'progress', 
          progress: initialState.progress,
          iteration,
          completedTasks: initialState.completedTasks.length,
          totalCost: initialState.totalCost,
          message: `Progress: ${Math.round(initialState.progress)}% (${initialState.completedTasks.length} tasks completed)`
        };

        // Check for intervention points
        if (options.supervisionLevel !== 'none') {
          const requiresIntervention = await this.checkInterventionPoints(initialState, options);
          if (requiresIntervention) {
            yield { 
              type: 'intervention_required', 
              message: 'Human intervention required',
              state: initialState
            };
            // In a real implementation, this would pause and wait for user input
          }
        }
      }

      // Step 5: Generate final result
      yield { type: 'step', step: 'finalizing', message: 'Generating final result...' };
      
      const finalResult = await this.generateFinalResult({
        goal,
        completedTasks: initialState.completedTasks,
        evidence: initialState.evidenceChain,
        verificationProofs: initialState.verificationProofs,
        totalIterations: initialState.iteration,
        totalCost: initialState.totalCost,
        totalDuration: 0 // Would be calculated from start time
      });

      yield { 
        type: 'complete', 
        result: finalResult,
        message: 'Autonomous execution completed successfully'
      };

    } catch (error) {
      console.error('❌ [AutonomousOrchestrator] Streaming execution failed:', error);
      yield { 
        type: 'error', 
        error: error instanceof Error ? error.message : 'Unknown error',
        message: 'Execution failed'
      };
    } finally {
      this.isRunning = false;
      this.currentExecution = null;
    }
  }

  /**
   * Stop current execution
   */
  stop(): void {
    console.log('🛑 [AutonomousOrchestrator] Stopping execution');
    this.isRunning = false;
    this.emit('stop');
  }

  /**
   * Pause current execution
   */
  pause(): void {
    console.log('⏸️ [AutonomousOrchestrator] Pausing execution');
    this.emit('pause');
  }

  /**
   * Resume paused execution
   */
  resume(): void {
    console.log('▶️ [AutonomousOrchestrator] Resuming execution');
    this.emit('resume');
  }

  /**
   * Get current execution status
   */
  getStatus(): {
    isRunning: boolean;
    currentGoal?: Goal;
    progress?: number;
    iteration?: number;
    completedTasks?: number;
    totalCost?: number;
  } {
    return {
      isRunning: this.isRunning,
      currentGoal: this.currentExecution?.goal,
      progress: this.currentExecution?.state.progress,
      iteration: this.currentExecution?.state.iteration,
      completedTasks: this.currentExecution?.state.completedTasks?.length,
      totalCost: this.currentExecution?.state.totalCost
    };
  }

  // Private methods

  private async extractAndValidateGoal(
    userInput: string,
    options: AutonomousExecutionOptions
  ): Promise<GoalExtractionResult> {
    const goalExtraction = await goalExtractor.extractGoal(userInput, {
      userId: options.userId,
      sessionId: options.sessionId
    });

    // Validate goal
    const validation = goalExtractor.validateGoal(goalExtraction);
    if (!validation.isValid) {
      console.warn('⚠️ [AutonomousOrchestrator] Goal validation issues:', validation.issues);
      
      // Refine goal if needed
      if (validation.issues.length > 0) {
        const refined = await goalExtractor.refineGoal(goalExtraction, validation);
        return refined;
      }
    }

    return goalExtraction;
  }

  private convertToGoal(extraction: GoalExtractionResult): Goal {
    return {
      id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      description: extraction.goal.description,
      successCriteria: extraction.goal.successCriteria.map(sc => ({
        ...sc,
        id: sc.id || `criteria_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      })),
      medicalContext: extraction.goal.medicalContext,
      regulatoryRequirements: extraction.goal.regulatoryRequirements,
      evidenceRequirements: extraction.goal.evidenceRequirements,
      maxCost: extraction.goal.maxCost || 50,
      deadline: extraction.goal.deadline ? new Date(extraction.goal.deadline) : undefined,
      createdAt: new Date(),
      status: 'active'
    };
  }

  private async generateInitialTasks(
    goal: Goal,
    options: AutonomousExecutionOptions
  ): Promise<TaskGenerationResult> {
    return await taskGenerator.generateInitialTasks(goal, {
      availableAgents: options.availableAgents,
      availableTools: this.getAvailableTools(),
      userPreferences: {}
    });
  }

  private async generateFollowUpTasks(
    goal: Goal,
    state: Partial<typeof AutonomousState.State>,
    options: AutonomousExecutionOptions
  ): Promise<TaskGenerationResult> {
    return await taskGenerator.generateFollowUpTasks(
      goal,
      state.completedTasks || [],
      state.taskQueue || [],
      {
        insights: state.workingMemory?.insights || []
      }
    );
  }

  private selectNextTask(state: Partial<typeof AutonomousState.State>): Task | null {
    const pendingTasks = (state.taskQueue || []).filter(t => t.status === 'pending');
    
    if (pendingTasks.length === 0) return null;

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
        return task;
      }
    }

    return null;
  }

  private async executeTask(
    task: Task,
    state: Partial<typeof AutonomousState.State>,
    options: AutonomousExecutionOptions
  ): Promise<TaskExecutionResult> {
    const context: TaskExecutionContext = {
      goal: state.goal,
      workingMemory: state.workingMemory,
      previousResults: state.completedTasks?.map(ct => ct.result) || [],
      availableAgents: options.availableAgents,
      maxCost: options.maxCost,
      ragService: options.ragService
    };

    return await taskExecutor.executeTask(task, context);
  }

  private async checkGoalAchievement(
    goal: Goal,
    state: Partial<typeof AutonomousState.State>
  ): Promise<boolean> {
    const completedTasks = state.completedTasks || [];
    
    // Check if all success criteria are met
    const criteriaMet = goal.successCriteria.every(criteria => {
      // Simple check - in a real implementation, this would be more sophisticated
      return completedTasks.some(task => 
        task.description.toLowerCase().includes(criteria.description.toLowerCase()) &&
        task.success
      );
    });

    return criteriaMet;
  }

  private async checkInterventionPoints(
    state: Partial<typeof AutonomousState.State>,
    options: AutonomousExecutionOptions
  ): Promise<boolean> {
    // Check various intervention conditions
    if (state.totalCost && options.maxCost && state.totalCost >= options.maxCost * 0.8) {
      return true; // Near cost limit
    }

    if (state.iteration && options.maxIterations && state.iteration >= options.maxIterations * 0.8) {
      return true; // Near iteration limit
    }

    // Check for high-priority tasks that might need human review
    const highPriorityTasks = (state.taskQueue || []).filter(t => t.priority >= 9);
    if (highPriorityTasks.length > 0 && options.supervisionLevel === 'high') {
      return true;
    }

    return false;
  }

  private async generateFinalResult(executionResult: any): Promise<AutonomousExecutionResult> {
    const { goal, completedTasks, evidence, verificationProofs, totalIterations, totalCost, totalDuration } = executionResult;

    console.log('🔍 [AutonomousOrchestrator] Generating final result with evidence verification and VERIFY protocol');

    // Apply VERIFY protocol validation
    const verifyValidation = await this.verifyIntegration.applyVERIFYProtocol(evidence, 'medical');
    console.log('🔬 [AutonomousOrchestrator] VERIFY protocol validation:', {
      isValid: verifyValidation.isValid,
      confidence: verifyValidation.confidence,
      quality: verifyValidation.evidenceQuality,
      requiresExpertReview: verifyValidation.requiresExpertReview
    });

    // Verify all evidence with enhanced verification
    const verifiedEvidence = evidence.map(ev => {
      const verification = evidenceVerifier.verifyEvidence(ev);
      return {
        ...ev,
        verificationStatus: verification.verified ? 'verified' : 'unverified',
        confidence: verification.confidence,
        verifyProtocolValid: verifyValidation.isValid
      };
    });

    // Generate evidence synthesis
    const evidenceSynthesis = evidenceVerifier.synthesizeEvidence(verifiedEvidence);

    // Generate reasoning proof
    const reasoningProof = evidenceVerifier.generateReasoningProof(completedTasks, goal);

    // Generate VERIFY protocol recommendations
    const verifyRecommendations = this.verifyIntegration.generateVERIFYRecommendations(verifyValidation);
    const verifySummary = this.verifyIntegration.createVERIFYSummary(verifyValidation);

    // Update memory with final results including VERIFY protocol
    const finalInsights = [
      `Goal completed: ${goal.description}`,
      `Tasks completed: ${completedTasks.length}`,
      `Evidence collected: ${verifiedEvidence.length}`,
      `Confidence: ${(evidenceSynthesis.confidence * 100).toFixed(1)}%`,
      `VERIFY Protocol: ${verifyValidation.isValid ? 'PASSED' : 'FAILED'}`,
      `Evidence Quality: ${verifyValidation.evidenceQuality.toUpperCase()}`,
      ...verifyRecommendations
    ];

    memoryManager.updateWorkingMemory({
      insights: finalInsights,
      facts: [
        `Goal achieved: ${goal.description}`,
        `VERIFY Protocol Status: ${verifySummary}`
      ]
    });

    // Calculate metrics
    const taskSuccessRate = completedTasks.length > 0 
      ? completedTasks.filter(t => t.success).length / completedTasks.length 
      : 0;

    const goalAchievementRate = goal.successCriteria.length > 0
      ? goal.successCriteria.filter(c => c.achieved).length / goal.successCriteria.length
      : 0;

    // Generate insights including VERIFY protocol results
    const insights = this.generateInsights(completedTasks, verifiedEvidence);
    insights.push(verifySummary);

    console.log('✅ [AutonomousOrchestrator] Final result generated with evidence verification');

    return {
      success: goalAchievementRate > 0.8, // 80% success threshold
      goal,
      completedTasks,
      finalResult: {
        summary: `Completed ${completedTasks.length} tasks to achieve goal: ${goal.description}`,
        insights,
        evidence: verifiedEvidence.length,
        verificationProofs: verificationProofs.length,
        evidenceSynthesis: evidenceSynthesis,
        reasoningProof: reasoningProof
      },
      evidence: verifiedEvidence,
      verificationProofs: [...verificationProofs, reasoningProof],
      metrics: {
        totalIterations,
        totalCost,
        totalDuration,
        taskSuccessRate,
        goalAchievementRate
      },
      insights
    };
  }

  private generateInsights(completedTasks: CompletedTask[], evidence: any[]): string[] {
    const insights: string[] = [];

    insights.push(`Successfully completed ${completedTasks.length} tasks`);
    insights.push(`Generated ${evidence.length} pieces of evidence`);
    
    const toolUsage = completedTasks.reduce((acc, task) => {
      task.toolsUsed.forEach(tool => {
        acc[tool] = (acc[tool] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const mostUsedTool = Object.entries(toolUsage).sort(([,a], [,b]) => b - a)[0];
    if (mostUsedTool) {
      insights.push(`Most used tool: ${mostUsedTool[0]} (${mostUsedTool[1]} times)`);
    }

    const avgConfidence = completedTasks.reduce((sum, task) => sum + task.confidence, 0) / completedTasks.length;
    insights.push(`Average task confidence: ${(avgConfidence * 100).toFixed(1)}%`);

    return insights;
  }

  private getAvailableTools(): string[] {
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

  private createFallbackGoal(userInput: string): Goal {
    return {
      id: `goal_fallback_${Date.now()}`,
      description: userInput,
      successCriteria: [{
        id: 'criteria_fallback',
        description: 'Complete the requested task',
        measurable: true,
        target: 'Task completion',
        achieved: false,
        evidence: []
      }],
      createdAt: new Date(),
      status: 'active'
    };
  }

  private async executeMainLoop(options: AutonomousExecutionOptions): Promise<any> {
    // This would contain the main execution loop logic
    // For now, return a placeholder
    return {
      goal: this.currentExecution?.goal,
      completedTasks: this.currentExecution?.state.completedTasks || [],
      evidence: this.currentExecution?.state.evidenceChain || [],
      verificationProofs: this.currentExecution?.state.verificationProofs || [],
      totalIterations: this.currentExecution?.state.iteration || 0,
      totalCost: this.currentExecution?.state.totalCost || 0,
      totalDuration: 0
    };
  }
}

// Export singleton instance
export const autonomousOrchestrator = new AutonomousOrchestrator();

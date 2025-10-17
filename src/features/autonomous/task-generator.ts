import { ChatOpenAI } from '@langchain/openai';
import { z } from 'zod';
import { Goal, Task, CompletedTask, MedicalContext, RegulatoryRequirement } from './autonomous-state';

// Schema for task generation
const TaskGenerationSchema = z.object({
  tasks: z.array(z.object({
    id: z.string(),
    description: z.string(),
    type: z.enum(['research', 'analysis', 'validation', 'synthesis', 'compliance_check', 'web_search', 'rag_query']),
    priority: z.number().min(1).max(10),
    status: z.enum(['pending', 'in_progress', 'completed', 'failed', 'cancelled']).default('pending'),
    assignedAgent: z.string().optional(),
    requiredTools: z.array(z.string()),
    requiredEvidence: z.array(z.string()).optional(),
    estimatedCost: z.number().min(0),
    dependencies: z.array(z.string()).default([]),
    retryCount: z.number().default(0),
    maxRetries: z.number().default(3),
    createdAt: z.string(),
    startedAt: z.string().optional(),
    completedAt: z.string().optional(),
    result: z.any().optional(),
    error: z.string().optional()
  })),
  reasoning: z.object({
    strategy: z.string().describe('Overall task generation strategy'),
    considerations: z.array(z.string()).describe('Key considerations in task planning'),
    dependencies: z.array(z.object({
      taskId: z.string(),
      dependsOn: z.array(z.string()),
      reason: z.string()
    })).describe('Task dependency relationships'),
    parallelOpportunities: z.array(z.string()).describe('Tasks that can be executed in parallel'),
    criticalPath: z.array(z.string()).describe('Critical path tasks that must be completed in sequence')
  })
});

export type TaskGenerationResult = z.infer<typeof TaskGenerationSchema>;

export class TaskGenerator {
  private llm: ChatOpenAI;
  private model: string;

  constructor(model: string = 'gpt-4-turbo-preview') {
    this.model = model;
    this.llm = new ChatOpenAI({
      modelName: model,
      temperature: 0.4, // Slightly higher for creative task generation
      maxTokens: 3000,
      streaming: false
    });
  }

  /**
   * Generate initial tasks from a goal
   */
  async generateInitialTasks(
    goal: Goal,
    context?: {
      availableAgents?: string[];
      availableTools?: string[];
      userPreferences?: any;
      previousTasks?: Task[];
    }
  ): Promise<TaskGenerationResult> {
    console.log('🎯 [TaskGenerator] Generating initial tasks for goal');
    console.log(`📝 Goal: "${goal.description.substring(0, 100)}..."`);

    try {
      const prompt = this.buildInitialTaskPrompt(goal, context);
      const response = await this.llm.invoke(prompt);
      const generated = await this.parseTaskResponse(response.content);
      
      console.log('✅ [TaskGenerator] Initial tasks generated:', {
        taskCount: generated.tasks.length,
        strategy: generated.reasoning.strategy,
        criticalPathLength: generated.reasoning.criticalPath.length
      });

      return generated;
    } catch (error) {
      console.error('❌ [TaskGenerator] Initial task generation failed:', error);
      throw new Error(`Failed to generate initial tasks: ${error.message}`);
    }
  }

  /**
   * Generate follow-up tasks based on completed tasks and results
   */
  async generateFollowUpTasks(
    goal: Goal,
    completedTasks: CompletedTask[],
    currentTasks: Task[],
    context?: {
      insights?: string[];
      newInformation?: any;
      userFeedback?: string;
    }
  ): Promise<TaskGenerationResult> {
    console.log('🔄 [TaskGenerator] Generating follow-up tasks');
    console.log(`📊 Completed: ${completedTasks.length}, Current: ${currentTasks.length}`);

    try {
      const prompt = this.buildFollowUpTaskPrompt(goal, completedTasks, currentTasks, context);
      const response = await this.llm.invoke(prompt);
      const generated = await this.parseTaskResponse(response.content);
      
      console.log('✅ [TaskGenerator] Follow-up tasks generated:', {
        taskCount: generated.tasks.length,
        strategy: generated.reasoning.strategy
      });

      return generated;
    } catch (error) {
      console.error('❌ [TaskGenerator] Follow-up task generation failed:', error);
      throw new Error(`Failed to generate follow-up tasks: ${error.message}`);
    }
  }

  /**
   * Optimize task sequence for efficiency and dependencies
   */
  optimizeTaskSequence(tasks: Task[]): Task[] {
    console.log('⚡ [TaskGenerator] Optimizing task sequence');
    
    // Create a copy to avoid mutating original
    const optimizedTasks = [...tasks];
    
    // Sort by priority first (higher priority first)
    optimizedTasks.sort((a, b) => b.priority - a.priority);
    
    // Then sort by dependencies (tasks with no dependencies first)
    optimizedTasks.sort((a, b) => {
      const aDeps = a.dependencies.length;
      const bDeps = b.dependencies.length;
      
      if (aDeps === 0 && bDeps > 0) return -1;
      if (aDeps > 0 && bDeps === 0) return 1;
      return 0;
    });
    
    // Identify parallel execution opportunities
    const parallelGroups: Task[][] = [];
    const processed = new Set<string>();
    
    for (const task of optimizedTasks) {
      if (processed.has(task.id)) continue;
      
      const parallelGroup = [task];
      processed.add(task.id);
      
      // Find tasks that can run in parallel with this one
      for (const otherTask of optimizedTasks) {
        if (processed.has(otherTask.id)) continue;
        if (otherTask.dependencies.includes(task.id)) continue;
        if (task.dependencies.includes(otherTask.id)) continue;
        
        // Check if they can run in parallel (no conflicting resources)
        if (this.canRunInParallel(task, otherTask)) {
          parallelGroup.push(otherTask);
          processed.add(otherTask.id);
        }
      }
      
      parallelGroups.push(parallelGroup);
    }
    
    console.log('✅ [TaskGenerator] Task sequence optimized:', {
      totalTasks: optimizedTasks.length,
      parallelGroups: parallelGroups.length,
      maxParallel: Math.max(...parallelGroups.map(g => g.length))
    });
    
    return optimizedTasks;
  }

  /**
   * Check if two tasks can run in parallel
   */
  private canRunInParallel(task1: Task, task2: Task): boolean {
    // Tasks can't run in parallel if they have conflicting dependencies
    if (task1.dependencies.some(dep => task2.dependencies.includes(dep))) {
      return false;
    }
    
    // Tasks can't run in parallel if they require the same exclusive resources
    const task1Tools = new Set(task1.requiredTools);
    const task2Tools = new Set(task2.requiredTools);
    const commonTools = [...task1Tools].filter(tool => task2Tools.has(tool));
    
    // If they share tools, check if those tools support parallel execution
    const exclusiveTools = ['fda_database', 'clinical_trials_database']; // Tools that don't support parallel access
    const hasExclusiveConflict = commonTools.some(tool => exclusiveTools.includes(tool));
    
    return !hasExclusiveConflict;
  }

  /**
   * Build prompt for initial task generation
   */
  private buildInitialTaskPrompt(goal: Goal, context?: any): string {
    return `You are an expert task planner for healthcare and life sciences. Generate a comprehensive set of tasks to achieve the given goal.

GOAL:
${goal.description}

SUCCESS CRITERIA:
${goal.successCriteria.map(c => `- ${c.description}`).join('\n')}

MEDICAL CONTEXT:
${goal.medicalContext ? JSON.stringify(goal.medicalContext, null, 2) : 'General medical context'}

REGULATORY REQUIREMENTS:
${goal.regulatoryRequirements ? goal.regulatoryRequirements.map(r => `- ${r.region}: ${r.complianceType}`).join('\n') : 'None specified'}

EVIDENCE REQUIREMENTS:
${goal.evidenceRequirements ? goal.evidenceRequirements.map(e => `- Level ${e.level}: ${e.minimumStudies} studies from ${e.sources.join(', ')}`).join('\n') : 'None specified'}

CONSTRAINTS:
- Max Cost: $${goal.maxCost || 50}
- Deadline: ${goal.deadline || 'No specific deadline'}

AVAILABLE RESOURCES:
${context?.availableAgents ? `Agents: ${context.availableAgents.join(', ')}` : 'All agents available'}
${context?.availableTools ? `Tools: ${context.availableTools.join(', ')}` : 'All tools available'}

TASK TYPES AVAILABLE:
- research: Literature search, data gathering, information collection
- analysis: Data analysis, statistical analysis, comparative analysis
- validation: Evidence verification, compliance checking, quality assurance
- synthesis: Information synthesis, report generation, conclusion drawing
- compliance_check: Regulatory compliance verification, guideline checking
- web_search: General web search, current information gathering
- rag_query: Knowledge base query, internal document search

PRIORITY LEVELS (1-10):
- 10: Critical path, blocking other tasks
- 8-9: High priority, important for goal achievement
- 6-7: Medium priority, supports goal achievement
- 4-5: Low priority, nice to have
- 1-3: Optional, can be skipped if needed

TASK GENERATION STRATEGY:
1. Start with foundational research tasks
2. Identify critical path tasks that must be completed first
3. Create parallel execution opportunities where possible
4. Include validation and compliance tasks for medical/regulatory goals
5. Plan for synthesis and reporting tasks
6. Consider cost and time constraints
7. Ensure all success criteria are addressed

Generate 5-15 tasks that will achieve this goal. For each task, provide:
- Clear, actionable description
- Appropriate type and priority
- Required tools and agents
- Dependencies on other tasks
- Realistic cost estimate
- Evidence requirements if applicable

Respond with JSON matching this structure:
{
  "tasks": [
    {
      "id": "task_1",
      "description": "Clear, actionable task description",
      "type": "research|analysis|validation|synthesis|compliance_check|web_search|rag_query",
      "priority": 8,
      "status": "pending",
      "assignedAgent": "agent_name_if_specific",
      "requiredTools": ["tool1", "tool2"],
      "requiredEvidence": ["evidence_type1", "evidence_type2"],
      "estimatedCost": 2.5,
      "dependencies": ["task_id_if_any"],
      "retryCount": 0,
      "maxRetries": 3,
      "createdAt": "2025-01-16T00:00:00Z"
    }
  ],
  "reasoning": {
    "strategy": "Overall approach to achieving the goal",
    "considerations": [
      "Key factor 1",
      "Key factor 2"
    ],
    "dependencies": [
      {
        "taskId": "task_1",
        "dependsOn": ["task_2"],
        "reason": "Why this dependency exists"
      }
    ],
    "parallelOpportunities": [
      "task_1 and task_3 can run in parallel",
      "task_5 and task_6 can run in parallel"
    ],
    "criticalPath": [
      "task_1",
      "task_2",
      "task_4"
    ]
  }
}`;
  }

  /**
   * Build prompt for follow-up task generation
   */
  private buildFollowUpTaskPrompt(
    goal: Goal,
    completedTasks: CompletedTask[],
    currentTasks: Task[],
    context?: any
  ): string {
    return `You are an expert task planner. Generate follow-up tasks based on completed work and current progress toward the goal.

ORIGINAL GOAL:
${goal.description}

SUCCESS CRITERIA:
${goal.successCriteria.map(c => `- ${c.description} (${c.achieved ? 'ACHIEVED' : 'PENDING'})`).join('\n')}

COMPLETED TASKS:
${completedTasks.map(t => `
- ${t.description} (${t.type})
  Result: ${JSON.stringify(t.result).substring(0, 200)}...
  Success: ${t.success}
  Confidence: ${t.confidence}
`).join('\n')}

CURRENT TASKS:
${currentTasks.map(t => `
- ${t.description} (${t.type}) - ${t.status}
  Priority: ${t.priority}
`).join('\n')}

INSIGHTS FROM COMPLETED WORK:
${context?.insights ? context.insights.map(i => `- ${i}`).join('\n') : 'No specific insights provided'}

NEW INFORMATION:
${context?.newInformation ? JSON.stringify(context.newInformation, null, 2) : 'No new information'}

USER FEEDBACK:
${context?.userFeedback || 'No user feedback'}

ANALYSIS REQUIRED:
1. What has been accomplished so far?
2. What success criteria have been met?
3. What gaps remain in achieving the goal?
4. What new information has been discovered that requires follow-up?
5. What tasks are still in progress and what do they need?
6. What new tasks are needed based on the results?

GENERATE FOLLOW-UP TASKS:
- Address any gaps in the original plan
- Build on successful completed tasks
- Investigate new information or insights
- Validate or verify important findings
- Synthesize information from multiple sources
- Complete any remaining success criteria

Focus on tasks that will:
1. Complete remaining success criteria
2. Validate important findings
3. Address new information discovered
4. Synthesize results into final deliverable
5. Ensure regulatory compliance if applicable

Generate 2-8 follow-up tasks. Use the same JSON structure as before.`;
  }

  /**
   * Parse LLM response into structured task data
   */
  private async parseTaskResponse(content: string): Promise<TaskGenerationResult> {
    try {
      // Extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const jsonStr = jsonMatch[0];
      const parsed = JSON.parse(jsonStr);
      
      // Validate against schema
      return TaskGenerationSchema.parse(parsed);
    } catch (error) {
      console.error('❌ [TaskGenerator] JSON parsing failed:', error);
      console.error('Raw content:', content);
      
      // Fallback: create basic tasks
      return this.createFallbackTasks();
    }
  }

  /**
   * Create fallback tasks if parsing fails
   */
  private createFallbackTasks(): TaskGenerationResult {
    console.log('⚠️ [TaskGenerator] Using fallback task structure');
    
    const now = new Date().toISOString();
    
    return {
      tasks: [
        {
          id: `task_${Date.now()}_1`,
          description: 'Research the topic using available tools',
          type: 'research',
          priority: 8,
          status: 'pending',
          requiredTools: ['web_search', 'rag_query'],
          estimatedCost: 2.0,
          dependencies: [],
          retryCount: 0,
          maxRetries: 3,
          createdAt: now
        },
        {
          id: `task_${Date.now()}_2`,
          description: 'Analyze the research findings',
          type: 'analysis',
          priority: 7,
          status: 'pending',
          requiredTools: ['rag_query'],
          estimatedCost: 1.5,
          dependencies: [`task_${Date.now()}_1`],
          retryCount: 0,
          maxRetries: 3,
          createdAt: now
        },
        {
          id: `task_${Date.now()}_3`,
          description: 'Synthesize findings into comprehensive response',
          type: 'synthesis',
          priority: 6,
          status: 'pending',
          requiredTools: [],
          estimatedCost: 1.0,
          dependencies: [`task_${Date.now()}_2`],
          retryCount: 0,
          maxRetries: 3,
          createdAt: now
        }
      ],
      reasoning: {
        strategy: 'Basic three-step approach: research, analyze, synthesize',
        considerations: ['Fallback strategy due to parsing error'],
        dependencies: [
          {
            taskId: `task_${Date.now()}_2`,
            dependsOn: [`task_${Date.now()}_1`],
            reason: 'Analysis requires research to be completed first'
          },
          {
            taskId: `task_${Date.now()}_3`,
            dependsOn: [`task_${Date.now()}_2`],
            reason: 'Synthesis requires analysis to be completed first'
          }
        ],
        parallelOpportunities: [],
        criticalPath: [`task_${Date.now()}_1`, `task_${Date.now()}_2`, `task_${Date.now()}_3`]
      }
    };
  }

  /**
   * Estimate task cost based on type and complexity
   */
  estimateTaskCost(task: Task, context?: {
    toolCosts?: Record<string, number>;
    agentCosts?: Record<string, number>;
  }): number {
    const baseCosts = {
      research: 1.5,
      analysis: 2.0,
      validation: 1.0,
      synthesis: 1.5,
      compliance_check: 2.5,
      web_search: 0.5,
      rag_query: 0.3
    };

    let cost = baseCosts[task.type] || 1.0;

    // Adjust for tools used
    if (context?.toolCosts) {
      const toolCost = task.requiredTools.reduce((sum, tool) => {
        return sum + (context.toolCosts![tool] || 0);
      }, 0);
      cost += toolCost;
    }

    // Adjust for agent used
    if (task.assignedAgent && context?.agentCosts) {
      cost += context.agentCosts[task.assignedAgent] || 0;
    }

    // Adjust for complexity (priority-based)
    const complexityMultiplier = 1 + (task.priority - 5) * 0.1;
    cost *= complexityMultiplier;

    return Math.round(cost * 100) / 100; // Round to 2 decimal places
  }

  /**
   * Validate task dependencies
   */
  validateTaskDependencies(tasks: Task[]): {
    valid: boolean;
    issues: string[];
    circularDependencies: string[][];
  } {
    const issues: string[] = [];
    const circularDependencies: string[][] = [];
    const taskIds = new Set(tasks.map(t => t.id));

    // Check for missing dependencies
    for (const task of tasks) {
      for (const depId of task.dependencies) {
        if (!taskIds.has(depId)) {
          issues.push(`Task ${task.id} depends on non-existent task ${depId}`);
        }
      }
    }

    // Check for circular dependencies
    const visited = new Set<string>();
    const recursionStack = new Set<string>();

    const hasCycle = (taskId: string, path: string[]): boolean => {
      if (recursionStack.has(taskId)) {
        circularDependencies.push([...path, taskId]);
        return true;
      }

      if (visited.has(taskId)) {
        return false;
      }

      visited.add(taskId);
      recursionStack.add(taskId);

      const task = tasks.find(t => t.id === taskId);
      if (task) {
        for (const depId of task.dependencies) {
          if (hasCycle(depId, [...path, taskId])) {
            return true;
          }
        }
      }

      recursionStack.delete(taskId);
      return false;
    };

    for (const task of tasks) {
      if (!visited.has(task.id)) {
        hasCycle(task.id, []);
      }
    }

    return {
      valid: issues.length === 0 && circularDependencies.length === 0,
      issues,
      circularDependencies
    };
  }

  /**
   * Generate task ID
   */
  private generateTaskId(): string {
    return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const taskGenerator = new TaskGenerator();

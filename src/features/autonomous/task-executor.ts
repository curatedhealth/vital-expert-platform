import { ChatOpenAI } from '@langchain/openai';
import { Task, CompletedTask, Evidence } from './autonomous-state';
import { goalExtractor } from './goal-extractor';
import { memoryManager } from './memory-manager';
import { evidenceVerifier } from './evidence-verifier';
import { ToolRegistry } from './tool-registry';

export interface TaskExecutionResult {
  success: boolean;
  result: any;
  evidence: Evidence[];
  cost: number;
  duration: number;
  toolsUsed: string[];
  confidence: number;
  error?: string;
  insights?: string[];
}

export interface TaskExecutionContext {
  goal?: any;
  workingMemory?: any;
  previousResults?: any[];
  availableAgents?: any[];
  maxCost?: number;
  ragService?: any; // Enhanced LangChain service for RAG
}

export class TaskExecutor {
  private llm: ChatOpenAI;
  private model: string;

  constructor(model: string = 'gpt-4-turbo-preview') {
    this.model = model;
    this.llm = new ChatOpenAI({
      modelName: model,
      temperature: 0.3, // Lower temperature for more consistent execution
      maxTokens: 2000,
      streaming: false
    });
    
    // Initialize tool registry if not already done
    if (!ToolRegistry.getAllToolNames().length) {
      ToolRegistry.initialize();
    }
  }

  /**
   * Execute a single task using appropriate tools and agents
   */
  async executeTask(
    task: Task,
    context: TaskExecutionContext = {}
  ): Promise<TaskExecutionResult> {
    console.log('🚀 [TaskExecutor] Executing task:', {
      id: task.id,
      description: task.description.substring(0, 100),
      type: task.type,
      priority: task.priority,
      requiredTools: task.requiredTools
    });

    const startTime = Date.now();
    let totalCost = 0;
    const toolsUsed: string[] = [];
    const evidence: Evidence[] = [];
    const insights: string[] = [];

    try {
      // Step 1: Determine execution strategy
      const strategy = await this.determineExecutionStrategy(task, context);
      console.log('📋 [TaskExecutor] Execution strategy:', strategy);

      // Step 2: Execute based on strategy
      let result: any;
      let confidence = 0.5;

      switch (strategy.type) {
        case 'tool_execution':
          result = await this.executeWithTools(task, strategy.tools, context);
          confidence = 0.8;
          break;
        
        case 'agent_execution':
          result = await this.executeWithAgent(task, strategy.agent, context);
          confidence = 0.9;
          break;
        
        case 'rag_execution':
          result = await this.executeWithRAG(task, context);
          confidence = 0.7;
          break;
        
        case 'hybrid_execution':
          result = await this.executeHybrid(task, strategy, context);
          confidence = 0.85;
          break;
        
        default:
          result = await this.executeGeneral(task, context);
          confidence = 0.6;
      }

      // Step 3: Generate evidence
      const taskEvidence = await this.generateEvidence(task, result, context);
      evidence.push(...taskEvidence);

      // Step 4: Extract insights
      const taskInsights = await this.extractInsights(task, result, context);
      insights.push(...taskInsights);

      // Step 5: Calculate final metrics
      const duration = Date.now() - startTime;
      const executionCost = this.calculateExecutionCost(task, toolsUsed, duration);

      console.log('✅ [TaskExecutor] Task completed successfully:', {
        duration: `${duration}ms`,
        cost: `$${executionCost}`,
        confidence,
        toolsUsed: toolsUsed.length,
        evidenceCount: evidence.length
      });

      return {
        success: true,
        result,
        evidence,
        cost: executionCost,
        duration,
        toolsUsed,
        confidence,
        insights
      };

    } catch (error) {
      console.error('❌ [TaskExecutor] Task execution failed:', error);
      
      const duration = Date.now() - startTime;
      const executionCost = this.calculateExecutionCost(task, toolsUsed, duration);

      return {
        success: false,
        result: null,
        evidence: [],
        cost: executionCost,
        duration,
        toolsUsed,
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
        insights: []
      };
    }
  }

  /**
   * Determine the best execution strategy for a task
   */
  private async determineExecutionStrategy(
    task: Task,
    context: TaskExecutionContext
  ): Promise<{
    type: 'tool_execution' | 'agent_execution' | 'rag_execution' | 'hybrid_execution' | 'general';
    tools?: string[];
    agent?: any;
    reasoning: string;
  }> {
    const prompt = `Determine the best execution strategy for this task.

TASK:
- Description: ${task.description}
- Type: ${task.type}
- Priority: ${task.priority}
- Required Tools: ${task.requiredTools.join(', ')}

AVAILABLE TOOLS: ${ToolRegistry.getAllToolNames().join(', ')}
AVAILABLE AGENTS: ${context.availableAgents?.map(a => a.name).join(', ') || 'None specified'}

EXECUTION STRATEGIES:
1. tool_execution: Use specific tools for data gathering/analysis
2. agent_execution: Use specialized agent for complex reasoning
3. rag_execution: Use RAG for knowledge base queries
4. hybrid_execution: Combine multiple approaches
5. general: Use general LLM reasoning

Consider:
- Task complexity and type
- Required tools availability
- Agent specialization
- Cost efficiency
- Quality requirements

Respond with JSON:
{
  "type": "tool_execution|agent_execution|rag_execution|hybrid_execution|general",
  "tools": ["tool1", "tool2"],
  "agent": "agent_name_if_applicable",
  "reasoning": "Why this strategy is best"
}`;

    try {
      const response = await this.llm.invoke(prompt);
      const strategy = JSON.parse(response.content);
      return strategy;
    } catch (error) {
      console.error('❌ [TaskExecutor] Strategy determination failed:', error);
      return {
        type: 'general',
        reasoning: 'Fallback to general execution due to strategy determination failure'
      };
    }
  }

  /**
   * Execute task using specific tools
   */
  private async executeWithTools(
    task: Task,
    tools: string[],
    context: TaskExecutionContext
  ): Promise<any> {
    console.log('🔧 [TaskExecutor] Executing with tools:', tools);

    const results: any[] = [];
    const toolsUsed: string[] = [];

    for (const toolName of tools) {
      const tool = ToolRegistry.getTool(toolName);
      
      if (!tool) {
        console.warn(`⚠️ [TaskExecutor] Tool not found: ${toolName}`);
        continue;
      }

      try {
        console.log(`🔧 [TaskExecutor] Using tool: ${toolName}`);
        
        // Prepare tool input based on task description
        const toolInput = this.prepareToolInput(task, toolName);
        
        // Execute tool
        const toolResult = await tool.invoke(toolInput);
        
        results.push({
          tool: toolName,
          input: toolInput,
          result: toolResult,
          timestamp: new Date()
        });
        
        toolsUsed.push(toolName);
        
      } catch (error) {
        console.error(`❌ [TaskExecutor] Tool execution failed: ${toolName}`, error);
        results.push({
          tool: toolName,
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date()
        });
      }
    }

    // Synthesize results
    return this.synthesizeToolResults(task, results, context);
  }

  /**
   * Execute task using a specific agent
   */
  private async executeWithAgent(
    task: Task,
    agent: any,
    context: TaskExecutionContext
  ): Promise<any> {
    console.log('🤖 [TaskExecutor] Executing with agent:', agent?.name || 'Unknown');

    // This would integrate with the existing agent system
    // For now, use LLM with agent-specific prompting
    const prompt = `You are ${agent?.name || 'a specialized AI agent'} with expertise in ${agent?.domain || 'general knowledge'}.

TASK: ${task.description}

CONTEXT:
${context.goal ? `Goal: ${context.goal.description}` : ''}
${context.workingMemory ? `Working Memory: ${JSON.stringify(context.workingMemory)}` : ''}

Please provide a comprehensive response to this task, drawing on your specialized knowledge and expertise.`;

    try {
      const response = await this.llm.invoke(prompt);
      return {
        agent: agent?.name || 'Unknown',
        response: response.content,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [TaskExecutor] Agent execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute task using RAG (Retrieval-Augmented Generation)
   */
  private async executeWithRAG(
    task: Task,
    context: TaskExecutionContext
  ): Promise<any> {
    console.log('🔍 [TaskExecutor] Executing with RAG');

    if (!context.ragService) {
      throw new Error('RAG service not available');
    }

    try {
      // Use the existing RAG service
      const ragResult = await context.ragService.queryWithChain(
        task.description,
        'general', // agent ID
        context.goal?.id || 'default',
        { name: 'RAG Agent' },
        'autonomous'
      );

      return {
        method: 'rag',
        query: task.description,
        answer: ragResult.answer,
        sources: ragResult.sources || [],
        citations: ragResult.citations || [],
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [TaskExecutor] RAG execution failed:', error);
      throw error;
    }
  }

  /**
   * Execute task using hybrid approach
   */
  private async executeHybrid(
    task: Task,
    strategy: any,
    context: TaskExecutionContext
  ): Promise<any> {
    console.log('🔄 [TaskExecutor] Executing with hybrid approach');

    const results: any[] = [];

    // Execute with tools if specified
    if (strategy.tools && strategy.tools.length > 0) {
      const toolResults = await this.executeWithTools(task, strategy.tools, context);
      results.push({ type: 'tools', data: toolResults });
    }

    // Execute with RAG if available
    if (context.ragService) {
      try {
        const ragResults = await this.executeWithRAG(task, context);
        results.push({ type: 'rag', data: ragResults });
      } catch (error) {
        console.warn('⚠️ [TaskExecutor] RAG execution failed in hybrid mode:', error);
      }
    }

    // Execute with agent if specified
    if (strategy.agent) {
      try {
        const agentResults = await this.executeWithAgent(task, strategy.agent, context);
        results.push({ type: 'agent', data: agentResults });
      } catch (error) {
        console.warn('⚠️ [TaskExecutor] Agent execution failed in hybrid mode:', error);
      }
    }

    // Synthesize all results
    return this.synthesizeHybridResults(task, results, context);
  }

  /**
   * Execute task using general LLM reasoning
   */
  private async executeGeneral(
    task: Task,
    context: TaskExecutionContext
  ): Promise<any> {
    console.log('🧠 [TaskExecutor] Executing with general reasoning');

    const prompt = `Please complete this task: ${task.description}

${context.goal ? `Goal: ${context.goal.description}` : ''}
${context.workingMemory ? `Context: ${JSON.stringify(context.workingMemory)}` : ''}

Provide a comprehensive, well-reasoned response.`;

    try {
      const response = await this.llm.invoke(prompt);
      return {
        method: 'general',
        response: response.content,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [TaskExecutor] General execution failed:', error);
      throw error;
    }
  }

  /**
   * Prepare tool input based on task description
   */
  private prepareToolInput(task: Task, toolName: string): any {
    // Extract relevant information from task description for tool input
    const baseInput = {
      query: task.description,
      // Add other common parameters based on tool type
    };

    // Customize input based on specific tool requirements
    switch (toolName) {
      case 'fda_database_search':
        return {
          query: task.description,
          searchType: this.extractFDASearchType(task.description),
          deviceClass: this.extractDeviceClass(task.description)
        };
      
      case 'clinical_trials_search':
        return {
          query: task.description,
          condition: this.extractCondition(task.description),
          intervention: this.extractIntervention(task.description)
        };
      
      case 'web_search':
        return {
          query: task.description
        };
      
      default:
        return baseInput;
    }
  }

  /**
   * Synthesize results from multiple tools
   */
  private async synthesizeToolResults(
    task: Task,
    results: any[],
    context: TaskExecutionContext
  ): Promise<any> {
    if (results.length === 1) {
      return results[0].result;
    }

    const prompt = `Synthesize the following tool results for the task: ${task.description}

TOOL RESULTS:
${results.map((r, i) => `
Tool ${i + 1} (${r.tool}):
${r.error ? `Error: ${r.error}` : JSON.stringify(r.result, null, 2)}
`).join('\n')}

Provide a comprehensive synthesis that combines all the information into a coherent response.`;

    try {
      const response = await this.llm.invoke(prompt);
      return {
        synthesis: response.content,
        toolResults: results,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [TaskExecutor] Tool synthesis failed:', error);
      return {
        synthesis: 'Failed to synthesize tool results',
        toolResults: results,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Synthesize results from hybrid execution
   */
  private async synthesizeHybridResults(
    task: Task,
    results: any[],
    context: TaskExecutionContext
  ): Promise<any> {
    const prompt = `Synthesize the following hybrid execution results for the task: ${task.description}

EXECUTION RESULTS:
${results.map((r, i) => `
${r.type.toUpperCase()}:
${JSON.stringify(r.data, null, 2)}
`).join('\n')}

Provide a comprehensive synthesis that combines all execution methods into a coherent, high-quality response.`;

    try {
      const response = await this.llm.invoke(prompt);
      return {
        synthesis: response.content,
        executionResults: results,
        timestamp: new Date()
      };
    } catch (error) {
      console.error('❌ [TaskExecutor] Hybrid synthesis failed:', error);
      return {
        synthesis: 'Failed to synthesize hybrid results',
        executionResults: results,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Generate evidence from task execution using EvidenceVerifier
   */
  private async generateEvidence(
    task: Task,
    result: any,
    context: TaskExecutionContext
  ): Promise<Evidence[]> {
    console.log('📋 [TaskExecutor] Generating evidence using EvidenceVerifier');
    
    // Use the evidence verifier to collect evidence
    const evidence = evidenceVerifier.collectEvidence(result, task);
    
    // Link evidence to goal if available
    if (context.goal?.id) {
      evidence.forEach(ev => {
        evidenceVerifier.linkEvidenceToGoal(ev, context.goal.id);
      });
    }

    // Update memory with new evidence
    if (evidence.length > 0) {
      const workingMemoryUpdate = {
        insights: evidence.map(ev => `Evidence collected: ${ev.type} from ${ev.source}`)
      };
      memoryManager.updateWorkingMemory(workingMemoryUpdate);
    }

    console.log('✅ [TaskExecutor] Generated', evidence.length, 'pieces of evidence');
    return evidence;
  }

  /**
   * Extract insights from task execution using MemoryManager
   */
  private async extractInsights(
    task: Task,
    result: any,
    context: TaskExecutionContext
  ): Promise<string[]> {
    console.log('🧠 [TaskExecutor] Extracting insights using MemoryManager');
    
    const insights: string[] = [];

    // Basic insight extraction
    if (result && typeof result === 'object') {
      if (result.synthesis) {
        insights.push(`Synthesized information from multiple sources`);
      }
      if (result.sources && result.sources.length > 0) {
        insights.push(`Found ${result.sources.length} relevant sources`);
      }
      if (result.citations && result.citations.length > 0) {
        insights.push(`Generated ${result.citations.length} citations`);
      }
    }

    // Add task-specific insights
    insights.push(`Completed ${task.type} task: ${task.description.substring(0, 50)}...`);

    // Record episode in memory
    const episode = {
      id: `episode_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      taskId: task.id,
      description: task.description,
      result: result,
      success: true,
      cost: this.calculateExecutionCost(task, [], 0),
      duration: 0, // Will be set by caller
      toolsUsed: task.requiredTools,
      timestamp: new Date()
    };

    memoryManager.recordEpisode(episode);

    // Record tool usage
    if (task.requiredTools.length > 0) {
      const toolCombo = {
        id: `tool_combo_${Date.now()}`,
        tools: task.requiredTools,
        taskType: task.type,
        successRate: 1.0, // Assume success for now
        avgCost: this.calculateExecutionCost(task, task.requiredTools, 0),
        avgDuration: 0, // Will be set by caller
        usageCount: 1,
        timestamp: new Date()
      };
      memoryManager.recordToolUse(toolCombo);
    }

    console.log('✅ [TaskExecutor] Extracted', insights.length, 'insights and recorded episode');
    return insights;
  }

  /**
   * Calculate execution cost
   */
  private calculateExecutionCost(
    task: Task,
    toolsUsed: string[],
    duration: number
  ): number {
    // Base cost for task execution
    let cost = 0.1;

    // Add cost for tools used
    const toolCosts: Record<string, number> = {
      'fda_database_search': 0.5,
      'clinical_trials_search': 0.3,
      'web_search': 0.2,
      'rag_query': 0.1,
      'pubmed': 0.2,
      'wikipedia': 0.1
    };

    for (const tool of toolsUsed) {
      cost += toolCosts[tool] || 0.1;
    }

    // Add cost based on duration (longer tasks cost more)
    cost += (duration / 60000) * 0.1; // $0.1 per minute

    return Math.round(cost * 100) / 100;
  }

  // Helper methods
  private extractFDASearchType(description: string): string {
    if (description.toLowerCase().includes('510k')) return '510k';
    if (description.toLowerCase().includes('pma')) return 'pma';
    if (description.toLowerCase().includes('guidance')) return 'guidance';
    return '510k'; // default
  }

  private extractDeviceClass(description: string): string {
    if (description.toLowerCase().includes('class iii')) return 'III';
    if (description.toLowerCase().includes('class ii')) return 'II';
    if (description.toLowerCase().includes('class i')) return 'I';
    return 'II'; // default
  }

  private extractCondition(description: string): string {
    // Extract medical condition from description
    const conditions = ['diabetes', 'cancer', 'heart disease', 'hypertension', 'depression'];
    for (const condition of conditions) {
      if (description.toLowerCase().includes(condition)) {
        return condition;
      }
    }
    return 'general';
  }

  private extractIntervention(description: string): string {
    // Extract intervention type from description
    const interventions = ['drug', 'device', 'therapy', 'surgery', 'treatment'];
    for (const intervention of interventions) {
      if (description.toLowerCase().includes(intervention)) {
        return intervention;
      }
    }
    return 'general';
  }

  private classifyEvidenceType(result: any): 'primary' | 'secondary' | 'expert_opinion' | 'clinical_data' | 'regulatory' | 'literature' {
    if (result && typeof result === 'object') {
      if (result.sources && result.sources.some((s: any) => s.includes('pubmed'))) {
        return 'literature';
      }
      if (result.sources && result.sources.some((s: any) => s.includes('fda'))) {
        return 'regulatory';
      }
      if (result.sources && result.sources.some((s: any) => s.includes('clinical'))) {
        return 'clinical_data';
      }
    }
    return 'secondary';
  }

  private calculateEvidenceConfidence(result: any): number {
    // Simple confidence calculation based on result quality
    if (!result) return 0;
    
    let confidence = 0.5; // base confidence
    
    if (result.sources && result.sources.length > 0) {
      confidence += 0.2;
    }
    if (result.citations && result.citations.length > 0) {
      confidence += 0.1;
    }
    if (result.synthesis && result.synthesis.length > 100) {
      confidence += 0.2;
    }
    
    return Math.min(1.0, confidence);
  }

  private generateHash(data: any): string {
    // Simple hash generation for evidence verification
    const crypto = require('crypto');
    return crypto.createHash('sha256')
      .update(JSON.stringify(data))
      .digest('hex')
      .substring(0, 16);
  }

  private extractCitations(result: any): string[] {
    if (result && result.citations) {
      return result.citations;
    }
    if (result && result.sources) {
      return result.sources.map((s: any, i: number) => `[${i + 1}]`);
    }
    return [];
  }
}

// Export singleton instance
export const taskExecutor = new TaskExecutor();

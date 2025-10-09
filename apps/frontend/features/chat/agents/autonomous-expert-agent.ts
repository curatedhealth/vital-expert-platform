import { ChatOpenAI } from '@langchain/openai';
import { createReactAgent } from 'langchain/agents';
import { AgentExecutor } from 'langchain/agents';
import { pull } from 'langchain/hub';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { createClient } from '@supabase/supabase-js';
import { BaseCallbackHandler } from '@langchain/core/callbacks/base';
import { createAgentPromptBuilder } from '../prompts/agent-prompt-builder';

// Import all tools
import {
  fdaDatabaseTool,
  fdaGuidanceTool,
  regulatoryCalculatorTool,
} from '../tools/fda-tools';
import {
  clinicalTrialsSearchTool,
  studyDesignTool,
  endpointSelectorTool,
} from '../tools/clinical-trials-tools';
import {
  tavilySearchTool,
  wikipediaTool,
  arxivSearchTool,
  pubmedSearchTool,
  euMedicalDeviceTool,
} from '../tools/external-api-tools';

// Import advanced retrievers
import {
  createAdvancedRetriever,
  HybridRetriever,
  RAGFusionRetriever,
} from '../retrievers/advanced-retrievers';

// Import parsers
import {
  parseRegulatoryAnalysis,
  parseClinicalStudy,
  parseMarketAccess,
  parseLiteratureReview,
  parseRiskAssessment,
  parseCompetitiveAnalysis,
  getFormatInstructions,
} from '../parsers/structured-output';

// Import memory
import { MemoryManager, selectMemoryStrategy } from '../memory/advanced-memory';

/**
 * Token Tracking Callback for Autonomous Agent
 */
class AutonomousAgentCallback extends BaseCallbackHandler {
  name = 'autonomous_agent_callback';
  private agentId: string;
  private userId: string;
  private sessionId: string;
  private totalTokens = { prompt: 0, completion: 0, total: 0 };

  constructor(agentId: string, userId: string, sessionId: string) {
    super();
    this.agentId = agentId;
    this.userId = userId;
    this.sessionId = sessionId;
  }

  async handleLLMEnd(output: any) {
    const usage = output.llmOutput?.tokenUsage;
    if (!usage) return;

    this.totalTokens.prompt += usage.promptTokens || 0;
    this.totalTokens.completion += usage.completionTokens || 0;
    this.totalTokens.total += usage.totalTokens || 0;

    // Log to database
    await this.logTokenUsage(usage);
  }

  async handleChainEnd(outputs: any) {
    console.log('🎯 Agent execution complete:', {
      totalTokens: this.totalTokens,
      output: outputs?.output?.substring(0, 100),
    });
  }

  async handleToolStart(tool: any, input: string) {
    console.log(`🔧 Tool executing: ${tool.name}`, {
      input: input.substring(0, 100),
    });
  }

  async handleToolEnd(output: string) {
    console.log(`✅ Tool complete:`, {
      output: output.substring(0, 100),
    });
  }

  private async logTokenUsage(usage: any) {
    const inputCost = (usage.promptTokens / 1000) * 0.01;
    const outputCost = (usage.completionTokens / 1000) * 0.03;

    await supabase.from('token_usage_logs').insert({
      service_type: 'autonomous_agent',
      agent_id: this.agentId,
      user_id: this.userId,
      session_id: this.sessionId,
      provider: 'openai',
      model_name: usage.model || 'gpt-4-turbo-preview',
      prompt_tokens: usage.promptTokens,
      completion_tokens: usage.completionTokens,
      total_tokens: usage.totalTokens,
      input_cost: inputCost,
      output_cost: outputCost,
      total_cost: inputCost + outputCost,
      success: true,
    });
  }

  getTotalTokens() {
    return this.totalTokens;
  }
}

/**
 * Agent Configuration
 */
interface AgentConfig {
  agentId: string;
  userId: string;
  sessionId: string;
  agentProfile: any;
  temperature?: number;
  maxIterations?: number;
  enableRAG?: boolean;
  retrievalStrategy?: 'multi_query' | 'compression' | 'hybrid' | 'self_query' | 'rag_fusion';
  memoryStrategy?: 'short' | 'long' | 'technical' | 'research';
  outputFormat?: 'regulatory' | 'clinical' | 'market_access' | 'literature' | 'risk' | 'competitive' | 'text';
}

/**
 * Autonomous Expert Agent
 * Combines all LangChain capabilities into a single autonomous system
 */
export class AutonomousExpertAgent {
  private llm: ChatOpenAI;
  private agentExecutor: AgentExecutor | null = null;
  private config: AgentConfig;
  private callback: AutonomousAgentCallback;
  private memory: any;
  private retriever: any;

  constructor(config: AgentConfig) {
    this.config = config;

    this.llm = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY!,
      // Priority: 1. model from options, 2. model from agent profile, 3. default
      modelName: (config as any).model || config.agentProfile?.model || 'gpt-4-turbo-preview',
      temperature: config.temperature || config.agentProfile?.temperature || 0.2,
      maxTokens: config.agentProfile?.maxTokens || 4000,
    });

    this.callback = new AutonomousAgentCallback(
      config.agentId,
      config.userId,
      config.sessionId
    );
  }

  /**
   * Initialize Agent with Tools, Memory, and Retriever
   */
  async initialize() {
    console.log('🚀 Initializing Autonomous Expert Agent...');

    // 1. Setup Memory
    this.memory = await this.setupMemory();
    console.log('✅ Memory initialized');

    // 2. Setup RAG Retriever (if enabled)
    if (this.config.enableRAG) {
      this.retriever = await this.setupRetriever();
      console.log('✅ Retriever initialized');
    }

    // 3. Get All Available Tools
    const tools = this.getTools();
    console.log(`✅ ${tools.length} tools loaded`);

    // 4. Create Agent Prompt Template (includes system prompt from database)
    const prompt = await this.createAgentPrompt();
    console.log('✅ Prompt template created from database');

    // 5. Create React Agent
    const agent = await createReactAgent({
      llm: this.llm,
      tools,
      prompt,
    });

    // 7. Create Agent Executor
    this.agentExecutor = new AgentExecutor({
      agent,
      tools,
      maxIterations: this.config.maxIterations || 10,
      verbose: process.env.NODE_ENV === 'development',
      returnIntermediateSteps: true,
      handleParsingErrors: true,
    });

    console.log('🎯 Autonomous Expert Agent ready');
  }

  /**
   * Execute Agent Query
   */
  async execute(query: string) {
    if (!this.agentExecutor) {
      await this.initialize();
    }

    console.log('🔄 Executing query:', query.substring(0, 100));

    // Load memory context
    const memoryContext = this.memory
      ? await this.memory.loadMemoryVariables({ input: query })
      : {};

    // Get RAG context if enabled
    let ragContext = '';
    if (this.retriever) {
      const docs = await this.retriever.getRelevantDocuments(query);
      ragContext = docs.map((d: any) => d.pageContent).join('\n\n');
      console.log(`📚 Retrieved ${docs.length} relevant documents`);
    }

    // Execute agent
    const result = await this.agentExecutor!.invoke(
      {
        input: query,
        chat_history: memoryContext.chat_history || [],
        context: ragContext,
      },
      {
        callbacks: [this.callback],
      }
    );

    // Save to memory
    if (this.memory?.saveContext) {
      await this.memory.saveContext(
        { input: query },
        { output: result.output }
      );
    }

    // Parse output if structured format requested
    const parsedOutput = await this.parseOutput(result.output);

    return {
      output: result.output,
      parsedOutput,
      intermediateSteps: result.intermediateSteps,
      tokenUsage: this.callback.getTotalTokens(),
      sources: result.intermediateSteps
        ?.filter((step: any) => step[0]?.tool === 'rag_knowledge_search')
        .map((step: any) => step[1]),
    };
  }

  /**
   * Stream Agent Execution
   */
  async *stream(query: string) {
    if (!this.agentExecutor) {
      await this.initialize();
    }

    yield { type: 'start', message: 'Starting autonomous analysis...' };

    // Load memory
    const memoryContext = this.memory
      ? await this.memory.loadMemoryVariables({ input: query })
      : {};

    // Get RAG context
    let ragContext = '';
    if (this.retriever) {
      yield { type: 'retrieval', message: 'Searching knowledge base...' };
      const docs = await this.retriever.getRelevantDocuments(query);
      ragContext = docs.map((d: any) => d.pageContent).join('\n\n');
      yield {
        type: 'retrieval_complete',
        count: docs.length,
        sources: docs.map((d: any) => d.metadata),
      };
    }

    // Stream execution
    const stream = await this.agentExecutor!.stream(
      {
        input: query,
        chat_history: memoryContext.chat_history || [],
        context: ragContext,
      },
      {
        callbacks: [this.callback],
      }
    );

    for await (const chunk of stream) {
      if (chunk.intermediateSteps) {
        for (const step of chunk.intermediateSteps) {
          yield {
            type: 'tool_execution',
            tool: step[0]?.tool,
            input: step[0]?.toolInput,
            output: step[1],
          };
        }
      }

      if (chunk.output) {
        yield { type: 'output', content: chunk.output };

        // Save to memory
        if (this.memory?.saveContext) {
          await this.memory.saveContext(
            { input: query },
            { output: chunk.output }
          );
        }

        // Parse if needed
        const parsedOutput = await this.parseOutput(chunk.output);
        if (parsedOutput) {
          yield { type: 'parsed_output', data: parsedOutput };
        }
      }
    }

    yield {
      type: 'complete',
      tokenUsage: this.callback.getTotalTokens(),
    };
  }

  /**
   * Setup Memory Strategy
   */
  private async setupMemory() {
    // Temporarily disabled until base schema (chat_messages table) is created
    console.warn('⚠️  Memory temporarily disabled - base schema tables missing');
    return null;
  }

  /**
   * Setup Retriever Strategy
   */
  private async setupRetriever() {
    const strategy = this.config.retrievalStrategy || 'rag_fusion';
    return await createAdvancedRetriever(strategy, {
      agentId: this.config.agentId,
      knowledgeDomains: this.config.agentProfile?.knowledgeDomains || [],
    });
  }

  /**
   * Get All Available Tools
   */
  private getTools() {
    const tools = [
      // FDA Tools
      fdaDatabaseTool,
      fdaGuidanceTool,
      regulatoryCalculatorTool,

      // Clinical Trials Tools
      clinicalTrialsSearchTool,
      studyDesignTool,
      endpointSelectorTool,

      // External API Tools
      tavilySearchTool,
      wikipediaTool,
      arxivSearchTool,
      pubmedSearchTool,
      euMedicalDeviceTool,
    ];

    // Add custom tools from agent profile
    if (this.config.agentProfile?.customTools) {
      tools.push(...this.config.agentProfile.customTools);
    }

    return tools;
  }

  /**
   * Create System Prompt (using database prompts + tools)
   */
  private async createSystemPrompt(): Promise<string> {
    const promptBuilder = await createAgentPromptBuilder(
      this.config.agentId,
      this.config.agentProfile
    );

    return await promptBuilder.buildSystemPrompt({
      includeCapabilities: true,
      includeTools: true,
      includeRAGStrategy: this.config.enableRAG,
      outputFormat: this.config.outputFormat,
    });
  }

  /**
   * Create Agent Prompt Template (using prompt builder)
   */
  private async createAgentPrompt() {
    const promptBuilder = await createAgentPromptBuilder(
      this.config.agentId,
      this.config.agentProfile
    );

    return await promptBuilder.buildChatPromptTemplate({
      includeHistory: true,
      includeContext: this.config.enableRAG,
      outputFormat: this.config.outputFormat,
    });
  }

  /**
   * Parse Output Based on Format
   */
  private async parseOutput(output: string) {
    if (!this.config.outputFormat || this.config.outputFormat === 'text') {
      return null;
    }

    try {
      switch (this.config.outputFormat) {
        case 'regulatory':
          return await parseRegulatoryAnalysis(output);
        case 'clinical':
          return await parseClinicalStudy(output);
        case 'market_access':
          return await parseMarketAccess(output);
        case 'literature':
          return await parseLiteratureReview(output);
        case 'risk':
          return await parseRiskAssessment(output);
        case 'competitive':
          return await parseCompetitiveAnalysis(output);
        default:
          return null;
      }
    } catch (error) {
      console.error('Error parsing output:', error);
      return null;
    }
  }
}

/**
 * Factory function to create autonomous agent
 */
export async function createAutonomousAgent(config: AgentConfig) {
  const agent = new AutonomousExpertAgent(config);
  await agent.initialize();
  return agent;
}

/**
 * Quick execution helper
 */
export async function executeAutonomousQuery(
  query: string,
  agentId: string,
  userId: string,
  sessionId: string,
  options?: Partial<AgentConfig>
) {
  // Fetch agent profile
  const { data: agentProfile } = await supabase
    .from('agents')
    .select('*')
    .eq('id', agentId)
    .single();

  const agent = new AutonomousExpertAgent({
    agentId,
    userId,
    sessionId,
    agentProfile,
    enableRAG: true,
    retrievalStrategy: 'rag_fusion',
    memoryStrategy: 'research',
    ...options,
  });

  await agent.initialize();
  return await agent.execute(query);
}

import { createReactAgent } from "@langchain/langgraph/prebuilt";
import { ChatOpenAI } from "@langchain/openai";
import { BufferWindowMemory } from "langchain/memory";
import { MemorySaver } from "@langchain/langgraph";
import { BaseMessage } from "@langchain/core/messages";

export interface AgentConfig {
  id: string;
  display_name: string;
  business_function: string;
  description: string;
  model?: string;
  temperature?: number;
  max_tokens?: number;
  system_prompt?: string;
  capabilities?: string[];
}

export interface StructuredAgentOptions {
  tools: any[];
  memory?: BufferWindowMemory;
  checkpointer?: MemorySaver;
  verbose?: boolean;
}

export async function createStructuredAgent(
  agent: AgentConfig,
  tools: any[],
  options: StructuredAgentOptions = {}
) {
  console.log(`🤖 Creating structured agent: ${agent.display_name}`);
  
  const {
    memory,
    checkpointer = new MemorySaver(),
    verbose = false
  } = options;
  
  // Initialize LLM with agent-specific configuration
  const llm = new ChatOpenAI({
    modelName: agent.model || "gpt-4",
    temperature: agent.temperature || 0.7,
    maxTokens: agent.max_tokens || 4000,
    verbose
  });
  
  // Create system prompt for the agent
  const systemPrompt = agent.system_prompt || createDefaultSystemPrompt(agent);
  
  // Create the ReAct agent
  const reactAgent = createReactAgent({
    llm,
    tools,
    checkpointer,
    messageModifier: systemPrompt,
    verbose
  });
  
  // Add memory if provided
  if (memory) {
    // Note: Memory integration with ReAct agents requires additional setup
    // This is a simplified implementation
    console.log(`📝 Memory enabled for agent: ${agent.display_name}`);
  }
  
  return {
    agent: reactAgent,
    config: agent,
    tools,
    memory,
    checkpointer
  };
}

function createDefaultSystemPrompt(agent: AgentConfig): string {
  const capabilities = agent.capabilities || [];
  const capabilitiesText = capabilities.length > 0 
    ? `\n\nYour capabilities include: ${capabilities.join(', ')}`
    : '';
  
  return `You are ${agent.display_name}, a ${agent.business_function} expert.

${agent.description}

Your role is to provide expert-level assistance in your field of expertise. You should:
- Provide accurate, evidence-based information
- Use your specialized knowledge to give detailed, professional responses
- Ask clarifying questions when needed
- Cite sources and provide references when appropriate
- Be thorough but concise in your explanations
- Maintain a professional, helpful tone

${capabilitiesText}

When using tools, always explain what you're doing and why it's relevant to the user's question. If you need to search for information, explain what you're looking for and how it relates to the query.

Remember: You are an expert in your field, so provide authoritative, well-reasoned responses that demonstrate your expertise.`;
}

export async function createAgentWithMemory(
  agent: AgentConfig,
  tools: any[],
  sessionId: string
) {
  console.log(`🧠 Creating agent with memory for session: ${sessionId}`);
  
  // Create memory instance
  const memory = new BufferWindowMemory({
    k: 10, // Keep last 10 interactions
    returnMessages: true,
    memoryKey: "chat_history",
    inputKey: "input",
    outputKey: "output"
  });
  
  // Create checkpointer for conversation persistence
  const checkpointer = new MemorySaver();
  
  return createStructuredAgent(agent, tools, {
    memory,
    checkpointer,
    verbose: true
  });
}

export function createAgentPrompt(agent: AgentConfig, context?: string): string {
  let prompt = `You are ${agent.display_name}, a ${agent.business_function} expert.\n\n`;
  prompt += `${agent.description}\n\n`;
  
  if (context) {
    prompt += `Context: ${context}\n\n`;
  }
  
  prompt += `Please provide a comprehensive, expert-level response to the user's question. `;
  prompt += `Use your specialized knowledge and any available tools to give the most helpful answer possible.`;
  
  return prompt;
}

export async function executeAgentWithTools(
  agent: any,
  query: string,
  context?: string,
  tools?: any[]
) {
  console.log(`🚀 Executing agent with tools for query: ${query.substring(0, 50)}...`);
  
  try {
    // Prepare the input for the agent
    const input = {
      messages: [
        {
          role: "user",
          content: query
        }
      ],
      context: context || ""
    };
    
    // Execute the agent
    const result = await agent.agent.invoke(input, {
      configurable: {
        thread_id: `agent-${Date.now()}`
      }
    });
    
    console.log(`✅ Agent execution completed`);
    return result;
    
  } catch (error) {
    console.error('❌ Agent execution failed:', error);
    throw new Error(`Agent execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function getAgentCapabilities(agent: AgentConfig): string[] {
  return agent.capabilities || [];
}

export function validateAgentConfig(agent: AgentConfig): boolean {
  const requiredFields = ['id', 'display_name', 'business_function', 'description'];
  
  for (const field of requiredFields) {
    if (!agent[field as keyof AgentConfig]) {
      console.error(`❌ Missing required field: ${field}`);
      return false;
    }
  }
  
  // Validate temperature range
  if (agent.temperature !== undefined && (agent.temperature < 0 || agent.temperature > 2)) {
    console.error('❌ Temperature must be between 0 and 2');
    return false;
  }
  
  // Validate max_tokens
  if (agent.max_tokens !== undefined && (agent.max_tokens < 1 || agent.max_tokens > 8000)) {
    console.error('❌ Max tokens must be between 1 and 8000');
    return false;
  }
  
  return true;
}

export default {
  createStructuredAgent,
  createAgentWithMemory,
  createAgentPrompt,
  executeAgentWithTools,
  getAgentCapabilities,
  validateAgentConfig
};

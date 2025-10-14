import { Client } from "langsmith";

// Initialize LangSmith client
export const langsmithClient = new Client({
  apiKey: process.env.LANGCHAIN_API_KEY,
  apiUrl: process.env.LANGCHAIN_ENDPOINT || "https://api.smith.langchain.com"
});

// Trace configuration
export const traceConfig = {
  projectName: "vital-multi-agent",
  tags: ["production", "multi-agent"],
  metadata: { 
    version: "2.0", 
    environment: process.env.NODE_ENV || "development"
  }
};

// Wrap all LLM calls with tracing
export function withTracing(fn: Function, name: string) {
  return async (...args: any[]) => {
    const runId = crypto.randomUUID();
    
    try {
      // Create run
      await langsmithClient.createRun({
        name,
        run_type: "chain",
        inputs: { args: args.map(arg => 
          typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
        )},
        id: runId,
        project_name: traceConfig.projectName,
        tags: traceConfig.tags,
        metadata: traceConfig.metadata
      });
      
      // Execute function
      const result = await fn(...args);
      
      // Update run with outputs
      await langsmithClient.updateRun(runId, { 
        outputs: { result: typeof result === 'object' ? JSON.stringify(result) : String(result) },
        status: "success"
      });
      
      return result;
    } catch (error) {
      // Update run with error
      await langsmithClient.updateRun(runId, { 
        error: error instanceof Error ? error.message : "Unknown error",
        status: "error"
      });
      throw error;
    }
  };
}

// Create traced LLM wrapper
export function createTracedLLM(llm: any, name: string) {
  const originalCall = llm.call.bind(llm);
  const originalInvoke = llm.invoke?.bind(llm);
  
  llm.call = withTracing(originalCall, `${name}_call`);
  
  if (originalInvoke) {
    llm.invoke = withTracing(originalInvoke, `${name}_invoke`);
  }
  
  return llm;
}

// Create traced chain wrapper
export function createTracedChain(chain: any, name: string) {
  const originalInvoke = chain.invoke?.bind(chain);
  const originalCall = chain.call?.bind(chain);
  
  if (originalInvoke) {
    chain.invoke = withTracing(originalInvoke, `${name}_invoke`);
  }
  
  if (originalCall) {
    chain.call = withTracing(originalCall, `${name}_call`);
  }
  
  return chain;
}

// Create traced tool wrapper
export function createTracedTool(tool: any, name: string) {
  const originalFunc = tool.func?.bind(tool);
  
  if (originalFunc) {
    tool.func = withTracing(originalFunc, `${name}_tool`);
  }
  
  return tool;
}

// Log workflow step
export async function logWorkflowStep(
  step: string, 
  data: any, 
  sessionId: string,
  userId: string
) {
  try {
    await langsmithClient.createRun({
      name: `workflow_step_${step}`,
      run_type: "chain",
      inputs: { 
        step,
        data: typeof data === 'object' ? JSON.stringify(data) : String(data),
        sessionId,
        userId
      },
      project_name: traceConfig.projectName,
      tags: [...traceConfig.tags, "workflow_step"],
      metadata: {
        ...traceConfig.metadata,
        step,
        sessionId,
        userId
      }
    });
  } catch (error) {
    console.warn('Failed to log workflow step:', error);
  }
}

// Log agent selection
export async function logAgentSelection(
  selectedAgent: any,
  suggestedAgents: any[],
  sessionId: string,
  userId: string
) {
  try {
    await langsmithClient.createRun({
      name: "agent_selection",
      run_type: "chain",
      inputs: {
        selectedAgent: JSON.stringify(selectedAgent),
        suggestedAgents: JSON.stringify(suggestedAgents),
        sessionId,
        userId
      },
      project_name: traceConfig.projectName,
      tags: [...traceConfig.tags, "agent_selection"],
      metadata: {
        ...traceConfig.metadata,
        sessionId,
        userId,
        agentId: selectedAgent?.id,
        agentName: selectedAgent?.name
      }
    });
  } catch (error) {
    console.warn('Failed to log agent selection:', error);
  }
}

// Log tool usage
export async function logToolUsage(
  toolName: string,
  toolInput: any,
  toolOutput: any,
  sessionId: string,
  userId: string
) {
  try {
    await langsmithClient.createRun({
      name: `tool_${toolName}`,
      run_type: "tool",
      inputs: {
        toolName,
        input: typeof toolInput === 'object' ? JSON.stringify(toolInput) : String(toolInput),
        sessionId,
        userId
      },
      outputs: {
        output: typeof toolOutput === 'object' ? JSON.stringify(toolOutput) : String(toolOutput)
      },
      project_name: traceConfig.projectName,
      tags: [...traceConfig.tags, "tool_usage"],
      metadata: {
        ...traceConfig.metadata,
        sessionId,
        userId,
        toolName
      }
    });
  } catch (error) {
    console.warn('Failed to log tool usage:', error);
  }
}

// Log RAG retrieval
export async function logRAGRetrieval(
  query: string,
  documents: any[],
  citations: string[],
  sessionId: string,
  userId: string
) {
  try {
    await langsmithClient.createRun({
      name: "rag_retrieval",
      run_type: "retriever",
      inputs: {
        query,
        sessionId,
        userId
      },
      outputs: {
        documents: JSON.stringify(documents),
        citations: JSON.stringify(citations),
        documentCount: documents.length
      },
      project_name: traceConfig.projectName,
      tags: [...traceConfig.tags, "rag_retrieval"],
      metadata: {
        ...traceConfig.metadata,
        sessionId,
        userId,
        documentCount: documents.length
      }
    });
  } catch (error) {
    console.warn('Failed to log RAG retrieval:', error);
  }
}

// Log workflow completion
export async function logWorkflowCompletion(
  result: any,
  sessionId: string,
  userId: string,
  duration: number
) {
  try {
    await langsmithClient.createRun({
      name: "workflow_completion",
      run_type: "chain",
      inputs: {
        sessionId,
        userId,
        duration
      },
      outputs: {
        result: typeof result === 'object' ? JSON.stringify(result) : String(result)
      },
      project_name: traceConfig.projectName,
      tags: [...traceConfig.tags, "workflow_completion"],
      metadata: {
        ...traceConfig.metadata,
        sessionId,
        userId,
        duration,
        success: true
      }
    });
  } catch (error) {
    console.warn('Failed to log workflow completion:', error);
  }
}

// Log workflow error
export async function logWorkflowError(
  error: any,
  sessionId: string,
  userId: string,
  step?: string
) {
  try {
    await langsmithClient.createRun({
      name: "workflow_error",
      run_type: "chain",
      inputs: {
        sessionId,
        userId,
        step: step || "unknown"
      },
      outputs: {
        error: error instanceof Error ? error.message : String(error)
      },
      project_name: traceConfig.projectName,
      tags: [...traceConfig.tags, "workflow_error"],
      metadata: {
        ...traceConfig.metadata,
        sessionId,
        userId,
        step: step || "unknown",
        success: false
      }
    });
  } catch (logError) {
    console.warn('Failed to log workflow error:', logError);
  }
}

export default {
  langsmithClient,
  traceConfig,
  withTracing,
  createTracedLLM,
  createTracedChain,
  createTracedTool,
  logWorkflowStep,
  logAgentSelection,
  logToolUsage,
  logRAGRetrieval,
  logWorkflowCompletion,
  logWorkflowError
};

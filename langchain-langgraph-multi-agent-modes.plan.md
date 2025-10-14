# Enterprise-Grade Langchain + LangGraph Multi-Agent Workflow
## Supporting All Mode Combinations (Manual/Automatic + Normal/Autonomous)

## Architecture Overview

Implement a production-ready state-machine based multi-agent system that supports all four mode combinations:

### Mode Combinations Supported:
1. **Manual + Normal**: User selects agent → User selects tools (web search, PubMed, RAG) → Custom tool-enabled chat
2. **Manual + Autonomous**: User selects agent → Full LangChain agent with all tools, RAG, memory  
3. **Automatic + Normal**: System selects best agent → User selects tools (web search, PubMed, RAG) → Custom tool-enabled chat
4. **Automatic + Autonomous**: System selects best agent → Full LangChain agent with all tools, RAG, memory

### Core Architecture:
- **LangGraph StateGraph with Mode-Aware Routing**: Conditional workflow based on interactionMode and autonomousMode
- **User-Selectable Tools**: Web search, PubMed, RAG search, calculator - users choose which tools to enable
- **ReAct Agents with Structured Tools**: For autonomous mode (all tools) and normal mode (user-selected tools)
- **Conversational Memory**: BufferWindowMemory with summarization (existing)
- **Advanced RAG Pipeline**: Hybrid search, re-ranking (existing)
- **LangSmith Observability**: Full tracing, feedback loops
- **Production Patterns**: Circuit breakers, rate limiting, token budgeting

## Existing Components (Reuse & Extend)

**Already Implemented:**
- `src/features/chat/services/enhanced-langchain-service.ts`: BufferWindowMemory, ConversationalRetrievalQAChain, SupabaseVectorStore
- `src/lib/services/langgraph-orchestrator.ts`: StateGraph patterns, Annotation, HITL with interrupts, expert tools integration
- `src/features/chat/services/ask-expert-graph.ts`: Basic LangGraph workflow with checkpointing, budget checks, RAG retrieval
- `src/lib/services/expert-tools.ts`: Web search (Tavily), calculator, knowledge base tools with Zod schemas
- `src/core/rag/EnhancedRAGSystem.ts`: Hybrid retrieval, reranking, multi-modal support
- `src/features/chat/services/automatic-orchestrator.ts`: Automatic agent selection logic

**Strategy:** Extend existing components with mode-aware conditional routing.

## Key Components (Mode-Aware Implementation)

### 1. Mode-Aware LangGraph Workflow

Enhance `src/features/chat/services/ask-expert-graph.ts` with mode-aware routing:

**State Definition (Extended with Mode Context):**
```typescript
import { Annotation } from "@langchain/langgraph";

const WorkflowState = Annotation.Root({
  // Core workflow state
  messages: Annotation<BaseMessage[]>({
    reducer: (current, update) => current.concat(update),
  }),
  query: Annotation<string>(),
  agentId: Annotation<string | null>(),
  selectedAgent: Annotation<any>(),
  suggestedAgents: Annotation<any[]>(),
  context: Annotation<string>(),
  sources: Annotation<any[]>(),
  toolCalls: Annotation<ToolCall[]>(),
  answer: Annotation<string>(),
  citations: Annotation<Citation[]>(),
  tokenUsage: Annotation<TokenUsage>(),
  metadata: Annotation<Record<string, any>>(),
  
  // Mode context
  interactionMode: Annotation<'automatic' | 'manual'>(),
  autonomousMode: Annotation<boolean>(),
  userId: Annotation<string>(),
  sessionId: Annotation<string>(),
  
  // User-selected tools (for normal mode)
  selectedTools: Annotation<string[]>({
    default: () => []
  }),
  availableTools: Annotation<ToolOption[]>({
    default: () => []
  }),
  
  // Workflow control
  workflowStep: Annotation<string>(),
  requiresUserInput: Annotation<boolean>(),
});
```

**Mode-Aware Graph Construction:**
```typescript
const graph = new StateGraph(WorkflowState)
  .addNode("analyzeQuery", analyzeQueryNode)
  .addNode("routeByMode", routeByModeNode)
  .addNode("suggestAgents", suggestAgentsNode)
  .addNode("awaitUserSelection", awaitUserSelectionNode)
  .addNode("suggestTools", suggestToolsNode)
  .addNode("awaitToolSelection", awaitToolSelectionNode)
  .addNode("retrieveContext", retrieveContextNode)
  .addNode("processWithAgentNormal", processWithAgentNormalNode)
  .addNode("processWithAgentAutonomous", processWithAgentAutonomousNode)
  .addNode("synthesizeResponse", synthesizeResponseNode)
  .addEdge(START, "analyzeQuery")
  .addEdge("analyzeQuery", "routeByMode")
  .addConditionalEdges("routeByMode", routeByModeCondition, {
    manual: "suggestAgents",
    automatic: "suggestTools"
  })
  .addConditionalEdges("suggestAgents", shouldWaitForUser, {
    awaitSelection: "__interrupt__",  // HITL for manual mode
    proceed: "suggestTools"
  })
  .addConditionalEdges("suggestTools", shouldWaitForToolSelection, {
    awaitTools: "__interrupt__",  // HITL for tool selection
    proceed: "retrieveContext"
  })
  .addEdge("retrieveContext", "processAgent")
  .addConditionalEdges("processAgent", processAgentCondition, {
    normal: "processWithAgentNormal",
    autonomous: "processWithAgentAutonomous"
  })
  .addEdge("processWithAgentNormal", "synthesizeResponse")
  .addEdge("processWithAgentAutonomous", "synthesizeResponse")
  .addEdge("synthesizeResponse", END);
```

### 2. Mode-Aware Workflow Nodes

Create `src/features/chat/services/workflow-nodes.ts`:

**Route by Mode Node:**
```typescript
async function routeByModeNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  const { interactionMode, autonomousMode } = state;
  
  console.log(`🔄 Routing by mode: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'}`);
  
  return {
    workflowStep: 'routing',
    metadata: {
      ...state.metadata,
      mode: `${interactionMode}_${autonomousMode ? 'autonomous' : 'normal'}`
    }
  };
}

function routeByModeCondition(state: WorkflowState): string {
  return state.interactionMode; // 'manual' or 'automatic'
}
```

**Process Agent Condition:**
```typescript
function processAgentCondition(state: WorkflowState): string {
  return state.autonomousMode ? 'autonomous' : 'normal';
}
```

**Manual Mode - Agent Suggestion Node:**
```typescript
async function suggestAgentsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🎯 Manual mode: Suggesting agents for user selection');
  
  // Use existing AutomaticAgentOrchestrator for agent ranking
  const orchestrator = new AutomaticAgentOrchestrator();
  const suggestions = await orchestrator.getAgentSuggestions(state.query);
  
  return {
    suggestedAgents: suggestions.rankedAgents.slice(0, 3),
    requiresUserInput: true,
    workflowStep: 'awaiting_selection'
  };
}
```

**Tool Suggestion Node:**
```typescript
async function suggestToolsNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🔧 Suggesting available tools for user selection');
  
  const availableTools = [
    {
      id: 'web_search',
      name: 'Web Search',
      description: 'Search the web for current information, news, research papers',
      icon: '🌐',
      category: 'research'
    },
    {
      id: 'pubmed_search', 
      name: 'PubMed Search',
      description: 'Search peer-reviewed medical literature',
      icon: '📚',
      category: 'research'
    },
    {
      id: 'knowledge_base',
      name: 'RAG Search',
      description: 'Search internal knowledge base and documents',
      icon: '🧠',
      category: 'knowledge'
    },
    {
      id: 'calculator',
      name: 'Calculator',
      description: 'Perform mathematical calculations and statistical analysis',
      icon: '🧮',
      category: 'analysis'
    },
    {
      id: 'fda_database',
      name: 'FDA Database',
      description: 'Search FDA approvals and regulatory information',
      icon: '🏛️',
      category: 'regulatory'
    }
  ];
  
  return {
    availableTools,
    requiresUserInput: !state.autonomousMode, // Only require selection in normal mode
    workflowStep: 'tool_selection'
  };
}

function shouldWaitForToolSelection(state: WorkflowState): string {
  return state.autonomousMode ? 'proceed' : 'awaitTools';
}
```

**Normal Mode Processing (with User-Selected Tools):**
```typescript
async function processWithAgentNormalNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('💬 Normal mode: Processing with user-selected tools');
  
  const { selectedAgent, query, messages, selectedTools } = state;
  
  // Create ReAct agent with only user-selected tools
  const userTools = getAllExpertTools().filter(tool => 
    selectedTools.includes(tool.name)
  );
  
  const agent = await createReactAgent({
    llm: model,
    tools: userTools,
    systemPrompt: selectedAgent.system_prompt
  });
  
  const result = await agent.invoke({
    input: query,
    chat_history: messages
  });
  
  return {
    answer: result.output,
    toolCalls: result.intermediateSteps || [],
    workflowStep: 'response_generated',
    metadata: {
      ...state.metadata,
      processing_mode: 'normal',
      tools_used: selectedTools
    }
  };
}
```

**Autonomous Mode Processing:**
```typescript
async function processWithAgentAutonomousNode(state: WorkflowState): Promise<Partial<WorkflowState>> {
  console.log('🔧 Autonomous mode: Processing with LangChain agent + tools');
  
  const { selectedAgent, query, messages } = state;
  
  // Use existing enhanced-langchain-service with full capabilities
  const enhancedService = new EnhancedLangChainService({
    model: 'gpt-4',
    temperature: 0.7,
    maxTokens: 2000
  });
  
  const result = await enhancedService.queryWithChain(
    query,
    selectedAgent.id,
    state.sessionId,
    selectedAgent,
    state.userId
  );
  
  return {
    answer: result.answer,
    sources: result.sources,
    citations: result.citations,
    tokenUsage: result.tokenUsage,
    workflowStep: 'response_generated',
    metadata: {
      ...state.metadata,
      processing_mode: 'autonomous',
      tools_used: ['rag', 'memory', 'knowledge_base']
    }
  };
}
```

### 3. API Route with Mode-Aware Routing

Refactor `src/app/api/chat/route.ts`:

**Mode-Aware Request Handling:**
```typescript
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      message, 
      userId, 
      sessionId, 
      agent,
      chatHistory = [],
      interactionMode = 'automatic',
      autonomousMode = false
    } = body;

    console.log(`🚀 Processing request: ${interactionMode} + ${autonomousMode ? 'Autonomous' : 'Normal'}`);

    // Compile mode-aware workflow
    const workflow = compileModeAwareWorkflow();
    
    const config = {
      configurable: { thread_id: sessionId },
      streamMode: "values" as const
    };

    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Stream workflow execution with mode context
          for await (const event of await workflow.stream(
            { 
              query: message, 
              selectedAgent: agent,
              interactionMode,
              autonomousMode,
              userId,
              sessionId,
              messages: chatHistory
            },
            config
          )) {
            // Send mode-specific updates
            if (event.workflowStep) {
              controller.enqueue(encode({
                type: "reasoning",
                content: getStepDescription(event.workflowStep, interactionMode, autonomousMode)
              }));
            }
            
            // Send agent selection updates
            if (event.suggestedAgents && interactionMode === 'manual') {
              controller.enqueue(encode({
                type: "agent_suggestions",
                content: event.suggestedAgents
              }));
            }
            
            if (event.selectedAgent && interactionMode === 'automatic') {
              controller.enqueue(encode({
                type: "agent_selected",
                content: `Selected: ${event.selectedAgent.display_name || event.selectedAgent.name}`
              }));
            }
            
            // Send tool usage (autonomous mode only)
            if (event.toolCalls && autonomousMode) {
              for (const call of event.toolCalls) {
                controller.enqueue(encode({
                  type: "tool_call",
                  tool: call.name,
                  args: call.args
                }));
              }
            }
            
            // Send response content
            if (event.answer) {
              controller.enqueue(encode({
                type: "content",
                content: event.answer
              }));
            }
            
            // Send citations (autonomous mode only)
            if (event.citations && autonomousMode) {
              controller.enqueue(encode({
                type: "citations",
                content: event.citations
              }));
            }
          }
          
          controller.close();
        } catch (error) {
          controller.enqueue(encode({ type: "error", content: error.message }));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "X-Accel-Buffering": "no"
      }
    });
    
  } catch (error) {
    console.error('❌ Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

function getStepDescription(step: string, interactionMode: string, autonomousMode: boolean): string {
  const mode = `${interactionMode}_${autonomousMode ? 'autonomous' : 'normal'}`;
  
  switch (step) {
    case 'routing':
      return `🔄 Routing for ${mode} mode...`;
    case 'awaiting_selection':
      return `🎯 Found top agents. Please select the best one for your query:`;
    case 'agent_selected':
      return `✅ Agent selected automatically`;
    case 'retrieving_context':
      return autonomousMode ? `🔍 Retrieving context with RAG...` : `🔍 Processing your query...`;
    case 'processing_normal':
      return `💬 Generating response with agent expertise...`;
    case 'processing_autonomous':
      return `🔧 Processing with advanced tools and RAG...`;
    case 'response_generated':
      return `✅ Response generated successfully`;
    default:
      return `Processing...`;
  }
}
```

### 4. Frontend Mode Integration

Update `src/lib/stores/chat-store.ts` to pass mode context:

**Enhanced sendMessage function:**
```typescript
sendMessage: async (content: string, options: { agent?: Agent } = {}) => {
  const state = get();
  const { interactionMode, autonomousMode, selectedAgent } = state;
  
  // Create message
  const message: ChatMessage = {
    id: generateId(),
    content,
    role: 'user',
    timestamp: new Date(),
    agent: options.agent || selectedAgent,
  };

  // Add to messages
  set({ messages: [...state.messages, message] });

  try {
    // Call API with mode context
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: content,
        userId: state.userId,
        sessionId: state.sessionId,
        agent: options.agent || selectedAgent,
        chatHistory: state.messages,
        interactionMode,  // Pass mode context
        autonomousMode    // Pass mode context
      }),
    });

    // Handle streaming response based on mode
    await handleStreamingResponse(response, interactionMode, autonomousMode);
    
  } catch (error) {
    console.error('Error sending message:', error);
    set({ error: 'Failed to send message' });
  }
}
```

## Mode-Specific Features

### Manual + Normal Mode
- **Flow**: User selects agent → User selects tools → Custom tool-enabled chat
- **Features**: Agent selection UI, tool selection UI, ReAct agent with selected tools
- **Tools**: User chooses from: Web search, PubMed, RAG search, calculator, FDA database
- **Memory**: Basic conversation history
- **UI**: Two-step selection (agent + tools)

### Manual + Autonomous Mode  
- **Flow**: User selects agent → Full LangChain agent with all tools
- **Features**: Agent selection UI, ReAct agent with all tools, RAG, memory
- **Tools**: All available tools (FDA database, PubMed, clinical trials, calculator, knowledge base, web search)
- **Memory**: BufferWindowMemory with summarization
- **UI**: Single agent selection

### Automatic + Normal Mode
- **Flow**: System selects agent → User selects tools → Custom tool-enabled chat
- **Features**: Automatic agent selection, tool selection UI, ReAct agent with selected tools
- **Tools**: User chooses from: Web search, PubMed, RAG search, calculator, FDA database
- **Memory**: Basic conversation history
- **UI**: Tool selection only

### Automatic + Autonomous Mode
- **Flow**: System selects agent → Full LangChain agent with all tools
- **Features**: Automatic agent selection, ReAct agent with all tools, RAG, memory
- **Tools**: All available tools (FDA database, PubMed, clinical trials, calculator, knowledge base, web search)
- **Memory**: BufferWindowMemory with summarization
- **UI**: No user interaction required

## File Structure (Mode-Aware)

```
src/
├── features/chat/services/
│   ├── ask-expert-graph.ts           # Enhanced with mode-aware routing
│   ├── workflow-nodes.ts             # Mode-specific node implementations
│   ├── enhanced-langchain-service.ts # Existing RAG service
│   └── automatic-orchestrator.ts     # Existing agent selection
├── lib/langchain/
│   ├── tools/                        # Existing expert tools
│   ├── memory/                       # Existing conversation memory
│   └── observability/                # LangSmith configuration
├── app/api/chat/route.ts             # Mode-aware API endpoint
└── lib/stores/chat-store.ts          # Enhanced with mode context
```

## Testing Strategy (All Mode Combinations)

```typescript
describe("Mode-Aware Workflow", () => {
  describe("Manual + Normal", () => {
    it("should show agent selection and use standard responses", async () => {
      const result = await workflow.invoke({
        query: "test",
        interactionMode: "manual",
        autonomousMode: false
      });
      expect(result.suggestedAgents).toHaveLength(3);
      expect(result.requiresUserInput).toBe(true);
    });
  });

  describe("Manual + Autonomous", () => {
    it("should show agent selection and use LangChain tools", async () => {
      const result = await workflow.invoke({
        query: "test",
        interactionMode: "manual", 
        autonomousMode: true
      });
      expect(result.suggestedAgents).toHaveLength(3);
      expect(result.metadata.tools_used).toContain('rag');
    });
  });

  describe("Automatic + Normal", () => {
    it("should auto-select agent and use standard responses", async () => {
      const result = await workflow.invoke({
        query: "test",
        interactionMode: "automatic",
        autonomousMode: false
      });
      expect(result.selectedAgent).toBeDefined();
      expect(result.requiresUserInput).toBe(false);
    });
  });

  describe("Automatic + Autonomous", () => {
    it("should auto-select agent and use LangChain tools", async () => {
      const result = await workflow.invoke({
        query: "test", 
        interactionMode: "automatic",
        autonomousMode: true
      });
      expect(result.selectedAgent).toBeDefined();
      expect(result.metadata.tools_used).toContain('rag');
    });
  });
});
```

## Migration Strategy

1. **Phase 1**: Implement mode-aware workflow alongside existing system
2. **Phase 2**: Add feature flag: `USE_MODE_AWARE_WORKFLOW=true`
3. **Phase 3**: A/B test with 10% traffic to new workflow
4. **Phase 4**: Gradual rollout: 10% → 50% → 100%
5. **Phase 5**: Deprecate old hardcoded approach

## Expected Performance by Mode

| Mode Combination | Latency | Tools Used | Memory | Accuracy | User Interaction |
|------------------|---------|------------|--------|----------|------------------|
| Manual + Normal | < 4s | User-selected | Basic | 90% | Agent + Tools |
| Manual + Autonomous | < 8s | All tools | Advanced | 95% | Agent only |
| Automatic + Normal | < 5s | User-selected | Basic | 92% | Tools only |
| Automatic + Autonomous | < 10s | All tools | Advanced | 95% | None |

## Tool Selection UI Components

### Tool Selection Modal
```typescript
interface ToolOption {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: 'research' | 'knowledge' | 'analysis' | 'regulatory';
  enabled: boolean;
}

// Tool categories for better organization
const toolCategories = {
  research: ['web_search', 'pubmed_search'],
  knowledge: ['knowledge_base', 'rag_search'],
  analysis: ['calculator', 'statistical_analysis'],
  regulatory: ['fda_database', 'clinical_trials']
};
```

### Frontend Tool Selection
```typescript
// In chat store
interface ChatStore {
  selectedTools: string[];
  availableTools: ToolOption[];
  setSelectedTools: (tools: string[]) => void;
  toggleTool: (toolId: string) => void;
}
```

## Documentation

- `docs/langchain/MODE_AWARE_ARCHITECTURE.md`: Mode system design
- `docs/langchain/WORKFLOW_ROUTING.md`: Conditional workflow patterns
- `docs/langchain/MODE_TESTING.md`: Testing all combinations
- `docs/langchain/MIGRATION_GUIDE.md`: Mode-aware migration steps

# Ask Expert Architecture Documentation

**Version**: 1.0.0
**Date**: 2025-10-24
**Route**: `/ask-expert`

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Services](#services)
5. [Features](#features)
6. [API Integration](#api-integration)
7. [Data Flow](#data-flow)
8. [UI/UX Design](#uiux-design)
9. [Technical Stack](#technical-stack)
10. [Future Enhancements](#future-enhancements)

---

## Overview

**Ask Expert** is a dedicated consultation interface that enables users to have one-on-one conversations with specialized AI agents. Unlike the multi-agent Panel view, Ask Expert focuses on deep, contextual conversations with a single expert at a time.

### Key Characteristics

- **Single-Agent Focus**: One expert per conversation session
- **LangGraph Workflow**: Advanced LangChain orchestration with state management
- **Streaming Responses**: Real-time token-by-token output
- **RAG Integration**: Knowledge-augmented responses with citations
- **Memory Management**: Conversation history persistence
- **Budget Tracking**: Token usage and cost monitoring

### Use Cases

1. **Deep Domain Expertise**: Regulatory compliance, clinical research, market access
2. **Strategic Planning**: Long-term strategy development with expert guidance
3. **Problem Solving**: Complex issue resolution requiring specialized knowledge
4. **Learning & Education**: Understanding domain-specific concepts
5. **Decision Support**: Expert recommendations for critical decisions

---

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Ask Expert Page                          │
│                   /app/(app)/ask-expert/                     │
│                                                               │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────┐ │
│  │   Sidebar    │  │   Chat Container   │  │  Input Area │ │
│  │              │  │                    │  │             │ │
│  │ - Agent      │  │ - Messages         │  │ - Textarea  │ │
│  │   Selector   │  │ - Progress         │  │ - Send Btn  │ │
│  │ - Quick      │  │ - Metadata         │  │             │ │
│  │   Prompts    │  │ - Citations        │  │             │ │
│  └──────────────┘  └────────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Layer (/api/ask-expert)              │
│                                                               │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────┐ │
│  │ Request      │  │ LangGraph          │  │  Response   │ │
│  │ Validation   │─▶│ Workflow Engine    │─▶│  Streaming  │ │
│  └──────────────┘  └────────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Services Layer                           │
│                                                               │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────┐ │
│  │ LangChain    │  │ RAG Service        │  │  Memory     │ │
│  │ Enhanced     │  │                    │  │  Manager    │ │
│  │ Service      │  │ - Vector Search    │  │             │ │
│  │              │  │ - Embeddings       │  │ - Session   │ │
│  │ - Agents     │  │ - Citations        │  │ - History   │ │
│  │ - Tools      │  │                    │  │             │ │
│  │ - Memory     │  │                    │  │             │ │
│  └──────────────┘  └────────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Data Layer                               │
│                                                               │
│  ┌──────────────┐  ┌────────────────────┐  ┌─────────────┐ │
│  │  Supabase    │  │  Vector Store      │  │   Redis     │ │
│  │              │  │                    │  │   Cache     │ │
│  │ - Agents     │  │ - Embeddings       │  │             │ │
│  │ - Chats      │  │ - Documents        │  │ - Sessions  │ │
│  │ - Users      │  │ - Metadata         │  │ - Memory    │ │
│  └──────────────┘  └────────────────────┘  └─────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Component Tree

```
AskExpertPage
├── Sidebar
│   ├── Header
│   │   └── MessageSquare Icon + Title
│   ├── AgentSelector
│   │   └── Select Dropdown
│   │       └── AgentList (from Store)
│   ├── SelectedAgentInfo
│   │   ├── Avatar
│   │   ├── Name & Description
│   │   └── Capabilities Badges
│   └── QuickPrompts
│       └── PromptButtons[]
├── MainChatArea
│   ├── Header
│   │   ├── AgentName
│   │   └── Badges (Ask Expert, LangGraph)
│   ├── WorkflowProgress (conditional)
│   │   ├── Loader Icon
│   │   └── Progress Bar
│   ├── MessagesContainer
│   │   └── MessageList[]
│   │       ├── UserMessage
│   │       └── AssistantMessage
│   │           ├── Avatar
│   │           ├── Content (Markdown)
│   │           └── Metadata (Sources, Citations)
│   └── InputArea
│       ├── Textarea
│       └── SendButton
```

---

## Components

### 1. AskExpertPage Component

**Location**: `/src/app/(app)/ask-expert/page.tsx`

#### Purpose
Main orchestrator component managing the entire Ask Expert interface, state, and interactions.

#### State Management

```typescript
interface AskExpertState {
  selectedAgent: Agent | null;      // Currently selected expert
  messages: Message[];               // Conversation history
  input: string;                     // User input text
  isLoading: boolean;                // Request in progress
  sessionId: string;                 // Unique session identifier
  workflowSteps: any[];              // LangGraph workflow steps
  currentStep: string;               // Current workflow stage
  progress: number;                  // Progress percentage (0-100)
}
```

#### Key Features

- **Agent Selection**: Dynamic agent loading from Zustand store
- **Session Management**: Unique session ID for conversation tracking
- **Streaming Support**: Real-time message updates via Server-Sent Events
- **Auto-Scroll**: Automatic scroll to latest message
- **Keyboard Shortcuts**: Enter to send, Shift+Enter for new line

#### Component Structure

```typescript
export default function AskExpertPage() {
  // Hooks
  const { user } = useAuth();
  const { agents, loadAgents } = useAgentsStore();

  // State
  const [state, setState] = useState<AskExpertState>({...});

  // Effects
  useEffect(() => loadAgents(), []);
  useEffect(() => scrollToBottom(), [messages]);

  // Handlers
  const handleAgentSelect = (agentId: string) => {...};
  const handleSendMessage = async () => {...};

  // Render
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <MainChatArea />
    </div>
  );
}
```

### 2. Sidebar Component

**Inline Component** within AskExpertPage

#### Sections

##### A. Header Section
```tsx
<div className="p-6 border-b">
  <MessageSquare icon />
  <h1>Ask Expert</h1>
  <p>Get expert guidance from specialized AI agents</p>
</div>
```

##### B. Agent Selection
```tsx
<Select onValueChange={handleAgentSelect}>
  {agents.map(agent => (
    <SelectItem key={agent.id} value={agent.id}>
      <Avatar />
      <span>{agent.name}</span>
    </SelectItem>
  ))}
</Select>
```

##### C. Selected Agent Info
```tsx
{selectedAgent && (
  <div className="p-6 border-b">
    <Avatar size="large" />
    <h4>{agent.name}</h4>
    <p>{agent.description}</p>
    <Badges capabilities={agent.capabilities.slice(0, 3)} />
  </div>
)}
```

##### D. Quick Prompts
```tsx
{selectedAgent && (
  <div className="p-6">
    <h3>Quick Prompts</h3>
    {getExpertPrompts().map(prompt => (
      <Button onClick={() => setInput(prompt.text)}>
        <span>{prompt.icon}</span>
        <span>{prompt.text}</span>
        <p>{prompt.description}</p>
      </Button>
    ))}
  </div>
)}
```

**Quick Prompt Categories**:
1. 📋 Regulatory considerations
2. 🎯 Strategic optimization
3. 📈 Industry trends
4. ⚠️ Common challenges

### 3. MainChatArea Component

**Inline Component** within AskExpertPage

#### Structure

##### A. Header
```tsx
<div className="bg-white border-b p-4">
  <h2>Chat with {selectedAgent.name}</h2>
  <p>{selectedAgent.description}</p>
  <Badge>Ask Expert</Badge>
  <Badge>LangGraph</Badge>
</div>
```

##### B. Workflow Progress (Conditional)
```tsx
{isLoading && (
  <div className="bg-blue-50 p-4">
    <Loader2 className="animate-spin" />
    <p>{currentStep}</p>
    <Progress value={progress} />
  </div>
)}
```

##### C. Messages Container
```tsx
<div className="flex-1 overflow-y-auto p-6">
  {messages.map(message => (
    <MessageBubble
      key={message.id}
      role={message.role}
      content={message.content}
      metadata={message.metadata}
      agent={selectedAgent}
    />
  ))}
</div>
```

**Message Types**:
- **User Message**: Blue background, right-aligned
- **Assistant Message**: White background, left-aligned, includes avatar

**Metadata Display**:
- Sources (with titles and references)
- Citations (inline references)
- Token usage (if available)
- Workflow steps (debugging info)

##### D. Input Area
```tsx
<div className="bg-white border-t p-4">
  <Textarea
    value={input}
    onChange={handleChange}
    onKeyDown={handleKeyPress}
    placeholder="Ask {agent.name} anything..."
    disabled={!selectedAgent || isLoading}
  />
  <Button
    onClick={handleSendMessage}
    disabled={!input.trim() || isLoading}
  >
    {isLoading ? <Loader2 /> : <Send />}
  </Button>
</div>
```

### 4. Message Component

**Inline Rendering** within Messages Loop

#### User Message

```tsx
<div className="flex justify-end">
  <div className="bg-blue-600 text-white rounded-lg p-4 max-w-3xl">
    <ReactMarkdown>{message.content}</ReactMarkdown>
  </div>
</div>
```

#### Assistant Message

```tsx
<div className="flex justify-start">
  <div className="bg-white border rounded-lg p-4 max-w-3xl">
    <div className="flex items-start space-x-3">
      <Avatar src={agent.avatar} />
      <div>
        <ReactMarkdown className="prose prose-sm">
          {message.content}
        </ReactMarkdown>

        {/* Sources Section */}
        {message.metadata?.sources && (
          <div className="mt-3 pt-3 border-t">
            <h4 className="text-xs font-medium">Sources:</h4>
            {sources.map((source, index) => (
              <div key={index}>
                <span>[{index + 1}]</span> {source.title}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  </div>
</div>
```

---

## Services

### 1. Ask Expert API Service

**Location**: `/src/app/api/ask-expert/route.ts`

#### Purpose
Server-side API endpoint handling Ask Expert requests with LangGraph workflow execution.

#### Request Schema

```typescript
interface AskExpertRequest {
  message: string;              // User's question/prompt
  agent: Agent;                 // Selected agent object
  userId?: string;              // User ID (default: 'anonymous')
  sessionId?: string;           // Session ID (auto-generated if missing)
  chatHistory?: Message[];      // Previous conversation history
  ragEnabled?: boolean;         // Enable RAG (default: true)
  stream?: boolean;             // Enable streaming (default: true)
  useEnhancedWorkflow?: boolean; // Use LangGraph workflow
}
```

#### Response Types

**Streaming Response** (Server-Sent Events):
```
data: {"type": "workflow_step", "step": "Analyzing query..."}
data: {"type": "output", "content": "Based on regulatory..."}
data: {"type": "metadata", "data": {"sources": [...]}}
data: {"type": "done"}
```

**Non-Streaming Response**:
```json
{
  "content": "Full response text",
  "metadata": {
    "sources": [],
    "citations": [],
    "tokenUsage": {},
    "workflowSteps": []
  }
}
```

#### Features

- ✅ **LangGraph Workflow**: Advanced multi-step reasoning
- ✅ **Enhanced LangChain Service**: Intelligent agent orchestration
- ✅ **Streaming Support**: Real-time token-by-token output
- ✅ **Budget Checking**: Token limits and cost tracking
- ✅ **Token Tracking**: Usage metrics and analytics
- ✅ **RAG Integration**: Knowledge-augmented responses
- ✅ **Memory Management**: Conversation history persistence
- ✅ **Error Handling**: Comprehensive error recovery

#### Implementation

```typescript
export async function POST(request: NextRequest) {
  try {
    // Initialize Supabase client
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Parse request body
    const { message, agent, userId, sessionId, chatHistory, ragEnabled, stream } = await request.json();

    // Validate required fields
    if (!message || !agent) {
      return NextResponse.json({ error: 'Message and agent required' }, { status: 400 });
    }

    // Load chat history into memory
    if (chatHistory.length > 0) {
      await enhancedLangChainService.loadChatHistory(sessionId, chatHistory);
    }

    // Handle streaming vs non-streaming
    if (stream) {
      return handleStreamingResponse(...args);
    } else {
      return handleNonStreamingResponse(...args);
    }
  } catch (error) {
    console.error('Ask Expert API error:', error);
    return NextResponse.json({ error: 'Execution failed' }, { status: 500 });
  }
}
```

### 2. LangGraph Workflow Service

**Location**: `/src/features/chat/services/ask-expert-graph.ts`

#### Purpose
Orchestrates complex multi-step workflows using LangGraph for Ask Expert conversations.

#### Workflow Steps

1. **Query Analysis**: Intent classification and entity extraction
2. **RAG Retrieval**: Vector search for relevant knowledge
3. **Agent Reasoning**: LLM-powered expert reasoning
4. **Citation Generation**: Source attribution and references
5. **Response Synthesis**: Coherent answer compilation
6. **Quality Check**: Validation and confidence scoring

#### Key Functions

```typescript
export async function streamAskExpertWorkflow(
  message: string,
  agent: Agent,
  userId: string,
  sessionId: string,
  ragEnabled: boolean,
  supabase: SupabaseClient
): Promise<ReadableStream> {
  // Create LangGraph workflow
  const workflow = createAskExpertGraph();

  // Initialize state
  const initialState = {
    message,
    agent,
    userId,
    sessionId,
    ragEnabled,
    history: [],
    output: '',
    metadata: {},
  };

  // Stream workflow execution
  const stream = await workflow.stream(initialState);

  return new ReadableStream({
    async start(controller) {
      for await (const event of stream) {
        controller.enqueue(event);
      }
      controller.close();
    }
  });
}
```

### 3. Enhanced LangChain Service

**Location**: `/src/features/chat/services/enhanced-langchain-service.ts`

#### Purpose
Provides intelligent agent orchestration, memory management, and RAG integration.

#### Key Features

- **Agent Management**: Dynamic agent loading and configuration
- **Tool Registry**: Available tools for each agent
- **Memory Systems**:
  - Short-term: Buffer memory for current conversation
  - Long-term: Vector-based semantic memory
- **RAG Integration**: Knowledge retrieval and augmentation
- **Prompt Engineering**: Context-aware prompt construction
- **Token Management**: Usage tracking and budget enforcement

#### Core Methods

```typescript
class EnhancedLangChainService {
  // Chat execution
  async chat(message: string, agent: Agent, options: ChatOptions): Promise<ChatResponse>;

  // Memory management
  async loadChatHistory(sessionId: string, history: Message[]): Promise<void>;
  async saveChatMemory(sessionId: string, message: Message): Promise<void>;

  // RAG operations
  async retrieveContext(query: string, agentId: string): Promise<Document[]>;

  // Agent operations
  async loadAgentTools(agentId: string): Promise<Tool[]>;
  async buildAgentPrompt(agent: Agent, context: string): Promise<string>;
}
```

### 4. Agents Store (Zustand)

**Location**: `/src/lib/stores/agents-store.ts`

#### Purpose
Global state management for agents data with Zustand.

#### Store Schema

```typescript
interface AgentsStore {
  // State
  agents: Agent[];
  loading: boolean;
  error: string | null;

  // Actions
  loadAgents: () => Promise<void>;
  selectAgent: (id: string) => Agent | null;
  filterAgents: (criteria: FilterCriteria) => Agent[];

  // Mutations
  addAgent: (agent: Agent) => void;
  updateAgent: (id: string, updates: Partial<Agent>) => void;
  deleteAgent: (id: string) => void;
}
```

#### Usage

```typescript
const { agents, loadAgents } = useAgentsStore();

useEffect(() => {
  loadAgents();
}, []);

const selectedAgent = agents.find(a => a.id === agentId);
```

---

## Features

### 1. Single-Agent Conversations

**Purpose**: Deep, focused dialogue with one expert at a time.

**Benefits**:
- Context retention throughout conversation
- Consistent persona and expertise
- Personalized recommendations
- Memory of previous interactions

**Implementation**:
```typescript
const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null);

// Agent persists for entire session
const sessionId = `ask-expert-${Date.now()}`;
```

### 2. Streaming Responses

**Purpose**: Real-time token-by-token output for better UX.

**Benefits**:
- Perceived faster response times
- Progressive content rendering
- Early content visibility
- Reduced waiting anxiety

**Implementation**:
```typescript
const reader = response.body?.getReader();
const decoder = new TextDecoder();

while (true) {
  const { done, value } = await reader.read();
  if (done) break;

  const chunk = decoder.decode(value);
  const lines = chunk.split('\n');

  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = JSON.parse(line.slice(6));
      if (data.type === 'output') {
        fullContent += data.content;
        updateMessage(fullContent);
      }
    }
  }
}
```

### 3. Workflow Progress Tracking

**Purpose**: Transparent visibility into multi-step reasoning process.

**Benefits**:
- User confidence in processing
- Understanding of agent's approach
- Debugging and transparency
- Educational value

**Workflow Steps**:
```typescript
const steps = [
  'Analyzing your query...',
  'Retrieving relevant knowledge...',
  'Consulting expert reasoning...',
  'Generating citations...',
  'Synthesizing response...',
  'Complete'
];
```

**UI Component**:
```tsx
{isLoading && (
  <div className="bg-blue-50 p-4">
    <Loader2 className="animate-spin" />
    <p className="text-sm font-medium">{currentStep}</p>
    <Progress value={progress} />
  </div>
)}
```

### 4. RAG-Enhanced Responses

**Purpose**: Knowledge-augmented answers with source attribution.

**Benefits**:
- Factual accuracy
- Up-to-date information
- Source verification
- Citation transparency

**RAG Pipeline**:
1. Query → Embedding
2. Vector Search → Top-K Documents
3. Context Ranking → Relevance Scoring
4. LLM Generation → RAG-Augmented Response
5. Citation Extraction → Source Attribution

**Metadata Display**:
```tsx
{message.metadata?.sources && (
  <div className="mt-3 pt-3 border-t">
    <h4 className="text-xs font-medium">Sources:</h4>
    {sources.slice(0, 3).map((source, i) => (
      <div key={i} className="text-xs text-gray-600">
        <span className="font-medium">[{i + 1}]</span> {source.title}
      </div>
    ))}
  </div>
)}
```

### 5. Quick Prompts

**Purpose**: Pre-configured prompts for common questions.

**Benefits**:
- Faster query formulation
- Guided exploration
- Use case discovery
- Reduced cognitive load

**Dynamic Generation**:
```typescript
const getExpertPrompts = () => {
  if (!selectedAgent) return [];

  return [
    {
      text: `What are the key regulatory considerations for ${agent.name.toLowerCase()}?`,
      description: 'Get regulatory guidance',
      icon: '📋',
    },
    {
      text: `How can I optimize my ${agent.name.toLowerCase()} strategy?`,
      description: 'Strategic optimization',
      icon: '🎯',
    },
    {
      text: `What are the latest trends in ${agent.name.toLowerCase()}?`,
      description: 'Industry trends',
      icon: '📈',
    },
    {
      text: `What are the common challenges in ${agent.name.toLowerCase()}?`,
      description: 'Challenge analysis',
      icon: '⚠️',
    },
  ];
};
```

### 6. Memory Persistence

**Purpose**: Maintain conversation context across messages.

**Benefits**:
- Coherent multi-turn dialogues
- Reference previous questions
- Build on earlier topics
- Avoid repetition

**Implementation**:
```typescript
// Load history on page load
useEffect(() => {
  if (sessionId && chatHistory.length > 0) {
    enhancedLangChainService.loadChatHistory(sessionId, chatHistory);
  }
}, [sessionId]);

// Include history in requests
const response = await fetch('/api/ask-expert', {
  method: 'POST',
  body: JSON.stringify({
    message,
    agent,
    sessionId,
    chatHistory: messages.map(msg => ({
      role: msg.role,
      content: msg.content,
    })),
  }),
});
```

### 7. Agent Capabilities Display

**Purpose**: Show expert's specializations and skills.

**Benefits**:
- Informed agent selection
- Capability awareness
- Trust building
- Expectation setting

**UI Component**:
```tsx
<div className="flex flex-wrap gap-1 mt-2">
  {agent.capabilities?.slice(0, 3).map((cap) => (
    <Badge key={cap} variant="secondary" className="text-xs">
      {cap}
    </Badge>
  ))}
</div>
```

---

## API Integration

### Request Flow

```
User Input → Frontend Handler → API Endpoint → LangGraph Workflow → LangChain Service → LLM + RAG → Streaming Response → Frontend Update
```

### API Endpoint

**Endpoint**: `POST /api/ask-expert`

**Headers**:
```json
{
  "Content-Type": "application/json"
}
```

**Request Body**:
```json
{
  "message": "What are the FDA requirements for SaMD Class II devices?",
  "agent": {
    "id": "agent-123",
    "name": "Regulatory Expert",
    "model": "gpt-4",
    "systemPrompt": "You are an FDA regulatory expert..."
  },
  "userId": "user-456",
  "sessionId": "ask-expert-1729795200000",
  "chatHistory": [
    {
      "role": "user",
      "content": "Tell me about FDA regulations"
    },
    {
      "role": "assistant",
      "content": "FDA regulations cover..."
    }
  ],
  "ragEnabled": true,
  "useEnhancedWorkflow": true
}
```

**Response (Streaming)**:
```
data: {"type":"workflow_step","step":"Analyzing query..."}
data: {"type":"output","content":"Based on FDA guidance documents"}
data: {"type":"output","content":", SaMD Class II devices require..."}
data: {"type":"metadata","data":{"sources":[{"title":"FDA SaMD Guidance","url":"..."}]}}
data: {"type":"done"}
```

### Error Handling

**Client-Side**:
```typescript
try {
  const response = await fetch('/api/ask-expert', {...});

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  // Handle streaming...
} catch (error) {
  console.error('Ask Expert error:', error);

  const errorMessage: Message = {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
    timestamp: new Date(),
  };

  setState(prev => ({
    ...prev,
    messages: [...prev.messages, errorMessage],
  }));
}
```

**Server-Side**:
```typescript
try {
  // Process request...
} catch (error: any) {
  console.error('Ask Expert API error:', error);
  return NextResponse.json(
    {
      error: 'Ask Expert execution failed',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    },
    { status: 500 }
  );
}
```

---

## Data Flow

### Complete Data Flow Diagram

```
┌──────────────┐
│   User Input │
│   "Ask..."   │
└──────┬───────┘
       │
       ▼
┌──────────────────────────┐
│  Frontend Handler        │
│  handleSendMessage()     │
│                          │
│  1. Create user message  │
│  2. Update UI state      │
│  3. Show loading state   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  API Request             │
│  POST /api/ask-expert    │
│                          │
│  Body: {                 │
│    message,              │
│    agent,                │
│    sessionId,            │
│    chatHistory,          │
│    ragEnabled: true      │
│  }                       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  API Handler             │
│  /api/ask-expert/route   │
│                          │
│  1. Validate request     │
│  2. Load chat history    │
│  3. Initialize workflow  │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  LangGraph Workflow      │
│  streamAskExpertWorkflow │
│                          │
│  Step 1: Query Analysis  │
│  Step 2: RAG Retrieval   │
│  Step 3: Agent Reasoning │
│  Step 4: Citation Gen    │
│  Step 5: Synthesis       │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│  Enhanced LangChain      │
│  enhancedLangChainService│
│                          │
│  1. Build agent prompt   │
│  2. Load tools           │
│  3. Retrieve RAG context │
│  4. Execute LLM call     │
└──────────┬───────────────┘
           │
           ├──────────────┬──────────────┐
           │              │              │
           ▼              ▼              ▼
    ┌──────────┐   ┌──────────┐  ┌──────────┐
    │ OpenAI   │   │ Supabase │  │  Redis   │
    │ GPT-4    │   │ pgvector │  │  Cache   │
    │          │   │          │  │          │
    │ LLM Call │   │ Vector   │  │ Session  │
    │          │   │ Search   │  │ Memory   │
    └────┬─────┘   └────┬─────┘  └────┬─────┘
         │              │              │
         └──────────────┴──────────────┘
                        │
                        ▼
           ┌────────────────────────┐
           │  Response Streaming    │
           │                        │
           │  Server-Sent Events:   │
           │  - workflow_step       │
           │  - output              │
           │  - metadata            │
           │  - done                │
           └────────┬───────────────┘
                    │
                    ▼
           ┌────────────────────────┐
           │  Frontend SSE Parser   │
           │                        │
           │  1. Read stream        │
           │  2. Parse events       │
           │  3. Update UI state    │
           └────────┬───────────────┘
                    │
                    ▼
           ┌────────────────────────┐
           │  UI Update             │
           │                        │
           │  1. Append content     │
           │  2. Update progress    │
           │  3. Show metadata      │
           │  4. Complete response  │
           └────────────────────────┘
```

### State Updates Flow

```typescript
// 1. User types message
setState(prev => ({ ...prev, input: userInput }));

// 2. User clicks send
setState(prev => ({
  ...prev,
  messages: [...prev.messages, userMessage],
  input: '',
  isLoading: true,
  progress: 0,
}));

// 3. Streaming updates
setState(prev => ({
  ...prev,
  currentStep: 'Analyzing query...',
  progress: 10,
}));

setState(prev => ({
  ...prev,
  messages: prev.messages.map(msg =>
    msg.id === assistantMessage.id
      ? { ...msg, content: fullContent }
      : msg
  ),
  progress: 60,
}));

// 4. Completion
setState(prev => ({
  ...prev,
  isLoading: false,
  currentStep: '',
  progress: 100,
}));
```

---

## UI/UX Design

### Layout Structure

**Grid System**: Flexbox-based responsive layout

```css
.container {
  display: flex;
  height: 100vh;
}

.sidebar {
  width: 320px;
  border-right: 1px solid #e5e7eb;
}

.main-chat {
  flex: 1;
  display: flex;
  flex-direction: column;
}
```

### Color Palette

**Primary Colors**:
- Blue 600: `#2563eb` (Primary actions, user messages)
- Gray 50: `#f9fafb` (Background)
- Gray 200: `#e5e7eb` (Borders)
- White: `#ffffff` (Cards, assistant messages)

**Semantic Colors**:
- Success: `#10b981` (Completed steps)
- Warning: `#f59e0b` (In progress)
- Error: `#ef4444` (Errors)
- Info: `#3b82f6` (Workflow progress)

### Typography

**Font Family**: System fonts (Inter, SF Pro)

**Font Sizes**:
- Heading 1: `text-xl` (20px) - Page title
- Heading 2: `text-lg` (18px) - Section headers
- Heading 3: `text-sm font-medium` (14px) - Subsection headers
- Body: `text-sm` (14px) - Main content
- Small: `text-xs` (12px) - Metadata, descriptions

**Font Weights**:
- Semibold: `font-semibold` (600) - Titles
- Medium: `font-medium` (500) - Labels
- Normal: `font-normal` (400) - Body text

### Spacing System

**Tailwind Spacing**:
- `space-x-2`: 8px horizontal gap
- `space-x-3`: 12px horizontal gap
- `p-4`: 16px padding
- `p-6`: 24px padding
- `gap-4`: 16px grid gap

### Interactive States

**Buttons**:
```css
.button {
  transition: all 200ms ease;
}

.button:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

.button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

**Inputs**:
```css
.textarea:focus {
  border-color: #2563eb;
  ring: 2px solid rgba(37, 99, 235, 0.2);
}
```

### Animation

**Loading Spinner**:
```tsx
<Loader2 className="h-4 w-4 animate-spin" />
```

**Progress Bar**:
```tsx
<Progress value={progress} className="transition-all duration-300" />
```

**Auto-Scroll**:
```typescript
messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
```

### Responsive Design

**Breakpoints**:
- Mobile: `< 768px`
- Tablet: `768px - 1024px`
- Desktop: `> 1024px`

**Mobile Adaptations**:
- Sidebar: Collapsible drawer
- Messages: Full width cards
- Input: Fixed bottom position

---

## Technical Stack

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| **Next.js** | 14.2.33 | React framework, SSR |
| **React** | 18.3.1 | UI library |
| **TypeScript** | 5.9.3 | Type safety |
| **Tailwind CSS** | 3.4.18 | Styling |
| **Zustand** | 5.0.8 | State management |
| **React Markdown** | 10.1.0 | Markdown rendering |
| **Lucide React** | 0.294.0 | Icons |

### Backend Services

| Technology | Version | Purpose |
|------------|---------|---------|
| **LangChain** | 0.3.36 | LLM orchestration |
| **LangGraph** | 0.4.9 | Workflow engine |
| **OpenAI** | 4.104.0 | LLM provider |
| **Supabase** | 2.76.1 | Database, auth |
| **pgvector** | - | Vector embeddings |
| **Redis** | - | Caching, sessions |

### Key Dependencies

```json
{
  "@langchain/core": "0.3.78",
  "@langchain/openai": "0.6.16",
  "@langchain/community": "0.3.57",
  "@supabase/supabase-js": "2.76.1",
  "@upstash/redis": "1.35.6",
  "react-markdown": "10.1.0",
  "zustand": "5.0.8"
}
```

### File Structure

```
src/
├── app/
│   └── (app)/
│       └── ask-expert/
│           └── page.tsx                 # Main page component
├── app/api/
│   └── ask-expert/
│       └── route.ts                     # API endpoint
├── features/
│   └── chat/
│       └── services/
│           ├── ask-expert-graph.ts      # LangGraph workflow
│           └── enhanced-langchain-service.ts  # LangChain service
├── lib/
│   ├── stores/
│   │   └── agents-store.ts              # Zustand store
│   └── auth/
│       └── supabase-auth-context.tsx    # Auth context
└── components/
    └── ui/                              # Shared UI components
```

---

## Future Enhancements

### Phase 1: Enhanced UX (Q1 2025)

1. **Voice Input/Output**
   - Speech-to-text input
   - Text-to-speech responses
   - Hands-free interaction

2. **Rich Media Support**
   - Image upload and analysis
   - PDF document parsing
   - Chart and graph generation

3. **Conversation Templates**
   - Pre-built conversation flows
   - Industry-specific templates
   - Guided consultations

### Phase 2: Advanced Features (Q2 2025)

4. **Multi-Agent Handoff**
   - Seamless transfer to different expert
   - Context preservation
   - Collaborative responses

5. **Conversation Branching**
   - Explore alternative scenarios
   - Compare different approaches
   - Decision tree navigation

6. **Export & Sharing**
   - PDF report generation
   - Shareable conversation links
   - Email summaries

### Phase 3: Enterprise Features (Q3 2025)

7. **Team Collaboration**
   - Shared conversations
   - Commenting and annotations
   - Team workspaces

8. **Custom Agent Creation**
   - User-defined experts
   - Fine-tuned models
   - Private knowledge bases

9. **Advanced Analytics**
   - Conversation insights
   - Usage patterns
   - ROI tracking

### Phase 4: AI Enhancements (Q4 2025)

10. **Proactive Suggestions**
    - Auto-generated follow-ups
    - Related topic recommendations
    - Predictive queries

11. **Multi-Modal Reasoning**
    - Combined text, image, audio
    - Cross-modal understanding
    - Rich context integration

12. **Adaptive Learning**
    - Personalized responses
    - User preference learning
    - Continuous improvement

---

## Performance Optimization

### Current Metrics

- **First Contentful Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Streaming Latency**: < 200ms
- **Message Render Time**: < 100ms

### Optimization Strategies

1. **Code Splitting**: Lazy load components
2. **Memoization**: Cache expensive computations
3. **Virtualization**: Render only visible messages
4. **Debouncing**: Rate limit user input
5. **Prefetching**: Load agent data on hover
6. **Compression**: Gzip responses
7. **CDN**: Serve static assets

---

## Security Considerations

### Authentication
- Supabase Auth integration
- JWT token validation
- Session management

### Authorization
- User-scoped data access
- Role-based permissions
- API rate limiting

### Data Protection
- Encrypted data in transit (HTTPS)
- Encrypted data at rest
- PII handling compliance

### Input Validation
- XSS prevention
- SQL injection protection
- Rate limiting

---

## Monitoring & Logging

### Metrics Tracked

1. **Performance Metrics**
   - Response times
   - Token usage
   - Error rates

2. **User Behavior**
   - Conversation length
   - Agent selection patterns
   - Feature usage

3. **System Health**
   - API uptime
   - Database performance
   - Cache hit rates

### Logging Strategy

```typescript
// API logging
console.log('[Ask Expert API]', {
  timestamp: new Date().toISOString(),
  userId,
  agentId: agent.id,
  messageLength: message.length,
  sessionId,
});

// Error logging
console.error('[Ask Expert Error]', {
  error: error.message,
  stack: error.stack,
  context: { userId, agentId, sessionId },
});
```

---

## Testing Strategy

### Unit Tests
- Component rendering
- State management
- Utility functions

### Integration Tests
- API endpoint testing
- Database interactions
- Service integration

### End-to-End Tests
- Complete user flows
- Cross-browser testing
- Mobile responsiveness

### Test Coverage Goals
- Frontend: > 80%
- Backend: > 90%
- Critical paths: 100%

---

## Documentation References

### Internal Documentation
- [LangGraph Workflow Guide](./LANGGRAPH_WORKFLOW.md)
- [RAG Integration Guide](./RAG_INTEGRATION.md)
- [Agent Configuration](./AGENT_CONFIGURATION.md)

### External Resources
- [LangChain Docs](https://python.langchain.com/docs/)
- [LangGraph Docs](https://langchain-ai.github.io/langgraph/)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [Supabase Docs](https://supabase.com/docs)

---

## Changelog

### Version 1.0.0 (2025-10-24)
- ✅ Initial Ask Expert implementation
- ✅ LangGraph workflow integration
- ✅ Streaming response support
- ✅ RAG-enhanced answers
- ✅ Memory persistence
- ✅ Quick prompts feature
- ✅ Workflow progress tracking
- ✅ Comprehensive documentation

---

**Maintained by**: VITAL Expert Platform Team
**Last Updated**: 2025-10-24
**Contact**: support@vitalexpert.com

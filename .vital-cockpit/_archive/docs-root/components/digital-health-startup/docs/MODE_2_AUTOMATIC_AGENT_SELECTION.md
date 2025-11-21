# Mode 2: Automatic Agent Selection

## Overview

Mode 2 implements intelligent automatic agent selection for the Ask Expert system. When enabled, the system automatically analyzes user queries, identifies the most appropriate agent, and executes the conversation with the same interactive features as Mode 1 (RAG, Tools, chat history).

## Architecture

```
User Query → Query Analysis → Agent Search → Agent Ranking → Mode 1 Execution
```

### Key Components

1. **Agent Selector Service** (`agent-selector-service.ts`)
   - Query analysis using OpenAI
   - Pinecone semantic search for candidate agents
   - Multi-criteria agent ranking algorithm

2. **Mode 2 Handler** (`mode2-automatic-agent-selection.ts`)
   - LangGraph workflow orchestration
   - Streaming response with agent selection metadata
   - Integration with Mode 1 execution

3. **API Integration** (`/api/ask-expert/orchestrate`)
   - Routes `automatic` mode requests to Mode 2
   - Streams agent selection info to frontend

4. **Frontend Integration** (`ask-expert/page.tsx`)
   - Automatic mode toggle
   - Agent selection display in chat UI

## Features

### Automatic Agent Selection
- **Query Analysis**: Extracts intent, domains, complexity, and medical terms
- **Semantic Search**: Uses Pinecone to find relevant agents
- **Intelligent Ranking**: Scores agents on multiple criteria:
  - Semantic similarity to query
  - Domain relevance
  - Tier level preference
  - Capability matching

### Same Interactive Features as Mode 1
- **RAG Integration**: Automatic knowledge retrieval using Pinecone + Supabase
- **Tools Support**: Optional tool execution capabilities
- **Chat History**: Persistent conversation context
- **Streaming Responses**: Real-time response generation

### User Experience
- **Transparency**: Shows which agent was selected and why
- **Confidence Scoring**: Displays selection confidence percentage
- **Seamless Switching**: Toggle between Manual (Mode 1) and Automatic (Mode 2)

## Configuration

### Environment Variables

```bash
# Required for Mode 2
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=vital-knowledge
OPENAI_API_KEY=your_openai_api_key
GOOGLE_API_KEY=your_google_api_key  # For LangExtract
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

### Database Schema

The `agents` table includes all required fields:

```sql
CREATE TABLE agents (
  id UUID PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  display_name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  system_prompt TEXT NOT NULL,
  tier agent_tier NOT NULL DEFAULT 'tier_3',
  knowledge_domains TEXT[] NOT NULL DEFAULT '{}',
  capabilities TEXT[] NOT NULL DEFAULT '{}',
  embedding vector(1536), -- For Pinecone search
  metadata JSONB NOT NULL DEFAULT '{}',
  -- ... other fields
);
```

## Usage

### Frontend Toggle

Users can switch between modes using the Automatic toggle:

```typescript
// Mode 1: Manual (user selects agent)
isAutomatic: false, isAutonomous: false

// Mode 2: Automatic (orchestrator selects agent)  
isAutomatic: true, isAutonomous: false
```

### API Request

```typescript
const response = await fetch('/api/ask-expert/orchestrate', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    mode: 'automatic', // Mode 2
    message: 'I have chest pain, what should I do?',
    enableRAG: true,
    enableTools: false,
    userId: 'user-123'
  })
});
```

### Streaming Response

Mode 2 streams multiple event types:

```typescript
// Agent selection event
{
  type: 'agent_selection',
  agent: {
    id: 'agent-1',
    name: 'cardiology-expert',
    display_name: 'Cardiology Expert'
  },
  confidence: 0.92
}

// Selection reason event
{
  type: 'selection_reason',
  content: 'Selected Cardiology Expert: expertise in cardiology, highly relevant to your query',
  selectionReason: 'expertise in cardiology, highly relevant to your query'
}

// Content chunks
{
  type: 'chunk',
  content: 'Based on your symptoms...'
}

// Completion event
{
  type: 'done'
}
```

## Agent Selection Algorithm

### Step 1: Query Analysis

Uses OpenAI GPT-4 to analyze the user query:

```typescript
const analysis = await openai.chat.completions.create({
  model: 'gpt-4-turbo-preview',
  messages: [{
    role: 'system',
    content: `Analyze this medical query and extract:
      1. Primary intent (diagnosis, treatment, research, etc.)
      2. Medical domains (cardiology, oncology, etc.)
      3. Complexity level (low/medium/high)
      4. Key medical terms`
  }, {
    role: 'user',
    content: query
  }],
  response_format: { type: 'json_object' }
});
```

### Step 2: Candidate Search

Searches Pinecone for semantically similar agents:

```typescript
const searchResults = await pinecone.index('vital-knowledge').query({
  vector: queryEmbedding,
  topK: 10,
  filter: {
    knowledge_domains: { $in: detectedDomains }
  }
});
```

### Step 3: Agent Ranking

Scores agents using weighted criteria:

```typescript
const score = (
  semanticSimilarity * 0.4 +
  domainRelevance * 0.3 +
  tierPreference * 0.2 +
  capabilityMatch * 0.1
);
```

### Step 4: Mode 1 Execution

Delegates to Mode 1 handler with selected agent:

```typescript
const mode1Config = {
  agentId: selectedAgent.id,
  message: query,
  enableRAG: true,
  enableTools: false,
  selectedByOrchestrator: true
};

const response = await mode1Handler.execute(mode1Config);
```

## Performance Targets

- **Agent Selection**: < 500ms (query analysis + Pinecone search)
- **Total Response Time**: < 3s (including Mode 1 execution)
- **Agent Selection Accuracy**: > 90% relevance
- **Streaming Latency**: < 100ms first token

## Monitoring

### Selection Statistics

```typescript
const stats = {
  selectedAgent: 'Cardiology Expert',
  confidence: 0.92,
  reasoning: 'expertise in cardiology, highly relevant to your query',
  executionTime: 450,
  candidateCount: 8,
  queryAnalysis: {
    intent: 'diagnosis',
    domains: ['cardiology'],
    complexity: 'high'
  }
};
```

### Logging

Mode 2 provides comprehensive logging:

```
🎯 [Mode 2] Starting Automatic Agent Selection mode
🔍 [AgentSelector] Analyzing query for intent and domains...
✅ [AgentSelector] Query analysis complete: { intent: 'diagnosis', domains: ['cardiology'] }
🔍 [AgentSelector] Searching for candidate agents...
✅ [AgentSelector] Found 8 candidate agents
📊 [AgentSelector] Ranking 8 agents...
✅ [AgentSelector] Agent selection complete: { selectedAgent: 'Cardiology Expert', confidence: 0.92 }
🚀 [Mode 2] Executing with Mode 1 handler...
✅ [Mode 2] Execution completed in 450ms
```

## Error Handling

### Fallback Strategies

1. **Query Analysis Failure**: Falls back to generic analysis
2. **Pinecone Search Failure**: Falls back to database text search
3. **Agent Ranking Failure**: Selects first available agent
4. **Mode 1 Execution Failure**: Returns error message

### Error Recovery

```typescript
try {
  const analysis = await agentSelectorService.analyzeQuery(query);
} catch (error) {
  // Fallback analysis
  return {
    intent: 'general',
    domains: [],
    complexity: 'medium',
    confidence: 0.5
  };
}
```

## Testing

### Integration Tests

Comprehensive test suite covers:

- Query analysis accuracy
- Agent search functionality
- Ranking algorithm correctness
- Mode 1 integration
- Error handling
- Performance benchmarks

### Test Execution

```bash
# Run Mode 2 tests
npm test -- --testPathPattern=mode2-integration

# Run specific test
npm test -- --testNamePattern="should complete agent selection within performance targets"
```

### Test Coverage

- ✅ Query analysis extracts correct intent and domains
- ✅ Agent search returns relevant candidates
- ✅ Agent ranking selects best agent
- ✅ Mode 1 execution receives correct configuration
- ✅ Streaming response includes agent selection metadata
- ✅ Conversation history is maintained across turns
- ✅ Error handling works correctly
- ✅ Performance targets are met

## Troubleshooting

### Common Issues

#### 1. No Agents Found

**Symptoms**: "No agents found for the given query"

**Solutions**:
- Check Pinecone index has agent embeddings
- Verify `PINECONE_INDEX_NAME` environment variable
- Ensure agents have `knowledge_domains` populated

#### 2. Low Selection Confidence

**Symptoms**: Confidence scores consistently below 0.5

**Solutions**:
- Improve agent descriptions and system prompts
- Add more specific `knowledge_domains`
- Update agent embeddings in Pinecone

#### 3. Slow Performance

**Symptoms**: Agent selection takes > 500ms

**Solutions**:
- Check Pinecone query performance
- Optimize OpenAI API calls
- Review database query performance

#### 4. Incorrect Agent Selection

**Symptoms**: Wrong agent selected for queries

**Solutions**:
- Review agent ranking weights
- Improve query analysis prompts
- Update agent capabilities and domains

### Debug Mode

Enable debug logging:

```typescript
// Set environment variable
DEBUG_MODE_2=true

// Or in code
console.log('🔍 [Mode 2] Debug mode enabled');
```

## Future Enhancements

### Planned Features

1. **Learning from Feedback**: Improve selection based on user ratings
2. **Context Awareness**: Consider conversation history in agent selection
3. **Multi-Agent Collaboration**: Select multiple agents for complex queries
4. **Custom Selection Rules**: Allow users to define selection preferences
5. **A/B Testing**: Compare different selection algorithms

### Performance Optimizations

1. **Caching**: Cache query analysis results
2. **Batch Processing**: Process multiple queries together
3. **Edge Computing**: Deploy selection logic closer to users
4. **Model Optimization**: Use smaller, faster models for simple queries

## API Reference

### Agent Selector Service

```typescript
class AgentSelectorService {
  // Analyze query to extract intent and domains
  async analyzeQuery(query: string): Promise<QueryAnalysis>;
  
  // Search for candidate agents using Pinecone
  async findCandidateAgents(query: string, domains: string[], limit: number): Promise<Agent[]>;
  
  // Rank agents based on multiple criteria
  rankAgents(agents: Agent[], query: string, analysis: QueryAnalysis): AgentRanking[];
  
  // Complete agent selection workflow
  async selectBestAgent(query: string): Promise<AgentSelectionResult>;
}
```

### Mode 2 Handler

```typescript
class Mode2AutomaticAgentSelectionHandler {
  // Main entry point for Mode 2
  async execute(config: Mode2Config): Promise<AsyncGenerator<Mode2StreamChunk>>;
  
  // Get agent selection statistics
  getSelectionStats(result: Mode2State): SelectionStats;
}
```

### Configuration

```typescript
interface Mode2Config {
  message: string;
  conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
  enableRAG?: boolean;
  enableTools?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  userId?: string;
}
```

## Conclusion

Mode 2 provides intelligent automatic agent selection while maintaining all the interactive features of Mode 1. The system uses advanced AI techniques to analyze queries and select the most appropriate agent, providing transparency and confidence scoring to users.

The implementation is production-ready with comprehensive error handling, performance monitoring, and extensive testing coverage.

# Ask Expert Backend Integration Guide

**Date:** January 25, 2025
**Purpose:** Connect enhanced UI components with vector search backend

---

## 🔗 Integration Overview

The new UI/UX components work seamlessly with the existing RAG (Retrieval-Augmented Generation) backend powered by pgvector and the vector search functions.

### Architecture Flow

```
User Interaction (UI)
    ↓
Enhanced Mode Selector → Select consultation mode
    ↓
Expert Agent Card → Choose expert with performance stats
    ↓
Chat Input → Send query
    ↓
Backend Processing
    ↓
┌─────────────────────────────────────────────────┐
│ Vector Search Functions (PostgreSQL/pgvector)   │
│                                                  │
│ • search_knowledge_by_embedding()               │
│ • search_knowledge_for_agent()                  │
│ • hybrid_search()                               │
│ • match_user_memory_with_filters()              │
└─────────────────────────────────────────────────┘
    ↓
RAG Services (TypeScript)
    ↓
┌─────────────────────────────────────────────────┐
│ • unified-rag-service.ts                        │
│ • supabase-rag-service.ts                       │
│ • enhanced-langchain-service.ts                 │
└─────────────────────────────────────────────────┘
    ↓
LangGraph Workflow (ask-expert-graph.ts)
    ↓
Streaming Response → Enhanced Message Display
```

---

## 📊 Vector Search Function Mapping

### 1. Mode-Based Search Strategy

Each consultation mode uses different search strategies:

| Mode | Primary Function | Strategy |
|------|------------------|----------|
| **Mode 1: Quick Consensus** | `search_knowledge_by_embedding()` | Broad search across domains |
| **Mode 2: Targeted Query** | `search_knowledge_for_agent()` | Agent-optimized with relevance boost |
| **Mode 3: Interactive Chat** | `hybrid_search()` | Combines vector + full-text |
| **Mode 4: Expert Session** | `search_knowledge_for_agent()` | Deep domain-specific search |
| **Mode 5: Autonomous Workflow** | `search_knowledge_base()` | Multi-filter flexible search |

### 2. Expert Agent Performance Metrics

The `ExpertAgentCard` displays metrics that can be calculated from database queries:

```typescript
// Example: Calculate expert performance metrics
interface ExpertMetrics {
  responseTime: number;        // avg response time in seconds
  totalConsultations: number;  // count of interactions
  satisfactionScore: number;   // avg rating (0-5)
  successRate: number;         // % of successful outcomes
}

async function getExpertMetrics(agentId: string): Promise<ExpertMetrics> {
  // Query interaction_logs and user_ratings tables
  const { data } = await supabase
    .from('interaction_logs')
    .select(`
      response_time,
      success,
      user_ratings(rating)
    `)
    .eq('agent_id', agentId)
    .eq('interaction_type', 'ask_expert');

  return {
    responseTime: calculateAvg(data.map(d => d.response_time)),
    totalConsultations: data.length,
    satisfactionScore: calculateAvg(data.map(d => d.user_ratings?.rating)),
    successRate: (data.filter(d => d.success).length / data.length) * 100
  };
}
```

---

## 🎯 Integration Points

### Point 1: Enhanced Mode Selector → Backend Mode Parameter

```typescript
// In Ask Expert page
import { EnhancedModeSelector } from '@/features/ask-expert/components';

function AskExpertPage() {
  const [selectedMode, setSelectedMode] = useState('mode-1-query-automatic');

  // Map UI mode to backend parameters
  const getModeConfig = (modeId: string) => {
    const configs = {
      'mode-1-query-automatic': {
        searchFunction: 'search_knowledge_by_embedding',
        params: { domain_filter: null, max_results: 10 }
      },
      'mode-2-query-manual': {
        searchFunction: 'search_knowledge_for_agent',
        params: { max_results: 15 }
      },
      'mode-3-chat-automatic': {
        searchFunction: 'hybrid_search',
        params: { semantic_weight: 0.7, keyword_weight: 0.3 }
      },
      'mode-4-chat-manual': {
        searchFunction: 'search_knowledge_for_agent',
        params: { max_results: 20 }
      },
      'mode-5-agent-autonomous': {
        searchFunction: 'search_knowledge_base',
        params: { filters: { domain: 'all' }, match_count: 25 }
      }
    };
    return configs[modeId];
  };

  const handleSendMessage = async () => {
    const modeConfig = getModeConfig(selectedMode);

    const response = await fetch('/api/ask-expert', {
      method: 'POST',
      body: JSON.stringify({
        message: input,
        agent: selectedAgent,
        mode: selectedMode,
        searchConfig: modeConfig,
        ragEnabled: true
      })
    });
  };

  return (
    <EnhancedModeSelector
      selectedMode={selectedMode}
      onModeChange={setSelectedMode}
    />
  );
}
```

### Point 2: Expert Agent Card → Agent-Optimized Search

```typescript
// When user selects an expert via ExpertAgentCard
import { ExpertAgentCard } from '@/features/ask-expert/components';

function ExpertSelector() {
  const [selectedExpertId, setSelectedExpertId] = useState<string | null>(null);

  const handleExpertSelect = async (agentId: string) => {
    setSelectedExpertId(agentId);

    // Load agent capabilities for search optimization
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single();

    // The backend will use search_knowledge_for_agent()
    // which applies 30% relevance boost for agent's primary domain
    // and 15% boost for capabilities match
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {experts.map(expert => (
        <ExpertAgentCard
          key={expert.id}
          agent={expert}
          variant="detailed"
          isSelected={selectedExpertId === expert.id}
          onSelect={handleExpertSelect}
          showStats={true}
        />
      ))}
    </div>
  );
}
```

### Point 3: Vector Search Results → Enhanced Message Display

```typescript
// The vector search functions return source metadata
// that can be displayed in the enhanced message UI

interface SearchResult {
  chunk_id: string;
  source_id: string;
  content: string;
  similarity: number;
  source_title: string;
  domain: string;
  metadata: {
    page?: number;
    section?: string;
    author?: string;
    published_date?: string;
  };
}

// Display in message component
function MessageWithSources({ message, sources }: Props) {
  return (
    <div>
      <ReactMarkdown>{message.content}</ReactMarkdown>

      {/* Sources from vector search */}
      {sources && sources.length > 0 && (
        <div className="mt-4 border-t pt-4">
          <h4 className="text-xs font-medium mb-2">Sources</h4>
          {sources.map((source, idx) => (
            <div key={idx} className="text-xs bg-muted p-2 rounded mb-2">
              <div className="font-medium">[{idx + 1}] {source.source_title}</div>
              <div className="text-muted-foreground">
                Domain: {source.domain} •
                Similarity: {(source.similarity * 100).toFixed(1)}%
              </div>
              <div className="mt-1">{source.content.substring(0, 150)}...</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

---

## 🔍 Vector Search Function Usage Examples

### Example 1: Mode 1 - Quick Consensus (Broad Search)

```typescript
// Backend: ask-expert-graph.ts
async function retrieveContext(state: AskExpertState) {
  const { data } = await supabase.rpc('search_knowledge_by_embedding', {
    query_embedding: await getEmbedding(state.question),
    domain_filter: null,  // Search across all domains
    embedding_model: 'openai',
    max_results: 10,
    similarity_threshold: 0.7
  });

  return {
    context: data.map(r => r.content).join('\n\n'),
    sources: data
  };
}
```

### Example 2: Mode 2 - Targeted Query (Agent-Optimized)

```typescript
async function retrieveContextForAgent(state: AskExpertState) {
  const { data } = await supabase.rpc('search_knowledge_for_agent', {
    agent_id_param: state.agentId,
    query_text_param: state.question,
    query_embedding_param: await getEmbedding(state.question),
    max_results: 15
  });

  // Results include relevance_boost based on agent's domain
  return {
    context: data.map(r => r.content).join('\n\n'),
    sources: data.map(r => ({
      ...r,
      boosted: r.relevance_boost > r.similarity  // Highlight boosted results
    }))
  };
}
```

### Example 3: Mode 3 - Interactive Chat (Hybrid Search)

```typescript
async function hybridRetrieve(state: AskExpertState) {
  const { data } = await supabase.rpc('hybrid_search', {
    query_embedding: await getEmbedding(state.question),
    query_text: state.question,
    domain_filter: state.agent.metadata?.primary_domain,
    max_results: 12,
    semantic_weight: 0.7,  // 70% vector similarity
    keyword_weight: 0.3    // 30% keyword match
  });

  // Returns combined scores
  return {
    context: data.map(r => r.content).join('\n\n'),
    sources: data.map(r => ({
      ...r,
      semantic_score: r.semantic_score,
      keyword_score: r.keyword_score,
      combined_score: r.combined_score
    }))
  };
}
```

### Example 4: User Memory Integration

```typescript
async function retrieveUserContext(userId: string, query: string) {
  const { data } = await supabase.rpc('match_user_memory_with_filters', {
    query_embedding: await getEmbedding(query),
    match_user_id: userId,
    category_filter: 'preferences',  // or null for all
    match_threshold: 0.7,
    match_count: 5
  });

  // Personalize responses based on user history
  return {
    userPreferences: data,
    personalizedContext: data.map(m => m.content).join('\n')
  };
}
```

---

## 📈 Performance Monitoring

### Track Search Performance Metrics

```typescript
interface SearchMetrics {
  mode: string;
  searchFunction: string;
  resultsCount: number;
  avgSimilarity: number;
  searchTimeMs: number;
  cacheHit: boolean;
}

async function trackSearchMetrics(metrics: SearchMetrics) {
  await supabase.from('search_metrics').insert({
    ...metrics,
    timestamp: new Date().toISOString()
  });
}
```

### Monitor Mode Effectiveness

```sql
-- Query to analyze mode performance
SELECT
  mode,
  COUNT(*) as usage_count,
  AVG(response_time_ms) as avg_response_time,
  AVG(user_satisfaction) as avg_satisfaction,
  AVG(results_used / results_retrieved) as result_utilization
FROM interaction_logs
WHERE interaction_type = 'ask_expert'
  AND created_at > NOW() - INTERVAL '30 days'
GROUP BY mode
ORDER BY usage_count DESC;
```

---

## 🚀 Deployment Checklist

### Database Migration
- [x] Vector search functions created (20250125000000_create_missing_vector_search_functions.sql)
- [x] Indexes created for optimal performance
- [x] Permissions granted (authenticated, anon roles)

### Backend Integration
- [ ] Update ask-expert-graph.ts to use mode-specific search strategies
- [ ] Add expert metrics calculation queries
- [ ] Implement search result caching
- [ ] Add performance monitoring

### Frontend Integration
- [x] EnhancedModeSelector component created
- [x] ExpertAgentCard component created
- [ ] Update Ask Expert page to use new components
- [ ] Connect mode selection to backend API
- [ ] Display expert performance metrics
- [ ] Show search sources in message display

### Testing
- [ ] Test each mode's search function
- [ ] Verify relevance boosting for agent searches
- [ ] Test hybrid search weights
- [ ] Validate user memory filtering
- [ ] Performance testing under load

---

## 🔧 Configuration

### Environment Variables Required

```env
# Already configured
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
OPENAI_API_KEY=your_openai_key

# Vector search configuration (optional)
VECTOR_SEARCH_DEFAULT_THRESHOLD=0.7
VECTOR_SEARCH_MAX_RESULTS=10
HYBRID_SEARCH_SEMANTIC_WEIGHT=0.7
HYBRID_SEARCH_KEYWORD_WEIGHT=0.3
```

### Search Function Defaults

```typescript
export const SEARCH_DEFAULTS = {
  similarity_threshold: 0.7,
  max_results: 10,
  semantic_weight: 0.7,
  keyword_weight: 0.3,
  domain_boost: 1.3,
  capability_boost: 1.15
} as const;
```

---

## 📚 Additional Resources

- [Vector Search Functions SQL](../database/sql/migrations/2025/20250125000000_create_missing_vector_search_functions.sql)
- [Enhanced LangChain Service](../src/features/chat/services/enhanced-langchain-service.ts)
- [Ask Expert Graph](../src/features/chat/services/ask-expert-graph.ts)
- [Supabase RAG Service](../src/features/chat/services/supabase-rag-service.ts)

---

**Last Updated:** January 25, 2025
**Maintained By:** VITAL Backend Team

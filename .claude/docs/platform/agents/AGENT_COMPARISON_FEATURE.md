# Agent Comparison Feature

## Overview

The Agent Comparison feature enables multi-criteria comparison of 2-3 agents using the AgentOS 5-level hierarchy, vector similarity (pgvector/Pinecone), and GraphRAG-style recommendations.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        Agent Comparison System                          │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌───────────────┐    ┌───────────────┐    ┌───────────────┐          │
│  │ AgentComparison│    │ComparisonSidebar│  │ Compare API   │          │
│  │   Component   │────▶│   + Context    │───▶│   /api/agents │          │
│  │               │    │                │    │   /compare    │          │
│  └───────────────┘    └───────────────┘    └───────────────┘          │
│         │                     │                    │                   │
│         ▼                     ▼                    ▼                   │
│  ┌─────────────────────────────────────────────────────────────┐      │
│  │                   Hybrid Search Engine                       │      │
│  │                                                              │      │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │      │
│  │  │  PostgreSQL  │  │   Pinecone   │  │    Neo4j     │      │      │
│  │  │  Full-Text   │  │   Vectors    │  │    Graph     │      │      │
│  │  │    (30%)     │  │    (50%)     │  │    (20%)     │      │      │
│  │  └──────────────┘  └──────────────┘  └──────────────┘      │      │
│  └─────────────────────────────────────────────────────────────┘      │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. AgentComparison (`agent-comparison.tsx`)

**Location:** `apps/vital-system/src/features/agents/components/agent-comparison.tsx`

**Features:**
- Multi-agent side-by-side comparison (2-3 agents)
- Radar chart visualization using Recharts
- 5-level hierarchy visualization with spawning rules
- Cost/model/capability comparison table
- Capability overlap analysis

**Usage:**
```tsx
import { AgentComparison } from '@/features/agents/components';

<AgentComparison
  agents={selectedAgents}
  onRemoveAgent={(id) => removeAgent(id)}
  onAddAgent={() => openAgentPicker()}
  onSelectWinner={(agent) => selectAgent(agent)}
  maxAgents={3}
  showHierarchy
  showSimilarity
/>
```

### 2. AgentComparisonSidebar (`agent-comparison-sidebar.tsx`)

**Location:** `apps/vital-system/src/features/agents/components/agent-comparison-sidebar.tsx`

**Features:**
- Floating compare button with agent count badge
- Slide-out Sheet panel
- Context provider for global comparison state
- GraphRAG similar agent suggestions
- Compare button component for agent cards

**Context API:**
```tsx
import {
  AgentComparisonProvider,
  useAgentComparison,
  CompareButton
} from '@/features/agents/components';

// In layout
<AgentComparisonProvider maxAgents={3}>
  <AgentComparisonSidebar />
  {children}
</AgentComparisonProvider>

// In agent cards
const { addToComparison, isInComparison } = useAgentComparison();
<CompareButton agent={agent} />
```

### 3. Compare API (`/api/agents/compare`)

**Location:** `apps/vital-system/src/app/api/agents/compare/route.ts`

**Endpoints:**

#### POST - Multi-action endpoint
```typescript
// Find similar agents
POST /api/agents/compare
{ action: 'similar', agentId: 'uuid', limit: 5 }

// Compare specific agents
POST /api/agents/compare
{ action: 'compare', agentIds: ['uuid1', 'uuid2', 'uuid3'] }

// Recommend agents for query
POST /api/agents/compare
{ action: 'recommend', query: 'FDA regulatory expert', limit: 5 }
```

#### GET - Quick comparison
```typescript
GET /api/agents/compare?agentIds=uuid1,uuid2,uuid3
```

**Response:**
```json
{
  "success": true,
  "agents": [
    {
      "id": "uuid",
      "name": "FDA Regulatory Expert",
      "tier": 2,
      "metrics": {
        "relevance": 85,
        "performance": 90,
        "coverage": 75,
        "regulatory": 95,
        "popularity": 70,
        "freshness": 88
      },
      "overallScore": 85.5
    }
  ],
  "winner": {...}
}
```

## Multi-Criteria Metrics

| Metric | Weight | Description |
|--------|--------|-------------|
| Relevance | 25% | Match to user query/intent |
| Performance | 20% | Historical accuracy score |
| Coverage | 15% | Domain/capability breadth |
| Regulatory | 20% | HIPAA/GDPR/Audit compliance |
| Popularity | 10% | Usage frequency |
| Freshness | 10% | Recent validation date |

## AgentOS 5-Level Integration

The comparison visualizes agents within the 5-level hierarchy:

| Level | Name | Model | Cost | Can Spawn |
|-------|------|-------|------|-----------|
| L1 | Master | GPT-4 | $0.35 | L2, L3, L4, L5 |
| L2 | Expert | GPT-4 | $0.25 | L3, L4, L5 |
| L3 | Specialist | GPT-4 | $0.12 | L4, L5 |
| L4 | Worker | GPT-3.5 | $0.015 | L5 |
| L5 | Tool | GPT-3.5 | $0.005 | None |

## Score Fusion Weights

From GraphRAG integration:
- **PostgreSQL** (full-text): 30%
- **Pinecone** (vectors): 50%
- **Neo4j** (graph): 20%

## Design Tokens

Colors for each level (from `design-tokens.ts`):
- L1 Master: Purple (#8B5CF6)
- L2 Expert: Blue (#3B82F6)
- L3 Specialist: Green (#10B981)
- L4 Worker: Orange (#F59E0B)
- L5 Tool: Gray (#6B7280)

## Integration Points

### With AgentsBoard
```tsx
// Add compare button to EnhancedAgentCard actions
<CompareButton agent={agent} variant="icon" />
```

### With GraphRAG Services
```typescript
// Fetch similar agents via vector similarity
const similar = await fetch('/api/agents/compare', {
  method: 'POST',
  body: JSON.stringify({ action: 'similar', agentId: agent.id })
});
```

### With Agent Detail Modal
```tsx
// Add to comparison from modal
const { addToComparison, openSidebar } = useAgentComparison();
<Button onClick={() => { addToComparison(agent); openSidebar(); }}>
  Compare
</Button>
```

## Future Enhancements

1. **Real-time Pinecone Integration** - Use actual vector embeddings
2. **Neo4j Graph Traversal** - Relationship-based agent discovery
3. **A/B Testing Mode** - Compare agent responses in real-time
4. **Historical Performance Charts** - Time-series metrics
5. **Team Composition Builder** - Build agent teams for complex tasks

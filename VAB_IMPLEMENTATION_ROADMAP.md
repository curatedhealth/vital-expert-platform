# Virtual Advisory Board Implementation Roadmap
## Aligning Guide v2.0 with Current LangGraph Implementation

---

## Current Status

### ✅ What We Have Built

1. **LangGraph Orchestrator** ([langgraph-orchestrator.ts](src/lib/services/langgraph-orchestrator.ts))
   - State machine architecture
   - 4 built-in patterns (Parallel, Sequential, Debate, Funnel)
   - Pattern builder interface
   - Custom pattern support

2. **Pattern Library UI** ([pattern-library.tsx](src/app/(app)/ask-panel/components/pattern-library.tsx))
   - Visual pattern gallery
   - Pattern builder interface
   - Export/import functionality

3. **Frontend Integration** ([page.tsx](src/app/(app)/ask-panel/page.tsx))
   - Board archetype selection (7 types)
   - Fusion model selection (5 models)
   - Orchestration mode selector
   - Domain/subdomain/use-case flow

---

## Gap Analysis: Guide v2.0 vs Current Implementation

### Missing Features from Guide

| Feature | Guide Requirement | Current Status | Priority |
|---------|------------------|----------------|----------|
| **Automatic Board Composition** | AI analyzes query → suggests experts | ❌ Not implemented | 🔴 High |
| **Weighted Voting System** | Each member has voting weight | ❌ Not implemented | 🔴 High |
| **Structured Discussion (4 rounds)** | Opening → Evidence → Challenge → Final | ⚠️ Partial (debate mode only) | 🔴 High |
| **Open Discussion Format** | Dynamic, time-based turns | ❌ Not implemented | 🟡 Medium |
| **Debate Format** | Pro/Con teams with moderator | ⚠️ Partial (basic debate) | 🟡 Medium |
| **Consensus Detection** | Semantic alignment analysis | ❌ Not implemented | 🔴 High |
| **User Private Library** | Save custom boards/agents | ❌ Not implemented | 🟢 Low |
| **Board Templates Store** | Pre-configured boards | ❌ Not implemented | 🟢 Low |
| **Dynamic Board Adjustment** | Add/remove members mid-session | ❌ Not implemented | 🟡 Medium |
| **Chair/Moderator Role** | Special agent orchestrating discussion | ❌ Not implemented | 🟡 Medium |

---

## Implementation Plan

### Phase 1: Core VAB Features (Week 1-2) 🔴

#### 1.1 Automatic Board Composition

**Guide Requirement (Section 3.2):**
```python
# Automatic composition based on query analysis
topic_analysis → extract_requirements → match_agents → compose_board
```

**Implementation:**
```typescript
// File: src/lib/services/board-composer.ts

export class AutomaticBoardComposer {
  async analyzeTopic(question: string): Promise<BoardRequirements> {
    // Use LLM to analyze question and extract:
    // - Domain (clinical, regulatory, market)
    // - Complexity level (low, medium, high)
    // - Stakeholders needed
    // - Required expertise areas
  }

  async composeBoard(requirements: BoardRequirements): Promise<BoardMember[]> {
    // Match requirements to available agents
    // Score agents by capability match
    // Select 5-7 top matches
    // Assign roles and voting weights
  }
}
```

#### 1.2 Weighted Voting System

**Guide Requirement (Section 6.2):**
```python
weighted_majority_vote(votes, weights)
consensus_threshold_vote(positions, threshold=0.7)
```

**Implementation:**
```typescript
// Add to langgraph-orchestrator.ts

interface VotingConfig {
  weights: Map<string, number>;  // persona → weight
  threshold: number;              // 0.0 - 1.0
}

class VotingSystem {
  calculateWeightedConsensus(
    replies: AgentReply[],
    weights: Map<string, number>
  ): {
    consensusScore: number;
    alignedPositions: string[];
    dissentingPositions: string[];
  }
}
```

#### 1.3 Structured 4-Round Discussion

**Guide Requirement (Section 4.1):**
```
Round 1: Opening Statements (Parallel)
Round 2: Evidence Presentation (Sequential)
Round 3: Challenge & Response (Interactive)
Round 4: Final Positions (Parallel)
```

**Implementation:**
```typescript
// New pattern in langgraph-orchestrator.ts

patterns.set('structured-4-round', {
  id: 'structured-4-round',
  name: 'Structured 4-Round Discussion',
  nodes: [
    { id: 'opening', type: 'consult_parallel', label: 'Round 1: Opening Statements' },
    { id: 'evidence', type: 'consult_sequential', label: 'Round 2: Evidence Presentation' },
    { id: 'challenge', type: 'interactive_challenge', label: 'Round 3: Challenge & Response' },
    { id: 'final', type: 'consult_parallel', label: 'Round 4: Final Positions' },
    { id: 'synthesize', type: 'synthesize', label: 'Synthesize' }
  ],
  edges: [
    { from: 'opening', to: 'evidence' },
    { from: 'evidence', to: 'challenge' },
    { from: 'challenge', to: 'final' },
    { from: 'final', to: 'synthesize' },
    { from: 'synthesize', to: 'END' }
  ]
});
```

---

### Phase 2: Advanced Consensus Features (Week 3) 🟡

#### 2.1 Semantic Consensus Detection

**Guide Requirement (Section 6.1):**
```
Semantic Analysis → Position Clustering → Weighted Consensus Score
```

**Implementation:**
```typescript
// File: src/lib/services/consensus-detector.ts

import { embeddings } from '@langchain/openai';

export class ConsensusDetector {
  async analyzePositions(replies: AgentReply[]): Promise<ConsensusAnalysis> {
    // 1. Generate embeddings for each response
    const embeddings = await this.generateEmbeddings(replies.map(r => r.text));

    // 2. Cluster similar positions
    const clusters = this.clusterBySemanticSimilarity(embeddings);

    // 3. Calculate alignment scores
    const alignmentScores = this.calculateClusterAlignment(clusters);

    // 4. Determine consensus level
    const consensusLevel = this.determineConsensusLevel(alignmentScores);

    return {
      clusters,
      alignmentScores,
      consensusLevel,
      majorityPosition: clusters[0], // Largest cluster
      dissentingPositions: clusters.slice(1)
    };
  }
}
```

#### 2.2 Interactive Challenge Node

**Guide Requirement (Section 4.1 - Round 3):**
```
A1 ←→ A3
   ↘ ↙
    A2      Dynamic interaction patterns
   ↗ ↖
A4 ←→ A5
```

**Implementation:**
```typescript
// New node type for langgraph-orchestrator.ts

private async interactiveChallengeNode(state: OrchestrationState) {
  const previousReplies = Array.from(state.replies.values());
  const challenges: AgentReply[] = [];

  // Each agent challenges another's position
  for (let i = 0; i < state.personas.length; i++) {
    const challenger = state.personas[i];
    const targetIdx = (i + 1) % state.personas.length;
    const target = previousReplies[targetIdx];

    const challengePrompt = `
      ${target.persona} stated: "${target.text.slice(0, 200)}..."

      As ${challenger}, please:
      1. Identify any concerns or gaps in this position
      2. Ask clarifying questions
      3. Propose alternative perspectives
    `;

    const challengeReply = await this.runExpert(
      challenger,
      challengePrompt,
      state.evidenceSources,
      state.currentRound + 1
    );

    challenges.push(challengeReply);
  }

  return {
    replies: new Map(challenges.map(r => [r.persona, r])),
    currentRound: state.currentRound + 1
  };
}
```

---

### Phase 3: User Library & Templates (Week 4) 🟢

#### 3.1 User Private Library

**Guide Requirement (Section 11):**
```
User can save:
- Custom agents
- Custom board templates
- Session history
- Performance metrics
```

**Implementation:**

**Database Schema:**
```sql
-- File: supabase/migrations/20251004_user_library.sql

CREATE TABLE user_custom_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  base_agent_type TEXT,
  customizations JSONB,
  performance_metrics JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_board_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  description TEXT,
  members JSONB NOT NULL, -- Array of agent configs
  discussion_rules JSONB,
  is_public BOOLEAN DEFAULT FALSE,
  usage_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE user_board_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  template_id UUID REFERENCES user_board_templates(id),
  question TEXT NOT NULL,
  transcript JSONB,
  recommendations JSONB,
  consensus_score DECIMAL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**API Routes:**
```typescript
// File: src/app/api/user/boards/route.ts

// GET /api/user/boards - List user's saved boards
// POST /api/user/boards - Save new board template
// GET /api/user/boards/{id} - Get board details
// DELETE /api/user/boards/{id} - Delete board

// File: src/app/api/user/agents/route.ts

// GET /api/user/agents - List custom agents
// POST /api/user/agents - Create custom agent
```

#### 3.2 Board Templates Store

**Guide Requirement (Section 12):**
```
Marketplace with:
- Featured boards
- Categories (Digital Health, Market Access, etc.)
- Ratings and reviews
- Usage statistics
```

**Implementation:**
```typescript
// File: src/app/(app)/board-store/page.tsx

export default function BoardStorePage() {
  return (
    <div>
      <h1>Virtual Advisory Board Store</h1>

      {/* Featured Boards */}
      <section>
        <h2>Featured Boards</h2>
        {featuredBoards.map(board => (
          <BoardCard
            name={board.name}
            description={board.description}
            rating={board.averageRating}
            usageCount={board.sessionsCount}
            members={board.members.length}
            onAddToLibrary={() => addToUserLibrary(board)}
          />
        ))}
      </section>

      {/* Categories */}
      <section>
        <h2>Browse by Category</h2>
        <CategoryFilter />
      </section>
    </div>
  );
}
```

---

## Quick Wins (Can Implement Immediately)

### 1. Add Voting Weights to Current System

**Update Ask Panel UI:**
```typescript
// In ask-panel/page.tsx
const [votingWeights, setVotingWeights] = useState<Map<string, number>>(new Map());

// Add weight selector for each panel member
{panelAgents.map(agent => (
  <div>
    <span>{agent.name}</span>
    <input
      type="number"
      min="0.5"
      max="2.0"
      step="0.1"
      value={votingWeights.get(agent.id) || 1.0}
      onChange={(e) => setVotingWeights(prev =>
        new Map(prev).set(agent.id, parseFloat(e.target.value))
      )}
    />
  </div>
))}
```

### 2. Add Structured 4-Round Pattern

Just add the pattern definition to `initializeBuiltInPatterns()`:

```typescript
patterns.set('structured', {
  id: 'structured',
  name: 'Structured 4-Round Discussion',
  description: 'Opening → Evidence → Challenge → Final positions',
  icon: '📋',
  nodes: [
    { id: 'round1', type: 'consult_parallel', label: 'Opening Statements' },
    { id: 'round2', type: 'consult_sequential', label: 'Evidence Presentation' },
    { id: 'round3', type: 'consult_parallel', label: 'Challenge Round' },
    { id: 'round4', type: 'consult_parallel', label: 'Final Positions' },
    { id: 'synthesize', type: 'synthesize', label: 'Synthesize' }
  ],
  edges: [
    { from: 'round1', to: 'round2' },
    { from: 'round2', to: 'round3' },
    { from: 'round3', to: 'round4' },
    { from: 'round4', to: 'synthesize' },
    { from: 'synthesize', to: 'END' }
  ],
  config: { maxRounds: 4 }
});
```

---

## Summary: Immediate Next Steps

1. ✅ **Already Complete:**
   - LangGraph state machine
   - Basic patterns (parallel, sequential, debate, funnel)
   - Pattern builder UI
   - Frontend archetype/fusion model selection

2. 🔴 **High Priority (Implement Now):**
   - Add voting weights to panel members
   - Add structured 4-round discussion pattern
   - Implement basic consensus scoring
   - Add automatic board composition (AI-driven)

3. 🟡 **Medium Priority (Next Sprint):**
   - Semantic consensus detection with embeddings
   - Interactive challenge node
   - Dynamic board adjustment
   - Chair/moderator role

4. 🟢 **Low Priority (Future):**
   - User private library (database + UI)
   - Board templates store (marketplace)
   - Performance analytics

---

## Access Pattern Library Now

Go to **http://localhost:3000/patterns** to:
- View all built-in patterns
- Create custom patterns
- Export/import patterns
- See visual workflow graphs

The LangGraph orchestration backend is fully wired and ready!

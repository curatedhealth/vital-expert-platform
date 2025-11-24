# = Agent Orchestrator Analysis & Recommendations

## Executive Summary

**Current State**: You have TWO orchestrators working independently:
1. **ExpertOrchestrator** (`expert-orchestrator.ts`) - Panel-based, keyword matching
2. **EnhancedAgentOrchestrator** (`enhanced-agent-orchestrator.ts`) - Tool-based, individual agents

**Recommendation**: **Use PostgreSQL + RAG Hybrid** for automatic agent selection, integrate with your existing enhanced orchestrator.

---

## =Ê Current Implementation Analysis

### **1. Expert Orchestrator** (`expert-orchestrator.ts`)

#### **Agent Selection Logic**
```typescript
// Current: Keyword-based matching
private async analyzeExpertiseNeeds(query: string): Promise<string[]> {
  const keywords = query.toLowerCase().split(' ');
  const requiredExpertise: string[] = [];

  // Keyword matching
  if (keywords.includes('clinical')) {
    requiredExpertise.push('Clinical Medicine');
  }
  if (keywords.includes('fda')) {
    requiredExpertise.push('Regulatory Affairs');
  }
  // ... more keyword matching

  return requiredExpertise;
}

// Then match experts
private async matchExperts(requiredExpertise: string[]): Promise<ExpertAgent[]> {
  return this.expertLibrary.filter(expert =>
    expert.expertise.primary.some(exp =>
      requiredExpertise.some(req =>
        exp.toLowerCase().includes(req.toLowerCase())
      )
    )
  );
}
```

#### ** Strengths**
- Multi-agent panel approach
- Consensus mechanism
- Performance tracking (avgRating, consensusRate)
- Structured facilitation phases

#### **  Weaknesses**
1. **Hardcoded keyword matching** - Brittle, misses semantic meaning
2. **Static expert library** - Only 2 hardcoded experts
3. **No database integration** - Not using your 254 agents
4. **No RAG context** - Basic keyword analysis
5. **No knowledge domain filtering** - Missing tier-based selection

---

### **2. Enhanced Agent Orchestrator** (`enhanced-agent-orchestrator.ts`)

#### **Agent Selection Logic**
```typescript
// Currently: No automatic selection!
// Agent must be pre-selected by agentId
async chat(params: {
  agentId: string,  // <-- REQUIRED, no auto-selection
  message: string,
  // ...
})
```

#### ** Strengths**
- **Tool integration** - 13 specialized tools from database
- **Citation extraction** - PubMed, FDA, ICH, ISO
- **Confidence scoring** - Evidence-based
- **Thinking steps** - Transparent reasoning
- **Tool usage logging** - Performance tracking
- **Streaming support** - Real-time responses

#### **  Weaknesses**
1. **No agent selection** - Requires pre-selected agentId
2. **Missing automatic mode** - Can't choose best agent for query
3. **No panel support** - Single agent only

---

## <¯ Recommended Solution: Hybrid Approach

### **Architecture: PostgreSQL + RAG + Enhanced Orchestrator**

```typescript
class AutomaticAgentOrchestrator {
  /**
   * Step 1: PostgreSQL Filtering (Fast, Structured)
   */
  private async filterCandidateAgents(query: string): Promise<Agent[]> {
    // Extract domains from query
    const detectedDomains = await this.detectKnowledgeDomains(query);

    // PostgreSQL query with knowledge domains
    const { data } = await supabase
      .from('agents')
      .select('*')
      .overlaps('knowledge_domains', detectedDomains)
      .eq('status', 'active')
      .lte('tier', 2)  // Only Tier 1 & 2 for critical queries
      .order('tier', { ascending: true })
      .order('priority', { ascending: true })
      .limit(10);

    return data || [];
  }

  /**
   * Step 2: RAG Semantic Ranking (Accurate)
   */
  private async rankAgentsByRelevance(
    query: string,
    candidates: Agent[]
  ): Promise<Agent[]> {
    // Embed query
    const queryEmbedding = await this.embedQuery(query);

    // Score each agent by semantic similarity
    const scored = await Promise.all(
      candidates.map(async (agent) => {
        // Embed agent profile (system_prompt + capabilities + knowledge_domains)
        const agentProfile = `${agent.system_prompt} ${agent.capabilities.join(' ')} ${agent.knowledge_domains.join(' ')}`;
        const agentEmbedding = await this.embedText(agentProfile);

        // Cosine similarity
        const similarity = this.cosineSimilarity(queryEmbedding, agentEmbedding);

        return {
          agent,
          relevanceScore: similarity,
          reasoning: this.generateReasoningForSelection(agent, query)
        };
      })
    );

    // Sort by relevance
    return scored
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(s => s.agent);
  }

  /**
   * Step 3: Multi-Agent Panel Selection (Optional)
   */
  private async selectPanel(
    query: string,
    rankedAgents: Agent[]
  ): Promise<Agent[]> {
    // For complex queries, select diverse panel
    const queryComplexity = await this.assessComplexity(query);

    if (queryComplexity === 'high' || queryComplexity === 'very-high') {
      // Select 3-5 agents with diverse knowledge domains
      return this.selectDiversePanel(rankedAgents, {
        minAgents: 3,
        maxAgents: 5,
        diversityThreshold: 0.7
      });
    }

    // For simple queries, return top agent
    return [rankedAgents[0]];
  }

  /**
   * Main orchestration method
   */
  async orchestrate(query: string, mode: 'auto' | 'panel' = 'auto'): Promise<OrchestratorResponse> {
    // Step 1: Filter candidates (PostgreSQL)
    const candidates = await this.filterCandidateAgents(query);

    if (candidates.length === 0) {
      throw new Error('No suitable agents found for this query');
    }

    // Step 2: Rank by relevance (RAG)
    const rankedAgents = await this.rankAgentsByRelevance(query, candidates);

    // Step 3: Select agent(s)
    const selectedAgents = mode === 'panel'
      ? await this.selectPanel(query, rankedAgents)
      : [rankedAgents[0]];

    // Step 4: Execute with Enhanced Orchestrator
    if (selectedAgents.length === 1) {
      // Single agent mode
      return await this.enhancedOrchestrator.chat({
        agentId: selectedAgents[0].id,
        message: query,
        conversationHistory: []
      });
    } else {
      // Panel mode (integrate with ExpertOrchestrator)
      return await this.expertOrchestrator.facilitateSession({
        id: `panel-${Date.now()}`,
        experts: selectedAgents.map(a => this.convertToExpertAgent(a)),
        sessionType: 'ADVISORY',
        facilitationStrategy: this.selectFacilitationStrategy('ADVISORY')
      }, 'ADVISORY');
    }
  }
}
```

---

## =' Implementation Steps

### **Phase 1: Domain Detection** (Week 1)

```typescript
// Create domain detector service
class KnowledgeDomainDetector {
  async detectDomains(query: string): Promise<string[]> {
    // Method 1: Keyword mapping
    const keywordDomains = this.detectByKeywords(query);

    // Method 2: RAG similarity to domain descriptions
    const ragDomains = await this.detectByRAG(query);

    // Combine and deduplicate
    return [...new Set([...keywordDomains, ...ragDomains])];
  }

  private detectByKeywords(query: string): string[] {
    const keywords = query.toLowerCase();
    const detected: string[] = [];

    // Regulatory
    if (/fda|ema|regulatory|approval|submission|510k|pma/.test(keywords)) {
      detected.push('regulatory_affairs');
    }

    // Clinical
    if (/clinical|trial|patient|treatment|protocol/.test(keywords)) {
      detected.push('clinical_development');
    }

    // Safety
    if (/safety|adverse|side effect|pharmacovigilance/.test(keywords)) {
      detected.push('pharmacovigilance');
    }

    // Digital Health
    if (/digital|software|samd|app|mobile health/.test(keywords)) {
      detected.push('digital_health');
    }

    return detected;
  }

  private async detectByRAG(query: string): Promise<string[]> {
    // Get all knowledge domains
    const { data: domains } = await supabase
      .from('knowledge_domains')
      .select('slug, description, keywords')
      .eq('is_active', true);

    // Embed query
    const queryEmbedding = await embeddings.embedQuery(query);

    // Score each domain
    const scored = await Promise.all(
      domains.map(async (domain) => {
        const domainText = `${domain.description} ${domain.keywords.join(' ')}`;
        const domainEmbedding = await embeddings.embedQuery(domainText);
        const similarity = cosineSimilarity(queryEmbedding, domainEmbedding);

        return { slug: domain.slug, similarity };
      })
    );

    // Return domains above threshold
    return scored
      .filter(s => s.similarity > 0.6)
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, 3)
      .map(s => s.slug);
  }
}
```

### **Phase 2: Agent Ranking** (Week 2)

```typescript
class AgentRanker {
  async rankAgents(query: string, candidates: Agent[]): Promise<RankedAgent[]> {
    const queryEmbedding = await this.embedQuery(query);

    const ranked = await Promise.all(
      candidates.map(async (agent) => {
        // Create agent profile for embedding
        const profile = this.createAgentProfile(agent);
        const profileEmbedding = await this.embedText(profile);

        // Calculate scores
        const semanticScore = this.cosineSimilarity(queryEmbedding, profileEmbedding);
        const tierScore = this.calculateTierScore(agent.tier);
        const performanceScore = this.calculatePerformanceScore(agent);

        // Weighted combination
        const finalScore =
          semanticScore * 0.5 +
          tierScore * 0.3 +
          performanceScore * 0.2;

        return {
          agent,
          semanticScore,
          tierScore,
          performanceScore,
          finalScore,
          reasoning: this.explainScoring(agent, {
            semanticScore,
            tierScore,
            performanceScore
          })
        };
      })
    );

    return ranked.sort((a, b) => b.finalScore - a.finalScore);
  }

  private createAgentProfile(agent: Agent): string {
    return `
      Name: ${agent.name}
      Role: ${agent.role}
      Expertise: ${agent.knowledge_domains.join(', ')}
      Capabilities: ${agent.capabilities.join(', ')}
      System Prompt: ${agent.system_prompt}
      Business Function: ${agent.business_function}
      Department: ${agent.department}
    `.trim();
  }

  private calculateTierScore(tier: number): number {
    // Tier 1 = 1.0, Tier 2 = 0.8, Tier 3 = 0.6
    return Math.max(0, 1.2 - (tier * 0.2));
  }

  private calculatePerformanceScore(agent: Agent): number {
    // Based on usage metrics (would need to track)
    // For now, use metadata or defaults
    return agent.metadata?.performance_score || 0.8;
  }
}
```

### **Phase 3: Integration** (Week 3)

```typescript
// src/features/chat/services/automatic-orchestrator.ts
export class AutomaticOrchestrator {
  constructor(
    private domainDetector: KnowledgeDomainDetector,
    private agentRanker: AgentRanker,
    private enhancedOrchestrator: EnhancedAgentOrchestrator,
    private expertOrchestrator: ExpertOrchestrator
  ) {}

  async chat(params: {
    query: string;
    mode?: 'auto' | 'single' | 'panel';
    conversationHistory?: any[];
    userId?: string;
    conversationId?: string;
  }) {
    const { query, mode = 'auto', conversationHistory = [], userId, conversationId } = params;

    // Step 1: Detect knowledge domains
    const detectedDomains = await this.domainDetector.detectDomains(query);
    console.log(' Detected domains:', detectedDomains);

    // Step 2: Filter candidate agents (PostgreSQL)
    const candidates = await this.filterAgentsByDomains(detectedDomains);
    console.log(` Found ${candidates.length} candidate agents`);

    if (candidates.length === 0) {
      return this.handleNoAgentsFound(query);
    }

    // Step 3: Rank agents (RAG)
    const ranked = await this.agentRanker.rankAgents(query, candidates);
    console.log(' Top 3 agents:', ranked.slice(0, 3).map(r => ({
      name: r.agent.name,
      score: r.finalScore
    })));

    // Step 4: Select mode
    const selectedMode = mode === 'auto'
      ? await this.determineMode(query, ranked)
      : mode;

    // Step 5: Execute
    if (selectedMode === 'single') {
      const topAgent = ranked[0].agent;
      return await this.enhancedOrchestrator.chat({
        agentId: topAgent.id,
        message: query,
        conversationHistory,
        conversationId,
        userId
      });
    } else {
      // Panel mode
      const panelAgents = this.selectDiversePanel(ranked, 3, 5);
      return await this.expertOrchestrator.facilitateSession({
        id: `panel-${Date.now()}`,
        experts: panelAgents.map(r => this.convertToExpertAgent(r.agent)),
        sessionType: 'ADVISORY',
        facilitationStrategy: this.selectFacilitationStrategy('ADVISORY')
      }, 'ADVISORY');
    }
  }

  private async filterAgentsByDomains(domains: string[]): Promise<Agent[]> {
    const { data } = await supabase
      .from('agents')
      .select('*')
      .overlaps('knowledge_domains', domains)
      .eq('status', 'active')
      .lte('tier', 2)
      .order('tier')
      .order('priority')
      .limit(20);

    return data || [];
  }

  private async determineMode(query: string, ranked: RankedAgent[]): Promise<'single' | 'panel'> {
    // Simple heuristics
    const queryLength = query.split(' ').length;
    const hasMultipleTopScores = ranked.length >= 3 &&
      ranked[0].finalScore - ranked[2].finalScore < 0.1;

    // Complex query or multiple equally-good agents ’ panel
    if (queryLength > 30 || hasMultipleTopScores) {
      return 'panel';
    }

    return 'single';
  }
}
```

---

## =Ê Comparison Table

| Feature | Current Expert Orchestrator | Current Enhanced Orchestrator | **Recommended Hybrid** |
|---------|----------------------------|------------------------------|----------------------|
| **Agent Selection** | L Keyword matching | L Manual (requires agentId) |  PostgreSQL + RAG |
| **Database Integration** | L Hardcoded experts |  Tool database |  Full agent database (254 agents) |
| **Knowledge Domains** | L Not used | L Not used |  Tier-based filtering |
| **Semantic Understanding** |   Basic RAG fallback | L None |  RAG embedding similarity |
| **Panel Support** |  Multi-agent panels | L Single agent only |  Both modes |
| **Tool Integration** | L None |  13 specialized tools |  Inherits from Enhanced |
| **Citations** | L None |  7 types |  Inherits from Enhanced |
| **Confidence Scoring** |   Manual consensus |  Evidence-based |  Inherits from Enhanced |
| **Performance** | =" Slow (keyword loops) | ¡ Fast (direct agentId) | ¡ Fast (indexed PostgreSQL) |
| **Scalability** | L Static library (2 agents) |  Any agent |  Scales to thousands |
| **Transparency** |   Limited |  Thinking steps |  Inherits from Enhanced |

---

## <¯ Recommended Implementation Priority

### **Week 1: Foundation**
1.  Create `KnowledgeDomainDetector` service
2.  Implement keyword-based detection
3.  Implement RAG-based detection
4.  Test with sample queries

### **Week 2: Agent Ranking**
1.  Create `AgentRanker` service
2.  Implement semantic similarity scoring
3.  Add tier weighting
4.  Add performance metrics

### **Week 3: Integration**
1.  Create `AutomaticOrchestrator` class
2.  Integrate with `EnhancedAgentOrchestrator`
3.  Integrate with `ExpertOrchestrator` (panel mode)
4.  Add mode detection (single vs panel)

### **Week 4: Testing & Optimization**
1.  Performance testing (response time < 500ms)
2.  Accuracy testing (correct agent selection rate > 90%)
3.  A/B testing vs manual selection
4.  Logging and analytics dashboard

---

## =¡ Key Recommendations

### **1. Use PostgreSQL for Agent Selection** 
- **Fast**: Indexed queries (milliseconds)
- **Reliable**: Exact domain matching
- **Scalable**: Works with thousands of agents
- **Maintainable**: Clear SQL queries

### **2. Add RAG for Semantic Ranking** 
- **Accurate**: Understands intent beyond keywords
- **Flexible**: Handles natural language variations
- **Contextual**: Considers conversation history

### **3. Keep Enhanced Orchestrator** 
- **Already working**: Tool integration, citations, confidence
- **Don't rebuild**: Wrap it with automatic selection

### **4. Extend Expert Orchestrator** 
- **Keep panel logic**: Consensus, facilitation phases
- **Replace agent library**: Load from database
- **Add RAG context**: Enhance decision-making

### **5. Track Performance Metrics** 
```sql
-- Add to agents table
ALTER TABLE agents ADD COLUMN IF NOT EXISTS performance_metrics JSONB DEFAULT '{
  "total_queries": 0,
  "avg_confidence": 0,
  "avg_response_time_ms": 0,
  "user_satisfaction": 0,
  "citation_count": 0
}'::jsonb;

-- Update after each query
UPDATE agents
SET performance_metrics = jsonb_set(
  performance_metrics,
  '{total_queries}',
  to_jsonb((performance_metrics->>'total_queries')::int + 1)
)
WHERE id = $1;
```

---

## =€ Expected Improvements

### **Before (Current)**
- L Manual agent selection
- L Keyword-only matching
- L 2 hardcoded experts
- L No knowledge domain filtering
- ñ Slow selection (keyword loops)

### **After (Recommended)**
-  Automatic agent selection
-  Semantic understanding (RAG)
-  All 254 agents available
-  Knowledge domain + tier filtering
- ¡ Fast selection (< 100ms PostgreSQL + 200ms RAG)
- =Ê Performance tracking
- <¯ 90%+ accuracy on agent selection

---

## =Ý Next Steps

1. **Run database migration** to add LLM recommendations to knowledge_domains
2. **Implement KnowledgeDomainDetector** service (Week 1)
3. **Implement AgentRanker** service (Week 2)
4. **Create AutomaticOrchestrator** (Week 3)
5. **Test and optimize** (Week 4)

Would you like me to start implementing the `AutomaticOrchestrator` now?

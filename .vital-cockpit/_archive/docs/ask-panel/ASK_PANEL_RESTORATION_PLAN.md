# Ask Panel Restoration Plan - Complete Feature Recovery

## 🎯 Executive Summary

**Problem**: After refactoring Ask Panel to use the shared multi-framework orchestrator, we lost critical UI features including:
- Agent store with agent cards and suites
- AI-powered agent recommendation system
- Panel type selection (sequential, collaborative, hybrid)
- Human-machine role patterns (user-guided, autonomous, hybrid)
- Panel flow types with different execution modes

**Solution**: Restore all features by integrating Supabase data with new shared architecture.

---

## 📊 Available Data from Supabase

### 1. Agents Table (50 agents available)
**Key Features**:
- ✅ 50 healthcare/pharma/digital health agents
- ✅ Rich profiles: expertise, specialties, background, personality
- ✅ Categorized: clinical, regulatory, analytical, technical, market_access
- ✅ Rating and popularity scores
- ✅ Avatars and visual identities

**Top Agents by Category**:
- **Clinical**: Clinical Trial Designer, Medical Monitor, Protocol Writer
- **Regulatory**: FDA Strategist, Breakthrough Therapy Advisor, HIPAA Officer
- **Analytical**: Biostatistician, Real-World Evidence Analyst, Health Economist
- **Technical**: NLP Expert, Data Visualization Specialist
- **Market Access**: Payer Strategy Advisor, Product Launch Strategist

### 2. Agent Suites (Currently: 1 default suite)
**Current State**:
- Only "Default Agent Suite" exists with 15 members
- Agent codes: P01_CMO, P02_VPCLIN, P04_BIOSTAT, P05_REGDIR, P06_PMDIG, etc.

**What We Lost**:
- Multiple themed suites (Clinical Excellence, Regulatory Fast Track, Market Launch, etc.)
- Suite-based recommendations
- Pre-configured expert panels

### 3. Panel Types (from `panel_types` table - previous analysis)
**Available Modes**:
- `sequential`: One expert at a time
- `collaborative`: Experts discuss together
- `hybrid`: Adaptive mode switching

### 4. Human-Machine Roles (from `dh_task_persona` table)
**Available Patterns**:
- `user_guided`: User drives conversation
- `autonomous`: AI-driven discussion
- `hybrid`: Mixed control

### 5. Missing Data
- ❌ No `agent_skills` data (table empty)
- ❌ No `dh_skill` catalog data (table empty)
- ⚠️ Limited suite organization (only default suite)

---

## 🏗️ Restoration Architecture

### Phase 1: Data Layer (1-2 days)
**Objective**: Restore database structures and seed missing data

#### 1.1 Create Agent Recommendation System
```typescript
// apps/digital-health-startup/src/features/ask-panel/services/agent-recommendation-engine.ts
export class AgentRecommendationEngine {
  // AI-powered agent matching based on:
  // - Query semantic analysis (via OpenAI embeddings)
  // - Agent expertise keywords
  // - Historical performance
  // - User preferences
  
  async recommendAgents(
    query: string,
    options?: {
      maxAgents?: number;
      requiredCategory?: string;
      minConfidence?: number;
    }
  ): Promise<AgentRecommendation[]>;
  
  async recommendPanel(
    query: string,
    useCase: 'clinical_trial' | 'regulatory' | 'market_access' | 'general'
  ): Promise<PanelConfiguration>;
}
```

#### 1.2 Seed Agent Suites
```sql
-- Migration: Create themed agent suites
INSERT INTO dh_agent_suite (name, description, category, position) VALUES
  ('Clinical Excellence', 'Best-in-class clinical trial experts', 'clinical', 1),
  ('Regulatory Fast Track', 'FDA/regulatory approval specialists', 'regulatory', 2),
  ('Market Launch', 'Commercialization and market access', 'market_access', 3),
  ('Data & Analytics', 'Biostatistics and data science experts', 'analytical', 4),
  ('Digital Health Innovation', 'Digital therapeutics and tech experts', 'technical', 5);
```

### Phase 2: UI Components (2-3 days)
**Objective**: Build agent store, cards, and selection UI

#### 2.1 Agent Store Page
```typescript
// apps/digital-health-startup/src/app/(app)/agent-store/page.tsx
export default function AgentStorePage() {
  return (
    <AgentStoreLayout>
      <AgentStoreHeader />
      <AgentFilters /> {/* Category, expertise, rating filters */}
      <AgentSuiteCarousel /> {/* Featured suites */}
      <AgentGrid /> {/* All agents with search */}
    </AgentStoreLayout>
  );
}
```

#### 2.2 Agent Card Component
```typescript
// apps/digital-health-startup/src/features/ask-panel/components/AgentCard.tsx
export function AgentCard({ agent, variant = 'default' }: AgentCardProps) {
  // Variants:
  // - 'default': Full card with expertise, rating, avatar
  // - 'compact': Minimal card for selection
  // - 'detailed': Expanded with full background
  
  return (
    <Card className="agent-card">
      <AgentAvatar src={agent.avatar_url} />
      <AgentHeader title={agent.title} rating={agent.rating} />
      <AgentExpertise expertise={agent.expertise} />
      <AgentSpecialties specialties={agent.specialties} />
      <AgentActions onSelect={onSelect} onDetails={onDetails} />
    </Card>
  );
}
```

#### 2.3 Smart Agent Selector
```typescript
// apps/digital-health-startup/src/features/ask-panel/components/SmartAgentSelector.tsx
export function SmartAgentSelector({ query, onAgentsSelected }: Props) {
  const { recommendations, loading } = useAgentRecommendations(query);
  
  return (
    <div className="smart-selector">
      <div className="ai-suggestions">
        <h3>🤖 Recommended Experts for Your Query</h3>
        <AgentRecommendationList 
          recommendations={recommendations}
          showConfidence
        />
      </div>
      
      <div className="manual-selection">
        <h3>Or Browse All Agents</h3>
        <AgentCatalog 
          onSelect={onAgentsSelected}
          maxSelection={5}
        />
      </div>
    </div>
  );
}
```

### Phase 3: Panel Configuration UI (2-3 days)
**Objective**: Restore panel mode, role patterns, and flow configuration

#### 3.1 Enhanced Panel Configuration
```typescript
// apps/digital-health-startup/src/features/ask-panel/components/PanelConfigurationWizard.tsx
export function PanelConfigurationWizard() {
  const [step, setStep] = useState<'mode' | 'agents' | 'settings' | 'review'>('mode');
  
  return (
    <WizardLayout>
      {step === 'mode' && (
        <PanelModeSelector 
          modes={['sequential', 'collaborative', 'hybrid']}
          onSelect={setMode}
        />
      )}
      
      {step === 'agents' && (
        <SmartAgentSelector 
          query={query}
          onAgentsSelected={setAgents}
        />
      )}
      
      {step === 'settings' && (
        <AdvancedSettings 
          userGuidance={['high', 'medium', 'low']}
          allowDebate={boolean}
          maxRounds={number}
          requireConsensus={boolean}
        />
      )}
      
      {step === 'review' && (
        <ConfigurationReview 
          config={panelConfig}
          onConfirm={startPanel}
        />
      )}
    </WizardLayout>
  );
}
```

#### 3.2 Panel Mode Cards
```typescript
// Component to visualize panel modes
<PanelModeCard mode="sequential">
  <Icon>🔄</Icon>
  <Title>Sequential Consultation</Title>
  <Description>
    Experts provide advice one at a time. Best for:
    - Clear, focused questions
    - Step-by-step guidance
    - User-controlled flow
  </Description>
  <Framework>Powered by LangGraph</Framework>
</PanelModeCard>

<PanelModeCard mode="collaborative">
  <Icon>💬</Icon>
  <Title>Collaborative Discussion</Title>
  <Description>
    Experts debate and build consensus. Best for:
    - Complex, multi-faceted problems
    - Diverse perspectives needed
    - Autonomous discussion
  </Description>
  <Framework>Powered by AutoGen (CuratedHealth)</Framework>
</PanelModeCard>
```

### Phase 4: Integration with Shared Architecture (1-2 days)
**Objective**: Wire everything to multi-framework orchestrator

#### 4.1 Updated Ask Panel Orchestrator
```typescript
// Enhance existing orchestrator to accept UI configuration
export class AskPanelOrchestrator {
  async consultPanel(
    question: string,
    config: EnhancedPanelConfig, // Now includes UI selections
    context?: Context
  ): Promise<PanelResponse> {
    // config now includes:
    // - selectedAgents: Agent[] (from UI)
    // - mode: PanelMode (from UI)
    // - userGuidance: 'high' | 'medium' | 'low'
    // - allowDebate: boolean
    // - requireConsensus: boolean
    // - framework: 'auto' | 'langgraph' | 'autogen' (auto-selected or manual)
    
    const agents = this.mapAgentsToDefinitions(config.selectedAgents);
    const framework = config.framework === 'auto' 
      ? this.selectFramework(config)
      : config.framework;
    
    return await executePanel(agents, question, {
      mode: config.mode,
      maxRounds: config.maxRounds,
      requireConsensus: config.requireConsensus,
      framework,
    });
  }
  
  private mapAgentsToDefinitions(agents: Agent[]): AgentDefinition[] {
    return agents.map(agent => ({
      id: agent.name,
      role: agent.title,
      goal: agent.description,
      backstory: agent.background,
      systemPrompt: this.buildSystemPrompt(agent),
      model: 'gpt-4o',
      temperature: 0.7,
      tools: [],
    }));
  }
  
  private buildSystemPrompt(agent: Agent): string {
    return `You are ${agent.title}.

Background: ${agent.background}

Expertise: ${agent.expertise.join(', ')}

Specialties: ${agent.specialties.join(', ')}

Personality: ${agent.personality_traits.join(', ')}

Communication Style: ${agent.communication_style}

Your capabilities include: ${agent.capabilities.join(', ')}

Provide expert advice in your domain, citing relevant regulations, research, or best practices.`;
  }
}
```

### Phase 5: Advanced Features (3-4 days)
**Objective**: Add AI-powered enhancements

#### 5.1 Use Case Templates
```typescript
// Pre-configured panels for common scenarios
const USE_CASE_TEMPLATES: Record<string, PanelTemplate> = {
  clinical_trial_design: {
    name: 'Clinical Trial Design Panel',
    description: 'Design and optimize clinical trials',
    suggestedAgents: [
      'clinical-trial-designer',
      'biostatistician-digital-health',
      'fda-regulatory-strategist',
      'clinical-protocol-writer'
    ],
    mode: 'sequential',
    framework: 'langgraph',
  },
  
  fda_submission: {
    name: 'FDA Submission Strategy',
    description: 'Plan regulatory submissions',
    suggestedAgents: [
      'fda-regulatory-strategist',
      'breakthrough-therapy-advisor',
      'clinical-data-manager'
    ],
    mode: 'collaborative',
    framework: 'autogen',
  },
  
  market_launch: {
    name: 'Product Launch Planning',
    description: 'Commercialize digital health products',
    suggestedAgents: [
      'product-launch-strategist',
      'payer-strategy-advisor',
      'health-economics-modeler',
      'digital-marketing-strategist'
    ],
    mode: 'collaborative',
    framework: 'autogen',
  },
};
```

#### 5.2 Semantic Agent Search
```typescript
// OpenAI embeddings for agent search
export async function semanticAgentSearch(
  query: string,
  agents: Agent[]
): Promise<Agent[]> {
  // 1. Generate query embedding
  const queryEmbedding = await generateEmbedding(query);
  
  // 2. Generate agent embeddings (cached)
  const agentEmbeddings = await Promise.all(
    agents.map(agent => generateAgentEmbedding(agent))
  );
  
  // 3. Calculate cosine similarity
  const similarities = agentEmbeddings.map((embedding, idx) => ({
    agent: agents[idx],
    score: cosineSimilarity(queryEmbedding, embedding),
  }));
  
  // 4. Sort by relevance
  return similarities
    .sort((a, b) => b.score - a.score)
    .filter(s => s.score > 0.7)
    .map(s => s.agent);
}

function generateAgentEmbedding(agent: Agent): Promise<number[]> {
  const text = `${agent.title}. ${agent.description}. 
    Expertise: ${agent.expertise.join(', ')}. 
    Specialties: ${agent.specialties.join(', ')}.`;
  return generateEmbedding(text);
}
```

---

## 📋 Implementation Checklist

### Data & Backend
- [ ] Create agent suites (Clinical, Regulatory, Market, Analytics, Tech)
- [ ] Seed agent suite members
- [ ] Build `AgentRecommendationEngine` service
- [ ] Implement semantic search with OpenAI embeddings
- [ ] Create use case templates
- [ ] Add agent popularity tracking

### UI Components
- [ ] `AgentCard` (3 variants: default, compact, detailed)
- [ ] `AgentGrid` with filters
- [ ] `AgentSuiteCarousel`
- [ ] `SmartAgentSelector` with AI recommendations
- [ ] `PanelModeSelector` with mode cards
- [ ] `PanelConfigurationWizard` (4-step flow)
- [ ] `AdvancedSettingsPanel`
- [ ] `ConfigurationReview` component

### Pages & Routes
- [ ] `/agent-store` - Browse all agents
- [ ] `/agent-store/[slug]` - Agent detail page
- [ ] `/ask-panel/configure` - Panel configuration wizard
- [ ] Enhance existing `/ask-panel` page

### Integration
- [ ] Connect `SmartAgentSelector` to recommendation engine
- [ ] Wire wizard to `AskPanelOrchestrator`
- [ ] Update orchestrator to use UI-selected agents
- [ ] Add framework auto-selection based on configuration
- [ ] Preserve conversation state across panel reconfigurations

### Testing
- [ ] Test agent recommendations (100 sample queries)
- [ ] Test all panel modes (sequential, collaborative, hybrid)
- [ ] Test framework switching (LangGraph ↔ AutoGen)
- [ ] Test agent selection (manual + AI-suggested)
- [ ] Test with 3, 5, 10 agents
- [ ] Performance testing (response time, consensus quality)

---

## 🚀 Estimated Timeline

**Total: 9-12 days**

| Phase | Duration | Priority |
|-------|----------|----------|
| Phase 1: Data Layer | 1-2 days | 🔴 Critical |
| Phase 2: UI Components | 2-3 days | 🔴 Critical |
| Phase 3: Panel Config | 2-3 days | 🟡 High |
| Phase 4: Integration | 1-2 days | 🟡 High |
| Phase 5: Advanced | 3-4 days | 🟢 Medium |

---

## 🎨 Design Mockups

### Agent Card (Compact)
```
┌─────────────────────────────────────┐
│ [Avatar]  Dr. Jane Smith            │
│           FDA Regulatory Strategist │
│                                     │
│ ⭐⭐⭐⭐⭐ 4.8 (127 consultations)    │
│                                     │
│ 🎯 FDA Regulation • Digital Health  │
│    SaMD Classification • 510(k)     │
│                                     │
│ [View Details]      [Select ✓]     │
└─────────────────────────────────────┘
```

### Smart Agent Selector
```
┌─────────────────────────────────────────────────────────┐
│ 🤖 AI-Recommended Experts for:                          │
│    "I need help designing a clinical trial for a        │
│     digital therapeutic for depression"                 │
├─────────────────────────────────────────────────────────┤
│                                                         │
│ 1. Clinical Trial Designer         [Select] 95% match  │
│    Expert in DCT, digital endpoints, RCT design         │
│                                                         │
│ 2. FDA Regulatory Strategist       [Select] 88% match  │
│    Digital therapeutics regulatory pathways             │
│                                                         │
│ 3. Biostatistician                 [Select] 85% match  │
│    Longitudinal data, engagement analytics              │
│                                                         │
│ 4. Clinical Protocol Writer        [Select] 82% match  │
│    DTx protocol sections, digital safety                │
│                                                         │
│ ──────────────────── OR ─────────────────────           │
│                                                         │
│ [Browse All 50 Agents]                                  │
└─────────────────────────────────────────────────────────┘
```

### Panel Mode Selector
```
┌──────────────────────┐ ┌──────────────────────┐ ┌──────────────────────┐
│    🔄 Sequential     │ │  💬 Collaborative    │ │     🔀 Hybrid        │
│                      │ │                      │ │                      │
│ One at a time        │ │ Group discussion     │ │ Adaptive mode        │
│                      │ │                      │ │                      │
│ ✓ User-controlled    │ │ ✓ Consensus-building │ │ ✓ Best of both       │
│ ✓ Clear structure    │ │ ✓ Diverse views      │ │ ✓ Context-aware      │
│ ✓ Fast results       │ │ ✓ Deep analysis      │ │ ✓ Flexible           │
│                      │ │                      │ │                      │
│ LangGraph            │ │ AutoGen (CH fork)    │ │ Auto-selected        │
│                      │ │                      │ │                      │
│      [Select]        │ │      [Select]        │ │      [Select]        │
└──────────────────────┘ └──────────────────────┘ └──────────────────────┘
```

---

## 🎯 Success Criteria

1. ✅ Users can browse 50+ agents with rich profiles
2. ✅ AI recommends relevant agents with >80% accuracy
3. ✅ Panel configuration wizard completes in <2 minutes
4. ✅ All 3 panel modes work seamlessly
5. ✅ Framework auto-selection matches user needs >90% of the time
6. ✅ Agent suites provide curated expert groups
7. ✅ Use case templates accelerate common workflows
8. ✅ Semantic search finds agents by meaning, not just keywords

---

## 📚 Next Steps

1. **Review this plan** - Confirm scope and priorities
2. **Seed agent suites** - Create 5 themed suites
3. **Build agent recommendation engine** - Core AI functionality
4. **Create UI components** - AgentCard, SmartSelector, Wizard
5. **Integrate with orchestrator** - Wire UI to backend
6. **Test & iterate** - Validate with real use cases

Ready to proceed? 🚀


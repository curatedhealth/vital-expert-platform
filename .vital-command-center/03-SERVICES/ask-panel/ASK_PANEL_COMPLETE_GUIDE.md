# Ask Panel - Complete Service Guide

**Service Type**: Multi-Expert Panel Discussions
**Status**: 🚧 90% Complete | Frontend ✅ | Backend ⏳ | LangGraph Workflows ✅
**Version**: 2.0
**Last Updated**: 2025-11-22

---

## Executive Summary

Ask Panel enables users to convene panels of 3-7 expert AI agents for structured collaborative discussions. Unlike Ask Expert's 1-on-1 consultations, Ask Panel simulates real-world expert panel meetings with moderated discussions, parallel perspectives, and synthesized consensus.

**Value Delivered**:
- ✅ **Diverse Perspectives**: 3-7 experts provide multi-dimensional analysis
- ✅ **Structured Discussion**: Moderated workflows ensure comprehensive coverage
- ✅ **Consensus Building**: Identifies agreement, dissent, and recommendations
- ✅ **Innovation Discovery**: Parallel exploration uncovers unexpected insights

---

## Quick Links

| Document | Purpose |
|----------|---------|
| **ASK_PANEL_COMPLETE_GUIDE.md** | This file - complete service guide |
| **ASK_PANEL_TOOLS_DESIGN_COMPLETE.md** | UI/UX implementation details |
| **ASK_PANEL_ENHANCED_FEATURES_COMPLETE.md** | Advanced features and customization |
| **ASK_PANEL_CUSTOMIZE_RUN_COMPLETE.md** | Custom panel configuration guide |
| **Panel Workflows/** | 19 workflow specification files (6 panel types) |

---

## 6 Panel Archetypes

Ask Panel supports **6 distinct panel types**, each optimized for different use cases:

### Panel Type 1: Structured Panel (Sequential Analysis)
**Orchestration**: Round-robin sequential discussion
**Duration**: 3-5 minutes
**Experts**: 5-7 specialists
**Execution Mode**: Sequential + Moderated

**Best For**:
- Regulatory compliance reviews
- Clinical trial protocol assessments
- Medical device safety evaluations
- Drug approval processes
- Standard operating procedure reviews

**Key Features**:
- **Strict moderation**: Each expert presents in sequence
- **Comprehensive coverage**: All perspectives heard systematically
- **Formal synthesis**: Moderator creates structured summary
- **Evidence-based**: Each contribution must cite sources
- **Compliance focus**: Regulatory guardrails built-in

**Typical Workflow**:
```
1. Moderator frames question (30s)
2. Expert 1 provides analysis (45s)
3. Expert 2 provides analysis (45s)
4. ... (continue for all experts)
5. Moderator synthesizes findings (60s)
6. Final recommendation (30s)
```

**Use Case Example**: "Should we proceed with Phase 3 trials for Drug X given Phase 2 safety data?"

**Documentation**: `ASK_PANEL_TYPE1_MERMAID_WORKFLOWS.md`, `01_STRUCTURED_PANEL_LANGGRAPH_IMPLEMENTATION.md`

---

### Panel Type 2: Open Panel (Parallel Exploration)
**Orchestration**: Parallel collaborative exploration
**Duration**: 5-10 minutes
**Experts**: 5-8 specialists
**Execution Mode**: Simultaneous + Dynamic Turn-Taking

**Best For**:
- Brainstorming new product ideas
- Innovation strategy exploration
- Creative problem-solving
- Opportunity identification
- Technology trend analysis
- Market positioning discussions

**Key Features**:
- **Free-flowing dialogue**: Multi-directional conversation
- **Minimal moderation**: Facilitation only, not control
- **Cross-pollination**: Ideas build on each other
- **Emergent themes**: Patterns discovered organically
- **Innovation clusters**: Related ideas grouped automatically
- **Real-time synthesis**: Continuous insight aggregation

**Typical Workflow**:
```
1. Facilitator introduces topic (30s)
2. Parallel exploration phase (3-5 min)
   - Experts share initial thoughts simultaneously
   - Dynamic turn-taking for follow-ups
   - Cross-referencing and building on ideas
3. Theme identification (2 min)
   - Facilitator identifies emerging patterns
   - Experts validate/refine themes
4. Synthesis and innovation map (2 min)
```

**Use Case Example**: "What are innovative digital health solutions for mental health care access?"

**Documentation**: `ASK_PANEL_TYPE2_OPEN_WORKFLOW_COMPLETE.md`, `ASK_PANEL_TYPE2_LANGGRAPH_ARCHITECTURE.md`

---

### Panel Type 3: Socratic Panel (Assumption Testing)
**Orchestration**: Iterative questioning and challenge
**Duration**: 7-12 minutes
**Experts**: 4-6 specialists
**Execution Mode**: Sequential + Dialectical

**Best For**:
- Testing strategic assumptions
- Challenging conventional thinking
- Deep problem exploration
- Uncovering hidden risks
- Validating hypotheses
- Critical analysis of proposals

**Key Features**:
- **Question-driven**: Socratic method applied rigorously
- **Assumption surfacing**: Reveals hidden premises
- **Multi-level interrogation**: Questions beget deeper questions
- **Dialectical progression**: Thesis → Antithesis → Synthesis
- **Critical thinking**: Challenges every claim
- **Evidence scrutiny**: Demands rigorous validation

**Typical Workflow**:
```
1. Proposition stated (user query)
2. Round 1: Surface assumptions
   - Each expert identifies 2-3 underlying assumptions
3. Round 2: Challenge assumptions
   - Experts question each assumption critically
4. Round 3: Test alternative scenarios
   - "What if assumption X is wrong?"
5. Round 4: Synthesize insights
   - Which assumptions hold? Which fail?
6. Final analysis: Revised understanding
```

**Use Case Example**: "We assume our drug will capture 20% market share. Is this realistic?"

**Documentation**: `ASK_PANEL_TYPE3_SOCRATIC_WORKFLOW_COMPLETE.md`, `ASK_PANEL_TYPE3_LANGGRAPH_ARCHITECTURE.md`

---

### Panel Type 4: Adversarial Panel (Devil's Advocate)
**Orchestration**: Structured challenge and defense
**Duration**: 5-8 minutes
**Experts**: 6-8 specialists (split into advocates/opponents)
**Execution Mode**: Debate format

**Best For**:
- Go/no-go decisions
- Investment decisions
- Risk assessment
- Competitive analysis
- Proposal evaluation
- Strategic choice evaluation

**Key Features**:
- **Split panel**: 50% advocates, 50% opponents
- **Structured debate**: Formal challenge and response
- **Risk identification**: Opponents surface all potential issues
- **Defense validation**: Advocates must justify positions
- **Balanced perspective**: Forces consideration of downsides
- **Decision clarity**: Clear recommendation emerges

**Typical Workflow**:
```
1. Proposition presented (1 min)
2. Advocates present case (2 min)
   - 3-4 experts argue FOR the proposition
3. Opponents present case (2 min)
   - 3-4 experts argue AGAINST the proposition
4. Rebuttal round (2 min)
   - Advocates address opponent concerns
   - Opponents challenge advocate claims
5. Moderator synthesis (1 min)
   - Weighs arguments
   - Identifies key risks and benefits
6. Final recommendation (1 min)
```

**Use Case Example**: "Should we acquire Company X for $500M?"

**Documentation**: `ASK_PANEL_TYPE4_ADVERSARIAL_WORKFLOW_COMPLETE.md`, `ASK_PANEL_TYPE4_LANGGRAPH_ARCHITECTURE.md`

---

### Panel Type 5: Delphi Panel (Consensus Building)
**Orchestration**: Multi-round anonymous voting
**Duration**: 10-15 minutes
**Experts**: 7-12 specialists
**Execution Mode**: Iterative convergence

**Best For**:
- Long-term forecasting
- Standards development
- Policy recommendations
- Strategic planning
- Expert consensus building
- Complex decision-making with high uncertainty

**Key Features**:
- **Anonymous rounds**: Reduces groupthink and bias
- **Iterative refinement**: Multiple voting rounds
- **Statistical consensus**: Quantifies agreement levels
- **Controlled feedback**: Experts see aggregate results, not individuals
- **Convergence tracking**: Monitors opinion shifts
- **Minority reports**: Captures persistent dissent

**Typical Workflow**:
```
1. Question framed clearly (1 min)
2. Round 1: Initial independent judgments
   - Each expert provides estimate/opinion (2 min)
   - No communication between experts
3. Aggregate results shared (1 min)
   - Median, quartiles, outliers shown
4. Round 2: Revised judgments + rationales
   - Experts can revise based on aggregate (3 min)
   - Outliers asked to explain reasoning
5. Round 3: Final convergence (2 min)
6. Consensus summary (2 min)
   - Final median/mode
   - Confidence intervals
   - Remaining disagreements
```

**Use Case Example**: "What will be the market size for gene therapy in 2030?"

**Documentation**: `ASK_PANEL_TYPE5_DELPHI_WORKFLOW_COMPLETE.md`, `ASK_PANEL_TYPE5_DELPHI_LANGGRAPH_ARCHITECTURE.md`

---

### Panel Type 6: Hybrid Human-AI Panel (Collaborative Intelligence)
**Orchestration**: Real human + AI experts working together
**Duration**: 15-30 minutes (async possible)
**Experts**: 2-4 humans + 3-5 AI agents
**Execution Mode**: Blended synchronous/asynchronous

**Best For**:
- High-stakes strategic decisions
- Complex ethical dilemmas
- Regulatory submissions requiring human oversight
- Board-level decision-making
- Cases requiring human judgment + AI analysis
- Situations with legal/compliance requirements

**Key Features**:
- **Human-AI collaboration**: Real experts + AI agents
- **Async support**: Humans can join/leave
- **AI preparation**: AI agents do upfront analysis
- **Human oversight**: Final decisions require human approval
- **Audit trail**: Complete decision record
- **Compliance ready**: Meets regulatory requirements for human oversight

**Typical Workflow**:
```
1. AI agents conduct preliminary analysis (async, 5 min)
2. Human experts review AI findings (async, variable)
3. Live panel session (15-20 min)
   - AI agents present analysis
   - Humans ask questions and probe
   - Collaborative discussion
   - Humans provide context AI lacks
4. Human-led synthesis (5 min)
5. Final human approval/decision
```

**Use Case Example**: "Should we submit this NDA to FDA based on current clinical data?"

**Documentation**: `ASK_PANEL_TYPE6_HYBRID_WORKFLOW_COMPLETE.md`, `ASK_PANEL_TYPE6_LANGGRAPH_ARCHITECTURE.md`

---

## Panel Selection Guide

### Quick Decision Tree

```
Need human oversight? ────► YES ──► Type 6: Hybrid Human-AI Panel
        │
        NO
        │
        ▼
High-stakes go/no-go? ───► YES ──► Type 4: Adversarial Panel
        │
        NO
        │
        ▼
Testing assumptions? ────► YES ──► Type 3: Socratic Panel
        │
        NO
        │
        ▼
Building consensus? ─────► YES ──► Type 5: Delphi Panel
        │
        NO
        │
        ▼
Regulatory/compliance? ──► YES ──► Type 1: Structured Panel
        │
        NO
        │
        ▼
Innovation/brainstorm? ──► YES ──► Type 2: Open Panel
```

### Panel Comparison Matrix

| Aspect | Type 1: Structured | Type 2: Open | Type 3: Socratic | Type 4: Adversarial | Type 5: Delphi | Type 6: Hybrid |
|--------|-------------------|--------------|-----------------|-------------------|----------------|----------------|
| **Duration** | 3-5 min | 5-10 min | 7-12 min | 5-8 min | 10-15 min | 15-30 min |
| **Experts** | 5-7 AI | 5-8 AI | 4-6 AI | 6-8 AI | 7-12 AI | 2-4 Human + 3-5 AI |
| **Orchestration** | Sequential | Parallel | Dialectical | Debate | Multi-round | Blended |
| **Moderation** | High | Low | Medium | Medium | High | High |
| **Formality** | Very High | Low | Medium | High | Very High | Very High |
| **Cost** | $0.50 | $0.60 | $0.80 | $0.70 | $1.20 | $2.50+ |
| **Best For** | Compliance | Innovation | Analysis | Decisions | Consensus | High-stakes |

---

## Implementation Status

### Frontend (95% Complete) ✅

**Location**: `apps/vital-system/src/app/(app)/ask-panel/`

**Implemented Features**:
- ✅ Panel browsing interface (grid + list views)
- ✅ Panel details dialog with full specifications
- ✅ Agent selection UI for custom panels
- ✅ "My Panels" sidebar integration
- ✅ Panel templates for all 6 types
- ✅ Search and filtering
- ✅ Category-based organization
- ✅ Lucide-react icon integration
- ✅ Responsive design
- ✅ Tools page design matching

**Pending**:
- ⏳ Live panel execution UI (Q1 2026)
- ⏳ Real-time agent discussion visualization
- ⏳ Voting UI for Delphi panels
- ⏳ Human participant integration for Type 6

**Components**:
```
ask-panel/
├── page.tsx (main panel browser)
├── components/
│   ├── panel-sidebar.tsx (My Panels sidebar)
│   ├── panel-card.tsx (panel display card)
│   ├── panel-dialog.tsx (panel details)
│   ├── panel-creator.tsx (custom panel builder)
│   └── panel-executor.tsx (⏳ execution UI)
└── services/
    └── panel-service.ts (panel data management)
```

### Backend (60% Complete) ⏳

**Location**: `backend/ask-panel/` (to be created)

**Implemented**:
- ✅ Panel schema in database
- ✅ Panel templates seeded
- ✅ Agent selection logic

**Pending**:
- ⏳ Panel orchestration service (Q1 2026)
- ⏳ LangGraph workflow execution
- ⏳ Moderator agent implementation
- ⏳ Consensus algorithms
- ⏳ Real-time streaming responses
- ⏳ Panel session persistence

### LangGraph Workflows (100% Complete) ✅

**All 6 panel types have complete LangGraph architectures documented**:
- ✅ Type 1: Structured - `01_STRUCTURED_PANEL_LANGGRAPH_IMPLEMENTATION.md`
- ✅ Type 2: Open - `ASK_PANEL_TYPE2_LANGGRAPH_ARCHITECTURE.md`
- ✅ Type 3: Socratic - `ASK_PANEL_TYPE3_LANGGRAPH_ARCHITECTURE.md`
- ✅ Type 4: Adversarial - `ASK_PANEL_TYPE4_LANGGRAPH_ARCHITECTURE.md`
- ✅ Type 5: Delphi - `ASK_PANEL_TYPE5_DELPHI_LANGGRAPH_ARCHITECTURE.md`
- ✅ Type 6: Hybrid - `ASK_PANEL_TYPE6_LANGGRAPH_ARCHITECTURE.md`

**Ready for implementation** - just needs backend development in Q1 2026.

---

## Database Schema

### Core Tables

```sql
-- Panel templates
CREATE TABLE panel_templates (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    panel_type VARCHAR(50), -- 'structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid'
    name VARCHAR(255),
    description TEXT,
    purpose TEXT,
    category VARCHAR(100),
    icon VARCHAR(50), -- lucide-react icon name
    min_experts INTEGER DEFAULT 3,
    max_experts INTEGER DEFAULT 7,
    default_duration_minutes INTEGER,
    configuration JSONB, -- type-specific settings
    created_at TIMESTAMP DEFAULT NOW()
);

-- User's custom panels
CREATE TABLE user_panels (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES profiles(id),
    template_id UUID REFERENCES panel_templates(id),
    name VARCHAR(255),
    selected_agents UUID[], -- array of agent IDs
    configuration JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Panel sessions (executions)
CREATE TABLE panel_sessions (
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    user_id UUID REFERENCES profiles(id),
    panel_id UUID REFERENCES user_panels(id),
    query TEXT,
    status VARCHAR(50), -- 'running', 'completed', 'failed'
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    result JSONB -- final synthesis, consensus, recommendations
);

-- Panel messages (discussion transcript)
CREATE TABLE panel_messages (
    id UUID PRIMARY KEY,
    session_id UUID REFERENCES panel_sessions(id),
    agent_id UUID REFERENCES agents(id),
    role VARCHAR(50), -- 'moderator', 'expert', 'advocate', 'opponent'
    content TEXT,
    round_number INTEGER, -- for Delphi/Socratic
    metadata JSONB, -- vote, confidence score, etc.
    created_at TIMESTAMP DEFAULT NOW()
);
```

---

## Use Case Examples

### Use Case 1: Clinical Trial Go/No-Go Decision
**Panel Type**: Type 4 (Adversarial)
**Question**: "Should we proceed to Phase 3 trials for Drug X based on Phase 2 safety data?"

**Panel Composition**:
- **Advocates** (3 agents):
  - Clinical Development Director
  - Biostatistician
  - Medical Affairs VP
- **Opponents** (3 agents):
  - Drug Safety Officer
  - Regulatory Strategy Lead
  - Risk Management Expert

**Expected Output**:
- Pro/con analysis
- Risk assessment with severity scoring
- Mitigation strategies if proceeding
- Alternative paths if not proceeding
- Final recommendation with confidence level

**Duration**: 6-8 minutes
**Cost**: ~$0.70

---

### Use Case 2: Digital Health Innovation Brainstorm
**Panel Type**: Type 2 (Open)
**Question**: "What are innovative ways to improve mental health care access using digital technologies?"

**Panel Composition** (7 agents):
- Digital Health Strategist
- Psychiatry Expert
- UX/Product Designer
- Health Economics Specialist
- Behavioral Science Expert
- Telemedicine Specialist
- Health Equity Advocate

**Expected Output**:
- 15-25 innovative ideas
- 3-5 major innovation themes
- Technology feasibility assessment
- Market opportunity sizing
- Implementation roadmap

**Duration**: 8-10 minutes
**Cost**: ~$0.60

---

### Use Case 3: Regulatory Submission Review
**Panel Type**: Type 1 (Structured)
**Question**: "Review our NDA submission package for completeness and compliance"

**Panel Composition** (6 agents, sequential):
1. Regulatory Affairs Director (submission structure)
2. Clinical Data Manager (efficacy data)
3. Drug Safety Expert (safety data)
4. Quality Assurance Specialist (manufacturing)
5. Medical Writer (documentation quality)
6. CMC Expert (chemistry, manufacturing, controls)

**Expected Output**:
- Section-by-section compliance check
- Identified gaps or deficiencies
- Recommended revisions
- Risk assessment for FDA questions
- Submission readiness score

**Duration**: 4-5 minutes
**Cost**: ~$0.50

---

## Performance Targets

| Metric | Target | Status |
|--------|--------|--------|
| **P50 Response Time** | <7 seconds | ⏳ TBD (not live) |
| **P95 Response Time** | <12 seconds | ⏳ TBD |
| **Throughput** | 100 QPS | ⏳ TBD |
| **Availability** | 99.9% | ⏳ TBD |
| **Cost per Panel** | $0.50-$2.50 | ✅ Estimated |

---

## Roadmap

### Q4 2025 (Current) ✅
- ✅ Frontend UI complete
- ✅ Panel templates seeded
- ✅ LangGraph workflows documented

### Q1 2026 ⏳
- ⏳ Backend orchestration service
- ⏳ Implement Types 1-3 (Structured, Open, Socratic)
- ⏳ Live panel execution UI
- ⏳ Real-time streaming
- ⏳ Beta launch with select customers

### Q2 2026 ⏳
- ⏳ Implement Types 4-5 (Adversarial, Delphi)
- ⏳ Advanced consensus algorithms
- ⏳ Panel analytics dashboard
- ⏳ General availability

### Q3 2026 ⏳
- ⏳ Implement Type 6 (Hybrid Human-AI)
- ⏳ Human participant integration
- ⏳ Async panel support
- ⏳ Enterprise features

---

## Related Documentation

- **PRD**: `00-STRATEGIC/prd/ask-panel/` - Product requirements
- **ARD**: `00-STRATEGIC/ard/ask-panel/` - Architecture requirements
- **Panel Workflows**: `Ask Panel Workflows/` - 19 workflow specification files
- **UI Design**: `ASK_PANEL_TOOLS_DESIGN_COMPLETE.md` - Frontend implementation
- **Database Schema**: `04-TECHNICAL/data-schema/GOLD_STANDARD_SCHEMA.md`

---

**Maintained By**: PRD Architect, Implementation Compliance & QA Agent
**Questions?**: See [CATALOGUE.md](../../CATALOGUE.md) or ask Implementation Compliance & QA Agent
**Last Updated**: 2025-11-22

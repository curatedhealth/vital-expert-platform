# VITAL Ask Expert Services - Product Requirements Document (PRD)
**Version:** 1.2
**Date:** November 27, 2025
**Status:** Gold Standard - GraphRAG & 5-Level Hierarchy Enhanced
**Service Tier:** Ask Expert ($2,000/month base + usage)

---

## Executive Summary

VITAL Ask Expert is a sophisticated AI-powered healthcare consultation service that provides instant access to **489 enriched specialized healthcare expert agents** organized in a **5-level hierarchy**. The service operates through a **2-toggle system** creating **4 distinct modes** (Interactive/Autonomous × Manual/Auto), delivering regulatory guidance, clinical expertise, and strategic insights for pharmaceutical companies, medical device manufacturers, and digital health innovators.

The service replaces traditional consulting costs of $3-5M annually with an AI-powered solution starting at $24,000/year, achieving 91% faster decision-making with 95% accuracy. The platform addresses a rapidly expanding market opportunity, with healthcare AI projected to grow from $39.25B in 2025 to $504.17B by 2032 (44% CAGR), and pharmaceutical companies increasing AI investment 6x to $25B by 2030.

### What's New in v1.2
- **489 Enriched Agents**: Up from 136+, each with 6 core standardized fields
- **5-Level Agent Hierarchy**: Platform → Domain → Tier 1 → Tier 2 → Tier 3
- **3-Method Hybrid Agent Selection**: PostgreSQL (30%) + Pinecone (50%) + Neo4j GraphRAG (20%)
- **2-Toggle Mode System**: Simplified Interactive/Autonomous × Manual/Auto matrix
- **Evidence-Based Scoring**: Capability and skill proficiency tracking per agent

### Phase 1 Launch Scope (December 2025)

⚠️ **IMPORTANT**: Phase 1 launches with a subset of v1.2 capabilities. Full v1.2 features deploy in Phase 2.

| Capability | Phase 1 (Dec 2025) | Phase 2+ (Q1 2026) |
|------------|--------------------|--------------------|
| **Agent Count** | 136+ active agents | 489 enriched agents |
| **Agent Selection** | Pinecone semantic only | 3-method hybrid GraphRAG |
| **Modes** | All 4 modes functional | All 4 modes + enhanced |
| **Neo4j GraphRAG** | Not deployed | Full integration |
| **Deep Agents** | Basic tools | TodoList, Filesystem, SubAgent |
| **Evidence Scoring** | Static | Dynamic with learning |

### Response Time Clarification

Two distinct metrics are tracked for response performance:

| Metric | Definition | Phase 1 Targets |
|--------|------------|-----------------|
| **API Latency** | Time to first token | Mode 1-2: <500ms, Mode 3-4: <5s |
| **Workflow Time** | Complete reasoning + synthesis | Mode 1: 15-25s, Mode 4: 35-55s |

- **API Latency**: Measured from request received to first response token
- **Workflow Time**: Measured from query submission to complete synthesized response
- Phase 1 actual performance: Mode 1: 475ms, Mode 2: 335ms, Mode 3: 1.95s, Mode 4: 4.67s (API latency)

### Market Context (v1.1)
- **Medical Affairs Focus**: 40% of pharma AI investment targets medical affairs functions
- **Competitive Advantage**: Only platform with 489 healthcare-specific agents and multi-agent orchestration
- **Pricing Evolution**: Market shifting to hybrid outcome-based models (base + usage + success)
- **Production Requirements**: HITL (Human-in-the-Loop) now essential for regulated healthcare deployments

---

## Service Mode Architecture

### 2-Toggle System (Updated v1.2)

The Ask Expert service uses a **2-toggle system** that creates **4 distinct modes** through a simple 2x2 matrix, inspired by modern AI assistants like ChatGPT, Claude, and Gemini.

**Toggle 1 - Autonomous Toggle** (Off/On):
- **OFF** = Interactive (back-and-forth conversation)
- **ON** = Autonomous (goal-driven execution with HITL checkpoints)

**Toggle 2 - Automatic Toggle** (Off/On):
- **OFF** = Manual (you choose the expert)
- **ON** = Automatic (AI selects best expert(s) via GraphRAG hybrid selection)

### Core 2x2 Matrix

```
┌─────────────────────────────────────────────────────────────────┐
│                  ASK EXPERT: 4-MODE SYSTEM                      │
│              Interaction Type x Expert Selection                │
└─────────────────────────────────────────────────────────────────┘

                    MANUAL Selection     │  AUTO Selection
                    (You Choose Expert)  │  (AI Selects Experts)
                                        │
INTERACTIVE   ┌────────────────────────┼────────────────────────┐
(Conversation)│       MODE 1           │       MODE 2           │
              │ Interactive + Manual   │ Interactive + Auto     │
              │ "Focused Expert        │ "Smart Expert          │
              │  Conversation"         │  Discussion"           │
              │ ⏱ 15-25 sec           │ ⏱ 25-40 sec           │
              │ 👤 1 expert            │ 👥 2 experts           │
              └────────────────────────┼────────────────────────┘
                                        │
AUTONOMOUS    ┌────────────────────────┼────────────────────────┐
(Goal-Driven) │       MODE 3           │       MODE 4           │
              │ Autonomous + Manual    │ Autonomous + Auto      │
              │ "Expert-Driven         │ "AI Collaborative      │
              │  Workflow"             │  Workflow"             │
              │ ⏱ 45-75 sec           │ ⏱ 35-55 sec           │
              │ 👤 1 expert + tools    │ 👥 4 experts + tools   │
              └────────────────────────┼────────────────────────┘
```

---

## Product Features by Mode

### MODE 1: Interactive + Manual
**"Focused Expert Conversation"**
**Toggles:** Autonomous=OFF, Automatic=OFF

#### User Experience
- User browses expert catalog or searches by specialty
- Selects one specific expert from **489 enriched agents**
- Engages in multi-turn conversation with context retention
- Receives expert-specific perspective and recommendations
- Response time: 15-25 seconds

#### Key Features
- **Expert Browser:** Searchable catalog with 5-level hierarchy
- **Expert Profiles:** 6 standardized fields including capabilities and evidence scores
- **Deep Contextual Understanding:** Full conversation memory
- **Consistent Voice:** Maintains expert's unique perspective and approach
- **Quick Access:** Bookmark favorite experts for repeated consultations

#### Use Cases
- "I want to discuss my 510(k) strategy with the FDA Regulatory Expert"
- "Get Dr. James Chen's (De Novo Expert) opinion on novel device pathway"
- "Consult Dr. Klaus Weber (EU MDR Expert) about CE marking requirements"

#### Performance Requirements
- Response time: 15-25 seconds (P50), 20-30s (P95)
- Single expert focus with reasoning chains
- Expert availability: 100%

---

### MODE 2: Interactive + Automatic
**"Smart Expert Discussion"**
**Toggles:** Autonomous=OFF, Automatic=ON

#### User Experience
- User submits question without selecting experts
- **3-Method Hybrid GraphRAG** analyzes query and identifies relevant domains
- System automatically selects 2 best-matched experts via RRF fusion
- Synthesizes multi-perspective response
- Response time: 25-40 seconds

#### Key Features
- **Hybrid Expert Matching:** PostgreSQL (30%) + Pinecone (50%) + Neo4j GraphRAG (20%)
- **RRF Fusion:** Reciprocal Rank Fusion combines all ranking methods
- **Multi-Expert Synthesis:** Combines insights from 2 relevant agents
- **Evidence-Based:** Includes citations from authoritative sources
- **Dynamic Expert Switching:** AI can bring in additional expertise as needed

#### Use Cases
- "What's the best FDA pathway for my AI-powered diagnostic tool?"
- "I need advice on entering the EU market with my medical device"
- "What are the regulatory and reimbursement considerations for my device?"

#### Performance Requirements
- Response time: 25-40 seconds (P50), 45s (P95)
- 2 experts consulted via hybrid selection
- Automatic expert selection accuracy: >90%

---

### MODE 3: Autonomous + Manual
**"Expert-Driven Workflow"**
**Toggles:** Autonomous=ON, Automatic=OFF

#### User Experience
- User selects specific expert and defines a **goal** to accomplish
- Expert executes multi-step autonomous workflow with **tool usage**
- **HITL checkpoints** for human approval at critical decision points
- Maintains consistent expert perspective throughout
- Response time: 45-75 seconds per workflow step

#### Key Features
- **Goal-Driven Execution:** Expert works toward defined objective
- **Deep Agent Tools:** TodoList, Filesystem, SubAgent spawning (LangChain integration)
- **Checkpoint System:** Human validation at critical decision points
- **Research & Analysis:** Searches relevant databases and literature
- **Iterative Refinement:** Expert adjusts based on human feedback

#### Deep Agent Capabilities
- **Planning Agent:** Breaks goals into actionable subtasks
- **Tool Integration:** Access to research, analysis, and generation tools
- **Sub-Agent Spawning:** Creates specialized sub-agents for specific tasks
- **Evidence Gathering:** Searches PubMed, FDA databases, ClinicalTrials.gov
- **Artifact Generation:** Creates documents, reports, protocols

#### Use Cases
- "I need the Clinical Trials Expert to create a Phase II study protocol"
- "Collaborate with clinical expert on trial protocol optimization"
- "Deep dive with reimbursement expert on payer negotiation approach"

#### Performance Requirements
- Response time: 45-75 seconds per step (P50), 90s (P95)
- 1 expert with deep reasoning + tool access
- Context retention: Full session
- Checkpoint processing: <5 seconds

---

### MODE 4: Autonomous + Automatic
**"AI Collaborative Workflow"**
**Toggles:** Autonomous=ON, Automatic=ON

#### User Experience
- User describes complex goal requiring multi-disciplinary expertise
- **3-Method Hybrid GraphRAG** assembles optimal expert team (up to 4)
- Multiple experts collaborate with autonomous reasoning and tool usage
- **LangGraph Supervisor** coordinates parallel execution and handoffs
- Response time: 35-55 seconds per workflow step

#### Key Features
- **Dynamic Expert Assembly:** GraphRAG selects best team via hybrid scoring
- **Supervisor Pattern:** Central orchestrator manages multi-agent coordination
- **Deep Agent Collaboration:** Each expert has TodoList, Filesystem, SubAgent tools
- **HITL Checkpoints:** Human approval at critical junctures
- **Comprehensive Deliverables:** Documents, protocols, strategies as artifacts

#### Orchestration Pattern
```
User: "Create complete FDA 510(k) submission package for my device"
→ AI: [GraphRAG selects FDA Expert + Clinical Expert + QA Expert + Regulatory Writer]
→ Supervisor: "Coordinating parallel analysis..."
→ FDA Expert: "Analyzing regulatory pathway options..." [uses research tools]
→ Clinical Expert: "Evaluating validation requirements..." [spawns sub-agent]
→ QA Expert: "Reviewing design controls..."
→ Supervisor: [HITL checkpoint for strategy approval]
→ Regulatory Writer: "Generating submission documents..." [artifact creation]
→ All Experts: Synthesized comprehensive package with artifacts
```

#### Advanced Capabilities
- **Parallel Processing:** LangGraph enables concurrent expert execution
- **Consensus Building:** Weighted voting with confidence scores
- **Graph-Based Routing:** Neo4j relationships (ORCHESTRATES, DELEGATES_TO, COLLABORATES_WITH)
- **Artifact System:** Generate documents, templates, protocols, diagrams
- **Implementation Roadmap:** Gantt chart visualization with milestones

#### Use Cases
- "Create a complete FDA 510(k) submission package for my device"
- "Develop end-to-end go-to-market strategy for novel medical device"
- "Design multi-jurisdictional approval strategy (FDA + EMA + Health Canada)"

#### Performance Requirements
- Response time: 35-55 seconds per step (P50), 75s (P95)
- Up to 4 experts coordinated via Supervisor
- Expert handoff: <2 seconds
- Parallel processing: LangGraph StateGraph enabled

---

## Expert Agent Catalog

### Total Agent Count: 489 Enriched Specialists (v1.2)

#### 5-Level Agent Hierarchy
```
PLATFORM LEVEL (4 agents)
├─ Global Orchestrators
├─ Cross-Domain Coordinators
│
DOMAIN LEVEL (15 agents)
├─ Domain Masters per Vertical
├─ Capability Coordinators
│
TIER 1 - STRATEGIC (25 agents)
├─ Senior Specialists
├─ Decision Makers
│
TIER 2 - TACTICAL (85 agents)
├─ Implementation Experts
├─ Process Specialists
│
TIER 3 - OPERATIONAL (360 agents)
├─ Task Executors
├─ Specialized Workers
└─ Research Assistants
```

#### 6 Core Fields Per Agent (Enrichment Standard)
| Field | Description |
|-------|-------------|
| `capabilities` | Primary skills and competencies |
| `expertise_areas` | Domain-specific knowledge areas |
| `tool_access` | Available tools (research, generation, analysis) |
| `evidence_score` | Historical accuracy and citation quality (0-100) |
| `skill_proficiency` | Proficiency levels per skill |
| `relationship_graph` | Neo4j relationships to other agents |

#### Domain Distribution
- **Regulatory Affairs:** 65 agents (FDA, EMA, PMDA, Health Canada)
- **Clinical Development:** 55 agents
- **Quality & Compliance:** 48 agents
- **Technical/Engineering:** 52 agents
- **Market Access:** 45 agents
- **Business Strategy:** 42 agents
- **Medical Affairs:** 38 agents
- **Digital Health:** 45 agents
- **Manufacturing:** 52 agents
- **Legal & IP:** 47 agents

### Featured Expert Agents

#### Regulatory Specialists
| Agent ID | Name | Tier | Expertise | Evidence Score |
|----------|------|------|-----------|----------------|
| `fda-510k-expert` | Dr. Sarah Mitchell | T1 | Predicate analysis, substantial equivalence | 96 |
| `fda-de-novo` | Dr. James Chen | T1 | Novel devices, special controls | 94 |
| `ema-mdr-expert` | Dr. Klaus Weber | T1 | CE marking, notified bodies | 93 |
| `fda-ai-ml` | Dr. Emily Park | T1 | SaMD, continuous learning, PCCP | 95 |
| `combination-products` | Dr. Michael Brown | T2 | Drug-device, biologics-device | 91 |

#### Clinical Experts
| Agent ID | Name | Tier | Expertise | Evidence Score |
|----------|------|------|-----------|----------------|
| `trial-design` | Dr. Lisa Anderson | T1 | Protocols, endpoints, sample size | 95 |
| `biostatistics` | Dr. Robert Chen | T1 | Power calculations, statistical plans | 97 |
| `patient-safety` | Dr. Maria Rodriguez | T2 | Adverse events, risk management | 92 |
| `real-world-evidence` | Dr. David Kim | T2 | Registry design, outcomes research | 90 |

#### Deep Agent Architecture (LangChain Integration)

Each agent has access to Deep Agent capabilities:

```
FDA 510(k) Expert (Tier 1)
├─ Tools: [TodoList, Filesystem, ResearchDB, SubAgent]
├─ Sub-Agents:
│   ├─ Predicate Identification Agent (T3)
│   ├─ Testing Requirements Agent (T3)
│   ├─ Substantial Equivalence Agent (T2)
│   └─ FDA Response Strategy Agent (T2)
├─ Relationships:
│   ├─ ORCHESTRATES → [T2, T3 sub-agents]
│   ├─ COLLABORATES_WITH → [Clinical Trial Expert, QA Expert]
│   └─ DELEGATES_TO → [Document Writer, Research Assistant]
```

#### Neo4j Relationship Types
- `HAS_CAPABILITY` - Agent to capability mapping
- `ORCHESTRATES` - Higher tier managing lower tier
- `DELEGATES_TO` - Task delegation relationship
- `COLLABORATES_WITH` - Peer collaboration
- `SPECIALIZES_IN` - Domain expertise

---

## User Interface Requirements

### Mode Selection Interface
- **Visual 2x2 Grid:** Clear representation of modes 1-4
- **Agent Mode Card:** Prominent display for Mode 5
- **Mode Descriptions:** Hover tooltips with use cases
- **Smart Suggestions:** Recommend mode based on query type
- **Quick Start:** One-click templates for common scenarios

### Expert Browser (Modes 2 & 4)
- **Searchable Catalog:** Filter by domain, specialty, credentials
- **Expert Cards:** Photo, bio, expertise, response samples
- **Comparison View:** Side-by-side expert selection
- **Favorites System:** Save frequently used experts
- **Expert Analytics:** Usage stats, satisfaction scores

### Conversation Interface
- **Unified Chat:** Consistent interface across all modes
- **Expert Indicators:** Show active agents in conversation
- **Context Display:** Visible conversation memory/state
- **Rich Responses:** Formatted text, citations, charts
- **Export Options:** PDF, Word, markdown formats

### Agent Mode Dashboard (Mode 5)
- **Goal Input:** Natural language objective definition
- **Plan Visualization:** Gantt chart or tree view
- **Progress Tracking:** Real-time status indicators
- **Checkpoint Alerts:** Notification for approvals needed
- **Resource Monitor:** Cost and time tracking
- **Iteration History:** View all plan versions

---

## Technical Requirements

### Performance Specifications
- **Response Latency:** 
  - Query modes (1-2): <3 seconds
  - Chat modes (3-4): <1 second per message
  - Agent mode (5): <30 seconds for planning
- **Concurrent Users:** 1,000+ simultaneous
- **Message Throughput:** 10,000 requests/minute
- **Uptime:** 99.9% availability SLA

### Integration Requirements
- **LLM Orchestration:** LangChain/LangGraph
- **Vector Storage:** Pinecone for semantic search
- **Knowledge Base:** RAG with 10M+ documents
- **External APIs:**
  - FDA databases
  - ClinicalTrials.gov
  - PubMed/MEDLINE
  - Patent databases

### Security & Compliance
- **Data Isolation:** Complete tenant separation
- **Encryption:** AES-256 at rest, TLS 1.3 in transit
- **Compliance:** HIPAA, GDPR, FDA 21 CFR Part 11
- **Audit Logging:** Complete conversation history
- **Access Control:** Role-based permissions

### Multi-Tenant Architecture
- **Tenant Isolation:** Row-level security
- **Resource Allocation:** Fair queuing system
- **Custom Configurations:** Per-tenant agent settings
- **Usage Metering:** Detailed consumption tracking
- **White Labeling:** Custom branding options

---

## Success Metrics

### Usage Metrics
- **Daily Active Users:** Target 80% of subscribers
- **Questions per User:** Average 10-15 per day
- **Mode Distribution:**
  - Mode 1 (Manual Selection): 25% (specific expert queries)
  - Mode 2 (Auto Selection): 35% (quick multi-expert answers)
  - Mode 3 (Manual + Autonomous): 20% (deep expert conversations)
  - Mode 4 (Auto + Autonomous): 20% (complex problem solving)

### Quality Metrics
- **Answer Accuracy:** >95% for factual questions
- **User Satisfaction:** >4.5/5 star rating
- **Expert Relevance:** >90% correct routing
- **Citation Quality:** 100% verifiable sources
- **Response Completeness:** >85% first-pass resolution

### Business Metrics
- **Customer Acquisition:** 50+ organizations in Year 1
- **Revenue Target:** $1.2M ARR (600 seats)
- **Churn Rate:** <5% monthly
- **Expansion Revenue:** 30% upgrade to higher tiers
- **Cost Savings:** Document 95% reduction vs consulting

---

## Implementation Phases

### Phase 1: Query Modes (Months 1-2)
- Implement Mode 1 (Manual Selection)
- Implement Mode 2 (Auto Selection)
- Deploy 50 core expert agents
- Basic UI with mode selector

### Phase 2: Chat Modes (Months 2-3)
- Add Mode 3 (Manual + Autonomous)
- Add Mode 4 (Auto + Autonomous)
- Autonomous reasoning engine
- Checkpoint system implementation

### Phase 3: Full Agent Catalog (Months 3-4)
- Deploy all 136+ expert agents
- Sub-agent architecture
- Advanced orchestration
- Performance optimization

### Phase 4: Enterprise Features (Months 4-6)
- Multi-tenant optimizations
- White labeling capabilities
- Advanced analytics dashboard
- Custom agent creation tools

---

## Risk Mitigation

### Technical Risks
- **LLM Hallucination:** Multi-agent validation, source verification
- **Response Latency:** Caching, edge deployment, query optimization
- **Scale Limitations:** Horizontal scaling, queue management

### Business Risks
- **Regulatory Liability:** Clear disclaimers, human verification steps
- **Competition:** Continuous agent training, proprietary knowledge
- **Customer Trust:** Transparent sourcing, accuracy metrics

### Operational Risks
- **Knowledge Currency:** Daily updates from authoritative sources
- **Agent Drift:** Regular retraining and validation
- **Support Load:** Self-service resources, community forum

---

## Appendices

### A. Competitive Analysis
- Traditional consulting: $3-5M/year, 2-4 week turnaround
- Generic AI (ChatGPT): No healthcare expertise, no citations
- VITAL Advantage: Specialized agents, instant access, 95% cost reduction

### B. ROI Calculation
- Traditional consultant: $500/hour × 20 hours/week = $520,000/year
- VITAL Ask Expert: $2,000/month = $24,000/year
- Savings: $496,000/year (95% reduction)
- Payback period: <1 month

### C. Regulatory Considerations
- Not a medical device (clinical decision support)
- Requires human verification for critical decisions (HITL)
- Maintains audit trail for compliance
- Regular validation against FDA guidances
- Aligned with FDA's 2025 AI guidance on lifecycle management

---

## Competitive Analysis (New in v1.1)

### Market Landscape Assessment

#### Direct Competitors
1. **Veeva AI Agents** (Launching Dec 2025)
   - Strength: Existing customer base in life sciences
   - Weakness: No multi-agent orchestration capability
   - Market Position: Incumbent advantage

2. **Anthropic Claude for Life Sciences** (Launched Oct 2025)
   - Strength: Superior medical reasoning, HIPAA compliant
   - Weakness: General LLM, not specialized platform
   - Market Position: Technology leader

3. **Medidata (Dassault Systèmes)**
   - Strength: 25+ years clinical trial data
   - Weakness: Limited medical affairs focus
   - Market Position: Clinical trials leader

4. **Microsoft Healthcare Agent Orchestrator**
   - Strength: Enterprise infrastructure
   - Weakness: Generic, requires customization
   - Market Position: Platform provider

### VITAL's Competitive Advantages
- **Only platform with 489 healthcare-specific agents** in 5-level hierarchy (competitors <50)
- **3-Method Hybrid GraphRAG Agent Selection** (PostgreSQL + Pinecone + Neo4j)
- **Advanced multi-agent orchestration via LangGraph Supervisor** (unique capability)
- **Evidence-based scoring per agent** (0-100 evidence scores build trust)
- **Deep Agent Integration** (LangChain tools: TodoList, Filesystem, SubAgent)
- **BYOAI integration** (leverage existing AI investments)
- **Medical affairs specialization** (40% of pharma AI spend)

### 3-Method Hybrid Agent Selection (New in v1.2)
```
┌─────────────────────────────────────────────────────────────────┐
│                    HYBRID AGENT SELECTION                        │
│             PostgreSQL + Pinecone + Neo4j GraphRAG              │
└─────────────────────────────────────────────────────────────────┘

Query: "What FDA pathway for AI diagnostic with novel biomarker?"
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  METHOD 1: PostgreSQL (30% weight)                              │
│  - Full-text search on agent descriptions                       │
│  - Keyword matching: "FDA", "AI", "diagnostic", "biomarker"     │
│  - Result: [fda-ai-ml, fda-510k-expert, biomarker-expert]      │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  METHOD 2: Pinecone (50% weight)                                │
│  - Semantic vector similarity                                   │
│  - Query embedding → cosine similarity                          │
│  - Result: [fda-ai-ml, samd-expert, clinical-validation]       │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  METHOD 3: Neo4j GraphRAG (20% weight)                          │
│  - Relationship traversal: HAS_CAPABILITY, COLLABORATES_WITH   │
│  - Graph-based expertise discovery                              │
│  - Result: [fda-ai-ml, clinical-trial-expert, regulatory-writer]│
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│  RRF FUSION (Reciprocal Rank Fusion)                            │
│  - Combines all three rankings with configured weights          │
│  - Evidence-based score boost applied                           │
│  - Final Selection: [fda-ai-ml (T1), samd-expert (T2)]         │
└─────────────────────────────────────────────────────────────────┘
```

---

## Market Intelligence & Trends (New in v1.1)

### Healthcare AI Market Dynamics
- **Market Size**: $39.25B (2025) → $504.17B (2032) at 44% CAGR
- **Pharma AI Investment**: $4B (2025) → $25B (2030), 600% increase
- **Medical Affairs Priority**: 40% of pharma AI budgets
- **ROI Expectations**: 14-month payback required by enterprises

### Pricing Model Evolution
- **Traditional**: Per-seat licensing declining (21% → 15% in 12 months)
- **Emerging**: Hybrid models (41% of AI companies)
- **VITAL Approach**: Base + usage + outcome bonuses
- **Target Margins**: 75% gross margin vs 60% for pure subscription

### Production Requirements
- **HITL Integration**: Now mandatory for regulated workflows
- **State Management**: Persistent checkpointing critical
- **Observability**: Full tracing required (LangSmith integration)
- **Context Engineering**: More important than model selection

### Customer Procurement Criteria
1. **Problem-first approach** (quality > AI technology)
2. **Clinical validation** required
3. **Integration complexity** is primary barrier
4. **Budget justification** as staff augmentation
5. **Security certifications** (SOC 2, HIPAA)

---

## Success Metrics (Updated v1.1)

### Business KPIs
- **Q1 2026**: 5 pilot customers, $100K ARR
- **Q2 2026**: 20 customers, $500K ARR
- **Q3 2026**: 50 customers, $1M ARR
- **Q4 2026**: 100 customers, $2M ARR

### Product KPIs
- **Query Accuracy**: >95% for medical affairs use cases
- **Response Time**: <30 seconds for Mode 1/2
- **Agent Utilization**: 40% of agents actively used
- **Customer Engagement**: 7+ daily active users per customer
- **NPS Score**: 70+ by Q4 2026

---

**Document Status:** Complete - GraphRAG & 5-Level Hierarchy Enhanced
**Next Review:** Q1 2026
**Change Log:**
- v1.0 (Nov 17, 2025): Initial PRD
- v1.1 (Nov 23, 2025): Added market intelligence, competitive analysis, updated pricing model
- v1.2 (Nov 27, 2025): Major enhancement release:
  - Updated agent count from 136+ to 489 enriched agents
  - Added 5-level agent hierarchy (Platform→Domain→Tier 1→Tier 2→Tier 3)
  - Added 3-method hybrid GraphRAG agent selection (PostgreSQL 30% + Pinecone 50% + Neo4j 20%)
  - Updated mode terminology to Interactive/Autonomous × Manual/Auto (2-toggle system)
  - Added 6 core fields per agent (enrichment standard)
  - Added Deep Agent integration (LangChain tools: TodoList, Filesystem, SubAgent)
  - Added evidence-based scoring per agent
  - Updated response times to reflect autonomous workflow complexity
  - Added Neo4j relationship types for agent graph
  - Added RRF (Reciprocal Rank Fusion) for hybrid selection
- v1.2.1 (Nov 27, 2025): Launch audit reconciliation:
  - Added Phase 1 vs Phase 2+ scope clarification table
  - Clarified response time metrics (API latency vs workflow time)
  - Reconciled agent count discrepancy with launch docs (136+ Phase 1 vs 489 Phase 2)
  - Aligned terminology with launch documentation
**Owner:** VITAL Product Team
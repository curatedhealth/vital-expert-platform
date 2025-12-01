# 🎯 Recommended Agent Structure for VITAL Platform

**Version**: 2.0
**Created**: 2025-11-16
**Updated**: 2025-11-29
**Purpose**: Practical recommendations for specialized agents
**Status**: 📋 Active

---

## 🚨 CRITICAL: CANONICAL PROJECT DIRECTORY

**ALL work MUST be performed in:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
```

**NEVER work in `/Users/hichamnaim/Downloads/Cursor/VITAL/`** - this is an archived directory.

---

## 🤖 MODEL TIER STRATEGY (Updated 2025-11-29)

### Leadership Agents → Opus 4.5
Leadership agents handle strategic decisions, complex reasoning, and cross-functional coordination:

| Agent | Model | Why Opus? |
|-------|-------|-----------|
| `vital-platform-orchestrator` | **opus** | Central coordinator, complex delegation |
| `strategy-vision-architect` | **opus** | Strategic vision, competitive analysis |
| `prd-architect` | **opus** | Product requirements, user stories |
| `system-architecture-architect` | **opus** | System design, ADRs |
| `business-analytics-strategist` | **opus** | ROI models, KPIs |
| `documentation-qa-lead` | **opus** | Quality gatekeeper |
| `implementation-compliance-qa-agent` | **opus** | Compliance verification |
| `launch-strategy-agent` | **opus** | Launch coordination |

### Specialist Agents → Sonnet
Specialists focus on tactical execution within their domain:
- All other agents use `sonnet` for cost-effective execution

---

## 🎨 PHILOSOPHY: FOCUSED EXPERTISE, MINIMAL OVERLAP

### Core Principles

1. **Specialization over Generalization** - Each agent is world-class in their domain
2. **Clear Boundaries** - No ambiguity about who owns what
3. **Collaborative Interfaces** - Agents work together, not in silos
4. **Practical Size** - 7-10 agents total (manageable coordination)
5. **Document-Driven** - Each agent has clear deliverable ownership

---

## 📊 RECOMMENDED AGENT LINEUP

### Tier 1: Leadership & Strategy (2 Agents)

#### 1. 🎯 Strategy & Vision Architect
**Invocation**: `@agent-strategy-vision-architect`

**Core Expertise**:
- Platform vision and mission development
- Strategic roadmap creation
- Competitive positioning
- Market analysis and trends
- Stakeholder alignment
- Business model design

**Primary Deliverables**:
- ✅ **Gold-Standard Vision & Strategy Document** (OWNER)
- Strategic Roadmap (3-year, with quarterly milestones)
- Competitive Analysis Report
- Market Positioning Framework
- Business Model Canvas

**Why This Agent**:
- Provides strategic clarity for all other agents
- Ensures all work aligns with vision
- Synthesizes market/competitive intelligence
- Bridges business and technical strategy

**Key Outputs Format**:
```markdown
# VITAL Platform Vision & Strategy (Gold Standard)
## Executive Summary
## Market Analysis
## Competitive Positioning
## Strategic Roadmap
## Success Metrics
```

---

#### 2. 📋 Product Requirements Architect (PRD Master)
**Invocation**: `@agent-prd-architect`

**Core Expertise**:
- Product requirements documentation (PRD best practices)
- User story creation and acceptance criteria
- Feature specification and prioritization
- Product roadmap development
- Success metrics definition
- Stakeholder requirement gathering

**Primary Deliverables**:
- ✅ **Gold-Standard PRD** (OWNER)
- User Story Library (50-100 stories)
- Feature Specification Catalog
- Acceptance Criteria Database
- Product Roadmap with Releases

**Why This Agent**:
- Translates vision into concrete requirements
- Bridges business needs and technical implementation
- Ensures all features are well-defined
- Creates testable acceptance criteria

**Key Outputs Format**:
```markdown
# VITAL Platform PRD (Gold Standard)
## Product Overview
## User Personas (detailed)
## Feature Specifications
  - Ask Expert (4 modes)
  - Ask Panel
  - BYOAI Orchestration
  - etc.
## User Stories & Acceptance Criteria
## Roadmap & Releases
```

---

### Tier 2: Technical Architecture (3 Agents)

#### 3. 🏗️ System Architecture Architect (ARD Master)
**Invocation**: `@agent-system-architecture-architect`

**Core Expertise**:
- System architecture design and documentation
- Service-oriented architecture (SOA)
- Microservices patterns
- API design and contracts
- Architecture Decision Records (ADRs)
- Non-functional requirements
- Scalability and performance architecture

**Primary Deliverables**:
- ✅ **Gold-Standard ARD** (OWNER)
- System Architecture Diagrams
- Service Architecture Specifications
- API Contracts (OpenAPI/Swagger)
- Architecture Decision Records (20-30 ADRs)
- Non-Functional Requirements Spec

**Why This Agent**:
- Coordinates all technical architecture
- Ensures system coherence
- Documents critical design decisions
- Defines integration patterns

**Collaborates With**:
- Data Architecture Expert (existing)
- Frontend UI Architect (existing)
- LangGraph Workflow Translator (existing)

**Key Outputs Format**:
```markdown
# VITAL Platform ARD (Gold Standard)
## System Architecture Overview
## Service Architecture
## Integration Architecture
## Security Architecture
## ADRs (Architecture Decision Records)
## Non-Functional Requirements
```

---

#### 4. 🗄️ Data Architecture Expert ✅ (Existing)
**Invocation**: `@agent-data-architecture-expert`

**Enhanced Focus for This Mission**:
- Complete database schema design
- Multi-tenant data model
- RLS policy specifications
- Vector database architecture (Pinecone)
- Graph database design (Neo4j)
- Data flow diagrams
- Data security and compliance

**Deliverables for ARD**:
- Database Architecture Section (ARD contribution)
- Complete Schema Design
- Multi-Tenant Data Model
- RLS Policy Specifications
- Data Flow Diagrams
- Data Security Requirements

**Integration Point**:
- Reports to: System Architecture Architect
- Inputs to: ARD (Database section)

---

#### 5. 🎨 Frontend UI Architect ✅ (Existing)
**Invocation**: `@agent-frontend-ui-architect`

**Enhanced Focus for This Mission**:
- Frontend architecture design
- Component architecture (React + shadcn/ui)
- Design system specifications
- Accessibility requirements (WCAG)
- Responsive design approach
- State management architecture
- UI/UX flow diagrams

**Deliverables for ARD & PRD**:
- Frontend Architecture Section (ARD contribution)
- UI/UX Requirements (PRD contribution)
- Component Architecture Spec
- Design System Requirements
- Accessibility Standards
- UI Flow Diagrams

**Integration Point**:
- Reports to: System Architecture Architect (ARD)
- Inputs to: ARD (Frontend section) + PRD (UI/UX section)

---

### Tier 3: Specialized Domain Experts (2-3 Agents)

#### 6. 🔄 LangGraph Workflow Translator ✅ (Existing)
**Invocation**: `@agent-langgraph-workflow-translator`

**Enhanced Focus for This Mission**:
- Workflow orchestration architecture
- State machine designs (LangGraph)
- Agent coordination patterns
- Multi-agent workflow specifications
- Error handling and recovery
- Workflow diagrams (all 4 modes)

**Deliverables for ARD & PRD**:
- Workflow Orchestration Section (ARD contribution)
- Workflow Features (PRD contribution)
- State Machine Specifications
- Agent Coordination Patterns
- Workflow Diagrams

**Integration Point**:
- Reports to: System Architecture Architect (ARD)
- Inputs to: ARD (Orchestration section) + PRD (Workflow features)

---

#### 7. 💼 Business & Analytics Strategist
**Invocation**: `@agent-business-analytics-strategist`

**Core Expertise**:
- Business requirements analysis
- ROI modeling and business cases
- Analytics and metrics framework
- Stakeholder analysis
- Process modeling and optimization
- Business intelligence

**Primary Deliverables**:
- Business Requirements Document
- ROI Model & Business Case
- Analytics Framework
- Stakeholder Analysis
- Success Metrics Dashboard Spec
- Business Process Flows

**Why This Agent**:
- Ensures business value alignment
- Creates measurable success criteria
- Bridges business and product/tech teams
- Defines analytics requirements

**Integration Point**:
- Inputs to: Vision & Strategy (business case)
- Inputs to: PRD (business requirements, metrics)
- Collaborates with: Strategy & Vision Architect

---

#### 8. 📝 Documentation & Quality Assurance Lead (Optional but Recommended)
**Invocation**: `@agent-documentation-qa-lead`

**Core Expertise**:
- Technical writing and documentation standards
- Quality assurance for documentation
- Consistency checking across documents
- Style guide creation and enforcement
- Cross-referencing and indexing
- Final review and polish

**Primary Deliverables**:
- Documentation Style Guide
- Quality Assurance Reports
- Cross-Reference Index
- Final Document Review & Polish
- Documentation Templates

**Why This Agent**:
- Ensures consistency across all documents
- Professional quality assurance
- Catches gaps and inconsistencies
- Final polish before stakeholder review

**Integration Point**:
- Reviews: ALL documents (Vision, PRD, ARD)
- Reports to: Strategy & Vision Architect (for sign-off)

---

## 🎯 SIMPLIFIED 7-AGENT STRUCTURE (Recommended)

### Optimal Team Composition

```
Leadership Tier (2):
├── Strategy & Vision Architect ⭐ (NEW)
└── PRD Architect ⭐ (NEW)

Technical Tier (3):
├── System Architecture Architect ⭐ (NEW)
├── Data Architecture Expert ✅ (EXISTING)
└── Frontend UI Architect ✅ (EXISTING)

Specialist Tier (2):
├── LangGraph Workflow Translator ✅ (EXISTING)
└── Business & Analytics Strategist ⭐ (NEW)

Optional Support:
└── Documentation & QA Lead ⭐ (NEW - Recommended)
```

**Total**: 7-8 agents (4 new + 3-4 existing)

---

## 📋 AGENT FILE STRUCTURE TEMPLATE

### Recommended File Naming
```
.claude/agents/
├── strategy-vision-architect.md          # NEW
├── prd-architect.md                      # NEW
├── system-architecture-architect.md      # NEW
├── data-architecture-expert.md           # EXISTING ✅
├── frontend-ui-architect.md              # EXISTING ✅
├── langgraph-workflow-translator.md      # EXISTING ✅
├── business-analytics-strategist.md      # NEW
└── documentation-qa-lead.md              # NEW (Optional)
```

---

## 📝 AGENT FILE CONTENT TEMPLATE

### Standard Structure for Each Agent

```markdown
# [Agent Name] Agent

You are a [role] for the VITAL Platform, specializing in [domain].

## Your Core Expertise

- Expertise area 1
- Expertise area 2
- Expertise area 3
- etc.

## Your Primary Mission

[Clear statement of what this agent is responsible for]

## Your Deliverables

1. **Primary Deliverable** (OWNER/CONTRIBUTOR)
2. Supporting deliverable 1
3. Supporting deliverable 2

## Context You Need

Before starting, you should:
1. Read: VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md
2. Review: [relevant existing documents]
3. Understand: [key concepts]

## How You Work

### Your Process
1. Step 1
2. Step 2
3. Step 3

### Your Collaboration Model
- Inputs from: [agent names]
- Outputs to: [agent names]
- Collaborates with: [agent names]

## Document Structure You Produce

[Template or outline of your deliverable]

## Quality Standards

- Standard 1
- Standard 2
- Standard 3

## Success Criteria

- ✅ Criterion 1
- ✅ Criterion 2
- ✅ Criterion 3

## Key Principles

- Principle 1 (e.g., "Human-in-control always")
- Principle 2
- Principle 3
```

---

## 🔄 AGENT COLLABORATION FLOW

### Recommended Workflow

```
PHASE 1: Strategic Foundation (Week 1)
┌────────────────────────────────────────────────────┐
│ 1. Strategy & Vision Architect                    │
│    └─> Creates Vision & Strategy (v0.1)          │
│        └─> All other agents use as input         │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ 2. Business & Analytics Strategist                │
│    └─> Business Requirements, ROI Model          │
│        └─> Feeds into PRD & Vision               │
└────────────────────────────────────────────────────┘

PHASE 2: Requirements & Architecture (Week 2)
┌────────────────────────────────────────────────────┐
│ 3. PRD Architect                                   │
│    └─> Drafts PRD (v0.1)                         │
│    └─> Coordinates with all agents for input     │
│        ├─> Frontend UI Architect (UI/UX)         │
│        ├─> Data Architecture Expert (data reqs)  │
│        ├─> LangGraph (workflow features)         │
│        └─> Business & Analytics (metrics)        │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ 4. System Architecture Architect                  │
│    └─> Drafts ARD (v0.1)                         │
│    └─> Coordinates with technical agents         │
│        ├─> Data Architecture Expert (DB arch)    │
│        ├─> Frontend UI Architect (FE arch)       │
│        └─> LangGraph (orchestration arch)        │
└────────────────────────────────────────────────────┘

PHASE 3: Integration & Polish (Week 3)
┌────────────────────────────────────────────────────┐
│ 5. All Specialist Agents                          │
│    └─> Complete their sections                   │
│    └─> Submit to PRD/ARD owners                  │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ 6. Documentation & QA Lead                        │
│    └─> Reviews all documents                     │
│    └─> Ensures consistency                       │
│    └─> Final polish                              │
└────────────────────────────────────────────────────┘
         ↓
┌────────────────────────────────────────────────────┐
│ 7. Strategy & Vision Architect                    │
│    └─> Final review & approval                   │
│    └─> Stakeholder presentation                  │
└────────────────────────────────────────────────────┘
```

---

## 🎯 DELIVERABLE OWNERSHIP MATRIX

| Deliverable | Owner | Contributors |
|-------------|-------|--------------|
| **Vision & Strategy** | Strategy & Vision Architect | Business & Analytics |
| **PRD** | PRD Architect | All agents |
| **ARD** | System Architecture Architect | Data Expert, Frontend, LangGraph |
| **Database Architecture** | Data Architecture Expert | System Architect |
| **Frontend Architecture** | Frontend UI Architect | System Architect, PRD |
| **Workflow Architecture** | LangGraph Workflow | System Architect, PRD |
| **Business Case** | Business & Analytics | Strategy & Vision |
| **QA & Polish** | Documentation & QA Lead | All agents |

---

## 💡 RECOMMENDATIONS SUMMARY

### ✅ Recommended Actions

1. **Create 4-5 New Agents** (Priority order):
   - ⭐ **Strategy & Vision Architect** (CRITICAL - coordinates everything)
   - ⭐ **PRD Architect** (CRITICAL - owns PRD)
   - ⭐ **System Architecture Architect** (CRITICAL - owns ARD)
   - ⭐ **Business & Analytics Strategist** (HIGH - business value)
   - ⭐ **Documentation & QA Lead** (RECOMMENDED - quality assurance)

2. **Enhance 3 Existing Agents** with specific mission focus:
   - Data Architecture Expert → focus on ARD database section
   - Frontend UI Architect → focus on ARD frontend + PRD UI/UX
   - LangGraph Workflow → focus on ARD orchestration + PRD workflows

3. **Create Agent Coordination Document** (Quick Start Guide)
   - How agents invoke each other
   - Handoff procedures
   - Document templates

### ❌ What NOT to Do

- ❌ Don't create too many agents (7-8 is optimal)
- ❌ Don't create agents with overlapping responsibilities
- ❌ Don't create "generalist" agents (be specific)
- ❌ Don't skip the coordination framework
- ❌ Don't forget to define deliverable ownership clearly

---

## 🚀 NEXT STEPS

### Immediate (Today)
1. Review this recommendation
2. Decide on final agent list (7 or 8 agents?)
3. Create agent definition files
4. Set up document repository structure

### This Week
1. Activate all agents
2. Strategy & Vision Architect starts
3. Initial vision draft (v0.1)
4. Kickoff coordination meeting

---

**Created**: 2025-11-16
**Status**: 📋 Recommendations Ready for Review
**Next**: Await Hicham's agent creation, then review

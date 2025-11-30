# 🎯 VITAL Agent Team - Coordination Guide

**Version**: 3.0
**Created**: 2025-11-16
**Updated**: 2025-11-29
**Purpose**: Show how to leverage the multi-agent team to create gold-standard documentation with proper data schema and file organization

---

## 🚨 CRITICAL: CANONICAL PROJECT DIRECTORY

**ALL work MUST be performed in:**
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/
```

**NEVER work in `/Users/hichamnaim/Downloads/Cursor/VITAL/`** - this is an archived directory containing outdated code.

Before performing ANY file operation:
1. Verify your path contains "VITAL path" (with space)
2. NEVER create, edit, or read files from the "/VITAL/" directory (without space)
3. If uncertain, always use the full canonical path

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [**Database Schema Golden Rules**](#database-schema-golden-rules) ⭐ NEW
3. [**File Organization Golden Rules**](#file-organization-golden-rules) ⭐ NEW
4. [Agent Team Overview](#agent-team-overview)
5. [The Complete Workflow](#the-complete-workflow)
6. [Phase-by-Phase Guide](#phase-by-phase-guide)
7. [Agent Collaboration Patterns](#agent-collaboration-patterns)
8. [Example Conversation Flows](#example-conversation-flows)
9. [Best Practices](#best-practices)
10. [Troubleshooting](#troubleshooting)

---

## 🏆 Database Schema Golden Rules

### Critical Principles (MANDATORY for ALL Agents)

#### 1. Role-Centric Architecture
**The Foundation of VITAL's Data Model:**

- **Roles = Structural Truth**: Roles define responsibilities, tools, budget, scope, JTBDs
- **Personas = Behavioral Deltas**: Personas inherit from roles + store only overrides/additions
- **Override Pattern**: `Effective Data = Role Baseline + Persona Additions - Persona Overrides`

```sql
-- ❌ WRONG: Duplicating data for each persona
INSERT INTO persona_responsibilities VALUES (persona1_id, 'Write Reports', ...);
INSERT INTO persona_responsibilities VALUES (persona2_id, 'Write Reports', ...);
INSERT INTO persona_responsibilities VALUES (persona3_id, 'Write Reports', ...);

-- ✅ CORRECT: Define once on role, personas inherit
INSERT INTO role_responsibilities VALUES (role_id, 'Write Reports', ...);
-- Personas automatically inherit via v_effective_persona_responsibilities view
```

#### 2. Normalized Data Model
- **No JSONB for queryable data** (only for experimental `metadata`)
- **All multi-valued attributes use junction tables**
- **Never use arrays** for responsibilities, tools, skills, stakeholders

```sql
-- ❌ WRONG: Arrays
ALTER TABLE roles ADD COLUMN tools TEXT[];

-- ✅ CORRECT: Junction table
CREATE TABLE role_tools (
  role_id UUID REFERENCES org_roles(id),
  tool_id UUID REFERENCES tools(id),
  proficiency_level TEXT,
  is_required BOOLEAN
);
```

#### 3. Evidence-Based Model
- All attributes must link to `evidence_sources`
- Use `evidence_links` for polymorphic traceability
- Store confidence levels and methodology

#### 4. Multi-Tenant via Junction Tables
- NEVER hardcode `tenant_id` in main tables
- Use junction tables: `role_tenants`, `function_tenants`, etc.
- One entity can serve multiple tenants

#### 5. MECE Persona Framework
Each role MUST have exactly **4 MECE personas** based on 2x2 matrix:

```
                 Low Complexity    High Complexity
High AI Maturity    AUTOMATOR        ORCHESTRATOR
Low AI Maturity     LEARNER          SKEPTIC
```

### Schema Query Rules

```sql
-- ❌ WRONG: Querying role + persona tables directly
SELECT * FROM role_responsibilities WHERE role_id = '...';
SELECT * FROM persona_responsibilities WHERE persona_id = '...';

-- ✅ CORRECT: Use effective views
SELECT * FROM v_effective_persona_responsibilities 
WHERE persona_id = '...';
-- This automatically combines role baseline + persona overrides
```

### Schema Modification Rules

```sql
-- ❌ WRONG: Non-idempotent
CREATE TABLE new_table (...);

-- ✅ CORRECT: Idempotent
CREATE TABLE IF NOT EXISTS new_table (...);

-- ❌ WRONG: Dropping tables
DROP TABLE old_table;

-- ✅ CORRECT: Soft delete
ALTER TABLE old_table ADD COLUMN deleted_at TIMESTAMPTZ;
UPDATE old_table SET deleted_at = NOW() WHERE ...;
```

---

## 📁 File Organization Golden Rules

### Mandatory File Structure for Data Schema Work

**ALL data schema files MUST go in designated locations:**

```
.vital-docs/vital-expert-docs/10-data-schema/
├── 01-core-schema/          ← Evidence system, reference catalogs, role table
├── 02-role-junctions/       ← role_tools, role_responsibilities, etc.
├── 03-persona-junctions/    ← persona_tools, persona_goals, etc.
├── 04-views/                ← v_effective_persona_*, v_persona_complete_context
├── 05-seeds/                ← Seed data templates (NOT one-off inserts!)
│   ├── tenants/            ← tenant_seed_template.md
│   ├── functions/          ← function_seed_template.md
│   ├── departments/        ← department_seed_template.md
│   ├── roles/              ← role_seed_template.md (industry-specific)
│   └── personas/           ← persona_seed_template.md (4 MECE per role)
├── 06-migrations/          ← Version-controlled schema changes (YYYYMMDD_*.sql)
├── 07-utilities/           ← Helper scripts
│   ├── verification/       ← verify_*.sql, check_*.sql
│   ├── cleanup/            ← fix_*.sql, clean_*.sql
│   └── diagnostics/        ← diagnose_*.sql, investigate_*.sql
├── GOLD_STANDARD_SCHEMA.md       ← Master schema documentation
├── NAMING_CONVENTIONS.md         ← Database naming standards
└── INHERITANCE_PATTERN.md        ← Override pattern explained
```

### File Creation Checklist

**Before creating ANY file, ask:**

1. ✅ **Does this file type have a designated location?**
   - Schema DDL → `01-core-schema/`, `02-role-junctions/`, `03-persona-junctions/`, `04-views/`
   - Seed templates → `05-seeds/{specific subfolder}/`
   - Migrations → `06-migrations/`
   - Utilities → `07-utilities/{verification,cleanup,diagnostics}/`

2. ✅ **Can I edit an existing file instead?**
   - ALWAYS prefer editing over creating
   - Search first: `glob_file_search "*.sql"`

3. ✅ **Is this temporary/diagnostic?**
   - Put in `07-utilities/diagnostics/`
   - Archive after use

### Prohibited Actions

**NEVER do these:**

- ❌ Create SQL files in project root
- ❌ Create random documentation folders
- ❌ Duplicate existing folder structures
- ❌ Create one-off seed files (use templates in `05-seeds/`)
- ❌ Leave diagnostic queries in root after use

### File Naming Conventions

```
✅ Schema DDL:
  create_evidence_system.sql
  enhance_reference_catalogs.sql
  enhance_org_roles_table.sql

✅ Junction tables:
  role-junctions-all.sql
  persona-junctions-all.sql

✅ Views:
  effective-views-all.sql

✅ Seeds:
  tenant_seed_template.md
  function_seed_template.md
  pharmaceutical_functions_complete.sql

✅ Migrations:
  20251121_add_evidence_system.sql
  20251121_create_effective_views.sql

✅ Utilities:
  verify_persona_data_quality.sql
  fix_missing_department_mappings.sql
  diagnose_duplicate_roles.sql

❌ Bad names:
  script.sql (too generic)
  temp.sql (not descriptive)
  fix.sql (what are we fixing?)
  data.sql (what data?)
```

### Documentation Update Requirements

**When making schema changes, ALWAYS update:**

1. `GOLD_STANDARD_SCHEMA.md` - Add new tables/views
2. `IMPLEMENTATION_COMPLETE_SUMMARY.md` - Track progress
3. Relevant `README.md` in affected directories
4. Seed templates if structure changed

---

## 🚀 Quick Start

### The Simplest Way to Start

**Option 1: Let Strategy & Vision Architect Coordinate Everything**
```
You: @strategy-vision-architect

I need you to lead the creation of our gold-standard documentation suite:
1. Vision & Strategy document
2. PRD (Product Requirements Document)
3. ARD (Architecture Requirements Document)

You're the chief coordinator. Please:
- Start with your Vision & Strategy document
- Coordinate with all other agents as needed
- Ensure all deliverables are created and aligned

Ready to begin?
```

**Option 2: Step-by-Step (More Control)**
Follow the [Phase-by-Phase Guide](#phase-by-phase-guide) below.

---

## 🎨 Agent Team Overview

### The 8-Agent Team Structure

```
┌─────────────────────────────────────────────────────────────┐
│           LEADERSHIP TIER (Strategic Direction)             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🎯 Strategy & Vision Architect                            │
│  ├─ LEADS: Overall coordination                            │
│  ├─ CREATES: Vision & Strategy Document (50-75 pages)      │
│  └─ COORDINATES: All other agents                          │
│                                                             │
│  📋 PRD Architect                                          │
│  ├─ CREATES: PRD (100-150 pages)                           │
│  ├─ TRANSLATES: Vision → Product Requirements             │
│  └─ COORDINATES: Technical agents for requirements         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│            TECHNICAL TIER (Implementation Specs)            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏗️ System Architecture Architect                          │
│  ├─ CREATES: ARD (150-200 pages)                           │
│  ├─ DEFINES: Complete technical architecture               │
│  └─ COORDINATES: Data, Frontend, LangGraph agents          │
│                                                             │
│  🗄️ Data Architecture Expert                               │
│  ├─ CREATES: Database architecture section (ARD)           │
│  ├─ DEFINES: Schemas, RLS policies, multi-tenant model     │
│  └─ CONTRIBUTES TO: ARD                                    │
│                                                             │
│  🎨 Frontend UI Architect                                  │
│  ├─ CREATES: Frontend architecture section (ARD)           │
│  ├─ IMPLEMENTS: UI components (React + shadcn/ui)          │
│  ├─ REPORTS TO: ux-ui-architect for design decisions       │
│  └─ CONTRIBUTES TO: ARD + PRD                              │
│                                                             │
│  🎨 UX/UI Architect                                        │
│  ├─ LEADS: All UI/UX design decisions                      │
│  ├─ PROVIDES: Design direction to frontend-ui-architect    │
│  ├─ REVIEWS: Implementation for design quality             │
│  └─ CONTRIBUTES TO: PRD (UX requirements)                  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│          SPECIALIST TIER (Domain Expertise)                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🔄 LangGraph Workflow Translator                          │
│  ├─ CREATES: Workflow orchestration section (ARD)          │
│  ├─ DEFINES: LangGraph state machines, workflows           │
│  └─ CONTRIBUTES TO: ARD + PRD                              │
│                                                             │
│  💼 Business & Analytics Strategist                        │
│  ├─ CREATES: Business Requirements, ROI Model, Analytics   │
│  ├─ DEFINES: Success metrics, KPIs, financial model        │
│  └─ CONTRIBUTES TO: Vision, PRD, ARD                       │
│                                                             │
│  📝 Documentation & QA Lead                                │
│  ├─ REVIEWS: All documents for quality                     │
│  ├─ ENSURES: Consistency, accuracy, polish                 │
│  └─ APPROVES: Final documents for stakeholders             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔄 The Complete Workflow

### 7-Week Timeline Overview

```
Week 1-2: Strategic Foundation
├─ Strategy & Vision Architect creates Vision & Strategy (v0.1)
├─ Business & Analytics creates Business Requirements & ROI Model
└─ Documentation & QA creates Style Guide & Templates

Week 3-4: Product Requirements
├─ PRD Architect creates PRD (v0.1)
├─ Frontend UI Architect contributes UI/UX requirements
├─ LangGraph contributes workflow requirements
├─ Business & Analytics contributes success metrics
└─ Documentation & QA reviews PRD

Week 4-6: Architecture Requirements
├─ System Architecture Architect creates ARD (v0.1)
├─ Data Architecture Expert contributes database architecture
├─ Frontend UI Architect contributes frontend architecture
├─ LangGraph contributes orchestration architecture
└─ Documentation & QA reviews ARD

Week 7: Integration & Final Polish
├─ Documentation & QA conducts cross-document review
├─ All agents address final QA feedback
├─ Documentation & QA gives final approval
└─ Strategy & Vision Architect presents to stakeholders
```

### Deliverables Ownership Matrix

| Deliverable | Owner | Contributors | Pages | Timeline |
|-------------|-------|--------------|-------|----------|
| **Vision & Strategy** | Strategy & Vision Architect | Business & Analytics | 50-75 | Week 1-2 |
| **Business Requirements** | Business & Analytics | Strategy & Vision | 40-60 | Week 1-2 |
| **ROI Model** | Business & Analytics | Strategy & Vision | 20-30 | Week 2 |
| **Analytics Framework** | Business & Analytics | PRD Architect | 30-40 | Week 3 |
| **PRD** | PRD Architect | All agents | 100-150 | Week 3-4 |
| **ARD** | System Architecture | Data, Frontend, LangGraph | 150-200 | Week 4-6 |
| **QA Reports** | Documentation & QA | N/A | 5-10 each | Ongoing |
| **Style Guide** | Documentation & QA | N/A | 15-20 | Week 1 |

---

## 📅 Phase-by-Phase Guide

### PHASE 1: Strategic Foundation (Week 1-2)

#### Step 1: Kick Off Strategy & Vision Architect

**Your Conversation:**
```
You: @strategy-vision-architect

We're beginning the gold-standard documentation initiative for VITAL Platform.

Your mission:
1. Create the Vision & Strategy document (50-75 pages)
2. Act as chief coordinator for all other agents
3. Ensure strategic alignment across all deliverables

Context you need:
- Read: VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md
- Read: All 30+ source documents in /docs/

Please:
1. Acknowledge your role and deliverables
2. Review the context documents you'll need
3. Outline your 2-week plan (3 phases)
4. Ask any clarifying questions
5. Begin Phase 1: Discovery & Analysis

Ready?
```

**What Happens:**
- Agent reads all source materials
- Conducts discovery and analysis
- Identifies gaps in current vision
- Starts drafting Vision & Strategy document

**Your Role:**
- Answer clarifying questions about priorities
- Provide stakeholder input
- Review drafts as agent progresses

---

#### Step 2: Activate Business & Analytics Strategist (Parallel with Step 1)

**Your Conversation:**
```
You: @business-analytics-strategist

While the Strategy & Vision Architect is working on the Vision document,
I need you to create the business foundation:

1. Business Requirements Document (40-60 pages)
2. ROI Model & Business Case (20-30 pages)
3. Analytics Framework (30-40 pages)

Context:
- The Vision & Strategy document is being drafted (you'll get v0.1 soon)
- Read: VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md
- Read: VITAL Promise & Value Calculator.md
- Read: Comprehensive Services & Value Proposition Framework.md

Please:
1. Start with Business Discovery (stakeholder priorities, market analysis)
2. Build financial model (revenue, costs, unit economics)
3. Define success metrics (North Star, Primary KPIs)
4. Create ROI analysis (customer ROI, platform ROI)

Begin with Phase 1: Business Discovery. Ready?
```

**What Happens:**
- Agent conducts business discovery
- Builds financial models
- Defines success metrics
- Creates ROI model

**Handoff:**
Once both agents complete v0.1 drafts:
```
You: @strategy-vision-architect

The Business & Analytics Strategist has completed:
- Business Requirements (v0.1)
- ROI Model with 3-year financial projections
- Analytics Framework with North Star metric

Please review and integrate relevant business case content
into your Vision & Strategy document. Does this align with
your strategic vision?
```

---

#### Step 3: Activate Documentation & QA Lead (Parallel with Steps 1-2)

**Your Conversation:**
```
You: @documentation-qa-lead

Welcome! You're the quality gatekeeper for all documentation.

Week 1 tasks:
1. Create Documentation Style Guide (15-20 pages)
2. Create Document Templates (Vision, PRD, ARD, etc.)
3. Define Quality Checklist

Starting Week 2, you'll review documents as they're drafted.

Context:
- Read: VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md
- Review: All agent definition files in .claude/agents/

Please begin with the Style Guide. What standards should
we follow for gold-standard documentation?
```

**What Happens:**
- Agent creates style guide
- Defines terminology standards
- Creates document templates
- Prepares QA checklist

**Deliverable:**
- Documentation Style Guide (shared with all agents)

---

### PHASE 2: Product Requirements (Week 3-4)

#### Step 4: Kick Off PRD Architect

**Your Conversation:**
```
You: @prd-architect

The strategic foundation is complete:
✅ Vision & Strategy document (v1.0) - see [path]
✅ Business Requirements - see [path]
✅ ROI Model & Analytics Framework - see [path]

Now I need you to create the gold-standard PRD (100-150 pages).

Your mission:
1. Translate vision into concrete product requirements
2. Create 50-100 user stories with acceptance criteria
3. Define all features in detail (Ask Expert, Ask Panel, BYOAI, etc.)
4. Create product roadmap (quarterly releases)
5. Define success metrics for each feature

You'll coordinate with:
- Frontend UI Architect (UI/UX requirements)
- Data Architecture Expert (data requirements)
- LangGraph Workflow Translator (workflow requirements)
- Business & Analytics (success metrics)

Please:
1. Acknowledge your role
2. List documents you'll review
3. Outline your 2-3 week plan
4. Begin Phase 1: Discovery & Requirements

Ready to create the PRD?
```

**What Happens:**
- Agent reads Vision, Business Requirements, existing docs
- Conducts requirements discovery
- Starts drafting PRD sections

---

#### Step 5: Coordinate with Specialist Agents (as PRD Architect needs input)

**Frontend UI Architect:**
```
You: @frontend-ui-architect

The PRD Architect is creating the Product Requirements Document
and needs your input on UI/UX requirements.

Please provide:
1. UI/UX requirements for Ask Expert (4 modes)
2. UI/UX requirements for Ask Panel
3. Design system specifications (shadcn/ui + VITAL brand)
4. Accessibility requirements (WCAG 2.1 AA)
5. Component specifications

These will be integrated into the PRD (section 5: UI/UX Requirements).

Can you draft these requirements?
```

**Data Architecture Expert:**
```
You: @data-architecture-expert

The PRD Architect needs data requirements for the PRD.

Please provide:
1. Data requirements for each feature (Ask Expert, Ask Panel, etc.)
2. Multi-tenant data considerations
3. Data model implications

This will inform PRD section on data requirements.
```

**LangGraph Workflow Translator:**
```
You: @langgraph-workflow-translator

The PRD Architect needs workflow requirements for the PRD.

Please provide:
1. Workflow capabilities (what's possible with LangGraph?)
2. Workflow features to highlight in PRD
3. User-facing workflow functionality

This will inform PRD features related to orchestration.
```

**Handoff to PRD Architect:**
```
You: @prd-architect

Great news! The specialist agents have provided their inputs:

✅ Frontend UI Architect: UI/UX requirements (see [path])
✅ Data Architecture Expert: Data requirements (see [path])
✅ LangGraph Workflow: Workflow requirements (see [path])

Please integrate these into the PRD sections:
- Section 5: UI/UX Requirements
- Section 3: Feature Specifications (data needs)
- Section 3.7: Workflow features

Continue with Phase 2: Feature Specification.
```

---

#### Step 6: QA Review of PRD

**Your Conversation:**
```
You: @documentation-qa-lead

The PRD Architect has completed the PRD (draft 1):
- 120 pages
- 75 user stories
- All features specified
- Roadmap defined

Please conduct your comprehensive QA review:
1. Accuracy check (facts verified?)
2. Completeness check (all sections present?)
3. Consistency check (aligns with Vision & Strategy?)
4. Professional polish (grammar, formatting)

Use your Quality Checklist and produce a QA Report.
```

**What Happens:**
- QA Lead reviews PRD thoroughly
- Issues QA Report with findings
- PRD Architect addresses issues
- QA Lead re-reviews and approves

---

### PHASE 3: Architecture Requirements (Week 4-6)

#### Step 7: Kick Off System Architecture Architect

**Your Conversation:**
```
You: @system-architecture-architect

We now have:
✅ Vision & Strategy (approved)
✅ PRD (approved) - see [path]

Now I need you to create the gold-standard ARD (150-200 pages).

Your mission:
1. Define complete system architecture
2. Create 20-30 Architecture Decision Records (ADRs)
3. Design API contracts (OpenAPI specs)
4. Document all architecture layers (frontend, backend, databases, etc.)
5. Coordinate with specialist agents for detailed sections

You'll coordinate with:
- Data Architecture Expert (database architecture section)
- Frontend UI Architect (frontend architecture section)
- LangGraph Workflow Translator (orchestration architecture section)

Please:
1. Acknowledge your role
2. List documents you'll review (Vision, PRD, existing architecture docs)
3. Outline your 3-4 week plan
4. Begin Phase 1: Requirements Analysis

Ready to create the ARD?
```

**What Happens:**
- Agent reads all requirements (Vision, PRD)
- Analyzes current architecture
- Starts designing system architecture

---

#### Step 8: Coordinate with Technical Agents (as System Architect needs input)

**Data Architecture Expert:**
```
You: @data-architecture-expert

The System Architecture Architect is creating the ARD and needs
your complete database architecture section.

Please provide (for ARD Section 5: Database Architecture):
1. Complete database schemas (all tables)
2. Multi-tenant data model (4 tenant types)
3. RLS policies (detailed specifications)
4. Vector database design (Pinecone)
5. Graph database design (Neo4j)
6. Data flow diagrams

This is a major section (30-40 pages). Can you create this?
```

**Frontend UI Architect:**
```
You: @frontend-ui-architect

The System Architecture Architect needs the complete frontend
architecture section for the ARD.

Please provide (for ARD Section 2: Frontend Architecture):
1. Component architecture (React + shadcn/ui)
2. State management architecture
3. Routing architecture (Next.js App Router)
4. API communication patterns
5. Frontend security

This section should be 20-25 pages. Ready?
```

**LangGraph Workflow Translator:**
```
You: @langgraph-workflow-translator

The System Architecture Architect needs the workflow orchestration
architecture section for the ARD.

Please provide (for ARD Section 9: Workflow Orchestration Architecture):
1. LangGraph state machine designs
2. Multi-agent coordination patterns
3. Workflow execution architecture
4. Error handling and recovery
5. Workflow diagrams for all 4 Ask Expert modes + Ask Panel

This section should be 25-30 pages. Can you create this?
```

**Handoff to System Architecture Architect:**
```
You: @system-architecture-architect

Excellent! All specialist agents have delivered their sections:

✅ Data Architecture Expert: Database Architecture (35 pages) - see [path]
✅ Frontend UI Architect: Frontend Architecture (22 pages) - see [path]
✅ LangGraph Workflow: Orchestration Architecture (28 pages) - see [path]

Please integrate these into the ARD:
- Section 2: Frontend Architecture
- Section 5: Database Architecture
- Section 9: Workflow Orchestration Architecture

Continue with your architecture design and documentation.
```

---

#### Step 9: QA Review of ARD

**Your Conversation:**
```
You: @documentation-qa-lead

The System Architecture Architect has completed the ARD (draft 1):
- 175 pages
- 25 Architecture Decision Records
- Complete API contracts (OpenAPI spec)
- All architecture sections integrated

Please conduct your comprehensive QA review:
1. Technical accuracy check
2. Completeness check
3. Consistency check (aligns with PRD?)
4. Cross-references accurate?
5. Professional polish

Produce QA Report.
```

---

### PHASE 4: Integration & Final Polish (Week 7)

#### Step 10: Cross-Document Review

**Your Conversation:**
```
You: @documentation-qa-lead

All major documents are now complete:
✅ Vision & Strategy (72 pages)
✅ Business Requirements (55 pages)
✅ ROI Model & Analytics Framework (75 pages)
✅ PRD (142 pages)
✅ ARD (178 pages)

Please conduct your final cross-document review:
1. Read all documents together
2. Check all cross-references
3. Ensure consistent narrative across all docs
4. Verify no contradictions
5. Create Cross-Reference Index
6. Final polish pass on all documents

Prepare the complete documentation suite for stakeholder review.
```

**What Happens:**
- QA Lead reads all documents holistically
- Creates Cross-Reference Index
- Issues final recommendations
- Gives final approval

---

#### Step 11: Stakeholder Presentation

**Your Conversation:**
```
You: @strategy-vision-architect

All documentation is complete and approved:
✅ Vision & Strategy (gold standard) ✅
✅ PRD (gold standard) ✅
✅ ARD (gold standard) ✅
✅ Business Requirements & ROI Model ✅
✅ Analytics Framework ✅
✅ All documents QA approved ✅

As chief coordinator, please:
1. Create executive summary package for stakeholders
2. Prepare presentation materials
3. Highlight key decisions and recommendations
4. Present the complete vision to stakeholders

Ready to present?
```

---

## 🔗 Agent Collaboration Patterns

### Pattern 1: Sequential Handoff

**When to Use:** One agent's output is required input for another.

**Example:**
```
Step 1: Strategy & Vision creates Vision document
         ↓
Step 2: PRD Architect uses Vision as input for PRD
         ↓
Step 3: System Architect uses PRD as input for ARD
```

**How to Execute:**
```
You: @strategy-vision-architect
[Agent completes Vision & Strategy]

You: @prd-architect
Here's the approved Vision & Strategy: [path]
Please use this to create the PRD.

[Agent completes PRD]

You: @system-architecture-architect
Here's the approved PRD: [path]
Please use this to create the ARD.
```

---

### Pattern 2: Parallel Work with Sync Points

**When to Use:** Multiple agents can work simultaneously, then sync.

**Example:**
```
Week 1:
├─ Strategy & Vision Architect (Vision doc)
├─ Business & Analytics (Business Requirements)
└─ Documentation & QA (Style Guide)

Week 2 (Sync Point):
└─ All review each other's work, align
```

**How to Execute:**
```
You: @strategy-vision-architect
     @business-analytics-strategist
     @documentation-qa-lead

All three of you, please begin your Week 1 work in parallel:
- Strategy & Vision: Vision document
- Business & Analytics: Business Requirements & ROI
- Documentation & QA: Style Guide

[Wait for all to complete]

You: Strategy & Vision, please review Business Requirements
     Business & Analytics, please review Vision document

Align on strategic direction and business case.
```

---

### Pattern 3: Specialist Contribution

**When to Use:** A specialist agent contributes a section to an owner's document.

**Example:**
```
System Architecture Architect (ARD owner)
         ↓
Requests input from:
├─ Data Architecture Expert (DB section)
├─ Frontend UI Architect (Frontend section)
└─ LangGraph Workflow (Orchestration section)
         ↓
Integrates all sections into ARD
```

**How to Execute:**
```
You: @system-architecture-architect

You'll create the ARD, but you'll need sections from specialists.
Please request inputs from:
- Data Architecture Expert
- Frontend UI Architect
- LangGraph Workflow Translator

[System Architect requests inputs]

You: @data-architecture-expert
The System Architect needs your database architecture section.
Please create this (30-40 pages) for ARD Section 5.

[Repeat for other specialists]

[Specialists deliver sections]

You: @system-architecture-architect
All specialist sections are ready. Please integrate into ARD.
```

---

### Pattern 4: UX/UI Design & Implementation Coordination

**When to Use:** Any UI/UX design or implementation work.

**Example:**
```
User wants a new dashboard feature
         ↓
ux-ui-architect designs UX/UI
         ↓
frontend-ui-architect implements in React
         ↓
ux-ui-architect reviews for design quality
         ↓
Iterate until approved
```

**How to Execute:**
```
You: I need a dashboard with metrics, charts, and user activity.

Claude: Let me engage both UI agents to handle this:

@ux-ui-architect

Please design the dashboard UX/UI:
- Layout and visual hierarchy
- Component selection (shadcn/ui)
- User flow and interactions
- Motion and animations
- Design specifications for implementation

[ux-ui-architect provides design]

@frontend-ui-architect

The ux-ui-architect has provided the dashboard design: [path]

Please implement this in React:
- Component architecture
- State management
- shadcn/ui integration
- Responsive behavior
- Accessibility (technical implementation)

Follow the design specifications provided.

[frontend-ui-architect implements]

@ux-ui-architect

Please review the implementation for design quality:
- Visual fidelity to your design
- Interaction quality
- Animation execution
- Overall user experience

[ux-ui-architect reviews and provides feedback]

[Iterate as needed]
```

**Key Principles:**
- Design decisions → ux-ui-architect
- Technical implementation → frontend-ui-architect
- Design review → ux-ui-architect
- Both collaborate on feasibility and iteration

---

### Pattern 5: QA Review Loop

**When to Use:** Ensuring quality before moving forward.

**Example:**
```
Agent creates document (draft 1)
         ↓
QA Lead reviews → Issues QA Report
         ↓
Agent addresses issues (draft 2)
         ↓
QA Lead re-reviews → Approves (final)
```

**How to Execute:**
```
You: @prd-architect
Please create the PRD.

[Agent delivers PRD draft 1]

You: @documentation-qa-lead
Please review the PRD and issue QA Report.

[QA Lead issues report with findings]

You: @prd-architect
Here's the QA Report. Please address all critical and major issues.

[Agent delivers PRD draft 2]

You: @documentation-qa-lead
Please re-review the PRD.

[QA Lead approves]
```

---

## 💬 Example Conversation Flows

### Example 1: Starting the Entire Initiative

```
You: I'm ready to create gold-standard documentation for VITAL Platform:
     - Vision & Strategy
     - PRD
     - ARD

     I have 8 specialized agents ready to go. What's the best way to start?

Claude: Great! Let's start with a coordinated approach. I recommend:

Week 1-2: Strategic Foundation
1. Activate Strategy & Vision Architect (lead coordinator)
2. Activate Business & Analytics Strategist (parallel)
3. Activate Documentation & QA Lead (style guide)

Would you like me to invoke @strategy-vision-architect to begin?

You: Yes, please invoke the Strategy & Vision Architect.

Claude: @strategy-vision-architect

Welcome! You're leading the gold-standard documentation initiative.

Your mission:
1. Create Vision & Strategy document (50-75 pages)
2. Coordinate all other agents
3. Ensure strategic alignment

Context you need:
- VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md
- All 30+ source documents in /docs/

Please:
1. Acknowledge your role
2. Review context documents
3. Outline your 2-week plan
4. Begin Phase 1: Discovery & Analysis

[Strategy & Vision Architect responds with plan...]
```

---

### Example 2: Mid-Project Coordination

```
You: The Vision & Strategy document is done. Now I need the PRD.
     But the PRD Architect needs input from specialists.
     How do I coordinate this?

Claude: Perfect timing! Here's how to coordinate:

Step 1: Kick off PRD Architect with Vision as input
Step 2: PRD Architect will identify what inputs needed
Step 3: Invoke specialists to provide those inputs
Step 4: PRD Architect integrates inputs into PRD

Let me invoke the PRD Architect:

@prd-architect

The Vision & Strategy document is complete (approved, 72 pages).
Path: [path]

Please create the PRD using the Vision as your strategic foundation.

As you work, identify what inputs you need from:
- Frontend UI Architect (UI/UX requirements)
- Data Architecture Expert (data requirements)
- LangGraph Workflow Translator (workflow requirements)

Begin Phase 1: Discovery & Requirements.

[PRD Architect responds...]

Claude: The PRD Architect will let us know when they need specialist inputs.
         We'll then invoke those agents at the right time.
```

---

### Example 3: Handling QA Feedback

```
You: The QA Lead found 15 issues in the PRD (3 critical, 12 minor).
     How do we handle this?

Claude: Standard QA loop. Let's address the issues:

@prd-architect

The Documentation & QA Lead has reviewed your PRD and found:
- 3 critical issues (must fix)
- 12 minor issues (should fix)

QA Report: [path to QA report]

Please:
1. Review all findings
2. Address all critical issues (required for approval)
3. Address minor issues (improves quality)
4. Resubmit PRD as draft 2

[PRD Architect addresses issues, resubmits]

Claude: Now let's get re-review:

@documentation-qa-lead

The PRD Architect has addressed all issues (draft 2).
Please re-review and confirm:
- All critical issues resolved?
- Minor issues addressed?
- Ready for approval?

[QA Lead re-reviews and approves]

Claude: ✅ PRD approved! Ready to move to ARD.
```

---

## ✨ Best Practices

### 1. **Always Start with Strategic Foundation**

❌ **Don't:**
```
You: @system-architecture-architect
Create the ARD right away.
```
Why not? No strategic context, no requirements to base architecture on.

✅ **Do:**
```
1. Vision & Strategy first (strategic direction)
2. Business Requirements & PRD (what to build)
3. THEN ARD (how to build)
```

---

### 2. **Use QA Lead Throughout, Not Just at the End**

❌ **Don't:**
```
[Create all documents]
[Then invoke QA Lead to review everything at once]
```
Why not? Too late to fix major issues, overwhelming for QA.

✅ **Do:**
```
Week 1: QA creates Style Guide
Week 2: QA reviews Vision & Strategy
Week 4: QA reviews PRD
Week 6: QA reviews ARD
Week 7: QA cross-document review
```

---

### 3. **Let Agents Coordinate Each Other**

❌ **Don't:**
```
You: @data-architecture-expert
     @frontend-ui-architect
     @langgraph-workflow-translator

All three of you, create sections for the ARD.
Figure out who does what.
```
Why not? Agents don't communicate with each other directly.

✅ **Do:**
```
You: @system-architecture-architect

You own the ARD. Please coordinate with specialist agents:
- Request specific sections from each
- Define what you need
- Integrate their work

[System Architect directs the specialists]
```

---

### 4. **Provide Context, Not Just Commands**

❌ **Don't:**
```
You: @prd-architect
Create the PRD. Go.
```
Why not? No context, unclear expectations.

✅ **Do:**
```
You: @prd-architect

Context:
- Vision & Strategy is complete: [path]
- Business Requirements available: [path]
- Timeline: 2-3 weeks

Your deliverable:
- PRD (100-150 pages)
- 50-100 user stories
- Feature specifications
- Product roadmap

You'll coordinate with Frontend, Data, LangGraph agents.

Begin with Phase 1: Discovery & Requirements. Ready?
```

---

### 5. **Track Progress Explicitly**

❌ **Don't:**
```
[Invoke multiple agents]
[Hope they all finish]
[No tracking]
```

✅ **Do:**
```
You: Current status:
     ✅ Vision & Strategy (Week 2, complete)
     🔄 Business Requirements (Week 2, 80% done)
     🔄 PRD (Week 3, just started)
     ⏳ ARD (Week 4, not started)

     @business-analytics-strategist
     What's your ETA for Business Requirements?
```

---

### 6. **Use Specialist Agents Efficiently**

❌ **Don't:**
```
You: @data-architecture-expert
Create a complete database design document.

[Separate from ARD, not integrated]
```

✅ **Do:**
```
You: @data-architecture-expert

The System Architect needs your database architecture section
for ARD Section 5 (Database Architecture).

Please provide:
- Schemas, RLS policies, multi-tenant model
- 30-40 pages
- Integrated into ARD

This contributes to the ARD, not a separate document.
```

---

### 7. **Review and Align at Milestones**

**Milestones:**
- ✅ End of Week 2: Vision & Strategy + Business Requirements complete
- ✅ End of Week 4: PRD complete
- ✅ End of Week 6: ARD complete
- ✅ End of Week 7: All documents approved

**At each milestone:**
```
You: @strategy-vision-architect

Milestone: Week 2 complete
✅ Vision & Strategy (72 pages, approved)
✅ Business Requirements (55 pages, approved)

Please review both and confirm:
- Strategic alignment?
- Any gaps or conflicts?
- Ready to move to PRD phase?
```

---

## 🔧 Troubleshooting

### Problem 1: Agent Asks for Information You Don't Have

**Scenario:**
```
Agent: To complete the competitive analysis, I need detailed pricing
       information for competitors X, Y, Z. Can you provide this?

You: I don't have that data.
```

**Solution:**
```
You: I don't have competitor pricing data. Please:
     1. Use publicly available information (websites, reviews)
     2. Make reasonable assumptions (document them)
     3. Mark sections as "requires validation" where uncertain

Continue with best available information.
```

---

### Problem 2: Two Agents Give Conflicting Information

**Scenario:**
```
Strategy & Vision says: "Target market is large pharma (500+ employees)"
Business & Analytics says: "Target market is mid-size biotech (100-500 employees)"
```

**Solution:**
```
You: @strategy-vision-architect

I see a conflict with Business & Analytics on target market definition.
They say mid-size biotech, you say large pharma.

Please:
1. Review Business Requirements document
2. Align on target market definition
3. Update Vision & Strategy if needed

Which is correct, or is it both (multiple segments)?
```

---

### Problem 3: Document is Too Long/Short

**Scenario:**
```
Agent: I've completed the PRD. It's 220 pages.
You: That's too long. Target was 100-150 pages.
```

**Solution:**
```
You: The PRD is longer than expected (220 pages vs 100-150 target).

Please:
1. Review for redundancy (can sections be consolidated?)
2. Move detailed technical specs to ARD (if applicable)
3. Move excessive detail to appendices
4. Aim for 120-150 pages in main body

Quality over quantity, but conciseness is valuable.
```

---

### Problem 4: QA Lead Keeps Failing Documents

**Scenario:**
```
QA Lead fails PRD (draft 1) → PRD Architect fixes → QA Lead fails PRD (draft 2)
```

**Solution:**
```
You: @documentation-qa-lead
     @prd-architect

Let's get aligned to avoid rework.

QA Lead: What are the top 3 recurring issues?
PRD Architect: What's unclear about the quality standards?

Let's clarify expectations before draft 3.
```

---

### Problem 5: Agent Says "I Need More Time"

**Scenario:**
```
Agent: The ARD is complex. I need 5 weeks, not 3-4 weeks.
```

**Solution:**
```
You: I understand the ARD is complex. Let's discuss:

Option 1: Extend timeline to 5 weeks (adjust overall schedule)
Option 2: Reduce scope (what can move to future iteration?)
Option 3: Get more help (additional specialist contributions?)

Which option do you recommend, and why?
```

---

## 📊 Progress Tracking Template

Use this to track progress across all agents:

```markdown
# VITAL Documentation Initiative - Progress Tracker

**Start Date**: 2025-11-XX
**Target Completion**: 2025-XX-XX (7 weeks)
**Status**: 🟢 On Track / 🟡 At Risk / 🔴 Blocked

---

## Week 1-2: Strategic Foundation

| Agent | Deliverable | Pages | Status | ETA | Notes |
|-------|-------------|-------|--------|-----|-------|
| Strategy & Vision | Vision & Strategy | 50-75 | 🟢 80% | Week 2 | On track |
| Business & Analytics | Business Requirements | 40-60 | 🟢 70% | Week 2 | On track |
| Business & Analytics | ROI Model | 20-30 | 🟡 50% | Week 2 | Needs data |
| Documentation & QA | Style Guide | 15-20 | ✅ Done | Week 1 | Complete |

---

## Week 3-4: Product Requirements

| Agent | Deliverable | Pages | Status | ETA | Notes |
|-------|-------------|-------|--------|-----|-------|
| PRD Architect | PRD | 100-150 | 🔄 Just started | Week 4 | - |
| Frontend UI | UI/UX Requirements | (section) | ⏳ Not started | Week 3 | - |
| Data Architecture | Data Requirements | (section) | ⏳ Not started | Week 3 | - |
| LangGraph Workflow | Workflow Reqs | (section) | ⏳ Not started | Week 3 | - |

---

## Week 4-6: Architecture Requirements

| Agent | Deliverable | Pages | Status | ETA | Notes |
|-------|-------------|-------|--------|-----|-------|
| System Architecture | ARD | 150-200 | ⏳ Not started | Week 6 | - |
| Data Architecture | DB Architecture | 30-40 | ⏳ Not started | Week 5 | - |
| Frontend UI | Frontend Architecture | 20-25 | ⏳ Not started | Week 5 | - |
| LangGraph Workflow | Orchestration Arch | 25-30 | ⏳ Not started | Week 5 | - |

---

## Week 7: Final Polish

| Agent | Deliverable | Status | ETA | Notes |
|-------|-------------|--------|-----|-------|
| Documentation & QA | Cross-Document Review | ⏳ Not started | Week 7 | - |
| Documentation & QA | Cross-Reference Index | ⏳ Not started | Week 7 | - |
| Strategy & Vision | Stakeholder Presentation | ⏳ Not started | Week 7 | - |

---

## Overall Status

**Completed**: 1 / 15 deliverables (7%)
**In Progress**: 3 / 15 deliverables (20%)
**Not Started**: 11 / 15 deliverables (73%)

**Timeline Status**: 🟢 On Track (Week 1 of 7)
```

---

## 🎯 Quick Reference Commands

### Invoke an Agent
```
@agent-name
```

### Invoke Multiple Agents (Parallel)
```
@agent-1
@agent-2
@agent-3

All three of you: [instructions for parallel work]
```

### Pass Work Between Agents
```
You: @agent-1
[Agent 1 completes work]

You: @agent-2
Agent 1 has completed [deliverable]: [path]
Please use this as input for [your deliverable].
```

### Request Specialist Contribution
```
You: @owner-agent

Please request input from @specialist-agent for [section].

[Owner agent makes request]

You: @specialist-agent
The owner agent needs [specific section] from you.
Please provide: [details]
```

### QA Review Loop
```
You: @agent
Create [document].

[Agent completes draft 1]

You: @documentation-qa-lead
Review [document], issue QA Report.

[QA issues report]

You: @agent
Address QA findings, submit draft 2.

[Agent addresses, submits draft 2]

You: @documentation-qa-lead
Re-review [document], approve if ready.
```

---

## 🏆 Success Metrics

You'll know you're succeeding when:

✅ **Week 2**: Vision & Strategy + Business Requirements approved
✅ **Week 4**: PRD approved
✅ **Week 6**: ARD approved
✅ **Week 7**: All documents polished, cross-referenced, stakeholder-ready

**Quality Indicators:**
- ✅ All documents pass QA review
- ✅ Consistent terminology across all documents
- ✅ No contradictions between documents
- ✅ All cross-references accurate
- ✅ Executive-level presentation quality
- ✅ Stakeholders approve and are excited

---

## 📚 Additional Resources

### Agent Definition Files
All agent definitions are in:
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/agents/
```

### Key Reference Documents
- **Master Vision**: `VITAL_PLATFORM_VISION_AND_STRATEGY_FOR_AGENTS.md`
- **Agent Recommendations**: `RECOMMENDED_AGENT_STRUCTURE.md`
- **Agent Team Plan**: `AGENT_TEAM_STRUCTURE_AND_EXECUTION_PLAN.md`

### This Guide
- **Path**: `.claude/agents/AGENT_COORDINATION_GUIDE.md`

---

**Remember**: These agents are here to help you create gold-standard documentation. Use them strategically, coordinate effectively, and you'll have a comprehensive documentation suite that provides clarity and direction for VITAL Platform.

**Your role as coordinator**: Provide context, make decisions, resolve conflicts, track progress, and ensure alignment. The agents do the heavy lifting; you provide the strategic direction.

Let's create something exceptional! 🚀

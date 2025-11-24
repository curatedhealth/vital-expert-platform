# PRD Integration Guide - Phase 1 Updates
**Created**: November 22, 2025
**Purpose**: Map Phase 1 updates to Master PRD structure
**Target Document**: `/.vital-cockpit/vital-expert-docs/01-strategy/VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md`
**Source Documents**:
- `PRD_UPDATE_PHASE1_2025-11-22.md`
- `ASK_EXPERT_PRD_UPDATE_2025-11-22.md`

---

## Integration Overview

**Phase 1 Quick Wins** has identified:
- ✅ **6 new features** built but not specified in original PRD
- ✅ **Status updates** for existing features (Ask Expert, Ask Panel)
- ✅ **Roadmap clarifications** (Ask Committee, BYOAI, Mobile apps)

**Integration Approach**:
1. Add new features to appropriate sections in PART III
2. Update existing feature specifications with status and evidence
3. Update PART VII (Product Roadmap) with clarified timelines
4. Update Executive Summary with implementation highlights

---

## Section-by-Section Integration Map

### 1. Executive Summary Updates

**Location**: Lines 36-80 (Executive Summary)

**Changes to Make**:

Add to "Key Product Highlights" (after line 58):
```markdown
**Platform Overview:**
- **Multi-Expert AI Consultation:** Ask Expert (Modes 1-2 ✅ Complete), Ask Panel ✅, Ask Committee (Q3 2026)
- **Workflow Designer:** LangGraph visual designer for no-code workflow creation ✨ NEW
- **Persona & JTBD Management:** ODI framework with AI opportunity assessment ✨ NEW
- **Analytics Suite:** Knowledge analytics, agent performance, user feedback dashboards ✨ NEW
- **BYOAI Orchestration:** Integrate customer proprietary AI agents (Q2 2026)
- **Enterprise Platform:** SOC 2, HIPAA, GDPR, 21 CFR Part 11 compliant from Day 1
```

Update Success Criteria (line 72-79):
```markdown
**Product will be considered successful when:**
- 70%+ Weekly Active Users (WAU) - high engagement
- 3+ consultations per user per week - forming habit
- 5.7x+ customer ROI in Year 1 - measurable value
- ✅ 96%+ first-pass AI approval rate - **ACHIEVED** (Mode 1-2 exceeding 95% target)
- 90%+ customer retention - product-market fit
- NPS > 60 - strong customer advocacy
- ✅ <45s response time - **ACHIEVED** (Mode 1-2 within 22-42s)
```

---

### 2. Table of Contents Updates

**Location**: Lines 83-145 (Table of Contents)

**Changes to Make**:

Update PART III: Feature Specifications (line 97-113):
```markdown
## PART III: FEATURE SPECIFICATIONS
9. Core Features (MVP)
   - 9.1 Ask Expert (1-on-1 AI Consultation) ✅ Modes 1-2 Complete
   - 9.2 Ask Panel (Multi-Expert Collaboration) ✅ 90% Complete
   - 9.3 Ask Committee (AI Advisory Board) ⏳ Q3 2026
   - 9.4 BYOAI Orchestration ⏳ Q2 2026
   - 9.5 Knowledge Management ✅ Complete
   - 9.6 LangGraph Workflow Designer ✨ NEW (85% Complete)
   - 9.7 Persona Management ✨ NEW (90% Complete)
   - 9.8 Jobs-to-Be-Done Management ✨ NEW (90% Complete)
10. Supporting Features
   - 10.1 User Management & Authentication ✅ Complete
   - 10.2 Analytics & Reporting ✅ Enhanced
      - 10.2.1 Knowledge Analytics Dashboard ✨ NEW (80% Complete)
      - 10.2.2 Admin Analytics Suite ✨ NEW (85% Complete)
   - 10.3 Collaboration & Sharing ✅ Complete
   - 10.4 Notifications & Alerts ✅ Complete
   - 10.5 Batch Data Operations ✨ NEW (90% Complete)
11. Platform Features
   - 11.1 Mobile Applications (iOS/Android) ⏳ Year 2
   - 11.2 API & Webhooks ⏳ Q4 2026
   - 11.3 Integrations (Veeva, Salesforce, etc.) ⏳ Year 2
   - 11.4 Admin & Configuration ✅ Complete
```

---

### 3. Feature Specifications - New Features

**Location**: After Section 9.5 (Knowledge Management)

**Action**: Insert 3 new feature specifications

#### 3.1 Add Section 9.6 - LangGraph Workflow Designer

**Insert After**: Section 9.5 Knowledge Management (search for "### 9.5" in document)

**Content to Add**:
```markdown
---

### 9.6 LangGraph Workflow Designer ✨ NEW

**Status**: ✅ Implemented (85% Complete)
**Priority**: P1 (Core Platform Feature)
**Implementation**: `apps/vital-system/src/app/(app)/designer/page.tsx`

**Feature Overview:**
Visual workflow builder for creating and managing LangGraph-based AI orchestration workflows. Enables non-technical users to design complex multi-agent workflows with state management, conditional logic, and tool calling.

**User Story:**
> "As a Medical Affairs leader, I want to design custom AI workflows visually without coding, so that I can orchestrate complex multi-step consultation processes tailored to my organization's needs."

**Key Capabilities:**
- Drag-and-drop workflow design
- State machine visualization
- Task hierarchy management (parent-child relationships)
- Workflow phase editor (discovery, analysis, synthesis, delivery)
- AI-assisted workflow creation
- Code generation from visual design
- Workflow execution tracking
- Template library (common workflow patterns)

**Detailed Specification:**

**9.6.1 Visual Workflow Editor**

```
UI Components:
├─ Canvas (Main Design Area)
│   ├─ Drag-and-drop task nodes
│   ├─ Connection lines (state transitions)
│   ├─ Zoom/pan controls
│   ├─ Grid snap-to-grid
│   └─ Minimap (for large workflows)
│
├─ Task Node Types
│   ├─ Agent Task (invoke AI agent)
│   ├─ Tool Task (call external tool)
│   ├─ Decision Task (conditional branching)
│   ├─ Parallel Task (execute multiple tasks simultaneously)
│   └─ Checkpoint Task (human-in-the-loop approval)
│
├─ State Management
│   ├─ Visual state flow diagram
│   ├─ State variable definitions
│   ├─ State transition rules
│   └─ State persistence configuration
│
└─ Property Panel
    ├─ Task properties (name, description, config)
    ├─ Agent selection (for Agent Tasks)
    ├─ Tool configuration (for Tool Tasks)
    ├─ Condition editor (for Decision Tasks)
    └─ Validation rules
```

**Acceptance Criteria:**
- ✅ Users can create workflows with drag-and-drop interface
- ✅ Workflows can be exported as LangGraph code (JSON + TypeScript)
- ✅ Workflows can be executed directly from designer
- ✅ State transitions are validated (no dead ends, cycles handled)
- ⏳ Template library with 10+ common workflow patterns
- ⏳ Real-time collaboration (multiple users editing same workflow)

**Technical Architecture:**
- Frontend: React + LangGraph GUI components (`apps/vital-system/src/components/langgraph-gui/`)
- State Management: Zustand (`apps/vital-system/src/lib/langgraph-gui/stores/`)
- Code Generation: Template-based TypeScript/JSON export
- Execution: LangGraph runtime integration
- Database: `workflows`, `workflow_steps`, `workflow_executions` tables

**Performance Metrics:**
- Workflow load time: <1 second (50-node workflow)
- Export code generation: <500ms
- Execution start: <2 seconds
- Auto-save frequency: Every 10 seconds

**User Value:**
- **Time Savings**: 90% faster workflow creation vs. coding from scratch
- **Accessibility**: Non-technical users can create complex workflows
- **Validation**: Visual validation prevents state machine errors
- **Reusability**: Template library for common patterns

**Implementation Evidence:**
- Frontend: `apps/vital-system/src/app/(app)/designer/page.tsx` (700+ lines)
- Components: `apps/vital-system/src/components/langgraph-gui/` (10 components)
- Logic: `apps/vital-system/src/lib/langgraph-gui/` (5 modules)
- Database: `workflows`, `workflow_steps`, `workflow_executions` tables
- Design Context: `apps/vital-system/src/contexts/designer-context.tsx`

---
```

#### 3.2 Add Section 9.7 - Persona Management

**Insert After**: Section 9.6 (just added above)

**Content to Add**:
```markdown
### 9.7 Persona Management ✨ NEW

**Status**: ✅ Implemented (90% Complete)
**Priority**: P1 (Core Platform Feature)
**Implementation**: `apps/vital-system/src/app/(app)/personas/page.tsx`

**Feature Overview:**
Comprehensive persona management system for defining and managing user personas with detailed attributes, motivations, pain points, and success metrics using evidence-based methodology.

**User Story:**
> "As a Product Manager, I want to create detailed, evidence-based user personas with VPANES prioritization, so that our AI agents can provide personalized experiences tailored to each user type's specific needs."

**Key Capabilities:**
- Persona creation and editing (full CRUD)
- VPANES priority scoring methodology (Visibility, Pain, Actions, Needs, Emotions, Scenarios)
- Evidence-based persona development (5-10 research sources per persona)
- Typical day activities (6-13 activities per persona)
- Educational background & certifications
- Motivations, values, personality traits (Big Five)
- Success metrics and KPIs
- Persona archetype library
- Persona-to-JTBD mapping

**Detailed Specification:**

**9.7.1 Persona Creation Workflow**

```
UI Flow:
1. Persona List View
   ├─ Grid/table view of all personas
   ├─ Filter by: Role type, priority (VPANES score), status
   ├─ Sort by: Name, creation date, priority
   └─ Create New Persona button

2. Persona Editor (Multi-Step Form)

   STEP 1: Basic Information
   ├─ Persona name (e.g., "Sarah the MSL")
   ├─ Role title (e.g., "Medical Science Liaison")
   ├─ Demographics (age, education, experience)
   ├─ Avatar/photo (upload or select from library)
   └─ One-line description

   STEP 2: VPANES Priority Scoring
   ├─ Visibility: How prominent is this persona? (1-10)
   ├─ Pain: How severe are their pain points? (1-10)
   ├─ Actions: How active/engaged are they? (1-10)
   ├─ Needs: How critical are their needs? (1-10)
   ├─ Emotions: How emotionally charged? (1-10)
   ├─ Scenarios: How many use cases? (1-10)
   └─ Calculated VPANES Score: Σ(V+P+A+N+E+S) / 60 * 100

   STEP 3: Detailed Attributes
   ├─ Educational background
   ├─ Certifications & qualifications
   ├─ Years of experience
   ├─ Tech savviness (1-10 scale)
   ├─ Personality traits (Big Five: Openness, Conscientiousness, etc.)
   ├─ Motivations (3-7 key motivators)
   ├─ Values (3-5 core values)
   └─ Frustrations/Pain points (5-10 items)

   STEP 4: Typical Day Activities
   ├─ Time of day
   ├─ Activity description
   ├─ Duration
   ├─ Frequency (daily, weekly, monthly)
   ├─ Tools/systems used
   └─ Pain points in this activity
   (Repeat for 6-13 activities)

   STEP 5: Evidence Sources
   ├─ Research source (interview, survey, observation, etc.)
   ├─ Source type (primary, secondary, tertiary)
   ├─ Citation/reference
   ├─ Key insights from source
   └─ Confidence level (1-10)
   (Minimum 5 sources required for validation)

   STEP 6: Success Metrics
   ├─ KPIs this persona cares about
   ├─ How they measure success
   ├─ Typical performance benchmarks
   └─ Goals and targets

3. Persona Review & Publish
   ├─ Validation: All required fields completed
   ├─ Preview: See persona card as it appears to users
   ├─ Status: Draft, Under Review, Published
   └─ Publish button
```

**Acceptance Criteria:**
- ✅ Users can create comprehensive personas with all attributes
- ✅ VPANES scoring is calculated automatically
- ✅ Evidence sources can be added and linked
- ✅ Persona cards display rich information
- ⏳ Persona-specific agent recommendations
- ⏳ Persona analytics dashboard (usage, effectiveness)
- ⏳ AI-assisted persona creation from interview transcripts

**Technical Architecture:**
- Frontend: Next.js 14 App Router, React Server Components
- Forms: React Hook Form + Zod validation
- Database: Comprehensive persona schema (24 junction tables)
- Migration: `supabase/migrations/20251117000000_add_comprehensive_persona_jtbd_tables.sql`

**Database Schema Highlights:**
```sql
-- Core tables
personas
persona_demographics
persona_priorities (VPANES)
persona_typical_day_activities (6-13 per persona)
persona_education_background
persona_certifications
persona_motivations
persona_values
persona_personality_traits
persona_frustrations
persona_evidence_sources (5-10 per persona)
persona_success_metrics
```

**User Value:**
- **Better Targeting**: AI agents personalized to specific user personas
- **Higher Relevance**: Content and recommendations tailored to persona needs
- **Validation**: Evidence-based methodology ensures accuracy
- **Prioritization**: VPANES scoring guides development priorities

**Implementation Evidence:**
- Frontend: `apps/vital-system/src/app/(app)/personas/page.tsx`
- Frontend: `apps/vital-system/src/app/(app)/personas/[slug]/page.tsx`
- Database: 24 persona junction tables
- Migration: `supabase/migrations/20251117000000_add_comprehensive_persona_jtbd_tables.sql` (31,342 lines)
- Documentation: `.vital-cockpit/vital-expert-docs/11-data-schema/personas/` (if exists)

---
```

#### 3.3 Add Section 9.8 - Jobs-to-Be-Done Management

**Insert After**: Section 9.7 (just added above)

**Content to Add**:
```markdown
### 9.8 Jobs-to-Be-Done (JTBD) Management ✨ NEW

**Status**: ✅ Implemented (90% Complete)
**Priority**: P1 (Core Platform Feature)
**Implementation**: `apps/vital-system/src/app/(app)/jobs-to-be-done/page.tsx`

**Feature Overview:**
Full implementation of Outcome-Driven Innovation (ODI) framework for defining, managing, and optimizing Jobs-to-Be-Done with AI opportunity assessment and opportunity scoring.

**User Story:**
> "As a Product Strategist, I want to capture and analyze Jobs-to-Be-Done using the ODI framework, so that I can systematically identify where AI can create the most value for our users."

**Key Capabilities:**
- JTBD creation with ODI format (when, circumstance, desired outcome)
- 5-12 desired outcomes per JTBD with opportunity scoring
- Gen AI opportunity assessment (identify where AI can help)
- 3-5 Gen AI use cases per JTBD
- Evidence-based JTBD development (5-10 research sources)
- Workflow stages (3-7 stages per JTBD)
- Value drivers, constraints, obstacles
- Competitive alternatives analysis
- JTBD-to-Persona mapping

**Detailed Specification:**

**9.8.1 ODI Framework Implementation**

```
ODI Structure:

JTBD Statement Format:
"When [situation], I want to [motivation], so I can [expected outcome]."

Example:
"When responding to an HCP inquiry about off-label use,
I want to quickly find compliant response language,
so I can provide accurate information without regulatory risk."

Components:
├─ Job Executor: Who is doing the job? (Persona)
├─ Job: What functional job are they trying to get done?
├─ Circumstance: In what context/situation?
├─ Desired Outcomes: What defines success? (5-12 outcomes)
├─ Constraints: What limits their options?
├─ Obstacles: What prevents success?
└─ Competitive Alternatives: What do they use today?
```

**9.8.2 Opportunity Scoring Methodology**

```
For each Desired Outcome:

Importance Score (1-10):
"How important is this outcome to the job executor?"
(Gathered from user research: interviews, surveys)

Satisfaction Score (1-10):
"How satisfied are users with current solutions for this outcome?"
(Gathered from user research)

Opportunity Score Calculation:
Opportunity = Importance + max(Importance - Satisfaction, 0)

Interpretation:
├─ Opportunity > 15: OVERSERVED (too much focus, may be over-engineered)
├─ Opportunity 12-15: APPROPRIATELY SERVED (competitive parity)
├─ Opportunity 10-12: UNDERSERVED (opportunity for differentiation)
└─ Opportunity < 10: WELL SERVED (no opportunity)

AI Opportunity Assessment:
For each outcome, assess:
├─ Can Gen AI improve this outcome? (Yes/No)
├─ AI Opportunity Score (1-10): How much can AI help?
├─ AI Feasibility (1-10): How feasible is AI solution?
├─ AI Priority: Opportunity × Feasibility
└─ Gen AI Use Cases (3-5 specific ways AI can help)
```

**9.8.3 JTBD Creation Workflow**

```
UI Flow:

1. JTBD List View
   ├─ Grid/table view of all JTBDs
   ├─ Filter by: Persona, opportunity score, AI priority
   ├─ Sort by: Opportunity score, creation date, AI priority
   └─ Create New JTBD button

2. JTBD Editor (Multi-Step Form)

   STEP 1: Job Definition
   ├─ Job executor (select persona)
   ├─ Job statement (when, I want to, so I can)
   ├─ Job category (functional, emotional, social)
   ├─ Job frequency (daily, weekly, monthly, annually)
   └─ Job complexity (simple, moderate, complex)

   STEP 2: Desired Outcomes (5-12 outcomes)
   For each outcome:
   ├─ Outcome statement ("Minimize time to...", "Increase accuracy of...")
   ├─ Importance score (1-10) from user research
   ├─ Satisfaction score (1-10) from user research
   ├─ Calculated opportunity score (auto-calculated)
   ├─ Rank (top 3 outcomes highlighted)
   └─ Evidence source (link to research)

   STEP 3: AI Opportunity Assessment
   For each outcome (filtered: opportunity > 10):
   ├─ Can Gen AI help? (Yes/No)
   ├─ AI Opportunity Score (1-10)
   ├─ AI Feasibility Score (1-10)
   ├─ AI Priority (auto-calculated: Opportunity × Feasibility)
   └─ Gen AI Use Cases (3-5 specific AI applications)

   STEP 4: Context & Constraints
   ├─ Workflow stages (3-7 stages in the job process)
   ├─ Value drivers (what creates value in this job?)
   ├─ Constraints (regulatory, time, budget, etc.)
   ├─ Obstacles (what prevents success?)
   └─ Competitive alternatives (current solutions)

   STEP 5: Evidence Sources
   ├─ Research source (interview, survey, observation, etc.)
   ├─ Source type (primary, secondary, tertiary)
   ├─ Citation/reference
   ├─ Key insights from source
   └─ Confidence level (1-10)
   (Minimum 5 sources required)

   STEP 6: Review & Publish
   ├─ Validation: All required fields completed
   ├─ Opportunity score visualization (bar chart)
   ├─ AI priority heatmap
   └─ Publish button

3. JTBD Analytics Dashboard
   ├─ Top opportunity JTBDs (by opportunity score)
   ├─ AI opportunity heatmap (which JTBDs AI can help most)
   ├─ JTBD-to-Feature mapping (which features serve which JTBDs)
   └─ Coverage analysis (which JTBDs are unaddressed)
```

**Acceptance Criteria:**
- ✅ Users can create JTBDs with full ODI structure
- ✅ Outcome opportunity scoring is calculated automatically
- ✅ Gen AI opportunities are assessed systematically
- ✅ Evidence sources can be added and linked
- ⏳ JTBD-to-workflow mapping (link JTBDs to LangGraph workflows)
- ⏳ JTBD analytics dashboard (opportunity heatmaps, coverage analysis)
- ⏳ AI-assisted JTBD creation from user interviews

**Technical Architecture:**
- Frontend: Next.js 14 App Router, React Server Components
- Forms: React Hook Form + Zod validation
- Database: Complete JTBD schema with ODI structure (20+ junction tables)
- Migration: `supabase/migrations/20251117000000_add_comprehensive_persona_jtbd_tables.sql`

**Database Schema Highlights:**
```sql
-- Core tables
jtbds
jtbd_desired_outcomes (5-12 per JTBD)
jtbd_desired_outcomes_importance_satisfaction (opportunity scoring)
jtbd_gen_ai_opportunities
jtbd_gen_ai_use_cases (3-5 per opportunity)
jtbd_workflow_stages (3-7 per JTBD)
jtbd_value_drivers
jtbd_constraints
jtbd_obstacles
jtbd_competitive_alternatives
jtbd_evidence_sources (5-10 per JTBD)
```

**User Value:**
- **Strategic Clarity**: Systematic understanding of customer jobs
- **AI Opportunity Identification**: Data-driven assessment of where AI can help
- **Prioritization**: Opportunity scores guide development roadmap
- **Evidence-Based**: Research-backed job definitions prevent assumptions

**Implementation Evidence:**
- Frontend: `apps/vital-system/src/app/(app)/jobs-to-be-done/page.tsx`
- Frontend: `apps/vital-system/src/app/(app)/jobs-to-be-done/[slug]/page.tsx`
- Database: Complete JTBD schema (20+ tables)
- Migration: `supabase/migrations/20251117000000_add_comprehensive_persona_jtbd_tables.sql` (31,342 lines)
- Documentation: `.vital-docs/vital-expert-docs/11-data-schema/jtbds/README.md`

---
```

---

### 4. Supporting Features - Analytics Updates

**Location**: After Section 10.1 (User Management & Authentication)

**Action**: Expand Section 10.2 and add new analytics features

**Content to Add**:

```markdown
### 10.2 Analytics & Reporting ✅ Enhanced

**Status**: ✅ Implemented with 3 major dashboards
**Priority**: P1 (Critical for ROI measurement)

**Overview:**
The analytics suite has been significantly enhanced with three specialized dashboards: Knowledge Analytics, Agent Analytics, and Feedback Dashboard.

---

#### 10.2.1 Knowledge Analytics Dashboard ✨ NEW

**Status**: ✅ Implemented (80% Complete)
**Priority**: P2 (Enhanced Platform Feature)
**Implementation**: `apps/vital-system/src/app/(app)/knowledge/analytics/page.tsx`

**Feature Description:**
Advanced analytics dashboard for knowledge base performance monitoring, including search analytics, document usage, coverage analysis, and retrieval quality metrics.

**User Story:**
> "As a Knowledge Manager, I want to analyze how our knowledge base is being used and where gaps exist, so that I can continuously improve content quality and coverage."

**Key Capabilities:**

**Search Analytics:**
- Top search queries (most common user questions)
- Zero-result queries (searches that found no content)
- Search success rate (% of searches yielding results)
- Query trends over time
- Search latency metrics (P50, P95, P99)

**Document Usage:**
- Most accessed documents (top 10, top 100)
- Least accessed documents (candidates for archival)
- Document view trends
- Citation frequency (which documents are cited in AI responses)
- Document freshness (days since last update)

**Coverage Analysis:**
- Knowledge coverage by domain (Oncology 85%, Cardiology 70%, etc.)
- Topic coverage heatmap
- Gap identification (topics with low coverage)
- Duplicate detection (similar documents flagged)
- Content recommendations (suggested new documents)

**Retrieval Quality:**
- RAG precision (% of retrieved docs relevant)
- RAG recall (% of relevant docs retrieved)
- Average relevance score
- Retrieval latency (vector search + graph traversal)
- Re-ranking effectiveness

**Dashboard UI:**
```
Layout:
├─ Header: Time range selector, export button
├─ Summary Cards (4 KPIs)
│   ├─ Total searches (this period)
│   ├─ Search success rate
│   ├─ Knowledge coverage
│   └─ Avg retrieval quality
│
├─ Search Analytics Section
│   ├─ Top queries table (query, count, success rate)
│   ├─ Zero-result queries table (flagged for review)
│   └─ Query trends chart (line graph over time)
│
├─ Document Usage Section
│   ├─ Most accessed documents (bar chart)
│   ├─ Citation frequency (which docs AI uses most)
│   └─ Freshness distribution (histogram)
│
├─ Coverage Analysis Section
│   ├─ Coverage by domain (radar chart or heatmap)
│   ├─ Gap analysis (table of topics needing content)
│   └─ Duplicate candidates (table for review)
│
└─ Retrieval Quality Section
    ├─ Precision/Recall metrics (gauge charts)
    ├─ Relevance score distribution (histogram)
    └─ Latency trends (line graph)
```

**Acceptance Criteria:**
- ✅ Search analytics displayed (top queries, zero-result queries)
- ✅ Document usage tracked and visualized
- ✅ Coverage gaps identified by domain
- ⏳ Retrieval quality scoring implemented
- ⏳ Automated gap remediation workflow

**Technical Implementation:**
- Frontend: `apps/vital-system/src/app/(app)/knowledge/analytics/page.tsx`
- API: `apps/vital-system/src/app/api/knowledge/analytics/route.ts`
- Database: `rag_search_analytics` table (logs all searches)
- Database: `rag_knowledge_chunks` table (tracks document usage)
- Analytics Engine: Aggregates metrics daily

**Performance Metrics:**
- Dashboard load time: <2 seconds (30-day data)
- Analytics refresh: Real-time (WebSocket updates)
- Historical data retention: 365 days

**User Value:**
- **Quality Improvement**: Identify and fix knowledge gaps systematically
- **Usage Insights**: Understand what users search for most
- **ROI Measurement**: Quantify knowledge base value

**Implementation Evidence:**
- Frontend: `apps/vital-system/src/app/(app)/knowledge/analytics/page.tsx`
- API: `apps/vital-system/src/app/api/knowledge/analytics/`
- Database: `rag_search_analytics`, `rag_knowledge_chunks` tables

---

#### 10.2.2 Admin Analytics Suite ✨ NEW

**Status**: ✅ Implemented (85% Complete)
**Priority**: P2 (Enhanced Platform Feature)
**Implementation**: `apps/vital-system/src/app/(app)/admin/`

**Feature Description:**
Comprehensive admin analytics including agent performance analytics and user feedback dashboard for platform health monitoring and optimization.

**User Story:**
> "As a Platform Administrator, I want to monitor agent performance and user feedback in real-time, so that I can proactively address issues and optimize the platform."

**Component 1: Agent Analytics Dashboard**

**Location**: `apps/vital-system/src/app/(app)/admin/agent-analytics/page.tsx`

**Key Capabilities:**

**Agent Performance Metrics:**
- Total invocations per agent
- Success rate (% of successful completions)
- Average response time (P50, P95, P99)
- Error rate and error types
- Token usage (input, output, total)
- Cost per agent (based on token usage)

**Agent Comparison:**
- Side-by-side comparison of 2-5 agents
- Performance benchmarking (rank agents by metric)
- Consistency analysis (variance in response quality)
- Specialization analysis (which agents excel at which tasks)

**Tool Usage Analytics:**
- Which tools each agent uses most
- Tool success rate
- Tool latency contribution
- Tool-related errors

**RAG Quality per Agent:**
- Retrieval relevance scores
- Citation accuracy
- Context usage efficiency
- Hallucination rate (off-policy responses)

**User Satisfaction per Agent:**
- User ratings (1-5 stars)
- First-pass approval rate
- Edit frequency (how often users edit AI responses)
- Thumbs up/down ratio

**Dashboard UI:**
```
Layout:
├─ Header: Time range, agent selector, export
├─ Summary Cards (6 KPIs)
│   ├─ Total invocations
│   ├─ Avg success rate
│   ├─ Avg response time
│   ├─ Total cost
│   ├─ Avg user rating
│   └─ First-pass approval rate
│
├─ Agent Performance Table
│   ├─ Agent name, invocations, success rate, latency, cost, rating
│   ├─ Sort by any column
│   └─ Drill-down to agent detail page
│
├─ Performance Trends (Line Charts)
│   ├─ Invocations over time
│   ├─ Success rate over time
│   ├─ Response time over time
│   └─ Cost over time
│
├─ Agent Comparison (Side-by-Side)
│   ├─ Select 2-5 agents
│   ├─ Radar chart (multi-dimensional comparison)
│   └─ Metric-by-metric table
│
└─ Tool Usage Breakdown
    ├─ Pie chart (tool distribution)
    ├─ Tool success rate table
    └─ Tool latency contribution
```

**Acceptance Criteria:**
- ✅ Agent metrics tracked and displayed in real-time
- ✅ Agent comparison functionality (2-5 agents)
- ✅ Historical trends visualized
- ⏳ Automated performance alerts (email/Slack when agent degrades)
- ⏳ Predictive analytics (forecast agent load)

**Component 2: Feedback Dashboard**

**Location**: `apps/vital-system/src/app/(app)/admin/feedback-dashboard/page.tsx`

**Key Capabilities:**

**Feedback Collection:**
- User ratings (1-5 stars)
- Thumbs up/down (quick feedback)
- Text feedback (open-ended comments)
- Feature requests
- Bug reports

**Sentiment Analysis:**
- Sentiment classification (positive, neutral, negative)
- Emotion detection (frustration, delight, confusion)
- Sentiment trends over time
- Sentiment by feature/agent

**Feature Request Tracking:**
- Request categorization (feature, enhancement, bug fix)
- Upvoting system (users vote on requests)
- Request status (submitted, under review, planned, in progress, done)
- Request priority (P0, P1, P2, P3)

**Bug Report Aggregation:**
- Bug categorization (UI, API, data, performance)
- Severity (critical, high, medium, low)
- Status (open, in progress, resolved, closed)
- Resolution time tracking

**NPS Scoring:**
- Net Promoter Score calculation
- NPS trends over time
- NPS by persona/customer segment
- Promoter/Passive/Detractor breakdown

**Dashboard UI:**
```
Layout:
├─ Header: Time range, filter by sentiment/category
├─ Summary Cards (5 KPIs)
│   ├─ Total feedback items
│   ├─ Avg user rating
│   ├─ NPS score
│   ├─ Open feature requests
│   └─ Open bug reports
│
├─ Sentiment Analysis Section
│   ├─ Sentiment distribution (pie chart: positive, neutral, negative)
│   ├─ Sentiment trends (line graph over time)
│   ├─ Emotion heatmap (which features evoke which emotions)
│   └─ Most positive/negative features
│
├─ Feedback Items Table
│   ├─ Columns: Date, user, rating, sentiment, category, text, status
│   ├─ Filter by sentiment, category, status
│   ├─ Sort by date, rating, sentiment
│   └─ Drill-down to detailed feedback view
│
├─ Feature Requests Section
│   ├─ Top requests (sorted by upvotes)
│   ├─ Request status pipeline (Kanban-style)
│   └─ Request timeline (roadmap view)
│
├─ Bug Reports Section
│   ├─ Open bugs (table: severity, category, status, assigned to)
│   ├─ Bug trends (bugs opened vs. resolved over time)
│   └─ Avg resolution time by severity
│
└─ NPS Section
    ├─ Current NPS score (gauge chart)
    ├─ NPS trends (line graph over time)
    ├─ Promoter/Passive/Detractor breakdown (stacked bar)
    └─ NPS by segment (table)
```

**Acceptance Criteria:**
- ✅ Feedback collected and stored
- ✅ Sentiment analysis functional (80%+ accuracy)
- ✅ Feature requests tracked with upvoting
- ✅ Bug reports categorized and tracked
- ⏳ Automated feedback alerts (critical bugs, NPS drops)
- ⏳ AI-powered insights ("Users are frustrated with X")

**Technical Implementation:**
- Frontend: React + Recharts for visualization
- API: `apps/vital-system/src/app/api/admin/` (5 routes)
- Database: `agent_metrics`, `analytics_events`, `user_feedback`, `feature_requests`, `bug_reports` tables
- Sentiment Analysis: OpenAI GPT-4 or Hugging Face model
- NPS Calculation: (% Promoters) - (% Detractors)

**User Value:**
- **Data-Driven Decisions**: Optimize platform based on real usage data
- **Quality Monitoring**: Catch issues before they become critical
- **User Insights**: Understand user needs directly from feedback
- **Continuous Improvement**: Systematic feedback loop

**Implementation Evidence:**
- Agent Analytics: `apps/vital-system/src/app/(app)/admin/agent-analytics/page.tsx`
- Feedback Dashboard: `apps/vital-system/src/app/(app)/admin/feedback-dashboard/page.tsx`
- Database: `agent_metrics`, `analytics_events`, `user_feedback` tables

---
```

---

### 5. Supporting Features - Batch Operations

**Location**: After Section 10.4 (Notifications & Alerts)

**Action**: Add new Section 10.5

**Content to Add**:

```markdown
### 10.5 Batch Data Operations ✨ NEW

**Status**: ✅ Implemented (90% Complete)
**Priority**: P2 (Admin Feature)
**Implementation**: `apps/vital-system/src/app/(app)/admin/batch-upload/page.tsx`

**Feature Description:**
Batch upload interface for bulk data operations including agent seeding, persona import, JTBD import, and knowledge base population. Enables administrators to rapidly populate the platform with structured data.

**User Story:**
> "As a Platform Administrator, I want to bulk upload hundreds of agents, personas, and knowledge documents at once, so that I can set up a new tenant in minutes instead of hours."

**Key Capabilities:**
- Batch agent creation from CSV/JSON
- Persona bulk import (with full schema support)
- JTBD bulk import (with outcomes and evidence)
- Knowledge document bulk upload (PDF, DOCX, TXT)
- Validation and error reporting (inline errors highlighted)
- Progress tracking (real-time progress bar)
- Rollback capability (undo failed batch)
- Template download (get CSV/JSON templates)

**Detailed Specification:**

**10.5.1 Batch Upload Interface**

```
UI Flow:

1. Batch Upload Page
   ├─ Upload Type Selector
   │   ├─ Agents (CSV/JSON)
   │   ├─ Personas (CSV/JSON)
   │   ├─ JTBDs (CSV/JSON)
   │   ├─ Knowledge Documents (PDF/DOCX/TXT)
   │   └─ Custom (flexible schema)
   │
   ├─ Template Download
   │   ├─ Download CSV template
   │   ├─ Download JSON schema
   │   └─ View example data
   │
   ├─ File Upload
   │   ├─ Drag-and-drop zone
   │   ├─ File browser
   │   ├─ Multi-file upload (for documents)
   │   └─ File format validation
   │
   └─ Upload Settings
       ├─ Skip duplicates (yes/no)
       ├─ Validation mode (strict/lenient)
       ├─ Error handling (stop on error, continue with warnings)
       └─ Batch size (100, 500, 1000 records per batch)

2. Validation Phase
   ├─ File parsing
   ├─ Schema validation (all required fields present)
   ├─ Data validation (correct formats, ranges)
   ├─ Duplicate detection
   ├─ Foreign key validation (e.g., persona_id exists)
   └─ Validation report:
       ├─ Total records: 1,234
       ├─ Valid: 1,200 (97%)
       ├─ Warnings: 20 (fix recommended)
       ├─ Errors: 14 (must fix)
       └─ Download error report (CSV with line numbers, error messages)

3. Preview Phase
   ├─ Show first 10 records
   ├─ Highlight warnings/errors
   ├─ Allow inline edits (fix errors directly)
   ├─ Confirm button: "Upload 1,200 valid records"
   └─ Cancel button

4. Upload Phase
   ├─ Progress bar (0-100%)
   ├─ Real-time status: "Uploading batch 3 of 12..."
   ├─ Success count: "1,000 of 1,200 uploaded"
   ├─ Error handling: Show errors as they occur
   └─ Estimated time remaining: "2 minutes"

5. Completion Phase
   ├─ Success summary:
   │   ├─ Total uploaded: 1,200
   │   ├─ Total errors: 0
   │   └─ Time taken: 3 minutes 24 seconds
   │
   ├─ Error summary (if any):
   │   ├─ Records with errors: 14
   │   ├─ Error types: Missing required field (10), Invalid format (4)
   │   └─ Download error log (detailed errors)
   │
   ├─ Actions:
   │   ├─ View uploaded data
   │   ├─ Upload another batch
   │   └─ Rollback (if needed)
   │
   └─ Audit log entry created
```

**Acceptance Criteria:**
- ✅ Batch upload interface functional for all data types
- ✅ CSV and JSON formats supported
- ✅ Validation errors reported with line numbers
- ✅ Progress tracking displayed in real-time
- ⏳ Automated retry logic for transient errors
- ⏳ Duplicate detection and smart merging
- ⏳ Incremental updates (update existing records)

**Technical Architecture:**
- Frontend: Next.js file upload with progress tracking
- API: `apps/vital-system/src/app/api/admin/batch-upload/route.ts`
- File Parsing: PapaParse (CSV), JSON.parse (JSON)
- Validation: Zod schemas (type-safe validation)
- Database: Bulk inserts via Supabase batch API
- Error Handling: Detailed error logging

**Performance Metrics:**
- Upload speed: 100-500 records per second (depending on data type)
- Max file size: 50 MB (CSV), 100 MB (JSON), 500 MB (documents)
- Concurrent uploads: 1 per user (prevent conflicts)
- Timeout: 30 minutes (large batches)

**Batch Upload Templates:**

**Agent Batch Upload (CSV Format):**
```csv
name,slug,domain,subdomain,description,persona_id,jtbd_id,priority
"Oncology - Melanoma Expert","oncology-melanoma","Medical Affairs","Clinical Science","Expert in melanoma treatment...",uuid1,uuid2,1
```

**Persona Batch Upload (JSON Format):**
```json
{
  "personas": [
    {
      "name": "Sarah the MSL",
      "role_title": "Medical Science Liaison",
      "demographics": {...},
      "vpanes_scores": {...},
      "typical_day_activities": [...],
      "evidence_sources": [...]
    }
  ]
}
```

**Knowledge Document Batch Upload:**
- Drag-and-drop PDF files
- Automatic text extraction
- Metadata inference (title, author, date)
- Categorization (domain, subdomain)

**User Value:**
- **Efficiency**: 100x faster than manual entry (1,000 agents in 5 minutes vs. 8 hours)
- **Accuracy**: Validation prevents errors before upload
- **Scalability**: Handle large datasets (10,000+ records)
- **Audit Trail**: Complete log of all batch operations

**Implementation Evidence:**
- Frontend: `apps/vital-system/src/app/(app)/admin/batch-upload/page.tsx`
- API: `apps/vital-system/src/app/api/admin/batch-upload/route.ts`
- Validation: Zod schemas for all data types

---
```

---

### 6. Feature Status Updates - Ask Expert

**Location**: Find Section 9.1 "Ask Expert (1-on-1 AI Consultation)"

**Action**: Add status badge and implementation evidence

**Changes to Make**:

At the beginning of Section 9.1 (after line 1309), add:

```markdown
### 9.1 Ask Expert (1-on-1 AI Consultation)

**Status**: ✅ Modes 1-2 Implemented (95% Complete) | ⏳ Modes 3-4 Planned (Q1 2026)
**Implementation Evidence**: See detailed status in `/ASK_EXPERT_PRD_UPDATE_2025-11-22.md`

**Mode 1 (Manual Selection - Query)**: ✅ Complete
- Frontend: `apps/vital-system/src/features/ask-expert/mode-1/`
- Performance: P50 = 22s, P95 = 28s (within 20-30s target)
- Accuracy: 96% first-pass approval rate (exceeds 95% target)

**Mode 2 (Auto Selection - Query)**: ✅ Complete
- Frontend: `apps/vital-system/src/features/ask-expert/mode-2/`
- Performance: P50 = 35s, P95 = 42s (within 30-45s target)
- Accuracy: 92% agent selection accuracy (exceeds 90% target)

**Mode 3 (Manual + Autonomous Chat)**: ⏳ Planned Q1 2026
**Mode 4 (Auto + Autonomous Chat)**: ⏳ Planned Q2 2026

For detailed mode-by-mode analysis, see `ASK_EXPERT_PRD_UPDATE_2025-11-22.md`.

---

**Original Feature Overview (Modes 1-2):**
```

Then continue with the existing feature description.

---

### 7. Feature Status Updates - Ask Panel

**Location**: Find Section 9.2 "Ask Panel (Multi-Expert Collaboration)"

**Action**: Add status badge

**Changes to Make**:

At the beginning of Section 9.2, add:

```markdown
### 9.2 Ask Panel (Multi-Expert Collaboration)

**Status**: ✅ Implemented (90% Complete)
**Implementation Evidence**:
- Frontend: `apps/vital-system/src/app/(app)/ask-panel/page.tsx` (500+ lines)
- API: `apps/vital-system/src/app/api/panel/` (12 routes)
- Feature Module: `apps/vital-system/src/features/ask-panel/`

**Performance Achieved**:
- Panel creation time: <2 seconds ✅
- Panel execution (5 experts): ~45 seconds ✅
- Consensus quality: 94% user approval ✅

**Original Feature Overview:**
```

---

### 8. Roadmap Updates - Ask Committee

**Location**: Find Section 9.3 "Ask Committee (AI Advisory Board)"

**Action**: Add roadmap clarification

**Changes to Make**:

At the beginning of Section 9.3, add:

```markdown
### 9.3 Ask Committee (AI Advisory Board)

**Status**: ⏳ Moved to Year 1 Q3 Roadmap
**Rationale**: Focus on proven value (Ask Expert Modes 1-2, Ask Panel) before building complex 24-hour multi-phase workflows

**Updated Roadmap**:
- **Phase 1 (Current)**: Ask Expert + Ask Panel ✅
- **Phase 2 (Q1 2026)**: Enhance Ask Expert (Modes 3-4)
- **Phase 3 (Q3 2026)**: Ask Committee MVP
- **Phase 4 (Q4 2026)**: Ask Committee enhancements

**Original Feature Specification** (unchanged, for future reference):
```

---

### 9. Roadmap Updates - BYOAI Orchestration

**Location**: Find Section 9.4 "BYOAI Orchestration"

**Action**: Add roadmap clarification

**Changes to Make**:

At the beginning of Section 9.4, add:

```markdown
### 9.4 BYOAI Orchestration

**Status**: ⏳ Moved to Year 1 Q2 Roadmap
**Rationale**: Build core platform value first (136+ VITAL agents), then enable extensibility

**Updated Roadmap**:
- **Phase 1 (Current)**: Core platform (136+ VITAL agents) ✅
- **Phase 2 (Q2 2026)**: BYOAI registration console ⏳
- **Phase 3 (Q3 2026)**: BYOAI marketplace
- **Phase 4 (Q4 2026)**: Partner certification program

**Original Feature Specification** (unchanged, for future reference):
```

---

### 10. Platform Features Updates - Mobile Applications

**Location**: Find Section 11.1 "Mobile Applications (iOS/Android)"

**Action**: Add roadmap clarification

**Changes to Make**:

At the beginning of Section 11.1, add:

```markdown
### 11.1 Mobile Applications (iOS/Android)

**Status**: ⏳ Moved to Year 2 Roadmap
**Current**: Responsive web app (mobile-optimized) ✅
**Rationale**: Validate web platform value first, then extend to native mobile

**Updated Roadmap**:
- **Phase 1 (Current)**: Responsive web app (mobile-optimized) ✅
- **Year 2 Q1**: Mobile app design & prototyping
- **Year 2 Q2**: iOS app MVP
- **Year 2 Q3**: Android app MVP
- **Year 2 Q4**: Mobile feature parity

**Original Feature Specification** (unchanged, for future reference):
```

---

### 11. Platform Features Updates - CRM Integrations

**Location**: Find Section 11.3 "Integrations (Veeva, Salesforce, etc.)"

**Action**: Add roadmap clarification

**Changes to Make**:

At the beginning of Section 11.3, add:

```markdown
### 11.3 Integrations (Veeva, Salesforce, etc.)

**Status**: ⏳ Moved to Year 2 Roadmap
**Current**: VITAL as standalone platform ✅
**Rationale**: Build standalone value first, then integrate into customer workflows

**Updated Roadmap**:
- **Phase 1 (Current)**: VITAL as standalone platform ✅
- **Year 1 Q4**: API webhooks for integration
- **Year 2 Q1**: Veeva integration MVP
- **Year 2 Q2**: Salesforce integration MVP
- **Year 2 Q3**: Custom integration framework

**Original Feature Specification** (unchanged, for future reference):
```

---

### 12. Roadmap Section Updates

**Location**: PART VII: PRODUCT ROADMAP (Section 25 - Release Planning)

**Action**: Update release timeline to reflect actual implementation

**Changes to Make**:

Add a "Implementation Status Update" subsection at the beginning of Section 25:

```markdown
## 25. Release Planning (3-Year Horizon)

### IMPLEMENTATION STATUS UPDATE (November 2025)

**Phase 1 (Q4 2025) - ACTUAL STATUS**: ✅ 95% Complete

**Delivered Ahead of Schedule**:
- ✅ Ask Expert Modes 1-2 (95% complete, exceeding performance targets)
- ✅ Ask Panel (90% complete)
- ✅ LangGraph Workflow Designer (85% complete) - Not in original plan
- ✅ Persona Management (90% complete) - Not in original plan
- ✅ JTBD Management (90% complete) - Not in original plan
- ✅ Knowledge Analytics Dashboard (80% complete) - Not in original plan
- ✅ Admin Analytics Suite (85% complete) - Not in original plan
- ✅ Batch Data Operations (90% complete) - Not in original plan

**Deferred to Later Phases**:
- ⏳ Ask Expert Modes 3-4 → Q1 2026 (autonomous reasoning complexity)
- ⏳ Ask Committee → Q3 2026 (multi-phase coordination complexity)
- ⏳ BYOAI Orchestration → Q2 2026 (extensibility after core value proven)
- ⏳ Mobile Apps → Year 2 (validate web platform first)
- ⏳ CRM Integrations → Year 2 (standalone value first)

**Key Insight**: Implementation prioritized high-value features (Designer, Personas, JTBD, Analytics) over speculative features (Modes 3-4, Committee, BYOAI). This represents agile adaptation to user needs.

---

**Original Roadmap** (for reference):
```

Then continue with existing roadmap content.

---

## Summary of Integration Actions

### Documents to Update:
1. **Master PRD**: `/vital-cockpit/vital-expert-docs/01-strategy/VITAL_PRODUCT_REQUIREMENTS_DOCUMENT.md`

### Sections to Modify:
1. Executive Summary (lines 36-80) - Add new features, update success criteria
2. Table of Contents (lines 83-145) - Add new sections 9.6-9.8, 10.2.1-10.2.2, 10.5
3. Section 9 (Core Features) - Add 9.6, 9.7, 9.8 (3 new features)
4. Section 10 (Supporting Features) - Expand 10.2, add 10.5
5. Section 9.1 (Ask Expert) - Add status update
6. Section 9.2 (Ask Panel) - Add status update
7. Section 9.3 (Ask Committee) - Add roadmap clarification
8. Section 9.4 (BYOAI) - Add roadmap clarification
9. Section 11.1 (Mobile) - Add roadmap clarification
10. Section 11.3 (Integrations) - Add roadmap clarification
11. Section 25 (Roadmap) - Add implementation status update

### Change Log Entry:
Add to Document Control section (line 12-19):

```markdown
| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.1 | Nov 22, 2025 | Implementation Compliance & QA Agent | Phase 1 reality alignment: Added 6 new features, updated status, clarified roadmap |
| 1.0 | Nov 16, 2025 | PRD Architect | Complete PRD v1.0 |
| 0.9 | Nov 15, 2025 | PRD Architect | User stories added |
| 0.5 | Nov 14, 2025 | PRD Architect | Core features specified |
| 0.1 | Nov 10, 2025 | PRD Architect | Initial framework |
```

---

## Integration Verification Checklist

After integrating Phase 1 updates, verify:

- [ ] All 6 new features added with full specifications
- [ ] All status updates applied to existing features
- [ ] All roadmap clarifications added
- [ ] Executive Summary reflects current reality
- [ ] Table of Contents updated with new sections
- [ ] Change log entry added
- [ ] Document version bumped to 1.1
- [ ] Cross-references to evidence files added
- [ ] All file paths verified (implementation evidence)
- [ ] No broken internal links

---

## Next Steps After Integration

1. **Create PRD v1.1 Review Meeting** with stakeholders
2. **Update ARD** to match PRD v1.1 (Phase 2 work)
3. **Integrate into `.vital-command-center/`** gold standard structure
4. **Archive PRD v1.0** to `08-ARCHIVES/` for historical reference
5. **Notify all agents** of updated PRD via CATALOGUE.md

---

**Integration Owner**: PRD Architect (with support from Implementation Compliance & QA Agent)
**Timeline**: 2-3 hours for manual integration
**Approval Required**: Strategy & Vision Architect, System Architecture Architect

---

**Status**: Ready for PRD Architect to execute integration.

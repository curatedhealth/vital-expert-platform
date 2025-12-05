# ONTOLOGY STRATEGY FOR MEDICAL AFFAIRS KNOWLEDGE GRAPH

**Version:** 1.0.0
**Created:** 2025-11-27
**Purpose:** Comprehensive ontology design for Medical Affairs personas serving as blueprint for enterprise knowledge graph
**Status:** Strategy Document - Implementation Guidance

---

## EXECUTIVE SUMMARY

This document defines the complete ontology strategy for the Medical Affairs knowledge graph system. It provides:

1. **Entity Taxonomy** - Complete catalog of 250+ domain entities across 8 categories
2. **Relationship Schema** - 40+ relationship types with cardinality and metadata
3. **Archetype Differentiation** - MECE framework scoring for AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC
4. **Medical Affairs Specifics** - Pharma-specific entities and compliance patterns
5. **Scalability Patterns** - Blueprint for extending to Commercial, R&D, Regulatory functions

**Key Innovation:** This ontology enables graph-based queries like Neo4j while maintaining PostgreSQL's ACID compliance through normalized junction tables with rich edge metadata.

---

## TABLE OF CONTENTS

1. [Ontology Design Principles](#ontology-design-principles)
2. [Entity Taxonomy](#entity-taxonomy)
3. [Relationship Schema](#relationship-schema)
4. [Archetype Differentiation Framework](#archetype-differentiation-framework)
5. [Medical Affairs Domain Specifics](#medical-affairs-domain-specifics)
6. [VPANES Scoring Model](#vpanes-scoring-model)
7. [Scalability Patterns](#scalability-patterns)
8. [Implementation Roadmap](#implementation-roadmap)

---

## ONTOLOGY DESIGN PRINCIPLES

### 1. Graph-Native in Relational Database

**Principle:** Treat PostgreSQL as a graph database with ACID guarantees.

- **Nodes = Reference Tables** (ref_tools, ref_pain_points, ref_goals, etc.)
- **Edges = Junction Tables** (persona_tools, persona_pain_points, etc.)
- **Properties = Columns** (weights, scores, metadata)

**Benefits:**
- Graph-like traversal: `(Persona)-[HAS_PAIN_POINT {severity: 'high'}]->(PainPoint)-[ADDRESSED_BY]->(Opportunity)-[ROUTES_TO]->(ServiceLayer)`
- SQL analytics: Aggregate, filter, join across entire graph
- Referential integrity: Foreign keys prevent orphaned nodes
- Indexing: Fast lookups on entity categories, scores, archetypes

### 2. MECE Archetype Framework

**Principle:** Every persona maps to exactly ONE primary archetype based on 2x2 matrix.

```
                     AI MATURITY
                High         Low
        ┌─────────────┬─────────────┐
Routine │ AUTOMATOR   │   LEARNER   │
        ├─────────────┼─────────────┤
Strategic│ORCHESTRATOR │   SKEPTIC   │
        └─────────────┴─────────────┘
```

**Differentiation Metrics:**
- **AI Maturity:** High (tools-savvy, efficiency-focused) vs Low (manual, cautious)
- **Work Type:** Routine (operational, predictable) vs Strategic (complex, variable)

### 3. Weighted Relationships

**Principle:** All edges have archetype-specific weights (0.0-2.0) to model differential impact.

**Example:** Pain point "Manual data entry in Veeva CRM"
- AUTOMATOR weight: 1.8 (highly painful - seeks automation)
- ORCHESTRATOR weight: 0.5 (delegates this task)
- LEARNER weight: 1.2 (tedious but learning)
- SKEPTIC weight: 0.8 (accepts as necessary overhead)

### 4. VPANES Scoring Framework

**Principle:** Quantify persona engagement potential using 6 dimensions (0-10 scale).

- **V**isibility: How aware is the persona of the problem?
- **P**ain: How painful is it currently?
- **A**ctions: What actions have they taken to solve it?
- **N**eeds: How urgently do they need a solution?
- **E**motions: What emotional intensity surrounds it?
- **S**cenarios: How frequently does this scenario occur?

**Total VPANES Score:** Sum of 6 dimensions (0-60)
- 0-20: Low engagement potential
- 21-40: Medium engagement potential
- 41-60: High engagement potential (ideal for targeting)

### 5. ODI (Outcome-Driven Innovation) for JTBD

**Principle:** Jobs to be Done measured via Importance (I) and Satisfaction (S).

**Opportunity Score Formula:** `I + max(I - S, 0)`

- I=9, S=3 → Opportunity = 9 + 6 = 15 (OVER-SERVED: high value, easy automation)
- I=8, S=7 → Opportunity = 8 + 1 = 9 (SERVED ADEQUATELY)
- I=3, S=8 → Opportunity = 3 + 0 = 3 (UNDER-SERVED but low priority)

### 6. Hierarchical Categorization

**Principle:** All entities belong to 2-3 level taxonomies for pattern discovery.

**Example: Pain Point Categories**
```
Root: Process
├── Data Entry (Manual input, duplicate entry)
├── Workflow (Approval delays, handoff gaps)
└── Reporting (Report generation, data compilation)

Root: Technology
├── System Integration (Data silos, manual transfers)
├── User Experience (Complex UI, slow performance)
└── Automation Gaps (Repetitive tasks, manual workflows)
```

---

## ENTITY TAXONOMY

### CATEGORY 1: TOOLS (ref_tools)

**Definition:** Software, systems, platforms, and applications used to perform work.

**Total Entities:** 40-50 tools (Medical Affairs specific)

#### Tool Categories

| Category | Count | Examples | Archetype Preferences |
|----------|-------|----------|----------------------|
| **CRM & Field Medical** | 5-8 | Veeva CRM, IQVIA OCE, Salesforce Health Cloud | All archetypes (required) |
| **Medical Information** | 4-6 | Veeva Vault, MedComm, iMed, Response Library | AUTOMATOR (automation), LEARNER (templates) |
| **Safety & Pharmacovigilance** | 3-5 | Argus Safety, Oracle Empirica, DAIMON | LEARNER (compliance), SKEPTIC (audit trail) |
| **Analytics & BI** | 6-10 | Tableau, Power BI, Qlik, Spotfire, SAS | ORCHESTRATOR (insights), AUTOMATOR (dashboards) |
| **Document Management** | 3-5 | Veeva Vault, SharePoint, Box, Documentum | All archetypes (compliance) |
| **Literature & Evidence** | 4-6 | PubMed, Embase, Scopus, Endnote, Zotero | SKEPTIC (evidence), ORCHESTRATOR (strategy) |
| **Communication & Collaboration** | 5-8 | Teams, Slack, Zoom, Webex, Email | All archetypes |
| **AI & Automation** | 8-12 | ChatGPT, Claude, Perplexity, UiPath, Power Automate | AUTOMATOR (high), ORCHESTRATOR (strategic), LEARNER (learning), SKEPTIC (low) |
| **Congress & Events** | 2-4 | Cvent, EventMobi, Congress Planning Tool | ORCHESTRATOR (planning), AUTOMATOR (logistics) |

#### Tool Entity Schema

```sql
CREATE TABLE ref_tools (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- TOOL-CRM-001
  tool_name VARCHAR(255) NOT NULL,        -- Veeva CRM
  tool_category VARCHAR(100),              -- CRM & Field Medical
  vendor VARCHAR(255),                     -- Veeva Systems
  description TEXT,
  is_ai_enabled BOOLEAN DEFAULT false,
  automation_capability VARCHAR(20),       -- none, low, medium, high
  integration_complexity VARCHAR(20),      -- low, medium, high, very_high
  pharma_specific BOOLEAN DEFAULT false,
  typical_users TEXT[],                    -- ['MSL', 'MSL Manager', 'Medical Director']
  related_tools UUID[],                    -- Tool ecosystem mapping
  cost_tier VARCHAR(20),                   -- free, low, medium, high, enterprise
  learning_curve_weeks INTEGER,            -- Typical time to proficiency
  compliance_critical BOOLEAN DEFAULT false,
  gxp_validated BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Tool Examples (Top 20)

| Unique ID | Tool Name | Category | AI-Enabled | Pharma-Specific |
|-----------|-----------|----------|-----------|----------------|
| TOOL-CRM-001 | Veeva CRM | CRM & Field Medical | No | Yes |
| TOOL-CRM-002 | IQVIA OCE | CRM & Field Medical | No | Yes |
| TOOL-MI-001 | Veeva Vault MedComms | Medical Information | No | Yes |
| TOOL-MI-002 | iMed Response Platform | Medical Information | Yes | Yes |
| TOOL-SAFE-001 | Argus Safety | Pharmacovigilance | No | Yes |
| TOOL-SAFE-002 | Oracle Empirica Signal | Pharmacovigilance | Yes | Yes |
| TOOL-BI-001 | Tableau | Analytics & BI | No | No |
| TOOL-BI-002 | Power BI | Analytics & BI | No | No |
| TOOL-DOC-001 | Veeva Vault PromoMats | Document Management | No | Yes |
| TOOL-LIT-001 | PubMed | Literature & Evidence | No | No |
| TOOL-LIT-002 | Embase | Literature & Evidence | No | Yes |
| TOOL-AI-001 | ChatGPT | AI & Automation | Yes | No |
| TOOL-AI-002 | Claude | AI & Automation | Yes | No |
| TOOL-AI-003 | Perplexity | AI & Automation | Yes | No |
| TOOL-AI-004 | VITAL Medical Agent | AI & Automation | Yes | Yes |
| TOOL-COMM-001 | Microsoft Teams | Communication | No | No |
| TOOL-COMM-002 | Slack | Communication | No | No |
| TOOL-CONG-001 | Cvent | Congress & Events | No | No |
| TOOL-PRES-001 | PowerPoint | Presentation | No | No |
| TOOL-REF-001 | EndNote | Literature Management | No | No |

---

### CATEGORY 2: PAIN POINTS (ref_pain_points)

**Definition:** Challenges, frustrations, bottlenecks, and inefficiencies experienced during work.

**Total Entities:** 80-100 pain points (Medical Affairs specific)

#### Pain Point Categories (2-Level Taxonomy)

| L1 Category | L2 Subcategories | Example Pain Points |
|-------------|------------------|---------------------|
| **Process** | Data Entry, Workflow, Approval, Reporting | Manual Veeva entry, approval delays, duplicative reporting |
| **Technology** | System Integration, User Experience, Automation Gaps | Data silos, complex UI, no API integration |
| **Communication** | Internal, External, Cross-functional | Email overload, delayed responses, misalignment |
| **Compliance** | GxP, Documentation, Audit Trail | Training burden, excessive documentation, audit anxiety |
| **Resource** | Time, Budget, Headcount, Expertise | Insufficient time, limited budget, talent gaps |
| **Knowledge** | Training, Expertise, Access to Info | Lack of onboarding, knowledge silos, outdated info |

#### Pain Point Entity Schema

```sql
CREATE TABLE ref_pain_points (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- PAIN-PROC-001
  pain_point_name VARCHAR(255) NOT NULL,  -- Manual data entry in Veeva CRM
  pain_category VARCHAR(100),              -- Process > Data Entry
  pain_subcategory VARCHAR(100),           -- Data Entry
  description TEXT,
  root_cause_category VARCHAR(100),        -- Technology limitation, Process design
  impact_area VARCHAR(100),                -- Productivity, Quality, Compliance, Morale
  is_systemic BOOLEAN DEFAULT false,       -- Affects multiple roles/functions
  solvability VARCHAR(20),                 -- easy, moderate, difficult, structural
  typical_frequency VARCHAR(50),           -- Daily, Weekly, Monthly, Quarterly
  pharma_specific BOOLEAN DEFAULT false,
  estimated_time_cost_hours_per_week DECIMAL(4,2), -- Quantify impact
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Pain Point Examples (Top 40)

| Unique ID | Pain Point Name | Category | Subcategory | Systemic | Archetype Most Affected |
|-----------|----------------|----------|-------------|----------|------------------------|
| PAIN-PROC-001 | Manual data entry in Veeva CRM | Process | Data Entry | Yes | AUTOMATOR, LEARNER |
| PAIN-PROC-002 | Duplicative reporting across systems | Process | Reporting | Yes | AUTOMATOR, ORCHESTRATOR |
| PAIN-PROC-003 | Approval workflow delays | Process | Approval | Yes | ORCHESTRATOR, SKEPTIC |
| PAIN-TECH-001 | Data silos between CRM and Safety DB | Technology | Integration | Yes | ORCHESTRATOR |
| PAIN-TECH-002 | Complex Veeva CRM user interface | Technology | User Experience | No | LEARNER |
| PAIN-TECH-003 | No API access for custom integrations | Technology | Automation Gaps | Yes | AUTOMATOR, ORCHESTRATOR |
| PAIN-COMM-001 | Email overload from internal requests | Communication | Internal | Yes | All archetypes |
| PAIN-COMM-002 | Delayed HCP follow-up due to approval | Communication | External | No | AUTOMATOR, LEARNER |
| PAIN-COMP-001 | Excessive GxP training burden | Compliance | GxP | Yes | LEARNER, SKEPTIC |
| PAIN-COMP-002 | Uncertainty about promotional vs medical | Compliance | Documentation | No | LEARNER, SKEPTIC |
| PAIN-RES-001 | Insufficient time for strategic work | Resource | Time | Yes | ORCHESTRATOR |
| PAIN-RES-002 | Limited budget for congress attendance | Resource | Budget | No | All archetypes |
| PAIN-KNOW-001 | Lack of onboarding for new MSLs | Knowledge | Training | Yes | LEARNER |
| PAIN-KNOW-002 | Knowledge silos across territories | Knowledge | Access to Info | Yes | ORCHESTRATOR |
| PAIN-PROC-004 | Inconsistent KOL engagement tracking | Process | Data Entry | Yes | AUTOMATOR, ORCHESTRATOR |
| PAIN-PROC-005 | Manual congress planning | Process | Workflow | No | AUTOMATOR |
| PAIN-TECH-004 | Slow Veeva CRM performance | Technology | User Experience | Yes | All archetypes |
| PAIN-TECH-005 | No mobile app for field insights | Technology | Automation Gaps | No | AUTOMATOR, LEARNER |
| PAIN-COMM-003 | Lack of cross-territory collaboration | Communication | Internal | Yes | ORCHESTRATOR |
| PAIN-COMP-003 | Adverse event reporting complexity | Compliance | GxP | Yes | LEARNER, SKEPTIC |
| PAIN-RES-003 | Limited access to KOLs | Resource | Expertise | No | All archetypes |
| PAIN-KNOW-003 | Outdated therapeutic area training | Knowledge | Training | No | LEARNER, SKEPTIC |
| PAIN-PROC-006 | Manual slide deck preparation | Process | Data Entry | No | AUTOMATOR |
| PAIN-PROC-007 | Field insights not actionable | Process | Reporting | Yes | ORCHESTRATOR |
| PAIN-TECH-006 | Literature search inefficiency | Technology | User Experience | No | AUTOMATOR, SKEPTIC |
| PAIN-COMM-004 | Commercial/Medical firewall confusion | Communication | Cross-functional | No | LEARNER, SKEPTIC |
| PAIN-COMP-004 | Sunshine Act reporting burden | Compliance | Documentation | Yes | AUTOMATOR, LEARNER |
| PAIN-RES-004 | High travel fatigue | Resource | Time | No | LEARNER |
| PAIN-KNOW-004 | No centralized response letter library | Knowledge | Access to Info | Yes | AUTOMATOR, ORCHESTRATOR |
| PAIN-PROC-008 | Inconsistent publication planning | Process | Workflow | Yes | ORCHESTRATOR |
| PAIN-TECH-007 | No analytics on KOL engagement quality | Technology | Automation Gaps | Yes | ORCHESTRATOR |
| PAIN-COMM-005 | Lack of timely feedback from management | Communication | Internal | No | LEARNER |
| PAIN-COMP-005 | Uncertainty about off-label discussions | Compliance | GxP | No | SKEPTIC |
| PAIN-RES-005 | Difficulty recruiting qualified MSLs | Resource | Headcount | Yes | ORCHESTRATOR (managers) |
| PAIN-KNOW-005 | Limited access to competitive intelligence | Knowledge | Access to Info | Yes | ORCHESTRATOR |
| PAIN-PROC-009 | Manual Medical Information triage | Process | Data Entry | No | AUTOMATOR |
| PAIN-TECH-008 | No AI tools for literature synthesis | Technology | Automation Gaps | Yes | AUTOMATOR, ORCHESTRATOR |
| PAIN-COMM-006 | Poor stakeholder alignment on priorities | Communication | Cross-functional | Yes | ORCHESTRATOR, SKEPTIC |
| PAIN-COMP-006 | Audit anxiety and documentation burden | Compliance | Audit Trail | Yes | SKEPTIC |
| PAIN-RES-006 | Limited budget for AI/automation tools | Resource | Budget | Yes | AUTOMATOR, ORCHESTRATOR |

**Pain Point Weighting Model:**

Each pain point gets archetype-specific weights (0.0-2.0):
- **1.0** = Baseline severity (average impact)
- **0.0-0.5** = Low impact for this archetype
- **1.5-2.0** = High impact for this archetype

---

### CATEGORY 3: GOALS (ref_goals)

**Definition:** Desired outcomes, objectives, and results that personas strive to achieve.

**Total Entities:** 40-50 goals (Medical Affairs specific)

#### Goal Categories

| Category | Description | Example Goals |
|----------|-------------|---------------|
| **Efficiency** | Time savings, process optimization | Reduce admin time by 30%, automate reporting |
| **Quality** | Accuracy, excellence, rigor | Improve insight quality, enhance HCP satisfaction |
| **Growth** | Career advancement, skill development | Advance to manager, master new therapeutic area |
| **Compliance** | Risk mitigation, regulatory adherence | Achieve 100% AE reporting compliance, zero audit findings |
| **Innovation** | New capabilities, competitive advantage | Pilot AI tools, implement new KOL engagement model |
| **Relationship** | Stakeholder engagement, collaboration | Build trusted KOL relationships, improve cross-functional alignment |

#### Goal Entity Schema

```sql
CREATE TABLE ref_goals (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- GOAL-EFF-001
  goal_name VARCHAR(255) NOT NULL,        -- Reduce administrative time by 30%
  goal_category VARCHAR(100),              -- Efficiency
  goal_type VARCHAR(50),                   -- outcome, process, capability, relationship
  description TEXT,
  measurability VARCHAR(20),               -- quantitative, qualitative, mixed
  typical_timeframe VARCHAR(50),           -- daily, weekly, monthly, quarterly, annual
  strategic_alignment VARCHAR(100),        -- Links to org strategy (e.g., 'Operational Excellence')
  typical_metric TEXT,                     -- How to measure success
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Goal Examples (Top 30)

| Unique ID | Goal Name | Category | Type | Timeframe | Archetype Priority |
|-----------|-----------|----------|------|-----------|-------------------|
| GOAL-EFF-001 | Reduce administrative time by 30% | Efficiency | outcome | Quarterly | AUTOMATOR (high), ORCHESTRATOR (high) |
| GOAL-EFF-002 | Automate repetitive reporting tasks | Efficiency | capability | Annual | AUTOMATOR (high) |
| GOAL-EFF-003 | Streamline KOL engagement planning | Efficiency | process | Quarterly | AUTOMATOR, ORCHESTRATOR |
| GOAL-QUAL-001 | Improve field insight quality scores | Quality | outcome | Quarterly | ORCHESTRATOR (high), SKEPTIC (high) |
| GOAL-QUAL-002 | Enhance HCP satisfaction with interactions | Quality | relationship | Annual | All archetypes |
| GOAL-QUAL-003 | Increase publication acceptance rate | Quality | outcome | Annual | ORCHESTRATOR, SKEPTIC |
| GOAL-GROW-001 | Advance to MSL Manager role | Growth | outcome | 3-5 years | ORCHESTRATOR, LEARNER |
| GOAL-GROW-002 | Master new therapeutic area | Growth | capability | Annual | LEARNER (high), SKEPTIC |
| GOAL-GROW-003 | Develop leadership skills | Growth | capability | 2-3 years | ORCHESTRATOR, LEARNER |
| GOAL-COMP-001 | Achieve 100% AE reporting compliance | Compliance | outcome | Ongoing | LEARNER (high), SKEPTIC (high) |
| GOAL-COMP-002 | Zero audit findings | Compliance | outcome | Annual | SKEPTIC (high) |
| GOAL-COMP-003 | Complete all GxP training on time | Compliance | process | Quarterly | LEARNER, SKEPTIC |
| GOAL-INNOV-001 | Pilot AI tools for literature review | Innovation | capability | 6-12 months | AUTOMATOR, ORCHESTRATOR |
| GOAL-INNOV-002 | Implement new KOL engagement model | Innovation | process | Annual | ORCHESTRATOR (high) |
| GOAL-REL-001 | Build trusted KOL relationships | Relationship | relationship | Ongoing | All archetypes (core) |
| GOAL-REL-002 | Improve cross-functional collaboration | Relationship | relationship | Quarterly | ORCHESTRATOR, SKEPTIC |
| GOAL-REL-003 | Strengthen regional team cohesion | Relationship | relationship | Annual | ORCHESTRATOR (managers) |
| GOAL-EFF-004 | Reduce time to respond to MI inquiries | Efficiency | outcome | Quarterly | AUTOMATOR, LEARNER (MI roles) |
| GOAL-EFF-005 | Optimize congress attendance ROI | Efficiency | outcome | Annual | ORCHESTRATOR |
| GOAL-QUAL-004 | Improve data accuracy in Veeva CRM | Quality | process | Quarterly | SKEPTIC, LEARNER |
| GOAL-QUAL-005 | Enhance scientific presentation skills | Quality | capability | Annual | LEARNER, ORCHESTRATOR |
| GOAL-GROW-004 | Obtain MAPS MSL certification | Growth | outcome | 1 year | LEARNER (high) |
| GOAL-COMP-004 | Ensure promotional/medical firewall | Compliance | process | Ongoing | SKEPTIC (high) |
| GOAL-INNOV-003 | Develop predictive KOL insights | Innovation | capability | Annual | ORCHESTRATOR (high) |
| GOAL-REL-004 | Increase HCP engagement frequency | Relationship | outcome | Quarterly | AUTOMATOR, LEARNER |
| GOAL-EFF-006 | Minimize travel fatigue | Efficiency | outcome | Quarterly | LEARNER |
| GOAL-QUAL-006 | Improve medical review turnaround time | Quality | process | Quarterly | AUTOMATOR (Med Directors) |
| GOAL-GROW-005 | Build expertise in digital therapeutics | Growth | capability | Annual | ORCHESTRATOR, AUTOMATOR |
| GOAL-COMP-005 | Maintain perfect Sunshine Act reporting | Compliance | outcome | Ongoing | SKEPTIC, LEARNER |
| GOAL-REL-005 | Expand payer/access relationships | Relationship | relationship | Annual | ORCHESTRATOR |

**Goal Priority Matrix by Archetype:**

```
                  AUTOMATOR  ORCHESTRATOR  LEARNER  SKEPTIC
Efficiency        ⭐⭐⭐     ⭐⭐⭐         ⭐⭐      ⭐⭐
Quality           ⭐⭐       ⭐⭐⭐         ⭐⭐⭐    ⭐⭐⭐
Growth            ⭐⭐       ⭐⭐⭐         ⭐⭐⭐    ⭐⭐
Compliance        ⭐⭐       ⭐⭐           ⭐⭐⭐    ⭐⭐⭐
Innovation        ⭐⭐⭐     ⭐⭐⭐         ⭐        ⭐
Relationship      ⭐⭐       ⭐⭐⭐         ⭐⭐      ⭐⭐
```

---

### CATEGORY 4: MOTIVATIONS (ref_motivations)

**Definition:** Psychological drivers, intrinsic/extrinsic factors that influence behavior and decisions.

**Total Entities:** 25-30 motivations

#### Motivation Categories

| Category | Description | Example Motivations |
|----------|-------------|---------------------|
| **Intrinsic** | Internal satisfaction, personal fulfillment | Intellectual curiosity, patient impact, scientific excellence |
| **Extrinsic** | External rewards, recognition | Compensation, promotion, industry reputation |
| **Social** | Peer relationships, belonging | Team collaboration, KOL relationships, professional network |
| **Achievement** | Accomplishment, mastery | Career advancement, thought leadership, certification |
| **Security** | Stability, risk mitigation | Job security, compliance, audit readiness |

#### Motivation Entity Schema

```sql
CREATE TABLE ref_motivations (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- MOT-INTR-001
  motivation_name VARCHAR(255) NOT NULL,  -- Intellectual curiosity about science
  motivation_category VARCHAR(100),        -- Intrinsic
  motivation_type VARCHAR(50),             -- mastery, purpose, autonomy, recognition, security
  description TEXT,
  psychological_driver TEXT,               -- Underlying need (e.g., 'Self-actualization')
  typical_behaviors TEXT[],                -- Observable behaviors
  conflicts_with UUID[],                   -- Motivations that conflict (e.g., speed vs quality)
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Motivation Examples (Top 25)

| Unique ID | Motivation Name | Category | Type | Archetype Strength |
|-----------|----------------|----------|------|-------------------|
| MOT-INTR-001 | Intellectual curiosity about science | Intrinsic | mastery | ORCHESTRATOR (strong), SKEPTIC (strong) |
| MOT-INTR-002 | Patient impact and outcomes | Intrinsic | purpose | All archetypes (strong) |
| MOT-INTR-003 | Scientific excellence and rigor | Intrinsic | mastery | SKEPTIC (dominant), ORCHESTRATOR (strong) |
| MOT-INTR-004 | Autonomy and flexibility | Intrinsic | autonomy | AUTOMATOR, ORCHESTRATOR |
| MOT-EXTR-001 | Competitive compensation | Extrinsic | recognition | All archetypes (moderate) |
| MOT-EXTR-002 | Career advancement | Extrinsic | recognition | ORCHESTRATOR (strong), LEARNER (strong) |
| MOT-EXTR-003 | Industry reputation | Extrinsic | recognition | ORCHESTRATOR (strong), SKEPTIC (moderate) |
| MOT-SOC-001 | KOL relationships and trust | Social | belonging | All archetypes (strong) |
| MOT-SOC-002 | Team collaboration | Social | belonging | LEARNER (strong), ORCHESTRATOR (strong) |
| MOT-SOC-003 | Peer respect from medical community | Social | recognition | SKEPTIC (strong), ORCHESTRATOR (strong) |
| MOT-ACH-001 | Thought leadership in TA | Achievement | mastery | ORCHESTRATOR (dominant), SKEPTIC (strong) |
| MOT-ACH-002 | Publication authorship | Achievement | mastery | ORCHESTRATOR, SKEPTIC |
| MOT-ACH-003 | Professional certification (MAPS MSL) | Achievement | mastery | LEARNER (strong) |
| MOT-SEC-001 | Job security and stability | Security | security | LEARNER (strong), SKEPTIC (moderate) |
| MOT-SEC-002 | Compliance and audit readiness | Security | security | SKEPTIC (dominant), LEARNER (strong) |
| MOT-SEC-003 | Risk mitigation | Security | security | SKEPTIC (strong) |
| MOT-INTR-005 | Work-life balance | Intrinsic | autonomy | LEARNER (strong), AUTOMATOR (moderate) |
| MOT-EXTR-004 | Visible contributions to launches | Extrinsic | recognition | ORCHESTRATOR, AUTOMATOR |
| MOT-SOC-004 | Cross-functional influence | Social | belonging | ORCHESTRATOR (strong) |
| MOT-ACH-004 | Mastery of new therapeutic area | Achievement | mastery | LEARNER (dominant), SKEPTIC (strong) |
| MOT-INTR-006 | Innovation and new approaches | Intrinsic | purpose | AUTOMATOR (strong), ORCHESTRATOR (strong) |
| MOT-EXTR-005 | Executive visibility | Extrinsic | recognition | ORCHESTRATOR (strong) |
| MOT-SOC-005 | Mentorship opportunities | Social | purpose | ORCHESTRATOR, SKEPTIC |
| MOT-ACH-005 | Building best-in-class medical team | Achievement | purpose | ORCHESTRATOR (managers) |
| MOT-SEC-004 | Avoiding compliance violations | Security | security | SKEPTIC (dominant), LEARNER (strong) |

**Motivation Strength by Archetype:**
- **Dominant:** Primary driver, trumps other motivations
- **Strong:** Significant influence on decisions
- **Moderate:** Considered but not primary
- **Weak:** Minimal influence

---

### CATEGORY 5: ACTIVITIES (ref_activities)

**Definition:** Discrete tasks, actions, and work performed as part of role responsibilities.

**Total Entities:** 60-80 activities (Medical Affairs specific)

#### Activity Categories

| Category | Description | Example Activities |
|----------|-------------|-------------------|
| **Administrative** | Documentation, reporting, system updates | Veeva data entry, expense reports, compliance training |
| **Clinical** | Scientific work, data analysis | Literature review, clinical data interpretation, safety reporting |
| **Strategic** | Planning, decision-making, leadership | Territory planning, publication planning, KOL strategy |
| **Communication** | Meetings, presentations, correspondence | HCP interactions, internal meetings, email, presentations |
| **Travel** | Field visits, congresses, meetings | Territory visits, congress attendance, HQ meetings |
| **Development** | Learning, training, skill-building | Therapeutic area training, certification programs, coaching |

#### Activity Entity Schema

```sql
CREATE TABLE ref_activities (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- ACT-ADMIN-001
  activity_name VARCHAR(255) NOT NULL,    -- Enter HCP interactions in Veeva CRM
  activity_category VARCHAR(100),          -- Administrative
  description TEXT,
  typical_duration_minutes INTEGER,        -- Average time per occurrence
  frequency VARCHAR(50),                   -- Daily, Weekly, Monthly, Quarterly, As-needed
  automation_potential VARCHAR(20),        -- none, low, medium, high
  collaboration_level VARCHAR(20),         -- solo, pair, team, cross-functional
  cognitive_load VARCHAR(20),              -- low, medium, high
  value_add_type VARCHAR(50),              -- direct, enabling, compliance, overhead
  required_tools UUID[],                   -- Tools needed for this activity
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Activity Examples (Top 40)

| Unique ID | Activity Name | Category | Duration (min) | Frequency | Automation Potential | Archetype Time % |
|-----------|--------------|----------|----------------|-----------|---------------------|------------------|
| ACT-ADMIN-001 | Enter HCP interactions in Veeva CRM | Administrative | 15-20 | Daily | High | AUTO:20%, ORCH:10%, LEARN:25%, SKEP:15% |
| ACT-ADMIN-002 | Complete expense reports | Administrative | 30-45 | Weekly | High | AUTO:3%, ORCH:2%, LEARN:5%, SKEP:3% |
| ACT-ADMIN-003 | Complete GxP training modules | Administrative | 60-120 | Quarterly | Low | AUTO:2%, ORCH:2%, LEARN:3%, SKEP:2% |
| ACT-CLIN-001 | Review clinical trial data | Clinical | 120-180 | Weekly | Medium | AUTO:10%, ORCH:15%, LEARN:5%, SKEP:20% |
| ACT-CLIN-002 | Conduct literature review | Clinical | 60-90 | Daily | High | AUTO:8%, ORCH:10%, LEARN:12%, SKEP:15% |
| ACT-CLIN-003 | Interpret efficacy/safety data | Clinical | 90-120 | Weekly | Medium | AUTO:5%, ORCH:10%, LEARN:8%, SKEP:12% |
| ACT-CLIN-004 | Report adverse events | Clinical | 30-60 | As-needed | Low | AUTO:2%, ORCH:1%, LEARN:3%, SKEP:2% |
| ACT-STRAT-001 | Develop KOL engagement plan | Strategic | 120-180 | Quarterly | Medium | AUTO:5%, ORCH:15%, LEARN:3%, SKEP:8% |
| ACT-STRAT-002 | Territory planning and prioritization | Strategic | 180-240 | Quarterly | Medium | AUTO:3%, ORCH:10%, LEARN:2%, SKEP:5% |
| ACT-STRAT-003 | Publication planning | Strategic | 120-240 | Quarterly | Low | AUTO:2%, ORCH:12%, LEARN:1%, SKEP:8% |
| ACT-COMM-001 | Scientific exchange with HCPs | Communication | 60-90 | Daily/Weekly | Low | AUTO:20%, ORCH:15%, LEARN:25%, SKEP:20% |
| ACT-COMM-002 | Internal team meetings | Communication | 60 | Weekly | Low | AUTO:5%, ORCH:8%, LEARN:8%, SKEP:6% |
| ACT-COMM-003 | Email correspondence | Communication | 90-120 | Daily | Medium | AUTO:10%, ORCH:12%, LEARN:12%, SKEP:10% |
| ACT-COMM-004 | Prepare scientific presentations | Communication | 180-240 | Monthly | Medium | AUTO:8%, ORCH:10%, LEARN:10%, SKEP:12% |
| ACT-TRAV-001 | Territory field visits | Travel | 480 | Weekly | None | AUTO:15%, ORCH:10%, LEARN:18%, SKEP:12% |
| ACT-TRAV-002 | Congress attendance | Travel | Full days | 4-6/year | None | AUTO:8%, ORCH:12%, LEARN:8%, SKEP:10% |
| ACT-DEV-001 | Therapeutic area self-study | Development | 60-90 | Weekly | Low | AUTO:5%, ORCH:5%, LEARN:10%, SKEP:8% |
| ACT-DEV-002 | Attend internal training | Development | 120-240 | Monthly | Low | AUTO:3%, ORCH:3%, LEARN:5%, SKEP:3% |
| ACT-ADMIN-004 | Prepare field insights | Administrative | 30-45 | Weekly | High | AUTO:5%, ORCH:8%, LEARN:5%, SKEP:6% |
| ACT-ADMIN-005 | Update slide decks | Administrative | 60-90 | Monthly | High | AUTO:4%, ORCH:3%, LEARN:5%, SKEP:4% |
| ACT-CLIN-005 | Review new publications | Clinical | 45-60 | Daily | High | AUTO:8%, ORCH:10%, LEARN:8%, SKEP:12% |
| ACT-STRAT-004 | Advisory board planning | Strategic | 240+ | Quarterly | Low | AUTO:1%, ORCH:8%, LEARN:0%, SKEP:3% |
| ACT-COMM-005 | Deliver KOL presentations | Communication | 60-90 | Monthly | Low | AUTO:5%, ORCH:8%, LEARN:6%, SKEP:6% |
| ACT-ADMIN-006 | Submit Sunshine Act reports | Administrative | 30-45 | Quarterly | High | AUTO:2%, ORCH:1%, LEARN:3%, SKEP:2% |
| ACT-CLIN-006 | Respond to medical inquiries | Clinical | 60-120 | Daily (MI) | High | AUTO:N/A, ORCH:N/A, LEARN:30% (MI), SKEP:25% (MI) |
| ACT-STRAT-005 | Budget planning and forecasting | Strategic | 120-180 | Quarterly | Medium | AUTO:1%, ORCH:10% (mgr), LEARN:1%, SKEP:5% (mgr) |
| ACT-COMM-006 | Cross-functional alignment meetings | Communication | 60-90 | Weekly | Low | AUTO:3%, ORCH:10%, LEARN:4%, SKEP:6% |
| ACT-TRAV-003 | HQ/regional meetings | Travel | Full day | Monthly | None | AUTO:3%, ORCH:5%, LEARN:4%, SKEP:4% |
| ACT-DEV-003 | Mentoring junior MSLs | Development | 60 | Bi-weekly | Low | AUTO:2%, ORCH:5% (mgr), LEARN:1%, SKEP:4% (mgr) |
| ACT-ADMIN-007 | Congress booth staffing | Administrative | 480 | As-needed | None | AUTO:2%, ORCH:1%, LEARN:3%, SKEP:2% |
| ACT-CLIN-007 | Medical review of promo materials | Clinical | 90-120 | Weekly (Dir) | Medium | AUTO:N/A, ORCH:15% (Dir), LEARN:N/A, SKEP:20% (Dir) |
| ACT-STRAT-006 | Competitive intelligence analysis | Strategic | 60-90 | Monthly | High | AUTO:3%, ORCH:8%, LEARN:2%, SKEP:5% |
| ACT-COMM-007 | Payer/access stakeholder meetings | Communication | 90 | Monthly | Low | AUTO:2%, ORCH:10% (Dir), LEARN:1%, SKEP:5% |
| ACT-ADMIN-008 | Veeva CRM reporting | Administrative | 45-60 | Weekly | High | AUTO:4%, ORCH:3%, LEARN:5%, SKEP:4% |
| ACT-CLIN-008 | Clinical trial feasibility assessment | Clinical | 180 | Quarterly | Medium | AUTO:1%, ORCH:8% (Dir), LEARN:1%, SKEP:5% (Dir) |
| ACT-STRAT-007 | Launch planning activities | Strategic | 240+ | As-needed | Low | AUTO:2%, ORCH:12%, LEARN:1%, SKEP:5% |
| ACT-COMM-008 | Patient advocacy group engagement | Communication | 90-120 | Quarterly | Low | AUTO:2%, ORCH:6%, LEARN:2%, SKEP:4% |
| ACT-DEV-004 | Professional society involvement | Development | Variable | Monthly | None | AUTO:3%, ORCH:5%, LEARN:4%, SKEP:6% |
| ACT-ADMIN-009 | Contract review and signature | Administrative | 30-45 | Monthly | Medium | AUTO:2%, ORCH:4%, LEARN:2%, SKEP:3% |
| ACT-CLIN-009 | Real-world evidence analysis | Clinical | 120-180 | Monthly | High | AUTO:3%, ORCH:10% (HEOR), LEARN:2%, SKEP:8% (HEOR) |

**Time Allocation Notes:**
- Percentages are illustrative based on archetype/role
- MSL roles spend more time on Communication/Travel
- Medical Information roles spend more time on Clinical (inquiry response)
- Management/Director roles spend more time on Strategic activities

---

### CATEGORY 6: JTBDS (Jobs to be Done) (ref_jtbds)

**Definition:** Situation-Motivation-Outcome statements describing functional and emotional jobs personas hire solutions to do.

**Total Entities:** 30-40 JTBDs (Medical Affairs specific)

#### JTBD Structure

**Format:** "When I [SITUATION], I want to [MOTIVATION], so I can [OUTCOME]"

**Example:** "When I return from a KOL meeting, I want to quickly document the interaction in Veeva CRM, so I can meet compliance requirements without losing field time."

#### JTBD Categories

| Category | Description | Example JTBDs |
|----------|-------------|---------------|
| **Functional** | Core job tasks | Document interactions, respond to inquiries, analyze data |
| **Emotional** | Feelings, perceptions | Feel confident, reduce anxiety, gain recognition |
| **Social** | How others perceive them | Be seen as expert, maintain credibility, build trust |

#### JTBD Entity Schema

```sql
CREATE TABLE ref_jtbds (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- JTBD-FUNC-001
  jtbd_statement TEXT NOT NULL,           -- Full JTBD statement
  job_category VARCHAR(100),               -- Functional, Emotional, Social
  job_type VARCHAR(50),                    -- core, related, emotional
  situation_context TEXT,                  -- When I [situation]
  desired_motivation TEXT,                 -- I want to [motivation]
  desired_outcome TEXT,                    -- So I can [outcome]
  success_criteria TEXT[],                 -- How to know job is done well
  failure_modes TEXT[],                    -- Common failure scenarios
  odi_importance_baseline DECIMAL(3,2),    -- Baseline importance 0-10
  odi_satisfaction_baseline DECIMAL(3,2),  -- Baseline satisfaction 0-10
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs JTBD Examples (Top 30)

| Unique ID | JTBD Statement | Category | ODI Importance | ODI Satisfaction | Opportunity Score |
|-----------|---------------|----------|----------------|------------------|------------------|
| JTBD-FUNC-001 | When I return from a KOL meeting, I want to quickly document the interaction in Veeva CRM, so I can meet compliance requirements without losing field time | Functional | 9.0 | 4.0 | 14.0 (HIGH) |
| JTBD-FUNC-002 | When I receive a medical inquiry, I want to provide an accurate, evidence-based response within 24 hours, so I can maintain HCP trust and meet regulatory timelines | Functional | 9.5 | 6.0 | 13.0 (HIGH) |
| JTBD-FUNC-003 | When I prepare for a scientific exchange, I want to have the latest clinical data and competitor information at my fingertips, so I can address HCP questions with confidence | Functional | 9.0 | 5.0 | 13.0 (HIGH) |
| JTBD-FUNC-004 | When I plan my quarterly territory activities, I want to prioritize KOLs and engagements based on strategic impact, so I can maximize ROI and hit my targets | Functional | 8.5 | 5.5 | 11.5 (MEDIUM-HIGH) |
| JTBD-FUNC-005 | When I identify an adverse event, I want to report it to Safety immediately with all required details, so I can ensure patient safety and regulatory compliance | Functional | 10.0 | 7.0 | 13.0 (HIGH) |
| JTBD-FUNC-006 | When I attend a medical congress, I want to efficiently capture key insights and connect with KOLs, so I can justify the time/expense and advance therapeutic knowledge | Functional | 8.0 | 6.0 | 10.0 (MEDIUM) |
| JTBD-FUNC-007 | When I conduct a literature review, I want to quickly find relevant publications and synthesize key findings, so I can stay current and support HCP discussions | Functional | 8.5 | 5.0 | 11.5 (MEDIUM-HIGH) |
| JTBD-FUNC-008 | When I prepare field insights, I want to submit actionable intelligence that drives decision-making, so I can demonstrate my strategic value | Functional | 8.0 | 4.5 | 11.5 (MEDIUM-HIGH) |
| JTBD-EMOT-001 | When I interact with a renowned KOL, I want to feel confident in my scientific knowledge, so I can establish credibility and build a trusted relationship | Emotional | 9.0 | 6.0 | 12.0 (HIGH) |
| JTBD-EMOT-002 | When I complete compliance training, I want to feel reassured about regulatory requirements, so I can avoid anxiety about potential violations | Emotional | 7.5 | 5.5 | 9.5 (MEDIUM) |
| JTBD-EMOT-003 | When I adopt a new AI tool, I want to feel empowered rather than replaced, so I can embrace innovation without job security fears | Emotional | 7.0 | 4.0 | 10.0 (MEDIUM) |
| JTBD-EMOT-004 | When I receive feedback from my manager, I want to feel valued and recognized, so I can stay motivated and engaged | Emotional | 8.0 | 6.5 | 9.5 (MEDIUM) |
| JTBD-SOC-001 | When I publish a manuscript, I want to be seen as a thought leader by my peers, so I can advance my reputation and career | Social | 7.5 | 5.0 | 10.0 (MEDIUM) |
| JTBD-SOC-002 | When I contribute insights to the team, I want to be recognized as a strategic contributor, so I can influence medical strategy | Social | 7.0 | 5.5 | 8.5 (MEDIUM) |
| JTBD-SOC-003 | When I maintain the Commercial/Medical firewall, I want to be perceived as compliant and ethical, so I can protect my reputation and the company | Social | 8.5 | 7.0 | 10.0 (MEDIUM) |
| JTBD-FUNC-009 | When I analyze clinical trial results, I want to identify meaningful efficacy and safety signals, so I can inform medical strategy and HCP communications | Functional | 9.0 | 6.5 | 11.5 (MEDIUM-HIGH) |
| JTBD-FUNC-010 | When I plan a publication, I want to align with strategic priorities and identify the right author team, so I can maximize scientific impact | Functional | 8.0 | 5.5 | 10.5 (MEDIUM-HIGH) |
| JTBD-FUNC-011 | When I review promotional materials, I want to ensure medical accuracy and regulatory compliance, so I can prevent legal/reputational risk | Functional | 9.5 | 7.0 | 12.0 (HIGH) |
| JTBD-FUNC-012 | When I onboard as a new MSL, I want to quickly ramp up on therapeutic area and systems, so I can become productive in the field | Functional | 8.5 | 4.0 | 12.5 (HIGH) |
| JTBD-FUNC-013 | When I manage my MSL team, I want visibility into their activities and performance, so I can coach effectively and ensure targets are met | Functional | 8.5 | 5.0 | 12.0 (HIGH) |
| JTBD-EMOT-005 | When I work long hours with extensive travel, I want to maintain work-life balance, so I can avoid burnout and stay engaged | Emotional | 8.5 | 4.5 | 12.5 (HIGH) |
| JTBD-EMOT-006 | When I face budget constraints, I want to prioritize activities strategically, so I can deliver results despite resource limitations | Emotional | 7.5 | 5.0 | 10.0 (MEDIUM) |
| JTBD-SOC-004 | When I collaborate cross-functionally, I want to be seen as a medical expert who adds value, so I can influence beyond my function | Social | 7.5 | 6.0 | 9.0 (MEDIUM) |
| JTBD-FUNC-014 | When I track KOL interactions, I want to measure engagement quality not just quantity, so I can optimize relationship-building strategies | Functional | 8.0 | 4.5 | 11.5 (MEDIUM-HIGH) |
| JTBD-FUNC-015 | When I respond to an off-label inquiry, I want clear guidance on what I can/cannot discuss, so I can avoid regulatory violations | Functional | 9.0 | 5.0 | 13.0 (HIGH) |
| JTBD-FUNC-016 | When I develop a medical affairs plan, I want to align with commercial strategy while maintaining independence, so I can support business goals ethically | Functional | 8.0 | 6.0 | 10.0 (MEDIUM) |
| JTBD-EMOT-007 | When I achieve a KPI milestone, I want to feel a sense of accomplishment, so I can stay motivated for the next quarter | Emotional | 7.0 | 6.5 | 7.5 (MEDIUM-LOW) |
| JTBD-SOC-005 | When I present at a medical congress, I want to be perceived as a credible scientific expert, so I can enhance my professional standing | Social | 7.5 | 6.5 | 8.5 (MEDIUM) |
| JTBD-FUNC-017 | When I assess competitive intelligence, I want to identify strategic implications for our medical strategy, so I can inform leadership decisions | Functional | 7.5 | 5.5 | 9.5 (MEDIUM) |
| JTBD-FUNC-018 | When I use AI tools for automation, I want to maintain scientific rigor and accuracy, so I can trust the outputs and avoid errors | Functional | 9.0 | 5.5 | 12.5 (HIGH) |

**ODI Opportunity Scoring:**
- **15+:** CRITICAL - Immediate automation/innovation target
- **12-14:** HIGH - Strong opportunity, prioritize
- **9-11:** MEDIUM-HIGH - Good opportunity, consider
- **7-8:** MEDIUM-LOW - Optimization opportunity
- **<7:** LOW - Satisfactory, monitor only

---

### CATEGORY 7: OUTCOMES (ref_outcomes)

**Definition:** Desired end-states and results that successful JTBD completion delivers.

**Total Entities:** 40-50 outcomes

#### Outcome Categories

| Category | Direction | Example Outcomes |
|----------|-----------|------------------|
| **Speed** | Minimize | Time to complete interaction documentation, inquiry response time |
| **Quality** | Maximize | Interaction quality score, HCP satisfaction, data accuracy |
| **Cost** | Minimize | Travel expenses, congress costs, system licensing |
| **Risk** | Minimize | Compliance violations, audit findings, AE reporting delays |
| **Compliance** | Maximize | Training completion rate, documentation completeness, audit readiness |
| **Impact** | Maximize | Field insights actionability, KOL engagement depth, strategic influence |

#### Outcome Entity Schema

```sql
CREATE TABLE ref_outcomes (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- OUT-SPEED-001
  outcome_statement TEXT NOT NULL,        -- Minimize time to document HCP interactions
  outcome_category VARCHAR(100),           -- Speed
  outcome_type VARCHAR(50),                -- desired, undesired, emotional
  measurability VARCHAR(20),               -- quantitative, qualitative, mixed
  direction VARCHAR(20),                   -- minimize, maximize, optimize
  typical_metric TEXT,                     -- How to measure (e.g., 'minutes per interaction')
  target_value TEXT,                       -- Industry benchmark or target
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Outcome Examples (Top 30)

| Unique ID | Outcome Statement | Category | Direction | Typical Metric | Target Value |
|-----------|------------------|----------|-----------|---------------|--------------|
| OUT-SPEED-001 | Minimize time to document HCP interactions | Speed | Minimize | Minutes per interaction | <10 minutes |
| OUT-SPEED-002 | Minimize medical inquiry response time | Speed | Minimize | Hours to response | <24 hours |
| OUT-SPEED-003 | Minimize time to find relevant literature | Speed | Minimize | Minutes per search | <15 minutes |
| OUT-SPEED-004 | Minimize adverse event reporting time | Speed | Minimize | Hours to submission | <24 hours |
| OUT-QUAL-001 | Maximize HCP satisfaction with interactions | Quality | Maximize | Score (1-5) | >4.5/5.0 |
| OUT-QUAL-002 | Maximize field insight actionability | Quality | Maximize | % insights actioned | >60% |
| OUT-QUAL-003 | Maximize data accuracy in Veeva CRM | Quality | Maximize | % accuracy | >95% |
| OUT-QUAL-004 | Maximize scientific presentation quality | Quality | Maximize | Score (1-5) | >4.0/5.0 |
| OUT-COST-001 | Minimize travel expenses | Cost | Minimize | $ per territory per year | <$50K |
| OUT-COST-002 | Minimize congress attendance costs | Cost | Minimize | $ per congress | <$5K |
| OUT-COST-003 | Minimize time spent on administrative tasks | Cost | Minimize | % of total time | <20% |
| OUT-RISK-001 | Minimize compliance violations | Risk | Minimize | # of violations per year | 0 |
| OUT-RISK-002 | Minimize audit findings | Risk | Minimize | # of findings per audit | 0 |
| OUT-RISK-003 | Minimize AE reporting delays | Risk | Minimize | # of delays per year | 0 |
| OUT-RISK-004 | Minimize promotional/medical boundary violations | Risk | Minimize | # of violations | 0 |
| OUT-COMP-001 | Maximize GxP training completion rate | Compliance | Maximize | % completion | 100% |
| OUT-COMP-002 | Maximize documentation completeness | Compliance | Maximize | % complete | >98% |
| OUT-COMP-003 | Maximize Sunshine Act reporting accuracy | Compliance | Maximize | % accuracy | 100% |
| OUT-IMPACT-001 | Maximize KOL engagement depth | Impact | Maximize | Relationship score (1-5) | >4.0/5.0 |
| OUT-IMPACT-002 | Maximize strategic influence on medical plan | Impact | Maximize | % input incorporated | >50% |
| OUT-IMPACT-003 | Maximize publication acceptance rate | Impact | Maximize | % accepted | >70% |
| OUT-IMPACT-004 | Maximize congress ROI | Impact | Maximize | Insights per congress | >10 |
| OUT-SPEED-005 | Minimize time to prepare scientific presentations | Speed | Minimize | Hours per presentation | <4 hours |
| OUT-SPEED-006 | Minimize medical review turnaround time | Speed | Minimize | Days to approval | <7 days |
| OUT-QUAL-005 | Maximize therapeutic area expertise | Quality | Maximize | Self-assessment score (1-5) | >4.0/5.0 |
| OUT-QUAL-006 | Maximize cross-functional collaboration quality | Quality | Maximize | Team satisfaction score | >4.0/5.0 |
| OUT-COST-004 | Minimize time to onboard new MSLs | Cost | Minimize | Weeks to productivity | <12 weeks |
| OUT-RISK-005 | Minimize off-label discussion violations | Risk | Minimize | # of violations | 0 |
| OUT-COMP-004 | Maximize medical/commercial firewall adherence | Compliance | Maximize | % adherence | 100% |
| OUT-IMPACT-005 | Maximize patient impact through evidence generation | Impact | Maximize | Studies influenced | Qualitative |

---

### CATEGORY 8: OPPORTUNITIES (ref_opportunities)

**Definition:** Solution types and innovation areas that address pain points and enable JTBDs.

**Total Entities:** 20-30 opportunities

#### Opportunity Types

| Type | Description | Examples |
|------|-------------|----------|
| **Automation** | RPA, AI, workflow automation | Auto-populate Veeva from meeting notes, AI literature synthesis |
| **Workflow** | Process optimization, templates | Guided interaction documentation, standardized response templates |
| **Insight** | Analytics, dashboards, reporting | KOL engagement analytics, territory heat maps |
| **Training** | Learning, skill development | AI tool training, therapeutic area bootcamp |
| **Integration** | System connections, APIs | CRM-Safety DB integration, single sign-on |
| **AI Assistant** | Copilots, chatbots, agents | Medical affairs AI agent, literature Q&A bot |

#### Opportunity Entity Schema

```sql
CREATE TABLE ref_opportunities (
  id UUID PRIMARY KEY,
  unique_id VARCHAR(50) UNIQUE NOT NULL,  -- OPP-AUTO-001
  opportunity_name VARCHAR(255) NOT NULL,  -- AI-powered Veeva CRM auto-documentation
  opportunity_type VARCHAR(50),            -- Automation
  description TEXT,
  value_proposition TEXT,                  -- Reduce documentation time by 70%
  implementation_complexity VARCHAR(20),   -- low, medium, high, very_high
  expected_impact VARCHAR(20),             -- low, medium, high, transformative
  time_to_value VARCHAR(50),               -- Weeks/months to realize benefit
  required_capabilities TEXT[],            -- Tech, skills, budget needed
  estimated_cost_range VARCHAR(50),        -- Budget range
  roi_timeframe VARCHAR(50),               -- When to expect ROI
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### Medical Affairs Opportunity Examples (Top 25)

| Unique ID | Opportunity Name | Type | Value Proposition | Implementation Complexity | Expected Impact |
|-----------|-----------------|------|-------------------|-------------------------|-----------------|
| OPP-AUTO-001 | AI-powered Veeva CRM auto-documentation | Automation | Reduce documentation time by 70% via voice/email capture | Medium | High |
| OPP-AUTO-002 | Automated literature synthesis | Automation | Summarize 50+ papers in minutes with AI | Low | High |
| OPP-AUTO-003 | Intelligent inquiry routing & triage | Automation | Auto-route inquiries to right specialist, 50% faster | Medium | Medium |
| OPP-AUTO-004 | Smart slide deck generation | Automation | Generate custom presentations from data in seconds | Medium | Medium |
| OPP-WORK-001 | Guided interaction documentation workflow | Workflow | Step-by-step prompts ensure complete, accurate entries | Low | Medium |
| OPP-WORK-002 | Standardized response letter templates | Workflow | 80% faster MI response with pre-approved templates | Low | High |
| OPP-WORK-003 | Territory planning wizard | Workflow | Prioritize KOLs based on strategic scoring algorithm | Medium | Medium |
| OPP-WORK-004 | Congress planning checklist | Workflow | Ensure no missed steps, reduce planning time 40% | Low | Low |
| OPP-INSIG-001 | KOL engagement analytics dashboard | Insight | Visualize interaction quality, frequency, sentiment trends | Medium | High |
| OPP-INSIG-002 | Territory heat maps | Insight | Geographic visualization of engagement gaps | Low | Medium |
| OPP-INSIG-003 | Field insights actionability scoring | Insight | Score insights for strategic value, close the loop | Medium | High |
| OPP-INSIG-004 | Competitive intelligence tracker | Insight | Aggregate competitor activities, identify threats | Medium | Medium |
| OPP-TRAIN-001 | AI tools certification program | Training | Upskill team on AI/automation, boost adoption | Low | Medium |
| OPP-TRAIN-002 | New MSL onboarding accelerator | Training | Reduce time to productivity from 12 to 6 weeks | Medium | High |
| OPP-TRAIN-003 | Therapeutic area deep dive bootcamp | Training | Intensive 2-week TA immersion, expert-level mastery | Medium | High |
| OPP-INTEG-001 | CRM-Safety database integration | Integration | Auto-sync AE data, eliminate manual re-entry | High | High |
| OPP-INTEG-002 | Single sign-on across medical systems | Integration | Reduce login friction, save 30 min/day | Medium | Medium |
| OPP-INTEG-003 | Literature database API integration | Integration | Pull latest pubs into CRM automatically | Low | Low |
| OPP-AI-001 | Medical affairs AI copilot (VITAL) | AI Assistant | Answer questions, draft emails, summarize data | Medium | Transformative |
| OPP-AI-002 | Literature Q&A chatbot | AI Assistant | Ask questions, get cited answers from corpus | Low | High |
| OPP-AI-003 | KOL relationship advisor | AI Assistant | Suggest next best actions for KOL engagement | Medium | Medium |
| OPP-AI-004 | Compliance risk detector | AI Assistant | Flag potential violations in emails/presentations | High | High |
| OPP-AUTO-005 | Automated expense report submission | Automation | OCR receipts, auto-populate forms, submit | Low | Low |
| OPP-WORK-005 | Publication planning template | Workflow | Standardize publication workflow, reduce planning time | Low | Medium |
| OPP-INSIG-005 | Congress ROI analytics | Insight | Measure congress value via insights, connections | Medium | Medium |

---

## RELATIONSHIP SCHEMA

### Relationship Design Principles

1. **All relationships are junction tables** (not just foreign keys)
2. **Rich edge metadata** (weights, scores, frequencies)
3. **Archetype-specific weights** for differentiation
4. **Bidirectional navigation** via indexes
5. **Cascade deletes** to maintain integrity

### Core Relationship Types (40+)

#### PERSONA-LEVEL RELATIONSHIPS

| Relationship | From | To | Cardinality | Edge Metadata | Purpose |
|--------------|------|-----|-------------|---------------|---------|
| **HAS_ARCHETYPE** | Persona | Archetype | N:1 (primary) | archetype_strength (0-1) | Classify persona into MECE framework |
| **USES_TOOL** | Persona | Tool | N:M | proficiency, frequency, satisfaction, automation_desire, archetype_weights | Track tool adoption and pain |
| **HAS_PAIN_POINT** | Persona | Pain Point | N:M | severity, frequency, impact_score, VPANES scores, archetype_weights | Quantify pain for targeting |
| **HAS_GOAL** | Persona | Goal | N:M | priority, importance, progress, archetype_weights | Understand motivations |
| **DRIVEN_BY** | Persona | Motivation | N:M | strength, frequency, archetype_weights | Model behavioral drivers |
| **PERFORMS_ACTIVITY** | Persona | Activity | N:M | time_percentage, frequency, satisfaction, archetype time allocations | Time allocation patterns |
| **PERFORMS_JTBD** | Persona | JTBD | N:M | importance, satisfaction, opportunity_score, archetype ODI scores | ODI analysis by archetype |
| **ACHIEVES** | Persona | Outcome | N:M | target_value, current_value, gap | Outcome tracking |

#### SOLUTION MAPPING RELATIONSHIPS

| Relationship | From | To | Cardinality | Edge Metadata | Purpose |
|--------------|------|-----|-------------|---------------|---------|
| **ADDRESSED_BY** | Pain Point | Opportunity | N:M | resolution_effectiveness (0-10), implementation_effort, ROI | Map pains to solutions |
| **ENABLES** | Opportunity | JTBD | N:M | enablement_score (0-10) | Map solutions to jobs |
| **ROUTES_TO** | Opportunity | Service Layer | N:M | routing_priority, fit_score, conditions | Service layer routing logic |
| **HAS_OUTCOME** | JTBD | Outcome | N:M | outcome_priority, importance_weight | JTBD success criteria |

#### CROSS-ENTITY RELATIONSHIPS

| Relationship | From | To | Cardinality | Edge Metadata | Purpose |
|--------------|------|-----|-------------|---------------|---------|
| **USED_IN** | Tool | Activity | N:M | usage_pattern, dependency_level | Tool-activity mapping |
| **EXPERIENCED_DURING** | Pain Point | Activity | N:M | relationship_type, frequency | When pain occurs |
| **ACHIEVES** | Goal | JTBD | N:M | contribution_weight | Goal-JTBD alignment |
| **CONFLICTS_WITH** | Motivation | Motivation | N:M | conflict_severity | Motivation tensions |
| **PREREQUISITE_FOR** | Activity | Activity | N:M | sequence_order | Activity dependencies |
| **REQUIRES_COMPETENCY** | Activity | Competency | N:M | proficiency_level | Competency-activity mapping |

#### ROLE-LEVEL RELATIONSHIPS (from gold_standard_schema.sql)

| Relationship | From | To | Cardinality | Edge Metadata | Purpose |
|--------------|------|-----|-------------|---------------|---------|
| **HAS_SKILL** | Role | Skill | N:M | proficiency_required, is_required | Required/preferred skills |
| **HAS_COMPETENCY** | Role | Competency | N:M | proficiency_level, years_to_develop, is_critical | Core competencies |
| **REQUIRES_CERTIFICATION** | Role | Certification | N:M | is_required, is_preferred | Credentials |
| **GOVERNED_BY** | Role | Regulatory Framework | N:M | proficiency_level | Compliance frameworks |
| **MEASURED_BY** | Role | KPI | N:M | target_value, frequency, data_source | Performance metrics |
| **OPERATES_IN** | Role | Therapeutic Area | N:M | is_primary | Domain expertise |
| **REQUIRES_TRAINING** | Role | Training Program | N:M | is_mandatory | Required training |
| **HAS_GXP_REQUIREMENT** | Role | GxP Type | N:M | is_critical, training_frequency | GxP compliance |

### Archetype Weighting Schema

**All persona-entity relationships include 4 weight columns:**

```sql
weight_automator DECIMAL(3,2) DEFAULT 1.0,      -- 0.0-2.0 scale
weight_orchestrator DECIMAL(3,2) DEFAULT 1.0,
weight_learner DECIMAL(3,2) DEFAULT 1.0,
weight_skeptic DECIMAL(3,2) DEFAULT 1.0
```

**Interpretation:**
- **0.0-0.5:** Low relevance/severity for this archetype
- **0.6-1.4:** Moderate (baseline)
- **1.5-2.0:** High relevance/severity

**Example: Pain Point "Manual Veeva CRM data entry"**
```sql
weight_automator = 1.8      -- Highly painful, seeks automation
weight_orchestrator = 0.7   -- Delegates this task
weight_learner = 1.3        -- Tedious but learning
weight_skeptic = 1.0        -- Accepts as necessary
```

---

## ARCHETYPE DIFFERENTIATION FRAMEWORK

### MECE Archetype Definitions

#### AUTOMATOR (High AI Maturity + Routine Work)

**Persona Profile:**
- **AI Maturity:** High (tools-savvy, efficiency-focused)
- **Work Type:** Routine (operational, predictable tasks)
- **Primary Motivation:** Time savings, efficiency gains
- **Decision Pattern:** Quick, metrics-based
- **Risk Tolerance:** Moderate (willing to try new tools)
- **Change Readiness:** High

**Pain Point Priorities:**
1. Manual, repetitive tasks (weight: 1.8-2.0)
2. System inefficiencies (weight: 1.6-1.8)
3. Lack of automation (weight: 1.7-1.9)

**Goal Priorities:**
1. Efficiency (⭐⭐⭐)
2. Innovation (⭐⭐⭐)
3. Relationship (⭐⭐)

**Tool Preferences:**
- AI-enabled tools (high satisfaction)
- Automation platforms (high adoption)
- Dashboards/analytics (medium)

**JTBD ODI Profile:**
- High importance on speed outcomes
- Low satisfaction with manual processes
- **Opportunity sweet spot:** Automation opportunities (scores 12-15)

#### ORCHESTRATOR (High AI Maturity + Strategic Work)

**Persona Profile:**
- **AI Maturity:** High (sees AI as force multiplier)
- **Work Type:** Strategic (complex, variable decisions)
- **Primary Motivation:** Innovation, impact, thought leadership
- **Decision Pattern:** Consultative, insight-driven
- **Risk Tolerance:** High (embraces calculated risks)
- **Change Readiness:** High

**Pain Point Priorities:**
1. Lack of strategic insights (weight: 1.8-2.0)
2. Cross-functional misalignment (weight: 1.6-1.8)
3. Insufficient time for strategic work (weight: 1.7-1.9)

**Goal Priorities:**
1. Innovation (⭐⭐⭐)
2. Quality (⭐⭐⭐)
3. Relationship (⭐⭐⭐)

**Tool Preferences:**
- Analytics/BI tools (high satisfaction)
- AI assistants for insights (high adoption)
- Collaboration platforms (medium)

**JTBD ODI Profile:**
- High importance on impact outcomes
- Moderate satisfaction with current insights
- **Opportunity sweet spot:** Insight opportunities (scores 11-14)

#### LEARNER (Low AI Maturity + Routine Work)

**Persona Profile:**
- **AI Maturity:** Low (developing, needs guidance)
- **Work Type:** Routine (operational, predictable tasks)
- **Primary Motivation:** Competence, guidance, career growth
- **Decision Pattern:** Cautious, seeks validation
- **Risk Tolerance:** Low (needs proven approaches)
- **Change Readiness:** Moderate (needs support)

**Pain Point Priorities:**
1. Lack of training/onboarding (weight: 1.8-2.0)
2. Compliance complexity (weight: 1.6-1.8)
3. Insufficient guidance (weight: 1.7-1.9)

**Goal Priorities:**
1. Growth (⭐⭐⭐)
2. Compliance (⭐⭐⭐)
3. Quality (⭐⭐⭐)

**Tool Preferences:**
- Workflow/template tools (high satisfaction)
- Training platforms (high adoption)
- AI tools (low initial, growing)

**JTBD ODI Profile:**
- High importance on compliance outcomes
- Low satisfaction with current training
- **Opportunity sweet spot:** Training opportunities (scores 12-15)

#### SKEPTIC (Low AI Maturity + Strategic Work)

**Persona Profile:**
- **AI Maturity:** Low (requires proof, evidence-based)
- **Work Type:** Strategic (complex, variable decisions)
- **Primary Motivation:** Proof, reliability, risk mitigation
- **Decision Pattern:** Deliberate, risk-averse
- **Risk Tolerance:** Low (needs demonstrated ROI)
- **Change Readiness:** Low (needs compelling case)

**Pain Point Priorities:**
1. Audit anxiety/compliance burden (weight: 1.8-2.0)
2. Lack of evidence for new approaches (weight: 1.7-1.9)
3. Unproven tools (weight: 1.5-1.7)

**Goal Priorities:**
1. Compliance (⭐⭐⭐)
2. Quality (⭐⭐⭐)
3. Relationship (⭐⭐)

**Tool Preferences:**
- Established, validated tools (high satisfaction)
- Evidence/literature databases (high adoption)
- AI tools (low adoption, needs proof)

**JTBD ODI Profile:**
- High importance on risk/compliance outcomes
- Moderate satisfaction with current compliance
- **Opportunity sweet spot:** Compliance/risk opportunities (scores 10-13)

### Archetype Differentiation Matrix

| Dimension | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|-----------|-----------|--------------|---------|---------|
| **Pain Point Response** | Seeks automation | Seeks insights | Seeks training | Seeks validation |
| **Goal Orientation** | Efficiency + Innovation | Impact + Innovation | Growth + Compliance | Quality + Compliance |
| **Tool Adoption** | Early adopter (AI) | Strategic adopter (AI) | Guided adopter | Late adopter |
| **VPANES Pain Score** | High for routine tasks | High for strategic gaps | High for knowledge gaps | High for risk/audit |
| **ODI Opportunity** | Automation (12-15) | Insight (11-14) | Training (12-15) | Compliance (10-13) |
| **Communication Style** | Direct, data-driven | Visionary, big-picture | Supportive, educational | Evidence-based, questioning |
| **Service Layer Routing** | Workflows (high) | Ask Expert (high) | Workflows (high) + Ask Panel | Ask Panel (high) |
| **Time Allocation** | Admin (low), Clinical (medium) | Strategic (high), Clinical (medium) | Admin (high), Clinical (medium) | Strategic (medium), Clinical (high) |

---

## MEDICAL AFFAIRS DOMAIN SPECIFICS

### Pharma-Specific Entities

#### 1. GxP Types (Compliance Framework)

| GxP Type | Unique ID | Description | Applies To |
|----------|-----------|-------------|------------|
| **GCP** | GXP-001 | Good Clinical Practice | MSL, Medical Director, Clinical roles |
| **GVP** | GXP-002 | Good Pharmacovigilance Practice | All Medical Affairs (AE reporting) |
| **GMP** | GXP-003 | Good Manufacturing Practice | Minimal (unless CMC-focused) |
| **GLP** | GXP-004 | Good Laboratory Practice | Preclinical roles only |
| **GDP** | GXP-005 | Good Distribution Practice | Not applicable to Medical Affairs |

#### 2. Regulatory Frameworks

| Unique ID | Framework Name | Type | Description |
|-----------|---------------|------|-------------|
| REG-FDA-001 | FDA 21 CFR Part 312 | FDA | IND regulations for clinical trials |
| REG-ICH-001 | ICH GCP E6 (R2) | ICH | Good Clinical Practice |
| REG-PHRMA-001 | PhRMA Code on HCP Interactions | Industry | Compliance for HCP engagement |
| REG-GVP-001 | GVP Module VI | EMA | Pharmacovigilance |
| REG-SUN-001 | Sunshine Act (Open Payments) | US Law | Transparency reporting |
| REG-EFPIA-001 | EFPIA Code | EU Industry | EU HCP interaction code |
| REG-FDA-002 | FDA Promotional Guidelines | FDA | Medical vs promotional boundaries |

#### 3. Therapeutic Areas

| Unique ID | Area Name | Typical Trial Phases | Complexity |
|-----------|-----------|---------------------|-----------|
| TA-001 | Oncology | Phase 1-4 | Very High |
| TA-002 | Immunology | Phase 2-4 | High |
| TA-003 | Cardiovascular | Phase 2-4 | Medium |
| TA-004 | Neuroscience | Phase 1-3 | Very High |
| TA-005 | Rare Diseases | Phase 1-3 | High |
| TA-006 | Infectious Disease | Phase 2-4 | Medium |
| TA-007 | Metabolic/Endocrine | Phase 2-4 | Medium |
| TA-008 | Respiratory | Phase 2-4 | Medium |

#### 4. Medical Affairs-Specific KPIs

| Unique ID | KPI Name | Category | Measurement Unit | Typical Frequency |
|-----------|----------|----------|------------------|------------------|
| KPI-MSL-001 | Tier 1 KOL Interactions | Engagement | interactions/year | Monthly |
| KPI-MSL-002 | Field Insights Submitted | Quality | insights/year | Monthly |
| KPI-MSL-003 | Scientific Presentation Quality | Quality | score (1-5) | Quarterly |
| KPI-MSL-004 | Congress Attendance | Activity | congresses/year | Annually |
| KPI-MSL-005 | AE Reporting Compliance | Compliance | percentage | Monthly |
| KPI-MI-001 | Inquiry Response Time | Efficiency | hours | Daily |
| KPI-MI-002 | Response Quality Score | Quality | score (1-5) | Quarterly |
| KPI-MI-003 | Inquiry Volume Handled | Productivity | inquiries/year | Monthly |
| KPI-DIR-001 | Publication Plan Delivery | Quality | publications/year | Annually |
| KPI-DIR-002 | Budget Variance | Efficiency | percentage | Quarterly |

#### 5. Medical Affairs-Specific Systems

| Unique ID | Tool Name | Category | Pharma-Specific | GxP-Validated |
|-----------|-----------|----------|----------------|---------------|
| TOOL-CRM-001 | Veeva CRM | CRM & Field Medical | Yes | Yes |
| TOOL-MI-001 | Veeva Vault MedComms | Medical Information | Yes | Yes |
| TOOL-SAFE-001 | Argus Safety | Pharmacovigilance | Yes | Yes |
| TOOL-DOC-001 | Veeva Vault PromoMats | Document Management | Yes | Yes |
| TOOL-CONG-001 | Cvent | Congress & Events | No | No |

#### 6. Pharma-Specific Pain Points

**Top 10 Pharma-Specific Pains:**

1. **Promotional/Medical Firewall Confusion** (PAIN-COMM-004)
   - Weight: SKEPTIC 1.9, LEARNER 1.7
   - Impact: Compliance risk, audit anxiety
   - Addressable by: OPP-AI-004 (Compliance risk detector)

2. **Adverse Event Reporting Complexity** (PAIN-COMP-003)
   - Weight: LEARNER 1.8, SKEPTIC 1.7
   - Impact: Patient safety, regulatory compliance
   - Addressable by: OPP-INTEG-001 (CRM-Safety integration)

3. **Excessive GxP Training Burden** (PAIN-COMP-001)
   - Weight: LEARNER 1.7, SKEPTIC 1.5
   - Impact: Time, morale
   - Addressable by: OPP-TRAIN-001 (AI tools certification)

4. **Sunshine Act Reporting Burden** (PAIN-COMP-004)
   - Weight: AUTOMATOR 1.8, LEARNER 1.6
   - Impact: Administrative overhead
   - Addressable by: OPP-AUTO-005 (Automated reporting)

5. **Off-Label Discussion Uncertainty** (PAIN-COMP-005)
   - Weight: SKEPTIC 1.9, LEARNER 1.6
   - Impact: Compliance risk, HCP trust
   - Addressable by: OPP-AI-004 (Compliance risk detector)

6. **Data Silos Between CRM and Safety** (PAIN-TECH-001)
   - Weight: ORCHESTRATOR 1.8, AUTOMATOR 1.6
   - Impact: Duplicative work, errors
   - Addressable by: OPP-INTEG-001 (System integration)

7. **Manual Veeva CRM Data Entry** (PAIN-PROC-001)
   - Weight: AUTOMATOR 1.9, LEARNER 1.7
   - Impact: Time, accuracy
   - Addressable by: OPP-AUTO-001 (AI auto-documentation)

8. **Limited Access to KOLs** (PAIN-RES-003)
   - Weight: All archetypes 1.5-1.7
   - Impact: Relationship depth, strategic influence
   - Addressable by: OPP-AI-003 (KOL relationship advisor)

9. **Audit Anxiety and Documentation Burden** (PAIN-COMP-006)
   - Weight: SKEPTIC 1.9, LEARNER 1.6
   - Impact: Stress, productivity
   - Addressable by: OPP-WORK-001 (Guided workflows)

10. **Lack of Centralized Response Letter Library** (PAIN-KNOW-004)
    - Weight: AUTOMATOR 1.7, ORCHESTRATOR 1.6
    - Impact: Response time, consistency
    - Addressable by: OPP-WORK-002 (Standardized templates)

---

## VPANES SCORING MODEL

### VPANES Framework Overview

**Purpose:** Quantify persona engagement potential for pain points, opportunities, and solutions.

**Scoring Scale:** 0-10 for each dimension (Total: 0-60)

### VPANES Dimensions

#### 1. VISIBILITY (V) - Awareness of the Problem

**Question:** How aware is the persona of this pain point?

| Score | Description | Indicators |
|-------|-------------|-----------|
| 9-10 | Constantly aware | Mentions it daily, top-of-mind frustration |
| 7-8 | Frequently aware | Recognizes it weekly, discusses with peers |
| 5-6 | Occasionally aware | Notices it monthly, not top priority |
| 3-4 | Rarely aware | Only aware when prompted |
| 0-2 | Unaware | Doesn't recognize as a problem |

**Example:**
- AUTOMATOR: Visibility=9 for "Manual Veeva entry" (constant frustration)
- SKEPTIC: Visibility=4 for "No AI tools" (doesn't see it as a problem)

#### 2. PAIN (P) - Severity of Impact

**Question:** How painful is this problem when it occurs?

| Score | Description | Impact |
|-------|-------------|--------|
| 9-10 | Critical | Blocks core responsibilities, severe stress |
| 7-8 | High | Significant productivity loss, moderate stress |
| 5-6 | Medium | Annoying but manageable |
| 3-4 | Low | Minor inconvenience |
| 0-2 | Negligible | Barely noticeable |

**Example:**
- LEARNER: Pain=9 for "Lack of onboarding" (severe impact on ramp-up)
- ORCHESTRATOR: Pain=3 for "Manual expense reports" (delegates this)

#### 3. ACTIONS (A) - Current Workarounds

**Question:** What actions have they taken to solve this problem?

| Score | Description | Actions Taken |
|-------|-------------|---------------|
| 9-10 | Actively solving | Budgeted solutions, pilot programs, workarounds |
| 7-8 | Exploring solutions | Researching options, seeking recommendations |
| 5-6 | Complained/escalated | Raised with management, no action yet |
| 3-4 | Minimal action | Mentioned in passing |
| 0-2 | No action | Hasn't attempted to solve |

**Example:**
- AUTOMATOR: Actions=9 for "Manual tasks" (built own scripts, requested tools)
- LEARNER: Actions=3 for "Knowledge gaps" (waiting for formal training)

#### 4. NEEDS (N) - Urgency of Solution

**Question:** How urgently do they need a solution?

| Score | Description | Urgency |
|-------|-------------|---------|
| 9-10 | Immediate | Burning need, will pay/advocate for solution |
| 7-8 | High | Want it this quarter, willing to change workflow |
| 5-6 | Moderate | Nice to have, not urgent |
| 3-4 | Low | Can wait 6-12 months |
| 0-2 | No need | Satisfied with status quo |

**Example:**
- SKEPTIC: Needs=9 for "Audit readiness" (upcoming audit)
- AUTOMATOR: Needs=7 for "AI tools" (wants efficiency gains)

#### 5. EMOTIONS (E) - Emotional Intensity

**Question:** What emotions does this pain evoke?

| Score | Description | Emotions |
|-------|-------------|----------|
| 9-10 | Strong negative | Anger, anxiety, frustration, fear |
| 7-8 | Moderate negative | Annoyance, stress, disappointment |
| 5-6 | Mild negative | Slight frustration |
| 3-4 | Neutral | No emotional charge |
| 0-2 | Positive/indifferent | Doesn't bother them |

**Example:**
- SKEPTIC: Emotions=9 for "Compliance violations" (fear, anxiety)
- ORCHESTRATOR: Emotions=5 for "Email overload" (mild annoyance)

#### 6. SCENARIOS (S) - Frequency of Occurrence

**Question:** How often does this scenario occur?

| Score | Description | Frequency |
|-------|-------------|-----------|
| 9-10 | Constant | Multiple times daily |
| 7-8 | Frequent | Daily or several times per week |
| 5-6 | Regular | Weekly |
| 3-4 | Occasional | Monthly |
| 0-2 | Rare | Quarterly or less |

**Example:**
- AUTOMATOR: Scenarios=9 for "Veeva data entry" (multiple times daily)
- LEARNER: Scenarios=3 for "New TA training" (quarterly)

### VPANES Scoring by Archetype

**Example: Pain Point "Manual Veeva CRM Data Entry"**

| Archetype | V | P | A | N | E | S | **Total** | Engagement |
|-----------|---|---|---|---|---|---|-----------|------------|
| AUTOMATOR | 9 | 8 | 9 | 8 | 7 | 9 | **50** | HIGH |
| ORCHESTRATOR | 5 | 3 | 2 | 3 | 2 | 5 | **20** | LOW |
| LEARNER | 8 | 7 | 3 | 6 | 6 | 9 | **39** | MEDIUM |
| SKEPTIC | 6 | 5 | 4 | 4 | 3 | 6 | **28** | MEDIUM-LOW |

**Interpretation:**
- **AUTOMATOR (50):** Prime target - high engagement potential
- **ORCHESTRATOR (20):** Not a priority - delegates this task
- **LEARNER (39):** Secondary target - feels pain but passive
- **SKEPTIC (28):** Low priority - accepts as necessary

### VPANES Implementation in Database

```sql
CREATE TABLE persona_pain_points (
  -- ... other columns ...

  -- VPANES scores (0-10 each)
  vpanes_visibility DECIMAL(3,2),
  vpanes_pain DECIMAL(3,2),
  vpanes_actions DECIMAL(3,2),
  vpanes_needs DECIMAL(3,2),
  vpanes_emotions DECIMAL(3,2),
  vpanes_scenarios DECIMAL(3,2),

  -- Composite VPANES score (0-60)
  vpanes_total DECIMAL(4,2) GENERATED ALWAYS AS (
    vpanes_visibility + vpanes_pain + vpanes_actions +
    vpanes_needs + vpanes_emotions + vpanes_scenarios
  ) STORED,

  -- Engagement classification
  engagement_level VARCHAR(20) GENERATED ALWAYS AS (
    CASE
      WHEN (vpanes_visibility + vpanes_pain + vpanes_actions +
            vpanes_needs + vpanes_emotions + vpanes_scenarios) >= 41 THEN 'high'
      WHEN (vpanes_visibility + vpanes_pain + vpanes_actions +
            vpanes_needs + vpanes_emotions + vpanes_scenarios) >= 21 THEN 'medium'
      ELSE 'low'
    END
  ) STORED
);
```

### VPANES Query Examples

**Find high-engagement pain points for AUTOMATOR personas:**

```sql
SELECT
  pp.pain_point_name,
  ppp.vpanes_total,
  ppp.engagement_level,
  ppp.severity,
  o.opportunity_name
FROM persona_pain_points ppp
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
JOIN personas p ON ppp.persona_id = p.id
LEFT JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
LEFT JOIN ref_opportunities o ON ppo.opportunity_id = o.id
WHERE p.persona_type = 'AUTOMATOR'
  AND ppp.engagement_level = 'high'
ORDER BY ppp.vpanes_total DESC;
```

---

## SCALABILITY PATTERNS

### Blueprint for Cross-Functional Expansion

This Medical Affairs ontology serves as a **template** for extending to:
- Commercial (Sales, Marketing, Market Access)
- R&D (Clinical Development, Regulatory, Quality)
- Corporate Functions (HR, Finance, IT, Legal)

### Shared vs Function-Specific Entities

#### SHARED ENTITIES (Reuse Across Functions)

| Entity Type | Shared Examples | Function-Specific Examples |
|-------------|-----------------|---------------------------|
| **Archetypes** | AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC | None (universal framework) |
| **Service Layers** | Ask Expert, Workflows, Solution Builder | Ask Panel (function-specific panels) |
| **Tools (Generic)** | Microsoft Teams, PowerPoint, Excel | Veeva CRM (Medical Affairs), Salesforce (Commercial) |
| **Pain Points (Generic)** | Email overload, approval delays | GxP compliance burden (Medical Affairs), quota pressure (Sales) |
| **Goals (Generic)** | Efficiency, Quality, Growth | Scientific excellence (Medical Affairs), Revenue (Commercial) |
| **Motivations (Generic)** | Career advancement, work-life balance | Patient impact (Medical Affairs), Winning deals (Sales) |
| **Activities (Generic)** | Email, meetings, reporting | KOL engagement (Medical Affairs), Customer demos (Commercial) |
| **Outcomes (Generic)** | Time savings, cost reduction | HCP satisfaction (Medical Affairs), Win rate (Commercial) |

#### FUNCTION-SPECIFIC ENTITIES (Create Per Function)

**Medical Affairs:**
- ref_therapeutic_areas
- ref_regulatory_frameworks (GxP-specific)
- ref_kpis (MSL-specific KPIs)
- Tools: Veeva CRM, Argus Safety, Medical Insights Platform

**Commercial (Future):**
- ref_market_segments
- ref_compliance_frameworks (Anti-kickback, Sunshine Act)
- ref_kpis (Sales quota, market share, rep productivity)
- Tools: Salesforce CRM, Incentive Comp systems, Territory planning

**R&D (Future):**
- ref_study_phases
- ref_regulatory_submissions (IND, NDA, BLA)
- ref_kpis (Enrollment rate, study timelines, data quality)
- Tools: CTMS, EDC (Medidata Rave), eTMF

### Inheritance Patterns

#### 1. Role Inheritance

```
Root: Pharma Employee (shared attributes)
├── Medical Affairs Function
│   ├── Field Medical Department
│   │   ├── MSL Role
│   │   ├── Senior MSL Role
│   │   └── MSL Manager Role
│   └── Medical Information Department
│       ├── MI Specialist Role
│       └── Senior MI Specialist Role
├── Commercial Function (future)
│   ├── Sales Department
│   └── Marketing Department
└── R&D Function (future)
```

**Shared Attributes:**
- gxp_critical (all pharma roles)
- geographic_scope (all field roles)
- remote_eligible (modern work environment)

**Function-Specific Attributes:**
- Medical Affairs: hcp_facing, safety_critical, therapeutic_areas
- Commercial: quota_bearing, territory_size, sales_channel
- R&D: study_oversight, regulatory_interaction

#### 2. Pain Point Inheritance

```
Root: Process Pain Points
├── Shared: Email overload, approval delays, duplicative reporting
├── Medical Affairs: GxP compliance burden, KOL access, medical/commercial firewall
├── Commercial: Quota pressure, CRM data entry, sample management
└── R&D: Enrollment challenges, protocol amendments, data quality
```

#### 3. Tool Inheritance

```
Root: Enterprise Tools (all functions)
├── Communication: Teams, Slack, Email
├── Productivity: PowerPoint, Excel, Word
├── BI: Tableau, Power BI
└── AI: ChatGPT, Claude

Function-Specific:
├── Medical Affairs: Veeva CRM, Argus Safety, Medical Insights Platform
├── Commercial: Salesforce, Incentive Comp, Territory Planning
└── R&D: CTMS, EDC, eTMF
```

### Extensibility Recommendations

#### 1. Naming Conventions

**Maintain consistent unique_id prefixes:**

```
TOOL-[CATEGORY]-[SEQUENCE]
PAIN-[CATEGORY]-[SEQUENCE]
GOAL-[CATEGORY]-[SEQUENCE]
MOT-[CATEGORY]-[SEQUENCE]
ACT-[CATEGORY]-[SEQUENCE]
JTBD-[CATEGORY]-[SEQUENCE]
```

**Add function prefix for function-specific entities:**

```
Medical Affairs:
- TOOL-MA-CRM-001 (Veeva CRM)
- PAIN-MA-COMP-001 (GxP compliance burden)
- KPI-MA-MSL-001 (Tier 1 KOL interactions)

Commercial (future):
- TOOL-COMM-CRM-001 (Salesforce)
- PAIN-COMM-PROC-001 (Quota pressure)
- KPI-COMM-SALES-001 (Revenue attainment)
```

#### 2. Tagging Strategy

**Add tags to enable cross-functional queries:**

```sql
ALTER TABLE ref_tools ADD COLUMN tags TEXT[];
ALTER TABLE ref_pain_points ADD COLUMN tags TEXT[];
ALTER TABLE ref_goals ADD COLUMN tags TEXT[];

-- Example tags
TOOL-CRM-001 (Veeva CRM): ['medical_affairs', 'field_medical', 'gxp_validated']
PAIN-PROC-001 (Manual data entry): ['process', 'data_entry', 'cross_functional']
GOAL-EFF-001 (Reduce admin time): ['efficiency', 'time_savings', 'cross_functional']
```

#### 3. Cross-Functional Relationship Tables

**Create junction tables for cross-functional patterns:**

```sql
-- Cross-functional pain point mapping
CREATE TABLE pain_point_functions (
  pain_point_id UUID REFERENCES ref_pain_points(id),
  function_name VARCHAR(100),  -- Medical Affairs, Commercial, R&D
  severity_in_function VARCHAR(20),
  PRIMARY KEY (pain_point_id, function_name)
);

-- Example: "Email overload" affects all functions
INSERT INTO pain_point_functions VALUES
  ('PAIN-COMM-001', 'Medical Affairs', 'high'),
  ('PAIN-COMM-001', 'Commercial', 'high'),
  ('PAIN-COMM-001', 'R&D', 'medium');
```

#### 4. Function-Agnostic Opportunity Catalog

**Build a master opportunity catalog:**

```sql
CREATE TABLE ref_opportunities (
  -- ... existing columns ...
  applicable_functions TEXT[],  -- Which functions benefit
  cross_functional BOOLEAN DEFAULT false,
  estimated_impact_per_function JSONB
);

-- Example: AI-powered email summarization
INSERT INTO ref_opportunities VALUES (
  'OPP-AI-005',
  'AI-powered email summarization',
  'AI Assistant',
  'Reduce email reading time by 60%',
  'low',
  'high',
  '2-4 weeks',
  ARRAY['Medical Affairs', 'Commercial', 'R&D'],
  true,
  '{"Medical Affairs": "high", "Commercial": "medium", "R&D": "high"}'
);
```

---

## IMPLEMENTATION ROADMAP

### Phase 1: Medical Affairs Foundation (Weeks 1-4)

**Goal:** Establish complete Medical Affairs ontology as proof of concept.

#### Week 1: Schema & Reference Data
- [ ] Deploy 002_ontology_schema.sql (create all tables)
- [ ] Seed ref_archetypes (4 archetypes)
- [ ] Seed ref_service_layers (4 layers)
- [ ] Seed ref_tools (20 Medical Affairs tools)
- [ ] Seed ref_pain_points (40 Medical Affairs pains)

#### Week 2: Goals, Motivations, Activities
- [ ] Seed ref_goals (30 goals)
- [ ] Seed ref_motivations (25 motivations)
- [ ] Seed ref_activities (40 activities)
- [ ] Seed ref_jtbds (30 JTBDs)
- [ ] Seed ref_outcomes (30 outcomes)

#### Week 3: Opportunities & Relationships
- [ ] Seed ref_opportunities (25 opportunities)
- [ ] Map pain_point_opportunities (100+ edges)
- [ ] Map jtbd_opportunities (50+ edges)
- [ ] Map opportunity_service_layers (50+ edges)
- [ ] Map tool_activities (80+ edges)

#### Week 4: Persona Linkage & VPANES
- [ ] Link 6 Medical Affairs personas to archetypes
- [ ] Populate persona_tools (120+ edges)
- [ ] Populate persona_pain_points with VPANES scores (240+ edges)
- [ ] Populate persona_goals (180+ edges)
- [ ] Populate persona_motivations (150+ edges)
- [ ] Populate persona_activities (240+ edges)
- [ ] Populate persona_jtbds with ODI scores (180+ edges)

**Deliverable:** Fully functional Medical Affairs knowledge graph with 500+ nodes, 1000+ edges.

### Phase 2: Query & Analytics Layer (Weeks 5-6)

#### Week 5: Views & Stored Procedures
- [ ] Create v_persona_pain_opportunities (already exists)
- [ ] Create v_jtbd_opportunities_by_archetype (already exists)
- [ ] Create v_shared_pain_points (already exists)
- [ ] Create v_tool_adoption_by_archetype (already exists)
- [ ] Create v_high_opportunity_jtbds (new)
- [ ] Create v_archetype_time_allocation (new)
- [ ] Create stored procedure: calculate_vpanes_scores()
- [ ] Create stored procedure: recommend_opportunities()

#### Week 6: Validation & Testing
- [ ] Validate archetype weights sum correctly
- [ ] Test VPANES score accuracy
- [ ] Test ODI opportunity score calculations
- [ ] Benchmark query performance (<1s for common queries)
- [ ] Create test dataset with edge cases
- [ ] Document query patterns

**Deliverable:** Tested query layer with <1s response times.

### Phase 3: AI Agent Integration (Weeks 7-8)

#### Week 7: Agent Context Queries
- [ ] Create agent context builder (fetch persona + pain + opportunity)
- [ ] Create service layer router (route based on VPANES + archetype)
- [ ] Create similarity scorer (find similar personas/pains)
- [ ] Create opportunity ranker (prioritize by ODI + VPANES)
- [ ] API endpoints for agent queries

#### Week 8: Agent Prompts & Routing
- [ ] Archetype-aware prompt templates
- [ ] VPANES-based urgency detection
- [ ] ODI-based recommendation engine
- [ ] Service layer routing logic
- [ ] Testing with real personas

**Deliverable:** AI agent can query knowledge graph for personalized recommendations.

### Phase 4: Commercial Function Extension (Weeks 9-12)

#### Week 9: Commercial Reference Data
- [ ] Create ref_market_segments
- [ ] Create ref_sales_channels
- [ ] Seed Commercial tools (Salesforce, Incentive Comp, etc.)
- [ ] Seed Commercial pain points (40+)
- [ ] Seed Commercial goals (30+)

#### Week 10: Commercial Activities & JTBDs
- [ ] Seed Commercial activities (40+)
- [ ] Seed Commercial JTBDs (30+)
- [ ] Seed Commercial outcomes (30+)
- [ ] Map shared vs function-specific pains

#### Week 11: Commercial Personas
- [ ] Create 6 Commercial personas (Sales Rep, Account Manager, etc.)
- [ ] Link to archetypes
- [ ] Populate persona-entity relationships
- [ ] Calculate VPANES scores

#### Week 12: Cross-Functional Analysis
- [ ] Create cross-functional views
- [ ] Identify shared pain points (Medical Affairs + Commercial)
- [ ] Map cross-functional opportunities
- [ ] Test cross-functional queries

**Deliverable:** Medical Affairs + Commercial knowledge graph with shared entity reuse.

### Phase 5: Production Readiness (Weeks 13-16)

#### Week 13: Performance Optimization
- [ ] Add missing indexes
- [ ] Optimize slow queries (<500ms target)
- [ ] Partition large junction tables
- [ ] Implement caching for common queries

#### Week 14: Data Quality & Governance
- [ ] Implement data validation rules
- [ ] Create data quality dashboard
- [ ] Document entity lifecycle
- [ ] Establish update procedures

#### Week 15: Documentation & Training
- [ ] Complete API documentation
- [ ] Create query cookbook
- [ ] Train AI agent team on ontology
- [ ] Create stakeholder documentation

#### Week 16: Production Deployment
- [ ] Staging deployment & smoke tests
- [ ] Production deployment
- [ ] Monitoring setup
- [ ] Rollback plan

**Deliverable:** Production-ready knowledge graph with monitoring and documentation.

---

## APPENDIX: EXAMPLE QUERIES

### Query 1: Find High-Opportunity Pain Points for AUTOMATOR Personas

```sql
SELECT
  pp.pain_point_name,
  ppp.severity,
  ppp.vpanes_total,
  ppp.engagement_level,
  o.opportunity_name AS recommended_solution,
  ppo.resolution_effectiveness,
  sl.layer_name AS service_layer
FROM personas p
JOIN persona_pain_points ppp ON p.id = ppp.persona_id
JOIN ref_pain_points pp ON ppp.pain_point_id = pp.id
JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
JOIN ref_opportunities o ON ppo.opportunity_id = o.id
JOIN opportunity_service_layers osl ON o.id = osl.opportunity_id
JOIN ref_service_layers sl ON osl.service_layer_id = sl.id
WHERE p.persona_type = 'AUTOMATOR'
  AND ppp.vpanes_total >= 40  -- High engagement
  AND ppo.resolution_effectiveness >= 7.0  -- Effective solution
ORDER BY ppp.vpanes_total DESC, ppo.resolution_effectiveness DESC
LIMIT 10;
```

### Query 2: JTBD Opportunity Analysis by Archetype

```sql
SELECT
  j.jtbd_statement,
  p.persona_type AS archetype,
  pj.importance_score,
  pj.satisfaction_score,
  pj.opportunity_score,
  CASE
    WHEN pj.opportunity_score >= 15 THEN 'CRITICAL'
    WHEN pj.opportunity_score >= 12 THEN 'HIGH'
    WHEN pj.opportunity_score >= 9 THEN 'MEDIUM'
    ELSE 'LOW'
  END AS priority,
  o.opportunity_name AS recommended_opportunity
FROM ref_jtbds j
JOIN persona_jtbds pj ON j.id = pj.jtbd_id
JOIN personas p ON pj.persona_id = p.id
LEFT JOIN jtbd_opportunities jo ON j.id = jo.jtbd_id
LEFT JOIN ref_opportunities o ON jo.opportunity_id = o.id
WHERE pj.opportunity_score >= 12  -- High+ opportunities only
ORDER BY p.persona_type, pj.opportunity_score DESC;
```

### Query 3: Cross-Functional Pain Point Discovery

```sql
SELECT
  pp.pain_point_name,
  pp.pain_category,
  COUNT(DISTINCT p.persona_type) AS affected_archetypes,
  COUNT(DISTINCT p.id) AS affected_personas,
  AVG(ppp.vpanes_total) AS avg_vpanes,
  ARRAY_AGG(DISTINCT p.persona_type) AS archetypes,
  o.opportunity_name AS solution
FROM ref_pain_points pp
JOIN persona_pain_points ppp ON pp.id = ppp.pain_point_id
JOIN personas p ON ppp.persona_id = p.id
LEFT JOIN pain_point_opportunities ppo ON pp.id = ppo.pain_point_id
LEFT JOIN ref_opportunities o ON ppo.opportunity_id = o.id
WHERE pp.is_systemic = true  -- Systemic pains affect multiple roles
GROUP BY pp.id, pp.pain_point_name, pp.pain_category, o.opportunity_name
HAVING COUNT(DISTINCT p.persona_type) >= 2  -- Affects 2+ archetypes
ORDER BY AVG(ppp.vpanes_total) DESC;
```

### Query 4: Time Allocation by Archetype

```sql
SELECT
  p.persona_type AS archetype,
  a.activity_category,
  AVG(pa.time_percentage) AS avg_time_percent,
  SUM(pa.time_percentage) AS total_time_percent,
  COUNT(*) AS activity_count
FROM personas p
JOIN persona_activities pa ON p.id = pa.persona_id
JOIN ref_activities a ON pa.activity_id = a.id
GROUP BY p.persona_type, a.activity_category
ORDER BY p.persona_type, avg_time_percent DESC;
```

### Query 5: Tool Satisfaction vs Automation Desire

```sql
SELECT
  t.tool_name,
  t.tool_category,
  t.is_ai_enabled,
  p.persona_type AS archetype,
  AVG(pt.satisfaction_score) AS avg_satisfaction,
  AVG(pt.automation_desire) AS avg_automation_desire,
  (AVG(pt.automation_desire) - AVG(pt.satisfaction_score)) AS automation_gap
FROM ref_tools t
JOIN persona_tools pt ON t.id = pt.tool_id
JOIN personas p ON pt.persona_id = p.id
GROUP BY t.id, t.tool_name, t.tool_category, t.is_ai_enabled, p.persona_type
HAVING AVG(pt.satisfaction_score) IS NOT NULL
ORDER BY automation_gap DESC;
```

---

## CONCLUSION

This ontology strategy provides a comprehensive blueprint for building a Medical Affairs knowledge graph that:

1. **Scales across functions** using shared + function-specific entity patterns
2. **Differentiates by archetype** using weighted relationships and VPANES scoring
3. **Enables graph-like queries** in PostgreSQL with normalized junction tables
4. **Maps problems to solutions** via pain points → opportunities → service layers
5. **Measures engagement** using VPANES (0-60 scale) and ODI (opportunity scoring)

**Next Steps:**
1. Review and approve entity taxonomies (250+ entities)
2. Validate archetype weights and VPANES scoring logic
3. Seed Medical Affairs reference data (Weeks 1-2)
4. Implement junction table populations (Weeks 3-4)
5. Test graph queries and optimize performance (Weeks 5-6)
6. Integrate with AI agent routing (Weeks 7-8)

**Success Metrics:**
- 500+ nodes (entities) in Medical Affairs knowledge graph
- 1000+ edges (relationships) with metadata
- <1s query response times for common patterns
- 90%+ archetype classification accuracy
- 80%+ VPANES score correlation with actual engagement

---

**Document Version:** 1.0.0
**Last Updated:** 2025-11-27
**Maintained By:** Data Strategist Agent
**Review Cycle:** Quarterly


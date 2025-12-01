# VITAL Platform - Persona Master Strategy

**Version**: 1.0.0  
**Last Updated**: November 27, 2025  
**Status**: Active - Authoritative Reference  
**Owner**: VITAL Platform Team

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Strategic Vision](#2-strategic-vision)
3. [MECE Archetype Framework](#3-mece-archetype-framework)
4. [Data Architecture](#4-data-architecture)
5. [Inheritance Model](#5-inheritance-model)
6. [Schema Reference](#6-schema-reference)
7. [Junction Tables](#7-junction-tables)
8. [VPANES Scoring](#8-vpanes-scoring)
9. [Seeding Pipeline](#9-seeding-pipeline)
10. [Service Layer Mapping](#10-service-layer-mapping)
11. [Implementation Checklist](#11-implementation-checklist)

---

## 1. Executive Summary

### 1.1 What Are VITAL Personas?

VITAL personas are **evidence-based user profiles** that power two critical systems:

| System | Purpose | Value |
|--------|---------|-------|
| **"Me Graph"** (Personalization) | Adapt AI behavior to each user | Higher adoption, lower churn |
| **"We Graph"** (Transformation) | Aggregate insights for enterprise | Data-driven AI roadmaps |

### 1.2 Key Numbers

| Metric | Value |
|--------|-------|
| **Roles** | 100+ across all functions |
| **Personas per Role** | 4 (MECE framework) |
| **Total Personas** | 400+ |
| **Attributes per Persona** | 80+ columns |
| **Junction Tables** | 24 per persona |
| **Tenants Supported** | Multi-tenant (Pharma, Digital Health, etc.) |

### 1.3 Core Principles

1. **Behavioral, Not Demographic**: Focus on *how* users work with AI, not just *what* they do
2. **Universal Archetypes**: Same 4 archetypes apply across all business functions
3. **Inheritance-Based**: Personas inherit from roles → departments → functions → tenants
4. **Fully Normalized**: No JSONB for structured data, proper junction tables
5. **Inference-Driven**: System infers archetype from attributes, not self-reporting

---

## 2. Strategic Vision

### 2.1 Dual-Purpose Intelligence

```
┌─────────────────────────────────────────────────────────────────────┐
│                    PERSONA INTELLIGENCE SYSTEM                       │
├─────────────────────────────────────────────────────────────────────┤
│                                                                       │
│   ┌─────────────────────┐         ┌─────────────────────┐           │
│   │   "ME GRAPH"        │         │   "WE GRAPH"        │           │
│   │   Personalization   │         │   Transformation    │           │
│   ├─────────────────────┤         ├─────────────────────┤           │
│   │ • Adapt AI behavior │         │ • Aggregate patterns│           │
│   │ • Match service     │         │ • Identify clusters │           │
│   │   layer to user     │         │ • Reveal friction   │           │
│   │ • Optimize UX       │         │ • Prioritize roadmap│           │
│   │ • Reduce friction   │         │ • Measure adoption  │           │
│   └─────────────────────┘         └─────────────────────┘           │
│              │                              │                        │
│              └──────────┬───────────────────┘                        │
│                         │                                            │
│                         ▼                                            │
│              ┌─────────────────────┐                                 │
│              │  SHARED PERSONA     │                                 │
│              │  DATA LAYER         │                                 │
│              └─────────────────────┘                                 │
│                                                                       │
└─────────────────────────────────────────────────────────────────────┘
```

### 2.2 Value Proposition

**For Individual Users:**
- AI experiences tailored to maturity level and work patterns
- Reduced cognitive load through appropriate automation
- Higher trust through transparency matched to comfort level

**For Enterprise Leadership:**
- Real-time visibility into organizational AI readiness
- Data-driven identification of high-ROI opportunities
- Evidence-based portfolio investment decisions

---

## 3. MECE Archetype Framework

### 3.1 The 2×2 Matrix

Every role has exactly **4 personas** based on two axes:

```
                          AI MATURITY
                    LOW ◄─────────────► HIGH
                     │                    │
              ┌──────┴────────────────────┴──────┐
              │                                   │
    ROUTINE   │   LEARNER      │    AUTOMATOR    │
    WORK      │                │                 │
    (Low      │   "Beginner"   │   "Power User"  │
    Complexity)│   Needs        │   Seeks         │
              │   guidance     │   efficiency    │
              ├────────────────┼─────────────────┤
    STRATEGIC │   SKEPTIC      │   ORCHESTRATOR  │
    WORK      │                │                 │
    (High     │"Traditionalist"│   "Visionary"   │
    Complexity)│   Requires     │   Drives        │
              │   proof        │   innovation    │
              │                │                 │
              └────────────────┴─────────────────┘
```

### 3.2 Archetype Definitions

#### AUTOMATOR (High AI + Routine Work)
| Attribute | Value |
|-----------|-------|
| **AI Maturity Score** | 70-85 |
| **Work Complexity Score** | 30-45 |
| **Technology Adoption** | Early Adopter |
| **Risk Tolerance** | Moderate |
| **Change Readiness** | High |
| **Preferred Service** | WORKFLOWS |
| **Primary Goal** | Eliminate repetitive tasks |
| **Key Pain** | Manual processes waste time |

**Mindset**: "If I do this more than twice, I should automate it"

#### ORCHESTRATOR (High AI + Strategic Work)
| Attribute | Value |
|-----------|-------|
| **AI Maturity Score** | 75-90 |
| **Work Complexity Score** | 70-90 |
| **Technology Adoption** | Innovator |
| **Risk Tolerance** | High |
| **Change Readiness** | Very High |
| **Preferred Service** | ASK_PANEL / SOLUTION_BUILDER |
| **Primary Goal** | Strategic advantage through AI |
| **Key Pain** | Can't synthesize 50+ sources fast enough |

**Mindset**: "I need to see the full picture across multiple dimensions"

#### LEARNER (Low AI + Routine Work)
| Attribute | Value |
|-----------|-------|
| **AI Maturity Score** | 25-45 |
| **Work Complexity Score** | 30-45 |
| **Technology Adoption** | Late Majority |
| **Risk Tolerance** | Low |
| **Change Readiness** | Moderate |
| **Preferred Service** | ASK_EXPERT |
| **Primary Goal** | Build confidence with AI |
| **Key Pain** | Overwhelmed by complex tools |

**Mindset**: "I want to learn, but I'm afraid of breaking something"

#### SKEPTIC (Low AI + Strategic Work)
| Attribute | Value |
|-----------|-------|
| **AI Maturity Score** | 20-40 |
| **Work Complexity Score** | 70-85 |
| **Technology Adoption** | Laggard |
| **Risk Tolerance** | Low |
| **Change Readiness** | Low |
| **Preferred Service** | ASK_PANEL (with HITL) |
| **Primary Goal** | Validate before trusting |
| **Key Pain** | Can't trust black-box AI |

**Mindset**: "I need to understand and verify before I trust"

### 3.3 Archetype Inference Algorithm

```python
def assign_archetype(persona):
    """
    Automatically assign archetype based on scores.
    Returns: archetype, confidence_score
    """
    work_score = persona.work_complexity_score  # 0-100
    ai_score = persona.ai_maturity_score        # 0-100
    
    # Determine quadrant
    if work_score < 50 and ai_score >= 50:
        archetype = 'AUTOMATOR'
    elif work_score >= 50 and ai_score >= 50:
        archetype = 'ORCHESTRATOR'
    elif work_score < 50 and ai_score < 50:
        archetype = 'LEARNER'
    else:  # work_score >= 50 and ai_score < 50
        archetype = 'SKEPTIC'
    
    # Calculate confidence (distance from center)
    distance = abs(work_score - 50) + abs(ai_score - 50)
    confidence = min(distance / 100, 1.0)
    
    return archetype, confidence
```

---

## 4. Data Architecture

### 4.1 Entity Hierarchy

```
┌─────────────────────────────────────────────────────────────────┐
│                           TENANT                                 │
│  • Industry settings (Pharma, Digital Health)                    │
│  • Compliance requirements                                       │
│  • Org-wide defaults                                             │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        ORG_FUNCTION                              │
│  • Medical Affairs, Sales, Finance, R&D, etc.                    │
│  • Function-level KPIs                                           │
│  • Regulatory context                                            │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       ORG_DEPARTMENT                             │
│  • Field Medical, HEOR, Medical Strategy, etc.                   │
│  • Department focus areas                                        │
│  • Typical team structures                                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          ORG_ROLE                                │
│  • Medical Director, MSL, HEOR Manager, etc.                     │
│  • Role responsibilities (shared by all 4 personas)              │
│  • Required skills (shared by all 4 personas)                    │
│  • Salary ranges, education requirements                         │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                          PERSONA                                 │
│  • 4 per role (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)        │
│  • Archetype-specific behaviors only                             │
│  • AI maturity, work complexity, preferences                     │
│  • Links to 24 junction tables                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 4.2 Table Relationships

```sql
-- Core hierarchy
tenants (1) ──────────────────► (N) org_functions
org_functions (1) ────────────► (N) org_departments
org_departments (1) ──────────► (N) org_roles
org_roles (1) ────────────────► (4) personas  -- Always 4 per role

-- Persona extensions
personas (1) ─────────────────► (N) persona_pain_points
personas (1) ─────────────────► (N) persona_goals
personas (1) ─────────────────► (N) persona_motivations
personas (1) ─────────────────► (N) persona_typical_day
-- ... 20 more junction tables
```

---

## 5. Inheritance Model

### 5.1 What Personas Inherit (DO NOT DUPLICATE)

| Data | Source | Inherit Via |
|------|--------|-------------|
| Role name, description | `org_roles` | `role_id` FK |
| Role responsibilities | `role_responsibilities` | JOIN |
| Role required skills | `role_skills` | JOIN |
| Salary ranges | `org_roles.salary_min/max` | JOIN |
| Education requirements | `org_roles.education_requirements` | JOIN |
| Typical reporting structure | `org_roles.reports_to` | JOIN |
| Function name | `org_functions` | `function_id` FK |
| Department name | `org_departments` | `department_id` FK |
| Tenant settings | `tenants` | `tenant_id` FK |

### 5.2 What Personas Store Directly (UNIQUE PER ARCHETYPE)

| Data | Store In | Why Unique |
|------|----------|------------|
| Archetype | `personas.archetype` | Defines the persona variant |
| AI maturity score | `personas.ai_maturity_score` | Varies: 78 vs 25 |
| Work complexity score | `personas.work_complexity_score` | Varies: 45 vs 82 |
| Technology adoption | `personas.technology_adoption` | Early Adopter vs Laggard |
| Risk tolerance | `personas.risk_tolerance` | High vs Low |
| Change readiness | `personas.change_readiness` | Very High vs Low |
| Preferred service layer | `personas.preferred_service_layer` | WORKFLOWS vs ASK_PANEL |
| Background story | `personas.background_story` | Unique narrative |
| Day in the life | `personas.a_day_in_the_life` | Different routines |
| Pain points | `persona_pain_points` | Different frustrations |
| Goals | `persona_goals` | Different objectives |
| Motivations | `persona_motivations` | Different drivers |

### 5.3 Complete View (JOINs Everything)

```sql
CREATE OR REPLACE VIEW v_persona_complete AS
SELECT 
    -- Persona-specific
    p.id,
    p.name,
    p.slug,
    p.archetype,
    p.archetype_confidence,
    p.ai_maturity_score,
    p.work_complexity_score,
    p.technology_adoption,
    p.risk_tolerance,
    p.change_readiness,
    p.preferred_service_layer,
    p.background_story,
    p.a_day_in_the_life,
    
    -- Inherited from role
    r.name AS role_name,
    r.slug AS role_slug,
    r.description AS role_description,
    r.seniority_min,
    r.seniority_max,
    r.salary_min_usd,
    r.salary_max_usd,
    r.typical_team_size,
    r.reports_to,
    r.education_requirements,
    
    -- Inherited from function
    f.name AS function_name,
    f.slug AS function_slug,
    
    -- Inherited from department
    d.name AS department_name,
    d.slug AS department_slug,
    
    -- Tenant
    t.name AS tenant_name,
    t.slug AS tenant_slug

FROM personas p
LEFT JOIN org_roles r ON p.role_id = r.id
LEFT JOIN org_functions f ON p.function_id = f.id
LEFT JOIN org_departments d ON p.department_id = d.id
LEFT JOIN tenants t ON p.tenant_id = t.id
WHERE p.is_active = true AND p.deleted_at IS NULL;
```

---

## 6. Schema Reference

### 6.1 Core Personas Table

```sql
CREATE TABLE personas (
    -- Identity
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    tagline TEXT,
    one_liner TEXT,
    
    -- Foreign Keys (Inheritance)
    role_id UUID REFERENCES org_roles(id),
    function_id UUID REFERENCES org_functions(id),
    department_id UUID REFERENCES org_departments(id),
    
    -- MECE Archetype
    archetype TEXT CHECK (archetype IN ('AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC')),
    archetype_confidence NUMERIC(3,2),  -- 0.00 to 1.00
    
    -- Work Pattern Scores
    work_pattern work_pattern_enum,  -- 'routine', 'strategic', 'mixed'
    work_complexity_score NUMERIC(5,2),  -- 0-100
    ai_maturity_score NUMERIC(5,2),  -- 0-100
    
    -- Professional Context
    seniority_level TEXT,  -- 'entry', 'mid', 'senior', 'director', 'executive'
    years_of_experience INTEGER,
    years_in_current_role INTEGER,
    years_in_industry INTEGER,
    education_level TEXT,
    
    -- Organization Context
    typical_organization_size TEXT,
    organization_type TEXT,
    geographic_scope TEXT,
    reporting_to TEXT,
    team_size TEXT,
    team_size_typical INTEGER,
    direct_reports INTEGER,
    budget_authority TEXT,
    budget_authority_level budget_authority_enum,  -- 'none', 'limited', 'moderate', 'significant', 'high'
    
    -- Behavioral Attributes
    work_style TEXT,
    work_arrangement TEXT,
    decision_making_style TEXT,
    learning_style TEXT,
    technology_adoption TEXT,  -- 'innovator', 'early_adopter', 'early_majority', 'late_majority', 'laggard'
    risk_tolerance TEXT,  -- 'low', 'moderate', 'high'
    change_readiness TEXT,  -- 'low', 'moderate', 'high', 'very_high'
    
    -- Gen AI Profile
    gen_ai_readiness_level gen_ai_readiness_enum,  -- 'beginner', 'developing', 'intermediate', 'advanced'
    preferred_service_layer service_layer_enum,  -- 'ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER', 'MIXED'
    gen_ai_adoption_score NUMERIC(5,2),
    gen_ai_trust_score NUMERIC(5,2),
    gen_ai_usage_frequency TEXT,
    gen_ai_primary_use_case TEXT,
    
    -- Narrative
    background_story TEXT,
    a_day_in_the_life TEXT,
    
    -- Salary Benchmarks
    salary_min_usd INTEGER,
    salary_max_usd INTEGER,
    salary_median_usd INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    salary_year INTEGER,
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    validation_status TEXT DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Constraints
    UNIQUE(tenant_id, slug)
);

-- Indexes for common queries
CREATE INDEX idx_personas_tenant ON personas(tenant_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_archetype ON personas(archetype) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_role ON personas(role_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_function ON personas(function_id) WHERE deleted_at IS NULL;
```

### 6.2 Enum Types

```sql
-- Work pattern
CREATE TYPE work_pattern_enum AS ENUM ('routine', 'strategic', 'mixed');

-- Budget authority
CREATE TYPE budget_authority_enum AS ENUM ('none', 'limited', 'moderate', 'significant', 'high');

-- Gen AI readiness
CREATE TYPE gen_ai_readiness_enum AS ENUM ('beginner', 'developing', 'intermediate', 'advanced');

-- Service layer preference
CREATE TYPE service_layer_enum AS ENUM ('ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER', 'MIXED');

-- Timeframe
CREATE TYPE timeframe_enum AS ENUM ('short_term', 'medium_term', 'long_term');

-- Urgency
CREATE TYPE urgency_enum AS ENUM ('immediate', 'high', 'medium', 'low');

-- Complexity
CREATE TYPE complexity_enum AS ENUM ('simple', 'moderate', 'complex', 'very_complex');
```

---

## 7. Junction Tables

### 7.1 Complete List (24 Tables)

| # | Table | Purpose | Records/Persona |
|---|-------|---------|-----------------|
| 1 | `persona_pain_points` | Frustrations and problems | 5-10 |
| 2 | `persona_goals` | Short/long-term objectives | 3-7 |
| 3 | `persona_motivations` | What drives them | 3-5 |
| 4 | `persona_values` | Core beliefs | 3-5 |
| 5 | `persona_frustrations` | Detailed pain points | 5-10 |
| 6 | `persona_typical_day` | Daily activities | 6-12 |
| 7 | `persona_challenges` | Workplace challenges | 3-7 |
| 8 | `persona_skills` | Current capabilities | 5-10 |
| 9 | `persona_skill_gaps` | Development needs | 3-5 |
| 10 | `persona_tools_used` | Technology stack | 5-10 |
| 11 | `persona_information_sources` | Where they learn | 3-7 |
| 12 | `persona_education` | Degrees and schools | 1-3 |
| 13 | `persona_certifications` | Professional certs | 1-5 |
| 14 | `persona_success_metrics` | KPIs they track | 3-5 |
| 15 | `persona_buying_process` | Purchase behavior | 1 |
| 16 | `persona_buying_triggers` | What prompts purchase | 3-5 |
| 17 | `persona_objections` | Reasons for "no" | 3-5 |
| 18 | `persona_adoption_barriers` | What blocks adoption | 3-5 |
| 19 | `persona_aspirations` | Career goals | 2-4 |
| 20 | `persona_personality_traits` | Behavioral traits | 3-5 |
| 21 | `persona_communication_preferences` | Channels preferred | 2-4 |
| 22 | `persona_content_preferences` | Content types | 3-5 |
| 23 | `persona_vpanes_scoring` | VPANES scores | 1 |
| 24 | `persona_jtbd` | Jobs to be done | 3-7 |

### 7.2 Key Junction Table Schemas

```sql
-- Pain Points
CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    pain_point TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    frequency TEXT CHECK (frequency IN ('rarely', 'sometimes', 'often', 'always')),
    category TEXT,  -- 'process', 'tool', 'organizational', 'technical'
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Goals
CREATE TABLE persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    goal_text TEXT NOT NULL,
    goal_type TEXT CHECK (goal_type IN ('professional', 'personal', 'organizational', 'career')),
    timeframe TEXT CHECK (timeframe IN ('short_term', 'medium_term', 'long_term')),
    priority INTEGER DEFAULT 0,
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Typical Day Activities
CREATE TABLE persona_typical_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    time_block TEXT,  -- '6:00 AM', '9:00 AM', etc.
    activity TEXT NOT NULL,
    duration_minutes INTEGER,
    category TEXT,  -- 'strategic', 'operational', 'administrative', 'meetings'
    ai_assisted BOOLEAN DEFAULT FALSE,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- VPANES Scoring
CREATE TABLE persona_vpanes_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    visibility_score INTEGER CHECK (visibility_score BETWEEN 0 AND 10),
    pain_score INTEGER CHECK (pain_score BETWEEN 0 AND 10),
    actions_score INTEGER CHECK (actions_score BETWEEN 0 AND 10),
    needs_score INTEGER CHECK (needs_score BETWEEN 0 AND 10),
    emotions_score INTEGER CHECK (emotions_score BETWEEN 0 AND 10),
    scenarios_score INTEGER CHECK (scenarios_score BETWEEN 0 AND 10),
    total_score INTEGER GENERATED ALWAYS AS (
        COALESCE(visibility_score, 0) + 
        COALESCE(pain_score, 0) + 
        COALESCE(actions_score, 0) + 
        COALESCE(needs_score, 0) + 
        COALESCE(emotions_score, 0) + 
        COALESCE(scenarios_score, 0)
    ) STORED,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id)
);

-- Buying Process
CREATE TABLE persona_buying_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    role_in_purchase TEXT,  -- 'Decision Maker', 'Influencer', 'Gatekeeper', 'User'
    decision_timeframe TEXT,  -- '1-3 months', '3-6 months', etc.
    typical_budget_range TEXT,
    approval_process_complexity TEXT CHECK (approval_process_complexity IN ('simple', 'moderate', 'complex', 'very_complex')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(persona_id)
);

-- Buying Triggers
CREATE TABLE persona_buying_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    trigger_type TEXT CHECK (trigger_type IN ('regulatory', 'competitive', 'internal_initiative', 'crisis', 'growth')),
    trigger_description TEXT NOT NULL,
    urgency_level TEXT CHECK (urgency_level IN ('immediate', 'high', 'medium', 'low')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 8. VPANES Scoring

### 8.1 Framework Definition

**VPANES** = Visibility, Pain, Actions, Needs, Emotions, Scenarios

| Dimension | Question | Scale |
|-----------|----------|-------|
| **V**isibility | How aware is this persona of their problem? | 0-10 |
| **P**ain | How painful is the problem? | 0-10 |
| **A**ctions | Are they actively seeking solutions? | 0-10 |
| **N**eeds | Do they have budget and authority? | 0-10 |
| **E**motions | What's the emotional intensity? | 0-10 |
| **S**cenarios | How frequently do they encounter the problem? | 0-10 |

### 8.2 Score Interpretation

| Total Score | Priority | Interpretation |
|-------------|----------|----------------|
| 0-15 | Low | Not ready for AI, deprioritize |
| 16-30 | Medium | Lukewarm interest, nurture |
| 31-45 | High | Strong product-market fit |
| 46-60 | Ideal | Perfect fit, prioritize |

### 8.3 Typical Scores by Archetype

| Archetype | V | P | A | N | E | S | Total | Priority |
|-----------|---|---|---|---|---|---|-------|----------|
| AUTOMATOR | 8 | 7 | 8 | 5 | 6 | 9 | 43 | High |
| ORCHESTRATOR | 9 | 8 | 9 | 8 | 7 | 8 | 49 | Ideal |
| LEARNER | 5 | 5 | 4 | 3 | 5 | 6 | 28 | Medium |
| SKEPTIC | 7 | 6 | 3 | 6 | 4 | 7 | 33 | High |

---

## 9. Seeding Pipeline

### 9.1 Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERSONA SEEDING PIPELINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  1. SCHEMA INTROSPECTION                                         │
│     ├── Read deployed database schema                            │
│     ├── Validate column names and types                          │
│     └── Extract enum values from constraints                     │
│                           ↓                                       │
│  2. ROLE SEEDING (First)                                         │
│     ├── Create/update org_roles                                  │
│     ├── Add role_responsibilities                                │
│     └── Add role_skills                                          │
│                           ↓                                       │
│  3. PERSONA SEEDING (4 per role)                                 │
│     ├── Create AUTOMATOR variant                                 │
│     ├── Create ORCHESTRATOR variant                              │
│     ├── Create LEARNER variant                                   │
│     └── Create SKEPTIC variant                                   │
│                           ↓                                       │
│  4. JUNCTION TABLE SEEDING                                       │
│     ├── Pain points (archetype-specific)                         │
│     ├── Goals (archetype-specific)                               │
│     ├── Motivations (archetype-specific)                         │
│     └── ... 21 more tables                                       │
│                           ↓                                       │
│  5. VALIDATION                                                   │
│     ├── Verify 4 personas per role                               │
│     ├── Check junction table population                          │
│     └── Validate VPANES scores                                   │
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

### 9.2 Seeding Order

```sql
-- Step 1: Ensure role exists
INSERT INTO org_roles (name, slug, function_id, ...) VALUES (...);

-- Step 2: Add role-level data (shared by all 4 personas)
INSERT INTO role_responsibilities (role_id, responsibility, ...) VALUES (...);
INSERT INTO role_skills (role_id, skill_name, ...) VALUES (...);

-- Step 3: Create 4 personas for the role
INSERT INTO personas (role_id, archetype, ai_maturity_score, ...) VALUES
    (role_id, 'AUTOMATOR', 78, ...),
    (role_id, 'ORCHESTRATOR', 85, ...),
    (role_id, 'LEARNER', 35, ...),
    (role_id, 'SKEPTIC', 25, ...);

-- Step 4: Add persona-specific junction data
INSERT INTO persona_pain_points (persona_id, pain_point, ...) VALUES (...);
INSERT INTO persona_goals (persona_id, goal_text, ...) VALUES (...);
-- ... etc for all 24 junction tables
```

### 9.3 Seed File Template

```sql
-- ============================================================
-- PERSONA SEED: [ROLE_NAME]
-- ============================================================
-- Creates 4 MECE personas for [Role Name]
-- Version: 1.0.0
-- Date: YYYY-MM-DD
-- ============================================================

DO $$
DECLARE
    v_tenant_id UUID;
    v_role_id UUID;
    v_function_id UUID;
    v_automator_id UUID;
    v_orchestrator_id UUID;
    v_learner_id UUID;
    v_skeptic_id UUID;
BEGIN
    -- Get tenant
    SELECT id INTO v_tenant_id FROM tenants WHERE slug = 'pharma';
    
    -- Get function
    SELECT id INTO v_function_id FROM org_functions WHERE slug = 'medical-affairs';
    
    -- Get or create role
    SELECT id INTO v_role_id FROM org_roles WHERE slug = 'medical-director';
    
    -- Disable trigger temporarily
    ALTER TABLE personas DISABLE TRIGGER trigger_update_gen_ai_readiness;
    
    -- Delete existing personas for this role (idempotent)
    DELETE FROM personas WHERE role_id = v_role_id AND tenant_id = v_tenant_id;
    
    -- ============================================================
    -- AUTOMATOR
    -- ============================================================
    INSERT INTO personas (
        tenant_id, role_id, function_id,
        name, slug, title, tagline, archetype,
        ai_maturity_score, work_complexity_score,
        technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer,
        seniority_level, years_of_experience,
        is_active, created_at, updated_at
    ) VALUES (
        v_tenant_id, v_role_id, v_function_id,
        'Dr. Amanda Foster - Medical Director Automator',
        'dr-amanda-foster-medical-director-automator',
        'Medical Director, Oncology',
        'Data-Driven Medical Strategy Leader',
        'AUTOMATOR',
        78.0, 45.0,
        'Early Adopter', 'Moderate', 'High',
        'WORKFLOWS',
        'director', 14,
        true, NOW(), NOW()
    ) RETURNING id INTO v_automator_id;
    
    -- Add pain points for AUTOMATOR
    INSERT INTO persona_pain_points (persona_id, pain_point, severity, frequency, category, sequence_order)
    VALUES 
        (v_automator_id, 'Manual compilation of team activity reports', 'high', 'always', 'process', 1),
        (v_automator_id, 'Time spent on routine content review', 'high', 'often', 'process', 2),
        (v_automator_id, 'Repetitive KOL engagement tracking', 'medium', 'often', 'tool', 3);
    
    -- Add goals for AUTOMATOR
    INSERT INTO persona_goals (persona_id, goal_text, goal_type, timeframe, priority, sequence_order)
    VALUES 
        (v_automator_id, 'Automate 80% of routine medical affairs tasks', 'professional', 'medium_term', 1, 1),
        (v_automator_id, 'Reduce team administrative burden by 50%', 'organizational', 'short_term', 2, 2);
    
    -- ============================================================
    -- ORCHESTRATOR (repeat pattern)
    -- ============================================================
    -- ... similar INSERT statements ...
    
    -- ============================================================
    -- LEARNER (repeat pattern)
    -- ============================================================
    -- ... similar INSERT statements ...
    
    -- ============================================================
    -- SKEPTIC (repeat pattern)
    -- ============================================================
    -- ... similar INSERT statements ...
    
    -- Re-enable trigger
    ALTER TABLE personas ENABLE TRIGGER trigger_update_gen_ai_readiness;
    
    RAISE NOTICE 'Created 4 personas for Medical Director role';
END $$;
```

---

## 10. Service Layer Mapping

### 10.1 Archetype → Service Preference

| Archetype | Primary Service | Secondary | Rarely Used |
|-----------|-----------------|-----------|-------------|
| AUTOMATOR | WORKFLOWS (80%) | ASK_EXPERT (15%) | ASK_PANEL |
| ORCHESTRATOR | ASK_PANEL (60%) | SOLUTION_BUILDER (30%) | ASK_EXPERT |
| LEARNER | ASK_EXPERT (50%) | WORKFLOWS-guided (40%) | ASK_PANEL |
| SKEPTIC | ASK_PANEL+HITL (50%) | WORKFLOWS+validation (40%) | SOLUTION_BUILDER |

### 10.2 Service Routing Logic

```python
def route_to_service(persona, request):
    """Route request to appropriate service based on archetype."""
    
    if persona.archetype == 'AUTOMATOR':
        if request.type == 'routine_task':
            return 'WORKFLOWS', {'automation_level': 'high'}
        elif request.type == 'quick_question':
            return 'ASK_EXPERT', {'style': 'concise'}
            
    elif persona.archetype == 'ORCHESTRATOR':
        if request.complexity == 'high':
            return 'ASK_PANEL', {'panel_type': 'synthesis', 'agents': 5}
        else:
            return 'SOLUTION_BUILDER', {'mode': 'custom'}
            
    elif persona.archetype == 'LEARNER':
        if request.type == 'learning':
            return 'ASK_EXPERT', {'style': 'educational', 'depth': 'high'}
        else:
            return 'WORKFLOWS', {'mode': 'guided', 'explanations': True}
            
    elif persona.archetype == 'SKEPTIC':
        return 'ASK_PANEL', {
            'panel_type': 'validation',
            'citations': 'mandatory',
            'hitl': True
        }
```

### 10.3 UX Adaptation by Archetype

| Element | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|---------|-----------|--------------|---------|---------|
| Response Length | Short | Medium-Long | Long | Long |
| Citations | Minimal | Medium | Medium | Mandatory |
| Proactivity | High | Medium | Low | Very Low |
| Explanation Depth | Minimal | Moderate | High | High |
| Automation Level | Maximum | Moderate | Guided | HITL required |

---

## 11. Implementation Checklist

### 11.1 Schema Setup

- [ ] Create all enum types
- [ ] Create `personas` table with all columns
- [ ] Create 24 junction tables
- [ ] Create indexes for common queries
- [ ] Create `v_persona_complete` view
- [ ] Set up triggers for `updated_at`

### 11.2 Role-Level Data

- [ ] Seed `org_functions` (Medical Affairs, Sales, etc.)
- [ ] Seed `org_departments` per function
- [ ] Seed `org_roles` per department
- [ ] Add `role_responsibilities` for each role
- [ ] Add `role_skills` for each role

### 11.3 Persona Seeding

- [ ] Create 4 personas per role (MECE)
- [ ] Verify archetype scores align with quadrant
- [ ] Populate all 24 junction tables per persona
- [ ] Add VPANES scores for each persona
- [ ] Validate no duplicate slugs

### 11.4 Validation Queries

```sql
-- Check persona count per role
SELECT 
    r.name as role_name,
    COUNT(p.id) as persona_count,
    ARRAY_AGG(p.archetype ORDER BY p.archetype) as archetypes
FROM org_roles r
LEFT JOIN personas p ON p.role_id = r.id
WHERE p.is_active = true
GROUP BY r.id, r.name
HAVING COUNT(p.id) != 4;  -- Should return 0 rows

-- Check junction table population
SELECT 
    p.name,
    (SELECT COUNT(*) FROM persona_pain_points WHERE persona_id = p.id) as pain_points,
    (SELECT COUNT(*) FROM persona_goals WHERE persona_id = p.id) as goals,
    (SELECT COUNT(*) FROM persona_motivations WHERE persona_id = p.id) as motivations,
    (SELECT COUNT(*) FROM persona_typical_day WHERE persona_id = p.id) as typical_day
FROM personas p
WHERE p.is_active = true
ORDER BY p.name;

-- Check VPANES scores
SELECT 
    p.name,
    p.archetype,
    v.total_score,
    CASE 
        WHEN v.total_score >= 46 THEN 'Ideal'
        WHEN v.total_score >= 31 THEN 'High'
        WHEN v.total_score >= 16 THEN 'Medium'
        ELSE 'Low'
    END as priority
FROM personas p
LEFT JOIN persona_vpanes_scoring v ON v.persona_id = p.id
WHERE p.is_active = true
ORDER BY v.total_score DESC NULLS LAST;
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| `PERSONA_INHERITANCE_STRATEGY.md` | Detailed inheritance rules |
| `SCHEMA_DISCOVERY.md` | How to discover actual schema |
| `PERSONA_SEED_TEMPLATE.sql` | Reusable seed template |
| `seeds/medical_affairs/` | Medical Affairs seed files |

---

**Document Status**: ✅ Active - Authoritative Reference  
**Maintained By**: VITAL Platform Team  
**Next Review**: December 27, 2025


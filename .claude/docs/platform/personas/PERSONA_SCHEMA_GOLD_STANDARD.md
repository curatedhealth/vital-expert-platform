# PERSONA SCHEMA - GOLD STANDARD DESIGN

**Version**: 4.0.0 (Gold Standard)  
**Date**: November 28, 2025  
**Status**: Design Approved  
**Purpose**: Authoritative schema supporting dual-purpose intelligence

---

## Executive Summary

This document defines the **definitive** persona database schema for the VITAL platform. It consolidates learnings from 3 previous migrations and establishes a clean, normalized, scalable foundation.

### Design Principles

1. **Full Normalization** - No JSONB for structured data
2. **Proper Inheritance** - Roles → Functions → Departments hierarchy
3. **Lookup Tables** - Extensible value sets, not check constraints
4. **Junction Tables** - Rich attributes, consistent naming
5. **Type Safety** - Enums for immutable values, lookups for extensible
6. **Performance** - Denormalized columns where beneficial
7. **Multi-Tenancy** - Full isolation with `tenant_id`

---

## 1. ENUM TYPES (Immutable Core Values)

These are PostgreSQL ENUM types for values that will **never change**.

### 1.1 Archetype Enum (MECE Framework)
```sql
CREATE TYPE archetype_enum AS ENUM (
    'AUTOMATOR',    -- High AI + Routine Work
    'ORCHESTRATOR', -- High AI + Strategic Work
    'LEARNER',      -- Low AI + Routine Work
    'SKEPTIC'       -- Low AI + Strategic Work
);
```

**Usage**: `personas.archetype archetype_enum`

---

### 1.2 Work Pattern Enum
```sql
CREATE TYPE work_pattern_enum AS ENUM (
    'routine',    -- Repetitive, operational
    'strategic',  -- High-level, complex
    'mixed'       -- Both routine and strategic
);
```

**Usage**: `personas.work_pattern work_pattern_enum`

---

### 1.3 Service Layer Preference Enum
```sql
CREATE TYPE service_layer_preference AS ENUM (
    'ASK_EXPERT',      -- L1: Single-agent Q&A
    'ASK_PANEL',       -- L2: Multi-agent reasoning
    'WORKFLOWS',       -- L3: Multi-step automation
    'SOLUTION_BUILDER', -- L4: Integrated solutions
    'MIXED'            -- Uses multiple layers
);
```

**Usage**: `personas.preferred_service_layer service_layer_preference`

---

### 1.4 Gen AI Readiness Level Enum
```sql
CREATE TYPE gen_ai_readiness_level AS ENUM (
    'beginner',     -- New to AI
    'developing',   -- Building skills
    'proficient',   -- Regular user
    'advanced',     -- Power user
    'expert'        -- AI champion
);
```

**Usage**: `personas.gen_ai_readiness_level gen_ai_readiness_level`

---

### 1.5 Budget Authority Level Enum
```sql
CREATE TYPE budget_authority_level AS ENUM (
    'none',        -- No budget authority
    'limited',     -- < $10K
    'moderate',    -- $10K - $100K
    'significant', -- $100K - $1M
    'high'         -- > $1M
);
```

**Usage**: `personas.budget_authority_level budget_authority_level`

---

### 1.6 Validation Status Enum
```sql
CREATE TYPE validation_status AS ENUM (
    'draft',          -- Work in progress
    'pending_review', -- Awaiting validation
    'validated',      -- Reviewed and approved
    'published',      -- Active and visible
    'archived'        -- No longer active
);
```

**Usage**: `personas.validation_status validation_status`

---

## 2. LOOKUP TABLES (Extensible Value Sets)

These tables store values that **may grow over time**.

### 2.1 Seniority Levels
```sql
CREATE TABLE lookup_seniority_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    years_experience_min INTEGER,
    years_experience_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**:
| Code | Display Name | Years Min | Years Max |
|------|-------------|-----------|-----------|
| entry | Entry Level | 0 | 2 |
| junior | Junior | 2 | 4 |
| mid | Mid-Level | 4 | 7 |
| senior | Senior | 7 | 12 |
| lead | Lead | 10 | 15 |
| manager | Manager | 8 | 15 |
| director | Director | 12 | 20 |
| vp | Vice President | 15 | 25 |
| c_level | C-Level Executive | 20 | 40 |

---

### 2.2 Organization Sizes
```sql
CREATE TABLE lookup_organization_sizes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    employee_min INTEGER,
    employee_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**:
| Code | Display Name | Employee Min | Employee Max |
|------|-------------|--------------|--------------|
| startup | Startup (1-50) | 1 | 50 |
| small | Small (51-200) | 51 | 200 |
| medium | Medium (201-1000) | 201 | 1000 |
| large | Large (1001-10000) | 1001 | 10000 |
| enterprise | Enterprise (10000+) | 10001 | NULL |

---

### 2.3 Technology Adoption (Rogers' Diffusion)
```sql
CREATE TABLE lookup_technology_adoption (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    population_percentage DECIMAL(4,1),
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**:
| Code | Display Name | Population % |
|------|-------------|--------------|
| innovator | Innovator | 2.5 |
| early_adopter | Early Adopter | 13.5 |
| early_majority | Early Majority | 34.0 |
| late_majority | Late Majority | 34.0 |
| laggard | Laggard | 16.0 |

---

### 2.4 Risk Tolerance
```sql
CREATE TABLE lookup_risk_tolerance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: very_low, low, moderate, high, very_high

---

### 2.5 Change Readiness
```sql
CREATE TABLE lookup_change_readiness (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: resistant, low, moderate, high, very_high

---

### 2.6 Geographic Scopes
```sql
CREATE TABLE lookup_geographic_scopes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: local, regional, national, multi_national, global

---

### 2.7 Pain Point Categories
```sql
CREATE TABLE lookup_pain_point_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: process, tool, data, organizational, resource, compliance, communication

---

### 2.8 Severity Levels
```sql
CREATE TABLE lookup_severity_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: low, medium, high, critical

---

### 2.9 Frequency Levels
```sql
CREATE TABLE lookup_frequency_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: rarely, sometimes, often, always

---

### 2.10 Timeframes
```sql
CREATE TABLE lookup_timeframes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    months_min INTEGER,
    months_max INTEGER,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: immediate (0-1mo), short_term (1-6mo), medium_term (6-18mo), long_term (18-36mo), strategic (36+mo)

---

### 2.11 Goal Types
```sql
CREATE TABLE lookup_goal_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: efficiency, quality, growth, compliance, innovation, learning, career

---

### 2.12 Challenge Types
```sql
CREATE TABLE lookup_challenge_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: technical, organizational, resource, knowledge, regulatory, competitive, cultural

---

### 2.13 Trigger Types (for buying_triggers)
```sql
CREATE TABLE lookup_trigger_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: regulatory, competitive, internal_initiative, crisis, growth, budget_cycle

---

### 2.14 Conference Types
```sql
CREATE TABLE lookup_conference_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: academic, industry, regulatory, internal

---

### 2.15 Conference Roles
```sql
CREATE TABLE lookup_conference_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    description TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

**Seed Data**: attendee, speaker, panelist, organizer, sponsor

---

## 3. CORE PERSONAS TABLE

### 3.1 Table Definition
```sql
CREATE TABLE personas (
    -- =============================================
    -- CORE IDENTITY
    -- =============================================
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    title TEXT,
    tagline TEXT,
    one_liner TEXT,
    
    -- =============================================
    -- ARCHETYPE ASSIGNMENT (MECE Framework)
    -- =============================================
    archetype archetype_enum,
    archetype_confidence NUMERIC(3,2) CHECK (archetype_confidence >= 0 AND archetype_confidence <= 1),
    work_pattern work_pattern_enum,
    work_complexity_score NUMERIC(5,2) CHECK (work_complexity_score >= 0 AND work_complexity_score <= 100),
    ai_maturity_score NUMERIC(5,2) CHECK (ai_maturity_score >= 0 AND ai_maturity_score <= 100),
    
    -- =============================================
    -- ORGANIZATIONAL CONTEXT
    -- =============================================
    role_id UUID REFERENCES org_roles(id) ON DELETE SET NULL,
    function_id UUID REFERENCES org_functions(id) ON DELETE SET NULL,
    department_id UUID REFERENCES org_departments(id) ON DELETE SET NULL,
    
    -- Denormalized names (for performance)
    role_name TEXT,
    role_slug TEXT,
    function_name TEXT,
    function_slug TEXT,
    department_name TEXT,
    department_slug TEXT,
    
    -- =============================================
    -- PROFESSIONAL PROFILE
    -- =============================================
    seniority_level TEXT, -- FK to lookup_seniority_levels.code
    years_of_experience INTEGER,
    years_in_current_role INTEGER,
    years_in_industry INTEGER,
    years_in_function INTEGER,
    education_level TEXT,
    
    typical_organization_size TEXT, -- FK to lookup_organization_sizes.code
    organization_type TEXT,
    geographic_scope TEXT, -- FK to lookup_geographic_scopes.code
    reporting_to TEXT,
    team_size TEXT,
    team_size_typical INTEGER,
    direct_reports INTEGER,
    span_of_control TEXT,
    
    budget_authority TEXT,
    budget_authority_level budget_authority_level,
    
    -- =============================================
    -- BEHAVIORAL ATTRIBUTES
    -- =============================================
    work_style TEXT,
    work_arrangement TEXT,
    decision_making_style TEXT,
    learning_style TEXT,
    technology_adoption TEXT, -- FK to lookup_technology_adoption.code
    risk_tolerance TEXT, -- FK to lookup_risk_tolerance.code
    change_readiness TEXT, -- FK to lookup_change_readiness.code
    collaboration_style TEXT,
    communication_preference TEXT,
    
    -- =============================================
    -- GEN AI PROFILE
    -- =============================================
    gen_ai_readiness_level gen_ai_readiness_level,
    preferred_service_layer service_layer_preference,
    gen_ai_adoption_score NUMERIC(5,2) CHECK (gen_ai_adoption_score >= 0 AND gen_ai_adoption_score <= 100),
    gen_ai_trust_score NUMERIC(5,2) CHECK (gen_ai_trust_score >= 0 AND gen_ai_trust_score <= 100),
    gen_ai_usage_frequency TEXT,
    gen_ai_primary_use_case TEXT,
    
    -- =============================================
    -- NARRATIVE & BACKGROUND
    -- =============================================
    background_story TEXT,
    a_day_in_the_life TEXT,
    
    -- =============================================
    -- SALARY BENCHMARKS
    -- =============================================
    salary_min_usd INTEGER,
    salary_max_usd INTEGER,
    salary_median_usd INTEGER,
    salary_currency TEXT DEFAULT 'USD',
    salary_year INTEGER,
    salary_sources TEXT,
    sample_size TEXT,
    confidence_level TEXT,
    data_recency TEXT,
    geographic_benchmark_scope TEXT,
    
    -- =============================================
    -- METADATA
    -- =============================================
    persona_type TEXT,
    persona_number INTEGER,
    segment TEXT,
    journey_stage TEXT,
    section TEXT,
    
    validation_status validation_status DEFAULT 'draft',
    validated_by UUID REFERENCES users(id),
    validated_at TIMESTAMPTZ,
    notes TEXT,
    
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- =============================================
    -- CONSTRAINTS
    -- =============================================
    CONSTRAINT personas_tenant_slug_unique UNIQUE (tenant_id, slug),
    CONSTRAINT personas_slug_unique UNIQUE (slug)
);
```

### 3.2 Indexes
```sql
CREATE INDEX idx_personas_tenant_id ON personas(tenant_id);
CREATE INDEX idx_personas_role_id ON personas(role_id);
CREATE INDEX idx_personas_function_id ON personas(function_id);
CREATE INDEX idx_personas_department_id ON personas(department_id);
CREATE INDEX idx_personas_archetype ON personas(archetype);
CREATE INDEX idx_personas_tenant_function ON personas(tenant_id, function_id);
CREATE INDEX idx_personas_tenant_archetype ON personas(tenant_id, archetype);
CREATE INDEX idx_personas_validation_status ON personas(validation_status) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_is_active ON personas(is_active) WHERE deleted_at IS NULL;
CREATE INDEX idx_personas_slug ON personas(slug);
```

---

## 4. JUNCTION TABLES (18 Core Tables)

All junction tables follow consistent naming and structure:
- Prefix: `persona_*`
- Primary Key: `id UUID`
- Foreign Keys: `persona_id UUID`, `tenant_id UUID`
- Ordering: `sequence_order INTEGER` (where applicable)
- Timestamps: `created_at TIMESTAMPTZ`, `updated_at TIMESTAMPTZ`

### 4.1 Pain Points
```sql
CREATE TABLE persona_pain_points (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    pain_point TEXT NOT NULL,
    category TEXT, -- FK to lookup_pain_point_categories.code
    severity TEXT DEFAULT 'medium', -- FK to lookup_severity_levels.code
    frequency TEXT DEFAULT 'often', -- FK to lookup_frequency_levels.code
    impact_description TEXT,
    workaround TEXT,
    is_ai_addressable BOOLEAN DEFAULT NULL,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.2 Goals
```sql
CREATE TABLE persona_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    goal_text TEXT NOT NULL,
    goal_type TEXT, -- FK to lookup_goal_types.code
    priority TEXT DEFAULT 'medium', -- FK to lookup_severity_levels.code
    timeframe TEXT, -- FK to lookup_timeframes.code
    is_measurable BOOLEAN DEFAULT FALSE,
    success_criteria TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.3 Motivations
```sql
CREATE TABLE persona_motivations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    motivation_text TEXT NOT NULL,
    motivation_category TEXT CHECK (motivation_category IN ('professional', 'organizational', 'personal')),
    importance TEXT CHECK (importance IN ('low', 'medium', 'high', 'critical')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.4 Challenges
```sql
CREATE TABLE persona_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    challenge_text TEXT NOT NULL,
    challenge_type TEXT, -- FK to lookup_challenge_types.code
    impact TEXT DEFAULT 'medium', -- FK to lookup_severity_levels.code
    current_solution TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.5 Typical Day Activities
```sql
CREATE TABLE persona_typical_day (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    time_slot TEXT NOT NULL, -- e.g., "08:00", "14:30"
    activity_description TEXT NOT NULL,
    duration_minutes INTEGER,
    is_ai_automatable BOOLEAN DEFAULT NULL,
    
    sort_order INTEGER DEFAULT 0, -- Note: using sort_order for time sequence
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.6 Tools Used
```sql
CREATE TABLE persona_tools_used (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    tool_name TEXT NOT NULL,
    tool_category TEXT, -- e.g., "CRM", "Analytics", "Communication"
    proficiency_level TEXT CHECK (proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
    usage_frequency TEXT, -- FK to lookup_frequency_levels.code
    satisfaction_score DECIMAL(2,1) CHECK (satisfaction_score >= 0 AND satisfaction_score <= 5),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.7 Stakeholders
```sql
CREATE TABLE persona_stakeholders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    stakeholder_role TEXT NOT NULL,
    stakeholder_department TEXT,
    relationship_type TEXT CHECK (relationship_type IN ('reports_to', 'peer', 'direct_report', 'collaborator', 'client', 'vendor')),
    interaction_frequency TEXT, -- FK to lookup_frequency_levels.code
    influence_level TEXT CHECK (influence_level IN ('low', 'medium', 'high', 'critical')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.8 VPANES Scoring
```sql
CREATE TABLE persona_vpanes_scoring (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    visibility DECIMAL(3,1) CHECK (visibility >= 0 AND visibility <= 10),
    pain DECIMAL(3,1) CHECK (pain >= 0 AND pain <= 10),
    actions DECIMAL(3,1) CHECK (actions >= 0 AND actions <= 10),
    needs DECIMAL(3,1) CHECK (needs >= 0 AND needs <= 10),
    emotions DECIMAL(3,1) CHECK (emotions >= 0 AND emotions <= 10),
    scenarios DECIMAL(3,1) CHECK (scenarios >= 0 AND scenarios <= 10),
    
    total_score DECIMAL(4,1) GENERATED ALWAYS AS (
        visibility + pain + actions + needs + emotions + scenarios
    ) STORED,
    
    priority_tier TEXT GENERATED ALWAYS AS (
        CASE
            WHEN (visibility + pain + actions + needs + emotions + scenarios) >= 46 THEN 'tier_1_ideal'
            WHEN (visibility + pain + actions + needs + emotions + scenarios) >= 31 THEN 'tier_2_high'
            WHEN (visibility + pain + actions + needs + emotions + scenarios) >= 16 THEN 'tier_3_medium'
            ELSE 'tier_4_low'
        END
    ) STORED,
    
    scoring_notes TEXT,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id)
);
```

---

### 4.9 Education
```sql
CREATE TABLE persona_education (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    degree TEXT NOT NULL,
    field_of_study TEXT NOT NULL,
    institution TEXT NOT NULL,
    year_completed INTEGER CHECK (year_completed >= 1950 AND year_completed <= 2030),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.10 Certifications
```sql
CREATE TABLE persona_certifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    certification_name TEXT NOT NULL,
    issuing_organization TEXT NOT NULL,
    year_obtained INTEGER CHECK (year_obtained >= 1950 AND year_obtained <= 2030),
    expiration_date DATE,
    is_current BOOLEAN DEFAULT TRUE,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.11 Success Metrics
```sql
CREATE TABLE persona_success_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    metric_name TEXT NOT NULL,
    metric_description TEXT NOT NULL,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id, metric_name)
);
```

---

### 4.12 Buying Process
```sql
CREATE TABLE persona_buying_process (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    role_in_purchase TEXT CHECK (role_in_purchase IN ('decision_maker', 'influencer', 'gatekeeper', 'user', 'champion')),
    decision_timeframe TEXT,
    typical_budget_range TEXT,
    approval_process_complexity TEXT CHECK (approval_process_complexity IN ('simple', 'moderate', 'complex', 'very_complex')),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    UNIQUE(persona_id)
);
```

---

### 4.13 Buying Triggers
```sql
CREATE TABLE persona_buying_triggers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    trigger_type TEXT, -- FK to lookup_trigger_types.code
    trigger_description TEXT NOT NULL,
    urgency_level TEXT CHECK (urgency_level IN ('low', 'medium', 'high', 'critical')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.14 Aspirations
```sql
CREATE TABLE persona_aspirations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    aspiration_text TEXT NOT NULL,
    timeframe TEXT CHECK (timeframe IN ('short_term', 'medium_term', 'long_term')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.15 Annual Conferences
```sql
CREATE TABLE persona_annual_conferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    conference_name TEXT NOT NULL,
    conference_type TEXT, -- FK to lookup_conference_types.code
    role TEXT, -- FK to lookup_conference_roles.code
    typical_frequency TEXT CHECK (typical_frequency IN ('annual', 'biannual', 'occasional', 'rare')),
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.16 Publications
```sql
CREATE TABLE persona_publications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    publication_type TEXT CHECK (publication_type IN ('peer_reviewed', 'blog', 'social_media', 'book', 'whitepaper', 'case_study')),
    topic TEXT NOT NULL,
    year INTEGER,
    frequency_per_year INTEGER,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.17 Social Media
```sql
CREATE TABLE persona_social_media (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    platform TEXT NOT NULL,
    activity_level TEXT CHECK (activity_level IN ('none', 'lurker', 'occasional', 'regular', 'influencer')),
    content_focus TEXT,
    follower_count_range TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### 4.18 Evidence Sources
```sql
CREATE TABLE persona_evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    
    source_type TEXT CHECK (source_type IN ('primary_research', 'secondary_research', 'expert_interview', 'industry_report', 'survey_data', 'case_study')),
    citation TEXT NOT NULL,
    key_finding TEXT NOT NULL,
    sample_size INTEGER,
    methodology TEXT,
    publication_date DATE,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    url TEXT,
    
    sequence_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 5. VIEWS FOR ANALYTICS

### 5.1 v_personas_summary (Lightweight List View)
```sql
CREATE OR REPLACE VIEW v_personas_summary AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.title,
    p.tagline,
    p.archetype,
    p.work_pattern,
    p.seniority_level,
    p.function_name,
    p.department_name,
    p.role_name,
    p.validation_status,
    p.is_active,
    p.created_at,
    p.updated_at
FROM personas p
WHERE p.deleted_at IS NULL;
```

---

### 5.2 v_personas_with_vpanes (Scoring Analysis)
```sql
CREATE OR REPLACE VIEW v_personas_with_vpanes AS
SELECT 
    p.id,
    p.tenant_id,
    p.name,
    p.slug,
    p.archetype,
    p.work_pattern,
    p.function_name,
    v.visibility,
    v.pain,
    v.actions,
    v.needs,
    v.emotions,
    v.scenarios,
    v.total_score,
    v.priority_tier
FROM personas p
LEFT JOIN persona_vpanes_scoring v ON p.id = v.persona_id
WHERE p.deleted_at IS NULL;
```

---

### 5.3 v_archetype_distribution (Aggregate Analytics)
```sql
CREATE OR REPLACE VIEW v_archetype_distribution AS
SELECT 
    t.tenant_key as tenant,
    p.archetype,
    p.function_name,
    COUNT(*) as persona_count,
    AVG(p.ai_maturity_score) as avg_ai_maturity,
    AVG(p.work_complexity_score) as avg_work_complexity,
    AVG(v.total_score) as avg_vpanes_score
FROM personas p
LEFT JOIN tenants t ON p.tenant_id = t.id
LEFT JOIN persona_vpanes_scoring v ON p.id = v.persona_id
WHERE p.deleted_at IS NULL
GROUP BY t.tenant_key, p.archetype, p.function_name;
```

---

## 6. HELPER FUNCTIONS

### 6.1 Calculate Gen AI Readiness (Fixed Version)
```sql
CREATE OR REPLACE FUNCTION calculate_gen_ai_readiness_level(
    p_ai_maturity_score NUMERIC,
    p_technology_adoption TEXT,
    p_risk_tolerance TEXT,
    p_change_readiness TEXT
) RETURNS TEXT AS $$
DECLARE
    v_score NUMERIC := 0;
BEGIN
    -- Base score from AI maturity
    v_score := COALESCE(p_ai_maturity_score, 50) / 20.0; -- 0-5 scale
    
    -- Adjust based on technology adoption
    v_score := v_score + CASE 
        WHEN p_technology_adoption = 'innovator' THEN 2.0
        WHEN p_technology_adoption = 'early_adopter' THEN 1.0
        WHEN p_technology_adoption = 'early_majority' THEN 0
        WHEN p_technology_adoption = 'late_majority' THEN -1.0
        WHEN p_technology_adoption = 'laggard' THEN -2.0
        ELSE 0
    END;
    
    -- Adjust based on risk tolerance
    v_score := v_score + CASE 
        WHEN p_risk_tolerance IN ('high', 'very_high') THEN 1.0
        WHEN p_risk_tolerance = 'moderate' THEN 0
        WHEN p_risk_tolerance IN ('low', 'very_low') THEN -1.0
        ELSE 0
    END;
    
    -- Adjust based on change readiness
    v_score := v_score + CASE 
        WHEN p_change_readiness IN ('high', 'very_high') THEN 1.0
        WHEN p_change_readiness = 'moderate' THEN 0
        WHEN p_change_readiness IN ('low', 'resistant') THEN -1.0
        ELSE 0
    END;
    
    -- Map to readiness level
    RETURN CASE 
        WHEN v_score >= 7 THEN 'expert'
        WHEN v_score >= 5 THEN 'advanced'
        WHEN v_score >= 3 THEN 'proficient'
        WHEN v_score >= 1 THEN 'developing'
        ELSE 'beginner'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

### 6.2 Infer Preferred Service Layer
```sql
CREATE OR REPLACE FUNCTION infer_preferred_service_layer(
    p_archetype TEXT,
    p_work_pattern TEXT
) RETURNS TEXT AS $$
BEGIN
    RETURN CASE
        WHEN p_archetype = 'AUTOMATOR' THEN 'WORKFLOWS'
        WHEN p_archetype = 'ORCHESTRATOR' AND p_work_pattern = 'strategic' THEN 'SOLUTION_BUILDER'
        WHEN p_archetype = 'ORCHESTRATOR' THEN 'ASK_PANEL'
        WHEN p_archetype = 'LEARNER' THEN 'ASK_EXPERT'
        WHEN p_archetype = 'SKEPTIC' THEN 'ASK_PANEL'
        ELSE 'MIXED'
    END;
END;
$$ LANGUAGE plpgsql IMMUTABLE;
```

---

### 6.3 Sync Persona Org Names (Denormalization)
```sql
CREATE OR REPLACE FUNCTION sync_persona_org_names() RETURNS TRIGGER AS $$
BEGIN
    -- Update denormalized organization names from FKs
    IF NEW.role_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.role_name, NEW.role_slug
        FROM org_roles WHERE id = NEW.role_id;
    END IF;
    
    IF NEW.function_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.function_name, NEW.function_slug
        FROM org_functions WHERE id = NEW.function_id;
    END IF;
    
    IF NEW.department_id IS NOT NULL THEN
        SELECT name, slug INTO NEW.department_name, NEW.department_slug
        FROM org_departments WHERE id = NEW.department_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 7. TRIGGERS

### 7.1 Update Timestamps
```sql
CREATE TRIGGER update_personas_updated_at
    BEFORE UPDATE ON personas
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
```

---

### 7.2 Sync Organization Names
```sql
CREATE TRIGGER trigger_sync_persona_org_names
    BEFORE INSERT OR UPDATE OF function_id, department_id, role_id
    ON personas
    FOR EACH ROW
    EXECUTE FUNCTION sync_persona_org_names();
```

---

## 8. SUMMARY

### Table Count
- **Core Table**: 1 (personas)
- **Enum Types**: 6
- **Lookup Tables**: 15
- **Junction Tables**: 18
- **Views**: 3
- **Functions**: 3
- **Triggers**: 2

### Total Database Objects: 48

---

## 9. NEXT STEPS

1. ✅ Review this design
2. ⏭️ Create idempotent migration file
3. ⏭️ Create MSL seed template
4. ⏭️ Update documentation
5. ⏭️ Deploy to staging
6. ⏭️ Validate with test personas

---

**Document Status**: ✅ Design Complete  
**Ready for Implementation**: Yes  
**Reviewed By**: Pending  
**Approved By**: Pending


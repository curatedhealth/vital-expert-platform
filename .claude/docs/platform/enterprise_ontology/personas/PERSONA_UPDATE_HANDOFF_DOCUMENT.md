# PERSONA UPDATE HANDOFF DOCUMENT

**Purpose**: Comprehensive briefing for AI agent to update personas for Pharma and Digital Health tenants  
**Created**: 2025-11-27  
**Status**: Ready for Implementation  
**Documentation Folder**: `/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/platform/personas`

---

## 📋 TABLE OF CONTENTS

1. [Mission Overview](#1-mission-overview)
2. [Current Status Summary](#2-current-status-summary)
3. [Data Schema Reference](#3-data-schema-reference)
4. [Identified Gaps](#4-identified-gaps)
5. [Documentation & Context Files](#5-documentation--context-files)
6. [Implementation Guide](#6-implementation-guide)
7. [Validation Checklist](#7-validation-checklist)

---

## 1. MISSION OVERVIEW

### Objective
Update and complete personas for **two tenants**:
1. **Pharmaceuticals Tenant** (slug: `pharma`)
2. **Digital Health Startup Tenant** (slug: `digital-health-startup`)

### Key Requirements
- Follow **MECE Framework**: 4 personas per role (Automator, Orchestrator, Learner, Skeptic)
- Populate all **24 junction tables** per persona
- Include **VPANES scoring** for each persona
- Ensure **multi-tenant isolation** via `tenant_id`

---

## 2. CURRENT STATUS SUMMARY

### 2.1 Overall Progress

| Metric | Status | Notes |
|--------|--------|-------|
| **Schema** | ✅ 100% Complete | 72+ tables defined |
| **Medical Affairs Personas** | ✅ 67 personas seeded | Pharma tenant |
| **Other Functions** | ⏳ 60% Complete | ~240/400 personas |
| **Digital Health Personas** | ⚠️ Needs Assessment | May need creation |
| **Junction Tables** | ⏳ Partially populated | 24 tables per persona |
| **VPANES Scores** | ⏳ In Progress | Not all personas scored |

### 2.2 Tenant Status

#### Pharma Tenant
- **Tenant ID**: `c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244` (verify in database)
- **Slug**: `pharma`
- **Personas Status**: Partially complete (Medical Affairs done, other functions pending)
- **Organizational Structure**: ✅ Complete (Functions, Departments, Roles defined)

#### Digital Health Startup Tenant
- **Tenant ID**: `b8026534-02a7-4d24-bf4c-344591964e02` (verify in database)
- **Slug**: `digital-health-startup`
- **Personas Status**: ⚠️ Needs assessment
- **Organizational Structure**: ✅ Complete (6 functions, 16 departments, 45+ roles)

---

## 3. DATA SCHEMA REFERENCE

### 3.1 Core Personas Table (87 columns)

```sql
-- Main personas table structure
CREATE TABLE personas (
    -- Identity
    id UUID PRIMARY KEY,
    tenant_id UUID REFERENCES tenants(id),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255),
    tagline VARCHAR(500),
    
    -- Archetype (MECE Framework)
    archetype VARCHAR(50), -- 'AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC'
    persona_type VARCHAR(50),
    persona_number INTEGER,
    
    -- Organizational Mapping
    role_id UUID REFERENCES org_roles(id),
    role_name VARCHAR(255),
    role_slug VARCHAR(255),
    function_id UUID REFERENCES org_functions(id),
    function_name VARCHAR(255),
    department_id UUID REFERENCES org_departments(id),
    department_name VARCHAR(255),
    
    -- Demographics
    seniority_level VARCHAR(50), -- 'entry', 'mid', 'senior', 'director', 'executive'
    years_of_experience INTEGER,
    education_level TEXT[],
    geographic_scope VARCHAR(50),
    typical_organization_size VARCHAR(100),
    
    -- Work Characteristics
    work_pattern VARCHAR(50), -- 'routine', 'strategic', 'mixed'
    work_complexity_score INTEGER, -- 0-100 (<50 = routine, >=50 = strategic)
    work_arrangement VARCHAR(50),
    direct_reports INTEGER,
    budget_authority_level VARCHAR(50),
    
    -- AI/Technology Attributes
    ai_maturity_score INTEGER, -- 0-100 (<50 = low, >=50 = high)
    technology_adoption VARCHAR(50),
    gen_ai_readiness_level VARCHAR(50),
    preferred_service_layer VARCHAR(50), -- 'ASK_EXPERT', 'ASK_PANEL', 'WORKFLOWS', 'SOLUTION_BUILDER'
    
    -- Behavioral
    risk_tolerance VARCHAR(50),
    change_readiness VARCHAR(50),
    decision_making_style VARCHAR(50),
    learning_style VARCHAR(50),
    
    -- VPANES (stored as JSONB or separate columns)
    vpanes_scores JSONB, -- {visibility: 8, pain: 7, actions: 8, needs: 5, emotions: 6, scenarios: 9}
    
    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.2 The 24 Junction Tables (Per Persona)

| # | Table Name | Purpose | Required Data |
|---|------------|---------|---------------|
| 1 | `persona_typical_day_activities` | Day-in-life activities | 6-13 activities |
| 2 | `persona_motivations` | What drives them | 3-7 items |
| 3 | `persona_values` | Core values | 3-5 items |
| 4 | `persona_frustrations` | Pain points | 5-10 items |
| 5 | `persona_evidence_sources` | Research sources | 5-10 items |
| 6 | `persona_goals` | Short/long-term goals | 3-7 items |
| 7 | `persona_challenges` | Workplace challenges | 3-7 items |
| 8 | `persona_skills` | Current skill set | 5-10 items |
| 9 | `persona_skill_gaps` | Development areas | 3-5 items |
| 10 | `persona_tools_used` | Technology stack | 5-10 items |
| 11 | `persona_information_sources` | Info sources | 3-7 items |
| 12 | `persona_decision_criteria` | Evaluation criteria | 3-5 items |
| 13 | `persona_buying_triggers` | Purchase triggers | 3-5 items |
| 14 | `persona_objections` | Common objections | 3-5 items |
| 15 | `persona_success_metrics` | KPIs | 3-5 items |
| 16 | `persona_communication_preferences` | Preferred channels | 3-5 items |
| 17 | `persona_content_preferences` | Content types | 3-5 items |
| 18 | `persona_influencers` | Trusted sources | 3-5 items |
| 19 | `persona_adoption_barriers` | Adoption blockers | 3-5 items |
| 20 | `persona_ideal_features` | Dream features | 3-5 items |
| 21 | `persona_workflow_steps` | Process maps | 5-10 items |
| 22 | `persona_pain_point_intensity` | Scored pain points | 5-10 items |
| 23 | `persona_opportunity_areas` | AI value areas | 3-5 items |
| 24 | `persona_competitive_alternatives` | Other tools | 3-5 items |

### 3.3 MECE Archetype Framework

```
AI MATURITY (How tech-savvy?)
    HIGH                            LOW
    ↓                               ↓

ROUTINE     ┌──────────────────┬──────────────────┐
WORK        │   AUTOMATOR      │    LEARNER       │
(<50 work   │   ai_maturity≥50 │  ai_maturity<50  │
complexity) │   work_complex<50│  work_complex<50 │
            │                  │                  │
            │   "Power User"   │   "Beginner"     │
            └──────────────────┴──────────────────┘

STRATEGIC   ┌──────────────────┬──────────────────┐
WORK        │  ORCHESTRATOR    │    SKEPTIC       │
(≥50 work   │   ai_maturity≥50 │   ai_maturity<50 │
complexity) │   work_complex≥50│   work_complex≥50│
            │                  │                  │
            │  "AI Leader"     │  "Traditionalist"│
            └──────────────────┴──────────────────┘
```

### 3.4 VPANES Scoring Framework

Each persona needs scores (0-10) for 6 dimensions:

| Dimension | What it Measures | Score Range |
|-----------|------------------|-------------|
| **V**isibility | Problem awareness | 0-10 |
| **P**ain | Problem severity | 0-10 |
| **A**ctions | Solution-seeking behavior | 0-10 |
| **N**eeds | Budget/authority | 0-10 |
| **E**motions | Emotional intensity | 0-10 |
| **S**cenarios | Problem frequency | 0-10 |

**Total Score Interpretation**:
- 0-15: Low priority (not ready for AI)
- 16-30: Medium priority (lukewarm)
- 31-45: High priority (strong fit)
- 46-60: Ideal persona (perfect fit)

---

## 4. IDENTIFIED GAPS

### 4.1 Pharma Tenant Gaps

| Gap | Priority | Details |
|-----|----------|---------|
| **Non-Medical Affairs personas** | HIGH | Sales, Marketing, Finance, HR, R&D, etc. need personas |
| **Junction table data** | MEDIUM | Many personas missing full junction table data |
| **VPANES scores** | MEDIUM | Not all personas have VPANES populated |
| **4 archetypes per role** | HIGH | Ensure each role has all 4 MECE personas |

### 4.2 Digital Health Tenant Gaps

| Gap | Priority | Details |
|-----|----------|---------|
| **Persona existence** | HIGH | Verify if personas exist for this tenant |
| **Org structure mapping** | MEDIUM | Ensure personas link to org_roles |
| **Digital Health-specific attributes** | MEDIUM | Different from Pharma (SaMD, DTx focus) |
| **Startup context** | MEDIUM | Smaller teams, faster pace, different challenges |

### 4.3 Schema Gaps (Minor)

| Gap | Priority | Details |
|-----|----------|---------|
| `persona_tenants` junction | LOW | Multi-tenant assignment (may exist as `allowed_tenants` array) |
| `persona_skills` linking | LOW | Should link to skills catalog |
| Array normalization | LOW | Some arrays in main table could be junctions |

---

## 5. DOCUMENTATION & CONTEXT FILES

### 5.1 Primary Documentation Folder
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/platform/personas/
```

### 5.2 Key Files to Read

| File | Purpose | Priority |
|------|---------|----------|
| `README.md` | Index and quick links | ⭐⭐⭐ |
| `PERSONAS_COMPLETE_GUIDE.md` | Full framework explanation | ⭐⭐⭐ |
| `PERSONA_SCHEMA_ANALYSIS.md` | Schema health assessment | ⭐⭐⭐ |
| `PERSONA_DATABASE_SCHEMA_NORMALIZED.sql` | Gold standard schema | ⭐⭐⭐ |
| `PERSONA_SEEDING_COMPLETE_GUIDE.md` | How to seed personas | ⭐⭐⭐ |
| `PERSONA_STRATEGY_GOLD_STANDARD.md` | Strategic framework | ⭐⭐ |
| `seeds/create_4_mece_personas_per_role.sql` | SQL template | ⭐⭐ |
| `seeds/persona_seed_template.md` | Data template | ⭐⭐ |

### 5.3 Related Documentation

| Location | Content |
|----------|---------|
| `.claude/docs/architecture/data-schema/` | Schema design docs |
| `supabase/migrations/` | Deployed migrations |
| `database/seeds/` | Seed data files |
| `.vital-command-center/` | Command center docs |

### 5.4 Useful SQL Queries Location
```
/Users/hichamnaim/Downloads/Cursor/VITAL path/.claude/docs/platform/personas/temp/
├── verify_medical_affairs_mapping.sql
└── verify_pharma_org_structure.sql
```

---

## 6. IMPLEMENTATION GUIDE

### 6.1 Step 1: Assess Current State

```sql
-- Query 1: Check persona counts by tenant
SELECT 
    t.name as tenant_name,
    t.slug as tenant_slug,
    COUNT(p.id) as persona_count
FROM tenants t
LEFT JOIN personas p ON p.tenant_id = t.id
GROUP BY t.id, t.name, t.slug
ORDER BY persona_count DESC;

-- Query 2: Check personas by archetype for each tenant
SELECT 
    t.slug as tenant,
    p.archetype,
    COUNT(*) as count
FROM personas p
JOIN tenants t ON p.tenant_id = t.id
WHERE t.slug IN ('pharma', 'digital-health-startup')
GROUP BY t.slug, p.archetype
ORDER BY t.slug, p.archetype;

-- Query 3: Check roles without personas
SELECT 
    t.slug as tenant,
    r.name as role_name,
    r.slug as role_slug
FROM org_roles r
CROSS JOIN tenants t
WHERE t.slug IN ('pharma', 'digital-health-startup')
AND NOT EXISTS (
    SELECT 1 FROM personas p 
    WHERE p.role_id = r.id 
    AND p.tenant_id = t.id
)
AND r.is_active = true
ORDER BY t.slug, r.name;

-- Query 4: Check junction table population
SELECT 
    'persona_motivations' as table_name,
    COUNT(DISTINCT persona_id) as personas_with_data
FROM persona_motivations
UNION ALL
SELECT 'persona_frustrations', COUNT(DISTINCT persona_id) FROM persona_frustrations
UNION ALL
SELECT 'persona_goals', COUNT(DISTINCT persona_id) FROM persona_goals
UNION ALL
SELECT 'persona_typical_day_activities', COUNT(DISTINCT persona_id) FROM persona_typical_day_activities;
```

### 6.2 Step 2: Create Missing Personas

For each role without personas, create 4 MECE personas:

```sql
-- Template for creating 4 personas per role
DO $$
DECLARE
    v_tenant_id UUID := 'YOUR_TENANT_ID';
    v_role_id UUID := 'ROLE_ID';
    v_role_name VARCHAR := 'Role Name';
    v_role_slug VARCHAR := 'role-slug';
    v_persona_id UUID;
BEGIN
    -- 1. AUTOMATOR (High AI + Routine)
    INSERT INTO personas (
        tenant_id, role_id, role_name, role_slug,
        name, slug, title, archetype,
        ai_maturity_score, work_complexity_score,
        technology_adoption, risk_tolerance, change_readiness,
        preferred_service_layer
    ) VALUES (
        v_tenant_id, v_role_id, v_role_name, v_role_slug,
        v_role_name || ' - Automator', v_role_slug || '-automator', v_role_name, 'AUTOMATOR',
        75, 35,
        'early_adopter', 'moderate', 'high',
        'WORKFLOWS'
    ) RETURNING id INTO v_persona_id;
    -- Add junction table data for this persona...

    -- 2. ORCHESTRATOR (High AI + Strategic)
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_persona_id;
    
    -- 3. LEARNER (Low AI + Routine)
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_persona_id;
    
    -- 4. SKEPTIC (Low AI + Strategic)
    INSERT INTO personas (...) VALUES (...) RETURNING id INTO v_persona_id;
END $$;
```

### 6.3 Step 3: Populate Junction Tables

For each persona, populate the 24 junction tables:

```sql
-- Example: Add motivations for a persona
INSERT INTO persona_motivations (persona_id, motivation_text, motivation_type, strength)
VALUES 
    ('PERSONA_ID', 'Drive efficiency through automation', 'intrinsic', 'strong'),
    ('PERSONA_ID', 'Stay ahead of industry trends', 'achievement', 'moderate'),
    ('PERSONA_ID', 'Deliver measurable ROI', 'extrinsic', 'strong');

-- Example: Add frustrations
INSERT INTO persona_frustrations (persona_id, frustration_text, frustration_category, impact_severity)
VALUES 
    ('PERSONA_ID', 'Manual data entry into multiple systems', 'process', 'major'),
    ('PERSONA_ID', 'Lack of integration between tools', 'tool', 'moderate');

-- Example: Add typical day activities
INSERT INTO persona_typical_day_activities (persona_id, activity_name, time_of_day, duration_hours)
VALUES 
    ('PERSONA_ID', 'Review overnight alerts', 'morning', 0.5),
    ('PERSONA_ID', 'Team standup meeting', 'morning', 0.5),
    ('PERSONA_ID', 'Strategic planning session', 'midday', 2.0);
```

### 6.4 Step 4: Add VPANES Scores

```sql
-- Update VPANES scores for personas
UPDATE personas
SET vpanes_scores = jsonb_build_object(
    'visibility', 8,
    'pain', 7,
    'actions', 8,
    'needs', 5,
    'emotions', 6,
    'scenarios', 9
)
WHERE id = 'PERSONA_ID';
```

### 6.5 Digital Health Specific Considerations

Digital Health personas should reflect:
- **Startup context**: Smaller teams, multiple hats, faster pace
- **Regulatory focus**: FDA SaMD, DTx pathways
- **Product types**: Digital therapeutics, mHealth apps, wearables
- **Different functions**: Product & Engineering, Clinical, Regulatory, Commercial, Operations, Corporate

Example Digital Health persona attributes:
```sql
-- Digital Health Product Manager - Automator
INSERT INTO personas (
    tenant_id, name, slug, title, archetype,
    ai_maturity_score, work_complexity_score,
    typical_organization_size, geographic_scope
) VALUES (
    'DH_TENANT_ID',
    'Alex the Agile Product Lead',
    'alex-agile-product-lead-automator',
    'Senior Product Manager',
    'AUTOMATOR',
    80, 40,
    'Startup/Scale-up',
    'global'
);
```

---

## 7. VALIDATION CHECKLIST

### 7.1 Pre-Implementation
- [ ] Verify tenant IDs in database
- [ ] Review existing persona counts
- [ ] Identify roles without personas
- [ ] Understand org structure for each tenant

### 7.2 During Implementation
- [ ] Create 4 personas per role (MECE)
- [ ] Set correct archetype based on scores
- [ ] Populate all 24 junction tables
- [ ] Add VPANES scores
- [ ] Link to correct org_roles

### 7.3 Post-Implementation
- [ ] Verify persona counts match expectations
- [ ] Check all archetypes present per role
- [ ] Validate junction table population
- [ ] Confirm VPANES scores populated
- [ ] Test queries return expected data

### 7.4 Validation Queries

```sql
-- Final validation query
SELECT 
    t.slug as tenant,
    COUNT(DISTINCT p.id) as total_personas,
    COUNT(DISTINCT p.role_id) as roles_covered,
    COUNT(DISTINCT CASE WHEN p.archetype = 'AUTOMATOR' THEN p.id END) as automators,
    COUNT(DISTINCT CASE WHEN p.archetype = 'ORCHESTRATOR' THEN p.id END) as orchestrators,
    COUNT(DISTINCT CASE WHEN p.archetype = 'LEARNER' THEN p.id END) as learners,
    COUNT(DISTINCT CASE WHEN p.archetype = 'SKEPTIC' THEN p.id END) as skeptics,
    COUNT(DISTINCT CASE WHEN p.vpanes_scores IS NOT NULL THEN p.id END) as with_vpanes
FROM personas p
JOIN tenants t ON p.tenant_id = t.id
WHERE t.slug IN ('pharma', 'digital-health-startup')
GROUP BY t.slug;
```

---

## 📎 APPENDIX

### A. Archetype Characteristics Quick Reference

| Archetype | AI Maturity | Work Complexity | Preferred Service | Risk Tolerance | Change Readiness |
|-----------|-------------|-----------------|-------------------|----------------|------------------|
| AUTOMATOR | 70-80 | 30-40 | WORKFLOWS | Moderate | High |
| ORCHESTRATOR | 75-90 | 70-90 | SOLUTION_BUILDER | High | Very High |
| LEARNER | 30-45 | 30-40 | ASK_EXPERT | Low | Moderate |
| SKEPTIC | 25-40 | 70-85 | HYBRID | Low-Moderate | Low |

### B. Business Functions (Pharma)
1. Medical Affairs
2. Sales
3. Marketing
4. Finance
5. HR
6. R&D
7. Regulatory
8. Market Access
9. Supply Chain
10. IT
11. Legal
12. Corporate Strategy

### C. Business Functions (Digital Health)
1. Product & Engineering
2. Clinical
3. Regulatory & Quality
4. Commercial
5. Operations
6. Corporate

---

**Document Status**: ✅ Ready for Implementation  
**Last Updated**: 2025-11-27  
**Maintained By**: VITAL Platform Team

---

*This document provides all context needed for an AI agent to update personas for Pharma and Digital Health tenants.*


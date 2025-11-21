# VITAL Persona Schema v5.0 - Implementation Strategy
## For Supabase Database: Vital-expert bomltkhixeatxuoxmolq

**Created**: 2025-11-16
**Schema Version**: 5.0
**Total Tables**: 110 (57 primary + 53 junction)
**Total Fields**: 730+
**Status**: Planning → Implementation

---

## Executive Summary

### Business Value
- **Revenue Opportunity**: $10M+ through enhanced persona intelligence
- **Competitive Advantage**: Most comprehensive B2B persona system in healthcare
- **Dual Purpose**: Individual AI personalization + Enterprise opportunity mapping

### Technical Complexity
- **Scale**: 110 interconnected tables with 120+ foreign keys
- **Risk Level**: HIGH - Requires phased implementation
- **Timeline**: 3-4 weeks for complete implementation
- **Team**: Data Strategist + 4 specialized data agents

---

## Phase 1: Foundation (Week 1)

### Core Infrastructure Tables (15 tables)

**Priority: CRITICAL - Must complete first**

#### 1.1 Tenant & Security
```sql
-- Already exists in foundation
- tenants
- users
- auth integration
```

#### 1.2 Main Personas Table
```
File: sql/migrations/v5_0_001_personas_core.sql
Tables: 1
- personas (76 columns + RLS)
```

**Key Decisions**:
- ✅ Keep all 76 columns in main table (already normalized in existing schema)
- ✅ Encrypt PHI fields (avatar_url if contains identifiable info)
- ✅ Add tenant_id to every table for RLS
- ✅ Use UUID for all IDs

#### 1.3 Lookup/Reference Tables (14 tables)
```
File: sql/migrations/v5_0_002_lookup_tables.sql
Tables: 14
- persona_roles
- persona_industries
- persona_organization_sizes
- persona_budget_ranges
- persona_seniority_levels
- persona_education_levels
- persona_certification_types
- persona_communication_channels
- persona_content_preferences
- persona_meeting_types
- persona_decision_styles
- persona_risk_tolerances
- persona_change_readiness_levels
- persona_tech_adoption_levels
```

---

## Phase 2: Core Persona Attributes (Week 1-2)

### Existing Schema Tables (Sections 1-56) - 38 junction tables

**Priority: HIGH - Core persona functionality**

These tables already exist in your schema files (parts 1-8). We need to:
1. ✅ Verify they match v5.0 specification
2. ✅ Add any missing fields
3. ✅ Ensure proper indexes
4. ✅ Add RLS policies

```
File: sql/migrations/v5_0_003_verify_existing_schema.sql
Action: VERIFY & UPDATE (not recreate)
Tables: 38 junction tables from sections 1-56
```

**Existing Sections Include**:
- Demographics & Firmographics
- Professional Background
- Goals & Challenges
- Pain Points & Frustrations
- Decision-Making
- Technology & Tools
- Content & Communication
- Metrics & KPIs
- Buying Journey
- Day in the Life Of (DILO)
- And 46 more sections...

---

## Phase 3: Extended Time Perspectives (Week 2)

### NEW TABLES - Sections 57-59 (6 tables)

**Priority: MEDIUM - Enhanced temporal intelligence**

```
File: sql/migrations/v5_0_004_time_perspectives.sql
Tables: 6
```

#### Section 57: Week in the Life Of (WILO)
```sql
CREATE TABLE persona_week_in_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    day_of_week TEXT NOT NULL CHECK (day_of_week IN ('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday')),
    typical_start_time TIME,
    typical_end_time TIME,
    meeting_load TEXT CHECK (meeting_load IN ('heavy','moderate','light')),
    focus_time_available INTEGER CHECK (focus_time_available >= 0 AND focus_time_available <= 24),
    travel_likelihood TEXT CHECK (travel_likelihood IN ('high','medium','low','none')),
    energy_pattern TEXT CHECK (energy_pattern IN ('high','medium','low')),
    typical_activities TEXT[],
    stakeholder_interactions INTEGER,
    decision_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id)
);

CREATE TABLE persona_weekly_milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    milestone_type TEXT NOT NULL,
    milestone_description TEXT NOT NULL,
    week_phase TEXT CHECK (week_phase IN ('early','mid','late')),
    criticality TEXT CHECK (criticality IN ('critical','high','medium','low')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE persona_weekly_meetings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    meeting_type TEXT NOT NULL,
    frequency TEXT CHECK (frequency IN ('daily','weekly','bi_weekly','monthly')),
    duration_hours DECIMAL CHECK (duration_hours > 0 AND duration_hours <= 24),
    attendee_count INTEGER CHECK (attendee_count >= 2),
    value_rating INTEGER CHECK (value_rating >= 1 AND value_rating <= 10),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Section 58: Month in the Life Of (MILO)
```sql
CREATE TABLE persona_month_in_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    month_phase TEXT NOT NULL CHECK (month_phase IN ('beginning','mid','end')),
    key_deliverables TEXT[],
    reporting_obligations TEXT[],
    planning_activities TEXT[],
    external_engagements INTEGER CHECK (external_engagements >= 0),
    travel_days INTEGER CHECK (travel_days >= 0 AND travel_days <= 31),
    budget_review_involvement TEXT CHECK (budget_review_involvement IN ('owner','contributor','reviewer','none')),
    performance_review_cycle BOOLEAN DEFAULT false,
    strategic_initiative_time INTEGER CHECK (strategic_initiative_time >= 0),
    crisis_management_likelihood TEXT CHECK (crisis_management_likelihood IN ('high','medium','low','none')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE persona_monthly_objectives (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    objective_text TEXT NOT NULL,
    success_metric TEXT,
    achievement_rate DECIMAL CHECK (achievement_rate >= 0 AND achievement_rate <= 1),
    carry_forward BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

#### Section 59: Year in the Life Of (YILO)
```sql
CREATE TABLE persona_year_in_life (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    persona_id UUID NOT NULL REFERENCES personas(id) ON DELETE CASCADE,
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    quarter TEXT NOT NULL CHECK (quarter IN ('Q1','Q2','Q3','Q4')),
    quarter_focus TEXT CHECK (quarter_focus IN ('Planning','Execution','Review','Strategy')),
    annual_objectives TEXT[],
    budget_planning_role TEXT CHECK (budget_planning_role IN ('lead','support','input','none')),
    performance_review_timing TEXT,
    conference_attendance INTEGER CHECK (conference_attendance >= 0),
    professional_development_hours INTEGER CHECK (professional_development_hours >= 0),
    vacation_pattern TEXT CHECK (vacation_pattern IN ('distributed','concentrated','minimal')),
    career_milestone_expected TEXT,
    industry_cycle_alignment TEXT CHECK (industry_cycle_alignment IN ('peak_season','planning_season','quiet_period')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
```

**Indexes for Time Perspectives**:
```sql
CREATE INDEX idx_wilo_persona ON persona_week_in_life(persona_id);
CREATE INDEX idx_wilo_day ON persona_week_in_life(day_of_week);
CREATE INDEX idx_milo_persona ON persona_month_in_life(persona_id);
CREATE INDEX idx_yilo_persona_quarter ON persona_year_in_life(persona_id, quarter);
```

---

## Phase 4: Stakeholder Ecosystem (Week 2-3)

### NEW TABLES - Sections 60-65 (10 tables)

**Priority: MEDIUM - Strategic relationship mapping**

```
File: sql/migrations/v5_0_005_stakeholder_ecosystem.sql
Tables: 10
```

[Similar detailed SQL for all stakeholder tables...]

---

## Phase 5: Evidence Architecture (Week 3)

### NEW TABLES - Sections 66-71 (9 tables)

**Priority: LOW-MEDIUM - Research validation**

```
File: sql/migrations/v5_0_006_evidence_architecture.sql
Tables: 9
```

---

## Implementation Order & Dependencies

### Dependency Graph
```
tenants
   └── personas (CORE)
        ├── lookup_tables (14)
        ├── existing_junctions (38) [ALREADY EXISTS - VERIFY]
        ├── time_perspectives (6) [NEW]
        ├── stakeholder_ecosystem (10) [NEW]
        └── evidence_architecture (9) [NEW]
```

### Migration File Sequence
```
1. v5_0_001_personas_core.sql           ← Main personas table
2. v5_0_002_lookup_tables.sql           ← Reference data
3. v5_0_003_verify_existing_schema.sql  ← Audit existing 38 tables
4. v5_0_004_time_perspectives.sql       ← WILO, MILO, YILO (6 tables)
5. v5_0_005_stakeholder_ecosystem.sql   ← Stakeholders (10 tables)
6. v5_0_006_evidence_architecture.sql   ← Research/evidence (9 tables)
7. v5_0_007_indexes_optimization.sql    ← All indexes & performance
8. v5_0_008_rls_policies.sql           ← Row-level security
9. v5_0_009_views_and_functions.sql    ← Helper views/functions
10. v5_0_010_seed_data.sql             ← Initial seed data
```

---

## Performance Optimization Strategy

### Index Strategy
```sql
-- Primary indexes (on every table)
persona_id + tenant_id (composite)

-- Lookup optimization
GIN indexes on TEXT[] fields
BTREE on frequently filtered columns
Partial indexes with WHERE deleted_at IS NULL

-- Full-text search
CREATE INDEX idx_personas_search ON personas
USING gin(to_tsvector('english', name || ' ' || title || ' ' || company_name));
```

### Partitioning (Future - if needed)
```sql
-- Partition evidence tables by year
CREATE TABLE persona_public_research_2025 PARTITION OF persona_public_research
FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');
```

### Materialized Views
```sql
-- Aggregate persona metrics
CREATE MATERIALIZED VIEW persona_summary AS
SELECT
    p.id,
    p.name,
    p.title,
    COUNT(DISTINCT pg.id) as goals_count,
    COUNT(DISTINCT pp.id) as pain_points_count,
    COUNT(DISTINCT pr.id) as research_count,
    jsonb_build_object(
        'wilo', (SELECT json_agg(w.*) FROM persona_week_in_life w WHERE w.persona_id = p.id),
        'stakeholders', (SELECT count(*) FROM persona_internal_stakeholders s WHERE s.persona_id = p.id)
    ) as insights
FROM personas p
LEFT JOIN persona_goals pg ON p.id = pg.persona_id
LEFT JOIN persona_pain_points pp ON p.id = pp.persona_id
LEFT JOIN persona_public_research pr ON p.id = pr.persona_id
GROUP BY p.id;

CREATE UNIQUE INDEX idx_persona_summary_id ON persona_summary(id);
```

---

## Seed Data Strategy

### Approach: Template-Based Generation

#### Step 1: Create Persona Templates
```json
// seeds/templates/persona_medical_affairs_director.json
{
  "name": "Director of Medical Affairs",
  "seniority_level": "director",
  "typical_team_size": "8-12",
  "time_perspectives": {
    "week": {
      "Monday": {
        "meeting_load": "heavy",
        "focus_time": 2,
        "activities": ["Team sync", "Cross-functional planning"]
      },
      "Tuesday": {
        "meeting_load": "moderate",
        "focus_time": 4,
        "activities": ["Strategy work", "Stakeholder meetings"]
      }
    },
    "month": {
      "beginning": ["Budget review", "Monthly planning"],
      "mid": ["Execution tracking", "Team 1:1s"],
      "end": ["Reporting", "Performance reviews"]
    },
    "year": {
      "Q1": {"focus": "Planning", "conferences": 1},
      "Q2": {"focus": "Execution", "conferences": 2},
      "Q3": {"focus": "Review", "conferences": 1},
      "Q4": {"focus": "Strategy", "conferences": 1}
    }
  },
  "stakeholders": {
    "internal": [
      {"role": "VP Medical Affairs", "relationship": "reports_to", "influence": "very_high"},
      {"role": "Clinical Development Lead", "relationship": "peer", "influence": "high"}
    ],
    "external": [
      {"type": "KOL", "importance": "critical", "interaction_mode": "meetings"},
      {"type": "Medical societies", "importance": "high", "interaction_mode": "events"}
    ]
  },
  "evidence_sources": [
    {"type": "research", "title": "2024 Medical Affairs Benchmarking", "relevance": 9},
    {"type": "report", "title": "Gartner Healthcare Trends 2024", "relevance": 8}
  ]
}
```

#### Step 2: Generate Variants
```typescript
// Use vital-seed-generator to create 50-100 persona variants
const templates = [
  'medical_affairs_director',
  'market_access_director',
  'clinical_operations_manager',
  'regulatory_affairs_vp',
  'commercial_strategy_leader'
];

for (const template of templates) {
  await generatePersonaVariants(template, {
    count: 20,
    variationLevel: 'medium',
    includeTimeData: true,
    includeStakeholders: true,
    includeEvidence: true
  });
}
```

#### Step 3: Research-Backed Evidence
```typescript
// Use vital-data-researcher to collect real evidence
const evidenceData = await dataResearcher.collect({
  datasets: [
    'medical_affairs_surveys',      // Industry surveys
    'gartner_healthcare_reports',   // Analyst reports
    'mckinsey_pharma_insights',     // Consulting insights
    'linkedin_role_analysis'        // Real job postings/profiles
  ],
  outputFormat: 'sql',
  transformRules: 'persona_evidence_format'
});
```

---

## Risk Assessment

### HIGH RISKS

1. **Performance Degradation**
   - Risk: 110 tables with complex joins could be slow
   - Mitigation: Materialized views, proper indexing, query optimization
   - Owner: Data Strategist + Database Architect

2. **Data Integrity Issues**
   - Risk: 120+ foreign keys = many cascade opportunities for errors
   - Mitigation: Comprehensive testing, transaction wrapping, FK validation
   - Owner: Data Transformer + Test Engineer

3. **Schema Drift**
   - Risk: So many tables makes drift detection difficult
   - Mitigation: Use vital-schema-mapper to track all changes
   - Owner: Schema Mapper Agent

### MEDIUM RISKS

4. **Seed Data Quality**
   - Risk: Unrealistic or inconsistent test data
   - Mitigation: Template-based generation with validation
   - Owner: Seed Generator + Data Researcher

5. **RLS Policy Complexity**
   - Risk: 110 tables × RLS policies = maintenance nightmare
   - Mitigation: Policy templates, automated generation
   - Owner: Security Compliance Agent

---

## Agent Coordination Matrix

| Phase | Primary Agent | Supporting Agents | Deliverable |
|-------|---------------|-------------------|-------------|
| 1. Schema Mapping | vital-schema-mapper | - | Schema registry + TypeScript types |
| 2. Migration SQL | Data Strategist | Database Architect | 10 migration files |
| 3. Seed Templates | vital-seed-generator | Data Researcher | JSON templates |
| 4. Evidence Collection | vital-data-researcher | - | Research SQL seeds |
| 5. Data Transformation | vital-data-transformer | - | Transform existing data |
| 6. Security & RLS | Security Compliance | DevOps Engineer | RLS policies |
| 7. Testing | Test Engineer | - | Test coverage |
| 8. Documentation | Documentation Writer | - | ERD + API docs |

---

## Timeline Estimate

### Week 1: Foundation
- Day 1-2: Schema analysis & migration planning
- Day 3-4: Create core tables (personas + lookups)
- Day 5: Verify existing 38 junction tables

### Week 2: Extensions
- Day 1-2: Time perspectives (6 tables)
- Day 3-4: Stakeholder ecosystem (10 tables)
- Day 5: Testing & validation

### Week 3: Evidence & Optimization
- Day 1-2: Evidence architecture (9 tables)
- Day 3: Indexes & performance tuning
- Day 4: RLS policies
- Day 5: Helper views/functions

### Week 4: Seeding & Testing
- Day 1-2: Generate seed data templates
- Day 3: Collect evidence data
- Day 4: Populate database
- Day 5: End-to-end testing

**Total: 20 business days (4 weeks)**

---

## Next Immediate Actions

### Action 1: Schema Registry Setup
```bash
# Create schema registry directory
mkdir -p .vital/schemas/database/tables
mkdir -p .vital/schemas/mappings
mkdir -p .vital/schemas/types/generated

# Copy persona schema for reference
cp VITAL_Complete_Persona_Schema_v5.0_Enhanced.md .vital/schemas/reference/
```

### Action 2: Generate First Migration
```bash
# Create migrations directory
mkdir -p sql/migrations/v5.0

# Start with core personas table
# I'll generate: sql/migrations/v5.0/v5_0_001_personas_core.sql
```

### Action 3: Schema Introspection
```bash
# Connect to Supabase and introspect existing schema
# See what's already there vs. what we need to add
```

### Action 4: Create Seed Templates
```bash
# Create first persona template
# File: seeds/templates/persona_medical_affairs_director.json
```

---

## Success Metrics

### Technical Metrics
- ✅ All 110 tables created without errors
- ✅ All foreign keys validated
- ✅ RLS policies working correctly
- ✅ Query performance < 100ms for common queries
- ✅ Zero data integrity violations

### Business Metrics
- ✅ 50-100 realistic personas seeded
- ✅ Full time perspective data for each persona
- ✅ Stakeholder network mapped for all personas
- ✅ 80%+ personas have 5+ evidence sources
- ✅ TypeScript types generated and working

---

## Questions for Platform Orchestrator

Before proceeding, I recommend consulting vital-platform-orchestrator on:

1. **Strategic Alignment**
   - Does this 110-table schema align with PRD vision?
   - Is the evidence architecture essential for MVP or can it be Phase 2?

2. **Resource Allocation**
   - Is 4-week timeline acceptable?
   - Should we reduce scope for faster delivery?

3. **Business Priority**
   - Which persona sections are most critical for launch?
   - Can we defer some junction tables to v5.1?

4. **Risk Tolerance**
   - Is performance risk acceptable given business value?
   - Should we prototype with 20 tables first?

---

## Conclusion

This is an **enterprise-scale data architecture** that will position VITAL as the most sophisticated persona intelligence platform in healthcare B2B.

**Recommendation**: Proceed with phased implementation, starting with Phase 1-2 (core + existing tables), then validate before adding extensions.

**Critical Success Factor**: Coordination between Data Strategist and all specialized data agents (Transformer, Schema Mapper, Seed Generator, Researcher).

---

**Document Status**: DRAFT - Awaiting Approval
**Next Update**: After Platform Orchestrator Review
**Owner**: Data Strategist + VITAL Engineering Team

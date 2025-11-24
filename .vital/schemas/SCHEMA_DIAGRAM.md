# Pharmaceutical Role Enrichment - Schema Diagram

## Entity Relationship Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          CORE ORGANIZATIONAL STRUCTURE                       │
└─────────────────────────────────────────────────────────────────────────────┘

                              org_functions
                                    │
                                    │ function_id
                                    ▼
                              org_departments
                                    │
                                    │ department_id
                                    ▼
┌────────────────────────────────────────────────────────────────────────────┐
│                              org_roles                                      │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  EXISTING COLUMNS                                                     │ │
│  │  • id, unique_id, role_name, role_title, description                 │ │
│  │  • seniority_level, reports_to_role_id                               │ │
│  │  • function_area, department_name                                    │ │
│  │  • required_skills [DEPRECATED] → role_skills                        │ │
│  │  • required_certifications [DEPRECATED] → role_certifications        │ │
│  │  • years_experience_min, years_experience_max                        │ │
│  │  • function_id, department_id, tenant_id                             │ │
│  │  • is_active, migration_ready                                        │ │
│  │  • created_at, updated_at, created_by, updated_by                    │ │
│  │  • search_vector                                                     │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
│  ┌──────────────────────────────────────────────────────────────────────┐ │
│  │  NEW COLUMNS (Pharma-Specific)                                       │ │
│  │  • role_type (Clinical, Research, Regulatory, Commercial, etc.)     │ │
│  │  • regulatory_oversight, gxp_critical                                │ │
│  │  • patient_facing, safety_critical                                   │ │
│  │  • travel_requirement_pct, remote_eligible, oncall_required         │ │
│  │  • salary_band_min, salary_band_max, salary_currency                │ │
│  │  • job_family, career_level, succession_planning_priority           │ │
│  │  • metadata (JSONB)                                                  │ │
│  └──────────────────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    │ (connects to...)
                                    ▼

┌─────────────────────────────────────────────────────────────────────────────┐
│                     EXISTING JUNCTION TABLES (Maintained)                    │
├─────────────────────────────────────────────────────────────────────────────┤
│  • org_role_responsibilities ──→ org_responsibilities                       │
│  • org_department_roles ──→ org_departments                                 │
│  • org_function_roles ──→ org_functions                                     │
│  • role_goals ──→ goals                                                     │
│  • role_challenges ──→ challenges                                           │
│  • role_motivations ──→ motivations                                         │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                        NEW REFERENCE TABLES (11 Total)                       │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   skills         │     │  certifications  │     │  competencies    │
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ • name           │     │ • name           │     │ • name           │
│ • description    │     │ • abbreviation   │     │ • description    │
│ • category       │     │ • issuing_org    │     │ • competency_type│
│ • skill_type     │     │ • cert_type      │     │ • category       │
│ • proficiency_   │     │ • is_regulatory_ │     │ • behavioral_    │
│   levels[]       │     │   required       │     │   indicators[]   │
│ • is_pharma_     │     │ • requires_      │     │ • proficiency_   │
│   specific       │     │   renewal        │     │   levels (JSON)  │
│ • is_cert_       │     │ • renewal_period │     │ • is_pharma_     │
│   required       │     │ • prerequisites[]│     │   specific       │
│ • tenant_id      │     │ • geographic_    │     │ • tenant_id      │
│ • created_at     │     │   scope          │     │ • created_at     │
│ • updated_at     │     │ • tenant_id      │     │ • updated_at     │
│ • search_vector  │     │ • created_at     │     │ • search_vector  │
└──────────────────┘     │ • updated_at     │     └──────────────────┘
                         │ • search_vector  │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│      kpis        │     │ training_programs│     │ regulatory_      │
├──────────────────┤     ├──────────────────┤     │ requirements     │
│ • name           │     │ • name           │     ├──────────────────┤
│ • description    │     │ • description    │     │ • name           │
│ • category       │     │ • program_type   │     │ • description    │
│ • measurement_   │     │ • duration_hours │     │ • requirement_   │
│   type           │     │ • delivery_      │     │   type           │
│ • unit_of_       │     │   method         │     │ • regulatory_    │
│   measure        │     │ • is_mandatory   │     │   body           │
│ • target_value   │     │ • is_gxp_        │     │ • regulation_    │
│ • target_        │     │   training       │     │   reference      │
│   operator       │     │ • recert_        │     │ • jurisdiction   │
│ • calculation_   │     │   required       │     │ • frequency      │
│   method         │     │ • recert_period  │     │ • documentation_ │
│ • measurement_   │     │ • prerequisites[]│     │   required[]     │
│   frequency      │     │ • learning_      │     │ • consequences_  │
│ • is_regulatory  │     │   objectives[]   │     │   of_non_        │
│ • tenant_id      │     │ • provider       │     │   compliance     │
│ • created_at     │     │ • cost_per_      │     │ • tenant_id      │
│ • updated_at     │     │   participant    │     │ • created_at     │
│ • search_vector  │     │ • tenant_id      │     │ • updated_at     │
└──────────────────┘     │ • created_at     │     │ • search_vector  │
                         │ • updated_at     │     └──────────────────┘
                         │ • search_vector  │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│    systems       │     │  deliverables    │     │ therapeutic_areas│
├──────────────────┤     ├──────────────────┤     ├──────────────────┤
│ • name           │     │ • name           │     │ • name           │
│ • description    │     │ • description    │     │ • description    │
│ • system_type    │     │ • deliverable_   │     │ • parent_area_id │
│ • vendor         │     │   type           │     │   (self-ref)     │
│ • is_validated_  │     │ • category       │     │ • icd_codes[]    │
│   system         │     │ • typical_       │     │ • key_           │
│ • is_gxp_system  │     │   frequency      │     │   indications[]  │
│ • requires_      │     │ • is_regulatory_ │     │ • key_drugs[]    │
│   training       │     │   submission     │     │ • regulatory_    │
│ • typical_users[]│     │ • is_controlled_ │     │   considerations │
│ • integration_   │     │   document       │     │ • tenant_id      │
│   points[]       │     │ • template_      │     │ • created_at     │
│ • tenant_id      │     │   available      │     │ • updated_at     │
│ • created_at     │     │ • approval_      │     │ • search_vector  │
│ • updated_at     │     │   required       │     └──────────────────┘
│ • search_vector  │     │ • typical_       │
└──────────────────┘     │   reviewers[]    │
                         │ • tenant_id      │
                         │ • created_at     │
                         │ • updated_at     │
                         │ • search_vector  │
                         └──────────────────┘

┌──────────────────┐     ┌──────────────────┐
│ stakeholder_types│     │  career_paths    │
├──────────────────┤     ├──────────────────┤
│ • name           │     │ • name           │
│ • description    │     │ • description    │
│ • stakeholder_   │     │ • path_type      │
│   category       │     │ • typical_       │
│ • interaction_   │     │   duration_years │
│   frequency      │     │ • tenant_id      │
│ • typical_       │     │ • created_at     │
│   interaction_   │     │ • updated_at     │
│   purpose        │     └──────────────────┘
│ • tenant_id      │
│ • created_at     │
│ • updated_at     │
│ • search_vector  │
└──────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                      NEW JUNCTION TABLES (11 Total)                          │
│                         Connecting org_roles to...                           │
└─────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_skills                                                                │
│  ├── role_id → org_roles                                                    │
│  ├── skill_id → skills                                                      │
│  ├── required_proficiency (Basic|Intermediate|Advanced|Expert)             │
│  ├── is_required (vs. preferred)                                           │
│  ├── importance_rank                                                        │
│  ├── can_train_on_job                                                      │
│  └── typical_time_to_proficiency_months                                    │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_certifications                                                        │
│  ├── role_id → org_roles                                                    │
│  ├── certification_id → certifications                                      │
│  ├── is_required (vs. preferred)                                           │
│  ├── must_have_before_hire                                                 │
│  ├── can_obtain_after_hire_months                                          │
│  └── priority (0-100)                                                       │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_competencies                                                          │
│  ├── role_id → org_roles                                                    │
│  ├── competency_id → competencies                                           │
│  ├── required_level                                                         │
│  ├── weight (0.0-1.0)                                                       │
│  └── is_core (core vs. supporting)                                         │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_kpis                                                                  │
│  ├── role_id → org_roles                                                    │
│  ├── kpi_id → kpis                                                          │
│  ├── target_value                                                           │
│  ├── weight (0.0-1.0)                                                       │
│  ├── is_primary                                                             │
│  └── measurement_frequency                                                  │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_training_programs                                                     │
│  ├── role_id → org_roles                                                    │
│  ├── training_program_id → training_programs                                │
│  ├── is_required                                                            │
│  ├── timing (Pre-hire|Onboarding|First 30/90 Days|Ongoing|Annual)         │
│  └── priority (0-100)                                                       │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_regulatory_requirements                                               │
│  ├── role_id → org_roles                                                    │
│  ├── regulatory_requirement_id → regulatory_requirements                    │
│  ├── compliance_criticality (Low|Medium|High|Critical)                     │
│  ├── audit_frequency                                                        │
│  └── responsible_for_compliance                                            │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_systems                                                               │
│  ├── role_id → org_roles                                                    │
│  ├── system_id → systems                                                    │
│  ├── access_level (View|Edit|Admin|Power User)                            │
│  ├── usage_frequency (Daily|Weekly|Monthly|Occasionally|Rarely)           │
│  ├── is_primary_system                                                     │
│  └── training_required_hours                                               │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_deliverables                                                          │
│  ├── role_id → org_roles                                                    │
│  ├── deliverable_id → deliverables                                          │
│  ├── is_primary_owner (vs. contributor)                                    │
│  ├── typical_frequency                                                      │
│  └── estimated_hours_per_occurrence                                        │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_therapeutic_areas                                                     │
│  ├── role_id → org_roles                                                    │
│  ├── therapeutic_area_id → therapeutic_areas                                │
│  ├── expertise_level (Awareness|Working Knowledge|Proficient|Expert)      │
│  └── is_primary_focus                                                       │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_stakeholder_interactions                                              │
│  ├── role_id → org_roles                                                    │
│  ├── stakeholder_type_id → stakeholder_types                                │
│  ├── interaction_frequency (Daily|Weekly|Monthly|Quarterly|Ad-hoc|Rarely) │
│  ├── interaction_type (Meetings|Email|Phone|Presentations)                │
│  └── influence_level (Informational|Collaborative|Decision-Making|...)    │
└────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────┐
│  role_career_paths                                                          │
│  ├── from_role_id → org_roles                                               │
│  ├── to_role_id → org_roles                                                 │
│  ├── career_path_id → career_paths                                          │
│  ├── typical_years_in_role                                                  │
│  └── transition_probability (0.0-1.0)                                       │
└────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                              SCHEMA STATISTICS                               │
├─────────────────────────────────────────────────────────────────────────────┤
│  Reference Tables:         11 new                                           │
│  Junction Tables:          11 new                                           │
│  New Columns (org_roles):  15                                               │
│  Deprecated Columns:       2 (required_skills, required_certifications)    │
│  Total Indexes:            37 (across all new tables)                       │
│  Full-Text Search:         11 tables with search_vector                     │
│  Tenant-Scoped:            All tables include tenant_id                     │
│  GXP-Specific:             6 tables with GXP-related fields                 │
│  Regulatory-Specific:      3 tables focused on compliance                   │
└─────────────────────────────────────────────────────────────────────────────┘


┌─────────────────────────────────────────────────────────────────────────────┐
│                           MIGRATION DEPENDENCIES                             │
└─────────────────────────────────────────────────────────────────────────────┘

Migration 1: Reference Tables
  └─> Creates: skills, certifications, competencies, kpis, training_programs,
               regulatory_requirements, systems, deliverables,
               therapeutic_areas, stakeholder_types, career_paths

Migration 2: Junction Tables (depends on Migration 1)
  └─> Creates: role_skills, role_certifications, role_competencies,
               role_kpis, role_training_programs,
               role_regulatory_requirements, role_systems,
               role_deliverables, role_therapeutic_areas,
               role_stakeholder_interactions, role_career_paths

Migration 3: Extend org_roles (can run parallel to 1 & 2)
  └─> Adds 15 new columns to org_roles

Migration 4: Data Migration (depends on 1, 2, 3)
  └─> Migrates data from required_skills[] and required_certifications[]
      to junction tables

Migration 5: Seed Data (depends on 1, 2)
  └─> Loads pharma-specific reference data


┌─────────────────────────────────────────────────────────────────────────────┐
│                            QUERY PATTERN EXAMPLES                            │
└─────────────────────────────────────────────────────────────────────────────┘

1. GET COMPLETE ROLE PROFILE
   org_roles → JOIN all junction tables → Aggregate related data

2. FIND ROLES BY SKILL
   skills → role_skills → org_roles
   WHERE skill.name = 'X' AND role_skills.is_required = true

3. REGULATORY BURDEN ANALYSIS
   org_roles → role_regulatory_requirements → COUNT
   WHERE role.gxp_critical = true

4. CAREER PATH TRAVERSAL
   Recursive CTE on role_career_paths
   Starting from role X, find all possible next roles

5. SKILLS GAP ANALYSIS
   Compare role_skills.required_proficiency with actual user proficiency

6. TRAINING REQUIREMENTS
   role_training_programs → training_programs
   WHERE timing = 'Onboarding' AND is_required = true


┌─────────────────────────────────────────────────────────────────────────────┐
│                          PERFORMANCE OPTIMIZATION                            │
└─────────────────────────────────────────────────────────────────────────────┘

INDEXES:
  • All foreign keys in junction tables (idx_{table}_role, idx_{table}_{entity})
  • Category/type columns (idx_{table}_category, idx_{table}_type)
  • Boolean flags (idx_{table}_required, idx_{table}_primary)
  • Full-text search (idx_{table}_search using GIN)

MATERIALIZED VIEWS (Future):
  • mv_role_profiles (complete role profile with all related data)
  • mv_skills_matrix (role × skill matrix)
  • mv_career_ladders (career progression paths)

CACHING STRATEGY:
  • Cache frequently accessed role profiles (Redis)
  • Invalidate on role or junction table updates
  • Pre-compute aggregations for dashboards


┌─────────────────────────────────────────────────────────────────────────────┐
│                            ROLLBACK STRATEGY                                 │
└─────────────────────────────────────────────────────────────────────────────┘

Each migration has a corresponding .rollback.sql file:

Migration 4 Rollback (Data Migration):
  1. Restore required_skills and required_certifications columns
  2. Copy data back from junction tables to arrays
  3. Verify data integrity
  4. Drop junction table data (optional)

Migration 3 Rollback (Extend org_roles):
  1. Drop 15 new columns from org_roles

Migration 2 Rollback (Junction Tables):
  1. Drop all 11 junction tables in reverse dependency order

Migration 1 Rollback (Reference Tables):
  1. Drop all 11 reference tables

Safety: Keep deprecated columns for 6 months before final removal

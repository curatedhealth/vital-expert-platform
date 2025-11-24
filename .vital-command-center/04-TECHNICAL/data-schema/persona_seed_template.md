# Persona Seed Template with 4 MECE Archetypes

## Overview

This template provides the complete structure for generating **4 MECE (Mutually Exclusive, Collectively Exhaustive) personas per role** based on the Universal Archetype Framework.

## MECE Persona Framework

**Each role MUST have exactly 4 personas based on the 2x2 matrix:**

```
                    Low Work Complexity      High Work Complexity
High AI Maturity         AUTOMATOR              ORCHESTRATOR
Low AI Maturity           LEARNER                 SKEPTIC
```

###Archetype Definitions

1. **AUTOMATOR** (High AI + Low Complexity)
   - **Profile:** Tech-savvy professionals handling routine tasks
   - **AI Use:** Embraces automation for efficiency
   - **Work:** Repetitive, standardized processes
   - **Value:** Speed, efficiency, cost reduction
   - **Service Layer:** Ask Me (self-service AI)

2. **ORCHESTRATOR** (High AI + High Complexity)
   - **Profile:** Strategic leaders managing complex workflows
   - **AI Use:** Leverages AI as cognitive co-pilot
   - **Work:** Multi-stakeholder, strategic decisions
   - **Value:** Intelligence, insights, orchestration
   - **Service Layer:** Ask Panel (multi-agent collaboration)

3. **LEARNER** (Low AI + Low Complexity)
   - **Profile:** Early-career professionals building skills
   - **AI Use:** Hesitant but willing to learn with support
   - **Work:** Structured, guided tasks
   - **Value:** Learning, development, confidence
   - **Service Layer:** Ask Expert (guided AI assistance)

4. **SKEPTIC** (Low AI + High Complexity)
   - **Profile:** Experienced experts preferring manual control
   - **AI Use:** Resistant, values human judgment
   - **Work:** High-stakes, nuanced decisions
   - **Value:** Expertise, judgment, quality
   - **Service Layer:** Ask Expert (targeted augmentation)

## Database Schema

### personas Table (Core Attributes)

```sql
CREATE TABLE IF NOT EXISTS public.personas (
  id UUID PRIMARY KEY,
  
  -- Linkage (inherits ALL from role)
  role_id UUID REFERENCES org_roles(id),
  function_id UUID,  -- Denormalized for filtering
  department_id UUID,  -- Denormalized for filtering
  
  -- Identity
  name TEXT NOT NULL,
  slug TEXT UNIQUE,
  title TEXT,
  tagline TEXT,
  description TEXT,
  
  -- Archetype (MANDATORY)
  archetype TEXT CHECK (archetype IN ('AUTOMATOR', 'ORCHESTRATOR', 'LEARNER', 'SKEPTIC')),
  persona_type TEXT,
  segment TEXT,
  journey_stage TEXT,
  
  -- Differentiating attributes
  ai_maturity_score NUMERIC(3,0) CHECK (ai_maturity_score BETWEEN 0 AND 100),
  work_complexity_score NUMERIC(3,0) CHECK (work_complexity_score BETWEEN 0 AND 100),
  seniority_level TEXT,  -- Can override role baseline
  years_of_experience INTEGER,
  years_in_current_role INTEGER,
  years_in_industry INTEGER,
  years_in_function INTEGER,
  geographic_scope TEXT,
  
  -- Behavioral attributes
  work_pattern TEXT,
  work_style TEXT,
  decision_making_style TEXT,
  risk_tolerance TEXT,
  change_readiness TEXT,
  technology_adoption TEXT,
  collaboration_style TEXT,
  
  -- AI readiness
  gen_ai_readiness_level TEXT,
  ai_confidence_level TEXT,
  
  -- Context
  typical_day_summary TEXT,  -- DILO summary
  typical_week_summary TEXT,  -- WILO summary
  typical_month_summary TEXT,  -- MILO summary
  typical_year_summary TEXT,  -- YILO summary
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  deleted_at TIMESTAMPTZ
);
```

### Persona Junction Tables (Overrides & Deltas)

All persona junction tables include override pattern:
- `is_additional` - Added by persona (not in role baseline)
- `overrides_role` - Replaces role baseline value

```sql
-- Persona-specific goals (additional to role JTBDs)
CREATE TABLE persona_goals (
  id UUID,
  persona_id UUID REFERENCES personas(id),
  goal_text TEXT,
  priority TEXT,
  is_additional BOOLEAN DEFAULT true
);

-- Persona-specific pain points
CREATE TABLE persona_pain_points (
  id UUID,
  persona_id UUID REFERENCES personas(id),
  issue TEXT,
  severity TEXT,
  frequency TEXT
);

-- Persona tool overrides (satisfaction, proficiency)
CREATE TABLE persona_tools (
  id UUID,
  persona_id UUID REFERENCES personas(id),
  tool_id UUID REFERENCES tools(id),
  proficiency_level TEXT,
  satisfaction_level TEXT,
  is_additional BOOLEAN DEFAULT false,
  overrides_role BOOLEAN DEFAULT false
);

-- Persona stakeholder overrides (collaboration quality)
CREATE TABLE persona_stakeholders (
  id UUID,
  persona_id UUID REFERENCES personas(id),
  stakeholder_id UUID REFERENCES stakeholders(id),
  collaboration_quality TEXT,
  trust_level TEXT,
  is_additional BOOLEAN DEFAULT false,
  overrides_role BOOLEAN DEFAULT false
);
```

## Complete Example: Medical Science Liaison (MSL) - 4 MECE Personas

### Context
- **Role:** Medical Science Liaison
- **Role ID:** `{msl_role_id}`
- **Function:** Medical Affairs
- **Department:** Field Medical

### Persona 1: AUTOMATOR - "The Efficient Executor"

```sql
INSERT INTO personas (
  role_id,
  function_id,
  department_id,
  name,
  slug,
  title,
  tagline,
  description,
  archetype,
  persona_type,
  ai_maturity_score,
  work_complexity_score,
  seniority_level,
  years_of_experience,
  years_in_current_role,
  geographic_scope,
  work_pattern,
  work_style,
  decision_making_style,
  risk_tolerance,
  change_readiness,
  technology_adoption,
  collaboration_style,
  gen_ai_readiness_level,
  ai_confidence_level,
  typical_day_summary
) VALUES (
  '{msl_role_id}',
  '{medical_affairs_function_id}',
  '{field_medical_dept_id}',
  'Dr. Alex Chen - Efficient MSL',
  'dr-alex-chen-msl-automator',
  'MSL - Tech-Forward Territory Manager',
  'Leverages AI to maximize HCP reach and administrative efficiency',
  'Mid-level MSL managing a local territory with standard accounts. Embraces digital tools and AI to automate routine follow-ups, report generation, and literature searches. Focuses on expanding reach and reducing admin time.',
  'AUTOMATOR',
  'early_adopter',
  80,  -- High AI maturity
  30,  -- Low work complexity (routine territory)
  'mid',
  6,
  2,
  'local',
  'structured_efficient',
  'systematic_data_driven',
  'analytical',
  'moderate',
  'high',
  'early_adopter',
  'collaborative_digital',
  'high',
  'high',
  'Starts day with AI-generated territory insights. Uses CRM automation for follow-ups. Leverages AI for rapid literature synthesis before meetings. Virtual HCP engagement via webinar platforms. Auto-generated call reports. Minimal manual admin tasks.'
);

-- Persona 1 Goals (additional to role baseline)
INSERT INTO persona_goals (persona_id, goal_text, priority, is_additional) VALUES
  ('{alex_chen_persona_id}', 'Maximize HCP interactions per week through automation', 'high', true),
  ('{alex_chen_persona_id}', 'Reduce administrative time by 50% using AI tools', 'high', true),
  ('{alex_chen_persona_id}', 'Scale virtual engagement to 2x traditional capacity', 'medium', true);

-- Persona 1 Pain Points
INSERT INTO persona_pain_points (persona_id, issue, severity, frequency) VALUES
  ('{alex_chen_persona_id}', 'AI tools not always integrated with core CRM system', 'medium', 'weekly'),
  ('{alex_chen_persona_id}', 'Need to manually verify AI-generated content for compliance', 'medium', 'daily'),
  ('{alex_chen_persona_id}', 'Some senior HCPs prefer human-written communications', 'low', 'monthly');
```

### Persona 2: ORCHESTRATOR - "The Strategic Connector"

```sql
INSERT INTO personas (
  role_id,
  function_id,
  department_id,
  name,
  slug,
  title,
  tagline,
  description,
  archetype,
  persona_type,
  ai_maturity_score,
  work_complexity_score,
  seniority_level,
  years_of_experience,
  years_in_current_role,
  geographic_scope,
  work_pattern,
  work_style,
  decision_making_style,
  risk_tolerance,
  change_readiness,
  technology_adoption,
  collaboration_style,
  gen_ai_readiness_level,
  ai_confidence_level,
  typical_day_summary
) VALUES (
  '{msl_role_id}',
  '{medical_affairs_function_id}',
  '{field_medical_dept_id}',
  'Dr. Sarah Martinez - Strategic MSL',
  'dr-sarah-martinez-msl-orchestrator',
  'Senior MSL - National KOL Coordinator',
  'Orchestrates complex multi-stakeholder engagements with AI-powered insights',
  'Senior MSL managing national-level KOL relationships and multi-site clinical trial support. Uses AI for strategic insights, pattern recognition across interactions, and multi-agent coordination. Handles complex scientific discussions and cross-functional collaboration.',
  'ORCHESTRATOR',
  'strategic_leader',
  85,  -- High AI maturity
  85,  -- High work complexity
  'senior',
  12,
  4,
  'regional',
  'dynamic_strategic',
  'integrative_adaptive',
  'consultative',
  'calculated',
  'very_high',
  'innovator',
  'strategic_networker',
  'very_high',
  'very_high',
  'Morning: AI-synthesized cross-territory insights and KOL sentiment analysis. Strategic planning with Medical Director using predictive models. Complex multi-stakeholder meetings with AI note-taking and action item extraction. Evening: AI-assisted comprehensive reporting and insight synthesis.'
);

-- Persona 2 Goals
INSERT INTO persona_goals (persona_id, goal_text, priority, is_additional) VALUES
  ('{sarah_martinez_persona_id}', 'Leverage AI to identify emerging scientific trends across national KOL network', 'critical', true),
  ('{sarah_martinez_persona_id}', 'Use multi-agent AI systems to coordinate complex cross-functional initiatives', 'high', true),
  ('{sarah_martinez_persona_id}', 'Generate strategic insights from aggregated field intelligence using AI', 'high', true);

-- Persona 2 Pain Points
INSERT INTO persona_pain_points (persona_id, issue, severity, frequency) VALUES
  ('{sarah_martinez_persona_id}', 'AI systems dont yet connect all internal data sources for comprehensive insights', 'high', 'weekly'),
  ('{sarah_martinez_persona_id}', 'Complex stakeholder dynamics require human judgment beyond AI capability', 'medium', 'weekly'),
  ('{sarah_martinez_persona_id}', 'Balancing AI efficiency with relationship-building time investment', 'medium', 'monthly');
```

### Persona 3: LEARNER - "The Developing Professional"

```sql
INSERT INTO personas (
  role_id,
  function_id,
  department_id,
  name,
  slug,
  title,
  tagline,
  description,
  archetype,
  persona_type,
  ai_maturity_score,
  work_complexity_score,
  seniority_level,
  years_of_experience,
  years_in_current_role,
  geographic_scope,
  work_pattern,
  work_style,
  decision_making_style,
  risk_tolerance,
  change_readiness,
  technology_adoption,
  collaboration_style,
  gen_ai_readiness_level,
  ai_confidence_level,
  typical_day_summary
) VALUES (
  '{msl_role_id}',
  '{medical_affairs_function_id}',
  '{field_medical_dept_id}',
  'Dr. Emily Patel - Junior MSL',
  'dr-emily-patel-msl-learner',
  'Associate MSL - In Training',
  'Building confidence with AI-guided support and structured learning',
  'Entry-level MSL in first MSL role, transitioning from clinical practice. Handles well-defined territory with established accounts. Hesitant about AI but willing to learn with guidance. Relies on templates, SOPs, and mentorship. Focuses on building foundational MSL skills.',
  'LEARNER',
  'early_career',
  35,  -- Low AI maturity
  25,  -- Low work complexity
  'entry',
  3,
  0.5,
  'local',
  'structured_learning',
  'methodical_cautious',
  'consultative',
  'low',
  'moderate',
  'pragmatist',
  'cooperative',
  'low',
  'moderate',
  'Morning: Review manager-provided daily priorities and AI-suggested call prep. Shadow senior MSL calls. Use template-based call planning. Afternoon: Standard HCP visits following established protocols. Evening: Manual call reporting with AI assistance for formatting only. Regular check-ins with manager.'
);

-- Persona 3 Goals
INSERT INTO persona_goals (persona_id, goal_text, priority, is_additional) VALUES
  ('{emily_patel_persona_id}', 'Build confidence in scientific discussions through AI-guided prep', 'critical', true),
  ('{emily_patel_persona_id}', 'Learn to use AI tools safely within compliance boundaries', 'high', true),
  ('{emily_patel_persona_id}', 'Gradually expand from templates to more independent AI-assisted work', 'medium', true);

-- Persona 3 Pain Points
INSERT INTO persona_pain_points (persona_id, issue, severity, frequency) VALUES
  ('{emily_patel_persona_id}', 'Unsure when AI output requires expert review before use', 'high', 'daily'),
  ('{emily_patel_persona_id}', 'Overwhelmed by too many AI tool options, prefers simple guided interface', 'medium', 'weekly'),
  ('{emily_patel_persona_id}', 'Lacks confidence to fully trust AI-generated scientific summaries', 'medium', 'daily');
```

### Persona 4: SKEPTIC - "The Expert Purist"

```sql
INSERT INTO personas (
  role_id,
  function_id,
  department_id,
  name,
  slug,
  title,
  tagline,
  description,
  archetype,
  persona_type,
  ai_maturity_score,
  work_complexity_score,
  seniority_level,
  years_of_experience,
  years_in_current_role,
  geographic_scope,
  work_pattern,
  work_style,
  decision_making_style,
  risk_tolerance,
  change_readiness,
  technology_adoption,
  collaboration_style,
  gen_ai_readiness_level,
  ai_confidence_level,
  typical_day_summary
) VALUES (
  '{msl_role_id}',
  '{medical_affairs_function_id}',
  '{field_medical_dept_id}',
  'Dr. Robert Thompson - Expert MSL',
  'dr-robert-thompson-msl-skeptic',
  'Principal MSL - Therapeutic Area Lead',
  'Relies on deep expertise and human judgment for complex scientific engagements',
  'Highly experienced MSL and therapeutic area expert managing top-tier KOLs and principal investigators. Handles complex, high-stakes scientific discussions. Skeptical of AI, values human expertise and nuanced judgment. Prefers manual processes for critical work. Mentors junior MSLs on scientific rigor.',
  'SKEPTIC',
  'expert_specialist',
  20,  -- Low AI maturity
  90,  -- High work complexity
  'executive',
  15,
  7,
  'multi_regional',
  'relationship_intensive',
  'expert_intuitive',
  'consultative_deliberate',
  'very_low',
  'low',
  'laggard',
  'relationship_first',
  'very_low',
  'low',
  'Morning: Manual review of latest clinical data and publications. In-depth preparation for high-stakes KOL meeting drawing on years of experience. Complex scientific discussion requiring real-time clinical judgment. Afternoon: Mentor junior MSLs. Manual, detailed call documentation. Strategic input to clinical development team.'
);

-- Persona 4 Goals
INSERT INTO persona_goals (persona_id, goal_text, priority, is_additional) VALUES
  ('{robert_thompson_persona_id}', 'Maintain scientific excellence and relationship quality without AI dependence', 'critical', true),
  ('{robert_thompson_persona_id}', 'Preserve human judgment in high-stakes scientific discussions', 'critical', true),
  ('{robert_thompson_persona_id}', 'Mentor next generation on scientific rigor beyond AI shortcuts', 'high', true);

-- Persona 4 Pain Points
INSERT INTO persona_pain_points (persona_id, issue, severity, frequency) VALUES
  ('{robert_thompson_persona_id}', 'Organization pushing AI adoption without understanding nuance limitations', 'high', 'monthly'),
  ('{robert_thompson_persona_id}', 'AI-generated content lacks depth and nuance for expert-level discussions', 'high', 'weekly'),
  ('{robert_thompson_persona_id}', 'Time spent reviewing and correcting AI output exceeds manual effort', 'medium', 'weekly'),
  ('{robert_thompson_persona_id}', 'Concern that over-reliance on AI will erode scientific expertise', 'high', 'daily');
```

## Differentiation Matrix

| Attribute | AUTOMATOR | ORCHESTRATOR | LEARNER | SKEPTIC |
|-----------|-----------|--------------|---------|---------|
| **AI Maturity** | 70-90 | 80-95 | 20-40 | 10-30 |
| **Work Complexity** | 20-40 | 70-95 | 20-40 | 70-95 |
| **Seniority** | Mid | Senior/Director | Entry/Mid | Senior/Executive |
| **Experience** | 5-8 years | 10-15 years | 2-5 years | 12+ years |
| **Tech Adoption** | Early Adopter | Innovator | Pragmatist | Laggard |
| **Risk Tolerance** | Moderate | Calculated | Low | Very Low |
| **Change Readiness** | High | Very High | Moderate | Low |
| **Primary Service Layer** | Ask Me | Ask Panel | Ask Expert | Ask Expert (Targeted) |

## Verification Queries

```sql
-- Check MECE compliance: Each role should have exactly 4 personas, one per archetype
SELECT 
  r.name as role_name,
  COUNT(p.id) as total_personas,
  COUNT(CASE WHEN p.archetype = 'AUTOMATOR' THEN 1 END) as automator_count,
  COUNT(CASE WHEN p.archetype = 'ORCHESTRATOR' THEN 1 END) as orchestrator_count,
  COUNT(CASE WHEN p.archetype = 'LEARNER' THEN 1 END) as learner_count,
  COUNT(CASE WHEN p.archetype = 'SKEPTIC' THEN 1 END) as skeptic_count,
  CASE 
    WHEN COUNT(p.id) = 4 AND 
         COUNT(DISTINCT p.archetype) = 4 THEN '✓ MECE'
    ELSE '✗ Incomplete'
  END as mece_status
FROM org_roles r
LEFT JOIN personas p ON r.id = p.role_id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name
ORDER BY r.name;

-- Check score distribution
SELECT 
  archetype,
  COUNT(*) as persona_count,
  ROUND(AVG(ai_maturity_score), 1) as avg_ai_maturity,
  ROUND(AVG(work_complexity_score), 1) as avg_work_complexity,
  MIN(ai_maturity_score) as min_ai,
  MAX(ai_maturity_score) as max_ai,
  MIN(work_complexity_score) as min_complexity,
  MAX(work_complexity_score) as max_complexity
FROM personas
WHERE deleted_at IS NULL
GROUP BY archetype
ORDER BY archetype;

-- Find roles missing personas or incomplete MECE coverage
SELECT 
  r.name as role_name,
  f.name as function_name,
  d.name as department_name,
  COUNT(p.id) as persona_count,
  STRING_AGG(DISTINCT p.archetype, ', ') as existing_archetypes
FROM org_roles r
JOIN org_functions f ON r.function_id = f.id
JOIN org_departments d ON r.department_id = d.id
LEFT JOIN personas p ON r.id = p.role_id AND p.deleted_at IS NULL
WHERE r.deleted_at IS NULL
GROUP BY r.id, r.name, f.name, d.name
HAVING COUNT(p.id) != 4 OR COUNT(DISTINCT p.archetype) != 4
ORDER BY function_name, department_name, role_name;
```

## Best Practices

1. **Always Create 4 Personas:** MECE framework requires all 4 archetypes per role
2. **Clear Differentiation:** Ensure AI maturity and work complexity scores create distinct quadrants
3. **Realistic Scores:** Base scores on research, not arbitrary assignment
4. **Coherent Narratives:** Each persona should tell a believable story
5. **Override Pattern:** Use persona junctions only for deltas, inherit from role baseline
6. **Service Layer Alignment:** Map archetypes to appropriate AI service layers
7. **Evidence-Based:** Link differentiating attributes to research sources
8. **Verify MECE:** Run verification queries to ensure complete coverage

## Archetype → Service Layer Mapping

| Archetype | Primary Service Layer | AI Usage Pattern |
|-----------|----------------------|------------------|
| **AUTOMATOR** | Ask Me | Self-service automation, workflow efficiency |
| **ORCHESTRATOR** | Ask Panel | Multi-agent collaboration, strategic synthesis |
| **LEARNER** | Ask Expert | Guided assistance, educational scaffolding |
| **SKEPTIC** | Ask Expert (Targeted) | Targeted augmentation, human-in-loop validation |

## Next Steps

After creating personas:
1. Verify MECE coverage with verification queries
2. Enrich personas with DILO/WILO/MILO/YILO time structures
3. Link personas to evidence sources for all behavioral attributes
4. Create persona-specific goals and pain points
5. Map personas to AI opportunities and use cases
6. Generate persona-specific workflows and recommendations

## Common Mistakes to Avoid

❌ **Don't:** Create 5+ personas per role (breaks MECE)
❌ **Don't:** Duplicate role baseline data in persona records
❌ **Don't:** Use arbitrary scores without research backing
❌ **Don't:** Make all personas high AI maturity (need distribution)
❌ **Don't:** Ignore archetype definitions (maintain consistency)
❌ **Don't:** Skip verification queries (always validate MECE)

✅ **Do:** Create exactly 4 personas per role
✅ **Do:** Use override pattern for persona deltas
✅ **Do:** Base scores on real-world research
✅ **Do:** Maintain clear archetype differentiation
✅ **Do:** Map to appropriate service layers
✅ **Do:** Verify MECE compliance systematically


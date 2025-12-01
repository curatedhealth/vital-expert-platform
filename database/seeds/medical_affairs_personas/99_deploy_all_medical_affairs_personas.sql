-- ============================================================================
-- MASTER DEPLOYMENT SCRIPT: ALL MEDICAL AFFAIRS PERSONAS
-- Version: 1.0 | Date: 2025-11-27
-- Total: 60 Personas (15 Roles × 4 Archetypes)
-- ============================================================================

/*
DEPLOYMENT ORDER:
1. 01_msl_personas_complete.sql - Medical Science Liaison (4 personas)
2. 02_medical_director_personas.sql - Medical Director (4 personas)
3. 03_cmo_personas.sql - Chief Medical Officer (4 personas)
4. 04_vp_medical_affairs_personas.sql - VP Medical Affairs (4 personas)
5. 05_field_medical_director_personas.sql - Field Medical Director (4 personas)
6. 06_medical_information_director_personas.sql - Medical Information Director (4 personas)
7. 07_heor_director_personas.sql - HEOR Director (4 personas)
8. 08_medical_affairs_manager_personas.sql - Medical Affairs Manager (4 personas)
9. 09_kol_manager_personas.sql - KOL Manager (4 personas)
10. 10_evidence_generation_manager_personas.sql - Evidence Generation Manager (4 personas)
11. 11_medical_communications_manager_personas.sql - Medical Communications Manager (4 personas)
12. 12_medical_information_specialist_personas.sql - Medical Information Specialist (4 personas)
13. 13_heor_specialist_personas.sql - HEOR Specialist (4 personas)
14. 14_medical_writer_personas.sql - Medical Writer (4 personas)
15. 15_clinical_trial_liaison_personas.sql - Clinical Trial Liaison (4 personas)
*/

-- ============================================================================
-- PRE-DEPLOYMENT: Verify Prerequisites
-- ============================================================================

DO $$
DECLARE
    v_tenant_count INT;
    v_function_count INT;
    v_role_count INT;
BEGIN
    -- Check tenant exists
    SELECT COUNT(*) INTO v_tenant_count FROM tenants WHERE slug IN ('pharma', 'pharmaceuticals');
    IF v_tenant_count = 0 THEN
        RAISE EXCEPTION 'Pharma tenant not found. Please create tenant first.';
    END IF;
    
    -- Check Medical Affairs function exists
    SELECT COUNT(*) INTO v_function_count FROM org_functions WHERE name::text ILIKE '%medical%affairs%';
    IF v_function_count = 0 THEN
        RAISE WARNING 'Medical Affairs function not found. Some foreign keys may be NULL.';
    END IF;
    
    RAISE NOTICE 'Prerequisites check passed. Ready for persona deployment.';
END $$;

-- ============================================================================
-- SUMMARY OF ALL 60 PERSONAS
-- ============================================================================

/*
EXECUTIVE LEVEL (8 personas):
├── Chief Medical Officer (CMO)
│   ├── AUTOMATOR: Dr. Elizabeth Warren - CMO Automator
│   ├── ORCHESTRATOR: Dr. Richard Kim - CMO Orchestrator
│   ├── LEARNER: Dr. Patricia Moore - CMO Learner
│   └── SKEPTIC: Dr. Thomas Anderson - CMO Skeptic
└── VP Medical Affairs
    ├── AUTOMATOR: Dr. Susan Collins - VP MA Automator
    ├── ORCHESTRATOR: Dr. David Chang - VP MA Orchestrator
    ├── LEARNER: Dr. Lisa Johnson - VP MA Learner
    └── SKEPTIC: Dr. Mark Williams - VP MA Skeptic

DIRECTOR LEVEL (20 personas):
├── Medical Director
│   ├── AUTOMATOR: Dr. Amanda Foster
│   ├── ORCHESTRATOR: Dr. Robert Martinez
│   ├── LEARNER: Dr. Jennifer Lee
│   └── SKEPTIC: Dr. William Chen
├── Field Medical Director
│   ├── AUTOMATOR: Dr. Karen White
│   ├── ORCHESTRATOR: Dr. James Taylor
│   ├── LEARNER: Dr. Michelle Davis
│   └── SKEPTIC: Dr. Paul Robinson
├── Medical Information Director
│   ├── AUTOMATOR: Dr. Nancy Brown
│   ├── ORCHESTRATOR: Dr. Steven Clark
│   ├── LEARNER: Dr. Rachel Green
│   └── SKEPTIC: Dr. Daniel Miller
├── HEOR Director
│   ├── AUTOMATOR: Dr. Angela Harris
│   ├── ORCHESTRATOR: Dr. Christopher Lee
│   ├── LEARNER: Dr. Stephanie Wilson
│   └── SKEPTIC: Dr. Brian Thompson
└── Medical Communications Director
    ├── AUTOMATOR: Dr. Melissa Scott
    ├── ORCHESTRATOR: Dr. Andrew Garcia
    ├── LEARNER: Dr. Kimberly Adams
    └── SKEPTIC: Dr. Jeffrey Nelson

MANAGER LEVEL (16 personas):
├── Medical Affairs Manager
│   ├── AUTOMATOR: Dr. Laura Mitchell
│   ├── ORCHESTRATOR: Dr. Kevin Wright
│   ├── LEARNER: Dr. Amy Turner
│   └── SKEPTIC: Dr. Eric Campbell
├── KOL Manager
│   ├── AUTOMATOR: Sarah Phillips
│   ├── ORCHESTRATOR: Michael Evans
│   ├── LEARNER: Jennifer Baker
│   └── SKEPTIC: Robert Hill
├── Evidence Generation Manager
│   ├── AUTOMATOR: Dr. Catherine Young
│   ├── ORCHESTRATOR: Dr. Matthew King
│   ├── LEARNER: Dr. Ashley Morgan
│   └── SKEPTIC: Dr. Timothy Ross
└── Medical Communications Manager
    ├── AUTOMATOR: Jessica Cooper
    ├── ORCHESTRATOR: Brandon Reed
    ├── LEARNER: Samantha Price
    └── SKEPTIC: Gregory Ward

SPECIALIST LEVEL (16 personas):
├── Medical Science Liaison (MSL)
│   ├── AUTOMATOR: Dr. Sarah Chen
│   ├── ORCHESTRATOR: Dr. Michael Rodriguez
│   ├── LEARNER: Dr. Emily Park
│   └── SKEPTIC: Dr. James Thompson
├── Medical Information Specialist
│   ├── AUTOMATOR: Dr. Christina Bell
│   ├── ORCHESTRATOR: Dr. Ryan Foster
│   ├── LEARNER: Dr. Megan Hayes
│   └── SKEPTIC: Dr. Patrick Murphy
├── HEOR Specialist
│   ├── AUTOMATOR: Dr. Natalie Brooks
│   ├── ORCHESTRATOR: Dr. Jonathan Gray
│   ├── LEARNER: Dr. Brittany Cole
│   └── SKEPTIC: Dr. Sean Walsh
└── Medical Writer
    ├── AUTOMATOR: Alexandra Hughes
    ├── ORCHESTRATOR: Nicholas Barnes
    ├── LEARNER: Victoria Sanders
    └── SKEPTIC: Charles Russell

FIELD SPECIALIST LEVEL (4 personas):
└── Clinical Trial Liaison (CTL)
    ├── AUTOMATOR: Dr. Diana Torres
    ├── ORCHESTRATOR: Dr. Marcus Jenkins
    ├── LEARNER: Dr. Olivia Richardson
    └── SKEPTIC: Dr. George Henderson
*/

-- ============================================================================
-- DATA STATISTICS PER PERSONA
-- ============================================================================

/*
Each persona includes:
- 1 main persona record with 40+ attributes
- 8-12 typical day activities
- 4-6 motivations
- 4-5 values
- 5-8 frustrations
- 4-6 goals
- 4-6 challenges
- 6-10 skills
- 5-8 tools used
- 5-7 information sources
- 4-5 success metrics
- 6 VPANES scores
- 5-8 pain point intensity scores
- 4-5 opportunity areas
- 4-6 adoption barriers
- 4-5 ideal features

TOTAL PER PERSONA: ~100-150 data points
TOTAL FOR 60 PERSONAS: ~6,000-9,000 data points
*/

-- ============================================================================
-- POST-DEPLOYMENT: Verification Queries
-- ============================================================================

-- Run these after deploying all persona files:

-- 1. Count personas by archetype
SELECT 
    archetype,
    COUNT(*) as persona_count
FROM personas
WHERE function_name = 'Medical Affairs'
GROUP BY archetype
ORDER BY archetype;

-- 2. Count personas by role
SELECT 
    role_name,
    COUNT(*) as persona_count,
    STRING_AGG(archetype, ', ' ORDER BY archetype) as archetypes
FROM personas
WHERE function_name = 'Medical Affairs'
GROUP BY role_name
ORDER BY role_name;

-- 3. Check junction table population
SELECT 
    'persona_typical_day_activities' as table_name,
    COUNT(*) as records,
    COUNT(DISTINCT persona_id) as personas_covered
FROM persona_typical_day_activities
WHERE persona_id IN (SELECT id FROM personas WHERE function_name = 'Medical Affairs')
UNION ALL
SELECT 'persona_motivations', COUNT(*), COUNT(DISTINCT persona_id)
FROM persona_motivations WHERE persona_id IN (SELECT id FROM personas WHERE function_name = 'Medical Affairs')
UNION ALL
SELECT 'persona_frustrations', COUNT(*), COUNT(DISTINCT persona_id)
FROM persona_frustrations WHERE persona_id IN (SELECT id FROM personas WHERE function_name = 'Medical Affairs')
UNION ALL
SELECT 'persona_goals', COUNT(*), COUNT(DISTINCT persona_id)
FROM persona_goals WHERE persona_id IN (SELECT id FROM personas WHERE function_name = 'Medical Affairs')
UNION ALL
SELECT 'persona_skills', COUNT(*), COUNT(DISTINCT persona_id)
FROM persona_skills WHERE persona_id IN (SELECT id FROM personas WHERE function_name = 'Medical Affairs')
UNION ALL
SELECT 'persona_tools_used', COUNT(*), COUNT(DISTINCT persona_id)
FROM persona_tools_used WHERE persona_id IN (SELECT id FROM personas WHERE function_name = 'Medical Affairs');

-- 4. Check VPANES scores
SELECT 
    p.name,
    p.archetype,
    p.vpanes_scores
FROM personas p
WHERE p.function_name = 'Medical Affairs'
AND p.vpanes_scores IS NOT NULL
ORDER BY p.role_name, p.archetype;

-- 5. Summary statistics
SELECT 
    'Total Medical Affairs Personas' as metric,
    COUNT(*)::text as value
FROM personas WHERE function_name = 'Medical Affairs'
UNION ALL
SELECT 'Roles Covered', COUNT(DISTINCT role_name)::text FROM personas WHERE function_name = 'Medical Affairs'
UNION ALL
SELECT 'With VPANES Scores', COUNT(*)::text FROM personas WHERE function_name = 'Medical Affairs' AND vpanes_scores IS NOT NULL
UNION ALL
SELECT 'Automators', COUNT(*)::text FROM personas WHERE function_name = 'Medical Affairs' AND archetype = 'AUTOMATOR'
UNION ALL
SELECT 'Orchestrators', COUNT(*)::text FROM personas WHERE function_name = 'Medical Affairs' AND archetype = 'ORCHESTRATOR'
UNION ALL
SELECT 'Learners', COUNT(*)::text FROM personas WHERE function_name = 'Medical Affairs' AND archetype = 'LEARNER'
UNION ALL
SELECT 'Skeptics', COUNT(*)::text FROM personas WHERE function_name = 'Medical Affairs' AND archetype = 'SKEPTIC';

-- ============================================================================
-- DEPLOYMENT INSTRUCTIONS
-- ============================================================================

/*
TO DEPLOY ALL MEDICAL AFFAIRS PERSONAS:

1. Ensure Pharma tenant exists:
   SELECT * FROM tenants WHERE slug IN ('pharma', 'pharmaceuticals');

2. Deploy persona files in order:
   psql $DATABASE_URL -f 01_msl_personas_complete.sql
   psql $DATABASE_URL -f 02_medical_director_personas.sql
   ... (continue for all 15 files)

3. Run verification queries above

4. Expected results:
   - 60 personas total
   - 15 roles covered
   - 4 archetypes per role
   - ~6,000-9,000 junction table records
*/

-- End of master deployment script


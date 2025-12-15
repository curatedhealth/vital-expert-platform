-- ============================================================================
-- MEDICAL SCIENCE LIAISON (MSL) - 4 MECE PERSONAS
-- V2 - Based on migration 20251120000002_comprehensive_schema.sql
-- Schema: id, name, description, role_id, function_id, department_id
-- Version: 2.0 | Date: 2025-11-27
-- ============================================================================

-- IMPORTANT: Run this query first to verify schema:
-- SELECT column_name, data_type FROM information_schema.columns 
-- WHERE table_name = 'personas' AND table_schema = 'public' ORDER BY ordinal_position;

BEGIN;

-- ========================================================================
-- MSL PERSONA 1: AUTOMATOR
-- ========================================================================

INSERT INTO personas (name, description, created_at, updated_at)
VALUES (
    'Dr. Sarah Chen - MSL Automator',
    E'**Role:** Medical Science Liaison\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Driven Field Medical Expert\n\n**Profile:**\n- Seniority: Mid-level (6 years experience)\n- Education: PharmD, PhD\n- Geographic Scope: Regional\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 75/100 (High)\n- Work Complexity Score: 35/100 (Routine)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 7/10\n- Actions: 8/10\n- Needs: 5/10\n- Emotions: 6/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Maximize time on high-value KOL interactions\n- Eliminate repetitive administrative tasks\n- Stay current with scientific literature\n\n**Top Frustrations:**\n- 8+ hours weekly on manual CRM data entry\n- Repetitive literature searches\n- Manual slide deck creation\n- Limited time for strategic thinking\n\n**Goals:**\n- Automate call note generation (save 10+ hrs/week)\n- Streamline literature monitoring with AI\n- Eliminate manual data entry\n\n**Tools Used:**\n- Veeva CRM, PubMed, PowerPoint, ChatGPT/Claude',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- MSL PERSONA 2: ORCHESTRATOR
-- ========================================================================

INSERT INTO personas (name, description, created_at, updated_at)
VALUES (
    'Dr. Michael Rodriguez - MSL Orchestrator',
    E'**Role:** Senior Medical Science Liaison\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic KOL Ecosystem Architect\n\n**Profile:**\n- Seniority: Senior (12 years experience)\n- Education: MD, PhD\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 3\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 82/100 (High)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 7/10\n- Emotions: 7/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Drive competitive advantage through AI-powered insights\n- Establish thought leadership in AI-enabled Medical Affairs\n- Transform KOL engagement at scale\n- Mentor next generation of AI-savvy MSLs\n\n**Top Frustrations:**\n- Synthesizing insights from 100+ KOL interactions\n- Limited tools for multi-source intelligence synthesis\n- Slow organizational AI adoption\n\n**Goals:**\n- Build AI-powered KOL intelligence platform\n- Establish company as leader in AI-enabled medical engagement\n- Train team on advanced AI workflows\n\n**Tools Used:**\n- Veeva CRM, Power BI, Custom AI workflows, Multi-agent panels',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- MSL PERSONA 3: LEARNER
-- ========================================================================

INSERT INTO personas (name, description, created_at, updated_at)
VALUES (
    'Dr. Emily Park - MSL Learner',
    E'**Role:** Medical Science Liaison\n**Archetype:** LEARNER\n**Tagline:** Early-Career Field Medical Professional\n\n**Profile:**\n- Seniority: Entry-level (2 years experience)\n- Education: PharmD\n- Geographic Scope: Local/Territory\n- Organization Size: Mid-Size Pharma\n\n**AI Profile:**\n- AI Maturity Score: 32/100 (Low)\n- Work Complexity Score: 28/100 (Routine)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 6/10\n- Actions: 4/10\n- Needs: 3/10\n- Emotions: 5/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Build confidence in scientific communication\n- Learn MSL best practices and workflows\n- Avoid mistakes that could harm KOL relationships\n- Get promoted to senior MSL within 3 years\n\n**Top Frustrations:**\n- Uncertain about KOL engagement best practices\n- Overwhelmed by learning curve\n- Fear of providing incorrect scientific information\n- Difficulty finding relevant information quickly\n\n**Goals:**\n- Master MSL fundamentals and SOPs\n- Build confidence in KOL communication\n- Conduct first independent KOL meeting successfully\n\n**Ideal AI Features:**\n- Step-by-step guided workflows\n- AI tutor explaining concepts simply\n- Templates with examples',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

-- ========================================================================
-- MSL PERSONA 4: SKEPTIC
-- ========================================================================

INSERT INTO personas (name, description, created_at, updated_at)
VALUES (
    'Dr. James Thompson - MSL Skeptic',
    E'**Role:** Principal Medical Science Liaison\n**Archetype:** SKEPTIC\n**Tagline:** Compliance-Focused Medical Affairs Leader\n\n**Profile:**\n- Seniority: Senior (18 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 8\n- Team Size: 12\n\n**AI Profile:**\n- AI Maturity Score: 28/100 (Low)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Laggard\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Hybrid with human oversight)\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 5/10\n- Actions: 3/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Maintain highest standards of scientific accuracy\n- Protect company reputation through rigorous compliance\n- Preserve proven methods that ensure quality\n- Ensure AI does not replace human judgment\n\n**Top Frustrations:**\n- AI tools lacking transparency in reasoning\n- Pressure to adopt AI before proven reliable\n- Concerns about AI errors damaging KOL relationships\n- Vendor hype vs real-world AI capabilities\n\n**Goals:**\n- Ensure all AI content is medically accurate and cited\n- Maintain compliance in all KOL interactions\n- Validate AI recommendations with human review\n\n**Required AI Features:**\n- Full citation and source transparency\n- Human-in-the-loop approval\n- Complete audit trail\n- Easy override of AI suggestions',
    NOW(),
    NOW()
)
ON CONFLICT DO NOTHING;

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT id, name, LEFT(description, 80) as description_preview
FROM personas 
WHERE name LIKE '%MSL%'
ORDER BY name;


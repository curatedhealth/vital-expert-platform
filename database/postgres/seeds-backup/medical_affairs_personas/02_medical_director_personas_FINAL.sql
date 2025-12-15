-- ============================================================================
-- MEDICAL DIRECTOR - 4 MECE PERSONAS
-- FINAL VERSION - Matches actual database schema
-- Schema: persona_key, display_name, description, is_active
-- Version: 1.3 | Date: 2025-11-27
-- ============================================================================

BEGIN;

-- ========================================================================
-- MEDICAL DIRECTOR PERSONA 1: AUTOMATOR
-- ========================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_automator',
    'Dr. Amanda Foster - Medical Director Automator',
    E'**Role:** Medical Director, Oncology\n**Archetype:** AUTOMATOR\n**Tagline:** Data-Driven Medical Strategy Leader\n\n**Profile:**\n- Seniority: Director (14 years experience)\n- Education: MD, PhD\n- Geographic Scope: Regional\n- Organization Size: Large Pharma\n- Direct Reports: 15\n- Team Size: 25\n- Budget Authority: $5M-$20M\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 45/100 (Mixed)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 7/10\n- Actions: 8/10\n- Needs: 6/10\n- Emotions: 5/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Streamline team operations through intelligent automation\n- Make data-driven decisions faster\n- Free up time for strategic thinking\n- Lead Medical Affairs digital transformation\n\n**Top Frustrations:**\n- Manual compilation of team metrics and reports\n- Time spent on administrative coordination\n- Inconsistent data across multiple systems\n- Delayed access to competitive intelligence\n\n**Goals:**\n- Automate 50% of routine reporting tasks\n- Implement AI-powered KOL intelligence system\n- Reduce medical content review cycle by 40%\n\n**Tools Used:**\n- Veeva Vault, Power BI/Tableau, Microsoft Teams, Salesforce/CRM, ChatGPT/Claude',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ========================================================================
-- MEDICAL DIRECTOR PERSONA 2: ORCHESTRATOR
-- ========================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_orchestrator',
    'Dr. Robert Martinez - Medical Director Orchestrator',
    E'**Role:** Medical Director, Global Immunology\n**Archetype:** ORCHESTRATOR\n**Tagline:** AI-Powered Strategic Medical Leader\n\n**Profile:**\n- Seniority: Director (16 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 25\n- Team Size: 40\n- Budget Authority: $10M-$50M\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Transform Medical Affairs through AI-powered intelligence\n- Drive competitive advantage through predictive insights\n- Establish industry-leading AI capabilities\n- Mentor next generation of AI-enabled medical leaders\n\n**Top Frustrations:**\n- Synthesizing insights across 200+ global KOL interactions\n- Slow organizational adoption of AI capabilities\n- Limited tools for multi-source strategic intelligence\n- Coordinating global strategy across regions\n\n**Goals:**\n- Build AI-powered global KOL intelligence platform\n- Establish predictive analytics for competitive strategy\n- Lead industry in AI-enabled medical engagement\n- Train 100+ Medical Affairs professionals on AI\n\n**Tools Used:**\n- Custom AI workflows, Multi-agent panels, Predictive analytics, Power BI',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ========================================================================
-- MEDICAL DIRECTOR PERSONA 3: LEARNER
-- ========================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_learner',
    'Dr. Jennifer Lee - Medical Director Learner',
    E'**Role:** Medical Director, Neurology\n**Archetype:** LEARNER\n**Tagline:** Newly Promoted Medical Leader\n\n**Profile:**\n- Seniority: Director (10 years experience)\n- Education: PhD, PharmD\n- Geographic Scope: Regional\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 8\n- Team Size: 12\n- Budget Authority: $2M-$10M\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 42/100 (Mixed)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 6/10\n- Actions: 4/10\n- Needs: 4/10\n- Emotions: 5/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Succeed in new leadership role\n- Learn best practices for Medical Director responsibilities\n- Build credibility with team and stakeholders\n- Gradually adopt AI tools with proper training\n\n**Top Frustrations:**\n- Steep learning curve for leadership responsibilities\n- Uncertainty about AI tools and when to use them\n- Balancing operational tasks with strategic thinking\n- Need guidance on Medical Affairs best practices\n\n**Goals:**\n- Master Medical Director responsibilities within first year\n- Build strong relationships with team and stakeholders\n- Learn AI tools with proper training and support\n- Develop strategic planning capabilities\n\n**Adoption Barriers:**\n- Already overwhelmed with new role\n- Lack of training on AI tools\n- Uncertainty about AI reliability',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ========================================================================
-- MEDICAL DIRECTOR PERSONA 4: SKEPTIC
-- ========================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_skeptic',
    'Dr. William Chen - Medical Director Skeptic',
    E'**Role:** Medical Director, Cardiovascular\n**Archetype:** SKEPTIC\n**Tagline:** Compliance-First Medical Leader\n\n**Profile:**\n- Seniority: Director (20 years experience)\n- Education: MD, FACC\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 20\n- Team Size: 35\n- Budget Authority: $10M-$30M\n\n**AI Profile:**\n- AI Maturity Score: 25/100 (Low)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Laggard\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Hybrid with human oversight)\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 4/10\n- Actions: 2/10\n- Needs: 6/10\n- Emotions: 3/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain highest standards of medical accuracy\n- Protect company from compliance risks\n- Ensure human judgment in critical medical decisions\n- Preserve proven processes that ensure quality\n\n**Top Frustrations:**\n- Pressure to adopt AI without proven track record\n- AI tools that lack transparency in reasoning\n- Concerns about AI errors in medical content\n- Vendor overselling AI capabilities\n- Team members bypassing review processes\n\n**Goals:**\n- Ensure 100% compliance in all medical communications\n- Maintain human oversight for all AI-generated content\n- Establish clear AI governance policies\n- Gradually evaluate AI with proper validation\n\n**Required AI Features:**\n- Complete audit trail for all AI decisions\n- Human approval before any AI output is used\n- Full citation transparency with source verification\n- Easy override of AI recommendations',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET 
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT persona_key, display_name, LEFT(description, 80) as description_preview, is_active
FROM personas 
WHERE persona_key LIKE 'medical_director_%'
ORDER BY persona_key;


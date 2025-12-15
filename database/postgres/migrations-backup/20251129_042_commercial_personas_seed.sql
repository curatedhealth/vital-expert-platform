-- ============================================================================
-- MIGRATION 042: COMMERCIAL ORGANIZATION PERSONAS - MECE FRAMEWORK
-- Version: 1.0.0 | Date: 2025-11-29
-- Purpose: Seed personas for Commercial roles using 4 MECE archetypes each
-- Total: 80 personas (20 core role types × 4 archetypes)
-- ============================================================================
--
-- Commercial Organization Roles Covered (20 core types):
-- 1. Chief Commercial Officer
-- 2. VP Commercial Strategy
-- 3. SVP Commercial
-- 4. Commercial Strategy Director
-- 5. Commercial Lead
-- 6. VP of Sales
-- 7. National Sales Director
-- 8. Regional Sales Manager
-- 9. District Sales Manager
-- 10. Sales Representative
-- 11. Key Account Manager
-- 12. Strategic Account Manager
-- 13. Sales Training Manager
-- 14. Sales Analytics Manager
-- 15. Sales Enablement Lead
-- 16. Brand Lead
-- 17. Commercial Operations Manager
-- 18. Omnichannel CRM Manager
-- 19. Channel Manager
-- 20. Commercial Data Scientist
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 1: CHIEF COMMERCIAL OFFICER - 4 PERSONAS
-- ============================================================================

-- Chief Commercial Officer: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'chief_commercial_officer_automator',
    'Richard Stanford - Chief Commercial Officer Automator',
    E'**Role:** Chief Commercial Officer\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Driven Commercial Executive\n\n**Profile:**\n- Seniority: C-Suite (20 years experience)\n- Education: MBA, Wharton\n- Geographic Scope: Global\n- Organization Size: Top 15 Pharma\n- Direct Reports: 25\n- Team Size: 500+\n\n**AI Profile:**\n- AI Maturity Score: 82/100 (High)\n- Work Complexity Score: 48/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate-High\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Accelerate commercial insights by 60%\n- Automate sales performance tracking\n- Standardize global reporting\n- Enable data-driven decisions\n\n**Top Frustrations:**\n- Hours spent on manual reporting\n- Inconsistent regional data\n- Slow competitive intelligence\n- Fragmented CRM systems\n\n**Goals:**\n- Implement AI-powered sales analytics\n- Deploy automated performance dashboards\n- Create real-time market intelligence\n- Reduce reporting overhead by 70%\n\n**Tools Used:**\n- Veeva CRM, IQVIA, ZS Analytics, Salesforce, Commercial data platforms',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Chief Commercial Officer: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'chief_commercial_officer_orchestrator',
    'Dr. Victoria Chambers - Chief Commercial Officer Orchestrator',
    E'**Role:** Chief Commercial Officer\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Commercial Transformation Leader\n\n**Profile:**\n- Seniority: C-Suite (25 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Organization Size: Top 5 Pharma\n- Direct Reports: 40\n- Team Size: 1200+\n\n**AI Profile:**\n- AI Maturity Score: 92/100 (Very High)\n- Work Complexity Score: 90/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 9/10\n- Actions: 10/10\n- Needs: 9/10\n- Emotions: 7/10\n- Scenarios: 10/10\n\n**Key Motivations:**\n- Transform commercial model through AI\n- Build predictive customer engagement\n- Pioneer omnichannel excellence\n- Create competitive advantage\n\n**Top Frustrations:**\n- Fragmented customer intelligence\n- Slow digital transformation\n- Siloed commercial data\n- Unpredictable market dynamics\n\n**Goals:**\n- Build AI-powered commercial platform\n- Deploy predictive customer models\n- Create real-time competitive intelligence\n- Lead industry digital transformation\n\n**Tools Used:**\n- Custom AI platforms, Multi-agent orchestration, Predictive analytics, Real-time data, Enterprise systems',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Chief Commercial Officer: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'chief_commercial_officer_learner',
    'Amanda Richardson - Chief Commercial Officer Learner',
    E'**Role:** Chief Commercial Officer\n**Archetype:** LEARNER\n**Tagline:** Newly Appointed Commercial Executive\n\n**Profile:**\n- Seniority: C-Suite (first CCO role)\n- Education: MBA, Marketing background\n- Geographic Scope: US/Americas\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 15\n- Team Size: 200\n\n**AI Profile:**\n- AI Maturity Score: 40/100 (Low-Moderate)\n- Work Complexity Score: 45/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 6/10\n- Needs: 6/10\n- Emotions: 7/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Successfully lead commercial organization\n- Build board-level credibility\n- Master AI-enabled commercial strategy\n- Develop executive presence\n\n**Top Frustrations:**\n- Overwhelmed by C-suite responsibilities\n- Uncertain about AI capabilities\n- Limited strategic planning experience\n- Pressure to deliver quick results\n\n**Goals:**\n- Master commercial strategy leadership\n- Build AI-assisted decision making\n- Develop executive communication skills\n- Create measurable commercial wins\n\n**Ideal AI Features:**\n- Executive strategy guidance\n- Board presentation templates\n- AI mentor for decisions\n- Industry benchmarking insights',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Chief Commercial Officer: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'chief_commercial_officer_skeptic',
    'Jonathan Harrison - Chief Commercial Officer Skeptic',
    E'**Role:** Chief Commercial Officer\n**Archetype:** SKEPTIC\n**Tagline:** Relationship-Focused Commercial Traditionalist\n\n**Profile:**\n- Seniority: C-Suite (30 years experience)\n- Education: MBA, Sales background\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 30\n- Team Size: 800\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Low)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-only)\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 5/10\n- Actions: 4/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain customer relationship quality\n- Protect sales force effectiveness\n- Preserve human judgment in strategy\n- Ensure regulatory compliance\n\n**Top Frustrations:**\n- AI lacks customer nuance\n- Pressure for digital transformation\n- Concerns about sales depersonalization\n- Fear of compliance violations\n\n**Goals:**\n- Establish AI governance framework\n- Ensure human-first customer engagement\n- Maintain complete audit trails\n- Build responsible AI adoption\n\n**Required AI Features:**\n- Full human oversight\n- Never auto-engage customers\n- Complete compliance tracking\n- Easy override capabilities\n- Relationship protection',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 2: VP COMMERCIAL STRATEGY - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('vp_commercial_strategy_automator', 'Dr. Michelle Park - VP Commercial Strategy Automator', E'**Role:** VP Commercial Strategy\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate strategic analysis, market modeling, competitive tracking\n**Goals:** Deploy AI-powered strategy tools, reduce analysis time by 60%\n**Tools:** Strategy platforms, Analytics tools, Market intelligence', true, NOW(), NOW()),
('vp_commercial_strategy_orchestrator', 'Dr. Alexander Chen - VP Commercial Strategy Orchestrator', E'**Role:** VP Commercial Strategy\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Strategic (88/100)\n**Focus:** Build AI-powered strategy platform, predictive market models, transformation leadership\n**Goals:** Create real-time strategy intelligence, deploy multi-agent planning systems\n**Tools:** Custom AI platforms, Advanced analytics, Predictive modeling', true, NOW(), NOW()),
('vp_commercial_strategy_learner', 'Rebecca Torres - VP Commercial Strategy Learner', E'**Role:** VP Commercial Strategy\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master strategic planning, build analytical capabilities, learn AI tools\n**Goals:** Develop strategy expertise, build AI-assisted analysis skills\n**Ideal Features:** Strategy tutorials, templates, AI mentor', true, NOW(), NOW()),
('vp_commercial_strategy_skeptic', 'William Morrison - VP Commercial Strategy Skeptic', E'**Role:** VP Commercial Strategy\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (80/100)\n**Focus:** Maintain strategic rigor, ensure analysis quality, human oversight\n**Goals:** Establish AI governance, ensure expert validation\n**Requirements:** Full transparency, human approval, audit trails', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 3: VP OF SALES - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('vp_of_sales_automator', 'Mark Thompson - VP of Sales Automator', E'**Role:** VP of Sales\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate sales reporting, territory analytics, performance tracking\n**Goals:** Deploy AI-powered sales dashboards, reduce admin time by 50%\n**Tools:** Veeva CRM, Sales analytics, Performance platforms', true, NOW(), NOW()),
('vp_of_sales_orchestrator', 'Dr. Sarah Mitchell - VP of Sales Orchestrator', E'**Role:** VP of Sales\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build predictive sales models, AI-powered territory optimization, transformation leadership\n**Goals:** Create real-time sales intelligence, deploy next-best-action systems\n**Tools:** Custom AI, Predictive analytics, Advanced CRM', true, NOW(), NOW()),
('vp_of_sales_learner', 'Daniel Kim - VP of Sales Learner', E'**Role:** VP of Sales\n**Archetype:** LEARNER\n**AI Maturity:** Low (35/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master sales leadership, build analytical capabilities, learn AI tools\n**Goals:** Develop executive sales skills, build AI-assisted analysis\n**Ideal Features:** Leadership tutorials, templates, AI mentor', true, NOW(), NOW()),
('vp_of_sales_skeptic', 'Robert Anderson - VP of Sales Skeptic', E'**Role:** VP of Sales\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain relationship quality, preserve sales force effectiveness, human oversight\n**Goals:** Protect customer relationships, ensure compliance\n**Requirements:** Human control, never auto-engage, relationship protection', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 4: NATIONAL SALES DIRECTOR - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('national_sales_director_automator', 'Jennifer Lee - National Sales Director Automator', E'**Role:** National Sales Director\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (75/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate regional reporting, territory analysis, performance tracking\n**Goals:** Deploy automated dashboards, reduce reporting time by 60%\n**Tools:** CRM, Sales analytics, Territory tools', true, NOW(), NOW()),
('national_sales_director_orchestrator', 'Dr. Michael Davis - National Sales Director Orchestrator', E'**Role:** National Sales Director\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** High (80/100)\n**Focus:** Build predictive territory models, AI-powered optimization, strategic transformation\n**Goals:** Create real-time territory intelligence, deploy predictive analytics\n**Tools:** Custom AI, Advanced analytics, Optimization platforms', true, NOW(), NOW()),
('national_sales_director_learner', 'Ashley Williams - National Sales Director Learner', E'**Role:** National Sales Director\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master national sales leadership, build strategic skills, learn AI tools\n**Goals:** Develop leadership capabilities, build AI-assisted management\n**Ideal Features:** Leadership tutorials, templates, AI mentor', true, NOW(), NOW()),
('national_sales_director_skeptic', 'Thomas Brown - National Sales Director Skeptic', E'**Role:** National Sales Director\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (75/100)\n**Focus:** Maintain team effectiveness, preserve customer relationships, human oversight\n**Goals:** Protect team morale, ensure ethical selling\n**Requirements:** Human control, team consultation, relationship focus', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 5: REGIONAL SALES MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('regional_sales_manager_automator', 'Christopher Garcia - Regional Sales Manager Automator', E'**Role:** Regional Sales Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (72/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Automate rep performance tracking, call planning, reporting\n**Goals:** Deploy AI-powered coaching tools, reduce admin time by 50%\n**Tools:** CRM, Call planning tools, Performance analytics', true, NOW(), NOW()),
('regional_sales_manager_orchestrator', 'Dr. Nicole Patel - Regional Sales Manager Orchestrator', E'**Role:** Regional Sales Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** High (82/100)\n**Work Complexity:** High (75/100)\n**Focus:** Build predictive rep performance, AI-powered territory optimization, coaching excellence\n**Goals:** Create real-time performance intelligence, deploy next-best-action\n**Tools:** Advanced analytics, Custom AI, Coaching platforms', true, NOW(), NOW()),
('regional_sales_manager_learner', 'Brandon Martinez - Regional Sales Manager Learner', E'**Role:** Regional Sales Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low (35/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Master sales management, build coaching skills, learn AI tools\n**Goals:** Develop management capabilities, build AI-assisted coaching\n**Ideal Features:** Management tutorials, templates, AI mentor', true, NOW(), NOW()),
('regional_sales_manager_skeptic', 'Patricia Wilson - Regional Sales Manager Skeptic', E'**Role:** Regional Sales Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (70/100)\n**Focus:** Maintain rep relationships, preserve coaching quality, human oversight\n**Goals:** Protect team development, ensure authentic engagement\n**Requirements:** Human-first coaching, team consultation, relationship focus', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 6: DISTRICT SALES MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('district_sales_manager_automator', 'Steven Chen - District Sales Manager Automator', E'**Role:** District Sales Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (70/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Automate daily performance tracking, call reports, coaching prep\n**Goals:** Deploy AI-powered daily management, reduce admin time by 50%\n**Tools:** CRM, Call reporting, Performance tools', true, NOW(), NOW()),
('district_sales_manager_orchestrator', 'Dr. Emily Rodriguez - District Sales Manager Orchestrator', E'**Role:** District Sales Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate-High (70/100)\n**Focus:** Build predictive rep coaching, AI-powered optimization, field excellence\n**Goals:** Create real-time coaching intelligence, deploy personalized development\n**Tools:** Advanced analytics, Custom AI, Coaching platforms', true, NOW(), NOW()),
('district_sales_manager_learner', 'Justin Thompson - District Sales Manager Learner', E'**Role:** District Sales Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low (32/100)\n**Work Complexity:** Moderate (32/100)\n**Focus:** Master field management, build coaching fundamentals, learn AI tools\n**Goals:** Develop management skills, build AI-assisted operations\n**Ideal Features:** Management tutorials, templates, AI mentor', true, NOW(), NOW()),
('district_sales_manager_skeptic', 'Karen Miller - District Sales Manager Skeptic', E'**Role:** District Sales Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (20/100)\n**Work Complexity:** Moderate-High (68/100)\n**Focus:** Maintain field presence, preserve rep development, human oversight\n**Goals:** Protect authentic coaching, ensure team trust\n**Requirements:** Human-first approach, in-person priority, relationship focus', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 7: SALES REPRESENTATIVE - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('sales_representative_automator', 'Matthew Johnson - Sales Representative Automator', E'**Role:** Sales Representative\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (75/100)\n**Work Complexity:** Moderate (30/100)\n**Focus:** Automate call prep, HCP research, reporting\n**Goals:** Deploy AI-powered call planning, reduce admin time by 60%\n**Tools:** CRM, Call planning, HCP databases', true, NOW(), NOW()),
('sales_representative_orchestrator', 'Dr. Rachel Kim - Sales Representative Orchestrator', E'**Role:** Sales Representative\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** High (82/100)\n**Work Complexity:** Moderate-High (65/100)\n**Focus:** Build personalized HCP engagement, AI-powered insights, strategic selling\n**Goals:** Create real-time HCP intelligence, deploy next-best-action\n**Tools:** Advanced analytics, Custom AI, HCP platforms', true, NOW(), NOW()),
('sales_representative_learner', 'David Brown - Sales Representative Learner', E'**Role:** Sales Representative\n**Archetype:** LEARNER\n**AI Maturity:** Low (30/100)\n**Work Complexity:** Low-Moderate (28/100)\n**Focus:** Master pharma sales, build HCP relationships, learn AI tools\n**Goals:** Develop sales fundamentals, build AI-assisted planning\n**Ideal Features:** Sales tutorials, templates, AI mentor', true, NOW(), NOW()),
('sales_representative_skeptic', 'Susan Wilson - Sales Representative Skeptic', E'**Role:** Sales Representative\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (18/100)\n**Work Complexity:** Moderate (55/100)\n**Focus:** Maintain HCP relationships, preserve personal touch, human judgment\n**Goals:** Protect relationship quality, ensure authentic engagement\n**Requirements:** Human control, never auto-message, relationship first', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 8: KEY ACCOUNT MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('key_account_manager_automator', 'James Mitchell - Key Account Manager Automator', E'**Role:** Key Account Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate account research, contract tracking, reporting\n**Goals:** Deploy AI-powered account intelligence, reduce admin time by 50%\n**Tools:** CRM, Contract tools, Account analytics', true, NOW(), NOW()),
('key_account_manager_orchestrator', 'Dr. Lisa Chen - Key Account Manager Orchestrator', E'**Role:** Key Account Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (82/100)\n**Focus:** Build predictive account models, AI-powered strategy, relationship optimization\n**Goals:** Create real-time account intelligence, deploy predictive engagement\n**Tools:** Custom AI, Advanced analytics, Account platforms', true, NOW(), NOW()),
('key_account_manager_learner', 'Ryan Adams - Key Account Manager Learner', E'**Role:** Key Account Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master account management, build strategic skills, learn AI tools\n**Goals:** Develop KAM capabilities, build AI-assisted analysis\n**Ideal Features:** KAM tutorials, templates, AI mentor', true, NOW(), NOW()),
('key_account_manager_skeptic', 'Elizabeth Taylor - Key Account Manager Skeptic', E'**Role:** Key Account Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain account relationships, preserve trust, human oversight\n**Goals:** Protect account relationships, ensure authentic engagement\n**Requirements:** Human control, never auto-communicate, relationship priority', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 9: STRATEGIC ACCOUNT MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('strategic_account_manager_automator', 'Andrew Park - Strategic Account Manager Automator', E'**Role:** Strategic Account Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate-High (48/100)\n**Focus:** Automate strategic analysis, stakeholder mapping, contract intelligence\n**Goals:** Deploy AI-powered account strategy, reduce analysis time by 60%\n**Tools:** CRM, Strategy tools, Stakeholder mapping', true, NOW(), NOW()),
('strategic_account_manager_orchestrator', 'Dr. Maria Santos - Strategic Account Manager Orchestrator', E'**Role:** Strategic Account Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build predictive account models, AI-powered strategy, C-suite engagement\n**Goals:** Create real-time strategic intelligence, deploy multi-stakeholder optimization\n**Tools:** Custom AI, Advanced analytics, Executive engagement platforms', true, NOW(), NOW()),
('strategic_account_manager_learner', 'Kevin Williams - Strategic Account Manager Learner', E'**Role:** Strategic Account Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master strategic account management, build C-suite skills, learn AI tools\n**Goals:** Develop SAM capabilities, build AI-assisted strategy\n**Ideal Features:** SAM tutorials, templates, AI mentor', true, NOW(), NOW()),
('strategic_account_manager_skeptic', 'Margaret Davis - Strategic Account Manager Skeptic', E'**Role:** Strategic Account Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (20/100)\n**Work Complexity:** High (82/100)\n**Focus:** Maintain executive relationships, preserve strategic trust, human oversight\n**Goals:** Protect C-suite relationships, ensure authentic partnership\n**Requirements:** Human control, never auto-communicate, executive respect', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 10: SALES TRAINING MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('sales_training_manager_automator', 'Michelle Lee - Sales Training Manager Automator', E'**Role:** Sales Training Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate content development, assessments, learning tracking\n**Goals:** Deploy AI-powered training systems, reduce development time by 60%\n**Tools:** LMS, Content tools, Assessment platforms', true, NOW(), NOW()),
('sales_training_manager_orchestrator', 'Dr. Kevin Chen - Sales Training Manager Orchestrator', E'**Role:** Sales Training Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build adaptive learning, AI-powered personalization, training transformation\n**Goals:** Create real-time learning intelligence, deploy personalized curricula\n**Tools:** Custom AI, Advanced LMS, Adaptive learning platforms', true, NOW(), NOW()),
('sales_training_manager_learner', 'Jessica Martinez - Sales Training Manager Learner', E'**Role:** Sales Training Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master L&D principles, build training expertise, learn AI tools\n**Goals:** Develop training capabilities, build AI-assisted development\n**Ideal Features:** L&D tutorials, templates, AI mentor', true, NOW(), NOW()),
('sales_training_manager_skeptic', 'Robert Thompson - Sales Training Manager Skeptic', E'**Role:** Sales Training Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (72/100)\n**Focus:** Maintain training quality, preserve human learning, expert oversight\n**Goals:** Protect learning integrity, ensure effective development\n**Requirements:** Human validation, expert review, quality assurance', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 11: SALES ANALYTICS MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('sales_analytics_manager_automator', 'Nathan Davis - Sales Analytics Manager Automator', E'**Role:** Sales Analytics Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate reporting pipelines, dashboard generation, data processing\n**Goals:** Deploy automated analytics, reduce manual work by 70%\n**Tools:** SQL, Python, PowerBI, Analytics platforms', true, NOW(), NOW()),
('sales_analytics_manager_orchestrator', 'Dr. Sarah Kim - Sales Analytics Manager Orchestrator', E'**Role:** Sales Analytics Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** High (82/100)\n**Focus:** Build predictive sales models, AI-powered optimization, advanced analytics\n**Goals:** Create real-time sales intelligence, deploy ML models\n**Tools:** Custom AI, Advanced analytics, ML platforms', true, NOW(), NOW()),
('sales_analytics_manager_learner', 'Timothy Wilson - Sales Analytics Manager Learner', E'**Role:** Sales Analytics Manager\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master pharma analytics, build statistical skills, learn AI tools\n**Goals:** Develop analytics expertise, build ML capabilities\n**Ideal Features:** Analytics tutorials, templates, ML mentorship', true, NOW(), NOW()),
('sales_analytics_manager_skeptic', 'Catherine Brown - Sales Analytics Manager Skeptic', E'**Role:** Sales Analytics Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Moderate (45/100)\n**Work Complexity:** High (75/100)\n**Focus:** Ensure data quality, statistical rigor, human validation\n**Goals:** Maintain analytics accuracy, ensure interpretation quality\n**Requirements:** Full validation, expert review, methodology transparency', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 12: SALES ENABLEMENT LEAD - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('sales_enablement_lead_automator', 'Brian Johnson - Sales Enablement Lead Automator', E'**Role:** Sales Enablement Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate content distribution, tool deployment, onboarding\n**Goals:** Deploy AI-powered enablement, reduce time-to-productivity by 50%\n**Tools:** CRM, Content platforms, Enablement tools', true, NOW(), NOW()),
('sales_enablement_lead_orchestrator', 'Dr. Amanda Chen - Sales Enablement Lead Orchestrator', E'**Role:** Sales Enablement Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build personalized enablement, AI-powered recommendations, transformation\n**Goals:** Create real-time enablement intelligence, deploy adaptive systems\n**Tools:** Custom AI, Advanced enablement, Personalization platforms', true, NOW(), NOW()),
('sales_enablement_lead_learner', 'Laura Martinez - Sales Enablement Lead Learner', E'**Role:** Sales Enablement Lead\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master enablement strategy, build tool expertise, learn AI tools\n**Goals:** Develop enablement capabilities, build AI-assisted deployment\n**Ideal Features:** Enablement tutorials, templates, AI mentor', true, NOW(), NOW()),
('sales_enablement_lead_skeptic', 'Michael Williams - Sales Enablement Lead Skeptic', E'**Role:** Sales Enablement Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (72/100)\n**Focus:** Maintain enablement quality, ensure rep adoption, human support\n**Goals:** Protect enablement effectiveness, ensure user success\n**Requirements:** Human validation, rep consultation, quality assurance', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 13: BRAND LEAD - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('brand_lead_automator', 'Jennifer Park - Brand Lead Automator', E'**Role:** Brand Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate market analysis, campaign tracking, competitive monitoring\n**Goals:** Deploy AI-powered brand intelligence, reduce analysis time by 60%\n**Tools:** Marketing platforms, Analytics tools, Brand tracking', true, NOW(), NOW()),
('brand_lead_orchestrator', 'Dr. David Chen - Brand Lead Orchestrator', E'**Role:** Brand Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build predictive brand models, AI-powered strategy, market transformation\n**Goals:** Create real-time brand intelligence, deploy predictive marketing\n**Tools:** Custom AI, Advanced analytics, Brand platforms', true, NOW(), NOW()),
('brand_lead_learner', 'Stephanie Adams - Brand Lead Learner', E'**Role:** Brand Lead\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master brand strategy, build marketing skills, learn AI tools\n**Goals:** Develop brand management expertise, build AI-assisted analysis\n**Ideal Features:** Brand tutorials, templates, AI mentor', true, NOW(), NOW()),
('brand_lead_skeptic', 'Richard Taylor - Brand Lead Skeptic', E'**Role:** Brand Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (80/100)\n**Focus:** Maintain brand integrity, ensure creative quality, human judgment\n**Goals:** Protect brand value, ensure authentic messaging\n**Requirements:** Human approval, creative oversight, brand protection', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 14: COMMERCIAL OPERATIONS MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('commercial_operations_manager_automator', 'Anthony Lee - Commercial Operations Manager Automator', E'**Role:** Commercial Operations Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate operations workflows, process optimization, reporting\n**Goals:** Deploy AI-powered operations, reduce manual work by 60%\n**Tools:** Operations platforms, CRM, Analytics', true, NOW(), NOW()),
('commercial_operations_manager_orchestrator', 'Dr. Nicole Kim - Commercial Operations Manager Orchestrator', E'**Role:** Commercial Operations Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build intelligent operations, AI-powered optimization, transformation\n**Goals:** Create real-time operations intelligence, deploy predictive systems\n**Tools:** Custom AI, Advanced analytics, Operations platforms', true, NOW(), NOW()),
('commercial_operations_manager_learner', 'Eric Johnson - Commercial Operations Manager Learner', E'**Role:** Commercial Operations Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master commercial operations, build process skills, learn AI tools\n**Goals:** Develop operations expertise, build AI-assisted optimization\n**Ideal Features:** Operations tutorials, templates, AI mentor', true, NOW(), NOW()),
('commercial_operations_manager_skeptic', 'Barbara Wilson - Commercial Operations Manager Skeptic', E'**Role:** Commercial Operations Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (72/100)\n**Focus:** Maintain process quality, ensure compliance, human oversight\n**Goals:** Protect operations integrity, ensure regulatory compliance\n**Requirements:** Human validation, process audit, compliance verification', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 15: OMNICHANNEL CRM MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('omnichannel_crm_manager_automator', 'Chris Martinez - Omnichannel CRM Manager Automator', E'**Role:** Omnichannel CRM Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate channel orchestration, journey automation, reporting\n**Goals:** Deploy AI-powered omnichannel, reduce manual work by 70%\n**Tools:** Marketing automation, CRM, Journey platforms', true, NOW(), NOW()),
('omnichannel_crm_manager_orchestrator', 'Dr. Emily Park - Omnichannel CRM Manager Orchestrator', E'**Role:** Omnichannel CRM Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** High (82/100)\n**Focus:** Build predictive engagement, AI-powered personalization, transformation\n**Goals:** Create real-time omnichannel intelligence, deploy next-best-channel\n**Tools:** Custom AI, Advanced marketing, Personalization platforms', true, NOW(), NOW()),
('omnichannel_crm_manager_learner', 'Tyler Davis - Omnichannel CRM Manager Learner', E'**Role:** Omnichannel CRM Manager\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (50/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master omnichannel strategy, build technical skills, learn AI tools\n**Goals:** Develop CRM expertise, build AI-assisted orchestration\n**Ideal Features:** CRM tutorials, templates, AI mentor', true, NOW(), NOW()),
('omnichannel_crm_manager_skeptic', 'Sandra Thompson - Omnichannel CRM Manager Skeptic', E'**Role:** Omnichannel CRM Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (35/100)\n**Work Complexity:** High (75/100)\n**Focus:** Maintain customer experience, ensure channel quality, human oversight\n**Goals:** Protect customer relationships, ensure consistent experience\n**Requirements:** Human validation, customer consent, experience quality', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 16: CHANNEL MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('channel_manager_automator', 'Joshua Lee - Channel Manager Automator', E'**Role:** Channel Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (75/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate channel analysis, partner tracking, performance reporting\n**Goals:** Deploy AI-powered channel management, reduce admin time by 50%\n**Tools:** Partner platforms, CRM, Analytics', true, NOW(), NOW()),
('channel_manager_orchestrator', 'Dr. Amanda Chen - Channel Manager Orchestrator', E'**Role:** Channel Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** High (85/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build predictive channel models, AI-powered optimization, partnership excellence\n**Goals:** Create real-time channel intelligence, deploy partner optimization\n**Tools:** Custom AI, Advanced analytics, Partner platforms', true, NOW(), NOW()),
('channel_manager_learner', 'Brandon Williams - Channel Manager Learner', E'**Role:** Channel Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Master channel strategy, build partnership skills, learn AI tools\n**Goals:** Develop channel expertise, build AI-assisted management\n**Ideal Features:** Channel tutorials, templates, AI mentor', true, NOW(), NOW()),
('channel_manager_skeptic', 'Diane Taylor - Channel Manager Skeptic', E'**Role:** Channel Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** Moderate-High (68/100)\n**Focus:** Maintain partner relationships, preserve trust, human oversight\n**Goals:** Protect partner relationships, ensure authentic partnership\n**Requirements:** Human control, partner consultation, relationship priority', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 17: COMMERCIAL DATA SCIENTIST - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('commercial_data_scientist_automator', 'Alex Kim - Commercial Data Scientist Automator', E'**Role:** Commercial Data Scientist\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate data pipelines, model deployment, reporting automation\n**Goals:** Deploy automated ML operations, reduce manual work by 80%\n**Tools:** Python, SQL, ML platforms, Cloud computing', true, NOW(), NOW()),
('commercial_data_scientist_orchestrator', 'Dr. Samantha Chen - Commercial Data Scientist Orchestrator', E'**Role:** Commercial Data Scientist\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (95/100)\n**Work Complexity:** Strategic (88/100)\n**Focus:** Build advanced ML systems, AI-powered innovation, commercial transformation\n**Goals:** Create real-time AI intelligence, deploy deep learning systems\n**Tools:** Advanced ML, Deep learning, Custom AI, Cloud AI', true, NOW(), NOW()),
('commercial_data_scientist_learner', 'Ryan Johnson - Commercial Data Scientist Learner', E'**Role:** Commercial Data Scientist\n**Archetype:** LEARNER\n**AI Maturity:** High (65/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master pharma data science, build ML skills, learn industry applications\n**Goals:** Develop DS expertise, build pharma-specific ML\n**Ideal Features:** Pharma DS tutorials, project templates, ML mentorship', true, NOW(), NOW()),
('commercial_data_scientist_skeptic', 'Dr. Elizabeth Brown - Commercial Data Scientist Skeptic', E'**Role:** Commercial Data Scientist\n**Archetype:** SKEPTIC\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** High (78/100)\n**Focus:** Ensure model validity, statistical rigor, interpretable models\n**Goals:** Maintain analytical accuracy, ensure business understanding\n**Requirements:** Full explainability, validation protocols, uncertainty quantification', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ADDITIONAL COMMERCIAL ROLES (Abbreviated)
-- ============================================================================

-- Commercial Lead: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('commercial_lead_automator', 'Daniel Park - Commercial Lead Automator', E'**Role:** Commercial Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate commercial planning, performance tracking, reporting\n**Goals:** Deploy AI-powered commercial tools, reduce admin time by 50%', true, NOW(), NOW()),
('commercial_lead_orchestrator', 'Dr. Michelle Kim - Commercial Lead Orchestrator', E'**Role:** Commercial Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (82/100)\n**Focus:** Build commercial intelligence platform, predictive models, transformation\n**Goals:** Create real-time commercial intelligence, deploy optimization systems', true, NOW(), NOW()),
('commercial_lead_learner', 'Jason Williams - Commercial Lead Learner', E'**Role:** Commercial Lead\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master commercial strategy, build leadership skills, learn AI tools\n**Goals:** Develop commercial expertise, build AI-assisted management', true, NOW(), NOW()),
('commercial_lead_skeptic', 'Christine Taylor - Commercial Lead Skeptic', E'**Role:** Commercial Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain commercial integrity, ensure quality, human oversight\n**Goals:** Protect commercial relationships, ensure compliance', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Commercial Strategy Director: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('commercial_strategy_director_automator', 'Thomas Lee - Commercial Strategy Director Automator', E'**Role:** Commercial Strategy Director\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate-High (50/100)\n**Focus:** Automate strategic analysis, scenario modeling, competitive tracking\n**Goals:** Deploy AI-powered strategy tools, reduce analysis time by 60%', true, NOW(), NOW()),
('commercial_strategy_director_orchestrator', 'Dr. Lauren Chen - Commercial Strategy Director Orchestrator', E'**Role:** Commercial Strategy Director\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** Strategic (88/100)\n**Focus:** Build strategic intelligence platform, predictive models, transformation leadership\n**Goals:** Create real-time strategy intelligence, deploy multi-scenario planning', true, NOW(), NOW()),
('commercial_strategy_director_learner', 'Adam Williams - Commercial Strategy Director Learner', E'**Role:** Commercial Strategy Director\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (42/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Master strategic planning, build analytical capabilities, learn AI tools\n**Goals:** Develop strategy expertise, build AI-assisted analysis', true, NOW(), NOW()),
('commercial_strategy_director_skeptic', 'Margaret Johnson - Commercial Strategy Director Skeptic', E'**Role:** Commercial Strategy Director\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (82/100)\n**Focus:** Maintain strategic rigor, ensure analysis quality, human oversight\n**Goals:** Protect strategic integrity, ensure expert validation', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- SVP Commercial: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('svp_commercial_automator', 'Richard Chen - SVP Commercial Automator', E'**Role:** SVP Commercial\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate (48/100)\n**Focus:** Automate executive reporting, performance dashboards, strategic analysis\n**Goals:** Deploy AI-powered executive tools, reduce reporting time by 60%', true, NOW(), NOW()),
('svp_commercial_orchestrator', 'Dr. Victoria Park - SVP Commercial Orchestrator', E'**Role:** SVP Commercial\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Strategic (88/100)\n**Focus:** Build commercial transformation platform, predictive intelligence, executive leadership\n**Goals:** Create real-time commercial intelligence, deploy strategic optimization', true, NOW(), NOW()),
('svp_commercial_learner', 'Stephen Williams - SVP Commercial Learner', E'**Role:** SVP Commercial\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Master executive leadership, build strategic capabilities, learn AI tools\n**Goals:** Develop executive presence, build AI-assisted decision making', true, NOW(), NOW()),
('svp_commercial_skeptic', 'Barbara Taylor - SVP Commercial Skeptic', E'**Role:** SVP Commercial\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (85/100)\n**Focus:** Maintain strategic judgment, preserve relationship quality, human oversight\n**Goals:** Protect commercial relationships, ensure authentic leadership', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Commercial Organization Personas: 80
-- Roles covered: 20 core Commercial role types
-- Archetypes: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC (4 each)
--
-- Key characteristics by archetype:
-- AUTOMATOR: High AI maturity (70-88%), moderate complexity, workflow-focused
-- ORCHESTRATOR: Very high AI maturity (85-95%), strategic complexity, transformation leaders
-- LEARNER: Low AI maturity (30-55%), lower complexity, skill-building focus, needs mentorship
-- SKEPTIC: Low AI maturity (18-25%), high complexity, governance and validation focus
-- ============================================================================

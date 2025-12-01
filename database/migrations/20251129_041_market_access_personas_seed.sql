-- ============================================================================
-- MIGRATION 041: MARKET ACCESS FUNCTION PERSONAS - MECE FRAMEWORK
-- Version: 1.0.0 | Date: 2025-11-29
-- Purpose: Seed personas for Market Access roles using 4 MECE archetypes each
-- Total: 76 personas (19 core role types × 4 archetypes)
-- ============================================================================
--
-- MECE Archetype Matrix:
--                          AI READINESS
--                    Low (<0.5)     High (>=0.5)
--              +------------------+------------------+
--  WORK   Low  |    LEARNER       |   AUTOMATOR      |
--  COMP.       | Needs guidance   | Wants speed      |
--              +------------------+------------------+
--        High  |    SKEPTIC       |  ORCHESTRATOR    |
--              | Needs proof      | Wants power      |
--              +------------------+------------------+
--
-- Market Access Roles Covered (19 core types):
-- 1. VP Market Access
-- 2. Market Access Director
-- 3. Chief Market Access Officer
-- 4. Market Access Analyst
-- 5. Market Access Operations Lead
-- 6. HEOR Director
-- 7. HEOR Specialist
-- 8. HEOR Analyst
-- 9. Payer Liaison
-- 10. Payer Relations Manager
-- 11. Payer Strategy Lead
-- 12. Pricing Manager
-- 13. Value & Pricing Analyst
-- 14. Reimbursement Manager
-- 15. Value & Access Manager
-- 16. HTA Access Lead
-- 17. Access Data Scientist
-- 18. Patient Access Manager
-- 19. Payer Evidence Lead
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 1: VP MARKET ACCESS - 4 PERSONAS
-- ============================================================================

-- VP Market Access: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_automator',
    'Sarah Mitchell - VP Market Access Automator',
    E'**Role:** VP Market Access\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Driven Access Executive\n\n**Profile:**\n- Seniority: VP (15 years experience)\n- Education: PharmD, MBA\n- Geographic Scope: Regional (North America)\n- Organization Size: Top 20 Pharma\n- Direct Reports: 15\n- Team Size: 80\n\n**AI Profile:**\n- AI Maturity Score: 82/100 (High)\n- Work Complexity Score: 45/100 (Moderate-Routine)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate-High\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate HTA dossier preparation by 60%\n- Standardize global pricing strategy workflows\n- Real-time payer landscape intelligence\n- Automate competitive access monitoring\n\n**Top Frustrations:**\n- 20+ hours weekly reviewing access strategies\n- Manual pricing scenario modeling\n- Inconsistent HTA submission quality\n- Slow cross-functional alignment\n\n**Goals:**\n- Implement AI-powered pricing optimization\n- Automate value dossier generation\n- Deploy real-time market access dashboards\n- Reduce time-to-access by 40%\n\n**Tools Used:**\n- IQVIA, Evaluate Pharma, ZS AccessHub, Pricing analytics platforms, Global pricing databases',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- VP Market Access: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_orchestrator',
    'Dr. Marcus Chen - VP Market Access Orchestrator',
    E'**Role:** VP Market Access\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Access Transformation Leader\n\n**Profile:**\n- Seniority: SVP (20 years experience)\n- Education: MD, PhD Health Economics, MBA\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 25\n- Team Size: 150\n\n**AI Profile:**\n- AI Maturity Score: 90/100 (Very High)\n- Work Complexity Score: 88/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 9/10\n- Actions: 10/10\n- Needs: 9/10\n- Emotions: 7/10\n- Scenarios: 10/10\n\n**Key Motivations:**\n- Transform market access through AI-powered insights\n- Build predictive payer behavior models\n- Pioneer outcome-based contracting optimization\n- Establish global access intelligence center\n\n**Top Frustrations:**\n- Synthesizing insights across 100+ markets\n- Predicting payer decisions with accuracy\n- Slow organizational transformation\n- Fragmented access data ecosystem\n\n**Goals:**\n- Build AI-powered market access intelligence platform\n- Deploy multi-agent access strategy panels\n- Create predictive payer engagement models\n- Train global organization on AI-enabled access\n\n**Tools Used:**\n- Custom AI platforms, Multi-agent orchestration, Real-world data analytics, Global payer databases, Outcome tracking systems',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- VP Market Access: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_learner',
    'Emily Rodriguez - VP Market Access Learner',
    E'**Role:** VP Market Access\n**Archetype:** LEARNER\n**Tagline:** Newly Elevated Access Executive\n\n**Profile:**\n- Seniority: VP (newly promoted from Director)\n- Education: MPH, Health Economics Certificate\n- Geographic Scope: US\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 8\n- Team Size: 30\n\n**AI Profile:**\n- AI Maturity Score: 38/100 (Low-Moderate)\n- Work Complexity Score: 40/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 8/10\n- Actions: 6/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Successfully transition to executive role\n- Build strategic access planning capabilities\n- Earn credibility with C-suite\n- Learn from industry best practices\n\n**Top Frustrations:**\n- Overwhelmed by enterprise-level responsibilities\n- Uncertain about AI tools and limitations\n- Limited experience with board-level presentations\n- Difficulty balancing tactical and strategic work\n\n**Goals:**\n- Master market access strategic planning\n- Build confidence in AI as thought partner\n- Develop executive leadership skills\n- Create measurable success metrics\n\n**Ideal AI Features:**\n- Step-by-step strategic planning guidance\n- Templates for access strategies and budgets\n- AI mentor for executive decisions\n- Industry benchmarking insights',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- VP Market Access: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_skeptic',
    'Dr. James Morrison - VP Market Access Skeptic',
    E'**Role:** VP Market Access\n**Archetype:** SKEPTIC\n**Tagline:** Evidence-Driven Access Traditionalist\n\n**Profile:**\n- Seniority: EVP (25 years experience)\n- Education: MD, MPH\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 20\n- Team Size: 100\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Low)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-in-the-loop)\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 5/10\n- Actions: 4/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Maintain scientific rigor in value evidence\n- Protect organization from AI-related payer risks\n- Preserve human judgment in pricing decisions\n- Ensure patient access remains paramount\n\n**Top Frustrations:**\n- AI hallucinations in HEOR models\n- Pressure to adopt unproven AI technologies\n- Lack of transparency in AI pricing recommendations\n- Concerns about liability for AI-generated dossiers\n\n**Goals:**\n- Establish clear governance for AI in market access\n- Ensure all AI outputs are validated by experts\n- Maintain complete audit trail for HTA submissions\n- Build framework for responsible AI adoption\n\n**Required AI Features:**\n- Full source citation with verification\n- Human approval required for all outputs\n- Complete audit trail for payer interactions\n- Explainable pricing rationale\n- Easy override and correction mechanisms',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 2: MARKET ACCESS DIRECTOR - 4 PERSONAS
-- ============================================================================

-- Market Access Director: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'market_access_director_automator',
    'Jennifer Park - Market Access Director Automator',
    E'**Role:** Market Access Director\n**Archetype:** AUTOMATOR\n**Tagline:** Process-Optimized Access Leader\n\n**Profile:**\n- Seniority: Director (12 years experience)\n- Education: PharmD, MS Health Economics\n- Geographic Scope: US\n- Organization Size: Mid-Large Pharma\n- Direct Reports: 8\n- Team Size: 25\n\n**AI Profile:**\n- AI Maturity Score: 75/100 (High)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate payer dossier preparation\n- Standardize access strategy workflows\n- Reduce manual data aggregation\n- Enable team with automation tools\n\n**Top Frustrations:**\n- Hours spent on repetitive formulary tracking\n- Manual competitive access monitoring\n- Inconsistent payer meeting preparation\n- Slow contract analysis turnaround\n\n**Goals:**\n- Automate 70% of formulary monitoring\n- Implement AI-powered payer insights\n- Reduce dossier preparation time by 50%\n- Deploy real-time access dashboards\n\n**Tools Used:**\n- MMIT, SSR Health, Fingertip Formulary, Excel/PowerBI, CRM systems',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Market Access Director: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'market_access_director_orchestrator',
    'Dr. David Kim - Market Access Director Orchestrator',
    E'**Role:** Market Access Director\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Access Innovator\n\n**Profile:**\n- Seniority: Senior Director (18 years experience)\n- Education: PhD Health Economics, MBA\n- Geographic Scope: Global\n- Organization Size: Top 15 Pharma\n- Direct Reports: 12\n- Team Size: 45\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform access strategy through AI\n- Build predictive payer decision models\n- Pioneer value-based contracting innovation\n- Create competitive access intelligence\n\n**Top Frustrations:**\n- Synthesizing multi-market payer insights\n- Predicting reimbursement decisions\n- Limited cross-functional integration\n- Slow organizational adaptation\n\n**Goals:**\n- Build AI-powered access strategy platform\n- Deploy multi-agent payer simulation\n- Create real-time competitive monitoring\n- Train team on advanced AI capabilities\n\n**Tools Used:**\n- Custom AI platforms, Predictive analytics, Real-world data, Global payer intelligence, Outcome tracking',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Market Access Director: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'market_access_director_learner',
    'Michael Thompson - Market Access Director Learner',
    E'**Role:** Market Access Director\n**Archetype:** LEARNER\n**Tagline:** Emerging Access Leader\n\n**Profile:**\n- Seniority: Director (newly promoted)\n- Education: MBA, Healthcare Management\n- Geographic Scope: Regional\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 5\n- Team Size: 15\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 38/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Successfully transition to director role\n- Build market access expertise\n- Gain confidence in payer negotiations\n- Learn AI tools systematically\n\n**Top Frustrations:**\n- Complex payer landscape to master\n- Uncertain about AI capabilities\n- Limited HTA dossier experience\n- Pressure to deliver quick wins\n\n**Goals:**\n- Master payer engagement strategy\n- Build AI-assisted analysis skills\n- Develop team leadership capabilities\n- Create measurable access improvements\n\n**Ideal AI Features:**\n- Guided payer strategy templates\n- Step-by-step HTA dossier support\n- AI mentor for access decisions\n- Industry best practice library',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Market Access Director: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'market_access_director_skeptic',
    'Patricia Williams - Market Access Director Skeptic',
    E'**Role:** Market Access Director\n**Archetype:** SKEPTIC\n**Tagline:** Cautious Value Evidence Expert\n\n**Profile:**\n- Seniority: Senior Director (22 years experience)\n- Education: PhD Pharmacoeconomics\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 10\n- Team Size: 35\n\n**AI Profile:**\n- AI Maturity Score: 28/100 (Low)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-in-the-loop)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 5/10\n- Actions: 4/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Maintain rigorous evidence standards\n- Protect payer relationship integrity\n- Preserve expert judgment in access\n- Ensure regulatory compliance\n\n**Top Frustrations:**\n- AI errors in economic models\n- Pressure to use unvalidated AI\n- Lack of AI transparency\n- Concerns about payer trust\n\n**Goals:**\n- Establish AI governance in access\n- Ensure human validation of all outputs\n- Maintain complete audit trails\n- Build responsible AI framework\n\n**Required AI Features:**\n- Full citation verification\n- Human approval workflows\n- Complete audit trails\n- Explainable recommendations\n- Easy correction mechanisms',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 3: HEOR DIRECTOR - 4 PERSONAS
-- ============================================================================

-- HEOR Director: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_director_automator',
    'Dr. Rachel Green - HEOR Director Automator',
    E'**Role:** HEOR Director\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Focused HEOR Leader\n\n**Profile:**\n- Seniority: Director (14 years experience)\n- Education: PhD Health Economics, MS Biostatistics\n- Geographic Scope: Global\n- Organization Size: Top 20 Pharma\n- Direct Reports: 10\n- Team Size: 40\n\n**AI Profile:**\n- AI Maturity Score: 80/100 (High)\n- Work Complexity Score: 48/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 9/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate literature review by 70%\n- Automate economic model documentation\n- Standardize global HEOR deliverables\n- Enable team with AI-powered research\n\n**Top Frustrations:**\n- 25+ hours weekly on literature screening\n- Manual systematic review processes\n- Inconsistent model documentation\n- Slow meta-analysis turnaround\n\n**Goals:**\n- Implement AI-powered literature screening\n- Automate economic model validation\n- Deploy real-time evidence synthesis\n- Reduce time-to-insight by 60%\n\n**Tools Used:**\n- HEOR databases, TreeAge, R/SAS, Systematic review tools, Meta-analysis software',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- HEOR Director: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_director_orchestrator',
    'Dr. Andrew Patel - HEOR Director Orchestrator',
    E'**Role:** HEOR Director\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic HEOR Innovation Leader\n\n**Profile:**\n- Seniority: VP HEOR (20 years experience)\n- Education: MD, PhD Health Economics, MBA\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 15\n- Team Size: 60\n\n**AI Profile:**\n- AI Maturity Score: 92/100 (Very High)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 9/10\n- Actions: 10/10\n- Needs: 9/10\n- Emotions: 7/10\n- Scenarios: 10/10\n\n**Key Motivations:**\n- Transform HEOR through AI-powered evidence\n- Build real-time global evidence platform\n- Pioneer AI-driven economic modeling\n- Establish HEOR center of excellence\n\n**Top Frustrations:**\n- Synthesizing evidence across 200+ markets\n- Keeping models current with new data\n- Slow organizational transformation\n- Fragmented evidence ecosystem\n\n**Goals:**\n- Build AI-powered HEOR intelligence platform\n- Deploy multi-agent evidence synthesis\n- Create predictive value models\n- Train global organization on AI HEOR\n\n**Tools Used:**\n- Custom AI platforms, Advanced analytics, Real-world data, Global evidence databases, Predictive modeling',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- HEOR Director: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_director_learner',
    'Dr. Susan Lee - HEOR Director Learner',
    E'**Role:** HEOR Director\n**Archetype:** LEARNER\n**Tagline:** Emerging HEOR Leader\n\n**Profile:**\n- Seniority: Director (newly promoted)\n- Education: PhD Health Services Research\n- Geographic Scope: US\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 6\n- Team Size: 18\n\n**AI Profile:**\n- AI Maturity Score: 40/100 (Low-Moderate)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 8/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Successfully lead HEOR department\n- Build strategic value communication skills\n- Master AI-assisted research methods\n- Earn credibility with senior leadership\n\n**Top Frustrations:**\n- Overwhelmed by global HEOR scope\n- Uncertain about AI tool selection\n- Limited experience managing budgets\n- Balancing research and leadership\n\n**Goals:**\n- Master HEOR strategic leadership\n- Build AI-assisted analysis skills\n- Develop team mentorship capabilities\n- Create measurable research impact\n\n**Ideal AI Features:**\n- Step-by-step economic modeling guide\n- Templates for HEOR deliverables\n- AI mentor for research decisions\n- Best practice library access',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- HEOR Director: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_director_skeptic',
    'Prof. Thomas Schmidt - HEOR Director Skeptic',
    E'**Role:** HEOR Director\n**Archetype:** SKEPTIC\n**Tagline:** Rigorous Evidence Purist\n\n**Profile:**\n- Seniority: VP HEOR (28 years experience)\n- Education: PhD Pharmacoeconomics, MS Epidemiology\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 12\n- Team Size: 50\n\n**AI Profile:**\n- AI Maturity Score: 18/100 (Very Low)\n- Work Complexity Score: 88/100 (Strategic)\n- Technology Adoption: Laggard\n- Risk Tolerance: Very Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-only)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 5/10\n- Emotions: 3/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain scientific excellence\n- Protect evidence integrity\n- Preserve methodological rigor\n- Ensure regulatory acceptance\n\n**Top Frustrations:**\n- AI errors in statistical analyses\n- Pressure to use unvalidated methods\n- Concerns about HTA acceptance\n- Fear of reputational damage\n\n**Goals:**\n- Establish strict AI governance\n- Ensure complete human oversight\n- Maintain peer review standards\n- Build validation protocols\n\n**Required AI Features:**\n- Complete methodology transparency\n- Expert review of all outputs\n- Full audit capabilities\n- Peer validation workflows\n- Conservative uncertainty handling',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 4: HEOR SPECIALIST - 4 PERSONAS
-- ============================================================================

-- HEOR Specialist: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_specialist_automator',
    'Dr. Michelle Zhang - HEOR Specialist Automator',
    E'**Role:** HEOR Specialist\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Driven Health Economist\n\n**Profile:**\n- Seniority: Senior Specialist (8 years experience)\n- Education: PhD Health Economics\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 0\n- Team Size: Individual Contributor\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 35/100 (Moderate-Routine)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Automate literature reviews and screening\n- Accelerate model development cycles\n- Reduce manual data extraction time\n- Focus on strategic analysis\n\n**Top Frustrations:**\n- Hours spent on repetitive screening\n- Manual abstract review burden\n- Slow systematic review processes\n- Data formatting inconsistencies\n\n**Goals:**\n- Automate 80% of literature screening\n- Implement AI-powered extraction\n- Reduce model development time by 50%\n- Deploy automated reporting\n\n**Tools Used:**\n- Covidence, R/Python, TreeAge, Excel, Literature databases',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- HEOR Specialist: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_specialist_orchestrator',
    'Dr. Kevin Nguyen - HEOR Specialist Orchestrator',
    E'**Role:** HEOR Specialist\n**Archetype:** ORCHESTRATOR\n**Tagline:** Innovative Evidence Strategist\n\n**Profile:**\n- Seniority: Principal Specialist (12 years experience)\n- Education: PhD Pharmacoeconomics, MS Data Science\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 2 (junior analysts)\n- Team Size: 5\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Pioneer AI-powered economic modeling\n- Build predictive HEOR platforms\n- Integrate ML into value assessment\n- Lead methodological innovation\n\n**Top Frustrations:**\n- Limited AI integration in tools\n- Siloed data across studies\n- Slow organizational adoption\n- Manual cross-study synthesis\n\n**Goals:**\n- Build AI-enhanced modeling platform\n- Deploy automated evidence synthesis\n- Create real-time model updating\n- Train team on AI methods\n\n**Tools Used:**\n- Python/ML frameworks, R/Stan, Custom AI tools, Cloud computing, Advanced analytics',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- HEOR Specialist: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_specialist_learner',
    'Laura Martinez - HEOR Specialist Learner',
    E'**Role:** HEOR Specialist\n**Archetype:** LEARNER\n**Tagline:** Emerging Health Economist\n\n**Profile:**\n- Seniority: Specialist (3 years experience)\n- Education: MS Health Economics (recent)\n- Geographic Scope: US\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 0\n- Team Size: Individual Contributor\n\n**AI Profile:**\n- AI Maturity Score: 42/100 (Low-Moderate)\n- Work Complexity Score: 32/100 (Routine)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate-High\n- Preferred Service Layer: ASK_ME\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Build HEOR technical expertise\n- Learn economic modeling best practices\n- Develop publication portfolio\n- Grow into senior role\n\n**Top Frustrations:**\n- Steep learning curve for complex models\n- Uncertainty about AI tool usage\n- Limited mentorship access\n- Time pressure on deliverables\n\n**Goals:**\n- Master cost-effectiveness analysis\n- Learn AI-assisted research methods\n- Publish first-author papers\n- Build professional network\n\n**Ideal AI Features:**\n- Step-by-step modeling tutorials\n- Templates for common analyses\n- AI mentor for methods questions\n- Learning path recommendations',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- HEOR Specialist: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'heor_specialist_skeptic',
    'Dr. Robert Burns - HEOR Specialist Skeptic',
    E'**Role:** HEOR Specialist\n**Archetype:** SKEPTIC\n**Tagline:** Methodologically Rigorous Economist\n\n**Profile:**\n- Seniority: Senior Specialist (15 years experience)\n- Education: PhD Epidemiology, MS Biostatistics\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 0\n- Team Size: Individual Contributor\n\n**AI Profile:**\n- AI Maturity Score: 25/100 (Low)\n- Work Complexity Score: 72/100 (Complex)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-in-the-loop)\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 5/10\n- Actions: 4/10\n- Needs: 5/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain methodological rigor\n- Ensure statistical validity\n- Protect research integrity\n- Meet regulatory standards\n\n**Top Frustrations:**\n- AI statistical errors\n- Pressure for speed over quality\n- Black-box model concerns\n- Peer review skepticism\n\n**Goals:**\n- Establish validation protocols\n- Ensure human oversight\n- Maintain transparency standards\n- Build trust in AI outputs\n\n**Required AI Features:**\n- Full statistical transparency\n- Expert validation workflows\n- Complete audit trails\n- Conservative assumptions\n- Clear limitation disclosure',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 5: PAYER LIAISON - 4 PERSONAS
-- ============================================================================

-- Payer Liaison: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_automator',
    'Christopher Adams - Payer Liaison Automator',
    E'**Role:** Payer Liaison\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Focused Payer Engagement\n\n**Profile:**\n- Seniority: Senior (7 years experience)\n- Education: MBA, Healthcare Management\n- Geographic Scope: Regional (Northeast US)\n- Organization Size: Large Pharma\n- Direct Reports: 0\n- Territory: 25 accounts\n\n**AI Profile:**\n- AI Maturity Score: 72/100 (High)\n- Work Complexity Score: 38/100 (Moderate-Routine)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Automate payer intelligence gathering\n- Streamline meeting preparation\n- Reduce administrative burden\n- Focus on relationship building\n\n**Top Frustrations:**\n- Hours spent researching each payer\n- Manual formulary tracking\n- Slow CRM data entry\n- Inconsistent access insights\n\n**Goals:**\n- Automate 60% of payer research\n- Implement AI-powered prep summaries\n- Deploy automated follow-up tracking\n- Reduce admin time by 50%\n\n**Tools Used:**\n- CRM (Veeva), MMIT, Fingertip Formulary, Excel, PowerBI',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Payer Liaison: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_orchestrator',
    'Diana Vasquez - Payer Liaison Orchestrator',
    E'**Role:** Payer Liaison\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Payer Relationship Innovator\n\n**Profile:**\n- Seniority: Principal (12 years experience)\n- Education: PharmD, MBA\n- Geographic Scope: National Key Accounts\n- Organization Size: Top 10 Pharma\n- Direct Reports: 3\n- Territory: Top 15 Payers\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Build predictive payer engagement\n- Pioneer AI-powered account strategy\n- Create competitive intelligence platform\n- Lead digital transformation\n\n**Top Frustrations:**\n- Limited predictive insights\n- Siloed payer intelligence\n- Slow organizational adaptation\n- Manual strategy development\n\n**Goals:**\n- Build AI-powered payer intelligence\n- Deploy predictive engagement models\n- Create real-time competitive monitoring\n- Train team on AI capabilities\n\n**Tools Used:**\n- Custom AI platforms, Predictive analytics, CRM, Real-time data, Competitive intelligence',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Payer Liaison: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_learner',
    'Brandon Cooper - Payer Liaison Learner',
    E'**Role:** Payer Liaison\n**Archetype:** LEARNER\n**Tagline:** Emerging Payer Account Manager\n\n**Profile:**\n- Seniority: Junior (2 years experience)\n- Education: BS Biology, Sales Certificate\n- Geographic Scope: Regional Territory\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 0\n- Territory: 15 accounts\n\n**AI Profile:**\n- AI Maturity Score: 38/100 (Low-Moderate)\n- Work Complexity Score: 28/100 (Routine)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_ME\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Learn payer landscape fundamentals\n- Build relationship skills\n- Understand formulary dynamics\n- Grow into senior role\n\n**Top Frustrations:**\n- Complex payer ecosystem to learn\n- Limited mentorship access\n- Uncertainty about AI tools\n- Pressure to hit metrics quickly\n\n**Goals:**\n- Master payer engagement basics\n- Build confidence in negotiations\n- Learn AI-assisted research\n- Develop territory strategy\n\n**Ideal AI Features:**\n- Payer 101 learning modules\n- Meeting preparation guides\n- AI mentor for questions\n- Best practice examples',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Payer Liaison: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_skeptic',
    'Margaret O''Brien - Payer Liaison Skeptic',
    E'**Role:** Payer Liaison\n**Archetype:** SKEPTIC\n**Tagline:** Relationship-Focused Traditionalist\n\n**Profile:**\n- Seniority: Senior Principal (18 years experience)\n- Education: PharmD\n- Geographic Scope: National Strategic Accounts\n- Organization Size: Large Pharma\n- Direct Reports: 0\n- Territory: Top 5 Payers\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Low)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-only)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 5/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain deep payer relationships\n- Protect relationship integrity\n- Preserve human judgment\n- Ensure trust with accounts\n\n**Top Frustrations:**\n- AI lacks relationship nuance\n- Pressure to use technology\n- Concerns about payer trust\n- Fear of depersonalization\n\n**Goals:**\n- Maintain relationship quality\n- Use AI only as backup\n- Ensure human oversight\n- Protect account trust\n\n**Required AI Features:**\n- Full human control\n- Never auto-communicate\n- Complete oversight\n- Easy override\n- Relationship protection',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 6: PRICING MANAGER - 4 PERSONAS
-- ============================================================================

-- Pricing Manager: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'pricing_manager_automator',
    'Jonathan Wright - Pricing Manager Automator',
    E'**Role:** Pricing Manager\n**Archetype:** AUTOMATOR\n**Tagline:** Data-Driven Pricing Efficiency\n\n**Profile:**\n- Seniority: Senior Manager (10 years experience)\n- Education: MBA, Finance Concentration\n- Geographic Scope: US\n- Organization Size: Top 20 Pharma\n- Direct Reports: 4\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 80/100 (High)\n- Work Complexity Score: 45/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Automate price scenario modeling\n- Streamline competitive monitoring\n- Reduce manual reporting\n- Enable faster decision support\n\n**Top Frustrations:**\n- Hours spent on pricing scenarios\n- Manual competitive tracking\n- Slow gross-to-net analysis\n- Inconsistent data formatting\n\n**Goals:**\n- Automate 70% of scenario modeling\n- Implement real-time competitive alerts\n- Deploy automated GTN analysis\n- Reduce reporting time by 60%\n\n**Tools Used:**\n- Excel/VBA, SSR Health, Pricing databases, PowerBI, Custom analytics',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Pricing Manager: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'pricing_manager_orchestrator',
    'Dr. Victoria Chen - Pricing Manager Orchestrator',
    E'**Role:** Pricing Manager\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Pricing Innovator\n\n**Profile:**\n- Seniority: Director (15 years experience)\n- Education: PhD Economics, MBA\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 10\n- Team Size: 30\n\n**AI Profile:**\n- AI Maturity Score: 90/100 (Very High)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 9/10\n- Actions: 10/10\n- Needs: 9/10\n- Emotions: 7/10\n- Scenarios: 10/10\n\n**Key Motivations:**\n- Build AI-powered pricing optimization\n- Pioneer predictive price modeling\n- Create global pricing intelligence\n- Lead pricing transformation\n\n**Top Frustrations:**\n- Multi-market complexity\n- Reference pricing challenges\n- Slow organizational change\n- Fragmented data systems\n\n**Goals:**\n- Build global pricing platform\n- Deploy predictive models\n- Create real-time monitoring\n- Train team on AI pricing\n\n**Tools Used:**\n- Custom AI platforms, ML pricing models, Global databases, Predictive analytics, Decision support',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Pricing Manager: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'pricing_manager_learner',
    'Nathan Davis - Pricing Manager Learner',
    E'**Role:** Pricing Manager\n**Archetype:** LEARNER\n**Tagline:** Emerging Pricing Analyst\n\n**Profile:**\n- Seniority: Manager (newly promoted)\n- Education: MBA, Healthcare Finance\n- Geographic Scope: US\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 2\n- Team Size: 4\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 38/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_ME\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Master pricing fundamentals\n- Build analytical skills\n- Understand GTN dynamics\n- Grow into senior role\n\n**Top Frustrations:**\n- Complex pricing regulations\n- Steep learning curve\n- Limited mentorship\n- Pressure for quick results\n\n**Goals:**\n- Master pricing strategy basics\n- Learn AI-assisted analysis\n- Build team management skills\n- Create pricing frameworks\n\n**Ideal AI Features:**\n- Pricing fundamentals tutorials\n- Scenario modeling templates\n- AI mentor for questions\n- Best practice library',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Pricing Manager: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'pricing_manager_skeptic',
    'Elizabeth Crawford - Pricing Manager Skeptic',
    E'**Role:** Pricing Manager\n**Archetype:** SKEPTIC\n**Tagline:** Risk-Aware Pricing Expert\n\n**Profile:**\n- Seniority: Senior Director (20 years experience)\n- Education: MBA, CPA\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 8\n- Team Size: 25\n\n**AI Profile:**\n- AI Maturity Score: 20/100 (Low)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Very Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-only)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 5/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Protect pricing integrity\n- Ensure regulatory compliance\n- Maintain financial accuracy\n- Avoid costly pricing errors\n\n**Top Frustrations:**\n- AI calculation errors\n- Pressure for AI adoption\n- Compliance concerns\n- Audit trail requirements\n\n**Goals:**\n- Establish pricing AI governance\n- Ensure complete human review\n- Maintain audit compliance\n- Build validation protocols\n\n**Required AI Features:**\n- Full calculation transparency\n- Mandatory human approval\n- Complete audit trails\n- Compliance verification\n- Easy error correction',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 7: VALUE & ACCESS MANAGER - 4 PERSONAS
-- ============================================================================

-- Value & Access Manager: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'value_access_manager_automator',
    'Amanda Foster - Value & Access Manager Automator',
    E'**Role:** Value & Access Manager\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Focused Value Strategy\n\n**Profile:**\n- Seniority: Senior Manager (9 years experience)\n- Education: PharmD, MS Outcomes Research\n- Geographic Scope: US\n- Organization Size: Top 20 Pharma\n- Direct Reports: 3\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 75/100 (High)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Automate value dossier creation\n- Streamline access strategy workflows\n- Reduce manual data synthesis\n- Enable faster value communication\n\n**Top Frustrations:**\n- Hours on value story development\n- Manual competitive analysis\n- Inconsistent dossier quality\n- Slow cross-functional alignment\n\n**Goals:**\n- Automate 60% of dossier prep\n- Implement AI value synthesis\n- Deploy automated access tracking\n- Reduce cycle time by 50%\n\n**Tools Used:**\n- HEOR databases, Literature tools, Value dossier platforms, CRM, PowerBI',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Value & Access Manager: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'value_access_manager_orchestrator',
    'Dr. Steven Park - Value & Access Manager Orchestrator',
    E'**Role:** Value & Access Manager\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Value Innovation Leader\n\n**Profile:**\n- Seniority: Director (14 years experience)\n- Education: PhD Health Economics, MBA\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 8\n- Team Size: 25\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform value communication through AI\n- Build predictive access models\n- Pioneer outcome-based value\n- Create global value intelligence\n\n**Top Frustrations:**\n- Multi-market complexity\n- Fragmented value data\n- Slow organizational change\n- Limited predictive insights\n\n**Goals:**\n- Build AI-powered value platform\n- Deploy predictive access models\n- Create real-time monitoring\n- Train team on AI value methods\n\n**Tools Used:**\n- Custom AI platforms, Advanced analytics, Global databases, Predictive models, Value tracking',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Value & Access Manager: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'value_access_manager_learner',
    'Jessica Liu - Value & Access Manager Learner',
    E'**Role:** Value & Access Manager\n**Archetype:** LEARNER\n**Tagline:** Emerging Value Strategy Professional\n\n**Profile:**\n- Seniority: Manager (newly promoted)\n- Education: MS Health Economics\n- Geographic Scope: US\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 2\n- Team Size: 5\n\n**AI Profile:**\n- AI Maturity Score: 40/100 (Low-Moderate)\n- Work Complexity Score: 35/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_ME\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 7/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Master value communication\n- Build strategic skills\n- Understand payer dynamics\n- Grow into senior role\n\n**Top Frustrations:**\n- Complex value proposition development\n- Limited mentorship\n- AI tool uncertainty\n- Pressure for quick results\n\n**Goals:**\n- Master value strategy basics\n- Learn AI-assisted analysis\n- Build team leadership skills\n- Create value frameworks\n\n**Ideal AI Features:**\n- Value strategy tutorials\n- Dossier templates\n- AI mentor for questions\n- Best practice library',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Value & Access Manager: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'value_access_manager_skeptic',
    'Dr. Helen Morrison - Value & Access Manager Skeptic',
    E'**Role:** Value & Access Manager\n**Archetype:** SKEPTIC\n**Tagline:** Evidence-Driven Value Traditionalist\n\n**Profile:**\n- Seniority: Senior Director (18 years experience)\n- Education: PhD Pharmacoeconomics\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 6\n- Team Size: 20\n\n**AI Profile:**\n- AI Maturity Score: 25/100 (Low)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-in-the-loop)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 5/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain evidence rigor\n- Protect value integrity\n- Preserve expert judgment\n- Ensure HTA acceptance\n\n**Top Frustrations:**\n- AI evidence errors\n- Pressure for AI use\n- Payer trust concerns\n- Audit trail requirements\n\n**Goals:**\n- Establish AI governance\n- Ensure human validation\n- Maintain audit compliance\n- Build validation protocols\n\n**Required AI Features:**\n- Full evidence verification\n- Mandatory human review\n- Complete audit trails\n- Transparency requirements\n- Easy corrections',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 8: PATIENT ACCESS MANAGER - 4 PERSONAS
-- ============================================================================

-- Patient Access Manager: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'patient_access_manager_automator',
    'Rebecca Turner - Patient Access Manager Automator',
    E'**Role:** Patient Access Manager\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Driven Patient Support\n\n**Profile:**\n- Seniority: Senior Manager (8 years experience)\n- Education: RN, MBA Healthcare\n- Geographic Scope: US\n- Organization Size: Large Pharma\n- Direct Reports: 5\n- Team Size: 15\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 40/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 9/10\n- Actions: 8/10\n- Needs: 7/10\n- Emotions: 7/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Automate patient enrollment processes\n- Streamline prior authorization\n- Reduce patient wait times\n- Enable team with AI tools\n\n**Top Frustrations:**\n- Manual enrollment processing\n- Slow prior authorization cycles\n- Inconsistent patient communication\n- High call volumes\n\n**Goals:**\n- Automate 70% of enrollment\n- Implement AI-powered PA support\n- Deploy automated follow-up\n- Reduce cycle time by 50%\n\n**Tools Used:**\n- Hub platforms, CRM, PA automation, Call center tools, Patient portals',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Patient Access Manager: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'patient_access_manager_orchestrator',
    'Dr. Maria Santos - Patient Access Manager Orchestrator',
    E'**Role:** Patient Access Manager\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Patient Experience Leader\n\n**Profile:**\n- Seniority: Director (15 years experience)\n- Education: PharmD, MPH\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 10\n- Team Size: 50\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 8/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform patient experience through AI\n- Build predictive access barriers\n- Pioneer personalized support\n- Create global patient intelligence\n\n**Top Frustrations:**\n- Fragmented patient journey data\n- Unpredictable access barriers\n- Slow organizational change\n- Limited proactive support\n\n**Goals:**\n- Build AI-powered patient platform\n- Deploy predictive barrier models\n- Create personalized journeys\n- Train team on AI support\n\n**Tools Used:**\n- Custom AI platforms, Patient analytics, CRM, Predictive models, Journey mapping',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Patient Access Manager: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'patient_access_manager_learner',
    'Ashley Williams - Patient Access Manager Learner',
    E'**Role:** Patient Access Manager\n**Archetype:** LEARNER\n**Tagline:** Emerging Patient Support Leader\n\n**Profile:**\n- Seniority: Manager (newly promoted)\n- Education: BS Healthcare Admin\n- Geographic Scope: Regional\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 3\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 42/100 (Low-Moderate)\n- Work Complexity Score: 35/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate-High\n- Preferred Service Layer: ASK_ME\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 5/10\n- Emotions: 8/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Master patient support operations\n- Build program management skills\n- Learn AI-assisted support\n- Grow into senior role\n\n**Top Frustrations:**\n- Complex payer requirements\n- Limited training resources\n- AI tool uncertainty\n- High patient expectations\n\n**Goals:**\n- Master patient support basics\n- Learn AI-assisted operations\n- Build team leadership skills\n- Create support frameworks\n\n**Ideal AI Features:**\n- Patient support tutorials\n- Process templates\n- AI mentor for questions\n- Best practice library',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Patient Access Manager: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'patient_access_manager_skeptic',
    'Katherine Johnson - Patient Access Manager Skeptic',
    E'**Role:** Patient Access Manager\n**Archetype:** SKEPTIC\n**Tagline:** Patient-First Traditionalist\n\n**Profile:**\n- Seniority: Senior Director (20 years experience)\n- Education: RN, MSN, MBA\n- Geographic Scope: National\n- Organization Size: Large Pharma\n- Direct Reports: 8\n- Team Size: 30\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Low)\n- Work Complexity Score: 75/100 (Complex)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-only)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 6/10\n- Emotions: 5/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Protect patient relationships\n- Maintain human touch\n- Ensure empathetic support\n- Preserve trust\n\n**Top Frustrations:**\n- AI lacks empathy\n- Pressure to automate\n- HIPAA concerns\n- Patient depersonalization fears\n\n**Goals:**\n- Maintain human-first approach\n- Use AI only as backup\n- Ensure patient privacy\n- Protect relationship quality\n\n**Required AI Features:**\n- Full human control\n- Never auto-communicate\n- HIPAA compliance\n- Easy override\n- Human escalation always',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ADDITIONAL MARKET ACCESS ROLES (abbreviated format for remaining roles)
-- ============================================================================

-- HEOR Analyst: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('heor_analyst_automator', 'Alex Chen - HEOR Analyst Automator', E'**Role:** HEOR Analyst\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (75/100)\n**Work Complexity:** Low-Moderate (30/100)\n**Focus:** Automate literature screening, data extraction, systematic reviews\n**Tools:** Covidence, R, Excel, Literature databases', true, NOW(), NOW()),
('heor_analyst_orchestrator', 'Dr. Priya Sharma - HEOR Analyst Orchestrator', E'**Role:** HEOR Analyst\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate-High (65/100)\n**Focus:** Build AI-powered evidence platforms, predictive modeling, innovative methods\n**Tools:** Python/ML, Advanced analytics, Custom platforms', true, NOW(), NOW()),
('heor_analyst_learner', 'Jordan Mitchell - HEOR Analyst Learner', E'**Role:** HEOR Analyst\n**Archetype:** LEARNER\n**AI Maturity:** Low (35/100)\n**Work Complexity:** Low (25/100)\n**Focus:** Master HEOR fundamentals, economic modeling basics, build technical skills\n**Ideal Features:** Step-by-step tutorials, templates, AI mentor', true, NOW(), NOW()),
('heor_analyst_skeptic', 'Dr. Richard Brown - HEOR Analyst Skeptic', E'**Role:** HEOR Analyst\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (20/100)\n**Work Complexity:** High (70/100)\n**Focus:** Maintain methodological rigor, ensure statistical validity, human oversight\n**Requirements:** Full transparency, expert validation, audit trails', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Payer Relations Manager: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('payer_relations_manager_automator', 'Sarah Lee - Payer Relations Manager Automator', E'**Role:** Payer Relations Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate payer intelligence, streamline account planning, automated reporting\n**Tools:** CRM, MMIT, Analytics platforms', true, NOW(), NOW()),
('payer_relations_manager_orchestrator', 'Dr. Michael Torres - Payer Relations Manager Orchestrator', E'**Role:** Payer Relations Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (80/100)\n**Focus:** Build predictive payer engagement, AI-powered account strategy, relationship intelligence\n**Tools:** Custom AI, Predictive analytics, Advanced CRM', true, NOW(), NOW()),
('payer_relations_manager_learner', 'Emma Davis - Payer Relations Manager Learner', E'**Role:** Payer Relations Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Master payer dynamics, build negotiation skills, learn AI-assisted research\n**Ideal Features:** Training modules, templates, AI mentor', true, NOW(), NOW()),
('payer_relations_manager_skeptic', 'Patricia Anderson - Payer Relations Manager Skeptic', E'**Role:** Payer Relations Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (75/100)\n**Focus:** Maintain relationship quality, preserve human judgment, protect payer trust\n**Requirements:** Human control, never auto-communicate, relationship protection', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Payer Strategy Lead: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('payer_strategy_lead_automator', 'Daniel Kim - Payer Strategy Lead Automator', E'**Role:** Payer Strategy Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate strategy development, competitive monitoring, scenario modeling\n**Tools:** Analytics platforms, Strategy tools, PowerBI', true, NOW(), NOW()),
('payer_strategy_lead_orchestrator', 'Dr. Lisa Huang - Payer Strategy Lead Orchestrator', E'**Role:** Payer Strategy Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** High (85/100)\n**Focus:** Build AI-powered strategy platform, predictive payer models, transformation leadership\n**Tools:** Custom AI, Predictive analytics, Multi-agent systems', true, NOW(), NOW()),
('payer_strategy_lead_learner', 'Ryan Johnson - Payer Strategy Lead Learner', E'**Role:** Payer Strategy Lead\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master payer strategy, build analytical skills, learn AI-assisted planning\n**Ideal Features:** Strategy tutorials, templates, AI mentor', true, NOW(), NOW()),
('payer_strategy_lead_skeptic', 'Dr. William Scott - Payer Strategy Lead Skeptic', E'**Role:** Payer Strategy Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (80/100)\n**Focus:** Maintain strategic rigor, ensure evidence quality, human oversight required\n**Requirements:** Full transparency, expert validation, audit trails', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Reimbursement Manager: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('reimbursement_manager_automator', 'Jennifer Wright - Reimbursement Manager Automator', E'**Role:** Reimbursement Manager\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (75/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate reimbursement tracking, policy monitoring, coding analysis\n**Tools:** Coding platforms, Policy databases, Analytics', true, NOW(), NOW()),
('reimbursement_manager_orchestrator', 'Dr. David Chen - Reimbursement Manager Orchestrator', E'**Role:** Reimbursement Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build predictive reimbursement models, policy intelligence, coverage optimization\n**Tools:** Custom AI, Predictive analytics, Policy platforms', true, NOW(), NOW()),
('reimbursement_manager_learner', 'Michelle Thompson - Reimbursement Manager Learner', E'**Role:** Reimbursement Manager\n**Archetype:** LEARNER\n**AI Maturity:** Low (35/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Master reimbursement fundamentals, learn coding systems, build analytical skills\n**Ideal Features:** Coding tutorials, templates, AI mentor', true, NOW(), NOW()),
('reimbursement_manager_skeptic', 'Robert Miller - Reimbursement Manager Skeptic', E'**Role:** Reimbursement Manager\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (75/100)\n**Focus:** Maintain coding accuracy, ensure compliance, human validation required\n**Requirements:** Full audit trails, expert review, compliance verification', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- HTA Access Lead: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('hta_access_lead_automator', 'Dr. Catherine Park - HTA Access Lead Automator', E'**Role:** HTA Access Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate-High (50/100)\n**Focus:** Automate HTA dossier preparation, template generation, submission tracking\n**Tools:** HTA databases, Dossier platforms, Analytics', true, NOW(), NOW()),
('hta_access_lead_orchestrator', 'Prof. Andreas Mueller - HTA Access Lead Orchestrator', E'**Role:** HTA Access Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** Strategic (88/100)\n**Focus:** Build AI-powered HTA intelligence, predictive assessment models, global submission optimization\n**Tools:** Custom AI, Multi-country analytics, Predictive platforms', true, NOW(), NOW()),
('hta_access_lead_learner', 'Dr. Emily Garcia - HTA Access Lead Learner', E'**Role:** HTA Access Lead\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (42/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master HTA requirements, learn multi-country submissions, build strategic skills\n**Ideal Features:** HTA tutorials, country-specific templates, AI mentor', true, NOW(), NOW()),
('hta_access_lead_skeptic', 'Prof. Margaret Wilson - HTA Access Lead Skeptic', E'**Role:** HTA Access Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Very Low (18/100)\n**Work Complexity:** High (85/100)\n**Focus:** Maintain evidence rigor, ensure HTA body acceptance, methodological purity\n**Requirements:** Complete transparency, peer validation, conservative methods', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Access Data Scientist: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('access_data_scientist_automator', 'Kevin Zhang - Access Data Scientist Automator', E'**Role:** Access Data Scientist\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate data pipelines, model deployment, reporting automation\n**Tools:** Python, SQL, ML platforms, Cloud computing', true, NOW(), NOW()),
('access_data_scientist_orchestrator', 'Dr. Sarah Patel - Access Data Scientist Orchestrator', E'**Role:** Access Data Scientist\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (95/100)\n**Work Complexity:** High (85/100)\n**Focus:** Build advanced ML models, predictive access analytics, real-time intelligence systems\n**Tools:** Deep learning, Advanced ML, Cloud AI, Custom platforms', true, NOW(), NOW()),
('access_data_scientist_learner', 'James Wilson - Access Data Scientist Learner', E'**Role:** Access Data Scientist\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master pharma data science, learn access-specific analytics, build ML skills\n**Ideal Features:** Pharma DS tutorials, project templates, ML mentorship', true, NOW(), NOW()),
('access_data_scientist_skeptic', 'Dr. Thomas Brown - Access Data Scientist Skeptic', E'**Role:** Access Data Scientist\n**Archetype:** SKEPTIC\n**AI Maturity:** Moderate (50/100)\n**Work Complexity:** High (75/100)\n**Focus:** Ensure model validity, statistical rigor, interpretable models only\n**Requirements:** Full explainability, validation protocols, uncertainty quantification', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Payer Evidence Lead: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('payer_evidence_lead_automator', 'Dr. Amanda Ross - Payer Evidence Lead Automator', E'**Role:** Payer Evidence Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate evidence synthesis, payer dossier generation, literature monitoring\n**Tools:** Evidence platforms, Literature tools, Analytics', true, NOW(), NOW()),
('payer_evidence_lead_orchestrator', 'Dr. Christopher Lee - Payer Evidence Lead Orchestrator', E'**Role:** Payer Evidence Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** High (82/100)\n**Focus:** Build AI-powered evidence platform, real-time payer intelligence, predictive evidence needs\n**Tools:** Custom AI, Advanced analytics, Prediction systems', true, NOW(), NOW()),
('payer_evidence_lead_learner', 'Nicole Martinez - Payer Evidence Lead Learner', E'**Role:** Payer Evidence Lead\n**Archetype:** LEARNER\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master evidence requirements, learn payer needs, build analytical skills\n**Ideal Features:** Evidence tutorials, payer-specific templates, AI mentor', true, NOW(), NOW()),
('payer_evidence_lead_skeptic', 'Dr. Elizabeth Taylor - Payer Evidence Lead Skeptic', E'**Role:** Payer Evidence Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain evidence quality, ensure payer acceptance, rigorous methodology\n**Requirements:** Full validation, expert review, complete audit trails', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Value & Pricing Analyst: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('value_pricing_analyst_automator', 'Michael Chen - Value & Pricing Analyst Automator', E'**Role:** Value & Pricing Analyst\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (75/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Automate pricing scenarios, competitive tracking, GTN analysis\n**Tools:** Excel, Pricing platforms, Analytics tools', true, NOW(), NOW()),
('value_pricing_analyst_orchestrator', 'Dr. Jennifer Liu - Value & Pricing Analyst Orchestrator', E'**Role:** Value & Pricing Analyst\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (75/100)\n**Focus:** Build predictive pricing models, global value optimization, AI-driven strategy\n**Tools:** ML platforms, Custom analytics, Predictive systems', true, NOW(), NOW()),
('value_pricing_analyst_learner', 'David Kim - Value & Pricing Analyst Learner', E'**Role:** Value & Pricing Analyst\n**Archetype:** LEARNER\n**AI Maturity:** Low (35/100)\n**Work Complexity:** Low-Moderate (30/100)\n**Focus:** Master pricing fundamentals, learn GTN analysis, build analytical skills\n**Ideal Features:** Pricing tutorials, templates, AI mentor', true, NOW(), NOW()),
('value_pricing_analyst_skeptic', 'Sandra Wilson - Value & Pricing Analyst Skeptic', E'**Role:** Value & Pricing Analyst\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (22/100)\n**Work Complexity:** High (72/100)\n**Focus:** Ensure calculation accuracy, maintain compliance, human validation\n**Requirements:** Full audit trails, expert review, compliance verification', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Market Access Personas: 76
-- Roles covered: 19 core Market Access role types
-- Archetypes: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC (4 each)
--
-- Key characteristics by archetype:
-- AUTOMATOR: High AI maturity, moderate complexity, workflow-focused
-- ORCHESTRATOR: Very high AI maturity, high complexity, strategic transformation
-- LEARNER: Low AI maturity, low-moderate complexity, skill-building focus
-- SKEPTIC: Low AI maturity, high complexity, governance and validation focus
-- ============================================================================

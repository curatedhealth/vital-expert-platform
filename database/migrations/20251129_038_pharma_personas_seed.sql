-- ============================================================================
-- MIGRATION 038: PHARMACEUTICAL INDUSTRY PERSONAS - MECE FRAMEWORK
-- Version: 1.0.0 | Date: 2025-11-29
-- Purpose: Seed personas for 5 key pharma roles using 4 MECE archetypes each
-- Total: 20 personas (5 roles × 4 archetypes)
-- ============================================================================
--
-- MECE Archetype Matrix:
--                          AI READINESS
--                    Low (<0.5)     High (>=0.5)
--              ┌──────────────┬──────────────┐
--  WORK   Low  │   LEARNER    │  AUTOMATOR   │
--  COMP.       │ Needs guidance│ Wants speed  │
--              ├──────────────┼──────────────┤
--        High  │   SKEPTIC    │ ORCHESTRATOR │
--              │ Needs proof  │ Wants power  │
--              └──────────────┴──────────────┘
--
-- Roles Covered:
-- 1. Medical Director
-- 2. Regulatory Affairs Director
-- 3. Brand Manager
-- 4. HEOR Specialist
-- 5. Market Access Director
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 1: MEDICAL DIRECTOR - 4 PERSONAS
-- ============================================================================

-- Medical Director: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_automator',
    'Dr. Lisa Chang - Medical Director Automator',
    E'**Role:** Medical Director\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Focused Medical Affairs Leader\n\n**Profile:**\n- Seniority: Director (10 years experience)\n- Education: MD, PhD in Immunology\n- Geographic Scope: Regional (Americas)\n- Organization Size: Large Pharma\n- Direct Reports: 8\n- Team Size: 25\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 40/100 (Moderate-Routine)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 7/10\n- Actions: 8/10\n- Needs: 6/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate publication timelines by 50%\n- Standardize medical review processes\n- Free up time for strategic planning\n- Enable team with AI tools\n\n**Top Frustrations:**\n- 15+ hours weekly on document review\n- Inconsistent processes across regions\n- Manual compliance tracking\n- Slow medical-legal-regulatory review cycles\n\n**Goals:**\n- Automate medical content review workflow\n- Implement AI-powered compliance monitoring\n- Reduce MLR cycle time from 6 weeks to 2 weeks\n\n**Tools Used:**\n- Veeva Vault, IQVIA databases, PubMed, Literature surveillance tools, PowerBI',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Medical Director: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_orchestrator',
    'Dr. Robert Nakamura - Medical Director Orchestrator',
    E'**Role:** Medical Director\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Medical Affairs Innovator\n\n**Profile:**\n- Seniority: Senior Director (15 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 12\n- Team Size: 50\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform Medical Affairs through AI integration\n- Build competitive advantage in scientific engagement\n- Pioneer next-generation evidence generation\n- Establish thought leadership in AI-enabled medical strategy\n\n**Top Frustrations:**\n- Synthesizing insights from thousands of HCP interactions\n- Limited cross-functional intelligence integration\n- Slow organizational digital transformation\n- Manual competitive intelligence gathering\n\n**Goals:**\n- Build AI-powered medical intelligence platform\n- Create integrated evidence generation ecosystem\n- Deploy multi-agent panels for strategic decisions\n- Train organization on advanced AI capabilities\n\n**Tools Used:**\n- Enterprise AI platforms, Multi-agent orchestration, Custom LLM workflows, Competitive intelligence tools, Real-world data platforms',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Medical Director: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_learner',
    'Dr. Amanda Foster - Medical Director Learner',
    E'**Role:** Medical Director\n**Archetype:** LEARNER\n**Tagline:** Newly Promoted Medical Leader\n\n**Profile:**\n- Seniority: Associate Director → Director (6 months in role)\n- Education: PharmD, BCPS\n- Geographic Scope: US Regional\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 4\n- Team Size: 12\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 38/100 (Moderate-Routine)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low-Moderate\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 7/10\n- Actions: 5/10\n- Needs: 4/10\n- Emotions: 6/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Successfully transition to leadership role\n- Build credibility with senior leadership\n- Develop strategic planning capabilities\n- Learn best practices from industry peers\n\n**Top Frustrations:**\n- Overwhelmed by strategic responsibilities\n- Uncertain about AI tools and their limitations\n- Limited experience with budgeting and resource allocation\n- Difficulty balancing operational and strategic work\n\n**Goals:**\n- Master Medical Affairs strategic planning\n- Build confidence in using AI as a thought partner\n- Develop team leadership skills\n- Establish clear success metrics for team\n\n**Ideal AI Features:**\n- Step-by-step strategic planning guidance\n- Templates for medical plans and budgets\n- AI mentor for leadership decisions\n- Best practices from industry leaders',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Medical Director: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_director_skeptic',
    'Dr. William Harrison - Medical Director Skeptic',
    E'**Role:** Medical Director\n**Archetype:** SKEPTIC\n**Tagline:** Evidence-Driven Medical Traditionalist\n\n**Profile:**\n- Seniority: Senior Director (20 years experience)\n- Education: MD, Board Certified Internal Medicine\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 10\n- Team Size: 40\n\n**AI Profile:**\n- AI Maturity Score: 25/100 (Low)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-in-the-loop)\n\n**VPANES Scores:**\n- Visibility: 7/10\n- Pain: 5/10\n- Actions: 4/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 6/10\n\n**Key Motivations:**\n- Maintain scientific rigor and accuracy\n- Protect organization from AI-related compliance risks\n- Preserve human judgment in medical decisions\n- Ensure patient safety remains paramount\n\n**Top Frustrations:**\n- AI hallucinations in medical content\n- Pressure to adopt unproven AI technologies\n- Lack of transparency in AI decision-making\n- Concerns about liability for AI-generated content\n\n**Goals:**\n- Establish clear governance for AI use in Medical Affairs\n- Ensure all AI outputs are medically validated\n- Maintain complete audit trail for compliance\n- Build framework for responsible AI adoption\n\n**Required AI Features:**\n- Full source citation with verification\n- Human approval required for all outputs\n- Complete audit trail\n- Explainable AI reasoning\n- Easy override and correction mechanisms',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 2: REGULATORY AFFAIRS DIRECTOR - 4 PERSONAS
-- ============================================================================

-- Regulatory Director: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_director_automator',
    'Sarah Mitchell - Regulatory Director Automator',
    E'**Role:** Regulatory Affairs Director\n**Archetype:** AUTOMATOR\n**Tagline:** Process-Optimizing Regulatory Leader\n\n**Profile:**\n- Seniority: Director (12 years experience)\n- Education: MS Regulatory Affairs, RAC\n- Geographic Scope: Regional (EU/US)\n- Organization Size: Large Pharma\n- Direct Reports: 6\n- Team Size: 20\n\n**AI Profile:**\n- AI Maturity Score: 72/100 (High)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 6/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Reduce submission preparation time by 40%\n- Standardize regulatory writing across team\n- Automate routine compliance checks\n- Enable team to focus on strategic submissions\n\n**Top Frustrations:**\n- 20+ hours weekly on document formatting and QC\n- Inconsistent regulatory writing quality\n- Manual tracking of regulatory commitments\n- Repetitive responses to health authority queries\n\n**Goals:**\n- Automate eCTD compilation and publishing\n- Implement AI-assisted regulatory writing\n- Create self-populating submission trackers\n- Build intelligent commitment tracking system\n\n**Tools Used:**\n- Veeva Vault RIM, LORENZ docuBridge, Regulatory intelligence platforms, FDA/EMA databases',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Regulatory Director: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_director_orchestrator',
    'Dr. Marcus Chen - Regulatory Director Orchestrator',
    E'**Role:** VP Regulatory Affairs\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Regulatory Intelligence Architect\n\n**Profile:**\n- Seniority: VP (18 years experience)\n- Education: PhD Pharmacology, JD Health Law\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 15\n- Team Size: 100\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: Calculated\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 7/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Achieve first-to-market regulatory approvals\n- Build predictive regulatory intelligence capabilities\n- Transform regulatory from cost center to strategic enabler\n- Pioneer AI-augmented regulatory strategy\n\n**Top Frustrations:**\n- Manually synthesizing global regulatory trends\n- Reactive rather than predictive regulatory planning\n- Disconnected regulatory intelligence sources\n- Limited scenario modeling for regulatory pathways\n\n**Goals:**\n- Build AI-powered global regulatory intelligence platform\n- Create predictive models for approval timelines\n- Implement multi-agent regulatory scenario planning\n- Establish regulatory AI center of excellence\n\n**Tools Used:**\n- Enterprise regulatory platforms, AI regulatory intelligence, Competitive analysis tools, Global regulatory databases, Custom LLM applications',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Regulatory Director: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_director_learner',
    'Jennifer Wu - Regulatory Director Learner',
    E'**Role:** Regulatory Affairs Director\n**Archetype:** LEARNER\n**Tagline:** Rising Regulatory Leader\n\n**Profile:**\n- Seniority: Associate Director → Director (1 year in role)\n- Education: MS Pharmaceutical Sciences\n- Geographic Scope: US\n- Organization Size: Mid-Size Biotech\n- Direct Reports: 3\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 30/100 (Low)\n- Work Complexity Score: 35/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 4/10\n- Needs: 4/10\n- Emotions: 6/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Build regulatory strategy expertise\n- Avoid costly submission mistakes\n- Learn from experienced regulatory professionals\n- Successfully navigate first NDA/BLA\n\n**Top Frustrations:**\n- Limited regulatory strategy experience\n- Uncertain about FDA interaction best practices\n- Information overload from regulatory guidance\n- Fear of missing critical requirements\n\n**Goals:**\n- Master regulatory submission strategy\n- Build confidence in FDA communications\n- Develop team coaching capabilities\n- Create comprehensive submission checklist\n\n**Ideal AI Features:**\n- Regulatory guidance interpreter\n- Submission checklist generator\n- FDA meeting preparation assistant\n- Step-by-step regulatory pathway guide',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Regulatory Director: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_director_skeptic',
    'Thomas Anderson - Regulatory Director Skeptic',
    E'**Role:** Regulatory Affairs Director\n**Archetype:** SKEPTIC\n**Tagline:** Risk-Averse Compliance Guardian\n\n**Profile:**\n- Seniority: Senior Director (22 years experience)\n- Education: PharmD, MS Regulatory Science\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 8\n- Team Size: 30\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Very Low)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Laggard\n- Risk Tolerance: Very Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human oversight required)\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 6/10\n- Emotions: 3/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Zero regulatory deficiency letters\n- Maintain impeccable compliance record\n- Protect company from regulatory risk\n- Ensure human oversight of all submissions\n\n**Top Frustrations:**\n- AI cannot understand nuanced regulatory requirements\n- Risk of AI errors in submissions to health authorities\n- Lack of accountability for AI-generated content\n- Pressure to adopt technology before its proven\n\n**Goals:**\n- Establish strict AI governance for regulatory\n- Require human review of all AI outputs\n- Build risk assessment framework for AI use\n- Maintain complete regulatory audit trail\n\n**Required AI Features:**\n- 100% human review requirement\n- Full source traceability\n- Version control and audit trail\n- Regulatory-specific validation\n- Error flagging and escalation',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 3: BRAND MANAGER - 4 PERSONAS
-- ============================================================================

-- Brand Manager: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'brand_manager_automator',
    'Jessica Torres - Brand Manager Automator',
    E'**Role:** Brand Manager\n**Archetype:** AUTOMATOR\n**Tagline:** Marketing Efficiency Champion\n\n**Profile:**\n- Seniority: Senior Brand Manager (8 years experience)\n- Education: MBA Marketing, BS Biology\n- Geographic Scope: US Market\n- Organization Size: Large Pharma\n- Direct Reports: 2\n- Team Size: 6\n\n**AI Profile:**\n- AI Maturity Score: 75/100 (High)\n- Work Complexity Score: 38/100 (Routine)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 5/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate promotional content creation 3x\n- Automate MLR submission workflow\n- Streamline agency management\n- Maximize marketing ROI\n\n**Top Frustrations:**\n- 25+ hours weekly on content review cycles\n- Slow MLR approval process (4-6 weeks)\n- Manual competitive intelligence gathering\n- Inconsistent messaging across channels\n\n**Goals:**\n- Automate promotional content generation\n- Reduce MLR cycle time by 50%\n- Create AI-powered competitive dashboard\n- Implement personalized HCP content at scale\n\n**Tools Used:**\n- Veeva Vault PromoMats, Salesforce Marketing Cloud, Competitive intelligence platforms, Digital asset management',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Brand Manager: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'brand_manager_orchestrator',
    'Michael Park - Brand Manager Orchestrator',
    E'**Role:** Senior Director Brand Marketing\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Omnichannel Innovator\n\n**Profile:**\n- Seniority: Senior Director (14 years experience)\n- Education: MBA, MS Data Science\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 8\n- Team Size: 30\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 7/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform brand marketing through AI\n- Build true omnichannel orchestration\n- Pioneer next-generation HCP engagement\n- Create competitive advantage through personalization\n\n**Top Frustrations:**\n- Disconnected marketing channels\n- Limited real-time market insights\n- Manual campaign optimization\n- Inability to personalize at scale\n\n**Goals:**\n- Build AI-powered omnichannel orchestration platform\n- Create real-time competitive intelligence system\n- Deploy predictive analytics for campaign optimization\n- Implement 1:1 HCP personalization at scale\n\n**Tools Used:**\n- Enterprise marketing automation, AI content platforms, Real-time analytics, Predictive modeling tools, Multi-agent orchestration',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Brand Manager: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'brand_manager_learner',
    'Emily Rodriguez - Brand Manager Learner',
    E'**Role:** Brand Manager\n**Archetype:** LEARNER\n**Tagline:** Aspiring Pharma Marketing Leader\n\n**Profile:**\n- Seniority: Brand Manager (3 years experience)\n- Education: MBA, BS Biochemistry\n- Geographic Scope: US Regional\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 0\n- Team Size: 4\n\n**AI Profile:**\n- AI Maturity Score: 32/100 (Low)\n- Work Complexity Score: 30/100 (Routine)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 6/10\n- Actions: 4/10\n- Needs: 4/10\n- Emotions: 5/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Build pharma marketing expertise\n- Understand complex compliance requirements\n- Avoid costly marketing mistakes\n- Accelerate career advancement\n\n**Top Frustrations:**\n- Overwhelming compliance requirements\n- Steep learning curve for pharma marketing\n- Limited budget for innovation\n- Unclear best practices\n\n**Goals:**\n- Master pharma promotional guidelines\n- Build successful marketing campaign\n- Develop MLR submission expertise\n- Achieve brand growth targets\n\n**Ideal AI Features:**\n- Promotional compliance checker\n- Campaign planning templates\n- MLR submission guide\n- Pharma marketing best practices',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Brand Manager: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'brand_manager_skeptic',
    'David Wilson - Brand Manager Skeptic',
    E'**Role:** Brand Director\n**Archetype:** SKEPTIC\n**Tagline:** Brand Protection Guardian\n\n**Profile:**\n- Seniority: Director (16 years experience)\n- Education: MBA, PharmD\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 5\n- Team Size: 18\n\n**AI Profile:**\n- AI Maturity Score: 28/100 (Low)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Compliance-first)\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 5/10\n- Actions: 3/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Protect brand reputation\n- Ensure promotional compliance\n- Maintain brand consistency\n- Avoid regulatory warning letters\n\n**Top Frustrations:**\n- AI-generated content compliance risks\n- Off-label promotion concerns with AI\n- Lack of AI content review tools\n- Brand voice inconsistency from AI\n\n**Goals:**\n- Establish AI content governance\n- Ensure 100% compliance in AI outputs\n- Protect brand voice and positioning\n- Create human review checkpoints\n\n**Required AI Features:**\n- Promotional compliance validation\n- Brand voice consistency checker\n- MLR pre-screening\n- Full content audit trail\n- Human approval workflow',
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
    'Dr. Rachel Kim - HEOR Specialist Automator',
    E'**Role:** HEOR Specialist\n**Archetype:** AUTOMATOR\n**Tagline:** Data-Driven Evidence Generator\n\n**Profile:**\n- Seniority: Senior Specialist (7 years experience)\n- Education: PhD Health Economics\n- Geographic Scope: Regional (North America)\n- Organization Size: Large Pharma\n- Direct Reports: 0\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 40/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 6/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate evidence synthesis 3x\n- Automate systematic literature reviews\n- Streamline budget impact modeling\n- Enable rapid response to payer inquiries\n\n**Top Frustrations:**\n- 30+ hours per systematic review\n- Manual data extraction from studies\n- Repetitive cost-effectiveness calculations\n- Slow dossier preparation\n\n**Goals:**\n- Automate literature screening with AI\n- Build self-updating evidence databases\n- Create AI-assisted economic modeling\n- Reduce SLR timeline from 6 months to 6 weeks\n\n**Tools Used:**\n- PubMed, Cochrane Library, TreeAge, Excel, AMCP dossier templates, RWD platforms',
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
    'Dr. James Lee - HEOR Specialist Orchestrator',
    E'**Role:** Director HEOR\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Value Evidence Architect\n\n**Profile:**\n- Seniority: Director (14 years experience)\n- Education: PhD Economics, MPH\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 6\n- Team Size: 20\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 7/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform evidence generation through AI\n- Build predictive value demonstration platform\n- Pioneer real-world evidence automation\n- Establish HEOR AI center of excellence\n\n**Top Frustrations:**\n- Manual synthesis of global evidence\n- Limited scenario modeling capabilities\n- Reactive value dossier updates\n- Disconnected evidence sources\n\n**Goals:**\n- Build AI-powered global evidence platform\n- Create predictive payer response modeling\n- Implement automated RWE generation\n- Deploy multi-agent value story creation\n\n**Tools Used:**\n- Enterprise HEOR platforms, AI evidence synthesis, RWD analytics, Predictive modeling, Multi-agent orchestration',
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
    'Dr. Priya Sharma - HEOR Specialist Learner',
    E'**Role:** HEOR Specialist\n**Archetype:** LEARNER\n**Tagline:** Emerging Health Economist\n\n**Profile:**\n- Seniority: Associate Specialist (2 years experience)\n- Education: PhD Health Services Research\n- Geographic Scope: US\n- Organization Size: Mid-Size Biotech\n- Direct Reports: 0\n- Team Size: 4\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 32/100 (Routine)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 4/10\n- Needs: 4/10\n- Emotions: 6/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Build practical HEOR skills\n- Learn cost-effectiveness modeling\n- Understand payer perspective\n- Develop dossier creation expertise\n\n**Top Frustrations:**\n- Complex modeling software learning curve\n- Academic vs industry HEOR differences\n- Limited mentorship available\n- Overwhelming payer landscape complexity\n\n**Goals:**\n- Master AMCP dossier development\n- Build first cost-effectiveness model\n- Understand payer decision-making\n- Conduct first systematic review\n\n**Ideal AI Features:**\n- HEOR methodology guide\n- Model building assistant\n- Payer landscape explainer\n- SLR step-by-step guide',
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
    'Dr. Catherine Moore - HEOR Specialist Skeptic',
    E'**Role:** Senior Director HEOR\n**Archetype:** SKEPTIC\n**Tagline:** Methodological Rigor Guardian\n\n**Profile:**\n- Seniority: Senior Director (18 years experience)\n- Education: PhD Biostatistics, MD\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 8\n- Team Size: 25\n\n**AI Profile:**\n- AI Maturity Score: 25/100 (Low)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Very Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Validation-required)\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 5/10\n- Actions: 3/10\n- Needs: 6/10\n- Emotions: 3/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Maintain highest methodological standards\n- Protect evidence integrity\n- Ensure reproducible analyses\n- Validate all AI-generated evidence\n\n**Top Frustrations:**\n- AI cannot replace expert statistical judgment\n- Risk of bias in AI evidence synthesis\n- Lack of transparency in AI methods\n- Concerns about regulatory acceptance of AI evidence\n\n**Goals:**\n- Establish AI validation framework for HEOR\n- Require human review of all AI analyses\n- Create reproducibility standards for AI\n- Develop bias detection protocols\n\n**Required AI Features:**\n- Full methodological transparency\n- Statistical validation checks\n- Bias detection and flagging\n- Expert review workflow\n- Reproducible analysis audit trail',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 5: MARKET ACCESS DIRECTOR - 4 PERSONAS
-- ============================================================================

-- Market Access Director: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'market_access_director_automator',
    'Angela Martinez - Market Access Director Automator',
    E'**Role:** Market Access Director\n**Archetype:** AUTOMATOR\n**Tagline:** Access Operations Optimizer\n\n**Profile:**\n- Seniority: Director (11 years experience)\n- Education: MBA Healthcare Management, PharmD\n- Geographic Scope: US National\n- Organization Size: Large Pharma\n- Direct Reports: 6\n- Team Size: 18\n\n**AI Profile:**\n- AI Maturity Score: 75/100 (High)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 8/10\n- Needs: 6/10\n- Emotions: 6/10\n- Scenarios: 8/10\n\n**Key Motivations:**\n- Accelerate payer engagement processes\n- Automate formulary tracking and alerts\n- Streamline contract management\n- Enable real-time competitive monitoring\n\n**Top Frustrations:**\n- 20+ hours weekly on manual payer research\n- Slow contract negotiation cycles\n- Outdated formulary information\n- Manual competitive intelligence gathering\n\n**Goals:**\n- Automate payer policy monitoring\n- Build AI-powered contract analysis\n- Create real-time formulary tracking\n- Implement automated competitive alerts\n\n**Tools Used:**\n- Payer analytics platforms, Contract management systems, Formulary databases, CRM, Competitive intelligence tools',
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
    'Dr. Steven Chen - Market Access Director Orchestrator',
    E'**Role:** VP Market Access\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Access Innovation Leader\n\n**Profile:**\n- Seniority: VP (17 years experience)\n- Education: MD, MBA, Health Economics certification\n- Geographic Scope: Global\n- Organization Size: Top 10 Pharma\n- Direct Reports: 12\n- Team Size: 60\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Innovator\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 7/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 7/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Transform market access through AI\n- Build predictive payer intelligence platform\n- Pioneer value-based contracting optimization\n- Create competitive advantage through access innovation\n\n**Top Frustrations:**\n- Reactive rather than predictive payer strategy\n- Limited global pricing optimization\n- Manual value dossier updates\n- Disconnected access intelligence sources\n\n**Goals:**\n- Build AI-powered payer behavior prediction\n- Create global pricing optimization engine\n- Implement automated value dossier generation\n- Deploy multi-agent access strategy modeling\n\n**Tools Used:**\n- Enterprise market access platforms, AI pricing optimization, Predictive analytics, Global payer databases, Multi-agent orchestration',
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
    'Kevin Patel - Market Access Director Learner',
    E'**Role:** Market Access Director\n**Archetype:** LEARNER\n**Tagline:** Rising Access Leader\n\n**Profile:**\n- Seniority: Associate Director → Director (8 months in role)\n- Education: MBA Health Administration\n- Geographic Scope: US Regional\n- Organization Size: Mid-Size Biotech\n- Direct Reports: 3\n- Team Size: 8\n\n**AI Profile:**\n- AI Maturity Score: 33/100 (Low)\n- Work Complexity Score: 35/100 (Moderate)\n- Technology Adoption: Early Majority\n- Risk Tolerance: Low\n- Change Readiness: Moderate\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 5/10\n- Pain: 7/10\n- Actions: 4/10\n- Needs: 4/10\n- Emotions: 6/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Master payer landscape complexity\n- Build contract negotiation skills\n- Understand HEOR integration\n- Successfully launch first product\n\n**Top Frustrations:**\n- Complex and fragmented payer landscape\n- Limited negotiation experience\n- Steep learning curve for value dossiers\n- Uncertainty about pricing strategy\n\n**Goals:**\n- Master payer engagement strategy\n- Build successful launch access plan\n- Develop pricing and contracting expertise\n- Create replicable access playbook\n\n**Ideal AI Features:**\n- Payer landscape navigator\n- Contract negotiation guide\n- Pricing strategy advisor\n- Launch access checklist',
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
    'Robert Hughes - Market Access Director Skeptic',
    E'**Role:** Senior Director Market Access\n**Archetype:** SKEPTIC\n**Tagline:** Access Risk Management Expert\n\n**Profile:**\n- Seniority: Senior Director (20 years experience)\n- Education: JD Health Law, MBA\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 10\n- Team Size: 35\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Very Low)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Laggard\n- Risk Tolerance: Very Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Legal review required)\n\n**VPANES Scores:**\n- Visibility: 6/10\n- Pain: 4/10\n- Actions: 3/10\n- Needs: 6/10\n- Emotions: 3/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Protect company from pricing/access compliance risks\n- Ensure payer contract accuracy\n- Maintain anti-kickback compliance\n- Validate all AI recommendations with legal\n\n**Top Frustrations:**\n- AI cannot understand complex payer negotiations\n- Legal risks of AI-generated contract language\n- Concerns about pricing algorithm transparency\n- Anti-trust implications of AI pricing tools\n\n**Goals:**\n- Establish AI governance for market access\n- Require legal review of all AI outputs\n- Create compliance-first AI framework\n- Build risk assessment protocols\n\n**Required AI Features:**\n- Legal compliance validation\n- Contract language review\n- Pricing anti-trust checks\n- Full audit trail\n- Human approval workflow',
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
-- VERIFICATION QUERIES
-- ============================================================================

-- Count personas by role
SELECT
    CASE
        WHEN persona_key LIKE 'medical_director_%' THEN 'Medical Director'
        WHEN persona_key LIKE 'regulatory_director_%' THEN 'Regulatory Director'
        WHEN persona_key LIKE 'brand_manager_%' THEN 'Brand Manager'
        WHEN persona_key LIKE 'heor_specialist_%' THEN 'HEOR Specialist'
        WHEN persona_key LIKE 'market_access_director_%' THEN 'Market Access Director'
        WHEN persona_key LIKE 'msl_%' THEN 'MSL'
        ELSE 'Other'
    END as role,
    COUNT(*) as persona_count
FROM personas
WHERE persona_key LIKE '%_automator'
   OR persona_key LIKE '%_orchestrator'
   OR persona_key LIKE '%_learner'
   OR persona_key LIKE '%_skeptic'
GROUP BY 1
ORDER BY 1;

-- Verify all 20 new personas
SELECT persona_key, display_name, is_active
FROM personas
WHERE persona_key LIKE 'medical_director_%'
   OR persona_key LIKE 'regulatory_director_%'
   OR persona_key LIKE 'brand_manager_%'
   OR persona_key LIKE 'heor_specialist_%'
   OR persona_key LIKE 'market_access_director_%'
ORDER BY persona_key;

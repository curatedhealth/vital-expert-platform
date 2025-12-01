-- ============================================================================
-- MIGRATION 040: COMPLETE PHARMACEUTICAL PERSONAS - REMAINING 9 ROLES
-- Version: 1.0.0 | Date: 2025-11-29
-- Purpose: Complete persona coverage for all 15 pharma roles (9 remaining)
-- Total: 36 personas (9 roles × 4 archetypes)
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
-- Roles Covered in This Migration:
-- 7. Senior MSL (4)
-- 8. MSL Manager (4)
-- 9. VP Medical Affairs (4)
-- 10. Medical Information Specialist (4)
-- 11. Medical Writer (4)
-- 12. VP Market Access (4)
-- 13. Payer Liaison (4)
-- 14. Commercial Lead (4)
-- 15. Sales Representative (4)
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 7: SENIOR MSL - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_msl_automator',
    'Dr. Jennifer Walsh - Senior MSL Automator',
    E'**Role:** Senior Medical Science Liaison\n**Archetype:** AUTOMATOR\n**Tagline:** High-Throughput KOL Engagement Expert\n\n**Profile:**\n- Seniority: Senior (9 years experience)\n- Education: PhD Pharmacology\n- Geographic Scope: Multi-territory\n- Organization Size: Large Pharma\n- KOL Portfolio: 50+ tier 1-2 KOLs\n\n**AI Profile:**\n- AI Maturity Score: 80/100 (High)\n- Work Complexity Score: 45/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Maximize KOL touchpoints without sacrificing quality\n- Automate pre/post call documentation\n- Scale scientific exchange across large territory\n\n**Top Frustrations:**\n- 12+ hours weekly on CRM documentation\n- Manual insight tracking across 50+ KOLs\n- Repetitive slide deck updates\n\n**Goals:**\n- Automate call note generation with AI\n- Build automated literature alerts for each KOL\n- Reduce admin time by 60%',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_msl_orchestrator',
    'Dr. David Kim - Senior MSL Orchestrator',
    E'**Role:** Senior Medical Science Liaison\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Territory Intelligence Architect\n\n**Profile:**\n- Seniority: Senior (12 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global KOL relationships\n- Organization Size: Top 10 Pharma\n- Leadership: Mentors 5 junior MSLs\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Build predictive KOL intelligence platform\n- Create competitive advantage through data synthesis\n- Pioneer next-gen field medical capabilities\n\n**Top Frustrations:**\n- Limited tools for multi-source insight synthesis\n- Manual competitive intelligence gathering\n- Disconnected territory data\n\n**Goals:**\n- Deploy multi-agent KOL analysis system\n- Build predictive engagement recommendations\n- Create territory intelligence dashboard',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_msl_learner',
    'Dr. Michelle Santos - Senior MSL Learner',
    E'**Role:** Senior Medical Science Liaison\n**Archetype:** LEARNER\n**Tagline:** Newly Promoted Field Medical Expert\n\n**Profile:**\n- Seniority: Newly Senior (5 years as MSL, 6 months as Senior)\n- Education: PharmD\n- Geographic Scope: Regional\n- Organization Size: Mid-Size Pharma\n\n**AI Profile:**\n- AI Maturity Score: 38/100 (Low)\n- Work Complexity Score: 40/100 (Moderate)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Master senior-level strategic responsibilities\n- Learn mentoring and coaching skills\n- Build confidence with executive presentations\n\n**Top Frustrations:**\n- Transition from tactical to strategic mindset\n- Uncertain about AI tools and capabilities\n- New to mentoring responsibilities\n\n**Goals:**\n- Develop strategic planning capabilities\n- Build AI literacy step-by-step\n- Successfully mentor first junior MSL',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_msl_skeptic',
    'Dr. Richard Chen - Senior MSL Skeptic',
    E'**Role:** Senior Medical Science Liaison\n**Archetype:** SKEPTIC\n**Tagline:** Evidence-First Scientific Expert\n\n**Profile:**\n- Seniority: Senior (15 years experience)\n- Education: MD, PhD\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Specialty: Oncology KOL Expert\n\n**AI Profile:**\n- AI Maturity Score: 25/100 (Low)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Late Majority\n- Preferred Service Layer: ASK_EXPERT (Human validated)\n\n**Key Motivations:**\n- Maintain highest scientific accuracy\n- Protect KOL relationships from AI errors\n- Ensure human oversight of all AI outputs\n\n**Top Frustrations:**\n- AI hallucinations in scientific content\n- Pressure to adopt unvalidated tools\n- Concerns about KOL trust if AI fails\n\n**Goals:**\n- Establish AI validation framework\n- Require human review of all AI content\n- Build trust gradually through proven results',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 8: MSL MANAGER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'msl_manager_automator',
    'Dr. Laura Martinez - MSL Manager Automator',
    E'**Role:** MSL Manager\n**Archetype:** AUTOMATOR\n**Tagline:** Team Efficiency Optimizer\n\n**Profile:**\n- Seniority: Manager (10 years experience)\n- Education: PharmD, MBA\n- Geographic Scope: US National\n- Team Size: 12 MSLs\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Automate team performance tracking\n- Standardize MSL processes across team\n- Reduce management administrative burden\n\n**Top Frustrations:**\n- 15+ hours weekly on report compilation\n- Inconsistent activity tracking across team\n- Manual territory analysis\n\n**Goals:**\n- Automate team performance dashboards\n- Implement AI-assisted coaching recommendations\n- Streamline territory optimization',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'msl_manager_orchestrator',
    'Dr. Andrew Chen - MSL Manager Orchestrator',
    E'**Role:** MSL Manager\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Field Medical Transformation Leader\n\n**Profile:**\n- Seniority: Senior Manager (14 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Team Size: 25 MSLs across regions\n- Organization Size: Top 10 Pharma\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Transform MSL operations through AI\n- Build predictive engagement analytics\n- Create AI-enabled MSL center of excellence\n\n**Top Frustrations:**\n- Limited insights from team activity data\n- Manual strategic planning processes\n- Slow adoption of AI across organization\n\n**Goals:**\n- Build AI-powered MSL intelligence platform\n- Deploy predictive territory optimization\n- Create AI training program for MSL team',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'msl_manager_learner',
    'Dr. Samantha Lee - MSL Manager Learner',
    E'**Role:** MSL Manager\n**Archetype:** LEARNER\n**Tagline:** First-Time People Manager\n\n**Profile:**\n- Seniority: New Manager (8 months in role)\n- Education: PhD Immunology\n- Geographic Scope: US Regional\n- Team Size: 6 MSLs\n- Organization Size: Mid-Size Biotech\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 38/100 (Moderate)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Learn people management skills\n- Build confidence as a leader\n- Successfully develop team members\n\n**Top Frustrations:**\n- Transition from individual contributor to manager\n- Uncertain about performance management\n- Limited management training\n\n**Goals:**\n- Master coaching conversations\n- Build effective team meetings\n- Successfully complete first performance reviews',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'msl_manager_skeptic',
    'Dr. Robert Thompson - MSL Manager Skeptic',
    E'**Role:** MSL Manager\n**Archetype:** SKEPTIC\n**Tagline:** Quality-Focused Team Leader\n\n**Profile:**\n- Seniority: Senior Manager (18 years experience)\n- Education: MD\n- Geographic Scope: Global\n- Team Size: 20 MSLs\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Very Low)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Laggard\n- Preferred Service Layer: ASK_EXPERT (Human review required)\n\n**Key Motivations:**\n- Maintain team quality standards\n- Protect MSL reputation with KOLs\n- Ensure compliance in all activities\n\n**Top Frustrations:**\n- AI cannot replace management judgment\n- Risk of AI undermining team relationships\n- Pressure to automate human-centered work\n\n**Goals:**\n- Establish clear AI governance for team\n- Maintain human oversight of all AI outputs\n- Build trust-based team culture',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 9: VP MEDICAL AFFAIRS - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_medical_affairs_automator',
    'Dr. Elizabeth Chen - VP Medical Affairs Automator',
    E'**Role:** VP Medical Affairs\n**Archetype:** AUTOMATOR\n**Tagline:** Executive Efficiency Champion\n\n**Profile:**\n- Seniority: VP (20 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Direct Reports: 8 Directors\n- Organization Size: Large Pharma\n- Budget: $50M+\n\n**AI Profile:**\n- AI Maturity Score: 75/100 (High)\n- Work Complexity Score: 48/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Automate executive reporting\n- Streamline cross-functional coordination\n- Enable strategic time allocation\n\n**Top Frustrations:**\n- 20+ hours weekly on meetings/reports\n- Manual portfolio status updates\n- Slow information flow from teams\n\n**Goals:**\n- Automate portfolio dashboards\n- Implement AI-assisted meeting prep\n- Reduce executive admin burden by 50%',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_medical_affairs_orchestrator',
    'Dr. James Wilson - VP Medical Affairs Orchestrator',
    E'**Role:** VP Medical Affairs\n**Archetype:** ORCHESTRATOR\n**Tagline:** Medical Affairs Transformation Visionary\n\n**Profile:**\n- Seniority: SVP (25 years experience)\n- Education: MD, PhD, MBA\n- Geographic Scope: Global\n- Direct Reports: 12 Directors/VPs\n- Organization Size: Top 5 Pharma\n- Budget: $200M+\n\n**AI Profile:**\n- AI Maturity Score: 90/100 (Expert)\n- Work Complexity Score: 90/100 (Strategic)\n- Technology Adoption: Visionary\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Transform Medical Affairs through AI\n- Create competitive advantage at scale\n- Position function for next decade\n\n**Top Frustrations:**\n- Slow organizational transformation\n- Limited AI capabilities in medical\n- Manual strategy development processes\n\n**Goals:**\n- Build AI-powered Medical Affairs platform\n- Create industry-leading AI capabilities\n- Transform function within 3 years',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_medical_affairs_learner',
    'Dr. Sarah Johnson - VP Medical Affairs Learner',
    E'**Role:** VP Medical Affairs\n**Archetype:** LEARNER\n**Tagline:** Newly Appointed Medical Executive\n\n**Profile:**\n- Seniority: New VP (15 years experience, 6 months in VP role)\n- Education: MD, MPH\n- Geographic Scope: US\n- Direct Reports: 5 Directors\n- Organization Size: Mid-Size Pharma\n\n**AI Profile:**\n- AI Maturity Score: 40/100 (Low-Moderate)\n- Work Complexity Score: 45/100 (Moderate)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Build executive leadership skills\n- Learn strategic planning at VP level\n- Establish credibility with C-suite\n\n**Top Frustrations:**\n- Transition to executive responsibilities\n- Limited exposure to AI at scale\n- New to budget management\n\n**Goals:**\n- Master executive-level decision making\n- Build AI strategy for function\n- Successfully lead first annual planning',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_medical_affairs_skeptic',
    'Dr. Michael Brooks - VP Medical Affairs Skeptic',
    E'**Role:** VP Medical Affairs\n**Archetype:** SKEPTIC\n**Tagline:** Risk-Conscious Medical Executive\n\n**Profile:**\n- Seniority: Senior VP (28 years experience)\n- Education: MD, JD\n- Geographic Scope: Global\n- Direct Reports: 10 Directors\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 20/100 (Very Low)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Laggard\n- Preferred Service Layer: ASK_EXPERT (Executive validation)\n\n**Key Motivations:**\n- Protect organization from AI risks\n- Maintain scientific integrity\n- Ensure regulatory compliance\n\n**Top Frustrations:**\n- Unproven AI being pushed by vendors\n- Risk of AI errors at executive level\n- Lack of AI governance frameworks\n\n**Goals:**\n- Establish enterprise AI governance\n- Require proof of AI accuracy before deployment\n- Build responsible AI adoption framework',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 10: MEDICAL INFORMATION SPECIALIST - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'med_info_specialist_automator',
    'Dr. Rebecca Lin - Medical Info Specialist Automator',
    E'**Role:** Medical Information Specialist\n**Archetype:** AUTOMATOR\n**Tagline:** High-Volume Response Expert\n\n**Profile:**\n- Seniority: Senior Specialist (8 years experience)\n- Education: PharmD\n- Geographic Scope: US National\n- Organization Size: Large Pharma\n- Inquiry Volume: 500+ monthly\n\n**AI Profile:**\n- AI Maturity Score: 82/100 (High)\n- Work Complexity Score: 35/100 (Routine)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Maximize response throughput\n- Automate standard response letters\n- Reduce turnaround time\n\n**Top Frustrations:**\n- 70% of inquiries are repetitive\n- Manual document searching\n- Slow letter customization\n\n**Goals:**\n- Automate 80% of standard responses\n- Deploy AI-powered document search\n- Reduce response time from 5 days to 1 day',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'med_info_specialist_orchestrator',
    'Dr. Kevin Park - Medical Info Specialist Orchestrator',
    E'**Role:** Medical Information Manager\n**Archetype:** ORCHESTRATOR\n**Tagline:** Medical Information Transformation Leader\n\n**Profile:**\n- Seniority: Manager (12 years experience)\n- Education: PharmD, MS Pharmacology\n- Geographic Scope: Global\n- Team Size: 15 specialists\n- Organization Size: Top 10 Pharma\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Transform medical information through AI\n- Build self-service HCP portal\n- Create predictive inquiry analytics\n\n**Top Frustrations:**\n- Manual inquiry categorization\n- Limited insight from inquiry data\n- Reactive rather than proactive service\n\n**Goals:**\n- Deploy AI-powered medical chatbot\n- Build predictive inquiry trends\n- Create real-time insight generation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'med_info_specialist_learner',
    'Dr. Ashley Wong - Medical Info Specialist Learner',
    E'**Role:** Medical Information Specialist\n**Archetype:** LEARNER\n**Tagline:** Early-Career Medical Information Professional\n\n**Profile:**\n- Seniority: Associate Specialist (1 year experience)\n- Education: PharmD\n- Geographic Scope: US Regional\n- Organization Size: Mid-Size Pharma\n\n**AI Profile:**\n- AI Maturity Score: 30/100 (Low)\n- Work Complexity Score: 28/100 (Routine)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Learn medical information processes\n- Build confidence in complex inquiries\n- Avoid errors in responses\n\n**Top Frustrations:**\n- Overwhelming product information\n- Uncertain about response quality\n- Fear of off-label information\n\n**Goals:**\n- Master standard response letters\n- Build confidence with complex inquiries\n- Learn compliance requirements',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'med_info_specialist_skeptic',
    'Dr. Thomas Davis - Medical Info Specialist Skeptic',
    E'**Role:** Medical Information Specialist\n**Archetype:** SKEPTIC\n**Tagline:** Accuracy-First Response Expert\n\n**Profile:**\n- Seniority: Senior Specialist (16 years experience)\n- Education: PharmD, Board Certified\n- Geographic Scope: US National\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Very Low)\n- Work Complexity Score: 72/100 (Strategic)\n- Technology Adoption: Late Majority\n- Preferred Service Layer: ASK_EXPERT (Human verified)\n\n**Key Motivations:**\n- Maintain 100% accuracy in responses\n- Protect against off-label information\n- Ensure regulatory compliance\n\n**Top Frustrations:**\n- AI hallucinations in medical content\n- Risk of incorrect information to HCPs\n- Compliance concerns with automation\n\n**Goals:**\n- Require human review of all AI responses\n- Build validation framework for AI\n- Maintain zero compliance findings',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 11: MEDICAL WRITER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_writer_automator',
    'Dr. Christina Moore - Medical Writer Automator',
    E'**Role:** Medical Writer\n**Archetype:** AUTOMATOR\n**Tagline:** High-Output Publication Expert\n\n**Profile:**\n- Seniority: Senior Writer (10 years experience)\n- Education: PhD Biomedical Sciences\n- Geographic Scope: Global publications\n- Organization Size: Large Pharma\n- Publication Volume: 20+ manuscripts/year\n\n**AI Profile:**\n- AI Maturity Score: 80/100 (High)\n- Work Complexity Score: 40/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Accelerate writing throughput\n- Automate literature searches\n- Streamline reference management\n\n**Top Frustrations:**\n- Time-consuming literature reviews\n- Repetitive formatting tasks\n- Manual reference checking\n\n**Goals:**\n- Automate first drafts with AI\n- Deploy AI literature synthesis\n- Reduce writing time by 50%',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_writer_orchestrator',
    'Dr. Daniel Kim - Medical Writer Orchestrator',
    E'**Role:** Medical Writing Director\n**Archetype:** ORCHESTRATOR\n**Tagline:** Publication Strategy Architect\n\n**Profile:**\n- Seniority: Director (16 years experience)\n- Education: PhD, MPH\n- Geographic Scope: Global\n- Team Size: 12 writers\n- Organization Size: Top 10 Pharma\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Transform medical writing through AI\n- Build AI-augmented writing workflows\n- Create publication intelligence platform\n\n**Top Frustrations:**\n- Manual publication planning\n- Limited competitive publication tracking\n- Slow content development cycles\n\n**Goals:**\n- Deploy AI writing assistance at scale\n- Build competitive publication intelligence\n- Create predictive publication planning',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_writer_learner',
    'Dr. Nicole Chen - Medical Writer Learner',
    E'**Role:** Medical Writer\n**Archetype:** LEARNER\n**Tagline:** Aspiring Publication Expert\n\n**Profile:**\n- Seniority: Associate Writer (2 years experience)\n- Education: PhD Biology\n- Geographic Scope: US\n- Organization Size: Mid-Size Pharma\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 32/100 (Routine)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Learn regulatory writing standards\n- Build publication portfolio\n- Master GPP3 guidelines\n\n**Top Frustrations:**\n- Complex regulatory requirements\n- Steep learning curve\n- Uncertainty about quality standards\n\n**Goals:**\n- Complete first manuscript submission\n- Master CSR writing\n- Learn journal submission processes',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'medical_writer_skeptic',
    'Dr. William Harris - Medical Writer Skeptic',
    E'**Role:** Medical Writer\n**Archetype:** SKEPTIC\n**Tagline:** Quality-Focused Publication Guardian\n\n**Profile:**\n- Seniority: Principal Writer (20 years experience)\n- Education: MD, PhD\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Specialty: Regulatory submissions\n\n**AI Profile:**\n- AI Maturity Score: 20/100 (Very Low)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Laggard\n- Preferred Service Layer: ASK_EXPERT (Human authored)\n\n**Key Motivations:**\n- Maintain highest publication quality\n- Ensure scientific accuracy\n- Protect against AI errors in submissions\n\n**Top Frustrations:**\n- AI cannot capture scientific nuance\n- Risk of plagiarism/hallucinations\n- Regulatory implications of AI content\n\n**Goals:**\n- Establish AI validation for medical writing\n- Require human authorship of all content\n- Build quality standards for AI use',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 12: VP MARKET ACCESS - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_automator',
    'Jennifer Rodriguez - VP Market Access Automator',
    E'**Role:** VP Market Access\n**Archetype:** AUTOMATOR\n**Tagline:** Access Operations Excellence Leader\n\n**Profile:**\n- Seniority: VP (18 years experience)\n- Education: MBA, MPH\n- Geographic Scope: US National\n- Direct Reports: 6 Directors\n- Organization Size: Large Pharma\n- Budget: $30M+\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 45/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Automate payer landscape analysis\n- Streamline contract management\n- Enable real-time market access monitoring\n\n**Top Frustrations:**\n- Manual payer policy tracking\n- Slow contract negotiation processes\n- Limited real-time competitive intelligence\n\n**Goals:**\n- Deploy AI payer policy monitoring\n- Automate contract analytics\n- Build real-time access dashboards',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_orchestrator',
    'Dr. Marcus Johnson - VP Market Access Orchestrator',
    E'**Role:** SVP Market Access\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Access Transformation Visionary\n\n**Profile:**\n- Seniority: SVP (22 years experience)\n- Education: MD, MBA, HEOR certification\n- Geographic Scope: Global\n- Direct Reports: 10 VPs/Directors\n- Organization Size: Top 5 Pharma\n- Budget: $100M+\n\n**AI Profile:**\n- AI Maturity Score: 90/100 (Expert)\n- Work Complexity Score: 88/100 (Strategic)\n- Technology Adoption: Visionary\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Transform market access through AI\n- Build predictive payer intelligence\n- Create competitive advantage at scale\n\n**Top Frustrations:**\n- Reactive access strategy\n- Manual global pricing optimization\n- Limited predictive capabilities\n\n**Goals:**\n- Build AI-powered access intelligence platform\n- Deploy predictive payer behavior models\n- Transform global pricing with AI',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_learner',
    'Amanda Chen - VP Market Access Learner',
    E'**Role:** VP Market Access\n**Archetype:** LEARNER\n**Tagline:** Rising Access Executive\n\n**Profile:**\n- Seniority: New VP (12 years experience, 8 months in VP role)\n- Education: MBA, MS Health Economics\n- Geographic Scope: US\n- Direct Reports: 4 Directors\n- Organization Size: Mid-Size Biotech\n\n**AI Profile:**\n- AI Maturity Score: 38/100 (Low)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Build executive leadership capabilities\n- Learn global access strategy\n- Establish credibility with C-suite\n\n**Top Frustrations:**\n- Transition to executive responsibilities\n- Limited global experience\n- New to AI strategy development\n\n**Goals:**\n- Master executive-level access strategy\n- Build AI roadmap for function\n- Successfully lead first major launch',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_market_access_skeptic',
    'Robert Williams - VP Market Access Skeptic',
    E'**Role:** VP Market Access\n**Archetype:** SKEPTIC\n**Tagline:** Compliance-Focused Access Leader\n\n**Profile:**\n- Seniority: Senior VP (25 years experience)\n- Education: JD, MBA\n- Geographic Scope: Global\n- Direct Reports: 8 Directors\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 18/100 (Very Low)\n- Work Complexity Score: 82/100 (Strategic)\n- Technology Adoption: Laggard\n- Preferred Service Layer: ASK_EXPERT (Legal validated)\n\n**Key Motivations:**\n- Protect organization from pricing/access risks\n- Ensure anti-trust compliance\n- Maintain legal review of all AI outputs\n\n**Top Frustrations:**\n- AI pricing algorithms lack transparency\n- Anti-trust implications of AI tools\n- Risk of non-compliant AI recommendations\n\n**Goals:**\n- Establish legal governance for AI\n- Require human approval of all pricing\n- Build compliance-first AI framework',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 13: PAYER LIAISON - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_automator',
    'Mark Chen - Payer Liaison Automator',
    E'**Role:** Payer Liaison\n**Archetype:** AUTOMATOR\n**Tagline:** High-Volume Account Engagement Expert\n\n**Profile:**\n- Seniority: Senior Liaison (9 years experience)\n- Education: MBA Healthcare\n- Geographic Scope: Multi-regional\n- Organization Size: Large Pharma\n- Account Portfolio: 40+ payer accounts\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 38/100 (Routine)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Maximize account coverage\n- Automate policy monitoring\n- Streamline meeting preparation\n\n**Top Frustrations:**\n- Manual policy tracking across 40+ accounts\n- Time-consuming meeting prep\n- Repetitive data entry\n\n**Goals:**\n- Automate payer policy alerts\n- Deploy AI meeting preparation\n- Reduce admin time by 60%',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_orchestrator',
    'Dr. Lisa Park - Payer Liaison Orchestrator',
    E'**Role:** Payer Account Director\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Payer Intelligence Architect\n\n**Profile:**\n- Seniority: Director (14 years experience)\n- Education: PharmD, MBA\n- Geographic Scope: National\n- Team Size: 8 liaisons\n- Organization Size: Top 10 Pharma\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 78/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Build predictive payer behavior models\n- Create competitive intelligence platform\n- Transform account management through AI\n\n**Top Frustrations:**\n- Limited predictive payer insights\n- Manual competitive tracking\n- Disconnected account intelligence\n\n**Goals:**\n- Deploy AI payer behavior prediction\n- Build integrated account intelligence\n- Create predictive negotiation support',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_learner',
    'Sarah Martinez - Payer Liaison Learner',
    E'**Role:** Payer Liaison\n**Archetype:** LEARNER\n**Tagline:** Emerging Account Manager\n\n**Profile:**\n- Seniority: Associate Liaison (2 years experience)\n- Education: BS Health Administration\n- Geographic Scope: Regional\n- Organization Size: Mid-Size Pharma\n- Account Portfolio: 15 accounts\n\n**AI Profile:**\n- AI Maturity Score: 32/100 (Low)\n- Work Complexity Score: 30/100 (Routine)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Learn payer landscape\n- Build account relationship skills\n- Understand formulary processes\n\n**Top Frustrations:**\n- Complex payer ecosystem\n- Uncertain about negotiation tactics\n- Limited training resources\n\n**Goals:**\n- Master payer engagement basics\n- Build first successful account plan\n- Learn P&T committee processes',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'payer_liaison_skeptic',
    'David Thompson - Payer Liaison Skeptic',
    E'**Role:** Payer Liaison\n**Archetype:** SKEPTIC\n**Tagline:** Relationship-Focused Account Expert\n\n**Profile:**\n- Seniority: Senior Liaison (17 years experience)\n- Education: MBA, MPH\n- Geographic Scope: National key accounts\n- Organization Size: Large Pharma\n- Specialty: Top 10 PBMs\n\n**AI Profile:**\n- AI Maturity Score: 22/100 (Very Low)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Late Majority\n- Preferred Service Layer: ASK_EXPERT (Relationship-first)\n\n**Key Motivations:**\n- Maintain trusted payer relationships\n- Protect account partnerships\n- Ensure personalized engagement\n\n**Top Frustrations:**\n- AI cannot replace relationship nuance\n- Risk of generic AI communications\n- Loss of personal touch with automation\n\n**Goals:**\n- Maintain human-centered engagement\n- Use AI only for background research\n- Preserve relationship authenticity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 14: COMMERCIAL LEAD - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'commercial_lead_automator',
    'Jennifer Kim - Commercial Lead Automator',
    E'**Role:** Commercial Lead\n**Archetype:** AUTOMATOR\n**Tagline:** Marketing Operations Champion\n\n**Profile:**\n- Seniority: Director (12 years experience)\n- Education: MBA Marketing\n- Geographic Scope: US National\n- Direct Reports: 5\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 80/100 (High)\n- Work Complexity Score: 42/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Automate campaign execution\n- Streamline MLR workflows\n- Scale content production\n\n**Top Frustrations:**\n- Slow content approval cycles\n- Manual campaign tracking\n- Repetitive reporting tasks\n\n**Goals:**\n- Automate 70% of routine content\n- Deploy AI-powered MLR pre-screening\n- Build real-time campaign dashboards',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'commercial_lead_orchestrator',
    'Dr. Michael Chen - Commercial Lead Orchestrator',
    E'**Role:** VP Commercial\n**Archetype:** ORCHESTRATOR\n**Tagline:** Commercial Transformation Architect\n\n**Profile:**\n- Seniority: VP (18 years experience)\n- Education: MD, MBA\n- Geographic Scope: Global\n- Direct Reports: 10\n- Organization Size: Top 10 Pharma\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 85/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Transform commercial through AI\n- Build omnichannel intelligence platform\n- Create predictive customer engagement\n\n**Top Frustrations:**\n- Disconnected customer data\n- Manual market analysis\n- Limited personalization at scale\n\n**Goals:**\n- Deploy AI-powered omnichannel orchestration\n- Build predictive HCP engagement\n- Create real-time market intelligence',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'commercial_lead_learner',
    'Emily Davis - Commercial Lead Learner',
    E'**Role:** Commercial Lead\n**Archetype:** LEARNER\n**Tagline:** Rising Commercial Leader\n\n**Profile:**\n- Seniority: Associate Director (6 years experience, new to lead role)\n- Education: MBA\n- Geographic Scope: US Regional\n- Direct Reports: 3\n- Organization Size: Mid-Size Pharma\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low)\n- Work Complexity Score: 35/100 (Moderate)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Build commercial strategy expertise\n- Learn cross-functional leadership\n- Successfully execute first launch\n\n**Top Frustrations:**\n- Transition to strategic role\n- Limited commercial experience\n- New to AI tools\n\n**Goals:**\n- Master commercial planning\n- Build leadership skills\n- Successfully lead first product',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'commercial_lead_skeptic',
    'Robert Anderson - Commercial Lead Skeptic',
    E'**Role:** Commercial Lead\n**Archetype:** SKEPTIC\n**Tagline:** Brand Protection Guardian\n\n**Profile:**\n- Seniority: Senior Director (20 years experience)\n- Education: MBA, PharmD\n- Geographic Scope: Global\n- Direct Reports: 8\n- Organization Size: Large Pharma\n\n**AI Profile:**\n- AI Maturity Score: 20/100 (Very Low)\n- Work Complexity Score: 80/100 (Strategic)\n- Technology Adoption: Laggard\n- Preferred Service Layer: ASK_EXPERT (Brand validated)\n\n**Key Motivations:**\n- Protect brand integrity\n- Ensure promotional compliance\n- Maintain brand voice consistency\n\n**Top Frustrations:**\n- AI cannot capture brand nuance\n- Risk of off-brand AI content\n- Compliance concerns with automation\n\n**Goals:**\n- Establish AI brand governance\n- Require human approval of content\n- Protect brand reputation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 15: SALES REPRESENTATIVE - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sales_rep_automator',
    'Jason Martinez - Sales Rep Automator',
    E'**Role:** Sales Representative\n**Archetype:** AUTOMATOR\n**Tagline:** High-Efficiency Territory Manager\n\n**Profile:**\n- Seniority: Senior Rep (8 years experience)\n- Education: BS Biology, MBA\n- Geographic Scope: Multi-territory\n- Organization Size: Large Pharma\n- HCP Portfolio: 200+ accounts\n\n**AI Profile:**\n- AI Maturity Score: 78/100 (High)\n- Work Complexity Score: 35/100 (Routine)\n- Technology Adoption: Early Adopter\n- Preferred Service Layer: WORKFLOWS\n\n**Key Motivations:**\n- Maximize selling time\n- Automate call planning\n- Streamline CRM documentation\n\n**Top Frustrations:**\n- 10+ hours weekly on admin\n- Manual call note entry\n- Repetitive email creation\n\n**Goals:**\n- Automate call notes with AI\n- Deploy AI call planning\n- Increase face-time by 40%',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sales_rep_orchestrator',
    'Dr. Amanda Lee - Sales Rep Orchestrator',
    E'**Role:** Senior Sales Representative\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Account Expert\n\n**Profile:**\n- Seniority: Top Performer (12 years experience)\n- Education: PharmD\n- Geographic Scope: Key Accounts\n- Organization Size: Top 10 Pharma\n- Performance: Presidents Club 5x\n\n**AI Profile:**\n- AI Maturity Score: 85/100 (Very High)\n- Work Complexity Score: 75/100 (Strategic)\n- Technology Adoption: Innovator\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**Key Motivations:**\n- Build competitive advantage through AI\n- Create predictive account intelligence\n- Pioneer AI-enabled selling\n\n**Top Frustrations:**\n- Limited account intelligence\n- Manual competitive tracking\n- Reactive rather than predictive\n\n**Goals:**\n- Deploy AI account intelligence\n- Build predictive opportunity scoring\n- Create competitive early warning',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sales_rep_learner',
    'Chris Wong - Sales Rep Learner',
    E'**Role:** Sales Representative\n**Archetype:** LEARNER\n**Tagline:** New Territory Manager\n\n**Profile:**\n- Seniority: New Rep (1 year experience)\n- Education: BS Business\n- Geographic Scope: Regional\n- Organization Size: Mid-Size Pharma\n- Training: Completed initial training\n\n**AI Profile:**\n- AI Maturity Score: 30/100 (Low)\n- Work Complexity Score: 28/100 (Routine)\n- Technology Adoption: Early Majority\n- Preferred Service Layer: ASK_EXPERT\n\n**Key Motivations:**\n- Learn product and disease state\n- Build HCP relationships\n- Achieve quota in first year\n\n**Top Frustrations:**\n- Overwhelming product information\n- Uncertain about selling techniques\n- Fear of HCP objections\n\n**Goals:**\n- Master product knowledge\n- Build confidence in HCP calls\n- Achieve 100% quota Year 1',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sales_rep_skeptic',
    'David Brown - Sales Rep Skeptic',
    E'**Role:** Sales Representative\n**Archetype:** SKEPTIC\n**Tagline:** Relationship-First Sales Expert\n\n**Profile:**\n- Seniority: Senior Rep (18 years experience)\n- Education: BS Nursing, MBA\n- Geographic Scope: Key Accounts\n- Organization Size: Large Pharma\n- Specialty: Complex accounts\n\n**AI Profile:**\n- AI Maturity Score: 20/100 (Very Low)\n- Work Complexity Score: 72/100 (Strategic)\n- Technology Adoption: Late Majority\n- Preferred Service Layer: ASK_EXPERT (Relationship-first)\n\n**Key Motivations:**\n- Maintain trusted HCP relationships\n- Preserve personal selling approach\n- Ensure human connection in sales\n\n**Top Frustrations:**\n- AI cannot replace relationship selling\n- Risk of impersonal AI communications\n- Technology replacing human touch\n\n**Goals:**\n- Maintain human-centered selling\n- Use AI only for background research\n- Preserve relationship authenticity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

COMMIT;

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

-- Count all personas by role
SELECT
    CASE
        WHEN persona_key LIKE 'msl_%' AND persona_key NOT LIKE 'msl_manager%' THEN 'MSL'
        WHEN persona_key LIKE 'senior_msl_%' THEN 'Senior MSL'
        WHEN persona_key LIKE 'msl_manager_%' THEN 'MSL Manager'
        WHEN persona_key LIKE 'medical_director_%' THEN 'Medical Director'
        WHEN persona_key LIKE 'vp_medical_affairs_%' THEN 'VP Medical Affairs'
        WHEN persona_key LIKE 'med_info_specialist_%' THEN 'Medical Info Specialist'
        WHEN persona_key LIKE 'medical_writer_%' THEN 'Medical Writer'
        WHEN persona_key LIKE 'regulatory_director_%' THEN 'Regulatory Director'
        WHEN persona_key LIKE 'brand_manager_%' THEN 'Brand Manager'
        WHEN persona_key LIKE 'heor_specialist_%' THEN 'HEOR Specialist'
        WHEN persona_key LIKE 'market_access_director_%' THEN 'Market Access Director'
        WHEN persona_key LIKE 'vp_market_access_%' THEN 'VP Market Access'
        WHEN persona_key LIKE 'payer_liaison_%' THEN 'Payer Liaison'
        WHEN persona_key LIKE 'commercial_lead_%' THEN 'Commercial Lead'
        WHEN persona_key LIKE 'sales_rep_%' THEN 'Sales Representative'
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

-- Total persona count
SELECT COUNT(*) as total_personas
FROM personas
WHERE is_active = true;

-- Summary by archetype
SELECT
    CASE
        WHEN persona_key LIKE '%_automator' THEN 'AUTOMATOR'
        WHEN persona_key LIKE '%_orchestrator' THEN 'ORCHESTRATOR'
        WHEN persona_key LIKE '%_learner' THEN 'LEARNER'
        WHEN persona_key LIKE '%_skeptic' THEN 'SKEPTIC'
        ELSE 'OTHER'
    END as archetype,
    COUNT(*) as count
FROM personas
WHERE persona_key LIKE '%_automator'
   OR persona_key LIKE '%_orchestrator'
   OR persona_key LIKE '%_learner'
   OR persona_key LIKE '%_skeptic'
GROUP BY 1
ORDER BY 1;

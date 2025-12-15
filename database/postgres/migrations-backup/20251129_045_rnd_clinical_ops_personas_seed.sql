-- =====================================================
-- R&D / CLINICAL OPERATIONS PERSONAS SEED DATA
-- Migration: 20251129_045_rnd_clinical_ops_personas_seed.sql
-- Description: Seeds 80 personas for 20 R&D/Clinical Operations role types
-- MECE Framework: 4 archetypes per role (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
-- =====================================================

-- Function: R&D / Clinical Operations
-- Core Role Types (20):
-- 1. VP of Clinical Operations - executive
-- 2. Director of Clinical Operations - director
-- 3. Director of Clinical Affairs - director
-- 4. Director of Clinical Content - director
-- 5. Director of Outcomes Research - director
-- 6. Global Clinical Project Lead - senior
-- 7. Senior Clinical Operations Manager - senior
-- 8. Clinical Operations Manager - senior
-- 9. Clinical Operations Liaison - senior
-- 10. Senior Clinical Affairs Manager - senior
-- 11. Trial Manager - senior
-- 12. Preclinical Project Manager - senior
-- 13. Senior Clinical Content Manager - senior
-- 14. Senior Outcomes Researcher - senior
-- 15. Senior Safety Scientist - senior
-- 16. Outcomes Research Scientist - mid
-- 17. Research Scientist - mid
-- 18. Biostatistician - mid
-- 19. Clinical Research Associate - mid
-- 20. Clinical Research Coordinator - entry

-- =====================================================
-- 1. VP OF CLINICAL OPERATIONS - Executive
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_clinical_operations_automator',
    'Dr. Sarah Chen - VP Clinical Operations Automator',
    E'**Role:** VP of Clinical Operations\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 85/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nDr. Chen has transformed clinical operations through AI-powered trial monitoring, predictive enrollment analytics, and automated site performance tracking. She champions AI to accelerate trial timelines while maintaining quality.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Executive committee trial portfolio updates\n- **Pain:** 7/10 - Enrollment challenges and timeline pressures\n- **Actions:** 9/10 - AI-automated trial operations dashboards\n- **Needs:** 9/10 - Predictive enrollment and site performance tools\n- **Emotions:** 8/10 - Confident in AI-driven operational excellence\n- **Scenarios:** Enterprise clinical operations transformation\n\n## Goals\n- Reduce trial cycle times by 25% through AI optimization\n- Build predictive enrollment models across portfolio\n- Transform site selection and monitoring with AI\n\n## Frustrations\n- Legacy clinical trial management systems\n- Regulatory uncertainty on AI in clinical trials\n- Sites resistant to new technologies',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_clinical_operations_orchestrator',
    'Dr. Margaret Sullivan - VP Clinical Operations Orchestrator',
    E'**Role:** VP of Clinical Operations\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 90/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nDr. Sullivan orchestrates an integrated AI ecosystem connecting trial management, site operations, data management, and regulatory submissions. She leads industry initiatives on AI adoption in clinical development.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Industry thought leader on clinical AI\n- **Pain:** 8/10 - Coordinating global clinical AI transformation\n- **Actions:** 10/10 - Multi-system AI orchestration across clinical functions\n- **Needs:** 10/10 - Unified clinical data platform vision\n- **Emotions:** 9/10 - Visionary confidence in clinical AI transformation\n- **Scenarios:** Industry-wide clinical operations modernization\n\n## Goals\n- Lead industry adoption of AI-powered clinical trials\n- Create integrated global clinical operations ecosystem\n- Transform clinical development into competitive advantage\n\n## Frustrations\n- Fragmented clinical systems across acquired companies\n- Varying AI readiness across global clinical teams\n- Regulatory agencies with inconsistent AI guidance',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_clinical_operations_learner',
    'Dr. Patricia Adams - VP Clinical Operations Learner',
    E'**Role:** VP of Clinical Operations\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nDr. Adams recognizes AI potential for clinical operations but approaches adoption methodically. She prioritizes understanding AI capabilities and regulatory implications before large-scale implementation.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Executive clinical accountability\n- **Pain:** 8/10 - Balancing innovation with GCP compliance\n- **Actions:** 6/10 - Piloting AI in low-risk clinical workflows\n- **Needs:** 7/10 - Evidence-based AI implementation roadmap\n- **Emotions:** 6/10 - Cautiously optimistic about clinical AI\n- **Scenarios:** Conservative AI adoption with validation focus\n\n## Goals\n- Develop AI literacy across clinical leadership team\n- Identify high-value, low-risk AI pilot opportunities\n- Build internal expertise before vendor dependency\n\n## Frustrations\n- AI vendors overpromising clinical transformation\n- Unclear regulatory guidance on AI in trials\n- Limited case studies of AI success in GCP environment',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_clinical_operations_skeptic',
    'Dr. Eleanor Richardson - VP Clinical Operations Skeptic',
    E'**Role:** VP of Clinical Operations\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nDr. Richardson maintains healthy skepticism about AI in clinical trials, emphasizing patient safety and GCP compliance above all. She requires extensive validation and regulatory guidance before any AI adoption.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Ultimate clinical accountability to board\n- **Pain:** 9/10 - Managing AI pressure while protecting trial integrity\n- **Actions:** 4/10 - Minimal AI adoption, maximum validation requirements\n- **Needs:** 8/10 - Regulatory agency guidance on AI in trials\n- **Emotions:** 5/10 - Protective of patient safety and GCP compliance\n- **Scenarios:** Rigorous validation before any AI implementation\n\n## Goals\n- Ensure zero patient safety risk from AI implementation\n- Maintain regulatory relationships built on compliance\n- Protect company from AI-related trial failures\n\n## Frustrations\n- Executives pushing AI without understanding GCP implications\n- Unclear regulatory positions on AI in clinical trials\n- Vendors unable to demonstrate GCP-grade validation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 2. DIRECTOR OF CLINICAL OPERATIONS - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_operations_automator',
    'Dr. Karen Mitchell - Director Clinical Operations Automator',
    E'**Role:** Director of Clinical Operations\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Mitchell has automated trial monitoring, site performance tracking, and enrollment forecasting using AI. Her team leverages AI-powered dashboards for real-time portfolio visibility.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Portfolio-level trial updates to leadership\n- **Pain:** 7/10 - Managing complex multi-trial operations\n- **Actions:** 9/10 - AI-automated clinical workflows\n- **Needs:** 8/10 - Integrated clinical operations platform\n- **Emotions:** 8/10 - Enthusiastic about clinical automation\n- **Scenarios:** Portfolio clinical automation initiatives\n\n## Goals\n- Reduce monitoring overhead by 30% through AI\n- Build predictive enrollment models for portfolio\n- Enable team focus on strategic clinical decisions\n\n## Frustrations\n- Legacy CTMS systems limiting automation\n- Sites varying in technology adoption\n- Budget constraints for clinical AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_operations_orchestrator',
    'Dr. Susan Taylor - Director Clinical Operations Orchestrator',
    E'**Role:** Director of Clinical Operations\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 84/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Taylor orchestrates AI integration across clinical operations, connecting CTMS, EDC, safety databases, and regulatory submissions into unified clinical platforms.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-functional clinical coordination\n- **Pain:** 8/10 - Integrating diverse clinical systems\n- **Actions:** 9/10 - Multi-system clinical AI orchestration\n- **Needs:** 9/10 - Unified clinical data architecture\n- **Emotions:** 8/10 - Energized by clinical integration challenges\n- **Scenarios:** Enterprise clinical AI integration programs\n\n## Goals\n- Create seamless clinical data flow across systems\n- Build AI-native clinical operations model\n- Lead clinical digitalization initiatives\n\n## Frustrations\n- Siloed clinical data across systems\n- Vendor lock-in limiting integration\n- Pace of clinical AI evolution outstripping capacity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_operations_learner',
    'Dr. Angela Davis - Director Clinical Operations Learner',
    E'**Role:** Director of Clinical Operations\n**Archetype:** LEARNER\n**AI Maturity Score:** 46/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Davis is actively building AI capabilities for clinical operations through structured pilots. She focuses on understanding how AI can augment clinical decisions while maintaining GCP compliance.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Clinical program accountability\n- **Pain:** 7/10 - Keeping pace with clinical AI advancement\n- **Actions:** 5/10 - Structured clinical AI pilots\n- **Needs:** 7/10 - Clear clinical AI implementation guidance\n- **Emotions:** 6/10 - Curious but cautious about clinical AI\n- **Scenarios:** Methodical clinical AI capability building\n\n## Goals\n- Develop clinical AI literacy across team\n- Identify high-value clinical AI applications\n- Build hybrid human-AI clinical workflows\n\n## Frustrations\n- AI tools lacking clinical domain understanding\n- Difficulty quantifying AI value in GCP environment\n- Team members at varying AI readiness levels',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_operations_skeptic',
    'Dr. Janet Robinson - Director Clinical Operations Skeptic',
    E'**Role:** Director of Clinical Operations\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Robinson prioritizes GCP compliance and patient safety over AI innovation. She has seen clinical technology projects fail and requires extensive proof before endorsing any AI adoption.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Accountable for clinical trial quality\n- **Pain:** 8/10 - Pressure to adopt unproven clinical AI\n- **Actions:** 4/10 - Minimal AI engagement, focus on proven processes\n- **Needs:** 8/10 - Validated AI solutions with clinical track record\n- **Emotions:** 5/10 - Protective of clinical quality and GCP compliance\n- **Scenarios:** Defending traditional clinical approaches\n\n## Goals\n- Maintain flawless GCP compliance record\n- Protect team from disruptive technology experiments\n- Require rigorous validation for any AI implementation\n\n## Frustrations\n- AI enthusiasm without understanding clinical stakes\n- Vendors with no GCP experience\n- Pressure to be innovative rather than compliant',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 3. DIRECTOR OF CLINICAL AFFAIRS - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_affairs_automator',
    'Dr. Christine Anderson - Director Clinical Affairs Automator',
    E'**Role:** Director of Clinical Affairs\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 78/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Anderson has automated clinical evidence gathering, literature monitoring, and clinical content preparation using AI. Her team uses AI for rapid clinical landscape analysis and evidence synthesis.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Clinical evidence strategy leadership\n- **Pain:** 7/10 - Managing clinical evidence across indications\n- **Actions:** 8/10 - AI-automated clinical intelligence\n- **Needs:** 8/10 - Integrated clinical evidence platform\n- **Emotions:** 8/10 - Confident in clinical AI value\n- **Scenarios:** Clinical evidence automation initiatives\n\n## Goals\n- Reduce clinical landscape analysis time by 40%\n- Build AI-powered evidence synthesis capabilities\n- Automate clinical communication preparation\n\n## Frustrations\n- Unstructured clinical data sources\n- AI missing clinical nuance in literature\n- Integration with clinical trial data',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_affairs_orchestrator',
    'Dr. Melissa Brown - Director Clinical Affairs Orchestrator',
    E'**Role:** Director of Clinical Affairs\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 82/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Brown orchestrates an integrated AI clinical affairs ecosystem connecting literature databases, clinical trial data, regulatory submissions, and medical communications into unified clinical intelligence platforms.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-functional clinical evidence leadership\n- **Pain:** 8/10 - Integrating diverse clinical data sources\n- **Actions:** 9/10 - Clinical evidence AI orchestration\n- **Needs:** 9/10 - Unified clinical evidence platform\n- **Emotions:** 8/10 - Energized by clinical integration\n- **Scenarios:** Enterprise clinical affairs AI transformation\n\n## Goals\n- Create seamless clinical evidence data flow\n- Build integrated clinical intelligence capabilities\n- Lead clinical affairs digitalization\n\n## Frustrations\n- Siloed clinical data across functions\n- Varying clinical data quality\n- Legacy clinical content management systems',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_affairs_learner',
    'Dr. Kimberly White - Director Clinical Affairs Learner',
    E'**Role:** Director of Clinical Affairs\n**Archetype:** LEARNER\n**AI Maturity Score:** 50/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. White is building AI capabilities for clinical affairs through structured pilots. She sees potential for AI in evidence synthesis but needs to ensure clinical accuracy is maintained.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Clinical evidence accountability\n- **Pain:** 7/10 - Balancing AI innovation with clinical rigor\n- **Actions:** 6/10 - Careful clinical AI pilots\n- **Needs:** 7/10 - Validated clinical AI tools\n- **Emotions:** 6/10 - Cautiously exploring clinical AI\n- **Scenarios:** Methodical clinical AI capability building\n\n## Goals\n- Develop AI literacy for clinical applications\n- Identify high-value clinical AI use cases\n- Build team readiness for AI adoption\n\n## Frustrations\n- AI tools lacking clinical domain understanding\n- Clinical accuracy requirements limiting experimentation\n- Limited resources for AI experimentation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_affairs_skeptic',
    'Dr. Laura Garcia - Director Clinical Affairs Skeptic',
    E'**Role:** Director of Clinical Affairs\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Garcia is highly skeptical of AI in clinical affairs, emphasizing that clinical evidence requires expert interpretation. She requires extensive validation before considering any AI adoption.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Clinical evidence accountability\n- **Pain:** 8/10 - Pressure to adopt AI in high-stakes area\n- **Actions:** 3/10 - Minimal AI engagement\n- **Needs:** 8/10 - Proof of AI clinical accuracy\n- **Emotions:** 4/10 - Protective of clinical evidence integrity\n- **Scenarios:** Defending expert-driven clinical affairs\n\n## Goals\n- Maintain clinical evidence quality through expertise\n- Protect against AI-related clinical errors\n- Require clinical expert validation for any AI\n\n## Frustrations\n- Pressure to adopt AI without clinical validation\n- AI unable to capture clinical nuance\n- Vendors without clinical domain expertise',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 4. DIRECTOR OF CLINICAL CONTENT - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_content_automator',
    'Jennifer Martinez - Director Clinical Content Automator',
    E'**Role:** Director of Clinical Content\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 81/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nJennifer has automated clinical content creation, review workflows, and consistency checking using AI. Her team leverages AI writing assistants for clinical document preparation while maintaining scientific accuracy.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Clinical content quality leadership\n- **Pain:** 7/10 - High-volume clinical content demands\n- **Actions:** 9/10 - AI-automated content workflows\n- **Needs:** 8/10 - Advanced clinical AI writing tools\n- **Emotions:** 8/10 - Enthusiastic about content automation\n- **Scenarios:** Clinical content automation initiatives\n\n## Goals\n- Reduce clinical content development time by 35%\n- Maintain scientific accuracy with AI assistance\n- Build AI content capabilities across team\n\n## Frustrations\n- AI not understanding clinical terminology nuances\n- Quality review burden for AI content\n- Limited clinical-specific AI writing tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_content_orchestrator',
    'Catherine Wong - Director Clinical Content Orchestrator',
    E'**Role:** Director of Clinical Content\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 85/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nCatherine orchestrates AI integration across clinical content workflows, connecting template management, review systems, and publishing platforms into unified content ecosystems.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-functional content coordination\n- **Pain:** 8/10 - Managing diverse content systems\n- **Actions:** 10/10 - Content AI ecosystem orchestration\n- **Needs:** 9/10 - Unified intelligent content platform\n- **Emotions:** 9/10 - Energized by content technology integration\n- **Scenarios:** Enterprise clinical content AI transformation\n\n## Goals\n- Create seamless AI-augmented content workflows\n- Build integrated clinical content intelligence\n- Lead clinical content digitalization\n\n## Frustrations\n- Fragmented content management tools\n- Legacy template systems\n- Varying content standards across teams',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_content_learner',
    'Rebecca Harris - Director Clinical Content Learner',
    E'**Role:** Director of Clinical Content\n**Archetype:** LEARNER\n**AI Maturity Score:** 52/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nRebecca is actively exploring AI for clinical content through careful pilots. She tests AI writing capabilities while ensuring scientific accuracy is maintained in all clinical communications.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Content quality accountability\n- **Pain:** 7/10 - Balancing AI innovation with scientific rigor\n- **Actions:** 6/10 - Structured content AI pilots\n- **Needs:** 7/10 - Validated clinical AI writing tools\n- **Emotions:** 7/10 - Optimistic about AI content potential\n- **Scenarios:** Careful clinical content AI adoption\n\n## Goals\n- Evaluate AI for clinical content support\n- Build team AI writing competency\n- Develop hybrid human-AI content processes\n\n## Frustrations\n- AI lacking clinical domain understanding\n- Quality concerns with AI clinical content\n- Limited clinical-specific AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_clinical_content_skeptic',
    'Sharon Williams - Director Clinical Content Skeptic',
    E'**Role:** Director of Clinical Content\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nSharon believes clinical content requires expert understanding that AI cannot replicate. She views AI-generated clinical content as a quality risk requiring extensive review.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Clinical content accountability\n- **Pain:** 8/10 - Pressure to use AI for clinical writing\n- **Actions:** 4/10 - Limited AI use, maximum expert review\n- **Needs:** 8/10 - Proof of AI clinical content quality\n- **Emotions:** 5/10 - Protective of clinical content standards\n- **Scenarios:** Defending expert-written clinical content\n\n## Goals\n- Maintain clinical content quality through expertise\n- Require AI to support not replace clinical writers\n- Validate AI outputs against clinical judgment\n\n## Frustrations\n- AI missing critical clinical context\n- Pressure to automate clinical writing\n- Vendors overpromising AI clinical content capabilities',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 5. DIRECTOR OF OUTCOMES RESEARCH - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_outcomes_research_automator',
    'Dr. Linda Chang - Director Outcomes Research Automator',
    E'**Role:** Director of Outcomes Research\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 83/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nDr. Chang has automated literature searches, data extraction, and evidence synthesis using AI. Her team leverages AI for rapid systematic reviews and real-world evidence analysis.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Outcomes evidence strategy leadership\n- **Pain:** 7/10 - Managing complex evidence synthesis projects\n- **Actions:** 9/10 - AI-automated outcomes research workflows\n- **Needs:** 8/10 - Advanced AI evidence synthesis tools\n- **Emotions:** 8/10 - Confident in AI research value\n- **Scenarios:** Outcomes research automation initiatives\n\n## Goals\n- Reduce systematic review time by 50% with AI\n- Build AI-powered evidence synthesis capabilities\n- Enable rapid real-world evidence generation\n\n## Frustrations\n- Unstructured clinical data sources\n- AI bias in evidence selection\n- Integration with clinical trial databases',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_outcomes_research_orchestrator',
    'Dr. Christina Park - Director Outcomes Research Orchestrator',
    E'**Role:** Director of Outcomes Research\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 87/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nDr. Park orchestrates an integrated AI outcomes research ecosystem connecting literature databases, RWD sources, statistical analysis, and evidence communication into unified research platforms.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-functional research coordination\n- **Pain:** 8/10 - Integrating diverse evidence sources\n- **Actions:** 10/10 - Research AI ecosystem orchestration\n- **Needs:** 9/10 - Unified outcomes research platform\n- **Emotions:** 9/10 - Energized by research integration challenges\n- **Scenarios:** Enterprise outcomes research AI transformation\n\n## Goals\n- Create seamless evidence data flow across sources\n- Build integrated outcomes research intelligence\n- Lead research methodology innovation with AI\n\n## Frustrations\n- Siloed evidence data across organizations\n- Varying data quality across RWD sources\n- Legacy analytical tools limiting AI integration',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_outcomes_research_learner',
    'Dr. Dorothy Nelson - Director Outcomes Research Learner',
    E'**Role:** Director of Outcomes Research\n**Archetype:** LEARNER\n**AI Maturity Score:** 55/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nDr. Nelson is building AI capabilities for outcomes research through structured pilots. She sees potential for AI in evidence synthesis but needs to ensure methodological rigor is maintained.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Research quality accountability\n- **Pain:** 7/10 - Balancing AI innovation with research rigor\n- **Actions:** 6/10 - Structured research AI pilots\n- **Needs:** 7/10 - Validated research AI tools\n- **Emotions:** 7/10 - Optimistic about research AI potential\n- **Scenarios:** Methodical research AI capability building\n\n## Goals\n- Evaluate AI for evidence synthesis applications\n- Build team AI research competency\n- Develop AI-augmented research methodology\n\n## Frustrations\n- AI tools lacking research methodology understanding\n- Methodological rigor concerns with AI\n- Limited resources for AI experimentation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_outcomes_research_skeptic',
    'Dr. Nancy Cooper - Director Outcomes Research Skeptic',
    E'**Role:** Director of Outcomes Research\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 32/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nDr. Cooper is skeptical of AI in outcomes research, emphasizing that evidence synthesis requires expert methodological judgment. She prefers traditional research approaches with validated methodology.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Research methodology accountability\n- **Pain:** 8/10 - Pressure to adopt AI in research\n- **Actions:** 4/10 - Minimal AI engagement, focus on methodology\n- **Needs:** 8/10 - Proof of AI research validity\n- **Emotions:** 5/10 - Protective of research methodology standards\n- **Scenarios:** Defending rigorous research methodology\n\n## Goals\n- Maintain research quality through expert methodology\n- Protect against AI bias in evidence synthesis\n- Require methodological validation for any AI\n\n## Frustrations\n- AI introducing bias in evidence selection\n- Pressure to automate expert research judgment\n- Vendors without research methodology expertise',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 6. GLOBAL CLINICAL PROJECT LEAD - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'global_clinical_project_lead_automator',
    'Dr. Jennifer Clark - Global Clinical Project Lead Automator',
    E'**Role:** Global Clinical Project Lead\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 77/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Clark has automated trial monitoring, site performance tracking, and enrollment forecasting for her global trials. She champions AI tools to enable data-driven clinical decisions.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Global trial updates to leadership\n- **Pain:** 7/10 - Managing complex multi-country trials\n- **Actions:** 8/10 - AI-automated trial monitoring\n- **Needs:** 8/10 - Integrated trial management tools\n- **Emotions:** 8/10 - Enthusiastic about trial automation\n- **Scenarios:** Global trial automation initiatives\n\n## Goals\n- Real-time trial visibility through AI dashboards\n- Predictive enrollment models for all sites\n- Automate routine monitoring tasks\n\n## Frustrations\n- Varying site technology adoption globally\n- Legacy CTMS limitations\n- Budget constraints for AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'global_clinical_project_lead_orchestrator',
    'Dr. Michelle Lee - Global Clinical Project Lead Orchestrator',
    E'**Role:** Global Clinical Project Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 81/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Lee orchestrates AI integration across her global trial operations, connecting sites, CROs, data management, and regulatory teams through unified AI-powered platforms.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Cross-functional trial coordination\n- **Pain:** 8/10 - Integrating diverse trial stakeholders\n- **Actions:** 9/10 - Multi-stakeholder AI orchestration\n- **Needs:** 8/10 - Unified trial intelligence platform\n- **Emotions:** 8/10 - Energized by global coordination\n- **Scenarios:** Global trial AI integration initiatives\n\n## Goals\n- Create seamless data flow across trial stakeholders\n- Build integrated trial intelligence\n- Lead trial digitalization for global studies\n\n## Frustrations\n- Stakeholders at varying AI readiness\n- Regulatory variations across countries\n- CRO technology limitations',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'global_clinical_project_lead_learner',
    'Dr. Amanda White - Global Clinical Project Lead Learner',
    E'**Role:** Global Clinical Project Lead\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. White is actively learning AI capabilities for clinical trials through pilots and training. She sees potential for AI but needs to build confidence while maintaining trial integrity.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Trial program accountability\n- **Pain:** 7/10 - Keeping pace with clinical AI advancement\n- **Actions:** 5/10 - Exploratory AI learning\n- **Needs:** 7/10 - Clear clinical AI guidance\n- **Emotions:** 6/10 - Curious about clinical AI potential\n- **Scenarios:** Structured clinical AI skill building\n\n## Goals\n- Develop personal clinical AI competency\n- Identify best AI applications for trials\n- Build team AI readiness gradually\n\n## Frustrations\n- Limited time for learning amid trial operations\n- Overwhelming clinical AI vendor landscape\n- Difficulty evaluating AI claims for GCP',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'global_clinical_project_lead_skeptic',
    'Dr. Laura Johnson - Global Clinical Project Lead Skeptic',
    E'**Role:** Global Clinical Project Lead\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nDr. Johnson prefers proven clinical trial processes over AI experimentation. She focuses on delivering reliable trial outcomes using established methods and requires extensive proof before considering AI.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Trial quality accountability\n- **Pain:** 7/10 - Pressure to adopt AI tools\n- **Actions:** 4/10 - Minimal AI engagement\n- **Needs:** 7/10 - Validated clinical AI solutions\n- **Emotions:** 5/10 - Protective of trial integrity\n- **Scenarios:** Defending proven trial processes\n\n## Goals\n- Deliver reliable trial outcomes\n- Protect trials from disruptive experiments\n- Require proof before any AI adoption\n\n## Frustrations\n- Pressure to adopt AI without GCP validation\n- AI tools creating more issues than solving\n- Vendors without clinical trial understanding',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 7. SENIOR CLINICAL OPERATIONS MANAGER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_clinical_ops_manager_automator',
    'Stephanie Brown - Senior Clinical Operations Manager Automator',
    E'**Role:** Senior Clinical Operations Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Tactical\n\n## AI Profile\nStephanie has automated routine clinical operations including site monitoring reports, enrollment tracking, and query management. She champions AI to reduce administrative burden on clinical teams.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Clinical operations metrics reporting\n- **Pain:** 6/10 - Administrative burden reducing strategic time\n- **Actions:** 8/10 - AI-automated clinical workflows\n- **Needs:** 7/10 - Integrated clinical ops automation\n- **Emotions:** 8/10 - Enthusiastic about automation benefits\n- **Scenarios:** Team-level clinical automation\n\n## Goals\n- Reduce administrative tasks by 35% through AI\n- Enable team focus on strategic clinical activities\n- Build AI capabilities across team\n\n## Frustrations\n- Limited budget for team AI tools\n- IT support constraints\n- AI tools requiring extensive customization',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_clinical_ops_manager_orchestrator',
    'Katherine Davis - Senior Clinical Operations Manager Orchestrator',
    E'**Role:** Senior Clinical Operations Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Tactical\n\n## AI Profile\nKatherine orchestrates AI integration across clinical operations teams, connecting monitoring systems, project tracking, and site communications into unified operational platforms.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Cross-team coordination\n- **Pain:** 7/10 - Managing complex team dependencies\n- **Actions:** 9/10 - Multi-team AI coordination\n- **Needs:** 8/10 - Integrated operations platform\n- **Emotions:** 8/10 - Energized by coordination challenges\n- **Scenarios:** Team-level AI integration initiatives\n\n## Goals\n- Create seamless workflows across clinical teams\n- Build integrated clinical intelligence\n- Lead AI adoption within clinical operations\n\n## Frustrations\n- Teams at varying AI readiness\n- Legacy tools limiting integration\n- Competing team priorities',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_clinical_ops_manager_learner',
    'Rachel Wilson - Senior Clinical Operations Manager Learner',
    E'**Role:** Senior Clinical Operations Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 46/100\n**Work Complexity:** Tactical\n\n## AI Profile\nRachel is actively learning AI capabilities and exploring pilot opportunities for her team. She attends training, tests tools, and builds understanding before broader implementation.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Operations accountability\n- **Pain:** 6/10 - Keeping pace with AI advancement\n- **Actions:** 5/10 - Exploratory AI learning\n- **Needs:** 6/10 - Clear clinical AI guidance\n- **Emotions:** 6/10 - Curious about AI potential\n- **Scenarios:** Structured clinical AI skill building\n\n## Goals\n- Develop personal AI competency\n- Identify best AI applications for team\n- Build team AI readiness gradually\n\n## Frustrations\n- Limited time for learning\n- Overwhelming vendor landscape\n- Difficulty evaluating AI tool claims',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_clinical_ops_manager_skeptic',
    'Nancy Thompson - Senior Clinical Operations Manager Skeptic',
    E'**Role:** Senior Clinical Operations Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Tactical\n\n## AI Profile\nNancy prefers proven clinical operations processes over AI experimentation. She focuses on delivering reliable operations using established methods and requires extensive proof before considering AI.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Operations quality accountability\n- **Pain:** 6/10 - Pressure to adopt AI tools\n- **Actions:** 4/10 - Minimal AI engagement\n- **Needs:** 6/10 - Validated clinical AI solutions\n- **Emotions:** 5/10 - Protective of operations quality\n- **Scenarios:** Defending proven operational processes\n\n## Goals\n- Deliver reliable clinical operations\n- Protect team from disruptive experiments\n- Require proof before any AI adoption\n\n## Frustrations\n- Pressure to adopt AI without training\n- AI creating more work than saving\n- Vendors without clinical understanding',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 8-20: Remaining R&D/Clinical Operations Roles
-- (Abbreviated for file size - following same pattern)
-- =====================================================

-- 8. CLINICAL OPERATIONS MANAGER - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('clinical_ops_manager_automator', 'Emily Roberts - Clinical Operations Manager Automator', E'**Role:** Clinical Operations Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 74/100\n**Work Complexity:** Operational\n\n## AI Profile\nEmily has automated routine clinical operations tasks including site monitoring coordination, enrollment tracking, and query resolution workflows.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Reduce operational overhead through automation\n- Enable team focus on site relationships\n- Build AI capabilities across team', true, NOW(), NOW()),
('clinical_ops_manager_orchestrator', 'Hannah Kim - Clinical Operations Manager Orchestrator', E'**Role:** Clinical Operations Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 78/100\n**Work Complexity:** Operational\n\n## AI Profile\nHannah orchestrates AI integration across clinical operations workflows, connecting sites, CROs, and internal teams through unified platforms.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless clinical operations workflows\n- Build integrated site intelligence\n- Lead team AI adoption', true, NOW(), NOW()),
('clinical_ops_manager_learner', 'Sarah Miller - Clinical Operations Manager Learner', E'**Role:** Clinical Operations Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Operational\n\n## AI Profile\nSarah is exploring AI for clinical operations through careful pilots, testing tools while maintaining operational reliability.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for operations support\n- Build team AI competency\n- Maintain operational excellence', true, NOW(), NOW()),
('clinical_ops_manager_skeptic', 'Diana Wright - Clinical Operations Manager Skeptic', E'**Role:** Clinical Operations Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Operational\n\n## AI Profile\nDiana prioritizes operational reliability over AI innovation, requiring proven track records before any adoption.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain operational excellence\n- Protect team from technology disruptions\n- Require validation for any AI', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 9. CLINICAL OPERATIONS LIAISON - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('clinical_ops_liaison_automator', 'Helen Thompson - Clinical Operations Liaison Automator', E'**Role:** Clinical Operations Liaison\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 72/100\n**Work Complexity:** Operational\n\n## AI Profile\nHelen has automated communication tracking, meeting scheduling, and stakeholder updates using AI tools for efficient liaison activities.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 7/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Reduce administrative liaison tasks by 30%\n- Improve stakeholder communication efficiency\n- Enable focus on relationship building', true, NOW(), NOW()),
('clinical_ops_liaison_orchestrator', 'Marie Johnson - Clinical Operations Liaison Orchestrator', E'**Role:** Clinical Operations Liaison\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Operational\n\n## AI Profile\nMarie orchestrates AI-powered communication flows across clinical stakeholders, ensuring seamless information sharing.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 8/10\n\n## Goals\n- Create unified stakeholder communication platform\n- Build integrated liaison intelligence\n- Lead communication digitalization', true, NOW(), NOW()),
('clinical_ops_liaison_learner', 'Patricia Davis - Clinical Operations Liaison Learner', E'**Role:** Clinical Operations Liaison\n**Archetype:** LEARNER\n**AI Maturity Score:** 44/100\n**Work Complexity:** Operational\n\n## AI Profile\nPatricia is exploring AI for liaison activities through structured learning, testing communication tools.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 5/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for liaison support\n- Build communication AI competency\n- Maintain stakeholder relationships', true, NOW(), NOW()),
('clinical_ops_liaison_skeptic', 'Sandra Wilson - Clinical Operations Liaison Skeptic', E'**Role:** Clinical Operations Liaison\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 26/100\n**Work Complexity:** Operational\n\n## AI Profile\nSandra believes effective liaison requires human relationships that AI cannot replicate.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 3/10\n- **Needs:** 6/10\n- **Emotions:** 4/10\n\n## Goals\n- Maintain strong stakeholder relationships\n- Protect human-centric communication\n- Require proof for any AI adoption', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 10. SENIOR CLINICAL AFFAIRS MANAGER - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('senior_clinical_affairs_manager_automator', 'Lisa Anderson - Senior Clinical Affairs Manager Automator', E'**Role:** Senior Clinical Affairs Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 75/100\n**Work Complexity:** Tactical\n\n## AI Profile\nLisa has automated clinical evidence gathering, literature monitoring, and communication preparation using AI.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Reduce clinical landscape analysis time by 35%\n- Build AI evidence synthesis capabilities\n- Enable focus on strategic clinical affairs', true, NOW(), NOW()),
('senior_clinical_affairs_manager_orchestrator', 'Carol Martin - Senior Clinical Affairs Manager Orchestrator', E'**Role:** Senior Clinical Affairs Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 79/100\n**Work Complexity:** Tactical\n\n## AI Profile\nCarol orchestrates AI integration across clinical affairs workflows, connecting evidence sources with communication outputs.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless evidence-to-communication workflows\n- Build integrated clinical affairs intelligence\n- Lead team AI adoption', true, NOW(), NOW()),
('senior_clinical_affairs_manager_learner', 'Margaret Brown - Senior Clinical Affairs Manager Learner', E'**Role:** Senior Clinical Affairs Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Tactical\n\n## AI Profile\nMargaret is building AI capabilities for clinical affairs through structured pilots.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for clinical affairs support\n- Build team AI competency\n- Maintain clinical affairs quality', true, NOW(), NOW()),
('senior_clinical_affairs_manager_skeptic', 'Barbara Johnson - Senior Clinical Affairs Manager Skeptic', E'**Role:** Senior Clinical Affairs Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Tactical\n\n## AI Profile\nBarbara is skeptical of AI in clinical affairs, emphasizing expert judgment.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain clinical affairs quality through expertise\n- Protect against AI errors\n- Require proof for any AI adoption', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 11. TRIAL MANAGER - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('trial_manager_automator', 'Angela Chen - Trial Manager Automator', E'**Role:** Trial Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Tactical\n\n## AI Profile\nAngela has automated trial tracking, site performance monitoring, and enrollment forecasting using AI.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Real-time trial visibility through AI dashboards\n- Predictive enrollment for all sites\n- Automate routine trial management tasks', true, NOW(), NOW()),
('trial_manager_orchestrator', 'Jennifer Kim - Trial Manager Orchestrator', E'**Role:** Trial Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Tactical\n\n## AI Profile\nJennifer orchestrates AI across trial management workflows, connecting sites, data management, and monitoring.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless trial management workflows\n- Build integrated trial intelligence\n- Lead trial AI adoption', true, NOW(), NOW()),
('trial_manager_learner', 'Lisa Martinez - Trial Manager Learner', E'**Role:** Trial Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 46/100\n**Work Complexity:** Tactical\n\n## AI Profile\nLisa is exploring AI for trial management through careful pilots.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for trial support\n- Build team AI competency\n- Maintain trial quality', true, NOW(), NOW()),
('trial_manager_skeptic', 'Susan Wilson - Trial Manager Skeptic', E'**Role:** Trial Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Tactical\n\n## AI Profile\nSusan prioritizes GCP compliance over AI innovation.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain trial compliance through proven processes\n- Protect against AI risks\n- Require GCP validation for any AI', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 12. PRECLINICAL PROJECT MANAGER - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('preclinical_project_manager_automator', 'Karen Brown - Preclinical Project Manager Automator', E'**Role:** Preclinical Project Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 74/100\n**Work Complexity:** Tactical\n\n## AI Profile\nKaren has automated preclinical study tracking, data analysis, and report generation using AI.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Reduce preclinical reporting time by 30%\n- Build AI analytical capabilities\n- Enable focus on strategic decisions', true, NOW(), NOW()),
('preclinical_project_manager_orchestrator', 'Emily Davis - Preclinical Project Manager Orchestrator', E'**Role:** Preclinical Project Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 78/100\n**Work Complexity:** Tactical\n\n## AI Profile\nEmily orchestrates AI across preclinical workflows, connecting labs, data analysis, and regulatory documentation.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless preclinical data flows\n- Build integrated preclinical intelligence\n- Lead preclinical AI adoption', true, NOW(), NOW()),
('preclinical_project_manager_learner', 'Sarah Thompson - Preclinical Project Manager Learner', E'**Role:** Preclinical Project Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Tactical\n\n## AI Profile\nSarah is exploring AI for preclinical management through structured pilots.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for preclinical support\n- Build team AI competency\n- Maintain scientific rigor', true, NOW(), NOW()),
('preclinical_project_manager_skeptic', 'Nancy Garcia - Preclinical Project Manager Skeptic', E'**Role:** Preclinical Project Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 26/100\n**Work Complexity:** Tactical\n\n## AI Profile\nNancy prioritizes scientific rigor over AI experimentation.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain scientific quality through expertise\n- Protect against AI analytical errors\n- Require validation for any AI', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 13. SENIOR CLINICAL CONTENT MANAGER - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('senior_clinical_content_manager_automator', 'Amanda Chen - Senior Clinical Content Manager Automator', E'**Role:** Senior Clinical Content Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 77/100\n**Work Complexity:** Technical\n\n## AI Profile\nAmanda has automated clinical content creation, review workflows, and consistency checking using AI.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 8/10\n\n## Goals\n- Reduce content development time by 35%\n- Maintain scientific accuracy with AI\n- Build AI content capabilities', true, NOW(), NOW()),
('senior_clinical_content_manager_orchestrator', 'Jessica Park - Senior Clinical Content Manager Orchestrator', E'**Role:** Senior Clinical Content Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 81/100\n**Work Complexity:** Technical\n\n## AI Profile\nJessica orchestrates AI across content workflows, connecting templates, reviews, and publishing.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless AI content workflows\n- Build integrated content intelligence\n- Lead content AI adoption', true, NOW(), NOW()),
('senior_clinical_content_manager_learner', 'Michelle Rodriguez - Senior Clinical Content Manager Learner', E'**Role:** Senior Clinical Content Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 50/100\n**Work Complexity:** Technical\n\n## AI Profile\nMichelle is exploring AI for content management through careful pilots.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for content support\n- Build team AI competency\n- Maintain content quality', true, NOW(), NOW()),
('senior_clinical_content_manager_skeptic', 'Catherine Miller - Senior Clinical Content Manager Skeptic', E'**Role:** Senior Clinical Content Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Technical\n\n## AI Profile\nCatherine believes clinical content requires expert review that AI cannot replace.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain content quality through expertise\n- Protect against AI errors\n- Require proof for any AI', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 14. SENIOR OUTCOMES RESEARCHER - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('senior_outcomes_researcher_automator', 'Diana Lee - Senior Outcomes Researcher Automator', E'**Role:** Senior Outcomes Researcher\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Analytical\n\n## AI Profile\nDiana has automated literature searches, data extraction, and evidence synthesis using AI.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Reduce systematic review time by 50%\n- Build AI evidence synthesis capabilities\n- Enable rapid evidence generation', true, NOW(), NOW()),
('senior_outcomes_researcher_orchestrator', 'Helen Wang - Senior Outcomes Researcher Orchestrator', E'**Role:** Senior Outcomes Researcher\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 84/100\n**Work Complexity:** Analytical\n\n## AI Profile\nHelen orchestrates AI across research workflows, connecting literature, analysis, and communication.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless research workflows\n- Build integrated research intelligence\n- Lead research AI adoption', true, NOW(), NOW()),
('senior_outcomes_researcher_learner', 'Michelle Taylor - Senior Outcomes Researcher Learner', E'**Role:** Senior Outcomes Researcher\n**Archetype:** LEARNER\n**AI Maturity Score:** 52/100\n**Work Complexity:** Analytical\n\n## AI Profile\nMichelle is exploring AI for outcomes research through careful pilots.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 6/10\n- **Actions:** 6/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Evaluate AI for research support\n- Build AI research competency\n- Maintain methodological rigor', true, NOW(), NOW()),
('senior_outcomes_researcher_skeptic', 'Patricia Anderson - Senior Outcomes Researcher Skeptic', E'**Role:** Senior Outcomes Researcher\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Analytical\n\n## AI Profile\nPatricia believes rigorous research requires expert methodology that AI cannot replicate.\n\n## VPANES Scores\n- **Visibility:** 6/10\n- **Pain:** 7/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain research quality through expertise\n- Protect against AI bias\n- Require validation for any AI', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 15. SENIOR SAFETY SCIENTIST - Senior
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('senior_safety_scientist_automator', 'Dr. Elizabeth Chen - Senior Safety Scientist Automator', E'**Role:** Senior Safety Scientist\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 75/100\n**Work Complexity:** Analytical\n\n## AI Profile\nDr. Chen has automated safety signal detection, literature monitoring, and aggregate report generation using AI.\n\n## VPANES Scores\n- **Visibility:** 7/10\n- **Pain:** 7/10\n- **Actions:** 8/10\n- **Needs:** 8/10\n- **Emotions:** 7/10\n\n## Goals\n- Enhance signal detection through AI\n- Reduce aggregate report time by 30%\n- Build AI safety analytics', true, NOW(), NOW()),
('senior_safety_scientist_orchestrator', 'Dr. Victoria Park - Senior Safety Scientist Orchestrator', E'**Role:** Senior Safety Scientist\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 79/100\n**Work Complexity:** Analytical\n\n## AI Profile\nDr. Park orchestrates AI across safety workflows, connecting case processing, signal detection, and regulatory reporting.\n\n## VPANES Scores\n- **Visibility:** 7/10\n- **Pain:** 7/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless safety data flows\n- Build integrated safety intelligence\n- Lead safety AI adoption', true, NOW(), NOW()),
('senior_safety_scientist_learner', 'Dr. Maria Rodriguez - Senior Safety Scientist Learner', E'**Role:** Senior Safety Scientist\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Analytical\n\n## AI Profile\nDr. Rodriguez is exploring AI for safety science through careful pilots.\n\n## VPANES Scores\n- **Visibility:** 7/10\n- **Pain:** 6/10\n- **Actions:** 5/10\n- **Needs:** 7/10\n- **Emotions:** 6/10\n\n## Goals\n- Evaluate AI for safety analytics\n- Build team AI competency\n- Maintain safety rigor', true, NOW(), NOW()),
('senior_safety_scientist_skeptic', 'Dr. Catherine Miller - Senior Safety Scientist Skeptic', E'**Role:** Senior Safety Scientist\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 26/100\n**Work Complexity:** Analytical\n\n## AI Profile\nDr. Miller believes safety science requires expert judgment that AI cannot replace.\n\n## VPANES Scores\n- **Visibility:** 7/10\n- **Pain:** 8/10\n- **Actions:** 3/10\n- **Needs:** 8/10\n- **Emotions:** 4/10\n\n## Goals\n- Maintain safety excellence through expertise\n- Protect against AI safety errors\n- Require extensive validation', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 16. OUTCOMES RESEARCH SCIENTIST - Mid
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('outcomes_research_scientist_automator', 'Stephanie Lee - Outcomes Research Scientist Automator', E'**Role:** Outcomes Research Scientist\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Analytical\n\n## AI Profile\nStephanie uses AI for literature searches, data extraction, and evidence synthesis.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 8/10\n\n## Goals\n- Accelerate research through AI\n- Build AI analytical capabilities\n- Enable rapid evidence synthesis', true, NOW(), NOW()),
('outcomes_research_scientist_orchestrator', 'Rachel Wang - Outcomes Research Scientist Orchestrator', E'**Role:** Outcomes Research Scientist\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 79/100\n**Work Complexity:** Analytical\n\n## AI Profile\nRachel integrates AI tools across her research workflow for efficient evidence generation.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless research workflows\n- Build integrated analysis tools\n- Lead research AI adoption', true, NOW(), NOW()),
('outcomes_research_scientist_learner', 'Amy Brown - Outcomes Research Scientist Learner', E'**Role:** Outcomes Research Scientist\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Analytical\n\n## AI Profile\nAmy is learning AI tools for research through training and pilots.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 5/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Build AI research skills\n- Find best AI use cases\n- Maintain methodological rigor', true, NOW(), NOW()),
('outcomes_research_scientist_skeptic', 'Linda Garcia - Outcomes Research Scientist Skeptic', E'**Role:** Outcomes Research Scientist\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Analytical\n\n## AI Profile\nLinda prefers rigorous manual research methods.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 3/10\n- **Needs:** 6/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain research quality\n- Avoid AI bias\n- Require proof for adoption', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 17. RESEARCH SCIENTIST - Mid
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('research_scientist_automator', 'Jennifer Martinez - Research Scientist Automator', E'**Role:** Research Scientist\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 74/100\n**Work Complexity:** Analytical\n\n## AI Profile\nJennifer uses AI for data analysis, literature review, and experiment design optimization.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Accelerate research through AI analysis\n- Build AI experimental capabilities\n- Enable rapid discovery', true, NOW(), NOW()),
('research_scientist_orchestrator', 'Michelle Kim - Research Scientist Orchestrator', E'**Role:** Research Scientist\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 77/100\n**Work Complexity:** Analytical\n\n## AI Profile\nMichelle integrates AI tools across research workflow for efficient discovery.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless research workflows\n- Build integrated analysis tools\n- Lead research AI adoption', true, NOW(), NOW()),
('research_scientist_learner', 'Sarah Wilson - Research Scientist Learner', E'**Role:** Research Scientist\n**Archetype:** LEARNER\n**AI Maturity Score:** 46/100\n**Work Complexity:** Analytical\n\n## AI Profile\nSarah is learning AI tools for research through training and pilots.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 5/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Build AI research skills\n- Find best AI use cases\n- Maintain scientific rigor', true, NOW(), NOW()),
('research_scientist_skeptic', 'Nancy Davis - Research Scientist Skeptic', E'**Role:** Research Scientist\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 26/100\n**Work Complexity:** Analytical\n\n## AI Profile\nNancy prefers rigorous scientific methods over AI experimentation.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 3/10\n- **Needs:** 6/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain scientific quality\n- Avoid AI analytical errors\n- Require validation for adoption', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 18. BIOSTATISTICIAN - Mid
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('biostatistician_automator', 'Katherine Chen - Biostatistician Automator', E'**Role:** Biostatistician\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 78/100\n**Work Complexity:** Analytical\n\n## AI Profile\nKatherine uses AI for statistical analysis automation, code generation, and report preparation.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 8/10\n\n## Goals\n- Automate routine statistical analyses\n- Build AI statistical capabilities\n- Enable rapid trial analysis', true, NOW(), NOW()),
('biostatistician_orchestrator', 'Diana Park - Biostatistician Orchestrator', E'**Role:** Biostatistician\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 81/100\n**Work Complexity:** Analytical\n\n## AI Profile\nDiana integrates AI across statistical workflows, connecting data, analysis, and reporting.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 9/10\n- **Needs:** 8/10\n- **Emotions:** 8/10\n\n## Goals\n- Create seamless statistical workflows\n- Build integrated analytical tools\n- Lead statistical AI adoption', true, NOW(), NOW()),
('biostatistician_learner', 'Emily Thompson - Biostatistician Learner', E'**Role:** Biostatistician\n**Archetype:** LEARNER\n**AI Maturity Score:** 52/100\n**Work Complexity:** Analytical\n\n## AI Profile\nEmily is exploring AI for biostatistics through structured learning.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 5/10\n- **Actions:** 6/10\n- **Needs:** 6/10\n- **Emotions:** 7/10\n\n## Goals\n- Build AI statistical skills\n- Find best AI use cases\n- Maintain statistical rigor', true, NOW(), NOW()),
('biostatistician_skeptic', 'Barbara Johnson - Biostatistician Skeptic', E'**Role:** Biostatistician\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Analytical\n\n## AI Profile\nBarbara believes rigorous statistics require human judgment.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 4/10\n- **Needs:** 7/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain statistical quality\n- Avoid AI analytical errors\n- Require validation for adoption', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 19. CLINICAL RESEARCH ASSOCIATE - Mid
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('clinical_research_associate_automator', 'Amanda Chen - Clinical Research Associate Automator', E'**Role:** Clinical Research Associate\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 72/100\n**Work Complexity:** Operational\n\n## AI Profile\nAmanda uses AI for site monitoring preparation, data review, and visit report generation.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 7/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Reduce monitoring administrative tasks by 30%\n- Build AI monitoring capabilities\n- Enable focus on site relationships', true, NOW(), NOW()),
('clinical_research_associate_orchestrator', 'Jessica Park - Clinical Research Associate Orchestrator', E'**Role:** Clinical Research Associate\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 75/100\n**Work Complexity:** Operational\n\n## AI Profile\nJessica integrates AI across monitoring workflows for efficient site management.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 8/10\n- **Needs:** 7/10\n- **Emotions:** 7/10\n\n## Goals\n- Create seamless monitoring workflows\n- Build integrated site intelligence\n- Lead CRA AI adoption', true, NOW(), NOW()),
('clinical_research_associate_learner', 'Michelle Rodriguez - Clinical Research Associate Learner', E'**Role:** Clinical Research Associate\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Operational\n\n## AI Profile\nMichelle is learning AI tools for monitoring through training.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 5/10\n- **Actions:** 5/10\n- **Needs:** 6/10\n- **Emotions:** 6/10\n\n## Goals\n- Build AI monitoring skills\n- Find best AI use cases\n- Maintain GCP compliance', true, NOW(), NOW()),
('clinical_research_associate_skeptic', 'Laura Miller - Clinical Research Associate Skeptic', E'**Role:** Clinical Research Associate\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 26/100\n**Work Complexity:** Operational\n\n## AI Profile\nLaura believes effective monitoring requires human judgment and site relationships.\n\n## VPANES Scores\n- **Visibility:** 5/10\n- **Pain:** 6/10\n- **Actions:** 3/10\n- **Needs:** 6/10\n- **Emotions:** 5/10\n\n## Goals\n- Maintain monitoring quality\n- Protect site relationships\n- Require proof for adoption', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- 20. CLINICAL RESEARCH COORDINATOR - Entry
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES
('clinical_research_coordinator_automator', 'Stephanie Lee - Clinical Research Coordinator Automator', E'**Role:** Clinical Research Coordinator\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 68/100\n**Work Complexity:** Operational\n\n## AI Profile\nStephanie uses AI for scheduling, documentation, and patient communication workflows.\n\n## VPANES Scores\n- **Visibility:** 4/10\n- **Pain:** 6/10\n- **Actions:** 7/10\n- **Needs:** 6/10\n- **Emotions:** 7/10\n\n## Goals\n- Reduce administrative burden through AI\n- Build coordination AI skills\n- Enable focus on patient care', true, NOW(), NOW()),
('clinical_research_coordinator_orchestrator', 'Rachel Wang - Clinical Research Coordinator Orchestrator', E'**Role:** Clinical Research Coordinator\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 72/100\n**Work Complexity:** Operational\n\n## AI Profile\nRachel integrates AI across coordination workflows for efficient site operations.\n\n## VPANES Scores\n- **Visibility:** 4/10\n- **Pain:** 6/10\n- **Actions:** 7/10\n- **Needs:** 6/10\n- **Emotions:** 7/10\n\n## Goals\n- Create seamless coordination workflows\n- Build integrated site tools\n- Lead coordination AI adoption', true, NOW(), NOW()),
('clinical_research_coordinator_learner', 'Amy Brown - Clinical Research Coordinator Learner', E'**Role:** Clinical Research Coordinator\n**Archetype:** LEARNER\n**AI Maturity Score:** 42/100\n**Work Complexity:** Operational\n\n## AI Profile\nAmy is learning AI tools for coordination through on-the-job training.\n\n## VPANES Scores\n- **Visibility:** 4/10\n- **Pain:** 5/10\n- **Actions:** 4/10\n- **Needs:** 5/10\n- **Emotions:** 6/10\n\n## Goals\n- Build AI coordination skills\n- Find helpful AI tools\n- Maintain patient focus', true, NOW(), NOW()),
('clinical_research_coordinator_skeptic', 'Linda Garcia - Clinical Research Coordinator Skeptic', E'**Role:** Clinical Research Coordinator\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 24/100\n**Work Complexity:** Operational\n\n## AI Profile\nLinda prefers proven coordination methods over AI experimentation.\n\n## VPANES Scores\n- **Visibility:** 4/10\n- **Pain:** 5/10\n- **Actions:** 3/10\n- **Needs:** 5/10\n- **Emotions:** 4/10\n\n## Goals\n- Maintain patient care quality\n- Protect against AI confusion\n- Require simplicity over technology', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total R&D / Clinical Operations Personas: 80
-- Role Types: 20
-- Archetypes per role: 4 (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
--
-- Executive Level (1 role, 4 personas):
--   - VP of Clinical Operations
--
-- Director Level (4 roles, 16 personas):
--   - Director of Clinical Operations
--   - Director of Clinical Affairs
--   - Director of Clinical Content
--   - Director of Outcomes Research
--
-- Senior Level (10 roles, 40 personas):
--   - Global Clinical Project Lead
--   - Senior Clinical Operations Manager
--   - Clinical Operations Manager
--   - Clinical Operations Liaison
--   - Senior Clinical Affairs Manager
--   - Trial Manager
--   - Preclinical Project Manager
--   - Senior Clinical Content Manager
--   - Senior Outcomes Researcher
--   - Senior Safety Scientist
--
-- Mid Level (4 roles, 16 personas):
--   - Outcomes Research Scientist
--   - Research Scientist
--   - Biostatistician
--   - Clinical Research Associate
--
-- Entry Level (1 role, 4 personas):
--   - Clinical Research Coordinator
-- =====================================================

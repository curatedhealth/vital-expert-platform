-- =====================================================
-- REGULATORY AFFAIRS PERSONAS SEED DATA
-- Migration: 20251129_044_regulatory_affairs_personas_seed.sql
-- Description: Seeds 80 personas for 20 Regulatory Affairs role types
-- MECE Framework: 4 archetypes per role (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
-- =====================================================

-- Function: Regulatory Affairs
-- Core Role Types (20):
-- 1. Chief Regulatory Officer (CRO) - c_suite
-- 2. SVP Regulatory Affairs - executive
-- 3. VP Regulatory Strategy - executive
-- 4. VP Regulatory Submissions - executive
-- 5. Director of Regulatory Affairs - director
-- 6. Regulatory Compliance Director - director
-- 7. Regulatory Intelligence Director - director
-- 8. Head of Regulatory Operations - director
-- 9. CMC Regulatory Affairs Director - director
-- 10. Submissions Director - director
-- 11. Senior Regulatory Affairs Manager - senior
-- 12. Regulatory Compliance Manager - senior
-- 13. Senior Regulatory Writer - senior
-- 14. Regulatory Labeling Manager - senior
-- 15. Sr. CMC Regulatory Manager - senior
-- 16. Submissions Manager - senior
-- 17. Regulatory Writer - mid
-- 18. Regulatory Document Specialist - mid
-- 19. CMC Regulatory Specialist - mid
-- 20. Regulatory Compliance Specialist - mid

-- =====================================================
-- 1. CHIEF REGULATORY OFFICER (CRO) - C-Suite
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cro_automator',
    'Victoria Chen - Chief Regulatory Officer Automator',
    E'**Role:** Chief Regulatory Officer\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 88/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nVictoria has transformed regulatory operations through AI-driven submission intelligence and automated compliance monitoring. She champions predictive regulatory analytics that anticipate agency feedback and optimize approval timelines.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Board-level regulatory strategy presentations\n- **Pain:** 7/10 - Global harmonization across 100+ markets\n- **Actions:** 9/10 - AI-automated regulatory intelligence dashboards\n- **Needs:** 9/10 - Predictive approval timeline forecasting\n- **Emotions:** 8/10 - Confident in AI-augmented regulatory strategy\n- **Scenarios:** Enterprise regulatory transformation initiatives\n\n## Goals\n- Achieve industry-leading approval cycle times through AI optimization\n- Build predictive regulatory intelligence capabilities\n- Transform submission operations with automation\n\n## Frustrations\n- Legacy submission systems incompatible with AI integration\n- Regulatory agencies slow to adopt digital submissions\n- Board pressure for faster approvals without understanding regulatory complexity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cro_orchestrator',
    'Margaret Sullivan - Chief Regulatory Officer Orchestrator',
    E'**Role:** Chief Regulatory Officer\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 92/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nMargaret orchestrates a global regulatory AI transformation, integrating submission automation, regulatory intelligence, and compliance monitoring across all therapeutic areas. She leads industry consortiums on AI adoption in regulatory affairs.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Industry thought leader on regulatory AI\n- **Pain:** 8/10 - Coordinating global regulatory AI strategy\n- **Actions:** 10/10 - Multi-system AI orchestration across regions\n- **Needs:** 10/10 - Unified regulatory data platform vision\n- **Emotions:** 9/10 - Visionary confidence in regulatory transformation\n- **Scenarios:** Industry-wide regulatory modernization leadership\n\n## Goals\n- Lead industry adoption of AI-powered regulatory submissions\n- Create integrated global regulatory intelligence ecosystem\n- Transform regulatory affairs into strategic business advantage\n\n## Frustrations\n- Fragmented regulatory systems across acquired companies\n- Varying AI readiness across global regulatory teams\n- Regulatory agencies with inconsistent digital maturity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cro_learner',
    'Patricia Adams - Chief Regulatory Officer Learner',
    E'**Role:** Chief Regulatory Officer\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nPatricia recognizes AI potential for regulatory affairs but approaches adoption methodically. She prioritizes understanding AI capabilities before large-scale implementation, focusing on proven use cases with clear regulatory benefit.\n\n## VPANES Scores\n- **Visibility:** 10/10 - C-suite regulatory accountability\n- **Pain:** 8/10 - Balancing innovation pressure with regulatory caution\n- **Actions:** 6/10 - Piloting AI in low-risk regulatory workflows\n- **Needs:** 7/10 - Evidence-based AI implementation roadmap\n- **Emotions:** 6/10 - Cautiously optimistic about AI potential\n- **Scenarios:** Conservative AI adoption with validation focus\n\n## Goals\n- Develop AI literacy across regulatory leadership team\n- Identify high-value, low-risk AI pilot opportunities\n- Build internal expertise before vendor dependency\n\n## Frustrations\n- AI vendors overpromising regulatory transformation capabilities\n- Pressure to adopt AI without adequate validation\n- Limited case studies of AI success in regulated environments',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cro_skeptic',
    'Eleanor Richardson - Chief Regulatory Officer Skeptic',
    E'**Role:** Chief Regulatory Officer\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Strategic/Enterprise\n\n## AI Profile\nEleanor maintains healthy skepticism about AI in regulatory affairs, emphasizing that regulatory submissions are too critical for unproven technology. She focuses on validation, audit trails, and regulatory agency acceptance before any AI adoption.\n\n## VPANES Scores\n- **Visibility:** 10/10 - Ultimate regulatory accountability to board\n- **Pain:** 9/10 - Managing AI pressure while protecting regulatory integrity\n- **Actions:** 4/10 - Minimal AI adoption, maximum validation requirements\n- **Needs:** 8/10 - Regulatory agency guidance on AI acceptability\n- **Emotions:** 5/10 - Protective of regulatory reputation\n- **Scenarios:** Rigorous validation before any AI implementation\n\n## Goals\n- Ensure zero regulatory risk from AI implementation\n- Maintain agency relationships built on trust and quality\n- Protect company from AI-related regulatory failures\n\n## Frustrations\n- Executives pushing AI without understanding regulatory consequences\n- Unclear regulatory agency positions on AI-generated content\n- Vendors unable to demonstrate regulatory-grade validation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 2. SVP REGULATORY AFFAIRS - Executive
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'svp_regulatory_affairs_automator',
    'Jennifer Martinez - SVP Regulatory Affairs Automator',
    E'**Role:** SVP Regulatory Affairs\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 85/100\n**Work Complexity:** Strategic\n\n## AI Profile\nJennifer leverages AI to automate regulatory intelligence gathering, submission tracking, and compliance monitoring across her portfolio. She has built automated dashboards that predict regulatory risks and optimize submission timelines.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Executive committee regulatory updates\n- **Pain:** 7/10 - Managing complexity across multiple therapeutic areas\n- **Actions:** 9/10 - AI-powered regulatory portfolio management\n- **Needs:** 8/10 - Integrated regulatory intelligence platform\n- **Emotions:** 8/10 - Confident in automation ROI\n- **Scenarios:** Portfolio-wide regulatory automation initiatives\n\n## Goals\n- Reduce submission cycle time by 30% through automation\n- Build predictive regulatory risk models\n- Standardize AI tools across regulatory teams\n\n## Frustrations\n- Inconsistent data quality across legacy systems\n- Teams resistant to changing established processes\n- Budget constraints limiting AI tool acquisition',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'svp_regulatory_affairs_orchestrator',
    'Catherine Wong - SVP Regulatory Affairs Orchestrator',
    E'**Role:** SVP Regulatory Affairs\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 90/100\n**Work Complexity:** Strategic\n\n## AI Profile\nCatherine orchestrates an integrated AI ecosystem connecting regulatory intelligence, submission automation, labeling management, and compliance monitoring. She leads cross-functional AI initiatives spanning R&D, quality, and commercial teams.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Cross-functional regulatory leadership\n- **Pain:** 8/10 - Integrating disparate regulatory systems\n- **Actions:** 10/10 - Multi-system AI orchestration\n- **Needs:** 9/10 - Unified regulatory data architecture\n- **Emotions:** 9/10 - Energized by transformation complexity\n- **Scenarios:** Enterprise regulatory AI transformation programs\n\n## Goals\n- Create seamless regulatory data flow across all systems\n- Build AI-native regulatory operations model\n- Lead industry benchmarking on regulatory AI maturity\n\n## Frustrations\n- Legacy system integration complexity\n- Competing priorities across functional stakeholders\n- Pace of AI evolution outstripping organizational capacity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'svp_regulatory_affairs_learner',
    'Barbara Thompson - SVP Regulatory Affairs Learner',
    E'**Role:** SVP Regulatory Affairs\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Strategic\n\n## AI Profile\nBarbara is building her AI fluency through structured learning and pilot projects. She recognizes AI potential but wants to understand capabilities deeply before committing significant resources to implementation.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Executive regulatory accountability\n- **Pain:** 7/10 - Keeping pace with AI advancement\n- **Actions:** 6/10 - Structured AI pilots and training\n- **Needs:** 7/10 - Clear AI implementation framework\n- **Emotions:** 6/10 - Curious but cautious about AI adoption\n- **Scenarios:** Methodical AI capability building\n\n## Goals\n- Develop personal AI expertise to lead transformation\n- Identify quick-win AI applications for team confidence\n- Build AI fluency across regulatory leadership\n\n## Frustrations\n- Overwhelming AI vendor landscape\n- Difficulty distinguishing AI hype from reality\n- Limited time for learning amid operational demands',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'svp_regulatory_affairs_skeptic',
    'Diane Foster - SVP Regulatory Affairs Skeptic',
    E'**Role:** SVP Regulatory Affairs\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 25/100\n**Work Complexity:** Strategic\n\n## AI Profile\nDiane prioritizes regulatory quality and agency relationships over AI innovation. She has seen too many technology initiatives fail in regulatory contexts and requires extensive proof before endorsing AI adoption.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Accountable for regulatory outcomes\n- **Pain:** 8/10 - Pressure to adopt unproven AI technology\n- **Actions:** 4/10 - Minimal AI engagement, focus on proven processes\n- **Needs:** 8/10 - Validated AI solutions with regulatory track record\n- **Emotions:** 5/10 - Protective of hard-won regulatory credibility\n- **Scenarios:** Defending traditional approaches against AI pressure\n\n## Goals\n- Maintain flawless regulatory submission record\n- Protect team from disruptive technology experiments\n- Require rigorous validation for any AI implementation\n\n## Frustrations\n- AI enthusiasm without understanding regulatory stakes\n- Vendors with no regulatory domain expertise\n- Pressure to be innovative rather than reliable',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 3. VP REGULATORY STRATEGY - Executive
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_strategy_automator',
    'Michelle Liu - VP Regulatory Strategy Automator',
    E'**Role:** VP Regulatory Strategy\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 82/100\n**Work Complexity:** Strategic\n\n## AI Profile\nMichelle uses AI to automate competitive regulatory intelligence, pathway analysis, and strategy scenario modeling. Her team leverages AI to rapidly assess regulatory landscapes and identify optimal approval pathways.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Strategic regulatory recommendations to leadership\n- **Pain:** 7/10 - Rapidly evolving regulatory landscapes globally\n- **Actions:** 9/10 - AI-automated regulatory intelligence and modeling\n- **Needs:** 8/10 - Real-time regulatory landscape monitoring\n- **Emotions:** 8/10 - Confident in AI-enhanced strategy\n- **Scenarios:** AI-driven regulatory pathway optimization\n\n## Goals\n- Reduce regulatory strategy development time by 40%\n- Build predictive models for regulatory outcomes\n- Automate competitive regulatory intelligence\n\n## Frustrations\n- Data gaps in regulatory intelligence databases\n- AI models struggling with regulatory nuance\n- Strategy changes faster than AI models can adapt',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_strategy_orchestrator',
    'Amanda Peterson - VP Regulatory Strategy Orchestrator',
    E'**Role:** VP Regulatory Strategy\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 88/100\n**Work Complexity:** Strategic\n\n## AI Profile\nAmanda orchestrates an AI-powered strategic regulatory intelligence network connecting market intelligence, competitive analysis, scientific landscape monitoring, and health authority communications into unified strategy platforms.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Strategic regulatory guidance across portfolio\n- **Pain:** 8/10 - Integrating diverse intelligence sources\n- **Actions:** 10/10 - Multi-source AI intelligence orchestration\n- **Needs:** 9/10 - Unified strategic intelligence platform\n- **Emotions:** 9/10 - Thrives on strategic complexity\n- **Scenarios:** Enterprise regulatory strategy transformation\n\n## Goals\n- Create real-time regulatory strategy decision support system\n- Integrate AI across all strategic planning processes\n- Build predictive regulatory environment models\n\n## Frustrations\n- Siloed intelligence across functional teams\n- Legacy strategy processes resistant to AI integration\n- Regulatory uncertainty undermining AI predictions',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_strategy_learner',
    'Rebecca Harris - VP Regulatory Strategy Learner',
    E'**Role:** VP Regulatory Strategy\n**Archetype:** LEARNER\n**AI Maturity Score:** 50/100\n**Work Complexity:** Strategic\n\n## AI Profile\nRebecca is actively developing AI capabilities for her strategy team through structured pilots. She focuses on learning how AI can augment strategic analysis while maintaining the human judgment essential for regulatory strategy.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Strategic regulatory recommendations\n- **Pain:** 7/10 - Balancing AI adoption with strategy quality\n- **Actions:** 6/10 - Pilot AI projects in strategic analysis\n- **Needs:** 7/10 - Clear AI value demonstration in strategy\n- **Emotions:** 7/10 - Optimistic about AI potential\n- **Scenarios:** Structured AI capability building in strategy\n\n## Goals\n- Build AI literacy across strategy team\n- Identify highest-value AI applications for strategy\n- Develop hybrid human-AI strategy processes\n\n## Frustrations\n- AI tools lacking regulatory domain understanding\n- Difficulty quantifying AI value in strategic decisions\n- Team members at varying AI readiness levels',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_strategy_skeptic',
    'Sharon Williams - VP Regulatory Strategy Skeptic',
    E'**Role:** VP Regulatory Strategy\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Strategic\n\n## AI Profile\nSharon believes regulatory strategy requires human expertise, relationships, and judgment that AI cannot replicate. She views AI as potentially useful for data gathering but dangerous for strategic recommendations.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Strategic regulatory accountability\n- **Pain:** 8/10 - Pressure to adopt AI in strategy development\n- **Actions:** 4/10 - Limited AI use, maximum human oversight\n- **Needs:** 8/10 - Proof of AI value in regulated strategy contexts\n- **Emotions:** 5/10 - Protective of strategy quality and reputation\n- **Scenarios:** Defending human-centric strategy approach\n\n## Goals\n- Maintain strategy quality through human expertise\n- Require rigorous validation for any AI in strategy\n- Protect against AI-driven strategy failures\n\n## Frustrations\n- AI proponents dismissing regulatory strategy complexity\n- Executives expecting AI to replace strategic judgment\n- Vendors overpromising AI strategic capabilities',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 4. VP REGULATORY SUBMISSIONS - Executive
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_submissions_automator',
    'Linda Chang - VP Regulatory Submissions Automator',
    E'**Role:** VP Regulatory Submissions\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 84/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nLinda has automated submission assembly, document QC, and publishing workflows using AI. Her team leverages AI-powered tools for cross-reference validation, consistency checking, and submission health monitoring.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Submission milestone accountability\n- **Pain:** 7/10 - Managing complex multi-country submissions\n- **Actions:** 9/10 - AI-automated submission workflows\n- **Needs:** 8/10 - End-to-end submission automation platform\n- **Emotions:** 8/10 - Confident in automation benefits\n- **Scenarios:** High-volume submission automation initiatives\n\n## Goals\n- Achieve 50% reduction in submission assembly time\n- Zero submission deficiencies through AI QC\n- Standardize AI tools across all submission teams\n\n## Frustrations\n- Legacy document management systems limiting automation\n- Varying agency requirements complicating standardization\n- Resource constraints for AI tool validation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_submissions_orchestrator',
    'Christina Park - VP Regulatory Submissions Orchestrator',
    E'**Role:** VP Regulatory Submissions\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 89/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nChristina orchestrates an integrated AI submission ecosystem connecting document management, publishing, regulatory information management, and agency communication systems. She leads digital transformation of end-to-end submission operations.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Global submission operations leadership\n- **Pain:** 8/10 - Coordinating complex multi-system integrations\n- **Actions:** 10/10 - Enterprise submission AI orchestration\n- **Needs:** 9/10 - Unified intelligent submission platform\n- **Emotions:** 9/10 - Energized by transformation scope\n- **Scenarios:** End-to-end submission digitalization programs\n\n## Goals\n- Create fully integrated AI submission operations\n- Build self-optimizing submission workflows\n- Lead industry submission automation benchmarking\n\n## Frustrations\n- System integration complexity across vendors\n- Change management across global submission teams\n- Pace of regulatory digitalization varying by agency',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_submissions_learner',
    'Dorothy Nelson - VP Regulatory Submissions Learner',
    E'**Role:** VP Regulatory Submissions\n**Archetype:** LEARNER\n**AI Maturity Score:** 52/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nDorothy is systematically building AI capabilities in her submission organization through targeted pilots and training. She focuses on demonstrating clear ROI before expanding AI adoption.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Submission quality accountability\n- **Pain:** 7/10 - Balancing innovation with submission reliability\n- **Actions:** 6/10 - Structured AI pilots in submission workflows\n- **Needs:** 7/10 - Proven AI tools with regulatory validation\n- **Emotions:** 6/10 - Cautiously optimistic about AI potential\n- **Scenarios:** Incremental AI capability building\n\n## Goals\n- Build AI competency across submission teams\n- Identify quick-win automation opportunities\n- Develop AI implementation playbook for submissions\n\n## Frustrations\n- AI validation burden in regulated environment\n- Team members overwhelmed by technology change\n- Difficulty finding AI tools designed for submissions',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'vp_regulatory_submissions_skeptic',
    'Nancy Cooper - VP Regulatory Submissions Skeptic',
    E'**Role:** VP Regulatory Submissions\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nNancy has seen submission automation projects fail and is skeptical of AI promises. She emphasizes that submission quality is non-negotiable and requires proven, validated solutions before any adoption.\n\n## VPANES Scores\n- **Visibility:** 9/10 - Submission quality accountability\n- **Pain:** 8/10 - Pressure to adopt AI without adequate validation\n- **Actions:** 4/10 - Minimal AI, maximum validation requirements\n- **Needs:** 8/10 - Extensively validated AI submission tools\n- **Emotions:** 5/10 - Protective of submission quality reputation\n- **Scenarios:** Rigorous validation for any AI implementation\n\n## Goals\n- Maintain perfect submission quality record\n- Protect team from disruptive technology experiments\n- Require extensive proof before any AI adoption\n\n## Frustrations\n- AI vendors without regulatory submission experience\n- Pressure to be innovative rather than reliable\n- Insufficient validation standards for AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 5. DIRECTOR OF REGULATORY AFFAIRS - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_regulatory_affairs_automator',
    'Karen Mitchell - Director Regulatory Affairs Automator',
    E'**Role:** Director of Regulatory Affairs\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 78/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nKaren has automated daily regulatory intelligence monitoring, meeting preparation, and correspondence tracking. Her team uses AI to streamline regulatory workflows and focus on high-value strategic activities.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Therapeutic area regulatory leadership\n- **Pain:** 7/10 - Managing complex regulatory timelines\n- **Actions:** 8/10 - AI-automated regulatory workflows\n- **Needs:** 8/10 - Integrated regulatory management platform\n- **Emotions:** 8/10 - Enthusiastic about automation benefits\n- **Scenarios:** Team-level regulatory automation initiatives\n\n## Goals\n- Reduce administrative burden through AI automation\n- Enable team focus on strategic regulatory activities\n- Build AI-powered regulatory dashboards\n\n## Frustrations\n- Limited IT support for regulatory AI tools\n- AI tools requiring significant customization\n- Budget constraints for team-level AI adoption',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_regulatory_affairs_orchestrator',
    'Susan Taylor - Director Regulatory Affairs Orchestrator',
    E'**Role:** Director of Regulatory Affairs\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 83/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nSusan orchestrates AI integration across her regulatory portfolio, connecting submission teams, labeling specialists, and compliance monitors through unified AI platforms. She leads cross-functional regulatory AI initiatives.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-team regulatory coordination\n- **Pain:** 7/10 - Managing diverse regulatory requirements\n- **Actions:** 9/10 - Multi-team AI orchestration\n- **Needs:** 8/10 - Unified team regulatory AI platform\n- **Emotions:** 8/10 - Energized by coordination challenges\n- **Scenarios:** Portfolio-wide regulatory AI integration\n\n## Goals\n- Create seamless regulatory workflows across teams\n- Build integrated regulatory intelligence sharing\n- Lead AI adoption across regulatory functions\n\n## Frustrations\n- Teams at varying AI readiness levels\n- Competing priorities across stakeholders\n- Legacy processes resistant to change',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_regulatory_affairs_learner',
    'Angela Davis - Director Regulatory Affairs Learner',
    E'**Role:** Director of Regulatory Affairs\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nAngela is actively learning AI capabilities through industry conferences, vendor demos, and small pilot projects. She wants to bring AI benefits to her team but needs to build confidence first.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Regulatory program accountability\n- **Pain:** 7/10 - Keeping pace with AI advancement\n- **Actions:** 5/10 - Exploratory AI learning activities\n- **Needs:** 7/10 - Clear AI implementation guidance\n- **Emotions:** 6/10 - Curious but uncertain about AI path\n- **Scenarios:** Structured AI learning and exploration\n\n## Goals\n- Develop personal AI competency\n- Identify best AI opportunities for team\n- Build team AI readiness gradually\n\n## Frustrations\n- Overwhelming AI information landscape\n- Limited time for learning amid operations\n- Difficulty evaluating AI vendor claims',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'director_regulatory_affairs_skeptic',
    'Janet Robinson - Director Regulatory Affairs Skeptic',
    E'**Role:** Director of Regulatory Affairs\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nJanet is skeptical of AI in regulatory affairs, having seen previous technology initiatives fail. She prioritizes proven processes and human expertise over experimental AI tools.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Regulatory quality accountability\n- **Pain:** 7/10 - Pressure to adopt unproven technology\n- **Actions:** 4/10 - Minimal AI engagement\n- **Needs:** 7/10 - Extensively validated AI solutions\n- **Emotions:** 5/10 - Protective of team and quality\n- **Scenarios:** Defending proven approaches\n\n## Goals\n- Maintain regulatory quality through proven processes\n- Protect team from disruptive experiments\n- Require extensive proof for any AI adoption\n\n## Frustrations\n- Pressure to adopt AI without understanding risks\n- Vendors without regulatory domain expertise\n- Leadership expecting quick AI wins',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 6. REGULATORY COMPLIANCE DIRECTOR - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_director_automator',
    'Christine Anderson - Regulatory Compliance Director Automator',
    E'**Role:** Regulatory Compliance Director\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nChristine has automated compliance monitoring, deviation tracking, and audit preparation using AI. Her team uses AI-powered dashboards for real-time compliance status across all regulatory commitments.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Compliance status to senior leadership\n- **Pain:** 7/10 - Managing complex compliance landscape\n- **Actions:** 8/10 - AI-automated compliance monitoring\n- **Needs:** 8/10 - Integrated compliance intelligence platform\n- **Emotions:** 8/10 - Confident in automation value\n- **Scenarios:** Compliance automation initiatives\n\n## Goals\n- Real-time compliance visibility through AI dashboards\n- Automate routine compliance checks and reporting\n- Predict compliance risks before they materialize\n\n## Frustrations\n- Data quality issues undermining AI accuracy\n- Legacy compliance systems lacking AI integration\n- Resource constraints for compliance AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_director_orchestrator',
    'Melissa Brown - Regulatory Compliance Director Orchestrator',
    E'**Role:** Regulatory Compliance Director\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 85/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nMelissa orchestrates an integrated AI compliance ecosystem connecting commitment tracking, deviation management, audit preparation, and regulatory change monitoring across all functions.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-functional compliance coordination\n- **Pain:** 8/10 - Integrating compliance across functions\n- **Actions:** 9/10 - Enterprise compliance AI orchestration\n- **Needs:** 9/10 - Unified compliance management platform\n- **Emotions:** 8/10 - Energized by integration challenges\n- **Scenarios:** Enterprise compliance AI transformation\n\n## Goals\n- Create seamless compliance data flow across systems\n- Build predictive compliance risk management\n- Lead compliance AI integration initiatives\n\n## Frustrations\n- Siloed compliance data across functions\n- Varying compliance maturity across teams\n- Resistance to standardized compliance processes',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_director_learner',
    'Kimberly White - Regulatory Compliance Director Learner',
    E'**Role:** Regulatory Compliance Director\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nKimberly is building AI capabilities for compliance monitoring through structured pilots. She recognizes AI potential but needs to ensure any implementation meets rigorous compliance requirements.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Compliance accountability\n- **Pain:** 7/10 - Balancing innovation with compliance rigor\n- **Actions:** 6/10 - Careful AI pilots in compliance workflows\n- **Needs:** 7/10 - Validated AI compliance tools\n- **Emotions:** 6/10 - Cautiously exploring AI potential\n- **Scenarios:** Methodical AI capability building\n\n## Goals\n- Develop AI literacy for compliance applications\n- Identify low-risk AI pilot opportunities\n- Build team readiness for AI adoption\n\n## Frustrations\n- AI tools lacking compliance domain understanding\n- Validation requirements slowing AI adoption\n- Limited resources for AI experimentation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_director_skeptic',
    'Laura Garcia - Regulatory Compliance Director Skeptic',
    E'**Role:** Regulatory Compliance Director\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 25/100\n**Work Complexity:** Tactical/Strategic\n\n## AI Profile\nLaura is highly skeptical of AI in compliance functions, emphasizing that compliance failures have serious consequences. She requires extensive validation and regulatory precedent before considering any AI adoption.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Compliance accountability\n- **Pain:** 8/10 - Pressure to adopt AI in high-risk area\n- **Actions:** 3/10 - Minimal AI engagement\n- **Needs:** 8/10 - Regulatory acceptance of AI in compliance\n- **Emotions:** 4/10 - Protective of compliance integrity\n- **Scenarios:** Defending proven compliance approaches\n\n## Goals\n- Maintain zero-deficiency compliance record\n- Protect against AI-related compliance failures\n- Require regulatory guidance before AI adoption\n\n## Frustrations\n- Pressure to adopt AI without understanding compliance risks\n- No regulatory guidance on AI in compliance\n- Vendors unable to demonstrate compliance validation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 7. REGULATORY INTELLIGENCE DIRECTOR - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_intelligence_director_automator',
    'Rachel Green - Regulatory Intelligence Director Automator',
    E'**Role:** Regulatory Intelligence Director\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 86/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nRachel has automated regulatory intelligence gathering, analysis, and dissemination using AI. Her team leverages NLP to monitor global regulatory developments and auto-generate impact assessments.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Strategic intelligence to leadership\n- **Pain:** 6/10 - Information overload from global sources\n- **Actions:** 9/10 - AI-automated intelligence workflows\n- **Needs:** 8/10 - Advanced AI intelligence platform\n- **Emotions:** 9/10 - Enthusiastic about AI capabilities\n- **Scenarios:** Regulatory intelligence automation leadership\n\n## Goals\n- Real-time global regulatory monitoring through AI\n- Auto-generate regulatory change impact assessments\n- Build predictive regulatory trend models\n\n## Frustrations\n- Data quality from unstructured regulatory sources\n- AI models missing regulatory nuance\n- Integration with legacy regulatory systems',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_intelligence_director_orchestrator',
    'Stephanie Lee - Regulatory Intelligence Director Orchestrator',
    E'**Role:** Regulatory Intelligence Director\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 90/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nStephanie orchestrates an AI-powered regulatory intelligence network connecting global sources, competitive intelligence, scientific publications, and health authority communications into unified insights platforms.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Strategic intelligence leadership\n- **Pain:** 7/10 - Integrating diverse intelligence sources\n- **Actions:** 10/10 - Multi-source AI intelligence orchestration\n- **Needs:** 9/10 - Unified intelligent insights platform\n- **Emotions:** 9/10 - Thrives on intelligence complexity\n- **Scenarios:** Enterprise regulatory intelligence transformation\n\n## Goals\n- Create integrated regulatory intelligence ecosystem\n- Build AI-powered predictive regulatory analytics\n- Lead industry intelligence AI benchmarking\n\n## Frustrations\n- Siloed intelligence across organizational boundaries\n- Varying data quality across sources\n- Pace of AI advancement outstripping team capacity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_intelligence_director_learner',
    'Amy Wilson - Regulatory Intelligence Director Learner',
    E'**Role:** Regulatory Intelligence Director\n**Archetype:** LEARNER\n**AI Maturity Score:** 55/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nAmy is actively building AI capabilities for regulatory intelligence through vendor partnerships and pilot projects. She sees AI as essential for managing information overload but needs to demonstrate clear value.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Intelligence quality accountability\n- **Pain:** 7/10 - Information overload without AI\n- **Actions:** 6/10 - Structured AI pilots in intelligence\n- **Needs:** 7/10 - Proven AI intelligence tools\n- **Emotions:** 7/10 - Optimistic about AI potential\n- **Scenarios:** Methodical AI capability development\n\n## Goals\n- Build AI competency for intelligence analysis\n- Demonstrate AI ROI in intelligence workflows\n- Develop hybrid human-AI intelligence processes\n\n## Frustrations\n- AI tools requiring significant training data\n- Difficulty measuring AI intelligence quality\n- Limited resources for AI experimentation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_intelligence_director_skeptic',
    'Nicole Martin - Regulatory Intelligence Director Skeptic',
    E'**Role:** Regulatory Intelligence Director\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 32/100\n**Work Complexity:** Analytical/Strategic\n\n## AI Profile\nNicole is skeptical of AI in regulatory intelligence, emphasizing that AI cannot replicate the nuanced understanding required for strategic intelligence. She prefers human analysts for critical assessments.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Intelligence quality accountability\n- **Pain:** 7/10 - Pressure to adopt AI for intelligence\n- **Actions:** 4/10 - Limited AI use, human validation required\n- **Needs:** 7/10 - AI that augments rather than replaces analysts\n- **Emotions:** 5/10 - Protective of intelligence quality\n- **Scenarios:** Defending human-centric intelligence approach\n\n## Goals\n- Maintain intelligence quality through human expertise\n- Require AI to support not replace human analysis\n- Validate AI outputs against human judgment\n\n## Frustrations\n- AI missing critical regulatory context and nuance\n- Pressure to automate inherently human tasks\n- Vendors overpromising AI intelligence capabilities',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 8. HEAD OF REGULATORY OPERATIONS - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'head_regulatory_operations_automator',
    'Jessica Chen - Head of Regulatory Operations Automator',
    E'**Role:** Head of Regulatory Operations\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 82/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nJessica has automated core regulatory operations including document management, publishing workflows, and project tracking. Her team uses AI to optimize submission timelines and resource allocation.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Operations metrics to leadership\n- **Pain:** 7/10 - Managing operational complexity at scale\n- **Actions:** 9/10 - AI-automated operations workflows\n- **Needs:** 8/10 - Integrated operations automation platform\n- **Emotions:** 8/10 - Confident in operational automation\n- **Scenarios:** Regulatory operations automation initiatives\n\n## Goals\n- Reduce operational overhead by 40% through automation\n- Build AI-powered resource planning tools\n- Standardize automated workflows across teams\n\n## Frustrations\n- Legacy systems limiting automation potential\n- Resistance to process standardization\n- Budget constraints for operations AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'head_regulatory_operations_orchestrator',
    'Emily Roberts - Head of Regulatory Operations Orchestrator',
    E'**Role:** Head of Regulatory Operations\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 87/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nEmily orchestrates an integrated AI operations ecosystem connecting document management, project tracking, resource planning, and quality management across global regulatory operations.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Global operations coordination\n- **Pain:** 8/10 - Integrating operations across regions\n- **Actions:** 10/10 - Enterprise operations AI orchestration\n- **Needs:** 9/10 - Unified intelligent operations platform\n- **Emotions:** 9/10 - Energized by operational complexity\n- **Scenarios:** Enterprise operations transformation programs\n\n## Goals\n- Create seamless global operations workflows\n- Build self-optimizing operations processes\n- Lead operations AI maturity advancement\n\n## Frustrations\n- Regional variations in operations processes\n- Legacy system integration complexity\n- Change management across global teams',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'head_regulatory_operations_learner',
    'Hannah Kim - Head of Regulatory Operations Learner',
    E'**Role:** Head of Regulatory Operations\n**Archetype:** LEARNER\n**AI Maturity Score:** 50/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nHannah is building AI capabilities for regulatory operations through targeted automation pilots. She focuses on demonstrating operational efficiency gains to build support for broader AI adoption.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Operations efficiency accountability\n- **Pain:** 7/10 - Balancing innovation with operational stability\n- **Actions:** 6/10 - Structured operations AI pilots\n- **Needs:** 7/10 - Proven operations automation tools\n- **Emotions:** 6/10 - Cautiously exploring automation\n- **Scenarios:** Incremental operations automation\n\n## Goals\n- Demonstrate AI ROI in operations workflows\n- Build team confidence in automation tools\n- Develop operations AI implementation roadmap\n\n## Frustrations\n- Operations stability requirements limiting experimentation\n- AI tools requiring significant customization\n- Limited resources for operations AI pilots',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'head_regulatory_operations_skeptic',
    'Sarah Miller - Head of Regulatory Operations Skeptic',
    E'**Role:** Head of Regulatory Operations\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Operational/Strategic\n\n## AI Profile\nSarah is skeptical of AI in operations, having seen automation projects create more problems than they solved. She prioritizes operational stability and proven processes over AI experimentation.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Operations reliability accountability\n- **Pain:** 8/10 - Pressure to automate without stability guarantee\n- **Actions:** 4/10 - Minimal AI, maximum operational stability\n- **Needs:** 8/10 - Extensively tested automation solutions\n- **Emotions:** 5/10 - Protective of operational reliability\n- **Scenarios:** Defending stable operations approaches\n\n## Goals\n- Maintain operational reliability above all\n- Require extensive testing for any automation\n- Protect operations from disruptive experiments\n\n## Frustrations\n- Pressure to automate complex operations quickly\n- AI vendors without operations domain expertise\n- Insufficient testing time for automation tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 9. CMC REGULATORY AFFAIRS DIRECTOR - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_affairs_director_automator',
    'Diana Wright - CMC Regulatory Affairs Director Automator',
    E'**Role:** CMC Regulatory Affairs Director\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 78/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nDiana has automated CMC document preparation, variation tracking, and commitment monitoring using AI. Her team leverages AI tools for consistency checking across CMC dossiers and manufacturing change assessments.\n\n## VPANES Scores\n- **Visibility:** 8/10 - CMC regulatory strategy leadership\n- **Pain:** 7/10 - Complex manufacturing change management\n- **Actions:** 8/10 - AI-automated CMC workflows\n- **Needs:** 8/10 - Integrated CMC regulatory platform\n- **Emotions:** 8/10 - Confident in CMC automation benefits\n- **Scenarios:** CMC regulatory automation initiatives\n\n## Goals\n- Reduce CMC dossier preparation time by 35%\n- Automate manufacturing change regulatory assessments\n- Build AI-powered CMC consistency checking\n\n## Frustrations\n- Complex technical content challenging AI accuracy\n- Legacy CMC data systems limiting automation\n- Manufacturing changes requiring regulatory interpretation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_affairs_director_orchestrator',
    'Helen Thompson - CMC Regulatory Affairs Director Orchestrator',
    E'**Role:** CMC Regulatory Affairs Director\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 84/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nHelen orchestrates an integrated CMC AI ecosystem connecting document management, change control, manufacturing data, and regulatory submissions into unified CMC intelligence platforms.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Cross-functional CMC coordination\n- **Pain:** 8/10 - Integrating CMC data across systems\n- **Actions:** 9/10 - CMC AI ecosystem orchestration\n- **Needs:** 9/10 - Unified CMC intelligence platform\n- **Emotions:** 8/10 - Energized by CMC complexity\n- **Scenarios:** Enterprise CMC AI integration programs\n\n## Goals\n- Create seamless CMC data flow across systems\n- Build AI-powered manufacturing change intelligence\n- Lead CMC regulatory digitalization\n\n## Frustrations\n- Siloed manufacturing and regulatory data\n- Technical complexity of CMC AI modeling\n- Varying CMC requirements across agencies',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_affairs_director_learner',
    'Marie Johnson - CMC Regulatory Affairs Director Learner',
    E'**Role:** CMC Regulatory Affairs Director\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nMarie is exploring AI applications for CMC regulatory work through careful pilot projects. She recognizes AI potential but is cautious given the technical complexity of CMC content.\n\n## VPANES Scores\n- **Visibility:** 8/10 - CMC regulatory accountability\n- **Pain:** 7/10 - Technical complexity challenging AI adoption\n- **Actions:** 5/10 - Exploratory CMC AI pilots\n- **Needs:** 7/10 - CMC-specific AI tools\n- **Emotions:** 6/10 - Curious but cautious about AI\n- **Scenarios:** Careful CMC AI exploration\n\n## Goals\n- Evaluate AI capabilities for technical CMC content\n- Build team understanding of AI potential\n- Identify appropriate CMC AI use cases\n\n## Frustrations\n- AI tools lacking CMC domain knowledge\n- Technical content quality concerns with AI\n- Limited CMC AI case studies to reference',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_affairs_director_skeptic',
    'Patricia Davis - CMC Regulatory Affairs Director Skeptic',
    E'**Role:** CMC Regulatory Affairs Director\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 25/100\n**Work Complexity:** Technical/Strategic\n\n## AI Profile\nPatricia is highly skeptical of AI for CMC work, emphasizing that technical manufacturing content requires deep domain expertise that AI cannot replicate. She requires extensive validation for any AI consideration.\n\n## VPANES Scores\n- **Visibility:** 8/10 - CMC regulatory quality accountability\n- **Pain:** 8/10 - Pressure to adopt AI for technical content\n- **Actions:** 3/10 - Minimal AI engagement in CMC\n- **Needs:** 8/10 - Proof of AI accuracy for technical content\n- **Emotions:** 4/10 - Protective of CMC quality standards\n- **Scenarios:** Defending expert-driven CMC approach\n\n## Goals\n- Maintain CMC quality through expert review\n- Protect against AI errors in technical content\n- Require extensive validation for any AI tools\n\n## Frustrations\n- AI unable to handle CMC technical nuance\n- Pressure to automate inherently expert tasks\n- Vendors without CMC domain understanding',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 10. SUBMISSIONS DIRECTOR - Director
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_director_automator',
    'Sandra Wilson - Submissions Director Automator',
    E'**Role:** Submissions Director\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 81/100\n**Work Complexity:** Operational/Tactical\n\n## AI Profile\nSandra has automated submission assembly, quality checks, and publishing workflows. Her team uses AI for hyperlink validation, cross-reference checking, and submission health monitoring across all active dossiers.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Submission quality and timeline accountability\n- **Pain:** 7/10 - Managing high-volume submission workload\n- **Actions:** 9/10 - AI-automated submission workflows\n- **Needs:** 8/10 - End-to-end submission automation\n- **Emotions:** 8/10 - Confident in automation ROI\n- **Scenarios:** Submission workflow automation leadership\n\n## Goals\n- Achieve zero submission deficiencies through AI QC\n- Reduce submission assembly time by 50%\n- Standardize AI tools across all submission teams\n\n## Frustrations\n- Legacy publishing systems limiting automation\n- Varying agency submission requirements\n- Resource constraints for AI tool implementation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_director_orchestrator',
    'Lisa Anderson - Submissions Director Orchestrator',
    E'**Role:** Submissions Director\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 86/100\n**Work Complexity:** Operational/Tactical\n\n## AI Profile\nLisa orchestrates an integrated AI submission ecosystem connecting document management, publishing, regulatory information management, and agency portals into unified submission platforms.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Global submission coordination\n- **Pain:** 8/10 - Integrating submission systems globally\n- **Actions:** 10/10 - Enterprise submission AI orchestration\n- **Needs:** 9/10 - Unified intelligent submission platform\n- **Emotions:** 9/10 - Energized by integration complexity\n- **Scenarios:** Enterprise submission transformation programs\n\n## Goals\n- Create seamless submission workflows globally\n- Build self-optimizing submission processes\n- Lead submission AI maturity advancement\n\n## Frustrations\n- Regional system variations complicating integration\n- Legacy publishing tool limitations\n- Change management across global teams',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_director_learner',
    'Carol Martin - Submissions Director Learner',
    E'**Role:** Submissions Director\n**Archetype:** LEARNER\n**AI Maturity Score:** 52/100\n**Work Complexity:** Operational/Tactical\n\n## AI Profile\nCarol is building AI capabilities for submission operations through targeted pilots. She focuses on demonstrating clear efficiency gains to build support for broader adoption.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Submission quality accountability\n- **Pain:** 7/10 - Balancing innovation with submission reliability\n- **Actions:** 6/10 - Structured submission AI pilots\n- **Needs:** 7/10 - Proven submission automation tools\n- **Emotions:** 6/10 - Cautiously exploring automation\n- **Scenarios:** Incremental submission automation\n\n## Goals\n- Demonstrate AI value in submission workflows\n- Build team confidence in automation tools\n- Develop submission AI implementation roadmap\n\n## Frustrations\n- Submission reliability requirements limiting experimentation\n- AI validation burden in regulated environment\n- Limited time for AI pilots amid operations',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_director_skeptic',
    'Margaret Brown - Submissions Director Skeptic',
    E'**Role:** Submissions Director\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Operational/Tactical\n\n## AI Profile\nMargaret is skeptical of AI in submissions, emphasizing that submission quality cannot be compromised. She has seen automation projects create deficiencies and requires extensive validation before any adoption.\n\n## VPANES Scores\n- **Visibility:** 8/10 - Submission quality accountability\n- **Pain:** 8/10 - Pressure to automate without quality guarantee\n- **Actions:** 4/10 - Minimal AI, maximum quality focus\n- **Needs:** 8/10 - Extensively validated submission tools\n- **Emotions:** 5/10 - Protective of submission quality\n- **Scenarios:** Defending quality-first submission approach\n\n## Goals\n- Maintain zero-deficiency submission record\n- Require extensive testing for any automation\n- Protect submissions from automation failures\n\n## Frustrations\n- Pressure to automate critical submission processes\n- AI tools creating quality issues\n- Insufficient validation time for automation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 11. SENIOR REGULATORY AFFAIRS MANAGER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_affairs_manager_automator',
    'Jennifer Clark - Senior Regulatory Affairs Manager Automator',
    E'**Role:** Senior Regulatory Affairs Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 75/100\n**Work Complexity:** Tactical\n\n## AI Profile\nJennifer has automated routine regulatory tasks including meeting tracking, correspondence management, and timeline monitoring. She champions AI adoption within her team to focus on strategic regulatory work.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Program-level regulatory updates\n- **Pain:** 6/10 - Administrative burden reducing strategic time\n- **Actions:** 8/10 - AI-automated regulatory workflows\n- **Needs:** 7/10 - Integrated regulatory management tools\n- **Emotions:** 8/10 - Enthusiastic about automation benefits\n- **Scenarios:** Team-level regulatory automation\n\n## Goals\n- Reduce administrative tasks by 40% through AI\n- Enable team focus on strategic activities\n- Build AI capabilities across team\n\n## Frustrations\n- Limited budget for team AI tools\n- IT support constraints for AI implementation\n- AI tools requiring extensive customization',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_affairs_manager_orchestrator',
    'Michelle Lee - Senior Regulatory Affairs Manager Orchestrator',
    E'**Role:** Senior Regulatory Affairs Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Tactical\n\n## AI Profile\nMichelle orchestrates AI integration across her regulatory programs, connecting document management, project tracking, and regulatory intelligence into unified workflow platforms.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Cross-program coordination\n- **Pain:** 7/10 - Managing complex program dependencies\n- **Actions:** 9/10 - Multi-program AI coordination\n- **Needs:** 8/10 - Integrated program management platform\n- **Emotions:** 8/10 - Energized by coordination challenges\n- **Scenarios:** Program-level AI integration initiatives\n\n## Goals\n- Create seamless workflows across programs\n- Build integrated program intelligence\n- Lead AI adoption within regulatory function\n\n## Frustrations\n- Programs at varying AI readiness\n- Legacy tools limiting integration\n- Competing program priorities',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_affairs_manager_learner',
    'Amanda White - Senior Regulatory Affairs Manager Learner',
    E'**Role:** Senior Regulatory Affairs Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Tactical\n\n## AI Profile\nAmanda is actively learning AI capabilities and exploring pilot opportunities for her team. She attends training, tests tools, and builds her understanding before broader implementation.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Program accountability\n- **Pain:** 6/10 - Keeping pace with AI advancement\n- **Actions:** 5/10 - Exploratory AI learning\n- **Needs:** 6/10 - Clear AI guidance and training\n- **Emotions:** 6/10 - Curious about AI potential\n- **Scenarios:** Structured AI skill building\n\n## Goals\n- Develop personal AI competency\n- Identify best AI applications for team\n- Build team AI readiness gradually\n\n## Frustrations\n- Limited time for learning amid operations\n- Overwhelming AI vendor landscape\n- Difficulty evaluating AI tool claims',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_affairs_manager_skeptic',
    'Laura Johnson - Senior Regulatory Affairs Manager Skeptic',
    E'**Role:** Senior Regulatory Affairs Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 32/100\n**Work Complexity:** Tactical\n\n## AI Profile\nLaura prefers proven regulatory processes over AI experimentation. She focuses on delivering reliable regulatory outcomes using established methods and requires extensive proof before considering AI.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Program quality accountability\n- **Pain:** 6/10 - Pressure to adopt AI tools\n- **Actions:** 4/10 - Minimal AI engagement\n- **Needs:** 6/10 - Validated AI solutions\n- **Emotions:** 5/10 - Protective of quality\n- **Scenarios:** Defending proven processes\n\n## Goals\n- Deliver reliable regulatory outcomes\n- Protect team from disruptive experiments\n- Require proof before any AI adoption\n\n## Frustrations\n- Pressure to adopt AI without training\n- AI tools creating more work than saving\n- Vendors without regulatory understanding',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 12. REGULATORY COMPLIANCE MANAGER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_manager_automator',
    'Stephanie Brown - Regulatory Compliance Manager Automator',
    E'**Role:** Regulatory Compliance Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Tactical\n\n## AI Profile\nStephanie has automated compliance tracking, deviation monitoring, and audit preparation. Her team uses AI dashboards for real-time compliance visibility across all regulatory commitments.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Compliance status reporting\n- **Pain:** 6/10 - Managing complex compliance tracking\n- **Actions:** 8/10 - AI-automated compliance workflows\n- **Needs:** 7/10 - Integrated compliance monitoring tools\n- **Emotions:** 7/10 - Confident in automation benefits\n- **Scenarios:** Compliance automation initiatives\n\n## Goals\n- Real-time compliance visibility through AI\n- Automate routine compliance checks\n- Predict compliance risks proactively\n\n## Frustrations\n- Data quality issues in compliance systems\n- Legacy tools limiting automation\n- Budget constraints for compliance AI',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_manager_orchestrator',
    'Katherine Davis - Regulatory Compliance Manager Orchestrator',
    E'**Role:** Regulatory Compliance Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 81/100\n**Work Complexity:** Tactical\n\n## AI Profile\nKatherine orchestrates AI integration across compliance functions, connecting commitment tracking, deviation management, and regulatory change monitoring into unified compliance platforms.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Cross-functional compliance coordination\n- **Pain:** 7/10 - Integrating compliance across systems\n- **Actions:** 9/10 - Compliance AI orchestration\n- **Needs:** 8/10 - Unified compliance platform\n- **Emotions:** 8/10 - Energized by integration challenges\n- **Scenarios:** Compliance AI integration initiatives\n\n## Goals\n- Create seamless compliance data flow\n- Build integrated compliance intelligence\n- Lead compliance AI adoption\n\n## Frustrations\n- Siloed compliance data across functions\n- Legacy system integration complexity\n- Varying compliance maturity across teams',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_manager_learner',
    'Rachel Wilson - Regulatory Compliance Manager Learner',
    E'**Role:** Regulatory Compliance Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Tactical\n\n## AI Profile\nRachel is building AI capabilities for compliance through structured pilots. She recognizes AI potential but needs to ensure compliance rigor is maintained in any implementation.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Compliance accountability\n- **Pain:** 6/10 - Balancing innovation with compliance rigor\n- **Actions:** 5/10 - Careful compliance AI pilots\n- **Needs:** 6/10 - Validated compliance AI tools\n- **Emotions:** 6/10 - Cautiously exploring AI\n- **Scenarios:** Methodical compliance AI adoption\n\n## Goals\n- Evaluate AI for compliance applications\n- Build team AI readiness\n- Identify appropriate compliance AI use cases\n\n## Frustrations\n- Compliance requirements limiting experimentation\n- AI tools lacking compliance understanding\n- Limited resources for AI pilots',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_manager_skeptic',
    'Nancy Thompson - Regulatory Compliance Manager Skeptic',
    E'**Role:** Regulatory Compliance Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Tactical\n\n## AI Profile\nNancy is skeptical of AI in compliance, emphasizing that compliance failures have serious consequences. She requires extensive validation and proven track record before any AI consideration.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Compliance accountability\n- **Pain:** 7/10 - Pressure to adopt AI in high-risk area\n- **Actions:** 3/10 - Minimal AI engagement\n- **Needs:** 7/10 - Extensively validated compliance AI\n- **Emotions:** 4/10 - Protective of compliance integrity\n- **Scenarios:** Defending proven compliance approaches\n\n## Goals\n- Maintain compliance integrity\n- Protect against AI-related compliance failures\n- Require extensive validation for any AI\n\n## Frustrations\n- Pressure to adopt AI without understanding risks\n- No industry guidance on AI in compliance\n- Vendors without compliance expertise',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 13. SENIOR REGULATORY WRITER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_writer_automator',
    'Elizabeth Chen - Senior Regulatory Writer Automator',
    E'**Role:** Senior Regulatory Writer\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 79/100\n**Work Complexity:** Technical\n\n## AI Profile\nElizabeth leverages AI writing assistants for draft generation, consistency checking, and cross-reference validation. She uses AI to accelerate document preparation while maintaining rigorous quality standards.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Document quality accountability\n- **Pain:** 6/10 - High-volume writing demands\n- **Actions:** 8/10 - AI-assisted writing workflows\n- **Needs:** 7/10 - Advanced AI writing tools\n- **Emotions:** 8/10 - Enthusiastic about AI writing support\n- **Scenarios:** AI-accelerated document preparation\n\n## Goals\n- Reduce first draft time by 40% with AI\n- Maintain document quality with AI assistance\n- Build AI writing capabilities across team\n\n## Frustrations\n- AI not understanding regulatory document conventions\n- Quality review burden for AI-generated content\n- Limited AI tools for technical regulatory writing',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_writer_orchestrator',
    'Victoria Park - Senior Regulatory Writer Orchestrator',
    E'**Role:** Senior Regulatory Writer\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 83/100\n**Work Complexity:** Technical\n\n## AI Profile\nVictoria orchestrates AI integration across writing workflows, connecting template management, content libraries, style checking, and cross-document consistency tools into unified writing platforms.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Writing quality leadership\n- **Pain:** 7/10 - Managing complex multi-document consistency\n- **Actions:** 9/10 - Writing AI ecosystem orchestration\n- **Needs:** 8/10 - Unified intelligent writing platform\n- **Emotions:** 8/10 - Energized by writing technology\n- **Scenarios:** Enterprise writing AI integration\n\n## Goals\n- Create seamless AI-augmented writing workflows\n- Build integrated document intelligence\n- Lead writing AI adoption across organization\n\n## Frustrations\n- Fragmented writing tools\n- Legacy template systems\n- Varying writing standards across teams',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_writer_learner',
    'Maria Rodriguez - Senior Regulatory Writer Learner',
    E'**Role:** Senior Regulatory Writer\n**Archetype:** LEARNER\n**AI Maturity Score:** 50/100\n**Work Complexity:** Technical\n\n## AI Profile\nMaria is actively exploring AI writing tools through careful experimentation. She tests AI capabilities for specific writing tasks while maintaining her expertise-driven approach to critical documents.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Document quality\n- **Pain:** 6/10 - Finding time for AI learning\n- **Actions:** 5/10 - Exploratory AI writing tests\n- **Needs:** 6/10 - Regulatory-specific AI writing tools\n- **Emotions:** 6/10 - Curious about AI potential\n- **Scenarios:** Careful AI writing exploration\n\n## Goals\n- Evaluate AI for regulatory writing support\n- Build AI writing competency\n- Identify best AI use cases for writing\n\n## Frustrations\n- AI tools not understanding regulatory context\n- Quality concerns with AI-generated content\n- Limited time for AI experimentation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'senior_regulatory_writer_skeptic',
    'Catherine Miller - Senior Regulatory Writer Skeptic',
    E'**Role:** Senior Regulatory Writer\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Technical\n\n## AI Profile\nCatherine is skeptical of AI for regulatory writing, emphasizing that regulatory documents require expert understanding and precision that AI cannot provide. She views AI-generated content as a quality risk.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Document quality accountability\n- **Pain:** 7/10 - Pressure to use AI for writing\n- **Actions:** 3/10 - Minimal AI use in writing\n- **Needs:** 7/10 - Proof of AI writing quality\n- **Emotions:** 5/10 - Protective of writing standards\n- **Scenarios:** Defending expert-written documents\n\n## Goals\n- Maintain writing quality through expertise\n- Protect against AI quality compromises\n- Require proof of AI writing accuracy\n\n## Frustrations\n- Pressure to use AI without quality guarantee\n- AI not understanding regulatory nuance\n- Time spent reviewing AI errors',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 14. REGULATORY LABELING MANAGER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_labeling_manager_automator',
    'Diana Lee - Regulatory Labeling Manager Automator',
    E'**Role:** Regulatory Labeling Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 77/100\n**Work Complexity:** Technical\n\n## AI Profile\nDiana has automated labeling comparison, variation tracking, and artwork management using AI. Her team uses AI for consistency checking across global labeling and identifying label update requirements.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Labeling compliance accountability\n- **Pain:** 6/10 - Managing complex global labeling\n- **Actions:** 8/10 - AI-automated labeling workflows\n- **Needs:** 7/10 - Integrated labeling management platform\n- **Emotions:** 7/10 - Confident in labeling automation\n- **Scenarios:** Labeling automation initiatives\n\n## Goals\n- Reduce labeling review time by 35%\n- Automate labeling consistency checking\n- Build AI-powered labeling intelligence\n\n## Frustrations\n- Complex labeling requirements across markets\n- Legacy labeling systems limiting automation\n- Artwork integration challenges',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_labeling_manager_orchestrator',
    'Helen Wang - Regulatory Labeling Manager Orchestrator',
    E'**Role:** Regulatory Labeling Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 82/100\n**Work Complexity:** Technical\n\n## AI Profile\nHelen orchestrates an integrated AI labeling ecosystem connecting labeling databases, artwork management, regulatory requirements, and submission systems into unified labeling platforms.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Global labeling coordination\n- **Pain:** 7/10 - Integrating labeling across systems\n- **Actions:** 9/10 - Labeling AI ecosystem orchestration\n- **Needs:** 8/10 - Unified intelligent labeling platform\n- **Emotions:** 8/10 - Energized by labeling complexity\n- **Scenarios:** Enterprise labeling AI integration\n\n## Goals\n- Create seamless global labeling workflows\n- Build integrated labeling intelligence\n- Lead labeling digitalization initiatives\n\n## Frustrations\n- Fragmented labeling tools globally\n- Market-specific labeling requirements\n- Legacy artwork management systems',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_labeling_manager_learner',
    'Michelle Taylor - Regulatory Labeling Manager Learner',
    E'**Role:** Regulatory Labeling Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Technical\n\n## AI Profile\nMichelle is exploring AI applications for labeling management through pilot projects. She sees potential for AI to reduce manual comparison work but needs to validate accuracy.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Labeling accountability\n- **Pain:** 6/10 - Manual labeling comparison burden\n- **Actions:** 5/10 - Exploratory labeling AI pilots\n- **Needs:** 6/10 - Labeling-specific AI tools\n- **Emotions:** 6/10 - Curious about AI potential\n- **Scenarios:** Careful labeling AI exploration\n\n## Goals\n- Evaluate AI for labeling comparison\n- Build team AI readiness\n- Identify appropriate labeling AI use cases\n\n## Frustrations\n- AI tools lacking labeling domain knowledge\n- Accuracy requirements limiting experimentation\n- Limited labeling AI solutions available',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_labeling_manager_skeptic',
    'Patricia Anderson - Regulatory Labeling Manager Skeptic',
    E'**Role:** Regulatory Labeling Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Technical\n\n## AI Profile\nPatricia is skeptical of AI for labeling, emphasizing that labeling errors can have patient safety implications. She requires extensive validation and proven accuracy before any AI consideration.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Labeling compliance accountability\n- **Pain:** 7/10 - Pressure to adopt AI without safety proof\n- **Actions:** 3/10 - Minimal AI engagement in labeling\n- **Needs:** 7/10 - Extensively validated labeling AI\n- **Emotions:** 4/10 - Protective of labeling accuracy\n- **Scenarios:** Defending expert-driven labeling\n\n## Goals\n- Maintain labeling accuracy for patient safety\n- Protect against AI labeling errors\n- Require extensive validation for any AI\n\n## Frustrations\n- Pressure to adopt AI in safety-critical area\n- AI unable to understand labeling nuance\n- Vendors without labeling domain expertise',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 15. SR. CMC REGULATORY MANAGER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sr_cmc_regulatory_manager_automator',
    'Angela Chen - Sr. CMC Regulatory Manager Automator',
    E'**Role:** Sr. CMC Regulatory Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 74/100\n**Work Complexity:** Technical\n\n## AI Profile\nAngela has automated CMC document preparation, change assessment, and variation tracking. Her team uses AI for CMC content consistency checking and manufacturing change regulatory impact analysis.\n\n## VPANES Scores\n- **Visibility:** 7/10 - CMC program accountability\n- **Pain:** 6/10 - Complex CMC documentation demands\n- **Actions:** 8/10 - AI-automated CMC workflows\n- **Needs:** 7/10 - CMC-specific automation tools\n- **Emotions:** 7/10 - Confident in CMC automation\n- **Scenarios:** CMC regulatory automation initiatives\n\n## Goals\n- Reduce CMC document preparation time by 30%\n- Automate manufacturing change assessments\n- Build AI capabilities for CMC team\n\n## Frustrations\n- Technical CMC content challenging AI\n- Legacy CMC document systems\n- Limited CMC-specific AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sr_cmc_regulatory_manager_orchestrator',
    'Jennifer Kim - Sr. CMC Regulatory Manager Orchestrator',
    E'**Role:** Sr. CMC Regulatory Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 79/100\n**Work Complexity:** Technical\n\n## AI Profile\nJennifer orchestrates AI integration across CMC workflows, connecting manufacturing data, change control, regulatory submissions, and compliance monitoring into unified CMC platforms.\n\n## VPANES Scores\n- **Visibility:** 7/10 - Cross-functional CMC coordination\n- **Pain:** 7/10 - Integrating CMC data across systems\n- **Actions:** 9/10 - CMC AI orchestration\n- **Needs:** 8/10 - Unified CMC intelligence platform\n- **Emotions:** 8/10 - Energized by CMC complexity\n- **Scenarios:** CMC AI integration initiatives\n\n## Goals\n- Create seamless CMC data workflows\n- Build integrated CMC intelligence\n- Lead CMC digitalization efforts\n\n## Frustrations\n- Siloed manufacturing and regulatory data\n- Technical CMC AI modeling complexity\n- Varying CMC requirements across regions',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sr_cmc_regulatory_manager_learner',
    'Lisa Martinez - Sr. CMC Regulatory Manager Learner',
    E'**Role:** Sr. CMC Regulatory Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Technical\n\n## AI Profile\nLisa is exploring AI for CMC regulatory work through careful pilots. She recognizes AI potential but is cautious given the technical complexity of CMC content and regulatory precision required.\n\n## VPANES Scores\n- **Visibility:** 7/10 - CMC program accountability\n- **Pain:** 6/10 - Technical complexity challenging AI\n- **Actions:** 5/10 - Exploratory CMC AI pilots\n- **Needs:** 6/10 - CMC-specific AI tools\n- **Emotions:** 6/10 - Cautiously curious about AI\n- **Scenarios:** Careful CMC AI exploration\n\n## Goals\n- Evaluate AI for technical CMC content\n- Build team AI understanding\n- Identify appropriate CMC AI use cases\n\n## Frustrations\n- AI lacking CMC domain knowledge\n- Technical accuracy concerns with AI\n- Limited CMC AI case studies',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'sr_cmc_regulatory_manager_skeptic',
    'Susan Wilson - Sr. CMC Regulatory Manager Skeptic',
    E'**Role:** Sr. CMC Regulatory Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Technical\n\n## AI Profile\nSusan is skeptical of AI for CMC work, emphasizing that technical manufacturing content requires deep expertise that AI cannot replicate. She requires extensive validation before any AI consideration.\n\n## VPANES Scores\n- **Visibility:** 7/10 - CMC quality accountability\n- **Pain:** 7/10 - Pressure to adopt AI for technical work\n- **Actions:** 3/10 - Minimal AI engagement\n- **Needs:** 7/10 - Proof of AI accuracy for CMC\n- **Emotions:** 4/10 - Protective of CMC quality\n- **Scenarios:** Defending expert-driven CMC approach\n\n## Goals\n- Maintain CMC quality through expertise\n- Protect against AI errors in technical content\n- Require extensive validation for AI tools\n\n## Frustrations\n- AI unable to handle CMC technical nuance\n- Pressure to automate expert tasks\n- Vendors without CMC understanding',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 16. SUBMISSIONS MANAGER - Senior
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_manager_automator',
    'Karen Brown - Submissions Manager Automator',
    E'**Role:** Submissions Manager\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Operational\n\n## AI Profile\nKaren has automated submission assembly, QC checks, and publishing workflows. Her team uses AI for document validation, hyperlink checking, and submission health monitoring.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Submission quality metrics\n- **Pain:** 6/10 - High-volume submission workload\n- **Actions:** 8/10 - AI-automated submission workflows\n- **Needs:** 7/10 - Submission automation tools\n- **Emotions:** 7/10 - Confident in automation benefits\n- **Scenarios:** Team submission automation\n\n## Goals\n- Zero deficiencies through AI QC\n- Reduce assembly time by 40%\n- Standardize automation across team\n\n## Frustrations\n- Legacy publishing tools limiting automation\n- Varying submission requirements\n- Resource constraints for AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_manager_orchestrator',
    'Emily Davis - Submissions Manager Orchestrator',
    E'**Role:** Submissions Manager\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 80/100\n**Work Complexity:** Operational\n\n## AI Profile\nEmily orchestrates AI integration across submission workflows, connecting document management, publishing, and project tracking into unified submission platforms.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Team submission coordination\n- **Pain:** 7/10 - Managing complex submission dependencies\n- **Actions:** 9/10 - Submission AI orchestration\n- **Needs:** 8/10 - Integrated submission platform\n- **Emotions:** 8/10 - Energized by process improvement\n- **Scenarios:** Submission workflow integration\n\n## Goals\n- Create seamless submission workflows\n- Build integrated submission tracking\n- Lead team AI adoption\n\n## Frustrations\n- Fragmented submission tools\n- Legacy system limitations\n- Varying team AI readiness',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_manager_learner',
    'Sarah Thompson - Submissions Manager Learner',
    E'**Role:** Submissions Manager\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Operational\n\n## AI Profile\nSarah is building AI capabilities for submissions through targeted pilots. She focuses on demonstrating efficiency gains to build confidence in automation.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Submission accountability\n- **Pain:** 6/10 - Balancing innovation with reliability\n- **Actions:** 5/10 - Structured submission AI pilots\n- **Needs:** 6/10 - Proven submission tools\n- **Emotions:** 6/10 - Cautiously exploring automation\n- **Scenarios:** Incremental submission automation\n\n## Goals\n- Demonstrate AI value in submissions\n- Build team automation confidence\n- Develop implementation roadmap\n\n## Frustrations\n- Reliability requirements limiting experimentation\n- AI validation burden\n- Limited time for pilots',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'submissions_manager_skeptic',
    'Nancy Garcia - Submissions Manager Skeptic',
    E'**Role:** Submissions Manager\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Operational\n\n## AI Profile\nNancy is skeptical of submission automation, having seen automation create deficiencies. She prioritizes submission quality and proven processes over AI experimentation.\n\n## VPANES Scores\n- **Visibility:** 6/10 - Submission quality accountability\n- **Pain:** 7/10 - Pressure to automate without quality proof\n- **Actions:** 4/10 - Minimal AI, maximum quality focus\n- **Needs:** 7/10 - Extensively tested automation\n- **Emotions:** 5/10 - Protective of submission quality\n- **Scenarios:** Defending quality-first approach\n\n## Goals\n- Maintain zero-deficiency record\n- Require extensive testing for automation\n- Protect submissions from automation failures\n\n## Frustrations\n- Pressure to automate critical processes\n- AI tools creating quality issues\n- Insufficient validation time',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 17. REGULATORY WRITER - Mid
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_writer_automator',
    'Amanda Chen - Regulatory Writer Automator',
    E'**Role:** Regulatory Writer\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 72/100\n**Work Complexity:** Technical\n\n## AI Profile\nAmanda actively uses AI writing assistants for drafting, editing, and consistency checking. She has developed efficient workflows combining AI tools with expert review for high-quality regulatory documents.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document delivery accountability\n- **Pain:** 6/10 - High-volume writing demands\n- **Actions:** 8/10 - AI-assisted writing workflows\n- **Needs:** 7/10 - Advanced AI writing tools\n- **Emotions:** 8/10 - Enthusiastic about AI support\n- **Scenarios:** AI-accelerated document preparation\n\n## Goals\n- Reduce drafting time by 35% with AI\n- Maintain quality with AI assistance\n- Champion AI writing tools\n\n## Frustrations\n- AI not understanding regulatory conventions\n- Review burden for AI content\n- Limited regulatory-specific AI tools',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_writer_orchestrator',
    'Jessica Park - Regulatory Writer Orchestrator',
    E'**Role:** Regulatory Writer\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 76/100\n**Work Complexity:** Technical\n\n## AI Profile\nJessica integrates multiple AI tools into her writing workflow, connecting template libraries, style guides, and consistency checking into efficient document production processes.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Writing quality leadership\n- **Pain:** 6/10 - Managing multi-document consistency\n- **Actions:** 8/10 - Writing AI integration\n- **Needs:** 7/10 - Unified writing platform\n- **Emotions:** 7/10 - Energized by tool integration\n- **Scenarios:** Writing workflow optimization\n\n## Goals\n- Create seamless AI writing workflows\n- Build integrated document tools\n- Lead writing AI adoption\n\n## Frustrations\n- Fragmented writing tools\n- Legacy template systems\n- Integration complexity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_writer_learner',
    'Michelle Rodriguez - Regulatory Writer Learner',
    E'**Role:** Regulatory Writer\n**Archetype:** LEARNER\n**AI Maturity Score:** 45/100\n**Work Complexity:** Technical\n\n## AI Profile\nMichelle is exploring AI writing tools cautiously, testing capabilities on non-critical documents before broader adoption. She wants to understand AI potential while maintaining writing quality.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document quality\n- **Pain:** 5/10 - Finding time for AI learning\n- **Actions:** 5/10 - Exploratory AI writing tests\n- **Needs:** 6/10 - Regulatory AI writing guidance\n- **Emotions:** 6/10 - Curious about AI potential\n- **Scenarios:** Careful AI writing exploration\n\n## Goals\n- Evaluate AI for writing support\n- Build AI writing competency\n- Find appropriate AI use cases\n\n## Frustrations\n- AI not understanding regulatory context\n- Quality concerns with AI content\n- Limited time for experimentation',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_writer_skeptic',
    'Laura Miller - Regulatory Writer Skeptic',
    E'**Role:** Regulatory Writer\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 28/100\n**Work Complexity:** Technical\n\n## AI Profile\nLaura is skeptical of AI writing tools, believing regulatory documents require human expertise and judgment. She views AI-generated content as a quality risk requiring extensive review.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document quality accountability\n- **Pain:** 6/10 - Pressure to use AI tools\n- **Actions:** 3/10 - Minimal AI use in writing\n- **Needs:** 6/10 - Proof of AI quality\n- **Emotions:** 5/10 - Protective of writing standards\n- **Scenarios:** Defending expert writing\n\n## Goals\n- Maintain quality through expertise\n- Avoid AI quality compromises\n- Require proof of AI accuracy\n\n## Frustrations\n- Pressure to use AI without quality proof\n- AI not understanding regulatory nuance\n- Time reviewing AI errors',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 18. REGULATORY DOCUMENT SPECIALIST - Mid
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_document_specialist_automator',
    'Stephanie Lee - Regulatory Document Specialist Automator',
    E'**Role:** Regulatory Document Specialist\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 73/100\n**Work Complexity:** Operational\n\n## AI Profile\nStephanie has automated document formatting, hyperlink validation, and cross-reference checking using AI. She champions AI tools to reduce manual document processing time.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document quality metrics\n- **Pain:** 6/10 - High-volume document processing\n- **Actions:** 8/10 - AI-automated document workflows\n- **Needs:** 7/10 - Document automation tools\n- **Emotions:** 7/10 - Enthusiastic about automation\n- **Scenarios:** Document processing automation\n\n## Goals\n- Reduce manual processing by 50%\n- Automate routine document checks\n- Build document AI expertise\n\n## Frustrations\n- Legacy document systems\n- Varying document standards\n- Limited automation budget',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_document_specialist_orchestrator',
    'Rachel Wang - Regulatory Document Specialist Orchestrator',
    E'**Role:** Regulatory Document Specialist\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 77/100\n**Work Complexity:** Operational\n\n## AI Profile\nRachel integrates multiple AI tools for document management, connecting formatting tools, validation systems, and publishing workflows into streamlined processes.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document operations leadership\n- **Pain:** 6/10 - Managing diverse document tools\n- **Actions:** 8/10 - Document AI integration\n- **Needs:** 7/10 - Unified document platform\n- **Emotions:** 7/10 - Energized by process improvement\n- **Scenarios:** Document workflow integration\n\n## Goals\n- Create seamless document workflows\n- Integrate document AI tools\n- Lead document automation adoption\n\n## Frustrations\n- Fragmented document tools\n- Legacy system limitations\n- Integration complexity',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_document_specialist_learner',
    'Amy Brown - Regulatory Document Specialist Learner',
    E'**Role:** Regulatory Document Specialist\n**Archetype:** LEARNER\n**AI Maturity Score:** 48/100\n**Work Complexity:** Operational\n\n## AI Profile\nAmy is exploring AI tools for document processing through hands-on testing. She sees potential for reducing manual work but wants to build confidence before full adoption.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document delivery\n- **Pain:** 5/10 - Learning new AI tools\n- **Actions:** 5/10 - Exploratory AI testing\n- **Needs:** 6/10 - Clear AI guidance\n- **Emotions:** 6/10 - Curious about AI\n- **Scenarios:** Careful AI exploration\n\n## Goals\n- Learn AI document tools\n- Build automation skills\n- Find best AI use cases\n\n## Frustrations\n- Limited training resources\n- Tools requiring customization\n- Time constraints for learning',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_document_specialist_skeptic',
    'Linda Garcia - Regulatory Document Specialist Skeptic',
    E'**Role:** Regulatory Document Specialist\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 30/100\n**Work Complexity:** Operational\n\n## AI Profile\nLinda prefers manual document processing she can control and verify. She is skeptical of AI accuracy and views automation as potentially introducing errors.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Document quality\n- **Pain:** 6/10 - Pressure to use AI tools\n- **Actions:** 3/10 - Minimal AI use\n- **Needs:** 6/10 - Proof of AI accuracy\n- **Emotions:** 5/10 - Protective of quality\n- **Scenarios:** Defending manual verification\n\n## Goals\n- Maintain quality through manual control\n- Avoid AI-introduced errors\n- Require accuracy proof for AI\n\n## Frustrations\n- Pressure to automate\n- AI tools creating errors\n- Time fixing AI mistakes',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 19. CMC REGULATORY SPECIALIST - Mid
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_specialist_automator',
    'Jennifer Martinez - CMC Regulatory Specialist Automator',
    E'**Role:** CMC Regulatory Specialist\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 70/100\n**Work Complexity:** Technical\n\n## AI Profile\nJennifer uses AI tools for CMC document drafting, variation tracking, and change assessment support. She has developed workflows that combine AI assistance with expert CMC knowledge.\n\n## VPANES Scores\n- **Visibility:** 5/10 - CMC document quality\n- **Pain:** 6/10 - Complex CMC documentation demands\n- **Actions:** 7/10 - AI-assisted CMC workflows\n- **Needs:** 7/10 - CMC-specific AI tools\n- **Emotions:** 7/10 - Positive about AI support\n- **Scenarios:** CMC workflow automation\n\n## Goals\n- Reduce CMC drafting time by 30%\n- Maintain quality with AI support\n- Build CMC AI expertise\n\n## Frustrations\n- Technical content challenging AI\n- Limited CMC-specific tools\n- Review burden for AI output',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_specialist_orchestrator',
    'Michelle Kim - CMC Regulatory Specialist Orchestrator',
    E'**Role:** CMC Regulatory Specialist\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 74/100\n**Work Complexity:** Technical\n\n## AI Profile\nMichelle integrates AI tools across CMC workflows, connecting document templates, change tracking, and regulatory databases for efficient CMC management.\n\n## VPANES Scores\n- **Visibility:** 5/10 - CMC process leadership\n- **Pain:** 6/10 - Managing CMC tool complexity\n- **Actions:** 8/10 - CMC AI integration\n- **Needs:** 7/10 - Unified CMC platform\n- **Emotions:** 7/10 - Energized by process improvement\n- **Scenarios:** CMC workflow integration\n\n## Goals\n- Create seamless CMC workflows\n- Integrate CMC AI tools\n- Lead CMC automation\n\n## Frustrations\n- Fragmented CMC tools\n- Technical integration complexity\n- Varying CMC requirements',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_specialist_learner',
    'Sarah Wilson - CMC Regulatory Specialist Learner',
    E'**Role:** CMC Regulatory Specialist\n**Archetype:** LEARNER\n**AI Maturity Score:** 42/100\n**Work Complexity:** Technical\n\n## AI Profile\nSarah is cautiously exploring AI for CMC work, testing tools on less critical tasks while building her understanding of AI capabilities for technical content.\n\n## VPANES Scores\n- **Visibility:** 5/10 - CMC task delivery\n- **Pain:** 5/10 - Learning AI for technical work\n- **Actions:** 5/10 - Exploratory AI testing\n- **Needs:** 6/10 - CMC AI guidance\n- **Emotions:** 6/10 - Curious but cautious\n- **Scenarios:** Careful CMC AI exploration\n\n## Goals\n- Evaluate AI for CMC support\n- Build AI competency\n- Find appropriate use cases\n\n## Frustrations\n- AI lacking CMC knowledge\n- Technical accuracy concerns\n- Limited learning time',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cmc_regulatory_specialist_skeptic',
    'Nancy Davis - CMC Regulatory Specialist Skeptic',
    E'**Role:** CMC Regulatory Specialist\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 25/100\n**Work Complexity:** Technical\n\n## AI Profile\nNancy is skeptical of AI for CMC work, believing technical manufacturing content requires specialized expertise that AI cannot provide. She prefers proven manual approaches.\n\n## VPANES Scores\n- **Visibility:** 5/10 - CMC quality\n- **Pain:** 6/10 - Pressure to use AI\n- **Actions:** 3/10 - Minimal AI engagement\n- **Needs:** 6/10 - Proof of AI CMC accuracy\n- **Emotions:** 4/10 - Protective of CMC quality\n- **Scenarios:** Defending expert-driven CMC\n\n## Goals\n- Maintain CMC quality through expertise\n- Avoid AI technical errors\n- Require accuracy validation\n\n## Frustrations\n- AI lacking CMC understanding\n- Pressure to automate\n- Time reviewing AI errors',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- 20. REGULATORY COMPLIANCE SPECIALIST - Mid
-- =====================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_specialist_automator',
    'Katherine Chen - Regulatory Compliance Specialist Automator',
    E'**Role:** Regulatory Compliance Specialist\n**Archetype:** AUTOMATOR\n**AI Maturity Score:** 71/100\n**Work Complexity:** Operational\n\n## AI Profile\nKatherine has automated compliance tracking, deviation monitoring, and audit support tasks using AI. She uses AI dashboards for real-time compliance visibility and early issue detection.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Compliance task accountability\n- **Pain:** 6/10 - High-volume compliance monitoring\n- **Actions:** 7/10 - AI-automated compliance workflows\n- **Needs:** 7/10 - Compliance automation tools\n- **Emotions:** 7/10 - Positive about automation\n- **Scenarios:** Compliance workflow automation\n\n## Goals\n- Automate routine compliance checks\n- Enable proactive issue detection\n- Build compliance AI skills\n\n## Frustrations\n- Legacy compliance systems\n- Data quality issues\n- Limited automation budget',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_specialist_orchestrator',
    'Diana Park - Regulatory Compliance Specialist Orchestrator',
    E'**Role:** Regulatory Compliance Specialist\n**Archetype:** ORCHESTRATOR\n**AI Maturity Score:** 75/100\n**Work Complexity:** Operational\n\n## AI Profile\nDiana integrates multiple AI tools for compliance management, connecting tracking systems, monitoring tools, and reporting dashboards for comprehensive compliance visibility.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Compliance process leadership\n- **Pain:** 6/10 - Managing diverse compliance tools\n- **Actions:** 8/10 - Compliance AI integration\n- **Needs:** 7/10 - Unified compliance platform\n- **Emotions:** 7/10 - Energized by integration\n- **Scenarios:** Compliance workflow integration\n\n## Goals\n- Create seamless compliance workflows\n- Integrate compliance AI tools\n- Lead compliance automation\n\n## Frustrations\n- Fragmented compliance tools\n- System integration complexity\n- Varying compliance requirements',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_specialist_learner',
    'Emily Thompson - Regulatory Compliance Specialist Learner',
    E'**Role:** Regulatory Compliance Specialist\n**Archetype:** LEARNER\n**AI Maturity Score:** 44/100\n**Work Complexity:** Operational\n\n## AI Profile\nEmily is exploring AI for compliance tasks through careful testing. She recognizes AI potential for monitoring but needs to ensure compliance rigor is maintained.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Compliance tasks\n- **Pain:** 5/10 - Learning AI while maintaining compliance\n- **Actions:** 5/10 - Exploratory AI pilots\n- **Needs:** 6/10 - Compliance AI guidance\n- **Emotions:** 6/10 - Cautiously curious\n- **Scenarios:** Careful compliance AI adoption\n\n## Goals\n- Evaluate AI for compliance tasks\n- Build AI competency\n- Maintain compliance rigor\n\n## Frustrations\n- Compliance requirements limiting experimentation\n- AI tools lacking compliance understanding\n- Limited resources for pilots',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'regulatory_compliance_specialist_skeptic',
    'Barbara Johnson - Regulatory Compliance Specialist Skeptic',
    E'**Role:** Regulatory Compliance Specialist\n**Archetype:** SKEPTIC\n**AI Maturity Score:** 26/100\n**Work Complexity:** Operational\n\n## AI Profile\nBarbara is skeptical of AI in compliance, emphasizing that compliance monitoring requires careful human judgment. She prefers proven manual approaches to ensure compliance accuracy.\n\n## VPANES Scores\n- **Visibility:** 5/10 - Compliance accuracy\n- **Pain:** 6/10 - Pressure to adopt AI\n- **Actions:** 3/10 - Minimal AI engagement\n- **Needs:** 6/10 - Proof of AI compliance accuracy\n- **Emotions:** 4/10 - Protective of compliance integrity\n- **Scenarios:** Defending manual verification\n\n## Goals\n- Maintain compliance accuracy\n- Avoid AI-related compliance failures\n- Require extensive validation\n\n## Frustrations\n- Pressure to adopt AI without proof\n- AI missing compliance nuance\n- Accountability for AI errors',
    true, NOW(), NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- =====================================================
-- SUMMARY
-- =====================================================
-- Total Regulatory Affairs Personas: 80
-- Role Types: 20
-- Archetypes per role: 4 (AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC)
--
-- Executive Level (4 roles, 16 personas):
--   - Chief Regulatory Officer (CRO)
--   - SVP Regulatory Affairs
--   - VP Regulatory Strategy
--   - VP Regulatory Submissions
--
-- Director Level (6 roles, 24 personas):
--   - Director of Regulatory Affairs
--   - Regulatory Compliance Director
--   - Regulatory Intelligence Director
--   - Head of Regulatory Operations
--   - CMC Regulatory Affairs Director
--   - Submissions Director
--
-- Senior Level (6 roles, 24 personas):
--   - Senior Regulatory Affairs Manager
--   - Regulatory Compliance Manager
--   - Senior Regulatory Writer
--   - Regulatory Labeling Manager
--   - Sr. CMC Regulatory Manager
--   - Submissions Manager
--
-- Mid Level (4 roles, 16 personas):
--   - Regulatory Writer
--   - Regulatory Document Specialist
--   - CMC Regulatory Specialist
--   - Regulatory Compliance Specialist
-- =====================================================

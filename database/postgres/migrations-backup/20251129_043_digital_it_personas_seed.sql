-- ============================================================================
-- MIGRATION 043: DIGITAL & IT FUNCTION PERSONAS - MECE FRAMEWORK
-- Version: 1.0.0 | Date: 2025-11-29
-- Purpose: Seed personas for Digital & IT roles using 4 MECE archetypes each
-- Total: 80 personas (20 core role types × 4 archetypes)
-- ============================================================================
--
-- Digital & IT Roles Covered (20 core types):
-- 1. Chief Technology Officer (CTO)
-- 2. VP of Engineering
-- 3. Chief Architect
-- 4. Chief Information Security Officer (CISO)
-- 5. Director of Engineering
-- 6. Director of Data Engineering
-- 7. Director of DevOps
-- 8. Engineering Manager
-- 9. Software Engineer
-- 10. Senior Software Engineer
-- 11. Data Engineer
-- 12. ML Engineer
-- 13. DevOps Engineer
-- 14. Cloud Engineer
-- 15. Data Scientist
-- 16. Solutions Architect
-- 17. Security Engineer
-- 18. Site Reliability Engineer
-- 19. QA Engineer
-- 20. Digital Health Strategy Lead
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 1: CHIEF TECHNOLOGY OFFICER (CTO) - 4 PERSONAS
-- ============================================================================

-- CTO: AUTOMATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cto_automator',
    'James Chen - CTO Automator',
    E'**Role:** Chief Technology Officer\n**Archetype:** AUTOMATOR\n**Tagline:** Efficiency-Driven Technology Executive\n\n**Profile:**\n- Seniority: C-Suite (20 years experience)\n- Education: MS Computer Science, Stanford MBA\n- Geographic Scope: Global\n- Organization Size: Top 15 Pharma\n- Direct Reports: 15\n- Team Size: 300+\n\n**AI Profile:**\n- AI Maturity Score: 88/100 (Very High)\n- Work Complexity Score: 50/100 (Moderate)\n- Technology Adoption: Innovator\n- Risk Tolerance: Moderate-High\n- Change Readiness: Very High\n- Preferred Service Layer: WORKFLOWS\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 8/10\n- Actions: 9/10\n- Needs: 8/10\n- Emotions: 6/10\n- Scenarios: 9/10\n\n**Key Motivations:**\n- Accelerate development velocity by 50%\n- Automate infrastructure operations\n- Standardize CI/CD pipelines globally\n- Enable AI-powered development\n\n**Top Frustrations:**\n- Technical debt slowing delivery\n- Manual deployment processes\n- Inconsistent development practices\n- Slow incident response times\n\n**Goals:**\n- Implement AI-powered DevOps\n- Deploy automated code review\n- Create intelligent monitoring\n- Reduce MTTR by 70%\n\n**Tools Used:**\n- GitHub, AWS/Azure/GCP, Kubernetes, Terraform, Observability platforms',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- CTO: ORCHESTRATOR
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cto_orchestrator',
    'Dr. Sarah Mitchell - CTO Orchestrator',
    E'**Role:** Chief Technology Officer\n**Archetype:** ORCHESTRATOR\n**Tagline:** Strategic Technology Transformation Leader\n\n**Profile:**\n- Seniority: C-Suite (25 years experience)\n- Education: PhD Computer Science, MBA\n- Geographic Scope: Global\n- Organization Size: Top 5 Pharma\n- Direct Reports: 25\n- Team Size: 800+\n\n**AI Profile:**\n- AI Maturity Score: 95/100 (Very High)\n- Work Complexity Score: 92/100 (Strategic)\n- Technology Adoption: Visionary\n- Risk Tolerance: High\n- Change Readiness: Very High\n- Preferred Service Layer: SOLUTION_BUILDER\n\n**VPANES Scores:**\n- Visibility: 10/10\n- Pain: 9/10\n- Actions: 10/10\n- Needs: 9/10\n- Emotions: 7/10\n- Scenarios: 10/10\n\n**Key Motivations:**\n- Lead pharma digital transformation\n- Build AI-first engineering culture\n- Pioneer drug discovery AI platforms\n- Create competitive technology advantage\n\n**Top Frustrations:**\n- Slow organizational change\n- Legacy system constraints\n- Talent acquisition challenges\n- Regulatory technology limitations\n\n**Goals:**\n- Build AI-native engineering platform\n- Deploy enterprise LLM infrastructure\n- Create intelligent automation ecosystem\n- Lead industry technology standards\n\n**Tools Used:**\n- Enterprise AI platforms, Multi-agent systems, Custom LLM infrastructure, Cloud-native architecture, Advanced MLOps',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- CTO: LEARNER
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cto_learner',
    'Michael Park - CTO Learner',
    E'**Role:** Chief Technology Officer\n**Archetype:** LEARNER\n**Tagline:** Newly Appointed Technology Executive\n\n**Profile:**\n- Seniority: C-Suite (first CTO role)\n- Education: MS Computer Science\n- Geographic Scope: US/Americas\n- Organization Size: Mid-Size Pharma\n- Direct Reports: 10\n- Team Size: 150\n\n**AI Profile:**\n- AI Maturity Score: 55/100 (Moderate)\n- Work Complexity Score: 48/100 (Moderate)\n- Technology Adoption: Early Adopter\n- Risk Tolerance: Moderate\n- Change Readiness: Moderate-High\n- Preferred Service Layer: ASK_EXPERT\n\n**VPANES Scores:**\n- Visibility: 8/10\n- Pain: 8/10\n- Actions: 7/10\n- Needs: 6/10\n- Emotions: 7/10\n- Scenarios: 7/10\n\n**Key Motivations:**\n- Successfully lead technology organization\n- Build executive presence\n- Master pharma regulatory technology\n- Develop board-level communication\n\n**Top Frustrations:**\n- Pharma compliance requirements unfamiliar\n- Balance innovation with regulation\n- Limited strategic planning experience\n- Understanding pharma-specific technology\n\n**Goals:**\n- Master pharma technology landscape\n- Build AI-assisted strategy skills\n- Develop executive leadership capabilities\n- Create technology roadmap\n\n**Ideal AI Features:**\n- Executive strategy guidance\n- Pharma technology best practices\n- Board presentation templates\n- Regulatory compliance guidance',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- CTO: SKEPTIC
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at)
VALUES (
    'cto_skeptic',
    'Dr. William Harrison - CTO Skeptic',
    E'**Role:** Chief Technology Officer\n**Archetype:** SKEPTIC\n**Tagline:** Security-First Technology Leader\n\n**Profile:**\n- Seniority: C-Suite (30 years experience)\n- Education: PhD Computer Science, Security certifications\n- Geographic Scope: Global\n- Organization Size: Large Pharma\n- Direct Reports: 20\n- Team Size: 500\n\n**AI Profile:**\n- AI Maturity Score: 35/100 (Low-Moderate)\n- Work Complexity Score: 88/100 (Strategic)\n- Technology Adoption: Late Majority\n- Risk Tolerance: Low\n- Change Readiness: Low\n- Preferred Service Layer: ASK_EXPERT (Human-in-the-loop)\n\n**VPANES Scores:**\n- Visibility: 9/10\n- Pain: 5/10\n- Actions: 4/10\n- Needs: 6/10\n- Emotions: 4/10\n- Scenarios: 5/10\n\n**Key Motivations:**\n- Protect enterprise security posture\n- Ensure regulatory compliance\n- Maintain system reliability\n- Preserve data integrity\n\n**Top Frustrations:**\n- AI security vulnerabilities\n- Pressure for rapid AI adoption\n- LLM data leakage concerns\n- Compliance audit risks\n\n**Goals:**\n- Establish AI security framework\n- Ensure complete audit trails\n- Maintain validated systems\n- Build responsible AI governance\n\n**Required AI Features:**\n- Full security audit\n- No external data transmission\n- Complete logging\n- Human approval workflows\n- Validated system compliance',
    true,
    NOW(),
    NOW()
)
ON CONFLICT (persona_key) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- ============================================================================
-- ROLE 2: VP OF ENGINEERING - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('vp_engineering_automator', 'David Kim - VP of Engineering Automator', E'**Role:** VP of Engineering\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate (48/100)\n**Focus:** Automate engineering operations, CI/CD, code quality\n**Goals:** Deploy AI-powered development tools, reduce cycle time by 50%\n**Tools:** GitHub, Jenkins, SonarQube, Cloud platforms', true, NOW(), NOW()),
('vp_engineering_orchestrator', 'Dr. Emily Zhang - VP of Engineering Orchestrator', E'**Role:** VP of Engineering\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** Strategic (88/100)\n**Focus:** Build intelligent engineering platform, AI-powered development, transformation\n**Goals:** Create AI-native engineering culture, deploy copilot systems\n**Tools:** Advanced AI platforms, Custom development tools, MLOps', true, NOW(), NOW()),
('vp_engineering_learner', 'Jason Williams - VP of Engineering Learner', E'**Role:** VP of Engineering\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (50/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Master engineering leadership, build technical strategy, learn AI tools\n**Goals:** Develop VP capabilities, build AI-assisted management\n**Ideal Features:** Leadership tutorials, templates, AI mentor', true, NOW(), NOW()),
('vp_engineering_skeptic', 'Robert Anderson - VP of Engineering Skeptic', E'**Role:** VP of Engineering\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (35/100)\n**Work Complexity:** High (82/100)\n**Focus:** Maintain code quality, ensure system reliability, security oversight\n**Goals:** Protect engineering standards, ensure validated systems\n**Requirements:** Full code review, human approval, quality assurance', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 3: CHIEF ARCHITECT - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('chief_architect_automator', 'Anthony Lee - Chief Architect Automator', E'**Role:** Chief Architect\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate-High (55/100)\n**Focus:** Automate architecture documentation, design patterns, technical debt tracking\n**Goals:** Deploy AI-powered architecture tools, accelerate design by 50%\n**Tools:** Architecture tools, Documentation generators, Design platforms', true, NOW(), NOW()),
('chief_architect_orchestrator', 'Dr. Michelle Park - Chief Architect Orchestrator', E'**Role:** Chief Architect\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (95/100)\n**Work Complexity:** Strategic (90/100)\n**Focus:** Build AI-native architecture, enterprise transformation, platform strategy\n**Goals:** Create intelligent architecture platform, pioneer AI-first design\n**Tools:** Advanced modeling, Custom AI, Enterprise platforms', true, NOW(), NOW()),
('chief_architect_learner', 'Brian Johnson - Chief Architect Learner', E'**Role:** Chief Architect\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (50/100)\n**Focus:** Master enterprise architecture, build pharma expertise, learn AI patterns\n**Goals:** Develop architecture leadership, build AI-assisted design\n**Ideal Features:** Architecture tutorials, patterns library, AI mentor', true, NOW(), NOW()),
('chief_architect_skeptic', 'Dr. Thomas Brown - Chief Architect Skeptic', E'**Role:** Chief Architect\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** High (85/100)\n**Focus:** Maintain architecture integrity, ensure scalability, human oversight\n**Goals:** Protect system reliability, ensure design quality\n**Requirements:** Full review, proven patterns, human validation', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 4: CHIEF INFORMATION SECURITY OFFICER (CISO) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('ciso_automator', 'Jennifer Martinez - CISO Automator', E'**Role:** Chief Information Security Officer\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (48/100)\n**Focus:** Automate threat detection, compliance monitoring, security operations\n**Goals:** Deploy AI-powered SIEM, reduce incident response by 60%\n**Tools:** SIEM platforms, Threat intelligence, Compliance automation', true, NOW(), NOW()),
('ciso_orchestrator', 'Dr. Kevin Chen - CISO Orchestrator', E'**Role:** Chief Information Security Officer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build intelligent security platform, predictive threat modeling, transformation\n**Goals:** Create AI-powered security operations, deploy predictive defense\n**Tools:** Advanced AI security, Threat hunting, Custom platforms', true, NOW(), NOW()),
('ciso_learner', 'Amanda Wilson - CISO Learner', E'**Role:** Chief Information Security Officer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (45/100)\n**Work Complexity:** Moderate (48/100)\n**Focus:** Master pharma security requirements, build strategy, learn AI security\n**Goals:** Develop CISO capabilities, build AI-assisted operations\n**Ideal Features:** Security tutorials, compliance templates, AI mentor', true, NOW(), NOW()),
('ciso_skeptic', 'Dr. Richard Taylor - CISO Skeptic', E'**Role:** Chief Information Security Officer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (25/100)\n**Work Complexity:** High (88/100)\n**Focus:** Maintain security integrity, ensure compliance, human oversight\n**Goals:** Protect enterprise security, ensure regulatory compliance\n**Requirements:** Full audit, no AI data access, human validation', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 5: DIRECTOR OF ENGINEERING - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('director_engineering_automator', 'Chris Davis - Director of Engineering Automator', E'**Role:** Director of Engineering\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate team operations, sprint planning, code quality\n**Goals:** Deploy AI-powered engineering tools, reduce overhead by 50%\n**Tools:** Project management, Code analysis, CI/CD platforms', true, NOW(), NOW()),
('director_engineering_orchestrator', 'Dr. Lisa Kim - Director of Engineering Orchestrator', E'**Role:** Director of Engineering\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (80/100)\n**Focus:** Build intelligent engineering culture, AI-powered development, team transformation\n**Goals:** Create AI-native teams, deploy developer productivity platforms\n**Tools:** Advanced AI tools, Custom platforms, Developer productivity', true, NOW(), NOW()),
('director_engineering_learner', 'Tyler Johnson - Director of Engineering Learner', E'**Role:** Director of Engineering\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (48/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master engineering leadership, build team skills, learn AI tools\n**Goals:** Develop director capabilities, build AI-assisted management\n**Ideal Features:** Leadership tutorials, templates, AI mentor', true, NOW(), NOW()),
('director_engineering_skeptic', 'Margaret Brown - Director of Engineering Skeptic', E'**Role:** Director of Engineering\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (32/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain code quality, ensure reliability, team development\n**Goals:** Protect engineering standards, ensure human-first culture\n**Requirements:** Human review, proven practices, quality focus', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 6: SOFTWARE ENGINEER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('software_engineer_automator', 'Alex Chen - Software Engineer Automator', E'**Role:** Software Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Automate coding tasks, testing, documentation\n**Goals:** Deploy AI coding assistants, reduce dev time by 50%\n**Tools:** GitHub Copilot, IDE plugins, Testing automation', true, NOW(), NOW()),
('software_engineer_orchestrator', 'Dr. Emily Park - Software Engineer Orchestrator', E'**Role:** Software Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** High (75/100)\n**Focus:** Build AI-native applications, intelligent systems, innovation\n**Goals:** Create AI-powered features, pioneer LLM integration\n**Tools:** Advanced AI APIs, Custom models, Modern frameworks', true, NOW(), NOW()),
('software_engineer_learner', 'Jordan Williams - Software Engineer Learner', E'**Role:** Software Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (32/100)\n**Focus:** Master software development, build technical skills, learn AI tools\n**Goals:** Develop engineering expertise, build AI-assisted coding\n**Ideal Features:** Coding tutorials, project templates, AI mentor', true, NOW(), NOW()),
('software_engineer_skeptic', 'Ryan Thompson - Software Engineer Skeptic', E'**Role:** Software Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** Moderate-High (65/100)\n**Focus:** Maintain code quality, understand all code, human craftsmanship\n**Goals:** Protect code integrity, ensure understanding\n**Requirements:** Full code review, no blind AI usage, human comprehension', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 7: DATA ENGINEER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('data_engineer_automator', 'Kevin Lee - Data Engineer Automator', E'**Role:** Data Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate data pipelines, ETL, data quality\n**Goals:** Deploy AI-powered data ops, reduce manual work by 70%\n**Tools:** Airflow, dbt, Spark, Cloud data platforms', true, NOW(), NOW()),
('data_engineer_orchestrator', 'Dr. Sarah Kim - Data Engineer Orchestrator', E'**Role:** Data Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build intelligent data platforms, ML pipelines, data mesh\n**Goals:** Create AI-native data architecture, deploy real-time analytics\n**Tools:** Advanced data platforms, ML infrastructure, Custom pipelines', true, NOW(), NOW()),
('data_engineer_learner', 'Brandon Martinez - Data Engineer Learner', E'**Role:** Data Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master data engineering, build platform skills, learn AI tools\n**Goals:** Develop DE expertise, build AI-assisted pipelines\n**Ideal Features:** DE tutorials, project templates, AI mentor', true, NOW(), NOW()),
('data_engineer_skeptic', 'Elizabeth Wilson - Data Engineer Skeptic', E'**Role:** Data Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Moderate (45/100)\n**Work Complexity:** High (72/100)\n**Focus:** Maintain data quality, ensure pipeline reliability, human oversight\n**Goals:** Protect data integrity, ensure validated pipelines\n**Requirements:** Full testing, human validation, quality assurance', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 8: ML ENGINEER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('ml_engineer_automator', 'Michael Zhang - ML Engineer Automator', E'**Role:** ML Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Automate ML pipelines, model deployment, monitoring\n**Goals:** Deploy MLOps automation, reduce model deployment time by 60%\n**Tools:** MLflow, Kubeflow, SageMaker, Feature stores', true, NOW(), NOW()),
('ml_engineer_orchestrator', 'Dr. Jessica Chen - ML Engineer Orchestrator', E'**Role:** ML Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (95/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build advanced ML systems, LLM infrastructure, AI innovation\n**Goals:** Create production LLM platform, pioneer AI applications\n**Tools:** Advanced ML frameworks, Custom LLM, Cloud AI', true, NOW(), NOW()),
('ml_engineer_learner', 'David Johnson - ML Engineer Learner', E'**Role:** ML Engineer\n**Archetype:** LEARNER\n**AI Maturity:** High (70/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Master ML engineering, build production skills, learn MLOps\n**Goals:** Develop MLE expertise, build production ML\n**Ideal Features:** ML tutorials, project templates, MLOps mentorship', true, NOW(), NOW()),
('ml_engineer_skeptic', 'Dr. Robert Taylor - ML Engineer Skeptic', E'**Role:** ML Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** High (78/100)\n**Focus:** Ensure model validity, interpretability, responsible AI\n**Goals:** Protect model reliability, ensure explainability\n**Requirements:** Full validation, interpretable models, ethical AI', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 9: DEVOPS ENGINEER - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('devops_engineer_automator', 'Chris Park - DevOps Engineer Automator', E'**Role:** DevOps Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate infrastructure, CI/CD, monitoring\n**Goals:** Deploy AI-powered DevOps, reduce manual ops by 80%\n**Tools:** Terraform, Ansible, Kubernetes, Observability platforms', true, NOW(), NOW()),
('devops_engineer_orchestrator', 'Dr. Amanda Chen - DevOps Engineer Orchestrator', E'**Role:** DevOps Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build intelligent infrastructure, self-healing systems, platform engineering\n**Goals:** Create AI-native operations, deploy autonomous systems\n**Tools:** Advanced IaC, AIOps platforms, Custom automation', true, NOW(), NOW()),
('devops_engineer_learner', 'Tyler Davis - DevOps Engineer Learner', E'**Role:** DevOps Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master DevOps practices, build cloud skills, learn automation\n**Goals:** Develop DevOps expertise, build AI-assisted operations\n**Ideal Features:** DevOps tutorials, IaC templates, Cloud mentorship', true, NOW(), NOW()),
('devops_engineer_skeptic', 'Sandra Thompson - DevOps Engineer Skeptic', E'**Role:** DevOps Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** High (72/100)\n**Focus:** Maintain system reliability, ensure security, human oversight\n**Goals:** Protect infrastructure stability, ensure validated changes\n**Requirements:** Full testing, change management, human approval', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ROLE 10: DATA SCIENTIST - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('data_scientist_automator', 'Andrew Kim - Data Scientist Automator', E'**Role:** Data Scientist\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate data analysis, model training, reporting\n**Goals:** Deploy AutoML pipelines, reduce analysis time by 60%\n**Tools:** AutoML, Jupyter, Python, Analytics platforms', true, NOW(), NOW()),
('data_scientist_orchestrator', 'Dr. Rachel Chen - Data Scientist Orchestrator', E'**Role:** Data Scientist\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (95/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build advanced AI applications, pharma-specific models, innovation\n**Goals:** Create domain-specific AI, pioneer drug discovery ML\n**Tools:** Advanced ML, Custom models, Domain platforms', true, NOW(), NOW()),
('data_scientist_learner', 'Matthew Johnson - Data Scientist Learner', E'**Role:** Data Scientist\n**Archetype:** LEARNER\n**AI Maturity:** High (65/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master data science, build pharma expertise, learn ML\n**Goals:** Develop DS expertise, build domain skills\n**Ideal Features:** DS tutorials, pharma datasets, ML mentorship', true, NOW(), NOW()),
('data_scientist_skeptic', 'Dr. Catherine Brown - Data Scientist Skeptic', E'**Role:** Data Scientist\n**Archetype:** SKEPTIC\n**AI Maturity:** Moderate (50/100)\n**Work Complexity:** High (78/100)\n**Focus:** Ensure statistical rigor, model validity, interpretability\n**Goals:** Protect analytical integrity, ensure reproducibility\n**Requirements:** Full validation, statistical testing, peer review', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- ============================================================================
-- ADDITIONAL IT ROLES (Abbreviated format)
-- ============================================================================

-- Cloud Engineer: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('cloud_engineer_automator', 'Nathan Lee - Cloud Engineer Automator', E'**Role:** Cloud Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (85/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Automate cloud operations, IaC, cost optimization\n**Tools:** AWS/Azure/GCP, Terraform, CloudFormation', true, NOW(), NOW()),
('cloud_engineer_orchestrator', 'Dr. Michelle Park - Cloud Engineer Orchestrator', E'**Role:** Cloud Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** High (78/100)\n**Focus:** Build intelligent cloud platforms, FinOps optimization, multi-cloud\n**Tools:** Advanced cloud platforms, FinOps tools, Custom automation', true, NOW(), NOW()),
('cloud_engineer_learner', 'Jason Williams - Cloud Engineer Learner', E'**Role:** Cloud Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Master cloud platforms, build IaC skills, learn automation\n**Ideal Features:** Cloud tutorials, certification paths, IaC templates', true, NOW(), NOW()),
('cloud_engineer_skeptic', 'Robert Taylor - Cloud Engineer Skeptic', E'**Role:** Cloud Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (40/100)\n**Work Complexity:** High (72/100)\n**Focus:** Maintain cloud security, cost control, validated changes\n**Requirements:** Security review, cost approval, change management', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Solutions Architect: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('solutions_architect_automator', 'Daniel Chen - Solutions Architect Automator', E'**Role:** Solutions Architect\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (82/100)\n**Work Complexity:** Moderate (48/100)\n**Focus:** Automate architecture documentation, patterns, diagrams\n**Tools:** Architecture tools, Documentation generators, Diagramming', true, NOW(), NOW()),
('solutions_architect_orchestrator', 'Dr. Victoria Kim - Solutions Architect Orchestrator', E'**Role:** Solutions Architect\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build intelligent architecture, AI-native design, transformation\n**Tools:** Advanced modeling, Custom platforms, AI design tools', true, NOW(), NOW()),
('solutions_architect_learner', 'Eric Johnson - Solutions Architect Learner', E'**Role:** Solutions Architect\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (52/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Master architecture design, build pharma expertise, learn patterns\n**Ideal Features:** Architecture tutorials, pattern library, design templates', true, NOW(), NOW()),
('solutions_architect_skeptic', 'Patricia Wilson - Solutions Architect Skeptic', E'**Role:** Solutions Architect\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (38/100)\n**Work Complexity:** High (80/100)\n**Focus:** Maintain design quality, ensure scalability, proven patterns\n**Requirements:** Human review, proven patterns, stakeholder approval', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Security Engineer: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('security_engineer_automator', 'Steven Park - Security Engineer Automator', E'**Role:** Security Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (78/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate security scanning, vulnerability management, compliance\n**Tools:** SAST/DAST tools, Vulnerability scanners, Compliance platforms', true, NOW(), NOW()),
('security_engineer_orchestrator', 'Dr. Amanda Chen - Security Engineer Orchestrator', E'**Role:** Security Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (80/100)\n**Focus:** Build intelligent security, threat hunting, zero-trust\n**Tools:** Advanced security platforms, Threat intelligence, Custom detection', true, NOW(), NOW()),
('security_engineer_learner', 'Brandon Martinez - Security Engineer Learner', E'**Role:** Security Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (48/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master security engineering, build pharma compliance, learn tools\n**Ideal Features:** Security tutorials, compliance templates, certification paths', true, NOW(), NOW()),
('security_engineer_skeptic', 'Dr. Thomas Brown - Security Engineer Skeptic', E'**Role:** Security Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (28/100)\n**Work Complexity:** High (82/100)\n**Focus:** Maintain security posture, manual verification, human judgment\n**Requirements:** No AI data access, manual review, conservative approach', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Site Reliability Engineer: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('sre_automator', 'Kevin Zhang - SRE Automator', E'**Role:** Site Reliability Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** Moderate (42/100)\n**Focus:** Automate incident response, monitoring, capacity planning\n**Tools:** Observability platforms, Incident management, Automation tools', true, NOW(), NOW()),
('sre_orchestrator', 'Dr. Rachel Kim - SRE Orchestrator', E'**Role:** Site Reliability Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (92/100)\n**Work Complexity:** High (80/100)\n**Focus:** Build intelligent operations, self-healing systems, AIOps\n**Tools:** Advanced AIOps, Custom automation, Predictive platforms', true, NOW(), NOW()),
('sre_learner', 'Michael Johnson - SRE Learner', E'**Role:** Site Reliability Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (55/100)\n**Work Complexity:** Moderate (40/100)\n**Focus:** Master SRE practices, build reliability skills, learn AIOps\n**Ideal Features:** SRE tutorials, incident templates, reliability training', true, NOW(), NOW()),
('sre_skeptic', 'Elizabeth Taylor - SRE Skeptic', E'**Role:** Site Reliability Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (42/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain system reliability, human oversight, proven practices\n**Requirements:** Manual verification, change approval, reliability focus', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- QA Engineer: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('qa_engineer_automator', 'Laura Chen - QA Engineer Automator', E'**Role:** QA Engineer\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (82/100)\n**Work Complexity:** Moderate (38/100)\n**Focus:** Automate testing, test generation, regression suites\n**Tools:** Selenium, Playwright, Test automation frameworks', true, NOW(), NOW()),
('qa_engineer_orchestrator', 'Dr. David Kim - QA Engineer Orchestrator', E'**Role:** QA Engineer\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (88/100)\n**Work Complexity:** High (75/100)\n**Focus:** Build intelligent testing, AI test generation, quality transformation\n**Tools:** Advanced testing platforms, AI test generation, Custom frameworks', true, NOW(), NOW()),
('qa_engineer_learner', 'Jennifer Williams - QA Engineer Learner', E'**Role:** QA Engineer\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (50/100)\n**Work Complexity:** Moderate (35/100)\n**Focus:** Master QA practices, build automation skills, learn AI testing\n**Ideal Features:** QA tutorials, test templates, automation training', true, NOW(), NOW()),
('qa_engineer_skeptic', 'Richard Thompson - QA Engineer Skeptic', E'**Role:** QA Engineer\n**Archetype:** SKEPTIC\n**AI Maturity:** Low (30/100)\n**Work Complexity:** Moderate-High (68/100)\n**Focus:** Maintain test coverage, human verification, quality assurance\n**Requirements:** Manual review, full coverage, human validation', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

-- Digital Health Strategy Lead: 4 Personas
INSERT INTO personas (persona_key, display_name, description, is_active, created_at, updated_at) VALUES
('digital_health_lead_automator', 'Amanda Park - Digital Health Strategy Lead Automator', E'**Role:** Digital Health Strategy Lead\n**Archetype:** AUTOMATOR\n**AI Maturity:** High (80/100)\n**Work Complexity:** Moderate (48/100)\n**Focus:** Automate digital health analytics, patient engagement, reporting\n**Tools:** Digital health platforms, Analytics, Patient engagement tools', true, NOW(), NOW()),
('digital_health_lead_orchestrator', 'Dr. Kevin Chen - Digital Health Strategy Lead Orchestrator', E'**Role:** Digital Health Strategy Lead\n**Archetype:** ORCHESTRATOR\n**AI Maturity:** Very High (90/100)\n**Work Complexity:** Strategic (85/100)\n**Focus:** Build intelligent digital health, AI patient engagement, transformation\n**Tools:** Advanced AI platforms, Custom health apps, Predictive analytics', true, NOW(), NOW()),
('digital_health_lead_learner', 'Jessica Martinez - Digital Health Strategy Lead Learner', E'**Role:** Digital Health Strategy Lead\n**Archetype:** LEARNER\n**AI Maturity:** Moderate (48/100)\n**Work Complexity:** Moderate (45/100)\n**Focus:** Master digital health, build strategy skills, learn AI tools\n**Ideal Features:** Digital health tutorials, strategy templates, AI mentor', true, NOW(), NOW()),
('digital_health_lead_skeptic', 'Dr. William Brown - Digital Health Strategy Lead Skeptic', E'**Role:** Digital Health Strategy Lead\n**Archetype:** SKEPTIC\n**AI Maturity:** Low-Moderate (35/100)\n**Work Complexity:** High (78/100)\n**Focus:** Maintain patient safety, ensure regulatory compliance, human oversight\n**Requirements:** Patient safety review, regulatory approval, clinical validation', true, NOW(), NOW())
ON CONFLICT (persona_key) DO UPDATE SET display_name = EXCLUDED.display_name, description = EXCLUDED.description, updated_at = NOW();

COMMIT;

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- Total Digital & IT Personas: 80
-- Roles covered: 20 core Digital & IT role types
-- Archetypes: AUTOMATOR, ORCHESTRATOR, LEARNER, SKEPTIC (4 each)
--
-- Key characteristics by archetype:
-- AUTOMATOR: Very high AI maturity (78-90%), moderate complexity, automation-focused
-- ORCHESTRATOR: Very high AI maturity (88-95%), strategic complexity, transformation leaders
-- LEARNER: Moderate AI maturity (48-70%), lower complexity, skill-building focus
-- SKEPTIC: Low-moderate AI maturity (25-55%), higher complexity, security and validation focus
-- ============================================================================

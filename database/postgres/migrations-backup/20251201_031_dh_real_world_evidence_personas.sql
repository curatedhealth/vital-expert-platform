-- ============================================================================
-- MIGRATION 031: DIGITAL HEALTH REAL-WORLD EVIDENCE PERSONAS
-- Version: 1.0.0 | Date: 2025-12-01
-- Purpose: Create 4 MECE personas for each Real-World Evidence role (11 roles)
-- Total: 44 personas (11 roles × 4 archetypes)
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 1: RWE DATA ANALYST (Entry) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-RWE-ANALYST-AUT', 'Noah Chen', 'MECE-Role-based', 'RWE Data Analyst - Analytics Automation Expert', 'AUTOMATOR persona for RWE Data Analyst: Data-driven analyst who leverages AI to automate data collection and cleaning workflows.', '25-35', 'Entry', 'BS Statistics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate data processing", "Accelerate analysis workflows", "Build AI expertise"]', '["Tool integration", "Data quality automation", "Learning new systems"]', '["Technical mastery", "Career advancement", "Efficiency gains"]', '["Manual data cleaning", "Repetitive QC tasks", "Slow report generation"]', TRUE, 0.85, 0.80, 0.35, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-ANALYST-ORC', 'Mia Rodriguez', 'MECE-Role-based', 'RWE Data Analyst - Strategic Data Integrator', 'ORCHESTRATOR persona for RWE Data Analyst: Tech-savvy analyst who designs integrated data pipelines for RWE generation.', '25-35', 'Entry', 'MS Data Science', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Design data integration workflows", "Coordinate cross-functional data", "Pioneer AI approaches"]', '["System complexity", "Cross-team coordination", "Data governance"]', '["Innovation leadership", "Process transformation", "Strategic impact"]', '["Disconnected systems", "Manual coordination", "Limited synthesis tools"]', TRUE, 0.85, 0.84, 0.70, 'ORCHESTRATOR', 'L2_ask_panel', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-ANALYST-LEA', 'Ethan Kim', 'MECE-Role-based', 'RWE Data Analyst - Growing Analyst', 'LEARNER persona for RWE Data Analyst: Recent graduate eager to learn RWE methodologies and data analysis techniques.', '22-30', 'Entry', 'BS Health Informatics', 'Real-World Evidence', 'Data Science & Analytics', 'local', '["Learn RWE fundamentals", "Understand healthcare data", "Build statistical skills"]', '["Data complexity", "Analysis uncertainty", "Learning curve"]', '["Career growth", "Skill development", "Mentorship"]', '["Overwhelming data", "Unclear approaches", "Fear of errors"]', TRUE, 0.85, 0.38, 0.28, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-ANALYST-SKE', 'Olivia Thompson', 'MECE-Role-based', 'RWE Data Analyst - Data Quality Guardian', 'SKEPTIC persona for RWE Data Analyst: Detail-oriented analyst who prioritizes data quality over AI efficiency.', '28-38', 'Entry', 'MS Biostatistics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Ensure data accuracy", "Protect evidence integrity", "Maintain audit trails"]', '["AI data errors", "Quality validation", "Compliance concerns"]', '["Data integrity", "Professional credibility", "Quality excellence"]', '["AI quality risks", "Automation pressure", "Accuracy concerns"]', TRUE, 0.85, 0.30, 0.65, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 2: EPIDEMIOLOGIST (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-EPI-AUT', 'Liam Patel', 'MECE-Role-based', 'Epidemiologist - Study Automation Expert', 'AUTOMATOR persona for Epidemiologist: Efficiency-focused epidemiologist who leverages AI to automate study design and analysis.', '30-40', 'Mid', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate analysis workflows", "Accelerate study design", "Scale research capacity"]', '["Workflow standardization", "Tool validation", "Quality assurance"]', '["Research efficiency", "Technical excellence", "Publication output"]', '["Manual statistical programming", "Slow literature reviews", "Repetitive protocols"]', TRUE, 0.85, 0.79, 0.42, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-EPI-ORC', 'Sophia Williams', 'MECE-Role-based', 'Epidemiologist - Strategic Research Architect', 'ORCHESTRATOR persona for Epidemiologist: Strategic epidemiologist who designs comprehensive research strategies.', '32-42', 'Mid', 'PhD Public Health', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build research platforms", "Create predictive analytics", "Transform research"]', '["Platform adoption", "Cross-functional alignment", "Resource constraints"]', '["Innovation leadership", "Scientific impact", "Industry influence"]', '["Disconnected data sources", "Manual synthesis", "Limited prediction"]', TRUE, 0.85, 0.86, 0.75, 'ORCHESTRATOR', 'L2_ask_panel', 'MECE Persona Generator'),
  
  ('PERSONA-DH-EPI-LEA', 'Jackson Brown', 'MECE-Role-based', 'Epidemiologist - Developing Researcher', 'LEARNER persona for Epidemiologist: Early-career epidemiologist building expertise in digital health epidemiology.', '28-35', 'Mid', 'MPH Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Master study design", "Learn DH outcome assessment", "Build population health expertise"]', '["Complex methodologies", "Design uncertainty", "Limited mentorship"]', '["Professional growth", "Research expertise", "Career advancement"]', '["Methodological complexity", "Study design decisions", "Sparse mentorship"]', TRUE, 0.85, 0.40, 0.38, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-EPI-SKE', 'Emma Davis', 'MECE-Role-based', 'Epidemiologist - Scientific Rigor Guardian', 'SKEPTIC persona for Epidemiologist: Experienced epidemiologist who prioritizes scientific rigor over AI efficiency.', '35-45', 'Mid', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain scientific standards", "Protect research integrity", "Ensure peer review acceptance"]', '["AI quality concerns", "Rigor vs speed", "Publication standards"]', '["Scientific excellence", "Professional credibility", "Research integrity"]', '["AI quality risks", "Speed pressure", "Rejection concerns"]', TRUE, 0.85, 0.28, 0.72, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 3: HEALTH ECONOMICS ANALYST (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-HEA-AUT', 'Aiden Garcia', 'MECE-Role-based', 'Health Economics Analyst - Modeling Automation Expert', 'AUTOMATOR persona for Health Economics Analyst: Tech-savvy economist who leverages AI to automate economic modeling.', '30-40', 'Mid', 'PhD Health Economics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate model development", "Accelerate CEA analyses", "Scale value demonstration"]', '["Model validation", "Tool integration", "Quality assurance"]', '["Technical efficiency", "Model excellence", "Career growth"]', '["Manual model building", "Slow sensitivity analyses", "Repetitive BIAs"]', TRUE, 0.85, 0.81, 0.44, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-HEA-ORC', 'Isabella Martinez', 'MECE-Role-based', 'Health Economics Analyst - Strategic Value Architect', 'ORCHESTRATOR persona for Health Economics Analyst: Strategic economist who designs comprehensive value demonstration strategies.', '32-42', 'Mid', 'PhD Economics', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build value demonstration platform", "Create predictive analytics", "Transform HEOR"]', '["Platform adoption", "Payer alignment", "Resource constraints"]', '["Strategic impact", "Innovation leadership", "Industry influence"]', '["Disconnected modeling tools", "Manual dossier development", "Limited prediction"]', TRUE, 0.85, 0.85, 0.76, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-HEA-LEA', 'Lucas Wilson', 'MECE-Role-based', 'Health Economics Analyst - Developing Economist', 'LEARNER persona for Health Economics Analyst: Early-career economist building expertise in digital health value demonstration.', '28-35', 'Mid', 'MS Health Economics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Master economic modeling", "Learn payer requirements", "Build CEA expertise"]', '["Complex modeling", "Payer uncertainty", "Limited HEOR training"]', '["Professional growth", "Domain expertise", "Career advancement"]', '["Modeling complexity", "Payer requirements", "Sparse training"]', TRUE, 0.85, 0.38, 0.36, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-HEA-SKE', 'Ava Anderson', 'MECE-Role-based', 'Health Economics Analyst - Model Integrity Guardian', 'SKEPTIC persona for Health Economics Analyst: Experienced economist who prioritizes model integrity over AI efficiency.', '35-45', 'Mid', 'PhD Health Economics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain analytical standards", "Protect model credibility", "Ensure HTA acceptance"]', '["AI accuracy concerns", "Model validation", "Payer scrutiny"]', '["Analytical excellence", "Professional credibility", "Payer trust"]', '["AI accuracy risks", "Speed pressure", "Payer rejection concerns"]', TRUE, 0.85, 0.26, 0.70, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 4: RWE DATA ENGINEER (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-RWE-ENG-AUT', 'Mason Taylor', 'MECE-Role-based', 'RWE Data Engineer - Pipeline Automation Expert', 'AUTOMATOR persona for RWE Data Engineer: Efficiency-focused engineer who leverages AI to automate data pipeline development.', '28-38', 'Mid', 'MS Computer Science', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate pipeline development", "Accelerate infrastructure", "Scale engineering capacity"]', '["Pipeline validation", "Tool integration", "Quality monitoring"]', '["Technical excellence", "Process efficiency", "Career growth"]', '["Manual debugging", "Slow data quality monitoring", "Repetitive setup"]', TRUE, 0.85, 0.85, 0.40, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-ENG-ORC', 'Charlotte Moore', 'MECE-Role-based', 'RWE Data Engineer - Platform Architecture Visionary', 'ORCHESTRATOR persona for RWE Data Engineer: Strategic engineer who designs enterprise RWE data platforms.', '30-40', 'Mid', 'MS Data Engineering', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build next-gen RWE platform", "Create self-healing infrastructure", "Transform data engineering"]', '["Platform adoption", "Legacy migration", "Stakeholder alignment"]', '["Innovation leadership", "Technical excellence", "Industry influence"]', '["Legacy infrastructure", "Manual optimization", "Disconnected systems"]', TRUE, 0.85, 0.88, 0.78, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-ENG-LEA', 'Henry Jackson', 'MECE-Role-based', 'RWE Data Engineer - Developing Engineer', 'LEARNER persona for RWE Data Engineer: Early-career engineer building expertise in healthcare data infrastructure.', '25-32', 'Mid', 'BS Computer Science', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Learn healthcare data engineering", "Understand RWE data standards", "Build cloud skills"]', '["Complex healthcare formats", "Data standards uncertainty", "Limited training"]', '["Professional growth", "Technical expertise", "Career advancement"]', '["Healthcare data complexity", "Standards uncertainty", "Sparse training"]', TRUE, 0.85, 0.42, 0.35, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-ENG-SKE', 'Amelia White', 'MECE-Role-based', 'RWE Data Engineer - Data Integrity Guardian', 'SKEPTIC persona for RWE Data Engineer: Experienced engineer who prioritizes data integrity over AI efficiency.', '32-42', 'Mid', 'MS Software Engineering', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain data integrity", "Protect system reliability", "Ensure compliance"]', '["AI data errors", "System reliability", "Compliance validation"]', '["Data integrity", "System reliability", "Professional credibility"]', '["AI error risks", "Automation pressure", "System failure concerns"]', TRUE, 0.85, 0.30, 0.72, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 5: RWE DATA SCIENTIST (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-RWE-DS-AUT', 'Benjamin Harris', 'MECE-Role-based', 'RWE Data Scientist - ML Pipeline Automator', 'AUTOMATOR persona for RWE Data Scientist: ML-focused scientist who leverages AI to automate model development.', '28-38', 'Mid', 'PhD Machine Learning', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate ML workflows", "Accelerate feature engineering", "Scale analytical capacity"]', '["Model validation", "Pipeline automation", "Quality assurance"]', '["Technical mastery", "ML excellence", "Career growth"]', '["Manual hyperparameter tuning", "Slow model validation", "Repetitive pipelines"]', TRUE, 0.85, 0.86, 0.45, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-DS-ORC', 'Scarlett Clark', 'MECE-Role-based', 'RWE Data Scientist - AI Research Architect', 'ORCHESTRATOR persona for RWE Data Scientist: Strategic scientist who designs comprehensive AI/ML strategies.', '30-40', 'Mid', 'PhD Data Science', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build next-gen RWE AI platform", "Create novel ML methodologies", "Transform RWE through AI"]', '["Platform adoption", "Methodology acceptance", "Resource constraints"]', '["Innovation leadership", "Scientific impact", "Industry influence"]', '["Limited advanced tools", "Manual methodology development", "Disconnected ML systems"]', TRUE, 0.85, 0.90, 0.82, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-DS-LEA', 'Alexander Lewis', 'MECE-Role-based', 'RWE Data Scientist - Developing Scientist', 'LEARNER persona for RWE Data Scientist: Early-career scientist building expertise in healthcare ML.', '26-33', 'Mid', 'MS Data Science', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Master healthcare ML", "Learn causal inference", "Build RWE domain expertise"]', '["Healthcare data challenges", "Method selection", "Limited training"]', '["Professional growth", "ML expertise", "Career advancement"]', '["Healthcare complexity", "Method uncertainty", "Sparse training"]', TRUE, 0.85, 0.45, 0.40, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-DS-SKE', 'Grace Walker', 'MECE-Role-based', 'RWE Data Scientist - Model Validity Guardian', 'SKEPTIC persona for RWE Data Scientist: Experienced scientist who prioritizes model validity over AI efficiency.', '32-42', 'Mid', 'PhD Biostatistics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain model validity", "Protect against bias", "Ensure reproducibility"]', '["AI bias concerns", "Model validation", "Reproducibility standards"]', '["Scientific rigor", "Model integrity", "Professional credibility"]', '["AI bias risks", "Unvalidated models", "Invalid conclusions"]', TRUE, 0.85, 0.32, 0.78, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 6: RWE DATA MANAGER (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-RWE-DM-AUT', 'Daniel Robinson', 'MECE-Role-based', 'RWE Data Manager - Governance Automation Expert', 'AUTOMATOR persona for RWE Data Manager: Efficiency-focused manager who leverages AI to automate data governance.', '35-45', 'Senior', 'MS Health Informatics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate governance workflows", "Accelerate quality monitoring", "Scale data management"]', '["Governance automation", "Quality validation", "Compliance tracking"]', '["Process efficiency", "Governance excellence", "Team enablement"]', '["Manual quality reporting", "Slow compliance documentation", "Repetitive reviews"]', TRUE, 0.85, 0.80, 0.44, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-DM-ORC', 'Victoria Young', 'MECE-Role-based', 'RWE Data Manager - Strategic Data Governance Architect', 'ORCHESTRATOR persona for RWE Data Manager: Strategic manager who designs enterprise data governance frameworks.', '38-48', 'Senior', 'PhD Information Science', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build governance platform", "Create predictive quality analytics", "Transform data management"]', '["Enterprise adoption", "Governance standardization", "Stakeholder alignment"]', '["Strategic impact", "Governance leadership", "Industry influence"]', '["Disconnected governance systems", "Manual lineage tracking", "Limited prediction"]', TRUE, 0.85, 0.84, 0.76, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-DM-LEA', 'Joseph King', 'MECE-Role-based', 'RWE Data Manager - Developing Manager', 'LEARNER persona for RWE Data Manager: Newly promoted manager building expertise in RWE data governance.', '32-40', 'Senior', 'MS Data Management', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Master governance frameworks", "Learn regulatory requirements", "Build team leadership"]', '["Governance complexity", "Compliance uncertainty", "Management transition"]', '["Professional growth", "Governance expertise", "Leadership development"]', '["Complex requirements", "Compliance uncertainty", "Limited training"]', TRUE, 0.85, 0.40, 0.38, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-DM-SKE', 'Natalie Wright', 'MECE-Role-based', 'RWE Data Manager - Data Stewardship Guardian', 'SKEPTIC persona for RWE Data Manager: Experienced manager who prioritizes data stewardship over AI efficiency.', '40-50', 'Senior', 'PhD Data Governance', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain governance standards", "Protect data privacy", "Ensure audit readiness"]', '["AI governance risks", "Privacy concerns", "Audit compliance"]', '["Governance excellence", "Privacy protection", "Professional credibility"]', '["AI governance concerns", "Automation pressure", "Compliance risks"]', TRUE, 0.85, 0.28, 0.74, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 7: RWE STUDY LEAD (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-RWE-LEAD-AUT', 'Christopher Lee', 'MECE-Role-based', 'RWE Study Lead - Study Execution Automator', 'AUTOMATOR persona for RWE Study Lead: Results-driven lead who leverages AI to optimize study execution.', '35-45', 'Senior', 'PhD Clinical Research', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate study management", "Optimize resource allocation", "Scale study delivery"]', '["Workflow automation", "Team adoption", "Quality assurance"]', '["Study efficiency", "Team leadership", "Delivery excellence"]', '["Manual status tracking", "Slow coordination", "Repetitive reporting"]', TRUE, 0.85, 0.82, 0.48, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-LEAD-ORC', 'Elizabeth Hall', 'MECE-Role-based', 'RWE Study Lead - Strategic Program Architect', 'ORCHESTRATOR persona for RWE Study Lead: Strategic lead who designs comprehensive RWE programs.', '38-48', 'Senior', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build AI-enabled program management", "Create predictive analytics", "Transform study operations"]', '["Program transformation", "Executive alignment", "Resource allocation"]', '["Strategic leadership", "Program excellence", "Industry influence"]', '["Limited planning tools", "Manual coordination", "Disconnected data"]', TRUE, 0.85, 0.87, 0.80, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-LEAD-LEA', 'Andrew Allen', 'MECE-Role-based', 'RWE Study Lead - Emerging Leader', 'LEARNER persona for RWE Study Lead: Newly promoted lead building leadership skills.', '32-40', 'Senior', 'MS Clinical Research', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Develop study leadership", "Learn program management", "Build stakeholder skills"]', '["Leadership transition", "People management", "Strategic thinking"]', '["Career growth", "Leadership development", "Team success"]', '["Analyst to leader transition", "Management uncertainty", "Limited training"]', TRUE, 0.85, 0.44, 0.42, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RWE-LEAD-SKE', 'Hannah Scott', 'MECE-Role-based', 'RWE Study Lead - Quality-First Leader', 'SKEPTIC persona for RWE Study Lead: Experienced lead who prioritizes study quality over AI efficiency.', '40-50', 'Senior', 'PhD Public Health', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain study quality", "Protect scientific integrity", "Ensure peer review acceptance"]', '["AI quality concerns", "Rigor vs speed", "Team development"]', '["Quality excellence", "Scientific integrity", "Professional standards"]', '["AI quality risks", "Speed pressure", "Study rejection concerns"]', TRUE, 0.85, 0.30, 0.75, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 8: SENIOR EPIDEMIOLOGIST (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-SR-EPI-AUT', 'Matthew Green', 'MECE-Role-based', 'Senior Epidemiologist - Advanced Research Automator', 'AUTOMATOR persona for Senior Epidemiologist: Expert who leverages advanced AI for complex research workflows.', '38-48', 'Senior', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate complex workflows", "Mentor on AI methods", "Scale expertise"]', '["Advanced automation", "Knowledge transfer", "Tool complexity"]', '["Research excellence", "Team enablement", "Process efficiency"]', '["Manual complex analysis", "Routine mentoring time", "Repetitive consultations"]', TRUE, 0.85, 0.84, 0.50, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SR-EPI-ORC', 'Abigail Adams', 'MECE-Role-based', 'Senior Epidemiologist - Research Strategy Architect', 'ORCHESTRATOR persona for Senior Epidemiologist: Strategic senior who designs comprehensive research strategies.', '40-50', 'Senior', 'PhD Public Health', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build innovative methodologies", "Create AI-enabled analytics", "Transform best practices"]', '["Methodology adoption", "Cross-functional alignment", "Resource constraints"]', '["Innovation leadership", "Scientific impact", "Industry influence"]', '["Limited complex tools", "Manual methodology development", "Disconnected approaches"]', TRUE, 0.85, 0.88, 0.82, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SR-EPI-LEA', 'Ryan Baker', 'MECE-Role-based', 'Senior Epidemiologist - Growing Expert', 'LEARNER persona for Senior Epidemiologist: Newly senior epidemiologist building advanced expertise.', '35-42', 'Senior', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Master advanced methodologies", "Develop regulatory skills", "Build mentoring capabilities"]', '["Senior transition", "Complex decisions", "Limited advanced training"]', '["Professional growth", "Subject matter expertise", "Leadership development"]', '["Senior responsibilities", "Methodology complexity", "Sparse resources"]', TRUE, 0.85, 0.46, 0.45, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SR-EPI-SKE', 'Samantha Nelson', 'MECE-Role-based', 'Senior Epidemiologist - Scientific Integrity Guardian', 'SKEPTIC persona for Senior Epidemiologist: Highly experienced epidemiologist who prioritizes scientific integrity.', '42-52', 'Senior', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain scientific standards", "Protect research integrity", "Ensure peer review acceptance"]', '["AI quality concerns", "Rigor vs speed", "Standards maintenance"]', '["Scientific excellence", "Research integrity", "Professional credibility"]', '["AI quality risks", "Speed pressure", "Research rejection concerns"]', TRUE, 0.85, 0.28, 0.80, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 9: SENIOR RWE DATA SCIENTIST (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-SR-RWE-DS-AUT', 'David Carter', 'MECE-Role-based', 'Senior RWE Data Scientist - Advanced ML Automator', 'AUTOMATOR persona for Senior RWE Data Scientist: Expert who leverages advanced AI/ML for complex workflows.', '38-48', 'Senior', 'PhD Machine Learning', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate complex ML workflows", "Mentor on advanced AI", "Scale ML expertise"]', '["Advanced automation", "Knowledge transfer", "Tool complexity"]', '["ML excellence", "Team enablement", "Process efficiency"]', '["Manual complex model development", "Routine mentoring time", "Repetitive consultations"]', TRUE, 0.85, 0.88, 0.52, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SR-RWE-DS-ORC', 'Emily Mitchell', 'MECE-Role-based', 'Senior RWE Data Scientist - AI Strategy Architect', 'ORCHESTRATOR persona for Senior RWE Data Scientist: Strategic senior who designs comprehensive AI/ML strategies.', '40-50', 'Senior', 'PhD Data Science', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build next-gen AI platform", "Create novel methodologies", "Transform RWE through AI"]', '["Platform adoption", "Methodology acceptance", "Resource constraints"]', '["Innovation leadership", "Scientific impact", "Industry influence"]', '["Limited advanced tools", "Manual methodology development", "Disconnected ML systems"]', TRUE, 0.85, 0.92, 0.85, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SR-RWE-DS-LEA', 'James Perez', 'MECE-Role-based', 'Senior RWE Data Scientist - Growing ML Expert', 'LEARNER persona for Senior RWE Data Scientist: Newly senior scientist building advanced expertise.', '35-42', 'Senior', 'PhD Data Science', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Master advanced ML", "Develop cross-functional leadership", "Build mentoring capabilities"]', '["Senior transition", "Complex strategic decisions", "Limited advanced training"]', '["Professional growth", "ML expertise", "Leadership development"]', '["Senior responsibilities", "Strategy complexity", "Sparse resources"]', TRUE, 0.85, 0.50, 0.48, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SR-RWE-DS-SKE', 'Ashley Roberts', 'MECE-Role-based', 'Senior RWE Data Scientist - Model Validity Guardian', 'SKEPTIC persona for Senior RWE Data Scientist: Highly experienced scientist who prioritizes model validity.', '42-52', 'Senior', 'PhD Biostatistics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Maintain model validity", "Protect against bias", "Ensure reproducibility"]', '["AI bias concerns", "Model validation", "Reproducibility standards"]', '["Scientific rigor", "Model integrity", "Professional credibility"]', '["AI bias risks", "Unvalidated models", "Invalid conclusions"]', TRUE, 0.85, 0.35, 0.82, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 10: DIRECTOR OF REAL-WORLD EVIDENCE (Director) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-DIR-RWE-AUT', 'Kevin Turner', 'MECE-Role-based', 'Director of RWE - Operational Excellence Leader', 'AUTOMATOR persona for Director of RWE: Results-driven director who leverages AI for department operations.', '42-52', 'Director', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Automate department reporting", "Optimize resource allocation", "Scale RWE capacity"]', '["Department transformation", "Executive reporting", "Resource optimization"]', '["Operational excellence", "Leadership impact", "Organizational efficiency"]', '["Manual executive reporting", "Resource planning time", "Cross-functional coordination"]', TRUE, 0.85, 0.82, 0.52, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-DIR-RWE-ORC', 'Jessica Phillips', 'MECE-Role-based', 'Director of RWE - Transformation Visionary', 'ORCHESTRATOR persona for Director of RWE: Visionary director who designs AI-enabled RWE capabilities.', '45-55', 'Director', 'MD/PhD', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Transform RWE through AI", "Build industry-leading capabilities", "Create competitive advantage"]', '["Organizational transformation", "Investment justification", "Change management"]', '["Strategic impact", "Innovation leadership", "Industry influence"]', '["Slow transformation", "Limited AI investment", "Manual strategic planning"]', TRUE, 0.85, 0.90, 0.86, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-DIR-RWE-LEA', 'Brandon Campbell', 'MECE-Role-based', 'Director of RWE - Emerging Executive', 'LEARNER persona for Director of RWE: Newly appointed director building executive leadership skills.', '40-48', 'Director', 'PhD Health Economics', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Develop executive leadership", "Learn department management", "Build C-suite relationships"]', '["Executive transition", "Budget management", "Strategic planning"]', '["Leadership growth", "Executive presence", "Organizational impact"]', '["Executive responsibilities", "Complex budgets", "Limited executive training"]', TRUE, 0.85, 0.48, 0.50, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-DIR-RWE-SKE', 'Rachel Parker', 'MECE-Role-based', 'Director of RWE - Risk-Conscious Executive', 'SKEPTIC persona for Director of RWE: Experienced director who prioritizes risk management.', '48-58', 'Director', 'MD/MBA', 'Real-World Evidence', 'Data Science & Analytics', 'regional', '["Protect from AI risks", "Maintain scientific credibility", "Ensure department credibility"]', '["AI governance", "Risk assessment", "Stakeholder concerns"]', '["Risk mitigation", "Scientific integrity", "Professional reputation"]', '["Unproven AI vendors", "Department-level AI risks", "Governance gaps"]', TRUE, 0.85, 0.30, 0.84, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- ROLE 11: VP OF REAL-WORLD EVIDENCE (Executive) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-VP-RWE-AUT', 'Nicholas Evans', 'MECE-Role-based', 'VP of RWE - Executive Efficiency Champion', 'AUTOMATOR persona for VP of RWE: Executive who leverages AI for organizational efficiency at scale.', '48-58', 'Executive', 'MD/PhD', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Automate executive dashboards", "Optimize portfolio allocation", "Enable strategic time"]', '["Enterprise automation", "Executive reporting", "Portfolio optimization"]', '["Organizational efficiency", "Executive impact", "Strategic focus"]', '["Manual executive reporting", "Board presentation time", "Slow information flow"]', TRUE, 0.85, 0.80, 0.54, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-VP-RWE-ORC', 'Lauren Edwards', 'MECE-Role-based', 'VP of RWE - Enterprise Transformation Leader', 'ORCHESTRATOR persona for VP of RWE: Visionary executive who transforms RWE through AI.', '50-60', 'Executive', 'MD/MBA', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Transform through enterprise AI", "Create industry-leading capabilities", "Position for next decade"]', '["Enterprise transformation", "Board alignment", "Investment at scale"]', '["Industry leadership", "Enterprise impact", "Legacy creation"]', '["Slow enterprise transformation", "Limited AI investment", "Manual strategy development"]', TRUE, 0.85, 0.92, 0.90, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-VP-RWE-LEA', 'Tyler Collins', 'MECE-Role-based', 'VP of RWE - Newly Appointed Executive', 'LEARNER persona for VP of RWE: Newly appointed VP building C-suite leadership skills.', '45-52', 'Executive', 'PhD Epidemiology', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Build C-suite leadership", "Learn enterprise management", "Establish board credibility"]', '["C-suite transition", "Enterprise budget management", "Board relationships"]', '["Executive growth", "Enterprise leadership", "Industry influence"]', '["C-suite responsibilities", "Complex enterprise budgets", "Limited peer network"]', TRUE, 0.85, 0.45, 0.52, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-VP-RWE-SKE', 'Michelle Stewart', 'MECE-Role-based', 'VP of RWE - Enterprise Risk Guardian', 'SKEPTIC persona for VP of RWE: Seasoned executive who prioritizes enterprise risk management.', '52-62', 'Executive', 'MD/JD', 'Real-World Evidence', 'Data Science & Analytics', 'global', '["Protect enterprise from AI risks", "Maintain scientific credibility", "Ensure organizational credibility"]', '["Enterprise AI governance", "Board risk communication", "Organizational protection"]', '["Enterprise protection", "Scientific integrity", "Organizational credibility"]', '["Unproven enterprise AI", "Organization-wide AI risks", "Enterprise governance gaps"]', TRUE, 0.85, 0.28, 0.88, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name, description = EXCLUDED.description, goals = EXCLUDED.goals, challenges = EXCLUDED.challenges, motivations = EXCLUDED.motivations, frustrations = EXCLUDED.frustrations, ai_readiness_score = EXCLUDED.ai_readiness_score, work_complexity_score = EXCLUDED.work_complexity_score, derived_archetype = EXCLUDED.derived_archetype, preferred_service_layer = EXCLUDED.preferred_service_layer, updated_at = NOW();

-- ============================================================================
-- LINK PERSONAS TO TENANT AND ROLES
-- ============================================================================

-- Set tenant_id for all RWE personas
UPDATE personas
SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244',
    updated_at = NOW()
WHERE unique_id LIKE 'PERSONA-DH-RWE%'
   OR unique_id LIKE 'PERSONA-DH-EPI%'
   OR unique_id LIKE 'PERSONA-DH-HEA%'
   OR unique_id LIKE 'PERSONA-DH-SR-EPI%'
   OR unique_id LIKE 'PERSONA-DH-SR-RWE%'
   OR unique_id LIKE 'PERSONA-DH-DIR-RWE%'
   OR unique_id LIKE 'PERSONA-DH-VP-RWE%';

-- Link personas to their source roles (if roles exist)
UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'rwe-data-analyst-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-RWE-ANALYST%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'epidemiologist-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-EPI-%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'health-economics-analyst-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-HEA-%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'rwe-data-engineer-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-RWE-ENG%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'rwe-data-scientist-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-RWE-DS-%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'rwe-data-manager-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-RWE-DM-%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'rwe-study-lead-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-RWE-LEAD%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'senior-epidemiologist-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-SR-EPI%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'senior-rwe-data-scientist-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-SR-RWE-DS%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'director-rwe-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-DIR-RWE%';

UPDATE personas p SET source_role_id = r.id FROM org_roles r WHERE r.slug = 'vp-rwe-dh' AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244' AND p.unique_id LIKE 'PERSONA-DH-VP-RWE%';

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  'Real-World Evidence Personas Created' as status,
  COUNT(*) as total_personas
FROM personas 
WHERE unique_id LIKE 'PERSONA-DH-RWE%'
   OR unique_id LIKE 'PERSONA-DH-EPI%'
   OR unique_id LIKE 'PERSONA-DH-HEA%'
   OR unique_id LIKE 'PERSONA-DH-SR-EPI%'
   OR unique_id LIKE 'PERSONA-DH-SR-RWE%'
   OR unique_id LIKE 'PERSONA-DH-DIR-RWE%'
   OR unique_id LIKE 'PERSONA-DH-VP-RWE%';

-- ============================================================================
-- MIGRATION 030: DIGITAL HEALTH CLINICAL VALIDATION PERSONAS
-- Version: 1.0.0 | Date: 2025-12-01
-- Purpose: Create 4 MECE personas for each Clinical Validation role (9 roles)
-- Total: 36 personas (9 roles × 4 archetypes)
-- ============================================================================

BEGIN;

-- ============================================================================
-- ROLE 1: CLINICAL VALIDATION ASSOCIATE (Entry) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-CV-ASSOC-AUT', 'Alex Chen', 'MECE-Role-based', 'Clinical Validation Associate - Automation Champion', 'AUTOMATOR persona for Clinical Validation Associate: Tech-savvy entry-level professional who leverages AI to accelerate data collection and documentation.', '25-35', 'Entry', 'BS Health Sciences', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate data entry tasks", "Accelerate study timelines", "Build AI expertise"]', '["Learning new AI tools", "Balancing speed with accuracy", "Integration complexity"]', '["Career advancement", "Technology innovation", "Efficiency gains"]', '["Manual data collection", "Repetitive documentation", "Slow review cycles"]', TRUE, 0.85, 0.78, 0.32, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CV-ASSOC-ORC', 'Jordan Rivera', 'MECE-Role-based', 'Clinical Validation Associate - Strategic Integrator', 'ORCHESTRATOR persona for Clinical Validation Associate: Tech-savvy associate who coordinates complex data flows and multi-system integrations.', '25-35', 'Entry', 'MS Biomedical Engineering', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Design data pipelines", "Coordinate cross-functional activities", "Pioneer AI approaches"]', '["System integration complexity", "Cross-team coordination", "Data silos"]', '["Innovation leadership", "Process transformation", "Strategic impact"]', '["Disconnected systems", "Manual coordination", "Limited AI tools"]', TRUE, 0.85, 0.82, 0.68, 'ORCHESTRATOR', 'L2_ask_panel', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CV-ASSOC-LEA', 'Taylor Kim', 'MECE-Role-based', 'Clinical Validation Associate - AI Explorer', 'LEARNER persona for Clinical Validation Associate: Recent graduate eager to learn validation methodologies and regulatory requirements.', '22-30', 'Entry', 'BS Biology', 'Clinical Validation', 'Regulatory & Quality', 'local', '["Learn validation fundamentals", "Understand regulatory requirements", "Build confidence"]', '["Learning curve anxiety", "Information overload", "Fear of errors"]', '["Career growth", "Skill development", "Mentorship"]', '["Complex terminology", "Unclear standards", "Limited guidance"]', TRUE, 0.85, 0.35, 0.25, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CV-ASSOC-SKE', 'Morgan Walsh', 'MECE-Role-based', 'Clinical Validation Associate - Compliance Guardian', 'SKEPTIC persona for Clinical Validation Associate: Detail-oriented professional who prioritizes compliance accuracy over AI efficiency.', '28-38', 'Entry', 'BS Regulatory Science', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Ensure compliance accuracy", "Protect study integrity", "Maintain audit readiness"]', '["AI reliability concerns", "Compliance risks", "Validation burden"]', '["Quality assurance", "Risk mitigation", "Professional credibility"]', '["Unvalidated AI tools", "Pressure to automate", "Audit concerns"]', TRUE, 0.85, 0.28, 0.65, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 2: CLINICAL DATA MANAGER (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-CDM-AUT', 'Casey Martinez', 'MECE-Role-based', 'Clinical Data Manager - Pipeline Automator', 'AUTOMATOR persona for Clinical Data Manager: Tech-savvy data manager who leverages AI for automated data cleaning and quality checks.', '30-40', 'Mid', 'MS Data Science', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate data cleaning", "Reduce manual QC burden", "Scale across studies"]', '["Data integration complexity", "Legacy system constraints", "Quality validation"]', '["Process efficiency", "Technical excellence", "Team enablement"]', '["Manual reconciliation", "Repetitive QC tasks", "Slow data locks"]', TRUE, 0.85, 0.80, 0.40, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CDM-ORC', 'Riley Thompson', 'MECE-Role-based', 'Clinical Data Manager - Strategic Data Architect', 'ORCHESTRATOR persona for Clinical Data Manager: Strategic data manager who designs enterprise data architectures and AI-enabled platforms.', '32-42', 'Mid', 'MS Health Informatics', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build next-gen data platforms", "Create predictive analytics", "Transform data management"]', '["Enterprise transformation", "Stakeholder alignment", "Technology adoption"]', '["Innovation leadership", "Strategic impact", "Industry recognition"]', '["Legacy systems", "Limited AI capabilities", "Manual integration"]', TRUE, 0.85, 0.85, 0.75, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CDM-LEA', 'Jamie Lee', 'MECE-Role-based', 'Clinical Data Manager - Developing Professional', 'LEARNER persona for Clinical Data Manager: Early-career data manager transitioning to digital health, learning specialized requirements.', '28-35', 'Mid', 'BS Statistics', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Learn DH data standards", "Understand CDISC requirements", "Build RWD expertise"]', '["New data types", "Unfamiliar regulations", "Limited training"]', '["Professional development", "Domain expertise", "Career progression"]', '["Complex device data", "Regulatory uncertainty", "Sparse resources"]', TRUE, 0.85, 0.38, 0.35, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CDM-SKE', 'Drew Parker', 'MECE-Role-based', 'Clinical Data Manager - Data Integrity Guardian', 'SKEPTIC persona for Clinical Data Manager: Experienced data manager who prioritizes data integrity over AI efficiency.', '35-45', 'Mid', 'MS Biostatistics', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Maintain data quality", "Protect compliance", "Ensure audit trails"]', '["AI data corruption risks", "Validation requirements", "Regulatory scrutiny"]', '["Data integrity", "Professional reputation", "Compliance excellence"]', '["AI quality concerns", "Automation pressure", "Audit risks"]', TRUE, 0.85, 0.25, 0.70, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 3: CLINICAL VALIDATION SPECIALIST (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-CVS-AUT', 'Avery Johnson', 'MECE-Role-based', 'Clinical Validation Specialist - Workflow Expert', 'AUTOMATOR persona for Clinical Validation Specialist: Efficiency-focused specialist who leverages AI to accelerate study design and analysis.', '30-40', 'Mid', 'MS Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate report generation", "Accelerate statistical analysis", "Scale validation capacity"]', '["Workflow standardization", "Tool integration", "Quality assurance"]', '["Efficiency gains", "Technical mastery", "Process innovation"]', '["Manual report writing", "Slow statistical programming", "Repetitive protocols"]', TRUE, 0.85, 0.79, 0.42, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CVS-ORC', 'Quinn Davis', 'MECE-Role-based', 'Clinical Validation Specialist - Evidence Architect', 'ORCHESTRATOR persona for Clinical Validation Specialist: Strategic specialist who designs comprehensive evidence generation strategies.', '32-42', 'Mid', 'PhD Biomedical Sciences', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build evidence platforms", "Create predictive analytics", "Transform validation"]', '["Cross-functional alignment", "Platform adoption", "Resource constraints"]', '["Strategic leadership", "Innovation impact", "Industry influence"]', '["Disconnected data sources", "Manual synthesis", "Limited prediction"]', TRUE, 0.85, 0.84, 0.72, 'ORCHESTRATOR', 'L2_ask_panel', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CVS-LEA', 'Skyler Brown', 'MECE-Role-based', 'Clinical Validation Specialist - Growing Expert', 'LEARNER persona for Clinical Validation Specialist: Developing specialist building expertise in clinical evidence generation.', '28-35', 'Mid', 'MS Regulatory Affairs', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Master validation methodologies", "Learn submission requirements", "Build study design expertise"]', '["Complex guidance interpretation", "Design uncertainty", "Limited mentorship"]', '["Professional growth", "Subject matter expertise", "Career advancement"]', '["Regulatory complexity", "Study design decisions", "Sparse mentorship"]', TRUE, 0.85, 0.40, 0.38, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CVS-SKE', 'Reese Miller', 'MECE-Role-based', 'Clinical Validation Specialist - Evidence Integrity Guardian', 'SKEPTIC persona for Clinical Validation Specialist: Experienced specialist who prioritizes scientific rigor over AI efficiency.', '35-45', 'Mid', 'PhD Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Maintain scientific standards", "Protect evidence integrity", "Ensure regulatory acceptance"]', '["AI quality concerns", "Scientific rigor balance", "Regulatory scrutiny"]', '["Scientific excellence", "Professional credibility", "Patient safety"]', '["AI evidence quality", "Speed vs rigor pressure", "Rejection risks"]', TRUE, 0.85, 0.30, 0.75, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 4: REGULATORY AFFAIRS COORDINATOR (Mid) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-RAC-AUT', 'Dakota Wilson', 'MECE-Role-based', 'Regulatory Affairs Coordinator - Submission Automator', 'AUTOMATOR persona for Regulatory Affairs Coordinator: Tech-savvy coordinator who leverages AI to accelerate submission preparation.', '28-38', 'Mid', 'MS Regulatory Science', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate submission prep", "Accelerate compliance tracking", "Scale regulatory support"]', '["Document assembly complexity", "Compliance tracking", "Multi-market coordination"]', '["Process efficiency", "Technical expertise", "Career growth"]', '["Manual formatting", "Slow compliance reviews", "Repetitive correspondence"]', TRUE, 0.85, 0.77, 0.38, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RAC-ORC', 'Hayden Garcia', 'MECE-Role-based', 'Regulatory Affairs Coordinator - Compliance Architect', 'ORCHESTRATOR persona for Regulatory Affairs Coordinator: Strategic coordinator who designs integrated compliance systems.', '30-40', 'Mid', 'JD Health Law', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build regulatory intelligence platform", "Create predictive compliance", "Transform operations"]', '["System integration", "Global harmonization", "Stakeholder alignment"]', '["Strategic impact", "Innovation leadership", "Industry influence"]', '["Disconnected tracking systems", "Manual monitoring", "Limited prediction"]', TRUE, 0.85, 0.83, 0.70, 'ORCHESTRATOR', 'L2_ask_panel', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RAC-LEA', 'Finley Adams', 'MECE-Role-based', 'Regulatory Affairs Coordinator - Developing Professional', 'LEARNER persona for Regulatory Affairs Coordinator: Early-career coordinator learning digital health regulatory requirements.', '25-32', 'Mid', 'BS Life Sciences', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Learn DH regulatory pathways", "Understand global submissions", "Build documentation skills"]', '["Evolving landscape", "Submission uncertainty", "Limited DH training"]', '["Professional development", "Regulatory expertise", "Career progression"]', '["Complex regulations", "Unclear requirements", "Sparse training"]', TRUE, 0.85, 0.36, 0.32, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-RAC-SKE', 'Cameron Scott', 'MECE-Role-based', 'Regulatory Affairs Coordinator - Compliance Guardian', 'SKEPTIC persona for Regulatory Affairs Coordinator: Detail-oriented coordinator who prioritizes compliance accuracy.', '32-42', 'Mid', 'MS Regulatory Affairs', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Ensure submission accuracy", "Protect against deficiencies", "Maintain audit readiness"]', '["AI submission errors", "Compliance validation", "Regulatory scrutiny"]', '["Compliance excellence", "Professional reputation", "Risk mitigation"]', '["AI error risks", "Automation pressure", "Rejection concerns"]', TRUE, 0.85, 0.26, 0.68, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 5: CLINICAL VALIDATION LEAD (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-CVL-AUT', 'Blake Anderson', 'MECE-Role-based', 'Clinical Validation Lead - Team Efficiency Champion', 'AUTOMATOR persona for Clinical Validation Lead: Results-driven lead who leverages AI to optimize team productivity.', '35-45', 'Senior', 'MS Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate project management", "Optimize resource allocation", "Scale validation capacity"]', '["Team adoption", "Process standardization", "Tool integration"]', '["Team efficiency", "Leadership excellence", "Operational impact"]', '["Manual status tracking", "Slow coordination", "Repetitive reporting"]', TRUE, 0.85, 0.81, 0.45, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CVL-ORC', 'Sage Robinson', 'MECE-Role-based', 'Clinical Validation Lead - Strategic Program Architect', 'ORCHESTRATOR persona for Clinical Validation Lead: Strategic lead who designs comprehensive validation programs.', '38-48', 'Senior', 'PhD Regulatory Science', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build AI-enabled COE", "Create predictive analytics", "Transform operations"]', '["Organizational change", "Executive alignment", "Resource allocation"]', '["Strategic leadership", "Innovation impact", "Industry recognition"]', '["Limited planning tools", "Manual coordination", "Disconnected data"]', TRUE, 0.85, 0.86, 0.78, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CVL-LEA', 'River Campbell', 'MECE-Role-based', 'Clinical Validation Lead - Emerging Team Leader', 'LEARNER persona for Clinical Validation Lead: Newly promoted lead building leadership skills.', '32-40', 'Senior', 'MS Health Sciences', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Develop leadership capabilities", "Learn program management", "Build stakeholder skills"]', '["Leadership transition", "People management", "Strategic thinking"]', '["Career growth", "Leadership development", "Team success"]', '["Specialist to leader transition", "Management uncertainty", "Limited training"]', TRUE, 0.85, 0.42, 0.40, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-CVL-SKE', 'Phoenix Turner', 'MECE-Role-based', 'Clinical Validation Lead - Quality-First Leader', 'SKEPTIC persona for Clinical Validation Lead: Experienced lead who prioritizes study quality over AI efficiency.', '40-50', 'Senior', 'PhD Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Maintain quality standards", "Develop team expertise", "Protect from AI over-reliance"]', '["AI deskilling risks", "Quality vs speed balance", "Team development"]', '["Quality excellence", "Team development", "Professional standards"]', '["AI deskilling concerns", "Automation pressure", "Quality risks"]', TRUE, 0.85, 0.28, 0.72, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 6: QUALITY ASSURANCE MANAGER (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-QAM-AUT', 'Emerson Hayes', 'MECE-Role-based', 'Quality Assurance Manager - Compliance Automator', 'AUTOMATOR persona for Quality Assurance Manager: Tech-savvy QA manager who leverages AI to automate quality processes.', '35-45', 'Senior', 'MS Quality Management', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate quality monitoring", "Accelerate audit prep", "Scale QA coverage"]', '["System validation", "Compliance automation", "Audit readiness"]', '["Process efficiency", "Quality excellence", "Team enablement"]', '["Manual CAPA tracking", "Slow audit prep", "Repetitive documentation"]', TRUE, 0.85, 0.79, 0.44, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-QAM-ORC', 'Rowan Mitchell', 'MECE-Role-based', 'Quality Assurance Manager - Strategic Quality Architect', 'ORCHESTRATOR persona for Quality Assurance Manager: Strategic QA manager who designs enterprise quality systems.', '38-48', 'Senior', 'PhD Quality Engineering', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build predictive quality analytics", "Create AI compliance monitoring", "Transform quality operations"]', '["Enterprise transformation", "Predictive modeling", "Stakeholder buy-in"]', '["Strategic impact", "Innovation leadership", "Industry influence"]', '["Reactive QM approach", "Limited prediction", "Manual cross-study analysis"]', TRUE, 0.85, 0.85, 0.76, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-QAM-LEA', 'Kendall Brooks', 'MECE-Role-based', 'Quality Assurance Manager - Developing QA Leader', 'LEARNER persona for Quality Assurance Manager: Newly promoted QA manager learning to build quality systems.', '32-40', 'Senior', 'MS Regulatory Science', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Master GxP requirements", "Build QMS expertise", "Develop audit skills"]', '["Complex QA requirements", "QMS design uncertainty", "Limited DH QA training"]', '["Professional development", "QA expertise", "Team leadership"]', '["Regulatory complexity", "QMS uncertainty", "Sparse training"]', TRUE, 0.85, 0.38, 0.36, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-QAM-SKE', 'Ellis Morgan', 'MECE-Role-based', 'Quality Assurance Manager - Compliance Integrity Guardian', 'SKEPTIC persona for Quality Assurance Manager: Experienced QA manager who prioritizes compliance integrity.', '40-50', 'Senior', 'PhD Quality Assurance', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Maintain compliance standards", "Protect against findings", "Ensure audit trail integrity"]', '["AI compliance risks", "Validation burden", "Regulatory scrutiny"]', '["Compliance excellence", "Professional reputation", "Risk mitigation"]', '["AI compliance concerns", "Automation pressure", "Audit finding risks"]', TRUE, 0.85, 0.24, 0.74, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 7: SENIOR CLINICAL VALIDATION SPECIALIST (Senior) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-SCVS-AUT', 'Harper Reed', 'MECE-Role-based', 'Senior Clinical Validation Specialist - Advanced Automator', 'AUTOMATOR persona for Senior Clinical Validation Specialist: Expert who leverages advanced AI for complex workflows.', '38-48', 'Senior', 'PhD Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate complex workflows", "Mentor on AI processes", "Scale expertise"]', '["Advanced automation", "Knowledge transfer", "Tool complexity"]', '["Technical mastery", "Team enablement", "Process excellence"]', '["Manual complex analysis", "Routine mentoring time", "Repetitive consultations"]', TRUE, 0.85, 0.82, 0.48, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SCVS-ORC', 'Peyton Clark', 'MECE-Role-based', 'Senior Clinical Validation Specialist - Evidence Strategy Architect', 'ORCHESTRATOR persona for Senior Clinical Validation Specialist: Strategic specialist who designs evidence strategies.', '40-50', 'Senior', 'PhD Biomedical Sciences', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build innovative methodologies", "Create AI-enabled evidence generation", "Transform best practices"]', '["Methodology adoption", "Cross-functional alignment", "Resource constraints"]', '["Innovation leadership", "Industry influence", "Scientific excellence"]', '["Limited synthesis tools", "Manual methodology development", "Disconnected approaches"]', TRUE, 0.85, 0.87, 0.80, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SCVS-LEA', 'Sawyer Price', 'MECE-Role-based', 'Senior Clinical Validation Specialist - Growing Expert', 'LEARNER persona for Senior Clinical Validation Specialist: Newly senior specialist building advanced expertise.', '35-42', 'Senior', 'MS Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Master advanced methodologies", "Develop regulatory interaction skills", "Build mentoring capabilities"]', '["Senior transition", "Complex decisions", "Limited advanced training"]', '["Professional growth", "Subject matter expertise", "Leadership development"]', '["Senior responsibilities", "Strategy complexity", "Sparse advanced resources"]', TRUE, 0.85, 0.44, 0.42, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-SCVS-SKE', 'Lennox Gray', 'MECE-Role-based', 'Senior Clinical Validation Specialist - Scientific Rigor Guardian', 'SKEPTIC persona for Senior Clinical Validation Specialist: Highly experienced specialist who prioritizes scientific rigor.', '42-52', 'Senior', 'PhD Clinical Sciences', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Maintain scientific standards", "Protect evidence integrity", "Ensure regulatory acceptance"]', '["AI quality concerns", "Rigor vs speed balance", "Standards maintenance"]', '["Scientific excellence", "Professional credibility", "Patient safety"]', '["AI quality risks", "Speed pressure", "Regulatory concerns"]', TRUE, 0.85, 0.26, 0.78, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 8: DIRECTOR OF CLINICAL VALIDATION (Director) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-DIRCV-AUT', 'Spencer Hughes', 'MECE-Role-based', 'Director of Clinical Validation - Operational Excellence Leader', 'AUTOMATOR persona for Director of Clinical Validation: Results-driven director who leverages AI for department operations.', '42-52', 'Director', 'PhD Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Automate department reporting", "Optimize resource allocation", "Scale validation capacity"]', '["Department transformation", "Executive reporting", "Resource optimization"]', '["Operational excellence", "Leadership impact", "Organizational efficiency"]', '["Manual executive reporting", "Resource planning time", "Cross-functional coordination"]', TRUE, 0.85, 0.80, 0.50, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-DIRCV-ORC', 'Ainsley Foster', 'MECE-Role-based', 'Director of Clinical Validation - Transformation Visionary', 'ORCHESTRATOR persona for Director of Clinical Validation: Visionary director who designs AI-enabled capabilities.', '45-55', 'Director', 'MD/PhD', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Transform validation through AI", "Build industry-leading capabilities", "Create competitive advantage"]', '["Organizational transformation", "Investment justification", "Change management"]', '["Strategic impact", "Innovation leadership", "Industry influence"]', '["Slow transformation", "Limited AI investment", "Manual strategic planning"]', TRUE, 0.85, 0.88, 0.85, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-DIRCV-LEA', 'Elliot Barnes', 'MECE-Role-based', 'Director of Clinical Validation - Emerging Executive', 'LEARNER persona for Director of Clinical Validation: Newly appointed director building executive leadership skills.', '40-48', 'Director', 'PhD Regulatory Science', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Develop executive leadership", "Learn department management", "Build C-suite relationships"]', '["Executive transition", "Budget management", "Strategic planning"]', '["Leadership growth", "Executive presence", "Organizational impact"]', '["Executive responsibilities", "Complex budgets", "Limited executive training"]', TRUE, 0.85, 0.45, 0.48, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-DIRCV-SKE', 'Marlowe Sullivan', 'MECE-Role-based', 'Director of Clinical Validation - Risk-Conscious Executive', 'SKEPTIC persona for Director of Clinical Validation: Experienced director who prioritizes risk management.', '48-58', 'Director', 'MD/MBA', 'Clinical Validation', 'Regulatory & Quality', 'regional', '["Protect from AI risks", "Maintain regulatory compliance", "Ensure department credibility"]', '["AI governance", "Risk assessment", "Stakeholder concerns"]', '["Risk mitigation", "Organizational protection", "Professional reputation"]', '["Unproven AI vendors", "Department-level AI risks", "Governance gaps"]', TRUE, 0.85, 0.28, 0.82, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- ROLE 9: VP OF CLINICAL VALIDATION (Executive) - 4 PERSONAS
-- ============================================================================

INSERT INTO personas (unique_id, persona_name, persona_type, title, description, age_range, experience_level, education_level, department, function_area, geographic_scope, goals, challenges, motivations, frustrations, is_active, data_quality_score, ai_readiness_score, work_complexity_score, derived_archetype, preferred_service_layer, created_by)
VALUES
  ('PERSONA-DH-VPCV-AUT', 'Chandler West', 'MECE-Role-based', 'VP of Clinical Validation - Executive Efficiency Champion', 'AUTOMATOR persona for VP of Clinical Validation: Executive who leverages AI for organizational efficiency at scale.', '48-58', 'Executive', 'MD/PhD', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Automate executive dashboards", "Optimize portfolio allocation", "Enable strategic time"]', '["Enterprise automation", "Executive reporting", "Portfolio optimization"]', '["Organizational efficiency", "Executive impact", "Strategic focus"]', '["Manual executive reporting", "Board presentation time", "Slow information flow"]', TRUE, 0.85, 0.78, 0.52, 'AUTOMATOR', 'L3_workflow', 'MECE Persona Generator'),
  
  ('PERSONA-DH-VPCV-ORC', 'Monroe Richardson', 'MECE-Role-based', 'VP of Clinical Validation - Enterprise Transformation Leader', 'ORCHESTRATOR persona for VP of Clinical Validation: Visionary executive who transforms validation through AI.', '50-60', 'Executive', 'MD/MBA', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Transform through enterprise AI", "Create industry-leading capabilities", "Position for next decade"]', '["Enterprise transformation", "Board alignment", "Investment at scale"]', '["Industry leadership", "Enterprise impact", "Legacy creation"]', '["Slow enterprise transformation", "Limited AI investment", "Manual strategy development"]', TRUE, 0.85, 0.90, 0.88, 'ORCHESTRATOR', 'L4_solution_builder', 'MECE Persona Generator'),
  
  ('PERSONA-DH-VPCV-LEA', 'Remy Crawford', 'MECE-Role-based', 'VP of Clinical Validation - Newly Appointed Executive', 'LEARNER persona for VP of Clinical Validation: Newly appointed VP building C-suite leadership skills.', '45-52', 'Executive', 'PhD Clinical Research', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Build C-suite leadership", "Learn enterprise management", "Establish board credibility"]', '["C-suite transition", "Enterprise budget management", "Board relationships"]', '["Executive growth", "Enterprise leadership", "Industry influence"]', '["C-suite responsibilities", "Complex enterprise budgets", "Limited peer network"]', TRUE, 0.85, 0.42, 0.50, 'LEARNER', 'L1_ask_expert', 'MECE Persona Generator'),
  
  ('PERSONA-DH-VPCV-SKE', 'Blair Hoffman', 'MECE-Role-based', 'VP of Clinical Validation - Enterprise Risk Guardian', 'SKEPTIC persona for VP of Clinical Validation: Seasoned executive who prioritizes enterprise risk management.', '52-62', 'Executive', 'MD/JD', 'Clinical Validation', 'Regulatory & Quality', 'global', '["Protect enterprise from AI risks", "Maintain regulatory compliance", "Ensure organizational credibility"]', '["Enterprise AI governance", "Board risk communication", "Organizational protection"]', '["Enterprise protection", "Risk excellence", "Organizational credibility"]', '["Unproven enterprise AI", "Organization-wide AI risks", "Enterprise governance gaps"]', TRUE, 0.85, 0.25, 0.85, 'SKEPTIC', 'L1_ask_expert', 'MECE Persona Generator')
ON CONFLICT (unique_id) DO UPDATE SET
  persona_name = EXCLUDED.persona_name,
  description = EXCLUDED.description,
  goals = EXCLUDED.goals,
  challenges = EXCLUDED.challenges,
  motivations = EXCLUDED.motivations,
  frustrations = EXCLUDED.frustrations,
  ai_readiness_score = EXCLUDED.ai_readiness_score,
  work_complexity_score = EXCLUDED.work_complexity_score,
  derived_archetype = EXCLUDED.derived_archetype,
  preferred_service_layer = EXCLUDED.preferred_service_layer,
  updated_at = NOW();

-- ============================================================================
-- LINK PERSONAS TO ROLES AND TENANT
-- ============================================================================

-- Set tenant_id for all Clinical Validation personas
UPDATE personas
SET tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244',
    updated_at = NOW()
WHERE unique_id LIKE 'PERSONA-DH-CV%'
   OR unique_id LIKE 'PERSONA-DH-CDM%'
   OR unique_id LIKE 'PERSONA-DH-CVS%'
   OR unique_id LIKE 'PERSONA-DH-RAC%'
   OR unique_id LIKE 'PERSONA-DH-CVL%'
   OR unique_id LIKE 'PERSONA-DH-QAM%'
   OR unique_id LIKE 'PERSONA-DH-SCVS%'
   OR unique_id LIKE 'PERSONA-DH-DIRCV%'
   OR unique_id LIKE 'PERSONA-DH-VPCV%';

-- Link personas to their source roles (if roles exist)
UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'clinical-validation-associate'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-CV-ASSOC%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'clinical-data-manager-dh'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-CDM%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'clinical-validation-specialist'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-CVS%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'regulatory-affairs-coordinator-dh'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-RAC%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'clinical-validation-lead'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-CVL%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'qa-manager-clinical-validation'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-QAM%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'senior-clinical-validation-specialist'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-SCVS%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'director-clinical-validation'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-DIRCV%';

UPDATE personas p
SET source_role_id = r.id
FROM org_roles r
WHERE r.slug = 'vp-clinical-validation'
  AND r.tenant_id = 'c1977eb4-cb2e-4cf7-8cf8-4ac71e27a244'
  AND p.unique_id LIKE 'PERSONA-DH-VPCV%';

COMMIT;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

SELECT 
  'Clinical Validation Personas Created' as status,
  COUNT(*) as total_personas
FROM personas 
WHERE unique_id LIKE 'PERSONA-DH-CV%'
   OR unique_id LIKE 'PERSONA-DH-CDM%'
   OR unique_id LIKE 'PERSONA-DH-CVS%'
   OR unique_id LIKE 'PERSONA-DH-RAC%'
   OR unique_id LIKE 'PERSONA-DH-CVL%'
   OR unique_id LIKE 'PERSONA-DH-QAM%'
   OR unique_id LIKE 'PERSONA-DH-SCVS%'
   OR unique_id LIKE 'PERSONA-DH-DIRCV%'
   OR unique_id LIKE 'PERSONA-DH-VPCV%';

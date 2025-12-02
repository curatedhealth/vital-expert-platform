-- ============================================================================
-- Migration 012: Seed Detailed Prompts for PRISM Suites and Sub-Suites
-- ============================================================================
-- Purpose: Add comprehensive, detailed prompt templates for each PRISM suite
-- These are full prompt templates with variables, linked to both suites AND sub-suites
-- Date: 2025-12-02
-- ============================================================================

-- ============================================================================
-- RULES™ Suite - Regulatory Affairs Detailed Prompts
-- Sub-suites: SUBMIT, COMPLY, PATHWAY, APPROVE, GLOBAL
-- ============================================================================

INSERT INTO prompts (prompt_code, name, slug, title, description, content, role_type, category, complexity, tags, variables, version, is_active, user_template)
VALUES 
-- RULES > SUBMIT Sub-suite
('RULES-SUBMIT-510K', 'FDA 510(k) Submission Strategy', 'fda-510k-submission-strategy', 
 '510(k) Premarket Notification Strategy Development',
 'Comprehensive prompt for developing a complete FDA 510(k) submission strategy including predicate device selection, substantial equivalence arguments, and timeline planning.',
 'You are a regulatory affairs expert specializing in FDA medical device submissions. Help develop a comprehensive 510(k) premarket notification strategy.',
 'user', 'regulatory', 'advanced',
 ARRAY['regulatory', 'fda', '510k', 'medical-device', 'submission-strategy', 'RULES', 'SUBMIT'],
 ARRAY['device_name', 'device_classification', 'intended_use', 'predicate_devices', 'technological_characteristics'],
 '1.0.0', true,
 E'## 510(k) Submission Strategy Request\n\n### Device Information\n- **Device Name**: {{device_name}}\n- **Device Classification**: {{device_classification}}\n- **Intended Use**: {{intended_use}}\n\n### Predicate Device Analysis\n- **Candidate Predicate Devices**: {{predicate_devices}}\n- **Key Technological Characteristics**: {{technological_characteristics}}\n\n### Please Provide:\n1. **Predicate Device Selection Analysis**\n   - Evaluate each candidate predicate for substantial equivalence\n   - Recommend primary and secondary predicates with justification\n   - Identify potential risks with each predicate choice\n\n2. **Substantial Equivalence Argument Framework**\n   - Intended use comparison matrix\n   - Technological characteristics comparison\n   - Performance data requirements\n   - Biocompatibility considerations\n\n3. **Submission Timeline**\n   - Pre-submission meeting recommendation\n   - Testing requirements and timeline\n   - Document preparation milestones\n   - Expected FDA review timeline\n\n4. **Risk Mitigation Strategies**\n   - Potential FDA questions and responses\n   - Additional information request prevention\n   - Contingency plans'),

('RULES-SUBMIT-IND', 'IND Application Development', 'ind-application-development',
 'Investigational New Drug (IND) Application Strategy',
 'Detailed prompt for developing a comprehensive IND application including CMC, nonclinical, and clinical sections.',
 'You are a regulatory affairs expert specializing in FDA drug submissions. Help develop a comprehensive IND application strategy.',
 'user', 'regulatory', 'expert',
 ARRAY['regulatory', 'fda', 'ind', 'drug-development', 'clinical-trial', 'RULES', 'SUBMIT'],
 ARRAY['drug_name', 'therapeutic_area', 'mechanism_of_action', 'development_phase', 'target_indication'],
 '1.0.0', true,
 E'## IND Application Development Request\n\n### Drug Information\n- **Drug Name/Code**: {{drug_name}}\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Mechanism of Action**: {{mechanism_of_action}}\n- **Development Phase**: {{development_phase}}\n- **Target Indication**: {{target_indication}}\n\n### Please Provide Comprehensive Guidance On:\n\n1. **Module 1: Administrative Information**\n   - Form FDA 1571 completion guidance\n   - Investigator Brochure requirements\n   - Protocol synopsis template\n\n2. **Module 2: CMC Information**\n   - Drug substance specifications\n   - Drug product formulation requirements\n   - Manufacturing and controls overview\n   - Stability data requirements\n\n3. **Module 3: Nonclinical Pharmacology/Toxicology**\n   - Required safety studies checklist\n   - Pharmacology study design recommendations\n   - ADME study requirements\n   - Toxicology package for first-in-human\n\n4. **Module 4: Clinical Protocol**\n   - Phase-appropriate protocol elements\n   - Safety monitoring requirements\n   - Stopping rules and dose escalation\n   - Endpoint selection guidance\n\n5. **Submission Strategy**\n   - Pre-IND meeting recommendations\n   - Timeline to IND submission\n   - FDA review expectations\n   - Common deficiencies to avoid'),

('RULES-SUBMIT-NDA', 'NDA Submission Strategy', 'nda-submission-strategy',
 'New Drug Application (NDA) Submission Strategy',
 'Comprehensive prompt for developing an NDA submission strategy including CTD structure and review pathway selection.',
 'You are a regulatory affairs expert specializing in FDA NDA submissions. Help develop a comprehensive NDA submission strategy.',
 'user', 'regulatory', 'expert',
 ARRAY['regulatory', 'fda', 'nda', 'drug-approval', 'ctd', 'RULES', 'SUBMIT'],
 ARRAY['drug_name', 'indication', 'review_pathway', 'priority_review_eligibility', 'breakthrough_status'],
 '1.0.0', true,
 E'## NDA Submission Strategy Request\n\n### Drug Information\n- **Drug Name**: {{drug_name}}\n- **Indication**: {{indication}}\n- **Review Pathway**: {{review_pathway}}\n- **Priority Review Eligibility**: {{priority_review_eligibility}}\n- **Breakthrough Therapy Status**: {{breakthrough_status}}\n\n### Please Provide:\n\n1. **Review Pathway Analysis**\n   - Standard vs Priority Review justification\n   - Accelerated Approval eligibility\n   - Fast Track designation strategy\n   - Real-Time Oncology Review applicability\n\n2. **CTD Module Strategy**\n   - Module 1: Regional requirements\n   - Module 2: Summary documents approach\n   - Module 3: Quality documentation\n   - Module 4: Nonclinical overview\n   - Module 5: Clinical data presentation\n\n3. **Pre-NDA Activities**\n   - Pre-NDA meeting preparation\n   - Rolling submission strategy\n   - Advisory Committee preparation\n\n4. **Post-Submission Planning**\n   - Information request response strategy\n   - Label negotiation approach\n   - REMS requirements assessment'),

-- RULES > COMPLY Sub-suite
('RULES-COMPLY-GMP', 'GMP Compliance Assessment', 'gmp-compliance-assessment',
 'Good Manufacturing Practice Compliance Assessment',
 'Detailed prompt for conducting comprehensive GMP compliance assessments for pharmaceutical manufacturing.',
 'You are a quality assurance expert specializing in GMP compliance. Help conduct a comprehensive GMP compliance assessment.',
 'user', 'regulatory', 'advanced',
 ARRAY['regulatory', 'gmp', 'compliance', 'quality', 'manufacturing', 'RULES', 'COMPLY'],
 ARRAY['facility_type', 'product_types', 'regulatory_markets', 'recent_inspections', 'known_gaps'],
 '1.0.0', true,
 E'## GMP Compliance Assessment Request\n\n### Facility Information\n- **Facility Type**: {{facility_type}}\n- **Product Types**: {{product_types}}\n- **Regulatory Markets**: {{regulatory_markets}}\n- **Recent Inspections**: {{recent_inspections}}\n- **Known Compliance Gaps**: {{known_gaps}}\n\n### Please Assess:\n\n1. **Quality Management System**\n   - QMS documentation review\n   - CAPA effectiveness\n   - Change control processes\n   - Deviation management\n\n2. **Production Controls**\n   - Process validation status\n   - Equipment qualification\n   - Environmental monitoring\n   - Cleaning validation\n\n3. **Laboratory Controls**\n   - Method validation\n   - Stability programs\n   - OOS investigation procedures\n   - Reference standards management\n\n4. **Documentation Systems**\n   - Batch record review\n   - Data integrity assessment\n   - Electronic records compliance\n   - Training documentation\n\n5. **Remediation Plan**\n   - Gap prioritization\n   - Corrective action recommendations\n   - Timeline for remediation\n   - Inspection readiness checklist'),

-- RULES > PATHWAY Sub-suite
('RULES-PATHWAY-DEVICE', 'Medical Device Regulatory Pathway', 'device-regulatory-pathway',
 'Medical Device Regulatory Pathway Determination',
 'Detailed prompt for determining the optimal regulatory pathway for medical devices across global markets.',
 'You are a regulatory affairs expert specializing in medical device pathways. Help determine the optimal regulatory pathway.',
 'user', 'regulatory', 'advanced',
 ARRAY['regulatory', 'medical-device', 'pathway', '510k', 'pma', 'de-novo', 'RULES', 'PATHWAY'],
 ARRAY['device_description', 'intended_use', 'technology_type', 'target_markets', 'predicate_availability'],
 '1.0.0', true,
 E'## Medical Device Regulatory Pathway Analysis\n\n### Device Information\n- **Device Description**: {{device_description}}\n- **Intended Use**: {{intended_use}}\n- **Technology Type**: {{technology_type}}\n- **Target Markets**: {{target_markets}}\n- **Predicate Availability**: {{predicate_availability}}\n\n### Please Analyze:\n\n1. **US FDA Pathway Options**\n   - 510(k) eligibility assessment\n   - De Novo classification request analysis\n   - PMA requirements evaluation\n   - Exempt device determination\n\n2. **EU MDR Pathway**\n   - Device classification (Class I, IIa, IIb, III)\n   - Conformity assessment route\n   - Notified Body requirements\n   - Technical documentation scope\n\n3. **Global Market Strategy**\n   - Priority market sequencing\n   - Reference country approach\n   - Harmonization opportunities\n   - Local registration requirements\n\n4. **Pathway Recommendation**\n   - Recommended pathway with rationale\n   - Timeline comparison\n   - Resource requirements\n   - Risk assessment'),

-- RULES > APPROVE Sub-suite
('RULES-APPROVE-RESPONSE', 'FDA Response Letter Strategy', 'fda-response-strategy',
 'FDA Complete Response Letter Strategy',
 'Detailed prompt for developing a comprehensive response strategy to FDA Complete Response Letters.',
 'You are a regulatory affairs expert. Help develop a strategy to address an FDA Complete Response Letter.',
 'user', 'regulatory', 'expert',
 ARRAY['regulatory', 'fda', 'crl', 'response', 'approval', 'RULES', 'APPROVE'],
 ARRAY['application_type', 'deficiency_categories', 'timeline_constraints', 'available_data', 'meeting_history'],
 '1.0.0', true,
 E'## FDA Complete Response Letter Strategy\n\n### Application Context\n- **Application Type**: {{application_type}}\n- **Deficiency Categories**: {{deficiency_categories}}\n- **Timeline Constraints**: {{timeline_constraints}}\n- **Available Data**: {{available_data}}\n- **Meeting History**: {{meeting_history}}\n\n### Please Develop:\n\n1. **Deficiency Analysis**\n   - Categorize deficiencies by type\n   - Assess data generation requirements\n   - Identify quick wins vs. major efforts\n\n2. **Response Strategy**\n   - Type A meeting request approach\n   - Response package structure\n   - Supporting data strategy\n   - Label revision approach\n\n3. **Timeline Planning**\n   - Critical path activities\n   - Resubmission timeline\n   - Review clock considerations\n\n4. **Risk Mitigation**\n   - Potential follow-up questions\n   - Advisory Committee implications\n   - Alternative approval pathways'),

-- RULES > GLOBAL Sub-suite
('RULES-GLOBAL-MAA', 'EMA Marketing Authorization Strategy', 'ema-maa-strategy',
 'European Marketing Authorization Application Strategy',
 'Comprehensive prompt for developing an EMA MAA submission strategy including CTD structure and procedural pathway.',
 'You are a regulatory affairs expert specializing in EMA submissions. Help develop a comprehensive MAA strategy.',
 'user', 'regulatory', 'expert',
 ARRAY['regulatory', 'ema', 'maa', 'ctd', 'european-union', 'RULES', 'GLOBAL'],
 ARRAY['product_name', 'therapeutic_indication', 'procedure_type', 'rapporteur_preference', 'orphan_status'],
 '1.0.0', true,
 E'## EMA Marketing Authorization Application Strategy\n\n### Product Information\n- **Product Name**: {{product_name}}\n- **Therapeutic Indication**: {{therapeutic_indication}}\n- **Procedure Type**: {{procedure_type}}\n- **Rapporteur Preference**: {{rapporteur_preference}}\n- **Orphan Drug Status**: {{orphan_status}}\n\n### Please Provide:\n\n1. **Procedural Strategy**\n   - Centralized vs Decentralized analysis\n   - Rapporteur selection criteria\n   - Accelerated assessment eligibility\n   - Conditional approval pathway\n\n2. **CTD Dossier Planning**\n   - EU-specific Module 1 requirements\n   - Quality, nonclinical, clinical overviews\n   - Risk Management Plan structure\n\n3. **Scientific Advice**\n   - CHMP scientific advice strategy\n   - Protocol assistance approach\n   - Parallel FDA/EMA advice\n\n4. **Timeline Management**\n   - Day 0 to Day 210 planning\n   - Clock stop preparation\n   - Post-opinion activities'),

-- ============================================================================
-- TRIALS™ Suite - Clinical Development Detailed Prompts
-- Sub-suites: DESIGN, PROTOCOL, ENDPOINT, ENROLL, MONITOR, ANALYZE
-- ============================================================================

-- TRIALS > DESIGN Sub-suite
('TRIALS-DESIGN-ADAPTIVE', 'Adaptive Trial Design', 'adaptive-trial-design',
 'Adaptive Clinical Trial Design Development',
 'Detailed prompt for designing adaptive clinical trials with pre-specified modifications.',
 'You are a clinical development expert specializing in adaptive designs. Help develop an adaptive trial design.',
 'user', 'clinical', 'expert',
 ARRAY['clinical-trial', 'adaptive-design', 'interim-analysis', 'sample-size', 'TRIALS', 'DESIGN'],
 ARRAY['therapeutic_area', 'study_phase', 'adaptation_types', 'decision_rules', 'simulation_requirements'],
 '1.0.0', true,
 E'## Adaptive Trial Design Request\n\n### Study Context\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Study Phase**: {{study_phase}}\n- **Adaptation Types Considered**: {{adaptation_types}}\n- **Decision Rules**: {{decision_rules}}\n- **Simulation Requirements**: {{simulation_requirements}}\n\n### Please Design:\n\n1. **Adaptation Strategy**\n   - Sample size re-estimation approach\n   - Treatment arm selection/dropping\n   - Response-adaptive randomization\n   - Seamless phase designs\n\n2. **Statistical Framework**\n   - Type I error control\n   - Interim analysis timing\n   - Decision boundaries\n   - Information fraction planning\n\n3. **Operational Considerations**\n   - Blinding maintenance\n   - DMC charter requirements\n   - Unblinded analysis team\n   - Regulatory communication\n\n4. **Simulation Plan**\n   - Scenarios to simulate\n   - Operating characteristics\n   - Power under various conditions'),

-- TRIALS > PROTOCOL Sub-suite
('TRIALS-PROTOCOL-FULL', 'Clinical Trial Protocol Development', 'clinical-protocol-development',
 'Comprehensive Clinical Trial Protocol Design',
 'Detailed prompt for developing a complete clinical trial protocol including all ICH E6 elements.',
 'You are a clinical development expert specializing in protocol design. Help develop a comprehensive clinical trial protocol.',
 'user', 'clinical', 'expert',
 ARRAY['clinical-trial', 'protocol', 'study-design', 'ich-e6', 'TRIALS', 'PROTOCOL'],
 ARRAY['study_title', 'therapeutic_area', 'study_phase', 'target_population', 'primary_endpoint', 'comparator'],
 '1.0.0', true,
 E'## Clinical Trial Protocol Development Request\n\n### Study Overview\n- **Study Title**: {{study_title}}\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Study Phase**: {{study_phase}}\n- **Target Population**: {{target_population}}\n- **Primary Endpoint**: {{primary_endpoint}}\n- **Comparator**: {{comparator}}\n\n### Please Provide Comprehensive Protocol Guidance:\n\n1. **Study Design**\n   - Recommended design with justification\n   - Randomization and blinding strategy\n   - Treatment arms and dosing regimen\n   - Study duration and visit schedule\n\n2. **Patient Population**\n   - Detailed inclusion criteria\n   - Exclusion criteria with rationale\n   - Stratification factors\n   - Enrollment timeline\n\n3. **Endpoints and Assessments**\n   - Primary endpoint definition\n   - Secondary endpoints hierarchy\n   - Safety assessments schedule\n   - Biomarker strategy\n\n4. **Statistical Considerations**\n   - Sample size calculation\n   - Analysis populations\n   - Primary analysis methodology\n   - Interim analysis plan\n\n5. **Operational Planning**\n   - Site selection criteria\n   - Patient recruitment strategy\n   - Safety monitoring plan'),

-- TRIALS > ENDPOINT Sub-suite
('TRIALS-ENDPOINT-SELECT', 'Clinical Endpoint Selection', 'clinical-endpoint-selection',
 'Clinical Endpoint Selection and Validation',
 'Detailed prompt for selecting and validating appropriate clinical endpoints for trials.',
 'You are a clinical development expert. Help select and validate clinical endpoints.',
 'user', 'clinical', 'advanced',
 ARRAY['clinical-trial', 'endpoint', 'validation', 'regulatory', 'TRIALS', 'ENDPOINT'],
 ARRAY['therapeutic_area', 'indication', 'study_phase', 'regulatory_requirements', 'patient_perspective'],
 '1.0.0', true,
 E'## Clinical Endpoint Selection Request\n\n### Study Context\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Indication**: {{indication}}\n- **Study Phase**: {{study_phase}}\n- **Regulatory Requirements**: {{regulatory_requirements}}\n- **Patient Perspective Considerations**: {{patient_perspective}}\n\n### Please Analyze:\n\n1. **Primary Endpoint Options**\n   - Clinical outcome endpoints\n   - Surrogate endpoint considerations\n   - Composite endpoint design\n   - Regulatory acceptability\n\n2. **Endpoint Validation**\n   - Clinical meaningfulness\n   - Measurement properties\n   - Sensitivity to change\n   - Regulatory precedent\n\n3. **Secondary Endpoints**\n   - Hierarchy development\n   - Multiplicity considerations\n   - Exploratory endpoints\n\n4. **Patient-Reported Outcomes**\n   - PRO instrument selection\n   - Validation requirements\n   - Administration considerations'),

-- TRIALS > ENROLL Sub-suite
('TRIALS-ENROLL-STRATEGY', 'Patient Recruitment Strategy', 'patient-recruitment-strategy',
 'Clinical Trial Patient Recruitment Strategy',
 'Detailed prompt for developing comprehensive patient recruitment and retention strategies.',
 'You are a clinical operations expert. Help develop a patient recruitment strategy.',
 'user', 'clinical', 'advanced',
 ARRAY['clinical-trial', 'recruitment', 'enrollment', 'retention', 'TRIALS', 'ENROLL'],
 ARRAY['indication', 'target_population', 'enrollment_target', 'timeline', 'geographic_scope'],
 '1.0.0', true,
 E'## Patient Recruitment Strategy Request\n\n### Study Parameters\n- **Indication**: {{indication}}\n- **Target Population**: {{target_population}}\n- **Enrollment Target**: {{enrollment_target}}\n- **Timeline**: {{timeline}}\n- **Geographic Scope**: {{geographic_scope}}\n\n### Please Develop:\n\n1. **Recruitment Channels**\n   - Site-based recruitment\n   - Digital recruitment strategies\n   - Patient advocacy partnerships\n   - Physician referral networks\n\n2. **Patient Identification**\n   - EHR-based screening\n   - Registry utilization\n   - Social media targeting\n   - Community outreach\n\n3. **Retention Strategy**\n   - Patient engagement plan\n   - Visit burden reduction\n   - Communication strategy\n   - Dropout prevention\n\n4. **Metrics and Monitoring**\n   - Enrollment KPIs\n   - Screening ratios\n   - Site performance tracking'),

-- TRIALS > MONITOR Sub-suite
('TRIALS-MONITOR-SAFETY', 'Clinical Trial Safety Monitoring', 'trial-safety-monitoring',
 'Clinical Trial Safety Monitoring Plan',
 'Detailed prompt for developing comprehensive safety monitoring plans for clinical trials.',
 'You are a clinical safety expert. Help develop a comprehensive safety monitoring plan for clinical trials.',
 'user', 'clinical', 'advanced',
 ARRAY['clinical-trial', 'safety', 'monitoring', 'dmc', 'TRIALS', 'MONITOR'],
 ARRAY['study_phase', 'therapeutic_area', 'known_risks', 'special_populations', 'dmc_requirement'],
 '1.0.0', true,
 E'## Safety Monitoring Plan Request\n\n### Study Context\n- **Study Phase**: {{study_phase}}\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Known Risks**: {{known_risks}}\n- **Special Populations**: {{special_populations}}\n- **DMC Requirement**: {{dmc_requirement}}\n\n### Please Develop:\n\n1. **Safety Monitoring Structure**\n   - DMC charter elements\n   - Safety review frequency\n   - Stopping rules\n   - Unblinding procedures\n\n2. **AE Management**\n   - AE collection procedures\n   - SAE reporting timelines\n   - Causality assessment\n   - Medical monitoring\n\n3. **Risk Mitigation**\n   - Risk-based monitoring approach\n   - Central monitoring triggers\n   - Site remediation process\n\n4. **Safety Reporting**\n   - DSUR requirements\n   - Regulatory notifications\n   - IB updates'),

-- TRIALS > ANALYZE Sub-suite
('TRIALS-ANALYZE-SAP', 'Statistical Analysis Plan', 'statistical-analysis-plan',
 'Statistical Analysis Plan (SAP) Development',
 'Detailed prompt for developing a comprehensive statistical analysis plan.',
 'You are a biostatistician. Help develop a comprehensive statistical analysis plan.',
 'user', 'clinical', 'expert',
 ARRAY['statistics', 'sap', 'clinical-trial', 'analysis', 'TRIALS', 'ANALYZE'],
 ARRAY['study_design', 'primary_endpoint', 'sample_size', 'analysis_populations', 'alpha_level'],
 '1.0.0', true,
 E'## Statistical Analysis Plan Development\n\n### Study Parameters\n- **Study Design**: {{study_design}}\n- **Primary Endpoint**: {{primary_endpoint}}\n- **Sample Size**: {{sample_size}}\n- **Analysis Populations**: {{analysis_populations}}\n- **Alpha Level**: {{alpha_level}}\n\n### Please Develop:\n\n1. **Analysis Populations**\n   - ITT definition\n   - Per-Protocol criteria\n   - Safety population\n\n2. **Primary Analysis**\n   - Statistical model\n   - Missing data handling\n   - Sensitivity analyses\n\n3. **Secondary Analyses**\n   - Multiplicity adjustment\n   - Subgroup analyses\n   - Exploratory analyses\n\n4. **Safety Analyses**\n   - AE summarization\n   - Laboratory analysis\n   - Exposure analysis'),

-- ============================================================================
-- GUARD™ Suite - Pharmacovigilance Detailed Prompts
-- Sub-suites: DETECT, SIGNAL, REPORT, MANAGE, SURVEIL
-- ============================================================================

-- GUARD > DETECT Sub-suite
('GUARD-DETECT-AE', 'Adverse Event Detection Strategy', 'adverse-event-detection',
 'Adverse Event Detection and Processing Strategy',
 'Detailed prompt for developing comprehensive adverse event detection and case processing strategies.',
 'You are a pharmacovigilance expert. Help develop an adverse event detection strategy.',
 'user', 'safety', 'advanced',
 ARRAY['pharmacovigilance', 'adverse-event', 'case-processing', 'detection', 'GUARD', 'DETECT'],
 ARRAY['product_type', 'data_sources', 'volume_expectations', 'regulatory_requirements', 'automation_level'],
 '1.0.0', true,
 E'## Adverse Event Detection Strategy\n\n### Context\n- **Product Type**: {{product_type}}\n- **Data Sources**: {{data_sources}}\n- **Expected Volume**: {{volume_expectations}}\n- **Regulatory Requirements**: {{regulatory_requirements}}\n- **Automation Level**: {{automation_level}}\n\n### Please Develop:\n\n1. **Detection Sources**\n   - Spontaneous reporting systems\n   - Clinical trial safety data\n   - Literature monitoring\n   - Social media surveillance\n   - Patient support programs\n\n2. **Case Processing**\n   - Intake procedures\n   - Data entry standards\n   - Medical review process\n   - Quality control\n\n3. **Causality Assessment**\n   - Assessment methodology\n   - Documentation requirements\n   - Reviewer training\n\n4. **Reporting Compliance**\n   - Expedited reporting criteria\n   - Timeline management\n   - Regulatory submission'),

-- GUARD > SIGNAL Sub-suite
('GUARD-SIGNAL-DETECT', 'Safety Signal Detection', 'safety-signal-detection',
 'Pharmacovigilance Signal Detection and Evaluation',
 'Detailed prompt for implementing comprehensive signal detection and evaluation processes.',
 'You are a pharmacovigilance expert specializing in signal management. Help develop a signal detection strategy.',
 'user', 'safety', 'expert',
 ARRAY['pharmacovigilance', 'signal-detection', 'disproportionality', 'evaluation', 'GUARD', 'SIGNAL'],
 ARRAY['product_portfolio', 'data_sources', 'detection_methods', 'evaluation_criteria', 'escalation_process'],
 '1.0.0', true,
 E'## Signal Detection Strategy\n\n### Context\n- **Product Portfolio**: {{product_portfolio}}\n- **Data Sources**: {{data_sources}}\n- **Detection Methods**: {{detection_methods}}\n- **Evaluation Criteria**: {{evaluation_criteria}}\n- **Escalation Process**: {{escalation_process}}\n\n### Please Develop:\n\n1. **Signal Detection Methods**\n   - Disproportionality analysis (PRR, ROR, EBGM)\n   - Clinical review triggers\n   - Literature-based signals\n   - Regulatory intelligence\n\n2. **Signal Evaluation**\n   - Validation criteria\n   - Prioritization framework\n   - Root cause analysis\n   - Evidence assessment\n\n3. **Signal Management**\n   - Tracking system\n   - Committee review process\n   - Escalation criteria\n   - Regulatory communication\n\n4. **Documentation**\n   - Signal evaluation reports\n   - PRAC submission requirements\n   - Signal closure criteria'),

-- GUARD > REPORT Sub-suite
('GUARD-REPORT-PSUR', 'PSUR/PBRER Development', 'psur-pbrer-development',
 'Periodic Safety Update Report Development',
 'Detailed prompt for developing comprehensive PSUR/PBRER including benefit-risk assessment.',
 'You are a pharmacovigilance expert. Help develop a comprehensive PSUR/PBRER.',
 'user', 'safety', 'expert',
 ARRAY['pharmacovigilance', 'psur', 'pbrer', 'safety-report', 'benefit-risk', 'GUARD', 'REPORT'],
 ARRAY['product_name', 'reporting_period', 'data_lock_point', 'reference_safety_info', 'cumulative_exposure'],
 '1.0.0', true,
 E'## PSUR/PBRER Development Request\n\n### Report Parameters\n- **Product Name**: {{product_name}}\n- **Reporting Period**: {{reporting_period}}\n- **Data Lock Point**: {{data_lock_point}}\n- **Reference Safety Information**: {{reference_safety_info}}\n- **Cumulative Exposure**: {{cumulative_exposure}}\n\n### Please Provide:\n\n1. **Executive Summary**\n   - Key safety findings\n   - Benefit-risk conclusion\n   - Recommended actions\n\n2. **Exposure Data**\n   - Patient exposure calculations\n   - Estimation methodology\n   - Exposure by indication\n\n3. **Signal Evaluation**\n   - New signals identified\n   - Ongoing assessments\n   - Closed signals\n\n4. **Benefit-Risk Evaluation**\n   - Efficacy update\n   - Safety profile\n   - Conclusions'),

-- GUARD > MANAGE Sub-suite
('GUARD-MANAGE-RMP', 'Risk Management Plan', 'risk-management-plan',
 'EU Risk Management Plan Development',
 'Detailed prompt for developing a comprehensive EU Risk Management Plan.',
 'You are a pharmacovigilance expert. Help develop a comprehensive EU Risk Management Plan.',
 'user', 'safety', 'expert',
 ARRAY['pharmacovigilance', 'rmp', 'risk-management', 'safety-specification', 'GUARD', 'MANAGE'],
 ARRAY['product_name', 'therapeutic_indication', 'important_identified_risks', 'important_potential_risks', 'missing_information'],
 '1.0.0', true,
 E'## Risk Management Plan Development\n\n### Product Information\n- **Product Name**: {{product_name}}\n- **Therapeutic Indication**: {{therapeutic_indication}}\n- **Important Identified Risks**: {{important_identified_risks}}\n- **Important Potential Risks**: {{important_potential_risks}}\n- **Missing Information**: {{missing_information}}\n\n### Please Develop:\n\n1. **Safety Specification**\n   - Epidemiology\n   - Nonclinical safety\n   - Clinical trial exposure\n   - Post-marketing experience\n\n2. **Pharmacovigilance Plan**\n   - Routine activities\n   - Additional activities\n   - PASS protocols\n\n3. **Risk Minimization**\n   - Routine measures\n   - Additional measures\n   - Educational materials'),

-- GUARD > SURVEIL Sub-suite
('GUARD-SURVEIL-POST', 'Post-Market Surveillance', 'post-market-surveillance',
 'Post-Market Safety Surveillance Strategy',
 'Detailed prompt for developing comprehensive post-market safety surveillance strategies.',
 'You are a pharmacovigilance expert. Help develop a post-market surveillance strategy.',
 'user', 'safety', 'advanced',
 ARRAY['pharmacovigilance', 'post-market', 'surveillance', 'real-world', 'GUARD', 'SURVEIL'],
 ARRAY['product_name', 'launch_markets', 'safety_commitments', 'data_sources', 'monitoring_period'],
 '1.0.0', true,
 E'## Post-Market Surveillance Strategy\n\n### Context\n- **Product Name**: {{product_name}}\n- **Launch Markets**: {{launch_markets}}\n- **Safety Commitments**: {{safety_commitments}}\n- **Data Sources**: {{data_sources}}\n- **Monitoring Period**: {{monitoring_period}}\n\n### Please Develop:\n\n1. **Surveillance Framework**\n   - Data source integration\n   - Monitoring frequency\n   - Alert thresholds\n\n2. **Real-World Evidence**\n   - RWE study design\n   - Database selection\n   - Outcome definitions\n\n3. **Regulatory Compliance**\n   - Commitment tracking\n   - Report submissions\n   - Label updates'),

-- ============================================================================
-- VALUE™ Suite - Market Access Detailed Prompts
-- Sub-suites: PRICE, HEOR, DOSSIER, ACCESS, EVIDENCE
-- ============================================================================

-- VALUE > PRICE Sub-suite
('VALUE-PRICE-STRATEGY', 'Global Pricing Strategy', 'global-pricing-strategy',
 'Global Pricing Strategy Development',
 'Detailed prompt for developing comprehensive global pricing strategies.',
 'You are a market access expert. Help develop a global pricing strategy.',
 'user', 'market-access', 'expert',
 ARRAY['market-access', 'pricing', 'strategy', 'global', 'VALUE', 'PRICE'],
 ARRAY['product_name', 'therapeutic_area', 'target_markets', 'competitive_landscape', 'value_proposition'],
 '1.0.0', true,
 E'## Global Pricing Strategy Request\n\n### Product Context\n- **Product Name**: {{product_name}}\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Target Markets**: {{target_markets}}\n- **Competitive Landscape**: {{competitive_landscape}}\n- **Value Proposition**: {{value_proposition}}\n\n### Please Develop:\n\n1. **Price Architecture**\n   - Launch price strategy\n   - Reference pricing considerations\n   - Price corridors\n   - Discount structures\n\n2. **Market Analysis**\n   - Willingness-to-pay assessment\n   - Competitive pricing analysis\n   - Payer perspectives\n\n3. **Implementation**\n   - Launch sequence\n   - Price maintenance\n   - Tender strategy'),

-- VALUE > HEOR Sub-suite
('VALUE-HEOR-MODEL', 'Health Economic Model', 'health-economic-model',
 'Cost-Effectiveness Analysis Model Development',
 'Detailed prompt for developing comprehensive health economic models.',
 'You are a health economist. Help develop a cost-effectiveness model.',
 'user', 'market-access', 'expert',
 ARRAY['heor', 'cost-effectiveness', 'economic-model', 'qaly', 'icer', 'VALUE', 'HEOR'],
 ARRAY['product_name', 'indication', 'comparators', 'time_horizon', 'perspective', 'country'],
 '1.0.0', true,
 E'## Health Economic Model Development\n\n### Model Parameters\n- **Product Name**: {{product_name}}\n- **Indication**: {{indication}}\n- **Comparators**: {{comparators}}\n- **Time Horizon**: {{time_horizon}}\n- **Perspective**: {{perspective}}\n- **Country/Region**: {{country}}\n\n### Please Develop:\n\n1. **Model Structure**\n   - Model type selection\n   - Health states\n   - Cycle length\n\n2. **Clinical Inputs**\n   - Efficacy data\n   - Transition probabilities\n   - Survival extrapolation\n\n3. **Economic Inputs**\n   - Drug costs\n   - Medical costs\n   - Utilities\n\n4. **Analysis Plan**\n   - Base case\n   - Sensitivity analyses\n   - Budget impact'),

-- VALUE > DOSSIER Sub-suite
('VALUE-DOSSIER-GLOBAL', 'Global Value Dossier', 'global-value-dossier',
 'Global Value Dossier Development',
 'Detailed prompt for developing comprehensive global value dossiers.',
 'You are a market access expert. Help develop a global value dossier.',
 'user', 'market-access', 'expert',
 ARRAY['market-access', 'value-dossier', 'amcp', 'nice', 'VALUE', 'DOSSIER'],
 ARRAY['product_name', 'indication', 'clinical_evidence', 'economic_evidence', 'target_audiences'],
 '1.0.0', true,
 E'## Global Value Dossier Development\n\n### Product Information\n- **Product Name**: {{product_name}}\n- **Indication**: {{indication}}\n- **Clinical Evidence**: {{clinical_evidence}}\n- **Economic Evidence**: {{economic_evidence}}\n- **Target Audiences**: {{target_audiences}}\n\n### Please Develop:\n\n1. **Disease and Treatment Landscape**\n   - Burden of illness\n   - Current treatment paradigm\n   - Unmet needs\n\n2. **Product Profile**\n   - Mechanism of action\n   - Clinical program overview\n   - Efficacy summary\n   - Safety profile\n\n3. **Economic Value**\n   - Cost-effectiveness\n   - Budget impact\n   - Value proposition\n\n4. **Appendices**\n   - Clinical study summaries\n   - Economic model details'),

-- VALUE > ACCESS Sub-suite
('VALUE-ACCESS-PAYER', 'Payer Engagement Strategy', 'payer-engagement-strategy',
 'Payer Engagement and Negotiation Strategy',
 'Detailed prompt for developing comprehensive payer engagement strategies.',
 'You are a market access expert. Help develop a payer engagement strategy.',
 'user', 'market-access', 'advanced',
 ARRAY['market-access', 'payer', 'negotiation', 'formulary', 'VALUE', 'ACCESS'],
 ARRAY['product_name', 'payer_landscape', 'value_messages', 'contracting_approach', 'timeline'],
 '1.0.0', true,
 E'## Payer Engagement Strategy\n\n### Context\n- **Product Name**: {{product_name}}\n- **Payer Landscape**: {{payer_landscape}}\n- **Value Messages**: {{value_messages}}\n- **Contracting Approach**: {{contracting_approach}}\n- **Timeline**: {{timeline}}\n\n### Please Develop:\n\n1. **Payer Mapping**\n   - Key decision makers\n   - Influence networks\n   - Engagement priorities\n\n2. **Value Communication**\n   - Core messages\n   - Evidence package\n   - Objection handling\n\n3. **Contracting Strategy**\n   - Contract types\n   - Rebate structures\n   - Outcomes-based agreements\n\n4. **Implementation**\n   - Account planning\n   - Meeting preparation\n   - Follow-up process'),

-- ============================================================================
-- BRIDGE™ Suite - Medical Affairs Detailed Prompts
-- Sub-suites: ENGAGE, ADVISORY, INFORM, SPEAKER, INFLUENCE
-- ============================================================================

-- BRIDGE > ENGAGE Sub-suite
('BRIDGE-ENGAGE-KOL', 'KOL Engagement Strategy', 'kol-engagement-strategy',
 'Key Opinion Leader Engagement Strategy',
 'Detailed prompt for developing comprehensive KOL engagement strategies.',
 'You are a medical affairs expert. Help develop a KOL engagement strategy.',
 'user', 'medical-affairs', 'expert',
 ARRAY['medical-affairs', 'kol', 'engagement', 'thought-leader', 'BRIDGE', 'ENGAGE'],
 ARRAY['therapeutic_area', 'product_lifecycle', 'geographic_scope', 'objectives', 'budget'],
 '1.0.0', true,
 E'## KOL Engagement Strategy\n\n### Context\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Product Lifecycle Stage**: {{product_lifecycle}}\n- **Geographic Scope**: {{geographic_scope}}\n- **Objectives**: {{objectives}}\n- **Budget**: {{budget}}\n\n### Please Develop:\n\n1. **KOL Identification**\n   - Identification criteria\n   - Tiering methodology\n   - Influence mapping\n\n2. **Engagement Planning**\n   - Touchpoint strategy\n   - Content framework\n   - Compliance considerations\n\n3. **Programs**\n   - Advisory boards\n   - Speaker programs\n   - Publication collaboration\n\n4. **Measurement**\n   - KPIs\n   - ROI assessment'),

-- BRIDGE > ADVISORY Sub-suite
('BRIDGE-ADVISORY-BOARD', 'Advisory Board Planning', 'advisory-board-planning',
 'Medical Advisory Board Planning and Execution',
 'Detailed prompt for planning and executing medical advisory boards.',
 'You are a medical affairs expert. Help plan a medical advisory board.',
 'user', 'medical-affairs', 'advanced',
 ARRAY['medical-affairs', 'advisory-board', 'kol', 'scientific-exchange', 'BRIDGE', 'ADVISORY'],
 ARRAY['therapeutic_area', 'meeting_objectives', 'participant_profile', 'format', 'budget'],
 '1.0.0', true,
 E'## Advisory Board Planning\n\n### Meeting Context\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Meeting Objectives**: {{meeting_objectives}}\n- **Participant Profile**: {{participant_profile}}\n- **Format**: {{format}}\n- **Budget**: {{budget}}\n\n### Please Develop:\n\n1. **Meeting Design**\n   - Agenda development\n   - Discussion questions\n   - Facilitation approach\n\n2. **Participant Selection**\n   - Selection criteria\n   - Invitation strategy\n   - Compliance review\n\n3. **Logistics**\n   - Venue selection\n   - Materials preparation\n   - Technology requirements\n\n4. **Outcomes**\n   - Documentation plan\n   - Action items tracking\n   - Follow-up strategy'),

-- ============================================================================
-- CRAFT™ Suite - Medical Writing Detailed Prompts
-- Sub-suites: WRITE, PUBLISH, COMMUNICATE, DOCUMENT, TRANSLATE
-- ============================================================================

-- CRAFT > WRITE Sub-suite
('CRAFT-WRITE-CSR', 'Clinical Study Report', 'clinical-study-report',
 'Clinical Study Report (CSR) Development',
 'Detailed prompt for developing clinical study reports following ICH E3.',
 'You are a medical writer. Help develop a clinical study report.',
 'user', 'writing', 'expert',
 ARRAY['medical-writing', 'csr', 'ich-e3', 'clinical-trial', 'CRAFT', 'WRITE'],
 ARRAY['study_title', 'study_phase', 'therapeutic_area', 'primary_endpoint', 'study_results'],
 '1.0.0', true,
 E'## Clinical Study Report Development\n\n### Study Information\n- **Study Title**: {{study_title}}\n- **Study Phase**: {{study_phase}}\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Primary Endpoint**: {{primary_endpoint}}\n- **Study Results Summary**: {{study_results}}\n\n### Please Develop:\n\n1. **Synopsis**\n   - Study identification\n   - Key results\n   - Conclusions\n\n2. **Study Conduct**\n   - Ethics\n   - Protocol amendments\n   - GCP compliance\n\n3. **Results**\n   - Patient disposition\n   - Efficacy analysis\n   - Safety evaluation\n\n4. **Discussion**\n   - Benefit-risk\n   - Conclusions'),

-- CRAFT > PUBLISH Sub-suite
('CRAFT-PUBLISH-MANUSCRIPT', 'Manuscript Development', 'manuscript-development',
 'Scientific Manuscript Development',
 'Detailed prompt for developing scientific manuscripts for peer-reviewed publication.',
 'You are a medical writer. Help develop a scientific manuscript.',
 'user', 'writing', 'advanced',
 ARRAY['medical-writing', 'manuscript', 'publication', 'peer-review', 'CRAFT', 'PUBLISH'],
 ARRAY['study_type', 'target_journal', 'key_findings', 'author_list', 'timeline'],
 '1.0.0', true,
 E'## Manuscript Development Request\n\n### Publication Context\n- **Study Type**: {{study_type}}\n- **Target Journal**: {{target_journal}}\n- **Key Findings**: {{key_findings}}\n- **Author List**: {{author_list}}\n- **Timeline**: {{timeline}}\n\n### Please Develop:\n\n1. **Structure**\n   - Title and abstract\n   - Introduction framework\n   - Methods outline\n   - Results presentation\n   - Discussion points\n\n2. **Journal Requirements**\n   - Format specifications\n   - Word limits\n   - Reference style\n\n3. **Submission Strategy**\n   - Cover letter\n   - Reviewer suggestions\n   - Disclosure statements'),

-- ============================================================================
-- FORGE™ Suite - Digital Health Detailed Prompts
-- Sub-suites: DEVELOP, VALIDATE, REGULATE, INNOVATE, IMPLEMENT
-- ============================================================================

-- FORGE > DEVELOP Sub-suite
('FORGE-DEVELOP-DTX', 'Digital Therapeutic Development', 'digital-therapeutic-development',
 'Digital Therapeutic (DTx) Development Strategy',
 'Detailed prompt for developing digital therapeutic product strategies.',
 'You are a digital health expert. Help develop a DTx strategy.',
 'user', 'digital-health', 'expert',
 ARRAY['digital-health', 'dtx', 'software', 'therapeutic', 'FORGE', 'DEVELOP'],
 ARRAY['therapeutic_area', 'intended_use', 'target_population', 'delivery_platform', 'evidence_requirements'],
 '1.0.0', true,
 E'## Digital Therapeutic Development Strategy\n\n### Product Context\n- **Therapeutic Area**: {{therapeutic_area}}\n- **Intended Use**: {{intended_use}}\n- **Target Population**: {{target_population}}\n- **Delivery Platform**: {{delivery_platform}}\n- **Evidence Requirements**: {{evidence_requirements}}\n\n### Please Develop:\n\n1. **Product Strategy**\n   - Value proposition\n   - Differentiation\n   - User experience\n\n2. **Clinical Strategy**\n   - Evidence generation plan\n   - Clinical validation approach\n   - Endpoint selection\n\n3. **Regulatory Strategy**\n   - Classification pathway\n   - Submission approach\n   - Post-market requirements\n\n4. **Commercial Strategy**\n   - Market access approach\n   - Reimbursement strategy\n   - Launch planning'),

-- FORGE > REGULATE Sub-suite
('FORGE-REGULATE-SAMD', 'SaMD Regulatory Strategy', 'samd-regulatory-strategy',
 'Software as Medical Device Regulatory Strategy',
 'Detailed prompt for developing SaMD regulatory strategies.',
 'You are a digital health regulatory expert. Help develop a SaMD regulatory strategy.',
 'user', 'digital-health', 'expert',
 ARRAY['digital-health', 'samd', 'software', 'fda', 'mdr', 'FORGE', 'REGULATE'],
 ARRAY['software_name', 'intended_use', 'clinical_claims', 'target_regions', 'ai_ml_components'],
 '1.0.0', true,
 E'## SaMD Regulatory Strategy\n\n### Software Information\n- **Software Name**: {{software_name}}\n- **Intended Use**: {{intended_use}}\n- **Clinical Claims**: {{clinical_claims}}\n- **Target Regions**: {{target_regions}}\n- **AI/ML Components**: {{ai_ml_components}}\n\n### Please Develop:\n\n1. **Classification**\n   - IMDRF classification\n   - FDA risk classification\n   - EU MDR classification\n\n2. **Clinical Evaluation**\n   - Evidence requirements\n   - Validation approach\n   - Performance testing\n\n3. **Documentation**\n   - IEC 62304 compliance\n   - Cybersecurity\n   - Interoperability\n\n4. **Submission**\n   - Pathway selection\n   - Timeline\n   - Post-market plan')

ON CONFLICT (prompt_code) DO UPDATE SET
    name = EXCLUDED.name,
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    content = EXCLUDED.content,
    user_template = EXCLUDED.user_template,
    tags = EXCLUDED.tags,
    variables = EXCLUDED.variables,
    updated_at = NOW();

-- ============================================================================
-- Link Detailed Prompts to Suites AND Sub-Suites
-- ============================================================================

DO $$
DECLARE
    v_suite_id UUID;
    v_sub_suite_id UUID;
    v_prompt_id UUID;
    v_prompt_code TEXT;
    v_suite_code TEXT;
    v_sub_suite_code TEXT;
BEGIN
    -- Process each detailed prompt and link to appropriate suite and sub-suite
    FOR v_prompt_id, v_prompt_code IN 
        SELECT id, prompt_code FROM prompts 
        WHERE prompt_code LIKE 'RULES-%' 
           OR prompt_code LIKE 'TRIALS-%'
           OR prompt_code LIKE 'GUARD-%'
           OR prompt_code LIKE 'VALUE-%'
           OR prompt_code LIKE 'BRIDGE-%'
           OR prompt_code LIKE 'CRAFT-%'
           OR prompt_code LIKE 'FORGE-%'
           OR prompt_code LIKE 'PROOF-%'
           OR prompt_code LIKE 'SCOUT-%'
           OR prompt_code LIKE 'PROJECT-%'
    LOOP
        -- Extract suite code (first part before dash)
        v_suite_code := split_part(v_prompt_code, '-', 1);
        -- Extract sub-suite code (second part)
        v_sub_suite_code := split_part(v_prompt_code, '-', 2);
        
        -- Get suite ID
        SELECT id INTO v_suite_id FROM prompt_suites WHERE suite_code = v_suite_code;
        
        -- Get sub-suite ID (if exists)
        SELECT id INTO v_sub_suite_id FROM prompt_sub_suites 
        WHERE sub_suite_code = v_sub_suite_code AND suite_id = v_suite_id;
        
        -- Insert into suite_prompts if suite exists
        IF v_suite_id IS NOT NULL THEN
            INSERT INTO suite_prompts (prompt_id, suite_id, sub_suite_id, sort_order, is_primary)
            VALUES (v_prompt_id, v_suite_id, v_sub_suite_id, 1, true)
            ON CONFLICT DO NOTHING;
            
            RAISE NOTICE 'Linked prompt % to suite % sub-suite %', v_prompt_code, v_suite_code, v_sub_suite_code;
        END IF;
    END LOOP;
    
    RAISE NOTICE 'Successfully linked detailed prompts to PRISM suites and sub-suites';
END $$;

-- Update prompt counts in suites
UPDATE prompt_suites SET prompt_count = (
    SELECT COUNT(*) FROM suite_prompts WHERE suite_id = prompt_suites.id
);

-- Update prompt counts in sub-suites
UPDATE prompt_sub_suites SET prompt_count = (
    SELECT COUNT(*) FROM suite_prompts WHERE sub_suite_id = prompt_sub_suites.id
);

COMMIT;

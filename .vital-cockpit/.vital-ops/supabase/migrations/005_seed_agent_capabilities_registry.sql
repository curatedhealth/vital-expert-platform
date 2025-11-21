-- ============================================================================
-- Migration 005: Seed Agent Capabilities Registry
-- ============================================================================
-- Generated from analysis of 319 existing agents
-- Total capabilities: 397
-- Categories: regulatory, clinical, market_access, technical_cmc, strategic, operational, analytical, communication
--
-- This migration populates the capabilities table with capabilities extracted
-- from actual agent usage patterns rather than predefined templates.
-- ============================================================================

BEGIN;


-- ============================================================================
-- REGULATORY CAPABILITIES (72 capabilities)
-- ============================================================================

-- Used by 28 agents: comparability_study_designer, Drug Information Specialist, Pharmacokinetics Advisor, ... (+25 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pharmacotherapy_decision_support', 'pharmacotherapy-decision-support', 'Pharmacotherapy Decision Support', 'Supports safe and effective pharmacotherapy decisions.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 24 agents: Accelerated Approval Strategist, NDA/BLA Coordinator, Regulatory Intelligence Analyst, ... (+21 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('strategic_regulatory_guidance', 'strategic-regulatory-guidance', 'Strategic Regulatory Guidance', 'Provides strategic guidance on regulatory affairs, particularly in the context of accelerated approval pathways.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 22 agents: Accelerated Approval Strategist, NDA/BLA Coordinator, Pediatric Regulatory Advisor, ... (+19 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('interpret_fda_regulations', 'interpret-fda-regulations', 'Interpret FDA Regulations', 'Interprets FDA regulations and provides advice on how to navigate them for accelerated approval.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 22 agents: Accelerated Approval Strategist, NDA/BLA Coordinator, Pediatric Regulatory Advisor, ... (+19 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('develop_submission_strategies', 'develop-submission-strategies', 'Develop Submission Strategies', 'Develops strategies for regulatory submissions to ensure compliance and maximize chances of approval.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 22 agents: Accelerated Approval Strategist, NDA/BLA Coordinator, Pediatric Regulatory Advisor, ... (+19 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ensure_regulatory_compliance', 'ensure-regulatory-compliance', 'Ensure Regulatory Compliance', 'Ensures that all regulatory submissions are in compliance with FDA regulations.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 11 agents: Safety Signal Detector, PSUR/PBRER Writer, Post-Marketing Surveillance Coordinator, ... (+8 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safety_signal_detection', 'safety-signal-detection', 'Safety Signal Detection', 'Identifies potential safety issues or risks associated with a medical device or pharmaceutical product', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 10 agents: PSUR/PBRER Writer, Post-Marketing Surveillance Coordinator, Safety Database Manager, ... (+7 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('benefit_risk_assessment', 'benefit-risk-assessment', 'Benefit-Risk Assessment', 'Assesses the benefit-risk profile of pharmaceutical products to ensure patient safety.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 10 agents: PSUR/PBRER Writer, Post-Marketing Surveillance Coordinator, Safety Database Manager, ... (+7 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safety_report_preparation', 'safety-report-preparation', 'Safety Report Preparation', 'Prepares detailed safety reports based on the analysis of pharmacovigilance data.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 5 agents: Post-Marketing Surveillance Coordinator, Safety Database Manager, Aggregate Report Coordinator, ... (+2 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('proactive_patient_safety_monitoring', 'proactive-patient-safety-monitoring', 'Proactive Patient Safety Monitoring', 'Ensures proactive patient safety monitoring in post-market surveillance', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 3 agents: PSUR/PBRER Writer, Benefit-Risk Assessor, Signal Detection Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_safety_monitoring', 'patient-safety-monitoring', 'Patient Safety Monitoring', 'Ensures proactive patient safety monitoring by keeping track of all safety signals and adverse events.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Clinical Trial Disclosure Manager, KOL Engagement Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_management', 'compliance-management', 'Compliance Management', 'Ensure all clinical trials are compliant with global disclosure requirements and regulations', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: FDA Guidance Interpreter, Regulatory Risk Assessment Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('submission_strategy_development', 'submission-strategy-development', 'Submission Strategy Development', 'Develops strategies for FDA submissions', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Government Affairs Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('policy_influence', 'policy-influence', 'Policy Influence', 'Ability to influence policy decisions through strategic communication and relationship building with government stakeholders.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Government Affairs Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('legislative_priorities_advancement', 'legislative-priorities-advancement', 'Legislative Priorities Advancement', 'Ability to advance legislative priorities by effectively communicating the importance and benefits of these priorities to policymakers.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Government Affairs Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('government_stakeholder_relationship_building', 'government-stakeholder-relationship-building', 'Government Stakeholder Relationship Building', 'Ability to build and maintain relationships with government stakeholders to facilitate policy influence and legislative priorities advancement.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Healthcare Policy Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('healthcare_legislation_analysis', 'healthcare-legislation-analysis', 'Healthcare Legislation Analysis', 'Analyzes healthcare legislation to understand its implications and potential impacts', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Healthcare Policy Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('evidence_based_policy_development', 'evidence-based-policy-development', 'Evidence-Based Policy Development', 'Develops policy positions based on evidence and research', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Healthcare Policy Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('policy_advocacy_support', 'policy-advocacy-support', 'Policy Advocacy Support', 'Supports advocacy efforts with evidence-based analysis', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Information Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_information_response', 'medical-information-response', 'Medical Information Response', 'Responds to medical inquiries from healthcare providers with accurate, balanced, and evidence-based information.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Information Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('fda_regulation_compliance', 'fda-regulation-compliance', 'FDA Regulation Compliance', 'Ensures all responses are compliant with FDA regulations and include appropriate safety information.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Information Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_data_interpretation', 'medical-data-interpretation', 'Medical Data Interpretation', 'Interprets and uses medical data to provide accurate and balanced responses to inquiries.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer - Regulatory
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_document_creation', 'regulatory-document-creation', 'Regulatory Document Creation', 'Ability to develop critical regulatory documents such as CSRs, protocols, IBs, and other regulatory submissions.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer - Regulatory
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_to_regulatory_standards', 'compliance-to-regulatory-standards', 'Compliance to Regulatory Standards', 'Ensures all documents are created in compliance with regulatory standards.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer - Regulatory
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_writing', 'medical-writing', 'Medical Writing', 'Ability to effectively communicate complex medical information in written form.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Disclosure Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_registration', 'clinical-trial-registration', 'Clinical Trial Registration', 'Manage and oversee the registration of clinical trials ensuring all necessary information is accurately recorded and updated', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Disclosure Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('results_disclosure', 'results-disclosure', 'Results Disclosure', 'Responsible for disclosing the results of clinical trials in a transparent and compliant manner', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Compliance Validator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_submission_validation', 'regulatory-submission-validation', 'Regulatory Submission Validation', 'Checks regulatory submissions for compliance with FDA, EMA, and other regulatory requirements', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Compliance Validator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_assessment', 'compliance-assessment', 'Compliance Assessment', 'Assesses the compliance of submissions with regulatory standards', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Compliance Validator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_standards_application', 'regulatory-standards-application', 'Regulatory Standards Application', 'Applies regulatory standards to submissions to ensure compliance', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Document Generator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_document_generation', 'regulatory-document-generation', 'Regulatory Document Generation', 'Generates regulatory submissions and other related documents', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Document Generator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_study_report_creation', 'clinical-study-report-creation', 'Clinical Study Report Creation', 'Creates clinical study reports from templates and data', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Document Generator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('template_based_documentation', 'template-based-documentation', 'Template-based Documentation', 'Creates various documents from pre-defined templates', 'regulatory', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Safety Signal Detector
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('adverse_event_monitoring', 'adverse-event-monitoring', 'Adverse Event Monitoring', 'Monitors and records adverse events in a medical or pharmaceutical context', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Safety Signal Detector
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('risk_assessment', 'risk-assessment', 'Risk Assessment', 'Performs risk assessment to evaluate the severity and probability of potential safety issues', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HIPAA Compliance Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('interpreting_hipaa_privacy_security_rules', 'interpreting-hipaa-privacy-security-rules', 'Interpreting HIPAA Privacy and Security Rules', 'Interprets and applies the Health Insurance Portability and Accountability Act (HIPAA) Privacy and Security Rules to ensure compliance in healthcare settings.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HIPAA Compliance Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('reviewing_business_associate_agreements', 'reviewing-business-associate-agreements', 'Reviewing Business Associate Agreements', 'Reviews and assesses Business Associate Agreements to ensure they meet HIPAA standards and protect patient data.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HIPAA Compliance Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('advising_on_breach_notification_requirements', 'advising-on-breach-notification-requirements', 'Advising on Breach Notification Requirements', 'Provides advice and guidance on breach notification requirements in the event of a data breach, ensuring compliance with HIPAA regulations.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HIPAA Compliance Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('assessing_security_safeguards', 'assessing-security-safeguards', 'Assessing Security Safeguards', 'Assesses the security safeguards in place to protect patient data, ensuring they meet HIPAA standards.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HIPAA Compliance Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('supporting_compliance_audits', 'supporting-compliance-audits', 'Supporting Compliance Audits', 'Supports compliance audits by providing expertise and guidance on HIPAA regulations and standards.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Intelligence Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('interpretation_of_fda_regulations', 'interpretation-of-fda-regulations', 'Interpretation of FDA Regulations', 'Interprets and applies FDA regulations to ensure compliance', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Intelligence Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('development_of_submission_strategies', 'development-of-submission-strategies', 'Development of Submission Strategies', 'Develops strategies for regulatory submissions to ensure approval', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Intelligence Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ensuring_regulatory_compliance', 'ensuring-regulatory-compliance', 'Ensuring Regulatory Compliance', 'Ensures all processes and submissions are in compliance with regulatory standards', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Impurity Assessment Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('impurity_qualification', 'impurity-qualification', 'Impurity Qualification', 'Specializes in the qualification of impurities in pharmaceuticals, ensuring they meet safety standards.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Impurity Assessment Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safety_assessment', 'safety-assessment', 'Safety Assessment', 'Assesses the safety of pharmaceuticals, including potential drug interactions and dosing calculations.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: FDA Guidance Interpreter
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('fda_regulation_interpretation', 'fda-regulation-interpretation', 'FDA Regulation Interpretation', 'Interprets FDA regulations to ensure compliance', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Ethics Committee Liaison
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('irb_ec_coordination', 'irb-ec-coordination', 'IRB/EC Coordination', 'Specializes in coordinating with Institutional Review Board (IRB) and Ethics Committee (EC) for pharmaceutical submissions.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: FDA Regulatory Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('fda_regulatory_advising', 'fda-regulatory-advising', 'FDA Regulatory Advising', 'Advises on regulatory pathways such as 510(k), PMA, De Novo for digital health products and medical devices', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: FDA Regulatory Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('interpret_fda_guidance', 'interpret-fda-guidance', 'Interpret FDA Guidance', 'Interprets FDA guidance documents to provide clear, actionable guidance', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: FDA Regulatory Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('support_pre_submission_meetings', 'support-pre-submission-meetings', 'Support Pre-Submission Meetings', 'Supports pre-submission meetings, providing regulatory insights and guidance', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: FDA Regulatory Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('review_regulatory_submissions', 'review-regulatory-submissions', 'Review Regulatory Submissions', 'Reviews regulatory submissions for compliance with FDA regulations', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: FDA Regulatory Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('monitor_regulatory_changes', 'monitor-regulatory-changes', 'Monitor Regulatory Changes', 'Monitors changes in FDA regulations and updates regulatory strategies accordingly', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Safety Communication Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('dhpc_preparation', 'dhpc-preparation', 'DHPC Preparation', 'Prepares Direct Healthcare Professional Communications (DHPCs) to communicate safety information to healthcare professionals.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Managed Care Contracting Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('contract_negotiation_strategy', 'contract-negotiation-strategy', 'Contract Negotiation and Strategy', 'Specializes in contract negotiation and strategy in the pharmaceutical domain.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Dissolution Testing Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('dissolution_method_development', 'dissolution-method-development', 'Dissolution Method Development', 'Develops and optimizes dissolution methods for pharmaceutical products to ensure their quality and efficacy.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Dissolution Testing Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ivivc_assessment', 'ivivc-assessment', 'IVIVC Assessment', 'Assesses the In Vitro-In Vivo Correlation (IVIVC) of pharmaceutical products to predict their behavior inside the body based on laboratory tests.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Cleaning Validation Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cleaning_validation_protocol_execution', 'cleaning-validation-protocol-execution', 'Cleaning Validation Protocol Execution', 'Specializes in executing cleaning validation protocols in the pharmaceutical industry.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Risk Assessment Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_guidance_provision', 'regulatory-guidance-provision', 'Regulatory Guidance Provision', 'Provides strategic regulatory guidance and interprets FDA regulations', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regulatory Risk Assessment Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('risk_identification_and_mitigation', 'risk-identification-and-mitigation', 'Risk Identification and Mitigation', 'Identifies and mitigates regulatory risks', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Adverse Event Reporter
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ae_documentation', 'ae-documentation', 'Adverse Event Documentation', 'The agent can document adverse events related to medication use.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Adverse Event Reporter
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_reporting', 'regulatory-reporting', 'Regulatory Reporting', 'The agent can report the documented adverse events to regulatory bodies.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Returns & Recall Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('product_return_management', 'product-return-management', 'Product Return Management', 'Manage and coordinate the return of pharmaceutical products, ensuring compliance with regulatory standards and safety protocols.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Returns & Recall Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('recall_coordinating', 'recall-coordinating', 'Recall Coordinating', 'Coordinate and manage product recalls, ensuring that all processes are carried out in accordance with regulatory guidelines and safety standards.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Transparency Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('trial_registration', 'trial-registration', 'Trial Registration', 'Specializes in registering clinical trials in accordance with regulatory standards.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Transparency Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('disclosure_management', 'disclosure-management', 'Disclosure Management', 'Manages the disclosure of clinical trial data and results to relevant parties.', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Import/Export Compliance Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('international_trade_compliance', 'international-trade-compliance', 'International Trade Compliance', 'Ensure compliance with international trade regulations in the pharmaceutical industry.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Serialization & Track-Trace Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('serialization_compliance_implementation', 'serialization-compliance-implementation', 'Serialization Compliance Implementation', 'Specializes in the implementation and compliance of serialization in pharmaceuticals.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Batch Record Reviewer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('batch_record_review', 'batch-record-review', 'Batch Record Review', 'Review and release of pharmaceutical batch records', 'regulatory', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Anti-Corruption Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('fcpa_compliance', 'fcpa-compliance', 'FCPA Compliance', 'Specializes in Foreign Corrupt Practices Act (FCPA) compliance, ensuring that pharmaceutical practices align with anti-bribery laws.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Anti-Corruption Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('anti_bribery_compliance', 'anti-bribery-compliance', 'Anti-Bribery Compliance', 'Ensures adherence to anti-bribery laws and regulations in the pharmaceutical industry.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Trade Compliance Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('international_trade_regulation_compliance', 'international-trade-regulation-compliance', 'International Trade Regulation Compliance', 'Ensures compliance with international trade regulations in the pharmaceutical industry', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Privacy Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gdpr_compliance', 'gdpr-compliance', 'GDPR Compliance', 'Ensures data privacy and compliance with GDPR regulations in the pharmaceutical sector.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Privacy Officer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_compliance', 'regulatory-compliance', 'Regulatory Compliance', 'Ensures full compliance with pharmaceutical regulations.', 'regulatory', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- CLINICAL CAPABILITIES (75 capabilities)
-- ============================================================================

-- Used by 97 agents: Anticoagulation Specialist, formulation_development_scientist, Pediatric Dosing Specialist, ... (+94 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('drug_interaction_assessment', 'drug-interaction-assessment', 'Drug Interaction Assessment', 'Assesses potential interactions between different drugs.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 81 agents: Anticoagulation Specialist, formulation_development_scientist, Pediatric Dosing Specialist, ... (+78 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('evidence_based_medication_guidance', 'evidence-based-medication-guidance', 'Evidence-Based Medication Guidance', 'Provides guidance on medication based on evidence and research.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 81 agents: Anticoagulation Specialist, formulation_development_scientist, Pediatric Dosing Specialist, ... (+78 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('dosing_calculation', 'dosing-calculation', 'Dosing Calculation', 'Performs calculations to determine the correct dosage of medication.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 66 agents: oligonucleotide_therapy_specialist, Clinical Trial Budget Estimator, Clinical Protocol Writer, ... (+63 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_protocol_design', 'clinical-protocol-design', 'Clinical Protocol Design', 'Designs clinical protocols for antisense and siRNA therapeutics', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 66 agents: oligonucleotide_therapy_specialist, Clinical Trial Budget Estimator, Clinical Protocol Writer, ... (+63 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('trial_operations_management', 'trial-operations-management', 'Trial Operations Management', 'Manages trial operations, ensuring smooth execution of clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 63 agents: oligonucleotide_therapy_specialist, Clinical Trial Budget Estimator, Clinical Protocol Writer, ... (+60 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_safety_maintenance', 'patient-safety-maintenance', 'Patient Safety Maintenance', 'Maintains patient safety throughout clinical development', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 57 agents: oligonucleotide_therapy_specialist, Study Closeout Specialist, Safety Reporting Coordinator, ... (+54 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_quality_assurance', 'data-quality-assurance', 'Data Quality Assurance', 'Ensures the quality of data collected during clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 31 agents: Anticoagulation Specialist, Pediatric Dosing Specialist, Infectious Disease Pharmacist, ... (+28 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safe_pharmacotherapy_decision_support', 'safe-pharmacotherapy-decision-support', 'Safe Pharmacotherapy Decision Support', 'Supports safe decisions in pharmacotherapy, ensuring patient safety and efficacy of treatment.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 23 agents: Dosing Calculator, Equipment Qualification Specialist, Sterile Manufacturing Specialist, ... (+20 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medication_guidance', 'medication-guidance', 'Medication Guidance', 'Provide evidence-based guidance on medication usage and adjustments.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 11 agents: Mass Spectrometry Imaging Expert, Database Architect, Formulary Strategy Specialist, ... (+8 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('dosing_calculations', 'dosing-calculations', 'Dosing Calculations', 'Performs calculations for medication dosing to ensure proper administration and safety.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 8 agents: Multi-Omics Integration Specialist, Scale-Up Specialist, Cleaning Validation Specialist, ... (+5 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medication_guidance_provision', 'medication-guidance-provision', 'Medication Guidance Provision', 'Provides evidence-based medication guidance to support safe pharmacotherapy decisions.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 7 agents: Clinical Trial Budget Estimator, Intranasal Delivery Expert, CRISPR Therapeutic Specialist, ... (+4 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_quality_ensurance', 'data-quality-ensurance', 'Data Quality Ensurance', 'Ensures the quality of data in clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 7 agents: Investigator-Initiated Study Reviewer, Congress Planning Specialist, Evidence Generation Planner, ... (+4 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_publication_development', 'medical-publication-development', 'Medical Publication Development', 'Develops publications based on the medical evidence generated, with a high acceptance rate.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 7 agents: Medical Science Liaison Coordinator, Evidence Generation Planner, Medical Affairs Metrics Analyst, ... (+4 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('key_opinion_leader_engagement', 'key-opinion-leader-engagement', 'Key Opinion Leader Engagement', 'Engages key opinion leaders in the medical field to generate medical evidence and develop publications.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 6 agents: Medical Science Liaison Coordinator, Evidence Generation Planner, Medical Affairs Metrics Analyst, ... (+3 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_support_provision', 'scientific-support-provision', 'Scientific Support Provision', 'Provides scientific support to key opinion leaders and other stakeholders.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 5 agents: Clinical Trial Simulation Expert, Pharmacology Study Planner, Quality by Design Specialist, ... (+2 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('perform_dosing_calculations', 'perform-dosing-calculations', 'Perform Dosing Calculations', 'Performs calculations for medication dosing', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 5 agents: Clinical Trial Simulation Expert, Pharmacology Study Planner, Quality by Design Specialist, ... (+2 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('assess_drug_interactions', 'assess-drug-interactions', 'Assess Drug Interactions', 'Assesses potential interactions between different drugs', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Clinical Trial Protocol Designer, Clinical Trial Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_protocol_design', 'clinical-trial-protocol-design', 'Clinical Trial Protocol Design', 'Designs and creates scientifically rigorous and feasible study protocols for clinical trials.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Investigator-Initiated Study Reviewer, Congress Planning Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_review', 'compliance-review', 'Compliance Review', 'Ensures all information and actions are in compliance with regulatory standards, never promoting off-label use or providing false information.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Medical Science Liaison Coordinator, Publication Planner
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('publication_development', 'publication-development', 'Publication Development', 'Develops publications based on medical evidence and research.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Clinical Trial Simulation Expert, Quality by Design Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('support_pharmacotherapy_decisions', 'support-pharmacotherapy-decisions', 'Support Pharmacotherapy Decisions', 'Supports decisions related to pharmacotherapy', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Antibody-Drug Conjugate Specialist, PROTAC Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_management', 'clinical-trial-management', 'Clinical Trial Management', 'Managing trial operations, ensuring data quality, and maintaining patient safety throughout clinical development.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Therapeutic Area MSL Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('therapeutic_area_leadership', 'therapeutic-area-leadership', 'Therapeutic Area Leadership', 'Provides leadership and guidance in a specific therapeutic area, leveraging deep clinical expertise.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Therapeutic Area MSL Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('msl_team_training', 'msl-team-training', 'MSL Team Training', 'Trains and educates Medical Science Liaison (MSL) teams on scientific and clinical aspects of a specific therapeutic area.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Therapeutic Area MSL Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_engagement_strategy_development', 'scientific-engagement-strategy-development', 'Scientific Engagement Strategy Development', 'Develops strategies for scientific engagement, including communication and collaboration with key opinion leaders and healthcare professionals.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Biostatistician
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_analysis_design', 'clinical-trial-analysis-design', 'Clinical Trial Analysis Design', 'Designs statistical analyses for clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Biostatistician
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_data_interpretation', 'clinical-data-interpretation', 'Clinical Data Interpretation', 'Interprets clinical data to draw meaningful conclusions', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Biostatistician
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('methodology_ensuring', 'methodology-ensuring', 'Methodology Ensuring', 'Ensures rigorous methodology in evidence generation', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Outcomes Research Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pro_study_design', 'pro-study-design', 'PRO Study Design', 'Design patient-reported outcomes studies to assess quality of life and patient-centered evidence.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Outcomes Research Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('outcome_measure_development', 'outcome-measure-development', 'Outcome Measure Development', 'Develop outcome measures for assessing patient-reported outcomes and quality of life.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Outcomes Research Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_centered_evidence_generation', 'patient-centered-evidence-generation', 'Patient-Centered Evidence Generation', 'Generate patient-centered evidence through the analysis of patient-reported outcomes and quality of life assessments.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Study Liaison
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_execution', 'clinical-trial-execution', 'Clinical Trial Execution', 'Supports the execution of clinical trials, ensuring all aspects run smoothly and according to plan.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Study Liaison
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('investigator_relationship_management', 'investigator-relationship-management', 'Investigator Relationship Management', 'Maintains and manages relationships with investigators involved in the clinical trials.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Study Liaison
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('study_startup_facilitation', 'study-startup-facilitation', 'Study Startup Facilitation', 'Facilitates the startup of new clinical studies, coordinating all necessary elements for a successful launch.', 'clinical', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Study Liaison
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('collaboration_ensuring', 'collaboration-ensuring', 'Ensuring Collaboration', 'Ensures smooth collaboration between all parties involved in the clinical trials.', 'clinical', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Monitor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_data_review', 'clinical-data-review', 'Clinical Data Review', 'Review and interpret clinical data to ensure patient safety and protocol compliance in clinical trials.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Monitor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('protocol_guidance_provision', 'protocol-guidance-provision', 'Protocol Guidance Provision', 'Provide guidance on clinical trial protocols to ensure adherence and compliance.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Monitor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_aspect_management', 'medical-aspect-management', 'Medical Aspect Management', 'Manage the medical aspects of clinical studies, including patient care, treatment plans, and safety measures.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Monitor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_safety_oversight', 'patient-safety-oversight', 'Patient Safety Oversight', 'Ensure patient safety by monitoring and managing potential risks in clinical trials.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Therapeutic Area Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('therapeutic_area_guidance', 'therapeutic-area-guidance', 'Therapeutic Area Guidance', 'Provides therapeutic area leadership and scientific guidance across medical affairs initiatives.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Therapeutic Area Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_strategy_planning', 'medical-strategy-planning', 'Medical Strategy Planning', 'Guides medical strategy and supports clinical development.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Therapeutic Area Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('internal_medical_expertise', 'internal-medical-expertise', 'Internal Medical Expertise', 'Serves as the internal medical expert within the organization.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Protocol Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('study_design_optimization', 'study-design-optimization', 'Study Design Optimization', 'Optimizes study designs to ensure the most effective and efficient clinical trials.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Protocol Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_rigor_ensurance', 'scientific-rigor-ensurance', 'Scientific Rigor Ensurance', 'Ensures that all study designs and protocols adhere to strict scientific rigor.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('endpoint_selection', 'endpoint-selection', 'Endpoint Selection', 'Selects appropriate endpoints for clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('sample_size_determination', 'sample-size-determination', 'Sample Size Determination', 'Determines the sample size required for a clinical trial', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Trial Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('statistical_analysis_advising', 'statistical-analysis-advising', 'Statistical Analysis Advising', 'Advises on the statistical analysis plans for clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Dosing Calculator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pk_based_dose_calculations', 'pk-based-dose-calculations', 'PK-Based Dose Calculations', 'Perform pharmacokinetic-based dose calculations to ensure appropriate medication dosing.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Geriatric Medication Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('geriatric_medication_optimization', 'geriatric-medication-optimization', 'Geriatric Medication Optimization', 'Provides evidence-based medication guidance, performs dosing calculations, and supports safe pharmacotherapy decisions for geriatric patients.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Geriatric Medication Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('geriatric_medication_deprescribing', 'geriatric-medication-deprescribing', 'Geriatric Medication Deprescribing', 'Assesses drug interactions and supports the safe discontinuation of unnecessary medications in geriatric patients.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Protocol Writer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_quality_ensuring', 'data-quality-ensuring', 'Data Quality Ensuring', 'Ensures the quality of data collected during clinical development', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Investigator-Initiated Study Reviewer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('iis_evaluation_support', 'iis-evaluation-support', 'IIS Evaluation and Support', 'Provides scientific support, engages key opinion leaders, develops publications, and generates medical evidence.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient-Reported Outcomes Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pro_instrument_development', 'pro-instrument-development', 'PRO Instrument Development', 'Design and develop patient-reported outcome (PRO) instruments for clinical trials.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Formulary Strategy Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('formulary_access_positioning', 'formulary-access-positioning', 'Formulary Access and Positioning', 'Specializes in formulary access and positioning, ensuring optimal placement and accessibility of medications.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Genotoxicity Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('genetic_toxicology_battery', 'genetic-toxicology-battery', 'Genetic Toxicology Battery', 'Specialize in Genetic toxicology battery to evaluate the genotoxic potential of pharmaceutical compounds', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Antibody-Drug Conjugate Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('adc_linker_optimization', 'adc-linker-optimization', 'ADC Linker Optimization', 'Optimizing the linker component of antibody-drug conjugates for improved efficacy and safety.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Antibody-Drug Conjugate Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('adc_payload_optimization', 'adc-payload-optimization', 'ADC Payload Optimization', 'Optimizing the payload component of antibody-drug conjugates for improved efficacy and safety.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Site Selection Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('site_feasibility_assessment', 'site-feasibility-assessment', 'Site Feasibility Assessment', 'Assess the feasibility of potential sites for clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Carcinogenicity Study Designer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('carcinogenicity_study_planning', 'carcinogenicity-study-planning', 'Carcinogenicity Study Planning', 'Designs and plans carcinogenicity studies for pharmaceutical products', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pharmacology Study Planner
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safe_pharmacotherapy_decisions', 'safe-pharmacotherapy-decisions', 'Safe Pharmacotherapy Decisions', 'Supports safe decisions related to pharmacotherapy', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: In Silico Clinical Trial Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('virtual_clinical_trial_modeling', 'virtual-clinical-trial-modeling', 'Virtual Clinical Trial Modeling', 'Designs clinical protocols, manages trial operations, ensures data quality, and maintains patient safety throughout clinical development.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: PROTAC Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('proteolysis_targeting_chimera_design', 'proteolysis-targeting-chimera-design', 'Proteolysis Targeting Chimera Design', 'Designs clinical protocols for proteolysis targeting chimera', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Biomarker Validation Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('biomarker_qualification_validation', 'biomarker-qualification-validation', 'Biomarker Qualification and Validation', 'Specializes in providing evidence-based medication guidance, performing dosing calculations, assessing drug interactions, and supporting safe pharmacotherapy decisions.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Immunotoxicology Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('immune_safety_assessment', 'immune-safety-assessment', 'Immune Safety Assessment', 'Specializes in immune safety assessments to evaluate the impact of pharmaceuticals on the immune system.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Informed Consent Developer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('informed_consent_form_creation', 'informed-consent-form-creation', 'Informed Consent Form Creation', 'Creates and optimizes informed consent forms for clinical trials', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Monitoring Plan Developer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('risk_based_monitoring_strategy_development', 'risk-based-monitoring-strategy-development', 'Risk-Based Monitoring Strategy Development', 'Develops risk-based monitoring strategies to ensure data quality and patient safety', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Real-World Evidence Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('rwe_study_design', 'rwe-study-design', 'Real-World Evidence Study Design', 'Designs clinical protocols for real-world evidence studies.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Geriatric Clinical Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('geriatric_clinical_trial_design', 'geriatric-clinical-trial-design', 'Geriatric Clinical Trial Design', 'Designs clinical protocols specifically for geriatric patients, manages trial operations, ensures data quality, and maintains patient safety throughout clinical development.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Geriatric Clinical Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('protocol_approval', 'protocol-approval', 'Protocol Approval', 'Ensures protocol approval rate is above 90%.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Geriatric Clinical Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_enrollment', 'patient-enrollment', 'Patient Enrollment', 'Manages patient enrollment to ensure a rate above 80%.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: In Vivo Model Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('animal_model_selection', 'animal-model-selection', 'Animal Model Selection', 'Specializes in selecting the appropriate animal model for pharmaceutical research and testing.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient Advocacy Relations
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_organization_engagement', 'patient-organization-engagement', 'Patient Organization Engagement', 'Engages with patient organizations to understand their needs and concerns, and to provide appropriate support.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Exosome Therapy Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('exosome_based_drug_delivery', 'exosome-based-drug-delivery', 'Exosome-Based Drug Delivery', 'Specializes in the clinical development of exosome-based drug delivery, including designing clinical protocols and managing trial operations.', 'clinical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Exosome Therapy Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_data_quality_management', 'clinical-trial-data-quality-management', 'Clinical Trial Data Quality Management', 'Ensures the quality of data collected during clinical trials, maintaining accuracy and integrity.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Exosome Therapy Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gcp_compliance', 'gcp-compliance', 'GCP Compliance', 'Strictly adheres to Good Clinical Practice (GCP) guidelines, ensuring no violations occur during the clinical development process.', 'clinical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- MARKET ACCESS CAPABILITIES (60 capabilities)
-- ============================================================================

-- Used by 2 agents: HEOR Director, Health Economics Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('economic_model_development', 'economic-model-development', 'Economic Model Development', 'Ability to develop economic models that demonstrate the value of a product for market access', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Evidence Synthesis Lead, Health Economics Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('hta_submission_support', 'hta-submission-support', 'HTA Submission Support', 'Provides support for HTA submissions by synthesizing relevant evidence', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: National Account Director, Payor Account Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_relationship_management', 'payer-relationship-management', 'Payer Relationship Management', 'Manage relationships with national payers to ensure optimal market access', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Market Access Operations Director, Medical Affairs Operations Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('process_optimization', 'process-optimization', 'Process Optimization', 'Ability to streamline and optimize market access processes to ensure efficiency and effectiveness.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Market Access Operations Director, Medical Affairs Operations Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cross_functional_coordination', 'cross-functional-coordination', 'Cross-Functional Coordination', 'Ability to coordinate and collaborate with various departments and teams to ensure smooth market access operations.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HEOR Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('outcomes_research_guidance', 'outcomes-research-guidance', 'Outcomes Research Guidance', 'Ability to guide outcomes research to support market access objectives', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HEOR Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('value_narrative_creation', 'value-narrative-creation', 'Value Narrative Creation', 'Ability to create compelling value narratives for payers and HTA bodies', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Health Economics Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cost_effectiveness_modeling', 'cost-effectiveness-modeling', 'Cost-Effectiveness Modeling', 'Develop robust economic models to analyze the cost-effectiveness of healthcare interventions.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Health Economics Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('budget_impact_analysis', 'budget-impact-analysis', 'Budget Impact Analysis', 'Conduct budget impact analyses to evaluate the financial impact of healthcare interventions on a budget.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Health Economics Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('economic_value_proposition_development', 'economic-value-proposition-development', 'Economic Value Proposition Development', 'Develop economic value propositions for payers to demonstrate the economic worth of healthcare interventions.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HTA Submission Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('hta_submission_preparation', 'hta-submission-preparation', 'HTA Submission Preparation', 'Prepares comprehensive health technology assessment submissions that meet agency requirements and demonstrate product value.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HTA Submission Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('reimbursement_submission_management', 'reimbursement-submission-management', 'Reimbursement Submission Management', 'Manages the process of preparing and submitting reimbursement requests for health technology assessments.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HTA Submission Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('value_dossier_management', 'value-dossier-management', 'Value Dossier Management', 'Manages value dossiers in the context of health technology assessment submissions.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Evidence Synthesis Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('systematic_review_conducting', 'systematic-review-conducting', 'Systematic Review Conducting', 'Conducts systematic reviews and meta-analyses in the pharmaceutical/medical device regulatory domain', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Evidence Synthesis Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('evidence_synthesis', 'evidence-synthesis', 'Evidence Synthesis', 'Creates comprehensive evidence syntheses that support market access objectives', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_engagement_strategy_development', 'payer-engagement-strategy-development', 'Payer Engagement Strategy Development', 'Develops and executes payer engagement strategies to optimize formulary access and coverage.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('formulary_placement_optimization', 'formulary-placement-optimization', 'Formulary Placement Optimization', 'Develops strategic approaches to optimize formulary placement and patient access.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_access_strategy_leadership', 'market-access-strategy-leadership', 'Market Access Strategy Leadership', 'Leads market access strategy for all payer segments.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: National Account Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('strategic_partnership_development', 'strategic-partnership-development', 'Strategic Partnership Development', 'Develop strategic partnerships with national accounts to secure favorable coverage and access', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: National Account Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_access_optimization', 'market-access-optimization', 'Market Access Optimization', 'Optimize market access through strategic partnerships and relationship management', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contracting Strategy Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('contract_strategy_development', 'contract-strategy-development', 'Contract Strategy Development', 'Develops and executes contracting strategies to optimize access and net pricing.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contracting Strategy Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('value_based_contract_design', 'value-based-contract-design', 'Value-Based Contract Design', 'Designs innovative value-based contracts.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contracting Strategy Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('negotiation_with_payers', 'negotiation-with-payers', 'Negotiation with Payers', 'Negotiates favorable terms with payers.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Formulary Access Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pt_process_management', 'pt-process-management', 'P&T Process Management', 'Manage and optimize P&T processes for optimal formulary placement.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Formulary Access Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('formulary_strategy_development', 'formulary-strategy-development', 'Formulary Strategy Development', 'Develop strategies for optimal product placement on payer formularies.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Formulary Access Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('formulary_negotiation_support', 'formulary-negotiation-support', 'Formulary Negotiation Support', 'Provide support and strategic input during formulary negotiations.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Value-Based Contracting Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('outcomes_based_contract_design', 'outcomes-based-contract-design', 'Outcomes-Based Contract Design', 'Designs innovative payment models and outcomes-based contracts that align stakeholder incentives.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Value-Based Contracting Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('risk_sharing_arrangement_creation', 'risk-sharing-arrangement-creation', 'Risk-Sharing Arrangement Creation', 'Creates risk-sharing arrangements with payers to ensure mutual benefits and minimized risks.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Value-Based Contracting Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_negotiation', 'payer-negotiation', 'Payer Negotiation', 'Negotiates with payers to establish beneficial agreements and contracts.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pricing_strategy_development', 'pricing-strategy-development', 'Pricing Strategy Development', 'Develop pricing strategies that maximize value while ensuring patient access.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('product_pricing_optimization', 'product-pricing-optimization', 'Product Pricing Optimization', 'Optimize product pricing across different markets while balancing access and profitability.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_analysis', 'market-analysis', 'Market Analysis', 'Analyze market trends and competitor pricing strategies to inform pricing decisions.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('profitability_analysis', 'profitability-analysis', 'Profitability Analysis', 'Evaluate the profitability of different pricing strategies and make adjustments as necessary.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Pricing Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('global_pricing_strategy_management', 'global-pricing-strategy-management', 'Global Pricing Strategy Management', 'Ability to manage and optimize global pricing strategies', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Pricing Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('reference_pricing_implications', 'reference-pricing-implications', 'Reference Pricing Implications', 'Understanding and managing the implications of reference pricing', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Pricing Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('access_implications_management', 'access-implications-management', 'Access Implications Management', 'Ability to manage the implications of access to various markets', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategy Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('coding_strategy_development', 'coding-strategy-development', 'Coding Strategy Development', 'Develops coding strategies that ensure appropriate product reimbursement', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategy Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('coverage_policy_optimization', 'coverage-policy-optimization', 'Coverage Policy Optimization', 'Optimizes coverage policies for optimal product reimbursement across all sites of care', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategy Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payment_optimization', 'payment-optimization', 'Payment Optimization', 'Ensures optimal payment for products across all sites of care', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Copay Program Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('financial_assistance_program_design', 'financial-assistance-program-design', 'Financial Assistance Program Design', 'Designs patient affordability programs to reduce out-of-pocket costs.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Copay Program Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('financial_assistance_program_management', 'financial-assistance-program-management', 'Financial Assistance Program Management', 'Manages and oversees the implementation of financial assistance programs.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Copay Program Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_cost_barrier_reduction', 'patient-cost-barrier-reduction', 'Patient Cost Barrier Reduction', 'Works to reduce patient cost barriers through the implementation of financial assistance programs.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Access Communications Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('value_narrative_development', 'value-narrative-development', 'Value Narrative Development', 'Develops compelling value narratives that effectively convey the benefits of a product', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Access Communications Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_communication_material_creation', 'payer-communication-material-creation', 'Payer Communication Material Creation', 'Creates engaging payer communication materials to highlight product value and access benefits', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Access Communications Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_access_strategy', 'market-access-strategy', 'Market Access Strategy', 'Develops strategies for market access, including pricing, reimbursement, and payer engagement', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Marketing Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_engagement_material_creation', 'payer-engagement-material-creation', 'Payer Engagement Material Creation', 'Develops targeted payer engagement materials to support account team effectiveness', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Marketing Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('account_support_tool_development', 'account-support-tool-development', 'Account Support Tool Development', 'Creates account support tools to enhance the effectiveness of the account team', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Marketing Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('marketing_content_creation', 'marketing-content-creation', 'Marketing Content Creation', 'Creates compelling marketing content targeted at payers', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Access Operations Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('system_management', 'system-management', 'System Management', 'Ability to manage and oversee various systems used in market access operations.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Access Analytics Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_access_insight_delivery', 'market-access-insight-delivery', 'Market Access Insight Delivery', 'Delivers actionable market access insights based on analysis of performance data.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Access Analytics Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('access_performance_analysis', 'access-performance-analysis', 'Access Performance Analysis', 'Analyzes access performance to provide intelligence for strategic decisions.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Access Analytics Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('strategic_decision_support', 'strategic-decision-support', 'Strategic Decision Support', 'Provides intelligence to support strategic decisions based on access performance analysis.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Health Economics Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cost_effectiveness_analysis', 'cost-effectiveness-analysis', 'Cost-Effectiveness Analysis', 'Conducts analyses to determine the cost-effectiveness of medical products', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Health Economics Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('value_proposition_creation', 'value-proposition-creation', 'Value Proposition Creation', 'Creates value propositions for market access of medical products', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('reimbursement_strategy_development', 'reimbursement-strategy-development', 'Reimbursement Strategy Development', 'Developing strategies for healthcare reimbursement and payment models.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cpt_hcpcs_coding_navigation', 'cpt-hcpcs-coding-navigation', 'CPT and HCPCS Coding Navigation', 'Navigating and understanding CPT and HCPCS coding systems.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('coverage_determination_support', 'coverage-determination-support', 'Coverage Determination Support', 'Supporting coverage determinations for digital health products.', 'market_access', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_value_proposition_building', 'payer-value-proposition-building', 'Payer Value Proposition Building', 'Building payer value propositions for digital health solutions.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Reimbursement Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('reimbursement_landscape_analysis', 'reimbursement-landscape-analysis', 'Reimbursement Landscape Analysis', 'Analyzes the reimbursement landscape for pharmaceutical products.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Payer Strategy Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('payer_engagement_strategy', 'payer-engagement-strategy', 'Payer Engagement Strategy', 'Specializes in engaging with payers and developing strategies for access to medication.', 'market_access', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- TECHNICAL CMC CAPABILITIES (42 capabilities)
-- ============================================================================

-- Used by 9 agents: GMP Compliance Advisor, Quality Systems Auditor, Supplier Quality Manager, ... (+6 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('deviation_investigation', 'deviation-investigation', 'Deviation Investigation', 'Investigates deviations in GMP compliance and takes necessary actions.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 9 agents: GMP Compliance Advisor, Quality Systems Auditor, Supplier Quality Manager, ... (+6 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('capa_system_management', 'capa-system-management', 'CAPA System Management', 'Manages Corrective and Preventive Action (CAPA) systems to prevent non-compliance and deviations.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 6 agents: GMP Compliance Advisor, Supplier Quality Manager, Quality Metrics Analyst, ... (+3 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gmp_compliance_ensuring', 'gmp-compliance-ensuring', 'GMP Compliance Ensuring', 'Ensures GMP compliance across operations, maintaining quality standards.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 6 agents: Contract Manufacturing Manager, ETL Developer, Returns & Recall Coordinator, ... (+3 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safety_protocol_adherence', 'safety-protocol-adherence', 'Safety Protocol Adherence', 'Ensuring adherence to safety protocols in all pharmaceutical operations', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 5 agents: Quality Systems Auditor, Document Control Specialist, CAPA Coordinator, ... (+2 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('quality_standard_maintenance', 'quality-standard-maintenance', 'Quality Standard Maintenance', 'Ability to maintain quality standards across operations, ensuring zero critical deviations and 100% GMP compliance.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Continuous Manufacturing Expert, Supply Chain Risk Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('provide_medication_guidance', 'provide-medication-guidance', 'Provide Medication Guidance', 'Provides evidence-based medication guidance to ensure safe and effective pharmacotherapy decisions.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Quality Assurance Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('qa_process_development', 'qa-process-development', 'QA Process Development', 'Develops quality assurance processes to ensure medical affairs activities meet quality standards and regulatory requirements.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Quality Assurance Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('conduct_medical_audits', 'conduct-medical-audits', 'Conduct Medical Audits', 'Conducts audits to ensure compliance with quality systems and regulatory requirements.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Quality Assurance Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('maintain_compliance_with_quality_systems', 'maintain-compliance-with-quality-systems', 'Maintain Compliance with Quality Systems', 'Maintains compliance with quality systems and regulatory requirements in medical affairs.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: formulation_development_scientist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('drug_product_formulation_development', 'drug-product-formulation-development', 'Drug Product Formulation Development', 'Specializes in the development of drug product formulations.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Validation Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ensure_gmp_compliance', 'ensure-gmp-compliance', 'Ensure GMP Compliance', 'The agent ensures Good Manufacturing Practice (GMP) compliance, maintaining quality standards across operations.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Validation Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('investigate_deviations', 'investigate-deviations', 'Investigate Deviations', 'The agent is capable of investigating any deviations in the validation process and taking corrective actions.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Validation Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('manage_capa_systems', 'manage-capa-systems', 'Manage CAPA Systems', 'The agent can manage Corrective and Preventive Action (CAPA) systems to ensure quality and safety.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Validation Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('validation_planning_execution', 'validation-planning-execution', 'Validation Planning and Execution', 'The agent is responsible for planning and executing validation processes to ensure quality and compliance.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: GMP Compliance Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gmp_compliance_training', 'gmp-compliance-training', 'GMP Compliance Training', 'Provides training on GMP compliance to ensure adherence to quality standards.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Quality Systems Auditor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('internal_audit_planning', 'internal-audit-planning', 'Internal Audit Planning', 'Ability to plan and organize internal audits to ensure GMP compliance and quality standards across operations.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Supplier Quality Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('supplier_qualification_oversight', 'supplier-qualification-oversight', 'Supplier Qualification Oversight', 'Specializes in supplier qualification and oversight to maintain quality standards.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Document Control Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gmp_compliance_ensurance', 'gmp-compliance-ensurance', 'GMP Compliance Ensurance', 'Ensuring Good Manufacturing Practice (GMP) compliance across operations', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Equipment Qualification Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('equipment_validation', 'equipment-validation', 'Equipment Validation', 'Specializes in validating the functionality and performance of pharmaceutical equipment', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Equipment Qualification Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('equipment_qualification', 'equipment-qualification', 'Equipment Qualification', 'Ensures that pharmaceutical equipment is qualified for its intended use', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Sterile Manufacturing Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('aseptic_processing', 'aseptic-processing', 'Aseptic Processing', 'Specializes in aseptic processing in pharmaceutical manufacturing to ensure sterility of products.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Sterile Manufacturing Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('sterilization', 'sterilization', 'Sterilization', 'Expert in sterilization techniques and procedures in the pharmaceutical industry.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contract Manufacturing Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cmo_relationship_management', 'cmo-relationship-management', 'CMO Relationship Management', 'Managing and overseeing relationships with Contract Manufacturing Organizations (CMOs)', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Quality Metrics Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('quality_kpi_tracking', 'quality-kpi-tracking', 'Quality KPI Tracking', 'Tracks and trends Key Performance Indicators (KPIs) related to quality assurance.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Materials Management Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('raw_material_planning', 'raw-material-planning', 'Raw Material Planning', 'The agent can plan and manage the raw materials required for pharmaceutical production.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Excipient Compatibility Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('excipient_selection_guidance', 'excipient-selection-guidance', 'Excipient Selection Guidance', 'Provides evidence-based guidance on the selection of excipients in pharmaceutical products', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Excipient Compatibility Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('excipient_compatibility_assessment', 'excipient-compatibility-assessment', 'Excipient Compatibility Assessment', 'Assesses the compatibility of selected excipients with other components of the pharmaceutical product', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Production Scheduler
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('manufacturing_schedule_optimization', 'manufacturing-schedule-optimization', 'Manufacturing Schedule Optimization', 'Optimizes the manufacturing schedule for pharmaceutical production.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Manufacturing Capacity Planner
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('production_capacity_planning', 'production-capacity-planning', 'Production Capacity Planning', 'The agent can plan and manage the production capacity in a pharmaceutical setting.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Scale-Up Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('commercial_scale_up_planning', 'commercial-scale-up-planning', 'Commercial Scale-Up Planning', 'The agent can plan the process of increasing the production of pharmaceutical products while maintaining quality and efficiency.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Scale-Up Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('execution_of_scale_up', 'execution-of-scale-up', 'Execution of Scale-Up', 'The agent can execute the scale-up process, ensuring that all steps are followed and any issues are resolved promptly.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Analytical Method Developer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('analytical_method_development', 'analytical-method-development', 'Analytical Method Development', 'Develops and validates analytical methods for pharmaceutical applications', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Drug Substance Characterization Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('api_physicochemical_characterization', 'api-physicochemical-characterization', 'API Physicochemical Characterization', 'Specializes in the physicochemical characterization of Active Pharmaceutical Ingredients (APIs)', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Continuous Manufacturing Expert
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('continuous_processing_implementation', 'continuous-processing-implementation', 'Continuous Processing Implementation', 'Specializes in the implementation of continuous processing in the pharmaceutical manufacturing environment.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Deviation Investigator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('root_cause_analysis', 'root-cause-analysis', 'Root Cause Analysis', 'Performs root cause analysis to identify the underlying cause of deviations and implement corrective actions.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Deviation Investigator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gmp_compliance_maintenance', 'gmp-compliance-maintenance', 'GMP Compliance Maintenance', 'Ensures 100% compliance with Good Manufacturing Practices (GMP) across operations.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Technology Transfer Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('technology_transfer_management', 'technology-transfer-management', 'Technology Transfer Management', 'Specialize in the process of transferring (disseminating) technology from the places and ingroups of its origination to wider distribution among more people and places.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Container Closure Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('packaging_system_development', 'packaging-system-development', 'Packaging System Development', 'Develops packaging systems for pharmaceutical products ensuring safety and efficiency.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Container Closure Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('validation_of_packaging_system', 'validation-of-packaging-system', 'Validation of Packaging System', 'Validates the developed packaging systems to ensure they meet all the required standards and regulations.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Lyophilization Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('freeze_drying_cycle_development', 'freeze-drying-cycle-development', 'Freeze-Drying Cycle Development', 'Specializes in the development of freeze-drying cycles for pharmaceutical applications', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Bioanalytical Method Developer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('bioanalytical_method_development', 'bioanalytical-method-development', 'Bioanalytical Method Development', 'Develop bioanalytical methods for pharmaceutical applications.', 'technical_cmc', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Cold Chain Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('temperature_controlled_logistics', 'temperature-controlled-logistics', 'Temperature Controlled Logistics', 'Specializes in the logistics of temperature-controlled pharmaceuticals, ensuring they are stored and transported safely and efficiently.', 'technical_cmc', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- STRATEGIC CAPABILITIES (22 capabilities)
-- ============================================================================

-- Used by 4 agents: Brand Strategy Director, FDA Guidance Interpreter, Regulatory Risk Assessment Specialist, ... (+1 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_compliance_ensuring', 'regulatory-compliance-ensuring', 'Regulatory Compliance Ensuring', 'Ensure all brand strategies and commercial plans comply with relevant pharmaceutical regulations.', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Policy & Advocacy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('healthcare_policy_shaping', 'healthcare-policy-shaping', 'Healthcare Policy Shaping', 'Shaping healthcare policy environment to improve patient access and market conditions.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Policy & Advocacy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_condition_optimization', 'market-condition-optimization', 'Market Condition Optimization', 'Optimizing market conditions through strategic policy initiatives.', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regional Medical Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regional_medical_strategy_development', 'regional-medical-strategy-development', 'Regional Medical Strategy Development', 'Develops and manages the medical strategy for a specific geographic region.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regional Medical Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('msl_team_management', 'msl-team-management', 'MSL Team Management', 'Leads and guides Medical Science Liaison (MSL) teams in their activities and initiatives.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regional Medical Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('stakeholder_relationship_management', 'stakeholder-relationship-management', 'Stakeholder Relationship Management', 'Maintains and manages strategic relationships with key stakeholders across the region.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Regional Medical Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regional_medical_plan_development', 'regional-medical-plan-development', 'Regional Medical Plan Development', 'Develops comprehensive medical plans for the region, ensuring alignment with overall strategy.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Affairs Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('strategic_medical_plan_development', 'strategic-medical-plan-development', 'Strategic Medical Plan Development', 'Develops and implements strategic medical plans aligned with business objectives and scientific priorities.', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Affairs Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cross_functional_collaboration', 'cross-functional-collaboration', 'Cross-Functional Collaboration', 'Drives cross-functional collaboration to ensure alignment of medical activities with business objectives.', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Affairs Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_affairs_initiative_leadership', 'medical-affairs-initiative-leadership', 'Medical Affairs Initiative Leadership', 'Leads medical affairs initiatives, ensuring they are in line with business objectives and scientific priorities.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Medical Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('global_medical_strategy_coordination', 'global-medical-strategy-coordination', 'Global Medical Strategy Coordination', 'Coordinate global medical strategies and ensure consistency across different regions', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Medical Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regional_alignment_ensuring', 'regional-alignment-ensuring', 'Regional Alignment Ensuring', 'Ensure alignment of medical strategies and initiatives across different regions', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Global Medical Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('global_kol_relationship_management', 'global-kol-relationship-management', 'Global KOL Relationship Management', 'Manage relationships with key opinion leaders (KOLs) on a global scale', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Brand Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('brand_strategy_development', 'brand-strategy-development', 'Brand Strategy Development', 'Develop comprehensive brand positioning and lifecycle strategies to maximize market positioning and competitive advantage.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Brand Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('commercial_plan_execution', 'commercial-plan-execution', 'Commercial Plan Execution', 'Execute long-term commercial plans to enhance commercial performance.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Digital Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('omnichannel_strategy_development', 'omnichannel-strategy-development', 'Omnichannel Strategy Development', 'Develops comprehensive omnichannel strategies that optimize customer experiences and drive digital engagement in the pharmaceutical sector.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Digital Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('digital_transformation_oversight', 'digital-transformation-oversight', 'Digital Transformation Oversight', 'Oversees digital transformation initiatives in pharmaceutical marketing, ensuring alignment with overall business goals and compliance with healthcare regulations.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Digital Strategy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_driven_marketing_enablement', 'data-driven-marketing-enablement', 'Data-Driven Marketing Enablement', 'Enables data-driven marketing strategies that leverage customer data to improve engagement and drive business growth in the pharmaceutical sector.', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Omnichannel Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('multi_channel_marketing_coordination', 'multi-channel-marketing-coordination', 'Multi-Channel Marketing Coordination', 'Specializes in coordinating marketing efforts across multiple channels in the pharmaceutical industry.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Omnichannel Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('safe_pharmacotherapy_decisions_support', 'safe-pharmacotherapy-decisions-support', 'Safe Pharmacotherapy Decisions Support', 'Supports safe pharmacotherapy decisions, ensuring no off-label uses without clear evidence and no overriding of prescriber authority.', 'strategic', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Product Launch Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('commercial_launch_planning', 'commercial-launch-planning', 'Commercial Launch Planning', 'Specializes in planning for the commercial launch of pharmaceutical products.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Product Launch Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('execution_of_launch_strategy', 'execution-of-launch-strategy', 'Execution of Launch Strategy', 'Executes the planned strategy for the commercial launch of pharmaceutical products.', 'strategic', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- OPERATIONAL CAPABILITIES (51 capabilities)
-- ============================================================================

-- Used by 6 agents: Congress Planning Specialist, Medical Science Liaison Coordinator, Evidence Generation Planner, ... (+3 more)
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_evidence_generation', 'medical-evidence-generation', 'Medical Evidence Generation', 'Generates medical evidence in support of scientific research and publications.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Prior Authorization Manager, Policy & Advocacy Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_access_improvement', 'patient-access-improvement', 'Patient Access Improvement', 'Develops strategies to improve patient access to necessary medical treatments and services.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient Access Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_support_program_design', 'patient-support-program-design', 'Patient Support Program Design', 'Designs comprehensive patient support programs to ensure therapy access', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient Access Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('therapy_access_implementation', 'therapy-access-implementation', 'Therapy Access Implementation', 'Implements programs that eliminate barriers and ensure patients can access and afford therapy', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient Access Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_centric_leadership', 'patient-centric-leadership', 'Patient-Centric Leadership', 'Leads initiatives with a focus on patient needs and access to care', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Hub Services Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('hub_vendor_management', 'hub-vendor-management', 'Hub Vendor Management', 'Oversees and manages hub vendors to ensure seamless patient support services', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Hub Services Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('service_optimization', 'service-optimization', 'Service Optimization', 'Optimizes services to ensure efficient and effective patient support', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Hub Services Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_experience_management', 'patient-experience-management', 'Patient Experience Management', 'Ensures excellent patient experience in therapy initiation and continuation', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Prior Authorization Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('prior_authorization_process_optimization', 'prior-authorization-process-optimization', 'Prior Authorization Process Optimization', 'Streamlines and optimizes prior authorization processes to improve approval rates and reduce patient wait times.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Prior Authorization Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('approval_rate_increase', 'approval-rate-increase', 'Approval Rate Increase', 'Works to increase the approval rates for prior authorizations, ensuring patients receive the care they need in a timely manner.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient Access Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_navigation_support', 'patient-navigation-support', 'Patient Navigation Support', 'Helps patients navigate access challenges and connect with appropriate resources', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Patient Access Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('therapy_initiation_guidance', 'therapy-initiation-guidance', 'Therapy Initiation Guidance', 'Guides patients to ensure smooth therapy initiation', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Field Medical Trainer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('msl_training_program_design', 'msl-training-program-design', 'MSL Training Program Design', 'Designs and develops training programs for Medical Science Liaisons (MSLs) to ensure they have the necessary knowledge and skills for success.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Field Medical Trainer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('competency_assessment', 'competency-assessment', 'Competency Assessment', 'Assesses the competencies of MSLs to identify areas of improvement and ensure field medical excellence.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Field Medical Trainer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('new_member_onboarding', 'new-member-onboarding', 'New Member Onboarding', 'Responsible for the onboarding and training of new team members to ensure they are equipped with the necessary skills and knowledge.', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Content Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_content_management', 'medical-content-management', 'Medical Content Management', 'Manage and strategize medical information assets and digital content', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Content Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('knowledge_management_systems', 'knowledge-management-systems', 'Knowledge Management Systems', 'Oversee and maintain knowledge management systems related to medical content', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Content Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('content_governance', 'content-governance', 'Content Governance', 'Ensure the governance and compliance of medical content', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Content Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('digital_platform_management', 'digital-platform-management', 'Digital Platform Management', 'Manage digital platforms that host and distribute medical content', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Education Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cme_program_development', 'cme-program-development', 'CME Program Development', 'Developing continuing medical education programs that advance clinical knowledge and improve patient care.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Education Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('educational_curriculum_design', 'educational-curriculum-design', 'Educational Curriculum Design', 'Designing educational curricula for medical professionals.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Education Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('faculty_relationship_management', 'faculty-relationship-management', 'Faculty Relationship Management', 'Managing relationships with faculty involved in the education programs.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Education Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('accme_compliance_ensuring', 'accme-compliance-ensuring', 'ACCME Compliance Ensuring', 'Ensuring compliance with ACCME standards for medical education programs.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Education Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('educational_outcome_measurement', 'educational-outcome-measurement', 'Educational Outcome Measurement', 'Measuring the outcomes of the educational programs to ensure effectiveness.', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Congress & Events Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_event_logistics_management', 'medical-event-logistics-management', 'Medical Event Logistics Management', 'Manage logistics for medical congress participation and scientific meetings.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Congress & Events Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('vendor_relationship_management', 'vendor-relationship-management', 'Vendor Relationship Management', 'Manage relationships with vendors to ensure successful execution of medical events.', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Congress & Events Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_event_execution', 'medical-event-execution', 'Medical Event Execution', 'Ensure successful execution of medical congresses, symposia, and scientific meetings.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Excellence Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_affairs_optimization', 'medical-affairs-optimization', 'Medical Affairs Optimization', 'Driving best practices and quality in medical affairs, developing excellence frameworks, and implementing quality initiatives.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Excellence Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('quality_framework_implementation', 'quality-framework-implementation', 'Quality Framework Implementation', 'Developing and implementing quality frameworks to ensure excellence in medical affairs.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Excellence Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('continuous_improvement_initiatives', 'continuous-improvement-initiatives', 'Continuous Improvement Initiatives', 'Leading continuous improvement initiatives to enhance the quality and efficiency of medical affairs.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Review Committee Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_review_process_management', 'medical-review-process-management', 'Medical Review Process Management', 'Manage and coordinate medical review processes ensuring compliance with medical standards.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Review Committee Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('approval_workflow_management', 'approval-workflow-management', 'Approval Workflow Management', 'Manage approval workflows for medical review processes.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Review Committee Coordinator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('committee_coordination', 'committee-coordination', 'Committee Coordination', 'Coordinate review committees involved in medical review processes.', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Affairs Operations Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('budget_management', 'budget-management', 'Budget Management', 'Ability to manage and allocate budgets effectively for medical affairs initiatives.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Affairs Operations Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('resource_coordination', 'resource-coordination', 'Resource Coordination', 'Ability to coordinate resources and ensure their effective use in medical affairs operations.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Brand Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('integrated_marketing_campaign_execution', 'integrated-marketing-campaign-execution', 'Integrated Marketing Campaign Execution', 'Executes integrated marketing campaigns that drive brand performance in the pharmaceutical sector.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Brand Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cross_functional_team_coordination', 'cross-functional-team-coordination', 'Cross-Functional Team Coordination', 'Coordinates cross-functional teams for effective campaign execution and brand management.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Brand Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('promotional_activities_optimization', 'promotional-activities-optimization', 'Promotional Activities Optimization', 'Optimizes promotional activities within compliance guardrails in the pharmaceutical marketing domain.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Brand Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('day_to_day_brand_management', 'day-to-day-brand-management', 'Day-to-Day Brand Management', 'Manages the day-to-day performance of a brand, ensuring its growth and success.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Workflow Orchestration Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('multi_agent_workflow_coordination', 'multi-agent-workflow-coordination', 'Multi-Agent Workflow Coordination', 'Coordinates and manages multi-agent workflows, ensuring smooth operation and task completion', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Workflow Orchestration Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('task_dependency_management', 'task-dependency-management', 'Task Dependency Management', 'Manages task dependencies within the workflow, ensuring tasks are executed in the correct order', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Workflow Orchestration Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('error_recovery_handling', 'error-recovery-handling', 'Error Recovery Handling', 'Handles error recovery within the workflow, ensuring any issues are promptly addressed and resolved', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Project Coordination Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('cross_functional_project_management', 'cross-functional-project-management', 'Cross-Functional Project Management', 'Manages and coordinates cross-functional project activities to ensure timely and efficient project execution', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Project Coordination Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('stakeholder_communication_management', 'stakeholder-communication-management', 'Stakeholder Communication Management', 'Manages communications with stakeholders, ensuring all parties are informed and engaged', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Project Coordination Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('deliverable_tracking', 'deliverable-tracking', 'Deliverable Tracking', 'Tracks project deliverables to ensure they are completed on time and meet project requirements', 'operational', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Congress Planning Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_congress_strategy_planning', 'medical-congress-strategy-planning', 'Medical Congress Strategy and Planning', 'Specializes in planning and strategizing for medical congresses, including scientific support and engagement with key opinion leaders.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Transportation Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('logistics_and_transportation_coordination', 'logistics-and-transportation-coordination', 'Logistics and Transportation Coordination', 'Coordinates logistics and transportation for pharmaceutical products ensuring timely and safe delivery.', 'operational', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Supply Chain Risk Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('manage_supply_chain_risks', 'manage-supply-chain-risks', 'Manage Supply Chain Risks', 'Specializes in supply chain resilience and continuity, ensuring the steady supply of pharmaceutical products.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Warehouse Operations Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('warehousing_optimization', 'warehousing-optimization', 'Warehousing Optimization', 'Optimizes warehouse operations to ensure efficient storage and distribution of pharmaceutical products.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Procurement Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('strategic_sourcing', 'strategic-sourcing', 'Strategic Sourcing', 'Identify, evaluate and harness business opportunities for the procurement of pharmaceutical products.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Procurement Strategist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('procurement_strategy', 'procurement-strategy', 'Procurement Strategy', 'Develop and implement effective procurement strategies that align with company objectives.', 'operational', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- ANALYTICAL CAPABILITIES (54 capabilities)
-- ============================================================================

-- Used by 3 agents: Market Access Data Analyst, Site Selection Advisor, Geriatric Clinical Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_quality_maintenance', 'data-quality-maintenance', 'Data Quality Maintenance', 'Ensures the quality and accuracy of market access data', 'analytical', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 2 agents: Outcomes Research Specialist, Real-World Evidence Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('real_world_evidence_study_design', 'real-world-evidence-study-design', 'Real World Evidence Study Design', 'Designs studies based on real-world evidence to demonstrate clinical and economic value.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Outcomes Research Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('comparative_effectiveness_research', 'comparative-effectiveness-research', 'Comparative Effectiveness Research', 'Conducts comparative effectiveness research for value demonstration.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Outcomes Research Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_reported_outcome_analysis', 'patient-reported-outcome-analysis', 'Patient Reported Outcome Analysis', 'Analyzes patient-reported outcomes to evaluate the effectiveness of medical interventions.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HEOR Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('economic_modeling', 'economic-modeling', 'Economic Modeling', 'Supports the development of economic models for health outcomes research', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HEOR Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_analysis', 'data-analysis', 'Data Analysis', 'Analyzes data related to health economics and outcomes research', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HEOR Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('value_demonstration', 'value-demonstration', 'Value Demonstration', 'Provides analytical support for demonstrating the value of health interventions', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: HEOR Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('evidence_generation', 'evidence-generation', 'Evidence Generation', 'Supports the generation of evidence for health economics and outcomes research', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contract Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('contract_performance_analysis', 'contract-performance-analysis', 'Contract Performance Analysis', 'Analyze contract performance to identify areas of improvement and ensure optimal operations.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contract Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_monitoring', 'compliance-monitoring', 'Compliance Monitoring', 'Monitor contract compliance to ensure adherence to all terms and conditions.', 'analytical', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Contract Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('contract_insight_generation', 'contract-insight-generation', 'Contract Insight Generation', 'Generate insights from contract analysis to inform optimization strategies.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('competitive_analysis', 'competitive-analysis', 'Competitive Analysis', 'Analyzes the pricing strategies of competitors to inform pricing decisions.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('elasticity_modeling', 'elasticity-modeling', 'Elasticity Modeling', 'Models the elasticity of demand in relation to changes in price to predict consumer behavior.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Pricing Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('price_optimization', 'price-optimization', 'Price Optimization', 'Optimizes pricing strategies based on analysis and modeling to maximize profitability.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Gross-to-Net Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('revenue_deduction_management', 'revenue-deduction-management', 'Revenue Deduction Management', 'Manages revenue deductions to ensure optimal gross-to-net ratios.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Gross-to-Net Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('discount_trend_analysis', 'discount-trend-analysis', 'Discount Trend Analysis', 'Analyzes discount trends to identify potential areas of improvement.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Gross-to-Net Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('gross_to_net_optimization', 'gross-to-net-optimization', 'Gross to Net Optimization', 'Identifies and implements strategies to optimize gross-to-net ratios.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Access Data Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_access_data_analysis', 'market-access-data-analysis', 'Market Access Data Analysis', 'Analyzes market access data to identify trends and provide insights for decision making', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Access Data Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('report_generation', 'report-generation', 'Report Generation', 'Generates comprehensive reports based on market access data analysis', 'analytical', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Librarian
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_literature_surveillance', 'medical-literature-surveillance', 'Medical Literature Surveillance', 'The agent can manage and monitor medical literature, ensuring that all relevant and recent information is captured and organized effectively.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Librarian
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('database_management', 'database-management', 'Database Management', 'The agent is capable of managing and organizing database resources, ensuring that all information is easily accessible and up-to-date.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Librarian
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('research_assistance', 'research-assistance', 'Research Assistance', 'The agent can provide research support for medical affairs teams, assisting in the collection and analysis of relevant data.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Real-World Evidence Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('healthcare_database_analysis', 'healthcare-database-analysis', 'Healthcare Database Analysis', 'Analyzes healthcare databases to extract relevant data for studies', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Real-World Evidence Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('product_value_evidence_development', 'product-value-evidence-development', 'Product Value Evidence Development', 'Develops evidence to support product value propositions based on real-world data', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Epidemiologist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('epidemiological_research_conduct', 'epidemiological-research-conduct', 'Epidemiological Research Conduct', 'Conducts research to study disease patterns and population health.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Epidemiologist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('disease_burden_assessment', 'disease-burden-assessment', 'Disease Burden Assessment', 'Assesses the burden of diseases on the population.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Epidemiologist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_strategy_insights', 'medical-strategy-insights', 'Medical Strategy Insights', 'Provides insights for medical strategy based on epidemiological trends and risk factors.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Data Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_data_management', 'clinical-trial-data-management', 'Clinical Trial Data Management', 'Managing databases and ensuring data quality and integrity in clinical trials.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Data Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_standards_compliance', 'data-standards-compliance', 'Data Standards Compliance', 'Ensuring compliance of clinical trial data with regulatory standards.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Data Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('support_data_analysis', 'support-data-analysis', 'Support Data Analysis', 'Providing support in data analysis related to clinical trials.', 'analytical', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Marketing Analytics Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('marketing_data_analysis', 'marketing-data-analysis', 'Marketing Data Analysis', 'Transforms marketing data into actionable insights that drive decision-making and optimize marketing mix.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Marketing Analytics Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('roi_measurement', 'roi-measurement', 'ROI Measurement', 'Measures the return on investment of marketing strategies to ensure effectiveness.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Marketing Analytics Director
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('predictive_marketing_strategy', 'predictive-marketing-strategy', 'Predictive Marketing Strategy', 'Enables the development of predictive marketing strategies based on data analysis.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Data Analyst Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_trial_data_analysis', 'clinical-trial-data-analysis', 'Clinical Trial Data Analysis', 'Ability to analyze and interpret data from clinical trials', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Data Analyst Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('trend_identification', 'trend-identification', 'Trend Identification', 'Ability to identify trends and patterns in clinical trial data', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Clinical Data Analyst Agent
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('insight_generation', 'insight-generation', 'Insight Generation', 'Ability to generate actionable insights based on the analysis of clinical trial data', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Literature Researcher
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_database_search', 'medical-database-search', 'Medical Database Search', 'Searches medical databases for relevant literature and studies', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Literature Researcher
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('literature_retrieval', 'literature-retrieval', 'Literature Retrieval', 'Retrieves the found medical literature and studies', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Literature Researcher
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('findings_synthesis', 'findings-synthesis', 'Findings Synthesis', 'Synthesizes the findings from the retrieved literature and studies', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Research Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('market_intelligence_analysis', 'market-intelligence-analysis', 'Market Intelligence Analysis', 'Provide evidence-based medication guidance, perform dosing calculations, assess drug interactions, and support safe pharmacotherapy decisions.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Research Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('pharmaceutical_market_sizing', 'pharmaceutical-market-sizing', 'Pharmaceutical Market Sizing', 'Perform market sizing for pharmaceutical products, understanding the potential market share and growth opportunities.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Market Research Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medication_safety_assessment', 'medication-safety-assessment', 'Medication Safety Assessment', 'Assess the safety of pharmacotherapy decisions, ensuring no medication errors and full regulatory compliance.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Machine Learning Engineer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ml_model_development', 'ml-model-development', 'Machine Learning Model Development', 'Develops machine learning models for healthcare applications, particularly in the pharmaceutical domain.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Data Visualization Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('interactive_dashboard_development', 'interactive-dashboard-development', 'Interactive Dashboard Development', 'Designs and develops interactive dashboards for pharmaceutical data visualization.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: ETL Developer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_pipeline_development', 'data-pipeline-development', 'Data Pipeline Development', 'Develops and automates data pipelines for pharmaceutical data processing', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Affairs Metrics Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_affairs_kpi_tracking', 'medical-affairs-kpi-tracking', 'Medical Affairs KPI Tracking', 'Specializes in tracking and analyzing key performance indicators in medical affairs.', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Demand Forecaster
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('demand_planning_and_forecasting', 'demand-planning-and-forecasting', 'Demand Planning and Forecasting', 'Specialize in demand planning and forecasting to ensure adequate supply of medications', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Territory Design Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('sales_territory_optimization', 'sales-territory-optimization', 'Sales Territory Optimization', 'Optimizes sales territories to maximize efficiency and effectiveness', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Evidence Synthesis Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('meta_analysis_and_systematic_review', 'meta-analysis-and-systematic-review', 'Meta-Analysis and Systematic Review', 'Perform meta-analysis and systematic review to synthesize evidence from multiple studies.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Customer Insights Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('customer_research_and_segmentation', 'customer-research-and-segmentation', 'Customer Research and Segmentation', 'Specialize in customer research and segmentation in the pharmaceutical field.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: AI/ML Model Validator
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('ai_model_validation', 'ai-model-validation', 'AI Model Validation', 'Specializes in validating AI models in the pharmaceutical domain, ensuring their accuracy and reliability.', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Competitive Intelligence Specialist
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('competitor_analysis', 'competitor-analysis', 'Competitor Analysis', 'Analyze and track competitors in the pharmaceutical industry', 'analytical', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Supply Planning Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('supply_demand_balance_optimization', 'supply-demand-balance-optimization', 'Supply-Demand Balance Optimization', 'Optimizes the balance between supply and demand in the pharmaceutical industry', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Data Quality Analyst
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('data_quality_monitoring', 'data-quality-monitoring', 'Data Quality Monitoring', 'Monitors and validates the quality of data', 'analytical', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


-- ============================================================================
-- COMMUNICATION CAPABILITIES (21 capabilities)
-- ============================================================================

-- Used by 2 agents: Medical Science Liaison Advisor, Investigator-Initiated Study Reviewer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('kol_engagement', 'kol-engagement', 'KOL Engagement', 'Expert in engaging with Key Opinion Leaders (KOLs) in the medical field to gather and exchange scientific knowledge.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Science Liaison Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('hcp_education_strategy', 'hcp-education-strategy', 'Healthcare Provider Education Strategy', 'Provides strategic guidance on educating healthcare providers about medical science, ensuring optimal understanding and application of scientific knowledge.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Science Liaison Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_insights_gathering', 'clinical-insights-gathering', 'Clinical Insights Gathering', 'Specializes in gathering clinical insights from the field, aiding in the development of medical strategies and improving patient care.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Science Liaison Advisor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_exchange', 'scientific-exchange', 'Scientific Exchange', 'Facilitates compliant scientific discussions, ensuring accurate and ethical exchange of medical and scientific information.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Publication Strategy Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_publication_planning', 'scientific-publication-planning', 'Scientific Publication Planning', 'Ability to guide and execute the strategy for scientific publication, including journal selection and author engagement.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Publication Strategy Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('author_engagement', 'author-engagement', 'Author Engagement', 'Expertise in engaging with authors and ensuring their active participation in the publication process.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Publication Strategy Lead
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_with_icmje_gpp', 'compliance-with-icmje-gpp', 'Compliance with ICMJE and GPP Guidelines', 'Ensuring that the publication process complies with the International Committee of Medical Journal Editors (ICMJE) and Good Publication Practice (GPP) guidelines.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer - Scientific
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_manuscript_creation', 'scientific-manuscript-creation', 'Scientific Manuscript Creation', 'Ability to create high-quality scientific manuscripts ensuring scientific accuracy and compliance with publication guidelines.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer - Scientific
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('abstracts_and_posters_creation', 'abstracts-and-posters-creation', 'Abstracts and Posters Creation', 'Ability to create abstracts and posters for scientific publications.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer - Scientific
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('peer_reviewed_publications', 'peer-reviewed-publications', 'Peer-Reviewed Publications', 'Specializes in writing for peer-reviewed publications.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Communications Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_communication_strategy_development', 'medical-communication-strategy-development', 'Medical Communication Strategy Development', 'Expert in developing and executing medical communication strategies for internal and external stakeholders.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Communications Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_content_creation', 'medical-content-creation', 'Medical Content Creation', 'Responsible for strategic medical content development and creating compelling medical narratives.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Communications Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('congress_activities_management', 'congress-activities-management', 'Congress Activities Management', 'Manages congress activities related to medical communications.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Communications Manager
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('message_consistency_ensuring', 'message-consistency-ensuring', 'Message Consistency Ensuring', 'Ensures consistency of medical communications messages across various platforms and stakeholders.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Editor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('medical_content_review', 'medical-content-review', 'Medical Content Review', 'Review medical content for accuracy, clarity, and consistency.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Editor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('compliance_with_style_guidelines', 'compliance-with-style-guidelines', 'Compliance with Style Guidelines', 'Ensure medical content complies with style guidelines.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Editor
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('editorial_excellence_ensuring', 'editorial-excellence-ensuring', 'Editorial Excellence Ensuring', 'Ensure the editorial excellence of all medical content and publications.', 'communication', 'expert', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('regulatory_document_writing', 'regulatory-document-writing', 'Regulatory Document Writing', 'Ability to write clear, accurate, and compliant regulatory documents for healthcare.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('clinical_study_report_preparation', 'clinical-study-report-preparation', 'Clinical Study Report Preparation', 'Expertise in preparing detailed and accurate clinical study reports.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('scientific_manuscript_drafting', 'scientific-manuscript-drafting', 'Scientific Manuscript Drafting', 'Skill in drafting scientific manuscripts with precision and clarity.', 'communication', 'advanced', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;

-- Used by 1 agents: Medical Writer
INSERT INTO capabilities (capability_name, capability_slug, display_name, description, category, complexity_level, is_active)
VALUES ('patient_material_creation', 'patient-material-creation', 'Patient Material Creation', 'Proficiency in creating patient materials that meet regulatory and publication standards.', 'communication', 'intermediate', true)
ON CONFLICT (capability_name) DO UPDATE SET
    description = EXCLUDED.description,
    complexity_level = EXCLUDED.complexity_level,
    is_active = EXCLUDED.is_active;


COMMIT;

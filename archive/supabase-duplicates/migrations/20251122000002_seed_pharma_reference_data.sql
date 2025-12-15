-- =====================================================================
-- ROLE ENRICHMENT - SEED PHARMACEUTICAL REFERENCE DATA
-- Date: 2025-11-22
-- Purpose: Populate reference tables with pharma/biotech master data
-- Depends on: 20251122000001_role_enrichment_phase1_foundation.sql
-- =====================================================================

BEGIN;

-- =====================================================================
-- 1. SEED REGULATORY FRAMEWORKS
-- =====================================================================

RAISE NOTICE 'Seeding regulatory frameworks...';

INSERT INTO regulatory_frameworks (name, framework_type, region, authority, description, url, effective_date) VALUES
    -- FDA Regulations (US)
    ('FDA 21 CFR Part 11', 'compliance', 'US', 'FDA', 'Electronic records and electronic signatures requirements', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11', '1997-08-20'),
    ('FDA 21 CFR Part 50', 'compliance', 'US', 'FDA', 'Protection of Human Subjects in clinical investigations', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-50', NULL),
    ('FDA 21 CFR Part 54', 'compliance', 'US', 'FDA', 'Financial Disclosure by Clinical Investigators', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-54', NULL),
    ('FDA 21 CFR Part 56', 'compliance', 'US', 'FDA', 'Institutional Review Boards (IRBs)', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-56', NULL),
    ('FDA 21 CFR Part 312', 'submission', 'US', 'FDA', 'Investigational New Drug (IND) Application', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312', NULL),
    ('FDA 21 CFR Part 314', 'submission', 'US', 'FDA', 'New Drug Application (NDA)', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-314', NULL),
    ('FDA 21 CFR Part 210', 'quality', 'US', 'FDA', 'Current Good Manufacturing Practice in Manufacturing, Processing, Packing, or Holding of Drugs', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-210', NULL),
    ('FDA 21 CFR Part 211', 'quality', 'US', 'FDA', 'Current Good Manufacturing Practice for Finished Pharmaceuticals', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211', NULL),

    -- ICH Guidelines (Global)
    ('ICH E6(R3) GCP', 'compliance', 'Global', 'ICH', 'Good Clinical Practice guideline (latest revision)', 'https://www.ich.org/page/efficacy-guidelines', '2023-09-08'),
    ('ICH E2A Clinical Safety', 'safety', 'Global', 'ICH', 'Clinical Safety Data Management: Definitions and Standards for Expedited Reporting', 'https://www.ich.org/page/efficacy-guidelines', NULL),
    ('ICH E2B Pharmacovigilance', 'safety', 'Global', 'ICH', 'Transmission of Individual Case Safety Reports', 'https://www.ich.org/page/efficacy-guidelines', NULL),
    ('ICH E2E Pharmacovigilance Planning', 'safety', 'Global', 'ICH', 'Pharmacovigilance Planning', 'https://www.ich.org/page/efficacy-guidelines', NULL),
    ('ICH E3 Clinical Study Reports', 'submission', 'Global', 'ICH', 'Structure and Content of Clinical Study Reports', 'https://www.ich.org/page/efficacy-guidelines', NULL),
    ('ICH E9 Statistical Principles', 'compliance', 'Global', 'ICH', 'Statistical Principles for Clinical Trials', 'https://www.ich.org/page/efficacy-guidelines', NULL),
    ('ICH M4 CTD', 'submission', 'Global', 'ICH', 'Common Technical Document (CTD) for registration of pharmaceuticals', 'https://www.ich.org/page/multidisciplinary-guidelines', NULL),
    ('ICH Q9 Quality Risk Management', 'quality', 'Global', 'ICH', 'Quality Risk Management', 'https://www.ich.org/page/quality-guidelines', NULL),
    ('ICH Q10 Pharmaceutical Quality System', 'quality', 'Global', 'ICH', 'Pharmaceutical Quality System', 'https://www.ich.org/page/quality-guidelines', NULL),

    -- EMA Regulations (EU)
    ('EMA Clinical Trial Regulation (EU CTR)', 'submission', 'EU', 'EMA', 'Regulation on clinical trials on medicinal products for human use', 'https://www.ema.europa.eu/en/human-regulatory/research-development/clinical-trials', '2022-01-31'),
    ('EMA GMP Annex 11', 'compliance', 'EU', 'EMA', 'Computerized Systems in GMP environments', 'https://www.ema.europa.eu/en/human-regulatory/research-development/compliance/good-manufacturing-practice', NULL),
    ('EMA Pharmacovigilance Directive 2010/84/EU', 'safety', 'EU', 'EMA', 'Pharmacovigilance requirements for medicinal products', 'https://www.ema.europa.eu/en/human-regulatory/post-authorisation/pharmacovigilance', NULL),

    -- Other Important Frameworks
    ('HIPAA Privacy Rule', 'compliance', 'US', 'HHS', 'Health Insurance Portability and Accountability Act - Privacy standards', 'https://www.hhs.gov/hipaa/for-professionals/privacy/index.html', NULL),
    ('GDPR (EU)', 'compliance', 'EU', 'EU Parliament', 'General Data Protection Regulation - data privacy requirements', 'https://gdpr-info.eu/', '2018-05-25'),
    ('Sarbanes-Oxley Act (SOX)', 'compliance', 'US', 'SEC', 'Corporate financial reporting and accountability requirements', NULL, '2002-07-30')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- 2. SEED GxP TRAINING MODULES
-- =====================================================================

RAISE NOTICE 'Seeding GxP training modules...';

INSERT INTO gxp_training_modules (module_name, gxp_category, training_duration_hours, renewal_frequency_months, description, learning_objectives) VALUES
    -- GCP Training
    ('GCP Fundamentals', 'GCP', 8, 24, 'Introduction to Good Clinical Practice principles and ICH E6(R3) requirements', ARRAY[
        'Understand ethical principles of clinical research',
        'Know regulatory requirements for clinical trials',
        'Understand roles and responsibilities of trial personnel',
        'Apply ICH-GCP principles in daily work'
    ]),
    ('Advanced GCP for Clinical Research Coordinators', 'GCP', 12, 24, 'In-depth GCP training for site-level research coordinators', ARRAY[
        'Master informed consent process',
        'Implement source document best practices',
        'Manage protocol deviations and amendments',
        'Conduct quality self-assessments'
    ]),
    ('GCP for Investigators', 'GCP', 6, 24, 'GCP training tailored for Principal Investigators', ARRAY[
        'Understand investigator responsibilities per ICH-GCP',
        'Oversee clinical trial conduct at site',
        'Ensure patient safety and rights',
        'Collaborate with sponsors and monitors'
    ]),

    -- GMP Training
    ('GMP Fundamentals', 'GMP', 6, 12, 'Introduction to Good Manufacturing Practice for pharmaceutical production', ARRAY[
        'Understand GMP principles and regulations',
        'Know documentation requirements',
        'Apply hygiene and contamination control',
        'Recognize deviation management'
    ]),
    ('GMP for Quality Assurance', 'GMP', 10, 12, 'Advanced GMP training for QA professionals', ARRAY[
        'Conduct GMP audits and inspections',
        'Review batch manufacturing records',
        'Manage CAPA systems',
        'Prepare for regulatory inspections'
    ]),
    ('GMP for Non-Manufacturing Personnel', 'GMP', 4, 12, 'GMP awareness training for support staff', ARRAY[
        'Understand basic GMP principles',
        'Recognize contamination risks',
        'Follow documentation best practices',
        'Support GMP compliance'
    ]),

    -- GLP Training
    ('GLP Fundamentals', 'GLP', 8, 24, 'Good Laboratory Practice for nonclinical safety studies', ARRAY[
        'Understand GLP principles and regulations',
        'Know study director responsibilities',
        'Apply quality assurance in lab studies',
        'Maintain compliant lab notebooks'
    ]),

    -- GVP Training
    ('Pharmacovigilance Essentials', 'GVP', 8, 12, 'Good Pharmacovigilance Practice and adverse event reporting', ARRAY[
        'Recognize adverse events and serious adverse events',
        'Understand expedited reporting timelines',
        'Complete ICH E2A case reports',
        'Apply causality assessment principles'
    ]),
    ('Advanced Pharmacovigilance for Safety Specialists', 'GVP', 12, 12, 'In-depth training for pharmacovigilance professionals', ARRAY[
        'Conduct signal detection and evaluation',
        'Prepare PSURs and PADERs',
        'Manage risk management plans (RMPs)',
        'Conduct benefit-risk assessments'
    ]),

    -- General Compliance
    ('21 CFR Part 11 Electronic Records Training', 'General', 4, 24, 'Compliance with electronic records and signature requirements', ARRAY[
        'Understand Part 11 requirements',
        'Use electronic signatures properly',
        'Ensure data integrity and audit trails',
        'Recognize validation requirements'
    ]),
    ('HIPAA Privacy and Security', 'General', 3, 12, 'Health Insurance Portability and Accountability Act compliance', ARRAY[
        'Understand PHI protection requirements',
        'Apply minimum necessary standard',
        'Recognize breach notification obligations',
        'Ensure secure PHI transmission'
    ]),
    ('Medical Information Response Standards', 'General', 6, 24, 'Best practices for responding to unsolicited medical inquiries', ARRAY[
        'Distinguish solicited vs. unsolicited requests',
        'Provide balanced, evidence-based responses',
        'Document medical information requests',
        'Recognize reportable adverse events'
    ])
ON CONFLICT (module_name) DO NOTHING;

-- =====================================================================
-- 3. SEED CLINICAL COMPETENCIES
-- =====================================================================

RAISE NOTICE 'Seeding clinical competencies...';

INSERT INTO clinical_competencies (competency_name, category, description) VALUES
    -- Clinical Research Competencies
    ('Clinical Trial Design', 'clinical_research', 'Ability to design scientifically rigorous, ethically sound, and feasible clinical trials'),
    ('Clinical Trial Operations', 'clinical_research', 'Expertise in executing and managing clinical trials from startup to closeout'),
    ('Site Management', 'clinical_research', 'Skills in selecting, initiating, monitoring, and closing clinical trial sites'),
    ('Patient Recruitment and Retention', 'clinical_research', 'Strategies for enrolling and retaining participants in clinical trials'),
    ('Clinical Data Management', 'clinical_research', 'Proficiency in designing case report forms, data collection, cleaning, and database lock'),
    ('Biostatistics', 'clinical_research', 'Application of statistical methods to clinical trial design and analysis'),
    ('Pharmacokinetics and Pharmacodynamics', 'clinical_research', 'Understanding of drug absorption, distribution, metabolism, excretion, and effects'),

    -- Medical Science Competencies
    ('Scientific Communication', 'medical_science', 'Ability to present complex scientific information clearly to diverse audiences'),
    ('Medical Literature Evaluation', 'medical_science', 'Critical appraisal of clinical research publications for quality and applicability'),
    ('Therapeutic Area Expertise', 'medical_science', 'Deep knowledge of disease pathophysiology, treatment guidelines, and emerging therapies in a specific area'),
    ('Evidence-Based Medicine', 'medical_science', 'Skills in integrating best research evidence with clinical expertise and patient values'),
    ('Medical Writing', 'medical_science', 'Ability to write clear, accurate, and compliant medical documents (protocols, reports, publications)'),
    ('Molecular Medicine', 'medical_science', 'Understanding of genomics, biomarkers, precision medicine, and companion diagnostics'),

    -- Regulatory Competencies
    ('Regulatory Strategy Development', 'regulatory', 'Ability to develop global regulatory strategies for drug development and approval'),
    ('Regulatory Submission Preparation', 'regulatory', 'Expertise in preparing IND, NDA, BLA, MAA submissions'),
    ('Health Authority Interaction', 'regulatory', 'Skills in interacting with FDA, EMA, PMDA during meetings and inspections'),
    ('Regulatory Intelligence', 'regulatory', 'Monitoring and interpreting regulatory landscape changes and competitive intelligence'),
    ('Labeling and Promotional Review', 'regulatory', 'Ensuring marketing materials comply with approved labeling and regulations'),

    -- Data Management Competencies
    ('Clinical Data Standards (CDISC)', 'data_management', 'Proficiency in SDTM, ADaM, CDASH data standards'),
    ('Data Quality and Integrity', 'data_management', 'Ensuring accuracy, completeness, consistency, and traceability of clinical data'),
    ('Database Design and Validation', 'data_management', 'Creating and validating electronic data capture (EDC) systems'),

    -- Quality & Compliance Competencies
    ('Quality Systems and SOPs', 'quality', 'Implementing and maintaining quality management systems and standard operating procedures'),
    ('Audit and Inspection Readiness', 'quality', 'Preparing for and responding to regulatory inspections and internal/external audits'),
    ('Deviation and CAPA Management', 'quality', 'Investigating deviations and implementing corrective and preventive actions'),
    ('Risk Management', 'quality', 'Applying quality risk management (ICH Q9) to pharmaceutical processes'),

    -- Safety & Pharmacovigilance Competencies
    ('Adverse Event Reporting', 'safety', 'Detecting, assessing, documenting, and reporting adverse events per regulations'),
    ('Signal Detection and Evaluation', 'safety', 'Identifying potential safety signals from clinical and post-marketing data'),
    ('Benefit-Risk Assessment', 'safety', 'Evaluating the benefit-risk profile of medicinal products throughout lifecycle'),
    ('Risk Management Planning', 'safety', 'Developing and implementing risk minimization strategies and RMPs'),

    -- Commercial & Market Access Competencies
    ('Health Economics and Outcomes Research (HEOR)', 'commercial', 'Conducting pharmacoeconomic studies and real-world evidence generation'),
    ('Payer Relations and Contracting', 'commercial', 'Negotiating with payers, PBMs, and health systems for formulary access'),
    ('Pricing and Reimbursement', 'commercial', 'Developing pricing strategies and navigating reimbursement pathways'),

    -- Soft Skills
    ('Stakeholder Engagement', 'soft_skills', 'Building and maintaining relationships with internal and external stakeholders'),
    ('Cross-Functional Collaboration', 'soft_skills', 'Working effectively across R&D, regulatory, commercial, and other functions'),
    ('Project Management', 'soft_skills', 'Planning, executing, and closing projects on time and within budget'),
    ('Change Management', 'soft_skills', 'Leading organizational change and managing resistance')
ON CONFLICT (competency_name) DO NOTHING;

-- =====================================================================
-- 4. SEED APPROVAL TYPES
-- =====================================================================

RAISE NOTICE 'Seeding approval types...';

INSERT INTO approval_types (approval_name, category, regulatory_impact, typical_turnaround_days, description) VALUES
    -- Regulatory Approvals
    ('IND Submission', 'regulatory', 'high', 180, 'Final approval of Investigational New Drug application to FDA'),
    ('NDA Submission', 'regulatory', 'high', 365, 'Final approval of New Drug Application to FDA'),
    ('BLA Submission', 'regulatory', 'high', 365, 'Final approval of Biologics License Application to FDA'),
    ('510(k) Submission', 'regulatory', 'high', 180, 'Final approval of 510(k) premarket notification to FDA'),
    ('MAA Submission (EMA)', 'regulatory', 'high', 365, 'Final approval of Marketing Authorization Application to EMA'),
    ('Protocol Amendment', 'regulatory', 'medium', 30, 'Approval of clinical trial protocol changes'),
    ('Regulatory Response to Agency Query', 'regulatory', 'high', 7, 'Approval of responses to FDA/EMA questions during review'),

    -- Clinical Approvals
    ('Clinical Study Protocol', 'clinical', 'high', 45, 'Final approval required before study initiation'),
    ('Informed Consent Form', 'clinical', 'high', 14, 'Final approval of patient consent documents'),
    ('Clinical Study Report', 'clinical', 'high', 60, 'Final approval of CSR before regulatory submission'),
    ('Investigator Brochure', 'clinical', 'medium', 30, 'Approval of investigational product information for sites'),
    ('Site Selection', 'clinical', 'medium', 21, 'Approval of clinical trial site and investigator'),

    -- Safety Approvals
    ('Serious Adverse Event (SAE) Report', 'safety', 'high', 1, 'Approval of expedited SAE reports to regulators'),
    ('Periodic Safety Update Report (PSUR)', 'safety', 'high', 30, 'Approval of periodic safety reports'),
    ('Risk Management Plan (RMP)', 'safety', 'high', 60, 'Approval of risk minimization strategies'),

    -- Quality Approvals
    ('Batch Release for Distribution', 'quality', 'high', 2, 'QA approval to release manufactured batch'),
    ('Deviation Investigation Report', 'quality', 'medium', 14, 'Approval of GMP/GCP deviation investigations'),
    ('CAPA Implementation', 'quality', 'medium', 21, 'Approval of corrective and preventive action plans'),
    ('Validation Protocol', 'quality', 'medium', 30, 'Approval of system/process validation plans'),

    -- Commercial Approvals
    ('Promotional Material Review', 'commercial', 'high', 7, 'Medical/Regulatory review of marketing materials'),
    ('Medical Education Grant', 'commercial', 'medium', 14, 'Approval for unsolicited grant requests from HCPs/institutions'),
    ('Investigator-Initiated Study Support', 'commercial', 'medium', 30, 'Approval of support for IIS proposals'),
    ('Speaker Program', 'commercial', 'medium', 21, 'Approval of speaker bureau events and materials'),

    -- Financial Approvals
    ('Research Budget Allocation', 'financial', 'low', 14, 'Approval of R&D project budgets'),
    ('Clinical Trial Budget', 'financial', 'medium', 21, 'Approval of clinical study budgets'),
    ('Purchase Order >$100K', 'financial', 'low', 7, 'Approval of large vendor contracts'),

    -- Compliance Approvals
    ('Standard Operating Procedure (SOP)', 'compliance', 'medium', 30, 'Approval of new or revised SOPs'),
    ('Training Curriculum', 'compliance', 'low', 21, 'Approval of GxP training programs'),
    ('Audit Report', 'compliance', 'medium', 14, 'Approval of internal audit findings and recommendations')
ON CONFLICT (approval_name) DO NOTHING;

-- =====================================================================
-- 5. SEED PROCESS DEFINITIONS
-- =====================================================================

RAISE NOTICE 'Seeding process definitions...';

INSERT INTO process_definitions (process_name, process_type, typical_duration_days, complexity_level, regulatory_requirement, description, key_milestones) VALUES
    -- Regulatory Processes
    ('IND Submission', 'regulatory', 180, 'very_high', true, 'End-to-end process for Investigational New Drug application to FDA', ARRAY[
        'Pre-IND meeting with FDA',
        'CMC section compilation',
        'Nonclinical section compilation',
        'Clinical protocol finalization',
        'IND compilation and QC',
        'IND submission to FDA',
        '30-day FDA safety review'
    ]),
    ('NDA Submission', 'regulatory', 365, 'very_high', true, 'New Drug Application submission process', ARRAY[
        'Pre-NDA meeting with FDA',
        'Module 2 (CTD summaries) authoring',
        'Module 3 (CMC) compilation',
        'Module 4 (Nonclinical) compilation',
        'Module 5 (Clinical) compilation',
        'NDA compilation and QC',
        'NDA submission',
        'FDA filing decision (60 days)',
        'FDA review and queries',
        'Advisory committee (if applicable)',
        'FDA approval decision'
    ]),
    ('Regulatory Intelligence Monitoring', 'regulatory', NULL, 'medium', false, 'Continuous monitoring of regulatory landscape changes', ARRAY[
        'Daily FDA/EMA website monitoring',
        'Weekly guidance document review',
        'Monthly competitive intelligence summary',
        'Quarterly regulatory strategy updates'
    ]),

    -- Clinical Processes
    ('Clinical Study Startup', 'clinical', 120, 'high', true, 'Site selection through site initiation for clinical trial', ARRAY[
        'Site feasibility assessment',
        'Site selection and qualification',
        'IRB/IEC submission',
        'Clinical trial agreement negotiation',
        'Site initiation visit',
        'First patient first visit (FPFV)'
    ]),
    ('Clinical Study Conduct', 'clinical', NULL, 'high', true, 'Ongoing trial operations from first patient to database lock', ARRAY[
        'Patient enrollment',
        'Monitoring visits',
        'Data cleaning',
        'Safety reporting',
        'Protocol amendments (if needed)',
        'Last patient last visit (LPLV)',
        'Database lock'
    ]),
    ('Adverse Event Reporting', 'safety', 7, 'high', true, 'Detection, assessment, documentation, and reporting of AEs', ARRAY[
        'AE detection',
        'Causality assessment',
        'Expectedness determination',
        'Expedited reporting (if SAE)',
        'Database entry',
        'Regulatory reporting (if required)'
    ]),

    -- Quality Processes
    ('GMP Batch Manufacturing', 'quality', 14, 'high', true, 'Manufacturing of pharmaceutical batch from raw materials to finished product', ARRAY[
        'Batch record review and release',
        'Raw material dispensing',
        'Manufacturing (blending, granulation, etc.)',
        'In-process testing',
        'Finished product testing',
        'QA batch review and release approval'
    ]),
    ('Deviation Investigation', 'quality', 30, 'medium', true, 'Investigation and CAPA for GMP/GCP deviations', ARRAY[
        'Deviation identification and reporting',
        'Impact assessment',
        'Root cause analysis',
        'CAPA plan development',
        'CAPA implementation',
        'Effectiveness check',
        'Deviation closure'
    ]),
    ('Internal Audit', 'quality', 45, 'medium', false, 'Scheduled internal quality audit of GxP operations', ARRAY[
        'Audit planning and scope definition',
        'Audit execution (document review, interviews)',
        'Findings documentation',
        'Audit report issuance',
        'CAPA planning',
        'Follow-up verification'
    ]),

    -- Medical Affairs Processes
    ('KOL Engagement', 'operational', NULL, 'medium', false, 'Medical Science Liaison engagement with Key Opinion Leaders', ARRAY[
        'KOL mapping and prioritization',
        'Engagement planning',
        'Meeting execution',
        'Medical insights capture',
        'Follow-up and relationship maintenance'
    ]),
    ('Medical Information Response', 'operational', 2, 'medium', false, 'Response to unsolicited medical inquiries from HCPs', ARRAY[
        'Inquiry receipt and triage',
        'Literature search',
        'Response drafting',
        'Medical/Regulatory review',
        'Response delivery to requestor',
        'Database documentation'
    ]),
    ('Medical Education Program Development', 'operational', 90, 'medium', false, 'Design and delivery of accredited medical education', ARRAY[
        'Needs assessment',
        'Learning objectives definition',
        'Content development',
        'Accreditation application',
        'Faculty recruitment',
        'Program delivery',
        'Outcomes evaluation'
    ])
ON CONFLICT (process_name) DO NOTHING;

-- =====================================================================
-- 6. SEED WORKFLOW ACTIVITIES
-- =====================================================================

RAISE NOTICE 'Seeding workflow activities...';

INSERT INTO workflow_activities (activity_name, category, typical_frequency, typical_duration_hours, requires_collaboration, description) VALUES
    -- Planning Activities
    ('Strategic Planning Session', 'strategic', 'quarterly', 4, true, 'Department-level strategic planning and goal-setting'),
    ('Review Regulatory Intelligence Reports', 'planning', 'weekly', 1, false, 'Stay current on regulatory landscape changes affecting product development'),
    ('Budget Planning and Forecasting', 'planning', 'monthly', 2, true, 'Review actual vs. budget and update forecasts'),
    ('Clinical Trial Planning Meeting', 'planning', 'weekly', 1.5, true, 'Cross-functional planning for clinical trial execution'),

    -- Execution Activities
    ('Conduct KOL Engagement', 'execution', 'weekly', 1.5, false, 'Face-to-face or virtual meeting with Key Opinion Leader to exchange scientific information'),
    ('Monitor Clinical Trial Site', 'execution', 'monthly', 8, false, 'On-site monitoring visit to verify trial conduct and data quality'),
    ('Author Regulatory Document', 'execution', 'daily', 4, false, 'Write regulatory submission documents (protocols, reports, responses)'),
    ('Review Clinical Study Data', 'execution', 'daily', 3, false, 'Review and clean clinical trial data in EDC system'),
    ('Conduct Laboratory Experiment', 'execution', 'daily', 6, false, 'Execute experimental protocols in GLP lab'),
    ('Manufacture Product Batch', 'execution', 'weekly', 8, true, 'Execute batch manufacturing per GMP requirements'),
    ('Respond to Medical Information Request', 'execution', 'daily', 0.5, false, 'Answer unsolicited medical inquiry from healthcare professional'),

    -- Review Activities
    ('Review and Approve Documents', 'review', 'daily', 1, false, 'Review documents requiring approval (SOPs, protocols, reports)'),
    ('Conduct Quality Review', 'review', 'weekly', 2, false, 'Review batch records, deviations, or quality metrics'),
    ('Peer Review Scientific Presentation', 'review', 'monthly', 1, false, 'Review slides or posters for scientific accuracy'),

    -- Communication Activities
    ('Cross-Functional Team Meeting', 'communication', 'weekly', 1, true, 'Collaborate with clinical, regulatory, commercial teams'),
    ('1-on-1 with Manager', 'communication', 'weekly', 0.5, true, 'Regular check-in with direct supervisor'),
    ('Department Staff Meeting', 'communication', 'weekly', 1, true, 'All-hands meeting for department updates'),
    ('Present to Senior Leadership', 'communication', 'monthly', 1, true, 'Update executives on program progress or strategy'),

    -- Administrative Activities
    ('Email Management', 'administrative', 'daily', 1, false, 'Process and respond to emails'),
    ('Expense Report Submission', 'administrative', 'weekly', 0.5, false, 'Submit travel and business expenses for reimbursement'),
    ('Complete Compliance Training', 'administrative', 'annual', 8, false, 'Complete annual GxP and compliance training requirements'),
    ('Performance Goal Setting', 'administrative', 'annual', 2, true, 'Set annual objectives and key results with manager'),
    ('Timesheet Entry', 'administrative', 'weekly', 0.25, false, 'Record time allocation for project tracking')
ON CONFLICT (activity_name) DO NOTHING;

-- =====================================================================
-- 7. SEED THERAPEUTIC AREAS (if not already seeded)
-- =====================================================================

RAISE NOTICE 'Seeding therapeutic areas...';

INSERT INTO therapeutic_areas (name, description) VALUES
    ('Oncology', 'Cancer and tumor-related diseases'),
    ('Cardiovascular', 'Heart and circulatory system diseases'),
    ('Neurology', 'Brain and nervous system disorders'),
    ('Immunology', 'Immune system and autoimmune diseases'),
    ('Infectious Disease', 'Bacterial, viral, fungal, and parasitic infections'),
    ('Metabolic Disorders', 'Diabetes, obesity, and metabolic syndromes'),
    ('Rare Diseases', 'Orphan drugs and rare genetic disorders'),
    ('Respiratory', 'Asthma, COPD, and pulmonary diseases'),
    ('Gastroenterology', 'Digestive system diseases'),
    ('Dermatology', 'Skin conditions and diseases'),
    ('Ophthalmology', 'Eye diseases and vision disorders'),
    ('Hematology', 'Blood disorders and hematologic malignancies'),
    ('Rheumatology', 'Arthritis and connective tissue diseases'),
    ('Nephrology', 'Kidney diseases'),
    ('Endocrinology', 'Hormonal and glandular disorders'),
    ('Psychiatry', 'Mental health and behavioral disorders'),
    ('Pain Management', 'Chronic and acute pain treatment'),
    ('Vaccines', 'Preventive vaccines and immunizations'),
    ('Gene Therapy', 'Genetic disease treatment through gene modification'),
    ('Cell Therapy', 'Treatment using living cells (CAR-T, stem cells)')
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- VALIDATION AND SUMMARY
-- =====================================================================

DO $$
DECLARE
    frameworks_count INTEGER;
    training_count INTEGER;
    competencies_count INTEGER;
    approvals_count INTEGER;
    processes_count INTEGER;
    activities_count INTEGER;
    therapeutic_areas_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO frameworks_count FROM regulatory_frameworks;
    SELECT COUNT(*) INTO training_count FROM gxp_training_modules;
    SELECT COUNT(*) INTO competencies_count FROM clinical_competencies;
    SELECT COUNT(*) INTO approvals_count FROM approval_types;
    SELECT COUNT(*) INTO processes_count FROM process_definitions;
    SELECT COUNT(*) INTO activities_count FROM workflow_activities;
    SELECT COUNT(*) INTO therapeutic_areas_count FROM therapeutic_areas;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'PHARMACEUTICAL REFERENCE DATA - SEEDING SUMMARY';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Regulatory Frameworks: %', frameworks_count;
    RAISE NOTICE 'GxP Training Modules: %', training_count;
    RAISE NOTICE 'Clinical Competencies: %', competencies_count;
    RAISE NOTICE 'Approval Types: %', approvals_count;
    RAISE NOTICE 'Process Definitions: %', processes_count;
    RAISE NOTICE 'Workflow Activities: %', activities_count;
    RAISE NOTICE 'Therapeutic Areas: %', therapeutic_areas_count;
    RAISE NOTICE '';
    RAISE NOTICE 'TOTAL REFERENCE RECORDS: %',
        frameworks_count + training_count + competencies_count +
        approvals_count + processes_count + activities_count + therapeutic_areas_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Next Steps:';
    RAISE NOTICE '  1. Begin Phase 2: Medical Affairs role enrichment';
    RAISE NOTICE '  2. Map roles to these reference data items via junction tables';
    RAISE NOTICE '  3. Validate enrichment coverage using queries in strategy doc';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

COMMIT;

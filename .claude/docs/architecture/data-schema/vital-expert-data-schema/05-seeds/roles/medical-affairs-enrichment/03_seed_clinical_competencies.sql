-- =====================================================================
-- SEED: Clinical Competencies for Pharmaceutical Roles
-- Date: 2025-11-22
-- Purpose: Populate clinical_competencies table with Medical Affairs competencies
-- Used By: role_clinical_competencies junction table
-- Reference: MAPS (Medical Affairs Professional Society) Competency Framework
-- =====================================================================

BEGIN;

-- Clear existing data (if rerunning)
TRUNCATE TABLE clinical_competencies CASCADE;

-- =====================================================================
-- CATEGORY: SCIENTIFIC EXPERTISE & KNOWLEDGE
-- =====================================================================

INSERT INTO clinical_competencies (
    competency_name,
    category,
    description,
    typical_roles,
    learning_resources
) VALUES

(
    'Therapeutic Area Expertise',
    'scientific_expertise',
    'Deep understanding of disease states, pathophysiology, treatment paradigms, and clinical evidence in a specific therapeutic area (e.g., oncology, immunology, neurology)',
    ARRAY['Medical Science Liaison', 'Senior MSL', 'Medical Director', 'Therapeutic Area Lead'],
    ARRAY['Disease-specific conferences', 'Peer-reviewed literature', 'Clinical trial data', 'Treatment guidelines']
),

(
    'Clinical Trial Design & Methodology',
    'scientific_expertise',
    'Understanding of clinical trial design, phases, endpoints, statistical methodologies, and interpretation of clinical study results',
    ARRAY['Medical Science Liaison', 'Medical Director', 'HEOR Manager', 'Clinical Ops Liaison'],
    ARRAY['ICH E8/E9 guidelines', 'Clinical Research training', 'Biostatistics courses', 'Protocol review experience']
),

(
    'Medical Literature Review & Critical Appraisal',
    'scientific_expertise',
    'Ability to search, evaluate, and critically appraise medical literature for quality, bias, and clinical relevance',
    ARRAY['Medical Science Liaison', 'Medical Information Specialist', 'Medical Writer', 'Publications Manager'],
    ARRAY['PubMed/Embase training', 'Critical appraisal workshops', 'Evidence-based medicine courses', 'Journal clubs']
),

(
    'Data Interpretation & Analysis',
    'scientific_expertise',
    'Skills in interpreting clinical data, understanding statistical significance vs. clinical relevance, and translating data into clinical insights',
    ARRAY['Medical Science Liaison', 'HEOR Manager', 'Medical Director', 'Real-World Evidence Lead'],
    ARRAY['Biostatistics training', 'Epidemiology courses', 'Data visualization tools', 'Clinical data analysis workshops']
),

(
    'Pharmacology & Mechanism of Action',
    'scientific_expertise',
    'Understanding of drug mechanisms, pharmacokinetics, pharmacodynamics, drug-drug interactions, and therapeutic positioning',
    ARRAY['Medical Science Liaison', 'Medical Information Specialist', 'Medical Director', 'Medical Writer'],
    ARRAY['Pharmacology textbooks', 'Drug development courses', 'Mechanism of action training', 'Clinical pharmacology literature']
),

-- =====================================================================
-- CATEGORY: MEDICAL COMMUNICATION
-- =====================================================================

(
    'Scientific Communication & Presentation',
    'medical_communication',
    'Ability to communicate complex scientific information clearly and effectively to diverse audiences (HCPs, payers, patients)',
    ARRAY['Medical Science Liaison', 'Medical Director', 'Medical Education Manager', 'Scientific Trainer'],
    ARRAY['Presentation skills training', 'Medical communication workshops', 'Public speaking courses', 'Slide design best practices']
),

(
    'Peer-to-Peer Medical Dialogue',
    'medical_communication',
    'Engaging in balanced, evidence-based scientific discussions with healthcare professionals at their level of expertise',
    ARRAY['Medical Science Liaison', 'Senior MSL', 'Medical Director'],
    ARRAY['MSL training programs', 'Role-playing exercises', 'Field observation', 'HCP interaction workshops']
),

(
    'Medical Writing & Publication Development',
    'medical_communication',
    'Skills in writing manuscripts, abstracts, posters, slide decks, and other scientific documents following publication standards',
    ARRAY['Medical Writer', 'Publications Manager', 'Medical Director', 'Medical Science Liaison'],
    ARRAY['GPP3 guidelines', 'ICMJE standards', 'Medical writing courses', 'Publication planning workshops']
),

(
    'Responding to Medical Inquiries',
    'medical_communication',
    'Providing balanced, evidence-based responses to unsolicited medical information requests, including off-label inquiries',
    ARRAY['Medical Information Specialist', 'Medical Information Manager', 'Medical Science Liaison'],
    ARRAY['Medical information training', 'Off-label communication guidelines', 'Response templates', 'Regulatory compliance training']
),

(
    'Educational Needs Assessment',
    'medical_communication',
    'Identifying knowledge gaps and educational needs of healthcare professionals to inform medical education strategies',
    ARRAY['Medical Education Manager', 'Medical Science Liaison', 'Digital Medical Education Lead'],
    ARRAY['Needs assessment methodologies', 'Survey design', 'Data collection techniques', 'Gap analysis frameworks']
),

-- =====================================================================
-- CATEGORY: KOL & STAKEHOLDER ENGAGEMENT
-- =====================================================================

(
    'KOL (Key Opinion Leader) Identification & Engagement',
    'stakeholder_engagement',
    'Identifying, profiling, and building relationships with influential physicians, researchers, and thought leaders',
    ARRAY['Medical Science Liaison', 'Senior MSL', 'Field Team Lead', 'Medical Affairs Director'],
    ARRAY['KOL mapping methodologies', 'Stakeholder analysis', 'Relationship management training', 'Advisory board best practices']
),

(
    'Advisory Board Planning & Execution',
    'stakeholder_engagement',
    'Planning, coordinating, and facilitating medical advisory boards to gather clinical insights and expert guidance',
    ARRAY['Medical Director', 'Senior MSL', 'Medical Affairs Director'],
    ARRAY['Advisory board guidelines', 'Facilitation skills training', 'Meeting planning resources', 'Compliance training']
),

(
    'Speaker Program Management',
    'stakeholder_engagement',
    'Recruiting, training, and managing healthcare professionals for speaker bureau programs',
    ARRAY['Medical Education Manager', 'Field Team Lead', 'Medical Affairs Manager'],
    ARRAY['Speaker program policies', 'Compliance guidelines', 'Contract management', 'Performance evaluation methods']
),

(
    'Cross-Functional Collaboration',
    'stakeholder_engagement',
    'Working effectively with Clinical, Commercial, Regulatory, Market Access, and other functions to align medical strategies',
    ARRAY['Medical Director', 'Medical Affairs Director', 'VP Medical Affairs', 'CMO'],
    ARRAY['Collaboration frameworks', 'Cross-functional training', 'Project management tools', 'Stakeholder mapping']
),

-- =====================================================================
-- CATEGORY: CLINICAL RESEARCH OPERATIONS
-- =====================================================================

(
    'Protocol Development & Review',
    'clinical_research',
    'Contributing to clinical trial protocol design, feasibility assessment, and scientific review',
    ARRAY['Medical Director', 'Medical Monitor', 'Clinical Ops Liaison', 'Medical Affairs Director'],
    ARRAY['Protocol writing training', 'ICH GCP E8', 'Clinical trial design courses', 'Protocol templates']
),

(
    'Medical Monitoring & Safety Oversight',
    'clinical_research',
    'Providing medical oversight of clinical trials, reviewing safety data, and assessing adverse events for causality',
    ARRAY['Medical Monitor', 'Medical Director', 'Senior Medical Director', 'Safety Lead'],
    ARRAY['Medical monitoring training', 'ICH GCP E6', 'Adverse event assessment', 'Safety oversight guidelines']
),

(
    'Investigator Site Management',
    'clinical_research',
    'Identifying, qualifying, and maintaining relationships with clinical trial investigators and research sites',
    ARRAY['Medical Science Liaison', 'Clinical Ops Liaison', 'Medical Director'],
    ARRAY['Investigator meeting planning', 'Site qualification criteria', 'CRA collaboration', 'Investigator training']
),

(
    'Patient Recruitment & Retention Strategies',
    'clinical_research',
    'Developing strategies to improve patient enrollment and retention in clinical trials',
    ARRAY['Clinical Ops Liaison', 'Patient Advocacy Lead', 'Medical Affairs Manager'],
    ARRAY['Recruitment best practices', 'Patient engagement strategies', 'Enrollment analytics', 'Retention programs']
),

-- =====================================================================
-- CATEGORY: PHARMACOVIGILANCE & SAFETY
-- =====================================================================

(
    'Adverse Event Recognition & Reporting',
    'pharmacovigilance',
    'Identifying, documenting, and reporting adverse events in compliance with regulatory timelines and requirements',
    ARRAY['Medical Science Liaison', 'Medical Information Specialist', 'Medical Director', 'Safety Specialist'],
    ARRAY['ICH E2A', 'FDA 314.80', 'AE reporting training', 'Case documentation standards']
),

(
    'Causality Assessment',
    'pharmacovigilance',
    'Evaluating the relationship between a drug and an adverse event using standardized causality assessment methods',
    ARRAY['Medical Director', 'Safety Lead', 'Medical Monitor', 'Pharmacovigilance Specialist'],
    ARRAY['WHO-UMC criteria', 'Naranjo algorithm', 'Causality assessment training', 'Safety case review']
),

(
    'Signal Detection & Risk Management',
    'pharmacovigilance',
    'Identifying safety signals from diverse data sources and implementing risk minimization strategies',
    ARRAY['Safety Lead', 'Medical Director', 'Real-World Evidence Lead', 'HEOR Manager'],
    ARRAY['Signal detection methodologies', 'Risk management plans', 'REMS programs', 'Safety database analysis']
),

(
    'Benefit-Risk Assessment',
    'pharmacovigilance',
    'Evaluating the overall benefit-risk profile of a therapy considering efficacy, safety, and patient factors',
    ARRAY['Medical Director', 'Medical Affairs Director', 'VP Medical Affairs', 'HEOR Manager'],
    ARRAY['Benefit-risk frameworks', 'Decision analysis', 'Patient preference studies', 'Regulatory guidance']
),

-- =====================================================================
-- CATEGORY: HEALTH ECONOMICS & OUTCOMES RESEARCH (HEOR)
-- =====================================================================

(
    'Real-World Evidence (RWE) Study Design',
    'heor',
    'Designing and conducting observational studies using real-world data to generate clinical and economic evidence',
    ARRAY['Real-World Evidence Lead', 'HEOR Manager', 'HEOR Project Manager', 'Medical Director'],
    ARRAY['RWE study designs', 'ISPOR guidelines', 'Database analysis', 'Comparative effectiveness research']
),

(
    'Economic Modeling & Cost-Effectiveness Analysis',
    'heor',
    'Building economic models to assess cost-effectiveness, budget impact, and value proposition of therapies',
    ARRAY['Economic Modeler', 'HEOR Manager', 'Market Access Lead', 'Payer Evidence Lead'],
    ARRAY['Health economic modeling', 'Decision trees and Markov models', 'ICER guidelines', 'Cost-effectiveness software']
),

(
    'Health Technology Assessment (HTA) Strategy',
    'heor',
    'Preparing value dossiers and evidence packages for HTA bodies (NICE, ICER, CADTH, etc.)',
    ARRAY['Market Access Lead', 'HEOR Manager', 'Payer Evidence Lead', 'Medical Affairs Director'],
    ARRAY['HTA submission requirements', 'Value frameworks', 'Evidence synthesis', 'Payer landscape analysis']
),

(
    'Patient-Reported Outcomes (PRO) Research',
    'heor',
    'Designing, implementing, and analyzing patient-reported outcome measures in clinical and real-world settings',
    ARRAY['HEOR Project Manager', 'Patient Advocacy Lead', 'Real-World Evidence Lead'],
    ARRAY['PRO instrument development', 'FDA PRO guidance', 'Patient engagement', 'Psychometric validation']
),

-- =====================================================================
-- CATEGORY: REGULATORY & COMPLIANCE
-- =====================================================================

(
    'Regulatory Affairs Knowledge',
    'regulatory_compliance',
    'Understanding regulatory pathways, submission requirements, and post-marketing commitments across global markets',
    ARRAY['Medical Director', 'Regulatory Liaison', 'Medical Affairs Director', 'CMO'],
    ARRAY['FDA/EMA regulations', 'IND/NDA processes', 'Regulatory strategy courses', 'Submission timelines']
),

(
    'Good Clinical Practice (GCP) Compliance',
    'regulatory_compliance',
    'Ensuring adherence to ICH GCP principles in all clinical and medical activities',
    ARRAY['Medical Science Liaison', 'Medical Director', 'Clinical Ops Liaison', 'Medical Monitor'],
    ARRAY['ICH GCP E6(R2)', 'GCP training programs', 'Compliance audits', 'Inspection readiness']
),

(
    'Promotional Review & Compliance',
    'regulatory_compliance',
    'Reviewing medical and promotional materials for regulatory compliance and scientific accuracy',
    ARRAY['Medical Director', 'Medical Affairs Manager', 'Medical Review Committee Lead'],
    ARRAY['FDA promotional regulations', 'OPDP guidance', 'MLR training', 'Off-label communication rules']
),

(
    'Transparency & Disclosure Compliance',
    'regulatory_compliance',
    'Ensuring compliance with Sunshine Act, EFPIA Code, and other transparency reporting requirements',
    ARRAY['Medical Science Liaison', 'Compliance Specialist', 'Medical Excellence Lead'],
    ARRAY['Open Payments', 'EFPIA Code', 'Transfer of value reporting', 'HCP consent management']
),

-- =====================================================================
-- CATEGORY: DIGITAL & TECHNOLOGY
-- =====================================================================

(
    'Digital Health Literacy',
    'digital_technology',
    'Understanding digital health technologies, telemedicine, digital therapeutics, and health apps',
    ARRAY['Digital Medical Education Lead', 'Medical Science Liaison', 'Medical Affairs Director'],
    ARRAY['Digital health courses', 'Telehealth platforms', 'FDA digital health guidance', 'Health IT conferences']
),

(
    'Medical Data Analytics',
    'digital_technology',
    'Using data analytics tools to extract insights from clinical databases, real-world data, and medical literature',
    ARRAY['Real-World Evidence Lead', 'HEOR Manager', 'Medical Director', 'Data Analyst'],
    ARRAY['SQL/Python/R training', 'Tableau/PowerBI', 'Healthcare databases (Optum, Truven)', 'Data visualization']
),

(
    'CRM & Field Force Tools',
    'digital_technology',
    'Proficiency in using CRM systems (Veeva, Salesforce) for activity tracking, insights documentation, and compliance',
    ARRAY['Medical Science Liaison', 'Field Team Lead', 'Medical Scientific Manager'],
    ARRAY['Veeva CRM training', 'Salesforce certification', 'Activity reporting', 'Data quality management']
);

-- =====================================================================
-- VALIDATION
-- =====================================================================

DO $$
DECLARE
    competency_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO competency_count FROM clinical_competencies;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CLINICAL COMPETENCIES SEED - VALIDATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Clinical Competencies Seeded: %', competency_count;
    RAISE NOTICE '';

    -- Breakdown by category
    RAISE NOTICE 'By Category:';
    FOR rec IN
        SELECT category, COUNT(*) as count
        FROM clinical_competencies
        GROUP BY category
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  % : % competencies', rec.category, rec.count;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Competencies by Typical Role (Top 10):';
    FOR rec IN
        SELECT
            role_name,
            COUNT(*) as competency_count
        FROM (
            SELECT unnest(typical_roles) as role_name
            FROM clinical_competencies
        ) roles
        GROUP BY role_name
        ORDER BY competency_count DESC
        LIMIT 10
    LOOP
        RAISE NOTICE '  % : % competencies', rec.role_name, rec.competency_count;
    END LOOP;

    RAISE NOTICE '';

    IF competency_count >= 30 THEN
        RAISE NOTICE 'SUCCESS: All core clinical competencies seeded successfully!';
    ELSE
        RAISE WARNING 'WARNING: Expected at least 30 competencies, found %', competency_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

COMMIT;

-- =====================================================================
-- USAGE NOTES
-- =====================================================================

/*
These clinical competencies are based on the MAPS (Medical Affairs Professional Society)
Core Competency Framework and industry best practices.

PROFICIENCY LEVELS (used in role_clinical_competencies junction):
- 'foundational' : Basic understanding, supervised application
- 'intermediate' : Independent application, some depth
- 'advanced' : Deep expertise, can mentor others
- 'expert' : Subject matter expert, thought leader

TYPICAL MAPPINGS FOR MEDICAL AFFAIRS ROLES:

Medical Science Liaison (MSL):
Required (Advanced/Expert):
- Therapeutic Area Expertise (expert)
- Scientific Communication & Presentation (advanced)
- Peer-to-Peer Medical Dialogue (advanced)
- KOL Identification & Engagement (advanced)
- Medical Literature Review & Critical Appraisal (advanced)
- Adverse Event Recognition & Reporting (advanced)
- Clinical Trial Design & Methodology (intermediate-advanced)
- CRM & Field Force Tools (intermediate)

Medical Information Specialist:
Required (Advanced/Expert):
- Responding to Medical Inquiries (expert)
- Medical Literature Review & Critical Appraisal (advanced)
- Adverse Event Recognition & Reporting (advanced)
- Pharmacology & Mechanism of Action (advanced)
- Data Interpretation & Analysis (intermediate)
- Good Clinical Practice Compliance (intermediate)

Medical Director:
Required (Advanced/Expert):
- Therapeutic Area Expertise (expert)
- Clinical Trial Design & Methodology (expert)
- Medical Monitoring & Safety Oversight (expert)
- Data Interpretation & Analysis (expert)
- Cross-Functional Collaboration (advanced)
- Regulatory Affairs Knowledge (advanced)
- Protocol Development & Review (advanced)
- Causality Assessment (advanced)

HEOR Manager:
Required (Advanced/Expert):
- Real-World Evidence Study Design (expert)
- Economic Modeling & Cost-Effectiveness Analysis (expert)
- Data Interpretation & Analysis (expert)
- Medical Literature Review & Critical Appraisal (advanced)
- HTA Strategy (advanced)
- Patient-Reported Outcomes Research (intermediate-advanced)
- Medical Data Analytics (advanced)

Publications Manager:
Required (Advanced/Expert):
- Medical Writing & Publication Development (expert)
- Medical Literature Review & Critical Appraisal (advanced)
- Promotional Review & Compliance (advanced)
- Data Interpretation & Analysis (intermediate)
- Cross-Functional Collaboration (intermediate)
*/

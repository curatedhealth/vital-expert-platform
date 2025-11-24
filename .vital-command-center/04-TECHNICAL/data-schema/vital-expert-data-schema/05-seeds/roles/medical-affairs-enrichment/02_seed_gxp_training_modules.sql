-- =====================================================================
-- SEED: GxP Training Modules for Pharmaceutical Roles
-- Date: 2025-11-22
-- Purpose: Populate gxp_training_modules table with required training
-- Used By: role_gxp_training junction table
-- =====================================================================

BEGIN;

-- Clear existing data (if rerunning)
TRUNCATE TABLE gxp_training_modules CASCADE;

-- =====================================================================
-- GOOD CLINICAL PRACTICE (GCP) TRAINING
-- =====================================================================

INSERT INTO gxp_training_modules (
    module_name,
    gxp_category,
    required_for_gxp_roles,
    training_duration_hours,
    renewal_frequency_months,
    regulatory_requirement,
    description,
    learning_objectives
) VALUES

-- GCP Core Training
(
    'GCP Fundamentals',
    'GCP',
    true,
    4.0,
    24,
    true,
    'Introduction to ICH GCP E6(R2) principles, regulations, and responsibilities in clinical trials. Required for all personnel involved in clinical research.',
    ARRAY[
        'Understand the 13 ICH GCP principles',
        'Identify roles and responsibilities in clinical trials',
        'Recognize ethical considerations in human research',
        'Apply documentation and record-keeping requirements',
        'Describe informed consent processes'
    ]
),

(
    'GCP for Medical Affairs',
    'GCP',
    true,
    3.0,
    24,
    true,
    'Specialized GCP training for Medical Affairs roles focusing on medical monitoring, safety reporting, and investigator interactions',
    ARRAY[
        'Apply GCP principles to Medical Affairs activities',
        'Understand Medical Monitor responsibilities',
        'Recognize protocol deviations and violations',
        'Handle adverse event reporting requirements',
        'Maintain clinical trial documentation'
    ]
),

(
    'Advanced GCP: Medical Monitoring',
    'GCP',
    true,
    6.0,
    24,
    true,
    'Advanced training for Medical Monitors covering protocol compliance, safety oversight, and investigator management',
    ARRAY[
        'Perform medical review of clinical data',
        'Assess protocol compliance and deviations',
        'Evaluate adverse events for causality',
        'Conduct investigator site visits',
        'Document medical monitoring activities'
    ]
),

-- =====================================================================
-- GOOD PHARMACOVIGILANCE PRACTICE (GVP) TRAINING
-- =====================================================================

(
    'Pharmacovigilance Basics',
    'GVP',
    true,
    3.0,
    12,
    true,
    'Introduction to pharmacovigilance principles, adverse event reporting, and safety surveillance requirements',
    ARRAY[
        'Define pharmacovigilance and its importance',
        'Identify adverse events, adverse drug reactions, and serious adverse events',
        'Understand expedited and periodic reporting timelines',
        'Recognize safety signal detection principles',
        'Apply causality assessment methods'
    ]
),

(
    'Adverse Event Reporting for MSLs',
    'GVP',
    true,
    2.0,
    12,
    true,
    'Specific training for field-based Medical Affairs on capturing and reporting adverse events from healthcare professionals',
    ARRAY[
        'Recognize reportable adverse events in field interactions',
        'Apply 24-hour reporting requirements for serious AEs',
        'Document AE information accurately and completely',
        'Understand off-label use reporting obligations',
        'Maintain patient confidentiality in AE reporting'
    ]
),

(
    'Safety Signal Management',
    'GVP',
    true,
    4.0,
    24,
    true,
    'Advanced training on identifying, evaluating, and managing safety signals from various data sources',
    ARRAY[
        'Identify potential safety signals from diverse sources',
        'Apply statistical methods for signal detection',
        'Evaluate signal significance and clinical relevance',
        'Implement risk management strategies',
        'Communicate safety findings to stakeholders'
    ]
),

-- =====================================================================
-- COMPLIANCE & ETHICS TRAINING
-- =====================================================================

(
    'PhRMA Code Compliance for Field Medical',
    'General',
    true,
    2.0,
    12,
    false,
    'PhRMA Code on Interactions with Healthcare Professionals - standards for ethical interactions, including meals, speaker programs, and advisory boards',
    ARRAY[
        'Apply PhRMA Code principles to HCP interactions',
        'Recognize permissible vs. prohibited interactions',
        'Understand meal and entertainment limitations',
        'Document HCP interactions for transparency',
        'Identify potential conflicts of interest'
    ]
),

(
    'Sunshine Act & Transparency Reporting',
    'General',
    true,
    1.5,
    24,
    true,
    'FDA Physician Payments Sunshine Act compliance training - disclosure requirements for payments and transfers of value to HCPs',
    ARRAY[
        'Understand Open Payments reporting requirements',
        'Identify reportable transfers of value',
        'Recognize exclusions and exceptions',
        'Document interactions for transparency reporting',
        'Manage HCP consents and attestations'
    ]
),

(
    'Anti-Kickback and Healthcare Fraud Prevention',
    'General',
    true,
    2.0,
    24,
    true,
    'Training on Anti-Kickback Statute, False Claims Act, and preventing healthcare fraud in pharmaceutical interactions',
    ARRAY[
        'Identify prohibited inducements under Anti-Kickback Statute',
        'Recognize False Claims Act violations',
        'Apply safe harbor provisions correctly',
        'Understand consequences of healthcare fraud',
        'Report suspected violations appropriately'
    ]
),

-- =====================================================================
-- MEDICAL INFORMATION & COMMUNICATION TRAINING
-- =====================================================================

(
    'Medical Information Response Standards',
    'General',
    true,
    3.0,
    24,
    false,
    'Standards for responding to unsolicited medical inquiries, including off-label requests, balanced information, and documentation',
    ARRAY[
        'Distinguish solicited vs. unsolicited requests',
        'Provide balanced, evidence-based responses',
        'Handle off-label information requests appropriately',
        'Document medical inquiries accurately',
        'Recognize reportable safety information'
    ]
),

(
    'Scientific Communication Skills for MSLs',
    'General',
    true,
    4.0,
    999,
    false,
    'Advanced scientific communication training covering presentation skills, data interpretation, and peer-to-peer medical dialogue',
    ARRAY[
        'Communicate complex scientific data clearly',
        'Engage in peer-to-peer scientific dialogue',
        'Present clinical data with appropriate balance',
        'Respond to challenging scientific questions',
        'Tailor communication to audience knowledge level'
    ]
),

(
    'Publication Planning & Medical Writing Ethics',
    'General',
    true,
    3.0,
    36,
    false,
    'Ethical principles for publication planning, authorship, and medical writing in compliance with ICMJE and GPP3 guidelines',
    ARRAY[
        'Apply ICMJE authorship criteria',
        'Understand GPP3 (Good Publication Practice) guidelines',
        'Recognize publication misconduct (ghost/guest authorship)',
        'Manage conflicts of interest in publications',
        'Ensure transparency in medical writing'
    ]
),

-- =====================================================================
-- DATA PRIVACY & SECURITY TRAINING
-- =====================================================================

(
    'HIPAA Privacy & Security for Medical Affairs',
    'General',
    true,
    2.0,
    12,
    true,
    'HIPAA Privacy Rule and Security Rule compliance for Medical Affairs roles handling protected health information',
    ARRAY[
        'Identify protected health information (PHI)',
        'Apply minimum necessary standard',
        'Recognize HIPAA violations and penalties',
        'Implement physical and electronic safeguards',
        'Report breaches appropriately'
    ]
),

(
    'GDPR & Global Data Privacy',
    'General',
    true,
    2.0,
    24,
    true,
    'EU General Data Protection Regulation and global data privacy principles for international Medical Affairs operations',
    ARRAY[
        'Understand GDPR principles and territorial scope',
        'Identify personal data vs. sensitive personal data',
        'Apply lawful bases for data processing',
        'Manage data subject rights (access, erasure, portability)',
        'Implement data protection by design and default'
    ]
),

-- =====================================================================
-- SYSTEMS & TECHNOLOGY TRAINING
-- =====================================================================

(
    '21 CFR Part 11 for Electronic Systems',
    'General',
    true,
    2.0,
    24,
    true,
    'Electronic records and electronic signatures compliance for users of GxP-regulated systems',
    ARRAY[
        'Understand 21 CFR Part 11 requirements',
        'Implement electronic signature controls',
        'Maintain audit trail integrity',
        'Validate computerized systems appropriately',
        'Recognize Part 11 scope and applicability'
    ]
);

-- =====================================================================
-- VALIDATION
-- =====================================================================

DO $$
DECLARE
    training_count INTEGER;
    total_hours NUMERIC;
BEGIN
    SELECT COUNT(*), SUM(training_duration_hours)
    INTO training_count, total_hours
    FROM gxp_training_modules;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'GXP TRAINING MODULES SEED - VALIDATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Training Modules Seeded: %', training_count;
    RAISE NOTICE 'Total Training Hours: %', total_hours;
    RAISE NOTICE '';

    -- Breakdown by GxP category
    RAISE NOTICE 'By GxP Category:';
    FOR rec IN
        SELECT gxp_category, COUNT(*) as count, SUM(training_duration_hours) as hours
        FROM gxp_training_modules
        GROUP BY gxp_category
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  % : % modules (% hours)', rec.gxp_category, rec.count, rec.hours;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Regulatory Requirements:';
    FOR rec IN
        SELECT
            CASE WHEN regulatory_requirement THEN 'Regulatory Required' ELSE 'Company Policy' END as req_type,
            COUNT(*) as count
        FROM gxp_training_modules
        GROUP BY regulatory_requirement
        ORDER BY regulatory_requirement DESC
    LOOP
        RAISE NOTICE '  % : % modules', rec.req_type, rec.count;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'Renewal Frequency:';
    FOR rec IN
        SELECT renewal_frequency_months, COUNT(*) as count
        FROM gxp_training_modules
        GROUP BY renewal_frequency_months
        ORDER BY renewal_frequency_months
    LOOP
        RAISE NOTICE '  Every % months : % modules', rec.renewal_frequency_months, rec.count;
    END LOOP;

    RAISE NOTICE '';

    IF training_count >= 15 THEN
        RAISE NOTICE 'SUCCESS: All core GxP training modules seeded successfully!';
    ELSE
        RAISE WARNING 'WARNING: Expected at least 15 modules, found %', training_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

COMMIT;

-- =====================================================================
-- USAGE NOTES
-- =====================================================================

/*
These GxP training modules represent the required training for pharmaceutical
roles, especially those in Medical Affairs, Clinical Development, and Regulatory.

MAPPING TO ROLES (via role_gxp_training junction table):

Medical Science Liaison (MSL):
- GCP Fundamentals (mandatory, 90 days)
- Pharmacovigilance Basics (mandatory, 90 days)
- Adverse Event Reporting for MSLs (mandatory, 30 days)
- PhRMA Code Compliance for Field Medical (mandatory, 30 days)
- Sunshine Act & Transparency Reporting (mandatory, 90 days)
- Scientific Communication Skills for MSLs (recommended)

Medical Information Specialist:
- Pharmacovigilance Basics (mandatory, 90 days)
- Medical Information Response Standards (mandatory, 30 days)
- HIPAA Privacy & Security for Medical Affairs (mandatory, 90 days)
- Anti-Kickback and Healthcare Fraud Prevention (mandatory, 90 days)

Medical Director:
- GCP Fundamentals (mandatory, 30 days)
- Advanced GCP: Medical Monitoring (mandatory, 60 days)
- Pharmacovigilance Basics (mandatory, 60 days)
- Safety Signal Management (mandatory, 90 days)
- Publication Planning & Medical Writing Ethics (recommended)

HEOR Manager:
- GCP for Medical Affairs (recommended)
- Scientific Communication Skills (recommended)
- Publication Planning & Medical Writing Ethics (mandatory, 90 days)

RENEWAL FREQUENCIES:
- 12 months: Safety and compliance training (high risk)
- 24 months: GCP, systems, and general compliance
- 36 months: Publication ethics and medical writing
- 999 months: One-time skills training (no renewal)

DUE_WITHIN_DAYS_OF_HIRE (defaults in junction table):
- 30 days: Critical safety and compliance training
- 60 days: Role-specific GxP training
- 90 days: General pharmaceutical compliance
- 180 days: Recommended but not critical
*/

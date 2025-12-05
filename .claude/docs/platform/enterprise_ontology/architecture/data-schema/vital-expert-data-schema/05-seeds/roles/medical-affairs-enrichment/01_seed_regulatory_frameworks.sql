-- =====================================================================
-- SEED: Regulatory Frameworks for Pharmaceutical Industry
-- Date: 2025-11-22
-- Purpose: Populate regulatory_frameworks table with core pharma standards
-- Used By: role_regulatory_frameworks junction table
-- =====================================================================

BEGIN;

-- Clear existing data (if rerunning)
TRUNCATE TABLE regulatory_frameworks CASCADE;

-- =====================================================================
-- US FDA REGULATIONS
-- =====================================================================

INSERT INTO regulatory_frameworks (name, framework_type, region, authority, description, effective_date, url, is_current) VALUES

-- Clinical Research
('ICH GCP E6(R2)', 'compliance', 'Global', 'ICH', 'International Council for Harmonisation Good Clinical Practice guideline for clinical trial conduct, documentation, and monitoring', '2016-11-09', 'https://database.ich.org/sites/default/files/E6_R2_Addendum.pdf', true),

('FDA 21 CFR Part 312', 'submission', 'US', 'FDA', 'IND (Investigational New Drug) application requirements and clinical trial procedures for pharmaceutical development', '1987-03-19', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-312', true),

('FDA 21 CFR Part 314', 'submission', 'US', 'FDA', 'NDA (New Drug Application) requirements for marketing approval of new drugs in the United States', '1985-09-06', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-D/part-314', true),

-- Pharmacovigilance & Safety
('FDA 21 CFR Part 314.80', 'safety', 'US', 'FDA', 'Postmarketing reporting of adverse drug experiences and requirements for safety monitoring', '1997-10-07', 'https://www.ecfr.gov/current/title-21/section-314.80', true),

('ICH E2A', 'safety', 'Global', 'ICH', 'Clinical Safety Data Management: Definitions and Standards for Expedited Reporting of adverse events', '1994-10-27', 'https://database.ich.org/sites/default/files/E2A_Guideline.pdf', true),

('EMA GVP Module VI', 'safety', 'EU', 'EMA', 'Good Pharmacovigilance Practices - Management and reporting of adverse reactions to medicinal products', '2012-09-22', 'https://www.ema.europa.eu/en/documents/scientific-guideline/guideline-good-pharmacovigilance-practices-gvp-module-vi-management-reporting-adverse-reactions_en.pdf', true),

-- Medical Information & Communications
('PhRMA Code on Interactions with Healthcare Professionals', 'compliance', 'US', 'PhRMA', 'Voluntary code governing pharmaceutical company interactions with HCPs, including standards for MSL conduct', '2002-07-01', 'https://www.phrma.org/resource-center/Topics/Legal-Regulatory/PhRMA-Code-on-Interactions-with-Health-Care-Professionals', true),

('FDA Physician Payments Sunshine Act (PPSA)', 'compliance', 'US', 'FDA', 'Open Payments program requiring disclosure of payments and transfers of value to HCPs', '2013-08-01', 'https://www.cms.gov/OpenPayments', true),

('FDA Promotional Labeling and Advertising Regulations', 'compliance', 'US', 'FDA', 'Regulations governing promotional communications about prescription drugs (21 CFR 202.1)', '1969-03-03', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-202', true),

-- Data Integrity & Electronic Records
('FDA 21 CFR Part 11', 'compliance', 'US', 'FDA', 'Electronic Records and Electronic Signatures - requirements for electronic systems used in GxP environments', '1997-08-20', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-A/part-11', true),

('EU Annex 11 - Computerised Systems', 'compliance', 'EU', 'EMA', 'GMP requirements for computerized systems used in pharmaceutical manufacturing and quality', '2011-06-30', 'https://www.gmp-compliance.org/guidemgr/files/ANNEX11_01-2011_EN.PDF', true),

-- Privacy & Data Protection
('HIPAA Privacy Rule', 'compliance', 'US', 'HHS', 'Health Insurance Portability and Accountability Act - protection of patient health information', '2003-04-14', 'https://www.hhs.gov/hipaa/for-professionals/privacy/index.html', true),

('EU GDPR', 'compliance', 'EU', 'EU Commission', 'General Data Protection Regulation - protection of personal data for EU citizens', '2018-05-25', 'https://gdpr-info.eu/', true),

-- =====================================================================
-- CLINICAL RESEARCH & TRIALS
-- =====================================================================

('ICH E8', 'compliance', 'Global', 'ICH', 'General Considerations for Clinical Trials - principles of clinical trial design and conduct', '1997-07-17', 'https://database.ich.org/sites/default/files/E8_Guideline.pdf', true),

('ICH E9', 'compliance', 'Global', 'ICH', 'Statistical Principles for Clinical Trials - guidance on statistical methodologies', '1998-02-05', 'https://database.ich.org/sites/default/files/E9_Guideline.pdf', true),

('Declaration of Helsinki', 'compliance', 'Global', 'WMA', 'World Medical Association ethical principles for medical research involving human subjects', '1964-06-01', 'https://www.wma.net/policies-post/wma-declaration-of-helsinki-ethical-principles-for-medical-research-involving-human-subjects/', true),

-- =====================================================================
-- QUALITY & MANUFACTURING (for context, less relevant to Medical Affairs)
-- =====================================================================

('FDA 21 CFR Part 211', 'quality', 'US', 'FDA', 'Current Good Manufacturing Practice (cGMP) for finished pharmaceuticals', '1979-09-29', 'https://www.ecfr.gov/current/title-21/chapter-I/subchapter-C/part-211', true),

('ICH Q7', 'quality', 'Global', 'ICH', 'Good Manufacturing Practice Guide for Active Pharmaceutical Ingredients', '2000-11-10', 'https://database.ich.org/sites/default/files/Q7_Guideline.pdf', true),

-- =====================================================================
-- REGIONAL SPECIFIC (EU, APAC)
-- =====================================================================

('EMA Clinical Trials Regulation (CTR)', 'submission', 'EU', 'EMA', 'EU Clinical Trials Regulation 536/2014 - harmonized clinical trial approval process', '2022-01-31', 'https://www.ema.europa.eu/en/human-regulatory/research-development/clinical-trials/clinical-trials-regulation', true),

('PMDA GCP Ordinance', 'compliance', 'APAC', 'PMDA', 'Japan Pharmaceuticals and Medical Devices Agency Good Clinical Practice requirements', '1997-03-27', 'https://www.pmda.go.jp/english/index.html', true);

-- =====================================================================
-- VALIDATION
-- =====================================================================

DO $$
DECLARE
    framework_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO framework_count FROM regulatory_frameworks WHERE is_current = true;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'REGULATORY FRAMEWORKS SEED - VALIDATION';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Total Regulatory Frameworks Seeded: %', framework_count;
    RAISE NOTICE '';

    -- Breakdown by authority
    RAISE NOTICE 'By Authority:';
    FOR rec IN
        SELECT authority, COUNT(*) as count
        FROM regulatory_frameworks
        WHERE is_current = true
        GROUP BY authority
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  % : % frameworks', rec.authority, rec.count;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'By Region:';
    FOR rec IN
        SELECT region, COUNT(*) as count
        FROM regulatory_frameworks
        WHERE is_current = true
        GROUP BY region
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  % : % frameworks', rec.region, rec.count;
    END LOOP;

    RAISE NOTICE '';
    RAISE NOTICE 'By Framework Type:';
    FOR rec IN
        SELECT framework_type, COUNT(*) as count
        FROM regulatory_frameworks
        WHERE is_current = true
        GROUP BY framework_type
        ORDER BY count DESC
    LOOP
        RAISE NOTICE '  % : % frameworks', rec.framework_type, rec.count;
    END LOOP;

    RAISE NOTICE '';

    IF framework_count >= 20 THEN
        RAISE NOTICE 'SUCCESS: All core regulatory frameworks seeded successfully!';
    ELSE
        RAISE WARNING 'WARNING: Expected at least 20 frameworks, found %', framework_count;
    END IF;

    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;

COMMIT;

-- =====================================================================
-- USAGE NOTES
-- =====================================================================

/*
These regulatory frameworks represent the core standards that pharmaceutical
roles (especially Medical Affairs) must understand and comply with.

PROFICIENCY LEVELS (used in role_regulatory_frameworks junction):
- 'awareness' : Basic knowledge that framework exists and applies
- 'working_knowledge' : Can apply framework in daily work, knows key requirements
- 'advanced' : Deep understanding, can train others, interpret complex scenarios
- 'expert' : Subject matter expert, contributes to policy interpretation

TYPICAL MAPPINGS FOR MEDICAL AFFAIRS ROLES:

Medical Science Liaison (MSL):
- ICH GCP E6 (advanced) - Clinical trial conduct
- PhRMA Code (expert) - HCP interaction standards
- FDA Sunshine Act (working_knowledge) - Payment disclosure
- ICH E2A (working_knowledge) - Adverse event reporting

Medical Information Specialist:
- FDA 21 CFR Part 314.80 (advanced) - Safety reporting
- ICH E2A (advanced) - Adverse event definitions
- HIPAA (advanced) - Patient privacy
- FDA Promotional Regulations (expert) - Off-label communication

Medical Director:
- ICH GCP E6 (expert) - Clinical oversight
- FDA 21 CFR Part 312 (advanced) - IND regulations
- PhRMA Code (expert) - Compliance oversight
- ICH E8/E9 (advanced) - Clinical trial design

HEOR Manager:
- ICH E8 (working_knowledge) - Clinical trial design
- ICH E9 (advanced) - Statistical principles
- FDA 21 CFR Part 314 (working_knowledge) - NDA requirements

*/

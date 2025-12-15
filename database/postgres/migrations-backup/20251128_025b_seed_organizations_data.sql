-- ============================================================================
-- Migration: Seed Organizations Data (Part 2)
-- Date: 2025-11-28
-- Run this AFTER 025a_create_organizations_schema.sql
-- ============================================================================

-- Seed categories
INSERT INTO organization_categories (name, description, rag_priority_weight, display_order) VALUES
    ('regulatory', 'Government regulatory agencies and health authorities', 1.00, 1),
    ('pharma', 'Pharmaceutical and biotech companies', 0.85, 2),
    ('journal', 'Scientific and medical journals', 0.95, 3),
    ('consultancy', 'Healthcare and management consulting firms', 0.80, 4),
    ('research', 'Research institutions and universities', 0.90, 5),
    ('standards', 'Standards organizations (ISO, ICH, etc.)', 0.95, 6),
    ('payer', 'Insurance companies and healthcare payers', 0.75, 7),
    ('provider', 'Healthcare providers and hospital systems', 0.80, 8),
    ('technology', 'Healthcare technology and software companies', 0.70, 9),
    ('association', 'Professional and trade associations', 0.85, 10),
    ('media', 'News media and professional publications', 0.75, 11),
    ('accelerator', 'Startup accelerators and incubators', 0.70, 12),
    ('investor', 'Venture capital and investment firms', 0.70, 13),
    ('service_provider', 'CROs, CDMOs, and service providers', 0.75, 14),
    ('nonprofit', 'Nonprofit organizations and foundations', 0.80, 15)
ON CONFLICT (name) DO NOTHING;

-- Seed roles
INSERT INTO organization_roles (name, description) VALUES
    ('source', 'Organization that produces documents used in RAG knowledge base'),
    ('client', 'Customer organization using the platform'),
    ('partner', 'Strategic or business partner'),
    ('regulator', 'Regulatory oversight authority'),
    ('competitor', 'Competitive organization'),
    ('vendor', 'Supplier or service provider'),
    ('investor', 'Investment or funding organization'),
    ('collaborator', 'Research or project collaborator')
ON CONFLICT (name) DO NOTHING;

-- Seed regulatory agencies
INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url)
SELECT 'FDA', 'U.S. Food and Drug Administration', 'FDA', id, 'North America', 'United States', 'https://www.fda.gov', 10, 1.00, 'https://www.fda.gov/themes/custom/preview/assets/images/FDA-logo.svg'
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'EMA', 'European Medicines Agency', 'EMA', id, 'Europe', 'Netherlands', 'https://www.ema.europa.eu', 10, 1.00
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'WHO', 'World Health Organization', 'WHO', id, 'Global', 'Switzerland', 'https://www.who.int', 10, 1.00
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NIH', 'National Institutes of Health', 'NIH', id, 'North America', 'United States', 'https://www.nih.gov', 9, 0.95
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'CDC', 'Centers for Disease Control and Prevention', 'CDC', id, 'North America', 'United States', 'https://www.cdc.gov', 9, 0.95
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NICE', 'National Institute for Health and Care Excellence', 'NICE', id, 'Europe', 'United Kingdom', 'https://www.nice.org.uk', 9, 0.95
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'CMS', 'Centers for Medicare & Medicaid Services', 'CMS', id, 'North America', 'United States', 'https://www.cms.gov', 9, 0.95
FROM organization_categories WHERE name = 'regulatory' ON CONFLICT (code, tenant_id) DO NOTHING;

-- Seed journals
INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NEJM', 'New England Journal of Medicine', 'NEJM', id, 'North America', 'United States', 'https://www.nejm.org', 10, 0.95
FROM organization_categories WHERE name = 'journal' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'LANCET', 'The Lancet', 'Lancet', id, 'Europe', 'United Kingdom', 'https://www.thelancet.com', 10, 0.95
FROM organization_categories WHERE name = 'journal' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NATURE', 'Nature', 'Nature', id, 'Europe', 'United Kingdom', 'https://www.nature.com', 10, 0.95
FROM organization_categories WHERE name = 'journal' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'JAMA', 'Journal of the American Medical Association', 'JAMA', id, 'North America', 'United States', 'https://jamanetwork.com', 10, 0.95
FROM organization_categories WHERE name = 'journal' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'BMJ', 'British Medical Journal', 'BMJ', id, 'Europe', 'United Kingdom', 'https://www.bmj.com', 9, 0.90
FROM organization_categories WHERE name = 'journal' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'SCIENCE', 'Science', 'Science', id, 'North America', 'United States', 'https://www.science.org', 10, 0.95
FROM organization_categories WHERE name = 'journal' ON CONFLICT (code, tenant_id) DO NOTHING;

-- Seed consultancies
INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'MCKINSEY', 'McKinsey & Company', 'McKinsey', id, 'Global', 'United States', 'https://www.mckinsey.com', 8, 0.80
FROM organization_categories WHERE name = 'consultancy' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'DELOITTE', 'Deloitte', 'Deloitte', id, 'Global', 'United Kingdom', 'https://www.deloitte.com', 8, 0.80
FROM organization_categories WHERE name = 'consultancy' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'PWC', 'PricewaterhouseCoopers', 'PwC', id, 'Global', 'United Kingdom', 'https://www.pwc.com', 8, 0.80
FROM organization_categories WHERE name = 'consultancy' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'BCG', 'Boston Consulting Group', 'BCG', id, 'Global', 'United States', 'https://www.bcg.com', 8, 0.80
FROM organization_categories WHERE name = 'consultancy' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'IQVIA', 'IQVIA', 'IQVIA', id, 'Global', 'United States', 'https://www.iqvia.com', 8, 0.85
FROM organization_categories WHERE name = 'consultancy' ON CONFLICT (code, tenant_id) DO NOTHING;

-- Seed pharma companies
INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'PFE', 'Pfizer Inc.', 'Pfizer', id, 'North America', 'United States', 'https://www.pfizer.com', 7, 0.85, 'PFE'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'NVS', 'Novartis AG', 'Novartis', id, 'Europe', 'Switzerland', 'https://www.novartis.com', 7, 0.85, 'NVS'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'ROG', 'Roche Holding AG', 'Roche', id, 'Europe', 'Switzerland', 'https://www.roche.com', 7, 0.85, 'ROG'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'JNJ', 'Johnson & Johnson', 'J&J', id, 'North America', 'United States', 'https://www.jnj.com', 7, 0.85, 'JNJ'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'AZN', 'AstraZeneca PLC', 'AstraZeneca', id, 'Europe', 'United Kingdom', 'https://www.astrazeneca.com', 7, 0.85, 'AZN'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'LLY', 'Eli Lilly and Company', 'Eli Lilly', id, 'North America', 'United States', 'https://www.lilly.com', 7, 0.85, 'LLY'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'MRNA', 'Moderna Inc.', 'Moderna', id, 'North America', 'United States', 'https://www.modernatx.com', 7, 0.85, 'MRNA'
FROM organization_categories WHERE name = 'pharma' ON CONFLICT (code, tenant_id) DO NOTHING;

-- Seed standards organizations
INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'ICH', 'International Council for Harmonisation', 'ICH', id, 'Global', 'Switzerland', 'https://www.ich.org', 10, 1.00
FROM organization_categories WHERE name = 'standards' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'ISO', 'International Organization for Standardization', 'ISO', id, 'Global', 'Switzerland', 'https://www.iso.org', 9, 0.95
FROM organization_categories WHERE name = 'standards' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'CDISC', 'Clinical Data Interchange Standards Consortium', 'CDISC', id, 'Global', 'United States', 'https://www.cdisc.org', 8, 0.90
FROM organization_categories WHERE name = 'standards' ON CONFLICT (code, tenant_id) DO NOTHING;

-- Seed research institutions
INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'MAYO', 'Mayo Clinic', 'Mayo', id, 'North America', 'United States', 'https://www.mayoclinic.org', 9, 0.90
FROM organization_categories WHERE name = 'research' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'HOPKINS', 'Johns Hopkins Medicine', 'Hopkins', id, 'North America', 'United States', 'https://www.hopkinsmedicine.org', 9, 0.90
FROM organization_categories WHERE name = 'research' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'HARVARD', 'Harvard Medical School', 'Harvard', id, 'North America', 'United States', 'https://hms.harvard.edu', 9, 0.90
FROM organization_categories WHERE name = 'research' ON CONFLICT (code, tenant_id) DO NOTHING;

INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'STANFORD', 'Stanford Medicine', 'Stanford', id, 'North America', 'United States', 'https://med.stanford.edu', 9, 0.90
FROM organization_categories WHERE name = 'research' ON CONFLICT (code, tenant_id) DO NOTHING;

-- Assign source role to all organizations
INSERT INTO organization_role_assignments (organization_id, role_id, relationship_status)
SELECT o.id, r.id, 'active'
FROM organizations o, organization_roles r
WHERE r.name = 'source'
AND NOT EXISTS (
    SELECT 1 FROM organization_role_assignments ora
    WHERE ora.organization_id = o.id AND ora.role_id = r.id
);

-- Summary
DO $$
DECLARE v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count FROM organizations;
    RAISE NOTICE 'Organizations seeded: % total', v_count;
END $$;

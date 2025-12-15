-- ============================================================================
-- Migration: Create Organizations and Document Sources Tables
-- Date: 2025-11-28
-- Purpose: Unified organization management with multi-role support
--          Organizations can be sources, clients, partners, regulators, etc.
-- ============================================================================

BEGIN;

-- ============================================================================
-- ORGANIZATION CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rag_priority_weight NUMERIC(3,2) DEFAULT 1.00,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organization_categories IS 'Categories for organizations (regulatory, pharma, journal, consultancy, etc.)';

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

-- ============================================================================
-- ORGANIZATION ROLES
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE organization_roles IS 'Roles that organizations can have (source, client, partner, regulator, etc.)';

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

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    category_id UUID REFERENCES organization_categories(id),

    -- Location and identity
    region TEXT,
    country TEXT,
    city TEXT,

    -- Branding
    logo_url TEXT,
    logo_dark_url TEXT,
    brand_color TEXT,

    -- Contact & Web
    website TEXT,
    email TEXT,
    phone TEXT,

    -- Description
    about TEXT,

    -- Business info
    stock_ticker TEXT,
    founded_year INTEGER,
    employee_count INTEGER,

    -- RAG relevance
    authority_level INTEGER DEFAULT 5 CHECK (authority_level BETWEEN 1 AND 10),
    rag_priority_weight NUMERIC(3,2) DEFAULT 0.90,

    -- Multi-tenant support (null = global/system organization)
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Status
    is_active BOOLEAN DEFAULT true,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT organizations_code_tenant_unique UNIQUE(code, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_organizations_category ON organizations(category_id);
CREATE INDEX IF NOT EXISTS idx_organizations_code ON organizations(code);
CREATE INDEX IF NOT EXISTS idx_organizations_tenant ON organizations(tenant_id);
CREATE INDEX IF NOT EXISTS idx_organizations_region ON organizations(region);
CREATE INDEX IF NOT EXISTS idx_organizations_active ON organizations(is_active) WHERE is_active = true;

COMMENT ON TABLE organizations IS 'Master table of all organizations (sources, clients, partners, etc.)';
COMMENT ON COLUMN organizations.authority_level IS 'Authority level 1-10 (10=highest authority like FDA)';
COMMENT ON COLUMN organizations.rag_priority_weight IS 'Weight for RAG result ranking (0.00-1.00)';

-- ============================================================================
-- ORGANIZATION ROLE ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES organization_roles(id) ON DELETE CASCADE,

    -- Relationship details
    relationship_status TEXT DEFAULT 'active',
    contract_start_date DATE,
    contract_end_date DATE,
    notes TEXT,

    -- For tenant-specific roles
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT org_role_unique UNIQUE(organization_id, role_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_org_roles_org ON organization_role_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_role ON organization_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_tenant ON organization_role_assignments(tenant_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_status ON organization_role_assignments(relationship_status);

COMMENT ON TABLE organization_role_assignments IS 'Links organizations to their roles (many-to-many)';

-- ============================================================================
-- DOCUMENT SOURCES (Junction table)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,

    -- Source relationship type
    source_type TEXT NOT NULL DEFAULT 'primary',

    -- Citation details
    citation_text TEXT,
    page_references TEXT,
    section_references TEXT,

    -- Confidence in attribution
    confidence_score NUMERIC(3,2) DEFAULT 1.00,
    extraction_method TEXT DEFAULT 'manual',

    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    CONSTRAINT doc_source_unique UNIQUE(document_id, organization_id, source_type),
    CONSTRAINT source_type_check CHECK (source_type IN ('primary', 'publisher', 'reference', 'cited', 'sponsor'))
);

CREATE INDEX IF NOT EXISTS idx_doc_sources_doc ON document_sources(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_sources_org ON document_sources(organization_id);
CREATE INDEX IF NOT EXISTS idx_doc_sources_type ON document_sources(source_type);

COMMENT ON TABLE document_sources IS 'Links documents to their source organizations';
COMMENT ON COLUMN document_sources.source_type IS 'primary=authored by, publisher=published by, reference=cited, sponsor=funded by';

-- ============================================================================
-- SEED ORGANIZATIONS DATA
-- ============================================================================

-- Get category IDs for seeding
DO $$
DECLARE
    v_regulatory UUID;
    v_pharma UUID;
    v_journal UUID;
    v_consultancy UUID;
    v_research UUID;
    v_standards UUID;
    v_source_role UUID;
BEGIN
    -- Get category IDs
    SELECT id INTO v_regulatory FROM organization_categories WHERE name = 'regulatory';
    SELECT id INTO v_pharma FROM organization_categories WHERE name = 'pharma';
    SELECT id INTO v_journal FROM organization_categories WHERE name = 'journal';
    SELECT id INTO v_consultancy FROM organization_categories WHERE name = 'consultancy';
    SELECT id INTO v_research FROM organization_categories WHERE name = 'research';
    SELECT id INTO v_standards FROM organization_categories WHERE name = 'standards';
    SELECT id INTO v_source_role FROM organization_roles WHERE name = 'source';

    -- =========================================================================
    -- REGULATORY AGENCIES
    -- =========================================================================
    INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url) VALUES
        ('FDA', 'U.S. Food and Drug Administration', 'FDA', v_regulatory, 'North America', 'United States', 'https://www.fda.gov', 10, 1.00, 'https://www.fda.gov/themes/custom/preview/assets/images/FDA-logo.svg'),
        ('EMA', 'European Medicines Agency', 'EMA', v_regulatory, 'Europe', 'Netherlands', 'https://www.ema.europa.eu', 10, 1.00, 'https://www.ema.europa.eu/sites/all/themes/ema_flavor/logo.svg'),
        ('WHO', 'World Health Organization', 'WHO', v_regulatory, 'Global', 'Switzerland', 'https://www.who.int', 10, 1.00, 'https://www.who.int/images/default-source/infographics/who-emblem.png'),
        ('NIH', 'National Institutes of Health', 'NIH', v_regulatory, 'North America', 'United States', 'https://www.nih.gov', 9, 0.95, 'https://www.nih.gov/sites/default/files/styles/featured_media_breakpoint-medium/public/about-nih/2012-logo.png'),
        ('CDC', 'Centers for Disease Control and Prevention', 'CDC', v_regulatory, 'North America', 'United States', 'https://www.cdc.gov', 9, 0.95, 'https://www.cdc.gov/TemplatePackage/contrib/images/logo-notext.svg'),
        ('NICE', 'National Institute for Health and Care Excellence', 'NICE', v_regulatory, 'Europe', 'United Kingdom', 'https://www.nice.org.uk', 9, 0.95, 'https://www.nice.org.uk/Media/Default/Nice/logo.png'),
        ('MHRA', 'Medicines and Healthcare products Regulatory Agency', 'MHRA', v_regulatory, 'Europe', 'United Kingdom', 'https://www.gov.uk/government/organisations/mhra', 9, 0.95, NULL),
        ('PMDA', 'Pharmaceuticals and Medical Devices Agency', 'PMDA', v_regulatory, 'Asia', 'Japan', 'https://www.pmda.go.jp', 9, 0.95, NULL),
        ('TGA', 'Therapeutic Goods Administration', 'TGA', v_regulatory, 'Oceania', 'Australia', 'https://www.tga.gov.au', 9, 0.95, NULL),
        ('ANVISA', 'Brazilian Health Regulatory Agency', 'ANVISA', v_regulatory, 'South America', 'Brazil', 'https://www.gov.br/anvisa', 8, 0.90, NULL),
        ('NMPA', 'National Medical Products Administration', 'NMPA', v_regulatory, 'Asia', 'China', 'https://www.nmpa.gov.cn', 9, 0.90, NULL),
        ('CMS', 'Centers for Medicare & Medicaid Services', 'CMS', v_regulatory, 'North America', 'United States', 'https://www.cms.gov', 9, 0.95, NULL),
        ('HCPCS', 'Healthcare Common Procedure Coding System', 'HCPCS', v_standards, 'North America', 'United States', 'https://www.cms.gov/Medicare/Coding/MedHCPCSGenInfo', 8, 0.85, NULL)
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- =========================================================================
    -- SCIENTIFIC JOURNALS
    -- =========================================================================
    INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url) VALUES
        ('NEJM', 'New England Journal of Medicine', 'NEJM', v_journal, 'North America', 'United States', 'https://www.nejm.org', 10, 0.95, 'https://www.nejm.org/pb-assets/images/editorial/NEJM_Logo-1582129893413.svg'),
        ('LANCET', 'The Lancet', 'Lancet', v_journal, 'Europe', 'United Kingdom', 'https://www.thelancet.com', 10, 0.95, NULL),
        ('NATURE', 'Nature', 'Nature', v_journal, 'Europe', 'United Kingdom', 'https://www.nature.com', 10, 0.95, NULL),
        ('JAMA', 'Journal of the American Medical Association', 'JAMA', v_journal, 'North America', 'United States', 'https://jamanetwork.com', 10, 0.95, NULL),
        ('BMJ', 'British Medical Journal', 'BMJ', v_journal, 'Europe', 'United Kingdom', 'https://www.bmj.com', 9, 0.90, NULL),
        ('CELL', 'Cell', 'Cell', v_journal, 'North America', 'United States', 'https://www.cell.com', 9, 0.90, NULL),
        ('SCIENCE', 'Science', 'Science', v_journal, 'North America', 'United States', 'https://www.science.org', 10, 0.95, NULL),
        ('PLOS', 'PLOS Medicine', 'PLOS', v_journal, 'North America', 'United States', 'https://journals.plos.org/plosmedicine', 8, 0.85, NULL),
        ('ANNALS', 'Annals of Internal Medicine', 'Annals', v_journal, 'North America', 'United States', 'https://www.acpjournals.org/journal/aim', 9, 0.90, NULL)
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- =========================================================================
    -- CONSULTANCIES
    -- =========================================================================
    INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url) VALUES
        ('MCKINSEY', 'McKinsey & Company', 'McKinsey', v_consultancy, 'Global', 'United States', 'https://www.mckinsey.com', 8, 0.80, NULL),
        ('DELOITTE', 'Deloitte', 'Deloitte', v_consultancy, 'Global', 'United Kingdom', 'https://www.deloitte.com', 8, 0.80, NULL),
        ('PWC', 'PricewaterhouseCoopers', 'PwC', v_consultancy, 'Global', 'United Kingdom', 'https://www.pwc.com', 8, 0.80, NULL),
        ('EY', 'Ernst & Young', 'EY', v_consultancy, 'Global', 'United Kingdom', 'https://www.ey.com', 8, 0.80, NULL),
        ('BCG', 'Boston Consulting Group', 'BCG', v_consultancy, 'Global', 'United States', 'https://www.bcg.com', 8, 0.80, NULL),
        ('KPMG', 'KPMG International', 'KPMG', v_consultancy, 'Global', 'Netherlands', 'https://www.kpmg.com', 8, 0.80, NULL),
        ('ACCENTURE', 'Accenture', 'Accenture', v_consultancy, 'Global', 'Ireland', 'https://www.accenture.com', 7, 0.75, NULL),
        ('BAIN', 'Bain & Company', 'Bain', v_consultancy, 'Global', 'United States', 'https://www.bain.com', 8, 0.80, NULL),
        ('IQVIA', 'IQVIA', 'IQVIA', v_consultancy, 'Global', 'United States', 'https://www.iqvia.com', 8, 0.85, NULL)
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- =========================================================================
    -- PHARMACEUTICAL COMPANIES
    -- =========================================================================
    INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker, logo_url) VALUES
        ('PFE', 'Pfizer Inc.', 'Pfizer', v_pharma, 'North America', 'United States', 'https://www.pfizer.com', 7, 0.85, 'PFE', NULL),
        ('NVS', 'Novartis AG', 'Novartis', v_pharma, 'Europe', 'Switzerland', 'https://www.novartis.com', 7, 0.85, 'NVS', NULL),
        ('ROG', 'Roche Holding AG', 'Roche', v_pharma, 'Europe', 'Switzerland', 'https://www.roche.com', 7, 0.85, 'ROG', NULL),
        ('MRK', 'Merck & Co.', 'Merck', v_pharma, 'North America', 'United States', 'https://www.merck.com', 7, 0.85, 'MRK', NULL),
        ('JNJ', 'Johnson & Johnson', 'J&J', v_pharma, 'North America', 'United States', 'https://www.jnj.com', 7, 0.85, 'JNJ', NULL),
        ('AZN', 'AstraZeneca PLC', 'AstraZeneca', v_pharma, 'Europe', 'United Kingdom', 'https://www.astrazeneca.com', 7, 0.85, 'AZN', NULL),
        ('SNY', 'Sanofi S.A.', 'Sanofi', v_pharma, 'Europe', 'France', 'https://www.sanofi.com', 7, 0.85, 'SNY', NULL),
        ('GSK', 'GlaxoSmithKline PLC', 'GSK', v_pharma, 'Europe', 'United Kingdom', 'https://www.gsk.com', 7, 0.85, 'GSK', NULL),
        ('ABBV', 'AbbVie Inc.', 'AbbVie', v_pharma, 'North America', 'United States', 'https://www.abbvie.com', 7, 0.85, 'ABBV', NULL),
        ('LLY', 'Eli Lilly and Company', 'Eli Lilly', v_pharma, 'North America', 'United States', 'https://www.lilly.com', 7, 0.85, 'LLY', NULL),
        ('BMY', 'Bristol-Myers Squibb', 'BMS', v_pharma, 'North America', 'United States', 'https://www.bms.com', 7, 0.85, 'BMY', NULL),
        ('AMGN', 'Amgen Inc.', 'Amgen', v_pharma, 'North America', 'United States', 'https://www.amgen.com', 7, 0.85, 'AMGN', NULL),
        ('GILD', 'Gilead Sciences', 'Gilead', v_pharma, 'North America', 'United States', 'https://www.gilead.com', 7, 0.85, 'GILD', NULL),
        ('BIIB', 'Biogen Inc.', 'Biogen', v_pharma, 'North America', 'United States', 'https://www.biogen.com', 7, 0.85, 'BIIB', NULL),
        ('REGN', 'Regeneron Pharmaceuticals', 'Regeneron', v_pharma, 'North America', 'United States', 'https://www.regeneron.com', 7, 0.85, 'REGN', NULL),
        ('VRTX', 'Vertex Pharmaceuticals', 'Vertex', v_pharma, 'North America', 'United States', 'https://www.vrtx.com', 7, 0.85, 'VRTX', NULL),
        ('MRNA', 'Moderna Inc.', 'Moderna', v_pharma, 'North America', 'United States', 'https://www.modernatx.com', 7, 0.85, 'MRNA', NULL),
        ('BNTX', 'BioNTech SE', 'BioNTech', v_pharma, 'Europe', 'Germany', 'https://www.biontech.com', 7, 0.85, 'BNTX', NULL)
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- =========================================================================
    -- STANDARDS ORGANIZATIONS
    -- =========================================================================
    INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url) VALUES
        ('ICH', 'International Council for Harmonisation', 'ICH', v_standards, 'Global', 'Switzerland', 'https://www.ich.org', 10, 1.00, NULL),
        ('ISO', 'International Organization for Standardization', 'ISO', v_standards, 'Global', 'Switzerland', 'https://www.iso.org', 9, 0.95, NULL),
        ('IEC', 'International Electrotechnical Commission', 'IEC', v_standards, 'Global', 'Switzerland', 'https://www.iec.ch', 8, 0.90, NULL),
        ('HL7', 'Health Level Seven International', 'HL7', v_standards, 'Global', 'United States', 'https://www.hl7.org', 8, 0.90, NULL),
        ('DICOM', 'Digital Imaging and Communications in Medicine', 'DICOM', v_standards, 'Global', 'United States', 'https://www.dicomstandard.org', 8, 0.90, NULL),
        ('CDISC', 'Clinical Data Interchange Standards Consortium', 'CDISC', v_standards, 'Global', 'United States', 'https://www.cdisc.org', 8, 0.90, NULL)
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- =========================================================================
    -- RESEARCH INSTITUTIONS
    -- =========================================================================
    INSERT INTO organizations (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url) VALUES
        ('MAYO', 'Mayo Clinic', 'Mayo', v_research, 'North America', 'United States', 'https://www.mayoclinic.org', 9, 0.90, NULL),
        ('CLEVELAND', 'Cleveland Clinic', 'Cleveland', v_research, 'North America', 'United States', 'https://my.clevelandclinic.org', 9, 0.90, NULL),
        ('HOPKINS', 'Johns Hopkins Medicine', 'Hopkins', v_research, 'North America', 'United States', 'https://www.hopkinsmedicine.org', 9, 0.90, NULL),
        ('HARVARD', 'Harvard Medical School', 'Harvard', v_research, 'North America', 'United States', 'https://hms.harvard.edu', 9, 0.90, NULL),
        ('STANFORD', 'Stanford Medicine', 'Stanford', v_research, 'North America', 'United States', 'https://med.stanford.edu', 9, 0.90, NULL),
        ('MIT', 'Massachusetts Institute of Technology', 'MIT', v_research, 'North America', 'United States', 'https://www.mit.edu', 9, 0.90, NULL),
        ('OXFORD', 'University of Oxford', 'Oxford', v_research, 'Europe', 'United Kingdom', 'https://www.ox.ac.uk', 9, 0.90, NULL),
        ('CAMBRIDGE', 'University of Cambridge', 'Cambridge', v_research, 'Europe', 'United Kingdom', 'https://www.cam.ac.uk', 9, 0.90, NULL)
    ON CONFLICT (code, tenant_id) DO NOTHING;

    -- =========================================================================
    -- ASSIGN SOURCE ROLE TO ALL ORGANIZATIONS
    -- =========================================================================
    INSERT INTO organization_role_assignments (organization_id, role_id, relationship_status)
    SELECT o.id, v_source_role, 'active'
    FROM organizations o
    WHERE NOT EXISTS (
        SELECT 1 FROM organization_role_assignments ora
        WHERE ora.organization_id = o.id AND ora.role_id = v_source_role
    );

    RAISE NOTICE 'Seeded organizations with source role assignments';
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_organization_by_code(p_code TEXT)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    category_name TEXT,
    region TEXT,
    authority_level INTEGER,
    rag_priority_weight NUMERIC,
    logo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        o.id,
        o.code,
        o.name,
        oc.name as category_name,
        o.region,
        o.authority_level,
        o.rag_priority_weight,
        o.logo_url
    FROM organizations o
    LEFT JOIN organization_categories oc ON o.category_id = oc.id
    WHERE UPPER(o.code) = UPPER(p_code)
    AND o.is_active = true;
$$;

CREATE OR REPLACE FUNCTION get_organizations_by_category(p_category TEXT)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    region TEXT,
    authority_level INTEGER,
    rag_priority_weight NUMERIC,
    logo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        o.id,
        o.code,
        o.name,
        o.region,
        o.authority_level,
        o.rag_priority_weight,
        o.logo_url
    FROM organizations o
    JOIN organization_categories oc ON o.category_id = oc.id
    WHERE LOWER(oc.name) = LOWER(p_category)
    AND o.is_active = true
    ORDER BY o.authority_level DESC, o.name;
$$;

CREATE OR REPLACE FUNCTION get_organizations_by_role(p_role TEXT, p_tenant_id UUID DEFAULT NULL)
RETURNS TABLE (
    id UUID,
    code TEXT,
    name TEXT,
    category_name TEXT,
    region TEXT,
    logo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT DISTINCT
        o.id,
        o.code,
        o.name,
        oc.name as category_name,
        o.region,
        o.logo_url
    FROM organizations o
    JOIN organization_role_assignments ora ON o.id = ora.organization_id
    JOIN organization_roles r ON ora.role_id = r.id
    LEFT JOIN organization_categories oc ON o.category_id = oc.id
    WHERE LOWER(r.name) = LOWER(p_role)
    AND o.is_active = true
    AND ora.relationship_status = 'active'
    AND (p_tenant_id IS NULL OR ora.tenant_id IS NULL OR ora.tenant_id = p_tenant_id)
    ORDER BY o.name;
$$;

CREATE OR REPLACE FUNCTION get_document_sources(p_document_id UUID)
RETURNS TABLE (
    organization_id UUID,
    organization_code TEXT,
    organization_name TEXT,
    category_name TEXT,
    source_type TEXT,
    citation_text TEXT,
    logo_url TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        o.id as organization_id,
        o.code as organization_code,
        o.name as organization_name,
        oc.name as category_name,
        ds.source_type,
        ds.citation_text,
        o.logo_url
    FROM document_sources ds
    JOIN organizations o ON ds.organization_id = o.id
    LEFT JOIN organization_categories oc ON o.category_id = oc.id
    WHERE ds.document_id = p_document_id
    ORDER BY
        CASE ds.source_type
            WHEN 'primary' THEN 1
            WHEN 'publisher' THEN 2
            ELSE 3
        END;
$$;

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sources ENABLE ROW LEVEL SECURITY;

-- Organizations: viewable by all, but tenant-specific ones filtered
CREATE POLICY organizations_view_policy ON organizations
    FOR SELECT
    USING (
        tenant_id IS NULL
        OR tenant_id = COALESCE(
            current_setting('app.tenant_id', true)::UUID,
            (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY organizations_service_policy ON organizations
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Role assignments
CREATE POLICY org_roles_view_policy ON organization_role_assignments
    FOR SELECT
    USING (
        tenant_id IS NULL
        OR tenant_id = COALESCE(
            current_setting('app.tenant_id', true)::UUID,
            (SELECT organization_id FROM profiles WHERE id = auth.uid())
        )
    );

CREATE POLICY org_roles_service_policy ON organization_role_assignments
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Document sources
CREATE POLICY doc_sources_view_policy ON document_sources
    FOR SELECT
    USING (true);

CREATE POLICY doc_sources_service_policy ON document_sources
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
DECLARE
    v_org_count INTEGER;
    v_cat_count INTEGER;
    v_role_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_org_count FROM organizations;
    SELECT COUNT(*) INTO v_cat_count FROM organization_categories;
    SELECT COUNT(*) INTO v_role_count FROM organization_roles;

    RAISE NOTICE '';
    RAISE NOTICE '=== Organizations Migration Complete ===';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - organization_categories (% rows)', v_cat_count;
    RAISE NOTICE '  - organization_roles (% rows)', v_role_count;
    RAISE NOTICE '  - organizations (% rows)', v_org_count;
    RAISE NOTICE '  - organization_role_assignments';
    RAISE NOTICE '  - document_sources';
    RAISE NOTICE 'Functions:';
    RAISE NOTICE '  - get_organization_by_code(code)';
    RAISE NOTICE '  - get_organizations_by_category(category)';
    RAISE NOTICE '  - get_organizations_by_role(role, tenant_id)';
    RAISE NOTICE '  - get_document_sources(document_id)';
END $$;

COMMIT;

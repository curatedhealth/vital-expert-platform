-- ============================================================================
-- Migration: Create Sources Schema (Separate from Organizations)
-- Date: 2025-11-28
-- Purpose: Track document sources for RAG (FDA, journals, consultancies, etc.)
--          Keep organizations table for client instances
-- ============================================================================

-- ============================================================================
-- SOURCE CATEGORIES
-- ============================================================================

CREATE TABLE IF NOT EXISTS source_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rag_priority_weight NUMERIC(3,2) DEFAULT 1.00,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE source_categories IS 'Categories for document sources (regulatory, pharma, journal, consultancy, etc.)';

-- ============================================================================
-- SOURCES (Organizations that produce documents)
-- ============================================================================

CREATE TABLE IF NOT EXISTS sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    short_name TEXT,
    category_id UUID REFERENCES source_categories(id),
    region TEXT,
    country TEXT,
    city TEXT,
    logo_url TEXT,
    logo_dark_url TEXT,
    brand_color TEXT,
    website TEXT,
    about TEXT,
    stock_ticker TEXT,
    founded_year INTEGER,
    authority_level INTEGER DEFAULT 5 CHECK (authority_level BETWEEN 1 AND 10),
    rag_priority_weight NUMERIC(3,2) DEFAULT 0.90,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sources_category ON sources(category_id);
CREATE INDEX IF NOT EXISTS idx_sources_code ON sources(code);
CREATE INDEX IF NOT EXISTS idx_sources_region ON sources(region);
CREATE INDEX IF NOT EXISTS idx_sources_active ON sources(is_active) WHERE is_active = true;

COMMENT ON TABLE sources IS 'Organizations that produce documents for RAG knowledge base';
COMMENT ON COLUMN sources.authority_level IS 'Source authority 1-10 (10 = highest, e.g., FDA)';
COMMENT ON COLUMN sources.rag_priority_weight IS 'Weight for RAG ranking (0.00-1.00)';

-- ============================================================================
-- DOCUMENT SOURCE LINKS
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_source_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES sources(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL DEFAULT 'primary',
    citation_text TEXT,
    page_references TEXT,
    section_references TEXT,
    confidence_score NUMERIC(3,2) DEFAULT 1.00,
    extraction_method TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT doc_source_link_unique UNIQUE(document_id, source_id, source_type),
    CONSTRAINT source_link_type_check CHECK (source_type IN ('primary', 'publisher', 'reference', 'cited', 'sponsor'))
);

CREATE INDEX IF NOT EXISTS idx_doc_source_links_doc ON document_source_links(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_source_links_source ON document_source_links(source_id);

COMMENT ON TABLE document_source_links IS 'Links documents to their source organizations';

-- ============================================================================
-- ADD source_id TO knowledge_documents
-- ============================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_documents' AND column_name = 'source_id'
    ) THEN
        ALTER TABLE knowledge_documents
        ADD COLUMN source_id UUID REFERENCES sources(id);

        CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source
        ON knowledge_documents(source_id);

        RAISE NOTICE 'Added source_id column to knowledge_documents';
    END IF;
END $$;

-- ============================================================================
-- SEED SOURCE CATEGORIES
-- ============================================================================

INSERT INTO source_categories (name, description, rag_priority_weight, display_order) VALUES
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
-- SEED REGULATORY AGENCIES
-- ============================================================================

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, logo_url)
SELECT 'FDA', 'U.S. Food and Drug Administration', 'FDA', id, 'North America', 'United States', 'https://www.fda.gov', 10, 1.00, 'https://www.fda.gov/themes/custom/preview/assets/images/FDA-logo.svg'
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'EMA', 'European Medicines Agency', 'EMA', id, 'Europe', 'Netherlands', 'https://www.ema.europa.eu', 10, 1.00
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'WHO', 'World Health Organization', 'WHO', id, 'Global', 'Switzerland', 'https://www.who.int', 10, 1.00
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NIH', 'National Institutes of Health', 'NIH', id, 'North America', 'United States', 'https://www.nih.gov', 9, 0.95
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'CDC', 'Centers for Disease Control and Prevention', 'CDC', id, 'North America', 'United States', 'https://www.cdc.gov', 9, 0.95
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NICE', 'National Institute for Health and Care Excellence', 'NICE', id, 'Europe', 'United Kingdom', 'https://www.nice.org.uk', 9, 0.95
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'CMS', 'Centers for Medicare & Medicaid Services', 'CMS', id, 'North America', 'United States', 'https://www.cms.gov', 9, 0.95
FROM source_categories WHERE name = 'regulatory' ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED JOURNALS
-- ============================================================================

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NEJM', 'New England Journal of Medicine', 'NEJM', id, 'North America', 'United States', 'https://www.nejm.org', 10, 0.95
FROM source_categories WHERE name = 'journal' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'LANCET', 'The Lancet', 'Lancet', id, 'Europe', 'United Kingdom', 'https://www.thelancet.com', 10, 0.95
FROM source_categories WHERE name = 'journal' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'NATURE', 'Nature', 'Nature', id, 'Europe', 'United Kingdom', 'https://www.nature.com', 10, 0.95
FROM source_categories WHERE name = 'journal' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'JAMA', 'Journal of the American Medical Association', 'JAMA', id, 'North America', 'United States', 'https://jamanetwork.com', 10, 0.95
FROM source_categories WHERE name = 'journal' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'BMJ', 'British Medical Journal', 'BMJ', id, 'Europe', 'United Kingdom', 'https://www.bmj.com', 9, 0.90
FROM source_categories WHERE name = 'journal' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'SCIENCE', 'Science', 'Science', id, 'North America', 'United States', 'https://www.science.org', 10, 0.95
FROM source_categories WHERE name = 'journal' ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED CONSULTANCIES
-- ============================================================================

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'MCKINSEY', 'McKinsey & Company', 'McKinsey', id, 'Global', 'United States', 'https://www.mckinsey.com', 8, 0.80
FROM source_categories WHERE name = 'consultancy' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'DELOITTE', 'Deloitte', 'Deloitte', id, 'Global', 'United Kingdom', 'https://www.deloitte.com', 8, 0.80
FROM source_categories WHERE name = 'consultancy' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'PWC', 'PricewaterhouseCoopers', 'PwC', id, 'Global', 'United Kingdom', 'https://www.pwc.com', 8, 0.80
FROM source_categories WHERE name = 'consultancy' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'BCG', 'Boston Consulting Group', 'BCG', id, 'Global', 'United States', 'https://www.bcg.com', 8, 0.80
FROM source_categories WHERE name = 'consultancy' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'IQVIA', 'IQVIA', 'IQVIA', id, 'Global', 'United States', 'https://www.iqvia.com', 8, 0.85
FROM source_categories WHERE name = 'consultancy' ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED PHARMA COMPANIES
-- ============================================================================

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'PFE', 'Pfizer Inc.', 'Pfizer', id, 'North America', 'United States', 'https://www.pfizer.com', 7, 0.85, 'PFE'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'NVS', 'Novartis AG', 'Novartis', id, 'Europe', 'Switzerland', 'https://www.novartis.com', 7, 0.85, 'NVS'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'ROG', 'Roche Holding AG', 'Roche', id, 'Europe', 'Switzerland', 'https://www.roche.com', 7, 0.85, 'ROG'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'JNJ', 'Johnson & Johnson', 'J&J', id, 'North America', 'United States', 'https://www.jnj.com', 7, 0.85, 'JNJ'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'AZN', 'AstraZeneca PLC', 'AstraZeneca', id, 'Europe', 'United Kingdom', 'https://www.astrazeneca.com', 7, 0.85, 'AZN'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'LLY', 'Eli Lilly and Company', 'Eli Lilly', id, 'North America', 'United States', 'https://www.lilly.com', 7, 0.85, 'LLY'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight, stock_ticker)
SELECT 'MRNA', 'Moderna Inc.', 'Moderna', id, 'North America', 'United States', 'https://www.modernatx.com', 7, 0.85, 'MRNA'
FROM source_categories WHERE name = 'pharma' ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED STANDARDS ORGANIZATIONS
-- ============================================================================

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'ICH', 'International Council for Harmonisation', 'ICH', id, 'Global', 'Switzerland', 'https://www.ich.org', 10, 1.00
FROM source_categories WHERE name = 'standards' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'ISO', 'International Organization for Standardization', 'ISO', id, 'Global', 'Switzerland', 'https://www.iso.org', 9, 0.95
FROM source_categories WHERE name = 'standards' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'CDISC', 'Clinical Data Interchange Standards Consortium', 'CDISC', id, 'Global', 'United States', 'https://www.cdisc.org', 8, 0.90
FROM source_categories WHERE name = 'standards' ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- SEED RESEARCH INSTITUTIONS
-- ============================================================================

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'MAYO', 'Mayo Clinic', 'Mayo', id, 'North America', 'United States', 'https://www.mayoclinic.org', 9, 0.90
FROM source_categories WHERE name = 'research' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'HOPKINS', 'Johns Hopkins Medicine', 'Hopkins', id, 'North America', 'United States', 'https://www.hopkinsmedicine.org', 9, 0.90
FROM source_categories WHERE name = 'research' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'HARVARD', 'Harvard Medical School', 'Harvard', id, 'North America', 'United States', 'https://hms.harvard.edu', 9, 0.90
FROM source_categories WHERE name = 'research' ON CONFLICT (code) DO NOTHING;

INSERT INTO sources (code, name, short_name, category_id, region, country, website, authority_level, rag_priority_weight)
SELECT 'STANFORD', 'Stanford Medicine', 'Stanford', id, 'North America', 'United States', 'https://med.stanford.edu', 9, 0.90
FROM source_categories WHERE name = 'research' ON CONFLICT (code) DO NOTHING;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

CREATE OR REPLACE FUNCTION get_source_id(p_code TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM sources WHERE UPPER(code) = UPPER(p_code);
$$;

CREATE OR REPLACE FUNCTION get_source_category_id(p_name TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM source_categories WHERE LOWER(name) = LOWER(p_name);
$$;

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
DECLARE
    v_cat_count INTEGER;
    v_source_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_cat_count FROM source_categories;
    SELECT COUNT(*) INTO v_source_count FROM sources;

    RAISE NOTICE '';
    RAISE NOTICE '=== Sources Schema Migration Complete ===';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - source_categories (% rows)', v_cat_count;
    RAISE NOTICE '  - sources (% rows)', v_source_count;
    RAISE NOTICE '  - document_source_links';
    RAISE NOTICE 'Added source_id to knowledge_documents';
END $$;

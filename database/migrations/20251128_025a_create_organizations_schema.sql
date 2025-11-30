-- ============================================================================
-- Migration: Create Organizations Schema (Part 1 - Tables Only)
-- Date: 2025-11-28
-- Purpose: Create organization tables without seeding data
-- ============================================================================

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

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    code TEXT NOT NULL,
    name TEXT NOT NULL,
    short_name TEXT,
    category_id UUID REFERENCES organization_categories(id),
    region TEXT,
    country TEXT,
    city TEXT,
    logo_url TEXT,
    logo_dark_url TEXT,
    brand_color TEXT,
    website TEXT,
    email TEXT,
    phone TEXT,
    about TEXT,
    stock_ticker TEXT,
    founded_year INTEGER,
    employee_count INTEGER,
    authority_level INTEGER DEFAULT 5 CHECK (authority_level BETWEEN 1 AND 10),
    rag_priority_weight NUMERIC(3,2) DEFAULT 0.90,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
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

-- ============================================================================
-- ORGANIZATION ROLE ASSIGNMENTS
-- ============================================================================

CREATE TABLE IF NOT EXISTS organization_role_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    role_id UUID NOT NULL REFERENCES organization_roles(id) ON DELETE CASCADE,
    relationship_status TEXT DEFAULT 'active',
    contract_start_date DATE,
    contract_end_date DATE,
    notes TEXT,
    tenant_id UUID REFERENCES tenants(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT org_role_unique UNIQUE(organization_id, role_id, tenant_id)
);

CREATE INDEX IF NOT EXISTS idx_org_roles_org ON organization_role_assignments(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_role ON organization_role_assignments(role_id);
CREATE INDEX IF NOT EXISTS idx_org_roles_tenant ON organization_role_assignments(tenant_id);

-- ============================================================================
-- DOCUMENT SOURCES
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES knowledge_documents(id) ON DELETE CASCADE,
    organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    source_type TEXT NOT NULL DEFAULT 'primary',
    citation_text TEXT,
    page_references TEXT,
    section_references TEXT,
    confidence_score NUMERIC(3,2) DEFAULT 1.00,
    extraction_method TEXT DEFAULT 'manual',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT doc_source_unique UNIQUE(document_id, organization_id, source_type),
    CONSTRAINT source_type_check CHECK (source_type IN ('primary', 'publisher', 'reference', 'cited', 'sponsor'))
);

CREATE INDEX IF NOT EXISTS idx_doc_sources_doc ON document_sources(document_id);
CREATE INDEX IF NOT EXISTS idx_doc_sources_org ON document_sources(organization_id);

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE organization_role_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_sources ENABLE ROW LEVEL SECURITY;

CREATE POLICY organizations_view_policy ON organizations FOR SELECT USING (tenant_id IS NULL OR tenant_id = COALESCE(current_setting('app.tenant_id', true)::UUID, (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY organizations_service_policy ON organizations FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY org_roles_view_policy ON organization_role_assignments FOR SELECT USING (tenant_id IS NULL OR tenant_id = COALESCE(current_setting('app.tenant_id', true)::UUID, (SELECT organization_id FROM profiles WHERE id = auth.uid())));
CREATE POLICY org_roles_service_policy ON organization_role_assignments FOR ALL TO service_role USING (true) WITH CHECK (true);
CREATE POLICY doc_sources_view_policy ON document_sources FOR SELECT USING (true);
CREATE POLICY doc_sources_service_policy ON document_sources FOR ALL TO service_role USING (true) WITH CHECK (true);

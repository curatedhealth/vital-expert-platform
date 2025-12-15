-- ============================================================================
-- Migration: Create Document Taxonomy Tables
-- Date: 2025-11-28
-- Purpose: Add document types (content nature) and formats (media type)
--          for better RAG filtering and categorization
-- ============================================================================

BEGIN;

-- ============================================================================
-- DOCUMENT TYPES (Content Nature)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    rag_weight NUMERIC(3,2) DEFAULT 1.00,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE document_types IS 'Document content types (peer-review, guideline, white-paper, etc.)';
COMMENT ON COLUMN document_types.rag_weight IS 'Weight for RAG ranking (peer-reviewed > blog posts)';

-- Seed document types with RAG weights
INSERT INTO document_types (name, description, rag_weight, display_order) VALUES
    -- High authority (peer-reviewed / official)
    ('peer_review', 'Peer-reviewed scientific/medical research', 1.00, 1),
    ('guideline', 'Official guidelines and recommendations', 1.00, 2),
    ('directive', 'Regulatory directives and requirements', 1.00, 3),
    ('standard', 'Industry standards and specifications', 0.95, 4),
    ('systematic_review', 'Systematic reviews and meta-analyses', 0.98, 5),

    -- Medium authority (professional / analytical)
    ('report', 'Industry reports and analyses', 0.85, 6),
    ('white_paper', 'White papers and technical documents', 0.85, 7),
    ('case_study', 'Case studies and real-world examples', 0.80, 8),
    ('technical_brief', 'Technical briefs and summaries', 0.80, 9),
    ('point_of_view', 'Expert perspectives and opinions', 0.75, 10),
    ('conference_readout', 'Conference presentations and summaries', 0.80, 11),

    -- Lower authority (news / promotional)
    ('article', 'General articles and news coverage', 0.70, 12),
    ('press_release', 'Press releases and announcements', 0.60, 13),
    ('blog_post', 'Blog posts and informal content', 0.55, 14),
    ('interview', 'Interviews and Q&A sessions', 0.65, 15),
    ('newsletter', 'Newsletter content', 0.60, 16),

    -- Educational
    ('tutorial', 'How-to guides and tutorials', 0.70, 17),
    ('training', 'Training materials and courses', 0.75, 18),
    ('webinar', 'Webinar content and recordings', 0.70, 19),

    -- Other
    ('transcript', 'Transcripts (podcasts, videos, meetings)', 0.65, 20),
    ('data_sheet', 'Product data sheets and specifications', 0.80, 21),
    ('patent', 'Patents and intellectual property', 0.85, 22),
    ('clinical_trial', 'Clinical trial results and protocols', 0.95, 23),
    ('fda_submission', 'FDA submissions (510k, PMA, etc.)', 1.00, 24),
    ('other', 'Other/uncategorized', 0.50, 99)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- DOCUMENT FORMATS (Media Type)
-- ============================================================================

CREATE TABLE IF NOT EXISTS document_formats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    mime_types TEXT[],
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

COMMENT ON TABLE document_formats IS 'Document media formats (text, video, audio, etc.)';

-- Seed formats
INSERT INTO document_formats (name, description, mime_types, display_order) VALUES
    ('text', 'Text documents (PDF, Word, etc.)', ARRAY['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain', 'text/markdown'], 1),
    ('article', 'Web articles and HTML content', ARRAY['text/html', 'application/xhtml+xml'], 2),
    ('presentation', 'Slide presentations', ARRAY['application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'], 3),
    ('spreadsheet', 'Spreadsheets and data files', ARRAY['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'text/csv'], 4),
    ('video', 'Video content', ARRAY['video/mp4', 'video/webm', 'video/quicktime'], 5),
    ('audio', 'Audio content (podcasts, etc.)', ARRAY['audio/mpeg', 'audio/wav', 'audio/ogg'], 6),
    ('image', 'Image content (infographics, diagrams)', ARRAY['image/png', 'image/jpeg', 'image/svg+xml', 'image/gif'], 7),
    ('interactive', 'Interactive content (dashboards, apps)', ARRAY['application/json'], 8),
    ('other', 'Other formats', ARRAY[]::TEXT[], 99)
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- ADD COLUMNS TO KNOWLEDGE_DOCUMENTS (if table exists)
-- ============================================================================

DO $$
BEGIN
    -- Add document_type_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_documents' AND column_name = 'document_type_id'
    ) THEN
        ALTER TABLE knowledge_documents
        ADD COLUMN document_type_id UUID REFERENCES document_types(id);

        CREATE INDEX IF NOT EXISTS idx_knowledge_documents_type
        ON knowledge_documents(document_type_id);
    END IF;

    -- Add document_format_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_documents' AND column_name = 'document_format_id'
    ) THEN
        ALTER TABLE knowledge_documents
        ADD COLUMN document_format_id UUID REFERENCES document_formats(id);

        CREATE INDEX IF NOT EXISTS idx_knowledge_documents_format
        ON knowledge_documents(document_format_id);
    END IF;

    -- Add source_organization_id column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_documents' AND column_name = 'source_organization_id'
    ) THEN
        ALTER TABLE knowledge_documents
        ADD COLUMN source_organization_id UUID REFERENCES organizations(id);

        CREATE INDEX IF NOT EXISTS idx_knowledge_documents_source_org
        ON knowledge_documents(source_organization_id);
    END IF;

    -- Add publication_date column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_documents' AND column_name = 'publication_date'
    ) THEN
        ALTER TABLE knowledge_documents
        ADD COLUMN publication_date DATE;

        CREATE INDEX IF NOT EXISTS idx_knowledge_documents_pub_date
        ON knowledge_documents(publication_date DESC);
    END IF;

    -- Add language column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'knowledge_documents' AND column_name = 'language'
    ) THEN
        ALTER TABLE knowledge_documents
        ADD COLUMN language TEXT DEFAULT 'en';

        CREATE INDEX IF NOT EXISTS idx_knowledge_documents_language
        ON knowledge_documents(language);
    END IF;

    RAISE NOTICE 'Added taxonomy columns to knowledge_documents';
EXCEPTION
    WHEN undefined_table THEN
        RAISE NOTICE 'knowledge_documents table does not exist yet - columns will be added when table is created';
END $$;

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

/**
 * Get document type by name
 */
CREATE OR REPLACE FUNCTION get_document_type_id(p_type_name TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM document_types WHERE LOWER(name) = LOWER(p_type_name);
$$;

/**
 * Get document format by name
 */
CREATE OR REPLACE FUNCTION get_document_format_id(p_format_name TEXT)
RETURNS UUID
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT id FROM document_formats WHERE LOWER(name) = LOWER(p_format_name);
$$;

/**
 * Get documents by type with RAG weight
 */
CREATE OR REPLACE FUNCTION get_documents_by_type(
    p_tenant_id UUID,
    p_type_name TEXT,
    p_limit INTEGER DEFAULT 50
)
RETURNS TABLE (
    id UUID,
    title TEXT,
    document_type TEXT,
    rag_weight NUMERIC,
    source_organization TEXT,
    publication_date DATE
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        kd.id,
        kd.title,
        dt.name as document_type,
        dt.rag_weight,
        o.name as source_organization,
        kd.publication_date
    FROM knowledge_documents kd
    JOIN document_types dt ON kd.document_type_id = dt.id
    LEFT JOIN organizations o ON kd.source_organization_id = o.id
    WHERE kd.tenant_id = p_tenant_id
    AND LOWER(dt.name) = LOWER(p_type_name)
    ORDER BY kd.publication_date DESC NULLS LAST
    LIMIT p_limit;
$$;

/**
 * Get all document types with counts
 */
CREATE OR REPLACE FUNCTION get_document_type_stats(p_tenant_id UUID)
RETURNS TABLE (
    type_name TEXT,
    type_description TEXT,
    rag_weight NUMERIC,
    document_count BIGINT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT
        dt.name as type_name,
        dt.description as type_description,
        dt.rag_weight,
        COUNT(kd.id) as document_count
    FROM document_types dt
    LEFT JOIN knowledge_documents kd ON kd.document_type_id = dt.id
        AND kd.tenant_id = p_tenant_id
    GROUP BY dt.id, dt.name, dt.description, dt.rag_weight, dt.display_order
    ORDER BY dt.display_order;
$$;

-- ============================================================================
-- VALIDATION
-- ============================================================================

DO $$
DECLARE
    v_type_count INTEGER;
    v_format_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_type_count FROM document_types;
    SELECT COUNT(*) INTO v_format_count FROM document_formats;

    RAISE NOTICE '';
    RAISE NOTICE '=== Document Taxonomy Migration Complete ===';
    RAISE NOTICE 'Tables created:';
    RAISE NOTICE '  - document_types (% rows)', v_type_count;
    RAISE NOTICE '  - document_formats (% rows)', v_format_count;
    RAISE NOTICE 'Functions:';
    RAISE NOTICE '  - get_document_type_id(type_name)';
    RAISE NOTICE '  - get_document_format_id(format_name)';
    RAISE NOTICE '  - get_documents_by_type(tenant_id, type_name, limit)';
    RAISE NOTICE '  - get_document_type_stats(tenant_id)';
END $$;

COMMIT;

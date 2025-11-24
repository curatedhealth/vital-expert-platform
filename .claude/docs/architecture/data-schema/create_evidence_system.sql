-- =====================================================================
-- PHASE 1.1: CREATE EVIDENCE SOURCE SYSTEM
-- Implements comprehensive evidence tracking for all claims
-- All role and persona attributes can be traced back to evidence sources
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'CREATING EVIDENCE SOURCE SYSTEM';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 1. EVIDENCE SOURCES MASTER TABLE
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '1. Creating evidence_sources master table...'; END $$;

CREATE TABLE IF NOT EXISTS public.evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Source identification
    source_type TEXT NOT NULL CHECK (source_type IN (
        'publication', 'interview', 'survey', 'analytics', 
        'guideline', 'website', 'report', 'case_study', 
        'expert_opinion', 'internal_data'
    )),
    title TEXT NOT NULL,
    citation TEXT,
    description TEXT,
    
    -- Attribution
    authors TEXT,
    journal_or_origin TEXT,
    publisher TEXT,
    
    -- Publication details
    publication_date DATE,
    doi TEXT,
    url TEXT,
    isbn TEXT,
    
    -- Research quality
    sample_size INTEGER,
    methodology TEXT,
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    peer_reviewed BOOLEAN DEFAULT false,
    
    -- Metadata
    tags TEXT[],
    metadata JSONB DEFAULT '{}',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ,
    
    -- Full text search
    search_vector TSVECTOR
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_evidence_sources_source_type ON public.evidence_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_confidence ON public.evidence_sources(confidence_level);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_date ON public.evidence_sources(publication_date DESC);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_active ON public.evidence_sources(is_active) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_evidence_sources_tags ON public.evidence_sources USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_evidence_sources_search ON public.evidence_sources USING GIN(search_vector);

-- Trigger to update search vector
CREATE OR REPLACE FUNCTION update_evidence_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector := 
        setweight(to_tsvector('english', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('english', COALESCE(NEW.description, '')), 'B') ||
        setweight(to_tsvector('english', COALESCE(NEW.authors, '')), 'C') ||
        setweight(to_tsvector('english', COALESCE(NEW.citation, '')), 'D');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_evidence_search_vector ON public.evidence_sources;
CREATE TRIGGER trigger_evidence_search_vector
    BEFORE INSERT OR UPDATE OF title, description, authors, citation
    ON public.evidence_sources
    FOR EACH ROW
    EXECUTE FUNCTION update_evidence_search_vector();

DO $$ BEGIN RAISE NOTICE '  ✓ evidence_sources table created'; END $$;

-- =====================================================================
-- 2. GENERIC EVIDENCE LINKS TABLE (Most Flexible)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '2. Creating evidence_links generic junction...'; END $$;

CREATE TABLE IF NOT EXISTS public.evidence_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Evidence reference
    evidence_source_id UUID NOT NULL REFERENCES public.evidence_sources(id) ON DELETE CASCADE,
    
    -- Generic object reference (polymorphic)
    object_type TEXT NOT NULL, -- 'persona_pain_points', 'persona_goals', 'role_responsibilities', etc.
    object_id UUID NOT NULL,   -- PK of the referenced row
    
    -- Link metadata
    evidence_role TEXT CHECK (evidence_role IN ('supporting', 'contradicting', 'contextual', 'primary')),
    confidence_level TEXT CHECK (confidence_level IN ('low', 'medium', 'high', 'very_high')),
    relevance_notes TEXT,
    page_numbers TEXT,
    quote TEXT,
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(evidence_source_id, object_type, object_id)
);

-- Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_evidence_links_source ON public.evidence_links(evidence_source_id);
CREATE INDEX IF NOT EXISTS idx_evidence_links_object ON public.evidence_links(object_type, object_id);
CREATE INDEX IF NOT EXISTS idx_evidence_links_role ON public.evidence_links(evidence_role);

DO $$ BEGIN RAISE NOTICE '  ✓ evidence_links table created'; END $$;

-- =====================================================================
-- 3. ROLE EVIDENCE SOURCES (Direct Link)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '3. Creating role_evidence_sources junction...'; END $$;

CREATE TABLE IF NOT EXISTS public.role_evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    role_id UUID NOT NULL REFERENCES public.org_roles(id) ON DELETE CASCADE,
    evidence_source_id UUID NOT NULL REFERENCES public.evidence_sources(id) ON DELETE CASCADE,
    
    -- Metadata
    relevance_notes TEXT,
    applies_to_attributes TEXT[], -- ['responsibilities', 'tools', 'stakeholders', 'ai_maturity']
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(role_id, evidence_source_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_role_evidence_role ON public.role_evidence_sources(role_id);
CREATE INDEX IF NOT EXISTS idx_role_evidence_source ON public.role_evidence_sources(evidence_source_id);

DO $$ BEGIN RAISE NOTICE '  ✓ role_evidence_sources table created'; END $$;

-- =====================================================================
-- 4. PERSONA EVIDENCE SOURCES (Direct Link)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '4. Creating persona_evidence_sources junction...'; END $$;

CREATE TABLE IF NOT EXISTS public.persona_evidence_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- References
    persona_id UUID NOT NULL REFERENCES public.personas(id) ON DELETE CASCADE,
    evidence_source_id UUID NOT NULL REFERENCES public.evidence_sources(id) ON DELETE CASCADE,
    
    -- Metadata
    relevance_notes TEXT,
    applies_to_attributes TEXT[], -- ['goals', 'pain_points', 'motivations', 'work_style']
    
    -- Timestamps
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    
    UNIQUE(persona_id, evidence_source_id)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_persona_evidence_persona ON public.persona_evidence_sources(persona_id);
CREATE INDEX IF NOT EXISTS idx_persona_evidence_source ON public.persona_evidence_sources(evidence_source_id);

DO $$ BEGIN RAISE NOTICE '  ✓ persona_evidence_sources table created'; END $$;

-- =====================================================================
-- 5. EVIDENCE SUMMARY VIEWS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '5. Creating evidence summary views...'; END $$;

-- View: Role evidence summary (only if org_roles exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'org_roles') THEN
        CREATE OR REPLACE VIEW v_role_evidence_summary AS
        SELECT 
            r.id AS role_id,
            r.name AS role_name,
            r.slug AS role_slug,
            COUNT(DISTINCT res.evidence_source_id) AS direct_evidence_count,
            COUNT(DISTINCT el.evidence_source_id) AS attribute_evidence_count,
            COUNT(DISTINCT COALESCE(res.evidence_source_id, el.evidence_source_id)) AS total_evidence_count,
            ARRAY_AGG(DISTINCT es.source_type) FILTER (WHERE es.source_type IS NOT NULL) AS source_types,
            ARRAY_AGG(DISTINCT es.confidence_level) FILTER (WHERE es.confidence_level IS NOT NULL) AS confidence_levels
        FROM public.org_roles r
        LEFT JOIN public.role_evidence_sources res ON r.id = res.role_id
        LEFT JOIN public.evidence_links el ON el.object_type LIKE 'role_%' AND el.object_id = r.id
        LEFT JOIN public.evidence_sources es ON es.id = COALESCE(res.evidence_source_id, el.evidence_source_id)
        WHERE r.deleted_at IS NULL
        GROUP BY r.id, r.name, r.slug;
        
        RAISE NOTICE '  ✓ v_role_evidence_summary created';
    ELSE
        RAISE NOTICE '  ⚠ org_roles table does not exist - skipping v_role_evidence_summary';
    END IF;
END $$;

-- View: Persona evidence summary (only if personas exists)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'personas') THEN
        CREATE OR REPLACE VIEW v_persona_evidence_summary AS
        SELECT 
            p.id AS persona_id,
            p.name AS persona_name,
            p.slug AS persona_slug,
            COUNT(DISTINCT pes.evidence_source_id) AS direct_evidence_count,
            COUNT(DISTINCT el.evidence_source_id) AS attribute_evidence_count,
            COUNT(DISTINCT COALESCE(pes.evidence_source_id, el.evidence_source_id)) AS total_evidence_count,
            ARRAY_AGG(DISTINCT es.source_type) FILTER (WHERE es.source_type IS NOT NULL) AS source_types,
            ARRAY_AGG(DISTINCT es.confidence_level) FILTER (WHERE es.confidence_level IS NOT NULL) AS confidence_levels
        FROM public.personas p
        LEFT JOIN public.persona_evidence_sources pes ON p.id = pes.persona_id
        LEFT JOIN public.evidence_links el ON el.object_type LIKE 'persona_%' AND el.object_id = p.id
        LEFT JOIN public.evidence_sources es ON es.id = COALESCE(pes.evidence_source_id, el.evidence_source_id)
        WHERE p.deleted_at IS NULL
        GROUP BY p.id, p.name, p.slug;
        
        RAISE NOTICE '  ✓ v_persona_evidence_summary created';
    ELSE
        RAISE NOTICE '  ⚠ personas table does not exist - skipping v_persona_evidence_summary';
    END IF;
END $$;

DO $$ BEGIN RAISE NOTICE '  ✓ Evidence summary views section complete'; END $$;

-- =====================================================================
-- 6. HELPER FUNCTIONS
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '6. Creating helper functions...'; END $$;

-- Function to link evidence to any object
CREATE OR REPLACE FUNCTION link_evidence_to_object(
    p_evidence_source_id UUID,
    p_object_type TEXT,
    p_object_id UUID,
    p_evidence_role TEXT DEFAULT 'supporting',
    p_confidence_level TEXT DEFAULT 'medium',
    p_relevance_notes TEXT DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
    v_link_id UUID;
BEGIN
    INSERT INTO public.evidence_links (
        evidence_source_id,
        object_type,
        object_id,
        evidence_role,
        confidence_level,
        relevance_notes
    ) VALUES (
        p_evidence_source_id,
        p_object_type,
        p_object_id,
        p_evidence_role,
        p_confidence_level,
        p_relevance_notes
    )
    ON CONFLICT (evidence_source_id, object_type, object_id) 
    DO UPDATE SET
        evidence_role = EXCLUDED.evidence_role,
        confidence_level = EXCLUDED.confidence_level,
        relevance_notes = EXCLUDED.relevance_notes,
        updated_at = NOW()
    RETURNING id INTO v_link_id;
    
    RETURN v_link_id;
END;
$$ LANGUAGE plpgsql;

-- Function to get all evidence for an object
CREATE OR REPLACE FUNCTION get_object_evidence(
    p_object_type TEXT,
    p_object_id UUID
)
RETURNS TABLE (
    evidence_id UUID,
    source_type TEXT,
    title TEXT,
    citation TEXT,
    confidence_level TEXT,
    evidence_role TEXT,
    relevance_notes TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        es.id,
        es.source_type,
        es.title,
        es.citation,
        el.confidence_level,
        el.evidence_role,
        el.relevance_notes
    FROM public.evidence_links el
    JOIN public.evidence_sources es ON es.id = el.evidence_source_id
    WHERE el.object_type = p_object_type
      AND el.object_id = p_object_id
      AND es.deleted_at IS NULL
    ORDER BY es.publication_date DESC NULLS LAST, es.created_at DESC;
END;
$$ LANGUAGE plpgsql;

DO $$ BEGIN RAISE NOTICE '  ✓ Helper functions created'; END $$;

-- =====================================================================
-- 7. SAMPLE EVIDENCE DATA (For Testing)
-- =====================================================================

DO $$ BEGIN RAISE NOTICE '7. Inserting sample evidence sources...'; END $$;

INSERT INTO public.evidence_sources (
    source_type, title, citation, description, authors, 
    journal_or_origin, publication_date, confidence_level, peer_reviewed
) VALUES
    ('publication', 
     'Medical Science Liaison Role in Pharmaceutical Industry', 
     'Smith et al. (2023). Journal of Medical Affairs, 15(2), 45-67.',
     'Comprehensive study on MSL responsibilities, skills, and stakeholder engagement patterns in top 20 pharma companies.',
     'Smith J, Johnson M, Williams K',
     'Journal of Medical Affairs',
     '2023-03-15',
     'very_high',
     true),
    
    ('survey',
     'Global MSL Compensation and Job Satisfaction Survey 2023',
     'PharmaSalary Research (2023). Annual MSL Survey Report.',
     'Survey of 2,500+ MSLs across 15 countries covering compensation, tools, satisfaction, and career progression.',
     'PharmaSalary Research Team',
     'PharmaSalary.com',
     '2023-06-01',
     'high',
     false),
    
    ('guideline',
     'Medical Affairs Best Practices Framework',
     'MAPS (2022). Medical Affairs Professional Society Guidelines.',
     'Industry standard guidelines for Medical Affairs functions, roles, and operational excellence.',
     'MAPS Standards Committee',
     'Medical Affairs Professional Society',
     '2022-09-01',
     'very_high',
     false),
    
    ('report',
     'AI Adoption in Pharmaceutical Medical Affairs 2023',
     'Deloitte (2023). Life Sciences AI Transformation Report.',
     'Analysis of AI maturity and adoption patterns across Medical Affairs functions in Fortune 500 pharma.',
     'Deloitte Life Sciences Practice',
     'Deloitte Insights',
     '2023-11-15',
     'high',
     false)
ON CONFLICT DO NOTHING;

DO $$ BEGIN RAISE NOTICE '  ✓ Sample evidence sources inserted'; END $$;

-- =====================================================================
-- 8. SUMMARY
-- =====================================================================

DO $$
DECLARE
    evidence_count INTEGER;
    link_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO evidence_count FROM public.evidence_sources WHERE deleted_at IS NULL;
    SELECT COUNT(*) INTO link_count FROM public.evidence_links;
    
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE 'EVIDENCE SOURCE SYSTEM CREATED';
    RAISE NOTICE '=================================================================';
    RAISE NOTICE '';
    RAISE NOTICE 'Tables Created:';
    RAISE NOTICE '  ✓ evidence_sources (% sample records)', evidence_count;
    RAISE NOTICE '  ✓ evidence_links (generic polymorphic junction)';
    RAISE NOTICE '  ✓ role_evidence_sources (direct role links)';
    RAISE NOTICE '  ✓ persona_evidence_sources (direct persona links)';
    RAISE NOTICE '';
    RAISE NOTICE 'Views Created:';
    RAISE NOTICE '  ✓ v_role_evidence_summary';
    RAISE NOTICE '  ✓ v_persona_evidence_summary';
    RAISE NOTICE '';
    RAISE NOTICE 'Functions Created:';
    RAISE NOTICE '  ✓ link_evidence_to_object()';
    RAISE NOTICE '  ✓ get_object_evidence()';
    RAISE NOTICE '';
    RAISE NOTICE 'Features:';
    RAISE NOTICE '  • Full-text search on evidence sources';
    RAISE NOTICE '  • Confidence level tracking';
    RAISE NOTICE '  • Polymorphic evidence linking';
    RAISE NOTICE '  • Direct role/persona evidence junctions';
    RAISE NOTICE '  • Evidence summary views';
    RAISE NOTICE '';
    RAISE NOTICE 'Usage Example:';
    RAISE NOTICE '  SELECT * FROM get_object_evidence(''persona_goals'', <goal_id>);';
    RAISE NOTICE '';
    RAISE NOTICE '=================================================================';
END $$;


-- ============================================================================
-- SEED AGENT KG VIEWS: Define graph views for key agents
-- ============================================================================
-- Purpose: Create agent-specific KG views with filtered node/edge types
-- Run after: seed_kg_metadata.sql
-- Prerequisites: Agents must exist, kg_node_types and kg_edge_types must be populated
-- ============================================================================

-- Helper function to get node type IDs by names
CREATE OR REPLACE FUNCTION get_node_type_ids(node_names TEXT[])
RETURNS UUID[] AS $$
    SELECT ARRAY_AGG(id)
    FROM kg_node_types
    WHERE name = ANY(node_names);
$$ LANGUAGE SQL STABLE;

-- Helper function to get edge type IDs by names
CREATE OR REPLACE FUNCTION get_edge_type_ids(edge_names TEXT[])
RETURNS UUID[] AS $$
    SELECT ARRAY_AGG(id)
    FROM kg_edge_types
    WHERE name = ANY(edge_names);
$$ LANGUAGE SQL STABLE;

-- ============================================================================
-- SECTION 1: MEDICAL INFORMATION AGENT KG VIEW
-- ============================================================================

DO $$
DECLARE
    agent_rec RECORD;
    rag_profile_rec RECORD;
BEGIN
    -- Find Medical Information agent (adjust name/slug as needed)
    SELECT * INTO agent_rec
    FROM agents
    WHERE slug ILIKE '%medinfo%' OR slug ILIKE '%medical-information%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF agent_rec.id IS NOT NULL THEN
        -- Get default RAG profile
        SELECT * INTO rag_profile_rec
        FROM rag_profiles
        WHERE slug = 'hybrid_enhanced'
        LIMIT 1;
        
        INSERT INTO agent_kg_views (
            agent_id,
            rag_profile_id,
            name,
            description,
            include_nodes,
            include_edges,
            max_hops,
            graph_limit,
            depth_strategy
        ) VALUES (
            agent_rec.id,
            rag_profile_rec.id,
            'medinfo_standard_view',
            'Standard view for medical information queries - drugs, diseases, guidelines, evidence',
            get_node_type_ids(ARRAY['Drug', 'Disease', 'Indication', 'Contraindication', 'Adverse_Event', 
                                      'Guideline', 'Publication', 'Evidence', 'Label', 'Clinical_Trial']),
            get_edge_type_ids(ARRAY['TREATS', 'INDICATED_FOR', 'CONTRAINDICATED_WITH', 'CAUSES',
                                     'SUPPORTED_BY', 'RECOMMENDS', 'CITES', 'STUDIED_IN']),
            3,
            100,
            'entity-centric'
        ) ON CONFLICT (agent_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            include_nodes = EXCLUDED.include_nodes,
            include_edges = EXCLUDED.include_edges,
            updated_at = NOW();
            
        RAISE NOTICE '✓ Created KG view for Medical Information agent';
    ELSE
        RAISE NOTICE '⚠ Medical Information agent not found - skipping';
    END IF;
END $$;

-- ============================================================================
-- SECTION 2: REGULATORY STRATEGIST AGENT KG VIEW
-- ============================================================================

DO $$
DECLARE
    agent_rec RECORD;
    rag_profile_rec RECORD;
BEGIN
    SELECT * INTO agent_rec
    FROM agents
    WHERE slug ILIKE '%regulatory%' OR title ILIKE '%regulatory%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF agent_rec.id IS NOT NULL THEN
        SELECT * INTO rag_profile_rec
        FROM rag_profiles
        WHERE slug = 'graphrag_entity'
        LIMIT 1;
        
        INSERT INTO agent_kg_views (
            agent_id,
            rag_profile_id,
            name,
            description,
            include_nodes,
            include_edges,
            max_hops,
            graph_limit,
            depth_strategy
        ) VALUES (
            agent_rec.id,
            rag_profile_rec.id,
            'regulatory_compliance_view',
            'Regulatory compliance view - regulations, approvals, guidelines, trials',
            get_node_type_ids(ARRAY['Drug', 'Regulation', 'Guideline', 'Clinical_Trial', 'Label',
                                      'Market', 'Publication', 'Evidence', 'Patent']),
            get_edge_type_ids(ARRAY['REGULATES', 'APPROVED_IN', 'SUPPORTED_BY', 'RECOMMENDS',
                                     'STUDIED_IN', 'CITES', 'PROTECTS']),
            4,
            150,
            'breadth'
        ) ON CONFLICT (agent_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            include_nodes = EXCLUDED.include_nodes,
            include_edges = EXCLUDED.include_edges,
            updated_at = NOW();
            
        RAISE NOTICE '✓ Created KG view for Regulatory Strategist agent';
    ELSE
        RAISE NOTICE '⚠ Regulatory agent not found - skipping';
    END IF;
END $$;

-- ============================================================================
-- SECTION 3: MSL (MEDICAL SCIENCE LIAISON) AGENT KG VIEW
-- ============================================================================

DO $$
DECLARE
    agent_rec RECORD;
    rag_profile_rec RECORD;
BEGIN
    SELECT * INTO agent_rec
    FROM agents
    WHERE slug ILIKE '%msl%' OR title ILIKE '%medical science liaison%' OR title ILIKE '%field medical%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF agent_rec.id IS NOT NULL THEN
        SELECT * INTO rag_profile_rec
        FROM rag_profiles
        WHERE slug = 'agent_optimized'
        LIMIT 1;
        
        INSERT INTO agent_kg_views (
            agent_id,
            rag_profile_id,
            name,
            description,
            include_nodes,
            include_edges,
            max_hops,
            graph_limit,
            depth_strategy
        ) VALUES (
            agent_rec.id,
            rag_profile_rec.id,
            'msl_stakeholder_view',
            'MSL view - KOLs, institutions, publications, clinical insights',
            get_node_type_ids(ARRAY['Drug', 'Disease', 'Clinical_Trial', 'Publication', 'Guideline',
                                      'KOL', 'Institution', 'Evidence', 'Insight', 'Gap']),
            get_edge_type_ids(ARRAY['TREATS', 'STUDIED_IN', 'SUPPORTED_BY', 'AUTHORED_BY',
                                     'AFFILIATED_WITH', 'ENDORSES', 'RECOMMENDS', 'GENERATES']),
            3,
            120,
            'entity-centric'
        ) ON CONFLICT (agent_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            include_nodes = EXCLUDED.include_nodes,
            include_edges = EXCLUDED.include_edges,
            updated_at = NOW();
            
        RAISE NOTICE '✓ Created KG view for MSL agent';
    ELSE
        RAISE NOTICE '⚠ MSL agent not found - skipping';
    END IF;
END $$;

-- ============================================================================
-- SECTION 4: MARKET ACCESS AGENT KG VIEW
-- ============================================================================

DO $$
DECLARE
    agent_rec RECORD;
    rag_profile_rec RECORD;
BEGIN
    SELECT * INTO agent_rec
    FROM agents
    WHERE slug ILIKE '%market-access%' OR title ILIKE '%market access%' OR title ILIKE '%payer%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF agent_rec.id IS NOT NULL THEN
        SELECT * INTO rag_profile_rec
        FROM rag_profiles
        WHERE slug = 'hybrid_enhanced'
        LIMIT 1;
        
        INSERT INTO agent_kg_views (
            agent_id,
            rag_profile_id,
            name,
            description,
            include_nodes,
            include_edges,
            max_hops,
            graph_limit,
            depth_strategy
        ) VALUES (
            agent_rec.id,
            rag_profile_rec.id,
            'market_access_view',
            'Market access view - payers, markets, competitors, coverage',
            get_node_type_ids(ARRAY['Drug', 'Market', 'Payer', 'Provider', 'Competitor',
                                      'Evidence', 'Guideline', 'Publication', 'Regulation']),
            get_edge_type_ids(ARRAY['COVERS', 'COMPETES_WITH', 'APPROVED_IN', 'PRESCRIBES',
                                     'SUPPORTED_BY', 'RECOMMENDS', 'REGULATES']),
            3,
            100,
            'breadth'
        ) ON CONFLICT (agent_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            include_nodes = EXCLUDED.include_nodes,
            include_edges = EXCLUDED.include_edges,
            updated_at = NOW();
            
        RAISE NOTICE '✓ Created KG view for Market Access agent';
    ELSE
        RAISE NOTICE '⚠ Market Access agent not found - skipping';
    END IF;
END $$;

-- ============================================================================
-- SECTION 5: CLINICAL DEVELOPMENT AGENT KG VIEW
-- ============================================================================

DO $$
DECLARE
    agent_rec RECORD;
    rag_profile_rec RECORD;
BEGIN
    SELECT * INTO agent_rec
    FROM agents
    WHERE slug ILIKE '%clinical-development%' OR title ILIKE '%clinical development%' OR slug ILIKE '%clinical-research%'
    ORDER BY created_at DESC
    LIMIT 1;
    
    IF agent_rec.id IS NOT NULL THEN
        SELECT * INTO rag_profile_rec
        FROM rag_profiles
        WHERE slug = 'graphrag_entity'
        LIMIT 1;
        
        INSERT INTO agent_kg_views (
            agent_id,
            rag_profile_id,
            name,
            description,
            include_nodes,
            include_edges,
            max_hops,
            graph_limit,
            depth_strategy
        ) VALUES (
            agent_rec.id,
            rag_profile_rec.id,
            'clinical_development_view',
            'Clinical development view - trials, biomarkers, endpoints, evidence',
            get_node_type_ids(ARRAY['Drug', 'Disease', 'Clinical_Trial', 'Biomarker', 'Indication',
                                      'Adverse_Event', 'Publication', 'Evidence', 'Guideline']),
            get_edge_type_ids(ARRAY['TREATS', 'STUDIED_IN', 'TARGETS', 'CAUSES', 'INDICATED_FOR',
                                     'SUPPORTED_BY', 'RECOMMENDS', 'CITES']),
            4,
            150,
            'depth'
        ) ON CONFLICT (agent_id, name) DO UPDATE SET
            description = EXCLUDED.description,
            include_nodes = EXCLUDED.include_nodes,
            include_edges = EXCLUDED.include_edges,
            updated_at = NOW();
            
        RAISE NOTICE '✓ Created KG view for Clinical Development agent';
    ELSE
        RAISE NOTICE '⚠ Clinical Development agent not found - skipping';
    END IF;
END $$;

-- Clean up helper functions
DROP FUNCTION IF EXISTS get_node_type_ids(TEXT[]);
DROP FUNCTION IF EXISTS get_edge_type_ids(TEXT[]);

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
    view_count INTEGER;
    rec RECORD;
BEGIN
    SELECT COUNT(*) INTO view_count FROM agent_kg_views;
    
    RAISE NOTICE '=== AGENT KG VIEWS SEED SUMMARY ===';
    RAISE NOTICE 'Agent KG views created: %', view_count;
    RAISE NOTICE '';
    
    IF view_count > 0 THEN
        RAISE NOTICE 'STATUS: ✓ Agent KG views seeded successfully';
    ELSE
        RAISE NOTICE 'STATUS: ⚠ No agent KG views created (agents may not exist yet)';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== AGENT KG VIEWS BREAKDOWN ===';
    
    -- List created views
    FOR rec IN 
        SELECT a.name as agent_name, akv.name as view_name, akv.max_hops, akv.depth_strategy
        FROM agent_kg_views akv
        JOIN agents a ON akv.agent_id = a.id
        ORDER BY a.name
    LOOP
        RAISE NOTICE '  - % (%): max_hops=%, strategy=%', 
            rec.agent_name, rec.view_name, rec.max_hops, rec.depth_strategy;
    END LOOP;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== NEXT STEPS ===';
    RAISE NOTICE '1. Sync KG metadata to Neo4j';
    RAISE NOTICE '2. Begin Phase 1: GraphRAG Foundation implementation';
    RAISE NOTICE '3. Test graph traversal with agent-specific filters';
END $$;


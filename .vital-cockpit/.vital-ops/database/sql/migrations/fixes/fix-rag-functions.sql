-- RAG Function Fixes
-- Apply these fixes to complete the RAG-agent integration system

-- Fix 1: Update get_global_rag_databases function
CREATE OR REPLACE FUNCTION get_global_rag_databases()
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    purpose_description TEXT,
    knowledge_domains TEXT[],
    document_count INTEGER,
    total_chunks INTEGER,
    last_indexed_at TIMESTAMPTZ,
    quality_score DECIMAL
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rkb.id,
        rkb.name::TEXT,
        rkb.display_name::TEXT,
        rkb.description::TEXT,
        rkb.purpose_description::TEXT,
        rkb.knowledge_domains,
        rkb.document_count,
        rkb.total_chunks,
        rkb.last_indexed_at,
        rkb.quality_score
    FROM rag_knowledge_bases rkb
    WHERE rkb.rag_type = 'global'
    AND rkb.status = 'active'
    AND (rkb.is_public = true OR rkb.access_level IN ('public', 'organization'))
    ORDER BY rkb.quality_score DESC NULLS LAST, rkb.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 2: Update get_available_rag_for_agent function
CREATE OR REPLACE FUNCTION get_available_rag_for_agent(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    purpose_description TEXT,
    rag_type TEXT,
    knowledge_domains TEXT[],
    document_count INTEGER,
    is_assigned BOOLEAN,
    assignment_priority INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rkb.id,
        rkb.name::TEXT,
        rkb.display_name::TEXT,
        rkb.description::TEXT,
        rkb.purpose_description::TEXT,
        rkb.rag_type::TEXT,
        rkb.knowledge_domains,
        rkb.document_count,
        CASE WHEN ara.rag_id IS NOT NULL THEN true ELSE false END as is_assigned,
        COALESCE(ara.priority, 0) as assignment_priority
    FROM rag_knowledge_bases rkb
    LEFT JOIN agent_rag_assignments ara ON rkb.id = ara.rag_id
        AND ara.agent_id = (
            SELECT a.id FROM agents a
            WHERE a.name = agent_name_param OR a.display_name = agent_name_param
            LIMIT 1
        )
    WHERE rkb.status = 'active'
    AND (rkb.is_public = true OR rkb.access_level IN ('public', 'organization'))
    ORDER BY
        is_assigned DESC,
        assignment_priority DESC,
        rkb.rag_type,
        rkb.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 3: Update get_agent_assigned_rag function
CREATE OR REPLACE FUNCTION get_agent_assigned_rag(agent_name_param TEXT)
RETURNS TABLE (
    id UUID,
    name TEXT,
    display_name TEXT,
    description TEXT,
    purpose_description TEXT,
    usage_context TEXT,
    priority INTEGER,
    is_primary BOOLEAN,
    document_count INTEGER,
    last_used_at TIMESTAMPTZ,
    custom_prompt_instructions TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        rkb.id,
        rkb.name::TEXT,
        rkb.display_name::TEXT,
        rkb.description::TEXT,
        rkb.purpose_description::TEXT,
        ara.usage_context::TEXT,
        ara.priority,
        ara.is_primary,
        rkb.document_count,
        ara.last_used_at,
        ara.custom_prompt_instructions::TEXT
    FROM rag_knowledge_bases rkb
    INNER JOIN agent_rag_assignments ara ON rkb.id = ara.rag_id
    INNER JOIN agents a ON ara.agent_id = a.id
    WHERE (a.name = agent_name_param OR a.display_name = agent_name_param)
    AND rkb.status = 'active'
    ORDER BY ara.is_primary DESC, ara.priority DESC, rkb.display_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fix 4: Update RLS policies to allow proper access
-- Drop and recreate admin policy for rag_knowledge_bases
DROP POLICY IF EXISTS "Admin users can manage RAG knowledge bases" ON rag_knowledge_bases;
CREATE POLICY "Admin users can manage RAG knowledge bases"
    ON rag_knowledge_bases FOR ALL
    USING (true)
    WITH CHECK (true);

-- Allow authenticated users to create RAG databases
DROP POLICY IF EXISTS "Authenticated users can create RAG" ON rag_knowledge_bases;
CREATE POLICY "Authenticated users can create RAG"
    ON rag_knowledge_bases FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update their RAG databases
DROP POLICY IF EXISTS "Users can update their RAG" ON rag_knowledge_bases;
CREATE POLICY "Users can update their RAG"
    ON rag_knowledge_bases FOR UPDATE
    TO authenticated
    USING (created_by = auth.uid() OR auth.jwt() ->> 'email' IN ('admin@vitalpath.ai', 'hicham@vitalpath.ai'));

-- Grant additional permissions
GRANT ALL ON rag_knowledge_bases TO authenticated;
GRANT ALL ON agent_rag_assignments TO authenticated;
GRANT ALL ON rag_documents TO authenticated;
GRANT ALL ON rag_usage_analytics TO authenticated;

-- Grant function permissions
GRANT EXECUTE ON FUNCTION get_global_rag_databases() TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_available_rag_for_agent(TEXT) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION get_agent_assigned_rag(TEXT) TO authenticated, anon;
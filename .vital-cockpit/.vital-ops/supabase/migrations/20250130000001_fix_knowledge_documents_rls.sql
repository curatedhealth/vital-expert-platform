-- Fix RLS policies for knowledge_documents to allow service_role access
-- This migration ensures the API can access documents via service_role key

-- Drop existing restrictive policies if they exist
DROP POLICY IF EXISTS "knowledge_documents_authenticated" ON knowledge_documents;
DROP POLICY IF EXISTS "Users can view public documents" ON knowledge_documents;
DROP POLICY IF EXISTS "Users can create documents" ON knowledge_documents;
DROP POLICY IF EXISTS "knowledge_documents_org_access" ON knowledge_documents;
DROP POLICY IF EXISTS "knowledge_documents_org_insert" ON knowledge_documents;

-- Drop document_chunks restrictive policies
DROP POLICY IF EXISTS "document_chunks_authenticated" ON document_chunks;
DROP POLICY IF EXISTS "document_chunks_doc_access" ON document_chunks;

-- Create service_role policy (bypasses RLS, which is critical for API access)
-- Service role has full access to all documents (for API operations)
CREATE POLICY "service_role_full_access_knowledge_documents" ON knowledge_documents
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

CREATE POLICY "service_role_full_access_document_chunks" ON document_chunks
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create authenticated user policies (less restrictive for frontend)
CREATE POLICY "authenticated_users_read_knowledge_documents" ON knowledge_documents
  FOR SELECT
  TO authenticated
  USING (true); -- Allow all authenticated users to read (can restrict later if needed)

CREATE POLICY "authenticated_users_insert_knowledge_documents" ON knowledge_documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "authenticated_users_read_document_chunks" ON document_chunks
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM knowledge_documents
      WHERE knowledge_documents.id = document_chunks.document_id
    )
  );

-- Grant explicit permissions
GRANT ALL ON knowledge_documents TO service_role;
GRANT ALL ON document_chunks TO service_role;
GRANT SELECT, INSERT ON knowledge_documents TO authenticated;
GRANT SELECT ON document_chunks TO authenticated;

-- Verify RLS is enabled
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Add comment for documentation
COMMENT ON POLICY "service_role_full_access_knowledge_documents" ON knowledge_documents IS 
  'Service role has full access to all documents for API operations. This bypasses RLS restrictions.';

COMMENT ON POLICY "service_role_full_access_document_chunks" ON document_chunks IS 
  'Service role has full access to all document chunks for API operations.';


-- Create knowledge_documents table for VITAL Path platform
-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- Create knowledge_documents table
CREATE TABLE IF NOT EXISTS knowledge_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID REFERENCES organizations(id),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  upload_url TEXT,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
  domain VARCHAR(100), -- 'clinical', 'regulatory', 'market-access', etc.
  tags TEXT[],
  metadata JSONB DEFAULT '{}',

  -- Vector search fields
  embedding vector(1536), -- OpenAI embedding dimension
  chunk_count INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create document_chunks table for RAG functionality
CREATE TABLE IF NOT EXISTS document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  embedding vector(1536),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,

  UNIQUE(document_id, chunk_index)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_org ON knowledge_documents(organization_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_user ON knowledge_documents(user_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_domain ON knowledge_documents(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_documents_created ON knowledge_documents(created_at);

CREATE INDEX IF NOT EXISTS idx_document_chunks_doc ON document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_created ON document_chunks(created_at);

-- Create vector similarity search indexes (if pgvector is enabled)
-- CREATE INDEX IF NOT EXISTS idx_knowledge_documents_embedding ON knowledge_documents USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);
-- CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding ON document_chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = 100);

-- Row Level Security policies
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access documents from their organization
CREATE POLICY "knowledge_documents_org_access" ON knowledge_documents
  FOR ALL USING (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
  );

-- Policy: Users can insert documents to their organization
CREATE POLICY "knowledge_documents_org_insert" ON knowledge_documents
  FOR INSERT WITH CHECK (
    organization_id IN (
      SELECT organization_id FROM user_profiles WHERE id = auth.uid()
    )
    AND user_id = auth.uid()
  );

-- Policy: Document chunks follow document access
CREATE POLICY "document_chunks_doc_access" ON document_chunks
  FOR ALL USING (
    document_id IN (
      SELECT id FROM knowledge_documents WHERE
      organization_id IN (
        SELECT organization_id FROM user_profiles WHERE id = auth.uid()
      )
    )
  );

-- Grant necessary permissions
GRANT ALL ON knowledge_documents TO authenticated;
GRANT ALL ON document_chunks TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- Insert some sample documents (optional)
-- INSERT INTO knowledge_documents (organization_id, user_id, title, content, domain, status)
-- SELECT
--   (SELECT id FROM organizations LIMIT 1),
--   auth.uid(),
--   'Sample Medical Document',
--   'This is a sample medical document for testing purposes.',
--   'clinical',
--   'completed'
-- WHERE auth.uid() IS NOT NULL;

COMMENT ON TABLE knowledge_documents IS 'Stores uploaded documents for RAG functionality';
COMMENT ON TABLE document_chunks IS 'Stores document chunks with embeddings for vector search';
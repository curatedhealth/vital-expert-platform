-- Create knowledge_documents table (simplified version)
-- Run this SQL in your Supabase Dashboard -> SQL Editor

-- Drop existing table if it has conflicts
DROP TABLE IF EXISTS document_chunks CASCADE;
DROP TABLE IF EXISTS knowledge_documents CASCADE;

-- Create knowledge_documents table
CREATE TABLE knowledge_documents (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  organization_id UUID,
  user_id UUID REFERENCES auth.users(id),
  title VARCHAR(255) NOT NULL,
  content TEXT,
  file_name VARCHAR(255),
  file_type VARCHAR(100),
  file_size INTEGER,
  upload_url TEXT,
  status VARCHAR(50) DEFAULT 'pending',
  domain VARCHAR(100),
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  chunk_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Create document_chunks table for RAG functionality
CREATE TABLE document_chunks (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
  chunk_index INTEGER NOT NULL,
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(document_id, chunk_index)
);

-- Create basic indexes for performance
CREATE INDEX idx_knowledge_documents_user ON knowledge_documents(user_id);
CREATE INDEX idx_knowledge_documents_status ON knowledge_documents(status);
CREATE INDEX idx_knowledge_documents_domain ON knowledge_documents(domain);
CREATE INDEX idx_knowledge_documents_created ON knowledge_documents(created_at);
CREATE INDEX idx_document_chunks_doc ON document_chunks(document_id);

-- Enable Row Level Security
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;

-- Simple RLS policies - allow all authenticated users for now
CREATE POLICY "knowledge_documents_authenticated" ON knowledge_documents
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "document_chunks_authenticated" ON document_chunks
  FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON knowledge_documents TO authenticated;
GRANT ALL ON document_chunks TO authenticated;

-- Insert a sample document for testing
INSERT INTO knowledge_documents (
  title,
  content,
  file_name,
  file_type,
  status,
  domain
) VALUES (
  'Welcome to VITAL Path',
  'This is a sample healthcare document for testing the knowledge base functionality.',
  'welcome.txt',
  'text/plain',
  'completed',
  'general'
);

-- Verify the table was created
SELECT 'knowledge_documents table created successfully' as status;
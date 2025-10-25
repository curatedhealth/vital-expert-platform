-- Create generated_documents table for Ask Expert document generation
-- Migration: 20250125000002_create_generated_documents_table.sql

CREATE TABLE IF NOT EXISTS generated_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  template_id VARCHAR(100) NOT NULL,
  format VARCHAR(10) NOT NULL CHECK (format IN ('pdf', 'docx', 'xlsx', 'md')),
  content TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_generated_documents_conversation
  ON generated_documents(conversation_id);

CREATE INDEX IF NOT EXISTS idx_generated_documents_user
  ON generated_documents(user_id);

CREATE INDEX IF NOT EXISTS idx_generated_documents_created
  ON generated_documents(created_at DESC);

-- Enable Row Level Security
ALTER TABLE generated_documents ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view their own documents"
  ON generated_documents
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own documents"
  ON generated_documents
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own documents"
  ON generated_documents
  FOR DELETE
  USING (auth.uid() = user_id);

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_generated_documents_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_generated_documents_updated_at
  BEFORE UPDATE ON generated_documents
  FOR EACH ROW
  EXECUTE FUNCTION update_generated_documents_updated_at();

-- Add comment
COMMENT ON TABLE generated_documents IS 'Stores generated documents from Ask Expert conversations';

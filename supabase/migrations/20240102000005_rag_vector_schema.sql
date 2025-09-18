-- Enable the vector extension for embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- Create knowledge_sources table for document/content management
CREATE TABLE IF NOT EXISTS knowledge_sources (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(255) NOT NULL,
  source_type varchar(100) NOT NULL, -- 'fda_guidance', 'clinical_trial', 'payer_policy', etc.
  source_url text,
  file_path text,
  file_size bigint,
  mime_type varchar(100),

  -- Content metadata
  title text NOT NULL,
  description text,
  authors text[],
  publication_date date,
  last_updated date,
  version varchar(50),

  -- Categorization
  domain varchar(100) NOT NULL, -- regulatory-affairs, clinical-research, etc.
  category varchar(100) NOT NULL, -- guidance, protocol, policy, etc.
  tags text[] DEFAULT '{}',

  -- Content processing
  content_hash varchar(64) UNIQUE, -- SHA256 of content for deduplication
  processing_status varchar(50) DEFAULT 'pending', -- pending, processing, completed, error
  processed_at timestamptz,

  -- Quality metrics
  confidence_score decimal(3,2) DEFAULT 1.0,
  relevance_score decimal(3,2) DEFAULT 1.0,

  -- Access control
  is_public boolean DEFAULT true,
  access_level varchar(50) DEFAULT 'public', -- public, organization, agent-specific
  restricted_to_agents uuid[] DEFAULT '{}',

  -- Lifecycle
  status varchar(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'archived', 'deprecated')),
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Indexes for performance
  CONSTRAINT knowledge_sources_content_hash_key UNIQUE (content_hash)
);

-- Create document_chunks table for storing processed text chunks with embeddings
CREATE TABLE IF NOT EXISTS document_chunks (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  knowledge_source_id uuid NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Chunk content
  content text NOT NULL,
  content_length integer NOT NULL,
  chunk_index integer NOT NULL, -- Order within the document

  -- Chunk metadata
  section_title text,
  page_number integer,
  table_data jsonb, -- Structured table data if chunk contains tables
  figure_captions text[],

  -- Multiple embeddings for different models
  embedding_openai vector(1536), -- text-embedding-ada-002
  embedding_clinical vector(768), -- ClinicalBERT/PubMedBERT
  embedding_legal vector(768), -- Legal-BERT
  embedding_scientific vector(768), -- SciBERT

  -- Embedding metadata
  embedding_model_versions jsonb DEFAULT '{}', -- Track which model versions were used
  embedding_created_at timestamptz DEFAULT now(),

  -- Content analysis
  keywords text[] DEFAULT '{}',
  entities jsonb DEFAULT '{}', -- NER results: {"DRUG": ["aspirin"], "DISEASE": ["diabetes"]}
  sentiment_score decimal(3,2),

  -- Quality metrics
  chunk_quality_score decimal(3,2) DEFAULT 1.0,
  retrieval_count integer DEFAULT 0, -- How many times this chunk was retrieved
  feedback_score decimal(3,2), -- User feedback on relevance

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  -- Constraints
  CONSTRAINT document_chunks_source_chunk_index_key UNIQUE (knowledge_source_id, chunk_index)
);

-- Create vector indexes for different embedding types
CREATE INDEX IF NOT EXISTS document_chunks_embedding_openai_idx
  ON document_chunks USING ivfflat (embedding_openai vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_clinical_idx
  ON document_chunks USING ivfflat (embedding_clinical vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_legal_idx
  ON document_chunks USING ivfflat (embedding_legal vector_cosine_ops) WITH (lists = 100);

CREATE INDEX IF NOT EXISTS document_chunks_embedding_scientific_idx
  ON document_chunks USING ivfflat (embedding_scientific vector_cosine_ops) WITH (lists = 100);

-- Create knowledge_domains table for organizing content by domain
CREATE TABLE IF NOT EXISTS knowledge_domains (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name varchar(100) NOT NULL UNIQUE,
  display_name varchar(255) NOT NULL,
  description text,

  -- Configuration
  preferred_embedding_model varchar(100) NOT NULL, -- 'openai', 'clinical', 'legal', 'scientific'
  retrieval_strategy varchar(50) DEFAULT 'semantic', -- semantic, hybrid, keyword

  -- Content statistics
  total_sources integer DEFAULT 0,
  total_chunks integer DEFAULT 0,
  total_size_mb decimal(10,2) DEFAULT 0.0,
  last_updated timestamptz,

  -- Quality metrics
  average_quality_score decimal(3,2) DEFAULT 0.0,

  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- Create agent_knowledge_access table for tracking agent-specific access patterns
CREATE TABLE IF NOT EXISTS agent_knowledge_access (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  knowledge_source_id uuid NOT NULL REFERENCES knowledge_sources(id) ON DELETE CASCADE,

  -- Access metrics
  access_count integer DEFAULT 0,
  last_accessed_at timestamptz DEFAULT now(),

  -- Performance tracking
  average_retrieval_time_ms integer DEFAULT 0,
  success_rate decimal(3,2) DEFAULT 1.0,

  -- Feedback
  relevance_feedback jsonb DEFAULT '{}', -- User ratings and feedback

  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,

  CONSTRAINT agent_knowledge_access_unique UNIQUE (agent_id, knowledge_source_id)
);

-- Create query_logs table for tracking retrieval queries and performance
CREATE TABLE IF NOT EXISTS query_logs (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  agent_id uuid REFERENCES agents(id),
  user_id uuid, -- If available from auth

  -- Query details
  query_text text NOT NULL,
  query_embedding vector(1536),
  query_domain varchar(100),

  -- Retrieval configuration
  embedding_model varchar(100),
  retrieval_strategy varchar(50),
  top_k integer,
  filters jsonb DEFAULT '{}',

  -- Results
  retrieved_chunks uuid[] DEFAULT '{}', -- Array of document_chunk IDs
  total_results integer,
  retrieval_time_ms integer,

  -- Quality metrics
  user_rating integer CHECK (user_rating >= 1 AND user_rating <= 5),
  user_feedback text,
  relevance_score decimal(3,2),

  -- Context
  session_id uuid,
  conversation_context jsonb DEFAULT '{}',

  created_at timestamptz DEFAULT now() NOT NULL
);

-- Insert knowledge domains that align with our capability categories
INSERT INTO knowledge_domains (name, display_name, description, preferred_embedding_model, retrieval_strategy) VALUES
('regulatory-affairs', 'Regulatory Affairs', 'FDA, EMA and global regulatory guidance and requirements', 'legal', 'hybrid'),
('clinical-research', 'Clinical Research', 'Clinical trial protocols, evidence, and research methodologies', 'clinical', 'semantic'),
('market-access', 'Market Access & Reimbursement', 'Payer policies, coverage determinations, and health economics', 'openai', 'hybrid'),
('medical-communications', 'Medical Writing & Communications', 'Document templates, guidelines, and medical writing resources', 'scientific', 'semantic'),
('digital-health', 'Digital Health & DTx', 'Digital therapeutics, AI/ML validation, and digital biomarkers', 'clinical', 'semantic'),
('quality-assurance', 'Quality & Compliance', 'GxP compliance, quality systems, and audit procedures', 'legal', 'hybrid'),
('business-intelligence', 'Market & Competitive Intelligence', 'Market analysis, competitive data, and business intelligence', 'openai', 'keyword'),
('research', 'Scientific Literature', 'Published research, systematic reviews, and evidence synthesis', 'clinical', 'semantic');

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_domain ON knowledge_sources(domain);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_category ON knowledge_sources(category);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_status ON knowledge_sources(status);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_source_type ON knowledge_sources(source_type);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_publication_date ON knowledge_sources(publication_date);
CREATE INDEX IF NOT EXISTS idx_knowledge_sources_tags ON knowledge_sources USING GIN(tags);

CREATE INDEX IF NOT EXISTS idx_document_chunks_source_id ON document_chunks(knowledge_source_id);
CREATE INDEX IF NOT EXISTS idx_document_chunks_keywords ON document_chunks USING GIN(keywords);
CREATE INDEX IF NOT EXISTS idx_document_chunks_entities ON document_chunks USING GIN(entities);
CREATE INDEX IF NOT EXISTS idx_document_chunks_quality ON document_chunks(chunk_quality_score);

CREATE INDEX IF NOT EXISTS idx_agent_knowledge_access_agent_id ON agent_knowledge_access(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_knowledge_access_last_accessed ON agent_knowledge_access(last_accessed_at);

CREATE INDEX IF NOT EXISTS idx_query_logs_agent_id ON query_logs(agent_id);
CREATE INDEX IF NOT EXISTS idx_query_logs_created_at ON query_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_query_logs_domain ON query_logs(query_domain);

-- Enable Row Level Security
ALTER TABLE knowledge_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_domains ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_knowledge_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE query_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for knowledge sources (read access for authenticated users)
CREATE POLICY "knowledge_sources_read_policy" ON knowledge_sources
  FOR SELECT USING (
    is_public = true OR
    auth.role() = 'authenticated'
  );

CREATE POLICY "document_chunks_read_policy" ON document_chunks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM knowledge_sources ks
      WHERE ks.id = document_chunks.knowledge_source_id
      AND (ks.is_public = true OR auth.role() = 'authenticated')
    )
  );

-- Admin write access policies
CREATE POLICY "knowledge_admin_write_policy" ON knowledge_sources
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

CREATE POLICY "chunks_admin_write_policy" ON document_chunks
  FOR ALL USING (
    auth.jwt() ->> 'email' IN (
      'admin@vitalpath.ai',
      'hicham@vitalpath.ai'
    )
  );

-- Create read policies for other tables
CREATE POLICY "knowledge_domains_read_policy" ON knowledge_domains
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "agent_knowledge_access_read_policy" ON agent_knowledge_access
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "query_logs_user_policy" ON query_logs
  FOR ALL USING (
    auth.uid()::text = user_id::text OR
    auth.jwt() ->> 'email' IN ('admin@vitalpath.ai', 'hicham@vitalpath.ai')
  );

-- Create triggers for updated_at timestamps
CREATE TRIGGER update_knowledge_sources_updated_at BEFORE UPDATE ON knowledge_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_chunks_updated_at BEFORE UPDATE ON document_chunks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_domains_updated_at BEFORE UPDATE ON knowledge_domains
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_agent_knowledge_access_updated_at BEFORE UPDATE ON agent_knowledge_access
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create functions for vector similarity search
CREATE OR REPLACE FUNCTION search_knowledge_by_embedding(
  query_embedding vector(1536),
  domain_filter text DEFAULT NULL,
  embedding_model text DEFAULT 'openai',
  max_results integer DEFAULT 10,
  similarity_threshold decimal DEFAULT 0.7
)
RETURNS TABLE (
  chunk_id uuid,
  source_id uuid,
  content text,
  similarity decimal,
  source_title text,
  domain text,
  metadata jsonb
) AS $$
DECLARE
  embedding_column text;
BEGIN
  -- Determine which embedding column to use
  embedding_column := CASE embedding_model
    WHEN 'clinical' THEN 'embedding_clinical'
    WHEN 'legal' THEN 'embedding_legal'
    WHEN 'scientific' THEN 'embedding_scientific'
    ELSE 'embedding_openai'
  END;

  -- Dynamic query based on embedding model
  RETURN QUERY EXECUTE format('
    SELECT
      dc.id as chunk_id,
      dc.knowledge_source_id as source_id,
      dc.content,
      (1 - (dc.%I <=> $1))::decimal as similarity,
      ks.title as source_title,
      ks.domain,
      jsonb_build_object(
        ''section_title'', dc.section_title,
        ''page_number'', dc.page_number,
        ''keywords'', dc.keywords,
        ''entities'', dc.entities
      ) as metadata
    FROM document_chunks dc
    JOIN knowledge_sources ks ON dc.knowledge_source_id = ks.id
    WHERE
      ks.status = ''active''
      AND dc.%I IS NOT NULL
      AND (1 - (dc.%I <=> $1)) >= $4
      AND ($2 IS NULL OR ks.domain = $2)
    ORDER BY dc.%I <=> $1
    LIMIT $3
  ', embedding_column, embedding_column, embedding_column, embedding_column)
  USING query_embedding, domain_filter, max_results, similarity_threshold;
END;
$$ LANGUAGE plpgsql;

-- Create function to get agent-optimized knowledge search
CREATE OR REPLACE FUNCTION search_knowledge_for_agent(
  agent_id_param uuid,
  query_text_param text,
  query_embedding_param vector(1536),
  max_results integer DEFAULT 10
)
RETURNS TABLE (
  chunk_id uuid,
  content text,
  similarity decimal,
  source_title text,
  relevance_boost decimal
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    sk.chunk_id,
    sk.content,
    sk.similarity,
    sk.source_title,
    -- Boost relevance based on agent's historical access patterns
    CASE
      WHEN aka.access_count > 0 THEN sk.similarity * (1 + (aka.success_rate * 0.2))
      ELSE sk.similarity
    END as relevance_boost
  FROM search_knowledge_by_embedding(
    query_embedding_param,
    (SELECT COALESCE(
      (SELECT kd.name
       FROM knowledge_domains kd
       JOIN agents a ON a.id = agent_id_param
       -- Get primary domain based on agent's primary capabilities
       LIMIT 1),
      NULL)
    )
  ) sk
  LEFT JOIN agent_knowledge_access aka ON aka.knowledge_source_id = sk.source_id
    AND aka.agent_id = agent_id_param
  ORDER BY relevance_boost DESC
  LIMIT max_results;
END;
$$ LANGUAGE plpgsql;
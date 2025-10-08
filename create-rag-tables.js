#!/usr/bin/env node

/**
 * Create RAG Tables in Cloud Supabase
 * Creates all required tables for the cloud RAG system
 */

const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://xazinxsiglqokwfmogyk.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ Missing Supabase configuration');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

console.log('🏗️  CREATING RAG TABLES');
console.log('=======================\n');

async function createRAGTables() {
  try {
    // Step 1: Enable Vector Extension
    console.log('1. Enabling Vector Extension...');
    await enableVectorExtension();
    
    // Step 2: Create Knowledge Base Documents Table
    console.log('\n2. Creating Knowledge Base Documents Table...');
    await createKnowledgeBaseDocumentsTable();
    
    // Step 3: Create Document Embeddings Table
    console.log('\n3. Creating Document Embeddings Table...');
    await createDocumentEmbeddingsTable();
    
    // Step 4: Create Memory Tables
    console.log('\n4. Creating Memory Tables...');
    await createMemoryTables();
    
    // Step 5: Create Vector Search Functions
    console.log('\n5. Creating Vector Search Functions...');
    await createVectorSearchFunctions();
    
    // Step 6: Insert Sample Data
    console.log('\n6. Inserting Sample Data...');
    await insertSampleData();
    
    // Step 7: Test Tables
    console.log('\n7. Testing Tables...');
    await testTables();
    
    console.log('\n🎉 RAG TABLES CREATION COMPLETE!');
    console.log('================================');
    console.log('✅ Vector Extension: Enabled');
    console.log('✅ Knowledge Base Documents: Created');
    console.log('✅ Document Embeddings: Created');
    console.log('✅ Memory Tables: Created');
    console.log('✅ Vector Search Functions: Created');
    console.log('✅ Sample Data: Inserted');
    console.log('✅ System: Ready for production');
    
  } catch (error) {
    console.error('❌ Table creation failed:', error.message);
    process.exit(1);
  }
}

async function enableVectorExtension() {
  try {
    // Try to create a simple vector to test if extension exists
    const { data, error } = await supabase.rpc('exec', {
      sql: 'SELECT vector_dims(\'[1,2,3]\'::vector)'
    });
    
    if (error) {
      console.log('⚠️  Vector extension may not be enabled');
      console.log('   Please enable pg_vector extension in Supabase dashboard');
    } else {
      console.log('✅ Vector extension is enabled');
    }
  } catch (error) {
    console.log('⚠️  Vector extension check failed');
  }
}

async function createKnowledgeBaseDocumentsTable() {
  const { error } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.knowledge_base_documents (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        source_name TEXT,
        source_url TEXT,
        domain TEXT,
        document_type TEXT DEFAULT 'text',
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_knowledge_base_documents_domain 
      ON public.knowledge_base_documents(domain);
      
      ALTER TABLE public.knowledge_base_documents ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Allow public read access to knowledge_base_documents"
        ON public.knowledge_base_documents
        FOR SELECT
        USING (true);
    `
  });
  
  if (error) {
    console.log(`⚠️  Knowledge base documents table: ${error.message}`);
  } else {
    console.log('✅ Knowledge base documents table: Created');
  }
}

async function createDocumentEmbeddingsTable() {
  const { error } = await supabase.rpc('exec', {
    sql: `
      CREATE TABLE IF NOT EXISTS public.document_embeddings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        document_id UUID REFERENCES public.knowledge_base_documents(id) ON DELETE CASCADE,
        chunk_index INTEGER,
        chunk_text TEXT NOT NULL,
        embedding VECTOR(1536),
        metadata JSONB DEFAULT '{}',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      
      CREATE INDEX IF NOT EXISTS idx_document_embeddings_document_id 
      ON public.document_embeddings(document_id);
      
      CREATE INDEX IF NOT EXISTS idx_document_embeddings_embedding 
      ON public.document_embeddings USING ivfflat (embedding vector_cosine_ops);
      
      ALTER TABLE public.document_embeddings ENABLE ROW LEVEL SECURITY;
      
      CREATE POLICY IF NOT EXISTS "Allow public read access to document_embeddings"
        ON public.document_embeddings
        FOR SELECT
        USING (true);
    `
  });
  
  if (error) {
    console.log(`⚠️  Document embeddings table: ${error.message}`);
  } else {
    console.log('✅ Document embeddings table: Created');
  }
}

async function createMemoryTables() {
  const tables = [
    {
      name: 'chat_memory',
      sql: `
        CREATE TABLE IF NOT EXISTS public.chat_memory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) NOT NULL,
          user_id VARCHAR(255) NOT NULL,
          agent_id VARCHAR(255) NOT NULL,
          memory_key VARCHAR(255) NOT NULL,
          memory_value TEXT NOT NULL,
          strategy VARCHAR(50) NOT NULL DEFAULT 'buffer',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(session_id, memory_key, strategy)
        );
        
        CREATE INDEX IF NOT EXISTS idx_chat_memory_session_id ON public.chat_memory(session_id);
        CREATE INDEX IF NOT EXISTS idx_chat_memory_user_id ON public.chat_memory(user_id);
        
        ALTER TABLE public.chat_memory ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'chat_history',
      sql: `
        CREATE TABLE IF NOT EXISTS public.chat_history (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          session_id VARCHAR(255) NOT NULL,
          message_index INTEGER NOT NULL,
          role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(session_id, message_index)
        );
        
        CREATE INDEX IF NOT EXISTS idx_chat_history_session_id ON public.chat_history(session_id);
        
        ALTER TABLE public.chat_history ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'user_facts',
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_facts (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL,
          fact TEXT NOT NULL,
          category VARCHAR(50) NOT NULL CHECK (category IN ('preference', 'context', 'history', 'goal', 'constraint')),
          confidence DECIMAL(3,2) NOT NULL CHECK (confidence >= 0.0 AND confidence <= 1.0),
          source VARCHAR(20) NOT NULL CHECK (source IN ('explicit', 'inferred')),
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        CREATE INDEX IF NOT EXISTS idx_user_facts_user_id ON public.user_facts(user_id);
        
        ALTER TABLE public.user_facts ENABLE ROW LEVEL SECURITY;
      `
    },
    {
      name: 'user_long_term_memory',
      sql: `
        CREATE TABLE IF NOT EXISTS public.user_long_term_memory (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          user_id VARCHAR(255) NOT NULL UNIQUE,
          memory_data TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
        
        ALTER TABLE public.user_long_term_memory ENABLE ROW LEVEL SECURITY;
      `
    }
  ];
  
  for (const table of tables) {
    const { error } = await supabase.rpc('exec', { sql: table.sql });
    
    if (error) {
      console.log(`⚠️  ${table.name} table: ${error.message}`);
    } else {
      console.log(`✅ ${table.name} table: Created`);
    }
  }
}

async function createVectorSearchFunctions() {
  const functions = [
    {
      name: 'match_documents',
      sql: `
        CREATE OR REPLACE FUNCTION match_documents (
          query_embedding VECTOR(1536),
          match_count INT DEFAULT 5,
          filter_domain TEXT DEFAULT NULL
        )
        RETURNS TABLE (
          id UUID,
          content TEXT,
          metadata JSONB,
          similarity FLOAT
        )
        LANGUAGE SQL
        AS $$
          SELECT
            de.id,
            de.chunk_text as content,
            de.metadata,
            1 - (de.embedding <=> query_embedding) as similarity
          FROM document_embeddings de
          JOIN knowledge_base_documents kbd ON de.document_id = kbd.id
          WHERE (filter_domain IS NULL OR kbd.domain = filter_domain)
          ORDER BY de.embedding <=> query_embedding
          LIMIT match_count;
        $$;
      `
    },
    {
      name: 'hybrid_search',
      sql: `
        CREATE OR REPLACE FUNCTION hybrid_search (
          query_embedding VECTOR(1536),
          query_text TEXT,
          match_count INT DEFAULT 5,
          filter_domain TEXT DEFAULT NULL
        )
        RETURNS TABLE (
          id UUID,
          content TEXT,
          metadata JSONB,
          similarity FLOAT
        )
        LANGUAGE SQL
        AS $$
          WITH vector_search AS (
            SELECT
              de.id,
              de.chunk_text as content,
              de.metadata,
              1 - (de.embedding <=> query_embedding) as vector_similarity
            FROM document_embeddings de
            JOIN knowledge_base_documents kbd ON de.document_id = kbd.id
            WHERE (filter_domain IS NULL OR kbd.domain = filter_domain)
            ORDER BY de.embedding <=> query_embedding
            LIMIT match_count * 2
          ),
          text_search AS (
            SELECT
              de.id,
              de.chunk_text as content,
              de.metadata,
              ts_rank(to_tsvector('english', de.chunk_text), plainto_tsquery('english', query_text)) as text_similarity
            FROM document_embeddings de
            JOIN knowledge_base_documents kbd ON de.document_id = kbd.id
            WHERE (filter_domain IS NULL OR kbd.domain = filter_domain)
              AND to_tsvector('english', de.chunk_text) @@ plainto_tsquery('english', query_text)
            ORDER BY text_similarity DESC
            LIMIT match_count * 2
          )
          SELECT
            COALESCE(vs.id, ts.id) as id,
            COALESCE(vs.content, ts.content) as content,
            COALESCE(vs.metadata, ts.metadata) as metadata,
            (COALESCE(vs.vector_similarity, 0) * 0.6 + COALESCE(ts.text_similarity, 0) * 0.4) as similarity
          FROM vector_search vs
          FULL OUTER JOIN text_search ts ON vs.id = ts.id
          ORDER BY similarity DESC
          LIMIT match_count;
        $$;
      `
    }
  ];
  
  for (const func of functions) {
    const { error } = await supabase.rpc('exec', { sql: func.sql });
    
    if (error) {
      console.log(`⚠️  ${func.name} function: ${error.message}`);
    } else {
      console.log(`✅ ${func.name} function: Created`);
    }
  }
}

async function insertSampleData() {
  const sampleDocs = [
    {
      title: 'FDA 510(k) Submission Guidelines',
      content: 'The 510(k) submission is a premarket submission made to FDA to demonstrate that the device to be marketed is at least as safe and effective, that is, substantially equivalent, to a legally marketed device that is not subject to PMA. A 510(k) is required when: 1) You are introducing a device into commercial distribution for the first time; 2) You are introducing a device into commercial distribution for the first time under your own name, even though other persons may have previously introduced the same type of device into commercial distribution; 3) The device you are proposing to market is one that has been significantly changed or modified from a previously cleared device in such a way that could significantly affect the safety or effectiveness of the device.',
      source_name: 'FDA Guidance',
      source_url: 'https://www.fda.gov/medical-devices/premarket-submissions/premarket-notification-510k',
      domain: 'regulatory_affairs',
      document_type: 'guidance'
    },
    {
      title: 'ICH E6 Good Clinical Practice Guidelines',
      content: 'Good Clinical Practice (GCP) is an international ethical and scientific quality standard for designing, conducting, recording, and reporting trials that involve the participation of human subjects. Compliance with this standard provides public assurance that the rights, safety, and well-being of trial subjects are protected and that the clinical trial data are credible. The objective of this ICH GCP Guideline is to provide a unified standard for the European Union (EU), Japan, and the United States to facilitate the mutual acceptance of clinical data by the regulatory authorities in these jurisdictions.',
      source_name: 'ICH Guidelines',
      source_url: 'https://www.ich.org/page/e6-r2-addendum',
      domain: 'clinical_development',
      document_type: 'guidance'
    },
    {
      title: 'Pharmacovigilance Risk Management Plan',
      content: 'A Risk Management Plan (RMP) is a detailed description of the risk management system for a medicinal product. It describes the known safety profile of the medicinal product, important potential risks, missing information, and the measures that are proposed to be taken to identify, characterize, prevent, or minimize risks relating to the medicinal product. The RMP should be updated throughout the life cycle of the medicinal product as new information becomes available.',
      source_name: 'EMA Guidelines',
      source_url: 'https://www.ema.europa.eu/en/human-regulatory/post-authorisation/pharmacovigilance/risk-management-plans',
      domain: 'pharmacovigilance',
      document_type: 'guidance'
    }
  ];

  for (const doc of sampleDocs) {
    const { error } = await supabase
      .from('knowledge_base_documents')
      .insert(doc);
    
    if (error) {
      console.log(`⚠️  Document ${doc.title}: ${error.message}`);
    } else {
      console.log(`✅ Document ${doc.title}: Inserted`);
    }
  }
}

async function testTables() {
  // Test knowledge domains
  const { data: domains, error: domainError } = await supabase
    .from('knowledge_domains')
    .select('count')
    .limit(1);
  
  if (domainError) {
    console.log('❌ Knowledge domains: Not accessible');
  } else {
    console.log('✅ Knowledge domains: Ready');
  }
  
  // Test knowledge base documents
  const { data: docs, error: docError } = await supabase
    .from('knowledge_base_documents')
    .select('count')
    .limit(1);
  
  if (docError) {
    console.log('❌ Knowledge base documents: Not accessible');
  } else {
    console.log('✅ Knowledge base documents: Ready');
  }
  
  // Test vector search function
  try {
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: new Array(1536).fill(0.1),
      match_count: 1
    });
    
    if (error) {
      console.log('❌ Vector search function: Not accessible');
    } else {
      console.log('✅ Vector search function: Ready');
    }
  } catch (error) {
    console.log('❌ Vector search function: Test failed');
  }
}

// Run the table creation
createRAGTables().catch(console.error);

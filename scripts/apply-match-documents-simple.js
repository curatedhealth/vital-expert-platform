#!/usr/bin/env node

/**
 * Apply match_documents function migration to Supabase
 * Simple version that uses direct SQL execution
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing required environment variables:');
  console.error('   - NEXT_PUBLIC_SUPABASE_URL');
  console.error('   - SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

console.log(`🔗 Connecting to Supabase: ${supabaseUrl}`);

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

async function applyMigration() {
  console.log('🚀 Starting match_documents function migration...\n');

  try {
    // SQL to create the match_documents function
    const createFunctionSQL = `
-- Enable pgvector extension if not already enabled
CREATE EXTENSION IF NOT EXISTS vector;

-- Drop function if exists
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int, jsonb);

-- Create the match_documents function for vector similarity search
CREATE OR REPLACE FUNCTION match_documents(
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.7,
  match_count int DEFAULT 10,
  filter jsonb DEFAULT '{}'::jsonb
)
RETURNS TABLE (
  id uuid,
  content text,
  metadata jsonb,
  similarity float
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    dc.id,
    dc.content,
    dc.metadata,
    1 - (dc.embedding <=> query_embedding) as similarity
  FROM document_chunks dc
  WHERE
    -- Apply similarity threshold
    1 - (dc.embedding <=> query_embedding) > match_threshold
    -- Apply filters if provided
    AND (
      filter = '{}'::jsonb
      OR dc.metadata @> filter
    )
  ORDER BY dc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION match_documents TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents TO anon;

-- Create index on embeddings for faster similarity search if not exists
CREATE INDEX IF NOT EXISTS document_chunks_embedding_idx
ON document_chunks
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
`;

    console.log('📝 Executing SQL migration...\n');
    console.log('SQL:');
    console.log('='.repeat(60));
    console.log(createFunctionSQL.substring(0, 500) + '...');
    console.log('='.repeat(60) + '\n');

    // Execute the SQL using Supabase REST API
    const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
      },
      body: JSON.stringify({ query: createFunctionSQL }),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ SQL execution failed:', error);

      // Try alternative approach using pg library
      console.log('\n⚠️  REST API approach failed, trying direct PostgreSQL connection...\n');

      const { Pool } = require('pg');

      // Extract connection details from Supabase URL
      const dbUrl = supabaseUrl.replace('http://', '').replace('https://', '');
      const [host] = dbUrl.split(':');
      const port = dbUrl.includes(':54321') ? 54321 : 5432;

      const pool = new Pool({
        host: host,
        port: port,
        database: 'postgres',
        user: 'postgres',
        password: process.env.SUPABASE_DB_PASSWORD || 'postgres',
      });

      console.log(`🔗 Connecting to PostgreSQL: ${host}:${port}`);

      const client = await pool.connect();
      console.log('✅ Connected to PostgreSQL\n');

      console.log('📝 Executing migration SQL...');
      await client.query(createFunctionSQL);
      console.log('✅ Migration executed successfully\n');

      client.release();
      await pool.end();
    } else {
      console.log('✅ SQL executed successfully via REST API\n');
    }

    // Verify the function was created
    console.log('🔍 Verifying match_documents function...');

    const testEmbedding = Array(1536).fill(0);
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: testEmbedding,
      match_threshold: 0.7,
      match_count: 1,
      filter: {},
    });

    if (error) {
      if (error.message.includes('Could not find')) {
        console.error('❌ Function verification failed - function not found');
        console.error('   This means the function was not created successfully.');
        throw error;
      } else {
        console.log('⚠️  Function exists but returned an error (expected if no documents yet)');
        console.log('   Error:', error.message);
      }
    } else {
      console.log('✅ Function verified successfully');
      console.log('📊 Test query result:', data || 'No documents found (empty table)');
    }

    console.log('\n' + '='.repeat(60));
    console.log('✅ Migration completed successfully!');
    console.log('='.repeat(60));
    console.log('\nThe match_documents function is now available for:');
    console.log('  • Vector similarity search');
    console.log('  • LangChain SupabaseVectorStore');
    console.log('  • RAG document retrieval');
    console.log('\nNext steps:');
    console.log('  1. Try uploading documents again');
    console.log('  2. Verify embeddings are created');
    console.log('  3. Test RAG search functionality\n');

  } catch (error) {
    console.error('\n❌ Migration failed:', error.message);
    console.error('\nError stack:', error.stack);
    process.exit(1);
  }
}

// Run the migration
applyMigration();
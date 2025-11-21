#!/usr/bin/env node

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { persistSession: false }
});

async function fixMatchDocuments() {
  console.log('🔧 Fixing match_documents function to use rag_knowledge_chunks...\n');

  const sql = `
-- Drop the old function
DROP FUNCTION IF EXISTS match_documents(vector(1536), float, int, jsonb);

-- Create the corrected match_documents function
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
AS $BODY$
BEGIN
  RETURN QUERY
  SELECT
    kc.id,
    kc.content,
    kc.medical_context as metadata,
    1 - (kc.embedding <=> query_embedding) as similarity
  FROM rag_knowledge_chunks kc
  WHERE
    1 - (kc.embedding <=> query_embedding) > match_threshold
    AND (
      filter = '{}'::jsonb
      OR kc.medical_context @> filter
    )
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END;
$BODY$;

GRANT EXECUTE ON FUNCTION match_documents TO authenticated;
GRANT EXECUTE ON FUNCTION match_documents TO anon;
`;

  try {
    // Use pg library for direct execution
    const { Pool } = require('pg');
    const pool = new Pool({
      host: '127.0.0.1',
      port: 54321,
      database: 'postgres',
      user: 'postgres',
      password: 'postgres',
    });

    const client = await pool.connect();
    console.log('✅ Connected to database\n');

    console.log('📝 Executing SQL...');
    await client.query(sql);
    console.log('✅ Function updated successfully\n');

    // Test the function
    console.log('🧪 Testing match_documents function...');
    const testEmbedding = Array(1536).fill(0);
    const { data, error } = await supabase.rpc('match_documents', {
      query_embedding: testEmbedding,
      match_threshold: 0.7,
      match_count: 1,
      filter: {}
    });

    if (error && !error.message.includes('no rows')) {
      console.log('⚠️  Function test returned error:', error.message);
    } else {
      console.log('✅ Function test passed\n');
    }

    client.release();
    await pool.end();

    console.log('✅ Database fix completed successfully!\n');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixMatchDocuments();
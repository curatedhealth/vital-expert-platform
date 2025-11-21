#!/usr/bin/env node

/**
 * Create essential database tables via direct SQL
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function createTables() {
  console.log('🚀 Creating essential database tables...\n');

  const tables = [
    {
      name: 'knowledge_documents',
      sql: `
        CREATE TABLE IF NOT EXISTS knowledge_documents (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          user_id UUID,
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
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    },
    {
      name: 'document_chunks',
      sql: `
        CREATE TABLE IF NOT EXISTS document_chunks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          document_id UUID REFERENCES knowledge_documents(id) ON DELETE CASCADE,
          chunk_index INTEGER NOT NULL,
          content TEXT NOT NULL,
          metadata JSONB DEFAULT '{}',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          UNIQUE(document_id, chunk_index)
        );
      `
    },
    {
      name: 'health_checks',
      sql: `
        CREATE TABLE IF NOT EXISTS health_checks (
          id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
          service VARCHAR(100) NOT NULL,
          status VARCHAR(20) NOT NULL,
          details JSONB DEFAULT '{}',
          checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
        );
      `
    }
  ];

  for (const table of tables) {
    try {
      console.log(`📋 Creating table: ${table.name}`);

      // Execute SQL directly using raw query
      const { error } = await supabase
        .from('_dummy_table_that_does_not_exist')
        .select('*')
        .limit(0);

      // Use REST API directly
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({
          query: table.sql
        })
      });

      if (!response.ok) {
        // Try alternative approach - direct table operations
        console.log(`⚠️  RPC failed, trying alternative approach for ${table.name}`);

        // Test if table exists by trying to select from it
        const { error: testError } = await supabase
          .from(table.name)
          .select('id')
          .limit(1);

        if (testError && testError.message.includes('does not exist')) {
          console.log(`❌ Table ${table.name} does not exist and cannot be created via API`);
          console.log(`Manual SQL required: ${table.sql}`);
        } else {
          console.log(`✅ Table ${table.name} already exists or is accessible`);
        }
      } else {
        console.log(`✅ Table ${table.name} created successfully`);
      }

    } catch (error) {
      console.log(`⚠️  Error with table ${table.name}: ${error.message}`);
    }
  }

  // Insert test data
  console.log('\n📝 Inserting test data...');

  try {
    const { error } = await supabase
      .from('knowledge_documents')
      .insert({
        title: 'Test Document - Phase 1',
        content: 'This is a test document for Phase 1 enhanced VITAL Path system.',
        file_name: 'test-phase1.txt',
        file_type: 'text/plain',
        status: 'completed',
        domain: 'testing',
        tags: ['test', 'phase1', 'enhanced'],
        metadata: { source: 'automated_test', phase: '1' }
      });

    if (error) {
      console.log(`⚠️  Test data insertion failed: ${error.message}`);
    } else {
      console.log('✅ Test data inserted successfully');
    }
  } catch (error) {
    console.log(`⚠️  Test data insertion error: ${error.message}`);
  }

  console.log('\n🎯 Database table creation completed!');
}

createTables().catch(console.error);
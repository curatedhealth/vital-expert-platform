#!/usr/bin/env tsx

/**
 * Direct Supabase Connection Test
 * Tests if we can directly query the knowledge_documents table
 */

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xazinxsiglqokwfmogyk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhhemlueHNpZ2xxb2t3Zm1vZ3lrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2ODkzNzgsImV4cCI6MjA1MDI2NTM3OH0.5qrfkThPewEuFize6meh47xngCvg_9FRKcepFZ7IxsY';

async function testDirectConnection() {
  console.log('🔧 Testing direct Supabase connection...');

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    // Test basic connection
    console.log('📡 Testing basic connection...');
    const { data: basicTest, error: basicError } = await supabase
      .from('knowledge_documents')
      .select('count', { count: 'exact', head: true });

    if (basicError) {
      console.error('❌ Basic connection failed:', basicError.message);
      return;
    }

    console.log('✅ Basic connection successful');

    // Test actual query
    console.log('📊 Testing knowledge_documents query...');
    const { data, error } = await supabase
      .from('knowledge_documents')
      .select('*')
      .limit(5);

    if (error) {
      console.error('❌ Query failed:', error.message);
      console.log('Error details:', error);
      return;
    }

    console.log('✅ Query successful!');
    console.log('📄 Found documents:', data?.length || 0);

    if (data && data.length > 0) {
      console.log('📋 Sample document:', {
        id: data[0].id,
        title: data[0].title,
        status: data[0].status,
        domain: data[0].domain
      });
    }

    // Test other tables
    const tables = ['organizations', 'ai_agents', 'prompts', 'llm_providers'];

    for (const table of tables) {
      console.log(`🔍 Testing ${table}...`);
      const { data: tableData, error: tableError } = await supabase
        .from(table)
        .select('*')
        .limit(1);

      if (tableError) {
        console.log(`   ❌ ${table}: ${tableError.message}`);
      } else {
        console.log(`   ✅ ${table}: ${tableData?.length || 0} records accessible`);
      }
    }

  } catch (error) {
    console.error('💥 Connection test failed:', error);
  }
}

testDirectConnection();
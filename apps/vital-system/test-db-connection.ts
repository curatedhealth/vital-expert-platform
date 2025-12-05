/**
 * Database Connection Test Script
 * Tests Supabase connection with SSL and retrieves agents
 */

import { createClient } from '@supabase/supabase-js';
import { testConnection, executeWithRetry, SupabaseQueryHelper } from './src/lib/supabase/connection-helper.js';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function main() {
  console.log('='.repeat(60));
  console.log('VITAL Database Connection Test');
  console.log('='.repeat(60));
  console.log();

  // Validate environment variables
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error('❌ Error: Missing Supabase environment variables');
    console.error('   Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
    process.exit(1);
  }

  console.log('✅ Environment variables loaded');
  console.log(`   URL: ${supabaseUrl}`);
  console.log(`   Key: ${supabaseAnonKey.substring(0, 20)}...`);
  console.log();

  // Create Supabase client with proper SSL configuration
  console.log('Creating Supabase client with SSL configuration...');
  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
    global: {
      headers: {
        'X-Client-Info': 'vital-connection-test',
      },
    },
    db: {
      schema: 'public',
    },
  });
  console.log('✅ Supabase client created');
  console.log();

  // Test 1: Basic connectivity
  console.log('Test 1: Testing database connectivity...');
  const connectionTest = await testConnection(supabase);
  if (connectionTest.connected) {
    console.log(`✅ Connection successful (latency: ${connectionTest.latency}ms)`);
  } else {
    console.error(`❌ Connection failed: ${connectionTest.error}`);
    console.error(`   Latency: ${connectionTest.latency}ms`);
    process.exit(1);
  }
  console.log();

  // Test 2: Fetch agents using helper
  console.log('Test 2: Fetching agents with retry logic...');
  const helper = new SupabaseQueryHelper(supabase);

  const agentsResult = await helper.select('agents', {
    columns: 'id, name, slug, description, status, avatar_url',
    filters: { status: 'active' },
    order: { column: 'name', ascending: true },
    limit: 10,
  });

  if (agentsResult.success && agentsResult.data) {
    console.log(`✅ Successfully fetched agents`);
    console.log(`   Count: ${Array.isArray(agentsResult.data) ? agentsResult.data.length : 1}`);

    if (Array.isArray(agentsResult.data) && agentsResult.data.length > 0) {
      console.log(`   Sample agents:`);
      agentsResult.data.slice(0, 3).forEach((agent: any, index: number) => {
        console.log(`     ${index + 1}. ${agent.name} (${agent.slug})`);
        console.log(`        ${agent.description?.substring(0, 60)}...`);
      });
    }
  } else {
    console.error(`❌ Failed to fetch agents: ${agentsResult.error?.message}`);
  }
  console.log();

  // Test 3: Direct query without helper (fallback test)
  console.log('Test 3: Testing direct query (no helper)...');
  const directResult = await executeWithRetry(
    async () => await supabase.from('agents').select('id, name').eq('status', 'active').limit(5),
    { maxRetries: 3 }
  );

  if (directResult.success && directResult.data) {
    console.log(`✅ Direct query successful`);
    console.log(`   Count: ${Array.isArray(directResult.data) ? directResult.data.length : 1}`);
  } else {
    console.error(`❌ Direct query failed: ${directResult.error?.message}`);
  }
  console.log();

  // Test 4: Test without any filters (to check if agents exist)
  console.log('Test 4: Checking total agents in database...');
  const totalResult = await executeWithRetry(
    async () => await supabase.from('agents').select('id', { count: 'exact', head: true }),
    { maxRetries: 2 }
  );

  if (totalResult.success) {
    console.log(`✅ Total agents in database: ${(totalResult as any).count || 0}`);
  } else {
    console.error(`❌ Failed to count agents: ${totalResult.error?.message}`);
  }
  console.log();

  // Summary
  console.log('='.repeat(60));
  console.log('Test Summary');
  console.log('='.repeat(60));
  console.log(`Connection: ${connectionTest.connected ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Agent retrieval: ${agentsResult.success ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Direct query: ${directResult.success ? '✅ OK' : '❌ FAILED'}`);
  console.log();

  if (connectionTest.connected && agentsResult.success) {
    console.log('🎉 All tests passed! Database connection is working correctly.');
    process.exit(0);
  } else {
    console.error('⚠️  Some tests failed. Please check the errors above.');
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

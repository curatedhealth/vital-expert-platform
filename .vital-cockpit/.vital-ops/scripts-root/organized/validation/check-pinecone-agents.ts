#!/usr/bin/env tsx
/**
 * Script: Check if Agents are in Pinecone
 * 
 * Verifies:
 * 1. Pinecone connection
 * 2. Agent count in Pinecone
 * 3. Sample agent search
 * 
 * Usage:
 *   npx tsx scripts/check-pinecone-agents.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables
config({ path: resolve(__dirname, '../apps/digital-health-startup/.env.local') });
config({ path: resolve(__dirname, '../.env.local') });
config();

async function main() {
  console.log('🔍 Checking Pinecone for agent embeddings...\n');

  // Verify environment variables
  const requiredVars = [
    'PINECONE_API_KEY',
    'PINECONE_INDEX_NAME',
    'NEXT_PUBLIC_SUPABASE_URL',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  try {
    const { pineconeVectorService } = await import('../apps/digital-health-startup/src/lib/services/vectorstore/pinecone-vector-service');
    const { createClient } = await import('@supabase/supabase-js');

    console.log('📊 Checking Pinecone index stats...\n');

    // Get Pinecone stats for agents namespace
    const stats = await pineconeVectorService.getIndexStats('agents');

    const agentCount = stats.namespaces?.agents?.vectorCount || 0;

    console.log('📈 Pinecone Stats:');
    console.log(`   - Total vectors in index: ${stats.totalVectorCount || 0}`);
    console.log(`   - Agents namespace: ${agentCount} agents`);
    console.log(`   - Dimension: ${stats.dimension}`);
    console.log(`   - Index fullness: ${(stats.indexFullness * 100).toFixed(2)}%`);

    if (agentCount === 0) {
      console.log('\n⚠️  No agents found in Pinecone!\n');
      console.log('📝 To sync agents, run:');
      console.log('   npx tsx scripts/sync-all-agents-to-pinecone.ts\n');
      process.exit(1);
    }

    // Get agent count from Supabase for comparison
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count: supabaseCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'testing']);

    console.log(`\n📊 Comparison:`);
    console.log(`   - Agents in Supabase: ${supabaseCount || 0} (active/testing)`);
    console.log(`   - Agents in Pinecone: ${agentCount}`);

    if (agentCount < (supabaseCount || 0)) {
      console.log(`\n⚠️  Warning: Only ${agentCount}/${supabaseCount} agents synced`);
      console.log('   Consider running sync again to catch missing agents\n');
    } else if (agentCount === supabaseCount) {
      console.log('\n✅ All agents synced to Pinecone!\n');
    } else {
      console.log(`\n⚠️  More agents in Pinecone than Supabase - may need cleanup`);
    }

    // Test search functionality
    console.log('🔍 Testing agent search in Pinecone...\n');

    try {
      const searchResults = await pineconeVectorService.searchAgents({
        text: 'regulatory expert',
        topK: 3,
        minScore: 0.5,
      });

      if (searchResults.length > 0) {
        console.log(`✅ Search test successful! Found ${searchResults.length} agents:\n`);
        searchResults.forEach((result, i) => {
          console.log(`   ${i + 1}. Agent ID: ${result.agentId}`);
          console.log(`      Similarity: ${(result.similarity * 100).toFixed(1)}%`);
          console.log(`      Name: ${result.metadata.agent_display_name || result.metadata.agent_name || 'N/A'}\n`);
        });
      } else {
        console.log('⚠️  Search returned no results (try lower minScore threshold)');
      }
    } catch (searchError) {
      console.error('⚠️  Search test failed:', searchError);
      console.log('   (This may indicate agents are synced but search has issues)');
    }

    console.log('\n✅ Pinecone check complete!\n');
    console.log('💡 Next steps:');
    console.log('   - Use hybrid search: POST /api/agents/search-hybrid');
    console.log('   - Integrate into agent selector service');
    console.log('   - Update UI to use GraphRAG search\n');

  } catch (error) {
    console.error('\n❌ Error checking Pinecone:');
    console.error(error);
    
    if (error instanceof Error) {
      if (error.message.includes('Pinecone') || error.message.includes('index')) {
        console.log('\n💡 Troubleshooting:');
        console.log('   1. Verify PINECONE_API_KEY is correct');
        console.log('   2. Check PINECONE_INDEX_NAME matches your Pinecone index');
        console.log('   3. Ensure index exists in Pinecone dashboard');
        console.log('   4. Verify index dimension matches (3072 for text-embedding-3-large)');
      }
    }
    
    process.exit(1);
  }
}

main();


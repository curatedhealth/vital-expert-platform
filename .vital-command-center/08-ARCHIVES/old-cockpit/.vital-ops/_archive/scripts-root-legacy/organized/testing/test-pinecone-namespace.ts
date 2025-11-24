#!/usr/bin/env tsx
/**
 * Quick test to verify Pinecone namespace behavior
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import { Pinecone } from '@pinecone-database/pinecone';

config({ path: resolve(__dirname, '../apps/digital-health-startup/.env.local') });

async function test() {
  const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
  const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
  
  // Test querying agents namespace directly
  const agentsNamespace = index.namespace('agents');
  
  // Try to query first agent to see if data exists
  try {
    const testQuery = await agentsNamespace.query({
      vector: new Array(3072).fill(0.1), // Dummy vector
      topK: 1,
      includeMetadata: true,
    });
    
    console.log('Test query results:', testQuery.matches?.length || 0);
    
    if (testQuery.matches && testQuery.matches.length > 0) {
      console.log('✅ Found agents in namespace!');
      console.log('Sample:', testQuery.matches[0].id);
    } else {
      console.log('⚠️ No agents found in namespace query');
    }
  } catch (error) {
    console.error('Query error:', error);
  }
  
  // Get stats
  const stats = await index.describeIndexStats();
  console.log('\nIndex Stats:');
  console.log('Total vectors:', stats.totalVectorCount);
  console.log('Namespaces:', Object.keys(stats.namespaces || {}));
  if (stats.namespaces) {
    Object.entries(stats.namespaces).forEach(([name, data]) => {
      console.log(`  ${name}: ${data.vectorCount} vectors`);
    });
  }
}

test();


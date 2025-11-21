#!/usr/bin/env tsx
/**
 * Script: Sync All Agents to Pinecone for GraphRAG
 * 
 * This script:
 * 1. Fetches all active agents from Supabase
 * 2. Generates embeddings for each agent
 * 3. Syncs embeddings to Pinecone (agents namespace)
 * 
 * Usage:
 *   npx tsx scripts/sync-all-agents-to-pinecone.ts
 */

import { config } from 'dotenv';
import { resolve } from 'path';
import { createClient } from '@supabase/supabase-js';
import { Pinecone } from '@pinecone-database/pinecone';
import { OpenAI } from 'openai';

// Load environment variables
config({ path: resolve(__dirname, '../apps/digital-health-startup/.env.local') });
config({ path: resolve(__dirname, '../.env.local') });
config();

async function main() {
  console.log('🚀 Starting agent GraphRAG sync to Pinecone...\n');

  // Verify environment variables
  const requiredVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'SUPABASE_SERVICE_ROLE_KEY',
    'PINECONE_API_KEY',
    'PINECONE_INDEX_NAME',
    'OPENAI_API_KEY',
  ];

  const missing = requiredVars.filter(varName => !process.env[varName]);
  if (missing.length > 0) {
    console.error('❌ Missing required environment variables:');
    missing.forEach(varName => console.error(`   - ${varName}`));
    process.exit(1);
  }

  try {
    // Initialize services
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const pinecone = new Pinecone({ apiKey: process.env.PINECONE_API_KEY! });
    const index = pinecone.index(process.env.PINECONE_INDEX_NAME!);
    const agentsNamespace = index.namespace('agents');

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY!,
    });

    // Fetch all agents (no status filter - get all)
    console.log('📊 Fetching agents from Supabase...');
    const { data: agents, error, count } = await supabase
      .from('agents')
      .select('*', { count: 'exact' });

    if (error) {
      throw new Error(`Failed to fetch agents: ${error.message}`);
    }

    if (!agents || agents.length === 0) {
      console.log('⚠️  No agents found to sync');
      return;
    }

    console.log(`✅ Found ${agents.length} agents to sync\n`);

    // Build agent profile text
    const buildAgentProfileText = (agent: any): string => {
      const parts: string[] = [];
      
      const displayName = agent.metadata?.display_name || agent.name;
      if (displayName) parts.push(`Agent Name: ${displayName}`);
      if (agent.description) parts.push(`Description: ${agent.description}`);
      if (agent.system_prompt) {
        parts.push(`Expertise: ${agent.system_prompt.substring(0, 500)}...`);
      }
      
      const capabilities = Array.isArray(agent.capabilities) 
        ? agent.capabilities 
        : typeof agent.capabilities === 'string' 
          ? agent.capabilities.split(',').map((c: string) => c.trim())
          : [];
      if (capabilities.length > 0) {
        parts.push(`Capabilities: ${capabilities.join(', ')}`);
      }
      
      const knowledgeDomains = Array.isArray(agent.knowledge_domains)
        ? agent.knowledge_domains
        : agent.knowledge_domains ? [agent.knowledge_domains] : [];
      if (knowledgeDomains.length > 0) {
        parts.push(`Knowledge Domains: ${knowledgeDomains.join(', ')}`);
      }
      
      if (agent.business_function) {
        parts.push(`Business Function: ${agent.business_function}`);
      }
      
      return parts.join('\n');
    };

    // Generate embeddings and sync
    console.log('🔄 Generating embeddings and syncing to Pinecone...\n');

    const batchSize = 10;
    let processed = 0;
    let failed = 0;

    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);

      const vectors = await Promise.all(
        batch.map(async (agent) => {
          try {
            // Build profile text
            const profileText = buildAgentProfileText(agent);

            // Generate embedding
            const embeddingResponse = await openai.embeddings.create({
              model: 'text-embedding-3-large',
              input: profileText.substring(0, 8000),
            });
            const embedding = embeddingResponse.data[0].embedding;

            // Prepare metadata
            const capabilities = Array.isArray(agent.capabilities)
              ? agent.capabilities
              : typeof agent.capabilities === 'string'
                ? agent.capabilities.split(',').map((c: string) => c.trim())
                : [];
            
            const knowledgeDomains = Array.isArray(agent.knowledge_domains)
              ? agent.knowledge_domains
              : agent.knowledge_domains ? [agent.knowledge_domains] : [];

            return {
              id: agent.id,
              values: embedding,
              metadata: {
                agent_id: agent.id,
                agent_name: agent.name,
                agent_display_name: agent.metadata?.display_name || agent.name,
                description: agent.description || '',
                capabilities,
                knowledge_domains: knowledgeDomains,
                tier: agent.tier || 3,
                status: agent.status || 'active',
                business_function: agent.business_function || undefined,
                domain: knowledgeDomains[0] || undefined,
                embedding_type: 'agent_profile',
                entity_type: 'agent',
                timestamp: new Date().toISOString(),
              },
            };
          } catch (error) {
            console.error(`❌ Failed to process agent ${agent.id}:`, error);
            failed++;
            return null;
          }
        })
      );

      // Filter out failed vectors and upsert to Pinecone
      const validVectors = vectors.filter((v): v is NonNullable<typeof v> => v !== null);

      if (validVectors.length > 0) {
        await agentsNamespace.upsert(validVectors);
        processed += validVectors.length;
      }

      const percentage = Math.round((processed / agents.length) * 100);
      console.log(`📊 Progress: ${processed}/${agents.length} (${percentage}%) - ${failed} failed`);

      // Small delay to avoid rate limits
      if (i + batchSize < agents.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    // Verify sync
    console.log('\n🔍 Verifying sync...');
    const stats = await index.describeIndexStats();

    const syncedCount = stats.namespaces?.agents?.vectorCount || 0;

    console.log(`\n✅ Sync Complete!`);
    console.log(`   - Agents processed: ${processed}`);
    console.log(`   - Agents failed: ${failed}`);
    console.log(`   - Agents in Pinecone: ${syncedCount}`);
    console.log(`   - Index dimension: ${stats.dimension}`);
    console.log(`   - Namespace: agents`);

    if (syncedCount !== processed) {
      console.warn(`\n⚠️  Warning: Sync count mismatch (${syncedCount} vs ${processed})`);
    } else {
      console.log('\n🎉 All agents successfully synced to Pinecone for GraphRAG!');
    }

  } catch (error) {
    console.error('\n❌ Error syncing agents to Pinecone:');
    console.error(error);
    process.exit(1);
  }
}

main();

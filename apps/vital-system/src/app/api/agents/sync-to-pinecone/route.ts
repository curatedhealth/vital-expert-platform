/**
 * API Route: Sync Agents to Pinecone for GraphRAG
 * 
 * Generates embeddings for all agents and stores them in Pinecone
 * Enables hybrid search: Supabase (metadata) + Pinecone (vectors)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { pineconeVectorService } from '@/lib/services/vectorstore/pinecone-vector-service';
import { agentEmbeddingService } from '@/lib/services/agents/agent-embedding-service';

export async function POST(request: NextRequest) {
  try {
    // Verify authentication (optional - can be admin-only)
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseServiceKey) {
      return NextResponse.json(
        { error: 'Supabase configuration missing' },
        { status: 500 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const { agentId, syncAll = false } = body;

    console.log(`🔄 Starting agent sync to Pinecone - Agent: ${agentId || 'all'}, Sync All: ${syncAll}`);

    if (agentId && !syncAll) {
      // Sync single agent
      const supabase = createClient(supabaseUrl, supabaseServiceKey);

      const { data: agent, error: agentError } = await supabase
        .from('agents')
        .select('*')
        .eq('id', agentId)
        .single();

      if (agentError || !agent) {
        return NextResponse.json(
          { error: 'Agent not found' },
          { status: 404 }
        );
      }

      // Generate embedding
      const embeddingData = await agentEmbeddingService.generateAgentEmbedding(agent);

      // Sync to Pinecone
      await pineconeVectorService.syncAgentToPinecone({
        agentId: embeddingData.agentId,
        embedding: embeddingData.embedding,
        metadata: embeddingData.metadata,
      });

      // Also store in Supabase (for hybrid search)
      await agentEmbeddingService.storeAgentEmbeddingInSupabase(
        embeddingData.agentId,
        embeddingData.embedding,
        embeddingData.embeddingType,
        embeddingData.text
      );

      return NextResponse.json({
        success: true,
        message: `Agent ${agent.display_name || agent.name} synced to Pinecone`,
        agentId: embeddingData.agentId,
      });
    } else {
      // Sync all agents
      console.log('📦 Starting bulk sync of all agents to Pinecone...');

      await pineconeVectorService.bulkSyncAgentsToPinecone({
        batchSize: 10,
        onProgress: (completed, total) => {
          console.log(`  Progress: ${completed}/${total} agents processed`);
        },
      });

      return NextResponse.json({
        success: true,
        message: 'All agents synced to Pinecone successfully',
      });
    }
  } catch (error) {
    console.error('❌ Failed to sync agents to Pinecone:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync agents to Pinecone',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get Pinecone index stats for agents namespace
    const stats = await pineconeVectorService.getIndexStats('agents');
    
    // Also get count from Supabase for comparison
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    const { count: supabaseCount } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
      .in('status', ['active', 'testing']);

    const pineconeCount = stats.namespaces?.agents?.vectorCount || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalAgents: pineconeCount,
        dimension: stats.dimension,
        indexFullness: stats.indexFullness,
        totalVectors: stats.totalVectorCount,
      },
      comparison: {
        agentsInSupabase: supabaseCount || 0,
        agentsInPinecone: pineconeCount,
        synced: pineconeCount === (supabaseCount || 0),
        syncPercentage: supabaseCount 
          ? Math.round((pineconeCount / supabaseCount) * 100)
          : 0,
      },
      needsSync: pineconeCount === 0 || pineconeCount < (supabaseCount || 0),
    });
  } catch (error) {
    console.error('❌ Failed to get Pinecone stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to get Pinecone statistics',
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}


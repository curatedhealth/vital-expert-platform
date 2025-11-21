/**
 * Agent Embedding Service
 * Generates and manages agent embeddings for GraphRAG in Pinecone
 * Enables hybrid search across Supabase (metadata) + Pinecone (vectors)
 */

import { embeddingService } from '@/lib/services/embeddings/openai-embedding-service';
import { createClient } from '@supabase/supabase-js';
import type { Agent } from '@/lib/types/agent.types';

export interface AgentEmbeddingData {
  agentId: string;
  embedding: number[];
  text: string;
  embeddingType: 'agent_profile' | 'agent_capabilities' | 'agent_description';
  metadata: {
    agent_id: string;
    agent_name: string;
    agent_display_name: string;
    description: string;
    capabilities: string[];
    knowledge_domains: string[];
    tier: number;
    status: string;
    business_function?: string;
    domain?: string;
    embedding_type: string;
  };
}

export class AgentEmbeddingService {
  private supabase: ReturnType<typeof createClient>;

  constructor() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing for AgentEmbeddingService');
    }

    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  /**
   * Build comprehensive agent profile text for embedding
   * Combines all agent information into a rich text representation
   */
  buildAgentProfileText(agent: Agent): string {
    const parts: string[] = [];

    // Core identity
    if (agent.display_name || agent.name) {
      parts.push(`Agent Name: ${agent.display_name || agent.name}`);
    }

    if (agent.description) {
      parts.push(`Description: ${agent.description}`);
    }

    // System prompt (truncated for embedding efficiency)
    if (agent.system_prompt) {
      const truncatedPrompt = agent.system_prompt.substring(0, 500);
      parts.push(`Expertise: ${truncatedPrompt}...`);
    }

    // Capabilities
    if (agent.capabilities && agent.capabilities.length > 0) {
      const caps = Array.isArray(agent.capabilities) 
        ? agent.capabilities 
        : typeof agent.capabilities === 'string' 
          ? agent.capabilities.split(',').map(c => c.trim())
          : [];
      parts.push(`Capabilities: ${caps.join(', ')}`);
    }

    // Knowledge domains
    if (agent.knowledge_domains && agent.knowledge_domains.length > 0) {
      const domains = Array.isArray(agent.knowledge_domains)
        ? agent.knowledge_domains
        : [agent.knowledge_domains];
      parts.push(`Knowledge Domains: ${domains.join(', ')}`);
    }

    // Business context
    if (agent.business_function) {
      parts.push(`Business Function: ${agent.business_function}`);
    }

    if (agent.role) {
      parts.push(`Role: ${agent.role}`);
    }

    if (agent.department) {
      parts.push(`Department: ${agent.department}`);
    }

    // Medical specialty (if applicable)
    if (agent.medical_specialty) {
      parts.push(`Medical Specialty: ${agent.medical_specialty}`);
    }

    // Tier information
    if (agent.tier) {
      parts.push(`Tier: ${agent.tier}`);
    }

    // Model configuration
    if (agent.model) {
      parts.push(`AI Model: ${agent.model}`);
    }

    return parts.join('\n');
  }

  /**
   * Generate embedding for agent profile
   */
  async generateAgentEmbedding(agent: Agent): Promise<AgentEmbeddingData> {
    const profileText = this.buildAgentProfileText(agent);

    console.log(`🔄 Generating embedding for agent: ${agent.display_name || agent.name}`);

    // Generate embedding using OpenAI service
    const embeddingResult = await embeddingService.generateEmbedding(profileText, {
      useCache: true,
      dimensions: 3072, // text-embedding-3-large default
    });

    // Extract metadata
    const capabilities = Array.isArray(agent.capabilities)
      ? agent.capabilities
      : typeof agent.capabilities === 'string'
        ? agent.capabilities.split(',').map(c => c.trim())
        : [];

    const knowledgeDomains = Array.isArray(agent.knowledge_domains)
      ? agent.knowledge_domains
      : agent.knowledge_domains
        ? [agent.knowledge_domains]
        : [];

    return {
      agentId: agent.id,
      embedding: embeddingResult.embedding,
      text: profileText,
      embeddingType: 'agent_profile',
      metadata: {
        agent_id: agent.id,
        agent_name: agent.name,
        agent_display_name: agent.display_name || agent.name,
        description: agent.description || '',
        capabilities,
        knowledge_domains: knowledgeDomains,
        tier: agent.tier || 3,
        status: agent.status || 'active',
        business_function: agent.business_function || undefined,
        domain: knowledgeDomains[0] || undefined,
        embedding_type: 'agent_profile',
      },
    };
  }

  /**
   * Generate embeddings for multiple agents in batch
   */
  async generateAgentEmbeddingsBatch(
    agents: Agent[],
    onProgress?: (completed: number, total: number) => void
  ): Promise<AgentEmbeddingData[]> {
    const results: AgentEmbeddingData[] = [];
    const batchSize = 10; // Process 10 at a time to avoid rate limits

    for (let i = 0; i < agents.length; i += batchSize) {
      const batch = agents.slice(i, i + batchSize);

      console.log(`📦 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(agents.length / batchSize)}`);

      const batchResults = await Promise.all(
        batch.map(async (agent) => {
          try {
            return await this.generateAgentEmbedding(agent);
          } catch (error) {
            console.error(`❌ Failed to generate embedding for agent ${agent.id}:`, error);
            return null;
          }
        })
      );

      const validResults = batchResults.filter((r): r is AgentEmbeddingData => r !== null);
      results.push(...validResults);

      if (onProgress) {
        onProgress(i + batch.length, agents.length);
      }

      // Small delay to avoid rate limits
      if (i + batchSize < agents.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`✅ Generated ${results.length}/${agents.length} agent embeddings`);
    return results;
  }

  /**
   * Store agent embedding in Supabase (for hybrid search)
   */
  async storeAgentEmbeddingInSupabase(
    agentId: string,
    embedding: number[],
    embeddingType: string,
    sourceText: string
  ): Promise<void> {
    try {
      // Check if agent_embeddings table exists
      const { error } = await this.supabase
        .from('agent_embeddings')
        .upsert({
          agent_id: agentId,
          embedding,
          embedding_type: embeddingType,
          source_text: sourceText.substring(0, 500),
          embedding_model: 'text-embedding-3-large',
          embedding_version: '1.0',
          embedding_quality_score: 0.9,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'agent_id,embedding_type'
        });

      if (error) {
        // Table might not exist, log but don't fail
        console.warn('⚠️ Could not store embedding in Supabase (table may not exist):', error.message);
      } else {
        console.log(`✅ Stored embedding in Supabase for agent ${agentId}`);
      }
    } catch (error) {
      console.warn('⚠️ Could not store embedding in Supabase:', error);
      // Non-critical, continue
    }
  }
}

// Singleton instance
let agentEmbeddingServiceInstance: AgentEmbeddingService | null = null;

export function getAgentEmbeddingService(): AgentEmbeddingService {
  if (!agentEmbeddingServiceInstance) {
    agentEmbeddingServiceInstance = new AgentEmbeddingService();
  }
  return agentEmbeddingServiceInstance;
}

export const agentEmbeddingService = getAgentEmbeddingService();


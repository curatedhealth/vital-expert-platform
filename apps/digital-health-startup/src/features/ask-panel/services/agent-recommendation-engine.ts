/**
 * Agent Recommendation Engine
 * 
 * AI-powered agent recommendation system using OpenAI embeddings
 * for semantic matching between user queries and agent expertise.
 */

import OpenAI from 'openai';
import type { 
  Agent, 
  AgentRecommendation, 
  PanelRecommendation,
  PanelConfiguration 
} from '../types/agent';
import { getAgents, getAgentsBySlugs } from './agent-service';

// ============================================================================
// CONFIGURATION
// ============================================================================

const OPENAI_EMBEDDING_MODEL = 'text-embedding-3-small';
const RECOMMENDATION_THRESHOLD = 0.7; // Minimum similarity score (0-1)
const MAX_RECOMMENDATIONS = 10;

// Lazy OpenAI client initialization
let openaiClient: OpenAI | null = null;

function getOpenAIClient(): OpenAI {
  if (!openaiClient) {
    const apiKey = process.env.OPENAI_API_KEY || process.env.NEXT_PUBLIC_OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error(
        'OPENAI_API_KEY is not configured. Please add it to your .env.local file:\n' +
        'OPENAI_API_KEY=sk-your-key-here'
      );
    }
    openaiClient = new OpenAI({ apiKey });
  }
  return openaiClient;
}

// ============================================================================
// EMBEDDING CACHE
// ============================================================================

interface EmbeddingCache {
  [key: string]: {
    embedding: number[];
    timestamp: number;
  };
}

const embeddingCache: EmbeddingCache = {};
const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours

/**
 * Get cached embedding or generate new one
 */
async function getCachedEmbedding(text: string): Promise<number[]> {
  const cacheKey = text.toLowerCase().trim();
  const cached = embeddingCache[cacheKey];
  
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.embedding;
  }
  
  const embedding = await generateEmbedding(text);
  embeddingCache[cacheKey] = {
    embedding,
    timestamp: Date.now(),
  };
  
  return embedding;
}

// ============================================================================
// EMBEDDING GENERATION
// ============================================================================

/**
 * Generate embedding for text using OpenAI
 */
async function generateEmbedding(text: string): Promise<number[]> {
  try {
    const response = await getOpenAIClient().embeddings.create({
      model: OPENAI_EMBEDDING_MODEL,
      input: text,
    });
    
    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
}

/**
 * Generate embedding for an agent based on their profile
 */
async function generateAgentEmbedding(agent: Agent): Promise<number[]> {
  const text = buildAgentEmbeddingText(agent);
  return getCachedEmbedding(text);
}

/**
 * Build text representation of agent for embedding
 */
function buildAgentEmbeddingText(agent: Agent): string {
  const parts = [
    agent.title,
    agent.description,
  ];
  
  if (agent.expertise.length > 0) {
    parts.push(`Expertise: ${agent.expertise.join(', ')}`);
  }
  
  if (agent.specialties.length > 0) {
    parts.push(`Specialties: ${agent.specialties.join(', ')}`);
  }
  
  if (agent.background) {
    parts.push(agent.background);
  }
  
  return parts.join('. ');
}

// ============================================================================
// SIMILARITY CALCULATION
// ============================================================================

/**
 * Calculate cosine similarity between two vectors
 */
function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Vectors must have the same length');
  }
  
  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;
  
  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    magnitudeA += a[i] * a[i];
    magnitudeB += b[i] * b[i];
  }
  
  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);
  
  if (magnitudeA === 0 || magnitudeB === 0) {
    return 0;
  }
  
  return dotProduct / (magnitudeA * magnitudeB);
}

// ============================================================================
// KEYWORD MATCHING
// ============================================================================

/**
 * Extract keywords from query
 */
function extractKeywords(query: string): string[] {
  const stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'i', 'need', 'want', 'help', 'me',
  ]);
  
  return query
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 2 && !stopWords.has(word));
}

/**
 * Calculate keyword match score
 */
function calculateKeywordScore(query: string, agent: Agent): number {
  const keywords = extractKeywords(query);
  if (keywords.length === 0) return 0;
  
  const agentText = buildAgentEmbeddingText(agent).toLowerCase();
  const matches = keywords.filter(keyword => agentText.includes(keyword));
  
  return matches.length / keywords.length;
}

/**
 * Find matched expertise areas
 */
function findMatchedExpertise(query: string, agent: Agent): string[] {
  const queryLower = query.toLowerCase();
  return agent.expertise.filter(exp => 
    queryLower.includes(exp.toLowerCase()) ||
    exp.toLowerCase().includes(queryLower.split(' ')[0])
  );
}

/**
 * Find matched specialties
 */
function findMatchedSpecialties(query: string, agent: Agent): string[] {
  const queryLower = query.toLowerCase();
  return agent.specialties.filter(spec => 
    queryLower.includes(spec.toLowerCase()) ||
    spec.toLowerCase().includes(queryLower.split(' ')[0])
  );
}

// ============================================================================
// RECOMMENDATION ENGINE
// ============================================================================

export class AgentRecommendationEngine {
  /**
   * Recommend agents based on user query
   */
  async recommendAgents(
    query: string,
    options?: {
      maxAgents?: number;
      requiredCategory?: string;
      minConfidence?: number;
      excludeAgentIds?: string[];
    }
  ): Promise<AgentRecommendation[]> {
    const {
      maxAgents = MAX_RECOMMENDATIONS,
      requiredCategory,
      minConfidence = RECOMMENDATION_THRESHOLD,
      excludeAgentIds = [],
    } = options || {};
    
    console.log('🤖 Recommending agents for query:', query);
    
    // Fetch all agents
    const filters = requiredCategory ? { category: requiredCategory } : undefined;
    let agents = await getAgents(filters);
    
    // Filter out excluded agents
    if (excludeAgentIds.length > 0) {
      agents = agents.filter(a => !excludeAgentIds.includes(a.id));
    }
    
    if (agents.length === 0) {
      return [];
    }
    
    // Generate query embedding
    const queryEmbedding = await getCachedEmbedding(query);
    
    // Generate agent embeddings and calculate scores
    const recommendations: AgentRecommendation[] = [];
    
    for (const agent of agents) {
      const agentEmbedding = await generateAgentEmbedding(agent);
      const semanticScore = cosineSimilarity(queryEmbedding, agentEmbedding);
      const keywordScore = calculateKeywordScore(query, agent);
      
      // Weighted combination (70% semantic, 30% keyword)
      const score = semanticScore * 0.7 + keywordScore * 0.3;
      
      if (score >= minConfidence) {
        const matchedExpertise = findMatchedExpertise(query, agent);
        const matchedSpecialties = findMatchedSpecialties(query, agent);
        const reasons = this.generateReasons(score, matchedExpertise, matchedSpecialties, agent);
        
        recommendations.push({
          agent,
          score,
          reasons,
          matchedExpertise,
          matchedSpecialties,
        });
      }
    }
    
    // Sort by score descending
    recommendations.sort((a, b) => b.score - a.score);
    
    // Limit results
    const topRecommendations = recommendations.slice(0, maxAgents);
    
    console.log(`✅ Found ${topRecommendations.length} recommendations (threshold: ${minConfidence})`);
    topRecommendations.forEach((rec, idx) => {
      console.log(`   ${idx + 1}. ${rec.agent.title} (${(rec.score * 100).toFixed(1)}%)`);
    });
    
    return topRecommendations;
  }
  
  /**
   * Recommend a complete panel configuration
   */
  async recommendPanel(
    query: string,
    useCase?: 'clinical_trial' | 'regulatory' | 'market_access' | 'general'
  ): Promise<PanelRecommendation> {
    console.log('🎯 Recommending panel configuration for:', query);
    console.log('   Use case:', useCase || 'auto-detect');
    
    // Detect use case if not provided
    const detectedUseCase = useCase || this.detectUseCase(query);
    
    // Get recommended agents based on use case
    const agents = await this.recommendAgentsForUseCase(query, detectedUseCase);
    
    // Determine panel mode
    const panelMode = this.recommendPanelMode(query, detectedUseCase, agents.length);
    
    // Determine framework
    const framework = this.recommendFramework(panelMode, agents.length);
    
    // Calculate overall confidence
    const confidence = agents.length > 0 
      ? agents.reduce((sum, a) => sum + a.score, 0) / agents.length
      : 0;
    
    // Generate rationale
    const rationale = this.generatePanelRationale(
      detectedUseCase,
      panelMode,
      framework,
      agents.length
    );
    
    console.log(`✅ Panel recommendation:`);
    console.log(`   Mode: ${panelMode}`);
    console.log(`   Framework: ${framework}`);
    console.log(`   Agents: ${agents.length}`);
    console.log(`   Confidence: ${(confidence * 100).toFixed(1)}%`);
    
    return {
      agents,
      panelMode,
      framework,
      rationale,
      confidence,
      useCase: detectedUseCase,
    };
  }
  
  // ==========================================================================
  // PRIVATE METHODS
  // ==========================================================================
  
  /**
   * Detect use case from query
   */
  private detectUseCase(query: string): string {
    const queryLower = query.toLowerCase();
    
    if (
      queryLower.includes('clinical trial') ||
      queryLower.includes('study design') ||
      queryLower.includes('protocol') ||
      queryLower.includes('patient recruitment')
    ) {
      return 'clinical_trial';
    }
    
    if (
      queryLower.includes('fda') ||
      queryLower.includes('regulatory') ||
      queryLower.includes('approval') ||
      queryLower.includes('submission') ||
      queryLower.includes('510(k)') ||
      queryLower.includes('de novo')
    ) {
      return 'regulatory';
    }
    
    if (
      queryLower.includes('market') ||
      queryLower.includes('launch') ||
      queryLower.includes('payer') ||
      queryLower.includes('reimbursement') ||
      queryLower.includes('commercialization')
    ) {
      return 'market_access';
    }
    
    return 'general';
  }
  
  /**
   * Recommend agents for specific use case
   */
  private async recommendAgentsForUseCase(
    query: string,
    useCase: string
  ): Promise<AgentRecommendation[]> {
    // Use case-specific agent suggestions
    const useCaseAgents: Record<string, string[]> = {
      clinical_trial: [
        'clinical-trial-designer',
        'biostatistician-digital-health',
        'clinical-protocol-writer',
        'clinical-operations-coordinator',
      ],
      regulatory: [
        'fda-regulatory-strategist',
        'breakthrough-therapy-advisor',
        'hipaa-compliance-officer',
      ],
      market_access: [
        'product-launch-strategist',
        'payer-strategy-advisor',
        'health-economics-modeler',
        'digital-marketing-strategist',
      ],
      general: [],
    };
    
    const suggestedSlugs = useCaseAgents[useCase] || [];
    
    // Get all recommendations
    const allRecommendations = await this.recommendAgents(query, {
      maxAgents: 10,
      minConfidence: 0.6,
    });
    
    // Boost suggested agents
    const recommendations = allRecommendations.map(rec => {
      if (rec.agent.slug && suggestedSlugs.includes(rec.agent.slug)) {
        return {
          ...rec,
          score: Math.min(rec.score + 0.1, 1.0), // Boost by 10%
        };
      }
      return rec;
    });
    
    // Re-sort and limit to top 5
    recommendations.sort((a, b) => b.score - a.score);
    return recommendations.slice(0, 5);
  }
  
  /**
   * Recommend panel mode
   */
  private recommendPanelMode(
    query: string,
    useCase: string,
    agentCount: number
  ): 'sequential' | 'collaborative' | 'hybrid' {
    const queryLower = query.toLowerCase();
    
    // Keywords suggesting collaborative mode
    if (
      queryLower.includes('discuss') ||
      queryLower.includes('debate') ||
      queryLower.includes('consensus') ||
      queryLower.includes('different perspectives') ||
      agentCount >= 4
    ) {
      return 'collaborative';
    }
    
    // Keywords suggesting sequential mode
    if (
      queryLower.includes('step by step') ||
      queryLower.includes('one at a time') ||
      queryLower.includes('guided') ||
      agentCount <= 2
    ) {
      return 'sequential';
    }
    
    // Default to hybrid for flexibility
    return 'hybrid';
  }
  
  /**
   * Recommend framework based on panel configuration
   */
  private recommendFramework(
    panelMode: 'sequential' | 'collaborative' | 'hybrid',
    agentCount: number
  ): 'langgraph' | 'autogen' | 'crewai' {
    if (panelMode === 'collaborative' && agentCount >= 3) {
      return 'autogen'; // Best for multi-agent discussion
    }
    
    if (panelMode === 'sequential') {
      return 'langgraph'; // Best for sequential workflows
    }
    
    // Hybrid or default
    return 'langgraph';
  }
  
  /**
   * Generate recommendation reasons
   */
  private generateReasons(
    score: number,
    matchedExpertise: string[],
    matchedSpecialties: string[],
    agent: Agent
  ): string[] {
    const reasons: string[] = [];
    
    if (score >= 0.9) {
      reasons.push('Highly relevant expertise for your query');
    } else if (score >= 0.8) {
      reasons.push('Strong expertise match');
    } else if (score >= 0.7) {
      reasons.push('Relevant expertise');
    }
    
    if (matchedExpertise.length > 0) {
      reasons.push(`Expert in: ${matchedExpertise.slice(0, 2).join(', ')}`);
    }
    
    if (matchedSpecialties.length > 0) {
      reasons.push(`Specializes in: ${matchedSpecialties.slice(0, 2).join(', ')}`);
    }
    
    if (agent.total_consultations > 50) {
      reasons.push(`Highly experienced (${agent.total_consultations}+ consultations)`);
    }
    
    const rating = parseFloat(agent.rating);
    if (rating >= 4.5) {
      reasons.push(`Top-rated expert (${rating.toFixed(1)}★)`);
    }
    
    return reasons;
  }
  
  /**
   * Generate panel rationale
   */
  private generatePanelRationale(
    useCase: string,
    panelMode: 'sequential' | 'collaborative' | 'hybrid',
    framework: string,
    agentCount: number
  ): string {
    const useCaseDescriptions: Record<string, string> = {
      clinical_trial: 'clinical trial design and execution',
      regulatory: 'regulatory strategy and FDA approval',
      market_access: 'market access and commercialization',
      general: 'your healthcare question',
    };
    
    const modeDescriptions = {
      sequential: 'sequential consultation allows each expert to provide focused advice one at a time',
      collaborative: 'collaborative discussion enables experts to debate and build consensus',
      hybrid: 'hybrid approach adapts between sequential and collaborative modes as needed',
    };
    
    return `Based on your query about ${useCaseDescriptions[useCase]}, I recommend a ${panelMode} panel with ${agentCount} expert${agentCount > 1 ? 's' : ''}. A ${modeDescriptions[panelMode]}, powered by ${framework.toUpperCase()}.`;
  }
}

// Singleton instance
export const agentRecommendationEngine = new AgentRecommendationEngine();


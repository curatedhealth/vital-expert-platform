/**
 * Digital Health Router - Specialized routing for digital health queries
 * Priority routing system for digital health specialists
 */

import { DigitalHealthAgent } from '@/agents/core/DigitalHealthAgent';
import { IntentResult } from './orchestration.types';

interface DigitalHealthMatch {
  agent: DigitalHealthAgent;
  score: number;
  reasoning: string;
  confidence: number;
}

export class DigitalHealthRouter {
  private digitalHealthAgents: Map<string, DigitalHealthAgent> = new Map();

  // Digital health specialization mapping
  private specializations = {
    'digital_therapeutics': {
      keywords: ['dtx', 'digital therapeutic', 'prescription digital', 'samd', 'software as medical device'],
      primaryAgent: 'digital-therapeutics-expert',
      alternativeAgents: ['ai-ml-clinical-specialist'],
      complexity: 'high'
    },
    'mobile_health': {
      keywords: ['mhealth', 'mobile health', 'health app', 'wearable', 'fitness tracker'],
      primaryAgent: 'mhealth-innovation-architect',
      alternativeAgents: ['digital-therapeutics-expert'],
      complexity: 'medium'
    },
    'telehealth': {
      keywords: ['telemedicine', 'telehealth', 'virtual care', 'remote monitoring', 'rpm'],
      primaryAgent: 'telehealth-program-director',
      alternativeAgents: ['mhealth-innovation-architect'],
      complexity: 'medium'
    },
    'ai_ml_clinical': {
      keywords: ['artificial intelligence', 'machine learning', 'ai', 'ml', 'algorithm', 'clinical ai'],
      primaryAgent: 'ai-ml-clinical-specialist',
      alternativeAgents: ['digital-therapeutics-expert'],
      complexity: 'high'
    },
    'integration': {
      keywords: ['fhir', 'ehr integration', 'interoperability', 'api', 'health information exchange'],
      primaryAgent: 'health-tech-integration-expert',
      alternativeAgents: ['ai-ml-clinical-specialist'],
      complexity: 'high'
    }
  };

  constructor() {
    this.initializeAgents();
  }

  async selectBestAgent(query: string, intent: IntentResult): Promise<DigitalHealthAgent | null> {
    const candidates = await this.findCandidateAgents(query, intent);

    if (candidates.length === 0) {
      return null;
    }

    // Sort by score and return best match
    candidates.sort((a, b) => b.score - a.score);

    const bestMatch = candidates[0];

    return bestMatch.agent;
  }

  private calculateMatch(query: string, intent: IntentResult, specialty: string, config: any): { score: number; reasoning: string; confidence: number } {
    // Simple keyword matching for now
    const keywords = config.keywords || [];
    const queryLower = query.toLowerCase();
    
    let score = 0;
    let matchedKeywords: string[] = [];
    
    for (const keyword of keywords) {
      if (queryLower.includes(keyword.toLowerCase())) {
        score += 20;
        matchedKeywords.push(keyword);
      }
    }
    
    // Boost score based on intent
    if (intent.primaryDomain === specialty) {
      score += 30;
    }
    
    const reasoning = matchedKeywords.length > 0 
      ? `Matched keywords: ${matchedKeywords.join(', ')}`
      : 'No keyword matches found';
      
    const confidence = Math.min(100, score);
    
    return { score, reasoning, confidence };
  }

  private calculateGeneralScore(query: string, intent: IntentResult, agent: DigitalHealthAgent): number {
    // Simple general scoring based on agent capabilities
    const config = agent.getConfig();
    let score = 0;
    
    // Base score for all agents
    score += 20;
    
    // Boost for high confidence intent
    if (intent.confidence > 0.8) {
      score += 15;
    }
    
    // Boost for complex queries
    if (intent.complexity === 'high' || intent.complexity === 'very-high') {
      score += 10;
    }
    
    return Math.min(100, score);
  }

  private async findCandidateAgents(query: string, intent: IntentResult): Promise<DigitalHealthMatch[]> {
    const candidates: DigitalHealthMatch[] = [];

    // Check each specialization
    for (const [specialty, config] of Object.entries(this.specializations)) {
      const match = this.calculateMatch(query, intent, specialty, config);

      if (match.score > 0) {
        // Get primary agent
        const primaryAgent = this.digitalHealthAgents.get(config.primaryAgent);

        if (primaryAgent) {
          candidates.push({
            agent: primaryAgent,
            score: match.score,
            reasoning: `Primary ${specialty} specialist: ${match.reasoning}`,
            confidence: match.confidence
          });
        }

        // Add alternative agents with lower score
        for (const altAgent of config.alternativeAgents) {
          const agent = this.digitalHealthAgents.get(altAgent);

          if (agent && match.score > 60) { // Only include alternatives for strong matches
            candidates.push({
              agent,
              score: match.score * 0.7, // 70% of primary score
              reasoning: `Alternative ${specialty} specialist: ${match.reasoning}`,
              confidence: match.confidence * 0.8
            });
          }
        }
      }
    }

    // Add general digital health scoring
    for (const [agentId, agent] of this.digitalHealthAgents.entries()) {
      const generalScore = this.calculateGeneralScore(query, intent, agent);

      if (generalScore > 30 && !candidates.some(c => c.agent.getConfig().name === agentId)) {
        candidates.push({
          agent,
          score: generalScore,
          reasoning: 'General digital health capabilities match',
          confidence: generalScore / 100 * 80
        });
      }
    }

    return candidates;
  }

  private calculateSpecialtyMatch(
    query: string,
    intent: IntentResult,
    specialty: string,
    config: any
  ): { score: number; reasoning: string; confidence: number } {
    let score = 0;
    const reasons: string[] = [];

    // Direct intent match
    if (intent.intent === specialty || intent.subintents.includes(specialty)) {
      score += 40;
      reasons.push('Direct intent match');
    }

    // Keyword matching
    let keywordMatches = 0;
    for (const keyword of config.keywords) {
      if (query.includes(keyword)) {
        keywordMatches++;
        score += 15;
        reasons.push(`Keyword: "${keyword}"`);
      }
    }

    // Domain relevance
    if (intent.domains.includes('digital_health')) {
      score += 20;
      reasons.push('Digital health domain');
    }

    // Complexity alignment
    if (intent.complexity === config.complexity) {
      score += 10;
      reasons.push('Complexity alignment');
    } else if (
      (intent.complexity === 'very-high' && config.complexity === 'high') ||
      (intent.complexity === 'high' && config.complexity === 'medium')
    ) {
      score += 5;
      reasons.push('Complexity compatibility');
    }

    // Confidence based on number of signals

    return {
      score: Math.min(100, score),
      reasoning: reasons.join(', '),
      confidence: Math.min(100, score)
    };
  }

  private calculateGeneralDigitalHealthScore(
    query: string,
    intent: IntentResult,
    agent: DigitalHealthAgent
  ): number {
    let score = 0;
    const config = agent.getConfig();

    // Check agent capabilities
    const capabilities = config.capabilities || [];
    const domains: string[] = []; // knowledge_domains not available in config interface

    // Capability matching
    for (const capability of capabilities) {
      const capLower = capability.toLowerCase();

      if (query.includes(capLower) || intent.keywords.some(kw => capLower.includes(kw))) {
        score += 8;
      }
    }

    // Domain matching
    for (const domain of domains) {
      const domainLower = domain.toLowerCase();

      if (intent.domains.some(d => domainLower.includes(d)) ||
          intent.keywords.some(kw => domainLower.includes(kw))) {
        score += 6;
      }
    }

    // Priority bonus for higher tier agents
    if (agent.getConfig().tier === 1) {
      score += 5;
    }

    // Digital health keywords in agent profile
    const digitalKeywords = ['digital', 'health', 'technology', 'innovation', 'ai', 'ml', 'data'];
    const agentProfile = `${config.name} ${config.description || ''}`.toLowerCase();

    for (const keyword of digitalKeywords) {
      if (agentProfile.includes(keyword)) {
        score += 3;
      }
    }

    return Math.min(100, score);
  }

  private async initializeAgents() {
    // This would be populated by the main orchestrator
    // For now, we'll simulate the initialization
  }

  // Method to register digital health agents
  registerAgent(agent: DigitalHealthAgent) {
    this.digitalHealthAgents.set(agent.getConfig().name, agent);
    // console.log(`Registered digital health agent: ${agent.getConfig().name}`);
  }

  // Method to get routing statistics
  getRoutingStats(): {
    totalAgents: number;
    specializations: string[];
    lastRouted?: string;
  } {
    return {
      totalAgents: this.digitalHealthAgents.size,
      specializations: Object.keys(this.specializations),
      lastRouted: new Date().toISOString()
    };
  }

  // Method to update specialization mappings
  updateSpecializations(customMappings: Record<string, unknown>) {
    Object.assign(this.specializations, customMappings);
  }
}
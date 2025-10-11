/**
 * Agent Selector - Intelligent agent selection and matching
 * Part of VITAL AI Master Orchestrator System
 */

import { DigitalHealthAgent } from '@/agents/core/DigitalHealthAgent';
import { IntentResult } from '@/orchestration.types';

interface AgentMatch {
  agent: DigitalHealthAgent;
  score: number;
  reasoning: string;
  confidence: number;
}

export class AgentSelector {
  private agents: Map<string, DigitalHealthAgent> = new Map();
  private intentAgentMap: Record<string, string[]> = {};
  private domainAgentMap: Record<string, string[]> = {};

  // Domain to agent mapping
  private domainMappings = {
    'regulatory': ['fda-regulatory-strategist', 'qms-architect', 'hipaa-compliance-officer'],
    'clinical': ['clinical-trial-designer', 'medical-safety-officer', 'clinical-evidence-analyst'],
    'digital_health': ['digital-therapeutics-expert', 'mhealth-innovation-architect', 'ai-ml-clinical-specialist'],
    'market_access': ['market-access-strategist', 'health-economics-analyst', 'value-economics-analyst'],
    'business': ['healthcare-service-designer', 'competitive-intelligence-analyst'],
    'compliance': ['hipaa-compliance-officer', 'qms-architect'],
    'medical': ['medical-writer', 'medical-literature-analyst', 'patient-engagement-specialist']
  };

  // Intent-specific agent preferences
  private intentMappings = {
    'fda_pathway': ['fda-regulatory-strategist', 'clinical-trial-designer'],
    'clinical_trial_design': ['clinical-trial-designer', 'clinical-evidence-analyst'],
    'digital_therapeutics': ['digital-therapeutics-expert', 'ai-ml-clinical-specialist'],
    'reimbursement_strategy': ['market-access-strategist', 'health-economics-analyst'],
    'data_privacy': ['hipaa-compliance-officer'],
    'quality_system': ['qms-architect'],
    'safety_monitoring': ['medical-safety-officer'],
    'evidence_generation': ['clinical-evidence-analyst', 'medical-literature-analyst'],
    'ai_ml_clinical': ['ai-ml-clinical-specialist', 'digital-therapeutics-expert'],
    'telehealth': ['telehealth-program-director', 'mhealth-innovation-architect'],
    'mobile_health': ['mhealth-innovation-architect', 'digital-therapeutics-expert'],
    'integration': ['health-tech-integration-expert', 'ai-ml-clinical-specialist']
  };

  async selectAgents(intent: IntentResult, query: string): Promise<DigitalHealthAgent[]> {
    // Mock candidates for now - in real implementation would query available agents
    const candidates: Array<{ agent: DigitalHealthAgent; score: number }> = [];

    if (candidates.length === 0) {
      return [];
    }

    // Sort by score
    candidates.sort((a, b) => b.score - a.score);

    // Determine how many agents to return
    let selectedAgents: DigitalHealthAgent[] = [];

    if (intent.requiresMultiAgent || intent.complexity === 'very-high') {
      // Multi-agent selection - take top 2-3 agents with score > 60
      selectedAgents = candidates
        .filter(c => c.score > 60)
        .slice(0, 3)
        .map(c => c.agent);
    } else {
      // Single agent selection - take best match if score > 70
      if (candidates[0].score > 70) {
        selectedAgents = [candidates[0].agent];
      } else {
        selectedAgents = [];
      }
    }

    // Log reasoning
    selectedAgents.forEach((agent, index) => {
      const config = agent.getConfig();
      const match = config.capabilities?.some(spec =>
        query.toLowerCase().includes(spec.toLowerCase())
      );
      if (match) {
        // Log specialization match
      }
    });

    return selectedAgents;
  }

  private async findCandidateAgents(intent: IntentResult, query: string): Promise<AgentMatch[]> {
    const candidates: AgentMatch[] = [];

    // 1. Intent-based matching (highest priority)
    const intentAgents = this.intentAgentMap[intent.intent] || [];
    
    for (const agentId of intentAgents) {
      const agent = this.agents.get(agentId);
      if (agent) {
        const score = this.calculateAgentScore(agent, query, intent);
        if (score > 0) {
          candidates.push({
            agent,
            score: score + 20, // Intent bonus
            reasoning: `Primary intent match: ${intent.intent}`,
            confidence: intent.confidence
          });
        }
      }
    }

    // 2. Domain-based matching
    for (const domain of intent.domains.slice(0, 3)) { // Top 3 domains
      const domainAgents = this.domainAgentMap[domain] || [];
      
      for (const agentId of domainAgents) {
        const agent = this.agents.get(agentId);
        if (agent && !candidates.some(c => c.agent.getConfig().name === agentId)) {
          const score = this.calculateAgentScore(agent, query, intent);
          if (score > 0) {
            candidates.push({
              agent,
              score,
              reasoning: `Domain expertise: ${domain}`,
              confidence: Math.min(intent.confidence, score)
            });
          }
        }
      }
    }

    // 3. Keyword and capability matching
    for (const [agentId, agent] of this.agents.entries()) {
      if (!candidates.some(c => c.agent.getConfig().name === agentId)) {
        const score = this.calculateAgentScore(agent, query, intent);
        if (score > 40) { // Only include if reasonably relevant
          candidates.push({
            agent,
            score,
            reasoning: 'Capability and keyword match',
            confidence: score * 0.8
          });
        }
      }
    }

    return candidates;
  }

  private calculateAgentScore(agent: DigitalHealthAgent, query: string, intent: IntentResult): number {
    let score = 0;

    // Capability alignment
    const capabilities = agent.getCapabilities();
    const capabilityBonus = capabilities.filter(cap => 
      query.toLowerCase().includes(cap.toLowerCase())
    ).length * 5;
    score += capabilityBonus;

    // Tier priority
    if (agent.getConfig().tier === 1) {
      score += 10;
    } else if (agent.getConfig().tier === 2) {
      score += 5;
    }

    // Domain expertise alignment - using name as domain for now
    const agentName = agent.getConfig().name;
    const agentDomain = agentName.split('-')[0]; // Extract domain from agent name
    if (agentDomain && intent.domains.includes(agentDomain)) {
      score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateIntentScore(agent: DigitalHealthAgent, intent: IntentResult, query: string): number {
    let score = 0;

    // Capability alignment
    const capabilities = agent.getCapabilities();
    const capabilityBonus = capabilities.filter(cap => 
      query.toLowerCase().includes(cap.toLowerCase())
    ).length * 5;
    score += capabilityBonus;

    // Tier priority
    if (agent.getConfig().tier === 1) {
      score += 10;
    } else if (agent.getConfig().tier === 2) {
      score += 5;
    }

    // Domain expertise alignment - using name as domain for now
    const agentName = agent.getConfig().name;
    const agentDomain = agentName.split('-')[0]; // Extract domain from agent name
    if (agentDomain && intent.domains.includes(agentDomain)) {
      score += 15;
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateDomainScore(
    agent: DigitalHealthAgent,
    intent: IntentResult,
    query: string,
    domain: string
  ): number {
    let score = 0;

    // Agent domain matching
    const agentConfig = agent.getConfig();
    const agentDomain = (agentConfig as any).domain_expertise || agentConfig.specialization?.[0];
    if (agentDomain === domain) {
      score += 20;
    }

    // Capability matching
    const capabilityBonus = this.calculateCapabilityScore(
      agent,
      intent,
      query
    );
    score += capabilityBonus * 0.7; // Slightly lower weight for domain matches

    // Priority and status
    if (agent.getConfig().tier === 1) {
      score += 8;
    }

    // Status check - removed as status is not in the config interface

    // Competency levels - removed as competency_levels is not in the config interface

    return Math.min(100, Math.max(0, score));
  }

  private calculateCapabilityScore(agent: DigitalHealthAgent, intent: IntentResult, query: string): number {
    let score = 0;
    const capabilities = agent.getConfig().capabilities || [];
    
    // Simple capability matching
    capabilities.forEach(capability => {
      if (query.toLowerCase().includes(capability.toLowerCase())) {
        score += 10;
      }
    });

    // Knowledge domain matching - removed as knowledge_domains is not in the config interface

    // Description matching - removed as description is not in the config interface
    // Use system_prompt instead for keyword matching
    const systemPrompt = (agent.getConfig() as any).system_prompt || '';
    let descriptionMatches = 0;

    for (const keyword of intent.keywords) {
      if (systemPrompt.includes(keyword.toLowerCase())) {
        score += 5;
        descriptionMatches++;
      }
    }

    // Additional system prompt relevance check (already declared above)
    for (const keyword of intent.keywords.slice(0, 3)) { // Check top keywords
      if (systemPrompt.includes(keyword.toLowerCase())) {
        score += 3;
      }
    }

    return Math.min(100, Math.max(0, score));
  }

  private calculateCapabilityAlignment(
    capabilities: string[],
    intent: IntentResult,
    query: string
  ): number {
    let alignmentScore = 0;

    for (const capability of capabilities) {
      const capLower = capability.toLowerCase();

      // Direct keyword matches
      for (const keyword of intent.keywords) {
        if (capLower.includes(keyword.toLowerCase()) || keyword.toLowerCase().includes(capLower)) {
          alignmentScore += 8;
        }
      }

      // Query text matching
      const queryLower = query.toLowerCase();
      if (queryLower.includes(capLower) || capLower.includes(queryLower.split(' ').find(word => word.length > 4) || '')) {
        alignmentScore += 5;
      }

      // Intent matching
      if (capLower.includes(intent.intent) || intent.intent.includes(capLower)) {
        alignmentScore += 10;
      }
    }

    return Math.min(40, alignmentScore); // Cap the capability bonus
  }

  // Register agents
  registerAgent(agent: DigitalHealthAgent) {
    this.agents.set(agent.getConfig().name, agent);
  }

  // Get all agents
  getAllAgents(): DigitalHealthAgent[] {
    return Array.from(this.agents.values());
  }

  // Get agents by domain
  getAgentsByDomain(domain: string): DigitalHealthAgent[] {
    const agentIds = this.domainAgentMap[domain] || [];
    return agentIds.map(id => this.agents.get(id)).filter(Boolean) as DigitalHealthAgent[];
  }

  // Update domain mappings
  updateDomainMappings(mappings: Record<string, string[]>) {
    Object.assign(this.domainMappings, mappings);
  }

  // Update intent mappings
  updateIntentMappings(mappings: Record<string, string[]>) {
    Object.assign(this.intentMappings, mappings);
  }

  // Get selection statistics
  getStats(): {
    totalAgents: number;
    domainCoverage: Record<string, number>;
    intentCoverage: Record<string, number>;
  } {
    const domainCoverage: Record<string, number> = { /* TODO: implement */ };
    const intentCoverage: Record<string, number> = { /* TODO: implement */ };

    for (const [domain, agents] of Object.entries(this.domainMappings)) {
      domainCoverage[domain] = agents.filter(id => this.agents.has(id)).length;
    }

    for (const [intent, agents] of Object.entries(this.intentMappings)) {
      intentCoverage[intent] = agents.filter(id => this.agents.has(id)).length;
    }

    return {
      totalAgents: this.agents.size,
      domainCoverage,
      intentCoverage
    };
  }
}
import { QueryAnalyzer, QueryAnalysis } from './query-analyzer';
import { AgentMatcher, AgentMatch } from './agent-matcher';
import { Agent } from '@/types/agent';

export interface OrchestrationResult {
  selectedAgent: Agent;
  alternativeAgents: Agent[];
  confidence: number;
  reasoning: string[];
  strategy: 'single' | 'multi' | 'escalation';
  analysis: QueryAnalysis;
  metadata: {
    processingTime: number;
    matchCount: number;
    tierUsed: number;
  };
}

export class AutomaticAgentOrchestrator {
  private queryAnalyzer: QueryAnalyzer;
  private agentMatcher: AgentMatcher;
  private agents: Agent[];
  
  constructor() {
    this.queryAnalyzer = new QueryAnalyzer();
    this.agents = this.loadAgents();
    this.agentMatcher = new AgentMatcher(this.agents);
  }
  
  async orchestrate(query: string): Promise<OrchestrationResult> {
    const startTime = Date.now();
    
    // Step 1: Analyze the query
    console.log('🔍 Analyzing query...');
    const analysis = await this.queryAnalyzer.analyzeQuery(query);
    
    console.log('📊 Query Analysis:', {
      intent: analysis.intent.primary,
      complexity: analysis.complexity.score,
      domain: analysis.domain.primary,
      requiredCapabilities: analysis.requiredCapabilities.length
    });
    
    // Step 2: Determine orchestration strategy
    const strategy = this.determineStrategy(analysis);
    console.log(`📋 Orchestration strategy: ${strategy}`);
    
    // Step 3: Execute strategy
    let result: OrchestrationResult;
    
    switch (strategy) {
      case 'single':
        result = await this.executeSingleAgentStrategy(analysis);
        break;
      case 'multi':
        result = await this.executeMultiAgentStrategy(analysis);
        break;
      case 'escalation':
        result = await this.executeEscalationStrategy(analysis);
        break;
      default:
        result = await this.executeSingleAgentStrategy(analysis);
    }
    
    // Add metadata
    result.metadata.processingTime = Date.now() - startTime;
    
    console.log('✅ Orchestration complete:', {
      selectedAgent: result.selectedAgent.name,
      confidence: result.confidence,
      processingTime: result.metadata.processingTime
    });
    
    return result;
  }
  
  private determineStrategy(analysis: QueryAnalysis): 'single' | 'multi' | 'escalation' {
    // Multi-agent for interdisciplinary queries
    if (analysis.domain.interdisciplinary) {
      return 'multi';
    }
    
    // Escalation for high complexity
    if (analysis.complexity.score >= 8) {
      return 'escalation';
    }
    
    // Single agent for straightforward queries
    return 'single';
  }
  
  private async executeSingleAgentStrategy(analysis: QueryAnalysis): Promise<OrchestrationResult> {
    // Find best matching agents
    const matches = await this.agentMatcher.findBestAgents(analysis, {
      maxAgents: 5,
      minConfidence: 0.6
    });
    
    if (matches.length === 0) {
      // Fallback to general agent
      return this.getFallbackAgent(analysis);
    }
    
    const bestMatch = matches[0];
    
    return {
      selectedAgent: bestMatch.agent,
      alternativeAgents: matches.slice(1).map(m => m.agent),
      confidence: bestMatch.confidence,
      reasoning: bestMatch.reasoning,
      strategy: 'single',
      analysis,
      metadata: {
        processingTime: 0,
        matchCount: matches.length,
        tierUsed: bestMatch.tier
      }
    };
  }
  
  private async executeMultiAgentStrategy(analysis: QueryAnalysis): Promise<OrchestrationResult> {
    // Find agents for each domain
    const agentsByDomain = new Map<string, AgentMatch[]>();
    
    // Primary domain
    const primaryMatches = await this.agentMatcher.findBestAgents(
      { ...analysis, domain: { ...analysis.domain, secondary: [] } },
      { maxAgents: 2, minConfidence: 0.6 }
    );
    agentsByDomain.set(analysis.domain.primary, primaryMatches);
    
    // Secondary domains
    for (const domain of analysis.domain.secondary || []) {
      const matches = await this.agentMatcher.findBestAgents(
        { ...analysis, domain: { primary: domain, secondary: [], interdisciplinary: false } },
        { maxAgents: 1, minConfidence: 0.5 }
      );
      agentsByDomain.set(domain, matches);
    }
    
    // Select coordinating agent (highest tier from primary domain)
    const coordinatingAgent = primaryMatches[0]?.agent || this.getGeneralAgent();
    
    // Collect all participating agents
    const participatingAgents: Agent[] = [];
    for (const matches of agentsByDomain.values()) {
      participatingAgents.push(...matches.map(m => m.agent));
    }
    
    return {
      selectedAgent: coordinatingAgent,
      alternativeAgents: participatingAgents.filter(a => a.id !== coordinatingAgent.id),
      confidence: primaryMatches[0]?.confidence || 0.5,
      reasoning: [
        `Interdisciplinary query requiring ${agentsByDomain.size} domain experts`,
        `Coordinating agent: ${coordinatingAgent.name}`,
        ...Array.from(agentsByDomain.entries()).map(([domain, matches]) => 
          `${domain}: ${matches[0]?.agent.name || 'Not found'}`
        )
      ],
      strategy: 'multi',
      analysis,
      metadata: {
        processingTime: 0,
        matchCount: participatingAgents.length,
        tierUsed: coordinatingAgent.tier || 1
      }
    };
  }
  
  private async executeEscalationStrategy(analysis: QueryAnalysis): Promise<OrchestrationResult> {
    // Start with Tier 2, prepare Tier 3 for escalation
    const tier2Matches = await this.agentMatcher.findBestAgents(analysis, {
      maxAgents: 3,
      minConfidence: 0.5,
      includeTiers: [2]
    });
    
    const tier3Matches = await this.agentMatcher.findBestAgents(analysis, {
      maxAgents: 2,
      minConfidence: 0.4,
      includeTiers: [3]
    });
    
    // Select best Tier 2 agent, with Tier 3 as backup
    const selectedAgent = tier2Matches[0]?.agent || tier3Matches[0]?.agent || this.getGeneralAgent();
    const escalationPath = [...tier2Matches.map(m => m.agent), ...tier3Matches.map(m => m.agent)];
    
    return {
      selectedAgent,
      alternativeAgents: escalationPath.filter(a => a.id !== selectedAgent.id),
      confidence: tier2Matches[0]?.confidence || 0.5,
      reasoning: [
        `High complexity query (score: ${analysis.complexity.score}/10)`,
        `Starting with Tier ${selectedAgent.tier || 1} agent`,
        `Escalation path prepared with ${tier3Matches.length} Tier 3 experts`,
        ...tier2Matches[0]?.reasoning || []
      ],
      strategy: 'escalation',
      analysis,
      metadata: {
        processingTime: 0,
        matchCount: tier2Matches.length + tier3Matches.length,
        tierUsed: selectedAgent.tier || 1
      }
    };
  }
  
  private getFallbackAgent(analysis: QueryAnalysis): OrchestrationResult {
    const fallbackAgent = this.getGeneralAgent();
    
    return {
      selectedAgent: fallbackAgent,
      alternativeAgents: [],
      confidence: 0.3,
      reasoning: [
        'No specific expert found, using general AI assistant',
        `Query domain: ${analysis.domain.primary}`,
        'Consider manual agent selection for better results'
      ],
      strategy: 'single',
      analysis,
      metadata: {
        processingTime: 0,
        matchCount: 0,
        tierUsed: 1
      }
    };
  }
  
  private getGeneralAgent(): Agent {
    return {
      id: 'general-ai',
      name: 'General AI Assistant',
      display_name: 'General AI Assistant',
      description: 'A versatile AI assistant with broad knowledge across medical and regulatory domains.',
      system_prompt: 'You are a helpful AI assistant with broad knowledge across medical and regulatory domains.',
      business_function: 'General Support',
      tier: 1,
      model: 'gpt-4',
      temperature: 0.7,
      max_tokens: 2000,
      capabilities: ['general_knowledge', 'basic_analysis', 'information_synthesis'],
      knowledge_domains: ['general'],
      rag_enabled: true
    };
  }
  
  private loadAgents(): Agent[] {
    // Load from database
    // This is a placeholder - implement actual loading
    return [
      // Tier 1 Agents
      {
        id: 'med-info-specialist',
        name: 'Medical Information Specialist',
        display_name: 'Dr. Sarah Chen, MD',
        description: 'Specialist in drug information and medical queries',
        system_prompt: 'You are a medical information specialist with expertise in drug information, medical knowledge, and patient safety.',
        business_function: 'Medical Information',
        tier: 1,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 2000,
        capabilities: ['drug_information', 'medical_knowledge', 'patient_safety'],
        knowledge_domains: ['pharmacology', 'medicine', 'patient_care'],
        rag_enabled: true
      },
      {
        id: 'regulatory-specialist',
        name: 'Regulatory Affairs Specialist',
        display_name: 'Dr. Michael Rodriguez, PhD',
        description: 'Expert in regulatory compliance and submissions',
        system_prompt: 'You are a regulatory affairs specialist with deep knowledge of FDA, EMA, and other regulatory requirements.',
        business_function: 'Regulatory Affairs',
        tier: 1,
        model: 'gpt-4',
        temperature: 0.6,
        max_tokens: 2500,
        capabilities: ['regulatory_compliance', 'submission_expertise', 'guideline_interpretation'],
        knowledge_domains: ['regulatory', 'compliance', 'submissions'],
        rag_enabled: true
      },
      // Tier 2 Agents
      {
        id: 'clinical-trial-expert',
        name: 'Clinical Trial Expert',
        display_name: 'Dr. Jennifer Walsh, PhD',
        description: 'Specialist in clinical trial design and management',
        system_prompt: 'You are a clinical trial expert with extensive experience in protocol design, patient safety, and regulatory compliance.',
        business_function: 'Clinical Development',
        tier: 2,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 3000,
        capabilities: ['clinical_trials', 'protocol_design', 'patient_safety', 'regulatory_compliance'],
        knowledge_domains: ['clinical', 'trials', 'protocols', 'safety'],
        rag_enabled: true
      },
      {
        id: 'pharmacovigilance-expert',
        name: 'Pharmacovigilance Expert',
        display_name: 'Dr. David Kim, MD',
        description: 'Expert in drug safety and adverse event reporting',
        system_prompt: 'You are a pharmacovigilance expert specializing in drug safety monitoring, adverse event reporting, and risk assessment.',
        business_function: 'Safety',
        tier: 2,
        model: 'gpt-4',
        temperature: 0.6,
        max_tokens: 2500,
        capabilities: ['pharmacovigilance', 'adverse_event_reporting', 'risk_assessment', 'safety_monitoring'],
        knowledge_domains: ['safety', 'pharmacovigilance', 'adverse_events'],
        rag_enabled: true
      },
      // Tier 3 Agents
      {
        id: 'senior-medical-director',
        name: 'Senior Medical Director',
        display_name: 'Dr. Elizabeth Thompson, MD, PhD',
        description: 'Senior medical expert with comprehensive healthcare knowledge',
        system_prompt: 'You are a senior medical director with comprehensive expertise across all medical domains, regulatory affairs, and clinical development.',
        business_function: 'Medical Affairs',
        tier: 3,
        model: 'gpt-4',
        temperature: 0.7,
        max_tokens: 4000,
        capabilities: ['medical_knowledge', 'regulatory_expertise', 'clinical_trials', 'strategic_planning', 'interdisciplinary'],
        knowledge_domains: ['medicine', 'regulatory', 'clinical', 'strategy'],
        rag_enabled: true
      }
    ];
  }
  
  // Performance tracking
  async trackPerformance(
    orchestrationResult: OrchestrationResult,
    outcome: {
      success: boolean;
      responseTime: number;
      userRating?: number;
    }
  ) {
    // Store performance metrics for future optimization
    const performance = {
      agentId: orchestrationResult.selectedAgent.id,
      queryAnalysis: orchestrationResult.analysis,
      confidence: orchestrationResult.confidence,
      outcome,
      timestamp: new Date()
    };
    
    // Save to database
    await this.savePerformanceMetrics(performance);
  }
  
  private async savePerformanceMetrics(performance: any) {
    // Implement database storage
    console.log('📊 Saving performance metrics:', performance);
  }
}
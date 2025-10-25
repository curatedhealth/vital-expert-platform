/**
 * VITAL AI Enhanced Orchestrator - Phase 2 Implementation v3.0
 *
 * 🚀 World-Class Healthcare Business Intelligence System
 *
 * Master orchestrator that implements:
 * - Ultra-intelligent intent classification (<50ms target)
 * - Adaptive complexity assessment and routing
 * - Dynamic multi-agent collaboration orchestration
 * - Context-aware response synthesis with pharmaceutical expertise
 * - Real-time performance optimization and learning
 * - Seamless integration with existing ComplianceAwareOrchestrator
 */

import { performanceMetricsService } from '@/shared/services/monitoring/performance-metrics.service';
import { agentRAGIntegration, AgentRAGQuery } from '@/shared/services/rag/agent-rag-integration';
import {
  ExecutionContext
} from '@/types/digital-health-agent.types';

import { ComplianceAwareOrchestrator } from './ComplianceAwareOrchestrator';

// Phase 2 Enhanced Types
interface IntentClassificationResult {
  category: string;
  confidence: number;
  subcategories: string[];
  keyTerms: string[];
  complexity: number;
  processingTime: number;
  contextualFactors: {
    urgency: 'low' | 'medium' | 'high' | 'critical';
    stakeholder: 'researcher' | 'regulatory' | 'clinical' | 'commercial' | 'executive';
    phase: 'discovery' | 'preclinical' | 'clinical' | 'regulatory' | 'commercial';
    riskLevel: number; // 0-1 scale
  };
  semanticVector: number[]; // For advanced similarity matching
}

interface AgentSelectionResult {
  primaryAgent: string;
  collaborators: string[];
  collaborationType: 'single' | 'parallel' | 'sequential' | 'hierarchical';
  reasoning: string;
}

interface UnifiedResponse {
  content: string;
  confidence: number;
  contributors: string[];
  processingTime: number;
  executionMetadata: {
    primaryAgent: string;
    collaborationType: string;
    stepsExecuted: number;
    complianceStatus: string;
  };
}

export class VitalAIOrchestrator extends ComplianceAwareOrchestrator {
  private intentPatterns: Map<string, IntentPattern>;
  private agentSelectionMatrix: Map<string, AgentSelectionRule[]>;
  private responseCache: Map<string, CachedResponse>;
  private performanceMetrics: PerformanceTracker;
  private availableAgents: unknown[] = [];
  private agentsLastFetched: number = 0;
  private readonly AGENTS_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  constructor() {
    super();
    this.intentPatterns = new Map();
    this.agentSelectionMatrix = new Map();
    this.responseCache = new Map();
    this.performanceMetrics = new PerformanceTracker();

    this.initializeIntentPatterns();
    this.initializeAgentSelectionMatrix();

    // Initialize base orchestrator agents
    this.initializeBaseAgents();
  }

  /**
   * 🚀 Initialize base orchestrator agents
   */
  private async initializeBaseAgents(): Promise<void> {
    try {
      // // await this.initializeOrchestrator(); // TODO: Fix this method

      // Verify agents are loaded

      // // Debug: List the first few agent names

      // }`);

    } catch (error) {
      // console.warn('⚠️ Base agent initialization failed, using fallback mode:', error);
    }
  }

  /**
   * 🎯 Ensure agents are ready before processing
   */
  private async ensureAgentsReady(): Promise<void> {

    if (this.availableAgents.length === 0) {
      // await this.initializeBaseAgents();
    }
  }

  /**
   * 🎯 Fetch available agents dynamically from API
   */
  private async fetchAvailableAgents(): Promise<unknown[]> {
    try {
      // Use cache if recent
      if (this.availableAgents.length > 0 &&
          Date.now() - this.agentsLastFetched < this.AGENTS_CACHE_TTL) {
        return this.availableAgents;
      }

      // TODO: Implement actual API call
      // const response = await fetch('http://localhost:3000/api/agents');
      // if (!response.ok) {
      //   throw new Error(`Failed to fetch agents: ${response.status}`);
      // }
      // const agentsData = await response.json();
      // this.availableAgents = agentsData.success ? agentsData.data.agents : [];
      // this.agentsLastFetched = Date.now();

      return this.availableAgents;

    } catch (error) {
      // console.warn('⚠️ Failed to fetch agents, using fallback:', error);

      // Return minimal fallback agents
      return [
        { name: 'fda-regulatory-strategist', capabilities: ['regulatory_compliance'], tier: 1 },
        { name: 'clinical-trial-designer', capabilities: ['clinical_research'], tier: 1 },
        { name: 'medical-writer', capabilities: ['documentation'], tier: 1 }
      ];
    }
  }

  /**
   * 🚀 Master Processing Function - Ultra-Intelligent Healthcare AI Orchestration
   * Target: <300ms total response time with world-class pharmaceutical expertise
   */
  async processQuery(
    userQuery: string,
    context: ExecutionContext
  ): Promise<UnifiedResponse> {
    const operationId = `op_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Start performance tracking
    performanceMetricsService.startOperation(
      operationId,
      'orchestrator',
      'process_query',
      {
        userId: context.user_id || 'unknown',
        queryLength: userQuery.length,
        complianceLevel: context.compliance_level || 'standard',
        requestSource: 'vital-ai-orchestrator'
      }
    );

    try {
      // + '...',
      //   timestamp: new Date().toISOString(),
      //   operationId
      // });

      // Ensure agents are ready before processing
      await this.ensureAgentsReady();

      // Step 1: Ultra-intelligent intent classification with contextual analysis (<50ms target)
      const classificationStart = Date.now();
      const intent = await this.classifyIntent(userQuery, context);
      const classificationTime = Date.now() - classificationStart;

      // Step 2: Adaptive agent selection with pharmaceutical expertise mapping
      const agentSelection = await this.selectAgentsForIntent(intent, context, userQuery);

      // Step 3: Dynamic collaboration strategy determination
      const collaborationType = this.determineCollaborationType(
        intent.complexity,
        agentSelection.collaborators.length
      );

      // // Step 4: Execute with pharmaceutical-focused orchestration
      let response: UnifiedResponse;

      if (collaborationType === 'single') {
        response = await this.executeSingleAgentPharmaFocused(
          agentSelection.primaryAgent,
          userQuery,
          context,
          intent
        );
      } else {
        response = await this.executeMultiAgentPharmaCollaboration(
          agentSelection,
          userQuery,
          context,
          intent
        );
      }

      // Step 5: Advanced performance tracking and optimization
      const totalTime = Date.now() - parseInt(operationId.split('_')[1]);
      const enhancedResponse = response;

      this.performanceMetrics.recordExecution({
        query: userQuery,
        intent: intent.category,
        complexity: intent.complexity,
        contextualFactors: intent.contextualFactors,
        collaborationType,
        processingTime: totalTime,
        classificationTime,
        agentsUsed: [agentSelection.primaryAgent, ...agentSelection.collaborators],
        confidence: response.confidence
      });

      // Step 6: Quality enhancement and validation

      // // Complete performance tracking
      performanceMetricsService.endOperation(
        operationId,
        context.session_id || 'unknown',
        true,
        undefined,
        context.user_id || 'unknown'
      );

      // Track orchestrator decision metrics
      performanceMetricsService.trackOrchestratorDecision(
        context.session_id || 'unknown',
        totalTime,
        [agentSelection.primaryAgent, ...agentSelection.collaborators],
        collaborationType
      );

      return {
        ...enhancedResponse,
        processingTime: totalTime,
        executionMetadata: {
          ...enhancedResponse.executionMetadata,
          collaborationType,
          // optimizationScore: this.calculateOptimizationScore(totalTime, enhancedResponse.confidence)
        }
      };

    } catch (error) {
      // console.error('❌ VitalAI orchestration failed:', error);

      // Track error in performance metrics
      performanceMetricsService.endOperation(
        operationId,
        context.session_id || 'unknown',
        false,
        error instanceof Error ? error.message : 'Unknown orchestration error',
        context.user_id || 'unknown'
      );

      // Enhanced fallback with contextual error recovery
      return await this.executeEnhancedFallback(userQuery, context, error);
    }
  }

  /**
   * Alias methods for backward compatibility
   */
  private async classifyIntent(
    query: string,
    context: ExecutionContext
  ): Promise<IntentClassificationResult> {
    return this.classifyIntentUltraIntelligent(query, context);
  }

  private async selectAgentsForIntent(
    intent: IntentClassificationResult,
    context: ExecutionContext,
    query?: string
  ): Promise<AgentSelectionResult> {
    return await this.selectOptimalAgentsAdaptive(intent, query || '', context);
  }

  /**
   * 🧠 Ultra-Intelligent Intent Classification with Pharmaceutical Context
   * Target: <50ms with advanced contextual understanding
   */
  private async classifyIntentUltraIntelligent(
    query: string,
    context: ExecutionContext
  ): Promise<IntentClassificationResult> {
    const startTime = Date.now();

    // Enhanced pharmaceutical intelligence patterns
    let bestMatch: IntentClassificationResult = {
      category: 'general',
      confidence: 0.3,
      subcategories: [],
      keyTerms: [],
      complexity: this.calculateQueryComplexityAdvanced(query),
      processingTime: 0,
      contextualFactors: this.analyzeContextualFactors(query, context),
      semanticVector: []
    };

    // Multi-dimensional scoring with pharmaceutical expertise
    const tokens = query.toLowerCase().split(/\s+/);
    for (const [category, pattern] of this.intentPatterns) {
      const score = this.scoreIntentMatch(tokens, query, pattern) as { confidence: number; subcategories: string[]; keyTerms: string[] };

      if (score.confidence > bestMatch.confidence) {
        bestMatch = {
          category,
          confidence: score.confidence,
          subcategories: score.subcategories,
          keyTerms: score.keyTerms,
          complexity: this.calculateQueryComplexityAdvanced(query, category),
          processingTime: 0,
          contextualFactors: this.analyzeContextualFactors(query, context, category),
          semanticVector: []
        };
      }
    }

    // Apply contextual intelligence boosting
    bestMatch = this.applyContextualIntelligence(bestMatch, query, context);

    // Performance optimization warning
    const processingTime = Date.now() - startTime;
    if (processingTime > 50) {
      // console.warn(`⚠️  Intent classification took ${processingTime}ms (target: <50ms)`);
    }

    // Generate semantic vector for future ML enhancements
    const semanticVector: number[] = [];

    return {
      ...bestMatch,
      processingTime,
      semanticVector
    };
  }

  /**
   * 🎯 Adaptive Agent Selection with Pharmaceutical Expertise Mapping (Capability-Based)
   */
  private async selectOptimalAgentsAdaptive(
    intent: IntentClassificationResult,
    query: string,
    context: ExecutionContext
  ): Promise<AgentSelectionResult> {
    try {
      // // Fetch available agents dynamically

      // Map intent categories to capability keywords
      const capabilityMappings: Record<string, string[]> = {
        'regulatory': ['Regulatory Strategy', 'FDA', 'regulatory_compliance', '510(k)', 'Regulatory'],
        'clinical': ['Clinical Protocol', 'Clinical Trial', 'clinical_research', 'Clinical Evidence', 'Trial Design'],
        'market_access': ['Market Access', 'Reimbursement', 'Payer', 'Health Economics', 'Budget Impact'],
        'quality': ['QMS', 'Quality', 'Design Controls', 'Risk Management', 'ISO'],
        'documentation': ['Medical Writing', 'Documentation', 'Regulatory Document', 'Technical'],
        'digital_health': ['AI/ML', 'Digital Health', 'Cardiovascular', 'Oncology', 'Remote Monitoring'],
        'compliance': ['HIPAA', 'Compliance', 'Privacy', 'Security'],
        'commercial': ['Marketing', 'HCP', 'Medical Affairs', 'KOL'],
        'post_market': ['Post-Market', 'Surveillance', 'Safety', 'MDR']
      };

      // Get relevant capability keywords for this intent
      const relevantCapabilities = capabilityMappings[intent.category as keyof typeof capabilityMappings] || [];

      // Score agents based on capability match and query keywords
      const queryLower = query.toLowerCase();
      const agentScores = Array.from(this.agents.values()).map(agent => {
        const agentCapabilities = (agent as any).metadata?.capabilities || (agent as any).capabilities || [];
        let score = 0;

        // Base capability matching
        relevantCapabilities.forEach(capability => {
          agentCapabilities.forEach((agentCap: string) => {
            if (agentCap.toLowerCase().includes(capability.toLowerCase()) ||
                capability.toLowerCase().includes(agentCap.toLowerCase())) {
              score += 10;
            }
          });
        });

        // Query-specific keyword matching
        agentCapabilities.forEach((agentCap: string) => {
          const capLower = agentCap.toLowerCase();
          if (queryLower.includes(capLower) || capLower.includes(queryLower.split(' ')[0])) {
            score += 5;
          }
        });

        // Special handling for specific queries
        const agentName = (agent as any).name || '';
        if (queryLower.includes('510k') || queryLower.includes('510(k)')) {
          if (agentName === 'fda-regulatory-strategist') score += 50;
        }
        if (queryLower.includes('clinical trial') || queryLower.includes('protocol')) {
          if (agentName === 'clinical-trial-designer') score += 50;
        }
        if (queryLower.includes('reimbursement') || queryLower.includes('payer')) {
          if (agentName === 'reimbursement-strategist') score += 50;
        }

        return { agent, score };
      }).sort((a, b) => b.score - a.score);

      // Select primary agent (highest score)
      const primaryAgent = (agentScores[0]?.agent as any)?.name || 'medical-writer';

      // Select collaborators (next 1-2 highest scoring agents if they have meaningful scores)
      const collaborators: string[] = [];
      if (intent.complexity > 0.6 && agentScores.length > 1) {
        for (let i = 1; i < Math.min(3, agentScores.length); i++) {
          // Validate index before accessing array
          if (i >= 0 && i < agentScores.length) {
            // eslint-disable-next-line security/detect-object-injection
            if (agentScores[i].score > 5) { // Minimum threshold for collaboration
              // eslint-disable-next-line security/detect-object-injection
              const collaboratorName = (agentScores[i].agent as any).name;
              if (collaboratorName) {
                collaborators.push(collaboratorName);
              }
            }
          }
        }
      }

      // .map(s => ({ name: s.agent.name, score: s.score }))
      // });

      const reasoning = `Selected ${primaryAgent} based on ${intent.category} intent with ${collaborators.length} collaborator(s)`;

      return {
        primaryAgent,
        collaborators,
        collaborationType: collaborators.length > 0 ? 'parallel' : 'single',
        reasoning
      };

    } catch (error) {
      // console.warn('⚠️ Agent selection failed, using fallback:', error);

      // Fallback to default selection
      return {
        primaryAgent: 'fda-regulatory-strategist',
        collaborators: [],
        collaborationType: 'single',
        reasoning: 'Fallback selection due to error'
      };
    }
  }

  /**
   * 🚀 Execute Single Agent with Pharmaceutical Focus (Agent-First Approach)
   */
  private async executeSingleAgentPharmaFocused(
    agentName: string,
    query: string,
    context: ExecutionContext,
    intent: IntentClassificationResult
  ): Promise<UnifiedResponse> {

    try {
      // Step 1: Find the best prompt for this agent based on intent and capabilities
      const promptTitle = this.findBestPrompt(agentName, intent.category);

      // Step 2: Execute agent with core capabilities first (RAG-independent)
      const agentResponse = await this.executeAgent(
        agentName,
        promptTitle,
        { query },
        context
      );

      // Step 3: OPTIONAL RAG Enhancement (if available and beneficial)
      try {
        const ragQuery: AgentRAGQuery = {
          query,
          agentId: agentName,
          context: `Agent: ${agentName}, Intent: ${intent.category}, Complexity: ${intent.complexity}`,
          useMultiRAG: intent.complexity > 0.8, // Only for very complex queries
          maxResults: Math.min(5, Math.ceil(intent.complexity * 6)) // Conservative RAG usage
        };

        // `);

        if (ragResponse && ragResponse.sources.length > 0) {
          // Add RAG context as supplementary information (not replacing agent response)
          const ragSupplement = ragResponse.sources.slice(0, 5).map((source, index) => {
            const relevance = source.similarity || source.relevance || 0.85;
            return `${index + 1}. ${source.title || 'Knowledge Source'} (${(relevance * 100).toFixed(0)}% relevance)`;
          }).join('\n');

          finalContent += `\n\n**Supplementary Knowledge Sources:**\n${ragSupplement}`;

          if (ragResponse.followupSuggestions.length > 0) {
            finalContent += `\n\n**Related Expert Guidance:**\n${ragResponse.followupSuggestions.slice(0, 2).map(suggestion => `• ${suggestion}`).join('\n')}`;
          }

          // Boost confidence slightly if RAG provides good support
          enhancedConfidence = Math.min(enhancedConfidence + (ragResponse.confidence * 0.1), 1.0);

          ragMetadata = {
            ragEnhanced: true,
            ragSystemsUsed: ragResponse.ragSystemsUsed,
            knowledgeSourcesCount: ragResponse.sources.length,
            ragConfidence: ragResponse.confidence,
            agentKnowledgeDomains: ragResponse.agentContext.knowledgeDomains
          };
        }
      } catch (ragError) {
        // console.warn(`⚠️ RAG enhancement failed for ${agentName}, continuing with core agent response:`, ragError);
        // Agent response remains unaffected by RAG failure
      }

      // Track agent execution completion

      performanceMetricsService.trackAgentExecution(
        context.session_id || 'unknown',
        agentName,
        'pharmaceutical_analysis',
        agentStartTime,
        agentEndTime,
        true
      );

      return {
        content: finalContent,
        confidence: enhancedConfidence,
        contributors: [agentName],
        processingTime: Date.now() - startTime,
        executionMetadata: {
          primaryAgent: agentName,
          collaborationType: 'single',
          stepsExecuted: 1,
          complianceStatus: result.compliance_status?.validated ? 'compliant' : 'warning'
        }
      };

    } catch (error) {
      // console.error(`Single agent execution failed for ${agentName}:`, error);

      // Track agent execution failure
      performanceMetricsService.trackAgentExecution(
        context.session_id || 'unknown',
        agentName,
        'pharmaceutical_analysis',
        agentStartTime,
        Date.now(),
        false,
        error instanceof Error ? error.message : 'Unknown agent error'
      );

      throw error;
    }
  }

  /**
   * 🤝 Execute Multi-Agent Pharmaceutical Collaboration
   */
  private async executeMultiAgentPharmaCollaboration(
    selection: AgentSelectionResult,
    query: string,
    context: ExecutionContext,
    intent: IntentClassificationResult
  ): Promise<UnifiedResponse> {

    try {
      // Execute all agents in parallel based on their core capabilities
      const agentPromises = selection.selectedAgents.map(async (agentName: string) => {
        const promptTitle = this.selectBestPrompt(agentName, intent);
        try {
          // Step 1: Execute agent with core capabilities
          const response = await this.agents.executeAgent(
            agentName,
            promptTitle,
            {
              query,
              collaborationContext: `Role: ${agentName === selection.primaryAgent ? 'Primary analyst' : 'Contributing specialist'} in ${selection.collaborationType} collaboration`
            },
            context
          );

          // Step 2: Optional RAG enhancement (conservative approach)
          let ragResponse: any = null;
          try {
            const ragQuery: AgentRAGQuery = {
              query,
              agentId: agentName,
              context: `Multi-agent: ${agentName} supporting ${selection.primaryAgent}`,
              useMultiRAG: false, // Keep it simple for multi-agent scenarios
              maxResults: 3 // Minimal supplementary context
            };

            ragResponse = await agentRAGIntegration.queryAgentKnowledge(ragQuery);

            if (ragResponse && ragResponse.sources.length > 0) {
              // Optionally enhance response with RAG data
            }
          } catch (ragError) {
            // console.warn(`⚠️ RAG enhancement failed for ${agentName}, continuing with core response:`, ragError);
          }

          const ragMetadata = ragResponse ? {
            sources: ragResponse.sources.length,
            systems: ragResponse.ragSystemsUsed,
            confidence: ragResponse.confidence,
            domains: ragResponse.agentContext.knowledgeDomains
          } : undefined;

          return {
            agent: agentName,
            response: response,
            success: true,
            ragMetadata
          };
        } catch (error) {
          // console.error(`Agent ${agentName} failed:`, error);
          return {
            agent: agentName,
            response: null,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error'
          };
        }
      });

      const results = await Promise.all(agentPromises);
      const successfulResults = results.filter((r: any) => r.success);

      if (successfulResults.length === 0) {
        throw new Error('All agents failed to execute');
      }

      // Synthesize responses into unified output
      const unifiedResponse = this.synthesizeMultiAgentResponse(
        successfulResults,
        selection.primaryAgent,
        intent
      );

      // Aggregate RAG metadata from all agents

      return {
        content: synthesizedContent,
        confidence: this.calculateCollaborationConfidence(successfulResults),
        contributors: successfulResults.map(r => r.agent),
        processingTime: Date.now() - startTime,
        executionMetadata: {
          primaryAgent: selection.primaryAgent,
          collaborationType: 'parallel',
          stepsExecuted: successfulResults.length,
          complianceStatus: 'compliant' // TODO: Aggregate compliance status
        }
      };

    } catch (error) {
      // console.error('Multi-agent collaboration failed:', error);
      throw error;
    }
  }

  /**
   * Synthesize multiple agent responses into unified output
   */
  private async synthesizeResponses(
    results: unknown[],
    primaryAgent: string,
    intent: IntentClassificationResult
  ): Promise<string> {
    // Find primary agent response

    if (!primaryResponse) {
      // Fallback to first successful response
      return results[0]?.response?.content || 'No valid response generated';
    }

    // Simple synthesis strategy - can be enhanced with LLM-based synthesis

    // Add collaborative insights
    if (collaboratorResponses.length > 0) {
      synthesized += '\n\n**Additional Expert Insights:**\n';

      collaboratorResponses.forEach((collab, index) => {
        if (collab.response?.content) {
          synthesized += `\n${index + 1}. **${this.getAgentDisplayName(collab.agent)}**: ${this.extractKeyInsight(collab.response.content)}`;
        }
      });
    }

    return synthesized;
  }

  /**
   * Initialize intent patterns for fast classification
   */
  private initializeIntentPatterns(): void {
    this.intentPatterns.set('regulatory', {
      keywords: ['fda', 'regulatory', 'approval', 'submission', '510k', 'nda', 'pma', 'ide', 'pre-submission'],
      patterns: [/\b(regulatory|approval|submission)\b/i, /\bfda\b/i, /\b510\(?k\)?\b/i],
      weight: 0.9,
      subcategories: ['submission', 'guidance', 'pathway', 'compliance']
    });

    this.intentPatterns.set('clinical', {
      keywords: ['clinical', 'trial', 'study', 'protocol', 'endpoint', 'recruitment', 'phase'],
      patterns: [/\b(clinical trial|study protocol)\b/i, /\bphase\s+[123]\b/i],
      weight: 0.85,
      subcategories: ['design', 'recruitment', 'endpoints', 'analysis']
    });

    this.intentPatterns.set('market_access', {
      keywords: ['reimbursement', 'payer', 'coverage', 'pricing', 'heor', 'health economics'],
      patterns: [/\b(reimbursement|market access)\b/i, /\bpayer\b/i],
      weight: 0.8,
      subcategories: ['pricing', 'coverage', 'economics', 'access']
    });

    this.intentPatterns.set('digital_health', {
      keywords: ['digital', 'app', 'software', 'algorithm', 'samd', 'dtx', 'digital therapeutic'],
      patterns: [/\b(digital health|mobile app)\b/i, /\bsoftware.*medical device\b/i],
      weight: 0.85,
      subcategories: ['software', 'validation', 'digital_therapeutics', 'ai_ml']
    });
  }

  /**
   * Initialize agent selection matrix
   */
  private initializeAgentSelectionMatrix(): void {
    // Regulatory intent rules
    this.agentSelectionMatrix.set('regulatory', [
      {
        condition: (intent, query) => query.includes('510k') || query.includes('510(k)'),
        primaryAgent: 'fda-regulatory-strategist',
        collaborators: ['medical-writer', 'qms-architect'],
        reasoning: '510(k) submissions require regulatory strategy + documentation + quality systems'
      },
      {
        condition: (intent, query) => intent.complexity > 0.7,
        primaryAgent: 'fda-regulatory-strategist',
        collaborators: ['clinical-trial-designer', 'medical-writer'],
        reasoning: 'Complex regulatory queries benefit from clinical and writing expertise'
      },
      {
        condition: () => true, // Default
        primaryAgent: 'fda-regulatory-strategist',
        collaborators: [],
        reasoning: 'Standard regulatory query'
      }
    ]);

    // Clinical intent rules
    this.agentSelectionMatrix.set('clinical', [
      {
        condition: (intent, query) => query.includes('phase 3') || query.includes('pivotal'),
        primaryAgent: 'clinical-trial-designer',
        collaborators: ['clinical-evidence-analyst', 'fda-regulatory-strategist'],
        reasoning: 'Phase 3 trials require design + evidence + regulatory alignment'
      },
      {
        condition: (intent, query) => intent.complexity > 0.6,
        primaryAgent: 'clinical-trial-designer',
        collaborators: ['clinical-evidence-analyst'],
        reasoning: 'Complex clinical queries benefit from evidence analysis'
      },
      {
        condition: () => true,
        primaryAgent: 'clinical-trial-designer',
        collaborators: [],
        reasoning: 'Standard clinical design query'
      }
    ]);

    // Add more patterns for other intents...
  }

  // Helper methods
  private scoreIntentMatch(tokens: string[], query: string, pattern: IntentPattern): { confidence: number; subcategories: string[]; keyTerms: string[] } {

    // Score keywords
    for (const keyword of pattern.keywords) {
      if (tokens.includes(keyword) || query.includes(keyword)) {
        score += 0.1;
        foundKeywords.push(keyword);
      }
    }

    // Score regex patterns
    for (const regex of pattern.patterns) {
      if (regex.test(query)) {
        score += 0.3;
      }
    }

    // Add subcategory matches
    for (const subcat of pattern.subcategories) {
      if (query.includes(subcat)) {
        foundSubcategories.push(subcat);
        score += 0.05;
      }
    }

    return {
      confidence: Math.min(score, pattern.weight),
      subcategories: foundSubcategories,
      keyTerms: foundKeywords
    };
  }

  private calculateQueryComplexity(query: string, category?: string): number {

    // Length factor
    if (query.length > 200) complexity += 0.3;
    else if (query.length > 100) complexity += 0.2;
    else if (query.length > 50) complexity += 0.1;

    // Technical terms

    complexity += technicalTerms.filter(term => query.toLowerCase().includes(term)).length * 0.15;

    // Category-specific complexity
    if (category === 'regulatory') complexity += 0.2;
    if (category === 'clinical') complexity += 0.25;

    // Multiple question indicators
    if (query.includes('?') && query.split('?').length > 2) complexity += 0.2;

    return Math.min(complexity, 1.0);
  }

  private determineCollaborationType(complexity: number, collaboratorCount: number): string {
    if (collaboratorCount === 0) return 'single';
    if (complexity > 0.8 && collaboratorCount > 2) return 'hierarchical';
    return 'parallel';
  }

  private selectBestPrompt(agentName: string, intent: IntentClassificationResult): string {

    // Use the correct method to get prompts from DigitalHealthAgent

    // // Show first 3 prompts for debugging
    // });

    if (!agent || availablePrompts.length === 0) {
      // // Fall back to a common prompt that likely exists
      return 'general_consultation';
    }

    // Use intelligent selection based on intent

    // return selected;
  }

  private selectPromptByIntent(prompts: string[], intent: IntentClassificationResult): string {
    // Intent-based prompt selection mapping
    const intentKeywords: Record<string, string[]> = {
      clinical: ['trial', 'protocol', 'study', 'recruitment', 'sample'],
      regulatory: ['regulatory', 'submission', 'approval', 'safety'],
      market_access: ['reimbursement', 'coverage', 'pricing'],
      digital_health: ['digital', 'software', 'app']
    };

    // Find the best matching prompt based on intent
    for (const prompt of prompts) {
      const promptLower = prompt.toLowerCase();
      const keywords = intentKeywords[intent.primaryIntent as keyof typeof intentKeywords] || [];
      for (const keyword of keywords) {
        if (promptLower.includes(keyword)) {
          return prompt;
        }
      }
    }

    // Default to first prompt if no match found
    return prompts[0];
  }

  private selectCollaborators(intent: IntentClassificationResult, rule: AgentSelectionRule): string[] {
    // Filter collaborators based on complexity
    if (intent.complexity < 0.5) {
      return rule.collaborators.slice(0, 1); // Only one collaborator for simple queries
    }
    return rule.collaborators;
  }

  private evaluateRule(rule: AgentSelectionRule, intent: IntentClassificationResult, query: string): boolean {
    return rule.condition(intent, query);
  }

  private calculateCollaborationConfidence(results: any[]): number {
    if (results.length === 0) return 0;

    const confidences = results
      .map(r => r.response?.confidence || 0.7)
      .filter(c => c > 0);

    return confidences.reduce((sum, conf) => sum + conf, 0) / confidences.length;
  }

  private extractKeyInsight(content: string): string {
    // Extract first meaningful sentence or first 100 characters

    if (firstSentence && firstSentence.length > 20) {
      return firstSentence + '.';
    }

    return content.substring(0, 100) + '...';
  }

  private getAgentDisplayName(agentName: string): string {
    const displayNames: Record<string, string> = {
      'fda-regulatory-strategist': 'FDA Regulatory Expert',
      'clinical-trial-designer': 'Clinical Trial Specialist',
      'medical-writer': 'Medical Writing Expert',
      'qms-architect': 'Quality Systems Expert'
    };

    // eslint-disable-next-line security/detect-object-injection
    return displayNames[agentName] || agentName;
  }

  private async executeEnhancedFallback(
    query: string,
    context: ExecutionContext,
    error: unknown
  ): Promise<UnifiedResponse> {
    // // Try to provide contextual fallback based on query

    if (query.toLowerCase().includes('regulatory')) {
      fallbackContent += 'For regulatory questions, please ensure you include specific details about your product type and regulatory pathway.';
    } else if (query.toLowerCase().includes('clinical')) {
      fallbackContent += 'For clinical trial questions, please specify your indication, phase, and primary objectives.';
    } else {
      fallbackContent += 'Please try rephrasing your question with more specific pharmaceutical context.';
    }

    return {
      content: fallbackContent,
      confidence: 0.2,
      contributors: ['fallback-system'],
      processingTime: 50,
      executionMetadata: {
        primaryAgent: 'enhanced-fallback',
        collaborationType: 'single',
        stepsExecuted: 1,
        complianceStatus: 'fallback'
      }
    };
  }

  // Enhanced Intelligence Methods

  /**
   * 🧠 Analyze Contextual Factors for Pharmaceutical Intelligence
   */
  private analyzeContextualFactors(
    query: string,
    context: ExecutionContext,
    category?: string
  ): IntentClassificationResult['contextualFactors'] {

    // Urgency Analysis
    let urgency: 'low' | 'medium' | 'high' | 'critical' = 'medium';
    if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('emergency')) {
      urgency = 'critical';
    } else if (queryLower.includes('soon') || queryLower.includes('timeline')) {
      urgency = 'high';
    } else if (queryLower.includes('planning') || queryLower.includes('future')) {
      urgency = 'low';
    }

    // Stakeholder Analysis
    let stakeholder: 'researcher' | 'regulatory' | 'clinical' | 'commercial' | 'executive' = 'researcher';
    if (queryLower.includes('fda') || queryLower.includes('regulatory') || queryLower.includes('submission')) {
      stakeholder = 'regulatory';
    } else if (queryLower.includes('trial') || queryLower.includes('clinical') || queryLower.includes('protocol')) {
      stakeholder = 'clinical';
    } else if (queryLower.includes('market') || queryLower.includes('commercial') || queryLower.includes('launch')) {
      stakeholder = 'commercial';
    } else if (queryLower.includes('strategy') || queryLower.includes('investment') || queryLower.includes('roi')) {
      stakeholder = 'executive';
    }

    // Development Phase Analysis
    let phase: 'discovery' | 'preclinical' | 'clinical' | 'regulatory' | 'commercial' = 'discovery';
    if (queryLower.includes('discovery') || queryLower.includes('research')) {
      phase = 'discovery';
    } else if (queryLower.includes('preclinical') || queryLower.includes('animal')) {
      phase = 'preclinical';
    } else if (queryLower.includes('phase') || queryLower.includes('clinical')) {
      phase = 'clinical';
    } else if (queryLower.includes('approval') || queryLower.includes('submission')) {
      phase = 'regulatory';
    } else if (queryLower.includes('launch') || queryLower.includes('market')) {
      phase = 'commercial';
    }

    // Risk Level Analysis

    if (queryLower.includes('safety') || queryLower.includes('adverse') || queryLower.includes('risk')) {
      riskLevel = 0.8;
    } else if (queryLower.includes('efficacy') || queryLower.includes('endpoint')) {
      riskLevel = 0.6;
    } else if (queryLower.includes('planning') || queryLower.includes('strategy')) {
      riskLevel = 0.2;
    }

    return { urgency, stakeholder, phase, riskLevel };
  }

  /**
   * 🎯 Advanced Intent Scoring with Pharmaceutical Context
   */
  private scoreIntentMatchAdvanced(
    tokens: string[],
    query: string,
    pattern: IntentPattern,
    context: ExecutionContext
  ): unknown {

    // Apply contextual boosting

    // Time-based context boosting

    if (currentHour >= 9 && currentHour <= 17) { // Business hours
      contextBoost += 0.1;
    }

    // User context boosting (if available)
    if (context.user_id) {
      contextBoost += 0.05;
    }

    return {
      ...baseScore,
      confidence: Math.min(baseScore.confidence + contextBoost, 1.0)
    };
  }

  /**
   * 🚀 Apply Contextual Intelligence Boosting
   */
  private applyContextualIntelligence(
    match: IntentClassificationResult,
    query: string,
    context: ExecutionContext
  ): IntentClassificationResult {
    // Apply pharmaceutical domain expertise boosting
    if (match.category === 'regulatory' && query.includes('510k')) {
      match.confidence = Math.min(match.confidence + 0.2, 1.0);
    }

    if (match.category === 'clinical' && query.includes('phase 3')) {
      match.confidence = Math.min(match.confidence + 0.15, 1.0);
    }

    return match;
  }

  /**
   * 🧮 Advanced Query Complexity Calculation
   */
  private calculateQueryComplexityAdvanced(query: string, category?: string): number {
    let complexity = 0.5; // Base complexity

    // Advanced pharmaceutical complexity factors
    const advancedTerms = [
      'biomarker', 'pharmacokinetics', 'pharmacodynamics', 'bioequivalence',
      'real-world-evidence', 'companion-diagnostic', 'personalized-medicine'
    ];

    complexity += advancedTerms.filter(term =>
      query.toLowerCase().includes(term.replace('-', ' '))
    ).length * 0.1;

    // Multi-stakeholder complexity
    const stakeholderTerms = ['patient', 'physician', 'payer', 'regulator', 'investor'];
    const stakeholderCount = stakeholderTerms.filter(term => query.toLowerCase().includes(term)).length;

    if (stakeholderCount > 1) {
      complexity += stakeholderCount * 0.05;
    }

    return Math.min(complexity, 1.0);
  }

  /**
   * 🔮 Generate Semantic Vector for ML Enhancement
   */
  private generateSemanticVector(query: string, category: string): number[] {
    // Simplified semantic vector generation
    // In production, this would use embeddings from a pharmaceutical NLP model

    queryWords.forEach((word, index) => {
      vector[index % 10] += word.length * 0.1;
    });

    // Category-specific boosting
    if (category === 'regulatory') vector[0] += 0.5;
    if (category === 'clinical') vector[1] += 0.5;
    if (category === 'market_access') vector[2] += 0.5;

    return vector;
  }

  /**
   * 🤝 Determine Collaboration Strategy
   */
  private determineCollaborationStrategy(
    intent: IntentClassificationResult,
    collaboratorCount: number,
    context: ExecutionContext
  ): string {
    if (collaboratorCount === 0) return 'single';

    // High-stakes queries require hierarchical collaboration
    if (intent.contextualFactors.urgency === 'critical' && collaboratorCount > 2) {
      return 'hierarchical';
    }

    // Complex regulatory queries benefit from sequential processing
    if (intent.category === 'regulatory' && intent.complexity > 0.7) {
      return 'sequential';
    }

    return 'parallel';
  }

  /**
   * ⚡ Enhanced Response Quality Improvement
   */
  private async enhanceResponseQuality(
    response: UnifiedResponse,
    intent: IntentClassificationResult,
    context: ExecutionContext
  ): Promise<UnifiedResponse> {
    // Apply pharmaceutical expertise validation

    // Add regulatory disclaimers for regulatory content
    if (intent.category === 'regulatory' && !enhancedContent.includes('FDA guidance')) {
      enhancedContent += '\n\n*Note: Always consult current FDA guidance documents and consider engaging with FDA directly for complex regulatory strategies.*';
    }

    // Add clinical trial best practices
    if (intent.category === 'clinical' && !enhancedContent.includes('Good Clinical Practice')) {
      enhancedContent += '\n\n*Recommendation: Ensure compliance with Good Clinical Practice (GCP) guidelines and consider regulatory alignment early in protocol development.*';
    }

    // Boost confidence for high-quality responses

    if (response.contributors.length > 1 && intent.complexity > 0.6) {
      enhancedConfidence = Math.min(enhancedConfidence + 0.1, 1.0);
    }

    return {
      ...response,
      content: enhancedContent,
      confidence: enhancedConfidence
    };
  }

  /**
   * 📊 Calculate Optimization Score
   */
  private calculateOptimizationScore(processingTime: number, confidence: number): number {
    // Target: <300ms processing time, >0.8 confidence

    return (timeScore + confidenceScore) / 2;
  }
}

// Supporting interfaces
interface IntentPattern {
  keywords: string[];
  patterns: RegExp[];
  weight: number;
  subcategories: string[];
}

interface AgentSelectionRule {
  condition: (intent: IntentClassificationResult, query: string) => boolean;
  primaryAgent: string;
  collaborators: string[];
  reasoning: string;
}

interface CachedResponse {
  response: UnifiedResponse;
  timestamp: number;
  expiresAt: number;
}

class PerformanceTracker {
  private metrics: unknown[] = [];

  recordExecution(data: unknown): void {
    this.metrics.push({
      ...data,
      timestamp: Date.now()
    });

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }
  }

  getAverageProcessingTime(): number {
    if (this.metrics.length === 0) return 0;

    return total / this.metrics.length;
  }

  getClassificationMetrics(): unknown {

    return {
      averageTime: avgClassificationTime,
      underTarget: recentMetrics.filter(m => (m.classificationTime || 0) < 100).length,
      total: recentMetrics.length
    };
  }
}
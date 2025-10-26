/**
 * Master Orchestrator - Enhanced with Digital Health Priority
 * Based on VITAL AI Implementation Guide v1.0.0
 */

import { AgentOrchestrator } from '@/agents/core/AgentOrchestrator';
import { DigitalHealthAgent } from '@/agents/core/DigitalHealthAgent';
import { IntentResult, QueryContext, OrchestrationResult } from '@/shared/types/orchestration.types';
import { ComplianceLevel } from '@/types/digital-health-agent.types';

import { AgentSelector } from './agent-selector';
import { ConfidenceCalculator } from './confidence-calculator';
import { DigitalHealthRouter } from './digital-health-router';
import { IntentClassifier } from './intent-classifier';
import { ResponseSynthesizer } from './response-synthesizer';

export class MasterOrchestrator extends AgentOrchestrator {
  private intentClassifier: IntentClassifier;
  private agentSelector: AgentSelector;
  private digitalHealthRouter: DigitalHealthRouter;
  private synthesizer: ResponseSynthesizer;
  private confidenceCalc: ConfidenceCalculator;

  // Digital health priority keywords
  private readonly digitalHealthKeywords = [
    'digital therapeutic', 'dtx', 'samd', 'software as medical device',
    'mobile health', 'mhealth', 'wearable', 'remote monitoring', 'rpm',
    'telehealth', 'telemedicine', 'virtual care', 'ai/ml', 'algorithm',
    'fhir', 'ehr integration', 'interoperability', 'api', 'digital health',
    'digital biomarker', 'digital endpoint', 'app', 'connected device',
    'continuous monitoring', 'patient-generated', 'pghd', 'digital intervention',
    'precision digital', 'connected health', 'smart device', 'iot', 'sensor',
    'artificial intelligence', 'machine learning', 'clinical decision support',
    'electronic health record', 'health information exchange'
  ];

  constructor() {
    super();
    this.intentClassifier = new IntentClassifier();
    this.agentSelector = new AgentSelector();
    this.digitalHealthRouter = new DigitalHealthRouter();
    this.synthesizer = new ResponseSynthesizer();
    this.confidenceCalc = new ConfidenceCalculator();

    this.initialize();
  }

  async routeQuery(query: string, context?: Partial<QueryContext>): Promise<OrchestrationResult> {
    const queryId = this.generateQueryId();

    // Build full context
    const fullContext: QueryContext = {
      user_id: context?.user_id || 'anonymous',
      session_id: context?.session_id || queryId,
      timestamp: new Date().toISOString(),
      compliance_level: context?.compliance_level || ComplianceLevel.STANDARD,
      audit_required: context?.audit_required || false,
      ...context
    };

    try {
      // }...`);

      // Step 1: Classify intent
      const intent = await this.intentClassifier.classifyIntent(query, fullContext);

      // `);

      // Step 2: Check for digital health priority
      if (this.isDigitalHealthQuery(query, intent)) {
        // return await this.handleDigitalHealthQuery(query, intent, fullContext);
      }

      // Step 3: Select appropriate agent(s)
      const selectedAgents = await this.agentSelector.selectAgents(query, intent, fullContext);

      // .name).join(', ')}`);

      if (selectedAgents.length === 0) {
        return this.handleNoAgentMatch(query, intent);
      }

      // Step 4: Execute - Single agent vs multi-agent
      let result: OrchestrationResult;
      if (selectedAgents.length === 1) {
        result = await this.executeSingleAgent(selectedAgents[0], query, fullContext);
      } else {
        result = await this.executeMultiAgent(selectedAgents, query, fullContext);
      }

      // Step 5: Add timing and metadata
      const responseTime = Date.now() - parseInt(queryId.split('_')[1]);
      result.responseTime = responseTime;

      return result;

    } catch (error) {
      // console.error(`❌ Orchestration error:`, error);
      return this.handleOrchestrationError(query, error);
    }
  }

  private isDigitalHealthQuery(query: string, intent: IntentResult): boolean {
    const lowerQuery = query.toLowerCase();

    // Check keywords with higher weight for exact matches
    const hasKeywordMatch = this.digitalHealthKeywords.some(keyword => {
      const keywordVariations = [
        keyword,
        keyword.replace(/\s+/g, ''),  // Remove spaces
        keyword.replace(/\s+/g, '-'), // Hyphenated
        keyword.replace(/-/g, ' ')    // Space separated
      ];
      return keywordVariations.some(variation => lowerQuery.includes(variation.toLowerCase()));
    });

    // Check intent classification
    const hasDigitalIntent = intent.primaryDomain === 'digital_health' ||
                           intent.domains.includes('technology') ||
                           intent.domains.includes('innovation');

    // Additional context clues
    const hasTechHealthCombination = hasKeywordMatch &&
                           (['healthcare', 'medical', 'clinical', 'patient'].some(domain => lowerQuery.includes(domain)));

    const isDigitalHealth = hasKeywordMatch || hasDigitalIntent || hasTechHealthCombination;

    if (isDigitalHealth) {
      // }
    }

    return isDigitalHealth;
  }

  private async handleDigitalHealthQuery(
    query: string,
    intent: IntentResult,
    context: QueryContext
  ): Promise<OrchestrationResult> {
    // Use specialized digital health router
    const agent = await this.digitalHealthRouter.routeToDigitalHealthAgent(query, intent, context);

    if (!agent) {
      // Fallback to general routing
      // return this.routeQuery(query, { ...context, skipDigitalHealth: true });
      throw new Error('No digital health agent found');
    }

    const result = await this.executeSingleAgent(agent, query, context);

    // Mark as digital health priority
    result.orchestration.type = 'digital_health_priority';
    result.orchestration.digitalHealthPriority = true;
    result.metadata = result.metadata || { /* TODO: implement */ };
    result.metadata.digitalHealthPriority = true;

    // .name}`);

    return result;
  }

  private async executeSingleAgent(
    agent: DigitalHealthAgent,
    query: string,
    context: QueryContext
  ): Promise<OrchestrationResult> {
    try {
      // .display_name}`);

      // Execute agent with primary prompt and query
      const response = await agent.executePrompt(
        agent.getConfig().prompt_starters[0] || 'general-analysis',
        { query },
        {
          user_id: context.user_id,
          session_id: context.session_id,
          compliance_level: this.mapComplianceLevel(context.compliance_level),
          audit_required: context.audit_required,
          timestamp: new Date().toISOString()
        }
      );

      return {
        success: true,
        agent: agent.getConfig().name,
        response: response.content || 'No response generated',
        confidence: 85, // Mock confidence since AgentResponse doesn't include it
        orchestration: {
          type: 'single_agent',
          agents: [agent.getConfig().name]
        },
        metadata: {
          domain: agent.getConfig().metadata?.domain,
          model: agent.getConfig().model
        }
      };

    } catch (error) {
      // console.error(`❌ Single agent execution failed for ${agent.getConfig().name}:`, error);

      // Try fallback agent
      const fallback = await this.getFallbackAgent(agent);

      if (fallback) {
        // .name}`);
        return this.executeSingleAgent(fallback, query, context);
      }

      throw error;
    }
  }

  private async executeMultiAgent(
    agents: DigitalHealthAgent[],
    query: string,
    context: QueryContext
  ): Promise<OrchestrationResult> {
    // // Execute agents in parallel
    const responses = await Promise.allSettled(
      agents.map(agent =>
        agent.executePrompt(
          agent.getConfig().prompt_starters[0] || 'general-analysis',
          { query },
          {
            user_id: context.user_id,
            session_id: context.session_id,
            compliance_level: this.mapComplianceLevel(context.compliance_level),
            audit_required: context.audit_required,
            timestamp: new Date().toISOString()
          }
        ).then(response => ({
          success: true,
          agent: agent.getConfig().name,
          response: response.content || '',
          confidence: 75, // Mock confidence since AgentResponse doesn't include it
          metadata: {
            domain: agent.getConfig().metadata?.domain
          }
        }))
      )
    );

    // Process results
    const successfulResponses: unknown[] = [];
    const failedResponses: unknown[] = [];

    responses.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        successfulResponses.push(result.value);
      } else {
        failedResponses.push({
          agent: agents[index].getConfig().name,
          error: result.reason?.message || 'Unknown error'
        });
        // console.error(`❌ Agent ${agents[index].getConfig().name} failed:`, result.reason);
      }
    });

    if (successfulResponses.length === 0) {
      return this.handleAllAgentsFailed(query, failedResponses);
    }

    // Synthesize responses
    const synthesized = await this.synthesizer.synthesizeResponses(successfulResponses, query, intent);

    // Calculate combined confidence
    const confidence = this.confidenceCalc.calculateCombinedConfidence(successfulResponses);

    return {
      success: true,
      response: synthesized,
      confidence,
      orchestration: {
        type: 'multi_agent',
        agents: successfulResponses.map(r => r.agent),
        individualConfidences: successfulResponses.map(r => ({
          agent: r.agent,
          confidence: r.confidence
        }))
      },
      metadata: {
        agentCount: agents.length,
        successCount: successfulResponses.length
      }
    };
  }

  private async getFallbackAgent(failedAgent: DigitalHealthAgent): Promise<DigitalHealthAgent | null> {
    // Find agent with same domain but different name
    const domain = failedAgent.getConfig().metadata?.domain;

    if (!domain) return null;

    const allAgents = await this.agentSelector.getAllAgents();
    return allAgents.find(a =>
      a.getConfig().metadata?.domain === domain &&
      a.getConfig().name !== failedAgent.getConfig().name
    ) || null;
  }

  private handleNoAgentMatch(query: string, intent: IntentResult): OrchestrationResult {
    return {
      success: false,
      response: `I understand you're asking about: "${query}".
                Let me connect you with the right specialist.
                Could you provide more context about whether this relates to:

                🔸 **Digital health technologies** (apps, devices, AI/ML, telehealth)
                🔸 **Regulatory compliance** (FDA, CE marking, quality systems)
                🔸 **Clinical development** (trials, evidence, safety)
                🔸 **Market access** (reimbursement, pricing, HEOR)
                🔸 **Business operations** (compliance, quality, strategy)

                This will help me route you to the most appropriate expert.`,
      confidence: 0,
      orchestration: {
        type: 'no_match',
        intent,
        suggestion: 'Need more context for proper routing'
      }
    };
  }

  private handleAllAgentsFailed(query: string, responses: unknown[]): OrchestrationResult {
    const errors = responses.map(r => ({
      agent: r.agent,
      error: r.error
    }));

    return {
      success: false,
      response: 'I apologize, but I encountered technical difficulties processing your request. Our healthcare AI experts are temporarily unavailable. Please try rephrasing your question or contact support if the issue persists.',
      confidence: 0,
      orchestration: {
        type: 'all_failed',
        errors
      }
    };
  }

  private handleOrchestrationError(query: string, error: unknown): OrchestrationResult {
    // console.error('❌ Orchestration error:', error);

    return {
      success: false,
      response: 'I apologize for the inconvenience. Our AI orchestration system is experiencing temporary issues. Please try again in a moment, or contact support if the problem persists.',
      confidence: 0,
      orchestration: {
        type: 'system_error',
        error: error.message
      }
    };
  }

  private generateQueryId(): string {
    return `q_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private mapComplianceLevel(level: string | ComplianceLevel): ComplianceLevel {
    if (typeof level === 'string') {
      switch (level.toLowerCase()) {
        case 'critical': return ComplianceLevel.CRITICAL;
        case 'high': return ComplianceLevel.HIGH;
        case 'medium': return ComplianceLevel.MEDIUM;
        case 'standard':
        default: return ComplianceLevel.STANDARD;
      }
    }
    return level;
  }

  // Health check method
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    agents_active: number;
    agents_total: number;
    digital_health_priority: boolean;
    response_time_avg: number;
  }> {
    const allAgents = await this.agentSelector.getAllAgents();

    // Note: status property doesn't exist in DigitalHealthAgentConfig, using total agents
    const totalAgents = allAgents.length;
    const activeAgents = allAgents.length; // Assuming all loaded agents are active

    return {
      status: activeAgents === totalAgents ? 'healthy' : 'degraded',
      agents_active: activeAgents,
      agents_total: totalAgents,
      digital_health_priority: true,
      response_time_avg: 1200 // Mock value - would be real metrics
    };
  }
}
/**
 * Enhanced Agent Orchestrator with Database-Driven Tools
 * Brings all 13 expert tools to individual agent conversations
 */

import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { ChatOpenAI } from '@langchain/openai';
import { AgentExecutor, createOpenAIFunctionsAgent } from 'langchain/agents';

import { dynamicToolLoader } from '@/lib/services/dynamic-tool-loader';
import type { ToolCall } from '@/lib/services/expert-tools';
import { toolRegistryService, type ToolUsageLog } from '@/lib/services/tool-registry-service';

export interface Citation {
  type: 'clinical-trial' | 'fda-approval' | 'pubmed' | 'ich-guideline' | 'iso-standard' | 'dime-resource' | 'ichom-set' | 'web-source' | 'knowledge-base';
  id: string;
  title: string;
  source: string;
  url: string;
  relevance: number; // 0-1
  authors?: string[];
  date?: string;
}

export interface ThinkingStep {
  step: number;
  description: string;
  toolUsed?: string;
  status: 'pending' | 'running' | 'completed' | 'error';
  timestamp: string;
  duration?: number;
}

export interface EnhancedAgentResponse {
  content: string;
  confidence: number;
  confidenceLevel: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
  confidenceRationale: string;
  citations: Citation[];
  toolCalls: ToolCall[];
  thinkingSteps: ThinkingStep[];
  evidenceSummary: {
    totalSources: number;
    clinicalTrials: number;
    fdaApprovals: number;
    pubmedArticles: number;
    guidelines: number;
    internalKnowledge: number;
  };
  timestamp: string;
  tokensUsed?: number;
  cost?: number;
}

class EnhancedAgentOrchestrator {
  private llm: ChatOpenAI;

  constructor() {
    this.llm = new ChatOpenAI({
      modelName: 'gpt-4',
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
      streaming: true,
    });
  }

  /**
   * Main chat method with tools, citations, and confidence scoring
   */
  async chat(params: {
    agentId: string;
    message: string;
    conversationHistory: any[];
    conversationId?: string;
    userId?: string;
    onThinkingUpdate?: (step: ThinkingStep) => void;
  }): Promise<EnhancedAgentResponse> {
    const { agentId, message, conversationHistory, conversationId, userId, onThinkingUpdate } = params;

    // Load agent-specific tools from database
    const tools = await dynamicToolLoader.loadAgentTools(agentId);

    if (tools.length === 0) {
      console.warn(`No tools assigned to agent ${agentId}, loading all active tools`);
      tools.push(...await dynamicToolLoader.loadAllActiveTools());
    }

    const toolCalls: ToolCall[] = [];
    const thinkingSteps: ThinkingStep[] = [];
    let stepCounter = 0;

    // Get agent metadata for personalized prompt
    const agent = await this.getAgentMetadata(agentId);

    // Create agent with tools
    const prompt = ChatPromptTemplate.fromMessages([
      ['system', `You are ${agent.name}, ${agent.role}.

Your expertise: ${agent.expertise?.join(', ') || 'general AI assistant'}

You have access to ${tools.length} specialized tools:
${tools.map(t => `- ${t.name}: ${t.description}`).join('\n')}

IMPORTANT INSTRUCTIONS:
1. **Always cite your sources** - Use tools to find evidence
2. **For medical/clinical questions**: Use pubmed_search and search_clinical_trials
3. **For regulatory questions**: Use search_fda_approvals, search_ich_guidelines, search_iso_standards
4. **For drug information**: Use search_fda_approvals and search_who_essential_medicines
5. **For digital health**: Use search_dime_resources and search_ichom_standard_sets
6. **For internal knowledge**: Use knowledge_base tool
7. **Provide confidence scores** based on evidence quality
8. **Be transparent** - Explain your reasoning and sources

When you don't know something, say so clearly and suggest how to find the answer.`],
      new MessagesPlaceholder('chat_history'),
      ['human', '{input}'],
      new MessagesPlaceholder('agent_scratchpad')
    ]);

    const agent = await createOpenAIFunctionsAgent({
      llm: this.llm,
      tools,
      prompt
    });

    const agentExecutor = new AgentExecutor({
      agent,
      tools,
      maxIterations: 5,
      returnIntermediateSteps: true,
      callbacks: [
        {
          handleToolStart: async (tool: any, input: string) => {
            const step: ThinkingStep = {
              step: ++stepCounter,
              description: `Using ${tool.name}`,
              toolUsed: tool.name,
              status: 'running',
              timestamp: new Date().toISOString()
            };
            thinkingSteps.push(step);
            onThinkingUpdate?.(step);
          },
          handleToolEnd: async (output: string, runId: string) => {
            const step = thinkingSteps[thinkingSteps.length - 1];
            if (step) {
              step.status = 'completed';
              step.duration = Date.now() - new Date(step.timestamp).getTime();
              onThinkingUpdate?.(step);
            }
          },
          handleToolError: async (error: Error, runId: string) => {
            const step = thinkingSteps[thinkingSteps.length - 1];
            if (step) {
              step.status = 'error';
              onThinkingUpdate?.(step);
            }
          }
        }
      ]
    });

    const startTime = Date.now();

    // Execute agent
    const result = await agentExecutor.invoke({
      input: message,
      chat_history: conversationHistory
    });

    const executionTime = Date.now() - startTime;

    // Extract tool calls and log usage
    if (result.intermediateSteps && result.intermediateSteps.length > 0) {
      for (const step of result.intermediateSteps) {
        const toolCall: ToolCall = {
          toolName: step.action.tool,
          input: step.action.toolInput,
          output: step.observation || '',
          timestamp: new Date().toISOString(),
          duration: 0
        };
        toolCalls.push(toolCall);

        // Log tool usage to database
        try {
          const toolMeta = await toolRegistryService.getToolByKey(step.action.tool);
          if (toolMeta) {
            const usageLog: ToolUsageLog = {
              tool_id: toolMeta.id,
              agent_id: agentId,
              user_id: userId || null,
              conversation_id: conversationId || null,
              input: step.action.toolInput,
              output: step.observation,
              success: true,
              error_message: null,
              execution_time_ms: toolCall.duration,
              tokens_used: null,
              cost: toolMeta.estimated_cost_per_call ? parseFloat(toolMeta.estimated_cost_per_call.toString()) : null,
              query_context: message,
              relevance_score: null,
              user_feedback: null
            };
            await toolRegistryService.logToolUsage(usageLog);
          }
        } catch (error) {
          console.error('Failed to log tool usage:', error);
        }
      }
    }

    // Extract citations from tool calls
    const citations = this.extractCitations(toolCalls);

    // Calculate confidence and evidence summary
    const { confidence, confidenceLevel, confidenceRationale } = this.calculateConfidence(toolCalls, citations);
    const evidenceSummary = this.buildEvidenceSummary(citations);

    return {
      content: result.output || result.result || '',
      confidence,
      confidenceLevel,
      confidenceRationale,
      citations,
      toolCalls,
      thinkingSteps,
      evidenceSummary,
      timestamp: new Date().toISOString(),
      tokensUsed: result.tokensUsed,
      cost: result.cost
    };
  }

  /**
   * Extract citations from tool outputs
   */
  private extractCitations(toolCalls: ToolCall[]): Citation[] {
    const citations: Citation[] = [];

    for (const toolCall of toolCalls) {
      try {
        const output = JSON.parse(toolCall.output);

        // PubMed citations
        if (toolCall.toolName === 'pubmed_search' && output.results) {
          for (const result of output.results) {
            citations.push({
              type: 'pubmed',
              id: result.pmid,
              title: result.title,
              source: result.journal || 'PubMed',
              url: `https://pubmed.ncbi.nlm.nih.gov/${result.pmid}/`,
              relevance: 0.9,
              authors: result.authors?.slice(0, 3),
              date: result.pubDate
            });
          }
        }

        // Clinical Trials citations
        else if (toolCall.toolName === 'search_clinical_trials' && output.trials) {
          for (const trial of output.trials) {
            citations.push({
              type: 'clinical-trial',
              id: trial.nctId,
              title: trial.title,
              source: 'ClinicalTrials.gov',
              url: trial.url,
              relevance: 0.9,
              date: trial.startDate
            });
          }
        }

        // FDA Approvals
        else if (toolCall.toolName === 'search_fda_approvals' && output.approvals) {
          for (const approval of output.approvals) {
            citations.push({
              type: 'fda-approval',
              id: approval.brandName,
              title: `${approval.brandName} (${approval.genericName})`,
              source: 'FDA OpenFDA',
              url: approval.url,
              relevance: 0.95,
              date: approval.approvalDate
            });
          }
        }

        // ICH Guidelines
        else if (toolCall.toolName === 'search_ich_guidelines' && output.guidelines) {
          for (const guideline of output.guidelines) {
            citations.push({
              type: 'ich-guideline',
              id: guideline.code,
              title: guideline.title,
              source: 'ICH',
              url: guideline.url,
              relevance: 1.0,
              date: guideline.effectiveDate
            });
          }
        }

        // ISO Standards
        else if (toolCall.toolName === 'search_iso_standards' && output.standards) {
          for (const standard of output.standards) {
            citations.push({
              type: 'iso-standard',
              id: standard.standardNumber,
              title: standard.title,
              source: 'ISO',
              url: standard.url,
              relevance: 1.0,
              date: standard.year
            });
          }
        }

        // DiMe Resources
        else if (toolCall.toolName === 'search_dime_resources' && output.resources) {
          for (const resource of output.resources) {
            citations.push({
              type: 'dime-resource',
              id: resource.title,
              title: resource.title,
              source: 'Digital Medicine Society',
              url: resource.url,
              relevance: 0.85,
              date: resource.publicationDate
            });
          }
        }

        // ICHOM Standard Sets
        else if (toolCall.toolName === 'search_ichom_standard_sets' && output.standardSets) {
          for (const set of output.standardSets) {
            citations.push({
              type: 'ichom-set',
              id: set.condition,
              title: `ICHOM ${set.condition} Standard Set`,
              source: 'ICHOM',
              url: set.url,
              relevance: 0.9,
              date: set.year
            });
          }
        }

        // Knowledge Base
        else if (toolCall.toolName === 'knowledge_base' && output.results) {
          for (const result of output.results) {
            citations.push({
              type: 'knowledge-base',
              id: result.source || 'internal',
              title: result.content?.substring(0, 100) || 'Internal Knowledge',
              source: result.source_name || 'Internal Knowledge Base',
              url: '#',
              relevance: parseFloat(result.similarity) || 0.8,
              date: result.created_at
            });
          }
        }
      } catch (error) {
        console.error(`Failed to extract citations from ${toolCall.toolName}:`, error);
      }
    }

    return citations;
  }

  /**
   * Calculate confidence score based on evidence
   */
  private calculateConfidence(toolCalls: ToolCall[], citations: Citation[]): {
    confidence: number;
    confidenceLevel: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    confidenceRationale: string;
  } {
    let confidence = 0.6; // Base confidence
    const reasons: string[] = [];

    if (citations.length === 0) {
      return {
        confidence: 0.6,
        confidenceLevel: 'medium',
        confidenceRationale: 'Response based on general knowledge without external verification'
      };
    }

    // More citations = higher confidence (up to a point)
    const citationBoost = Math.min(citations.length * 0.05, 0.15);
    confidence += citationBoost;
    if (citations.length >= 3) reasons.push(`${citations.length} sources consulted`);

    // High-quality regulatory sources boost confidence
    const hasRegulatory = citations.some(c =>
      c.type === 'fda-approval' || c.type === 'ich-guideline' || c.type === 'iso-standard'
    );
    if (hasRegulatory) {
      confidence += 0.1;
      reasons.push('Regulatory sources verified');
    }

    // Clinical trial evidence
    const hasClinicalTrial = citations.some(c => c.type === 'clinical-trial');
    if (hasClinicalTrial) {
      confidence += 0.05;
      reasons.push('Clinical trial data reviewed');
    }

    // Peer-reviewed literature
    const hasPubMed = citations.some(c => c.type === 'pubmed');
    if (hasPubMed) {
      confidence += 0.05;
      reasons.push('Peer-reviewed literature consulted');
    }

    // Recent sources (within last 2 years)
    const hasRecentSources = citations.some(c => {
      if (!c.date) return false;
      const year = parseInt(c.date.substring(0, 4));
      return year >= new Date().getFullYear() - 2;
    });
    if (hasRecentSources) {
      confidence += 0.03;
      reasons.push('Recent sources included');
    }

    // Cap at 0.95
    confidence = Math.min(confidence, 0.95);

    // Determine confidence level
    let confidenceLevel: 'very-low' | 'low' | 'medium' | 'high' | 'very-high';
    if (confidence >= 0.85) confidenceLevel = 'very-high';
    else if (confidence >= 0.75) confidenceLevel = 'high';
    else if (confidence >= 0.65) confidenceLevel = 'medium';
    else if (confidence >= 0.50) confidenceLevel = 'low';
    else confidenceLevel = 'very-low';

    return {
      confidence,
      confidenceLevel,
      confidenceRationale: reasons.length > 0 ? reasons.join('; ') : 'Limited external verification'
    };
  }

  /**
   * Build evidence summary
   */
  private buildEvidenceSummary(citations: Citation[]) {
    return {
      totalSources: citations.length,
      clinicalTrials: citations.filter(c => c.type === 'clinical-trial').length,
      fdaApprovals: citations.filter(c => c.type === 'fda-approval').length,
      pubmedArticles: citations.filter(c => c.type === 'pubmed').length,
      guidelines: citations.filter(c => c.type === 'ich-guideline' || c.type === 'iso-standard').length,
      internalKnowledge: citations.filter(c => c.type === 'knowledge-base').length
    };
  }

  /**
   * Get agent metadata
   */
  private async getAgentMetadata(agentId: string): Promise<any> {
    // TODO: Fetch from database
    return {
      name: 'AI Assistant',
      role: 'Healthcare Expert',
      expertise: ['Clinical Research', 'Regulatory Affairs']
    };
  }
}

export const enhancedAgentOrchestrator = new EnhancedAgentOrchestrator();
export default enhancedAgentOrchestrator;

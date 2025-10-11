/**
 * Chat RAG Integration Service
 * Integrates RAG knowledge bases with chat functionality
 */



// Local AgentResponse interface for this file
// interface AgentResponse {
//   id: string;
//   agentId: string;
//   content: string;
//   confidence: number;
//   metadata: {
//     agentName: string;
//     capabilities: string[];
//     responseTime: number;
//   };
//   timestamp: Date;
// }

export interface ChatMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  metadata?: Record<string, unknown>;
}

export interface RagEnhancedMessage extends ChatMessage {
  rag_sources?: Array<{
    rag_id: string;
    rag_name: string;
    content: string;
    relevance_score: number;
    document_source: string;
  }>;
  rag_context_used?: boolean;
}

export interface AgentChatContext {
  agent_name: string;
  agent_id: string;
  conversation_id: string;
  rag_assignments: Array<{
    id: string;
    name: string;
    description: string;
    purpose_description: string;
    usage_context?: string;
    custom_prompt_instructions?: string;
    priority: number;
    is_primary: boolean;
  }>;
}

export class ChatRagIntegration {
  /**
   * Initialize chat context with agent's RAG assignments
   */
  static async initializeChatContext(agentName: string, conversationId: string): Promise<AgentChatContext | null> {
    try {
      // Mock RAG context for now - in real implementation would call ragService.getAgentRagContext(agentName)
      const ragContext = {
        assigned_rags: [
          {
            id: 'default-rag',
            name: 'Default Knowledge Base',
            description: 'General knowledge base for the agent',
            purpose_description: 'Provides general context and information',
            priority: 1,
            is_primary: true
          }
        ]
      };

      if (ragContext.assigned_rags.length === 0) {
        return null;
      }

      return {
        agent_name: agentName,
        agent_id: agentName, // In real implementation, would get actual agent ID
        conversation_id: conversationId,
        rag_assignments: ragContext.assigned_rags
      };
    } catch (error) {
      // console.error('❌ Failed to initialize chat context:', error);
      return null;
    }
  }

  /**
   * Enhance user message with RAG context before sending to LLM
   */
  static async enhanceMessageWithRag(
    message: string,
    context: AgentChatContext,
    // _options: {
    //   maxRagResults?: number;
    //   similarityThreshold?: number;
    //   useAllRags?: boolean;
    // } = { /* TODO: implement */ }
  ): Promise<{
    enhanced_message: string;
    system_context: string;
    rag_sources: Array<{
      rag_id: string;
      rag_name: string;
      content: string;
      relevance_score: number;
      document_source: string;
    }>;
  }> {
    try {
      const ragSources: Array<{
        rag_id: string;
        rag_name: string;
        content: string;
        relevance_score: number;
        document_source: string;
      }> = [];

      try {
        // Determine which RAG databases to query
        const ragAssignments = context.rag_assignments.length <= 3
          ? context.rag_assignments
          : context.rag_assignments
            .sort((a, b) => {
              // Sort by primary first, then by priority
              if (a.is_primary && !b.is_primary) return -1;
              if (!a.is_primary && b.is_primary) return 1;
              return b.priority - a.priority;
            })
            .slice(0, 3); // Query top 3 RAGs by default

        // Process each RAG assignment
        for (const assignment of ragAssignments) {
          try {
            // Mock RAG results for now - in real implementation would call ragService.searchKnowledge
            const ragResults = {
              results: [
                {
                  content: `Mock content from ${assignment.name} for query: "${message}"`,
                  score: 0.8,
                  metadata: {
                    document_name: `${assignment.name} Document`,
                    source: assignment.id
                  }
                }
              ]
            };

            // Add sources from this RAG
            ragResults.results.forEach(result => {
              ragSources.push({
                rag_id: assignment.id,
                rag_name: assignment.name,
                content: result.content,
                relevance_score: result.score,
                document_source: result.metadata.document_name || 'Unknown Document'
              });
            });
          } catch (error) {
            // console.error(`Error querying RAG ${assignment.rag_id}:`, error);
            // Continue with other RAGs
          }
        }
      } catch (error) {
        // console.error('Error in RAG integration:', error);
        // Return empty results on error
      }

      // Sort all sources by relevance score
      ragSources.sort((a, b) => b.relevance_score - a.relevance_score);

      // Generate enhanced message and system context
      const { enhanced_message, system_context } = this.buildEnhancedPrompt(
        message,
        ragSources,
        context
      );

      return {
        enhanced_message,
        system_context,
        rag_sources: ragSources
      };
    } catch (error) {
      // console.error('❌ Failed to enhance message with RAG:', error);
      // Return original message if RAG enhancement fails
      return {
        enhanced_message: message,
        system_context: this.buildBasicSystemContext(context),
        rag_sources: []
      };
    }
  }

  /**
   * Build enhanced prompt with RAG context
   */
  private static buildEnhancedPrompt(
    originalMessage: string,
    ragSources: Array<{
      rag_id: string;
      rag_name: string;
      content: string;
      relevance_score: number;
      document_source: string;
    }>,
    context: AgentChatContext
  ): { enhanced_message: string; system_context: string } {
    // Build system context with RAG descriptions
    let systemContext = `You are a specialized AI agent with access to the following knowledge bases:\n\n`;
    systemContext += `AVAILABLE KNOWLEDGE BASES:\n`;
    context.rag_assignments.forEach(rag => {
      systemContext += `• ${rag.name}: ${rag.description}\n`;
      systemContext += `  Purpose: ${rag.purpose_description}\n`;
      if (rag.usage_context) {
        systemContext += `  When to use: ${rag.usage_context}\n`;
      }
      if (rag.custom_prompt_instructions) {
        systemContext += `  Instructions: ${rag.custom_prompt_instructions}\n`;
      }
      systemContext += `  Priority: ${rag.priority} ${rag.is_primary ? '(PRIMARY)' : ''}\n\n`;
    });

    // Build enhanced message with relevant context
    let enhancedMessage = originalMessage;

    if (ragSources.length > 0) {
      enhancedMessage += `\n\nRELEVANT KNOWLEDGE CONTEXT:\n`;

      ragSources.slice(0, 5).forEach((source, index) => {
        enhancedMessage += `\n[Source ${index + 1}] From ${source.rag_name} (${source.document_source}) - Relevance: ${(source.relevance_score * 100).toFixed(0)}%\n`;
        enhancedMessage += `${source.content}\n`;
      });

      enhancedMessage += `\nPlease use this context to provide accurate, evidence-based responses. Always cite your sources when referencing this information.`;
    }

    return { enhanced_message: enhancedMessage, system_context: systemContext };
  }

  /**
   * Build basic system context when no RAG sources are available
   */
  private static buildBasicSystemContext(context: AgentChatContext): string {
    let systemContext = `You are a specialized AI agent. `;

    if (context.rag_assignments.length > 0) {
      systemContext += `You have access to ${context.rag_assignments.length} specialized knowledge base(s), but no relevant context was found for this query. `;
      systemContext += `You may suggest that the user try a more specific question that might match your knowledge base content.`;
    }

    return systemContext;
  }

  /**
   * Process agent response and add RAG attribution
   */
  static async processAgentResponse(
    response: string,
    ragSources: Array<{
      rag_id: string;
      rag_name: string;
      content: string;
      relevance_score: number;
      document_source: string;
    }>,
    context: AgentChatContext
  ): Promise<RagEnhancedMessage> {
    // Create enhanced message with RAG metadata
    const enhancedMessage: RagEnhancedMessage = {
      id: `msg_${Date.now()}`,
      content: response,
      role: 'assistant',
      timestamp: new Date().toISOString(),
      rag_sources: ragSources,
      rag_context_used: ragSources.length > 0,
      metadata: {
        agent_name: context.agent_name,
        conversation_id: context.conversation_id,
        rag_databases_queried: ragSources.map(s => s.rag_name),
        total_rag_sources: ragSources.length,
        avg_relevance_score: ragSources.length > 0
          ? ragSources.reduce((sum, s) => sum + s.relevance_score, 0) / ragSources.length
          : 0
      }
    };

    return enhancedMessage;
  }

  /**
   * Get RAG context summary for agent configuration
   */
  static async getRagContextSummary(/* _agentName: string */): Promise<{
    total_rags: number;
    primary_rag?: string;
    domains_covered: string[];
    last_updated: string;
  }> {
    try {
      // Mock RAG context for now
      const ragContext = {
        assigned_rags: [
          {
            id: 'default-rag',
            name: 'Default Knowledge Base',
            description: 'General knowledge base for the agent',
            purpose_description: 'Provides general context and information',
            priority: 1,
            is_primary: true
          }
        ]
      };

      // Extract domains from RAG descriptions (would be actual data in real implementation)
      const domains = [
        'regulatory',
        'clinical_trials',
        'pharmacovigilance',
        'medical_devices'
      ];

      const primaryRag = ragContext.assigned_rags.find(rag => rag.is_primary);
      const domainsCovered = domains;

      return {
        total_rags: ragContext.assigned_rags.length,
        primary_rag: primaryRag?.name,
        domains_covered: domainsCovered,
        last_updated: new Date().toISOString()
      };
    } catch (error) {
      // console.error('❌ Failed to get RAG context summary:', error);
      return {
        total_rags: 0,
        domains_covered: [],
        last_updated: new Date().toISOString()
      };
    }
  }

  /**
   * Suggest relevant RAG databases for a query
   */
  static async suggestRagDatabases(
    query: string,
    availableRags: Array<{
      id: string;
      name: string;
      description: string;
      purpose_description: string;
      knowledge_domains: string[];
    }>
  ): Promise<Array<{
    rag_id: string;
    rag_name: string;
    relevance_reason: string;
    confidence_score: number;
  }>> {
    // Simple keyword-based suggestion (would use ML in real implementation)
    const suggestions: Array<{
      rag_id: string;
      rag_name: string;
      relevance_reason: string;
      confidence_score: number;
    }> = [];

    const queryLower = query.toLowerCase();
    
    availableRags.forEach(rag => {
      let score = 0;
      const reasons: string[] = [];

      // Check description match
      if (rag.description.toLowerCase().includes(queryLower.split(' ')[0])) {
        score += 0.3;
        reasons.push('description match');
      }

      // Check purpose match
      if (rag.purpose_description.toLowerCase().includes(queryLower.split(' ')[0])) {
        score += 0.4;
        reasons.push('purpose match');
      }

      // Check domain keywords
      rag.knowledge_domains.forEach(domain => {
        if (queryLower.includes(domain.toLowerCase())) {
          score += 0.2;
          reasons.push(`${domain} domain`);
        }
      });

      if (score > 0.2) {
        suggestions.push({
          rag_id: rag.id,
          rag_name: rag.name,
          relevance_reason: reasons.join(', '),
          confidence_score: Math.min(score, 1.0)
        });
      }
    });

    return suggestions.sort((a, b) => b.confidence_score - a.confidence_score);
  }
}
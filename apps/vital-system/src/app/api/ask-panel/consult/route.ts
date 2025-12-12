/**
 * Ask Panel Consultation API Endpoint
 * 
 * Handles panel consultation requests by:
 * 1. Validating configuration
 * 2. Calling Multi-Framework Orchestrator
 * 3. Transforming response for UI
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  multiFrameworkOrchestrator,
  Framework,
  ExecutionMode,
  type AgentDefinition,
} from '@/lib/orchestration/multi-framework-orchestrator';
import type { PanelConfiguration } from '@/features/ask-panel/types/agent';

const AI_ENGINE_URL = process.env.AI_ENGINE_URL || 'http://localhost:8000';

interface RagContext {
  summary: string;
  sources: Array<{
    title: string;
    snippet?: string;
    citation?: string;
    year?: string | number;
  }>;
}

async function fetchRagContext(question: string): Promise<RagContext | null> {
  try {
    const response = await fetch(`${AI_ENGINE_URL}/api/rag/query`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        query: question,
        strategy: 'hybrid',
        max_results: 8,
        include_metadata: true,
        include_medical_context: true,
      }),
    });

    if (!response.ok) {
      console.warn('[Ask Panel API] RAG query failed', await response.text());
      return null;
    }

    const data = await response.json();
    const sources = data?.sources || data?.results || [];
    if (!sources.length) {
      return null;
    }

    const formattedSources = sources.slice(0, 6).map((source: any) => ({
      title:
        source.metadata?.title ||
        source.title ||
        source.metadata?.document_title ||
        'Evidence Source',
      snippet: source.snippet || source.text || source.content,
      citation: source.metadata?.citation,
      year: source.metadata?.year || source.metadata?.publication_year,
    }));

    const summary = formattedSources
      .map((src: { title: string; snippet?: string; citation?: string; year?: string }, index: number) => {
        const yearLabel = src.year ? ` (${src.year})` : '';
        const snippet = src.snippet
          ? ` – ${src.snippet.slice(0, 220)}${src.snippet.length > 220 ? '…' : ''}`
          : '';
        return `${index + 1}. ${src.title}${yearLabel}${snippet}`;
      })
      .join('\n');

    return {
      summary,
      sources: formattedSources,
    };
  } catch (error) {
    console.warn('[Ask Panel API] Failed to fetch RAG context', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, configuration, conversationHistory } = body as {
      question: string;
      configuration: PanelConfiguration;
      conversationHistory?: any[];
    };

    // Validation
    if (!question || !configuration || !configuration.selectedAgents || configuration.selectedAgents.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: question and configuration with agents required' },
        { status: 400 }
      );
    }

    console.log(`🎯 [Ask Panel API] Starting consultation`);
    console.log(`📋 [Ask Panel API] Agents: ${configuration.selectedAgents.length}`);
    console.log(`⚙️ [Ask Panel API] Mode: ${configuration.mode}`);
    console.log(`🤖 [Ask Panel API] Framework: ${configuration.framework || 'auto'}`);

    // Fetch up-to-date medical evidence for context (RAG)
    const ragContext = await fetchRagContext(question);

    // Build agent definitions from selected agents (inject evidence context when available)
    const agents: AgentDefinition[] = configuration.selectedAgents.map(agent => {
      const evidencePrompt = ragContext
        ? `\n\n# Latest Evidence (auto-refreshed)\n${ragContext.summary}\n\nUse the above 2025/2026 context for your answer and cite sources when possible.`
        : '';

      return {
        id: agent.id,
        role: agent.title,
        goal: agent.description,
        backstory: ('background' in agent ? agent.background : undefined) || agent.description,
        systemPrompt: `You are ${agent.title}, a ${agent.category} expert. ${agent.description}${evidencePrompt}`,
        model: 'gpt-4o',
        temperature: 0.7,
        maxTokens: 2000,
        tools: [],
        allowDelegation: configuration.allowDebate || false,
      };
    });

    // Determine execution mode
    const executionMode: ExecutionMode =
      configuration.executionMode === 'sequential' ? ExecutionMode.Sequential :
      configuration.executionMode === 'parallel' ? ExecutionMode.Parallel :
      configuration.executionMode === 'conversational' ? ExecutionMode.Conversational :
      configuration.executionMode === 'hierarchical' ? ExecutionMode.Hierarchical :
      ExecutionMode.Conversational; // Default

    // Determine framework
    let framework: Framework;
    if (configuration.framework && configuration.framework !== 'auto') {
      framework = configuration.framework as Framework;
    } else {
      // Auto-select based on configuration
      framework = multiFrameworkOrchestrator.recommendFramework({
        agentCount: agents.length,
        needsConversation: executionMode === ExecutionMode.Conversational,
        needsState: executionMode === ExecutionMode.Sequential,
        needsDelegation: executionMode === ExecutionMode.Hierarchical,
        complexity: agents.length > 5 ? 'high' : agents.length > 2 ? 'medium' : 'low',
      });
    }

    console.log(`✨ [Ask Panel API] Selected framework: ${framework}`);

    // Execute panel consultation
    const result = await multiFrameworkOrchestrator.execute({
      workflow: {
        framework,
        mode: executionMode,
        agents,
        maxRounds: configuration.maxRounds || 10,
        requireConsensus: configuration.requireConsensus || false,
        streaming: false,
        checkpoints: true,
        timeout: 300000, // 5 minutes
      },
      input: {
        message: question,
        messages: conversationHistory,
        context: ragContext
          ? {
              ragSummary: ragContext.summary,
              ragSources: ragContext.sources,
            }
          : undefined,
      },
      metadata: {
        source: 'ask-panel',
      },
    });

    if (!result.success) {
      console.error(`❌ [Ask Panel API] Execution failed: ${result.error}`);
      return NextResponse.json(
        { error: result.error || 'Panel consultation failed' },
        { status: 500 }
      );
    }

    // Extract moderator/synthesis messages from state
    const state = result.outputs.state as any;
    const moderatorMessages: Array<{ role: string; content: string; timestamp?: Date }> = [];
    
    // Check for moderator/synthesis messages in various possible locations
    if (state?.synthesis) {
      moderatorMessages.push({
        role: 'moderator',
        content: state.synthesis,
      });
    }
    if (state?.moderator_response) {
      moderatorMessages.push({
        role: 'moderator',
        content: state.moderator_response,
      });
    }
    if (state?.summary) {
      moderatorMessages.push({
        role: 'moderator',
        content: state.summary,
      });
    }
    if (state?.final_recommendation) {
      moderatorMessages.push({
        role: 'moderator',
        content: state.final_recommendation,
      });
    }
    
    // Extract all messages and filter for moderator messages
    const allMessages = result.outputs.messages || [];
    const expertMessages: any[] = [];
    
    allMessages.forEach((msg: any) => {
      const isModerator = msg.role === 'moderator' || msg.role === 'system' || msg.name === 'moderator' || 
          (msg.content && (msg.content.toLowerCase().includes('moderator') || 
           msg.content.toLowerCase().includes('synthesis') || 
           msg.content.toLowerCase().includes('summary') ||
           msg.content.toLowerCase().includes('panel conclusion')));
      
      if (isModerator) {
        moderatorMessages.push({
          role: 'moderator',
          content: msg.content || msg.text || '',
          timestamp: msg.timestamp ? new Date(msg.timestamp) : undefined,
        });
      } else {
        // This is an expert message
        expertMessages.push(msg);
      }
    });

    // Transform result for UI
    const response = {
      success: true,
      framework: result.framework,
      experts: agents.map((agent, index) => {
        // Try to find message by agent ID first, then fall back to index
        const message = expertMessages.find((m: any) => 
          m.agentId === agent.id || 
          m.name === agent.role || 
          m.role === agent.role
        ) || expertMessages[index];
        
        return {
          agentId: agent.id,
          role: agent.role,
          response: message?.content || message?.text || '',
          confidence: message?.confidence || 0.85,
        };
      }),
      moderator: moderatorMessages.length > 0 ? moderatorMessages : undefined,
      consensus: configuration.requireConsensus ? {
        reached: state?.consensusReached || state?.consensus_reached || false,
        finalRecommendation: state?.recommendation || state?.final_recommendation || state?.finalRecommendation,
        dissenting: state?.dissenting || state?.dissenting_views || [],
      } : undefined,
      synthesis: state?.synthesis || state?.summary || state?.final_recommendation,
      metadata: {
        duration: result.metadata.duration,
        tokensUsed: result.metadata.tokensUsed,
        agentsInvolved: result.metadata.agentsInvolved,
        rounds: state?.currentRound || state?.rounds || 1,
      },
      evidence: ragContext
        ? {
            summary: ragContext.summary,
            sources: ragContext.sources,
          }
        : undefined,
    };

    console.log(`✅ [Ask Panel API] Consultation complete in ${result.metadata.duration}ms`);

    return NextResponse.json(response);

  } catch (error) {
    console.error('❌ [Ask Panel API] Error:', error);
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    );
  }
}


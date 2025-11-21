/**
 * Ask Panel Consultation API Endpoint
 * 
 * Handles panel consultation requests by:
 * 1. Validating configuration
 * 2. Calling Multi-Framework Orchestrator
 * 3. Transforming response for UI
 */

import { NextRequest, NextResponse } from 'next/server';
import { multiFrameworkOrchestrator, Framework, ExecutionMode } from '@/lib/orchestration/multi-framework-orchestrator';
import type { AgentDefinition } from '@/lib/orchestration/multi-framework-orchestrator';
import type { PanelConfiguration } from '@/features/ask-panel/types/agent';

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

    // Build agent definitions from selected agents
    const agents: AgentDefinition[] = configuration.selectedAgents.map(agent => ({
      id: agent.id,
      role: agent.title,
      goal: agent.description,
      backstory: ('background' in agent ? agent.background : undefined) || agent.description,
      systemPrompt: `You are ${agent.title}, a ${agent.category} expert. ${agent.description}`,
      model: 'gpt-4o',
      temperature: 0.7,
      maxTokens: 2000,
      tools: [],
      allowDelegation: configuration.allowDebate || false,
    }));

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

    // Transform result for UI
    const response = {
      success: true,
      framework: result.framework,
      experts: agents.map((agent, index) => {
        const message = result.outputs.messages?.[index];
        return {
          agentId: agent.id,
          role: agent.role,
          response: message?.content || '',
          confidence: 0.85, // TODO: Extract from result
        };
      }),
      consensus: configuration.requireConsensus ? {
        reached: (result.outputs.state as any)?.consensusReached || false,
        finalRecommendation: (result.outputs.state as any)?.recommendation,
        dissenting: (result.outputs.state as any)?.dissenting || [],
      } : undefined,
      metadata: {
        duration: result.metadata.duration,
        tokensUsed: result.metadata.tokensUsed,
        agentsInvolved: result.metadata.agentsInvolved,
        rounds: 1, // TODO: Extract from result
      },
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


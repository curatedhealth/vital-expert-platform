import { NextRequest, NextResponse } from 'next/server';

import { PanelMember } from '@/app/(app)/ask-panel/services/panel-store';
import { langGraphOrchestrator } from '@/lib/services/langgraph-orchestrator';

export const runtime = 'nodejs';
export const maxDuration = 60; // 60 seconds for panel consultation

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, panel, context, mode = 'parallel' } = body;

    if (!message || !panel || !panel.members) {
      return NextResponse.json(
        { error: 'Missing required fields: message, panel.members' },
        { status: 400 }
      );
    }

    console.log(`\n🎭 LangGraph Panel Orchestration API Request`);
    console.log(`📋 Message: ${message.substring(0, 100)}...`);
    console.log(`👥 Panel Members: ${panel.members.length}`);
    console.log(`🎯 Mode: ${mode}`);

    // Extract persona names from panel members
    const personas = panel.members.map((m: PanelMember) => m.agent.name);

    // Orchestrate using LangGraph engine
    const result = await langGraphOrchestrator.orchestrate({
      mode,
      question: message,
      personas,
      evidenceSources: [], // TODO: Integrate evidence pack builder
    });

    console.log(`✅ LangGraph panel orchestration completed`);
    console.log(`📊 Expert responses: ${result.replies.length}`);
    console.log(`🎯 Consensus: ${result.synthesis?.consensus?.length || 0} points`);
    console.log(`📝 Execution logs: ${result.metadata?.logs?.length || 0} entries\n`);

    // Format response for client
    return NextResponse.json({
      success: true,
      response: result.synthesis?.summaryMd || 'No synthesis available',
      metadata: {
        mode: result.mode,
        sessionId: result.sessionId,
        consensus: result.synthesis?.consensus || [],
        dissent: result.synthesis?.dissent || [],
        expertResponses: result.replies.map((r: any) => ({
          expertId: r.persona,
          expertName: r.persona,
          content: r.text,
          confidence: r.confidence,
          citations: r.citations,
          timestamp: r.timestamp,
        })),
        humanGateRequired: result.synthesis?.humanGateRequired || false,
        timestamp: new Date().toISOString(),
      },
    });

  } catch (error) {
    console.error('❌ Panel orchestration API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to orchestrate panel',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

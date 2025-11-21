/**
 * Ask Panel API Endpoint
 * POST /api/ask-panel
 * 
 * Adaptive multi-expert consultation system
 */

import { NextRequest, NextResponse } from 'next/server';
import { askPanelOrchestrator, PanelMode, ExpertType, type PanelConfig } from '@/features/ask-panel/services/ask-panel-orchestrator';
import { z } from 'zod';

const AskPanelRequestSchema = z.object({
  question: z.string().min(10, 'Question must be at least 10 characters'),
  mode: z.nativeEnum(PanelMode).default(PanelMode.Hybrid),
  // Support both legacy ExpertType enum and new agent IDs
  experts: z.array(z.union([z.nativeEnum(ExpertType), z.string()])).min(1, 'At least one expert required').max(8, 'Maximum 8 experts'),
  // New: Support agent IDs directly
  agentIds: z.array(z.string()).optional(),
  maxRounds: z.number().int().positive().max(20).optional(),
  allowDebate: z.boolean().optional(),
  requireConsensus: z.boolean().optional(),
  userGuidance: z.enum(['high', 'medium', 'low']).optional(),
  context: z.object({
    conversationHistory: z.array(z.any()).optional(),
    organizationProfile: z.any().optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validated = AskPanelRequestSchema.parse(body);
    
    console.log(`🎯 [API] Ask Panel request received`);
    console.log(`📋 [API] Question: ${validated.question.substring(0, 100)}...`);
    console.log(`👥 [API] Experts: ${validated.experts.join(', ')}`);
    console.log(`👥 [API] Agent IDs: ${validated.agentIds?.join(', ') || 'none'}`);
    console.log(`⚙️ [API] Mode: ${validated.mode}`);
    
    // Use agent IDs if provided, otherwise use legacy expert types
    const panelConfig: PanelConfig = {
      mode: validated.mode,
      experts: validated.agentIds ? validated.agentIds as ExpertType[] : validated.experts as ExpertType[],
      agentIds: validated.agentIds, // Pass agent IDs separately for new integration
      maxRounds: validated.maxRounds,
      allowDebate: validated.allowDebate,
      requireConsensus: validated.requireConsensus,
      userGuidance: validated.userGuidance,
    };
    
    const result = await askPanelOrchestrator.consultPanel(
      validated.question,
      panelConfig,
      validated.context
    );
    
    console.log(`✅ [API] Panel consultation complete (${result.framework})`);
    console.log(`👥 [API] Experts consulted: ${result.experts.length}`);
    
    return NextResponse.json({
      success: true,
      framework: result.framework,
      experts: result.experts,
      consensus: result.consensus,
      conversationLog: result.conversationLog,
    });
    
  } catch (error) {
    console.error('❌ [API] Ask Panel error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request', details: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Panel consultation failed', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// GET endpoint to list available experts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  
  if (action === 'experts') {
    // Return available expert types with metadata (legacy)
    return NextResponse.json({
      experts: Object.values(ExpertType),
      modes: Object.values(PanelMode),
    });
  }
  
  if (action === 'agents') {
    // NEW: Return agents from agent store
    try {
      const { getAllActiveAgents } = await import('@/features/ask-panel/services/agent-store-integration');
      const agents = await getAllActiveAgents();
      
      console.log(`📦 [API] Returning ${agents.length} agents from Agent Store`);
      
      return NextResponse.json({
        success: true,
        agents: agents.map(agent => ({
          id: agent.id,
          name: agent.role,
          description: agent.goal,
          expertise: agent.expertise,
          model: agent.model,
        })),
        modes: Object.values(PanelMode),
        source: 'agent-store',
      });
    } catch (error) {
      console.error('❌ [API] Error fetching agents:', error);
      // Return empty array instead of error to allow graceful degradation
      return NextResponse.json({
        success: false,
        agents: [],
        modes: Object.values(PanelMode),
        source: 'fallback',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  }
  
  return NextResponse.json({ error: 'Invalid action. Use ?action=experts or ?action=agents' }, { status: 400 });
}


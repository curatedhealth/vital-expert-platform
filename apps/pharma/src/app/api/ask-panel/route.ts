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
  experts: z.array(z.nativeEnum(ExpertType)).min(1, 'At least one expert required').max(8, 'Maximum 8 experts'),
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
    console.log(`⚙️ [API] Mode: ${validated.mode}`);
    
    const panelConfig: PanelConfig = {
      mode: validated.mode,
      experts: validated.experts,
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
    // Return available expert types with metadata
    return NextResponse.json({
      experts: Object.values(ExpertType),
      modes: Object.values(PanelMode),
    });
  }
  
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}


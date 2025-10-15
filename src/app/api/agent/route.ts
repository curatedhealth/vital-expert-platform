import { NextRequest, NextResponse } from 'next/server';
import { AgentOrchestrator } from '@/core/services/agent-orchestrator/agent-orchestrator.service';
import { validateAgentRequest } from '@/shared/validation/agent.schemas';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const userId = searchParams.get('userId');

    if (!query) {
      return NextResponse.json(
        { error: 'Query parameter is required' },
        { status: 400 }
      );
    }

    // Mock agent orchestrator for now
    const orchestrator = new AgentOrchestrator();
    
    return NextResponse.json({
      success: true,
      message: 'Agent selection endpoint',
      query,
      userId
    });
  } catch (error) {
    console.error('Agent API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate request
    const validatedData = validateAgentRequest(body);
    
    return NextResponse.json({
      success: true,
      message: 'Agent created successfully',
      data: validatedData
    });
  } catch (error) {
    console.error('Agent creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create agent' },
      { status: 400 }
    );
  }
}

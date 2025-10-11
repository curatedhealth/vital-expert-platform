import { NextRequest, NextResponse } from 'next/server';
import { LLMGovernanceService } from '@/services/llm-governance.service';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const submittedBy = searchParams.get('submittedBy') || undefined;
    const promptId = searchParams.get('promptId') || undefined;

    const governanceService = new LLMGovernanceService();
    const changes = await governanceService.getPromptChanges({
      status,
      submittedBy,
      promptId
    });
    
    return NextResponse.json(changes);
  } catch (error) {
    console.error('Error fetching prompt changes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompt changes' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { promptId, version, title, description, changes } = body;

    if (!promptId || !version || !title || !description) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const governanceService = new LLMGovernanceService();
    const { user } = await governanceService.getCurrentUser();
    
    const change = await governanceService.submitPromptChange({
      promptId,
      version,
      title,
      description,
      changes: changes || []
    }, user.id);

    return NextResponse.json(change);
  } catch (error) {
    console.error('Error submitting prompt change:', error);
    return NextResponse.json(
      { error: 'Failed to submit prompt change' },
      { status: 500 }
    );
  }
}

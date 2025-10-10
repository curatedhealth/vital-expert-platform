import { NextRequest, NextResponse } from 'next/server';
import { LLMGovernanceService } from '@/services/llm-governance.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { action, comment } = body;
    const changeId = params.id;

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const governanceService = new LLMGovernanceService();
    const { user } = await governanceService.getCurrentUser();
    
    await governanceService.reviewPromptChange(changeId, action, user.id, comment);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reviewing prompt change:', error);
    return NextResponse.json(
      { error: 'Failed to review prompt change' },
      { status: 500 }
    );
  }
}

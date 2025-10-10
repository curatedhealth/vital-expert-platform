import { NextRequest, NextResponse } from 'next/server';
import { LLMGovernanceService } from '@/services/llm-governance.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { reason } = body;
    const changeId = params.id;

    if (!reason) {
      return NextResponse.json(
        { error: 'Rollback reason is required' },
        { status: 400 }
      );
    }

    const governanceService = new LLMGovernanceService();
    const { user } = await governanceService.getCurrentUser();
    
    await governanceService.rollbackPromptChange(changeId, reason, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error rolling back prompt change:', error);
    return NextResponse.json(
      { error: 'Failed to rollback prompt change' },
      { status: 500 }
    );
  }
}

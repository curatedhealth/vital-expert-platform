import { NextRequest, NextResponse } from 'next/server';
import { LLMGovernanceService } from '@/services/llm-governance.service';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const changeId = params.id;

    const governanceService = new LLMGovernanceService();
    const { user } = await governanceService.getCurrentUser();
    
    await governanceService.deployPromptChange(changeId, user.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deploying prompt change:', error);
    return NextResponse.json(
      { error: 'Failed to deploy prompt change' },
      { status: 500 }
    );
  }
}

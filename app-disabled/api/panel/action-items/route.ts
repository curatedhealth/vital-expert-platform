import { NextRequest, NextResponse } from 'next/server';
import { actionItemExtractorService } from '@/lib/services/action-item-extractor';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { question, expertReplies, synthesis } = body;

    if (!question || !expertReplies || !synthesis) {
      return NextResponse.json(
        { error: 'Missing required fields: question, expertReplies, synthesis' },
        { status: 400 }
      );
    }

    console.log(`\n📋 Action Item Extraction API Request`);
    console.log(`📋 Question: ${question.substring(0, 100)}...`);
    console.log(`👥 Expert Replies: ${expertReplies.length}`);

    const result = await actionItemExtractorService.extractActionItems(
      question,
      expertReplies,
      synthesis
    );

    console.log(`✅ Action item extraction completed`);
    console.log(`📊 Total Items: ${result.summary.totalItems}`);
    console.log(`🔴 Critical: ${result.summary.criticalItems}`);
    console.log(`🟠 High: ${result.summary.highPriorityItems}`);
    console.log(`🟡 Medium: ${result.summary.mediumPriorityItems}`);
    console.log(`🟢 Low: ${result.summary.lowPriorityItems}`);
    console.log(`⚡ Immediate: ${result.summary.immediateActions}`);
    console.log(`📅 Short-term: ${result.summary.shortTermActions}`);
    console.log(`📆 Medium-term: ${result.summary.mediumTermActions}`);
    console.log(`🗓️  Long-term: ${result.summary.longTermActions}\n`);

    return NextResponse.json({
      success: true,
      ...result,
    });

  } catch (error) {
    console.error('❌ Action item extraction API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to extract action items',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

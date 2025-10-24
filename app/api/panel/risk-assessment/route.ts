import { NextRequest, NextResponse } from 'next/server';

import { riskAssessmentService } from '@/lib/services/risk-assessment';

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

    console.log(`\n🎯 Risk Assessment API Request`);
    console.log(`📋 Question: ${question.substring(0, 100)}...`);
    console.log(`👥 Expert Replies: ${expertReplies.length}`);

    const riskMatrix = await riskAssessmentService.assessRisks(
      question,
      expertReplies,
      synthesis
    );

    console.log(`✅ Risk assessment completed`);
    console.log(`🎲 Total Risks: ${riskMatrix.summary.totalRisks}`);
    console.log(`🔴 Critical Risks: ${riskMatrix.summary.criticalRisks}`);
    console.log(`🟠 High Risks: ${riskMatrix.summary.highRisks}`);
    console.log(`🟡 Medium Risks: ${riskMatrix.summary.mediumRisks}`);
    console.log(`🟢 Low Risks: ${riskMatrix.summary.lowRisks}\n`);

    return NextResponse.json({
      success: true,
      riskMatrix,
    });

  } catch (error) {
    console.error('❌ Risk assessment API error:', error);

    return NextResponse.json(
      {
        error: 'Failed to assess risks',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

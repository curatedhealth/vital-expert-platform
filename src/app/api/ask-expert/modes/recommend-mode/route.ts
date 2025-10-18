import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { query, context } = body;

    console.log('💡 Getting mode recommendation:', { query: query?.substring(0, 100) + '...' });

    // Simple mode recommendation logic
    const queryLower = query?.toLowerCase() || '';
    let recommendedModes = ['auto_interactive'];
    let complexity = 'simple';
    let intent = 'general_inquiry';

    if (queryLower.includes('complex') || queryLower.includes('analysis') || queryLower.includes('research')) {
      recommendedModes = ['auto_autonomous'];
      complexity = 'complex';
      intent = 'complex_analysis';
    } else if (queryLower.includes('expert') || queryLower.includes('specialist')) {
      recommendedModes = ['manual_interactive'];
      complexity = 'medium';
      intent = 'expert_consultation';
    } else if (queryLower.includes('autonomous') || queryLower.includes('multi-step')) {
      recommendedModes = ['manual_autonomous'];
      complexity = 'complex';
      intent = 'autonomous_analysis';
    }

    return NextResponse.json({
      query_analysis: {
        intent,
        complexity,
        keywords: queryLower.split(' ').slice(0, 5)
      },
      recommended_modes: recommendedModes,
      confidence: 0.85,
      reasoning: `Based on the query content, we recommend ${recommendedModes.join(' and ')} mode(s) for optimal results.`
    });

  } catch (error) {
    console.error('❌ Recommend mode error:', error);
    return NextResponse.json(
      { error: 'Failed to recommend mode: ' + (error as Error).message },
      { status: 500 }
    );
  }
}

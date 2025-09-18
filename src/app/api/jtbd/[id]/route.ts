import { NextRequest, NextResponse } from 'next/server';
import { jtbdService } from '@/lib/jtbd/jtbd-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const jtbdId = params.id;

    console.log('=== Fetching detailed JTBD ===');
    console.log('JTBD ID:', jtbdId);

    const detailedJTBD = await jtbdService.getDetailedJTBD(jtbdId);

    if (!detailedJTBD) {
      return NextResponse.json(
        {
          success: false,
          error: 'JTBD not found'
        },
        { status: 404 }
      );
    }

    console.log(`Found JTBD: ${detailedJTBD.title}`);
    console.log(`Pain points: ${detailedJTBD.pain_points.length}`);
    console.log(`Process steps: ${detailedJTBD.process_steps.length}`);
    console.log(`Tools required: ${detailedJTBD.tools.length}`);

    return NextResponse.json({
      success: true,
      data: detailedJTBD
    });

  } catch (error) {
    console.error('JTBD detail API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch JTBD details',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
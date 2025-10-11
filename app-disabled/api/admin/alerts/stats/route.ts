import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';

export async function GET(request: NextRequest) {
  try {

    const stats = await alertManagerService.getAlertStats();

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching alert stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch alert stats' },
      { status: 500 }
    );
  }
}

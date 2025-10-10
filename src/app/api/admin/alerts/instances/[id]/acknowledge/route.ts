import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';
import { requireAdmin } from '@/lib/auth/requireAdmin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const { acknowledgedBy } = body;

    await alertManagerService.acknowledgeAlert(params.id, acknowledgedBy);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error acknowledging alert:', error);
    return NextResponse.json(
      { error: 'Failed to acknowledge alert' },
      { status: 500 }
    );
  }
}

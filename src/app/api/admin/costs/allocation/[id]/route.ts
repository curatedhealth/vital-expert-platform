import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth/requireAdmin';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const rule = await costAnalyticsService.updateBudgetConfiguration(params.id, body);

    return NextResponse.json({ success: true, data: rule });
  } catch (error) {
    console.error('Error updating cost allocation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update cost allocation rule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    await costAnalyticsService.deleteBudgetConfiguration(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting cost allocation rule:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete cost allocation rule' },
      { status: 500 }
    );
  }
}

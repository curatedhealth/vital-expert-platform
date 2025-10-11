import { NextRequest, NextResponse } from 'next/server';
import { costAnalyticsService } from '@/services/cost-analytics.service';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    const body = await request.json();
    const budget = await costAnalyticsService.updateBudgetConfiguration(params.id, body);

    return NextResponse.json({ success: true, data: budget });
  } catch (error) {
    console.error('Error updating budget configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update budget configuration' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {

    await costAnalyticsService.deleteBudgetConfiguration(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting budget configuration:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete budget configuration' },
      { status: 500 }
    );
  }
}

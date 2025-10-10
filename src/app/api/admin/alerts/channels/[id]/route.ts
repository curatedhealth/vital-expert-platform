import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const channels = await alertManagerService.getNotificationChannels();
    const channel = channels.find(c => c.id === params.id);

    if (!channel) {
      return NextResponse.json(
        { error: 'Notification channel not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error fetching notification channel:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification channel' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    const body = await request.json();
    const channel = await alertManagerService.updateNotificationChannel(params.id, body);

    return NextResponse.json(channel);
  } catch (error) {
    console.error('Error updating notification channel:', error);
    return NextResponse.json(
      { error: 'Failed to update notification channel' },
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

    await alertManagerService.deleteNotificationChannel(params.id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting notification channel:', error);
    return NextResponse.json(
      { error: 'Failed to delete notification channel' },
      { status: 500 }
    );
  }
}

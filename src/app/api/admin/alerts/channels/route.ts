import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';

export async function GET(request: NextRequest) {
  try {

    const channels = await alertManagerService.getNotificationChannels();

    return NextResponse.json(channels);
  } catch (error) {
    console.error('Error fetching notification channels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch notification channels' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {

    const body = await request.json();
    const channel = await alertManagerService.createNotificationChannel(body);

    return NextResponse.json(channel, { status: 201 });
  } catch (error) {
    console.error('Error creating notification channel:', error);
    return NextResponse.json(
      { error: 'Failed to create notification channel' },
      { status: 500 }
    );
  }
}

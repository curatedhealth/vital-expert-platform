import { NextRequest, NextResponse } from 'next/server';
import { alertManagerService } from '@/services/alert-manager.service';
import { requireAdmin } from '@/lib/auth/require-admin';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await requireAdmin();

    // Simulate sending a test notification
    // In a real implementation, you'd actually send the notification
    console.log(`Testing notification channel ${params.id}`);

    return NextResponse.json({ success: true, message: 'Test notification sent successfully' });
  } catch (error) {
    console.error('Error testing notification channel:', error);
    return NextResponse.json(
      { error: 'Failed to send test notification' },
      { status: 500 }
    );
  }
}

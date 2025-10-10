import { NextRequest, NextResponse } from 'next/server';
import { BackupRecoveryService } from '@/services/backup-recovery.service';

export const dynamic = 'force-dynamic';

const backupService = new BackupRecoveryService();

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    // Validate cron expression if provided
    if (body.cron_expression && !backupService.validateCronExpression(body.cron_expression)) {
      return NextResponse.json(
        { error: 'Invalid cron expression format' },
        { status: 400 }
      );
    }

    const schedule = await backupService.updateBackupSchedule(params.id, body);
    return NextResponse.json(schedule);
  } catch (error) {
    console.error('Error updating backup schedule:', error);
    return NextResponse.json(
      { error: 'Failed to update backup schedule' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await backupService.deleteBackupSchedule(params.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting backup schedule:', error);
    return NextResponse.json(
      { error: 'Failed to delete backup schedule' },
      { status: 500 }
    );
  }
}

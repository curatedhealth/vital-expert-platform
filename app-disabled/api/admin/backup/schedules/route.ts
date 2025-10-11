import { NextRequest, NextResponse } from 'next/server';
import { BackupRecoveryService } from '@/services/backup-recovery.service';

export const dynamic = 'force-dynamic';

const backupService = new BackupRecoveryService();

export async function GET(request: NextRequest) {
  try {
    const schedules = await backupService.getBackupSchedules();
    return NextResponse.json(schedules);
  } catch (error) {
    console.error('Error fetching backup schedules:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup schedules' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate required fields
    if (!body.name || !body.backup_type || !body.cron_expression) {
      return NextResponse.json(
        { error: 'Name, backup_type, and cron_expression are required' },
        { status: 400 }
      );
    }

    // Validate backup type
    if (!['full', 'incremental', 'differential'].includes(body.backup_type)) {
      return NextResponse.json(
        { error: 'Invalid backup type' },
        { status: 400 }
      );
    }

    // Validate cron expression
    if (!backupService.validateCronExpression(body.cron_expression)) {
      return NextResponse.json(
        { error: 'Invalid cron expression format' },
        { status: 400 }
      );
    }

    const schedule = await backupService.createBackupSchedule(body);
    return NextResponse.json(schedule, { status: 201 });
  } catch (error) {
    console.error('Error creating backup schedule:', error);
    return NextResponse.json(
      { error: 'Failed to create backup schedule' },
      { status: 500 }
    );
  }
}

import { NextRequest, NextResponse } from 'next/server';
import { BackupRecoveryService } from '@/services/backup-recovery.service';

export const dynamic = 'force-dynamic';

const backupService = new BackupRecoveryService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupType = 'full', tables } = body;
    
    // Validate backup type
    if (!['full', 'incremental', 'differential'].includes(backupType)) {
      return NextResponse.json(
        { error: 'Invalid backup type' },
        { status: 400 }
      );
    }

    const backup = await backupService.triggerBackup(backupType, tables);
    return NextResponse.json(backup, { status: 201 });
  } catch (error) {
    console.error('Error triggering backup:', error);
    return NextResponse.json(
      { error: 'Failed to trigger backup' },
      { status: 500 }
    );
  }
}

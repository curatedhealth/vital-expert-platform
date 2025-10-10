import { NextRequest, NextResponse } from 'next/server';
import { BackupRecoveryService } from '@/services/backup-recovery.service';

export const dynamic = 'force-dynamic';

const backupService = new BackupRecoveryService();

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      status: searchParams.get('status') || undefined,
      backup_type: searchParams.get('backup_type') || undefined,
      date_from: searchParams.get('date_from') || undefined,
      date_to: searchParams.get('date_to') || undefined
    };

    const backups = await backupService.getBackupHistory(filters);
    return NextResponse.json(backups);
  } catch (error) {
    console.error('Error fetching backup history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch backup history' },
      { status: 500 }
    );
  }
}

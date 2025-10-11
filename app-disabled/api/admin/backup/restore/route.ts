import { NextRequest, NextResponse } from 'next/server';
import { BackupRecoveryService } from '@/services/backup-recovery.service';

export const dynamic = 'force-dynamic';

const backupService = new BackupRecoveryService();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { backupId, restoreType = 'full', tables } = body;
    
    // Validate required fields
    if (!backupId) {
      return NextResponse.json(
        { error: 'Backup ID is required' },
        { status: 400 }
      );
    }

    // Validate restore type
    if (!['full', 'partial', 'point_in_time'].includes(restoreType)) {
      return NextResponse.json(
        { error: 'Invalid restore type' },
        { status: 400 }
      );
    }

    const restore = await backupService.startRestore(backupId, restoreType, tables);
    return NextResponse.json(restore, { status: 201 });
  } catch (error) {
    console.error('Error starting restore:', error);
    return NextResponse.json(
      { error: 'Failed to start restore operation' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const restores = await backupService.getRestoreHistory();
    return NextResponse.json(restores);
  } catch (error) {
    console.error('Error fetching restore history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch restore history' },
      { status: 500 }
    );
  }
}

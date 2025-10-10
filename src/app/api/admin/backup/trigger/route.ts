import { NextRequest, NextResponse } from 'next/server';
import { BackupRecoveryService } from '@/services/backup-recovery.service';
import { withAuth } from '@/lib/auth/api-auth-middleware';

export const dynamic = 'force-dynamic';

const backupService = new BackupRecoveryService();

export async function POST(request: NextRequest) {
  return withAuth(request, async (req, user) => {
    try {
      // Verify admin role
      if (!['admin', 'super_admin'].includes(user.role)) {
        return NextResponse.json(
          { error: 'Forbidden - Admin access required' }, 
          { status: 403 }
        );
      }

      const body = await req.json();
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
  });
}

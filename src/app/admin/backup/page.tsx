import { BackupRecoveryService } from '@/services/backup-recovery.service';

import BackupDashboard from './components/BackupDashboard';


// Prevent pre-rendering for admin pages
export const dynamic = 'force-dynamic';
export default async function BackupPage() {
  // Mock super admin status - in production this would come from auth context
  const isSuperAdmin = true;

  const backupService = new BackupRecoveryService();

  // Fetch initial data
  const [backupHistory, restoreHistory, schedules, health] = await Promise.all([
    backupService.getBackupHistory(),
    backupService.getRestoreHistory(),
    backupService.getBackupSchedules(),
    backupService.getBackupHealth()
  ]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Backup & Recovery</h1>
        <p className="mt-2 text-sm text-gray-600">
          Manage database backups, restore operations, and backup scheduling.
        </p>
        {isSuperAdmin && (
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <span className="mr-1">🔧</span>
            Super Admin privileges active
          </div>
        )}
      </div>

      {/* Backup Dashboard */}
      <BackupDashboard
        initialBackupHistory={backupHistory}
        initialRestoreHistory={restoreHistory}
        initialSchedules={schedules}
        initialHealth={health}
      />
    </div>
  );
}

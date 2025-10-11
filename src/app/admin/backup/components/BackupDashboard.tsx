'use client';

import { 
  Database, 
  Clock, 
  RotateCcw, 
  Activity,
  AlertTriangle,
  CheckCircle,
  XCircle
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BackupRecoveryService, 
  BackupMetadata, 
  RestoreOperation, 
  BackupSchedule 
} from '@/services/backup-recovery.service';

import BackupHealthMonitor from './BackupHealthMonitor';
import BackupHistory from './BackupHistory';
import BackupScheduler from './BackupScheduler';
import RestoreManager from './RestoreManager';

interface BackupDashboardProps {
  initialBackupHistory: BackupMetadata[];
  initialRestoreHistory: RestoreOperation[];
  initialSchedules: BackupSchedule[];
  initialHealth: {
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    last_backup: string | null;
    next_scheduled: string | null;
    storage_used: number;
    health_score: number;
  };
}

export default function BackupDashboard({
  initialBackupHistory,
  initialRestoreHistory,
  initialSchedules,
  initialHealth,
}: BackupDashboardProps) {
  const [backupHistory, setBackupHistory] = useState<BackupMetadata[]>(initialBackupHistory);
  const [restoreHistory, setRestoreHistory] = useState<RestoreOperation[]>(initialRestoreHistory);
  const [schedules, setSchedules] = useState<BackupSchedule[]>(initialSchedules);
  const [health, setHealth] = useState(initialHealth);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backupService = new BackupRecoveryService();

  const handleBackupCreate = (newBackup: BackupMetadata) => {
    setBackupHistory(prev => [newBackup, ...prev]);
    refreshHealth();
  };

  const handleBackupDelete = (backupId: string) => {
    setBackupHistory(prev => prev.filter(backup => backup.id !== backupId));
    refreshHealth();
  };

  const handleRestoreCreate = (newRestore: RestoreOperation) => {
    setRestoreHistory(prev => [newRestore, ...prev]);
  };

  const handleScheduleCreate = (newSchedule: BackupSchedule) => {
    setSchedules(prev => [newSchedule, ...prev]);
  };

  const handleScheduleUpdate = (updatedSchedule: BackupSchedule) => {
    setSchedules(prev => 
      prev.map(schedule => schedule.id === updatedSchedule.id ? updatedSchedule : schedule)
    );
  };

  const handleScheduleDelete = (scheduleId: string) => {
    setSchedules(prev => prev.filter(schedule => schedule.id !== scheduleId));
  };

  const refreshHealth = async () => {
    try {
      const healthData = await backupService.getBackupHealth();
      setHealth(healthData);
    } catch (err) {
      console.error('Failed to refresh health data:', err);
    }
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { status: 'excellent', color: 'text-green-600', icon: CheckCircle };
    if (score >= 70) return { status: 'good', color: 'text-yellow-600', icon: Clock };
    return { status: 'poor', color: 'text-red-600', icon: XCircle };
  };

  const healthStatus = getHealthStatus(health.health_score);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Backups</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{health.total_backups}</div>
            <p className="text-xs text-muted-foreground">
              {health.successful_backups} successful
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Health Score</CardTitle>
            <healthStatus.icon className={`h-4 w-4 ${healthStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus.color}`}>
              {health.health_score}%
            </div>
            <p className="text-xs text-muted-foreground capitalize">
              {healthStatus.status} health
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {backupService.formatFileSize(health.storage_used)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total backup size
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{schedules.length}</div>
            <p className="text-xs text-muted-foreground">
              {schedules.filter(s => s.is_enabled).length} enabled
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Alert */}
      {health.failed_backups > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            {health.failed_backups} backup(s) have failed. Check the backup history for details.
          </AlertDescription>
        </Alert>
      )}

      {/* Backup Tabs */}
      <Tabs defaultValue="history" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            Backup History
          </TabsTrigger>
          <TabsTrigger value="scheduler" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Scheduler
          </TabsTrigger>
          <TabsTrigger value="restore" className="flex items-center gap-2">
            <RotateCcw className="h-4 w-4" />
            Restore
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-2">
            <Activity className="h-4 w-4" />
            Health Monitor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="history">
          <BackupHistory
            backupHistory={backupHistory}
            onBackupCreate={handleBackupCreate}
            onBackupDelete={handleBackupDelete}
          />
        </TabsContent>

        <TabsContent value="scheduler">
          <BackupScheduler
            schedules={schedules}
            onScheduleCreate={handleScheduleCreate}
            onScheduleUpdate={handleScheduleUpdate}
            onScheduleDelete={handleScheduleDelete}
          />
        </TabsContent>

        <TabsContent value="restore">
          <RestoreManager
            backupHistory={backupHistory}
            restoreHistory={restoreHistory}
            onRestoreCreate={handleRestoreCreate}
          />
        </TabsContent>

        <TabsContent value="health">
          <BackupHealthMonitor
            health={health}
            onRefresh={refreshHealth}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

'use client';

import { format } from 'date-fns';
import { 
  Activity, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Database,
  HardDrive
} from 'lucide-react';
import { useState } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface BackupHealthMonitorProps {
  health: {
    total_backups: number;
    successful_backups: number;
    failed_backups: number;
    last_backup: string | null;
    next_scheduled: string | null;
    storage_used: number;
    health_score: number;
  };
  onRefresh: () => void;
}

export default function BackupHealthMonitor({
  health,
  onRefresh,
}: BackupHealthMonitorProps) {
  const [loading, setLoading] = useState(false);

  const handleRefresh = async () => {
    setLoading(true);
    await onRefresh();
    setLoading(false);
  };

  const getHealthStatus = (score: number) => {
    if (score >= 90) return { 
      status: 'Excellent', 
      color: 'text-green-600', 
      bgColor: 'bg-green-100',
      icon: CheckCircle 
    };
    if (score >= 70) return { 
      status: 'Good', 
      color: 'text-yellow-600', 
      bgColor: 'bg-yellow-100',
      icon: Clock 
    };
    return { 
      status: 'Poor', 
      color: 'text-red-600', 
      bgColor: 'bg-red-100',
      icon: AlertTriangle 
    };
  };

  const healthStatus = getHealthStatus(health.health_score);
  const successRate = health.total_backups > 0 
    ? Math.round((health.successful_backups / health.total_backups) * 100)
    : 0;

  const formatFileSize = (bytes: number): string => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Backup Health Monitor</h2>
          <p className="text-sm text-muted-foreground">
            Monitor backup system health and performance
          </p>
        </div>
        <Button
          variant="outline"
          onClick={handleRefresh}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Health Status Alert */}
      {health.health_score < 70 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Backup health is below optimal levels. Check failed backups and ensure schedules are running properly.
          </AlertDescription>
        </Alert>
      )}

      {/* Health Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overall Health</CardTitle>
            <healthStatus.icon className={`h-4 w-4 ${healthStatus.color}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${healthStatus.color}`}>
              {health.health_score}%
            </div>
            <p className="text-xs text-muted-foreground">
              {healthStatus.status} health status
            </p>
            <div className="mt-2">
              <Progress value={health.health_score} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {successRate}%
            </div>
            <p className="text-xs text-muted-foreground">
              {health.successful_backups} of {health.total_backups} successful
            </p>
            <div className="mt-2">
              <Progress value={successRate} className="h-2" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Used</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(health.storage_used)}
            </div>
            <p className="text-xs text-muted-foreground">
              Total backup storage
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Backup Statistics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Total Backups</span>
              <Badge variant="outline">{health.total_backups}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Successful</span>
              <Badge variant="default" className="bg-green-600">
                {health.successful_backups}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Failed</span>
              <Badge variant="destructive">
                {health.failed_backups}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Success Rate</span>
              <span className="text-sm font-medium">{successRate}%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Last Backup</span>
              <span className="text-sm text-muted-foreground">
                {health.last_backup 
                  ? format(new Date(health.last_backup), 'MMM dd, HH:mm')
                  : 'Never'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Next Scheduled</span>
              <span className="text-sm text-muted-foreground">
                {health.next_scheduled 
                  ? format(new Date(health.next_scheduled), 'MMM dd, HH:mm')
                  : 'Not scheduled'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Storage Used</span>
              <span className="text-sm text-muted-foreground">
                {formatFileSize(health.storage_used)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Health Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Health Recommendations</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {health.health_score >= 90 && (
              <div className="flex items-start gap-3 p-3 bg-green-50 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-800">Excellent Health</p>
                  <p className="text-xs text-green-700">
                    Your backup system is performing optimally. Continue monitoring regularly.
                  </p>
                </div>
              </div>
            )}

            {health.health_score >= 70 && health.health_score < 90 && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">Good Health</p>
                  <p className="text-xs text-yellow-700">
                    Your backup system is performing well. Monitor failed backups and consider optimizing schedules.
                  </p>
                </div>
              </div>
            )}

            {health.health_score < 70 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Poor Health</p>
                  <p className="text-xs text-red-700">
                    Your backup system needs attention. Check failed backups, verify schedules, and ensure proper storage.
                  </p>
                </div>
              </div>
            )}

            {health.failed_backups > 0 && (
              <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-800">Failed Backups Detected</p>
                  <p className="text-xs text-red-700">
                    {health.failed_backups} backup(s) have failed. Review the backup history for details and fix any issues.
                  </p>
                </div>
              </div>
            )}

            {!health.last_backup && (
              <div className="flex items-start gap-3 p-3 bg-yellow-50 rounded-lg">
                <Clock className="h-5 w-5 text-yellow-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-800">No Recent Backups</p>
                  <p className="text-xs text-yellow-700">
                    No backups have been created recently. Consider setting up automated backup schedules.
                  </p>
                </div>
              </div>
            )}

            {health.storage_used > 1024 * 1024 * 1024 && (
              <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
                <HardDrive className="h-5 w-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800">High Storage Usage</p>
                  <p className="text-xs text-blue-700">
                    Backup storage usage is high ({formatFileSize(health.storage_used)}). Consider cleaning up old backups.
                  </p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      {showQuickActions && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                View All Backups
              </Button>
              <Button variant="outline" size="sm">
                <Clock className="h-4 w-4 mr-2" />
                Manage Schedules
              </Button>
              <Button variant="outline" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Cleanup Old Backups
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

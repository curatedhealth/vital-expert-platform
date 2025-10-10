'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Wrench, 
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  Users
} from 'lucide-react';

interface MaintenanceModeProps {
  isMaintenanceMode: boolean;
  onMaintenanceModeToggle: (enabled: boolean, reason?: string) => void;
  loading: boolean;
}

export default function MaintenanceMode({
  isMaintenanceMode,
  onMaintenanceModeToggle,
  loading,
}: MaintenanceModeProps) {
  const [reason, setReason] = useState('');
  const [showReasonInput, setShowReasonInput] = useState(false);

  const handleToggleMaintenance = () => {
    if (isMaintenanceMode) {
      onMaintenanceModeToggle(false);
    } else {
      if (showReasonInput && reason.trim()) {
        onMaintenanceModeToggle(true, reason.trim());
        setReason('');
        setShowReasonInput(false);
      } else {
        onMaintenanceModeToggle(true);
      }
    }
  };

  const handleEnableWithReason = () => {
    setShowReasonInput(true);
  };

  const handleCancelReason = () => {
    setShowReasonInput(false);
    setReason('');
  };

  const handleSubmitReason = () => {
    if (reason.trim()) {
      onMaintenanceModeToggle(true, reason.trim());
      setReason('');
      setShowReasonInput(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wrench className="h-5 w-5" />
            Maintenance Mode Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {isMaintenanceMode ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
                <span className="text-lg font-medium">
                  {isMaintenanceMode ? 'Maintenance Mode Active' : 'System Operational'}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {isMaintenanceMode 
                  ? 'The system is currently in maintenance mode. Users will see a maintenance page.'
                  : 'The system is running normally. All users can access the platform.'
                }
              </p>
            </div>
            <Badge variant={isMaintenanceMode ? 'destructive' : 'default'} className="text-lg px-3 py-1">
              {isMaintenanceMode ? 'OFFLINE' : 'ONLINE'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Maintenance Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Controls</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isMaintenanceMode ? (
              <div className="space-y-4">
                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Enabling maintenance mode will prevent users from accessing the system. 
                    Only administrators will be able to access the platform.
                  </AlertDescription>
                </Alert>

                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleToggleMaintenance}
                    disabled={loading}
                    variant="destructive"
                  >
                    <Wrench className="h-4 w-4 mr-2" />
                    {loading ? 'Enabling...' : 'Enable Maintenance Mode'}
                  </Button>
                  
                  <Button
                    onClick={handleEnableWithReason}
                    disabled={loading}
                    variant="outline"
                  >
                    Enable with Message
                  </Button>
                </div>

                {showReasonInput && (
                  <div className="space-y-3 p-4 border rounded-lg bg-muted/50">
                    <Label htmlFor="reason">Maintenance Message</Label>
                    <Textarea
                      id="reason"
                      placeholder="Enter a message to display to users during maintenance..."
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      rows={3}
                    />
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSubmitReason}
                        disabled={loading || !reason.trim()}
                        size="sm"
                      >
                        Enable with Message
                      </Button>
                      <Button
                        onClick={handleCancelReason}
                        variant="outline"
                        size="sm"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <Alert>
                  <CheckCircle className="h-4 w-4" />
                  <AlertDescription>
                    Maintenance mode is currently active. Users cannot access the system.
                  </AlertDescription>
                </Alert>

                <Button
                  onClick={handleToggleMaintenance}
                  disabled={loading}
                  variant="default"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {loading ? 'Disabling...' : 'Disable Maintenance Mode'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Maintenance Information */}
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium">User Access</p>
                <p className="text-xs text-muted-foreground">
                  {isMaintenanceMode ? 'Blocked' : 'Allowed'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium">System Status</p>
                <p className="text-xs text-muted-foreground">
                  {isMaintenanceMode ? 'Maintenance' : 'Operational'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">Admin Access</p>
                <p className="text-xs text-muted-foreground">Always Allowed</p>
              </div>
            </div>
          </div>

          <div className="text-sm text-muted-foreground">
            <p>
              <strong>Note:</strong> When maintenance mode is enabled:
            </p>
            <ul className="list-disc list-inside mt-2 space-y-1">
              <li>Regular users will see a maintenance page</li>
              <li>Administrators can still access the admin dashboard</li>
              <li>API endpoints will return maintenance status</li>
              <li>Background jobs may continue running</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Recent Maintenance History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Maintenance History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            <p>Maintenance history is tracked in the audit logs.</p>
            <p className="mt-2">
              You can view detailed maintenance logs in the{' '}
              <a href="/admin/audit-logs" className="text-blue-600 hover:underline">
                Audit Logs
              </a>{' '}
              section.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

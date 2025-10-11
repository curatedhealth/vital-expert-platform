'use client';

import { useState } from 'react';
import { BackupRecoveryService, BackupSchedule } from '@/services/backup-recovery.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Clock, 
  AlertTriangle,
  Eye,
  Play,
  Pause
} from 'lucide-react';
import { format } from 'date-fns';

interface BackupSchedulerProps {
  schedules: BackupSchedule[];
  onScheduleCreate: (schedule: BackupSchedule) => void;
  onScheduleUpdate: (schedule: BackupSchedule) => void;
  onScheduleDelete: (scheduleId: string) => void;
}

export default function BackupScheduler({
  schedules,
  onScheduleCreate,
  onScheduleUpdate,
  onScheduleDelete,
}: BackupSchedulerProps) {
  const [selectedSchedule, setSelectedSchedule] = useState<BackupSchedule | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backupService = new BackupRecoveryService();

  const getTypeBadge = (type: string) => {
    const variants = {
      full: 'default',
      incremental: 'secondary',
      differential: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  };

  const getStatusBadge = (isEnabled: boolean) => {
    return (
      <Badge variant={isEnabled ? 'default' : 'secondary'}>
        {isEnabled ? 'Enabled' : 'Disabled'}
      </Badge>
    );
  };

  const handleCreateSchedule = async (scheduleData: Omit<BackupSchedule, 'id' | 'created_at' | 'created_by'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newSchedule = await backupService.createBackupSchedule(scheduleData);
      onScheduleCreate(newSchedule);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSchedule = async (scheduleId: string, updates: Partial<BackupSchedule>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSchedule = await backupService.updateBackupSchedule(scheduleId, updates);
      onScheduleUpdate(updatedSchedule);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update backup schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSchedule = async (scheduleId: string) => {
    if (!confirm('Are you sure you want to delete this backup schedule? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await backupService.deleteBackupSchedule(scheduleId);
      onScheduleDelete(scheduleId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backup schedule');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleSchedule = async (scheduleId: string, enabled: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSchedule = await backupService.toggleBackupSchedule(scheduleId, enabled);
      onScheduleUpdate(updatedSchedule);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle backup schedule');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">Backup Scheduler</h2>
          <p className="text-sm text-muted-foreground">
            Manage automated backup schedules
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Schedule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Backup Schedule</DialogTitle>
              <DialogDescription>
                Set up an automated backup schedule
              </DialogDescription>
            </DialogHeader>
            <CreateScheduleForm
              onSubmit={handleCreateSchedule}
              onCancel={() => setIsCreateDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Schedules Table */}
      <Card>
        <CardContent className="p-0">
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No backup schedules found. Create your first schedule to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Schedule</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Last Run</TableHead>
                    <TableHead>Next Run</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.map((schedule) => (
                    <TableRow key={schedule.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{schedule.name}</div>
                          <div className="text-xs text-muted-foreground">
                            Retention: {schedule.retention_days} days
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {getTypeBadge(schedule.backup_type)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {schedule.cron_expression}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(schedule.is_enabled)}
                          <Switch
                            checked={schedule.is_enabled}
                            onCheckedChange={(enabled) => handleToggleSchedule(schedule.id, enabled)}
                            disabled={loading}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {schedule.last_run_at 
                            ? format(new Date(schedule.last_run_at), 'MMM dd, HH:mm')
                            : 'Never'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {schedule.next_run_at 
                            ? format(new Date(schedule.next_run_at), 'MMM dd, HH:mm')
                            : 'Not scheduled'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedSchedule(schedule)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Clock className="h-5 w-5" />
                                  {schedule.name}
                                </DialogTitle>
                                <DialogDescription>
                                  Backup schedule details
                                </DialogDescription>
                              </DialogHeader>
                              <ScheduleDetails schedule={schedule} />
                            </DialogContent>
                          </Dialog>

                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedSchedule(schedule);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteSchedule(schedule.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      {selectedSchedule && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Backup Schedule</DialogTitle>
              <DialogDescription>
                Update schedule settings and configuration
              </DialogDescription>
            </DialogHeader>
            <EditScheduleForm
              schedule={selectedSchedule}
              onSubmit={(updates) => handleUpdateSchedule(selectedSchedule.id, updates)}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Schedule Form Component
interface CreateScheduleFormProps {
  onSubmit: (data: Omit<BackupSchedule, 'id' | 'created_at' | 'created_by'>) => void;
  onCancel: () => void;
  loading: boolean;
}

function CreateScheduleForm({ onSubmit, onCancel, loading }: CreateScheduleFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    backup_type: 'full' as 'full' | 'incremental' | 'differential',
    cron_expression: '0 2 * * *', // Daily at 2 AM
    retention_days: 90,
    is_enabled: true
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const cronPresets = [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at 2 AM', value: '0 2 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Weekly on Sunday', value: '0 0 * * 0' },
    { label: 'Monthly on 1st', value: '0 0 1 * *' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Schedule Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
          placeholder="e.g., Daily Full Backup"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="backup_type">Backup Type</Label>
          <Select
            value={formData.backup_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, backup_type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Backup</SelectItem>
              <SelectItem value="incremental">Incremental Backup</SelectItem>
              <SelectItem value="differential">Differential Backup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retention_days">Retention (Days)</Label>
          <Input
            id="retention_days"
            type="number"
            min="1"
            max="365"
            value={formData.retention_days}
            onChange={(e) => setFormData(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 90 }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cron_expression">Cron Expression</Label>
        <div className="space-y-2">
          <Input
            id="cron_expression"
            value={formData.cron_expression}
            onChange={(e) => setFormData(prev => ({ ...prev, cron_expression: e.target.value }))}
            required
            placeholder="0 2 * * *"
            className="font-mono"
          />
          <div className="text-xs text-muted-foreground">
            Format: minute hour day month weekday
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {cronPresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, cron_expression: preset.value }))}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_enabled"
          checked={formData.is_enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
        />
        <Label htmlFor="is_enabled">Enabled</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name}>
          {loading ? 'Creating...' : 'Create Schedule'}
        </Button>
      </div>
    </form>
  );
}

// Edit Schedule Form Component
interface EditScheduleFormProps {
  schedule: BackupSchedule;
  onSubmit: (updates: Partial<BackupSchedule>) => void;
  onCancel: () => void;
  loading: boolean;
}

function EditScheduleForm({ schedule, onSubmit, onCancel, loading }: EditScheduleFormProps) {
  const [formData, setFormData] = useState({
    name: schedule.name,
    backup_type: schedule.backup_type,
    cron_expression: schedule.cron_expression,
    retention_days: schedule.retention_days,
    is_enabled: schedule.is_enabled
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const cronPresets = [
    { label: 'Every hour', value: '0 * * * *' },
    { label: 'Daily at 2 AM', value: '0 2 * * *' },
    { label: 'Daily at midnight', value: '0 0 * * *' },
    { label: 'Weekly on Sunday', value: '0 0 * * 0' },
    { label: 'Monthly on 1st', value: '0 0 1 * *' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Schedule Name</Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="backup_type">Backup Type</Label>
          <Select
            value={formData.backup_type}
            onValueChange={(value) => setFormData(prev => ({ ...prev, backup_type: value as any }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="full">Full Backup</SelectItem>
              <SelectItem value="incremental">Incremental Backup</SelectItem>
              <SelectItem value="differential">Differential Backup</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="retention_days">Retention (Days)</Label>
          <Input
            id="retention_days"
            type="number"
            min="1"
            max="365"
            value={formData.retention_days}
            onChange={(e) => setFormData(prev => ({ ...prev, retention_days: parseInt(e.target.value) || 90 }))}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="cron_expression">Cron Expression</Label>
        <div className="space-y-2">
          <Input
            id="cron_expression"
            value={formData.cron_expression}
            onChange={(e) => setFormData(prev => ({ ...prev, cron_expression: e.target.value }))}
            required
            className="font-mono"
          />
          <div className="text-xs text-muted-foreground">
            Format: minute hour day month weekday
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Quick Presets</Label>
        <div className="flex flex-wrap gap-2">
          {cronPresets.map((preset) => (
            <Button
              key={preset.value}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setFormData(prev => ({ ...prev, cron_expression: preset.value }))}
            >
              {preset.label}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <Switch
          id="is_enabled"
          checked={formData.is_enabled}
          onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_enabled: checked }))}
        />
        <Label htmlFor="is_enabled">Enabled</Label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Schedule'}
        </Button>
      </div>
    </form>
  );
}

// Schedule Details Component
interface ScheduleDetailsProps {
  schedule: BackupSchedule;
}

function ScheduleDetails({ schedule }: ScheduleDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Backup Type</label>
          <p className="text-sm text-muted-foreground capitalize">{schedule.backup_type}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {schedule.is_enabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Retention</label>
          <p className="text-sm text-muted-foreground">{schedule.retention_days} days</p>
        </div>
        <div>
          <label className="text-sm font-medium">Created</label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(schedule.created_at), 'PPpp')}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Cron Expression</label>
        <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
          {schedule.cron_expression}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Last Run</label>
          <p className="text-sm text-muted-foreground">
            {schedule.last_run_at 
              ? format(new Date(schedule.last_run_at), 'PPpp')
              : 'Never'
            }
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Next Run</label>
          <p className="text-sm text-muted-foreground">
            {schedule.next_run_at 
              ? format(new Date(schedule.next_run_at), 'PPpp')
              : 'Not scheduled'
            }
          </p>
        </div>
      </div>
    </div>
  );
}

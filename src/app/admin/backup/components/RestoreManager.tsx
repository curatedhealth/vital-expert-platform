'use client';

import { useState } from 'react';
import { BackupRecoveryService, BackupMetadata, RestoreOperation } from '@/services/backup-recovery.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  RotateCcw, 
  AlertTriangle,
  Eye,
  Clock,
  CheckCircle,
  XCircle,
  Database
} from 'lucide-react';
import { format } from 'date-fns';

interface RestoreManagerProps {
  backupHistory: BackupMetadata[];
  restoreHistory: RestoreOperation[];
  onRestoreCreate: (restore: RestoreOperation) => void;
}

export default function RestoreManager({
  backupHistory,
  restoreHistory,
  onRestoreCreate,
}: RestoreManagerProps) {
  const [selectedRestore, setSelectedRestore] = useState<RestoreOperation | null>(null);
  const [isRestoreDialogOpen, setIsRestoreDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const backupService = new BackupRecoveryService();

  const getStatusBadge = (status: string) => {
    const variants = {
      pending: 'secondary',
      in_progress: 'default',
      completed: 'default',
      failed: 'destructive'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.replace('_', ' ')}
      </Badge>
    );
  };

  const getTypeBadge = (type: string) => {
    const variants = {
      full: 'default',
      partial: 'secondary',
      point_in_time: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type.replace('_', ' ')}
      </Badge>
    );
  };

  const handleStartRestore = async (
    backupId: string, 
    restoreType: 'full' | 'partial' | 'point_in_time', 
    tables?: string[]
  ) => {
    setLoading(true);
    setError(null);
    
    try {
      const newRestore = await backupService.startRestore(backupId, restoreType, tables);
      onRestoreCreate(newRestore);
      setIsRestoreDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start restore operation');
    } finally {
      setLoading(false);
    }
  };

  // Filter completed backups for restore options
  const availableBackups = backupHistory.filter(backup => backup.status === 'completed');

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
          <h2 className="text-lg font-medium text-gray-900">Restore Operations</h2>
          <p className="text-sm text-muted-foreground">
            Restore database from backup files
          </p>
        </div>
        <Dialog open={isRestoreDialogOpen} onOpenChange={setIsRestoreDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <RotateCcw className="h-4 w-4 mr-2" />
              Start Restore
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Start Restore Operation</DialogTitle>
              <DialogDescription>
                Restore database from a backup file
              </DialogDescription>
            </DialogHeader>
            <StartRestoreForm
              availableBackups={availableBackups}
              onSubmit={handleStartRestore}
              onCancel={() => setIsRestoreDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {availableBackups.length === 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            No completed backups available for restore operations.
          </AlertDescription>
        </Alert>
      )}

      {/* Restore History Table */}
      <Card>
        <CardHeader>
          <CardTitle>Restore History</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {restoreHistory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No restore operations found.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Backup</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Started</TableHead>
                    <TableHead>Completed</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {restoreHistory.map((restore) => (
                    <TableRow key={restore.id}>
                      <TableCell>
                        {getTypeBadge(restore.restore_type)}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(restore.status)}
                          {restore.status === 'in_progress' && (
                            <div className="animate-spin">
                              <Clock className="h-3 w-3" />
                            </div>
                          )}
                          {restore.status === 'completed' && (
                            <CheckCircle className="h-3 w-3 text-green-600" />
                          )}
                          {restore.status === 'failed' && (
                            <XCircle className="h-3 w-3 text-red-600" />
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {backupHistory.find(b => b.id === restore.backup_id)?.backup_type || 'Unknown'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {restore.restore_duration_seconds 
                            ? `${restore.restore_duration_seconds}s`
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {format(new Date(restore.started_at), 'MMM dd, HH:mm')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {restore.completed_at 
                            ? format(new Date(restore.completed_at), 'MMM dd, HH:mm')
                            : 'In progress'
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
                                onClick={() => setSelectedRestore(restore)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <RotateCcw className="h-5 w-5" />
                                  Restore Details
                                </DialogTitle>
                                <DialogDescription>
                                  {restore.restore_type} restore started on {format(new Date(restore.started_at), 'PPpp')}
                                </DialogDescription>
                              </DialogHeader>
                              <RestoreDetails 
                                restore={restore} 
                                backup={backupHistory.find(b => b.id === restore.backup_id)}
                              />
                            </DialogContent>
                          </Dialog>
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
    </div>
  );
}

// Start Restore Form Component
interface StartRestoreFormProps {
  availableBackups: BackupMetadata[];
  onSubmit: (backupId: string, restoreType: 'full' | 'partial' | 'point_in_time', tables?: string[]) => void;
  onCancel: () => void;
  loading: boolean;
}

function StartRestoreForm({ availableBackups, onSubmit, onCancel, loading }: StartRestoreFormProps) {
  const [formData, setFormData] = useState({
    backupId: '',
    restoreType: 'full' as 'full' | 'partial' | 'point_in_time',
    tables: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData.backupId, formData.restoreType, formData.tables.length > 0 ? formData.tables : undefined);
  };

  const selectedBackup = availableBackups.find(b => b.id === formData.backupId);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="backupId">Select Backup</Label>
        <Select
          value={formData.backupId}
          onValueChange={(value) => setFormData(prev => ({ ...prev, backupId: value }))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Choose a backup to restore from..." />
          </SelectTrigger>
          <SelectContent>
            {availableBackups.map((backup) => (
              <SelectItem key={backup.id} value={backup.id}>
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  <span>
                    {backup.backup_type} - {format(new Date(backup.created_at), 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {selectedBackup && (
        <div className="p-3 bg-muted rounded-lg">
          <div className="text-sm font-medium">Selected Backup Details</div>
          <div className="text-xs text-muted-foreground mt-1">
            Type: {selectedBackup.backup_type} | 
            Size: {selectedBackup.file_size ? `${(selectedBackup.file_size / 1024 / 1024).toFixed(2)} MB` : 'Unknown'} | 
            Created: {format(new Date(selectedBackup.created_at), 'PPpp')}
          </div>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="restoreType">Restore Type</Label>
        <Select
          value={formData.restoreType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, restoreType: value as any }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="full">Full Restore</SelectItem>
            <SelectItem value="partial">Partial Restore</SelectItem>
            <SelectItem value="point_in_time">Point-in-Time Restore</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {formData.restoreType === 'partial' && (
        <div className="space-y-2">
          <Label htmlFor="tables">Specific Tables (Optional)</Label>
          <Input
            id="tables"
            value={formData.tables.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              tables: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
            }))}
            placeholder="table1, table2, table3 (leave empty for all tables)"
          />
          <p className="text-xs text-muted-foreground">
            Comma-separated list of table names. Leave empty to restore all tables.
          </p>
        </div>
      )}

      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Warning:</strong> Restore operations will overwrite existing data. 
          Make sure you have a current backup before proceeding.
        </AlertDescription>
      </Alert>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          type="submit" 
          disabled={loading || !formData.backupId}
          variant="destructive"
        >
          {loading ? 'Starting...' : 'Start Restore'}
        </Button>
      </div>
    </form>
  );
}

// Restore Details Component
interface RestoreDetailsProps {
  restore: RestoreOperation;
  backup?: BackupMetadata;
}

function RestoreDetails({ restore, backup }: RestoreDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Restore Type</label>
          <p className="text-sm text-muted-foreground capitalize">{restore.restore_type.replace('_', ' ')}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground capitalize">{restore.status}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Duration</label>
          <p className="text-sm text-muted-foreground">
            {restore.restore_duration_seconds ? `${restore.restore_duration_seconds} seconds` : 'N/A'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Started</label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(restore.started_at), 'PPpp')}
          </p>
        </div>
      </div>

      {backup && (
        <div>
          <label className="text-sm font-medium">Source Backup</label>
          <div className="text-sm text-muted-foreground mt-1">
            <div>Type: {backup.backup_type}</div>
            <div>Created: {format(new Date(backup.created_at), 'PPpp')}</div>
            <div>Location: {backup.backup_location}</div>
          </div>
        </div>
      )}

      {restore.tables_restored.length > 0 && (
        <div>
          <label className="text-sm font-medium">Tables Restored</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {restore.tables_restored.map((table, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {table}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {restore.error_message && (
        <div>
          <label className="text-sm font-medium text-red-600">Error Message</label>
          <p className="text-sm text-red-600 bg-red-50 p-2 rounded mt-1">
            {restore.error_message}
          </p>
        </div>
      )}

      {Object.keys(restore.metadata).length > 0 && (
        <div>
          <label className="text-sm font-medium">Metadata</label>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(restore.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

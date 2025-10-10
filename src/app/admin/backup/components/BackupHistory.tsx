'use client';

import { useState } from 'react';
import { BackupRecoveryService, BackupMetadata } from '@/services/backup-recovery.service';
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
  Plus, 
  Trash2, 
  Database, 
  AlertTriangle,
  Eye,
  Download,
  Calendar,
  Clock
} from 'lucide-react';
import { format } from 'date-fns';

interface BackupHistoryProps {
  backupHistory: BackupMetadata[];
  onBackupCreate: (backup: BackupMetadata) => void;
  onBackupDelete: (backupId: string) => void;
  isSuperAdmin: boolean;
}

export default function BackupHistory({
  backupHistory,
  onBackupCreate,
  onBackupDelete,
  isSuperAdmin
}: BackupHistoryProps) {
  const [selectedBackup, setSelectedBackup] = useState<BackupMetadata | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterType, setFilterType] = useState<string>('all');

  const backupService = new BackupRecoveryService();

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: 'default',
      in_progress: 'secondary',
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
      incremental: 'secondary',
      differential: 'outline'
    } as const;

    return (
      <Badge variant={variants[type as keyof typeof variants] || 'outline'}>
        {type}
      </Badge>
    );
  };

  const handleCreateBackup = async (backupType: 'full' | 'incremental' | 'differential', tables?: string[]) => {
    setLoading(true);
    setError(null);
    
    try {
      const newBackup = await backupService.triggerBackup(backupType, tables);
      onBackupCreate(newBackup);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create backup');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackup = async (backupId: string) => {
    if (!confirm('Are you sure you want to delete this backup? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await backupService.deleteBackup(backupId);
      onBackupDelete(backupId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete backup');
    } finally {
      setLoading(false);
    }
  };

  // Filter backups based on search, status, and type
  const filteredBackups = backupHistory.filter(backup => {
    const matchesSearch = backup.backup_location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || backup.status === filterStatus;
    const matchesType = filterType === 'all' || backup.backup_type === filterType;
    return matchesSearch && matchesStatus && matchesType;
  });

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
          <h2 className="text-lg font-medium text-gray-900">Backup History</h2>
          <p className="text-sm text-muted-foreground">
            View and manage database backups
          </p>
        </div>
        {isSuperAdmin && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Backup</DialogTitle>
                <DialogDescription>
                  Trigger a manual database backup
                </DialogDescription>
              </DialogHeader>
              <CreateBackupForm
                onSubmit={handleCreateBackup}
                onCancel={() => setIsCreateDialogOpen(false)}
                loading={loading}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search backups..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="full">Full</SelectItem>
            <SelectItem value="incremental">Incremental</SelectItem>
            <SelectItem value="differential">Differential</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Backups Table */}
      <Card>
        <CardContent className="p-0">
          {filteredBackups.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterStatus !== 'all' || filterType !== 'all'
                ? 'No backups match your filters.' 
                : 'No backups found. Create your first backup to get started.'
              }
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBackups.map((backup) => (
                    <TableRow key={backup.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4" />
                            {getTypeBadge(backup.backup_type)}
                          </div>
                          {backup.tables_backed_up.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {backup.tables_backed_up.length} tables
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(backup.status)}
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {backup.file_size ? backupService.formatFileSize(backup.file_size) : 'N/A'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {backup.backup_duration_seconds 
                            ? `${backup.backup_duration_seconds}s`
                            : 'N/A'
                          }
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {format(new Date(backup.created_at), 'MMM dd, yyyy')}
                          </div>
                          <div className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {format(new Date(backup.created_at), 'HH:mm:ss')}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {backup.expires_at 
                            ? format(new Date(backup.expires_at), 'MMM dd, yyyy')
                            : 'Never'
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
                                onClick={() => setSelectedBackup(backup)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Database className="h-5 w-5" />
                                  Backup Details
                                </DialogTitle>
                                <DialogDescription>
                                  {backup.backup_type} backup created on {format(new Date(backup.created_at), 'PPpp')}
                                </DialogDescription>
                              </DialogHeader>
                              <BackupDetails backup={backup} />
                            </DialogContent>
                          </Dialog>

                          {isSuperAdmin && backup.status === 'completed' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // TODO: Implement download functionality
                                console.log('Download backup:', backup.id);
                              }}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                          )}

                          {isSuperAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteBackup(backup.id)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
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

// Create Backup Form Component
interface CreateBackupFormProps {
  onSubmit: (backupType: 'full' | 'incremental' | 'differential', tables?: string[]) => void;
  onCancel: () => void;
  loading: boolean;
}

function CreateBackupForm({ onSubmit, onCancel, loading }: CreateBackupFormProps) {
  const [formData, setFormData] = useState({
    backupType: 'full' as 'full' | 'incremental' | 'differential',
    tables: [] as string[]
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData.backupType, formData.tables.length > 0 ? formData.tables : undefined);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="backupType">Backup Type</Label>
        <Select
          value={formData.backupType}
          onValueChange={(value) => setFormData(prev => ({ ...prev, backupType: value as any }))}
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
          Comma-separated list of table names. Leave empty to backup all tables.
        </p>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Backup'}
        </Button>
      </div>
    </form>
  );
}

// Backup Details Component
interface BackupDetailsProps {
  backup: BackupMetadata;
}

function BackupDetails({ backup }: BackupDetailsProps) {
  const backupService = new BackupRecoveryService();

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Backup Type</label>
          <p className="text-sm text-muted-foreground capitalize">{backup.backup_type}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground capitalize">{backup.status}</p>
        </div>
        <div>
          <label className="text-sm font-medium">File Size</label>
          <p className="text-sm text-muted-foreground">
            {backup.file_size ? backupService.formatFileSize(backup.file_size) : 'N/A'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Duration</label>
          <p className="text-sm text-muted-foreground">
            {backup.backup_duration_seconds ? `${backup.backup_duration_seconds} seconds` : 'N/A'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Retention</label>
          <p className="text-sm text-muted-foreground">{backup.retention_days} days</p>
        </div>
        <div>
          <label className="text-sm font-medium">Expires</label>
          <p className="text-sm text-muted-foreground">
            {backup.expires_at ? format(new Date(backup.expires_at), 'PPpp') : 'Never'}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Backup Location</label>
        <p className="text-sm text-muted-foreground font-mono bg-muted p-2 rounded mt-1">
          {backup.backup_location}
        </p>
      </div>

      {backup.tables_backed_up.length > 0 && (
        <div>
          <label className="text-sm font-medium">Tables Backed Up</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {backup.tables_backed_up.map((table, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {table}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Object.keys(backup.metadata).length > 0 && (
        <div>
          <label className="text-sm font-medium">Metadata</label>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(backup.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

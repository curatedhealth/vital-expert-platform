'use client';

import { useState } from 'react';
import { ImmutableAuditService, WORMConfig } from '@/services/immutable-audit.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Plus, 
  Edit, 
  Database, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Eye,
  Trash2,
  Shield
} from 'lucide-react';
import { format } from 'date-fns';

interface WORMConfigManagementProps {
  wormConfigs: WORMConfig[];
  onWORMConfigUpdate: (config: WORMConfig) => void;
  onWORMConfigCreate: (config: WORMConfig) => void;
}

export default function WORMConfigManagement({
  wormConfigs,
  onWORMConfigUpdate,
  onWORMConfigCreate,
}: WORMConfigManagementProps) {
  const [selectedConfig, setSelectedConfig] = useState<WORMConfig | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditService = new ImmutableAuditService();

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? 
      <CheckCircle className="h-4 w-4 text-green-500" /> : 
      <Clock className="h-4 w-4 text-gray-500" />;
  };

  const getStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'outline'}>
        {isActive ? 'Active' : 'Inactive'}
      </Badge>
    );
  };

  const getRetentionBadge = (days: number) => {
    if (days >= 365) return <Badge variant="destructive">Long-term</Badge>;
    if (days >= 90) return <Badge variant="secondary">Medium-term</Badge>;
    return <Badge variant="outline">Short-term</Badge>;
  };

  const handleCreateConfig = async (configData: Omit<WORMConfig, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const { user } = await auditService.getCurrentUser();
      // This would call a create method in the service
      // For now, create a mock config
      const newConfig: WORMConfig = {
        id: `worm-${Date.now()}`,
        name: configData.name,
        retentionPeriod: configData.retentionPeriod,
        isActive: configData.isActive,
        encryptionKey: configData.encryptionKey,
        storageLocation: configData.storageLocation,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      onWORMConfigCreate(newConfig);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create WORM config');
    }
  };

  const handleToggleConfig = async (configId: string, isActive: boolean) => {
    try {
      // This would call an update method in the service
      // For now, just update the local state
      const updatedConfig = wormConfigs.find(c => c.id === configId);
      if (updatedConfig) {
        updatedConfig.isActive = isActive;
        onWORMConfigUpdate(updatedConfig);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle WORM config');
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
          <h2 className="text-lg font-medium text-gray-900">WORM Storage Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Configure Write-Once-Read-Many storage for immutable audit logs
          </p>
        </div>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add WORM Config
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Add WORM Configuration</DialogTitle>
                <DialogDescription>
                  Configure immutable storage for audit logs
                </DialogDescription>
              </DialogHeader>
              <CreateWORMConfigForm
                onSubmit={handleCreateConfig}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Configs Table */}
      <Card>
        <CardContent className="p-0">
          {wormConfigs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No WORM configurations found. Add your first configuration to enable immutable storage.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Configuration</TableHead>
                    <TableHead>Retention</TableHead>
                    <TableHead>Storage Location</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wormConfigs.map((config) => (
                    <TableRow key={config.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            {getStatusIcon(config.isActive)}
                            {config.name}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ID: {config.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="text-sm">
                            {config.retentionPeriod} days
                          </div>
                          {getRetentionBadge(config.retentionPeriod)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm font-mono">
                          {config.storageLocation}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(config.isActive)}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleToggleConfig(config.id, !config.isActive)}
                            >
                              {config.isActive ? 'Deactivate' : 'Activate'}
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(config.updatedAt, 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedConfig(config)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  {getStatusIcon(config.isActive)}
                                  {config.name}
                                </DialogTitle>
                                <DialogDescription>
                                  WORM Storage Configuration
                                </DialogDescription>
                              </DialogHeader>
                              <ScrollArea className="max-h-[600px]">
                                <WORMConfigDetails config={config} />
                              </ScrollArea>
                            </DialogContent>
                          </Dialog>

                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedConfig(config);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  // TODO: Implement delete
                                  console.log('Delete config:', config.id);
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </>
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

interface WORMConfigDetailsProps {
  config: WORMConfig;
}

function WORMConfigDetails({ config }: WORMConfigDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {config.isActive ? 'Active' : 'Inactive'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Retention Period</label>
          <p className="text-sm text-muted-foreground">
            {config.retentionPeriod} days
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Storage Location</label>
          <p className="text-sm text-muted-foreground font-mono">
            {config.storageLocation}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Encryption Key</label>
          <p className="text-sm text-muted-foreground font-mono">
            {config.encryptionKey.slice(0, 16)}...
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Created At</label>
          <p className="text-sm text-muted-foreground">
            {format(config.createdAt, 'PPpp')}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Updated At</label>
          <p className="text-sm text-muted-foreground">
            {format(config.updatedAt, 'PPpp')}
          </p>
        </div>
      </div>

      <div className="bg-muted p-4 rounded-lg">
        <div className="flex items-center gap-2 mb-2">
          <Shield className="h-4 w-4 text-green-500" />
          <span className="text-sm font-medium">WORM Compliance</span>
        </div>
        <div className="text-sm text-muted-foreground">
          This configuration ensures audit logs are stored in a Write-Once-Read-Many format,
          preventing modification or deletion for the specified retention period.
        </div>
      </div>
    </div>
  );
}

interface CreateWORMConfigFormProps {
  onSubmit: (data: Omit<WORMConfig, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

function CreateWORMConfigForm({ onSubmit, onCancel }: CreateWORMConfigFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    retentionPeriod: 2555, // 7 years in days
    isActive: true,
    encryptionKey: '',
    storageLocation: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Configuration Name</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.name}
          onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Retention Period (days)</label>
        <input
          type="number"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.retentionPeriod}
          onChange={(e) => setFormData(prev => ({ ...prev, retentionPeriod: parseInt(e.target.value) || 2555 }))}
          min="1"
          max="3650"
        />
        <p className="text-xs text-muted-foreground">
          Recommended: 2555 days (7 years) for compliance
        </p>
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Storage Location</label>
        <input
          type="text"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.storageLocation}
          onChange={(e) => setFormData(prev => ({ ...prev, storageLocation: e.target.value }))}
          placeholder="s3://audit-logs-worm/ or /secure/audit-storage/"
          required
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium">Encryption Key</label>
        <input
          type="password"
          className="w-full px-3 py-2 border rounded-md"
          value={formData.encryptionKey}
          onChange={(e) => setFormData(prev => ({ ...prev, encryptionKey: e.target.value }))}
          placeholder="Enter encryption key for WORM storage"
          required
        />
        <p className="text-xs text-muted-foreground">
          This key will be used to encrypt data before storing in WORM format
        </p>
      </div>

      <div className="flex items-center space-x-2">
        <input
          type="checkbox"
          id="isActive"
          checked={formData.isActive}
          onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
        />
        <label htmlFor="isActive" className="text-sm font-medium">
          Active
        </label>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.name || !formData.storageLocation || !formData.encryptionKey}>
          Create Configuration
        </Button>
      </div>
    </form>
  );
}

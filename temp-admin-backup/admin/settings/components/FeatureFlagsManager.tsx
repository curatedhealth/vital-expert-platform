'use client';

import { useState } from 'react';
import { SystemSettingsService, FeatureFlag } from '@/services/system-settings.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Flag, 
  AlertTriangle,
  Eye,
  EyeOff
} from 'lucide-react';
import { format } from 'date-fns';

interface FeatureFlagsManagerProps {
  featureFlags: FeatureFlag[];
  onFeatureFlagUpdate: (flag: FeatureFlag) => void;
  onFeatureFlagCreate: (flag: FeatureFlag) => void;
  onFeatureFlagDelete: (flagId: string) => void;
}

export default function FeatureFlagsManager({
  featureFlags,
  onFeatureFlagUpdate,
  onFeatureFlagCreate,
  onFeatureFlagDelete,
}: FeatureFlagsManagerProps) {
  const [selectedFlag, setSelectedFlag] = useState<FeatureFlag | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEnabled, setFilterEnabled] = useState<string>('all');

  const systemSettingsService = new SystemSettingsService();

  const getStatusBadge = (enabled: boolean) => {
    return (
      <Badge variant={enabled ? 'default' : 'secondary'}>
        {enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    );
  };

  const getEnvironmentBadge = (environment: string) => {
    const variants = {
      all: 'default',
      dev: 'secondary',
      staging: 'outline',
      prod: 'destructive'
    } as const;

    return (
      <Badge variant={variants[environment as keyof typeof variants] || 'outline'}>
        {environment}
      </Badge>
    );
  };

  const handleToggleFlag = async (flagId: string, enabled: boolean) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFlag = await systemSettingsService.toggleFeatureFlag(flagId, enabled);
      onFeatureFlagUpdate(updatedFlag);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to toggle feature flag');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFlag = async (flagData: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => {
    setLoading(true);
    setError(null);
    
    try {
      const newFlag = await systemSettingsService.createFeatureFlag(flagData);
      onFeatureFlagCreate(newFlag);
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create feature flag');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateFlag = async (flagId: string, updates: Partial<FeatureFlag>) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedFlag = await systemSettingsService.updateFeatureFlag(flagId, updates);
      onFeatureFlagUpdate(updatedFlag);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update feature flag');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFlag = async (flagId: string) => {
    if (!confirm('Are you sure you want to delete this feature flag? This action cannot be undone.')) {
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await systemSettingsService.deleteFeatureFlag(flagId);
      onFeatureFlagDelete(flagId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete feature flag');
    } finally {
      setLoading(false);
    }
  };

  // Filter flags based on search and enabled status
  const filteredFlags = featureFlags.filter(flag => {
    const matchesSearch = flag.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         flag.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesEnabled = filterEnabled === 'all' || 
                          (filterEnabled === 'enabled' && flag.enabled) ||
                          (filterEnabled === 'disabled' && !flag.enabled);
    return matchesSearch && matchesEnabled;
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
          <h2 className="text-lg font-medium text-gray-900">Feature Flags</h2>
          <p className="text-sm text-muted-foreground">
            Manage feature flags and rollout controls
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Feature Flag
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Feature Flag</DialogTitle>
              <DialogDescription>
                Create a new feature flag with rollout controls
              </DialogDescription>
            </DialogHeader>
            <CreateFeatureFlagForm
              onSubmit={handleCreateFlag}
              onCancel={() => setIsCreateDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search feature flags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterEnabled} onValueChange={setFilterEnabled}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Flags</SelectItem>
            <SelectItem value="enabled">Enabled</SelectItem>
            <SelectItem value="disabled">Disabled</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Feature Flags Table */}
      <Card>
        <CardContent className="p-0">
          {filteredFlags.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {searchTerm || filterEnabled !== 'all' 
                ? 'No feature flags match your filters.' 
                : 'No feature flags found. Create your first feature flag to get started.'
              }
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Rollout</TableHead>
                    <TableHead>Environment</TableHead>
                    <TableHead>Updated</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFlags.map((flag) => (
                    <TableRow key={flag.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium flex items-center gap-2">
                            <Flag className="h-4 w-4" />
                            {flag.name}
                          </div>
                          {flag.target_users.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {flag.target_users.length} target users
                            </div>
                          )}
                          {flag.target_orgs.length > 0 && (
                            <div className="text-xs text-muted-foreground">
                              {flag.target_orgs.length} target orgs
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm text-muted-foreground max-w-xs truncate">
                          {flag.description || 'No description'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(flag.enabled)}
                          <Switch
                            checked={flag.enabled}
                            onCheckedChange={(enabled) => handleToggleFlag(flag.id, enabled)}
                            disabled={loading}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {flag.rollout_percentage}%
                        </div>
                      </TableCell>
                      <TableCell>
                        {getEnvironmentBadge(flag.environment)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(flag.updated_at), 'MMM dd, yyyy')}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedFlag(flag)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2">
                                  <Flag className="h-5 w-5" />
                                  {flag.name}
                                </DialogTitle>
                                <DialogDescription>
                                  {flag.description || 'No description provided'}
                                </DialogDescription>
                              </DialogHeader>
                              <FeatureFlagDetails flag={flag} />
                            </DialogContent>
                          </Dialog>
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                setSelectedFlag(flag);
                                setIsEditDialogOpen(true);
                              }}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteFlag(flag.id)}
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
      {selectedFlag && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Feature Flag</DialogTitle>
              <DialogDescription>
                Update feature flag settings and rollout controls
              </DialogDescription>
            </DialogHeader>
            <EditFeatureFlagForm
              flag={selectedFlag}
              onSubmit={(updates) => handleUpdateFlag(selectedFlag.id, updates)}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Create Feature Flag Form Component
interface CreateFeatureFlagFormProps {
  onSubmit: (data: Omit<FeatureFlag, 'id' | 'created_at' | 'updated_at' | 'created_by'>) => void;
  onCancel: () => void;
  loading: boolean;
}

function CreateFeatureFlagForm({ onSubmit, onCancel, loading }: CreateFeatureFlagFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    enabled: false,
    rollout_percentage: 0,
    target_users: [] as string[],
    target_orgs: [] as string[],
    environment: 'all',
    metadata: {}
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Flag Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
            placeholder="e.g., new_dashboard"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Select
            value={formData.environment}
            onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="dev">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="prod">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          placeholder="Describe what this feature flag controls..."
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rollout_percentage">Rollout Percentage</Label>
          <Input
            id="rollout_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.rollout_percentage}
            onChange={(e) => setFormData(prev => ({ ...prev, rollout_percentage: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading || !formData.name}>
          {loading ? 'Creating...' : 'Create Flag'}
        </Button>
      </div>
    </form>
  );
}

// Edit Feature Flag Form Component
interface EditFeatureFlagFormProps {
  flag: FeatureFlag;
  onSubmit: (updates: Partial<FeatureFlag>) => void;
  onCancel: () => void;
  loading: boolean;
}

function EditFeatureFlagForm({ flag, onSubmit, onCancel, loading }: EditFeatureFlagFormProps) {
  const [formData, setFormData] = useState({
    name: flag.name,
    description: flag.description || '',
    enabled: flag.enabled,
    rollout_percentage: flag.rollout_percentage,
    target_users: flag.target_users,
    target_orgs: flag.target_orgs,
    environment: flag.environment,
    metadata: flag.metadata
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Flag Name</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="environment">Environment</Label>
          <Select
            value={formData.environment}
            onValueChange={(value) => setFormData(prev => ({ ...prev, environment: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Environments</SelectItem>
              <SelectItem value="dev">Development</SelectItem>
              <SelectItem value="staging">Staging</SelectItem>
              <SelectItem value="prod">Production</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="rollout_percentage">Rollout Percentage</Label>
          <Input
            id="rollout_percentage"
            type="number"
            min="0"
            max="100"
            value={formData.rollout_percentage}
            onChange={(e) => setFormData(prev => ({ ...prev, rollout_percentage: parseInt(e.target.value) || 0 }))}
          />
        </div>

        <div className="flex items-center space-x-2">
          <Switch
            id="enabled"
            checked={formData.enabled}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
          />
          <Label htmlFor="enabled">Enabled</Label>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Flag'}
        </Button>
      </div>
    </form>
  );
}

// Feature Flag Details Component
interface FeatureFlagDetailsProps {
  flag: FeatureFlag;
}

function FeatureFlagDetails({ flag }: FeatureFlagDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Status</label>
          <p className="text-sm text-muted-foreground">
            {flag.enabled ? 'Enabled' : 'Disabled'}
          </p>
        </div>
        <div>
          <label className="text-sm font-medium">Rollout Percentage</label>
          <p className="text-sm text-muted-foreground">{flag.rollout_percentage}%</p>
        </div>
        <div>
          <label className="text-sm font-medium">Environment</label>
          <p className="text-sm text-muted-foreground capitalize">{flag.environment}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Created</label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(flag.created_at), 'PPpp')}
          </p>
        </div>
      </div>

      {flag.target_users.length > 0 && (
        <div>
          <label className="text-sm font-medium">Target Users</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {flag.target_users.map((userId, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {userId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {flag.target_orgs.length > 0 && (
        <div>
          <label className="text-sm font-medium">Target Organizations</label>
          <div className="flex flex-wrap gap-1 mt-1">
            {flag.target_orgs.map((orgId, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {orgId}
              </Badge>
            ))}
          </div>
        </div>
      )}

      {Object.keys(flag.metadata).length > 0 && (
        <div>
          <label className="text-sm font-medium">Metadata</label>
          <pre className="text-xs bg-muted p-2 rounded mt-1 overflow-auto">
            {JSON.stringify(flag.metadata, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

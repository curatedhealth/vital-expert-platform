'use client';

import { useState } from 'react';
import { SystemSettingsService, SystemSetting } from '@/services/system-settings.service';
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
  Cog, 
  AlertTriangle,
  Eye,
  EyeOff,
  Save,
  RefreshCw
} from 'lucide-react';
import { format } from 'date-fns';

interface SystemConfigurationProps {
  systemSettings: SystemSetting[];
  onSystemSettingUpdate: (setting: SystemSetting) => void;
}

export default function SystemConfiguration({
  systemSettings,
  onSystemSettingUpdate,
}: SystemConfigurationProps) {
  const [selectedSetting, setSelectedSetting] = useState<SystemSetting | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [showSensitive, setShowSensitive] = useState(false);

  const systemSettingsService = new SystemSettingsService();

  const getCategoryBadge = (category: string) => {
    const variants = {
      security: 'destructive',
      performance: 'default',
      features: 'secondary',
      compliance: 'outline'
    } as const;

    return (
      <Badge variant={variants[category as keyof typeof variants] || 'outline'}>
        {category}
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

  const handleUpdateSetting = async (key: string, value: any, category?: string) => {
    setLoading(true);
    setError(null);
    
    try {
      const updatedSetting = await systemSettingsService.updateSystemSetting(key, value, category);
      onSystemSettingUpdate(updatedSetting);
      setIsEditDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update system setting');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshSettings = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const refreshedSettings = await systemSettingsService.getSystemSettings();
      refreshedSettings.forEach(setting => onSystemSettingUpdate(setting));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh settings');
    } finally {
      setLoading(false);
    }
  };

  // Filter settings based on search and category
  const filteredSettings = systemSettings.filter(setting => {
    const matchesSearch = setting.key.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'all' || setting.category === filterCategory;
    const matchesSensitive = showSensitive || !setting.is_sensitive;
    return matchesSearch && matchesCategory && matchesSensitive;
  });

  // Group settings by category
  const settingsByCategory = filteredSettings.reduce((acc, setting) => {
    if (!acc[setting.category]) {
      acc[setting.category] = [];
    }
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, SystemSetting[]>);

  const formatValue = (value: any, isSensitive: boolean) => {
    if (isSensitive && !showSensitive) {
      return '••••••••';
    }
    
    if (typeof value === 'boolean') {
      return value ? 'true' : 'false';
    }
    
    if (typeof value === 'object') {
      return JSON.stringify(value);
    }
    
    return String(value);
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
          <h2 className="text-lg font-medium text-gray-900">System Configuration</h2>
          <p className="text-sm text-muted-foreground">
            Manage global system settings and configuration
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleRefreshSettings}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search settings..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="features">Features</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
        <div className="flex items-center space-x-2">
          <Switch
            id="show-sensitive"
            checked={showSensitive}
            onCheckedChange={setShowSensitive}
          />
          <Label htmlFor="show-sensitive">Show Sensitive</Label>
        </div>
      </div>

      {/* Settings by Category */}
      {Object.keys(settingsByCategory).length === 0 ? (
        <Card>
          <CardContent className="text-center py-8 text-muted-foreground">
            {searchTerm || filterCategory !== 'all' 
              ? 'No settings match your filters.' 
              : 'No system settings found.'
            }
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {Object.entries(settingsByCategory).map(([category, settings]) => (
            <Card key={category}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Cog className="h-5 w-5" />
                  {category.charAt(0).toUpperCase() + category.slice(1)} Settings
                  <Badge variant="outline">{settings.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Key</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Environment</TableHead>
                        <TableHead>Updated</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {settings.map((setting) => (
                        <TableRow key={setting.key}>
                          <TableCell>
                            <div className="space-y-1">
                              <div className="font-medium">{setting.key}</div>
                              <div className="flex items-center gap-2">
                                {getCategoryBadge(setting.category)}
                                {setting.is_sensitive && (
                                  <Badge variant="destructive" className="text-xs">
                                    Sensitive
                                  </Badge>
                                )}
                                {setting.requires_restart && (
                                  <Badge variant="outline" className="text-xs">
                                    Restart Required
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm font-mono max-w-xs truncate">
                              {formatValue(setting.value, setting.is_sensitive)}
                            </div>
                          </TableCell>
                          <TableCell>
                            {getEnvironmentBadge(setting.environment)}
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {format(new Date(setting.updated_at), 'MMM dd, yyyy')}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedSetting(setting)}
                                  >
                                    <Eye className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl">
                                  <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                      <Cog className="h-5 w-5" />
                                      {setting.key}
                                    </DialogTitle>
                                    <DialogDescription>
                                      System configuration setting details
                                    </DialogDescription>
                                  </DialogHeader>
                                  <SystemSettingDetails setting={setting} />
                                </DialogContent>
                              </Dialog>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  setSelectedSetting(setting);
                                  setIsEditDialogOpen(true);
                                }}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit Dialog */}
      {selectedSetting && (
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit System Setting</DialogTitle>
              <DialogDescription>
                Update the value for {selectedSetting.key}
              </DialogDescription>
            </DialogHeader>
            <EditSystemSettingForm
              setting={selectedSetting}
              onSubmit={(value, category) => handleUpdateSetting(selectedSetting.key, value, category)}
              onCancel={() => setIsEditDialogOpen(false)}
              loading={loading}
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

// Edit System Setting Form Component
interface EditSystemSettingFormProps {
  setting: SystemSetting;
  onSubmit: (value: any, category?: string) => void;
  onCancel: () => void;
  loading: boolean;
}

function EditSystemSettingForm({ setting, onSubmit, onCancel, loading }: EditSystemSettingFormProps) {
  const [formData, setFormData] = useState({
    value: setting.value,
    category: setting.category
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData.value, formData.category);
  };

  const getInputType = (value: any) => {
    if (typeof value === 'boolean') return 'checkbox';
    if (typeof value === 'number') return 'number';
    return 'text';
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="key">Setting Key</Label>
        <Input
          id="key"
          value={setting.key}
          disabled
          className="bg-muted"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Category</Label>
        <Select
          value={formData.category}
          onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="security">Security</SelectItem>
            <SelectItem value="performance">Performance</SelectItem>
            <SelectItem value="features">Features</SelectItem>
            <SelectItem value="compliance">Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label htmlFor="value">Value</Label>
        {typeof setting.value === 'boolean' ? (
          <div className="flex items-center space-x-2">
            <Switch
              id="value"
              checked={formData.value as boolean}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, value: checked }))}
            />
            <Label htmlFor="value">
              {formData.value ? 'Enabled' : 'Disabled'}
            </Label>
          </div>
        ) : typeof setting.value === 'object' ? (
          <Textarea
            id="value"
            value={JSON.stringify(formData.value, null, 2)}
            onChange={(e) => {
              try {
                const parsed = JSON.parse(e.target.value);
                setFormData(prev => ({ ...prev, value: parsed }));
              } catch {
                // Invalid JSON, keep as string for now
              }
            }}
            rows={6}
            className="font-mono text-sm"
          />
        ) : (
          <Input
            id="value"
            type={getInputType(setting.value)}
            value={formData.value as string | number}
            onChange={(e) => {
              const newValue = typeof setting.value === 'number' 
                ? parseFloat(e.target.value) || 0
                : e.target.value;
              setFormData(prev => ({ ...prev, value: newValue }));
            }}
          />
        )}
      </div>

      {setting.is_sensitive && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This setting contains sensitive information. Be careful when modifying it.
          </AlertDescription>
        </Alert>
      )}

      {setting.requires_restart && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            This setting requires a system restart to take effect.
          </AlertDescription>
        </Alert>
      )}

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Setting'}
        </Button>
      </div>
    </form>
  );
}

// System Setting Details Component
interface SystemSettingDetailsProps {
  setting: SystemSetting;
}

function SystemSettingDetails({ setting }: SystemSettingDetailsProps) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Key</label>
          <p className="text-sm text-muted-foreground font-mono">{setting.key}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Category</label>
          <p className="text-sm text-muted-foreground capitalize">{setting.category}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Environment</label>
          <p className="text-sm text-muted-foreground capitalize">{setting.environment}</p>
        </div>
        <div>
          <label className="text-sm font-medium">Updated</label>
          <p className="text-sm text-muted-foreground">
            {format(new Date(setting.updated_at), 'PPpp')}
          </p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Value</label>
        <pre className="text-sm bg-muted p-3 rounded mt-1 overflow-auto font-mono">
          {typeof setting.value === 'object' 
            ? JSON.stringify(setting.value, null, 2)
            : String(setting.value)
          }
        </pre>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={setting.is_sensitive}
            disabled
            className="h-4 w-4"
          />
          <label className="text-sm">Sensitive</label>
        </div>
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            checked={setting.requires_restart}
            disabled
            className="h-4 w-4"
          />
          <label className="text-sm">Requires Restart</label>
        </div>
      </div>
    </div>
  );
}

'use client';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface RateLimitConfig {
  id: string;
  name: string;
  scope: 'global' | 'tenant' | 'user' | 'ip' | 'endpoint';
  scopeId?: string;
  endpoint?: string;
  requestsPerMinute: number;
  requestsPerHour: number;
  requestsPerDay: number;
  burstLimit: number;
  windowSize: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RateLimitViolation {
  id: string;
  configId: string;
  scope: string;
  scopeId?: string;
  ipAddress: string;
  userAgent: string;
  endpoint: string;
  requestCount: number;
  limitExceeded: number;
  violationTime: string;
  isBlocked: boolean;
  blockedUntil?: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

export function RateLimitManager() {
  const [configs, setConfigs] = useState<RateLimitConfig[]>([]);
  const [violations, setViolations] = useState<RateLimitViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingConfig, setEditingConfig] = useState<RateLimitConfig | null>(null);
  const [showViolations, setShowViolations] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    scope: 'global' as const,
    scopeId: '',
    endpoint: '',
    requestsPerMinute: 60,
    requestsPerHour: 1000,
    requestsPerDay: 10000,
    burstLimit: 10,
    windowSize: 60,
    isActive: true
  });

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/admin/security/rate-limits');
      if (!response.ok) throw new Error('Failed to fetch rate limit configs');
      
      const data = await response.json();
      setConfigs(data);
    } catch (error) {
      console.error('Error fetching rate limit configs:', error);
    }
  };

  const fetchViolations = async () => {
    try {
      const response = await fetch('/api/admin/security/violations');
      if (!response.ok) throw new Error('Failed to fetch violations');
      
      const data = await response.json();
      setViolations(data);
    } catch (error) {
      console.error('Error fetching violations:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchConfigs(), fetchViolations()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateConfig = async () => {
    try {
      const response = await fetch('/api/admin/security/rate-limits', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create rate limit config');

      await fetchConfigs();
      setShowCreateDialog(false);
      setFormData({
        name: '',
        scope: 'global',
        scopeId: '',
        endpoint: '',
        requestsPerMinute: 60,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        burstLimit: 10,
        windowSize: 60,
        isActive: true
      });
    } catch (error) {
      console.error('Error creating rate limit config:', error);
    }
  };

  const handleUpdateConfig = async (id: string, updates: Partial<RateLimitConfig>) => {
    try {
      const response = await fetch(`/api/admin/security/rate-limits/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update rate limit config');

      await fetchConfigs();
      setEditingConfig(null);
    } catch (error) {
      console.error('Error updating rate limit config:', error);
    }
  };

  const handleDeleteConfig = async (id: string) => {
    if (!confirm('Are you sure you want to delete this rate limit configuration?')) return;

    try {
      const response = await fetch(`/api/admin/security/rate-limits/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete rate limit config');

      await fetchConfigs();
    } catch (error) {
      console.error('Error deleting rate limit config:', error);
    }
  };

  const getScopeLabel = (scope: string) => {
    const labels = {
      global: 'Global',
      tenant: 'Tenant',
      user: 'User',
      ip: 'IP Address',
      endpoint: 'Endpoint'
    };
    return labels[scope as keyof typeof labels] || scope;
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <Clock className="h-4 w-4 text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading rate limit configurations...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Rate Limit Management</h2>
          <p className="text-gray-600">Configure and monitor API rate limiting</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowViolations(!showViolations)}
          >
            <Eye className="h-4 w-4 mr-2" />
            {showViolations ? 'Hide' : 'Show'} Violations
          </Button>
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Rate Limit Configuration</DialogTitle>
                <DialogDescription>
                  Configure rate limiting rules for different scopes and endpoints
                </DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., API Rate Limit"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scope">Scope</Label>
                  <Select
                    value={formData.scope}
                    onValueChange={(value) => setFormData({ ...formData, scope: value as any })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="global">Global</SelectItem>
                      <SelectItem value="tenant">Tenant</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="ip">IP Address</SelectItem>
                      <SelectItem value="endpoint">Endpoint</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="scopeId">Scope ID (Optional)</Label>
                  <Input
                    id="scopeId"
                    value={formData.scopeId}
                    onChange={(e) => setFormData({ ...formData, scopeId: e.target.value })}
                    placeholder="Leave empty for global scope"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endpoint">Endpoint Pattern</Label>
                  <Input
                    id="endpoint"
                    value={formData.endpoint}
                    onChange={(e) => setFormData({ ...formData, endpoint: e.target.value })}
                    placeholder="e.g., /api/v1/* or specific endpoint"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestsPerMinute">Requests per Minute</Label>
                  <Input
                    id="requestsPerMinute"
                    type="number"
                    value={formData.requestsPerMinute}
                    onChange={(e) => setFormData({ ...formData, requestsPerMinute: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestsPerHour">Requests per Hour</Label>
                  <Input
                    id="requestsPerHour"
                    type="number"
                    value={formData.requestsPerHour}
                    onChange={(e) => setFormData({ ...formData, requestsPerHour: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="requestsPerDay">Requests per Day</Label>
                  <Input
                    id="requestsPerDay"
                    type="number"
                    value={formData.requestsPerDay}
                    onChange={(e) => setFormData({ ...formData, requestsPerDay: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="burstLimit">Burst Limit</Label>
                  <Input
                    id="burstLimit"
                    type="number"
                    value={formData.burstLimit}
                    onChange={(e) => setFormData({ ...formData, burstLimit: parseInt(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="windowSize">Window Size (seconds)</Label>
                  <Input
                    id="windowSize"
                    type="number"
                    value={formData.windowSize}
                    onChange={(e) => setFormData({ ...formData, windowSize: parseInt(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="isActive"
                    checked={formData.isActive}
                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                  />
                  <Label htmlFor="isActive">Active</Label>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateConfig}>Create Configuration</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Rate Limit Configurations */}
      <Card>
        <CardHeader>
          <CardTitle>Rate Limit Configurations</CardTitle>
          <CardDescription>
            Manage rate limiting rules for different scopes and endpoints
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Endpoint</TableHead>
                <TableHead>Limits</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {configs.map((config) => (
                <TableRow key={config.id}>
                  <TableCell className="font-medium">{config.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {getScopeLabel(config.scope)}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {config.endpoint || '*'}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{config.requestsPerMinute}/min</div>
                      <div>{config.requestsPerHour}/hour</div>
                      <div>{config.requestsPerDay}/day</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(config.isActive)}
                      <span className="text-sm">
                        {config.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingConfig(config)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteConfig(config.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Violations Table */}
      {showViolations && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Recent Violations
            </CardTitle>
            <CardDescription>
              Recent rate limit violations and their status
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>IP Address</TableHead>
                  <TableHead>Endpoint</TableHead>
                  <TableHead>Request Count</TableHead>
                  <TableHead>Exceeded By</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {violations.slice(0, 10).map((violation) => (
                  <TableRow key={violation.id}>
                    <TableCell className="font-mono text-sm">
                      {violation.ipAddress}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {violation.endpoint}
                    </TableCell>
                    <TableCell>{violation.requestCount}</TableCell>
                    <TableCell>
                      <Badge variant="destructive">
                        +{violation.limitExceeded}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(violation.violationTime).toLocaleString()}
                    </TableCell>
                    <TableCell>
                      <Badge variant={violation.isBlocked ? 'destructive' : 'secondary'}>
                        {violation.isBlocked ? 'Blocked' : 'Warning'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

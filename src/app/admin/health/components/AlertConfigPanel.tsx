'use client';

import { useState, useEffect } from 'react';
import { HealthMonitoringService, AlertConfig } from '@/services/health-monitoring.service';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Plus, Edit, Trash2 } from 'lucide-react';

export default function AlertConfigPanel() {
  const [alerts, setAlerts] = useState<AlertConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingAlert, setEditingAlert] = useState<AlertConfig | null>(null);

  const healthService = new HealthMonitoringService();

  const loadAlerts = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const alertConfigs = await healthService.getAlertConfigs();
      setAlerts(alertConfigs);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load alert configurations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAlert = async (alertId: string, enabled: boolean) => {
    try {
      await healthService.updateAlertConfig(alertId, { enabled });
      await loadAlerts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update alert');
    }
  };

  const handleCreateAlert = async (alertData: Omit<AlertConfig, 'id'>) => {
    try {
      await healthService.createAlertConfig(alertData);
      await loadAlerts();
      setIsCreateDialogOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create alert');
    }
  };

  useEffect(() => {
    loadAlerts();
  }, []);

  const getOperatorSymbol = (operator: string) => {
    switch (operator) {
      case 'gt': return '>';
      case 'lt': return '<';
      case 'eq': return '=';
      case 'gte': return '≥';
      case 'lte': return '≤';
      default: return operator;
    }
  };

  const getStatusBadge = (enabled: boolean) => {
    return (
      <Badge variant={enabled ? 'default' : 'outline'}>
        {enabled ? 'Enabled' : 'Disabled'}
      </Badge>
    );
  };

  return (
    <div className="space-y-4">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Alert Configurations</CardTitle>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create Alert
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Alert Configuration</DialogTitle>
                  <DialogDescription>
                    Set up monitoring alerts for system metrics
                  </DialogDescription>
                </DialogHeader>
                <CreateAlertForm
                  onSubmit={handleCreateAlert}
                  onCancel={() => setIsCreateDialogOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              <span className="ml-2">Loading alerts...</span>
            </div>
          ) : alerts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No alert configurations found. Create your first alert to get started.
            </div>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Service</TableHead>
                    <TableHead>Metric</TableHead>
                    <TableHead>Condition</TableHead>
                    <TableHead>Channels</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {alerts.map((alert) => (
                    <TableRow key={alert.id}>
                      <TableCell className="font-medium">{alert.service}</TableCell>
                      <TableCell>{alert.metric}</TableCell>
                      <TableCell>
                        {alert.metric} {getOperatorSymbol(alert.operator)} {alert.threshold}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {alert.notificationChannels.map((channel, index) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {channel}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(alert.enabled)}
                          <Switch
                            checked={alert.enabled}
                            onCheckedChange={(enabled) => handleToggleAlert(alert.id, enabled)}
                          />
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingAlert(alert)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              // TODO: Implement delete
                              console.log('Delete alert:', alert.id);
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
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

interface CreateAlertFormProps {
  onSubmit: (data: Omit<AlertConfig, 'id'>) => void;
  onCancel: () => void;
}

function CreateAlertForm({ onSubmit, onCancel }: CreateAlertFormProps) {
  const [formData, setFormData] = useState({
    service: '',
    metric: '',
    threshold: 0,
    operator: 'gt',
    enabled: true,
    notificationChannels: [] as string[],
    cooldown: 15
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="service">Service</Label>
          <Input
            id="service"
            placeholder="api-gateway"
            value={formData.service}
            onChange={(e) => setFormData(prev => ({ ...prev, service: e.target.value }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metric">Metric</Label>
          <Select
            value={formData.metric}
            onValueChange={(value) => setFormData(prev => ({ ...prev, metric: value }))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latency">Latency</SelectItem>
              <SelectItem value="error_rate">Error Rate</SelectItem>
              <SelectItem value="cpu_usage">CPU Usage</SelectItem>
              <SelectItem value="memory_usage">Memory Usage</SelectItem>
              <SelectItem value="disk_usage">Disk Usage</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="operator">Operator</Label>
          <Select
            value={formData.operator}
            onValueChange={(value) => setFormData(prev => ({ ...prev, operator: value }))}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="gt">Greater than (&gt;)</SelectItem>
              <SelectItem value="lt">Less than (&lt;)</SelectItem>
              <SelectItem value="eq">Equal to (=)</SelectItem>
              <SelectItem value="gte">Greater than or equal (≥)</SelectItem>
              <SelectItem value="lte">Less than or equal (≤)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold">Threshold</Label>
          <Input
            id="threshold"
            type="number"
            step="0.01"
            value={formData.threshold}
            onChange={(e) => setFormData(prev => ({ ...prev, threshold: parseFloat(e.target.value) || 0 }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="cooldown">Cooldown (minutes)</Label>
          <Input
            id="cooldown"
            type="number"
            min="1"
            value={formData.cooldown}
            onChange={(e) => setFormData(prev => ({ ...prev, cooldown: parseInt(e.target.value) || 15 }))}
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Enabled</Label>
          <div className="flex items-center space-x-2">
            <Switch
              checked={formData.enabled}
              onCheckedChange={(enabled) => setFormData(prev => ({ ...prev, enabled }))}
            />
            <span className="text-sm text-muted-foreground">
              {formData.enabled ? 'Alert is enabled' : 'Alert is disabled'}
            </span>
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" disabled={!formData.service || !formData.metric}>
          Create Alert
        </Button>
      </div>
    </form>
  );
}

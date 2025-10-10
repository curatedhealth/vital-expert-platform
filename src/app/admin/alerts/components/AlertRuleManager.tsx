'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Play,
  Pause,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock
} from 'lucide-react';

interface AlertRule {
  id: string;
  name: string;
  description: string;
  condition: {
    metric: string;
    operator: string;
    threshold: number | string;
    timeWindow: number;
    aggregation?: string;
    groupBy?: string[];
    filters?: Record<string, any>;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  isActive: boolean;
  notificationChannels: string[];
  escalationPolicy?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

interface NotificationChannel {
  id: string;
  name: string;
  type: 'email' | 'slack' | 'webhook' | 'sms';
}

export function AlertRuleManager() {
  const [rules, setRules] = useState<AlertRule[]>([]);
  const [channels, setChannels] = useState<NotificationChannel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<AlertRule | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    metric: 'error_rate',
    operator: 'gt',
    threshold: 0.1,
    timeWindow: 5,
    aggregation: 'avg',
    severity: 'medium' as const,
    isActive: true,
    notificationChannels: [] as string[],
    escalationPolicy: ''
  });

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/alerts/rules');
      if (!response.ok) throw new Error('Failed to fetch alert rules');
      
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  const fetchChannels = async () => {
    try {
      const response = await fetch('/api/admin/alerts/channels');
      if (!response.ok) throw new Error('Failed to fetch notification channels');
      
      const data = await response.json();
      setChannels(data);
    } catch (error) {
      console.error('Error fetching notification channels:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRules(), fetchChannels()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/admin/alerts/rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          condition: {
            metric: formData.metric,
            operator: formData.operator,
            threshold: formData.threshold,
            timeWindow: formData.timeWindow,
            aggregation: formData.aggregation
          }
        })
      });

      if (!response.ok) throw new Error('Failed to create alert rule');

      await fetchRules();
      setShowCreateDialog(false);
      setFormData({
        name: '',
        description: '',
        metric: 'error_rate',
        operator: 'gt',
        threshold: 0.1,
        timeWindow: 5,
        aggregation: 'avg',
        severity: 'medium',
        isActive: true,
        notificationChannels: [],
        escalationPolicy: ''
      });
    } catch (error) {
      console.error('Error creating alert rule:', error);
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<AlertRule>) => {
    try {
      const response = await fetch(`/api/admin/alerts/rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update alert rule');

      await fetchRules();
      setEditingRule(null);
    } catch (error) {
      console.error('Error updating alert rule:', error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this alert rule?')) return;

    try {
      const response = await fetch(`/api/admin/alerts/rules/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete alert rule');

      await fetchRules();
    } catch (error) {
      console.error('Error deleting alert rule:', error);
    }
  };

  const handleToggleActive = async (id: string, isActive: boolean) => {
    await handleUpdateRule(id, { isActive });
  };

  const getSeverityColor = (severity: string) => {
    const colors = {
      low: 'bg-green-100 text-green-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-orange-100 text-orange-800',
      critical: 'bg-red-100 text-red-800'
    };
    return colors[severity as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <Play className="h-4 w-4 text-green-500" />
    ) : (
      <Pause className="h-4 w-4 text-gray-400" />
    );
  };

  const formatCondition = (condition: AlertRule['condition']) => {
    return `${condition.metric} ${condition.operator} ${condition.threshold} over ${condition.timeWindow}m`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading alert rules...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert Rules</h2>
          <p className="text-gray-600">Configure and manage alert rules</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Create Alert Rule</DialogTitle>
              <DialogDescription>
                Configure a new alert rule with conditions and notifications
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., High Error Rate"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={formData.severity}
                  onValueChange={(value) => setFormData({ ...formData, severity: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe what this rule monitors"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="metric">Metric</Label>
                <Select
                  value={formData.metric}
                  onValueChange={(value) => setFormData({ ...formData, metric: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="error_rate">Error Rate</SelectItem>
                    <SelectItem value="response_time">Response Time</SelectItem>
                    <SelectItem value="cpu_usage">CPU Usage</SelectItem>
                    <SelectItem value="memory_usage">Memory Usage</SelectItem>
                    <SelectItem value="request_count">Request Count</SelectItem>
                    <SelectItem value="queue_length">Queue Length</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="operator">Operator</Label>
                <Select
                  value={formData.operator}
                  onValueChange={(value) => setFormData({ ...formData, operator: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gt">Greater Than</SelectItem>
                    <SelectItem value="gte">Greater Than or Equal</SelectItem>
                    <SelectItem value="lt">Less Than</SelectItem>
                    <SelectItem value="lte">Less Than or Equal</SelectItem>
                    <SelectItem value="eq">Equal</SelectItem>
                    <SelectItem value="ne">Not Equal</SelectItem>
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
                  onChange={(e) => setFormData({ ...formData, threshold: parseFloat(e.target.value) })}
                  placeholder="0.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeWindow">Time Window (minutes)</Label>
                <Input
                  id="timeWindow"
                  type="number"
                  value={formData.timeWindow}
                  onChange={(e) => setFormData({ ...formData, timeWindow: parseInt(e.target.value) })}
                  placeholder="5"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="aggregation">Aggregation</Label>
                <Select
                  value={formData.aggregation}
                  onValueChange={(value) => setFormData({ ...formData, aggregation: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="avg">Average</SelectItem>
                    <SelectItem value="sum">Sum</SelectItem>
                    <SelectItem value="min">Minimum</SelectItem>
                    <SelectItem value="max">Maximum</SelectItem>
                    <SelectItem value="count">Count</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="notificationChannels">Notification Channels</Label>
                <Select
                  value=""
                  onValueChange={(value) => {
                    if (value && !formData.notificationChannels.includes(value)) {
                      setFormData({
                        ...formData,
                        notificationChannels: [...formData.notificationChannels, value]
                      });
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select channels" />
                  </SelectTrigger>
                  <SelectContent>
                    {channels.map((channel) => (
                      <SelectItem key={channel.id} value={channel.id}>
                        {channel.name} ({channel.type})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex flex-wrap gap-1 mt-2">
                  {formData.notificationChannels.map((channelId) => {
                    const channel = channels.find(c => c.id === channelId);
                    return (
                      <Badge key={channelId} variant="secondary" className="text-xs">
                        {channel?.name}
                        <button
                          className="ml-1 hover:text-red-500"
                          onClick={() => setFormData({
                            ...formData,
                            notificationChannels: formData.notificationChannels.filter(id => id !== channelId)
                          })}
                        >
                          ×
                        </button>
                      </Badge>
                    );
                  })}
                </div>
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
              <Button onClick={handleCreateRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Alert Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Rules</CardTitle>
          <CardDescription>
            Configure and manage alert rules for system monitoring
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Condition</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Channels</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-medium">{rule.name}</TableCell>
                  <TableCell className="text-sm font-mono">
                    {formatCondition(rule.condition)}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(rule.severity)}>
                      {rule.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {rule.notificationChannels.map((channelId) => {
                        const channel = channels.find(c => c.id === channelId);
                        return (
                          <Badge key={channelId} variant="outline" className="text-xs">
                            {channel?.name || channelId}
                          </Badge>
                        );
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rule.isActive)}
                      <span className="text-sm">
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(rule.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleToggleActive(rule.id, !rule.isActive)}
                      >
                        {rule.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingRule(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteRule(rule.id)}
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
    </div>
  );
}

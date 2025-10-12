'use client';

import { 
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Eye,
  Search,
  Filter,
  User
} from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface AlertInstance {
  id: string;
  ruleId: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'firing' | 'resolved' | 'suppressed';
  labels: Record<string, string>;
  annotations: Record<string, string>;
  startedAt: string;
  resolvedAt?: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
  escalationLevel: number;
  nextEscalationAt?: string;
}

interface AlertFilters {
  status?: string;
  severity?: string;
  ruleId?: string;
  search?: string;
  startDate?: string;
  endDate?: string;
}

export function AlertHistory() {
  const [alerts, setAlerts] = useState<AlertInstance[]>([]);
  const [rules, setRules] = useState<Array<{ id: string; name: string }>>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAlert, setSelectedAlert] = useState<AlertInstance | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<AlertFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchAlerts = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.severity) queryParams.append('severity', filters.severity);
      if (filters.ruleId) queryParams.append('ruleId', filters.ruleId);
      if (filters.search) queryParams.append('search', filters.search);
      if (filters.startDate) queryParams.append('startDate', filters.startDate);
      if (filters.endDate) queryParams.append('endDate', filters.endDate);

      const response = await fetch(`/api/admin/alerts/instances?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch alert instances');
      
      const data = await response.json();
      setAlerts(data);
    } catch (error) {
      console.error('Error fetching alert instances:', error);
    }
  };

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/alerts/rules');
      if (!response.ok) throw new Error('Failed to fetch alert rules');
      
      const data = await response.json();
      setRules(data.map((rule: { id: string; name: string }) => ({ id: rule.id, name: rule.name })));
    } catch (error) {
      console.error('Error fetching alert rules:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchAlerts(), fetchRules()]);
      setLoading(false);
    };
    loadData();
  }, [filters]);

  const handleAcknowledgeAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/instances/${id}/acknowledge`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ acknowledgedBy: 'admin' })
      });

      if (!response.ok) throw new Error('Failed to acknowledge alert');

      await fetchAlerts();
    } catch (error) {
      console.error('Error acknowledging alert:', error);
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/admin/alerts/instances/${id}/resolve`, {
        method: 'POST'
      });

      if (!response.ok) throw new Error('Failed to resolve alert');

      await fetchAlerts();
    } catch (error) {
      console.error('Error resolving alert:', error);
    }
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

  const getStatusColor = (status: string) => {
    const colors = {
      firing: 'bg-red-100 text-red-800',
      resolved: 'bg-green-100 text-green-800',
      suppressed: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      firing: AlertTriangle,
      resolved: CheckCircle,
      suppressed: Clock
    };
    const Icon = icons[status as keyof typeof icons] || AlertTriangle;
    return <Icon className="h-4 w-4" />;
  };

  const getRuleName = (ruleId: string) => {
    const rule = rules.find(r => r.id === ruleId);
    return rule?.name || 'Unknown Rule';
  };

  const formatDuration = (startedAt: string, resolvedAt?: string) => {
    const start = new Date(startedAt).getTime();
    const end = resolvedAt ? new Date(resolvedAt).getTime() : Date.now();
    const duration = Math.floor((end - start) / (1000 * 60)); // minutes
    
    if (duration < 60) return `${duration}m`;
    if (duration < 1440) return `${Math.floor(duration / 60)}h ${duration % 60}m`;
    return `${Math.floor(duration / 1440)}d ${Math.floor((duration % 1440) / 60)}h`;
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading alert history...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Alert History</h2>
          <p className="text-gray-600">View and manage alert instances</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button variant="outline" onClick={fetchAlerts}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Alerts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search alerts..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={filters.status || ''}
                  onValueChange={(value) => setFilters({ ...filters, status: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All statuses</SelectItem>
                    <SelectItem value="firing">Firing</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="suppressed">Suppressed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="severity">Severity</Label>
                <Select
                  value={filters.severity || ''}
                  onValueChange={(value) => setFilters({ ...filters, severity: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All severities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All severities</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ruleId">Rule</Label>
                <Select
                  value={filters.ruleId || ''}
                  onValueChange={(value) => setFilters({ ...filters, ruleId: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All rules" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All rules</SelectItem>
                    {rules.map((rule) => (
                      <SelectItem key={rule.id} value={rule.id}>
                        {rule.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="startDate">Start Date</Label>
                <Input
                  id="startDate"
                  type="datetime-local"
                  value={filters.startDate || ''}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">End Date</Label>
                <Input
                  id="endDate"
                  type="datetime-local"
                  value={filters.endDate || ''}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                />
              </div>
            </div>
            <div className="flex justify-end mt-4">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Alerts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Instances</CardTitle>
          <CardDescription>
            {alerts.length} alert(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Rule</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Started</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.map((alert) => (
                <TableRow key={alert.id}>
                  <TableCell className="font-medium">
                    {getRuleName(alert.ruleId)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {alert.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(alert.severity)}>
                      {alert.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(alert.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(alert.status)}
                        {alert.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDuration(alert.startedAt, alert.resolvedAt)}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(alert.startedAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedAlert(alert);
                          setShowDetailsDialog(true);
                        }}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      {alert.status === 'firing' && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleAcknowledgeAlert(alert.id)}
                          >
                            <User className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleResolveAlert(alert.id)}
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Alert Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Alert Details</DialogTitle>
            <DialogDescription>
              View detailed information about this alert instance
            </DialogDescription>
          </DialogHeader>
          {selectedAlert && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Rule</Label>
                  <div className="mt-1">{getRuleName(selectedAlert.ruleId)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Severity</Label>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(selectedAlert.severity)}>
                      {selectedAlert.severity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedAlert.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedAlert.status)}
                        {selectedAlert.status}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Duration</Label>
                  <div className="mt-1">{formatDuration(selectedAlert.startedAt, selectedAlert.resolvedAt)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Started</Label>
                  <div className="mt-1">{new Date(selectedAlert.startedAt).toLocaleString()}</div>
                </div>
                {selectedAlert.resolvedAt && (
                  <div>
                    <Label className="text-sm font-medium">Resolved</Label>
                    <div className="mt-1">{new Date(selectedAlert.resolvedAt).toLocaleString()}</div>
                  </div>
                )}
                {selectedAlert.acknowledgedBy && (
                  <div>
                    <Label className="text-sm font-medium">Acknowledged By</Label>
                    <div className="mt-1">{selectedAlert.acknowledgedBy}</div>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedAlert.description}
                </div>
              </div>

              {/* Labels */}
              {Object.keys(selectedAlert.labels).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Labels</Label>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {Object.entries(selectedAlert.labels).map(([key, value]) => (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key}={value}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Annotations */}
              {Object.keys(selectedAlert.annotations).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Annotations</Label>
                  <div className="mt-1 space-y-1">
                    {Object.entries(selectedAlert.annotations).map(([key, value]) => (
                      <div key={key} className="text-sm">
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Actions */}
              {selectedAlert.status === 'firing' && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      handleAcknowledgeAlert(selectedAlert.id);
                      setShowDetailsDialog(false);
                    }}
                  >
                    <User className="h-4 w-4 mr-2" />
                    Acknowledge
                  </Button>
                  <Button
                    onClick={() => {
                      handleResolveAlert(selectedAlert.id);
                      setShowDetailsDialog(false);
                    }}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Resolve
                  </Button>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

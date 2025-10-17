'use client';

import { 
  AlertTriangle,
  Shield,
  Ban,
  Activity,
  RefreshCw,
  Eye,
  CheckCircle,
  Clock,
  Search,
  Filter
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

interface SecurityIncident {
  id: string;
  type: 'rate_limit_violation' | 'abuse_pattern' | 'ip_blocked' | 'suspicious_activity';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  source: string;
  ipAddress?: string;
  userId?: string;
  tenantId?: string;
  metadata: Record<string, any>;
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

interface IncidentFilters {
  type?: string;
  severity?: string;
  status?: string;
  assignedTo?: string;
  search?: string;
}

export function SecurityIncidents() {
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIncident, setSelectedIncident] = useState<SecurityIncident | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [filters, setFilters] = useState<IncidentFilters>({});
  const [showFilters, setShowFilters] = useState(false);

  const fetchIncidents = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (filters.type) queryParams.append('type', filters.type);
      if (filters.severity) queryParams.append('severity', filters.severity);
      if (filters.status) queryParams.append('status', filters.status);
      if (filters.assignedTo) queryParams.append('assignedTo', filters.assignedTo);
      if (filters.search) queryParams.append('search', filters.search);

      const response = await fetch(`/api/admin/security/incidents?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch security incidents');
      
      const data = await response.json();
      setIncidents(data);
    } catch (error) {
      console.error('Error fetching security incidents:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchIncidents();
      setLoading(false);
    };
    loadData();
  }, [filters]);

  const handleUpdateIncident = async (id: string, updates: Partial<SecurityIncident>) => {
    try {
      const response = await fetch(`/api/admin/security/incidents/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update incident');

      await fetchIncidents();
      setShowDetailsDialog(false);
    } catch (error) {
      console.error('Error updating incident:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    const icons = {
      rate_limit_violation: Activity,
      abuse_pattern: Ban,
      ip_blocked: Shield,
      suspicious_activity: AlertTriangle
    };
    const Icon = icons[type as keyof typeof icons] || AlertTriangle;
    return <Icon className="h-4 w-4" />;
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
      open: 'bg-red-100 text-red-800',
      investigating: 'bg-yellow-100 text-yellow-800',
      resolved: 'bg-green-100 text-green-800',
      false_positive: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      open: AlertTriangle,
      investigating: Clock,
      resolved: CheckCircle,
      false_positive: Shield
    };
    const Icon = icons[status as keyof typeof icons] || AlertTriangle;
    return <Icon className="h-4 w-4" />;
  };

  const formatIncidentType = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading security incidents...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Security Incidents</h2>
          <p className="text-gray-600">Monitor and manage security incidents</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4 mr-2" />
            {showFilters ? 'Hide' : 'Show'} Filters
          </Button>
          <Button variant="outline" onClick={fetchIncidents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Incidents</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label htmlFor="search">Search</Label>
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search incidents..."
                    value={filters.search || ''}
                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                    className="pl-8"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Type</Label>
                <Select
                  value={filters.type || ''}
                  onValueChange={(value) => setFilters({ ...filters, type: value || undefined })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All types</SelectItem>
                    <SelectItem value="rate_limit_violation">Rate Limit Violation</SelectItem>
                    <SelectItem value="abuse_pattern">Abuse Pattern</SelectItem>
                    <SelectItem value="ip_blocked">IP Blocked</SelectItem>
                    <SelectItem value="suspicious_activity">Suspicious Activity</SelectItem>
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
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="investigating">Investigating</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="false_positive">False Positive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="assignedTo">Assigned To</Label>
                <Input
                  id="assignedTo"
                  placeholder="Username"
                  value={filters.assignedTo || ''}
                  onChange={(e) => setFilters({ ...filters, assignedTo: e.target.value })}
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

      {/* Incidents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Security Incidents</CardTitle>
          <CardDescription>
            {incidents.length} incident(s) found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {incidents.map((incident) => (
                <TableRow key={incident.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getTypeIcon(incident.type)}
                      <span className="text-sm">
                        {formatIncidentType(incident.type)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {incident.title}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(incident.severity)}>
                      {incident.severity}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(incident.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(incident.status)}
                        {incident.status}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{incident.source}</TableCell>
                  <TableCell className="font-mono text-sm">
                    {incident.ipAddress || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    {new Date(incident.createdAt).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedIncident(incident);
                        setShowDetailsDialog(true);
                      }}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Incident Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Incident Details</DialogTitle>
            <DialogDescription>
              View and manage security incident details
            </DialogDescription>
          </DialogHeader>
          {selectedIncident && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Type</Label>
                  <div className="flex items-center gap-2 mt-1">
                    {getTypeIcon(selectedIncident.type)}
                    <span>{formatIncidentType(selectedIncident.type)}</span>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Severity</Label>
                  <div className="mt-1">
                    <Badge className={getSeverityColor(selectedIncident.severity)}>
                      {selectedIncident.severity}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={getStatusColor(selectedIncident.status)}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedIncident.status)}
                        {selectedIncident.status}
                      </div>
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Source</Label>
                  <div className="mt-1 text-sm">{selectedIncident.source}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium">IP Address</Label>
                  <div className="mt-1 font-mono text-sm">
                    {selectedIncident.ipAddress || 'N/A'}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium">Created</Label>
                  <div className="mt-1 text-sm">
                    {new Date(selectedIncident.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <Label className="text-sm font-medium">Description</Label>
                <div className="mt-1 p-3 bg-gray-50 rounded-md text-sm">
                  {selectedIncident.description}
                </div>
              </div>

              {/* Metadata */}
              {Object.keys(selectedIncident.metadata).length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Additional Data</Label>
                  <div className="mt-1 p-3 bg-gray-50 rounded-md">
                    <pre className="text-xs overflow-auto">
                      {JSON.stringify(selectedIncident.metadata, null, 2)}
                    </pre>
                  </div>
                </div>
              )}

              {/* Status Update */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="status">Update Status</Label>
                  <Select
                    value={selectedIncident.status}
                    onValueChange={(value) => 
                      handleUpdateIncident(selectedIncident.id, { status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="open">Open</SelectItem>
                      <SelectItem value="investigating">Investigating</SelectItem>
                      <SelectItem value="resolved">Resolved</SelectItem>
                      <SelectItem value="false_positive">False Positive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assignedTo">Assign To</Label>
                  <Input
                    id="assignedTo"
                    placeholder="Username"
                    value={selectedIncident.assignedTo || ''}
                    onChange={(e) => 
                      handleUpdateIncident(selectedIncident.id, { assignedTo: e.target.value })
                    }
                  />
                </div>
              </div>
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

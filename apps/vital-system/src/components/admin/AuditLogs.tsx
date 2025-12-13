'use client';

import {
  Shield,
  Search,
  RefreshCw,
  Download,
  Filter,
  Eye,
  AlertCircle,
  CheckCircle,
  XCircle,
  Activity,
  User,
  Calendar,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Input } from '@vital/ui';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@vital/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { Label } from '@vital/ui';
import { createClient } from '@vital/sdk/client';

interface AuditEvent {
  id: string;
  audit_id: string;
  user_id: string;
  user_role: string;
  operation: string;
  resource: string;
  outcome: string;
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  data_accessed?: string[];
  changes?: any;
  compliance_flags?: any;
  metadata?: any;
  created_at?: string;
}

interface AuditStats {
  total: number;
  success: number;
  failure: number;
  today: number;
}

const supabase = createClient();

export function AuditLogs() {
  const [events, setEvents] = useState<AuditEvent[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<AuditEvent[]>([]);
  const [stats, setStats] = useState<AuditStats>({
    total: 0,
    success: 0,
    failure: 0,
    today: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [outcomeFilter, setOutcomeFilter] = useState<string>('all');
  const [operationFilter, setOperationFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [selectedEvent, setSelectedEvent] = useState<AuditEvent | null>(null);
  const [showViewDialog, setShowViewDialog] = useState(false);

  useEffect(() => {
    loadAuditEvents();
  }, []);

  useEffect(() => {
    filterEvents();
  }, [searchQuery, outcomeFilter, operationFilter, resourceFilter, events]);

  const loadAuditEvents = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('audit_events')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(500); // Limit to last 500 events

      if (error) throw error;

      if (data) {
        setEvents(data);
        calculateStats(data);
      }
    } catch (error) {
      console.error('Error loading audit events:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (eventList: AuditEvent[]) => {
    const total = eventList.length;
    const success = eventList.filter(e => e.outcome === 'success').length;
    const failure = eventList.filter(e => e.outcome === 'failure').length;
    
    const today = eventList.filter(e => {
      const eventDate = new Date(e.timestamp);
      const todayDate = new Date();
      return eventDate.toDateString() === todayDate.toDateString();
    }).length;

    setStats({ total, success, failure, today });
  };

  const filterEvents = () => {
    let filtered = events;

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter(
        event =>
          event.user_id.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.operation.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.resource.toLowerCase().includes(searchQuery.toLowerCase()) ||
          event.audit_id.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Outcome filter
    if (outcomeFilter !== 'all') {
      filtered = filtered.filter(event => event.outcome === outcomeFilter);
    }

    // Operation filter
    if (operationFilter !== 'all') {
      filtered = filtered.filter(event => event.operation === operationFilter);
    }

    // Resource filter
    if (resourceFilter !== 'all') {
      filtered = filtered.filter(event => event.resource === resourceFilter);
    }

    setFilteredEvents(filtered);
  };

  const handleExportLogs = () => {
    const csv = convertToCSV(filteredEvents);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const convertToCSV = (data: AuditEvent[]) => {
    const headers = [
      'Audit ID',
      'Timestamp',
      'User ID',
      'User Role',
      'Operation',
      'Resource',
      'Outcome',
      'IP Address',
    ];
    const rows = data.map(event => [
      event.audit_id,
      event.timestamp,
      event.user_id,
      event.user_role,
      event.operation,
      event.resource,
      event.outcome,
      event.ip_address || '',
    ]);
    
    return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  };

  const openViewDialog = (event: AuditEvent) => {
    setSelectedEvent(event);
    setShowViewDialog(true);
  };

  const getOutcomeBadge = (outcome: string) => {
    switch (outcome) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 'failure':
        return <Badge className="bg-red-100 text-red-800">Failure</Badge>;
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      default:
        return <Badge variant="outline">{outcome}</Badge>;
    }
  };

  const getOperationIcon = (operation: string) => {
    if (operation.includes('create')) return <CheckCircle className="h-4 w-4 text-green-600" />;
    if (operation.includes('delete')) return <XCircle className="h-4 w-4 text-rose-600" />;
    if (operation.includes('update')) return <Activity className="h-4 w-4 text-purple-600" />;
    return <Eye className="h-4 w-4 text-neutral-600" />;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const uniqueOperations = Array.from(new Set(events.map(e => e.operation)));
  const uniqueResources = Array.from(new Set(events.map(e => e.resource)));

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <RefreshCw className="h-8 w-8 text-purple-600 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading audit logs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Audit Logs</h1>
          <p className="text-muted-foreground mt-1">
            Track all system activities and user actions for compliance
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleExportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export CSV
          </Button>
          <Button variant="outline" onClick={loadAuditEvents}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.success}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.success / stats.total) * 100).toFixed(1) : 0}% success rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failures</CardTitle>
            <XCircle className="h-4 w-4 text-rose-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failure}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? ((stats.failure / stats.total) * 100).toFixed(1) : 0}% failure rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.today}</div>
            <p className="text-xs text-muted-foreground">Events today</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search logs..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            
            <Select value={outcomeFilter} onValueChange={setOutcomeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Outcome" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Outcomes</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failure">Failure</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
              </SelectContent>
            </Select>

            <Select value={operationFilter} onValueChange={setOperationFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Operation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Operations</SelectItem>
                {uniqueOperations.slice(0, 10).map(op => (
                  <SelectItem key={op} value={op}>
                    {op}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={resourceFilter} onValueChange={setResourceFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Resource" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                {uniqueResources.slice(0, 10).map(res => (
                  <SelectItem key={res} value={res}>
                    {res}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Audit Events Table */}
      <Card>
        <CardContent className="pt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Operation</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEvents.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground">
                    No audit events found
                  </TableCell>
                </TableRow>
              ) : (
                filteredEvents.map(event => (
                  <TableRow key={event.id}>
                    <TableCell className="font-mono text-xs">
                      {formatDate(event.timestamp)}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="text-sm font-medium">{event.user_id}</p>
                          <p className="text-xs text-muted-foreground">{event.user_role}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {getOperationIcon(event.operation)}
                        <span className="text-sm">{event.operation}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{event.resource}</Badge>
                    </TableCell>
                    <TableCell>{getOutcomeBadge(event.outcome)}</TableCell>
                    <TableCell className="font-mono text-xs">{event.ip_address || '-'}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openViewDialog(event)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Event Dialog */}
      <Dialog open={showViewDialog} onOpenChange={setShowViewDialog}>
        <DialogContent className="max-w-4xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Audit Event Details</DialogTitle>
            <DialogDescription>
              Event ID: {selectedEvent?.audit_id}
            </DialogDescription>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Timestamp</Label>
                  <p className="font-mono text-sm">{formatDate(selectedEvent.timestamp)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Outcome</Label>
                  <div className="mt-1">{getOutcomeBadge(selectedEvent.outcome)}</div>
                </div>
                <div>
                  <Label className="text-muted-foreground">User ID</Label>
                  <p className="text-sm">{selectedEvent.user_id}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User Role</Label>
                  <p className="text-sm">{selectedEvent.user_role}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Operation</Label>
                  <p className="text-sm">{selectedEvent.operation}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Resource</Label>
                  <p className="text-sm">{selectedEvent.resource}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">IP Address</Label>
                  <p className="font-mono text-sm">{selectedEvent.ip_address || '-'}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">User Agent</Label>
                  <p className="text-xs truncate">{selectedEvent.user_agent || '-'}</p>
                </div>
              </div>

              {selectedEvent.data_accessed && selectedEvent.data_accessed.length > 0 && (
                <div>
                  <Label className="text-muted-foreground">Data Accessed</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedEvent.data_accessed.map((data, i) => (
                      <Badge key={i} variant="outline">
                        {data}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedEvent.changes && (
                <div>
                  <Label className="text-muted-foreground">Changes</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedEvent.changes, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEvent.compliance_flags && (
                <div>
                  <Label className="text-muted-foreground">Compliance Flags</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedEvent.compliance_flags, null, 2)}
                  </pre>
                </div>
              )}

              {selectedEvent.metadata && (
                <div>
                  <Label className="text-muted-foreground">Metadata</Label>
                  <pre className="mt-2 p-4 bg-muted rounded-lg overflow-x-auto text-sm">
                    {JSON.stringify(selectedEvent.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowViewDialog(false);
                setSelectedEvent(null);
              }}
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}


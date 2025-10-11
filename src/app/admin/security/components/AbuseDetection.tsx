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
  AlertTriangle,
  Shield,
  RefreshCw,
  Eye,
  Ban
} from 'lucide-react';

interface AbusePattern {
  id: string;
  pattern: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  threshold: number;
  timeWindow: number;
  isActive: boolean;
  autoBlock: boolean;
  blockDuration: number;
  createdAt: string;
  updatedAt: string;
}

interface AbuseDetectionStats {
  totalPatterns: number;
  activePatterns: number;
  blockedIPs: number;
  detectionsToday: number;
  topPatterns: Array<{ pattern: string; detections: number }>;
}

export function AbuseDetection() {
  const [patterns, setPatterns] = useState<AbusePattern[]>([]);
  const [stats, setStats] = useState<AbuseDetectionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingPattern, setEditingPattern] = useState<AbusePattern | null>(null);

  // Form state
  const [formData, setFormData] = useState({
    pattern: '',
    description: '',
    severity: 'medium' as const,
    threshold: 10,
    timeWindow: 60,
    isActive: true,
    autoBlock: false,
    blockDuration: 60
  });

  const fetchPatterns = async () => {
    try {
      const response = await fetch('/api/admin/security/abuse-patterns');
      if (!response.ok) throw new Error('Failed to fetch abuse patterns');
      
      const data = await response.json();
      setPatterns(data);
    } catch (error) {
      console.error('Error fetching abuse patterns:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/security/abuse-stats');
      if (!response.ok) throw new Error('Failed to fetch abuse detection stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching abuse detection stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchPatterns(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreatePattern = async () => {
    try {
      const response = await fetch('/api/admin/security/abuse-patterns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create abuse pattern');

      await fetchPatterns();
      setShowCreateDialog(false);
      setFormData({
        pattern: '',
        description: '',
        severity: 'medium',
        threshold: 10,
        timeWindow: 60,
        isActive: true,
        autoBlock: false,
        blockDuration: 60
      });
    } catch (error) {
      console.error('Error creating abuse pattern:', error);
    }
  };

  const handleUpdatePattern = async (id: string, updates: Partial<AbusePattern>) => {
    try {
      const response = await fetch(`/api/admin/security/abuse-patterns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update abuse pattern');

      await fetchPatterns();
      setEditingPattern(null);
    } catch (error) {
      console.error('Error updating abuse pattern:', error);
    }
  };

  const handleDeletePattern = async (id: string) => {
    if (!confirm('Are you sure you want to delete this abuse pattern?')) return;

    try {
      const response = await fetch(`/api/admin/security/abuse-patterns/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete abuse pattern');

      await fetchPatterns();
    } catch (error) {
      console.error('Error deleting abuse pattern:', error);
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

  const getSeverityIcon = (severity: string) => {
    const icons = {
      low: Shield,
      medium: AlertTriangle,
      high: AlertTriangle,
      critical: Ban
    };
    const Icon = icons[severity as keyof typeof icons] || AlertTriangle;
    return <Icon className="h-4 w-4" />;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading abuse detection data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Abuse Detection</h2>
          <p className="text-gray-600">Configure and monitor abuse pattern detection</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Pattern
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create Abuse Detection Pattern</DialogTitle>
              <DialogDescription>
                Define patterns to detect and prevent abusive behavior
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="pattern">Pattern Name</Label>
                <Input
                  id="pattern"
                  value={formData.pattern}
                  onChange={(e) => setFormData({ ...formData, pattern: e.target.value })}
                  placeholder="e.g., Rapid API Calls"
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
                  placeholder="Describe what this pattern detects"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="threshold">Detection Threshold</Label>
                <Input
                  id="threshold"
                  type="number"
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: parseInt(e.target.value) })}
                  placeholder="Number of violations to trigger"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="timeWindow">Time Window (minutes)</Label>
                <Input
                  id="timeWindow"
                  type="number"
                  value={formData.timeWindow}
                  onChange={(e) => setFormData({ ...formData, timeWindow: parseInt(e.target.value) })}
                  placeholder="Detection window in minutes"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blockDuration">Block Duration (minutes)</Label>
                <Input
                  id="blockDuration"
                  type="number"
                  value={formData.blockDuration}
                  onChange={(e) => setFormData({ ...formData, blockDuration: parseInt(e.target.value) })}
                  placeholder="How long to block IPs"
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
              <div className="flex items-center space-x-2">
                <Switch
                  id="autoBlock"
                  checked={formData.autoBlock}
                  onCheckedChange={(checked) => setFormData({ ...formData, autoBlock: checked })}
                />
                <Label htmlFor="autoBlock">Auto-block IPs</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreatePattern}>Create Pattern</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalPatterns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active Patterns</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activePatterns}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Blocked IPs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.blockedIPs}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Detections Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.detectionsToday}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Abuse Patterns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Abuse Detection Patterns</CardTitle>
          <CardDescription>
            Configure patterns to detect and prevent abusive behavior
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pattern</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Severity</TableHead>
                <TableHead>Threshold</TableHead>
                <TableHead>Time Window</TableHead>
                <TableHead>Auto-block</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {patterns.map((pattern) => (
                <TableRow key={pattern.id}>
                  <TableCell className="font-medium">{pattern.pattern}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {pattern.description}
                  </TableCell>
                  <TableCell>
                    <Badge className={getSeverityColor(pattern.severity)}>
                      <div className="flex items-center gap-1">
                        {getSeverityIcon(pattern.severity)}
                        {pattern.severity}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell>{pattern.threshold}</TableCell>
                  <TableCell>{pattern.timeWindow}m</TableCell>
                  <TableCell>
                    <Badge variant={pattern.autoBlock ? 'destructive' : 'secondary'}>
                      {pattern.autoBlock ? 'Yes' : 'No'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={pattern.isActive ? 'default' : 'secondary'}>
                      {pattern.isActive ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingPattern(pattern)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeletePattern(pattern.id)}
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

      {/* Top Patterns */}
      {stats?.topPatterns && stats.topPatterns.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Most Active Patterns</CardTitle>
            <CardDescription>
              Patterns with the most detections
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.topPatterns.map((item, index) => (
                <div key={item.pattern} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium">{item.pattern}</span>
                    <Badge variant="outline">{item.detections} detections</Badge>
                  </div>
                  <Badge variant="secondary">
                    #{index + 1}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

'use client';

import { 
  Plus, 
  Edit, 
  Trash2, 
  Shield,
  Ban,
  RefreshCw,
  Clock,
  CheckCircle,
  AlertTriangle
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

interface IPAccessRule {
  id: string;
  ipAddress: string;
  cidr?: string;
  type: 'whitelist' | 'blacklist';
  reason: string;
  isActive: boolean;
  expiresAt?: string;
  createdAt: string;
  createdBy: string;
}

interface IPManagementStats {
  totalRules: number;
  whitelistRules: number;
  blacklistRules: number;
  activeRules: number;
  expiredRules: number;
  recentBlocks: Array<{ ip: string; reason: string; time: string }>;
}

export function IPManagement() {
  const [rules, setRules] = useState<IPAccessRule[]>([]);
  const [stats, setStats] = useState<IPManagementStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingRule, setEditingRule] = useState<IPAccessRule | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'whitelist' | 'blacklist'>('all');

  // Form state
  const [formData, setFormData] = useState({
    ipAddress: '',
    cidr: '',
    type: 'blacklist' as const,
    reason: '',
    isActive: true,
    expiresAt: '',
    createdBy: 'admin'
  });

  const fetchRules = async () => {
    try {
      const response = await fetch('/api/admin/security/ip-rules');
      if (!response.ok) throw new Error('Failed to fetch IP rules');
      
      const data = await response.json();
      setRules(data);
    } catch (error) {
      console.error('Error fetching IP rules:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/security/ip-stats');
      if (!response.ok) throw new Error('Failed to fetch IP management stats');
      
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching IP management stats:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchRules(), fetchStats()]);
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCreateRule = async () => {
    try {
      const response = await fetch('/api/admin/security/ip-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (!response.ok) throw new Error('Failed to create IP rule');

      await fetchRules();
      setShowCreateDialog(false);
      setFormData({
        ipAddress: '',
        cidr: '',
        type: 'blacklist',
        reason: '',
        isActive: true,
        expiresAt: '',
        createdBy: 'admin'
      });
    } catch (error) {
      console.error('Error creating IP rule:', error);
    }
  };

  const handleUpdateRule = async (id: string, updates: Partial<IPAccessRule>) => {
    try {
      const response = await fetch(`/api/admin/security/ip-rules/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });

      if (!response.ok) throw new Error('Failed to update IP rule');

      await fetchRules();
      setEditingRule(null);
    } catch (error) {
      console.error('Error updating IP rule:', error);
    }
  };

  const handleDeleteRule = async (id: string) => {
    if (!confirm('Are you sure you want to delete this IP rule?')) return;

    try {
      const response = await fetch(`/api/admin/security/ip-rules/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) throw new Error('Failed to delete IP rule');

      await fetchRules();
    } catch (error) {
      console.error('Error deleting IP rule:', error);
    }
  };

  const getTypeIcon = (type: string) => {
    return type === 'whitelist' ? (
      <Shield className="h-4 w-4 text-green-500" />
    ) : (
      <Ban className="h-4 w-4 text-red-500" />
    );
  };

  const getTypeColor = (type: string) => {
    return type === 'whitelist' 
      ? 'bg-green-100 text-green-800' 
      : 'bg-red-100 text-red-800';
  };

  const isExpired = (expiresAt?: string) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  const getStatusIcon = (rule: IPAccessRule) => {
    if (!rule.isActive) return <Clock className="h-4 w-4 text-gray-400" />;
    if (isExpired(rule.expiresAt)) return <AlertTriangle className="h-4 w-4 text-orange-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const filteredRules = rules.filter(rule => {
    if (filterType === 'all') return true;
    return rule.type === filterType;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <RefreshCw className="h-6 w-6 animate-spin text-gray-500" />
        <span className="ml-2 text-gray-500">Loading IP management data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">IP Access Management</h2>
          <p className="text-gray-600">Manage IP whitelist and blacklist rules</p>
        </div>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create IP Access Rule</DialogTitle>
              <DialogDescription>
                Add IP addresses to whitelist or blacklist
              </DialogDescription>
            </DialogHeader>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ipAddress">IP Address</Label>
                <Input
                  id="ipAddress"
                  value={formData.ipAddress}
                  onChange={(e) => setFormData({ ...formData, ipAddress: e.target.value })}
                  placeholder="192.168.1.1"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cidr">CIDR (Optional)</Label>
                <Input
                  id="cidr"
                  value={formData.cidr}
                  onChange={(e) => setFormData({ ...formData, cidr: e.target.value })}
                  placeholder="192.168.1.0/24"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Rule Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => setFormData({ ...formData, type: value as any })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="whitelist">Whitelist (Allow)</SelectItem>
                    <SelectItem value="blacklist">Blacklist (Block)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiresAt">Expires At (Optional)</Label>
                <Input
                  id="expiresAt"
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label htmlFor="reason">Reason</Label>
                <Input
                  id="reason"
                  value={formData.reason}
                  onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                  placeholder="Reason for this rule"
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
              <Button onClick={handleCreateRule}>Create Rule</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalRules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Whitelist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.whitelistRules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Blacklist</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.blacklistRules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Active</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeRules}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Expired</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.expiredRules}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <Card>
        <CardHeader>
          <CardTitle>Filter Rules</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Button
              variant={filterType === 'all' ? 'default' : 'outline'}
              onClick={() => setFilterType('all')}
            >
              All Rules
            </Button>
            <Button
              variant={filterType === 'whitelist' ? 'default' : 'outline'}
              onClick={() => setFilterType('whitelist')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Whitelist
            </Button>
            <Button
              variant={filterType === 'blacklist' ? 'default' : 'outline'}
              onClick={() => setFilterType('blacklist')}
            >
              <Ban className="h-4 w-4 mr-2" />
              Blacklist
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* IP Rules Table */}
      <Card>
        <CardHeader>
          <CardTitle>IP Access Rules</CardTitle>
          <CardDescription>
            Manage IP whitelist and blacklist rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>IP Address</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Created By</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell className="font-mono text-sm">
                    {rule.ipAddress}
                    {rule.cidr && (
                      <div className="text-xs text-gray-500">/{rule.cidr}</div>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(rule.type)}>
                      <div className="flex items-center gap-1">
                        {getTypeIcon(rule.type)}
                        {rule.type}
                      </div>
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">{rule.reason}</TableCell>
                  <TableCell className="text-sm">{rule.createdBy}</TableCell>
                  <TableCell className="text-sm">
                    {rule.expiresAt ? (
                      <div className={isExpired(rule.expiresAt) ? 'text-orange-600' : ''}>
                        {new Date(rule.expiresAt).toLocaleDateString()}
                      </div>
                    ) : (
                      'Never'
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(rule)}
                      <span className="text-sm">
                        {!rule.isActive ? 'Inactive' : 
                         isExpired(rule.expiresAt) ? 'Expired' : 'Active'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
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

      {/* Recent Blocks */}
      {stats?.recentBlocks && stats.recentBlocks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recent Blocks</CardTitle>
            <CardDescription>
              Recently blocked IP addresses
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {stats.recentBlocks.map((block, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm">{block.ip}</span>
                    <span className="text-sm text-gray-600">{block.reason}</span>
                  </div>
                  <span className="text-sm text-gray-500">{block.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

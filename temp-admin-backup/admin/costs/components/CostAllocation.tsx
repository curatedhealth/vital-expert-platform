'use client';

import { Plus, Edit, Trash2, Settings, Users, Building2, CheckCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { costAnalyticsService, CostAllocationRule } from '@/services/cost-analytics.service';


export function CostAllocation() {
  const [rules, setRules] = useState<CostAllocationRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingRule, setEditingRule] = useState<CostAllocationRule | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'even_split' as 'even_split' | 'usage_based' | 'custom',
    tenantId: '',
    departmentId: '',
    isActive: true,
    rules: {}
  });

  const fetchRules = async () => {
    try {
      const data = await costAnalyticsService.getCostAllocationRules();
      setRules(data);
    } catch (error) {
      console.error('Error fetching allocation rules:', error);
      toast.error('Failed to load cost allocation rules');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingRule) {
        await costAnalyticsService.updateBudgetConfiguration(editingRule.id, formData as any);
        toast.success('Allocation rule updated successfully');
      } else {
        await costAnalyticsService.createCostAllocationRule(formData);
        toast.success('Allocation rule created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingRule(null);
      resetForm();
      fetchRules();
    } catch (error) {
      console.error('Error saving allocation rule:', error);
      toast.error('Failed to save allocation rule');
    }
  };

  const handleEdit = (rule: CostAllocationRule) => {
    setEditingRule(rule);
    setFormData({
      name: rule.name,
      type: rule.type,
      tenantId: rule.tenantId || '',
      departmentId: rule.departmentId || '',
      isActive: rule.isActive,
      rules: rule.rules
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this allocation rule?')) {
      return;
    }

    try {
      await costAnalyticsService.deleteBudgetConfiguration(id);
      toast.success('Allocation rule deleted successfully');
      fetchRules();
    } catch (error) {
      console.error('Error deleting allocation rule:', error);
      toast.error('Failed to delete allocation rule');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'even_split',
      tenantId: '',
      departmentId: '',
      isActive: true,
      rules: {}
    });
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'even_split':
        return 'bg-blue-100 text-blue-800';
      case 'usage_based':
        return 'bg-green-100 text-green-800';
      case 'custom':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeDescription = (type: string) => {
    switch (type) {
      case 'even_split':
        return 'Split costs equally among all users/tenants';
      case 'usage_based':
        return 'Allocate costs based on actual usage';
      case 'custom':
        return 'Custom allocation rules and formulas';
      default:
        return 'Unknown allocation type';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <Settings className="h-4 w-4 text-gray-400" />
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Rules</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rules.length}</div>
            <p className="text-xs text-muted-foreground">
              Allocation rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Even Split</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.type === 'even_split').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Equal distribution rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usage Based</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.type === 'usage_based').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Usage-based rules
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custom</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {rules.filter(r => r.type === 'custom').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Custom allocation rules
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Cost Allocation Rules</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingRule(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Rule
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingRule ? 'Edit Allocation Rule' : 'Create New Allocation Rule'}
              </DialogTitle>
              <DialogDescription>
                Define how costs should be allocated across users, tenants, or departments.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Rule Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Production Cost Allocation"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Allocation Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'even_split' | 'usage_based' | 'custom') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="even_split">Even Split</SelectItem>
                    <SelectItem value="usage_based">Usage Based</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-gray-500">
                  {getTypeDescription(formData.type)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tenantId">Tenant ID (Optional)</Label>
                  <Input
                    id="tenantId"
                    value={formData.tenantId}
                    onChange={(e) => setFormData({ ...formData, tenantId: e.target.value })}
                    placeholder="tenant-123"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="departmentId">Department ID (Optional)</Label>
                  <Input
                    id="departmentId"
                    value={formData.departmentId}
                    onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                    placeholder="dept-456"
                  />
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

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingRule ? 'Update' : 'Create'} Rule
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Rules Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Scope</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map((rule) => (
                <TableRow key={rule.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-gray-500">
                        {getTypeDescription(rule.type)}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getTypeColor(rule.type)}>
                      {rule.type.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {rule.tenantId && (
                        <div className="flex items-center space-x-1">
                          <Building2 className="h-3 w-3" />
                          <span>Tenant: {rule.tenantId}</span>
                        </div>
                      )}
                      {rule.departmentId && (
                        <div className="flex items-center space-x-1">
                          <Users className="h-3 w-3" />
                          <span>Dept: {rule.departmentId}</span>
                        </div>
                      )}
                      {!rule.tenantId && !rule.departmentId && (
                        <span className="text-gray-500">Global</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(rule.isActive)}
                      <span className="text-sm">
                        {rule.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(rule.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(rule)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(rule.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {rules.length === 0 && (
            <div className="text-center py-8">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No allocation rules found</p>
              <p className="text-sm text-gray-400 mt-2">
                Create your first allocation rule to start distributing costs
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Help Section */}
      <Card>
        <CardHeader>
          <CardTitle>Allocation Rule Types</CardTitle>
          <CardDescription>
            Understanding different cost allocation methods
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Even Split</h4>
              <p className="text-sm text-gray-600 mb-2">
                Distributes costs equally among all users or tenants.
              </p>
              <p className="text-xs text-gray-500">
                Best for: Fair distribution when usage is similar
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Usage Based</h4>
              <p className="text-sm text-gray-600 mb-2">
                Allocates costs proportionally based on actual usage.
              </p>
              <p className="text-xs text-gray-500">
                Best for: Fair distribution based on consumption
              </p>
            </div>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Custom</h4>
              <p className="text-sm text-gray-600 mb-2">
                Define custom formulas and rules for cost allocation.
              </p>
              <p className="text-xs text-gray-500">
                Best for: Complex allocation requirements
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

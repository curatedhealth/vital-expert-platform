'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash2, DollarSign, AlertTriangle, CheckCircle } from 'lucide-react';
import { costAnalyticsService, BudgetConfiguration } from '@/services/cost-analytics.service';
import { toast } from 'sonner';

export function BudgetManager() {
  const [budgets, setBudgets] = useState<BudgetConfiguration[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState<BudgetConfiguration | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: 'daily' as 'daily' | 'weekly' | 'monthly',
    amount: 0,
    warningThreshold: 70,
    criticalThreshold: 90,
    isActive: true,
    tenantId: '',
    userId: ''
  });

  const fetchBudgets = async () => {
    try {
      const data = await costAnalyticsService.getCostAllocationRules();
      setBudgets(data as any); // Type assertion for now
    } catch (error) {
      console.error('Error fetching budgets:', error);
      toast.error('Failed to load budget configurations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingBudget) {
        await costAnalyticsService.updateBudgetConfiguration(editingBudget.id, formData);
        toast.success('Budget updated successfully');
      } else {
        await costAnalyticsService.createBudgetConfiguration(formData);
        toast.success('Budget created successfully');
      }
      
      setIsDialogOpen(false);
      setEditingBudget(null);
      resetForm();
      fetchBudgets();
    } catch (error) {
      console.error('Error saving budget:', error);
      toast.error('Failed to save budget configuration');
    }
  };

  const handleEdit = (budget: BudgetConfiguration) => {
    setEditingBudget(budget);
    setFormData({
      name: budget.name,
      type: budget.type,
      amount: budget.amount,
      warningThreshold: budget.warningThreshold,
      criticalThreshold: budget.criticalThreshold,
      isActive: budget.isActive,
      tenantId: budget.tenantId || '',
      userId: budget.userId || ''
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this budget configuration?')) {
      return;
    }

    try {
      await costAnalyticsService.deleteBudgetConfiguration(id);
      toast.success('Budget deleted successfully');
      fetchBudgets();
    } catch (error) {
      console.error('Error deleting budget:', error);
      toast.error('Failed to delete budget configuration');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: 'daily',
      amount: 0,
      warningThreshold: 70,
      criticalThreshold: 90,
      isActive: true,
      tenantId: '',
      userId: ''
    });
  };

  const getBudgetTypeColor = (type: string) => {
    switch (type) {
      case 'daily':
        return 'bg-blue-100 text-blue-800';
      case 'weekly':
        return 'bg-green-100 text-green-800';
      case 'monthly':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <AlertTriangle className="h-4 w-4 text-gray-400" />
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
            <CardTitle className="text-sm font-medium">Total Budgets</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{budgets.length}</div>
            <p className="text-xs text-muted-foreground">
              Active configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Daily Budgets</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.type === 'daily').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Daily configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Weekly Budgets</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.type === 'weekly').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Weekly configurations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monthly Budgets</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {budgets.filter(b => b.type === 'monthly').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Monthly configurations
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Budget Configurations</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              setEditingBudget(null);
              resetForm();
            }}>
              <Plus className="h-4 w-4 mr-2" />
              Create Budget
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>
                {editingBudget ? 'Edit Budget' : 'Create New Budget'}
              </DialogTitle>
              <DialogDescription>
                Configure budget limits and alert thresholds for cost monitoring.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Budget Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Daily Production Budget"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="type">Budget Type</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value: 'daily' | 'weekly' | 'monthly') => 
                    setFormData({ ...formData, type: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Budget Amount ($)</Label>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  placeholder="100.00"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="warningThreshold">Warning Threshold (%)</Label>
                  <Input
                    id="warningThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.warningThreshold}
                    onChange={(e) => setFormData({ ...formData, warningThreshold: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="criticalThreshold">Critical Threshold (%)</Label>
                  <Input
                    id="criticalThreshold"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.criticalThreshold}
                    onChange={(e) => setFormData({ ...formData, criticalThreshold: parseInt(e.target.value) || 0 })}
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
                  {editingBudget ? 'Update' : 'Create'} Budget
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Budgets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Warning</TableHead>
                <TableHead>Critical</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {budgets.map((budget) => (
                <TableRow key={budget.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{budget.name}</p>
                      {budget.tenantId && (
                        <p className="text-sm text-gray-500">Tenant: {budget.tenantId}</p>
                      )}
                      {budget.userId && (
                        <p className="text-sm text-gray-500">User: {budget.userId}</p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getBudgetTypeColor(budget.type)}>
                      {budget.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${budget.amount.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{budget.warningThreshold}%</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">{budget.criticalThreshold}%</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(budget.isActive)}
                      <span className="text-sm">
                        {budget.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {new Date(budget.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEdit(budget)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(budget.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {budgets.length === 0 && (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No budget configurations found</p>
              <p className="text-sm text-gray-400 mt-2">
                Create your first budget to start monitoring costs
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

'use client';

import { Building2, Search, Download, AlertTriangle, CheckCircle, DollarSign } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { costAnalyticsService, CostByTenant as CostByTenantType } from '@/services/cost-analytics.service';


export function CostByTenant() {
  const [tenants, setTenants] = useState<CostByTenantType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchTenants = async () => {
    try {
      const data = await costAnalyticsService.getCostByTenant();
      setTenants(data);
    } catch (error) {
      console.error('Error fetching tenant costs:', error);
      toast.error('Failed to load tenant cost data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenants();
  }, []);

  const filteredTenants = tenants.filter(tenant =>
    tenant.tenantName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getBudgetStatusColor = (status: string) => {
    switch (status) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-green-100 text-green-800 border-green-200';
    }
  };

  const getBudgetStatusIcon = (status: string) => {
    switch (status) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4" />;
      default:
        return <CheckCircle className="h-4 w-4" />;
    }
  };

  const exportToCSV = () => {
    const headers = ['Tenant', 'Daily Cost', 'Monthly Cost', 'Requests', 'Avg Cost/Request', 'Budget Status', 'Budget Used %'];
    const rows = filteredTenants.map(tenant => [
      tenant.tenantName,
      tenant.dailyCost.toFixed(2),
      tenant.monthlyCost.toFixed(2),
      tenant.requestCount,
      tenant.averageCostPerRequest.toFixed(4),
      tenant.budgetStatus,
      tenant.budgetUsed.toFixed(1)
    ]);

    const csvContent = [headers, ...rows].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenant-costs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tenants</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tenants.length}</div>
            <p className="text-xs text-muted-foreground">
              Active organizations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Daily Cost</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${tenants.reduce((sum, tenant) => sum + tenant.dailyCost, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Across all tenants
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Budget Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {tenants.filter(t => t.budgetStatus !== 'under').length}
            </div>
            <p className="text-xs text-muted-foreground">
              Tenants over budget
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Actions */}
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search tenants..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button onClick={exportToCSV} variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>Cost by Tenant</CardTitle>
          <CardDescription>
            Daily and monthly costs broken down by organization
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tenant</TableHead>
                <TableHead>Daily Cost</TableHead>
                <TableHead>Monthly Cost</TableHead>
                <TableHead>Requests</TableHead>
                <TableHead>Avg Cost/Request</TableHead>
                <TableHead>Budget Status</TableHead>
                <TableHead>Top Models</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTenants.map((tenant) => (
                <TableRow key={tenant.tenantId}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{tenant.tenantName}</p>
                      <p className="text-sm text-gray-500">{tenant.tenantId}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${tenant.dailyCost.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${tenant.monthlyCost.toFixed(2)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">{tenant.requestCount.toLocaleString()}</div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">${tenant.averageCostPerRequest.toFixed(4)}</div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Badge className={getBudgetStatusColor(tenant.budgetStatus)}>
                        <div className="flex items-center space-x-1">
                          {getBudgetStatusIcon(tenant.budgetStatus)}
                          <span className="capitalize">{tenant.budgetStatus}</span>
                        </div>
                      </Badge>
                      <span className="text-sm text-gray-500">
                        {tenant.budgetUsed.toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {tenant.topModels.slice(0, 2).map((model, index) => (
                        <div key={model.model} className="flex items-center justify-between text-sm">
                          <span className="truncate max-w-20">{model.model}</span>
                          <span className="text-gray-500">{model.percentage.toFixed(1)}%</span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredTenants.length === 0 && (
            <div className="text-center py-8">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No tenants found</p>
              {searchTerm && (
                <p className="text-sm text-gray-400 mt-2">
                  Try adjusting your search terms
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

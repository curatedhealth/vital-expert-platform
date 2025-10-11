'use client';

import { useState, useEffect } from 'react';
import { TenantManagementService, TenantFilters, Organization, TenantPagination } from '@/services/tenant-management.service';
import TenantTable from './TenantTable';
import CreateTenantDialog from './CreateTenantDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Building2, AlertTriangle, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface TenantManagementViewerProps {
  initialStats: {
    totalOrganizations: number;
    activeOrganizations: number;
    totalUsers: number;
    totalDepartments: number;
    totalRoles: number;
    subscriptionBreakdown: Record<string, number>;
  };
}

export default function TenantManagementViewer({
  initialStats,
}: TenantManagementViewerProps) {
  const [filters, setFilters] = useState<TenantFilters>({});
  const [data, setData] = useState<Organization[]>([]);
  const [pagination, setPagination] = useState<TenantPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);

  const tenantService = new TenantManagementService();

  const loadData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await tenantService.getOrganizations(filters, { page, limit: 50 });
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: TenantFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCreateTenant = async (tenantData: {
    name: string;
    slug: string;
    subscription_tier: string;
    max_users: number;
    max_projects: number;
    settings?: Record<string, any>;
    metadata?: Record<string, any>;
  }) => {
    try {
      const { user } = await tenantService.getCurrentUser();
      await tenantService.createOrganization({
        ...tenantData,
        subscription_status: 'active'
      }, user.id);
      await loadData(pagination.page); // Refresh data
    } catch (err) {
      throw err; // Re-throw to be handled by dialog
    }
  };

  const handleEditTenant = (org: Organization) => {
    setSelectedOrg(org);
    // TODO: Open edit dialog
  };

  const handleViewDetails = (org: Organization) => {
    setSelectedOrg(org);
    // Details are shown in the table dialog
  };

  const handleInviteUser = (org: Organization) => {
    // TODO: Open invite user dialog
    console.log('Invite user to org:', org.name);
  };

  const handleReset = () => {
    setFilters({});
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  // Load data when filters or page changes
  useEffect(() => {
    loadData(pagination.page);
  }, [filters, pagination.page]);

  return (
    <div className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Filters</CardTitle>
            <div className="flex items-center gap-2">
              {Object.values(filters).some(value => value !== undefined && value !== '') && (
                <Button variant="outline" size="sm" onClick={handleReset}>
                  <X className="h-4 w-4 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search organizations..."
                value={filters.search || ''}
                onChange={(e) => handleFiltersChange({ ...filters, search: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionTier">Subscription Tier</Label>
              <Select
                value={filters.subscriptionTier || ''}
                onValueChange={(value) => handleFiltersChange({ ...filters, subscriptionTier: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All tiers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All tiers</SelectItem>
                  <SelectItem value="starter">Starter</SelectItem>
                  <SelectItem value="professional">Professional</SelectItem>
                  <SelectItem value="enterprise">Enterprise</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subscriptionStatus">Status</Label>
              <Select
                value={filters.subscriptionStatus || ''}
                onValueChange={(value) => handleFiltersChange({ ...filters, subscriptionStatus: value || undefined })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="trial">Trial</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="isActive">Active Only</Label>
              <Select
                value={filters.isActive === undefined ? '' : filters.isActive.toString()}
                onValueChange={(value) => {
                  if (value === '') {
                    handleFiltersChange({ ...filters, isActive: undefined });
                  } else {
                    handleFiltersChange({ ...filters, isActive: value === 'true' });
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All</SelectItem>
                  <SelectItem value="true">Active Only</SelectItem>
                  <SelectItem value="false">Inactive Only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">Organizations</h2>
          <Button onClick={() => setCreateDialogOpen(true)}>
            <Building2 className="h-4 w-4 mr-2" />
            Create Organization
          </Button>
        )}
      </div>

      <TenantTable
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onEdit={handleEditTenant}
        onViewDetails={handleViewDetails}
        onInviteUser={handleInviteUser}
        isLoading={isLoading}
      />

      <CreateTenantDialog
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateTenant={handleCreateTenant}
      />
    </div>
  );
}

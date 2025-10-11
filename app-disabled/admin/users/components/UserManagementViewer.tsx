'use client';

import { useState, useEffect } from 'react';
import { UserManagementService, UserFilters as UserFiltersType, UserProfile, UserPagination } from '@/services/user-management.service';
import UserFilters from './UserFilters';
import UserTable from './UserTable';
import UserRoleDialog from './UserRoleDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface UserManagementViewerProps {
  initialFilterOptions: {
    roles: string[];
    organizations: string[];
    departments: string[];
  };
  initialStats: {
    total: number;
    active: number;
    inactive: number;
    roleCounts: Record<string, number>;
    orgCounts: Record<string, number>;
  };
}

export default function UserManagementViewer({
  initialFilterOptions,
  initialStats,
}: UserManagementViewerProps) {
  const [filters, setFilters] = useState<UserFiltersType>({});
  const [data, setData] = useState<UserProfile[]>([]);
  const [pagination, setPagination] = useState<UserPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [roleDialog, setRoleDialog] = useState<{
    isOpen: boolean;
    userId: string;
    currentRole: string;
    userName: string;
  }>({
    isOpen: false,
    userId: '',
    currentRole: '',
    userName: ''
  });

  const userService = new UserManagementService();

  const loadData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await userService.getUsers(filters, { page, limit: 50 });
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: UserFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleRoleChange = (userId: string, currentRole: string) => {
    const user = data.find(u => u.id === userId);
    setRoleDialog({
      isOpen: true,
      userId,
      currentRole,
      userName: user?.full_name || user?.email || 'Unknown User'
    });
  };

  const handleRoleUpdate = async (userId: string, newRole: string) => {
    try {
      const { user } = await userService.getCurrentUser();
      await userService.updateUserRole(userId, newRole, user.id);
      await loadData(pagination.page); // Refresh data
    } catch (err) {
      throw err; // Re-throw to be handled by dialog
    }
  };

  const handleStatusToggle = async (userId: string, isActive: boolean) => {
    try {
      const { user } = await userService.getCurrentUser();
      await userService.toggleUserStatus(userId, isActive, user.id);
      await loadData(pagination.page); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update user status');
    }
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

      <UserFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        filterOptions={initialFilterOptions}
      />

      <UserTable
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRoleChange={handleRoleChange}
        onStatusToggle={handleStatusToggle}
        isLoading={isLoading}
      />

      <UserRoleDialog
        userId={roleDialog.userId}
        currentRole={roleDialog.currentRole}
        userName={roleDialog.userName}
        isOpen={roleDialog.isOpen}
        onOpenChange={(open) => setRoleDialog(prev => ({ ...prev, isOpen: open }))}
        onRoleChange={handleRoleUpdate}
      />
    </div>
  );
}

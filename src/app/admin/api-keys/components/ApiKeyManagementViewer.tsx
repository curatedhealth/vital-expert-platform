'use client';

import { useState, useEffect } from 'react';
import { ApiKeyManagementService, ApiKeyFilters as ApiKeyFiltersType, ApiKey, ApiKeyPagination } from '@/services/api-key-management.service';
import ApiKeyFilters from './ApiKeyFilters';
import ApiKeyTable from './ApiKeyTable';
import CreateApiKeyDialog from './CreateApiKeyDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Key, AlertTriangle } from 'lucide-react';

interface ApiKeyManagementViewerProps {
  initialProviders: Array<{ id: string; name: string }>;
  initialStats: {
    total: number;
    active: number;
    inactive: number;
    recentlyUsed: number;
    providerCounts: Record<string, number>;
  };
}

export default function ApiKeyManagementViewer({
  initialProviders,
  initialStats
}: ApiKeyManagementViewerProps) {
  const [filters, setFilters] = useState<ApiKeyFiltersType>({});
  const [data, setData] = useState<ApiKey[]>([]);
  const [pagination, setPagination] = useState<ApiKeyPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

  const apiKeyService = new ApiKeyManagementService();

  const loadData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await apiKeyService.getApiKeys(filters, { page, limit: 50 });
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load API keys');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: ApiKeyFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleCreateKey = async (keyData: { provider_id: string; key_name: string; api_key: string; expires_at?: string }) => {
    try {
      const { user } = await apiKeyService.getCurrentUser();
      const result = await apiKeyService.createApiKey(keyData, user.id);
      await loadData(pagination.page); // Refresh data
      return result;
    } catch (err) {
      throw err; // Re-throw to be handled by dialog
    }
  };

  const handleRotateKey = async (keyId: string) => {
    try {
      const newApiKey = prompt('Enter the new API key:');
      if (!newApiKey) return;

      const { user } = await apiKeyService.getCurrentUser();
      await apiKeyService.rotateApiKey(keyId, newApiKey, user.id);
      await loadData(pagination.page); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to rotate API key');
    }
  };

  const handleRevokeKey = async (keyId: string) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return;
    }

    try {
      const { user } = await apiKeyService.getCurrentUser();
      await apiKeyService.revokeApiKey(keyId, user.id);
      await loadData(pagination.page); // Refresh data
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to revoke API key');
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

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-medium text-gray-900">API Keys</h2>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Key className="h-4 w-4 mr-2" />
          Create API Key
        </Button>
      </div>

      <ApiKeyFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        providers={initialProviders}
      />

      <ApiKeyTable
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onRotate={handleRotateKey}
        onRevoke={handleRevokeKey}
        isLoading={isLoading}
      />

      <CreateApiKeyDialog
        isOpen={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onCreateKey={handleCreateKey}
        providers={initialProviders}
      />
    </div>
  );
}

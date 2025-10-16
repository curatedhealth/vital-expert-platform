'use client';

import { AlertTriangle } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { AuditService, AuditLogFilters as AuditLogFiltersType, AuditLogEntry, AuditLogPagination } from '@/services/audit.service';

import AuditLogFilters from './AuditLogFilters';
import AuditLogTable from './AuditLogTable';

interface AuditLogViewerProps {
  initialFilterOptions: {
    actions: string[];
    resourceTypes: string[];
  };
  initialStats: {
    total: number;
    successful: number;
    failed: number;
    successRate: number;
    actionCounts: Record<string, number>;
  };
}

export default function AuditLogViewer({
  initialFilterOptions,
  initialStats
}: AuditLogViewerProps) {
  const [filters, setFilters] = useState<AuditLogFiltersType>({});
  const [data, setData] = useState<AuditLogEntry[]>([]);
  const [pagination, setPagination] = useState<AuditLogPagination>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const auditService = new AuditService();

  const loadData = async (page: number = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await auditService.getAuditLogs(filters, { page, limit: 50 });
      setData(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load audit logs');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFiltersChange = (newFilters: AuditLogFilters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
  };

  const handleExport = async () => {
    try {
      const csvContent = await auditService.exportToCSV(filters);
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to export audit logs');
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

      <AuditLogFilters
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleReset}
        filterOptions={initialFilterOptions}
      />

      <AuditLogTable
        data={data}
        pagination={pagination}
        onPageChange={handlePageChange}
        onExport={handleExport}
        isLoading={isLoading}
      />
    </div>
  );
}

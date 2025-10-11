'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Filter, X } from 'lucide-react';

export interface AuditLogFilters {
  userId?: string;
  action?: string;
  resourceType?: string;
  success?: boolean;
  startDate?: string;
  endDate?: string;
  search?: string;
}

interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  onFiltersChange: (filters: AuditLogFilters) => void;
  onReset: () => void;
  filterOptions: {
    actions: string[];
    resourceTypes: string[];
  };
}

export default function AuditLogFilters({
  filters,
  onFiltersChange,
  onReset,
  filterOptions
}: AuditLogFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleFilterChange = (key: keyof AuditLogFilters, value: string | boolean | undefined) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== null
  );

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="outline" size="sm" onClick={onReset}>
                <X className="h-4 w-4 mr-1" />
                Clear
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
            >
              <Filter className="h-4 w-4 mr-1" />
              {isOpen ? 'Hide' : 'Show'} Filters
            </Button>
          </div>
        </div>
      </CardHeader>
      
      {isOpen && (
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Search */}
            <div className="space-y-2">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search actions, resources..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />
            </div>

            {/* Action Filter */}
            <div className="space-y-2">
              <Label htmlFor="action">Action</Label>
              <Select
                value={filters.action || ''}
                onValueChange={(value) => handleFilterChange('action', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All actions</SelectItem>
                  {filterOptions.actions.map((action) => (
                    <SelectItem key={action} value={action}>
                      {action}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Resource Type Filter */}
            <div className="space-y-2">
              <Label htmlFor="resourceType">Resource Type</Label>
              <Select
                value={filters.resourceType || ''}
                onValueChange={(value) => handleFilterChange('resourceType', value || undefined)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All resource types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All resource types</SelectItem>
                  {filterOptions.resourceTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Success Filter */}
            <div className="space-y-2">
              <Label htmlFor="success">Status</Label>
              <Select
                value={filters.success === undefined ? '' : filters.success.toString()}
                onValueChange={(value) => {
                  if (value === '') {
                    handleFilterChange('success', undefined);
                  } else {
                    handleFilterChange('success', value === 'true');
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="true">Success</SelectItem>
                  <SelectItem value="false">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* User ID Filter */}
            <div className="space-y-2">
              <Label htmlFor="userId">User ID</Label>
              <Input
                id="userId"
                placeholder="Filter by user ID"
                value={filters.userId || ''}
                onChange={(e) => handleFilterChange('userId', e.target.value)}
              />
            </div>

            {/* Date Range */}
            <div className="space-y-2">
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value || undefined)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value || undefined)}
              />
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

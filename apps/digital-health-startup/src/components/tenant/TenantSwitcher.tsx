'use client';

/**
 * Tenant Switcher Component
 * Allows users to switch between tenants they have access to
 */

import React, { useState } from 'react';
import { useTenantContext, useAvailableTenants, useTenant } from '@/contexts/TenantContext';
import { Button } from '@vital/ui/components/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vital/ui/components/dropdown-menu';
import { Badge } from '@vital/ui/components/badge';
import { Check, Building2, ChevronDown } from 'lucide-react';

export function TenantSwitcher() {
  const { switchTenant, isPlatformAdmin } = useTenantContext();
  const currentTenant = useTenant();
  const availableTenants = useAvailableTenants();
  const [isLoading, setIsLoading] = useState(false);

  const handleSwitchTenant = async (tenantId: string) => {
    if (tenantId === currentTenant?.id) return;

    setIsLoading(true);
    try {
      await switchTenant(tenantId);
      // Optionally reload the page to refresh all data
      // window.location.reload();
    } catch (error) {
      console.error('Failed to switch tenant:', error);
      alert('Failed to switch tenant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  if (availableTenants.length === 0) {
    return null;
  }

  // Don't show switcher if user only has one tenant
  if (availableTenants.length === 1 && !isPlatformAdmin) {
    return null;
  }

  const getTenantBadgeColor = (type: string) => {
    switch (type) {
      case 'platform':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'client':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'solution':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'industry':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2"
          disabled={isLoading}
        >
          <Building2 className="h-4 w-4" />
          <span className="max-w-[150px] truncate">
            {currentTenant?.name || 'Select Tenant'}
          </span>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-[280px]">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />

        {availableTenants.map((tenant) => (
          <DropdownMenuItem
            key={tenant.id}
            onClick={() => handleSwitchTenant(tenant.id)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <span className="font-medium">{tenant.name}</span>
                {tenant.id === currentTenant?.id && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
              </div>
              {tenant.domain && (
                <span className="text-xs text-muted-foreground">
                  {tenant.domain}
                </span>
              )}
            </div>
            <div className="flex flex-col gap-1 items-end">
              <Badge
                variant="outline"
                className={`text-xs ${getTenantBadgeColor(tenant.type)}`}
              >
                {tenant.type}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {tenant.subscription_tier}
              </span>
            </div>
          </DropdownMenuItem>
        ))}

        {isPlatformAdmin && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-purple-600 font-medium"
              onClick={() => {
                // Navigate to admin panel
                window.location.href = '/admin/tenants';
              }}
            >
              <Building2 className="mr-2 h-4 w-4" />
              Manage Tenants
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Compact tenant badge (for displaying current tenant in header)
 */
export function TenantBadge() {
  const currentTenant = useTenant();

  if (!currentTenant) {
    return null;
  }

  const getTenantColor = (type: string) => {
    switch (type) {
      case 'platform':
        return 'bg-purple-500';
      case 'client':
        return 'bg-blue-500';
      case 'solution':
        return 'bg-green-500';
      case 'industry':
        return 'bg-orange-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-gray-100 border border-gray-200">
      <div className={`h-2 w-2 rounded-full ${getTenantColor(currentTenant.type)}`} />
      <span className="text-sm font-medium text-gray-700">
        {currentTenant.name}
      </span>
      <Badge variant="outline" className="text-xs">
        {currentTenant.type}
      </Badge>
    </div>
  );
}

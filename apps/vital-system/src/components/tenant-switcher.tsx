'use client';

/**
 * Tenant Switcher Component
 * Allows system admin to switch between tenants
 */

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useTenant } from '@/contexts/tenant-context';
import { useShowTenantSwitcher, useTenantUI } from '@/hooks/use-tenant-config';
import { createClient } from '@/lib/supabase/client';
import type { Organization } from '@/types/multitenancy.types';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Check, ChevronDown, Building2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantWithConfig extends Organization {
  config?: {
    ui_config?: {
      logo_url?: string;
      primary_color?: string;
    };
  };
}

export function TenantSwitcher() {
  const router = useRouter();
  const { tenant, reload, configuration } = useTenant();
  const showSwitcher = useShowTenantSwitcher();
  const uiConfig = useTenantUI();
  const [tenants, setTenants] = useState<TenantWithConfig[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const supabase = createClient();

  // Only show for system tenant
  if (!showSwitcher) {
    return null;
  }

  /**
   * Load available tenants with their configurations
   */
  useEffect(() => {
    async function loadTenants() {
      try {
        // Get organizations
        const { data: orgs, error: orgsError } = await supabase
          .from('organizations')
          .select('*')
          .eq('is_active', true)
          .in('tenant_type', ['system', 'digital_health', 'pharmaceuticals'])
          .order('name');

        if (orgsError) {
          console.error('[TenantSwitcher] Error loading tenants:', orgsError);
          return;
        }

        if (!orgs) {
          setTenants([]);
          return;
        }

        // Get configurations for each tenant
        const { data: configs, error: configsError } = await supabase
          .from('tenant_configurations')
          .select('tenant_id, ui_config')
          .in('tenant_id', orgs.map(o => o.id));

        if (configsError) {
          console.error('[TenantSwitcher] Error loading configs:', configsError);
        }

        // Merge organizations with their configs
        const tenantsWithConfigs = orgs.map(org => ({
          ...org,
          config: configs?.find(c => c.tenant_id === org.id),
        }));

        setTenants(tenantsWithConfigs);
      } catch (error) {
        console.error('[TenantSwitcher] Error:', error);
      }
    }

    if (isOpen) {
      loadTenants();
    }
  }, [isOpen, supabase]);

  /**
   * Switch to a different tenant
   */
  const switchTenant = async (targetTenant: Organization) => {
    if (targetTenant.id === tenant?.id) {
      setIsOpen(false);
      return;
    }

    try {
      setIsLoading(true);

      // Update user's organization association
      const { error } = await supabase
        .from('users')
        .update({ organization_id: targetTenant.id })
        .eq('id', (await supabase.auth.getUser()).data.user?.id);

      if (error) {
        throw new Error(`Failed to switch tenant: ${error.message}`);
      }

      // Reload tenant configuration
      reload();

      // Refresh the page to update all contexts
      router.refresh();

      setIsOpen(false);
    } catch (error) {
      console.error('[TenantSwitcher] Error switching tenant:', error);
      alert('Failed to switch tenant. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Get tenant display info
   */
  const getTenantInfo = (tenantType: string) => {
    switch (tenantType) {
      case 'system':
        return { label: 'VITAL Expert Platform', color: 'text-indigo-600' };
      case 'digital_health':
        return { label: 'Digital Health', color: 'text-green-600' };
      case 'pharmaceuticals':
        return { label: 'Pharmaceuticals', color: 'text-blue-600' };
      default:
        return { label: 'Standard', color: 'text-gray-600' };
    }
  };

  const currentTenantInfo = tenant ? getTenantInfo(tenant.tenant_type) : null;
  const currentLogo = uiConfig?.logo_url;

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-2 min-w-[200px]"
          disabled={isLoading}
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : currentLogo ? (
            <div className="relative w-5 h-5 flex-shrink-0">
              <Image
                src={currentLogo}
                alt={tenant?.name || 'Tenant'}
                fill
                className="object-contain"
              />
            </div>
          ) : (
            <Building2 className="h-4 w-4" />
          )}
          <span className="flex-1 text-left truncate">
            {tenant?.name || 'Select Tenant'}
          </span>
          <ChevronDown className="h-4 w-4 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[250px]">
        <DropdownMenuLabel>Switch Tenant</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {tenants.map((t) => {
          const info = getTenantInfo(t.tenant_type);
          const isActive = t.id === tenant?.id;
          const logo = t.config?.ui_config?.logo_url;

          return (
            <DropdownMenuItem
              key={t.id}
              onClick={() => switchTenant(t)}
              disabled={isLoading}
              className={cn(
                'flex items-center justify-between cursor-pointer gap-3',
                isActive && 'bg-accent'
              )}
            >
              <div className="flex items-center gap-3 flex-1">
                {logo ? (
                  <div className="relative w-6 h-6 flex-shrink-0">
                    <Image
                      src={logo}
                      alt={t.name}
                      fill
                      className="object-contain"
                    />
                  </div>
                ) : (
                  <Building2 className="h-5 w-5 text-muted-foreground" />
                )}
                <div className="flex flex-col">
                  <span className="font-medium">{t.name}</span>
                  <span className={cn('text-xs', info.color)}>{info.label}</span>
                </div>
              </div>
              {isActive && <Check className="h-4 w-4 flex-shrink-0" />}
            </DropdownMenuItem>
          );
        })}
        {tenants.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="text-muted-foreground">No tenants available</span>
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

'use client';

/**
 * Tenant Logo Component
 * Displays the current tenant's logo
 */

import React from 'react';
import Image from 'next/image';
import { useTenantLogo, useTenantBranding } from '@/hooks/use-tenant-config';
import { useTenant } from '@/contexts/tenant-context';
import { Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TenantLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  showFallback?: boolean;
  fallbackIcon?: React.ReactNode;
}

const sizeMap = {
  sm: { container: 'w-5 h-5', icon: 'h-4 w-4' },
  md: { container: 'w-8 h-8', icon: 'h-6 w-6' },
  lg: { container: 'w-12 h-12', icon: 'h-10 w-10' },
  xl: { container: 'w-16 h-16', icon: 'h-14 w-14' },
};

/**
 * TenantLogo - Display tenant logo with fallback
 *
 * @example
 * <TenantLogo size="md" />
 *
 * @example With custom fallback
 * <TenantLogo
 *   size="lg"
 *   fallbackIcon={<CustomIcon />}
 * />
 */
export function TenantLogo({
  size = 'md',
  className,
  showFallback = true,
  fallbackIcon,
}: TenantLogoProps) {
  const logoUrl = useTenantLogo();
  const { tenant } = useTenant();
  const sizes = sizeMap[size];

  if (!logoUrl) {
    if (!showFallback) return null;

    return (
      <div className={cn('flex items-center justify-center', sizes.container, className)}>
        {fallbackIcon || <Building2 className={cn(sizes.icon, 'text-muted-foreground')} />}
      </div>
    );
  }

  return (
    <div className={cn('relative flex-shrink-0', sizes.container, className)}>
      <Image
        src={logoUrl}
        alt={tenant?.name || 'Tenant Logo'}
        fill
        className="object-contain"
        priority
      />
    </div>
  );
}

/**
 * TenantLogoWithName - Logo with tenant name
 */
interface TenantLogoWithNameProps {
  size?: 'sm' | 'md' | 'lg';
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  showSubtitle?: boolean;
}

export function TenantLogoWithName({
  size = 'md',
  orientation = 'horizontal',
  className,
  showSubtitle = false,
}: TenantLogoWithNameProps) {
  const { tenant } = useTenant();
  const { primaryColor } = useTenantBranding();

  const isHorizontal = orientation === 'horizontal';

  const getTenantSubtitle = (tenantType: string) => {
    switch (tenantType) {
      case 'system':
        return 'Multi-Tenant Platform';
      case 'digital_health':
        return 'Digital Health Innovation';
      case 'pharmaceuticals':
        return 'Pharma Compliance & Development';
      default:
        return '';
    }
  };

  return (
    <div
      className={cn(
        'flex items-center',
        isHorizontal ? 'flex-row gap-3' : 'flex-col gap-2',
        className
      )}
    >
      <TenantLogo size={size} />
      <div className={cn('flex flex-col', isHorizontal ? 'text-left' : 'text-center')}>
        <span className="font-semibold text-foreground">
          {tenant?.name || 'Loading...'}
        </span>
        {showSubtitle && tenant && (
          <span
            className="text-xs"
            style={{ color: primaryColor }}
          >
            {getTenantSubtitle(tenant.tenant_type)}
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * TenantBrandedHeader - Full branded header with logo and name
 */
interface TenantBrandedHeaderProps {
  className?: string;
  showDivider?: boolean;
}

export function TenantBrandedHeader({
  className,
  showDivider = true,
}: TenantBrandedHeaderProps) {
  const { primaryColor } = useTenantBranding();

  return (
    <div className={cn('py-4', className)}>
      <TenantLogoWithName size="lg" showSubtitle />
      {showDivider && (
        <div
          className="mt-4 h-0.5 w-full"
          style={{ backgroundColor: primaryColor }}
        />
      )}
    </div>
  );
}

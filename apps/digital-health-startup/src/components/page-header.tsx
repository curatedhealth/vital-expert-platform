'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  /** The icon to display (Lucide icon component) */
  icon: LucideIcon;
  /** The main page title */
  title: string;
  /** Subtitle/description text */
  description?: string;
  /** Optional badge to display next to title */
  badge?: {
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
  };
  /** Optional action buttons on the right */
  actions?: React.ReactNode;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Standardized page header component
 * Ensures consistent size, layout, and positioning across all pages
 */
export function PageHeader({
  icon: Icon,
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b bg-background', className)}>
      <div className="px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left side: Icon + Title + Description */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <Icon className="h-8 w-8 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-3xl font-bold">{title}</h1>
                {badge && (
                  <Badge variant={badge.variant || 'secondary'}>
                    {badge.label}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-sm text-muted-foreground mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Actions */}
          {actions && (
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/**
 * Compact version for pages with limited vertical space
 */
export function PageHeaderCompact({
  icon: Icon,
  title,
  description,
  badge,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('border-b bg-background', className)}>
      <div className="px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Left side: Icon + Title */}
          <div className="flex items-center gap-2.5 flex-1 min-w-0">
            <Icon className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base font-semibold">{title}</h1>
                {badge && (
                  <Badge variant={badge.variant || 'secondary'} className="text-xs">
                    {badge.label}
                  </Badge>
                )}
              </div>
              {description && (
                <p className="text-xs text-muted-foreground leading-none mt-0.5">
                  {description}
                </p>
              )}
            </div>
          </div>

          {/* Right side: Actions */}
          {actions && (
            <div className="flex items-center gap-2 ml-4 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


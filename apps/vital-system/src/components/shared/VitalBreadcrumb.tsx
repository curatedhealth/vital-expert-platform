/**
 * VitalBreadcrumb - Shared Breadcrumb Component
 *
 * A reusable breadcrumb component built on top of shadcn/ui breadcrumb.
 * Supports automatic path-based breadcrumbs or custom breadcrumb items.
 *
 * @example
 * // Simple usage with items
 * <VitalBreadcrumb
 *   items={[
 *     { label: 'Discover', href: '/discover' },
 *     { label: 'Tools', href: '/discover/tools' },
 *     { label: 'My Tool' } // Current page (no href)
 *   ]}
 * />
 *
 * @example
 * // With home link
 * <VitalBreadcrumb
 *   showHome
 *   items={[
 *     { label: 'Tools', href: '/discover/tools' },
 *     { label: 'My Tool' }
 *   ]}
 * />
 */

'use client';

import * as React from 'react';
import Link from 'next/link';
import { Home } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { cn } from '@/lib/utils';

export interface BreadcrumbItemConfig {
  /** Display label for the breadcrumb item */
  label: string;
  /** URL to navigate to. If omitted, item is treated as current page */
  href?: string;
  /** Optional icon to display before the label */
  icon?: React.ReactNode;
}

export interface VitalBreadcrumbProps {
  /** Array of breadcrumb items to display */
  items: BreadcrumbItemConfig[];
  /** Whether to show a home icon link as the first item */
  showHome?: boolean;
  /** Custom home URL (defaults to '/dashboard') */
  homeHref?: string;
  /** Custom home label for screen readers */
  homeLabel?: string;
  /** Additional CSS classes for the container */
  className?: string;
  /** Custom separator component */
  separator?: React.ReactNode;
}

/**
 * VitalBreadcrumb Component
 *
 * Provides consistent breadcrumb navigation across the VITAL platform.
 * Automatically handles current page styling and Next.js Link integration.
 */
export function VitalBreadcrumb({
  items,
  showHome = false,
  homeHref = '/dashboard',
  homeLabel = 'Home',
  className,
  separator,
}: VitalBreadcrumbProps) {
  // Don't render if no items
  if (!items || items.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className={cn('mb-4', className)}>
      <BreadcrumbList>
        {/* Home link */}
        {showHome && (
          <>
            <BreadcrumbItem>
              <BreadcrumbLink asChild>
                <Link href={homeHref} className="flex items-center gap-1">
                  <Home className="h-4 w-4" />
                  <span className="sr-only">{homeLabel}</span>
                </Link>
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
          </>
        )}

        {/* Breadcrumb items */}
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          const isCurrentPage = !item.href || isLast;

          return (
            <React.Fragment key={item.href || item.label}>
              <BreadcrumbItem>
                {isCurrentPage ? (
                  // Current page - not clickable
                  <BreadcrumbPage className="flex items-center gap-1.5">
                    {item.icon}
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  // Link to another page
                  <BreadcrumbLink asChild>
                    <Link href={item.href!} className="flex items-center gap-1.5">
                      {item.icon}
                      {item.label}
                    </Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>

              {/* Separator (not after last item) */}
              {!isLast && (
                <BreadcrumbSeparator>{separator}</BreadcrumbSeparator>
              )}
            </React.Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

VitalBreadcrumb.displayName = 'VitalBreadcrumb';

export default VitalBreadcrumb;

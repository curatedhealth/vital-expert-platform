'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/components/ui/sidebar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface SidebarPageHeaderProps {
  /** The icon to display (Lucide icon component) */
  icon: LucideIcon;
  /** The main page title */
  title: string;
  /** Subtitle/description text */
  description?: string;
  /** Additional CSS classes for the container */
  className?: string;
}

/**
 * Page header component for sidebar - responsive to sidebar collapse state
 * Shows full title and description when expanded, icon only when collapsed
 */
export function SidebarPageHeader({
  icon: Icon,
  title,
  description,
  className,
}: SidebarPageHeaderProps) {
  const { state } = useSidebar();
  const isCollapsed = state === 'collapsed';

  if (isCollapsed) {
    // Collapsed state: Show only icon with tooltip
    return (
      <TooltipProvider>
        <Tooltip delayDuration={0}>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'flex items-center justify-center px-2 py-4 border-b',
                className
              )}
            >
              <Icon className="h-6 w-6 text-primary" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="right" className="max-w-xs">
            <div className="space-y-1">
              <p className="font-semibold">{title}</p>
              {description && (
                <p className="text-xs text-muted-foreground">{description}</p>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Expanded state: Show full title and description
  return (
    <div className={cn('px-4 py-4 border-b space-y-1', className)}>
      <div className="flex items-center gap-3">
        <Icon className="h-6 w-6 text-primary flex-shrink-0" />
        <h2 className="text-lg font-semibold tracking-tight">{title}</h2>
      </div>
      {description && (
        <p className="text-sm text-muted-foreground pl-9">{description}</p>
      )}
    </div>
  );
}


/**
 * AssetEmptyState - Shared empty state component for asset pages
 *
 * Used by: Agents, Tools, Skills, Prompts, Knowledge pages
 */
'use client';

import React from 'react';
import { LucideIcon, Search, Plus } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface AssetEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  showAction?: boolean;
}

export function AssetEmptyState({
  icon: Icon = Search,
  title,
  description,
  actionLabel,
  onAction,
  showAction = true,
}: AssetEmptyStateProps) {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <Icon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="font-semibold text-foreground mb-2">{title}</h3>
        <p className="text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>
        {showAction && actionLabel && onAction && (
          <Button onClick={onAction}>
            <Plus className="h-4 w-4 mr-2" />
            {actionLabel}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default AssetEmptyState;

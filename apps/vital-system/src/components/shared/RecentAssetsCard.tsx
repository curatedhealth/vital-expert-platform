/**
 * RecentAssetsCard - Shared recent items card for asset overview pages
 *
 * Used by: Tools, Skills, Prompts, Workflows pages
 */
'use client';

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export interface RecentAssetItem {
  id: string;
  name: string;
  description?: string;
  category?: string;
  status?: string;
  statusVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
  badges?: Array<{
    label: string;
    variant?: 'default' | 'secondary' | 'destructive' | 'outline';
    className?: string;
  }>;
}

export interface RecentAssetsCardProps {
  title: string;
  items: RecentAssetItem[];
  maxItems?: number;
  onItemClick?: (item: RecentAssetItem) => void;
  columns?: number;
}

export function RecentAssetsCard({
  title,
  items,
  maxItems = 6,
  onItemClick,
  columns = 3,
}: RecentAssetsCardProps) {
  const gridCols = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
  }[columns] || 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3';

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className={`grid ${gridCols} gap-4`}>
          {items.slice(0, maxItems).map((item) => (
            <div
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className={`p-4 border rounded-lg transition-colors ${
                onItemClick
                  ? 'hover:bg-stone-50 dark:hover:bg-stone-800 cursor-pointer'
                  : ''
              }`}
            >
              <div className="font-medium">{item.name}</div>
              {item.description && (
                <div className="text-sm text-stone-500 line-clamp-2 mt-1">
                  {item.description}
                </div>
              )}
              {(item.badges?.length || item.category || item.status) && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {item.category && (
                    <Badge variant="outline" className="text-xs">
                      {item.category}
                    </Badge>
                  )}
                  {item.status && (
                    <Badge variant={item.statusVariant || 'secondary'} className="text-xs">
                      {item.status}
                    </Badge>
                  )}
                  {item.badges?.map((badge, idx) => (
                    <Badge
                      key={idx}
                      variant={badge.variant || 'secondary'}
                      className={`text-xs ${badge.className || ''}`}
                    >
                      {badge.label}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default RecentAssetsCard;

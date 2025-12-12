/**
 * VitalAssetTable - Table Layout for Assets
 *
 * Data table component for displaying assets in a tabular format.
 * Uses shadcn/ui Table components with sorting, selection, and actions.
 *
 * @example
 * ```tsx
 * <VitalAssetTable
 *   assets={myTools}
 *   loading={isLoading}
 *   selectable
 *   selectedIds={selected}
 *   onSelectionChange={setSelected}
 *   onAssetClick={handleClick}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Badge,
  Button,
  Checkbox,
  Skeleton,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui';
import {
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  Edit,
  Trash2,
  Play,
  ExternalLink,
} from 'lucide-react';
import type {
  VitalAssetTableProps,
  VitalAsset,
  AssetTableColumn,
} from './types';
import {
  ASSET_TYPE_CONFIG,
  LIFECYCLE_BADGES,
  getCategoryConfig,
  getLifecycleConfig,
} from './constants';
import {
  isToolAsset,
  isSkillAsset,
  getAssetDescription,
} from './types';

// ============================================================================
// DEFAULT COLUMNS
// ============================================================================

const defaultColumns: AssetTableColumn[] = [
  {
    key: 'name',
    header: 'Name',
    sortable: true,
    render: (asset) => {
      const categoryConfig = getCategoryConfig(asset.category);
      const Icon = categoryConfig.icon;
      return (
        <div className="flex items-center gap-3">
          <div
            className={cn(
              'p-1.5 rounded-lg shrink-0',
              categoryConfig.bgColor,
              categoryConfig.borderColor,
              'border'
            )}
          >
            <Icon className={cn('h-4 w-4', categoryConfig.color)} />
          </div>
          <div className="min-w-0">
            <span className="font-medium text-sm truncate block">
              {asset.name}
            </span>
            {asset.slug && (
              <span className="text-xs text-muted-foreground truncate block">
                {asset.slug}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    key: 'type',
    header: 'Type',
    width: '100px',
    sortable: true,
    render: (asset) => {
      const config = ASSET_TYPE_CONFIG[asset.asset_type];
      if (!config) return null;
      const Icon = config.icon;
      return (
        <Badge className={cn('gap-1', config.bgColor, config.color)}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    key: 'category',
    header: 'Category',
    width: '150px',
    sortable: true,
    render: (asset) => {
      if (!asset.category) return <span className="text-muted-foreground">—</span>;
      const categoryConfig = getCategoryConfig(asset.category);
      return (
        <Badge
          className={cn(
            'gap-1 border',
            categoryConfig.bgColor,
            categoryConfig.color,
            categoryConfig.borderColor
          )}
        >
          {asset.category}
        </Badge>
      );
    },
  },
  {
    key: 'lifecycle_stage',
    header: 'Status',
    width: '120px',
    sortable: true,
    render: (asset) => {
      const config = getLifecycleConfig(asset.lifecycle_stage);
      if (!config) return <span className="text-muted-foreground">—</span>;
      const Icon = config.icon;
      return (
        <Badge className={cn('gap-1', config.bgColor, config.color)}>
          <Icon className="h-3 w-3" />
          {config.label}
        </Badge>
      );
    },
  },
  {
    key: 'is_active',
    header: 'Active',
    width: '80px',
    sortable: true,
    render: (asset) => (
      <div className="flex items-center justify-center">
        <div
          className={cn(
            'h-2.5 w-2.5 rounded-full',
            asset.is_active ? 'bg-green-500' : 'bg-gray-400'
          )}
        />
      </div>
    ),
  },
  {
    key: 'updated_at',
    header: 'Updated',
    width: '120px',
    sortable: true,
    render: (asset) => {
      if (!asset.updated_at) return <span className="text-muted-foreground">—</span>;
      const date = new Date(asset.updated_at);
      return (
        <span className="text-sm text-muted-foreground">
          {date.toLocaleDateString()}
        </span>
      );
    },
  },
];

// ============================================================================
// SORT ICON
// ============================================================================

interface SortIconProps {
  column: string;
  sortColumn?: string;
  sortDirection?: 'asc' | 'desc';
}

const SortIcon: React.FC<SortIconProps> = ({
  column,
  sortColumn,
  sortDirection,
}) => {
  if (sortColumn !== column) {
    return <ChevronsUpDown className="h-4 w-4 text-muted-foreground/50" />;
  }
  return sortDirection === 'asc' ? (
    <ChevronUp className="h-4 w-4" />
  ) : (
    <ChevronDown className="h-4 w-4" />
  );
};

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message?: string;
  colSpan: number;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No assets found',
  colSpan,
}) => (
  <TableRow>
    <TableCell colSpan={colSpan} className="h-32 text-center">
      <div className="flex flex-col items-center justify-center py-8">
        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
          <svg
            className="w-6 h-6 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"
            />
          </svg>
        </div>
        <p className="text-muted-foreground text-sm">{message}</p>
      </div>
    </TableCell>
  </TableRow>
);

// ============================================================================
// SKELETON ROW
// ============================================================================

interface SkeletonRowProps {
  colSpan: number;
  hasSelection: boolean;
  hasActions: boolean;
}

const SkeletonRow: React.FC<SkeletonRowProps> = ({
  colSpan,
  hasSelection,
  hasActions,
}) => (
  <TableRow>
    {hasSelection && (
      <TableCell className="w-[50px]">
        <Skeleton className="h-4 w-4" />
      </TableCell>
    )}
    <TableCell>
      <div className="flex items-center gap-3">
        <Skeleton className="h-8 w-8 rounded-lg" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-14 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-20 rounded-full" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-5 w-18 rounded-full" />
    </TableCell>
    <TableCell className="text-center">
      <Skeleton className="h-2.5 w-2.5 rounded-full mx-auto" />
    </TableCell>
    <TableCell>
      <Skeleton className="h-4 w-16" />
    </TableCell>
    {hasActions && (
      <TableCell>
        <div className="flex gap-1 justify-end">
          <Skeleton className="h-8 w-8 rounded-md" />
          <Skeleton className="h-8 w-8 rounded-md" />
        </div>
      </TableCell>
    )}
  </TableRow>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAssetTable - Data table for assets
 */
export const VitalAssetTable: React.FC<VitalAssetTableProps> = ({
  assets,
  columns = defaultColumns,
  loading = false,
  skeletonCount = 5,
  isAdmin = false,
  selectable = false,
  selectedIds = [],
  onSelectionChange,
  sortColumn,
  sortDirection = 'asc',
  onSort,
  className,
  onAssetClick,
  onEdit,
  onDelete,
}) => {
  const hasActions = isAdmin && (onEdit || onDelete);
  const totalColumns = columns.length + (selectable ? 1 : 0) + (hasActions ? 1 : 0);

  // Handle select all
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onSelectionChange?.(assets.map((a) => a.id));
    } else {
      onSelectionChange?.([]);
    }
  };

  // Handle single selection
  const handleSelect = (id: string, checked: boolean) => {
    if (checked) {
      onSelectionChange?.([...selectedIds, id]);
    } else {
      onSelectionChange?.(selectedIds.filter((i) => i !== id));
    }
  };

  // Check if all/some selected
  const allSelected = assets.length > 0 && selectedIds.length === assets.length;
  const someSelected = selectedIds.length > 0 && selectedIds.length < assets.length;

  return (
    <div className={cn('rounded-md border', className)}>
      <Table>
        <TableHeader>
          <TableRow>
            {selectable && (
              <TableHead className="w-[50px]">
                <Checkbox
                  checked={allSelected}
                  onCheckedChange={handleSelectAll}
                  aria-label="Select all"
                />
              </TableHead>
            )}
            {columns.map((column) => (
              <TableHead
                key={column.key}
                style={{ width: column.width }}
                className={cn(column.sortable && 'cursor-pointer select-none')}
                onClick={() => column.sortable && onSort?.(column.key)}
              >
                <div className="flex items-center gap-1">
                  {column.header}
                  {column.sortable && (
                    <SortIcon
                      column={column.key}
                      sortColumn={sortColumn}
                      sortDirection={sortDirection}
                    />
                  )}
                </div>
              </TableHead>
            ))}
            {hasActions && (
              <TableHead className="w-[100px] text-right">Actions</TableHead>
            )}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            Array.from({ length: skeletonCount }).map((_, index) => (
              <SkeletonRow
                key={index}
                colSpan={totalColumns}
                hasSelection={selectable}
                hasActions={!!hasActions}
              />
            ))
          ) : assets.length === 0 ? (
            <EmptyState colSpan={totalColumns} />
          ) : (
            assets.map((asset) => (
              <TableRow
                key={asset.id}
                className={cn(
                  'cursor-pointer',
                  selectedIds.includes(asset.id) && 'bg-muted/50'
                )}
                onClick={() => onAssetClick?.(asset)}
                data-state={selectedIds.includes(asset.id) ? 'selected' : undefined}
              >
                {selectable && (
                  <TableCell
                    className="w-[50px]"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <Checkbox
                      checked={selectedIds.includes(asset.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelect(asset.id, checked)
                      }
                      aria-label={`Select ${asset.name}`}
                    />
                  </TableCell>
                )}
                {columns.map((column) => (
                  <TableCell key={column.key} style={{ width: column.width }}>
                    {column.render
                      ? column.render(asset)
                      : (asset as Record<string, unknown>)[column.key]?.toString() || '—'}
                  </TableCell>
                ))}
                {hasActions && (
                  <TableCell
                    className="text-right"
                    onClick={(e: React.MouseEvent) => e.stopPropagation()}
                  >
                    <TooltipProvider>
                      <div className="flex justify-end gap-1">
                        {onEdit && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => onEdit(asset)}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Edit</TooltipContent>
                          </Tooltip>
                        )}
                        {onDelete && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => onDelete(asset)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Delete</TooltipContent>
                          </Tooltip>
                        )}
                      </div>
                    </TooltipProvider>
                  </TableCell>
                )}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

VitalAssetTable.displayName = 'VitalAssetTable';

export default VitalAssetTable;

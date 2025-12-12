/**
 * VitalAssetKanban - Kanban Board Layout for Assets
 *
 * Kanban board component for displaying assets in column-based layout.
 * Supports drag-and-drop between columns and custom column configurations.
 * Uses shadcn/ui components for consistent styling.
 *
 * @example
 * ```tsx
 * <VitalAssetKanban
 *   assets={myTools}
 *   columns={customColumns}
 *   loading={isLoading}
 *   draggable
 *   onAssetMove={handleMove}
 *   onAssetClick={handleClick}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  ScrollArea,
  Skeleton,
} from '../ui';
import { GripVertical, Plus } from 'lucide-react';
import { VitalAssetCard, VitalAssetCardSkeleton } from './VitalAssetCard';
import type {
  VitalAssetKanbanProps,
  VitalAsset,
  AssetKanbanColumn,
  AssetCardVariant,
} from './types';
import { DEFAULT_KANBAN_COLUMNS } from './constants';

// ============================================================================
// DRAG-AND-DROP CONTEXT
// ============================================================================

interface DragState {
  assetId: string | null;
  fromColumn: string | null;
}

interface KanbanContextValue {
  dragState: DragState;
  setDragState: React.Dispatch<React.SetStateAction<DragState>>;
  onDrop: (toColumn: string) => void;
}

const KanbanContext = React.createContext<KanbanContextValue | null>(null);

function useKanbanContext() {
  const context = React.useContext(KanbanContext);
  if (!context) {
    throw new Error('useKanbanContext must be used within VitalAssetKanban');
  }
  return context;
}

// ============================================================================
// KANBAN COLUMN
// ============================================================================

interface KanbanColumnProps {
  column: AssetKanbanColumn;
  assets: VitalAsset[];
  variant?: AssetCardVariant;
  isAdmin?: boolean;
  draggable?: boolean;
  onAssetClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  assets,
  variant = 'compact',
  isAdmin,
  draggable,
  onAssetClick,
  onEdit,
  onDelete,
}) => {
  const { dragState, setDragState, onDrop } = useKanbanContext();
  const [isDragOver, setIsDragOver] = React.useState(false);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    onDrop(column.id);
  };

  const filteredAssets = assets.filter(column.filter);
  const isMaxed = column.maxItems && filteredAssets.length >= column.maxItems;

  return (
    <div
      className={cn(
        'flex flex-col min-w-[280px] max-w-[320px] shrink-0',
        'rounded-lg border bg-muted/30',
        isDragOver && 'ring-2 ring-primary ring-offset-2',
        isMaxed && 'opacity-75'
      )}
      onDragOver={draggable ? handleDragOver : undefined}
      onDragLeave={draggable ? handleDragLeave : undefined}
      onDrop={draggable ? handleDrop : undefined}
    >
      {/* Column Header */}
      <div
        className={cn(
          'flex items-center justify-between px-4 py-3 border-b',
          column.bgColor || 'bg-muted/50'
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-semibold text-sm',
              column.color || 'text-foreground'
            )}
          >
            {column.title}
          </span>
          <Badge variant="secondary" className="text-xs">
            {filteredAssets.length}
            {column.maxItems && `/${column.maxItems}`}
          </Badge>
        </div>
      </div>

      {/* Column Content */}
      <ScrollArea className="flex-1 p-3">
        <div className="space-y-3">
          {filteredAssets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <p className="text-sm text-muted-foreground">No items</p>
              {draggable && (
                <p className="text-xs text-muted-foreground mt-1">
                  Drag items here
                </p>
              )}
            </div>
          ) : (
            filteredAssets.map((asset, index) => (
              <KanbanCard
                key={asset.id}
                asset={asset}
                variant={variant}
                isAdmin={isAdmin}
                draggable={draggable}
                columnId={column.id}
                onClick={onAssetClick}
                onEdit={onEdit}
                onDelete={onDelete}
              />
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
};

// ============================================================================
// KANBAN CARD (Draggable wrapper)
// ============================================================================

interface KanbanCardProps {
  asset: VitalAsset;
  variant?: AssetCardVariant;
  isAdmin?: boolean;
  draggable?: boolean;
  columnId: string;
  onClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({
  asset,
  variant = 'compact',
  isAdmin,
  draggable,
  columnId,
  onClick,
  onEdit,
  onDelete,
}) => {
  const { setDragState } = useKanbanContext();
  const [isDragging, setIsDragging] = React.useState(false);

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.effectAllowed = 'move';
    setIsDragging(true);
    setDragState({ assetId: asset.id, fromColumn: columnId });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragState({ assetId: null, fromColumn: null });
  };

  return (
    <div
      className={cn(
        'relative group',
        isDragging && 'opacity-50'
      )}
      draggable={draggable}
      onDragStart={draggable ? handleDragStart : undefined}
      onDragEnd={draggable ? handleDragEnd : undefined}
    >
      {draggable && (
        <div
          className={cn(
            'absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1',
            'opacity-0 group-hover:opacity-100 transition-opacity',
            'cursor-grab active:cursor-grabbing'
          )}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
      )}
      <VitalAssetCard
        asset={asset}
        variant={variant}
        isAdmin={isAdmin}
        showActions={false}
        onClick={onClick}
        onEdit={onEdit}
        onDelete={onDelete}
        className={cn(draggable && 'ml-2')}
      />
    </div>
  );
};

// ============================================================================
// SKELETON KANBAN
// ============================================================================

interface SkeletonKanbanProps {
  columnCount: number;
  cardsPerColumn: number;
  variant?: AssetCardVariant;
  className?: string;
}

const SkeletonKanban: React.FC<SkeletonKanbanProps> = ({
  columnCount,
  cardsPerColumn,
  variant = 'compact',
  className,
}) => (
  <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
    {Array.from({ length: columnCount }).map((_, colIndex) => (
      <div
        key={colIndex}
        className="flex flex-col min-w-[280px] max-w-[320px] shrink-0 rounded-lg border bg-muted/30"
      >
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-5 w-8 rounded-full" />
          </div>
        </div>
        <div className="p-3 space-y-3">
          {Array.from({ length: cardsPerColumn }).map((_, cardIndex) => (
            <VitalAssetCardSkeleton key={cardIndex} variant={variant} />
          ))}
        </div>
      </div>
    ))}
  </div>
);

// ============================================================================
// EMPTY STATE
// ============================================================================

interface EmptyStateProps {
  message?: string;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message = 'No assets to display',
  className,
}) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-16 px-4 text-center',
      'bg-muted/30 rounded-lg border border-dashed',
      className
    )}
  >
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
          d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2"
        />
      </svg>
    </div>
    <p className="text-muted-foreground text-sm">{message}</p>
  </div>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAssetKanban - Kanban board for asset management
 */
export const VitalAssetKanban: React.FC<VitalAssetKanbanProps> = ({
  assets,
  columns = DEFAULT_KANBAN_COLUMNS,
  variant = 'compact',
  loading = false,
  isAdmin = false,
  draggable = false,
  onAssetMove,
  className,
  onAssetClick,
  onEdit,
  onDelete,
}) => {
  const [dragState, setDragState] = React.useState<DragState>({
    assetId: null,
    fromColumn: null,
  });

  const handleDrop = React.useCallback(
    (toColumn: string) => {
      if (dragState.assetId && dragState.fromColumn && dragState.fromColumn !== toColumn) {
        onAssetMove?.(dragState.assetId, dragState.fromColumn, toColumn);
      }
      setDragState({ assetId: null, fromColumn: null });
    },
    [dragState, onAssetMove]
  );

  // Show skeleton loading state
  if (loading) {
    return (
      <SkeletonKanban
        columnCount={columns.length}
        cardsPerColumn={3}
        variant={variant}
        className={className}
      />
    );
  }

  // Show empty state if no assets
  if (!assets || assets.length === 0) {
    return <EmptyState className={className} />;
  }

  return (
    <KanbanContext.Provider value={{ dragState, setDragState, onDrop: handleDrop }}>
      <div className={cn('flex gap-4 overflow-x-auto pb-4', className)}>
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            assets={assets}
            variant={variant}
            isAdmin={isAdmin}
            draggable={draggable}
            onAssetClick={onAssetClick}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </KanbanContext.Provider>
  );
};

VitalAssetKanban.displayName = 'VitalAssetKanban';

export default VitalAssetKanban;

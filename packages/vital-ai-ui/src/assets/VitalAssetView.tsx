/**
 * VitalAssetView - Unified Asset View Layout
 *
 * A comprehensive view component that supports multiple view modes:
 * - Grid: Card-based responsive grid layout
 * - List: Vertical list layout
 * - Table: Data table with sorting and selection
 * - Kanban: Column-based board layout
 *
 * Includes view mode toggles, filtering, sorting, and search functionality.
 * Uses shadcn/ui components for consistent styling.
 *
 * @example
 * ```tsx
 * <VitalAssetView
 *   assets={myAssets}
 *   defaultView="grid"
 *   showViewToggle
 *   showSearch
 *   searchPlaceholder="Search assets..."
 *   onAssetClick={handleClick}
 *   isAdmin
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  Button,
  Input,
  Badge,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui';
import {
  Grid3X3,
  List,
  Table2,
  Kanban,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  X,
  ChevronDown,
  RefreshCw,
  type LucideIcon,
} from 'lucide-react';
import { VitalAssetGrid } from './VitalAssetGrid';
import { VitalAssetList } from './VitalAssetList';
import { VitalAssetTable } from './VitalAssetTable';
import { VitalAssetKanban } from './VitalAssetKanban';
import type {
  VitalAsset,
  AssetViewMode,
  AssetCardVariant,
  AssetKanbanColumn,
  AssetTableColumn,
} from './types';
import { DEFAULT_KANBAN_COLUMNS, ASSET_CATEGORIES } from './constants';

// ============================================================================
// TYPES
// ============================================================================

export type ExtendedViewMode = AssetViewMode | 'kanban';

export interface VitalAssetViewProps {
  /** Array of assets to display */
  assets: VitalAsset[];
  /** Default view mode */
  defaultView?: ExtendedViewMode;
  /** Controlled view mode */
  viewMode?: ExtendedViewMode;
  /** Called when view mode changes */
  onViewModeChange?: (mode: ExtendedViewMode) => void;
  /** Card variant for grid/list/kanban views */
  cardVariant?: AssetCardVariant;
  /** Loading state */
  loading?: boolean;
  /** Whether user has admin permissions */
  isAdmin?: boolean;
  /** Show view mode toggle */
  showViewToggle?: boolean;
  /** Available view modes */
  availableViews?: ExtendedViewMode[];
  /** Show search input */
  showSearch?: boolean;
  /** Search placeholder */
  searchPlaceholder?: string;
  /** Controlled search value */
  searchValue?: string;
  /** Called when search value changes */
  onSearchChange?: (value: string) => void;
  /** Show category filter */
  showCategoryFilter?: boolean;
  /** Available categories for filter */
  categories?: string[];
  /** Selected categories */
  selectedCategories?: string[];
  /** Called when category filter changes */
  onCategoryChange?: (categories: string[]) => void;
  /** Show sort options */
  showSort?: boolean;
  /** Sort field */
  sortField?: string;
  /** Sort direction */
  sortDirection?: 'asc' | 'desc';
  /** Called when sort changes */
  onSortChange?: (field: string, direction: 'asc' | 'desc') => void;
  /** Show refresh button */
  showRefresh?: boolean;
  /** Called when refresh is clicked */
  onRefresh?: () => void;
  /** Grid columns configuration */
  gridColumns?: {
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  /** Table columns configuration */
  tableColumns?: AssetTableColumn[];
  /** Kanban columns configuration */
  kanbanColumns?: AssetKanbanColumn[];
  /** Enable table row selection */
  tableSelectable?: boolean;
  /** Selected table row IDs */
  selectedIds?: string[];
  /** Called when table selection changes */
  onSelectionChange?: (ids: string[]) => void;
  /** Enable kanban drag and drop */
  kanbanDraggable?: boolean;
  /** Called when asset moves in kanban */
  onAssetMove?: (assetId: string, fromColumn: string, toColumn: string) => void;
  /** Additional CSS classes */
  className?: string;
  /** Header content slot */
  headerContent?: React.ReactNode;
  /** Action callbacks */
  onAssetClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
}

// ============================================================================
// VIEW MODE ICONS
// ============================================================================

const VIEW_MODE_CONFIG: Record<ExtendedViewMode, { icon: LucideIcon; label: string }> = {
  grid: { icon: Grid3X3, label: 'Grid View' },
  list: { icon: List, label: 'List View' },
  table: { icon: Table2, label: 'Table View' },
  kanban: { icon: Kanban, label: 'Kanban View' },
};

// ============================================================================
// SORT OPTIONS
// ============================================================================

const SORT_OPTIONS = [
  { field: 'name', label: 'Name' },
  { field: 'category', label: 'Category' },
  { field: 'lifecycle_stage', label: 'Status' },
  { field: 'updated_at', label: 'Last Updated' },
  { field: 'created_at', label: 'Created' },
];

// ============================================================================
// VIEW MODE TOGGLE
// ============================================================================

interface ViewModeToggleProps {
  viewMode: ExtendedViewMode;
  availableViews: ExtendedViewMode[];
  onChange: (mode: ExtendedViewMode) => void;
}

const ViewModeToggle: React.FC<ViewModeToggleProps> = ({
  viewMode,
  availableViews,
  onChange,
}) => (
  <TooltipProvider>
    <div className="flex items-center gap-1 p-1 bg-muted rounded-lg">
      {availableViews.map((mode) => {
        const config = VIEW_MODE_CONFIG[mode];
        const Icon = config.icon;
        const isActive = viewMode === mode;

        return (
          <Tooltip key={mode}>
            <TooltipTrigger asChild>
              <Button
                variant={isActive ? 'default' : 'ghost'}
                size="icon"
                className={cn(
                  'h-8 w-8',
                  isActive && 'shadow-sm'
                )}
                onClick={() => onChange(mode)}
              >
                <Icon className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{config.label}</TooltipContent>
          </Tooltip>
        );
      })}
    </div>
  </TooltipProvider>
);

// ============================================================================
// SEARCH INPUT
// ============================================================================

interface SearchInputProps {
  value: string;
  placeholder?: string;
  onChange: (value: string) => void;
  className?: string;
}

const SearchInput: React.FC<SearchInputProps> = ({
  value,
  placeholder = 'Search...',
  onChange,
  className,
}) => (
  <div className={cn('relative', className)}>
    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
    <Input
      type="search"
      placeholder={placeholder}
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      className="pl-9 pr-8 h-9"
    />
    {value && (
      <Button
        variant="ghost"
        size="icon"
        className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6"
        onClick={() => onChange('')}
      >
        <X className="h-3 w-3" />
      </Button>
    )}
  </div>
);

// ============================================================================
// CATEGORY FILTER
// ============================================================================

interface CategoryFilterProps {
  categories: string[];
  selected: string[];
  onChange: (categories: string[]) => void;
}

const CategoryFilter: React.FC<CategoryFilterProps> = ({
  categories,
  selected,
  onChange,
}) => {
  const toggleCategory = (category: string) => {
    if (selected.includes(category)) {
      onChange(selected.filter((c) => c !== category));
    } else {
      onChange([...selected, category]);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Filter className="h-4 w-4" />
          Category
          {selected.length > 0 && (
            <Badge variant="secondary" className="ml-1 h-5 px-1.5">
              {selected.length}
            </Badge>
          )}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-56 max-h-72 overflow-y-auto">
        <DropdownMenuLabel>Filter by Category</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {categories.map((category) => (
          <DropdownMenuItem
            key={category}
            onClick={() => toggleCategory(category)}
            className="gap-2"
          >
            <div
              className={cn(
                'h-4 w-4 rounded border flex items-center justify-center',
                selected.includes(category)
                  ? 'bg-primary border-primary'
                  : 'border-muted-foreground/30'
              )}
            >
              {selected.includes(category) && (
                <svg
                  className="h-3 w-3 text-primary-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={3}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              )}
            </div>
            {category}
          </DropdownMenuItem>
        ))}
        {selected.length > 0 && (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => onChange([])}>
              Clear filters
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// SORT DROPDOWN
// ============================================================================

interface SortDropdownProps {
  field: string;
  direction: 'asc' | 'desc';
  onChange: (field: string, direction: 'asc' | 'desc') => void;
}

const SortDropdown: React.FC<SortDropdownProps> = ({
  field,
  direction,
  onChange,
}) => {
  const currentOption = SORT_OPTIONS.find((opt) => opt.field === field);
  const Icon = direction === 'asc' ? SortAsc : SortDesc;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 gap-2">
          <Icon className="h-4 w-4" />
          {currentOption?.label || 'Sort'}
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-48">
        <DropdownMenuLabel>Sort by</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {SORT_OPTIONS.map((option) => (
          <DropdownMenuItem
            key={option.field}
            onClick={() =>
              onChange(
                option.field,
                option.field === field && direction === 'asc' ? 'desc' : 'asc'
              )
            }
            className="gap-2"
          >
            {option.field === field ? (
              direction === 'asc' ? (
                <SortAsc className="h-4 w-4" />
              ) : (
                <SortDesc className="h-4 w-4" />
              )
            ) : (
              <div className="w-4" />
            )}
            {option.label}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAssetView - Unified view component for all asset display modes
 */
export const VitalAssetView: React.FC<VitalAssetViewProps> = ({
  assets,
  defaultView = 'grid',
  viewMode: controlledViewMode,
  onViewModeChange,
  cardVariant = 'rich',
  loading = false,
  isAdmin = false,
  showViewToggle = true,
  availableViews = ['grid', 'list', 'table', 'kanban'],
  showSearch = true,
  searchPlaceholder = 'Search assets...',
  searchValue: controlledSearchValue,
  onSearchChange,
  showCategoryFilter = true,
  categories,
  selectedCategories: controlledSelectedCategories,
  onCategoryChange,
  showSort = true,
  sortField: controlledSortField,
  sortDirection: controlledSortDirection,
  onSortChange,
  showRefresh = false,
  onRefresh,
  gridColumns,
  tableColumns,
  kanbanColumns = DEFAULT_KANBAN_COLUMNS,
  tableSelectable = false,
  selectedIds,
  onSelectionChange,
  kanbanDraggable = false,
  onAssetMove,
  className,
  headerContent,
  onAssetClick,
  onEdit,
  onDelete,
}) => {
  // Internal state for uncontrolled mode
  const [internalViewMode, setInternalViewMode] = React.useState<ExtendedViewMode>(defaultView);
  const [internalSearchValue, setInternalSearchValue] = React.useState('');
  const [internalSelectedCategories, setInternalSelectedCategories] = React.useState<string[]>([]);
  const [internalSortField, setInternalSortField] = React.useState('name');
  const [internalSortDirection, setInternalSortDirection] = React.useState<'asc' | 'desc'>('asc');

  // Use controlled or internal state
  const viewMode = controlledViewMode ?? internalViewMode;
  const searchValue = controlledSearchValue ?? internalSearchValue;
  const selectedCategoriesState = controlledSelectedCategories ?? internalSelectedCategories;
  const sortField = controlledSortField ?? internalSortField;
  const sortDirection = controlledSortDirection ?? internalSortDirection;

  // Handlers
  const handleViewModeChange = (mode: ExtendedViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    } else {
      setInternalViewMode(mode);
    }
  };

  const handleSearchChange = (value: string) => {
    if (onSearchChange) {
      onSearchChange(value);
    } else {
      setInternalSearchValue(value);
    }
  };

  const handleCategoryChange = (cats: string[]) => {
    if (onCategoryChange) {
      onCategoryChange(cats);
    } else {
      setInternalSelectedCategories(cats);
    }
  };

  const handleSortChange = (field: string, direction: 'asc' | 'desc') => {
    if (onSortChange) {
      onSortChange(field, direction);
    } else {
      setInternalSortField(field);
      setInternalSortDirection(direction);
    }
  };

  // Extract unique categories from assets
  const availableCategories = React.useMemo(() => {
    if (categories) return categories;
    const cats = new Set<string>();
    assets.forEach((asset) => {
      if (asset.category) cats.add(asset.category);
    });
    return Array.from(cats).sort();
  }, [assets, categories]);

  // Filter and sort assets
  const filteredAssets = React.useMemo(() => {
    let result = [...assets];

    // Apply search filter
    if (searchValue) {
      const query = searchValue.toLowerCase();
      result = result.filter(
        (asset) =>
          asset.name.toLowerCase().includes(query) ||
          asset.description?.toLowerCase().includes(query) ||
          asset.category?.toLowerCase().includes(query) ||
          asset.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (selectedCategoriesState.length > 0) {
      result = result.filter(
        (asset) => asset.category && selectedCategoriesState.includes(asset.category)
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      const aVal = (a as Record<string, unknown>)[sortField];
      const bVal = (b as Record<string, unknown>)[sortField];

      if (aVal === null || aVal === undefined) return sortDirection === 'asc' ? 1 : -1;
      if (bVal === null || bVal === undefined) return sortDirection === 'asc' ? -1 : 1;

      const comparison = String(aVal).localeCompare(String(bVal));
      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return result;
  }, [assets, searchValue, selectedCategoriesState, sortField, sortDirection]);

  // Render the appropriate view
  const renderView = () => {
    const commonProps = {
      assets: filteredAssets,
      loading,
      isAdmin,
      onAssetClick,
      onEdit,
      onDelete,
    };

    switch (viewMode) {
      case 'grid':
        return (
          <VitalAssetGrid
            {...commonProps}
            variant={cardVariant}
            columns={gridColumns}
          />
        );
      case 'list':
        return <VitalAssetList {...commonProps} variant={cardVariant} />;
      case 'table':
        return (
          <VitalAssetTable
            {...commonProps}
            columns={tableColumns}
            selectable={tableSelectable}
            selectedIds={selectedIds}
            onSelectionChange={onSelectionChange}
            sortColumn={sortField}
            sortDirection={sortDirection}
            onSort={(col) => handleSortChange(col, sortDirection === 'asc' ? 'desc' : 'asc')}
          />
        );
      case 'kanban':
        return (
          <VitalAssetKanban
            {...commonProps}
            variant={cardVariant === 'rich' ? 'compact' : cardVariant}
            columns={kanbanColumns}
            draggable={kanbanDraggable}
            onAssetMove={onAssetMove}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={cn('space-y-4', className)}>
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        {/* Search */}
        {showSearch && (
          <SearchInput
            value={searchValue}
            placeholder={searchPlaceholder}
            onChange={handleSearchChange}
            className="w-64"
          />
        )}

        {/* Filters */}
        <div className="flex items-center gap-2">
          {showCategoryFilter && availableCategories.length > 0 && (
            <CategoryFilter
              categories={availableCategories}
              selected={selectedCategoriesState}
              onChange={handleCategoryChange}
            />
          )}

          {showSort && (
            <SortDropdown
              field={sortField}
              direction={sortDirection}
              onChange={handleSortChange}
            />
          )}
        </div>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Header content slot */}
        {headerContent}

        {/* Refresh button */}
        {showRefresh && onRefresh && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-9 w-9"
                  onClick={onRefresh}
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Refresh</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}

        {/* View mode toggle */}
        {showViewToggle && availableViews.length > 1 && (
          <ViewModeToggle
            viewMode={viewMode}
            availableViews={availableViews}
            onChange={handleViewModeChange}
          />
        )}
      </div>

      {/* Results info */}
      {!loading && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span>
            {filteredAssets.length === assets.length
              ? `${assets.length} assets`
              : `${filteredAssets.length} of ${assets.length} assets`}
          </span>
          {selectedCategoriesState.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs"
              onClick={() => handleCategoryChange([])}
            >
              Clear filters
              <X className="h-3 w-3 ml-1" />
            </Button>
          )}
        </div>
      )}

      {/* View content */}
      {renderView()}
    </div>
  );
};

VitalAssetView.displayName = 'VitalAssetView';

export default VitalAssetView;

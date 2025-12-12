/**
 * VitalAssetCard - Unified Asset Card Component
 *
 * A versatile card component for displaying tools, skills, workflows,
 * prompts, and other asset types. Uses shadcn/ui components for consistent styling.
 *
 * @example
 * ```tsx
 * <VitalAssetCard
 *   asset={myTool}
 *   variant="rich"
 *   onClick={handleClick}
 *   showActions
 *   isAdmin
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Badge,
  Button,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  Skeleton,
} from '../ui';
import {
  MoreHorizontal,
  Edit,
  Trash2,
  Play,
  ExternalLink,
  Plus,
  CheckCircle2,
  Clock,
  AlertCircle,
  type LucideIcon,
} from 'lucide-react';
import type {
  VitalAsset,
  VitalAssetCardProps,
  AssetCardVariant,
} from './types';
import {
  ASSET_TYPE_CONFIG,
  ASSET_CATEGORIES,
  LIFECYCLE_BADGES,
  COMPLEXITY_BADGES,
  IMPLEMENTATION_BADGES,
  DEFAULT_CATEGORY,
  getCategoryConfig,
  getLifecycleConfig,
  getComplexityConfig,
  getImplementationConfig,
} from './constants';
import {
  isToolAsset,
  isSkillAsset,
  isWorkflowAsset,
  getAssetDescription,
} from './types';

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Asset type badge
 */
interface AssetTypeBadgeProps {
  type: VitalAsset['asset_type'];
  className?: string;
}

const AssetTypeBadge: React.FC<AssetTypeBadgeProps> = ({ type, className }) => {
  const config = ASSET_TYPE_CONFIG[type];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        'gap-1 text-xs font-medium',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

/**
 * Category badge with icon
 */
interface CategoryBadgeProps {
  category?: string;
  className?: string;
}

const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className }) => {
  if (!category) return null;

  const config = getCategoryConfig(category);
  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        'gap-1 text-xs font-medium border',
        config.bgColor,
        config.color,
        config.borderColor,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {category}
    </Badge>
  );
};

/**
 * Lifecycle badge
 */
interface LifecycleBadgeProps {
  stage?: string;
  className?: string;
}

const LifecycleBadge: React.FC<LifecycleBadgeProps> = ({ stage, className }) => {
  if (!stage) return null;

  const config = getLifecycleConfig(stage);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        'gap-1 text-xs',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

/**
 * Complexity badge (for skills)
 */
interface ComplexityBadgeProps {
  level?: string;
  className?: string;
}

const ComplexityBadge: React.FC<ComplexityBadgeProps> = ({ level, className }) => {
  if (!level) return null;

  const config = getComplexityConfig(level);
  if (!config) return null;

  const Icon = config.icon;

  return (
    <Badge
      className={cn(
        'gap-1 text-xs',
        config.bgColor,
        config.color,
        className
      )}
    >
      <Icon className="h-3 w-3" />
      {config.label}
    </Badge>
  );
};

/**
 * Implementation type badge
 */
interface ImplementationBadgeProps {
  type?: string;
  className?: string;
}

const ImplementationBadge: React.FC<ImplementationBadgeProps> = ({ type, className }) => {
  if (!type) return null;

  const config = getImplementationConfig(type);
  if (!config) return null;

  return (
    <Badge
      className={cn(
        'text-xs',
        config.bgColor,
        config.color,
        className
      )}
    >
      {config.label}
    </Badge>
  );
};

/**
 * Active status indicator
 */
interface StatusIndicatorProps {
  isActive?: boolean;
  className?: string;
}

const StatusIndicator: React.FC<StatusIndicatorProps> = ({ isActive = true, className }) => (
  <div className={cn('flex items-center gap-1.5', className)}>
    <div
      className={cn(
        'h-2 w-2 rounded-full',
        isActive ? 'bg-green-500' : 'bg-gray-400'
      )}
    />
    <span className="text-xs text-muted-foreground">
      {isActive ? 'Active' : 'Inactive'}
    </span>
  </div>
);

// ============================================================================
// CARD VARIANTS
// ============================================================================

/**
 * Minimal card variant - icon + name only
 */
const MinimalCard: React.FC<VitalAssetCardProps> = ({
  asset,
  isSelected,
  className,
  onClick,
}) => {
  const categoryConfig = getCategoryConfig(asset.category);
  const Icon = categoryConfig.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      onClick={() => onClick?.(asset)}
    >
      <CardContent className="flex items-center gap-3 p-3">
        <div className={cn('p-2 rounded-lg', categoryConfig.bgColor)}>
          <Icon className={cn('h-4 w-4', categoryConfig.color)} />
        </div>
        <span className="font-medium text-sm truncate">{asset.name}</span>
      </CardContent>
    </Card>
  );
};

/**
 * Compact card variant - essential info
 */
const CompactCard: React.FC<VitalAssetCardProps> = ({
  asset,
  isSelected,
  showTypeBadge = true,
  className,
  onClick,
}) => {
  const description = getAssetDescription(asset);
  const categoryConfig = getCategoryConfig(asset.category);
  const Icon = categoryConfig.icon;

  return (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-md',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      onClick={() => onClick?.(asset)}
    >
      <CardHeader className="p-4 pb-2">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-3">
            <div className={cn('p-2 rounded-lg', categoryConfig.bgColor)}>
              <Icon className={cn('h-4 w-4', categoryConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-sm font-semibold truncate">
                {asset.name}
              </CardTitle>
              {asset.category && (
                <span className="text-xs text-muted-foreground">
                  {asset.category}
                </span>
              )}
            </div>
          </div>
          {showTypeBadge && <AssetTypeBadge type={asset.asset_type} />}
        </div>
      </CardHeader>
      {description && (
        <CardContent className="p-4 pt-0">
          <p className="text-xs text-muted-foreground line-clamp-2">
            {description}
          </p>
        </CardContent>
      )}
    </Card>
  );
};

/**
 * Rich card variant - full details with actions
 */
const RichCard: React.FC<VitalAssetCardProps> = ({
  asset,
  isSelected,
  isAdmin,
  showActions = true,
  showTypeBadge = true,
  className,
  animationDelay = 0,
  onClick,
  onEdit,
  onDelete,
  onTest,
  onViewDetails,
  onAddTo,
}) => {
  const description = getAssetDescription(asset);
  const categoryConfig = getCategoryConfig(asset.category);
  const Icon = categoryConfig.icon;

  // Get asset-specific properties
  const implementationType = isToolAsset(asset)
    ? asset.implementation_type
    : isSkillAsset(asset)
    ? asset.implementation_type
    : undefined;

  const complexityLevel = isSkillAsset(asset) ? asset.complexity_level : undefined;

  return (
    <Card
      className={cn(
        'group cursor-pointer transition-all duration-300 hover:shadow-lg',
        'animate-in fade-in slide-in-from-bottom-4',
        isSelected && 'ring-2 ring-primary',
        className
      )}
      style={{ animationDelay: `${animationDelay}ms` }}
      onClick={() => onClick?.(asset)}
    >
      <CardHeader className="p-4">
        <div className="flex items-start justify-between gap-3">
          {/* Icon and Title */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div
              className={cn(
                'p-2.5 rounded-xl shrink-0',
                'transition-transform group-hover:scale-105',
                categoryConfig.bgColor,
                categoryConfig.borderColor,
                'border'
              )}
            >
              <Icon className={cn('h-5 w-5', categoryConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold truncate">
                {asset.name}
              </CardTitle>
              <CardDescription className="mt-1 line-clamp-2 text-sm">
                {description || 'No description available'}
              </CardDescription>
            </div>
          </div>

          {/* Status & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <StatusIndicator isActive={asset.is_active} />
            {showActions && isAdmin && (
              <TooltipProvider>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onEdit?.(asset);
                        }}
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive"
                        onClick={(e: React.MouseEvent) => {
                          e.stopPropagation();
                          onDelete?.(asset);
                        }}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete</TooltipContent>
                  </Tooltip>
                </div>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="px-4 pb-2">
        {/* Badges */}
        <div className="flex flex-wrap items-center gap-2">
          {showTypeBadge && <AssetTypeBadge type={asset.asset_type} />}
          <CategoryBadge category={asset.category} />
          <LifecycleBadge stage={asset.lifecycle_stage} />
          {complexityLevel && <ComplexityBadge level={complexityLevel} />}
          {implementationType && <ImplementationBadge type={implementationType} />}
        </div>

        {/* Tags */}
        {asset.tags && asset.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {asset.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs bg-muted text-muted-foreground rounded-md"
              >
                {tag}
              </span>
            ))}
            {asset.tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs text-muted-foreground">
                +{asset.tags.length - 4} more
              </span>
            )}
          </div>
        )}
      </CardContent>

      {showActions && (
        <CardFooter className="px-4 py-3 border-t">
          <div className="flex items-center justify-between w-full">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onViewDetails?.(asset);
              }}
            >
              <ExternalLink className="h-3 w-3 mr-1" />
              View Details
            </Button>
            <div className="flex items-center gap-2">
              {onTest && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onTest(asset);
                  }}
                >
                  <Play className="h-3 w-3 mr-1" />
                  Test
                </Button>
              )}
              {onAddTo && (
                <Button
                  variant="default"
                  size="sm"
                  className="text-xs"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation();
                    onAddTo(asset);
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Add
                </Button>
              )}
            </div>
          </div>
        </CardFooter>
      )}
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

/**
 * VitalAssetCard - Unified card component for all asset types
 */
export const VitalAssetCard: React.FC<VitalAssetCardProps> = (props) => {
  const { variant = 'rich' } = props;

  switch (variant) {
    case 'minimal':
      return <MinimalCard {...props} />;
    case 'compact':
      return <CompactCard {...props} />;
    case 'rich':
    default:
      return <RichCard {...props} />;
  }
};

VitalAssetCard.displayName = 'VitalAssetCard';

// ============================================================================
// SKELETON COMPONENTS
// ============================================================================

/**
 * Skeleton loader for asset card
 */
export interface VitalAssetCardSkeletonProps {
  variant?: AssetCardVariant;
  className?: string;
}

export const VitalAssetCardSkeleton: React.FC<VitalAssetCardSkeletonProps> = ({
  variant = 'rich',
  className,
}) => {
  if (variant === 'minimal') {
    return (
      <Card className={cn('p-3', className)}>
        <div className="flex items-center gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <Skeleton className="h-4 w-24" />
        </div>
      </Card>
    );
  }

  if (variant === 'compact') {
    return (
      <Card className={cn('p-4', className)}>
        <div className="flex items-start gap-3">
          <Skeleton className="h-9 w-9 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </div>
        <Skeleton className="h-3 w-full mt-3" />
      </Card>
    );
  }

  // Rich variant
  return (
    <Card className={cn('p-4', className)}>
      <div className="flex items-start gap-3">
        <Skeleton className="h-11 w-11 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-20 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
      </div>
      <div className="flex justify-between mt-4 pt-3 border-t">
        <Skeleton className="h-8 w-24" />
        <div className="flex gap-2">
          <Skeleton className="h-8 w-16" />
          <Skeleton className="h-8 w-14" />
        </div>
      </div>
    </Card>
  );
};

VitalAssetCardSkeleton.displayName = 'VitalAssetCardSkeleton';

// ============================================================================
// LIST ITEM VARIANT
// ============================================================================

/**
 * VitalAssetListItem - Horizontal list item variant for asset display
 */
export interface VitalAssetListItemProps {
  asset: VitalAsset;
  isSelected?: boolean;
  isAdmin?: boolean;
  showActions?: boolean;
  className?: string;
  onClick?: (asset: VitalAsset) => void;
  onEdit?: (asset: VitalAsset) => void;
  onDelete?: (asset: VitalAsset) => void;
  onTest?: (asset: VitalAsset) => void;
}

export const VitalAssetListItem: React.FC<VitalAssetListItemProps> = ({
  asset,
  isSelected,
  isAdmin,
  showActions = true,
  className,
  onClick,
  onEdit,
  onDelete,
  onTest,
}) => {
  const description = getAssetDescription(asset);
  const categoryConfig = getCategoryConfig(asset.category);
  const Icon = categoryConfig.icon;

  return (
    <div
      className={cn(
        'flex items-center gap-4 p-4 rounded-lg border bg-card',
        'transition-all duration-200 cursor-pointer',
        'hover:bg-accent/50 hover:shadow-sm',
        isSelected && 'ring-2 ring-primary bg-accent/30',
        className
      )}
      onClick={() => onClick?.(asset)}
    >
      {/* Icon */}
      <div
        className={cn(
          'p-2.5 rounded-xl shrink-0',
          categoryConfig.bgColor,
          categoryConfig.borderColor,
          'border'
        )}
      >
        <Icon className={cn('h-5 w-5', categoryConfig.color)} />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h4 className="font-semibold text-sm truncate">{asset.name}</h4>
          <AssetTypeBadge type={asset.asset_type} />
          <LifecycleBadge stage={asset.lifecycle_stage} />
        </div>
        {description && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
            {description}
          </p>
        )}
      </div>

      {/* Status */}
      <StatusIndicator isActive={asset.is_active} className="shrink-0" />

      {/* Actions */}
      {showActions && (
        <div className="flex items-center gap-1 shrink-0">
          {onTest && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onTest(asset);
              }}
            >
              <Play className="h-4 w-4" />
            </Button>
          )}
          {isAdmin && onEdit && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onEdit(asset);
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          )}
          {isAdmin && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-destructive hover:text-destructive"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation();
                onDelete(asset);
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

VitalAssetListItem.displayName = 'VitalAssetListItem';

export default VitalAssetCard;

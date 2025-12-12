/**
 * VitalToolCard - Unified Tool Card Component
 *
 * A flexible card component for displaying tools with multiple variants.
 * Supports minimal, compact, and rich display modes.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <VitalToolCard
 *   tool={tool}
 *   onClick={handleClick}
 * />
 *
 * // Compact variant with admin actions
 * <VitalToolCard
 *   tool={tool}
 *   compact
 *   isAdmin
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Pencil, Trash2, ExternalLink } from 'lucide-react';
import {
  getCategoryConfig,
  getLifecycleConfig,
  getToolTypeConfig,
  DEFAULT_TOOL_CATEGORY,
} from './constants';
import type { VitalToolCardProps, VitalTool } from './types';

// ============================================================================
// SUBCOMPONENTS
// ============================================================================

interface BadgeProps {
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ className, children }) => (
  <span
    className={cn(
      'inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border',
      className
    )}
  >
    {children}
  </span>
);

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'outline' | 'destructive';
  size?: 'sm' | 'md';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'ghost',
  size = 'sm',
  className,
  children,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
      variant === 'ghost' && 'hover:bg-muted hover:text-accent-foreground',
      variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      variant === 'destructive' && 'text-red-600 hover:text-red-700 hover:bg-red-50',
      size === 'sm' && 'h-7 w-7 p-0',
      size === 'md' && 'h-9 px-3',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const VitalToolCard = React.forwardRef<HTMLDivElement, VitalToolCardProps>(
  (
    {
      tool,
      variant = 'compact',
      compact = false,
      isSelected,
      isAdmin,
      showActions = true,
      className,
      animationDelay,
      onClick,
      onEdit,
      onDelete,
      onTest,
      onViewDetails,
    },
    ref
  ) => {
    const categoryConfig = getCategoryConfig(tool.category);
    const CategoryIcon = categoryConfig?.icon || DEFAULT_TOOL_CATEGORY.icon;
    const lifecycleConfig = tool.lifecycle_stage ? getLifecycleConfig(tool.lifecycle_stage) : null;
    const LifecycleIcon = lifecycleConfig?.icon;
    const toolTypeConfig = tool.tool_type ? getToolTypeConfig(tool.tool_type) : null;

    // Get description (tool_description or description)
    const description = tool.tool_description || tool.description;

    const handleClick = React.useCallback(() => {
      onClick?.(tool);
    }, [onClick, tool]);

    const handleEdit = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(tool);
      },
      [onEdit, tool]
    );

    const handleDelete = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(tool);
      },
      [onDelete, tool]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(tool);
        }
      },
      [onClick, tool]
    );

    // Determine if card should be compact
    const isCompact = compact || variant === 'minimal';

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={cn(
          'group relative rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
          'hover:shadow-md hover:border-primary/30 cursor-pointer',
          isSelected && 'ring-2 ring-primary border-primary',
          className
        )}
        style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        {/* Card Header */}
        <div className={cn('p-4', isCompact && 'pb-2')}>
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <CategoryIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <h3 className="font-semibold text-base leading-tight truncate">{tool.name}</h3>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {lifecycleConfig && (
                <Badge className={cn(lifecycleConfig.bgColor, lifecycleConfig.color)}>
                  {LifecycleIcon && <LifecycleIcon className="h-3 w-3 mr-1" />}
                  {lifecycleConfig.label}
                </Badge>
              )}
              {isAdmin && showActions && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit tool">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} title="Delete tool">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {!isCompact && description && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Card Content */}
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {tool.category && (
                <Badge
                  className={cn(
                    categoryConfig.bgColor,
                    categoryConfig.color,
                    categoryConfig.borderColor
                  )}
                >
                  {tool.category}
                </Badge>
              )}

              {toolTypeConfig && (
                <Badge className={cn(toolTypeConfig.bgColor, toolTypeConfig.color)}>
                  {toolTypeConfig.label}
                </Badge>
              )}

              {tool.is_active !== false && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  Active
                </Badge>
              )}

              {tool.langgraph_compatible && (
                <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                  LangGraph
                </Badge>
              )}
            </div>

            {/* Additional Info (non-compact) */}
            {!isCompact && (
              <div className="text-xs text-muted-foreground space-y-1">
                {tool.vendor && <div>Vendor: {tool.vendor}</div>}
                {tool.version && <div>Version: {tool.version}</div>}
                {tool.code && <div>Code: {tool.code}</div>}
                {tool.documentation_url && (
                  <div className="flex items-center gap-1">
                    <ExternalLink className="h-3 w-3" />
                    <span className="truncate">Documentation</span>
                  </div>
                )}
              </div>
            )}

            {/* Tags */}
            {!isCompact && tool.tags && tool.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {tool.tags.slice(0, 3).map((tag, idx) => (
                  <Badge key={idx} className="bg-slate-100 text-slate-700 text-xs">
                    {tag}
                  </Badge>
                ))}
                {tool.tags.length > 3 && (
                  <Badge className="bg-slate-100 text-slate-700 text-xs">
                    +{tool.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

VitalToolCard.displayName = 'VitalToolCard';

export default VitalToolCard;

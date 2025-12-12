/**
 * VitalToolListItem - List View Tool Item Component
 *
 * A horizontal list item for displaying tools in a list layout.
 *
 * @example
 * ```tsx
 * <VitalToolListItem
 *   tool={tool}
 *   onClick={handleClick}
 *   isAdmin
 *   onEdit={handleEdit}
 *   onDelete={handleDelete}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Pencil, Trash2 } from 'lucide-react';
import {
  getCategoryConfig,
  getLifecycleConfig,
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
      size === 'sm' && 'h-8 w-8 p-0',
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

export const VitalToolListItem = React.forwardRef<HTMLDivElement, VitalToolCardProps>(
  (
    {
      tool,
      isSelected,
      isAdmin,
      showActions = true,
      className,
      animationDelay,
      onClick,
      onEdit,
      onDelete,
    },
    ref
  ) => {
    const categoryConfig = getCategoryConfig(tool.category);
    const CategoryIcon = categoryConfig?.icon || DEFAULT_TOOL_CATEGORY.icon;
    const lifecycleConfig = tool.lifecycle_stage ? getLifecycleConfig(tool.lifecycle_stage) : null;
    const LifecycleIcon = lifecycleConfig?.icon;

    // Get description
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

    return (
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        className={cn(
          'group rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200',
          'hover:shadow-md hover:border-primary/30 cursor-pointer',
          isSelected && 'ring-2 ring-primary border-primary',
          className
        )}
        style={animationDelay ? { animationDelay: `${animationDelay}ms` } : undefined}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
      >
        <div className="py-4 px-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 min-w-0">
              <CategoryIcon className="h-6 w-6 text-muted-foreground shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold truncate">{tool.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {description || 'No description'}
                </p>
                {tool.vendor && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Vendor: {tool.vendor}
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
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

              {lifecycleConfig && (
                <Badge className={cn(lifecycleConfig.bgColor, lifecycleConfig.color)}>
                  {LifecycleIcon && <LifecycleIcon className="h-3 w-3 mr-1" />}
                  {lifecycleConfig.label}
                </Badge>
              )}

              {tool.is_active !== false && (
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              )}

              {isAdmin && showActions && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit tool">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} title="Delete tool">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

VitalToolListItem.displayName = 'VitalToolListItem';

export default VitalToolListItem;

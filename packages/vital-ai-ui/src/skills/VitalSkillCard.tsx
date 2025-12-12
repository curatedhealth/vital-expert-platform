/**
 * VitalSkillCard - Unified Skill Card Component
 *
 * A flexible card component for displaying skills with multiple variants.
 * Supports minimal, compact, and rich display modes.
 *
 * @example
 * ```tsx
 * // Basic usage
 * <VitalSkillCard
 *   skill={skill}
 *   onClick={handleClick}
 * />
 *
 * // Compact variant with admin actions
 * <VitalSkillCard
 *   skill={skill}
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
import { Pencil, Trash2 } from 'lucide-react';
import {
  getCategoryConfig,
  getComplexityConfig,
  getImplementationConfig,
  DEFAULT_CATEGORY,
  COMPLEXITY_BADGES,
} from './constants';
import { getComplexityLevel } from './types';
import type { VitalSkillCardProps, VitalSkill } from './types';

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

export const VitalSkillCard = React.forwardRef<HTMLDivElement, VitalSkillCardProps>(
  (
    {
      skill,
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
      onAddToAgent,
      onViewDetails,
    },
    ref
  ) => {
    const categoryConfig = getCategoryConfig(skill.category);
    const CategoryIcon = categoryConfig?.icon || DEFAULT_CATEGORY.icon;
    const complexityLevel = getComplexityLevel(skill.complexity_score || 5);
    const complexityConfig = getComplexityConfig(complexityLevel);
    const ComplexityIcon = complexityConfig?.icon;
    const implConfig = getImplementationConfig(skill.implementation_type);

    const handleClick = React.useCallback(() => {
      onClick?.(skill);
    }, [onClick, skill]);

    const handleEdit = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onEdit?.(skill);
      },
      [onEdit, skill]
    );

    const handleDelete = React.useCallback(
      (e: React.MouseEvent) => {
        e.stopPropagation();
        onDelete?.(skill);
      },
      [onDelete, skill]
    );

    const handleKeyDown = React.useCallback(
      (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick?.(skill);
        }
      },
      [onClick, skill]
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
            <div className="flex items-center gap-2">
              <CategoryIcon className="h-5 w-5 shrink-0 text-muted-foreground" />
              <h3 className="font-semibold text-base leading-tight">{skill.name}</h3>
            </div>
            <div className="flex items-center gap-2">
              {skill.is_active && (
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              )}
              {isAdmin && showActions && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit skill">
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} title="Delete skill">
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>
          {!isCompact && (
            <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
              {skill.description || 'No description available'}
            </p>
          )}
        </div>

        {/* Card Content */}
        <div className="px-4 pb-4">
          <div className="space-y-3">
            {/* Badges */}
            <div className="flex flex-wrap gap-2">
              {skill.category && (
                <Badge
                  className={cn(
                    categoryConfig.bgColor,
                    categoryConfig.color,
                    categoryConfig.borderColor
                  )}
                >
                  {skill.category}
                </Badge>
              )}

              {complexityConfig && (
                <Badge className={cn(complexityConfig.bgColor, complexityConfig.color)}>
                  <ComplexityIcon className="h-3 w-3 mr-1" />
                  {complexityConfig.label}
                </Badge>
              )}

              {skill.implementation_type && (
                <Badge className={cn(implConfig.bgColor, implConfig.color)}>
                  {implConfig.label}
                </Badge>
              )}
            </div>

            {/* Additional Info (non-compact) */}
            {!isCompact && (
              <div className="text-xs text-muted-foreground space-y-1">
                {skill.complexity_score && <div>Complexity: {skill.complexity_score}/10</div>}
                {skill.slug && <div>Slug: {skill.slug}</div>}
                {skill.implementation_ref && (
                  <div className="truncate">Ref: {skill.implementation_ref}</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
);

VitalSkillCard.displayName = 'VitalSkillCard';

export default VitalSkillCard;

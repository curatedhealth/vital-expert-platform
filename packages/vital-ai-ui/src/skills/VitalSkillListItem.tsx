/**
 * VitalSkillListItem - List View Skill Item Component
 *
 * A horizontal list item for displaying skills in a list layout.
 *
 * @example
 * ```tsx
 * <VitalSkillListItem
 *   skill={skill}
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
  getComplexityConfig,
  DEFAULT_CATEGORY,
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

export const VitalSkillListItem = React.forwardRef<HTMLDivElement, VitalSkillCardProps>(
  (
    {
      skill,
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
    const categoryConfig = getCategoryConfig(skill.category);
    const CategoryIcon = categoryConfig?.icon || DEFAULT_CATEGORY.icon;
    const complexityLevel = getComplexityLevel(skill.complexity_score || 5);
    const complexityConfig = getComplexityConfig(complexityLevel);
    const ComplexityIcon = complexityConfig?.icon;

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
                <h3 className="font-semibold truncate">{skill.name}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">
                  {skill.description}
                </p>
                {skill.complexity_score && (
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    Complexity: {skill.complexity_score}/10
                  </p>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 ml-4">
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

              {skill.is_active && (
                <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
              )}

              {isAdmin && showActions && (
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                  <Button variant="ghost" size="sm" onClick={handleEdit} title="Edit skill">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} title="Delete skill">
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

VitalSkillListItem.displayName = 'VitalSkillListItem';

export default VitalSkillListItem;

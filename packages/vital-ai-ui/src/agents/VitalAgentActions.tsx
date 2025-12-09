/**
 * VitalAgentActions - Agent Action Button Components
 * 
 * Provides standardized action buttons for agent cards including
 * add to chat, bookmark, duplicate, edit, delete, and compare.
 * 
 * @packageDocumentation
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  MessageSquarePlus,
  Bookmark,
  Copy,
  Pencil,
  Trash2,
  GitCompare,
  MoreHorizontal,
  ExternalLink,
  Eye,
} from 'lucide-react';
import type { VitalAgent, VitalAgentCardActions, VitalAgentCardPermissions } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface VitalAgentActionsProps extends VitalAgentCardActions, VitalAgentCardPermissions {
  /** The agent these actions apply to */
  agent: VitalAgent;
  
  /** Layout direction */
  direction?: 'horizontal' | 'vertical';
  
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Button variant */
  variant?: 'ghost' | 'outline' | 'default';
  
  /** Show labels on buttons */
  showLabels?: boolean;
  
  /** Whether the agent is bookmarked */
  isBookmarked?: boolean;
  
  /** Whether the agent is in comparison */
  isInComparison?: boolean;
  
  /** Maximum actions to show before overflow menu */
  maxVisible?: number;
  
  /** Additional CSS classes */
  className?: string;
}

export interface ActionButtonProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  active?: boolean;
  variant?: 'ghost' | 'outline' | 'default' | 'primary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  className?: string;
}

// ============================================================================
// SIZE CONFIGURATIONS
// ============================================================================

const SIZE_CONFIG = {
  sm: {
    button: 'h-7 w-7 p-0',
    buttonWithLabel: 'h-7 px-2 gap-1',
    icon: 'h-3.5 w-3.5',
    text: 'text-xs',
  },
  md: {
    button: 'h-8 w-8 p-0',
    buttonWithLabel: 'h-8 px-3 gap-1.5',
    icon: 'h-4 w-4',
    text: 'text-sm',
  },
  lg: {
    button: 'h-10 w-10 p-0',
    buttonWithLabel: 'h-10 px-4 gap-2',
    icon: 'h-5 w-5',
    text: 'text-sm',
  },
} as const;

const VARIANT_STYLES = {
  ghost: 'hover:bg-muted text-muted-foreground hover:text-foreground',
  outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
  default: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
  primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
  danger: 'text-destructive hover:bg-destructive/10',
} as const;

// ============================================================================
// ACTION BUTTON COMPONENT
// ============================================================================

/**
 * Individual action button with consistent styling
 */
export function ActionButton({
  icon,
  label,
  onClick,
  disabled = false,
  active = false,
  variant = 'ghost',
  size = 'md',
  showLabel = false,
  className,
}: ActionButtonProps) {
  const sizeConfig = SIZE_CONFIG[size];
  
  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.();
      }}
      disabled={disabled}
      className={cn(
        'inline-flex items-center justify-center rounded-lg',
        'transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
        'disabled:pointer-events-none disabled:opacity-50',
        showLabel ? sizeConfig.buttonWithLabel : sizeConfig.button,
        VARIANT_STYLES[variant],
        active && variant === 'ghost' && 'bg-primary/10 text-primary',
        className
      )}
      title={label}
      aria-label={label}
    >
      <span className={sizeConfig.icon}>{icon}</span>
      {showLabel && <span className={sizeConfig.text}>{label}</span>}
    </button>
  );
}

// ============================================================================
// MAIN ACTIONS COMPONENT
// ============================================================================

/**
 * VitalAgentActions provides a standardized set of action buttons for agent cards.
 * 
 * Features:
 * - Add to Chat (primary action)
 * - Bookmark toggle
 * - Duplicate
 * - Edit (if permitted)
 * - Delete (if permitted)
 * - Compare
 * - View Details
 * - Overflow menu for additional actions
 * 
 * @example
 * ```tsx
 * <VitalAgentActions
 *   agent={agent}
 *   onAddToChat={handleAddToChat}
 *   onBookmark={handleBookmark}
 *   onEdit={handleEdit}
 *   isBookmarked={isBookmarked}
 *   canEdit={true}
 * />
 * ```
 */
export function VitalAgentActions({
  agent,
  direction = 'horizontal',
  size = 'md',
  variant = 'ghost',
  showLabels = false,
  isBookmarked = false,
  isInComparison = false,
  maxVisible = 4,
  canEdit = false,
  canDelete = false,
  canDuplicate = true,
  onSelect,
  onAddToChat,
  onBookmark,
  onDuplicate,
  onEdit,
  onDelete,
  onCompare,
  onViewDetails,
  className,
}: VitalAgentActionsProps) {
  const [showOverflow, setShowOverflow] = React.useState(false);
  const overflowRef = React.useRef<HTMLDivElement>(null);
  
  // Close overflow menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (overflowRef.current && !overflowRef.current.contains(event.target as Node)) {
        setShowOverflow(false);
      }
    };
    
    if (showOverflow) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showOverflow]);
  
  // Define all possible actions
  const allActions: Array<{
    key: string;
    icon: React.ReactNode;
    label: string;
    onClick?: () => void;
    active?: boolean;
    variant?: ActionButtonProps['variant'];
    visible: boolean;
    priority: number; // Lower = higher priority
  }> = [
    {
      key: 'addToChat',
      icon: <MessageSquarePlus />,
      label: 'Add to Chat',
      onClick: onAddToChat ? () => onAddToChat(agent) : undefined,
      variant: 'primary' as const,
      visible: !!onAddToChat,
      priority: 1,
    },
    {
      key: 'bookmark',
      icon: <Bookmark className={isBookmarked ? 'fill-current' : ''} />,
      label: isBookmarked ? 'Remove Bookmark' : 'Bookmark',
      onClick: onBookmark ? () => onBookmark(agent) : undefined,
      active: isBookmarked,
      visible: !!onBookmark,
      priority: 2,
    },
    {
      key: 'compare',
      icon: <GitCompare />,
      label: isInComparison ? 'Remove from Compare' : 'Add to Compare',
      onClick: onCompare ? () => onCompare(agent) : undefined,
      active: isInComparison,
      visible: !!onCompare,
      priority: 3,
    },
    {
      key: 'duplicate',
      icon: <Copy />,
      label: 'Duplicate',
      onClick: onDuplicate ? () => onDuplicate(agent) : undefined,
      visible: !!onDuplicate && canDuplicate,
      priority: 4,
    },
    {
      key: 'viewDetails',
      icon: <Eye />,
      label: 'View Details',
      onClick: onViewDetails ? () => onViewDetails(agent) : undefined,
      visible: !!onViewDetails,
      priority: 5,
    },
    {
      key: 'edit',
      icon: <Pencil />,
      label: 'Edit',
      onClick: onEdit ? () => onEdit(agent) : undefined,
      visible: !!onEdit && canEdit,
      priority: 6,
    },
    {
      key: 'delete',
      icon: <Trash2 />,
      label: 'Delete',
      onClick: onDelete ? () => onDelete(agent) : undefined,
      variant: 'danger' as const,
      visible: !!onDelete && canDelete,
      priority: 7,
    },
  ];
  
  // Filter and sort visible actions
  const visibleActions = allActions
    .filter(a => a.visible)
    .sort((a, b) => a.priority - b.priority);
  
  // Split into primary and overflow actions
  const primaryActions = visibleActions.slice(0, maxVisible);
  const overflowActions = visibleActions.slice(maxVisible);
  
  if (visibleActions.length === 0) {
    return null;
  }
  
  return (
    <div
      className={cn(
        'flex items-center',
        direction === 'vertical' ? 'flex-col gap-1' : 'flex-row gap-1',
        className
      )}
    >
      {primaryActions.map((action) => (
        <ActionButton
          key={action.key}
          icon={action.icon}
          label={action.label}
          onClick={action.onClick}
          active={action.active}
          variant={action.variant || variant}
          size={size}
          showLabel={showLabels}
        />
      ))}
      
      {overflowActions.length > 0 && (
        <div className="relative" ref={overflowRef}>
          <ActionButton
            icon={<MoreHorizontal />}
            label="More actions"
            onClick={() => setShowOverflow(!showOverflow)}
            variant={variant}
            size={size}
          />
          
          {showOverflow && (
            <div
              className={cn(
                'absolute z-50 min-w-[160px] rounded-lg border bg-popover p-1 shadow-lg',
                'animate-in fade-in-0 zoom-in-95',
                direction === 'vertical' ? 'left-full ml-1 top-0' : 'right-0 top-full mt-1'
              )}
            >
              {overflowActions.map((action) => (
                <button
                  key={action.key}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    action.onClick?.();
                    setShowOverflow(false);
                  }}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm',
                    'hover:bg-accent hover:text-accent-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    action.variant === 'danger' && 'text-destructive hover:bg-destructive/10'
                  )}
                >
                  <span className="h-4 w-4">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// QUICK ACTION BAR (for card hover states)
// ============================================================================

export interface VitalQuickActionsProps {
  agent: VitalAgent;
  onAddToChat?: (agent: VitalAgent) => void;
  onBookmark?: (agent: VitalAgent) => void;
  onDuplicate?: (agent: VitalAgent) => void;
  isBookmarked?: boolean;
  className?: string;
}

/**
 * Compact action bar that appears on card hover
 */
export function VitalQuickActions({
  agent,
  onAddToChat,
  onBookmark,
  onDuplicate,
  isBookmarked = false,
  className,
}: VitalQuickActionsProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-1 p-1 rounded-lg',
        'bg-background/80 backdrop-blur-sm border shadow-sm',
        className
      )}
    >
      {onAddToChat && (
        <ActionButton
          icon={<MessageSquarePlus />}
          label="Add to Chat"
          onClick={() => onAddToChat(agent)}
          variant="primary"
          size="sm"
        />
      )}
      
      {onBookmark && (
        <ActionButton
          icon={<Bookmark className={isBookmarked ? 'fill-current' : ''} />}
          label={isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
          onClick={() => onBookmark(agent)}
          active={isBookmarked}
          size="sm"
        />
      )}
      
      {onDuplicate && (
        <ActionButton
          icon={<Copy />}
          label="Duplicate"
          onClick={() => onDuplicate(agent)}
          size="sm"
        />
      )}
    </div>
  );
}

// ============================================================================
// EXPORTS
// ============================================================================

export default VitalAgentActions;

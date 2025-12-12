'use client';

/**
 * Shared Action Buttons
 *
 * Consistent action buttons used across all views (Agents, Agent Builder, etc.)
 * Built with @vital/ui Button component following Brand Guidelines V6.
 */

import React from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Copy,
  Eye,
  Download,
  Upload,
  RefreshCw,
  MoreHorizontal,
  Settings,
  Power,
  PowerOff,
} from 'lucide-react';
import { Button } from '../button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../tooltip';
import { cn } from '../../lib/utils';

// ============================================================================
// ACTION BUTTON TYPES
// ============================================================================

export type ActionButtonVariant = 'default' | 'outline' | 'ghost' | 'destructive';
export type ActionButtonSize = 'sm' | 'default' | 'lg' | 'icon';

export interface ActionButtonProps {
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
  variant?: ActionButtonVariant;
  size?: ActionButtonSize;
  className?: string;
  tooltip?: string;
  showLabel?: boolean;
}

// ============================================================================
// CREATE BUTTON
// ============================================================================

export interface CreateButtonProps extends ActionButtonProps {
  label?: string;
}

export const CreateButton: React.FC<CreateButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'default',
  size = 'default',
  className,
  tooltip = 'Create new',
  showLabel = true,
  label = 'Create',
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {showLabel && label}
    </Button>
  );

  if (tooltip && !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

// ============================================================================
// EDIT BUTTON
// ============================================================================

export const EditButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'outline',
  size = 'sm',
  className,
  tooltip = 'Edit',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Pencil className="h-4 w-4" />
      )}
      {showLabel && 'Edit'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// DELETE BUTTON
// ============================================================================

export interface DeleteButtonProps extends ActionButtonProps {
  confirmMessage?: string;
}

export const DeleteButton: React.FC<DeleteButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'ghost',
  size = 'sm',
  className,
  tooltip = 'Delete',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('text-red-500 hover:text-red-600 hover:bg-red-50 gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Trash2 className="h-4 w-4" />
      )}
      {showLabel && 'Delete'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// DUPLICATE BUTTON
// ============================================================================

export const DuplicateButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'ghost',
  size = 'sm',
  className,
  tooltip = 'Duplicate',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Copy className="h-4 w-4" />
      )}
      {showLabel && 'Duplicate'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// VIEW BUTTON
// ============================================================================

export const ViewButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  variant = 'ghost',
  size = 'sm',
  className,
  tooltip = 'View details',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn('gap-2', className)}
    >
      <Eye className="h-4 w-4" />
      {showLabel && 'View'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// ADD BUTTON (for adding items to lists)
// ============================================================================

export interface AddButtonProps extends ActionButtonProps {
  label?: string;
}

export const AddButton: React.FC<AddButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'outline',
  size = 'sm',
  className,
  tooltip = 'Add',
  showLabel = true,
  label = 'Add',
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2 border-dashed', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Plus className="h-4 w-4" />
      )}
      {showLabel && label}
    </Button>
  );

  if (tooltip && !showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

// ============================================================================
// SETTINGS BUTTON
// ============================================================================

export const SettingsButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  variant = 'ghost',
  size = 'sm',
  className,
  tooltip = 'Settings',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled}
      className={cn('gap-2', className)}
    >
      <Settings className="h-4 w-4" />
      {showLabel && 'Settings'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// REFRESH BUTTON
// ============================================================================

export const RefreshButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'outline',
  size = 'sm',
  className,
  tooltip = 'Refresh',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      <RefreshCw className={cn('h-4 w-4', loading && 'animate-spin')} />
      {showLabel && 'Refresh'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// ACTIVATE / DEACTIVATE BUTTONS
// ============================================================================

export const ActivateButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'ghost',
  size = 'sm',
  className,
  tooltip = 'Activate',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2 text-green-600 hover:text-green-700 hover:bg-green-50', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Power className="h-4 w-4" />
      )}
      {showLabel && 'Activate'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export const DeactivateButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled,
  loading,
  variant = 'ghost',
  size = 'sm',
  className,
  tooltip = 'Deactivate',
  showLabel = false,
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <PowerOff className="h-4 w-4" />
      )}
      {showLabel && 'Deactivate'}
    </Button>
  );

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent>{tooltip}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// ============================================================================
// IMPORT / EXPORT BUTTONS
// ============================================================================

export const ImportButton: React.FC<ActionButtonProps & { label?: string }> = ({
  onClick,
  disabled,
  loading,
  variant = 'outline',
  size = 'default',
  className,
  tooltip = 'Import',
  showLabel = true,
  label = 'Import',
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Upload className="h-4 w-4" />
      )}
      {showLabel && label}
    </Button>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

export const ExportButton: React.FC<ActionButtonProps & { label?: string }> = ({
  onClick,
  disabled,
  loading,
  variant = 'outline',
  size = 'default',
  className,
  tooltip = 'Export',
  showLabel = true,
  label = 'Export',
}) => {
  const button = (
    <Button
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn('gap-2', className)}
    >
      {loading ? (
        <RefreshCw className="h-4 w-4 animate-spin" />
      ) : (
        <Download className="h-4 w-4" />
      )}
      {showLabel && label}
    </Button>
  );

  if (!showLabel) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent>{tooltip}</TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return button;
};

// ============================================================================
// ACTION MENU (More options dropdown)
// ============================================================================

export interface ActionMenuItem {
  label: string;
  icon?: React.ElementType;
  onClick: () => void;
  disabled?: boolean;
  destructive?: boolean;
  separator?: boolean;
}

export interface ActionMenuProps {
  items: ActionMenuItem[];
  disabled?: boolean;
  className?: string;
}

export const ActionMenu: React.FC<ActionMenuProps> = ({
  items,
  disabled,
  className,
}) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          disabled={disabled}
          className={cn('h-8 w-8 p-0', className)}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {items.map((item, index) => (
          <React.Fragment key={index}>
            {item.separator && index > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem
              onClick={item.onClick}
              disabled={item.disabled}
              className={cn(item.destructive && 'text-red-600 focus:text-red-600')}
            >
              {item.icon && <item.icon className="h-4 w-4 mr-2" />}
              {item.label}
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// ACTION BUTTON GROUP
// ============================================================================

export interface ActionButtonGroupProps {
  onView?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onDelete?: () => void;
  onActivate?: () => void;
  onDeactivate?: () => void;
  isActive?: boolean;
  isCustom?: boolean;
  showInMenu?: boolean;
  className?: string;
}

export const ActionButtonGroup: React.FC<ActionButtonGroupProps> = ({
  onView,
  onEdit,
  onDuplicate,
  onDelete,
  onActivate,
  onDeactivate,
  isActive = true,
  isCustom = false,
  showInMenu = false,
  className,
}) => {
  if (showInMenu) {
    const menuItems: ActionMenuItem[] = [];

    if (onView) menuItems.push({ label: 'View', icon: Eye, onClick: onView });
    if (onEdit) menuItems.push({ label: 'Edit', icon: Pencil, onClick: onEdit });
    if (onDuplicate) menuItems.push({ label: 'Duplicate', icon: Copy, onClick: onDuplicate });

    if (isActive && onDeactivate) {
      menuItems.push({ label: 'Deactivate', icon: PowerOff, onClick: onDeactivate, separator: true });
    } else if (!isActive && onActivate) {
      menuItems.push({ label: 'Activate', icon: Power, onClick: onActivate, separator: true });
    }

    if (isCustom && onDelete) {
      menuItems.push({ label: 'Delete', icon: Trash2, onClick: onDelete, destructive: true, separator: true });
    }

    return <ActionMenu items={menuItems} className={className} />;
  }

  return (
    <div className={cn('flex items-center gap-1', className)}>
      {onView && <ViewButton onClick={onView} />}
      {onEdit && <EditButton onClick={onEdit} />}
      {onDuplicate && <DuplicateButton onClick={onDuplicate} />}
      {isActive && onDeactivate && <DeactivateButton onClick={onDeactivate} />}
      {!isActive && onActivate && <ActivateButton onClick={onActivate} />}
      {isCustom && onDelete && <DeleteButton onClick={onDelete} />}
    </div>
  );
};

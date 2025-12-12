/**
 * VitalMainNavbar - Shared Main Navigation Bar Component
 *
 * A comprehensive, configurable top navbar with navigation menus,
 * command palette, notifications, and user menu.
 *
 * @example
 * ```tsx
 * <VitalMainNavbar
 *   config={navbarConfig}
 *   user={currentUser}
 *   pathname={pathname}
 *   onNavigate={router.push}
 *   onSignOut={handleSignOut}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import {
  UserCircle,
  LogOut,
  Settings as SettingsIcon,
  Search,
  Bell,
  Plus,
  ChevronDown,
  type LucideIcon,
} from 'lucide-react';
import * as DropdownMenuPrimitive from '@radix-ui/react-dropdown-menu';
import type {
  NavbarConfig,
  NavGroup,
  NavLink,
  NavUser,
  QuickAction,
} from './types';

// ============================================================================
// INLINE SUB-COMPONENTS (to avoid @vital/ui dependency)
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline' | 'destructive';
  size?: 'default' | 'sm' | 'icon';
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({
  variant = 'default',
  size = 'default',
  className,
  children,
  ...props
}) => (
  <button
    className={cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50',
      variant === 'default' && 'bg-primary text-primary-foreground hover:bg-primary/90',
      variant === 'ghost' && 'hover:bg-accent hover:text-accent-foreground',
      variant === 'outline' && 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
      variant === 'destructive' && 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      size === 'default' && 'h-10 px-4 py-2',
      size === 'sm' && 'h-9 px-3 text-sm',
      size === 'icon' && 'h-10 w-10',
      className
    )}
    {...props}
  >
    {children}
  </button>
);

interface BadgeProps {
  variant?: 'default' | 'destructive';
  className?: string;
  children: React.ReactNode;
}

const Badge: React.FC<BadgeProps> = ({ variant = 'default', className, children }) => (
  <span
    className={cn(
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variant === 'default' && 'bg-primary text-primary-foreground',
      variant === 'destructive' && 'bg-destructive text-destructive-foreground',
      className
    )}
  >
    {children}
  </span>
);

// Dropdown Menu Components (using Radix primitives)
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;

const DropdownMenuContent = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Content>
>(({ className, sideOffset = 4, ...props }, ref) => (
  <DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      className={cn(
        'z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
        className
      )}
      {...props}
    />
  </DropdownMenuPrimitive.Portal>
));
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;

const DropdownMenuItem = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Item>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Item
    ref={ref}
    className={cn(
      'relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
      className
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;

const DropdownMenuLabel = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Label>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Label>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Label
    ref={ref}
    className={cn('px-2 py-1.5 text-sm font-semibold', className)}
    {...props}
  />
));
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;

const DropdownMenuSeparator = React.forwardRef<
  React.ElementRef<typeof DropdownMenuPrimitive.Separator>,
  React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Separator>
>(({ className, ...props }, ref) => (
  <DropdownMenuPrimitive.Separator
    ref={ref}
    className={cn('-mx-1 my-1 h-px bg-muted', className)}
    {...props}
  />
));
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;

// ============================================================================
// LIST ITEM FOR NAVIGATION
// ============================================================================

const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string;
    icon?: LucideIcon;
    description?: string;
  }
>(({ className, title, icon: Icon, description, ...props }, ref) => {
  return (
    <li>
      <a
        ref={ref}
        className={cn(
          'group relative block select-none rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200',
          'bg-background hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30',
          'border border-transparent hover:border-primary/20',
          'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
          'focus:bg-accent focus:text-accent-foreground focus:shadow-lg',
          className
        )}
        {...props}
      >
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />
        <div className="relative space-y-2">
          <div className="flex items-center gap-3">
            {Icon && (
              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-200">
                <Icon className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3" />
              </div>
            )}
            <div className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
              {title}
            </div>
          </div>
          {description && (
            <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors pl-11">
              {description}
            </p>
          )}
        </div>
      </a>
    </li>
  );
});
ListItem.displayName = 'ListItem';

// ============================================================================
// NAV GROUP DROPDOWN
// ============================================================================

interface NavGroupDropdownProps {
  group: NavGroup;
  isActive: boolean;
  onNavigate: (href: string) => void;
}

const NavGroupDropdown: React.FC<NavGroupDropdownProps> = ({
  group,
  isActive,
  onNavigate,
}) => {
  const Icon = group.icon;
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className={cn(
            'h-9 px-3 font-medium transition-all',
            isActive && 'bg-accent/50'
          )}
        >
          {Icon && <Icon className="mr-2 h-4 w-4" />}
          {group.title}
          <ChevronDown className="ml-1 h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className={cn(
          'p-0',
          group.columns === 2 ? 'w-[500px]' : 'w-[380px]'
        )}
        align="start"
      >
        <div className="relative">
          {/* Header */}
          <div className="relative p-5 pb-3 border-b border-border/50">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
              )}
              <div>
                <h4 className="text-sm font-semibold">{group.title}</h4>
                {group.description && (
                  <p className="text-xs text-muted-foreground">
                    {group.description}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Items */}
          <ul
            className={cn(
              'relative grid gap-2 p-4',
              group.columns === 2 && 'md:grid-cols-2'
            )}
          >
            {group.items.map((item) => (
              <ListItem
                key={item.href}
                title={item.label}
                href={item.href}
                icon={item.icon}
                description={item.description}
                onClick={(e) => {
                  e.preventDefault();
                  setOpen(false);
                  onNavigate(item.href);
                }}
              />
            ))}
          </ul>

          <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// QUICK ACTIONS MENU
// ============================================================================

interface QuickActionsMenuProps {
  actions: QuickAction[];
  onNavigate: (href: string) => void;
}

const QuickActionsMenu: React.FC<QuickActionsMenuProps> = ({
  actions,
  onNavigate,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="default"
          size="icon"
          className="h-9 w-9 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Quick actions</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
          Quick Actions
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        {actions.map((action, index) => (
          <React.Fragment key={action.label}>
            {action.separator && index > 0 && (
              <DropdownMenuSeparator className="my-2" />
            )}
            <DropdownMenuItem
              onClick={() => {
                setOpen(false);
                if (action.onClick) {
                  action.onClick();
                } else if (action.href) {
                  onNavigate(action.href);
                }
              }}
              className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
            >
              <div className="flex items-center gap-3">
                {action.icon && (
                  <div className="p-1.5 rounded-md bg-primary/10">
                    <action.icon className="h-4 w-4 text-primary" />
                  </div>
                )}
                <span className="font-medium">{action.label}</span>
              </div>
            </DropdownMenuItem>
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// USER MENU
// ============================================================================

interface UserMenuProps {
  user: NavUser | null | undefined;
  onNavigate: (href: string) => void;
  onSignOut?: () => Promise<void>;
}

const UserMenu: React.FC<UserMenuProps> = ({ user, onNavigate, onSignOut }) => {
  const handleSignOut = async () => {
    try {
      await onSignOut?.();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="transition-all hover:scale-105 hover:bg-accent/50"
        >
          <UserCircle className="h-5 w-5" />
          <span className="sr-only">User menu</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64 p-2">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1.5 px-2 py-2">
            <p className="text-sm font-semibold">My Account</p>
            {user?.email && (
              <p className="text-xs text-muted-foreground truncate">
                {user.name || user.email}
              </p>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-2" />
        <DropdownMenuItem
          onClick={() => onNavigate('/profile')}
          className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-primary/10">
              <UserCircle className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">Profile</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => onNavigate('/settings')}
          className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
        >
          <div className="flex items-center gap-3">
            <div className="p-1.5 rounded-md bg-primary/10">
              <SettingsIcon className="h-4 w-4 text-primary" />
            </div>
            <span className="font-medium">Settings</span>
          </div>
        </DropdownMenuItem>
        {onSignOut && (
          <>
            <DropdownMenuSeparator className="my-2" />
            <DropdownMenuItem
              onClick={handleSignOut}
              className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 text-destructive"
            >
              <div className="flex items-center gap-3">
                <div className="p-1.5 rounded-md bg-destructive/10">
                  <LogOut className="h-4 w-4 text-destructive" />
                </div>
                <span className="font-medium">Sign out</span>
              </div>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface VitalMainNavbarProps {
  /** Navigation configuration */
  config: NavbarConfig;
  /** Current user */
  user?: NavUser | null;
  /** Current pathname */
  pathname?: string | null;
  /** Navigation handler */
  onNavigate: (href: string) => void;
  /** Sign out handler */
  onSignOut?: () => Promise<void>;
  /** Command palette open state control */
  commandOpen?: boolean;
  /** Command palette open state setter */
  onCommandOpenChange?: (open: boolean) => void;
  /** Sidebar spacer width (for sidebar integration) */
  sidebarSpacerWidth?: string;
  /** Additional class name */
  className?: string;
}

export const VitalMainNavbar: React.FC<VitalMainNavbarProps> = ({
  config,
  user,
  pathname,
  onNavigate,
  onSignOut,
  commandOpen,
  onCommandOpenChange,
  sidebarSpacerWidth = '320px',
  className,
}) => {
  const [internalCommandOpen, setInternalCommandOpen] = React.useState(false);
  const isCommandOpen = commandOpen ?? internalCommandOpen;
  const setCommandOpen = onCommandOpenChange ?? setInternalCommandOpen;

  const {
    navGroups,
    navLinks,
    quickActions,
    rightSide = {},
    notificationCount = 0,
    slots = {},
  } = config;

  const {
    showSearch = true,
    showQuickActions = true,
    showNotifications = true,
    showThemeToggle = true,
    showUserMenu = true,
  } = rightSide;

  // Command palette keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setCommandOpen(!isCommandOpen);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [isCommandOpen, setCommandOpen]);

  const isPathActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`);
  };

  const isGroupActive = (group: NavGroup) => {
    return group.items.some((item) => isPathActive(item.href.split('?')[0]));
  };

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
        className
      )}
    >
      <div className="flex h-16 items-center px-6 gap-3">
        {/* Spacer for sidebar */}
        <div className="shrink-0" style={{ width: sidebarSpacerWidth }} />

        {/* Custom slot before nav */}
        {slots.beforeNav}

        {/* Navigation Menu */}
        <nav className="flex-1 flex items-center gap-1">
          {/* Standalone links */}
          {navLinks?.map((link) => (
            <Button
              key={link.href}
              variant="ghost"
              className={cn(
                'h-9 px-3 font-medium',
                isPathActive(link.href) && 'bg-accent text-accent-foreground'
              )}
              onClick={() => onNavigate(link.href)}
            >
              {link.icon && <link.icon className="mr-2 h-4 w-4" />}
              {link.label}
            </Button>
          ))}

          {/* Nav groups (dropdowns) */}
          {navGroups.map((group) => (
            <NavGroupDropdown
              key={group.title}
              group={group}
              isActive={isGroupActive(group)}
              onNavigate={onNavigate}
            />
          ))}
        </nav>

        {/* Custom slot after nav */}
        {slots.afterNav}

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {/* Search / Command Palette */}
          {showSearch && (
            <Button
              variant="outline"
              size="sm"
              className="relative h-9 w-9 p-0 md:w-40 md:justify-start md:px-3 transition-all hover:scale-105"
              onClick={() => setCommandOpen(true)}
            >
              <Search className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline-block text-sm text-muted-foreground">
                Search...
              </span>
              <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
                <span className="text-xs">⌘</span>K
              </kbd>
            </Button>
          )}

          {/* Quick Actions */}
          {showQuickActions && quickActions && quickActions.length > 0 && (
            <QuickActionsMenu actions={quickActions} onNavigate={onNavigate} />
          )}

          {/* Notifications */}
          {showNotifications && (
            <Button
              variant="ghost"
              size="icon"
              className="relative h-9 w-9 transition-transform hover:scale-105"
              onClick={() => onNavigate('/notifications')}
            >
              <Bell className="h-4 w-4" />
              {notificationCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
                >
                  {notificationCount}
                </Badge>
              )}
              <span className="sr-only">Notifications</span>
            </Button>
          )}

          {/* Theme Toggle (custom slot) */}
          {showThemeToggle && slots.themeToggle}

          {/* Tenant Switcher (custom slot) */}
          {slots.tenantSwitcher}

          {/* User Menu */}
          {showUserMenu && (
            <UserMenu user={user} onNavigate={onNavigate} onSignOut={onSignOut} />
          )}

          {/* Custom right side slot */}
          {slots.rightSide}
        </div>
      </div>
    </header>
  );
};

VitalMainNavbar.displayName = 'VitalMainNavbar';

export default VitalMainNavbar;

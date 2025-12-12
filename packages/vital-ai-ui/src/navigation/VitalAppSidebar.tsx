/**
 * VitalAppSidebar - Shared Application Sidebar Component
 *
 * A configurable, route-aware sidebar that renders different content
 * based on the current pathname. Supports collapsible state and
 * page-specific content sections.
 *
 * @example
 * ```tsx
 * <VitalAppSidebar
 *   config={sidebarConfig}
 *   pathname={pathname}
 *   user={currentUser}
 *   onNavigate={router.push}
 *   contentRouter={routeContentMap}
 * />
 * ```
 */

'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { ChevronLeft, ChevronRight, Menu, type LucideIcon } from 'lucide-react';
import * as ScrollAreaPrimitive from '@radix-ui/react-scroll-area';
import type {
  SidebarConfig,
  SidebarSection,
  SidebarItem as SidebarItemType,
  SidebarContentConfig,
  NavUser,
} from './types';

// ============================================================================
// INLINE SUB-COMPONENTS (to avoid @vital/ui dependency)
// ============================================================================

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'ghost' | 'outline';
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

// ScrollArea using Radix primitives
const ScrollArea = React.forwardRef<
  React.ElementRef<typeof ScrollAreaPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof ScrollAreaPrimitive.Root>
>(({ className, children, ...props }, ref) => (
  <ScrollAreaPrimitive.Root
    ref={ref}
    className={cn('relative overflow-hidden', className)}
    {...props}
  >
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollAreaPrimitive.ScrollAreaScrollbar
      orientation="vertical"
      className="flex h-full w-2.5 touch-none select-none border-l border-l-transparent p-[1px] transition-colors"
    >
      <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border" />
    </ScrollAreaPrimitive.ScrollAreaScrollbar>
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>
));
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;

// ============================================================================
// CONTEXT
// ============================================================================

interface AppSidebarContextValue {
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}

const AppSidebarContext = React.createContext<AppSidebarContextValue | undefined>(
  undefined
);

export function useAppSidebarContext() {
  const context = React.useContext(AppSidebarContext);
  if (!context) {
    throw new Error('useAppSidebarContext must be used within VitalAppSidebarProvider');
  }
  return context;
}

// ============================================================================
// PROVIDER
// ============================================================================

interface VitalAppSidebarProviderProps {
  children: React.ReactNode;
  defaultCollapsed?: boolean;
  defaultOpen?: boolean;
}

export function VitalAppSidebarProvider({
  children,
  defaultCollapsed = false,
  defaultOpen = true,
}: VitalAppSidebarProviderProps) {
  const [isCollapsed, setCollapsed] = React.useState(defaultCollapsed);
  const [isOpen, setOpen] = React.useState(defaultOpen);
  const [isMobile, setIsMobile] = React.useState(false);

  // Check for mobile on mount and resize
  React.useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return (
    <AppSidebarContext.Provider
      value={{ isCollapsed, setCollapsed, isMobile, isOpen, setOpen }}
    >
      {children}
    </AppSidebarContext.Provider>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/**
 * Sidebar Header
 */
interface SidebarHeaderProps {
  title?: string;
  logo?: React.ReactNode;
  showStatus?: boolean;
  statusText?: string;
  showCollapseButton?: boolean;
  className?: string;
}

export const VitalAppSidebarHeader: React.FC<SidebarHeaderProps> = ({
  title = 'VITAL Platform',
  logo,
  showStatus = true,
  statusText = 'Ready',
  showCollapseButton = true,
  className,
}) => {
  const { isCollapsed, setCollapsed, isMobile } = useAppSidebarContext();

  return (
    <div
      className={cn(
        'px-3 py-3 border-b border-border/40 relative',
        className
      )}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-3">
          {showStatus && (
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50" />
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
          )}
          {logo || (
            <span
              className={cn(
                'text-sm font-semibold text-foreground',
                isCollapsed && !isMobile && 'hidden'
              )}
            >
              {title}
            </span>
          )}
        </div>

        {showCollapseButton && !isMobile && (
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        )}
      </div>
    </div>
  );
};

/**
 * Sidebar Content Area
 */
interface SidebarContentAreaProps {
  children: React.ReactNode;
  className?: string;
}

export const VitalAppSidebarContent: React.FC<SidebarContentAreaProps> = ({
  children,
  className,
}) => {
  return (
    <ScrollArea className={cn('flex-1 px-3 py-4 space-y-4', className)}>
      {/* Subtle gradient overlay at top for depth */}
      <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-background/50 to-transparent pointer-events-none z-10" />
      {children}
      {/* Subtle gradient overlay at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-background/50 to-transparent pointer-events-none z-10" />
    </ScrollArea>
  );
};

/**
 * Sidebar Footer
 */
interface SidebarFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export const VitalAppSidebarFooter: React.FC<SidebarFooterProps> = ({
  children,
  className,
}) => {
  return (
    <div
      className={cn(
        'px-3 pb-4 pt-3 border-t border-border/40 relative',
        className
      )}
    >
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/20 pointer-events-none" />
      <div className="relative">{children}</div>
    </div>
  );
};

/**
 * Sidebar Section
 */
interface SidebarSectionProps {
  section: SidebarSection;
  onNavigate: (href: string) => void;
  isPathActive: (href: string) => boolean;
  className?: string;
}

export const VitalAppSidebarSection: React.FC<SidebarSectionProps> = ({
  section,
  onNavigate,
  isPathActive,
  className,
}) => {
  const { isCollapsed, isMobile } = useAppSidebarContext();
  const [isExpanded, setExpanded] = React.useState(
    !section.defaultCollapsed
  );

  const showTitle = section.title && (!isCollapsed || isMobile);

  return (
    <div className={cn('space-y-1', className)}>
      {showTitle && (
        <button
          className="flex items-center justify-between w-full px-2 py-1"
          onClick={() => section.collapsible && setExpanded(!isExpanded)}
        >
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {section.title}
          </span>
          {section.collapsible && (
            <ChevronRight
              className={cn(
                'h-3 w-3 text-muted-foreground transition-transform',
                isExpanded && 'rotate-90'
              )}
            />
          )}
        </button>
      )}

      {(!section.collapsible || isExpanded) && (
        <div className="space-y-0.5">
          {section.items.map((item, index) =>
            item.separator ? (
              <div key={index} className="my-2 border-t border-border/40" />
            ) : (
              <VitalAppSidebarItem
                key={item.href || item.label}
                item={item}
                onNavigate={onNavigate}
                isActive={item.href ? isPathActive(item.href) : false}
              />
            )
          )}
        </div>
      )}
    </div>
  );
};

/**
 * Sidebar Item
 */
interface SidebarItemProps {
  item: SidebarItemType;
  onNavigate: (href: string) => void;
  isActive: boolean;
  depth?: number;
}

export const VitalAppSidebarItem: React.FC<SidebarItemProps> = ({
  item,
  onNavigate,
  isActive,
  depth = 0,
}) => {
  const { isCollapsed, isMobile } = useAppSidebarContext();
  const [isExpanded, setExpanded] = React.useState(false);
  const showFull = !isCollapsed || isMobile;
  const hasChildren = item.items && item.items.length > 0;
  const Icon = item.icon;

  const handleClick = () => {
    if (hasChildren) {
      setExpanded(!isExpanded);
    } else if (item.onClick) {
      item.onClick();
    } else if (item.href) {
      onNavigate(item.href);
    }
  };

  return (
    <div>
      <button
        className={cn(
          'flex items-center gap-3 w-full rounded-lg px-3 py-2 text-sm font-medium transition-colors',
          isActive
            ? 'bg-accent text-accent-foreground'
            : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground',
          isCollapsed && !isMobile && 'justify-center px-2',
          depth > 0 && 'pl-8'
        )}
        onClick={handleClick}
      >
        {Icon && <Icon className="h-4 w-4 shrink-0" />}
        {showFull && <span className="flex-1 truncate text-left">{item.label}</span>}
        {showFull && item.badge}
        {showFull && hasChildren && (
          <ChevronRight
            className={cn(
              'h-4 w-4 shrink-0 transition-transform',
              isExpanded && 'rotate-90'
            )}
          />
        )}
      </button>

      {/* Nested items */}
      {hasChildren && isExpanded && showFull && (
        <div className="mt-1 space-y-0.5">
          {item.items!.map((child) => (
            <VitalAppSidebarItem
              key={child.href || child.label}
              item={child}
              onNavigate={onNavigate}
              isActive={child.href ? child.isActive || false : false}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

/**
 * Sidebar Trigger for mobile
 */
interface SidebarTriggerProps {
  className?: string;
}

export const VitalAppSidebarTrigger: React.FC<SidebarTriggerProps> = ({
  className,
}) => {
  const { isOpen, setOpen } = useAppSidebarContext();

  return (
    <Button
      variant="ghost"
      size="icon"
      className={cn('lg:hidden', className)}
      onClick={() => setOpen(!isOpen)}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export interface VitalAppSidebarProps {
  /** Sidebar configuration */
  config?: SidebarConfig;
  /** Current pathname for route-based content */
  pathname?: string | null;
  /** Current user for footer display */
  user?: NavUser | null;
  /** Navigation handler */
  onNavigate: (href: string) => void;
  /** Route-based content components map */
  contentRouter?: Map<string | RegExp, React.ReactNode>;
  /** Default content when no route matches */
  defaultContent?: React.ReactNode;
  /** User footer component */
  userFooter?: React.ReactNode;
  /** Additional className */
  className?: string;
}

export const VitalAppSidebar: React.FC<VitalAppSidebarProps> = ({
  config,
  pathname,
  user,
  onNavigate,
  contentRouter,
  defaultContent,
  userFooter,
  className,
}) => {
  const { isCollapsed, isMobile, isOpen, setOpen } = useAppSidebarContext();

  const isPathActive = (href: string): boolean => {
    return pathname === href || (pathname?.startsWith(`${href}/`) ?? false);
  };

  // Determine which content to render based on pathname
  const renderContent = () => {
    if (contentRouter && pathname) {
      // Check for matching route
      for (const [pattern, component] of contentRouter) {
        if (typeof pattern === 'string') {
          if (pathname.startsWith(pattern)) {
            return component;
          }
        } else if (pattern instanceof RegExp) {
          if (pattern.test(pathname)) {
            return component;
          }
        }
      }
    }

    // Use config content routes
    if (config?.contentRoutes && pathname) {
      const sortedRoutes = [...config.contentRoutes].sort(
        (a, b) => (b.priority || 0) - (a.priority || 0)
      );

      for (const route of sortedRoutes) {
        if (typeof route.pattern === 'string') {
          if (pathname.startsWith(route.pattern)) {
            return route.component;
          }
        } else if (route.pattern instanceof RegExp) {
          if (route.pattern.test(pathname)) {
            return route.component;
          }
        }
      }
    }

    // Use default sections
    if (config?.defaultSections) {
      return (
        <>
          {config.defaultSections.map((section, index) => (
            <VitalAppSidebarSection
              key={section.title || index}
              section={section}
              onNavigate={onNavigate}
              isPathActive={isPathActive}
            />
          ))}
        </>
      );
    }

    return defaultContent;
  };

  const width = isCollapsed ? '4rem' : '16rem';

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex flex-col border-r border-border/40 bg-sidebar transition-all duration-300',
          isMobile && !isOpen && '-translate-x-full',
          isMobile && 'fixed inset-y-0 left-0 z-50',
          !isMobile && 'relative',
          className
        )}
        style={{ width: isMobile ? '16rem' : width }}
      >
        <VitalAppSidebarHeader
          title={config?.header?.title}
          logo={config?.header?.logo}
          showStatus={config?.header?.showStatus}
          statusText={config?.header?.statusText}
        />

        <VitalAppSidebarContent>{renderContent()}</VitalAppSidebarContent>

        {(config?.showUserFooter || userFooter) && (
          <VitalAppSidebarFooter>{userFooter}</VitalAppSidebarFooter>
        )}
      </aside>
    </>
  );
};

VitalAppSidebar.displayName = 'VitalAppSidebar';

export default VitalAppSidebar;

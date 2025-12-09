'use client';

import { createContext, useContext, useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

// ============================================================================
// SIDEBAR CONTEXT
// ============================================================================

interface SidebarContextValue {
  isOpen: boolean;
  isCollapsed: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;
  isMobile: boolean;
}

const SidebarContext = createContext<SidebarContextValue | undefined>(undefined);

export function useSidebarContext() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebarContext must be used within VitalSidebarProvider');
  }
  return context;
}

// ============================================================================
// SIDEBAR PROVIDER
// ============================================================================

interface VitalSidebarProviderProps {
  children: ReactNode;
  defaultOpen?: boolean;
  defaultCollapsed?: boolean;
}

export function VitalSidebarProvider({
  children,
  defaultOpen = true,
  defaultCollapsed = false
}: VitalSidebarProviderProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [isMobile, setIsMobile] = useState(false);

  const toggle = () => {
    if (isMobile) {
      setIsOpen(!isOpen);
    } else {
      setIsCollapsed(!isCollapsed);
    }
  };

  return (
    <SidebarContext.Provider value={{
      isOpen,
      isCollapsed,
      toggle,
      setCollapsed: setIsCollapsed,
      isMobile
    }}>
      <div className="flex min-h-screen">
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ============================================================================
// MAIN SIDEBAR COMPONENT
// ============================================================================

interface VitalSidebarProps {
  children: ReactNode;
  className?: string;
  side?: 'left' | 'right';
  variant?: 'default' | 'inset' | 'floating';
}

/**
 * VitalSidebar - Main sidebar container
 * 
 * Supports collapsible states, mobile responsiveness,
 * and multiple variants. Works with shadcn/ui sidebar primitives.
 * Enhanced version of legacy sidebars, reusable across all services.
 */
export function VitalSidebar({
  children,
  className,
  side = 'left',
  variant = 'default'
}: VitalSidebarProps) {
  const { isOpen, isCollapsed, toggle, isMobile } = useSidebarContext();

  const width = isCollapsed ? '4rem' : '16rem';
  const showContent = isMobile ? isOpen : true;

  return (
    <>
      {/* Mobile overlay */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50"
          onClick={toggle}
        />
      )}

      <aside
        className={cn(
          "fixed z-50 flex flex-col border-r bg-background transition-all duration-300",
          side === 'left' ? 'left-0' : 'right-0 border-l border-r-0',
          variant === 'floating' && 'm-2 rounded-lg border shadow-lg',
          variant === 'inset' && 'relative',
          isMobile && !isOpen && (side === 'left' ? '-translate-x-full' : 'translate-x-full'),
          className
        )}
        style={{ 
          width,
          height: variant === 'floating' ? 'calc(100vh - 1rem)' : '100vh'
        }}
      >
        {showContent && children}
      </aside>

      {/* Spacer for non-floating variants */}
      {variant !== 'floating' && !isMobile && (
        <div 
          className="shrink-0 transition-all duration-300"
          style={{ width }}
        />
      )}
    </>
  );
}

// ============================================================================
// SIDEBAR HEADER
// ============================================================================

interface VitalSidebarHeaderProps {
  children: ReactNode;
  className?: string;
  showCollapse?: boolean;
}

export function VitalSidebarHeader({
  children,
  className,
  showCollapse = true
}: VitalSidebarHeaderProps) {
  const { isCollapsed, toggle, isMobile } = useSidebarContext();

  return (
    <div className={cn(
      "flex items-center justify-between border-b px-4 py-3",
      isCollapsed && !isMobile && "justify-center px-2",
      className
    )}>
      {(!isCollapsed || isMobile) && children}
      
      {showCollapse && !isMobile && (
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8"
                onClick={toggle}
              >
                {isCollapsed ? (
                  <ChevronRight className="h-4 w-4" />
                ) : (
                  <ChevronLeft className="h-4 w-4" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              {isCollapsed ? 'Expand' : 'Collapse'}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      )}
    </div>
  );
}

// ============================================================================
// SIDEBAR CONTENT
// ============================================================================

interface VitalSidebarContentProps {
  children: ReactNode;
  className?: string;
}

export function VitalSidebarContent({
  children,
  className
}: VitalSidebarContentProps) {
  return (
    <ScrollArea className={cn("flex-1", className)}>
      <div className="p-4">
        {children}
      </div>
    </ScrollArea>
  );
}

// ============================================================================
// SIDEBAR FOOTER
// ============================================================================

interface VitalSidebarFooterProps {
  children: ReactNode;
  className?: string;
}

export function VitalSidebarFooter({
  children,
  className
}: VitalSidebarFooterProps) {
  const { isCollapsed, isMobile } = useSidebarContext();

  return (
    <div className={cn(
      "border-t px-4 py-3",
      isCollapsed && !isMobile && "px-2",
      className
    )}>
      {children}
    </div>
  );
}

// ============================================================================
// SIDEBAR GROUP
// ============================================================================

interface VitalSidebarGroupProps {
  children: ReactNode;
  label?: string;
  className?: string;
}

export function VitalSidebarGroup({
  children,
  label,
  className
}: VitalSidebarGroupProps) {
  const { isCollapsed, isMobile } = useSidebarContext();
  const showLabel = label && (!isCollapsed || isMobile);

  return (
    <div className={cn("mb-4", className)}>
      {showLabel && (
        <h4 className="mb-2 px-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          {label}
        </h4>
      )}
      <div className="space-y-1">
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// SIDEBAR ITEM
// ============================================================================

interface VitalSidebarItemProps {
  icon?: ReactNode;
  label: string;
  href?: string;
  onClick?: () => void;
  isActive?: boolean;
  badge?: ReactNode;
  className?: string;
}

export function VitalSidebarItem({
  icon,
  label,
  href,
  onClick,
  isActive = false,
  badge,
  className
}: VitalSidebarItemProps) {
  const { isCollapsed, isMobile } = useSidebarContext();
  const showFull = !isCollapsed || isMobile;

  const content = (
    <div className={cn(
      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
      isActive 
        ? "bg-accent text-accent-foreground" 
        : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
      isCollapsed && !isMobile && "justify-center px-2",
      className
    )}>
      {icon && <span className="shrink-0">{icon}</span>}
      {showFull && <span className="flex-1 truncate">{label}</span>}
      {showFull && badge}
    </div>
  );

  if (isCollapsed && !isMobile) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            {href ? (
              <a href={href}>{content}</a>
            ) : (
              <button onClick={onClick} className="w-full">
                {content}
              </button>
            )}
          </TooltipTrigger>
          <TooltipContent side="right">
            {label}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (href) {
    return <a href={href}>{content}</a>;
  }

  return (
    <button onClick={onClick} className="w-full">
      {content}
    </button>
  );
}

// ============================================================================
// SIDEBAR TRIGGER (for mobile)
// ============================================================================

interface VitalSidebarTriggerProps {
  className?: string;
}

export function VitalSidebarTrigger({ className }: VitalSidebarTriggerProps) {
  const { toggle } = useSidebarContext();

  return (
    <Button 
      variant="ghost" 
      size="icon"
      className={cn("lg:hidden", className)}
      onClick={toggle}
    >
      <Menu className="h-5 w-5" />
    </Button>
  );
}

// ============================================================================
// SIDEBAR INSET (main content area)
// ============================================================================

interface VitalSidebarInsetProps {
  children: ReactNode;
  className?: string;
}

export function VitalSidebarInset({
  children,
  className
}: VitalSidebarInsetProps) {
  return (
    <main className={cn("flex-1 overflow-auto", className)}>
      {children}
    </main>
  );
}

export default VitalSidebar;

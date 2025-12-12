'use client';

/**
 * VITAL Platform - Mobile Responsive Utilities
 *
 * Provides responsive hooks, components, and utilities for
 * optimal mobile experience in the Ask Expert service.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useEffect, createContext, useContext, useCallback } from 'react';
import { motion, AnimatePresence, useDragControls } from 'framer-motion';
import {
  Menu,
  X,
  ChevronUp,
  ChevronDown,
  Maximize2,
  Minimize2,
  GripVertical,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type Breakpoint = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

export interface ResponsiveContextValue {
  breakpoint: Breakpoint;
  isMobile: boolean;
  isTablet: boolean;
  isDesktop: boolean;
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

// =============================================================================
// CONSTANTS
// =============================================================================

const BREAKPOINTS: Record<Breakpoint, number> = {
  xs: 0,
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
};

// =============================================================================
// CONTEXT
// =============================================================================

const ResponsiveContext = createContext<ResponsiveContextValue | null>(null);

export function useResponsive() {
  const context = useContext(ResponsiveContext);
  if (!context) {
    throw new Error('useResponsive must be used within ResponsiveProvider');
  }
  return context;
}

// =============================================================================
// PROVIDER
// =============================================================================

export interface ResponsiveProviderProps {
  children: React.ReactNode;
}

export function ResponsiveProvider({ children }: ResponsiveProviderProps) {
  const [state, setState] = useState<ResponsiveContextValue>({
    breakpoint: 'lg',
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    width: typeof window !== 'undefined' ? window.innerWidth : 1024,
    height: typeof window !== 'undefined' ? window.innerHeight : 768,
    orientation: 'landscape',
  });

  useEffect(() => {
    function updateState() {
      const width = window.innerWidth;
      const height = window.innerHeight;

      let breakpoint: Breakpoint = 'xs';
      for (const [bp, minWidth] of Object.entries(BREAKPOINTS)) {
        if (width >= minWidth) {
          breakpoint = bp as Breakpoint;
        }
      }

      setState({
        breakpoint,
        isMobile: width < BREAKPOINTS.md,
        isTablet: width >= BREAKPOINTS.md && width < BREAKPOINTS.lg,
        isDesktop: width >= BREAKPOINTS.lg,
        width,
        height,
        orientation: width > height ? 'landscape' : 'portrait',
      });
    }

    updateState();
    window.addEventListener('resize', updateState);
    return () => window.removeEventListener('resize', updateState);
  }, []);

  return (
    <ResponsiveContext.Provider value={state}>{children}</ResponsiveContext.Provider>
  );
}

// =============================================================================
// RESPONSIVE COMPONENTS
// =============================================================================

/**
 * Only renders children on specified breakpoints
 */
export interface ShowOnProps {
  children: React.ReactNode;
  breakpoints: Breakpoint[];
}

export function ShowOn({ children, breakpoints }: ShowOnProps) {
  const { breakpoint } = useResponsive();
  if (!breakpoints.includes(breakpoint)) return null;
  return <>{children}</>;
}

/**
 * Hides children on specified breakpoints
 */
export function HideOn({ children, breakpoints }: ShowOnProps) {
  const { breakpoint } = useResponsive();
  if (breakpoints.includes(breakpoint)) return null;
  return <>{children}</>;
}

/**
 * Mobile-only content
 */
export function MobileOnly({ children }: { children: React.ReactNode }) {
  const { isMobile } = useResponsive();
  if (!isMobile) return null;
  return <>{children}</>;
}

/**
 * Desktop-only content
 */
export function DesktopOnly({ children }: { children: React.ReactNode }) {
  const { isDesktop } = useResponsive();
  if (!isDesktop) return null;
  return <>{children}</>;
}

// =============================================================================
// MOBILE DRAWER
// =============================================================================

export interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  position?: 'left' | 'right' | 'bottom';
  title?: string;
  className?: string;
}

export function MobileDrawer({
  isOpen,
  onClose,
  children,
  position = 'bottom',
  title,
  className,
}: MobileDrawerProps) {
  const dragControls = useDragControls();
  const [dragY, setDragY] = useState(0);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { y: number } }) => {
      if (position === 'bottom' && info.offset.y > 100) {
        onClose();
      }
      setDragY(0);
    },
    [position, onClose]
  );

  const variants = {
    left: {
      initial: { x: '-100%' },
      animate: { x: 0 },
      exit: { x: '-100%' },
    },
    right: {
      initial: { x: '100%' },
      animate: { x: 0 },
      exit: { x: '100%' },
    },
    bottom: {
      initial: { y: '100%' },
      animate: { y: 0 },
      exit: { y: '100%' },
    },
  };

  const positionClasses = {
    left: 'left-0 top-0 bottom-0 w-[85%] max-w-sm',
    right: 'right-0 top-0 bottom-0 w-[85%] max-w-sm',
    bottom: 'left-0 right-0 bottom-0 max-h-[85vh] rounded-t-2xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Drawer */}
          <motion.div
            initial={variants[position].initial}
            animate={variants[position].animate}
            exit={variants[position].exit}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            drag={position === 'bottom' ? 'y' : false}
            dragControls={dragControls}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={handleDragEnd}
            style={{ y: position === 'bottom' ? dragY : 0 }}
            className={cn(
              'fixed z-50 bg-white shadow-xl',
              positionClasses[position],
              className
            )}
          >
            {/* Drag handle for bottom drawer */}
            {position === 'bottom' && (
              <div
                className="flex justify-center py-3 cursor-grab active:cursor-grabbing"
                onPointerDown={(e) => dragControls.start(e)}
              >
                <div className="w-12 h-1.5 rounded-full bg-slate-300" />
              </div>
            )}

            {/* Header */}
            {title && (
              <div className="flex items-center justify-between px-4 py-3 border-b">
                <h2 className="font-semibold text-slate-900">{title}</h2>
                <button
                  onClick={onClose}
                  className="p-2 text-slate-400 hover:text-slate-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* Content */}
            <div className="overflow-auto">{children}</div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// MOBILE BOTTOM SHEET
// =============================================================================

export interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  /** Snap points as percentages (e.g., [0.25, 0.5, 1]) */
  snapPoints?: number[];
  /** Initial snap point index */
  initialSnap?: number;
  title?: string;
  className?: string;
}

export function MobileBottomSheet({
  isOpen,
  onClose,
  children,
  snapPoints = [0.4, 0.8],
  initialSnap = 0,
  title,
  className,
}: MobileBottomSheetProps) {
  const [currentSnap, setCurrentSnap] = useState(initialSnap);
  const { height: viewportHeight } = useResponsive();

  const currentHeight = viewportHeight * snapPoints[currentSnap];

  const cycleSnap = () => {
    setCurrentSnap((prev) => (prev + 1) % snapPoints.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ height: currentHeight, y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className={cn(
              'fixed left-0 right-0 bottom-0 bg-white rounded-t-2xl shadow-xl z-50',
              className
            )}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b">
              {/* Drag handle */}
              <button
                onClick={cycleSnap}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                {currentSnap === snapPoints.length - 1 ? (
                  <ChevronDown className="w-5 h-5" />
                ) : (
                  <ChevronUp className="w-5 h-5" />
                )}
              </button>

              {title && <h2 className="font-semibold text-slate-900">{title}</h2>}

              <button
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-slate-600 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="overflow-auto" style={{ height: currentHeight - 56 }}>
              {children}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// MOBILE HAMBURGER MENU
// =============================================================================

export interface MobileMenuButtonProps {
  isOpen: boolean;
  onClick: () => void;
  className?: string;
}

export function MobileMenuButton({ isOpen, onClick, className }: MobileMenuButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors',
        className
      )}
      aria-label={isOpen ? 'Close menu' : 'Open menu'}
    >
      <AnimatePresence mode="wait">
        {isOpen ? (
          <motion.div
            key="close"
            initial={{ rotate: -90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <X className="w-6 h-6" />
          </motion.div>
        ) : (
          <motion.div
            key="menu"
            initial={{ rotate: 90, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: -90, opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            <Menu className="w-6 h-6" />
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}

// =============================================================================
// SWIPE TO ACTION
// =============================================================================

export interface SwipeActionProps {
  children: React.ReactNode;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  leftAction?: React.ReactNode;
  rightAction?: React.ReactNode;
  threshold?: number;
  className?: string;
}

export function SwipeAction({
  children,
  onSwipeLeft,
  onSwipeRight,
  leftAction,
  rightAction,
  threshold = 100,
  className,
}: SwipeActionProps) {
  const [dragX, setDragX] = useState(0);

  const handleDragEnd = useCallback(
    (_: unknown, info: { offset: { x: number } }) => {
      if (info.offset.x > threshold && onSwipeRight) {
        onSwipeRight();
      } else if (info.offset.x < -threshold && onSwipeLeft) {
        onSwipeLeft();
      }
      setDragX(0);
    },
    [threshold, onSwipeLeft, onSwipeRight]
  );

  return (
    <div className={cn('relative overflow-hidden', className)}>
      {/* Left action background */}
      {rightAction && dragX > 0 && (
        <div className="absolute left-0 top-0 bottom-0 flex items-center px-4 bg-green-500 text-white">
          {rightAction}
        </div>
      )}

      {/* Right action background */}
      {leftAction && dragX < 0 && (
        <div className="absolute right-0 top-0 bottom-0 flex items-center px-4 bg-red-500 text-white">
          {leftAction}
        </div>
      )}

      {/* Draggable content */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDrag={(_, info) => setDragX(info.offset.x)}
        onDragEnd={handleDragEnd}
        style={{ x: dragX }}
        className="relative bg-white"
      >
        {children}
      </motion.div>
    </div>
  );
}

// =============================================================================
// PULL TO REFRESH
// =============================================================================

export interface PullToRefreshProps {
  children: React.ReactNode;
  onRefresh: () => Promise<void>;
  threshold?: number;
  className?: string;
}

export function PullToRefresh({
  children,
  onRefresh,
  threshold = 80,
  className,
}: PullToRefreshProps) {
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleDragEnd = useCallback(async () => {
    if (pullDistance > threshold && !isRefreshing) {
      setIsRefreshing(true);
      await onRefresh();
      setIsRefreshing(false);
    }
    setPullDistance(0);
  }, [pullDistance, threshold, isRefreshing, onRefresh]);

  const progress = Math.min(pullDistance / threshold, 1);

  return (
    <div className={cn('relative', className)}>
      {/* Pull indicator */}
      <AnimatePresence>
        {(pullDistance > 0 || isRefreshing) && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-0 left-0 right-0 flex justify-center py-4 z-10"
          >
            <motion.div
              animate={{ rotate: isRefreshing ? 360 : 0 }}
              transition={{ duration: 1, repeat: isRefreshing ? Infinity : 0, ease: 'linear' }}
              className={cn(
                'w-8 h-8 rounded-full border-2 border-purple-500',
                isRefreshing ? 'border-t-transparent' : ''
              )}
              style={{
                transform: `rotate(${progress * 180}deg)`,
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      <motion.div
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.5}
        onDrag={(_, info) => {
          if (info.offset.y > 0) {
            setPullDistance(info.offset.y);
          }
        }}
        onDragEnd={handleDragEnd}
        style={{ y: pullDistance > 0 ? pullDistance * 0.5 : 0 }}
      >
        {children}
      </motion.div>
    </div>
  );
}

// =============================================================================
// RESPONSIVE GRID
// =============================================================================

export interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    xs?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export function ResponsiveGrid({
  children,
  cols = { xs: 1, sm: 2, md: 3, lg: 4 },
  gap = 4,
  className,
}: ResponsiveGridProps) {
  const { breakpoint } = useResponsive();

  const getColumns = () => {
    const breakpoints: Breakpoint[] = ['xs', 'sm', 'md', 'lg', 'xl', '2xl'];
    let columns = cols.xs || 1;

    for (const bp of breakpoints) {
      if (cols[bp as keyof typeof cols]) {
        columns = cols[bp as keyof typeof cols]!;
      }
      if (bp === breakpoint) break;
    }

    return columns;
  };

  return (
    <div
      className={className}
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${getColumns()}, minmax(0, 1fr))`,
        gap: `${gap * 4}px`,
      }}
    >
      {children}
    </div>
  );
}

export default ResponsiveProvider;

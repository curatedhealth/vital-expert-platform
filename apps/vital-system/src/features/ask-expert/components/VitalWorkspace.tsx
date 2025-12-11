'use client';

/**
 * VITAL Platform - VitalWorkspace Component
 *
 * Adaptive shell component that provides the layout structure for
 * both Interactive (Modes 1&2) and Autonomous (Modes 3&4) views.
 *
 * Features:
 * - Mode-aware layout switching (Interactive vs Autonomous)
 * - Collapsible sidebar with expert selection
 * - Adaptive artifact panel (horizontal capability)
 * - Responsive design with mobile-first approach
 * - Animated transitions using Framer Motion
 * - Accessibility: keyboard navigation, focus management
 *
 * Design System: VITAL Brand v6.0 (Warm Purple #9055E0)
 */

import React, { useState, useCallback, useEffect, useRef } from 'react';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';
import { cn } from '@/lib/utils';
import {
  PanelLeftClose,
  PanelLeft,
  PanelRightClose,
  PanelRight,
  Sparkles,
  Settings,
  MoreVertical,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

export type WorkspaceMode = 'interactive' | 'autonomous';
export type SidebarPosition = 'left' | 'right';

export interface VitalWorkspaceProps {
  /** Current workspace mode */
  mode: WorkspaceMode;
  /** Optional specific mode number for styling (1-4) */
  modeNumber?: 1 | 2 | 3 | 4;
  /** Left sidebar content (typically expert selection) */
  sidebarContent?: React.ReactNode;
  /** Main chat/content area */
  children: React.ReactNode;
  /** Right panel content (artifacts, research) */
  artifactPanel?: React.ReactNode;
  /** Header content (optional) */
  header?: React.ReactNode;
  /** Footer content (optional) */
  footer?: React.ReactNode;
  /** Initial sidebar collapsed state */
  defaultSidebarCollapsed?: boolean;
  /** Initial artifact panel collapsed state */
  defaultArtifactPanelCollapsed?: boolean;
  /** Sidebar position */
  sidebarPosition?: SidebarPosition;
  /** Callback when mode changes */
  onModeChange?: (mode: WorkspaceMode) => void;
  /** Custom class names */
  className?: string;
  /** Enable mobile-responsive behavior */
  responsive?: boolean;
}

// =============================================================================
// SPRING ANIMATION CONFIG (Per Brand Guidelines)
// =============================================================================

const springConfig = {
  type: 'spring' as const,
  stiffness: 300,
  damping: 30,
};

const layoutTransition = {
  layout: springConfig,
};

// =============================================================================
// COMPONENT
// =============================================================================

export function VitalWorkspace({
  mode,
  modeNumber,
  sidebarContent,
  children,
  artifactPanel,
  header,
  footer,
  defaultSidebarCollapsed = false,
  defaultArtifactPanelCollapsed = true,
  sidebarPosition = 'left',
  onModeChange,
  className,
  responsive = true,
}: VitalWorkspaceProps) {
  // ==========================================================================
  // STATE
  // ==========================================================================

  const [sidebarCollapsed, setSidebarCollapsed] = useState(defaultSidebarCollapsed);
  const [artifactPanelCollapsed, setArtifactPanelCollapsed] = useState(
    defaultArtifactPanelCollapsed
  );
  const [isMobile, setIsMobile] = useState(false);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // ==========================================================================
  // RESPONSIVE HANDLING
  // ==========================================================================

  useEffect(() => {
    if (!responsive) return;

    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, [responsive]);

  // Auto-collapse sidebar on mobile
  useEffect(() => {
    if (isMobile && !sidebarCollapsed) {
      setSidebarCollapsed(true);
    }
  }, [isMobile, sidebarCollapsed]);

  // ==========================================================================
  // HANDLERS
  // ==========================================================================

  const toggleSidebar = useCallback(() => {
    setSidebarCollapsed((prev) => !prev);
  }, []);

  const toggleArtifactPanel = useCallback(() => {
    setArtifactPanelCollapsed((prev) => !prev);
  }, []);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === '[' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
      if (e.key === ']' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleArtifactPanel();
      }
    },
    [toggleSidebar, toggleArtifactPanel]
  );

  // ==========================================================================
  // COMPUTED VALUES
  // ==========================================================================

  const isInteractive = mode === 'interactive';
  const isAutonomous = mode === 'autonomous';

  // Mode-specific data attribute for CSS variables
  const modeDataAttr = isAutonomous ? 'autonomous' : 'interactive';

  // Sidebar width based on state
  const sidebarWidth = sidebarCollapsed ? 0 : isMobile ? '100%' : 280;
  const artifactPanelWidth = artifactPanelCollapsed ? 0 : isMobile ? '100%' : 400;

  // ==========================================================================
  // RENDER
  // ==========================================================================

  return (
    <TooltipProvider>
      <div
        data-mode={modeDataAttr}
        data-mode-number={modeNumber}
        className={cn(
          'vital-workspace',
          'flex h-screen w-full overflow-hidden',
          'bg-[var(--ae-bg-page,#FAFAF9)]',
          'text-stone-700',
          className
        )}
        onKeyDown={handleKeyDown}
        tabIndex={-1}
      >
        <LayoutGroup>
          {/* ================================================================ */}
          {/* SIDEBAR (Left by default) */}
          {/* ================================================================ */}
          {sidebarContent && sidebarPosition === 'left' && (
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.aside
                  key="sidebar-left"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: sidebarWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={springConfig}
                  className={cn(
                    'vital-sidebar',
                    'flex flex-col border-r border-[var(--ae-border,#E7E5E4)]',
                    'bg-[var(--ae-bg-surface,#F5F5F4)]',
                    'overflow-hidden',
                    isMobile && 'absolute inset-y-0 left-0 z-40'
                  )}
                >
                  {/* Sidebar Header */}
                  <div className="flex items-center justify-between p-4 border-b border-[var(--ae-border,#E7E5E4)]">
                    <div className="flex items-center gap-2">
                      <Sparkles
                        className="h-5 w-5 text-[var(--ae-accent-primary,#9055E0)]"
                        aria-hidden="true"
                      />
                      <span className="font-medium text-stone-800">
                        {isInteractive ? 'Expert Selection' : 'Mission Control'}
                      </span>
                    </div>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleSidebar}
                          aria-label="Collapse sidebar"
                          className="h-8 w-8 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                        >
                          <PanelLeftClose className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Collapse sidebar (Cmd+[)</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>

                  {/* Sidebar Content */}
                  <div className="flex-1 overflow-y-auto p-4">{sidebarContent}</div>
                </motion.aside>
              )}
            </AnimatePresence>
          )}

          {/* ================================================================ */}
          {/* MAIN CONTENT AREA */}
          {/* ================================================================ */}
          <motion.main
            ref={mainContentRef}
            layout
            transition={layoutTransition}
            className={cn(
              'vital-main',
              'flex flex-1 flex-col min-w-0',
              'bg-[var(--ae-bg-page,#FAFAF9)]'
            )}
          >
            {/* ============================================================ */}
            {/* HEADER */}
            {/* ============================================================ */}
            {(header || sidebarContent) && (
              <motion.header
                layout
                className={cn(
                  'vital-header',
                  'flex items-center justify-between',
                  'px-4 py-3',
                  'border-b border-[var(--ae-border,#E7E5E4)]',
                  'bg-[var(--ae-bg-surface,#F5F5F4)]'
                )}
              >
                <div className="flex items-center gap-2">
                  {/* Sidebar Toggle (when collapsed) */}
                  {sidebarContent && sidebarCollapsed && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleSidebar}
                          aria-label="Expand sidebar"
                          className="h-8 w-8 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                        >
                          <PanelLeft className="h-4 w-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="right">
                        <p>Expand sidebar (Cmd+[)</p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Mode Indicator */}
                  <div
                    className={cn(
                      'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm',
                      isInteractive
                        ? 'bg-blue-50 text-blue-700'
                        : 'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))] text-[var(--ae-accent-primary,#9055E0)]'
                    )}
                  >
                    <span
                      className={cn(
                        'h-2 w-2 rounded-full',
                        isInteractive ? 'bg-blue-500' : 'bg-[var(--ae-accent-primary,#9055E0)]'
                      )}
                    />
                    <span className="font-medium">
                      {isInteractive ? 'Interactive' : 'Autonomous'}
                      {modeNumber && ` Mode ${modeNumber}`}
                    </span>
                  </div>

                  {header}
                </div>

                <div className="flex items-center gap-2">
                  {/* Artifact Panel Toggle */}
                  {artifactPanel && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={toggleArtifactPanel}
                          aria-label={
                            artifactPanelCollapsed ? 'Show artifact panel' : 'Hide artifact panel'
                          }
                          className={cn(
                            'h-8 w-8',
                            artifactPanelCollapsed
                              ? 'text-stone-500 hover:text-stone-700'
                              : 'text-[var(--ae-accent-primary,#9055E0)] bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]'
                          )}
                        >
                          {artifactPanelCollapsed ? (
                            <PanelRight className="h-4 w-4" />
                          ) : (
                            <PanelRightClose className="h-4 w-4" />
                          )}
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent side="left">
                        <p>
                          {artifactPanelCollapsed ? 'Show' : 'Hide'} artifact panel (Cmd+])
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  )}

                  {/* Settings */}
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label="Settings"
                        className="h-8 w-8 text-stone-500 hover:text-stone-700 hover:bg-stone-100"
                      >
                        <Settings className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="left">
                      <p>Settings</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              </motion.header>
            )}

            {/* ============================================================ */}
            {/* CONTENT */}
            {/* ============================================================ */}
            <motion.div
              layout
              transition={layoutTransition}
              className={cn(
                'vital-content',
                'flex-1 flex overflow-hidden'
              )}
            >
              {/* Main Content */}
              <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                {children}
              </div>

              {/* Artifact Panel (Right) */}
              {artifactPanel && (
                <AnimatePresence mode="wait">
                  {!artifactPanelCollapsed && (
                    <motion.aside
                      key="artifact-panel"
                      initial={{ width: 0, opacity: 0 }}
                      animate={{ width: artifactPanelWidth, opacity: 1 }}
                      exit={{ width: 0, opacity: 0 }}
                      transition={springConfig}
                      className={cn(
                        'vital-artifact-panel',
                        'flex flex-col border-l border-[var(--ae-border,#E7E5E4)]',
                        'bg-[var(--ae-bg-surface,#F5F5F4)]',
                        'overflow-hidden',
                        isMobile && 'absolute inset-y-0 right-0 z-40'
                      )}
                    >
                      {artifactPanel}
                    </motion.aside>
                  )}
                </AnimatePresence>
              )}
            </motion.div>

            {/* ============================================================ */}
            {/* FOOTER */}
            {/* ============================================================ */}
            {footer && (
              <motion.footer
                layout
                className={cn(
                  'vital-footer',
                  'border-t border-[var(--ae-border,#E7E5E4)]',
                  'bg-[var(--ae-bg-surface,#F5F5F4)]'
                )}
              >
                {footer}
              </motion.footer>
            )}
          </motion.main>

          {/* ================================================================ */}
          {/* SIDEBAR (Right position option) */}
          {/* ================================================================ */}
          {sidebarContent && sidebarPosition === 'right' && (
            <AnimatePresence mode="wait">
              {!sidebarCollapsed && (
                <motion.aside
                  key="sidebar-right"
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: sidebarWidth, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={springConfig}
                  className={cn(
                    'vital-sidebar',
                    'flex flex-col border-l border-[var(--ae-border,#E7E5E4)]',
                    'bg-[var(--ae-bg-surface,#F5F5F4)]',
                    'overflow-hidden',
                    isMobile && 'absolute inset-y-0 right-0 z-40'
                  )}
                >
                  <div className="flex-1 overflow-y-auto p-4">{sidebarContent}</div>
                </motion.aside>
              )}
            </AnimatePresence>
          )}
        </LayoutGroup>

        {/* Mobile Overlay */}
        {isMobile && (!sidebarCollapsed || !artifactPanelCollapsed) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/20 z-30"
            onClick={() => {
              setSidebarCollapsed(true);
              setArtifactPanelCollapsed(true);
            }}
            aria-hidden="true"
          />
        )}
      </div>
    </TooltipProvider>
  );
}

// =============================================================================
// SUBCOMPONENTS
// =============================================================================

/**
 * VitalWorkspace.ChatArea - Main chat content area
 */
VitalWorkspace.ChatArea = function ChatArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'vital-chat-area',
        'flex-1 flex flex-col overflow-hidden',
        className
      )}
    >
      {children}
    </div>
  );
};

/**
 * VitalWorkspace.Messages - Scrollable message container
 */
VitalWorkspace.Messages = function Messages({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'vital-messages',
        'flex-1 overflow-y-auto px-4 py-6',
        'scroll-smooth',
        className
      )}
    >
      <div className="max-w-3xl mx-auto space-y-6">{children}</div>
    </div>
  );
};

/**
 * VitalWorkspace.InputArea - Fixed input area at bottom
 */
VitalWorkspace.InputArea = function InputArea({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'vital-input-area',
        'border-t border-[var(--ae-border,#E7E5E4)]',
        'bg-[var(--ae-bg-page,#FAFAF9)]',
        'px-4 py-3',
        className
      )}
    >
      <div className="max-w-3xl mx-auto">{children}</div>
    </div>
  );
};

export default VitalWorkspace;

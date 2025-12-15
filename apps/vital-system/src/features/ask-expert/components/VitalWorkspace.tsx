'use client';

/**
 * VITAL Platform - VitalWorkspace Component
 *
 * Adaptive shell for Ask Expert / Ask Panel built on shared Vital*
 * layout primitives. Interactive modes (1/2) use the standard chat
 * layout; autonomous modes (3/4) use a three-pane split (strategy /
 * main / artifacts). Scoped to Ask Expert/Panel to avoid impacting
 * other services.
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { VitalChatLayout, VitalSplitPanel } from '@vital/ai-ui/layout';

// =============================================================================
// TYPES
// =============================================================================

export type WorkspaceMode = 'interactive' | 'autonomous';
export type SidebarPosition = 'left' | 'right';

export interface VitalWorkspaceProps {
  mode: WorkspaceMode;
  modeNumber?: 1 | 2 | 3 | 4;
  sidebarContent?: React.ReactNode;
  children: React.ReactNode;
  artifactPanel?: React.ReactNode;
  header?: React.ReactNode;
  footer?: React.ReactNode;
  defaultSidebarCollapsed?: boolean;
  defaultArtifactPanelCollapsed?: boolean;
  sidebarPosition?: SidebarPosition;
  onModeChange?: (mode: WorkspaceMode) => void;
  className?: string;
  responsive?: boolean;
}

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
  const isInteractive = mode === 'interactive';

  // Interactive (Modes 1/2): 2-pane layout with optional context panel
  if (isInteractive) {
    return (
      <VitalChatLayout
        sidebar={sidebarContent}
        header={header}
        messages={<div className="h-full overflow-auto">{children}</div>}
        input={footer ?? <div />}
        contextPanel={artifactPanel}
        showContextPanel={Boolean(artifactPanel)}
        className={cn(
          'bg-[var(--canvas-primary)] text-[var(--stone-700)]',
          className
        )}
      />
    );
  }

  // Autonomous (Modes 3/4): 3-pane layout (strategy/sidebar • main • artifacts/context)
  return (
    <div
      data-mode="autonomous"
      data-mode-number={modeNumber}
      className={cn('h-screen w-full bg-[var(--canvas-primary)] text-[var(--stone-700)]', className)}
    >
      <VitalSplitPanel
        defaultSize={defaultSidebarCollapsed || !sidebarContent ? 0 : 24}
        minSize={sidebarContent ? 16 : 0}
        maxSize={sidebarContent ? 32 : 0}
        className="h-full"
      >
        <aside
          className={cn(
            'h-full border-r bg-[var(--canvas-surface)] overflow-auto',
            sidebarContent ? 'block' : 'hidden'
          )}
          data-position={sidebarPosition}
        >
          {sidebarContent}
        </aside>

        <VitalSplitPanel
          defaultSize={artifactPanel ? 70 : 100}
          minSize={artifactPanel ? 55 : 100}
          maxSize={artifactPanel ? 85 : 100}
          className="h-full"
        >
          <div className="flex h-full flex-col overflow-hidden">
            {header && (
              <div className="border-b bg-[var(--canvas-elevated)]/80 backdrop-blur-sm">
                {header}
              </div>
            )}
            <div className="flex-1 overflow-auto">{children}</div>
            {footer && (
              <div className="border-t bg-[var(--canvas-elevated)]/80 backdrop-blur-sm">
                {footer}
              </div>
            )}
          </div>

          {artifactPanel ? (
            <div className="h-full border-l bg-[var(--canvas-surface)] overflow-auto">
              {artifactPanel}
            </div>
          ) : (
            <div />
          )}
        </VitalSplitPanel>
      </VitalSplitPanel>
    </div>
  );
}

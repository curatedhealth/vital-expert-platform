'use client';

import { ReactNode } from 'react';
import { cn } from '../../lib/utils';

interface VitalChatLayoutProps {
  sidebar?: ReactNode;
  header?: ReactNode;
  messages: ReactNode;
  input: ReactNode;
  contextPanel?: ReactNode;
  showSidebar?: boolean;
  showContextPanel?: boolean;
  className?: string;
}

/**
 * VitalChatLayout - Standard chat interface layout
 * 
 * Provides a consistent layout for chat-based interfaces
 * with optional sidebar and context panels.
 * Reusable across Ask Expert, Ask Panel, and other chat services.
 */
export function VitalChatLayout({
  sidebar,
  header,
  messages,
  input,
  contextPanel,
  showSidebar = true,
  showContextPanel = false,
  className
}: VitalChatLayoutProps) {
  return (
    <div className={cn("flex h-screen overflow-hidden", className)}>
      {/* Sidebar */}
      {sidebar && showSidebar && (
        <div className="w-64 border-r bg-muted/30 shrink-0 hidden lg:block">
          {sidebar}
        </div>
      )}

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        {header && (
          <div className="border-b shrink-0">
            {header}
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-auto">
          {messages}
        </div>

        {/* Input */}
        <div className="border-t p-4 shrink-0 bg-background">
          {input}
        </div>
      </div>

      {/* Context panel */}
      {contextPanel && showContextPanel && (
        <div className="w-80 border-l bg-muted/30 shrink-0 hidden xl:block">
          {contextPanel}
        </div>
      )}
    </div>
  );
}

/**
 * VitalChatMessages - Scrollable messages container
 */
export function VitalChatMessages({
  children,
  className
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex flex-col gap-4 p-4 max-w-4xl mx-auto w-full",
      className
    )}>
      {children}
    </div>
  );
}

/**
 * VitalChatHeader - Chat header with actions
 */
export function VitalChatHeader({
  title,
  subtitle,
  actions,
  className
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn(
      "flex items-center justify-between px-4 py-3",
      className
    )}>
      <div>
        <h2 className="font-semibold">{title}</h2>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

export default VitalChatLayout;

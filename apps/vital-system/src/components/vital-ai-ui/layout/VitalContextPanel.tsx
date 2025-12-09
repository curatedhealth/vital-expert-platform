'use client';

import { useState, ReactNode } from 'react';
import { cn } from '@/lib/utils';
import { X, ChevronRight, ChevronLeft, Pin, PinOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  content: ReactNode;
  badge?: string | number;
}

interface VitalContextPanelProps {
  tabs: Tab[];
  defaultTab?: string;
  position?: 'left' | 'right';
  isOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  isPinned?: boolean;
  onPinnedChange?: (pinned: boolean) => void;
  title?: string;
  width?: number;
  showClose?: boolean;
  className?: string;
}

/**
 * VitalContextPanel - Contextual side panel with tabs
 * 
 * Slide-out panel for contextual information with tabbed content.
 * Supports pinning, multiple tabs, and responsive behavior.
 * Replaces legacy contextual-sidebar component.
 */
export function VitalContextPanel({
  tabs,
  defaultTab,
  position = 'right',
  isOpen: controlledOpen,
  onOpenChange,
  isPinned: controlledPinned,
  onPinnedChange,
  title,
  width = 320,
  showClose = true,
  className
}: VitalContextPanelProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [internalPinned, setInternalPinned] = useState(false);
  const [activeTab, setActiveTab] = useState(defaultTab || tabs[0]?.id);

  const isOpen = controlledOpen ?? internalOpen;
  const isPinned = controlledPinned ?? internalPinned;

  const handleOpenChange = (open: boolean) => {
    if (onOpenChange) {
      onOpenChange(open);
    } else {
      setInternalOpen(open);
    }
  };

  const handlePinnedChange = (pinned: boolean) => {
    if (onPinnedChange) {
      onPinnedChange(pinned);
    } else {
      setInternalPinned(pinned);
    }
  };

  const activeTabContent = tabs.find(t => t.id === activeTab);

  return (
    <>
      {/* Toggle button when closed */}
      {!isOpen && (
        <Button
          variant="outline"
          size="icon"
          className={cn(
            "fixed z-40 top-1/2 -translate-y-1/2",
            position === 'right' ? 'right-0 rounded-r-none' : 'left-0 rounded-l-none'
          )}
          onClick={() => handleOpenChange(true)}
        >
          {position === 'right' ? (
            <ChevronLeft className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
        </Button>
      )}

      {/* Panel */}
      <div
        className={cn(
          "fixed top-0 z-50 h-screen bg-background border shadow-lg transition-transform duration-300",
          position === 'right' ? 'right-0 border-l' : 'left-0 border-r',
          !isOpen && (position === 'right' ? 'translate-x-full' : '-translate-x-full'),
          className
        )}
        style={{ width }}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            {title && <h3 className="font-medium">{title}</h3>}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => handlePinnedChange(!isPinned)}
            >
              {isPinned ? (
                <PinOff className="h-4 w-4" />
              ) : (
                <Pin className="h-4 w-4" />
              )}
            </Button>
            
            {showClose && (
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => handleOpenChange(false)}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* Tabs */}
        {tabs.length > 1 && (
          <div className="flex border-b">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium transition-colors",
                  "border-b-2 -mb-px",
                  activeTab === tab.id
                    ? "border-primary text-primary"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && (
                  <span className="px-1.5 py-0.5 text-xs rounded-full bg-muted">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Content */}
        <ScrollArea className="h-[calc(100vh-120px)]">
          <div className="p-4">
            {activeTabContent?.content}
          </div>
        </ScrollArea>
      </div>

      {/* Overlay when not pinned */}
      {isOpen && !isPinned && (
        <div
          className="fixed inset-0 z-40 bg-black/20"
          onClick={() => handleOpenChange(false)}
        />
      )}
    </>
  );
}

export default VitalContextPanel;

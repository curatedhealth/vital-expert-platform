'use client';

import { ChevronDown, ChevronRight, Brain } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Card } from '@vital/ui';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger
} from '@vital/ui';
import { cn } from '@/lib/utils';

// 🧠 Reasoning Component Interface
interface ReasoningProps {
  children: React.ReactNode;
  className?: string;
  isStreaming?: boolean;
  defaultOpen?: boolean;
}

interface ReasoningTriggerProps {
  title?: string;
  className?: string;
}

interface ReasoningContentProps {
  children: React.ReactNode;
  className?: string;
}

// 🎯 Reasoning Context
const ReasoningContext = React.createContext<{
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  isStreaming: boolean;
}>({
  isOpen: false,
  setIsOpen: () => { /* TODO: implement */ },
  isStreaming: false,
});

// 🧠 Main Reasoning Component
export const Reasoning: React.FC<ReasoningProps> = ({
  children,
  className,
  isStreaming = false,
  defaultOpen = false,
}) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  // Auto-open when streaming starts, auto-close when streaming ends
  useEffect(() => {
    if (isStreaming) {
      setIsOpen(true);
    } else {
      // Optional: auto-close when streaming ends
      // setIsOpen(false);
    }
  }, [isStreaming]);

  return (
    <ReasoningContext.Provider value={{ isOpen, setIsOpen, isStreaming }}>
      <Card className={cn(
        'border-l-4 border-l-blue-400 bg-gradient-to-r from-blue-50/30 to-transparent',
        className
      )}>
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          {children}
        </Collapsible>
      </Card>
    </ReasoningContext.Provider>
  );
};

// 🎭 Reasoning Trigger Component
export const ReasoningTrigger: React.FC<ReasoningTriggerProps> = ({
  title = "Thinking",
  className,
}) => {
  const { isOpen, isStreaming } = React.useContext(ReasoningContext);

  return (
    <CollapsibleTrigger className={cn(
      "w-full p-4 hover:bg-neutral-50/50 transition-colors",
      className
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            {isOpen ? (
              <ChevronDown className="h-4 w-4 text-neutral-500" />
            ) : (
              <ChevronRight className="h-4 w-4 text-neutral-500" />
            )}
            <Brain className="h-4 w-4 text-blue-500" />
            <span className="font-medium text-neutral-900 text-left">
              {title}
            </span>
          </div>
          {isStreaming && (
            <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
              Thinking...
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          {isStreaming && (
            <div className="flex space-x-1">
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>
          )}
        </div>
      </div>
    </CollapsibleTrigger>
  );
};

// 🎨 Rich Text Formatter Function - Convert markdown to HTML
const formatRichText = (text: string): string => {
  if (typeof text !== 'string') return text;

  // Convert **text** to <strong>text</strong>
  return text.replace(/\*\*([^*]+)\*\*/g, '<strong class="font-semibold text-neutral-900">$1</strong>');
};

// 📝 Reasoning Content Component
export const ReasoningContent: React.FC<ReasoningContentProps> = ({
  children,
  className,
}) => {
  // If children is a string, format it and use dangerouslySetInnerHTML
  if (typeof children === 'string') {

    return (
      <CollapsibleContent>
        <div
          className={cn(
            "px-4 pb-4 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap",
            className
          )}
          dangerouslySetInnerHTML={{ __html: formattedHTML }}
        />
      </CollapsibleContent>
    );
  }

  // Otherwise render children directly
  return (
    <CollapsibleContent>
      <div className={cn(
        "px-4 pb-4 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap",
        className
      )}>
        {children}
      </div>
    </CollapsibleContent>
  );
};

// Export default for convenience
export default Reasoning;
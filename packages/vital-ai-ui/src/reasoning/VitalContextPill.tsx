'use client';

import { useState } from 'react';
import { cn } from '../lib/utils';
import {
  FileText,
  Image,
  Code,
  Database,
  Link2,
  X,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Maximize2,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';

export type ContextType = 'document' | 'image' | 'code' | 'data' | 'link' | 'text';

export interface ContextItem {
  id: string;
  type: ContextType;
  name: string;
  content: string;
  size?: string; // e.g., "2.3 KB", "1,234 chars"
  preview?: string; // Short preview text
}

export interface VitalContextPillProps {
  /** Context item to display */
  context: ContextItem;
  /** Whether the pill can be removed */
  removable?: boolean;
  /** Callback when removed */
  onRemove?: (id: string) => void;
  /** Callback when expanded */
  onExpand?: (context: ContextItem) => void;
  /** Maximum preview length */
  maxPreviewLength?: number;
  /** Custom class name */
  className?: string;
}

const contextTypeConfig: Record<ContextType, { icon: typeof FileText; color: string; bg: string }> = {
  document: { icon: FileText, color: 'text-blue-600', bg: 'bg-blue-50' },
  image: { icon: Image, color: 'text-purple-600', bg: 'bg-purple-50' },
  code: { icon: Code, color: 'text-green-600', bg: 'bg-green-50' },
  data: { icon: Database, color: 'text-amber-600', bg: 'bg-amber-50' },
  link: { icon: Link2, color: 'text-cyan-600', bg: 'bg-cyan-50' },
  text: { icon: FileText, color: 'text-slate-600', bg: 'bg-slate-50' },
};

/**
 * VitalContextPill - Collapsible Context Display
 * 
 * Collapses massive user pastes (e.g., "Protocol.pdf content") into a small,
 * non-intrusive chip that can be expanded to view full content.
 * 
 * @example
 * ```tsx
 * <VitalContextPill
 *   context={{
 *     id: '1',
 *     type: 'document',
 *     name: 'Protocol.pdf',
 *     content: longDocumentText,
 *     size: '15.2 KB'
 *   }}
 *   removable
 *   onRemove={(id) => removeContext(id)}
 * />
 * ```
 */
export function VitalContextPill({
  context,
  removable = false,
  onRemove,
  onExpand,
  maxPreviewLength = 200,
  className,
}: VitalContextPillProps) {
  const [copied, setCopied] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);

  const config = contextTypeConfig[context.type];
  const Icon = config.icon;

  const preview = context.preview || context.content.slice(0, maxPreviewLength);
  const hasMore = context.content.length > maxPreviewLength;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(context.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full',
        'border bg-card shadow-sm',
        'text-sm',
        className
      )}
    >
      <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-7 px-2.5 rounded-full gap-1.5',
              'hover:bg-muted/50'
            )}
          >
            <div className={cn('p-0.5 rounded', config.bg)}>
              <Icon className={cn('h-3 w-3', config.color)} />
            </div>
            <span className="font-medium truncate max-w-[150px]">
              {context.name}
            </span>
            {context.size && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">
                {context.size}
              </Badge>
            )}
            {isPopoverOpen ? (
              <ChevronUp className="h-3 w-3 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent
          className="w-80 p-0"
          align="start"
        >
          <div className="p-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={cn('p-1.5 rounded', config.bg)}>
                  <Icon className={cn('h-4 w-4', config.color)} />
                </div>
                <div>
                  <p className="font-medium text-sm">{context.name}</p>
                  {context.size && (
                    <p className="text-xs text-muted-foreground">{context.size}</p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={handleCopy}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Maximize2 className="h-3.5 w-3.5" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-3xl max-h-[80vh]">
                    <DialogHeader>
                      <DialogTitle className="flex items-center gap-2">
                        <Icon className={cn('h-5 w-5', config.color)} />
                        {context.name}
                      </DialogTitle>
                    </DialogHeader>
                    <ScrollArea className="max-h-[60vh]">
                      <pre className="text-sm whitespace-pre-wrap font-mono p-4 bg-muted rounded-lg">
                        {context.content}
                      </pre>
                    </ScrollArea>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </div>
          <ScrollArea className="max-h-[200px]">
            <div className="p-3">
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                {preview}
                {hasMore && (
                  <span className="text-primary"> ...click expand to view all</span>
                )}
              </p>
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {removable && (
        <Button
          variant="ghost"
          size="icon"
          className="h-5 w-5 mr-1 rounded-full hover:bg-destructive/10 hover:text-destructive"
          onClick={() => onRemove?.(context.id)}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  );
}

/**
 * VitalContextPillList - Multiple Context Pills
 */
export interface VitalContextPillListProps {
  contexts: ContextItem[];
  removable?: boolean;
  onRemove?: (id: string) => void;
  maxVisible?: number;
  className?: string;
}

export function VitalContextPillList({
  contexts,
  removable = false,
  onRemove,
  maxVisible = 3,
  className,
}: VitalContextPillListProps) {
  const [showAll, setShowAll] = useState(false);
  
  const visible = showAll ? contexts : contexts.slice(0, maxVisible);
  const hiddenCount = contexts.length - maxVisible;

  return (
    <div className={cn('flex flex-wrap items-center gap-2', className)}>
      {visible.map((ctx) => (
        <VitalContextPill
          key={ctx.id}
          context={ctx}
          removable={removable}
          onRemove={onRemove}
        />
      ))}
      {hiddenCount > 0 && !showAll && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setShowAll(true)}
        >
          +{hiddenCount} more
        </Button>
      )}
      {showAll && hiddenCount > 0 && (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs text-muted-foreground"
          onClick={() => setShowAll(false)}
        >
          Show less
        </Button>
      )}
    </div>
  );
}

export default VitalContextPill;

'use client';

import { useState, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  GitBranch,
  GitCommit,
  GitMerge,
  ChevronRight,
  ChevronDown,
  Plus,
  Trash2,
  MessageSquare,
  Clock,
  Star,
  StarOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface ThreadMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ThreadBranch {
  id: string;
  name: string;
  parentId?: string;
  splitMessageId?: string;
  messages: ThreadMessage[];
  createdAt: Date;
  isActive?: boolean;
  isStarred?: boolean;
  description?: string;
}

export interface VitalThreadBranchProps {
  /** All branches */
  branches: ThreadBranch[];
  /** Currently active branch ID */
  activeBranchId: string;
  /** Callback when branch is selected */
  onSelectBranch: (branchId: string) => void;
  /** Callback to create new branch */
  onCreateBranch?: (fromBranchId: string, fromMessageId: string, name: string) => void;
  /** Callback to delete branch */
  onDeleteBranch?: (branchId: string) => void;
  /** Callback to merge branches */
  onMergeBranch?: (sourceBranchId: string, targetBranchId: string) => void;
  /** Callback to star/unstar branch */
  onToggleStar?: (branchId: string) => void;
  /** Whether branching is enabled */
  branchingEnabled?: boolean;
  /** Custom class name */
  className?: string;
}

/**
 * VitalThreadBranch - Conversation Experimentation
 * 
 * Allows users to "fork" conversation history to test different hypotheses.
 * Git-style tree view in the sidebar showing split points.
 * 
 * @example
 * ```tsx
 * <VitalThreadBranch
 *   branches={conversationBranches}
 *   activeBranchId={currentBranchId}
 *   onSelectBranch={(id) => switchToBranch(id)}
 *   onCreateBranch={(from, msg, name) => forkConversation(from, msg, name)}
 * />
 * ```
 */
export function VitalThreadBranch({
  branches,
  activeBranchId,
  onSelectBranch,
  onCreateBranch,
  onDeleteBranch,
  onMergeBranch,
  onToggleStar,
  branchingEnabled = true,
  className,
}: VitalThreadBranchProps) {
  const [expandedBranches, setExpandedBranches] = useState<Set<string>>(
    new Set([activeBranchId])
  );

  // Build tree structure
  const branchTree = useMemo(() => {
    const rootBranches = branches.filter(b => !b.parentId);
    const childMap = new Map<string, ThreadBranch[]>();

    branches.forEach(branch => {
      if (branch.parentId) {
        const children = childMap.get(branch.parentId) || [];
        children.push(branch);
        childMap.set(branch.parentId, children);
      }
    });

    return { rootBranches, childMap };
  }, [branches]);

  const toggleExpanded = (branchId: string) => {
    const newExpanded = new Set(expandedBranches);
    if (newExpanded.has(branchId)) {
      newExpanded.delete(branchId);
    } else {
      newExpanded.add(branchId);
    }
    setExpandedBranches(newExpanded);
  };

  const renderBranch = (branch: ThreadBranch, depth: number = 0) => {
    const children = branchTree.childMap.get(branch.id) || [];
    const hasChildren = children.length > 0;
    const isExpanded = expandedBranches.has(branch.id);
    const isActive = branch.id === activeBranchId;

    return (
      <div key={branch.id}>
        <div
          className={cn(
            'flex items-center gap-2 py-2 px-3 rounded-lg',
            'hover:bg-muted/50 transition-colors cursor-pointer',
            isActive && 'bg-primary/10 border border-primary/20'
          )}
          style={{ paddingLeft: `${depth * 16 + 12}px` }}
          onClick={() => onSelectBranch(branch.id)}
        >
          {/* Expand/Collapse */}
          {hasChildren ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 p-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleExpanded(branch.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="h-3.5 w-3.5" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5" />
              )}
            </Button>
          ) : (
            <div className="w-5" />
          )}

          {/* Branch Icon */}
          <GitBranch
            className={cn(
              'h-4 w-4 flex-shrink-0',
              isActive ? 'text-primary' : 'text-muted-foreground'
            )}
          />

          {/* Branch Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span
                className={cn(
                  'text-sm font-medium truncate',
                  isActive && 'text-primary'
                )}
              >
                {branch.name}
              </span>
              {branch.isStarred && (
                <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
              )}
              {isActive && (
                <Badge className="text-[10px] h-4">Active</Badge>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
              <span className="flex items-center gap-1">
                <MessageSquare className="h-3 w-3" />
                {branch.messages.length}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {formatRelativeTime(branch.createdAt)}
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            {onToggleStar && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleStar(branch.id);
                      }}
                    >
                      {branch.isStarred ? (
                        <StarOff className="h-3.5 w-3.5" />
                      ) : (
                        <Star className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {branch.isStarred ? 'Unstar' : 'Star'}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {onDeleteBranch && !isActive && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteBranch(branch.id);
                      }}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Delete branch</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="relative">
            {/* Connection line */}
            <div
              className="absolute left-0 top-0 bottom-0 w-px bg-border"
              style={{ marginLeft: `${depth * 16 + 20}px` }}
            />
            {children.map(child => renderBranch(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b">
        <div className="flex items-center gap-2">
          <GitBranch className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">Branches</h3>
          <Badge variant="outline" className="text-xs">
            {branches.length}
          </Badge>
        </div>
        {branchingEnabled && onCreateBranch && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-7 w-7">
                  <Plus className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create branch from current</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>

      {/* Branch Tree */}
      <ScrollArea className="max-h-[400px]">
        <div className="p-2 space-y-1">
          {branchTree.rootBranches.map(branch => renderBranch(branch))}
        </div>
      </ScrollArea>

      {/* Footer Legend */}
      <div className="p-3 border-t bg-muted/30 text-xs text-muted-foreground">
        <p>Fork conversations to explore different approaches</p>
      </div>
    </div>
  );
}

// Helper function
function formatRelativeTime(date: Date): string {
  const diff = Date.now() - date.getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

export default VitalThreadBranch;

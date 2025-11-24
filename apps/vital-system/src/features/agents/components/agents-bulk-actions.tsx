'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Trash2,
  MessageSquarePlus,
  X,
  Loader2,
  Copy,
  Download,
  Tag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import type { ClientAgent } from '../types/agent-schema';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AgentsBulkActionsProps {
  selectedAgents: Set<string>;
  agents: ClientAgent[];
  onClearSelection: () => void;
  onStatusChange?: (agentIds: string[], newStatus: ClientAgent['status']) => Promise<void>;
  onDelete?: (agentIds: string[]) => Promise<void>;
  onAddToChat?: (agentIds: string[]) => Promise<void>;
  onDuplicate?: (agentIds: string[]) => Promise<void>;
  onExport?: (agentIds: string[]) => Promise<void>;
}

type BulkAction = 'activate' | 'testing' | 'deactivate' | 'delete' | 'add-to-chat' | 'duplicate' | 'export';

// ============================================================================
// Main Component
// ============================================================================

export function AgentsBulkActions({
  selectedAgents,
  agents,
  onClearSelection,
  onStatusChange,
  onDelete,
  onAddToChat,
  onDuplicate,
  onExport,
}: AgentsBulkActionsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  // Get selected agent objects
  const selectedAgentObjects = agents.filter((a) => selectedAgents.has(a.id));

  // Check if any selected agents are custom (can be deleted)
  const hasCustomAgents = selectedAgentObjects.some((a) => a.is_custom);
  const customAgentsCount = selectedAgentObjects.filter((a) => a.is_custom).length;

  // Handle bulk action
  const handleBulkAction = async (action: BulkAction) => {
    setIsLoading(true);

    try {
      const selectedIds = Array.from(selectedAgents);

      switch (action) {
        case 'activate':
          if (onStatusChange) {
            await onStatusChange(selectedIds, 'active');
            toast.success(`Activated ${selectedIds.length} agent(s)`);
          }
          break;

        case 'testing':
          if (onStatusChange) {
            await onStatusChange(selectedIds, 'testing');
            toast.success(`Set ${selectedIds.length} agent(s) to testing`);
          }
          break;

        case 'deactivate':
          if (onStatusChange) {
            await onStatusChange(selectedIds, 'inactive');
            toast.success(`Deactivated ${selectedIds.length} agent(s)`);
          }
          break;

        case 'delete':
          setShowDeleteDialog(true);
          setIsLoading(false);
          return;

        case 'add-to-chat':
          if (onAddToChat) {
            await onAddToChat(selectedIds);
            toast.success(`Added ${selectedIds.length} agent(s) to chat`);
          }
          break;

        case 'duplicate':
          if (onDuplicate) {
            await onDuplicate(selectedIds);
            toast.success(`Duplicated ${selectedIds.length} agent(s)`);
          }
          break;

        case 'export':
          if (onExport) {
            await onExport(selectedIds);
            toast.success(`Exported ${selectedIds.length} agent(s)`);
          }
          break;
      }

      onClearSelection();
    } catch (error) {
      console.error('Bulk action failed:', error);
      toast.error(
        `Failed to ${action} agents: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Handle confirmed delete
  const handleConfirmDelete = async () => {
    if (!onDelete) return;

    setIsLoading(true);
    setShowDeleteDialog(false);

    try {
      // Only delete custom agents
      const customAgentIds = selectedAgentObjects
        .filter((a) => a.is_custom)
        .map((a) => a.id);

      if (customAgentIds.length === 0) {
        toast.error('Only custom agents can be deleted');
        return;
      }

      await onDelete(customAgentIds);
      toast.success(`Deleted ${customAgentIds.length} custom agent(s)`);
      onClearSelection();
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(
        `Failed to delete agents: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (selectedAgents.size === 0) return null;

  return (
    <>
      <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-background border rounded-lg shadow-lg p-4 flex items-center gap-4 min-w-[500px]">
          {/* Selection Info */}
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="text-sm">
              {selectedAgents.size} selected
            </Badge>

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearSelection}
              disabled={isLoading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="h-8 w-px bg-border" />

          {/* Quick Actions */}
          <div className="flex items-center gap-2">
            {onStatusChange && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('activate')}
                  disabled={isLoading}
                  className="gap-2"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                  )}
                  Activate
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('testing')}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Testing
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleBulkAction('deactivate')}
                  disabled={isLoading}
                  className="gap-2"
                >
                  <Clock className="h-4 w-4 text-gray-600" />
                  Deactivate
                </Button>
              </>
            )}

            {onAddToChat && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkAction('add-to-chat')}
                disabled={isLoading}
                className="gap-2"
              >
                <MessageSquarePlus className="h-4 w-4" />
                Add to Chat
              </Button>
            )}
          </div>

          <div className="h-8 w-px bg-border" />

          {/* More Actions Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" disabled={isLoading}>
                More Actions
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Bulk Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />

              {onDuplicate && (
                <DropdownMenuItem onClick={() => handleBulkAction('duplicate')}>
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate {selectedAgents.size} agent(s)
                </DropdownMenuItem>
              )}

              {onExport && (
                <DropdownMenuItem onClick={() => handleBulkAction('export')}>
                  <Download className="h-4 w-4 mr-2" />
                  Export {selectedAgents.size} agent(s)
                </DropdownMenuItem>
              )}

              {hasCustomAgents && onDelete && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => handleBulkAction('delete')}
                    className="text-destructive focus:text-destructive"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete {customAgentsCount} custom agent(s)
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {customAgentsCount} custom agent(s). This action cannot
              be undone.
              <br />
              <br />
              <strong>Note:</strong> Only custom agents can be deleted. Default agents will not be
              affected.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

/**
 * AgentListItem - List view item for agents
 *
 * Extracted from agents-board.tsx for reusability
 */
'use client';

import React from 'react';
import {
  Heart,
  Edit,
  Copy,
  MoreVertical,
  Eye,
  Trash2,
  MessageSquare,
} from 'lucide-react';

import { AgentAvatar } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent } from '@vital/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';
import type { Agent } from '@/lib/stores/agents-store';

// Domain color mapping
const DOMAIN_COLORS: Record<string, string> = {
  'Clinical Operations': 'bg-blue-100 text-blue-800',
  'Medical Affairs': 'bg-purple-100 text-purple-800',
  'Regulatory Affairs': 'bg-amber-100 text-amber-800',
  'Research': 'bg-green-100 text-green-800',
  'Quality': 'bg-red-100 text-red-800',
  'Commercial': 'bg-cyan-100 text-cyan-800',
  'Manufacturing': 'bg-orange-100 text-orange-800',
  default: 'bg-gray-100 text-gray-800',
};

function getDomainColor(domains: string[]): string {
  if (!domains || domains.length === 0) return DOMAIN_COLORS.default;
  const domain = domains[0];
  return DOMAIN_COLORS[domain] || DOMAIN_COLORS.default;
}

export interface AgentListItemProps {
  agent: Agent;
  isFocused?: boolean;
  isBookmarked?: boolean;
  functionName?: string | null;
  onSelect?: () => void;
  onAddToChat?: () => void;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onBookmark?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
  style?: React.CSSProperties;
}

export function AgentListItem({
  agent,
  isFocused = false,
  isBookmarked = false,
  functionName,
  onSelect,
  onAddToChat,
  onEdit,
  onDuplicate,
  onBookmark,
  onDelete,
  canEdit = false,
  canDelete = false,
  style,
}: AgentListItemProps) {
  return (
    <Card
      className={cn(
        'hover:shadow-lg transition-all cursor-pointer group hover:bg-neutral-50 absolute left-0 right-0',
        isFocused && 'ring-2 ring-primary ring-offset-2 bg-primary/5'
      )}
      style={style}
      onClick={onSelect}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSelect?.();
        }
      }}
      role="button"
      tabIndex={0}
      aria-label={`Select agent ${agent.display_name}`}
    >
      <CardContent className="p-4 flex items-center gap-4">
        <AgentAvatar
          avatar={agent.avatar}
          name={agent.display_name || agent.name}
          size="list"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
              {agent.display_name}
            </h3>
            {agent.is_custom && (
              <Badge variant="outline" className="text-xs">
                Custom
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground truncate">
            {agent.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {functionName && (
            <Badge
              variant="outline"
              className="text-xs bg-purple-50 text-purple-700 border-purple-200"
            >
              {functionName.toUpperCase()}
            </Badge>
          )}
          {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
            <Badge className={cn('text-xs', getDomainColor(agent.knowledge_domains))}>
              {agent.knowledge_domains[0]}
            </Badge>
          )}
          {isBookmarked && (
            <Heart className="h-4 w-4 fill-current text-red-500" />
          )}
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={(e) => {
                  e.stopPropagation();
                  onSelect?.();
                }}
              >
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </DropdownMenuItem>
              {onAddToChat && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onAddToChat();
                  }}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Add to Chat
                </DropdownMenuItem>
              )}
              {canEdit && onEdit && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit();
                  }}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDuplicate && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate();
                  }}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
              )}
              {onBookmark && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onBookmark();
                  }}
                >
                  <Heart
                    className={cn(
                      'h-4 w-4 mr-2',
                      isBookmarked && 'fill-current text-red-500'
                    )}
                  />
                  {isBookmarked ? 'Remove from Library' : 'Save to Library'}
                </DropdownMenuItem>
              )}
              {canDelete && onDelete && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete();
                  }}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

export default AgentListItem;

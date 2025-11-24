'use client';

import React, { useMemo, useCallback, useRef } from 'react';
import { List, type ListImperativeAPI } from 'react-window';
import AutoSizer from 'react-virtualized-auto-sizer';
import {
  Eye,
  MessageSquare,
  Edit,
  Copy,
  Trash2,
  MoreVertical,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  CheckCircle2,
  AlertCircle,
  Clock,
  Brain,
  Sparkles,
  Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import type { ClientAgent } from '../types/agent-schema';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AgentsTableVirtualizedProps {
  agents: ClientAgent[];
  onAgentSelect?: (agent: ClientAgent) => void;
  onEdit?: (agent: ClientAgent) => void;
  onDuplicate?: (agent: ClientAgent) => void;
  onDelete?: (agent: ClientAgent) => void;
  onAddToChat?: (agent: ClientAgent) => void;
  selectedAgents?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
  sortConfig?: SortConfig | null;
  onSortChange?: (config: SortConfig | null) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortableColumn = 'name' | 'tier' | 'status' | 'model' | 'created_at' | 'updated_at';

interface SortConfig {
  column: SortableColumn;
  direction: SortDirection;
}

interface RowData {
  agents: ClientAgent[];
  selectedAgents: Set<string>;
  onRowClick: (agent: ClientAgent) => void;
  onCheckboxClick: (agentId: string, event: React.MouseEvent) => void;
  onActionClick: (agent: ClientAgent, action: string) => void;
}

// ============================================================================
// Constants
// ============================================================================

const ROW_HEIGHT = 72; // Height of each row in pixels
const HEADER_HEIGHT = 48; // Height of header row

const TIER_ICONS = {
  '1': Brain,
  '2': Sparkles,
  '3': Zap,
} as const;

const TIER_COLORS = {
  '1': 'bg-blue-50 text-blue-700 border-blue-200',
  '2': 'bg-purple-50 text-purple-700 border-purple-200',
  '3': 'bg-amber-50 text-amber-700 border-amber-200',
} as const;

const STATUS_ICONS = {
  active: CheckCircle2,
  testing: AlertCircle,
  inactive: Clock,
} as const;

const STATUS_COLORS = {
  active: 'bg-green-50 text-green-700 border-green-200',
  testing: 'bg-yellow-50 text-yellow-700 border-yellow-200',
  inactive: 'bg-gray-50 text-gray-700 border-gray-200',
} as const;

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

// ============================================================================
// Row Component
// ============================================================================

interface VirtualizedRowProps extends RowData {
  index: number;
  style?: React.CSSProperties;
}

const VirtualizedRow = React.memo(({ index, style, agents, selectedAgents, onRowClick, onCheckboxClick, onActionClick }: VirtualizedRowProps) => {
  const agent = agents[index];
  const isSelected = selectedAgents.has(agent.id);

  const TierIcon = agent.tier ? TIER_ICONS[agent.tier] : Brain;
  const StatusIcon = STATUS_ICONS[agent.status];

  return (
    <div
      style={style}
      className={cn(
        'flex items-center gap-4 px-4 border-b cursor-pointer hover:bg-muted/50 transition-colors',
        isSelected && 'bg-muted/30'
      )}
      onClick={() => onRowClick(agent)}
    >
      {/* Checkbox Column */}
      <div
        className="flex items-center"
        onClick={(e) => {
          e.stopPropagation();
          onCheckboxClick(agent.id, e);
        }}
      >
        <Checkbox checked={isSelected} aria-label={`Select ${agent.display_name}`} />
      </div>

      {/* Agent Info Column (flex: 300px min-width) */}
      <div className="flex items-center gap-3 min-w-[300px] flex-1">
        <Avatar className="h-10 w-10 border flex-shrink-0">
          {agent.avatar?.startsWith('/') ? (
            <AvatarImage src={agent.avatar} alt={agent.display_name} />
          ) : (
            <AvatarFallback>{agent.avatar || getInitials(agent.display_name)}</AvatarFallback>
          )}
        </Avatar>
        <div className="flex flex-col min-w-0">
          <span className="font-medium truncate">{agent.display_name}</span>
          <span className="text-xs text-muted-foreground truncate">{agent.tagline}</span>
        </div>
      </div>

      {/* Tier Column */}
      <div className="w-24 flex-shrink-0">
        {agent.tier ? (
          <Badge variant="outline" className={cn('text-xs', TIER_COLORS[agent.tier])}>
            <TierIcon className="h-3 w-3 mr-1" />
            T{agent.tier}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground">-</span>
        )}
      </div>

      {/* Status Column */}
      <div className="w-28 flex-shrink-0">
        <Badge variant="outline" className={cn('text-xs', STATUS_COLORS[agent.status])}>
          <StatusIcon className="h-3 w-3 mr-1" />
          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
        </Badge>
      </div>

      {/* Model Column */}
      <div className="w-40 flex-shrink-0">
        <Badge variant="secondary" className="font-mono text-xs truncate max-w-full">
          {agent.model}
        </Badge>
      </div>

      {/* Capabilities Column */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap gap-1">
          {agent.capabilities?.slice(0, 2).map((cap, i) => (
            <Badge key={i} variant="outline" className="text-xs truncate max-w-[120px]">
              {cap}
            </Badge>
          ))}
          {agent.capabilities && agent.capabilities.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{agent.capabilities.length - 2}
            </Badge>
          )}
        </div>
      </div>

      {/* Created Column */}
      <div className="w-32 flex-shrink-0 text-sm text-muted-foreground">
        {formatDate(agent.created_at)}
      </div>

      {/* Actions Column */}
      <div
        className="w-12 flex-shrink-0"
        onClick={(e) => {
          e.stopPropagation();
        }}
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreVertical className="h-4 w-4" />
              <span className="sr-only">Open menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onActionClick(agent, 'view')}>
              <Eye className="h-4 w-4 mr-2" />
              View Details
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onActionClick(agent, 'add-to-chat')}>
              <MessageSquare className="h-4 w-4 mr-2" />
              Add to Chat
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onActionClick(agent, 'edit')}>
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </DropdownMenuItem>

            <DropdownMenuItem onClick={() => onActionClick(agent, 'duplicate')}>
              <Copy className="h-4 w-4 mr-2" />
              Duplicate
            </DropdownMenuItem>

            {agent.is_custom && (
              <>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onActionClick(agent, 'delete')}
                  className="text-destructive focus:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
});

VirtualizedRow.displayName = 'VirtualizedRow';

// ============================================================================
// Header Component
// ============================================================================

interface SortableHeaderProps {
  column: SortableColumn;
  currentSort: SortConfig | null;
  onSort: (column: SortableColumn) => void;
  children: React.ReactNode;
  className?: string;
}

function SortableHeader({
  column,
  currentSort,
  onSort,
  children,
  className,
}: SortableHeaderProps) {
  const isActive = currentSort?.column === column;
  const direction = isActive ? currentSort.direction : null;

  const Icon = direction === 'asc' ? ArrowUp : direction === 'desc' ? ArrowDown : ArrowUpDown;

  return (
    <div
      className={cn(
        'flex items-center gap-2 cursor-pointer select-none hover:text-primary transition-colors',
        className
      )}
      onClick={() => onSort(column)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onSort(column);
        }
      }}
    >
      {children}
      <Icon
        className={cn(
          'h-4 w-4 transition-colors',
          isActive ? 'text-primary' : 'text-muted-foreground'
        )}
      />
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentsTableVirtualized({
  agents,
  onAgentSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onAddToChat,
  selectedAgents = new Set(),
  onSelectionChange,
  sortConfig = null,
  onSortChange,
}: AgentsTableVirtualizedProps) {
  const listRef = useRef<ListImperativeAPI | null>(null);

  // Handle column sort
  const handleSort = useCallback(
    (column: SortableColumn) => {
      if (!onSortChange) return;

      const newConfig: SortConfig | null = (() => {
        if (sortConfig?.column === column) {
          // Cycle through: asc -> desc -> null
          if (sortConfig.direction === 'asc') {
            return { column, direction: 'desc' };
          } else if (sortConfig.direction === 'desc') {
            return null;
          }
        }
        return { column, direction: 'asc' };
      })();

      onSortChange(newConfig);
    },
    [sortConfig, onSortChange]
  );

  // Handle select all
  const allSelected = agents.length > 0 && selectedAgents.size === agents.length;
  const someSelected = selectedAgents.size > 0 && selectedAgents.size < agents.length;

  const handleSelectAll = useCallback(() => {
    if (!onSelectionChange) return;

    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(agents.map((a) => a.id)));
    }
  }, [allSelected, agents, onSelectionChange]);

  const handleSelectOne = useCallback(
    (agentId: string, event: React.MouseEvent) => {
      event.stopPropagation();
      if (!onSelectionChange) return;

      const newSelection = new Set(selectedAgents);
      if (newSelection.has(agentId)) {
        newSelection.delete(agentId);
      } else {
        newSelection.add(agentId);
      }
      onSelectionChange(newSelection);
    },
    [selectedAgents, onSelectionChange]
  );

  // Handle row click
  const handleRowClick = useCallback(
    (agent: ClientAgent) => {
      onAgentSelect?.(agent);
    },
    [onAgentSelect]
  );

  // Handle action click
  const handleActionClick = useCallback(
    (agent: ClientAgent, action: string) => {
      switch (action) {
        case 'view':
          onAgentSelect?.(agent);
          break;
        case 'edit':
          onEdit?.(agent);
          break;
        case 'duplicate':
          onDuplicate?.(agent);
          break;
        case 'delete':
          onDelete?.(agent);
          break;
        case 'add-to-chat':
          onAddToChat?.(agent);
          break;
      }
    },
    [onAgentSelect, onEdit, onDuplicate, onDelete, onAddToChat]
  );

  // Prepare row data
  const rowData: RowData = useMemo(
    () => ({
      agents,
      selectedAgents,
      onRowClick: handleRowClick,
      onCheckboxClick: handleSelectOne,
      onActionClick: handleActionClick,
    }),
    [agents, selectedAgents, handleRowClick, handleSelectOne, handleActionClick]
  );

  // Scroll to top when agents change
  React.useEffect(() => {
    listRef.current?.scrollToRow(0);
  }, [agents]);

  return (
    <div className="flex flex-col h-full border rounded-md bg-background">
      {/* Table Header */}
      <div
        className="flex items-center gap-4 px-4 border-b bg-muted/50 font-medium text-sm"
        style={{ height: HEADER_HEIGHT }}
      >
        {/* Checkbox Column */}
        <div className="flex items-center">
          <Checkbox
            checked={allSelected}
            indeterminate={someSelected ? true : undefined}
            onCheckedChange={handleSelectAll}
            aria-label="Select all agents"
          />
        </div>

        {/* Agent Info Column */}
        <div className="min-w-[300px] flex-1">
          <SortableHeader column="name" currentSort={sortConfig} onSort={handleSort}>
            Agent
          </SortableHeader>
        </div>

        {/* Tier Column */}
        <div className="w-24 flex-shrink-0">
          <SortableHeader column="tier" currentSort={sortConfig} onSort={handleSort}>
            Tier
          </SortableHeader>
        </div>

        {/* Status Column */}
        <div className="w-28 flex-shrink-0">
          <SortableHeader column="status" currentSort={sortConfig} onSort={handleSort}>
            Status
          </SortableHeader>
        </div>

        {/* Model Column */}
        <div className="w-40 flex-shrink-0">
          <SortableHeader column="model" currentSort={sortConfig} onSort={handleSort}>
            Model
          </SortableHeader>
        </div>

        {/* Capabilities Column */}
        <div className="flex-1 min-w-0">Capabilities</div>

        {/* Created Column */}
        <div className="w-32 flex-shrink-0">
          <SortableHeader column="created_at" currentSort={sortConfig} onSort={handleSort}>
            Created
          </SortableHeader>
        </div>

        {/* Actions Column */}
        <div className="w-12 flex-shrink-0">Actions</div>
      </div>

      {/* Virtualized Table Body */}
      <div className="flex-1">
        {agents.length === 0 ? (
          <div className="flex items-center justify-center h-64 text-muted-foreground">
            No agents found
          </div>
        ) : (
          <AutoSizer>
            {({ height, width }) => (
              <div style={{ height, width }}>
                <List
                  listRef={listRef}
                  defaultHeight={height}
                  rowCount={agents.length}
                  rowHeight={ROW_HEIGHT}
                  rowProps={rowData}
                  overscanCount={5}
                  rowComponent={VirtualizedRow}
                  style={{ width: '100%' }}
                />
              </div>
            )}
          </AutoSizer>
        )}
      </div>

      {/* Footer with stats */}
      <div className="flex items-center justify-between px-4 py-2 border-t bg-muted/30 text-sm text-muted-foreground">
        <span>
          {agents.length.toLocaleString()} agent{agents.length !== 1 ? 's' : ''}
          {selectedAgents.size > 0 && ` (${selectedAgents.size} selected)`}
        </span>
        <span className="text-xs">Optimized for 10,000+ agents</span>
      </div>
    </div>
  );
}

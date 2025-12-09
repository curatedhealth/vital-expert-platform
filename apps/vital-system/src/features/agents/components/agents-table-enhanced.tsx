'use client';

import React, { useState, useMemo } from 'react';
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
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

interface AgentsTableEnhancedProps {
  agents: ClientAgent[];
  onAgentSelect?: (agent: ClientAgent) => void;
  onEdit?: (agent: ClientAgent) => void;
  onDuplicate?: (agent: ClientAgent) => void;
  onDelete?: (agent: ClientAgent) => void;
  onAddToChat?: (agent: ClientAgent) => void;
  selectedAgents?: Set<string>;
  onSelectionChange?: (selectedIds: Set<string>) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortableColumn = 'name' | 'tier' | 'status' | 'model' | 'created_at' | 'updated_at';

interface SortConfig {
  column: SortableColumn;
  direction: SortDirection;
}

// ============================================================================
// Constants
// ============================================================================

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
  inactive: 'bg-neutral-50 text-neutral-700 border-neutral-200',
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
// Sub-Components
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
    <TableHead className={cn('cursor-pointer select-none hover:bg-muted/50', className)}>
      <div
        className="flex items-center gap-2"
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
    </TableHead>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentsTableEnhanced({
  agents,
  onAgentSelect,
  onEdit,
  onDuplicate,
  onDelete,
  onAddToChat,
  selectedAgents = new Set(),
  onSelectionChange,
}: AgentsTableEnhancedProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig | null>(null);

  // Handle column sort
  const handleSort = (column: SortableColumn) => {
    setSortConfig((current) => {
      if (current?.column === column) {
        // Cycle through: asc -> desc -> null
        if (current.direction === 'asc') {
          return { column, direction: 'desc' };
        } else if (current.direction === 'desc') {
          return null;
        }
      }
      return { column, direction: 'asc' };
    });
  };

  // Sort agents
  const sortedAgents = useMemo(() => {
    if (!sortConfig) return agents;

    const sorted = [...agents].sort((a, b) => {
      const { column, direction } = sortConfig;
      if (!direction) return 0;

      let aValue: any = a[column];
      let bValue: any = b[column];

      // Handle special cases
      if (column === 'tier') {
        aValue = a.tier ? parseInt(a.tier) : 0;
        bValue = b.tier ? parseInt(b.tier) : 0;
      } else if (column === 'created_at' || column === 'updated_at') {
        aValue = new Date(aValue).getTime();
        bValue = new Date(bValue).getTime();
      } else if (typeof aValue === 'string') {
        aValue = aValue.toLowerCase();
        bValue = bValue.toLowerCase();
      }

      if (aValue < bValue) return direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return direction === 'asc' ? 1 : -1;
      return 0;
    });

    return sorted;
  }, [agents, sortConfig]);

  // Handle select all
  const allSelected = agents.length > 0 && selectedAgents.size === agents.length;
  const someSelected = selectedAgents.size > 0 && selectedAgents.size < agents.length;

  const handleSelectAll = () => {
    if (!onSelectionChange) return;

    if (allSelected) {
      onSelectionChange(new Set());
    } else {
      onSelectionChange(new Set(agents.map((a) => a.id)));
    }
  };

  const handleSelectOne = (agentId: string) => {
    if (!onSelectionChange) return;

    const newSelection = new Set(selectedAgents);
    if (newSelection.has(agentId)) {
      newSelection.delete(agentId);
    } else {
      newSelection.add(agentId);
    }
    onSelectionChange(newSelection);
  };

  return (
    <Card>
      <CardContent className="p-0">
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                {onSelectionChange && (
                  <TableHead className="w-12">
                    <Checkbox
                      checked={allSelected}
                      indeterminate={someSelected}
                      onCheckedChange={handleSelectAll}
                      aria-label="Select all agents"
                    />
                  </TableHead>
                )}

                <SortableHeader
                  column="name"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="min-w-[300px]"
                >
                  Agent
                </SortableHeader>

                <SortableHeader column="tier" currentSort={sortConfig} onSort={handleSort}>
                  Tier
                </SortableHeader>

                <SortableHeader column="status" currentSort={sortConfig} onSort={handleSort}>
                  Status
                </SortableHeader>

                <SortableHeader
                  column="model"
                  currentSort={sortConfig}
                  onSort={handleSort}
                  className="min-w-[150px]"
                >
                  Model
                </SortableHeader>

                <TableHead>Capabilities</TableHead>

                <SortableHeader column="created_at" currentSort={sortConfig} onSort={handleSort}>
                  Created
                </SortableHeader>

                <TableHead className="w-20">Actions</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {sortedAgents.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={onSelectionChange ? 8 : 7}
                    className="h-24 text-center text-muted-foreground"
                  >
                    No agents found
                  </TableCell>
                </TableRow>
              ) : (
                sortedAgents.map((agent) => {
                  const TierIcon = agent.tier ? TIER_ICONS[agent.tier] : Brain;
                  const StatusIcon = STATUS_ICONS[agent.status];
                  const isSelected = selectedAgents.has(agent.id);

                  return (
                    <TableRow
                      key={agent.id}
                      className={cn(
                        'cursor-pointer hover:bg-muted/50',
                        isSelected && 'bg-muted/30'
                      )}
                      onClick={() => onAgentSelect?.(agent)}
                    >
                      {onSelectionChange && (
                        <TableCell
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectOne(agent.id);
                          }}
                        >
                          <Checkbox
                            checked={isSelected}
                            aria-label={`Select ${agent.display_name}`}
                          />
                        </TableCell>
                      )}

                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border">
                            {agent.avatar?.startsWith('/') ? (
                              <AvatarImage src={agent.avatar} alt={agent.display_name} />
                            ) : (
                              <AvatarFallback>
                                {agent.avatar || getInitials(agent.display_name)}
                              </AvatarFallback>
                            )}
                          </Avatar>
                          <div className="flex flex-col">
                            <span className="font-medium">{agent.display_name}</span>
                            <span className="text-xs text-muted-foreground line-clamp-1">
                              {agent.tagline}
                            </span>
                          </div>
                        </div>
                      </TableCell>

                      <TableCell>
                        {agent.tier ? (
                          <Badge variant="outline" className={TIER_COLORS[agent.tier]}>
                            <TierIcon className="h-3 w-3 mr-1" />
                            T{agent.tier}
                          </Badge>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>

                      <TableCell>
                        <Badge variant="outline" className={STATUS_COLORS[agent.status]}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {agent.status.charAt(0).toUpperCase() + agent.status.slice(1)}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <Badge variant="secondary" className="font-mono text-xs">
                          {agent.model}
                        </Badge>
                      </TableCell>

                      <TableCell>
                        <div className="flex flex-wrap gap-1 max-w-[200px]">
                          {agent.capabilities?.slice(0, 2).map((cap, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {cap.length > 20 ? cap.substring(0, 20) + '...' : cap}
                            </Badge>
                          ))}
                          {agent.capabilities && agent.capabilities.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{agent.capabilities.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>

                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(agent.created_at)}
                      </TableCell>

                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Open menu</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => onAgentSelect?.(agent)}>
                              <Eye className="h-4 w-4 mr-2" />
                              View Details
                            </DropdownMenuItem>

                            {onAddToChat && (
                              <DropdownMenuItem onClick={() => onAddToChat(agent)}>
                                <MessageSquare className="h-4 w-4 mr-2" />
                                Add to Chat
                              </DropdownMenuItem>
                            )}

                            {onEdit && (
                              <DropdownMenuItem onClick={() => onEdit(agent)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                            )}

                            {onDuplicate && (
                              <DropdownMenuItem onClick={() => onDuplicate(agent)}>
                                <Copy className="h-4 w-4 mr-2" />
                                Duplicate
                              </DropdownMenuItem>
                            )}

                            {onDelete && agent.is_custom && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => onDelete(agent)}
                                  className="text-destructive focus:text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}

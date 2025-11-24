'use client';

import React, { useState, useMemo } from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MouseSensor,
  TouchSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle2,
  AlertCircle,
  Clock,
  Brain,
  Sparkles,
  Zap,
  GripVertical,
} from 'lucide-react';
import type { ClientAgent } from '../types/agent-schema';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

interface AgentsKanbanProps {
  agents: ClientAgent[];
  onAgentSelect?: (agent: ClientAgent) => void;
  onStatusChange?: (agentId: string, newStatus: ClientAgent['status']) => Promise<void>;
  groupBy?: 'status' | 'tier';
}

type KanbanColumn = {
  id: string;
  title: string;
  agents: ClientAgent[];
  color: string;
  icon: React.ElementType;
};

// ============================================================================
// Constants
// ============================================================================

const STATUS_COLUMNS = {
  active: {
    title: 'Active',
    color: 'border-green-200 bg-green-50/50',
    icon: CheckCircle2,
  },
  testing: {
    title: 'Testing',
    color: 'border-yellow-200 bg-yellow-50/50',
    icon: AlertCircle,
  },
  inactive: {
    title: 'Inactive',
    color: 'border-gray-200 bg-gray-50/50',
    icon: Clock,
  },
} as const;

const TIER_COLUMNS = {
  '1': {
    title: 'Tier 1: Foundational',
    color: 'border-blue-200 bg-blue-50/50',
    icon: Brain,
  },
  '2': {
    title: 'Tier 2: Specialist',
    color: 'border-purple-200 bg-purple-50/50',
    icon: Sparkles,
  },
  '3': {
    title: 'Tier 3: Ultra-Specialist',
    color: 'border-amber-200 bg-amber-50/50',
    icon: Zap,
  },
} as const;

const TIER_COLORS = {
  '1': 'bg-blue-50 text-blue-700 border-blue-200',
  '2': 'bg-purple-50 text-purple-700 border-purple-200',
  '3': 'bg-amber-50 text-amber-700 border-amber-200',
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

// ============================================================================
// Sub-Components
// ============================================================================

interface SortableAgentCardProps {
  agent: ClientAgent;
  onSelect?: (agent: ClientAgent) => void;
  isDragging?: boolean;
}

function SortableAgentCard({ agent, onSelect, isDragging }: SortableAgentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging: isSortableDragging,
  } = useSortable({ id: agent.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isSortableDragging ? 0.5 : 1,
  };

  const TierIcon = agent.tier ? (agent.tier === '1' ? Brain : agent.tier === '2' ? Sparkles : Zap) : Brain;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      className={cn(
        'group relative',
        isDragging && 'opacity-50'
      )}
    >
      <Card
        className="cursor-pointer hover:shadow-md transition-shadow"
        onClick={() => onSelect?.(agent)}
      >
        <CardContent className="p-4 space-y-3">
          {/* Drag Handle */}
          <div
            className="absolute top-2 right-2 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
            {...listeners}
          >
            <GripVertical className="h-4 w-4 text-muted-foreground" />
          </div>

          {/* Agent Header */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10 border flex-shrink-0">
              {agent.avatar?.startsWith('/') ? (
                <AvatarImage src={agent.avatar} alt={agent.display_name} />
              ) : (
                <AvatarFallback className="text-sm">
                  {agent.avatar || getInitials(agent.display_name)}
                </AvatarFallback>
              )}
            </Avatar>

            <div className="flex-1 min-w-0">
              <h4 className="font-medium text-sm truncate">{agent.display_name}</h4>
              <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                {agent.tagline}
              </p>
            </div>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {agent.tier && (
              <Badge variant="outline" className={cn('text-xs', TIER_COLORS[agent.tier])}>
                <TierIcon className="h-3 w-3 mr-1" />
                T{agent.tier}
              </Badge>
            )}

            <Badge variant="secondary" className="text-xs font-mono">
              {agent.model.split('/').pop()?.substring(0, 10)}
            </Badge>
          </div>

          {/* Capabilities Preview */}
          {agent.capabilities && agent.capabilities.length > 0 && (
            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {agent.capabilities[0]}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

interface KanbanColumnComponentProps {
  column: KanbanColumn;
  agents: ClientAgent[];
  onAgentSelect?: (agent: ClientAgent) => void;
}

function KanbanColumnComponent({
  column,
  agents,
  onAgentSelect,
}: KanbanColumnComponentProps) {
  const Icon = column.icon;

  return (
    <Card className={cn('flex flex-col h-full', column.color)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-medium flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-4 w-4" />
            {column.title}
          </div>
          <Badge variant="secondary" className="ml-2">
            {agents.length}
          </Badge>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 min-h-0 p-3 pt-0">
        <ScrollArea className="h-full">
          <SortableContext
            items={agents.map((a) => a.id)}
            strategy={verticalListSortingStrategy}
          >
            <div className="space-y-3">
              {agents.length === 0 ? (
                <div className="text-center py-8 text-sm text-muted-foreground">
                  No agents
                </div>
              ) : (
                agents.map((agent) => (
                  <SortableAgentCard
                    key={agent.id}
                    agent={agent}
                    onSelect={onAgentSelect}
                  />
                ))
              )}
            </div>
          </SortableContext>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentsKanban({
  agents,
  onAgentSelect,
  onStatusChange,
  groupBy = 'status',
}: AgentsKanbanProps) {
  const [activeAgent, setActiveAgent] = useState<ClientAgent | null>(null);

  // Configure sensors for drag and drop
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8, // 8px movement required before drag starts
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200, // 200ms hold required before drag starts on touch
        tolerance: 8,
      },
    })
  );

  // Group agents by status or tier
  const columns: KanbanColumn[] = useMemo(() => {
    if (groupBy === 'status') {
      return Object.entries(STATUS_COLUMNS).map(([status, config]) => ({
        id: status,
        title: config.title,
        color: config.color,
        icon: config.icon,
        agents: agents.filter((a) => a.status === status),
      }));
    } else {
      return Object.entries(TIER_COLUMNS).map(([tier, config]) => ({
        id: tier,
        title: config.title,
        color: config.color,
        icon: config.icon,
        agents: agents.filter((a) => a.tier === tier),
      }));
    }
  }, [agents, groupBy]);

  // Handle drag start
  const handleDragStart = (event: DragStartEvent) => {
    const agent = agents.find((a) => a.id === event.active.id);
    setActiveAgent(agent || null);
  };

  // Handle drag end
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || !onStatusChange) {
      setActiveAgent(null);
      return;
    }

    const agentId = active.id as string;
    const newStatus = over.id as ClientAgent['status'];

    // Only update if status changed
    const agent = agents.find((a) => a.id === agentId);
    if (agent && agent.status !== newStatus && groupBy === 'status') {
      try {
        await onStatusChange(agentId, newStatus);
      } catch (error) {
        console.error('Failed to update agent status:', error);
        // Could show toast notification here
      }
    }

    setActiveAgent(null);
  };

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 h-[calc(100vh-300px)]">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            agents={column.agents}
            onAgentSelect={onAgentSelect}
          />
        ))}
      </div>

      {/* Drag Overlay */}
      <DragOverlay>
        {activeAgent && (
          <div className="opacity-90 rotate-3 cursor-grabbing">
            <SortableAgentCard agent={activeAgent} isDragging />
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}

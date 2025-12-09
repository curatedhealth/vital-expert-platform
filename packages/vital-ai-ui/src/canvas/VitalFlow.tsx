'use client';

import { useState, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Plus,
  Trash2,
  Play,
  Pause,
  Settings,
  ChevronRight,
  GripVertical,
  CheckCircle,
  Circle,
  Loader2,
  XCircle,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';

export type FlowNodeStatus = 'pending' | 'active' | 'completed' | 'failed' | 'skipped';
export type FlowNodeType = 'start' | 'end' | 'task' | 'decision' | 'parallel' | 'agent' | 'tool';

export interface FlowNode {
  id: string;
  type: FlowNodeType;
  label: string;
  description?: string;
  status?: FlowNodeStatus;
  agent?: {
    id: string;
    name: string;
    level: string;
  };
  config?: Record<string, unknown>;
  position?: { x: number; y: number };
}

export interface FlowConnection {
  id: string;
  source: string;
  target: string;
  label?: string;
  condition?: string;
}

export interface VitalFlowProps {
  /** Flow nodes */
  nodes: FlowNode[];
  /** Flow connections */
  connections: FlowConnection[];
  /** Whether flow is editable */
  editable?: boolean;
  /** Whether flow is executing */
  isExecuting?: boolean;
  /** Read-only view (no editing controls) */
  readOnly?: boolean;
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Callback when node added */
  onAddNode?: (afterNodeId: string, type: FlowNodeType) => void;
  /** Callback when node removed */
  onRemoveNode?: (nodeId: string) => void;
  /** Callback when node clicked */
  onNodeClick?: (node: FlowNode) => void;
  /** Callback when connection clicked */
  onConnectionClick?: (connection: FlowConnection) => void;
  /** Callback to reorder nodes */
  onReorder?: (nodeId: string, newIndex: number) => void;
  /** Custom class name */
  className?: string;
}

const nodeTypeConfig: Record<FlowNodeType, { icon: typeof Circle; color: string; bg: string }> = {
  start: { icon: Play, color: 'text-green-600', bg: 'bg-green-100' },
  end: { icon: CheckCircle, color: 'text-blue-600', bg: 'bg-blue-100' },
  task: { icon: Circle, color: 'text-slate-600', bg: 'bg-slate-100' },
  decision: { icon: AlertTriangle, color: 'text-amber-600', bg: 'bg-amber-100' },
  parallel: { icon: GripVertical, color: 'text-purple-600', bg: 'bg-purple-100' },
  agent: { icon: Circle, color: 'text-cyan-600', bg: 'bg-cyan-100' },
  tool: { icon: Settings, color: 'text-slate-600', bg: 'bg-slate-100' },
};

const statusConfig: Record<FlowNodeStatus, { color: string; icon: typeof Circle }> = {
  pending: { color: 'border-muted-foreground', icon: Circle },
  active: { color: 'border-blue-500 ring-2 ring-blue-200', icon: Loader2 },
  completed: { color: 'border-green-500', icon: CheckCircle },
  failed: { color: 'border-red-500', icon: XCircle },
  skipped: { color: 'border-amber-500', icon: AlertTriangle },
};

/**
 * VitalFlow - Workflow Editor
 * 
 * Drag-and-drop interface for Mode 3 "Manual Plan" adjustment.
 * Visualizes workflow steps with status indicators.
 * 
 * @example
 * ```tsx
 * <VitalFlow
 *   nodes={workflowNodes}
 *   connections={workflowConnections}
 *   editable={!isExecuting}
 *   isExecuting={isRunning}
 *   onNodeClick={(node) => editNodeConfig(node)}
 * />
 * ```
 */
export function VitalFlow({
  nodes,
  connections,
  editable = false,
  isExecuting = false,
  readOnly = false,
  orientation = 'vertical',
  onAddNode,
  onRemoveNode,
  onNodeClick,
  onConnectionClick,
  onReorder,
  className,
}: VitalFlowProps) {
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [draggedNode, setDraggedNode] = useState<string | null>(null);

  // Build ordered list based on connections
  const orderedNodes = useMemo(() => {
    const nodeMap = new Map(nodes.map(n => [n.id, n]));
    const ordered: FlowNode[] = [];
    const visited = new Set<string>();

    // Find start node
    const startNode = nodes.find(n => n.type === 'start');
    if (!startNode) return nodes;

    // Traverse connections
    const traverse = (nodeId: string) => {
      if (visited.has(nodeId)) return;
      visited.add(nodeId);

      const node = nodeMap.get(nodeId);
      if (node) ordered.push(node);

      // Find next nodes
      const nextConnections = connections.filter(c => c.source === nodeId);
      nextConnections.forEach(c => traverse(c.target));
    };

    traverse(startNode.id);

    // Add any unconnected nodes
    nodes.forEach(n => {
      if (!visited.has(n.id)) ordered.push(n);
    });

    return ordered;
  }, [nodes, connections]);

  const handleNodeClick = useCallback((node: FlowNode) => {
    setSelectedNode(node.id);
    onNodeClick?.(node);
  }, [onNodeClick]);

  const handleDragStart = useCallback((nodeId: string) => {
    if (!editable) return;
    setDraggedNode(nodeId);
  }, [editable]);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!draggedNode || !onReorder) return;
    
    // Would trigger reorder here
  }, [draggedNode, onReorder]);

  const renderNode = (node: FlowNode, index: number, isLast: boolean) => {
    const typeConfig = nodeTypeConfig[node.type];
    const TypeIcon = typeConfig.icon;
    const status = node.status || 'pending';
    const statusCfg = statusConfig[status];
    const StatusIcon = statusCfg.icon;

    const isSelected = selectedNode === node.id;
    const showControls = editable && !readOnly && !isExecuting;

    return (
      <div
        key={node.id}
        className={cn(
          'relative flex items-center gap-3',
          orientation === 'horizontal' ? 'flex-row' : 'flex-col'
        )}
      >
        {/* Node Card */}
        <Card
          className={cn(
            'relative cursor-pointer transition-all',
            'min-w-[200px] max-w-[280px]',
            statusCfg.color,
            isSelected && 'ring-2 ring-primary',
            draggedNode === node.id && 'opacity-50'
          )}
          onClick={() => handleNodeClick(node)}
          draggable={showControls}
          onDragStart={() => handleDragStart(node.id)}
          onDragEnd={handleDragEnd}
        >
          {/* Drag Handle */}
          {showControls && (
            <div className="absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center cursor-grab hover:bg-muted/50 rounded-l-lg">
              <GripVertical className="h-4 w-4 text-muted-foreground" />
            </div>
          )}

          <CardHeader className={cn('p-3', showControls && 'pl-7')}>
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2">
                {/* Status Icon */}
                <div className={cn('p-1.5 rounded-md', typeConfig.bg)}>
                  {status === 'active' ? (
                    <Loader2 className={cn('h-4 w-4 animate-spin', typeConfig.color)} />
                  ) : status === 'completed' ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : status === 'failed' ? (
                    <XCircle className="h-4 w-4 text-red-600" />
                  ) : (
                    <TypeIcon className={cn('h-4 w-4', typeConfig.color)} />
                  )}
                </div>
                <div>
                  <CardTitle className="text-sm">{node.label}</CardTitle>
                  {node.agent && (
                    <Badge variant="outline" className="text-[10px] mt-1">
                      {node.agent.level} • {node.agent.name}
                    </Badge>
                  )}
                </div>
              </div>

              {/* Remove Button */}
              {showControls && node.type !== 'start' && node.type !== 'end' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100"
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveNode?.(node.id);
                  }}
                >
                  <Trash2 className="h-3 w-3 text-muted-foreground" />
                </Button>
              )}
            </div>
          </CardHeader>

          {node.description && (
            <CardContent className="p-3 pt-0">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {node.description}
              </p>
            </CardContent>
          )}
        </Card>

        {/* Connection Arrow + Add Button */}
        {!isLast && (
          <div
            className={cn(
              'flex items-center justify-center',
              orientation === 'horizontal' ? 'h-full w-8' : 'w-full h-8'
            )}
          >
            {orientation === 'vertical' ? (
              <div className="relative flex flex-col items-center">
                <div className="h-4 w-0.5 bg-border" />
                <ChevronRight className="h-4 w-4 text-muted-foreground rotate-90 -my-1" />
                <div className="h-4 w-0.5 bg-border" />

                {/* Add Node Button */}
                {showControls && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute h-6 w-6 rounded-full -right-8"
                    onClick={() => onAddNode?.(node.id, 'task')}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            ) : (
              <div className="relative flex items-center">
                <div className="w-4 h-0.5 bg-border" />
                <ChevronRight className="h-4 w-4 text-muted-foreground -mx-1" />
                <div className="w-4 h-0.5 bg-border" />

                {showControls && (
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute h-6 w-6 rounded-full -bottom-8"
                    onClick={() => onAddNode?.(node.id, 'task')}
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={cn('rounded-lg border bg-card', className)}>
      {/* Header */}
      {!readOnly && (
        <div className="flex items-center justify-between p-3 border-b">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-sm">Workflow</h3>
            <Badge variant="outline" className="text-xs">
              {nodes.length} steps
            </Badge>
          </div>
          {isExecuting && (
            <Badge className="text-xs animate-pulse">
              <Loader2 className="h-3 w-3 mr-1 animate-spin" />
              Executing
            </Badge>
          )}
        </div>
      )}

      {/* Flow Canvas */}
      <ScrollArea className="p-4">
        <div
          className={cn(
            'flex gap-2',
            orientation === 'horizontal' ? 'flex-row items-start' : 'flex-col items-center'
          )}
        >
          {orderedNodes.map((node, index) =>
            renderNode(node, index, index === orderedNodes.length - 1)
          )}
        </div>
      </ScrollArea>

      {/* Legend */}
      <div className="p-3 border-t bg-muted/30">
        <div className="flex flex-wrap gap-3 text-xs">
          {Object.entries(nodeTypeConfig).map(([type, config]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className={cn('p-1 rounded', config.bg)}>
                <config.icon className={cn('h-3 w-3', config.color)} />
              </div>
              <span className="capitalize">{type}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default VitalFlow;

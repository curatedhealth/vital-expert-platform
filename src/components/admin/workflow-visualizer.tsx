'use client';

import React, { useRef, useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Play, 
  Pause, 
  Square, 
  Settings, 
  GitBranch, 
  Zap, 
  AlertCircle,
  CheckCircle,
  Clock,
  Activity
} from 'lucide-react';

interface WorkflowNode {
  id: string;
  name: string;
  type: 'start' | 'end' | 'process' | 'decision' | 'interrupt' | 'parallel';
  position: { x: number; y: number };
  config: Record<string, any>;
  status: 'active' | 'inactive' | 'error' | 'running';
  lastExecuted?: Date;
  executionCount: number;
  averageLatency: number;
}

interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
  condition?: string;
  label?: string;
  status: 'active' | 'inactive' | 'error';
}

interface WorkflowVisualizerProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  selectedNode?: WorkflowNode | null;
  onNodeSelect?: (node: WorkflowNode) => void;
  onNodeUpdate?: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  isEditing?: boolean;
  className?: string;
}

export function WorkflowVisualizer({
  nodes,
  edges,
  selectedNode,
  onNodeSelect,
  onNodeUpdate,
  isEditing = false,
  className = ''
}: WorkflowVisualizerProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragNode, setDragNode] = useState<WorkflowNode | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const getNodeIcon = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return <Play className="w-4 h-4" />;
      case 'end': return <Square className="w-4 h-4" />;
      case 'process': return <Settings className="w-4 h-4" />;
      case 'decision': return <GitBranch className="w-4 h-4" />;
      case 'interrupt': return <Pause className="w-4 h-4" />;
      case 'parallel': return <Zap className="w-4 h-4" />;
      default: return <Settings className="w-4 h-4" />;
    }
  };

  const getNodeStatusColor = (status: WorkflowNode['status']) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'inactive': return 'bg-gray-500';
      case 'error': return 'bg-red-500';
      case 'running': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  const getNodeTypeColor = (type: WorkflowNode['type']) => {
    switch (type) {
      case 'start': return 'border-green-400 bg-green-50';
      case 'end': return 'border-red-400 bg-red-50';
      case 'process': return 'border-blue-400 bg-blue-50';
      case 'decision': return 'border-yellow-400 bg-yellow-50';
      case 'interrupt': return 'border-orange-400 bg-orange-50';
      case 'parallel': return 'border-purple-400 bg-purple-50';
      default: return 'border-gray-400 bg-gray-50';
    }
  };

  const handleMouseDown = (e: React.MouseEvent, node: WorkflowNode) => {
    if (!isEditing) return;
    
    e.preventDefault();
    setIsDragging(true);
    setDragNode(node);
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      setDragOffset({
        x: e.clientX - rect.left - node.position.x,
        y: e.clientY - rect.top - node.position.y
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !dragNode || !isEditing) return;
    
    const rect = canvasRef.current?.getBoundingClientRect();
    if (rect) {
      const newX = e.clientX - rect.left - dragOffset.x;
      const newY = e.clientY - rect.top - dragOffset.y;
      
      onNodeUpdate?.(dragNode.id, {
        position: { x: newX, y: newY }
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setDragNode(null);
  };

  useEffect(() => {
    const handleGlobalMouseUp = () => handleMouseUp();
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (isDragging && dragNode && isEditing) {
        const rect = canvasRef.current?.getBoundingClientRect();
        if (rect) {
          const newX = e.clientX - rect.left - dragOffset.x;
          const newY = e.clientY - rect.top - dragOffset.y;
          
          onNodeUpdate?.(dragNode.id, {
            position: { x: newX, y: newY }
          });
        }
      }
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleGlobalMouseMove);
      document.addEventListener('mouseup', handleGlobalMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleGlobalMouseMove);
      document.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [isDragging, dragNode, dragOffset, onNodeUpdate, isEditing]);

  return (
    <div className={`relative ${className}`}>
      <Card>
        <CardContent className="p-0">
          <div
            ref={canvasRef}
            className="relative h-96 w-full border-2 border-dashed border-gray-300 rounded-lg overflow-hidden"
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            {/* SVG for edges */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none">
              {edges.map((edge) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;

                const startX = sourceNode.position.x + 60; // Center of node
                const startY = sourceNode.position.y + 30;
                const endX = targetNode.position.x + 60;
                const endY = targetNode.position.y + 30;

                const midX = (startX + endX) / 2;
                const midY = (startY + endY) / 2;

                return (
                  <g key={edge.id}>
                    {/* Edge line */}
                    <path
                      d={`M ${startX} ${startY} Q ${midX} ${midY - 20} ${endX} ${endY}`}
                      stroke={edge.status === 'active' ? '#10b981' : '#6b7280'}
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={edge.status === 'inactive' ? '5,5' : '0'}
                    />
                    {/* Arrow head */}
                    <polygon
                      points={`${endX - 5},${endY - 5} ${endX + 5},${endY} ${endX - 5},${endY + 5}`}
                      fill={edge.status === 'active' ? '#10b981' : '#6b7280'}
                    />
                    {/* Edge label */}
                    {edge.condition && (
                      <text
                        x={midX}
                        y={midY - 25}
                        textAnchor="middle"
                        className="text-xs fill-gray-600"
                      >
                        {edge.condition}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Workflow Nodes */}
            {nodes.map((node) => (
              <div
                key={node.id}
                className={`absolute cursor-pointer p-3 rounded-lg border-2 min-w-[120px] transition-all duration-200 ${
                  selectedNode?.id === node.id 
                    ? 'border-blue-500 bg-blue-100 shadow-lg scale-105' 
                    : getNodeTypeColor(node.type)
                } ${isEditing ? 'cursor-move' : 'cursor-pointer'}`}
                style={{
                  left: node.position.x,
                  top: node.position.y,
                }}
                onClick={() => onNodeSelect?.(node)}
                onMouseDown={(e) => handleMouseDown(e, node)}
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className={`w-3 h-3 rounded-full ${getNodeStatusColor(node.status)}`} />
                  {getNodeIcon(node.type)}
                  <span className="font-medium text-sm">{node.name}</span>
                </div>
                
                <div className="text-xs text-muted-foreground space-y-1">
                  <div className="flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    {node.executionCount} runs
                  </div>
                  {node.averageLatency > 0 && (
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {node.averageLatency}ms avg
                    </div>
                  )}
                  {node.lastExecuted && (
                    <div className="text-xs">
                      Last: {node.lastExecuted.toLocaleTimeString()}
                    </div>
                  )}
                </div>

                {/* Status badge */}
                <Badge 
                  variant={node.status === 'active' ? 'default' : 'secondary'}
                  className="absolute -top-2 -right-2 text-xs"
                >
                  {node.status}
                </Badge>
              </div>
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
                <div className="text-center">
                  <GitBranch className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No workflow nodes found</p>
                  <p className="text-sm">Add nodes to build your workflow</p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

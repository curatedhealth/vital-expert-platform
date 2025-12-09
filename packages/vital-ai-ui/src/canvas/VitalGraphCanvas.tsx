'use client';

import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  ZoomIn,
  ZoomOut,
  Maximize,
  Move,
  MousePointer,
  RefreshCw,
  Download,
  Settings,
  Layers,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

export interface GraphNode {
  id: string;
  label: string;
  type?: 'entity' | 'concept' | 'drug' | 'condition' | 'agent' | 'custom';
  x?: number;
  y?: number;
  data?: Record<string, unknown>;
  color?: string;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlighted?: boolean;
}

export interface GraphEdge {
  id: string;
  source: string;
  target: string;
  label?: string;
  type?: 'directed' | 'undirected' | 'bidirectional';
  weight?: number;
  color?: string;
  style?: 'solid' | 'dashed' | 'dotted';
}

export interface VitalGraphCanvasProps {
  /** Graph nodes */
  nodes: GraphNode[];
  /** Graph edges */
  edges: GraphEdge[];
  /** Canvas width */
  width?: number | string;
  /** Canvas height */
  height?: number | string;
  /** Enable zoom controls */
  zoomable?: boolean;
  /** Enable pan */
  pannable?: boolean;
  /** Enable node selection */
  selectable?: boolean;
  /** Show minimap */
  showMinimap?: boolean;
  /** Current zoom level */
  zoom?: number;
  /** Callback when node clicked */
  onNodeClick?: (node: GraphNode) => void;
  /** Callback when edge clicked */
  onEdgeClick?: (edge: GraphEdge) => void;
  /** Callback when zoom changes */
  onZoomChange?: (zoom: number) => void;
  /** Callback when selection changes */
  onSelectionChange?: (nodes: GraphNode[]) => void;
  /** Custom class name */
  className?: string;
}

const nodeTypeColors: Record<string, string> = {
  entity: '#3B82F6', // blue
  concept: '#8B5CF6', // purple
  drug: '#10B981', // green
  condition: '#EF4444', // red
  agent: '#F59E0B', // amber
  custom: '#6B7280', // gray
};

const nodeSizes = {
  sm: 24,
  md: 36,
  lg: 48,
};

/**
 * VitalGraphCanvas - Node Graph Visualization
 * 
 * For Mode 3/4 Mission Control and GraphRAG visualization.
 * Supports zoom, pan, node selection, and interactive exploration.
 * 
 * Example use case: "Show me how these 5 drugs interact"
 * 
 * @example
 * ```tsx
 * <VitalGraphCanvas
 *   nodes={[
 *     { id: '1', label: 'Drug A', type: 'drug' },
 *     { id: '2', label: 'Drug B', type: 'drug' },
 *   ]}
 *   edges={[
 *     { id: 'e1', source: '1', target: '2', label: 'interacts' }
 *   ]}
 *   onNodeClick={(node) => showDrugDetails(node)}
 * />
 * ```
 */
export function VitalGraphCanvas({
  nodes,
  edges,
  width = '100%',
  height = 400,
  zoomable = true,
  pannable = true,
  selectable = true,
  showMinimap = false,
  zoom: initialZoom = 1,
  onNodeClick,
  onEdgeClick,
  onZoomChange,
  onSelectionChange,
  className,
}: VitalGraphCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [zoom, setZoom] = useState(initialZoom);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [tool, setTool] = useState<'select' | 'pan'>('select');

  // Calculate node positions using force-directed layout simulation
  const positionedNodes = useMemo(() => {
    // Simple circular layout for initial positions
    const angleStep = (2 * Math.PI) / nodes.length;
    const radius = Math.min(300, nodes.length * 30);

    return nodes.map((node, index) => ({
      ...node,
      x: node.x ?? 400 + radius * Math.cos(index * angleStep),
      y: node.y ?? 300 + radius * Math.sin(index * angleStep),
    }));
  }, [nodes]);

  // Draw the graph
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();

    // Set canvas size
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Clear
    ctx.clearRect(0, 0, rect.width, rect.height);

    // Apply transforms
    ctx.save();
    ctx.translate(pan.x + rect.width / 2, pan.y + rect.height / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-rect.width / 2, -rect.height / 2);

    // Draw edges
    edges.forEach((edge) => {
      const sourceNode = positionedNodes.find(n => n.id === edge.source);
      const targetNode = positionedNodes.find(n => n.id === edge.target);

      if (!sourceNode || !targetNode) return;

      ctx.beginPath();
      ctx.moveTo(sourceNode.x!, sourceNode.y!);
      ctx.lineTo(targetNode.x!, targetNode.y!);

      // Edge style
      ctx.strokeStyle = edge.color || '#94A3B8';
      ctx.lineWidth = (edge.weight || 1) * 1.5;

      if (edge.style === 'dashed') {
        ctx.setLineDash([5, 5]);
      } else if (edge.style === 'dotted') {
        ctx.setLineDash([2, 2]);
      } else {
        ctx.setLineDash([]);
      }

      ctx.stroke();

      // Draw arrow for directed edges
      if (edge.type === 'directed' || edge.type === 'bidirectional') {
        const angle = Math.atan2(
          targetNode.y! - sourceNode.y!,
          targetNode.x! - sourceNode.x!
        );
        const targetSize = nodeSizes[targetNode.size || 'md'];

        const arrowX = targetNode.x! - (targetSize / 2 + 5) * Math.cos(angle);
        const arrowY = targetNode.y! - (targetSize / 2 + 5) * Math.sin(angle);

        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY);
        ctx.lineTo(
          arrowX - 10 * Math.cos(angle - Math.PI / 6),
          arrowY - 10 * Math.sin(angle - Math.PI / 6)
        );
        ctx.lineTo(
          arrowX - 10 * Math.cos(angle + Math.PI / 6),
          arrowY - 10 * Math.sin(angle + Math.PI / 6)
        );
        ctx.closePath();
        ctx.fillStyle = edge.color || '#94A3B8';
        ctx.fill();
      }

      // Edge label
      if (edge.label) {
        const midX = (sourceNode.x! + targetNode.x!) / 2;
        const midY = (sourceNode.y! + targetNode.y!) / 2;

        ctx.font = '10px sans-serif';
        ctx.fillStyle = '#64748B';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(edge.label, midX, midY - 8);
      }
    });

    // Draw nodes
    positionedNodes.forEach((node) => {
      const size = nodeSizes[node.size || 'md'];
      const color = node.color || nodeTypeColors[node.type || 'custom'];
      const isSelected = selectedNodes.has(node.id);
      const isHovered = hoveredNode === node.id;

      // Node circle
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, size / 2, 0, Math.PI * 2);

      // Fill
      ctx.fillStyle = node.highlighted
        ? '#FEF3C7'
        : isSelected
        ? '#DBEAFE'
        : '#FFFFFF';
      ctx.fill();

      // Border
      ctx.strokeStyle = isSelected || isHovered ? '#3B82F6' : color;
      ctx.lineWidth = isSelected || isHovered ? 3 : 2;
      ctx.stroke();

      // Inner circle (type indicator)
      ctx.beginPath();
      ctx.arc(node.x!, node.y!, size / 2 - 6, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.globalAlpha = 0.2;
      ctx.fill();
      ctx.globalAlpha = 1;

      // Label
      ctx.font = '12px sans-serif';
      ctx.fillStyle = '#1E293B';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'top';
      ctx.fillText(node.label, node.x!, node.y! + size / 2 + 4);
    });

    ctx.restore();
  }, [positionedNodes, edges, zoom, pan, selectedNodes, hoveredNode]);

  useEffect(() => {
    draw();
  }, [draw]);

  // Mouse handlers
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (tool === 'pan' || e.button === 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  }, [tool, pan]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging && (tool === 'pan' || e.buttons === 4)) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    }

    // Hit test for hover
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x - rect.width / 2) / zoom + rect.width / 2;
    const y = (e.clientY - rect.top - pan.y - rect.height / 2) / zoom + rect.height / 2;

    let found = false;
    for (const node of positionedNodes) {
      const size = nodeSizes[node.size || 'md'];
      const dist = Math.sqrt((x - node.x!) ** 2 + (y - node.y!) ** 2);
      if (dist < size / 2) {
        setHoveredNode(node.id);
        found = true;
        break;
      }
    }
    if (!found) setHoveredNode(null);
  }, [isDragging, tool, dragStart, zoom, pan, positionedNodes]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (isDragging) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left - pan.x - rect.width / 2) / zoom + rect.width / 2;
    const y = (e.clientY - rect.top - pan.y - rect.height / 2) / zoom + rect.height / 2;

    // Check node clicks
    for (const node of positionedNodes) {
      const size = nodeSizes[node.size || 'md'];
      const dist = Math.sqrt((x - node.x!) ** 2 + (y - node.y!) ** 2);
      if (dist < size / 2) {
        if (selectable) {
          const newSelected = new Set(selectedNodes);
          if (e.ctrlKey || e.metaKey) {
            if (newSelected.has(node.id)) {
              newSelected.delete(node.id);
            } else {
              newSelected.add(node.id);
            }
          } else {
            newSelected.clear();
            newSelected.add(node.id);
          }
          setSelectedNodes(newSelected);
          onSelectionChange?.(
            positionedNodes.filter(n => newSelected.has(n.id))
          );
        }
        onNodeClick?.(node);
        return;
      }
    }

    // Clear selection on canvas click
    if (selectable) {
      setSelectedNodes(new Set());
      onSelectionChange?.([]);
    }
  }, [isDragging, zoom, pan, positionedNodes, selectable, selectedNodes, onNodeClick, onSelectionChange]);

  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (!zoomable) return;
    e.preventDefault();

    const delta = e.deltaY > 0 ? 0.9 : 1.1;
    const newZoom = Math.max(0.1, Math.min(3, zoom * delta));
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  }, [zoomable, zoom, onZoomChange]);

  const handleZoomIn = () => {
    const newZoom = Math.min(3, zoom * 1.2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleZoomOut = () => {
    const newZoom = Math.max(0.1, zoom / 1.2);
    setZoom(newZoom);
    onZoomChange?.(newZoom);
  };

  const handleFit = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    onZoomChange?.(1);
  };

  return (
    <div
      ref={containerRef}
      className={cn('relative rounded-lg border bg-card overflow-hidden', className)}
      style={{ width, height }}
    >
      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className={cn(
          'w-full h-full',
          tool === 'pan' ? 'cursor-grab' : 'cursor-default',
          isDragging && 'cursor-grabbing'
        )}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onClick={handleClick}
        onWheel={handleWheel}
      />

      {/* Controls */}
      <div className="absolute top-3 left-3 flex gap-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'select' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTool('select')}
              >
                <MousePointer className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Select</TooltipContent>
          </Tooltip>
        </TooltipProvider>

        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant={tool === 'pan' ? 'default' : 'outline'}
                size="icon"
                className="h-8 w-8"
                onClick={() => setTool('pan')}
              >
                <Move className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Pan</TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>

      {/* Zoom Controls */}
      {zoomable && (
        <div className="absolute top-3 right-3 flex flex-col gap-1">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleFit}
          >
            <Maximize className="h-4 w-4" />
          </Button>
        </div>
      )}

      {/* Status Bar */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2">
        <Badge variant="secondary" className="text-xs">
          {nodes.length} nodes • {edges.length} edges
        </Badge>
        <Badge variant="outline" className="text-xs">
          {Math.round(zoom * 100)}%
        </Badge>
        {selectedNodes.size > 0 && (
          <Badge className="text-xs">
            {selectedNodes.size} selected
          </Badge>
        )}
      </div>
    </div>
  );
}

export default VitalGraphCanvas;

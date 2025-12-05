"use client";

/**
 * Graph Canvas Component
 *
 * Uses @neo4j-nvl/react for native Neo4j graph visualization.
 * Features:
 * - Force-directed layout with WebGL rendering
 * - Interactive node selection and navigation
 * - Custom node styling by type
 * - Zoom and pan controls
 */

import { useEffect, useRef, useCallback, useMemo } from "react";
import { InteractiveNvlWrapper, NVL } from "@neo4j-nvl/react";
import type { Node, Relationship } from "@neo4j-nvl/base";
import { useGraphStore } from "../stores/graph-store";
import { NODE_TYPE_CONFIG } from "../types/graph.types";
import type { GraphNode, GraphEdge } from "../types/graph.types";
import { cn } from "@/lib/utils";

interface GraphCanvasProps {
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

// Convert our GraphNode to NVL Node format
function toNvlNode(node: GraphNode): Node {
  const config = NODE_TYPE_CONFIG[node.type] || { color: "#9CA3AF", size: 20 };

  return {
    id: node.id,
    labels: [node.type],
    properties: {
      ...node.properties,
      name: node.label,
    },
    // NVL styling
    color: node.color || config.color,
    size: node.size || config.size,
    caption: node.label,
  };
}

// Convert our GraphEdge to NVL Relationship format
function toNvlRelationship(edge: GraphEdge): Relationship {
  return {
    id: edge.id,
    from: edge.source,
    to: edge.target,
    type: edge.type,
    properties: edge.properties || {},
    caption: edge.label || edge.type,
  };
}

export function GraphCanvas({
  className,
  onNodeClick,
  onNodeDoubleClick,
}: GraphCanvasProps) {
  const nvlRef = useRef<NVL | null>(null);

  const {
    getVisibleNodes,
    getVisibleEdges,
    selection,
    layout,
    isLoading,
    error,
    selectNode,
    setHoveredNode,
    fetchOntologyGraph,
  } = useGraphStore();

  // Convert nodes and edges to NVL format
  const visibleNodes = getVisibleNodes();
  const visibleEdges = getVisibleEdges();

  const nvlNodes = useMemo(
    () => visibleNodes.map(toNvlNode),
    [visibleNodes]
  );

  const nvlRelationships = useMemo(
    () => visibleEdges.map(toNvlRelationship),
    [visibleEdges]
  );

  // Initial data load
  useEffect(() => {
    if (visibleNodes.length === 0 && !isLoading) {
      fetchOntologyGraph();
    }
  }, [fetchOntologyGraph, visibleNodes.length, isLoading]);

  // Handle node click
  const handleNodeClick = useCallback(
    (node: Node) => {
      selectNode(node.id);
      onNodeClick?.(node.id);
    },
    [selectNode, onNodeClick]
  );

  // Handle node double-click
  const handleNodeDoubleClick = useCallback(
    (node: Node) => {
      onNodeDoubleClick?.(node.id);
    },
    [onNodeDoubleClick]
  );

  // Handle node hover
  const handleNodeHover = useCallback(
    (node: Node | null) => {
      setHoveredNode(node?.id || null);
    },
    [setHoveredNode]
  );

  // Handle canvas click (deselect)
  const handleCanvasClick = useCallback(() => {
    // Click on canvas background clears selection
  }, []);

  // NVL configuration
  const nvlOptions = useMemo(
    () => ({
      layout: layout === "force" ? "force" : layout === "hierarchical" ? "hierarchical" : "radial",
      pan: true,
      zoom: true,
      minZoom: 0.1,
      maxZoom: 4,
      selectedColor: "#FBBF24", // Amber for selection
      highlightColor: "#60A5FA", // Blue for highlight
      backgroundColor: "transparent",
      nodeCaption: true,
      nodeCaptionSize: 12,
      relationshipCaption: false,
      initialZoom: 0.8,
    }),
    [layout]
  );

  // Loading state
  if (isLoading && visibleNodes.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-muted/20", className)}>
        <div className="flex flex-col items-center gap-4">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading graph...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error && visibleNodes.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-muted/20", className)}>
        <div className="flex flex-col items-center gap-4 text-center p-4">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center">
            <span className="text-destructive text-2xl">!</span>
          </div>
          <div>
            <p className="font-medium text-destructive">Failed to load graph</p>
            <p className="text-sm text-muted-foreground mt-1">{error}</p>
          </div>
          <button
            onClick={() => fetchOntologyGraph()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm hover:bg-primary/90"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (visibleNodes.length === 0) {
    return (
      <div className={cn("flex items-center justify-center h-full bg-muted/20", className)}>
        <div className="text-center p-4">
          <p className="text-muted-foreground">No nodes to display</p>
          <p className="text-sm text-muted-foreground mt-1">
            Try adjusting your filters or loading data
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("relative h-full w-full", className)}>
      {/* Status indicator */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 bg-background/80 backdrop-blur-sm rounded-md px-3 py-1.5 text-xs border">
        <div
          className={cn(
            "h-2 w-2 rounded-full",
            useGraphStore.getState().mode === "live" ? "bg-green-500" : "bg-amber-500"
          )}
        />
        <span className="text-muted-foreground">
          {useGraphStore.getState().mode === "live" ? "Neo4j Connected" : "Mock Mode"}
        </span>
        <span className="text-muted-foreground">|</span>
        <span className="font-medium">{visibleNodes.length} nodes</span>
      </div>

      {/* Graph visualization */}
      <InteractiveNvlWrapper
        ref={nvlRef}
        nodes={nvlNodes}
        rels={nvlRelationships}
        nvlOptions={nvlOptions}
        nvlCallbacks={{
          onNodeClick: handleNodeClick,
          onNodeDoubleClick: handleNodeDoubleClick,
          onNodeHover: handleNodeHover,
          onCanvasClick: handleCanvasClick,
        }}
        style={{ width: "100%", height: "100%" }}
      />

      {/* Selection info */}
      {selection.selectedNodeIds.length > 0 && (
        <div className="absolute bottom-4 left-4 z-10 bg-background/90 backdrop-blur-sm rounded-md px-3 py-2 border">
          <p className="text-xs text-muted-foreground">
            {selection.selectedNodeIds.length} node(s) selected
          </p>
        </div>
      )}

      {/* Keyboard shortcuts hint */}
      <div className="absolute bottom-4 right-4 z-10 text-xs text-muted-foreground bg-background/50 backdrop-blur-sm rounded px-2 py-1">
        <span className="opacity-50">Scroll to zoom | Drag to pan | Click to select</span>
      </div>
    </div>
  );
}

export default GraphCanvas;

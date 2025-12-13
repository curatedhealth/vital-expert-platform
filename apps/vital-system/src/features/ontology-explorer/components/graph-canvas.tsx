"use client";

/**
 * Graph Canvas Component (Cytoscape)
 *
 * Replaces NVL with Cytoscape.js for richer client-side styling and
 * interaction while keeping the existing store/contracts.
 */

import { useEffect, useRef, useMemo } from "react";
import cytoscape, { Core, ElementDefinition } from "cytoscape";
import { useGraphStore } from "../stores/graph-store";
import { NODE_TYPE_CONFIG } from "../types/graph.types";
import { cn } from "@/lib/utils";

interface GraphCanvasProps {
  className?: string;
  onNodeClick?: (nodeId: string) => void;
  onNodeDoubleClick?: (nodeId: string) => void;
}

export function GraphCanvas({
  className,
  onNodeClick,
  onNodeDoubleClick,
}: GraphCanvasProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const cyRef = useRef<Core | null>(null);
  const lastTapRef = useRef<number>(0);

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
    zoom,
  } = useGraphStore();
  const fitVersion = useGraphStore((s) => s.fitVersion);

  // Convert nodes/edges to Cytoscape elements
  const visibleNodes = getVisibleNodes();
  const visibleEdges = getVisibleEdges();

  const elements = useMemo<ElementDefinition[]>(() => {
    const nodeElements = visibleNodes.map((node) => {
      const config = NODE_TYPE_CONFIG[node.type] || { color: "#9CA3AF", size: 20, label: node.type };
      return {
        data: {
          id: node.id,
          label: node.label,
          type: node.type,
          color: node.color || config.color,
          size: node.size || config.size,
        },
      };
    });

    const edgeElements = visibleEdges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label || edge.type,
        type: edge.type,
      },
    }));

    return [...nodeElements, ...edgeElements];
  }, [visibleNodes, visibleEdges]);

  const isLargeGraph = visibleNodes.length > 300;

  // Initial data load
  useEffect(() => {
    if (visibleNodes.length === 0 && !isLoading) {
      fetchOntologyGraph();
    }
  }, [fetchOntologyGraph, visibleNodes.length, isLoading]);

  // Initialize Cytoscape instance
  useEffect(() => {
    if (!containerRef.current || cyRef.current) return;

    const cy = cytoscape({
      container: containerRef.current,
      wheelSensitivity: 0.2,
      minZoom: 0.1,
      maxZoom: 4,
      layout: { name: "preset" },
      style: [
        {
          selector: "node",
          style: {
            "background-color": "data(color)",
            "border-color": "#E5E7EB",
            "border-width": 1.5,
            width: "mapData(size, 10, 80, 18, 56)",
            height: "mapData(size, 10, 80, 18, 56)",
            label: "data(label)",
            "font-size": 12,
            "text-valign": "center",
            "text-halign": "center",
            color: "#1F2937",
            "text-outline-color": "#F8FAFC",
            "text-outline-width": 2,
            "overlay-padding": 4,
            "overlay-opacity": 0,
          },
        },
        {
          selector: "edge",
          style: {
            width: 1.5,
            "line-color": "#CBD5E1",
            "target-arrow-color": "#CBD5E1",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            label: "data(label)",
            "font-size": 9,
            "text-background-color": "#FFFFFF",
            "text-background-opacity": 0.7,
            "text-background-padding": 2,
            "text-rotation": "autorotate",
            color: "#475467",
          },
        },
        {
          selector: ".selected",
          style: {
            "border-color": "#FBBF24",
            "border-width": 3,
            "background-color": "#F59E0B",
            "z-index": 2,
          },
        },
        {
          selector: ".highlighted",
          style: {
            "border-color": "#60A5FA",
            "border-width": 3,
            "background-color": "#A5B4FC",
            "z-index": 1,
          },
        },
      ],
    });

    // Node tap / double tap handling
    cy.on("tap", "node", (event) => {
      const nodeId = event.target.id();
      const now = Date.now();
      const isDouble = now - lastTapRef.current < 350;
      lastTapRef.current = now;

      selectNode(nodeId);
      onNodeClick?.(nodeId);

      if (isDouble) {
        onNodeDoubleClick?.(nodeId);
      }
    });

    // Hover
    cy.on("mouseover", "node", (event) => {
      setHoveredNode(event.target.id());
    });
    cy.on("mouseout", "node", () => {
      setHoveredNode(null);
    });

    // Track viewport for store
    cy.on("zoom pan", () => {
      const current = cyRef.current;
      if (!current) return;
      useGraphStore.getState().setZoom(current.zoom());
      useGraphStore.getState().setPanPosition(current.pan());
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
      cyRef.current = null;
    };
  }, [onNodeClick, onNodeDoubleClick, selectNode, setHoveredNode]);

  // Sync elements and run layout + fit
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.elements().remove();
      cy.add(elements);
    });

    if (elements.length === 0) return;

    const layoutName =
      layout === "force" ? "cose" : layout === "hierarchical" ? "breadthfirst" : "concentric";

    const layoutOptions =
      layoutName === "cose"
        ? {
            name: isLargeGraph ? "concentric" : "cose",
            animate: false,
            idealEdgeLength: 100,
            nodeRepulsion: 6000,
            gravity: 0.8,
            padding: 40,
          }
        : layoutName === "breadthfirst"
          ? { name: "breadthfirst", animate: false, directed: true, padding: 40 }
          : { name: "concentric", animate: false, padding: 40, minNodeSpacing: 18 };

    const runLayout = cy.layout(layoutOptions);
    runLayout.run();
    runLayout.on("layoutstop", () => cy.fit(undefined, 36));
  }, [elements, layout, isLargeGraph]);

  // Sync selection/highlight styling
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;

    cy.batch(() => {
      cy.nodes().removeClass("selected highlighted");
      selection.selectedNodeIds.forEach((id) => {
        cy.getElementById(id).addClass("selected");
      });
      selection.highlightedNodeIds.forEach((id) => {
        cy.getElementById(id).addClass("highlighted");
      });
    });
  }, [selection.selectedNodeIds, selection.highlightedNodeIds]);

  // Respond to store-driven zoom changes
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.zoom(zoom);
  }, [zoom]);

  // Fit-to-view signals
  useEffect(() => {
    const cy = cyRef.current;
    if (!cy) return;
    cy.fit(undefined, 24);
  }, [fitVersion]);

  // Status indicator + overlays retained below

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
      <div ref={containerRef} className="h-full w-full" />

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

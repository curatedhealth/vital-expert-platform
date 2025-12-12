"use client";

/**
 * Ontology Explorer Client Component
 *
 * Main container for the graph visualization interface.
 * Combines:
 * - GraphToolbar for controls
 * - GraphCanvas for visualization
 * - NodeDetailsDrawer for inspecting selected nodes
 * - ChatSidebar for AI-powered navigation
 */

import { useState, useCallback } from "react";
import { useGraphStore } from "@/features/ontology-explorer/stores/graph-store";
import { GraphCanvas } from "@/features/ontology-explorer/components/graph-canvas";
import { GraphToolbar } from "@/features/ontology-explorer/components/graph-toolbar";
import { NodeDetailsDrawer } from "@/features/ontology-explorer/components/node-details-drawer";
import { ChatSidebar } from "@/features/ontology-explorer/components/chat-sidebar";
import { PageHeader } from "@/components/page-header";
import { Button } from "@vital/ui";
import { cn } from "@/lib/utils";
import {
  Network,
  MessageSquare,
  PanelRightOpen,
  PanelRightClose,
  Layers,
  Bot,
} from "lucide-react";

export default function OntologyExplorer() {
  // Panel states
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // Graph store
  const { selection, fetchNodeNeighbors } = useGraphStore();

  // Open details panel when a node is selected
  const handleNodeClick = useCallback(
    (nodeId: string) => {
      setIsDetailsOpen(true);
    },
    []
  );

  // Expand node neighbors on double-click
  const handleNodeDoubleClick = useCallback(
    (nodeId: string) => {
      fetchNodeNeighbors(nodeId, 2);
    },
    [fetchNodeNeighbors]
  );

  // Close details when selection is cleared
  const handleDetailsClose = useCallback(() => {
    setIsDetailsOpen(false);
  }, []);

  // Toggle chat sidebar
  const handleChatToggle = useCallback(() => {
    setIsChatOpen((prev) => !prev);
  }, []);

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full">
      {/* Page Header */}
      <PageHeader
        icon={Network}
        title="Ontology Explorer"
        description="Interactive visualization of the VITAL Enterprise Ontology"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant={isChatOpen ? "default" : "outline"}
              size="sm"
              onClick={handleChatToggle}
              className="gap-2"
            >
              <Bot className="h-4 w-4" />
              <span className="hidden sm:inline">AI Navigator</span>
            </Button>
          </div>
        }
      />

      {/* Toolbar */}
      <GraphToolbar className="relative" />

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden relative">
        {/* Graph Canvas - Main visualization area */}
        <div
          className={cn(
            "flex-1 transition-all duration-200",
            isDetailsOpen && "mr-80",
            isChatOpen && "mr-80"
          )}
        >
          <GraphCanvas
            onNodeClick={handleNodeClick}
            onNodeDoubleClick={handleNodeDoubleClick}
            className="h-full"
          />
        </div>

        {/* Right Side Panels - Overlapping */}
        <div className="absolute right-0 top-0 bottom-0 flex">
          {/* Node Details Drawer */}
          {isDetailsOpen && selection.selectedNodeIds.length > 0 && (
            <NodeDetailsDrawer
              isOpen={isDetailsOpen}
              onClose={handleDetailsClose}
              className={cn(
                "transition-transform duration-200",
                isChatOpen && "-translate-x-80"
              )}
            />
          )}

          {/* AI Chat Sidebar */}
          {isChatOpen && (
            <ChatSidebar
              isOpen={isChatOpen}
              onClose={() => setIsChatOpen(false)}
            />
          )}
        </div>
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 z-10">
        <NodeTypeLegend />
      </div>
    </div>
  );
}

/**
 * Node Type Legend Component
 * Shows color-coded node types for reference
 */
function NodeTypeLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  const nodeTypes = [
    { type: "Function", color: "#8B5CF6", description: "Organizational functions" },
    { type: "Department", color: "#3B82F6", description: "Departments within functions" },
    { type: "Role", color: "#10B981", description: "Job roles and positions" },
    { type: "JTBD", color: "#F59E0B", description: "Jobs to be done" },
    { type: "ValueCategory", color: "#06B6D4", description: "Value categories (SMARTER, etc.)" },
    { type: "ValueDriver", color: "#14B8A6", description: "Value drivers" },
    { type: "Agent", color: "#EAB308", description: "AI agents" },
    { type: "Persona", color: "#6B7280", description: "User personas" },
    { type: "Workflow", color: "#EC4899", description: "Automated workflows" },
  ];

  return (
    <div className="bg-background/90 backdrop-blur-sm border rounded-lg shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm font-medium hover:bg-muted rounded-lg"
      >
        <Layers className="h-4 w-4" />
        <span>Node Types</span>
        <span className="ml-auto text-xs text-muted-foreground">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5 border-t pt-2">
          {nodeTypes.map(({ type, color, description }) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: color }}
              />
              <span className="font-medium">{type}</span>
              <span className="text-muted-foreground hidden sm:inline">
                — {description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

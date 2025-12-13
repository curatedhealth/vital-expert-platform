"use client";

/**
 * Ontology Explorer Client Component - VITAL Brand Guidelines v6.0
 *
 * Main container for the graph visualization interface.
 * Combines:
 * - GraphToolbar for controls
 * - GraphCanvas for visualization
 * - NodeDetailsDrawer for inspecting selected nodes
 * - ChatSidebar for AI-powered navigation
 *
 * Design:
 * - Warm canvas background (#FAFAF9)
 * - Purple accent (#9055E0)
 * - Stone neutrals for text and borders
 */

import { useState, useCallback } from "react";
import { useGraphStore } from "@/features/ontology-explorer/stores/graph-store";
import { GraphCanvas } from "@/features/ontology-explorer/components/graph-canvas";
import { GraphToolbar } from "@/features/ontology-explorer/components/graph-toolbar";
import { NodeDetailsDrawer } from "@/features/ontology-explorer/components/node-details-drawer";
import { ChatSidebar } from "@/features/ontology-explorer/components/chat-sidebar";
import { Button } from "@vital/ui";
import { cn } from "@/lib/utils";
import { Layers, Bot } from "lucide-react";

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
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-stone-50">
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
 * Node Type Legend Component - VITAL Brand v6.0
 * Shows color-coded node types with brand-aligned palette
 *
 * Colors use the VITAL purple-forward palette where:
 * - Primary entities (Function, Agent) use warm purple (#9055E0)
 * - Supporting entities use complementary colors from the design system
 */
function NodeTypeLegend() {
  const [isExpanded, setIsExpanded] = useState(false);

  // Brand-aligned node type colors (v6.0)
  const nodeTypes = [
    { type: "Function", color: "#9055E0", description: "Organizational functions" },
    { type: "Department", color: "#7C3AED", description: "Departments within functions" },
    { type: "Role", color: "#10B981", description: "Job roles and positions" },
    { type: "JTBD", color: "#F59E0B", description: "Jobs to be done" },
    { type: "ValueCategory", color: "#06B6D4", description: "Value categories (SMARTER, etc.)" },
    { type: "ValueDriver", color: "#14B8A6", description: "Value drivers" },
    { type: "Agent", color: "#A855F7", description: "AI agents" },
    { type: "Persona", color: "#78716C", description: "User personas" },
    { type: "Workflow", color: "#EC4899", description: "Automated workflows" },
  ];

  return (
    <div className="bg-stone-50/95 backdrop-blur-sm border border-stone-200 rounded-lg shadow-lg">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 px-3 py-2 w-full text-left text-sm font-medium text-stone-700 hover:bg-stone-100 rounded-lg transition-colors duration-150"
      >
        <Layers className="h-4 w-4 text-purple-600" />
        <span>Node Types</span>
        <span className="ml-auto text-xs text-stone-500">
          {isExpanded ? "−" : "+"}
        </span>
      </button>

      {isExpanded && (
        <div className="px-3 pb-3 space-y-1.5 border-t border-stone-200 pt-2">
          {nodeTypes.map(({ type, color, description }) => (
            <div key={type} className="flex items-center gap-2 text-xs">
              <div
                className="h-3 w-3 rounded-full flex-shrink-0 ring-1 ring-stone-200"
                style={{ backgroundColor: color }}
              />
              <span className="font-medium text-stone-700">{type}</span>
              <span className="text-stone-500 hidden sm:inline">
                — {description}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

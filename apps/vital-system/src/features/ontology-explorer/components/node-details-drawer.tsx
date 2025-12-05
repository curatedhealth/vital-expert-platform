"use client";

/**
 * Node Details Drawer
 *
 * Displays detailed information about the selected node.
 * Shows properties, relationships, and actions.
 */

import { useEffect, useState } from "react";
import { useGraphStore } from "../stores/graph-store";
import { NODE_TYPE_CONFIG, type GraphNode } from "../types/graph.types";
import { cn } from "@/lib/utils";
import {
  X,
  ExternalLink,
  ChevronRight,
  Copy,
  Check,
  Network,
  ArrowRight,
  ArrowLeft,
} from "lucide-react";

interface NodeDetailsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function NodeDetailsDrawer({
  isOpen,
  onClose,
  className,
}: NodeDetailsDrawerProps) {
  const [copied, setCopied] = useState(false);

  const { getSelectedNodes, nodes, edges, fetchNodeNeighbors, selectNode } =
    useGraphStore();

  const selectedNodes = getSelectedNodes();
  const selectedNode = selectedNodes[0];

  // Get connected nodes
  const incomingEdges = edges.filter((e) => e.target === selectedNode?.id);
  const outgoingEdges = edges.filter((e) => e.source === selectedNode?.id);

  const getNodeById = (id: string) => nodes.find((n) => n.id === id);

  const handleCopyId = () => {
    if (selectedNode) {
      navigator.clipboard.writeText(selectedNode.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleExpandNode = () => {
    if (selectedNode) {
      fetchNodeNeighbors(selectedNode.id, 2);
    }
  };

  if (!isOpen || !selectedNode) return null;

  const config = NODE_TYPE_CONFIG[selectedNode.type] || {
    color: "#9CA3AF",
    label: selectedNode.type,
  };

  return (
    <div
      className={cn(
        "w-80 bg-background border-l flex flex-col h-full overflow-hidden",
        className
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-2 p-4 border-b">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <div
              className="h-3 w-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: config.color }}
            />
            <span className="text-xs text-muted-foreground uppercase tracking-wide">
              {config.label}
            </span>
          </div>
          <h3 className="font-semibold truncate">{selectedNode.label}</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded hover:bg-muted text-muted-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* ID */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            ID
          </label>
          <div className="flex items-center gap-2 mt-1">
            <code className="flex-1 text-xs bg-muted px-2 py-1 rounded font-mono truncate">
              {selectedNode.id}
            </code>
            <button
              onClick={handleCopyId}
              className="p-1 rounded hover:bg-muted text-muted-foreground"
              title="Copy ID"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-500" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        {/* Properties */}
        <div>
          <label className="text-xs text-muted-foreground uppercase tracking-wide">
            Properties
          </label>
          <div className="mt-2 space-y-2">
            {Object.entries(selectedNode.properties)
              .filter(([key]) => !["id", "embedding"].includes(key))
              .map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start justify-between gap-2 text-sm"
                >
                  <span className="text-muted-foreground capitalize">
                    {key.replace(/_/g, " ")}
                  </span>
                  <span className="text-right font-medium truncate max-w-[60%]">
                    {typeof value === "object"
                      ? JSON.stringify(value)
                      : String(value) || "—"}
                  </span>
                </div>
              ))}
            {Object.keys(selectedNode.properties).length === 0 && (
              <p className="text-sm text-muted-foreground italic">
                No properties
              </p>
            )}
          </div>
        </div>

        {/* Relationships */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="text-xs text-muted-foreground uppercase tracking-wide">
              Connections
            </label>
            <span className="text-xs text-muted-foreground">
              {incomingEdges.length + outgoingEdges.length} total
            </span>
          </div>

          {/* Incoming */}
          {incomingEdges.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Incoming
              </p>
              <div className="space-y-1">
                {incomingEdges.slice(0, 5).map((edge) => {
                  const sourceNode = getNodeById(edge.source);
                  if (!sourceNode) return null;
                  const sourceConfig = NODE_TYPE_CONFIG[sourceNode.type];
                  return (
                    <button
                      key={edge.id}
                      onClick={() => selectNode(edge.source)}
                      className="w-full flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left text-sm group"
                    >
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: sourceConfig?.color }}
                      />
                      <span className="flex-1 truncate">{sourceNode.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {edge.type}
                      </span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
                {incomingEdges.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-2">
                    +{incomingEdges.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Outgoing */}
          {outgoingEdges.length > 0 && (
            <div>
              <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                <ArrowRight className="h-3 w-3" /> Outgoing
              </p>
              <div className="space-y-1">
                {outgoingEdges.slice(0, 5).map((edge) => {
                  const targetNode = getNodeById(edge.target);
                  if (!targetNode) return null;
                  const targetConfig = NODE_TYPE_CONFIG[targetNode.type];
                  return (
                    <button
                      key={edge.id}
                      onClick={() => selectNode(edge.target)}
                      className="w-full flex items-center gap-2 p-2 rounded-md bg-muted/50 hover:bg-muted text-left text-sm group"
                    >
                      <span className="text-xs text-muted-foreground">
                        {edge.type}
                      </span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground" />
                      <div
                        className="h-2.5 w-2.5 rounded-full flex-shrink-0"
                        style={{ backgroundColor: targetConfig?.color }}
                      />
                      <span className="flex-1 truncate">{targetNode.label}</span>
                      <ChevronRight className="h-3 w-3 text-muted-foreground opacity-0 group-hover:opacity-100" />
                    </button>
                  );
                })}
                {outgoingEdges.length > 5 && (
                  <p className="text-xs text-muted-foreground pl-2">
                    +{outgoingEdges.length - 5} more
                  </p>
                )}
              </div>
            </div>
          )}

          {incomingEdges.length === 0 && outgoingEdges.length === 0 && (
            <p className="text-sm text-muted-foreground italic">
              No connections found
            </p>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="p-4 border-t space-y-2">
        <button
          onClick={handleExpandNode}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90"
        >
          <Network className="h-4 w-4" />
          Expand Neighbors
        </button>
        <button
          onClick={onClose}
          className="w-full px-3 py-2 bg-muted text-muted-foreground rounded-md text-sm font-medium hover:bg-muted/80"
        >
          Close
        </button>
      </div>
    </div>
  );
}

export default NodeDetailsDrawer;

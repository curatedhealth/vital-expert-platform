"use client";

/**
 * Graph Toolbar Component
 *
 * Controls for graph visualization:
 * - Layout selection (force, hierarchical, radial)
 * - Node type filters
 * - Search
 * - Export options
 * - Zoom controls
 */

import { useState } from "react";
import { useGraphStore } from "../stores/graph-store";
import { NODE_TYPE_CONFIG, type NodeType, type LayoutType } from "../types/graph.types";
import { cn } from "@/lib/utils";
import {
  Network,
  GitBranch,
  Circle,
  Search,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Filter,
  Download,
  X,
} from "lucide-react";

interface GraphToolbarProps {
  className?: string;
}

const LAYOUT_OPTIONS: { value: LayoutType; label: string; icon: React.ElementType }[] = [
  { value: "force", label: "Force", icon: Network },
  { value: "hierarchical", label: "Hierarchy", icon: GitBranch },
  { value: "radial", label: "Radial", icon: Circle },
];

export function GraphToolbar({ className }: GraphToolbarProps) {
  const [showFilters, setShowFilters] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const {
    layout,
    setLayout,
    nodeFilters,
    toggleNodeFilter,
    setAllFilters,
    searchQuery,
    setSearchQuery,
    searchGraph,
    isLoading,
    refreshGraph,
    zoom,
    setZoom,
    fitToView,
  } = useGraphStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      searchGraph(searchQuery);
    }
  };

  const handleZoomIn = () => setZoom(Math.min(zoom * 1.2, 4));
  const handleZoomOut = () => setZoom(Math.max(zoom / 1.2, 0.1));

  return (
    <div className={cn("flex items-center justify-between gap-4 p-2 bg-background border-b", className)}>
      {/* Left side: Layout and filters */}
      <div className="flex items-center gap-2">
        {/* Layout selector */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
          {LAYOUT_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setLayout(value)}
              className={cn(
                "flex items-center gap-1.5 px-2 py-1 rounded text-xs font-medium transition-colors",
                layout === value
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
              title={label}
            >
              <Icon className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className={cn(
            "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors",
            showFilters || nodeFilters.some(f => !f.enabled)
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:text-foreground"
          )}
        >
          <Filter className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Filters</span>
          {nodeFilters.filter(f => !f.enabled).length > 0 && (
            <span className="ml-1 px-1.5 bg-background/20 rounded text-xs">
              {nodeFilters.filter(f => !f.enabled).length}
            </span>
          )}
        </button>

        {/* Refresh button */}
        <button
          onClick={refreshGraph}
          disabled={isLoading}
          className="p-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground disabled:opacity-50"
          title="Refresh graph"
        >
          <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
        </button>
      </div>

      {/* Center: Search */}
      <div className="flex-1 max-w-md">
        <form onSubmit={handleSearch} className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-1.5 text-sm bg-muted rounded-md border-none focus:ring-1 focus:ring-primary"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                useGraphStore.getState().clearHighlight();
              }}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </form>
      </div>

      {/* Right side: Zoom and export */}
      <div className="flex items-center gap-2">
        {/* Zoom controls */}
        <div className="flex items-center gap-1 p-1 bg-muted rounded-md">
          <button
            onClick={handleZoomOut}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
            title="Zoom out"
          >
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="px-2 text-xs text-muted-foreground min-w-[3rem] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <button
            onClick={handleZoomIn}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
            title="Zoom in"
          >
            <ZoomIn className="h-4 w-4" />
          </button>
          <button
            onClick={fitToView}
            className="p-1 rounded text-muted-foreground hover:text-foreground"
            title="Fit to view"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>

        {/* Export button */}
        <button
          className="flex items-center gap-1.5 px-2 py-1.5 rounded-md bg-muted text-muted-foreground hover:text-foreground text-xs font-medium"
          title="Export graph"
        >
          <Download className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>
      </div>

      {/* Filter dropdown */}
      {showFilters && (
        <div className="absolute top-full left-0 right-0 mt-1 p-3 bg-background border rounded-md shadow-lg z-20 mx-2">
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium">Node Type Filters</h4>
            <div className="flex gap-2">
              <button
                onClick={() => setAllFilters(true)}
                className="text-xs text-primary hover:underline"
              >
                Show all
              </button>
              <button
                onClick={() => setAllFilters(false)}
                className="text-xs text-muted-foreground hover:underline"
              >
                Hide all
              </button>
            </div>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {(Object.keys(NODE_TYPE_CONFIG) as NodeType[]).map((nodeType) => {
              const config = NODE_TYPE_CONFIG[nodeType];
              const filter = nodeFilters.find((f) => f.type === nodeType);
              const isEnabled = filter?.enabled ?? true;

              return (
                <button
                  key={nodeType}
                  onClick={() => toggleNodeFilter(nodeType)}
                  className={cn(
                    "flex items-center gap-2 px-2 py-1.5 rounded-md text-xs font-medium transition-all",
                    isEnabled
                      ? "bg-muted text-foreground"
                      : "bg-muted/50 text-muted-foreground line-through opacity-60"
                  )}
                >
                  <div
                    className="h-3 w-3 rounded-full flex-shrink-0"
                    style={{ backgroundColor: config.color }}
                  />
                  <span className="truncate">{config.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default GraphToolbar;

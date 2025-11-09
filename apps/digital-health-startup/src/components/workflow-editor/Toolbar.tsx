'use client';

import { useCallback } from 'react';
import { useReactFlow } from 'reactflow';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useWorkflowEditorStore } from '@/lib/stores/workflow-editor-store';
import { getLayoutedElements } from '@/lib/layout/elk-layout';
import {
  Undo,
  Redo,
  Copy,
  Clipboard,
  Trash2,
  Sparkles,
  Maximize,
  ZoomIn,
  ZoomOut,
  Layout,
  Play,
  Download,
  ChevronDown,
} from 'lucide-react';
import { toast } from 'sonner';

export function Toolbar() {
  const { fitView, zoomIn, zoomOut } = useReactFlow();
  
  const {
    nodes,
    edges,
    selectedNodes,
    undo,
    redo,
    canUndo,
    canRedo,
    copy,
    paste,
    deleteNodes,
    setNodes,
    setEdges,
  } = useWorkflowEditorStore();

  const handleAutoLayout = useCallback(async () => {
    try {
      const { nodes: layoutedNodes, edges: layoutedEdges } = await getLayoutedElements(
        nodes,
        edges
      );
      setNodes(layoutedNodes);
      setEdges(layoutedEdges);
      setTimeout(() => fitView({ padding: 0.2, duration: 300 }), 50);
      toast.success('Layout applied successfully');
    } catch (error) {
      toast.error('Failed to apply layout');
    }
  }, [nodes, edges, setNodes, setEdges, fitView]);

  const handleCopy = () => {
    copy();
    toast.success('Copied to clipboard');
  };

  const handlePaste = () => {
    paste();
    toast.success('Pasted from clipboard');
  };

  const handleDelete = () => {
    if (selectedNodes.length > 0) {
      deleteNodes(selectedNodes);
      toast.success(`Deleted ${selectedNodes.length} node(s)`);
    }
  };

  const handleExport = () => {
    const workflow = {
      nodes,
      edges,
      metadata: {
        exportedAt: new Date().toISOString(),
      },
    };
    const blob = new Blob([JSON.stringify(workflow, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `workflow-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Workflow exported');
  };

  return (
    <div className="flex items-center gap-2 p-3 border-b bg-background">
      {/* Undo/Redo */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={undo}
          disabled={!canUndo()}
          title="Undo (Cmd+Z)"
        >
          <Undo className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={redo}
          disabled={!canRedo()}
          title="Redo (Cmd+Shift+Z)"
        >
          <Redo className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Clipboard */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          disabled={selectedNodes.length === 0}
          title="Copy (Cmd+C)"
        >
          <Copy className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handlePaste}
          title="Paste (Cmd+V)"
        >
          <Clipboard className="w-4 h-4" />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDelete}
          disabled={selectedNodes.length === 0}
          title="Delete (Delete)"
        >
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Layout */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm">
            <Layout className="w-4 h-4 mr-2" />
            Layout
            <ChevronDown className="w-3 h-3 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuLabel>Auto Layout</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleAutoLayout}>
            <Sparkles className="w-4 h-4 mr-2" />
            Auto Arrange
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleAutoLayout()}
          >
            Vertical Layout
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => handleAutoLayout()}
          >
            Horizontal Layout
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* View */}
      <div className="flex items-center gap-1">
        <Button variant="ghost" size="sm" onClick={() => fitView()} title="Fit View">
          <Maximize className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => zoomIn()} title="Zoom In">
          <ZoomIn className="w-4 h-4" />
        </Button>
        <Button variant="ghost" size="sm" onClick={() => zoomOut()} title="Zoom Out">
          <ZoomOut className="w-4 h-4" />
        </Button>
      </div>

      <Separator orientation="vertical" className="h-6" />

      {/* Actions */}
      <Button variant="ghost" size="sm" onClick={handleExport}>
        <Download className="w-4 h-4 mr-2" />
        Export
      </Button>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Info */}
      <div className="flex items-center gap-4 text-xs text-muted-foreground">
        <span>{nodes.length} nodes</span>
        <span>{edges.length} connections</span>
        {selectedNodes.length > 0 && (
          <span className="text-primary">{selectedNodes.length} selected</span>
        )}
      </div>
    </div>
  );
}


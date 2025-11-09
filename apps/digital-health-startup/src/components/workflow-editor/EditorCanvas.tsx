'use client';

import { useCallback, useRef } from 'react';
import ReactFlow, {
  Background,
  Controls,
  MiniMap,
  BackgroundVariant,
  ReactFlowProvider,
  useReactFlow,
} from 'reactflow';
import 'reactflow/dist/style.css';

import { useWorkflowEditorStore } from '@/lib/stores/workflow-editor-store';
import { Toolbar } from './Toolbar';
import { nodeTypes } from './nodes';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';

export function EditorCanvas() {
  return (
    <ReactFlowProvider>
      <EditorCanvasInner />
    </ReactFlowProvider>
  );
}

function EditorCanvasInner() {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const { screenToFlowPosition } = useReactFlow();
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
  } = useWorkflowEditorStore();

  // Enable keyboard shortcuts
  useKeyboardShortcuts();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const type = event.dataTransfer.getData('application/reactflow');
      const agentData = event.dataTransfer.getData('agent-data');
      const ragData = event.dataTransfer.getData('rag-data');
      const toolData = event.dataTransfer.getData('tool-data');

      if (!type) return;

      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: any = {
        id: `${type}-${Date.now()}`,
        type,
        position,
        data: {
          label: `${type.charAt(0).toUpperCase() + type.slice(1)} Node`,
        },
      };

      // If dragging from library, include the library item data
      if (agentData) {
        const agent = JSON.parse(agentData);
        newNode.data = {
          ...newNode.data,
          label: agent.name,
          agents: [agent],
          agentId: agent.id,
        };
      } else if (ragData) {
        const rag = JSON.parse(ragData);
        newNode.data = {
          ...newNode.data,
          label: rag.name,
          rags: [rag],
          ragId: rag.id,
        };
      } else if (toolData) {
        const tool = JSON.parse(toolData);
        newNode.data = {
          ...newNode.data,
          label: tool.name,
          tools: [tool],
          toolId: tool.id,
        };
      }

      addNode(newNode);
    },
    [screenToFlowPosition, addNode]
  );

  return (
    <div className="flex-1 flex flex-col relative">
      {/* Toolbar */}
      <Toolbar />

      {/* Canvas */}
      <div ref={reactFlowWrapper} className="flex-1 bg-muted/20">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{
            padding: 0.2,
          }}
          minZoom={0.1}
          maxZoom={2}
          defaultEdgeOptions={{
            type: 'smoothstep',
            animated: true,
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls showInteractive={false} />
          <MiniMap
            nodeColor={(node) => {
              switch (node.type) {
                case 'task':
                  return '#3b82f6';
                case 'conditional':
                  return '#f97316';
                case 'loop':
                  return '#ec4899';
                case 'agent':
                  return '#6366f1';
                case 'rag':
                  return '#06b6d4';
                default:
                  return '#6b7280';
              }
            }}
            maskColor="rgba(0, 0, 0, 0.1)"
            className="border rounded-lg"
          />
        </ReactFlow>
      </div>
    </div>
  );
}


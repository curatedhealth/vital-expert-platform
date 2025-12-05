import React, { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  addEdge,
  Connection,
  useNodesState,
  useEdgesState,
  Background,
  Controls,
  MiniMap,
  Handle,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { X, Save } from 'lucide-react';
import { TaskLibrary, TaskDefinition } from './TaskLibrary';
import { TaskNode } from './TaskNode';
import { WorkflowDefinition } from '../types/workflow';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

// Task Input/Output boundary nodes
const TaskInputNode = () => (
  <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4 min-w-[150px] shadow-sm">
    <Handle type="source" position={Position.Right} className="!w-5 !h-5 !bg-primary !border-[3px] !border-white" />
    <div className="font-semibold text-blue-900 mb-1">📥 Task Input</div>
    <div className="text-xs text-blue-700">Receives data from parent workflow</div>
  </div>
);

const TaskOutputNode = () => (
  <div className="bg-green-50 border-2 border-green-300 rounded-lg p-4 min-w-[150px] shadow-sm">
    <Handle type="target" position={Position.Left} className="!w-5 !h-5 !bg-primary !border-[3px] !border-white" />
    <div className="font-semibold text-green-900 mb-1">📤 Task Output</div>
    <div className="text-xs text-green-700">Returns data to parent workflow</div>
  </div>
);

interface TaskFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
  taskNodeId: string;
  taskName: string;
  subflow: { nodes: Node[]; edges: Edge[] } | null;
  subworkflow?: WorkflowDefinition | null;
  onSave: (subflow: { nodes: Node[]; edges: Edge[] }) => void;
  onSaveWorkflow?: (workflow: WorkflowDefinition) => void;
  onTaskDragStart: (task: TaskDefinition, event: React.DragEvent) => void;
  onCreateTask?: () => void;
  onCombineTasks?: () => void;
}

export const TaskFlowModal: React.FC<TaskFlowModalProps> = ({
  isOpen,
  onClose,
  taskNodeId,
  taskName,
  subflow,
  onSave,
  onTaskDragStart,
  onCreateTask,
  onCombineTasks,
}) => {
  // Ensure input/output nodes always exist
  const initialNodes = useMemo((): Node[] => {
    if (subflow?.nodes) {
      // Check if input/output nodes exist, add if missing
      const hasInput = subflow.nodes.some(n => n.id === 'task-input');
      const hasOutput = subflow.nodes.some(n => n.id === 'task-output');
      const nodes = [...subflow.nodes];
      
      if (!hasInput) {
        nodes.unshift({
          id: 'task-input',
          type: 'task-input',
          position: { x: 100, y: 200 },
          data: {},
        });
      }
      if (!hasOutput) {
        nodes.push({
          id: 'task-output',
          type: 'task-output',
          position: { x: 800, y: 200 },
          data: {},
        });
      }
      return nodes;
    }
    
    return [
      {
        id: 'task-input',
        type: 'task-input',
        position: { x: 100, y: 200 },
        data: {},
      },
      {
        id: 'task-output',
        type: 'task-output',
        position: { x: 800, y: 200 },
        data: {},
      },
    ];
  }, [subflow]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(subflow?.edges || []);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const reactFlowWrapper = useRef<HTMLDivElement>(null);

  // Reset nodes/edges when modal opens with different task
  useEffect(() => {
    if (isOpen) {
      setNodes(initialNodes);
      setEdges(subflow?.edges || []);
    }
  }, [isOpen, taskNodeId, initialNodes, subflow, setNodes, setEdges]);

  // Fit view when reactFlowInstance is ready
  useEffect(() => {
    if (isOpen && reactFlowInstance) {
      setTimeout(() => {
        reactFlowInstance.fitView({ padding: 0.2, duration: 400 });
      }, 100);
    }
  }, [isOpen, reactFlowInstance]);

  // Handle task drop
  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();
      const taskData = event.dataTransfer.getData('application/reactflow');
      if (!taskData || !reactFlowInstance) return;

      const task: TaskDefinition = JSON.parse(taskData);
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `task-${task.id}-${Date.now()}`,
        type: 'task',
        position,
        data: {
          task,
          enabled: true,
        },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onConnect = useCallback(
    (connection: Connection) => {
      const newEdges = addEdge(
        { ...connection, animated: true, style: { stroke: '#667eea', strokeWidth: 2 } },
        edges
      );
      setEdges(newEdges);
    },
    [edges, setEdges]
  );

  const handleSave = () => {
    // Filter out input/output nodes when saving (they're always present)
    const flowNodes = nodes.filter(n => n.id !== 'task-input' && n.id !== 'task-output');
    onSave({ nodes: flowNodes, edges });
    onClose();
  };

  // Use ref to avoid including setNodes in dependencies
  const setNodesRef = React.useRef(setNodes);
  React.useEffect(() => {
    setNodesRef.current = setNodes;
  }, [setNodes]);

  const nodeTypes = React.useMemo(() => ({
    'task-input': TaskInputNode,
    'task-output': TaskOutputNode,
    task: (props: any) => (
      <TaskNode
        {...props}
        selected={false}
        updateNodeData={(data: any) => {
          setNodesRef.current((nds) =>
            nds.map((node) =>
              node.id === props.id ? { ...node, data: { ...node.data, ...data } } : node
            ) as Node[]
          );
        }}
      />
    ),
  }), []); // Empty dependency array - setNodes accessed via ref

  // Ensure component is fully mounted before rendering React Flow
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    if (isOpen) {
      // Small delay to ensure DOM is ready
      const timer = setTimeout(() => setIsMounted(true), 0);
      return () => clearTimeout(timer);
    } else {
      setIsMounted(false);
    }
  }, [isOpen]);

  if (!isOpen || !isMounted) {
    return null;
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-neutral-200">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <span className="text-neutral-500">Workflow</span>
              <span className="text-neutral-400">›</span>
              <span>{taskName}</span>
            </DialogTitle>
            <div className="flex items-center gap-2">
              <Button onClick={handleSave}>
                <Save size={18} className="mr-2" />
                Save Flow
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X size={18} />
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="flex flex-1 overflow-hidden">
          <div className="w-64 border-r border-neutral-200 overflow-y-auto">
            <TaskLibrary 
              onTaskDragStart={onTaskDragStart}
              onCreateTask={onCreateTask}
              onCombineTasks={onCombineTasks}
            />
          </div>
          <div className="flex-1" ref={reactFlowWrapper}>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onInit={setReactFlowInstance}
              nodeTypes={nodeTypes}
              fitView
            >
              <Background gap={16} size={1} />
              <Controls />
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};


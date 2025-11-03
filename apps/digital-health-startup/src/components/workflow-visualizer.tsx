'use client';

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  Node,
  Edge,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  MarkerType,
  Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Bot, Wrench, Database, User } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Task {
  id: string;
  code: string;
  title: string;
  position: number;
  agents?: Array<{
    id: string;
    name: string;
    code: string;
    assignment_type: string;
    execution_order: number;
  }>;
  tools?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
  rags?: Array<{
    id: string;
    name: string;
    code: string;
  }>;
}

interface WorkflowVisualizerProps {
  tasks: Task[];
  workflowName: string;
}

// Custom Task Node
function TaskNode({ data }: { data: any }) {
  return (
    <div className="bg-white border-2 border-healthcare-accent rounded-lg shadow-lg min-w-[250px]">
      {/* Header */}
      <div className="bg-healthcare-accent text-white px-4 py-2 rounded-t-lg">
        <div className="flex items-center justify-between">
          <Badge variant="secondary" className="bg-white/20 text-white text-xs">
            Task {data.position}
          </Badge>
          <span className="text-xs font-mono">{data.code}</span>
        </div>
        <h3 className="font-semibold text-sm mt-1">{data.title}</h3>
      </div>

      {/* Body */}
      <div className="p-3 space-y-2">
        {/* Agents */}
        {data.agents && data.agents.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Bot className="h-3 w-3 text-blue-600" />
              <span className="text-xs font-semibold text-gray-700">Agents</span>
            </div>
            <div className="space-y-1">
              {data.agents.slice(0, 2).map((agent: any) => (
                <div key={agent.id} className="text-xs bg-blue-50 px-2 py-1 rounded flex items-center justify-between">
                  <span className="truncate flex-1">{agent.name}</span>
                  <Badge variant="outline" className="text-[10px] ml-1 bg-white">
                    {agent.assignment_type === 'PRIMARY_EXECUTOR' ? 'Primary' : 
                     agent.assignment_type === 'CO_EXECUTOR' ? 'Co-Exec' : 'Support'}
                  </Badge>
                </div>
              ))}
              {data.agents.length > 2 && (
                <div className="text-xs text-gray-500 italic">
                  +{data.agents.length - 2} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tools */}
        {data.tools && data.tools.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Wrench className="h-3 w-3 text-green-600" />
              <span className="text-xs font-semibold text-gray-700">Tools</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.tools.slice(0, 3).map((tool: any) => (
                <Badge key={tool.id} variant="outline" className="text-[10px] bg-green-50 border-green-200">
                  {tool.name}
                </Badge>
              ))}
              {data.tools.length > 3 && (
                <Badge variant="outline" className="text-[10px]">
                  +{data.tools.length - 3}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* RAG Sources */}
        {data.rags && data.rags.length > 0 && (
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Database className="h-3 w-3 text-purple-600" />
              <span className="text-xs font-semibold text-gray-700">Knowledge</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {data.rags.slice(0, 2).map((rag: any) => (
                <Badge key={rag.id} variant="outline" className="text-[10px] bg-purple-50 border-purple-200">
                  {rag.name}
                </Badge>
              ))}
              {data.rags.length > 2 && (
                <Badge variant="outline" className="text-[10px]">
                  +{data.rags.length - 2}
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// Start Node
function StartNode() {
  return (
    <div className="bg-green-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2">
      <div className="w-3 h-3 bg-white rounded-full"></div>
      Start
    </div>
  );
}

// End Node
function EndNode() {
  return (
    <div className="bg-red-500 text-white px-4 py-2 rounded-full shadow-lg font-semibold flex items-center gap-2">
      End
      <div className="w-3 h-3 bg-white rounded-full"></div>
    </div>
  );
}

const nodeTypes = {
  task: TaskNode,
  start: StartNode,
  end: EndNode,
};

export function WorkflowVisualizer({ tasks, workflowName }: WorkflowVisualizerProps) {
  // Generate nodes and edges from tasks
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];

    // Add start node
    nodes.push({
      id: 'start',
      type: 'start',
      position: { x: 250, y: 50 },
      data: {},
      sourcePosition: Position.Bottom,
    });

    // Add task nodes
    const sortedTasks = [...tasks].sort((a, b) => a.position - b.position);
    sortedTasks.forEach((task, index) => {
      const nodeId = `task-${task.id}`;
      
      // Position nodes vertically with some horizontal offset for variety
      const xOffset = index % 2 === 0 ? 0 : 100;
      nodes.push({
        id: nodeId,
        type: 'task',
        position: { x: 200 + xOffset, y: 180 + (index * 250) },
        data: {
          ...task,
          agents: task.agents || [],
          tools: task.tools || [],
          rags: task.rags || [],
        },
        sourcePosition: Position.Bottom,
        targetPosition: Position.Top,
      });

      // Add edge from previous node
      if (index === 0) {
        edges.push({
          id: `start-${nodeId}`,
          source: 'start',
          target: nodeId,
          animated: true,
          style: { stroke: '#10b981', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#10b981',
          },
        });
      } else {
        const prevNodeId = `task-${sortedTasks[index - 1].id}`;
        edges.push({
          id: `${prevNodeId}-${nodeId}`,
          source: prevNodeId,
          target: nodeId,
          animated: true,
          style: { stroke: '#3b82f6', strokeWidth: 2 },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: '#3b82f6',
          },
        });
      }
    });

    // Add end node
    if (sortedTasks.length > 0) {
      const lastTaskId = `task-${sortedTasks[sortedTasks.length - 1].id}`;
      const lastY = 180 + (sortedTasks.length * 250);
      
      nodes.push({
        id: 'end',
        type: 'end',
        position: { x: 250, y: lastY + 100 },
        data: {},
        targetPosition: Position.Top,
      });

      edges.push({
        id: `${lastTaskId}-end`,
        source: lastTaskId,
        target: 'end',
        animated: true,
        style: { stroke: '#ef4444', strokeWidth: 2 },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: '#ef4444',
        },
      });
    }

    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[800px] border rounded-lg bg-gray-50">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls />
        <MiniMap 
          nodeColor={(node) => {
            if (node.type === 'start') return '#10b981';
            if (node.type === 'end') return '#ef4444';
            return '#3b82f6';
          }}
          maskColor="rgb(240, 240, 240, 0.8)"
        />
      </ReactFlow>
    </div>
  );
}


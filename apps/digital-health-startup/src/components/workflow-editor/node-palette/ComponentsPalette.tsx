'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import {
  CheckSquare,
  GitBranch,
  RefreshCw,
  Layers,
  Bot,
  Database,
  Cloud,
  Users,
} from 'lucide-react';

interface NodeType {
  type: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  color: string;
}

const NODE_TYPES: NodeType[] = [
  {
    type: 'task',
    icon: <CheckSquare className="w-5 h-5" />,
    label: 'Task',
    description: 'Standard workflow task',
    color: 'blue',
  },
  {
    type: 'conditional',
    icon: <GitBranch className="w-5 h-5" />,
    label: 'Conditional',
    description: 'If/Then decision point',
    color: 'orange',
  },
  {
    type: 'loop',
    icon: <RefreshCw className="w-5 h-5" />,
    label: 'Loop',
    description: 'Repeat tasks multiple times',
    color: 'pink',
  },
  {
    type: 'parallel-task',
    icon: <Layers className="w-5 h-5" />,
    label: 'Parallel Tasks',
    description: 'Execute multiple tasks simultaneously',
    color: 'purple',
  },
  {
    type: 'agent',
    icon: <Bot className="w-5 h-5" />,
    label: 'AI Agent',
    description: 'Intelligent agent task',
    color: 'indigo',
  },
  {
    type: 'rag',
    icon: <Database className="w-5 h-5" />,
    label: 'RAG Query',
    description: 'Retrieve and generate',
    color: 'cyan',
  },
  {
    type: 'human-review',
    icon: <Users className="w-5 h-5" />,
    label: 'Human Review',
    description: 'Requires human approval',
    color: 'green',
  },
  {
    type: 'api',
    icon: <Cloud className="w-5 h-5" />,
    label: 'API Call',
    description: 'External API integration',
    color: 'gray',
  },
];

interface ComponentsPaletteProps {
  onDragStart: (event: React.DragEvent, nodeType: string) => void;
  className?: string;
}

export function ComponentsPalette({ onDragStart, className }: ComponentsPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const filteredNodes = NODE_TYPES.filter(
    (node) =>
      node.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      node.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className={className}>
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search components..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Node Types */}
      <div className="p-4 space-y-2 max-h-[calc(100vh-200px)] overflow-y-auto">
        {filteredNodes.map((node) => (
          <div
            key={node.type}
            className="group flex items-start gap-3 p-3 rounded-lg border bg-background cursor-move hover:bg-accent hover:border-accent-foreground transition-all hover:shadow-sm"
            draggable
            onDragStart={(e) => onDragStart(e, node.type)}
          >
            <div
              className={`p-2 rounded-md bg-${node.color}-100 text-${node.color}-600 group-hover:scale-110 transition-transform`}
            >
              {node.icon}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{node.label}</p>
              <p className="text-xs text-muted-foreground line-clamp-2">{node.description}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


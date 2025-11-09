'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Bot, Database, Wrench } from 'lucide-react';
import { AgentLibrary } from '../libraries/AgentLibrary';
import { RAGLibrary } from '../libraries/RAGLibrary';
import { ToolLibrary } from '../libraries/ToolLibrary';

interface LibraryPaletteProps {
  onDragLibraryItem: (event: React.DragEvent, type: string, data: any) => void;
  className?: string;
}

export function LibraryPalette({ onDragLibraryItem, className }: LibraryPaletteProps) {
  const [activeTab, setActiveTab] = useState('agents');

  const handleAgentDrag = (event: React.DragEvent, agent: any) => {
    onDragLibraryItem(event, 'agent', agent);
  };

  const handleRAGDrag = (event: React.DragEvent, rag: any) => {
    onDragLibraryItem(event, 'rag', rag);
  };

  const handleToolDrag = (event: React.DragEvent, tool: any) => {
    onDragLibraryItem(event, 'tool', tool);
  };

  return (
    <div className={className}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="w-full grid grid-cols-3 m-4 mb-2">
          <TabsTrigger value="agents" className="text-xs">
            <Bot className="w-3 h-3 mr-1" />
            Agents
          </TabsTrigger>
          <TabsTrigger value="rags" className="text-xs">
            <Database className="w-3 h-3 mr-1" />
            RAGs
          </TabsTrigger>
          <TabsTrigger value="tools" className="text-xs">
            <Wrench className="w-3 h-3 mr-1" />
            Tools
          </TabsTrigger>
        </TabsList>

        <TabsContent value="agents" className="mt-0">
          <AgentLibrary onDragStart={handleAgentDrag} />
        </TabsContent>

        <TabsContent value="rags" className="mt-0">
          <RAGLibrary onDragStart={handleRAGDrag} />
        </TabsContent>

        <TabsContent value="tools" className="mt-0">
          <ToolLibrary onDragStart={handleToolDrag} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


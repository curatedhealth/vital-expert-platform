'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Layers, Sparkles } from 'lucide-react';
import { ComponentsPalette } from './ComponentsPalette';
import { LibraryPalette } from './LibraryPalette';

interface NodePaletteProps {
  onNodeDragStart?: (event: React.DragEvent, nodeType: string) => void;
  onLibraryDragStart?: (event: React.DragEvent, type: string, data: any) => void;
}

export function NodePalette({ onNodeDragStart, onLibraryDragStart }: NodePaletteProps) {
  const [activeTab, setActiveTab] = useState('components');

  const handleNodeDrag = (event: React.DragEvent, nodeType: string) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onNodeDragStart?.(event, nodeType);
  };

  const handleLibraryDrag = (event: React.DragEvent, type: string, data: any) => {
    event.dataTransfer.setData('application/reactflow', type);
    event.dataTransfer.setData(`${type}-data`, JSON.stringify(data));
    event.dataTransfer.effectAllowed = 'move';
    onLibraryDragStart?.(event, type, data);
  };

  return (
    <div className="w-72 border-r bg-muted/10 flex flex-col">
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="font-semibold text-lg mb-1">Components</h2>
        <p className="text-xs text-muted-foreground">Drag to canvas</p>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
        <TabsList className="w-full grid grid-cols-2 m-4 mb-0">
          <TabsTrigger value="components">
            <Layers className="w-4 h-4 mr-2" />
            Components
          </TabsTrigger>
          <TabsTrigger value="library">
            <Sparkles className="w-4 h-4 mr-2" />
            Library
          </TabsTrigger>
        </TabsList>

        {/* Components Tab */}
        <TabsContent value="components" className="flex-1 mt-0">
          <ComponentsPalette onDragStart={handleNodeDrag} />
        </TabsContent>

        {/* Library Tab */}
        <TabsContent value="library" className="flex-1 mt-0">
          <LibraryPalette onDragLibraryItem={handleLibraryDrag} />
        </TabsContent>
      </Tabs>
    </div>
  );
}


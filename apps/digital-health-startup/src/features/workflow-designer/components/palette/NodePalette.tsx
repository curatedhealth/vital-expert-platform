/**
 * Node Palette Component
 * 
 * Draggable palette of node types for the workflow designer
 */

'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Sparkles } from 'lucide-react';
import { 
  NODE_TYPE_DEFINITIONS, 
  NODE_PALETTE_CATEGORIES,
  getNodeTypesByCategory 
} from '../../constants/node-types';
import type { NodeType } from '../../types/workflow';

interface NodePaletteProps {
  onDragStart?: (nodeType: NodeType) => void;
  disabled?: boolean;
}

export function NodePalette({ onDragStart, disabled = false }: NodePaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const handleDragStart = (event: React.DragEvent, nodeType: NodeType) => {
    event.dataTransfer.setData('application/reactflow', nodeType);
    event.dataTransfer.effectAllowed = 'move';
    onDragStart?.(nodeType);
  };

  const filteredNodeTypes = Object.values(NODE_TYPE_DEFINITIONS).filter(nodeDef => {
    const matchesSearch = searchQuery === '' || 
      nodeDef.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nodeDef.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || nodeDef.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <CardTitle className="text-base">Node Palette</CardTitle>
        </div>
        
        {/* Search */}
        <div className="relative mt-2">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search nodes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
            disabled={disabled}
          />
        </div>
      </CardHeader>

      <CardContent className="p-3">
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-auto mb-3">
            <TabsTrigger value="all" className="text-xs">All</TabsTrigger>
            <TabsTrigger value="agent" className="text-xs">Agents</TabsTrigger>
          </TabsList>
          <TabsList className="grid w-full grid-cols-3 h-auto mb-3">
            <TabsTrigger value="flow" className="text-xs">Flow</TabsTrigger>
            <TabsTrigger value="tool" className="text-xs">Tools</TabsTrigger>
            <TabsTrigger value="control" className="text-xs">Control</TabsTrigger>
          </TabsList>

          <div className="space-y-2 max-h-[calc(100vh-300px)] overflow-y-auto">
            {filteredNodeTypes.map((nodeDef) => {
              const Icon = nodeDef.icon;
              
              return (
                <div
                  key={nodeDef.type}
                  draggable={!disabled}
                  onDragStart={(e) => handleDragStart(e, nodeDef.type)}
                  className={`
                    group relative flex items-center gap-3 p-3 rounded-lg border-2
                    transition-all duration-200
                    ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-grab active:cursor-grabbing hover:shadow-md'}
                  `}
                  style={{
                    backgroundColor: nodeDef.bgColor,
                    borderColor: nodeDef.borderColor,
                  }}
                >
                  {/* Icon */}
                  <div 
                    className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ backgroundColor: `${nodeDef.color}20` }}
                  >
                    <Icon 
                      className="w-5 h-5" 
                      style={{ color: nodeDef.color }}
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold text-sm text-gray-900">
                        {nodeDef.label}
                      </p>
                      <Badge 
                        variant="outline" 
                        className="text-[10px] px-1 py-0"
                      >
                        {nodeDef.category}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mt-0.5 line-clamp-2">
                      {nodeDef.description}
                    </p>
                  </div>

                  {/* Drag Indicator */}
                  {!disabled && (
                    <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-0.5">
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                        <div className="w-1 h-1 rounded-full bg-gray-400"></div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {filteredNodeTypes.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <p className="text-sm">No nodes found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </Tabs>

        {/* Info */}
        <div className="mt-4 p-2 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-xs text-blue-800">
            <strong>Tip:</strong> Drag nodes onto the canvas to add them to your workflow
          </p>
        </div>
      </CardContent>
    </Card>
  );
}


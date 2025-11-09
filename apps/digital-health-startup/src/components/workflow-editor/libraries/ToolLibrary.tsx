'use client';

import { useState, useEffect } from 'react';
import { Wrench } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search } from 'lucide-react';

interface Tool {
  id: string;
  unique_id: string;
  name: string;
  category?: string;
  tool_type?: string;
  description?: string;
}

interface ToolLibraryProps {
  onDragStart: (event: React.DragEvent, tool: Tool) => void;
  className?: string;
}

export function ToolLibrary({ onDragStart, className }: ToolLibraryProps) {
  const [tools, setTools] = useState<Tool[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchTools = async () => {
      try {
        const response = await fetch('/api/workflows/tools');
        if (response.ok) {
          const { tools } = await response.json();
          setTools(tools || []);
          
          // Extract unique categories
          const uniqueCategories = Array.from(
            new Set(tools.map((t: Tool) => t.category).filter(Boolean))
          ) as string[];
          setCategories(uniqueCategories);
        }
      } catch (error) {
        console.error('Error fetching tools:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTools();
  }, []);

  const filteredTools = tools.filter((tool) => {
    const matchesSearch = tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tool.category?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || tool.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading tools...</p>
      </div>
    );
  }

  return (
    <div className={className}>
      {/* Search */}
      <div className="p-4 pb-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search tools..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedCategory === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedCategory(null)}
              className="text-xs h-7"
            >
              All ({tools.length})
            </Button>
            {categories.map((category) => {
              const count = tools.filter((t) => t.category === category).length;
              return (
                <Button
                  key={category}
                  variant={selectedCategory === category ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedCategory(category)}
                  className="text-xs h-7"
                >
                  {category} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Tool List */}
      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredTools.length} tool{filteredTools.length !== 1 ? 's' : ''} available
          </p>
          {filteredTools.map((tool) => (
            <div
              key={tool.id}
              className="flex items-start gap-3 p-3 rounded-lg border bg-background cursor-move hover:bg-accent hover:border-accent-foreground transition-all"
              draggable
              onDragStart={(e) => onDragStart(e, tool)}
            >
              <div className="p-2 rounded-md bg-gray-100 text-gray-600">
                <Wrench className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium">{tool.name}</p>
                <p className="text-xs text-muted-foreground">{tool.category || tool.tool_type}</p>
              </div>
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


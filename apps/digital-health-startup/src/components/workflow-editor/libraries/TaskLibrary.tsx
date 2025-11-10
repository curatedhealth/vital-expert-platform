'use client';

import { useState, useEffect } from 'react';
import { CheckSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Search } from 'lucide-react';

interface Task {
  id: string;
  unique_id: string;
  code: string;
  title: string;
  objective: string;
  complexity?: string;
  estimated_duration_minutes?: number;
}

interface TaskLibraryProps {
  onDragStart: (event: React.DragEvent, task: Task) => void;
  className?: string;
}

const COMPLEXITY_COLORS: Record<string, string> = {
  BEGINNER: 'bg-green-100 text-green-700 border-green-200',
  INTERMEDIATE: 'bg-blue-100 text-blue-700 border-blue-200',
  ADVANCED: 'bg-orange-100 text-orange-700 border-orange-200',
  EXPERT: 'bg-red-100 text-red-700 border-red-200',
};

export function TaskLibrary({ onDragStart, className }: TaskLibraryProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [complexities, setComplexities] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplexity, setSelectedComplexity] = useState<string | null>(null);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        // Fetch all tasks from dh_task table
        const response = await fetch('/api/workflows/tasks');
        if (response.ok) {
          const { tasks } = await response.json();
          setTasks(tasks || []);
          
          // Extract unique complexities
          const uniqueComplexities = Array.from(
            new Set(
              tasks
                .map((t: Task) => t.complexity)
                .filter(Boolean)
            )
          ) as string[];
          setComplexities(uniqueComplexities);
        }
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.objective?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.code?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesComplexity = !selectedComplexity || task.complexity === selectedComplexity;
    return matchesSearch && matchesComplexity;
  });

  if (loading) {
    return (
      <div className="p-4">
        <p className="text-sm text-muted-foreground">Loading tasks...</p>
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
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Complexity Filter */}
      {complexities.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-1">
            <Button
              variant={selectedComplexity === null ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedComplexity(null)}
              className="text-xs h-7"
            >
              All ({tasks.length})
            </Button>
            {complexities.map((complexity) => {
              const count = tasks.filter((t) => t.complexity === complexity).length;
              return (
                <Button
                  key={complexity}
                  variant={selectedComplexity === complexity ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSelectedComplexity(complexity)}
                  className="text-xs h-7"
                >
                  {complexity} ({count})
                </Button>
              );
            })}
          </div>
        </div>
      )}

      {/* Task List */}
      <ScrollArea className="h-[calc(100vh-380px)]">
        <div className="p-4 space-y-2">
          <p className="text-xs text-muted-foreground mb-3">
            {filteredTasks.length} task{filteredTasks.length !== 1 ? 's' : ''} available
          </p>
          {filteredTasks.map((task) => (
            <Card
              key={task.id}
              className="cursor-move hover:shadow-md hover:border-vital-primary-300 transition-all"
              draggable
              onDragStart={(e) => onDragStart(e, task)}
            >
              <CardHeader className="p-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 flex-1 min-w-0">
                    <div className="p-1.5 rounded-md bg-blue-100 text-blue-600 flex-shrink-0">
                      <CheckSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <CardTitle className="text-sm font-semibold line-clamp-1">
                        {task.title}
                      </CardTitle>
                      <CardDescription className="text-xs line-clamp-2 mt-1">
                        {task.objective}
                      </CardDescription>
                    </div>
                  </div>
                  {task.complexity && (
                    <Badge
                      variant="outline"
                      className={`text-xs px-1.5 py-0.5 flex-shrink-0 ${
                        COMPLEXITY_COLORS[task.complexity] || 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {task.complexity}
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-3 pt-0">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span className="font-mono">{task.code}</span>
                  {task.estimated_duration_minutes && (
                    <span>{task.estimated_duration_minutes} min</span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}


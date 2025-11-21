import React, { useState, useEffect } from 'react';
import { Merge, Plus, Minus } from 'lucide-react';
import { TaskDefinition, TASK_DEFINITIONS } from './TaskLibrary';
import { TaskBuilder } from './TaskBuilder';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TaskCombinerProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskDefinition) => void;
  availableTasks?: TaskDefinition[];
  openaiApiKey?: string;
}

export const TaskCombiner: React.FC<TaskCombinerProps> = ({
  isOpen,
  onClose,
  onSave,
  availableTasks = TASK_DEFINITIONS,
  openaiApiKey,
}) => {
  const [selectedTasks, setSelectedTasks] = useState<TaskDefinition[]>([]);
  const [showBuilder, setShowBuilder] = useState(false);
  const [combinedTask, setCombinedTask] = useState<TaskDefinition | null>(null);
  const [isGeneratingName, setIsGeneratingName] = useState(false);

  // Helper function to generate AI name for combined tasks
  const generateCombinedTaskName = async (taskNames: string[]): Promise<string> => {
    if (!openaiApiKey || openaiApiKey.length < 20) {
      // Fallback to simple concatenation if no API key
      return taskNames.join(' + ');
    }

    try {
      setIsGeneratingName(true);
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${openaiApiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are a helpful assistant that creates concise, descriptive names for combined workflow tasks. Generate a single, clear name (2-4 words) that captures the essence of the combined tasks.',
            },
            {
              role: 'user',
              content: `Generate a concise name for a combined task that includes these tasks: ${taskNames.join(', ')}. Return only the name, no explanation.`,
            },
          ],
          temperature: 0.7,
          max_tokens: 20,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate name');
      }

      const data = await response.json();
      const generatedName = data.choices[0]?.message?.content?.trim();
      
      if (generatedName && generatedName.length > 0 && generatedName.length < 50) {
        return generatedName;
      }
    } catch (error) {
      console.warn('Failed to generate AI name, using fallback:', error);
    } finally {
      setIsGeneratingName(false);
    }

    // Fallback to simple concatenation
    return taskNames.join(' + ');
  };

  useEffect(() => {
    if (selectedTasks.length > 0) {
      // Generate combined task with AI name
      const generateCombined = async () => {
        const taskNames = selectedTasks.map(t => t.name);
        const combinedName = await generateCombinedTaskName(taskNames);
        
        const combined: TaskDefinition = {
          id: `combined_${Date.now()}`,
          name: combinedName,
          description: `Combined task merging: ${selectedTasks.map(t => t.name).join(', ')}`,
          icon: selectedTasks[0]?.icon || '🔗',
          category: 'Custom',
          config: {
            model: selectedTasks[0]?.config?.model || 'gpt-4o-mini',
            temperature: selectedTasks.reduce((sum, t) => sum + (t.config?.temperature ?? 0.7), 0) / selectedTasks.length,
            systemPrompt: selectedTasks.map(t => t.config?.systemPrompt || '').filter(Boolean).join('\n\n'),
            tools: [...new Set(selectedTasks.flatMap(t => t.config?.tools || []))],
            agents: [...new Set(selectedTasks.flatMap(t => t.config?.agents || []))],
            rags: [...new Set(selectedTasks.flatMap(t => t.config?.rags || []))],
          },
        };
        setCombinedTask(combined);
      };
      
      generateCombined();
    } else {
      setCombinedTask(null);
    }
  }, [selectedTasks, openaiApiKey]);

  const handleAddTask = (task: TaskDefinition) => {
    if (!selectedTasks.find(t => t.id === task.id)) {
      setSelectedTasks([...selectedTasks, task]);
    }
  };

  const handleRemoveTask = (taskId: string) => {
    setSelectedTasks(selectedTasks.filter(t => t.id !== taskId));
  };

  const handleSaveCombined = (task: TaskDefinition) => {
    onSave(task);
    setShowBuilder(false);
    setSelectedTasks([]);
    setCombinedTask(null);
    onClose();
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0">
          <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-green-500 to-green-600 text-white">
            <DialogTitle className="flex items-center gap-2 text-white">
              <Merge size={20} />
              Combine Tasks
            </DialogTitle>
            <DialogDescription className="text-white/90">
              Select multiple tasks to combine into a new composite task
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto px-6 py-4">
            <Card className="mb-6 bg-muted/50">
              <CardContent className="pt-6">
                <p className="text-sm text-muted-foreground">
                  Select multiple tasks to combine into a new composite task. The combined task will merge all tools, agents, and configurations.
                </p>
              </CardContent>
            </Card>

            {/* Selected Tasks */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide">
                  Selected Tasks ({selectedTasks.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedTasks.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground italic">
                    <p>No tasks selected. Choose tasks from the list below.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {selectedTasks.map((task) => (
                      <div key={task.id} className="flex items-center gap-4 p-4 bg-muted/50 border-2 border-primary rounded-lg">
                        <span className="text-2xl">{task.icon}</span>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{task.name}</div>
                          <div className="text-sm text-gray-600 uppercase">{task.category}</div>
                        </div>
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleRemoveTask(task.id)}
                          title="Remove task"
                        >
                          <Minus size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Available Tasks */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="text-sm uppercase tracking-wide">Available Tasks</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {availableTasks.map((task) => {
                    const isSelected = selectedTasks.some(t => t.id === task.id);
                    return (
                      <Button
                        key={task.id}
                        type="button"
                        variant={isSelected ? "default" : "outline"}
                        className={`h-auto flex-col p-4 relative ${isSelected ? 'bg-primary text-primary-foreground' : ''}`}
                        onClick={() => isSelected ? handleRemoveTask(task.id) : handleAddTask(task)}
                        disabled={isSelected}
                      >
                        <span className="text-3xl mb-2">{task.icon}</span>
                        <div className="text-center w-full">
                          <div className="font-semibold text-sm mb-1">{task.name}</div>
                          <div className="text-xs opacity-80 uppercase">{task.category}</div>
                        </div>
                        {isSelected && (
                          <Badge className="absolute top-2 right-2 bg-white text-primary">✓</Badge>
                        )}
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Preview Combined Task */}
            {combinedTask && (
              <Card className="mb-6 border-2 border-green-500">
                <CardHeader>
                  <CardTitle className="text-sm uppercase tracking-wide flex items-center gap-2">
                    Combined Task Preview
                    {isGeneratingName && <span className="text-primary animate-pulse">✨ Generating name...</span>}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4 mb-4 pb-4 border-b">
                    <span className="text-4xl">{combinedTask.icon}</span>
                    <div className="flex-1">
                      <div className="text-xl font-semibold text-gray-900 mb-2">{combinedTask.name}</div>
                      <div className="text-sm text-gray-600">{combinedTask.description}</div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2 text-sm">
                      <strong className="min-w-[80px]">Model:</strong> <span>{combinedTask.config?.model}</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <strong className="min-w-[80px]">Tools:</strong> <span>{combinedTask.config?.tools?.length || 0} tool(s)</span>
                    </div>
                    <div className="flex gap-2 text-sm">
                      <strong className="min-w-[80px]">Agents:</strong> <span>{combinedTask.config?.agents?.length || 0} agent(s)</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          <DialogFooter className="px-6 py-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button
              onClick={() => setShowBuilder(true)}
              disabled={selectedTasks.length === 0}
            >
              <Plus size={16} className="mr-2" />
              Customize & Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Task Builder for final customization */}
      {showBuilder && combinedTask && (
        <TaskBuilder
          isOpen={showBuilder}
          onClose={() => setShowBuilder(false)}
          onSave={handleSaveCombined}
          initialTask={combinedTask}
          title="Customize Combined Task"
        />
      )}
    </>
  );
};



import React, { useState, useEffect } from 'react';
import { Search, Sparkles, X, Save, Plus } from 'lucide-react';
import { TaskDefinition, TASK_DEFINITIONS } from './TaskLibrary';
import { MultiSelect } from './MultiSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface NodePaletteProps {
  onTaskDragStart: (task: TaskDefinition, event: React.DragEvent) => void;
  onConfigureTask?: (task: TaskDefinition, options?: { userPrompt?: string; agents?: string[]; rags?: string[] }) => void;
  onCreateTask?: () => void;
  onCombineTasks?: () => void;
  onClose?: () => void;
}

export const NodePalette: React.FC<NodePaletteProps> = ({ 
  onTaskDragStart, 
  onConfigureTask, 
  onCreateTask,
  onCombineTasks,
  onClose 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [configTask, setConfigTask] = useState<TaskDefinition | null>(null);
  
  // Get custom tasks from localStorage
  const [customTasks, setCustomTasks] = useState<TaskDefinition[]>(() => {
    try {
      const stored = localStorage.getItem('custom_tasks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  
  // Listen for storage changes to refresh custom tasks
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const stored = localStorage.getItem('custom_tasks');
        if (stored) {
          setCustomTasks(JSON.parse(stored));
        }
      } catch {
        // Ignore errors
      }
    };

    // Listen for storage events (when custom tasks are saved from other tabs)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom event (when custom tasks are saved in same tab)
    window.addEventListener('customTasksUpdated', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('customTasksUpdated', handleStorageChange);
    };
  }, [customTasks]);
  
  // Combine predefined and custom tasks
  const allTasks = [...TASK_DEFINITIONS, ...customTasks];
  const [configData, setConfigData] = useState<{ name: string; description: string; model: string; temperature: number; systemPrompt: string; tools: string[]; userPrompt: string; agents: string[]; rags: string[] }>({
    name: '',
    description: '',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    systemPrompt: '',
    tools: [],
    userPrompt: '',
    agents: [],
    rags: [],
  });

  const availableAgents = [
    { id: 'medical', name: 'Medical Research Agent', description: 'Clinical trials, drug mechanisms, efficacy, safety data' },
    { id: 'digital_health', name: 'Digital Health Agent', description: 'Health tech innovations, digital therapeutics, AI/ML' },
    { id: 'regulatory', name: 'Regulatory Agent', description: 'FDA/EMA approvals, compliance, regulatory pathways' },
    { id: 'aggregator', name: 'Aggregator Agent', description: 'Synthesizes findings and archives to RAG' },
    { id: 'copywriter', name: 'Copywriter Agent', description: 'Generates professional reports' },
  ];

  const availableTools = [
    { id: 'pubmed', name: 'PubMed', description: 'Search PubMed/MEDLINE for peer-reviewed research' },
    { id: 'clinical_trials', name: 'Clinical Trials', description: 'Search ClinicalTrials.gov for trial data' },
    { id: 'fda', name: 'FDA Search', description: 'Search FDA database for approvals and compliance' },
    { id: 'web_search', name: 'Web Search', description: 'Search the web for general information' },
    { id: 'arxiv', name: 'ArXiv', description: 'Search ArXiv for research papers' },
    { id: 'scraper', name: 'Web Scraper', description: 'Scrape content from URLs' },
  ];

  const availableRAGs = [
    { id: 'rag_search', name: 'RAG Search', description: 'Query internal knowledge base using RAG' },
    { id: 'rag_archive', name: 'RAG Archive', description: 'Archive data to knowledge base' },
  ];

  // Filter tasks based on search and category
  const filteredTasks = allTasks.filter((task) => {
    const matchesSearch = searchQuery === '' || 
      task.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesCategory = activeCategory === 'all' || task.category === activeCategory;
    
    return matchesSearch && matchesCategory;
  });

  // Get color for category
  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Research':
        return { color: '#3b82f6', bgColor: '#dbeafe', borderColor: '#93c5fd' };
      case 'Regulatory':
        return { color: '#8b5cf6', bgColor: '#ede9fe', borderColor: '#c4b5fd' };
      case 'Data':
        return { color: '#10b981', bgColor: '#d1fae5', borderColor: '#6ee7b7' };
      case 'Analysis':
        return { color: '#f59e0b', bgColor: '#fef3c7', borderColor: '#fcd34d' };
      case 'Control Flow':
        return { color: '#06b6d4', bgColor: '#cffafe', borderColor: '#67e8f9' };
      case 'Panel':
        return { color: '#ec4899', bgColor: '#fce7f3', borderColor: '#f9a8d4' };
      default:
        return { color: '#6b7280', bgColor: '#f3f4f6', borderColor: '#d1d5db' };
    }
  };

  const openConfig = (task: TaskDefinition) => {
    setConfigTask(task);
    setConfigData({
      name: task.name,
      description: task.description,
      model: task.config.model || 'gpt-4o-mini',
      temperature: task.config.temperature ?? 0.7,
      systemPrompt: task.config.systemPrompt || '',
      tools: task.config.tools || [],
      userPrompt: '',
      agents: task.config.agents || [],
      rags: task.config.rags || [],
    });
  };

  const saveConfig = () => {
    if (!configTask) return;
    const updated: TaskDefinition = {
      ...configTask,
      name: configData.name,
      description: configData.description,
      config: {
        ...configTask.config,
        model: configData.model,
        temperature: configData.temperature,
        systemPrompt: configData.systemPrompt,
        tools: configData.tools,
        agents: configData.agents,
        rags: configData.rags,
      }
    };
    onConfigureTask?.(updated, { userPrompt: configData.userPrompt, agents: configData.agents, rags: configData.rags });
    setConfigTask(null);
  };

  return (
    <div className="flex flex-col h-full w-64 bg-white border-r border-gray-200" style={{ maxHeight: '100%', overflow: 'hidden' }}>
      {/* Header */}
      <div className="p-2 border-b border-gray-200 space-y-2 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <Sparkles className="text-primary" size={16} />
            <h2 className="text-sm font-semibold">Palette</h2>
          </div>
          {onClose && (
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onClose} title="Close Palette">
              <X size={14} />
            </Button>
          )}
        </div>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={14} />
          <Input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-7 h-8 text-xs"
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={onCreateTask}
            title="Create custom task"
            className="flex-1 h-7 text-xs px-2"
          >
            <Plus size={12} className="mr-1" />
            Create
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onCombineTasks}
            title="Combine multiple tasks"
            className="flex-1 h-7 text-xs px-2"
          >
            <Save size={12} className="mr-1" />
            Combine
          </Button>
        </div>
      </div>

      {/* Content - Scrollable area */}
      <div 
        className="flex-1 p-2 space-y-2" 
        style={{ 
          minHeight: 0, 
          height: '100%',
          overflowY: 'scroll',
          overflowX: 'hidden',
          WebkitOverflowScrolling: 'touch',
          position: 'relative'
        }}
      >
        {/* Category Tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory} className="w-full">
          <TabsList className="grid w-full grid-cols-3 h-7">
            <TabsTrigger value="all" className="text-xs px-1">All</TabsTrigger>
            <TabsTrigger value="Research" className="text-xs px-1">Research</TabsTrigger>
            <TabsTrigger value="Regulatory" className="text-xs px-1">Reg</TabsTrigger>
          </TabsList>
          <div className="mt-1">
            <TabsList className="grid w-full grid-cols-3 h-7">
              <TabsTrigger value="Data" className="text-xs px-1">Data</TabsTrigger>
              <TabsTrigger value="Analysis" className="text-xs px-1">Analysis</TabsTrigger>
              <TabsTrigger value="Control Flow" className="text-xs px-1">Control</TabsTrigger>
            </TabsList>
          </div>
          <div className="mt-1">
            <TabsList className="w-full h-7">
              <TabsTrigger value="Panel" className="flex-1 text-xs px-1">Panel</TabsTrigger>
            </TabsList>
          </div>
        </Tabs>

        {/* Node List */}
        <div className="space-y-1.5">
          {filteredTasks.map((task) => {
            const categoryColors = getCategoryColor(task.category);
            
            return (
              <Card
                key={task.id}
                draggable
                onDragStart={(e) => onTaskDragStart(task, e)}
                onClick={() => openConfig(task)}
                className={cn(
                  "cursor-pointer transition-all hover:shadow-md hover:scale-[1.02]",
                  "border-2"
                )}
                style={{
                  backgroundColor: categoryColors.bgColor,
                  borderColor: categoryColors.borderColor,
                }}
              >
                <CardContent className="p-2">
                  <div className="flex items-start gap-2">
                    {/* Icon */}
                    <div 
                      className="flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ 
                        backgroundColor: `${categoryColors.color}20`,
                        color: categoryColors.color,
                      }}
                    >
                      {task.icon}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-1 mb-0.5">
                        <p className="font-medium text-xs text-gray-900 truncate">{task.name}</p>
                      </div>
                      <p className="text-[10px] text-gray-600 line-clamp-1">{task.description}</p>
                      <Badge 
                        variant="outline"
                        className="text-[10px] mt-0.5 px-1 py-0 h-4"
                        style={{
                          color: categoryColors.color,
                          borderColor: categoryColors.borderColor,
                        }}
                      >
                        {task.category}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {filteredTasks.length === 0 && (
            <div className="text-center py-4 text-gray-500">
              <p className="font-medium text-xs">No nodes found</p>
              <p className="text-[10px] mt-1">Try a different search</p>
            </div>
          )}
        </div>

        {/* Info Tip */}
        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded text-[10px] text-blue-800">
          <strong>Tip:</strong> Drag nodes to canvas or click to configure
        </div>
      </div>

      {/* Config Modal */}
      <Dialog open={!!configTask} onOpenChange={(open) => !open && setConfigTask(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Configure Task</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Task Name</Label>
              <Input
                type="text"
                value={configData.name}
                onChange={(e) => setConfigData({ ...configData, name: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                rows={3}
                value={configData.description}
                onChange={(e) => setConfigData({ ...configData, description: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>User Prompt (optional)</Label>
              <Textarea
                rows={3}
                placeholder="Add a user prompt to be passed at execution time"
                value={configData.userPrompt}
                onChange={(e) => setConfigData({ ...configData, userPrompt: e.target.value })}
              />
              <p className="text-xs text-gray-500">Controls output format and specific instructions for this task</p>
            </div>

            <div className="space-y-2">
              <MultiSelect
                label="Assigned Agents"
                options={availableAgents}
                selected={configData.agents}
                onChange={(selected) => setConfigData({ ...configData, agents: selected })}
                placeholder="Select agents..."
                hint="Select which agents should handle this task. Leave empty to use orchestrator's default assignment."
              />
            </div>

            <div className="space-y-2">
              <Label>Model</Label>
              <Select value={configData.model} onValueChange={(value) => setConfigData({ ...configData, model: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="gpt-4o">GPT-4o</SelectItem>
                  <SelectItem value="gpt-4o-mini">GPT-4o Mini</SelectItem>
                  <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                  <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Temperature: {configData.temperature}</Label>
              <Slider
                min={0}
                max={2}
                step={0.1}
                value={[configData.temperature]}
                onValueChange={(value) => setConfigData({ ...configData, temperature: value[0] })}
              />
            </div>

            <div className="space-y-2">
              <MultiSelect
                label="Tools"
                options={availableTools}
                selected={configData.tools}
                onChange={(selected) => setConfigData({ ...configData, tools: selected })}
                placeholder="Select tools..."
                hint="Choose which tools this task can use"
              />
            </div>

            <div className="space-y-2">
              <MultiSelect
                label="RAG Options"
                options={availableRAGs}
                selected={configData.rags || []}
                onChange={(selected) => setConfigData({ ...configData, rags: selected })}
                placeholder="Select RAG options..."
                hint="Choose RAG search or archive capabilities"
              />
            </div>
          </div>

          <DialogFooter>
            <Button onClick={saveConfig}>
              <Save size={16} className="mr-2" />
              Add to Canvas
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

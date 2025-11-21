import React, { useState, useEffect } from 'react';
import { Save, Sparkles } from 'lucide-react';
import { TaskDefinition } from './TaskLibrary';
import { MultiSelect } from './MultiSelect';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface TaskBuilderProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: TaskDefinition) => void;
  initialTask?: TaskDefinition | null;
  title?: string;
}

const AVAILABLE_ICONS = ['🔬', '🏥', '⚖️', '🌐', '📚', '💾', '📊', '🔍', '📝', '🎯', '🎤', '👥', '🔁', '📦', '⧉', '🔗', '🤖', '⚡', '🔧', '📋'];
const CATEGORIES = ['Research', 'Regulatory', 'Data', 'Analysis', 'Control Flow', 'Panel', 'Custom'];

export const TaskBuilder: React.FC<TaskBuilderProps> = ({
  isOpen,
  onClose,
  onSave,
  initialTask,
  title = 'Create Custom Task',
}) => {
  const [formData, setFormData] = useState({
    id: '',
    name: '',
    description: '',
    icon: '📋',
    category: 'Custom',
    model: 'gpt-4o-mini',
    temperature: 0.7,
    systemPrompt: '',
    tools: [] as string[],
    agents: [] as string[],
    rags: [] as string[],
  });

  useEffect(() => {
    if (initialTask) {
      setFormData({
        id: initialTask.id,
        name: initialTask.name,
        description: initialTask.description,
        icon: initialTask.icon,
        category: initialTask.category,
        model: initialTask.config?.model || 'gpt-4o-mini',
        temperature: initialTask.config?.temperature ?? 0.7,
        systemPrompt: initialTask.config?.systemPrompt || '',
        tools: initialTask.config?.tools || [],
        agents: initialTask.config?.agents || [],
        rags: initialTask.config?.rags || [],
      });
    } else {
      // Generate unique ID for new task
      const newId = `custom_task_${Date.now()}`;
      setFormData({
        id: newId,
        name: '',
        description: '',
        icon: '📋',
        category: 'Custom',
        model: 'gpt-4o-mini',
        temperature: 0.7,
        systemPrompt: '',
        tools: [],
        agents: [],
        rags: [],
      });
    }
  }, [initialTask, isOpen]);

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
    { id: 'rag', name: 'RAG', description: 'Query internal knowledge base using RAG' },
  ];

  const availableRAGs = [
    { id: 'rag_search', name: 'RAG Search', description: 'Query internal knowledge base using RAG' },
    { id: 'rag_archive', name: 'RAG Archive', description: 'Archive data to knowledge base' },
  ];

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!formData.name.trim()) {
      alert('Please enter a task name');
      return;
    }

    const task: TaskDefinition = {
      id: formData.id,
      name: formData.name,
      description: formData.description,
      icon: formData.icon,
      category: formData.category,
      config: {
        model: formData.model,
        temperature: formData.temperature,
        systemPrompt: formData.systemPrompt,
        tools: formData.tools,
        agents: formData.agents,
        rags: formData.rags,
      },
    };

    onSave(task);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 py-4 border-b bg-gradient-to-r from-primary to-gray-900 text-white">
          <DialogTitle className="flex items-center gap-2 text-white">
            <Sparkles size={20} />
            {title}
          </DialogTitle>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {/* Basic Information */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Basic Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-name">Task Name *</Label>
                <Input
                  id="task-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="Enter task name..."
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-description">Description</Label>
                <Textarea
                  id="task-description"
                  value={formData.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  placeholder="Enter task description..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Icon</Label>
                <div className="grid grid-cols-10 gap-2">
                  {AVAILABLE_ICONS.map((icon) => (
                    <Button
                      key={icon}
                      type="button"
                      variant={formData.icon === icon ? "default" : "outline"}
                      size="icon"
                      className="text-2xl"
                      onClick={() => handleChange('icon', icon)}
                    >
                      {icon}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-category">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleChange('category', value)}
                >
                  <SelectTrigger id="task-category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Model Configuration */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Model Configuration</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="task-model">Model</Label>
                <Select
                  value={formData.model}
                  onValueChange={(value) => handleChange('model', value)}
                >
                  <SelectTrigger id="task-model">
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
                <Label>
                  Temperature: {formData.temperature}
                </Label>
                <Slider
                  min={0}
                  max={2}
                  step={0.1}
                  value={[formData.temperature]}
                  onValueChange={(values) => handleChange('temperature', values[0])}
                  className="w-full"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="task-system-prompt">System Prompt</Label>
                <Textarea
                  id="task-system-prompt"
                  value={formData.systemPrompt}
                  onChange={(e) => handleChange('systemPrompt', e.target.value)}
                  placeholder="Enter system prompt for this task..."
                  rows={4}
                />
              </div>
            </CardContent>
          </Card>

          {/* Tools and Agents */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-sm uppercase tracking-wide">Tools & Agents</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <MultiSelect
                label="Available Tools"
                options={availableTools}
                selected={formData.tools}
                onChange={(selected) => handleChange('tools', selected)}
                placeholder="Select tools..."
                hint="Choose which tools this task can use"
              />

              <MultiSelect
                label="Assigned Agents"
                options={availableAgents}
                selected={formData.agents}
                onChange={(selected) => handleChange('agents', selected)}
                placeholder="Select agents..."
                hint="Select which agents should handle this task"
              />

              <MultiSelect
                label="RAG Options"
                options={availableRAGs}
                selected={formData.rags}
                onChange={(selected) => handleChange('rags', selected)}
                placeholder="Select RAG options..."
                hint="Choose RAG search or archive capabilities"
              />
            </CardContent>
          </Card>
        </div>

        <DialogFooter className="px-6 py-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save size={16} className="mr-2" />
            Save Task
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


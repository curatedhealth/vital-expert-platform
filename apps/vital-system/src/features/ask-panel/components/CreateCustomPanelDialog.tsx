/**
 * Create Custom Panel Dialog
 * Allows users to create custom panels based on templates
 * with custom agent selection and settings
 */

'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, X, Loader2, Sparkles } from 'lucide-react';
import { useSavedPanels } from '@/contexts/ask-panel-context';
import { PANEL_TEMPLATES } from '@/features/ask-panel/constants/panel-templates';
import type { PanelTemplate } from '@/features/ask-panel/types/agent';

interface CreateCustomPanelDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  baseTemplate?: PanelTemplate; // Optional: pre-select a template
}

export function CreateCustomPanelDialog({
  open,
  onOpenChange,
  baseTemplate,
}: CreateCustomPanelDialogProps) {
  const { createCustomPanel } = useSavedPanels();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [selectedTemplate, setSelectedTemplate] = useState<PanelTemplate | null>(baseTemplate || null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set());
  const [mode, setMode] = useState<'sequential' | 'collaborative' | 'hybrid'>('sequential');
  const [framework, setFramework] = useState<'langgraph' | 'autogen' | 'crewai'>('langgraph');
  const [availableAgents, setAvailableAgents] = useState<string[]>([]);

  // Load available agents when template is selected
  useEffect(() => {
    if (selectedTemplate) {
      setAvailableAgents(selectedTemplate.suggestedAgents || []);
      setMode(selectedTemplate.mode as any);
      setFramework(selectedTemplate.framework as any);
      setDescription(selectedTemplate.description);
      // Pre-select all agents by default
      setSelectedAgents(new Set(selectedTemplate.suggestedAgents || []));
    } else {
      setAvailableAgents([]);
      setSelectedAgents(new Set());
    }
  }, [selectedTemplate]);

  // Reset form when dialog opens/closes
  useEffect(() => {
    if (!open) {
      setSelectedTemplate(baseTemplate || null);
      setName('');
      setDescription('');
      setSelectedAgents(new Set());
      setError(null);
    }
  }, [open, baseTemplate]);

  const handleToggleAgent = (agentId: string) => {
    setSelectedAgents((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(agentId)) {
        newSet.delete(agentId);
      } else {
        newSet.add(agentId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    setSelectedAgents(new Set(availableAgents));
  };

  const handleDeselectAll = () => {
    setSelectedAgents(new Set());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      setError('Panel name is required');
      return;
    }

    if (selectedAgents.size === 0) {
      setError('Please select at least one agent');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const panel = await createCustomPanel({
        name: name.trim(),
        description: description.trim() || undefined,
        category: selectedTemplate?.category || 'panel',
        base_panel_slug: selectedTemplate?.id,
        mode,
        framework,
        selected_agents: Array.from(selectedAgents),
        custom_settings: selectedTemplate?.defaultSettings || {},
        metadata: {
          icon: selectedTemplate?.icon,
          tags: selectedTemplate?.tags || [],
          popularity: selectedTemplate?.popularity || 0,
        },
        icon: selectedTemplate?.icon,
        tags: selectedTemplate?.tags || [],
      });

      if (panel) {
        onOpenChange(false);
      } else {
        setError('Failed to create panel');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to create panel');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Create Custom Panel
          </DialogTitle>
          <DialogDescription>
            Create a custom panel based on a template. Select which experts to include and customize settings.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 min-h-0 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <Label htmlFor="template">Base Template (Optional)</Label>
                <Select
                  value={selectedTemplate?.id || 'none'}
                  onValueChange={(value) => {
                    if (value === 'none') {
                      setSelectedTemplate(null);
                    } else {
                      const template = PANEL_TEMPLATES.find((t) => t.id === value);
                      setSelectedTemplate(template || null);
                    }
                  }}
                >
                  <SelectTrigger id="template">
                    <SelectValue placeholder="Select a template or create from scratch" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Create from scratch</SelectItem>
                    {PANEL_TEMPLATES.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name} - {template.description.substring(0, 50)}...
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedTemplate && (
                  <div className="mt-2 p-3 bg-muted rounded-md">
                    <p className="text-sm font-medium">{selectedTemplate.name}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {selectedTemplate.description}
                    </p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">
                        {selectedTemplate.mode}
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {selectedTemplate.suggestedAgents.length} agents
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Panel Name */}
              <div>
                <Label htmlFor="name">Panel Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., My Clinical Trial Panel"
                  required
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Describe what this panel is for..."
                  rows={3}
                />
              </div>

              {/* Mode & Framework */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="mode">Mode</Label>
                  <Select value={mode} onValueChange={(v: any) => setMode(v)}>
                    <SelectTrigger id="mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequential">Sequential</SelectItem>
                      <SelectItem value="collaborative">Collaborative</SelectItem>
                      <SelectItem value="hybrid">Hybrid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="framework">Framework</Label>
                  <Select value={framework} onValueChange={(v: any) => setFramework(v)}>
                    <SelectTrigger id="framework">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="langgraph">LangGraph</SelectItem>
                      <SelectItem value="autogen">AutoGen</SelectItem>
                      <SelectItem value="crewai">CrewAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Agent Selection */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <Label>Select Experts ({selectedAgents.size} selected)</Label>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleSelectAll}
                      disabled={availableAgents.length === 0}
                    >
                      Select All
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleDeselectAll}
                      disabled={selectedAgents.size === 0}
                    >
                      Deselect All
                    </Button>
                  </div>
                </div>

                {availableAgents.length === 0 ? (
                  <div className="p-8 text-center border rounded-md bg-muted/50">
                    <Bot className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      {selectedTemplate
                        ? 'No agents available for this template'
                        : 'Select a template to see available agents'}
                    </p>
                  </div>
                ) : (
                  <ScrollArea className="h-[200px] border rounded-md p-4">
                    <div className="space-y-2">
                      {availableAgents.map((agentId) => {
                        const isSelected = selectedAgents.has(agentId);
                        return (
                          <div
                            key={agentId}
                            className="flex items-center space-x-3 p-2 rounded-md hover:bg-muted transition-colors"
                          >
                            <Checkbox
                              id={`agent-${agentId}`}
                              checked={isSelected}
                              onCheckedChange={() => handleToggleAgent(agentId)}
                            />
                            <label
                              htmlFor={`agent-${agentId}`}
                              className="flex-1 text-sm font-medium cursor-pointer"
                            >
                              {agentId}
                            </label>
                            {isSelected && (
                              <Badge variant="secondary" className="text-xs">
                                Selected
                              </Badge>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </ScrollArea>
                )}
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}
            </div>
          </ScrollArea>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={loading || selectedAgents.size === 0}>
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Create Panel
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}


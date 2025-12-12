'use client';

/**
 * AgentCreator - Modal component for creating and editing agents
 * Brand Guidelines V6 compliant
 */

import React, { useState, useEffect } from 'react';
import { X, Sparkles, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

// Agent type for editing (matches agents-store Agent type)
export interface EditingAgent {
  id?: string;
  name?: string;
  display_name?: string;
  description?: string;
  system_prompt?: string;
  systemPrompt?: string;
  model?: string;
  temperature?: number;
  categories?: string[];
  [key: string]: unknown;
}

export interface AgentCreatorProps {
  // Modal props (used by agents-table.tsx)
  isOpen?: boolean;
  onClose?: () => void;
  onSave?: () => void;
  editingAgent?: EditingAgent | null;
  // Form props (alternative usage)
  onSubmit?: (data: AgentFormData) => void;
  onCancel?: () => void;
  initialData?: Partial<AgentFormData>;
  className?: string;
}

export interface AgentFormData {
  name: string;
  description: string;
  systemPrompt: string;
  model?: string;
  temperature?: number;
}

export function AgentCreator({
  // Modal props
  isOpen,
  onClose,
  onSave,
  editingAgent,
  // Form props
  onSubmit,
  onCancel,
  initialData,
  className,
}: AgentCreatorProps) {
  // Determine initial form data from either editingAgent or initialData
  const getInitialFormData = (): AgentFormData => {
    if (editingAgent) {
      return {
        name: editingAgent.display_name ?? editingAgent.name ?? '',
        description: editingAgent.description ?? '',
        systemPrompt: editingAgent.system_prompt ?? editingAgent.systemPrompt ?? '',
        model: editingAgent.model ?? 'gpt-4',
        temperature: editingAgent.temperature ?? 0.7,
      };
    }
    return {
      name: initialData?.name ?? '',
      description: initialData?.description ?? '',
      systemPrompt: initialData?.systemPrompt ?? '',
      model: initialData?.model ?? 'gpt-4',
      temperature: initialData?.temperature ?? 0.7,
    };
  };

  const [formData, setFormData] = useState<AgentFormData>(getInitialFormData());

  // Reset form when editingAgent changes
  useEffect(() => {
    setFormData(getInitialFormData());
  }, [editingAgent, initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(formData);
    }
    if (onSave) {
      // TODO: Actually save the agent data via API
      onSave();
    }
  };

  const handleClose = () => {
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  const isEditing = !!editingAgent;

  // Form content (shared between modal and card views)
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-stone-800">
          Agent Name
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter agent name"
          className="bg-stone-50 border-stone-200 text-stone-600 placeholder:text-stone-400 focus:border-purple-600 focus:ring-purple-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm font-medium text-stone-800">
          Description
        </Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this agent does"
          rows={3}
          className="bg-stone-50 border-stone-200 text-stone-600 placeholder:text-stone-400 focus:border-purple-600 focus:ring-purple-600"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="systemPrompt" className="text-sm font-medium text-stone-800">
          System Prompt
        </Label>
        <Textarea
          id="systemPrompt"
          value={formData.systemPrompt}
          onChange={(e) => setFormData({ ...formData, systemPrompt: e.target.value })}
          placeholder="Enter the system prompt for the agent"
          rows={5}
          className="bg-stone-50 border-stone-200 text-stone-600 placeholder:text-stone-400 focus:border-purple-600 focus:ring-purple-600"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-stone-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          className="bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-purple-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="bg-purple-600 text-white hover:bg-purple-700"
        >
          <CheckCircle2 className="h-4 w-4 mr-2" />
          {isEditing ? 'Update Agent' : 'Create Agent'}
        </Button>
      </div>
    </form>
  );

  // If isOpen is provided, render as a modal dialog
  if (isOpen !== undefined) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="bg-stone-50 border-stone-200 max-w-2xl">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
                <Sparkles className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold text-stone-800">
                  {isEditing ? 'Edit Agent' : 'Create New Agent'}
                </DialogTitle>
                <DialogDescription className="text-sm text-stone-500">
                  Configure your AI agent&apos;s personality and capabilities
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  // Otherwise render as a card (original behavior)
  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <CardTitle className="text-xl font-semibold text-stone-800">
              {isEditing ? 'Edit Agent' : 'Create Agent'}
            </CardTitle>
            <CardDescription className="text-sm text-stone-500">
              Configure a new AI agent
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>{formContent}</CardContent>
    </Card>
  );
}

export default AgentCreator;

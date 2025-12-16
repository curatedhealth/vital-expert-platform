'use client';

/**
 * AgentCreator - Modal component for creating and editing agents
 * Brand Guidelines V6 compliant
 *
 * Supports both create (POST /api/agents-crud) and update (PUT /api/agents/[id]) operations
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, CheckCircle2, Loader2 } from 'lucide-react';
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
import { agentService } from '@/features/agents/services/agent-service';

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
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Determine initial form data from either editingAgent or initialData
  const getInitialFormData = useCallback((): AgentFormData => {
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
  }, [editingAgent, initialData]);

  const [formData, setFormData] = useState<AgentFormData>(getInitialFormData());

  // Reset form when editingAgent changes
  useEffect(() => {
    setFormData(getInitialFormData());
    setError(null);
  }, [editingAgent, initialData, getInitialFormData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validate required fields
    if (!formData.name.trim()) {
      setError('Agent name is required');
      return;
    }

    try {
      setSaving(true);

      if (onSubmit) {
        onSubmit(formData);
      }

      const isEditing = !!editingAgent?.id;

      if (isEditing) {
        // Update existing agent
        await agentService.updateAgent(editingAgent!.id!, {
          display_name: formData.name,
          description: formData.description,
          system_prompt: formData.systemPrompt,
          base_model: formData.model,
          temperature: formData.temperature,
        } as any);
      } else {
        // Create new agent
        await agentService.createCustomAgent({
          name: formData.name,
          description: formData.description,
          system_prompt: formData.systemPrompt,
          base_model: formData.model || 'gpt-4',
          temperature: formData.temperature ?? 0.7,
          status: 'development',
        } as any);
      }

      // Call onSave callback to refresh the agents list
      if (onSave) {
        onSave();
      }
    } catch (err) {
      console.error('Failed to save agent:', err);
      setError(err instanceof Error ? err.message : 'Failed to save agent');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (saving) return; // Don't close while saving
    setError(null);
    if (onClose) onClose();
    if (onCancel) onCancel();
  };

  const isEditing = !!editingAgent?.id;

  // Form content (shared between modal and card views)
  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name" className="text-sm font-medium text-stone-800">
          Agent Name <span className="text-red-500">*</span>
        </Label>
        <Input
          id="name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          placeholder="Enter agent name"
          disabled={saving}
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
          disabled={saving}
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
          disabled={saving}
          className="bg-stone-50 border-stone-200 text-stone-600 placeholder:text-stone-400 focus:border-purple-600 focus:ring-purple-600"
        />
      </div>

      <div className="flex gap-2 justify-end pt-4 border-t border-stone-200">
        <Button
          type="button"
          variant="outline"
          onClick={handleClose}
          disabled={saving}
          className="bg-stone-50 border-stone-200 text-stone-600 hover:bg-stone-100 hover:border-purple-600"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={saving || !formData.name.trim()}
          className="bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-50"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {isEditing ? 'Updating...' : 'Creating...'}
            </>
          ) : (
            <>
              <CheckCircle2 className="h-4 w-4 mr-2" />
              {isEditing ? 'Update Agent' : 'Create Agent'}
            </>
          )}
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


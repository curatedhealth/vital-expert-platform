/**
 * PromptModals - Create/Edit/Delete modals for Prompts
 *
 * Extracted for better code organization and reusability
 */
'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, Trash2, FileText, Shield, PenTool } from 'lucide-react';
import { PRISM_SUITES } from './PromptSuiteFilter';

// Types
export interface Prompt {
  id?: string;
  name: string;
  slug?: string;
  prompt_code?: string;
  display_name?: string;
  title?: string;
  description?: string;
  content?: string;
  system_prompt?: string;
  user_template?: string;
  user_prompt_template?: string;
  category?: string;
  domain?: string;
  function?: string;
  task_type?: string;
  complexity?: string;
  complexity_level?: string;
  tags?: string[];
  variables?: string[];
  expert_validated?: boolean;
  version?: string;
  rag_enabled?: boolean;
  suite?: string;
  sub_suite?: string;
  status?: string;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Default prompt for create form
export const DEFAULT_PROMPT: Partial<Prompt> = {
  name: '',
  display_name: '',
  description: '',
  content: '',
  system_prompt: '',
  user_template: '',
  domain: '',
  complexity: 'basic',
  tags: [],
  rag_enabled: false,
  status: 'active',
  is_active: true,
};

// Generate slug from name
export function generatePromptSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Complexity options
export const COMPLEXITY_OPTIONS = [
  { value: 'basic', label: 'Basic', description: 'Simple, straightforward prompts' },
  { value: 'intermediary', label: 'Intermediary', description: 'Moderate complexity with some structure' },
  { value: 'advanced', label: 'Advanced', description: 'Complex prompts with detailed instructions' },
  { value: 'expert', label: 'Expert', description: 'Highly specialized expert-level prompts' },
];

// Domain options
export const DOMAIN_OPTIONS = [
  'regulatory',
  'clinical',
  'safety',
  'market-access',
  'medical-affairs',
  'evidence',
  'medical-writing',
  'competitive-intelligence',
  'project-management',
  'digital-health',
];

// Props for Create/Edit Modal
export interface PromptEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Partial<Prompt> | null;
  onPromptChange: (prompt: Partial<Prompt>) => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

export function PromptEditModal({
  isOpen,
  onClose,
  prompt,
  onPromptChange,
  onSave,
  isSaving,
  error,
}: PromptEditModalProps) {
  if (!prompt) return null;

  const handleTagsChange = (value: string) => {
    const tags = value.split(',').map(t => t.trim()).filter(Boolean);
    onPromptChange({ ...prompt, tags });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {prompt.id ? 'Edit Prompt' : 'Create New Prompt'}
          </DialogTitle>
          <DialogDescription>
            {prompt.id
              ? 'Update the prompt details below'
              : 'Fill in the details to create a new prompt'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={prompt.name || ''}
                onChange={(e) => {
                  const name = e.target.value;
                  onPromptChange({
                    ...prompt,
                    name,
                    display_name: prompt.display_name || name,
                  });
                }}
                placeholder="e.g., Clinical Trial Protocol Review"
              />
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display Name</Label>
              <Input
                id="display_name"
                value={prompt.display_name || ''}
                onChange={(e) => onPromptChange({ ...prompt, display_name: e.target.value })}
                placeholder="e.g., Protocol Review Assistant"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={prompt.description || ''}
              onChange={(e) => onPromptChange({ ...prompt, description: e.target.value })}
              rows={2}
              placeholder="Brief description of what this prompt does..."
            />
          </div>

          {/* Suite & Domain */}
          <div className="grid grid-cols-2 gap-4">
            {/* Suite */}
            <div className="space-y-2">
              <Label>PRISM Suite</Label>
              <Select
                value={prompt.suite?.replace('™', '') || ''}
                onValueChange={(value) => onPromptChange({ ...prompt, suite: value + '™' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select suite" />
                </SelectTrigger>
                <SelectContent>
                  {PRISM_SUITES.map((suite) => (
                    <SelectItem key={suite.code} value={suite.code}>
                      <span className="flex items-center gap-2">
                        <suite.icon className="h-4 w-4" />
                        {suite.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Domain */}
            <div className="space-y-2">
              <Label>Domain</Label>
              <Select
                value={prompt.domain || ''}
                onValueChange={(value) => onPromptChange({ ...prompt, domain: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAIN_OPTIONS.map((domain) => (
                    <SelectItem key={domain} value={domain}>
                      {domain.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Complexity */}
          <div className="space-y-2">
            <Label>Complexity</Label>
            <Select
              value={prompt.complexity || 'basic'}
              onValueChange={(value) => onPromptChange({ ...prompt, complexity: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select complexity" />
              </SelectTrigger>
              <SelectContent>
                {COMPLEXITY_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div>
                      <span className="font-medium">{option.label}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {option.description}
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* System Prompt */}
          <div className="space-y-2">
            <Label htmlFor="system_prompt" className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-blue-600" />
              System Prompt
            </Label>
            <Textarea
              id="system_prompt"
              value={prompt.system_prompt || ''}
              onChange={(e) => onPromptChange({ ...prompt, system_prompt: e.target.value })}
              rows={5}
              className="font-mono text-sm"
              placeholder="You are an expert in..."
            />
          </div>

          {/* User Template */}
          <div className="space-y-2">
            <Label htmlFor="user_template" className="flex items-center gap-2">
              <PenTool className="h-4 w-4 text-green-600" />
              User Template
            </Label>
            <Textarea
              id="user_template"
              value={prompt.user_template || ''}
              onChange={(e) => onPromptChange({ ...prompt, user_template: e.target.value })}
              rows={4}
              className="font-mono text-sm"
              placeholder="USER_GOAL: {{question}}&#10;CONTEXT: {{context}}&#10;..."
            />
            <p className="text-xs text-muted-foreground">
              Use {'{{variable}}'} syntax for dynamic values
            </p>
          </div>

          {/* Main Content */}
          <div className="space-y-2">
            <Label htmlFor="content">Prompt Content</Label>
            <Textarea
              id="content"
              value={prompt.content || ''}
              onChange={(e) => onPromptChange({ ...prompt, content: e.target.value })}
              rows={4}
              className="font-mono text-sm"
              placeholder="Main prompt content or instructions..."
            />
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label htmlFor="tags">Tags (comma-separated)</Label>
            <Input
              id="tags"
              value={(prompt.tags || []).join(', ')}
              onChange={(e) => handleTagsChange(e.target.value)}
              placeholder="regulatory, clinical, protocol"
            />
          </div>

          {/* Switches */}
          <div className="flex gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="rag_enabled"
                checked={prompt.rag_enabled || false}
                onCheckedChange={(checked) => onPromptChange({ ...prompt, rag_enabled: checked })}
              />
              <Label htmlFor="rag_enabled" className="cursor-pointer">
                RAG Enabled
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="expert_validated"
                checked={prompt.expert_validated || false}
                onCheckedChange={(checked) => onPromptChange({ ...prompt, expert_validated: checked })}
              />
              <Label htmlFor="expert_validated" className="cursor-pointer">
                Expert Validated
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={prompt.is_active ?? true}
                onCheckedChange={(checked) => onPromptChange({ ...prompt, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                Active
              </Label>
            </div>
          </div>
        </div>

        <DialogFooter className="mt-6">
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                {prompt.id ? 'Update Prompt' : 'Create Prompt'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Props for Delete Modal
export interface PromptDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  prompt: Prompt | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function PromptDeleteModal({
  isOpen,
  onClose,
  prompt,
  onConfirm,
  isDeleting,
}: PromptDeleteModalProps) {
  if (!prompt) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <Trash2 className="h-5 w-5" />
            Delete Prompt
          </DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &ldquo;{prompt.display_name || prompt.name}&rdquo;?
            This action cannot be undone.
          </DialogDescription>
        </DialogHeader>

        <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
          <p className="text-sm text-red-700 dark:text-red-300">
            This will permanently delete the prompt and remove it from any associated agents.
          </p>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isDeleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isDeleting}>
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Prompt
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default PromptEditModal;

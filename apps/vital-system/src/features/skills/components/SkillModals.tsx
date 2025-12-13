/**
 * SkillModals - Create/Edit/Delete modals for Skills
 *
 * Extracted from skills/page.tsx for better code organization
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Save, Loader2, Trash2 } from 'lucide-react';
import {
  SKILL_CATEGORIES,
  COMPLEXITY_BADGES,
  getComplexityLevel,
} from '@vital/ai-ui';

// Types
export interface Skill {
  id?: string;
  name: string;
  slug: string;
  description?: string;
  category?: string;
  implementation_type?: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  implementation_ref?: string;
  complexity_score?: number;
  is_active?: boolean;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

// Default skill for create form
export const DEFAULT_SKILL: Partial<Skill> = {
  name: '',
  slug: '',
  description: '',
  category: '',
  implementation_type: 'prompt',
  implementation_ref: '',
  complexity_score: 5,
  is_active: true,
};

// Generate slug from name
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

// Props for Create/Edit Modal
export interface SkillEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Partial<Skill> | null;
  onSkillChange: (skill: Partial<Skill>) => void;
  onSave: () => void;
  isSaving: boolean;
  error: string | null;
}

export function SkillEditModal({
  isOpen,
  onClose,
  skill,
  onSkillChange,
  onSave,
  isSaving,
  error,
}: SkillEditModalProps) {
  if (!skill) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {skill.id ? 'Edit Skill' : 'Create New Skill'}
          </DialogTitle>
          <DialogDescription>
            {skill.id
              ? 'Update the skill details below'
              : 'Fill in the details to create a new skill'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-4">
          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={skill.name || ''}
              onChange={(e) => {
                const name = e.target.value;
                onSkillChange({
                  ...skill,
                  name,
                  slug: skill.slug || generateSlug(name),
                });
              }}
              placeholder="e.g., Data Analysis"
            />
          </div>

          {/* Slug */}
          <div className="space-y-2">
            <Label htmlFor="slug">Slug *</Label>
            <Input
              id="slug"
              value={skill.slug || ''}
              onChange={(e) =>
                onSkillChange({ ...skill, slug: e.target.value.toLowerCase() })
              }
              placeholder="e.g., data-analysis"
            />
            <p className="text-xs text-stone-500">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={skill.description || ''}
              onChange={(e) =>
                onSkillChange({ ...skill, description: e.target.value })
              }
              placeholder="Describe what this skill does..."
              rows={3}
            />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label htmlFor="category">Category</Label>
            <Select
              value={skill.category || ''}
              onValueChange={(value) =>
                onSkillChange({ ...skill, category: value })
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {Object.keys(SKILL_CATEGORIES).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Implementation Type */}
          <div className="space-y-2">
            <Label htmlFor="implementation_type">Implementation Type</Label>
            <Select
              value={skill.implementation_type || 'prompt'}
              onValueChange={(value) =>
                onSkillChange({
                  ...skill,
                  implementation_type: value as Skill['implementation_type'],
                })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="prompt">Prompt</SelectItem>
                <SelectItem value="tool">Tool</SelectItem>
                <SelectItem value="workflow">Workflow</SelectItem>
                <SelectItem value="agent_graph">Agent Graph</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Implementation Reference */}
          <div className="space-y-2">
            <Label htmlFor="implementation_ref">Implementation Reference</Label>
            <Input
              id="implementation_ref"
              value={skill.implementation_ref || ''}
              onChange={(e) =>
                onSkillChange({ ...skill, implementation_ref: e.target.value })
              }
              placeholder="e.g., prompt ID or tool name"
            />
          </div>

          {/* Complexity Score */}
          <div className="space-y-2">
            <Label htmlFor="complexity_score">Complexity Score (1-10)</Label>
            <div className="flex items-center gap-4">
              <Input
                id="complexity_score"
                type="number"
                min={1}
                max={10}
                value={skill.complexity_score || 5}
                onChange={(e) =>
                  onSkillChange({
                    ...skill,
                    complexity_score: parseInt(e.target.value) || 5,
                  })
                }
                className="w-24"
              />
              <Badge
                className={`${
                  COMPLEXITY_BADGES[getComplexityLevel(skill.complexity_score || 5)]
                    .bgColor
                } ${
                  COMPLEXITY_BADGES[getComplexityLevel(skill.complexity_score || 5)]
                    .color
                }`}
              >
                {
                  COMPLEXITY_BADGES[getComplexityLevel(skill.complexity_score || 5)]
                    .label
                }
              </Badge>
            </div>
          </div>

          {/* Active Status */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="is_active"
              checked={skill.is_active ?? true}
              onChange={(e) =>
                onSkillChange({ ...skill, is_active: e.target.checked })
              }
              className="rounded border-stone-300"
            />
            <Label htmlFor="is_active">Active</Label>
          </div>
        </div>

        <DialogFooter>
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
                {skill.id ? 'Update' : 'Create'}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Props for Delete Confirmation Modal
export interface SkillDeleteModalProps {
  isOpen: boolean;
  onClose: () => void;
  skill: Skill | null;
  onConfirm: () => void;
  isDeleting: boolean;
}

export function SkillDeleteModal({
  isOpen,
  onClose,
  skill,
  onConfirm,
  isDeleting,
}: SkillDeleteModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Skill</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete &quot;{skill?.name}&quot;? This
            action cannot be undone.
          </DialogDescription>
        </DialogHeader>
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
                Delete
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

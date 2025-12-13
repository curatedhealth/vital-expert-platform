'use client';

/**
 * VITAL Platform - SaveTemplateDialog Component
 *
 * Dialog for saving a configured mission as a reusable template.
 * Users can save from either Mode 3 (Expert) or Mode 4 (Wizard) flows.
 *
 * Features:
 * - Save mission configuration as template
 * - Add name, description, tags
 * - Choose visibility (personal, team, organization)
 * - Preview what will be saved
 * - Success confirmation
 *
 * Design System: VITAL Brand v6.0
 * Phase 3 Redesign - December 13, 2025
 */

import { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Save,
  X,
  Bookmark,
  Users,
  Building2,
  User,
  Lock,
  Eye,
  Tag,
  FileText,
  Target,
  Users2,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Plus,
  BookTemplate,
} from 'lucide-react';

import type { MissionFamily, MissionTemplate } from '../../types/mission-runners';
import type { MissionConfig } from './MissionConfigPanel';

// =============================================================================
// TYPES
// =============================================================================

export type TemplateVisibility = 'personal' | 'team' | 'organization';

export interface SaveTemplateData {
  name: string;
  description: string;
  category?: string;
  tags: string[];
  visibility: TemplateVisibility;
  isDefault?: boolean;
}

export interface SaveTemplateDialogProps {
  /** Whether the dialog is open */
  open: boolean;
  /** Called when dialog should close */
  onOpenChange: (open: boolean) => void;
  /** The mission config to save as template */
  config: MissionConfig;
  /** Called when template is saved */
  onSave: (data: SaveTemplateData, config: MissionConfig) => Promise<void>;
  /** Pre-filled template name (optional) */
  defaultName?: string;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const VISIBILITY_OPTIONS = [
  {
    value: 'personal' as TemplateVisibility,
    label: 'Just Me',
    description: 'Only you can see and use this template',
    icon: <User className="w-4 h-4" />,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
  },
  {
    value: 'team' as TemplateVisibility,
    label: 'My Team',
    description: 'Share with your team members',
    icon: <Users className="w-4 h-4" />,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
  },
  {
    value: 'organization' as TemplateVisibility,
    label: 'Organization',
    description: 'Share across your organization',
    icon: <Building2 className="w-4 h-4" />,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
  },
];

const CATEGORY_SUGGESTIONS = [
  'Research',
  'Analysis',
  'Strategy',
  'Investigation',
  'Preparation',
  'Monitoring',
  'Problem Solving',
  'Compliance',
  'Market Access',
  'Clinical',
  'Regulatory',
  'HEOR',
];

const TAG_SUGGESTIONS = [
  'FDA',
  'EMA',
  'Clinical Trial',
  'Market Analysis',
  'Literature Review',
  'Competitive Intelligence',
  'Regulatory Strategy',
  'HEOR',
  'Real World Evidence',
  'Drug Development',
  'Oncology',
  'Rare Disease',
];

// =============================================================================
// COMPONENT
// =============================================================================

export function SaveTemplateDialog({
  open,
  onOpenChange,
  config,
  onSave,
  defaultName = '',
  className,
}: SaveTemplateDialogProps) {
  // Form state
  const [name, setName] = useState(defaultName || generateDefaultName(config));
  const [description, setDescription] = useState(generateDefaultDescription(config));
  const [category, setCategory] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [visibility, setVisibility] = useState<TemplateVisibility>('personal');

  // UI state
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Validation
  const isValid = useMemo(() => {
    return name.trim().length >= 3 && name.trim().length <= 100;
  }, [name]);

  // Handle tag input
  const handleAddTag = useCallback(() => {
    const trimmed = tagInput.trim().toLowerCase();
    if (trimmed && !tags.includes(trimmed) && tags.length < 10) {
      setTags((prev) => [...prev, trimmed]);
      setTagInput('');
    }
  }, [tagInput, tags]);

  const handleRemoveTag = useCallback((tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  }, []);

  const handleTagKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAddTag();
      }
    },
    [handleAddTag]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    if (!isValid) return;

    setIsSaving(true);
    setError(null);

    try {
      await onSave(
        {
          name: name.trim(),
          description: description.trim(),
          category: category || undefined,
          tags,
          visibility,
        },
        config
      );

      setSaveSuccess(true);

      // Auto-close after success
      setTimeout(() => {
        onOpenChange(false);
        // Reset state
        setSaveSuccess(false);
        setName('');
        setDescription('');
        setCategory('');
        setTags([]);
      }, 1500);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save template');
    } finally {
      setIsSaving(false);
    }
  }, [isValid, name, description, category, tags, visibility, config, onSave, onOpenChange]);

  // Handle close
  const handleClose = useCallback(() => {
    if (!isSaving) {
      onOpenChange(false);
      setSaveSuccess(false);
      setError(null);
    }
  }, [isSaving, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className={cn('sm:max-w-[600px]', className)}>
        <AnimatePresence mode="wait">
          {saveSuccess ? (
            // Success State
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="py-8 text-center"
            >
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900">Template Saved!</h3>
              <p className="text-slate-600 mt-2">
                Your mission template "{name}" has been saved and is ready to use.
              </p>
            </motion.div>
          ) : (
            // Form State
            <motion.div
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <BookTemplate className="w-5 h-5 text-purple-600" />
                  Save as Template
                </DialogTitle>
                <DialogDescription>
                  Save this mission configuration for quick reuse in the future.
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5 py-4">
                {/* Template Name */}
                <div className="space-y-2">
                  <Label htmlFor="template-name" className="flex items-center gap-1">
                    Template Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="template-name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g., FDA Accelerated Approval Analysis"
                    className={cn(
                      name.length > 0 && !isValid && 'border-red-300 focus-visible:ring-red-500'
                    )}
                    maxLength={100}
                  />
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">
                      {name.length < 3
                        ? 'At least 3 characters required'
                        : `${name.length}/100 characters`}
                    </span>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe what this template is for and when to use it..."
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  <div className="text-xs text-slate-500 text-right">
                    {description.length}/500 characters
                  </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="template-category">Category</Label>
                  <div className="flex gap-2">
                    <Input
                      id="template-category"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      placeholder="Select or type a category..."
                      list="category-suggestions"
                    />
                    <datalist id="category-suggestions">
                      {CATEGORY_SUGGESTIONS.map((cat) => (
                        <option key={cat} value={cat} />
                      ))}
                    </datalist>
                  </div>
                </div>

                {/* Tags */}
                <div className="space-y-2">
                  <Label htmlFor="template-tags">Tags</Label>
                  <div className="flex gap-2">
                    <Input
                      id="template-tags"
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyDown={handleTagKeyDown}
                      placeholder="Add a tag..."
                      list="tag-suggestions"
                    />
                    <datalist id="tag-suggestions">
                      {TAG_SUGGESTIONS.filter((t) => !tags.includes(t.toLowerCase())).map(
                        (tag) => (
                          <option key={tag} value={tag} />
                        )
                      )}
                    </datalist>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTag}
                      disabled={!tagInput.trim() || tags.length >= 10}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Tag List */}
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {tags.map((tag) => (
                        <Badge
                          key={tag}
                          variant="secondary"
                          className="flex items-center gap-1 pr-1"
                        >
                          <Tag className="w-3 h-3" />
                          {tag}
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="ml-1 p-0.5 rounded-full hover:bg-slate-300 transition-colors"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                  <p className="text-xs text-slate-500">{tags.length}/10 tags</p>
                </div>

                {/* Visibility */}
                <div className="space-y-2">
                  <Label>Visibility</Label>
                  <RadioGroup
                    value={visibility}
                    onValueChange={(v) => setVisibility(v as TemplateVisibility)}
                    className="grid grid-cols-3 gap-2"
                  >
                    {VISIBILITY_OPTIONS.map((option) => (
                      <label
                        key={option.value}
                        className={cn(
                          'relative flex flex-col items-center gap-1 p-3 rounded-lg border-2 cursor-pointer transition-all text-center',
                          visibility === option.value
                            ? `${option.borderColor} ${option.bgColor}`
                            : 'border-slate-200 hover:border-slate-300'
                        )}
                      >
                        <RadioGroupItem
                          value={option.value}
                          className="sr-only"
                        />
                        <span className={option.color}>{option.icon}</span>
                        <span className="font-medium text-sm text-slate-900">
                          {option.label}
                        </span>
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {option.description.split(' ').slice(0, 3).join(' ')}...
                        </span>
                      </label>
                    ))}
                  </RadioGroup>
                </div>

                {/* Preview Toggle */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setShowPreview(!showPreview)}
                    className="text-sm text-purple-600 hover:text-purple-700 flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    {showPreview ? 'Hide' : 'Show'} Configuration Preview
                  </button>

                  <AnimatePresence>
                    {showPreview && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="mt-3 p-4 bg-slate-50 rounded-lg space-y-3">
                          <h4 className="font-medium text-slate-900 text-sm">
                            Configuration Summary
                          </h4>

                          <div className="grid grid-cols-2 gap-3 text-sm">
                            <div className="flex items-start gap-2">
                              <Target className="w-4 h-4 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-slate-500">Mission Type</p>
                                <p className="font-medium text-slate-900">
                                  {config.family?.replace('_', ' ') || 'Not set'}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Users2 className="w-4 h-4 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-slate-500">Team Size</p>
                                <p className="font-medium text-slate-900">
                                  {countTeamSize(config)} agents
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Clock className="w-4 h-4 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-slate-500">Max Duration</p>
                                <p className="font-medium text-slate-900">
                                  {config.executionSettings?.maxDurationMinutes || 60} min
                                </p>
                              </div>
                            </div>

                            <div className="flex items-start gap-2">
                              <Sparkles className="w-4 h-4 text-slate-400 mt-0.5" />
                              <div>
                                <p className="text-slate-500">Research Depth</p>
                                <p className="font-medium text-slate-900">
                                  {config.parameters?.researchDepth || 'Standard'}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Goal Preview */}
                          {config.structuredGoal && (
                            <div className="pt-2 border-t border-slate-200">
                              <p className="text-xs text-slate-500 mb-1">Research Goal:</p>
                              <p className="text-sm text-slate-700 line-clamp-2">
                                {config.structuredGoal}
                              </p>
                            </div>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="flex items-center gap-2 p-3 bg-red-50 rounded-lg text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    {error}
                  </div>
                )}
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={handleClose} disabled={isSaving}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!isValid || isSaving}
                  className={cn(
                    'bg-gradient-to-r from-purple-600 to-purple-700',
                    'hover:from-purple-700 hover:to-purple-800',
                    'shadow-lg shadow-purple-500/25'
                  )}
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Template
                    </>
                  )}
                </Button>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateDefaultName(config: MissionConfig): string {
  const family = config.family?.replace('_', ' ') || 'Research';
  const depth = config.parameters?.researchDepth || '';
  const depthLabel = depth === 'exhaustive' ? 'Deep' : depth === 'quick' ? 'Quick' : '';

  return `${depthLabel} ${family} Mission`.trim();
}

function generateDefaultDescription(config: MissionConfig): string {
  const parts: string[] = [];

  if (config.family) {
    parts.push(`${config.family.replace('_', ' ')} mission`);
  }

  if (config.parameters?.researchDepth) {
    parts.push(`with ${config.parameters.researchDepth} research depth`);
  }

  const teamSize = countTeamSize(config);
  if (teamSize > 0) {
    parts.push(`using ${teamSize} agents`);
  }

  return parts.length > 0 ? parts.join(' ') + '.' : '';
}

function countTeamSize(config: MissionConfig): number {
  let count = 0;
  if (config.team?.primaryAgent) count += 1;
  if (config.team?.specialists) count += config.team.specialists.length;
  if (config.team?.workers) count += config.team.workers.length;
  if (config.team?.tools) count += config.team.tools.length;
  return count;
}

export default SaveTemplateDialog;

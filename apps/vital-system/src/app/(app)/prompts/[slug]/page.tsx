// Prompt Detail Page with View/Edit capability
'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';

// Import Vital Forms Library for inline editing
import {
  VitalForm,
  VitalFormGrid,
  VitalFormSection,
  useVitalForm,
  VitalInputField,
  VitalTextareaField,
  VitalSelectField,
  VitalSwitchField,
  VitalTagInputField,
} from '@/lib/forms';
import {
  editPromptSchema,
  type Prompt as PromptType,
  COMPLEXITY_OPTIONS,
  DOMAIN_OPTIONS,
  TASK_TYPE_OPTIONS,
  PATTERN_TYPE_OPTIONS,
  STATUS_OPTIONS,
} from '@/lib/forms/schemas';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  ArrowLeft,
  FileText,
  Landmark,
  Microscope,
  Shield,
  Gem,
  Network,
  BarChart3,
  PenTool,
  Radar,
  ClipboardList,
  Zap,
  CheckCircle2,
  AlertCircle,
  Clock,
  Pencil,
  Trash2,
  Save,
  X,
  Copy,
  Check,
  Loader2,
  ExternalLink,
  Star,
  Tag,
  BookOpen,
  Code,
  Settings,
  Play,
  MessageSquare,
  FileText as FileTextIcon,
  Layers,
  Users,
  Building2,
  Briefcase,
  Timer,
  TrendingUp,
  Award,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

// PRISM Suite icons and colors
const SUITE_CONFIG: Record<string, { icon: LucideIcon; color: string; textColor: string; description: string }> = {
  'RULES': { icon: Landmark, color: 'bg-blue-100', textColor: 'text-blue-800', description: 'Regulatory Excellence' },
  'TRIALS': { icon: Microscope, color: 'bg-violet-100', textColor: 'text-violet-800', description: 'Clinical Development' },
  'GUARD': { icon: Shield, color: 'bg-red-100', textColor: 'text-red-800', description: 'Safety Framework' },
  'VALUE': { icon: Gem, color: 'bg-emerald-100', textColor: 'text-emerald-800', description: 'Market Access' },
  'BRIDGE': { icon: Network, color: 'bg-orange-100', textColor: 'text-orange-800', description: 'Stakeholder Engagement' },
  'PROOF': { icon: BarChart3, color: 'bg-cyan-100', textColor: 'text-cyan-800', description: 'Evidence Analytics' },
  'CRAFT': { icon: PenTool, color: 'bg-purple-100', textColor: 'text-purple-800', description: 'Medical Writing' },
  'SCOUT': { icon: Radar, color: 'bg-lime-100', textColor: 'text-lime-800', description: 'Competitive Intelligence' },
  'PROJECT': { icon: ClipboardList, color: 'bg-indigo-100', textColor: 'text-indigo-800', description: 'Project Management' },
  'FORGE': { icon: Zap, color: 'bg-amber-100', textColor: 'text-amber-800', description: 'Digital Health' },
};

// Complexity badges
const COMPLEXITY_BADGES: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  basic: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Basic' },
  intermediary: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Intermediary' },
  intermediate: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Intermediate' },
  advanced: { color: 'bg-orange-100 text-orange-800', icon: Zap, label: 'Advanced' },
  expert: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Expert' },
};

interface Prompt {
  id: string;
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
  // Prompt starter and detailed prompt
  prompt_starter?: string;
  detailed_prompt?: string;
  // Classification
  category?: string;
  domain?: string;
  function?: string;
  function_name?: string;
  department_name?: string;
  role_name?: string;
  task_type?: string;
  pattern_type?: string;
  role_type?: string;
  complexity?: string;
  complexity_level?: string;
  // Tags and variables
  tags?: string[];
  variables?: string[];
  // Metrics
  estimated_time_minutes?: number;
  usage_count?: number;
  accuracy_clinical?: number;
  accuracy_regulatory?: number;
  user_satisfaction?: number;
  avg_latency_ms?: number;
  // Validation
  expert_validated?: boolean;
  validation_date?: string;
  validator_name?: string;
  validator_credentials?: string;
  version?: string;
  rag_enabled?: boolean;
  rag_context_sources?: string[];
  // Suite info
  suite?: string;
  suite_id?: string;
  suite_name?: string;
  sub_suite?: string;
  sub_suite_id?: string;
  sub_suite_name?: string;
  // Status
  status?: string;
  is_active?: boolean;
  is_user_created?: boolean;
  // Timestamps
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  metadata?: Record<string, unknown>;
}

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Helper to get suite code from suite name
const getSuiteCode = (suiteName?: string): string => {
  if (!suiteName) return 'RULES';
  return suiteName.replace('™', '').toUpperCase();
};

// Inner component that uses useSearchParams
function PromptDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Check if edit mode is requested via query param
  const editParam = searchParams.get('edit');
  const startInEditMode = editParam === 'true';

  const [prompt, setPrompt] = useState<Prompt | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Prompt>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [copiedContent, setCopiedContent] = useState<string | null>(null);

  useEffect(() => {
    loadPrompt();
  }, [slug]);

  // Enter edit mode after prompt is loaded if query param is set
  useEffect(() => {
    if (prompt && startInEditMode && !isEditing) {
      setIsEditing(true);
    }
  }, [prompt, startInEditMode]);

  const loadPrompt = async () => {
    try {
      setLoading(true);
      setError(null);

      // Try fetching by ID first (UUID), then by slug if that fails
      // Use showAll=true to bypass tenant filtering for direct link access
      let response = await fetch(`/api/prompts-crud?action=get&id=${slug}&showAll=true`);

      // If not found by ID, try searching by slug/prompt_code
      if (response.status === 404) {
        const searchResponse = await fetch(`/api/prompts-crud?showAll=true`);
        if (searchResponse.ok) {
          const data = await searchResponse.json();
          const matchedPrompt = data.prompts?.find(
            (p: Prompt) => p.slug === slug || p.prompt_code === slug || p.id === slug
          );
          if (matchedPrompt) {
            setPrompt(matchedPrompt);
            setEditForm(matchedPrompt);
            setLoading(false);
            return;
          }
        }
      }

      if (!response.ok) {
        if (response.status === 404) {
          setError('Prompt not found');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load prompt');
        }
        return;
      }

      const data = await response.json();
      setPrompt(data.prompt);
      setEditForm(data.prompt);
    } catch (err) {
      console.error('Error loading prompt:', err);
      setError('Failed to load prompt');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!prompt?.id) return;

    try {
      setSaving(true);

      const response = await fetch('/api/prompts-crud', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id: prompt.id, ...editForm }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update prompt');
      }

      const data = await response.json();
      setPrompt(data.prompt);
      setEditForm(data.prompt);
      setIsEditing(false);
    } catch (err: unknown) {
      console.error('Error saving prompt:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!prompt?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/prompts-crud?id=${prompt.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete prompt');
      }

      // Redirect to prompts list
      router.push('/prompts');
    } catch (err: unknown) {
      console.error('Error deleting prompt:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to delete: ${message}`);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopy = async (content: string, label: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedContent(label);
      setTimeout(() => setCopiedContent(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  // Get suite info
  const suiteCode = getSuiteCode(prompt?.suite);
  const suiteConfig = SUITE_CONFIG[suiteCode] || SUITE_CONFIG['RULES'];
  const SuiteIcon = suiteConfig.icon;

  // Get complexity info
  const complexityKey = prompt?.complexity || prompt?.complexity_level || 'basic';
  const complexityConfig = COMPLEXITY_BADGES[complexityKey] || COMPLEXITY_BADGES['basic'];
  const ComplexityIcon = complexityConfig.icon;

  // Loading state
  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4">
          <VitalBreadcrumb
            showHome
            items={[{ label: 'Prompts', href: '/prompts' }, { label: 'Loading...' }]}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  // Error state
  if (error || !prompt) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="px-6 pt-4">
          <VitalBreadcrumb
            showHome
            items={[{ label: 'Prompts', href: '/prompts' }, { label: 'Error' }]}
          />
        </div>
        <div className="flex-1 flex items-center justify-center">
          <Card className="max-w-md w-full">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                {error || 'Prompt not found'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button onClick={() => router.push('/prompts')} variant="outline" className="w-full">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Prompts
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const displayName = prompt.display_name || prompt.title || prompt.name;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: displayName },
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/prompts')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${suiteConfig.color}`}>
              <SuiteIcon className={`h-6 w-6 ${suiteConfig.textColor}`} />
            </div>
            <div>
              <h1 className="text-xl font-semibold">{displayName}</h1>
              {prompt.prompt_code && (
                <span className="text-sm text-muted-foreground font-mono">{prompt.prompt_code}</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {!isEditing && (
            <>
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </Button>
            </>
          )}
          {isEditing && (
            <>
              <Button variant="outline" onClick={() => {
                setIsEditing(false);
                setEditForm(prompt);
              }}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Metadata Badges */}
          <div className="flex flex-wrap gap-2">
            {/* Suite Badge */}
            {prompt.suite && (
              <Badge className={`${suiteConfig.color} ${suiteConfig.textColor}`}>
                <SuiteIcon className="h-3 w-3 mr-1" />
                {prompt.suite}
              </Badge>
            )}
            {/* Sub-Suite Badge */}
            {prompt.sub_suite_name && (
              <Badge variant="secondary">
                <Layers className="h-3 w-3 mr-1" />
                {prompt.sub_suite_name}
              </Badge>
            )}
            {/* Complexity Badge */}
            <Badge className={complexityConfig.color}>
              <ComplexityIcon className="h-3 w-3 mr-1" />
              {complexityConfig.label}
            </Badge>
            {/* Category Badge */}
            {prompt.category && (
              <Badge variant="outline" className="bg-stone-50">
                {prompt.category}
              </Badge>
            )}
            {/* Task Type Badge */}
            {prompt.task_type && prompt.task_type !== 'starter' && (
              <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200">
                {prompt.task_type}
              </Badge>
            )}
            {/* Pattern Type Badge */}
            {prompt.pattern_type && prompt.pattern_type !== 'starter' && (
              <Badge variant="outline" className="bg-cyan-50 text-cyan-700 border-cyan-200">
                {prompt.pattern_type}
              </Badge>
            )}
            {/* Expert Validated */}
            {prompt.expert_validated && (
              <Badge className="bg-green-100 text-green-800">
                <Award className="h-3 w-3 mr-1" />
                Validated
              </Badge>
            )}
            {/* RAG Enabled */}
            {prompt.rag_enabled && (
              <Badge className="bg-purple-100 text-purple-800">
                RAG Enabled
              </Badge>
            )}
            {/* Version */}
            {prompt.version && (
              <Badge variant="outline">v{prompt.version}</Badge>
            )}
            {/* Status */}
            <Badge variant={prompt.is_active !== false ? 'default' : 'secondary'}>
              {prompt.is_active !== false ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          {/* Prompt Starter - Primary CTA */}
          {prompt.prompt_starter && (
            <Card className="border-emerald-200 dark:border-emerald-800 bg-gradient-to-r from-emerald-50 to-teal-50 dark:from-emerald-950 dark:to-teal-950">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-emerald-700 dark:text-emerald-300">
                    <MessageSquare className="h-4 w-4" />
                    Prompt Starter
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(prompt.prompt_starter!, 'starter')}
                    className="text-emerald-600 hover:text-emerald-700"
                  >
                    {copiedContent === 'starter' ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <CardDescription className="text-emerald-600 dark:text-emerald-400">
                  Quick start prompt to begin your conversation
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-white dark:bg-stone-900 rounded-lg border border-emerald-200 dark:border-emerald-700">
                  <p className="text-base font-medium text-emerald-800 dark:text-emerald-200">
                    &ldquo;{prompt.prompt_starter}&rdquo;
                  </p>
                </div>
                <Button
                  className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => {
                    handleCopy(prompt.prompt_starter!, 'starter');
                    // Could navigate to Ask Expert with this prompt
                  }}
                >
                  <Play className="h-4 w-4 mr-2" />
                  Use This Prompt
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Detailed Prompt - Always show when available */}
          {(prompt.detailed_prompt || isEditing) && (
            <Card className="border-violet-200 dark:border-violet-800">
              <CardHeader className="pb-3 bg-violet-50 dark:bg-violet-950 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-violet-700 dark:text-violet-300">
                    <FileTextIcon className="h-4 w-4" />
                    Detailed Prompt
                  </CardTitle>
                  {!isEditing && prompt.detailed_prompt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(prompt.detailed_prompt!, 'detailed')}
                    >
                      {copiedContent === 'detailed' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditing ? (
                  <Textarea
                    value={editForm.detailed_prompt || ''}
                    onChange={(e) => setEditForm({ ...editForm, detailed_prompt: e.target.value })}
                    rows={6}
                    className="font-mono text-sm"
                    placeholder="Enter detailed prompt..."
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono text-violet-800 dark:text-violet-200 max-h-64 overflow-y-auto">
                    {prompt.detailed_prompt}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}

          {/* Description */}
          {prompt.description && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Description
                </CardTitle>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={3}
                    placeholder="Enter description..."
                  />
                ) : (
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {prompt.description}
                  </p>
                )}
              </CardContent>
            </Card>
          )}

          {/* System Prompt */}
          {(prompt.system_prompt || isEditing) && (
            <Card className="border-blue-200 dark:border-blue-800">
              <CardHeader className="pb-3 bg-blue-50 dark:bg-blue-950 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-blue-700 dark:text-blue-300">
                    <Shield className="h-4 w-4" />
                    System Prompt
                  </CardTitle>
                  {!isEditing && prompt.system_prompt && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(prompt.system_prompt!, 'system')}
                    >
                      {copiedContent === 'system' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditing ? (
                  <Textarea
                    value={editForm.system_prompt || ''}
                    onChange={(e) => setEditForm({ ...editForm, system_prompt: e.target.value })}
                    rows={8}
                    className="font-mono text-sm"
                    placeholder="Enter system prompt..."
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono text-blue-800 dark:text-blue-200 max-h-64 overflow-y-auto">
                    {prompt.system_prompt}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}

          {/* User Template */}
          {(prompt.user_template || prompt.user_prompt_template || isEditing) && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3 bg-green-50 dark:bg-green-950 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-300">
                    <PenTool className="h-4 w-4" />
                    User Template
                  </CardTitle>
                  {!isEditing && (prompt.user_template || prompt.user_prompt_template) && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(prompt.user_template || prompt.user_prompt_template!, 'user')}
                    >
                      {copiedContent === 'user' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                {isEditing ? (
                  <Textarea
                    value={editForm.user_template || editForm.user_prompt_template || ''}
                    onChange={(e) => setEditForm({ ...editForm, user_template: e.target.value })}
                    rows={6}
                    className="font-mono text-sm"
                    placeholder="Enter user template..."
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono text-green-800 dark:text-green-200 max-h-48 overflow-y-auto">
                    {prompt.user_template || prompt.user_prompt_template}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}

          {/* Main Content */}
          {(prompt.content || isEditing) && (
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Prompt Content
                  </CardTitle>
                  {!isEditing && prompt.content && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleCopy(prompt.content!, 'content')}
                    >
                      {copiedContent === 'content' ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isEditing ? (
                  <Textarea
                    value={editForm.content || ''}
                    onChange={(e) => setEditForm({ ...editForm, content: e.target.value })}
                    rows={10}
                    className="font-mono text-sm"
                    placeholder="Enter prompt content..."
                  />
                ) : (
                  <pre className="text-sm whitespace-pre-wrap font-mono max-h-96 overflow-y-auto">
                    {prompt.content || 'No content available'}
                  </pre>
                )}
              </CardContent>
            </Card>
          )}

          {/* Variables */}
          {prompt.variables && prompt.variables.length > 0 && (
            <Card className="border-amber-200 dark:border-amber-800">
              <CardHeader className="pb-3 bg-amber-50 dark:bg-amber-950 rounded-t-lg">
                <CardTitle className="text-sm flex items-center gap-2 text-amber-700 dark:text-amber-300">
                  <Code className="h-4 w-4" />
                  Variables ({prompt.variables.length})
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex flex-wrap gap-2">
                  {prompt.variables.map((variable, idx) => (
                    <code key={idx} className="text-xs px-2 py-1 bg-amber-100 dark:bg-amber-900 rounded font-mono">
                      {`{{${variable}}}`}
                    </code>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Tags */}
          {prompt.tags && prompt.tags.length > 0 && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Tag className="h-4 w-4" />
                  Tags ({prompt.tags.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {prompt.tags.map((tag, idx) => (
                    <Badge key={idx} variant="outline">
                      #{tag}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Organization Context */}
          {(prompt.function_name || prompt.department_name || prompt.role_name) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Building2 className="h-4 w-4" />
                  Organization Context
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {prompt.function_name && (
                    <div className="flex items-center gap-2">
                      <Briefcase className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground text-xs">Function</span>
                        <p className="font-medium">{prompt.function_name}</p>
                      </div>
                    </div>
                  )}
                  {prompt.department_name && (
                    <div className="flex items-center gap-2">
                      <Building2 className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground text-xs">Department</span>
                        <p className="font-medium">{prompt.department_name}</p>
                      </div>
                    </div>
                  )}
                  {prompt.role_name && (
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <span className="text-muted-foreground text-xs">Role</span>
                        <p className="font-medium">{prompt.role_name}</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Performance Metrics */}
          {(prompt.usage_count !== undefined || prompt.accuracy_clinical !== undefined || prompt.accuracy_regulatory !== undefined || prompt.user_satisfaction !== undefined) && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Performance Metrics
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {prompt.usage_count !== undefined && (
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p className="text-2xl font-bold text-blue-600">{prompt.usage_count}</p>
                      <p className="text-xs text-muted-foreground">Total Uses</p>
                    </div>
                  )}
                  {prompt.accuracy_clinical !== undefined && prompt.accuracy_clinical > 0 && (
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p className="text-2xl font-bold text-green-600">{prompt.accuracy_clinical}%</p>
                      <p className="text-xs text-muted-foreground">Clinical Accuracy</p>
                    </div>
                  )}
                  {prompt.accuracy_regulatory !== undefined && prompt.accuracy_regulatory > 0 && (
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p className="text-2xl font-bold text-purple-600">{prompt.accuracy_regulatory}%</p>
                      <p className="text-xs text-muted-foreground">Regulatory Accuracy</p>
                    </div>
                  )}
                  {prompt.user_satisfaction !== undefined && prompt.user_satisfaction > 0 && (
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p className="text-2xl font-bold text-amber-600">{prompt.user_satisfaction}%</p>
                      <p className="text-xs text-muted-foreground">User Satisfaction</p>
                    </div>
                  )}
                  {prompt.avg_latency_ms !== undefined && prompt.avg_latency_ms > 0 && (
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p className="text-2xl font-bold text-cyan-600">{prompt.avg_latency_ms}ms</p>
                      <p className="text-xs text-muted-foreground">Avg Latency</p>
                    </div>
                  )}
                  {prompt.estimated_time_minutes !== undefined && prompt.estimated_time_minutes > 0 && (
                    <div className="text-center p-3 bg-stone-50 dark:bg-stone-800 rounded-lg">
                      <p className="text-2xl font-bold text-indigo-600">{prompt.estimated_time_minutes}m</p>
                      <p className="text-xs text-muted-foreground">Est. Time</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Validation Info */}
          {prompt.expert_validated && (prompt.validator_name || prompt.validation_date) && (
            <Card className="border-green-200 dark:border-green-800">
              <CardHeader className="pb-3 bg-green-50 dark:bg-green-950 rounded-t-lg">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700 dark:text-green-300">
                  <Award className="h-4 w-4" />
                  Expert Validation
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                  {prompt.validator_name && (
                    <div>
                      <span className="text-muted-foreground text-xs">Validated By</span>
                      <p className="font-medium">{prompt.validator_name}</p>
                    </div>
                  )}
                  {prompt.validator_credentials && (
                    <div>
                      <span className="text-muted-foreground text-xs">Credentials</span>
                      <p className="font-medium">{prompt.validator_credentials}</p>
                    </div>
                  )}
                  {prompt.validation_date && (
                    <div>
                      <span className="text-muted-foreground text-xs">Validated On</span>
                      <p className="font-medium">{new Date(prompt.validation_date).toLocaleDateString()}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Metadata */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                {prompt.prompt_code && (
                  <div>
                    <span className="text-muted-foreground text-xs">Prompt Code</span>
                    <p className="font-mono text-xs bg-stone-100 dark:bg-stone-800 px-2 py-1 rounded">{prompt.prompt_code}</p>
                  </div>
                )}
                {prompt.domain && (
                  <div>
                    <span className="text-muted-foreground text-xs">Domain</span>
                    <p className="font-medium">{prompt.domain}</p>
                  </div>
                )}
                {prompt.category && (
                  <div>
                    <span className="text-muted-foreground text-xs">Category</span>
                    <p className="font-medium">{prompt.category}</p>
                  </div>
                )}
                {prompt.task_type && (
                  <div>
                    <span className="text-muted-foreground text-xs">Task Type</span>
                    <p className="font-medium">{prompt.task_type}</p>
                  </div>
                )}
                {prompt.pattern_type && (
                  <div>
                    <span className="text-muted-foreground text-xs">Pattern Type</span>
                    <p className="font-medium">{prompt.pattern_type}</p>
                  </div>
                )}
                {prompt.role_type && (
                  <div>
                    <span className="text-muted-foreground text-xs">Role Type</span>
                    <p className="font-medium">{prompt.role_type}</p>
                  </div>
                )}
                {prompt.created_at && (
                  <div>
                    <span className="text-muted-foreground text-xs">Created</span>
                    <p className="font-medium">{new Date(prompt.created_at).toLocaleDateString()}</p>
                  </div>
                )}
                {prompt.updated_at && (
                  <div>
                    <span className="text-muted-foreground text-xs">Updated</span>
                    <p className="font-medium">{new Date(prompt.updated_at).toLocaleDateString()}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Play className="h-4 w-4" />
                Quick Actions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  onClick={() => handleCopy(
                    prompt.system_prompt || prompt.content || prompt.user_template || '',
                    'all'
                  )}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  {copiedContent === 'all' ? 'Copied!' : 'Copy Full Prompt'}
                </Button>
                <Button variant="outline" onClick={() => router.push('/ask-expert')}>
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Use in Ask Expert
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="max-w-md w-full mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-600">
                <AlertCircle className="h-5 w-5" />
                Delete Prompt
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete &ldquo;{displayName}&rdquo;? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Loading fallback
function PromptDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-5 w-48 bg-stone-200 rounded animate-pulse" />
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    </div>
  );
}

// Page component with Suspense
export default function PromptDetailPage({ params }: PageProps) {
  const { slug } = use(params);

  return (
    <Suspense fallback={<PromptDetailLoading />}>
      <PromptDetailContent slug={slug} />
    </Suspense>
  );
}

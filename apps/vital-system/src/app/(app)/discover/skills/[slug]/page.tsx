// Skill Detail Page with CRUD capability
'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  ArrowLeft,
  Sparkles,
  Target,
  Users,
  BarChart3,
  FileSearch,
  CheckCircle2,
  Code,
  Workflow,
  Brain,
  Pencil,
  Trash2,
  Save,
  X,
  AlertCircle,
  Clock,
  Zap,
  Shield,
  Loader2,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';

// Skill categories with icons and colors
const SKILL_CATEGORIES: Record<string, { icon: React.ElementType; color: string; description: string }> = {
  'Planning': {
    icon: Target,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Strategic planning and task decomposition'
  },
  'Delegation': {
    icon: Users,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Work distribution and coordination'
  },
  'Analysis': {
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Data analysis and insight extraction'
  },
  'Search': {
    icon: FileSearch,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Information retrieval and research'
  },
  'Generation': {
    icon: Sparkles,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    description: 'Content creation and synthesis'
  },
  'Validation': {
    icon: CheckCircle2,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Quality assurance and verification'
  },
  'Communication': {
    icon: Users,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Information sharing and collaboration'
  },
  'Coding': {
    icon: Code,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'Software development and programming'
  },
  'Orchestration': {
    icon: Workflow,
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'Process coordination and workflow management'
  },
  'Reasoning': {
    icon: Brain,
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Logical thinking and problem solving'
  },
  'Document Processing': {
    icon: FileSearch,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Document analysis and manipulation'
  },
  'Creative & Design': {
    icon: Sparkles,
    color: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    description: 'Creative content and visual design'
  },
  'Development & Code': {
    icon: Code,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Software development skills'
  },
  'Communication & Writing': {
    icon: Users,
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Written and verbal communication'
  },
  'Scientific & Research': {
    icon: Brain,
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Scientific research and analysis'
  },
};

// Complexity badges
const COMPLEXITY_BADGES = {
  basic: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Basic' },
  intermediate: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Intermediate' },
  advanced: { color: 'bg-orange-100 text-orange-800', icon: Zap, label: 'Advanced' },
  expert: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Expert' },
};

// Implementation type badges
const IMPLEMENTATION_BADGES = {
  prompt: { color: 'bg-purple-100 text-purple-800', icon: Sparkles, label: 'Prompt' },
  tool: { color: 'bg-blue-100 text-blue-800', icon: Code, label: 'Tool' },
  workflow: { color: 'bg-green-100 text-green-800', icon: Workflow, label: 'Workflow' },
  agent_graph: { color: 'bg-orange-100 text-orange-800', icon: Brain, label: 'Agent Graph' },
};

interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  implementation_type: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  implementation_ref?: string;
  complexity_score: number;
  complexity_level?: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

// Helper to convert complexity score to level
const getComplexityLevel = (score: number): 'basic' | 'intermediate' | 'advanced' | 'expert' => {
  if (score <= 3) return 'basic';
  if (score <= 5) return 'intermediate';
  if (score <= 7) return 'advanced';
  return 'expert';
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Inner component that uses useSearchParams
function SkillDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Check if edit mode is requested via query param
  const editParam = searchParams.get('edit');
  const startInEditMode = editParam === 'true' && isAdmin;

  const [skill, setSkill] = useState<Skill | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Skill>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadSkill();
  }, [slug]);

  // Enter edit mode after skill is loaded if query param is set
  useEffect(() => {
    if (skill && startInEditMode && !isEditing) {
      setIsEditing(true);
    }
  }, [skill, startInEditMode]);

  const loadSkill = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/skills/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Skill not found');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load skill');
        }
        return;
      }

      const data = await response.json();
      setSkill(data.skill);
      setEditForm(data.skill);
    } catch (err) {
      console.error('Error loading skill:', err);
      setError('Failed to load skill');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!skill?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/skills/${skill.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update skill');
      }

      const data = await response.json();
      setSkill(data.skill);
      setEditForm(data.skill);
      setIsEditing(false);

      // If slug changed, redirect to new URL
      if (data.skill.slug !== slug) {
        router.push(`/discover/skills/${data.skill.slug}`);
      }
    } catch (err: any) {
      console.error('Error saving skill:', err);
      alert(`Failed to save: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!skill?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/skills/${skill.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete skill');
      }

      // Redirect to skills list
      router.push('/discover/skills');
    } catch (err: any) {
      console.error('Error deleting skill:', err);
      alert(`Failed to delete: ${err.message}`);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopySlug = () => {
    if (skill?.slug) {
      navigator.clipboard.writeText(skill.slug);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = () => {
    setEditForm(skill || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading skill...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !skill) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Error</h2>
            <p className="text-stone-600 mb-4">{error || 'Skill not found'}</p>
            <Button onClick={() => router.push('/discover/skills')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Skills
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const categoryConfig = SKILL_CATEGORIES[skill.category] || null;
  const CategoryIcon = categoryConfig?.icon || Sparkles;
  const complexityLevel = getComplexityLevel(skill.complexity_score || 5);
  const complexityBadge = COMPLEXITY_BADGES[complexityLevel];
  const ComplexityIcon = complexityBadge?.icon || AlertCircle;
  const implBadge = IMPLEMENTATION_BADGES[skill.implementation_type] || IMPLEMENTATION_BADGES.prompt;
  const ImplIcon = implBadge?.icon || Sparkles;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Discover', href: '/discover' },
            { label: 'Skills', href: '/discover/skills' },
            { label: skill.name },
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/discover/skills')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold">{skill.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span>{skill.slug}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopySlug}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Admin mode: You can edit and delete this skill
              </span>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge className={skill.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {skill.is_active ? 'Active' : 'Inactive'}
            </Badge>
            <Badge className={categoryConfig?.color || 'bg-gray-100 text-gray-800'}>
              <CategoryIcon className="h-3 w-3 mr-1" />
              {skill.category}
            </Badge>
            <Badge className={complexityBadge.color}>
              <ComplexityIcon className="h-3 w-3 mr-1" />
              {complexityBadge.label} ({skill.complexity_score}/10)
            </Badge>
            <Badge className={implBadge.color}>
              <ImplIcon className="h-3 w-3 mr-1" />
              {implBadge.label}
            </Badge>
          </div>

          {/* Main Content */}
          {isEditing ? (
            // Edit Form
            <Card>
              <CardHeader>
                <CardTitle>Edit Skill</CardTitle>
                <CardDescription>Update the skill details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Skill name"
                  />
                </div>

                {/* Slug */}
                <div className="space-y-2">
                  <Label htmlFor="slug">Slug</Label>
                  <Input
                    id="slug"
                    value={editForm.slug || ''}
                    onChange={(e) => setEditForm({ ...editForm, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '-') })}
                    placeholder="skill-slug"
                  />
                  <p className="text-xs text-gray-500">Used in URLs. Lowercase letters, numbers, and hyphens only.</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Describe what this skill does..."
                    rows={4}
                  />
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editForm.category || ''}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(SKILL_CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Implementation Type */}
                <div className="space-y-2">
                  <Label htmlFor="implementation_type">Implementation Type</Label>
                  <Select
                    value={editForm.implementation_type || 'prompt'}
                    onValueChange={(value) => setEditForm({ ...editForm, implementation_type: value as Skill['implementation_type'] })}
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
                    value={editForm.implementation_ref || ''}
                    onChange={(e) => setEditForm({ ...editForm, implementation_ref: e.target.value })}
                    placeholder="Path or reference to implementation"
                  />
                </div>

                {/* Complexity Score */}
                <div className="space-y-2">
                  <Label>Complexity Score: {editForm.complexity_score || 5}</Label>
                  <Slider
                    value={[editForm.complexity_score || 5]}
                    onValueChange={([value]) => setEditForm({ ...editForm, complexity_score: value })}
                    min={1}
                    max={10}
                    step={1}
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>1 (Basic)</span>
                    <span>5 (Intermediate)</span>
                    <span>10 (Expert)</span>
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-gray-500">Enable or disable this skill</p>
                  </div>
                  <Switch
                    checked={editForm.is_active ?? true}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          ) : (
            // View Mode
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {skill.description || 'No description provided.'}
                  </p>
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Implementation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-500">Type</Label>
                      <p className="font-medium capitalize">{skill.implementation_type?.replace('_', ' ') || 'Unknown'}</p>
                    </div>
                    {skill.implementation_ref && (
                      <div>
                        <Label className="text-gray-500">Reference</Label>
                        <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded">
                          {skill.implementation_ref}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Complexity</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="text-4xl font-bold">{skill.complexity_score}</div>
                      <div className="text-gray-500">/10</div>
                      <Badge className={complexityBadge.color}>
                        {complexityBadge.label}
                      </Badge>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{ width: `${(skill.complexity_score / 10) * 100}%` }}
                      />
                    </div>
                  </CardContent>
                </Card>
              </div>

              {skill.metadata && Object.keys(skill.metadata).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                      {JSON.stringify(skill.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timestamps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Created</Label>
                      <p>{skill.created_at ? new Date(skill.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Last Updated</Label>
                      <p>{skill.updated_at ? new Date(skill.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Skill
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete &quot;{skill.name}&quot;? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>
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

// Loading fallback for Suspense
function SkillDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-6 w-64 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
            <div>
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    </div>
  );
}

// Page component that wraps content in Suspense for useSearchParams
export default function SkillDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  return (
    <Suspense fallback={<SkillDetailLoading />}>
      <SkillDetailContent slug={slug} />
    </Suspense>
  );
}

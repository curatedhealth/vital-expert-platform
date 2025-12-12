'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Sparkles,
  Brain,
  MessageSquare,
  FileSearch,
  Cog,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  Target,
  BarChart3,
  Database,
  Code,
  Layers,
  Shield,
  Users,
  Lightbulb,
  Workflow,
  Plus,
  Pencil,
  Trash2,
  Save,
  X,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/lib/auth/supabase-auth-context';

// Skill categories with icons and colors
const SKILL_CATEGORIES: Record<string, { icon: any; color: string; description: string }> = {
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
    icon: MessageSquare,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Information sharing and reporting'
  },
  'Data Retrieval': {
    icon: Database,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Database and API interactions'
  },
  'Execution': {
    icon: Cog,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'Task execution and automation'
  },
  'File Operations': {
    icon: Layers,
    color: 'bg-slate-100 text-slate-800 border-slate-200',
    description: 'File handling and document processing'
  },
  'Creative & Design': {
    icon: Lightbulb,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Creative and design-related skills'
  },
  'Development & Technical': {
    icon: Code,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Technical and development skills'
  },
};

const COMPLEXITY_BADGES = {
  basic: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Basic' },
  intermediate: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Intermediate' },
  advanced: { color: 'bg-orange-100 text-orange-800', icon: Zap, label: 'Advanced' },
  expert: { color: 'bg-red-100 text-red-800', icon: Brain, label: 'Expert' },
};

// Skill interface matching actual database schema
interface Skill {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  implementation_type: 'prompt' | 'tool' | 'workflow' | 'agent_graph';
  implementation_ref?: string;
  complexity_score: number; // 1-10
  complexity_level?: string; // auto-populated via trigger
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

// Default skill for create form
const DEFAULT_SKILL: Partial<Skill> = {
  name: '',
  slug: '',
  description: '',
  category: '',
  implementation_type: 'prompt',
  implementation_ref: '',
  complexity_score: 5,
  is_active: true,
};

export default function SkillsPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const [skills, setSkills] = useState<Skill[]>([]);
  const [filteredSkills, setFilteredSkills] = useState<Skill[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedComplexity, setSelectedComplexity] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    active: 0,
    byCategory: {} as Record<string, number>,
    byComplexity: {} as Record<string, number>,
    builtin: 0,
    custom: 0,
  });
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSkill, setEditingSkill] = useState<Partial<Skill> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [skillToDelete, setSkillToDelete] = useState<Skill | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSkills();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [searchQuery, selectedCategory, selectedComplexity, skills]);

  const loadSkills = async () => {
    try {
      setLoading(true);
      console.log('Skills page: Loading skills via API...');

      // Use API route which handles authentication and bypasses RLS with service client
      const response = await fetch('/api/skills?limit=10000');

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Error loading skills:', errorData);
        throw new Error(errorData.error || 'Failed to fetch skills');
      }

      const result = await response.json();
      const allSkills = result.skills || [];
      console.log('Skills page: Loaded', allSkills.length, 'skills via API');

      setSkills(allSkills);

      // Calculate stats
      const byCategory: Record<string, number> = {};
      const byComplexity: Record<string, number> = {};
      const byImplementationType: Record<string, number> = {};

      allSkills.forEach((skill: Skill) => {
        if (skill.category) {
          byCategory[skill.category] = (byCategory[skill.category] || 0) + 1;
        }
        // Use complexity_score to determine level
        const level = getComplexityLevel(skill.complexity_score || 5);
        byComplexity[level] = (byComplexity[level] || 0) + 1;

        if (skill.implementation_type) {
          byImplementationType[skill.implementation_type] = (byImplementationType[skill.implementation_type] || 0) + 1;
        }
      });

      setStats({
        total: allSkills.length,
        active: allSkills.filter((s: Skill) => s.is_active).length,
        byCategory,
        byComplexity,
        builtin: allSkills.filter((s: Skill) => s.implementation_type === 'tool').length,
        custom: allSkills.filter((s: Skill) => s.implementation_type === 'prompt' || s.implementation_type === 'workflow').length,
      });

    } catch (error) {
      console.error('Error loading skills:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = [...skills];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(skill =>
        skill.name.toLowerCase().includes(query) ||
        skill.description?.toLowerCase().includes(query) ||
        skill.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    // Complexity filter (using score)
    if (selectedComplexity !== 'all') {
      filtered = filtered.filter(skill => getComplexityLevel(skill.complexity_score || 5) === selectedComplexity);
    }

    setFilteredSkills(filtered);
  };

  const getUniqueCategories = (): string[] => {
    const categories = new Set(skills.map(s => s.category).filter((c): c is string => Boolean(c)));
    return Array.from(categories).sort();
  };

  // Generate slug from name
  const generateSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  // Open modal for creating new skill
  const handleCreateSkill = () => {
    setEditingSkill({ ...DEFAULT_SKILL });
    setError(null);
    setIsModalOpen(true);
  };

  // Open modal for editing skill
  const handleEditSkill = (skill: Skill) => {
    setEditingSkill({ ...skill });
    setError(null);
    setIsModalOpen(true);
  };

  // Save skill (create or update)
  const handleSaveSkill = async () => {
    if (!editingSkill) return;

    // Validation
    if (!editingSkill.name?.trim()) {
      setError('Name is required');
      return;
    }

    const slug = editingSkill.slug || generateSlug(editingSkill.name);
    if (!/^[a-z0-9-]+$/.test(slug)) {
      setError('Slug must be lowercase alphanumeric with hyphens only');
      return;
    }

    if (editingSkill.complexity_score !== undefined &&
        (editingSkill.complexity_score < 1 || editingSkill.complexity_score > 10)) {
      setError('Complexity score must be between 1 and 10');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: editingSkill.name.trim(),
        slug: slug,
        description: editingSkill.description?.trim() || null,
        category: editingSkill.category || null,
        implementation_type: editingSkill.implementation_type || 'prompt',
        implementation_ref: editingSkill.implementation_ref || null,
        complexity_score: editingSkill.complexity_score || 5,
        is_active: editingSkill.is_active ?? true,
        metadata: editingSkill.metadata || {},
      };

      const isUpdate = !!editingSkill.id;
      const url = isUpdate ? `/api/skills/${editingSkill.id}` : '/api/skills';
      const method = isUpdate ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to save skill');
      }

      // Reload skills list
      await loadSkills();
      setIsModalOpen(false);
      setEditingSkill(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save skill');
    } finally {
      setIsSaving(false);
    }
  };

  // Confirm delete
  const handleDeleteConfirm = (skill: Skill) => {
    setSkillToDelete(skill);
    setDeleteConfirmOpen(true);
  };

  // Execute delete
  const handleDeleteSkill = async () => {
    if (!skillToDelete) return;

    setIsSaving(true);
    try {
      const response = await fetch(`/api/skills/${skillToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete skill');
      }

      await loadSkills();
      setDeleteConfirmOpen(false);
      setSkillToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete skill');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={Sparkles}
          title="Skills Registry"
          description="Loading skills..."
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading skills from database...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <PageHeader
          icon={Sparkles}
          title="Skills Registry"
          description={`Catalog of ${stats.total} agent capabilities and skills`}
        />
        {isAdmin && (
          <Button onClick={handleCreateSkill} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Skill
          </Button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Admin mode: You can create, edit, and delete skills
              </span>
            </div>
          )}

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-gray-600">Total</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" />
                  Active
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.active}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                  <Cog className="h-3 w-3" />
                  Built-in
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.builtin}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  Custom
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.custom}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-orange-800 flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  Advanced
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {(stats.byComplexity['advanced'] || 0) + (stats.byComplexity['expert'] || 0)}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-cyan-800 flex items-center gap-1">
                  <Database className="h-3 w-3" />
                  Categories
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">{Object.keys(stats.byCategory).length}</div>
              </CardContent>
            </Card>
          </div>

          {/* Complexity Distribution */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Complexity Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {Object.entries(COMPLEXITY_BADGES).map(([level, config]) => {
                  const count = stats.byComplexity[level] || 0;
                  const Icon = config.icon;
                  return (
                    <div key={level} className="flex items-center gap-3">
                      <Icon className="h-8 w-8 text-gray-400" />
                      <div>
                        <div className="text-2xl font-bold">{count}</div>
                        <div className="text-sm text-gray-500">{config.label}</div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <Card className="mb-8">
            <CardContent className="pt-6">
              <div className="flex flex-col md:flex-row gap-4">
                {/* Search */}
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search skills by name, description, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>

                {/* Category Filter */}
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Categories</option>
                  {getUniqueCategories().map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                {/* Complexity Filter */}
                <select
                  value={selectedComplexity}
                  onChange={(e) => setSelectedComplexity(e.target.value)}
                  className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
                >
                  <option value="all">All Levels</option>
                  <option value="basic">Basic</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>

                {/* Reset */}
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('all');
                    setSelectedComplexity('all');
                  }}
                >
                  Reset
                </Button>
              </div>

              <div className="mt-4 text-sm text-gray-500">
                Showing {filteredSkills.length} of {stats.total} skills
              </div>
            </CardContent>
          </Card>

          {/* Skills Grid */}
          <Tabs defaultValue="grid" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="grid">Grid View</TabsTrigger>
              <TabsTrigger value="list">List View</TabsTrigger>
              <TabsTrigger value="categories">By Category</TabsTrigger>
            </TabsList>

            <TabsContent value="grid">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredSkills.map((skill) => (
                  <SkillCard
                    key={skill.id}
                    skill={skill}
                    isAdmin={isAdmin}
                    onEdit={handleEditSkill}
                    onDelete={handleDeleteConfirm}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="list">
              <div className="space-y-4">
                {filteredSkills.map((skill) => (
                  <SkillListItem
                    key={skill.id}
                    skill={skill}
                    isAdmin={isAdmin}
                    onEdit={handleEditSkill}
                    onDelete={handleDeleteConfirm}
                  />
                ))}
              </div>
            </TabsContent>

            <TabsContent value="categories">
              <div className="space-y-8">
                {getUniqueCategories().map(category => {
                  const categorySkills = filteredSkills.filter(s => s.category === category);
                  if (categorySkills.length === 0) return null;

                  const categoryConfig = SKILL_CATEGORIES[category];
                  const Icon = categoryConfig?.icon || Sparkles;

                  return (
                    <div key={category}>
                      <div className="flex items-center gap-3 mb-4">
                        <Icon className="h-6 w-6" />
                        <h2 className="text-2xl font-bold">{category}</h2>
                        <Badge variant="secondary">{categorySkills.length}</Badge>
                      </div>
                      {categoryConfig?.description && (
                        <p className="text-gray-600 dark:text-gray-400 mb-4">{categoryConfig.description}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {categorySkills.map((skill) => (
                          <SkillCard
                            key={skill.id}
                            skill={skill}
                            compact
                            isAdmin={isAdmin}
                            onEdit={handleEditSkill}
                            onDelete={handleDeleteConfirm}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </TabsContent>
          </Tabs>

          {filteredSkills.length === 0 && !loading && (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-gray-500">No skills found matching your filters.</p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Create/Edit Skill Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSkill?.id ? 'Edit Skill' : 'Create New Skill'}
            </DialogTitle>
            <DialogDescription>
              {editingSkill?.id
                ? 'Update the skill details below'
                : 'Fill in the details to create a new skill'}
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {editingSkill && (
            <div className="space-y-4">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={editingSkill.name || ''}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingSkill({
                      ...editingSkill,
                      name,
                      slug: editingSkill.slug || generateSlug(name),
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
                  value={editingSkill.slug || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, slug: e.target.value.toLowerCase() })}
                  placeholder="e.g., data-analysis"
                />
                <p className="text-xs text-gray-500">Lowercase letters, numbers, and hyphens only</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={editingSkill.description || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, description: e.target.value })}
                  placeholder="Describe what this skill does..."
                  rows={3}
                />
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={editingSkill.category || ''}
                  onValueChange={(value) => setEditingSkill({ ...editingSkill, category: value })}
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
                  value={editingSkill.implementation_type || 'prompt'}
                  onValueChange={(value) => setEditingSkill({
                    ...editingSkill,
                    implementation_type: value as Skill['implementation_type']
                  })}
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
                  value={editingSkill.implementation_ref || ''}
                  onChange={(e) => setEditingSkill({ ...editingSkill, implementation_ref: e.target.value })}
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
                    value={editingSkill.complexity_score || 5}
                    onChange={(e) => setEditingSkill({
                      ...editingSkill,
                      complexity_score: parseInt(e.target.value) || 5
                    })}
                    className="w-24"
                  />
                  <Badge className={COMPLEXITY_BADGES[getComplexityLevel(editingSkill.complexity_score || 5)].color}>
                    {COMPLEXITY_BADGES[getComplexityLevel(editingSkill.complexity_score || 5)].label}
                  </Badge>
                </div>
              </div>

              {/* Active Status */}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingSkill.is_active ?? true}
                  onChange={(e) => setEditingSkill({ ...editingSkill, is_active: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="is_active">Active</Label>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setIsModalOpen(false);
                setEditingSkill(null);
                setError(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveSkill} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {editingSkill?.id ? 'Update' : 'Create'}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Skill</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{skillToDelete?.name}&quot;? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setDeleteConfirmOpen(false);
                setSkillToDelete(null);
              }}
              disabled={isSaving}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteSkill}
              disabled={isSaving}
            >
              {isSaving ? (
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
    </div>
  );
}

// Props interface for SkillCard
interface SkillCardProps {
  skill: Skill;
  compact?: boolean;
  isAdmin?: boolean;
  onEdit?: (skill: Skill) => void;
  onDelete?: (skill: Skill) => void;
  onClick?: (skill: Skill) => void;
}

function SkillCard({ skill, compact = false, isAdmin, onEdit, onDelete, onClick }: SkillCardProps) {
  const categoryConfig = SKILL_CATEGORIES[skill.category] || null;
  const Icon = categoryConfig?.icon || Sparkles;
  const complexityLevel = getComplexityLevel(skill.complexity_score || 5);
  const complexityBadge = COMPLEXITY_BADGES[complexityLevel];
  const ComplexityIcon = complexityBadge?.icon || AlertCircle;

  return (
    <Card className="hover:shadow-lg transition-shadow group cursor-pointer" onClick={() => onClick?.(skill)}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{skill.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {skill.is_active && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                Active
              </Badge>
            )}
            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(skill);
                  }}
                  className="h-7 w-7 p-0"
                >
                  <Pencil className="h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(skill);
                  }}
                  className="h-7 w-7 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            )}
          </div>
        </div>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {skill.description || 'No description available'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {skill.category && (
              <Badge className={categoryConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {skill.category}
              </Badge>
            )}

            {complexityBadge && (
              <Badge className={complexityBadge.color}>
                <ComplexityIcon className="h-3 w-3 mr-1" />
                {complexityBadge.label}
              </Badge>
            )}

            {skill.implementation_type && (
              <Badge className={
                skill.implementation_type === 'tool' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                skill.implementation_type === 'workflow' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                skill.implementation_type === 'prompt' ? 'bg-green-100 text-green-800 border-green-200' :
                'bg-indigo-100 text-indigo-800 border-indigo-200'
              }>
                {skill.implementation_type === 'agent_graph' ? 'Agent Graph' :
                 skill.implementation_type.charAt(0).toUpperCase() + skill.implementation_type.slice(1)}
              </Badge>
            )}
          </div>

          {/* Additional Info */}
          {!compact && (
            <div className="text-xs text-gray-500 space-y-1">
              {skill.complexity_score && <div>Complexity: {skill.complexity_score}/10</div>}
              {skill.slug && <div>Slug: {skill.slug}</div>}
              {skill.implementation_ref && <div className="truncate">Ref: {skill.implementation_ref}</div>}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Props interface for SkillListItem
interface SkillListItemProps {
  skill: Skill;
  isAdmin?: boolean;
  onEdit?: (skill: Skill) => void;
  onDelete?: (skill: Skill) => void;
  onClick?: (skill: Skill) => void;
}

function SkillListItem({ skill, isAdmin, onEdit, onDelete, onClick }: SkillListItemProps) {
  const categoryConfig = SKILL_CATEGORIES[skill.category] || null;
  const Icon = categoryConfig?.icon || Sparkles;
  const complexityLevel = getComplexityLevel(skill.complexity_score || 5);
  const complexityBadge = COMPLEXITY_BADGES[complexityLevel];
  const ComplexityIcon = complexityBadge?.icon || AlertCircle;

  return (
    <Card className="group cursor-pointer" onClick={() => onClick?.(skill)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Icon className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold">{skill.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {skill.description}
              </p>
              {skill.complexity_score && (
                <p className="text-xs text-gray-400 mt-1">
                  Complexity: {skill.complexity_score}/10
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            {skill.category && (
              <Badge className={categoryConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {skill.category}
              </Badge>
            )}

            {complexityBadge && (
              <Badge className={complexityBadge.color}>
                <ComplexityIcon className="h-3 w-3 mr-1" />
                {complexityBadge.label}
              </Badge>
            )}

            {skill.is_active && (
              <Badge className="bg-green-100 text-green-800">
                Active
              </Badge>
            )}

            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit?.(skill)}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete?.(skill)}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Sub-Suite Detail Page - Shows prompts for a specific sub-suite
 *
 * Hierarchy: Prompts Library -> Suites -> Suite -> [Sub-Suite] -> Prompts
 */
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  Loader2,
  Layers,
  FileText,
  Plus,
  Star,
  Shield,
  BookOpen,
  CheckCircle2,
} from 'lucide-react';
import { VitalAssetView, type VitalAsset } from '@vital/ai-ui';
import {
  getSuiteByCode,
  PromptEditModal,
  PromptDeleteModal,
  DEFAULT_PROMPT,
  type Prompt,
  type SubSuite,
} from '@/features/prompts/components';

// Complexity badges
const COMPLEXITY_BADGES: Record<string, { color: string; bgColor: string; label: string }> = {
  basic: { color: 'text-green-700', bgColor: 'bg-green-100', label: 'Basic' },
  intermediary: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Intermediary' },
  intermediate: { color: 'text-blue-700', bgColor: 'bg-blue-100', label: 'Intermediate' },
  advanced: { color: 'text-orange-700', bgColor: 'bg-orange-100', label: 'Advanced' },
  expert: { color: 'text-red-700', bgColor: 'bg-red-100', label: 'Expert' },
};

function promptToAsset(prompt: Prompt): VitalAsset {
  const suiteConfig = getSuiteByCode(prompt.suite?.replace('™', '') || null);
  const complexity = prompt.complexity || prompt.complexity_level || 'basic';
  const complexityConfig = COMPLEXITY_BADGES[complexity] || COMPLEXITY_BADGES.basic;

  return {
    id: prompt.id || '',
    name: prompt.display_name || prompt.title || prompt.name,
    slug: prompt.id || '',
    asset_type: 'prompt',
    description: prompt.description || '',
    category: prompt.sub_suite || prompt.suite || 'General',
    lifecycle_stage: prompt.status || 'active',
    is_active: prompt.is_active ?? true,
    created_at: prompt.created_at,
    updated_at: prompt.updated_at,
    metadata: {
      suite: prompt.suite,
      sub_suite: prompt.sub_suite,
      complexity,
      expert_validated: prompt.expert_validated,
      rag_enabled: prompt.rag_enabled,
      tags: prompt.tags,
      suiteIcon: suiteConfig?.icon,
      suiteColor: suiteConfig?.color,
      complexityLabel: complexityConfig.label,
      complexityColor: complexityConfig.bgColor,
    },
  } as VitalAsset;
}

function SubSuitePageContent() {
  const router = useRouter();
  const params = useParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const suiteCode = params.suite as string;
  const subSuiteCode = decodeURIComponent(params.subSuite as string);
  const suiteConfig = getSuiteByCode(suiteCode);

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [subSuiteInfo, setSubSuiteInfo] = useState<SubSuite | null>(null);
  const [loading, setLoading] = useState(true);

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPrompt, setEditingPrompt] = useState<Partial<Prompt> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [promptToDelete, setPromptToDelete] = useState<Prompt | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, [suiteCode, subSuiteCode]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load prompts
      const response = await fetch('/api/prompts-crud?showAll=true');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      const allPrompts = data.prompts || [];

      // Filter prompts for this sub-suite
      const subSuitePrompts = allPrompts.filter((p: Prompt) => {
        const promptSubSuite = p.sub_suite || '';
        return promptSubSuite === subSuiteCode || promptSubSuite === decodeURIComponent(subSuiteCode);
      });
      setPrompts(subSuitePrompts);

      // Load sub-suite info
      try {
        const prismResponse = await fetch('/api/prism');
        if (prismResponse.ok) {
          const prismData = await prismResponse.json();
          const allSubSuites = prismData.subSuites || [];
          const found = allSubSuites.find((ss: SubSuite) =>
            ss.code === subSuiteCode || ss.name === subSuiteCode
          );
          setSubSuiteInfo(found || null);
        }
      } catch {
        // Sub-suite info optional
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: prompts.length,
    validated: prompts.filter((p) => p.expert_validated).length,
    ragEnabled: prompts.filter((p) => p.rag_enabled).length,
    byComplexity: prompts.reduce((acc, p) => {
      const complexity = p.complexity || p.complexity_level || 'basic';
      acc[complexity] = (acc[complexity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [prompts]);

  const assets = useMemo(() => prompts.map(promptToAsset), [prompts]);

  // Navigation
  const handlePromptClick = (asset: VitalAsset) => {
    router.push(`/prompts/${asset.id}`);
  };

  // CRUD handlers
  const handleCreatePrompt = () => {
    setEditingPrompt({
      ...DEFAULT_PROMPT,
      suite: suiteConfig?.name || suiteCode,
      sub_suite: subSuiteInfo?.name || subSuiteCode,
    });
    setError(null);
    setIsModalOpen(true);
  };

  const handleEditPrompt = (asset: VitalAsset) => {
    router.push(`/prompts/${asset.id}?edit=true`);
  };

  const handleSavePrompt = async () => {
    if (!editingPrompt) return;
    if (!editingPrompt.name?.trim()) {
      setError('Name is required');
      return;
    }

    setIsSaving(true);
    setError(null);

    try {
      const payload = {
        name: editingPrompt.name.trim(),
        display_name: editingPrompt.display_name?.trim() || editingPrompt.name.trim(),
        description: editingPrompt.description?.trim() || '',
        content: editingPrompt.content || '',
        system_prompt: editingPrompt.system_prompt || '',
        user_prompt_template: editingPrompt.user_template || '',
        domain: editingPrompt.domain || 'general',
        complexity_level: editingPrompt.complexity || 'basic',
        suite: editingPrompt.suite || suiteConfig?.name,
        sub_suite: editingPrompt.sub_suite || subSuiteInfo?.name || subSuiteCode,
        tags: editingPrompt.tags || [],
        status: 'active',
      };

      const apiResponse = await fetch('/api/prompts-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await apiResponse.json();
      if (!apiResponse.ok) throw new Error(responseData.error || 'Failed to save prompt');

      await loadData();
      setIsModalOpen(false);
      setEditingPrompt(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save prompt');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (asset: VitalAsset) => {
    const prompt = prompts.find((p) => p.id === asset.id);
    if (prompt) {
      setPromptToDelete(prompt);
      setDeleteConfirmOpen(true);
    }
  };

  const handleDeletePrompt = async () => {
    if (!promptToDelete) return;

    setIsSaving(true);
    try {
      const apiResponse = await fetch(`/api/prompts-crud?id=${promptToDelete.id}`, { method: 'DELETE' });
      if (!apiResponse.ok) {
        const responseData = await apiResponse.json();
        throw new Error(responseData.error || 'Failed to delete prompt');
      }

      await loadData();
      setDeleteConfirmOpen(false);
      setPromptToDelete(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    } finally {
      setIsSaving(false);
    }
  };

  if (!suiteConfig) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-2">Suite Not Found</h2>
        <p className="text-muted-foreground mb-4">The suite &quot;{suiteCode}&quot; does not exist.</p>
        <Button onClick={() => router.push('/prompts/suites')}>Back to Suites</Button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading {subSuiteCode}...</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = suiteConfig.icon;
  const displayName = subSuiteInfo?.name || subSuiteInfo?.fullName || subSuiteCode;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Suites', href: '/prompts/suites' },
            { label: suiteConfig.name, href: `/prompts/suites/${suiteCode}` },
            { label: displayName },
          ]}
        />
      </div>

      {/* Page Header */}
      <div className={`px-6 py-4 border-b ${suiteConfig.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-black/20">
              <Layers className={`h-10 w-10 ${suiteConfig.textColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="outline" className={`${suiteConfig.textColor} ${suiteConfig.borderColor}`}>
                  <Icon className="h-3 w-3 mr-1" />
                  {suiteConfig.name}
                </Badge>
              </div>
              <h1 className={`text-2xl font-bold ${suiteConfig.textColor}`}>
                {displayName}
              </h1>
              {subSuiteInfo?.description && (
                <p className="text-neutral-600 dark:text-neutral-400">
                  {subSuiteInfo.description}
                </p>
              )}
            </div>
          </div>
          {isAdmin && (
            <Button onClick={handleCreatePrompt} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Prompt
            </Button>
          )}
        </div>

        {/* Stats Bar */}
        <div className="flex items-center gap-6 mt-4">
          <Badge variant="secondary" className="text-sm">
            <FileText className="h-3 w-3 mr-1" />
            {stats.total} Prompts
          </Badge>
          {stats.validated > 0 && (
            <Badge variant="secondary" className="text-sm bg-green-100 text-green-700">
              <Star className="h-3 w-3 mr-1" />
              {stats.validated} Validated
            </Badge>
          )}
          {stats.ragEnabled > 0 && (
            <Badge variant="secondary" className="text-sm bg-purple-100 text-purple-700">
              <BookOpen className="h-3 w-3 mr-1" />
              {stats.ragEnabled} RAG Enabled
            </Badge>
          )}
        </div>
      </div>

      {/* Admin Badge */}
      {isAdmin && (
        <div className="px-6 pt-4">
          <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <Shield className="h-4 w-4 text-blue-600" />
            <span className="text-sm text-blue-700 dark:text-blue-300">
              Admin mode: You can create, edit, and delete prompts in this sub-suite
            </span>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          {/* Complexity Distribution */}
          {stats.total > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3">Complexity Distribution</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(stats.byComplexity).map(([level, count]) => {
                  const config = COMPLEXITY_BADGES[level] || COMPLEXITY_BADGES.basic;
                  return (
                    <Badge key={level} className={`${config.bgColor} ${config.color}`}>
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      {config.label}: {count}
                    </Badge>
                  );
                })}
              </div>
            </div>
          )}

          {/* Prompts */}
          {assets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Prompts</h3>
                <p className="text-muted-foreground mb-4">
                  This sub-suite doesn&apos;t have any prompts yet.
                </p>
                {isAdmin && (
                  <Button onClick={handleCreatePrompt}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create First Prompt
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <VitalAssetView
              assets={assets}
              viewMode="grid"
              showViewToggle
              availableViews={['grid', 'list', 'table']}
              showSearch
              searchPlaceholder="Search prompts..."
              showSort
              showRefresh
              onRefresh={loadData}
              isAdmin={isAdmin}
              cardVariant="rich"
              gridColumns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
              onAssetClick={handlePromptClick}
              onEdit={handleEditPrompt}
              onDelete={handleDeleteConfirm}
            />
          )}

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push(`/prompts/suites/${suiteCode}`)}>
              ← Back to {suiteConfig.name}
            </Button>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={() => router.push('/prompts/suites')}>
                All Suites
              </Button>
              <Button variant="outline" onClick={() => router.push('/prompts')}>
                Prompts Library
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <PromptEditModal
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingPrompt(null); setError(null); }}
        prompt={editingPrompt}
        onPromptChange={setEditingPrompt}
        onSave={handleSavePrompt}
        isSaving={isSaving}
        error={error}
      />

      <PromptDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={() => { setDeleteConfirmOpen(false); setPromptToDelete(null); }}
        prompt={promptToDelete}
        onConfirm={handleDeletePrompt}
        isDeleting={isSaving}
      />
    </div>
  );
}

function SubSuitePageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-5 w-64 bg-stone-200 rounded animate-pulse" />
      </div>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-stone-200 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-4 w-24 bg-stone-200 rounded animate-pulse" />
            <div className="h-6 w-40 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function SubSuitePage() {
  return (
    <Suspense fallback={<SubSuitePageLoading />}>
      <SubSuitePageContent />
    </Suspense>
  );
}

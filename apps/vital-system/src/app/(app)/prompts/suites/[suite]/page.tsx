/**
 * Suite Detail Page - Shows sub-suites and prompts for a specific suite
 *
 * Hierarchy: Prompts Library -> Suites -> [Suite] -> Sub-Suites -> Prompts
 */
'use client';

import React, { useState, useEffect, useMemo, Suspense } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  Loader2,
  ArrowRight,
  Layers,
  FileText,
  Plus,
  CheckCircle2,
  Star,
  Shield,
} from 'lucide-react';
import { VitalAssetView, type VitalAsset } from '@vital/ai-ui';
import {
  PRISM_SUITES,
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

function SuitePageContent() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const suiteCode = params.suite as string;
  const suiteConfig = getSuiteByCode(suiteCode);
  const activeTab = searchParams.get('tab') || 'sub-suites';

  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [subSuites, setSubSuites] = useState<SubSuite[]>([]);
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
  }, [suiteCode]);

  const loadData = async () => {
    try {
      setLoading(true);

      // Load prompts
      const response = await fetch('/api/prompts-crud?showAll=true');
      if (!response.ok) throw new Error('Failed to fetch prompts');
      const data = await response.json();
      const allPrompts = data.prompts || [];

      // Filter prompts for this suite
      const suitePrompts = allPrompts.filter((p: Prompt) => {
        const promptSuite = p.suite || '';
        return (
          promptSuite === suiteConfig?.name ||
          promptSuite === suiteCode ||
          promptSuite.replace('™', '') === suiteCode
        );
      });
      setPrompts(suitePrompts);

      // Load sub-suites
      try {
        const prismResponse = await fetch('/api/prism');
        if (prismResponse.ok) {
          const prismData = await prismResponse.json();
          const allSubSuites = prismData.subSuites || [];
          const filtered = allSubSuites.filter((ss: SubSuite) => {
            const ssCode = ss.suiteCode || '';
            return ssCode === suiteCode || ssCode === suiteConfig?.name;
          });
          setSubSuites(filtered);
        }
      } catch {
        // Sub-suites optional
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
    bySubSuite: prompts.reduce((acc, p) => {
      const subSuite = p.sub_suite || 'Uncategorized';
      acc[subSuite] = (acc[subSuite] || 0) + 1;
      return acc;
    }, {} as Record<string, number>),
  }), [prompts]);

  const assets = useMemo(() => prompts.map(promptToAsset), [prompts]);

  // Navigation
  const handleSubSuiteClick = (subSuite: SubSuite) => {
    router.push(`/prompts/suites/${suiteCode}/${encodeURIComponent(subSuite.code)}`);
  };

  const handlePromptClick = (asset: VitalAsset) => {
    router.push(`/prompts/${asset.id}`);
  };

  const handleTabChange = (tab: string) => {
    router.push(`/prompts/suites/${suiteCode}?tab=${tab}`);
  };

  // CRUD handlers
  const handleCreatePrompt = () => {
    setEditingPrompt({
      ...DEFAULT_PROMPT,
      suite: suiteConfig?.name || suiteCode,
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
        tags: editingPrompt.tags || [],
        status: 'active',
      };

      const response = await fetch('/api/prompts-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const responseData = await response.json();
      if (!response.ok) throw new Error(responseData.error || 'Failed to save prompt');

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
      const response = await fetch(`/api/prompts-crud?id=${promptToDelete.id}`, { method: 'DELETE' });
      if (!response.ok) {
        const responseData = await response.json();
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
            <p className="text-stone-600">Loading {suiteConfig.name}...</p>
          </div>
        </div>
      </div>
    );
  }

  const Icon = suiteConfig.icon;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Prompts', href: '/prompts' },
            { label: 'Suites', href: '/prompts/suites' },
            { label: suiteConfig.name },
          ]}
        />
      </div>

      {/* Page Header */}
      <div className={`px-6 py-4 border-b ${suiteConfig.bgColor}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-xl bg-white/80 dark:bg-black/20">
              <Icon className={`h-10 w-10 ${suiteConfig.textColor}`} />
            </div>
            <div>
              <h1 className={`text-2xl font-bold ${suiteConfig.textColor}`}>
                {suiteConfig.name}
              </h1>
              <p className="text-neutral-600 dark:text-neutral-400">
                {suiteConfig.fullName} • {suiteConfig.description}
              </p>
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
          <Badge variant="secondary" className="text-sm">
            <Layers className="h-3 w-3 mr-1" />
            {subSuites.length} Sub-Suites
          </Badge>
          {stats.validated > 0 && (
            <Badge variant="secondary" className="text-sm bg-green-100 text-green-700">
              <Star className="h-3 w-3 mr-1" />
              {stats.validated} Validated
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
              Admin mode: You can create, edit, and delete prompts in this suite
            </span>
          </div>
        </div>
      )}

      {/* Main Content with Tabs */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="mb-6">
              <TabsTrigger value="sub-suites" className="gap-2">
                <Layers className="h-4 w-4" />
                Sub-Suites ({subSuites.length})
              </TabsTrigger>
              <TabsTrigger value="prompts" className="gap-2">
                <FileText className="h-4 w-4" />
                All Prompts ({stats.total})
              </TabsTrigger>
            </TabsList>

            {/* Sub-Suites Tab */}
            <TabsContent value="sub-suites">
              {subSuites.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Sub-Suites</h3>
                    <p className="text-muted-foreground mb-4">
                      This suite doesn&apos;t have sub-suites defined yet.
                    </p>
                    <Button variant="outline" onClick={() => handleTabChange('prompts')}>
                      View All Prompts
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {subSuites.map((subSuite) => {
                    const count = stats.bySubSuite[subSuite.name] || stats.bySubSuite[subSuite.code] || 0;

                    return (
                      <Card
                        key={subSuite.id}
                        className={`cursor-pointer transition-all hover:shadow-md hover:scale-[1.01] ${suiteConfig.borderColor}`}
                        onClick={() => handleSubSuiteClick(subSuite)}
                      >
                        <CardHeader className="pb-2">
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">
                              {subSuite.name || subSuite.code}
                            </CardTitle>
                            <ArrowRight className="h-4 w-4 text-muted-foreground" />
                          </div>
                          {subSuite.fullName && (
                            <CardDescription>{subSuite.fullName}</CardDescription>
                          )}
                        </CardHeader>
                        <CardContent>
                          {subSuite.description && (
                            <p className="text-sm text-muted-foreground mb-3">
                              {subSuite.description}
                            </p>
                          )}
                          <Badge variant="secondary">
                            {count} prompt{count !== 1 ? 's' : ''}
                          </Badge>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            {/* All Prompts Tab */}
            <TabsContent value="prompts">
              {assets.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Prompts</h3>
                    <p className="text-muted-foreground mb-4">
                      This suite doesn&apos;t have any prompts yet.
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
                  gridColumns={{ sm: 1, md: 2, lg: 3 }}
                  onAssetClick={handlePromptClick}
                  onEdit={handleEditPrompt}
                  onDelete={handleDeleteConfirm}
                />
              )}
            </TabsContent>
          </Tabs>

          {/* Navigation */}
          <div className="mt-8 flex items-center justify-between">
            <Button variant="outline" onClick={() => router.push('/prompts/suites')}>
              ← Back to All Suites
            </Button>
            <Button variant="outline" onClick={() => router.push('/prompts')}>
              Prompts Library
            </Button>
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

function SuitePageLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-5 w-48 bg-stone-200 rounded animate-pulse" />
      </div>
      <div className="px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-stone-200 rounded-xl animate-pulse" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-stone-200 rounded animate-pulse" />
            <div className="h-4 w-64 bg-stone-200 rounded animate-pulse" />
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    </div>
  );
}

export default function SuitePage() {
  return (
    <Suspense fallback={<SuitePageLoading />}>
      <SuitePageContent />
    </Suspense>
  );
}

/**
 * Knowledge Page
 *
 * Unified view for RAG Knowledge Bases.
 * Supports CRUD operations, batch selection, and multiple view modes.
 * Follows the same pattern as Skills/Tools/Prompts pages.
 */
'use client';

import { useState, useCallback, useEffect, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Database,
  FileText,
  Search,
  Plus,
  Trash2,
  X,
  Wrench,
  BarChart3,
  BookOpen,
  Loader2,
  AlertCircle,
  MoreHorizontal,
  Edit,
  Eye,
  Grid3X3,
  List,
  CheckSquare,
  Table,
  Kanban,
  RefreshCw,
  CheckCircle2,
  Clock,
  Archive,
  AlertTriangle,
  Shield,
  Stethoscope,
  FlaskConical,
  TrendingUp,
} from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Input } from '@vital/ui';
import { Checkbox } from '@vital/ui';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@vital/ui';

import { AssetOverviewStats, type StatCardConfig } from '@/components/shared/AssetOverviewStats';
import { ActiveFiltersBar } from '@/components/shared/ActiveFiltersBar';
import { useAssetFilters, type ViewMode } from '@/hooks/useAssetFilters';
import { KnowledgeAnalyticsDashboard } from '@/features/knowledge/components/knowledge-analytics-dashboard';
import { KnowledgeViewer } from '@/features/knowledge/components/knowledge-viewer';

// Import RAG V2 modals
import {
  RagEditModalV2,
  RagDeleteModal,
  RagBatchDeleteModal,
  DEFAULT_RAG_VALUES,
  type Rag,
  THERAPEUTIC_AREAS,
  KNOWLEDGE_DOMAINS,
  LIFECYCLE_STATUS,
  ACCESS_LEVELS,
} from '@/features/rag/components';

// =============================================================================
// Types
// =============================================================================

interface RagKnowledgeBase {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  purpose_description?: string;
  rag_type: 'global' | 'agent-specific' | 'tenant';
  access_level: 'public' | 'organization' | 'private' | 'confidential';
  status: 'draft' | 'active' | 'review' | 'deprecated' | 'archived';
  knowledge_domains: string[];
  therapeutic_areas?: string[];
  document_count: number;
  total_chunks?: number;
  quality_score?: number;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
}

// =============================================================================
// Helper Functions
// =============================================================================

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function getStatusVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'active': return 'default';
    case 'draft': return 'secondary';
    case 'deprecated':
    case 'archived': return 'destructive';
    default: return 'outline';
  }
}

function getRagTypeVariant(type: string): 'default' | 'secondary' | 'outline' {
  switch (type) {
    case 'global': return 'default';
    case 'agent-specific': return 'secondary';
    default: return 'outline';
  }
}

// =============================================================================
// RAG Card Component
// =============================================================================

interface RagCardProps {
  rag: RagKnowledgeBase;
  isSelected: boolean;
  isSelectionMode: boolean;
  onToggleSelect: () => void;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  viewMode: 'grid' | 'list';
}

function RagCard({ rag, isSelected, isSelectionMode, onToggleSelect, onClick, onEdit, onDelete, viewMode }: RagCardProps) {
  const displayStatus = rag.status || 'active';
  const displayAccess = rag.access_level || 'organization';
  const displayChunks = rag.total_chunks ?? 0;
  const displayDocs = rag.document_count ?? 1;
  const domainBadges = rag.knowledge_domains?.length
    ? rag.knowledge_domains.slice(0, 2)
    : ['unassigned'];
  const extraDomainCount = Math.max(0, (rag.knowledge_domains?.length || 0) - domainBadges.length);
  const sourceLabel = rag.purpose_description || rag.metadata?.source || 'Pinecone';

  if (viewMode === 'list') {
    return (
      <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-4">
            {isSelectionMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Database className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <div className="flex-1 min-w-0" onClick={onClick}>
              <div className="flex items-center gap-2">
                <h3 className="font-medium truncate">{rag.display_name}</h3>
                <Badge variant={getStatusVariant(displayStatus)} className="text-xs">
                  {displayStatus}
                </Badge>
                <Badge variant="outline" className="text-xs capitalize">
                  {displayAccess}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground truncate">{rag.description || 'No description'}</p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                {domainBadges.map((d) => (
                  <Badge key={d} variant="secondary" className="text-2xs capitalize">
                    {d}
                  </Badge>
                ))}
                {extraDomainCount > 0 && (
                  <Badge variant="secondary" className="text-2xs">+{extraDomainCount}</Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>{formatNumber(displayDocs)} docs</span>
              <span>{formatNumber(displayChunks)} chunks</span>
              <span className="text-2xs text-muted-foreground truncate max-w-[120px]">{sourceLabel}</span>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={onClick}>
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onEdit}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={onDelete} className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Grid view (default)
  return (
    <Card className={`hover:shadow-md transition-shadow cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2 flex-1 min-w-0" onClick={onClick}>
            {isSelectionMode && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelect}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Database className="h-5 w-5 text-muted-foreground flex-shrink-0" />
            <h3 className="font-medium truncate">{rag.display_name}</h3>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={onClick}>
                <Eye className="h-4 w-4 mr-2" />
                View
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/designer/knowledge?base=${rag.id}`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Manage in Designer
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className="text-destructive">
                <Trash2 className="h-4 w-4 mr-2" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-3" onClick={onClick}>
          {rag.description || 'No description'}
        </p>

        <div className="flex items-center gap-2 flex-wrap mb-3">
          <Badge variant={getStatusVariant(displayStatus)}>
            {displayStatus}
          </Badge>
          <Badge variant={getRagTypeVariant(rag.rag_type)}>
            {rag.rag_type.replace('-', ' ')}
          </Badge>
          <Badge variant="outline" className="capitalize">
            {displayAccess}
          </Badge>
          {domainBadges.map((d) => (
            <Badge key={d} variant="secondary" className="text-2xs capitalize">
              {d}
            </Badge>
          ))}
          {extraDomainCount > 0 && (
            <Badge variant="secondary" className="text-2xs">+{extraDomainCount}</Badge>
          )}
        </div>

        <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <FileText className="h-3 w-3" />
            <span>{formatNumber(displayDocs)} docs</span>
          </div>
          <div className="flex items-center gap-1">
            <BookOpen className="h-3 w-3" />
            <span>{formatNumber(displayChunks)} chunks</span>
          </div>
          <div className="col-span-2 flex items-center gap-2 text-2xs text-muted-foreground">
            <span className="truncate">{sourceLabel}</span>
          </div>
        </div>

        {rag.knowledge_domains.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-3">
            {rag.knowledge_domains.slice(0, 3).map((domain) => (
              <Badge key={domain} variant="outline" className="text-xs">
                {domain.replace(/-/g, ' ')}
              </Badge>
            ))}
            {rag.knowledge_domains.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{rag.knowledge_domains.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// Knowledge Page Content
// =============================================================================

function KnowledgePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Use shared asset filters hook
  const {
    viewParam,
    isOverviewMode,
    handleViewModeChange,
    searchParam,
    handleSearchChange,
    getFilterParam,
    activeFilters,
    removeFilter,
    clearAllFilters,
  } = useAssetFilters({
    basePath: '/knowledge',
    filterKeys: ['domain', 'category', 'status', 'access', 'therapeutic'],
  });

  // RAG state
  const [rags, setRags] = useState<RagKnowledgeBase[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // CRUD state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRag, setEditingRag] = useState<Partial<Rag> | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [ragToDelete, setRagToDelete] = useState<Partial<Rag> | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  // Batch selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [batchDeleteConfirmOpen, setBatchDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [domainOptions, setDomainOptions] = useState<{ value: string; label: string; category?: string }[]>(KNOWLEDGE_DOMAINS);

  // Get current filters from URL
  const currentDomain = getFilterParam('domain');
  const currentCategory = getFilterParam('category');
  const currentStatus = getFilterParam('status');
  const currentAccess = getFilterParam('access');
  const currentTherapeutic = getFilterParam('therapeutic');

  // =============================================================================
  // Domain catalog (live fetch with fallback to static constants)
  // =============================================================================

  useEffect(() => {
    let isMounted = true;
    const fetchDomains = async () => {
      try {
        const res = await fetch('/api/knowledge-domains');
        if (!res.ok) return;
        const body = await res.json();
        if (isMounted && Array.isArray(body.domains) && body.domains.length > 0) {
          const mapped = body.domains
            .filter((d: any) => d.slug && d.name)
            .map((d: any) => ({
              value: d.slug,
              label: d.name,
              category: d.domain_type || 'uncategorized',
            }));
          if (mapped.length > 0) {
            setDomainOptions(mapped);
          }
        }
      } catch (err) {
        console.warn('[Knowledge] Failed to load live knowledge domains, using static fallback.', err);
      }
    };

    fetchDomains();
    return () => {
      isMounted = false;
    };
  }, []);

  const domainMap = useMemo(
    () => new Map(domainOptions.map(d => [d.value, d])),
    [domainOptions]
  );

  // =============================================================================
  // Data Loading
  // =============================================================================

  const loadRags = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch('/api/knowledge/bases');
      if (!res.ok) {
        throw new Error('Failed to load knowledge bases');
      }
      const body = await res.json();
      if (Array.isArray(body.bases)) {
        setRags(body.bases);
      } else {
        setRags([]);
      }
    } catch (err) {
      console.error('Error loading RAGs:', err);
      setError(err instanceof Error ? err.message : 'Failed to load knowledge bases');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadRags();
  }, [loadRags]);

  // =============================================================================
  // Filtering
  // =============================================================================

  const filteredRags = useMemo(() => {
    return rags.filter(rag => {
      // Search filter
      const matchesSearch = !searchParam ||
        rag.name.toLowerCase().includes(searchParam.toLowerCase()) ||
        rag.display_name.toLowerCase().includes(searchParam.toLowerCase()) ||
        rag.description?.toLowerCase().includes(searchParam.toLowerCase());

      // Domain filter
      const matchesDomain = !currentDomain ||
        rag.knowledge_domains.includes(currentDomain);

      // Category filter (maps to domain category)
      const matchesCategory = !currentCategory ||
        rag.knowledge_domains.some(d => {
          const domain = domainMap.get(d);
          return domain?.category === currentCategory;
        });

      // Status filter
      const matchesStatus = !currentStatus || rag.status === currentStatus;

      // Access filter
      const matchesAccess = !currentAccess || rag.access_level === currentAccess;

      // Therapeutic area filter
      const matchesTherapeutic = !currentTherapeutic ||
        rag.therapeutic_areas?.includes(currentTherapeutic);

      return matchesSearch && matchesDomain && matchesCategory && matchesStatus && matchesAccess && matchesTherapeutic;
    });
  }, [rags, searchParam, currentDomain, currentCategory, currentStatus, currentAccess, currentTherapeutic]);

  // =============================================================================
  // Stats
  // =============================================================================

  const totalDocuments = rags.reduce((acc, r) => acc + r.document_count, 0);
  const totalChunks = rags.reduce((acc, r) => acc + (r.total_chunks || 0), 0);
  const activeRags = rags.filter(r => r.status === 'active').length;
  const draftRags = rags.filter(r => r.status === 'draft').length;
  const reviewRags = rags.filter(r => r.status === 'review').length;
  const avgQuality = rags.length > 0
    ? rags.reduce((acc, r) => acc + (r.quality_score || 0), 0) / rags.length
    : 0;

  // Derived domain list for filters (hide empty status/access filters if no data)
  const uniqueStatuses = Array.from(new Set(rags.map(r => r.status).filter(Boolean)));
  const uniqueAccess = Array.from(new Set(rags.map(r => r.access_level).filter(Boolean)));

  const statsCards: StatCardConfig[] = [
    { label: 'Knowledge Bases', value: rags.length, icon: Database },
    { label: 'Active', value: activeRags, icon: CheckCircle2, variant: 'success' as const },
    { label: 'Draft', value: draftRags, icon: Clock, variant: 'warning' as const },
    { label: 'Under Review', value: reviewRags, icon: AlertTriangle, variant: 'info' as const },
  ];

  // =============================================================================
  // CRUD Handlers
  // =============================================================================

  const handleCreateRag = () => {
    setEditingRag({ ...DEFAULT_RAG_VALUES });
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleEditRag = (rag: RagKnowledgeBase) => {
    setEditingRag(rag as unknown as Partial<Rag>);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveRag = async (data: Rag) => {
    setIsSaving(true);
    setFormError(null);

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      await loadRags();
      setIsModalOpen(false);
      setEditingRag(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to save knowledge base');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteConfirm = (rag: RagKnowledgeBase) => {
    setRagToDelete(rag as unknown as Partial<Rag>);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteRag = async () => {
    if (!ragToDelete?.id) return;

    setIsDeleting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));

      await loadRags();
      setDeleteConfirmOpen(false);
      setRagToDelete(null);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete knowledge base');
    } finally {
      setIsDeleting(false);
    }
  };

  // =============================================================================
  // Batch Selection Handlers
  // =============================================================================

  const handleToggleSelect = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredRags.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredRags.map(r => r.id)));
    }
  };

  const handleBatchDelete = async () => {
    if (selectedIds.size === 0) return;

    setIsDeleting(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));

      await loadRags();
      setBatchDeleteConfirmOpen(false);
      setSelectedIds(new Set());
      setIsSelectionMode(false);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Failed to delete knowledge bases');
    } finally {
      setIsDeleting(false);
    }
  };

  const exitSelectionMode = () => {
    setIsSelectionMode(false);
    setSelectedIds(new Set());
  };

  // =============================================================================
  // Navigation
  // =============================================================================

  const handleRagClick = (rag: RagKnowledgeBase) => {
    router.push(`/designer/knowledge?rag=${rag.id}`);
  };

  // Determine effective view mode for display
  const effectiveViewMode = viewParam === 'overview' || !viewParam ? 'grid' : viewParam;

  // =============================================================================
  // Render
  // =============================================================================

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-4 px-6 py-3 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5" />
          <h1 className="text-lg font-semibold">Knowledge Bases</h1>
        </div>
        <div className="flex-1" />

        {/* Batch Selection Controls */}
        {isSelectionMode ? (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">
              {selectedIds.size} selected
            </span>
            <Button variant="outline" size="sm" onClick={handleSelectAll}>
              {selectedIds.size === filteredRags.length ? 'Deselect All' : 'Select All'}
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setBatchDeleteConfirmOpen(true)}
              disabled={selectedIds.size === 0}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete ({selectedIds.size})
            </Button>
            <Button variant="ghost" size="sm" onClick={exitSelectionMode}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/designer/knowledge">
                <Wrench className="h-4 w-4 mr-2" />
                Designer
              </Link>
            </Button>
            <Button variant="outline" size="sm" asChild>
              <Link href="/designer/knowledge">
                <Database className="h-4 w-4 mr-2" />
                Manage Bases
              </Link>
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsSelectionMode(true)}>
              <CheckSquare className="h-4 w-4 mr-2" />
              Select
            </Button>
            <Button size="sm" onClick={handleCreateRag}>
              <Plus className="h-4 w-4 mr-2" />
              Create RAG
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Active Filters Bar */}
          <ActiveFiltersBar
            filters={activeFilters}
            filteredCount={filteredRags.length}
            totalCount={rags.length}
            onRemoveFilter={removeFilter}
            onClearAll={clearAllFilters}
            colorScheme="purple"
          />

          {/* Overview Mode - Stats & Quick Info */}
          {isOverviewMode && (
            <>
              <AssetOverviewStats stats={statsCards} />

              {/* Additional Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Documents</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{formatNumber(totalDocuments)}</p>
                    <p className="text-xs text-muted-foreground">across all RAGs</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BookOpen className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Total Chunks</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{formatNumber(totalChunks)}</p>
                    <p className="text-xs text-muted-foreground">indexed for retrieval</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Avg Quality</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{(avgQuality * 100).toFixed(0)}%</p>
                    <p className="text-xs text-muted-foreground">embedding quality</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <TrendingUp className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Domains Covered</span>
                    </div>
                    <p className="text-2xl font-bold mt-1">{new Set(rags.flatMap(r => r.knowledge_domains)).size}</p>
                    <p className="text-xs text-muted-foreground">unique knowledge domains</p>
                  </CardContent>
                </Card>
              </div>
            </>
          )}

          {/* Search and View Toggle */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search knowledge bases..."
                value={searchParam || ''}
                onChange={(e) => handleSearchChange(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" size="sm" onClick={loadRags}>
              <RefreshCw className="h-4 w-4" />
            </Button>
            <div className="flex items-center border rounded-md">
              <Button
                variant={effectiveViewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('grid')}
                className="rounded-r-none"
              >
                <Grid3X3 className="h-4 w-4" />
              </Button>
              <Button
                variant={effectiveViewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('list')}
                className="rounded-none border-x"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                variant={effectiveViewMode === 'table' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('table')}
                className="rounded-none border-r"
              >
                <Table className="h-4 w-4" />
              </Button>
              <Button
                variant={effectiveViewMode === 'kanban' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => handleViewModeChange('kanban')}
                className="rounded-l-none"
              >
                <Kanban className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Content */}
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : error ? (
            <Card>
              <CardContent className="p-6 text-center">
                <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">Failed to Load</h3>
                <p className="text-muted-foreground mb-4">{error}</p>
                <Button variant="outline" onClick={loadRags}>
                  Try Again
                </Button>
              </CardContent>
            </Card>
          ) : filteredRags.length === 0 ? (
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <h3 className="text-lg font-medium mb-2">No Knowledge Bases Found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchParam || activeFilters.length > 0
                    ? 'No knowledge bases match your filters.'
                    : 'Create your first RAG knowledge base to get started.'}
                </p>
                {searchParam || activeFilters.length > 0 ? (
                  <Button variant="outline" onClick={clearAllFilters}>
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleCreateRag}>
                    <Plus className="h-4 w-4 mr-2" />
                    Create RAG
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : effectiveViewMode === 'kanban' ? (
            // Kanban View - Group by status
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {['draft', 'active', 'review', 'deprecated'].map(status => {
                const statusRags = filteredRags.filter(r => r.status === status);
                const statusConfig = LIFECYCLE_STATUS.find(s => s.value === status);
                return (
                  <div key={status} className="bg-muted/30 rounded-lg p-3">
                    <div className="flex items-center gap-2 mb-3">
                      <div className={`h-2 w-2 rounded-full bg-${statusConfig?.color || 'gray'}-500`} />
                      <span className="font-medium capitalize">{status}</span>
                      <Badge variant="secondary" className="ml-auto">{statusRags.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {statusRags.map(rag => (
                        <RagCard
                          key={rag.id}
                          rag={rag}
                          viewMode="grid"
                          isSelected={selectedIds.has(rag.id)}
                          isSelectionMode={isSelectionMode}
                          onToggleSelect={() => handleToggleSelect(rag.id)}
                          onClick={() => handleRagClick(rag)}
                          onEdit={() => handleEditRag(rag)}
                          onDelete={() => handleDeleteConfirm(rag)}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : effectiveViewMode === 'table' ? (
            // Table View
            <Card>
              <CardContent className="p-0">
                <table className="w-full">
                  <thead className="border-b">
                    <tr>
                      {isSelectionMode && <th className="p-3 w-10" />}
                      <th className="p-3 text-left font-medium">Name</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-left font-medium">Type</th>
                      <th className="p-3 text-left font-medium">Documents</th>
                      <th className="p-3 text-left font-medium">Chunks</th>
                      <th className="p-3 text-left font-medium">Quality</th>
                      <th className="p-3 w-10" />
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRags.map(rag => (
                      <tr key={rag.id} className="border-b hover:bg-muted/50 cursor-pointer" onClick={() => handleRagClick(rag)}>
                        {isSelectionMode && (
                          <td className="p-3" onClick={(e) => e.stopPropagation()}>
                            <Checkbox
                              checked={selectedIds.has(rag.id)}
                              onCheckedChange={() => handleToggleSelect(rag.id)}
                            />
                          </td>
                        )}
                        <td className="p-3">
                          <div className="flex items-center gap-2">
                            <Database className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{rag.display_name}</span>
                          </div>
                        </td>
                        <td className="p-3">
                          <Badge variant={getStatusVariant(rag.status)}>{rag.status}</Badge>
                        </td>
                        <td className="p-3">
                          <Badge variant={getRagTypeVariant(rag.rag_type)}>{rag.rag_type}</Badge>
                        </td>
                        <td className="p-3 text-muted-foreground">{formatNumber(rag.document_count)}</td>
                        <td className="p-3 text-muted-foreground">{formatNumber(rag.total_chunks || 0)}</td>
                        <td className="p-3 text-muted-foreground">{((rag.quality_score || 0) * 100).toFixed(0)}%</td>
                        <td className="p-3" onClick={(e) => e.stopPropagation()}>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleRagClick(rag)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleEditRag(rag)}>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onClick={() => handleDeleteConfirm(rag)} className="text-destructive">
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </CardContent>
            </Card>
          ) : (
            // Grid or List View
            <div className={effectiveViewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'
              : 'space-y-3'
            }>
              {filteredRags.map((rag) => (
                <RagCard
                  key={rag.id}
                  rag={rag}
                  viewMode={effectiveViewMode === 'list' ? 'list' : 'grid'}
                  isSelected={selectedIds.has(rag.id)}
                  isSelectionMode={isSelectionMode}
                  onToggleSelect={() => handleToggleSelect(rag.id)}
                  onClick={() => handleRagClick(rag)}
                  onEdit={() => handleEditRag(rag)}
                  onDelete={() => handleDeleteConfirm(rag)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <RagEditModalV2
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingRag(null);
          setFormError(null);
        }}
        rag={editingRag}
        onSave={handleSaveRag}
        isSaving={isSaving}
        error={formError}
      />

      <RagDeleteModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setRagToDelete(null);
        }}
        rag={ragToDelete}
        onConfirm={handleDeleteRag}
        isDeleting={isDeleting}
      />

      <RagBatchDeleteModal
        isOpen={batchDeleteConfirmOpen}
        onClose={() => setBatchDeleteConfirmOpen(false)}
        count={selectedIds.size}
        onConfirm={handleBatchDelete}
        isDeleting={isDeleting}
      />
    </div>
  );
}

// =============================================================================
// Export
// =============================================================================

export default function KnowledgePage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <KnowledgePageContent />
    </Suspense>
  );
}

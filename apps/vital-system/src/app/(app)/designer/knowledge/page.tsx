'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  BookOpen,
  Upload,
  Database,
  Link2,
  BarChart3,
  Plus,
  FolderOpen,
  Layers,
  Search,
  RefreshCw,
  ExternalLink,
  AlertCircle,
  FileText,
  CheckCircle2,
  Clock,
  XCircle,
  Sparkles,
  Hash,
  Target,
  Zap,
} from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';

// Import existing knowledge components
import { KnowledgeUploader } from '@/features/knowledge/components/knowledge-uploader';
import { KnowledgeUploadWithMetadata } from '@/features/knowledge/components/knowledge-upload-with-metadata';
import { DomainDetailsDialog } from '@/features/knowledge/components/DomainDetailsDialog';
import { KnowledgeAnalyticsDashboard } from '@/features/knowledge/components/knowledge-analytics-dashboard';
import { EntityVerificationWorkflow } from '@/features/knowledge/components/entity-verification-workflow';
import { CitationManagementDashboard } from '@/features/knowledge/components/citation-management-dashboard';
import { KnowledgeGraphVisualization } from '@/features/knowledge/components/knowledge-graph-visualization';
import { SearchAnalyticsDashboard } from '@/features/knowledge/components/search-analytics-dashboard';

// Import citation components
import { CitationDisplay } from '@/features/chat/components/citation-display';

// Type definitions for search (matching API response structure)
interface MatchedEntity {
  entity_id: string;
  entity_type: string;
  entity_text: string;
  match_type: 'exact' | 'partial' | 'semantic';
  confidence: number;
}

interface SearchResult {
  chunk_id: string;
  document_id: string;
  content: string;
  metadata: any;
  scores: {
    vector?: number;
    keyword?: number;
    entity?: number;
    combined: number;
  };
  matched_entities?: MatchedEntity[];
  source_title?: string;
  domain?: string;
}

// Types
interface KnowledgeDomain {
  domain_id: string;
  domain_name: string;
  description?: string;
  tier: number;
  priority: number;
  document_count: number;
  is_active: boolean;
  function_name?: string;
  embedding_model?: string;
}

interface KnowledgeDocument {
  id: string;
  name: string;
  type: string;
  size: number;
  uploadedAt: string;
  status: 'processing' | 'completed' | 'failed' | 'pending';
  domain: string | null;
  chunks: number;
}

interface KnowledgeStats {
  totalDomains: number;
  totalDocuments: number;
  totalChunks: number;
  recentUploads: number;
}

// External Evidence Types
interface ClinicalTrialResult {
  id: string;
  nctId: string;
  title: string;
  status: string;
  phase: string;
  conditions: string[];
  interventions: string[];
  sponsor: string;
  startDate?: string;
  completionDate?: string;
  enrollmentCount?: number;
  studyType: string;
  url: string;
  sourceType: 'clinical-trial';
}

interface FDAResult {
  id: string;
  brandName: string;
  genericName: string;
  manufacturer: string;
  approvalDate: string;
  indication: string;
  route: string[];
  substanceName: string;
  approvalType: string;
  url: string;
  sourceType: 'fda-approval';
}

interface PubMedResult {
  id: string;
  pmid: string;
  title: string;
  authors: string[];
  journal: string;
  publicationDate: string;
  abstract: string | null;
  doi: string | null;
  url: string;
  sourceType: 'pubmed';
}

interface GuidanceResult {
  note: string;
  searchUrl: string;
  instructions: string[];
  resources: { name: string; url: string; description: string }[];
  sourceType: 'ema-guidance' | 'who-guidance';
  whatIsEML?: {
    purpose: string;
    coreList: string;
    complementaryList: string;
  };
}

interface ExternalSource {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  status: 'connected' | 'available' | 'coming_soon';
  apiAvailable: boolean;
  searchExample: string;
}

function KnowledgeBuilderContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeTab = searchParams.get('tab') || 'overview';

  // State
  const [domains, setDomains] = useState<KnowledgeDomain[]>([]);
  const [documents, setDocuments] = useState<KnowledgeDocument[]>([]);
  const [stats, setStats] = useState<KnowledgeStats>({
    totalDomains: 0,
    totalDocuments: 0,
    totalChunks: 0,
    recentUploads: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain | null>(null);

  // Fetch all data (domains + documents)
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch domains and documents in parallel
      const [domainsResponse, documentsResponse] = await Promise.all([
        fetch('/api/knowledge-domains'),
        fetch('/api/knowledge/documents'),
      ]);

      // Process domains
      let rawDomains: { id: string; name: string }[] = [];
      if (domainsResponse.ok) {
        const domainsData = await domainsResponse.json();
        rawDomains = domainsData.domains || [];
      }

      // Process documents
      let rawDocuments: KnowledgeDocument[] = [];
      if (documentsResponse.ok) {
        const documentsData = await documentsResponse.json();
        if (documentsData.success) {
          rawDocuments = documentsData.documents || [];
        }
      }

      // Calculate document counts per domain
      const domainCounts: Record<string, number> = {};
      rawDocuments.forEach((doc) => {
        const domainKey = doc.domain || 'unassigned';
        domainCounts[domainKey] = (domainCounts[domainKey] || 0) + 1;
      });

      // Build enhanced domain objects
      const enhancedDomains: KnowledgeDomain[] = rawDomains.map((d, index) => ({
        domain_id: d.id || d.name,
        domain_name: d.name,
        description: `Knowledge domain for ${d.name}`,
        tier: index < 3 ? 1 : index < 8 ? 2 : 3, // Auto-assign tiers based on order
        priority: index + 1,
        document_count: domainCounts[d.name] || 0,
        is_active: true,
        function_name: 'General',
        embedding_model: 'text-embedding-3-small',
      }));

      // Add domains discovered from documents (not in domain list)
      const existingDomainNames = new Set(rawDomains.map((d) => d.name));
      Object.keys(domainCounts).forEach((domainName) => {
        if (!existingDomainNames.has(domainName) && domainName !== 'unassigned') {
          enhancedDomains.push({
            domain_id: domainName,
            domain_name: domainName,
            description: `Auto-discovered domain from documents`,
            tier: 3,
            priority: enhancedDomains.length + 1,
            document_count: domainCounts[domainName],
            is_active: true,
            function_name: 'Discovered',
            embedding_model: 'text-embedding-3-small',
          });
        }
      });

      // Calculate stats
      const totalChunks = rawDocuments.reduce((sum, doc) => sum + (doc.chunks || 0), 0);
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const recentUploads = rawDocuments.filter(
        (doc) => new Date(doc.uploadedAt) > sevenDaysAgo
      ).length;

      setDomains(enhancedDomains);
      setDocuments(rawDocuments);
      setStats({
        totalDomains: enhancedDomains.length,
        totalDocuments: rawDocuments.length,
        totalChunks,
        recentUploads,
      });
    } catch (err) {
      console.error('Failed to fetch knowledge data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load data');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`/designer/knowledge?tab=${value}`);
  };

  // Handle upload complete
  const handleUploadComplete = () => {
    fetchData();
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={BookOpen}
        title="Knowledge Builder"
        description="Create, configure, and manage knowledge bases for AI agents"
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/knowledge">
                <ExternalLink className="h-4 w-4 mr-2" />
                View Knowledge Library
              </Link>
            </Button>
            <Button size="sm" onClick={() => handleTabChange('upload')}>
              <Plus className="h-4 w-4 mr-2" />
              Upload Documents
            </Button>
          </div>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6">
          <Tabs value={activeTab} onValueChange={handleTabChange} className="space-y-6">
            <TabsList className="grid w-full grid-cols-7 lg:w-auto lg:inline-grid">
              <TabsTrigger value="overview" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Overview</span>
              </TabsTrigger>
              <TabsTrigger value="domains" className="gap-2">
                <Database className="h-4 w-4" />
                <span className="hidden sm:inline">Domains</span>
              </TabsTrigger>
              <TabsTrigger value="upload" className="gap-2">
                <Upload className="h-4 w-4" />
                <span className="hidden sm:inline">Upload</span>
              </TabsTrigger>
              <TabsTrigger value="query" className="gap-2">
                <Search className="h-4 w-4" />
                <span className="hidden sm:inline">Query</span>
              </TabsTrigger>
              <TabsTrigger value="embeddings" className="gap-2">
                <Layers className="h-4 w-4" />
                <span className="hidden sm:inline">Embeddings</span>
              </TabsTrigger>
              <TabsTrigger value="connections" className="gap-2">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Connections</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="entities" className="gap-2">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Entities</span>
              </TabsTrigger>
              <TabsTrigger value="citations" className="gap-2">
                <BookOpen className="h-4 w-4" />
                <span className="hidden sm:inline">Citations</span>
              </TabsTrigger>
              <TabsTrigger value="graph" className="gap-2">
                <Link2 className="h-4 w-4" />
                <span className="hidden sm:inline">Graph</span>
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              {/* Error Alert */}
              {error && (
                <Card className="border-destructive bg-destructive/10">
                  <CardContent className="py-4">
                    <div className="flex items-center gap-3">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <div className="flex-1">
                        <p className="font-medium text-destructive">Failed to load knowledge data</p>
                        <p className="text-sm text-muted-foreground">{error}</p>
                      </div>
                      <Button variant="outline" size="sm" onClick={fetchData}>
                        Retry
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Knowledge Domains</CardTitle>
                    <Database className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDomains}</div>
                    <p className="text-xs text-muted-foreground">Active knowledge domains</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Documents</CardTitle>
                    <FolderOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalDocuments}</div>
                    <p className="text-xs text-muted-foreground">Total documents indexed</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Vector Chunks</CardTitle>
                    <Layers className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalChunks.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Embedded text chunks</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Recent Uploads</CardTitle>
                    <Upload className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.recentUploads}</div>
                    <p className="text-xs text-muted-foreground">Last 7 days</p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>Common knowledge management tasks</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid gap-4 md:grid-cols-3">
                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => handleTabChange('upload')}
                    >
                      <Upload className="h-6 w-6" />
                      <div className="text-sm font-medium">Upload Documents</div>
                      <div className="text-xs text-muted-foreground">Add new documents to knowledge base</div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => handleTabChange('domains')}
                    >
                      <Database className="h-6 w-6" />
                      <div className="text-sm font-medium">Manage Domains</div>
                      <div className="text-xs text-muted-foreground">Configure knowledge domains</div>
                    </Button>

                    <Button
                      variant="outline"
                      className="h-auto py-4 flex-col gap-2"
                      onClick={() => handleTabChange('connections')}
                    >
                      <Link2 className="h-6 w-6" />
                      <div className="text-sm font-medium">Agent Connections</div>
                      <div className="text-xs text-muted-foreground">Map agents to knowledge bases</div>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Domains */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Knowledge Domains</CardTitle>
                    <CardDescription>Your configured knowledge domains</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Refresh
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : domains.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No knowledge domains configured yet.</p>
                      <Button variant="link" onClick={() => handleTabChange('domains')}>
                        Create your first domain
                      </Button>
                    </div>
                  ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                      {domains.slice(0, 6).map((domain) => (
                        <Card
                          key={domain.domain_id}
                          className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedDomain(domain)}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between">
                              <div className="space-y-1">
                                <h4 className="font-medium text-sm">{domain.domain_name}</h4>
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {domain.description || 'No description'}
                                </p>
                              </div>
                              <Badge variant={domain.tier === 1 ? 'default' : 'secondary'}>
                                Tier {domain.tier}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
                              <span>{domain.document_count || 0} docs</span>
                              <span>•</span>
                              <span>{domain.function_name || 'General'}</span>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                  {domains.length > 6 && (
                    <div className="mt-4 text-center">
                      <Button variant="link" onClick={() => handleTabChange('domains')}>
                        View all {domains.length} domains
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Recent Documents */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Recent Documents</CardTitle>
                    <CardDescription>Latest uploaded documents in your knowledge base</CardDescription>
                  </div>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/knowledge?tab=manage">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View All
                    </Link>
                  </Button>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="flex items-center justify-center py-8">
                      <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                    </div>
                  ) : documents.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No documents uploaded yet.</p>
                      <Button variant="link" onClick={() => handleTabChange('upload')}>
                        Upload your first document
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {documents.slice(0, 5).map((doc) => (
                        <div
                          key={doc.id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <FileText className="h-5 w-5 text-muted-foreground" />
                            <div>
                              <p className="font-medium text-sm line-clamp-1">{doc.name}</p>
                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{doc.domain || 'Unassigned'}</span>
                                <span>•</span>
                                <span>{doc.chunks} chunks</span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {doc.status === 'completed' && (
                              <Badge className="bg-green-500/10 text-green-600 hover:bg-green-500/20">
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                                Indexed
                              </Badge>
                            )}
                            {doc.status === 'processing' && (
                              <Badge variant="secondary" className="animate-pulse">
                                <Clock className="h-3 w-3 mr-1" />
                                Processing
                              </Badge>
                            )}
                            {doc.status === 'failed' && (
                              <Badge variant="destructive">
                                <XCircle className="h-3 w-3 mr-1" />
                                Failed
                              </Badge>
                            )}
                            {doc.status === 'pending' && (
                              <Badge variant="outline">
                                <Clock className="h-3 w-3 mr-1" />
                                Pending
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                      {documents.length > 5 && (
                        <div className="text-center pt-2">
                          <Button variant="link" asChild>
                            <Link href="/knowledge?tab=manage">
                              View all {documents.length} documents
                            </Link>
                          </Button>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Domains Tab */}
            <TabsContent value="domains" className="space-y-6">
              <DomainsManager
                domains={domains}
                loading={loading}
                onRefresh={fetchData}
                onSelectDomain={setSelectedDomain}
              />
            </TabsContent>

            {/* Upload Tab */}
            <TabsContent value="upload" className="space-y-6">
              <UploadManager onUploadComplete={handleUploadComplete} domains={domains} />
            </TabsContent>

            {/* Query Tab */}
            <TabsContent value="query" className="space-y-6">
              <QueryManager domains={domains} />
            </TabsContent>

            {/* Embeddings Tab */}
            <TabsContent value="embeddings" className="space-y-6">
              <EmbeddingsManager domains={domains} stats={stats} documents={documents} />
            </TabsContent>

            {/* Connections Tab */}
            <TabsContent value="connections" className="space-y-6">
              <ConnectionsManager domains={domains} />
            </TabsContent>

            {/* Analytics Tab */}
            <TabsContent value="analytics" className="space-y-6">
              {/* Search Analytics - Query patterns and performance */}
              <SearchAnalyticsDashboard />

              {/* General Knowledge Analytics - Documents and domains */}
              <KnowledgeAnalyticsDashboard />
            </TabsContent>

            {/* Entities Tab - Entity Verification Workflow */}
            <TabsContent value="entities" className="space-y-6">
              <EntityVerificationWorkflow />
            </TabsContent>

            {/* Citations Tab - Citation Management Dashboard */}
            <TabsContent value="citations" className="space-y-6">
              <CitationManagementDashboard />
            </TabsContent>

            {/* Graph Tab - Knowledge Graph Visualization */}
            <TabsContent value="graph" className="space-y-6">
              <KnowledgeGraphVisualization />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Domain Details Dialog */}
      {selectedDomain && (
        <DomainDetailsDialog
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
          onUpdate={fetchData}
          onDelete={fetchData}
        />
      )}
    </div>
  );
}

// Domains Manager Component
function DomainsManager({
  domains,
  loading,
  onRefresh,
  onSelectDomain,
}: {
  domains: KnowledgeDomain[];
  loading: boolean;
  onRefresh: () => void;
  onSelectDomain: (domain: KnowledgeDomain) => void;
}) {
  const [searchQuery, setSearchQuery] = useState('');
  const [tierFilter, setTierFilter] = useState<number | 'all'>('all');

  const filteredDomains = domains.filter((domain) => {
    const matchesSearch =
      domain.domain_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      domain.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = tierFilter === 'all' || domain.tier === tierFilter;
    return matchesSearch && matchesTier;
  });

  // Group by tier
  const tier1 = filteredDomains.filter((d) => d.tier === 1);
  const tier2 = filteredDomains.filter((d) => d.tier === 2);
  const tier3 = filteredDomains.filter((d) => d.tier === 3);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h3 className="text-lg font-semibold">Knowledge Domains</h3>
          <p className="text-sm text-muted-foreground">
            Configure and manage your knowledge domain settings
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search domains..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-64 rounded-md border border-input bg-background pl-8 pr-3 text-sm"
            />
          </div>
          <select
            value={tierFilter === 'all' ? 'all' : tierFilter.toString()}
            onChange={(e) => setTierFilter(e.target.value === 'all' ? 'all' : parseInt(e.target.value))}
            className="h-9 rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="all">All Tiers</option>
            <option value="1">Tier 1 - Core</option>
            <option value="2">Tier 2 - Standard</option>
            <option value="3">Tier 3 - Extended</option>
          </select>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      ) : filteredDomains.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <Database className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No domains found</h3>
            <p className="text-muted-foreground">
              {searchQuery || tierFilter !== 'all'
                ? 'Try adjusting your search or filters'
                : 'Create your first knowledge domain to get started'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Tier 1 - Core */}
          {tier1.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Badge>Tier 1</Badge> Core Domains ({tier1.length})
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {tier1.map((domain) => (
                  <DomainCard key={domain.domain_id} domain={domain} onClick={() => onSelectDomain(domain)} />
                ))}
              </div>
            </div>
          )}

          {/* Tier 2 - Standard */}
          {tier2.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Badge variant="secondary">Tier 2</Badge> Standard Domains ({tier2.length})
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {tier2.map((domain) => (
                  <DomainCard key={domain.domain_id} domain={domain} onClick={() => onSelectDomain(domain)} />
                ))}
              </div>
            </div>
          )}

          {/* Tier 3 - Extended */}
          {tier3.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-3 flex items-center gap-2">
                <Badge variant="outline">Tier 3</Badge> Extended Domains ({tier3.length})
              </h4>
              <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                {tier3.map((domain) => (
                  <DomainCard key={domain.domain_id} domain={domain} onClick={() => onSelectDomain(domain)} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Domain Card Component
function DomainCard({ domain, onClick }: { domain: KnowledgeDomain; onClick: () => void }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all hover:border-primary/50" onClick={onClick}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h4 className="font-medium text-sm line-clamp-1">{domain.domain_name}</h4>
          <Badge
            variant={domain.is_active ? 'default' : 'secondary'}
            className={domain.is_active ? 'bg-green-500/10 text-green-600' : ''}
          >
            {domain.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
          {domain.description || 'No description provided'}
        </p>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <FolderOpen className="h-3 w-3" />
            {domain.document_count || 0} docs
          </span>
          <span>•</span>
          <span>{domain.function_name || 'General'}</span>
        </div>
        {domain.embedding_model && (
          <div className="mt-2 text-xs text-muted-foreground truncate">
            Model: {domain.embedding_model}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Embeddings Manager Component
function EmbeddingsManager({
  domains,
  stats,
  documents,
}: {
  domains: KnowledgeDomain[];
  stats: KnowledgeStats;
  documents: KnowledgeDocument[];
}) {
  const processingDocs = documents.filter((d) => d.status === 'processing');
  const failedDocs = documents.filter((d) => d.status === 'failed');
  const completedDocs = documents.filter((d) => d.status === 'completed');

  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalChunks.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Total Vector Chunks</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{completedDocs.length}</div>
            <p className="text-xs text-muted-foreground">Indexed Documents</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-yellow-600">{processingDocs.length}</div>
            <p className="text-xs text-muted-foreground">Processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-red-600">{failedDocs.length}</div>
            <p className="text-xs text-muted-foreground">Failed</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layers className="h-5 w-5" />
            Embedding Configuration
          </CardTitle>
          <CardDescription>
            Configure embedding models and manage vector stores for your knowledge bases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Embedding Models */}
          <div>
            <h4 className="font-medium mb-3">Available Embedding Models</h4>
            <div className="grid gap-3 md:grid-cols-2">
              <Card className="border-primary/50">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">text-embedding-3-large</h5>
                    <Badge>Recommended</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    3072 dimensions, best quality for semantic search
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium text-sm">text-embedding-3-small</h5>
                    <Badge variant="secondary">Cost Effective</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    1536 dimensions, good balance of quality and cost
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Vector Store Status */}
          <div>
            <h4 className="font-medium mb-3">Vector Store Status</h4>
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
                    <div>
                      <p className="font-medium text-sm">Pinecone Vector Store</p>
                      <p className="text-xs text-muted-foreground">
                        {stats.totalChunks.toLocaleString()} vectors stored across {domains.length} domains
                      </p>
                    </div>
                  </div>
                  <Badge variant="outline" className="bg-green-500/10 text-green-600">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Connected
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Processing Queue */}
          <div>
            <h4 className="font-medium mb-3">Processing Queue</h4>
            {processingDocs.length > 0 ? (
              <div className="space-y-2">
                {processingDocs.slice(0, 5).map((doc) => (
                  <Card key={doc.id}>
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <Badge variant="secondary">Processing</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-sm">All documents have been processed</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Failed Documents */}
          {failedDocs.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 text-destructive">Failed Documents</h4>
              <div className="space-y-2">
                {failedDocs.slice(0, 5).map((doc) => (
                  <Card key={doc.id} className="border-destructive/50">
                    <CardContent className="py-3 px-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <XCircle className="h-4 w-4 text-destructive" />
                          <span className="text-sm font-medium">{doc.name}</span>
                        </div>
                        <Button variant="outline" size="sm">
                          Retry
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Query Manager Component
function QueryManager({ domains }: { domains: KnowledgeDomain[] }) {
  const [query, setQuery] = useState('');
  const [strategy, setStrategy] = useState<'hybrid' | 'vector' | 'keyword' | 'entity'>('hybrid');
  const [selectedDomain, setSelectedDomain] = useState<string>('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchStats, setSearchStats] = useState<{ time: number; strategy: string } | null>(null);

  // Convert SearchResult to Citation format for CitationDisplay
  const resultsToCitations = (searchResults: SearchResult[]) => {
    return searchResults.map((result, idx) => ({
      id: result.chunk_id || `result-${idx}`,
      type: 'knowledge-base' as const,
      title: result.source_title || `Document Chunk ${idx + 1}`,
      source: result.domain || 'Knowledge Base',
      url: `/knowledge/documents/${result.document_id}`,
      relevance: result.scores.combined,
      date: result.metadata?.uploadedAt || undefined,
    }));
  };

  const handleSearch = async () => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      // Call API route instead of direct import (server-side only)
      const response = await fetch('/api/knowledge/hybrid-search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: query,
          domain: selectedDomain || undefined,
          strategy,
          maxResults: 20,
          similarityThreshold: 0.6,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || 'Search failed');
      }

      const data = await response.json();
      setResults(data.results || []);
      setSearchStats({
        time: Date.now() - startTime,
        strategy,
      });
    } catch (err) {
      console.error('Search failed:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSearch();
    }
  };

  const getStrategyIcon = (strat: string) => {
    switch (strat) {
      case 'vector': return <Layers className="h-4 w-4" />;
      case 'keyword': return <Hash className="h-4 w-4" />;
      case 'entity': return <Target className="h-4 w-4" />;
      case 'hybrid': return <Zap className="h-4 w-4" />;
      default: return <Search className="h-4 w-4" />;
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return 'bg-green-500';
    if (score >= 0.6) return 'bg-yellow-500';
    return 'bg-orange-500';
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Knowledge Search
          </CardTitle>
          <CardDescription>
            Search your knowledge base using hybrid entity-aware search with vector, keyword, and entity matching
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Input */}
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search knowledge base... (e.g., 'FDA approval process for biologics')"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyPress}
                className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              />
            </div>
            <Button onClick={handleSearch} disabled={loading || !query.trim()}>
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              ) : (
                <>
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </>
              )}
            </Button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            {/* Strategy Selector */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Strategy:</span>
              <div className="flex gap-1 p-1 bg-muted rounded-lg">
                {(['hybrid', 'vector', 'keyword', 'entity'] as const).map((strat) => (
                  <Button
                    key={strat}
                    variant={strategy === strat ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setStrategy(strat)}
                    className="gap-1.5 capitalize"
                  >
                    {getStrategyIcon(strat)}
                    {strat}
                  </Button>
                ))}
              </div>
            </div>

            {/* Domain Filter */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Domain:</span>
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">All Domains</option>
                {domains.map((domain) => (
                  <option key={domain.domain_id} value={domain.domain_name}>
                    {domain.domain_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Strategy Info */}
          <div className="p-3 bg-muted/50 rounded-lg text-sm">
            <div className="flex items-start gap-2">
              {getStrategyIcon(strategy)}
              <div>
                <span className="font-medium capitalize">{strategy} Search</span>
                <span className="text-muted-foreground ml-2">
                  {strategy === 'hybrid' && '- Combines vector similarity, keyword matching, and entity recognition for best results'}
                  {strategy === 'vector' && '- Pure semantic similarity using OpenAI embeddings'}
                  {strategy === 'keyword' && '- Full-text search using PostgreSQL for exact keyword matches'}
                  {strategy === 'entity' && '- Matches medical entities (medications, diagnoses, procedures) extracted from content'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Error Alert */}
      {error && (
        <Card className="border-destructive bg-destructive/10">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="font-medium text-destructive">Search failed</p>
                <p className="text-sm text-muted-foreground">{error}</p>
              </div>
              <Button variant="outline" size="sm" onClick={handleSearch}>
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <>
          {/* Results Stats */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className="gap-1">
                <FileText className="h-3 w-3" />
                {results.length} results
              </Badge>
              {searchStats && (
                <>
                  <Badge variant="secondary" className="gap-1">
                    <Clock className="h-3 w-3" />
                    {searchStats.time}ms
                  </Badge>
                  <Badge variant="secondary" className="gap-1 capitalize">
                    {getStrategyIcon(searchStats.strategy)}
                    {searchStats.strategy}
                  </Badge>
                </>
              )}
            </div>
          </div>

          {/* Results List */}
          <div className="space-y-4">
            {results.map((result, idx) => (
              <Card key={result.chunk_id || idx} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    {/* Rank & Score */}
                    <div className="flex flex-col items-center gap-1">
                      <span className="text-lg font-bold text-muted-foreground">#{idx + 1}</span>
                      <div className={`w-8 h-1.5 rounded-full ${getScoreColor(result.scores.combined)}`} />
                      <span className="text-xs text-muted-foreground">
                        {Math.round(result.scores.combined * 100)}%
                      </span>
                    </div>

                    {/* Content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-medium text-sm">
                          {result.source_title || `Document ${result.document_id?.slice(0, 8)}`}
                        </h4>
                        <div className="flex gap-1 flex-shrink-0">
                          {result.domain && (
                            <Badge variant="outline" className="text-xs">
                              {result.domain}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Content Preview */}
                      <p className="text-sm text-muted-foreground line-clamp-3">
                        {result.content}
                      </p>

                      {/* Scores Breakdown */}
                      <div className="flex flex-wrap gap-2 text-xs">
                        {result.scores.vector !== undefined && (
                          <Badge variant="secondary" className="gap-1">
                            <Layers className="h-3 w-3" />
                            Vector: {Math.round((result.scores.vector || 0) * 100)}%
                          </Badge>
                        )}
                        {result.scores.keyword !== undefined && (
                          <Badge variant="secondary" className="gap-1">
                            <Hash className="h-3 w-3" />
                            Keyword: {Math.round((result.scores.keyword || 0) * 100)}%
                          </Badge>
                        )}
                        {result.scores.entity !== undefined && (
                          <Badge variant="secondary" className="gap-1">
                            <Target className="h-3 w-3" />
                            Entity: {Math.round((result.scores.entity || 0) * 100)}%
                          </Badge>
                        )}
                      </div>

                      {/* Matched Entities */}
                      {result.matched_entities && result.matched_entities.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          <span className="text-xs text-muted-foreground">Matched:</span>
                          {result.matched_entities.map((entity: MatchedEntity, eIdx: number) => (
                            <Badge
                              key={eIdx}
                              variant="outline"
                              className="text-xs bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950 dark:text-purple-300"
                            >
                              <Sparkles className="h-3 w-3 mr-1" />
                              {entity.entity_text}
                              <span className="ml-1 text-[10px] opacity-70">
                                ({entity.entity_type})
                              </span>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Citation Display */}
          <CitationDisplay
            citations={resultsToCitations(results)}
            format="apa"
          />
        </>
      )}

      {/* Empty State */}
      {!loading && results.length === 0 && query && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-lg font-medium mb-2">No results found</h3>
            <p className="text-muted-foreground text-sm">
              Try adjusting your search query or changing the search strategy
            </p>
          </CardContent>
        </Card>
      )}

      {/* Initial State */}
      {!loading && results.length === 0 && !query && (
        <Card>
          <CardContent className="py-12 text-center">
            <div className="max-w-md mx-auto space-y-4">
              <div className="p-4 bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900 rounded-full w-16 h-16 mx-auto flex items-center justify-center">
                <Sparkles className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-medium">Entity-Aware Hybrid Search</h3>
              <p className="text-muted-foreground text-sm">
                Search your knowledge base using our advanced hybrid search that combines:
              </p>
              <div className="grid grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-muted rounded-lg">
                  <Layers className="h-5 w-5 mx-auto mb-1 text-blue-500" />
                  <div className="font-medium">Vector</div>
                  <div className="text-muted-foreground">Semantic similarity</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Hash className="h-5 w-5 mx-auto mb-1 text-green-500" />
                  <div className="font-medium">Keyword</div>
                  <div className="text-muted-foreground">Full-text search</div>
                </div>
                <div className="p-3 bg-muted rounded-lg">
                  <Target className="h-5 w-5 mx-auto mb-1 text-purple-500" />
                  <div className="font-medium">Entity</div>
                  <div className="text-muted-foreground">Medical entities</div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                Try searching for: "FDA approval process for biologics" or "aspirin 325mg cardiovascular"
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// Upload Manager Component
function UploadManager({
  onUploadComplete,
  domains,
}: {
  onUploadComplete: () => void;
  domains: KnowledgeDomain[];
}) {
  const [uploadMode, setUploadMode] = useState<'basic' | 'enhanced'>('enhanced');

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Upload Documents
              </CardTitle>
              <CardDescription>
                Add documents to your knowledge base. Supported formats: PDF, Word, Excel, CSV, TXT
              </CardDescription>
            </div>
            <div className="flex items-center gap-2 p-1 bg-muted rounded-lg">
              <Button
                variant={uploadMode === 'basic' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUploadMode('basic')}
                className="gap-2"
              >
                <Upload className="h-4 w-4" />
                Basic
              </Button>
              <Button
                variant={uploadMode === 'enhanced' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setUploadMode('enhanced')}
                className="gap-2"
              >
                <Layers className="h-4 w-4" />
                Enhanced
                <Badge variant="secondary" className="ml-1 text-xs">AI</Badge>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {uploadMode === 'basic' ? (
            <KnowledgeUploader onUploadComplete={onUploadComplete} />
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/30 dark:to-purple-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Layers className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h4 className="font-medium text-sm">Enhanced Upload with AI Metadata Extraction</h4>
                    <p className="text-xs text-muted-foreground mt-1">
                      Automatically extracts metadata from filenames and content using pattern matching
                      and optional AI analysis. Generates standardized filenames for better organization.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Badge variant="outline" className="text-xs">Source Detection</Badge>
                      <Badge variant="outline" className="text-xs">Document Type</Badge>
                      <Badge variant="outline" className="text-xs">Year Extraction</Badge>
                      <Badge variant="outline" className="text-xs">Therapeutic Area</Badge>
                      <Badge variant="outline" className="text-xs">Regulatory Body</Badge>
                    </div>
                  </div>
                </div>
              </div>
              <KnowledgeUploadWithMetadata
                onUploadComplete={onUploadComplete}
                defaultDomain={domains.length > 0 ? domains[0].domain_name : 'regulatory_affairs'}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Upload Tips */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Upload Tips</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <h5 className="font-medium">Naming Convention</h5>
                <p className="text-xs text-muted-foreground">
                  Use format: Source_Type_Year_Title.pdf for best auto-detection
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <Database className="h-4 w-4 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h5 className="font-medium">Domain Selection</h5>
                <p className="text-xs text-muted-foreground">
                  Choose the right domain for accurate agent context retrieval
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 dark:bg-orange-900 rounded-lg">
                <CheckCircle2 className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <h5 className="font-medium">Review Metadata</h5>
                <p className="text-xs text-muted-foreground">
                  Verify extracted metadata before uploading for best results
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// External Evidence Result Renderers
function ClinicalTrialResultCard({ result }: { result: ClinicalTrialResult }) {
  const statusColor = {
    'RECRUITING': 'bg-green-500',
    'ACTIVE_NOT_RECRUITING': 'bg-yellow-500',
    'COMPLETED': 'bg-blue-500',
    'TERMINATED': 'bg-red-500',
    'WITHDRAWN': 'bg-gray-500',
  }[result.status?.toUpperCase()] || 'bg-gray-400';

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className={`w-2 h-full min-h-[60px] rounded-full ${statusColor}`} />
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
              <Badge variant="outline" className="shrink-0 text-xs font-mono">
                {result.nctId}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {result.phase || 'Phase N/A'}
              </Badge>
              <Badge variant="outline" className="text-xs capitalize">
                {result.status?.toLowerCase().replace(/_/g, ' ')}
              </Badge>
              {result.enrollmentCount && (
                <Badge variant="outline" className="text-xs">
                  {result.enrollmentCount.toLocaleString()} enrolled
                </Badge>
              )}
            </div>
            {result.conditions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Conditions:</span> {result.conditions.slice(0, 3).join(', ')}
                {result.conditions.length > 3 && ` +${result.conditions.length - 3} more`}
              </p>
            )}
            {result.interventions.length > 0 && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Interventions:</span> {result.interventions.slice(0, 2).join(', ')}
                {result.interventions.length > 2 && ` +${result.interventions.length - 2} more`}
              </p>
            )}
            <div className="flex items-center justify-between pt-2">
              <span className="text-xs text-muted-foreground">{result.sponsor}</span>
              <Button variant="ghost" size="sm" asChild>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                  View on ClinicalTrials.gov
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FDAResultCard({ result }: { result: FDAResult }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-red-100 dark:bg-red-900 text-red-600">
            <ShieldIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h4 className="font-medium text-sm">{result.brandName}</h4>
                <p className="text-xs text-muted-foreground">{result.genericName}</p>
              </div>
              <Badge variant="outline" className="shrink-0 text-xs font-mono">
                {result.id}
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {result.approvalType}
              </Badge>
              {result.route.length > 0 && (
                <Badge variant="outline" className="text-xs capitalize">
                  {result.route.join(', ')}
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              <span className="font-medium">Manufacturer:</span> {result.manufacturer}
            </p>
            {result.approvalDate !== 'N/A' && (
              <p className="text-xs text-muted-foreground">
                <span className="font-medium">Approved:</span> {result.approvalDate}
              </p>
            )}
            <div className="flex items-center justify-end pt-2">
              <Button variant="ghost" size="sm" asChild>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                  View on FDA
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PubMedResultCard({ result }: { result: PubMedResult }) {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-lg bg-orange-100 dark:bg-orange-900 text-orange-600">
            <BookOpenIcon className="h-5 w-5" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h4 className="font-medium text-sm line-clamp-2">{result.title}</h4>
              <Badge variant="outline" className="shrink-0 text-xs font-mono">
                {result.id}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              {result.authors.slice(0, 3).join(', ')}
              {result.authors.length > 3 && ` et al.`}
            </p>
            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="text-xs">
                {result.journal}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {result.publicationDate}
              </Badge>
              {result.doi && (
                <Badge variant="outline" className="text-xs font-mono">
                  DOI
                </Badge>
              )}
            </div>
            <div className="flex items-center justify-end pt-2">
              <Button variant="ghost" size="sm" asChild>
                <a href={result.url} target="_blank" rel="noopener noreferrer" className="gap-1">
                  View on PubMed
                  <ExternalLink className="h-3 w-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function GuidanceResultCard({ result, sourceName }: { result: GuidanceResult; sourceName: string }) {
  const isWHO = result.sourceType === 'who-guidance';
  const iconColor = isWHO ? 'bg-green-100 dark:bg-green-900 text-green-600' : 'bg-blue-100 dark:bg-blue-900 text-blue-600';

  return (
    <div className="space-y-4">
      {/* Info Card */}
      <Card className="border-amber-200 bg-amber-50/50 dark:bg-amber-950/20">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-amber-800 dark:text-amber-200">{result.note}</p>
              <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">
                {sourceName} does not provide a public REST API. Use the resources below to search manually.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Instructions */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <FileText className="h-4 w-4" />
            How to Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            {result.instructions.map((instruction, idx) => (
              <li key={idx}>{instruction}</li>
            ))}
          </ol>
        </CardContent>
      </Card>

      {/* Resources */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <Link2 className="h-4 w-4" />
            Official Resources
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {result.resources.map((resource, idx) => (
            <a
              key={idx}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-start gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
            >
              <div className={`p-1.5 rounded-md ${iconColor}`}>
                <ExternalLink className="h-4 w-4" />
              </div>
              <div className="flex-1">
                <p className="font-medium text-sm">{resource.name}</p>
                <p className="text-xs text-muted-foreground">{resource.description}</p>
              </div>
            </a>
          ))}
        </CardContent>
      </Card>

      {/* WHO-specific EML info */}
      {isWHO && result.whatIsEML && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">About the Essential Medicines List</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><span className="font-medium">Purpose:</span> {result.whatIsEML.purpose}</p>
            <p><span className="font-medium">Core List:</span> {result.whatIsEML.coreList}</p>
            <p><span className="font-medium">Complementary List:</span> {result.whatIsEML.complementaryList}</p>
          </CardContent>
        </Card>
      )}

      {/* Quick Search Link */}
      <Button asChild className="w-full">
        <a href={result.searchUrl} target="_blank" rel="noopener noreferrer" className="gap-2">
          <Search className="h-4 w-4" />
          Open {sourceName} Search
          <ExternalLink className="h-4 w-4" />
        </a>
      </Button>
    </div>
  );
}

// Main Result Renderer
function ExternalSearchResults({
  results,
  sourceId,
  sourceName,
}: {
  results: any;
  sourceId: string;
  sourceName: string;
}) {
  if (!results?.success && !results?.sourceType) {
    // Handle error or guidance response
    if (results?.note) {
      return <GuidanceResultCard result={results} sourceName={sourceName} />;
    }
    return (
      <div className="p-4 bg-destructive/10 rounded-lg text-sm text-destructive">
        No results found or an error occurred.
      </div>
    );
  }

  const data = results.data;
  const metadata = results.metadata;

  // Handle guidance responses (EMA, WHO)
  if (data?.sourceType === 'ema-guidance' || data?.sourceType === 'who-guidance') {
    return <GuidanceResultCard result={data} sourceName={sourceName} />;
  }

  // Handle array results (clinical trials, FDA, PubMed)
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <div className="p-8 text-center text-muted-foreground">
          <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p className="font-medium">No results found</p>
          <p className="text-sm">Try adjusting your search terms</p>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Results Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <FileText className="h-3 w-3" />
              {metadata?.totalResults || data.length} results
            </Badge>
            <Badge variant="secondary" className="gap-1">
              <Clock className="h-3 w-3" />
              {new Date(metadata?.timestamp).toLocaleTimeString()}
            </Badge>
          </div>
        </div>

        {/* Results List */}
        <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
          {data.map((item: any, idx: number) => {
            if (sourceId === 'clinicaltrials') {
              return <ClinicalTrialResultCard key={item.nctId || idx} result={item} />;
            }
            if (sourceId === 'fda') {
              return <FDAResultCard key={item.id || idx} result={item} />;
            }
            if (sourceId === 'pubmed') {
              return <PubMedResultCard key={item.pmid || idx} result={item} />;
            }
            return null;
          })}
        </div>
      </div>
    );
  }

  // Fallback for unexpected format
  return (
    <div className="p-4 bg-muted rounded-lg">
      <pre className="text-xs overflow-auto max-h-60 bg-background p-3 rounded border">
        {JSON.stringify(results, null, 2)}
      </pre>
    </div>
  );
}

// Connections Manager Component
function ConnectionsManager({ domains }: { domains: KnowledgeDomain[] }) {
  const [selectedSource, setSelectedSource] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  const externalSources: ExternalSource[] = [
    {
      id: 'clinicaltrials',
      name: 'ClinicalTrials.gov',
      description: 'Search clinical trials by condition, intervention, or sponsor',
      icon: <FlaskConicalIcon className="h-6 w-6" />,
      color: 'text-purple-600 bg-purple-100 dark:bg-purple-900',
      status: 'connected',
      apiAvailable: true,
      searchExample: 'psoriasis biologic phase 3',
    },
    {
      id: 'fda',
      name: 'FDA Approvals',
      description: 'Search FDA OpenFDA database for drug approvals and labels',
      icon: <ShieldIcon className="h-6 w-6" />,
      color: 'text-red-600 bg-red-100 dark:bg-red-900',
      status: 'connected',
      apiAvailable: true,
      searchExample: 'adalimumab',
    },
    {
      id: 'ema',
      name: 'EMA (European)',
      description: 'European Medicines Agency regulatory information',
      icon: <GlobeIcon className="h-6 w-6" />,
      color: 'text-blue-600 bg-blue-100 dark:bg-blue-900',
      status: 'available',
      apiAvailable: false,
      searchExample: 'Humira',
    },
    {
      id: 'who',
      name: 'WHO Essential Medicines',
      description: 'World Health Organization Essential Medicines List',
      icon: <HeartPulseIcon className="h-6 w-6" />,
      color: 'text-green-600 bg-green-100 dark:bg-green-900',
      status: 'available',
      apiAvailable: false,
      searchExample: 'metformin',
    },
    {
      id: 'pubmed',
      name: 'PubMed',
      description: 'Search biomedical literature from NCBI/NIH',
      icon: <BookOpenIcon className="h-6 w-6" />,
      color: 'text-orange-600 bg-orange-100 dark:bg-orange-900',
      status: 'connected',
      apiAvailable: true,
      searchExample: 'COVID-19 vaccine efficacy',
    },
  ];

  const handleExternalSearch = async (sourceId: string) => {
    if (!searchQuery.trim()) return;

    setSearching(true);
    setSearchError(null);
    setSearchResults(null);

    try {
      // Call the appropriate API based on source
      const response = await fetch('/api/evidence/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: sourceId,
          query: searchQuery,
          maxResults: 10,
        }),
      });

      if (!response.ok) {
        throw new Error('Search failed');
      }

      const data = await response.json();
      setSearchResults(data);
    } catch (err) {
      console.error('External search failed:', err);
      setSearchError(err instanceof Error ? err.message : 'Search failed');
      // Show mock data for demonstration
      setSearchResults({
        note: 'API endpoint not configured. Showing placeholder response.',
        source: sourceId,
        query: searchQuery,
      });
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Agent Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Agent Connections
          </CardTitle>
          <CardDescription>
            Map AI agents to specific knowledge domains for contextual responses
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <Link2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium mb-2">Agent-Knowledge Mapping</h3>
            <p className="text-sm mb-4">
              Configure which agents have access to which knowledge domains
            </p>
            <Button variant="outline">
              <Plus className="h-4 w-4 mr-2" />
              Create Connection
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* External Evidence Sources */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5" />
            External Evidence Sources
          </CardTitle>
          <CardDescription>
            Connect to regulatory databases and research repositories for evidence-based responses
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {externalSources.map((source) => (
              <Card
                key={source.id}
                className={`cursor-pointer transition-all ${
                  selectedSource === source.id
                    ? 'ring-2 ring-primary shadow-md'
                    : 'hover:shadow-md hover:border-primary/50'
                }`}
                onClick={() => {
                  setSelectedSource(selectedSource === source.id ? null : source.id);
                  setSearchQuery('');
                  setSearchResults(null);
                  setSearchError(null);
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg ${source.color}`}>
                      {source.icon}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-medium text-sm">{source.name}</h4>
                        <Badge
                          variant={source.status === 'connected' ? 'default' : 'secondary'}
                          className={
                            source.status === 'connected'
                              ? 'bg-green-500/10 text-green-600'
                              : source.status === 'coming_soon'
                              ? 'bg-gray-500/10 text-gray-600'
                              : ''
                          }
                        >
                          {source.status === 'connected' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                          {source.status.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {source.description}
                      </p>
                      {source.apiAvailable && (
                        <Badge variant="outline" className="mt-2 text-xs">
                          <Zap className="h-3 w-3 mr-1" />
                          API Available
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Source Search Panel */}
          {selectedSource && (
            <Card className="border-primary/50 bg-primary/5">
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {externalSources.find((s) => s.id === selectedSource)?.icon}
                    <h4 className="font-medium">
                      Search {externalSources.find((s) => s.id === selectedSource)?.name}
                    </h4>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => setSelectedSource(null)}>
                    <XCircle className="h-4 w-4" />
                  </Button>
                </div>

                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder={`e.g., "${externalSources.find((s) => s.id === selectedSource)?.searchExample}"`}
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleExternalSearch(selectedSource)}
                      className="w-full h-10 pl-10 pr-4 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>
                  <Button
                    onClick={() => handleExternalSearch(selectedSource)}
                    disabled={searching || !searchQuery.trim()}
                  >
                    {searching ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-2" />
                        Search
                      </>
                    )}
                  </Button>
                </div>

                {/* Search Error */}
                {searchError && (
                  <div className="p-3 bg-destructive/10 border border-destructive/30 rounded-lg text-sm text-destructive">
                    {searchError}
                  </div>
                )}

                {/* Search Results */}
                {/* Enhanced Search Results Display */}
                {searchResults && (
                  <ExternalSearchResults
                    results={searchResults}
                    sourceId={selectedSource}
                    sourceName={externalSources.find((s) => s.id === selectedSource)?.name || 'Unknown'}
                  />
                )}
              </CardContent>
            </Card>
          )}
        </CardContent>
      </Card>

      {/* Internal Data Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Internal Data Sources</CardTitle>
          <CardDescription>
            Connect internal databases and file storage to your knowledge base
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Database className="h-6 w-6" />
              <span className="text-sm font-medium">Supabase Database</span>
              <span className="text-xs text-muted-foreground">Query internal data</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <Layers className="h-6 w-6" />
              <span className="text-sm font-medium">Pinecone Vectors</span>
              <span className="text-xs text-muted-foreground">Semantic search</span>
            </Button>
            <Button variant="outline" className="h-auto py-4 flex-col gap-2">
              <FolderOpen className="h-6 w-6" />
              <span className="text-sm font-medium">File Storage</span>
              <span className="text-xs text-muted-foreground">Document uploads</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Icon components for external sources (using Lucide naming conventions)
const FlaskConicalIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 3v7.4a2 2 0 0 0 .6 1.4l4.5 4.5a2 2 0 0 1 .5 1.4V19a2 2 0 0 1-2 2H6.4a2 2 0 0 1-2-2v-1.3a2 2 0 0 1 .5-1.4l4.5-4.5a2 2 0 0 0 .6-1.4V3" />
    <path d="M8 3h8" />
  </svg>
);

const ShieldIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10" />
  </svg>
);

const GlobeIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
    <path d="M2 12h20" />
  </svg>
);

const HeartPulseIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
    <path d="M3.22 12H9.5l.5-1 2 4.5 2-7 1.5 3.5h5.27" />
  </svg>
);

const BookOpenIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
  </svg>
);

// Main Export
export default function KnowledgeBuilderPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <KnowledgeBuilderContent />
    </Suspense>
  );
}

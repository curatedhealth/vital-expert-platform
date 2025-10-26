'use client';

import { Plus, Search, Filter, Info } from 'lucide-react';
import { useState, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@vital/ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@vital/ui';
import { Input } from '@vital/ui';
import { Label } from '@vital/ui';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { modelSelector } from '@/lib/services/model-selector';
import type { KnowledgeDomain } from '@/lib/services/model-selector';
import { createClient } from '@vital/sdk/client';

export default function KnowledgeDomainsPage() {
  const [domains, setDomains] = useState<KnowledgeDomain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<KnowledgeDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | '1' | '2' | '3'>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain | null>(null);

  const supabase = createClient();

  // Load domains
  useEffect(() => {
    loadDomains();
  }, []);

  // Filter domains
  useEffect(() => {
    let filtered = domains;

    // Filter by tier
    if (selectedTier !== 'all') {
      filtered = filtered.filter((d) => d.tier === parseInt(selectedTier));
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d: any) =>
          d.name.toLowerCase().includes(query) ||
          d.description?.toLowerCase().includes(query) ||
          d.keywords.some((k: string) => k.toLowerCase().includes(query))
      );
    }

    setFilteredDomains(filtered);
  }, [domains, selectedTier, searchQuery]);

  const loadDomains = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('knowledge_domains')
        .select('*')
        .eq('is_active', true)
        .order('priority');

      if (error) throw error;
      setDomains(data || []);
      setFilteredDomains(data || []);
    } catch (error) {
      console.error('Failed to load knowledge domains:', error);
    } finally {
      setLoading(false);
    }
  };

  const initialize30Domains = async () => {
    if (!confirm('Initialize 30 healthcare knowledge domains? This will add all standard domains.')) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/knowledge-domains/initialize', {
        method: 'POST',
      });

      const result = await response.json();
      console.log('Initialized domains:', result);

      if (!response.ok) {
        // Table doesn't exist - show SQL
        if (result.createTableSQL) {
          const shouldCopy = confirm(
            `The knowledge_domains table doesn't exist yet.\n\n` +
            `You need to create it first. Would you like to copy the SQL to your clipboard?\n\n` +
            `You can then run it in your Supabase SQL Editor.`
          );

          if (shouldCopy) {
            await navigator.clipboard.writeText(result.createTableSQL);
            alert('SQL copied to clipboard! Please run it in Supabase SQL Editor, then try initializing again.');
          }
        } else {
          alert(`Error: ${result.message || 'Failed to initialize domains'}`);
        }
        return;
      }

      // Success - reload domains
      await loadDomains();

      alert(`Successfully initialized ${result.inserted} domains!`);
    } catch (error) {
      console.error('Failed to initialize domains:', error);
      alert('Failed to initialize domains. Check console for details.');
    } finally {
      setLoading(false);
    }
  };

  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return <Badge className="bg-blue-500">Tier 1: Core</Badge>;
      case 2:
        return <Badge className="bg-purple-500">Tier 2: Specialized</Badge>;
      case 3:
        return <Badge className="bg-green-500">Tier 3: Emerging</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  const getDomainStats = (tier: number) => {
    return domains.filter((d) => d.tier === tier).length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Knowledge Domains</h1>
          <p className="text-muted-foreground mt-1">
            Manage knowledge domain categories and their recommended LLM models
          </p>
        </div>
        <div className="flex gap-2">
          {domains.length === 0 && !loading && (
            <Button onClick={initialize30Domains} variant="default">
              <Plus className="h-4 w-4 mr-2" />
              Initialize 30 Domains
            </Button>
          )}
          <Button onClick={() => setShowCreateDialog(true)} variant={domains.length === 0 ? "outline" : "default"}>
            <Plus className="h-4 w-4 mr-2" />
            Add Domain
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Domains</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{domains.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tier 1 (Core)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDomainStats(1)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tier 2 (Specialized)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDomainStats(2)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Tier 3 (Emerging)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{getDomainStats(3)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search domains by name, keywords..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select
          value={selectedTier}
          onValueChange={(value: any) => setSelectedTier(value)}
        >
          <SelectTrigger className="w-[200px]">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Filter by tier" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Tiers</SelectItem>
            <SelectItem value="1">Tier 1: Core</SelectItem>
            <SelectItem value="2">Tier 2: Specialized</SelectItem>
            <SelectItem value="3">Tier 3: Emerging</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabs for different views */}
      <Tabs defaultValue="tiers" className="w-full">
        <TabsList>
          <TabsTrigger value="tiers">By Tier</TabsTrigger>
          <TabsTrigger value="grid">All Domains</TabsTrigger>
          <TabsTrigger value="table">Table View</TabsTrigger>
        </TabsList>

        <TabsContent value="tiers" className="mt-6">
          <TieredDomainsView
            domains={filteredDomains}
            onSelectDomain={(domain) => setSelectedDomain(domain)}
          />
        </TabsContent>

        <TabsContent value="grid" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDomains.map((domain: any) => (
              <DomainCard
                key={domain.id}
                domain={domain}
                onClick={() => setSelectedDomain(domain)}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="table" className="mt-6">
          <DomainTable
            domains={filteredDomains}
            onSelectDomain={(domain) => setSelectedDomain(domain)}
          />
        </TabsContent>
      </Tabs>

      {/* Create/Edit Domain Dialog */}
      <CreateDomainDialog
        open={showCreateDialog}
        onClose={() => setShowCreateDialog(false)}
        onSuccess={() => {
          setShowCreateDialog(false);
          loadDomains();
        }}
      />

      {/* Domain Details Dialog */}
      {selectedDomain && (
        <DomainDetailsDialog
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
        />
      )}
    </div>
  );
}

// ============================================================================
// Tiered Domains View Component
// ============================================================================

function TieredDomainsView({
  domains,
  onSelectDomain,
}: {
  domains: any[];
  onSelectDomain: (domain: any) => void;
}) {
  const tier1Domains = domains.filter((d) => d.tier === 1).sort((a, b) => a.priority - b.priority);
  const tier2Domains = domains.filter((d) => d.tier === 2).sort((a, b) => a.priority - b.priority);
  const tier3Domains = domains.filter((d) => d.tier === 3).sort((a, b) => a.priority - b.priority);

  const TierSection = ({
    title,
    subtitle,
    tierNumber,
    tierDomains,
    badgeColor,
    borderColor,
  }: {
    title: string;
    subtitle: string;
    tierNumber: number;
    tierDomains: any[];
    badgeColor: string;
    borderColor: string;
  }) => {
    if (tierDomains.length === 0) return null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3 pb-3 border-b-2" style={{ borderColor }}>
          <Badge className={`${badgeColor} px-3 py-1 text-sm font-semibold`}>
            TIER {tierNumber}
          </Badge>
          <div>
            <h2 className="text-xl font-bold">{title}</h2>
            <p className="text-sm text-muted-foreground">{subtitle}</p>
          </div>
          <div className="ml-auto">
            <span className="text-2xl font-bold text-muted-foreground">
              {tierDomains.length}
            </span>
            <span className="text-sm text-muted-foreground ml-1">domains</span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tierDomains.map((domain: any) => (
            <DomainCard
              key={domain.id}
              domain={domain}
              onClick={() => onSelectDomain(domain)}
            />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Tier 1: Core Domains */}
      <TierSection
        title="Core Domains"
        subtitle="Mission-critical knowledge domains essential for pharmaceutical operations"
        tierNumber={1}
        tierDomains={tier1Domains}
        badgeColor="bg-blue-600 hover:bg-blue-700"
        borderColor="#2563EB"
      />

      {/* Tier 2: Specialized Domains */}
      <TierSection
        title="Specialized Domains"
        subtitle="High-value domains for advanced capabilities and specialized workflows"
        tierNumber={2}
        tierDomains={tier2Domains}
        badgeColor="bg-purple-600 hover:bg-purple-700"
        borderColor="#7C3AED"
      />

      {/* Tier 3: Emerging Domains */}
      <TierSection
        title="Emerging Domains"
        subtitle="Future-focused domains for cutting-edge healthcare innovation"
        tierNumber={3}
        tierDomains={tier3Domains}
        badgeColor="bg-green-600 hover:bg-green-700"
        borderColor="#059669"
      />

      {domains.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          <p>No knowledge domains found. Click "Initialize 30 Domains" to get started.</p>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// Domain Card Component
// ============================================================================

function DomainCard({
  domain,
  onClick,
}: {
  domain: any;
  onClick: () => void;
}) {
  const getTierBadge = (tier: number) => {
    switch (tier) {
      case 1:
        return <Badge className="bg-blue-500">Tier 1</Badge>;
      case 2:
        return <Badge className="bg-purple-500">Tier 2</Badge>;
      case 3:
        return <Badge className="bg-green-500">Tier 3</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <Card
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={onClick}
      style={{ borderLeftColor: domain.color || '#3B82F6', borderLeftWidth: '4px' }}
    >
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg">{domain.name}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              {domain.code}
            </CardDescription>
          </div>
          {getTierBadge(domain.tier)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {domain.description}
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">Embedding:</span>
            <code className="bg-muted px-2 py-0.5 rounded">
              {domain.recommended_models?.embedding?.primary || 'N/A'}
            </code>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">Chat:</span>
            <code className="bg-muted px-2 py-0.5 rounded">
              {domain.recommended_models?.chat?.primary || 'N/A'}
            </code>
          </div>
        </div>
        {domain.agent_count_estimate > 0 && (
          <div className="mt-3 text-xs text-muted-foreground">
            ~{domain.agent_count_estimate} agents
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// ============================================================================
// Domain Table Component
// ============================================================================

function DomainTable({
  domains,
  onSelectDomain,
}: {
  domains: any[];
  onSelectDomain: (domain: any) => void;
}) {
  return (
    <div className="rounded-md border">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr className="border-b">
            <th className="px-4 py-3 text-left text-sm font-medium">Priority</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Domain</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Tier</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Embedding Model</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Chat Model</th>
            <th className="px-4 py-3 text-left text-sm font-medium">Agents</th>
          </tr>
        </thead>
        <tbody>
          {domains.map((domain: any) => (
            <tr
              key={domain.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => onSelectDomain(domain)}
            >
              <td className="px-4 py-3 text-sm">{domain.priority}</td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{domain.name}</div>
                  <div className="text-xs text-muted-foreground">{domain.code}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                {domain.tier === 1 && <Badge className="bg-blue-500">Tier 1</Badge>}
                {domain.tier === 2 && <Badge className="bg-purple-500">Tier 2</Badge>}
                {domain.tier === 3 && <Badge className="bg-green-500">Tier 3</Badge>}
              </td>
              <td className="px-4 py-3">
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {domain.recommended_models?.embedding?.primary || 'N/A'}
                </code>
              </td>
              <td className="px-4 py-3">
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {domain.recommended_models?.chat?.primary || 'N/A'}
                </code>
              </td>
              <td className="px-4 py-3 text-sm">{domain.agent_count_estimate || 0}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// Domain Details Dialog
// ============================================================================

function DomainDetailsDialog({
  domain,
  onClose,
}: {
  domain: any;
  onClose: () => void;
}) {
  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <span
              className="w-4 h-4 rounded"
              style={{ backgroundColor: domain.color }}
            />
            {domain.name}
          </DialogTitle>
          <DialogDescription>{domain.description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label className="text-xs text-muted-foreground">Code</Label>
              <div className="font-mono text-sm">{domain.code}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Slug</Label>
              <div className="font-mono text-sm">{domain.slug}</div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Tier</Label>
              <div className="text-sm">
                {domain.tier === 1 && 'Tier 1: Core'}
                {domain.tier === 2 && 'Tier 2: Specialized'}
                {domain.tier === 3 && 'Tier 3: Emerging'}
              </div>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Priority</Label>
              <div className="text-sm">{domain.priority}</div>
            </div>
          </div>

          {/* LLM Recommendations */}
          <div>
            <h3 className="font-semibold mb-3 flex items-center gap-2">
              <Info className="h-4 w-4" />
              Recommended LLM Models
            </h3>

            {/* Embedding Models */}
            <div className="space-y-2 mb-4">
              <Label className="text-sm font-medium">Embedding Models</Label>
              <div className="space-y-1 pl-4">
                <div className="text-sm">
                  <span className="font-semibold">Primary:</span>{' '}
                  <code className="bg-muted px-2 py-0.5 rounded">
                    {domain.recommended_models?.embedding?.primary}
                  </code>
                </div>
                {domain.recommended_models?.embedding?.specialized && (
                  <div className="text-sm">
                    <span className="font-semibold">Specialized:</span>{' '}
                    <code className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">
                      {domain.recommended_models.embedding.specialized}
                    </code>
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-semibold">Alternatives:</span>{' '}
                  {domain.recommended_models?.embedding?.alternatives?.map((alt: any, i: number) => (
                    <code key={i} className="bg-muted px-2 py-0.5 rounded ml-1">
                      {alt}
                    </code>
                  ))}
                </div>
                {domain.recommended_models?.embedding?.rationale && (
                  <p className="text-xs text-muted-foreground italic">
                    {domain.recommended_models.embedding.rationale}
                  </p>
                )}
              </div>
            </div>

            {/* Chat Models */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Chat Models</Label>
              <div className="space-y-1 pl-4">
                <div className="text-sm">
                  <span className="font-semibold">Primary:</span>{' '}
                  <code className="bg-muted px-2 py-0.5 rounded">
                    {domain.recommended_models?.chat?.primary}
                  </code>
                </div>
                {domain.recommended_models?.chat?.specialized && (
                  <div className="text-sm">
                    <span className="font-semibold">Specialized:</span>{' '}
                    <code className="bg-green-100 dark:bg-green-900 px-2 py-0.5 rounded">
                      {domain.recommended_models.chat.specialized}
                    </code>
                  </div>
                )}
                <div className="text-sm">
                  <span className="font-semibold">Alternatives:</span>{' '}
                  {domain.recommended_models?.chat?.alternatives?.map((alt: any, i: number) => (
                    <code key={i} className="bg-muted px-2 py-0.5 rounded ml-1">
                      {alt}
                    </code>
                  ))}
                </div>
                {domain.recommended_models?.chat?.rationale && (
                  <p className="text-xs text-muted-foreground italic">
                    {domain.recommended_models.chat.rationale}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Keywords */}
          {domain.keywords && domain.keywords.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Keywords</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {domain.keywords.map((keyword: any, i: number) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {keyword}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Sub-domains */}
          {domain.sub_domains && domain.sub_domains.length > 0 && (
            <div>
              <Label className="text-sm font-medium">Sub-domains</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {domain.sub_domains.map((sub: any, i: number) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {sub}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Stats */}
          {domain.agent_count_estimate > 0 && (
            <div>
              <Label className="text-sm font-medium">Estimated Agent Count</Label>
              <div className="text-2xl font-bold mt-1">{domain.agent_count_estimate}</div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// Create Domain Dialog
// ============================================================================

function CreateDomainDialog({
  open,
  onClose,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    code: '',
    name: '',
    slug: '',
    description: '',
    tier: 1,
    keywords: '',
    sub_domains: '',
    color: '#3B82F6',
    embedding_model: 'text-embedding-3-large',
    chat_model: 'gpt-4-turbo-preview',
  });
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Parse keywords and sub_domains
      const keywords = formData.keywords
        .split(',')
        .map((k: any) => k.trim())
        .filter(Boolean);
      const sub_domains = formData.sub_domains
        .split(',')
        .map((s: any) => s.trim())
        .filter(Boolean);

      // Get next priority
      const { data: existingDomains } = await supabase
        .from('knowledge_domains')
        .select('priority')
        .order('priority', { ascending: false })
        .limit(1);

      const nextPriority = existingDomains?.[0]?.priority
        ? existingDomains[0].priority + 1
        : 1;

      // Create domain
      const { error } = await supabase.from('knowledge_domains').insert({
        code: formData.code.toUpperCase().replace(/\s+/g, '_'),
        name: formData.name,
        slug: formData.slug.toLowerCase().replace(/\s+/g, '_'),
        description: formData.description,
        tier: formData.tier,
        priority: nextPriority,
        keywords,
        sub_domains,
        color: formData.color,
        recommended_models: {
          embedding: {
            primary: formData.embedding_model,
            alternatives: ['text-embedding-ada-002'],
            specialized: null,
          },
          chat: {
            primary: formData.chat_model,
            alternatives: ['gpt-3.5-turbo'],
            specialized: null,
          },
        },
        is_active: true,
      });

      if (error) throw error;

      onSuccess();
    } catch (error) {
      console.error('Failed to create domain:', error);
      alert('Failed to create domain. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const embeddingModels = modelSelector.getAvailableEmbeddingModels();
  const chatModels = modelSelector.getAvailableChatModels();

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Knowledge Domain</DialogTitle>
          <DialogDescription>
            Create a new knowledge domain category with recommended LLM models
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Domain Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Regulatory Affairs"
                required
              />
            </div>
            <div>
              <Label htmlFor="code">Code *</Label>
              <Input
                id="code"
                value={formData.code}
                onChange={(e) =>
                  setFormData({ ...formData, code: e.target.value })
                }
                placeholder="e.g., REG_AFFAIRS"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) =>
                  setFormData({ ...formData, slug: e.target.value })
                }
                placeholder="e.g., regulatory_affairs"
                required
              />
            </div>
            <div>
              <Label htmlFor="tier">Tier *</Label>
              <Select
                value={formData.tier.toString()}
                onValueChange={(value) =>
                  setFormData({ ...formData, tier: parseInt(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">Tier 1: Core</SelectItem>
                  <SelectItem value="2">Tier 2: Specialized</SelectItem>
                  <SelectItem value="3">Tier 3: Emerging</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Brief description of this knowledge domain"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="keywords">Keywords (comma-separated)</Label>
            <Input
              id="keywords"
              value={formData.keywords}
              onChange={(e) =>
                setFormData({ ...formData, keywords: e.target.value })
              }
              placeholder="e.g., fda, ema, regulatory, compliance"
            />
          </div>

          <div>
            <Label htmlFor="sub_domains">Sub-domains (comma-separated)</Label>
            <Input
              id="sub_domains"
              value={formData.sub_domains}
              onChange={(e) =>
                setFormData({ ...formData, sub_domains: e.target.value })
              }
              placeholder="e.g., fda_regulations, ema_regulations"
            />
          </div>

          <div>
            <Label htmlFor="color">Color</Label>
            <div className="flex items-center gap-2">
              <Input
                id="color"
                type="color"
                value={formData.color}
                onChange={(e) =>
                  setFormData({ ...formData, color: e.target.value })
                }
                className="w-20 h-10"
              />
              <span className="text-sm text-muted-foreground">{formData.color}</span>
            </div>
          </div>

          <div>
            <Label htmlFor="embedding_model">Recommended Embedding Model *</Label>
            <Select
              value={formData.embedding_model}
              onValueChange={(value) =>
                setFormData({ ...formData, embedding_model: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {embeddingModels.map((model: any) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label} - {model.provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="chat_model">Recommended Chat Model *</Label>
            <Select
              value={formData.chat_model}
              onValueChange={(value) =>
                setFormData({ ...formData, chat_model: value })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {chatModels.map((model: any) => (
                  <SelectItem key={model.value} value={model.value}>
                    {model.label} - {model.provider}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Domain'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

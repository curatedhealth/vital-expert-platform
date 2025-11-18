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

// Import refactored domain dialog component
import { DomainDetailsDialog } from '@/features/knowledge/components';

export default function KnowledgeDomainsPage() {
  const [domains, setDomains] = useState<KnowledgeDomain[]>([]);
  const [filteredDomains, setFilteredDomains] = useState<KnowledgeDomain[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTier, setSelectedTier] = useState<'all' | '1' | '2' | '3'>('all');
  const [selectedFunction, setSelectedFunction] = useState<string>('all');
  const [selectedMaturity, setSelectedMaturity] = useState<string>('all');
  const [selectedAccessPolicy, setSelectedAccessPolicy] = useState<string>('all');
  const [selectedDomainScope, setSelectedDomainScope] = useState<string>('all');
  const [selectedRegulatoryExposure, setSelectedRegulatoryExposure] = useState<string>('all');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<KnowledgeDomain | null>(null);

  const supabase = createClient();

  // Load domains
  useEffect(() => {
    loadDomains();
  }, []);

  // Get unique values for filters
  const uniqueFunctions = Array.from(new Set(domains.map((d: any) => d.function_name || d.function_id).filter(Boolean)));

  // Filter domains
  useEffect(() => {
    let filtered = domains;

    // Filter by tier
    if (selectedTier !== 'all') {
      filtered = filtered.filter((d) => d.tier === parseInt(selectedTier));
    }

    // Filter by function
    if (selectedFunction !== 'all') {
      filtered = filtered.filter((d: any) => 
        (d.function_name === selectedFunction) || (d.function_id === selectedFunction)
      );
    }

    // Filter by maturity level
    if (selectedMaturity !== 'all') {
      filtered = filtered.filter((d: any) => d.maturity_level === selectedMaturity);
    }

    // Filter by access policy
    if (selectedAccessPolicy !== 'all') {
      filtered = filtered.filter((d: any) => d.access_policy === selectedAccessPolicy);
    }

    // Filter by domain scope
    if (selectedDomainScope !== 'all') {
      filtered = filtered.filter((d: any) => d.domain_scope === selectedDomainScope);
    }

    // Filter by regulatory exposure
    if (selectedRegulatoryExposure !== 'all') {
      filtered = filtered.filter((d: any) => d.regulatory_exposure === selectedRegulatoryExposure);
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (d: any) =>
          (d.domain_name || d.name || '').toLowerCase().includes(query) ||
          (d.domain_description_llm || d.description || '').toLowerCase().includes(query) ||
          (d.domain_id || d.slug || '').toLowerCase().includes(query) ||
          (d.function_name || '').toLowerCase().includes(query) ||
          (d.function_id || '').toLowerCase().includes(query) ||
          (Array.isArray(d.keywords) ? d.keywords : []).some((k: string) => k.toLowerCase().includes(query))
      );
    }

    setFilteredDomains(filtered);
  }, [domains, selectedTier, selectedFunction, selectedMaturity, selectedAccessPolicy, selectedDomainScope, selectedRegulatoryExposure, searchQuery]);

  const loadDomains = async () => {
    setLoading(true);
    try {
      // Try new architecture first, fallback to old table
      let { data, error } = await supabase
        .from('knowledge_domains_new')
        .select('*')
        .eq('is_active', true)
        .order('tier', { ascending: true })
        .order('priority', { ascending: true });

      // If new table doesn't exist or has no data, fallback to old table
      if (error || !data || data.length === 0) {
        const { data: oldData, error: oldError } = await supabase
          .from('knowledge_domains')
          .select('*')
          .eq('is_active', true)
          .order('tier', { ascending: true })
          .order('priority', { ascending: true });

        if (!oldError && oldData) {
          data = oldData;
          error = null;
        }
      }

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

      {/* Filters Section */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search domains by name, keywords, function..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Tier</Label>
            <Select
              value={selectedTier}
              onValueChange={(value: any) => setSelectedTier(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Tiers" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tiers</SelectItem>
              <SelectItem value="1">Tier 1: Core</SelectItem>
              <SelectItem value="2">Tier 2: Specialized</SelectItem>
              <SelectItem value="3">Tier 3: Emerging</SelectItem>
            </SelectContent>
          </Select>
          </div>

          {uniqueFunctions.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground mb-1 block">Function</Label>
              <Select
                value={selectedFunction}
                onValueChange={(value: any) => setSelectedFunction(value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Functions" />
                </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Functions</SelectItem>
                {uniqueFunctions.map((func: string) => (
                  <SelectItem key={func} value={func}>
                    {func}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            </div>
          )}

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Maturity Level</Label>
            <Select
              value={selectedMaturity}
              onValueChange={(value: any) => setSelectedMaturity(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Maturity" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Maturity Levels</SelectItem>
              <SelectItem value="Established">Established</SelectItem>
              <SelectItem value="Specialized">Specialized</SelectItem>
              <SelectItem value="Emerging">Emerging</SelectItem>
              <SelectItem value="Draft">Draft</SelectItem>
            </SelectContent>
          </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Access Policy</Label>
            <Select
              value={selectedAccessPolicy}
              onValueChange={(value: any) => setSelectedAccessPolicy(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Policies" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Access Policies</SelectItem>
              <SelectItem value="public">Public</SelectItem>
              <SelectItem value="enterprise_confidential">Enterprise Confidential</SelectItem>
              <SelectItem value="team_confidential">Team Confidential</SelectItem>
              <SelectItem value="personal_draft">Personal Draft</SelectItem>
            </SelectContent>
          </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Domain Scope</Label>
            <Select
              value={selectedDomainScope}
              onValueChange={(value: any) => setSelectedDomainScope(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Scopes" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Scopes</SelectItem>
              <SelectItem value="global">Global</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
              <SelectItem value="user">User</SelectItem>
            </SelectContent>
          </Select>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-1 block">Regulatory Exposure</Label>
            <Select
              value={selectedRegulatoryExposure}
              onValueChange={(value: any) => setSelectedRegulatoryExposure(value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="All Exposure" />
              </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Exposure Levels</SelectItem>
              <SelectItem value="High">High</SelectItem>
              <SelectItem value="Medium">Medium</SelectItem>
              <SelectItem value="Low">Low</SelectItem>
            </SelectContent>
          </Select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(selectedTier !== 'all' || 
          selectedFunction !== 'all' || 
          selectedMaturity !== 'all' || 
          selectedAccessPolicy !== 'all' || 
          selectedDomainScope !== 'all' || 
          selectedRegulatoryExposure !== 'all' || 
          searchQuery) && (
          <div className="flex justify-end pt-2 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSelectedTier('all');
                setSelectedFunction('all');
                setSelectedMaturity('all');
                setSelectedAccessPolicy('all');
                setSelectedDomainScope('all');
                setSelectedRegulatoryExposure('all');
                setSearchQuery('');
              }}
            >
              Clear All Filters
            </Button>
          </div>
        )}
        </CardContent>
      </Card>

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
                key={domain.domain_id || domain.id}
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

      {/* Domain Details/Edit Dialog */}
      {selectedDomain && (
        <DomainDetailsDialog
          domain={selectedDomain}
          onClose={() => setSelectedDomain(null)}
          onUpdate={() => loadDomains()}
          onDelete={() => {
            setSelectedDomain(null);
            loadDomains();
          }}
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
              key={domain.domain_id || domain.id}
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
            <CardTitle className="text-lg">{domain.domain_name || domain.name}</CardTitle>
            <CardDescription className="mt-1 text-xs">
              {domain.code || domain.domain_id}
            </CardDescription>
          </div>
          {getTierBadge(domain.tier)}
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground line-clamp-2">
          {domain.domain_description_llm || domain.description || ''}
        </p>
        <div className="mt-4 space-y-2">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-semibold">Embedding:</span>
            <code className="bg-muted px-2 py-0.5 rounded">
              {domain.embedding_model || domain.recommended_models?.embedding?.primary || 'N/A'}
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
              key={domain.domain_id || domain.id}
              className="border-b hover:bg-muted/50 cursor-pointer"
              onClick={() => onSelectDomain(domain)}
            >
              <td className="px-4 py-3 text-sm">{domain.priority}</td>
              <td className="px-4 py-3">
                <div>
                  <div className="font-medium">{domain.domain_name || domain.name}</div>
                  <div className="text-xs text-muted-foreground">{domain.code || domain.domain_id}</div>
                </div>
              </td>
              <td className="px-4 py-3">
                {domain.tier === 1 && <Badge className="bg-blue-500">Tier 1</Badge>}
                {domain.tier === 2 && <Badge className="bg-purple-500">Tier 2</Badge>}
                {domain.tier === 3 && <Badge className="bg-green-500">Tier 3</Badge>}
              </td>
              <td className="px-4 py-3">
                <code className="text-xs bg-muted px-2 py-0.5 rounded">
                  {domain.embedding_model || domain.recommended_models?.embedding?.primary || 'N/A'}
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
    // New architecture fields
    function_id: '',
    function_name: '',
    domain_description_llm: '',
    maturity_level: 'Established',
    regulatory_exposure: 'Low',
    pii_sensitivity: 'Low',
    rag_priority_weight: 0.85,
    access_policy: 'public',
    domain_scope: 'global',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Create domain via admin API (superadmin only)
      const response = await fetch('/api/admin/knowledge-domains', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          name: formData.name,
          slug: formData.slug,
          description: formData.description,
          tier: formData.tier,
          keywords: formData.keywords
            .split(',')
            .map((k: string) => k.trim())
            .filter(Boolean),
          sub_domains: formData.sub_domains
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean),
          color: formData.color,
          embedding_model: formData.embedding_model,
          recommended_models: {
            embedding: {
              primary: formData.embedding_model,
              alternatives: [],
            },
            chat: {
              primary: formData.chat_model,
              alternatives: [],
            },
          },
          // New architecture fields
          function_id: formData.function_id || 'general',
          function_name: formData.function_name || 'General',
          domain_description_llm: formData.domain_description_llm || formData.description,
          maturity_level: formData.maturity_level,
          regulatory_exposure: formData.regulatory_exposure,
          pii_sensitivity: formData.pii_sensitivity,
          rag_priority_weight: formData.rag_priority_weight,
          access_policy: formData.access_policy,
          domain_scope: formData.domain_scope,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to create domain');
      }

      onSuccess();
    } catch (error) {
      console.error('Failed to create domain:', error);
      alert(`Failed to create domain: ${error instanceof Error ? error.message : 'Please try again'}`);
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

          {/* New Architecture Fields */}
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-3">New Architecture Fields (Optional)</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="function_id">Function ID</Label>
                <Input
                  id="function_id"
                  value={formData.function_id}
                  onChange={(e) =>
                    setFormData({ ...formData, function_id: e.target.value })
                  }
                  placeholder="e.g., regulatory_compliance"
                />
              </div>
              <div>
                <Label htmlFor="function_name">Function Name</Label>
                <Input
                  id="function_name"
                  value={formData.function_name}
                  onChange={(e) =>
                    setFormData({ ...formData, function_name: e.target.value })
                  }
                  placeholder="e.g., Regulatory & Compliance"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="domain_description_llm">LLM Description</Label>
              <Textarea
                id="domain_description_llm"
                value={formData.domain_description_llm}
                onChange={(e) =>
                  setFormData({ ...formData, domain_description_llm: e.target.value })
                }
                placeholder="LLM-readable description for domain routing"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="maturity_level">Maturity Level</Label>
                <Select
                  value={formData.maturity_level}
                  onValueChange={(value) =>
                    setFormData({ ...formData, maturity_level: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Established">Established</SelectItem>
                    <SelectItem value="Specialized">Specialized</SelectItem>
                    <SelectItem value="Emerging">Emerging</SelectItem>
                    <SelectItem value="Draft">Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="regulatory_exposure">Regulatory Exposure</Label>
                <Select
                  value={formData.regulatory_exposure}
                  onValueChange={(value) =>
                    setFormData({ ...formData, regulatory_exposure: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="pii_sensitivity">PII Sensitivity</Label>
                <Select
                  value={formData.pii_sensitivity}
                  onValueChange={(value) =>
                    setFormData({ ...formData, pii_sensitivity: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="None">None</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="High">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="rag_priority_weight">RAG Priority Weight</Label>
                <Input
                  id="rag_priority_weight"
                  type="number"
                  min="0"
                  max="1"
                  step="0.01"
                  value={formData.rag_priority_weight}
                  onChange={(e) =>
                    setFormData({ ...formData, rag_priority_weight: parseFloat(e.target.value) || 0.85 })
                  }
                />
              </div>
              <div>
                <Label htmlFor="access_policy">Access Policy</Label>
                <Select
                  value={formData.access_policy}
                  onValueChange={(value) =>
                    setFormData({ ...formData, access_policy: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="public">Public</SelectItem>
                    <SelectItem value="enterprise_confidential">Enterprise Confidential</SelectItem>
                    <SelectItem value="team_confidential">Team Confidential</SelectItem>
                    <SelectItem value="personal_draft">Personal Draft</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="domain_scope">Domain Scope</Label>
                <Select
                  value={formData.domain_scope}
                  onValueChange={(value) =>
                    setFormData({ ...formData, domain_scope: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="global">Global</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                    <SelectItem value="user">User</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
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

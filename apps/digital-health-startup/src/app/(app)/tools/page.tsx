// Healthcare Tools Registry - Enhanced UI
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Filter, 
  Activity, 
  Database, 
  Shield, 
  Microscope, 
  FileText,
  Heart,
  Stethoscope,
  Brain,
  Lock,
  BarChart3,
  Image as ImageIcon,
  Dna,
  CheckCircle2,
  AlertCircle,
  Clock,
  Zap,
  ExternalLink,
  Download,
  TrendingUp,
  Beaker,
  TestTube,
  CheckSquare,
  Syringe,
  XCircle,
  Code,
  Cloud,
  Wrench,
  Hammer
} from 'lucide-react';
import { ToolRegistryService } from '@/lib/services/tool-registry-service';

// Tool categories with icons and colors
const TOOL_CATEGORIES = {
  'Healthcare/FHIR': { 
    icon: Activity, 
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'FHIR servers, EHR systems, interoperability'
  },
  'Healthcare/EHR': { 
    icon: FileText, 
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Electronic Health Record platforms'
  },
  'Healthcare/Clinical NLP': { 
    icon: Brain, 
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Clinical text processing and entity extraction'
  },
  'Healthcare/De-identification': { 
    icon: Shield, 
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'PHI removal and HIPAA compliance'
  },
  'Healthcare/RWE': { 
    icon: BarChart3, 
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Real-world evidence and OMOP CDM'
  },
  'Healthcare/Medical Imaging': { 
    icon: ImageIcon, 
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'Medical imaging AI and analysis'
  },
  'Healthcare/Bioinformatics': { 
    icon: Dna, 
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Genomics and bioinformatics workflows'
  },
  'Healthcare/Data Quality': { 
    icon: CheckCircle2, 
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Data validation and quality assurance'
  },
  'Healthcare/CDS': { 
    icon: Stethoscope, 
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    description: 'Clinical decision support'
  },
  'Research': { 
    icon: Microscope, 
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Academic and medical literature search'
  },
};

const LIFECYCLE_BADGES = {
  production: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  testing: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  development: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  staging: { color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
};

export default function ToolsPage() {
  const [tools, setTools] = useState<any[]>([]);
  const [filteredTools, setFilteredTools] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLifecycle, setSelectedLifecycle] = useState<string>('all');
  const [stats, setStats] = useState({
    total: 0,
    healthcare: 0,
    research: 0,
    production: 0,
    testing: 0,
    development: 0,
    langchainTools: 0,
    tier1: 0,
    fhir: 0,
    nlp: 0,
    deidentification: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [searchQuery, selectedCategory, selectedLifecycle, tools]);

  const loadTools = async () => {
    try {
      setLoading(true);
      const toolService = new ToolRegistryService();
      const allTools = await toolService.getAllTools();
      
      setTools(allTools);
      
      // Calculate stats
      const healthcareTools = allTools.filter(t => t.category?.startsWith('Healthcare'));
      const researchTools = allTools.filter(t => t.category === 'Research');
      const tier1Tools = allTools.filter(t => 
        t.metadata && typeof t.metadata === 'object' && 'tier' in t.metadata && t.metadata.tier === 1
      );
      
      setStats({
        total: allTools.length,
        healthcare: healthcareTools.length,
        research: researchTools.length,
        production: allTools.filter(t => t.lifecycle_stage === 'production').length,
        testing: allTools.filter(t => t.lifecycle_stage === 'testing').length,
        development: allTools.filter(t => t.lifecycle_stage === 'development').length,
        langchainTools: allTools.filter(t => t.implementation_type === 'langchain_tool').length,
        tier1: tier1Tools.length,
        fhir: allTools.filter(t => t.category === 'Healthcare/FHIR').length,
        nlp: allTools.filter(t => t.category === 'Healthcare/Clinical NLP').length,
        deidentification: allTools.filter(t => t.category === 'Healthcare/De-identification').length,
      });
    } catch (error) {
      console.error('Error loading tools:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterTools = () => {
    let filtered = [...tools];

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(tool =>
        tool.name.toLowerCase().includes(query) ||
        tool.description?.toLowerCase().includes(query) ||
        tool.tool_description?.toLowerCase().includes(query) ||
        tool.category?.toLowerCase().includes(query)
      );
    }

    // Category filter
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(tool => tool.category === selectedCategory);
    }

    // Lifecycle filter
    if (selectedLifecycle !== 'all') {
      filtered = filtered.filter(tool => tool.lifecycle_stage === selectedLifecycle);
    }

    setFilteredTools(filtered);
  };

  const getUniqueCategories = () => {
    const categories = new Set(tools.map(t => t.category).filter(Boolean));
    return Array.from(categories).sort();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Tool Registry</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Comprehensive catalog of {stats.total} AI, healthcare, and research tools
        </p>
      </div>

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

        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-red-800 flex items-center gap-1">
              <Heart className="h-3 w-3" />
              Healthcare
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.healthcare}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-cyan-800 flex items-center gap-1">
              <Microscope className="h-3 w-3" />
              Research
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{stats.research}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-purple-200 bg-purple-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
              <Zap className="h-3 w-3" />
              LangChain
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{stats.langchainTools}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" />
              Production
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.production}</div>
          </CardContent>
        </Card>

        <Card className="border-2 border-orange-200 bg-orange-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-xs font-medium text-orange-800 flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Tier 1
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.tier1}</div>
          </CardContent>
        </Card>
      </div>

      {/* Healthcare Highlight Cards */}
      {stats.healthcare > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <Activity className="h-4 w-4" />
                FHIR/Interoperability
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">{stats.fhir}</div>
              <p className="text-xs text-blue-600 mt-1">EHR & FHIR tools</p>
            </CardContent>
          </Card>

          <Card className="border-purple-200 bg-purple-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <Brain className="h-4 w-4" />
                Clinical NLP
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">{stats.nlp}</div>
              <p className="text-xs text-purple-600 mt-1">Text extraction tools</p>
            </CardContent>
          </Card>

          <Card className="border-red-200 bg-red-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-red-900 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                De-identification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-red-700">{stats.deidentification}</div>
              <p className="text-xs text-red-600 mt-1">HIPAA compliance tools</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lifecycle Stats */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Deployment Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-8 w-8 text-green-500" />
              <div>
                <div className="text-2xl font-bold">{stats.production}</div>
                <div className="text-sm text-gray-500">Production</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-8 w-8 text-yellow-500" />
              <div>
                <div className="text-2xl font-bold">{stats.testing}</div>
                <div className="text-sm text-gray-500">Testing</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <AlertCircle className="h-8 w-8 text-gray-500" />
              <div>
                <div className="text-2xl font-bold">{stats.development}</div>
                <div className="text-sm text-gray-500">Development</div>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <TrendingUp className="h-8 w-8 text-orange-500" />
              <div>
                <div className="text-2xl font-bold">{stats.tier1}</div>
                <div className="text-sm text-gray-500">Tier 1 (Critical)</div>
              </div>
            </div>
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
                  placeholder="Search tools by name, description, or category..."
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

            {/* Lifecycle Filter */}
            <select
              value={selectedLifecycle}
              onChange={(e) => setSelectedLifecycle(e.target.value)}
              className="px-4 py-2 border rounded-md bg-white dark:bg-gray-800"
            >
              <option value="all">All Stages</option>
              <option value="production">Production</option>
              <option value="testing">Testing</option>
              <option value="development">Development</option>
            </select>

            {/* Reset */}
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('all');
                setSelectedLifecycle('all');
              }}
            >
              Reset
            </Button>
          </div>

          <div className="mt-4 text-sm text-gray-500">
            Showing {filteredTools.length} of {stats.total} tools
          </div>
        </CardContent>
      </Card>

      {/* Tools Grid */}
      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="categories">By Category</TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTools.map((tool) => (
              <ToolCard key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredTools.map((tool) => (
              <ToolListItem key={tool.id} tool={tool} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-8">
            {getUniqueCategories().map(category => {
              const categoryTools = filteredTools.filter(t => t.category === category);
              if (categoryTools.length === 0) return null;

              const categoryConfig = TOOL_CATEGORIES[category as keyof typeof TOOL_CATEGORIES];
              const Icon = categoryConfig?.icon || Database;

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">{category}</h2>
                    <Badge variant="secondary">{categoryTools.length}</Badge>
                  </div>
                  {categoryConfig?.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{categoryConfig.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} compact />
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {filteredTools.length === 0 && !loading && (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-gray-500">No tools found matching your filters.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function ToolCard({ tool, compact = false }: { tool: any; compact?: boolean }) {
  const categoryConfig = TOOL_CATEGORIES[tool.category as keyof typeof TOOL_CATEGORIES];
  const Icon = categoryConfig?.icon || Database;
  const lifecycleBadge = LIFECYCLE_BADGES[tool.lifecycle_stage as keyof typeof LIFECYCLE_BADGES];
  const LifecycleIcon = lifecycleBadge?.icon || AlertCircle;

  const tier = tool.metadata && typeof tool.metadata === 'object' && 'tier' in tool.metadata 
    ? tool.metadata.tier 
    : null;

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{tool.name}</CardTitle>
          </div>
          {tier === 1 && (
            <Badge className="bg-red-100 text-red-800 border-red-200">
              Tier 1
            </Badge>
          )}
        </div>
        {!compact && (
          <CardDescription className="line-clamp-2">
            {tool.tool_description || tool.description || 'No description available'}
          </CardDescription>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {/* Badges */}
          <div className="flex flex-wrap gap-2">
            {tool.category && categoryConfig && (
              <Badge className={categoryConfig.color}>
                {tool.category.replace('Healthcare/', '')}
              </Badge>
            )}
            
            {tool.lifecycle_stage && lifecycleBadge && (
              <Badge className={lifecycleBadge.color}>
                <LifecycleIcon className="h-3 w-3 mr-1" />
                {tool.lifecycle_stage}
              </Badge>
            )}
            
            {tool.implementation_type === 'langchain_tool' && (
              <Badge className="bg-purple-100 text-purple-800 border-purple-200">
                🔗 LangChain
              </Badge>
            )}
            
            {tool.langgraph_compatible && (
              <Badge className="bg-indigo-100 text-indigo-800 border-indigo-200">
                LangGraph
              </Badge>
            )}
          </div>

          {/* Metadata */}
          {!compact && tool.metadata && typeof tool.metadata === 'object' && (
            <div className="text-xs text-gray-500 space-y-1">
              {'license' in tool.metadata && (
                <div>License: {tool.metadata.license}</div>
              )}
              {'language' in tool.metadata && (
                <div>Language: {tool.metadata.language}</div>
              )}
            </div>
          )}

          {/* Documentation Link */}
          {tool.documentation_url && (
            <a
              href={tool.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center gap-1"
            >
              <ExternalLink className="h-3 w-3" />
              Documentation
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function ToolListItem({ tool }: { tool: any }) {
  const categoryConfig = TOOL_CATEGORIES[tool.category as keyof typeof TOOL_CATEGORIES];
  const Icon = categoryConfig?.icon || Database;
  const lifecycleBadge = LIFECYCLE_BADGES[tool.lifecycle_stage as keyof typeof LIFECYCLE_BADGES];
  const LifecycleIcon = lifecycleBadge?.icon || AlertCircle;

  return (
    <Card>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Icon className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold">{tool.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {tool.tool_description || tool.description}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {tool.category && categoryConfig && (
              <Badge className={categoryConfig.color}>
                {tool.category.replace('Healthcare/', '')}
              </Badge>
            )}
            
            {tool.lifecycle_stage && lifecycleBadge && (
              <Badge className={lifecycleBadge.color}>
                <LifecycleIcon className="h-3 w-3 mr-1" />
                {tool.lifecycle_stage}
              </Badge>
            )}
            
            {tool.implementation_type === 'langchain_tool' && (
              <Badge className="bg-purple-100 text-purple-800">
                🔗 LangChain
              </Badge>
            )}
            
            {tool.documentation_url && (
              <a
                href={tool.documentation_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800"
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

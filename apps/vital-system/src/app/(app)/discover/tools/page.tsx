// Healthcare Tools Registry - Enhanced UI
'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';
import { ToolDetailModal } from '@/components/tools/ToolDetailModal';
import { useAuth } from '@/lib/auth/supabase-auth-context';
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
  Hammer,
  Plus,
  Pencil,
  Trash2
} from 'lucide-react';
// Removed ToolRegistryService - now using API endpoint

// Tool categories with icons and colors
const TOOL_CATEGORIES: Record<string, { icon: any; color: string; description: string }> = {
  // Main seeded categories from tool_categories table
  'Evidence Research': {
    icon: Microscope,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Search and retrieve evidence from medical literature, clinical trials, and regulatory databases'
  },
  'Regulatory & Standards': {
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Access regulatory guidelines, standards, and compliance information'
  },
  'Digital Health': {
    icon: Heart,
    color: 'bg-pink-100 text-pink-800 border-pink-200',
    description: 'Digital medicine resources, decentralized trials, and digital endpoints'
  },
  'Knowledge Management': {
    icon: Database,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Internal knowledge bases and documentation'
  },
  'Computation': {
    icon: BarChart3,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Mathematical calculations and data analysis'
  },
  'General Research': {
    icon: Search,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Web search and general information retrieval'
  },
  'General': {
    icon: Wrench,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'General purpose tools'
  },
  // Healthcare categories
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
  // Digital Health tool categories
  'STATISTICAL_SOFTWARE': {
    icon: BarChart3,
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'Statistical analysis and data science tools'
  },
  'EDC_SYSTEM': {
    icon: FileText,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Electronic Data Capture systems'
  },
  'CTMS': {
    icon: Activity,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'Clinical Trial Management Systems'
  },
  'RESEARCH_DATABASE': {
    icon: Database,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Research databases and literature sources'
  },
  'PRO_REGISTRY': {
    icon: Heart,
    color: 'bg-rose-100 text-rose-800 border-rose-200',
    description: 'Patient-Reported Outcomes registries'
  },
  'DECISION_ANALYSIS': {
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Decision analysis and modeling tools'
  },
  'SIMULATION': {
    icon: Zap,
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    description: 'Simulation and Monte Carlo tools'
  },
  'REGULATORY_SUBMISSION': {
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Regulatory submission software'
  },
  'REGULATORY_INFORMATION_MANAGEMENT': {
    icon: Lock,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Regulatory information management'
  },
  'AI_ORCHESTRATION': {
    icon: Brain,
    color: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    description: 'AI workflow orchestration tools'
  },
  'WORKFLOW_MANAGEMENT': {
    icon: Activity,
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'Workflow and task management'
  },
  // Strategic Intelligence categories
  'Strategic Intelligence': {
    icon: TrendingUp,
    color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    description: 'Strategic intelligence and foresight tools'
  },
  'Strategic Intelligence/News': {
    icon: FileText,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'News monitoring and aggregation'
  },
  'Strategic Intelligence/Trends': {
    icon: TrendingUp,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'Trend analysis and forecasting'
  },
  'Strategic Intelligence/Competitive': {
    icon: BarChart3,
    color: 'bg-orange-100 text-orange-800 border-orange-200',
    description: 'Competitive intelligence tools'
  },
  'Strategic Intelligence/Market': {
    icon: TrendingUp,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Market research and analysis'
  },
  // Academic & Medical Literature
  'Academic/Literature': {
    icon: Microscope,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Academic literature search and analysis'
  },
  'Academic/Clinical Trials': {
    icon: Beaker,
    color: 'bg-teal-100 text-teal-800 border-teal-200',
    description: 'Clinical trials databases and registries'
  },
  'Academic/Regulatory': {
    icon: Shield,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Regulatory databases and guidelines'
  },
};

const LIFECYCLE_BADGES = {
  production: { color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  testing: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  development: { color: 'bg-gray-100 text-gray-800', icon: AlertCircle },
  staging: { color: 'bg-blue-100 text-blue-800', icon: TrendingUp },
};

// Tool interface for type safety
interface Tool {
  id: string;
  name: string;
  description?: string;
  tool_description?: string;
  category?: string;
  category_parent?: string;
  lifecycle_stage?: string;
  implementation_type?: string;
  metadata?: Record<string, unknown>;
  [key: string]: unknown;
}

export default function ToolsPage() {
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const [tools, setTools] = useState<Tool[]>([]);
  const [filteredTools, setFilteredTools] = useState<Tool[]>([]);
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
  const [selectedTool, setSelectedTool] = useState<any | null>(null);
  const [showToolModal, setShowToolModal] = useState(false);
  const [modalMode, setModalMode] = useState<'view' | 'edit'>('view');
  const [toolToDelete, setToolToDelete] = useState<Tool | null>(null);

  useEffect(() => {
    loadTools();
  }, []);

  useEffect(() => {
    filterTools();
  }, [searchQuery, selectedCategory, selectedLifecycle, tools]);

  const loadTools = async () => {
    try {
      setLoading(true);
      console.log('Tools page: Loading tools for current tenant...');

      // Fetch from API endpoint - no showAll parameter means tenant-filtered
      const response = await fetch('/api/tools-crud');

      if (!response.ok) {
        throw new Error(`Failed to fetch tools: ${response.statusText}`);
      }

      const data = await response.json();
      const allTools = data.tools || [];

      console.log('Tools page: Loaded', allTools.length, 'tools');

      setTools(allTools);

      // Calculate stats
      const healthcareTools = allTools.filter((t: Tool) =>
        t.category?.startsWith('Healthcare') ||
        t.category_parent === 'Healthcare' ||
        ['EDC_SYSTEM', 'CTMS', 'PRO_REGISTRY'].includes(t.category || '')
      );
      const researchTools = allTools.filter((t: Tool) =>
        t.category === 'Research' ||
        t.category?.startsWith('RESEARCH') ||
        t.category?.startsWith('Academic')
      );
      const strategicTools = allTools.filter((t: Tool) =>
        t.category?.startsWith('Strategic Intelligence') ||
        t.category_parent === 'Strategic Intelligence'
      );
      const tier1Tools = allTools.filter((t: Tool) =>
        t.metadata && typeof t.metadata === 'object' && 'tier' in t.metadata && t.metadata.tier === 1
      );

      setStats({
        total: allTools.length,
        healthcare: healthcareTools.length,
        research: researchTools.length,
        production: allTools.filter((t: Tool) => t.lifecycle_stage === 'production').length,
        testing: allTools.filter((t: Tool) => t.lifecycle_stage === 'testing').length,
        development: allTools.filter((t: Tool) => t.lifecycle_stage === 'development').length,
        langchainTools: allTools.filter((t: Tool) => t.implementation_type === 'langchain_tool').length,
        tier1: tier1Tools.length,
        fhir: allTools.filter((t: Tool) => t.category === 'Healthcare/FHIR' || t.category === 'FHIR').length,
        nlp: allTools.filter((t: Tool) => t.category === 'Healthcare/Clinical NLP' || t.category?.includes('NLP')).length,
        deidentification: allTools.filter((t: Tool) => t.category === 'Healthcare/De-identification').length,
      });

      console.log('Tools stats:', {
        total: allTools.length,
        healthcare: healthcareTools.length,
        research: researchTools.length,
        strategic: strategicTools.length,
        production: allTools.filter((t: Tool) => t.lifecycle_stage === 'production').length,
        langchain: allTools.filter((t: Tool) => t.implementation_type === 'langchain_tool').length,
        categories: [...new Set(allTools.map((t: Tool) => t.category))].slice(0, 20)
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

  const getUniqueCategories = (): string[] => {
    const categories = new Set(tools.map(t => t.category).filter((c): c is string => Boolean(c)));
    return Array.from(categories).sort();
  };

  const handleToolClick = (tool: any) => {
    setSelectedTool(tool);
    setShowToolModal(true);
  };

  const handleToolModalClose = () => {
    setShowToolModal(false);
    setSelectedTool(null);
  };

  const handleToolSave = (updatedTool: any) => {
    // Reload tools to get updated data
    loadTools();
  };

  const handleCreateTool = () => {
    // Create a new empty tool object for creation
    const newTool = {
      id: '',
      name: '',
      code: '',
      tool_description: '',
      category: 'General',
      tool_type: 'function',
      implementation_type: 'function',
      lifecycle_stage: 'development',
      is_active: true,
    };
    setSelectedTool(newTool);
    setModalMode('edit');
    setShowToolModal(true);
  };

  const handleEditTool = (tool: Tool) => {
    setSelectedTool(tool);
    setModalMode('edit');
    setShowToolModal(true);
  };

  const handleDeleteConfirm = (tool: Tool) => {
    setToolToDelete(tool);
  };

  const handleDeleteTool = async () => {
    if (!toolToDelete?.id) return;

    try {
      const response = await fetch(`/api/tools-crud/${toolToDelete.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tool');
      }

      // Reload tools after deletion
      loadTools();
      setToolToDelete(null);
    } catch (error: any) {
      console.error('Error deleting tool:', error);
      alert(`Failed to delete tool: ${error.message}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={Wrench}
          title="Tool Registry"
          description="Loading tools..."
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading tools from database...</p>
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
          icon={Wrench}
          title="Tool Registry"
          description={`Comprehensive catalog of ${stats.total} AI, healthcare, and research tools`}
        />
        {isAdmin && (
          <Button onClick={handleCreateTool} className="gap-2">
            <Plus className="h-4 w-4" />
            Create Tool
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
                Admin mode: You can create, edit, and delete tools
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
              <ToolCard key={tool.id} tool={tool} onClick={handleToolClick} isAdmin={isAdmin} onEdit={handleEditTool} onDelete={handleDeleteConfirm} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="list">
          <div className="space-y-4">
            {filteredTools.map((tool) => (
              <ToolListItem key={tool.id} tool={tool} onClick={handleToolClick} isAdmin={isAdmin} onEdit={handleEditTool} onDelete={handleDeleteConfirm} />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="categories">
          <div className="space-y-8">
            {getUniqueCategories().map(category => {
              const categoryTools = filteredTools.filter(t => t.category === category);
              if (categoryTools.length === 0) return null;

              const categoryConfig = TOOL_CATEGORIES[category];
              const Icon = categoryConfig?.icon || Database;

              // Format category name for display
              const formatCategoryName = (cat: string) => {
                return cat
                  .replace(/_/g, ' ')
                  .split(' ')
                  .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                  .join(' ');
              };

              return (
                <div key={category}>
                  <div className="flex items-center gap-3 mb-4">
                    <Icon className="h-6 w-6" />
                    <h2 className="text-2xl font-bold">{formatCategoryName(category)}</h2>
                    <Badge variant="secondary">{categoryTools.length}</Badge>
                  </div>
                  {categoryConfig?.description && (
                    <p className="text-gray-600 dark:text-gray-400 mb-4">{categoryConfig.description}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categoryTools.map((tool) => (
                      <ToolCard key={tool.id} tool={tool} compact onClick={handleToolClick} isAdmin={isAdmin} onEdit={handleEditTool} onDelete={handleDeleteConfirm} />
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

      {/* Tool Detail Modal */}
      <ToolDetailModal
        tool={selectedTool}
        isOpen={showToolModal}
        onClose={handleToolModalClose}
        onSave={handleToolSave}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      {toolToDelete && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Tool
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete &quot;{toolToDelete.name}&quot;? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setToolToDelete(null)}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDeleteTool}>
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}

function ToolCard({ tool, compact = false, onClick, isAdmin, onEdit, onDelete }: {
  tool: any;
  compact?: boolean;
  onClick?: (tool: any) => void;
  isAdmin?: boolean;
  onEdit?: (tool: any) => void;
  onDelete?: (tool: any) => void;
}) {
  // Try to find category config by category or category_parent
  const categoryConfig = TOOL_CATEGORIES[tool.category] || 
                         TOOL_CATEGORIES[tool.category_parent] ||
                         null;
  const Icon = categoryConfig?.icon || Database;
  const lifecycleBadge = LIFECYCLE_BADGES[tool.lifecycle_stage as keyof typeof LIFECYCLE_BADGES];
  const LifecycleIcon = lifecycleBadge?.icon || AlertCircle;

  const tier = tool.metadata && typeof tool.metadata === 'object' && 'tier' in tool.metadata 
    ? tool.metadata.tier 
    : null;

  // Format category display name
  const formatCategory = (category: string) => {
    if (!category) return '';
    return category
      .replace('Healthcare/', '')
      .replace('Strategic Intelligence/', '')
      .replace('Academic/', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => onClick?.(tool)}>
      <CardHeader className={compact ? 'pb-3' : ''}>
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            <CardTitle className="text-lg">{tool.name}</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            {tier === 1 && (
              <Badge className="bg-red-100 text-red-800 border-red-200">
                Tier 1
              </Badge>
            )}
            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(tool);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(tool);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
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
            {tool.category && (
              <Badge className={categoryConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {formatCategory(tool.category)}
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

          {/* Vendor & Version */}
          {!compact && (tool.vendor || tool.version) && (
            <div className="text-xs text-gray-500 space-y-1">
              {tool.vendor && <div>Vendor: {tool.vendor}</div>}
              {tool.version && <div>Version: {tool.version}</div>}
            </div>
          )}

          {/* Metadata */}
          {!compact && tool.metadata && typeof tool.metadata === 'object' && (
            <div className="text-xs text-gray-500 space-y-1">
              {'license' in tool.metadata && tool.metadata.license && (
                <div>License: {tool.metadata.license}</div>
              )}
              {'language' in tool.metadata && tool.metadata.language && (
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
              onClick={(e) => e.stopPropagation()}
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

function ToolListItem({ tool, onClick, isAdmin, onEdit, onDelete }: {
  tool: any;
  onClick?: (tool: any) => void;
  isAdmin?: boolean;
  onEdit?: (tool: any) => void;
  onDelete?: (tool: any) => void;
}) {
  const categoryConfig = TOOL_CATEGORIES[tool.category] || 
                         TOOL_CATEGORIES[tool.category_parent] ||
                         null;
  const Icon = categoryConfig?.icon || Database;
  const lifecycleBadge = LIFECYCLE_BADGES[tool.lifecycle_stage as keyof typeof LIFECYCLE_BADGES];
  const LifecycleIcon = lifecycleBadge?.icon || AlertCircle;

  // Format category display name
  const formatCategory = (category: string) => {
    if (!category) return '';
    return category
      .replace('Healthcare/', '')
      .replace('Strategic Intelligence/', '')
      .replace('Academic/', '')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  return (
    <Card className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 group" onClick={() => onClick?.(tool)}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1">
            <Icon className="h-6 w-6 text-gray-600" />
            <div className="flex-1">
              <h3 className="font-semibold">{tool.name}</h3>
              <p className="text-sm text-gray-500 line-clamp-1">
                {tool.tool_description || tool.description}
              </p>
              {tool.vendor && (
                <p className="text-xs text-gray-400 mt-1">
                  {tool.vendor} {tool.version && `v${tool.version}`}
                </p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {tool.category && (
              <Badge className={categoryConfig?.color || 'bg-gray-100 text-gray-800 border-gray-200'}>
                {formatCategory(tool.category)}
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
                onClick={(e) => e.stopPropagation()}
              >
                <ExternalLink className="h-4 w-4" />
              </a>
            )}

            {isAdmin && (
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(tool);
                  }}
                  className="h-8 w-8 p-0"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(tool);
                  }}
                  className="h-8 w-8 p-0 text-red-600 hover:text-red-700"
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

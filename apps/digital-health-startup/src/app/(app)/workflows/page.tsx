'use client';

import { useState, useEffect } from 'react';
import {
  Workflow as WorkflowIcon,
  Plus,
  Play,
  Pause,
  Settings,
  Clock,
  CheckCircle,
  AlertTriangle,
  FileText,
  TrendingUp,
  Users,
  Zap,
  BarChart3,
  Search,
  Filter,
  ArrowRight,
  Pencil,
  ChevronDown,
  ChevronRight,
  Target,
  Lightbulb,
  Shield,
  Cog,
  GraduationCap,
  Rocket,
} from 'lucide-react';
import Image from 'next/image';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Input } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';

// Domain configuration for better UI
const DOMAIN_CONFIG = {
  CD: {
    name: 'Clinical Development',
    icon: FileText,
    color: 'text-clinical-green',
    bgColor: 'bg-clinical-green/10',
    borderColor: 'border-clinical-green',
  },
  MA: {
    name: 'Medical Affairs',
    icon: TrendingUp,
    color: 'text-trust-blue',
    bgColor: 'bg-trust-blue/10',
    borderColor: 'border-trust-blue',
  },
  RA: {
    name: 'Regulatory Affairs',
    icon: CheckCircle,
    color: 'text-regulatory-gold',
    bgColor: 'bg-regulatory-gold/10',
    borderColor: 'border-regulatory-gold',
  },
  PD: {
    name: 'Product Development',
    icon: Zap,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    borderColor: 'border-purple-600',
  },
  EG: {
    name: 'Engagement',
    icon: Users,
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
    borderColor: 'border-pink-600',
  },
  RWE: {
    name: 'Real-World Evidence',
    icon: BarChart3,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    borderColor: 'border-indigo-600',
  },
};

const COMPLEXITY_COLORS = {
  BEGINNER: 'text-green-600 bg-green-100',
  INTERMEDIATE: 'text-blue-600 bg-blue-100',
  ADVANCED: 'text-orange-600 bg-orange-100',
  EXPERT: 'text-red-600 bg-red-100',
};

// Use Case Categories (SP) for Pharma/Medical Affairs
const USE_CASE_CATEGORIES = {
  'SP01': {
    code: 'SP01',
    name: 'SP01: Growth & Market Access',
    shortName: 'Growth',
    icon: Target,
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-300',
    description: 'Evidence generation and value demonstration to drive market access and product adoption',
  },
  'SP02': {
    code: 'SP02',
    name: 'SP02: Scientific Excellence',
    shortName: 'Science',
    icon: Lightbulb,
    color: 'text-blue-700',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    description: 'Advancing medical knowledge and maintaining scientific credibility',
  },
  'SP03': {
    code: 'SP03',
    name: 'SP03: Stakeholder Engagement',
    shortName: 'Engagement',
    icon: Users,
    color: 'text-purple-700',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    description: 'Building relationships with KOLs, HCPs, payers, and patient advocates',
  },
  'SP04': {
    code: 'SP04',
    name: 'SP04: Compliance & Quality',
    shortName: 'Compliance',
    icon: Shield,
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    description: 'Maintaining regulatory compliance and operational excellence',
  },
  'SP05': {
    code: 'SP05',
    name: 'SP05: Operational Excellence',
    shortName: 'Operations',
    icon: Cog,
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-300',
    description: 'Optimizing resources, processes, and ROI',
  },
  'SP06': {
    code: 'SP06',
    name: 'SP06: Talent Development',
    shortName: 'Talent',
    icon: GraduationCap,
    color: 'text-indigo-700',
    bgColor: 'bg-indigo-50',
    borderColor: 'border-indigo-300',
    description: 'Building capabilities and organizational effectiveness',
  },
  'SP07': {
    code: 'SP07',
    name: 'SP07: Innovation & Digital',
    shortName: 'Innovation',
    icon: Rocket,
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    description: 'Leveraging technology and innovation for competitive advantage',
  },
  'Uncategorized': {
    code: 'Uncategorized',
    name: 'Uncategorized Workflows',
    shortName: 'Other',
    icon: FileText,
    color: 'text-gray-700',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    description: 'Workflows pending strategic pillar assignment',
  },
};

interface UseCase {
  id: string;
  code: string;
  unique_id: string;
  title: string;
  description: string;
  domain: keyof typeof DOMAIN_CONFIG;
  complexity: keyof typeof COMPLEXITY_COLORS;
  estimated_duration_minutes: number;
  deliverables: string[];
  prerequisites: string[];
  strategic_pillar?: string;
  source?: string;
  category?: string;
  importance?: number;
  frequency?: string;
  sector?: string;
  industry?: string;
}

interface WorkflowStats {
  total_workflows: number;
  total_tasks: number;
  total_jtbds: number;
  by_domain: Record<string, number>;
  by_complexity: Record<string, number>;
  by_source: Record<string, number>;
  by_industry: Record<string, number>;
  by_strategic_pillar?: Record<string, number>;
}

interface StrategicPillarData {
  [pillar: string]: UseCase[];
}

export default function WorkflowsPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [strategicPillars, setStrategicPillars] = useState<StrategicPillarData>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [expandedPillars, setExpandedPillars] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchWorkflows();
  }, []);

  const fetchWorkflows = async () => {
    setIsLoading(true);
    try {
      console.log('🔄 Fetching workflows from API...');
      const response = await fetch('/api/workflows/usecases');
      console.log('📡 API Response status:', response.status);
      
      const data = await response.json();
      console.log('📦 API Response data:', data);
      
      if (data.success) {
        console.log(`✅ Received ${data.data.useCases?.length || 0} use cases`);
        console.log('📊 Use cases:', data.data.useCases);
        console.log('📈 Stats:', data.data.stats);
        console.log('🎯 Strategic Pillars:', data.data.strategicPillars);

        setUseCases(data.data.useCases || []);
        setStats(data.data.stats || null);
        setStrategicPillars(data.data.strategicPillars || {});
      } else {
        console.error('❌ API returned error:', data.error);
      }
    } catch (error) {
      console.error('❌ Failed to fetch workflows:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredUseCases = useCases.filter((uc) => {
    const matchesSearch =
      searchQuery === '' ||
      uc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      uc.code.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesDomain = selectedDomain === 'all' || uc.domain === selectedDomain;

    const matchesIndustry = selectedIndustry === 'all' ||
      (uc.industry || uc.sector || '').toLowerCase().includes(selectedIndustry.toLowerCase());

    // Debug logging (remove in production)
    if (useCases.length > 0 && useCases.indexOf(uc) === 0) {
      console.log('🔍 Filter check (first use case):', {
        selectedDomain,
        selectedIndustry,
        ucDomain: uc.domain,
        ucIndustry: uc.industry,
        matchesDomain,
        matchesIndustry,
        matchesSearch,
        code: uc.code
      });
    }

    return matchesSearch && matchesDomain && matchesIndustry;
  });

  const groupedByDomain = filteredUseCases.reduce((acc, uc) => {
    if (!acc[uc.domain]) acc[uc.domain] = [];
    acc[uc.domain].push(uc);
    return acc;
  }, {} as Record<string, UseCase[]>);

  const togglePillar = (pillarId: string) => {
    const newExpanded = new Set(expandedPillars);
    if (newExpanded.has(pillarId)) {
      newExpanded.delete(pillarId);
    } else {
      newExpanded.add(pillarId);
    }
    setExpandedPillars(newExpanded);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          
          {/* Header with Create Workflow Button */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Workflows</h1>
              <p className="text-gray-600 mt-1">Browse and manage your workflow use cases</p>
            </div>
            <Button
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md"
              onClick={() => window.location.href = '/workflows/editor?mode=create'}
            >
              <Plus className="mr-2 h-5 w-5" />
              Create Workflow
            </Button>
          </div>

      {/* Statistics Cards - Clean Design */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <WorkflowIcon className="h-3 w-3" />
                Total Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{useCases.length}</div>
              <p className="text-xs text-muted-foreground mt-1">Use Cases + JTBDs</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 bg-blue-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                <TrendingUp className="h-3 w-3" />
                Medical Affairs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.total_jtbds || 0}</div>
              <p className="text-xs text-muted-foreground mt-1">JTBDs</p>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 bg-green-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.total_workflows}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-gray-600 flex items-center gap-1">
                <FileText className="h-3 w-3" />
                Tasks
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_tasks}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 bg-purple-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                <BarChart3 className="h-3 w-3" />
                Domains
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">
                {Object.keys(stats.by_domain || {}).length}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters - Clean Design */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search use cases by title, code, or domain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="icon" className="flex-shrink-0">
              <Filter className="h-4 w-4" />
            </Button>
          </div>

          {/* Industry Filter Tabs */}
          <div className="flex items-center gap-3">
            <span className="text-sm font-medium text-gray-700">Industry:</span>
            <div className="flex gap-2">
              <Button
                variant={selectedIndustry === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndustry('all')}
                className="h-8"
              >
                All Industries
              </Button>
              <Button
                variant={selectedIndustry === 'startup' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndustry('startup')}
                className={`h-8 ${selectedIndustry === 'startup' ? 'bg-green-600 hover:bg-green-700' : ''}`}
              >
                Digital Health Startups
              </Button>
              <Button
                variant={selectedIndustry === 'pharma' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSelectedIndustry('pharma')}
                className={`h-8 ${selectedIndustry === 'pharma' ? 'bg-blue-600 hover:bg-blue-700' : ''}`}
              >
                Pharma & Life Sciences
              </Button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
            <span>Showing {filteredUseCases.length} of {useCases.length} use cases</span>
            {stats?.by_industry && (
              <div className="flex gap-4 text-xs">
                {Object.entries(stats.by_industry).map(([industry, count]) => (
                  <span key={industry} className="flex items-center gap-1">
                    <span className="font-medium">{industry}:</span>
                    <span>{count}</span>
                  </span>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Domain Tabs */}
      <Tabs value={selectedDomain} onValueChange={(value) => {
        console.log('🔄 Domain changed to:', value);
        setSelectedDomain(value);
      }}>
        <TabsList className="grid w-full grid-cols-7">
          <TabsTrigger value="all">All</TabsTrigger>
          {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
            <TabsTrigger key={key} value={key}>
              {config.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedDomain} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-muted-foreground">Loading use cases...</p>
              </div>
            </div>
          ) : filteredUseCases.length > 0 ? (
            <div className="space-y-6">
              {/* Pharma Industry with Use Case Categories (SP) View */}
              {selectedIndustry === 'pharma' && selectedDomain === 'MA' ? (
                <div className="space-y-4">
                  <div className="mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Medical Affairs Use Case Categories</h2>
                    <p className="text-gray-600">Click on each category to view related workflows and tasks</p>
                  </div>

                  {Object.entries(strategicPillars).length === 0 ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
                      <p className="text-gray-600">No Strategic Pillars found. Please check the database configuration.</p>
                    </div>
                  ) : null}

                  {Object.entries(strategicPillars).map(([spCode, workflows]) => {
                    const categoryConfig = USE_CASE_CATEGORIES[spCode as keyof typeof USE_CASE_CATEGORIES];
                    if (!categoryConfig) return null;

                    const CategoryIcon = categoryConfig.icon;
                    const isExpanded = expandedPillars.has(spCode);

                    return (
                      <Card key={spCode} className={`border-2 ${categoryConfig.borderColor}`}>
                        <CardHeader
                          className={`cursor-pointer hover:bg-gray-50 transition-colors ${categoryConfig.bgColor}`}
                          onClick={() => togglePillar(spCode)}
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className={`p-3 rounded-lg ${categoryConfig.bgColor} ${categoryConfig.borderColor} border-2`}>
                                <CategoryIcon className={`h-6 w-6 ${categoryConfig.color}`} />
                              </div>
                              <div>
                                <div className="flex items-center gap-3">
                                  <CardTitle className="text-xl font-bold">{categoryConfig.name}</CardTitle>
                                  <Badge variant="secondary" className="font-semibold">
                                    {workflows.length} Workflows
                                  </Badge>
                                </div>
                                <CardDescription className="mt-1 text-sm">
                                  {categoryConfig.description}
                                </CardDescription>
                              </div>
                            </div>
                            {isExpanded ? (
                              <ChevronDown className="h-6 w-6 text-gray-500" />
                            ) : (
                              <ChevronRight className="h-6 w-6 text-gray-500" />
                            )}
                          </div>
                        </CardHeader>

                        {isExpanded && (
                          <CardContent className="pt-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                              {workflows.map((workflow) => (
                                <UseCaseCard key={workflow.id} useCase={workflow} />
                              ))}
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              ) : selectedDomain === 'all' ? (
                // Group by domain
                Object.entries(groupedByDomain).map(([domain, cases]) => {
                  const config = DOMAIN_CONFIG[domain as keyof typeof DOMAIN_CONFIG];

                  // Skip if domain config not found
                  if (!config) {
                    console.warn(`Unknown domain: ${domain}`);
                    return null;
                  }

                  const Icon = config.icon;

                  return (
                    <div key={domain} className="space-y-4">
                      <div className="flex items-center gap-3 pb-2 border-b">
                        <Icon className="h-5 w-5 text-muted-foreground" />
                        <h2 className="text-xl font-semibold">{config.name}</h2>
                        <Badge variant="secondary">{cases.length}</Badge>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {cases.map((useCase) => (
                          <UseCaseCard key={useCase.id} useCase={useCase} />
                        ))}
                      </div>
                    </div>
                  );
                })
              ) : (
                // Show selected domain
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {filteredUseCases.map((useCase) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-medical-gray mb-4">No use cases found</p>
                {useCases.length > 0 && (
                  <div className="text-xs text-left max-w-2xl mx-auto">
                    <p className="font-semibold mb-2">Debug Info:</p>
                    <p>Total use cases loaded: {useCases.length}</p>
                    <p>Selected domain: {selectedDomain}</p>
                    <p>Search query: "{searchQuery}"</p>
                    <p>Filtered results: {filteredUseCases.length}</p>
                    <details className="mt-2">
                      <summary className="cursor-pointer">View raw data</summary>
                      <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-h-64">
                        {JSON.stringify(useCases.slice(0, 3), null, 2)}
                      </pre>
                    </details>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// USE CASE CARD COMPONENT
// ============================================================================

interface UseCaseCardProps {
  useCase: UseCase;
}

function UseCaseCard({ useCase }: UseCaseCardProps) {
  const domainConfig = DOMAIN_CONFIG[useCase.domain];
  
  // Safety check: if domain config not found, use default
  if (!domainConfig) {
    console.warn(`Unknown domain for use case: ${useCase.domain}`);
    return null;
  }
  
  const Icon = domainConfig.icon;
  const complexityColor = COMPLEXITY_COLORS[useCase.complexity] || 'text-gray-600 bg-gray-100';

  const handleCardClick = () => {
    // Navigate to detail page
    window.location.href = `/workflows/${useCase.code}`;
  };

  const handleExecute = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // TODO: Implement workflow execution
    console.log('Execute workflow:', useCase.code);
  };

  const handleConfigure = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click
    // TODO: Implement workflow configuration
    console.log('Configure workflow:', useCase.code);
  };

  // Determine industry badge
  const getIndustryBadge = () => {
    const industry = useCase.industry || useCase.sector || '';
    if (industry.toLowerCase().includes('startup') || industry.toLowerCase().includes('digital health')) {
      return { label: 'Startup', color: 'bg-green-100 text-green-800 border-green-300' };
    } else if (industry.toLowerCase().includes('pharma')) {
      return { label: 'Pharma', color: 'bg-blue-100 text-blue-800 border-blue-300' };
    }
    return null;
  };

  const industryBadge = getIndustryBadge();

  return (
    <Card
      className="hover:shadow-lg transition-shadow cursor-pointer"
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <Icon className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-lg">
              {useCase.title}
            </CardTitle>
          </div>
          {industryBadge && (
            <Badge variant="outline" className={`text-xs font-semibold ${industryBadge.color}`}>
              {industryBadge.label}
            </Badge>
          )}
        </div>
        <CardDescription className="text-sm mb-4">
          {useCase.description}
        </CardDescription>

        {/* Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs font-mono">
            {useCase.code}
          </Badge>
          <Badge className={`text-xs ${complexityColor} border-0`}>
            {useCase.complexity}
          </Badge>
          {useCase.strategic_pillar && (
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
              {useCase.strategic_pillar}
            </Badge>
          )}
          {useCase.frequency && (
            <Badge variant="outline" className="text-xs">
              {useCase.frequency}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {useCase.estimated_duration_minutes || 0} min
          </Badge>
          <Badge variant="outline" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            {useCase.deliverables?.length || 0} deliverables
          </Badge>
          {useCase.importance && (
            <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700 border-orange-200">
              Priority: {useCase.importance}/10
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            {useCase.source && (
              <Badge variant="outline" className="text-xs">
                {useCase.source === 'Medical Affairs JTBD Library' ? 'MA JTBD' : 'DH Use Case'}
              </Badge>
            )}
            <span className="text-muted-foreground text-xs">
              Click to view details
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={(e) => {
              e.stopPropagation();
              handleExecute(e);
            }}
          >
            Execute
            <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

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
    name: 'Market Access',
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
  BEGINNER: 'text-emerald-600 bg-emerald-100',
  INTERMEDIATE: 'text-sky-600 bg-sky-100',
  ADVANCED: 'text-orange-600 bg-orange-100',
  EXPERT: 'text-rose-600 bg-rose-100',
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
}

interface WorkflowStats {
  total_workflows: number;
  total_tasks: number;
  by_domain: Record<string, number>;
  by_complexity: Record<string, number>;
}

export default function WorkflowsPage() {
  const [useCases, setUseCases] = useState<UseCase[]>([]);
  const [stats, setStats] = useState<WorkflowStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<string>('all');

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
        
        setUseCases(data.data.useCases || []);
        setStats(data.data.stats || null);
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
    
    // Debug logging (remove in production)
    if (useCases.length > 0 && useCases.indexOf(uc) === 0) {
      console.log('🔍 Filter check (first use case):', {
        selectedDomain,
        ucDomain: uc.domain,
        matchesDomain,
        matchesSearch,
        code: uc.code
      });
    }
    
    return matchesSearch && matchesDomain;
  });

  const groupedByDomain = filteredUseCases.reduce((acc, uc) => {
    if (!acc[uc.domain]) acc[uc.domain] = [];
    acc[uc.domain].push(uc);
    return acc;
  }, {} as Record<string, UseCase[]>);

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">

      {/* Statistics Cards - Clean Design */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-stone-600 flex items-center gap-1">
                <WorkflowIcon className="h-3 w-3" />
                Use Cases
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{useCases.length}</div>
            </CardContent>
          </Card>

          <Card className="border-2 border-emerald-200 bg-emerald-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-emerald-800 flex items-center gap-1">
                <CheckCircle className="h-3 w-3" />
                Workflows
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-emerald-600">{stats.total_workflows}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-medium text-stone-600 flex items-center gap-1">
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
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
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
          <div className="mt-4 text-sm text-muted-foreground">
            Showing {filteredUseCases.length} of {useCases.length} use cases
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
              {selectedDomain === 'all' ? (
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
                      <pre className="mt-2 p-2 bg-stone-100 rounded text-xs overflow-auto max-h-64">
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
  const complexityColor = COMPLEXITY_COLORS[useCase.complexity] || 'text-stone-600 bg-stone-100';

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
          <Badge variant="outline" className="text-xs">
            <Clock className="w-3 h-3 mr-1" />
            {useCase.estimated_duration_minutes || 0} min
          </Badge>
          <Badge variant="outline" className="text-xs">
            <FileText className="w-3 h-3 mr-1" />
            {useCase.deliverables?.length || 0} deliverables
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground text-xs">
            Click to view details
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
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

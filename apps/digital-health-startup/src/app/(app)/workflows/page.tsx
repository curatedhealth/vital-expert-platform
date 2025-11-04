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
  BEGINNER: 'text-green-600 bg-green-100',
  INTERMEDIATE: 'text-blue-600 bg-blue-100',
  ADVANCED: 'text-orange-600 bg-orange-100',
  EXPERT: 'text-red-600 bg-red-100',
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div className="flex items-center gap-3">
          <WorkflowIcon className="w-8 h-8 text-muted-foreground" />
          <div>
            <h1 className="text-3xl font-bold">Workflows</h1>
            <p className="text-sm text-muted-foreground">
              Guided multi-step processes for digital health use cases
            </p>
          </div>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md">
          <Plus className="mr-2 h-4 w-4" />
          Create Use Case
        </Button>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700">Use Cases</p>
                  <p className="text-2xl font-bold text-blue-900">{useCases.length}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                  <WorkflowIcon className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-700">Workflows</p>
                  <p className="text-2xl font-bold text-green-900">{stats.total_workflows}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-orange-700">Tasks</p>
                  <p className="text-2xl font-bold text-orange-900">{stats.total_tasks}</p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                  <FileText className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700">Domains</p>
                  <p className="text-2xl font-bold text-purple-900">
                    {Object.keys(stats.by_domain || {}).length}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search & Filters */}
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search use cases by title, code, or domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 border-gray-200 focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <Button variant="outline" size="icon" className="flex-shrink-0">
          <Filter className="h-4 w-4" />
        </Button>
      </div>

      {/* Domain Tabs */}
      <Tabs value={selectedDomain} onValueChange={(value) => {
        console.log('🔄 Domain changed to:', value);
        setSelectedDomain(value);
      }}>
        <TabsList className="grid w-full grid-cols-7 bg-gray-100">
          <TabsTrigger value="all" className="data-[state=active]:bg-white">All</TabsTrigger>
          {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
            <TabsTrigger 
              key={key} 
              value={key}
              className="data-[state=active]:bg-white"
            >
              {config.name.split(' ')[0]}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value={selectedDomain} className="mt-6">
          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="text-center space-y-4">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-medical-gray">Loading use cases...</p>
              </div>
            </div>
          ) : filteredUseCases.length > 0 ? (
            <div className="space-y-6">
              {/* Debug info */}
              <div className="text-xs text-medical-gray">
                Showing {filteredUseCases.length} of {useCases.length} use cases
              </div>
              
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
                      <div className="flex items-center gap-3 p-4 bg-white rounded-lg border">
                        <div className={`w-10 h-10 rounded-lg ${config.bgColor} flex items-center justify-center`}>
                          <Icon className={`h-5 w-5 ${config.color}`} />
                        </div>
                        <h2 className="text-xl font-semibold text-gray-900">{config.name}</h2>
                        <Badge variant="outline" className="ml-auto">{cases.length} use cases</Badge>
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

  return (
    <Card 
      className={`group border-0 shadow-sm hover:shadow-lg transition-all duration-200 cursor-pointer bg-white overflow-hidden`}
      onClick={handleCardClick}
    >
      <CardContent className="p-5">
        <div className="space-y-4">
          {/* Header with icon and badges */}
          <div className="flex items-start gap-3">
            <div className={`w-12 h-12 rounded-xl ${domainConfig.bgColor} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform`}>
              <Icon className={`h-6 w-6 ${domainConfig.color}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono">{useCase.code}</Badge>
                <Badge className={`text-xs ${complexityColor} border-0`}>
                  {useCase.complexity}
                </Badge>
              </div>
              <h3 className="font-semibold text-base text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                {useCase.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
            {useCase.description}
          </p>

          {/* Meta Info */}
          <div className="flex items-center gap-4 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              <span>{useCase.estimated_duration_minutes || 0} min</span>
            </div>
            <div className="flex items-center gap-1.5">
              <FileText className="h-4 w-4" />
              <span>{useCase.deliverables?.length || 0} deliverables</span>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              size="sm" 
              onClick={handleExecute}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white border-0"
            >
              <Play className="mr-1.5 h-3.5 w-3.5" />
              Execute
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={handleConfigure}
              className="px-3 border-gray-200 hover:border-gray-300 hover:bg-gray-50"
            >
              <Settings className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

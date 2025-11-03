/**
 * Workflows Dashboard Page
 * Browse and execute digital health workflows
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Loader2,
  Search,
  Play,
  FileText,
  TrendingUp,
  Users,
  Zap,
  Clock,
  CheckCircle2,
  BarChart3,
  Workflow as WorkflowIcon,
  LayoutDashboard,
} from 'lucide-react';
import { useRequireAuth } from '@/hooks/use-auth';
import {
  useUseCases,
  useDomainStatistics,
  useFoundationStatistics,
} from '@/hooks/use-workflows';
import type { UseCase, UseCaseDomain, ComplexityLevel } from '@/types/workflow.types';

const DOMAIN_CONFIG: Record<UseCaseDomain, { name: string; color: string; icon: any }> = {
  CD: { name: 'Clinical Development', color: 'blue', icon: FileText },
  MA: { name: 'Market Access', color: 'green', icon: TrendingUp },
  RA: { name: 'Regulatory Affairs', color: 'purple', icon: CheckCircle2 },
  PD: { name: 'Product Development', color: 'orange', icon: Zap },
  EG: { name: 'Engagement', color: 'pink', icon: Users },
  RWE: { name: 'Real-World Evidence', color: 'indigo', icon: BarChart3 },
  PMS: { name: 'Post-Market Surveillance', color: 'red', icon: WorkflowIcon },
};

const COMPLEXITY_COLORS: Record<ComplexityLevel, string> = {
  BEGINNER: 'green',
  INTERMEDIATE: 'blue',
  ADVANCED: 'orange',
  EXPERT: 'red',
};

export default function WorkflowsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const [selectedDomain, setSelectedDomain] = useState<UseCaseDomain | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch data
  const { data: useCases, isLoading: useCasesLoading } = useUseCases({
    domain: selectedDomain === 'all' ? undefined : selectedDomain,
    search: searchQuery || undefined,
  });

  const { data: domainStats, isLoading: statsLoading } = useDomainStatistics();
  const { data: foundationStats } = useFoundationStatistics();

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const isLoading = useCasesLoading || statsLoading;

  const getComplexityColor = (complexity: ComplexityLevel) => {
    const color = COMPLEXITY_COLORS[complexity];
    return `text-${color}-600 bg-${color}-100 dark:bg-${color}-900/20`;
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Use Case Catalog</h1>
              <p className="text-muted-foreground mt-1">
                Browse digital health use cases by domain • Each use case contains workflows with tasks
              </p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => router.push('/dashboard')}>
                <LayoutDashboard className="w-4 h-4 mr-2" />
                Dashboard
              </Button>
              <Button variant="outline" onClick={() => router.push('/')}>
                Home
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Statistics Cards */}
        {!isLoading && domainStats && foundationStats && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Use Cases</p>
                    <p className="text-3xl font-bold">
                      {domainStats.reduce((sum, d) => sum + d.use_case_count, 0)}
                    </p>
                  </div>
                  <WorkflowIcon className="w-8 h-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Workflows</p>
                    <p className="text-3xl font-bold">
                      {domainStats.reduce((sum, d) => sum + d.workflow_count, 0)}
                    </p>
                  </div>
                  <FileText className="w-8 h-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Tasks</p>
                    <p className="text-3xl font-bold">
                      {domainStats.reduce((sum, d) => sum + d.task_count, 0)}
                    </p>
                  </div>
                  <CheckCircle2 className="w-8 h-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">AI Agents</p>
                    <p className="text-3xl font-bold">{foundationStats.total_agents}</p>
                  </div>
                  <Zap className="w-8 h-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Search & Filters */}
        <div className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search use cases by title, code, or domain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Results Summary */}
        {!isLoading && useCases && (
          <div className="text-sm text-muted-foreground">
            Showing {useCases.length} use case{useCases.length !== 1 ? 's' : ''}
          </div>
        )}

        {/* Domain Tabs */}
        <Tabs value={selectedDomain} onValueChange={(v) => setSelectedDomain(v as UseCaseDomain | 'all')}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">
              All
              {!isLoading && domainStats && (
                <Badge variant="secondary" className="ml-1">
                  {domainStats.reduce((sum, d) => sum + d.use_case_count, 0)}
                </Badge>
              )}
            </TabsTrigger>
            {Object.entries(DOMAIN_CONFIG).map(([key, config]) => {
              const domainStat = domainStats?.find(s => s.domain === key);
              return (
                <TabsTrigger key={key} value={key}>
                  {config.name.split(' ')[0]}
                  {domainStat && (
                    <Badge variant="secondary" className="ml-1">
                      {domainStat.use_case_count}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          {/* All Domains */}
          <TabsContent value="all" className="space-y-6 mt-6">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : useCases && useCases.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {useCases.map((useCase) => (
                  <UseCaseCard key={useCase.id} useCase={useCase} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No use cases found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Individual Domain Tabs */}
          {Object.keys(DOMAIN_CONFIG).map((domain) => (
            <TabsContent key={domain} value={domain} className="space-y-6 mt-6">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : useCases && useCases.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {useCases.map((useCase) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No use cases found for this domain</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          ))}
        </Tabs>
      </main>
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
  const router = useRouter();
  const domainConfig = DOMAIN_CONFIG[useCase.domain];
  const Icon = domainConfig.icon;
  const complexityColor = COMPLEXITY_COLORS[useCase.complexity];

  return (
    <Card 
      className={`cursor-pointer hover:shadow-xl transition-all duration-300 border-l-4 border-l-${domainConfig.color}-500 hover:-translate-y-1`}
      onClick={() => router.push(`/workflows/${useCase.code}`)}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={`p-2.5 rounded-lg bg-${domainConfig.color}-100 dark:bg-${domainConfig.color}-900/20 flex-shrink-0`}>
              <Icon className={`w-5 h-5 text-${domainConfig.color}-600 dark:text-${domainConfig.color}-400`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono">
                  {useCase.code}
                </Badge>
                <Badge className={`text-xs text-${complexityColor}-600 bg-${complexityColor}-100 dark:bg-${complexityColor}-900/20`}>
                  {useCase.complexity}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {useCase.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {useCase.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Duration */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="p-1.5 bg-blue-50 dark:bg-blue-900/20 rounded">
                <Clock className="w-3.5 h-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Duration</p>
                <p className="font-semibold">{useCase.estimated_duration_minutes}m</p>
              </div>
            </div>

            {/* Deliverables */}
            {useCase.deliverables && useCase.deliverables.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="p-1.5 bg-green-50 dark:bg-green-900/20 rounded">
                  <FileText className="w-3.5 h-3.5 text-green-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Outputs</p>
                  <p className="font-semibold">{useCase.deliverables.length}</p>
                </div>
              </div>
            )}

            {/* Prerequisites */}
            {useCase.prerequisites && useCase.prerequisites.length > 0 && (
              <div className="flex items-center gap-1.5 text-xs">
                <div className="p-1.5 bg-orange-50 dark:bg-orange-900/20 rounded">
                  <CheckCircle2 className="w-3.5 h-3.5 text-orange-600" />
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Required</p>
                  <p className="font-semibold">{useCase.prerequisites.length}</p>
                </div>
              </div>
            )}

            {/* Domain Badge */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="p-1.5 bg-purple-50 dark:bg-purple-900/20 rounded">
                <Icon className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide">Domain</p>
                <p className="font-semibold text-[11px]">{domainConfig.name.split(' ')[0]}</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button 
              size="sm" 
              variant="default" 
              className="flex-1 text-xs h-8"
              onClick={(e) => {
                e.stopPropagation();
                router.push(`/workflows/${useCase.code}/execute`);
              }}
            >
              <Play className="w-3 h-3 mr-1" />
              Execute
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 px-3"
              onClick={(e) => {
                e.stopPropagation();
                // View details (same as card click)
                router.push(`/workflows/${useCase.code}`);
              }}
            >
              <FileText className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


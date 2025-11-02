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
              <h1 className="text-3xl font-bold tracking-tight">Digital Health Workflows</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered workflows for digital therapeutics development
              </p>
            </div>
            <Button onClick={() => router.push('/')}>
              Back to Home
            </Button>
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
              placeholder="Search workflows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Domain Tabs */}
        <Tabs value={selectedDomain} onValueChange={(v) => setSelectedDomain(v as UseCaseDomain | 'all')}>
          <TabsList className="grid w-full grid-cols-8">
            <TabsTrigger value="all">All</TabsTrigger>
            {Object.entries(DOMAIN_CONFIG).map(([key, config]) => (
              <TabsTrigger key={key} value={key}>
                {config.name.split(' ')[0]}
              </TabsTrigger>
            ))}
          </TabsList>

          {/* All Domains */}
          <TabsContent value="all" className="space-y-4">
            {isLoading ? (
              <div className="flex justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : useCases && useCases.length > 0 ? (
              <div className="grid grid-cols-1 gap-4">
                {useCases.map((useCase) => (
                  <UseCaseCard key={useCase.id} useCase={useCase} />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No workflows found</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Individual Domain Tabs */}
          {Object.keys(DOMAIN_CONFIG).map((domain) => (
            <TabsContent key={domain} value={domain} className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
              ) : useCases && useCases.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {useCases.map((useCase) => (
                    <UseCaseCard key={useCase.id} useCase={useCase} />
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">No workflows found for this domain</p>
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

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => router.push(`/workflows/${useCase.code}`)}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          {/* Icon */}
          <div className={`p-3 rounded-lg bg-${domainConfig.color}-100 dark:bg-${domainConfig.color}-900/20`}>
            <Icon className={`w-6 h-6 text-${domainConfig.color}-600 dark:text-${domainConfig.color}-400`} />
          </div>

          {/* Content */}
          <div className="flex-1 space-y-3">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline">{useCase.code}</Badge>
                  <Badge className={`text-${COMPLEXITY_COLORS[useCase.complexity]}-600`}>
                    {useCase.complexity}
                  </Badge>
                  <Badge variant="secondary">{domainConfig.name}</Badge>
                </div>
                <h3 className="text-lg font-semibold">{useCase.title}</h3>
              </div>

              <Button size="sm" variant="default" onClick={(e) => {
                e.stopPropagation();
                router.push(`/workflows/${useCase.code}/execute`);
              }}>
                <Play className="w-4 h-4 mr-2" />
                Execute
              </Button>
            </div>

            {/* Description */}
            <p className="text-sm text-muted-foreground line-clamp-2">
              {useCase.description}
            </p>

            {/* Meta Info */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                <span>{useCase.estimated_duration_minutes} min</span>
              </div>
              {useCase.deliverables && useCase.deliverables.length > 0 && (
                <div className="flex items-center gap-1">
                  <FileText className="w-4 h-4" />
                  <span>{useCase.deliverables.length} deliverables</span>
                </div>
              )}
              {useCase.prerequisites && useCase.prerequisites.length > 0 && (
                <div className="flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{useCase.prerequisites.length} prerequisites</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


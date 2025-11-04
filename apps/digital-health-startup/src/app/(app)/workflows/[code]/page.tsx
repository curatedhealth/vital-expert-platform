'use client';

import { useParams, useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ArrowLeft, Play, Settings, Clock, FileText, CheckCircle, AlertCircle, Workflow as WorkflowIcon, Bot, Wrench, Database, GitBranch } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkflowFlowVisualizer } from '@/components/workflow-flow';
import { UseCaseDetailSkeleton } from '@/components/loading-skeletons';

interface UseCase {
  id: string;
  code: string;
  title: string;
  description: string;
  domain: string;
  complexity: string;
  estimated_duration_minutes: number;
  deliverables: string[];
  prerequisites: string[];
  success_metrics: Record<string, any>;
}

interface Workflow {
  id: string;
  use_case_id: string;
  name: string;
  unique_id: string;
  description: string;
  position: number;
  metadata: Record<string, any>;
}

interface Agent {
  id: string;
  code: string;
  name: string;
  type: string;
  assignment_type: string;
  execution_order: number;
}

interface Tool {
  id: string;
  code: string;
  name: string;
  type: string;
  category: string;
}

interface RagSource {
  id: string;
  code: string;
  name: string;
  source_type: string;
  description: string;
}

interface Task {
  id: string;
  workflow_id: string;
  code: string;
  unique_id: string;
  title: string;
  objective: string;
  position: number;
  extra: Record<string, any>;
  agents?: Agent[];
  tools?: Tool[];
  rags?: RagSource[];
}

const COMPLEXITY_COLORS: Record<string, string> = {
  'Basic': 'text-green-700 bg-green-100',
  'Intermediate': 'text-blue-700 bg-blue-100',
  'Advanced': 'text-orange-700 bg-orange-100',
  'Expert': 'text-red-700 bg-red-100',
};

export default function UseCaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const code = params?.code as string;

  const [useCase, setUseCase] = useState<UseCase | null>(null);
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [tasks, setTasks] = useState<Record<string, Task[]>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  // Ensure component is mounted before rendering
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        console.log('🚀 Fetching complete use case data...');
        const startTime = performance.now();
        
        // Single optimized API call
        const response = await fetch(`/api/workflows/usecases/${code}/complete`);
        
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          console.error('❌ API Error Response:', errorData);
          throw new Error(`Failed to fetch use case data: ${JSON.stringify(errorData)}`);
        }

        const data = await response.json();
        
        if (data.success) {
          setUseCase(data.data.useCase);
          setWorkflows(data.data.workflows || []);
          setTasks(data.data.tasksByWorkflow || {});
          
          const endTime = performance.now();
          console.log(`✅ Loaded in ${(endTime - startTime).toFixed(0)}ms`);
          console.log(`📊 Loaded ${data.data.workflows?.length || 0} workflows with ${Object.keys(data.data.tasksByWorkflow || {}).length} task groups`);
        } else {
          setError(data.error || 'Failed to fetch use case');
        }
      } catch (err) {
        console.error('❌ Error fetching use case:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    if (code) {
      fetchData();
    }
  }, [code]);

  if (!mounted || loading) {
    return <UseCaseDetailSkeleton />;
  }

  if (error || !useCase) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-red-900 mb-2">Error Loading Use Case</h2>
            <p className="text-red-700 mb-4">{error || 'Use case not found'}</p>
            <Button variant="outline" onClick={() => router.push('/workflows')}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Workflows
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const complexityColor = COMPLEXITY_COLORS[useCase.complexity] || 'text-gray-600 bg-gray-100';

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Back Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => router.push('/workflows')}
        className="gap-2"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Workflows
      </Button>

      {/* Header */}
      <div className="flex items-start justify-between gap-6">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-3">
            <Badge variant="outline" className="font-mono">{useCase.code}</Badge>
            <Badge className={complexityColor + " border-0"}>{useCase.complexity}</Badge>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {useCase.title}
          </h1>
          <p className="text-lg text-gray-600">
            {useCase.description}
          </p>
        </div>
        <div className="flex gap-3 flex-shrink-0">
          <Button size="lg" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md">
            <Play className="mr-2 h-5 w-5" />
            Execute Workflow
          </Button>
          <Button size="lg" variant="outline">
            <Settings className="mr-2 h-5 w-5" />
            Configure
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-blue-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-700">Duration</p>
                <p className="text-2xl font-bold text-blue-900">{useCase.estimated_duration_minutes} min</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center">
                <Clock className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-green-50 to-green-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Workflows</p>
                <p className="text-2xl font-bold text-green-900">{workflows.length}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-green-600 flex items-center justify-center">
                <WorkflowIcon className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-orange-50 to-orange-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-orange-700">Tasks</p>
                <p className="text-2xl font-bold text-orange-900">
                  {Object.values(tasks).reduce((sum, t) => sum + t.length, 0)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-orange-600 flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-50 to-purple-100">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-purple-700">Deliverables</p>
                <p className="text-2xl font-bold text-purple-900">{useCase.deliverables?.length || 0}</p>
              </div>
              <div className="w-12 h-12 rounded-lg bg-purple-600 flex items-center justify-center">
                <FileText className="h-6 w-6 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="workflows" className="space-y-6">
        <TabsList className="bg-gray-100">
          <TabsTrigger value="workflows" className="data-[state=active]:bg-white">
            <WorkflowIcon className="w-4 h-4 mr-2" />
            Workflows & Tasks
          </TabsTrigger>
          <TabsTrigger value="visualization" className="data-[state=active]:bg-white">
            <GitBranch className="w-4 h-4 mr-2" />
            Flow Diagram
          </TabsTrigger>
          <TabsTrigger value="deliverables" className="data-[state=active]:bg-white">
            <FileText className="w-4 h-4 mr-2" />
            Deliverables
          </TabsTrigger>
          <TabsTrigger value="prerequisites" className="data-[state=active]:bg-white">
            <AlertCircle className="w-4 h-4 mr-2" />
            Prerequisites
          </TabsTrigger>
          <TabsTrigger value="metrics" className="data-[state=active]:bg-white">
            <CheckCircle className="w-4 h-4 mr-2" />
            Success Metrics
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workflows" className="space-y-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <WorkflowIcon className="h-12 w-12 text-medical-gray mx-auto mb-4 opacity-50" />
                <p className="text-medical-gray">No workflows found for this use case</p>
              </CardContent>
            </Card>
          ) : (
            workflows.map((workflow, idx) => (
              <Card key={workflow.id} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                  <div className="flex items-center justify-between">
                    <div>
                      <Badge variant="outline" className="mb-2 font-mono bg-white">
                        Workflow {idx + 1}
                      </Badge>
                      <CardTitle className="text-2xl text-gray-900">{workflow.name}</CardTitle>
                      <p className="text-sm text-gray-600 mt-2">
                        {workflow.description}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                        <Play className="mr-1 h-3 w-3" />
                        Run
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {tasks[workflow.id] && tasks[workflow.id].length > 0 ? (
                    <div className="space-y-4 p-2">
                      <h4 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                        <CheckCircle className="w-4 h-4" />
                        Tasks ({tasks[workflow.id].length})
                      </h4>
                      <div className="space-y-4">
                        {tasks[workflow.id]
                          .sort((a, b) => a.position - b.position)
                          .map((task) => (
                            <div
                              key={task.id}
                              className="border-0 rounded-xl p-5 bg-gradient-to-br from-gray-50 to-white hover:from-white hover:to-gray-50 transition-all shadow-sm hover:shadow-md"
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 text-white text-sm flex items-center justify-center font-bold shadow-md">
                                  {task.position}
                                </div>
                                <div className="flex-1 min-w-0 space-y-4">
                                  {/* Task Header */}
                                  <div>
                                    <div className="flex items-center gap-2 mb-1">
                                      <p className="font-semibold text-deep-charcoal">
                                        {task.title}
                                      </p>
                                      <Badge variant="outline" className="text-xs">
                                        {task.code}
                                      </Badge>
                                    </div>
                                    <p className="text-sm text-medical-gray">
                                      {task.objective}
                                    </p>
                                  </div>

                                  {/* Agents */}
                                  {task.agents && task.agents.length > 0 && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Bot className="h-4 w-4 text-blue-600" />
                                        <span className="text-sm font-semibold text-blue-900">
                                          AI Agents ({task.agents.length})
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                        {task.agents
                                          .sort((a, b) => a.execution_order - b.execution_order)
                                          .map((agent) => (
                                            <div
                                              key={agent.id}
                                              className="bg-white rounded px-3 py-2 flex items-center justify-between"
                                            >
                                              <div className="flex-1 min-w-0">
                                                <p className="text-sm font-medium text-deep-charcoal truncate">
                                                  {agent.name}
                                                </p>
                                                <p className="text-xs text-medical-gray">
                                                  Order: {agent.execution_order}
                                                </p>
                                              </div>
                                              <Badge variant="outline" className="text-xs ml-2 flex-shrink-0">
                                                {agent.assignment_type === 'PRIMARY_EXECUTOR'
                                                  ? 'Primary'
                                                  : agent.assignment_type === 'CO_EXECUTOR'
                                                  ? 'Co-Executor'
                                                  : agent.assignment_type === 'VALIDATOR'
                                                  ? 'Validator'
                                                  : 'Support'}
                                              </Badge>
                                            </div>
                                          ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Tools */}
                                  {task.tools && task.tools.length > 0 && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Wrench className="h-4 w-4 text-green-600" />
                                        <span className="text-sm font-semibold text-green-900">
                                          Tools ({task.tools.length})
                                        </span>
                                      </div>
                                      <div className="flex flex-wrap gap-2">
                                        {task.tools.map((tool) => (
                                          <Badge
                                            key={tool.id}
                                            variant="outline"
                                            className="bg-white border-green-300 text-green-800"
                                          >
                                            {tool.name}
                                            <span className="ml-1 text-xs text-green-600">
                                              ({tool.category})
                                            </span>
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* RAG Sources */}
                                  {task.rags && task.rags.length > 0 && (
                                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                                      <div className="flex items-center gap-2 mb-2">
                                        <Database className="h-4 w-4 text-purple-600" />
                                        <span className="text-sm font-semibold text-purple-900">
                                          Knowledge Sources ({task.rags.length})
                                        </span>
                                      </div>
                                      <div className="space-y-2">
                                        {task.rags.map((rag) => (
                                          <div
                                            key={rag.id}
                                            className="bg-white rounded px-3 py-2"
                                          >
                                            <div className="flex items-center justify-between">
                                              <p className="text-sm font-medium text-deep-charcoal">
                                                {rag.name}
                                              </p>
                                              <Badge variant="outline" className="text-xs">
                                                {rag.source_type}
                                              </Badge>
                                            </div>
                                            {rag.description && (
                                              <p className="text-xs text-medical-gray mt-1">
                                                {rag.description}
                                              </p>
                                            )}
                                          </div>
                                        ))}
                                      </div>
                                    </div>
                                  )}

                                  {/* Complexity Badge */}
                                  {task.extra?.complexity && (
                                    <div>
                                      <Badge variant="outline" className="text-xs">
                                        Complexity: {task.extra.complexity}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-medical-gray italic">No tasks defined</p>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="visualization" className="space-y-4">
          {workflows.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <WorkflowIcon className="h-12 w-12 text-medical-gray mx-auto mb-4 opacity-50" />
                <p className="text-medical-gray">No workflows to visualize</p>
              </CardContent>
            </Card>
          ) : (
            <WorkflowFlowVisualizer
              workflows={workflows}
              tasksByWorkflow={tasks}
              useCaseTitle={useCase.title}
            />
          )}
        </TabsContent>

        <TabsContent value="deliverables">
          <Card>
            <CardContent className="p-6">
              {useCase.deliverables && useCase.deliverables.length > 0 ? (
                <ul className="space-y-2">
                  {useCase.deliverables.map((deliverable, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-deep-charcoal">{deliverable}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-medical-gray italic">No deliverables defined</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prerequisites">
          <Card>
            <CardContent className="p-6">
              {useCase.prerequisites && useCase.prerequisites.length > 0 ? (
                <ul className="space-y-2">
                  {useCase.prerequisites.map((prerequisite, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <span className="text-deep-charcoal">{prerequisite}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-medical-gray italic">No prerequisites defined</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="metrics">
          <Card>
            <CardContent className="p-6">
              {useCase.success_metrics && Object.keys(useCase.success_metrics).length > 0 ? (
                <div className="space-y-3">
                  {Object.entries(useCase.success_metrics).map(([key, value]) => (
                    <div key={key} className="border-l-2 border-healthcare-accent pl-4">
                      <p className="text-sm font-medium text-deep-charcoal capitalize">
                        {key.replace(/_/g, ' ')}
                      </p>
                      <p className="text-medical-gray">{String(value)}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-medical-gray italic">No success metrics defined</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Users,
  Building2,
  Briefcase,
  Target,
  ArrowLeft,
  Lightbulb,
  Workflow,
  CheckSquare,
  TrendingUp,
  Award,
  AlertCircle,
  Star,
  Clock,
} from 'lucide-react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';

interface PersonaDetails {
  persona: any;
  jtbds: any[];
  workflows: any[];
  tasks: any[];
  stats: {
    jtbd_count: number;
    workflow_count: number;
    task_count: number;
    high_opportunity_jtbds: number;
    avg_jtbd_importance: number;
    avg_jtbd_satisfaction: number;
    pain_points_count: number;
    responsibilities_count: number;
    goals_count: number;
  };
  scoreBreakdown: {
    value_score: number;
    pain_score: number;
    adoption_score: number;
    ease_score: number;
    strategic_score: number;
    network_score: number;
    priority_score: number;
  };
}

const TIER_COLORS = {
  1: 'text-purple-700 bg-purple-100 border-purple-300',
  2: 'text-blue-700 bg-blue-100 border-blue-300',
  3: 'text-green-700 bg-green-100 border-green-300',
  4: 'text-yellow-700 bg-yellow-100 border-yellow-300',
  5: 'text-gray-700 bg-gray-100 border-gray-300',
};

export default function PersonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [data, setData] = useState<PersonaDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    if (params.id) {
      fetchPersonaDetails(params.id as string);
    }
  }, [params.id]);

  const fetchPersonaDetails = async (id: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/personas/${id}`);
      const result = await response.json();

      if (result.success) {
        setData(result.data);
      } else {
        console.error('Error fetching persona:', result.error);
      }
    } catch (error) {
      console.error('Failed to fetch persona details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading persona details...</p>
        </div>
      </div>
    );
  }

  if (!data || !data.persona) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="py-12 text-center">
            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">Persona not found</p>
            <Button onClick={() => router.back()}>Go Back</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const { persona, jtbds, workflows, tasks, stats, scoreBreakdown } = data;
  const tierColor = persona.tier
    ? TIER_COLORS[persona.tier as keyof typeof TIER_COLORS]
    : 'text-gray-700 bg-gray-100 border-gray-300';

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Personas
          </Button>

          {/* Header Card */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold">
                    {persona.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <CardTitle className="text-2xl mb-2">{persona.name}</CardTitle>
                    <CardDescription className="text-base">{persona.title}</CardDescription>
                    <div className="flex flex-wrap gap-2 mt-3">
                      {(persona.persona_code || persona.code) && (
                        <Badge variant="outline" className="font-mono">
                          {persona.persona_code || persona.code}
                        </Badge>
                      )}
                      {persona.tier && (
                        <Badge variant="outline" className={tierColor}>
                          Tier {persona.tier}
                        </Badge>
                      )}
                      <Badge variant="outline" className={persona.source === 'dh_personas' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}>
                        {persona.source === 'dh_personas' ? 'JTBD Library' : 'Organizational'}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {persona.industry && (
                  <div className="flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Industry</p>
                      <p className="font-medium">{persona.industry.industry_name}</p>
                    </div>
                  </div>
                )}
                {persona.primary_role?.department?.function && (
                  <div className="flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Function</p>
                      <p className="font-medium">{persona.primary_role.department.function.org_function}</p>
                    </div>
                  </div>
                )}
                {persona.priority_score && (
                  <div className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-muted-foreground" />
                    <div>
                      <p className="text-xs text-muted-foreground">Priority Score</p>
                      <p className="font-medium">{persona.priority_score.toFixed(1)}/10</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="border-2 border-blue-200 bg-blue-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-blue-800 flex items-center gap-1">
                  <Lightbulb className="h-3 w-3" />
                  Jobs-to-be-Done
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.jtbd_count}</div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats.high_opportunity_jtbds} high-opportunity
                </p>
              </CardContent>
            </Card>

            <Card className="border-2 border-green-200 bg-green-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-green-800 flex items-center gap-1">
                  <Workflow className="h-3 w-3" />
                  Workflows
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.workflow_count}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-purple-200 bg-purple-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-purple-800 flex items-center gap-1">
                  <CheckSquare className="h-3 w-3" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">{stats.task_count}</div>
              </CardContent>
            </Card>

            <Card className="border-2 border-orange-200 bg-orange-50">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-medium text-orange-800 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Engagement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {persona.priority_score ? `${((persona.priority_score / 10) * 100).toFixed(0)}%` : 'N/A'}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="scores">Scores</TabsTrigger>
              <TabsTrigger value="jtbds">JTBDs ({jtbds.length})</TabsTrigger>
              <TabsTrigger value="workflows">Workflows ({workflows.length})</TabsTrigger>
              <TabsTrigger value="tasks">Tasks ({tasks.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4 mt-6">
              {/* Responsibilities */}
              {(() => {
                const responsibilities = Array.isArray(persona.responsibilities)
                  ? persona.responsibilities
                  : [];
                return responsibilities.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <CheckSquare className="w-5 h-5" />
                        Key Responsibilities
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {responsibilities.map((resp: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-blue-500 mt-1">•</span>
                            <span>{resp}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Pain Points */}
              {(() => {
                const painPoints = Array.isArray(persona.pain_points)
                  ? persona.pain_points
                  : [];
                return painPoints.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertCircle className="w-5 h-5 text-red-600" />
                        Pain Points
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {painPoints.map((pain: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-red-500 mt-1">•</span>
                            <span>{pain}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Goals */}
              {(() => {
                const goals = Array.isArray(persona.goals) ? persona.goals : [];
                return goals.length > 0 ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Target className="w-5 h-5 text-green-600" />
                        Goals
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {goals.map((goal: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-2">
                            <span className="text-green-500 mt-1">•</span>
                            <span>{goal}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ) : null;
              })()}

              {/* Show message if no overview data */}
              {(() => {
                const hasResponsibilities = Array.isArray(persona.responsibilities) && persona.responsibilities.length > 0;
                const hasPainPoints = Array.isArray(persona.pain_points) && persona.pain_points.length > 0;
                const hasGoals = Array.isArray(persona.goals) && persona.goals.length > 0;

                return !hasResponsibilities && !hasPainPoints && !hasGoals ? (
                  <Card>
                    <CardContent className="py-12 text-center">
                      <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">No overview information available for this persona</p>
                    </CardContent>
                  </Card>
                ) : null;
              })()}
            </TabsContent>

            <TabsContent value="scores" className="space-y-4 mt-6">
              {/* VPANES Score Breakdown */}
              <Card>
                <CardHeader>
                  <CardTitle>VPANES Score Breakdown</CardTitle>
                  <CardDescription>
                    Detailed scoring analysis across six key dimensions (1-10 scale)
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Value Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-green-600" />
                          <span className="font-medium">Value Score</span>
                        </div>
                        <span className="text-lg font-bold">{scoreBreakdown.value_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-green-600 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.value_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Revenue potential and economic value</p>
                    </div>

                    {/* Pain Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <AlertCircle className="w-4 h-4 text-red-600" />
                          <span className="font-medium">Pain Score</span>
                        </div>
                        <span className="text-lg font-bold">{scoreBreakdown.pain_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-red-600 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.pain_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Problem severity and urgency</p>
                    </div>

                    {/* Adoption Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="font-medium">Adoption Score</span>
                        </div>
                        <span className="text-lg font-bold">{scoreBreakdown.adoption_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.adoption_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">AI readiness and willingness to adopt</p>
                    </div>

                    {/* Ease Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <CheckSquare className="w-4 h-4 text-purple-600" />
                          <span className="font-medium">Ease Score</span>
                        </div>
                        <span className="text-lg font-bold">{scoreBreakdown.ease_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.ease_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Implementation ease and simplicity</p>
                    </div>

                    {/* Strategic Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Target className="w-4 h-4 text-orange-600" />
                          <span className="font-medium">Strategic Score</span>
                        </div>
                        <span className="text-lg font-bold">{scoreBreakdown.strategic_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-orange-600 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.strategic_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Platform importance and strategic fit</p>
                    </div>

                    {/* Network Score */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-cyan-600" />
                          <span className="font-medium">Network Score</span>
                        </div>
                        <span className="text-lg font-bold">{scoreBreakdown.network_score}/10</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-cyan-600 h-2 rounded-full"
                          style={{ width: `${(scoreBreakdown.network_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Influence factor and network effects</p>
                    </div>

                    {/* Priority Score (Weighted Average) */}
                    <div className="pt-4 border-t">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Award className="w-5 h-5 text-yellow-600" />
                          <span className="font-bold text-lg">Overall Priority Score</span>
                        </div>
                        <span className="text-2xl font-bold text-yellow-600">
                          {scoreBreakdown.priority_score.toFixed(1)}/10
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-yellow-500 to-yellow-600 h-3 rounded-full"
                          style={{ width: `${(scoreBreakdown.priority_score / 10) * 100}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-2">
                        Weighted average: Value (25%) + Pain (20%) + Adoption (15%) + Ease (15%) +
                        Strategic (15%) + Network (10%)
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Additional Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">JTBD Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Avg Importance</span>
                      <span className="font-bold">{stats.avg_jtbd_importance.toFixed(1)}/10</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Avg Satisfaction</span>
                      <span className="font-bold">{stats.avg_jtbd_satisfaction.toFixed(1)}/10</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Content Metrics</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Responsibilities</span>
                      <span className="font-bold">{stats.responsibilities_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Pain Points</span>
                      <span className="font-bold">{stats.pain_points_count}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Goals</span>
                      <span className="font-bold">{stats.goals_count}</span>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Engagement</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">High Opp. JTBDs</span>
                      <span className="font-bold">{stats.high_opportunity_jtbds}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">Total JTBDs</span>
                      <span className="font-bold">{stats.jtbd_count}</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="jtbds" className="space-y-4 mt-6">
              {jtbds.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {jtbds.map((item: any) => (
                    <Card key={item.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <CardTitle className="text-lg">{item.jtbd?.title || 'Untitled JTBD'}</CardTitle>
                            <CardDescription className="mt-2">
                              {item.jtbd?.statement || item.jtbd?.goal || item.jtbd?.description}
                            </CardDescription>
                          </div>
                          {item.jtbd?.opportunity_score && (
                            <Badge className={item.jtbd.opportunity_score >= 15 ? 'bg-orange-100 text-orange-800' : ''}>
                              Score: {item.jtbd.opportunity_score}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-3">
                          {item.jtbd?.jtbd_code && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {item.jtbd.jtbd_code}
                            </Badge>
                          )}
                          {item.jtbd?.frequency && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {item.jtbd.frequency}
                            </Badge>
                          )}
                          {item.jtbd?.importance && (
                            <Badge variant="outline" className="text-xs">
                              <Star className="w-3 h-3 mr-1" />
                              Importance: {item.jtbd.importance}/10
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Lightbulb className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No JTBDs mapped to this persona yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="workflows" className="space-y-4 mt-6">
              {workflows.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {workflows.map((workflow: any) => (
                    <Card key={workflow.id} className="hover:shadow-md transition-shadow cursor-pointer">
                      <CardHeader>
                        <CardTitle className="text-base">{workflow.name}</CardTitle>
                        <CardDescription>{workflow.description}</CardDescription>
                        <div className="flex gap-2 mt-2">
                          {workflow.code && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {workflow.code}
                            </Badge>
                          )}
                          {workflow.status && (
                            <Badge variant="outline" className="text-xs">
                              {workflow.status}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Workflow className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No workflows associated with this persona yet</p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4 mt-6">
              {tasks.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {tasks.map((task: any) => (
                    <Card key={task.id} className="hover:shadow-md transition-shadow">
                      <CardHeader>
                        <CardTitle className="text-base">{task.name}</CardTitle>
                        <CardDescription>{task.description}</CardDescription>
                        <div className="flex gap-2 mt-2">
                          {task.code && (
                            <Badge variant="outline" className="text-xs font-mono">
                              {task.code}
                            </Badge>
                          )}
                          {task.task_type && (
                            <Badge variant="outline" className="text-xs">
                              {task.task_type}
                            </Badge>
                          )}
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card>
                  <CardContent className="py-12 text-center">
                    <CheckSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600">No tasks associated with this persona yet</p>
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

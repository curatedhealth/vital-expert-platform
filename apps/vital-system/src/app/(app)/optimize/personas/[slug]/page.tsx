'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  UserCircle, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp,
  AlertCircle,
  Zap,
  Heart,
  Brain,
  Globe,
  Link2,
  Sparkles,
  Shield,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Persona } from '@/components/personas/types';

export default function PersonaDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;

  const [persona, setPersona] = useState<Persona | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (slug) {
      loadPersona();
    }
  }, [slug]);

  const loadPersona = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/personas/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          // Fallback: try fetching full list and matching locally in case slug variants exist
          const listResponse = await fetch('/api/personas?limit=5000');
          if (listResponse.ok) {
            const listData = await listResponse.json();
            const all = listData.personas || [];
            const match = all.find((p: any) => 
              p.slug === slug ||
              p.slug?.toLowerCase() === slug.toLowerCase() ||
              p.unique_id === slug ||
              p.unique_id?.toLowerCase() === slug.toLowerCase() ||
              p.persona_name === slug ||
              p.persona_name?.toLowerCase() === slug.toLowerCase()
            );
            if (match) {
              setPersona(match);
              return;
            }
          }
          throw new Error('Persona not found');
        }
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to fetch persona: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setPersona(data.persona);
    } catch (err) {
      console.error('Error loading persona:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to load persona. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={UserCircle}
          title="Loading Persona..."
          description="Fetching persona details..."
        />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Card>
              <CardContent className="py-12 text-center">
                <div className="flex flex-col items-center gap-4">
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-neutral-300 border-t-blue-600"></div>
                  <p className="text-neutral-500">Loading persona details...</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={UserCircle}
          title="Error"
          description="Failed to load persona"
        />
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-7xl mx-auto p-6">
            <Card className="border-red-200 bg-red-50">
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-red-800">
                    <span className="font-semibold">Error:</span>
                    <span>{error}</span>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" onClick={() => loadPersona()}>
                      Retry
                    </Button>
                    <Button variant="outline" onClick={() => router.push('/personas')}>
                      Back to Personas
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (!persona) {
    return null;
  }

  // Calculate data points
  const responsibilitiesCount = (persona as any).key_responsibilities?.length || 0;
  const painPointsCount = (persona as any).pain_points?.length || 0;
  const jtbdsCount = (persona as any).jtbds?.length || persona.jtbds_count || 0;
  const goalsCount = persona.goals?.length || persona.goals_count || 0;
  const challengesCount = persona.challenges?.length || persona.challenges_count || 0;
  
  // Extract related data
  const painPoints = (persona as any).pain_points || [];
  const goals = (persona as any).goals || [];
  const challenges = (persona as any).challenges || [];
  const jtbds = (persona as any).jtbds || [];
  const motivations = (persona as any).motivations || [];
  const values = (persona as any).values || [];
  const personalityTraits = (persona as any).personality_traits || [];
  const internalStakeholders = (persona as any).internal_stakeholders || [];
  const externalStakeholders = (persona as any).external_stakeholders || [];

  const archetype = (persona as any).archetype || (persona as any).derived_archetype;
  const personaType = (persona as any).persona_type;
  const budgetAuthority = (persona as any).budget_authority;
  const decisionStyle = (persona as any).decision_making_style;
  const riskTolerance = (persona as any).risk_tolerance;
  const geoScope = (persona as any).geographic_scope;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-gradient-to-b from-gray-50 to-white">
      {/* Page Header */}
      <PageHeader
        icon={UserCircle}
        title={persona.name}
        description={persona.title || persona.tagline || 'Persona Details'}
        actions={
          <Button variant="outline" onClick={() => router.push('/personas')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Personas
          </Button>
        }
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          {/* Summary + Tabs */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sticky Summary */}
            <div className="lg:col-span-1">
              <Card className="border border-neutral-200 shadow-sm sticky top-4">
                <CardContent className="p-6 space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-14 w-14 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold shadow-md">
                      {persona.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h1 className="text-xl font-bold text-neutral-900 leading-tight">{persona.name}</h1>
                      {persona.title && <p className="text-sm text-neutral-700">{persona.title}</p>}
                      {(persona.tagline || persona.one_liner) && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1">
                          {persona.tagline || persona.one_liner}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {archetype && (
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                        {archetype}
                      </Badge>
                    )}
                    {personaType && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                        {personaType}
                      </Badge>
                    )}
                    {persona.seniority_level && (
                      <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs">
                        {persona.seniority_level}
                      </Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-blue-50 border border-blue-100 p-3">
                      <div className="text-xs text-blue-600 flex items-center gap-1"><Target className="h-4 w-4" /> JTBDs</div>
                      <div className="text-2xl font-bold text-blue-700">{jtbdsCount}</div>
                    </div>
                    <div className="rounded-lg bg-red-50 border border-red-100 p-3">
                      <div className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="h-4 w-4" /> Pain</div>
                      <div className="text-2xl font-bold text-red-700">{painPointsCount}</div>
                    </div>
                    <div className="rounded-lg bg-green-50 border border-green-100 p-3">
                      <div className="text-xs text-green-600 flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Goals</div>
                      <div className="text-2xl font-bold text-green-700">{goalsCount}</div>
                    </div>
                    <div className="rounded-lg bg-orange-50 border border-orange-100 p-3">
                      <div className="text-xs text-orange-600 flex items-center gap-1"><Zap className="h-4 w-4" /> Challenges</div>
                      <div className="text-2xl font-bold text-orange-700">{challengesCount}</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {(budgetAuthority || decisionStyle || riskTolerance || geoScope) && (
                      <div>
                        <p className="text-xs font-semibold text-neutral-600 mb-1">Decision & Influence</p>
                        <div className="space-y-1 text-sm text-neutral-700">
                          {budgetAuthority && <div className="flex items-center gap-2"><DollarSign className="h-4 w-4 text-emerald-500" /> {budgetAuthority}</div>}
                          {decisionStyle && <div className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-500" /> {decisionStyle}</div>}
                          {riskTolerance && <div className="flex items-center gap-2"><Shield className="h-4 w-4 text-indigo-500" /> {riskTolerance}</div>}
                          {geoScope && <div className="flex items-center gap-2"><Globe className="h-4 w-4 text-purple-500" /> {geoScope}</div>}
                        </div>
                      </div>
                    )}
                    {(persona.department_slug || persona.function_slug || persona.role_slug) && (
                      <div className="space-y-1">
                        <p className="text-xs font-semibold text-neutral-600">Org placement</p>
                        <div className="flex flex-wrap gap-2">
                          {persona.function_slug && <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">{persona.function_slug}</Badge>}
                          {persona.department_slug && <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">{persona.department_slug}</Badge>}
                          {persona.role_slug && <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">{persona.role_slug}</Badge>}
                        </div>
                      </div>
                    )}
                    {(persona as any).key_responsibilities && (persona as any).key_responsibilities.length > 0 && (
                      <div className="space-y-2">
                        <p className="text-xs font-semibold text-neutral-600">Top responsibilities</p>
                        <ul className="space-y-1">
                          {(persona as any).key_responsibilities.slice(0, 3).map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-neutral-700 flex gap-2">
                              <span className="h-1.5 w-1.5 rounded-full bg-blue-500 mt-2" />
                              <span className="leading-snug">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Main Tabs */}
            <div className="lg:col-span-2 space-y-4">
              <Tabs defaultValue="jobs">
                <TabsList className="mb-4">
                  <TabsTrigger value="jobs">Jobs to be Done</TabsTrigger>
                  <TabsTrigger value="pain">Pain & Challenges</TabsTrigger>
                  <TabsTrigger value="goals">Goals & Motivation</TabsTrigger>
                  <TabsTrigger value="stakeholders">Stakeholders</TabsTrigger>
                </TabsList>

                <TabsContent value="jobs">
                  <Card className="border-0 shadow-md">
                    <CardContent className="p-6 space-y-4">
                      <div className="flex items-center gap-3">
                        <Target className="h-5 w-5 text-blue-600" />
                        <div>
                          <h2 className="text-lg font-bold text-neutral-900">Jobs to be Done</h2>
                          <p className="text-sm text-neutral-500">Primary and supporting jobs linked to this persona</p>
                        </div>
                      </div>
                      {jtbds.length === 0 && <p className="text-sm text-neutral-500">No JTBDs mapped yet.</p>}
                      <div className="space-y-3">
                        {jtbds.map((jtbd: any, index: number) => (
                          <div key={jtbd.id || index} className="p-4 rounded-lg border border-blue-100 bg-blue-50">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <p className="font-semibold text-neutral-900">
                                  {jtbd.jobs_to_be_done?.name || `JTBD #${index + 1}`}
                                </p>
                                {jtbd.jobs_to_be_done?.code && (
                                  <p className="text-xs text-neutral-500">Code: {jtbd.jobs_to_be_done.code}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                {jtbd.is_primary && (
                                  <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                    Primary
                                  </Badge>
                                )}
                                {jtbd.relevance_score && (
                                  <Badge variant="outline" className="text-xs">
                                    Relevance {(jtbd.relevance_score * 100).toFixed(0)}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            {jtbd.jobs_to_be_done?.description && (
                              <p className="text-sm text-neutral-700 mt-1">{jtbd.jobs_to_be_done.description}</p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="pain">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <AlertCircle className="h-5 w-5 text-red-600" />
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">Pain Points</h3>
                            <p className="text-sm text-neutral-500">Frictions this persona feels</p>
                          </div>
                        </div>
                        {painPoints.length === 0 && <p className="text-sm text-neutral-500">No pain points captured.</p>}
                        <div className="space-y-3">
                          {painPoints.map((point: any, idx: number) => (
                            <div key={point.id || idx} className="rounded-lg border border-red-100 bg-red-50 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-neutral-900">{point.pain_point_text || point.pain_description}</p>
                                {point.severity && (
                                  <Badge variant="outline" className="text-xs">
                                    {point.severity}
                                  </Badge>
                                )}
                              </div>
                              {point.pain_category && (
                                <p className="text-xs text-neutral-500 mt-1">Category: {point.pain_category}</p>
                              )}
                              {point.pain_description && point.pain_description !== point.pain_point_text && (
                                <p className="text-xs text-neutral-600 mt-1">{point.pain_description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <Zap className="h-5 w-5 text-orange-600" />
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">Challenges</h3>
                            <p className="text-sm text-neutral-500">Operational blockers</p>
                          </div>
                        </div>
                        {challenges.length === 0 && <p className="text-sm text-neutral-500">No challenges captured.</p>}
                        <div className="space-y-3">
                          {challenges.map((challenge: any, idx: number) => (
                            <div key={challenge.id || idx} className="rounded-lg border border-orange-100 bg-orange-50 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-neutral-900">{challenge.challenge_text || challenge.challenge_description}</p>
                                {challenge.impact_level && (
                                  <Badge variant="outline" className="text-xs">
                                    {challenge.impact_level}
                                  </Badge>
                                )}
                              </div>
                              {challenge.challenge_type && (
                                <p className="text-xs text-neutral-500 mt-1">Type: {challenge.challenge_type}</p>
                              )}
                              {challenge.challenge_description && challenge.challenge_description !== challenge.challenge_text && (
                                <p className="text-xs text-neutral-600 mt-1">{challenge.challenge_description}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>

                <TabsContent value="goals">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <TrendingUp className="h-5 w-5 text-green-600" />
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">Goals</h3>
                            <p className="text-sm text-neutral-500">Desired outcomes and priorities</p>
                          </div>
                        </div>
                        {goals.length === 0 && <p className="text-sm text-neutral-500">No goals captured.</p>}
                        <div className="space-y-3">
                          {goals.map((goal: any, idx: number) => (
                            <div key={goal.id || idx} className="rounded-lg border border-green-100 bg-green-50 p-3">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-sm font-semibold text-neutral-900">{goal.goal_text}</p>
                                {goal.goal_type && (
                                  <Badge variant="outline" className="text-xs">
                                    {goal.goal_type}
                                  </Badge>
                                )}
                              </div>
                              {goal.goal_category && (
                                <p className="text-xs text-neutral-500 mt-1">Category: {goal.goal_category}</p>
                              )}
                              {goal.priority && (
                                <p className="text-xs text-neutral-500">Priority: {goal.priority}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <div className="space-y-4">
                      {motivations.length > 0 && (
                        <Card className="border-0 shadow-md">
                          <CardContent className="p-6 space-y-3">
                            <div className="flex items-center gap-3">
                              <Sparkles className="h-5 w-5 text-purple-600" />
                              <h3 className="text-lg font-bold text-neutral-900">Motivations</h3>
                            </div>
                            <div className="space-y-2">
                              {motivations.map((motivation: any, idx: number) => (
                                <div key={motivation.id || idx} className="rounded-lg bg-purple-50 border border-purple-100 p-3">
                                  <p className="text-sm font-semibold text-neutral-900">{motivation.motivation_text}</p>
                                  {motivation.motivation_category && (
                                    <p className="text-xs text-neutral-500">Category: {motivation.motivation_category}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {values.length > 0 && (
                        <Card className="border-0 shadow-md">
                          <CardContent className="p-6 space-y-3">
                            <div className="flex items-center gap-3">
                              <Heart className="h-5 w-5 text-pink-600" />
                              <h3 className="text-lg font-bold text-neutral-900">Values</h3>
                            </div>
                            <div className="space-y-2">
                              {values.map((value: any, idx: number) => (
                                <div key={value.id || idx} className="rounded-lg bg-pink-50 border border-pink-100 p-3">
                                  <p className="text-sm font-semibold text-neutral-900">{value.value_name}</p>
                                  {value.value_description && (
                                    <p className="text-xs text-neutral-600">{value.value_description}</p>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}

                      {personalityTraits.length > 0 && (
                        <Card className="border-0 shadow-md">
                          <CardContent className="p-6 space-y-3">
                            <div className="flex items-center gap-3">
                              <Brain className="h-5 w-5 text-indigo-600" />
                              <h3 className="text-lg font-bold text-neutral-900">Personality</h3>
                            </div>
                            <div className="space-y-2">
                              {personalityTraits.map((trait: any, idx: number) => (
                                <div key={trait.id || idx} className="rounded-lg bg-indigo-50 border border-indigo-100 p-3 flex items-center justify-between">
                                  <div>
                                    <p className="text-sm font-semibold text-neutral-900">{trait.trait_name}</p>
                                    {trait.trait_description && (
                                      <p className="text-xs text-neutral-600">{trait.trait_description}</p>
                                    )}
                                  </div>
                                  {trait.strength && (
                                    <Badge variant="outline" className="text-xs bg-indigo-100 text-indigo-700 border-indigo-200">
                                      {trait.strength}
                                    </Badge>
                                  )}
                                </div>
                              ))}
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="stakeholders">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <Users className="h-5 w-5 text-blue-600" />
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">Internal Stakeholders</h3>
                            <p className="text-sm text-neutral-500">Influencers and collaborators</p>
                          </div>
                        </div>
                        {internalStakeholders.length === 0 && <p className="text-sm text-neutral-500">No internal stakeholders captured.</p>}
                        <div className="space-y-3">
                          {internalStakeholders.map((stakeholder: any, index: number) => {
                            const relatedPersona = stakeholder.personas;
                            return (
                              <div key={stakeholder.id || index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1">
                                    <p className="text-sm font-semibold text-neutral-900 mb-1">
                                      {stakeholder.stakeholder_name || stakeholder.stakeholder_role}
                                    </p>
                                    {stakeholder.stakeholder_role && (
                                      <p className="text-xs text-neutral-500 mb-1">Role: {stakeholder.stakeholder_role}</p>
                                    )}
                                    {stakeholder.relationship_type && (
                                      <p className="text-xs text-neutral-500 mb-1">Relationship: {stakeholder.relationship_type}</p>
                                    )}
                                    {stakeholder.influence_level && (
                                      <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-200 text-xs">
                                        Influence: {stakeholder.influence_level}
                                      </Badge>
                                    )}
                                  </div>
                                  {relatedPersona && relatedPersona.slug && (
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => router.push(`/personas/${relatedPersona.slug}`)}
                                      className="ml-2"
                                    >
                                      <Link2 className="h-4 w-4 mr-1" />
                                      View
                                    </Button>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>

                    <Card className="border-0 shadow-md">
                      <CardContent className="p-6 space-y-3">
                        <div className="flex items-center gap-3">
                          <Shield className="h-5 w-5 text-green-600" />
                          <div>
                            <h3 className="text-lg font-bold text-neutral-900">External Stakeholders</h3>
                            <p className="text-sm text-neutral-500">Outside relationships</p>
                          </div>
                        </div>
                        {externalStakeholders.length === 0 && <p className="text-sm text-neutral-500">No external stakeholders captured.</p>}
                        <div className="space-y-3">
                          {externalStakeholders.map((stakeholder: any, index: number) => (
                            <div key={stakeholder.id || index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                              <p className="text-sm font-semibold text-neutral-900 mb-1">
                                {stakeholder.stakeholder_name}
                              </p>
                              {stakeholder.stakeholder_type && (
                                <p className="text-xs text-neutral-500 mb-1">Type: {stakeholder.stakeholder_type}</p>
                              )}
                              {stakeholder.relationship_importance && (
                                <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                                  {stakeholder.relationship_importance}
                                </Badge>
                              )}
                              {stakeholder.interaction_mode && (
                                <p className="text-xs text-neutral-500 mt-1">Interaction: {stakeholder.interaction_mode}</p>
                              )}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

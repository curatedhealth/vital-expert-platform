'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  UserCircle, 
  Building2, 
  Briefcase, 
  MapPin, 
  DollarSign, 
  Clock, 
  Users, 
  Award, 
  Target, 
  TrendingUp,
  AlertCircle,
  GraduationCap,
  BarChart3,
  Zap,
  Heart,
  Brain,
  Globe,
  Calendar,
  Link2,
  Sparkles,
  Shield,
} from 'lucide-react';
import { PageHeader } from '@/components/page-header';
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
                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600"></div>
                  <p className="text-gray-500">Loading persona details...</p>
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
  const responsibilitiesCount = persona.key_responsibilities?.length || 0;
  const painPointsCount = (persona as any).pain_points?.length || persona.pain_points_count || 0;
  const jtbdsCount = (persona as any).jtbds?.length || persona.jtbds_count || 0;
  const goalsCount = (persona as any).goals?.length || persona.goals_count || 0;
  const challengesCount = (persona as any).challenges?.length || persona.challenges_count || 0;
  
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
          {/* Hero Section - Large Visual Header */}
          <div className="relative bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
            <div className="relative p-8">
              <div className="flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {persona.name.charAt(0)}
                    </div>
                    <div>
                      <h1 className="text-4xl font-bold text-gray-900 mb-2">{persona.name}</h1>
                      {persona.title && (
                        <p className="text-xl font-semibold text-gray-700">{persona.title}</p>
                      )}
                    </div>
                  </div>
                  
                  {persona.tagline && (
                    <p className="text-lg italic text-gray-600 mb-3 max-w-3xl">{persona.tagline}</p>
                  )}
                  {persona.one_liner && (
                    <p className="text-base text-gray-700 max-w-3xl leading-relaxed">{persona.one_liner}</p>
                  )}

                  {/* Quick Stats Bar */}
                  <div className="flex flex-wrap items-center gap-6 mt-6 pt-6 border-t border-gray-200">
                    {persona.seniority_level && (
                      <div className="flex items-center gap-2">
                        <Award className="h-5 w-5 text-orange-500" />
                        <span className="font-semibold text-gray-900">{persona.seniority_level}</span>
                      </div>
                    )}
                    {persona.years_of_experience && (
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-blue-500" />
                        <span className="font-semibold text-gray-900">{persona.years_of_experience} years</span>
                        <span className="text-gray-500 text-sm">experience</span>
                      </div>
                    )}
                    {persona.team_size_typical && (
                      <div className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        <span className="font-semibold text-gray-900">{persona.team_size_typical}</span>
                        <span className="text-gray-500 text-sm">team members</span>
                      </div>
                    )}
                    {persona.geographic_scope && (
                      <div className="flex items-center gap-2">
                        <Globe className="h-5 w-5 text-purple-500" />
                        <span className="font-semibold text-gray-900">{persona.geographic_scope}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex flex-col gap-2">
                  {persona.archetype && (
                    <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 text-sm px-3 py-1">
                      {persona.archetype}
                    </Badge>
                  )}
                  {persona.persona_type && (
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-sm px-3 py-1">
                      {persona.persona_type}
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Data Points Overview - Visual Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {painPointsCount > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
                <AlertCircle className="h-6 w-6 text-red-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-red-700">{painPointsCount}</div>
                <div className="text-xs text-red-600 font-medium">Pain Points</div>
              </div>
            )}
            {jtbdsCount > 0 && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center">
                <Target className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-700">{jtbdsCount}</div>
                <div className="text-xs text-blue-600 font-medium">JTBDs</div>
              </div>
            )}
            {goalsCount > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <TrendingUp className="h-6 w-6 text-green-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-700">{goalsCount}</div>
                <div className="text-xs text-green-600 font-medium">Goals</div>
              </div>
            )}
            {challengesCount > 0 && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 text-center">
                <Zap className="h-6 w-6 text-orange-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-orange-700">{challengesCount}</div>
                <div className="text-xs text-orange-600 font-medium">Challenges</div>
              </div>
            )}
            {responsibilitiesCount > 0 && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 text-center">
                <Briefcase className="h-6 w-6 text-purple-600 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-700">{responsibilitiesCount}</div>
                <div className="text-xs text-purple-600 font-medium">Responsibilities</div>
              </div>
            )}
          </div>

          {/* Main Content - Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Key Responsibilities */}
              {persona.key_responsibilities && persona.key_responsibilities.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Briefcase className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">Key Responsibilities</h2>
                    </div>
                    <ul className="space-y-3">
                      {persona.key_responsibilities.map((responsibility, index) => (
                        <li key={index} className="flex items-start gap-3">
                          <div className="h-2 w-2 rounded-full bg-blue-600 mt-2 flex-shrink-0"></div>
                          <span className="text-gray-700 leading-relaxed">{responsibility}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Organizational Context */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Building2 className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Organizational Context</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    {persona.organization_type && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Organization Type</p>
                        <p className="text-base font-semibold text-gray-900">{persona.organization_type}</p>
                      </div>
                    )}
                    {persona.typical_organization_size && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Organization Size</p>
                        <p className="text-base font-semibold text-gray-900">{persona.typical_organization_size}</p>
                      </div>
                    )}
                    {persona.department_slug && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Department</p>
                        <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                          {persona.department_slug}
                        </Badge>
                      </div>
                    )}
                    {persona.function_slug && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Function</p>
                        <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                          {persona.function_slug}
                        </Badge>
                      </div>
                    )}
                    {persona.role_slug && (
                      <div>
                        <p className="text-sm font-medium text-gray-500 mb-1">Role</p>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {persona.role_slug}
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Experience & Work Style */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <BarChart3 className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Experience & Work Style</h2>
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Experience</h3>
                      {persona.years_in_function && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Years in Function</p>
                          <p className="text-lg font-semibold text-gray-900">{persona.years_in_function} years</p>
                        </div>
                      )}
                      {persona.years_in_industry && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Years in Industry</p>
                          <p className="text-lg font-semibold text-gray-900">{persona.years_in_industry} years</p>
                        </div>
                      )}
                      {persona.years_in_current_role && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Years in Current Role</p>
                          <p className="text-lg font-semibold text-gray-900">{persona.years_in_current_role} years</p>
                        </div>
                      )}
                      {persona.education_level && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Education</p>
                          <div className="flex items-center gap-2">
                            <GraduationCap className="h-4 w-4 text-gray-400" />
                            <p className="text-lg font-semibold text-gray-900">{persona.education_level}</p>
                          </div>
                        </div>
                      )}
                    </div>
                    <div className="space-y-4">
                      <h3 className="font-semibold text-gray-700 text-sm uppercase tracking-wide">Work Style</h3>
                      {persona.work_style && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Work Style</p>
                          <p className="text-base font-semibold text-gray-900">{persona.work_style}</p>
                        </div>
                      )}
                      {persona.work_style_preference && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Preference</p>
                          <p className="text-base font-semibold text-gray-900">{persona.work_style_preference}</p>
                        </div>
                      )}
                      {persona.work_arrangement && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Arrangement</p>
                          <p className="text-base font-semibold text-gray-900">{persona.work_arrangement}</p>
                        </div>
                      )}
                      {persona.learning_style && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Learning Style</p>
                          <p className="text-base font-semibold text-gray-900">{persona.learning_style}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              {/* Decision Making & Risk */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-5 w-5 text-orange-600" />
                    <h2 className="text-lg font-bold text-gray-900">Decision Making</h2>
                  </div>
                  <div className="space-y-3">
                    {persona.decision_making_style && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Style</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.decision_making_style}</p>
                      </div>
                    )}
                    {persona.risk_tolerance && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Risk Tolerance</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.risk_tolerance}</p>
                      </div>
                    )}
                    {persona.technology_adoption && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Tech Adoption</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.technology_adoption}</p>
                      </div>
                    )}
                    {persona.budget_authority && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Budget Authority</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.budget_authority}</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Team & Location */}
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Users className="h-5 w-5 text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">Team & Location</h2>
                  </div>
                  <div className="space-y-3">
                    {persona.team_size && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Team Size</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.team_size}</p>
                      </div>
                    )}
                    {persona.direct_reports !== undefined && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Direct Reports</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.direct_reports}</p>
                      </div>
                    )}
                    {persona.reporting_to && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Reports To</p>
                        <p className="text-sm font-semibold text-gray-900">{persona.reporting_to}</p>
                      </div>
                    )}
                    {persona.location_type && (
                      <div>
                        <p className="text-xs text-gray-500 mb-1">Location</p>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-4 w-4 text-gray-400" />
                          <p className="text-sm font-semibold text-gray-900">{persona.location_type}</p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>

              {/* Compensation */}
              {(persona.salary_min_usd || persona.salary_median_usd || persona.salary_max_usd) && (
                <Card className="border-0 shadow-md bg-gradient-to-br from-green-50 to-emerald-50">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <h2 className="text-lg font-bold text-gray-900">Compensation</h2>
                    </div>
                    <div className="space-y-2">
                      {persona.salary_median_usd && (
                        <div>
                          <p className="text-xs text-gray-500 mb-1">Median Salary</p>
                          <p className="text-2xl font-bold text-green-700">${persona.salary_median_usd.toLocaleString()}</p>
                        </div>
                      )}
                      {(persona.salary_min_usd || persona.salary_max_usd) && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          {persona.salary_min_usd && <span>${persona.salary_min_usd.toLocaleString()}</span>}
                          {persona.salary_min_usd && persona.salary_max_usd && <span>—</span>}
                          {persona.salary_max_usd && <span>${persona.salary_max_usd.toLocaleString()}</span>}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {persona.tags && persona.tags.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-4">Tags</h2>
                    <div className="flex flex-wrap gap-2">
                      {persona.tags.map((tag, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Pain Points, Goals, Challenges Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Pain Points */}
            {painPoints.length > 0 && (
              <Card className="border-0 shadow-md border-l-4 border-l-red-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <AlertCircle className="h-6 w-6 text-red-600" />
                    <h2 className="text-xl font-bold text-gray-900">Pain Points</h2>
                  </div>
                  <div className="space-y-4">
                    {painPoints.map((point: any, index: number) => (
                      <div key={point.id || index} className="border-l-2 border-red-200 pl-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{point.pain_point_text || point.pain_description}</p>
                          {point.severity && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                point.severity === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                                point.severity === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                'bg-yellow-100 text-yellow-800 border-yellow-300'
                              }`}
                            >
                              {point.severity}
                            </Badge>
                          )}
                        </div>
                        {point.pain_category && (
                          <p className="text-xs text-gray-500 mb-1">Category: {point.pain_category}</p>
                        )}
                        {point.pain_description && point.pain_description !== point.pain_point_text && (
                          <p className="text-sm text-gray-600">{point.pain_description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Goals */}
            {goals.length > 0 && (
              <Card className="border-0 shadow-md border-l-4 border-l-green-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                    <h2 className="text-xl font-bold text-gray-900">Goals</h2>
                  </div>
                  <div className="space-y-4">
                    {goals.map((goal: any, index: number) => (
                      <div key={goal.id || index} className="border-l-2 border-green-200 pl-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{goal.goal_text}</p>
                          {goal.goal_type && (
                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 text-xs">
                              {goal.goal_type}
                            </Badge>
                          )}
                        </div>
                        {goal.goal_category && (
                          <p className="text-xs text-gray-500 mb-1">Category: {goal.goal_category}</p>
                        )}
                        {goal.priority && (
                          <p className="text-xs text-gray-500">Priority: {goal.priority}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Challenges */}
            {challenges.length > 0 && (
              <Card className="border-0 shadow-md border-l-4 border-l-orange-500">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Zap className="h-6 w-6 text-orange-600" />
                    <h2 className="text-xl font-bold text-gray-900">Challenges</h2>
                  </div>
                  <div className="space-y-4">
                    {challenges.map((challenge: any, index: number) => (
                      <div key={challenge.id || index} className="border-l-2 border-orange-200 pl-3">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <p className="text-sm font-semibold text-gray-900">{challenge.challenge_text || challenge.challenge_description}</p>
                          {challenge.impact_level && (
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                challenge.impact_level === 'critical' ? 'bg-red-100 text-red-800 border-red-300' :
                                challenge.impact_level === 'high' ? 'bg-orange-100 text-orange-800 border-orange-300' :
                                'bg-yellow-100 text-yellow-800 border-yellow-300'
                              }`}
                            >
                              {challenge.impact_level}
                            </Badge>
                          )}
                        </div>
                        {challenge.challenge_type && (
                          <p className="text-xs text-gray-500 mb-1">Type: {challenge.challenge_type}</p>
                        )}
                        {challenge.challenge_description && challenge.challenge_description !== challenge.challenge_text && (
                          <p className="text-sm text-gray-600">{challenge.challenge_description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* JTBDs, Motivations, Values, Personality Traits */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Jobs To Be Done */}
            {jtbds.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Target className="h-6 w-6 text-blue-600" />
                    <h2 className="text-xl font-bold text-gray-900">Jobs To Be Done</h2>
                  </div>
                  <div className="space-y-3">
                    {jtbds.map((jtbd: any, index: number) => (
                      <div key={jtbd.id || index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                        {jtbd.jobs_to_be_done ? (
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <p className="font-semibold text-gray-900">{jtbd.jobs_to_be_done.name}</p>
                              {jtbd.is_primary && (
                                <Badge variant="outline" className="bg-blue-100 text-blue-700 border-blue-300 text-xs">
                                  Primary
                                </Badge>
                              )}
                            </div>
                            {jtbd.jobs_to_be_done.code && (
                              <p className="text-xs text-gray-500 mb-1">Code: {jtbd.jobs_to_be_done.code}</p>
                            )}
                            {jtbd.jobs_to_be_done.description && (
                              <p className="text-sm text-gray-600">{jtbd.jobs_to_be_done.description}</p>
                            )}
                            {jtbd.relevance_score && (
                              <p className="text-xs text-gray-500 mt-1">Relevance: {(jtbd.relevance_score * 100).toFixed(0)}%</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm font-semibold text-gray-900">JTBD #{index + 1}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Motivations */}
            {motivations.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Sparkles className="h-6 w-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-900">Motivations</h2>
                  </div>
                  <div className="space-y-3">
                    {motivations.map((motivation: any, index: number) => (
                      <div key={motivation.id || index} className="p-3 bg-purple-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{motivation.motivation_text}</p>
                        {motivation.motivation_category && (
                          <p className="text-xs text-gray-500">Category: {motivation.motivation_category}</p>
                        )}
                        {motivation.importance && (
                          <p className="text-xs text-gray-500">Importance: {motivation.importance}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Values */}
            {values.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Heart className="h-6 w-6 text-pink-600" />
                    <h2 className="text-xl font-bold text-gray-900">Core Values</h2>
                  </div>
                  <div className="space-y-3">
                    {values.map((value: any, index: number) => (
                      <div key={value.id || index} className="p-3 bg-pink-50 rounded-lg">
                        <p className="text-sm font-semibold text-gray-900 mb-1">{value.value_name}</p>
                        {value.value_description && (
                          <p className="text-sm text-gray-600">{value.value_description}</p>
                        )}
                        {value.rank_order && (
                          <p className="text-xs text-gray-500 mt-1">Rank: #{value.rank_order}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Personality Traits */}
            {personalityTraits.length > 0 && (
              <Card className="border-0 shadow-md">
                <CardContent className="p-6">
                  <div className="flex items-center gap-3 mb-4">
                    <Brain className="h-6 w-6 text-indigo-600" />
                    <h2 className="text-xl font-bold text-gray-900">Personality Traits</h2>
                  </div>
                  <div className="space-y-3">
                    {personalityTraits.map((trait: any, index: number) => (
                      <div key={trait.id || index} className="p-3 bg-indigo-50 rounded-lg">
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-sm font-semibold text-gray-900">{trait.trait_name}</p>
                          {trait.strength && (
                            <Badge variant="outline" className="bg-indigo-100 text-indigo-700 border-indigo-200 text-xs">
                              {trait.strength}
                            </Badge>
                          )}
                        </div>
                        {trait.trait_description && (
                          <p className="text-sm text-gray-600">{trait.trait_description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Stakeholders Section */}
          {(internalStakeholders.length > 0 || externalStakeholders.length > 0) && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Internal Stakeholders */}
              {internalStakeholders.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Users className="h-6 w-6 text-blue-600" />
                      <h2 className="text-xl font-bold text-gray-900">Internal Stakeholders</h2>
                    </div>
                    <div className="space-y-3">
                      {internalStakeholders.map((stakeholder: any, index: number) => {
                        const relatedPersona = stakeholder.personas;
                        return (
                          <div key={stakeholder.id || index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                            <div className="flex items-start justify-between">
                              <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900 mb-1">
                                  {stakeholder.stakeholder_name || stakeholder.stakeholder_role}
                                </p>
                                {stakeholder.stakeholder_role && (
                                  <p className="text-xs text-gray-500 mb-1">Role: {stakeholder.stakeholder_role}</p>
                                )}
                                {stakeholder.relationship_type && (
                                  <p className="text-xs text-gray-500 mb-1">Relationship: {stakeholder.relationship_type}</p>
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
              )}

              {/* External Stakeholders */}
              {externalStakeholders.length > 0 && (
                <Card className="border-0 shadow-md">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-3 mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                      <h2 className="text-xl font-bold text-gray-900">External Stakeholders</h2>
                    </div>
                    <div className="space-y-3">
                      {externalStakeholders.map((stakeholder: any, index: number) => (
                        <div key={stakeholder.id || index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm font-semibold text-gray-900 mb-1">
                            {stakeholder.stakeholder_name}
                          </p>
                          {stakeholder.stakeholder_type && (
                            <p className="text-xs text-gray-500 mb-1">Type: {stakeholder.stakeholder_type}</p>
                          )}
                          {stakeholder.relationship_importance && (
                            <Badge variant="outline" className="bg-green-100 text-green-700 border-green-200 text-xs">
                              {stakeholder.relationship_importance}
                            </Badge>
                          )}
                          {stakeholder.interaction_mode && (
                            <p className="text-xs text-gray-500 mt-1">Interaction: {stakeholder.interaction_mode}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

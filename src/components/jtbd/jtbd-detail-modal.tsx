'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  X,
  Play,
  Clock,
  DollarSign,
  Users,
  Brain,
  Database,
  Settings,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Info,
  Star,
  Target,
  Workflow,
  BarChart
} from 'lucide-react';
import type { DetailedJTBD } from '@/lib/jtbd/jtbd-service';

interface JTBDDetailModalProps {
  jtbdId: string;
  isOpen: boolean;
  onClose: () => void;
  onExecute?: (jtbd: DetailedJTBD) => void;
}

export const JTBDDetailModal: React.FC<JTBDDetailModalProps> = ({
  jtbdId,
  isOpen,
  onClose,
  onExecute
}) => {
  const [jtbd, setJtbd] = useState<DetailedJTBD | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && jtbdId) {
      fetchJTBDDetails();
    }
  }, [isOpen, jtbdId]);

  const fetchJTBDDetails = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/jtbd/${jtbdId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch JTBD details: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.success) {
        setJtbd(data.data);
      } else {
        throw new Error(data.error || 'Failed to fetch JTBD details');
      }
    } catch (err) {
      console.error('Error fetching JTBD details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch JTBD details');
    } finally {
      setLoading(false);
    }
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Low': return 'bg-green-100 text-green-800';
      case 'Medium': return 'bg-yellow-100 text-yellow-800';
      case 'High': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getFunctionColor = (func: string) => {
    switch (func) {
      case 'Medical Affairs': return 'bg-blue-100 text-blue-800';
      case 'Commercial': return 'bg-purple-100 text-purple-800';
      case 'Market Access': return 'bg-teal-100 text-teal-800';
      case 'HR': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCostColor = (cost: string) => {
    switch (cost) {
      case '$': return 'text-green-600';
      case '$$': return 'text-yellow-600';
      case '$$$': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getImpactIcon = (score: number) => {
    if (score >= 8) return <AlertTriangle className="h-4 w-4 text-red-500" />;
    if (score >= 6) return <Info className="h-4 w-4 text-yellow-500" />;
    return <CheckCircle className="h-4 w-4 text-green-500" />;
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case 'Daily': return 'text-red-600';
      case 'Weekly': return 'text-orange-600';
      case 'Monthly': return 'text-yellow-600';
      case 'Quarterly': return 'text-green-600';
      default: return 'text-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex-1">
            {loading ? (
              <div className="h-8 bg-gray-200 rounded animate-pulse w-2/3"></div>
            ) : jtbd ? (
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={getFunctionColor(jtbd.function)}>
                    {jtbd.function}
                  </Badge>
                  <Badge variant="outline" className={getComplexityColor(jtbd.complexity)}>
                    {jtbd.complexity}
                  </Badge>
                  <Badge variant="outline">
                    {jtbd.workshop_potential} Workshop Potential
                  </Badge>
                </div>
                <h2 className="text-2xl font-bold text-deep-charcoal">
                  <span className="text-trust-blue">{jtbd.verb}</span>{' '}
                  {jtbd.goal}
                </h2>
              </div>
            ) : (
              <div className="text-xl font-semibold text-deep-charcoal">JTBD Details</div>
            )}
          </div>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 border-2 border-trust-blue border-t-transparent rounded-full animate-spin"></div>
                <span className="text-medical-gray">Loading details...</span>
              </div>
            </div>
          ) : error ? (
            <div className="p-6 text-center">
              <div className="text-clinical-red mb-3">Error loading JTBD details</div>
              <p className="text-medical-gray mb-4">{error}</p>
              <Button onClick={fetchJTBDDetails} variant="outline">
                Try Again
              </Button>
            </div>
          ) : jtbd ? (
            <div className="p-6">
              {/* Overview Section */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Main Info */}
                <div className="lg:col-span-2">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Info className="h-5 w-5" />
                        Overview
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-medical-gray mb-4">
                        {jtbd.description}
                      </p>

                      {jtbd.business_value && (
                        <div className="p-4 bg-green-50 rounded-lg">
                          <h4 className="font-medium text-green-800 mb-2">Business Value</h4>
                          <p className="text-green-700 text-sm">{jtbd.business_value}</p>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Key Metrics */}
                <div>
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart className="h-5 w-5" />
                        Key Metrics
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-medical-gray">Success Rate</span>
                          <div className="flex items-center gap-2">
                            <Progress value={jtbd.success_rate} className="w-16" />
                            <span className="text-sm font-medium">{jtbd.success_rate}%</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-medical-gray">Usage Count</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-sm font-medium">{jtbd.usage_count}</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-medical-gray">Avg. Time</span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span className="text-sm font-medium">
                              {jtbd.avg_execution_time ? `${jtbd.avg_execution_time}m` : 'N/A'}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-medical-gray">Time to Value</span>
                          <span className="text-sm font-medium">{jtbd.time_to_value}</span>
                        </div>

                        <div className="flex items-center justify-between">
                          <span className="text-sm text-medical-gray">Cost</span>
                          <span className={`text-sm font-medium ${getCostColor(jtbd.implementation_cost)}`}>
                            {jtbd.implementation_cost}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Detailed Tabs */}
              <Tabs defaultValue="pain-points" className="space-y-4">
                <TabsList className="grid w-full grid-cols-6">
                  <TabsTrigger value="pain-points">Pain Points</TabsTrigger>
                  <TabsTrigger value="ai-techniques">AI Techniques</TabsTrigger>
                  <TabsTrigger value="data-requirements">Data</TabsTrigger>
                  <TabsTrigger value="tools">Tools</TabsTrigger>
                  <TabsTrigger value="personas">Personas</TabsTrigger>
                  <TabsTrigger value="process">Process</TabsTrigger>
                </TabsList>

                <TabsContent value="pain-points">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5 text-red-500" />
                        Pain Points ({jtbd.pain_points.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jtbd.pain_points.map((painPoint) => (
                          <div key={painPoint.id} className="border rounded-lg p-4">
                            <div className="flex items-start justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getImpactIcon(painPoint.impact_score)}
                                <span className="text-sm font-medium">
                                  Impact Score: {painPoint.impact_score}/10
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className={getFrequencyColor(painPoint.frequency)}
                              >
                                {painPoint.frequency}
                              </Badge>
                            </div>
                            <p className="text-medical-gray mb-2">{painPoint.pain_point}</p>
                            <div className="text-sm">
                              <p className="text-green-700 mb-1">
                                <strong>Solution:</strong> {painPoint.solution_approach}
                              </p>
                              <div className="flex items-center gap-4 text-medical-gray">
                                <span>Time Spent: {painPoint.current_time_spent}min</span>
                                <span>Effort: {painPoint.manual_effort_level}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="ai-techniques">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Brain className="h-5 w-5 text-purple-500" />
                        AI Techniques ({jtbd.ai_techniques.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {jtbd.ai_techniques.map((technique) => (
                          <div key={technique.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{technique.technique}</h4>
                              <Badge
                                variant="outline"
                                className={
                                  technique.complexity_level === 'Advanced' ? 'bg-red-100 text-red-800' :
                                  technique.complexity_level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-green-100 text-green-800'
                                }
                              >
                                {technique.complexity_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-medical-gray mb-2">
                              {technique.application_description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {technique.required_data_types.map((type, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {type}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="data-requirements">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Database className="h-5 w-5 text-blue-500" />
                        Data Requirements ({jtbd.data_requirements.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jtbd.data_requirements.map((req) => (
                          <div key={req.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{req.data_type}</h4>
                              <div className="flex items-center gap-2">
                                {req.is_required && (
                                  <Badge variant="destructive" className="text-xs">Required</Badge>
                                )}
                                <Badge variant="outline">{req.accessibility}</Badge>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div>
                                <span className="text-medical-gray">Source:</span> {req.data_source}
                              </div>
                              <div>
                                <span className="text-medical-gray">Format:</span> {req.data_format}
                              </div>
                              <div>
                                <span className="text-medical-gray">Volume:</span> {req.estimated_volume}
                              </div>
                              <div>
                                <span className="text-medical-gray">Refresh:</span> {req.refresh_frequency}
                              </div>
                            </div>
                            {req.quality_requirements && (
                              <p className="text-sm text-medical-gray mt-2">
                                <strong>Quality:</strong> {req.quality_requirements}
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="tools">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-gray-500" />
                        Tools & Technologies ({jtbd.tools.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jtbd.tools.map((tool) => (
                          <div key={tool.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{tool.tool_name}</h4>
                              <div className="flex items-center gap-2">
                                <Badge variant="outline">{tool.tool_type}</Badge>
                                <Badge
                                  className={
                                    tool.integration_status === 'Integrated' ? 'bg-green-100 text-green-800' :
                                    tool.integration_status === 'Planned' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-blue-100 text-blue-800'
                                  }
                                >
                                  {tool.integration_status}
                                </Badge>
                              </div>
                            </div>
                            <p className="text-sm text-medical-gray mb-2">
                              {tool.tool_description}
                            </p>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <span className="text-medical-gray">License:</span> {tool.license_type}
                              </div>
                              <div>
                                <span className="text-medical-gray">Setup:</span> {tool.setup_complexity}
                              </div>
                              <div>
                                <span className="text-medical-gray">Cost:</span> {tool.monthly_cost_estimate || 'Free'}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="personas">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5 text-green-500" />
                        Target Personas ({jtbd.persona_mapping.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jtbd.persona_mapping.map((persona) => (
                          <div key={persona.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="font-medium">{persona.persona_name}</h4>
                              <div className="flex items-center gap-2">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span className="text-sm">{persona.relevance_score}/10</span>
                              </div>
                            </div>
                            <p className="text-sm text-medical-gray mb-2">
                              <strong>Role:</strong> {persona.persona_role}
                            </p>
                            <p className="text-sm text-medical-gray mb-2">
                              <strong>Use Case:</strong> {persona.use_case_examples}
                            </p>
                            <p className="text-sm text-green-700 mb-2">
                              <strong>Expected Benefit:</strong> {persona.expected_benefit}
                            </p>
                            <div className="text-sm">
                              <span className="text-medical-gray">Frequency:</span> {persona.typical_frequency}
                            </div>
                            {persona.adoption_barriers && persona.adoption_barriers.length > 0 && (
                              <div className="mt-2">
                                <span className="text-sm text-red-700 font-medium">Barriers:</span>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {persona.adoption_barriers.map((barrier, idx) => (
                                    <Badge key={idx} variant="destructive" className="text-xs">
                                      {barrier}
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="process">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Workflow className="h-5 w-5 text-indigo-500" />
                        Process Steps ({jtbd.process_steps.length})
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {jtbd.process_steps.map((step) => (
                          <div key={step.id} className="border rounded-lg p-4">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                <div className="w-6 h-6 bg-trust-blue text-white rounded-full flex items-center justify-center text-xs font-medium">
                                  {step.step_number}
                                </div>
                                <h4 className="font-medium">{step.step_name}</h4>
                              </div>
                              <div className="flex items-center gap-2">
                                {step.is_parallel && (
                                  <Badge variant="outline" className="text-xs">Parallel</Badge>
                                )}
                                <span className="text-sm text-medical-gray">
                                  {step.estimated_duration}min
                                </span>
                              </div>
                            </div>
                            <p className="text-sm text-medical-gray mb-2">
                              {step.step_description}
                            </p>
                            {step.required_capabilities && step.required_capabilities.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {step.required_capabilities.map((capability, idx) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {capability}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          ) : null}
        </div>

        {/* Footer */}
        {jtbd && (
          <div className="flex items-center justify-between p-6 border-t bg-gray-50">
            <div className="text-sm text-medical-gray">
              Maturity: {jtbd.maturity_level} •
              Last updated: {new Date(jtbd.updated_at).toLocaleDateString()}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose}>
                Close
              </Button>
              <Button
                onClick={() => onExecute?.(jtbd)}
                disabled={jtbd.maturity_level === 'Research' || jtbd.maturity_level === 'Concept'}
                className="flex items-center gap-1"
              >
                <Play className="h-4 w-4" />
                Execute JTBD
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
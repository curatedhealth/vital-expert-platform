'use client';

import {
  TestTube,
  BookOpen,
  Brain,
  Settings,
  Activity,
  Zap,
  TrendingUp,
  RefreshCw,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  BarChart3,
  Stethoscope,
  Microscope,
  Pill,
  Heart
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui';

interface MedicalModel {
  id: string;
  provider_name: string;
  provider_type: string;
  model_id: string;
  medical_accuracy_score: number;
  medical_specialties: string[];
  is_active: boolean;
  is_hipaa_compliant: boolean;
  clinical_trials: boolean;
  fda_approved: boolean;
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  average_latency_ms: number;
  uptime_percentage: number;
}

interface MedicalModelsDashboardProps {
  selectedModel?: string;
}

export const MedicalModelsDashboard: React.FC<MedicalModelsDashboardProps> = ({
  selectedModel
}) => {
  const [models, setModels] = useState<MedicalModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMedicalModels = async () => {
    try {
      setError(null);

      // Fetch medical models from the API
      const response = await fetch('/api/llm/providers');
      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();

      // Filter for medical models
      const medicalModels = data.filter((model: any) =>
        model.provider_name?.toLowerCase().includes('meditron') ||
        model.provider_name?.toLowerCase().includes('clinical') ||
        model.provider_name?.toLowerCase().includes('bio') ||
        model.provider_name?.toLowerCase().includes('med-') ||
        model.provider_name?.toLowerCase().includes('scibert') ||
        (model.capabilities && (model.capabilities as any).medical_knowledge)
      );

      setModels(medicalModels);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch medical models';
      setError(errorMessage);
      console.error('Error fetching medical models:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMedicalModels();
  }, []);

  const getModelIcon = (modelName: string) => {
    // eslint-disable-next-line security/detect-object-injection
    if (modelName.toLowerCase().includes('meditron')) return TestTube;
    // eslint-disable-next-line security/detect-object-injection
    if (modelName.toLowerCase().includes('clinical')) return Stethoscope;
    // eslint-disable-next-line security/detect-object-injection
    if (modelName.toLowerCase().includes('bio')) return Microscope;
    // eslint-disable-next-line security/detect-object-injection
    if (modelName.toLowerCase().includes('med-')) return Heart;
    // eslint-disable-next-line security/detect-object-injection
    if (modelName.toLowerCase().includes('sci')) return Settings;
    return Brain;
  };

  const getSpecialtyIcon = (specialty: string) => {
    // eslint-disable-next-line security/detect-object-injection
    if (specialty.includes('clinical')) return Stethoscope;
    // eslint-disable-next-line security/detect-object-injection
    if (specialty.includes('drug') || specialty.includes('medication')) return Pill;
    // eslint-disable-next-line security/detect-object-injection
    if (specialty.includes('diagnostic')) return Heart;
    // eslint-disable-next-line security/detect-object-injection
    if (specialty.includes('research') || specialty.includes('pubmed')) return BookOpen;
    return TestTube;
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 6
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TestTube className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Medical AI Models</h2>
            <p className="text-neutral-600">Loading medical AI models...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i: any) => (
            <Card key={i}>
              <CardContent className="pt-6">
                <div className="animate-pulse">
                  <div className="h-4 bg-neutral-200 rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-neutral-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <TestTube className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Medical AI Models</h2>
            <p className="text-neutral-600">Healthcare-focused AI models for clinical applications</p>
          </div>
        </div>
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <strong>Error loading medical models:</strong> {error}
          </AlertDescription>
        </Alert>
        <Button onClick={fetchMedicalModels}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  const activeModels = models.filter((m: any) => m.is_active);
  const hipaaCompliantModels = models.filter((m: any) => m.is_hipaa_compliant);
  const clinicalTrialModels = models.filter((m: any) => (m as any)?.capabilities?.clinical_trials);
  const avgAccuracy = models.length > 0
    ? models.reduce((sum: number, m: any) => sum + (m.medical_accuracy_score || 0), 0) / models.length
    : 0;

  // If a specific model is selected, show its details
  if (selectedModel) {
    // eslint-disable-next-line security/detect-object-injection
    const model = models.find((m: any) =>
      m.provider_name.toLowerCase().includes(selectedModel.toLowerCase())
    );

    if (model) {
      const ModelIcon = getModelIcon(model.provider_name);

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <ModelIcon className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold">{model.provider_name}</h2>
              <p className="text-neutral-600">Medical AI model for healthcare applications</p>
            </div>
          </div>

          {/* Model Details */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Medical Accuracy</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {model.medical_accuracy_score || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Clinical accuracy score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Input Cost</CardTitle>
                <Zap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {formatCurrency(model.cost_per_1k_input_tokens)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Per 1K input tokens
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Latency</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {model.average_latency_ms}ms
                </div>
                <p className="text-xs text-muted-foreground">
                  Average response time
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Uptime</CardTitle>
                <Activity className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {model.uptime_percentage}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Availability score
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Compliance and Specialties */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Compliance & Approvals
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">HIPAA Compliant</span>
                  <Badge variant={model.is_hipaa_compliant ? 'default' : 'secondary'}>
                    {model.is_hipaa_compliant ? 'Yes' : 'No'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Clinical Trials</span>
                  <Badge variant={(model as any)?.capabilities?.clinical_trials ? 'default' : 'secondary'}>
                    {(model as any)?.capabilities?.clinical_trials ? 'Active' : 'None'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">FDA Approved</span>
                  <Badge variant={(model as any)?.capabilities?.fda_approved ? 'default' : 'secondary'}>
                    {(model as any)?.capabilities?.fda_approved ? 'Yes' : 'Pending'}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Medical Specialties
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {/* eslint-disable-next-line security/detect-object-injection */}
                  {(model as any)?.capabilities?.medical_specialties?.map((specialty: string, index: number) => {
                    const SpecialtyIcon = getSpecialtyIcon(specialty);
                    return (
                      <Badge key={index} variant="outline" className="flex items-center gap-1">
                        <SpecialtyIcon className="h-3 w-3" />
                        {specialty.replace(/_/g, ' ')}
                      </Badge>
                    );
                  }) || (
                    <p className="text-sm text-neutral-600">General medical applications</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      );
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-3">
          <TestTube className="h-6 w-6 text-green-600" />
          <div>
            <h2 className="text-2xl font-bold">Medical AI Models</h2>
            <p className="text-neutral-600">Healthcare-focused AI models for clinical applications</p>
          </div>
        </div>
        <Button onClick={fetchMedicalModels} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Medical Models</CardTitle>
            <Brain className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeModels.length} active models
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">HIPAA Compliant</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {hipaaCompliantModels.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Ready for clinical use
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Accuracy</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {avgAccuracy.toFixed(1)}%
            </div>
            <p className="text-xs text-muted-foreground">
              Medical accuracy score
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clinical Trials</CardTitle>
            <TestTube className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {clinicalTrialModels.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Models in trials
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Available Medical Models
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {models.map((model) => {
              const ModelIcon = getModelIcon(model.provider_name);
              return (
                <div key={model.id} className="border rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <ModelIcon className="h-6 w-6 text-green-600" />
                      <div>
                        <h3 className="font-semibold">{model.provider_name}</h3>
                        <p className="text-sm text-neutral-600">{model.model_id}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {model.is_active && (
                        <Badge variant="outline" className="bg-green-50 text-green-700">
                          Active
                        </Badge>
                      )}
                      {model.is_hipaa_compliant && (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700">
                          HIPAA
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-neutral-600">Accuracy</p>
                      <p className="font-semibold">{model.medical_accuracy_score}%</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Latency</p>
                      <p className="font-semibold">{model.average_latency_ms}ms</p>
                    </div>
                    <div>
                      <p className="text-neutral-600">Input Cost</p>
                      <p className="font-semibold">{formatCurrency(model.cost_per_1k_input_tokens)}/1K</p>
                    </div>
                  </div>

                  {/* eslint-disable-next-line security/detect-object-injection */}
                  {(model as any)?.capabilities?.medical_specialties && (
                    <div className="flex flex-wrap gap-1">
                      {/* eslint-disable-next-line security/detect-object-injection */}
                      {(model as any)?.capabilities?.medical_specialties?.slice(0, 3).map((specialty: string, index: number) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {specialty.replace(/_/g, ' ')}
                        </Badge>
                      ))}
                      {/* eslint-disable-next-line security/detect-object-injection */}
                      {((model as any)?.capabilities?.medical_specialties?.length || 0) > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{((model as any)?.capabilities?.medical_specialties?.length || 0) - 3} more
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      <div className="text-xs text-neutral-500 text-center">
        <Calendar className="h-3 w-3 inline mr-1" />
        Medical models data refreshed: {new Date().toLocaleString()}
      </div>
    </div>
  );
};
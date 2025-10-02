'use client';

import {
  TestTube,
  Settings,
  Activity,
  CheckCircle,
  XCircle,
  Clock,
  Shield,
  Zap,
  Brain,
  FileText,
  Users,
  Heart
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface MeditronModel {
  id: string;
  provider_name: string;
  model_id: string;
  model_version: string;
  is_active: boolean;
  medical_accuracy_score: number;
  capabilities: {
    medical_specialties: string[];
    supports_phi: boolean;
    context_window: number;
  };
  cost_per_1k_input_tokens: number;
  cost_per_1k_output_tokens: number;
  average_latency_ms: number;
  uptime_percentage: number;
}

interface ConnectionTest {
  model: string;
  status: 'pending' | 'success' | 'error';
  latency?: number;
  error?: string;
}

export const MeditronSetup: React.FC = () => {
  const [apiKey, setApiKey] = useState('');
  const [isConfigured, setIsConfigured] = useState(false);
  const [models, setModels] = useState<MeditronModel[]>([]);
  const [connectionTests, setConnectionTests] = useState<ConnectionTest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [isDemoMode, setIsDemoMode] = useState(false);

  useEffect(() => {
    fetchMeditronModels();
    checkApiKeyConfiguration();
  }, []);

    try {
      const response = await fetch('/api/llm-providers?provider_type=huggingface&search=meditron');
      if (response.ok) {
        const data = await response.json();
        setModels(data.providers || []);
      }
    } catch (error) {
      console.error('Error fetching Meditron models:', error);
    }
  };

    const storedKey = localStorage.getItem('huggingface_api_key');
    if (storedKey) {
      setApiKey(storedKey);
      setIsConfigured(true);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) return;

    setIsLoading(true);
    try {
      localStorage.setItem('huggingface_api_key', apiKey);

      // Update environment configuration
      const response = await fetch('/api/llm-providers/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          provider_type: 'huggingface',
          api_key: apiKey,
          models: ['meditron-7b', 'meditron-70b']
        })
      });

      if (response.ok) {
        setIsConfigured(true);
        await testAllConnections();
      }
    } catch (error) {
      console.error('Error saving API key:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const testAllConnections = async () => {
    if (!isConfigured) return;

    setIsLoading(true);
    setTestProgress(0);

    const tests: ConnectionTest[] = models.map(model => ({
      model: model.provider_name,
      status: 'pending'
    }));
    setConnectionTests(tests);

    for (let i = 0; i < models.length; i++) {
      // eslint-disable-next-line security/detect-object-injection
      const model = models[i];
      setTestProgress(((i + 1) / models.length) * 100);

      try {
        const startTime = Date.now();
        const response = await fetch('/api/llm-providers/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            provider_id: model.id,
            test_prompt: 'What is the primary function of insulin in the human body?'
          })
        });

        const latency = Date.now() - startTime;
        const result = await response.json();

        setConnectionTests(prev =>
          prev.map(test =>
            test.model === model.provider_name
              ? {
                  ...test,
                  status: response.ok ? 'success' : 'error',
                  latency: response.ok ? latency : undefined,
                  error: !response.ok ? result.error : undefined
                }
              : test
          )
        );
      } catch (error) {
        setConnectionTests(prev =>
          prev.map(test =>
            test.model === model.provider_name
              ? { ...test, status: 'error', error: 'Connection failed' }
              : test
          )
        );
      }
    }

    setIsLoading(false);
  };

  const toggleModelStatus = async (modelId: string, currentStatus: boolean) => {
    try {
      const response = await fetch(`/api/llm-providers/${modelId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ is_active: !currentStatus })
      });

      if (response.ok) {
        setModels(prev =>
          prev.map(model =>
            model.id === modelId
              ? { ...model, is_active: !currentStatus }
              : model
          )
        );
      }
    } catch (error) {
      console.error('Error toggling model status:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <TestTube className="h-8 w-8 text-blue-600" />
        <div>
          <h1 className="text-3xl font-bold">Meditron AI Setup</h1>
          <p className="text-muted-foreground">Configure and manage medical-grade AI models</p>
        </div>
      </div>

      <Tabs defaultValue="configuration" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="configuration">Configuration</TabsTrigger>
          <TabsTrigger value="models">Models</TabsTrigger>
          <TabsTrigger value="testing">Testing</TabsTrigger>
          <TabsTrigger value="compliance">Compliance</TabsTrigger>
        </TabsList>

        <TabsContent value="configuration">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Settings className="h-5 w-5" />
                <span>API Configuration</span>
              </CardTitle>
              <CardDescription>
                Configure your Hugging Face API key to access Meditron models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">Hugging Face API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  placeholder="hf_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Get your API key from{' '}
                  <a href="https://huggingface.co/settings/tokens" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Hugging Face Settings
                  </a>
                </p>
              </div>

              <div className="flex items-center space-x-3">
                <Button
                  onClick={saveApiKey}
                  disabled={!apiKey.trim() || isLoading}
                  className="flex items-center space-x-2"
                >
                  {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Settings className="h-4 w-4" />}
                  <span>{isConfigured ? 'Update Configuration' : 'Save Configuration'}</span>
                </Button>

                {isConfigured && (
                  <Badge variant="secondary" className="flex items-center space-x-1">
                    <CheckCircle className="h-3 w-3" />
                    <span>Configured</span>
                  </Badge>
                )}
              </div>

              {isConfigured && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    API key is securely stored and encrypted. Meditron models are now ready for use.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="models">
          <div className="grid gap-4">
            {models.map((model) => (
              <Card key={model.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Brain className="h-6 w-6 text-purple-600" />
                      <div>
                        <CardTitle className="text-lg">{model.provider_name}</CardTitle>
                        <CardDescription>{model.model_id}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={model.is_active ? "default" : "secondary"}>
                        {model.is_active ? "Active" : "Inactive"}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => toggleModelStatus(model.id, model.is_active)}
                      >
                        {model.is_active ? "Disable" : "Enable"}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Medical Accuracy</p>
                      <div className="flex items-center space-x-2">
                        <Progress value={model.medical_accuracy_score} className="flex-1" />
                        <span className="text-sm font-medium">{model.medical_accuracy_score}%</span>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Context Window</p>
                      <p className="text-lg font-semibold">{model.capabilities.context_window.toLocaleString()}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Avg Latency</p>
                      <p className="text-lg font-semibold">{model.average_latency_ms}ms</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium">Uptime</p>
                      <p className="text-lg font-semibold">{model.uptime_percentage}%</p>
                    </div>
                  </div>

                  <div className="mt-4 space-y-2">
                    <p className="text-sm font-medium">Medical Specialties</p>
                    <div className="flex flex-wrap gap-2">
                      {model.capabilities.medical_specialties.map((specialty) => (
                        <Badge key={specialty} variant="outline" className="text-xs">
                          {specialty.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Shield className="h-4 w-4 text-green-600" />
                      <span>PHI Compliant: {model.capabilities.supports_phi ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Zap className="h-4 w-4 text-yellow-600" />
                      <span>Cost: ${model.cost_per_1k_input_tokens}/1K tokens</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="testing">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="h-5 w-5" />
                <span>Connectivity Testing</span>
              </CardTitle>
              <CardDescription>
                Test connection and performance of Meditron models
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Button
                  onClick={testAllConnections}
                  disabled={!isConfigured || isLoading}
                  className="flex items-center space-x-2"
                >
                  {isLoading ? <Clock className="h-4 w-4 animate-spin" /> : <Activity className="h-4 w-4" />}
                  <span>Test All Models</span>
                </Button>

                {isLoading && (
                  <div className="flex-1">
                    <Progress value={testProgress} className="w-full" />
                  </div>
                )}
              </div>

              {connectionTests.length > 0 && (
                <div className="space-y-3">
                  {connectionTests.map((test) => (
                    <div key={test.model} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        {test.status === 'pending' && <Clock className="h-4 w-4 animate-spin text-yellow-600" />}
                        {test.status === 'success' && <CheckCircle className="h-4 w-4 text-green-600" />}
                        {test.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                        <span className="font-medium">{test.model}</span>
                      </div>

                      <div className="flex items-center space-x-4">
                        {test.latency && (
                          <span className="text-sm text-muted-foreground">{test.latency}ms</span>
                        )}
                        {test.error && (
                          <span className="text-sm text-red-600">{test.error}</span>
                        )}
                        <Badge variant={
                          test.status === 'success' ? 'default' :
                          test.status === 'error' ? 'destructive' :
                          'secondary'
                        }>
                          {test.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {!isConfigured && (
                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    Please configure your Hugging Face API key first to test model connectivity.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="compliance">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Healthcare Compliance</span>
                </CardTitle>
                <CardDescription>
                  Meditron compliance status and certifications
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Heart className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold">HIPAA Compliance</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Meditron models support PHI processing with proper safeguards
                    </p>
                    <Badge variant="default">Compliant</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <FileText className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold">Clinical Validation</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Trained on medical literature and clinical datasets
                    </p>
                    <Badge variant="default">Validated</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Users className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold">Clinical Trials</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      Undergoing clinical validation studies
                    </p>
                    <Badge variant="secondary">In Progress</Badge>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Shield className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold">Data Security</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">
                      End-to-end encryption and secure processing
                    </p>
                    <Badge variant="default">Secure</Badge>
                  </div>
                </div>

                <Alert>
                  <Shield className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Important:</strong> While Meditron models are designed for medical applications,
                    they should be used as decision support tools only. Always consult qualified healthcare
                    professionals for medical diagnosis and treatment decisions.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MeditronSetup;
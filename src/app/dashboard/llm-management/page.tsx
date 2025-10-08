'use client';

import {
  Server,
  Shield,
  Activity,
  Zap,
  DollarSign,
  Brain,
  AlertTriangle,
  Info,
  Database,
  Users,
  Key,
  Monitor,
  FileText,
  TrendingUp,
  Clock
} from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import React, { Suspense } from 'react';

import { LLMProviderDashboard } from '@/components/llm/LLMProviderDashboard';
import { MedicalModelsDashboard } from '@/components/llm/MedicalModelsDashboard';
import { OpenAIUsageDashboard } from '@/components/llm/OpenAIUsageDashboard';
import { UsageAnalyticsDashboard } from '@/components/llm/UsageAnalyticsDashboard';
import { PromptCRUDManager } from '@/components/admin/PromptCRUDManager';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function LLMManagementPageContent() {
  const searchParams = useSearchParams();
  const currentView = searchParams.get('view') || 'providers';
  const currentProvider = searchParams.get('provider');
  const currentDB = searchParams.get('db');
  const currentAdmin = searchParams.get('admin');

  const renderDatabaseView = () => {
    const dbViews = {
      providers: { title: 'Provider Tables', icon: Database, description: 'Manage LLM provider configurations and settings' },
      usage: { title: 'Usage Logs', icon: FileText, description: 'View detailed request and usage logs' },
      health: { title: 'Health Checks', icon: Monitor, description: 'Monitor provider health and status checks' },
      sessions: { title: 'User Sessions', icon: Users, description: 'Active user sessions and authentication' },
      keys: { title: 'API Keys', icon: Key, description: 'Encrypted API key management' },
    };

    const current = dbViews[currentDB as keyof typeof dbViews] || dbViews.providers;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <current.icon className="h-6 w-6 text-blue-600" />
          <div>
            <h2 className="text-2xl font-bold">{current.title}</h2>
            <p className="text-gray-600">{current.description}</p>
          </div>
        </div>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Database View</h3>
              <p className="text-gray-600">
                {current.title} interface will be implemented here
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  const renderAdminView = () => {
    const adminViews = {
      security: { title: 'Security Audit', icon: Shield, description: 'Security logs and compliance monitoring' },
      compliance: { title: 'Compliance Reports', icon: FileText, description: 'HIPAA and regulatory compliance reports' },
      alerts: { title: 'System Alerts', icon: AlertTriangle, description: 'System alerts and notifications' },
      performance: { title: 'Performance Tuning', icon: TrendingUp, description: 'Performance optimization and tuning' },
      rag: { title: 'RAG Performance', icon: Brain, description: 'RAG system performance monitoring and analytics' },
      prompts: { title: 'Prompt Management', icon: FileText, description: 'Create, edit, and manage PRISM prompts and templates' },
    };

    const current = adminViews[currentAdmin as keyof typeof adminViews] || adminViews.security;

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <current.icon className="h-6 w-6 text-red-600" />
          <div>
            <h2 className="text-2xl font-bold">{current.title}</h2>
            <p className="text-gray-600">{current.description}</p>
          </div>
        </div>
        {currentAdmin === 'rag' ? (
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Brain className="h-6 w-6 text-blue-600" />
              <div>
                <h2 className="text-2xl font-bold">RAG Performance Monitoring</h2>
                <p className="text-gray-600">Monitor and optimize RAG system performance</p>
              </div>
            </div>
            
            {/* RAG Performance Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Overall Score</CardTitle>
                  <Brain className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">87.5%</div>
                  <p className="text-xs text-muted-foreground">+2.3% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cache Hit Rate</CardTitle>
                  <Database className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">73.2%</div>
                  <p className="text-xs text-muted-foreground">15,420 total queries</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Response Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1,250ms</div>
                  <p className="text-xs text-muted-foreground">-12.5% from yesterday</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Cost Savings</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">68.4%</div>
                  <p className="text-xs text-muted-foreground">$2,340 saved this month</p>
                </CardContent>
              </Card>
            </div>

            {/* RAG Strategy Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Strategy Performance Comparison</CardTitle>
                <CardDescription>Compare different RAG retrieval strategies</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">hybrid_rerank</Badge>
                      <span className="text-sm text-gray-600">5,420 queries</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-green-600">89.2%</div>
                      <div className="text-xs text-gray-600">Best performer</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">rag_fusion</Badge>
                      <span className="text-sm text-gray-600">3,890 queries</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-yellow-600">84.7%</div>
                      <div className="text-xs text-gray-600">Good performance</div>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Badge variant="outline">basic</Badge>
                      <span className="text-sm text-gray-600">6,110 queries</span>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold text-orange-600">76.3%</div>
                      <div className="text-xs text-gray-600">Needs optimization</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center space-x-2 mb-2">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="font-semibold text-blue-900">RAG Performance Tools</h3>
              </div>
              <p className="text-blue-800 text-sm mb-3">
                Access comprehensive RAG performance analytics, evaluation metrics, and optimization tools.
              </p>
              <div className="flex space-x-2">
                <a 
                  href="/api/rag/enhanced?action=get_metrics" 
                  target="_blank"
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700"
                >
                  View API Metrics
                </a>
                <a 
                  href="/api/rag/evaluate?action=summary" 
                  target="_blank"
                  className="inline-flex items-center px-3 py-2 bg-white text-blue-600 text-sm font-medium rounded-md border border-blue-600 hover:bg-blue-50"
                >
                  Evaluation Results
                </a>
              </div>
            </div>
          </div>
        ) : currentAdmin === 'prompts' ? (
          <PromptCRUDManager />
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <current.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Admin Tools</h3>
                <p className="text-gray-600">
                  {current.title} interface will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  const renderProviderView = () => {
    if (currentProvider) {
      const providers = {
        openai: { name: 'OpenAI', icon: Brain },
        anthropic: { name: 'Anthropic', icon: Zap },
        google: { name: 'Google', icon: Server },
        azure: { name: 'Azure OpenAI', icon: Server },
        aws_bedrock: { name: 'AWS Bedrock', icon: Server },
      };

      const provider = providers[currentProvider as keyof typeof providers];

      // Return provider-specific dashboard
      if (currentProvider === 'openai') {
        return <OpenAIUsageDashboard />;
      }

      // Medical models
      const medicalModels = ['meditron', 'clinicalbert', 'biobert', 'medpalm', 'scibert'];
      if (medicalModels.includes(currentProvider)) {
        return <MedicalModelsDashboard selectedModel={currentProvider} />;
      }

      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <provider.icon className="h-6 w-6 text-blue-600" />
            <div>
              <h2 className="text-2xl font-bold">{provider.name} Management</h2>
              <p className="text-gray-600">Configure and monitor {provider.name} integration</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <provider.icon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{provider.name} Dashboard</h3>
                <p className="text-gray-600">
                  Provider-specific management interface will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }

    return <LLMProviderDashboard />;
  };

  const renderMainContent = () => {
    if (currentDB) return renderDatabaseView();
    if (currentAdmin) return renderAdminView();
    if (currentView === 'analytics') return <UsageAnalyticsDashboard />;
    if (currentView === 'costs') return <UsageAnalyticsDashboard />;
    if (currentView === 'health') {
      return (
        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 text-green-600" />
            <div>
              <h2 className="text-2xl font-bold">Health & Status</h2>
              <p className="text-gray-600">Real-time provider health monitoring</p>
            </div>
          </div>
          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Health Dashboard</h3>
                <p className="text-gray-600">
                  Provider health monitoring interface will be implemented here
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      );
    }
    return renderProviderView();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Page Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
                <Server className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">LLM Management Center</h1>
                <p className="text-gray-600">
                  Manage, monitor, and optimize your Large Language Model providers
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                <Shield className="h-3 w-3 mr-1" />
                HIPAA Compliant
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Brain className="h-3 w-3 mr-1" />
                Medical AI Ready
              </Badge>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Important Notice */}
        <Alert className="mb-6 bg-blue-50 border-blue-200">
          <Info className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-blue-800">
            <strong>Healthcare Compliance Notice:</strong> All LLM providers in this system are configured
            to meet HIPAA requirements. PHI processing capabilities are strictly controlled and audited.
            Medical accuracy thresholds are enforced for clinical agents.
          </AlertDescription>
        </Alert>

        {/* Key Features Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center">
                <Server className="h-4 w-4 mr-2" />
                Multi-Provider Support
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-blue-700">
                OpenAI, Anthropic, Google, Azure, AWS Bedrock, and custom endpoints
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center">
                <Shield className="h-4 w-4 mr-2" />
                Healthcare Compliance
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-green-700">
                HIPAA, FDA 21 CFR Part 11, and medical validation protocols
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-yellow-900 flex items-center">
                <Activity className="h-4 w-4 mr-2" />
                Real-time Monitoring
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-yellow-700">
                Health checks, performance metrics, and automated failover
              </p>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-purple-900 flex items-center">
                <DollarSign className="h-4 w-4 mr-2" />
                Cost Optimization
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-xs text-purple-700">
                Usage tracking, budget alerts, and optimization recommendations
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dynamic Content Based on Sidebar Selection */}
        {renderMainContent()}

        {/* Healthcare-Specific Information */}
        <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Brain className="h-5 w-5 mr-2 text-blue-600" />
                Medical AI Capabilities
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clinical Decision Support</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Medical Literature Review</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Drug Interaction Checking</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Available</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">PHI Processing</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">Controlled</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Clinical Validation</span>
                <Badge variant="outline" className="bg-purple-50 text-purple-700">Required</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900 flex items-center">
                <Shield className="h-5 w-5 mr-2 text-green-600" />
                Compliance & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">HIPAA Compliance</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Enforced</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">API Key Encryption</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">AES-256</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Audit Logging</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Complete</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Data Retention</span>
                <Badge variant="outline" className="bg-blue-50 text-blue-700">7 Years</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">FDA 21 CFR Part 11</span>
                <Badge variant="outline" className="bg-green-50 text-green-700">Compliant</Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-gray-900">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg">
                      <Server className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Add New Provider</h4>
                      <p className="text-xs text-gray-600">Configure a new LLM provider</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg">
                      <Activity className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Health Check All</h4>
                      <p className="text-xs text-gray-600">Test all provider connections</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-lg">
                      <DollarSign className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Cost Analytics</h4>
                      <p className="text-xs text-gray-600">View detailed cost breakdown</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default function LLMManagementPage() {
  return (
    <Suspense fallback={<div className="p-6 animate-pulse">Loading LLM management...</div>}>
      <LLMManagementPageContent />
    </Suspense>
  );
}
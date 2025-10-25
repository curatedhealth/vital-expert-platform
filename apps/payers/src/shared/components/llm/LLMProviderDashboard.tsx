import {
  Server,
  Activity,
  Zap,
  AlertTriangle,
  CheckCircle,
  Plus,
  Settings,
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Play,
  Pause,
  RefreshCw,
  TrendingUp,
  Shield,
  Brain
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui/components/alert';
import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui/components/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@vital/ui/components/dropdown-menu';
import { Progress } from '@vital/ui/components/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@vital/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui/components/tabs';
import { llmProviderService } from '@/shared/services/llm/llm-provider.service';
import {
  LLMProvider,
  ProviderStatus,
  PROVIDER_TYPE_LABELS,
  ProviderFilters
} from '@/types/llm-provider.types';

interface LLMProviderDashboardProps {
  className?: string;
}

export const LLMProviderDashboard: React.FC<LLMProviderDashboardProps> = ({ className }) => {
  const [providers, setProviders] = useState<LLMProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedProvider, setSelectedProvider] = useState<LLMProvider | null>(null);
  const [showAddProvider, setShowAddProvider] = useState(false);
  const [filters, setFilters] = useState<ProviderFilters>({ /* TODO: implement */ });
  const [refreshing, setRefreshing] = useState(false);

  // Dashboard metrics
  const [dashboardMetrics, setDashboardMetrics] = useState({
    totalProviders: 0,
    activeProviders: 0,
    healthyProviders: 0,
    totalRequests: 0,
    totalCost: 0,
    avgLatency: 0,
    errorRate: 0
  });

  useEffect(() => {
    loadProviders();
    loadDashboardMetrics();
  }, [filters]);

  const loadProviders = async () => {
    try {
      setLoading(true);
      const response = await llmProviderService.getAllProviders();
      setProviders(response.providers);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load providers');
    } finally {
      setLoading(false);
    }
  };

  const loadDashboardMetrics = async () => {
    try {
      // Calculate metrics from providers
      const totalProviders = providers.length;
      const activeProviders = providers.filter(p => p.is_active).length;
      const healthyProviders = providers.filter(p => p.status === 'healthy').length;

      setDashboardMetrics({
        totalProviders,
        activeProviders,
        healthyProviders,
        totalRequests: 0, // Would come from usage logs
        totalCost: 0, // Would come from usage logs
        avgLatency: Math.round(providers.reduce((sum, p) => sum + (p.average_latency_ms || 0), 0) / providers.length) || 0,
        errorRate: 0 // Would come from usage logs
      });
    } catch (err) {
      // console.error('Failed to load dashboard metrics:', err);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadProviders();
    await loadDashboardMetrics();
    setRefreshing(false);
  };

  const handleProviderAction = async (providerId: string, action: string) => {
    try {
      switch (action) {
        case 'activate':
          await llmProviderService.updateProvider(providerId, { is_active: true });
          break;
        case 'deactivate':
          await llmProviderService.updateProvider(providerId, { is_active: false });
          break;
        case 'delete':
          await llmProviderService.deleteProvider(providerId);
          break;
        case 'test':

          if (provider) {
            await llmProviderService.testProviderHealth(provider);
          }
          break;
      }
      await loadProviders();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  };

  const getStatusIcon = (status: ProviderStatus) => {
    switch (status) {
      case ProviderStatus.ACTIVE:
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case ProviderStatus.ERROR:
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      case ProviderStatus.MAINTENANCE:
        return <Settings className="h-4 w-4 text-yellow-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: ProviderStatus) => {
    const colorMap = {
      [ProviderStatus.ACTIVE]: 'bg-green-100 text-green-800',
      [ProviderStatus.ERROR]: 'bg-red-100 text-red-800',
      [ProviderStatus.MAINTENANCE]: 'bg-yellow-100 text-yellow-800',
      [ProviderStatus.DISABLED]: 'bg-gray-100 text-gray-800',
      [ProviderStatus.INITIALIZING]: 'bg-blue-100 text-blue-800'
    };

    return (
      <Badge className={`${colorMap[status]} text-xs`}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatCost = (cost: number) => {
    return `$${cost.toFixed(4)}`;
  };

  const formatLatency = (latency?: number) => {
    return latency ? `${latency}ms` : 'N/A';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">LLM Provider Management</h1>
          <p className="text-gray-600">Manage and monitor your LLM providers</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={refreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={() => setShowAddProvider(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Provider
          </Button>
        </div>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Providers</p>
                <p className="text-2xl font-bold text-gray-900">{dashboardMetrics.totalProviders}</p>
              </div>
              <Server className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Providers</p>
                <p className="text-2xl font-bold text-green-600">{dashboardMetrics.activeProviders}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Health Score</p>
                <p className="text-2xl font-bold text-blue-600">
                  {dashboardMetrics.totalProviders > 0
                    ? Math.round((dashboardMetrics.healthyProviders / dashboardMetrics.totalProviders) * 100)
                    : 0}%
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg Latency</p>
                <p className="text-2xl font-bold text-yellow-600">{dashboardMetrics.avgLatency}ms</p>
              </div>
              <Zap className="h-8 w-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="providers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="providers">Providers</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="providers" className="space-y-4">
          {/* Providers Table */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>LLM Providers</span>
                <div className="flex items-center gap-2">
                  {/* Filter controls would go here */}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin" />
                  <span className="ml-2">Loading providers...</span>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Provider</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Health</TableHead>
                      <TableHead>Latency</TableHead>
                      <TableHead>Cost (1K tokens)</TableHead>
                      <TableHead>Compliance</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {providers.map((provider) => (
                      <TableRow key={provider.id}>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(provider.status)}
                            <div>
                              <div className="font-medium">{provider.provider_name}</div>
                              <div className="text-sm text-gray-500">
                                Priority: {provider.priority_level}
                              </div>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <Badge variant="outline">
                            {PROVIDER_TYPE_LABELS[provider.provider_type]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium">{provider.model_id}</div>
                            {provider.model_version && (
                              <div className="text-sm text-gray-500">v{provider.model_version}</div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          {getStatusBadge(provider.status)}
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={provider.uptime_percentage}
                              className="w-16 h-2"
                            />
                            <span className="text-sm text-gray-600">
                              {provider.uptime_percentage.toFixed(1)}%
                            </span>
                          </div>
                        </TableCell>

                        <TableCell>
                          {formatLatency(provider.average_latency_ms)}
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            <div>In: {formatCost(provider.cost_per_1k_input_tokens)}</div>
                            <div>Out: {formatCost(provider.cost_per_1k_output_tokens)}</div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center space-x-1">
                            {provider.is_hipaa_compliant && (
                              <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
                                <Shield className="h-3 w-3 mr-1" />
                                HIPAA
                              </Badge>
                            )}
                            {provider.capabilities.medical_knowledge && (
                              <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
                                <Brain className="h-3 w-3 mr-1" />
                                Medical
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => setSelectedProvider(provider)}>
                                <Eye className="h-4 w-4 mr-2" />
                                View Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleProviderAction('test', provider.id)}>
                                <Activity className="h-4 w-4 mr-2" />
                                Test Health
                              </DropdownMenuItem>
                              {provider.is_active ? (
                                <DropdownMenuItem onClick={() => handleProviderAction('deactivate', provider.id)}>
                                  <Pause className="h-4 w-4 mr-2" />
                                  Deactivate
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem onClick={() => handleProviderAction('activate', provider.id)}>
                                  <Play className="h-4 w-4 mr-2" />
                                  Activate
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => handleProviderAction('delete', provider.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}

              {providers.length === 0 && !loading && (
                <div className="text-center py-8">
                  <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No providers configured</h3>
                  <p className="text-gray-600 mb-4">Get started by adding your first LLM provider</p>
                  <Button onClick={() => setShowAddProvider(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Provider
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-gray-500">
                <TrendingUp className="h-12 w-12 mb-4" />
                <p>Analytics dashboard coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Global Settings</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center py-8 text-gray-500">
                <Settings className="h-12 w-12 mb-4" />
                <p>Settings panel coming soon...</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Provider Details Modal */}
      {selectedProvider && (
        <ProviderDetailsModal
          provider={selectedProvider}
          onClose={() => setSelectedProvider(null)}
        />
      )}

      {/* Add Provider Modal */}
      {showAddProvider && (
        <AddProviderModal
          onClose={() => setShowAddProvider(false)}
          onSuccess={() => {
            setShowAddProvider(false);
            loadProviders();
          }}
        />
      )}
    </div>
  );
};

// Provider Details Modal Component
interface ProviderDetailsModalProps {
  provider: LLMProvider;
  onClose: () => void;
}

const ProviderDetailsModal: React.FC<ProviderDetailsModalProps> = ({ provider, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Provider Details</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Name</label>
              <p className="text-sm text-gray-900">{provider.provider_name}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Type</label>
              <p className="text-sm text-gray-900">{PROVIDER_TYPE_LABELS[provider.provider_type]}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Model</label>
              <p className="text-sm text-gray-900">{provider.model_id}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <div className="mt-1">{getStatusBadge(provider.status)}</div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Capabilities</label>
            <div className="flex flex-wrap gap-2">
              {Object.entries(provider.capabilities).map(([key, value]) => (
                value && (
                  <Badge key={key} variant="outline" className="text-xs">
                    {key.replace('_', ' ')}
                  </Badge>
                )
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Input Cost (per 1K tokens)</label>
              <p className="text-sm text-gray-900">${provider.cost_per_1k_input_tokens.toFixed(6)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Output Cost (per 1K tokens)</label>
              <p className="text-sm text-gray-900">${provider.cost_per_1k_output_tokens.toFixed(6)}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate Limit (RPM)</label>
              <p className="text-sm text-gray-900">{provider.rate_limit_rpm}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Rate Limit (TPM)</label>
              <p className="text-sm text-gray-900">{provider.rate_limit_tpm}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Max Tokens</label>
              <p className="text-sm text-gray-900">{provider.max_tokens}</p>
            </div>
          </div>

          {provider.metadata && Object.keys(provider.metadata).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Metadata</label>
              <pre className="text-xs bg-gray-100 p-2 rounded">
                {JSON.stringify(provider.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Add Provider Modal Component
interface AddProviderModalProps {
  onClose: () => void;
  onSuccess: () => void;
}

const AddProviderModal: React.FC<AddProviderModalProps> = ({ onClose, onSuccess }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold">Add LLM Provider</h2>
          <Button variant="ghost" size="sm" onClick={onClose}>
            ×
          </Button>
        </div>

        <div className="text-center py-8 text-gray-500">
          <Plus className="h-12 w-12 mx-auto mb-4" />
          <p>Add provider form coming soon...</p>
          <Button className="mt-4" onClick={onSuccess}>
            Mock Success
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LLMProviderDashboard;
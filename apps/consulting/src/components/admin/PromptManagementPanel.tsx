'use client';

import { 
  Plus, 
  Edit, 
  Copy, 
  Trash2, 
  Search, 
  BarChart3, 
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui/components/alert';
import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui/components/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui/components/dialog';
import { Input } from '@vital/ui/components/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@vital/ui/components/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@vital/ui/components/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui/components/tabs';
import { Textarea } from '@vital/ui/components/textarea';
import usePromptEnhancement from '@/hooks/usePromptEnhancement';
import { PromptStarter } from '@/lib/services/prompt-enhancement-service';
import PromptPerformanceMonitor from '@/lib/services/prompt-performance-monitor';

interface PromptManagementPanelProps {
  className?: string;
}

export function PromptManagementPanel({ className = '' }: PromptManagementPanelProps) {
  const {
    prompts,
    isLoading,
    error,
    loadPrompts,
    createPrompt,
    updatePrompt,
    duplicatePrompt
  } = usePromptEnhancement();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterDomain, setFilterDomain] = useState('all');
  const [filterComplexity, setFilterComplexity] = useState('all');
  const [selectedPrompt, setSelectedPrompt] = useState<PromptStarter | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [performanceData, setPerformanceData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('prompts');

  // Filter prompts based on search and filters
  const filteredPrompts = prompts.filter(prompt => {
    const matchesSearch = prompt.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         prompt.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDomain = filterDomain === 'all' || prompt.domain === filterDomain;
    const matchesComplexity = filterComplexity === 'all' || prompt.complexity_level === filterComplexity;
    
    return matchesSearch && matchesDomain && matchesComplexity;
  });

  // Get unique domains and complexity levels for filters
  const domains = [...new Set(prompts.map(p => p.domain))];
  const complexityLevels = [...new Set(prompts.map(p => p.complexity_level))];

  // Load performance data
  useEffect(() => {
    const loadPerformanceData = async () => {
      const data = await PromptPerformanceMonitor.getDashboardData();
      setPerformanceData(data);
    };
    loadPerformanceData();
  }, []);

  const handleCreatePrompt = async (promptData: Partial<PromptStarter>) => {
    const result = await createPrompt(promptData);
    if (result) {
      setIsCreateDialogOpen(false);
      setSelectedPrompt(null);
    }
  };

  const handleUpdatePrompt = async (promptId: string, updates: Partial<PromptStarter>) => {
    const result = await updatePrompt(promptId, updates);
    if (result) {
      setIsEditDialogOpen(false);
      setSelectedPrompt(null);
    }
  };

  const handleDuplicatePrompt = async (prompt: PromptStarter) => {
    const newName = `${prompt.name}-copy-${Date.now()}`;
    await duplicatePrompt(prompt.id, newName);
  };

  const handleDeletePrompt = async (promptId: string) => {
    // This would typically call a delete function
    console.log('Delete prompt:', promptId);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="prompts">Prompts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-4">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Prompt Management</h2>
              <p className="text-muted-foreground">
                Create, edit, and manage PRISM prompts
              </p>
            </div>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Prompt
            </Button>
          </div>

          {/* Filters */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Search prompts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </div>
                <Select value={filterDomain} onValueChange={setFilterDomain}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by domain" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Domains</SelectItem>
                    {domains.map(domain => (
                      <SelectItem key={domain} value={domain}>
                        {domain.replace('_', ' ').toUpperCase()}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={filterComplexity} onValueChange={setFilterComplexity}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filter by complexity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Levels</SelectItem>
                    {complexityLevels.map(level => (
                      <SelectItem key={level} value={level}>
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Prompts Table */}
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Domain</TableHead>
                    <TableHead>Complexity</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPrompts.map((prompt) => (
                    <TableRow key={prompt.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{prompt.display_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {prompt.description.substring(0, 60)}...
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {prompt.domain.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {prompt.complexity_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={prompt.status === 'active' ? 'default' : 'secondary'}>
                          {prompt.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {/* This would show actual usage data */}
                          <div>0 uses</div>
                          <div className="text-muted-foreground">0% success</div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedPrompt(prompt);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDuplicatePrompt(prompt)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePrompt(prompt.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Prompts</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.totalPrompts || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Active prompts in system
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{performanceData?.totalUsage || 0}</div>
                <p className="text-xs text-muted-foreground">
                  Times used this month
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
                <CheckCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData?.averageSuccessRate?.toFixed(1) || 0}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Average success rate
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Rating</CardTitle>
                <Star className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {performanceData?.averageRating?.toFixed(1) || 0}/5
                </div>
                <p className="text-xs text-muted-foreground">
                  User satisfaction
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Top Performing Prompts</CardTitle>
              <CardDescription>
                Most used prompts this month
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.topPrompts?.map((item: any, index: number) => (
                  <div key={item.prompt?.id} className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-sm font-medium">{index + 1}</span>
                      </div>
                      <div>
                        <div className="font-medium">{item.prompt?.display_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {item.prompt?.domain} • {item.metrics?.usage_count || 0} uses
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {item.metrics?.success_rate?.toFixed(1) || 0}% success
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {item.metrics?.average_rating?.toFixed(1) || 0}/5 rating
                      </div>
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-muted-foreground">
                    No performance data available
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Alerts */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Alerts</CardTitle>
              <CardDescription>
                Performance issues and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {performanceData?.recentAlerts?.map((alert: any, index: number) => (
                  <Alert key={index} variant={alert.severity === 'high' ? 'destructive' : 'default'}>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      <div className="font-medium">{alert.message}</div>
                      <div className="text-sm text-muted-foreground">
                        {alert.prompt_name} • {alert.type.replace('_', ' ')}
                      </div>
                    </AlertDescription>
                  </Alert>
                )) || (
                  <div className="text-center py-4 text-muted-foreground">
                    No alerts at this time
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Usage Analytics</CardTitle>
              <CardDescription>
                Detailed analytics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Analytics dashboard will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Settings</CardTitle>
              <CardDescription>
                Configure prompt system settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                Settings panel will be implemented here
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Prompt Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Create New Prompt</DialogTitle>
            <DialogDescription>
              Create a new PRISM prompt with all required fields
            </DialogDescription>
          </DialogHeader>
          <PromptForm
            onSubmit={handleCreatePrompt}
            onCancel={() => setIsCreateDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Prompt Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Prompt</DialogTitle>
            <DialogDescription>
              Update the selected prompt
            </DialogDescription>
          </DialogHeader>
          <PromptForm
            prompt={selectedPrompt}
            onSubmit={(data) => selectedPrompt && handleUpdatePrompt(selectedPrompt.id, data)}
            onCancel={() => setIsEditDialogOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prompt Form Component
function PromptForm({ 
  prompt, 
  onSubmit, 
  onCancel 
}: { 
  prompt?: PromptStarter | null; 
  onSubmit: (data: Partial<PromptStarter>) => void; 
  onCancel: () => void; 
}) {
  const [formData, setFormData] = useState({
    name: prompt?.name || '',
    display_name: prompt?.display_name || '',
    description: prompt?.description || '',
    domain: prompt?.domain || '',
    complexity_level: prompt?.complexity_level || 'simple',
    system_prompt: prompt?.system_prompt || '',
    user_prompt_template: prompt?.user_prompt_template || '',
    prompt_starter: prompt?.prompt_starter || '',
    compliance_tags: prompt?.compliance_tags || [],
    estimated_tokens: prompt?.estimated_tokens || 1000
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="prompt-name"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Display Name</label>
          <Input
            value={formData.display_name}
            onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
            placeholder="Prompt Display Name"
            required
          />
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">Description</label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          placeholder="Describe what this prompt does..."
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Domain</label>
          <Input
            value={formData.domain}
            onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
            placeholder="regulatory_affairs"
            required
          />
        </div>
        <div>
          <label className="text-sm font-medium">Complexity Level</label>
          <Select
            value={formData.complexity_level}
            onValueChange={(value) => setFormData({ ...formData, complexity_level: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="simple">Simple</SelectItem>
              <SelectItem value="moderate">Moderate</SelectItem>
              <SelectItem value="complex">Complex</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium">System Prompt</label>
        <Textarea
          value={formData.system_prompt}
          onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
          placeholder="You are a..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">User Prompt Template</label>
        <Textarea
          value={formData.user_prompt_template}
          onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
          placeholder="Create a {document_type} for {product}..."
          className="min-h-[100px]"
          required
        />
      </div>

      <div>
        <label className="text-sm font-medium">Prompt Starter</label>
        <Textarea
          value={formData.prompt_starter}
          onChange={(e) => setFormData({ ...formData, prompt_starter: e.target.value })}
          placeholder="Create a regulatory document for {product_name}..."
          className="min-h-[80px]"
          required
        />
      </div>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {prompt ? 'Update' : 'Create'} Prompt
        </Button>
      </div>
    </form>
  );
}

export default PromptManagementPanel;

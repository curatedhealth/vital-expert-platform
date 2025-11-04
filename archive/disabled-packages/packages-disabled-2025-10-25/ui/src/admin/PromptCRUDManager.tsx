'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Copy, 
  Search, 
  Filter, 
  Download, 
  Upload,
  Eye,
  Save,
  X,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  FileText,
  Settings,
  BarChart3
} from 'lucide-react';

interface Prompt {
  id: string;
  name: string;
  display_name: string;
  description: string;
  domain: string;
  complexity_level: string;
  system_prompt: string;
  user_prompt_template: string;
  prompt_starter: string;
  status: string;
  suite?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
  tags?: string[];
  compliance_tags?: string[];
  estimated_tokens?: number;
  model_requirements?: any;
  target_users?: string[];
  use_cases?: string[];
  regulatory_requirements?: string[];
  customization_guide?: string;
  quality_assurance?: string;
}

interface PromptFormData {
  name: string;
  display_name: string;
  description: string;
  domain: string;
  complexity_level: string;
  system_prompt: string;
  user_prompt_template: string;
  prompt_starter: string;
  tags: string[];
  compliance_tags: string[];
  estimated_tokens: number;
  target_users: string[];
  use_cases: string[];
  regulatory_requirements: string[];
  customization_guide: string;
  quality_assurance: string;
}

interface PromptCRUDManagerProps {
  className?: string;
}

const DOMAINS = [
  'regulatory_affairs',
  'clinical_research',
  'market_access',
  'digital_health',
  'data_analytics',
  'medical_writing',
  'pharmacovigilance',
  'clinical_validation',
  'project_management',
  'commercial',
  'medical_affairs'
];

const COMPLEXITY_LEVELS = ['simple', 'moderate', 'complex'];

const PRISM_SUITES = [
  'RULES™',
  'TRIALS™',
  'GUARD™',
  'VALUE™',
  'BRIDGE™',
  'PROOF™',
  'CRAFT™',
  'SCOUT™',
  'PROJECT™'
];

export function PromptCRUDManager({ className = '' }: PromptCRUDManagerProps) {
  const [prompts, setPrompts] = useState<Prompt[]>([]);
  const [filteredPrompts, setFilteredPrompts] = useState<Prompt[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [domainFilter, setDomainFilter] = useState('all');
  const [suiteFilter, setSuiteFilter] = useState('all');
  const [complexityFilter, setComplexityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  
  // Dialog states
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedPrompt, setSelectedPrompt] = useState<Prompt | null>(null);
  
  // Form data
  const [formData, setFormData] = useState<PromptFormData>({
    name: '',
    display_name: '',
    description: '',
    domain: '',
    complexity_level: 'simple',
    system_prompt: '',
    user_prompt_template: '',
    prompt_starter: '',
    tags: [],
    compliance_tags: [],
    estimated_tokens: 1000,
    target_users: ['healthcare_professionals'],
    use_cases: [],
    regulatory_requirements: [],
    customization_guide: '',
    quality_assurance: ''
  });

  // Load prompts
  const loadPrompts = async (page = 1) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        ...(searchTerm && { search: searchTerm }),
        ...(domainFilter !== 'all' && { domain: domainFilter }),
        ...(suiteFilter !== 'all' && { suite: suiteFilter }),
        ...(complexityFilter !== 'all' && { complexity: complexityFilter }),
        ...(statusFilter !== 'all' && { status: statusFilter })
      });

      const response = await fetch(`/api/prompts-crud?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load prompts');
      }

      setPrompts(data.prompts || []);
      setFilteredPrompts(data.prompts || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalCount(data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load prompts');
    } finally {
      setIsLoading(false);
    }
  };

  // Create prompt
  const createPrompt = async () => {
    try {
      const response = await fetch('/api/prompts-crud', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create prompt');
      }

      setSuccess('Prompt created successfully');
      setIsCreateDialogOpen(false);
      resetForm();
      loadPrompts(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create prompt');
    }
  };

  // Update prompt
  const updatePrompt = async () => {
    if (!selectedPrompt) return;

    try {
      const response = await fetch('/api/prompts-crud', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedPrompt.id,
          ...formData
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to update prompt');
      }

      setSuccess('Prompt updated successfully');
      setIsEditDialogOpen(false);
      setSelectedPrompt(null);
      resetForm();
      loadPrompts(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update prompt');
    }
  };

  // Delete prompt
  const deletePrompt = async (id: string) => {
    if (!confirm('Are you sure you want to delete this prompt? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/prompts-crud?id=${id}`, {
        method: 'DELETE'
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to delete prompt');
      }

      setSuccess('Prompt deleted successfully');
      loadPrompts(currentPage);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete prompt');
    }
  };

  // Duplicate prompt
  const duplicatePrompt = async (prompt: Prompt) => {
    const duplicatedData = {
      ...formData,
      name: `${prompt.name}-copy-${Date.now()}`,
      display_name: `${prompt.display_name} (Copy)`,
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template,
      prompt_starter: prompt.prompt_starter,
      domain: prompt.domain,
      complexity_level: prompt.complexity_level,
      tags: prompt.tags || [],
      compliance_tags: prompt.compliance_tags || [],
      estimated_tokens: prompt.estimated_tokens || 1000,
      target_users: prompt.target_users || ['healthcare_professionals'],
      use_cases: prompt.use_cases || [],
      regulatory_requirements: prompt.regulatory_requirements || [],
      customization_guide: prompt.customization_guide || '',
      quality_assurance: prompt.quality_assurance || ''
    };

    setFormData(duplicatedData);
    setIsCreateDialogOpen(true);
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      name: '',
      display_name: '',
      description: '',
      domain: '',
      complexity_level: 'simple',
      system_prompt: '',
      user_prompt_template: '',
      prompt_starter: '',
      tags: [],
      compliance_tags: [],
      estimated_tokens: 1000,
      target_users: ['healthcare_professionals'],
      use_cases: [],
      regulatory_requirements: [],
      customization_guide: '',
      quality_assurance: ''
    });
  };

  // Open edit dialog
  const openEditDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setFormData({
      name: prompt.name,
      display_name: prompt.display_name,
      description: prompt.description,
      domain: prompt.domain,
      complexity_level: prompt.complexity_level,
      system_prompt: prompt.system_prompt,
      user_prompt_template: prompt.user_prompt_template,
      prompt_starter: prompt.prompt_starter,
      tags: prompt.tags || [],
      compliance_tags: prompt.compliance_tags || [],
      estimated_tokens: prompt.estimated_tokens || 1000,
      target_users: prompt.target_users || ['healthcare_professionals'],
      use_cases: prompt.use_cases || [],
      regulatory_requirements: prompt.regulatory_requirements || [],
      customization_guide: prompt.customization_guide || '',
      quality_assurance: prompt.quality_assurance || ''
    });
    setIsEditDialogOpen(true);
  };

  // Open view dialog
  const openViewDialog = (prompt: Prompt) => {
    setSelectedPrompt(prompt);
    setIsViewDialogOpen(true);
  };

  // Load prompts on mount and when filters change
  useEffect(() => {
    loadPrompts(1);
  }, [searchTerm, domainFilter, suiteFilter, complexityFilter, statusFilter]);

  // Clear messages after 5 seconds
  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        setSuccess(null);
        setError(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [success, error]);

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Prompt Management</h2>
          <p className="text-muted-foreground">
            Create, edit, and manage PRISM prompts and templates
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => loadPrompts(currentPage)} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Create Prompt
          </Button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <label className="text-sm font-medium">Search</label>
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
            
            <div>
              <label className="text-sm font-medium">Domain</label>
              <Select value={domainFilter} onValueChange={setDomainFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Domains" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Domains</SelectItem>
                  {DOMAINS.map(domain => (
                    <SelectItem key={domain} value={domain}>
                      {domain.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">PRISM Suite</label>
              <Select value={suiteFilter} onValueChange={setSuiteFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Suites" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suites</SelectItem>
                  {PRISM_SUITES.map(suite => (
                    <SelectItem key={suite} value={suite}>
                      {suite}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Complexity</label>
              <Select value={complexityFilter} onValueChange={setComplexityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Levels" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Levels</SelectItem>
                  {COMPLEXITY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Prompts Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Prompts ({totalCount})</CardTitle>
              <CardDescription>
                Manage and organize your prompt library
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Import
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading prompts...</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Domain</TableHead>
                  <TableHead>Suite</TableHead>
                  <TableHead>Complexity</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
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
                      {prompt.suite ? (
                        <Badge variant="default">{prompt.suite}</Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {prompt.complexity_level || 'N/A'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={prompt.status === 'active' ? 'default' : 'secondary'}
                      >
                        {prompt.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(prompt.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openViewDialog(prompt)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(prompt)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => duplicatePrompt(prompt)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deletePrompt(prompt.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Showing {((currentPage - 1) * 20) + 1} to {Math.min(currentPage * 20, totalCount)} of {totalCount} prompts
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPrompts(currentPage - 1)}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => loadPrompts(currentPage + 1)}
              disabled={currentPage === totalPages}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={isCreateDialogOpen || isEditDialogOpen} onOpenChange={(open) => {
        if (!open) {
          setIsCreateDialogOpen(false);
          setIsEditDialogOpen(false);
          setSelectedPrompt(null);
          resetForm();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {isCreateDialogOpen ? 'Create New Prompt' : 'Edit Prompt'}
            </DialogTitle>
            <DialogDescription>
              {isCreateDialogOpen 
                ? 'Create a new PRISM prompt with all required fields'
                : 'Update the selected prompt'
              }
            </DialogDescription>
          </DialogHeader>
          
          <PromptForm
            formData={formData}
            setFormData={setFormData}
            onSubmit={isCreateDialogOpen ? createPrompt : updatePrompt}
            onCancel={() => {
              setIsCreateDialogOpen(false);
              setIsEditDialogOpen(false);
              setSelectedPrompt(null);
              resetForm();
            }}
            isEditing={isEditDialogOpen}
          />
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Prompt Details</DialogTitle>
            <DialogDescription>
              View detailed information about the selected prompt
            </DialogDescription>
          </DialogHeader>
          
          {selectedPrompt && (
            <PromptViewer prompt={selectedPrompt} />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Prompt Form Component
function PromptForm({ 
  formData, 
  setFormData, 
  onSubmit, 
  onCancel, 
  isEditing 
}: {
  formData: PromptFormData;
  setFormData: (data: PromptFormData) => void;
  onSubmit: () => void;
  onCancel: () => void;
  isEditing: boolean;
}) {
  const [activeTab, setActiveTab] = useState('basic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="content">Content</TabsTrigger>
          <TabsTrigger value="metadata">Metadata</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="prompt-name"
                required
              />
            </div>
            <div>
              <label className="text-sm font-medium">Display Name *</label>
              <Input
                value={formData.display_name}
                onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                placeholder="Prompt Display Name"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Description *</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe what this prompt does..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Domain *</label>
              <Select
                value={formData.domain}
                onValueChange={(value) => setFormData({ ...formData, domain: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select domain" />
                </SelectTrigger>
                <SelectContent>
                  {DOMAINS.map(domain => (
                    <SelectItem key={domain} value={domain}>
                      {domain.replace('_', ' ').toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                  {COMPLEXITY_LEVELS.map(level => (
                    <SelectItem key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="content" className="space-y-4">
          <div>
            <label className="text-sm font-medium">System Prompt *</label>
            <Textarea
              value={formData.system_prompt}
              onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
              placeholder="You are a..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">User Prompt Template *</label>
            <Textarea
              value={formData.user_prompt_template}
              onChange={(e) => setFormData({ ...formData, user_prompt_template: e.target.value })}
              placeholder="Create a {document_type} for {product}..."
              className="min-h-[150px]"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium">Prompt Starter</label>
            <Textarea
              value={formData.prompt_starter}
              onChange={(e) => setFormData({ ...formData, prompt_starter: e.target.value })}
              placeholder="Create a regulatory document for {product_name}..."
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>

        <TabsContent value="metadata" className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Estimated Tokens</label>
              <Input
                type="number"
                value={formData.estimated_tokens}
                onChange={(e) => setFormData({ ...formData, estimated_tokens: parseInt(e.target.value) || 1000 })}
                placeholder="1000"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Target Users</label>
              <Input
                value={formData.target_users.join(', ')}
                onChange={(e) => setFormData({ 
                  ...formData, 
                  target_users: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
                })}
                placeholder="healthcare_professionals, regulatory_affairs"
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Use Cases</label>
            <Input
              value={formData.use_cases.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                use_cases: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="protocol_development, regulatory_submission"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Regulatory Requirements</label>
            <Input
              value={formData.regulatory_requirements.join(', ')}
              onChange={(e) => setFormData({ 
                ...formData, 
                regulatory_requirements: e.target.value.split(',').map(s => s.trim()).filter(Boolean)
              })}
              placeholder="FDA, EMA, ICH"
            />
          </div>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <div>
            <label className="text-sm font-medium">Customization Guide</label>
            <Textarea
              value={formData.customization_guide}
              onChange={(e) => setFormData({ ...formData, customization_guide: e.target.value })}
              placeholder="Instructions for customizing this prompt..."
              className="min-h-[100px]"
            />
          </div>

          <div>
            <label className="text-sm font-medium">Quality Assurance</label>
            <Textarea
              value={formData.quality_assurance}
              onChange={(e) => setFormData({ ...formData, quality_assurance: e.target.value })}
              placeholder="Quality checks and validation steps..."
              className="min-h-[100px]"
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {isEditing ? 'Update' : 'Create'} Prompt
        </Button>
      </div>
    </form>
  );
}

// Prompt Viewer Component
function PromptViewer({ prompt }: { prompt: Prompt }) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Name</label>
          <p className="text-sm">{prompt.name}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Display Name</label>
          <p className="text-sm">{prompt.display_name}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">Description</label>
        <p className="text-sm">{prompt.description}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="text-sm font-medium text-muted-foreground">Domain</label>
          <p className="text-sm">{prompt.domain}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Complexity</label>
          <p className="text-sm">{prompt.complexity_level}</p>
        </div>
        <div>
          <label className="text-sm font-medium text-muted-foreground">Status</label>
          <p className="text-sm">{prompt.status}</p>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">System Prompt</label>
        <div className="mt-2 p-4 bg-muted rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{prompt.system_prompt}</pre>
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-muted-foreground">User Prompt Template</label>
        <div className="mt-2 p-4 bg-muted rounded-lg">
          <pre className="text-sm whitespace-pre-wrap">{prompt.user_prompt_template}</pre>
        </div>
      </div>

      {prompt.prompt_starter && (
        <div>
          <label className="text-sm font-medium text-muted-foreground">Prompt Starter</label>
          <div className="mt-2 p-4 bg-muted rounded-lg">
            <pre className="text-sm whitespace-pre-wrap">{prompt.prompt_starter}</pre>
          </div>
        </div>
      )}
    </div>
  );
}

export default PromptCRUDManager;

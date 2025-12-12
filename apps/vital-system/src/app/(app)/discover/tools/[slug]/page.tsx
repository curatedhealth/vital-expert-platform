// Tool Detail Page with CRUD capability
'use client';

import React, { useState, useEffect, use, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  ArrowLeft,
  Wrench,
  Activity,
  Shield,
  Microscope,
  Heart,
  Brain,
  CheckCircle2,
  Code,
  Workflow,
  Pencil,
  Trash2,
  Save,
  X,
  AlertCircle,
  Clock,
  Zap,
  Loader2,
  Copy,
  Check,
  ExternalLink,
  Server,
  Database,
  Cloud,
  Settings,
  FileCode,
} from 'lucide-react';
import type { Tool } from '@/lib/services/tool-registry-service';

// Tool categories with icons and colors
const TOOL_CATEGORIES: Record<string, { icon: React.ElementType; color: string; description: string }> = {
  'Healthcare': {
    icon: Heart,
    color: 'bg-red-100 text-red-800 border-red-200',
    description: 'Healthcare and medical tools'
  },
  'Healthcare/FHIR': {
    icon: Activity,
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    description: 'FHIR interoperability tools'
  },
  'Healthcare/Clinical NLP': {
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 border-purple-200',
    description: 'Clinical natural language processing'
  },
  'Healthcare/De-identification': {
    icon: Shield,
    color: 'bg-green-100 text-green-800 border-green-200',
    description: 'PHI de-identification tools'
  },
  'Research': {
    icon: Microscope,
    color: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    description: 'Research and analysis tools'
  },
  'General': {
    icon: Wrench,
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    description: 'General purpose tools'
  },
  'AI': {
    icon: Brain,
    color: 'bg-violet-100 text-violet-800 border-violet-200',
    description: 'AI and machine learning tools'
  },
  'Database': {
    icon: Database,
    color: 'bg-amber-100 text-amber-800 border-amber-200',
    description: 'Database and data management'
  },
  'API': {
    icon: Cloud,
    color: 'bg-sky-100 text-sky-800 border-sky-200',
    description: 'API integration tools'
  },
};

// Lifecycle badges
const LIFECYCLE_BADGES: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  development: { color: 'bg-gray-100 text-gray-800', icon: Settings, label: 'Development' },
  testing: { color: 'bg-yellow-100 text-yellow-800', icon: AlertCircle, label: 'Testing' },
  staging: { color: 'bg-blue-100 text-blue-800', icon: Clock, label: 'Staging' },
  production: { color: 'bg-green-100 text-green-800', icon: CheckCircle2, label: 'Production' },
  deprecated: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Deprecated' },
};

// Tool type badges
const TOOL_TYPE_BADGES: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  ai_function: { color: 'bg-purple-100 text-purple-800', icon: Brain, label: 'AI Function' },
  software_reference: { color: 'bg-blue-100 text-blue-800', icon: Code, label: 'Software' },
  database: { color: 'bg-amber-100 text-amber-800', icon: Database, label: 'Database' },
  saas: { color: 'bg-green-100 text-green-800', icon: Cloud, label: 'SaaS' },
  api: { color: 'bg-cyan-100 text-cyan-800', icon: Server, label: 'API' },
  ai_framework: { color: 'bg-violet-100 text-violet-800', icon: Workflow, label: 'AI Framework' },
};

// Implementation type badges
const IMPLEMENTATION_BADGES: Record<string, { color: string; icon: React.ElementType; label: string }> = {
  custom: { color: 'bg-gray-100 text-gray-800', icon: Settings, label: 'Custom' },
  langchain_tool: { color: 'bg-orange-100 text-orange-800', icon: Zap, label: 'LangChain' },
  api: { color: 'bg-blue-100 text-blue-800', icon: Cloud, label: 'API' },
  function: { color: 'bg-green-100 text-green-800', icon: FileCode, label: 'Function' },
};

interface PageProps {
  params: Promise<{ slug: string }>;
}

// Inner component that uses useSearchParams
function ToolDetailContent({ slug }: { slug: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  // Check if edit mode is requested via query param
  const editParam = searchParams.get('edit');
  const startInEditMode = editParam === 'true' && isAdmin;

  const [tool, setTool] = useState<Tool | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<Tool>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadTool();
  }, [slug]);

  // Enter edit mode after tool is loaded if query param is set
  useEffect(() => {
    if (tool && startInEditMode && !isEditing) {
      setIsEditing(true);
    }
  }, [tool, startInEditMode]);

  const loadTool = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/tools-crud/${slug}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Tool not found');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load tool');
        }
        return;
      }

      const data = await response.json();
      setTool(data.tool);
      setEditForm(data.tool);
    } catch (err) {
      console.error('Error loading tool:', err);
      setError('Failed to load tool');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!tool?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/tools-crud/${tool.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update tool');
      }

      const data = await response.json();
      setTool(data.tool);
      setEditForm(data.tool);
      setIsEditing(false);

      // If code changed, redirect to new URL
      if (data.tool.code !== slug) {
        router.push(`/discover/tools/${data.tool.code}`);
      }
    } catch (err: unknown) {
      console.error('Error saving tool:', err);
      alert(`Failed to save: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!tool?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/tools-crud/${tool.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete tool');
      }

      // Redirect to tools list
      router.push('/discover/tools');
    } catch (err: unknown) {
      console.error('Error deleting tool:', err);
      alert(`Failed to delete: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleCopyCode = () => {
    if (tool?.code) {
      navigator.clipboard.writeText(tool.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = () => {
    setEditForm(tool || {});
    setIsEditing(false);
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={Wrench}
          title="Loading Tool..."
          description="Please wait"
        />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <PageHeader
          icon={AlertCircle}
          title="Error"
          description={error || 'Tool not found'}
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">{error || 'Tool not found'}</p>
            <Button onClick={() => router.push('/discover/tools')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const categoryConfig = tool.category ? TOOL_CATEGORIES[tool.category] : null;
  const CategoryIcon = categoryConfig?.icon || Wrench;
  const lifecycleBadge = tool.lifecycle_stage ? LIFECYCLE_BADGES[tool.lifecycle_stage] : LIFECYCLE_BADGES.development;
  const LifecycleIcon = lifecycleBadge?.icon || Clock;
  const toolTypeBadge = tool.tool_type ? TOOL_TYPE_BADGES[tool.tool_type] : TOOL_TYPE_BADGES.ai_function;
  const ToolTypeIcon = toolTypeBadge?.icon || Wrench;
  const implBadge = tool.implementation_type ? IMPLEMENTATION_BADGES[tool.implementation_type] : IMPLEMENTATION_BADGES.function;
  const ImplIcon = implBadge?.icon || Settings;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Discover', href: '/discover' },
            { label: 'Tools', href: '/discover/tools' },
            { label: tool.name },
          ]}
        />
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={() => router.push('/discover/tools')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-8 w-8 text-gray-600" />
            <div>
              <h1 className="text-2xl font-bold">{tool.name}</h1>
              <div className="flex items-center gap-2 text-sm text-gray-500">
                <span className="font-mono">{tool.code}</span>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleCopyCode}>
                  {copied ? <Check className="h-3 w-3 text-green-500" /> : <Copy className="h-3 w-3" />}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setIsEditing(true)}>
              <Pencil className="h-4 w-4 mr-2" />
              Edit
            </Button>
            <Button variant="destructive" onClick={() => setShowDeleteConfirm(true)}>
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          </div>
        )}

        {isEditing && (
          <div className="flex gap-2">
            <Button variant="outline" onClick={handleCancel} disabled={saving}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </Button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700 dark:text-purple-300">
                Admin mode: You can edit and delete this tool
              </span>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge className={tool.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}>
              {tool.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {tool.category && (
              <Badge className={categoryConfig?.color || 'bg-gray-100 text-gray-800'}>
                <CategoryIcon className="h-3 w-3 mr-1" />
                {tool.category}
              </Badge>
            )}
            <Badge className={lifecycleBadge.color}>
              <LifecycleIcon className="h-3 w-3 mr-1" />
              {lifecycleBadge.label}
            </Badge>
            <Badge className={toolTypeBadge.color}>
              <ToolTypeIcon className="h-3 w-3 mr-1" />
              {toolTypeBadge.label}
            </Badge>
            {tool.langgraph_compatible && (
              <Badge className="bg-orange-100 text-orange-800">
                <Zap className="h-3 w-3 mr-1" />
                LangGraph
              </Badge>
            )}
          </div>

          {/* Main Content */}
          {isEditing ? (
            // Edit Form
            <Card>
              <CardHeader>
                <CardTitle>Edit Tool</CardTitle>
                <CardDescription>Update the tool details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Tool name"
                  />
                </div>

                {/* Code */}
                <div className="space-y-2">
                  <Label htmlFor="code">Code</Label>
                  <Input
                    id="code"
                    value={editForm.code || ''}
                    onChange={(e) => setEditForm({ ...editForm, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_') })}
                    placeholder="tool_code"
                  />
                  <p className="text-xs text-gray-500">Used as identifier. Lowercase letters, numbers, underscores, and hyphens only.</p>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="tool_description">Description</Label>
                  <Textarea
                    id="tool_description"
                    value={editForm.tool_description || editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, tool_description: e.target.value })}
                    placeholder="Describe what this tool does..."
                    rows={4}
                  />
                </div>

                {/* LLM Description */}
                <div className="space-y-2">
                  <Label htmlFor="llm_description">LLM Description (Short)</Label>
                  <Input
                    id="llm_description"
                    value={editForm.llm_description || ''}
                    onChange={(e) => setEditForm({ ...editForm, llm_description: e.target.value })}
                    placeholder="Short description for AI agent selection"
                  />
                  <p className="text-xs text-gray-500">Brief description used by AI agents to determine when to use this tool.</p>
                </div>

                {/* Category */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select
                    value={editForm.category || ''}
                    onValueChange={(value) => setEditForm({ ...editForm, category: value })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.keys(TOOL_CATEGORIES).map((cat) => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Tool Type */}
                <div className="space-y-2">
                  <Label htmlFor="tool_type">Tool Type</Label>
                  <Select
                    value={editForm.tool_type || 'ai_function'}
                    onValueChange={(value) => setEditForm({ ...editForm, tool_type: value as Tool['tool_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ai_function">AI Function</SelectItem>
                      <SelectItem value="software_reference">Software Reference</SelectItem>
                      <SelectItem value="database">Database</SelectItem>
                      <SelectItem value="saas">SaaS</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="ai_framework">AI Framework</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Implementation Type */}
                <div className="space-y-2">
                  <Label htmlFor="implementation_type">Implementation Type</Label>
                  <Select
                    value={editForm.implementation_type || 'function'}
                    onValueChange={(value) => setEditForm({ ...editForm, implementation_type: value as Tool['implementation_type'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="custom">Custom</SelectItem>
                      <SelectItem value="langchain_tool">LangChain Tool</SelectItem>
                      <SelectItem value="api">API</SelectItem>
                      <SelectItem value="function">Function</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lifecycle Stage */}
                <div className="space-y-2">
                  <Label htmlFor="lifecycle_stage">Lifecycle Stage</Label>
                  <Select
                    value={editForm.lifecycle_stage || 'development'}
                    onValueChange={(value) => setEditForm({ ...editForm, lifecycle_stage: value as Tool['lifecycle_stage'] })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="development">Development</SelectItem>
                      <SelectItem value="testing">Testing</SelectItem>
                      <SelectItem value="staging">Staging</SelectItem>
                      <SelectItem value="production">Production</SelectItem>
                      <SelectItem value="deprecated">Deprecated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Implementation Path */}
                <div className="space-y-2">
                  <Label htmlFor="implementation_path">Implementation Path</Label>
                  <Input
                    id="implementation_path"
                    value={editForm.implementation_path || ''}
                    onChange={(e) => setEditForm({ ...editForm, implementation_path: e.target.value })}
                    placeholder="Path to implementation file or module"
                  />
                </div>

                {/* Documentation URL */}
                <div className="space-y-2">
                  <Label htmlFor="documentation_url">Documentation URL</Label>
                  <Input
                    id="documentation_url"
                    value={editForm.documentation_url || ''}
                    onChange={(e) => setEditForm({ ...editForm, documentation_url: e.target.value })}
                    placeholder="https://docs.example.com/tool"
                  />
                </div>

                {/* Rate Limit */}
                <div className="space-y-2">
                  <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
                  <Input
                    id="rate_limit"
                    type="number"
                    value={editForm.rate_limit_per_minute || ''}
                    onChange={(e) => setEditForm({ ...editForm, rate_limit_per_minute: e.target.value ? parseInt(e.target.value) : null })}
                    placeholder="60"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Active Status</Label>
                      <p className="text-sm text-gray-500">Enable or disable this tool</p>
                    </div>
                    <Switch
                      checked={editForm.is_active ?? true}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>LangGraph Compatible</Label>
                      <p className="text-sm text-gray-500">Can be used in LangGraph workflows</p>
                    </div>
                    <Switch
                      checked={editForm.langgraph_compatible ?? false}
                      onCheckedChange={(checked) => setEditForm({ ...editForm, langgraph_compatible: checked })}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            // View Mode
            <>
              <Card>
                <CardHeader>
                  <CardTitle>Description</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {tool.tool_description || tool.description || 'No description provided.'}
                  </p>
                  {tool.llm_description && (
                    <div className="pt-4 border-t">
                      <Label className="text-gray-500 text-xs">LLM Description</Label>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {tool.llm_description}
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Implementation Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-500">Tool Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={toolTypeBadge.color}>
                          <ToolTypeIcon className="h-3 w-3 mr-1" />
                          {toolTypeBadge.label}
                        </Badge>
                      </div>
                    </div>
                    <div>
                      <Label className="text-gray-500">Implementation Type</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={implBadge.color}>
                          <ImplIcon className="h-3 w-3 mr-1" />
                          {implBadge.label}
                        </Badge>
                      </div>
                    </div>
                    {tool.implementation_path && (
                      <div>
                        <Label className="text-gray-500">Implementation Path</Label>
                        <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                          {tool.implementation_path}
                        </p>
                      </div>
                    )}
                    {tool.function_name && (
                      <div>
                        <Label className="text-gray-500">Function Name</Label>
                        <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                          {tool.function_name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Configuration</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label className="text-gray-500">Lifecycle Stage</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={lifecycleBadge.color}>
                          <LifecycleIcon className="h-3 w-3 mr-1" />
                          {lifecycleBadge.label}
                        </Badge>
                      </div>
                    </div>
                    {tool.rate_limit_per_minute && (
                      <div>
                        <Label className="text-gray-500">Rate Limit</Label>
                        <p className="font-medium">{tool.rate_limit_per_minute} requests/min</p>
                      </div>
                    )}
                    {tool.cost_per_execution && (
                      <div>
                        <Label className="text-gray-500">Cost per Execution</Label>
                        <p className="font-medium">${tool.cost_per_execution.toFixed(4)}</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-gray-500">LangGraph Compatible</Label>
                      <p className="font-medium">{tool.langgraph_compatible ? 'Yes' : 'No'}</p>
                    </div>
                    {tool.langgraph_node_name && (
                      <div>
                        <Label className="text-gray-500">LangGraph Node Name</Label>
                        <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1">
                          {tool.langgraph_node_name}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* API Details */}
              {(tool.api_endpoint || tool.input_schema || tool.output_schema) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">API Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {tool.api_endpoint && (
                      <div>
                        <Label className="text-gray-500">API Endpoint</Label>
                        <p className="font-mono text-sm bg-gray-100 dark:bg-gray-800 p-2 rounded mt-1 break-all">
                          {tool.api_endpoint}
                        </p>
                      </div>
                    )}
                    {tool.input_schema && (
                      <div>
                        <Label className="text-gray-500">Input Schema</Label>
                        <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(tool.input_schema, null, 2)}
                        </pre>
                      </div>
                    )}
                    {tool.output_schema && (
                      <div>
                        <Label className="text-gray-500">Output Schema</Label>
                        <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded mt-1 overflow-x-auto">
                          {JSON.stringify(tool.output_schema, null, 2)}
                        </pre>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Usage Statistics */}
              {(tool.total_calls || tool.success_rate !== undefined) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Usage Statistics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {tool.total_calls !== undefined && (
                        <div>
                          <Label className="text-gray-500">Total Calls</Label>
                          <p className="text-2xl font-bold">{tool.total_calls.toLocaleString()}</p>
                        </div>
                      )}
                      {tool.success_rate !== undefined && tool.success_rate !== null && (
                        <div>
                          <Label className="text-gray-500">Success Rate</Label>
                          <p className="text-2xl font-bold">{(tool.success_rate * 100).toFixed(1)}%</p>
                        </div>
                      )}
                      {tool.avg_response_time_ms !== undefined && tool.avg_response_time_ms !== null && (
                        <div>
                          <Label className="text-gray-500">Avg Response Time</Label>
                          <p className="text-2xl font-bold">{tool.avg_response_time_ms.toFixed(0)}ms</p>
                        </div>
                      )}
                      {tool.avg_confidence_score !== undefined && tool.avg_confidence_score !== null && (
                        <div>
                          <Label className="text-gray-500">Avg Confidence</Label>
                          <p className="text-2xl font-bold">{(tool.avg_confidence_score * 100).toFixed(1)}%</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Documentation Link */}
              {tool.documentation_url && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Documentation</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <a
                      href={tool.documentation_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      <ExternalLink className="h-4 w-4" />
                      {tool.documentation_url}
                    </a>
                  </CardContent>
                </Card>
              )}

              {/* Metadata */}
              {tool.metadata && Object.keys(tool.metadata).length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Metadata</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <pre className="text-sm bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-x-auto">
                      {JSON.stringify(tool.metadata, null, 2)}
                    </pre>
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Timestamps</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <Label className="text-gray-500">Created</Label>
                      <p>{tool.created_at ? new Date(tool.created_at).toLocaleString() : 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="text-gray-500">Last Updated</Label>
                      <p>{tool.updated_at ? new Date(tool.updated_at).toLocaleString() : 'N/A'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Tool
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete &quot;{tool.name}&quot;? This action cannot be undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowDeleteConfirm(false)} disabled={saving}>
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Trash2 className="h-4 w-4 mr-2" />}
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Loading fallback for Suspense
function ToolDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="px-6 pt-4">
        <div className="h-6 w-64 bg-gray-200 animate-pulse rounded" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-gray-200 animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-gray-200 animate-pulse rounded" />
            <div>
              <div className="h-6 w-48 bg-gray-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-32 bg-gray-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    </div>
  );
}

// Page component that wraps content in Suspense for useSearchParams
export default function ToolDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { slug } = resolvedParams;

  return (
    <Suspense fallback={<ToolDetailLoading />}>
      <ToolDetailContent slug={slug} />
    </Suspense>
  );
}

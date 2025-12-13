/**
 * Tool Detail Page - Brand Guidelines v6.0
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: white with stone-200 border
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * Refactored: December 2025
 * - Extracted useToolDetail hook
 * - Moved badge constants to shared file
 */
'use client';

import React, { use, Suspense } from 'react';
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
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useToolDetail } from '@/features/discover/hooks';
import {
  TOOL_CATEGORIES,
  LIFECYCLE_BADGES,
  TOOL_TYPE_BADGES,
  IMPLEMENTATION_BADGES,
} from '@/features/discover/constants/tool-badges';
import {
  ArrowLeft,
  Wrench,
  Shield,
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
} from 'lucide-react';
import type { Tool } from '@/lib/services/tool-registry-service';

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

  // Use the extracted hook
  const {
    tool,
    loading,
    error,
    isEditing,
    editForm,
    saving,
    showDeleteConfirm,
    copied,
    setIsEditing,
    setEditForm,
    handleSave,
    handleDelete,
    handleCancel,
    handleCopyCode,
    setShowDeleteConfirm,
  } = useToolDetail(slug, startInEditMode);

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading tool...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !tool) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Error</h2>
            <p className="text-stone-600 mb-4">{error || 'Tool not found'}</p>
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
  const lifecycleBadge = tool.lifecycle_stage
    ? LIFECYCLE_BADGES[tool.lifecycle_stage]
    : LIFECYCLE_BADGES.development;
  const LifecycleIcon = lifecycleBadge?.icon || Clock;
  const toolTypeBadge = tool.tool_type
    ? TOOL_TYPE_BADGES[tool.tool_type]
    : TOOL_TYPE_BADGES.ai_function;
  const ToolTypeIcon = toolTypeBadge?.icon || Wrench;
  const implBadge = tool.implementation_type
    ? IMPLEMENTATION_BADGES[tool.implementation_type]
    : IMPLEMENTATION_BADGES.function;
  const ImplIcon = implBadge?.icon || Clock;

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
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
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.push('/discover/tools')}
            className="text-stone-600 hover:text-stone-800"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="flex items-center gap-3">
            <CategoryIcon className="h-8 w-8 text-stone-600" />
            <div>
              <h1 className="text-2xl font-bold text-stone-800">{tool.name}</h1>
              <div className="flex items-center gap-2 text-sm text-stone-500">
                <span className="font-mono">{tool.code}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={handleCopyCode}
                >
                  {copied ? (
                    <Check className="h-3 w-3 text-emerald-500" />
                  ) : (
                    <Copy className="h-3 w-3" />
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {isAdmin && !isEditing && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => setIsEditing(true)}
              className="border-stone-300 hover:border-purple-400"
            >
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
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={saving}
              className="border-stone-300"
            >
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="bg-purple-600 hover:bg-purple-700 text-white"
            >
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
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Admin mode: You can edit and delete this tool
              </span>
            </div>
          )}

          {/* Status Badges */}
          <div className="flex flex-wrap gap-3">
            <Badge
              className={
                tool.is_active
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-stone-100 text-stone-800'
              }
            >
              {tool.is_active ? 'Active' : 'Inactive'}
            </Badge>
            {tool.category && (
              <Badge className={categoryConfig?.color || 'bg-stone-100 text-stone-800'}>
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
            <ToolEditForm
              editForm={editForm}
              setEditForm={setEditForm}
            />
          ) : (
            <ToolViewMode tool={tool} />
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4 border-stone-200">
            <CardHeader>
              <CardTitle className="text-rose-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Tool
              </CardTitle>
              <CardDescription className="text-stone-600">
                Are you sure you want to delete &quot;{tool.name}&quot;? This action cannot be
                undone.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={saving}
                className="border-stone-300"
              >
                Cancel
              </Button>
              <Button variant="destructive" onClick={handleDelete} disabled={saving}>
                {saving ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}

// Edit Form Component
function ToolEditForm({
  editForm,
  setEditForm,
}: {
  editForm: Partial<Tool>;
  setEditForm: (form: Partial<Tool>) => void;
}) {
  return (
    <Card className="border border-stone-200 bg-white">
      <CardHeader>
        <CardTitle className="text-stone-800">Edit Tool</CardTitle>
        <CardDescription className="text-stone-500">Update the tool details below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-stone-700">Name</Label>
          <Input
            id="name"
            value={editForm.name || ''}
            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
            placeholder="Tool name"
            className="border-stone-300 focus:border-purple-400"
          />
        </div>

        {/* Code */}
        <div className="space-y-2">
          <Label htmlFor="code" className="text-stone-700">Code</Label>
          <Input
            id="code"
            value={editForm.code || ''}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_'),
              })
            }
            placeholder="tool_code"
            className="border-stone-300 focus:border-purple-400"
          />
          <p className="text-xs text-stone-500">
            Used as identifier. Lowercase letters, numbers, underscores, and hyphens only.
          </p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label htmlFor="tool_description" className="text-stone-700">Description</Label>
          <Textarea
            id="tool_description"
            value={editForm.tool_description || editForm.description || ''}
            onChange={(e) => setEditForm({ ...editForm, tool_description: e.target.value })}
            placeholder="Describe what this tool does..."
            rows={4}
            className="border-stone-300 focus:border-purple-400"
          />
        </div>

        {/* LLM Description */}
        <div className="space-y-2">
          <Label htmlFor="llm_description" className="text-stone-700">LLM Description (Short)</Label>
          <Input
            id="llm_description"
            value={editForm.llm_description || ''}
            onChange={(e) => setEditForm({ ...editForm, llm_description: e.target.value })}
            placeholder="Short description for AI agent selection"
            className="border-stone-300 focus:border-purple-400"
          />
          <p className="text-xs text-stone-500">
            Brief description used by AI agents to determine when to use this tool.
          </p>
        </div>

        {/* Category */}
        <div className="space-y-2">
          <Label htmlFor="category" className="text-stone-700">Category</Label>
          <Select
            value={editForm.category || ''}
            onValueChange={(value) => setEditForm({ ...editForm, category: value })}
          >
            <SelectTrigger className="border-stone-300">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {Object.keys(TOOL_CATEGORIES).map((cat) => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Tool Type */}
        <div className="space-y-2">
          <Label htmlFor="tool_type" className="text-stone-700">Tool Type</Label>
          <Select
            value={editForm.tool_type || 'ai_function'}
            onValueChange={(value) => setEditForm({ ...editForm, tool_type: value as Tool['tool_type'] })}
          >
            <SelectTrigger className="border-stone-300">
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
          <Label htmlFor="implementation_type" className="text-stone-700">Implementation Type</Label>
          <Select
            value={editForm.implementation_type || 'function'}
            onValueChange={(value) =>
              setEditForm({ ...editForm, implementation_type: value as Tool['implementation_type'] })
            }
          >
            <SelectTrigger className="border-stone-300">
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
          <Label htmlFor="lifecycle_stage" className="text-stone-700">Lifecycle Stage</Label>
          <Select
            value={editForm.lifecycle_stage || 'development'}
            onValueChange={(value) =>
              setEditForm({ ...editForm, lifecycle_stage: value as Tool['lifecycle_stage'] })
            }
          >
            <SelectTrigger className="border-stone-300">
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
          <Label htmlFor="implementation_path" className="text-stone-700">Implementation Path</Label>
          <Input
            id="implementation_path"
            value={editForm.implementation_path || ''}
            onChange={(e) => setEditForm({ ...editForm, implementation_path: e.target.value })}
            placeholder="Path to implementation file or module"
            className="border-stone-300 focus:border-purple-400"
          />
        </div>

        {/* Documentation URL */}
        <div className="space-y-2">
          <Label htmlFor="documentation_url" className="text-stone-700">Documentation URL</Label>
          <Input
            id="documentation_url"
            value={editForm.documentation_url || ''}
            onChange={(e) => setEditForm({ ...editForm, documentation_url: e.target.value })}
            placeholder="https://docs.example.com/tool"
            className="border-stone-300 focus:border-purple-400"
          />
        </div>

        {/* Rate Limit */}
        <div className="space-y-2">
          <Label htmlFor="rate_limit" className="text-stone-700">Rate Limit (per minute)</Label>
          <Input
            id="rate_limit"
            type="number"
            value={editForm.rate_limit_per_minute || ''}
            onChange={(e) =>
              setEditForm({
                ...editForm,
                rate_limit_per_minute: e.target.value ? parseInt(e.target.value) : null,
              })
            }
            placeholder="60"
            className="border-stone-300 focus:border-purple-400"
          />
        </div>

        {/* Toggles */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-stone-700">Active Status</Label>
              <p className="text-sm text-stone-500">Enable or disable this tool</p>
            </div>
            <Switch
              checked={editForm.is_active ?? true}
              onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-stone-700">LangGraph Compatible</Label>
              <p className="text-sm text-stone-500">Can be used in LangGraph workflows</p>
            </div>
            <Switch
              checked={editForm.langgraph_compatible ?? false}
              onCheckedChange={(checked) =>
                setEditForm({ ...editForm, langgraph_compatible: checked })
              }
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// View Mode Component
function ToolViewMode({ tool }: { tool: Tool }) {
  const toolTypeBadge = tool.tool_type
    ? TOOL_TYPE_BADGES[tool.tool_type]
    : TOOL_TYPE_BADGES.ai_function;
  const ToolTypeIcon = toolTypeBadge?.icon || Wrench;
  const implBadge = tool.implementation_type
    ? IMPLEMENTATION_BADGES[tool.implementation_type]
    : IMPLEMENTATION_BADGES.function;
  const ImplIcon = implBadge?.icon || Clock;
  const lifecycleBadge = tool.lifecycle_stage
    ? LIFECYCLE_BADGES[tool.lifecycle_stage]
    : LIFECYCLE_BADGES.development;
  const LifecycleIcon = lifecycleBadge?.icon || Clock;

  return (
    <>
      <Card className="border border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-stone-800">Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-stone-700 whitespace-pre-wrap">
            {tool.tool_description || tool.description || 'No description provided.'}
          </p>
          {tool.llm_description && (
            <div className="pt-4 border-t border-stone-200">
              <Label className="text-stone-500 text-xs">LLM Description</Label>
              <p className="text-sm text-stone-600 mt-1">{tool.llm_description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800">Implementation Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-stone-500">Tool Type</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={toolTypeBadge.color}>
                  <ToolTypeIcon className="h-3 w-3 mr-1" />
                  {toolTypeBadge.label}
                </Badge>
              </div>
            </div>
            <div>
              <Label className="text-stone-500">Implementation Type</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={implBadge.color}>
                  <ImplIcon className="h-3 w-3 mr-1" />
                  {implBadge.label}
                </Badge>
              </div>
            </div>
            {tool.implementation_path && (
              <div>
                <Label className="text-stone-500">Implementation Path</Label>
                <p className="font-mono text-sm bg-stone-100 p-2 rounded mt-1 break-all text-stone-700">
                  {tool.implementation_path}
                </p>
              </div>
            )}
            {tool.function_name && (
              <div>
                <Label className="text-stone-500">Function Name</Label>
                <p className="font-mono text-sm bg-stone-100 p-2 rounded mt-1 text-stone-700">
                  {tool.function_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800">Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-stone-500">Lifecycle Stage</Label>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={lifecycleBadge.color}>
                  <LifecycleIcon className="h-3 w-3 mr-1" />
                  {lifecycleBadge.label}
                </Badge>
              </div>
            </div>
            {tool.rate_limit_per_minute && (
              <div>
                <Label className="text-stone-500">Rate Limit</Label>
                <p className="font-medium text-stone-700">{tool.rate_limit_per_minute} requests/min</p>
              </div>
            )}
            {tool.cost_per_execution && (
              <div>
                <Label className="text-stone-500">Cost per Execution</Label>
                <p className="font-medium text-stone-700">${tool.cost_per_execution.toFixed(4)}</p>
              </div>
            )}
            <div>
              <Label className="text-stone-500">LangGraph Compatible</Label>
              <p className="font-medium text-stone-700">{tool.langgraph_compatible ? 'Yes' : 'No'}</p>
            </div>
            {tool.langgraph_node_name && (
              <div>
                <Label className="text-stone-500">LangGraph Node Name</Label>
                <p className="font-mono text-sm bg-stone-100 p-2 rounded mt-1 text-stone-700">
                  {tool.langgraph_node_name}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* API Details */}
      {(tool.api_endpoint || tool.input_schema || tool.output_schema) && (
        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800">API Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {tool.api_endpoint && (
              <div>
                <Label className="text-stone-500">API Endpoint</Label>
                <p className="font-mono text-sm bg-stone-100 p-2 rounded mt-1 break-all text-stone-700">
                  {tool.api_endpoint}
                </p>
              </div>
            )}
            {tool.input_schema && (
              <div>
                <Label className="text-stone-500">Input Schema</Label>
                <pre className="text-sm bg-stone-100 p-4 rounded mt-1 overflow-x-auto text-stone-700">
                  {JSON.stringify(tool.input_schema, null, 2)}
                </pre>
              </div>
            )}
            {tool.output_schema && (
              <div>
                <Label className="text-stone-500">Output Schema</Label>
                <pre className="text-sm bg-stone-100 p-4 rounded mt-1 overflow-x-auto text-stone-700">
                  {JSON.stringify(tool.output_schema, null, 2)}
                </pre>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Usage Statistics */}
      {(tool.total_calls || tool.success_rate !== undefined) && (
        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800">Usage Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {tool.total_calls !== undefined && (
                <div>
                  <Label className="text-stone-500">Total Calls</Label>
                  <p className="text-2xl font-bold text-stone-800">{tool.total_calls.toLocaleString()}</p>
                </div>
              )}
              {tool.success_rate !== undefined && tool.success_rate !== null && (
                <div>
                  <Label className="text-stone-500">Success Rate</Label>
                  <p className="text-2xl font-bold text-stone-800">
                    {(tool.success_rate * 100).toFixed(1)}%
                  </p>
                </div>
              )}
              {tool.avg_response_time_ms !== undefined && tool.avg_response_time_ms !== null && (
                <div>
                  <Label className="text-stone-500">Avg Response Time</Label>
                  <p className="text-2xl font-bold text-stone-800">
                    {tool.avg_response_time_ms.toFixed(0)}ms
                  </p>
                </div>
              )}
              {tool.avg_confidence_score !== undefined && tool.avg_confidence_score !== null && (
                <div>
                  <Label className="text-stone-500">Avg Confidence</Label>
                  <p className="text-2xl font-bold text-stone-800">
                    {(tool.avg_confidence_score * 100).toFixed(1)}%
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documentation Link */}
      {tool.documentation_url && (
        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800">Documentation</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={tool.documentation_url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-800 hover:underline"
            >
              <ExternalLink className="h-4 w-4" />
              {tool.documentation_url}
            </a>
          </CardContent>
        </Card>
      )}

      {/* Metadata */}
      {tool.metadata && Object.keys(tool.metadata).length > 0 && (
        <Card className="border border-stone-200 bg-white">
          <CardHeader>
            <CardTitle className="text-lg text-stone-800">Metadata</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-sm bg-stone-100 p-4 rounded overflow-x-auto text-stone-700">
              {JSON.stringify(tool.metadata, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Timestamps */}
      <Card className="border border-stone-200 bg-white">
        <CardHeader>
          <CardTitle className="text-lg text-stone-800">Timestamps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <Label className="text-stone-500">Created</Label>
              <p className="text-stone-700">
                {tool.created_at ? new Date(tool.created_at).toLocaleString() : 'N/A'}
              </p>
            </div>
            <div>
              <Label className="text-stone-500">Last Updated</Label>
              <p className="text-stone-700">
                {tool.updated_at ? new Date(tool.updated_at).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}

// Loading fallback for Suspense
function ToolDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <div className="px-6 pt-4">
        <div className="h-6 w-64 bg-stone-200 animate-pulse rounded" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-stone-200 animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 bg-stone-200 animate-pulse rounded" />
            <div>
              <div className="h-6 w-48 bg-stone-200 animate-pulse rounded mb-2" />
              <div className="h-4 w-32 bg-stone-200 animate-pulse rounded" />
            </div>
          </div>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
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

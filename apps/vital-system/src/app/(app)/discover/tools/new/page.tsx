// Create New Tool Page
'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  ArrowLeft,
  Wrench,
  Shield,
  Save,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import type { Tool } from '@/lib/services/tool-registry-service';

// Tool categories
const TOOL_CATEGORIES = [
  'Healthcare',
  'Healthcare/FHIR',
  'Healthcare/Clinical NLP',
  'Healthcare/De-identification',
  'Research',
  'General',
  'AI',
  'Database',
  'API',
];

export default function CreateToolPage() {
  const router = useRouter();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<Tool>>({
    name: '',
    code: '',
    tool_description: '',
    llm_description: '',
    category: 'General',
    tool_type: 'ai_function',
    implementation_type: 'function',
    implementation_path: '',
    lifecycle_stage: 'development',
    documentation_url: '',
    rate_limit_per_minute: null,
    is_active: true,
    langgraph_compatible: false,
  });

  // Redirect non-admins
  if (!isAdmin) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Access Denied</h2>
            <p className="text-stone-600 mb-4">You need admin permissions to create tools</p>
            <Button onClick={() => router.push('/discover/tools')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Tools
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    // Validation
    if (!form.name?.trim()) {
      setError('Tool name is required');
      return;
    }
    if (!form.code?.trim()) {
      setError('Tool code is required');
      return;
    }

    try {
      setSaving(true);
      setError(null);

      const response = await fetch('/api/tools-crud', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(form),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create tool');
      }

      const data = await response.json();

      // Navigate to the new tool's page
      router.push(`/discover/tools/${data.tool.code || data.tool.id}`);
    } catch (err: unknown) {
      console.error('Error creating tool:', err);
      setError(err instanceof Error ? err.message : 'Failed to create tool');
    } finally {
      setSaving(false);
    }
  };

  // Auto-generate code from name
  const handleNameChange = (name: string) => {
    setForm({
      ...form,
      name,
      // Only auto-generate code if it hasn't been manually edited
      code: form.code || name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Discover', href: '/discover' },
            { label: 'Tools', href: '/discover/tools' },
            { label: 'New Tool' },
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
            <Wrench className="h-8 w-8 text-stone-600" />
            <div>
              <h1 className="text-2xl font-bold">Create New Tool</h1>
              <p className="text-sm text-stone-500">Add a new tool to the registry</p>
            </div>
          </div>
        </div>

        <Button onClick={handleSave} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <Save className="h-4 w-4 mr-2" />
          )}
          Create Tool
        </Button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">

          {/* Admin badge */}
          <div className="flex items-center gap-2 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
            <Shield className="h-4 w-4 text-purple-600" />
            <span className="text-sm text-purple-700 dark:text-purple-300">
              Admin mode: Creating a new tool
            </span>
          </div>

          {/* Error Display */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <span className="text-sm text-red-700 dark:text-red-300">{error}</span>
            </div>
          )}

          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Tool Details</CardTitle>
              <CardDescription>Enter the details for the new tool</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={form.name || ''}
                  onChange={(e) => handleNameChange(e.target.value)}
                  placeholder="Tool name"
                />
              </div>

              {/* Code */}
              <div className="space-y-2">
                <Label htmlFor="code">Code *</Label>
                <Input
                  id="code"
                  value={form.code || ''}
                  onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, '_') })}
                  placeholder="tool_code"
                />
                <p className="text-xs text-stone-500">Used as identifier. Lowercase letters, numbers, underscores, and hyphens only.</p>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="tool_description">Description</Label>
                <Textarea
                  id="tool_description"
                  value={form.tool_description || ''}
                  onChange={(e) => setForm({ ...form, tool_description: e.target.value })}
                  placeholder="Describe what this tool does..."
                  rows={4}
                />
              </div>

              {/* LLM Description */}
              <div className="space-y-2">
                <Label htmlFor="llm_description">LLM Description (Short)</Label>
                <Input
                  id="llm_description"
                  value={form.llm_description || ''}
                  onChange={(e) => setForm({ ...form, llm_description: e.target.value })}
                  placeholder="Short description for AI agent selection"
                />
                <p className="text-xs text-stone-500">Brief description used by AI agents to determine when to use this tool.</p>
              </div>

              {/* Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select
                  value={form.category || 'General'}
                  onValueChange={(value) => setForm({ ...form, category: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {TOOL_CATEGORIES.map((cat) => (
                      <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Tool Type */}
              <div className="space-y-2">
                <Label htmlFor="tool_type">Tool Type</Label>
                <Select
                  value={form.tool_type || 'ai_function'}
                  onValueChange={(value) => setForm({ ...form, tool_type: value as Tool['tool_type'] })}
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
                  value={form.implementation_type || 'function'}
                  onValueChange={(value) => setForm({ ...form, implementation_type: value as Tool['implementation_type'] })}
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
                  value={form.lifecycle_stage || 'development'}
                  onValueChange={(value) => setForm({ ...form, lifecycle_stage: value as Tool['lifecycle_stage'] })}
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
                  value={form.implementation_path || ''}
                  onChange={(e) => setForm({ ...form, implementation_path: e.target.value })}
                  placeholder="Path to implementation file or module"
                />
              </div>

              {/* Documentation URL */}
              <div className="space-y-2">
                <Label htmlFor="documentation_url">Documentation URL</Label>
                <Input
                  id="documentation_url"
                  value={form.documentation_url || ''}
                  onChange={(e) => setForm({ ...form, documentation_url: e.target.value })}
                  placeholder="https://docs.example.com/tool"
                />
              </div>

              {/* Rate Limit */}
              <div className="space-y-2">
                <Label htmlFor="rate_limit">Rate Limit (per minute)</Label>
                <Input
                  id="rate_limit"
                  type="number"
                  value={form.rate_limit_per_minute || ''}
                  onChange={(e) => setForm({ ...form, rate_limit_per_minute: e.target.value ? parseInt(e.target.value) : null })}
                  placeholder="60"
                />
              </div>

              {/* Toggles */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-stone-500">Enable or disable this tool</p>
                  </div>
                  <Switch
                    checked={form.is_active ?? true}
                    onCheckedChange={(checked) => setForm({ ...form, is_active: checked })}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>LangGraph Compatible</Label>
                    <p className="text-sm text-stone-500">Can be used in LangGraph workflows</p>
                  </div>
                  <Switch
                    checked={form.langgraph_compatible ?? false}
                    onCheckedChange={(checked) => setForm({ ...form, langgraph_compatible: checked })}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

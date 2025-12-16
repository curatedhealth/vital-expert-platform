/**
 * Mission Template Detail Page - Brand Guidelines v6.0
 *
 * Design System:
 * - Primary Accent: #9055E0 (Warm Purple) via Tailwind purple-600
 * - Canvas: stone-50, Surface: white with stone-200 border
 * - Text: stone-600/700/800
 * - Transitions: 150ms for interactions
 *
 * Full CRUD capabilities for mission templates
 */
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
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  ArrowLeft,
  Sparkles,
  Target,
  AlertCircle,
  Pencil,
  Trash2,
  Save,
  X,
  Clock,
  DollarSign,
  Users,
  Shield,
  Loader2,
  Copy,
  Check,
  Play,
  FlaskConical,
  BarChart3,
  Search,
  FileEdit,
  Eye,
  Lightbulb,
  Settings,
  Zap,
  ListChecks,
  FileText,
  Wrench,
  Gauge,
  CheckCircle2,
  FileOutput,
  Briefcase,
  MessageSquare,
  Bot,
  Workflow,
  Code,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';

// Family icons mapping
const FAMILY_ICONS: Record<string, LucideIcon> = {
  DEEP_RESEARCH: FlaskConical,
  EVALUATION: BarChart3,
  INVESTIGATION: Search,
  STRATEGY: Target,
  PREPARATION: FileEdit,
  MONITORING: Eye,
  PROBLEM_SOLVING: Lightbulb,
  GENERIC: Settings,
};

// Family colors
const FAMILY_COLORS: Record<string, string> = {
  DEEP_RESEARCH: 'bg-purple-100 text-purple-800 border-purple-200',
  EVALUATION: 'bg-violet-100 text-violet-800 border-violet-200',
  INVESTIGATION: 'bg-red-100 text-red-800 border-red-200',
  STRATEGY: 'bg-amber-100 text-amber-800 border-amber-200',
  PREPARATION: 'bg-indigo-100 text-indigo-800 border-indigo-200',
  MONITORING: 'bg-cyan-100 text-cyan-800 border-cyan-200',
  PROBLEM_SOLVING: 'bg-emerald-100 text-emerald-800 border-emerald-200',
  GENERIC: 'bg-stone-100 text-stone-800 border-stone-200',
};

// Complexity badges
const COMPLEXITY_BADGES: Record<string, { color: string; icon: LucideIcon; label: string }> = {
  low: { color: 'bg-green-100 text-green-800', icon: Check, label: 'Low' },
  medium: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Medium' },
  high: { color: 'bg-orange-100 text-orange-800', icon: Zap, label: 'High' },
  critical: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'Critical' },
};

interface MissionTemplate {
  id: string;
  name: string;
  family: string;
  category: string;
  description: string;
  long_description?: string;
  complexity: string;
  estimated_duration_min: number;
  estimated_duration_max: number;
  estimated_cost_min: number;
  estimated_cost_max: number;
  required_agent_tiers?: string[];
  recommended_agents?: string[];
  min_agents?: number;
  max_agents?: number;
  tasks?: Record<string, unknown>[];
  checkpoints?: Record<string, unknown>[];
  required_inputs?: Record<string, unknown>[];
  optional_inputs?: Record<string, unknown>[];
  outputs?: Record<string, unknown>[];
  tags?: string[];
  use_cases?: string[];
  example_queries?: string[];
  workflow_config?: Record<string, unknown>;
  tool_requirements?: Record<string, unknown>[];
  mode_4_constraints?: Record<string, unknown>;
  is_active: boolean;
  version?: string;
  created_at?: string;
  updated_at?: string;
}

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDuration(min: number, max: number): string {
  if (min === max) {
    return min < 60 ? `${min}m` : `${Math.round(min / 60)}h`;
  }
  const minStr = min < 60 ? `${min}m` : `${Math.round(min / 60)}h`;
  const maxStr = max < 60 ? `${max}m` : `${Math.round(max / 60)}h`;
  return `${minStr} - ${maxStr}`;
}

function formatCost(min: number, max: number): string {
  if (min === max) {
    return `$${min.toFixed(2)}`;
  }
  return `$${min.toFixed(2)} - $${max.toFixed(2)}`;
}

// Convert mission to YAML format
function missionToYaml(mission: MissionTemplate): string {
  const indent = (level: number) => '  '.repeat(level);
  const lines: string[] = [];

  // Helper to format a value based on type
  const formatValue = (value: unknown, level: number = 0): string => {
    if (value === null || value === undefined) return 'null';
    if (typeof value === 'string') {
      // Check if string needs quoting
      if (value.includes(':') || value.includes('#') || value.includes('\n') ||
          value.startsWith(' ') || value.endsWith(' ') || value === '') {
        return `"${value.replace(/"/g, '\\"')}"`;
      }
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') return String(value);
    if (Array.isArray(value)) {
      if (value.length === 0) return '[]';
      // Check if it's an array of primitives or objects
      if (typeof value[0] === 'object' && value[0] !== null) {
        return '\n' + value.map((item, i) => {
          const objLines = Object.entries(item as Record<string, unknown>)
            .map(([k, v], j) => {
              const prefix = j === 0 ? '- ' : '  ';
              return `${indent(level + 1)}${prefix}${k}: ${formatValue(v, level + 2)}`;
            });
          return objLines.join('\n');
        }).join('\n');
      }
      return '\n' + value.map(item => `${indent(level + 1)}- ${formatValue(item, level + 1)}`).join('\n');
    }
    if (typeof value === 'object') {
      const entries = Object.entries(value as Record<string, unknown>);
      if (entries.length === 0) return '{}';
      return '\n' + entries.map(([k, v]) =>
        `${indent(level + 1)}${k}: ${formatValue(v, level + 1)}`
      ).join('\n');
    }
    return String(value);
  };

  // Core identification
  lines.push(`# Mission Template: ${mission.name}`);
  lines.push(`# Generated from database record`);
  lines.push('');
  lines.push(`id: "${mission.id}"`);
  lines.push(`name: "${mission.name}"`);
  lines.push(`family: "${mission.family}"`);
  lines.push(`category: "${mission.category}"`);
  lines.push(`complexity: "${mission.complexity}"`);
  lines.push(`is_active: ${mission.is_active}`);
  if (mission.version) lines.push(`version: "${mission.version}"`);
  lines.push('');

  // Description
  lines.push('# Description');
  lines.push(`description: "${mission.description.replace(/"/g, '\\"')}"`);
  if (mission.long_description) {
    lines.push('long_description: |');
    mission.long_description.split('\n').forEach(line => {
      lines.push(`  ${line}`);
    });
  }
  lines.push('');

  // Estimates
  lines.push('# Estimates');
  lines.push(`estimated_duration_min: ${mission.estimated_duration_min}`);
  lines.push(`estimated_duration_max: ${mission.estimated_duration_max}`);
  lines.push(`estimated_cost_min: ${mission.estimated_cost_min}`);
  lines.push(`estimated_cost_max: ${mission.estimated_cost_max}`);
  if (mission.min_agents !== undefined) lines.push(`min_agents: ${mission.min_agents}`);
  if (mission.max_agents !== undefined) lines.push(`max_agents: ${mission.max_agents}`);
  lines.push('');

  // Agent configuration
  if ((mission.required_agent_tiers && mission.required_agent_tiers.length > 0) ||
      (mission.recommended_agents && mission.recommended_agents.length > 0)) {
    lines.push('# Agent Configuration');
    if (mission.required_agent_tiers && mission.required_agent_tiers.length > 0) {
      lines.push('required_agent_tiers:');
      mission.required_agent_tiers.forEach(tier => lines.push(`  - "${tier}"`));
    }
    if (mission.recommended_agents && mission.recommended_agents.length > 0) {
      lines.push('recommended_agents:');
      mission.recommended_agents.forEach(agent => lines.push(`  - "${agent}"`));
    }
    lines.push('');
  }

  // Required inputs
  if (mission.required_inputs && mission.required_inputs.length > 0) {
    lines.push('# Required Inputs');
    lines.push('required_inputs:');
    mission.required_inputs.forEach(input => {
      const i = input as Record<string, unknown>;
      lines.push(`  - name: "${i.name}"`);
      if (i.type) lines.push(`    type: "${i.type}"`);
      if (i.description) lines.push(`    description: "${i.description}"`);
      if (i.required !== undefined) lines.push(`    required: ${i.required}`);
    });
    lines.push('');
  }

  // Optional inputs
  if (mission.optional_inputs && mission.optional_inputs.length > 0) {
    lines.push('# Optional Inputs');
    lines.push('optional_inputs:');
    mission.optional_inputs.forEach(input => {
      const i = input as Record<string, unknown>;
      lines.push(`  - name: "${i.name}"`);
      if (i.type) lines.push(`    type: "${i.type}"`);
      if (i.description) lines.push(`    description: "${i.description}"`);
    });
    lines.push('');
  }

  // Outputs
  if (mission.outputs && mission.outputs.length > 0) {
    lines.push('# Outputs');
    lines.push('outputs:');
    mission.outputs.forEach(output => {
      const o = output as Record<string, unknown>;
      lines.push(`  - name: "${o.name}"`);
      if (o.type) lines.push(`    type: "${o.type}"`);
      if (o.description) lines.push(`    description: "${o.description}"`);
    });
    lines.push('');
  }

  // Tasks
  if (mission.tasks && mission.tasks.length > 0) {
    lines.push('# Tasks');
    lines.push('tasks:');
    mission.tasks.forEach(task => {
      const t = task as Record<string, unknown>;
      lines.push(`  - id: "${t.id || t.name}"`);
      if (t.name) lines.push(`    name: "${t.name}"`);
      if (t.description) lines.push(`    description: "${t.description}"`);
      if (t.assignedLevel) lines.push(`    assigned_level: "${t.assignedLevel}"`);
      if (t.instructions) lines.push(`    instructions: "${t.instructions}"`);
    });
    lines.push('');
  }

  // Checkpoints (HITL)
  if (mission.checkpoints && mission.checkpoints.length > 0) {
    lines.push('# HITL Checkpoints');
    lines.push('checkpoints:');
    mission.checkpoints.forEach(checkpoint => {
      const c = checkpoint as Record<string, unknown>;
      lines.push(`  - id: "${c.id || c.name}"`);
      if (c.name) lines.push(`    name: "${c.name}"`);
      if (c.type) lines.push(`    type: "${c.type}"`);
      if (c.description) lines.push(`    description: "${c.description}"`);
      if (c.requiresApproval !== undefined) lines.push(`    requires_approval: ${c.requiresApproval}`);
      if (c.after_task) lines.push(`    after_task: "${c.after_task}"`);
    });
    lines.push('');
  }

  // Tool requirements
  if (mission.tool_requirements && mission.tool_requirements.length > 0) {
    lines.push('# Tool Requirements');
    lines.push('tool_requirements:');
    mission.tool_requirements.forEach(tool => {
      const t = tool as Record<string, unknown>;
      lines.push(`  - tool_id: "${t.tool_id || t.toolId}"`);
      if (t.required !== undefined) lines.push(`    required: ${t.required}`);
      if (t.purpose) lines.push(`    purpose: "${t.purpose}"`);
    });
    lines.push('');
  }

  // Mode 4 constraints
  if (mission.mode_4_constraints && Object.keys(mission.mode_4_constraints).length > 0) {
    lines.push('# Mode 4 Constraints (Autonomous Execution)');
    lines.push('mode_4_constraints:');
    Object.entries(mission.mode_4_constraints).forEach(([key, value]) => {
      lines.push(`  ${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
    });
    lines.push('');
  }

  // Workflow config
  if (mission.workflow_config && Object.keys(mission.workflow_config).length > 0) {
    lines.push('# Workflow Configuration');
    lines.push('workflow_config:');
    Object.entries(mission.workflow_config).forEach(([key, value]) => {
      lines.push(`  ${key}: ${typeof value === 'string' ? `"${value}"` : value}`);
    });
    lines.push('');
  }

  // Tags
  if (mission.tags && mission.tags.length > 0) {
    lines.push('# Tags');
    lines.push('tags:');
    mission.tags.forEach(tag => lines.push(`  - "${tag}"`));
    lines.push('');
  }

  // Use cases
  if (mission.use_cases && mission.use_cases.length > 0) {
    lines.push('# Use Cases');
    lines.push('use_cases:');
    mission.use_cases.forEach(useCase => lines.push(`  - "${useCase}"`));
    lines.push('');
  }

  // Example queries
  if (mission.example_queries && mission.example_queries.length > 0) {
    lines.push('# Example Queries');
    lines.push('example_queries:');
    mission.example_queries.forEach(query => lines.push(`  - "${query}"`));
    lines.push('');
  }

  return lines.join('\n');
}

function MissionDetailContent({ id }: { id: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { userProfile } = useAuth();
  const isAdmin = userProfile?.role === 'super_admin' || userProfile?.role === 'admin';

  const editParam = searchParams.get('edit');
  const startInEditMode = editParam === 'true' && isAdmin;

  const [mission, setMission] = useState<MissionTemplate | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(startInEditMode);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<Partial<MissionTemplate>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [copied, setCopied] = useState(false);
  const [duplicating, setDuplicating] = useState(false);
  const [viewMode, setViewMode] = useState<'structured' | 'yaml'>('structured');
  const [yamlCopied, setYamlCopied] = useState(false);

  useEffect(() => {
    loadMission();
  }, [id]);

  useEffect(() => {
    if (mission && startInEditMode && !isEditing) {
      setIsEditing(true);
    }
  }, [mission, startInEditMode]);

  const loadMission = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/missions/${id}`);

      if (!response.ok) {
        if (response.status === 404) {
          setError('Mission template not found');
        } else {
          const errorData = await response.json();
          setError(errorData.error || 'Failed to load mission template');
        }
        return;
      }

      const data = await response.json();
      setMission(data.mission);
      setEditForm(data.mission);
    } catch (err) {
      console.error('Error loading mission:', err);
      setError('Failed to load mission template');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!mission?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update mission template');
      }

      const data = await response.json();
      setMission(data.mission);
      setEditForm(data.mission);
      setIsEditing(false);
    } catch (err: unknown) {
      console.error('Error saving mission:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to save: ${message}`);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!mission?.id) return;

    try {
      setSaving(true);

      const response = await fetch(`/api/missions/${mission.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete mission template');
      }

      router.push('/missions');
    } catch (err: unknown) {
      console.error('Error deleting mission:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to delete: ${message}`);
    } finally {
      setSaving(false);
      setShowDeleteConfirm(false);
    }
  };

  const handleDuplicate = async () => {
    if (!mission?.id) return;

    try {
      setDuplicating(true);

      const response = await fetch(`/api/missions/${mission.id}/duplicate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate mission template');
      }

      const data = await response.json();
      router.push(`/missions/${data.mission.id}?edit=true`);
    } catch (err: unknown) {
      console.error('Error duplicating mission:', err);
      const message = err instanceof Error ? err.message : 'Unknown error';
      alert(`Failed to duplicate: ${message}`);
    } finally {
      setDuplicating(false);
    }
  };

  const handleCopyId = () => {
    if (mission?.id) {
      navigator.clipboard.writeText(mission.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCancel = () => {
    setEditForm(mission || {});
    setIsEditing(false);
  };

  const handleCopyYaml = () => {
    if (mission) {
      const yaml = missionToYaml(mission);
      navigator.clipboard.writeText(yaml);
      setYamlCopied(true);
      setTimeout(() => setYamlCopied(false), 2000);
    }
  };

  const handleLaunch = () => {
    if (mission?.id) {
      router.push(`/ask-expert/autonomous?templateId=${mission.id}`);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto mb-4" />
            <p className="text-stone-600">Loading mission template...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !mission) {
    return (
      <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-rose-500 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-stone-800 mb-2">Error</h2>
            <p className="text-stone-600 mb-4">{error || 'Mission template not found'}</p>
            <Button onClick={() => router.push('/missions')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Missions
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const FamilyIcon = FAMILY_ICONS[mission.family] || Settings;
  const familyColor = FAMILY_COLORS[mission.family] || FAMILY_COLORS.GENERIC;
  const complexityBadge = COMPLEXITY_BADGES[mission.complexity] || COMPLEXITY_BADGES.medium;
  const ComplexityIcon = complexityBadge.icon;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Breadcrumb */}
      <div className="px-6 pt-4">
        <VitalBreadcrumb
          showHome
          items={[
            { label: 'Missions', href: '/missions' },
            { label: mission.name },
          ]}
        />
      </div>

      {/* Action Bar */}
      <div className="flex items-center justify-between px-6 py-2 border-b border-stone-200 bg-white">
        <Button variant="ghost" size="sm" onClick={() => router.push('/missions')}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex gap-2">
          {!isEditing && (
            <>
              <Button onClick={handleLaunch} className="bg-purple-600 hover:bg-purple-700 text-white">
                <Play className="h-4 w-4 mr-2" />
                Launch Mission
              </Button>
              {isAdmin && (
                <>
                  <Button variant="outline" size="sm" onClick={handleDuplicate} disabled={duplicating}>
                    {duplicating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Copy className="h-4 w-4 mr-2" />}
                    Duplicate
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button variant="destructive" size="sm" onClick={() => setShowDeleteConfirm(true)}>
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </>
          )}

          {isEditing && (
            <>
              <Button variant="outline" size="sm" onClick={handleCancel} disabled={saving}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                Save Changes
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto p-6 space-y-6">
          {/* Admin badge */}
          {isAdmin && (
            <div className="flex items-center gap-2 p-3 bg-purple-50 rounded-lg border border-purple-200">
              <Shield className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-purple-700">
                Admin mode: You can edit, duplicate, and delete this mission template
              </span>
            </div>
          )}

          {/* Status Badges + View Mode Toggle */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex flex-wrap gap-3">
              <Badge className={mission.is_active ? 'bg-green-100 text-green-800' : 'bg-stone-100 text-stone-800'}>
                {mission.is_active ? 'Active' : 'Inactive'}
              </Badge>
              <Badge className={familyColor}>
                <FamilyIcon className="h-3 w-3 mr-1" />
                {mission.family.replace('_', ' ')}
              </Badge>
              <Badge className={complexityBadge.color}>
                <ComplexityIcon className="h-3 w-3 mr-1" />
                {complexityBadge.label} Complexity
              </Badge>
              <Badge className="bg-stone-100 text-stone-800">
                {mission.category}
              </Badge>
            </div>

            {/* View Mode Toggle */}
            {!isEditing && (
              <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg">
                <Button
                  variant={viewMode === 'structured' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('structured')}
                  className="h-8 px-3"
                >
                  <LayoutGrid className="h-4 w-4 mr-2" />
                  Structured
                </Button>
                <Button
                  variant={viewMode === 'yaml' ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('yaml')}
                  className="h-8 px-3"
                >
                  <Code className="h-4 w-4 mr-2" />
                  YAML
                </Button>
              </div>
            )}
          </div>

          {/* Main Content */}
          {isEditing ? (
            // Edit Form
            <Card className="border border-stone-200 bg-white">
              <CardHeader>
                <CardTitle className="text-stone-900">Edit Mission Template</CardTitle>
                <CardDescription className="text-stone-600">Update the mission template details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    value={editForm.name || ''}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    placeholder="Mission template name"
                  />
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    placeholder="Brief description of what this mission does..."
                    rows={3}
                  />
                </div>

                {/* Long Description */}
                <div className="space-y-2">
                  <Label htmlFor="long_description">Long Description</Label>
                  <Textarea
                    id="long_description"
                    value={editForm.long_description || ''}
                    onChange={(e) => setEditForm({ ...editForm, long_description: e.target.value })}
                    placeholder="Detailed description with methodology, outputs, etc..."
                    rows={5}
                  />
                </div>

                {/* Family & Category */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="family">Family</Label>
                    <Select
                      value={editForm.family || ''}
                      onValueChange={(value) => setEditForm({ ...editForm, family: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select family" />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(FAMILY_ICONS).map((family) => (
                          <SelectItem key={family} value={family}>
                            {family.replace('_', ' ')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input
                      id="category"
                      value={editForm.category || ''}
                      onChange={(e) => setEditForm({ ...editForm, category: e.target.value })}
                      placeholder="e.g., Research, Analysis, Strategy"
                    />
                  </div>
                </div>

                {/* Complexity */}
                <div className="space-y-2">
                  <Label htmlFor="complexity">Complexity</Label>
                  <Select
                    value={editForm.complexity || 'medium'}
                    onValueChange={(value) => setEditForm({ ...editForm, complexity: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Duration Estimates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_duration_min">Min Duration (minutes)</Label>
                    <Input
                      id="estimated_duration_min"
                      type="number"
                      value={editForm.estimated_duration_min || 30}
                      onChange={(e) => setEditForm({ ...editForm, estimated_duration_min: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_duration_max">Max Duration (minutes)</Label>
                    <Input
                      id="estimated_duration_max"
                      type="number"
                      value={editForm.estimated_duration_max || 60}
                      onChange={(e) => setEditForm({ ...editForm, estimated_duration_max: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Cost Estimates */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="estimated_cost_min">Min Cost ($)</Label>
                    <Input
                      id="estimated_cost_min"
                      type="number"
                      step="0.01"
                      value={editForm.estimated_cost_min || 1}
                      onChange={(e) => setEditForm({ ...editForm, estimated_cost_min: parseFloat(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="estimated_cost_max">Max Cost ($)</Label>
                    <Input
                      id="estimated_cost_max"
                      type="number"
                      step="0.01"
                      value={editForm.estimated_cost_max || 5}
                      onChange={(e) => setEditForm({ ...editForm, estimated_cost_max: parseFloat(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Agent Config */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="min_agents">Min Agents</Label>
                    <Input
                      id="min_agents"
                      type="number"
                      value={editForm.min_agents || 1}
                      onChange={(e) => setEditForm({ ...editForm, min_agents: parseInt(e.target.value) })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="max_agents">Max Agents</Label>
                    <Input
                      id="max_agents"
                      type="number"
                      value={editForm.max_agents || 5}
                      onChange={(e) => setEditForm({ ...editForm, max_agents: parseInt(e.target.value) })}
                    />
                  </div>
                </div>

                {/* Active Status */}
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Active Status</Label>
                    <p className="text-sm text-stone-500">Enable or disable this mission template</p>
                  </div>
                  <Switch
                    checked={editForm.is_active ?? true}
                    onCheckedChange={(checked) => setEditForm({ ...editForm, is_active: checked })}
                  />
                </div>
              </CardContent>
            </Card>
          ) : viewMode === 'yaml' ? (
            // YAML View
            <Card className="border border-stone-200 bg-white">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                    <Code className="h-5 w-5 text-purple-500" />
                    Mission Template YAML
                  </CardTitle>
                  <CardDescription className="text-stone-600">
                    Full configuration in YAML format
                  </CardDescription>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyYaml}
                  className="h-8"
                >
                  {yamlCopied ? (
                    <>
                      <Check className="h-4 w-4 mr-2 text-green-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copy YAML
                    </>
                  )}
                </Button>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <pre className="bg-stone-900 text-stone-100 p-4 rounded-lg overflow-x-auto text-sm font-mono leading-relaxed max-h-[70vh] overflow-y-auto">
                    <code className="language-yaml">
                      {missionToYaml(mission).split('\n').map((line, i) => {
                        // Syntax highlighting for YAML
                        let highlighted = line;

                        // Comments (lines starting with #)
                        if (line.trim().startsWith('#')) {
                          return (
                            <span key={i} className="block">
                              <span className="text-stone-500">{line}</span>
                            </span>
                          );
                        }

                        // Keys (before the colon)
                        const colonIndex = line.indexOf(':');
                        if (colonIndex > 0) {
                          const indent = line.match(/^(\s*)/)?.[1] || '';
                          const keyPart = line.slice(indent.length, colonIndex);
                          const valuePart = line.slice(colonIndex);

                          // Check if it's a list item
                          if (keyPart.startsWith('- ')) {
                            const listKey = keyPart.slice(2);
                            return (
                              <span key={i} className="block">
                                <span className="text-stone-500">{indent}- </span>
                                <span className="text-cyan-400">{listKey}</span>
                                <span className="text-stone-400">{valuePart.split('"')[0]}</span>
                                {valuePart.includes('"') && (
                                  <span className="text-emerald-400">{'"' + valuePart.split('"').slice(1).join('"')}</span>
                                )}
                              </span>
                            );
                          }

                          return (
                            <span key={i} className="block">
                              <span className="text-stone-500">{indent}</span>
                              <span className="text-cyan-400">{keyPart}</span>
                              <span className="text-stone-400">:</span>
                              {valuePart.slice(1).trim().startsWith('"') ? (
                                <span className="text-emerald-400">{valuePart.slice(1)}</span>
                              ) : valuePart.slice(1).trim() === 'true' || valuePart.slice(1).trim() === 'false' ? (
                                <span className="text-amber-400">{valuePart.slice(1)}</span>
                              ) : /^\s*\d/.test(valuePart.slice(1)) ? (
                                <span className="text-purple-400">{valuePart.slice(1)}</span>
                              ) : valuePart.slice(1).trim() === '|' ? (
                                <span className="text-rose-400">{valuePart.slice(1)}</span>
                              ) : (
                                <span className="text-stone-300">{valuePart.slice(1)}</span>
                              )}
                            </span>
                          );
                        }

                        // List items without key
                        if (line.trim().startsWith('- ')) {
                          const indent = line.match(/^(\s*)/)?.[1] || '';
                          const content = line.trim().slice(2);
                          return (
                            <span key={i} className="block">
                              <span className="text-stone-500">{indent}- </span>
                              {content.startsWith('"') ? (
                                <span className="text-emerald-400">{content}</span>
                              ) : (
                                <span className="text-stone-300">{content}</span>
                              )}
                            </span>
                          );
                        }

                        // Empty lines or other content
                        return <span key={i} className="block">{line || '\u00A0'}</span>;
                      })}
                    </code>
                  </pre>
                </div>
              </CardContent>
            </Card>
          ) : (
            // Structured View
            <>
              {/* Description Card */}
              <Card className="border border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-stone-900">Description</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-stone-700 whitespace-pre-wrap">
                    {mission.description || 'No description provided.'}
                  </p>
                  {mission.long_description && (
                    <div className="mt-4 pt-4 border-t border-stone-200">
                      <h4 className="text-sm font-medium text-stone-500 mb-2">Detailed Description</h4>
                      <p className="text-stone-700 whitespace-pre-wrap">{mission.long_description}</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="border border-stone-200 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Clock className="h-5 w-5 text-stone-500" />
                      Duration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-stone-900">
                      {formatDuration(mission.estimated_duration_min, mission.estimated_duration_max)}
                    </div>
                    <p className="text-sm text-stone-500">Estimated time</p>
                  </CardContent>
                </Card>

                <Card className="border border-stone-200 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <DollarSign className="h-5 w-5 text-stone-500" />
                      Cost
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-stone-900">
                      {formatCost(mission.estimated_cost_min, mission.estimated_cost_max)}
                    </div>
                    <p className="text-sm text-stone-500">Estimated cost</p>
                  </CardContent>
                </Card>

                <Card className="border border-stone-200 bg-white">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Users className="h-5 w-5 text-stone-500" />
                      Agents
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-stone-900">
                      {mission.min_agents === mission.max_agents
                        ? mission.min_agents
                        : `${mission.min_agents}-${mission.max_agents}`}
                    </div>
                    <p className="text-sm text-stone-500">Required agents</p>
                  </CardContent>
                </Card>
              </div>

              {/* Tasks */}
              {mission.tasks && mission.tasks.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <ListChecks className="h-5 w-5 text-stone-500" />
                      Tasks ({mission.tasks.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mission.tasks.map((task, index) => (
                        <div key={index} className="p-3 bg-stone-50 rounded-lg border border-stone-200">
                          <div className="flex items-center justify-between">
                            <span className="font-medium text-stone-900">
                              {(task as Record<string, unknown>).name as string || `Task ${index + 1}`}
                            </span>
                            {typeof (task as Record<string, unknown>).assignedLevel === 'string' && (
                              <Badge variant="outline">
                                {(task as Record<string, unknown>).assignedLevel as string}
                              </Badge>
                            )}
                          </div>
                          {typeof (task as Record<string, unknown>).description === 'string' && (
                            <p className="text-sm text-stone-600 mt-1">
                              {(task as Record<string, unknown>).description as string}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Required Inputs */}
              {mission.required_inputs && mission.required_inputs.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <FileText className="h-5 w-5 text-stone-500" />
                      Required Inputs ({mission.required_inputs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mission.required_inputs.map((input, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-stone-50 rounded">
                          <Badge variant="outline">{(input as Record<string, unknown>).type as string || 'text'}</Badge>
                          <span className="font-medium text-stone-900">{(input as Record<string, unknown>).name as string}</span>
                          {typeof (input as Record<string, unknown>).description === 'string' && (
                            <span className="text-sm text-stone-500">- {(input as Record<string, unknown>).description as string}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Optional Inputs */}
              {mission.optional_inputs && mission.optional_inputs.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <FileText className="h-5 w-5 text-stone-400" />
                      Optional Inputs ({mission.optional_inputs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mission.optional_inputs.map((input, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-stone-50 rounded">
                          <Badge variant="outline" className="opacity-70">{(input as Record<string, unknown>).type as string || 'text'}</Badge>
                          <span className="font-medium text-stone-700">{(input as Record<string, unknown>).name as string}</span>
                          {typeof (input as Record<string, unknown>).description === 'string' && (
                            <span className="text-sm text-stone-500">- {(input as Record<string, unknown>).description as string}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Outputs */}
              {mission.outputs && mission.outputs.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <FileOutput className="h-5 w-5 text-stone-500" />
                      Outputs ({mission.outputs.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mission.outputs.map((output, index) => (
                        <div key={index} className="flex items-center gap-3 p-2 bg-emerald-50 rounded border border-emerald-200">
                          <Badge className="bg-emerald-100 text-emerald-800">{(output as Record<string, unknown>).type as string || 'markdown'}</Badge>
                          <span className="font-medium text-stone-900">{(output as Record<string, unknown>).name as string}</span>
                          {typeof (output as Record<string, unknown>).description === 'string' && (
                            <span className="text-sm text-stone-600">- {(output as Record<string, unknown>).description as string}</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Checkpoints (HITL Phases) */}
              {mission.checkpoints && mission.checkpoints.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <CheckCircle2 className="h-5 w-5 text-amber-500" />
                      HITL Checkpoints ({mission.checkpoints.length})
                    </CardTitle>
                    <CardDescription className="text-stone-600">Human-in-the-loop approval points</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {mission.checkpoints.map((checkpoint, index) => {
                        const cp = checkpoint as Record<string, unknown>;
                        return (
                          <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-stone-900">
                                {cp.name as string || cp.id as string || `Checkpoint ${index + 1}`}
                              </span>
                              <div className="flex items-center gap-2">
                                {typeof cp.type === 'string' && (
                                  <Badge className="bg-amber-100 text-amber-800">{cp.type}</Badge>
                                )}
                                {cp.requiresApproval !== false && (
                                  <Badge className="bg-red-100 text-red-800">Blocking</Badge>
                                )}
                              </div>
                            </div>
                            {typeof cp.description === 'string' && (
                              <p className="text-sm text-stone-600 mt-1">{cp.description}</p>
                            )}
                            {typeof cp.after_task === 'string' && (
                              <p className="text-xs text-stone-500 mt-2">After task: {cp.after_task}</p>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Agent Configuration */}
              {((mission.required_agent_tiers && mission.required_agent_tiers.length > 0) ||
                (mission.recommended_agents && mission.recommended_agents.length > 0)) && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Bot className="h-5 w-5 text-purple-500" />
                      Agent Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {mission.required_agent_tiers && mission.required_agent_tiers.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-stone-500 mb-2">Required Agent Tiers</h4>
                        <div className="flex flex-wrap gap-2">
                          {mission.required_agent_tiers.map((tier, index) => (
                            <Badge key={index} className="bg-purple-100 text-purple-800">
                              {tier}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {mission.recommended_agents && mission.recommended_agents.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-stone-500 mb-2">Recommended Agents</h4>
                        <div className="flex flex-wrap gap-2">
                          {mission.recommended_agents.map((agent, index) => (
                            <Badge key={index} variant="outline" className="border-purple-300 text-purple-700">
                              {agent}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Tool Requirements */}
              {mission.tool_requirements && mission.tool_requirements.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Wrench className="h-5 w-5 text-stone-500" />
                      Tool Requirements ({mission.tool_requirements.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {mission.tool_requirements.map((tool, index) => {
                        const t = tool as Record<string, unknown>;
                        return (
                          <div
                            key={index}
                            className={`flex items-center gap-3 p-2 rounded border ${
                              t.required
                                ? 'bg-blue-50 border-blue-200'
                                : 'bg-stone-50 border-stone-200'
                            }`}
                          >
                            <Badge className={t.required ? 'bg-blue-100 text-blue-800' : 'bg-stone-100 text-stone-600'}>
                              {t.required ? 'Required' : 'Optional'}
                            </Badge>
                            <span className="font-mono text-sm text-stone-900">{t.tool_id as string || t.toolId as string}</span>
                            {typeof t.purpose === 'string' && (
                              <span className="text-xs text-stone-500 truncate">{t.purpose}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Mode 4 Constraints */}
              {mission.mode_4_constraints && Object.keys(mission.mode_4_constraints).length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Gauge className="h-5 w-5 text-orange-500" />
                      Mode 4 Constraints (Autonomous)
                    </CardTitle>
                    <CardDescription className="text-stone-600">Limits for background autonomous execution</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {typeof (mission.mode_4_constraints as Record<string, unknown>).max_cost !== 'undefined' && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-700">
                            ${String((mission.mode_4_constraints as Record<string, unknown>).max_cost)}
                          </div>
                          <p className="text-xs text-stone-500">Max Cost</p>
                        </div>
                      )}
                      {typeof (mission.mode_4_constraints as Record<string, unknown>).max_iterations !== 'undefined' && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-700">
                            {String((mission.mode_4_constraints as Record<string, unknown>).max_iterations)}
                          </div>
                          <p className="text-xs text-stone-500">Max Iterations</p>
                        </div>
                      )}
                      {typeof (mission.mode_4_constraints as Record<string, unknown>).max_wall_time_minutes !== 'undefined' && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-700">
                            {String((mission.mode_4_constraints as Record<string, unknown>).max_wall_time_minutes)}m
                          </div>
                          <p className="text-xs text-stone-500">Max Wall Time</p>
                        </div>
                      )}
                      {typeof (mission.mode_4_constraints as Record<string, unknown>).max_api_calls !== 'undefined' && (
                        <div className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                          <div className="text-2xl font-bold text-orange-700">
                            {String((mission.mode_4_constraints as Record<string, unknown>).max_api_calls)}
                          </div>
                          <p className="text-xs text-stone-500">Max API Calls</p>
                        </div>
                      )}
                    </div>
                    {(mission.mode_4_constraints as Record<string, unknown>).allow_auto_continue !== undefined && (
                      <div className="mt-4 flex items-center gap-2">
                        <Badge className={(mission.mode_4_constraints as Record<string, unknown>).allow_auto_continue
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                        }>
                          {(mission.mode_4_constraints as Record<string, unknown>).allow_auto_continue
                            ? 'Auto-continue enabled'
                            : 'Auto-continue disabled'}
                        </Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Workflow Config */}
              {mission.workflow_config && Object.keys(mission.workflow_config).length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Workflow className="h-5 w-5 text-indigo-500" />
                      Workflow Configuration
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {Object.entries(mission.workflow_config).map(([key, value]) => (
                        <div key={key} className="p-2 bg-indigo-50 rounded border border-indigo-200">
                          <p className="text-xs text-stone-500 font-mono">{key.replace(/_/g, ' ')}</p>
                          <p className="text-sm font-medium text-stone-900">
                            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Use Cases */}
              {mission.use_cases && mission.use_cases.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2 text-stone-900">
                      <Briefcase className="h-5 w-5 text-stone-500" />
                      Use Cases ({mission.use_cases.length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {mission.use_cases.map((useCase, index) => (
                        <li key={index} className="flex items-start gap-2 text-stone-700">
                          <Check className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {useCase}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}

              {/* Tags */}
              {mission.tags && mission.tags.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-stone-900">Tags</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2">
                      {mission.tags.map((tag, index) => (
                        <Badge key={index} className="bg-purple-50 text-purple-700 border-purple-200">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Example Queries */}
              {mission.example_queries && mission.example_queries.length > 0 && (
                <Card className="border border-stone-200 bg-white">
                  <CardHeader>
                    <CardTitle className="text-lg text-stone-900">Example Queries</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {mission.example_queries.map((query, index) => (
                        <div key={index} className="p-3 bg-stone-50 rounded-lg border border-stone-200 text-stone-700 italic">
                          "{query}"
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Timestamps */}
              <Card className="border border-stone-200 bg-white">
                <CardHeader>
                  <CardTitle className="text-lg text-stone-900">Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <Label className="text-stone-500">Version</Label>
                      <p className="text-stone-900">{mission.version || '1.0'}</p>
                    </div>
                    <div>
                      <Label className="text-stone-500">Created</Label>
                      <p className="text-stone-900">
                        {mission.created_at ? new Date(mission.created_at).toLocaleString() : 'N/A'}
                      </p>
                    </div>
                    <div>
                      <Label className="text-stone-500">Last Updated</Label>
                      <p className="text-stone-900">
                        {mission.updated_at ? new Date(mission.updated_at).toLocaleString() : 'N/A'}
                      </p>
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
          <Card className="w-full max-w-md mx-4 border border-stone-200">
            <CardHeader>
              <CardTitle className="text-red-600 flex items-center gap-2">
                <Trash2 className="h-5 w-5" />
                Delete Mission Template
              </CardTitle>
              <CardDescription>
                Are you sure you want to delete &quot;{mission.name}&quot;? This action cannot be undone.
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

// Loading fallback
function MissionDetailLoading() {
  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-stone-50">
      <div className="px-6 pt-4 bg-white border-b border-stone-200">
        <div className="h-6 w-64 bg-stone-200 animate-pulse rounded" />
      </div>
      <div className="flex items-center justify-between px-6 py-4 border-b border-stone-200 bg-white">
        <div className="flex items-center gap-4">
          <div className="h-8 w-16 bg-stone-200 animate-pulse rounded" />
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-stone-200 animate-pulse rounded" />
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

export default function MissionDetailPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  return (
    <Suspense fallback={<MissionDetailLoading />}>
      <MissionDetailContent id={id} />
    </Suspense>
  );
}

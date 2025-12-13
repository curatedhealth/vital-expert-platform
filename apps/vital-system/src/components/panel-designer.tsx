'use client';

import React, { useState, useEffect } from 'react';
import { Save, Loader2, Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PanelDesignerProps {
  panel: {
    id: string;
    slug: string;
    name: string;
    description: string;
    category: string;
    mode: string;
    framework: string;
    suggested_agents: string[];
    default_settings: Record<string, any>;
    metadata: Record<string, any>;
    agents: Array<{
      id: string;
      name: string;
      display_name: string;
    }>;
  };
  onSave: (updatedPanel: any) => Promise<void>;
}

export function PanelDesigner({ panel, onSave }: PanelDesignerProps) {
  const [name, setName] = useState(panel.name);
  const [description, setDescription] = useState(panel.description);
  const [category, setCategory] = useState(panel.category);
  const [mode, setMode] = useState(panel.mode);
  const [framework, setFramework] = useState(panel.framework);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    panel.agents.map(a => a.id)
  );
  const [settings, setSettings] = useState(panel.default_settings || {});
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    const changed =
      name !== panel.name ||
      description !== panel.description ||
      category !== panel.category ||
      mode !== panel.mode ||
      framework !== panel.framework ||
      JSON.stringify(selectedAgents) !== JSON.stringify(panel.agents.map(a => a.id)) ||
      JSON.stringify(settings) !== JSON.stringify(panel.default_settings);
    setHasChanges(changed);
  }, [name, description, category, mode, framework, selectedAgents, settings, panel]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const updatedPanel = {
        name,
        description,
        category,
        mode,
        framework,
        selected_agents: selectedAgents,
        default_settings: settings,
        metadata: panel.metadata,
      };
      await onSave(updatedPanel);
      setHasChanges(false);
    } catch (error) {
      console.error('Failed to save panel:', error);
    } finally {
      setSaving(false);
    }
  };

  const toggleAgent = (agentId: string) => {
    setSelectedAgents((prev) =>
      prev.includes(agentId)
        ? prev.filter((id) => id !== agentId)
        : [...prev, agentId]
    );
  };

  const updateSetting = (key: string, value: any) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      {/* Save Button */}
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={saving || !hasChanges}
          className="bg-gradient-to-r from-blue-600 to-purple-600"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </>
          )}
        </Button>
      </div>

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="name">Panel Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter panel name"
            />
          </div>
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter panel description"
              rows={3}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="panel"
              />
            </div>
            <div>
              <Label htmlFor="mode">Mode</Label>
              <Select value={mode} onValueChange={setMode}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sequential">Sequential</SelectItem>
                  <SelectItem value="collaborative">Collaborative</SelectItem>
                  <SelectItem value="hybrid">Hybrid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label htmlFor="framework">Framework</Label>
            <Select value={framework} onValueChange={setFramework}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="langgraph">LangGraph</SelectItem>
                <SelectItem value="autogen">AutoGen</SelectItem>
                <SelectItem value="crewai">CrewAI</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selected Agents ({selectedAgents.length})</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {panel.agents.map((agent) => {
              const isSelected = selectedAgents.includes(agent.id);
              return (
                <div
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    isSelected
                      ? 'border-purple-500 bg-purple-50'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{agent.display_name}</p>
                      <p className="text-xs text-muted-foreground">{agent.name}</p>
                    </div>
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-purple-500 flex items-center justify-center">
                        <Check className="w-3 h-3 text-white" />
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Panel Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="userGuidance">User Guidance</Label>
              <p className="text-sm text-muted-foreground">Level of guidance provided</p>
            </div>
            <Select
              value={settings.userGuidance || 'medium'}
              onValueChange={(value) => updateSetting('userGuidance', value)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">Low</SelectItem>
                <SelectItem value="medium">Medium</SelectItem>
                <SelectItem value="high">High</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="allowDebate">Allow Debate</Label>
              <p className="text-sm text-muted-foreground">Enable multi-round debate</p>
            </div>
            <Switch
              checked={settings.allowDebate ?? true}
              onCheckedChange={(checked) => updateSetting('allowDebate', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="maxRounds">Max Rounds</Label>
              <p className="text-sm text-muted-foreground">Maximum discussion rounds</p>
            </div>
            <Input
              type="number"
              min="1"
              max="10"
              value={settings.maxRounds || 3}
              onChange={(e) => updateSetting('maxRounds', parseInt(e.target.value))}
              className="w-20"
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="requireConsensus">Require Consensus</Label>
              <p className="text-sm text-muted-foreground">Require high consensus before completing</p>
            </div>
            <Switch
              checked={settings.requireConsensus ?? false}
              onCheckedChange={(checked) => updateSetting('requireConsensus', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Workflow Definition (JSON Editor) */}
      <Card>
        <CardHeader>
          <CardTitle>Workflow Definition</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={JSON.stringify(panel.metadata || {}, null, 2)}
            readOnly
            className="font-mono text-sm"
            rows={10}
          />
          <p className="text-xs text-muted-foreground mt-2">
            Workflow definition is managed by the system. Advanced editing coming soon.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}



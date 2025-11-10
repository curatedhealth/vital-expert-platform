/**
 * Panel Customizer Component
 *
 * AI-powered panel customization with:
 * - Expert selection and modification
 * - Configuration adjustments
 * - Natural language instructions
 * - Preview and validation
 */

'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Bot,
  Users,
  Clock,
  Settings,
  Save,
  Play,
  Wand2,
  Plus,
  X,
  Edit,
  CheckCircle,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import type { PanelTemplate } from './PanelTemplatesLibrary';

// ============================================================================
// TYPES
// ============================================================================

interface CustomizationState {
  name: string;
  description: string;
  selectedAgents: string[];
  expertCount: number;
  duration: number;
  rounds: number;
  requiresModerator: boolean;
  enableConsensus: boolean;
  aiInstructions: string;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface PanelCustomizerProps {
  template: PanelTemplate;
  onSave: (customized: PanelTemplate) => void;
  onCancel: () => void;
  onRun: (customized: PanelTemplate) => void;
}

export function PanelCustomizer({ template, onSave, onCancel, onRun }: PanelCustomizerProps) {
  const [customization, setCustomization] = useState<CustomizationState>({
    name: template.name,
    description: template.description,
    selectedAgents: [...template.suggestedAgents],
    expertCount: template.optimalExperts,
    duration: template.durationTypical,
    rounds: template.maxRounds,
    requiresModerator: template.requiresModerator,
    enableConsensus: template.enableConsensus,
    aiInstructions: '',
  });

  const [showAIAssist, setShowAIAssist] = useState(false);
  const [aiProcessing, setAiProcessing] = useState(false);

  // Handle AI-powered customization
  const handleAICustomize = async () => {
    if (!customization.aiInstructions.trim()) return;

    setAiProcessing(true);

    // Simulate AI processing
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // TODO: Actual AI integration
    // For now, just show that it processed
    alert('AI customization processed! (Integration coming soon)');

    setAiProcessing(false);
    setCustomization((prev) => ({ ...prev, aiInstructions: '' }));
  };

  // Handle expert addition
  const handleAddExpert = () => {
    const newExpert = window.prompt('Enter expert name:');
    if (newExpert && newExpert.trim()) {
      setCustomization((prev) => ({
        ...prev,
        selectedAgents: [...prev.selectedAgents, newExpert.trim()],
      }));
    }
  };

  // Handle expert removal
  const handleRemoveExpert = (index: number) => {
    setCustomization((prev) => ({
      ...prev,
      selectedAgents: prev.selectedAgents.filter((_, i) => i !== index),
    }));
  };

  // Save customization
  const handleSave = () => {
    const customized: PanelTemplate = {
      ...template,
      id: `${template.id}-custom-${Date.now()}`,
      name: customization.name,
      description: customization.description,
      suggestedAgents: customization.selectedAgents,
      optimalExperts: customization.expertCount,
      durationTypical: customization.duration,
      maxRounds: customization.rounds,
      requiresModerator: customization.requiresModerator,
      enableConsensus: customization.enableConsensus,
      isPreset: false,
    };
    onSave(customized);
  };

  // Run customized panel
  const handleRun = () => {
    const customized: PanelTemplate = {
      ...template,
      id: `${template.id}-custom-${Date.now()}`,
      name: customization.name,
      description: customization.description,
      suggestedAgents: customization.selectedAgents,
      optimalExperts: customization.expertCount,
      durationTypical: customization.duration,
      maxRounds: customization.rounds,
      requiresModerator: customization.requiresModerator,
      enableConsensus: customization.enableConsensus,
      isPreset: false,
    };
    onRun(customized);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-3">
          <Wand2 className="w-7 h-7 text-white" />
        </div>
        <h2 className="text-3xl font-bold">Customize Your Panel</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Modify the template to match your specific needs. Adjust experts, configuration,
          or use AI to help optimize your panel.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Edit className="w-5 h-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Panel Name</Label>
                <Input
                  id="name"
                  value={customization.name}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter panel name"
                />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={customization.description}
                  onChange={(e) =>
                    setCustomization((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="Describe the panel's purpose"
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Expert Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                Expert Selection
              </CardTitle>
              <CardDescription>
                Choose the AI experts for your panel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {customization.selectedAgents.map((agent, idx) => (
                  <Badge key={idx} variant="secondary" className="text-sm py-1.5 px-3">
                    {agent}
                    <button
                      onClick={() => handleRemoveExpert(idx)}
                      className="ml-2 hover:text-destructive"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <Button variant="outline" size="sm" onClick={handleAddExpert}>
                <Plus className="w-4 h-4 mr-2" />
                Add Expert
              </Button>
            </CardContent>
          </Card>

          {/* Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Panel Configuration
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Duration */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Duration (minutes)</Label>
                  <span className="text-sm font-medium">{customization.duration} min</span>
                </div>
                <Slider
                  value={[customization.duration]}
                  onValueChange={([value]) =>
                    setCustomization((prev) => ({ ...prev, duration: value }))
                  }
                  min={template.durationMin}
                  max={template.durationMax}
                  step={5}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{template.durationMin} min</span>
                  <span>{template.durationMax} min</span>
                </div>
              </div>

              {/* Expert Count */}
              <div>
                <div className="flex justify-between mb-2">
                  <Label>Number of Experts</Label>
                  <span className="text-sm font-medium">{customization.expertCount}</span>
                </div>
                <Slider
                  value={[customization.expertCount]}
                  onValueChange={([value]) =>
                    setCustomization((prev) => ({ ...prev, expertCount: value }))
                  }
                  min={template.minExperts}
                  max={template.maxExperts}
                  step={1}
                />
                <div className="flex justify-between text-xs text-muted-foreground mt-1">
                  <span>{template.minExperts} experts</span>
                  <span>{template.maxExperts} experts</span>
                </div>
              </div>

              {/* Rounds */}
              {template.maxRounds > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <Label>Discussion Rounds</Label>
                    <span className="text-sm font-medium">{customization.rounds}</span>
                  </div>
                  <Slider
                    value={[customization.rounds]}
                    onValueChange={([value]) =>
                      setCustomization((prev) => ({ ...prev, rounds: value }))
                    }
                    min={1}
                    max={template.maxRounds}
                    step={1}
                  />
                </div>
              )}

              {/* Switches */}
              <div className="space-y-3 pt-3 border-t">
                <div className="flex items-center justify-between">
                  <Label htmlFor="moderator" className="cursor-pointer">
                    Require Moderator
                  </Label>
                  <Switch
                    id="moderator"
                    checked={customization.requiresModerator}
                    onCheckedChange={(checked) =>
                      setCustomization((prev) => ({ ...prev, requiresModerator: checked }))
                    }
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="consensus" className="cursor-pointer">
                    Enable Consensus Building
                  </Label>
                  <Switch
                    id="consensus"
                    checked={customization.enableConsensus}
                    onCheckedChange={(checked) =>
                      setCustomization((prev) => ({ ...prev, enableConsensus: checked }))
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Assist */}
          <Card className="border-purple-200 bg-purple-50/50 dark:bg-purple-900/10">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-purple-600">
                <Sparkles className="w-5 h-5" />
                AI Assistant (Coming Soon)
              </CardTitle>
              <CardDescription>
                Describe what you want to change in natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                value={customization.aiInstructions}
                onChange={(e) =>
                  setCustomization((prev) => ({ ...prev, aiInstructions: e.target.value }))
                }
                placeholder="Example: Add more regulatory experts and increase duration to 30 minutes..."
                rows={3}
                disabled={aiProcessing}
              />
              <Button
                onClick={handleAICustomize}
                disabled={!customization.aiInstructions.trim() || aiProcessing}
                className="w-full bg-gradient-to-r from-purple-500 to-pink-500"
              >
                {aiProcessing ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Processing...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Apply AI Suggestions
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Right: Preview & Actions */}
        <div className="space-y-6">
          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Preview</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="text-xs text-muted-foreground mb-1">Panel Name</div>
                <div className="font-medium">{customization.name}</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Type</div>
                <Badge variant="outline" className="capitalize">
                  {template.panelType}
                </Badge>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Experts</div>
                <div className="flex items-center gap-1">
                  <Users className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{customization.selectedAgents.length}</span>
                </div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground mb-1">Duration</div>
                <div className="flex items-center gap-1">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-medium">{customization.duration} minutes</span>
                </div>
              </div>
              {customization.rounds > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">Rounds</div>
                  <div className="text-sm font-medium">{customization.rounds}</div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleRun} className="w-full bg-gradient-to-r from-purple-500 to-pink-500">
                <Play className="w-4 h-4 mr-2" />
                Run Panel Now
              </Button>
              <Button onClick={handleSave} variant="outline" className="w-full">
                <Save className="w-4 h-4 mr-2" />
                Save for Later
              </Button>
              <Button onClick={onCancel} variant="ghost" className="w-full">
                Cancel
              </Button>
            </CardContent>
          </Card>

          {/* Validation */}
          <Card className="bg-green-50 dark:bg-green-900/10 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-2 text-sm text-green-800 dark:text-green-200">
                <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Configuration Valid</div>
                  <div className="text-xs opacity-80">
                    Your panel is properly configured and ready to run
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

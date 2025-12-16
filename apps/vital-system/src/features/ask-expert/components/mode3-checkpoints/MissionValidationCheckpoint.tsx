'use client';

/**
 * HITL Checkpoint 3: Mission Validation
 *
 * Final review before mission launch. Summary of goals, plan, team, and settings.
 * Supports saving as draft or template.
 */

import React, { useState } from 'react';
import {
  Rocket,
  Save,
  FileText,
  Target,
  Map,
  Users,
  Package,
  Settings,
  Clock,
  AlertCircle,
  Edit2,
  DollarSign,
  Gauge
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { MissionConfig, MissionValidationCheckpointProps } from '../../mode-3/types/mode3.types';

export function MissionValidationCheckpoint({
  config,
  onLaunch,
  onSaveDraft,
  onSaveTemplate,
  onEditSection,
  isLoading = false
}: MissionValidationCheckpointProps) {
  const [showDraftDialog, setShowDraftDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [draftName, setDraftName] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const totalDuration = config.plan?.reduce((sum, p) => sum + p.estimated_duration_minutes, 0) || 0;
  const totalSteps = config.plan?.reduce((sum, p) => sum + p.steps.length, 0) || 0;

  const handleSaveDraft = () => {
    if (!draftName.trim()) return;
    onSaveDraft(draftName, config);
    setShowDraftDialog(false);
    setDraftName('');
  };

  const handleSaveTemplate = () => {
    if (!templateName.trim()) return;
    onSaveTemplate(templateName, templateDescription, config);
    setShowTemplateDialog(false);
    setTemplateName('');
    setTemplateDescription('');
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Mission Validation
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review all mission parameters before launch. You can save this configuration or launch immediately.
        </p>
      </div>

      {/* Critical Info Alert */}
      <Alert className="border-fuchsia-200 dark:border-fuchsia-800 bg-fuchsia-50 dark:bg-fuchsia-950">
        <AlertCircle className="h-4 w-4 text-fuchsia-600" />
        <AlertDescription className="text-fuchsia-900 dark:text-fuchsia-100">
          Once launched, you cannot modify the plan but can pause, cancel, or refine and relaunch.
        </AlertDescription>
      </Alert>

      {/* Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Goals Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-fuchsia-600" />
                <CardTitle>Mission Goals</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditSection('goals')}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {config.goals?.length || 0}
              </div>
              <CardDescription>Total Goals</CardDescription>
              <Separator className="my-3" />
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {config.goals?.map((goal, index) => (
                  <div key={goal.id} className="text-sm">
                    <span className="font-medium text-fuchsia-600">{index + 1}.</span>{' '}
                    <span className="text-gray-700 dark:text-gray-300">
                      {goal.text.substring(0, 80)}
                      {goal.text.length > 80 ? '...' : ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Execution Plan Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-5 w-5 text-blue-600" />
                <CardTitle>Execution Plan</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditSection('plan')}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {config.plan?.length || 0}
                </div>
                <CardDescription>Phases</CardDescription>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSteps}
                </div>
                <CardDescription>Total Steps</CardDescription>
              </div>
            </div>
            <Separator className="my-3" />
            <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
              <Clock className="h-4 w-4" />
              <span className="font-medium">Estimated:</span>
              <span>{formatDuration(totalDuration)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Team Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-green-600" />
                <CardTitle>Mission Team</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditSection('team')}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {config.team?.length || 0}
              </div>
              <CardDescription>AI Agents</CardDescription>
              <Separator className="my-3" />
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {config.team?.map((member) => (
                  <div key={member.id} className="flex items-center gap-2">
                    {member.avatar ? (
                      <img
                        src={member.avatar}
                        alt={member.agent_name}
                        className="w-6 h-6 rounded-full"
                      />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-fuchsia-400 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                        {member.agent_name.charAt(0)}
                      </div>
                    )}
                    <div className="flex-1 text-sm">
                      <div className="font-medium text-gray-900 dark:text-white">
                        {member.agent_name}
                      </div>
                      <div className="text-xs text-gray-600 dark:text-gray-400">
                        {member.role}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Settings Summary */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-amber-600" />
                <CardTitle>Mission Settings</CardTitle>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onEditSection('settings')}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Max Iterations
                </span>
                <Badge variant="outline">
                  {config.loops?.max_iterations || 'N/A'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Auto Refinement
                </span>
                <Badge variant={config.loops?.enable_auto_refinement ? 'default' : 'secondary'}>
                  {config.loops?.enable_auto_refinement ? 'Enabled' : 'Disabled'}
                </Badge>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Deliverables
                </span>
                <Badge variant="outline">
                  {config.deliverables?.length || 0}
                </Badge>
              </div>
              {config.quality_threshold && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    Quality Threshold
                  </span>
                  <Badge variant="outline">
                    {config.quality_threshold}%
                  </Badge>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Deliverables Preview */}
      {config.deliverables && config.deliverables.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-purple-600" />
              <CardTitle>Expected Deliverables</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {config.deliverables.map((deliverable) => (
                <div
                  key={deliverable.id}
                  className="border rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <div className="font-medium text-sm text-gray-900 dark:text-white">
                    {deliverable.name}
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    {deliverable.type.toUpperCase()}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <div className="flex gap-3">
          {/* Save Draft Dialog */}
          <Dialog open={showDraftDialog} onOpenChange={setShowDraftDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Draft
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save Mission Draft</DialogTitle>
                <DialogDescription>
                  Save this mission configuration to continue later
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="draft-name">Draft Name</Label>
                  <Input
                    id="draft-name"
                    value={draftName}
                    onChange={(e) => setDraftName(e.target.value)}
                    placeholder="My Mission Draft"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowDraftDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveDraft} disabled={!draftName.trim()}>
                    Save Draft
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          {/* Save Template Dialog */}
          <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Save as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Mission Template</DialogTitle>
                <DialogDescription>
                  Save this as a reusable template for future missions
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="template-name">Template Name</Label>
                  <Input
                    id="template-name"
                    value={templateName}
                    onChange={(e) => setTemplateName(e.target.value)}
                    placeholder="Research Mission Template"
                  />
                </div>
                <div>
                  <Label htmlFor="template-description">Description</Label>
                  <Textarea
                    id="template-description"
                    value={templateDescription}
                    onChange={(e) => setTemplateDescription(e.target.value)}
                    placeholder="Describe when to use this template..."
                    className="min-h-[100px]"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    onClick={() => setShowTemplateDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button onClick={handleSaveTemplate} disabled={!templateName.trim()}>
                    Create Template
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Launch Button */}
        <Button
          onClick={() => onLaunch(config)}
          disabled={isLoading}
          size="lg"
          className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
        >
          <Rocket className="h-5 w-5 mr-2" />
          {isLoading ? 'Launching...' : 'Launch Mission'}
        </Button>
      </div>
    </div>
  );
}

export default MissionValidationCheckpoint;

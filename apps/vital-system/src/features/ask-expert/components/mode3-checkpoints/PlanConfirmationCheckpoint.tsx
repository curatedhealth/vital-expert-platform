'use client';

/**
 * HITL Checkpoint 2: Plan Confirmation
 *
 * User reviews generated execution plan with phases and steps.
 * Supports collapsible sections, editing, and reordering.
 */

import React, { useState, useCallback } from 'react';
import {
  GripVertical,
  ChevronDown,
  ChevronRight,
  Clock,
  AlertCircle,
  Edit2,
  Check,
  X,
  Layers
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import type { PlanPhase, PlanConfirmationCheckpointProps } from '../../mode-3/types/mode3.types';

export function PlanConfirmationCheckpoint({
  phases: initialPhases,
  estimatedDuration,
  estimatedCost,
  onConfirm,
  onRefine,
  onBack,
  isLoading = false
}: PlanConfirmationCheckpointProps) {
  const [phases, setPhases] = useState<PlanPhase[]>(initialPhases);
  const [expandedPhases, setExpandedPhases] = useState<Set<string>>(
    new Set(initialPhases.map(p => p.id))
  );
  const [editingPhase, setEditingPhase] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const togglePhase = (phaseId: string) => {
    const newExpanded = new Set(expandedPhases);
    if (newExpanded.has(phaseId)) {
      newExpanded.delete(phaseId);
    } else {
      newExpanded.add(phaseId);
    }
    setExpandedPhases(newExpanded);
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = Array.from(phases);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(index, 0, reorderedItem);

    const reordered = items.map((item, idx) => ({ ...item, order: idx }));
    setPhases(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleUpdatePhase = useCallback((phaseId: string, updates: Partial<PlanPhase>) => {
    setPhases(phases.map(p => p.id === phaseId ? { ...p, ...updates } : p));
  }, [phases]);

  const formatDuration = (minutes: number): string => {
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const totalDuration = phases.reduce((sum, p) => sum + p.estimated_duration_minutes, 0);
  const totalSteps = phases.reduce((sum, p) => sum + p.steps.length, 0);

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Confirm Execution Plan
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review the execution plan steps. Edit names, descriptions, or durations as needed.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Layers className="h-5 w-5 text-fuchsia-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {phases.length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Steps
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-5 w-5 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                <span className="text-xs font-bold text-blue-600 dark:text-blue-400">#</span>
              </div>
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalSteps}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Total Steps
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5 text-amber-600" />
              <div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatDuration(estimatedDuration || totalDuration)}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  Estimated Duration
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Steps will execute sequentially. Drag to reorder steps. Click on any step to expand/collapse details.
        </AlertDescription>
      </Alert>

      {/* Phases List */}
      <div className="space-y-3">
        {phases.map((phase, index) => {
          const isExpanded = expandedPhases.has(phase.id);
          const isEditing = editingPhase === phase.id;

          return (
            <Card
              key={phase.id}
              draggable={!isEditing}
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragEnd={handleDragEnd}
              className={draggedIndex === index ? 'opacity-50 ring-2 ring-fuchsia-500' : ''}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start gap-3">
                  {/* Drag Handle */}
                  <div className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Expand/Collapse */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => togglePhase(phase.id)}
                    className="mt-0.5 transition-all duration-150 active:scale-90 active:bg-gray-200 dark:active:bg-gray-700"
                  >
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </Button>

                  {/* Content */}
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label htmlFor={`phase-name-${phase.id}`}>Step Name</Label>
                          <Input
                            id={`phase-name-${phase.id}`}
                            value={phase.name}
                            onChange={(e) => handleUpdatePhase(phase.id, { name: e.target.value })}
                            placeholder="Phase name..."
                          />
                        </div>
                        <div>
                          <Label htmlFor={`phase-desc-${phase.id}`}>Description</Label>
                          <Textarea
                            id={`phase-desc-${phase.id}`}
                            value={phase.description}
                            onChange={(e) => handleUpdatePhase(phase.id, { description: e.target.value })}
                            placeholder="Phase description..."
                            className="min-h-[80px]"
                          />
                        </div>
                        <div>
                          <Label htmlFor={`phase-duration-${phase.id}`}>
                            Estimated Duration (minutes)
                          </Label>
                          <Input
                            id={`phase-duration-${phase.id}`}
                            type="number"
                            value={phase.estimated_duration_minutes}
                            onChange={(e) => handleUpdatePhase(phase.id, {
                              estimated_duration_minutes: parseInt(e.target.value) || 0
                            })}
                            min={1}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingPhase(null)}
                            className="transition-all duration-150 active:scale-95 active:bg-primary/80"
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingPhase(null)}
                            className="transition-all duration-150 active:scale-95 active:bg-gray-100 dark:active:bg-gray-800"
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="font-mono">
                              Step {index + 1}
                            </Badge>
                            <CardTitle className="text-lg">{phase.name}</CardTitle>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setEditingPhase(phase.id)}
                            className="transition-all duration-150 active:scale-90 active:bg-gray-200 dark:active:bg-gray-700"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                        </div>
                        <CardDescription>{phase.description}</CardDescription>
                        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatDuration(phase.estimated_duration_minutes)}
                          </div>
                          <div>
                            {phase.steps.length} step{phase.steps.length !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardHeader>

              {/* Steps (when expanded) */}
              {isExpanded && !isEditing && (
                <CardContent className="pt-0">
                  <Separator className="mb-4" />
                  <div className="space-y-3">
                    {phase.steps.map((step, stepIndex) => (
                      <div
                        key={step.id}
                        className="pl-4 border-l-2 border-gray-200 dark:border-gray-700 py-2"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900 dark:text-white">
                              {stepIndex + 1}. {step.name}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {step.description}
                            </div>
                            <div className="flex items-center gap-3 mt-2 text-xs text-gray-500 flex-wrap">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {formatDuration(step.estimated_duration_minutes)}
                              </span>
                              {step.assigned_to && (
                                <Badge variant="secondary" className="text-xs">
                                  {step.assigned_to}
                                </Badge>
                              )}
                              {step.tools_required && step.tools_required.length > 0 && (
                                <span className="text-gray-400">
                                  Tools: {step.tools_required.join(', ')}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              )}
            </Card>
          );
        })}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isLoading}
          className="transition-all duration-150 active:scale-95 active:bg-gray-100 dark:active:bg-gray-800"
        >
          Back to Goals
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRefine}
            disabled={isLoading}
            className="transition-all duration-150 active:scale-95 active:bg-gray-100 dark:active:bg-gray-800"
          >
            Refine Plan
          </Button>
          <Button
            onClick={() => onConfirm(phases)}
            disabled={isLoading}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white transition-all duration-150 active:scale-95 active:bg-fuchsia-800"
          >
            {isLoading ? 'Processing...' : 'Confirm Plan'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default PlanConfirmationCheckpoint;

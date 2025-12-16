'use client';

/**
 * HITL Checkpoint 1: Goal Confirmation
 *
 * User reviews, edits, adds, removes, and reorders goals parsed by L1 orchestrator.
 * Includes priority assignment and inline editing capabilities.
 */

import React, { useState, useCallback } from 'react';
import { GripVertical, Plus, Trash2, AlertCircle, Edit2, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import type { MissionGoal, GoalConfirmationCheckpointProps } from '../../mode-3/types/mode3.types';

export function GoalConfirmationCheckpoint({
  goals: initialGoals,
  originalPrompt,
  onConfirm,
  onRefine,
  onStartOver,
  isLoading = false
}: GoalConfirmationCheckpointProps) {
  const [goals, setGoals] = useState<MissionGoal[]>(initialGoals);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const items = Array.from(goals);
    const [reorderedItem] = items.splice(draggedIndex, 1);
    items.splice(index, 0, reorderedItem);

    const reordered = items.map((item, idx) => ({ ...item, order: idx }));
    setGoals(reordered);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const handleAddGoal = useCallback(() => {
    const newGoal: MissionGoal = {
      id: `goal-${Date.now()}`,
      text: '',
      priority: 3,
      order: goals.length,
      category: 'custom'
    };
    setGoals([...goals, newGoal]);
    setEditingId(newGoal.id);
  }, [goals]);

  const handleRemoveGoal = useCallback((id: string) => {
    setGoals(goals.filter(g => g.id !== id).map((g, idx) => ({ ...g, order: idx })));
  }, [goals]);

  const handleUpdateGoal = useCallback((id: string, updates: Partial<MissionGoal>) => {
    setGoals(goals.map(g => g.id === id ? { ...g, ...updates } : g));
  }, [goals]);

  const handleConfirm = () => {
    const hasEmpty = goals.some(g => !g.text.trim());
    if (hasEmpty) {
      return; // Could show a toast here
    }
    onConfirm(goals);
  };

  const getPriorityColor = (priority: number): string => {
    if (priority >= 4) return 'text-red-600 dark:text-red-400';
    if (priority === 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-blue-600 dark:text-blue-400';
  };

  const getPriorityLabel = (priority: number): string => {
    if (priority === 5) return 'Critical';
    if (priority === 4) return 'High';
    if (priority === 3) return 'Medium';
    if (priority === 2) return 'Low';
    return 'Very Low';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Confirm Mission Goals
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review and refine the goals identified by the AI. You can edit, reorder, add, or remove goals.
        </p>
      </div>

      {/* Original Prompt Reference */}
      {originalPrompt && (
        <Card className="bg-gray-50 dark:bg-gray-800/50">
          <CardContent className="pt-4">
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Original Request:</p>
            <p className="text-gray-700 dark:text-gray-300 italic">"{originalPrompt}"</p>
          </CardContent>
        </Card>
      )}

      {/* Info Alert */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          These goals will guide the mission execution. Higher priority goals will be addressed first.
          Drag goals to reorder them.
        </AlertDescription>
      </Alert>

      {/* Goals List */}
      <Card>
        <CardHeader>
          <CardTitle>Mission Goals ({goals.length})</CardTitle>
          <CardDescription>
            Drag to reorder, click to edit, or remove unwanted goals
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {goals.map((goal, index) => (
              <div
                key={goal.id}
                draggable
                onDragStart={() => handleDragStart(index)}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragEnd={handleDragEnd}
                className={`
                  border rounded-lg p-4 bg-white dark:bg-gray-800
                  ${draggedIndex === index ? 'opacity-50 ring-2 ring-fuchsia-500' : ''}
                  transition-all cursor-move hover:shadow-md
                `}
              >
                <div className="flex items-start gap-4">
                  {/* Drag Handle */}
                  <div className="mt-1 text-gray-400 hover:text-gray-600 cursor-grab active:cursor-grabbing">
                    <GripVertical className="h-5 w-5" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-3">
                    {/* Goal Number and Priority */}
                    <div className="flex items-center gap-3 flex-wrap">
                      <Badge variant="outline" className="font-mono">
                        Goal {index + 1}
                      </Badge>
                      <Select
                        value={goal.priority.toString()}
                        onValueChange={(value) =>
                          handleUpdateGoal(goal.id, { priority: parseInt(value) })
                        }
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">Critical</SelectItem>
                          <SelectItem value="4">High</SelectItem>
                          <SelectItem value="3">Medium</SelectItem>
                          <SelectItem value="2">Low</SelectItem>
                          <SelectItem value="1">Very Low</SelectItem>
                        </SelectContent>
                      </Select>
                      <span className={`text-sm font-medium ${getPriorityColor(goal.priority)}`}>
                        {getPriorityLabel(goal.priority)}
                      </span>
                      {goal.confidence && (
                        <Badge variant="secondary" className="text-xs">
                          {Math.round(goal.confidence * 100)}% confidence
                        </Badge>
                      )}
                    </div>

                    {/* Goal Text */}
                    {editingId === goal.id ? (
                      <div className="space-y-2">
                        <Label htmlFor={`goal-${goal.id}`}>Goal Description</Label>
                        <Textarea
                          id={`goal-${goal.id}`}
                          value={goal.text}
                          onChange={(e) => handleUpdateGoal(goal.id, { text: e.target.value })}
                          placeholder="Describe the goal..."
                          className="min-h-[100px]"
                          autoFocus
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => setEditingId(null)}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Save
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditingId(null)}
                          >
                            <X className="h-4 w-4 mr-1" />
                            Cancel
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div
                        className="text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 p-2 rounded transition-colors flex items-start gap-2"
                        onClick={() => setEditingId(goal.id)}
                      >
                        <span className="flex-1">
                          {goal.text || <span className="text-gray-400 italic">Click to add description...</span>}
                        </span>
                        <Edit2 className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
                      </div>
                    )}

                    {/* Category */}
                    {goal.category && goal.category !== 'custom' && (
                      <Badge variant="secondary" className="text-xs">
                        {goal.category}
                      </Badge>
                    )}
                  </div>

                  {/* Remove Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveGoal(goal.id)}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Add Goal Button */}
          <Button
            variant="outline"
            onClick={handleAddGoal}
            className="w-full mt-4 border-dashed"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Goal
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={onStartOver}
          disabled={isLoading}
        >
          Start Over
        </Button>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={onRefine}
            disabled={isLoading}
          >
            Refine Goals
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={isLoading || goals.length === 0 || goals.some(g => !g.text.trim())}
            className="bg-fuchsia-600 hover:bg-fuchsia-700 text-white"
          >
            {isLoading ? 'Processing...' : 'Confirm Goals'}
          </Button>
        </div>
      </div>
    </div>
  );
}

export default GoalConfirmationCheckpoint;

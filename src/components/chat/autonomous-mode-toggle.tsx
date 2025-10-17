'use client';

import React, { useState } from 'react';
import { Bot, Settings, Play, Pause, Square, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

interface AutonomousModeToggleProps {
  isAutonomousMode: boolean;
  onToggleAutonomousMode: (enabled: boolean) => void;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onStop: () => void;
  maxIterations: number;
  onMaxIterationsChange: (value: number[]) => void;
  maxCost: number;
  onMaxCostChange: (value: number[]) => void;
  supervisionLevel: 'none' | 'low' | 'medium' | 'high';
  onSupervisionLevelChange: (level: 'none' | 'low' | 'medium' | 'high') => void;
  className?: string;
}

export function AutonomousModeToggle({
  isAutonomousMode,
  onToggleAutonomousMode,
  isRunning,
  onStart,
  onPause,
  onStop,
  maxIterations,
  onMaxIterationsChange,
  maxCost,
  onMaxCostChange,
  supervisionLevel,
  onSupervisionLevelChange,
  className
}: AutonomousModeToggleProps) {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const supervisionLevels = [
    { value: 'none', label: 'None', description: 'Fully autonomous', color: 'bg-green-500' },
    { value: 'low', label: 'Low', description: 'Minimal oversight', color: 'bg-yellow-500' },
    { value: 'medium', label: 'Medium', description: 'Regular checkpoints', color: 'bg-orange-500' },
    { value: 'high', label: 'High', description: 'Frequent intervention', color: 'bg-red-500' }
  ];

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-lg">Autonomous Mode</CardTitle>
            <Badge variant={isAutonomousMode ? "default" : "secondary"}>
              {isAutonomousMode ? "Active" : "Inactive"}
            </Badge>
          </div>
          <div className="flex items-center space-x-2">
            <Switch
              checked={isAutonomousMode}
              onCheckedChange={onToggleAutonomousMode}
              disabled={isRunning}
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAdvanced(!showAdvanced)}
              disabled={!isAutonomousMode}
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {isAutonomousMode && (
        <CardContent className="space-y-4">
          {/* Control Buttons */}
          <div className="flex items-center space-x-2">
            {!isRunning ? (
              <Button
                onClick={onStart}
                className="flex items-center space-x-2"
                size="sm"
              >
                <Play className="h-4 w-4" />
                <span>Start Autonomous Task</span>
              </Button>
            ) : (
              <div className="flex items-center space-x-2">
                <Button
                  onClick={onPause}
                  variant="outline"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Pause className="h-4 w-4" />
                  <span>Pause</span>
                </Button>
                <Button
                  onClick={onStop}
                  variant="destructive"
                  size="sm"
                  className="flex items-center space-x-2"
                >
                  <Square className="h-4 w-4" />
                  <span>Stop</span>
                </Button>
              </div>
            )}
          </div>

          {/* Status Indicator */}
          {isRunning && (
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <div className="h-2 w-2 bg-green-500 rounded-full animate-pulse" />
              <span>Autonomous task in progress...</span>
            </div>
          )}

          {/* Advanced Settings */}
          {showAdvanced && (
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-3">
                <div>
                  <Label className="text-sm font-medium">
                    Max Iterations: {maxIterations}
                  </Label>
                  <Slider
                    value={[maxIterations]}
                    onValueChange={onMaxIterationsChange}
                    max={50}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium">
                    Max Cost: ${maxCost}
                  </Label>
                  <Slider
                    value={[maxCost]}
                    onValueChange={onMaxCostChange}
                    max={100}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label className="text-sm font-medium mb-2 block">
                    Supervision Level
                  </Label>
                  <div className="grid grid-cols-2 gap-2">
                    {supervisionLevels.map((level) => (
                      <Button
                        key={level.value}
                        variant={supervisionLevel === level.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => onSupervisionLevelChange(level.value as any)}
                        className="justify-start"
                      >
                        <div className={cn("h-2 w-2 rounded-full mr-2", level.color)} />
                        <div className="text-left">
                          <div className="text-xs font-medium">{level.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {level.description}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Quick Info */}
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3" />
              <span>AI agents will work autonomously to achieve your goal</span>
            </div>
            <div className="flex items-center space-x-1">
              <Settings className="h-3 w-3" />
              <span>Configure safety limits and supervision level</span>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}

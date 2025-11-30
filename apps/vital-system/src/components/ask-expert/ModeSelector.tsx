/**
 * Ask Expert Mode Selector - Phase 4
 * Allows user to select from 4 modes using a 2x2 toggle matrix
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { User, Zap, MessageCircle, Brain } from 'lucide-react';

interface ModeSelectorProps {
  isAutomatic: boolean;
  isAutonomous: boolean;
  onModeChange: (isAutomatic: boolean, isAutonomous: boolean) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  isAutomatic,
  isAutonomous,
  onModeChange
}) => {
  // Determine current mode
  const getCurrentMode = () => {
    if (!isAutomatic && !isAutonomous) return { name: 'Manual-Interactive', color: 'blue' };
    if (isAutomatic && !isAutonomous) return { name: 'Auto-Interactive', color: 'green' };
    if (!isAutomatic && isAutonomous) return { name: 'Manual-Autonomous', color: 'orange' };
    return { name: 'Auto-Autonomous', color: 'purple' };
  };

  const currentMode = getCurrentMode();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageCircle className="h-5 w-5" />
          Ask Expert Mode
        </CardTitle>
        <CardDescription>
          Select how the AI selects experts and responds to your query
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Expert Selection Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            {isAutomatic ? (
              <Zap className="h-4 w-4 text-green-500" />
            ) : (
              <User className="h-4 w-4 text-blue-500" />
            )}
            <Label htmlFor="automatic-mode" className="cursor-pointer">
              Expert Selection
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Manual</span>
            <Switch
              id="automatic-mode"
              checked={isAutomatic}
              onCheckedChange={(checked) => onModeChange(checked, isAutonomous)}
            />
            <span className="text-sm text-muted-foreground">Automatic</span>
          </div>
        </div>

        {/* Interaction Type Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-center space-x-2">
            {isAutonomous ? (
              <Brain className="h-4 w-4 text-purple-500" />
            ) : (
              <MessageCircle className="h-4 w-4 text-blue-500" />
            )}
            <Label htmlFor="autonomous-mode" className="cursor-pointer">
              Interaction Type
            </Label>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">Interactive</span>
            <Switch
              id="autonomous-mode"
              checked={isAutonomous}
              onCheckedChange={(checked) => onModeChange(isAutomatic, checked)}
            />
            <span className="text-sm text-muted-foreground">Autonomous</span>
          </div>
        </div>

        {/* Current Mode Display */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Current Mode:</span>
            <Badge variant="outline" className={`bg-${currentMode.color}-50`}>
              {currentMode.name}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};






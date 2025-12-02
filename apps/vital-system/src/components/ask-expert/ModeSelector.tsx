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
  // GOLDEN RULE MATRIX:
  //                  | Manual Selection | Auto Selection  |
  //                  | (User picks)     | (System picks)  |
  // -----------------+------------------+-----------------+
  // Conversational   | Mode 1           | Mode 2          |
  // -----------------+------------------+-----------------+
  // Agentic          | Mode 3           | Mode 4          |
  // (CoT+ToT+ReAct)  |                  |                 |
  //
  // Agentic Modes (3 & 4) include:
  // - Chain-of-Thought (CoT): Step-by-step reasoning
  // - Tree-of-Thought (ToT): Explore multiple reasoning paths
  // - ReAct: Reasoning + Acting with tools
  // - Planning: Break down complex goals into sub-tasks
  // - Goal Loop: Iterate until objective is achieved
  const getCurrentMode = () => {
    if (!isAutomatic && !isAutonomous) return {
      name: 'Mode 1: Manual-Conversational',
      number: 1,
      color: 'blue',
      description: 'Direct Q&A with your selected expert'
    };
    if (isAutomatic && !isAutonomous) return {
      name: 'Mode 2: Auto-Conversational',
      number: 2,
      color: 'green',
      description: 'AI selects the best expert for your query'
    };
    if (!isAutomatic && isAutonomous) return {
      name: 'Mode 3: Manual-Agentic',
      number: 3,
      color: 'orange',
      description: 'Your expert uses CoT + ToT + ReAct reasoning until goal achieved'
    };
    return {
      name: 'Mode 4: Auto-Agentic',
      number: 4,
      color: 'purple',
      description: 'AI picks expert + uses CoT + ToT + ReAct reasoning until goal achieved'
    };
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











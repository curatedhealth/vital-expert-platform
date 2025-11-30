/**
 * HITL Controls Component - Phase 4
 * Allows user to configure Human-in-the-Loop safety settings
 */

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';

interface HITLControlsProps {
  hitlEnabled: boolean;
  safetyLevel: 'conservative' | 'balanced' | 'minimal';
  onHitlEnabledChange: (enabled: boolean) => void;
  onSafetyLevelChange: (level: 'conservative' | 'balanced' | 'minimal') => void;
}

export const HITLControls: React.FC<HITLControlsProps> = ({
  hitlEnabled,
  safetyLevel,
  onHitlEnabledChange,
  onSafetyLevelChange
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Human-in-the-Loop (HITL)
        </CardTitle>
        <CardDescription>
          Configure safety approvals for autonomous agent operations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Enable/Disable HITL */}
        <div className="flex items-center justify-between">
          <Label htmlFor="hitl-toggle" className="cursor-pointer">
            Enable HITL Approvals
          </Label>
          <Switch
            id="hitl-toggle"
            checked={hitlEnabled}
            onCheckedChange={onHitlEnabledChange}
          />
        </div>

        {/* Safety Level Selection */}
        {hitlEnabled && (
          <div className="space-y-3 pt-4 border-t">
            <Label>Safety Level</Label>
            <RadioGroup value={safetyLevel} onValueChange={onSafetyLevelChange}>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="conservative" id="conservative" />
                <Label htmlFor="conservative" className="cursor-pointer flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                  <span>Conservative - Approve all actions</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="balanced" id="balanced" />
                <Label htmlFor="balanced" className="cursor-pointer flex items-center gap-2">
                  <Shield className="h-4 w-4 text-orange-500" />
                  <span>Balanced - Approve risky actions</span>
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="minimal" id="minimal" />
                <Label htmlFor="minimal" className="cursor-pointer flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span>Minimal - Critical decisions only</span>
                </Label>
              </div>
            </RadioGroup>
          </div>
        )}
      </CardContent>
    </Card>
  );
};






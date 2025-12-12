/**
 * Personality Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles personality type selection and style tuning:
 * - Personality type dropdown (affects temperature and communication)
 * - Fine-tune personality traits via sliders (formality, empathy, directness, etc.)
 * - Communication style sliders (verbosity, technical level, warmth)
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { SliderGroup } from '@/components/ui/labeled-slider';
import {
  PERSONALITY_SLIDERS,
  COMMUNICATION_SLIDERS,
} from '../../types/agent.types';
import {
  Brain,
  BarChart3,
  Target,
  Lightbulb,
  Rocket,
  Heart,
  Wrench,
  Shield,
  Users,
  Microscope,
  TrendingUp,
  Settings,
  GraduationCap,
  Sparkles,
  Zap,
  type LucideIcon,
} from 'lucide-react';
import type { EditFormTabProps, PersonalityTypeOption } from './types';

// ============================================================================
// ICON MAP
// ============================================================================

const PERSONALITY_ICON_MAP: Record<string, LucideIcon> = {
  BarChart3,
  Target,
  Lightbulb,
  Rocket,
  Heart,
  Wrench,
  Shield,
  Users,
  Microscope,
  TrendingUp,
  Settings,
  GraduationCap,
  Brain,
  Sparkles,
  Zap,
};

// Helper component to render personality type icon
function PersonalityIcon({ iconName, className }: { iconName?: string; className?: string }) {
  if (!iconName) return null;
  const IconComponent = PERSONALITY_ICON_MAP[iconName];
  if (!IconComponent) return <span className={className}>{iconName}</span>;
  return <IconComponent className={className} />;
}

// ============================================================================
// TYPES
// ============================================================================

export interface PersonalityTabProps extends EditFormTabProps {
  /** Available personality types from database or fallback */
  personalityTypes: PersonalityTypeOption[];
  /** Callback when personality type changes (sets temperature and slider presets) */
  onPersonalityTypeChange: (selected: PersonalityTypeOption) => void;
}

// ============================================================================
// PERSONALITY TAB COMPONENT
// ============================================================================

export function PersonalityTab({
  formState,
  updateField,
  personalityTypes,
  onPersonalityTypeChange,
}: PersonalityTabProps) {
  // Slider update helper
  const updateSlider = React.useCallback(
    (key: string, value: number) => {
      updateField(key as keyof typeof formState, value);
    },
    [updateField]
  );

  // Handle personality type selection
  const handlePersonalityChange = React.useCallback(
    (value: string) => {
      const selected = personalityTypes.find((pt) => pt.id === value || pt.slug === value);
      if (selected) {
        onPersonalityTypeChange(selected);
      }
    },
    [personalityTypes, onPersonalityTypeChange]
  );

  // Find currently selected personality type for display
  const selectedPersonality = React.useMemo(() => {
    return personalityTypes.find(
      (pt) =>
        pt.id === formState.personality_type_id || pt.slug === formState.personality_type
    );
  }, [personalityTypes, formState.personality_type_id, formState.personality_type]);

  return (
    <div className="space-y-4">
      {/* Personality Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Personality Type
          </CardTitle>
          <CardDescription>
            Select a thinking style - this sets the agent's temperature and communication approach
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Personality Type Dropdown */}
          <Select
            value={formState.personality_type_id || formState.personality_type || ''}
            onValueChange={handlePersonalityChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select a personality type..." />
            </SelectTrigger>
            <SelectContent>
              {personalityTypes.map((pt) => (
                <SelectItem key={pt.id} value={pt.id || pt.slug}>
                  <div className="flex items-center gap-3">
                    <PersonalityIcon iconName={pt.icon} className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{pt.display_name || pt.name}</span>
                    <span className="text-xs text-muted-foreground">T:{pt.temperature}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Selected personality details */}
          {selectedPersonality && (
            <div className="p-3 bg-muted/50 rounded-lg text-sm space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-semibold">
                  {selectedPersonality.display_name || selectedPersonality.name}
                </span>
                <Badge variant="outline">Icon: {selectedPersonality.icon}</Badge>
              </div>
              <p className="text-muted-foreground text-xs">{selectedPersonality.description}</p>
              <div className="flex gap-2 text-xs">
                <Badge variant="secondary">Temperature: {selectedPersonality.temperature}</Badge>
                <Badge variant="secondary" className="capitalize">
                  Category: {selectedPersonality.category}
                </Badge>
                <Badge variant="secondary">Style: {selectedPersonality.style}</Badge>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Personality Sliders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Fine-Tune Personality Traits</CardTitle>
          <CardDescription>Adjust specific characteristics (0-100 scale)</CardDescription>
        </CardHeader>
        <CardContent>
          <SliderGroup
            sliders={PERSONALITY_SLIDERS}
            values={{
              personality_formality: formState.personality_formality,
              personality_empathy: formState.personality_empathy,
              personality_directness: formState.personality_directness,
              personality_detail_orientation: formState.personality_detail_orientation,
              personality_proactivity: formState.personality_proactivity,
              personality_risk_tolerance: formState.personality_risk_tolerance,
            }}
            onChange={updateSlider}
            columns={2}
          />
        </CardContent>
      </Card>

      {/* Communication Sliders */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Communication Style</CardTitle>
          <CardDescription>Adjust how the agent communicates</CardDescription>
        </CardHeader>
        <CardContent>
          <SliderGroup
            sliders={COMMUNICATION_SLIDERS}
            values={{
              comm_verbosity: formState.comm_verbosity,
              comm_technical_level: formState.comm_technical_level,
              comm_warmth: formState.comm_warmth,
            }}
            onChange={updateSlider}
            columns={3}
          />
        </CardContent>
      </Card>
    </div>
  );
}

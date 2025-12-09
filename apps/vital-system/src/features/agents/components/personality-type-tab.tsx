/**
 * PersonalityTypeTab - Tab for viewing and configuring agent personality
 * 
 * Integrates with:
 * - useAgentContext hook for fetching personality types
 * - VitalPersonalityBadge for display
 * - agent_sessions.py instantiate endpoint
 * 
 * Reference: AGENT_VIEW_PRD_v4.md Section on Personality Configuration
 */

'use client';

import * as React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import {
  Brain,
  Thermometer,
  MessageSquare,
  Target,
  Sparkles,
  CheckCircle2,
  Loader2,
  RefreshCw,
  Info,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  VitalPersonalityBadge,
  type PersonalitySlug,
} from '@/components/vital-ai-ui/agents';
import {
  useAgentContext,
  type PersonalityType,
} from '@/components/vital-ai-ui/agents/useAgentContext';
import type { Agent } from '../types/agent.types';

// ============================================================================
// TYPES
// ============================================================================

interface PersonalityTypeTabProps {
  agent: Agent;
  onPersonalityChange?: (personalityId: string | null) => void;
  selectedPersonalityId?: string;
  isEditable?: boolean;
}

// ============================================================================
// PERSONALITY PREVIEW
// ============================================================================

const PersonalityPreview: React.FC<{
  personality: PersonalityType;
  isSelected: boolean;
  onSelect: () => void;
}> = ({ personality, isSelected, onSelect }) => {
  return (
    <div
      className={`
        relative p-4 rounded-lg border-2 cursor-pointer transition-all
        ${isSelected 
          ? 'border-primary bg-primary/5 shadow-md' 
          : 'border-transparent bg-muted/50 hover:bg-muted hover:border-muted-foreground/20'}
      `}
      onClick={onSelect}
    >
      {isSelected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="h-5 w-5 text-primary" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <VitalPersonalityBadge
          personality={personality.slug as PersonalitySlug}
          variant="icon-only"
          showTooltip={false}
        />
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium">{personality.display_name}</span>
            <Badge variant="outline" className="text-xs">
              T: {personality.temperature}
            </Badge>
          </div>
          
          {personality.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {personality.description}
            </p>
          )}

          {/* Mini sliders showing key parameters */}
          <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-16">Creativity:</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary/70 rounded-full"
                  style={{ width: `${personality.temperature * 100}%` }}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-muted-foreground w-16">Formality:</span>
              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-blue-500/70 rounded-full"
                  style={{ width: `${(personality as any).formality_level || 50}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================================
// PERSONALITY DETAILS
// ============================================================================

const PersonalityDetails: React.FC<{ personality: PersonalityType }> = ({
  personality,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Brain className="h-4 w-4" />
          {personality.display_name}
        </CardTitle>
        <CardDescription>{personality.description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Thermometer className="h-4 w-4 text-muted-foreground" />
              <Label>Temperature</Label>
            </div>
            <span className="text-sm font-mono">{personality.temperature}</span>
          </div>
          <Slider
            value={[personality.temperature * 100]}
            max={100}
            step={1}
            disabled
            className="opacity-70"
          />
          <p className="text-xs text-muted-foreground">
            Lower = more consistent, Higher = more creative
          </p>
        </div>

        {/* Response Style */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
            <Label>Response Style</Label>
          </div>
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Verbosity:</span>
              <span className="ml-2 font-medium">
                {(personality as any).verbosity_level || 50}%
              </span>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Detail:</span>
              <span className="ml-2 font-medium">
                {(personality as any).detail_orientation || 50}%
              </span>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Formality:</span>
              <span className="ml-2 font-medium">
                {(personality as any).formality_level || 50}%
              </span>
            </div>
            <div className="p-2 bg-muted/50 rounded">
              <span className="text-muted-foreground">Directness:</span>
              <span className="ml-2 font-medium">
                {(personality as any).directness_level || 50}%
              </span>
            </div>
          </div>
        </div>

        {/* Reasoning Approach */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-muted-foreground" />
            <Label>Reasoning Approach</Label>
          </div>
          <Badge variant="secondary" className="capitalize">
            {(personality as any).reasoning_approach || 'balanced'}
          </Badge>
        </div>

        {/* Category */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Category:</span>
            <Badge variant="outline" className="capitalize">
              {personality.category}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const PersonalityTypeTab: React.FC<PersonalityTypeTabProps> = ({
  agent,
  onPersonalityChange,
  selectedPersonalityId,
  isEditable = false,
}) => {
  const { personalityTypes, isLoading, error, fetchLookups } = useAgentContext();
  
  // Use agent's current personality or prop override
  const [selected, setSelected] = React.useState<string | null>(
    selectedPersonalityId || (agent as any).personality_type_id || null
  );

  const selectedPersonality = personalityTypes.find((p) => p.id === selected);

  const handleSelect = (personalityId: string) => {
    if (!isEditable) return;
    
    const newValue = selected === personalityId ? null : personalityId;
    setSelected(newValue);
    onPersonalityChange?.(newValue);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-[600px] gap-4">
        <p className="text-sm text-destructive">Failed to load personality types</p>
        <Button variant="outline" size="sm" onClick={() => fetchLookups()}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Retry
        </Button>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <div className="space-y-6">
        {/* Header Info */}
        <Card className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="flex gap-3">
              <Sparkles className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="space-y-2 text-sm">
                <p className="font-medium text-blue-900 dark:text-blue-100">
                  About Personality Types
                </p>
                <p className="text-blue-700 dark:text-blue-300">
                  Personality types define how an agent communicates - including 
                  temperature (creativity), verbosity, formality, and reasoning approach.
                  These are applied when the agent is instantiated for a session.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Assignment */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Current Personality</CardTitle>
            <CardDescription>
              {selectedPersonality 
                ? `This agent uses the "${selectedPersonality.display_name}" personality`
                : 'No personality type assigned - using defaults'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedPersonality ? (
              <PersonalityDetails personality={selectedPersonality} />
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                <Brain className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p className="text-sm">
                  Select a personality type below to customize agent behavior
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Available Personalities */}
        {isEditable && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Available Personality Types</CardTitle>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Click to select a personality type. The agent's responses
                      will be configured with these behavioral parameters.
                    </p>
                  </TooltipContent>
                </Tooltip>
              </div>
              <CardDescription>
                {personalityTypes.length} personality types available
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-3">
                {personalityTypes
                  .filter((p) => p.is_active)
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((personality) => (
                    <PersonalityPreview
                      key={personality.id}
                      personality={personality}
                      isSelected={selected === personality.id}
                      onSelect={() => handleSelect(personality.id)}
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Read-only list for non-editable mode */}
        {!isEditable && !selectedPersonality && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Available Personalities</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {personalityTypes
                  .filter((p) => p.is_active)
                  .map((p) => (
                    <VitalPersonalityBadge
                      key={p.id}
                      personality={p.slug as PersonalitySlug}
                      variant="compact"
                    />
                  ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </ScrollArea>
  );
};

PersonalityTypeTab.displayName = 'PersonalityTypeTab';

export default PersonalityTypeTab;

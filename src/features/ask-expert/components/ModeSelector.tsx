'use client';

import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';

type InteractionMode = 'interactive' | 'autonomous';
type AgentSelectionMode = 'automatic' | 'manual';

interface ModeSelectorProps {
  interactionMode: InteractionMode;
  agentSelectionMode: AgentSelectionMode;
  onModeChange: (interactionMode: InteractionMode, agentMode: AgentSelectionMode) => void;
  isLoading?: boolean;
}

const modeConfigurations = {
  auto_interactive: {
    title: 'Auto-Interactive',
    description: 'System auto-selects agent for real-time Q&A',
    features: ['Automatic agent selection', 'Real-time responses', 'Quick answers'],
    useCases: ['Quick questions', 'General inquiries', 'Clarifications'],
    interactionMode: 'interactive' as InteractionMode,
    agentMode: 'automatic' as AgentSelectionMode
  },
  manual_interactive: {
    title: 'Manual-Interactive',
    description: 'You select agent for real-time Q&A',
    features: ['Manual agent selection', 'Expert-specific guidance', 'Real-time responses'],
    useCases: ['Expert consultation', 'Domain-specific questions', 'Preferred agent'],
    interactionMode: 'interactive' as InteractionMode,
    agentMode: 'manual' as AgentSelectionMode
  },
  auto_autonomous: {
    title: 'Auto-Autonomous',
    description: 'System auto-selects agent for autonomous analysis',
    features: ['Automatic agent selection', 'Multi-step reasoning', 'Comprehensive analysis'],
    useCases: ['Complex analysis', 'Research tasks', 'Strategic planning'],
    interactionMode: 'autonomous' as InteractionMode,
    agentMode: 'automatic' as AgentSelectionMode
  },
  manual_autonomous: {
    title: 'Manual-Autonomous',
    description: 'You select agent for autonomous analysis',
    features: ['Manual agent selection', 'Expert-guided execution', 'Multi-step reasoning'],
    useCases: ['Expert-led analysis', 'Specialized research', 'Customized workflows'],
    interactionMode: 'autonomous' as InteractionMode,
    agentMode: 'manual' as AgentSelectionMode
  }
};

export function ModeSelector({ 
  interactionMode, 
  agentSelectionMode, 
  onModeChange, 
  isLoading = false 
}: ModeSelectorProps) {
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  const currentModeKey = `${agentSelectionMode}_${interactionMode}`;

  const handleModeSelect = (modeKey: string) => {
    const config = modeConfigurations[modeKey as keyof typeof modeConfigurations];
    if (config && !isLoading) {
      onModeChange(config.interactionMode, config.agentMode);
    }
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {Object.entries(modeConfigurations).map(([modeKey, config]) => {
          const isSelected = modeKey === currentModeKey;
          const isHovered = hoveredMode === modeKey;
          
          return (
            <Card
              key={modeKey}
              className={`cursor-pointer transition-all duration-200 ${
                isSelected 
                  ? 'ring-2 ring-primary bg-primary/5' 
                  : isHovered 
                    ? 'ring-1 ring-primary/50 bg-primary/2' 
                    : 'hover:ring-1 hover:ring-primary/30'
              }`}
              onMouseEnter={() => setHoveredMode(modeKey)}
              onMouseLeave={() => setHoveredMode(null)}
              onClick={() => handleModeSelect(modeKey)}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{config.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      {config.description}
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {isSelected && (
                      <Badge variant="default" className="bg-primary">
                        <Check className="w-3 h-3 mr-1" />
                        Active
                      </Badge>
                    )}
                    {isLoading && isSelected && (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Features:</h4>
                    <div className="flex flex-wrap gap-1">
                      {config.features.map((feature, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {feature}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-medium text-muted-foreground mb-1">Use Cases:</h4>
                    <div className="flex flex-wrap gap-1">
                      {config.useCases.map((useCase, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {useCase}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Current Mode Summary */}
      <div className="mt-6 p-4 bg-muted/50 rounded-lg">
        <h4 className="font-medium mb-2">Current Mode: {modeConfigurations[currentModeKey as keyof typeof modeConfigurations]?.title}</h4>
        <p className="text-sm text-muted-foreground">
          {modeConfigurations[currentModeKey as keyof typeof modeConfigurations]?.description}
        </p>
      </div>

      {/* Mode Matrix Legend */}
      <div className="mt-4 p-4 border rounded-lg">
        <h4 className="font-medium mb-3">Mode Matrix (2x2)</h4>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <h5 className="font-medium mb-2">Agent Selection</h5>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Automatic - System chooses best agent</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Manual - You choose specific agent</span>
              </div>
            </div>
          </div>
          <div>
            <h5 className="font-medium mb-2">Interaction Type</h5>
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-orange-500 rounded"></div>
                <span>Interactive - Real-time Q&A</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-purple-500 rounded"></div>
                <span>Autonomous - Multi-step analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

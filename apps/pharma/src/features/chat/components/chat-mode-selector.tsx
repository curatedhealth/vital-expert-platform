'use client';

import {
  MessageSquare,
  Users,
  GitBranch,
  Target
} from 'lucide-react';

import { Badge } from '@vital/ui/components/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@vital/ui/components/card';
import { cn } from '@/shared/services/utils';

export type ChatMode = 'single-agent' | 'virtual-panel' | 'orchestrated-workflow' | 'jobs-framework';

export interface ChatModeConfig {
  id: ChatMode;
  title: string;
  description: string;
  icon: unknown;
  color: string;
  features: string[];
  useCase: string;
  phase: number;
}

const CHAT_MODES: ChatModeConfig[] = [
  {
    id: 'single-agent',
    title: 'Expert Consultation',
    description: 'Direct interaction with a specialized AI agent',
    icon: MessageSquare,
    color: 'bg-blue-500',
    features: ['1:1 Expert Chat', 'Domain Specialization', 'RAG-Enhanced', 'Context Aware'],
    useCase: 'Conversational AI Use Case',
    phase: 1
  },
  {
    id: 'virtual-panel',
    title: 'Virtual Advisory Board',
    description: 'Multi-agent collaboration for complex decisions',
    icon: Users,
    color: 'bg-purple-500',
    features: ['Multi-Agent Panel', 'Collaborative Analysis', 'Consensus Building', 'Expert Diversity'],
    useCase: 'Virtual Advisory Board Use Case',
    phase: 2
  },
  {
    id: 'orchestrated-workflow',
    title: 'Orchestrated Workflow',
    description: 'Complex multi-step processes with intelligent routing',
    icon: GitBranch,
    color: 'bg-green-500',
    features: ['Process Automation', 'Intelligent Routing', 'Step-by-Step Guidance', 'Quality Gates'],
    useCase: 'Orchestrated Workflow Use Case',
    phase: 2
  },
  {
    id: 'jobs-framework',
    title: 'Jobs-to-be-Done',
    description: 'Outcome-focused execution framework',
    icon: Target,
    color: 'bg-orange-500',
    features: ['Outcome Focus', 'Progress Tracking', 'Success Metrics', 'Iterative Improvement'],
    useCase: 'Jobs-to-be-Done Framework',
    phase: 2
  }
];

interface ChatModeSelectorProps {
  selectedMode: ChatMode;
  onModeChange: (mode: ChatMode) => void;
  className?: string;
}

export function ChatModeSelector({ selectedMode, onModeChange, className }: ChatModeSelectorProps) {
  return (
    <div className={cn("grid grid-cols-1 lg:grid-cols-2 gap-4", className)}>
      {CHAT_MODES.map((mode) => {

        return (
          <Card
            key={mode.id}
            className={cn(
              "cursor-pointer transition-all duration-200 hover:shadow-lg",
              isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-md",
              isPhase2 ? "border-2 border-dashed border-amber-300" : ""
            )}
            onClick={() => onModeChange(mode.id)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className={cn("p-2 rounded-lg", mode.color)}>
                    <Icon className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{mode.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{mode.useCase}</p>
                  </div>
                </div>
                {isPhase2 && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Phase 2
                  </Badge>
                )}
                {isSelected && (
                  <Badge variant="default">Active</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <p className="text-sm text-muted-foreground mb-4">{mode.description}</p>
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Key Features:</h4>
                <div className="grid grid-cols-2 gap-1">
                  {mode.features.map((feature, index) => (
                    <div key={index} className="flex items-center space-x-1">
                      <div className="w-1 h-1 bg-primary rounded-full" />
                      <span className="text-xs text-muted-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function ChatModeInfo({ mode }: { mode: ChatMode }) {

  if (!modeConfig) return null;

  return (
    <div className="flex items-center space-x-2 text-sm">
      <div className={cn("p-1 rounded", modeConfig.color)}>
        <Icon className="h-3 w-3 text-white" />
      </div>
      <span className="font-medium">{modeConfig.title}</span>
      {modeConfig.phase === 2 && (
        <Badge variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200">
          Phase 2
        </Badge>
      )}
    </div>
  );
}
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  BarChart3,
  HelpCircle,
  FileText,
  Users,
  Brain,
  Zap,
  MessageSquare,
  Upload,
} from 'lucide-react';

const iconMap = {
  chart: BarChart3,
  help: HelpCircle,
  document: FileText,
  users: Users,
  brain: Brain,
  zap: Zap,
  message: MessageSquare,
  upload: Upload,
};

interface PhaseAction {
  id: string;
  label: string;
  icon: keyof typeof iconMap;
}

interface PhaseActionsProps {
  phase: string;
  actions: PhaseAction[];
}

export function PhaseActions({ phase, actions }: PhaseActionsProps) {
  const handleAction = (actionId: string) => {
    console.log(`Triggering action: ${actionId} for phase: ${phase}`);
    // TODO: Implement actual action handlers
  };

  const getPhaseColor = (phase: string) => {
    const colors = {
      vision: 'text-trust-blue',
      integrate: 'text-progress-teal',
      test: 'text-clinical-green',
      activate: 'text-regulatory-gold',
      learn: 'text-market-purple',
    };
    return colors[phase as keyof typeof colors] || 'text-trust-blue';
  };

  const phaseColor = getPhaseColor(phase);

  return (
    <Card>
      <CardHeader>
        <CardTitle className={`text-lg flex items-center gap-2 ${phaseColor}`}>
          <Zap className="h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>
          Phase-specific tools and workflows to accelerate progress
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {actions.map((action) => {
            const ActionIcon = iconMap[action.icon];

            return (
              <Button
                key={action.id}
                variant="outline"
                className="w-full justify-start h-auto p-3 text-left hover:bg-background-gray"
                onClick={() => handleAction(action.id)}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-md bg-background-gray ${phaseColor}`}>
                    <ActionIcon className="h-4 w-4" />
                  </div>
                  <span className="text-sm font-medium text-deep-charcoal">
                    {action.label}
                  </span>
                </div>
              </Button>
            );
          })}
        </div>

        {/* AI Assistant Call-to-Action */}
        <div className="mt-6 p-4 bg-gradient-to-r from-trust-blue/10 to-progress-teal/10 rounded-lg">
          <div className="flex items-center gap-3 mb-2">
            <Brain className={`h-5 w-5 ${phaseColor}`} />
            <span className="font-medium text-deep-charcoal">AI Assistant</span>
          </div>
          <p className="text-sm text-medical-gray mb-3">
            Get expert guidance from specialized LLMs for regulatory, clinical, and market access questions.
          </p>
          <Button size="sm" className="bg-progress-teal hover:bg-progress-teal/90 w-full">
            <MessageSquare className="mr-2 h-4 w-4" />
            Ask AI Expert
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
'use client';

import { Bot, Users, Zap } from 'lucide-react';

import { Switch } from '@vital/ui';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';
import { Badge } from '@/shared/components/badge';
import { Card, CardContent } from '@/shared/components/card';

export function ModeSelector() {
  const {
    interactionMode,
    autonomousMode,
    setInteractionMode,
    setAutonomousMode,
    currentTier,
    escalationHistory
  } = useChatStore();

  return (
    <div className="p-4 space-y-4">
      {/* Agent Selection Mode */}
      <div>
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Agent Selection</h3>
        <div className="grid grid-cols-2 gap-3">
          {/* Automatic */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              interactionMode === 'automatic' && 'ring-2 ring-progress-teal bg-progress-teal/5'
            )}
            onClick={() => setInteractionMode('automatic')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  interactionMode === 'automatic'
                    ? "bg-progress-teal text-white"
                    : "bg-background-gray text-medical-gray"
                )}>
                  <Bot className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-deep-charcoal">Automatic</h4>
                  <p className="text-xs text-medical-gray">System selects</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Manual */}
          <Card
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              interactionMode === 'manual' && 'ring-2 ring-market-purple bg-market-purple/5'
            )}
            onClick={() => setInteractionMode('manual')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  interactionMode === 'manual'
                    ? "bg-market-purple text-white"
                    : "bg-background-gray text-medical-gray"
                )}>
                  <Users className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-sm text-deep-charcoal">Manual</h4>
                  <p className="text-xs text-medical-gray">You choose</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Autonomous Mode Toggle */}
      <div>
        <h3 className="text-sm font-medium text-neutral-700 mb-3">Chat Mode</h3>
        <Card className={cn(
          'transition-all',
          autonomousMode && 'ring-2 ring-blue-500 bg-blue-50/50'
        )}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-10 h-10 rounded-lg flex items-center justify-center",
                  autonomousMode
                    ? "bg-blue-500 text-white"
                    : "bg-background-gray text-medical-gray"
                )}>
                  <Zap className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-semibold text-sm text-deep-charcoal">
                    Autonomous Research Mode
                  </h4>
                  <p className="text-xs text-medical-gray">
                    {autonomousMode
                      ? 'Agent uses 15+ tools, multi-step reasoning'
                      : 'Normal conversation mode'}
                  </p>
                </div>
              </div>
              <Switch
                checked={autonomousMode}
                onCheckedChange={setAutonomousMode}
              />
            </div>
            {autonomousMode && (
              <div className="mt-3 pt-3 border-t border-neutral-200">
                <div className="flex flex-wrap gap-2 text-xs">
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    FDA Tools
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    PubMed
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    Clinical Trials
                  </Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-600 border-blue-200">
                    Long-term Memory
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

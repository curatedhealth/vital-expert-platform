'use client';

import { Bot, Users } from 'lucide-react';
import { Button } from '@/shared/components/button';
import { Card, CardContent } from '@/shared/components/card';
import { Badge } from '@/shared/components/badge';
import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@/lib/utils';

export function InteractionModeSelector() {
  const { interactionMode, setInteractionMode, currentTier, escalationHistory } = useChatStore();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4">
      {/* Mode 1: Automatic Orchestration */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-lg',
          interactionMode === 'automatic' && 'ring-2 ring-progress-teal bg-progress-teal/5'
        )}
        onClick={() => {
          console.log('🟡 Switching to AUTOMATIC mode');
          setInteractionMode('automatic');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setInteractionMode('automatic');
          }
        }}
        role="button"
        tabIndex={0}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                interactionMode === 'automatic'
                  ? "bg-progress-teal text-white"
                  : "bg-background-gray text-medical-gray"
              )}>
                <Bot className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-deep-charcoal">
                  🤖 Automatic Orchestration
                </h3>
                {interactionMode === 'automatic' && (
                  <Badge className="bg-progress-teal text-white">Active</Badge>
                )}
              </div>

              <p className="text-sm text-medical-gray mb-4">
                The system automatically routes queries through a three-tier escalation system based on complexity and confidence scores.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-deep-charcoal">Response Time:</span>
                  <span className="text-medical-gray">&lt;1s to 5s</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-deep-charcoal">Best for:</span>
                  <span className="text-medical-gray">Quick answers, routine queries</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-deep-charcoal">Accuracy:</span>
                  <span className="text-medical-gray">85-95%</span>
                </div>
              </div>

              {interactionMode === 'automatic' && (
                <div className="mt-4 pt-4 border-t border-background-gray">
                  <div className="flex items-center gap-2 text-xs text-medical-gray">
                    <span className="font-medium">Current Tier:</span>
                    <Badge variant="outline" className="text-xs">
                      Tier {currentTier === 'human' ? 'Human Expert' : currentTier}
                    </Badge>
                  </div>
                  {escalationHistory.length > 0 && (
                    <div className="mt-2 text-xs text-medical-gray">
                      <span className="font-medium">Escalations:</span> {escalationHistory.length}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Mode 2: Manual Expert Selection */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-lg',
          interactionMode === 'manual' && 'ring-2 ring-market-purple bg-market-purple/5'
        )}
        onClick={() => {
          console.log('🟣 Switching to MANUAL mode');
          setInteractionMode('manual');
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setInteractionMode('manual');
          }
        }}
        role="button"
        tabIndex={0}
      >
        <CardContent className="p-6">
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className={cn(
                "w-12 h-12 rounded-lg flex items-center justify-center",
                interactionMode === 'manual'
                  ? "bg-market-purple text-white"
                  : "bg-background-gray text-medical-gray"
              )}>
                <Users className="h-6 w-6" />
              </div>
            </div>

            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <h3 className="font-semibold text-deep-charcoal">
                  👥 Manual Expert Selection
                </h3>
                {interactionMode === 'manual' && (
                  <Badge className="bg-market-purple text-white">Active</Badge>
                )}
              </div>

              <p className="text-sm text-medical-gray mb-4">
                Browse 100+ expert agents, select a specific expert, and have an extended conversation with preserved personality and context.
              </p>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-deep-charcoal">Response Time:</span>
                  <span className="text-medical-gray">Variable by expert</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-deep-charcoal">Best for:</span>
                  <span className="text-medical-gray">Deep collaboration, specialized expertise</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-deep-charcoal">Experts:</span>
                  <span className="text-medical-gray">100+ specialists</span>
                </div>
              </div>

              {interactionMode === 'manual' && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full border-market-purple text-market-purple hover:bg-market-purple hover:text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Will navigate to expert selection
                    }}
                  >
                    Browse Experts
                  </Button>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
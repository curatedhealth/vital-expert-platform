'use client';

import { Bot, Users, Zap, TrendingUp } from 'lucide-react';

import { useChatStore } from '@/lib/stores/chat-store';
import { cn } from '@vital/ui/lib/utils';
import { Badge } from '@/shared/components/badge';
import { Button } from '@/shared/components/button';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/shared/components/tooltip';
import { TIER_CONFIG } from '@/shared/types/interaction-mode.types';

export function EnhancedChatModeToggle() {
  const {
    interactionMode,
    setInteractionMode,
    currentTier,
    escalationHistory,
    selectedExpert
  } = useChatStore();

  const isAutomatic = interactionMode === 'automatic';
  const tierInfo = TIER_CONFIG[currentTier];

  return (
    <TooltipProvider>
      <div className="flex items-center gap-2">
        {/* Automatic Mode Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={isAutomatic ? "default" : "outline"}
              size="sm"
              onClick={() => setInteractionMode('automatic')}
              className={cn(
                "relative transition-all",
                isAutomatic && "bg-gradient-to-r from-progress-teal to-teal-600 hover:from-progress-teal hover:to-teal-700"
              )}
            >
              <Bot className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Automatic</span>
              <span className="sm:hidden">Auto</span>
              {isAutomatic && (
                <Zap className="h-3 w-3 ml-1 text-yellow-300" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">🤖 Automatic Orchestration</p>
              <p className="text-xs text-muted-foreground">System automatically routes queries through</p>
              <p className="text-xs text-muted-foreground">3-tier escalation based on complexity</p>
              <div className="pt-2 border-t mt-2">
                <p className="text-xs"><strong>Response:</strong> &lt;1s to 5s</p>
                <p className="text-xs"><strong>Best for:</strong> Quick answers, routine queries</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Manual Mode Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant={!isAutomatic ? "default" : "outline"}
              size="sm"
              onClick={() => setInteractionMode('manual')}
              className={cn(
                "relative transition-all",
                !isAutomatic && "bg-gradient-to-r from-market-purple to-purple-600 hover:from-market-purple hover:to-purple-700"
              )}
            >
              <Users className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">Expert Chat</span>
              <span className="sm:hidden">Expert</span>
              {!isAutomatic && selectedExpert && (
                <Badge variant="secondary" className="ml-2 text-xs h-5 px-1">
                  {selectedExpert.avatar}
                </Badge>
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            <div className="space-y-1">
              <p className="font-semibold">👥 Manual Expert Selection</p>
              <p className="text-xs text-muted-foreground">Browse 100+ experts and have extended</p>
              <p className="text-xs text-muted-foreground">conversations with preserved context</p>
              <div className="pt-2 border-t mt-2">
                <p className="text-xs"><strong>Response:</strong> 1s-3s per message</p>
                <p className="text-xs"><strong>Best for:</strong> Deep collaboration, specialized expertise</p>
              </div>
            </div>
          </TooltipContent>
        </Tooltip>

        {/* Tier Indicator (Automatic Mode Only) */}
        {isAutomatic && (
          <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-lg bg-background-gray/50 border border-medical-gray/20">
            <TrendingUp className={cn(
              "h-3 w-3",
              escalationHistory.length > 0 ? "text-regulatory-gold animate-pulse" : "text-medical-gray"
            )} />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-deep-charcoal">
                Tier {currentTier === 'human' ? 'Human' : currentTier}
              </span>
              <span className="text-xs text-medical-gray">
                {tierInfo.responseTime}
              </span>
            </div>
            {escalationHistory.length > 0 && (
              <Badge variant="outline" className="text-xs ml-1">
                ↑{escalationHistory.length}
              </Badge>
            )}
          </div>
        )}

        {/* Expert Name (Manual Mode Only) */}
        {!isAutomatic && selectedExpert && (
          <div className="flex items-center gap-2 ml-2 px-3 py-1 rounded-lg bg-market-purple/10 border border-market-purple/20">
            <span className="text-lg">{selectedExpert.avatar}</span>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-deep-charcoal">
                {selectedExpert.name}
              </span>
              <span className="text-xs text-medical-gray truncate max-w-[150px]">
                {selectedExpert.capabilities?.[0] || 'Expert'}
              </span>
            </div>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}
'use client';

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * ENHANCED CHAT INPUT - GOLD STANDARD
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Chat input with mode controls IN THE INPUT (per cognitive overload audit)
 * - Mode controls moved from sidebar to input (contextual placement)
 * - Per-session mode state management
 * - Visual mode indicators with icons
 * - Contextual placeholders and warnings
 * - Enhanced prompt input integration
 * 
 * Achieves cognitive load reduction by placing controls where they're needed
 * ═══════════════════════════════════════════════════════════════════════════
 */

import React from 'react';
import { Send, Loader2, AlertCircle, Sparkles, Brain, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface ChatInputGoldProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  interactionMode: 'automatic' | 'manual';
  hasSelectedAgent: boolean;
  disabled?: boolean;
  className?: string;
  isCentered?: boolean;
  selectedAgent?: any;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  // Per-session mode props
  currentChat?: any;
  onUpdateChatMode?: (mode: 'automatic' | 'autonomous', value: boolean) => void;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════

export function ChatInputGold({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  interactionMode,
  hasSelectedAgent,
  disabled = false,
  className,
  isCentered = false,
  selectedAgent,
  selectedModel = 'gpt-4o',
  onModelChange,
  currentChat,
  onUpdateChatMode
}: ChatInputGoldProps) {
  const canSend = value.trim() && !isLoading && !disabled;
  
  // Per-session mode state
  const isAutoMode = currentChat?.isAutomaticMode ?? (interactionMode === 'automatic');
  const isAutonomousMode = currentChat?.isAutonomousMode ?? false;
  const showWarning = !isAutoMode && !hasSelectedAgent;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend) {
        onSubmit();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (canSend) {
      onSubmit();
    }
  };

  // Enhanced mode toggle UI for non-centered mode
  if (!isCentered) {
    return (
      <div className={cn("border-t bg-white", className)}>
        {/* MODE CONTROLS - Primary Location (moved from sidebar) */}
        {currentChat && onUpdateChatMode && (
          <div className="border-b bg-gradient-to-r from-blue-50/30 to-purple-50/30 px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-6">
                {/* Automatic Mode Toggle */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className={cn(
                      "h-4 w-4 transition-colors",
                      isAutoMode ? "text-green-600" : "text-gray-400"
                    )} />
                    <span className="text-sm font-medium text-gray-700">Automatic</span>
                  </div>
                  <Switch
                    checked={isAutoMode}
                    onCheckedChange={(checked) => onUpdateChatMode('automatic', checked)}
                    className="data-[state=checked]:bg-green-600"
                    aria-label="Toggle automatic mode"
                  />
                  {isAutoMode && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                      AI selects agent
                    </Badge>
                  )}
                </div>
                
                {/* Autonomous Mode Toggle */}
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <Brain className={cn(
                      "h-4 w-4 transition-colors",
                      isAutonomousMode ? "text-purple-600" : "text-gray-400"
                    )} />
                    <span className="text-sm font-medium text-gray-700">Autonomous</span>
                  </div>
                  <Switch
                    checked={isAutonomousMode}
                    onCheckedChange={(checked) => onUpdateChatMode('autonomous', checked)}
                    className="data-[state=checked]:bg-purple-600"
                    aria-label="Toggle autonomous mode"
                  />
                  {isAutonomousMode && (
                    <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700 animate-pulse">
                      Goal-driven
                    </Badge>
                  )}
                </div>
              </div>

              {/* Mode Info */}
              <div className="text-xs text-gray-500">
                {isAutonomousMode ? (
                  <span className="flex items-center gap-1">
                    <Brain className="h-3 w-3" />
                    AI will work autonomously to achieve your goal
                  </span>
                ) : isAutoMode ? (
                  <span className="flex items-center gap-1">
                    <Sparkles className="h-3 w-3" />
                    AI will select the best agent for each message
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    You choose the agent manually
                  </span>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Warning: No agent selected in Manual mode */}
        {showWarning && (
          <Alert variant="destructive" className="m-3 mb-0">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an AI agent before sending a message in Manual Mode, or enable Automatic mode.
            </AlertDescription>
          </Alert>
        )}

        {/* Enhanced Input */}
        <div className="p-4">
          <form onSubmit={handleSubmit} className="w-full">
            <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 shadow-lg p-2">
              <Textarea
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                  showWarning
                    ? "Select an agent or enable Automatic mode..."
                    : isAutonomousMode
                    ? "Describe your goal and I'll work autonomously..."
                    : isAutoMode
                    ? "Ask anything - I'll find the right expert..."
                    : "Ask about digital health, reimbursement, clinical research..."
                }
                className="min-h-[40px] max-h-[120px] resize-none border-0 shadow-none focus:ring-0 text-base flex-1"
                disabled={!canSend}
                rows={1}
                aria-label="Message input"
              />
              <Button
                type="submit"
                disabled={!canSend}
                className="px-4 shrink-0 rounded-xl"
                aria-label="Send message"
              >
                {isLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </Button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // Centered mode - simplified (for welcome screen)
  return (
    <div className={cn("bg-transparent p-0", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 shadow-lg p-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message VITAL Expert..."
            className="min-h-[40px] max-h-[120px] resize-none border-0 shadow-none focus:ring-0 text-base"
            disabled={!canSend}
            rows={1}
            aria-label="Message input"
          />
          <Button
            type="submit"
            disabled={!canSend}
            className="px-4 shrink-0 rounded-xl"
            aria-label="Send message"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}

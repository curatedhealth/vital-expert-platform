'use client';

import React from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { EnhancedPromptInput } from './enhanced-prompt-input';
import { cn } from '@/lib/utils';

interface ChatInputProps {
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
}

export function ChatInput({
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
  onModelChange
}: ChatInputProps) {
  // Always allow sending (unconditional)
  const canSend = value.trim() && !isLoading && !disabled;

  // Show warning in manual mode without agent (but don't block input)
  const showWarning = interactionMode === 'manual' && !hasSelectedAgent;

  // Debug logging
  console.log('ChatInput Debug:', {
    interactionMode,
    hasSelectedAgent,
    selectedAgent,
    canSend,
    showWarning,
    disabled
  });

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

  // Use enhanced prompt input for non-centered mode
  if (!isCentered) {
    return (
      <div className={cn("border-t bg-white p-4", className)}>
        {/* Warning: No agent selected */}
        {showWarning && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an AI agent before sending a message in Manual Mode.
            </AlertDescription>
          </Alert>
        )}

        <EnhancedPromptInput
          value={value}
          onChange={onChange}
          onSubmit={onSubmit}
          isLoading={isLoading}
          disabled={false}
          placeholder={
            showWarning
              ? "Please select an AI agent first..."
              : "Ask about digital health, reimbursement, clinical research..."
          }
          selectedAgent={selectedAgent}
          selectedModel={selectedModel}
          onModelChange={onModelChange}
        />
      </div>
    );
  }

  // Centered mode - use simple input
  return (
    <div className={cn("bg-transparent p-0", className)}>
      <form onSubmit={handleSubmit} className="w-full">
        {/* Input Area */}
        <div className="flex gap-2 bg-white rounded-2xl border border-gray-200 shadow-lg p-2">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Message VITAL Expert..."
            className="min-h-[40px] max-h-[120px] resize-none border-0 shadow-none focus:ring-0 text-base"
            disabled={!canSend}
            rows={1}
          />
          <Button
            type="submit"
            disabled={!canSend}
            className="px-4 shrink-0 rounded-xl"
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

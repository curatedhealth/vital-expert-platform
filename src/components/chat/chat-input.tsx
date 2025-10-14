'use client';

import React from 'react';
import { Send, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
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
  isCentered = false
}: ChatInputProps) {
  // Validation: Check if can send
  const canSend = value.trim() && 
                  !isLoading && 
                  !disabled &&
                  (interactionMode === 'automatic' || hasSelectedAgent);

  // Show warning in manual mode without agent
  const showWarning = interactionMode === 'manual' && !hasSelectedAgent;

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

  return (
    <div className={cn(
      isCentered 
        ? "bg-transparent p-0" 
        : "border-t bg-white p-4", 
      className
    )}>
      <form onSubmit={handleSubmit} className={cn(
        isCentered ? "w-full" : "max-w-4xl mx-auto"
      )}>
        {/* Warning: No agent selected */}
        {showWarning && (
          <Alert variant="destructive" className="mb-3">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Please select an AI agent before sending a message in Manual Mode.
            </AlertDescription>
          </Alert>
        )}

        {/* Input Area */}
        <div className={cn(
          "flex gap-2",
          isCentered && "bg-white rounded-2xl border border-gray-200 shadow-lg p-2"
        )}>
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              showWarning
                ? "Please select an AI agent first..."
                : isCentered
                ? "Message VITAL Expert..."
                : "Ask about digital health, reimbursement, clinical research..."
            }
            className={cn(
              "min-h-[40px] max-h-[120px] resize-none",
              isCentered && "border-0 shadow-none focus:ring-0 text-base"
            )}
            disabled={!canSend}
            rows={1}
          />
          <Button
            type="submit"
            disabled={!canSend}
            className={cn(
              "px-4 shrink-0",
              isCentered && "rounded-xl"
            )}
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* Helper Text */}
        {!isCentered && (
          <p className="text-xs text-gray-500 mt-2">
            Press Enter to send, Shift+Enter for new line
          </p>
        )}
      </form>
    </div>
  );
}

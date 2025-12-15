'use client';

import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Settings
} from 'lucide-react';
import { useState } from 'react';

import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Textarea } from '@/lib/shared/components/ui/textarea';
import { cn } from '@/lib/shared/utils';

interface EnhancedChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  selectedAgent?: any;
  placeholder?: string;
  showModelSelector?: boolean;
  className?: string;
}

export function EnhancedChatInput({
  value = '',
  onChange,
  onSendMessage,
  isLoading = false,
  selectedAgent,
  placeholder = "Type your message...",
  showModelSelector = false,
  className
}: EnhancedChatInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const currentValue = value || internalValue;

  const handleChange = (newValue: string) => {
    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }
  };

  const handleSubmit = () => {
    if (currentValue.trim() && !isLoading && onSendMessage) {
      onSendMessage(currentValue.trim());
      handleChange('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className={cn("border rounded-lg bg-background p-3 space-y-3", className)}>
      {/* Agent Context */}
      {selectedAgent && (
        <div className="flex items-center gap-2 px-2">
          <Badge variant="outline" className="text-xs">
            Chatting with {selectedAgent.name}
          </Badge>
          {selectedAgent.ragEnabled && (
            <Badge variant="secondary" className="text-xs">
              Knowledge Base Active
            </Badge>
          )}
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        <Textarea
          value={currentValue}
          onChange={(e) => handleChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={isLoading}
          className="min-h-[60px] resize-none border-0 p-3 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Send Button */}
        <Button
          onClick={handleSubmit}
          disabled={!currentValue.trim() || isLoading}
          size="icon"
          className="absolute bottom-2 right-2 h-8 w-8"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Attachment Button */}
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Voice Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              "h-8 w-8",
              isRecording && "text-red-500 bg-red-50"
            )}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Model Selector */}
          {showModelSelector && (
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Character Count */}
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>{currentValue.length}/4000</span>
          {isLoading && (
            <div className="flex items-center gap-1">
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse"></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.2s'}}></div>
              <div className="w-1 h-1 bg-primary rounded-full animate-pulse" style={{animationDelay: '0.4s'}}></div>
            </div>
          )}
        </div>
      </div>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="flex items-center gap-2 px-2 py-1 bg-red-50 text-red-700 rounded-md text-sm">
          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
          Recording... Tap to stop
        </div>
      )}
    </div>
  );
}
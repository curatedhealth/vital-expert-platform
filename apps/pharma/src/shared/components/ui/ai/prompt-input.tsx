import { Loader2, Mic, Send, MicOff } from "lucide-react";
import { forwardRef, useRef, useImperativeHandle } from "react";

import { Button } from "@/shared/components/ui/button";
import { Textarea } from "@/shared/components/ui/textarea";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/shared/components/ui/tooltip";
import { cn } from "@/shared/services/utils";

export interface PromptInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange' | 'onSubmit'> {
  value?: string;
  placeholder?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
  disabled?: boolean;
  loading?: boolean;
  maxLength?: number;
  autoFocus?: boolean;
  allowMultiline?: boolean;
  onVoiceStart?: () => void;
  onVoiceStop?: () => void;
  isVoiceActive?: boolean;
  suggestions?: string[];
  onSuggestionClick?: (suggestion: string) => void;
}

export interface PromptInputRef {
  focus: () => void;
  clear: () => void;
  insertText: (text: string) => void;
}

const PromptInput = forwardRef<PromptInputRef, PromptInputProps>(
  ({
    className,
    value,
    placeholder = "Type your message...",
    onSubmit,
    onChange,
    disabled,
    loading,
    maxLength,
    autoFocus,
    allowMultiline = true,
    onVoiceStart,
    onVoiceStop,
    isVoiceActive,
    suggestions = [],
    onSuggestionClick,
    ...props
  }, ref) => {
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const inputValue = value || "";

    useImperativeHandle(ref, () => ({
      focus: () => textareaRef.current?.focus(),
      clear: () => onChange?.(""),
      insertText: (text: string) => {
        if (textareaRef.current) {
          const start = textareaRef.current.selectionStart || 0;
          const end = textareaRef.current.selectionEnd || 0;
          const currentValue = inputValue;
          const newValue = currentValue.slice(0, start) + text + currentValue.slice(end);

          onChange?.(newValue);

          // Move cursor after inserted text
          setTimeout(() => {
            if (textareaRef.current) {
              textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + text.length;
            }
          }, 0);
        }
      },
    }));

    const handleSubmit = () => {
      if (inputValue.trim() && !disabled && !loading) {
        onSubmit?.(inputValue.trim());
      }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter") {
        if (allowMultiline && !e.shiftKey) {
          e.preventDefault();
          handleSubmit();
        } else if (!allowMultiline) {
          e.preventDefault();
          handleSubmit();
        }
      }
    };

    const isSubmitDisabled = !inputValue.trim() || disabled || loading;

    return (
      <div className={cn("space-y-2", className)} {...props}>
        {suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto text-xs"
                onClick={() => onSuggestionClick?.(suggestion)}
                disabled={disabled || loading}
              >
                {suggestion}
              </Button>
            ))}
          </div>
        )}
        <div className="flex items-end space-x-2">
          <div className="relative flex-1">
            <Textarea
              ref={textareaRef}
              value={inputValue}
              onChange={(e) => onChange?.(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled || loading}
              autoFocus={autoFocus}
              maxLength={maxLength}
              rows={allowMultiline ? 3 : 1}
              className={cn(
                "resize-none pr-12",
                !allowMultiline && "min-h-[2.5rem] max-h-[2.5rem]"
              )}
            />
            {maxLength && (
              <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
                {inputValue.length}/{maxLength}
              </div>
            )}
          </div>
          <div className="flex space-x-1">
            {(onVoiceStart || onVoiceStop) && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      variant={isVoiceActive ? "destructive" : "outline"}
                      onClick={isVoiceActive ? onVoiceStop : onVoiceStart}
                      disabled={disabled}
                      className="h-10 w-10"
                    >
                      {isVoiceActive ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isVoiceActive ? "Stop recording" : "Start voice input"}
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                    disabled={isSubmitDisabled}
                    className="h-10 w-10"
                  >
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  Send message {allowMultiline && "(Shift+Enter for new line)"}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </div>
    );
  }
);
PromptInput.displayName = "PromptInput";

const PromptInputTextarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement>>(
  ({ className, ...props }, ref) => {
    return (
      <Textarea
        ref={ref}
        className={cn("resize-none", className)}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = "PromptInputTextarea";

interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  status?: 'idle' | 'loading' | 'error';
}

const PromptInputSubmit = forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, status = 'idle', disabled, children, ...props }, ref) => {
    return (
      <Button
        ref={ref}
        type="submit"
        size="sm"
        disabled={disabled || status === 'loading'}
        className={cn("h-10 w-10", className)}
        {...props}
      >
        {status === 'loading' ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          children || <Send className="h-4 w-4" />
        )}
      </Button>
    );
  }
);
PromptInputSubmit.displayName = "PromptInputSubmit";

export { PromptInput, PromptInputTextarea, PromptInputSubmit };
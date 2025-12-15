'use client';

import { Send, Settings } from 'lucide-react';
import * as React from 'react';

import { cn } from '@/lib/utils';

import { Button } from './button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select';

// Context for managing prompt input state
interface PromptInputContextValue {
  onSubmit?: (value: string) => void;
  isSubmitting?: boolean;
  models?: Array<{ id: string; name: string; description?: string }>;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showModelSelector?: boolean;
}

const PromptInputContext = React.createContext<PromptInputContextValue | null>(null);

const usePromptInput = () => {
  const context = React.useContext(PromptInputContext);
  if (!context) {
    throw new Error('usePromptInput must be used within a PromptInput');
  }
  return context;
};

// Main PromptInput wrapper component
interface PromptInputProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
  isSubmitting?: boolean;
  models?: Array<{ id: string; name: string; description?: string }>;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  showModelSelector?: boolean;
}

const PromptInput = React.forwardRef<HTMLDivElement, PromptInputProps>(
  ({ className, onSubmit, isSubmitting, models, selectedModel, onModelChange, showModelSelector = true, children, ...props }, ref) => {
    return (
      <PromptInputContext.Provider
        value={{
          onSubmit,
          isSubmitting,
          models,
          selectedModel,
          onModelChange,
          showModelSelector
        }}
      >
        <div
          ref={ref}
          className={cn(
            'relative flex flex-col w-full border border-input bg-background rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </PromptInputContext.Provider>
    );
  }
);
PromptInput.displayName = 'PromptInput';

// Auto-resizing textarea component
interface PromptInputTextareaProps extends Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, 'onSubmit'> {
  onSubmit?: (value: string) => void;
}

const PromptInputTextarea = React.forwardRef<HTMLTextAreaElement, PromptInputTextareaProps>(
  ({ className, onSubmit: propOnSubmit, onKeyDown, onChange, ...props }, ref) => {
    const { onSubmit: contextOnSubmit, isSubmitting } = usePromptInput();
    const textareaRef = React.useRef<HTMLTextAreaElement>(null);
    const [value, setValue] = React.useState(props.value || '');

    // Combine refs
    React.useImperativeHandle(ref, () => textareaRef.current!);

    // Auto-resize functionality
    const adjustHeight = React.useCallback(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`; // Max height of 200px
      }
    }, []);

    // Handle input change
    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const newValue = e.target.value;
      setValue(newValue);
      onChange?.(e);

      // Adjust height after value change
      requestAnimationFrame(adjustHeight);
    };

    // Handle keyboard shortcuts
    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      onKeyDown?.(e);

      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const submitHandler = propOnSubmit || contextOnSubmit;
        if (submitHandler && !isSubmitting) {
          const currentValue = String(value);
          if (currentValue.trim()) {
            submitHandler(currentValue);
            setValue(''); // Clear input after submit
            // Reset height
            requestAnimationFrame(() => {
              if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
              }
            });
          }
        }
      }
    };

    // Adjust height on mount and when value changes externally
    React.useEffect(() => {
      adjustHeight();
    }, [adjustHeight, props.value]);

    // Update internal value when props.value changes
    React.useEffect(() => {
      if (props.value !== undefined) {
        setValue(props.value);
      }
    }, [props.value]);

    return (
      <textarea
        ref={textareaRef}
        className={cn(
          'flex min-h-[60px] w-full resize-none border-0 bg-transparent px-4 py-3 text-sm placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
          'scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent',
          className
        )}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={isSubmitting}
        style={{
          overflow: 'hidden',
          minHeight: '60px',
          maxHeight: '200px',
        }}
        {...props}
      />
    );
  }
);
PromptInputTextarea.displayName = 'PromptInputTextarea';

// Toolbar component
interface PromptInputToolbarProps extends React.HTMLAttributes<HTMLDivElement> { /* TODO: implement */ }

const PromptInputToolbar = React.forwardRef<HTMLDivElement, PromptInputToolbarProps>(
  ({ className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex items-center justify-between gap-2 px-4 py-2 border-t border-border bg-muted/30',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);
PromptInputToolbar.displayName = 'PromptInputToolbar';

// Submit button component
interface PromptInputSubmitProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'default' | 'sm' | 'lg' | 'icon';
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
}

const PromptInputSubmit = React.forwardRef<HTMLButtonElement, PromptInputSubmitProps>(
  ({ className, children, size = 'sm', variant = 'default', ...props }, ref) => {
    const { isSubmitting } = usePromptInput();

    return (
      <Button
        ref={ref}
        type="submit"
        size={size}
        variant={variant}
        className={cn('shrink-0', className)}
        disabled={isSubmitting || props.disabled}
        {...props}
      >
        {children || (
          <>
            <Send className="h-4 w-4" />
            <span className="sr-only">Send message</span>
          </>
        )}
      </Button>
    );
  }
);
PromptInputSubmit.displayName = 'PromptInputSubmit';

// Model selector component
interface PromptInputModelSelectorProps {
  className?: string;
}

const PromptInputModelSelector = React.forwardRef<HTMLButtonElement, PromptInputModelSelectorProps>(
  ({ className }, ref) => {
    const { models, selectedModel, onModelChange, showModelSelector } = usePromptInput();

    if (!showModelSelector || !models || models.length === 0) {
      return null;
    }

    return (
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedModel} onValueChange={onModelChange}>
          <SelectTrigger
            ref={ref}
            className={cn('w-[140px] h-8 text-xs border-0 bg-transparent', className)}
          >
            <SelectValue placeholder="Model" />
          </SelectTrigger>
          <SelectContent>
            {models.map((model) => (
              <SelectItem key={model.id} value={model.id}>
                <span className="font-medium">{model.name}</span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }
);
PromptInputModelSelector.displayName = 'PromptInputModelSelector';

// Character counter component
interface PromptInputCharCounterProps {
  value: string;
  maxLength?: number;
  className?: string;
}

const PromptInputCharCounter = React.forwardRef<HTMLSpanElement, PromptInputCharCounterProps>(
  ({ value, maxLength, className }, ref) => {
    if (!maxLength) return null;

    const count = value.length;
    const isNearLimit = count >= maxLength * 0.9;
    const isOverLimit = count > maxLength;

    return (
      <span
        ref={ref}
        className={cn(
          'text-xs text-muted-foreground',
          isNearLimit && 'text-orange-500',
          isOverLimit && 'text-destructive',
          className
        )}
      >
        {count}/{maxLength}
      </span>
    );
  }
);
PromptInputCharCounter.displayName = 'PromptInputCharCounter';

export {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputModelSelector,
  PromptInputCharCounter,
  usePromptInput,
  type PromptInputProps,
  type PromptInputTextareaProps,
  type PromptInputToolbarProps,
  type PromptInputSubmitProps,
  type PromptInputModelSelectorProps,
  type PromptInputCharCounterProps,
};
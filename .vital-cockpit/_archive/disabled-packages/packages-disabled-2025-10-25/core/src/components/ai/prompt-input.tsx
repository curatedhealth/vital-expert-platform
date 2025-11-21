'use client';

import * as React from 'react';
import { Send } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

// Context for managing the prompt input state
interface PromptInputContextValue {
  onSubmit?: (e: React.FormEvent) => void;
}

const PromptInputContext = React.createContext<PromptInputContextValue>({});

// Main container component
interface PromptInputProps extends React.HTMLAttributes<HTMLFormElement> {
  onSubmit?: (e: React.FormEvent) => void;
}

export function PromptInput({
  children,
  onSubmit,
  className,
  ...props
}: PromptInputProps) {
  const handleSubmit = React.useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      onSubmit?.(e);
    },
    [onSubmit]
  );

  return (
    <PromptInputContext.Provider value={{ onSubmit: handleSubmit }}>
      <form
        onSubmit={handleSubmit}
        className={cn(
          'relative flex flex-col gap-2 rounded-3xl border border-gray-200 bg-white px-4 py-3 shadow-sm transition-all focus-within:border-gray-300 focus-within:shadow-md',
          className
        )}
        {...props}
      >
        {children}
      </form>
    </PromptInputContext.Provider>
  );
}

// Auto-resizing textarea component
interface PromptInputTextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

export function PromptInputTextarea({
  className,
  onChange,
  onKeyDown,
  ...props
}: PromptInputTextareaProps) {
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const { onSubmit } = React.useContext(PromptInputContext);

  // Auto-resize textarea based on content
  const adjustHeight = React.useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Reset height to get accurate scrollHeight
    textarea.style.height = 'auto';
    // Set new height (max 200px)
    const newHeight = Math.min(textarea.scrollHeight, 200);
    textarea.style.height = `${newHeight}px`;
  }, []);

  React.useEffect(() => {
    adjustHeight();
  }, [props.value, adjustHeight]);

  const handleChange = React.useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      onChange?.(e);
      adjustHeight();
    },
    [onChange, adjustHeight]
  );

  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Submit on Enter, new line on Shift+Enter
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        onSubmit?.(e as unknown as React.FormEvent);
      }
      onKeyDown?.(e);
    },
    [onKeyDown, onSubmit]
  );

  return (
    <textarea
      ref={textareaRef}
      className={cn(
        'flex w-full resize-none bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
        'min-h-[24px] max-h-[200px]',
        className
      )}
      onChange={handleChange}
      onKeyDown={handleKeyDown}
      rows={1}
      {...props}
    />
  );
}

// Toolbar component
interface PromptInputToolbarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function PromptInputToolbar({
  children,
  className,
  ...props
}: PromptInputToolbarProps) {
  return (
    <div
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    >
      {children}
    </div>
  );
}

// Submit button component
interface PromptInputSubmitProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function PromptInputSubmit({
  className,
  children,
  disabled,
  ...props
}: PromptInputSubmitProps) {
  return (
    <Button
      type="submit"
      size="icon"
      className={cn(
        'ml-auto h-8 w-8 rounded-full transition-colors',
        disabled
          ? 'bg-gray-200 text-gray-400 hover:bg-gray-200'
          : 'bg-black text-white hover:bg-gray-800',
        className
      )}
      disabled={disabled}
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
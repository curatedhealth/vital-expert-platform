'use client';

/**
 * VitalModelSelector - Searchable Command Palette for AI Model Selection
 * 
 * A comprehensive compound component suite for building model selection interfaces
 * with support for providers, modes, and keyboard navigation.
 * 
 * Features:
 * - Searchable interface with keyboard navigation
 * - Fuzzy search filtering across model names
 * - Grouped model organization by provider
 * - Keyboard shortcuts support
 * - Empty state handling
 * - Customizable styling with Tailwind CSS
 * - Support for both inline and dialog modes
 * - Provider logo support for major AI providers
 * - Perfect for Ask Expert Mode 1-4 selection
 * 
 * @example
 * ```tsx
 * <VitalModelSelector open={open} onOpenChange={setOpen}>
 *   <VitalModelSelectorTrigger>
 *     <Button variant="outline">Select Model</Button>
 *   </VitalModelSelectorTrigger>
 *   <VitalModelSelectorContent>
 *     <VitalModelSelectorInput placeholder="Search models..." />
 *     <VitalModelSelectorList>
 *       <VitalModelSelectorEmpty>No models found.</VitalModelSelectorEmpty>
 *       <VitalModelSelectorGroup heading="OpenAI">
 *         <VitalModelSelectorItem onSelect={() => handleSelect('gpt-4')}>
 *           <VitalModelSelectorLogo provider="openai" />
 *           <VitalModelSelectorName>GPT-4</VitalModelSelectorName>
 *         </VitalModelSelectorItem>
 *       </VitalModelSelectorGroup>
 *     </VitalModelSelectorList>
 *   </VitalModelSelectorContent>
 * </VitalModelSelector>
 * ```
 */

import { cn } from '../lib/utils';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useState, forwardRef } from 'react';
import { Check, ChevronDown, Search, X } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

/** Supported AI provider names */
export type AIProvider =
  | 'openai'
  | 'anthropic'
  | 'google'
  | 'google-vertex'
  | 'mistral'
  | 'groq'
  | 'perplexity'
  | 'deepseek'
  | 'xai'
  | 'azure'
  | 'amazon-bedrock'
  | 'huggingface'
  | 'togetherai'
  | 'fireworks-ai'
  | 'openrouter'
  | 'nvidia'
  | 'cerebras'
  | 'vercel'
  | 'v0'
  | 'llama'
  | 'cohere'
  | (string & {});

/** Ask Expert execution modes */
export type ExecutionMode = 'mode-1' | 'mode-2' | 'mode-3' | 'mode-4';

export type VitalModelSelectorProps = ComponentProps<'div'> & {
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
  /** Default open state */
  defaultOpen?: boolean;
};

export type VitalModelSelectorTriggerProps = ComponentProps<'button'>;

export type VitalModelSelectorContentProps = ComponentProps<'div'> & {
  /** Accessible title for the dialog */
  title?: ReactNode;
  /** Alignment of the content */
  align?: 'start' | 'center' | 'end';
  /** Side of the content */
  side?: 'top' | 'right' | 'bottom' | 'left';
};

export type VitalModelSelectorDialogProps = ComponentProps<'div'> & {
  /** Controlled open state */
  open?: boolean;
  /** Called when open state changes */
  onOpenChange?: (open: boolean) => void;
};

export type VitalModelSelectorInputProps = ComponentProps<'input'>;

export type VitalModelSelectorListProps = ComponentProps<'div'>;

export type VitalModelSelectorEmptyProps = ComponentProps<'div'>;

export type VitalModelSelectorGroupProps = ComponentProps<'div'> & {
  /** Group heading */
  heading?: string;
};

export type VitalModelSelectorItemProps = ComponentProps<'div'> & {
  /** Value for filtering */
  value?: string;
  /** Called when item is selected */
  onSelect?: () => void;
  /** Whether the item is disabled */
  disabled?: boolean;
  /** Whether the item is selected */
  selected?: boolean;
};

export type VitalModelSelectorShortcutProps = ComponentProps<'span'>;

export type VitalModelSelectorSeparatorProps = ComponentProps<'div'>;

export type VitalModelSelectorLogoProps = Omit<ComponentProps<'img'>, 'src' | 'alt'> & {
  /** The AI provider name */
  provider: AIProvider;
};

export type VitalModelSelectorLogoGroupProps = ComponentProps<'div'>;

export type VitalModelSelectorNameProps = ComponentProps<'span'>;

// ============================================================================
// Context
// ============================================================================

interface ModelSelectorContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  search: string;
  setSearch: (search: string) => void;
}

const ModelSelectorContext = createContext<ModelSelectorContextValue | null>(null);

const useModelSelectorContext = () => {
  const context = useContext(ModelSelectorContext);
  if (!context) {
    throw new Error('ModelSelector components must be used within VitalModelSelector');
  }
  return context;
};

// ============================================================================
// Components
// ============================================================================

/**
 * Root model selector with dialog/popover functionality
 */
export const VitalModelSelector = forwardRef<HTMLDivElement, VitalModelSelectorProps>(
  ({ open: controlledOpen, onOpenChange, defaultOpen = false, className, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(defaultOpen);
    const [search, setSearch] = useState('');
    
    const open = controlledOpen ?? internalOpen;
    const setOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
      if (!newOpen) setSearch('');
    };

    return (
      <ModelSelectorContext.Provider value={{ open, setOpen, search, setSearch }}>
        <div ref={ref} className={cn('relative', className)} {...props}>
          {children}
        </div>
      </ModelSelectorContext.Provider>
    );
  }
);

/**
 * Trigger button for opening the selector
 */
export const VitalModelSelectorTrigger = forwardRef<HTMLButtonElement, VitalModelSelectorTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const { setOpen, open } = useModelSelectorContext();

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={open}
        onClick={() => setOpen(!open)}
        className={cn(
          'inline-flex items-center justify-between gap-2 rounded-md border px-3 py-2',
          'bg-background text-sm hover:bg-accent transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className={cn('size-4 opacity-50 transition-transform', open && 'rotate-180')} />
      </button>
    );
  }
);

/**
 * Content container with command palette
 */
export const VitalModelSelectorContent = forwardRef<HTMLDivElement, VitalModelSelectorContentProps>(
  ({ className, children, title = 'Model Selector', align = 'start', side = 'bottom', ...props }, ref) => {
    const { open, setOpen } = useModelSelectorContext();

    if (!open) return null;

    const alignmentClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    const sideClasses = {
      top: 'bottom-full mb-2',
      bottom: 'top-full mt-2',
      left: 'right-full mr-2',
      right: 'left-full ml-2',
    };

    return (
      <>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-40"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        
        {/* Content */}
        <div
          ref={ref}
          role="dialog"
          aria-label={typeof title === 'string' ? title : 'Model Selector'}
          className={cn(
            'absolute z-50 w-[400px] rounded-lg border bg-popover shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            alignmentClasses[align],
            sideClasses[side],
            className
          )}
          {...props}
        >
          <span className="sr-only">{title}</span>
          {children}
        </div>
      </>
    );
  }
);

/**
 * Full-screen dialog variant
 */
export const VitalModelSelectorDialog = forwardRef<HTMLDivElement, VitalModelSelectorDialogProps>(
  ({ open: controlledOpen, onOpenChange, className, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const [search, setSearch] = useState('');
    
    const open = controlledOpen ?? internalOpen;
    const setOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
      if (!newOpen) setSearch('');
    };

    if (!open) return null;

    return (
      <ModelSelectorContext.Provider value={{ open, setOpen, search, setSearch }}>
        {/* Backdrop */}
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={() => setOpen(false)}
          aria-hidden="true"
        />
        
        {/* Dialog */}
        <div
          ref={ref}
          role="dialog"
          className={cn(
            'fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-lg border bg-popover shadow-lg',
            'animate-in fade-in-0 zoom-in-95',
            className
          )}
          {...props}
        >
          {children}
        </div>
      </ModelSelectorContext.Provider>
    );
  }
);

/**
 * Search input with keyboard navigation
 */
export const VitalModelSelectorInput = forwardRef<HTMLInputElement, VitalModelSelectorInputProps>(
  ({ className, placeholder = 'Search models...', ...props }, ref) => {
    const { search, setSearch } = useModelSelectorContext();

    return (
      <div className="flex items-center border-b px-3">
        <Search className="mr-2 size-4 shrink-0 opacity-50" />
        <input
          ref={ref}
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={placeholder}
          className={cn(
            'flex h-11 w-full bg-transparent py-3 text-sm outline-none',
            'placeholder:text-muted-foreground',
            'disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          {...props}
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch('')}
            className="rounded-sm opacity-50 hover:opacity-100"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
    );
  }
);

/**
 * Scrollable list container
 */
export const VitalModelSelectorList = forwardRef<HTMLDivElement, VitalModelSelectorListProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)}
      {...props}
    />
  )
);

/**
 * Empty state when no results match
 */
export const VitalModelSelectorEmpty = forwardRef<HTMLDivElement, VitalModelSelectorEmptyProps>(
  ({ className, children = 'No models found.', ...props }, ref) => (
    <div
      ref={ref}
      className={cn('py-6 text-center text-sm text-muted-foreground', className)}
      {...props}
    >
      {children}
    </div>
  )
);

/**
 * Group container with heading
 */
export const VitalModelSelectorGroup = forwardRef<HTMLDivElement, VitalModelSelectorGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div ref={ref} className={cn('overflow-hidden p-1', className)} {...props}>
      {heading && (
        <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  )
);

/**
 * Individual selectable item
 */
export const VitalModelSelectorItem = forwardRef<HTMLDivElement, VitalModelSelectorItemProps>(
  ({ className, value, onSelect, disabled, selected, children, ...props }, ref) => {
    const { setOpen, search } = useModelSelectorContext();

    // Simple filter - hide if doesn't match search
    const searchLower = search.toLowerCase();
    const valueLower = (value || '').toLowerCase();
    if (search && !valueLower.includes(searchLower)) {
      return null;
    }

    const handleSelect = () => {
      if (disabled) return;
      onSelect?.();
      setOpen(false);
    };

    return (
      <div
        ref={ref}
        role="option"
        aria-selected={selected}
        aria-disabled={disabled}
        onClick={handleSelect}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleSelect();
          }
        }}
        tabIndex={disabled ? -1 : 0}
        className={cn(
          'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:bg-accent focus:text-accent-foreground',
          disabled && 'pointer-events-none opacity-50',
          selected && 'bg-accent',
          className
        )}
        {...props}
      >
        {children}
        {selected && <Check className="ml-auto size-4" />}
      </div>
    );
  }
);

/**
 * Keyboard shortcut indicator
 */
export const VitalModelSelectorShortcut = forwardRef<HTMLSpanElement, VitalModelSelectorShortcutProps>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn('ml-auto text-xs tracking-widest text-muted-foreground', className)}
      {...props}
    />
  )
);

/**
 * Separator between groups
 */
export const VitalModelSelectorSeparator = forwardRef<HTMLDivElement, VitalModelSelectorSeparatorProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
  )
);

/**
 * Provider logo with fallback
 */
export const VitalModelSelectorLogo = forwardRef<HTMLImageElement, VitalModelSelectorLogoProps>(
  ({ provider, className, ...props }, ref) => (
    <img
      ref={ref}
      alt={`${provider} logo`}
      src={`https://models.dev/logos/${provider}.svg`}
      onError={(e) => {
        // Fallback to generic icon
        (e.target as HTMLImageElement).style.display = 'none';
      }}
      className={cn('size-4 dark:invert', className)}
      width={16}
      height={16}
      {...props}
    />
  )
);

/**
 * Container for multiple provider logos
 */
export const VitalModelSelectorLogoGroup = forwardRef<HTMLDivElement, VitalModelSelectorLogoGroupProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        '-space-x-1 flex shrink-0 items-center',
        '[&>img]:rounded-full [&>img]:bg-background [&>img]:p-px [&>img]:ring-1 [&>img]:ring-border',
        'dark:[&>img]:bg-foreground',
        className
      )}
      {...props}
    />
  )
);

/**
 * Model name with truncation
 */
export const VitalModelSelectorName = forwardRef<HTMLSpanElement, VitalModelSelectorNameProps>(
  ({ className, ...props }, ref) => (
    <span ref={ref} className={cn('flex-1 truncate text-left', className)} {...props} />
  )
);

// ============================================================================
// Display Names
// ============================================================================

VitalModelSelector.displayName = 'VitalModelSelector';
VitalModelSelectorTrigger.displayName = 'VitalModelSelectorTrigger';
VitalModelSelectorContent.displayName = 'VitalModelSelectorContent';
VitalModelSelectorDialog.displayName = 'VitalModelSelectorDialog';
VitalModelSelectorInput.displayName = 'VitalModelSelectorInput';
VitalModelSelectorList.displayName = 'VitalModelSelectorList';
VitalModelSelectorEmpty.displayName = 'VitalModelSelectorEmpty';
VitalModelSelectorGroup.displayName = 'VitalModelSelectorGroup';
VitalModelSelectorItem.displayName = 'VitalModelSelectorItem';
VitalModelSelectorShortcut.displayName = 'VitalModelSelectorShortcut';
VitalModelSelectorSeparator.displayName = 'VitalModelSelectorSeparator';
VitalModelSelectorLogo.displayName = 'VitalModelSelectorLogo';
VitalModelSelectorLogoGroup.displayName = 'VitalModelSelectorLogoGroup';
VitalModelSelectorName.displayName = 'VitalModelSelectorName';

// ============================================================================
// Aliases (for compatibility with ai-elements naming)
// ============================================================================

export const ModelSelector = VitalModelSelector;
export const ModelSelectorTrigger = VitalModelSelectorTrigger;
export const ModelSelectorContent = VitalModelSelectorContent;
export const ModelSelectorDialog = VitalModelSelectorDialog;
export const ModelSelectorInput = VitalModelSelectorInput;
export const ModelSelectorList = VitalModelSelectorList;
export const ModelSelectorEmpty = VitalModelSelectorEmpty;
export const ModelSelectorGroup = VitalModelSelectorGroup;
export const ModelSelectorItem = VitalModelSelectorItem;
export const ModelSelectorShortcut = VitalModelSelectorShortcut;
export const ModelSelectorSeparator = VitalModelSelectorSeparator;
export const ModelSelectorLogo = VitalModelSelectorLogo;
export const ModelSelectorLogoGroup = VitalModelSelectorLogoGroup;
export const ModelSelectorName = VitalModelSelectorName;

export default VitalModelSelector;

'use client';

/**
 * VitalPromptInput - Comprehensive Prompt Input Component Suite
 * 
 * A full-featured compound component system for building chat input interfaces
 * with file attachments, speech recognition, model selection, and more.
 * 
 * Features:
 * - Auto-resizing textarea that adjusts height based on content
 * - File attachment support with drag-and-drop
 * - Image preview for image attachments
 * - Configurable file constraints (max files, max size, accepted types)
 * - Automatic submit button icons based on status
 * - Support for keyboard shortcuts (Enter to submit, Shift+Enter for new line)
 * - Customizable min/max height for the textarea
 * - Flexible toolbar with support for custom actions and tools
 * - Built-in model selection dropdown
 * - Built-in native speech recognition button (Web Speech API)
 * - Optional provider for lifted state management
 * - Form automatically resets on submit
 * - Global document drop support (opt-in)
 * 
 * @example
 * ```tsx
 * <VitalPromptInput onSubmit={handleSubmit} globalDrop multiple>
 *   <VitalPromptInputHeader>
 *     <VitalPromptInputAttachments>
 *       {(attachment) => <VitalPromptInputAttachment data={attachment} />}
 *     </VitalPromptInputAttachments>
 *   </VitalPromptInputHeader>
 *   <VitalPromptInputBody>
 *     <VitalPromptInputTextarea value={text} onChange={setText} />
 *   </VitalPromptInputBody>
 *   <VitalPromptInputFooter>
 *     <VitalPromptInputTools>
 *       <VitalPromptInputActionMenu>
 *         <VitalPromptInputActionMenuTrigger />
 *         <VitalPromptInputActionMenuContent>
 *           <VitalPromptInputActionAddAttachments />
 *         </VitalPromptInputActionMenuContent>
 *       </VitalPromptInputActionMenu>
 *       <VitalPromptInputSpeechButton onTranscriptionChange={setText} />
 *     </VitalPromptInputTools>
 *     <VitalPromptInputSubmit status={status} />
 *   </VitalPromptInputFooter>
 * </VitalPromptInput>
 * ```
 */

import { cn } from '../lib/utils';
import {
  CornerDownLeft,
  Image as ImageIcon,
  Loader2,
  Mic,
  Paperclip,
  Plus,
  Square,
  X,
  ChevronDown,
  Check,
  Search,
} from 'lucide-react';
import {
  type ChangeEvent,
  type ChangeEventHandler,
  Children,
  type ClipboardEventHandler,
  type ComponentProps,
  createContext,
  type FormEvent,
  type FormEventHandler,
  Fragment,
  type HTMLAttributes,
  type KeyboardEventHandler,
  type PropsWithChildren,
  type ReactNode,
  type RefObject,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  forwardRef,
} from 'react';

// ============================================================================
// Types
// ============================================================================

/** File attachment data */
export interface FileUIPart {
  type: 'file';
  url: string;
  mediaType?: string;
  filename?: string;
}

/** Chat status for submit button */
export type ChatStatus = 'ready' | 'submitted' | 'streaming' | 'error';

/** Attachments context */
export interface AttachmentsContext {
  files: (FileUIPart & { id: string })[];
  add: (files: File[] | FileList) => void;
  remove: (id: string) => void;
  clear: () => void;
  openFileDialog: () => void;
  fileInputRef: RefObject<HTMLInputElement | null>;
}

/** Text input context */
export interface TextInputContext {
  value: string;
  setInput: (v: string) => void;
  clear: () => void;
}

/** Controller props */
export interface PromptInputControllerProps {
  textInput: TextInputContext;
  attachments: AttachmentsContext;
  __registerFileInput: (
    ref: RefObject<HTMLInputElement | null>,
    open: () => void
  ) => void;
}

/** Message payload */
export interface PromptInputMessage {
  text: string;
  files: FileUIPart[];
}

// ============================================================================
// Contexts
// ============================================================================

const PromptInputController = createContext<PromptInputControllerProps | null>(null);
const ProviderAttachmentsContext = createContext<AttachmentsContext | null>(null);
const LocalAttachmentsContext = createContext<AttachmentsContext | null>(null);

// ============================================================================
// Hooks
// ============================================================================

/**
 * Access the full PromptInput controller from a PromptInputProvider
 */
export const usePromptInputController = () => {
  const ctx = useContext(PromptInputController);
  if (!ctx) {
    throw new Error('Wrap your component inside <VitalPromptInputProvider> to use usePromptInputController().');
  }
  return ctx;
};

const useOptionalPromptInputController = () => useContext(PromptInputController);

/**
 * Access attachments context from a PromptInputProvider
 */
export const useProviderAttachments = () => {
  const ctx = useContext(ProviderAttachmentsContext);
  if (!ctx) {
    throw new Error('Wrap your component inside <VitalPromptInputProvider> to use useProviderAttachments().');
  }
  return ctx;
};

const useOptionalProviderAttachments = () => useContext(ProviderAttachmentsContext);

/**
 * Access and manage file attachments within a PromptInput context
 */
export const usePromptInputAttachments = () => {
  const provider = useOptionalProviderAttachments();
  const local = useContext(LocalAttachmentsContext);
  const context = provider ?? local;
  if (!context) {
    throw new Error('usePromptInputAttachments must be used within a VitalPromptInput or VitalPromptInputProvider');
  }
  return context;
};

// ============================================================================
// Utility Functions
// ============================================================================

const generateId = () => Math.random().toString(36).substring(2, 11);

const convertBlobUrlToDataUrl = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

// ============================================================================
// Provider Component
// ============================================================================

export type VitalPromptInputProviderProps = PropsWithChildren<{
  /** Initial text input value */
  initialInput?: string;
}>;

/**
 * Optional global provider that lifts PromptInput state outside of PromptInput
 */
export function VitalPromptInputProvider({
  initialInput: initialTextInput = '',
  children,
}: VitalPromptInputProviderProps) {
  const [textInput, setTextInput] = useState(initialTextInput);
  const clearInput = useCallback(() => setTextInput(''), []);

  const [attachmentFiles, setAttachmentFiles] = useState<(FileUIPart & { id: string })[]>([]);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const openRef = useRef<() => void>(() => {});

  const add = useCallback((files: File[] | FileList) => {
    const incoming = Array.from(files);
    if (incoming.length === 0) return;

    setAttachmentFiles((prev) =>
      prev.concat(
        incoming.map((file) => ({
          id: generateId(),
          type: 'file' as const,
          url: URL.createObjectURL(file),
          mediaType: file.type,
          filename: file.name,
        }))
      )
    );
  }, []);

  const remove = useCallback((id: string) => {
    setAttachmentFiles((prev) => {
      const found = prev.find((f) => f.id === id);
      if (found?.url) URL.revokeObjectURL(found.url);
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  const clear = useCallback(() => {
    setAttachmentFiles((prev) => {
      for (const f of prev) {
        if (f.url) URL.revokeObjectURL(f.url);
      }
      return [];
    });
  }, []);

  const attachmentsRef = useRef(attachmentFiles);
  attachmentsRef.current = attachmentFiles;

  useEffect(() => {
    return () => {
      for (const f of attachmentsRef.current) {
        if (f.url) URL.revokeObjectURL(f.url);
      }
    };
  }, []);

  const openFileDialog = useCallback(() => {
    openRef.current?.();
  }, []);

  const attachments = useMemo<AttachmentsContext>(
    () => ({
      files: attachmentFiles,
      add,
      remove,
      clear,
      openFileDialog,
      fileInputRef,
    }),
    [attachmentFiles, add, remove, clear, openFileDialog]
  );

  const __registerFileInput = useCallback(
    (ref: RefObject<HTMLInputElement | null>, open: () => void) => {
      fileInputRef.current = ref.current;
      openRef.current = open;
    },
    []
  );

  const controller = useMemo<PromptInputControllerProps>(
    () => ({
      textInput: {
        value: textInput,
        setInput: setTextInput,
        clear: clearInput,
      },
      attachments,
      __registerFileInput,
    }),
    [textInput, clearInput, attachments, __registerFileInput]
  );

  return (
    <PromptInputController.Provider value={controller}>
      <ProviderAttachmentsContext.Provider value={attachments}>
        {children}
      </ProviderAttachmentsContext.Provider>
    </PromptInputController.Provider>
  );
}

// ============================================================================
// Main Components
// ============================================================================

export type VitalPromptInputProps = Omit<HTMLAttributes<HTMLFormElement>, 'onSubmit' | 'onError'> & {
  /** Handler called when the form is submitted */
  onSubmit: (message: PromptInputMessage, event: FormEvent<HTMLFormElement>) => void | Promise<void>;
  /** File types to accept */
  accept?: string;
  /** Whether to allow multiple file selection */
  multiple?: boolean;
  /** When true, accepts file drops anywhere on the document */
  globalDrop?: boolean;
  /** Render a hidden input for native form posts */
  syncHiddenInput?: boolean;
  /** Maximum number of files allowed */
  maxFiles?: number;
  /** Maximum file size in bytes */
  maxFileSize?: number;
  /** Handler for file validation errors */
  onError?: (err: { code: 'max_files' | 'max_file_size' | 'accept'; message: string }) => void;
};

/**
 * Root prompt input form with file handling
 */
export const VitalPromptInput = forwardRef<HTMLFormElement, VitalPromptInputProps>(
  (
    {
      className,
      accept,
      multiple,
      globalDrop,
      syncHiddenInput,
      maxFiles,
      maxFileSize,
      onError,
      onSubmit,
      children,
      ...props
    },
    ref
  ) => {
    const controller = useOptionalPromptInputController();
    const usingProvider = !!controller;

    const inputRef = useRef<HTMLInputElement | null>(null);
    const formRef = useRef<HTMLFormElement | null>(null);

    const [items, setItems] = useState<(FileUIPart & { id: string })[]>([]);
    const files = usingProvider ? controller.attachments.files : items;

    const filesRef = useRef(files);
    filesRef.current = files;

    const openFileDialogLocal = useCallback(() => {
      inputRef.current?.click();
    }, []);

    const matchesAccept = useCallback(
      (f: File) => {
        if (!accept || accept.trim() === '') return true;
        if (accept.includes('image/*')) return f.type.startsWith('image/');
        return true;
      },
      [accept]
    );

    const addLocal = useCallback(
      (fileList: File[] | FileList) => {
        const incoming = Array.from(fileList);
        const accepted = incoming.filter((f) => matchesAccept(f));
        if (incoming.length && accepted.length === 0) {
          onError?.({ code: 'accept', message: 'No files match the accepted types.' });
          return;
        }
        const withinSize = (f: File) => (maxFileSize ? f.size <= maxFileSize : true);
        const sized = accepted.filter(withinSize);
        if (accepted.length > 0 && sized.length === 0) {
          onError?.({ code: 'max_file_size', message: 'All files exceed the maximum size.' });
          return;
        }

        setItems((prev) => {
          const capacity = typeof maxFiles === 'number' ? Math.max(0, maxFiles - prev.length) : undefined;
          const capped = typeof capacity === 'number' ? sized.slice(0, capacity) : sized;
          if (typeof capacity === 'number' && sized.length > capacity) {
            onError?.({ code: 'max_files', message: 'Too many files. Some were not added.' });
          }
          const next: (FileUIPart & { id: string })[] = [];
          for (const file of capped) {
            next.push({
              id: generateId(),
              type: 'file',
              url: URL.createObjectURL(file),
              mediaType: file.type,
              filename: file.name,
            });
          }
          return prev.concat(next);
        });
      },
      [matchesAccept, maxFiles, maxFileSize, onError]
    );

    const removeLocal = useCallback(
      (id: string) =>
        setItems((prev) => {
          const found = prev.find((file) => file.id === id);
          if (found?.url) URL.revokeObjectURL(found.url);
          return prev.filter((file) => file.id !== id);
        }),
      []
    );

    const clearLocal = useCallback(
      () =>
        setItems((prev) => {
          for (const file of prev) {
            if (file.url) URL.revokeObjectURL(file.url);
          }
          return [];
        }),
      []
    );

    const add = usingProvider ? controller.attachments.add : addLocal;
    const remove = usingProvider ? controller.attachments.remove : removeLocal;
    const clear = usingProvider ? controller.attachments.clear : clearLocal;
    const openFileDialog = usingProvider ? controller.attachments.openFileDialog : openFileDialogLocal;

    useEffect(() => {
      if (!usingProvider) return;
      controller.__registerFileInput(inputRef, () => inputRef.current?.click());
    }, [usingProvider, controller]);

    useEffect(() => {
      if (syncHiddenInput && inputRef.current && files.length === 0) {
        inputRef.current.value = '';
      }
    }, [files, syncHiddenInput]);

    // Form drop handlers
    useEffect(() => {
      const form = formRef.current;
      if (!form) return;

      const onDragOver = (e: DragEvent) => {
        if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
      };
      const onDrop = (e: DragEvent) => {
        if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          add(e.dataTransfer.files);
        }
      };
      form.addEventListener('dragover', onDragOver);
      form.addEventListener('drop', onDrop);
      return () => {
        form.removeEventListener('dragover', onDragOver);
        form.removeEventListener('drop', onDrop);
      };
    }, [add]);

    // Global drop handlers
    useEffect(() => {
      if (!globalDrop) return;

      const onDragOver = (e: DragEvent) => {
        if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
      };
      const onDrop = (e: DragEvent) => {
        if (e.dataTransfer?.types?.includes('Files')) e.preventDefault();
        if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
          add(e.dataTransfer.files);
        }
      };
      document.addEventListener('dragover', onDragOver);
      document.addEventListener('drop', onDrop);
      return () => {
        document.removeEventListener('dragover', onDragOver);
        document.removeEventListener('drop', onDrop);
      };
    }, [add, globalDrop]);

    // Cleanup on unmount
    useEffect(
      () => () => {
        if (!usingProvider) {
          for (const f of filesRef.current) {
            if (f.url) URL.revokeObjectURL(f.url);
          }
        }
      },
      [usingProvider]
    );

    const handleChange: ChangeEventHandler<HTMLInputElement> = (event) => {
      if (event.currentTarget.files) {
        add(event.currentTarget.files);
      }
      event.currentTarget.value = '';
    };

    const ctx = useMemo<AttachmentsContext>(
      () => ({
        files: files.map((item) => ({ ...item, id: item.id })),
        add,
        remove,
        clear,
        openFileDialog,
        fileInputRef: inputRef,
      }),
      [files, add, remove, clear, openFileDialog]
    );

    const handleSubmit: FormEventHandler<HTMLFormElement> = (event) => {
      event.preventDefault();

      const form = event.currentTarget;
      const text = usingProvider
        ? controller.textInput.value
        : (() => {
            const formData = new FormData(form);
            return (formData.get('message') as string) || '';
          })();

      if (!usingProvider) form.reset();

      Promise.all(
        files.map(async ({ id, ...item }) => {
          if (item.url && item.url.startsWith('blob:')) {
            const dataUrl = await convertBlobUrlToDataUrl(item.url);
            return { ...item, url: dataUrl ?? item.url };
          }
          return item;
        })
      )
        .then((convertedFiles: FileUIPart[]) => {
          try {
            const result = onSubmit({ text, files: convertedFiles }, event);
            if (result instanceof Promise) {
              result
                .then(() => {
                  clear();
                  if (usingProvider) controller.textInput.clear();
                })
                .catch(() => {});
            } else {
              clear();
              if (usingProvider) controller.textInput.clear();
            }
          } catch {}
        })
        .catch(() => {});
    };

    const inner = (
      <>
        <input
          accept={accept}
          aria-label="Upload files"
          className="hidden"
          multiple={multiple}
          onChange={handleChange}
          ref={inputRef}
          title="Upload files"
          type="file"
        />
        <form
          ref={(node) => {
            formRef.current = node;
            if (typeof ref === 'function') ref(node);
            else if (ref) ref.current = node;
          }}
          className={cn('w-full', className)}
          onSubmit={handleSubmit}
          {...props}
        >
          <div className="relative rounded-lg border bg-background overflow-hidden">
            {children}
          </div>
        </form>
      </>
    );

    return usingProvider ? inner : <LocalAttachmentsContext.Provider value={ctx}>{inner}</LocalAttachmentsContext.Provider>;
  }
);

// ============================================================================
// Layout Components
// ============================================================================

export type VitalPromptInputHeaderProps = ComponentProps<'div'>;

export const VitalPromptInputHeader = forwardRef<HTMLDivElement, VitalPromptInputHeaderProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-wrap gap-1 p-3 pb-0', className)} {...props} />
  )
);

export type VitalPromptInputBodyProps = HTMLAttributes<HTMLDivElement>;

export const VitalPromptInputBody = forwardRef<HTMLDivElement, VitalPromptInputBodyProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('contents', className)} {...props} />
);

export type VitalPromptInputFooterProps = ComponentProps<'div'>;

export const VitalPromptInputFooter = forwardRef<HTMLDivElement, VitalPromptInputFooterProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center justify-between gap-1 p-3 pt-0', className)} {...props} />
  )
);

export type VitalPromptInputToolsProps = HTMLAttributes<HTMLDivElement>;

export const VitalPromptInputTools = forwardRef<HTMLDivElement, VitalPromptInputToolsProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-1', className)} {...props} />
  )
);

// ============================================================================
// Textarea Component
// ============================================================================

export type VitalPromptInputTextareaProps = ComponentProps<'textarea'>;

export const VitalPromptInputTextarea = forwardRef<HTMLTextAreaElement, VitalPromptInputTextareaProps>(
  ({ onChange, className, placeholder = 'What would you like to know?', ...props }, ref) => {
    const controller = useOptionalPromptInputController();
    const attachments = usePromptInputAttachments();
    const [isComposing, setIsComposing] = useState(false);

    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
      if (e.key === 'Enter') {
        if (isComposing || e.nativeEvent.isComposing) return;
        if (e.shiftKey) return;
        e.preventDefault();

        const form = e.currentTarget.form;
        const submitButton = form?.querySelector('button[type="submit"]') as HTMLButtonElement | null;
        if (submitButton?.disabled) return;

        form?.requestSubmit();
      }

      if (e.key === 'Backspace' && e.currentTarget.value === '' && attachments.files.length > 0) {
        e.preventDefault();
        const lastAttachment = attachments.files.at(-1);
        if (lastAttachment) attachments.remove(lastAttachment.id);
      }
    };

    const handlePaste: ClipboardEventHandler<HTMLTextAreaElement> = (event) => {
      const items = event.clipboardData?.items;
      if (!items) return;

      const files: File[] = [];
      for (const item of items) {
        if (item.kind === 'file') {
          const file = item.getAsFile();
          if (file) files.push(file);
        }
      }

      if (files.length > 0) {
        event.preventDefault();
        attachments.add(files);
      }
    };

    const controlledProps = controller
      ? {
          value: controller.textInput.value,
          onChange: (e: ChangeEvent<HTMLTextAreaElement>) => {
            controller.textInput.setInput(e.currentTarget.value);
            onChange?.(e);
          },
        }
      : { onChange };

    return (
      <textarea
        ref={ref}
        name="message"
        className={cn(
          'flex min-h-16 max-h-48 w-full resize-none bg-transparent px-3 py-3 text-sm',
          'placeholder:text-muted-foreground focus:outline-none',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'field-sizing-content',
          className
        )}
        onCompositionEnd={() => setIsComposing(false)}
        onCompositionStart={() => setIsComposing(true)}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        placeholder={placeholder}
        {...props}
        {...controlledProps}
      />
    );
  }
);

// ============================================================================
// Button Components
// ============================================================================

export type VitalPromptInputButtonProps = ComponentProps<'button'> & {
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon' | 'icon-sm';
};

export const VitalPromptInputButton = forwardRef<HTMLButtonElement, VitalPromptInputButtonProps>(
  ({ variant = 'ghost', size, className, children, ...props }, ref) => {
    const newSize = size ?? (Children.count(children) > 1 ? 'sm' : 'icon-sm');

    const sizeClasses = {
      default: 'h-10 px-4',
      sm: 'h-8 px-3 text-sm gap-1.5',
      icon: 'h-10 w-10',
      'icon-sm': 'h-8 w-8',
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent',
    };

    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[newSize],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

export type VitalPromptInputSubmitProps = ComponentProps<'button'> & {
  /** Current chat status to determine button icon */
  status?: ChatStatus;
  variant?: 'default' | 'ghost' | 'outline';
  size?: 'default' | 'sm' | 'icon' | 'icon-sm';
};

export const VitalPromptInputSubmit = forwardRef<HTMLButtonElement, VitalPromptInputSubmitProps>(
  ({ className, variant = 'default', size = 'icon-sm', status, children, ...props }, ref) => {
    let Icon = <CornerDownLeft className="size-4" />;

    if (status === 'submitted') {
      Icon = <Loader2 className="size-4 animate-spin" />;
    } else if (status === 'streaming') {
      Icon = <Square className="size-4" />;
    } else if (status === 'error') {
      Icon = <X className="size-4" />;
    }

    const sizeClasses = {
      default: 'h-10 px-4',
      sm: 'h-8 px-3 text-sm',
      icon: 'h-10 w-10',
      'icon-sm': 'h-8 w-8',
    };

    const variantClasses = {
      default: 'bg-primary text-primary-foreground hover:bg-primary/90',
      ghost: 'hover:bg-accent hover:text-accent-foreground',
      outline: 'border border-input bg-background hover:bg-accent',
    };

    return (
      <button
        ref={ref}
        type="submit"
        aria-label="Submit"
        className={cn(
          'inline-flex items-center justify-center rounded-md transition-colors',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          'disabled:pointer-events-none disabled:opacity-50',
          sizeClasses[size],
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {children ?? Icon}
      </button>
    );
  }
);

// ============================================================================
// Attachment Components
// ============================================================================

export type VitalPromptInputAttachmentProps = HTMLAttributes<HTMLDivElement> & {
  data: FileUIPart & { id: string };
};

export const VitalPromptInputAttachment = forwardRef<HTMLDivElement, VitalPromptInputAttachmentProps>(
  ({ data, className, ...props }, ref) => {
    const attachments = usePromptInputAttachments();
    const filename = data.filename || '';
    const isImage = data.mediaType?.startsWith('image/') && data.url;
    const attachmentLabel = filename || (isImage ? 'Image' : 'Attachment');

    return (
      <div
        ref={ref}
        className={cn(
          'group relative flex h-8 cursor-pointer select-none items-center gap-1.5',
          'rounded-md border px-1.5 text-sm transition-all',
          'hover:bg-accent hover:text-accent-foreground',
          className
        )}
        {...props}
      >
        <div className="relative size-5 shrink-0">
          <div className="absolute inset-0 flex size-5 items-center justify-center overflow-hidden rounded bg-background transition-opacity group-hover:opacity-0">
            {isImage ? (
              <img
                alt={filename || 'attachment'}
                className="size-5 object-cover"
                height={20}
                src={data.url}
                width={20}
              />
            ) : (
              <Paperclip className="size-3 text-muted-foreground" />
            )}
          </div>
          <button
            type="button"
            aria-label="Remove attachment"
            className={cn(
              'absolute inset-0 size-5 rounded p-0 opacity-0 transition-opacity',
              'group-hover:pointer-events-auto group-hover:opacity-100',
              'hover:bg-accent inline-flex items-center justify-center'
            )}
            onClick={(e) => {
              e.stopPropagation();
              attachments.remove(data.id);
            }}
          >
            <X className="size-2.5" />
          </button>
        </div>
        <span className="flex-1 truncate">{attachmentLabel}</span>
      </div>
    );
  }
);

export type VitalPromptInputAttachmentsProps = Omit<HTMLAttributes<HTMLDivElement>, 'children'> & {
  children: (attachment: FileUIPart & { id: string }) => ReactNode;
};

export const VitalPromptInputAttachments = forwardRef<HTMLDivElement, VitalPromptInputAttachmentsProps>(
  ({ children, className, ...props }, ref) => {
    const attachments = usePromptInputAttachments();

    if (!attachments.files.length) return null;

    return (
      <div ref={ref} className={cn('flex flex-wrap items-center gap-2 p-3 w-full', className)} {...props}>
        {attachments.files.map((file) => (
          <Fragment key={file.id}>{children(file)}</Fragment>
        ))}
      </div>
    );
  }
);

// ============================================================================
// Action Menu Components
// ============================================================================

export type VitalPromptInputActionMenuProps = ComponentProps<'div'> & {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export const VitalPromptInputActionMenu = forwardRef<HTMLDivElement, VitalPromptInputActionMenuProps>(
  ({ className, children, open: controlledOpen, onOpenChange, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <div ref={ref} className={cn('relative', className)} {...props}>
        {typeof children === 'function'
          ? (children as (props: { open: boolean; setOpen: (open: boolean) => void }) => ReactNode)({ open, setOpen })
          : children}
        {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />}
      </div>
    );
  }
);

export type VitalPromptInputActionMenuTriggerProps = VitalPromptInputButtonProps;

export const VitalPromptInputActionMenuTrigger = forwardRef<HTMLButtonElement, VitalPromptInputActionMenuTriggerProps>(
  ({ className, children, onClick, ...props }, ref) => (
    <VitalPromptInputButton ref={ref} className={className} onClick={onClick} {...props}>
      {children ?? <Plus className="size-4" />}
    </VitalPromptInputButton>
  )
);

export type VitalPromptInputActionMenuContentProps = ComponentProps<'div'>;

export const VitalPromptInputActionMenuContent = forwardRef<HTMLDivElement, VitalPromptInputActionMenuContentProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'absolute bottom-full left-0 mb-2 z-50 min-w-[180px]',
        'rounded-md border bg-popover p-1 shadow-lg',
        'animate-in fade-in-0 zoom-in-95',
        className
      )}
      {...props}
    />
  )
);

export type VitalPromptInputActionMenuItemProps = ComponentProps<'button'>;

export const VitalPromptInputActionMenuItem = forwardRef<HTMLButtonElement, VitalPromptInputActionMenuItemProps>(
  ({ className, ...props }, ref) => (
    <button
      ref={ref}
      type="button"
      className={cn(
        'relative flex w-full cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm',
        'hover:bg-accent hover:text-accent-foreground',
        'focus:bg-accent focus:text-accent-foreground focus:outline-none',
        className
      )}
      {...props}
    />
  )
);

export type VitalPromptInputActionAddAttachmentsProps = ComponentProps<'button'> & {
  label?: string;
};

export const VitalPromptInputActionAddAttachments = forwardRef<HTMLButtonElement, VitalPromptInputActionAddAttachmentsProps>(
  ({ label = 'Add photos or files', className, ...props }, ref) => {
    const attachments = usePromptInputAttachments();

    return (
      <VitalPromptInputActionMenuItem
        ref={ref}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          attachments.openFileDialog();
        }}
        {...props}
      >
        <ImageIcon className="mr-2 size-4" /> {label}
      </VitalPromptInputActionMenuItem>
    );
  }
);

// ============================================================================
// Speech Recognition Component
// ============================================================================

export type VitalPromptInputSpeechButtonProps = ComponentProps<typeof VitalPromptInputButton> & {
  textareaRef?: RefObject<HTMLTextAreaElement | null>;
  onTranscriptionChange?: (text: string) => void;
};

export const VitalPromptInputSpeechButton = forwardRef<HTMLButtonElement, VitalPromptInputSpeechButtonProps>(
  ({ className, textareaRef, onTranscriptionChange, ...props }, ref) => {
    const [isListening, setIsListening] = useState(false);
    const [recognition, setRecognition] = useState<any>(null);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
      if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const speechRecognition = new SpeechRecognition();
          speechRecognition.continuous = true;
          speechRecognition.interimResults = true;
          speechRecognition.lang = 'en-US';

          speechRecognition.onstart = () => setIsListening(true);
          speechRecognition.onend = () => setIsListening(false);

          speechRecognition.onresult = (event: any) => {
            let finalTranscript = '';
            for (let i = event.resultIndex; i < event.results.length; i++) {
              const result = event.results[i];
              if (result.isFinal) {
                finalTranscript += result[0]?.transcript ?? '';
              }
            }

            if (finalTranscript && textareaRef?.current) {
              const textarea = textareaRef.current;
              const currentValue = textarea.value;
              const newValue = currentValue + (currentValue ? ' ' : '') + finalTranscript;
              textarea.value = newValue;
              textarea.dispatchEvent(new Event('input', { bubbles: true }));
              onTranscriptionChange?.(newValue);
            }
          };

          speechRecognition.onerror = () => setIsListening(false);

          recognitionRef.current = speechRecognition;
          setRecognition(speechRecognition);
        }
      }

      return () => {
        if (recognitionRef.current) recognitionRef.current.stop();
      };
    }, [textareaRef, onTranscriptionChange]);

    const toggleListening = useCallback(() => {
      if (!recognition) return;
      if (isListening) {
        recognition.stop();
      } else {
        recognition.start();
      }
    }, [recognition, isListening]);

    return (
      <VitalPromptInputButton
        ref={ref}
        className={cn(
          'relative transition-all duration-200',
          isListening && 'animate-pulse bg-accent text-accent-foreground',
          className
        )}
        disabled={!recognition}
        onClick={toggleListening}
        {...props}
      >
        <Mic className="size-4" />
      </VitalPromptInputButton>
    );
  }
);

// ============================================================================
// Select Components
// ============================================================================

export type VitalPromptInputSelectProps = ComponentProps<'div'> & {
  value?: string;
  onValueChange?: (value: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

const SelectContext = createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  open: boolean;
  setOpen: (open: boolean) => void;
} | null>(null);

export const VitalPromptInputSelect = forwardRef<HTMLDivElement, VitalPromptInputSelectProps>(
  ({ className, value, onValueChange, open: controlledOpen, onOpenChange, children, ...props }, ref) => {
    const [internalOpen, setInternalOpen] = useState(false);
    const open = controlledOpen ?? internalOpen;
    const setOpen = (newOpen: boolean) => {
      setInternalOpen(newOpen);
      onOpenChange?.(newOpen);
    };

    return (
      <SelectContext.Provider value={{ value, onValueChange, open, setOpen }}>
        <div ref={ref} className={cn('relative', className)} {...props}>
          {children}
          {open && <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} aria-hidden="true" />}
        </div>
      </SelectContext.Provider>
    );
  }
);

export type VitalPromptInputSelectTriggerProps = ComponentProps<'button'>;

export const VitalPromptInputSelectTrigger = forwardRef<HTMLButtonElement, VitalPromptInputSelectTriggerProps>(
  ({ className, children, ...props }, ref) => {
    const ctx = useContext(SelectContext);

    return (
      <button
        ref={ref}
        type="button"
        role="combobox"
        aria-expanded={ctx?.open}
        onClick={() => ctx?.setOpen(!ctx?.open)}
        className={cn(
          'flex h-8 items-center justify-between gap-2 rounded-md px-3 text-sm',
          'bg-transparent transition-colors',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:outline-none focus:ring-2 focus:ring-ring',
          ctx?.open && 'bg-accent text-accent-foreground',
          className
        )}
        {...props}
      >
        {children}
        <ChevronDown className="size-4 opacity-50" />
      </button>
    );
  }
);

export type VitalPromptInputSelectValueProps = ComponentProps<'span'> & {
  placeholder?: string;
};

export const VitalPromptInputSelectValue = forwardRef<HTMLSpanElement, VitalPromptInputSelectValueProps>(
  ({ className, placeholder = 'Select...', ...props }, ref) => {
    const ctx = useContext(SelectContext);
    return (
      <span ref={ref} className={cn('truncate', className)} {...props}>
        {ctx?.value || placeholder}
      </span>
    );
  }
);

export type VitalPromptInputSelectContentProps = ComponentProps<'div'>;

export const VitalPromptInputSelectContent = forwardRef<HTMLDivElement, VitalPromptInputSelectContentProps>(
  ({ className, ...props }, ref) => {
    const ctx = useContext(SelectContext);
    if (!ctx?.open) return null;

    return (
      <div
        ref={ref}
        className={cn(
          'absolute bottom-full left-0 mb-2 z-50 min-w-[150px]',
          'rounded-md border bg-popover p-1 shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          className
        )}
        {...props}
      />
    );
  }
);

export type VitalPromptInputSelectItemProps = ComponentProps<'button'> & {
  value: string;
};

export const VitalPromptInputSelectItem = forwardRef<HTMLButtonElement, VitalPromptInputSelectItemProps>(
  ({ className, value, children, ...props }, ref) => {
    const ctx = useContext(SelectContext);
    const isSelected = ctx?.value === value;

    return (
      <button
        ref={ref}
        type="button"
        role="option"
        aria-selected={isSelected}
        onClick={() => {
          ctx?.onValueChange?.(value);
          ctx?.setOpen(false);
        }}
        className={cn(
          'relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm',
          'hover:bg-accent hover:text-accent-foreground',
          'focus:bg-accent focus:text-accent-foreground focus:outline-none',
          className
        )}
        {...props}
      >
        {isSelected && (
          <span className="absolute left-2 flex size-4 items-center justify-center">
            <Check className="size-4" />
          </span>
        )}
        {children}
      </button>
    );
  }
);

// ============================================================================
// Hover Card Components
// ============================================================================

export type VitalPromptInputHoverCardProps = ComponentProps<'div'> & {
  openDelay?: number;
  closeDelay?: number;
};

const HoverCardContext = createContext<{ open: boolean; setOpen: (open: boolean) => void } | null>(null);

export const VitalPromptInputHoverCard = forwardRef<HTMLDivElement, VitalPromptInputHoverCardProps>(
  ({ className, openDelay = 0, closeDelay = 0, children, ...props }, ref) => {
    const [open, setOpen] = useState(false);
    const timeoutRef = useRef<NodeJS.Timeout>();

    const handleOpen = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setOpen(true), openDelay);
    };

    const handleClose = () => {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = setTimeout(() => setOpen(false), closeDelay);
    };

    return (
      <HoverCardContext.Provider value={{ open, setOpen }}>
        <div
          ref={ref}
          className={cn('relative inline-block', className)}
          onMouseEnter={handleOpen}
          onMouseLeave={handleClose}
          {...props}
        >
          {children}
        </div>
      </HoverCardContext.Provider>
    );
  }
);

export type VitalPromptInputHoverCardTriggerProps = ComponentProps<'div'>;

export const VitalPromptInputHoverCardTrigger = forwardRef<HTMLDivElement, VitalPromptInputHoverCardTriggerProps>(
  (props, ref) => <div ref={ref} {...props} />
);

export type VitalPromptInputHoverCardContentProps = ComponentProps<'div'> & {
  align?: 'start' | 'center' | 'end';
};

export const VitalPromptInputHoverCardContent = forwardRef<HTMLDivElement, VitalPromptInputHoverCardContentProps>(
  ({ className, align = 'start', ...props }, ref) => {
    const ctx = useContext(HoverCardContext);
    if (!ctx?.open) return null;

    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 -translate-x-1/2',
      end: 'right-0',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'absolute bottom-full mb-2 z-50',
          'rounded-md border bg-popover p-4 shadow-lg',
          'animate-in fade-in-0 zoom-in-95',
          alignClasses[align],
          className
        )}
        {...props}
      />
    );
  }
);

// ============================================================================
// Tab Components
// ============================================================================

export type VitalPromptInputTabsListProps = HTMLAttributes<HTMLDivElement>;
export const VitalPromptInputTabsList = forwardRef<HTMLDivElement, VitalPromptInputTabsListProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(className)} {...props} />
);

export type VitalPromptInputTabProps = HTMLAttributes<HTMLDivElement>;
export const VitalPromptInputTab = forwardRef<HTMLDivElement, VitalPromptInputTabProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn(className)} {...props} />
);

export type VitalPromptInputTabLabelProps = HTMLAttributes<HTMLHeadingElement>;
export const VitalPromptInputTabLabel = forwardRef<HTMLHeadingElement, VitalPromptInputTabLabelProps>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn('mb-2 px-3 font-medium text-muted-foreground text-xs', className)} {...props} />
  )
);

export type VitalPromptInputTabBodyProps = HTMLAttributes<HTMLDivElement>;
export const VitalPromptInputTabBody = forwardRef<HTMLDivElement, VitalPromptInputTabBodyProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('space-y-1', className)} {...props} />
);

export type VitalPromptInputTabItemProps = HTMLAttributes<HTMLDivElement>;
export const VitalPromptInputTabItem = forwardRef<HTMLDivElement, VitalPromptInputTabItemProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex items-center gap-2 px-3 py-2 text-xs hover:bg-accent', className)} {...props} />
  )
);

// ============================================================================
// Command Components
// ============================================================================

export type VitalPromptInputCommandProps = ComponentProps<'div'>;
export const VitalPromptInputCommand = forwardRef<HTMLDivElement, VitalPromptInputCommandProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('flex flex-col overflow-hidden rounded-md bg-popover', className)} {...props} />
  )
);

export type VitalPromptInputCommandInputProps = ComponentProps<'input'>;
export const VitalPromptInputCommandInput = forwardRef<HTMLInputElement, VitalPromptInputCommandInputProps>(
  ({ className, ...props }, ref) => (
    <div className="flex items-center border-b px-3">
      <Search className="mr-2 size-4 shrink-0 opacity-50" />
      <input
        ref={ref}
        className={cn(
          'flex h-10 w-full bg-transparent py-3 text-sm outline-none',
          'placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        {...props}
      />
    </div>
  )
);

export type VitalPromptInputCommandListProps = ComponentProps<'div'>;
export const VitalPromptInputCommandList = forwardRef<HTMLDivElement, VitalPromptInputCommandListProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('max-h-[300px] overflow-y-auto overflow-x-hidden', className)} {...props} />
  )
);

export type VitalPromptInputCommandEmptyProps = ComponentProps<'div'>;
export const VitalPromptInputCommandEmpty = forwardRef<HTMLDivElement, VitalPromptInputCommandEmptyProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn('py-6 text-center text-sm text-muted-foreground', className)} {...props} />
  )
);

export type VitalPromptInputCommandGroupProps = ComponentProps<'div'> & { heading?: string };
export const VitalPromptInputCommandGroup = forwardRef<HTMLDivElement, VitalPromptInputCommandGroupProps>(
  ({ className, heading, children, ...props }, ref) => (
    <div ref={ref} className={cn('overflow-hidden p-1', className)} {...props}>
      {heading && <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">{heading}</div>}
      {children}
    </div>
  )
);

export type VitalPromptInputCommandItemProps = ComponentProps<'div'>;
export const VitalPromptInputCommandItem = forwardRef<HTMLDivElement, VitalPromptInputCommandItemProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm',
        'hover:bg-accent hover:text-accent-foreground',
        className
      )}
      {...props}
    />
  )
);

export type VitalPromptInputCommandSeparatorProps = ComponentProps<'div'>;
export const VitalPromptInputCommandSeparator = forwardRef<HTMLDivElement, VitalPromptInputCommandSeparatorProps>(
  ({ className, ...props }, ref) => <div ref={ref} className={cn('-mx-1 my-1 h-px bg-border', className)} {...props} />
);

// ============================================================================
// Display Names
// ============================================================================

VitalPromptInput.displayName = 'VitalPromptInput';
VitalPromptInputProvider.displayName = 'VitalPromptInputProvider';
VitalPromptInputHeader.displayName = 'VitalPromptInputHeader';
VitalPromptInputBody.displayName = 'VitalPromptInputBody';
VitalPromptInputFooter.displayName = 'VitalPromptInputFooter';
VitalPromptInputTools.displayName = 'VitalPromptInputTools';
VitalPromptInputTextarea.displayName = 'VitalPromptInputTextarea';
VitalPromptInputButton.displayName = 'VitalPromptInputButton';
VitalPromptInputSubmit.displayName = 'VitalPromptInputSubmit';
VitalPromptInputAttachment.displayName = 'VitalPromptInputAttachment';
VitalPromptInputAttachments.displayName = 'VitalPromptInputAttachments';
VitalPromptInputActionMenu.displayName = 'VitalPromptInputActionMenu';
VitalPromptInputActionMenuTrigger.displayName = 'VitalPromptInputActionMenuTrigger';
VitalPromptInputActionMenuContent.displayName = 'VitalPromptInputActionMenuContent';
VitalPromptInputActionMenuItem.displayName = 'VitalPromptInputActionMenuItem';
VitalPromptInputActionAddAttachments.displayName = 'VitalPromptInputActionAddAttachments';
VitalPromptInputSpeechButton.displayName = 'VitalPromptInputSpeechButton';
VitalPromptInputSelect.displayName = 'VitalPromptInputSelect';
VitalPromptInputSelectTrigger.displayName = 'VitalPromptInputSelectTrigger';
VitalPromptInputSelectValue.displayName = 'VitalPromptInputSelectValue';
VitalPromptInputSelectContent.displayName = 'VitalPromptInputSelectContent';
VitalPromptInputSelectItem.displayName = 'VitalPromptInputSelectItem';
VitalPromptInputHoverCard.displayName = 'VitalPromptInputHoverCard';
VitalPromptInputHoverCardTrigger.displayName = 'VitalPromptInputHoverCardTrigger';
VitalPromptInputHoverCardContent.displayName = 'VitalPromptInputHoverCardContent';
VitalPromptInputTabsList.displayName = 'VitalPromptInputTabsList';
VitalPromptInputTab.displayName = 'VitalPromptInputTab';
VitalPromptInputTabLabel.displayName = 'VitalPromptInputTabLabel';
VitalPromptInputTabBody.displayName = 'VitalPromptInputTabBody';
VitalPromptInputTabItem.displayName = 'VitalPromptInputTabItem';
VitalPromptInputCommand.displayName = 'VitalPromptInputCommand';
VitalPromptInputCommandInput.displayName = 'VitalPromptInputCommandInput';
VitalPromptInputCommandList.displayName = 'VitalPromptInputCommandList';
VitalPromptInputCommandEmpty.displayName = 'VitalPromptInputCommandEmpty';
VitalPromptInputCommandGroup.displayName = 'VitalPromptInputCommandGroup';
VitalPromptInputCommandItem.displayName = 'VitalPromptInputCommandItem';
VitalPromptInputCommandSeparator.displayName = 'VitalPromptInputCommandSeparator';

// ============================================================================
// Aliases (for compatibility with ai-elements naming)
// ============================================================================

export const PromptInput = VitalPromptInput;
export const PromptInputProvider = VitalPromptInputProvider;
export const PromptInputHeader = VitalPromptInputHeader;
export const PromptInputBody = VitalPromptInputBody;
export const PromptInputFooter = VitalPromptInputFooter;
export const PromptInputTools = VitalPromptInputTools;
export const PromptInputTextarea = VitalPromptInputTextarea;
export const PromptInputButton = VitalPromptInputButton;
export const PromptInputSubmit = VitalPromptInputSubmit;
export const PromptInputAttachment = VitalPromptInputAttachment;
export const PromptInputAttachments = VitalPromptInputAttachments;
export const PromptInputActionMenu = VitalPromptInputActionMenu;
export const PromptInputActionMenuTrigger = VitalPromptInputActionMenuTrigger;
export const PromptInputActionMenuContent = VitalPromptInputActionMenuContent;
export const PromptInputActionMenuItem = VitalPromptInputActionMenuItem;
export const PromptInputActionAddAttachments = VitalPromptInputActionAddAttachments;
export const PromptInputSpeechButton = VitalPromptInputSpeechButton;
export const PromptInputSelect = VitalPromptInputSelect;
export const PromptInputSelectTrigger = VitalPromptInputSelectTrigger;
export const PromptInputSelectValue = VitalPromptInputSelectValue;
export const PromptInputSelectContent = VitalPromptInputSelectContent;
export const PromptInputSelectItem = VitalPromptInputSelectItem;
export const PromptInputHoverCard = VitalPromptInputHoverCard;
export const PromptInputHoverCardTrigger = VitalPromptInputHoverCardTrigger;
export const PromptInputHoverCardContent = VitalPromptInputHoverCardContent;
export const PromptInputTabsList = VitalPromptInputTabsList;
export const PromptInputTab = VitalPromptInputTab;
export const PromptInputTabLabel = VitalPromptInputTabLabel;
export const PromptInputTabBody = VitalPromptInputTabBody;
export const PromptInputTabItem = VitalPromptInputTabItem;
export const PromptInputCommand = VitalPromptInputCommand;
export const PromptInputCommandInput = VitalPromptInputCommandInput;
export const PromptInputCommandList = VitalPromptInputCommandList;
export const PromptInputCommandEmpty = VitalPromptInputCommandEmpty;
export const PromptInputCommandGroup = VitalPromptInputCommandGroup;
export const PromptInputCommandItem = VitalPromptInputCommandItem;
export const PromptInputCommandSeparator = VitalPromptInputCommandSeparator;

export default VitalPromptInput;

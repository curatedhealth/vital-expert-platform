'use client';

/**
 * VITAL Platform - ChatInput Component
 *
 * Message input field for chat conversations.
 * Supports text input, attachments, and voice input.
 *
 * Features:
 * - Auto-resizing textarea
 * - File attachment support
 * - Voice input (future)
 * - Send on Enter, new line on Shift+Enter
 * - Character/token count
 * - Disabled state during streaming
 *
 * Design System: VITAL Brand v6.0
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useRef, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Send,
  Paperclip,
  Mic,
  StopCircle,
  Loader2,
  X,
  FileText,
  Image as ImageIcon,
  AlertCircle,
} from 'lucide-react';

// =============================================================================
// TYPES
// =============================================================================

export interface Attachment {
  id: string;
  name: string;
  type: 'file' | 'image';
  size: number;
  file: File;
  preview?: string;
}

export interface ChatInputProps {
  /** Called when message is submitted */
  onSend: (message: string, attachments?: Attachment[]) => void;
  /** Called when user starts typing (for typing indicators) */
  onTyping?: () => void;
  /** Called when user stops typing */
  onStopTyping?: () => void;
  /** Called when stop generation is requested */
  onStop?: () => void;
  /** Placeholder text */
  placeholder?: string;
  /** Whether input is disabled */
  disabled?: boolean;
  /** Whether AI is currently streaming a response */
  isStreaming?: boolean;
  /** Maximum character count */
  maxLength?: number;
  /** Enable file attachments */
  enableAttachments?: boolean;
  /** Enable voice input */
  enableVoice?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MAX_ATTACHMENTS = 5;
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'text/plain',
  'text/markdown',
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
];

// =============================================================================
// COMPONENT
// =============================================================================

export function ChatInput({
  onSend,
  onTyping,
  onStopTyping,
  onStop,
  placeholder = 'Type your message...',
  disabled = false,
  isStreaming = false,
  maxLength = 4000,
  enableAttachments = true,
  enableVoice = false,
  className,
}: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const canSend = message.trim().length > 0 || attachments.length > 0;

  // =========================================================================
  // AUTO-RESIZE TEXTAREA
  // =========================================================================

  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  }, [message]);

  // =========================================================================
  // TYPING INDICATOR DEBOUNCE
  // =========================================================================

  const handleTypingStart = useCallback(() => {
    onTyping?.();

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      onStopTyping?.();
    }, 2000);
  }, [onTyping, onStopTyping]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    if (value.length <= maxLength) {
      setMessage(value);
      setError(null);
      handleTypingStart();
    }
  }, [maxLength, handleTypingStart]);

  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (canSend && !disabled && !isStreaming) {
        handleSend();
      }
    }
  }, [canSend, disabled, isStreaming]);

  const handleSend = useCallback(() => {
    if (!canSend || disabled || isStreaming) return;

    onSend(message.trim(), attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
    setError(null);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [canSend, disabled, isStreaming, message, attachments, onSend]);

  const handleStop = useCallback(() => {
    onStop?.();
  }, [onStop]);

  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newAttachments: Attachment[] = [];
    const errors: string[] = [];

    Array.from(files).forEach(file => {
      // Check file count
      if (attachments.length + newAttachments.length >= MAX_ATTACHMENTS) {
        errors.push(`Maximum ${MAX_ATTACHMENTS} files allowed`);
        return;
      }

      // Check file type
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        errors.push(`${file.name}: File type not supported`);
        return;
      }

      // Check file size
      if (file.size > MAX_FILE_SIZE) {
        errors.push(`${file.name}: File too large (max 10MB)`);
        return;
      }

      const isImage = file.type.startsWith('image/');
      const attachment: Attachment = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        type: isImage ? 'image' : 'file',
        size: file.size,
        file,
      };

      // Create preview for images
      if (isImage) {
        attachment.preview = URL.createObjectURL(file);
      }

      newAttachments.push(attachment);
    });

    if (errors.length > 0) {
      setError(errors[0]);
    }

    if (newAttachments.length > 0) {
      setAttachments(prev => [...prev, ...newAttachments]);
    }

    // Reset input
    e.target.value = '';
  }, [attachments.length]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments(prev => {
      const attachment = prev.find(a => a.id === id);
      if (attachment?.preview) {
        URL.revokeObjectURL(attachment.preview);
      }
      return prev.filter(a => a.id !== id);
    });
  }, []);

  const handleAttachClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // =========================================================================
  // CLEANUP
  // =========================================================================

  useEffect(() => {
    return () => {
      // Cleanup object URLs
      attachments.forEach(a => {
        if (a.preview) URL.revokeObjectURL(a.preview);
      });
      // Cleanup typing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn('relative', className)}>
      {/* Attachments preview */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 p-2 bg-slate-50 rounded-t-xl border border-b-0 border-slate-200">
              {attachments.map(attachment => (
                <AttachmentPreview
                  key={attachment.id}
                  attachment={attachment}
                  onRemove={handleRemoveAttachment}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="flex items-center gap-2 px-3 py-2 bg-red-50 text-red-600 text-sm rounded-t-xl border border-b-0 border-red-200" role="alert">
              <AlertCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{error}</span>
              <button
                onClick={() => setError(null)}
                className="ml-auto hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main input area */}
      <div className={cn(
        'flex items-end gap-2 p-3 bg-white border rounded-xl',
        'transition-all duration-200',
        attachments.length > 0 && 'rounded-t-none',
        error && attachments.length === 0 && 'rounded-t-none',
        isFocused && 'border-blue-400 ring-2 ring-blue-100',
        disabled && 'bg-slate-50 opacity-75'
      )}>
        {/* Attachment button */}
        {enableAttachments && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleAttachClick}
            disabled={disabled || attachments.length >= MAX_ATTACHMENTS}
            className="h-9 w-9 shrink-0 text-slate-500 hover:text-slate-700"
            aria-label="Attach file"
          >
            <Paperclip className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={ALLOWED_FILE_TYPES.join(',')}
          onChange={handleFileSelect}
          className="hidden"
          aria-hidden="true"
          tabIndex={-1}
        />

        {/* Text input */}
        <div className="flex-1 min-w-0">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            disabled={disabled}
            className={cn(
              'min-h-[40px] max-h-[200px] resize-none border-0 p-0',
              'focus-visible:ring-0 focus-visible:ring-offset-0',
              'placeholder:text-slate-400'
            )}
            rows={1}
          />

          {/* Character count */}
          {message.length > maxLength * 0.8 && (
            <div className={cn(
              'text-xs text-right mt-1',
              message.length >= maxLength ? 'text-red-500' : 'text-slate-400'
            )}>
              {message.length}/{maxLength}
            </div>
          )}
        </div>

        {/* Voice input button */}
        {enableVoice && (
          <Button
            variant="ghost"
            size="icon"
            disabled={disabled}
            className="h-9 w-9 shrink-0 text-slate-500 hover:text-slate-700"
            aria-label="Voice input"
          >
            <Mic className="h-5 w-5" aria-hidden="true" />
          </Button>
        )}

        {/* Send/Stop button */}
        {isStreaming ? (
          <Button
            variant="destructive"
            size="icon"
            onClick={handleStop}
            className="h-9 w-9 shrink-0"
            aria-label="Stop generation"
          >
            <StopCircle className="h-5 w-5" aria-hidden="true" />
          </Button>
        ) : (
          <Button
            variant="default"
            size="icon"
            onClick={handleSend}
            disabled={!canSend || disabled}
            className={cn(
              'h-9 w-9 shrink-0',
              canSend && !disabled
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-slate-200 text-slate-400'
            )}
            aria-label={disabled ? "Sending message" : "Send message"}
          >
            {disabled ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
              <Send className="h-5 w-5" aria-hidden="true" />
            )}
          </Button>
        )}
      </div>

      {/* Hint text */}
      <div className="flex items-center justify-between px-2 py-1 text-xs text-slate-400">
        <span>Press Enter to send, Shift+Enter for new line</span>
        {enableAttachments && (
          <span>Max {MAX_ATTACHMENTS} files, 10MB each</span>
        )}
      </div>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface AttachmentPreviewProps {
  attachment: Attachment;
  onRemove: (id: string) => void;
}

function AttachmentPreview({ attachment, onRemove }: AttachmentPreviewProps) {
  const isImage = attachment.type === 'image';

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className={cn(
        'relative group flex items-center gap-2 px-2 py-1.5 rounded-lg',
        'bg-white border border-slate-200'
      )}
    >
      {/* Preview */}
      {isImage && attachment.preview ? (
        <img
          src={attachment.preview}
          alt={attachment.name}
          className="w-8 h-8 rounded object-cover"
        />
      ) : (
        <div className="w-8 h-8 rounded bg-slate-100 flex items-center justify-center">
          <FileText className="h-4 w-4 text-slate-500" />
        </div>
      )}

      {/* Name */}
      <span className="text-sm text-slate-700 max-w-[100px] truncate">
        {attachment.name}
      </span>

      {/* Size */}
      <span className="text-xs text-slate-400">
        {formatFileSize(attachment.size)}
      </span>

      {/* Remove button */}
      <button
        onClick={() => onRemove(attachment.id)}
        className={cn(
          'p-0.5 rounded-full bg-slate-200 text-slate-500',
          'hover:bg-red-100 hover:text-red-600 transition-colors'
        )}
      >
        <X className="h-3 w-3" />
      </button>
    </motion.div>
  );
}

// =============================================================================
// HELPERS
// =============================================================================

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

export default ChatInput;

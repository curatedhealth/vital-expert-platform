'use client';

import { useState, useRef, KeyboardEvent, useCallback, ChangeEvent, DragEvent } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Paperclip,
  Send,
  Sparkles,
  Mic,
  Square,
  Loader2,
  X,
  FileText,
  Image as ImageIcon,
  File
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

interface VitalPromptInputProps {
  onSubmit: (message: string, attachments?: Attachment[]) => void;
  onEnhance?: (message: string) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
  maxLength?: number;
  showAttachments?: boolean;
  showEnhance?: boolean;
  showVoice?: boolean;
  className?: string;
}

/**
 * VitalPromptInput - Feature-rich multi-modal prompt input
 * 
 * Features:
 * - Auto-resizing textarea
 * - File attachments with drag-and-drop
 * - AI prompt enhancement
 * - Voice input (optional)
 * - Character counter
 * - Stop generation button
 */
export function VitalPromptInput({
  onSubmit,
  onEnhance,
  placeholder = "Ask your expert...",
  disabled = false,
  isLoading = false,
  onStop,
  maxLength = 10000,
  showAttachments = true,
  showEnhance = true,
  showVoice = false,
  className
}: VitalPromptInputProps) {
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Auto-resize textarea
  const handleTextChange = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const textarea = e.target;
    setMessage(textarea.value);
    
    // Reset height to auto to get the correct scrollHeight
    textarea.style.height = 'auto';
    // Set new height based on content
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  }, []);
  
  const handleSubmit = useCallback(() => {
    if (!message.trim() || disabled || isLoading) return;
    onSubmit(message, attachments.length > 0 ? attachments : undefined);
    setMessage('');
    setAttachments([]);
    
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, attachments, disabled, isLoading, onSubmit]);
  
  const handleKeyDown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);
  
  const handleEnhance = useCallback(async () => {
    if (!onEnhance || !message.trim() || isEnhancing) return;
    setIsEnhancing(true);
    try {
      const enhanced = await onEnhance(message);
      setMessage(enhanced);
    } finally {
      setIsEnhancing(false);
    }
  }, [onEnhance, message, isEnhancing]);
  
  const handleFileSelect = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    addFiles(files);
    if (e.target) e.target.value = '';
  }, []);
  
  const addFiles = useCallback((files: File[]) => {
    const newAttachments: Attachment[] = files.map(file => ({
      id: `${file.name}-${Date.now()}`,
      name: file.name,
      type: file.type,
      size: file.size,
      preview: file.type.startsWith('image/') ? URL.createObjectURL(file) : undefined
    }));
    setAttachments(prev => [...prev, ...newAttachments]);
  }, []);
  
  const removeAttachment = useCallback((id: string) => {
    setAttachments(prev => prev.filter(a => a.id !== id));
  }, []);
  
  // Drag and drop handlers
  const handleDragEnter = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);
  
  const handleDragLeave = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);
  
  const handleDragOver = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);
  
  const handleDrop = useCallback((e: DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      addFiles(files);
    }
  }, [addFiles]);
  
  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return ImageIcon;
    if (type.includes('pdf') || type.includes('document')) return FileText;
    return File;
  };
  
  return (
    <TooltipProvider>
      <div 
        className={cn("relative", className)}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        {/* Drag overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-primary/10 border-2 border-dashed border-primary rounded-lg z-10 flex items-center justify-center">
            <p className="text-sm text-primary font-medium">Drop files here</p>
          </div>
        )}
        
        {/* Attachments preview */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-2">
            {attachments.map((attachment) => {
              const Icon = getFileIcon(attachment.type);
              return (
                <div 
                  key={attachment.id}
                  className="flex items-center gap-2 bg-muted rounded px-2 py-1 text-sm"
                >
                  {attachment.preview ? (
                    <img 
                      src={attachment.preview} 
                      alt={attachment.name}
                      className="h-6 w-6 object-cover rounded"
                    />
                  ) : (
                    <Icon className="h-4 w-4 text-muted-foreground" />
                  )}
                  <span className="truncate max-w-[120px]">{attachment.name}</span>
                  <button
                    onClick={() => removeAttachment(attachment.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              );
            })}
          </div>
        )}
        
        {/* Input area */}
        <div className="flex items-end gap-2 bg-background border rounded-lg p-2">
          <Textarea
            ref={textareaRef}
            value={message}
            onChange={handleTextChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            maxLength={maxLength}
            className="min-h-[44px] max-h-[200px] resize-none border-0 focus-visible:ring-0 p-2"
            rows={1}
          />
          
          {/* Actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Attachment button */}
            {showAttachments && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled || isLoading}
                    className="h-9 w-9"
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
            )}
            
            {/* Enhance button */}
            {showEnhance && onEnhance && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleEnhance}
                    disabled={disabled || isLoading || !message.trim() || isEnhancing}
                    className="h-9 w-9"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Enhance prompt with AI</TooltipContent>
              </Tooltip>
            )}
            
            {/* Voice button */}
            {showVoice && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    disabled={disabled || isLoading}
                    className="h-9 w-9"
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Voice input</TooltipContent>
              </Tooltip>
            )}
            
            {/* Submit/Stop button */}
            {isLoading && onStop ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="destructive"
                    size="icon"
                    onClick={onStop}
                    className="h-9 w-9"
                  >
                    <Square className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Stop generation</TooltipContent>
              </Tooltip>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    size="icon"
                    onClick={handleSubmit}
                    disabled={disabled || !message.trim()}
                    className="h-9 w-9"
                  >
                    <Send className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Send message</TooltipContent>
              </Tooltip>
            )}
          </div>
        </div>
        
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          multiple
          onChange={handleFileSelect}
          accept="image/*,.pdf,.doc,.docx,.txt,.csv,.json"
        />
        
        {/* Character count */}
        {message.length > maxLength * 0.8 && (
          <div className={cn(
            "absolute bottom-3 right-28 text-xs",
            message.length > maxLength * 0.95 ? "text-destructive" : "text-muted-foreground"
          )}>
            {message.length}/{maxLength}
          </div>
        )}
      </div>
    </TooltipProvider>
  );
}

export default VitalPromptInput;

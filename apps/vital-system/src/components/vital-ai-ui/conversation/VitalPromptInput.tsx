'use client';

import { useState, useRef, KeyboardEvent, useCallback, ChangeEvent, DragEvent, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
  File,
  Bot,
  Zap,
  Settings2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider
} from '@/components/ui/tooltip';

// =============================================================================
// TYPES
// =============================================================================

interface Attachment {
  id: string;
  name: string;
  type: string;
  size: number;
  preview?: string;
}

/** Response length options with word count ranges */
export type ResponseLength = 'short' | 'medium' | 'long';

/** Model options available for selection */
export type ModelOption = 'gpt-4o' | 'gpt-4o-mini' | 'claude-3-5-sonnet' | 'claude-3-opus';

/** Derived mode from toggle states */
export type DerivedMode = 1 | 2 | 3 | 4;

/** Options passed to onSubmit for request customization */
export interface SubmitOptions {
  model: ModelOption;
  responseLength: ResponseLength;
  autonomous: boolean;
  automatic: boolean;
  derivedMode: DerivedMode;
  maxTokens: number;
}

interface VitalPromptInputProps {
  onSubmit: (message: string, attachments?: Attachment[], options?: SubmitOptions) => void;
  onEnhance?: (message: string) => Promise<string>;
  placeholder?: string;
  disabled?: boolean;
  isLoading?: boolean;
  onStop?: () => void;
  maxLength?: number;
  showAttachments?: boolean;
  showEnhance?: boolean;
  showVoice?: boolean;
  /** Show advanced controls (model, toggles, length) */
  showAdvancedControls?: boolean;
  /** Default model selection */
  defaultModel?: ModelOption;
  /** Default response length */
  defaultResponseLength?: ResponseLength;
  /** Default autonomous toggle state */
  defaultAutonomous?: boolean;
  /** Default automatic toggle state */
  defaultAutomatic?: boolean;
  /** Called when mode changes due to toggle changes */
  onModeChange?: (mode: DerivedMode) => void;
  /** Called when model changes */
  onModelChange?: (model: ModelOption) => void;
  className?: string;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const MODEL_OPTIONS: { value: ModelOption; label: string; description: string }[] = [
  { value: 'gpt-4o', label: 'GPT-4o', description: 'Most capable model' },
  { value: 'gpt-4o-mini', label: 'GPT-4o Mini', description: 'Fast and efficient' },
  { value: 'claude-3-5-sonnet', label: 'Claude 3.5 Sonnet', description: 'Balanced performance' },
  { value: 'claude-3-opus', label: 'Claude 3 Opus', description: 'Best reasoning' },
];

const RESPONSE_LENGTH_OPTIONS: { value: ResponseLength; label: string; words: string; maxTokens: number }[] = [
  { value: 'short', label: 'Short', words: '~250 words', maxTokens: 500 },
  { value: 'medium', label: 'Medium', words: '500-1000 words', maxTokens: 2000 },
  { value: 'long', label: 'Long', words: '2000-3000 words', maxTokens: 6000 },
];

/**
 * Derive the mode from toggle states
 * - Both ON → Mode 4 (Auto Autonomous)
 * - Automatic only ON → Mode 2 (Auto Interactive)
 * - Autonomous only ON → Mode 3 (Manual Autonomous)
 * - Neither ON → Mode 1 (Manual Interactive)
 */
function deriveMode(autonomous: boolean, automatic: boolean): DerivedMode {
  if (autonomous && automatic) return 4;
  if (automatic) return 2;
  if (autonomous) return 3;
  return 1;
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
 * - Model selection (GPT-4o, Claude, etc.)
 * - Autonomous/Automatic toggles for mode derivation
 * - Response length selector (short/medium/long)
 *
 * Mode Derivation Logic:
 * - Both toggles ON → Mode 4 (Auto Autonomous)
 * - Automatic only ON → Mode 2 (Auto Interactive)
 * - Autonomous only ON → Mode 3 (Manual Autonomous)
 * - Neither ON → Mode 1 (Manual Interactive)
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
  showAdvancedControls = true,
  defaultModel = 'gpt-4o',
  defaultResponseLength = 'medium',
  defaultAutonomous = false,
  defaultAutomatic = false,
  onModeChange,
  onModelChange,
  className
}: VitalPromptInputProps) {
  // Core input state
  const [message, setMessage] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Advanced controls state
  const [selectedModel, setSelectedModel] = useState<ModelOption>(defaultModel);
  const [responseLength, setResponseLength] = useState<ResponseLength>(defaultResponseLength);
  const [autonomous, setAutonomous] = useState(defaultAutonomous);
  const [automatic, setAutomatic] = useState(defaultAutomatic);
  const [showSettings, setShowSettings] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Derive the current mode from toggle states
  const derivedMode = deriveMode(autonomous, automatic);

  // Get current max tokens from response length
  const currentMaxTokens = RESPONSE_LENGTH_OPTIONS.find(o => o.value === responseLength)?.maxTokens || 2000;

  // Notify parent when mode changes
  useEffect(() => {
    onModeChange?.(derivedMode);
  }, [derivedMode, onModeChange]);

  // Notify parent when model changes
  useEffect(() => {
    onModelChange?.(selectedModel);
  }, [selectedModel, onModelChange]);
  
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

    // Build submit options with all advanced controls
    const options: SubmitOptions = {
      model: selectedModel,
      responseLength,
      autonomous,
      automatic,
      derivedMode,
      maxTokens: currentMaxTokens,
    };

    onSubmit(message, attachments.length > 0 ? attachments : undefined, options);
    setMessage('');
    setAttachments([]);

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [message, attachments, disabled, isLoading, onSubmit, selectedModel, responseLength, autonomous, automatic, derivedMode, currentMaxTokens]);
  
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
        
        {/* Advanced Controls Bar */}
        {showAdvancedControls && (
          <div className="mb-3">
            {/* Toggle to show/hide settings */}
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground mb-2 transition-colors"
            >
              <Settings2 className="h-3.5 w-3.5" />
              <span>Advanced Settings</span>
              {showSettings ? (
                <ChevronUp className="h-3 w-3" />
              ) : (
                <ChevronDown className="h-3 w-3" />
              )}
              {/* Mode indicator badge */}
              <span className={cn(
                "ml-2 px-1.5 py-0.5 rounded text-[10px] font-medium",
                derivedMode === 1 && "bg-blue-100 text-blue-700",
                derivedMode === 2 && "bg-purple-100 text-purple-700",
                derivedMode === 3 && "bg-amber-100 text-amber-700",
                derivedMode === 4 && "bg-emerald-100 text-emerald-700",
              )}>
                Mode {derivedMode}
              </span>
            </button>

            {/* Expanded settings panel */}
            {showSettings && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 p-3 bg-muted/50 rounded-lg border">
                {/* Model Selection */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    Model
                  </label>
                  <Select
                    value={selectedModel}
                    onValueChange={(value) => setSelectedModel(value as ModelOption)}
                    disabled={disabled || isLoading}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {MODEL_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-[10px] text-muted-foreground">{option.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Response Length */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground">
                    Response Length
                  </label>
                  <Select
                    value={responseLength}
                    onValueChange={(value) => setResponseLength(value as ResponseLength)}
                    disabled={disabled || isLoading}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RESPONSE_LENGTH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value} className="text-xs">
                          <div className="flex flex-col">
                            <span>{option.label}</span>
                            <span className="text-[10px] text-muted-foreground">{option.words}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Automatic Toggle (Auto agent selection) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Automatic
                  </label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={automatic}
                      onCheckedChange={setAutomatic}
                      disabled={disabled || isLoading}
                      className="scale-75 origin-left"
                    />
                    <span className="text-xs text-muted-foreground">
                      {automatic ? 'AI selects agent' : 'Manual selection'}
                    </span>
                  </div>
                </div>

                {/* Autonomous Toggle (Deep research) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
                    <Bot className="h-3 w-3" />
                    Autonomous
                  </label>
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={autonomous}
                      onCheckedChange={setAutonomous}
                      disabled={disabled || isLoading}
                      className="scale-75 origin-left"
                    />
                    <span className="text-xs text-muted-foreground">
                      {autonomous ? 'Deep research' : 'Interactive'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Compact mode indicator when settings are hidden */}
            {!showSettings && (
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Bot className="h-3 w-3" />
                  {MODEL_OPTIONS.find(m => m.value === selectedModel)?.label}
                </span>
                <span className="text-muted-foreground/50">•</span>
                <span>{RESPONSE_LENGTH_OPTIONS.find(r => r.value === responseLength)?.label}</span>
                {automatic && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span className="flex items-center gap-1">
                      <Zap className="h-3 w-3" />
                      Auto
                    </span>
                  </>
                )}
                {autonomous && (
                  <>
                    <span className="text-muted-foreground/50">•</span>
                    <span>Deep Research</span>
                  </>
                )}
              </div>
            )}
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

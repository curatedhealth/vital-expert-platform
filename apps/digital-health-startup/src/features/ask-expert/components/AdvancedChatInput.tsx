'use client';

/**
 * Advanced Chat Input Component
 *
 * Features:
 * - Auto-expanding textarea (1-6 lines)
 * - Integrated 2-mode toggles (collapsible)
 * - File upload support
 * - Voice input ready
 * - Send button with loading state
 * - Character counter
 * - Keyboard shortcuts (Enter, Shift+Enter, Cmd+K)
 * - Suggested prompts
 * - Context indicators
 */

import { useState, useRef, useEffect, KeyboardEvent } from 'react';
import {
  Send,
  Sparkles,
  Settings2,
  Mic,
  Paperclip,
  X,
  ChevronUp,
  ChevronDown,
  Zap,
  MessageSquare,
  Cpu
} from 'lucide-react';
import { Button } from '@vital/ui';
import { Textarea } from '@vital/ui';
import { Card } from '@vital/ui';
import { Switch } from '@vital/ui';
import { Label } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@vital/ui';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { AVAILABLE_MODELS, DEFAULT_MODEL, type ModelConfig } from '@/lib/config/available-models';

export interface AdvancedChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  isLoading?: boolean;
  disabled?: boolean;

  // Mode state (2 toggles)
  isAutonomous: boolean;
  isAutomatic: boolean;
  onAutonomousChange: (value: boolean) => void;
  onAutomaticChange: (value: boolean) => void;

  // Model selection
  selectedModel?: string;
  onModelChange?: (model: string) => void;

  // Optional features
  placeholder?: string;
  maxLength?: number;
  showCharCount?: boolean;
  suggestedPrompts?: string[];
  selectedAgentName?: string;
}

export function AdvancedChatInput({
  value,
  onChange,
  onSubmit,
  isLoading = false,
  disabled = false,
  isAutonomous,
  isAutomatic,
  onAutonomousChange,
  onAutomaticChange,
  selectedModel,
  onModelChange,
  placeholder,
  maxLength = 4000,
  showCharCount = true,
  suggestedPrompts = [],
  selectedAgentName,
}: AdvancedChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [showModeSettings, setShowModeSettings] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    textarea.style.height = 'auto';
    const newHeight = Math.min(textarea.scrollHeight, 144); // Max 6 lines (~24px per line)
    textarea.style.height = `${newHeight}px`;
  }, [value]);

  // Focus on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Cmd/Ctrl + K - Toggle mode settings
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      setShowModeSettings(!showModeSettings);
      return;
    }

    // Enter to send (without shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading && !disabled) {
        onSubmit();
      }
      return;
    }

    // Shift + Enter for new line (default behavior)
  };

  const handleSubmit = () => {
    if (value.trim() && !isLoading && !disabled) {
      onSubmit();
    }
  };

  const handleSuggestedPrompt = (prompt: string) => {
    onChange(prompt);
    textareaRef.current?.focus();
  };

  const handleFileAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setAttachedFiles([...attachedFiles, ...files]);
  };

  const removeFile = (index: number) => {
    setAttachedFiles(attachedFiles.filter((_, i) => i !== index));
  };

  const getModeName = () => {
    if (isAutonomous && isAutomatic) return 'Autonomous + Auto';
    if (isAutonomous && !isAutomatic) return 'Autonomous + Manual';
    if (!isAutonomous && isAutomatic) return 'Interactive + Auto';
    return 'Interactive + Manual';
  };

  const getModeIcon = () => {
    return isAutonomous ? Zap : MessageSquare;
  };

  const charCount = value.length;
  const isNearLimit = charCount > maxLength * 0.9;
  const isOverLimit = charCount > maxLength;

  const dynamicPlaceholder = placeholder ||
    (isAutonomous
      ? "Describe your goal and I'll work autonomously to achieve it..."
      : "Ask a question or start a conversation...");

  return (
    <div className="w-full border-t bg-white dark:bg-gray-950">
      {/* Mode Settings Panel - Collapsible */}
      <AnimatePresence>
        {showModeSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border-b overflow-hidden"
          >
            <div className="p-4 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Consultation Mode
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowModeSettings(false)}
                    className="h-6 w-6 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <div className="grid md:grid-cols-2 gap-3">
                  {/* Toggle 1: Interactive vs Autonomous */}
                  <Card className={cn(
                    "p-3 border-2 transition-colors",
                    isAutonomous ? "border-amber-400 bg-amber-50 dark:bg-amber-950/20" : "border-blue-400 bg-blue-50 dark:bg-blue-950/20"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Conversation Type</Label>
                      <Switch
                        checked={isAutonomous}
                        onCheckedChange={(checked) => {
                          console.log('🔄 Autonomous toggle clicked:', checked);
                          onAutonomousChange(checked);
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {isAutonomous ? (
                        <div>
                          <span className="font-medium text-amber-700 dark:text-amber-400">Autonomous:</span> I'll work independently to achieve your goal
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-blue-700 dark:text-blue-400">Interactive:</span> Back-and-forth conversation with guidance
                        </div>
                      )}
                    </div>
                  </Card>

                  {/* Toggle 2: Manual vs Automatic */}
                  <Card className={cn(
                    "p-3 border-2 transition-colors",
                    isAutomatic ? "border-purple-400 bg-purple-50 dark:bg-purple-950/20" : "border-green-400 bg-green-50 dark:bg-green-950/20"
                  )}>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-sm font-medium">Expert Selection</Label>
                      <Switch
                        checked={isAutomatic}
                        onCheckedChange={(checked) => {
                          console.log('🔄 Automatic toggle clicked:', checked);
                          onAutomaticChange(checked);
                        }}
                        disabled={disabled}
                      />
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {isAutomatic ? (
                        <div>
                          <span className="font-medium text-purple-700 dark:text-purple-400">Automatic:</span> AI selects best expert for your query
                        </div>
                      ) : (
                        <div>
                          <span className="font-medium text-green-700 dark:text-green-400">Manual:</span> You choose which expert to consult
                        </div>
                      )}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attached Files Display */}
      <AnimatePresence>
        {attachedFiles.length > 0 && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-b overflow-hidden"
          >
            <div className="p-3 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-4xl mx-auto flex flex-wrap gap-2">
                {attachedFiles.map((file, index) => (
                  <Badge key={index} variant="secondary" className="pl-2 pr-1 py-1">
                    <span className="text-xs mr-2">{file.name}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeFile(index)}
                      className="h-4 w-4 p-0 hover:bg-gray-300 dark:hover:bg-gray-700"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Input Area */}
      <div className="p-4">
        <div className="max-w-4xl mx-auto">
          {/* Context Bar */}
          <div className="flex items-center gap-2 mb-2 text-xs text-gray-500 dark:text-gray-400">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge variant="outline" className="cursor-help gap-1">
                    {getModeIcon() === Zap ? <Zap className="h-3 w-3" /> : <MessageSquare className="h-3 w-3" />}
                    {getModeName()}
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-xs">Press Cmd+K to change mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {selectedAgentName && !isAutomatic && (
              <Badge variant="secondary" className="gap-1">
                <Sparkles className="h-3 w-3" />
                {selectedAgentName}
              </Badge>
            )}

            {selectedModel && (
              <Badge variant="outline" className="gap-1">
                <Cpu className="h-3 w-3" />
                {AVAILABLE_MODELS.find(m => m.id === selectedModel)?.name || selectedModel}
              </Badge>
            )}
          </div>

          {/* Input Container */}
          <div className={cn(
            "relative rounded-2xl border-2 transition-all duration-200",
            isFocused ? "border-blue-500 shadow-lg shadow-blue-500/10" : "border-gray-200 dark:border-gray-800",
            isOverLimit && "border-red-500",
            "bg-white dark:bg-gray-900"
          )}>
            <Textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder={dynamicPlaceholder}
              disabled={disabled || isLoading}
              maxLength={maxLength}
              className={cn(
                "min-h-[56px] max-h-[144px] w-full resize-none border-0 bg-transparent px-4 py-4 pr-32",
                "text-base placeholder:text-gray-400 dark:placeholder:text-gray-600",
                "focus-visible:outline-none focus-visible:ring-0",
                "scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700"
              )}
            />

            {/* Action Buttons */}
            <div className="absolute right-2 bottom-2 flex items-center gap-1">
              {/* Model Selector */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <select
                      value={selectedModel || DEFAULT_MODEL}
                      onChange={(e) => onModelChange?.(e.target.value)}
                      disabled={disabled || isLoading}
                      className={cn(
                        "h-8 px-2 text-xs rounded-lg border transition-colors",
                        "border-gray-300 dark:border-gray-700",
                        "bg-white dark:bg-gray-900",
                        "hover:bg-gray-50 dark:hover:bg-gray-800",
                        "focus:outline-none focus:ring-2 focus:ring-blue-500",
                        "disabled:opacity-50 disabled:cursor-not-allowed"
                      )}
                    >
                      {AVAILABLE_MODELS.map(model => (
                        <option key={model.id} value={model.id}>
                          {model.icon} {model.name}
                        </option>
                      ))}
                    </select>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Select AI model</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Mode Settings Toggle */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setShowModeSettings(!showModeSettings)}
                      disabled={disabled || isLoading}
                      className={cn(
                        "h-8 w-8 p-0",
                        showModeSettings && "bg-gray-100 dark:bg-gray-800"
                      )}
                    >
                      <Settings2 className={cn(
                        "h-4 w-4 transition-transform",
                        showModeSettings && "rotate-90"
                      )} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Mode settings (Cmd+K)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* File Attach */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => document.getElementById('file-upload')?.click()}
                      disabled={disabled || isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Attach file</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <input
                id="file-upload"
                type="file"
                multiple
                onChange={handleFileAttach}
                className="hidden"
              />

              {/* Voice Input (placeholder) */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={true}
                      className="h-8 w-8 p-0 opacity-50"
                    >
                      <Mic className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="text-xs">Voice input (coming soon)</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              {/* Send Button */}
              <Button
                onClick={handleSubmit}
                disabled={!value.trim() || isLoading || disabled || isOverLimit}
                size="sm"
                className={cn(
                  "h-8 w-8 p-0 rounded-lg transition-all",
                  value.trim() && !isOverLimit && !isLoading
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-400"
                )}
              >
                {isLoading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles className="h-4 w-4" />
                  </motion.div>
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>

          {/* Footer Info */}
          <div className="flex items-center justify-between mt-2 px-1 text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-3">
              <span>
                Press <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">Enter</kbd> to send
              </span>
              <span className="hidden sm:inline">
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border">Shift</kbd> +
                <kbd className="px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-800 border ml-1">Enter</kbd> for new line
              </span>
            </div>

            {showCharCount && (
              <span className={cn(
                "font-mono",
                isNearLimit && "text-orange-500",
                isOverLimit && "text-red-500 font-semibold"
              )}>
                {charCount.toLocaleString()} / {maxLength.toLocaleString()}
              </span>
            )}
          </div>

          {/* Suggested Prompts */}
          {suggestedPrompts.length > 0 && !value && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-3 flex flex-wrap gap-2"
            >
              {suggestedPrompts.map((prompt, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className="text-xs h-7"
                >
                  {prompt}
                </Button>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

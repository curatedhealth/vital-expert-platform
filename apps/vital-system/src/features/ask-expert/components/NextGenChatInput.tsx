'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Send, Loader2, Mic, MicOff, Paperclip, X, Image as ImageIcon,
  FileText, Sparkles, Zap, AlertCircle, Check
} from 'lucide-react';
import { useState, useRef, useCallback, useEffect } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Progress } from '@vital/ui';
import { Textarea } from '@vital/ui';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface Attachment {
  id: string;
  name: string;
  size: number;
  type: string;
  url?: string;
}

interface Suggestion {
  id: string;
  text: string;
  type: 'completion' | 'followup' | 'related';
}

interface NextGenChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop?: () => void;
  isLoading?: boolean;
  disabled?: boolean;
  placeholder?: string;
  enableVoice?: boolean;
  enableAttachments?: boolean;
  enableSuggestions?: boolean;
  maxLength?: number;
  onAttachment?: (file: File) => Promise<void>;
  className?: string;
}

export function NextGenChatInput({
  value,
  onChange,
  onSend,
  onStop,
  isLoading = false,
  disabled = false,
  placeholder = 'Type your message...',
  enableVoice = true,
  enableAttachments = true,
  enableSuggestions = true,
  maxLength = 4000,
  onAttachment,
  className
}: NextGenChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [tokenEstimate, setTokenEstimate] = useState(0);
  const [uploadProgress, setUploadProgress] = useState(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Token estimation (rough approximation: 1 token ≈ 4 characters)
  useEffect(() => {
    const estimated = Math.ceil(value.length / 4);
    setTokenEstimate(estimated);
  }, [value]);

  // Smart suggestions (mock implementation)
  useEffect(() => {
    if (!enableSuggestions || value.length < 10) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    // Simulate AI-powered suggestions
    const mockSuggestions: Suggestion[] = [
      {
        id: '1',
        text: value + ' and provide specific examples',
        type: 'completion'
      },
      {
        id: '2',
        text: 'What are the regulatory implications?',
        type: 'followup'
      },
      {
        id: '3',
        text: 'Can you elaborate on the clinical aspects?',
        type: 'related'
      }
    ];

    setSuggestions(mockSuggestions.slice(0, 3));
    setShowSuggestions(true);
  }, [value, enableSuggestions]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (value.trim() && !isLoading) {
        onSend();
      }
    }
  }, [value, isLoading, onSend]);

  const handleVoiceToggle = useCallback(async () => {
    if (!enableVoice) return;

    if (isRecording) {
      setIsRecording(false);
      // Stop recording logic would go here
    } else {
      setIsRecording(true);
      // Start recording logic would go here
    }
  }, [isRecording, enableVoice]);

  const handleFileSelect = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || !onAttachment) return;

    const file = files[0];

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    try {
      setUploadProgress(0);

      // Simulate upload progress
      const interval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return prev;
          }
          return prev + 10;
        });
      }, 100);

      await onAttachment(file);

      clearInterval(interval);
      setUploadProgress(100);

      const newAttachment: Attachment = {
        id: Date.now().toString(),
        name: file.name,
        size: file.size,
        type: file.type,
      };

      setAttachments((prev) => [...prev, newAttachment]);

      // Reset after a short delay
      setTimeout(() => setUploadProgress(0), 500);
    } catch (error) {
      console.error('File upload error:', error);
      setUploadProgress(0);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [onAttachment]);

  const handleRemoveAttachment = useCallback((id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  }, []);

  const handleSuggestionClick = useCallback((suggestion: Suggestion) => {
    onChange(suggestion.text);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  }, [onChange]);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  const getTokenColor = () => {
    if (tokenEstimate < 500) return 'text-green-600';
    if (tokenEstimate < 1000) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className={cn("space-y-2", className)}>
      {/* Suggestions */}
      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex gap-2 flex-wrap"
          >
            {suggestions.map((suggestion) => (
              <Button
                key={suggestion.id}
                variant="outline"
                size="sm"
                onClick={() => handleSuggestionClick(suggestion)}
                className="text-xs h-auto py-2"
              >
                <Sparkles className="h-3 w-3 mr-1" />
                {suggestion.type === 'completion' && 'Complete: '}
                {suggestion.type === 'followup' && 'Ask: '}
                {suggestion.type === 'related' && 'Related: '}
                {suggestion.text.substring(0, 50)}
                {suggestion.text.length > 50 && '...'}
              </Button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Attachments */}
      <AnimatePresence>
        {attachments.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="flex gap-2 flex-wrap"
          >
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 bg-gray-100 rounded-lg px-3 py-2 text-sm"
              >
                {attachment.type.startsWith('image/') ? (
                  <ImageIcon className="h-4 w-4 text-blue-600" />
                ) : (
                  <FileText className="h-4 w-4 text-blue-600" />
                )}
                <span className="font-medium">{attachment.name}</span>
                <span className="text-xs text-gray-500">
                  ({formatFileSize(attachment.size)})
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRemoveAttachment(attachment.id)}
                  className="h-5 w-5 p-0 ml-1"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Upload Progress */}
      {uploadProgress > 0 && uploadProgress < 100 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
            <span className="text-sm text-blue-900">Uploading file...</span>
          </div>
          <Progress value={uploadProgress} className="h-1" />
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative bg-white border border-gray-300 rounded-lg shadow-sm focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-transparent">
        {/* Voice Recording Indicator */}
        <AnimatePresence>
          {isRecording && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-red-50 border-2 border-red-500 rounded-lg flex items-center justify-center z-10"
            >
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                  className="h-3 w-3 bg-red-500 rounded-full"
                />
                <span className="text-sm font-medium text-red-900">Recording...</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVoiceToggle}
                  className="ml-4"
                >
                  Stop Recording
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <Textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled || isRecording}
          maxLength={maxLength}
          className="min-h-[80px] max-h-[240px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        />

        {/* Toolbar */}
        <div className="flex items-center justify-between px-3 py-2 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-1">
            {/* Voice Input */}
            {enableVoice && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleVoiceToggle}
                      className={cn(
                        "h-8 w-8 p-0",
                        isRecording && "text-red-600"
                      )}
                    >
                      {isRecording ? (
                        <MicOff className="h-4 w-4" />
                      ) : (
                        <Mic className="h-4 w-4" />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Voice input</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            {/* File Attachment */}
            {enableAttachments && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="h-8 w-8 p-0"
                    >
                      <Paperclip className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Attach file (max 10MB)</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}

            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*,.pdf,.doc,.docx,.txt"
              onChange={handleFileSelect}
            />

            {/* Token Estimate */}
            <div className="flex items-center gap-2 ml-2 px-2">
              <Badge variant="outline" className="text-xs">
                <Zap className={cn("h-3 w-3 mr-1", getTokenColor())} />
                <span className={getTokenColor()}>
                  ~{tokenEstimate} tokens
                </span>
              </Badge>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Character Count */}
            <span className="text-xs text-gray-500">
              {value.length}/{maxLength}
            </span>

            {/* Send/Stop Button */}
            {isLoading && onStop ? (
              <Button
                onClick={onStop}
                size="sm"
                variant="destructive"
              >
                <X className="h-4 w-4 mr-2" />
                Stop
              </Button>
            ) : (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      onClick={onSend}
                      disabled={!value.trim() || disabled || isRecording}
                      size="sm"
                    >
                      {isLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <Send className="h-4 w-4 mr-2" />
                          Send
                        </>
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Press Enter to send, Shift+Enter for new line
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <AlertCircle className="h-3 w-3" />
          Press Enter to send, Shift+Enter for new line
        </span>
        {tokenEstimate > 1000 && (
          <span className="flex items-center gap-1 text-yellow-600">
            <AlertCircle className="h-3 w-3" />
            Long message may take more time to process
          </span>
        )}
      </div>
    </div>
  );
}

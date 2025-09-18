'use client';

import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AgentAvatar } from '@/components/ui/agent-avatar';
import { Agent } from '@/lib/stores/chat-store';
import {
  Send,
  Paperclip,
  Mic,
  MicOff,
  Square,
  Zap,
  FileText,
  Image,
  Code,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onKeyPress: (e: React.KeyboardEvent) => void;
  isLoading: boolean;
  selectedAgent: Agent | null;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onKeyPress,
  isLoading,
  selectedAgent,
}: ChatInputProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [value]);

  const handleVoiceToggle = () => {
    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

  const handleFileUpload = (type: string) => {
    // TODO: Implement file upload functionality
    console.log(`Uploading ${type} file`);
    setShowAttachments(false);
  };

  const attachmentOptions = [
    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      description: 'Upload PDF, DOCX, or TXT files',
      accept: '.pdf,.docx,.txt,.md',
    },
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      description: 'Upload charts, diagrams, or screenshots',
      accept: '.png,.jpg,.jpeg,.gif,.webp',
    },
    {
      id: 'code',
      label: 'Code',
      icon: Code,
      description: 'Share code snippets or technical specs',
      accept: '.js,.ts,.py,.json,.xml,.html',
    },
  ];

  const suggestedPrompts = [
    'Explain FDA 510(k) requirements',
    'Design a clinical study protocol',
    'Market access strategy for digital therapeutics',
    'Technical architecture review',
  ];

  return (
    <div className="relative">
      {/* Agent Info Bar */}
      {selectedAgent && (
        <div className="flex items-center gap-3 mb-3 p-3 bg-background-gray rounded-lg">
          <AgentAvatar
            avatar={selectedAgent.avatar}
            name={selectedAgent.name}
            size="md"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium text-deep-charcoal text-sm">
                {selectedAgent.name}
              </span>
              {selectedAgent.ragEnabled && (
                <Badge variant="outline" className="text-xs">
                  <Zap className="h-3 w-3 mr-1" />
                  RAG Enabled
                </Badge>
              )}
            </div>
            <p className="text-xs text-medical-gray">
              {selectedAgent.description}
            </p>
          </div>
        </div>
      )}

      {/* Suggested Prompts (when input is empty) */}
      {!value && !isLoading && (
        <div className="mb-4">
          <p className="text-sm text-medical-gray mb-2">Try asking:</p>
          <div className="flex flex-wrap gap-2">
            {suggestedPrompts.map((prompt, index) => (
              <Button
                key={index}
                variant="outline"
                size="sm"
                className="h-auto py-2 px-3 text-xs hover:bg-progress-teal/5 hover:border-progress-teal/30"
                onClick={() => onChange(prompt)}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main Input Area */}
      <div className="relative bg-white border border-gray-200 rounded-lg shadow-sm">
        {/* Attachment Options */}
        {showAttachments && (
          <div className="absolute bottom-full left-0 right-0 mb-2 p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
            <h4 className="text-sm font-medium text-deep-charcoal mb-3">
              Attach files to enhance your query
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {attachmentOptions.map((option) => (
                <Button
                  key={option.id}
                  variant="outline"
                  className="h-auto p-3 flex flex-col items-start gap-2 hover:bg-background-gray"
                  onClick={() => handleFileUpload(option.id)}
                >
                  <div className="flex items-center gap-2">
                    <option.icon className="h-4 w-4" />
                    <span className="font-medium text-sm">{option.label}</span>
                  </div>
                  <p className="text-xs text-medical-gray text-left">
                    {option.description}
                  </p>
                </Button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2 p-3">
          {/* Attachment Button */}
          <Button
            variant="ghost"
            size="icon"
            className="flex-shrink-0 h-8 w-8"
            onClick={() => setShowAttachments(!showAttachments)}
          >
            <Paperclip className="h-4 w-4" />
          </Button>

          {/* Text Input */}
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyPress={onKeyPress}
              placeholder={
                selectedAgent
                  ? `Ask ${selectedAgent.name} anything...`
                  : 'Type your message...'
              }
              className="w-full resize-none border-none outline-none bg-transparent text-deep-charcoal placeholder-medical-gray min-h-[20px] max-h-32"
              rows={1}
              disabled={isLoading}
            />
          </div>

          {/* Voice Input Button */}
          <Button
            variant="ghost"
            size="icon"
            className={cn(
              'flex-shrink-0 h-8 w-8',
              isRecording && 'bg-clinical-red/10 text-clinical-red'
            )}
            onClick={handleVoiceToggle}
          >
            {isRecording ? (
              <MicOff className="h-4 w-4" />
            ) : (
              <Mic className="h-4 w-4" />
            )}
          </Button>

          {/* Send/Stop Button */}
          <Button
            size="icon"
            className={cn(
              'flex-shrink-0 h-8 w-8',
              value.trim() || isLoading
                ? 'bg-progress-teal hover:bg-progress-teal/90'
                : 'bg-medical-gray/20 hover:bg-medical-gray/30'
            )}
            onClick={isLoading ? undefined : onSend}
            disabled={!value.trim() && !isLoading}
          >
            {isLoading ? (
              <Square className="h-4 w-4" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Input Footer */}
        <div className="flex items-center justify-between px-3 pb-2 text-xs text-medical-gray">
          <div className="flex items-center gap-3">
            <span>Press Enter to send, Shift+Enter for new line</span>
            {selectedAgent?.ragEnabled && (
              <Badge variant="outline" className="text-xs">
                Knowledge Base Active
              </Badge>
            )}
          </div>
          <span>{value.length}/4000</span>
        </div>
      </div>

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="absolute top-full left-0 right-0 mt-2 p-3 bg-clinical-red/10 border border-clinical-red/20 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-clinical-red rounded-full animate-pulse" />
            <span className="text-sm text-clinical-red font-medium">
              Recording... Tap to stop
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
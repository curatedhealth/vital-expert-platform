/**
 * VITAL AI Chat Interface - World Class Implementation
 * Complete chat interface with all advanced features
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  Send,
  Mic,
  MicOff,
  Paperclip,
  Settings,
  Sparkles,
  Bot,
  FileText
} from 'lucide-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';

import { useRealtimeCollaboration } from '@/hooks/useRealtimeCollaboration';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/shared/components/ui/select';
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';

// Import our custom components
import type {
  Message as MessageType,
  Agent,
  ChatSettings,
  AgentType,
  Citation,
  Source,
  Artifact,
  ExportFormat
} from '@/types/chat.types';

import { artifactService } from '../../services/artifact-service';

import { ArtifactManager } from './artifacts/ArtifactManager';
import { RealtimeCollaboration } from './collaboration/RealtimeCollaboration';
import Message from './message/Message';

interface VitalChatInterfaceProps {
  className?: string;
  onMessageSend?: (message: string, agents: AgentType[]) => void;
  onSettingsChange?: (settings: Partial<ChatSettings>) => void;
  initialMessages?: MessageType[];
  availableAgents?: Agent[];
  maxHeight?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
}

// Chat modes configuration

  {
    id: 'clinical',
    name: 'Clinical Advisory',
    description: 'Multi-specialty clinical consultation',
    icon: '🏥',
    agents: ['digital-therapeutics-expert', 'clinical-trial-designer', 'medical-safety-officer']
  },
  {
    id: 'regulatory',
    name: 'Regulatory Guidance',
    description: 'FDA, EMA compliance and submission strategy',
    icon: '🏛️',
    agents: ['fda-regulatory-strategist', 'ema-compliance-specialist']
  },
  {
    id: 'research',
    name: 'Research & Evidence',
    description: 'Literature analysis and evidence synthesis',
    icon: '🔬',
    agents: ['clinical-data-scientist', 'biomedical-informatics-specialist']
  },
  {
    id: 'innovation',
    name: 'Digital Health Innovation',
    description: 'DTx, AI/ML, and mHealth expertise',
    icon: '🚀',
    agents: ['mhealth-innovation-architect', 'ai-ml-clinical-specialist']
  }
];

// Sample agents data
const SAMPLE_AGENTS: Agent[] = [
  {
    id: 'fda-regulatory-strategist',
    name: 'FDA Regulatory Strategist',
    type: 'fda-regulatory-strategist',
    description: 'Expert in FDA regulations, submission pathways, and compliance strategy',
    specialty: 'FDA Regulatory Affairs',
    icon: '🏛️',
    availability: 'online',
    responseTime: 1500,
    confidence: 0.95,
    expertise: ['510(k)', 'De Novo', 'PMA', 'QSR', '21 CFR Part 820']
  },
  {
    id: 'digital-therapeutics-expert',
    name: 'Digital Therapeutics Expert',
    type: 'digital-therapeutics-expert',
    description: 'Specialist in DTx development, evidence generation, and market access',
    specialty: 'Digital Therapeutics',
    icon: '💊',
    availability: 'online',
    responseTime: 1800,
    confidence: 0.92,
    expertise: ['DTx Clinical Trials', 'Real-World Evidence', 'Reimbursement Strategy']
  },
  {
    id: 'clinical-trial-designer',
    name: 'Clinical Trial Designer',
    type: 'clinical-trial-designer',
    description: 'Expert in clinical study design, endpoints, and statistical analysis',
    specialty: 'Clinical Research',
    icon: '🔬',
    availability: 'online',
    responseTime: 2000,
    confidence: 0.89,
    expertise: ['Study Design', 'Biostatistics', 'Clinical Endpoints', 'ICH-GCP']
  }
];

// Mock function to generate sample messages

  id: string,
  role: MessageType['role'],
  content: string,
  agent?: Agent,
  citations?: Citation[],
  sources?: Source[]
): MessageType => ({
  id,
  role,
  content,
  branches: [{
    id: `${id}-branch-1`,
    content,
    confidence: 0.92,
    citations: citations || [],
    sources: sources || [],
    artifacts: [],
    createdAt: new Date()
  }],
  currentBranch: 0,
  status: 'completed',
  agent,
  timestamp: new Date(),
  citations: citations || [],
  sources: sources || [],
  artifacts: [],
  isCollaborative: false
});

const VitalChatInterface: React.FC<VitalChatInterfaceProps> = ({
  className,
  onMessageSend,
  onSettingsChange,
  initialMessages = [],
  availableAgents = SAMPLE_AGENTS,
  maxHeight = '600px',
  enableVoice = true,
  enableFileUpload = true
}) => {
  // State management
  const [messages, setMessages] = useState<MessageType[]>(() => {
    if (initialMessages.length > 0) return initialMessages;

    // Generate welcome message with sample data
    return [generateSampleMessage(
      'welcome-1',
      'assistant',
      `Welcome to **VITAL Path AI**! 👋

I'm your comprehensive healthcare AI assistant, backed by 15+ specialized experts including:
- **FDA Regulatory Strategists** for submission pathways
- **Digital Therapeutics Experts** for DTx development
- **Clinical Trial Designers** for study protocols
- **AI/ML Clinical Specialists** for algorithm validation

**Quick Examples:**
- "What's the FDA pathway for my AI diagnostic tool?"
- "Help me design a clinical trial for my digital therapeutic"
- "Generate a 510(k) submission checklist"

How can I help you navigate the complex world of digital health today?`,
      SAMPLE_AGENTS[0],
      [
        {
          id: 'cite-1',
          number: 1,
          title: 'FDA Guidance on Software as a Medical Device (SaMD)',
          authors: ['FDA Center for Devices and Radiological Health'],
          journal: 'FDA.gov',
          year: 2023,
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation',
          evidenceLevel: 'A',
          relevanceScore: 0.95
        }
      ],
      [
        {
          id: 'source-1',
          title: 'FDA Software as Medical Device Guidance',
          type: 'fda-guidance',
          url: 'https://www.fda.gov/regulatory-information/search-fda-guidance-documents/software-medical-device-samd-clinical-evaluation',
          reliability: 0.98,
          organization: 'FDA',
          lastUpdated: new Date('2023-09-01')
        }
      ]
    )];
  });

  const [inputValue, setInputValue] = useState('');
  const [selectedMode, setSelectedMode] = useState('clinical');
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [selectedAgents, setSelectedAgents] = useState<AgentType[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);

  // Refs

  // Real-time collaboration

    conversationId: 'default-conversation', // In production, use dynamic conversation ID
    userId: 'current-user', // In production, use authenticated user ID
    enableTypingIndicators: true,
    typingTimeout: 3000
  });

  // Auto-scroll to bottom

    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle message submission

    if (!inputValue.trim() || isLoading) return;

    setInputValue('');

    // Add user message

      `user-${Date.now()}`,
      'user',
      messageContent
    );

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    // Call parent handler
    onMessageSend?.(messageContent, selectedAgents);

    // Simulate AI response (in real implementation, this would come from WebSocket)
    setTimeout(() => {

        `assistant-${Date.now()}`,
        'assistant',
        `Thank you for your ${selectedMode} question! I've analyzed your query using our specialized agents.

**Key Recommendations:**

1. **Regulatory Pathway**: Based on your description, I recommend considering the FDA's Software as Medical Device (SaMD) framework
2. **Clinical Evidence**: You'll likely need clinical validation studies demonstrating safety and efficacy
3. **Quality Management**: Implement ISO 13485 compliant quality system
4. **Risk Management**: Conduct ISO 14971 risk analysis

**Next Steps:**
- Detailed pathway analysis
- Clinical study design consultation
- Regulatory submission timeline

Would you like me to dive deeper into any of these areas? I can also generate specific documents like checklists or protocols. [1]`,
        availableAgents.find(a => a.type === 'fda-regulatory-strategist'),
        [
          {
            id: 'cite-2',
            number: 1,
            title: 'Digital Health Software Precertification Program',
            authors: ['FDA Digital Health Team'],
            journal: 'FDA.gov',
            year: 2023,
            evidenceLevel: 'A',
            relevanceScore: 0.88
          }
        ],
        [
          {
            id: 'source-2',
            title: 'FDA Digital Health Software Precertification',
            type: 'fda-guidance',
            url: 'https://www.fda.gov/medical-devices/digital-health-center-excellence/digital-health-software-precertification-pre-cert-program',
            reliability: 0.96,
            organization: 'FDA'
          }
        ]
      );

      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 2000);
  }, [inputValue, isLoading, selectedMode, selectedAgents, onMessageSend, availableAgents]);

  // Handle input changes with typing indicators

    setInputValue(value);

    // Trigger typing indicator when user starts typing
    if (value.length > 0 && value !== inputValue) {
      collaboration.startTyping();
    } else if (value.length === 0) {
      collaboration.stopTyping();
    }
  }, [inputValue, collaboration]);

  // Handle keyboard shortcuts

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  }, [handleSendMessage]);

  // Voice recognition (mock implementation)

    if (isListening) {
      setIsListening(false);
      // Stop voice recognition
    } else {
      setIsListening(true);
      // Start voice recognition
      setTimeout(() => {
        setIsListening(false);
        setInputValue(prev => prev + " What's the FDA approval process for digital therapeutics?");
      }, 3000);
    }
  }, [isListening]);

  // File upload handler

    fileInputRef.current?.click();
  }, []);

    if (files && files.length > 0) {
      // Handle file upload
      // }
  }, []);

  // Artifact handlers

    setIsGeneratingArtifact(true);
    setGenerationProgress(0);

    try {
      // Mock progress simulation

        setGenerationProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Simulate artifact generation based on type

        studyTitle: `Study generated from: ${prompt}`,
        protocolNumber: `VITAL-${Date.now()}`,
        studyPhase: 'Phase II',
        indication: 'Digital Therapeutics',
        studyDesign: 'Randomized Controlled Trial',
        primaryObjectives: 'Evaluate efficacy and safety',
        secondaryObjectives: 'Assess patient-reported outcomes',
        inclusionCriteria: 'Adult patients aged 18-65',
        exclusionCriteria: 'Severe comorbidities',
        studyProcedures: 'Digital intervention delivery',
        safetyConsiderations: 'Monitor adverse events',
        statisticalPlan: 'Intent-to-treat analysis',
        regulatoryConsiderations: 'FDA guidance compliance'
      };

        type as unknown,
        mockVariables,
        `Generated ${type.replace('-', ' ')} from Chat`,
        `Automatically generated based on: ${prompt.substring(0, 100)}...`
      );

      setGenerationProgress(100);
      setTimeout(() => {
        setArtifacts(prev => [artifact, ...prev]);
        setIsGeneratingArtifact(false);
        setGenerationProgress(0);
      }, 500);

    } catch (error) {
      // console.error('Error generating artifact:', error);
      setIsGeneratingArtifact(false);
      setGenerationProgress(0);
    }
  }, []);

    try {

        .toLowerCase()
        .replace(/[^a-z0-9]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');

      artifactService.downloadBlob(blob, filename);
    } catch (error) {
      // console.error('Error exporting artifact:', error);
    }
  }, []);

    try {

      // } catch (error) {
      // console.error('Error sharing artifact:', error);
    }
  }, []);

  return (
    <TooltipProvider>
      <div className={cn('flex flex-col h-full', className)} style={{ maxHeight }}>
        {/* Header */}
        <div className="flex-shrink-0 p-4 border-b bg-background">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-600" />
                <h2 className="font-semibold text-lg">VITAL Path AI</h2>
              </div>

              <RealtimeCollaboration
                conversationId="default-conversation"
                currentUserId="current-user"
                showCompactView={true}
                className="flex items-center"
              />
            </div>

            <Button variant="ghost" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* Mode Selector */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">
              Consultation Mode
            </label>
            <Select value={selectedMode} onValueChange={setSelectedMode}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CHAT_MODES.map(mode => (
                  <SelectItem key={mode.id} value={mode.id}>
                    <div className="flex items-center gap-3">
                      <span className="text-base">{mode.icon}</span>
                      <div>
                        <div className="font-medium">{mode.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {mode.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            <AnimatePresence initial={false}>
              {messages.map((message, index) => (
                <Message
                  key={message.id}
                  message={message}
                  isLast={index === messages.length - 1}
                  onBranchChange={(branchIndex) => {
                    setMessages(prev => prev.map(msg =>
                      msg.id === message.id
                        ? { ...msg, currentBranch: branchIndex }
                        : msg
                    ));
                  }}
                  onRegenerateResponse={(messageId) => {
                    // // Handle regeneration
                  }}
                  onCopy={(content) => {
                    navigator.clipboard.writeText(content);
                  }}
                  onShare={(message) => {
                    // }}
                  onFeedback={(messageId, feedback) => {
                    // }}
                  onEditMessage={(messageId, newContent) => {
                    // }}
                />
              ))}
            </AnimatePresence>

            {/* Loading indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 p-4"
              >
                <div className="flex space-x-1">
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 bg-blue-500 rounded-full animate-bounce" />
                </div>
                <span className="text-sm text-muted-foreground">
                  AI experts are analyzing your query...
                </span>
              </motion.div>
            )}

            {/* Typing Indicators */}
            {collaboration.typingUsersNames.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex items-center gap-2 p-3 bg-muted/30 rounded-lg"
              >
                <motion.div
                  className="flex gap-1"
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  <div className="w-2 h-2 bg-blue-500 rounded-full" />
                </motion.div>
                <span className="text-sm text-muted-foreground">
                  {collaboration.typingUsersNames.join(', ')} {collaboration.typingUsersNames.length === 1 ? 'is' : 'are'} typing...
                </span>
              </motion.div>
            )}

            {/* Artifacts Section */}
            {(artifacts.length > 0 || isGeneratingArtifact) && (
              <div className="mt-6">
                <ArtifactManager
                  artifacts={artifacts}
                  onExport={handleArtifactExport}
                  onShare={handleArtifactShare}
                  isGenerating={isGeneratingArtifact}
                  generationProgress={generationProgress}
                />
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="flex-shrink-0 p-4 border-t bg-background">
          <div className="space-y-3">
            {/* Input field */}
            <div className="relative">
              <Textarea
                ref={textareaRef}
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleKeyDown}
                placeholder={`Ask about ${CHAT_MODES.find(m => m.id === selectedMode)?.name.toLowerCase()} questions...`}
                className="min-h-[60px] max-h-[120px] pr-24 resize-none"
                disabled={isLoading}
              />

              <div className="absolute right-2 bottom-2 flex items-center gap-1">
                {/* File upload */}
                {enableFileUpload && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleFileUpload}
                        className="h-8 w-8 p-0"
                      >
                        <Paperclip className="h-4 w-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Attach file</TooltipContent>
                  </Tooltip>
                )}

                {/* Voice input */}
                {enableVoice && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={toggleVoiceRecognition}
                        className={cn(
                          "h-8 w-8 p-0",
                          isListening && "bg-red-100 text-red-600"
                        )}
                      >
                        {isListening ? (
                          <MicOff className="h-4 w-4" />
                        ) : (
                          <Mic className="h-4 w-4" />
                        )}
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      {isListening ? 'Stop recording' : 'Start voice input'}
                    </TooltipContent>
                  </Tooltip>
                )}

                {/* Send button */}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      size="sm"
                      onClick={handleSendMessage}
                      disabled={!inputValue.trim() || isLoading}
                      className="h-8 w-8 p-0"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Send message (Enter)</TooltipContent>
                </Tooltip>
              </div>
            </div>

            {/* Status bar */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <div className="flex items-center gap-4">
                <span>
                  Mode: <strong>{CHAT_MODES.find(m => m.id === selectedMode)?.name}</strong>
                </span>
                {isListening && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 animate-pulse">
                    <Mic className="h-3 w-3 mr-1" />
                    Listening...
                  </Badge>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleGenerateArtifact('clinical-protocol', inputValue || 'Generate clinical protocol')}
                      disabled={isGeneratingArtifact}
                      className="h-6 text-xs"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      Generate Document
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    Generate clinical documents from conversation
                  </TooltipContent>
                </Tooltip>

                <div className="flex items-center gap-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Powered by VITAL Path AI</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={handleFileChange}
          accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt"
        />
      </div>
    </TooltipProvider>
  );
};

export default VitalChatInterface;
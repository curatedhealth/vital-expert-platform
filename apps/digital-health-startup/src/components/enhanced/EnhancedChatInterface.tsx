/**
 * Enhanced Chat Interface
 *
 * Production-ready chat interface with accessibility, real-time updates,
 * voice support, and advanced agent visualization using shadcn/ui.
 */

import {
  Send,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Paperclip,
  Bot,
  CheckCircle,
  AlertTriangle,
  Star,
  Copy,
  Download,
  Loader2
} from 'lucide-react';
import React, { useState, useEffect, useRef, useCallback } from 'react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Avatar, AvatarFallback } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { Progress } from '@/shared/components/ui/progress';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';

// Interfaces
interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  agents?: AgentInfo[];
  confidence?: number;
  evidenceLevel?: string;
  processing?: boolean;
  validated?: boolean;
  timestamp: Date;
  citations?: string[];
  metadata?: Record<string, unknown>;
  starred?: boolean;
}

interface AgentInfo {
  id: string;
  name: string;
  specialty: string;
  confidence: number;
  status: 'thinking' | 'responding' | 'completed' | 'error';
  responseTime?: number;
}

interface EnhancedChatInterfaceProps {
  conversationId?: string;
  userId?: string;
  onNewConversation?: () => void;
  onMessageSent?: (message: Message) => void;
  onAgentUpdate?: (agents: AgentInfo[]) => void;
  websocketUrl?: string;
  enableVoice?: boolean;
  enableFileUpload?: boolean;
  maxMessages?: number;
}

// Type declarations for Web APIs
declare global {
  interface Window {
    webkitSpeechRecognition: unknown;
  }
}

// Custom hooks
const useSpeechRecognition = () => {
  const recognitionRef = useRef<any>(null);
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');

  const startListening = useCallback(() => {
    if (!('webkitSpeechRecognition' in window)) {
      alert('Speech recognition not supported in this browser');
      return;
    }

    const recognition = new (window as any).webkitSpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onstart = () => setIsListening(true);
    recognition.onend = () => setIsListening(false);
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setTranscript(transcript);
    };
    recognition.onerror = () => {
      setIsListening(false);
      setTranscript('');
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  }, []);

  return { isListening, transcript, startListening, stopListening };
};

const useSpeechSynthesis = () => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const speak = useCallback((text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      speechSynthesis.speak(utterance);
    }
  }, []);

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      speechSynthesis.cancel();
      setIsSpeaking(false);
    }
  }, []);

  return { isSpeaking, speak, stopSpeaking };
};

export const EnhancedChatInterface: React.FC<EnhancedChatInterfaceProps> = ({
  conversationId = `conv_${Date.now()}`,
  userId = 'user',
  onNewConversation,
  onMessageSent,
  onAgentUpdate,
  websocketUrl = `ws://localhost:8000/ws/chat/${conversationId}`,
  enableVoice = true,
  enableFileUpload = true,
  maxMessages = 100
}) => {
  // State
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [connectedAgents, setConnectedAgents] = useState<AgentInfo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected');

  // Refs

  // Hooks
  const { isListening, transcript, startListening, stopListening } = useSpeechRecognition();
  const { isSpeaking, speak, stopSpeaking } = useSpeechSynthesis();

  // WebSocket connection
  useEffect(() => {

      setConnectionStatus('connecting');

      ws.onopen = () => {
        setConnectionStatus('connected');
        // };

      ws.onclose = () => {
        setConnectionStatus('disconnected');
        // setTimeout(connect, 3000);
      };

      ws.onmessage = (event) => {
        try {

          handleWebSocketMessage(data);
        } catch (error) {
          // console.error('Failed to parse WebSocket message:', error);
        }
      };

      ws.onerror = (error) => {
        // console.error('WebSocket error:', error);
        setError('Connection error. Attempting to reconnect...');
      };

      wsRef.current = ws;
    };

    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [websocketUrl]);

  // Handle WebSocket messages
  const handleWebSocketMessage = useCallback((data: any) => {
    switch (data.type) {
      case 'agent_update':
        const updatedAgents: AgentInfo[] = data.agents || [];
        setConnectedAgents(updatedAgents);
        onAgentUpdate?.(updatedAgents);

        setMessages(prev => prev.map(msg =>
          msg.id === data.messageId
            ? { ...msg, agents: updatedAgents, processing: true }
            : msg
        ));
        break;

      case 'consensus_result':
        setMessages(prev => prev.map(msg =>
          msg.id === data.messageId
            ? {
                ...msg,
                content: data.content,
                confidence: data.confidence,
                evidenceLevel: data.evidenceLevel,
                citations: data.citations,
                validated: data.validated,
                processing: false,
                metadata: data.metadata
              }
            : msg
        ));
        setIsProcessing(false);

        if (enableVoice && data.content) {
          speak(data.content.substring(0, 200));
        }
        break;

      case 'error':
        setError(data.message);
        setIsProcessing(false);
        break;
    }
  }, [onAgentUpdate, enableVoice, speak]);

  // Auto-scroll to bottom
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // Handle voice input
  useEffect(() => {
    if (transcript && !isListening) {
      setInput(prev => prev + (prev ? ' ' : '') + transcript);
    }
  }, [transcript, isListening]);

  // Message submission

    e?.preventDefault();

    if (!input.trim() || isProcessing) return;

    const userMessage: Message = {
      id: `msg_${Date.now()}`,
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev.slice(-maxMessages + 1), userMessage]);
    onMessageSent?.(userMessage);
    setInput('');
    setIsProcessing(true);

    // Send via WebSocket
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'query',
        messageId: `msg_${Date.now() + 1}`,
        conversationId,
        userId,
        content: input,
        context: {
          urgency: 'normal',
          requiresClinicalValidation: /treatment|medication|clinical|patient/.test(input),
          timestamp: new Date().toISOString()
        }
      }));
    } else {
      setError('Not connected to server. Please wait...');
      setIsProcessing(false);
    }

    // Add placeholder for assistant response
    const assistantMessage: Message = {
      id: `msg_${Date.now() + 1}`,
      role: 'assistant',
      content: '',
      processing: true,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, assistantMessage]);
  }, [input, isProcessing, maxMessages, conversationId, userId, onMessageSent]);

  // Message actions

    navigator.clipboard.writeText(message.content);
  }, []);

    setMessages(prev => prev.map(msg =>
      msg.id === messageId ? { ...msg, starred: !msg.starred } : msg
    ));
  }, []);

      conversationId,
      messages: messages.map(({ id, role, content, timestamp, confidence, evidenceLevel }) => ({
        id, role, content, timestamp, confidence, evidenceLevel
      })),
      exportedAt: new Date().toISOString()
    };

    a.href = url;
    a.download = `vital-conversation-${conversationId}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [conversationId, messages]);

  // Render message component

    return (
      <div
        key={message.id}
        className={cn(
          "flex w-full mb-4",
          isUser ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "max-w-[85%] flex gap-3",
            isUser && "flex-row-reverse"
          )}
        >
          {/* Avatar */}
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback>
              {isUser ? "U" : <Bot className="h-4 w-4" />}
            </AvatarFallback>
          </Avatar>

          {/* Message content */}
          <Card
            className={cn(
              "relative",
              isUser
                ? "bg-primary text-primary-foreground"
                : message.processing
                  ? "border-dashed border-primary bg-muted/50"
                  : "bg-card",
              message.processing && "animate-pulse"
            )}
          >
            <CardContent className="p-4">
              {message.processing ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-sm text-muted-foreground">
                      Processing your request...
                    </span>
                  </div>

                  {message.agents && message.agents.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {message.agents.map(agent => (
                        <Badge
                          key={agent.id}
                          variant={agent.status === 'completed' ? 'default' : 'outline'}
                          className="text-xs"
                        >
                          <Bot className="h-3 w-3 mr-1" />
                          {agent.name}
                        </Badge>
                      ))}
                    </div>
                  )}

                  <Progress value={33} className="h-1" />
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Message content */}
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm leading-relaxed flex-1">
                      {message.content}
                    </p>

                    {!isUser && (
                      <div className="flex gap-1 shrink-0">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleCopyMessage(message)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>Copy message</TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                onClick={() => handleStarMessage(message.id)}
                              >
                                <Star className={cn(
                                  "h-3 w-3",
                                  message.starred && "fill-current"
                                )} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              {message.starred ? "Unstar" : "Star message"}
                            </TooltipContent>
                          </Tooltip>

                          {enableVoice && (
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-6 w-6 p-0"
                                  onClick={() => isSpeaking ? stopSpeaking() : speak(message.content)}
                                >
                                  {isSpeaking ? (
                                    <VolumeX className="h-3 w-3" />
                                  ) : (
                                    <Volume2 className="h-3 w-3" />
                                  )}
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>
                                {isSpeaking ? "Stop speaking" : "Read aloud"}
                              </TooltipContent>
                            </Tooltip>
                          )}
                        </TooltipProvider>
                      </div>
                    )}
                  </div>

                  {/* Metadata badges */}
                  {!isUser && (
                    <div className="flex flex-wrap gap-2 items-center">
                      {message.confidence && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Badge
                                variant={
                                  message.confidence > 0.8
                                    ? "default"
                                    : message.confidence > 0.6
                                      ? "secondary"
                                      : "destructive"
                                }
                                className="text-xs"
                              >
                                {(message.confidence * 100).toFixed(0)}%
                              </Badge>
                            </TooltipTrigger>
                            <TooltipContent>
                              Confidence: {(message.confidence * 100).toFixed(0)}%
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {message.evidenceLevel && (
                        <Badge variant="outline" className="text-xs">
                          Level {message.evidenceLevel}
                        </Badge>
                      )}

                      {message.validated && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            </TooltipTrigger>
                            <TooltipContent>Clinically Validated</TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}

                      {message.citations && message.citations.length > 0 && (
                        <Badge variant="outline" className="text-xs">
                          {message.citations.length} citations
                        </Badge>
                      )}
                    </div>
                  )}

                  {/* Timestamp */}
                  <div
                    className={cn(
                      "text-xs text-muted-foreground",
                      isUser ? "text-right" : "text-left"
                    )}
                  >
                    {message.timestamp.toLocaleTimeString()}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }, [handleCopyMessage, handleStarMessage, enableVoice, isSpeaking, speak, stopSpeaking]);

  return (
    <TooltipProvider>
      <div className="flex flex-col h-screen bg-background">
        {/* Header */}
        <div className="border-b bg-card/50 p-4 flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-lg font-semibold">VITAL AI Assistant</h1>
            <div className="flex items-center gap-2">
              <Badge
                variant={connectionStatus === 'connected' ? 'default' : 'destructive'}
                className="text-xs"
              >
                {connectionStatus}
              </Badge>
              {connectedAgents.length > 0 && (
                <Badge variant="secondary" className="text-xs">
                  <Bot className="h-3 w-3 mr-1" />
                  {connectedAgents.length} agents
                </Badge>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleExportConversation}
                  disabled={messages.length === 0}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Export conversation</TooltipContent>
            </Tooltip>

            <Button
              variant="outline"
              size="sm"
              onClick={onNewConversation}
            >
              New Chat
            </Button>
          </div>
        </div>

        {/* Messages area */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map(renderMessage)}
            <div ref={messagesEndRef} />
          </div>
        </ScrollArea>

        {/* Input area */}
        <div className="border-t bg-card/50 p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about digital health, regulatory pathways, clinical trials..."
              disabled={isProcessing || connectionStatus !== 'connected'}
              className="flex-1"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit();
                }
              }}
            />

            {enableVoice && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant={isListening ? "destructive" : "outline"}
                    size="icon"
                    onClick={isListening ? stopListening : startListening}
                    disabled={isProcessing}
                  >
                    {isListening ? (
                      <MicOff className="h-4 w-4" />
                    ) : (
                      <Mic className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isListening ? "Stop recording" : "Voice input"}
                </TooltipContent>
              </Tooltip>
            )}

            {enableFileUpload && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    disabled={isProcessing}
                  >
                    <Paperclip className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Attach file</TooltipContent>
              </Tooltip>
            )}

            <Button
              type="submit"
              disabled={isProcessing || !input.trim() || connectionStatus !== 'connected'}
            >
              {isProcessing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>

        {/* Voice recording indicator */}
        {isListening && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <Card className="p-6">
              <CardContent className="flex flex-col items-center gap-4 p-0">
                <div className="relative">
                  <div className="absolute inset-0 bg-red-500 rounded-full animate-ping" />
                  <div className="relative bg-red-500 rounded-full p-4">
                    <Mic className="h-6 w-6 text-white" />
                  </div>
                </div>
                <p className="text-sm text-muted-foreground">Listening...</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Error alert */}
        {error && (
          <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
            <Alert variant="destructive" className="max-w-md">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto"
                onClick={() => setError(null)}
              >
                ×
              </Button>
            </Alert>
          </div>
        )}
      </div>
    </TooltipProvider>
  );
};

export default EnhancedChatInterface;
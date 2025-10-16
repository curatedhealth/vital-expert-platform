import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AutomaticModeInterface } from './automatic-mode-interface';
import { useAutomaticMode } from '@/hooks/use-automatic-mode';
import { Brain, MessageSquare, Settings, Zap } from 'lucide-react';

interface ChatWithAutomaticModeProps {
  onAgentSelected?: (agent: any) => void;
  onMessageSent?: (message: string) => void;
}

export function ChatWithAutomaticMode({ 
  onAgentSelected, 
  onMessageSent 
}: ChatWithAutomaticModeProps) {
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState<'automatic' | 'manual'>('automatic');
  
  const { 
    isProcessing, 
    orchestrationResult, 
    error, 
    processQuery, 
    confirmAgent, 
    selectAlternativeAgent, 
    clearResult 
  } = useAutomaticMode();

  const handleSendMessage = async () => {
    if (!message.trim()) return;

    if (mode === 'automatic') {
      // Process with automatic agent selection
      await processQuery(message);
    } else {
      // Manual mode - just send the message
      onMessageSent?.(message);
      setMessage('');
    }
  };

  const handleConfirmAgent = async () => {
    if (orchestrationResult) {
      const selectedAgent = await confirmAgent(orchestrationResult.selectedAgent);
      onAgentSelected?.(selectedAgent);
      onMessageSent?.(message);
      setMessage('');
    }
  };

  const handleSelectAlternative = async (agent: any) => {
    const selectedAgent = await selectAlternativeAgent(agent);
    onAgentSelected?.(selectedAgent);
    onMessageSent?.(message);
    setMessage('');
  };

  const handleSwitchToManual = () => {
    setMode('manual');
    clearResult();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      {/* Mode Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Chat Mode Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={mode} onValueChange={(value) => setMode(value as 'automatic' | 'manual')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="automatic" className="flex items-center gap-2">
                <Zap className="h-4 w-4" />
                Automatic Agent Selection
              </TabsTrigger>
              <TabsTrigger value="manual" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Manual Agent Selection
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="automatic" className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Let AI automatically select the best expert for your query
                </p>
                <div className="flex gap-2">
                  <Badge variant="secondary">Intelligent Routing</Badge>
                  <Badge variant="secondary">Confidence Scoring</Badge>
                  <Badge variant="secondary">Performance Learning</Badge>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="manual" className="mt-4">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  Choose your preferred expert manually
                </p>
                <div className="flex gap-2">
                  <Badge variant="outline">User Control</Badge>
                  <Badge variant="outline">Direct Selection</Badge>
                  <Badge variant="outline">Custom Choice</Badge>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Message Input */}
      <Card>
        <CardContent className="p-4">
          <div className="flex gap-2">
            <Input
              placeholder={
                mode === 'automatic' 
                  ? "Ask any healthcare or regulatory question..." 
                  : "Type your message..."
              }
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleSendMessage();
                }
              }}
              disabled={isProcessing}
              className="flex-1"
            />
            <Button 
              onClick={handleSendMessage}
              disabled={!message.trim() || isProcessing}
              className="px-6"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Automatic Mode Interface */}
      {mode === 'automatic' && (
        <AutomaticModeInterface
          orchestrationResult={orchestrationResult}
          isProcessing={isProcessing}
          onConfirmAgent={handleConfirmAgent}
          onSelectAlternative={handleSelectAlternative}
          onSwitchToManual={handleSwitchToManual}
        />
      )}

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Processing Indicator */}
      {isProcessing && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 text-blue-800">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              Analyzing your query and finding the best expert...
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

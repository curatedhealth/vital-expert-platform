'use client';

import React, { useState } from 'react';
import { Send, Loader2, AlertCircle, RefreshCw, Bot, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useChatStore } from '@/lib/stores/chat-store';
import { useChatSync } from '@/hooks/use-chat-sync';
import { useAutonomousMode } from '@/hooks/use-autonomous-mode';
import { MessageBubble } from './message-bubble';
import { ReasoningDisplay } from './reasoning-display';
import { AgentSelectionPanel } from './agent-selection-panel';
import { ChatInput } from './chat-input';
import { AgentPromptStarters } from './agent-prompt-starters';
import { AutonomousModeToggle } from './autonomous-mode-toggle';
import { AutonomousTaskProgress } from './autonomous-task-progress';
import { StateDebugger } from '@/components/debug/state-debugger';

export function EnhancedChatContainerWithAutonomous({ className }: { className?: string }) {
  // Use the sync hook to ensure state consistency
  useChatSync();
  
  const {
    messages,
    input,
    setInput,
    sendMessage,
    isLoading,
    error,
    clearError,
    selectedAgent,
    selectedAgents,
    activeAgentId,
    selectedModel,
    setSelectedModel,
    currentChat,
    getCurrentChatModes,
    updateChatMode,
    getAgents,
    selectAgent,
    cleanup,
    isHydrated,
    reasoningEvents,
    isReasoningActive,
  } = useChatStore();

  // Autonomous mode state
  const {
    isAutonomousMode,
    isRunning,
    goal,
    tasks,
    currentTask,
    progress,
    metrics,
    evidence,
    settings,
    toggleAutonomousMode,
    startAutonomousExecution,
    pauseAutonomousExecution,
    stopAutonomousExecution,
    updateSettings
  } = useAutonomousMode();

  const [activeTab, setActiveTab] = useState<'chat' | 'autonomous'>('chat');
  const [autonomousGoal, setAutonomousGoal] = useState('');

  // Wait for hydration before accessing modes
  if (!isHydrated) {
    return (
      <div className="flex items-center justify-center h-64">
        <Skeleton className="h-8 w-32" />
      </div>
    );
  }

  const currentModes = getCurrentChatModes();
  const isManualMode = currentModes?.interactionMode === 'manual';

  const handleAutonomousStart = async () => {
    if (!autonomousGoal.trim()) return;
    
    try {
      await startAutonomousExecution(autonomousGoal);
      setActiveTab('autonomous'); // Switch to autonomous tab when starting
    } catch (error) {
      console.error('Failed to start autonomous execution:', error);
    }
  };

  const handleSendMessage = async () => {
    console.log('🚀 [handleSendMessage] Called with:', {
      input: input.trim(),
      isLoading,
      isAutonomousMode,
      isRunning,
      selectedAgent: selectedAgent?.name
    });

    if (!input.trim() || isLoading) {
      console.log('❌ [handleSendMessage] Blocked:', { 
        hasInput: !!input.trim(), 
        isLoading 
      });
      return;
    }

    const message = input.trim();
    setInput('');

    // If in autonomous mode, treat as goal
    if (isAutonomousMode && !isRunning) {
      console.log('🎯 [handleSendMessage] Setting autonomous goal:', message);
      setAutonomousGoal(message);
      return;
    }

    // Regular chat message
    console.log('💬 [handleSendMessage] Sending regular message:', message);
    try {
      await sendMessage(message);
      console.log('✅ [handleSendMessage] Message sent successfully');
    } catch (error) {
      console.error('❌ [handleSendMessage] Failed to send message:', error);
    }
  };

  return (
    <div className={cn("flex h-full", className)}>
      {/* Left Sidebar - Agent Selection */}
      <div className="w-80 border-r bg-background flex flex-col">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold">VITAL Expert</h2>
          <p className="text-sm text-muted-foreground">
            {isManualMode ? 'Manual Mode' : 'Automatic Mode'}
          </p>
        </div>
        
        <div className="flex-1 overflow-hidden">
          <AgentSelectionPanel 
            agents={getAgents()}
            selectedAgent={selectedAgent}
            onSelectAgent={selectAgent}
            isLoading={isLoading}
          />
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {selectedAgent && (
                <>
                  <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">{selectedAgent.display_name || selectedAgent.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedAgent.business_function || 'General'}
                    </p>
                  </div>
                </>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as any)}>
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="autonomous">Autonomous</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden">
          <Tabs value={activeTab} className="h-full">
            {/* Regular Chat Tab */}
            <TabsContent value="chat" className="h-full m-0">
              <div className="flex flex-col h-full">
                {/* Messages */}
                <ScrollArea className="flex-1 p-4">
                  <div className="space-y-4">
                    {(!messages || messages.length === 0) ? (
                      <div className="text-center py-8">
                        <Bot className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <h3 className="text-lg font-medium mb-2">Welcome to VITAL Expert</h3>
                        <p className="text-muted-foreground mb-4">
                          Select an agent and start a conversation, or try autonomous mode for complex tasks.
                        </p>
                        {selectedAgent && (
                          <AgentPromptStarters 
                            agent={selectedAgent} 
                            onPromptSelect={(prompt) => setInput(prompt)}
                          />
                        )}
                      </div>
                    ) : (
                      (messages || []).map((message) => (
                        <MessageBubble
                          key={message.id}
                          message={message}
                          isLast={message.id === (messages || [])[(messages || []).length - 1]?.id}
                        />
                      ))
                    )}
                    
                    {isLoading && (
                      <div className="flex items-center space-x-2 text-muted-foreground">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Thinking...</span>
                      </div>
                    )}
                  </div>
                </ScrollArea>

                {/* Reasoning Display */}
                {isReasoningActive && reasoningEvents.length > 0 && (
                  <div className="border-t p-4">
                    <ReasoningDisplay events={reasoningEvents} />
                  </div>
                )}

                {/* Error Display */}
                {error && (
                  <div className="border-t p-4">
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{error}</AlertDescription>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearError}
                        className="mt-2"
                      >
                        Dismiss
                      </Button>
                    </Alert>
                  </div>
                )}

                {/* Chat Input */}
                <div className="border-t p-4">
                  <ChatInput
                    value={input}
                    onChange={setInput}
                    onSubmit={handleSendMessage}
                    isLoading={isLoading}
                    interactionMode={isManualMode ? 'manual' : 'automatic'}
                    hasSelectedAgent={!!selectedAgent}
                    selectedAgent={selectedAgent}
                    selectedModel={selectedModel?.id || 'gpt-4o'}
                    onModelChange={(model) => setSelectedModel({ id: model, name: model })}
                    currentChat={currentChat}
                    onUpdateChatMode={updateChatMode}
                    disabled={isLoading}
                    className="border-t"
                    isCentered={false}
                  />
                </div>
              </div>
            </TabsContent>

            {/* Autonomous Mode Tab */}
            <TabsContent value="autonomous" className="h-full m-0">
              <div className="flex h-full">
                {/* Left Panel - Controls */}
                <div className="w-96 border-r p-4 space-y-4">
                  <AutonomousModeToggle
                    isAutonomousMode={isAutonomousMode}
                    onToggleAutonomousMode={toggleAutonomousMode}
                    isRunning={isRunning}
                    onStart={handleAutonomousStart}
                    onPause={pauseAutonomousExecution}
                    onStop={stopAutonomousExecution}
                    maxIterations={settings.maxIterations}
                    onMaxIterationsChange={(value) => updateSettings({ maxIterations: value[0] })}
                    maxCost={settings.maxCost}
                    onMaxCostChange={(value) => updateSettings({ maxCost: value[0] })}
                    supervisionLevel={settings.supervisionLevel}
                    onSupervisionLevelChange={(level) => updateSettings({ supervisionLevel: level })}
                  />

                  {/* Goal Input */}
                  {isAutonomousMode && !isRunning && (
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-base">Set Your Goal</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Textarea
                          placeholder="Describe what you want the AI to accomplish autonomously..."
                          value={autonomousGoal}
                          onChange={(e) => setAutonomousGoal(e.target.value)}
                          className="min-h-[100px]"
                        />
                        <Button
                          onClick={handleAutonomousStart}
                          disabled={!autonomousGoal.trim() || !selectedAgent}
                          className="w-full"
                        >
                          <Bot className="h-4 w-4 mr-2" />
                          Start Autonomous Task
                        </Button>
                      </CardContent>
                    </Card>
                  )}
                </div>

                {/* Right Panel - Progress */}
                <div className="flex-1 p-4">
                  <AutonomousTaskProgress
                    isVisible={isAutonomousMode}
                    goal={goal}
                    tasks={tasks}
                    currentTask={currentTask}
                    progress={progress}
                    metrics={metrics}
                    evidence={evidence}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Debug Panel (Development Only) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="w-80 border-l bg-muted/50">
          <StateDebugger />
        </div>
      )}
    </div>
  );
}

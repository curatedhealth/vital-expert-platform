'use client';

import { Loader2, Sparkles, Copy, Edit, Plus, RefreshCw } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui/components/alert';
import { Badge } from '@vital/ui/components/badge';
import { Button } from '@vital/ui/components/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@vital/ui/components/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui/components/tabs';
import { Textarea } from '@vital/ui/components/textarea';
import usePromptEnhancement from '@/hooks/usePromptEnhancement';
import { PromptStarter } from '@/lib/services/prompt-enhancement-service';

interface PromptEnhancementInterfaceProps {
  agentId?: string;
  onPromptEnhanced?: (enhancedPrompt: string, systemPrompt: string) => void;
  initialPrompt?: string;
  className?: string;
}

export function PromptEnhancementInterface({
  agentId,
  onPromptEnhanced,
  initialPrompt = '',
  className = ''
}: PromptEnhancementInterfaceProps) {
  const {
    prompts,
    agentPrompts,
    selectedPrompt,
    isLoading,
    error,
    loadPrompts,
    loadAgentPrompts,
    enhancePrompt,
    selectPrompt,
    clearSelection,
    createPrompt,
    updatePrompt,
    duplicatePrompt
  } = usePromptEnhancement();

  const [userPrompt, setUserPrompt] = useState(initialPrompt);
  const [enhancedResult, setEnhancedResult] = useState<{
    enhancedPrompt: string;
    systemPrompt: string;
    promptInfo: PromptStarter | null;
    variables: string[];
    suggestions: string[];
  } | null>(null);
  const [activeTab, setActiveTab] = useState('enhance');
  const [showAdminPanel, setShowAdminPanel] = useState(false);

  // Load agent prompts when agentId changes
  useEffect(() => {
    if (agentId) {
      loadAgentPrompts(agentId);
    }
  }, [agentId, loadAgentPrompts]);

  const handleEnhancePrompt = async () => {
    if (!userPrompt.trim()) return;

    const result = await enhancePrompt(userPrompt, agentId);
    setEnhancedResult(result);
    
    if (onPromptEnhanced) {
      onPromptEnhanced(result.enhancedPrompt, result.systemPrompt);
    }
  };

  const handleSelectPrompt = (prompt: PromptStarter) => {
    selectPrompt(prompt);
    setActiveTab('enhance');
  };

  const handleCopyPrompt = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDuplicatePrompt = async (prompt: PromptStarter) => {
    const newName = `${prompt.name}-copy-${Date.now()}`;
    await duplicatePrompt(prompt.id, newName);
  };

  const filteredPrompts = agentId ? agentPrompts.map(ap => ap.prompts) : prompts;

  return (
    <div className={`space-y-6 ${className}`}>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="enhance">Enhance Prompt</TabsTrigger>
          <TabsTrigger value="browse">Browse Prompts</TabsTrigger>
          <TabsTrigger value="admin">Admin Panel</TabsTrigger>
        </TabsList>

        <TabsContent value="enhance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                Prompt Enhancement
              </CardTitle>
              <CardDescription>
                Enhance your prompt using PRISM framework and AI-powered suggestions
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label htmlFor="user-prompt" className="text-sm font-medium">
                  Your Prompt
                </label>
                <Textarea
                  id="user-prompt"
                  placeholder="Enter your prompt here..."
                  value={userPrompt}
                  onChange={(e) => setUserPrompt(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex gap-2">
                <Button 
                  onClick={handleEnhancePrompt} 
                  disabled={isLoading || !userPrompt.trim()}
                  className="flex-1"
                >
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Sparkles className="h-4 w-4 mr-2" />
                  )}
                  Enhance Prompt
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setUserPrompt('')}
                  disabled={!userPrompt.trim()}
                >
                  Clear
                </Button>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {enhancedResult && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Enhanced Prompt</label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleCopyPrompt(enhancedResult.enhancedPrompt)}
                      >
                        <Copy className="h-4 w-4 mr-2" />
                        Copy
                      </Button>
                    </div>
                    <Textarea
                      value={enhancedResult.enhancedPrompt}
                      readOnly
                      className="min-h-[100px] bg-muted"
                    />
                  </div>

                  {enhancedResult.variables.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Variables to Fill</label>
                      <div className="flex flex-wrap gap-2">
                        {enhancedResult.variables.map((variable) => (
                          <Badge key={variable} variant="secondary">
                            {variable}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {enhancedResult.suggestions.length > 0 && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Suggestions</label>
                      <ul className="space-y-1">
                        {enhancedResult.suggestions.map((suggestion, index) => (
                          <li key={index} className="text-sm text-muted-foreground">
                            • {suggestion}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {enhancedResult.promptInfo && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Using Template</label>
                      <div className="p-3 bg-muted rounded-lg">
                        <div className="font-medium">{enhancedResult.promptInfo.display_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {enhancedResult.promptInfo.description}
                        </div>
                        <div className="flex gap-2 mt-2">
                          <Badge variant="outline">{enhancedResult.promptInfo.domain}</Badge>
                          <Badge variant="outline">{enhancedResult.promptInfo.complexity_level}</Badge>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Available Prompts</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={loadPrompts}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredPrompts.map((prompt) => (
              <Card key={prompt.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="text-base">{prompt.display_name}</CardTitle>
                      <CardDescription className="text-sm">
                        {prompt.description}
                      </CardDescription>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectPrompt(prompt)}
                    >
                      Use
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      <Badge variant="outline">{prompt.domain}</Badge>
                      <Badge variant="outline">{prompt.complexity_level}</Badge>
                    </div>
                    
                    {prompt.prompt_starter && (
                      <div className="text-sm text-muted-foreground">
                        {prompt.prompt_starter.substring(0, 100)}...
                      </div>
                    )}

                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDuplicatePrompt(prompt)}
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setShowAdminPanel(true)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredPrompts.length === 0 && !isLoading && (
            <div className="text-center py-8 text-muted-foreground">
              No prompts available. Try refreshing or check your connection.
            </div>
          )}
        </TabsContent>

        <TabsContent value="admin" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Prompt Management</CardTitle>
              <CardDescription>
                Create, edit, and manage PRISM prompts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Button onClick={() => setShowAdminPanel(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Prompt
                </Button>
                
                <div className="text-sm text-muted-foreground">
                  Admin panel functionality will be implemented here for creating, editing, and managing prompts.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default PromptEnhancementInterface;

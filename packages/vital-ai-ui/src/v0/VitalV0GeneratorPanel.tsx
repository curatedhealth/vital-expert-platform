'use client';

import { useState, useCallback, memo, useMemo } from 'react';
import { cn } from '../lib/utils';
import {
  Sparkles,
  Loader2,
  ExternalLink,
  RefreshCw,
  Check,
  Wand2,
  ChevronDown,
  AlertCircle,
  Plus,
  History,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { VitalV0TypeSelector, getV0TypeConfig } from './VitalV0TypeSelector';
import { VitalV0PromptInput } from './VitalV0PromptInput';
import { VitalV0PreviewFrame } from './VitalV0PreviewFrame';
import type { 
  V0GenerationType, 
  V0GenerationResponse, 
  V0GenerationHistoryEntry,
  VitalV0GeneratorPanelProps,
  V0PromptExample,
} from './types';

/**
 * Default examples by type (simplified for the panel)
 */
const DEFAULT_EXAMPLES: Record<V0GenerationType, V0PromptExample[]> = {
  'workflow-node': [
    { label: 'KOL Scorer', prompt: 'Create a KOL Influence Scorer node with H-index, publications, and network influence score', category: 'Medical Affairs' },
    { label: 'Compliance Gate', prompt: 'Create a Compliance Gateway node with checklist, approval status, and proceed/hold buttons', category: 'Regulatory' },
    { label: 'Document Gen', prompt: 'Create a Document Generator node with template selection, variables, and preview', category: 'General' },
  ],
  'agent-card': [
    { label: 'MA Specialist', prompt: 'Create a Medical Affairs Specialist agent card with expertise badges and engagement metrics', category: 'Medical Affairs' },
    { label: 'Regulatory Expert', prompt: 'Create a Regulatory Expert agent card with region badges and submission tracker', category: 'Regulatory' },
  ],
  'panel-ui': [
    { label: 'Risk Panel', prompt: 'Create a Risk Assessment Panel with 5x5 matrix, expert cards, and consensus indicator', category: 'Risk' },
    { label: 'Protocol Review', prompt: 'Create a Protocol Review Committee interface with section approval tracking', category: 'Clinical' },
  ],
  'visualization': [
    { label: 'KOL Network', prompt: 'Create a KOL Network Graph showing connections with influence-based node sizing', category: 'Medical Affairs' },
    { label: 'Trial Timeline', prompt: 'Create a Clinical Trial Timeline with phases, milestones, and enrollment progress', category: 'Clinical' },
  ],
  'dashboard': [
    { label: 'KOL Dashboard', prompt: 'Create a KOL Engagement Dashboard with network graph, timeline, and actions', category: 'Medical Affairs' },
  ],
  'form': [
    { label: 'KOL Profile', prompt: 'Create a KOL Profile Form with expertise areas and engagement preferences', category: 'Medical Affairs' },
  ],
  'table': [
    { label: 'KOL Directory', prompt: 'Create a KOL Directory Table with influence metrics and expandable rows', category: 'Medical Affairs' },
  ],
};

/**
 * VitalV0GeneratorPanel - Complete v0 Generation Interface
 * 
 * A comprehensive panel for generating UI components with v0:
 * - Type selection (workflow node, agent card, etc.)
 * - Natural language prompt input with examples
 * - Live preview of generated component
 * - Refinement capability
 * - Generation history
 * 
 * Designed for scalability and performance with:
 * - Memoized components to prevent unnecessary re-renders
 * - Lazy loading of preview iframe
 * - Optimistic UI updates
 * - Error boundaries
 * 
 * @example
 * ```tsx
 * <VitalV0GeneratorPanel
 *   defaultType="workflow-node"
 *   workflowContext={{
 *     name: 'KOL Engagement',
 *     domain: 'Medical Affairs',
 *     existingNodes: ['start', 'agent', 'condition']
 *   }}
 *   onGenerationComplete={(result) => {
 *     console.log('Generated:', result.previewUrl);
 *   }}
 * />
 * ```
 * 
 * @package @vital/ai-ui/v0
 */
export const VitalV0GeneratorPanel = memo(function VitalV0GeneratorPanel({
  defaultType = 'workflow-node',
  workflowContext,
  agentContext,
  panelContext,
  onGenerationComplete,
  onCodeExtracted,
  apiEndpoint = '/api/v0/generate',
  className,
}: VitalV0GeneratorPanelProps) {
  // State
  const [selectedType, setSelectedType] = useState<V0GenerationType>(defaultType);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<V0GenerationResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<V0GenerationHistoryEntry[]>([]);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Get examples for current type
  const examples = useMemo(
    () => DEFAULT_EXAMPLES[selectedType] || [],
    [selectedType]
  );

  // Build context for API call
  const buildContext = useCallback(() => ({
    workflow: workflowContext,
    agent: agentContext,
    panel: panelContext,
    chatId: result?.chatId, // For refinement
  }), [workflowContext, agentContext, panelContext, result]);

  // Handle generation
  const handleGenerate = useCallback(async () => {
    if (!prompt.trim() || isGenerating) return;

    setIsGenerating(true);
    setError(null);

    try {
      const response = await fetch(apiEndpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: selectedType,
          prompt: prompt.trim(),
          context: buildContext(),
        }),
      });

      const data: V0GenerationResponse = await response.json();

      if (data.success) {
        setResult(data);
        
        // Add to history
        const historyEntry: V0GenerationHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          chatId: data.chatId,
          prompt: prompt.trim(),
          type: selectedType,
          previewUrl: data.previewUrl,
          timestamp: data.timestamp,
          status: 'success',
          refinementCount: result?.chatId === data.chatId ? 
            (history.find(h => h.chatId === data.chatId)?.refinementCount || 0) + 1 : 0,
          applied: false,
        };
        setHistory(prev => [historyEntry, ...prev.slice(0, 19)]); // Keep last 20
        
        onGenerationComplete?.(data);
      } else {
        setError(data.error || 'Generation failed');
        
        // Add error to history
        const errorEntry: V0GenerationHistoryEntry = {
          id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
          chatId: '',
          prompt: prompt.trim(),
          type: selectedType,
          previewUrl: '',
          timestamp: new Date().toISOString(),
          status: 'error',
          refinementCount: 0,
          applied: false,
        };
        setHistory(prev => [errorEntry, ...prev.slice(0, 19)]);
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Network error';
      setError(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  }, [prompt, selectedType, isGenerating, buildContext, apiEndpoint, result, history, onGenerationComplete]);

  // Handle refinement
  const handleRefine = useCallback(async (refinementPrompt: string) => {
    if (!result?.chatId || !refinementPrompt.trim() || isGenerating) return;
    
    // Set the prompt to refinement and trigger generation
    setPrompt(refinementPrompt);
    // Generation will use existing chatId from context
    handleGenerate();
  }, [result, isGenerating, handleGenerate]);

  // Handle history item selection
  const handleHistorySelect = useCallback((entry: V0GenerationHistoryEntry) => {
    if (entry.status === 'success' && entry.previewUrl) {
      setResult({
        success: true,
        chatId: entry.chatId,
        previewUrl: entry.previewUrl,
        generationType: entry.type,
        timestamp: entry.timestamp,
      });
      setSelectedType(entry.type);
      setPrompt(entry.prompt);
    }
  }, []);

  // Get type config for display
  const typeConfig = getV0TypeConfig(selectedType);

  return (
    <Card className={cn('flex flex-col', className)}>
      <CardHeader className="pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-lg">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <CardTitle className="text-lg">AI Component Generator</CardTitle>
            <CardDescription className="truncate">
              Powered by v0 — Describe what you need
            </CardDescription>
          </div>
          {history.length > 0 && (
            <Badge variant="outline" className="gap-1">
              <History className="h-3 w-3" />
              {history.length}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col gap-4 overflow-hidden">
        {/* Type Selection */}
        <VitalV0TypeSelector
          selectedType={selectedType}
          onTypeChange={(type) => {
            setSelectedType(type);
            setResult(null); // Clear result when type changes
          }}
        />

        {/* Prompt Input */}
        <VitalV0PromptInput
          value={prompt}
          onChange={setPrompt}
          onSubmit={handleGenerate}
          generationType={selectedType}
          isGenerating={isGenerating}
          examples={examples}
        />

        {/* Generate Button (for mobile/accessibility) */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className={cn(
            'w-full sm:hidden',
            'bg-gradient-to-r from-violet-600 to-purple-600',
            'hover:from-violet-700 hover:to-purple-700'
          )}
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate with v0
            </>
          )}
        </Button>

        {/* Error Display */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Result Preview */}
        {result && (
          <div className="flex-1 flex flex-col gap-3 min-h-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="default" className="bg-green-600 gap-1">
                  <Check className="h-3 w-3" />
                  Generated
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {new Date(result.timestamp).toLocaleTimeString()}
                </span>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(result.previewUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
            </div>

            {/* Preview Frame */}
            <div className="flex-1 min-h-[300px]">
              <VitalV0PreviewFrame
                previewUrl={result.previewUrl}
                chatId={result.chatId}
                title={`${typeConfig?.label || 'Component'} Preview`}
                fullscreen={isFullscreen}
                onFullscreenChange={setIsFullscreen}
                className="h-full"
              />
            </div>

            {/* Refinement Input */}
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Refine: e.g., 'Make it more compact' or 'Add a progress indicator'"
                className={cn(
                  'flex-1 px-3 py-2 text-sm rounded-md border',
                  'focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500',
                  'bg-background'
                )}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && e.currentTarget.value.trim()) {
                    handleRefine(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <Button
                variant="outline"
                size="icon"
                onClick={() => {
                  const input = document.querySelector<HTMLInputElement>('[placeholder*="Refine"]');
                  if (input?.value) {
                    handleRefine(input.value);
                    input.value = '';
                  }
                }}
                disabled={isGenerating}
              >
                <RefreshCw className={cn('h-4 w-4', isGenerating && 'animate-spin')} />
              </Button>
            </div>
          </div>
        )}

        {/* History (Collapsible) */}
        {history.length > 0 && (
          <Collapsible open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <History className="h-4 w-4" />
                  Generation History ({history.length})
                </span>
                <ChevronDown className={cn(
                  'h-4 w-4 transition-transform',
                  isHistoryOpen && 'rotate-180'
                )} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="space-y-2 max-h-40 overflow-auto">
                {history.map((entry) => (
                  <button
                    key={entry.id}
                    onClick={() => handleHistorySelect(entry)}
                    className={cn(
                      'w-full text-left px-3 py-2 rounded-md text-sm',
                      'hover:bg-muted transition-colors',
                      'border border-transparent hover:border-border',
                      entry.status === 'error' && 'opacity-60'
                    )}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium truncate">
                        {entry.prompt.slice(0, 40)}...
                      </span>
                      <Badge variant={entry.status === 'success' ? 'secondary' : 'destructive'} className="text-[10px]">
                        {entry.status}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {entry.type} • {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </button>
                ))}
              </div>
            </CollapsibleContent>
          </Collapsible>
        )}
      </CardContent>
    </Card>
  );
});

export default VitalV0GeneratorPanel;




















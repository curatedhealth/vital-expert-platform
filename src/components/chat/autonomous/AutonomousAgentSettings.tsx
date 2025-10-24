'use client';

import { Settings, Brain, Database, Zap, RefreshCw, Info } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Label } from '@/shared/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/components/ui/select';
import { Slider } from '@/shared/components/ui/slider';
import { Switch } from '@/shared/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/components/ui/tooltip';
import type { AutonomousAgentOptions } from '@/types/autonomous-agent.types';

interface AutonomousAgentSettingsProps {
  options: AutonomousAgentOptions;
  onChange: (options: AutonomousAgentOptions) => void;
  onReset: () => void;
}

export function AutonomousAgentSettings({
  options,
  onChange,
  onReset,
}: AutonomousAgentSettingsProps) {
  const updateOption = <K extends keyof AutonomousAgentOptions>(
    key: K,
    value: AutonomousAgentOptions[K]
  ) => {
    onChange({ ...options, [key]: value });
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            <CardTitle>Autonomous Agent Settings</CardTitle>
          </div>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
        <CardDescription>
          Configure how the autonomous agent processes your requests
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Core Features */}
        <div className="space-y-4">
          <h3 className="text-sm font-medium">Core Features</h3>

          {/* Enable RAG */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="enableRAG">Knowledge Base Search</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Search curated knowledge base of FDA guidance, clinical
                      protocols, and regulations
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="enableRAG"
              checked={options.enableRAG}
              onCheckedChange={(checked) => updateOption('enableRAG', checked)}
            />
          </div>

          {/* Enable Learning */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Brain className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="enableLearning">Auto-Learning</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Automatically learn and remember your preferences,
                      projects, and goals across all conversations
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="enableLearning"
              checked={options.enableLearning}
              onCheckedChange={(checked) => updateOption('enableLearning', checked)}
            />
          </div>

          {/* Enable Streaming */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              <Label htmlFor="stream">Streaming Responses</Label>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <Info className="h-3 w-3 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">
                      Show real-time progress as the agent thinks and
                      researches
                    </p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <Switch
              id="stream"
              checked={options.stream}
              onCheckedChange={(checked) => updateOption('stream', checked)}
            />
          </div>
        </div>

        {/* Advanced Settings */}
        {options.enableRAG && (
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Advanced Settings</h3>

            {/* Retrieval Strategy */}
            <div className="space-y-2">
              <Label htmlFor="retrievalStrategy">Retrieval Strategy</Label>
              <Select
                value={options.retrievalStrategy}
                onValueChange={(value: any) =>
                  updateOption('retrievalStrategy', value)
                }
              >
                <SelectTrigger id="retrievalStrategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="multi_query">
                    Multi-Query (generates multiple search queries)
                  </SelectItem>
                  <SelectItem value="compression">
                    Compression (extracts only relevant parts)
                  </SelectItem>
                  <SelectItem value="hybrid">
                    Hybrid (vector + keyword + domain)
                  </SelectItem>
                  <SelectItem value="self_query">
                    Self-Query (natural language filters)
                  </SelectItem>
                  <SelectItem value="rag_fusion">
                    RAG Fusion (best accuracy, recommended)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How the agent searches the knowledge base
              </p>
            </div>

            {/* Memory Strategy */}
            <div className="space-y-2">
              <Label htmlFor="memoryStrategy">Memory Strategy</Label>
              <Select
                value={options.memoryStrategy}
                onValueChange={(value: any) =>
                  updateOption('memoryStrategy', value)
                }
              >
                <SelectTrigger id="memoryStrategy">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short">
                    Short (quick queries, limited context)
                  </SelectItem>
                  <SelectItem value="long">
                    Long (extended conversations, summarization)
                  </SelectItem>
                  <SelectItem value="technical">
                    Technical (entity tracking, detailed context)
                  </SelectItem>
                  <SelectItem value="research">
                    Research (semantic search, recommended)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                How much conversation history to use
              </p>
            </div>
          </div>
        )}

        {/* Output Format */}
        <div className="space-y-2">
          <Label htmlFor="outputFormat">Output Format</Label>
          <Select
            value={options.outputFormat}
            onValueChange={(value: any) => updateOption('outputFormat', value)}
          >
            <SelectTrigger id="outputFormat">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="text">Plain Text</SelectItem>
              <SelectItem value="regulatory">
                Regulatory Analysis (pathway, timeline, costs)
              </SelectItem>
              <SelectItem value="clinical">
                Clinical Study Design (endpoints, sample size)
              </SelectItem>
              <SelectItem value="market_access">
                Market Access (pricing, reimbursement)
              </SelectItem>
              <SelectItem value="literature">
                Literature Review (findings, citations)
              </SelectItem>
              <SelectItem value="risk">
                Risk Assessment (risk matrix, mitigation)
              </SelectItem>
              <SelectItem value="competitive">
                Competitive Analysis (SWOT, positioning)
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">
            Request structured output for specific analyses
          </p>
        </div>

        {/* Max Iterations */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="maxIterations">Max Reasoning Steps</Label>
            <span className="text-sm text-muted-foreground">
              {options.maxIterations || 10}
            </span>
          </div>
          <Slider
            id="maxIterations"
            min={1}
            max={20}
            step={1}
            value={[options.maxIterations || 10]}
            onValueChange={([value]) => updateOption('maxIterations', value)}
          />
          <p className="text-xs text-muted-foreground">
            How many steps the agent can take to solve complex problems
          </p>
        </div>

        {/* Temperature */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="temperature">Creativity</Label>
            <span className="text-sm text-muted-foreground">
              {options.temperature?.toFixed(1) || '0.2'}
            </span>
          </div>
          <Slider
            id="temperature"
            min={0}
            max={1}
            step={0.1}
            value={[options.temperature || 0.2]}
            onValueChange={([value]) => updateOption('temperature', value)}
          />
          <p className="text-xs text-muted-foreground">
            Lower = more focused, Higher = more creative
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * System Prompt Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles the 6-section system prompt builder:
 * - YAML frontmatter preview (auto-generated from form)
 * - Markdown system prompt textarea
 * - AI-powered prompt generation
 * - Copy to clipboard functionality
 */

'use client';

import * as React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  FileText,
  Sparkles,
  Copy,
  Loader2,
  CheckCircle,
  AlertTriangle,
  X,
} from 'lucide-react';
import type { EditFormTabProps } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface SystemPromptTabProps extends EditFormTabProps {
  /** Function to generate YAML+MD prompt from form state */
  generateYamlMdPrompt: () => string;
  /** Function to parse YAML+MD prompt and update form state */
  parseYamlMdPrompt: (content: string) => void;
  /** Callback to enhance/generate prompt with AI */
  onEnhanceWithAI: () => Promise<void>;
  /** Whether AI enhancement is in progress */
  enhancingPrompt?: boolean;
  /** Success message after AI generation */
  enhanceSuccess?: boolean;
  /** Error message from AI generation */
  enhanceError?: string | null;
  /** Clear error message */
  onClearError?: () => void;
}

// ============================================================================
// SYSTEM PROMPT TAB COMPONENT
// ============================================================================

export function SystemPromptTab({
  formState,
  generateYamlMdPrompt,
  parseYamlMdPrompt,
  onEnhanceWithAI,
  enhancingPrompt = false,
  enhanceSuccess = false,
  enhanceError = null,
  onClearError,
}: SystemPromptTabProps) {
  // Handle copy to clipboard
  const handleCopy = React.useCallback(() => {
    const systemPrompt = generateYamlMdPrompt();
    navigator.clipboard.writeText(systemPrompt);
  }, [generateYamlMdPrompt]);

  return (
    <div className="space-y-4">
      <Card className="border-primary/30">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <FileText className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-base">System Prompt (YAML + Markdown)</CardTitle>
                <CardDescription>
                  The complete system prompt that defines your agent&apos;s behavior. Use AI to
                  generate or edit manually.
                </CardDescription>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={onEnhanceWithAI}
                disabled={enhancingPrompt || !formState.name}
                className="gap-2"
              >
                {enhancingPrompt ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate with AI
                  </>
                )}
              </Button>
              <Button variant="ghost" size="sm" onClick={handleCopy} className="gap-2">
                <Copy className="h-4 w-4" />
                Copy
              </Button>
            </div>
          </div>

          {/* Success/Error messages */}
          {enhanceSuccess && (
            <div className="mt-3 p-3 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span className="text-sm text-green-700 dark:text-green-400">
                System prompt generated successfully! Review and adjust as needed.
              </span>
            </div>
          )}
          {enhanceError && (
            <div className="mt-3 p-3 bg-destructive/10 border border-destructive/30 rounded-lg flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-destructive flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">Failed to generate prompt</p>
                <p className="text-sm text-destructive/80">{enhanceError}</p>
              </div>
              {onClearError && (
                <Button variant="ghost" size="sm" onClick={onClearError}>
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* Preview of YAML frontmatter */}
          <div className="mb-4 p-3 bg-muted/50 rounded-lg border">
            <p className="text-xs font-mono text-muted-foreground mb-2">
              YAML Frontmatter (auto-generated from form data):
            </p>
            <pre className="text-xs font-mono text-muted-foreground overflow-x-auto">
              {`---
agent_name: "${formState.name || 'untitled'}"
version: "${formState.version || '1.0'}"
model: "${formState.base_model || 'gpt-4'}"
temperature: ${formState.temperature || 0.4}
max_tokens: ${formState.max_tokens || 3000}
expertise_level: "${formState.expertise_level || 'senior'}"
hipaa_compliant: ${formState.hipaa_compliant || false}
---`}
            </pre>
          </div>

          {/* Single large textarea for the markdown body */}
          <div className="grid gap-2">
            <Label htmlFor="system_prompt" className="text-sm font-medium">
              Markdown System Prompt
            </Label>
            <Textarea
              id="system_prompt"
              value={generateYamlMdPrompt()}
              onChange={(e) => parseYamlMdPrompt(e.target.value)}
              placeholder={`## YOU ARE
[Define the agent's specific role and unique positioning...]

## YOU DO
[List 3-7 specific capabilities with measurable outcomes...]

## YOU NEVER
[Define 3-5 safety-critical boundaries with rationale...]

## SUCCESS CRITERIA
[Define measurable performance targets...]

## WHEN UNSURE
[Define escalation protocol with confidence thresholds...]

## EVIDENCE REQUIREMENTS
[Define what sources to cite, evidence hierarchy...]`}
              className="font-mono text-sm min-h-[500px] resize-y"
            />
            <p className="text-xs text-muted-foreground">
              Use the 6-section framework: YOU ARE, YOU DO, YOU NEVER, SUCCESS CRITERIA, WHEN
              UNSURE, EVIDENCE REQUIREMENTS
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

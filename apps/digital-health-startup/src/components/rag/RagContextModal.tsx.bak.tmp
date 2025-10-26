/**
 * RAG Context Modal Component
 * Configure how an agent uses a specific RAG database
 */

'use client';

import { Settings } from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Button, Label, Textarea, Checkbox , Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/shared/components/ui';

interface RagContextModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (ragId: string, context: {
    usage_context: string;
    custom_prompt_instructions: string;
    is_primary: boolean;
  }) => void;
  rag: {
    id: string;
    display_name: string;
    description: string;
    purpose_description: string;
    usage_context?: string;
    custom_prompt_instructions?: string;
    is_primary?: boolean;
  } | null;
  agentName: string;
}

export const RagContextModal: React.FC<RagContextModalProps> = ({
  isOpen,
  onClose,
  onSave,
  rag,
  agentName
}) => {
  const [usageContext, setUsageContext] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  useEffect(() => {
    if (rag) {
      setUsageContext(rag.usage_context || '');
      setCustomInstructions(rag.custom_prompt_instructions || '');
      setIsPrimary(rag.is_primary || false);
    }
  }, [rag]);

  const handleSave = () => {
    if (!rag) return;

    onSave(rag.id, {
      usage_context: usageContext,
      custom_prompt_instructions: customInstructions,
      is_primary: isPrimary
    });
    onClose();
  };

  if (!isOpen || !rag) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure RAG Usage: {rag.display_name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* RAG Information */}
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="font-medium text-sm mb-2">RAG Description</h3>
            <p className="text-sm text-muted-foreground mb-2">{rag.description}</p>
            <h4 className="font-medium text-sm mb-1">Default Purpose:</h4>
            <p className="text-sm text-muted-foreground italic">{rag.purpose_description}</p>
          </div>

          {/* Usage Context */}
          <div className="space-y-2">
            <Label htmlFor="usage_context">
              Specific Usage Context for {agentName}
            </Label>
            <Textarea
              id="usage_context"
              placeholder={`Describe when ${agentName} should use this RAG database...

Examples:
- Use for complex regulatory questions requiring detailed guidance
- Query when users ask about specific FDA submission requirements
- Reference for drug development milestone planning`}
              value={usageContext}
              onChange={(e) => setUsageContext(e.target.value)}
              rows={5}
            />
            <p className="text-sm text-muted-foreground">
              Help the agent understand when to prioritize this knowledge base over others.
            </p>
          </div>

          {/* Custom Instructions */}
          <div className="space-y-2">
            <Label htmlFor="custom_instructions">
              Custom Prompt Instructions
            </Label>
            <Textarea
              id="custom_instructions"
              placeholder={`Custom instructions for how ${agentName} should use results from this RAG...

Examples:
- Always cite specific regulation numbers when referencing FDA guidance
- Summarize key points and provide actionable recommendations
- Cross-reference with latest industry best practices
- Highlight any compliance risks or considerations`}
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              rows={6}
            />
            <p className="text-sm text-muted-foreground">
              These instructions will be included in the agent's prompt when using this RAG.
            </p>
          </div>

          {/* Primary RAG Setting */}
          <div className="flex items-center space-x-2">
            <Checkbox
              id="is_primary"
              checked={isPrimary}
              onCheckedChange={(checked) => setIsPrimary(checked as boolean)}
            />
            <div>
              <Label htmlFor="is_primary" className="font-medium">
                Set as Primary RAG Database
              </Label>
              <p className="text-sm text-muted-foreground">
                The primary RAG will be queried first and given highest priority for this agent.
              </p>
            </div>
          </div>

          {/* Preview */}
          {(usageContext || customInstructions) && (
            <div className="bg-muted/50 p-4 rounded-lg">
              <h3 className="font-medium text-sm mb-2">Configuration Preview</h3>
              {usageContext && (
                <div className="mb-2">
                  <h4 className="font-medium text-xs mb-1">Usage Context:</h4>
                  <p className="text-xs text-muted-foreground">{usageContext}</p>
                </div>
              )}
              {customInstructions && (
                <div>
                  <h4 className="font-medium text-xs mb-1">Custom Instructions:</h4>
                  <p className="text-xs text-muted-foreground font-mono">{customInstructions}</p>
                </div>
              )}
              {isPrimary && (
                <div className="mt-2">
                  <span className="text-xs font-medium text-primary">⭐ Primary RAG Database</span>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Configuration
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
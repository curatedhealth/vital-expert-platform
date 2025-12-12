/**
 * Prompts Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles prompt starters management:
 * - Display saved prompt starters from database
 * - Display local/unsaved prompt starters
 * - Add new prompt starters (title + prompt text)
 * - Remove prompt starters
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { MessageSquare, Plus, X } from 'lucide-react';
import type { EditFormTabProps } from './types';

// ============================================================================
// TYPES
// ============================================================================

export interface PromptStarter {
  id?: string;
  title: string;
  prompt_text: string;
  category?: string;
}

export interface PromptsTabProps extends EditFormTabProps {
  /** Prompt starters loaded from database */
  savedPromptStarters: PromptStarter[];
  /** Callback to add a new prompt starter */
  onAddPromptStarter: (title: string, promptText: string) => void;
  /** Callback to remove a prompt starter (index for local, id for saved) */
  onRemovePromptStarter: (index: number, id?: string) => void;
  /** Maximum number of prompt starters allowed */
  maxStarters?: number;
}

// ============================================================================
// PROMPTS TAB COMPONENT
// ============================================================================

export function PromptsTab({
  formState,
  savedPromptStarters,
  onAddPromptStarter,
  onRemovePromptStarter,
  maxStarters = 5,
}: PromptsTabProps) {
  // State for new prompt starter form
  const [newStarter, setNewStarter] = React.useState({ title: '', prompt: '' });

  // Total starters count
  const totalStarters = savedPromptStarters.length + formState.prompt_starters.length;
  const canAddMore = totalStarters < maxStarters;

  // Handle adding new starter
  const handleAddStarter = React.useCallback(() => {
    if (newStarter.title.trim() && newStarter.prompt.trim()) {
      onAddPromptStarter(newStarter.title.trim(), newStarter.prompt.trim());
      setNewStarter({ title: '', prompt: '' });
    }
  }, [newStarter, onAddPromptStarter]);

  // Handle keyboard submit
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && newStarter.title && newStarter.prompt) {
        e.preventDefault();
        handleAddStarter();
      }
    },
    [newStarter, handleAddStarter]
  );

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Prompt Starters
            <Badge variant="outline" className="ml-auto text-xs">
              {savedPromptStarters.length > 0 ? 'Synced with DB' : 'Local'}
            </Badge>
          </CardTitle>
          <CardDescription>
            Suggested conversation starters shown to users (max {maxStarters}). Stored in Supabase
            prompt_starters table.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current starters from DB */}
          {savedPromptStarters.length > 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Saved starters:</Label>
              {savedPromptStarters.map((starter, index) => (
                <div
                  key={starter.id || index}
                  className="flex items-center gap-2 p-3 bg-muted/50 rounded-md border"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{starter.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-1">
                      {starter.prompt_text}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePromptStarter(index, starter.id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Local starters (not yet saved) */}
          {formState.prompt_starters.length > 0 && savedPromptStarters.length === 0 && (
            <div className="space-y-2">
              <Label className="text-xs text-muted-foreground">Unsaved starters:</Label>
              {formState.prompt_starters.map((starter, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-muted/50 rounded-md">
                  <span className="flex-1 text-sm">{starter}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onRemovePromptStarter(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {/* Add new starter */}
          {canAddMore && (
            <div className="space-y-3 p-3 border border-dashed rounded-lg">
              <Label>Add New Prompt Starter</Label>
              <Input
                placeholder="Title (e.g., 'Clinical Trial Query')"
                value={newStarter.title}
                onChange={(e) => setNewStarter((prev) => ({ ...prev, title: e.target.value }))}
              />
              <Input
                placeholder="Prompt text (e.g., 'What are the latest clinical trial results for...')"
                value={newStarter.prompt}
                onChange={(e) => setNewStarter((prev) => ({ ...prev, prompt: e.target.value }))}
                onKeyDown={handleKeyDown}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddStarter}
                disabled={!newStarter.title || !newStarter.prompt}
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Starter
              </Button>
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            {totalStarters}/{maxStarters} prompt starters configured
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Knowledge Tab Component
 * Extracted from agent-edit-form-enhanced.tsx
 *
 * Handles knowledge and RAG configuration:
 * - Platform RAG toggle
 * - Agent-specific RAG toggle and file upload
 * - Knowledge domains multi-select with category filter
 */

'use client';

import * as React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Brain, Sparkles, FileText, X } from 'lucide-react';
import type { EditFormTabProps, DropdownOption } from './types';

// ============================================================================
// CONSTANTS
// ============================================================================

export const KNOWLEDGE_DOMAIN_CATEGORIES = [
  'All Domains',
  'Clinical',
  'Regulatory',
  'Commercial',
  'Medical Affairs',
] as const;

export type KnowledgeDomainCategory = (typeof KNOWLEDGE_DOMAIN_CATEGORIES)[number];

// ============================================================================
// TYPES
// ============================================================================

export interface KnowledgeTabProps extends EditFormTabProps {
  /** Available knowledge domains from database */
  knowledgeDomains: DropdownOption[];
  /** Whether dropdown data is loading */
  loadingDropdowns?: boolean;
  /** Multi-select dropdown component (passed from parent) */
  MultiSelectDropdown: React.ComponentType<{
    options: DropdownOption[];
    selected: string[];
    onChange: (selected: string[]) => void;
    placeholder?: string;
    loading?: boolean;
    emptyMessage?: string;
  }>;
  /** Callback for file upload */
  onFileUpload?: (files: FileList) => void;
  /** Callback for file removal */
  onFileRemove?: (fileName: string) => void;
}

// ============================================================================
// KNOWLEDGE TAB COMPONENT
// ============================================================================

export function KnowledgeTab({
  formState,
  updateField,
  knowledgeDomains,
  loadingDropdowns = false,
  MultiSelectDropdown,
  onFileUpload,
  onFileRemove,
}: KnowledgeTabProps) {
  // Category filter state for knowledge domains
  const [domainFilter, setDomainFilter] = React.useState<KnowledgeDomainCategory>('All Domains');

  // Filter knowledge domains by category
  const filteredDomains = React.useMemo(() => {
    if (domainFilter === 'All Domains') return knowledgeDomains;
    return knowledgeDomains.filter(
      (domain) =>
        domain.category?.toLowerCase().includes(domainFilter.toLowerCase()) ||
        domain.name?.toLowerCase().includes(domainFilter.toLowerCase())
    );
  }, [knowledgeDomains, domainFilter]);

  // Handle file drop
  const handleDrop = React.useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (onFileUpload && e.dataTransfer.files.length > 0) {
        onFileUpload(e.dataTransfer.files);
      }
    },
    [onFileUpload]
  );

  return (
    <div className="space-y-4">
      {/* Global RAG Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Platform Knowledge (RAG)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Platform RAG</Label>
              <p className="text-xs text-muted-foreground">
                Agent accesses shared VITAL knowledge base
              </p>
            </div>
            <Switch
              checked={formState.rag_enabled}
              onCheckedChange={(checked) => updateField('rag_enabled', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent-Specific RAG */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Sparkles className="h-4 w-4" />
            Agent-Specific RAG
          </CardTitle>
          <CardDescription>Upload custom knowledge for this agent only</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Enable Agent-Specific Knowledge</Label>
              <p className="text-xs text-muted-foreground">
                Agent uses custom documents uploaded below
              </p>
            </div>
            <Switch
              checked={formState.agent_specific_rag}
              onCheckedChange={(checked) => updateField('agent_specific_rag', checked)}
            />
          </div>

          {formState.agent_specific_rag && (
            <div className="space-y-3 pt-2">
              <Label>Content Files</Label>
              <div
                className="border-2 border-dashed rounded-lg p-6 text-center"
                onDrop={handleDrop}
                onDragOver={(e) => e.preventDefault()}
              >
                <div className="flex flex-col items-center gap-2">
                  <FileText className="h-8 w-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">
                    Drag & drop files here, or click to browse
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Supports PDF, TXT, DOCX, MD (max 10MB each)
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    type="button"
                    onClick={() => {
                      // Trigger file input
                      const input = document.createElement('input');
                      input.type = 'file';
                      input.multiple = true;
                      input.accept = '.pdf,.txt,.docx,.md';
                      input.onchange = (e) => {
                        const files = (e.target as HTMLInputElement).files;
                        if (files && onFileUpload) onFileUpload(files);
                      };
                      input.click();
                    }}
                  >
                    Upload Files
                  </Button>
                </div>
              </div>
              {formState.rag_content_files.length > 0 && (
                <div className="space-y-2">
                  {formState.rag_content_files.map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 p-2 bg-muted/50 rounded-md"
                    >
                      <FileText className="h-4 w-4" />
                      <span className="flex-1 text-sm truncate">{file}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        type="button"
                        onClick={() => onFileRemove?.(file)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Knowledge Domains with Filter */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Knowledge Domains</CardTitle>
          <CardDescription>
            Filter and select knowledge domains this agent can access
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Category Filter */}
          <div className="flex gap-2 flex-wrap">
            {KNOWLEDGE_DOMAIN_CATEGORIES.map((category) => (
              <Badge
                key={category}
                variant={domainFilter === category ? 'default' : 'outline'}
                className="cursor-pointer hover:bg-primary/10"
                onClick={() => setDomainFilter(category)}
              >
                {category}
              </Badge>
            ))}
          </div>

          <MultiSelectDropdown
            options={filteredDomains}
            selected={formState.knowledge_domains}
            onChange={(selected) => updateField('knowledge_domains', selected)}
            placeholder="Search knowledge domains..."
            loading={loadingDropdowns}
            emptyMessage="No knowledge domains found in database"
          />
          {formState.knowledge_domains.length === 0 && !loadingDropdowns && (
            <p className="text-xs text-muted-foreground italic">
              No domains selected - agent will have access to all knowledge
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

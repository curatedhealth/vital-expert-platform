"use client";

import { useState, useEffect } from 'react';
import { PanelTemplate } from '@/types/panel-templates';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, Users, CheckCircle2 } from 'lucide-react';

interface PanelTemplateSelectorProps {
  onSelectTemplate: (template: PanelTemplate) => void;
  selectedTemplateSlug?: string;
}

export function PanelTemplateSelector({ onSelectTemplate, selectedTemplateSlug }: PanelTemplateSelectorProps) {
  const [templates, setTemplates] = useState<PanelTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    try {
      setLoading(true);
      setError(null);

      const aiEngineUrl = process.env.NEXT_PUBLIC_PYTHON_AI_ENGINE_URL || process.env.AI_ENGINE_URL || 'http://localhost:8000';

      const response = await fetch(`${aiEngineUrl}/api/v1/panels/templates`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to load templates: ${response.statusText}`);
      }

      const data: PanelTemplate[] = await response.json();
      setTemplates(data);
    } catch (err) {
      console.error('Error loading panel templates:', err);
      setError(err instanceof Error ? err.message : 'Failed to load templates');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2 text-muted-foreground">Loading panel templates...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 border border-destructive rounded-lg bg-destructive/10">
        <p className="text-destructive font-medium">Error loading templates</p>
        <p className="text-sm text-muted-foreground mt-1">{error}</p>
        <Button
          onClick={loadTemplates}
          variant="outline"
          size="sm"
          className="mt-3"
        >
          Retry
        </Button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="p-4 border border-muted rounded-lg bg-muted/10">
        <p className="text-muted-foreground">No panel templates available</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-lg font-semibold">Select Panel Template</h3>
        <p className="text-sm text-muted-foreground">
          Choose from {templates.length} available panel discussion formats
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {templates.map((template) => {
          const isSelected = selectedTemplateSlug === template.template_slug;
          const maxAgents = template.content?.metadata?.max_agents || 6;
          const panelType = template.content?.metadata?.panel_type || 'standard';

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                isSelected ? 'ring-2 ring-primary shadow-lg' : ''
              }`}
              onClick={() => onSelectTemplate(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-base">{template.display_name}</CardTitle>
                    <CardDescription className="mt-1 text-xs">
                      {template.description}
                    </CardDescription>
                  </div>
                  {isSelected && (
                    <CheckCircle2 className="h-5 w-5 text-primary flex-shrink-0 ml-2" />
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-1">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    Max {maxAgents} experts
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {panelType}
                  </Badge>
                  {template.content?.metadata?.voting_enabled && (
                    <Badge variant="outline" className="text-xs">
                      Voting
                    </Badge>
                  )}
                  {template.content?.metadata?.enable_tools && (
                    <Badge variant="outline" className="text-xs">
                      Tools
                    </Badge>
                  )}
                </div>

                {template.tags && template.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {template.tags.slice(0, 3).map((tag) => (
                      <Badge key={tag} variant="default" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

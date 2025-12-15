'use client';

/**
 * VITAL Platform - Ask Panel Templates
 *
 * Shows available panel templates that can be used as starting points.
 */

import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { ArrowLeft, LayoutTemplate, Loader2, Users, Sparkles, Brain, Swords, Vote, Target, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/page-header';

const TEMPLATE_PANELS = [
  {
    slug: 'structured_panel',
    name: 'Structured Panel',
    description: 'Sequential moderated discussion with cross-examination and synthesis phases.',
    icon: <Users className="w-5 h-5" />,
    color: 'purple',
    suggestedAgents: 10,
    mode: 'sequential',
    framework: 'langgraph',
  },
  {
    slug: 'open_panel',
    name: 'Open Panel',
    description: 'Free-form parallel brainstorming with theme identification and idea synthesis.',
    icon: <Sparkles className="w-5 h-5" />,
    color: 'violet',
    suggestedAgents: 10,
    mode: 'collaborative',
    framework: 'autogen',
  },
  {
    slug: 'socratic_panel',
    name: 'Socratic Panel',
    description: 'Dialectical questioning with probing questions, defense, and revision cycles.',
    icon: <Brain className="w-5 h-5" />,
    color: 'fuchsia',
    suggestedAgents: 10,
    mode: 'sequential',
    framework: 'langgraph',
  },
  {
    slug: 'devils_advocate_panel',
    name: "Devil's Advocate Panel",
    description: 'Pro/con debate format with rebuttals and judge-synthesized conclusions.',
    icon: <Swords className="w-5 h-5" />,
    color: 'pink',
    suggestedAgents: 10,
    mode: 'collaborative',
    framework: 'autogen',
  },
  {
    slug: 'expert_panel',
    name: 'Expert Panel',
    description: 'Focused expert consensus panel for complex decisions requiring agreement.',
    icon: <Vote className="w-5 h-5" />,
    color: 'indigo',
    suggestedAgents: 10,
    mode: 'sequential',
    framework: 'langgraph',
  },
  {
    slug: 'structured_ask_expert_panel',
    name: 'Structured Ask Expert',
    description: 'Single-expert structured consultation with clear phases from assessment to recommendation.',
    icon: <Target className="w-5 h-5" />,
    color: 'cyan',
    suggestedAgents: 10,
    mode: 'sequential',
    framework: 'langgraph',
  },
];

export default function PanelTemplatesPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleUseTemplate = (slug: string) => {
    // Map template slugs to panel types for the execute page
    const typeMap: Record<string, string> = {
      structured_panel: 'structured',
      open_panel: 'open',
      socratic_panel: 'socratic',
      devils_advocate_panel: 'adversarial',
      expert_panel: 'delphi',
      structured_ask_expert_panel: 'hybrid',
    };
    const panelType = typeMap[slug] || 'structured';
    router.push(`/ask-panel/execute?type=${panelType}`);
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Page Header */}
      <PageHeader
        icon={LayoutTemplate}
        title="Panel Templates"
        description="Pre-configured panel types with suggested expert configurations"
      />

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto p-6 space-y-6">
          {/* Back Button */}
          <Button variant="ghost" onClick={() => router.push('/ask-panel')}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Panel Types
          </Button>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {TEMPLATE_PANELS.map((template) => (
                <Card
                  key={template.slug}
                  className="group hover:shadow-lg transition-all duration-200 hover:border-primary/50 cursor-pointer"
                  onClick={() => handleUseTemplate(template.slug)}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <div className={`w-10 h-10 rounded-lg bg-${template.color}-500/10 flex items-center justify-center text-${template.color}-600`}>
                        {template.icon}
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {template.mode}
                      </Badge>
                    </div>
                    <CardTitle className="text-base mt-3">{template.name}</CardTitle>
                    <CardDescription className="text-sm">{template.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        <Badge variant="secondary" className="text-xs">
                          {template.framework}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          {template.suggestedAgents} experts
                        </Badge>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

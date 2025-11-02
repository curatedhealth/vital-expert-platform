/**
 * Panel Creator Component
 * Complete form for creating multi-expert AI panel discussions
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Sparkles, Users, Brain, MessageSquare, Scale, Layers, 
  Loader2, AlertCircle, CheckCircle2 
} from 'lucide-react';
import { useTenant } from '@/hooks/use-tenant';
import { useAuth } from '@/hooks/use-auth';
import type { PanelType, PanelConfiguration } from '@/types/database.types';

// ============================================================================
// PANEL TYPE CONFIGURATIONS
// ============================================================================

interface PanelTypeConfig {
  name: string;
  description: string;
  icon: typeof Sparkles;
  duration: string;
  experts: string;
  color: string;
  useCases: string[];
  defaultConfig: Partial<PanelConfiguration>;
}

const PANEL_TYPES: Record<PanelType, PanelTypeConfig> = {
  structured: {
    name: 'Structured Panel',
    description: 'Sequential, moderated discussion ideal for regulatory decisions',
    icon: Layers,
    duration: '10-15 min',
    experts: '3-5',
    color: 'blue',
    useCases: ['Regulatory submissions', 'Protocol design', 'Risk assessment'],
    defaultConfig: {
      max_rounds: 3,
      time_limit_minutes: 15,
      consensus_threshold: 0.7,
      enable_dissent: true,
    },
  },
  open: {
    name: 'Open Panel',
    description: 'Parallel exploration perfect for brainstorming and innovation',
    icon: Sparkles,
    duration: '5-10 min',
    experts: '5-8',
    color: 'green',
    useCases: ['Drug discovery', 'Market analysis', 'Strategic planning'],
    defaultConfig: {
      max_rounds: 2,
      time_limit_minutes: 10,
      consensus_threshold: 0.6,
      enable_dissent: false,
    },
  },
  socratic: {
    name: 'Socratic Panel',
    description: 'Deep analysis through iterative questioning methodology',
    icon: Brain,
    duration: '15-20 min',
    experts: '3-4',
    color: 'purple',
    useCases: ['Clinical trial design', 'Hypothesis testing', 'Root cause analysis'],
    defaultConfig: {
      max_rounds: 5,
      time_limit_minutes: 20,
      consensus_threshold: 0.8,
      enable_dissent: true,
    },
  },
  adversarial: {
    name: 'Adversarial Panel',
    description: 'Structured debate for risk assessment and critical evaluation',
    icon: Scale,
    duration: '10-15 min',
    experts: '4-6',
    color: 'red',
    useCases: ['Safety evaluation', 'Competitive analysis', 'Devil\'s advocate review'],
    defaultConfig: {
      max_rounds: 4,
      time_limit_minutes: 15,
      consensus_threshold: 0.65,
      enable_dissent: true,
    },
  },
  delphi: {
    name: 'Delphi Panel',
    description: 'Anonymous iterative rounds for consensus building',
    icon: Users,
    duration: '15-25 min',
    experts: '5-12',
    color: 'indigo',
    useCases: ['Forecasting', 'Expert consensus', 'Policy development'],
    defaultConfig: {
      max_rounds: 3,
      time_limit_minutes: 25,
      consensus_threshold: 0.75,
      enable_dissent: false,
    },
  },
  hybrid: {
    name: 'Hybrid Human-AI',
    description: 'Combined human and AI experts for critical decisions',
    icon: MessageSquare,
    duration: '20-30 min',
    experts: '3-8',
    color: 'amber',
    useCases: ['High-stakes decisions', 'Novel therapies', 'Strategic initiatives'],
    defaultConfig: {
      max_rounds: 4,
      time_limit_minutes: 30,
      consensus_threshold: 0.8,
      enable_dissent: true,
    },
  },
};

// ============================================================================
// FORM SCHEMA
// ============================================================================

const createPanelSchema = z.object({
  query: z.string().min(20, 'Query must be at least 20 characters').max(2000, 'Query too long'),
  panel_type: z.enum(['structured', 'open', 'socratic', 'adversarial', 'delphi', 'hybrid']),
  agents: z.array(z.string()).min(3, 'Select at least 3 experts').max(12, 'Maximum 12 experts'),
  configuration: z.object({
    max_rounds: z.number().min(1).max(10).optional(),
    time_limit_minutes: z.number().min(5).max(60).optional(),
    consensus_threshold: z.number().min(0.5).max(1).optional(),
    enable_dissent: z.boolean().optional(),
    custom_prompt: z.string().optional(),
  }),
});

type CreatePanelForm = z.infer<typeof createPanelSchema>;

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function PanelCreator() {
  const router = useRouter();
  const { user } = useAuth();
  const { tenant, features, settings, db } = useTenant();
  const [selectedType, setSelectedType] = useState<PanelType>('structured');
  const [selectedAgents, setSelectedAgents] = useState<string[]>([]);
  const [isCreating, setIsCreating] = useState(false);

  const form = useForm<CreatePanelForm>({
    resolver: zodResolver(createPanelSchema),
    defaultValues: {
      query: '',
      panel_type: 'structured',
      agents: [],
      configuration: PANEL_TYPES.structured.defaultConfig,
    },
  });

  const onSubmit = async (data: CreatePanelForm) => {
    if (!db || !user) {
      alert('Not authenticated');
      return;
    }

    setIsCreating(true);
    try {
      const panel = await db.createPanel({
        user_id: user.id,
        query: data.query,
        panel_type: data.panel_type,
        status: 'created',
        configuration: data.configuration,
        agents: data.agents as any, // JSONB[]
        started_at: null,
        completed_at: null,
        metadata: {
          created_from: 'web_ui',
          user_agent: navigator.userAgent,
        },
      });

      // Redirect to streaming view
      router.push(`/panels/${panel.id}/stream`);
    } catch (error) {
      console.error('Failed to create panel:', error);
      alert('Failed to create panel. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  const handleTypeSelect = (type: PanelType) => {
    setSelectedType(type);
    form.setValue('panel_type', type);
    form.setValue('configuration', PANEL_TYPES[type].defaultConfig);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 p-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Create Expert Panel</h1>
        <p className="text-muted-foreground">
          Orchestrate multi-expert AI discussions for complex healthcare decisions
        </p>
      </div>

      {/* Panel Type Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="w-5 h-5" />
            Select Panel Type
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {(Object.entries(PANEL_TYPES) as [PanelType, PanelTypeConfig][]).map(([key, config]) => {
              const Icon = config.icon;
              const isAvailable = features[`${key}_panel`];
              const isSelected = selectedType === key;

              return (
                <button
                  key={key}
                  onClick={() => isAvailable && handleTypeSelect(key)}
                  disabled={!isAvailable}
                  className={`
                    relative p-4 rounded-lg border-2 transition-all text-left
                    ${isSelected 
                      ? 'border-primary bg-primary/5 shadow-md' 
                      : 'border-border hover:border-primary/50'
                    }
                    ${!isAvailable ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                  `}
                >
                  {!isAvailable && (
                    <Badge className="absolute top-2 right-2" variant="secondary">
                      Upgrade
                    </Badge>
                  )}

                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-lg bg-${config.color}-100 dark:bg-${config.color}-900/20`}>
                      <Icon className={`w-5 h-5 text-${config.color}-600 dark:text-${config.color}-400`} />
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">{config.name}</h3>
                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-primary" />
                        )}
                      </div>
                      
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {config.description}
                      </p>

                      <div className="flex gap-3 text-xs text-muted-foreground">
                        <span>⏱ {config.duration}</span>
                        <span>👥 {config.experts}</span>
                      </div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Use Cases */}
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h4 className="text-sm font-medium mb-2">Best for:</h4>
            <div className="flex flex-wrap gap-2">
              {PANEL_TYPES[selectedType].useCases.map((useCase) => (
                <Badge key={useCase} variant="outline">
                  {useCase}
                </Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Query Input */}
      <Card>
        <CardHeader>
          <CardTitle>Your Query</CardTitle>
        </CardHeader>
        <CardContent>
          <textarea
            placeholder="Enter your complex healthcare question or decision that requires expert panel discussion...

Example: What are the key regulatory considerations and clinical development strategies for an AI-powered diagnostic device targeting early detection of diabetic retinopathy in primary care settings?"
            className="w-full min-h-[150px] p-3 border rounded-md bg-background resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            {...form.register('query')}
          />
          {form.formState.errors.query && (
            <p className="text-sm text-destructive mt-2 flex items-center gap-1">
              <AlertCircle className="w-4 h-4" />
              {form.formState.errors.query.message}
            </p>
          )}
          <div className="mt-2 flex justify-between text-xs text-muted-foreground">
            <span>Minimum 20 characters</span>
            <span>{form.watch('query')?.length || 0} / 2000</span>
          </div>
        </CardContent>
      </Card>

      {/* Agent Selection (Simplified for now) */}
      <Card>
        <CardHeader>
          <CardTitle>Select Expert Agents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="p-4 border-2 border-dashed rounded-lg text-center">
            <Users className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Expert agent selector will be loaded here
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Select {PANEL_TYPES[selectedType].experts} experts from 136 available agents
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Submit Button */}
      <div className="flex justify-end gap-4">
        <Button
          variant="outline"
          onClick={() => router.push('/panels')}
          disabled={isCreating}
        >
          Cancel
        </Button>

        <Button
          onClick={form.handleSubmit(onSubmit)}
          disabled={isCreating || !form.formState.isValid}
          size="lg"
        >
          {isCreating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating Panel...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Create Panel
            </>
          )}
        </Button>
      </div>
    </div>
  );
}


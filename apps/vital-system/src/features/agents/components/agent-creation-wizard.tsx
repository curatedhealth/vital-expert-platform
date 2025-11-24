'use client';

import React, { useState } from 'react';
import {
  Brain,
  Sparkles,
  Zap,
  ChevronLeft,
  ChevronRight,
  Check,
  Info,
  Loader2,
  Wand2,
  FileText,
  Settings,
  Eye,
  Lightbulb,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import type { ClientAgent } from '../types/agent-schema';

// ============================================================================
// Types
// ============================================================================

interface AgentCreationWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (agent: Partial<ClientAgent>) => Promise<void>;
  templates?: AgentTemplate[];
}

interface AgentTemplate {
  id: string;
  name: string;
  description: string;
  tier: '1' | '2' | '3';
  model: string;
  systemPrompt: string;
  capabilities: string[];
  knowledgeDomains: string[];
  temperature: number;
  maxTokens: number;
}

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ElementType;
}

interface FormData {
  // Step 1: Basic Information
  name: string;
  display_name: string;
  description: string;
  avatar: string;

  // Step 2: Configuration
  tier: '1' | '2' | '3';
  model: string;
  temperature: number;
  max_tokens: number;
  context_window: number;

  // Step 3: Capabilities & Domains
  capabilities: string[];
  knowledge_domains: string[];
  domain_expertise: string[];

  // Step 4: System Prompt
  system_prompt: string;

  // Metadata
  template_id?: string;
}

// ============================================================================
// Constants
// ============================================================================

const WIZARD_STEPS: WizardStep[] = [
  {
    id: 'template',
    title: 'Choose Template',
    description: 'Start from a template or create from scratch',
    icon: Lightbulb,
  },
  {
    id: 'basic',
    title: 'Basic Information',
    description: 'Name, description, and avatar',
    icon: FileText,
  },
  {
    id: 'configuration',
    title: 'Configuration',
    description: 'Model, tier, and parameters',
    icon: Settings,
  },
  {
    id: 'capabilities',
    title: 'Capabilities',
    description: 'Skills and knowledge domains',
    icon: Brain,
  },
  {
    id: 'prompt',
    title: 'System Prompt',
    description: 'Instructions for the agent',
    icon: Wand2,
  },
  {
    id: 'review',
    title: 'Review',
    description: 'Review and create',
    icon: Eye,
  },
];

const TIER_OPTIONS = [
  {
    value: '1',
    label: 'Tier 1: Foundational',
    description: 'High-volume, cost-effective for general queries',
    icon: Brain,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    models: ['gpt-3.5-turbo', 'CuratedHealth/base_7b'],
  },
  {
    value: '2',
    label: 'Tier 2: Specialist',
    description: 'Domain-specific expertise and specialized tasks',
    icon: Sparkles,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    models: ['gpt-4', 'gpt-4-turbo', 'microsoft/biogpt', 'CuratedHealth/Qwen3-8B-SFT'],
  },
  {
    value: '3',
    label: 'Tier 3: Ultra-Specialist',
    description: 'Safety-critical, complex reasoning, highest accuracy',
    icon: Zap,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    models: ['gpt-4', 'claude-3-opus', 'CuratedHealth/meditron70b-qlora-1gpu'],
  },
];

const DEFAULT_TEMPLATES: AgentTemplate[] = [
  {
    id: 'blank',
    name: 'Blank Agent',
    description: 'Start from scratch with full customization',
    tier: '1',
    model: 'gpt-3.5-turbo',
    systemPrompt: '',
    capabilities: [],
    knowledgeDomains: [],
    temperature: 0.7,
    maxTokens: 2000,
  },
  {
    id: 'clinical-specialist',
    name: 'Clinical Specialist',
    description: 'Medical expert for clinical queries',
    tier: '2',
    model: 'microsoft/biogpt',
    systemPrompt: `YOU ARE: A Clinical Specialist with deep medical knowledge and evidence-based practice expertise.

YOU DO:
- Provide clinical guidance based on current medical literature
- Explain complex medical concepts clearly
- Cite evidence sources for recommendations
- Identify when to escalate to specialists

YOU NEVER:
- Make definitive diagnoses
- Prescribe treatments
- Replace professional medical judgment

SUCCESS CRITERIA:
- Evidence cited for all recommendations
- Clear communication for various expertise levels
- Appropriate escalation when needed

WHEN UNSURE:
- Acknowledge limitations
- Provide confidence levels
- Recommend consultation with specialists`,
    capabilities: [
      'Clinical decision support',
      'Medical literature review',
      'Patient education',
      'Treatment guidelines interpretation',
    ],
    knowledgeDomains: ['Clinical Medicine', 'Evidence-Based Practice', 'Medical Research'],
    temperature: 0.4,
    maxTokens: 3000,
  },
  {
    id: 'regulatory-expert',
    name: 'Regulatory Expert',
    description: 'FDA and regulatory compliance specialist',
    tier: '3',
    model: 'gpt-4',
    systemPrompt: `YOU ARE: A Regulatory Affairs Expert specializing in FDA compliance and pharmaceutical regulations.

YOU DO:
- Interpret FDA regulations and guidance documents
- Assess regulatory compliance requirements
- Provide strategic regulatory advice
- Review submission documentation

YOU NEVER:
- Provide legal advice
- Guarantee regulatory approval
- Make decisions on behalf of regulatory agencies

SUCCESS CRITERIA:
- Accurate interpretation of regulations
- Complete compliance assessment
- Clear next steps for regulatory strategy

WHEN UNSURE:
- Reference specific regulatory guidance
- Recommend consultation with legal team
- Acknowledge regulatory gray areas

EVIDENCE REQUIREMENTS:
- Cite specific CFR sections
- Reference FDA guidance documents
- Note precedent cases when relevant`,
    capabilities: [
      'Regulatory compliance assessment',
      'FDA guidance interpretation',
      'Submission strategy',
      'Regulatory risk evaluation',
    ],
    knowledgeDomains: ['FDA Regulations', 'Pharmaceutical Compliance', 'Regulatory Strategy'],
    temperature: 0.2,
    maxTokens: 4000,
  },
];

const AVATAR_OPTIONS = [
  'avatar_0109', 'avatar_0110', 'avatar_0115', 'avatar_0120', 'avatar_0125',
  'avatar_0200', 'avatar_0210', 'avatar_0220', 'avatar_0230', 'avatar_0240',
  'avatar_0400', 'avatar_0410', 'avatar_0420', 'avatar_0430', 'avatar_0440',
];

// ============================================================================
// Helper Functions
// ============================================================================

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

function validateStep(step: string, data: FormData): string | null {
  switch (step) {
    case 'basic':
      if (!data.name.trim()) return 'Name is required';
      if (!data.description.trim()) return 'Description is required';
      break;
    case 'configuration':
      if (!data.tier) return 'Tier is required';
      if (!data.model) return 'Model is required';
      break;
    case 'capabilities':
      if (data.capabilities.length === 0) return 'At least one capability is required';
      break;
    case 'prompt':
      if (!data.system_prompt.trim()) return 'System prompt is required';
      break;
  }
  return null;
}

// ============================================================================
// Sub-Components
// ============================================================================

interface StepIndicatorProps {
  steps: WizardStep[];
  currentStep: number;
  completedSteps: Set<number>;
}

function StepIndicator({ steps, currentStep, completedSteps }: StepIndicatorProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = index === currentStep;
        const isCompleted = completedSteps.has(index);
        const isPast = index < currentStep;

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-2">
              <div
                className={cn(
                  'flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all',
                  isActive && 'border-primary bg-primary text-primary-foreground',
                  isCompleted && 'border-green-500 bg-green-500 text-white',
                  !isActive && !isCompleted && 'border-muted-foreground/30 text-muted-foreground'
                )}
              >
                {isCompleted ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <Icon className="h-5 w-5" />
                )}
              </div>
              <div className="text-center">
                <p className={cn('text-xs font-medium', isActive && 'text-primary')}>
                  {step.title}
                </p>
              </div>
            </div>

            {index < steps.length - 1 && (
              <div
                className={cn(
                  'flex-1 h-0.5 mx-2',
                  isPast ? 'bg-green-500' : 'bg-muted'
                )}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

// ============================================================================
// Main Component
// ============================================================================

export function AgentCreationWizard({
  open,
  onOpenChange,
  onSubmit,
  templates = DEFAULT_TEMPLATES,
}: AgentCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newCapability, setNewCapability] = useState('');
  const [newDomain, setNewDomain] = useState('');

  const [formData, setFormData] = useState<FormData>({
    name: '',
    display_name: '',
    description: '',
    avatar: AVATAR_OPTIONS[0],
    tier: '1',
    model: 'gpt-3.5-turbo',
    temperature: 0.7,
    max_tokens: 2000,
    context_window: 4000,
    capabilities: [],
    knowledge_domains: [],
    domain_expertise: [],
    system_prompt: '',
  });

  // Handle template selection
  const handleSelectTemplate = (template: AgentTemplate) => {
    setFormData({
      ...formData,
      tier: template.tier,
      model: template.model,
      system_prompt: template.systemPrompt,
      capabilities: [...template.capabilities],
      knowledge_domains: [...template.knowledgeDomains],
      temperature: template.temperature,
      max_tokens: template.maxTokens,
      template_id: template.id,
    });

    if (template.id !== 'blank') {
      setCompletedSteps(new Set([0, 3, 4])); // Mark capability and prompt steps as completed
    }

    setCurrentStep(1); // Move to basic info
  };

  // Handle next step
  const handleNext = () => {
    const error = validateStep(WIZARD_STEPS[currentStep].id, formData);
    if (error) {
      toast.error(error);
      return;
    }

    setCompletedSteps(new Set([...completedSteps, currentStep]));
    setCurrentStep(currentStep + 1);
  };

  // Handle previous step
  const handlePrevious = () => {
    setCurrentStep(currentStep - 1);
  };

  // Handle form submission
  const handleSubmit = async () => {
    const error = validateStep('prompt', formData);
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);

    try {
      const agent: Partial<ClientAgent> = {
        name: formData.name,
        display_name: formData.display_name || formData.name,
        description: formData.description,
        avatar: `/icons/png/avatars/${formData.avatar}.png`,
        system_prompt: formData.system_prompt,
        model: formData.model,
        tier: formData.tier,
        capabilities: formData.capabilities,
        knowledge_domains: formData.knowledge_domains,
        domain_expertise: formData.domain_expertise,
        temperature: formData.temperature,
        max_tokens: formData.max_tokens,
        context_window: formData.context_window,
        status: 'testing',
        is_custom: true,
      };

      await onSubmit(agent);
      toast.success('Agent created successfully!');
      onOpenChange(false);

      // Reset form
      setCurrentStep(0);
      setCompletedSteps(new Set());
      setFormData({
        name: '',
        display_name: '',
        description: '',
        avatar: AVATAR_OPTIONS[0],
        tier: '1',
        model: 'gpt-3.5-turbo',
        temperature: 0.7,
        max_tokens: 2000,
        context_window: 4000,
        capabilities: [],
        knowledge_domains: [],
        domain_expertise: [],
        system_prompt: '',
      });
    } catch (error) {
      console.error('Failed to create agent:', error);
      toast.error(
        `Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle adding capability
  const handleAddCapability = () => {
    if (!newCapability.trim()) return;
    setFormData({
      ...formData,
      capabilities: [...formData.capabilities, newCapability.trim()],
    });
    setNewCapability('');
  };

  // Handle adding domain
  const handleAddDomain = () => {
    if (!newDomain.trim()) return;
    setFormData({
      ...formData,
      knowledge_domains: [...formData.knowledge_domains, newDomain.trim()],
    });
    setNewDomain('');
  };

  // Get recommended models for selected tier
  const recommendedModels = TIER_OPTIONS.find((t) => t.value === formData.tier)?.models || [];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        <DialogHeader className="px-6 pt-6 pb-4">
          <DialogTitle className="text-2xl">Create New Agent</DialogTitle>
          <DialogDescription>
            Follow the steps to create a custom AI expert agent
          </DialogDescription>
        </DialogHeader>

        <Separator />

        <div className="px-6 py-4">
          <StepIndicator
            steps={WIZARD_STEPS}
            currentStep={currentStep}
            completedSteps={completedSteps}
          />
        </div>

        <ScrollArea className="h-[500px] px-6">
          {/* Step 0: Template Selection */}
          {currentStep === 0 && (
            <div className="space-y-4 pb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Choose a Template</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start from a pre-configured template or create from scratch
                </p>
              </div>

              <div className="grid gap-4">
                {templates.map((template) => {
                  const TierIcon = TIER_OPTIONS.find((t) => t.value === template.tier)?.icon || Brain;

                  return (
                    <Card
                      key={template.id}
                      className="cursor-pointer hover:border-primary transition-colors"
                      onClick={() => handleSelectTemplate(template)}
                    >
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                              <TierIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                              <CardTitle className="text-base">{template.name}</CardTitle>
                              <CardDescription className="mt-1">
                                {template.description}
                              </CardDescription>
                            </div>
                          </div>
                          <Badge variant="outline">
                            Tier {template.tier}
                          </Badge>
                        </div>
                      </CardHeader>
                      {template.id !== 'blank' && (
                        <CardContent>
                          <div className="flex flex-wrap gap-2">
                            {template.capabilities.slice(0, 3).map((cap, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {cap}
                              </Badge>
                            ))}
                            {template.capabilities.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{template.capabilities.length - 3} more
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      )}
                    </Card>
                  );
                })}
              </div>
            </div>
          )}

          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Basic Information</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Provide the basic details for your agent
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Agent Name *</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Clinical Decision Support Specialist"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="display_name">Display Name (optional)</Label>
                  <Input
                    id="display_name"
                    placeholder="Leave blank to use Agent Name"
                    value={formData.display_name}
                    onChange={(e) => setFormData({ ...formData, display_name: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea
                    id="description"
                    placeholder="Describe what this agent does and when to use it..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Avatar</Label>
                  <div className="grid grid-cols-8 gap-2">
                    {AVATAR_OPTIONS.map((avatar) => (
                      <div
                        key={avatar}
                        className={cn(
                          'cursor-pointer rounded-lg border-2 p-1 transition-colors',
                          formData.avatar === avatar
                            ? 'border-primary'
                            : 'border-transparent hover:border-muted-foreground/30'
                        )}
                        onClick={() => setFormData({ ...formData, avatar })}
                      >
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`/icons/png/avatars/${avatar}.png`}
                            alt={avatar}
                          />
                          <AvatarFallback>{avatar.slice(-2)}</AvatarFallback>
                        </Avatar>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Configuration */}
          {currentStep === 2 && (
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Configuration</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure the AI model and parameters
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Tier *</Label>
                  <div className="grid gap-3">
                    {TIER_OPTIONS.map((tier) => {
                      const Icon = tier.icon;
                      return (
                        <Card
                          key={tier.value}
                          className={cn(
                            'cursor-pointer transition-colors',
                            formData.tier === tier.value
                              ? 'border-primary bg-primary/5'
                              : 'hover:border-muted-foreground/30'
                          )}
                          onClick={() => setFormData({ ...formData, tier: tier.value as any })}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-start gap-3">
                              <div className={cn('p-2 rounded-lg', tier.bgColor)}>
                                <Icon className={cn('h-5 w-5', tier.color)} />
                              </div>
                              <div className="flex-1">
                                <p className="font-medium">{tier.label}</p>
                                <p className="text-sm text-muted-foreground mt-1">
                                  {tier.description}
                                </p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Select
                    value={formData.model}
                    onValueChange={(value) => setFormData({ ...formData, model: value })}
                  >
                    <SelectTrigger id="model">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {recommendedModels.map((model) => (
                        <SelectItem key={model} value={model}>
                          {model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground">
                    Recommended models for Tier {formData.tier}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="temperature">
                      Temperature: {formData.temperature}
                    </Label>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={formData.temperature}
                      onChange={(e) =>
                        setFormData({ ...formData, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full"
                    />
                    <p className="text-xs text-muted-foreground">
                      Lower = more focused, Higher = more creative
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="max_tokens">Max Tokens</Label>
                    <Input
                      id="max_tokens"
                      type="number"
                      value={formData.max_tokens}
                      onChange={(e) =>
                        setFormData({ ...formData, max_tokens: parseInt(e.target.value) })
                      }
                    />
                  </div>
                </div>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Tier {formData.tier} Recommendations:</strong>
                    <br />
                    Temperature: {formData.tier === '1' ? '0.6-0.7' : formData.tier === '2' ? '0.3-0.5' : '0.1-0.3'}
                    <br />
                    Max Tokens: {formData.tier === '1' ? '2000' : formData.tier === '2' ? '3000' : '4000'}
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Step 3: Capabilities */}
          {currentStep === 3 && (
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Capabilities & Knowledge</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define what your agent can do and what it knows
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label>Capabilities *</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Clinical decision support"
                      value={newCapability}
                      onChange={(e) => setNewCapability(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddCapability();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddCapability}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.capabilities.map((cap, i) => (
                      <Badge
                        key={i}
                        variant="secondary"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            capabilities: formData.capabilities.filter((_, idx) => idx !== i),
                          })
                        }
                      >
                        {cap} ×
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Knowledge Domains</Label>
                  <div className="flex gap-2">
                    <Input
                      placeholder="e.g., Clinical Medicine"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddDomain();
                        }
                      }}
                    />
                    <Button type="button" onClick={handleAddDomain}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.knowledge_domains.map((domain, i) => (
                      <Badge
                        key={i}
                        variant="outline"
                        className="cursor-pointer hover:bg-destructive hover:text-destructive-foreground"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            knowledge_domains: formData.knowledge_domains.filter((_, idx) => idx !== i),
                          })
                        }
                      >
                        {domain} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: System Prompt */}
          {currentStep === 4 && (
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">System Prompt</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Define how the agent should behave and respond
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="system_prompt">System Prompt *</Label>
                  <Textarea
                    id="system_prompt"
                    placeholder={`YOU ARE: [Role and expertise]

YOU DO:
- [Capability 1]
- [Capability 2]
- [Capability 3]

YOU NEVER:
- [Boundary 1]
- [Boundary 2]

SUCCESS CRITERIA:
- [Metric 1]
- [Metric 2]

WHEN UNSURE:
- [Escalation protocol]`}
                    rows={16}
                    value={formData.system_prompt}
                    onChange={(e) => setFormData({ ...formData, system_prompt: e.target.value })}
                    className="font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Follow the 6-section framework: YOU ARE, YOU DO, YOU NEVER, SUCCESS CRITERIA,
                    WHEN UNSURE, EVIDENCE REQUIREMENTS (for medical agents)
                  </p>
                </div>

                <Alert>
                  <Lightbulb className="h-4 w-4" />
                  <AlertDescription>
                    <strong>Best Practices:</strong>
                    <ul className="list-disc list-inside mt-1 text-sm space-y-1">
                      <li>Be specific about the agent's role and expertise</li>
                      <li>List 3-7 concrete capabilities</li>
                      <li>Define clear boundaries (what NOT to do)</li>
                      <li>Include measurable success criteria</li>
                      <li>Specify escalation protocol for uncertainty</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}

          {/* Step 5: Review */}
          {currentStep === 5 && (
            <div className="space-y-6 pb-4">
              <div>
                <h3 className="text-lg font-semibold mb-2">Review Your Agent</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Review all details before creating
                </p>
              </div>

              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <div className="flex items-start gap-4">
                      <Avatar className="h-16 w-16 border-2">
                        <AvatarImage
                          src={`/icons/png/avatars/${formData.avatar}.png`}
                          alt={formData.name}
                        />
                        <AvatarFallback>{getInitials(formData.name)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <CardTitle>{formData.display_name || formData.name}</CardTitle>
                        <CardDescription className="mt-1">
                          {formData.description}
                        </CardDescription>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <Badge variant="outline">
                            Tier {formData.tier}
                          </Badge>
                          <Badge variant="secondary" className="font-mono text-xs">
                            {formData.model}
                          </Badge>
                          <Badge variant="outline">Testing</Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm font-medium mb-2">Capabilities</p>
                      <div className="flex flex-wrap gap-2">
                        {formData.capabilities.map((cap, i) => (
                          <Badge key={i} variant="secondary">
                            {cap}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {formData.knowledge_domains.length > 0 && (
                      <div>
                        <p className="text-sm font-medium mb-2">Knowledge Domains</p>
                        <div className="flex flex-wrap gap-2">
                          {formData.knowledge_domains.map((domain, i) => (
                            <Badge key={i} variant="outline">
                              {domain}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-sm font-medium mb-2">Configuration</p>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-muted-foreground">Temperature:</span>
                          <p className="font-medium">{formData.temperature}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Max Tokens:</span>
                          <p className="font-medium">{formData.max_tokens}</p>
                        </div>
                        <div>
                          <span className="text-muted-foreground">Context:</span>
                          <p className="font-medium">{formData.context_window}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">System Prompt Preview</p>
                      <ScrollArea className="h-32 rounded-md border p-3">
                        <pre className="text-xs font-mono whitespace-pre-wrap">
                          {formData.system_prompt}
                        </pre>
                      </ScrollArea>
                    </div>
                  </CardContent>
                </Card>

                <Alert>
                  <Info className="h-4 w-4" />
                  <AlertDescription>
                    Your agent will be created with status "Testing". You can activate it once
                    you've verified it works as expected.
                  </AlertDescription>
                </Alert>
              </div>
            </div>
          )}
        </ScrollArea>

        <Separator />

        {/* Footer with navigation buttons */}
        <div className="flex items-center justify-between px-6 py-4">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="h-4 w-4 mr-2" />
            Previous
          </Button>

          <div className="flex gap-2">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>

            {currentStep < WIZARD_STEPS.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Create Agent
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

'use client';

/**
 * VITAL Platform - AIInterviewWizard Component (Mode 4)
 *
 * Progressive disclosure wizard for Mode 4 (AI Wizard).
 * AI asks clarifying questions to understand user needs, then generates
 * a mission configuration based on answers.
 *
 * Flow:
 * 1. AI analyzes prompt and identifies gaps
 * 2. AI generates targeted questions (1-5 questions per step)
 * 3. User answers questions
 * 4. AI refines understanding and may ask follow-up questions
 * 5. AI generates final config for review
 *
 * Design System: VITAL Brand v6.0 (Purple/Amber theme for AI Wizard)
 * Phase 3 Redesign - December 13, 2025
 */

import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Zap,
  MessageSquare,
  ChevronRight,
  ChevronLeft,
  Sparkles,
  CheckCircle2,
  Loader2,
  Brain,
  Target,
  Users,
  Clock,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  Edit3,
} from 'lucide-react';

import type { MissionFamily, MissionTemplate } from '../../types/mission-runners';
import type { MissionConfig, MissionParameters, ExecutionSettings } from './MissionConfigPanel';
import type { AgentTeamConfig, AgentInfo } from './AgentTeamSetup';

// =============================================================================
// TYPES
// =============================================================================

/**
 * Single interview question
 */
export interface InterviewQuestion {
  id: string;
  text: string;
  type: 'text' | 'textarea' | 'single_choice' | 'multiple_choice' | 'scale';
  category: 'goal' | 'scope' | 'depth' | 'timeline' | 'constraints' | 'preferences';
  required: boolean;
  placeholder?: string;
  options?: { value: string; label: string; description?: string }[];
  helpText?: string;
  minValue?: number;
  maxValue?: number;
  dependsOn?: string; // Question ID this depends on
}

/**
 * Interview step (group of related questions)
 */
export interface InterviewStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
  questions: InterviewQuestion[];
}

/**
 * User's answers
 */
export type InterviewAnswers = Record<string, string | string[] | number>;

/**
 * AI-generated configuration from interview
 */
export interface GeneratedConfig {
  structuredGoal: string;
  family: MissionFamily;
  templateId?: string;
  parameters: MissionParameters;
  team: AgentTeamConfig;
  executionSettings: ExecutionSettings;
  aiInsights: string[];
  confidence: number;
}

export interface AIInterviewWizardProps {
  /** Initial prompt from user */
  initialPrompt: string;
  /** AI-generated questions (from backend) */
  questions?: InterviewQuestion[];
  /** Called when interview is complete */
  onComplete: (config: MissionConfig) => void;
  /** Called to fetch more questions based on answers */
  onRequestMoreQuestions?: (answers: InterviewAnswers) => Promise<InterviewQuestion[]>;
  /** Called when user wants to skip to manual config */
  onSwitchToExpert?: () => void;
  /** Called when cancelled */
  onCancel?: () => void;
  /** Available agents for team recommendations */
  availableAgents: {
    L2: AgentInfo[];
    L3: AgentInfo[];
    L4: AgentInfo[];
    L5: AgentInfo[];
  };
  /** Available templates */
  templates?: MissionTemplate[];
  /** Loading state */
  isLoading?: boolean;
  /** Custom class names */
  className?: string;
}

// =============================================================================
// DEFAULT QUESTIONS (Used when backend doesn't provide them)
// =============================================================================

const DEFAULT_INTERVIEW_STEPS: InterviewStep[] = [
  {
    id: 'understand',
    title: 'Understanding Your Goal',
    description: "Let's clarify what you want to accomplish",
    icon: <Target className="w-5 h-5" />,
    questions: [
      {
        id: 'primary_objective',
        text: 'What is the main outcome you need from this research?',
        type: 'single_choice',
        category: 'goal',
        required: true,
        options: [
          { value: 'inform_decision', label: 'Inform a decision', description: 'I need data to make a strategic choice' },
          { value: 'create_deliverable', label: 'Create a deliverable', description: 'I need a document, presentation, or report' },
          { value: 'answer_question', label: 'Answer a specific question', description: 'I need to find an answer to something' },
          { value: 'explore_topic', label: 'Explore a topic', description: 'I want to learn more about an area' },
        ],
      },
      {
        id: 'urgency',
        text: 'How urgent is this request?',
        type: 'single_choice',
        category: 'timeline',
        required: true,
        options: [
          { value: 'immediate', label: 'Immediate', description: 'Need it within the hour' },
          { value: 'today', label: 'Today', description: 'Need it by end of day' },
          { value: 'this_week', label: 'This week', description: 'Can wait a few days' },
          { value: 'no_rush', label: 'No rush', description: 'Take the time needed for quality' },
        ],
      },
    ],
  },
  {
    id: 'scope',
    title: 'Defining the Scope',
    description: 'Help us understand the boundaries',
    icon: <Lightbulb className="w-5 h-5" />,
    questions: [
      {
        id: 'depth_preference',
        text: 'What level of depth do you need?',
        type: 'single_choice',
        category: 'depth',
        required: true,
        options: [
          { value: 'overview', label: 'High-level overview', description: 'Key points and summary' },
          { value: 'detailed', label: 'Detailed analysis', description: 'Thorough coverage with evidence' },
          { value: 'exhaustive', label: 'Exhaustive research', description: 'Leave no stone unturned' },
        ],
      },
      {
        id: 'source_preference',
        text: 'What types of sources should we prioritize?',
        type: 'multiple_choice',
        category: 'preferences',
        required: false,
        options: [
          { value: 'peer_reviewed', label: 'Peer-reviewed papers' },
          { value: 'regulatory', label: 'Regulatory documents' },
          { value: 'industry', label: 'Industry reports' },
          { value: 'internal', label: 'Internal data' },
          { value: 'news', label: 'Recent news & updates' },
        ],
      },
      {
        id: 'geographic_focus',
        text: 'Any geographic focus for your research?',
        type: 'text',
        category: 'scope',
        required: false,
        placeholder: 'e.g., US, EU, Global, or specific countries...',
      },
    ],
  },
  {
    id: 'constraints',
    title: 'Constraints & Preferences',
    description: 'Any limitations we should know about?',
    icon: <Users className="w-5 h-5" />,
    questions: [
      {
        id: 'audience',
        text: 'Who is the primary audience for the results?',
        type: 'single_choice',
        category: 'preferences',
        required: false,
        options: [
          { value: 'executive', label: 'Executive leadership', description: 'C-suite, VP level' },
          { value: 'technical', label: 'Technical experts', description: 'Subject matter experts' },
          { value: 'regulatory', label: 'Regulatory teams', description: 'Compliance, submissions' },
          { value: 'cross_functional', label: 'Cross-functional team', description: 'Mixed audience' },
          { value: 'myself', label: 'Just me', description: 'Personal use' },
        ],
      },
      {
        id: 'budget_sensitivity',
        text: 'How cost-sensitive is this project?',
        type: 'single_choice',
        category: 'constraints',
        required: true,
        options: [
          { value: 'low', label: 'Budget is flexible', description: 'Quality is priority' },
          { value: 'medium', label: 'Moderate budget', description: 'Balance cost and quality' },
          { value: 'high', label: 'Budget constrained', description: 'Minimize costs where possible' },
        ],
      },
      {
        id: 'additional_context',
        text: 'Any other context or requirements we should know?',
        type: 'textarea',
        category: 'preferences',
        required: false,
        placeholder: 'Add any additional details that would help us understand your needs better...',
      },
    ],
  },
];

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const stepVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 300 : -300,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: [0.4, 0, 0.2, 1] as const,
    },
  }),
} as const;

  const questionVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.3,
        ease: [0.4, 0, 0.2, 1] as const, // easeOut cubic bezier
      },
    }),
  } as const;

// =============================================================================
// QUESTION RENDERER COMPONENT
// =============================================================================

interface QuestionRendererProps {
  question: InterviewQuestion;
  value: string | string[] | number | undefined;
  onChange: (value: string | string[] | number) => void;
  index: number;
}

function QuestionRenderer({ question, value, onChange, index }: QuestionRendererProps) {
  return (
    <motion.div
      custom={index}
      variants={questionVariants}
      initial="hidden"
      animate="visible"
      className="space-y-3"
    >
      <div className="flex items-start gap-2">
        <MessageSquare className="w-4 h-4 text-amber-600 mt-1 flex-shrink-0" />
        <div>
          <Label className="text-base font-medium text-slate-900">
            {question.text}
            {question.required && <span className="text-red-500 ml-1">*</span>}
          </Label>
          {question.helpText && (
            <p className="text-sm text-slate-500 mt-1">{question.helpText}</p>
          )}
        </div>
      </div>

      <div className="ml-6">
        {/* Text Input */}
        {question.type === 'text' && (
          <Input
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="max-w-md"
          />
        )}

        {/* Textarea Input */}
        {question.type === 'textarea' && (
          <Textarea
            value={(value as string) || ''}
            onChange={(e) => onChange(e.target.value)}
            placeholder={question.placeholder}
            className="min-h-[100px]"
          />
        )}

        {/* Single Choice */}
        {question.type === 'single_choice' && question.options && (
          <RadioGroup
            value={(value as string) || ''}
            onValueChange={(v) => onChange(v)}
            className="space-y-2"
          >
            {question.options.map((option) => (
              <label
                key={option.value}
                className={cn(
                  'flex items-start gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                  value === option.value
                    ? 'border-amber-500 bg-amber-50'
                    : 'border-slate-200 hover:border-amber-300'
                )}
              >
                <RadioGroupItem value={option.value} className="mt-0.5" />
                <div className="flex-1">
                  <span className="font-medium text-slate-900">{option.label}</span>
                  {option.description && (
                    <p className="text-sm text-slate-500">{option.description}</p>
                  )}
                </div>
              </label>
            ))}
          </RadioGroup>
        )}

        {/* Multiple Choice */}
        {question.type === 'multiple_choice' && question.options && (
          <div className="space-y-2">
            {question.options.map((option) => {
              const selectedValues = (value as string[]) || [];
              const isSelected = selectedValues.includes(option.value);
              return (
                <label
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all',
                    isSelected
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-slate-200 hover:border-amber-300'
                  )}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        onChange([...selectedValues, option.value]);
                      } else {
                        onChange(selectedValues.filter((v) => v !== option.value));
                      }
                    }}
                    className="rounded border-slate-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-medium text-slate-900">{option.label}</span>
                </label>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AIInterviewWizard({
  initialPrompt,
  questions: providedQuestions,
  onComplete,
  onRequestMoreQuestions,
  onSwitchToExpert,
  onCancel,
  availableAgents,
  templates,
  isLoading = false,
  className,
}: AIInterviewWizardProps) {
  // Convert provided questions to steps or use defaults
  const [steps] = useState<InterviewStep[]>(() => {
    if (providedQuestions && providedQuestions.length > 0) {
      // Group questions by category into steps
      const grouped: Record<string, InterviewQuestion[]> = {};
      providedQuestions.forEach((q) => {
        if (!grouped[q.category]) {
          grouped[q.category] = [];
        }
        grouped[q.category].push(q);
      });

      return Object.entries(grouped).map(([category, qs], idx) => ({
        id: category,
        title: category.charAt(0).toUpperCase() + category.slice(1).replace('_', ' '),
        description: `Questions about ${category}`,
        icon: <MessageSquare className="w-5 h-5" />,
        questions: qs,
      }));
    }
    return DEFAULT_INTERVIEW_STEPS;
  });

  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [answers, setAnswers] = useState<InterviewAnswers>({});
  const [direction, setDirection] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedConfig, setGeneratedConfig] = useState<GeneratedConfig | null>(null);
  const [showReview, setShowReview] = useState(false);

  const currentStep = steps[currentStepIndex];
  const progress = ((currentStepIndex + 1) / (steps.length + 1)) * 100; // +1 for review step

  // Check if current step is complete
  const isStepComplete = useMemo(() => {
    if (!currentStep) return true;
    return currentStep.questions.every((q) => {
      if (!q.required) return true;
      const answer = answers[q.id];
      if (Array.isArray(answer)) return answer.length > 0;
      return answer !== undefined && answer !== '';
    });
  }, [currentStep, answers]);

  // Handle answer change
  const handleAnswerChange = useCallback((questionId: string, value: string | string[] | number) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  }, []);

  // Navigate to next step
  const handleNext = useCallback(async () => {
    if (currentStepIndex < steps.length - 1) {
      setDirection(1);
      setCurrentStepIndex((i) => i + 1);
    } else {
      // Last step - generate config
      setIsGenerating(true);

      // Simulate AI generation (in production, this calls backend)
      await new Promise((resolve) => setTimeout(resolve, 2000));

      // Generate mock config based on answers
      const mockConfig: GeneratedConfig = generateConfigFromAnswers(answers, initialPrompt, availableAgents);
      setGeneratedConfig(mockConfig);
      setIsGenerating(false);
      setShowReview(true);
    }
  }, [currentStepIndex, steps.length, answers, initialPrompt, availableAgents]);

  // Navigate to previous step
  const handleBack = useCallback(() => {
    if (showReview) {
      setShowReview(false);
    } else if (currentStepIndex > 0) {
      setDirection(-1);
      setCurrentStepIndex((i) => i - 1);
    }
  }, [currentStepIndex, showReview]);

  // Handle final submission
  const handleSubmit = useCallback(() => {
    if (generatedConfig) {
      const config: MissionConfig = {
        structuredGoal: generatedConfig.structuredGoal,
        family: generatedConfig.family,
        templateId: generatedConfig.templateId,
        parameters: generatedConfig.parameters,
        team: generatedConfig.team,
        executionSettings: generatedConfig.executionSettings,
      };
      onComplete(config);
    }
  }, [generatedConfig, onComplete]);

  // Regenerate config
  const handleRegenerate = useCallback(async () => {
    setIsGenerating(true);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    const newConfig = generateConfigFromAnswers(answers, initialPrompt, availableAgents);
    setGeneratedConfig(newConfig);
    setIsGenerating(false);
  }, [answers, initialPrompt, availableAgents]);

  return (
    <div className={cn('flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex-shrink-0 p-6 border-b bg-gradient-to-r from-amber-50 to-white">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
              <Zap className="w-6 h-6 text-amber-600" />
              AI Research Wizard
            </h2>
            <p className="text-slate-600 mt-1">
              {showReview
                ? "Review your AI-generated mission configuration"
                : "Answer a few questions and I'll set everything up for you"}
            </p>
          </div>

          {onSwitchToExpert && (
            <Button variant="outline" size="sm" onClick={onSwitchToExpert}>
              <Edit3 className="w-4 h-4 mr-2" />
              Switch to Expert Mode
            </Button>
          )}
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-600">
              {showReview ? 'Review' : `Step ${currentStepIndex + 1} of ${steps.length}`}
            </span>
            <span className="text-amber-600 font-medium">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Step Indicators */}
        <div className="flex items-center gap-2 mt-4 overflow-x-auto pb-2">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              className={cn(
                'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all',
                idx < currentStepIndex && 'bg-amber-100 text-amber-700',
                idx === currentStepIndex && !showReview && 'bg-amber-600 text-white',
                idx > currentStepIndex && 'bg-slate-100 text-slate-500'
              )}
            >
              {idx < currentStepIndex ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                step.icon
              )}
              <span className="hidden sm:inline">{step.title}</span>
            </div>
          ))}
          <div
            className={cn(
              'flex items-center gap-2 px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all',
              showReview
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-500'
            )}
          >
            <Sparkles className="w-4 h-4" />
            <span className="hidden sm:inline">Review</span>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-auto p-6">
        <AnimatePresence mode="wait" custom={direction}>
          {isGenerating ? (
            // Generating State
            <motion.div
              key="generating"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center h-full py-12"
            >
              <div className="w-20 h-20 rounded-full bg-amber-100 flex items-center justify-center mb-6">
                <Brain className="w-10 h-10 text-amber-600 animate-pulse" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                Analyzing your requirements...
              </h3>
              <p className="text-slate-600 text-center max-w-md">
                I'm configuring the optimal mission based on your answers.
                This will just take a moment.
              </p>
              <div className="flex gap-1 mt-6">
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-amber-600 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </motion.div>
          ) : showReview && generatedConfig ? (
            // Review State
            <motion.div
              key="review"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="max-w-2xl mx-auto space-y-6"
            >
              {/* AI Insights */}
              <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                <h3 className="font-semibold text-amber-900 flex items-center gap-2 mb-3">
                  <Sparkles className="w-5 h-5" />
                  AI Insights
                </h3>
                <ul className="space-y-2">
                  {generatedConfig.aiInsights.map((insight, idx) => (
                    <li key={idx} className="text-sm text-amber-800 flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      {insight}
                    </li>
                  ))}
                </ul>
                <div className="mt-3 pt-3 border-t border-amber-200">
                  <span className="text-sm text-amber-700">
                    Confidence: {Math.round(generatedConfig.confidence * 100)}%
                  </span>
                </div>
              </div>

              {/* Generated Configuration Summary */}
              <div className="space-y-4">
                {/* Goal */}
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Target className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-slate-900">Research Goal</h4>
                  </div>
                  <p className="text-slate-700">{generatedConfig.structuredGoal}</p>
                </div>

                {/* Family & Template */}
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Brain className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-slate-900">Mission Type</h4>
                  </div>
                  <Badge className="bg-purple-100 text-purple-700">
                    {generatedConfig.family.replace('_', ' ')}
                  </Badge>
                  {generatedConfig.templateId && (
                    <span className="ml-2 text-slate-600">
                      using <strong>{generatedConfig.templateId}</strong> template
                    </span>
                  )}
                </div>

                {/* Team */}
                <div className="p-4 bg-white rounded-xl border border-slate-200">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-5 h-5 text-purple-600" />
                    <h4 className="font-semibold text-slate-900">Expert Team</h4>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {generatedConfig.team.primaryAgent && (
                      <Badge variant="outline" className="border-purple-400">
                        Lead: {generatedConfig.team.primaryAgent.name}
                      </Badge>
                    )}
                    {generatedConfig.team.specialists.map((agent) => (
                      <Badge key={agent.id} variant="secondary">
                        {agent.name}
                      </Badge>
                    ))}
                    <span className="text-sm text-slate-500">
                      +{generatedConfig.team.workers.length} workers, {generatedConfig.team.tools.length} tools
                    </span>
                  </div>
                </div>

                {/* Timing & Budget */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-4 h-4 text-slate-500" />
                      <h4 className="font-medium text-slate-700">Estimated Time</h4>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      {generatedConfig.executionSettings.maxDurationMinutes} min
                    </p>
                  </div>
                  <div className="p-4 bg-white rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 mb-1">
                      <Sparkles className="w-4 h-4 text-slate-500" />
                      <h4 className="font-medium text-slate-700">Budget Limit</h4>
                    </div>
                    <p className="text-2xl font-semibold text-slate-900">
                      ${generatedConfig.executionSettings.maxBudget.toFixed(2)}
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : currentStep ? (
            // Question Step
            <motion.div
              key={currentStep.id}
              custom={direction}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              className="max-w-2xl mx-auto"
            >
              {/* Step Header */}
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                    {currentStep.icon}
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{currentStep.title}</h3>
                    <p className="text-slate-600">{currentStep.description}</p>
                  </div>
                </div>
              </div>

              {/* Original Prompt Reference */}
              <div className="p-3 bg-slate-50 rounded-lg mb-6">
                <p className="text-xs text-slate-500 mb-1">Your research request:</p>
                <p className="text-sm text-slate-700 italic line-clamp-2">"{initialPrompt}"</p>
              </div>

              {/* Questions */}
              <div className="space-y-6">
                {currentStep.questions.map((question, idx) => (
                  <QuestionRenderer
                    key={question.id}
                    question={question}
                    value={answers[question.id]}
                    onChange={(value) => handleAnswerChange(question.id, value)}
                    index={idx}
                  />
                ))}
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>

      {/* Footer Actions */}
      <div className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex items-center justify-between">
          <div>
            {(currentStepIndex > 0 || showReview) && (
              <Button
                variant="ghost"
                onClick={handleBack}
                disabled={isGenerating}
              >
                <ChevronLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
            )}
            {onCancel && currentStepIndex === 0 && !showReview && (
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {showReview && (
              <Button
                variant="outline"
                onClick={handleRegenerate}
                disabled={isGenerating}
              >
                <RefreshCw className={cn('w-4 h-4 mr-2', isGenerating && 'animate-spin')} />
                Regenerate
              </Button>
            )}

            {showReview ? (
              <Button
                onClick={handleSubmit}
                disabled={isGenerating}
                className={cn(
                  'px-6 bg-gradient-to-r from-amber-600 to-amber-700',
                  'hover:from-amber-700 hover:to-amber-800',
                  'shadow-lg shadow-amber-500/25'
                )}
              >
                Launch Mission
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isStepComplete || isLoading}
                className={cn(
                  'px-6 bg-gradient-to-r from-amber-600 to-amber-700',
                  'hover:from-amber-700 hover:to-amber-800',
                  'shadow-lg shadow-amber-500/25'
                )}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : currentStepIndex === steps.length - 1 ? (
                  <>
                    Generate Config
                    <Sparkles className="w-4 h-4 ml-2" />
                  </>
                ) : (
                  <>
                    Continue
                    <ChevronRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// HELPER: Generate Config from Answers
// =============================================================================

function generateConfigFromAnswers(
  answers: InterviewAnswers,
  initialPrompt: string,
  availableAgents: { L2: AgentInfo[]; L3: AgentInfo[]; L4: AgentInfo[]; L5: AgentInfo[] }
): GeneratedConfig {
  // Map answers to config (simplified - in production, this is done by backend AI)
  const objective = answers.primary_objective as string;
  const urgency = answers.urgency as string;
  const depth = answers.depth_preference as string;
  const sources = (answers.source_preference as string[]) || ['peer_reviewed'];
  const budgetSensitivity = answers.budget_sensitivity as string;

  // Determine family based on objective
  let family: MissionFamily = 'DEEP_RESEARCH';
  if (objective === 'inform_decision') family = 'STRATEGY';
  else if (objective === 'create_deliverable') family = 'PREPARATION';
  else if (objective === 'answer_question') family = 'GENERIC';
  else if (objective === 'explore_topic') family = 'INVESTIGATION';

  // Determine research depth
  let researchDepth: 'quick' | 'comprehensive' | 'exhaustive' = 'comprehensive';
  if (depth === 'overview' || urgency === 'immediate') researchDepth = 'quick';
  else if (depth === 'exhaustive' && urgency !== 'immediate') researchDepth = 'exhaustive';

  // Map source types
  const sourceTypes = sources.map((s) => {
    const mapping: Record<string, string> = {
      peer_reviewed: 'peer_reviewed',
      regulatory: 'regulatory_docs',
      industry: 'industry_reports',
      internal: 'internal_data',
      news: 'industry_reports',
    };
    return mapping[s] || 'peer_reviewed';
  }) as any[];

  // Determine budget
  let maxBudget = 10;
  if (budgetSensitivity === 'high') maxBudget = 5;
  else if (budgetSensitivity === 'low') maxBudget = 25;

  // Determine duration based on urgency
  let maxDuration = 90;
  if (urgency === 'immediate') maxDuration = 30;
  else if (urgency === 'today') maxDuration = 60;
  else if (urgency === 'no_rush') maxDuration = 180;

  // Select agents
  const primaryAgent = availableAgents.L2[0] || null;
  const specialists = availableAgents.L3.slice(0, depth === 'exhaustive' ? 3 : 2);
  const workers = availableAgents.L4.slice(0, 2);
  const tools = availableAgents.L5.slice(0, 3);

  // Generate AI insights
  const insights: string[] = [];
  if (urgency === 'immediate' || urgency === 'today') {
    insights.push('Prioritizing speed over exhaustive coverage due to time constraints');
  }
  if (depth === 'exhaustive') {
    insights.push('Configured for comprehensive analysis with multiple specialist agents');
  }
  if (budgetSensitivity === 'high') {
    insights.push('Optimized configuration for cost efficiency');
  }
  insights.push(`Selected ${family.toLowerCase().replace('_', ' ')} mission type based on your objective`);
  insights.push(`Assembled team of ${1 + specialists.length + workers.length} agents for optimal coverage`);

  return {
    structuredGoal: initialPrompt,
    family,
    templateId: undefined,
    parameters: {
      focusAreas: [],
      researchDepth,
      sourceTypes,
      maxIterations: researchDepth === 'exhaustive' ? 5 : 3,
      confidenceThreshold: 0.85,
    },
    team: {
      primaryAgent,
      specialists,
      workers,
      tools,
    },
    executionSettings: {
      autonomyLevel: 'semi_autonomous',
      hitlEnabled: true,
      hitlCheckpoints: ['goal_validation', 'results_review'],
      maxBudget,
      maxDurationMinutes: maxDuration,
      enableWebSearch: sources.includes('news'),
      enableRag: true,
    },
    aiInsights: insights,
    confidence: 0.87,
  };
}

export default AIInterviewWizard;

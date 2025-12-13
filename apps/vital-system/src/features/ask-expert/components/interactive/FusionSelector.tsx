'use client';

/**
 * VITAL Platform - FusionSelector Component
 *
 * AI-powered expert selection used by Mode 2 (Smart Copilot) and Mode 4 (Background).
 * User types a query → Fusion Intelligence selects the best expert → continues to workflow.
 *
 * Shared Between:
 * - Mode 2: Query → AI selects expert → Interactive conversation
 * - Mode 4: Query → AI selects expert → Autonomous background execution
 *
 * Features:
 * - Query-first interface with intelligent placeholder suggestions
 * - Animated "thinking" phase while Fusion Intelligence works
 * - Expert selection reveal with confidence score and reasoning
 * - GraphRAG + Vector + Relational hybrid scoring visualization
 *
 * Design System: VITAL Brand v6.0
 * - Mode 2: Blue theme (interactive)
 * - Mode 4: Purple theme (autonomous)
 *
 * Phase 2 Implementation - December 11, 2025
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  Send,
  Users,
  ChevronRight,
  Loader2,
  Target,
  Brain,
  Network,
  Database,
  CheckCircle2,
  Zap,
} from 'lucide-react';

import type { Expert } from './ExpertPicker';

// =============================================================================
// TYPES
// =============================================================================

export type FusionMode = 'mode2' | 'mode4';

export interface FusionEvidence {
  vectorScores: Record<string, number>;
  graphPaths: string[];
  relationalPatterns: Record<string, number>;
  retrievalTimeMs: number;
}

export interface FusionResult {
  selectedExpert: Expert;
  confidence: number;
  reasoning: string;
  evidence: FusionEvidence;
  alternativeExperts?: Array<{
    expert: Expert;
    confidence: number;
  }>;
}

export interface FusionSelectorProps {
  /** Tenant ID for multi-tenant isolation */
  tenantId: string;
  /** Which mode is using this selector */
  mode?: FusionMode;
  /** Called when user submits a query (before selection) */
  onQuerySubmit: (query: string) => void;
  /** Called when expert is selected by Fusion Intelligence */
  onExpertSelected: (expert: Expert) => void;
  /** Called to switch to Mode 1 (manual selection) */
  onModeSwitch?: () => void;
  /** Placeholder suggestions for the input */
  suggestions?: string[];
  /** Custom class names */
  className?: string;
}

type SelectionPhase = 'input' | 'analyzing' | 'selected';

// =============================================================================
// DEFAULT SUGGESTIONS
// =============================================================================

// Categorized example prompts for Mode 2 (Smart Copilot)
// These are generic examples - will be personalized based on user profile later
const DEFAULT_SUGGESTIONS = [
  "What are the latest FDA guidelines for accelerated approval?",
  "Help me analyze this clinical trial protocol",
  "Compare biosimilar vs reference product regulatory pathways",
  "Explain HEOR methodology for market access submissions",
  "Review adverse event reporting requirements for this drug class",
];

// Structured prompt starters with categories for richer display
const EXAMPLE_PROMPTS = [
  {
    category: 'Regulatory',
    icon: '📋',
    prompts: [
      { text: 'FDA accelerated approval requirements', full: 'What are the FDA requirements for accelerated approval of oncology drugs?' },
      { text: 'EMA vs FDA comparison', full: 'Compare EMA and FDA regulatory pathways for biosimilars' },
    ]
  },
  {
    category: 'Clinical',
    icon: '🔬',
    prompts: [
      { text: 'Phase III trial design', full: 'Help me design a Phase III clinical trial protocol for a rare disease' },
      { text: 'Endpoint selection', full: 'What are the best primary endpoints for oncology trials?' },
    ]
  },
  {
    category: 'Market Access',
    icon: '📊',
    prompts: [
      { text: 'HEOR evidence dossier', full: 'What should be included in an HEOR evidence dossier for payer submission?' },
      { text: 'Pricing strategy', full: 'How do I develop a value-based pricing strategy for a specialty drug?' },
    ]
  },
  {
    category: 'Safety',
    icon: '⚠️',
    prompts: [
      { text: 'Adverse event reporting', full: 'Review adverse event reporting requirements for post-market surveillance' },
      { text: 'Risk management', full: 'How do I create a risk management plan for a biologic?' },
    ]
  },
];

// =============================================================================
// THEME CONFIGURATION
// =============================================================================

const THEME_CONFIG: Record<FusionMode, {
  accent: string;
  accentBg: string;
  accentHover: string;
  gradient: string;
  ring: string;
}> = {
  mode2: {
    accent: 'text-blue-600',
    accentBg: 'bg-blue-50',
    accentHover: 'hover:bg-blue-100',
    gradient: 'from-blue-500 to-blue-600',
    ring: 'focus:ring-blue-500',
  },
  mode4: {
    accent: 'text-[var(--ae-accent-primary,#9055E0)]',
    accentBg: 'bg-[var(--ae-accent-light,rgba(144,85,224,0.08))]',
    accentHover: 'hover:bg-[var(--ae-accent-light,rgba(144,85,224,0.12))]',
    gradient: 'from-[#9055E0] to-[#7C3AED]',
    ring: 'focus:ring-[var(--ae-accent-primary,#9055E0)]',
  },
};

// =============================================================================
// COMPONENT
// =============================================================================

export function FusionSelector({
  tenantId,
  mode = 'mode2',
  onQuerySubmit,
  onExpertSelected,
  onModeSwitch,
  suggestions = DEFAULT_SUGGESTIONS,
  className,
}: FusionSelectorProps) {
  // =========================================================================
  // STATE
  // =========================================================================

  const [query, setQuery] = useState('');
  const [phase, setPhase] = useState<SelectionPhase>('input');
  const [fusionResult, setFusionResult] = useState<FusionResult | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState('');

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const theme = THEME_CONFIG[mode];

  // =========================================================================
  // EFFECTS
  // =========================================================================

  // Auto-focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Simulate fusion analysis phases (will be replaced by real SSE events)
  useEffect(() => {
    if (phase !== 'analyzing') return;

    const steps = [
      { progress: 15, message: 'Analyzing query intent...' },
      { progress: 35, message: 'Searching vector embeddings...' },
      { progress: 55, message: 'Traversing knowledge graph...' },
      { progress: 75, message: 'Matching expert capabilities...' },
      { progress: 90, message: 'Calculating confidence scores...' },
      { progress: 100, message: 'Expert selected!' },
    ];

    let stepIndex = 0;
    const interval = setInterval(() => {
      if (stepIndex < steps.length) {
        setAnalyzeProgress(steps[stepIndex].progress);
        setCurrentStep(steps[stepIndex].message);
        stepIndex++;
      } else {
        clearInterval(interval);
        // Transition to selected phase (in real impl, this comes from SSE)
        setTimeout(() => setPhase('selected'), 500);
      }
    }, 600);

    return () => clearInterval(interval);
  }, [phase]);

  // =========================================================================
  // HANDLERS
  // =========================================================================

  const handleSubmit = useCallback(() => {
    if (!query.trim()) return;

    // Start analysis phase
    setPhase('analyzing');
    setAnalyzeProgress(0);

    // Notify parent
    onQuerySubmit(query);

    // In real implementation, Fusion Intelligence results come via SSE
    // For now, simulate a result after analysis completes
    setTimeout(() => {
      const mockResult: FusionResult = {
        selectedExpert: {
          id: 'expert-regulatory-001',
          name: 'Regulatory Strategy Advisor',
          slug: 'regulatory-strategy-advisor',
          tagline: 'FDA & EMA regulatory pathway expert',
          level: 'L2',
          domain: 'Regulatory Affairs',
          department: 'Regulatory',
          expertise: ['FDA Guidelines', 'EMA Compliance', 'Accelerated Approval'],
          status: 'active',
        },
        confidence: 0.94,
        reasoning: 'Based on your query about FDA guidelines and accelerated approval, this expert has deep expertise in regulatory pathways and has handled similar cases with 95% success rate.',
        evidence: {
          vectorScores: { 'regulatory-strategy-advisor': 0.92, 'compliance-expert': 0.78 },
          graphPaths: ['Query → FDA → Accelerated Approval → Regulatory Strategy'],
          relationalPatterns: { 'domain_match': 0.95, 'expertise_overlap': 0.89 },
          retrievalTimeMs: 245,
        },
      };
      setFusionResult(mockResult);
    }, 3600); // After animation completes
  }, [query, onQuerySubmit]);

  const handleSuggestionClick = useCallback((suggestion: string) => {
    setQuery(suggestion);
    textareaRef.current?.focus();
  }, []);

  const handleConfirmSelection = useCallback(() => {
    if (fusionResult?.selectedExpert) {
      onExpertSelected(fusionResult.selectedExpert);
    }
  }, [fusionResult, onExpertSelected]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  }, [handleSubmit]);

  // =========================================================================
  // RENDER
  // =========================================================================

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <AnimatePresence mode="wait">
        {/* ═══════════════════════════════════════════════════════════════
            INPUT PHASE - Query entry with suggestions
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'input' && (
          <motion.div
            key="input"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            {/* Header */}
            <div className="text-center mb-8">
              <div className={cn(
                'w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center',
                `bg-gradient-to-br ${theme.gradient}`
              )}>
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                {mode === 'mode2' ? 'Smart Copilot' : 'Background Task'}
              </h1>
              <p className="text-slate-600 max-w-md">
                Describe what you need help with. Our AI will find the perfect expert for you.
              </p>
            </div>

            {/* Query Input */}
            <div className="w-full max-w-2xl">
              <div className="relative">
                <Textarea
                  ref={textareaRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="What would you like help with today?"
                  className={cn(
                    'min-h-[120px] pr-14 text-lg resize-none',
                    theme.ring
                  )}
                />
                <Button
                  onClick={handleSubmit}
                  disabled={!query.trim()}
                  className={cn(
                    'absolute bottom-3 right-3',
                    `bg-gradient-to-r ${theme.gradient}`,
                    'hover:opacity-90'
                  )}
                  size="icon"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>

              {/* Categorized Example Prompts */}
              <div className="mt-8">
                <p className="text-sm text-slate-500 mb-4 text-center">Try asking about:</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {EXAMPLE_PROMPTS.map((category, catIdx) => (
                    <div
                      key={catIdx}
                      className={cn(
                        'p-4 rounded-xl border bg-white/60 backdrop-blur-sm',
                        'hover:border-blue-200 hover:bg-blue-50/30 transition-colors'
                      )}
                    >
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-lg">{category.icon}</span>
                        <span className="text-sm font-medium text-slate-700">{category.category}</span>
                      </div>
                      <div className="space-y-2">
                        {category.prompts.map((prompt, promptIdx) => (
                          <button
                            key={promptIdx}
                            onClick={() => handleSuggestionClick(prompt.full)}
                            className={cn(
                              'w-full text-left text-sm px-3 py-2 rounded-lg',
                              'transition-all duration-200',
                              'hover:bg-blue-100 hover:text-blue-700',
                              'text-slate-600 bg-slate-50/80'
                            )}
                          >
                            {prompt.text}
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mode Switch */}
              {onModeSwitch && (
                <div className="text-center mt-8">
                  <Button
                    variant="ghost"
                    onClick={onModeSwitch}
                    className="text-slate-500 hover:text-slate-700"
                  >
                    <Users className="h-4 w-4 mr-2" />
                    Or choose an expert manually
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            ANALYZING PHASE - Fusion Intelligence working
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'analyzing' && (
          <motion.div
            key="analyzing"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="text-center max-w-md">
              {/* Animated Brain Icon */}
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
                className={cn(
                  'w-20 h-20 rounded-2xl mx-auto mb-6 flex items-center justify-center',
                  `bg-gradient-to-br ${theme.gradient}`
                )}
              >
                <Brain className="h-10 w-10 text-white" />
              </motion.div>

              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                Fusion Intelligence Working
              </h2>

              <p className={cn('text-sm mb-6', theme.accent)}>
                {currentStep}
              </p>

              {/* Progress Indicators */}
              <div className="space-y-4">
                {/* Progress Bar */}
                <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                  <motion.div
                    className={cn('h-full rounded-full', `bg-gradient-to-r ${theme.gradient}`)}
                    initial={{ width: 0 }}
                    animate={{ width: `${analyzeProgress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {/* Analysis Steps */}
                <div className="flex justify-center gap-6 text-sm text-slate-500">
                  <AnalysisStep
                    icon={Database}
                    label="Vector"
                    active={analyzeProgress >= 35}
                    complete={analyzeProgress >= 55}
                    theme={theme}
                  />
                  <AnalysisStep
                    icon={Network}
                    label="Graph"
                    active={analyzeProgress >= 55}
                    complete={analyzeProgress >= 75}
                    theme={theme}
                  />
                  <AnalysisStep
                    icon={Target}
                    label="Match"
                    active={analyzeProgress >= 75}
                    complete={analyzeProgress >= 100}
                    theme={theme}
                  />
                </div>
              </div>

              {/* Query Preview */}
              <div className={cn('mt-8 p-4 rounded-lg', theme.accentBg)}>
                <p className="text-sm text-slate-600 italic">"{query}"</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            SELECTED PHASE - Expert found, show result
            ═══════════════════════════════════════════════════════════════ */}
        {phase === 'selected' && fusionResult && (
          <motion.div
            key="selected"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex-1 flex flex-col items-center justify-center p-8"
          >
            <div className="max-w-lg w-full">
              {/* Success Header */}
              <div className="text-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 10 }}
                  className="w-16 h-16 rounded-full bg-green-100 mx-auto mb-4 flex items-center justify-center"
                >
                  <CheckCircle2 className="h-8 w-8 text-green-600" />
                </motion.div>
                <h2 className="text-xl font-semibold text-slate-900">
                  Expert Selected
                </h2>
                <p className="text-sm text-slate-500 mt-1">
                  Based on your query, we've found the perfect match
                </p>
              </div>

              {/* Expert Card */}
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="p-6 rounded-xl border-2 border-green-200 bg-green-50/50 mb-6"
              >
                <div className="flex items-start gap-4">
                  {/* Avatar */}
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white font-semibold text-xl shrink-0">
                    {fusionResult.selectedExpert.name.charAt(0)}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-slate-900">
                        {fusionResult.selectedExpert.name}
                      </h3>
                      <Badge className="bg-green-100 text-green-700 text-xs">
                        {Math.round(fusionResult.confidence * 100)}% match
                      </Badge>
                    </div>

                    {fusionResult.selectedExpert.tagline && (
                      <p className="text-sm text-slate-600 mb-2">
                        {fusionResult.selectedExpert.tagline}
                      </p>
                    )}

                    {/* Expertise Tags */}
                    {fusionResult.selectedExpert.expertise && (
                      <div className="flex flex-wrap gap-1 mb-3">
                        {fusionResult.selectedExpert.expertise.slice(0, 4).map((skill, idx) => (
                          <span
                            key={idx}
                            className="text-xs px-2 py-0.5 rounded-full bg-white text-slate-600"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reasoning */}
                    <p className="text-sm text-slate-600 italic">
                      "{fusionResult.reasoning}"
                    </p>
                  </div>
                </div>

                {/* Evidence Summary */}
                <div className="mt-4 pt-4 border-t border-green-200 flex items-center gap-4 text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    {fusionResult.evidence.retrievalTimeMs}ms
                  </span>
                  <span className="flex items-center gap-1">
                    <Network className="h-3 w-3" />
                    {fusionResult.evidence.graphPaths.length} paths
                  </span>
                  <span className="flex items-center gap-1">
                    <Database className="h-3 w-3" />
                    {Object.keys(fusionResult.evidence.vectorScores).length} candidates
                  </span>
                </div>
              </motion.div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => {
                    setPhase('input');
                    setFusionResult(null);
                  }}
                  className="flex-1"
                >
                  Try Different Query
                </Button>
                <Button
                  onClick={handleConfirmSelection}
                  className={cn(
                    'flex-1',
                    `bg-gradient-to-r ${theme.gradient}`,
                    'hover:opacity-90'
                  )}
                >
                  {mode === 'mode2' ? 'Start Conversation' : 'Start Task'}
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface AnalysisStepProps {
  icon: typeof Database;
  label: string;
  active: boolean;
  complete: boolean;
  theme: typeof THEME_CONFIG.mode2;
}

function AnalysisStep({ icon: Icon, label, active, complete, theme }: AnalysisStepProps) {
  return (
    <div className={cn(
      'flex items-center gap-1.5 transition-colors',
      complete ? theme.accent : active ? 'text-slate-700' : 'text-slate-400'
    )}>
      {complete ? (
        <CheckCircle2 className="h-4 w-4" />
      ) : active ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Icon className="h-4 w-4" />
      )}
      <span>{label}</span>
    </div>
  );
}

export default FusionSelector;

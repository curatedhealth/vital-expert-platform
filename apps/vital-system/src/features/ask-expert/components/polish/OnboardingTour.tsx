'use client';

/**
 * VITAL Platform - Onboarding Tour Component
 *
 * Provides guided onboarding for new users of the Ask Expert service.
 * Features step-by-step tooltips, highlights, and progress tracking.
 *
 * Design System: VITAL Brand v6.0
 * December 11, 2025
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sparkles,
  MessageSquare,
  Rocket,
  Settings,
  HelpCircle,
  Target,
  Users,
  Zap,
  BookOpen,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

export type TourStepPosition =
  | 'top'
  | 'bottom'
  | 'left'
  | 'right'
  | 'top-left'
  | 'top-right'
  | 'bottom-left'
  | 'bottom-right'
  | 'center';

export interface TourStep {
  id: string;
  title: string;
  description: string;
  /** CSS selector for the target element */
  target?: string;
  /** Position of the tooltip relative to target */
  position?: TourStepPosition;
  /** Icon to display */
  icon?: React.ReactNode;
  /** Action buttons */
  actions?: TourAction[];
  /** Whether to highlight the target element */
  highlight?: boolean;
  /** Custom content to render */
  content?: React.ReactNode;
  /** Callback when step is shown */
  onShow?: () => void;
  /** Callback when step is completed */
  onComplete?: () => void;
}

export interface TourAction {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary';
}

export interface OnboardingTourContextValue {
  isActive: boolean;
  currentStep: number;
  totalSteps: number;
  currentStepData: TourStep | null;
  startTour: () => void;
  endTour: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  hasSeenTour: boolean;
  markTourAsSeen: () => void;
}

// =============================================================================
// CONTEXT
// =============================================================================

const OnboardingTourContext = createContext<OnboardingTourContextValue | null>(null);

export function useOnboardingTour() {
  const context = useContext(OnboardingTourContext);
  if (!context) {
    throw new Error('useOnboardingTour must be used within OnboardingTourProvider');
  }
  return context;
}

// =============================================================================
// DEFAULT TOUR STEPS
// =============================================================================

const DEFAULT_TOUR_STEPS: TourStep[] = [
  {
    id: 'welcome',
    title: 'Welcome to Ask Expert',
    description:
      'Your AI-powered assistant for pharmaceutical expertise. Let me show you around the key features.',
    icon: <Sparkles className="w-6 h-6" />,
    position: 'center',
    highlight: false,
  },
  {
    id: 'interactive-mode',
    title: 'Interactive Mode',
    description:
      'Have real-time conversations with AI experts. Perfect for quick questions and iterative discussions.',
    target: '[data-tour="interactive-mode"]',
    icon: <MessageSquare className="w-6 h-6" />,
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'autonomous-mode',
    title: 'Autonomous Mode',
    description:
      'Launch deep research missions that run autonomously. Ideal for complex analysis and comprehensive reports.',
    target: '[data-tour="autonomous-mode"]',
    icon: <Rocket className="w-6 h-6" />,
    position: 'bottom',
    highlight: true,
  },
  {
    id: 'expert-selection',
    title: 'Choose Your Expert',
    description:
      'Select from specialized AI agents covering regulatory, clinical, market access, and more domains.',
    target: '[data-tour="expert-selection"]',
    icon: <Users className="w-6 h-6" />,
    position: 'right',
    highlight: true,
  },
  {
    id: 'mission-templates',
    title: 'Mission Templates',
    description:
      'Start with pre-configured templates for common research tasks. Customize duration, budget, and scope.',
    target: '[data-tour="mission-templates"]',
    icon: <Target className="w-6 h-6" />,
    position: 'left',
    highlight: true,
  },
  {
    id: 'hitl-controls',
    title: 'Human-in-the-Loop',
    description:
      'Stay in control with approval checkpoints. Review and modify AI decisions at key stages.',
    target: '[data-tour="hitl-controls"]',
    icon: <Zap className="w-6 h-6" />,
    position: 'top',
    highlight: true,
  },
  {
    id: 'artifacts',
    title: 'Artifacts & Downloads',
    description:
      'View, preview, and download generated documents in multiple formats. Track version history.',
    target: '[data-tour="artifacts"]',
    icon: <BookOpen className="w-6 h-6" />,
    position: 'left',
    highlight: true,
  },
  {
    id: 'complete',
    title: "You're Ready!",
    description:
      "You now know the essentials. Start exploring and don't hesitate to use the help menu for more guidance.",
    icon: <Check className="w-6 h-6" />,
    position: 'center',
    highlight: false,
  },
];

// =============================================================================
// STORAGE KEY
// =============================================================================

const TOUR_SEEN_KEY = 'vital-ask-expert-tour-seen';

// =============================================================================
// PROVIDER COMPONENT
// =============================================================================

export interface OnboardingTourProviderProps {
  children: React.ReactNode;
  /** Custom tour steps (defaults to built-in tour) */
  steps?: TourStep[];
  /** Auto-start tour for new users */
  autoStart?: boolean;
  /** Callback when tour completes */
  onComplete?: () => void;
}

export function OnboardingTourProvider({
  children,
  steps = DEFAULT_TOUR_STEPS,
  autoStart = true,
  onComplete,
}: OnboardingTourProviderProps) {
  const [isActive, setIsActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [hasSeenTour, setHasSeenTour] = useState(true); // Default true to prevent flash

  // Check if user has seen the tour
  useEffect(() => {
    const seen = localStorage.getItem(TOUR_SEEN_KEY);
    setHasSeenTour(seen === 'true');

    // Auto-start for new users
    if (autoStart && seen !== 'true') {
      // Delay to allow page to render
      const timer = setTimeout(() => setIsActive(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [autoStart]);

  const startTour = useCallback(() => {
    setCurrentStep(0);
    setIsActive(true);
  }, []);

  const endTour = useCallback(() => {
    setIsActive(false);
    setCurrentStep(0);
  }, []);

  const markTourAsSeen = useCallback(() => {
    localStorage.setItem(TOUR_SEEN_KEY, 'true');
    setHasSeenTour(true);
  }, []);

  const nextStep = useCallback(() => {
    if (currentStep < steps.length - 1) {
      steps[currentStep]?.onComplete?.();
      setCurrentStep((prev) => prev + 1);
    } else {
      // Complete tour
      steps[currentStep]?.onComplete?.();
      markTourAsSeen();
      setIsActive(false);
      onComplete?.();
    }
  }, [currentStep, steps, markTourAsSeen, onComplete]);

  const prevStep = useCallback(() => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  }, [currentStep]);

  const goToStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < steps.length) {
        setCurrentStep(index);
      }
    },
    [steps.length]
  );

  // Trigger onShow callback when step changes
  useEffect(() => {
    if (isActive && steps[currentStep]) {
      steps[currentStep].onShow?.();
    }
  }, [isActive, currentStep, steps]);

  const value: OnboardingTourContextValue = {
    isActive,
    currentStep,
    totalSteps: steps.length,
    currentStepData: steps[currentStep] || null,
    startTour,
    endTour,
    nextStep,
    prevStep,
    goToStep,
    hasSeenTour,
    markTourAsSeen,
  };

  return (
    <OnboardingTourContext.Provider value={value}>
      {children}
      <TourOverlay steps={steps} />
    </OnboardingTourContext.Provider>
  );
}

// =============================================================================
// TOUR OVERLAY COMPONENT
// =============================================================================

interface TourOverlayProps {
  steps: TourStep[];
}

function TourOverlay({ steps }: TourOverlayProps) {
  const { isActive, currentStep, nextStep, prevStep, endTour, totalSteps } =
    useOnboardingTour();
  const step = steps[currentStep];
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  // Find target element
  useEffect(() => {
    if (!isActive || !step?.target) {
      setTargetRect(null);
      return;
    }

    const element = document.querySelector(step.target);
    if (element) {
      const rect = element.getBoundingClientRect();
      setTargetRect(rect);

      // Scroll into view if needed
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [isActive, step?.target]);

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetRect || step?.position === 'center') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const padding = 16;
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    switch (step?.position) {
      case 'top':
        return {
          top: targetRect.top - tooltipHeight - padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case 'bottom':
        return {
          top: targetRect.bottom + padding,
          left: targetRect.left + targetRect.width / 2 - tooltipWidth / 2,
        };
      case 'left':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.left - tooltipWidth - padding,
        };
      case 'right':
        return {
          top: targetRect.top + targetRect.height / 2 - tooltipHeight / 2,
          left: targetRect.right + padding,
        };
      default:
        return {
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        };
    }
  };

  return (
    <AnimatePresence>
      {isActive && step && (
        <>
          {/* Backdrop with spotlight */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100]"
            style={{
              background: targetRect && step.highlight
                ? `radial-gradient(ellipse ${targetRect.width + 40}px ${targetRect.height + 40}px at ${
                    targetRect.left + targetRect.width / 2
                  }px ${targetRect.top + targetRect.height / 2}px, transparent 0%, rgba(0,0,0,0.75) 100%)`
                : 'rgba(0,0,0,0.75)',
            }}
            onClick={endTour}
          />

          {/* Highlight ring around target */}
          {targetRect && step.highlight && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="fixed z-[101] pointer-events-none"
              style={{
                top: targetRect.top - 4,
                left: targetRect.left - 4,
                width: targetRect.width + 8,
                height: targetRect.height + 8,
                borderRadius: 8,
                boxShadow: '0 0 0 4px rgba(147, 51, 234, 0.5), 0 0 20px rgba(147, 51, 234, 0.3)',
              }}
            />
          )}

          {/* Tooltip */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed z-[102] w-80"
            style={getTooltipPosition()}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-white rounded-xl shadow-2xl border overflow-hidden">
              {/* Header */}
              <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white">
                <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0">
                  {step.icon || <Sparkles className="w-5 h-5" />}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{step.title}</h3>
                  <p className="text-sm text-white/80 mt-0.5">{step.description}</p>
                </div>
                <button
                  onClick={endTour}
                  className="p-1 hover:bg-white/20 rounded transition-colors flex-shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Custom content */}
              {step.content && <div className="p-4 border-t">{step.content}</div>}

              {/* Footer */}
              <div className="flex items-center justify-between p-3 bg-slate-50 border-t">
                {/* Progress dots */}
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalSteps }).map((_, i) => (
                    <div
                      key={i}
                      className={cn(
                        'w-2 h-2 rounded-full transition-colors',
                        i === currentStep
                          ? 'bg-purple-600'
                          : i < currentStep
                          ? 'bg-purple-300'
                          : 'bg-slate-300'
                      )}
                    />
                  ))}
                </div>

                {/* Navigation buttons */}
                <div className="flex items-center gap-2">
                  {currentStep > 0 && (
                    <button
                      onClick={prevStep}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Back
                    </button>
                  )}
                  <button
                    onClick={nextStep}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition-colors"
                  >
                    {currentStep === totalSteps - 1 ? (
                      <>
                        Finish
                        <Check className="w-4 h-4" />
                      </>
                    ) : (
                      <>
                        Next
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

// =============================================================================
// START TOUR BUTTON
// =============================================================================

export interface StartTourButtonProps {
  className?: string;
  variant?: 'button' | 'icon' | 'link';
}

export function StartTourButton({ className, variant = 'button' }: StartTourButtonProps) {
  const { startTour } = useOnboardingTour();

  if (variant === 'icon') {
    return (
      <button
        onClick={startTour}
        className={cn(
          'p-2 text-slate-500 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors',
          className
        )}
        title="Start tour"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    );
  }

  if (variant === 'link') {
    return (
      <button
        onClick={startTour}
        className={cn(
          'text-sm text-purple-600 hover:text-purple-700 hover:underline',
          className
        )}
      >
        Take a tour
      </button>
    );
  }

  return (
    <button
      onClick={startTour}
      className={cn(
        'flex items-center gap-2 px-4 py-2 text-sm font-medium',
        'text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors',
        className
      )}
    >
      <HelpCircle className="w-4 h-4" />
      Take a Tour
    </button>
  );
}

// =============================================================================
// TOUR TARGET MARKER
// =============================================================================

export interface TourTargetProps {
  id: string;
  children: React.ReactNode;
  className?: string;
}

export function TourTarget({ id, children, className }: TourTargetProps) {
  return (
    <div data-tour={id} className={className}>
      {children}
    </div>
  );
}

export default OnboardingTourProvider;

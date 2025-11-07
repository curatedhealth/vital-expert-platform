'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Zap,
  Target,
  MessageCircle,
  BrainCircuit,
  User,
  Sparkles,
  ChevronRight,
  ChevronLeft,
  X,
  CheckCircle2,
  Search,
  Settings2,
  BookOpen,
  Lightbulb,
  HelpCircle,
  Info,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  content: React.ReactNode;
}

interface ModeDetails {
  id: string;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  description: string;
  expertSelection: 'manual' | 'automatic';
  conversationType: 'one-shot' | 'multi-turn';
  features: string[];
  bestFor: string[];
  example: string;
  requiresAgentSelection: boolean;
  supportsHistory: boolean;
  supportsCheckpoints: boolean;
  supportsWorkflows: boolean;
  avgResponseTime: string;
}

interface FeatureDetails {
  icon: React.ReactNode;
  title: string;
  description: string;
  plainExplanation: string;
  modes: string[];
}

// ============================================================================
// MODE CONFIGURATIONS
// ============================================================================

const MODES: ModeDetails[] = [
  {
    id: 'mode-1',
    title: 'Mode 1: Manual Expert Selection',
    subtitle: 'Choose Your Expert, Get a Quick Answer',
    icon: <Target className="h-6 w-6" />,
    color: 'text-blue-600',
    gradient: 'from-blue-500 to-cyan-500',
    description: 'You pick the expert you trust, ask your question, and get a focused answer right away. Perfect when you know exactly who you need to talk to. This mode gives you direct access to a specific expert\'s knowledge, ensuring you get answers tailored to their unique expertise and perspective.',
    expertSelection: 'manual',
    conversationType: 'one-shot',
    features: [
      'You pick the expert',
      'One question, one answer',
      'Expert specializes in your topic',
      'Same expert every time',
    ],
    bestFor: [
      'You know which expert to ask',
      'Quick, specific questions',
      'When you need expert-specific knowledge',
      'Fast answers without back-and-forth',
    ],
    example: '"What are FDA requirements for my medical device?" → You choose "Regulatory Expert" → Get instant answer',
    requiresAgentSelection: true,
    supportsHistory: false,
    supportsCheckpoints: false,
    supportsWorkflows: false,
    avgResponseTime: '15-30 sec',
  },
  {
    id: 'mode-2',
    title: 'Mode 2: Automatic Expert Selection',
    subtitle: 'Ask Your Question, We Find the Right Expert',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    description: 'Just ask your question naturally. Our AI finds the perfect expert automatically, so you get the right answer without guessing who to ask. Great for when you\'re exploring new topics or not sure which expert specializes in your question. The AI analyzes your question and matches it with the most qualified expert.',
    expertSelection: 'automatic',
    conversationType: 'one-shot',
    features: [
      'AI finds the best expert',
      'One question, one answer',
      'Searches all experts automatically',
      'Smart expert matching',
    ],
    bestFor: [
      'You\'re not sure which expert to ask',
      'General healthcare questions',
      'Exploring new topics',
      'Quick answers without research',
    ],
    example: '"What are best practices for clinical trials?" → AI picks "Clinical Trials Expert" → Get expert answer',
    requiresAgentSelection: false,
    supportsHistory: false,
    supportsCheckpoints: false,
    supportsWorkflows: false,
    avgResponseTime: '20-40 sec',
  },
  {
    id: 'mode-3',
    title: 'Mode 3: Manual Autonomous',
    subtitle: 'Deep Conversation with Your Expert + AI Assistant',
    icon: <BrainCircuit className="h-6 w-6" />,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
    description: 'Pick your expert, then have a real conversation. The AI can think through problems step-by-step, do research, and even create documents—all while you stay in control with checkpoints. Perfect for complex projects where you need deep expertise from one specialist. The AI acts as an intelligent assistant, breaking down tasks, researching, planning, and executing—but always asking for your approval before taking major actions.',
    expertSelection: 'manual',
    conversationType: 'multi-turn',
    features: [
      'You choose your expert',
      'Back-and-forth conversation',
      'AI thinks through problems step-by-step',
      'You approve actions before they happen',
      'Can handle complex, multi-step tasks',
      'Can use tools like web search and calculators',
    ],
    bestFor: [
      'Complex projects needing one expert',
      'Multi-step tasks and research',
      'Creating documents or reports',
      'When you need control and approval',
      'Long-term projects with the same expert',
    ],
    example: '"Help me create a regulatory submission plan" → You pick expert → AI plans, researches, drafts → You approve each step',
    requiresAgentSelection: true,
    supportsHistory: true,
    supportsCheckpoints: true,
    supportsWorkflows: true,
    avgResponseTime: '45-90 sec per turn',
  },
  {
    id: 'mode-4',
    title: 'Mode 4: Automatic Autonomous',
    subtitle: 'AI Brings Together Multiple Experts Automatically',
    icon: <MessageCircle className="h-6 w-6" />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    description: 'Ask a complex question, and watch as AI brings in different experts as needed. Like having a team meeting where the right person speaks up at the right time. This mode is ideal for projects that need multiple perspectives or expertise across different domains. The AI intelligently switches between experts, bringing in the right specialist when their knowledge is needed, creating a seamless multi-expert consultation.',
    expertSelection: 'automatic',
    conversationType: 'multi-turn',
    features: [
      'AI brings in experts automatically',
      'Back-and-forth conversation',
      'AI thinks through problems step-by-step',
      'You approve actions before they happen',
      'Can handle complex, multi-step tasks',
      'Searches across all expert knowledge',
    ],
    bestFor: [
      'Complex questions needing multiple perspectives',
      'Strategic planning across different areas',
      'Research spanning multiple domains',
      'Projects that need different experts',
      'When you want the best team automatically',
    ],
    example: '"Design a regulatory strategy" → AI brings in Regulatory Expert, then Clinical Expert, then Market Access Expert → You approve each step',
    requiresAgentSelection: false,
    supportsHistory: true,
    supportsCheckpoints: true,
    supportsWorkflows: true,
    avgResponseTime: '60-120 sec per turn',
  },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

interface AskExpertOnboardingProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  onComplete?: () => void;
}

export function AskExpertOnboarding({
  open: controlledOpen,
  onOpenChange,
  onComplete,
}: AskExpertOnboardingProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  // Use controlled or internal state
  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Check if user has seen onboarding
  useEffect(() => {
    const seen = localStorage.getItem('ask-expert-onboarding-seen');
    if (!seen && controlledOpen === undefined) {
      setInternalOpen(true);
    }
    setHasSeenOnboarding(!!seen);
  }, [controlledOpen]);

  // Onboarding steps
  const steps: OnboardingStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Ask Expert',
      description: 'Your AI-powered expert consultation platform',
      content: <WelcomeStep />,
    },
    {
      id: 'modes',
      title: 'Choose Your Mode',
      description: '4 powerful ways to consult with AI experts',
      content: <ModesOverviewStep onModeSelect={setSelectedMode} />,
    },
    {
      id: 'features',
      title: 'Powerful Features',
      description: 'Tools to enhance your consultations',
      content: <FeaturesStep />,
    },
    {
      id: 'get-started',
      title: 'Ready to Begin?',
      description: 'Start your first consultation',
      content: <GetStartedStep selectedMode={selectedMode} />,
    },
  ];

  const currentStepData = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSkip = () => {
    localStorage.setItem('ask-expert-onboarding-seen', 'true');
    setOpen(false);
    onComplete?.();
  };

  const handleComplete = () => {
    localStorage.setItem('ask-expert-onboarding-seen', 'true');
    setOpen(false);
    onComplete?.();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 p-6 text-white flex-shrink-0"
        >
          <button
            onClick={handleSkip}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white">
              {currentStepData.title}
            </DialogTitle>
            <DialogDescription className="text-white/90">
              {currentStepData.description}
            </DialogDescription>
          </DialogHeader>
          
          {/* Progress indicator */}
          <div className="mt-4 flex gap-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`h-1 flex-1 rounded-full transition-all ${
                  index <= currentStep ? 'bg-white' : 'bg-white/30'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Content */}
        <motion.div 
          key={currentStep}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="p-6 overflow-y-auto flex-1 min-h-0"
          style={{ maxHeight: 'calc(90vh - 280px)' }}
        >
          {currentStepData.content}
        </motion.div>

        {/* Footer */}
        <DialogFooter className="border-t p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button
            variant="ghost"
            onClick={handleSkip}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
          >
            Skip Tour
          </Button>
          
          <div className="flex gap-2">
            {currentStep > 0 && (
              <Button variant="outline" onClick={handlePrevious}>
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <Button onClick={handleNext}>
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started
                <Sparkles className="h-4 w-4 ml-1" />
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// STEP COMPONENTS
// ============================================================================

function WelcomeStep() {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-6 text-center"
    >
      <motion.div 
        className="flex justify-center"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-2xl opacity-20 animate-pulse" />
          <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 p-8 rounded-full">
            <BrainCircuit className="h-16 w-16 text-white" />
          </div>
        </div>
      </motion.div>

      <div className="space-y-2">
        <h3 className="text-2xl font-bold">Transform Decision-Making with AI Experts</h3>
        <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
          Access specialized AI experts across industries and domains—from regulatory affairs and clinical development 
          to market access, finance, technology, and more. Get instant, expert-level consultations powered by cutting-edge AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
        {[
          {
            icon: <Zap className="h-8 w-8 text-blue-600 dark:text-blue-400" />,
            title: 'Lightning Fast',
            description: 'Get expert answers in seconds, not days',
            bgColor: 'bg-blue-50 dark:bg-blue-900/20',
          },
          {
            icon: <Target className="h-8 w-8 text-purple-600 dark:text-purple-400" />,
            title: 'Precision Expertise',
            description: 'Domain-specific knowledge across industries',
            bgColor: 'bg-purple-50 dark:bg-purple-900/20',
          },
          {
            icon: <CheckCircle2 className="h-8 w-8 text-pink-600 dark:text-pink-400" />,
            title: 'Trusted & Compliant',
            description: 'Enterprise-grade security and compliance standards',
            bgColor: 'bg-pink-50 dark:bg-pink-900/20',
          },
        ].map((feature, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className={`p-4 ${feature.bgColor} rounded-lg hover:shadow-lg transition-shadow`}
          >
            <div className="flex justify-center mb-3">
              {feature.icon}
            </div>
            <h4 className="font-semibold mb-2">{feature.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}

function ModesOverviewStep({ onModeSelect }: { onModeSelect: (mode: string) => void }) {
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedModeId, setSelectedModeId] = useState<string | null>(null);

  const handleModeClick = (modeId: string) => {
    setSelectedModeId(modeId);
    onModeSelect(modeId);
  };

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Quick Overview</TabsTrigger>
          <TabsTrigger value="detailed">Detailed Comparison</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {MODES.map((mode, index) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ModeCard 
                  mode={mode} 
                  isSelected={selectedModeId === mode.id}
                  onClick={() => handleModeClick(mode.id)} 
                />
              </motion.div>
            ))}
          </div>
          <AnimatePresence>
            {selectedModeId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg"
              >
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">
                      Mode Selected
                    </p>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      {MODES.find(m => m.id === selectedModeId)?.title} - {MODES.find(m => m.id === selectedModeId)?.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </TabsContent>

        <TabsContent value="detailed" className="mt-4">
          <ModeComparison />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ModeCard({ mode, isSelected, onClick }: { mode: ModeDetails; isSelected: boolean; onClick: () => void }) {
  return (
    <motion.div
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`group relative p-4 border-2 rounded-lg cursor-pointer transition-all ${
        isSelected
          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
          : 'border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 hover:shadow-md'
      }`}
    >
      {isSelected && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute top-3 right-3"
        >
          <div className="bg-blue-500 rounded-full p-1">
            <CheckCircle2 className="h-4 w-4 text-white" />
          </div>
        </motion.div>
      )}
      <div className="flex items-start gap-3">
        <motion.div 
          className={`p-2 rounded-lg bg-gradient-to-r ${mode.gradient} flex-shrink-0`}
          whileHover={{ rotate: 5, scale: 1.1 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <div className="text-white">{mode.icon}</div>
        </motion.div>
        <div className="flex-1 min-w-0">
          <h4 className={`font-semibold text-sm mb-1 ${isSelected ? 'text-blue-900 dark:text-blue-100' : 'text-gray-900 dark:text-gray-100'}`}>
            {mode.title}
          </h4>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">{mode.subtitle}</p>
          
          <div className="flex gap-2 mb-2 flex-wrap">
            <Badge variant="secondary" className="text-xs">
              {mode.expertSelection === 'manual' ? (
                <><User className="h-3 w-3 mr-1" /> You Choose</>
              ) : (
                <><Sparkles className="h-3 w-3 mr-1" /> AI Selects</>
              )}
            </Badge>
            <Badge variant="outline" className="text-xs">
              {mode.conversationType === 'one-shot' ? 'Single Q&A' : 'Multi-turn'}
            </Badge>
          </div>
          
          <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">{mode.description}</p>
        </div>
      </div>
    </motion.div>
  );
}

function ModeComparison() {
  return (
    <div className="space-y-4">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2">
              <th className="text-left p-3 font-semibold">What It Does</th>
              <th className="text-center p-3 font-semibold">Mode 1</th>
              <th className="text-center p-3 font-semibold">Mode 2</th>
              <th className="text-center p-3 font-semibold">Mode 3</th>
              <th className="text-center p-3 font-semibold">Mode 4</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-3">Who picks the expert?</td>
              <td className="text-center p-3">You choose</td>
              <td className="text-center p-3">AI finds best match</td>
              <td className="text-center p-3">You choose</td>
              <td className="text-center p-3">AI finds best match</td>
            </tr>
            <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-3">How you talk?</td>
              <td className="text-center p-3">One question, one answer</td>
              <td className="text-center p-3">One question, one answer</td>
              <td className="text-center p-3">Back-and-forth conversation</td>
              <td className="text-center p-3">Back-and-forth conversation</td>
            </tr>
            <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-3">Remembers conversation?</td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-3">AI thinks through problems?</td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-3">You approve before action?</td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="border-b hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
              <td className="p-3">Can handle complex multi-step tasks?</td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <X className="h-4 w-4 text-gray-400 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
              <td className="text-center p-3">
                <CheckCircle2 className="h-4 w-4 text-green-500 mx-auto" />
              </td>
            </tr>
            <tr className="border-b bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors">
              <td className="p-3 font-semibold">Typical response time</td>
              <td className="text-center p-3 font-semibold">15-30 seconds</td>
              <td className="text-center p-3 font-semibold">20-40 seconds</td>
              <td className="text-center p-3 font-semibold">45-90 seconds</td>
              <td className="text-center p-3 font-semibold">60-120 seconds</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-blue-900 dark:text-blue-100">
            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            Quick Answers (Modes 1 & 2)
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            Perfect for quick questions. Pick Mode 1 if you know your expert, Mode 2 if you want AI to find the right one automatically.
          </p>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
        >
          <h4 className="font-semibold mb-2 flex items-center gap-2 text-purple-900 dark:text-purple-100">
            <BrainCircuit className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            Deep Conversations (Modes 3 & 4)
          </h4>
          <p className="text-sm text-gray-600 dark:text-gray-300">
            For complex projects that need research, planning, and multi-step work. AI thinks through problems, you stay in control.
          </p>
        </motion.div>
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }: { feature: FeatureDetails; index: number }) {
  const [showExplanation, setShowExplanation] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="p-4 border rounded-lg hover:shadow-md transition-all dark:border-gray-700"
    >
      <div className="flex items-start gap-3">
        <motion.div 
          className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0"
          whileHover={{ rotate: 5, scale: 1.1 }}
        >
          {feature.icon}
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{feature.title}</h4>
            <button
              onClick={() => setShowExplanation(!showExplanation)}
              className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors"
              title="Learn more"
            >
              <Info className="h-3 w-3 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">{feature.description}</p>
          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800"
              >
                <p className="text-xs text-blue-900 dark:text-blue-100 font-medium mb-1">In plain English:</p>
                <p className="text-xs text-blue-700 dark:text-blue-300">{feature.plainExplanation}</p>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex gap-1 flex-wrap mt-2">
            {feature.modes.map((mode) => (
              <Badge key={mode} variant="secondary" className="text-xs">
                {mode}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function FeaturesStep() {
  const features: FeatureDetails[] = [
    {
      icon: <User className="h-6 w-6" />,
      title: 'Choose Your Expert',
      description: 'Browse specialized experts across industries and domains. Each one is like hiring a consultant who knows their field inside and out.',
      plainExplanation: 'Think of it like picking a specialist. You know regulatory experts handle compliance, clinical experts handle research, financial experts handle business strategy. Same idea—pick the expert for your topic.',
      modes: ['Mode 1', 'Mode 3'],
    },
    {
      icon: <Search className="h-6 w-6" />,
      title: 'Smart Knowledge Search',
      description: 'AI searches through real documents, regulations, and research papers to give you accurate answers backed by sources.',
      plainExplanation: 'Instead of just guessing, the AI looks up real information—like regulations, research papers, industry standards, or official documents—so you get answers you can trust.',
      modes: ['All Modes'],
    },
    {
      icon: <Settings2 className="h-6 w-6" />,
      title: 'Helpful Tools',
      description: 'AI can search the web, run calculations, or use specialized tools to help solve your problem.',
      plainExplanation: 'Like having a research assistant who can Google things, do math, or use specialized software—all to help answer your question.',
      modes: ['Mode 3', 'Mode 4'],
    },
    {
      icon: <CheckCircle2 className="h-6 w-6" />,
      title: 'You Stay in Control',
      description: 'Before AI takes any major action, it asks for your approval. You decide what happens next.',
      plainExplanation: 'Think of it like a permission slip. AI comes up with a plan, shows it to you, and you say "yes, do that" or "try something else." You\'re always in charge.',
      modes: ['Mode 3', 'Mode 4'],
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: 'Remember Our Conversation',
      description: 'AI remembers what you talked about earlier, so you don\'t have to repeat yourself. It\'s like talking to someone who pays attention.',
      plainExplanation: 'Just like a real conversation, the AI remembers what you said before. You can refer back to earlier points, and it understands the context.',
      modes: ['Mode 3', 'Mode 4'],
    },
    {
      icon: <BrainCircuit className="h-6 w-6" />,
      title: 'AI Thinks Through Problems',
      description: 'AI doesn\'t just answer—it breaks down complex problems into steps, plans ahead, and executes tasks methodically.',
      plainExplanation: 'Instead of just giving you an answer, AI thinks like a consultant: "First I need to understand the problem, then research options, then create a plan." It shows you its thinking.',
      modes: ['Mode 3', 'Mode 4'],
    },
  ];

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2 text-gray-900 dark:text-gray-100">Powerful Features at Your Fingertips</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Each mode includes different features to match your consultation needs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {features.map((feature, index) => (
          <FeatureCard key={index} feature={feature} index={index} />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-6 p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-start gap-3">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
          <div>
            <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">How It Works</h4>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">• Choose Expert:</span>
                <span>Click the expert icon to browse and pick the right specialist for your question</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">• Smart Search:</span>
                <span>Turn on knowledge search to have AI look through real documents and regulations automatically</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">• Use Tools:</span>
                <span>Click tools to let AI search the web, calculate, or use specialized software</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-semibold text-blue-600 dark:text-blue-400">• Stay in Control:</span>
                <span>Review and approve each step before AI takes action—you're always in charge</span>
              </li>
            </ul>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function GetStartedStep({ selectedMode }: { selectedMode: string | null }) {
  const mode = MODES.find((m) => m.id === selectedMode) || MODES[1];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <h3 className="text-2xl font-bold mb-2 text-gray-900 dark:text-gray-100">You're All Set!</h3>
        <p className="text-gray-600 dark:text-gray-400">
          Ready to start consulting with AI experts
        </p>
      </div>

      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2 }}
        className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border-2 border-blue-200 dark:border-blue-800"
      >
        <div className="flex items-center gap-4 mb-4">
          <motion.div 
            className={`p-3 rounded-lg bg-gradient-to-r ${mode.gradient}`}
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            <div className="text-white">{mode.icon}</div>
          </motion.div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-gray-100">{mode.title}</h4>
            <p className="text-sm text-gray-600 dark:text-gray-400">{mode.subtitle}</p>
          </div>
        </div>
        
        <div className="space-y-2 text-sm">
          <p className="font-semibold text-gray-900 dark:text-gray-100">Try this example:</p>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
            <p className="text-gray-700 dark:text-gray-300 italic">{mode.example}</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          { value: '4', label: 'Consultation Modes', color: 'text-purple-600 dark:text-purple-400' },
          { value: '<60s', label: 'Average Response', color: 'text-pink-600 dark:text-pink-400' },
        ].map((stat, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + index * 0.1 }}
            className="p-4 text-center"
          >
            <div className={`text-3xl font-bold ${stat.color} mb-1`}>{stat.value}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">{stat.label}</div>
          </motion.div>
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg"
      >
        <div className="flex items-start gap-3">
          <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="font-semibold mb-1 text-gray-900 dark:text-gray-100">Pro Tip</p>
            <p className="text-gray-600 dark:text-gray-300">
              Start with Mode 2 (Automatic) for quick questions, then use Mode 4 for complex
              multi-step tasks. You can always revisit this tour from the help menu.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================================
// UTILITY: RESET ONBOARDING (for testing)
// ============================================================================

export function resetOnboarding() {
  localStorage.removeItem('ask-expert-onboarding-seen');
}

// ============================================================================
// STANDALONE TRIGGER BUTTON (Optional)
// ============================================================================

export function OnboardingTriggerButton() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        className="gap-2"
      >
        <BookOpen className="h-4 w-4" />
        View Tutorial
      </Button>
      <AskExpertOnboarding open={open} onOpenChange={setOpen} />
    </>
  );
}

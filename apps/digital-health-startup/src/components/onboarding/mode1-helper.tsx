'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Timeline } from '@/components/ui/timeline';
import {
  Target,
  CheckCircle2,
  Sparkles,
  BrainCircuit,
  MessageCircle,
  Zap,
  Lightbulb,
  X,
  ChevronRight,
  ArrowRight,
  Play,
  Info,
  User,
  Search,
  BookOpen,
  Send,
  ArrowRight as ArrowRightIcon,
  Copy,
  Share2,
  Save,
  ThumbsUp,
  FileText,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ExampleData {
  question: string;
  expert: string;
  description: string;
  agentId?: string; // Optional: Direct agent ID link
  agentSearchTerms?: string[]; // Optional: Search terms to find agent if ID not provided
}

interface Mode1HelperProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'inline' | 'modal' | 'sidebar';
  position?: 'top-right' | 'bottom' | 'inline';
  showOnFirstVisit?: boolean;
  autoDismiss?: boolean;
  dismissDelay?: number;
  enableAnimations?: boolean;
  onExampleClick?: (example: ExampleData) => void;
  onExpertRecommend?: () => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Mode1Helper({
  open: controlledOpen,
  onOpenChange,
  variant = 'modal',
  position = 'inline',
  showOnFirstVisit = true,
  autoDismiss = true,
  dismissDelay = 5000,
  enableAnimations = true,
  onExampleClick,
  onExpertRecommend,
}: Mode1HelperProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [hasSeenHelper, setHasSeenHelper] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'learn' | 'practice'>('overview');
  const [animationStep, setAnimationStep] = useState(0);

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  // Check if user has seen helper on first visit
  useEffect(() => {
    if (showOnFirstVisit && controlledOpen === undefined) {
      const seen = localStorage.getItem('mode1-helper-seen');
      if (!seen) {
        setInternalOpen(true);
      }
      setHasSeenHelper(!!seen);
    }
  }, [showOnFirstVisit, controlledOpen]);

  // Auto-dismiss after actions
  useEffect(() => {
    if (autoDismiss && open && animationStep === 3) {
      const timer = setTimeout(() => {
        setOpen(false);
      }, dismissDelay);
      return () => clearTimeout(timer);
    }
  }, [autoDismiss, open, animationStep, dismissDelay, setOpen]);

  const handleClose = () => {
    localStorage.setItem('mode1-helper-seen', 'true');
    setOpen(false);
  };

  const handleExampleClick = (example: ExampleData) => {
    onExampleClick?.(example);
    if (autoDismiss) {
      setTimeout(() => setOpen(false), 1000);
    }
  };

  const handlePlayAnimation = () => {
    setAnimationStep(0);
    const steps = [1, 2, 3];
    steps.forEach((step, index) => {
      setTimeout(() => setAnimationStep(step), (index + 1) * 800);
    });
    setTimeout(() => setAnimationStep(0), 4000);
  };

  // Inline variant (for embedding in page)
  if (variant === 'inline') {
    return (
      <div className="relative">
        <button
          onClick={() => setOpen(true)}
          className="group relative p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
          title="Mode 1 Helper"
        >
          <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          {!hasSeenHelper && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 1 }}
              className="absolute -top-1 -right-1 w-2 h-2 bg-blue-500 rounded-full"
            />
          )}
        </button>
      </div>
    );
  }

  // Modal variant (default)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden p-0 flex flex-col">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="relative bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white flex-shrink-0"
        >
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Target className="h-6 w-6" />
              Mode 1 Helper
            </DialogTitle>
            <DialogDescription className="text-white/90">
              Your guide to Manual Expert Selection
            </DialogDescription>
          </DialogHeader>
        </motion.div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 min-h-0">
          <TabsContent
            activeSection={activeSection}
            onSectionChange={setActiveSection}
            onExampleClick={handleExampleClick}
            onExpertRecommend={onExpertRecommend}
          />
        </div>

        {/* Footer */}
        <div className="border-t p-4 flex items-center justify-between bg-gray-50 dark:bg-gray-900 flex-shrink-0">
          <Button variant="ghost" onClick={handleClose} className="text-gray-600 dark:text-gray-400">
            Got it
          </Button>
          <div className="flex gap-2">
            {activeSection !== 'overview' && (
              <Button variant="outline" onClick={() => setActiveSection('overview')} size="sm" className="gap-2">
                <Info className="h-4 w-4" />
                Overview
              </Button>
            )}
            {activeSection !== 'learn' && (
              <Button variant="outline" onClick={() => setActiveSection('learn')} size="sm" className="gap-2">
                <BookOpen className="h-4 w-4" />
                Learn
              </Button>
            )}
            {activeSection !== 'practice' && (
              <Button variant="outline" onClick={() => setActiveSection('practice')} size="sm" className="gap-2">
                <Play className="h-4 w-4" />
                Practice
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// TABS CONTENT COMPONENT
// ============================================================================

interface TabsContentProps {
  activeSection: 'overview' | 'learn' | 'practice';
  onSectionChange: (section: 'overview' | 'learn' | 'practice') => void;
  onExampleClick?: (example: ExampleData) => void;
  onExpertRecommend?: () => void;
}

function TabsContent({
  activeSection,
  onExampleClick,
  onExpertRecommend,
}: TabsContentProps) {
  if (activeSection === 'overview') {
    return (
      <OverviewContent
        showCompare={true}
      />
    );
  }

  if (activeSection === 'learn') {
    return <UserJourneyContent />;
  }

  if (activeSection === 'practice') {
    return <ExamplesContent onExampleClick={onExampleClick} />;
  }

  return null;
}

// ============================================================================
// OVERVIEW CONTENT
// ============================================================================

function OverviewContent({
  showCompare = false,
}: {
  showCompare?: boolean;
}) {
  return (
    <div className="space-y-6">
      {/* What is Mode 1 */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <Target className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          What is Mode 1?
        </h3>
        <p className="text-gray-600 dark:text-gray-400">
          Choose your specific expert, ask your question, and get a precise, focused answer right away. 
          Perfect when you know exactly who you need to talk to. This mode gives you direct access to a 
          specific expert's knowledge, ensuring answers tailored to their unique expertise.
        </p>
      </motion.div>

      {/* When to Use */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="space-y-3"
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
          When to Use Mode 1
        </h3>
        <div className="space-y-2">
          {[
            'You know which expert to ask',
            'You have a specific, focused question',
            'You need a quick answer (15-30 seconds)',
            'You want deep expertise from one domain',
          ].map((item, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 + index * 0.1 }}
              className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300"
            >
              <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
              <span>{item}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>


      {/* What to Expect */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3 flex items-center gap-2">
          <Lightbulb className="h-4 w-4" />
          What to Expect
        </h3>
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-300">Fast: 15-30 seconds</span>
          </div>
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">Focused: One expert</span>
          </div>
          <div className="flex items-center gap-2">
            <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">Deep: Expert knowledge</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">Sources included</span>
          </div>
        </div>
      </motion.div>

      {/* Compare Modes - Integrated into Overview */}
      {showCompare && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6"
        >
          <CompareContent />
        </motion.div>
      )}
    </div>
  );
}

// ============================================================================
// EXAMPLES CONTENT
// ============================================================================

function ExamplesContent({ onExampleClick }: { onExampleClick?: (example: ExampleData) => void }) {
  const examples: ExampleData[] = [
    {
      question: 'What are FDA 510(k) requirements for medical devices?',
      expert: 'Regulatory Expert',
      description: 'Perfect for regulatory compliance questions',
      agentSearchTerms: ['regulatory', 'fda', 'compliance', '510k', 'medical device', 'regulatory affairs'],
    },
    {
      question: 'How do I design a Phase 3 clinical trial protocol?',
      expert: 'Clinical Trial Expert',
      description: 'Best for clinical research questions',
      agentSearchTerms: ['clinical', 'trial', 'protocol', 'study', 'phase 3', 'clinical development'],
    },
    {
      question: 'What is the reimbursement process for medical devices?',
      expert: 'Market Access Expert',
      description: 'Ideal for market access and reimbursement',
      agentSearchTerms: ['market', 'access', 'reimbursement', 'payer', 'health economics', 'market access'],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Try an Example
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click any example below to automatically fill your query and select the recommended expert.
      </p>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onExampleClick?.(example)}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-blue-500 dark:hover:border-blue-600 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                  {example.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <ArrowRight className="h-3 w-3 mr-1" />
                    {example.expert}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {example.description}
                  </span>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-blue-600 dark:text-blue-400"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-amber-900 dark:text-amber-100">
            <strong>Tip:</strong> Click an example to automatically fill your query and select the recommended expert!
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// COMPARE CONTENT
// ============================================================================

function CompareContent() {
  const modes = [
    {
      id: 'mode-1',
      name: 'Mode 1',
      subtitle: 'Manual Selection',
      icon: <Target className="h-4 w-4" />,
      color: 'blue',
      selection: 'You choose',
      conversation: 'One question',
      speed: '15-30 sec',
      bestFor: 'Quick, specific questions',
    },
    {
      id: 'mode-2',
      name: 'Mode 2',
      subtitle: 'Automatic Selection',
      icon: <Sparkles className="h-4 w-4" />,
      color: 'amber',
      selection: 'AI finds',
      conversation: 'One question',
      speed: '20-40 sec',
      bestFor: "Don't know expert",
    },
    {
      id: 'mode-3',
      name: 'Mode 3',
      subtitle: 'Manual + Autonomous',
      icon: <BrainCircuit className="h-4 w-4" />,
      color: 'purple',
      selection: 'You choose',
      conversation: 'Multi-turn chat',
      speed: '45-90 sec/turn',
      bestFor: 'Complex projects',
    },
    {
      id: 'mode-4',
      name: 'Mode 4',
      subtitle: 'Automatic + Autonomous',
      icon: <MessageCircle className="h-4 w-4" />,
      color: 'green',
      selection: 'AI finds',
      conversation: 'Multi-turn chat',
      speed: '60-120 sec/turn',
      bestFor: 'Multi-perspective',
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        Compare Modes
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Hover over a mode to see how it compares to Mode 1.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {modes.map((mode, index) => {
          const colorClasses = {
            blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
            amber: 'bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
            purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400',
            green: 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400',
          };
          const colorClass = colorClasses[mode.color as keyof typeof colorClasses] || colorClasses.blue;

          return (
            <motion.div
              key={mode.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border-2 transition-all ${
                mode.id === 'mode-1'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-md'
                  : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`p-2 rounded-lg ${colorClass}`}>
                  {mode.icon}
                </div>
                <div>
                  <div className="font-semibold text-sm text-gray-900 dark:text-gray-100">
                    {mode.name}
                  </div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">{mode.subtitle}</div>
                </div>
              </div>
              <div className="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                <div>• Expert: {mode.selection}</div>
                <div>• Type: {mode.conversation}</div>
                <div>• Speed: {mode.speed}</div>
                <div className="font-medium text-gray-900 dark:text-gray-100 mt-2">
                  Best for: {mode.bestFor}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Not sure which mode?</strong> Start with Mode 1 if you know your expert, or Mode 2 if you want AI to find the right one automatically.
        </p>
      </div>
    </div>
  );
}

// ============================================================================
// USER JOURNEY CONTENT
// ============================================================================

function UserJourneyContent() {
  const journeySteps = [
    {
      step: 1,
      phase: 'Discovery',
      title: 'Land on Ask Expert Page',
      description: 'User arrives at /ask-expert',
      features: ['First-time? Show tour'],
      icon: Target,
      color: 'blue',
      mockData: {
        url: '/ask-expert',
        pageTitle: 'Ask Expert',
      },
    },
    {
      step: 2,
      phase: 'Discovery',
      title: 'View Mode Selector',
      description: 'See 4 consultation modes',
      features: ['Mode 1 Helper/Explainer', 'Tooltip: "Best for..."'],
      icon: Zap,
      color: 'blue',
      mockData: {
        modes: [
          { id: 1, name: 'Mode 1', icon: Target, time: '15-30 sec', selected: true },
          { id: 2, name: 'Mode 2', icon: Zap, time: '20-40 sec' },
          { id: 3, name: 'Mode 3', icon: BrainCircuit, time: '45-90 sec' },
          { id: 4, name: 'Mode 4', icon: MessageCircle, time: '60-120 sec' },
        ],
      },
    },
    {
      step: 3,
      phase: 'Discovery',
      title: 'Select Mode 1',
      description: 'Choose Manual Expert Selection',
      features: ['Show quick guide'],
      icon: CheckCircle2,
      color: 'blue',
      mockData: {
        selectedMode: 'Mode 1: Manual Expert Selection',
        features: ['Manual expert selection', 'Specialized expertise', 'Focused response'],
      },
    },
    {
      step: 4,
      phase: 'Expert Selection',
      title: 'View Expert Grid',
      description: 'Browse available experts',
      features: ['OR: Type query first', 'AI recommends experts'],
      icon: User,
      color: 'purple',
      mockData: {
        experts: [
          {
            name: 'Regulatory Expert',
            specialty: 'FDA 510(k) Compliance',
            stats: { rating: 4.8, consultations: '1.2k' },
            icon: Target,
            recommended: true,
          },
          {
            name: 'Clinical Trial Expert',
            specialty: 'Study Design Protocols',
            stats: { rating: 4.6, consultations: '890' },
            icon: Search,
          },
          {
            name: 'Market Access Expert',
            specialty: 'Reimbursement Strategies',
            stats: { rating: 4.7, consultations: '650' },
            icon: CheckCircle2,
          },
        ],
      },
    },
    {
      step: 5,
      phase: 'Expert Selection',
      title: 'Select Expert',
      description: 'Choose your specialist',
      features: ['Show expert preview', 'Show example queries'],
      icon: CheckCircle2,
      color: 'purple',
      mockData: {
        selectedExpert: {
          name: 'Regulatory Expert',
          specialty: 'FDA 510(k) Compliance',
          status: 'Selected',
        },
        exampleQueries: [
          'What are FDA 510(k) requirements?',
          'How to prepare a 510(k) submission?',
          'What is substantial equivalence?',
        ],
      },
    },
    {
      step: 6,
      phase: 'Query & Response',
      title: 'Navigate to Chat Tab',
      description: 'Switch to Chat interface',
      features: ['Show query suggestions'],
      icon: MessageCircle,
      color: 'green',
      mockData: {
        tab: 'Chat',
        status: 'Ready',
        suggestions: [
          'What are FDA 510(k) requirements?',
          'How to prepare a 510(k) submission?',
          'What is substantial equivalence?',
        ],
      },
    },
    {
      step: 7,
      phase: 'Query & Response',
      title: 'Type Query',
      description: 'Enter your question',
      features: ['Auto-complete', 'Query templates'],
      icon: Search,
      color: 'green',
      mockData: {
        question: 'What are FDA 510(k) requirements for medical devices?',
        timestamp: '10:47 AM',
        autoComplete: true,
        templates: ['Regulatory compliance', 'Submission process', 'Device classification'],
      },
    },
    {
      step: 8,
      phase: 'Query & Response',
      title: 'Send Query',
      description: 'Submit your question',
      features: ['Show progress steps'],
      icon: Send,
      color: 'green',
      mockData: {
        status: 'Sending...',
        progressSteps: ['Preparing query', 'Validating input', 'Sending to expert'],
      },
    },
    {
      step: 9,
      phase: 'Query & Response',
      title: 'Backend Processing',
      description: 'AI is working on your answer',
      features: ['Show progress: Searching knowledge', 'Generating response', 'Formatting answer'],
      icon: Zap,
      color: 'green',
      mockData: {
        progress: [
          { step: 'Searching knowledge base...', status: 'completed' },
          { step: 'Generating response...', status: 'in-progress' },
          { step: 'Formatting answer...', status: 'pending' },
        ],
      },
    },
    {
      step: 10,
      phase: 'Query & Response',
      title: 'Receive Streaming Response',
      description: 'Watch the answer appear in real-time',
      features: ['Show quality indicators'],
      icon: MessageCircle,
      color: 'green',
      mockData: {
        streaming: true,
        quality: {
          confidence: 'High',
          sources: 3,
          completeness: '95%',
        },
      },
    },
    {
      step: 11,
      phase: 'Query & Response',
      title: 'View Complete Response',
      description: 'Read the full expert answer',
      features: ['Quality score', 'Knowledge coverage', 'Quick actions'],
      icon: CheckCircle2,
      color: 'green',
      mockData: {
        response: 'The FDA 510(k) process is a premarket notification pathway for medical devices that are substantially equivalent to a legally marketed device. This process requires demonstrating that your device has the same intended use and technological characteristics as a predicate device...',
        sources: [
          'FDA 510(k) Submission Guide',
          'Medical Device Regulation Handbook',
          'Pre-market Notification Requirements',
        ],
        responseTime: '22 seconds',
        quality: {
          score: 4.8,
          coverage: '95%',
          sources: 3,
        },
      },
    },
    {
      step: 12,
      phase: 'Response Actions',
      title: 'Response Actions',
      description: 'Interact with your answer',
      features: ['Copy', 'Share', 'Save', 'Improve', 'Feedback'],
      icon: User,
      color: 'purple',
      mockData: {
        actions: ['Copy', 'Share', 'Save', 'Improve', 'Feedback'],
      },
    },
    {
      step: 13,
      phase: 'Next Steps',
      title: 'Next Steps',
      description: 'Continue your journey',
      features: ['Suggest: Switch mode?', 'Suggest: Follow-up?', 'Suggest: Different expert?'],
      icon: ArrowRightIcon,
      color: 'blue',
      mockData: {
        suggestions: [
          'Switch to Mode 2 for multi-turn conversation',
          'Ask a follow-up question',
          'Try a different expert',
        ],
      },
    },
  ];

  const colorClasses = {
    blue: {
      border: 'border-blue-500',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
      iconBg: 'bg-blue-500',
      text: 'text-blue-600 dark:text-blue-400',
    },
    purple: {
      border: 'border-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      iconBg: 'bg-purple-500',
      text: 'text-purple-600 dark:text-purple-400',
    },
    green: {
      border: 'border-green-500',
      bg: 'bg-green-50 dark:bg-green-900/20',
      iconBg: 'bg-green-500',
      text: 'text-green-600 dark:text-green-400',
    },
  };

  // Convert journeySteps to Timeline items
  const timelineItems = journeySteps.map((step, index) => {
    const IconComponent = step.icon;
    const isCompleted = index < journeySteps.length - 1;
    const isActive = index === journeySteps.length - 1;

    // Build rich content for each step
    const richContent = (
      <div className="space-y-3 mt-2">
        {step.features && step.features.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {step.features.map((feature: string, idx: number) => (
              <Badge key={idx} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        )}

        {/* Step-specific mock data visualizations */}
        {step.step === 2 && step.mockData.modes && (
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {step.mockData.modes.map((mode: any) => {
                const ModeIcon = mode.icon;
                return (
                  <div
                    key={mode.id}
                    className={`p-2 rounded border text-center transition-all relative ${
                      mode.selected || mode.id === 1
                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/30 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {mode.selected && (
                      <div className="absolute -top-1 -right-1">
                        <Badge className="h-4 w-4 p-0 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-3 w-3" />
                        </Badge>
                      </div>
                    )}
                    <div className="flex justify-center mb-1">
                      <ModeIcon className={`h-4 w-4 ${mode.selected || mode.id === 1 ? 'text-blue-600 dark:text-blue-400' : 'text-gray-600 dark:text-gray-400'}`} />
                    </div>
                    <div className="text-xs font-medium">{mode.name}</div>
                    <div className="text-xs text-gray-500">{mode.time}</div>
                  </div>
                );
              })}
            </div>
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 text-xs text-blue-900 dark:text-blue-100">
                <Info className="h-3 w-3" />
                <span>Mode 1 Helper available - Click "?" for guidance</span>
              </div>
            </div>
          </div>
        )}

        {step.step === 3 && step.mockData.features && (
          <div className="mt-3 space-y-1">
            {step.mockData.features.map((feature: string, idx: number) => (
              <div key={idx} className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                <CheckCircle2 className="h-3 w-3 text-green-500 flex-shrink-0" />
                {feature}
              </div>
            ))}
          </div>
        )}

        {step.step === 4 && step.mockData.experts && (
          <div className="space-y-3 mt-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {step.mockData.experts.map((expert: any, idx: number) => {
                const ExpertIcon = expert.icon;
                return (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg border transition-all relative ${
                      expert.recommended || idx === 0
                        ? 'border-purple-500 bg-purple-100 dark:bg-purple-900/30 shadow-sm'
                        : 'border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    {expert.recommended && (
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-purple-500 text-white text-xs px-1.5 py-0.5">
                          <Sparkles className="h-2.5 w-2.5 mr-1" />
                          AI Recommended
                        </Badge>
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <div className="p-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400">
                        <ExpertIcon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm truncate">{expert.name}</div>
                        <div className="text-xs text-gray-500 truncate">{expert.specialty}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-gray-600 dark:text-gray-400">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3 text-amber-500" />
                        {expert.stats.rating}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="h-3 w-3 text-blue-500" />
                        {expert.stats.consultations}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="p-2 bg-amber-50 dark:bg-amber-900/20 rounded border border-amber-200 dark:border-amber-800">
              <div className="flex items-center gap-2 text-xs text-amber-900 dark:text-amber-100">
                <Lightbulb className="h-3 w-3" />
                <span>Tip: You can also type your query first and let AI recommend the best expert</span>
              </div>
            </div>
          </div>
        )}

        {step.step === 5 && step.mockData.selectedExpert && (
          <div className="mt-3 space-y-3">
            <div className="p-3 rounded-lg border-2 border-purple-500 bg-purple-100 dark:bg-purple-900/30">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="h-5 w-5 text-purple-600 dark:text-purple-400 flex-shrink-0" />
                <div>
                  <div className="font-semibold text-sm">{step.mockData.selectedExpert.name}</div>
                  <div className="text-xs text-gray-600 dark:text-gray-400">
                    {step.mockData.selectedExpert.specialty}
                  </div>
                </div>
              </div>
            </div>
            {step.mockData.exampleQueries && (
              <div className="p-3 rounded-lg bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold">Example Queries:</span>
                </div>
                <div className="space-y-1">
                  {step.mockData.exampleQueries.map((query: string, idx: number) => (
                    <div key={idx} className="text-xs text-gray-700 dark:text-gray-300 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                      {query}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step.step === 7 && step.mockData.question && (
          <div className="mt-3 space-y-3">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-2">
                <User className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm text-gray-900 dark:text-gray-100">{step.mockData.question}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{step.mockData.timestamp}</p>
                </div>
              </div>
            </div>
            {step.mockData.autoComplete && (
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-400">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                <span>Auto-complete enabled</span>
              </div>
            )}
            {step.mockData.templates && (
              <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 mb-1">
                  <FileText className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-semibold">Query Templates:</span>
                </div>
                <div className="flex flex-wrap gap-1">
                  {step.mockData.templates.map((template: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {template}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {step.step === 8 && step.mockData.progressSteps && (
          <div className="mt-3 space-y-2">
            {step.mockData.progressSteps.map((progressStep: string, idx: number) => {
              const progressSteps = step.mockData.progressSteps || [];
              return (
                <div key={idx} className="flex items-center gap-2 p-2 rounded bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                  <Zap className={`h-4 w-4 text-amber-600 dark:text-amber-400 ${idx === progressSteps.length - 1 ? 'animate-pulse' : ''}`} />
                  <span className="text-sm text-amber-900 dark:text-amber-100">{progressStep}</span>
                  {idx < progressSteps.length - 1 && (
                    <CheckCircle2 className="h-4 w-4 text-green-500 ml-auto" />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step.step === 9 && step.mockData.progress && (
          <div className="mt-3 space-y-2">
            {step.mockData.progress.map((progressItem: any, idx: number) => (
              <div key={idx} className="flex items-center gap-2 p-2 rounded bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <div className={`h-2 w-2 rounded-full ${
                  progressItem.status === 'completed' ? 'bg-green-500' :
                  progressItem.status === 'in-progress' ? 'bg-blue-500 animate-pulse' :
                  'bg-gray-300 dark:bg-gray-600'
                }`} />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{progressItem.step}</span>
                {progressItem.status === 'completed' && (
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                )}
                {progressItem.status === 'in-progress' && (
                  <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />
                )}
              </div>
            ))}
          </div>
        )}

        {step.step === 10 && step.mockData.streaming && (
          <div className="mt-3 space-y-2">
            <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="h-4 w-4 text-blue-600 dark:text-blue-400 animate-pulse" />
                <span className="text-sm font-semibold">Streaming Response...</span>
              </div>
              <div className="text-sm text-gray-700 dark:text-gray-300">
                The FDA 510(k) process is a premarket notification pathway...
              </div>
            </div>
            {step.mockData.quality && (
              <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3 text-green-500" />
                    <span>Confidence: {step.mockData.quality.confidence}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <BookOpen className="h-3 w-3 text-blue-500" />
                    <span>Sources: {step.mockData.quality.sources}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3 text-purple-500" />
                    <span>Completeness: {step.mockData.quality.completeness}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {step.step === 11 && step.mockData.response && (
          <div className="mt-3 space-y-3">
            <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                  RE
                </div>
                <div className="flex-1">
                  <div className="font-semibold text-sm mb-1">Regulatory Expert</div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">{step.mockData.response}</p>
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-2">
                      <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                      <span className="text-xs font-semibold">Sources ({step.mockData.sources?.length || 0}):</span>
                    </div>
                    <ul className="space-y-1">
                      {step.mockData.sources?.map((source: string, idx: number) => (
                        <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-1">
                          <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                          {source}
                        </li>
                      ))}
                    </ul>
                  </div>
                  {step.mockData.quality && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                      <div className="flex items-center gap-2 mb-2">
                        <TrendingUp className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        <span className="text-xs font-semibold">Quality Metrics:</span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Score</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {step.mockData.quality.score || '4.8'}/5.0
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Coverage</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {step.mockData.quality.coverage || '95%'}
                          </span>
                        </div>
                        <div className="flex flex-col">
                          <span className="text-gray-500 dark:text-gray-400">Sources</span>
                          <span className="font-semibold text-gray-900 dark:text-gray-100">
                            {step.mockData.quality.sources || step.mockData.sources?.length || 3}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                    Response time: {step.mockData.responseTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {step.step === 12 && step.mockData.actions && (
          <div className="mt-3">
            <div className="flex flex-wrap gap-2">
              {step.mockData.actions.map((action: string, idx: number) => {
                const actionIcons: Record<string, any> = {
                  Copy: Copy,
                  Share: Share2,
                  Save: Save,
                  Improve: RefreshCw,
                  Feedback: ThumbsUp,
                };
                const IconComponent = actionIcons[action] || FileText;
                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    disabled
                  >
                    <IconComponent className="h-3 w-3" />
                    {action}
                  </Button>
                );
              })}
            </div>
          </div>
        )}

        {step.step === 13 && step.mockData.suggestions && (
          <div className="mt-3 space-y-2">
            {step.mockData.suggestions.map((suggestion: string, idx: number) => (
              <div key={idx} className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <ArrowRightIcon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span>{suggestion}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );

    const status: 'completed' | 'active' | 'pending' = isCompleted ? 'completed' : isActive ? 'active' : 'pending';

    return {
      id: `step-${step.step}`,
      title: (
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="text-xs">
            {step.phase}
          </Badge>
          <span>{step.title}</span>
        </div>
      ),
      description: step.description,
      content: richContent,
      status,
      icon: <IconComponent className="h-4 w-4" />,
    };
  });

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center justify-center gap-2 mb-2">
          <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          Complete User Journey
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Follow the end-to-end journey from landing on the page to getting your answer
        </p>
      </div>

      {/* Timeline Visualization */}
      <Timeline items={timelineItems} activeIndex={journeySteps.length - 1} />

      {/* Journey Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-4 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800"
      >
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          Journey Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Total Steps:</strong> 13 steps across 4 phases
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Average Time:</strong> 15-30 seconds
            </span>
          </div>
          <div className="flex items-center gap-2">
            <ArrowRightIcon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Key Actions:</strong> Select Mode → Choose Expert → Ask Question → Get Answer
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Result:</strong> Precise answer with quality metrics
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// UTILITY: RESET HELPER (for testing)
// ============================================================================

export function resetMode1Helper() {
  localStorage.removeItem('mode1-helper-seen');
}

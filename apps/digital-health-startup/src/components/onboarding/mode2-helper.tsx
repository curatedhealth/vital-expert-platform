'use client';

import React, { useState } from 'react';
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
  Zap,
  Sparkles,
  BrainCircuit,
  Search,
  Users,
  CheckCircle2,
  X,
  ChevronRight,
  ArrowRight,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  MessageCircle,
  FileText,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ExampleData {
  question: string;
  description: string;
  experts: string[]; // Multiple experts that will be selected
  agentSearchTerms?: string[]; // Search terms for finding agents
}

interface Mode2HelperProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'inline' | 'modal';
  showOnFirstVisit?: boolean;
  autoDismiss?: boolean;
  onExampleClick?: (example: ExampleData) => void;
}

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Mode2Helper({
  open: controlledOpen,
  onOpenChange,
  variant = 'modal',
  showOnFirstVisit = false,
  autoDismiss = false,
  onExampleClick,
}: Mode2HelperProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [activeSection, setActiveSection] = useState<'overview' | 'learn' | 'practice'>('overview');

  const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
  const setOpen = onOpenChange || setInternalOpen;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col p-0 gap-0">
        <DialogHeader className="flex-shrink-0 px-6 pt-6 pb-4 border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg">
                <Zap className="h-5 w-5 text-amber-600 dark:text-amber-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Mode 2: Automatic Expert Selection</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  AI selects the best experts for comprehensive answers
                </DialogDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setOpen(false)}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="flex-shrink-0 px-6 pt-4 border-b bg-gray-50 dark:bg-gray-900/50">
            <div className="flex gap-2">
              <Button
                variant={activeSection === 'overview' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('overview')}
                className="rounded-full"
              >
                <Info className="h-4 w-4 mr-2" />
                Overview
              </Button>
              <Button
                variant={activeSection === 'learn' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('learn')}
                className="rounded-full"
              >
                <BookOpen className="h-4 w-4 mr-2" />
                Learn
              </Button>
              <Button
                variant={activeSection === 'practice' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setActiveSection('practice')}
                className="rounded-full"
              >
                <Lightbulb className="h-4 w-4 mr-2" />
                Practice
              </Button>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-h-0 overflow-y-auto px-6 py-6">
            <AnimatePresence mode="wait">
              {activeSection === 'overview' && (
                <motion.div
                  key="overview"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <OverviewContent />
                </motion.div>
              )}
              {activeSection === 'learn' && (
                <motion.div
                  key="learn"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <UserJourneyContent />
                </motion.div>
              )}
              {activeSection === 'practice' && (
                <motion.div
                  key="practice"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <ExamplesContent onExampleClick={onExampleClick} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ============================================================================
// OVERVIEW CONTENT
// ============================================================================

function OverviewContent() {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-3 flex items-center gap-2">
          <Target className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          When to Use Mode 2
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Mode 2 is perfect when you have a question but aren't sure which expert to ask. 
          The AI analyzes your question and automatically selects the best experts to provide 
          a comprehensive answer from multiple perspectives.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Best For</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Quick research questions</li>
            <li>• Questions needing multiple perspectives</li>
            <li>• When you don't know which expert to ask</li>
            <li>• Time-sensitive decisions</li>
          </ul>
        </div>

        <div className="p-4 bg-amber-50 dark:bg-amber-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">What to Expect</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• AI selects 2-3 relevant experts</li>
            <li>• Comprehensive answer synthesized from multiple perspectives</li>
            <li>• Sources from multiple domains</li>
            <li>• 30-45 second response time</li>
          </ul>
        </div>
      </div>

      {/* Mode Comparison */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Mode Comparison
        </h3>
        <CompareContent />
      </div>
    </div>
  );
}

// ============================================================================
// COMPARE CONTENT
// ============================================================================

function CompareContent() {
  const features = [
    {
      feature: 'Expert Selection',
      mode1: 'You choose',
      mode2: 'AI selects automatically',
      mode3: 'You choose',
      mode4: 'AI selects and switches',
    },
    {
      feature: 'Number of Experts',
      mode1: '1 expert',
      mode2: '2-3 experts',
      mode3: '1 expert',
      mode4: 'Multiple experts',
    },
    {
      feature: 'Response Type',
      mode1: 'One-shot answer',
      mode2: 'One-shot answer',
      mode3: 'Multi-turn conversation',
      mode4: 'Multi-turn conversation',
    },
    {
      feature: 'Knowledge Search',
      mode1: 'Expert-specific domains',
      mode2: 'All domains',
      mode3: 'Expert-specific domains',
      mode4: 'All domains',
    },
    {
      feature: 'Best For',
      mode1: 'Specific questions',
      mode2: 'Quick research',
      mode3: 'Deep dives',
      mode4: 'Complex projects',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Feature</th>
            <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Mode 1</th>
            <th className="text-center p-3 font-semibold text-amber-600 dark:text-amber-400">Mode 2</th>
            <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Mode 3</th>
            <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Mode 4</th>
          </tr>
        </thead>
        <tbody>
          {features.map((row, idx) => (
            <motion.tr
              key={idx}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="border-b hover:bg-gray-50 dark:hover:bg-gray-900/50"
            >
              <td className="p-3 font-medium text-gray-700 dark:text-gray-300">{row.feature}</td>
              <td className="p-3 text-center text-gray-600 dark:text-gray-400">{row.mode1}</td>
              <td className="p-3 text-center font-medium text-amber-600 dark:text-amber-400">{row.mode2}</td>
              <td className="p-3 text-center text-gray-600 dark:text-gray-400">{row.mode3}</td>
              <td className="p-3 text-center text-gray-600 dark:text-gray-400">{row.mode4}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ============================================================================
// USER JOURNEY CONTENT
// ============================================================================

function UserJourneyContent() {
  const steps = [
    {
      phase: 'Phase 1: Query Analysis',
      step: 1,
      title: 'You Ask Your Question',
      description: 'Type your question naturally - no need to know which expert to ask.',
      mockData: {
        question: 'What are best practices for clinical trials?',
      },
      aiAnalysis: {
        keywords: ['clinical', 'trials', 'best', 'practices'],
        domains: ['Research', 'Regulatory', 'Clinical Development'],
        confidence: 94,
      },
    },
    {
      phase: 'Phase 1: Query Analysis',
      step: 2,
      title: 'AI Analyzes Your Question',
      description: 'AI extracts keywords, identifies relevant domains, and determines complexity.',
      mockData: {
        question: 'What are best practices for clinical trials?',
      },
      aiAnalysis: {
        keywords: ['clinical', 'trials', 'best', 'practices'],
        domains: ['Research', 'Regulatory', 'Clinical Development'],
        confidence: 94,
      },
    },
    {
      phase: 'Phase 2: Expert Selection',
      step: 3,
      title: 'AI Selects Best Experts',
      description: 'AI matches your question to the most relevant experts based on expertise and knowledge domains.',
      experts: [
        { name: 'Clinical Trial Expert', confidence: 95, role: 'Primary' },
        { name: 'Regulatory Expert', confidence: 87, role: 'Supporting' },
        { name: 'Market Access Expert', confidence: 76, role: 'Supporting' },
      ],
    },
    {
      phase: 'Phase 2: Expert Selection',
      step: 4,
      title: 'Expert Team Assembled',
      description: 'Multiple experts are ready to contribute their specialized knowledge.',
      experts: [
        { name: 'Clinical Trial Expert', confidence: 95, role: 'Primary' },
        { name: 'Regulatory Expert', confidence: 87, role: 'Supporting' },
        { name: 'Market Access Expert', confidence: 76, role: 'Supporting' },
      ],
    },
    {
      phase: 'Phase 3: Knowledge Search',
      step: 5,
      title: 'Universal Knowledge Search',
      description: 'AI searches across all knowledge domains to find relevant information.',
      search: {
        domains: ['Clinical Research', 'Regulatory Affairs', 'Market Access'],
        results: 18,
        sources: [
          'Clinical Trial Guidelines',
          'FDA Regulations',
          'ICH Guidelines',
          'Market Access Studies',
        ],
      },
    },
    {
      phase: 'Phase 3: Knowledge Search',
      step: 6,
      title: 'Knowledge Gathered',
      description: 'Comprehensive information collected from multiple domains and sources.',
      search: {
        domains: ['Clinical Research', 'Regulatory Affairs', 'Market Access'],
        results: 18,
        sources: [
          'Clinical Trial Guidelines',
          'FDA Regulations',
          'ICH Guidelines',
          'Market Access Studies',
        ],
      },
    },
    {
      phase: 'Phase 4: Synthesis',
      step: 7,
      title: 'AI Synthesizes Expert Contributions',
      description: 'AI combines insights from all experts into one comprehensive answer.',
      synthesis: {
        experts: 3,
        sources: 18,
        sections: [
          'Clinical Trial Design',
          'Regulatory Requirements',
          'Market Considerations',
        ],
      },
    },
    {
      phase: 'Phase 4: Synthesis',
      step: 8,
      title: 'Complete Answer Ready',
      description: 'Your comprehensive answer is ready with expert contributions and sources.',
      synthesis: {
        experts: 3,
        sources: 18,
        sections: [
          'Clinical Trial Design',
          'Regulatory Requirements',
          'Market Considerations',
        ],
      },
    },
  ];

  // Convert steps to Timeline items
  const timelineItems = steps.map((step, index) => {
    const isCompleted = index < steps.length - 1;
    const isActive = index === steps.length - 1;

    // Determine icon based on step
    let IconComponent = Zap;
    if (step.step <= 2) IconComponent = MessageCircle;
    else if (step.step >= 3 && step.step <= 4) IconComponent = Users;
    else if (step.step >= 5 && step.step <= 6) IconComponent = Search;
    else IconComponent = Sparkles;

    // Build rich content for each step
    const richContent = (
      <div className="space-y-3 mt-2">
        {/* Step 1-2: Question and AI Analysis */}
        {step.step <= 2 && step.mockData && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Question:</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 italic">
                  "{step.mockData.question}"
                </p>
              </div>
              {step.step === 2 && step.aiAnalysis && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                    <BrainCircuit className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                    AI Analysis:
                  </p>
                  <div className="space-y-2">
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Keywords:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {step.aiAnalysis.keywords.map((keyword: string, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {keyword}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">Domains:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {step.aiAnalysis.domains.map((domain: string, idx: number) => (
                          <Badge key={idx} variant="outline" className="text-xs">
                            {domain}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">Confidence:</span>
                      <div className="flex-1 bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                        <motion.div
                          className="bg-amber-600 dark:bg-amber-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${step.aiAnalysis.confidence}%` }}
                          transition={{ duration: 0.8 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                        {step.aiAnalysis.confidence}%
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3-4: Expert Selection */}
        {step.step >= 3 && step.step <= 4 && step.experts && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Selected Experts:
            </p>
            <div className="space-y-3">
              {step.experts.map((expert: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {expert.name}
                      </p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {expert.role}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                        <motion.div
                          className="bg-amber-600 dark:bg-amber-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${expert.confidence}%` }}
                          transition={{ delay: idx * 0.2 + 0.3, duration: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-amber-600 dark:text-amber-400 w-10">
                        {expert.confidence}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5-6: Knowledge Search */}
        {step.step >= 5 && step.step <= 6 && step.search && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Search className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              Knowledge Search Progress:
            </p>
            <div className="space-y-3">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-500 dark:text-gray-400">Searching domains...</span>
                  <span className="text-xs font-medium text-amber-600 dark:text-amber-400">
                    {step.search.results} sources found
                  </span>
                </div>
                <div className="flex gap-2">
                  {step.search.domains.map((domain: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <Search className="h-3 w-3 mr-1" />
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
              {step.step === 6 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Key Sources:</p>
                  <ul className="space-y-1">
                    {step.search.sources.map((source: string, idx: number) => (
                      <li key={idx} className="text-xs text-gray-600 dark:text-gray-400 flex items-center gap-2">
                        <CheckCircle2 className="h-3 w-3 text-green-600 dark:text-green-400" />
                        {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 7-8: Synthesis */}
        {step.step >= 7 && step.synthesis && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-amber-600 dark:text-amber-400" />
              AI Synthesis:
            </p>
            <div className="space-y-3">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {step.synthesis.experts}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Experts</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {step.synthesis.sources}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sources</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                    {step.synthesis.sections.length}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Sections</p>
                </div>
              </div>
              {step.step === 8 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Answer Sections:</p>
                  <div className="space-y-2">
                    {step.synthesis.sections.map((section: string, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
                        <span className="text-gray-700 dark:text-gray-300">{section}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
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
          <BookOpen className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          Complete User Journey
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Follow the complete journey from your question to a comprehensive answer with multiple expert perspectives
        </p>
      </div>

      {/* Timeline Visualization */}
      <Timeline items={timelineItems} activeIndex={steps.length - 1} />

      {/* Journey Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 rounded-lg border border-amber-200 dark:border-amber-800"
      >
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          Journey Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Total Steps:</strong> 8 steps across 4 phases
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Average Time:</strong> 20-40 seconds
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Key Feature:</strong> AI selects 2-3 experts automatically
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Result:</strong> Comprehensive answer from multiple perspectives
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// ============================================================================
// EXAMPLES CONTENT
// ============================================================================

function ExamplesContent({ onExampleClick }: { onExampleClick?: (example: ExampleData) => void }) {
  const examples: ExampleData[] = [
    {
      question: 'What are best practices for clinical trials?',
      description: 'Perfect for questions needing multiple expert perspectives',
      experts: ['Clinical Trial Expert', 'Regulatory Expert', 'Market Access Expert'],
      agentSearchTerms: ['clinical', 'trial', 'regulatory', 'market', 'access'],
    },
    {
      question: 'How do medical devices get FDA approval?',
      description: 'Ideal for complex regulatory questions',
      experts: ['Regulatory Expert', 'Clinical Expert', 'Technical Expert'],
      agentSearchTerms: ['regulatory', 'fda', 'approval', 'medical device', 'clinical'],
    },
    {
      question: 'What is the reimbursement landscape for biotech drugs?',
      description: 'Best for market access and reimbursement questions',
      experts: ['Market Access Expert', 'Regulatory Expert', 'Business Expert'],
      agentSearchTerms: ['market', 'access', 'reimbursement', 'biotech', 'regulatory'],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
        Try an Example
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click any example below to automatically fill your query. AI will select the best experts automatically.
      </p>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onExampleClick?.(example)}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-amber-500 dark:hover:border-amber-600 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-400">
                  {example.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Users className="h-3 w-3 mr-1" />
                    {example.experts.length} experts
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {example.description}
                  </span>
                </div>
                <div className="flex flex-wrap gap-1 mt-2">
                  {example.experts.map((expert, idx) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {expert}
                    </Badge>
                  ))}
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-amber-600 dark:text-amber-400"
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
            <strong>Note:</strong> When you click an example, AI will automatically select the best experts 
            for your question. You'll see the expert selection process and get a comprehensive answer 
            from multiple perspectives.
          </p>
        </div>
      </div>
    </div>
  );
}


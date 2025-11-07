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
  MessageCircle,
  Sparkles,
  Users,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  BrainCircuit,
  FileText,
  ArrowRight,
  Music,
  Play,
  Workflow,
  Search,
  Zap,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ExampleData {
  question: string;
  description: string;
  experts: string[]; // Multiple experts that will be orchestrated
  agentSearchTerms?: string[];
}

interface Mode4HelperProps {
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

export function Mode4Helper({
  open: controlledOpen,
  onOpenChange,
  variant = 'modal',
  showOnFirstVisit = false,
  autoDismiss = false,
  onExampleClick,
}: Mode4HelperProps) {
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
              <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Mode 4: Automatic Autonomous</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  AI orchestrates multiple experts in perfect harmony
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
          <Target className="h-5 w-5 text-green-600 dark:text-green-400" />
          When to Use Mode 4
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Mode 4 is the ultimate solution for complex, multi-domain challenges. AI acts as a conductor, 
          orchestrating multiple experts dynamically, switching between them as needed, and synthesizing 
          their contributions into comprehensive solutions.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Best For</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Complex multi-domain problems</li>
            <li>• Projects needing multiple perspectives</li>
            <li>• Iterative refinement</li>
            <li>• Strategic planning</li>
            <li>• Multi-phase projects</li>
          </ul>
        </div>

        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">What to Expect</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• AI selects and switches experts</li>
            <li>• Dynamic expert orchestration</li>
            <li>• Multi-turn conversation</li>
            <li>• Comprehensive synthesis</li>
            <li>• Professional deliverables</li>
          </ul>
        </div>
      </div>

      {/* Orchestra Metaphor */}
      <div className="mt-6 p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-lg border border-green-200 dark:border-green-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Music className="h-5 w-5 text-green-600 dark:text-green-400" />
          The Expert Orchestra
        </h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <BrainCircuit className="h-8 w-8 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">AI Conductor</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Selects and coordinates experts</p>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {[
              { icon: '🎻', name: 'Market Expert', role: 'Concertmaster' },
              { icon: '🎺', name: 'Regulatory Expert', role: 'Principal' },
              { icon: '🎷', name: 'Technical Expert', role: 'Section Leader' },
              { icon: '🥁', name: 'Business Expert', role: 'Featured Soloist' },
            ].map((instrument, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="text-center p-3 bg-white dark:bg-gray-900 rounded-lg border border-green-200 dark:border-green-800"
              >
                <div className="text-2xl mb-1">{instrument.icon}</div>
                <p className="text-xs font-medium text-gray-900 dark:text-gray-100">{instrument.name}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{instrument.role}</p>
              </motion.div>
            ))}
          </div>
          <div className="text-center pt-2 border-t border-green-200 dark:border-green-800">
            <ArrowRight className="h-5 w-5 text-green-600 dark:text-green-400 mx-auto mb-2" />
            <p className="text-sm font-medium text-green-900 dark:text-green-200">
              = Beautiful Symphony
            </p>
          </div>
        </div>
      </div>

      {/* Mode Comparison */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
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
      mode2: 'AI selects',
      mode3: 'You choose',
      mode4: 'AI orchestrates',
    },
    {
      feature: 'Expert Switching',
      mode1: 'No',
      mode2: 'No',
      mode3: 'No',
      mode4: 'Yes (dynamic)',
    },
    {
      feature: 'Conversation Type',
      mode1: 'One-shot',
      mode2: 'One-shot',
      mode3: 'Multi-turn',
      mode4: 'Multi-turn',
    },
    {
      feature: 'AI Capabilities',
      mode1: 'Basic',
      mode2: 'Automatic selection',
      mode3: 'Autonomous + workflows',
      mode4: 'Autonomous + orchestration',
    },
    {
      feature: 'Best For',
      mode1: 'Quick questions',
      mode2: 'Quick research',
      mode3: 'Complex projects',
      mode4: 'Multi-domain projects',
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left p-3 font-semibold text-gray-900 dark:text-gray-100">Feature</th>
            <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Mode 1</th>
            <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Mode 2</th>
            <th className="text-center p-3 font-semibold text-gray-900 dark:text-gray-100">Mode 3</th>
            <th className="text-center p-3 font-semibold text-green-600 dark:text-green-400">Mode 4</th>
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
              <td className="p-3 text-center text-gray-600 dark:text-gray-400">{row.mode2}</td>
              <td className="p-3 text-center text-gray-600 dark:text-gray-400">{row.mode3}</td>
              <td className="p-3 text-center font-medium text-green-600 dark:text-green-400">{row.mode4}</td>
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
      phase: 'Phase 1: AI Analysis',
      step: 1,
      title: 'You Describe Your Complex Challenge',
      description: 'Share your complex, multi-domain challenge - no need to know which experts to involve.',
      question: 'Help me develop a comprehensive market entry strategy for a new biotech drug in the US and EU markets.',
    },
    {
      phase: 'Phase 1: AI Analysis',
      step: 2,
      title: 'AI Analyzes and Plans Orchestration',
      description: 'AI analyzes your challenge, identifies required domains, and plans expert orchestration.',
      analysis: {
        keywords: ['market entry', 'biotech', 'US', 'EU', 'strategy'],
        domains: ['Business', 'Regulatory', 'Market Access', 'International'],
        complexity: 'Multi-domain orchestration required',
      },
    },
    {
      phase: 'Phase 2: Expert Orchestra Assembly',
      step: 3,
      title: 'AI Assembles Expert Team',
      description: 'AI selects the perfect combination of experts to handle your complex challenge.',
      experts: [
        { name: 'Market Access Expert', role: 'Lead', confidence: 95 },
        { name: 'Regulatory Expert', role: 'Supporting', confidence: 87 },
        { name: 'EU Market Expert', role: 'Supporting', confidence: 82 },
      ],
    },
    {
      phase: 'Phase 2: Expert Orchestra Assembly',
      step: 4,
      title: 'Expert Orchestra Ready',
      description: 'Multiple experts are assembled and ready to work together in harmony.',
      experts: [
        { name: 'Market Access Expert', role: 'Lead', confidence: 95 },
        { name: 'Regulatory Expert', role: 'Supporting', confidence: 87 },
        { name: 'EU Market Expert', role: 'Supporting', confidence: 82 },
      ],
    },
    {
      phase: 'Phase 3: Workflow Planning',
      step: 5,
      title: 'AI Creates Orchestration Plan',
      description: 'AI creates a comprehensive workflow plan showing how experts will collaborate.',
      plan: {
        phases: [
          { name: 'US Market Analysis', expert: 'Market Access Expert', time: '30 min' },
          { name: 'Regulatory Strategy', expert: 'Regulatory Expert', time: '25 min' },
          { name: 'EU Market Entry', expert: 'EU Market Expert', time: '35 min' },
          { name: 'Synthesis', expert: 'AI Conductor', time: '20 min' },
        ],
        checkpoints: 4,
        totalTime: '2 hours',
      },
    },
    {
      phase: 'Phase 3: Workflow Planning',
      step: 6,
      title: 'Review Orchestration Plan',
      description: 'Review how experts will work together, then approve to begin the orchestration.',
      plan: {
        phases: [
          { name: 'US Market Analysis', expert: 'Market Access Expert', time: '30 min' },
          { name: 'Regulatory Strategy', expert: 'Regulatory Expert', time: '25 min' },
          { name: 'EU Market Entry', expert: 'EU Market Expert', time: '35 min' },
          { name: 'Synthesis', expert: 'AI Conductor', time: '20 min' },
        ],
        checkpoints: 4,
        totalTime: '2 hours',
      },
    },
    {
      phase: 'Phase 4: Dynamic Orchestration',
      step: 7,
      title: 'Market Access Expert Leads',
      description: 'Primary expert begins analysis while supporting experts prepare.',
      execution: {
        activeExpert: 'Market Access Expert',
        phase: 'US Market Analysis',
        progress: 35,
      },
    },
    {
      phase: 'Phase 4: Dynamic Orchestration',
      step: 8,
      title: 'Expert Switch: Regulatory Takes Over',
      description: 'AI seamlessly switches to regulatory expert for regulatory strategy phase.',
      switch: {
        from: 'Market Access Expert',
        to: 'Regulatory Expert',
        context: 'Context preserved seamlessly',
      },
    },
    {
      phase: 'Phase 4: Dynamic Orchestration',
      step: 9,
      title: 'Another Switch: EU Market Expert',
      description: 'AI switches to EU market expert for international expansion phase.',
      switch: {
        from: 'Regulatory Expert',
        to: 'EU Market Expert',
        context: 'Full conversation history maintained',
      },
    },
    {
      phase: 'Phase 5: Multi-turn Collaboration',
      step: 10,
      title: 'You Ask a Question',
      description: 'You can ask questions anytime. AI switches to the best expert to answer.',
      question: 'How do Medicare reimbursement timelines affect our launch strategy?',
    },
    {
      phase: 'Phase 5: Multi-turn Collaboration',
      step: 11,
      title: 'AI Switches Expert to Answer',
      description: 'AI automatically switches to regulatory expert to answer your question.',
      answer: {
        expert: 'Regulatory Expert',
        response: 'Medicare reimbursement typically takes 2-4 months from FDA approval...',
      },
    },
    {
      phase: 'Phase 6: Synthesis',
      step: 12,
      title: 'AI Synthesizes All Contributions',
      description: 'AI conductor integrates all expert contributions into one comprehensive solution.',
      synthesis: {
        experts: 3,
        contributions: 12,
        documents: 4,
      },
    },
    {
      phase: 'Phase 6: Synthesis',
      step: 13,
      title: 'Complete Solution Ready',
      description: 'Your comprehensive solution is ready with expert contributions and deliverables.',
      deliverables: {
        documents: [
          'US Market Access Strategy (25 pages)',
          'Regulatory Submission Plan (15 pages)',
          'EU Market Entry Roadmap (20 pages)',
          'Integrated Strategy Document (45 pages)',
        ],
        orchestration: {
          experts: 3,
          switches: 12,
          time: '2 hours 15 min',
        },
      },
    },
  ];

  // Convert steps to Timeline items
  const timelineItems = steps.map((step, index) => {
    const isCompleted = index < steps.length - 1;
    const isActive = index === steps.length - 1;

    // Determine icon based on step
    let IconComponent = MessageCircle;
    if (step.step <= 2) IconComponent = BrainCircuit;
    else if (step.step >= 3 && step.step <= 4) IconComponent = Music;
    else if (step.step >= 5 && step.step <= 6) IconComponent = Workflow;
    else if (step.step >= 7 && step.step <= 9) IconComponent = Users;
    else if (step.step >= 10 && step.step <= 11) IconComponent = MessageCircle;
    else IconComponent = Sparkles;

    // Build rich content for each step
    const richContent = (
      <div className="space-y-3 mt-2">
        {/* Step 1: Question */}
        {step.step === 1 && step.question && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Challenge:</p>
            <p className="text-sm text-gray-900 dark:text-gray-100 italic">
              "{step.question}"
            </p>
          </div>
        )}

        {/* Step 2: AI Analysis */}
        {step.step === 2 && step.analysis && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <BrainCircuit className="h-4 w-4 text-green-600 dark:text-green-400" />
              AI Analysis:
            </p>
            <div className="space-y-3">
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Keywords:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {step.analysis.keywords.map((keyword: string, idx: number) => (
                    <Badge key={idx} variant="secondary" className="text-xs">
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-xs text-gray-500 dark:text-gray-400">Domains:</span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {step.analysis.domains.map((domain: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      {domain}
                    </Badge>
                  ))}
                </div>
              </div>
              <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                <p className="text-xs text-green-900 dark:text-green-100 font-medium">
                  {step.analysis.complexity}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Step 3-4: Expert Orchestra */}
        {(step.step >= 3 && step.step <= 4) && step.experts && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Music className="h-4 w-4 text-green-600 dark:text-green-400" />
              Expert Orchestra:
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
                          className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: `${expert.confidence}%` }}
                          transition={{ delay: idx * 0.2 + 0.3, duration: 0.6 }}
                        />
                      </div>
                      <span className="text-xs font-medium text-green-600 dark:text-green-400 w-10">
                        {expert.confidence}%
                      </span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Step 5-6: Orchestration Plan */}
        {(step.step >= 5 && step.step <= 6) && step.plan && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
              <Workflow className="h-4 w-4 text-green-600 dark:text-green-400" />
              Orchestration Plan:
            </p>
            <div className="space-y-3">
              {step.plan.phases.map((phase: any, idx: number) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.2 }}
                  className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                        {phase.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {phase.expert}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {phase.time}
                    </Badge>
                  </div>
                </motion.div>
              ))}
              <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  Checkpoints: {step.plan.checkpoints}
                </span>
                <span className="text-xs font-medium text-green-600 dark:text-green-400">
                  Total: {step.plan.totalTime}
                </span>
              </div>
              {step.step === 6 && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                  <Button size="sm" className="bg-green-600 hover:bg-green-700">
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    Approve Orchestration
                  </Button>
                  <Button size="sm" variant="outline">
                    Modify Plan
                  </Button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 7-9: Dynamic Orchestration */}
        {(step.step >= 7 && step.step <= 9) && (step.execution || step.switch) && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            {step.execution && (
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {step.execution.activeExpert}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.execution.phase}
                    </p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{step.execution.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <motion.div
                      className="bg-green-600 dark:bg-green-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${step.execution.progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
              </div>
            )}
            {step.switch && (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-4">
                  <div className="text-center">
                    <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-gray-600 dark:text-gray-400" />
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-400">{step.switch.from}</p>
                  </div>
                  <ArrowRight className="h-6 w-6 text-green-600 dark:text-green-400" />
                  <div className="text-center">
                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-2">
                      <Users className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                    <p className="text-xs font-medium text-green-600 dark:text-green-400">{step.switch.to}</p>
                  </div>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg text-center">
                  <p className="text-xs text-green-900 dark:text-green-100 font-medium">
                    {step.switch.context}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 10-11: Multi-turn Collaboration */}
        {(step.step >= 10 && step.step <= 11) && (step.question || step.answer) && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              {step.question && (
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Question:</p>
                  <p className="text-sm text-gray-900 dark:text-gray-100 italic">
                    "{step.question}"
                  </p>
                </div>
              )}
              {step.answer && (
                <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <p className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {step.answer.expert} (Switched Automatically)
                    </p>
                  </div>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {step.answer.response}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 12-13: Synthesis & Completion */}
        {(step.step >= 12 && step.step <= 13) && (step.synthesis || step.deliverables) && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              {step.step === 12 && step.synthesis && (
                <div className="text-center py-4">
                  <BrainCircuit className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-3" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                    AI Synthesis in Progress
                  </p>
                  <div className="grid grid-cols-3 gap-4 mt-4">
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {step.synthesis.experts}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Experts</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {step.synthesis.contributions}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Contributions</p>
                    </div>
                    <div className="text-center">
                      <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {step.synthesis.documents}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Documents</p>
                    </div>
                  </div>
                </div>
              )}
              {step.step === 13 && step.deliverables && (
                <>
                  <div className="text-center py-2">
                    <Sparkles className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                      Symphony Complete!
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {step.deliverables.orchestration.time}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Generated Documents:
                    </p>
                    <div className="space-y-2">
                      {step.deliverables.documents.map((doc: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-green-600 dark:text-green-400" />
                          <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">Orchestration Statistics:</p>
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {step.deliverables.orchestration.experts}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Experts</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {step.deliverables.orchestration.switches}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Switches</p>
                      </div>
                      <div>
                        <p className="text-lg font-bold text-green-600 dark:text-green-400">
                          {step.deliverables.orchestration.time}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Duration</p>
                      </div>
                    </div>
                  </div>
                </>
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
          <BookOpen className="h-5 w-5 text-green-600 dark:text-green-400" />
          Complete User Journey
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Follow the complete journey from your complex challenge to a comprehensive solution with dynamic expert orchestration
        </p>
      </div>

      {/* Timeline Visualization */}
      <Timeline items={timelineItems} activeIndex={steps.length - 1} />

      {/* Journey Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-lg border border-green-200 dark:border-green-800"
      >
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
          Journey Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Total Steps:</strong> 13 steps across 6 phases
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Music className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Average Time:</strong> 60-120 sec per turn
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Key Feature:</strong> AI orchestrates 2-4 experts dynamically
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Result:</strong> Comprehensive solution with expert orchestration
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
      question: 'Help me develop a comprehensive market entry strategy for a new biotech drug in the US and EU markets. Include regulatory, reimbursement, and competitive analysis.',
      description: 'Perfect for complex multi-domain projects requiring multiple experts',
      experts: ['Market Access Expert', 'Regulatory Expert', 'EU Market Expert'],
      agentSearchTerms: ['market', 'access', 'regulatory', 'eu', 'biotech', 'reimbursement'],
    },
    {
      question: 'Create a complete regulatory and clinical strategy for a new medical device including FDA approval, clinical trials, and market access considerations.',
      description: 'Ideal for comprehensive device development projects',
      experts: ['Regulatory Expert', 'Clinical Trial Expert', 'Market Access Expert'],
      agentSearchTerms: ['regulatory', 'clinical', 'trial', 'fda', 'market', 'access'],
    },
    {
      question: 'Design an integrated global expansion strategy for a biotech product covering US, EU, and Asia-Pacific markets with regulatory, reimbursement, and commercial considerations.',
      description: 'Best for complex international expansion projects',
      experts: ['Regulatory Expert', 'Market Access Expert', 'International Expert', 'Business Expert'],
      agentSearchTerms: ['regulatory', 'market', 'access', 'international', 'global', 'expansion'],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-green-600 dark:text-green-400" />
        Try an Example
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click any example below to automatically fill your query. AI will orchestrate multiple experts 
        to handle your complex challenge.
      </p>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onExampleClick?.(example)}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-green-500 dark:hover:border-green-600 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-green-600 dark:group-hover:text-green-400">
                  {example.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Music className="h-3 w-3 mr-1" />
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
                className="text-green-600 dark:text-green-400"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-900 dark:text-green-100">
            <strong>Note:</strong> When you click an example, AI will automatically orchestrate multiple experts 
            to handle your complex challenge. Experts will work together dynamically, switching as needed 
            throughout the conversation.
          </p>
        </div>
      </div>
    </div>
  );
}


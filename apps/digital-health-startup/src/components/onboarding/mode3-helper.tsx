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
  UserCheck,
  Sparkles,
  Workflow,
  CheckCircle2,
  X,
  ChevronRight,
  Info,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
  Users,
  BrainCircuit,
  FileText,
  Play,
  Clock,
  ArrowRight,
  MessageCircle,
} from 'lucide-react';

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface ExampleData {
  question: string;
  expert: string;
  description: string;
  workflow: string[];
  agentId?: string;
  agentSearchTerms?: string[];
}

interface Mode3HelperProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  variant?: 'inline' | 'modal';
  showOnFirstVisit?: boolean;
  autoDismiss?: boolean;
  onExampleClick?: (example: ExampleData) => void;
}

type StepData = 
  | { phase: string; step: number; title: string; description: string; expert?: { name: string; specialty: string; avatar: string } }
  | { phase: string; step: number; title: string; description: string; project?: { question: string; complexity: string } }
  | { phase: string; step: number; title: string; description: string; plan?: { phases: Array<{ name: string; time: string; tools: string[] }>; checkpoints: number; totalTime: string } }
  | { phase: string; step: number; title: string; description: string; status?: string }
  | { phase: string; step: number; title: string; description: string; execution?: { currentPhase: string; progress: number; tools: string[] } }
  | { phase: string; step: number; title: string; description: string; results?: { phase: string; findings: string; documents: string[] } }
  | { phase: string; step: number; title: string; description: string; collaboration?: { question: string; answer: string } }
  | { phase: string; step: number; title: string; description: string; deliverables?: { documents: string[]; totalTime: string } };

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export function Mode3Helper({
  open: controlledOpen,
  onOpenChange,
  variant = 'modal',
  showOnFirstVisit = false,
  autoDismiss = false,
  onExampleClick,
}: Mode3HelperProps) {
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
              <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                <UserCheck className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <DialogTitle className="text-xl font-semibold">Mode 3: Manual Autonomous</DialogTitle>
                <DialogDescription className="text-sm text-muted-foreground mt-1">
                  Deep collaborative work with your chosen expert + autonomous AI
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
          <Target className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          When to Use Mode 3
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          Mode 3 combines your expert choice with AI's autonomous reasoning. You select a specific expert 
          who will work with you throughout the entire conversation, while AI handles complex planning, 
          research, and multi-step workflows. Perfect for deep dives and complex projects.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">Best For</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Deep dives with specific expert</li>
            <li>• Complex multi-step workflows</li>
            <li>• Document generation</li>
            <li>• Research synthesis</li>
            <li>• Strategic planning</li>
          </ul>
        </div>

        <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="font-medium text-gray-900 dark:text-gray-100">What to Expect</span>
          </div>
          <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
            <li>• Same expert throughout</li>
            <li>• AI plans and executes workflows</li>
            <li>• Checkpoints for your approval</li>
            <li>• Multi-turn conversation</li>
            <li>• Professional deliverables</li>
          </ul>
        </div>
      </div>

      {/* Partnership Visualization */}
      <div className="mt-6 p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          The Expert + AI Partnership
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-12 h-12 mx-auto mb-2 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
              <UserCheck className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">You</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Vision & Guidance</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-12 h-12 mx-auto mb-2 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
              <Target className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">Expert</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Deep Knowledge</p>
          </div>
          <div className="text-center p-4 bg-white dark:bg-gray-900 rounded-lg border border-purple-200 dark:border-purple-800">
            <div className="w-12 h-12 mx-auto mb-2 bg-teal-100 dark:bg-teal-900/30 rounded-full flex items-center justify-center">
              <BrainCircuit className="h-6 w-6 text-teal-600 dark:text-teal-400" />
            </div>
            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">AI</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Planning & Execution</p>
          </div>
        </div>
        <div className="mt-4 text-center">
          <ArrowRight className="h-5 w-5 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
          <p className="text-sm font-medium text-purple-900 dark:text-purple-200">
            = Comprehensive Solution
          </p>
        </div>
      </div>

      {/* Mode Comparison */}
      <div className="mt-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4 flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-600 dark:text-purple-400" />
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
      mode4: 'AI selects/switches',
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
      feature: 'Checkpoints',
      mode1: 'No',
      mode2: 'No',
      mode3: 'Yes',
      mode4: 'Yes',
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
            <th className="text-center p-3 font-semibold text-purple-600 dark:text-purple-400">Mode 3</th>
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
              <td className="p-3 text-center text-gray-600 dark:text-gray-400">{row.mode2}</td>
              <td className="p-3 text-center font-medium text-purple-600 dark:text-purple-400">{row.mode3}</td>
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
  const steps: StepData[] = [
    {
      phase: 'Phase 1: Expert Selection',
      step: 1,
      title: 'Select Your Expert Partner',
      description: 'Choose the expert who will work with you throughout the entire project for consistency.',
      expert: {
        name: 'Regulatory Expert',
        specialty: 'FDA pathways and regulatory strategy',
        avatar: '🎯',
      },
    },
    {
      phase: 'Phase 1: Expert Selection',
      step: 2,
      title: 'Expert Selected',
      description: 'Your expert is ready to collaborate. They will maintain consistent voice and expertise throughout.',
      expert: {
        name: 'Regulatory Expert',
        specialty: 'FDA pathways and regulatory strategy',
        avatar: '🎯',
      },
    },
    {
      phase: 'Phase 2: Project Planning',
      step: 3,
      title: 'Describe Your Project',
      description: 'Tell your expert about your complex project or challenge.',
      project: {
        question: 'Help me design and get FDA approval for a new medical device. Walk me through the entire process.',
        complexity: 'Multi-step workflow',
      },
    },
    {
      phase: 'Phase 2: Project Planning',
      step: 4,
      title: 'AI Creates Workflow Plan',
      description: 'AI analyzes your project and creates a comprehensive workflow plan with phases and checkpoints.',
      plan: {
        phases: [
          { name: 'Device Classification', time: '15 min', tools: ['RAG', 'Analysis'] },
          { name: 'Regulatory Strategy', time: '25 min', tools: ['Document Gen', 'Web Search'] },
          { name: 'Risk Assessment', time: '20 min', tools: ['Analysis', 'Document Gen'] },
        ],
        checkpoints: 3,
        totalTime: '1 hour',
      },
    },
    {
      phase: 'Phase 3: Checkpoint Approval',
      step: 5,
      title: 'Review and Approve Plan',
      description: 'Review the workflow plan, see estimated time and tools, then approve to begin execution.',
      plan: {
        phases: [
          { name: 'Device Classification', time: '15 min', tools: ['RAG', 'Analysis'] },
          { name: 'Regulatory Strategy', time: '25 min', tools: ['Document Gen', 'Web Search'] },
          { name: 'Risk Assessment', time: '20 min', tools: ['Analysis', 'Document Gen'] },
        ],
        checkpoints: 3,
        totalTime: '1 hour',
      },
    },
    {
      phase: 'Phase 3: Checkpoint Approval',
      step: 6,
      title: 'Plan Approved',
      description: 'Your expert and AI are ready to begin autonomous execution of the workflow.',
      status: 'approved',
    },
    {
      phase: 'Phase 4: Autonomous Execution',
      step: 7,
      title: 'AI Executes Workflow',
      description: 'AI works autonomously through each phase, using tools and researching as needed.',
      execution: {
        currentPhase: 'Device Classification',
        progress: 45,
        tools: ['RAG Search', 'Analysis'],
      },
    },
    {
      phase: 'Phase 4: Autonomous Execution',
      step: 8,
      title: 'Phase 1 Complete',
      description: 'First phase completed. Expert provides results and asks for approval to continue.',
      results: {
        phase: 'Device Classification',
        findings: 'Class II medical device',
        documents: ['Classification Report'],
      },
    },
    {
      phase: 'Phase 5: Collaboration',
      step: 9,
      title: 'Ask Questions Anytime',
      description: 'You can ask questions, provide feedback, or guide direction at any time during execution.',
      collaboration: {
        question: 'How does this classification affect my timeline?',
        answer: 'Class II typically requires 12-month timeline for 510(k) clearance...',
      },
    },
    {
      phase: 'Phase 5: Collaboration',
      step: 10,
      title: 'Expert Responds',
      description: 'Your expert provides detailed answers while AI continues workflow execution in the background.',
      collaboration: {
        question: 'How does this classification affect my timeline?',
        answer: 'Class II typically requires 12-month timeline for 510(k) clearance...',
      },
    },
    {
      phase: 'Phase 6: Workflow Completion',
      step: 11,
      title: 'All Phases Complete',
      description: 'Workflow execution complete. All phases finished with comprehensive deliverables.',
      deliverables: {
        documents: [
          'Complete Regulatory Strategy (15 pages)',
          'Risk Management File',
          'Clinical Evaluation Plan',
          'Submission Timeline',
        ],
        totalTime: '1 hour 15 min',
      },
    },
    {
      phase: 'Phase 6: Workflow Completion',
      step: 12,
      title: 'Project Complete',
      description: 'Your comprehensive project is ready. Download documents and continue conversation if needed.',
      deliverables: {
        documents: [
          'Complete Regulatory Strategy (15 pages)',
          'Risk Management File',
          'Clinical Evaluation Plan',
          'Submission Timeline',
        ],
        totalTime: '1 hour 15 min',
      },
    },
  ];

  // Convert steps to Timeline items
  const timelineItems = steps.map((step, index) => {
    const isCompleted = index < steps.length - 1;
    const isActive = index === steps.length - 1;

    // Determine icon based on step
    let IconComponent = UserCheck;
    if (step.step <= 2) IconComponent = UserCheck;
    else if (step.step >= 3 && step.step <= 4) IconComponent = MessageCircle;
    else if (step.step >= 5 && step.step <= 6) IconComponent = CheckCircle2;
    else if (step.step >= 7 && step.step <= 8) IconComponent = Workflow;
    else if (step.step >= 9 && step.step <= 10) IconComponent = BrainCircuit;
    else IconComponent = Sparkles;

    // Build rich content for each step
    const richContent = (
      <div className="space-y-3 mt-2">
        {/* Step 1-2: Expert Selection */}
        {(step.step <= 2) && 'expert' in step && step.expert && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center text-2xl">
                {String(step.expert.avatar)}
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  {step.expert.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {step.expert.specialty}
                </p>
                {step.step === 2 && (
                  <Badge variant="outline" className="mt-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-300 dark:border-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Selected & Ready
                  </Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 3-4: Project Planning */}
        {(step.step >= 3 && step.step <= 4) && 'project' in step && step.project && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Your Project:</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 italic">
                  "{step.project.question}"
                </p>
              </div>
              {step.step === 4 && 'plan' in step && step.plan && (() => {
                const plan = step.plan as { phases: Array<{ name: string; time: string; tools: string[] }>; checkpoints: number; totalTime: string } | undefined;
                if (!plan) return null;
                return (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                      <Workflow className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      Workflow Plan Created:
                    </p>
                    <div className="space-y-3">
                        <>
                          {plan.phases.map((phase: { name: string; time: string; tools: string[] }, idx: number) => (
                            <motion.div
                              key={idx}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.2 }}
                              className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
                            >
                              <div className="flex items-center justify-between mb-2">
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                  {phase.name}
                                </p>
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {phase.time}
                                </Badge>
                              </div>
                              <div className="flex gap-2">
                                {phase.tools.map((tool: string, toolIdx: number) => (
                                  <Badge key={toolIdx} variant="secondary" className="text-xs">
                                    {tool}
                                  </Badge>
                                ))}
                              </div>
                            </motion.div>
                          ))}
                          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between">
                            <span className="text-xs text-gray-500 dark:text-gray-400">
                              Checkpoints: {plan.checkpoints}
                            </span>
                            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
                              Total: {plan.totalTime}
                            </span>
                          </div>
                        </>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Step 5-6: Checkpoint Approval */}
        {(step.step >= 5 && step.step <= 6) && 'plan' in step && step.plan && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              {step.step === 5 && step.plan && (
                <>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Review the workflow plan:
                  </p>
                  <div className="space-y-2">
                    {(step.plan as { phases: Array<{ name: string; time: string; tools: string[] }>; checkpoints: number; totalTime: string }).phases.map((phase: { name: string; time: string; tools: string[] }, idx: number) => (
                      <div key={idx} className="flex items-center gap-2 text-sm">
                        <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        <span className="text-gray-700 dark:text-gray-300">{phase.name}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800 flex gap-2">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      <CheckCircle2 className="h-4 w-4 mr-1" />
                      Approve Plan
                    </Button>
                    <Button size="sm" variant="outline">
                      Modify Plan
                    </Button>
                  </div>
                </>
              )}
              {step.step === 6 && (
                <div className="text-center py-4">
                  <CheckCircle2 className="h-12 w-12 text-green-600 dark:text-green-400 mx-auto mb-2" />
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                    Plan Approved!
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Starting autonomous execution...
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 7-8: Autonomous Execution */}
        {(step.step >= 7 && step.step <= 8) && 'execution' in step && step.execution && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                  <Workflow className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                  Current Phase: {step.execution.currentPhase}
                </p>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <span>Progress</span>
                    <span>{step.execution.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2">
                    <motion.div
                      className="bg-purple-600 dark:bg-purple-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${step.execution.progress}%` }}
                      transition={{ duration: 0.8 }}
                    />
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  {step.execution.tools.map((tool: string, idx: number) => (
                    <Badge key={idx} variant="outline" className="text-xs">
                      <BrainCircuit className="h-3 w-3 mr-1" />
                      {tool}
                    </Badge>
                  ))}
                </div>
              </div>
              {step.step === 8 && 'results' in step && step.results && (() => {
                const results = step.results as { phase: string; findings: string; documents: string[] } | undefined;
                if (!results) return null;
                return (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Phase Results:
                    </p>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-900 dark:text-gray-100">
                        {String(results.findings)}
                      </p>
                      <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Documents:</p>
                        {results.documents.map((doc: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2 text-sm">
                          <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* Step 9-10: Collaboration */}
        {(step.step >= 9 && step.step <= 10) && 'collaboration' in step && step.collaboration && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Your Question:</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 italic mb-3">
                  "{step.collaboration.question}"
                </p>
                {step.step === 10 && (
                  <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-800">
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Expert Response:</p>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {step.collaboration.answer}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Step 11-12: Workflow Completion */}
        {(step.step >= 11 && step.step <= 12) && 'deliverables' in step && step.deliverables && (
          <div className="mt-3 p-4 bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800">
            <div className="space-y-3">
              <div className="text-center py-2">
                <Sparkles className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">
                  Workflow Complete!
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Total time: {step.deliverables.totalTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Generated Documents:
                </p>
                <div className="space-y-2">
                  {step.deliverables.documents.map((doc: string, idx: number) => (
                    <div key={idx} className="flex items-center gap-2 text-sm">
                      <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-gray-700 dark:text-gray-300">{doc}</span>
                    </div>
                  ))}
                </div>
              </div>
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
          <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          Complete User Journey
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Follow the complete journey from expert selection to workflow completion with autonomous AI assistance
        </p>
      </div>

      {/* Timeline Visualization */}
      <Timeline items={timelineItems} activeIndex={steps.length - 1} />

      {/* Journey Summary */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-lg border border-purple-200 dark:border-purple-800"
      >
        <h4 className="font-semibold mb-3 text-gray-900 dark:text-gray-100 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          Journey Summary
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Total Steps:</strong> 12 steps across 6 phases
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Workflow className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Average Time:</strong> 45-90 sec per turn
            </span>
          </div>
          <div className="flex items-center gap-2">
            <UserCheck className="h-4 w-4 text-purple-600 dark:text-purple-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Key Feature:</strong> Manual expert + autonomous workflows
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-green-600 dark:text-green-400" />
            <span className="text-gray-700 dark:text-gray-300">
              <strong>Result:</strong> Complete project with checkpoints
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
      question: 'Help me design and get FDA approval for a new medical device. Walk me through the entire process.',
      expert: 'Regulatory Expert',
      description: 'Perfect for complex regulatory projects requiring multi-step workflows',
      workflow: ['Device Classification', 'Regulatory Strategy', 'Risk Assessment', 'Documentation'],
      agentSearchTerms: ['regulatory', 'fda', 'approval', 'medical device', 'regulatory affairs'],
    },
    {
      question: 'Design a comprehensive Phase 3 clinical trial protocol with all regulatory considerations.',
      expert: 'Clinical Trial Expert',
      description: 'Ideal for complex clinical research projects',
      workflow: ['Protocol Design', 'Regulatory Review', 'Risk Assessment', 'Documentation'],
      agentSearchTerms: ['clinical', 'trial', 'protocol', 'phase 3', 'clinical development'],
    },
    {
      question: 'Create a complete market access strategy for a new biotech drug including reimbursement and pricing.',
      expert: 'Market Access Expert',
      description: 'Best for complex market entry projects',
      workflow: ['Market Analysis', 'Reimbursement Strategy', 'Pricing Analysis', 'Documentation'],
      agentSearchTerms: ['market', 'access', 'reimbursement', 'biotech', 'market access'],
    },
  ];

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
        <Lightbulb className="h-5 w-5 text-purple-600 dark:text-purple-400" />
        Try an Example
      </h3>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Click any example below to automatically fill your query and select the recommended expert. 
        AI will create a workflow plan for your complex project.
      </p>

      <div className="space-y-3">
        {examples.map((example, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            onClick={() => onExampleClick?.(example)}
            className="p-4 border-2 border-gray-200 dark:border-gray-700 rounded-lg hover:border-purple-500 dark:hover:border-purple-600 cursor-pointer transition-all hover:shadow-md group"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <p className="font-medium text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                  {example.question}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <Badge variant="secondary" className="text-xs">
                    <Target className="h-3 w-3 mr-1" />
                    {example.expert}
                  </Badge>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {example.description}
                  </span>
                </div>
                <div className="mt-2">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Workflow phases:</p>
                  <div className="flex flex-wrap gap-1">
                    {example.workflow.map((phase, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        <Workflow className="h-3 w-3 mr-1" />
                        {phase}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
              <motion.div
                whileHover={{ scale: 1.1 }}
                className="text-purple-600 dark:text-purple-400"
              >
                <ChevronRight className="h-5 w-5" />
              </motion.div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
        <div className="flex items-start gap-2">
          <Lightbulb className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-purple-900 dark:text-purple-100">
            <strong>Note:</strong> When you click an example, the expert will be selected and AI will create 
            a workflow plan for your complex project. You can review and approve the plan before execution begins.
          </p>
        </div>
      </div>
    </div>
  );
}


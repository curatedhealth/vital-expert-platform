/**
 * AI Panel Creation Wizard
 *
 * An AI-guided 8-step wizard for creating expert panels with HITL checkpoints:
 * 1. Enter prompt (user input)
 * 2. Review parsed goals (HITL)
 * 3. AI generates questions
 * 4. Review questions (HITL)
 * 5. AI suggests panel type
 * 6. Review panel type (HITL)
 * 7. AI recommends agents
 * 8. Review agents (HITL)
 * 9. Review proposal & launch
 *
 * Features:
 * - Session persistence in localStorage (resume after refresh/failure)
 * - Automatic retry on API failures
 * - Recovery UI for incomplete sessions
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  MessageSquare,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Wand2,
  Target,
  HelpCircle,
  LayoutGrid,
  Bot,
  FileText,
  X,
  Plus,
  Trash2,
  Edit3,
  Loader2,
  AlertCircle,
  Save,
  Rocket,
  Percent,
  Clock,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  History,
} from 'lucide-react';
import {
  getPanelWizardClient,
  type WizardState,
  type WizardObjective,
  type WizardQuestion,
  type WizardAgent,
  type PanelType,
} from '@/lib/api/panel-client';

// ============================================================================
// SESSION PERSISTENCE
// ============================================================================

const WIZARD_STORAGE_KEY = 'vital_panel_wizard_session';

interface WizardSessionData {
  sessionId: string | null;
  phase: WizardPhase;
  prompt: string;
  wizardState: WizardState | null;
  editingObjectives: WizardObjective[];
  editingQuestions: WizardQuestion[];
  selectedPanelType: PanelType | null;
  editingAgents: WizardAgent[];
  panelSettings: {
    max_rounds: number;
    require_consensus: boolean;
    allow_debate: boolean;
  };
  lastUpdated: number;
  lastError: string | null;
  retryCount: number;
}

function saveWizardSession(data: WizardSessionData): void {
  try {
    localStorage.setItem(WIZARD_STORAGE_KEY, JSON.stringify({
      ...data,
      lastUpdated: Date.now(),
    }));
  } catch (e) {
    console.warn('[Wizard] Failed to save session:', e);
  }
}

function loadWizardSession(): WizardSessionData | null {
  try {
    const stored = localStorage.getItem(WIZARD_STORAGE_KEY);
    if (!stored) return null;

    const data = JSON.parse(stored) as WizardSessionData;

    // Check if session is too old (24 hours)
    const maxAge = 24 * 60 * 60 * 1000;
    if (Date.now() - data.lastUpdated > maxAge) {
      clearWizardSession();
      return null;
    }

    return data;
  } catch (e) {
    console.warn('[Wizard] Failed to load session:', e);
    return null;
  }
}

function clearWizardSession(): void {
  try {
    localStorage.removeItem(WIZARD_STORAGE_KEY);
  } catch (e) {
    console.warn('[Wizard] Failed to clear session:', e);
  }
}

// ============================================================================
// RETRY LOGIC
// ============================================================================

const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // Exponential backoff

async function withRetry<T>(
  fn: () => Promise<T>,
  retryCount: number = 0,
  onRetry?: (attempt: number, error: Error) => void
): Promise<T> {
  try {
    return await fn();
  } catch (error) {
    if (retryCount < MAX_RETRIES) {
      const delay = RETRY_DELAYS[retryCount] || 4000;
      onRetry?.(retryCount + 1, error as Error);
      await new Promise(resolve => setTimeout(resolve, delay));
      return withRetry(fn, retryCount + 1, onRetry);
    }
    throw error;
  }
}

interface AIWizardPanelProps {
  onComplete: (missionId: string, streamUrl: string) => void;
  onCancel: () => void;
  onSaveDraft?: () => void;
}

type WizardPhase =
  | 'prompt'           // Step 1: Enter prompt
  | 'goals'            // Step 2: Review goals (HITL)
  | 'questions'        // Step 3-4: Generate & review questions (HITL)
  | 'panel_type'       // Step 5-6: Suggest & review panel type (HITL)
  | 'agents'           // Step 7-8: Recommend & review agents (HITL)
  | 'proposal';        // Step 9: Review proposal & launch

const PHASES: WizardPhase[] = ['prompt', 'goals', 'questions', 'panel_type', 'agents', 'proposal'];

const PHASE_LABELS: Record<WizardPhase, string> = {
  prompt: 'Describe Your Panel',
  goals: 'Confirm Goals',
  questions: 'Review Questions',
  panel_type: 'Select Panel Type',
  agents: 'Select Experts',
  proposal: 'Review & Launch',
};

const PANEL_TYPE_INFO: Record<PanelType, { name: string; description: string; icon: React.ReactNode }> = {
  structured: {
    name: 'Structured',
    description: 'Sequential, moderated discussion with clear structure',
    icon: <LayoutGrid className="w-5 h-5" />,
  },
  open: {
    name: 'Open',
    description: 'Free-form brainstorming and ideation',
    icon: <MessageSquare className="w-5 h-5" />,
  },
  socratic: {
    name: 'Socratic',
    description: 'Dialectical questioning for deep analysis',
    icon: <HelpCircle className="w-5 h-5" />,
  },
  adversarial: {
    name: 'Adversarial',
    description: 'Pro/con debate for decision validation',
    icon: <Target className="w-5 h-5" />,
  },
  delphi: {
    name: 'Delphi',
    description: 'Iterative consensus building with voting',
    icon: <Users className="w-5 h-5" />,
  },
  hybrid: {
    name: 'Hybrid',
    description: 'Human-AI collaborative panel with checkpoints',
    icon: <Bot className="w-5 h-5" />,
  },
};

export function AIWizardPanel({ onComplete, onCancel, onSaveDraft }: AIWizardPanelProps) {
  const [phase, setPhase] = useState<WizardPhase>('prompt');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [wizardState, setWizardState] = useState<WizardState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retrying, setRetrying] = useState(false);
  const [retryAttempt, setRetryAttempt] = useState(0);
  const [showRecoveryPrompt, setShowRecoveryPrompt] = useState(false);
  const [savedSession, setSavedSession] = useState<WizardSessionData | null>(null);

  // User input states
  const [prompt, setPrompt] = useState('');
  const [editingObjectives, setEditingObjectives] = useState<WizardObjective[]>([]);
  const [editingQuestions, setEditingQuestions] = useState<WizardQuestion[]>([]);
  const [selectedPanelType, setSelectedPanelType] = useState<PanelType | null>(null);
  const [editingAgents, setEditingAgents] = useState<WizardAgent[]>([]);
  const [panelSettings, setPanelSettings] = useState({
    max_rounds: 2,
    require_consensus: false,
    allow_debate: true,
  });

  const client = getPanelWizardClient();
  const hasInitialized = useRef(false);

  // Save session whenever state changes
  const saveCurrentSession = useCallback(() => {
    if (!hasInitialized.current) return;

    saveWizardSession({
      sessionId,
      phase,
      prompt,
      wizardState,
      editingObjectives,
      editingQuestions,
      selectedPanelType,
      editingAgents,
      panelSettings,
      lastUpdated: Date.now(),
      lastError: error,
      retryCount: retryAttempt,
    });
  }, [sessionId, phase, prompt, wizardState, editingObjectives, editingQuestions, selectedPanelType, editingAgents, panelSettings, error, retryAttempt]);

  // Auto-save on state changes (debounced)
  useEffect(() => {
    if (!hasInitialized.current) return;

    const timer = setTimeout(() => {
      saveCurrentSession();
    }, 500);

    return () => clearTimeout(timer);
  }, [saveCurrentSession]);

  // Check for saved session on mount
  useEffect(() => {
    const saved = loadWizardSession();
    if (saved && saved.phase !== 'prompt') {
      // We have a saved session with progress
      setSavedSession(saved);
      setShowRecoveryPrompt(true);
    } else {
      // No saved session or only at prompt phase, start fresh
      startSession();
    }
    hasInitialized.current = true;
  }, []);

  // Restore saved session
  const restoreSession = useCallback(() => {
    if (!savedSession) return;

    setPhase(savedSession.phase);
    setSessionId(savedSession.sessionId);
    setPrompt(savedSession.prompt);
    setWizardState(savedSession.wizardState);
    setEditingObjectives(savedSession.editingObjectives);
    setEditingQuestions(savedSession.editingQuestions);
    setSelectedPanelType(savedSession.selectedPanelType);
    setEditingAgents(savedSession.editingAgents);
    setPanelSettings(savedSession.panelSettings);
    setShowRecoveryPrompt(false);
    setSavedSession(null);

    // If there was an error, show it
    if (savedSession.lastError) {
      setError(`Previous session had an error: ${savedSession.lastError}. You can retry from where you left off.`);
    }
  }, [savedSession]);

  // Start fresh, discarding saved session
  const startFresh = useCallback(() => {
    clearWizardSession();
    setShowRecoveryPrompt(false);
    setSavedSession(null);
    startSession();
  }, []);

  const startSession = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await withRetry(
        () => client.startSession(),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );
      setSessionId(response.session_id);
      setRetrying(false);
      setRetryAttempt(0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to start wizard session');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Parse intent and move to goals phase
  const handleSubmitPrompt = async () => {
    if (!sessionId || !prompt.trim()) return;

    try {
      setLoading(true);
      setError(null);
      setRetrying(false);
      const state = await withRetry(
        () => client.parseIntent(sessionId, prompt),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );
      setWizardState(state);
      setEditingObjectives(state.objectives || []);
      setPhase('goals');
      setRetrying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to parse intent');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Confirm goals and generate questions
  const handleConfirmGoals = async (confirmed: boolean) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      setRetrying(false);

      // First confirm goals
      let state = await withRetry(
        () => client.confirmGoals(sessionId, confirmed, {
          objectives: editingObjectives,
        }),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );

      if (confirmed) {
        // Then generate questions
        state = await withRetry(
          () => client.generateQuestions(sessionId),
          0,
          (attempt) => {
            setRetrying(true);
            setRetryAttempt(attempt);
          }
        );
        setWizardState(state);
        setEditingQuestions(state.questions || []);
        setPhase('questions');
      } else {
        setWizardState(state);
      }
      setRetrying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm goals');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Confirm questions and suggest panel type
  const handleConfirmQuestions = async (confirmed: boolean) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      setRetrying(false);

      let state = await withRetry(
        () => client.confirmQuestions(sessionId, confirmed, editingQuestions),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );

      if (confirmed) {
        state = await withRetry(
          () => client.suggestPanelType(sessionId),
          0,
          (attempt) => {
            setRetrying(true);
            setRetryAttempt(attempt);
          }
        );
        setWizardState(state);
        setSelectedPanelType(state.recommended_panel_type || 'structured');
        if (state.panel_settings) {
          setPanelSettings({
            max_rounds: state.panel_settings.max_rounds || 2,
            require_consensus: state.panel_settings.require_consensus || false,
            allow_debate: state.panel_settings.allow_debate || true,
          });
        }
        setPhase('panel_type');
      } else {
        setWizardState(state);
      }
      setRetrying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm questions');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Confirm panel type and recommend agents
  const handleConfirmPanelType = async (confirmed: boolean) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      setRetrying(false);

      let state = await withRetry(
        () => client.confirmPanelType(sessionId, confirmed, selectedPanelType || undefined, panelSettings),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );

      if (confirmed) {
        state = await withRetry(
          () => client.recommendAgents(sessionId),
          0,
          (attempt) => {
            setRetrying(true);
            setRetryAttempt(attempt);
          }
        );
        setWizardState(state);
        setEditingAgents(state.selected_agents || []);
        setPhase('agents');
      } else {
        setWizardState(state);
      }
      setRetrying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm panel type');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Confirm agents and finalize
  const handleConfirmAgents = async (confirmed: boolean) => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      setRetrying(false);

      let state = await withRetry(
        () => client.confirmAgents(sessionId, confirmed, editingAgents),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );

      if (confirmed) {
        state = await withRetry(
          () => client.finalize(sessionId),
          0,
          (attempt) => {
            setRetrying(true);
            setRetryAttempt(attempt);
          }
        );
        setWizardState(state);
        setPhase('proposal');
      } else {
        setWizardState(state);
      }
      setRetrying(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to confirm agents');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Launch the panel
  const handleLaunch = async () => {
    if (!sessionId) return;

    try {
      setLoading(true);
      setError(null);
      setRetrying(false);

      const result = await withRetry(
        () => client.launch(sessionId),
        0,
        (attempt) => {
          setRetrying(true);
          setRetryAttempt(attempt);
        }
      );

      // Store wizard data in sessionStorage for autonomous page to use
      // Include the full goal with questions for proper display
      const questions = wizardState?.proposal?.questions || editingQuestions || [];
      const objectives = editingObjectives || [];

      // Build comprehensive goal for display
      let fullGoal = wizardState?.primary_intent || prompt;
      if (objectives.length > 0) {
        fullGoal += '\n\nKey Objectives:\n' + objectives.map((o, i) => `${i + 1}. ${o.text}`).join('\n');
      }
      if (questions.length > 0) {
        fullGoal += '\n\nKey Questions to Address:\n' + questions.map((q, i) => `${i + 1}. ${typeof q === 'string' ? q : q.question}`).join('\n');
      }

      sessionStorage.setItem('wizardGoal', fullGoal);
      sessionStorage.setItem('wizardPanelType', wizardState?.proposal?.panel_type || selectedPanelType || 'structured');
      sessionStorage.setItem('wizardQuestions', JSON.stringify(questions));
      sessionStorage.setItem('wizardObjectives', JSON.stringify(objectives));

      // Clear the saved session on successful launch
      clearWizardSession();

      setRetrying(false);
      onComplete(result.mission_id, result.stream_url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to launch panel');
      setRetrying(false);
    } finally {
      setLoading(false);
    }
  };

  // Save as draft
  const handleSaveDraft = async () => {
    if (!sessionId || !wizardState?.primary_intent) return;

    try {
      setLoading(true);
      const name = wizardState.primary_intent.slice(0, 100);
      await client.saveDraft(sessionId, name);
      onSaveDraft?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save draft');
    } finally {
      setLoading(false);
    }
  };

  // Navigate back
  const goBack = () => {
    const currentIndex = PHASES.indexOf(phase);
    if (currentIndex > 0) {
      setPhase(PHASES[currentIndex - 1]);
    }
  };

  // Add a new objective
  const addObjective = () => {
    const newObj: WizardObjective = {
      id: `obj_user_${Date.now()}`,
      text: '',
      is_user_added: true,
    };
    setEditingObjectives([...editingObjectives, newObj]);
  };

  // Remove an objective
  const removeObjective = (id: string) => {
    setEditingObjectives(editingObjectives.filter(o => o.id !== id));
  };

  // Update an objective
  const updateObjective = (id: string, text: string) => {
    setEditingObjectives(editingObjectives.map(o => o.id === id ? { ...o, text } : o));
  };

  // Add a new question
  const addQuestion = () => {
    const newQ: WizardQuestion = {
      id: `q_user_${Date.now()}`,
      question: '',
      rationale: '',
      assigned_to: 'all',
      priority: 'medium',
      is_user_added: true,
      order: editingQuestions.length,
    };
    setEditingQuestions([...editingQuestions, newQ]);
  };

  // Remove a question
  const removeQuestion = (id: string) => {
    setEditingQuestions(editingQuestions.filter(q => q.id !== id));
  };

  // Update a question
  const updateQuestion = (id: string, updates: Partial<WizardQuestion>) => {
    setEditingQuestions(editingQuestions.map(q => q.id === id ? { ...q, ...updates } : q));
  };

  // Toggle agent selection
  const toggleAgent = (agent: WizardAgent) => {
    const isSelected = editingAgents.some(a => a.agent_id === agent.agent_id);
    if (isSelected) {
      setEditingAgents(editingAgents.filter(a => a.agent_id !== agent.agent_id));
    } else {
      setEditingAgents([...editingAgents, agent]);
    }
  };

  // Get current phase index for progress bar
  const currentPhaseIndex = PHASES.indexOf(phase);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-canvas-surface dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-200 dark:border-neutral-700 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-neutral-900 dark:text-white flex items-center gap-2">
                <Wand2 className="w-6 h-6 text-violet-500" />
                AI Panel Creation Wizard
              </h2>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
                {PHASE_LABELS[phase]}
              </p>
            </div>

            <button
              onClick={onCancel}
              className="p-2 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            </button>
          </div>

          {/* Progress Steps */}
          <div className="flex items-center gap-1 mt-4">
            {PHASES.map((p, idx) => (
              <div
                key={p}
                className={`
                  flex-1 h-2 rounded-full transition-all
                  ${idx < currentPhaseIndex ? 'bg-violet-500' : idx === currentPhaseIndex ? 'bg-violet-300' : 'bg-neutral-200 dark:bg-neutral-700'}
                `}
              />
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-neutral-500">
            <span>Intent</span>
            <span>Goals</span>
            <span>Questions</span>
            <span>Type</span>
            <span>Experts</span>
            <span>Launch</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Recovery Prompt */}
          {showRecoveryPrompt && savedSession && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-6 bg-gradient-to-r from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20 border border-amber-200 dark:border-amber-700 rounded-xl"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0">
                  <History className="w-6 h-6 text-amber-600 dark:text-amber-300" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-neutral-900 dark:text-white mb-1">
                    Resume Previous Session?
                  </h3>
                  <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-3">
                    We found an incomplete wizard session from{' '}
                    <span className="font-medium">
                      {new Date(savedSession.lastUpdated).toLocaleString()}
                    </span>
                  </p>

                  {/* Session Preview */}
                  <div className="p-3 bg-white dark:bg-neutral-800 rounded-lg mb-4 space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <span className="text-neutral-500">Phase:</span>
                      <span className="font-medium text-neutral-900 dark:text-white capitalize">
                        {PHASE_LABELS[savedSession.phase]}
                      </span>
                    </div>
                    {savedSession.prompt && (
                      <div className="flex items-start gap-2">
                        <span className="text-neutral-500">Prompt:</span>
                        <span className="text-neutral-700 dark:text-neutral-300 line-clamp-2">
                          {savedSession.prompt}
                        </span>
                      </div>
                    )}
                    {savedSession.lastError && (
                      <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                        <span className="line-clamp-1">{savedSession.lastError}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={restoreSession}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-medium transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      Resume Session
                    </button>
                    <button
                      onClick={startFresh}
                      className="flex items-center gap-2 px-4 py-2 text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 rounded-lg font-medium transition-colors"
                    >
                      Start Fresh
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Retry Indicator */}
          {retrying && (
            <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg flex items-center gap-3">
              <Loader2 className="w-5 h-5 text-blue-500 animate-spin" />
              <span className="text-blue-700 dark:text-blue-300">
                Retrying... (Attempt {retryAttempt} of {MAX_RETRIES})
              </span>
            </div>
          )}

          {/* Error Display with Retry */}
          {error && !retrying && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-red-700 dark:text-red-300">{error}</p>
                  <p className="text-sm text-red-600 dark:text-red-400 mt-1">
                    Your progress has been saved. You can retry from where you left off.
                  </p>
                </div>
                <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 dark:hover:bg-red-800 rounded">
                  <X className="w-4 h-4 text-red-500" />
                </button>
              </div>
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* PHASE 1: Enter Prompt */}
            {phase === 'prompt' && (
              <motion.div
                key="prompt"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-3xl mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Sparkles className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Describe Your Panel
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Tell us what you want to achieve and our AI will design the perfect expert panel
                  </p>
                </div>

                <div className="space-y-4">
                  <textarea
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="E.g., I need to evaluate the regulatory strategy for a new oncology drug targeting a rare mutation. The panel should consider FDA, EMA, and PMDA requirements..."
                    className="w-full h-48 px-4 py-3 border border-neutral-300 dark:border-neutral-600 rounded-xl bg-white dark:bg-neutral-800 text-neutral-900 dark:text-white placeholder-neutral-400 focus:ring-2 focus:ring-violet-500 focus:border-transparent resize-none"
                    autoFocus
                  />

                  <div className="flex items-center gap-2 text-sm text-neutral-500">
                    <Sparkles className="w-4 h-4" />
                    <span>Tip: The more detail you provide, the better the AI can tailor your panel</span>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE 2: Review Goals (HITL) */}
            {phase === 'goals' && wizardState && (
              <motion.div
                key="goals"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* AI Analysis Summary */}
                <div className="p-4 bg-violet-50 dark:bg-violet-900/20 rounded-xl border border-violet-200 dark:border-violet-700 mb-6">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-violet-500 flex items-center justify-center flex-shrink-0">
                      <Bot className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold text-neutral-900 dark:text-white">AI Analysis</span>
                        {wizardState.intent_confidence && (
                          <span className="text-xs px-2 py-0.5 bg-violet-200 dark:bg-violet-700 rounded-full text-violet-700 dark:text-violet-200">
                            {Math.round(wizardState.intent_confidence * 100)}% confidence
                          </span>
                        )}
                      </div>
                      <p className="text-neutral-700 dark:text-neutral-300">{wizardState.primary_intent}</p>
                      <div className="flex gap-4 mt-2 text-sm text-neutral-500">
                        {wizardState.domain && (
                          <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">
                            {wizardState.domain}
                          </span>
                        )}
                        {wizardState.therapeutic_area && (
                          <span className="px-2 py-1 bg-neutral-100 dark:bg-neutral-700 rounded">
                            {wizardState.therapeutic_area}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Objectives */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <Target className="w-5 h-5 text-violet-500" />
                      Panel Objectives
                    </h4>
                    <button
                      onClick={addObjective}
                      className="flex items-center gap-1 px-3 py-1.5 text-sm text-violet-600 hover:bg-violet-50 dark:hover:bg-violet-900/20 rounded-lg transition-colors"
                    >
                      <Plus className="w-4 h-4" />
                      Add Objective
                    </button>
                  </div>

                  <div className="space-y-3">
                    {editingObjectives.map((obj, idx) => (
                      <div key={obj.id} className="flex items-start gap-3 p-3 bg-neutral-50 dark:bg-neutral-800 rounded-lg">
                        <span className="w-6 h-6 flex items-center justify-center bg-violet-100 dark:bg-violet-900 text-violet-600 dark:text-violet-300 rounded-full text-sm font-medium flex-shrink-0">
                          {idx + 1}
                        </span>
                        <input
                          type="text"
                          value={obj.text}
                          onChange={(e) => updateObjective(obj.id, e.target.value)}
                          className="flex-1 px-3 py-1.5 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                          placeholder="Enter objective..."
                        />
                        <button
                          onClick={() => removeObjective(obj.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Success Criteria */}
                {wizardState.success_criteria && wizardState.success_criteria.length > 0 && (
                  <div className="mt-6">
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-3">Success Criteria</h4>
                    <ul className="space-y-2">
                      {wizardState.success_criteria.map((criteria, idx) => (
                        <li key={idx} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                          <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                          {criteria}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </motion.div>
            )}

            {/* PHASE 3-4: Review Questions (HITL) */}
            {phase === 'questions' && wizardState && (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h3 className="text-lg font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                      <MessageSquare className="w-5 h-5 text-blue-500" />
                      Discussion Questions
                    </h3>
                    <p className="text-sm text-neutral-500">
                      {wizardState.estimated_discussion_time && `Estimated duration: ${wizardState.estimated_discussion_time}`}
                    </p>
                  </div>
                  <button
                    onClick={addQuestion}
                    className="flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add Question
                  </button>
                </div>

                <div className="space-y-4">
                  {editingQuestions.map((q, idx) => (
                    <div key={q.id} className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl border border-neutral-200 dark:border-neutral-700">
                      <div className="flex items-start gap-3">
                        <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-semibold flex-shrink-0">
                          {idx + 1}
                        </span>
                        <div className="flex-1 space-y-3">
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) => updateQuestion(q.id, { question: e.target.value })}
                            className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white font-medium"
                            placeholder="Enter question..."
                          />

                          {q.rationale && (
                            <p className="text-sm text-neutral-500 italic">{q.rationale}</p>
                          )}

                          <div className="flex items-center gap-4">
                            <select
                              value={q.priority}
                              onChange={(e) => updateQuestion(q.id, { priority: e.target.value as 'high' | 'medium' | 'low' })}
                              className="px-2 py-1 text-sm border border-neutral-200 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                            >
                              <option value="high">High Priority</option>
                              <option value="medium">Medium Priority</option>
                              <option value="low">Low Priority</option>
                            </select>

                            <select
                              value={q.assigned_to}
                              onChange={(e) => updateQuestion(q.id, { assigned_to: e.target.value })}
                              className="px-2 py-1 text-sm border border-neutral-200 dark:border-neutral-600 rounded bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300"
                            >
                              <option value="all">All Experts</option>
                              <option value="lead">Lead Expert</option>
                              <option value="specialist">Specialist</option>
                            </select>
                          </div>
                        </div>
                        <button
                          onClick={() => removeQuestion(q.id)}
                          className="p-1.5 text-neutral-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* PHASE 5-6: Select Panel Type (HITL) */}
            {phase === 'panel_type' && wizardState && (
              <motion.div
                key="panel_type"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* AI Recommendation */}
                {wizardState.recommended_panel_type && (
                  <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-700 mb-6">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-emerald-500 flex items-center justify-center flex-shrink-0">
                        <Sparkles className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-semibold text-neutral-900 dark:text-white">
                            AI Recommends: {PANEL_TYPE_INFO[wizardState.recommended_panel_type]?.name}
                          </span>
                          {wizardState.panel_type_confidence && (
                            <span className="text-xs px-2 py-0.5 bg-emerald-200 dark:bg-emerald-700 rounded-full text-emerald-700 dark:text-emerald-200">
                              {Math.round(wizardState.panel_type_confidence * 100)}% confidence
                            </span>
                          )}
                        </div>
                        <p className="text-neutral-600 dark:text-neutral-400 text-sm">
                          {wizardState.panel_type_rationale}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Panel Type Selection */}
                <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">Select Panel Type</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">
                  {(Object.keys(PANEL_TYPE_INFO) as PanelType[]).map((type) => {
                    const info = PANEL_TYPE_INFO[type];
                    const isRecommended = type === wizardState?.recommended_panel_type;
                    const isSelected = type === selectedPanelType;

                    return (
                      <button
                        key={type}
                        onClick={() => setSelectedPanelType(type)}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-left relative
                          ${isSelected
                            ? 'border-violet-500 bg-violet-50 dark:bg-violet-900/20 shadow-lg'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-violet-300'
                          }
                        `}
                      >
                        {isRecommended && (
                          <span className="absolute -top-2 -right-2 px-2 py-0.5 text-xs bg-emerald-500 text-white rounded-full">
                            Recommended
                          </span>
                        )}
                        <div className="flex items-center gap-2 mb-2">
                          <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-violet-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-300'}`}>
                            {info.icon}
                          </div>
                          <span className="font-medium text-neutral-900 dark:text-white">{info.name}</span>
                        </div>
                        <p className="text-xs text-neutral-500">{info.description}</p>
                      </button>
                    );
                  })}
                </div>

                {/* Panel Settings */}
                <div className="p-4 bg-neutral-50 dark:bg-neutral-800 rounded-xl space-y-4">
                  <h4 className="font-semibold text-neutral-900 dark:text-white">Panel Settings</h4>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm text-neutral-600 dark:text-neutral-400 mb-1">
                        Max Discussion Rounds
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={5}
                        value={panelSettings.max_rounds}
                        onChange={(e) => setPanelSettings({ ...panelSettings, max_rounds: parseInt(e.target.value) || 2 })}
                        className="w-full px-3 py-2 border border-neutral-200 dark:border-neutral-600 rounded-lg bg-white dark:bg-neutral-700 text-neutral-900 dark:text-white"
                      />
                    </div>

                    <div className="space-y-3">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={panelSettings.require_consensus}
                          onChange={(e) => setPanelSettings({ ...panelSettings, require_consensus: e.target.checked })}
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Require Consensus</span>
                      </label>

                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={panelSettings.allow_debate}
                          onChange={(e) => setPanelSettings({ ...panelSettings, allow_debate: e.target.checked })}
                          className="w-4 h-4 text-violet-600 rounded"
                        />
                        <span className="text-sm text-neutral-700 dark:text-neutral-300">Allow Debate</span>
                      </label>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* PHASE 7-8: Select Experts (HITL) */}
            {phase === 'agents' && wizardState && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                {/* Composition Rationale */}
                {wizardState.composition_rationale && (
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-700 mb-6">
                    <div className="flex items-start gap-3">
                      <Bot className="w-5 h-5 text-blue-500 mt-0.5" />
                      <div>
                        <span className="font-medium text-neutral-900 dark:text-white">AI Recommendation</span>
                        <p className="text-sm text-neutral-600 dark:text-neutral-400">{wizardState.composition_rationale}</p>
                        {wizardState.diversity_score && (
                          <span className="inline-flex items-center gap-1 mt-2 text-xs text-blue-600 dark:text-blue-300">
                            <Percent className="w-3 h-3" />
                            Diversity Score: {Math.round(wizardState.diversity_score * 100)}%
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-neutral-900 dark:text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-500" />
                    Expert Panel ({editingAgents.length} selected)
                  </h4>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {wizardState.recommended_agents.map((agent) => {
                    const isSelected = editingAgents.some(a => a.agent_id === agent.agent_id);

                    return (
                      <button
                        key={agent.agent_id}
                        onClick={() => toggleAgent(agent)}
                        className={`
                          p-4 rounded-xl border-2 transition-all text-left
                          ${isSelected
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-neutral-200 dark:border-neutral-700 hover:border-blue-300'
                          }
                        `}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isSelected ? 'bg-blue-500 text-white' : 'bg-neutral-100 dark:bg-neutral-700 text-neutral-500'}`}>
                            <Users className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="font-medium text-neutral-900 dark:text-white">{agent.name}</span>
                              <span className="text-xs text-neutral-500">{Math.round(agent.relevance_score * 100)}% match</span>
                            </div>
                            <p className="text-sm text-neutral-500 truncate">{agent.role_in_panel}</p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {agent.match_reasons.slice(0, 2).map((reason, idx) => (
                                <span key={idx} className="text-xs px-2 py-0.5 bg-neutral-100 dark:bg-neutral-700 rounded text-neutral-600 dark:text-neutral-300">
                                  {reason}
                                </span>
                              ))}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle className="w-5 h-5 text-blue-500 flex-shrink-0" />
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </motion.div>
            )}

            {/* PHASE 9: Review Proposal & Launch */}
            {phase === 'proposal' && wizardState?.proposal && (
              <motion.div
                key="proposal"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="max-w-4xl mx-auto"
              >
                <div className="text-center mb-8">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <CheckCircle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">
                    Your Panel is Ready!
                  </h3>
                  <p className="text-neutral-600 dark:text-neutral-400">
                    Review the configuration and launch your expert panel
                  </p>
                </div>

                {/* Proposal Summary */}
                <div className="p-6 bg-gradient-to-r from-violet-50 to-blue-50 dark:from-violet-900/20 dark:to-blue-900/20 rounded-xl border border-violet-200 dark:border-violet-700 mb-6">
                  <h4 className="font-semibold text-neutral-900 dark:text-white mb-4">{wizardState.proposal.name}</h4>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-neutral-500">Panel Type</span>
                      <p className="font-medium text-neutral-900 dark:text-white capitalize">{wizardState.proposal.panel_type}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Experts</span>
                      <p className="font-medium text-neutral-900 dark:text-white">{wizardState.proposal.agents.length}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Questions</span>
                      <p className="font-medium text-neutral-900 dark:text-white">{wizardState.proposal.questions.length}</p>
                    </div>
                    <div>
                      <span className="text-neutral-500">Duration</span>
                      <p className="font-medium text-neutral-900 dark:text-white">{wizardState.proposal.estimated_duration}</p>
                    </div>
                  </div>
                </div>

                {/* Experts List */}
                <div className="mb-6">
                  <h5 className="font-medium text-neutral-900 dark:text-white mb-3">Expert Panel</h5>
                  <div className="flex flex-wrap gap-2">
                    {wizardState.proposal.agents.map((agent) => (
                      <span key={agent.agent_id} className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-lg text-sm">
                        {agent.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Questions List */}
                <div>
                  <h5 className="font-medium text-neutral-900 dark:text-white mb-3">Discussion Questions</h5>
                  <ol className="space-y-2">
                    {wizardState.proposal.questions.map((q, idx) => (
                      <li key={q.id} className="flex items-start gap-2 text-sm text-neutral-600 dark:text-neutral-400">
                        <span className="w-5 h-5 flex items-center justify-center bg-neutral-100 dark:bg-neutral-700 rounded-full text-xs font-medium flex-shrink-0">
                          {idx + 1}
                        </span>
                        {q.question}
                      </li>
                    ))}
                  </ol>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-neutral-200 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800">
          <div className="flex items-center justify-between">
            <button
              onClick={goBack}
              disabled={phase === 'prompt' || loading}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              {/* Save Draft (available after goals phase) */}
              {phase !== 'prompt' && onSaveDraft && (
                <button
                  onClick={handleSaveDraft}
                  disabled={loading}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Draft
                </button>
              )}

              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-700 rounded-lg transition-colors"
              >
                Cancel
              </button>

              {/* Phase-specific action buttons */}
              {phase === 'prompt' && (
                <button
                  onClick={handleSubmitPrompt}
                  disabled={!prompt.trim() || loading || !sessionId}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  Analyze with AI
                </button>
              )}

              {phase === 'goals' && (
                <button
                  onClick={() => handleConfirmGoals(true)}
                  disabled={editingObjectives.length === 0 || loading}
                  className="flex items-center gap-2 px-6 py-2 bg-violet-500 hover:bg-violet-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm & Continue
                </button>
              )}

              {phase === 'questions' && (
                <button
                  onClick={() => handleConfirmQuestions(true)}
                  disabled={editingQuestions.length === 0 || loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm & Continue
                </button>
              )}

              {phase === 'panel_type' && (
                <button
                  onClick={() => handleConfirmPanelType(true)}
                  disabled={!selectedPanelType || loading}
                  className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm & Continue
                </button>
              )}

              {phase === 'agents' && (
                <button
                  onClick={() => handleConfirmAgents(true)}
                  disabled={editingAgents.length === 0 || loading}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle className="w-4 h-4" />}
                  Confirm & Finalize
                </button>
              )}

              {phase === 'proposal' && (
                <button
                  onClick={handleLaunch}
                  disabled={loading}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket className="w-4 h-4" />}
                  Launch Panel
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default AIWizardPanel;

/**
 * Panel Creation Wizard
 * 
 * Intuitive 4-step journey for users to:
 * 1. Choose how they want to start (template, AI suggestion, or custom)
 * 2. Select or confirm agents
 * 3. Configure panel settings
 * 4. Review and create
 * 
 * Aligned with Ask Expert design patterns
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles,
  Users,
  Sliders,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Wand2,
  LayoutGrid,
  Bot,
  Zap,
  MessageSquare,
  GitBranch,
  Brain,
  TrendingUp,
  Search,
  X,
} from 'lucide-react';
import { AgentCard, AgentCardSkeleton } from './AgentCard';
import { agentRecommendationEngine } from '../services/agent-recommendation-engine';
import { getAgents, getAgentSuites } from '../services/agent-service';
import { PANEL_TEMPLATES, getTemplateById } from '../constants/panel-templates';
import type { Agent, AgentRecommendation, PanelConfiguration, PanelTemplate } from '../types/agent';

interface PanelCreationWizardProps {
  onComplete: (config: PanelConfiguration) => void;
  onCancel: () => void;
  initialQuery?: string;
}

type Step = 'start' | 'agents' | 'settings' | 'review';
type StartOption = 'ai-suggest' | 'template' | 'custom';

export function PanelCreationWizard({
  onComplete,
  onCancel,
  initialQuery = '',
}: PanelCreationWizardProps) {
  const [currentStep, setCurrentStep] = useState<Step>('start');
  const [startOption, setStartOption] = useState<StartOption | null>(null);
  
  // User's question for AI recommendations
  const [query, setQuery] = useState(initialQuery);
  
  // Agent selection
  const [selectedAgents, setSelectedAgents] = useState<Agent[]>([]);
  const [availableAgents, setAvailableAgents] = useState<Agent[]>([]);
  const [recommendations, setRecommendations] = useState<AgentRecommendation[]>([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Template selection
  const [selectedTemplate, setSelectedTemplate] = useState<PanelTemplate | null>(null);
  
  // Panel configuration
  const [panelMode, setPanelMode] = useState<'sequential' | 'collaborative' | 'hybrid'>('collaborative');
  const [framework, setFramework] = useState<'auto' | 'langgraph' | 'autogen' | 'crewai'>('auto');
  const [userGuidance, setUserGuidance] = useState<'high' | 'medium' | 'low'>('medium');
  const [allowDebate, setAllowDebate] = useState(true);
  const [maxRounds, setMaxRounds] = useState(10);
  const [requireConsensus, setRequireConsensus] = useState(true);

  // Load available agents
  useEffect(() => {
    async function loadAgents() {
      const agents = await getAgents();
      setAvailableAgents(agents);
    }
    loadAgents();
  }, []);

  // Get AI recommendations when query changes
  useEffect(() => {
    if (startOption === 'ai-suggest' && query.trim()) {
      loadRecommendations();
    }
  }, [query, startOption]);

  async function loadRecommendations() {
    setLoadingRecommendations(true);
    try {
      const panelRec = await agentRecommendationEngine.recommendPanel(query);
      setRecommendations(panelRec.agents);
      
      // Auto-apply recommended settings
      setPanelMode(panelRec.panelMode);
      setFramework(panelRec.framework);
      
      // Pre-select top agents
      const topAgents = panelRec.agents.slice(0, 4).map(rec => rec.agent);
      setSelectedAgents(topAgents);
    } catch (error) {
      console.error('Failed to load recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  }

  // Handle template selection
  function handleTemplateSelect(template: PanelTemplate) {
    setSelectedTemplate(template);
    setPanelMode(template.mode);
    setFramework(template.framework);
    setUserGuidance(template.defaultSettings.userGuidance);
    setAllowDebate(template.defaultSettings.allowDebate);
    setMaxRounds(template.defaultSettings.maxRounds);
    setRequireConsensus(template.defaultSettings.requireConsensus);
    
    // Load suggested agents from template
    const templateAgents = availableAgents.filter(agent =>
      template.suggestedAgents.includes(agent.slug || '')
    );
    setSelectedAgents(templateAgents);
  }

  // Navigate between steps
  function nextStep() {
    if (currentStep === 'start' && startOption) {
      setCurrentStep('agents');
    } else if (currentStep === 'agents' && selectedAgents.length > 0) {
      setCurrentStep('settings');
    } else if (currentStep === 'settings') {
      setCurrentStep('review');
    }
  }

  function prevStep() {
    if (currentStep === 'review') {
      setCurrentStep('settings');
    } else if (currentStep === 'settings') {
      setCurrentStep('agents');
    } else if (currentStep === 'agents') {
      setCurrentStep('start');
    }
  }

  function handleComplete() {
    const config: PanelConfiguration = {
      selectedAgents,
      mode: panelMode,
      framework,
      executionMode: panelMode === 'sequential' ? 'sequential' : 'conversational',
      userGuidance,
      allowDebate,
      maxRounds,
      requireConsensus,
      useCase: selectedTemplate?.useCase,
      template: selectedTemplate?.id,
    };
    onComplete(config);
  }

  // Filter agents based on search
  const filteredAgents = availableAgents.filter(agent => {
    // Safely handle missing or null properties
    const title = agent.title?.toLowerCase() || '';
    const description = agent.description?.toLowerCase() || '';
    const expertise = agent.expertise || [];
    const query = searchQuery.toLowerCase();
    
    return (
      title.includes(query) ||
      description.includes(query) ||
      expertise.some(exp => exp?.toLowerCase().includes(query))
    );
  });

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-5xl bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-500" />
                Create Your Expert Panel
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {currentStep === 'start' && 'How would you like to start?'}
                {currentStep === 'agents' && 'Select your expert agents'}
                {currentStep === 'settings' && 'Configure panel behavior'}
                {currentStep === 'review' && 'Review and create'}
              </p>
            </div>
            
            <button
              onClick={onCancel}
              className="p-2 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            </button>
          </div>

          {/* Step Progress */}
          <div className="flex items-center gap-2 mt-4">
            {(['start', 'agents', 'settings', 'review'] as Step[]).map((step, idx) => {
              const stepIndex = ['start', 'agents', 'settings', 'review'].indexOf(currentStep);
              const thisIndex = ['start', 'agents', 'settings', 'review'].indexOf(step);
              const isActive = step === currentStep;
              const isCompleted = thisIndex < stepIndex;
              
              return (
                <React.Fragment key={step}>
                  <div
                    className={`
                      flex-1 h-2 rounded-full transition-all
                      ${isCompleted ? 'bg-blue-500' : isActive ? 'bg-blue-300' : 'bg-gray-200 dark:bg-gray-700'}
                    `}
                  />
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {/* STEP 1: START - Choose how to begin */}
            {currentStep === 'start' && (
              <motion.div
                key="start"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="max-w-4xl mx-auto">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-6 text-center">
                    How would you like to create your panel?
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* AI Suggest */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStartOption('ai-suggest')}
                      className={`
                        p-6 rounded-xl border-2 transition-all text-left
                        ${startOption === 'ai-suggest'
                          ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                        }
                      `}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4">
                        <Wand2 className="w-6 h-6 text-white" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        AI Suggestion
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Describe your question and let AI recommend the perfect expert panel
                      </p>
                      
                      {startOption === 'ai-suggest' && (
                        <div className="mt-4">
                          <textarea
                            autoFocus
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="E.g., I need help designing a clinical trial for a digital therapeutic..."
                            className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={3}
                          />
                        </div>
                      )}
                    </motion.button>

                    {/* Template */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStartOption('template')}
                      className={`
                        p-6 rounded-xl border-2 transition-all text-left
                        ${startOption === 'template'
                          ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600'
                        }
                      `}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4">
                        <LayoutGrid className="w-6 h-6 text-white" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Use Template
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Start with a pre-configured panel for common scenarios
                      </p>
                    </motion.button>

                    {/* Custom */}
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setStartOption('custom')}
                      className={`
                        p-6 rounded-xl border-2 transition-all text-left
                        ${startOption === 'custom'
                          ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 shadow-lg'
                          : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-600'
                        }
                      `}
                    >
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                        <Sliders className="w-6 h-6 text-white" />
                      </div>
                      
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-2">
                        Custom Panel
                      </h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Manually select agents and configure every detail
                      </p>
                    </motion.button>
                  </div>

                  {/* Template Selection */}
                  {startOption === 'template' && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      className="mt-6"
                    >
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-4">
                        Choose a Template
                      </h4>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                        {PANEL_TEMPLATES.slice(0, 10).map((template) => (
                          <motion.button
                            key={template.id}
                            whileHover={{ scale: 1.02 }}
                            onClick={() => handleTemplateSelect(template)}
                            className={`
                              p-4 rounded-lg border-2 transition-all text-left
                              ${selectedTemplate?.id === template.id
                                ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                                : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                              }
                            `}
                          >
                            <div className="flex items-start gap-3">
                              <div className="text-2xl">{template.icon}</div>
                              <div className="flex-1 min-w-0">
                                <h5 className="font-medium text-gray-900 dark:text-white text-sm mb-1">
                                  {template.name}
                                </h5>
                                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                  {template.description}
                                </p>
                                <div className="flex items-center gap-2 mt-2">
                                  <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                                    {template.category}
                                  </span>
                                  <span className="text-xs text-gray-500 dark:text-gray-400">
                                    {template.suggestedAgents.length} agents
                                  </span>
                                </div>
                              </div>
                            </div>
                          </motion.button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 2: AGENTS - Select agents */}
            {currentStep === 'agents' && (
              <motion.div
                key="agents"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="max-w-6xl mx-auto">
                  {/* Selected agents preview */}
                  {selectedAgents.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-blue-500" />
                          Selected Agents ({selectedAgents.length})
                        </h4>
                        {selectedAgents.length > 10 && (
                          <span className="text-xs text-amber-600 dark:text-amber-400">
                            ⚠️ Consider using fewer agents for better results
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-2">
                        {selectedAgents.map((agent) => (
                          <div
                            key={agent.id}
                            className="flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 rounded-lg border border-blue-200 dark:border-blue-700"
                          >
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {agent.title}
                            </span>
                            <button
                              onClick={() => setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id))}
                              className="p-0.5 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors"
                            >
                              <X className="w-3 h-3 text-gray-500" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* AI Recommendations */}
                  {startOption === 'ai-suggest' && recommendations.length > 0 && (
                    <div className="mb-6">
                      <h4 className="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-blue-500" />
                        AI Recommended Agents
                      </h4>
                      
                      {loadingRecommendations ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {[1, 2, 3].map((i) => (
                            <AgentCardSkeleton key={i} variant="compact" />
                          ))}
                        </div>
                      ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                          {recommendations.slice(0, 6).map((rec) => (
                            <AgentCard
                              key={rec.agent.id}
                              agent={rec.agent}
                              variant="compact"
                              isSelected={selectedAgents.some(a => a.id === rec.agent.id)}
                              onSelect={() => {
                                if (selectedAgents.some(a => a.id === rec.agent.id)) {
                                  setSelectedAgents(selectedAgents.filter(a => a.id !== rec.agent.id));
                                } else {
                                  setSelectedAgents([...selectedAgents, rec.agent]);
                                }
                              }}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Browse all agents */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {startOption === 'ai-suggest' ? 'Or Browse All Agents' : 'Browse All Agents'}
                      </h4>
                      
                      {/* Search */}
                      <div className="relative w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="text"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          placeholder="Search agents..."
                          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-96 overflow-y-auto">
                      {filteredAgents.map((agent) => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          variant="compact"
                          isSelected={selectedAgents.some(a => a.id === agent.id)}
                          onSelect={() => {
                            if (selectedAgents.some(a => a.id === agent.id)) {
                              setSelectedAgents(selectedAgents.filter(a => a.id !== agent.id));
                            } else {
                              setSelectedAgents([...selectedAgents, agent]);
                            }
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 3: SETTINGS - Configure panel */}
            {currentStep === 'settings' && (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Panel Mode */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Panel Mode
                    </label>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setPanelMode('sequential')}
                        className={`
                          p-4 rounded-lg border-2 transition-all text-left
                          ${panelMode === 'sequential'
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <GitBranch className="w-4 h-4 text-blue-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Sequential</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Experts provide advice one at a time
                        </p>
                      </button>

                      <button
                        onClick={() => setPanelMode('collaborative')}
                        className={`
                          p-4 rounded-lg border-2 transition-all text-left
                          ${panelMode === 'collaborative'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-purple-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <MessageSquare className="w-4 h-4 text-purple-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Collaborative</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Experts discuss and build consensus
                        </p>
                      </button>

                      <button
                        onClick={() => setPanelMode('hybrid')}
                        className={`
                          p-4 rounded-lg border-2 transition-all text-left
                          ${panelMode === 'hybrid'
                            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-emerald-300'
                          }
                        `}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <Zap className="w-4 h-4 text-emerald-500" />
                          <span className="font-medium text-gray-900 dark:text-white">Hybrid</span>
                        </div>
                        <p className="text-xs text-gray-600 dark:text-gray-400">
                          Adaptive mode based on context
                        </p>
                      </button>
                    </div>
                  </div>

                  {/* Framework */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3">
                      Execution Framework
                    </label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {(['auto', 'langgraph', 'autogen', 'crewai'] as const).map((fw) => (
                        <button
                          key={fw}
                          onClick={() => setFramework(fw)}
                          className={`
                            p-3 rounded-lg border-2 transition-all
                            ${framework === fw
                              ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'border-gray-200 dark:border-gray-700 hover:border-blue-300'
                            }
                          `}
                        >
                          <span className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                            {fw === 'auto' ? '🤖 Auto' : fw}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Advanced settings */}
                  <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                      Advanced Settings
                    </h4>

                    {/* User Guidance */}
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        User Guidance Level
                      </label>
                      <div className="flex gap-2">
                        {(['high', 'medium', 'low'] as const).map((level) => (
                          <button
                            key={level}
                            onClick={() => setUserGuidance(level)}
                            className={`
                              flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all
                              ${userGuidance === level
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }
                            `}
                          >
                            {level.charAt(0).toUpperCase() + level.slice(1)}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Toggles */}
                    <div className="grid grid-cols-2 gap-4">
                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Allow Debate</span>
                        <input
                          type="checkbox"
                          checked={allowDebate}
                          onChange={(e) => setAllowDebate(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>

                      <label className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg cursor-pointer">
                        <span className="text-sm text-gray-700 dark:text-gray-300">Require Consensus</span>
                        <input
                          type="checkbox"
                          checked={requireConsensus}
                          onChange={(e) => setRequireConsensus(e.target.checked)}
                          className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                        />
                      </label>
                    </div>

                    {/* Max Rounds */}
                    <div>
                      <label className="block text-sm text-gray-700 dark:text-gray-300 mb-2">
                        Max Discussion Rounds: {maxRounds}
                      </label>
                      <input
                        type="range"
                        min="5"
                        max="20"
                        value={maxRounds}
                        onChange={(e) => setMaxRounds(parseInt(e.target.value))}
                        className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: REVIEW - Final review */}
            {currentStep === 'review' && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="p-6"
              >
                <div className="max-w-4xl mx-auto space-y-6">
                  {/* Summary */}
                  <div className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl border border-blue-200 dark:border-blue-700">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Panel Configuration Summary
                    </h3>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Agents</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {selectedAgents.length}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Mode</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                          {panelMode}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Framework</div>
                        <div className="text-sm font-semibold text-gray-900 dark:text-white capitalize">
                          {framework}
                        </div>
                      </div>
                      
                      <div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 mb-1">Max Rounds</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          {maxRounds}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected Agents */}
                  <div>
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Selected Agents ({selectedAgents.length})
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-64 overflow-y-auto">
                      {selectedAgents.map((agent) => (
                        <AgentCard
                          key={agent.id}
                          agent={agent}
                          variant="compact"
                          isSelected={true}
                          showStats={false}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Settings Summary */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <h4 className="font-semibold text-gray-900 dark:text-white mb-3">
                      Configuration Details
                    </h4>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">User Guidance:</span>
                        <span className="font-medium text-gray-900 dark:text-white capitalize">{userGuidance}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Allow Debate:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{allowDebate ? 'Yes' : 'No'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">Require Consensus:</span>
                        <span className="font-medium text-gray-900 dark:text-white">{requireConsensus ? 'Yes' : 'No'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 'start'}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>

            <div className="flex items-center gap-3">
              <button
                onClick={onCancel}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              
              {currentStep === 'review' ? (
                <button
                  onClick={handleComplete}
                  className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                >
                  <CheckCircle className="w-4 h-4" />
                  Create Panel
                </button>
              ) : (
                <button
                  onClick={nextStep}
                  disabled={
                    (currentStep === 'start' && !startOption) ||
                    (currentStep === 'start' && startOption === 'ai-suggest' && !query.trim()) ||
                    (currentStep === 'start' && startOption === 'template' && !selectedTemplate) ||
                    (currentStep === 'agents' && selectedAgents.length === 0)
                  }
                  className="flex items-center gap-2 px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}


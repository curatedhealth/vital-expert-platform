/**
 * Ask Panel Page
 * 
 * User-friendly journey for consulting with expert panels:
 * - Quick start with AI suggestions
 * - Browse templates for common scenarios
 * - Custom panel builder
 * - History of past consultations
 * 
 * Aligned with Ask Expert design patterns
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Sparkles,
  LayoutGrid,
  History,
  Plus,
  ArrowRight,
  Bot,
  TrendingUp,
  Clock,
  MessageSquare,
  Zap,
} from 'lucide-react';
import { PanelCreationWizard } from '@/features/ask-panel/components/PanelCreationWizard';
import { PanelConsultationView } from '@/features/ask-panel/components/PanelConsultationView';
import { AgentCard } from '@/features/ask-panel/components/AgentCard';
import { PANEL_TEMPLATES } from '@/features/ask-panel/constants/panel-templates';
import type { PanelConfiguration } from '@/features/ask-panel/types/agent';

export default function AskPanelPage() {
  const [showWizard, setShowWizard] = useState(false);
  const [initialQuery, setInitialQuery] = useState('');
  const [quickQuestion, setQuickQuestion] = useState('');

  // Quick start with AI
  function handleQuickStart() {
    setInitialQuery(quickQuestion);
    setShowWizard(true);
  }

  // State for consultation view
  const [showConsultation, setShowConsultation] = useState(false);
  const [consultationConfig, setConsultationConfig] = useState<PanelConfiguration | null>(null);
  const [consultationQuestion, setConsultationQuestion] = useState('');

  // Handle panel creation
  function handlePanelCreated(config: PanelConfiguration) {
    console.log('Panel created:', config);
    setShowWizard(false);
    
    // Navigate to consultation view
    setConsultationConfig(config);
    setConsultationQuestion(quickQuestion || initialQuery);
    setShowConsultation(true);
  }

  // Handle back from consultation
  function handleBackFromConsultation() {
    setShowConsultation(false);
    setConsultationConfig(null);
    setConsultationQuestion('');
  }

  // Show consultation view if active
  if (showConsultation && consultationConfig && consultationQuestion) {
    return (
      <PanelConsultationView
        configuration={consultationConfig}
        initialQuestion={consultationQuestion}
        onBack={handleBackFromConsultation}
      />
    );
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Ask Panel
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consult with multiple AI experts to get comprehensive insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Quick Start Section */}
          <section className="mb-12">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-3">
                How can our expert panel help you today?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Get comprehensive insights from multiple specialized AI experts working together
              </p>
            </div>

            {/* Quick Question Input */}
            <div className="max-w-3xl mx-auto mb-8">
              <div className="relative">
                <textarea
                  value={quickQuestion}
                  onChange={(e) => setQuickQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleQuickStart();
                    }
                  }}
                  placeholder="E.g., I need help designing a clinical trial for a digital therapeutic targeting depression..."
                  className="w-full px-6 py-4 pr-32 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none text-base"
                  rows={3}
                />
                
                <button
                  onClick={handleQuickStart}
                  disabled={!quickQuestion.trim()}
                  className="absolute right-3 bottom-3 flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Sparkles className="w-4 h-4" />
                  Get AI Panel
                </button>
              </div>
              
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
                Press ⌘+Enter to submit
              </p>
            </div>

            {/* Three Entry Points */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
              {/* AI Suggestion */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setInitialQuery('');
                  setShowWizard(true);
                }}
                className="p-6 rounded-2xl border-2 border-blue-200 dark:border-blue-700 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 hover:border-blue-400 dark:hover:border-blue-500 transition-all text-left group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sparkles className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  AI Suggestion
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Let AI analyze your question and recommend the perfect expert panel
                </p>
                
                <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-semibold text-sm">
                  Get Started
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>

              {/* Use Template */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setInitialQuery('');
                  setShowWizard(true);
                }}
                className="p-6 rounded-2xl border-2 border-purple-200 dark:border-purple-700 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 hover:border-purple-400 dark:hover:border-purple-500 transition-all text-left group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <LayoutGrid className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Browse Templates
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Choose from pre-configured panels for common healthcare scenarios
                </p>
                
                <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-semibold text-sm">
                  View Templates
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>

              {/* Custom Panel */}
              <motion.button
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  setInitialQuery('');
                  setShowWizard(true);
                }}
                className="p-6 rounded-2xl border-2 border-emerald-200 dark:border-emerald-700 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-800/20 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all text-left group"
              >
                <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Plus className="w-7 h-7 text-white" />
                </div>
                
                <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
                  Build Custom Panel
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                  Manually select agents and configure every detail to your needs
                </p>
                
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold text-sm">
                  Start Building
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </motion.button>
            </div>
          </section>

          {/* Popular Templates */}
          <section className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-6 h-6 text-purple-500" />
                Popular Templates
              </h2>
              
              <button
                onClick={() => setShowWizard(true)}
                className="text-sm font-medium text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 flex items-center gap-1"
              >
                View All
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {PANEL_TEMPLATES.slice(0, 6).map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.02, y: -4 }}
                  onClick={() => {
                    // TODO: Pre-select this template in wizard
                    setShowWizard(true);
                  }}
                  className="p-6 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-purple-300 dark:hover:border-purple-600 hover:shadow-lg transition-all text-left group"
                >
                  <div className="flex items-start gap-4 mb-4">
                    <div className="text-3xl">{template.icon}</div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 dark:text-white mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                        {template.name}
                      </h3>
                      <span className="inline-block text-xs px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 capitalize">
                        {template.category}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                    {template.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                    <div className="flex items-center gap-1">
                      <Bot className="w-3.5 h-3.5" />
                      <span>{template.suggestedAgents.length} experts</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Zap className="w-3.5 h-3.5" />
                      <span className="capitalize">{template.mode}</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          </section>

          {/* Why Use Panel? */}
          <section className="mb-12">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-2xl border-2 border-purple-200 dark:border-purple-700 p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6 text-center">
                Why Consult with a Panel?
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-purple-100 dark:bg-purple-900/40 flex items-center justify-center mx-auto mb-4">
                    <Users className="w-7 h-7 text-purple-600 dark:text-purple-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Diverse Perspectives
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Get insights from multiple specialized experts with different backgrounds
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center mx-auto mb-4">
                    <MessageSquare className="w-7 h-7 text-blue-600 dark:text-blue-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Collaborative Discussion
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Experts debate and refine ideas together to reach better conclusions
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 dark:bg-emerald-900/40 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                    Consensus Building
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Receive a unified recommendation backed by multiple expert opinions
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Consultations (placeholder) */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <History className="w-6 h-6 text-gray-500" />
                Recent Consultations
              </h2>
            </div>

            <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600">
              <Clock className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Your consultation history will appear here
              </p>
              <button
                onClick={() => setShowWizard(true)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all"
              >
                <Plus className="w-4 h-4" />
                Start Your First Consultation
              </button>
            </div>
          </section>
        </div>
      </div>

      {/* Panel Creation Wizard */}
      <AnimatePresence>
        {showWizard && (
          <PanelCreationWizard
            initialQuery={initialQuery}
            onComplete={handlePanelCreated}
            onCancel={() => setShowWizard(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

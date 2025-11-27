/**
 * Panel Consultation View
 * 
 * Real-time display of panel discussion with:
 * - Live agent responses
 * - Consensus building visualization
 * - Message threading
 * - Follow-up questions
 * 
 * Aligned with Ask Expert design patterns
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Loader2,
  Send,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  Sparkles,
  ArrowLeft,
  TrendingUp,
  Brain,
  Clock,
  Zap,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { AgentAvatar } from '@vital/ui';
import type { Message } from '@/types/chat';
import type { PanelConfiguration, Agent } from '@/features/ask-panel/types/agent';

interface PanelConsultationViewProps {
  configuration: PanelConfiguration;
  initialQuestion: string;
  onBack?: () => void;
}

interface AgentMessage {
  agentId?: string;
  agent?: Agent;
  content: string;
  timestamp: Date;
  confidence?: number;
  isStreaming?: boolean;
  role?: 'expert' | 'moderator' | 'system';
  title?: string;
}

interface PanelState {
  status: 'initializing' | 'discussing' | 'consensus' | 'complete' | 'error';
  currentRound: number;
  maxRounds: number;
  messages: AgentMessage[];
  consensusReached?: boolean;
  finalRecommendation?: string;
  dissenting?: string[];
  evidenceSummary?: string;
  evidenceSources?: Array<{
    title: string;
    snippet?: string;
    citation?: string;
    year?: string | number;
  }>;
}

export function PanelConsultationView({
  configuration,
  initialQuestion,
  onBack,
}: PanelConsultationViewProps) {
  const router = useRouter();
  const [panelState, setPanelState] = useState<PanelState>({
    status: 'initializing',
    currentRound: 1,
    maxRounds: configuration.maxRounds || 10,
    messages: [],
  });
  
  const [userQuestion, setUserQuestion] = useState('');
  const [conversationHistory, setConversationHistory] = useState<Message[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Start panel consultation on mount
  useEffect(() => {
    startConsultation(initialQuestion);
  }, []);

  // Auto-scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [panelState.messages]);

  async function startConsultation(question: string) {
    setPanelState(prev => ({ ...prev, status: 'discussing' }));

    try {
      const response = await fetch('/api/ask-panel/consult', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          configuration,
          conversationHistory,
        }),
      });

      if (!response.ok) {
        throw new Error('Panel consultation failed');
      }

      const result = await response.json();

      // Transform result to panel state - include both experts and moderator
      const expertMessages: AgentMessage[] = result.experts.map((expert: any) => ({
        agentId: expert.agentId,
        agent: configuration.selectedAgents.find(a => a.id === expert.agentId)!,
        content: expert.response,
        timestamp: new Date(),
        confidence: expert.confidence,
        role: 'expert' as const,
      }));

      // Add moderator messages if present
      const moderatorMessages: AgentMessage[] = [];
      if (result.moderator && Array.isArray(result.moderator)) {
        result.moderator.forEach((modMsg: any) => {
          moderatorMessages.push({
            content: modMsg.content,
            timestamp: modMsg.timestamp ? new Date(modMsg.timestamp) : new Date(),
            role: 'moderator' as const,
            title: 'Panel Moderator',
          });
        });
      } else if (result.synthesis) {
        // Single synthesis message
        moderatorMessages.push({
          content: result.synthesis,
          timestamp: new Date(),
          role: 'moderator' as const,
          title: 'Panel Synthesis',
        });
      }

      // Combine messages: experts first, then moderator messages
      const messages: AgentMessage[] = [...expertMessages, ...moderatorMessages];

      setPanelState({
        status: result.consensus?.reached ? 'consensus' : 'complete',
        currentRound: result.metadata.rounds || 1,
        maxRounds: configuration.maxRounds || 10,
        messages,
        consensusReached: result.consensus?.reached,
        finalRecommendation: result.consensus?.finalRecommendation,
        dissenting: result.consensus?.dissenting,
      });

      // Add to conversation history
      setConversationHistory(prev => [
        ...prev,
        { role: 'user', content: question },
        ...messages.map(msg => ({
          role: 'assistant',
          content: msg.content,
          name: msg.agent.title,
        })),
      ]);

    } catch (error) {
      console.error('Panel consultation error:', error);
      setPanelState(prev => ({ ...prev, status: 'error' }));
    }
  }

  async function handleFollowUp() {
    if (!userQuestion.trim()) return;

    const question = userQuestion;
    setUserQuestion('');
    await startConsultation(question);
  }

  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            )}
            
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Panel Consultation
                </h1>
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {configuration.selectedAgents.length} experts • {configuration.mode} mode
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            {panelState.status === 'discussing' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Discussing... Round {panelState.currentRound}/{panelState.maxRounds}
                </span>
              </div>
            )}
            
            {panelState.status === 'consensus' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-700">
                <CheckCircle2 className="w-4 h-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-700 dark:text-green-300">
                  Consensus Reached
                </span>
              </div>
            )}
            
            {panelState.status === 'error' && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <AlertCircle className="w-4 h-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  Error
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">
          {/* Initial Question */}
          <div className="p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <div className="flex items-start gap-3 mb-3">
              <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                  Your Question
                </div>
                <p className="text-gray-900 dark:text-white leading-relaxed">
                  {initialQuestion}
                </p>
              </div>
            </div>
          </div>

          {/* Agent Responses */}
          <AnimatePresence mode="popLayout">
            {panelState.messages.map((message, idx) => {
              const isModerator = message.role === 'moderator' || !message.agent;
              
              return (
                <motion.div
                  key={`${message.agentId || 'moderator'}-${idx}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                  className={`p-6 rounded-xl border ${
                    isModerator 
                      ? 'bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 border-purple-200 dark:border-purple-700' 
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Agent/Moderator Avatar */}
                    {isModerator ? (
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center flex-shrink-0 shadow-lg">
                        <Sparkles className="w-6 h-6 text-white" />
                      </div>
                    ) : (
                      <AgentAvatar
                        avatar={message.agent?.avatar_url}
                        name={message.agent?.title || 'Expert'}
                        size="detail"
                        className="rounded-full flex-shrink-0"
                      />
                    )}
                    
                    <div className="flex-1 min-w-0">
                      {/* Agent/Moderator Header */}
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className={`font-semibold ${
                            isModerator 
                              ? 'text-purple-900 dark:text-purple-100' 
                              : 'text-gray-900 dark:text-white'
                          }`}>
                            {isModerator ? (message.title || 'Panel Moderator') : (message.agent?.title || 'Expert')}
                          </h3>
                          <p className={`text-sm capitalize ${
                            isModerator 
                              ? 'text-purple-600 dark:text-purple-300' 
                              : 'text-gray-500 dark:text-gray-400'
                          }`}>
                            {isModerator ? 'Panel Synthesis & Summary' : (message.agent?.category || 'Expert')}
                          </p>
                        </div>
                        
                        {message.confidence && !isModerator && (
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <TrendingUp className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                            <span className="text-xs font-medium text-blue-700 dark:text-blue-300">
                              {(message.confidence * 100).toFixed(0)}% confidence
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Response Content */}
                      <div className="prose dark:prose-invert max-w-none">
                        <p className={`leading-relaxed whitespace-pre-wrap ${
                          isModerator 
                            ? 'text-purple-800 dark:text-purple-200' 
                            : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {message.content}
                        </p>
                      </div>

                      {/* Timestamp */}
                      <div className={`flex items-center gap-1.5 mt-3 text-xs ${
                        isModerator 
                          ? 'text-purple-600 dark:text-purple-400' 
                          : 'text-gray-500 dark:text-gray-400'
                      }`}>
                        <Clock className="w-3.5 h-3.5" />
                        <span>{message.timestamp.toLocaleTimeString()}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>

          {/* Closure Summary */}
          {(panelState.status === 'complete' || panelState.status === 'consensus') && (
            <motion.div
              initial={{ opacity: 0, scale: 0.97 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-6 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-gray-800 dark:to-gray-900 rounded-2xl border border-indigo-100 dark:border-indigo-900/40 shadow-sm"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center flex-shrink-0">
                  {panelState.consensusReached ? (
                    <CheckCircle2 className="w-6 h-6 text-green-600 dark:text-green-300" />
                  ) : (
                    <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-200" />
                  )}
                </div>

                <div className="flex-1 space-y-4">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-indigo-500 dark:text-indigo-300 font-semibold">
                      {panelState.consensusReached ? 'Consensus Achieved' : 'Discussion Summary'}
                    </p>
                    <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                      {panelState.consensusReached ? 'Unified Recommendation' : 'Panel Closure'}
                    </h3>
                    <p className="text-gray-800 dark:text-gray-100 mt-3 leading-relaxed whitespace-pre-wrap">
                      {panelState.finalRecommendation?.trim() ||
                        'The panel completed the discussion, but no summary was generated.'}
                    </p>
                  </div>

                  {panelState.dissenting && panelState.dissenting.length > 0 && (
                    <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/40">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4 text-amber-500" />
                        Dissenting Views
                      </p>
                      <ul className="space-y-1 text-sm text-gray-700 dark:text-gray-300">
                        {panelState.dissenting.map((view, idx) => (
                          <li key={`dissent-${idx}`}>• {view}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {panelState.evidenceSummary && (
                    <div className="pt-3 border-t border-indigo-100 dark:border-indigo-900/40">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2 flex items-center gap-2">
                        <ListChecks className="w-4 h-4 text-purple-500" />
                        Evidence Highlights
                      </p>
                      <pre className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap font-sans">
                        {panelState.evidenceSummary}
                      </pre>
                      {panelState.evidenceSources && panelState.evidenceSources.length > 0 && (
                        <ul className="mt-2 space-y-1 text-xs text-gray-600 dark:text-gray-400">
                          {panelState.evidenceSources.slice(0, 4).map((source, idx) => (
                            <li key={`source-${idx}`}>
                              <span className="text-indigo-500">{idx + 1}.</span> {source.title}
                              {source.year ? ` (${source.year})` : ''}
                              {source.citation ? ` – ${source.citation}` : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Experts
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {configuration.selectedAgents.length}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Rounds
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {panelState.currentRound}
                      </p>
                    </div>
                    <div className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900/40">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">
                        Avg Confidence
                      </p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        {panelState.messages.length
                          ? `${Math.round(
                              (panelState.messages.reduce(
                                (acc, msg) => acc + (msg.confidence ?? 0.75),
                                0
                              ) /
                                panelState.messages.length) *
                                100
                            )}%`
                          : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Loading State */}
          {panelState.status === 'discussing' && panelState.messages.length === 0 && (
            <div className="text-center py-12">
              <div className="inline-flex items-center gap-3 px-6 py-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
                <Loader2 className="w-5 h-5 text-blue-600 dark:text-blue-400 animate-spin" />
                <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                  Panel is discussing your question...
                </span>
              </div>
            </div>
          )}

          {/* Error State */}
          {panelState.status === 'error' && (
            <div className="text-center py-12">
              <div className="inline-flex flex-col items-center gap-3 px-6 py-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-700">
                <AlertCircle className="w-8 h-8 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-700 dark:text-red-300">
                  An error occurred during the panel consultation
                </span>
                <button
                  onClick={() => startConsultation(initialQuestion)}
                  className="text-sm text-red-600 dark:text-red-400 hover:underline"
                >
                  Try Again
                </button>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Follow-up Input */}
      {(panelState.status === 'complete' || panelState.status === 'consensus') && (
        <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-6 py-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3">
              <div className="flex-1 relative">
                <textarea
                  value={userQuestion}
                  onChange={(e) => setUserQuestion(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleFollowUp();
                    }
                  }}
                  placeholder="Ask a follow-up question..."
                  className="w-full px-4 py-3 pr-12 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={2}
                />
              </div>
              
              <button
                onClick={handleFollowUp}
                disabled={!userQuestion.trim() || panelState.status === 'discussing'}
                className="p-3 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
              Press ⌘+Enter to submit
            </p>
          </div>
        </div>
      )}
    </div>
  );
}


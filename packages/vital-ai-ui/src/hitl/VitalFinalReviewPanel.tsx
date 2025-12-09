/**
 * Final Review Panel
 *
 * Complete response review panel for HITL final approval.
 * Shows:
 * - Full response content
 * - Sources/citations
 * - Confidence score
 * - Execution summary
 * - Approve/Reject/Request Changes actions
 */

'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  Edit3,
  FileText,
  Link,
  BarChart3,
  Clock,
  Bot,
  ChevronDown,
  ChevronUp,
  Sparkles,
  MessageSquare,
  RefreshCw,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';

interface Source {
  title: string;
  url: string;
  snippet?: string;
  relevance?: number;
}

interface ExecutionSummary {
  totalSteps: number;
  completedSteps: number;
  agentsUsed: number;
  toolsExecuted: number;
  totalDuration: string;
  tokensUsed: number;
}

interface FinalReviewData {
  id: string;
  response: string;
  sources: Source[];
  confidence: number;
  executionSummary: ExecutionSummary;
  createdAt: Date;
}

interface FinalReviewPanelProps {
  review: FinalReviewData;
  onApprove: () => void;
  onReject: (reason: string) => void;
  onRequestChanges?: (feedback: string) => void;
  className?: string;
}

export function FinalReviewPanel({
  review,
  onApprove,
  onReject,
  onRequestChanges,
  className = '',
}: FinalReviewPanelProps) {
  const [showSources, setShowSources] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [feedbackMode, setFeedbackMode] = useState<'reject' | 'changes' | null>(null);

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return 'text-emerald-400';
    if (confidence >= 0.7) return 'text-yellow-400';
    return 'text-orange-400';
  };

  const getConfidenceLabel = (confidence: number) => {
    if (confidence >= 0.9) return 'High';
    if (confidence >= 0.7) return 'Medium';
    return 'Low';
  };

  const handleSubmitFeedback = () => {
    if (!feedback.trim()) return;

    if (feedbackMode === 'reject') {
      onReject(feedback);
    } else if (feedbackMode === 'changes' && onRequestChanges) {
      onRequestChanges(feedback);
    }

    setFeedback('');
    setFeedbackMode(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`rounded-xl border-2 border-emerald-500/50 bg-emerald-500/5 overflow-hidden ${className}`}
    >
      {/* Header */}
      <div className="p-4 bg-emerald-500/10 border-b border-zinc-700/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 rounded-lg">
              <FileText className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-medium text-white">Final Response Review</h3>
              <p className="text-sm text-zinc-400">Review and approve the generated response</p>
            </div>
          </div>

          {/* Confidence Badge */}
          <div className="flex items-center gap-2">
            <BarChart3 className={`w-4 h-4 ${getConfidenceColor(review.confidence)}`} />
            <span className={`text-sm font-medium ${getConfidenceColor(review.confidence)}`}>
              {Math.round(review.confidence * 100)}% Confidence ({getConfidenceLabel(review.confidence)})
            </span>
          </div>
        </div>
      </div>

      {/* Response Content */}
      <div className="p-4 border-b border-zinc-700/30">
        <div className="flex items-center gap-2 mb-3">
          <MessageSquare className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Response</span>
        </div>
        <div className="max-h-64 overflow-y-auto prose prose-sm dark:prose-invert prose-zinc">
          <div className="text-sm text-zinc-300 whitespace-pre-wrap">{review.response}</div>
        </div>
      </div>

      {/* Sources Toggle */}
      {review.sources.length > 0 && (
        <>
          <button
            onClick={() => setShowSources(!showSources)}
            className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors"
          >
            <div className="flex items-center gap-2">
              <Link className="w-4 h-4 text-zinc-400" />
              <span className="text-sm font-medium text-zinc-300">
                Sources ({review.sources.length})
              </span>
            </div>
            {showSources ? (
              <ChevronUp className="w-4 h-4 text-zinc-400" />
            ) : (
              <ChevronDown className="w-4 h-4 text-zinc-400" />
            )}
          </button>

          <AnimatePresence>
            {showSources && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="border-t border-zinc-700/30 overflow-hidden"
              >
                <div className="p-4 space-y-2 max-h-48 overflow-y-auto bg-zinc-900/50">
                  {review.sources.map((source, index) => (
                    <a
                      key={index}
                      href={source.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block p-3 bg-zinc-800/30 rounded-lg hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-zinc-200 truncate">{source.title}</p>
                          {source.snippet && (
                            <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{source.snippet}</p>
                          )}
                        </div>
                        {source.relevance !== undefined && (
                          <span className="px-2 py-0.5 text-xs bg-zinc-700 text-zinc-400 rounded shrink-0">
                            {Math.round(source.relevance * 100)}%
                          </span>
                        )}
                      </div>
                    </a>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* Execution Summary Toggle */}
      <button
        onClick={() => setShowSummary(!showSummary)}
        className="w-full flex items-center justify-between p-3 hover:bg-zinc-800/30 transition-colors border-t border-zinc-700/30"
      >
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-zinc-400" />
          <span className="text-sm font-medium text-zinc-300">Execution Summary</span>
        </div>
        {showSummary ? (
          <ChevronUp className="w-4 h-4 text-zinc-400" />
        ) : (
          <ChevronDown className="w-4 h-4 text-zinc-400" />
        )}
      </button>

      <AnimatePresence>
        {showSummary && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-zinc-700/30 overflow-hidden"
          >
            <div className="p-4 grid grid-cols-3 gap-3 bg-zinc-900/50">
              <div className="p-3 bg-zinc-800/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">
                  {review.executionSummary.completedSteps}/{review.executionSummary.totalSteps}
                </p>
                <p className="text-xs text-zinc-500">Steps</p>
              </div>
              <div className="p-3 bg-zinc-800/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{review.executionSummary.agentsUsed}</p>
                <p className="text-xs text-zinc-500">Agents</p>
              </div>
              <div className="p-3 bg-zinc-800/30 rounded-lg text-center">
                <p className="text-2xl font-bold text-white">{review.executionSummary.toolsExecuted}</p>
                <p className="text-xs text-zinc-500">Tools</p>
              </div>
              <div className="p-3 bg-zinc-800/30 rounded-lg text-center col-span-2">
                <div className="flex items-center justify-center gap-1.5">
                  <Clock className="w-4 h-4 text-zinc-400" />
                  <p className="text-lg font-bold text-white">{review.executionSummary.totalDuration}</p>
                </div>
                <p className="text-xs text-zinc-500">Duration</p>
              </div>
              <div className="p-3 bg-zinc-800/30 rounded-lg text-center">
                <p className="text-lg font-bold text-white">
                  {(review.executionSummary.tokensUsed / 1000).toFixed(1)}K
                </p>
                <p className="text-xs text-zinc-500">Tokens</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Input */}
      <AnimatePresence>
        {feedbackMode && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="px-4 pb-2 border-t border-zinc-700/30"
          >
            <p className="text-xs text-zinc-500 mb-2 mt-3">
              {feedbackMode === 'reject' ? 'Reason for rejection' : 'What changes do you need?'}
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder={
                feedbackMode === 'reject'
                  ? 'Explain why this response is not acceptable...'
                  : 'Describe what needs to be changed or improved...'
              }
              className={`w-full p-3 bg-zinc-800/50 border rounded-lg text-sm text-zinc-200 placeholder-zinc-500 resize-none focus:outline-none focus:ring-2 ${
                feedbackMode === 'reject'
                  ? 'border-red-500/50 focus:ring-red-500/50'
                  : 'border-amber-500/50 focus:ring-amber-500/50'
              }`}
              rows={3}
              autoFocus
            />
            <div className="flex justify-end gap-2 mt-2">
              <button
                onClick={() => setFeedbackMode(null)}
                className="px-3 py-1.5 text-sm text-zinc-400 hover:text-zinc-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmitFeedback}
                disabled={!feedback.trim()}
                className={`px-4 py-1.5 text-sm rounded-lg font-medium transition-colors ${
                  feedback.trim()
                    ? feedbackMode === 'reject'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-amber-500 hover:bg-amber-600 text-black'
                    : 'bg-zinc-700 text-zinc-500 cursor-not-allowed'
                }`}
              >
                {feedbackMode === 'reject' ? 'Reject' : 'Request Changes'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      {!feedbackMode && (
        <div className="flex items-center justify-end gap-3 p-4 border-t border-zinc-700/30">
          <button
            onClick={() => setFeedbackMode('reject')}
            className="flex items-center gap-1.5 px-3 py-2 text-sm bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/50 rounded-lg text-rose-400 transition-colors"
          >
            <ThumbsDown className="w-4 h-4" />
            Reject
          </button>
          {onRequestChanges && (
            <button
              onClick={() => setFeedbackMode('changes')}
              className="flex items-center gap-1.5 px-3 py-2 text-sm bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/50 rounded-lg text-amber-400 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              Request Changes
            </button>
          )}
          <button
            onClick={onApprove}
            className="flex items-center gap-1.5 px-5 py-2 text-sm bg-emerald-500 hover:bg-emerald-600 rounded-lg text-white font-medium transition-colors"
          >
            <ThumbsUp className="w-4 h-4" />
            Approve Response
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default FinalReviewPanel;

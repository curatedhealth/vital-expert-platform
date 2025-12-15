/**
 * RAG Performance Summary
 * Simple summary component for RAG performance metrics
 */

'use client';

import { Brain, Activity, Clock, Database, AlertTriangle } from 'lucide-react';
import React from 'react';

interface RAGPerformanceSummaryProps {
  className?: string;
}

export function RAGPerformanceSummary({ className }: RAGPerformanceSummaryProps) {
  // Mock data for now
  const metrics = {
    overall_score: 87.5,
    cache_hit_rate: 0.73,
    response_time_ms: 1250,
    total_queries: 15420,
    active_alerts: 2
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    if (score >= 70) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className={`bg-white rounded-lg border p-6 ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Brain className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">RAG Performance</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Activity className="h-4 w-4 text-neutral-400" />
          <span className="text-sm text-neutral-600">Live</span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <Database className="h-3 w-3 text-blue-500" />
            <span className="text-xs text-neutral-600">Overall Score</span>
          </div>
          <p className={`text-xl font-bold ${getScoreColor(metrics.overall_score)}`}>
            {metrics.overall_score.toFixed(1)}%
          </p>
        </div>
        <div>
          <div className="flex items-center space-x-1 mb-1">
            <Clock className="h-3 w-3 text-green-500" />
            <span className="text-xs text-neutral-600">Response Time</span>
          </div>
          <p className="text-xl font-bold">
            {metrics.response_time_ms.toLocaleString()}ms
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <div className="text-xs text-neutral-600 mb-1">Cache Hit Rate</div>
          <p className="text-lg font-semibold">
            {(metrics.cache_hit_rate * 100).toFixed(1)}%
          </p>
        </div>
        <div>
          <div className="text-xs text-neutral-600 mb-1">Total Queries (24h)</div>
          <p className="text-lg font-semibold">
            {metrics.total_queries.toLocaleString()}
          </p>
        </div>
      </div>

      {metrics.active_alerts > 0 && (
        <div className="flex items-center justify-between p-2 bg-red-50 border border-red-200 rounded-md">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-800">
              {metrics.active_alerts} Active Alert{metrics.active_alerts > 1 ? 's' : ''}
            </span>
          </div>
          <button className="text-red-600 hover:text-red-700 text-sm">
            View
          </button>
        </div>
      )}

      <div className="flex space-x-2 mt-4">
        <button className="flex-1 px-3 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700">
          <Brain className="h-3 w-3 mr-1 inline" />
          Full Dashboard
        </button>
        <button className="flex-1 px-3 py-2 bg-neutral-100 text-neutral-700 text-sm font-medium rounded-md hover:bg-neutral-200">
          <Activity className="h-3 w-3 mr-1 inline" />
          API Metrics
        </button>
      </div>
    </div>
  );
}

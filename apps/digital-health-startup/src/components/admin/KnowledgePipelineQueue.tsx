'use client';

import { useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Loader2, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';

export interface QueueSource {
  id: string;
  url: string;
  title?: string;
  firm?: string;
  type?: 'html' | 'pdf' | 'unknown';
  estimatedSize?: string;
  status: 'pending' | 'processing' | 'success' | 'failed' | 'skipped';
  progress?: number;
  result?: {
    wordCount: number;
    duration: number;
    error?: string;
  };
}

interface KnowledgePipelineQueueProps {
  sources: QueueSource[];
  onRunAll: () => void;
  onRunSingle: (sourceId: string) => void;
  onRetry: (sourceId: string) => void;
  onClear: () => void;
  isProcessing: boolean;
  overallProgress: number;
}

export default function KnowledgePipelineQueue({
  sources,
  onRunAll,
  onRunSingle,
  onRetry,
  onClear,
  isProcessing,
  overallProgress,
}: KnowledgePipelineQueueProps) {
  const [expandedSource, setExpandedSource] = useState<string | null>(null);

  // Calculate statistics
  const stats = {
    total: sources.length,
    pending: sources.filter(s => s.status === 'pending').length,
    processing: sources.filter(s => s.status === 'processing').length,
    success: sources.filter(s => s.status === 'success').length,
    failed: sources.filter(s => s.status === 'failed').length,
    skipped: sources.filter(s => s.status === 'skipped').length,
    totalWords: sources
      .filter(s => s.result?.wordCount)
      .reduce((sum, s) => sum + (s.result?.wordCount || 0), 0),
  };

  const getStatusIcon = (status: QueueSource['status']) => {
    switch (status) {
      case 'pending':
        return <FileText className="h-4 w-4 text-gray-400" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'skipped':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusBadge = (status: QueueSource['status']) => {
    const variants: Record<QueueSource['status'], string> = {
      pending: 'bg-gray-100 text-gray-700',
      processing: 'bg-blue-100 text-blue-700',
      success: 'bg-green-100 text-green-700',
      failed: 'bg-red-100 text-red-700',
      skipped: 'bg-yellow-100 text-yellow-700',
    };

    return (
      <Badge className={variants[status]}>
        {status.toUpperCase()}
      </Badge>
    );
  };

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${(ms / 60000).toFixed(1)}m`;
  };

  return (
    <div className="space-y-6">
      {/* Statistics Bar */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Pipeline Queue</CardTitle>
              <CardDescription>
                {stats.total} sources • {stats.success} completed • {stats.failed} failed
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={onRunAll}
                disabled={isProcessing || stats.pending === 0}
                size="sm"
              >
                <Play className="h-4 w-4 mr-2" />
                Run All ({stats.pending})
              </Button>
              <Button
                onClick={onClear}
                variant="outline"
                size="sm"
                disabled={isProcessing}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Queue
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Overall Progress */}
          {isProcessing && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-gray-600">
                  {stats.success + stats.failed}/{stats.total} processed
                </span>
              </div>
              <Progress value={overallProgress} className="h-2" />
            </div>
          )}

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-3 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.pending}</div>
              <div className="text-xs text-gray-600">Pending</div>
            </div>
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-700">{stats.processing}</div>
              <div className="text-xs text-blue-600">Processing</div>
            </div>
            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-700">{stats.success}</div>
              <div className="text-xs text-green-600">Success</div>
            </div>
            <div className="text-center p-3 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-700">{stats.failed}</div>
              <div className="text-xs text-red-600">Failed</div>
            </div>
            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="text-2xl font-bold text-purple-700">
                {(stats.totalWords / 1000).toFixed(1)}K
              </div>
              <div className="text-xs text-purple-600">Words</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Source Queue List */}
      <Card>
        <CardHeader>
          <CardTitle>Sources</CardTitle>
          <CardDescription>Click on a source to see details or run individually</CardDescription>
        </CardHeader>
        <CardContent>
          {sources.length === 0 ? (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No sources in queue. Upload a JSON file or add sources manually to begin.
              </AlertDescription>
            </Alert>
          ) : (
            <div className="space-y-2">
              {sources.map((source) => (
                <div
                  key={source.id}
                  className="border rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        {getStatusIcon(source.status)}
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">
                            {source.title || 'Untitled'}
                          </div>
                          <div className="text-xs text-gray-500 truncate">
                            {source.url}
                          </div>
                        </div>
                        {getStatusBadge(source.status)}
                      </div>

                      {/* Metadata Row */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-2">
                        {source.firm && (
                          <span className="flex items-center gap-1">
                            <Badge variant="outline" className="text-xs">
                              {source.firm}
                            </Badge>
                          </span>
                        )}
                        {source.type && (
                          <span className="uppercase font-medium">{source.type}</span>
                        )}
                        {source.estimatedSize && (
                          <span>~{source.estimatedSize}</span>
                        )}
                      </div>

                      {/* Progress Bar for Processing */}
                      {source.status === 'processing' && source.progress !== undefined && (
                        <div className="mb-2">
                          <Progress value={source.progress} className="h-1" />
                        </div>
                      )}

                      {/* Result Info */}
                      {source.result && (
                        <div className="flex items-center gap-4 text-xs">
                          {source.result.wordCount && (
                            <span className="text-green-600 font-medium">
                              {source.result.wordCount.toLocaleString()} words
                            </span>
                          )}
                          {source.result.duration && (
                            <span className="text-gray-500">
                              {formatDuration(source.result.duration)}
                            </span>
                          )}
                          {source.result.error && (
                            <span className="text-red-600 truncate max-w-md">
                              {source.result.error}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 ml-4">
                      {source.status === 'pending' && (
                        <Button
                          onClick={() => onRunSingle(source.id)}
                          disabled={isProcessing}
                          size="sm"
                          variant="outline"
                        >
                          <Play className="h-3 w-3" />
                        </Button>
                      )}
                      {source.status === 'failed' && (
                        <Button
                          onClick={() => onRetry(source.id)}
                          disabled={isProcessing}
                          size="sm"
                          variant="outline"
                        >
                          <RotateCcw className="h-3 w-3" />
                        </Button>
                      )}
                      {source.status === 'success' && source.result && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-green-600"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}


'use client';

/**
 * HITL Checkpoint 4: Deliverable Confirmation
 *
 * Final review of generated artifacts. User can accept or request revision rounds.
 * Includes preview, quality scores, and download capabilities.
 */

import React, { useState } from 'react';
import {
  Download,
  FileText,
  CheckCircle,
  RefreshCw,
  Eye,
  Star,
  AlertCircle,
  File,
  FileJson,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import type { Deliverable, DeliverableConfirmationCheckpointProps } from '../../mode-3/types/mode3.types';

export function DeliverableConfirmationCheckpoint({
  deliverables,
  missionId,
  revisionCount,
  maxRevisions,
  onAccept,
  onRequestRevision,
  onDownload,
  onPreview,
  isLoading = false
}: DeliverableConfirmationCheckpointProps) {
  const [selectedDeliverable, setSelectedDeliverable] = useState<Deliverable | null>(null);
  const [showRevisionDialog, setShowRevisionDialog] = useState(false);
  const [revisionFeedback, setRevisionFeedback] = useState('');

  const getStatusColor = (status: Deliverable['status']): string => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'generated':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'revision_requested':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'generating':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'pending':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getTypeIcon = (type: Deliverable['type']) => {
    const iconClass = "h-5 w-5";
    switch (type) {
      case 'csv':
        return <FileSpreadsheet className={iconClass} />;
      case 'json':
        return <FileJson className={iconClass} />;
      case 'markdown':
      case 'pdf':
        return <FileText className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const getQualityColor = (score?: number): string => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-600 dark:text-green-400';
    if (score >= 70) return 'text-blue-600 dark:text-blue-400';
    if (score >= 50) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const allGenerated = deliverables.every(d =>
    d.status === 'generated' || d.status === 'approved'
  );

  const averageQuality = deliverables.length > 0
    ? deliverables.reduce((sum, d) => sum + (d.quality_score || 0), 0) / deliverables.length
    : 0;

  const canRequestRevision = revisionCount < maxRevisions;

  const handleRequestRevision = () => {
    if (!revisionFeedback.trim()) return;
    onRequestRevision(revisionFeedback);
    setShowRevisionDialog(false);
    setRevisionFeedback('');
  };

  const handlePreviewClick = (deliverable: Deliverable) => {
    setSelectedDeliverable(deliverable);
    onPreview(deliverable.id);
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Review Mission Deliverables
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Review generated artifacts and their quality scores. Accept to complete or request revisions.
        </p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {deliverables.length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Total Deliverables
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {deliverables.filter(d => d.status === 'generated' || d.status === 'approved').length}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Ready
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-2">
              <Star className={`h-5 w-5 ${getQualityColor(averageQuality)}`} />
              <div className="text-2xl font-bold text-gray-900 dark:text-white">
                {averageQuality.toFixed(0)}%
              </div>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Average Quality
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {revisionCount}/{maxRevisions}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Revision Rounds Used
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status Alert */}
      {allGenerated ? (
        <Alert className="border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-950">
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-900 dark:text-green-100">
            All deliverables have been generated successfully. Review and accept or request revisions.
          </AlertDescription>
        </Alert>
      ) : (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Some deliverables are still being generated. Please wait for completion.
          </AlertDescription>
        </Alert>
      )}

      {/* Deliverables Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {deliverables.map((deliverable) => (
          <Card
            key={deliverable.id}
            className="hover:shadow-md transition-shadow"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                    {getTypeIcon(deliverable.type)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{deliverable.name}</CardTitle>
                    <CardDescription className="mt-1">
                      {deliverable.type.toUpperCase()}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusColor(deliverable.status)}>
                  {deliverable.status.replace('_', ' ')}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quality Score */}
              {deliverable.quality_score !== undefined && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Quality Score</span>
                    <span className={`font-bold ${getQualityColor(deliverable.quality_score)}`}>
                      {deliverable.quality_score}%
                    </span>
                  </div>
                  <Progress value={deliverable.quality_score} className="h-2" />
                </div>
              )}

              {/* Preview */}
              {deliverable.preview && (
                <div className="border rounded-lg p-3 bg-gray-50 dark:bg-gray-800/50">
                  <div className="text-xs text-gray-500 mb-2">Preview</div>
                  <div className="text-sm text-gray-700 dark:text-gray-300 line-clamp-3">
                    {deliverable.preview}
                  </div>
                </div>
              )}

              <Separator />

              {/* Actions */}
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePreviewClick(deliverable)}
                  className="flex-1"
                  disabled={deliverable.status === 'pending' || deliverable.status === 'generating'}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDownload(deliverable.id)}
                  className="flex-1"
                  disabled={deliverable.status === 'pending' || deliverable.status === 'generating'}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      <Dialog
        open={selectedDeliverable !== null}
        onOpenChange={(open) => !open && setSelectedDeliverable(null)}
      >
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {selectedDeliverable && getTypeIcon(selectedDeliverable.type)}
              {selectedDeliverable?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="pt-4">
            {selectedDeliverable?.content ? (
              <div className="prose dark:prose-invert max-w-none">
                <pre className="whitespace-pre-wrap text-sm bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto">
                  {selectedDeliverable.content}
                </pre>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-8">
                Preview not available
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Revision Dialog */}
      <Dialog open={showRevisionDialog} onOpenChange={setShowRevisionDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Request Revision Round</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div>
              <Label htmlFor="revision-feedback">
                What needs to be improved?
              </Label>
              <Textarea
                id="revision-feedback"
                value={revisionFeedback}
                onChange={(e) => setRevisionFeedback(e.target.value)}
                placeholder="Describe the changes you'd like to see..."
                className="min-h-[120px] mt-2"
              />
            </div>
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                The mission will be re-executed with your feedback to generate improved deliverables.
                You have {maxRevisions - revisionCount} revision round{maxRevisions - revisionCount !== 1 ? 's' : ''} remaining.
              </AlertDescription>
            </Alert>
            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => setShowRevisionDialog(false)}
              >
                Cancel
              </Button>
              <Button
                onClick={handleRequestRevision}
                disabled={!revisionFeedback.trim()}
              >
                Request Revision
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t">
        <Button
          variant="outline"
          onClick={() => setShowRevisionDialog(true)}
          disabled={isLoading || !allGenerated || !canRequestRevision}
        >
          <RefreshCw className="h-4 w-4 mr-2" />
          Request Revision Round
          {!canRequestRevision && (
            <span className="ml-2 text-xs text-gray-400">(limit reached)</span>
          )}
        </Button>

        <Button
          onClick={onAccept}
          disabled={isLoading || !allGenerated}
          size="lg"
          className="bg-green-600 hover:bg-green-700 text-white"
        >
          <CheckCircle className="h-5 w-5 mr-2" />
          {isLoading ? 'Processing...' : 'Accept Deliverables'}
        </Button>
      </div>
    </div>
  );
}

export default DeliverableConfirmationCheckpoint;

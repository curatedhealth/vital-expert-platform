'use client';

import {
  MessageSquare,
  AlertTriangle,
  CheckSquare,
  FileText,
  Download,
  Share2,
  TrendingUp
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import type { ActionItemExtractionResult } from '@/lib/services/action-item-extractor';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { ActionItemsDisplay } from './action-items-display';
import { RiskMatrix, type RiskMatrixData } from './risk-matrix';


interface EnhancedPanelResultsProps {
  panelDiscussion: {
    question: string;
    expertReplies: any[];
    synthesis: string;
    timestamp: string;
  };
  onClose?: () => void;
}

export function EnhancedPanelResults({ panelDiscussion, onClose }: EnhancedPanelResultsProps) {
  const [riskMatrix, setRiskMatrix] = useState<RiskMatrixData | null>(null);
  const [actionItems, setActionItems] = useState<ActionItemExtractionResult | null>(null);
  const [loadingRisks, setLoadingRisks] = useState(false);
  const [loadingActions, setLoadingActions] = useState(false);
  const [activeTab, setActiveTab] = useState('discussion');

  const loadRiskAssessment = async () => {
    setLoadingRisks(true);
    try {
      const response = await fetch('/api/panel/risk-assessment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: panelDiscussion.question,
          expertReplies: panelDiscussion.expertReplies,
          synthesis: panelDiscussion.synthesis
        })
      });

      if (response.ok) {
        const data = await response.json();
        setRiskMatrix(data.riskMatrix);
      }
    } catch (error) {
      console.error('Failed to load risk assessment:', error);
    } finally {
      setLoadingRisks(false);
    }
  };

  const loadActionItems = async () => {
    setLoadingActions(true);
    try {
      const response = await fetch('/api/panel/action-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: panelDiscussion.question,
          expertReplies: panelDiscussion.expertReplies,
          synthesis: panelDiscussion.synthesis
        })
      });

      if (response.ok) {
        const data = await response.json();
        setActionItems(data);
      }
    } catch (error) {
      console.error('Failed to load action items:', error);
    } finally {
      setLoadingActions(false);
    }
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    // TODO: Implement export functionality
    console.log(`Exporting as ${format}`);
  };

  // Auto-load risk assessment and action items
  useEffect(() => {
    loadRiskAssessment();
    loadActionItems();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [panelDiscussion]);

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2">Panel Discussion Results</CardTitle>
              <CardDescription className="text-base">
                {panelDiscussion.question}
              </CardDescription>
              <div className="flex items-center gap-4 mt-4">
                <Badge variant="outline" className="text-sm">
                  {panelDiscussion.expertReplies.length} Experts
                </Badge>
                <Badge variant="outline" className="text-sm">
                  {new Date(panelDiscussion.timestamp).toLocaleDateString()}
                </Badge>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('pdf')}
              >
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleExport('docx')}
              >
                <FileText className="h-4 w-4 mr-2" />
                Export DOCX
              </Button>
              <Button
                variant="outline"
                size="sm"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">{panelDiscussion.expertReplies.length}</div>
                <div className="text-sm text-muted-foreground">Expert Insights</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loadingRisks ? '...' : riskMatrix?.summary.totalRisks || 0}
                </div>
                <div className="text-sm text-muted-foreground">Risks Identified</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                <CheckSquare className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loadingActions ? '...' : actionItems?.summary.totalItems || 0}
                </div>
                <div className="text-sm text-muted-foreground">Action Items</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <div className="text-2xl font-bold">
                  {loadingActions ? '...' : actionItems?.summary.criticalItems || 0}
                </div>
                <div className="text-sm text-muted-foreground">Critical Actions</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="discussion">
            <MessageSquare className="h-4 w-4 mr-2" />
            Discussion
          </TabsTrigger>
          <TabsTrigger value="synthesis">
            <FileText className="h-4 w-4 mr-2" />
            Synthesis
          </TabsTrigger>
          <TabsTrigger value="risks">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Risk Matrix
            {riskMatrix && riskMatrix.summary.criticalRisks > 0 && (
              <Badge className="ml-2 bg-red-600 text-white" variant="default">
                {riskMatrix.summary.criticalRisks}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="actions">
            <CheckSquare className="h-4 w-4 mr-2" />
            Action Items
            {actionItems && actionItems.summary.immediateActions > 0 && (
              <Badge className="ml-2 bg-orange-600 text-white" variant="default">
                {actionItems.summary.immediateActions}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        {/* Expert Discussion Tab */}
        <TabsContent value="discussion" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Expert Insights</CardTitle>
              <CardDescription>
                Detailed responses from {panelDiscussion.expertReplies.length} panel members
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {panelDiscussion.expertReplies.map((reply, index) => (
                <div key={index} className="border-l-4 border-blue-500 pl-4 py-2">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h4 className="font-semibold text-lg">
                        {reply.expertName || reply.persona || `Expert ${index + 1}`}
                      </h4>
                      {reply.confidence && (
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">
                            Confidence: {Math.round(reply.confidence * 100)}%
                          </Badge>
                          {reply.round && (
                            <Badge variant="outline">Round {reply.round}</Badge>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {reply.text || reply.content}
                  </p>
                  {reply.citations && reply.citations.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold mb-1">Citations:</p>
                      <ul className="text-xs text-muted-foreground list-disc list-inside">
                        {reply.citations.map((citation: string, idx: number) => (
                          <li key={idx}>{citation}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {reply.toolCalls && reply.toolCalls.length > 0 && (
                    <div className="mt-3">
                      <p className="text-xs font-semibold mb-1">Tools Used:</p>
                      <div className="flex flex-wrap gap-1">
                        {reply.toolCalls.map((toolCall: any, idx: number) => (
                          <Badge key={idx} variant="secondary" className="text-xs">
                            {toolCall.toolName}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Synthesis Tab */}
        <TabsContent value="synthesis">
          <Card>
            <CardHeader>
              <CardTitle>Panel Synthesis</CardTitle>
              <CardDescription>
                Comprehensive summary of the panel discussion and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="prose prose-sm max-w-none">
                <div className="whitespace-pre-wrap">{panelDiscussion.synthesis}</div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Matrix Tab */}
        <TabsContent value="risks">
          {loadingRisks ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Analyzing risks from panel discussion...</p>
                </div>
              </CardContent>
            </Card>
          ) : riskMatrix ? (
            <RiskMatrix data={riskMatrix} />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No risk assessment available</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={loadRiskAssessment}
                  >
                    Generate Risk Assessment
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Action Items Tab */}
        <TabsContent value="actions">
          {loadingActions ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Extracting action items from discussion...</p>
                </div>
              </CardContent>
            </Card>
          ) : actionItems ? (
            <ActionItemsDisplay
              actionItems={actionItems.actionItems}
              summary={actionItems.summary}
              raciMatrix={actionItems.raciMatrix}
              implementationPlan={actionItems.implementationPlan}
              criticalPath={actionItems.criticalPath}
            />
          ) : (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-12">
                  <CheckSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No action items available</p>
                  <Button
                    variant="outline"
                    className="mt-4"
                    onClick={loadActionItems}
                  >
                    Extract Action Items
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Footer Actions */}
      <div className="flex items-center justify-between pt-6 border-t">
        <p className="text-sm text-muted-foreground">
          Discussion completed on {new Date(panelDiscussion.timestamp).toLocaleString()}
        </p>
        {onClose && (
          <Button onClick={onClose} variant="outline">
            Close
          </Button>
        )}
      </div>
    </div>
  );
}

export default EnhancedPanelResults;

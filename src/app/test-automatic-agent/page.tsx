'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AutomaticModeInterface } from '@/components/chat/automatic-mode-interface';
import { useAutomaticMode } from '@/shared/hooks/use-automatic-mode';
import { Brain, Send, TestTube, BarChart3 } from 'lucide-react';

const DEMO_QUERIES = [
  'What are the FDA requirements for drug approval?',
  'What is the recommended dosage for metformin?',
  'How do I design a Phase II clinical trial?',
  'What are the side effects of ACE inhibitors?',
  'Compare FDA and EMA requirements for biosimilar approval'
];

export default function TestAutomaticAgentPage() {
  const [query, setQuery] = useState('');
  const { 
    isProcessing, 
    orchestrationResult, 
    error, 
    processQuery, 
    confirmAgent, 
    selectAlternativeAgent, 
    clearResult 
  } = useAutomaticMode();

  const handleQuerySubmit = async (queryText: string) => {
    setQuery(queryText);
    await processQuery(queryText);
  };

  const handleDemoQuery = async (demoQuery: string) => {
    setQuery(demoQuery);
    await processQuery(demoQuery);
  };

  const handleConfirmAgent = async () => {
    if (orchestrationResult) {
      await confirmAgent(orchestrationResult.selectedAgent);
    }
  };

  const handleSelectAlternative = async (agent: any) => {
    await selectAlternativeAgent(agent);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold flex items-center justify-center gap-2">
          <Brain className="h-8 w-8 text-blue-600" />
          Automatic Agent Selection Test
        </h1>
        <p className="text-muted-foreground">
          Test the intelligent agent selection system
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TestTube className="h-5 w-5" />
            Try Sample Queries
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
            {DEMO_QUERIES.map((demoQuery, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                className="text-left h-auto p-3 justify-start"
                onClick={() => handleDemoQuery(demoQuery)}
                disabled={isProcessing}
              >
                <div className="text-xs">{demoQuery}</div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Custom Query</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Enter your healthcare or regulatory query..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !isProcessing) {
                  handleQuerySubmit(query);
                }
              }}
              disabled={isProcessing}
            />
            <Button 
              onClick={() => handleQuerySubmit(query)}
              disabled={!query.trim() || isProcessing}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Query Analysis Display */}
      {orchestrationResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Query Analysis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-3 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {orchestrationResult.analysis.complexity.score}/10
                </div>
                <div className="text-xs text-blue-600">Complexity</div>
              </div>
              <div className="text-center p-3 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(orchestrationResult.confidence * 100)}%
                </div>
                <div className="text-xs text-green-600">Confidence</div>
              </div>
              <div className="text-center p-3 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {orchestrationResult.analysis.entities.length}
                </div>
                <div className="text-xs text-purple-600">Entities</div>
              </div>
              <div className="text-center p-3 bg-orange-50 rounded-lg">
                <div className="text-2xl font-bold text-orange-600">
                  {orchestrationResult.analysis.requiredCapabilities.length}
                </div>
                <div className="text-xs text-orange-600">Capabilities</div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div>
                <h4 className="font-medium text-sm mb-2">Detected Entities</h4>
                <div className="flex flex-wrap gap-2">
                  {orchestrationResult.analysis.entities.map((entity, idx) => (
                    <Badge key={idx} variant="secondary">
                      {entity.type}: {entity.value}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium text-sm mb-2">Required Capabilities</h4>
                <div className="flex flex-wrap gap-2">
                  {orchestrationResult.analysis.requiredCapabilities.map((cap, idx) => (
                    <Badge key={idx} variant="outline">
                      {cap.replace(/_/g, ' ')}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Automatic Mode Interface */}
      <AutomaticModeInterface
        orchestrationResult={orchestrationResult}
        isProcessing={isProcessing}
        onConfirmAgent={handleConfirmAgent}
        onSelectAlternative={handleSelectAlternative}
        onSwitchToManual={() => clearResult()}
      />

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="text-red-800">
              <strong>Error:</strong> {error}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

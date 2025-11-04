/**
 * Ask Panel Page
 * 
 * Multi-expert consultation interface with adaptive framework selection
 */

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Users, Brain, TrendingUp, Shield, Stethoscope, Code, AlertCircle, Scale } from 'lucide-react';
import { PanelMode, ExpertType, type PanelResponse } from '@/features/ask-panel/services/ask-panel-orchestrator';

const EXPERT_ICONS: Record<ExpertType, React.ElementType> = {
  [ExpertType.CEO]: TrendingUp,
  [ExpertType.CFO]: AlertCircle,
  [ExpertType.CMO]: Stethoscope,
  [ExpertType.CTO]: Code,
  [ExpertType.COO]: Users,
  [ExpertType.ChiefNurse]: Shield,
  [ExpertType.Compliance]: Scale,
  [ExpertType.Legal]: Scale,
};

const EXPERT_COLORS: Record<ExpertType, string> = {
  [ExpertType.CEO]: 'text-purple-600 bg-purple-50',
  [ExpertType.CFO]: 'text-blue-600 bg-blue-50',
  [ExpertType.CMO]: 'text-green-600 bg-green-50',
  [ExpertType.CTO]: 'text-indigo-600 bg-indigo-50',
  [ExpertType.COO]: 'text-orange-600 bg-orange-50',
  [ExpertType.ChiefNurse]: 'text-pink-600 bg-pink-50',
  [ExpertType.Compliance]: 'text-red-600 bg-red-50',
  [ExpertType.Legal]: 'text-gray-600 bg-gray-50',
};

export default function AskPanelPage() {
  const [question, setQuestion] = useState('');
  const [selectedExperts, setSelectedExperts] = useState<ExpertType[]>([ExpertType.CEO, ExpertType.CFO, ExpertType.CMO]);
  const [mode, setMode] = useState<PanelMode>(PanelMode.Hybrid);
  const [allowDebate, setAllowDebate] = useState(true);
  const [requireConsensus, setRequireConsensus] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<PanelResponse | null>(null);

  const showToast = async (type: 'success' | 'error', message: string) => {
    if (typeof window === 'undefined') {
      if (type === 'error') console.error(message);
      else console.log(message);
      return;
    }
    const sonner = await import('sonner');
    sonner.toast[type](message);
  };

  const toggleExpert = (expert: ExpertType) => {
    setSelectedExperts(prev =>
      prev.includes(expert)
        ? prev.filter(e => e !== expert)
        : [...prev, expert]
    );
  };

  const handleConsult = async () => {
    if (!question.trim()) {
      await showToast('error', 'Please enter a question');
      return;
    }

    if (selectedExperts.length === 0) {
      await showToast('error', 'Please select at least one expert');
      return;
    }

    setIsLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/ask-panel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question,
          mode,
          experts: selectedExperts,
          allowDebate,
          requireConsensus,
          maxRounds: 10,
          userGuidance: mode === PanelMode.Sequential ? 'high' : 'low',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Panel consultation failed');
      }

      const data = await response.json();
      setResult(data);
      await showToast('success', `Panel consultation complete using ${data.framework.toUpperCase()}`);
    } catch (error) {
      console.error('Panel consultation error:', error);
      await showToast('error', error instanceof Error ? error.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Ask the Panel</h1>
        <p className="text-gray-600">
          Consult with multiple healthcare executives simultaneously. The system intelligently
          chooses between LangGraph (sequential) and AutoGen (collaborative) based on your needs.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Configuration */}
        <div className="lg:col-span-1 space-y-6">
          {/* Panel Mode */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Panel Mode</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup value={mode} onValueChange={(v) => setMode(v as PanelMode)}>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value={PanelMode.Sequential} id="sequential" />
                  <Label htmlFor="sequential" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Sequential</span>
                    <span className="text-xs text-gray-500">One expert at a time (LangGraph)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 mb-3">
                  <RadioGroupItem value={PanelMode.Collaborative} id="collaborative" />
                  <Label htmlFor="collaborative" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Collaborative</span>
                    <span className="text-xs text-gray-500">Experts discuss together (AutoGen)</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value={PanelMode.Hybrid} id="hybrid" />
                  <Label htmlFor="hybrid" className="flex flex-col cursor-pointer">
                    <span className="font-medium">Hybrid (Auto)</span>
                    <span className="text-xs text-gray-500">System chooses best approach</span>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox id="debate" checked={allowDebate} onCheckedChange={(checked) => setAllowDebate(!!checked)} />
                <Label htmlFor="debate" className="cursor-pointer text-sm">
                  Allow debate between experts
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox id="consensus" checked={requireConsensus} onCheckedChange={(checked) => setRequireConsensus(!!checked)} />
                <Label htmlFor="consensus" className="cursor-pointer text-sm">
                  Require consensus recommendation
                </Label>
              </div>
            </CardContent>
          </Card>

          {/* Expert Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Select Experts ({selectedExperts.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {Object.values(ExpertType).map((expert) => {
                const Icon = EXPERT_ICONS[expert];
                const isSelected = selectedExperts.includes(expert);
                
                return (
                  <div
                    key={expert}
                    onClick={() => toggleExpert(expert)}
                    className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      isSelected
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className={`p-2 rounded ${EXPERT_COLORS[expert]}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium capitalize">{expert.replace('_', ' ')}</span>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </div>

        {/* Right: Question & Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Input */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Your Question</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Ask the panel a strategic question... e.g., 'Should we invest $10M in a new telehealth platform?'"
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={4}
                className="mb-4"
              />
              <Button
                onClick={handleConsult}
                disabled={isLoading || !question.trim() || selectedExperts.length === 0}
                className="w-full"
                size="lg"
              >
                {isLoading ? 'Consulting Panel...' : `Consult ${selectedExperts.length} Expert${selectedExperts.length > 1 ? 's' : ''}`}
              </Button>
            </CardContent>
          </Card>

          {/* Results */}
          {result && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Panel Responses</CardTitle>
                  <Badge variant="secondary">
                    {result.framework === 'langgraph' ? 'LangGraph (Sequential)' : 'AutoGen (Collaborative)'}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {result.experts.map((expert, idx) => {
                  const Icon = EXPERT_ICONS[expert.type];
                  
                  return (
                    <div key={idx} className="border rounded-lg p-4">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`p-2 rounded ${EXPERT_COLORS[expert.type]}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-semibold capitalize">{expert.type.replace('_', ' ')}</p>
                          <p className="text-xs text-gray-500">Confidence: {(expert.confidence * 100).toFixed(0)}%</p>
                        </div>
                      </div>
                      <p className="text-sm text-gray-700 whitespace-pre-wrap">{expert.response}</p>
                    </div>
                  );
                })}

                {result.consensus && (
                  <div className="border-t pt-4 mt-4">
                    <h3 className="font-semibold mb-2 flex items-center gap-2">
                      <Users className="w-5 h-5" />
                      Consensus
                    </h3>
                    {result.consensus.reached ? (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <p className="text-sm text-green-900">{result.consensus.finalRecommendation}</p>
                      </div>
                    ) : (
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <p className="text-sm text-yellow-900">No consensus reached. Dissenting views present.</p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}

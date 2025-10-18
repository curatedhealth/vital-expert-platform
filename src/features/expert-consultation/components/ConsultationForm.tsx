'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, Send, Brain, DollarSign } from 'lucide-react';

interface ConsultationFormProps {
  onStart: (sessionId: string) => void;
  onComplete: () => void;
}

export function ConsultationForm({ onStart, onComplete }: ConsultationFormProps) {
  const [formData, setFormData] = useState({
    query: '',
    expert_type: 'regulatory-strategy',
    reasoning_mode: 'react',
    budget: 10,
    max_iterations: 5
  });
  const [businessContext, setBusinessContext] = useState({
    company_size: '',
    therapeutic_area: '',
    development_stage: '',
    target_market: '',
    timeline: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch('/api/ask-expert/execute', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: formData.query,
          expert_type: formData.expert_type,
          business_context: businessContext,
          user_id: 'current-user', // In production, get from auth
          reasoning_mode: formData.reasoning_mode,
          budget: formData.budget,
          max_iterations: formData.max_iterations
        })
      });

      if (!response.ok) {
        throw new Error('Failed to start consultation');
      }

      const result = await response.json();
      onStart(result.session_id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const expertTypes = [
    { value: 'regulatory-strategy', label: 'Regulatory Strategy', description: 'FDA/EMA regulatory pathways' },
    { value: 'market-access', label: 'Market Access', description: 'Payer strategies and reimbursement' },
    { value: 'clinical-trial-design', label: 'Clinical Trial Design', description: 'Protocol development and endpoints' }
  ];

  const reasoningModes = [
    { value: 'react', label: 'ReAct', description: 'Think → Plan → Act → Observe → Reflect' },
    { value: 'cot', label: 'Chain of Thought', description: 'Decompose → Reason → Synthesize' },
    { value: 'auto', label: 'Automatic', description: 'AI selects optimal reasoning approach' }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="w-5 h-5" />
          Expert Consultation
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Query Input */}
          <div>
            <label htmlFor="query" className="block text-sm font-medium text-gray-700 mb-2">
              Your Question
            </label>
            <Textarea
              id="query"
              placeholder="Describe your regulatory, clinical, or market access challenge..."
              value={formData.query}
              onChange={(e) => setFormData(prev => ({ ...prev, query: e.target.value }))}
              className="min-h-[120px]"
              required
            />
          </div>

          {/* Expert Type Selection */}
          <div>
            <label htmlFor="expert_type" className="block text-sm font-medium text-gray-700 mb-2">
              Expert Type
            </label>
            <Select
              value={formData.expert_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, expert_type: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {expertTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div>
                      <div className="font-medium">{type.label}</div>
                      <div className="text-sm text-gray-500">{type.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Reasoning Mode */}
          <div>
            <label htmlFor="reasoning_mode" className="block text-sm font-medium text-gray-700 mb-2">
              Reasoning Mode
            </label>
            <Select
              value={formData.reasoning_mode}
              onValueChange={(value) => setFormData(prev => ({ ...prev, reasoning_mode: value }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {reasoningModes.map((mode) => (
                  <SelectItem key={mode.value} value={mode.value}>
                    <div>
                      <div className="font-medium">{mode.label}</div>
                      <div className="text-sm text-gray-500">{mode.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Business Context */}
          <div className="space-y-4">
            <h4 className="text-sm font-medium text-gray-700">Business Context (Optional)</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="company_size" className="block text-xs text-gray-600 mb-1">
                  Company Size
                </label>
                <Input
                  id="company_size"
                  placeholder="e.g., 50-200 employees"
                  value={businessContext.company_size}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, company_size: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="therapeutic_area" className="block text-xs text-gray-600 mb-1">
                  Therapeutic Area
                </label>
                <Input
                  id="therapeutic_area"
                  placeholder="e.g., Oncology"
                  value={businessContext.therapeutic_area}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, therapeutic_area: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="development_stage" className="block text-xs text-gray-600 mb-1">
                  Development Stage
                </label>
                <Input
                  id="development_stage"
                  placeholder="e.g., Phase II"
                  value={businessContext.development_stage}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, development_stage: e.target.value }))}
                />
              </div>
              <div>
                <label htmlFor="target_market" className="block text-xs text-gray-600 mb-1">
                  Target Market
                </label>
                <Input
                  id="target_market"
                  placeholder="e.g., US, EU"
                  value={businessContext.target_market}
                  onChange={(e) => setBusinessContext(prev => ({ ...prev, target_market: e.target.value }))}
                />
              </div>
            </div>
          </div>

          {/* Budget and Iterations */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="budget" className="block text-sm font-medium text-gray-700 mb-2">
                Budget ($)
              </label>
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  id="budget"
                  type="number"
                  min="1"
                  max="100"
                  step="0.5"
                  value={formData.budget}
                  onChange={(e) => setFormData(prev => ({ ...prev, budget: parseFloat(e.target.value) }))}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <label htmlFor="max_iterations" className="block text-sm font-medium text-gray-700 mb-2">
                Max Iterations
              </label>
              <Input
                id="max_iterations"
                type="number"
                min="1"
                max="10"
                value={formData.max_iterations}
                onChange={(e) => setFormData(prev => ({ ...prev, max_iterations: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isSubmitting || !formData.query.trim()}
            className="w-full"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Starting Consultation...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                Start Expert Consultation
              </>
            )}
          </Button>

          {/* Features Badge */}
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Real-time Reasoning</Badge>
            <Badge variant="secondary">Cost Tracking</Badge>
            <Badge variant="secondary">30 Knowledge Domains</Badge>
            <Badge variant="secondary">254+ Expert Agents</Badge>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

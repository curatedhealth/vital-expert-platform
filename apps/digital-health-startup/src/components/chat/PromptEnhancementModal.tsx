'use client';

import {
  Sparkles,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  ArrowRight,
  Lightbulb,
  Target,
  TrendingUp,
  BookOpen,
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Alert, AlertDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@vital/ui';

interface IntentOption {
  id: number;
  title: string;
  description: string;
  focus: string;
  keywords: string[];
}

interface PromptEnhancementModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyPrompt: (enhancedPrompt: string) => void;
  currentInput?: string;
  agentName?: string;
  agentId?: string;
  domain?: string;
}

export function PromptEnhancementModal({
  isOpen,
  onClose,
  onApplyPrompt,
  currentInput = '',
  agentName,
  agentId,
  domain,
}: PromptEnhancementModalProps) {
  // Step 1: Intent clarification
  const [step, setStep] = useState<'intent' | 'enhanced'>('intent');
  const [intentOptions, setIntentOptions] = useState<IntentOption[]>([]);
  const [selectedIntent, setSelectedIntent] = useState<IntentOption | null>(null);
  const [isLoadingIntent, setIsLoadingIntent] = useState(false);

  // Step 2: Enhanced prompt
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [isGeneratingEnhanced, setIsGeneratingEnhanced] = useState(false);
  const [templateInfo, setTemplateInfo] = useState<any>(null);
  const [explanation, setExplanation] = useState('');
  const [improvements, setImprovements] = useState<string[]>([]);

  // General
  const [error, setError] = useState<string | null>(null);

  // Load intent options when modal opens
  useEffect(() => {
    if (isOpen && currentInput.trim()) {
      loadIntentOptions();
    } else if (isOpen && !currentInput.trim()) {
      setError('Please enter a prompt first');
    }
  }, [isOpen, currentInput]);

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep('intent');
      setIntentOptions([]);
      setSelectedIntent(null);
      setEnhancedPrompt('');
      setError(null);
      setTemplateInfo(null);
      setExplanation('');
      setImprovements([]);
    }
  }, [isOpen]);

  // Load intent clarification options
  const loadIntentOptions = async () => {
    setIsLoadingIntent(true);
    setError(null);

    try {
      const response = await fetch('/api/prompts/clarify-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: currentInput,
          agentId,
          agentName,
          domain,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to load intent options');
      }

      setIntentOptions(data.options || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load options');
    } finally {
      setIsLoadingIntent(false);
    }
  };

  // Handle intent selection and generate enhanced prompt
  const handleSelectIntent = async (intent: IntentOption) => {
    setSelectedIntent(intent);
    setIsGeneratingEnhanced(true);
    setError(null);
    setStep('enhanced');

    try {
      const response = await fetch('/api/prompts/enhance-with-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          originalPrompt: currentInput,
          selectedIntent: intent,
          agentId,
          agentName,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to enhance prompt');
      }

      setEnhancedPrompt(data.enhancedPrompt);
      setTemplateInfo(data.templateUsed);
      setExplanation(data.explanation);
      setImprovements(data.improvements || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to enhance prompt');
      setStep('intent'); // Go back to intent selection
    } finally {
      setIsGeneratingEnhanced(false);
    }
  };

  // Apply enhanced prompt
  const handleApply = async () => {
    // Track that user applied the prompt (analytics)
    if (templateInfo?.template_id) {
      try {
        await fetch(`${process.env.NEXT_PUBLIC_AI_ENGINE_URL || 'http://localhost:8000'}/api/prompts/track-usage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            templateId: templateInfo.template_id,
            agentId,
            agentName,
            intentFocus: selectedIntent?.focus,
            userApplied: true,
          }),
        }).catch(err => console.error('Failed to track usage:', err));
      } catch (err) {
        // Silent fail - don't block user action
        console.error('Analytics tracking error:', err);
      }
    }
    
    onApplyPrompt(enhancedPrompt);
    onClose();
  };

  // Get icon for intent option
  const getIconForOption = (id: number) => {
    const icons = [
      <Target key={1} className="h-5 w-5" />,
      <TrendingUp key={2} className="h-5 w-5" />,
      <Lightbulb key={3} className="h-5 w-5" />,
      <BookOpen key={4} className="h-5 w-5" />,
    ];
    return icons[(id - 1) % 4];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            AI Prompt Enhancement
          </DialogTitle>
          <DialogDescription>
            {step === 'intent'
              ? 'Help us understand what you want to achieve'
              : 'Your professionally enhanced prompt'}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Step 1: Intent Clarification */}
        {step === 'intent' && (
          <div className="space-y-4">
            {/* Original Prompt Display */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Question:
              </h3>
              <p className="text-sm text-gray-900 dark:text-gray-100">"{currentInput}"</p>
            </div>

            {/* Instruction */}
            <div className="text-center py-2">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
                What are you trying to achieve?
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select the option that best matches your goal. We'll customize the perfect prompt
                for you.
              </p>
            </div>

            {/* Loading State */}
            {isLoadingIntent && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Analyzing your prompt...
                  </p>
                </div>
              </div>
            )}

            {/* Intent Options Grid */}
            {!isLoadingIntent && intentOptions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {intentOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => handleSelectIntent(option)}
                    className="group relative p-4 text-left border-2 border-gray-200 dark:border-gray-700 hover:border-purple-500 dark:hover:border-purple-500 rounded-xl transition-all hover:shadow-lg bg-white dark:bg-gray-800"
                  >
                    {/* Icon */}
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:bg-purple-200 dark:group-hover:bg-purple-900/50 transition-colors">
                        {getIconForOption(option.id)}
                      </div>

                      <div className="flex-1 min-w-0">
                        {/* Title */}
                        <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                          {option.title}
                        </h4>

                        {/* Description */}
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                          {option.description}
                        </p>

                        {/* Focus Badge */}
                        <Badge variant="secondary" className="text-xs">
                          {option.focus.replace('_', ' ')}
                        </Badge>
                      </div>

                      {/* Arrow Icon */}
                      <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 group-hover:translate-x-1 transition-all" />
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Step 2: Enhanced Prompt */}
        {step === 'enhanced' && (
          <div className="space-y-4">
            {/* Loading State */}
            {isGeneratingEnhanced && (
              <div className="flex items-center justify-center py-12">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4 text-purple-600" />
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Creating your perfect prompt...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    Finding the best template and customizing it for you
                  </p>
                </div>
              </div>
            )}

            {/* Enhanced Prompt Display */}
            {!isGeneratingEnhanced && enhancedPrompt && (
              <>
                {/* Selected Intent Recap */}
                {selectedIntent && (
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                      <span className="text-sm font-medium text-purple-900 dark:text-purple-100">
                        Selected Goal: {selectedIntent.title}
                      </span>
                    </div>
                  </div>
                )}

                {/* Template Source Info */}
                {templateInfo && (
                  <div className="p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/30 dark:to-blue-900/30 rounded-lg border border-purple-200 dark:border-purple-700">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                          <span className="text-xs font-semibold text-purple-900 dark:text-purple-100 uppercase tracking-wide">
                            PRISM Template Source
                          </span>
                        </div>
                        <div className="space-y-2">
                          <div>
                            <span className="text-xs text-gray-600 dark:text-gray-400">Template:</span>
                            <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                              {templateInfo.template_name || templateInfo.name}
                            </p>
                          </div>
                          {(templateInfo.suite || templateInfo.subsuite) && (
                            <div className="flex items-center gap-2">
                              {templateInfo.suite && (
                                <Badge variant="default" className="bg-purple-600 text-white">
                                  {templateInfo.suite}
                                </Badge>
                              )}
                              {templateInfo.subsuite && templateInfo.subsuite !== 'N/A' && (
                                <Badge variant="outline" className="border-purple-400 text-purple-700 dark:text-purple-300">
                                  {templateInfo.subsuite}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {templateInfo.template_id && templateInfo.template_id !== 'custom' && templateInfo.template_id !== 'fallback' && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-xs text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
                          onClick={() => {
                            // TODO: Navigate to template details
                            window.open(`/prompts/${templateInfo.template_id}`, '_blank');
                          }}
                        >
                          View Full Template →
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Explanation */}
                {explanation && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <p className="text-sm text-blue-900 dark:text-blue-100">{explanation}</p>
                  </div>
                )}

                {/* Enhanced Prompt */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Your Enhanced Prompt:
                    </h3>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg border-2 border-purple-200 dark:border-purple-800 max-h-96 overflow-y-auto">
                    <pre className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap font-sans">
                      {enhancedPrompt}
                    </pre>
                  </div>
                </div>

                {/* Improvements Made */}
                {improvements.length > 0 && (
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="text-sm font-medium text-green-900 dark:text-green-100 mb-2">
                      ✓ Improvements Made:
                    </h4>
                    <ul className="space-y-1">
                      {improvements.map((improvement, idx) => (
                        <li key={idx} className="text-xs text-green-800 dark:text-green-200">
                          • {improvement}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2 pt-4 border-t">
                  <Button variant="outline" onClick={() => setStep('intent')} className="flex-1">
                    ← Try Different Goal
                  </Button>
                  <Button onClick={handleApply} className="flex-1 bg-purple-600 hover:bg-purple-700">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Apply This Prompt
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Cancel Button (always visible) */}
        {step === 'intent' && !isLoadingIntent && (
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default PromptEnhancementModal;

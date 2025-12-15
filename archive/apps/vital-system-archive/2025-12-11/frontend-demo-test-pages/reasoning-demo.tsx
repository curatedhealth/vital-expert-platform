'use client';

import React, { useState } from 'react';

import { Button } from '@vital/ui';
import { Card } from '@vital/ui';

import {
  Reasoning,
  ReasoningContent,
  ReasoningStep,
  ReasoningText,
  ReasoningTrigger,
} from './reasoning';

export function ReasoningDemo() {
  const [isThinking, setIsThinking] = useState(false);
  const [reasoningText, setReasoningText] = useState('');

  const simulateThinking = () => {
    setIsThinking(true);
    setReasoningText('');

    const steps = [
      'Analyzing the user\'s question...',
      'Identifying key concepts and requirements...',
      'Consulting relevant knowledge sources...',
      'Evaluating multiple solution approaches...',
      'Synthesizing a comprehensive response...',
    ];

    let currentStep = 0;
    const interval = setInterval(() => {
      if (currentStep < steps.length) {
        setReasoningText(prev => prev + (prev ? '\n\n' : '') + steps[currentStep]);
        currentStep++;
      } else {
        clearInterval(interval);
        setIsThinking(false);
      }
    }, 800);
  };

  return (
    <div className="space-y-4 max-w-2xl">
      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">AI Reasoning Component Demo</h2>
        <p className="text-neutral-600 mb-4">
          Click the button below to simulate AI thinking process with auto-collapsing display.
        </p>
        <Button onClick={simulateThinking} disabled={isThinking}>
          {isThinking ? 'Thinking...' : 'Start Thinking'}
        </Button>
      </Card>

      {reasoningText && (
        <Reasoning isStreaming={isThinking}>
          <ReasoningTrigger title="AI Reasoning" />
          <ReasoningContent>
            <ReasoningText>
              <div className="whitespace-pre-line">{reasoningText}</div>
            </ReasoningText>
          </ReasoningContent>
        </Reasoning>
      )}

      {/* Example with Steps */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Example: Step-by-Step Reasoning</h3>
        <Reasoning isStreaming={false}>
          <ReasoningTrigger title="Clinical Trial Design Reasoning" />
          <ReasoningContent>
            <ReasoningStep step={1}>
              <strong>Problem Analysis:</strong> The user is asking about designing a clinical trial
              for a digital therapeutic targeting Type 2 Diabetes.
            </ReasoningStep>
            <ReasoningStep step={2}>
              <strong>Regulatory Context:</strong> FDA requires clinical validation for efficacy
              claims in digital therapeutics, typically through a 510(k) or De Novo pathway.
            </ReasoningStep>
            <ReasoningStep step={3}>
              <strong>Study Design Consideration:</strong> Randomized controlled trial (RCT) with
              active comparator vs. standard of care would be most appropriate.
            </ReasoningStep>
            <ReasoningStep step={4}>
              <strong>Sample Size Calculation:</strong> Based on expected effect size and power
              analysis, recommend n=150-200 participants for adequate statistical power.
            </ReasoningStep>
            <ReasoningStep step={5}>
              <strong>Primary Endpoint Selection:</strong> HbA1c reduction as primary endpoint,
              with secondary endpoints including patient-reported outcomes and treatment adherence.
            </ReasoningStep>
          </ReasoningContent>
        </Reasoning>
      </Card>
    </div>
  );
}
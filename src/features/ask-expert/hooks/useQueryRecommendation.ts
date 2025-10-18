'use client';

import { useState, useCallback } from 'react';

interface QueryAnalysis {
  intent: string;
  complexity: string;
  complexity_score: number;
  recommended_mode: string;
  confidence: number;
}

interface ModeRecommendation {
  query_analysis: QueryAnalysis;
  recommended_modes: string[];
  mode_configurations: Record<string, {
    description: string;
    features: string[];
    use_cases: string[];
  }>;
}

export function useQueryRecommendation() {
  const [recommendation, setRecommendation] = useState<ModeRecommendation | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getRecommendation = useCallback(async (query: string, context?: Record<string, any>): Promise<ModeRecommendation | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/ask-expert/modes/recommend-mode', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, context }),
      });

      if (!response.ok) {
        throw new Error(`Failed to get recommendation: ${response.statusText}`);
      }

      const data = await response.json();
      setRecommendation(data);
      return data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to get recommendation';
      setError(errorMessage);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearRecommendation = useCallback(() => {
    setRecommendation(null);
    setError(null);
  }, []);

  const getIntentFromQuery = useCallback((query: string): string => {
    const queryLower = query.toLowerCase();
    
    if (queryLower.includes('what is') || queryLower.includes('tell me about') || queryLower.includes('explain')) {
      return 'informational';
    }
    if (queryLower.includes('how should') || queryLower.includes('recommend') || queryLower.includes('best approach')) {
      return 'strategic';
    }
    if (queryLower.includes('analyze') || queryLower.includes('compare') || queryLower.includes('evaluate')) {
      return 'analytical';
    }
    if (queryLower.includes('how do') || queryLower.includes('steps') || queryLower.includes('process')) {
      return 'procedural';
    }
    if (queryLower.includes('generate') || queryLower.includes('brainstorm') || queryLower.includes('design')) {
      return 'creative';
    }
    if (queryLower.includes('urgent') || queryLower.includes('asap') || queryLower.includes('immediately')) {
      return 'urgent';
    }
    
    return 'informational';
  }, []);

  const getComplexityFromQuery = useCallback((query: string): { level: string; score: number } => {
    const wordCount = query.split(' ').length;
    const questionCount = (query.match(/\?/g) || []).length;
    const technicalTerms = ['regulatory', 'clinical', 'pharmacokinetics', 'biomarker', 'endpoint', 'protocol', 'adverse event', 'efficacy', 'safety', 'FDA', 'EMA'];
    const technicalCount = technicalTerms.filter(term => query.toLowerCase().includes(term)).length;
    
    let complexityScore = 0;
    
    // Length factor
    if (wordCount < 10) complexityScore += 0.1;
    else if (wordCount < 25) complexityScore += 0.3;
    else if (wordCount < 50) complexityScore += 0.5;
    else complexityScore += 0.7;
    
    // Question count factor
    complexityScore += Math.min(questionCount * 0.2, 0.4);
    
    // Technical terms factor
    complexityScore += Math.min(technicalCount * 0.1, 0.3);
    
    // Reasoning indicators
    const reasoningWords = ['analyze', 'compare', 'evaluate', 'assess', 'consider', 'determine', 'strategize', 'plan', 'recommend', 'suggest', 'propose', 'design'];
    const reasoningCount = reasoningWords.filter(word => query.toLowerCase().includes(word)).length;
    complexityScore += Math.min(reasoningCount * 0.15, 0.3);
    
    complexityScore = Math.min(complexityScore, 1.0);
    
    let level: string;
    if (complexityScore < 0.3) level = 'simple';
    else if (complexityScore < 0.6) level = 'moderate';
    else if (complexityScore < 0.8) level = 'complex';
    else level = 'expert';
    
    return { level, score: complexityScore };
  }, []);

  const getRecommendedMode = useCallback((intent: string, complexityScore: number): string => {
    if (intent === 'strategic' || intent === 'analytical' || complexityScore > 0.6) {
      return 'autonomous';
    }
    if (intent === 'urgent' || complexityScore < 0.3) {
      return 'interactive';
    }
    return 'hybrid';
  }, []);

  const getRecommendedAgentMode = useCallback((intent: string, complexityScore: number): string => {
    if (intent === 'strategic' || intent === 'analytical' || complexityScore > 0.7) {
      return 'manual'; // Complex queries benefit from manual agent selection
    }
    return 'automatic'; // Simple queries can use automatic selection
  }, []);

  const analyzeQuery = useCallback((query: string): {
    intent: string;
    complexity: { level: string; score: number };
    recommendedMode: string;
    recommendedAgentMode: string;
  } => {
    const intent = getIntentFromQuery(query);
    const complexity = getComplexityFromQuery(query);
    const recommendedMode = getRecommendedMode(intent, complexity.score);
    const recommendedAgentMode = getRecommendedAgentMode(intent, complexity.score);
    
    return {
      intent,
      complexity,
      recommendedMode,
      recommendedAgentMode,
    };
  }, [getIntentFromQuery, getComplexityFromQuery, getRecommendedMode, getRecommendedAgentMode]);

  const getModeDescription = useCallback((mode: string): string => {
    const descriptions: Record<string, string> = {
      'auto_interactive': 'System automatically selects the best agent for real-time Q&A',
      'manual_interactive': 'You select a specific agent for real-time Q&A',
      'auto_autonomous': 'System automatically selects agent for autonomous analysis',
      'manual_autonomous': 'You select agent for autonomous analysis',
    };
    
    return descriptions[mode] || 'Unknown mode';
  }, []);

  const getModeFeatures = useCallback((mode: string): string[] => {
    const features: Record<string, string[]> = {
      'auto_interactive': ['Automatic agent selection', 'Real-time responses', 'Quick answers'],
      'manual_interactive': ['Manual agent selection', 'Expert-specific guidance', 'Real-time responses'],
      'auto_autonomous': ['Automatic agent selection', 'Multi-step reasoning', 'Comprehensive analysis'],
      'manual_autonomous': ['Manual agent selection', 'Expert-guided execution', 'Multi-step reasoning'],
    };
    
    return features[mode] || [];
  }, []);

  const getModeUseCases = useCallback((mode: string): string[] => {
    const useCases: Record<string, string[]> = {
      'auto_interactive': ['Quick questions', 'General inquiries', 'Clarifications'],
      'manual_interactive': ['Expert consultation', 'Domain-specific questions', 'Preferred agent'],
      'auto_autonomous': ['Complex analysis', 'Research tasks', 'Strategic planning'],
      'manual_autonomous': ['Expert-led analysis', 'Specialized research', 'Customized workflows'],
    };
    
    return useCases[mode] || [];
  }, []);

  return {
    recommendation,
    isLoading,
    error,
    getRecommendation,
    clearRecommendation,
    analyzeQuery,
    getModeDescription,
    getModeFeatures,
    getModeUseCases,
  };
}

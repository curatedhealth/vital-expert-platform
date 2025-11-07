'use client';

/**
 * @vital/ai-components/insights
 * 
 * TAG: KEY_INSIGHTS_SHARED_COMPONENT
 * 
 * Extracts and displays actionable insights from AI responses
 * 
 * Used by:
 * - Ask Expert (Mode 1, 2, 3, 4)
 * - Ask Panel
 * - Pharma Intelligence
 * - Any other VITAL service needing insights
 * 
 * Features:
 * - Extracts bullet points with bold headers
 * - Looks for actionable insight markers
 * - Uses Streamdown for proper markdown rendering
 * - Dark mode support
 * - Accessibility compliant
 * - Animated appearance
 */

import { useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import type { KeyInsightsProps } from '../types';

export function KeyInsights({ 
  content, 
  isStreaming = false,
  className = ''
}: KeyInsightsProps) {
  const prefersReducedMotion = useReducedMotion();
  
  // ✅ TAG: KEY_INSIGHTS_EXTRACTION - Extract actionable insights, not summaries
  const insights = useMemo(() => {
    if (!content || content.length < 50) {
      return [];
    }
    
    // Remove code blocks, diagrams, and citations for clean text analysis
    let textOnly = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const insights: string[] = [];
    
    // Look for bullet points with asterisks (insights are often in lists)
    const bulletMatches = textOnly.match(/\*\*[^*]+\*\*[^*.]+[.]/g);
    if (bulletMatches && bulletMatches.length > 0) {
      insights.push(...bulletMatches.slice(0, 3));
    }
    
    // If no bullet insights found, look for sentences with insight markers
    if (insights.length === 0) {
      const insightKeywords = [
        'importantly', 'significantly', 'notably', 'crucially',
        'key finding', 'essential to', 'critical that', 'must consider',
        'should note', 'worth noting', 'remember that', 'keep in mind'
      ];
      
      const sentences = textOnly.split(/(?<=[.!?])\s+/).filter(Boolean);
      const insightSentences = sentences.filter((sentence) => {
        const lower = sentence.toLowerCase();
        return insightKeywords.some((keyword) => lower.includes(keyword)) &&
               sentence.length > 40 && // Avoid too-short sentences
               sentence.length < 200;  // Avoid too-long summaries
      });
      
      insights.push(...insightSentences.slice(0, 3));
    }
    
    return insights;
  }, [content]);
  
  // Don't render if no insights or still streaming
  if (insights.length === 0 || isStreaming) {
    return null;
  }
  
  return (
    <motion.div
      initial={prefersReducedMotion ? { opacity: 0 } : { opacity: 0, y: 10 }}
      animate={prefersReducedMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
      transition={{ duration: prefersReducedMotion ? 0 : 0.2 }}
      className={`mt-4 rounded-xl border border-blue-100 bg-blue-50/60 p-3 dark:border-blue-900/40 dark:bg-blue-900/20 ${className}`}
    >
      <div className="flex items-start gap-2">
        <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
        <div className="flex-1 min-w-0">
          <h4 className="text-xs font-semibold text-blue-900 dark:text-blue-200 mb-2">
            Key Insights
          </h4>
          <div className="space-y-2">
            {insights.map((insight, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <span className="text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0">•</span>
                <div className="flex-1 text-xs text-blue-800 dark:text-blue-100 [&>p]:my-0 [&>p]:leading-relaxed prose-strong:text-blue-900 dark:prose-strong:text-blue-50">
                  <InsightContent content={insight} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * Renders insight content with proper markdown formatting
 */
function InsightContent({ content }: { content: string }) {
  // Simple markdown-like rendering for bold text
  const parts = content.split(/(\*\*[^*]+\*\*)/g);
  
  return (
    <p className="leading-relaxed">
      {parts.map((part, idx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          const text = part.slice(2, -2);
          return <strong key={idx}>{text}</strong>;
        }
        return <span key={idx}>{part}</span>;
      })}
    </p>
  );
}

/**
 * Hook to extract insights without rendering
 * Useful for custom implementations
 */
export function useKeyInsights(content: string): string[] {
  return useMemo(() => {
    if (!content || content.length < 50) {
      return [];
    }
    
    // Same extraction logic as component
    let textOnly = content
      .replace(/```[\s\S]*?```/g, '')
      .replace(/`[^`]+`/g, '')
      .replace(/\[\d+(?:,\s*\d+)*\]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    const insights: string[] = [];
    
    const bulletMatches = textOnly.match(/\*\*[^*]+\*\*[^*.]+[.]/g);
    if (bulletMatches && bulletMatches.length > 0) {
      insights.push(...bulletMatches.slice(0, 3));
    }
    
    if (insights.length === 0) {
      const insightKeywords = [
        'importantly', 'significantly', 'notably', 'crucially',
        'key finding', 'essential to', 'critical that', 'must consider',
        'should note', 'worth noting', 'remember that', 'keep in mind'
      ];
      
      const sentences = textOnly.split(/(?<=[.!?])\s+/).filter(Boolean);
      const insightSentences = sentences.filter((sentence) => {
        const lower = sentence.toLowerCase();
        return insightKeywords.some((keyword) => lower.includes(keyword)) &&
               sentence.length > 40 &&
               sentence.length < 200;
      });
      
      insights.push(...insightSentences.slice(0, 3));
    }
    
    return insights;
  }, [content]);
}


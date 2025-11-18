'use client';

import React, { useState, useRef } from 'react';

import { cn } from '@/shared/services/utils';

// 🎯 Progressive Complexity Types
interface IntentAnalysis {
  complexity: number;
  confidence: number;
  context: {
    domain: string;
    confidence: number;
  };
  agents: Array<{
    name: string;
    relevance: number;
  }>;
  suggestions: string[];
}

interface MinimalChatProps {
  onQuerySubmit?: (query: string) => void;
  className?: string;
}

// 🧠 Progressive Complexity Disclosure Component
export const MinimalChatInterface: React.FC<MinimalChatProps> = ({
  onQuerySubmit,
  className
}) => {
  // 🎯 Core State - Minimal by design
  const [message, setMessage] = useState('');
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysis | null>(null);
  const [showContextIndicator, setShowContextIndicator] = useState(false);
  const [showAgentIndicator, setShowAgentIndicator] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);

  // 📐 Auto-resize functionality

  const [detectionTimeout, setDetectionTimeout] = useState<NodeJS.Timeout | null>(null);

  // 🎨 Minimal styling constants

  // 🔧 Auto-expanding input handler

    setMessage(value);

    // Auto-resize textarea
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';

      if (scrollHeight > maxHeight) {
        textareaRef.current.style.height = `${maxHeight}px`;
        textareaRef.current.style.overflowY = 'auto';
      } else {
        textareaRef.current.style.height = `${Math.max(scrollHeight, minHeight)}px`;
        textareaRef.current.style.overflowY = 'hidden';
      }
    }

    // Progressive complexity detection
    detectIntent(value);
  };

  // 🧠 Intent Detection System

    // Reset indicators for short text
    if (text.length < 20) {
      hideAllEnhancements();
      return;
    }

    // Debounced analysis
    if (detectionTimeout) {
      clearTimeout(detectionTimeout);
    }

      updateInterface(analysis);
    }, 300);

    setDetectionTimeout(timeout);
  };

  // 🔍 Intent Analysis (Mock implementation - will connect to backend)

    // Simulate analysis with intelligent heuristics

    return {
      complexity,
      confidence: 0.85,
      context: {
        domain,
        confidence: 0.9
      },
      agents,
      suggestions: generateSuggestions(text, domain)
    };
  };

  // 📊 Complexity Calculation

    // Length factor
    complexity += Math.min(text.length / 200, 0.3);

    // Multiple questions

    complexity += Math.min(questionCount * 0.15, 0.3);

    // Technical terms

      'FDA', 'EMA', 'clinical trial', 'regulatory', 'NDA', 'BLA', 'IND',
      'Phase I', 'Phase II', 'Phase III', 'biomarker', 'endpoint',
      'reimbursement', 'formulary', 'market access', 'HEOR'
    ];

      text.toLowerCase().includes(term.toLowerCase())
    ).length;

    complexity += Math.min(techTermCount * 0.1, 0.4);

    return Math.min(complexity, 1.0);
  };

  // 🏷️ Domain Identification

      regulatory: ['FDA', 'EMA', 'regulatory', 'submission', 'approval', 'pathway'],
      clinical: ['clinical trial', 'Phase', 'endpoint', 'biomarker', 'protocol'],
      commercial: ['market access', 'pricing', 'reimbursement', 'formulary', 'payer'],
      digital: ['digital therapeutic', 'SaMD', 'app', 'software', 'AI/ML']
    };

    Object.entries(domains).forEach(([domain, keywords]) => {

        lowerText.includes(keyword.toLowerCase())
      ).length;

      if (matches > maxMatches) {
        maxMatches = matches;
        bestDomain = domain;
      }
    });

    return bestDomain;
  };

  // 🤖 Agent Suggestions

      regulatory: [
        { name: 'FDA Strategy Expert', relevance: 0.95 },
        { name: 'Global Regulatory Strategist', relevance: 0.85 }
      ],
      clinical: [
        { name: 'Clinical Trial Architect', relevance: 0.95 },
        { name: 'Biostatistics Expert', relevance: 0.80 }
      ],
      commercial: [
        { name: 'Market Access Strategist', relevance: 0.95 },
        { name: 'Launch Strategist', relevance: 0.85 }
      ],
      digital: [
        { name: 'Digital Therapeutics Architect', relevance: 0.95 },
        { name: 'SaMD Regulatory Expert', relevance: 0.90 }
      ]
    };

    return agentMap[domain as keyof typeof agentMap] || [
      { name: 'General Healthcare Expert', relevance: 0.75 }
    ];
  };

  // 💡 Suggestion Generation

      regulatory: [
        'What are the filing fees?',
        'Timeline to approval?',
        'Required studies?'
      ],
      clinical: [
        'Sample size calculation',
        'Primary endpoints',
        'Regulatory requirements'
      ],
      commercial: [
        'Pricing strategy options',
        'Payer coverage requirements',
        'Competitive landscape'
      ]
    };

    return suggestions[domain as keyof typeof suggestions] || [
      'Tell me more',
      'What are the options?',
      'How long does this take?'
    ];
  };

  // 🎛️ Progressive Interface Updates

    const { complexity, confidence } = analysis;

    // Show context indicator for medium complexity
    if (complexity > 0.3 && confidence > 0.7) {
      setShowContextIndicator(true);
      setIntentAnalysis(analysis);
    }

    // Show agent indicator for higher complexity
    if (complexity > 0.5 && confidence > 0.8) {
      setShowAgentIndicator(true);
    }

    // Show advanced controls for complex queries
    if (complexity > 0.7 && confidence > 0.85) {
      setShowAdvancedControls(true);
    }
  };

  // 🚫 Hide Enhancements

    setShowContextIndicator(false);
    setShowAgentIndicator(false);
    setShowAdvancedControls(false);
    setIntentAnalysis(null);
  };

  // ⌨️ Keyboard Handlers

    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // 📤 Submit Handler

    if (message.trim()) {
      onQuerySubmit?.(message.trim());
      setMessage('');
      hideAllEnhancements();

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = `${minHeight}px`;
      }
    }
  };

  // 🎨 Component Styling

    "w-full max-w-3xl mx-auto px-5 py-8",
    "transition-all duration-500 ease-out",
    className
  );

    "relative transition-all duration-300 ease-out",
    showContextIndicator && "mt-4"
  );

    "w-full px-6 py-4 text-base leading-relaxed",
    "border-2 border-transparent rounded-xl",
    "bg-white shadow-sm transition-all duration-200",
    "outline-none resize-none",
    "placeholder:text-gray-400",
    "focus:border-blue-500 focus:shadow-md focus:shadow-blue-500/10"
  );

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className={containerClasses}>
        {/* Context Indicator - Progressive Disclosure Level 1 */}
        {showContextIndicator && intentAnalysis && (
          <div className="mb-4 flex items-center gap-3 animate-fade-in">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700">
                {intentAnalysis.context.domain}
              </span>
              {intentAnalysis.context.confidence > 0.8 && (
                <span className="text-blue-600">•</span>
              )}
            </div>
          </div>
        )}

        <div className={inputWrapperClasses}>
          {/* Agent Indicator - Progressive Disclosure Level 2 */}
          {showAgentIndicator && intentAnalysis && (
            <div className="absolute -top-12 left-0 flex items-center gap-2 animate-slide-down">
              <span className="text-sm font-medium text-gray-700">
                {intentAnalysis.agents[0]?.name}
              </span>
              {intentAnalysis.agents.length > 1 && (
                <span className="text-xs text-gray-500">
                  +{intentAnalysis.agents.length - 1} experts
                </span>
              )}
            </div>
          )}

          {/* Main Input Field */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="What would you like to achieve?"
            className={textareaClasses}
            style={{ minHeight: `${minHeight}px` }}
            rows={1}
          />

          {/* Advanced Controls - Progressive Disclosure Level 3 */}
          {showAdvancedControls && (
            <div className="absolute -bottom-14 right-0 flex items-center gap-2 animate-scale-in">
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0" />
                </svg>
              </button>
              <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors">
                <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes slide-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes scale-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }

        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }

        .animate-slide-down {
          animation: slide-down 0.3s ease-out;
        }

        .animate-scale-in {
          animation: scale-in 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default MinimalChatInterface;
'use client';

import {
  Paperclip,
  Mic,
  MicOff,
  FileText,
  Image,
  Code,
  Brain,
  Users,
  Settings,
  Target,
  Zap
} from 'lucide-react';
import { useState } from 'react';

import { Agent } from '@/lib/stores/chat-store';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  PromptInput,
  PromptInputTextarea,
  PromptInputToolbar,
  PromptInputSubmit,
  PromptInputModelSelector,
  PromptInputCharCounter
} from '@/shared/components/ui/prompt-input';
import { cn } from '@/shared/services/utils';

// Types
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
  processingTime: number;
}

// User profile types for contextual adaptation
interface UserProfile {
  role: 'regulatory_affairs' | 'clinical_research' | 'medical_affairs' | 'commercial' | 'digital_health' | 'quality_assurance' | 'general';
  experience_level: 'junior' | 'mid' | 'senior' | 'expert';
  specialties?: string[];
  department?: string;
  focus_areas?: string[];
}

interface EnhancedChatInputProps {
  value?: string;
  onChange?: (value: string) => void;
  onSend?: () => void;
  onSendMessage?: (message: string) => void;
  isLoading?: boolean;
  selectedAgent?: Agent | null;
  userProfile?: UserProfile;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  showModelSelector?: boolean;
  models?: Array<{ id: string; name: string; description?: string }>;
  selectedModel?: string;
  onModelChange?: (model: string) => void;
  maxLength?: number;
  showContextualPrompts?: boolean;
  onQuickPromptSelect?: (prompt: string) => void;
}

export function EnhancedChatInput({
  value: externalValue,
  onChange,
  onSend,
  onSendMessage,
  isLoading = false,
  selectedAgent = null,
  userProfile,
  placeholder,
  disabled = false,
  className,
  showModelSelector = true,
  models = [
    { id: 'gpt-4o', name: 'GPT-4 Turbo', description: 'Most capable model for complex tasks' },
    { id: 'gpt-4', name: 'GPT-4', description: 'High-quality responses for most tasks' },
    { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and efficient for simple tasks' },
    { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Balanced performance and speed' },
    { id: 'claude-3-haiku', name: 'Claude 3 Haiku', description: 'Lightning fast responses' },
  ],
  selectedModel = 'gpt-4o',
  onModelChange,
  maxLength = 4000,
  showContextualPrompts = true,
  onQuickPromptSelect,
}: EnhancedChatInputProps) {
  const [internalValue, setInternalValue] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [showAttachments, setShowAttachments] = useState(false);

  // Progressive Complexity Disclosure State
  const [intentAnalysis, setIntentAnalysis] = useState<IntentAnalysis | null>(null);
  const [showContextIndicator, setShowContextIndicator] = useState(false);
  const [showAgentIndicator, setShowAgentIndicator] = useState(false);
  const [showAdvancedControls, setShowAdvancedControls] = useState(false);
  const [detectionTimeout, setDetectionTimeout] = useState<NodeJS.Timeout | null>(null);
  const [processingTime, setProcessingTime] = useState<number | null>(null);

  // Use external value if provided, otherwise use internal state

  // Generate contextual placeholder text

    if (placeholder) return placeholder;

    // Agent-specific placeholders
    if (selectedAgent) {
      const agentPlaceholders: Record<string, string> = {
        'FDA Regulatory Strategist': 'Ask about FDA pathways, submission strategies, or regulatory guidance...',
        'Clinical Trial Designer': 'Ask about study design, endpoints, or protocol optimization...',
        'Market Access Strategist': 'Ask about payer strategies, reimbursement, or health economics...',
        'Digital Health Strategist': 'Ask about SaMD classification, digital therapeutics, or validation...',
        'AI/ML Expert': 'Ask about algorithm validation, bias mitigation, or AI/ML frameworks...',
        'Biostatistician': 'Ask about statistical analysis, sample size, or study power...',
        'Health Economist': 'Ask about cost-effectiveness, budget impact, or economic modeling...',
        'Compliance Officer': 'Ask about GxP compliance, quality systems, or regulatory requirements...'
      };

      if (agentPlaceholder) return agentPlaceholder;

      return `Ask ${selectedAgent.name} about healthcare strategy and insights...`;
    }

    // User profile-specific placeholders
    if (userProfile) {
      const rolePlaceholders: Record<string, string> = {
        regulatory_affairs: 'Ask about regulatory strategy, compliance, or submission pathways...',
        clinical_research: 'Ask about study design, protocol development, or clinical operations...',
        medical_affairs: 'Ask about medical strategy, scientific evidence, or KOL engagement...',
        commercial: 'Ask about market access, launch strategy, or competitive positioning...',
        digital_health: 'Ask about digital therapeutics, health technology, or innovation...',
        quality_assurance: 'Ask about quality systems, validation, or risk management...',
        general: 'Ask anything about healthcare, life sciences, or medical devices...'
      };

      return rolePlaceholders[userProfile.role] || 'Ask anything about healthcare...';
    }

    return 'Ask anything about healthcare, regulatory affairs, clinical trials, or medical devices...';
  };

  // Get contextual quick prompts based on agent and user profile

    if (!showContextualPrompts) return [];

    // Combine and deduplicate

    return uniquePrompts.slice(0, 6);
  };

  // Agent-specific quick prompts

    const prompts: Record<string, string[]> = {
      'FDA Regulatory Strategist': [
        'What\'s the fastest FDA approval pathway for my device?',
        'Help me prepare for a pre-submission meeting',
        'Interpret recent FDA guidance for digital therapeutics'
      ],
      'Clinical Trial Designer': [
        'Design a Phase II oncology study protocol',
        'Optimize patient recruitment for rare disease trial',
        'Select appropriate primary endpoints for efficacy'
      ],
      'Market Access Strategist': [
        'Develop a payer value proposition for our therapy',
        'Create a health economics study design',
        'Analyze CMS coverage policy implications'
      ],
      'Digital Health Strategist': [
        'Classify our app under FDA SaMD framework',
        'Design clinical validation for digital therapeutic',
        'Navigate cybersecurity requirements for medical devices'
      ]
    };

    return prompts[agent.name] || [
      `What are ${agent.name}'s top recommendations for my situation?`,
      `How would ${agent.name} approach this challenge?`
    ];
  };

  // User profile-specific quick prompts

    const rolePrompts: Record<string, string[]> = {
      regulatory_affairs: [
        'What are the key regulatory risks I should assess?',
        'How do I build a comprehensive submission strategy?'
      ],
      clinical_research: [
        'What are best practices for protocol development?',
        'How do I optimize study operations and timelines?'
      ],
      medical_affairs: [
        'How do I develop medical strategy for launch?',
        'What scientific evidence gaps should I address?'
      ],
      commercial: [
        'What\'s the optimal go-to-market strategy?',
        'How do I position against key competitors?'
      ],
      digital_health: [
        'What are emerging trends in digital therapeutics?',
        'How do I integrate AI/ML into our platform?'
      ],
      quality_assurance: [
        'What quality systems should I implement?',
        'How do I design effective validation protocols?'
      ],
      general: [
        'What are the latest healthcare industry trends?',
        'How do I stay current with regulatory changes?'
      ]
    };

    const experiencePrompts: Record<string, string[]> = {
      junior: [
        'What foundational knowledge should I develop?',
        'What are the most common mistakes to avoid?'
      ],
      mid: [
        'How do I advance my strategic thinking?',
        'What skills should I develop for leadership?'
      ],
      senior: [
        'How do I influence cross-functional stakeholders?',
        'What are best practices for team development?'
      ],
      expert: [
        'What are cutting-edge innovations in my field?',
        'How do I stay ahead of industry evolution?'
      ]
    };

    return [
      ...(rolePrompts[profile.role] || []),
      ...(experiencePrompts[profile.experience_level] || [])
    ].slice(0, 3);
  };

    if (onChange) {
      onChange(newValue);
    } else {
      setInternalValue(newValue);
    }

    // Progressive Complexity Detection
    detectIntent(newValue);
  };

  // Intent Detection System

    // Reset indicators for short text
    if (text.length < 20) {
      hideAllEnhancements();
      return;
    }

    // Debounced analysis
    if (detectionTimeout) {
      clearTimeout(detectionTimeout);
    }

      setProcessingTime(endTime - startTime);
      updateInterface(analysis);
    }, 500);

    setDetectionTimeout(timeout);
  };

  // Intent Analysis with Healthcare Intelligence

    try {
      // Call the backend classification API

        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: text }),
      });

      if (!response.ok) {
        throw new Error('Classification API failed');
      }

      return {
        complexity: apiResult.complexity || 0.5,
        confidence: apiResult.confidence || 0.8,
        context: {
          domain: apiResult.category || 'general',
          confidence: apiResult.confidence || 0.8
        },
        agents: (apiResult.agents || []).map((agentId: string) => ({
          name: formatAgentName(agentId),
          relevance: 0.9
        })),
        suggestions: generateSuggestions(text, apiResult.category || 'general'),
        processingTime: processingTime || 0
      };
    } catch (error) {
      // console.error('Intent analysis failed, using fallback:', error);

      // Fallback to local analysis

      return {
        complexity,
        confidence: 0.85 + (complexity * 0.1),
        context: {
          domain,
          confidence: 0.9
        },
        agents,
        suggestions: generateSuggestions(text, domain),
        processingTime: processingTime || 0
      };
    }
  };

  // Agent Name Formatter

    const nameMap: Record<string, string> = {
      'fda-regulatory-strategist': 'FDA Regulatory Strategist',
      'regulatory-affairs-expert': 'Regulatory Affairs Expert',
      'compliance-officer': 'Compliance Officer',
      'clinical-trial-designer': 'Clinical Trial Designer',
      'biostatistician': 'Biostatistician',
      'clinical-operations': 'Clinical Operations Specialist',
      'market-access-strategist': 'Market Access Strategist',
      'health-economist': 'Health Economist',
      'payer-expert': 'Payer Expert',
      'digital-health-strategist': 'Digital Health Strategist',
      'software-architect': 'Software Architect',
      'ai-ml-expert': 'AI/ML Expert',
      'launch-strategist': 'Launch Strategist',
      'commercial-analyst': 'Commercial Analyst',
      'brand-manager': 'Brand Manager'
    };

    // eslint-disable-next-line security/detect-object-injection
    return nameMap[agentId] || agentId.split('-').map(word =>
      word.charAt(0).toUpperCase() + word.slice(1)
    ).join(' ');
  };

  // Complexity Calculation with Healthcare Context

    // Length factor
    complexity += Math.min(text.length / 300, 0.25);

    // Multiple questions indicator

    complexity += Math.min(questionCount * 0.15, 0.25);

    // Healthcare technical terms

      'FDA', 'EMA', 'PMDA', 'Health Canada', 'TGA',
      'clinical trial', 'Phase I', 'Phase II', 'Phase III', 'Phase IV',
      'IND', 'NDA', 'BLA', 'ANDA', '510(k)', 'PMA', 'De Novo',
      'regulatory pathway', 'submission', 'approval', 'clearance',
      'biomarker', 'endpoint', 'primary endpoint', 'secondary endpoint',
      'biostatistics', 'sample size', 'power analysis', 'interim analysis',
      'market access', 'reimbursement', 'formulary', 'health economics',
      'HEOR', 'real-world evidence', 'RWE', 'comparative effectiveness',
      'digital therapeutic', 'SaMD', 'medical device software',
      'artificial intelligence', 'machine learning', 'AI/ML',
      'GCP', 'GLP', 'GMP', 'Quality System', 'Risk Management'
    ];

      lowerText.includes(term.toLowerCase())
    ).length;

    complexity += Math.min(techTermCount * 0.08, 0.4);

    return Math.min(complexity, 1.0);
  };

  // Healthcare Domain Identification

      regulatory: [
        'FDA', 'EMA', 'regulatory', 'submission', 'approval', 'pathway',
        'IND', 'NDA', 'BLA', 'ANDA', '510(k)', 'PMA', 'De Novo',
        'guidance', 'guideline', 'regulation', 'compliance'
      ],
      clinical: [
        'clinical trial', 'Phase', 'endpoint', 'biomarker', 'protocol',
        'recruitment', 'enrollment', 'statistical', 'biostatistics',
        'sample size', 'power analysis', 'interim', 'efficacy', 'safety'
      ],
      commercial: [
        'market access', 'pricing', 'reimbursement', 'formulary', 'payer',
        'health economics', 'HEOR', 'budget impact', 'cost effectiveness',
        'launch', 'commercialization', 'competitive landscape'
      ],
      digital: [
        'digital therapeutic', 'SaMD', 'medical device software',
        'artificial intelligence', 'machine learning', 'AI/ML',
        'algorithm', 'data science', 'digital health', 'telemedicine'
      ]
    };

    Object.entries(domains).forEach(([domain, keywords]) => {

        return acc + (lowerText.includes(keyword.toLowerCase()) ? 1 : 0);
      }, 0);

      if (score > maxScore) {
        maxScore = score;
        bestDomain = domain;
      }
    });

    return bestDomain;
  };

  // Intelligent Agent Suggestions

      regulatory: [
        { name: 'FDA Strategy Expert', relevance: 0.95 },
        { name: 'Global Regulatory Strategist', relevance: 0.85 },
        { name: 'Submission Coordinator', relevance: 0.80 }
      ],
      clinical: [
        { name: 'Clinical Trial Architect', relevance: 0.95 },
        { name: 'Biostatistics Expert', relevance: 0.90 },
        { name: 'Clinical Operations Specialist', relevance: 0.85 }
      ],
      commercial: [
        { name: 'Market Access Strategist', relevance: 0.95 },
        { name: 'Launch Strategist', relevance: 0.90 },
        { name: 'Health Economics Expert', relevance: 0.85 }
      ],
      digital: [
        { name: 'Digital Therapeutics Architect', relevance: 0.95 },
        { name: 'SaMD Regulatory Expert', relevance: 0.90 },
        { name: 'AI/ML Strategist', relevance: 0.85 }
      ]
    };

    return agentMap[domain as keyof typeof agentMap] || [
      { name: 'Healthcare Intelligence Expert', relevance: 0.75 }
    ];
  };

  // Contextual Suggestions with Agent and User Profile Awareness

    // Base suggestions by domain

      regulatory: [
        'What are the filing requirements?',
        'Timeline and milestones?',
        'Regulatory risks to consider?'
      ],
      clinical: [
        'Study design recommendations?',
        'Primary endpoint selection?',
        'Sample size requirements?'
      ],
      commercial: [
        'Pricing strategy options?',
        'Payer coverage pathway?',
        'Competitive positioning?'
      ],
      digital: [
        'Regulatory classification?',
        'Clinical evidence requirements?',
        'Software validation approach?'
      ]
    };

    // Agent-specific suggestions

    // User profile-based suggestions

    // Combine and prioritize suggestions

      'Tell me more about this',
      'What are my options?',
      'How should I approach this?'
    ];

    return [
      ...agentSpecificSuggestions.slice(0, 2),
      ...profileSuggestions.slice(0, 1),
      ...baseSuggestions.slice(0, 2)
    ].filter(Boolean).slice(0, 4);
  };

  // Agent-Specific Contextual Suggestions

    if (!agent) return [];

    const agentSuggestions: Record<string, string[]> = {
      'FDA Regulatory Strategist': [
        'What\'s the optimal FDA pathway for this?',
        'Pre-submission meeting strategy?',
        'FDA guidance interpretation?'
      ],
      'Clinical Trial Designer': [
        'Optimal study design approach?',
        'Patient recruitment strategy?',
        'Regulatory endpoint alignment?'
      ],
      'Market Access Strategist': [
        'Payer value proposition development?',
        'Health economics study design?',
        'Coverage policy analysis?'
      ],
      'Digital Health Strategist': [
        'FDA SaMD classification pathway?',
        'Clinical validation requirements?',
        'Cybersecurity framework compliance?'
      ],
      'AI/ML Expert': [
        'Algorithm validation approach?',
        'Bias detection and mitigation?',
        'Regulatory AI/ML frameworks?'
      ]
    };

    return agentSuggestions[agent.name] || [
      `How would ${agent.name} approach this?`,
      `Best practices from ${agent.name}?`
    ];
  };

  // User Profile-Based Contextual Adaptations

    if (!profile) return [];

    const roleSuggestions: Record<string, string[]> = {
      regulatory_affairs: [
        'Compliance requirements?',
        'Submission strategy guidance?',
        'Risk mitigation approaches?'
      ],
      clinical_research: [
        'Protocol optimization?',
        'Statistical considerations?',
        'Operational feasibility?'
      ],
      medical_affairs: [
        'Medical strategy alignment?',
        'Scientific evidence requirements?',
        'KOL engagement approach?'
      ],
      commercial: [
        'Go-to-market strategy?',
        'Competitive differentiation?',
        'Launch readiness assessment?'
      ],
      digital_health: [
        'Technology integration?',
        'User experience optimization?',
        'Data strategy considerations?'
      ],
      quality_assurance: [
        'Quality system requirements?',
        'Risk management framework?',
        'Validation protocols?'
      ]
    };

    const experienceSuggestions: Record<string, string[]> = {
      junior: [
        'What should I know about this?',
        'Best practices overview?',
        'Learning resources available?'
      ],
      mid: [
        'Implementation considerations?',
        'Common pitfalls to avoid?',
        'Success metrics to track?'
      ],
      senior: [
        'Strategic implications?',
        'Cross-functional alignment?',
        'Leadership communication points?'
      ],
      expert: [
        'Industry trends and innovations?',
        'Regulatory evolution insights?',
        'Advanced methodologies?'
      ]
    };

    return [
      ...(roleSuggestions[profile.role] || []).slice(0, 1),
      ...(experienceSuggestions[profile.experience_level] || []).slice(0, 1)
    ];
  };

  // Progressive Interface Updates with User Profile Adaptation

    const { complexity, confidence } = analysis;
    setIntentAnalysis(analysis);

    // Adjust thresholds based on user experience level

      if (!userProfile) {
        return { context: 0.3, agent: 0.5, advanced: 0.7 };
      }

      switch (userProfile.experience_level) {
        case 'junior':
          return { context: 0.2, agent: 0.3, advanced: 0.8 }; // Show help earlier, advanced later
        case 'mid':
          return { context: 0.3, agent: 0.4, advanced: 0.7 }; // Balanced approach
        case 'senior':
          return { context: 0.4, agent: 0.5, advanced: 0.6 }; // Less hand-holding, advanced earlier
        case 'expert':
          return { context: 0.5, agent: 0.6, advanced: 0.5 }; // Minimal basic help, advanced quickly
        default:
          return { context: 0.3, agent: 0.5, advanced: 0.7 };
      }
    };

    // Progressive disclosure with adapted thresholds
    if (complexity > thresholds.context && confidence > 0.7) {
      setShowContextIndicator(true);
    }

    if (complexity > thresholds.agent && confidence > 0.8) {
      setShowAgentIndicator(true);
    }

    if (complexity > thresholds.advanced && confidence > 0.85) {
      setShowAdvancedControls(true);
    }
  };

  // Hide All Progressive Enhancements

    setShowContextIndicator(false);
    setShowAgentIndicator(false);
    setShowAdvancedControls(false);
    setIntentAnalysis(null);
    setProcessingTime(null);
  };

    if (onSend) {
      onSend();
    } else if (onSendMessage && inputValue.trim()) {
      onSendMessage(inputValue.trim());
      setInternalValue('');
    }
  };

    setIsRecording(!isRecording);
    // TODO: Implement voice recording functionality
  };

    // TODO: Implement file upload functionality
    // setShowAttachments(false);
  };

    {
      id: 'document',
      label: 'Document',
      icon: FileText,
      description: 'Upload PDF, DOCX, or TXT files',
      accept: '.pdf,.docx,.txt,.md',
    },
    {
      id: 'image',
      label: 'Image',
      icon: Image,
      description: 'Upload charts, diagrams, or screenshots',
      accept: '.png,.jpg,.jpeg,.gif,.webp',
    },
    {
      id: 'code',
      label: 'Code',
      icon: Code,
      description: 'Share code snippets or technical specs',
      accept: '.js,.ts,.py,.json,.xml,.html',
    },
  ];

  return (
    <div className={cn("relative space-y-3", className)}>
      {/* Context Indicator - Progressive Disclosure Level 1 */}
      {showContextIndicator && intentAnalysis && (
        <div className="flex items-center justify-between animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 border border-blue-200 rounded-full">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse" />
              <span className="text-sm font-medium text-blue-700 capitalize">
                {intentAnalysis.context.domain}
              </span>
              {intentAnalysis.context.confidence > 0.8 && (
                <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                  High Confidence
                </Badge>
              )}
            </div>
            <div className="text-xs text-gray-500">
              Complexity: {Math.round(intentAnalysis.complexity * 100)}%
            </div>
          </div>
          {processingTime && (
            <div className="text-xs text-gray-400">
              {processingTime}ms
            </div>
          )}
        </div>
      )}

      {/* Agent Indicator - Progressive Disclosure Level 2 */}
      {showAgentIndicator && intentAnalysis && (
        <div className="animate-slide-down">
          <div className="flex items-center gap-2 px-3 py-2 bg-purple-50 border border-purple-200 rounded-lg">
            <Users className="h-4 w-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">
              Recommended Expert: {intentAnalysis.agents[0]?.name}
            </span>
            {intentAnalysis.agents.length > 1 && (
              <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                +{intentAnalysis.agents.length - 1} more
              </Badge>
            )}
            <div className="ml-auto text-xs text-purple-600">
              {Math.round((intentAnalysis.agents[0]?.relevance || 0) * 100)}% match
            </div>
          </div>
        </div>
      )}

      {/* Integrated Prompt Starters - Only show when input is empty */}
      {showContextualPrompts && !value && (selectedAgent || userProfile) && (
        <div className="mb-2 animate-fade-in">
          <div className="flex flex-wrap gap-2">
            {selectedAgent && getAgentQuickPrompts(selectedAgent).slice(0, 2).map((prompt, index) => (
              <Button
                key={`agent-${index}`}
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-3 text-blue-600 hover:bg-blue-50 border border-blue-200"
                onClick={() => {
                  if (onQuickPromptSelect) {
                    onQuickPromptSelect(prompt);
                  } else {
                    handleChange(prompt);
                  }
                }}
              >
                {prompt}
              </Button>
            ))}
            {userProfile && getUserProfileQuickPrompts(userProfile).slice(0, 2).map((prompt, index) => (
              <Button
                key={`profile-${index}`}
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-3 text-gray-600 hover:bg-gray-50 border border-gray-200"
                onClick={() => {
                  if (onQuickPromptSelect) {
                    onQuickPromptSelect(prompt);
                  } else {
                    handleChange(prompt);
                  }
                }}
              >
                {prompt}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Attachment Options */}
      {showAttachments && (
        <div className="p-3 bg-white border border-gray-200 rounded-lg shadow-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-3">
            Attach files to enhance your query
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {attachmentOptions.map((option) => (
              <Button
                key={option.id}
                variant="outline"
                className="h-auto p-3 flex flex-col items-start gap-2 hover:bg-gray-50"
                onClick={() => handleFileUpload(option.id)}
              >
                <div className="flex items-center gap-2">
                  <option.icon className="h-4 w-4" />
                  <span className="font-medium text-sm">{option.label}</span>
                </div>
                <p className="text-xs text-gray-500 text-left">
                  {option.description}
                </p>
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Main AI Prompt Input */}
      <PromptInput
        onSubmit={handleSubmit}
        isSubmitting={isLoading}
        models={models}
        selectedModel={selectedModel}
        onModelChange={onModelChange}
        showModelSelector={showModelSelector}
        className="shadow-sm hover:shadow-md transition-shadow duration-200"
      >
        {/* Main Input Textarea */}
        <PromptInputTextarea
          value={value}
          onChange={(e) => handleChange(e.currentTarget.value)}
          placeholder={getContextualPlaceholder()}
          disabled={isLoading || disabled}
          className="min-h-[60px]"
        />

        {/* Toolbar */}
        <PromptInputToolbar>
          <div className="flex items-center gap-2">
            {/* Attachment Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAttachments(!showAttachments)}
              className="h-8 px-2"
            >
              <Paperclip className="h-4 w-4" />
            </Button>

            {/* Voice Input Button */}
            <Button
              variant="ghost"
              size="sm"
              className={cn(
                'h-8 px-2',
                isRecording && 'bg-red-100 text-red-600'
              )}
              onClick={handleVoiceToggle}
            >
              {isRecording ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>

            {/* Model Selector */}
            <PromptInputModelSelector />

            {/* Character Counter */}
            <PromptInputCharCounter
              value={value}
              maxLength={maxLength}
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Context Indicators */}
            {selectedAgent?.ragEnabled && (
              <Badge variant="outline" className="text-xs">
                Knowledge Base Active
              </Badge>
            )}
            {showContextIndicator && intentAnalysis && (
              <Badge variant="outline" className="text-xs text-blue-600 border-blue-300">
                AI Enhanced
              </Badge>
            )}

            {/* Submit Button */}
            <PromptInputSubmit
              disabled={!value?.trim() || isLoading}
            />
          </div>
        </PromptInputToolbar>
      </PromptInput>

      {/* Advanced Controls - Progressive Disclosure Level 3 */}
      {showAdvancedControls && intentAnalysis && (
        <div className="animate-scale-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-gray-700">Advanced Options</span>
            <Badge variant="outline" className="text-xs text-green-600 border-green-300">
              Expert Mode
            </Badge>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 hover:bg-orange-50 hover:border-orange-300"
            >
              <Target className="h-3 w-3" />
              Multi-Agent
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 hover:bg-green-50 hover:border-green-300"
            >
              <Brain className="h-3 w-3" />
              Deep Analysis
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 hover:bg-blue-50 hover:border-blue-300"
            >
              <Settings className="h-3 w-3" />
              Custom Prompt
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-xs gap-1 hover:bg-purple-50 hover:border-purple-300"
            >
              <Zap className="h-3 w-3" />
              Priority
            </Button>
          </div>
        </div>
      )}

      {/* Voice Recording Indicator */}
      {isRecording && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm text-red-600 font-medium">
              Recording... Tap to stop
            </span>
          </div>
        </div>
      )}

      {/* Animation Styles */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes slide-down {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scale-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
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
}
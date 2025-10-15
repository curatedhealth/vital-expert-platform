'use client';

import React from 'react';
import { PromptSuggestion } from '@/components/ui/prompt-suggestion';
import { Sparkles, MessageSquare, Brain, Target } from 'lucide-react';
import type { Agent } from '@/types/agent.types';

interface AgentPromptStartersProps {
  selectedAgent: Agent | null;
  onPromptSelect: (prompt: string) => void;
  className?: string;
}

export function AgentPromptStarters({ 
  selectedAgent, 
  onPromptSelect, 
  className 
}: AgentPromptStartersProps) {
  // Don't show if no agent is selected
  if (!selectedAgent) {
    return null;
  }

  // Generate contextual prompt starters based on the selected agent
  const getPromptStarters = (agent: Agent) => {
    const basePrompts = [
      {
        icon: <MessageSquare className="h-4 w-4" />,
        text: `What are the key considerations for ${agent.businessFunction?.toLowerCase() || 'this field'}?`,
        highlight: agent.businessFunction?.toLowerCase() || 'this field'
      },
      {
        icon: <Brain className="h-4 w-4" />,
        text: `How can I improve my approach to ${agent.knowledgeDomains?.[0] || 'this domain'}?`,
        highlight: agent.knowledgeDomains?.[0] || 'this domain'
      },
      {
        icon: <Target className="h-4 w-4" />,
        text: `What are the latest trends in ${agent.businessFunction?.toLowerCase() || 'this industry'}?`,
        highlight: agent.businessFunction?.toLowerCase() || 'this industry'
      },
      {
        icon: <Sparkles className="h-4 w-4" />,
        text: `Can you help me understand ${agent.capabilities?.[0] || 'this topic'} better?`,
        highlight: agent.capabilities?.[0] || 'this topic'
      }
    ];

    // Customize prompts based on agent type
    if (agent.businessFunction?.toLowerCase().includes('digital')) {
      return [
        {
          icon: <MessageSquare className="h-4 w-4" />,
          text: "What are the key considerations for digital health implementation?",
          highlight: "digital health"
        },
        {
          icon: <Brain className="h-4 w-4" />,
          text: "How can I improve my digital therapeutics strategy?",
          highlight: "digital therapeutics"
        },
        {
          icon: <Target className="h-4 w-4" />,
          text: "What are the latest trends in digital health regulation?",
          highlight: "digital health regulation"
        },
        {
          icon: <Sparkles className="h-4 w-4" />,
          text: "Can you help me understand market access for digital health?",
          highlight: "market access"
        }
      ];
    }

    if (agent.businessFunction?.toLowerCase().includes('clinical')) {
      return [
        {
          icon: <MessageSquare className="h-4 w-4" />,
          text: "What are the key considerations for clinical trial design?",
          highlight: "clinical trial design"
        },
        {
          icon: <Brain className="h-4 w-4" />,
          text: "How can I improve my protocol development process?",
          highlight: "protocol development"
        },
        {
          icon: <Target className="h-4 w-4" />,
          text: "What are the latest trends in clinical research?",
          highlight: "clinical research"
        },
        {
          icon: <Sparkles className="h-4 w-4" />,
          text: "Can you help me understand regulatory requirements?",
          highlight: "regulatory requirements"
        }
      ];
    }

    return basePrompts;
  };

  const promptStarters = getPromptStarters(selectedAgent);

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Get started with {selectedAgent.display_name || selectedAgent.name}
        </h3>
        <p className="text-sm text-gray-600">
          Choose a prompt to begin your conversation
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-2xl mx-auto">
        {promptStarters.map((starter, index) => (
          <PromptSuggestion
            key={index}
            variant="outline"
            size="lg"
            className="h-auto p-4 text-left justify-start gap-3 hover:bg-blue-50 hover:border-blue-200 transition-all duration-200"
            onClick={() => onPromptSelect(starter.text)}
            highlight={starter.highlight}
          >
            <div className="flex items-start gap-3 w-full">
              <div className="flex-shrink-0 mt-0.5 text-blue-600">
                {starter.icon}
              </div>
              <span className="text-sm leading-relaxed">
                {starter.text}
              </span>
            </div>
          </PromptSuggestion>
        ))}
      </div>
    </div>
  );
}

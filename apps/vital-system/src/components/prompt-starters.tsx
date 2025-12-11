/**
 * Prompt Starters Component
 * Displays agent-specific prompt suggestions from the prompts table
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Zap, Brain, FileText } from 'lucide-react';

export interface PromptStarter {
  id: string;
  prompt_starter: string;
  name: string;
  display_name: string;
  description: string;
  full_prompt?: string;
  domain: string;
  complexity_level: string;
}

interface PromptStartersProps {
  prompts: PromptStarter[];
  onSelectPrompt: (promptText: string) => void;
  isLoading?: boolean;
}

export function PromptStarters({
  prompts,
  onSelectPrompt,
  isLoading = false,
}: PromptStartersProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading prompt starters...</p>
        </div>
      </div>
    );
  }

  if (prompts.length === 0) {
    return null;
  }

  // Group by complexity level
  const groupedPrompts = prompts.reduce((acc, prompt) => {
    const level = prompt.complexity_level || 'medium';
    if (!acc[level]) acc[level] = [];
    acc[level].push(prompt);
    return acc;
  }, {} as Record<string, PromptStarter[]>);

  const getComplexityIcon = (level: string) => {
    switch (level.toLowerCase()) {
      case 'basic':
        return <Sparkles className="w-4 h-4" />;
      case 'intermediate':
        return <Zap className="w-4 h-4" />;
      case 'advanced':
        return <Brain className="w-4 h-4" />;
      case 'expert':
        return <FileText className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  const getComplexityColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'basic':
        return 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border-green-200 dark:border-green-800 hover:bg-green-100 dark:hover:bg-green-900/30';
      case 'intermediate':
        return 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/30';
      case 'advanced':
        return 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800 hover:bg-purple-100 dark:hover:bg-purple-900/30';
      case 'expert':
        return 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-800 hover:bg-orange-100 dark:hover:bg-orange-900/30';
      default:
        return 'bg-neutral-50 dark:bg-neutral-900/20 text-neutral-600 dark:text-neutral-400 border-neutral-200 dark:border-neutral-800 hover:bg-neutral-100 dark:hover:bg-neutral-900/30';
    }
  };

  // Show exactly 4 prompts in a grid layout
  const allPrompts = Object.values(groupedPrompts).flat().slice(0, 4);

  return (
    <div className="w-full max-w-4xl mx-auto py-6">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-blue-500" />
        <h3 className="text-sm font-semibold text-neutral-900 dark:text-white">
          Suggested Prompts
        </h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {allPrompts.map((prompt, index) => (
          <motion.button
            key={prompt.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onSelectPrompt(prompt.full_prompt || prompt.prompt_starter)}
            className={`group relative text-left p-4 rounded-xl border-2 transition-all duration-200 ${getComplexityColor(
              prompt.complexity_level
            )}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {/* Complexity Icon */}
            <div className="absolute top-3 right-3 opacity-60 group-hover:opacity-100 transition-opacity">
              {getComplexityIcon(prompt.complexity_level)}
            </div>

            {/* Prompt Starter Text */}
            <div className="pr-8">
              <div className="font-medium text-sm mb-1 line-clamp-2">
                {prompt.prompt_starter}
              </div>

              {/* Domain Badge */}
              {prompt.domain && (
                <div className="inline-flex items-center gap-1 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full bg-white/50 dark:bg-black/20 border border-current/20">
                    {prompt.domain}
                  </span>
                </div>
              )}
            </div>

            {/* Hover Effect */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
          </motion.button>
        ))}
      </div>

      {/* Complexity Legend */}
      <div className="flex items-center gap-4 mt-4 text-xs text-neutral-500 dark:text-neutral-400">
        <div className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-green-500" />
          <span>Basic</span>
        </div>
        <div className="flex items-center gap-1">
          <Zap className="w-3 h-3 text-blue-500" />
          <span>Intermediate</span>
        </div>
        <div className="flex items-center gap-1">
          <Brain className="w-3 h-3 text-purple-500" />
          <span>Advanced</span>
        </div>
        <div className="flex items-center gap-1">
          <FileText className="w-3 h-3 text-orange-500" />
          <span>Expert</span>
        </div>
      </div>
    </div>
  );
}

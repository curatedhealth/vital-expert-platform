/**
 * Agent Card Component
 * 
 * Displays agent information in various formats (default, compact, detailed)
 * Aligned with Ask Expert design patterns
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  Bot,
  Brain,
  CheckCircle2,
  Star,
  TrendingUp,
  Sparkles,
  Badge as BadgeIcon,
  ExternalLink,
} from 'lucide-react';
import { AgentAvatar } from '@vital/ui';
import type { Agent, AgentCardData } from '../types/agent';

interface AgentCardProps {
  agent: Agent | AgentCardData;
  variant?: 'default' | 'compact' | 'detailed';
  isSelected?: boolean;
  onSelect?: () => void;
  onViewDetails?: () => void;
  showStats?: boolean;
  className?: string;
}

export function AgentCard({
  agent,
  variant = 'default',
  isSelected = false,
  onSelect,
  onViewDetails,
  showStats = true,
  className = '',
}: AgentCardProps) {
  const rating = typeof agent.rating === 'string' ? parseFloat(agent.rating) : agent.rating || 0;
  
  // Compact variant - minimal for selection
  if (variant === 'compact') {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onSelect}
        className={`
          w-full p-3 rounded-lg border-2 transition-all text-left
          ${isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600'
          }
          ${className}
        `}
      >
        <div className="flex items-center gap-3">
          <AgentAvatar
            avatar={agent.avatar_url}
            name={agent.title}
            size="list"
            className="rounded-full flex-shrink-0"
          />
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {agent.title}
              </h3>
              {isSelected && (
                <CheckCircle2 className="w-4 h-4 text-blue-500 flex-shrink-0" />
              )}
            </div>
            
            {agent.category && (
              <span className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {agent.category}
              </span>
            )}
          </div>
          
          {showStats && rating > 0 && (
            <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 flex-shrink-0">
              <Star className="w-3 h-3 fill-current" />
              <span className="font-medium">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
      </motion.button>
    );
  }

  // Default variant - full card with all info
  if (variant === 'default') {
    return (
      <motion.div
        whileHover={{ scale: 1.02, y: -4 }}
        className={`
          relative rounded-xl border-2 transition-all overflow-hidden
          ${isSelected
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 shadow-lg'
            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'
          }
          ${className}
        `}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute top-3 right-3 z-10">
            <div className="p-1 bg-blue-500 rounded-full shadow-lg">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
        )}

        <div className="p-5">
          {/* Header */}
          <div className="flex items-start gap-4 mb-4">
            <AgentAvatar
              avatar={agent.avatar_url}
              name={agent.title}
              size="detail"
              className="rounded-full flex-shrink-0"
            />
            
            <div className="flex-1 min-w-0">
              <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {agent.title}
              </h3>
              
              {agent.category && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 capitalize">
                  <Bot className="w-3 h-3" />
                  {agent.category}
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
            {agent.description}
          </p>

          {/* Expertise tags */}
          {agent.expertise && agent.expertise.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {agent.expertise.slice(0, 3).map((exp, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                >
                  <Sparkles className="w-3 h-3" />
                  {exp}
                </span>
              ))}
              {agent.expertise.length > 3 && (
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs text-gray-500 dark:text-gray-400">
                  +{agent.expertise.length - 3} more
                </span>
              )}
            </div>
          )}

          {/* Stats */}
          {showStats && (
            <div className="flex items-center gap-4 mb-4 text-xs text-gray-600 dark:text-gray-400">
              {rating > 0 && (
                <div className="flex items-center gap-1">
                  <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                  <span className="font-medium">{rating.toFixed(1)}</span>
                </div>
              )}
              
              {agent.total_consultations > 0 && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{agent.total_consultations} consultations</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2">
            {onSelect && (
              <button
                onClick={onSelect}
                className={`
                  flex-1 py-2 px-4 rounded-lg font-medium text-sm transition-colors
                  ${isSelected
                    ? 'bg-blue-500 text-white hover:bg-blue-600'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }
                `}
              >
                {isSelected ? 'Selected' : 'Select Agent'}
              </button>
            )}
            
            {onViewDetails && (
              <button
                onClick={onViewDetails}
                className="p-2 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                title="View details"
              >
                <ExternalLink className="w-4 h-4 text-gray-600 dark:text-gray-400" />
              </button>
            )}
          </div>
        </div>
      </motion.div>
    );
  }

  // Detailed variant - expanded with full background
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 overflow-hidden
        ${className}
      `}
    >
      {/* Header section with gradient */}
      <div className="relative h-24 bg-gradient-to-r from-blue-500 to-purple-500">
        <div className="absolute inset-0 bg-black/10" />
        
        {isSelected && (
          <div className="absolute top-3 right-3">
            <div className="p-1.5 bg-white rounded-full shadow-lg">
              <CheckCircle2 className="w-5 h-5 text-blue-500" />
            </div>
          </div>
        )}
      </div>

      <div className="px-6 pb-6">
        {/* Avatar */}
        <div className="-mt-12 mb-4">
          <AgentAvatar
            avatar={agent.avatar_url}
            name={agent.title}
            size="large"
            className="rounded-full border-4 border-white dark:border-gray-800"
          />
        </div>

        {/* Title and category */}
        <div className="mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {agent.title}
          </h2>
          
          <div className="flex items-center gap-2">
            {agent.category && (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 capitalize">
                <BadgeIcon className="w-4 h-4" />
                {agent.category}
              </span>
            )}
            
            {showStats && rating > 0 && (
              <div className="flex items-center gap-1 text-sm">
                <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                <span className="font-semibold">{rating.toFixed(1)}</span>
                <span className="text-gray-500 dark:text-gray-400">
                  ({agent.total_consultations} consultations)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mb-6">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
            About
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {agent.description}
          </p>
        </div>

        {/* Expertise */}
        {agent.expertise && agent.expertise.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Brain className="w-4 h-4 text-blue-500" />
              Expertise
            </h3>
            <div className="flex flex-wrap gap-2">
              {agent.expertise.map((exp, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800"
                >
                  {exp}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Specialties */}
        {agent.specialties && agent.specialties.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-500" />
              Specialties
            </h3>
            <ul className="space-y-2">
              {agent.specialties.map((specialty, idx) => (
                <li
                  key={idx}
                  className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-purple-500 mt-1.5 flex-shrink-0" />
                  <span>{specialty}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Background - only for full Agent type */}
        {'background' in agent && agent.background && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">
              Background
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              {agent.background}
            </p>
          </div>
        )}

        {/* Actions */}
        {onSelect && (
          <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onSelect}
              className={`
                w-full py-3 px-4 rounded-lg font-semibold text-sm transition-all
                ${isSelected
                  ? 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg'
                  : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-md hover:shadow-lg'
                }
              `}
            >
              {isSelected ? (
                <span className="flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" />
                  Selected
                </span>
              ) : (
                'Select This Agent'
              )}
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Agent Card Skeleton for loading states
 */
export function AgentCardSkeleton({ variant = 'default' }: { variant?: 'default' | 'compact' }) {
  if (variant === 'compact') {
    return (
      <div className="w-full p-3 rounded-lg border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
            <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-5">
      <div className="flex items-start gap-4 mb-4">
        <div className="w-16 h-16 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-3/4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-1/2" />
        </div>
      </div>
      
      <div className="space-y-2 mb-4">
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-5/6" />
      </div>
      
      <div className="flex gap-2 mb-4">
        <div className="h-6 w-20 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
        <div className="h-6 w-16 bg-gray-200 dark:bg-gray-700 rounded animate-pulse" />
      </div>
      
      <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg animate-pulse" />
    </div>
  );
}


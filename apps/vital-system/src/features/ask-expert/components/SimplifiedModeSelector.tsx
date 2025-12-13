'use client';

/**
 * Simplified Mode Selector - 2 Toggle System
 *
 * Toggle 1: Interactive ↔ Autonomous
 * Toggle 2: Manual ↔ Automatic
 *
 * Result: 4 intuitive modes (2×2 matrix)
 */

import { useState } from 'react';
import { Card } from '@vital/ui';
import { Label } from '@vital/ui';
import { Switch } from '@vital/ui';
import { Badge } from '@vital/ui';
import { MessageSquare, Zap, User, Sparkles, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// ============================================================================
// TYPES
// ============================================================================

export interface SimplifiedModeSelectorProps {
  isAutonomous: boolean;
  isAutomatic: boolean;
  onAutonomousChange: (value: boolean) => void;
  onAutomaticChange: (value: boolean) => void;
  disabled?: boolean;
  className?: string;
}

interface ModeInfo {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  features: string[];
  responseTime: string;
  bestFor: string[];
}

// ============================================================================
// MODE DESCRIPTIONS
// ============================================================================

const MODE_MATRIX: Record<string, ModeInfo> = {
  'false-false': {
    // Interactive + Manual
    title: 'Focused Expert Conversation',
    description: 'Have an in-depth conversation with your chosen expert',
    icon: <MessageSquare className="h-6 w-6" />,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-violet-500',
    features: [
      'Pick your expert',
      'Multi-turn conversation',
      'Deep contextual understanding',
      'Consistent expertise'
    ],
    responseTime: '30-45 sec per turn',
    bestFor: [
      'Strategic planning',
      'Regulatory guidance',
      'When you know the right expert'
    ]
  },
  'false-true': {
    // Interactive + Automatic
    title: 'Smart Expert Discussion',
    description: 'AI selects the best expert(s) for dynamic, intelligent conversation',
    icon: <Sparkles className="h-6 w-6" />,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'AI picks best experts',
      'Multi-turn conversation',
      'Dynamic expert switching',
      'Multiple perspectives'
    ],
    responseTime: '45-60 sec per turn',
    bestFor: [
      'Exploratory research',
      'Complex multi-domain questions',
      'When unsure which expert to ask'
    ]
  },
  'true-false': {
    // Autonomous + Manual
    title: 'Expert-Driven Workflow',
    description: 'Your chosen expert autonomously executes a multi-step task',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'Pick your expert',
      'Multi-step execution',
      'Tool usage & research',
      'Human approval checkpoints'
    ],
    responseTime: '3-5 min total',
    bestFor: [
      'Document generation',
      'Complex analysis with specific expert',
      'Strategic planning documents'
    ]
  },
  'true-true': {
    // Autonomous + Automatic
    title: 'AI Collaborative Workflow',
    description: 'Multiple AI experts collaborate autonomously to complete your goal',
    icon: <Zap className="h-6 w-6 animate-pulse" />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    features: [
      'AI picks best expert team',
      'Collaborative execution',
      'Advanced tool usage',
      'Comprehensive deliverables'
    ],
    responseTime: '5-10 min total',
    bestFor: [
      'Complex multi-domain tasks',
      'Comprehensive strategy development',
      'Full submission packages'
    ]
  }
};

// ============================================================================
// COMPONENT
// ============================================================================

export function SimplifiedModeSelector({
  isAutonomous,
  isAutomatic,
  onAutonomousChange,
  onAutomaticChange,
  disabled = false,
  className = ''
}: SimplifiedModeSelectorProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Get current mode info
  const modeKey = `${isAutonomous}-${isAutomatic}`;
  const currentMode = MODE_MATRIX[modeKey];

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-neutral-900 mb-2">
          Choose Your Consultation Style
        </h2>
        <p className="text-neutral-600">
          Two simple choices determine how you'll work with our AI experts
        </p>
      </div>

      {/* Toggle Controls */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* Toggle 1: Interactive vs Autonomous */}
        <Card className={`p-6 border-2 transition-all ${
          isAutonomous
            ? 'border-amber-400 bg-amber-50'
            : 'border-purple-400 bg-purple-50'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isAutonomous ? (
                <Zap className="h-8 w-8 text-amber-600" />
              ) : (
                <MessageSquare className="h-8 w-8 text-purple-600" />
              )}
              <div>
                <Label className="text-lg font-semibold">
                  Conversation Type
                </Label>
              </div>
            </div>
            <Switch
              checked={isAutonomous}
              onCheckedChange={onAutonomousChange}
              disabled={disabled}
              className="data-[state=checked]:bg-amber-600"
            />
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-lg transition-all ${
              !isAutonomous
                ? 'bg-purple-100 border-2 border-purple-400'
                : 'bg-canvas-surface border border-neutral-200'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <MessageSquare className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-neutral-900">
                  Interactive
                </span>
                {!isAutonomous && (
                  <Badge variant="default" className="ml-auto bg-purple-600">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-600">
                Back-and-forth conversation. Ask questions, get answers, explore ideas.
              </p>
            </div>

            <div className={`p-3 rounded-lg transition-all ${
              isAutonomous
                ? 'bg-amber-100 border-2 border-amber-400'
                : 'bg-canvas-surface border border-neutral-200'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Zap className="h-4 w-4 text-amber-600" />
                <span className="font-medium text-sm text-neutral-900">
                  Autonomous
                </span>
                {isAutonomous && (
                  <Badge variant="default" className="ml-auto bg-amber-600">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-600">
                Goal-driven execution. Set a goal, experts work autonomously with checkpoints.
              </p>
            </div>
          </div>
        </Card>

        {/* Toggle 2: Manual vs Automatic */}
        <Card className={`p-6 border-2 transition-all ${
          isAutomatic
            ? 'border-purple-400 bg-purple-50'
            : 'border-green-400 bg-green-50'
        }`}>
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center space-x-3">
              {isAutomatic ? (
                <Sparkles className="h-8 w-8 text-purple-600" />
              ) : (
                <User className="h-8 w-8 text-green-600" />
              )}
              <div>
                <Label className="text-lg font-semibold">
                  Expert Selection
                </Label>
              </div>
            </div>
            <Switch
              checked={isAutomatic}
              onCheckedChange={onAutomaticChange}
              disabled={disabled}
              className="data-[state=checked]:bg-purple-600"
            />
          </div>

          <div className="space-y-3">
            <div className={`p-3 rounded-lg transition-all ${
              !isAutomatic
                ? 'bg-green-100 border-2 border-green-400'
                : 'bg-canvas-surface border border-neutral-200'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <User className="h-4 w-4 text-green-600" />
                <span className="font-medium text-sm text-neutral-900">
                  Manual
                </span>
                {!isAutomatic && (
                  <Badge variant="default" className="ml-auto bg-green-600">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-600">
                You choose the expert. Best when you know who to ask.
              </p>
            </div>

            <div className={`p-3 rounded-lg transition-all ${
              isAutomatic
                ? 'bg-purple-100 border-2 border-purple-400'
                : 'bg-canvas-surface border border-neutral-200'
            }`}>
              <div className="flex items-center space-x-2 mb-1">
                <Sparkles className="h-4 w-4 text-purple-600" />
                <span className="font-medium text-sm text-neutral-900">
                  Automatic
                </span>
                {isAutomatic && (
                  <Badge variant="default" className="ml-auto bg-purple-600">
                    Selected
                  </Badge>
                )}
              </div>
              <p className="text-xs text-neutral-600">
                AI picks the best expert(s). Best for complex or unknown problems.
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Current Mode Display */}
      <AnimatePresence mode="wait">
        <motion.div
          key={modeKey}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className={`p-6 bg-gradient-to-br ${currentMode.gradient} text-white`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-white/20 rounded-lg">
                  {currentMode.icon}
                </div>
                <div>
                  <h3 className="text-xl font-bold">
                    {currentMode.title}
                  </h3>
                  <p className="text-white/90 text-sm mt-1">
                    {currentMode.description}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="p-2 hover:bg-white/20 rounded-lg transition-colors"
              >
                <Info className="h-5 w-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mt-4">
              <div>
                <h4 className="font-semibold text-sm mb-2 text-white/90">
                  Features:
                </h4>
                <ul className="space-y-1">
                  {currentMode.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h4 className="font-semibold text-sm mb-2 text-white/90">
                  Best For:
                </h4>
                <ul className="space-y-1">
                  {currentMode.bestFor.map((use, idx) => (
                    <li key={idx} className="flex items-center space-x-2 text-sm">
                      <span className="w-1.5 h-1.5 bg-white rounded-full" />
                      <span>{use}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <AnimatePresence>
              {showDetails && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="mt-4 pt-4 border-t border-white/20"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-white/90">Average Response Time:</span>
                    <Badge variant="secondary" className="bg-white/20 text-white">
                      {currentMode.responseTime}
                    </Badge>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Visual Mode Matrix (Optional Reference) */}
      <Card className="p-4 bg-neutral-50">
        <details>
          <summary className="cursor-pointer font-medium text-sm text-neutral-700 flex items-center space-x-2">
            <Info className="h-4 w-4" />
            <span>View All 4 Modes (Matrix View)</span>
          </summary>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {Object.entries(MODE_MATRIX).map(([key, mode]) => {
              const [autonomous, automatic] = key.split('-').map(v => v === 'true');
              const isSelected = autonomous === isAutonomous && automatic === isAutomatic;

              return (
                <button
                  key={key}
                  onClick={() => {
                    onAutonomousChange(autonomous);
                    onAutomaticChange(automatic);
                  }}
                  disabled={disabled}
                  className={`p-3 rounded-lg text-left transition-all ${
                    isSelected
                      ? `bg-gradient-to-br ${mode.gradient} text-white shadow-lg scale-105`
                      : 'bg-canvas-surface border-2 border-neutral-200 hover:border-neutral-300'
                  }`}
                >
                  <div className="flex items-center space-x-2 mb-1">
                    <div className={`p-1 rounded ${isSelected ? 'bg-white/20' : 'bg-neutral-100'}`}>
                      {mode.icon}
                    </div>
                    <span className={`font-semibold text-xs ${isSelected ? 'text-white' : 'text-neutral-900'}`}>
                      {mode.title}
                    </span>
                  </div>
                  <p className={`text-xs ${isSelected ? 'text-white/90' : 'text-neutral-600'}`}>
                    {mode.description.substring(0, 60)}...
                  </p>
                </button>
              );
            })}
          </div>
        </details>
      </Card>
    </div>
  );
}

// ============================================================================
// HELPER FUNCTION: Get Mode Name
// ============================================================================

export function getModeName(isAutonomous: boolean, isAutomatic: boolean): string {
  const key = `${isAutonomous}-${isAutomatic}`;
  return MODE_MATRIX[key]?.title || 'Unknown Mode';
}

export function getModeDescription(isAutonomous: boolean, isAutomatic: boolean): string {
  const key = `${isAutonomous}-${isAutomatic}`;
  return MODE_MATRIX[key]?.description || '';
}

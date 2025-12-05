/**
 * Mode Selection Modal
 *
 * 2x2 matrix for selecting the conversation mode:
 * - Rows: Selection Method (Manual / Automatic)
 * - Columns: Execution Style (Interactive / Autonomous)
 *
 * Mode 1: Manual-Interactive (user selects agent, multi-turn chat)
 * Mode 2: Automatic-Interactive (AI routes to best agent, chat)
 * Mode 3: Manual-Autonomous (user selects agent, goal-driven with HITL)
 * Mode 4: Automatic-Autonomous (AI routes, goal-driven with HITL)
 */

'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  MessageSquare,
  Zap,
  User,
  Bot,
  CheckCircle2,
  ArrowRight,
  Shield,
  Target,
} from 'lucide-react';

interface ModeConfig {
  id: '1' | '2' | '3' | '4';
  name: string;
  shortName: string;
  description: string;
  selectionMethod: 'manual' | 'automatic';
  executionStyle: 'interactive' | 'autonomous';
  icon: React.ReactNode;
  features: string[];
  recommended?: boolean;
}

const MODES: ModeConfig[] = [
  {
    id: '1',
    name: 'Manual Interactive',
    shortName: 'Ask Expert',
    description: 'You select the expert. Multi-turn conversation for exploration and clarification.',
    selectionMethod: 'manual',
    executionStyle: 'interactive',
    icon: <MessageSquare className="w-6 h-6" />,
    features: [
      'Choose your expert',
      'Back-and-forth dialogue',
      'Ask follow-up questions',
    ],
  },
  {
    id: '2',
    name: 'Automatic Interactive',
    shortName: 'Smart Routing',
    description: 'AI routes to the best expert. Seamless conversation with optimal matching.',
    selectionMethod: 'automatic',
    executionStyle: 'interactive',
    icon: <Bot className="w-6 h-6" />,
    features: [
      'AI selects best expert',
      'Smart context routing',
      'Automatic handoffs',
    ],
    recommended: true,
  },
  {
    id: '3',
    name: 'Manual Autonomous',
    shortName: 'Expert Mission',
    description: 'You select the expert. Goal-driven execution with checkpoint approvals.',
    selectionMethod: 'manual',
    executionStyle: 'autonomous',
    icon: <Target className="w-6 h-6" />,
    features: [
      'Choose your expert',
      'Define your goal',
      'Approve key decisions',
    ],
  },
  {
    id: '4',
    name: 'Automatic Autonomous',
    shortName: 'Full Auto',
    description: 'AI orchestrates everything. Goal-driven with multi-agent coordination.',
    selectionMethod: 'automatic',
    executionStyle: 'autonomous',
    icon: <Zap className="w-6 h-6" />,
    features: [
      'AI orchestrates agents',
      'Spawns sub-agents as needed',
      'HITL safety checkpoints',
    ],
  },
];

interface ModeSelectionModalProps {
  isOpen: boolean;
  currentMode: '1' | '2' | '3' | '4';
  onSelectMode: (mode: '1' | '2' | '3' | '4') => void;
  onClose: () => void;
}

export function ModeSelectionModal({
  isOpen,
  currentMode,
  onSelectMode,
  onClose,
}: ModeSelectionModalProps) {
  if (!isOpen) return null;

  const getModeByPosition = (selection: 'manual' | 'automatic', execution: 'interactive' | 'autonomous') => {
    return MODES.find(m => m.selectionMethod === selection && m.executionStyle === execution);
  };

  const handleSelectMode = (mode: ModeConfig) => {
    onSelectMode(mode.id);
    onClose();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div
          initial={{ scale: 0.95, y: 20 }}
          animate={{ scale: 1, y: 0 }}
          exit={{ scale: 0.95, y: 20 }}
          className="w-full max-w-3xl bg-gradient-to-b from-zinc-900 to-zinc-950 rounded-2xl shadow-2xl border border-zinc-700/50 overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-700/50">
            <div>
              <h2 className="text-lg font-semibold text-white">Select Mode</h2>
              <p className="text-sm text-zinc-400">Choose how you want to interact with experts</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors"
            >
              <X className="w-5 h-5 text-zinc-400" />
            </button>
          </div>

          {/* 2x2 Grid */}
          <div className="p-6">
            {/* Axis Labels */}
            <div className="flex mb-4">
              <div className="w-24" /> {/* Spacer for row labels */}
              <div className="flex-1 grid grid-cols-2 gap-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-400">
                  <MessageSquare className="w-4 h-4" />
                  Interactive
                </div>
                <div className="flex items-center justify-center gap-2 text-sm font-medium text-zinc-400">
                  <Zap className="w-4 h-4" />
                  Autonomous
                </div>
              </div>
            </div>

            {/* Grid Rows */}
            <div className="space-y-4">
              {/* Manual Row */}
              <div className="flex gap-4">
                <div className="w-24 flex items-center justify-end pr-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <User className="w-4 h-4" />
                    Manual
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* Mode 1: Manual Interactive */}
                  <ModeCard
                    mode={getModeByPosition('manual', 'interactive')!}
                    isSelected={currentMode === '1'}
                    onSelect={handleSelectMode}
                  />
                  {/* Mode 3: Manual Autonomous */}
                  <ModeCard
                    mode={getModeByPosition('manual', 'autonomous')!}
                    isSelected={currentMode === '3'}
                    onSelect={handleSelectMode}
                  />
                </div>
              </div>

              {/* Automatic Row */}
              <div className="flex gap-4">
                <div className="w-24 flex items-center justify-end pr-4">
                  <div className="flex items-center gap-2 text-sm font-medium text-zinc-400">
                    <Bot className="w-4 h-4" />
                    Auto
                  </div>
                </div>
                <div className="flex-1 grid grid-cols-2 gap-4">
                  {/* Mode 2: Automatic Interactive */}
                  <ModeCard
                    mode={getModeByPosition('automatic', 'interactive')!}
                    isSelected={currentMode === '2'}
                    onSelect={handleSelectMode}
                  />
                  {/* Mode 4: Automatic Autonomous */}
                  <ModeCard
                    mode={getModeByPosition('automatic', 'autonomous')!}
                    isSelected={currentMode === '4'}
                    onSelect={handleSelectMode}
                  />
                </div>
              </div>
            </div>

            {/* Legend */}
            <div className="mt-6 flex items-center justify-center gap-6 text-xs text-zinc-500">
              <div className="flex items-center gap-2">
                <User className="w-3 h-3" />
                <span>Manual = You choose the expert</span>
              </div>
              <div className="flex items-center gap-2">
                <Bot className="w-3 h-3" />
                <span>Auto = AI routes to best expert</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3 h-3" />
                <span>Autonomous = HITL checkpoints</span>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

interface ModeCardProps {
  mode: ModeConfig;
  isSelected: boolean;
  onSelect: (mode: ModeConfig) => void;
}

function ModeCard({ mode, isSelected, onSelect }: ModeCardProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => onSelect(mode)}
      className={`relative p-4 rounded-xl border-2 text-left transition-all ${
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600 hover:bg-zinc-800/50'
      }`}
    >
      {/* Recommended Badge */}
      {mode.recommended && (
        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-primary text-primary-foreground text-xs font-medium rounded-full">
          Recommended
        </div>
      )}

      {/* Selected Checkmark */}
      {isSelected && (
        <div className="absolute top-3 right-3">
          <CheckCircle2 className="w-5 h-5 text-primary" />
        </div>
      )}

      {/* Icon and Title */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`p-2 rounded-lg ${isSelected ? 'bg-primary/20 text-primary' : 'bg-zinc-700/50 text-zinc-400'}`}>
          {mode.icon}
        </div>
        <div>
          <div className="font-medium text-white">{mode.shortName}</div>
          <div className="text-xs text-zinc-500">Mode {mode.id}</div>
        </div>
      </div>

      {/* Description */}
      <p className="text-sm text-zinc-400 mb-3">{mode.description}</p>

      {/* Features */}
      <ul className="space-y-1">
        {mode.features.map((feature, idx) => (
          <li key={idx} className="flex items-center gap-2 text-xs text-zinc-500">
            <ArrowRight className="w-3 h-3 text-zinc-600" />
            {feature}
          </li>
        ))}
      </ul>
    </motion.button>
  );
}

export default ModeSelectionModal;

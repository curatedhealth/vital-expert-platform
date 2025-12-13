'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  Brain, Zap, MessageCircle, UserCheck, Bot,
  ArrowRight, Sparkles, Users, Target, Workflow,
  CheckCircle2, Clock, TrendingUp
} from 'lucide-react';
import { useState } from 'react';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@vital/ui';
import { cn } from '@vital/ui/lib/utils';

interface ModeOption {
  id: string;
  name: string;
  shortName: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  gradient: string;
  features: string[];
  bestFor: string[];
  avgResponseTime: string;
  expertCount: number;
  badge?: string;
  complexity: 'simple' | 'moderate' | 'complex';
}

const ENHANCED_MODES: ModeOption[] = [
  {
    id: 'mode-1-query-automatic',
    name: 'Quick Expert Consensus',
    shortName: 'Quick Consensus',
    description: 'Get instant answers from multiple experts automatically',
    icon: <Zap className="h-6 w-6" />,
    color: 'text-amber-600',
    gradient: 'from-amber-500 to-orange-500',
    features: [
      'Automatic expert selection',
      'Parallel consultation',
      'Instant synthesis',
      'One-shot response'
    ],
    bestFor: [
      'Quick research questions',
      'Multiple perspectives needed',
      'Time-sensitive decisions',
      'Initial exploration'
    ],
    avgResponseTime: '30-45 sec',
    expertCount: 3,
    badge: 'Most Popular',
    complexity: 'simple'
  },
  {
    id: 'mode-2-query-manual',
    name: 'Targeted Expert Query',
    shortName: 'Targeted Query',
    description: 'Choose your specific expert for precise answers',
    icon: <Target className="h-6 w-6" />,
    color: 'text-violet-600',
    gradient: 'from-violet-500 to-fuchsia-500',
    features: [
      'Manual expert selection',
      'Specialized expertise',
      'Focused response',
      'Deep domain knowledge'
    ],
    bestFor: [
      'Specific regulatory questions',
      'Known expert needed',
      'Narrow domain focus',
      'Follow-up questions'
    ],
    avgResponseTime: '20-30 sec',
    expertCount: 1,
    complexity: 'simple'
  },
  {
    id: 'mode-3-chat-automatic',
    name: 'Interactive Expert Discussion',
    shortName: 'Interactive Chat',
    description: 'Multi-turn conversation with automatic expert rotation',
    icon: <MessageCircle className="h-6 w-6" />,
    color: 'text-purple-600',
    gradient: 'from-purple-500 to-pink-500',
    features: [
      'Multi-turn dialogue',
      'Context preservation',
      'Dynamic expert switching',
      'Clarification support'
    ],
    bestFor: [
      'Complex problems',
      'Exploratory research',
      'Iterative refinement',
      'Learning sessions'
    ],
    avgResponseTime: '45-60 sec per turn',
    expertCount: 2,
    badge: 'Best for Learning',
    complexity: 'moderate'
  },
  {
    id: 'mode-4-chat-manual',
    name: 'Dedicated Expert Session',
    shortName: 'Expert Session',
    description: 'Extended conversation with your chosen expert',
    icon: <UserCheck className="h-6 w-6" />,
    color: 'text-green-600',
    gradient: 'from-green-500 to-emerald-500',
    features: [
      'Single expert focus',
      'Deep expertise',
      'Relationship building',
      'Consistent perspective'
    ],
    bestFor: [
      'Strategic planning',
      'In-depth analysis',
      'Consultant relationship',
      'Project guidance'
    ],
    avgResponseTime: '60-90 sec per turn',
    expertCount: 1,
    complexity: 'moderate'
  },
  {
    id: 'mode-5-agent-autonomous',
    name: 'Autonomous Agent Workflow',
    shortName: 'Agent Workflow',
    description: 'AI agent completes multi-step tasks with checkpoints',
    icon: <Bot className="h-6 w-6" />,
    color: 'text-indigo-600',
    gradient: 'from-indigo-500 to-violet-500',
    features: [
      'Multi-step execution',
      'Checkpoint approval',
      'Tool integration',
      'Autonomous reasoning'
    ],
    bestFor: [
      'Complex workflows',
      'Document generation',
      'Research synthesis',
      'Multi-phase projects'
    ],
    avgResponseTime: '2-5 min per workflow',
    expertCount: 1,
    badge: 'Most Powerful',
    complexity: 'complex'
  }
];

interface EnhancedModeSelectorProps {
  selectedMode: string;
  onModeChange: (modeId: string) => void;
  className?: string;
}

export function EnhancedModeSelector({
  selectedMode,
  onModeChange,
  className
}: EnhancedModeSelectorProps) {
  const [view, setView] = useState<'cards' | 'comparison'>('cards');
  const [hoveredMode, setHoveredMode] = useState<string | null>(null);

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Brain className="h-5 w-5 text-purple-600" />
              Choose Your Consultation Mode
            </h3>
            <p className="text-sm text-muted-foreground">
              Select how you want to interact with our expert AI agents
            </p>
          </div>

          {/* View Toggle */}
          <Tabs value={view} onValueChange={(v) => setView(v as 'cards' | 'comparison')}>
            <TabsList>
              <TabsTrigger value="cards">Cards</TabsTrigger>
              <TabsTrigger value="comparison">Compare</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Cards View */}
      {view === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence mode="wait">
            {ENHANCED_MODES.map((mode) => (
              <motion.div
                key={mode.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ scale: 1.02 }}
                onHoverStart={() => setHoveredMode(mode.id)}
                onHoverEnd={() => setHoveredMode(null)}
              >
                <Card
                  className={cn(
                    "cursor-pointer transition-all duration-200 h-full",
                    selectedMode === mode.id
                      ? "ring-2 ring-purple-600 bg-purple-50/50"
                      : "hover:shadow-lg"
                  )}
                  onClick={() => onModeChange(mode.id)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className={cn(
                        "p-3 rounded-lg bg-gradient-to-br",
                        mode.gradient
                      )}>
                        <div className="text-white">
                          {mode.icon}
                        </div>
                      </div>
                      {mode.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {mode.badge}
                        </Badge>
                      )}
                    </div>

                    <CardTitle className="text-base mt-3 flex items-center gap-2">
                      {mode.shortName}
                      {selectedMode === mode.id && (
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                      )}
                    </CardTitle>

                    <CardDescription className="text-sm">
                      {mode.description}
                    </CardDescription>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Quick Stats */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>{mode.avgResponseTime}</span>
                      </div>
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <Users className="h-3 w-3" />
                        <span>{mode.expertCount} expert{mode.expertCount > 1 ? 's' : ''}</span>
                      </div>
                    </div>

                    {/* Features */}
                    <AnimatePresence>
                      {(hoveredMode === mode.id || selectedMode === mode.id) && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2"
                        >
                          <div className="text-xs font-medium text-muted-foreground">
                            Features:
                          </div>
                          <ul className="text-xs space-y-1">
                            {mode.features.map((feature, idx) => (
                              <li key={idx} className="flex items-center gap-1">
                                <Sparkles className="h-3 w-3 text-purple-500" />
                                <span>{feature}</span>
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Action Button */}
                    <Button
                      className="w-full"
                      variant={selectedMode === mode.id ? "default" : "outline"}
                      size="sm"
                    >
                      {selectedMode === mode.id ? 'Selected' : 'Select Mode'}
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Comparison View */}
      {view === 'comparison' && (
        <Card>
          <CardContent className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Feature</th>
                    {ENHANCED_MODES.map(mode => (
                      <th
                        key={mode.id}
                        className={cn(
                          "text-center py-3 px-4 cursor-pointer transition-colors",
                          selectedMode === mode.id && "bg-purple-50"
                        )}
                        onClick={() => onModeChange(mode.id)}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <div className={cn("p-2 rounded-lg bg-gradient-to-br", mode.gradient)}>
                            <div className="text-white">
                              {mode.icon}
                            </div>
                          </div>
                          <span className="font-medium">{mode.shortName}</span>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Response Time</td>
                    {ENHANCED_MODES.map(mode => (
                      <td key={mode.id} className="text-center py-3 px-4">
                        {mode.avgResponseTime}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Experts</td>
                    {ENHANCED_MODES.map(mode => (
                      <td key={mode.id} className="text-center py-3 px-4">
                        {mode.expertCount}
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Complexity</td>
                    {ENHANCED_MODES.map(mode => (
                      <td key={mode.id} className="text-center py-3 px-4">
                        <Badge
                          variant={
                            mode.complexity === 'simple' ? 'default' :
                            mode.complexity === 'moderate' ? 'secondary' : 'outline'
                          }
                        >
                          {mode.complexity}
                        </Badge>
                      </td>
                    ))}
                  </tr>
                  <tr className="border-b hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium">Best For</td>
                    {ENHANCED_MODES.map(mode => (
                      <td key={mode.id} className="text-center py-3 px-4">
                        <ul className="text-xs space-y-1">
                          {mode.bestFor.slice(0, 2).map((item, idx) => (
                            <li key={idx}>{item}</li>
                          ))}
                        </ul>
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

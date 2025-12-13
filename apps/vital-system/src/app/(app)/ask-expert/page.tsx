'use client';

/**
 * VITAL Platform - Ask Expert Mode Selector
 *
 * THE 4-MODE MATRIX (Mode 4 top-right, Mode 1 bottom-left)
 *
 *                           AUTOMATIC AGENT SELECTION
 *                                     ▲
 *              ┌──────────────────────┼──────────────────────┐
 *              │                      │                      │
 *              │    MODE 2            │         MODE 4       │
 *              │    Interactive       │         Autonomous   │
 *              │    Automatic         │         Automatic    │
 *              │    "Smart Copilot"   │    "Background       │
 *              │                      │     Mission"         │
 *  INTERACTIVE ├──────────────────────┼──────────────────────┤ AUTONOMOUS
 *              │                      │                      │
 *              │    MODE 1            │         MODE 3       │
 *              │    Interactive       │         Autonomous   │
 *              │    Manual            │         Manual       │
 *              │    "Expert Chat"     │    "Mission Control" │
 *              │                      │                      │
 *              └──────────────────────┼──────────────────────┘
 *                                     ▼
 *                           MANUAL AGENT SELECTION
 */

import { useRouter } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import {
  MessageSquare,
  Target,
  User,
  Sparkles,
  Zap,
} from 'lucide-react';

type ModeConfig = {
  mode: 1 | 2 | 3 | 4;
  title: string;
  nickname: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  color: string;
  bgGradient: string;
  route: string;
};

// Mode configurations - ordered for rendering in the matrix
const MODE_1: ModeConfig = {
  mode: 1,
  title: 'Interactive Manual',
  nickname: 'Expert Chat',
  description: 'Browse and select a specific expert for direct Q&A. Perfect when you know exactly which specialist you need.',
  icon: <User className="h-5 w-5" />,
  features: [
    'Browse 200+ specialized experts by domain',
    'Real-time conversation with citations',
    'Full control over expert selection',
  ],
  color: 'blue',
  bgGradient: 'from-blue-500/10 via-blue-400/5 to-transparent',
  route: '/ask-expert/interactive?mode=manual',
};

const MODE_2: ModeConfig = {
  mode: 2,
  title: 'Interactive Auto',
  nickname: 'Smart Copilot',
  description: 'Just ask your question - AI analyzes it and routes to the best expert automatically. Great for new users.',
  icon: <Sparkles className="h-5 w-5" />,
  features: [
    'AI analyzes your question intent',
    'Automatic expert matching & routing',
    'Smart follow-up suggestions',
  ],
  color: 'violet',
  bgGradient: 'from-violet-500/10 via-violet-400/5 to-transparent',
  route: '/ask-expert/interactive?mode=auto',
};

const MODE_3: ModeConfig = {
  mode: 3,
  title: 'Autonomous Manual',
  nickname: 'Mission Control',
  description: 'Launch deep research missions with structured templates. You review plans and approve key checkpoints.',
  icon: <Target className="h-5 w-5" />,
  features: [
    'Choose from research templates',
    'Review & approve execution plans',
    'Checkpoint-based progress tracking',
  ],
  color: 'emerald',
  bgGradient: 'from-emerald-500/10 via-emerald-400/5 to-transparent',
  route: '/ask-expert/autonomous?mode=manual',
};

const MODE_4: ModeConfig = {
  mode: 4,
  title: 'Autonomous Auto',
  nickname: 'Background Mission',
  description: 'Submit complex research tasks and let AI handle everything. Get notified when your report is ready.',
  icon: <Zap className="h-5 w-5" />,
  features: [
    'Fire-and-forget research tasks',
    'AI self-corrects and adapts',
    'Email notification on completion',
  ],
  color: 'amber',
  bgGradient: 'from-amber-500/10 via-amber-400/5 to-transparent',
  route: '/ask-expert/autonomous?mode=auto',
};

const colorClasses = {
  blue: {
    icon: 'text-blue-500',
    iconBg: 'bg-blue-500/10',
    border: 'hover:border-blue-500/50',
    badge: 'border-blue-500/30 text-blue-600',
  },
  violet: {
    icon: 'text-violet-500',
    iconBg: 'bg-violet-500/10',
    border: 'hover:border-violet-500/50',
    badge: 'border-violet-500/30 text-violet-600',
  },
  emerald: {
    icon: 'text-emerald-500',
    iconBg: 'bg-emerald-500/10',
    border: 'hover:border-emerald-500/50',
    badge: 'border-emerald-500/30 text-emerald-600',
  },
  amber: {
    icon: 'text-amber-500',
    iconBg: 'bg-amber-500/10',
    border: 'hover:border-amber-500/50',
    badge: 'border-amber-500/30 text-amber-600',
  },
};

function ModeCard({ config }: { config: ModeConfig }) {
  const router = useRouter();
  const colors = colorClasses[config.color as keyof typeof colorClasses];

  return (
    <button
      type="button"
      onClick={() => router.push(config.route)}
      className={`
        relative overflow-hidden p-5 rounded-2xl border bg-card text-left
        transition-all duration-300 ease-out
        hover:shadow-xl hover:scale-[1.02] ${colors.border}
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary
        group cursor-pointer h-full
      `}
    >
      {/* Background gradient */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.bgGradient} opacity-50 group-hover:opacity-100 transition-opacity`} />

      {/* Content */}
      <div className="relative z-10 flex flex-col h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className={`w-10 h-10 rounded-xl ${colors.iconBg} flex items-center justify-center ${colors.icon}`}>
            {config.icon}
          </div>
          <Badge variant="outline" className={`text-xs ${colors.badge}`}>
            Mode {config.mode}
          </Badge>
        </div>

        {/* Title & Nickname */}
        <h3 className="text-lg font-semibold mb-0.5">{config.title}</h3>
        <p className="text-sm font-medium text-muted-foreground mb-2">"{config.nickname}"</p>
        <p className="text-sm text-muted-foreground/80 mb-3 flex-1">{config.description}</p>

        {/* Features */}
        <div className="space-y-1">
          {config.features.map((feature) => (
            <div key={feature} className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className={`${colors.icon}`}>•</span>
              <span>{feature}</span>
            </div>
          ))}
        </div>
      </div>
    </button>
  );
}

export default function AskExpertLandingPage() {
  const router = useRouter();

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Main Content - Scrollable (breadcrumb now in global header) */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto p-6 space-y-6">
          {/* Matrix Container */}
          <div className="relative max-w-4xl mx-auto">
            {/* X-Axis Labels */}
            <div className="flex justify-between items-center mb-4 px-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span className="font-medium">Manual Selection</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 via-transparent to-amber-200 mx-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Sparkles className="h-4 w-4" />
                <span className="font-medium">Automatic Selection</span>
              </div>
            </div>

            {/* 2x2 Matrix Grid - Mode 4 top-right, Mode 1 bottom-left */}
            <div className="grid grid-cols-2 gap-4">
              {/* TOP ROW - Automatic Selection */}
              <ModeCard config={MODE_2} /> {/* Top-Left: Mode 2 (Interactive + Auto) */}
              <ModeCard config={MODE_4} /> {/* Top-Right: Mode 4 (Autonomous + Auto) */}

              {/* BOTTOM ROW - Manual Selection */}
              <ModeCard config={MODE_1} /> {/* Bottom-Left: Mode 1 (Interactive + Manual) */}
              <ModeCard config={MODE_3} /> {/* Bottom-Right: Mode 3 (Autonomous + Manual) */}
            </div>

            {/* Y-Axis Labels (Bottom) */}
            <div className="flex justify-between items-center mt-4 px-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4" />
                <span className="font-medium">Interactive</span>
              </div>
              <div className="flex-1 h-px bg-gradient-to-r from-blue-200 via-transparent to-emerald-200 mx-4" />
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Target className="h-4 w-4" />
                <span className="font-medium">Autonomous</span>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="text-center">
            <p className="text-xs text-muted-foreground mb-3 uppercase tracking-wider">Quick Links</p>
            <div className="flex items-center justify-center gap-4 flex-wrap">
              <button
                type="button"
                onClick={() => router.push('/ask-expert/missions')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Mission History
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                type="button"
                onClick={() => router.push('/ask-expert/templates')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Research Templates
              </button>
              <span className="text-muted-foreground/30">•</span>
              <button
                type="button"
                onClick={() => router.push('/agents')}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Browse Experts
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

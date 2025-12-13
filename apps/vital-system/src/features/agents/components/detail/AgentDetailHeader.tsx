'use client';

/**
 * AgentDetailHeader - Hero Header Component
 *
 * Displays agent header with avatar, name, badges, and action buttons
 * Uses Brand Guidelines v6.0 styling with warm purple accent (#9055E0)
 */

import { useRouter } from 'next/navigation';
import { Button } from '@vital/ui';
import { Badge } from '@vital/ui';
import {
  ArrowLeft,
  ArrowRightLeft,
  Edit,
  MessageSquarePlus,
  Building2,
  Briefcase,
  Brain,
} from 'lucide-react';
import { type Agent } from '@/lib/stores/agents-store';
import { LEVEL_COLORS, agentLevelConfig } from '../../hooks/useAgentHierarchy';

interface AgentDetailHeaderProps {
  agent: Agent;
  onAddToCompare?: () => void;
}

export function AgentDetailHeader({ agent, onAddToCompare }: AgentDetailHeaderProps) {
  const router = useRouter();
  const levelNumber = agent.tier || 2;
  const levelInfo = agentLevelConfig[levelNumber as keyof typeof agentLevelConfig];
  const headerColors = LEVEL_COLORS[levelNumber] || LEVEL_COLORS[2];

  const handleStartChat = () => {
    router.push(`/chat?agent=${agent.id}`);
  };

  const handleEdit = () => {
    router.push(`/agents?edit=${agent.id}`);
  };

  return (
    <div
      className="relative overflow-hidden border-b"
      style={{
        background: `linear-gradient(135deg, ${headerColors.bg}80 0%, white 50%, ${headerColors.bg}40 100%)`,
        borderColor: `${headerColors.border}30`,
      }}
    >
      {/* Decorative background elements */}
      <div
        className="absolute top-0 right-0 w-96 h-96 opacity-10 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 80% 20%, ${headerColors.border} 0%, transparent 60%)`,
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-64 h-64 opacity-5 pointer-events-none"
        style={{
          background: `radial-gradient(circle at 20% 80%, ${headerColors.border} 0%, transparent 70%)`,
        }}
      />

      <div className="relative px-6 py-5">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-5">
            {/* Back button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/agents')}
              className="text-stone-600 hover:text-stone-900 hover:bg-stone-100/50 mt-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>

            <div className="h-16 w-px bg-stone-200" />

            {/* Agent info */}
            <div className="flex items-start gap-5">
              {/* Enhanced Avatar with level indicator */}
              <div className="relative">
                <div
                  className="w-20 h-20 rounded-2xl flex items-center justify-center text-4xl shadow-lg"
                  style={{
                    background: 'white',
                    border: `3px solid ${headerColors.border}`,
                    boxShadow: `0 8px 24px ${headerColors.glow}`,
                  }}
                >
                  {agent.avatar || '🤖'}
                </div>
                {/* Level badge */}
                <div
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-lg flex items-center justify-center text-sm font-bold shadow-md"
                  style={{
                    background: headerColors.border,
                    color: 'white',
                  }}
                >
                  L{levelNumber}
                </div>
              </div>

              <div className="pt-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-2xl font-bold text-stone-900">
                    {(agent as any).display_name || agent.name}
                  </h1>
                  {levelInfo && (
                    <Badge
                      className="font-semibold border-2 shadow-sm"
                      style={{
                        background: headerColors.bgGradient,
                        borderColor: headerColors.border,
                        color: headerColors.text,
                      }}
                    >
                      {headerColors.icon} {levelInfo.label}
                    </Badge>
                  )}
                  {agent.status === 'active' && (
                    <Badge className="bg-emerald-100 text-emerald-700 border-emerald-300 shadow-sm">
                      <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5 animate-pulse" />
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-stone-600 mt-2 max-w-2xl leading-relaxed">
                  {agent.description}
                </p>
                {/* Quick info tags */}
                <div className="flex items-center gap-3 mt-3">
                  {(agent as any).function_name && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 bg-stone-100/60 px-2.5 py-1 rounded-full border border-stone-200">
                      <Building2 className="w-3 h-3" />
                      {(agent as any).function_name}
                    </span>
                  )}
                  {(agent as any).department && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 bg-stone-100/60 px-2.5 py-1 rounded-full border border-stone-200">
                      <Briefcase className="w-3 h-3" />
                      {(agent as any).department}
                    </span>
                  )}
                  {agent.model && (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-stone-500 bg-stone-100/60 px-2.5 py-1 rounded-full border border-stone-200">
                      <Brain className="w-3 h-3" />
                      {agent.model}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            {onAddToCompare && (
              <Button
                variant="outline"
                onClick={onAddToCompare}
                className="bg-white/80 hover:bg-white shadow-sm border-stone-200"
              >
                <ArrowRightLeft className="w-4 h-4 mr-2" />
                Compare
              </Button>
            )}
            <Button
              variant="outline"
              onClick={handleEdit}
              className="bg-white/80 hover:bg-white shadow-sm border-stone-200"
            >
              <Edit className="w-4 h-4 mr-2" />
              Edit
            </Button>
            <Button
              onClick={handleStartChat}
              className="bg-purple-600 hover:bg-purple-700 shadow-lg"
              style={{ boxShadow: '0 4px 14px rgba(144, 85, 224, 0.4)' }}
            >
              <MessageSquarePlus className="w-4 h-4 mr-2" />
              Start Chat
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

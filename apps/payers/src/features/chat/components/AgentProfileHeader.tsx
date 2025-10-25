'use client';

import Image from 'next/image';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { Agent } from '@/lib/stores/chat-store';

interface AgentProfileHeaderProps {
  agent: Agent | null;
  showChangeButton?: boolean;
  onChangeAgent?: () => void;
  className?: string;
}

/**
 * Agent profile header component
 * Displays agent avatar, name, description, and optional change button
 * Used in manual mode to show the selected expert
 */
export function AgentProfileHeader({
  agent,
  showChangeButton = false,
  onChangeAgent,
  className = '',
}: AgentProfileHeaderProps) {
  if (!agent) {
    return null;
  }

  return (
    <div className={`border-b px-6 py-3 bg-gray-50 flex-shrink-0 ${className}`}>
      <div className="max-w-4xl mx-auto flex items-center gap-3">
        {/* Agent Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-white border-2 border-gray-200 overflow-hidden flex-shrink-0">
          {agent.avatar && (agent.avatar.startsWith('/') || agent.avatar.includes('avatar_')) ? (
            <Image
              src={agent.avatar}
              alt={agent.display_name || agent.name}
              width={40}
              height={40}
              className="object-cover w-full h-full"
            />
          ) : (
            <span className="text-xl">{agent.avatar || '>'}</span>
          )}
        </div>

        {/* Agent Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-gray-900 text-sm truncate">
              {agent.display_name || agent.name}
            </h3>
            {agent.tier && (
              <Badge variant="outline" className="text-xs">
                Tier {agent.tier}
              </Badge>
            )}
          </div>
          <p className="text-xs text-gray-600 truncate">{agent.description}</p>
        </div>

        {/* Change Button */}
        {showChangeButton && onChangeAgent && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onChangeAgent}
            className="flex-shrink-0"
          >
            Change
          </Button>
        )}
      </div>
    </div>
  );
}

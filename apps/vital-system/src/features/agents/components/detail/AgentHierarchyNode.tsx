'use client';

/**
 * AgentHierarchyNode - Custom React Flow Node
 *
 * Displays an agent in the hierarchy visualization
 * Uses Brand Guidelines v6.0 styling
 */

import { Star } from 'lucide-react';
import { cn } from '@vital/ui/lib/utils';
import { LEVEL_COLORS, RELATIONSHIP_CONFIG } from '../../hooks/useAgentHierarchy';

interface AgentNodeData {
  label: string;
  avatar?: string;
  level: number;
  levelName: string;
  isCurrentAgent?: boolean;
  relationshipType?: string;
}

interface AgentHierarchyNodeProps {
  data: AgentNodeData;
}

export function AgentHierarchyNode({ data }: AgentHierarchyNodeProps) {
  const colors = LEVEL_COLORS[data.level] || LEVEL_COLORS[2];
  const isCurrentAgent = data.isCurrentAgent;
  const relationshipInfo = data.relationshipType ? RELATIONSHIP_CONFIG[data.relationshipType] : null;

  return (
    <div
      className={cn(
        'group relative rounded-xl transition-all duration-300 cursor-pointer',
        'hover:scale-105 hover:-translate-y-1',
        isCurrentAgent && 'scale-105'
      )}
      style={{
        minWidth: 200,
        boxShadow: isCurrentAgent
          ? `0 8px 32px ${colors.glow}, 0 0 0 3px #9055E0`
          : `0 4px 16px ${colors.glow}`,
      }}
    >
      {/* Main card */}
      <div
        className="relative overflow-hidden rounded-xl"
        style={{
          background: colors.bgGradient,
          borderWidth: 2,
          borderStyle: 'solid',
          borderColor: isCurrentAgent ? '#9055E0' : colors.border,
        }}
      >
        {/* Decorative corner accent */}
        <div
          className="absolute top-0 right-0 w-16 h-16 opacity-20"
          style={{
            background: `radial-gradient(circle at 100% 0%, ${colors.border} 0%, transparent 70%)`,
          }}
        />

        {/* Current agent indicator */}
        {isCurrentAgent && (
          <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center shadow-lg">
            <Star className="w-3 h-3 text-white fill-white" />
          </div>
        )}

        <div className="p-4">
          {/* Header with avatar and level badge */}
          <div className="flex items-start gap-3">
            <div
              className="relative w-12 h-12 rounded-xl flex items-center justify-center text-xl shadow-inner"
              style={{
                backgroundColor: 'rgba(255,255,255,0.8)',
                border: `1px solid ${colors.border}40`,
              }}
            >
              {data.avatar || '🤖'}
              {/* Level indicator */}
              <div
                className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shadow"
                style={{
                  backgroundColor: colors.border,
                  color: 'white',
                }}
              >
                {data.level}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div
                className="font-semibold text-sm leading-tight line-clamp-2"
                style={{ color: colors.text }}
              >
                {data.label}
              </div>
              <div
                className="flex items-center gap-1 mt-1 text-xs font-medium"
                style={{ color: colors.text, opacity: 0.8 }}
              >
                <span>{colors.icon}</span>
                <span>{data.levelName}</span>
              </div>
            </div>
          </div>

          {/* Relationship indicator */}
          {relationshipInfo && (
            <div
              className="mt-3 pt-2 border-t flex items-center justify-center gap-1.5"
              style={{ borderColor: `${colors.border}30` }}
            >
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${relationshipInfo.color}20`,
                  color: relationshipInfo.color,
                }}
              >
                {relationshipInfo.icon} {relationshipInfo.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Hover glow effect */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
        style={{
          boxShadow: `0 12px 40px ${colors.glow}`,
        }}
      />
    </div>
  );
}

// Node types map for React Flow
export const agentNodeTypes = {
  agent: AgentHierarchyNode,
};

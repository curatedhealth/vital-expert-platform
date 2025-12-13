'use client';

/**
 * AgentOverviewCard - Agent Detail Overview
 *
 * Displays agent summary information in a card
 * Uses Brand Guidelines v6.0 styling
 */

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@vital/ui';
import { Badge } from '@vital/ui';
import { AgentAvatar } from '@vital/ui';
import {
  Brain,
  Target,
  Building2,
  Briefcase,
  UserCircle,
  CheckCircle,
  Thermometer,
  Hash,
} from 'lucide-react';
import { type Agent } from '@/lib/stores/agents-store';
import { agentLevelConfig } from '../../hooks/useAgentHierarchy';

interface AgentOverviewCardProps {
  agent: Agent;
}

export function AgentOverviewCard({ agent }: AgentOverviewCardProps) {
  const levelConfig = agentLevelConfig[agent.tier as keyof typeof agentLevelConfig];
  const statusColors: Record<string, string> = {
    active: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    development: 'bg-amber-100 text-amber-800 border-amber-300',
    testing: 'bg-blue-100 text-blue-800 border-blue-300',
    deprecated: 'bg-stone-100 text-stone-800 border-stone-300',
  };

  return (
    <Card className="border-stone-200">
      <CardHeader className="pb-4">
        <div className="flex items-start gap-4">
          <AgentAvatar
            agent={agent as any}
            name={(agent as any).display_name || agent.name}
            size="lg"
            className="ring-2 ring-purple-200"
          />
          <div className="flex-1 min-w-0">
            <CardTitle className="text-xl text-stone-900">
              {(agent as any).display_name || agent.name}
            </CardTitle>
            <CardDescription className="mt-1 line-clamp-2">
              {agent.description}
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-3">
              {/* Level Badge */}
              <Badge
                variant="outline"
                className={levelConfig?.color || 'bg-stone-50 text-stone-700'}
              >
                {levelConfig?.label || `Tier ${agent.tier}`}
              </Badge>
              {/* Status Badge */}
              <Badge
                variant="outline"
                className={statusColors[agent.status] || statusColors.active}
              >
                {agent.status}
              </Badge>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Key Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricItem
            icon={Thermometer}
            label="Temperature"
            value={agent.temperature?.toFixed(2) || '0.70'}
          />
          <MetricItem
            icon={Hash}
            label="Max Tokens"
            value={agent.max_tokens?.toLocaleString() || '2,000'}
          />
          <MetricItem
            icon={CheckCircle}
            label="RAG Enabled"
            value={agent.rag_enabled ? 'Yes' : 'No'}
          />
          <MetricItem
            icon={Brain}
            label="Model"
            value={agent.model || 'gpt-4'}
          />
        </div>

        {/* Organization Info */}
        <div className="pt-4 border-t border-stone-200">
          <h4 className="text-sm font-medium text-stone-700 mb-3">Organization</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {(agent as any).function_name && (
              <InfoItem icon={Target} label="Function" value={(agent as any).function_name} />
            )}
            {(agent as any).department && (
              <InfoItem icon={Building2} label="Department" value={(agent as any).department} />
            )}
            {agent.role && (
              <InfoItem icon={Briefcase} label="Role" value={agent.role} />
            )}
          </div>
        </div>

        {/* Capabilities */}
        {agent.capabilities && agent.capabilities.length > 0 && (
          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-sm font-medium text-stone-700 mb-3">Capabilities</h4>
            <div className="flex flex-wrap gap-2">
              {agent.capabilities.slice(0, 8).map((cap, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="bg-purple-50 text-purple-700 border-purple-200"
                >
                  {cap}
                </Badge>
              ))}
              {agent.capabilities.length > 8 && (
                <Badge variant="secondary" className="bg-stone-100 text-stone-600">
                  +{agent.capabilities.length - 8} more
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Knowledge Domains */}
        {agent.knowledge_domains && agent.knowledge_domains.length > 0 && (
          <div className="pt-4 border-t border-stone-200">
            <h4 className="text-sm font-medium text-stone-700 mb-3">Knowledge Domains</h4>
            <div className="flex flex-wrap gap-2">
              {agent.knowledge_domains.slice(0, 6).map((domain, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="bg-blue-50 text-blue-700 border-blue-200"
                >
                  {domain}
                </Badge>
              ))}
              {agent.knowledge_domains.length > 6 && (
                <Badge variant="secondary" className="bg-stone-100 text-stone-600">
                  +{agent.knowledge_domains.length - 6} more
                </Badge>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Helper components
function MetricItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 p-3 bg-stone-50 rounded-lg">
      <Icon className="h-4 w-4 text-stone-500" />
      <div>
        <p className="text-xs text-stone-500">{label}</p>
        <p className="text-sm font-medium text-stone-900">{value}</p>
      </div>
    </div>
  );
}

function InfoItem({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icon className="h-4 w-4 text-stone-400" />
      <span className="text-stone-500">{label}:</span>
      <span className="font-medium text-stone-700">{value}</span>
    </div>
  );
}

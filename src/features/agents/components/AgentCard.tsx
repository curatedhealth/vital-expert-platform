import {
  MoreVertical,
  Eye,
  Edit,
  Play,
  Pause,
  Trash2,
  Copy,
  Download,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Brain,
  DollarSign
} from 'lucide-react';
import React from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useBusinessFunctionMap } from '@/hooks/useBusinessFunctionMap';
import { AgentAvatar } from '@/shared/components/ui/agent-avatar';
import { Agent, DomainExpertise, ValidationStatus, DOMAIN_COLORS } from '@/types/agent.types';

interface AgentCardProps {
  agent: Agent;
  onSelect?: (agent: Agent) => void;
  onEdit?: (agent: Agent) => void;
  onActivate?: (agent: Agent) => void;
  onDeactivate?: (agent: Agent) => void;
  onDelete?: (agent: Agent) => void;
  onDuplicate?: (agent: Agent) => void;
  onExport?: (agent: Agent) => void;
  showMetrics?: boolean;
  showActions?: boolean;
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  onSelect,
  onEdit,
  onActivate,
  onDeactivate,
  onDelete,
  onDuplicate,
  onExport,
  showMetrics = true,
  showActions = true
}) => {
  // Get business function name from function_id
  const { getFunctionName } = useBusinessFunctionMap();

  // Get domain-specific color
  const getDomainColor = (domain: DomainExpertise) => {
    // eslint-disable-next-line security/detect-object-injection
    return DOMAIN_COLORS[domain] || DOMAIN_COLORS.general;
  };

  // Get validation status color and icon
  const getValidationDisplay = (status?: ValidationStatus) => {
    const displays = {
      validated: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Validated' },
      pending: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Pending' },
      in_review: { color: 'bg-blue-100 text-blue-800', icon: Eye, label: 'In Review' },
      expired: { color: 'bg-red-100 text-red-800', icon: AlertTriangle, label: 'Expired' },
      not_required: { color: 'bg-gray-100 text-gray-800', icon: CheckCircle, label: 'Not Required' }
    };
    return displays[status || 'pending'];
  };

  // Get status color (lifecycle stage)
  const getStatusColor = (status?: string) => {
    const colors: Record<string, string> = {
      active: 'bg-green-100 text-green-800',
      development: 'bg-blue-100 text-blue-800',
      testing: 'bg-yellow-100 text-yellow-800',
      deprecated: 'bg-red-100 text-red-800',
      inactive: 'bg-gray-100 text-gray-800',
      planned: 'bg-purple-100 text-purple-800',
      pipeline: 'bg-indigo-100 text-indigo-800'
    };
    return colors[status || 'development'] || colors.development;
  };

  // Get tier label and color
  const getTierDisplay = (tier?: number) => {
    const displays: Record<number, { label: string; color: string }> = {
      0: { label: 'Core', color: 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-900 border-purple-300' },
      1: { label: 'Tier 1', color: 'bg-blue-100 text-blue-800 border-blue-300' },
      2: { label: 'Tier 2', color: 'bg-green-100 text-green-800 border-green-300' },
      3: { label: 'Tier 3', color: 'bg-orange-100 text-orange-800 border-orange-300' }
    };
    return displays[tier ?? 1] || displays[1];
  };

  // Format accuracy for display
  const formatAccuracy = (score?: number) => {
    if (!score) return 'N/A';
    return `${(score * 100).toFixed(1)}%`;
  };

  // Format cost
  const formatCost = (cost?: number) => {
    if (!cost) return 'Free';
    return `$${cost.toFixed(4)}/query`;
  };

  // Get compliance icons
  const getComplianceIcons = () => {
    const icons = [];
    if (agent.hipaa_compliant) {
      icons.push(
        <Tooltip key="hipaa">
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700">
              HIPAA
            </Badge>
          </TooltipTrigger>
          <TooltipContent>HIPAA Compliant</TooltipContent>
        </Tooltip>
      );
    }
    if (agent.gdpr_compliant) {
      icons.push(
        <Tooltip key="gdpr">
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs bg-green-50 text-green-700">
              GDPR
            </Badge>
          </TooltipTrigger>
          <TooltipContent>GDPR Compliant</TooltipContent>
        </Tooltip>
      );
    }
    if (agent.pharma_enabled) {
      icons.push(
        <Tooltip key="pharma">
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700">
              PHARMA
            </Badge>
          </TooltipTrigger>
          <TooltipContent>PHARMA Protocol Enabled</TooltipContent>
        </Tooltip>
      );
    }
    if (agent.verify_enabled) {
      icons.push(
        <Tooltip key="verify">
          <TooltipTrigger>
            <Badge variant="outline" className="text-xs bg-indigo-50 text-indigo-700">
              VERIFY
            </Badge>
          </TooltipTrigger>
          <TooltipContent>VERIFY Protocol Enabled</TooltipContent>
        </Tooltip>
      );
    }
    return icons;
  };

  const validationDisplay = getValidationDisplay(agent.validation_status);
  const ValidationIcon = validationDisplay.icon;

  return (
    <TooltipProvider>
      <Card
        className="agent-card hover:shadow-lg transition-all cursor-pointer group relative"
        onClick={() => onSelect?.(agent)}
        style={{
          borderLeftWidth: '4px',
          borderLeftColor: agent.color || getDomainColor(agent.domain_expertise)
        }}
      >
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="flex-shrink-0" style={{ width: '25%', maxWidth: '80px' }}>
                <AgentAvatar
                  agent={agent}
                  size="xl"
                  className="w-full aspect-square"
                />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-base truncate">
                  {agent.display_name}
                </h3>
                <p className="text-sm text-gray-600 truncate">
                  {agent.department || agent.business_function || 'General Purpose'}
                </p>
                {agent.role && (
                  <p className="text-xs text-gray-500 truncate">
                    {agent.role}
                  </p>
                )}
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-col gap-1 items-end">
              {agent.tier !== undefined && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge variant="outline" className={`text-xs font-semibold ${getTierDisplay(agent.tier).color}`}>
                      {getTierDisplay(agent.tier).label}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Agent Tier: {getTierDisplay(agent.tier).label}
                  </TooltipContent>
                </Tooltip>
              )}
              {agent.status && (
                <Tooltip>
                  <TooltipTrigger>
                    <Badge className={`text-xs font-medium ${getStatusColor(agent.status)}`}>
                      {agent.status.toUpperCase()}
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    Lifecycle Stage: {agent.status}
                  </TooltipContent>
                </Tooltip>
              )}
              <div className="flex items-center gap-1">
                <ValidationIcon className="h-3 w-3" />
                <Badge className={`text-xs ${validationDisplay.color}`}>
                  {validationDisplay.label}
                </Badge>
              </div>
            </div>
          </div>

          {/* Description */}
          <p className="text-sm text-gray-700 mb-3 line-clamp-2 leading-relaxed">
            {agent.description}
          </p>

          {/* Domain & Specialization */}
          <div className="mb-3">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              {(() => {
                // Try to get function name from function_id, fallback to business_function string
                const functionName = getFunctionName((agent as any).function_id) ||
                                    agent.business_function?.replace(/_/g, ' ');

                return functionName ? (
                  <Badge variant="outline" className="text-xs bg-purple-50 text-purple-700 border-purple-200">
                    {functionName.toUpperCase()}
                  </Badge>
                ) : null;
              })()}
              <Badge
                style={{ backgroundColor: getDomainColor(agent.domain_expertise) }}
                className="text-white text-xs"
              >
                {agent.domain_expertise.toUpperCase()}
              </Badge>
              {agent.medical_specialty && (
                <Badge variant="outline" className="text-xs">
                  {agent.medical_specialty}
                </Badge>
              )}
            </div>

            {/* Capabilities */}
            <div className="flex flex-wrap gap-1">
              {agent.capabilities.slice(0, 3).map((cap, i) => (
                <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded-md">
                  {cap}
                </span>
              ))}
              {agent.capabilities.length > 3 && (
                <Tooltip>
                  <TooltipTrigger>
                    <span className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md">
                      +{agent.capabilities.length - 3} more
                    </span>
                  </TooltipTrigger>
                  <TooltipContent>
                    <div className="max-w-xs">
                      {agent.capabilities.slice(3).join(', ')}
                    </div>
                  </TooltipContent>
                </Tooltip>
              )}
            </div>
          </div>

          {/* Performance Metrics */}
          {showMetrics && (
            <div className="space-y-2 mb-3">
              <div className="flex justify-between items-center text-sm">
                <span className="flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Accuracy
                </span>
                <span className="font-semibold">{formatAccuracy(agent.accuracy_score)}</span>
              </div>
              <Progress
                value={(agent.accuracy_score || 0) * 100}
                className="h-2"
              />

              {/* Additional Metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                {agent.total_interactions !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Interactions:</span>
                    <span className="font-medium">{agent.total_interactions.toLocaleString()}</span>
                  </div>
                )}
                {agent.error_rate !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Error Rate:</span>
                    <span className="font-medium">{(agent.error_rate * 100).toFixed(2)}%</span>
                  </div>
                )}
                {agent.average_response_time !== undefined && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Avg Response:</span>
                    <span className="font-medium">{agent.average_response_time}ms</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-gray-600 flex items-center gap-1">
                    <DollarSign className="h-3 w-3" />
                    Cost:
                  </span>
                  <span className="font-medium">{formatCost(agent.cost_per_query)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Compliance Badges */}
          <div className="flex flex-wrap gap-1 mb-3">
            {getComplianceIcons()}
            {agent.regulatory_context?.is_regulated && (
              <Tooltip>
                <TooltipTrigger>
                  <Badge variant="outline" className="text-xs bg-orange-50 text-orange-700">
                    <Shield className="h-3 w-3 mr-1" />
                    REGULATED
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  Regulatory Context: {agent.regulatory_context.risk_level?.toUpperCase() || 'Unknown'} Risk
                </TooltipContent>
              </Tooltip>
            )}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-gray-100">
            <div className="flex items-center gap-2 text-xs text-gray-500">
              {agent.model && (
                <span className="bg-gray-100 px-2 py-1 rounded">
                  {agent.model}
                </span>
              )}
              {agent.is_custom && (
                <Badge variant="outline" className="text-xs">Custom</Badge>
              )}
            </div>

            {/* Action Dropdown */}
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onSelect?.(agent);
                  }}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(agent);
                  }}>
                    <Edit className="h-4 w-4 mr-2" />
                    Configure
                  </DropdownMenuItem>

                  {agent.status === 'active' ? (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onDeactivate?.(agent);
                    }}>
                      <Pause className="h-4 w-4 mr-2" />
                      Deactivate
                    </DropdownMenuItem>
                  ) : (
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onActivate?.(agent);
                    }}>
                      <Play className="h-4 w-4 mr-2" />
                      Activate
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onDuplicate?.(agent);
                  }}>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>

                  <DropdownMenuItem onClick={(e) => {
                    e.stopPropagation();
                    onExport?.(agent);
                  }}>
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </DropdownMenuItem>

                  {agent.is_custom && (
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete?.(agent);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};
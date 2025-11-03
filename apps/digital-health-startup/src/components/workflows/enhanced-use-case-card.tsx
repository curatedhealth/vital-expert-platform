'use client';

import { LucideIcon } from 'lucide-react';
import { Clock, FileText, Layers, TrendingUp, Users, Zap } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Play, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';

interface UseCaseCardProps {
  useCase: {
    id: string;
    code: string;
    title: string;
    description: string;
    domain: string;
    complexity: string;
    estimated_duration_minutes: number;
    deliverables?: string[];
    prerequisites?: string[];
    success_metrics?: Record<string, any>;
    workflow_count?: number;
    task_count?: number;
    agent_count?: number;
  };
  domainConfig: {
    name: string;
    icon: LucideIcon;
    color: string;
    bgColor: string;
    borderColor: string;
  };
  onClick?: () => void;
  onExecute?: (e: React.MouseEvent) => void;
  onConfigure?: (e: React.MouseEvent) => void;
}

const COMPLEXITY_CONFIG = {
  Basic: {
    color: 'text-green-700',
    bg: 'bg-green-100',
    border: 'border-green-200',
    icon: Zap
  },
  Intermediate: {
    color: 'text-blue-700',
    bg: 'bg-blue-100',
    border: 'border-blue-200',
    icon: Layers
  },
  Advanced: {
    color: 'text-orange-700',
    bg: 'bg-orange-100',
    border: 'border-orange-200',
    icon: TrendingUp
  },
  Expert: {
    color: 'text-red-700',
    bg: 'bg-red-100',
    border: 'border-red-200',
    icon: TrendingUp
  }
};

export function EnhancedUseCaseCard({
  useCase,
  domainConfig,
  onClick,
  onExecute,
  onConfigure
}: UseCaseCardProps) {
  const Icon = domainConfig.icon;
  const complexityConfig = COMPLEXITY_CONFIG[useCase.complexity as keyof typeof COMPLEXITY_CONFIG] || COMPLEXITY_CONFIG.Intermediate;
  const ComplexityIcon = complexityConfig.icon;

  return (
    <Card
      className={cn(
        "border-l-4 hover:shadow-xl transition-all duration-300 cursor-pointer group",
        domainConfig.borderColor,
        "hover:-translate-y-1"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4">
        <div className="space-y-3">
          {/* Header */}
          <div className="flex items-start gap-3">
            <div className={cn("p-2.5 rounded-lg flex-shrink-0", domainConfig.bgColor)}>
              <Icon className={cn("h-5 w-5", domainConfig.color)} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1 mb-1.5 flex-wrap">
                <Badge variant="outline" className="text-xs font-mono">
                  {useCase.code}
                </Badge>
                <Badge
                  className={cn(
                    "text-xs",
                    complexityConfig.color,
                    complexityConfig.bg,
                    complexityConfig.border,
                    "border"
                  )}
                >
                  <ComplexityIcon className="h-3 w-3 mr-1" />
                  {useCase.complexity}
                </Badge>
              </div>
              <h3 className="font-semibold text-sm text-deep-charcoal line-clamp-2 group-hover:text-healthcare-accent transition-colors">
                {useCase.title}
              </h3>
            </div>
          </div>

          {/* Description */}
          <p className="text-xs text-medical-gray line-clamp-2 leading-relaxed">
            {useCase.description}
          </p>

          {/* Metadata Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Duration */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="p-1.5 bg-blue-50 rounded">
                <Clock className="h-3.5 w-3.5 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] text-medical-gray uppercase tracking-wide">Duration</p>
                <p className="font-semibold text-deep-charcoal">
                  {useCase.estimated_duration_minutes}m
                </p>
              </div>
            </div>

            {/* Workflows */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="p-1.5 bg-purple-50 rounded">
                <Layers className="h-3.5 w-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-[10px] text-medical-gray uppercase tracking-wide">Workflows</p>
                <p className="font-semibold text-deep-charcoal">
                  {useCase.workflow_count || 0}
                </p>
              </div>
            </div>

            {/* Tasks */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="p-1.5 bg-green-50 rounded">
                <FileText className="h-3.5 w-3.5 text-green-600" />
              </div>
              <div>
                <p className="text-[10px] text-medical-gray uppercase tracking-wide">Tasks</p>
                <p className="font-semibold text-deep-charcoal">
                  {useCase.task_count || 0}
                </p>
              </div>
            </div>

            {/* Agents */}
            <div className="flex items-center gap-1.5 text-xs">
              <div className="p-1.5 bg-orange-50 rounded">
                <Users className="h-3.5 w-3.5 text-orange-600" />
              </div>
              <div>
                <p className="text-[10px] text-medical-gray uppercase tracking-wide">Agents</p>
                <p className="font-semibold text-deep-charcoal">
                  {useCase.agent_count || 0}
                </p>
              </div>
            </div>
          </div>

          {/* Deliverables Preview */}
          {useCase.deliverables && useCase.deliverables.length > 0 && (
            <div className="border-t pt-2">
              <p className="text-[10px] text-medical-gray uppercase tracking-wide mb-1.5">
                Key Deliverables
              </p>
              <div className="flex flex-wrap gap-1">
                {useCase.deliverables.slice(0, 2).map((deliverable, idx) => (
                  <Badge key={idx} variant="secondary" className="text-[10px]">
                    {deliverable.length > 20 ? `${deliverable.substring(0, 20)}...` : deliverable}
                  </Badge>
                ))}
                {useCase.deliverables.length > 2 && (
                  <Badge variant="secondary" className="text-[10px]">
                    +{useCase.deliverables.length - 2} more
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2 border-t">
            <Button
              size="sm"
              variant="default"
              onClick={onExecute}
              className="flex-1 text-xs h-8 group-hover:shadow-md transition-shadow"
            >
              <Play className="mr-1 h-3 w-3" />
              Execute
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={onConfigure}
              className="h-8 px-3 group-hover:shadow-md transition-shadow"
            >
              <Settings className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


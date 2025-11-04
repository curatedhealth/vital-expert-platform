/**
 * Sources Component
 * Displays source documents and regulations with reliability indicators
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Shield,
  FileText,
  Calendar,
  Building,
  Star,
  Lock,
  Globe,
  BookOpen
} from 'lucide-react';
import React, { useState } from 'react';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import {
  Collapsible,
  CollapsibleTrigger
} from '@/shared/components/ui/collapsible';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';
import type { Source } from '@/types/chat.types';

interface SourcesProps {
  sources: Source[];
  className?: string;
  maxInitialShow?: number;
}

  'fda-guidance': {
    icon: Shield,
    label: 'FDA Guidance',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    priority: 1
  },
  'clinical-study': {
    icon: FileText,
    label: 'Clinical Study',
    color: 'bg-green-100 text-green-800 border-green-300',
    priority: 2
  },
  'regulatory-doc': {
    icon: Shield,
    label: 'Regulatory Document',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    priority: 1
  },
  'guideline': {
    icon: BookOpen,
    label: 'Guideline',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    priority: 2
  },
  'white-paper': {
    icon: FileText,
    label: 'White Paper',
    color: 'bg-gray-100 text-gray-800 border-gray-300',
    priority: 3
  }
} as const;

const AccessLevelIcon: React.FC<{ level?: string }> = ({ level }) => {
  if (level === 'public') return <Globe className="h-3 w-3 text-green-600" />;
  if (level === 'restricted') return <Lock className="h-3 w-3 text-yellow-600" />;
  if (level === 'subscription') return <Star className="h-3 w-3 text-blue-600" />;
  return null;
};

const ReliabilityIndicator: React.FC<{ reliability: number }> = ({ reliability }) => {

    if (score >= 90) return 'text-green-600';
    if (score >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

    if (score >= 90) return 'High';
    if (score >= 70) return 'Medium';
    return 'Low';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center gap-2">
            <div className="w-12 h-1.5 bg-muted rounded-full overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full",
                  percentage >= 90 ? "bg-green-500" :
                  percentage >= 70 ? "bg-yellow-500" : "bg-red-500"
                )}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.5, ease: "easeOut" }}
              />
            </div>
            <span className={cn("text-xs font-medium", getColor(percentage))}>
              {percentage}%
            </span>
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getLabel(percentage)} reliability ({percentage}%)</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const SourceItem: React.FC<{
  source: Source;
  showReliability?: boolean;
}> = ({ source, showReliability = true }) => {

    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

    if (source.url) {
      window.open(source.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <div className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center",
              config.color.replace('text-', 'bg-').replace('border-', '').replace('100', '50')
            )}>
              <SourceIcon className="h-4 w-4" />
            </div>
          </div>

          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-medium text-sm leading-tight line-clamp-2">
                  {source.title}
                </h4>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <AccessLevelIcon level={source.accessLevel} />

                  {source.url && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleSourceClick}
                      className="h-6 w-6 p-0"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>

              {source.description && (
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {source.description}
                </p>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className={cn("text-xs", config.color)}>
                <SourceIcon className="h-3 w-3 mr-1" />
                {config.label}
              </Badge>

              {source.organization && (
                <Badge variant="secondary" className="text-xs">
                  <Building className="h-3 w-3 mr-1" />
                  {source.organization}
                </Badge>
              )}

              {source.lastUpdated && (
                <Badge variant="outline" className="text-xs text-muted-foreground">
                  <Calendar className="h-3 w-3 mr-1" />
                  {formatDate(source.lastUpdated)}
                </Badge>
              )}
            </div>

            {showReliability && (
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Source reliability:
                </span>
                <ReliabilityIndicator reliability={source.reliability} />
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Sources: React.FC<SourcesProps> = ({
  sources,
  className,
  maxInitialShow = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!sources || sources.length === 0) {
    return null;
  }

  // Sort sources by priority (regulatory docs first) and reliability

    // First sort by priority (lower number = higher priority)
    if (configA.priority !== configB.priority) {
      return configA.priority - configB.priority;
    }

    // Then sort by reliability (higher is better)
    return b.reliability - a.reliability;
  });

  // Calculate overall reliability

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Shield className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">
            Sources ({sources.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            Avg. reliability:
          </span>
          <ReliabilityIndicator reliability={averageReliability} />
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {visibleSources.map((source, index) => (
            <motion.div
              key={source.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2, delay: index * 0.05 }}
            >
              <SourceItem source={source} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
          <CollapsibleTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="w-full h-8 text-xs text-muted-foreground hover:text-foreground"
            >
              {isExpanded ? (
                <>
                  <ChevronUp className="h-3 w-3 mr-1" />
                  Show less
                </>
              ) : (
                <>
                  <ChevronDown className="h-3 w-3 mr-1" />
                  Show {sources.length - maxInitialShow} more sources
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      )}
    </div>
  );
};
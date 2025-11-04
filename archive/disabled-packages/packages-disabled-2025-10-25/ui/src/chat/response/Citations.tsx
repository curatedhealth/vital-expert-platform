/**
 * Citations Component
 * Displays academic citations with medical journal formatting
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  ChevronUp,
  ExternalLink,
  BookOpen,
  Star,
  Award,
  Copy,
  Check
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
import type { Citation } from '@/types/chat.types';

interface CitationsProps {
  citations: Citation[];
  className?: string;
  showNumbered?: boolean;
  maxInitialShow?: number;
}

const EvidenceLevelBadge: React.FC<{ level?: string }> = ({ level }) => {
  if (!level) return null;

    'A': { color: 'bg-green-100 text-green-800 border-green-300', label: 'High Quality' },
    'B': { color: 'bg-blue-100 text-blue-800 border-blue-300', label: 'Moderate Quality' },
    'C': { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', label: 'Low Quality' },
    'D': { color: 'bg-gray-100 text-gray-800 border-gray-300', label: 'Very Low Quality' }
  };

  if (!config) return null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("text-xs", config.color)}>
            Evidence {level}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label} Evidence</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const ImpactFactorBadge: React.FC<{ impactFactor?: number }> = ({ impactFactor }) => {
  if (!impactFactor) return null;

    if (factor >= 10) return 'bg-purple-100 text-purple-800 border-purple-300';
    if (factor >= 5) return 'bg-blue-100 text-blue-800 border-blue-300';
    if (factor >= 2) return 'bg-green-100 text-green-800 border-green-300';
    return 'bg-gray-100 text-gray-800 border-gray-300';
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn("text-xs", getImpactColor(impactFactor))}>
            <Award className="h-3 w-3 mr-1" />
            IF {impactFactor.toFixed(1)}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p>Journal Impact Factor: {impactFactor}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CitationItem: React.FC<{
  citation: Citation;
  showNumber?: boolean;
  onCopy?: (text: string) => void;
}> = ({ citation, showNumber = true, onCopy }) => {
  const [copied, setCopied] = useState(false);

    return `${authors}. ${citation.title}.${journal}${year}`;
  };

    onCopy?.(formattedCitation);
    navigator.clipboard.writeText(formattedCitation);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

    if (citation.url) {
      window.open(citation.url, '_blank', 'noopener,noreferrer');
    } else if (citation.pubmedId) {
      window.open(`https://pubmed.ncbi.nlm.nih.gov/${citation.pubmedId}`, '_blank', 'noopener,noreferrer');
    } else if (citation.doi) {
      window.open(`https://doi.org/${citation.doi}`, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <Card className="transition-all duration-200 hover:shadow-md">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          {showNumber && (
            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
              {citation.number}
            </div>
          )}

          <div className="flex-1 space-y-2">
            <div className="space-y-1">
              <h4 className="font-medium text-sm leading-tight">
                {citation.title}
              </h4>

              {citation.authors.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {citation.authors.join(', ')}
                </p>
              )}

              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                {citation.journal && (
                  <span className="font-medium">{citation.journal}</span>
                )}
                {citation.year && (
                  <span>({citation.year})</span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <EvidenceLevelBadge level={citation.evidenceLevel} />
              <ImpactFactorBadge impactFactor={citation.impactFactor} />

              {citation.studyType && (
                <Badge variant="secondary" className="text-xs">
                  {citation.studyType}
                </Badge>
              )}

              {citation.relevanceScore && (
                <Badge variant="outline" className="text-xs">
                  <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
                  {Math.round(citation.relevanceScore * 100)}% relevant
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-8 w-8 p-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {copied ? 'Copied!' : 'Copy citation'}
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {hasExternalLink && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleExternalLink}
                      className="h-8 w-8 p-0"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>View source</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const Citations: React.FC<CitationsProps> = ({
  citations,
  className,
  showNumbered = true,
  maxInitialShow = 3
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedAll, setCopiedAll] = useState(false);

  if (!citations || citations.length === 0) {
    return null;
  }

      return `${index + 1}. ${authors}. ${citation.title}.${journal}${year}`;
    }).join('\n\n');

    navigator.clipboard.writeText(allCitations);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  return (
    <div className={cn('space-y-3', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <h3 className="font-medium text-sm">
            References ({citations.length})
          </h3>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleCopyAll}
                  className="h-8 text-xs"
                >
                  {copiedAll ? (
                    <>
                      <Check className="h-3 w-3 mr-1 text-green-600" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy all
                    </>
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Copy all citations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div className="space-y-2">
        <AnimatePresence>
          {visibleCitations.map((citation) => (
            <motion.div
              key={citation.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <CitationItem
                citation={citation}
                showNumber={showNumbered}
              />
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
                  Show {citations.length - maxInitialShow} more references
                </>
              )}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
      )}
    </div>
  );
};
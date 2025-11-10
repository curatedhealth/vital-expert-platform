/**
 * Clean Template Card Component
 * Matches the exact design of the Ask Panel grid view
 */

'use client';

import React from 'react';
import { ArrowRight, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PanelTemplate } from '@/types/panel.types';

interface CleanTemplateCardProps {
  template: PanelTemplate;
  onRun: (template: PanelTemplate) => void;
  onViewDetails?: (template: PanelTemplate) => void;
}

export function CleanTemplateCard({ template, onRun, onViewDetails }: CleanTemplateCardProps) {
  // Map panel type to icon style
  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      structured: '👥',
      open: '🔓',
      socratic: '💭',
      adversarial: '⚖️',
      delphi: '🎯',
      hybrid: '⚡',
    };
    return icons[type] || '📋';
  };

  return (
    <Card
      className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800"
      onClick={() => onViewDetails?.(template)}
    >
      <CardContent className="p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl" role="img" aria-label={template.panelType}>
              {getTypeIcon(template.panelType)}
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">
                {template.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {template.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {template.category}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {template.panelType}
          </Badge>
          <Badge variant="outline" className="text-xs">
            <Users className="w-3 h-3 mr-1" />
            {template.optimalExperts} experts
          </Badge>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(template);
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Click to view details
          </button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onRun(template);
            }}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            Run Panel
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

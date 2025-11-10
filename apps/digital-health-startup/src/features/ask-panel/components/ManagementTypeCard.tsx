/**
 * Clean Management Type Card Component
 * Matches the design aesthetic of the main Ask Panel view
 */

'use client';

import React from 'react';
import { ArrowRight, Users, Bot } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import type { PanelManagementPattern } from '@/types/panel.types';

interface ManagementTypeCardProps {
  pattern: PanelManagementPattern;
  onSelect: () => void;
  onLearnMore: () => void;
}

export function ManagementTypeCard({ pattern, onSelect, onLearnMore }: ManagementTypeCardProps) {
  const Icon = pattern.icon;

  return (
    <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer bg-white dark:bg-gray-800">
      <CardContent className="p-6">
        {/* Header with Icon and Title */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${pattern.gradient} flex items-center justify-center`}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">
                {pattern.name}
              </h3>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
          {pattern.tagline}
        </p>

        {/* Configuration Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          <Badge variant="secondary" className="text-xs">
            {pattern.pricing.tier}
          </Badge>
          <Badge variant="outline" className="text-xs capitalize">
            {pattern.configuration.aiOrchestration} AI
          </Badge>
          {pattern.configuration.humanModerator && (
            <Badge variant="outline" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              Moderator
            </Badge>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onLearnMore();
            }}
            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            Click to view details
          </button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            variant="ghost"
            size="sm"
            className="text-purple-600 hover:text-purple-700 hover:bg-purple-50 dark:hover:bg-purple-900/20"
          >
            Select
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

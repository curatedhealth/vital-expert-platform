'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Zap, User, Settings } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Agent } from '@/types/agent.types';

interface ChatHeaderProps {
  selectedAgent: Agent | null;
  interactionMode: 'automatic' | 'manual';
  autonomousMode: boolean;
  onToggleMode?: (mode: 'automatic' | 'manual') => void;
  onToggleAutonomous?: (enabled: boolean) => void;
  onChangeAgent?: () => void;
  className?: string;
}

export function ChatHeader({
  selectedAgent,
  interactionMode,
  autonomousMode,
  onToggleMode,
  onToggleAutonomous,
  onChangeAgent,
  className
}: ChatHeaderProps) {
  return (
    <div className={cn("p-4 border-b border-gray-200 bg-white", className)}>
      <div className="flex items-center justify-between max-w-4xl mx-auto">
        {/* Left: Agent Info */}
        <div className="flex items-center space-x-3">
          {selectedAgent ? (
            <>
              <Avatar className="h-10 w-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white">
                  {(selectedAgent.display_name || selectedAgent.name || 'A')[0]}
                </AvatarFallback>
              </Avatar>
              <div>
                <h4 className="font-medium">
                  {selectedAgent.display_name || selectedAgent.name}
                </h4>
                <p className="text-sm text-gray-600 line-clamp-1">
                  {selectedAgent.description}
                </p>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                <span className="text-gray-500 text-lg">🤖</span>
              </div>
              <div>
                <h4 className="font-medium text-gray-600">
                  {interactionMode === 'automatic' ? 'AI Orchestrator' : 'No Agent Selected'}
                </h4>
                <p className="text-sm text-gray-500">
                  {interactionMode === 'automatic' 
                    ? 'Automatically selecting expert agents' 
                    : 'Please select an agent to continue'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right: Mode Indicators & Actions */}
        <div className="flex items-center gap-2">
          {/* Interaction Mode Badge */}
          <Badge
            variant={interactionMode === 'automatic' ? 'default' : 'secondary'}
            className="flex items-center gap-1"
          >
            {interactionMode === 'automatic' ? (
              <>
                <Zap className="h-3 w-3" />
                Auto
              </>
            ) : (
              <>
                <User className="h-3 w-3" />
                Manual
              </>
            )}
          </Badge>

          {/* Autonomous Mode Badge */}
          {autonomousMode && (
            <Badge variant="outline" className="flex items-center gap-1">
              <Zap className="h-3 w-3 text-blue-500" />
              Autonomous
            </Badge>
          )}

          {/* Change Agent Button (Manual Mode) */}
          {interactionMode === 'manual' && selectedAgent && onChangeAgent && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onChangeAgent}
              className="text-sm"
            >
              Change Agent
            </Button>
          )}

          {/* Settings Button */}
          <Button variant="ghost" size="icon">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

/**
 * Workspace Selector Component
 * Contextual workspace switcher for stakeholder-scoped conversations
 */

'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronDown,
  Plus,
  Settings,
  Users,
  Activity,
  TrendingUp,
  MessageSquare,
  Clock,
  CheckCircle
} from 'lucide-react';
import React, { useState } from 'react';

import { type Workspace, type WorkspaceType } from '@/hooks/useWorkspaceManager';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

interface WorkspaceSelectorProps {
  workspaces: Workspace[];
  currentWorkspace: Workspace | null;
  onWorkspaceSelect: (workspaceId: string) => void;
  onCreateWorkspace?: () => void;
  conversations?: unknown[];
  activeConversationId?: string | null;
  onConversationSelect?: (conversationId: string) => void;
  onNewConversation?: () => void;
  className?: string;
}

const workspaceIcons: Record<WorkspaceType, string> = {
  'pharma': '💊',
  'payer': '💰',
  'provider': '🏥',
  'dtx-startup': '🚀',
  'general': '🔬'
};

const workspaceColors: Record<WorkspaceType, string> = {
  'pharma': 'bg-blue-500',
  'payer': 'bg-green-500',
  'provider': 'bg-purple-500',
  'dtx-startup': 'bg-orange-500',
  'general': 'bg-neutral-500'
};

export const WorkspaceSelector: React.FC<WorkspaceSelectorProps> = ({
  workspaces,
  currentWorkspace,
  onWorkspaceSelect,
  onCreateWorkspace,
  conversations = [],
  activeConversationId,
  onConversationSelect,
  onNewConversation,
  className = ''
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const formatNumber = (num: number) => {
    if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
    return num.toString();
  };

  const getWorkspaceStatus = (hasActiveConversations: boolean, recentActivity: boolean) => {
    if (hasActiveConversations && recentActivity) return 'active';
    if (hasActiveConversations) return 'idle';
    return 'ready';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-500';
      case 'idle': return 'text-yellow-500';
      case 'ready': return 'text-neutral-400';
      default: return 'text-neutral-400';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Activity className="h-3 w-3" />;
      case 'idle': return <Clock className="h-3 w-3" />;
      case 'ready': return <CheckCircle className="h-3 w-3" />;
      default: return <CheckCircle className="h-3 w-3" />;
    }
  };

  return (
    <div className={`${className}`}>
      {/* Current Workspace Display */}
      <div className="mb-4">
        <Button
          variant="outline"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full justify-between h-auto p-3 hover:bg-muted/50 transition-all duration-200"
        >
          <div className="flex items-center gap-3">
            <div className={`w-6 h-6 rounded-lg ${currentWorkspace ? workspaceColors[currentWorkspace.type] : 'bg-neutral-500'} flex items-center justify-center text-white text-xs font-medium`}>
              {currentWorkspace ? workspaceIcons[currentWorkspace.type] : '🔬'}
            </div>
            <div className="text-left">
              <div className="font-medium text-sm">
                {currentWorkspace?.name || 'Select workspace'}
              </div>
            </div>
          </div>
          <motion.div
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronDown className="h-3 w-3 text-muted-foreground" />
          </motion.div>
        </Button>
      </div>

      {/* Conversations in Current Workspace */}
      {currentWorkspace && (
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-medium text-muted-foreground">CONVERSATIONS</h3>
            {onNewConversation && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNewConversation}
                className="h-6 px-2 text-xs"
              >
                <Plus className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div className="space-y-1">
            {conversations.length === 0 ? (
              <div className="text-xs text-muted-foreground py-2">No conversations yet</div>
            ) : (
              conversations.slice(0, 5).map((conv: unknown) => (
                <Button
                  key={conv.id}
                  variant="ghost"
                  size="sm"
                  onClick={() => onConversationSelect?.(conv.id)}
                  className={`w-full justify-start text-xs h-8 font-normal ${
                    activeConversationId === conv.id ? 'bg-muted' : ''
                  }`}
                >
                  <span className="truncate">{conv.title}</span>
                </Button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Workspace Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full left-0 right-0 z-50 mt-2"
          >
            <Card className="border shadow-lg">
              <CardContent className="p-0">
                {/* Header */}
                <div className="p-4 border-b">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">Workspaces</h3>
                    {onCreateWorkspace && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          onCreateWorkspace();
                          setIsOpen(false);
                        }}
                        className="h-7 px-2 text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        New
                      </Button>
                    )}
                  </div>
                </div>

                {/* Workspace List */}
                <div className="max-h-80 overflow-y-auto">
                  {workspaces.map((workspace) => {

                    return (
                      <motion.div
                        key={workspace.id}
                        whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                        className={`p-3 cursor-pointer transition-colors ${
                          isActive ? 'bg-primary/5 border-r-2 border-r-primary' : ''
                        }`}
                        onClick={() => {
                          onWorkspaceSelect(workspace.id);
                          setIsOpen(false);
                        }}
                      >
                        <div className="flex items-start gap-3">
                          {/* Workspace Icon */}
                          <div className={`w-10 h-10 rounded-lg ${workspaceColors[workspace.type]} flex items-center justify-center text-white text-lg flex-shrink-0`}>
                            {workspaceIcons[workspace.type]}
                          </div>

                          {/* Workspace Details */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="font-medium text-sm truncate">
                                {workspace.name}
                              </h4>
                              <div className={`flex items-center gap-1 ${getStatusColor(status)}`}>
                                {getStatusIcon(status)}
                                <span className="text-xs capitalize">{status}</span>
                              </div>
                            </div>

                            <p className="text-xs text-muted-foreground mb-2 line-clamp-2">
                              {workspace.description}
                            </p>

                            {/* Workspace Stats */}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{formatNumber(workspace.metadata?.totalConversations || 0)}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                <span>{workspace.defaultAgents.length}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <TrendingUp className="h-3 w-3" />
                                <span>{workspace.metadata?.avgResponseTime || 0}ms</span>
                              </div>
                            </div>

                            {/* Workspace Type Badge */}
                            <div className="mt-2">
                              <Badge variant="secondary" className="text-xs">
                                {workspace.type.replace('-', ' ')}
                              </Badge>
                            </div>
                          </div>
                        </div>

                        {/* Primary Topics */}
                        {workspace.metadata?.primaryTopics && workspace.metadata.primaryTopics.length > 0 && (
                          <div className="mt-2 pl-13">
                            <div className="flex flex-wrap gap-1">
                              {workspace.metadata.primaryTopics.slice(0, 3).map((topic: string, index: number) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5 h-auto"
                                >
                                  {topic}
                                </Badge>
                              ))}
                              {workspace.metadata.primaryTopics.length > 3 && (
                                <Badge
                                  variant="outline"
                                  className="text-xs px-1.5 py-0.5 h-auto text-muted-foreground"
                                >
                                  +{workspace.metadata.primaryTopics.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </div>

                {/* Footer */}
                <Separator />
                <div className="p-3">
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>{workspaces.length} workspaces</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-xs"
                    >
                      <Settings className="h-3 w-3 mr-1" />
                      Manage
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
          onKeyDown={() => setIsOpen(false)}
          role="button"
          tabIndex={0}
        />
      )}
    </div>
  );
};

export default WorkspaceSelector;
/**
 * Real-time Collaboration Component
 * Shows active users, typing indicators, and live collaboration features
 */

import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Wifi,
  WifiOff,
  Eye,
  MessageSquare,
  Clock,
  Zap,
  Circle,
  Activity
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from '@/shared/components/ui/tooltip';
import { cn } from '@/shared/services/utils';

import { webSocketService, type CollaborativeUser } from '../../../services/websocket-service';

interface RealtimeCollaborationProps {
  className?: string;
  conversationId: string;
  currentUserId: string;
  showCompactView?: boolean;
}

const UserStatusIndicator: React.FC<{
  status: CollaborativeUser['status'];
  className?: string;
}> = ({ status, className }) => {
  const statusConfig = {
    online: { color: 'bg-green-500', pulse: false, label: 'Online' },
    typing: { color: 'bg-blue-500', pulse: true, label: 'Typing...' },
    idle: { color: 'bg-yellow-500', pulse: false, label: 'Idle' }
  };

  // Validate status to prevent object injection
  const validStatuses = ['online', 'typing', 'idle'] as const;
  if (!validStatuses.includes(status as unknown)) {
    return null;
  }
  const config = statusConfig[status as keyof typeof statusConfig];

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={cn('relative', className)}>
            <div
              className={cn(
                'w-3 h-3 rounded-full',
                config.color,
                config.pulse && 'animate-pulse'
              )}
            />
            {status === 'typing' && (
              <motion.div
                className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
            )}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{config.label}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const CollaborativeUserCard: React.FC<{
  user: CollaborativeUser;
  isCurrentUser: boolean;
}> = ({ user, isCurrentUser }) => {

    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;

    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        'flex items-center gap-3 p-2 rounded-lg transition-colors',
        isCurrentUser ? 'bg-blue-50 dark:bg-blue-900/20' : 'hover:bg-muted/50'
      )}
    >
      <div className="relative">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
          {user.avatar && (
            <AvatarImage src={user.avatar} alt={user.name} />
          )}
        </Avatar>
        <UserStatusIndicator
          status={user.status}
          className="absolute -bottom-0.5 -right-0.5"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {user.name}
            {isCurrentUser && (
              <span className="ml-1 text-xs text-muted-foreground">(You)</span>
            )}
          </p>
          {user.status === 'typing' && (
            <Badge variant="secondary" className="text-xs px-1 py-0">
              <MessageSquare className="h-3 w-3 mr-1" />
              Typing
            </Badge>
          )}
        </div>

        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <Clock className="h-3 w-3" />
          {formatLastSeen(user.lastSeen)}
        </p>
      </div>
    </motion.div>
  );
};

const ConnectionStatus: React.FC<{
  status: 'connected' | 'connecting' | 'disconnected';
  userCount: number;
}> = ({ status, userCount }) => {
  const statusConfig = {
    connected: {
      icon: Wifi,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      label: 'Connected'
    },
    connecting: {
      icon: Activity,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100 dark:bg-yellow-900/20',
      label: 'Connecting...'
    },
    disconnected: {
      icon: WifiOff,
      color: 'text-red-600',
      bgColor: 'bg-red-100 dark:bg-red-900/20',
      label: 'Disconnected'
    }
  };

  // Validate status to prevent object injection
  const validStatuses = ['connected', 'connecting', 'disconnected'] as const;
  if (!validStatuses.includes(status as unknown)) {
    return null;
  }
  const config = statusConfig[status as keyof typeof statusConfig];
  const StatusIcon = config.icon;

  return (
    <div className={cn('flex items-center gap-2 p-2 rounded-lg', config.bgColor)}>
      <StatusIcon className={cn('h-4 w-4', config.color)} />
      <span className={cn('text-sm font-medium', config.color)}>
        {config.label}
      </span>
      {status === 'connected' && userCount > 0 && (
        <Badge variant="outline" className="ml-auto text-xs">
          {userCount} user{userCount !== 1 ? 's' : ''}
        </Badge>
      )}
    </div>
  );
};

export const RealtimeCollaboration: React.FC<RealtimeCollaborationProps> = ({
  className,
  conversationId,
  currentUserId,
  showCompactView = false
}) => {
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'connecting' | 'disconnected'>('disconnected');
  const [activeUsers, setActiveUsers] = useState<CollaborativeUser[]>([]);
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set());

  // Initialize WebSocket connection
  useEffect(() => {

      setConnectionStatus(data.status);
    };

      setActiveUsers(prev => {

        if (existing) return prev;

        return [...prev, {
          id: data.userId,
          name: data.userInfo.name,
          avatar: data.userInfo.avatar,
          status: 'online',
          lastSeen: new Date()
        }];
      });
    };

      setActiveUsers(prev => prev.filter(u => u.id !== data.userId));
    };

      setTypingUsers(prev => new Set([...prev, data.userId]));
      setActiveUsers(prev => prev.map(user =>
        user.id === data.userId
          ? { ...user, status: 'typing' as const }
          : user
      ));
    };

      setTypingUsers(prev => {

        updated.delete(data.userId);
        return updated;
      });
      setActiveUsers(prev => prev.map(user =>
        user.id === data.userId
          ? { ...user, status: 'online' as const }
          : user
      ));
    };

    // Register event listeners
    webSocketService.on('connection_status', handleConnectionStatus);
    webSocketService.on('user_joined', handleUserJoined);
    webSocketService.on('user_left', handleUserLeft);
    webSocketService.on('typing_start', handleTypingStart);
    webSocketService.on('typing_stop', handleTypingStop);

    // Connect to WebSocket
    webSocketService.connect(conversationId);

    return () => {
      // Cleanup listeners
      webSocketService.off('connection_status', handleConnectionStatus);
      webSocketService.off('user_joined', handleUserJoined);
      webSocketService.off('user_left', handleUserLeft);
      webSocketService.off('typing_start', handleTypingStart);
      webSocketService.off('typing_stop', handleTypingStop);
    };
  }, [conversationId]);

  // Compact view for mobile/small spaces
  if (showCompactView) {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        <div className="flex items-center -space-x-2">
          {activeUsers.slice(0, 3).map((user) => (
            <Avatar key={user.id} className="h-6 w-6 border-2 border-background">
              <AvatarFallback className="text-xs">
                {user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </AvatarFallback>
              {user.avatar && (
                <AvatarImage src={user.avatar} alt={user.name} />
              )}
            </Avatar>
          ))}
          {activeUsers.length > 3 && (
            <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
              <span className="text-xs font-medium">+{activeUsers.length - 3}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1">
          {connectionStatus === 'connected' ? (
            <Wifi className="h-3 w-3 text-green-600" />
          ) : (
            <WifiOff className="h-3 w-3 text-red-600" />
          )}
        </div>

        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-1"
          >
            <motion.div
              className="flex gap-1"
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <Circle className="h-1 w-1 fill-current" />
              <Circle className="h-1 w-1 fill-current" />
              <Circle className="h-1 w-1 fill-current" />
            </motion.div>
          </motion.div>
        )}
      </div>
    );
  }

  // Full collaboration panel
  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <Users className="h-4 w-4" />
          Live Collaboration
        </CardTitle>

        <ConnectionStatus status={connectionStatus} userCount={activeUsers.length} />
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Active Users */}
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
            Active Users ({activeUsers.length})
          </h4>

          <div className="space-y-1 max-h-32 overflow-y-auto">
            <AnimatePresence>
              {activeUsers.map((user) => (
                <CollaborativeUserCard
                  key={user.id}
                  user={user}
                  isCurrentUser={user.id === currentUserId}
                />
              ))}
            </AnimatePresence>
          </div>

          {activeUsers.length === 0 && (
            <div className="text-center py-4 text-muted-foreground">
              <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No other users online</p>
            </div>
          )}
        </div>

        {/* Typing Indicators */}
        {typingUsers.size > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="p-2 bg-muted/30 rounded-lg"
          >
            <div className="flex items-center gap-2">
              <motion.div
                className="flex gap-1"
                animate={{ opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Circle className="h-1 w-1 fill-current text-blue-600" />
                <Circle className="h-1 w-1 fill-current text-blue-600" />
                <Circle className="h-1 w-1 fill-current text-blue-600" />
              </motion.div>
              <span className="text-xs text-muted-foreground">
                {Array.from(typingUsers).map((userId) => {

                  return user ? user.name.split(' ')[0] : 'Someone';
                }).join(', ')} {typingUsers.size === 1 ? 'is' : 'are'} typing...
              </span>
            </div>
          </motion.div>
        )}

        {/* Quick Actions */}
        <div className="pt-2 border-t">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 text-xs"
              onClick={() => {
                // Toggle session recording
              }}
            >
              <Zap className="h-3 w-3 mr-1" />
              Record Session
            </Button>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                    <Eye className="h-3 w-3" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>View collaboration history</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
'use client';

import { 
  Activity, 
  Users, 
  Shield, 
  AlertTriangle,
  RefreshCw,
  Play,
  Pause,
  Circle
} from 'lucide-react';
import React, { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ActivityEvent {
  id: string;
  type: 'auth_attempt' | 'api_request' | 'security_event' | 'rate_limit';
  timestamp: string;
  userId?: string;
  organizationId?: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  method?: string;
  status?: string;
  details?: Record<string, any>;
}

interface LiveActivityFeedProps {
  className?: string;
}

export function LiveActivityFeed({ className = '' }: LiveActivityFeedProps) {
  const [activities, setActivities] = useState<ActivityEvent[]>([]);
  const [isLive, setIsLive] = useState(true);
  const [loading, setLoading] = useState(false);

  // Simulate live activity feed
  useEffect(() => {
    if (!isLive) return;

    const interval = setInterval(() => {
      // In a real implementation, this would connect to a WebSocket or Server-Sent Events
      // For now, we'll simulate some activity
      const newActivity: ActivityEvent = {
        id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        type: ['auth_attempt', 'api_request', 'security_event', 'rate_limit'][Math.floor(Math.random() * 4)] as any,
        timestamp: new Date().toISOString(),
        userId: Math.random() > 0.5 ? `user_${Math.floor(Math.random() * 1000)}` : undefined,
        organizationId: Math.random() > 0.3 ? `org_${Math.floor(Math.random() * 100)}` : undefined,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 255)}`,
        userAgent: Math.random() > 0.3 ? 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' : undefined,
        endpoint: ['/api/agents', '/api/workflows', '/api/analytics', '/api/admin/users'][Math.floor(Math.random() * 4)],
        method: ['GET', 'POST', 'PUT', 'DELETE'][Math.floor(Math.random() * 4)],
        status: Math.random() > 0.1 ? '200' : '401',
        details: Math.random() > 0.5 ? { reason: 'Rate limit exceeded' } : undefined
      };

      setActivities(prev => [newActivity, ...prev.slice(0, 49)]); // Keep last 50 activities
    }, 2000); // Add new activity every 2 seconds

    return () => clearInterval(interval);
  }, [isLive]);

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'auth_attempt': return <Users className="h-4 w-4" />;
      case 'api_request': return <Activity className="h-4 w-4" />;
      case 'security_event': return <Shield className="h-4 w-4" />;
      case 'rate_limit': return <AlertTriangle className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityColor = (type: string, status?: string) => {
    if (type === 'security_event') return 'text-red-500';
    if (type === 'rate_limit') return 'text-orange-500';
    if (status && status.startsWith('4')) return 'text-yellow-500';
    if (status && status.startsWith('5')) return 'text-red-500';
    return 'text-green-500';
  };

  const getStatusBadge = (type: string, status?: string) => {
    if (type === 'security_event') {
      return <Badge variant="destructive" className="text-xs">Security Event</Badge>;
    }
    if (type === 'rate_limit') {
      return <Badge variant="outline" className="text-xs">Rate Limited</Badge>;
    }
    if (status) {
      const variant = status.startsWith('2') ? 'default' : 
                     status.startsWith('4') ? 'secondary' : 'destructive';
      return <Badge variant={variant} className="text-xs">{status}</Badge>;
    }
    return null;
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString();
  };

  const clearActivities = () => {
    setActivities([]);
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Live Activity Feed</span>
              {isLive && (
                <div className="flex items-center space-x-1">
                  <Circle className="h-2 w-2 text-red-500 animate-pulse" />
                  <span className="text-sm text-muted-foreground">LIVE</span>
                </div>
              )}
            </CardTitle>
            <CardDescription>
              Real-time security and system activity monitoring
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <>
                  <Pause className="h-4 w-4 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 mr-2" />
                  Resume
                </>
              )}
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearActivities}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Clear
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {activities.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-muted-foreground">
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2" />
                <p>No activity yet</p>
                <p className="text-sm">Activity will appear here when live</p>
              </div>
            </div>
          ) : (
            activities.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-l-2 border-l-primary/20"
              >
                <div className="flex items-center space-x-3">
                  <div className={`${getActivityColor(activity.type, activity.status)}`}>
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <div className="font-medium text-sm capitalize">
                      {activity.type.replace('_', ' ')}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {activity.ipAddress}
                      {activity.endpoint && ` • ${activity.method} ${activity.endpoint}`}
                      {activity.userId && ` • User: ${activity.userId}`}
                    </div>
                    {activity.details && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {JSON.stringify(activity.details)}
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  {getStatusBadge(activity.type, activity.status)}
                  <span className="text-xs text-muted-foreground">
                    {formatTime(activity.timestamp)}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

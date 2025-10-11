'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  Ban, 
  Users, 
  Globe, 
  Activity, 
  Eye,
  Clock
} from 'lucide-react';

interface ThreatEvent {
  id: string;
  type: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  timestamp: string;
  ipAddress: string;
  userAgent?: string;
  endpoint?: string;
  resolved: boolean;
  falsePositive: boolean;
}

interface ThreatTimelineProps {
  threats: ThreatEvent[];
  className?: string;
}

export function ThreatTimeline({ threats, className = '' }: ThreatTimelineProps) {
  const getThreatIcon = (type: string) => {
    switch (type) {
      case 'brute_force': return <Ban className="h-4 w-4" />;
      case 'sql_injection': return <AlertTriangle className="h-4 w-4" />;
      case 'credential_stuffing': return <Users className="h-4 w-4" />;
      case 'unusual_access': return <Eye className="h-4 w-4" />;
      case 'geographic_anomaly': return <Globe className="h-4 w-4" />;
      case 'rate_limit_abuse': return <Activity className="h-4 w-4" />;
      default: return <AlertTriangle className="h-4 w-4" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive';
      case 'high': return 'destructive';
      case 'medium': return 'default';
      case 'low': return 'secondary';
      default: return 'secondary';
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  const getThreatTypeDisplay = (type: string) => {
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Group threats by hour for timeline visualization
  const groupedThreats = threats.reduce((acc, threat) => {
    const date = new Date(threat.timestamp);
    const hour = date.getHours();
    const key = `${date.toDateString()} ${hour}:00`;
    
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(threat);
    return acc;
  }, {} as Record<string, ThreatEvent[]>);

  const timelineEntries = Object.entries(groupedThreats)
    .sort(([a], [b]) => new Date(b).getTime() - new Date(a).getTime())
    .slice(0, 12); // Show last 12 hours

  if (threats.length === 0) {
    return (
      <div className="flex items-center justify-center h-32 text-muted-foreground">
        <div className="text-center">
          <Clock className="h-8 w-8 mx-auto mb-2" />
          <p>No recent threats</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {timelineEntries.map(([timeKey, hourThreats]) => (
        <div key={timeKey} className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-primary rounded-full"></div>
            <span className="text-sm font-medium text-muted-foreground">
              {timeKey}
            </span>
            <Badge variant="outline" className="text-xs">
              {hourThreats.length} threat{hourThreats.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          
          <div className="ml-4 space-y-2">
            {hourThreats.map((threat) => (
              <div
                key={threat.id}
                className="flex items-center justify-between p-3 bg-muted/30 rounded-lg border-l-2 border-l-primary/20"
              >
                <div className="flex items-center space-x-3">
                  <div className="text-muted-foreground">
                    {getThreatIcon(threat.type)}
                  </div>
                  <div>
                    <div className="font-medium text-sm">
                      {getThreatTypeDisplay(threat.type)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {threat.ipAddress}
                      {threat.endpoint && ` • ${threat.endpoint}`}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Badge variant={getSeverityColor(threat.severity)} className="text-xs">
                    {threat.severity}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatTime(threat.timestamp)}
                  </span>
                  {threat.resolved && (
                    <Badge variant="secondary" className="text-xs">
                      Resolved
                    </Badge>
                  )}
                  {threat.falsePositive && (
                    <Badge variant="outline" className="text-xs">
                      False Positive
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

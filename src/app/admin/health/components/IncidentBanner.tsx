'use client';

import { format } from 'date-fns';
import { AlertTriangle } from 'lucide-react';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Incident } from '@/services/health-monitoring.service';

interface IncidentBannerProps {
  incidents: Incident[];
}

export default function IncidentBanner({ incidents }: IncidentBannerProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500';
      case 'high':
        return 'bg-orange-500';
      case 'medium':
        return 'bg-yellow-500';
      case 'low':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'text-red-600';
      case 'investigating':
        return 'text-yellow-600';
      case 'resolved':
        return 'text-green-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatDuration = (startedAt: Date, resolvedAt?: Date) => {
    const end = resolvedAt || new Date();
    const diffMs = end.getTime() - startedAt.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours > 0) {
      return `${diffHours}h ${diffMinutes}m`;
    }
    return `${diffMinutes}m`;
  };

  if (incidents.length === 0) {
    return null;
  }

  const activeIncidents = incidents.filter(inc => inc.status === 'active');
  const investigatingIncidents = incidents.filter(inc => inc.status === 'investigating');

  return (
    <div className="space-y-2">
      {activeIncidents.length > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {activeIncidents.length} Active Incident{activeIncidents.length > 1 ? 's' : ''}
              </span>
              <Badge variant="destructive" className="text-xs">
                CRITICAL
              </Badge>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Active Incidents</DialogTitle>
                  <DialogDescription>
                    Current incidents affecting system availability
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[600px]">
                  <div className="space-y-4">
                    {activeIncidents.map((incident) => (
                      <div key={incident.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{incident.title}</h3>
                            <Badge 
                              variant="destructive"
                              className="text-xs"
                            >
                              {incident.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(incident.startedAt, 'MMM dd, HH:mm')}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {incident.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration: </span>
                            <span className="font-medium">
                              {formatDuration(incident.startedAt, incident.resolvedAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Services: </span>
                            <span className="font-medium">
                              {incident.services.length} affected
                            </span>
                          </div>
                          {incident.assignee && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Assignee: </span>
                              <span className="font-medium">{incident.assignee}</span>
                            </div>
                          )}
                        </div>
                        
                        {incident.services.length > 0 && (
                          <div className="mt-3">
                            <span className="text-sm text-muted-foreground">Affected Services:</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {incident.services.map((service, index) => (
                                <Badge key={index} variant="outline" className="text-xs">
                                  {service}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      )}

      {investigatingIncidents.length > 0 && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {investigatingIncidents.length} Incident{investigatingIncidents.length > 1 ? 's' : ''} Under Investigation
              </span>
              <Badge variant="secondary" className="text-xs">
                INVESTIGATING
              </Badge>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  View Details
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl">
                <DialogHeader>
                  <DialogTitle>Incidents Under Investigation</DialogTitle>
                  <DialogDescription>
                    Incidents currently being investigated by the team
                  </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[600px]">
                  <div className="space-y-4">
                    {investigatingIncidents.map((incident) => (
                      <div key={incident.id} className="border rounded-lg p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <h3 className="font-medium">{incident.title}</h3>
                            <Badge 
                              variant="secondary"
                              className="text-xs"
                            >
                              {incident.severity.toUpperCase()}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {format(incident.startedAt, 'MMM dd, HH:mm')}
                          </div>
                        </div>
                        
                        <p className="text-sm text-muted-foreground mb-3">
                          {incident.description}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Duration: </span>
                            <span className="font-medium">
                              {formatDuration(incident.startedAt, incident.resolvedAt)}
                            </span>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Services: </span>
                            <span className="font-medium">
                              {incident.services.length} affected
                            </span>
                          </div>
                          {incident.assignee && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">Assignee: </span>
                              <span className="font-medium">{incident.assignee}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Activity, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  RefreshCw,
  Eye,
  TrendingUp
} from 'lucide-react';
import { format } from 'date-fns';
import { HealthStatus } from '@/services/health-monitoring.service';

interface ServiceHealthCardProps {
  service: HealthStatus;
  onRefresh: () => void;
}

export default function ServiceHealthCard({
  service,
  onRefresh
}: ServiceHealthCardProps) {
  const [isOpen, setIsOpen] = useState(false);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'degraded':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'unhealthy':
        return <XCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Activity className="h-5 w-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      healthy: 'default',
      degraded: 'secondary',
      unhealthy: 'destructive',
      unknown: 'outline'
    } as const;

    return (
      <Badge variant={variants[status as keyof typeof variants] || 'outline'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-600';
    if (latency < 500) return 'text-yellow-600';
    return 'text-red-600';
  };

  const formatServiceName = (serviceName: string) => {
    return serviceName
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <>
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              {getStatusIcon(service.status)}
              {formatServiceName(service.service)}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge(service.status)}
              <Button
                variant="ghost"
                size="sm"
                onClick={onRefresh}
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Latency</span>
            <span className={`font-medium ${getLatencyColor(service.latency)}`}>
              {service.latency}ms
            </span>
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Last Check</span>
            <span className="font-medium">
              {format(service.timestamp, 'HH:mm:ss')}
            </span>
          </div>

          {service.dependencies.length > 0 && (
            <div className="text-sm">
              <span className="text-muted-foreground">Dependencies: </span>
              <span className="font-medium">
                {service.dependencies.length}
              </span>
            </div>
          )}

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" className="w-full">
                <Eye className="h-4 w-4 mr-2" />
                View Details
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {getStatusIcon(service.status)}
                  {formatServiceName(service.service)} - Health Details
                </DialogTitle>
                <DialogDescription>
                  Detailed health information and metrics for {service.service}
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[600px]">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium">Status</label>
                      <p className="text-sm text-muted-foreground">
                        {getStatusBadge(service.status)}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Latency</label>
                      <p className={`text-sm font-medium ${getLatencyColor(service.latency)}`}>
                        {service.latency}ms
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Last Check</label>
                      <p className="text-sm text-muted-foreground">
                        {format(service.timestamp, 'PPpp')}
                      </p>
                    </div>
                    <div>
                      <label className="text-sm font-medium">Dependencies</label>
                      <p className="text-sm text-muted-foreground">
                        {service.dependencies.length} services
                      </p>
                    </div>
                  </div>

                  {service.dependencies.length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Dependency List</label>
                      <div className="mt-1 space-y-1">
                        {service.dependencies.map((dep, index) => (
                          <div key={index} className="text-sm text-muted-foreground font-mono">
                            • {dep}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {Object.keys(service.details).length > 0 && (
                    <div>
                      <label className="text-sm font-medium">Additional Details</label>
                      <pre className="text-xs bg-muted p-2 rounded overflow-auto mt-1">
                        {JSON.stringify(service.details, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>
    </>
  );
}

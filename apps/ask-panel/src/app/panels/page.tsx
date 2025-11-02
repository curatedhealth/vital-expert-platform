/**
 * Panels List/Dashboard Page
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, Clock, CheckCircle2, XCircle, Loader2, 
  Activity, Filter, Search 
} from 'lucide-react';
import { useTenant } from '@/hooks/use-tenant';
import { useRequireAuth } from '@/hooks/use-auth';
import type { Panel, PanelStatus } from '@/types/database.types';
import { formatDateTime, formatDuration } from '@/lib/utils';

export default function PanelsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useRequireAuth();
  const { db, tenantId } = useTenant();
  const [panels, setPanels] = useState<Panel[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<PanelStatus | 'all'>('all');

  useEffect(() => {
    const loadPanels = async () => {
      if (!db) return;

      try {
        const query = db.panels();
        const { data, error } = filter === 'all' 
          ? await query
          : await query.eq('status', filter);

        if (error) throw error;
        setPanels(data || []);
      } catch (error) {
        console.error('Failed to load panels:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPanels();
  }, [db, filter]);

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-16 h-16 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading panels...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const getStatusIcon = (status: PanelStatus) => {
    switch (status) {
      case 'running':
        return <Activity className="w-4 h-4 text-blue-600 animate-pulse" />;
      case 'completed':
        return <CheckCircle2 className="w-4 h-4 text-green-600" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-gray-600" />;
      default:
        return <Clock className="w-4 h-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: PanelStatus) => {
    switch (status) {
      case 'running':
        return 'default';
      case 'completed':
        return 'secondary';
      case 'failed':
        return 'destructive';
      default:
        return 'outline';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Panels</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage and view all panel discussions
              </p>
            </div>

            <Button onClick={() => router.push('/panels/new')}>
              <Plus className="w-4 h-4 mr-2" />
              New Panel
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="space-y-6">
          {/* Filters */}
          <div className="flex items-center gap-4">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
            >
              All
            </Button>
            <Button
              variant={filter === 'running' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('running')}
            >
              <Activity className="w-4 h-4 mr-2" />
              Running
            </Button>
            <Button
              variant={filter === 'completed' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('completed')}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
            </Button>
          </div>

          {/* Panels List */}
          {panels.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <div className="w-16 h-16 rounded-full bg-muted mx-auto mb-4 flex items-center justify-center">
                  <Activity className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No panels found</h3>
                <p className="text-muted-foreground mb-4">
                  Create your first panel discussion
                </p>
                <Button onClick={() => router.push('/panels/new')}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create Panel
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {panels.map((panel) => (
                <Card
                  key={panel.id}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => {
                    if (panel.status === 'running') {
                      router.push(`/panels/${panel.id}/stream`);
                    } else {
                      router.push(`/panels/${panel.id}`);
                    }
                  }}
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center gap-2">
                          {getStatusIcon(panel.status)}
                          <Badge variant={getStatusColor(panel.status) as any}>
                            {panel.status}
                          </Badge>
                          <Badge variant="outline">
                            {panel.panel_type}
                          </Badge>
                        </div>

                        <p className="text-sm font-medium line-clamp-2">
                          {panel.query}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatDateTime(panel.created_at)}</span>
                          {panel.started_at && (
                            <span>
                              Started {formatDateTime(panel.started_at)}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right space-y-1">
                        <div className="text-sm font-medium">
                          {Array.isArray(panel.agents) ? panel.agents.length : 0} experts
                        </div>
                        {panel.configuration?.max_rounds && (
                          <div className="text-xs text-muted-foreground">
                            {panel.configuration.max_rounds} rounds
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}


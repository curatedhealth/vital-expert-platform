'use client';

import {
  Search,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star,
  TrendingUp,
  DollarSign,
  Activity,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { cn } from '@/shared/utils';

import { __usePanelStore as usePanelStore } from '../services/panel-store';
import { useRecentPanels, useUsageAnalytics } from '@/hooks/usePanelAPI';
import { formatPanelStatus, getPanelStatusColor, getTimeSince } from '@/lib/api/panel-client';

interface PanelSidebarProps {
  className?: string;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export function PanelSidebar({
  className,
  isCollapsed = false,
  onToggleCollapse
}: PanelSidebarProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const { panels, currentPanel, selectPanel, templates } = usePanelStore();
  
  // Fetch real panels from backend
  const { data: recentPanelsData, isLoading: panelsLoading } = useRecentPanels();
  const { data: analyticsData, isLoading: analyticsLoading } = useUsageAnalytics();

  // Merge local panels with backend panels (backend takes precedence)
  const allPanels = recentPanelsData?.panels || panels;

  // Filter panels based on search
  const filteredPanels = allPanels.filter((panel: any) =>
    panel.query?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panel.metadata?.domain?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (isCollapsed) {
    return (
      <div className={cn("flex flex-col h-full border-r bg-muted/40", className)}>
        <div className="p-2 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggleCollapse}
            className="w-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 p-2 space-y-2">
          <Button variant="ghost" size="icon" className="w-full">
            <Plus className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-full">
            <Users className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="w-full">
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col h-full", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-semibold">Advisory Panels</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search panels..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-9"
          />
        </div>

        {/* New Panel Button */}
        <Button className="w-full" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          New Advisory Panel
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Panel Templates */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Star className="h-4 w-4" />
              Quick Start Templates
            </h3>
            <div className="space-y-2">
              {templates.slice(0, 3).map((template) => (
                <Card key={template.id} className="p-3 cursor-pointer hover:bg-muted/50 transition-colors">
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{template.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">
                        {template.domain}
                      </Badge>
                      <Badge
                        variant={template.complexity === 'high' ? 'destructive' : 'secondary'}
                        className="text-xs"
                      >
                        {template.complexity}
                      </Badge>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Active Panels */}
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Recent Panels
            </h3>

            {panelsLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-3">
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredPanels.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No panels yet</p>
                <p className="text-xs text-muted-foreground">Create your first advisory panel</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPanels.map((panel: any) => {
                  const isActive = currentPanel?.id === panel.id;
                  const agentsCount = panel.agents?.length || 0;

                  return (
                    <Card
                      key={panel.id}
                      className={cn(
                        "p-3 cursor-pointer transition-colors hover:bg-muted/50",
                        isActive && "bg-primary/10 border-primary/30"
                      )}
                      onClick={() => selectPanel(panel.id)}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">
                              {panel.query || panel.name || 'Untitled Panel'}
                            </p>
                            {panel.configuration?.domain && (
                              <p className="text-xs text-muted-foreground capitalize">
                                {panel.configuration.domain.replace(/-/g, ' ')}
                              </p>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {getTimeSince(panel.updated_at || panel.created_at)}
                          </span>
                        </div>

                        {/* Panel Agents */}
                        <div className="flex items-center gap-2">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {agentsCount} {agentsCount === 1 ? 'expert' : 'experts'}
                          </span>
                          {panel.panel_type && (
                            <Badge variant="outline" className="text-xs capitalize">
                              {panel.panel_type}
                            </Badge>
                          )}
                        </div>

                        {/* Panel Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {panel.query ? panel.query.slice(0, 40) + '...' : 'No query yet'}
                          </span>
                          <Badge
                            className={cn("text-xs", getPanelStatusColor(panel.status))}
                          >
                            {formatPanelStatus(panel.status)}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>

          {/* Usage Analytics */}
          {analyticsData && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4" />
                Usage This Month
              </h3>
              
              <Card className="p-3">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Activity className="h-4 w-4 text-blue-600" />
                      <span className="text-xs text-muted-foreground">Panels</span>
                    </div>
                    <span className="text-sm font-semibold">{analyticsData.total_panels}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-green-600" />
                      <span className="text-xs text-muted-foreground">Consultations</span>
                    </div>
                    <span className="text-sm font-semibold">{analyticsData.total_consultations}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-amber-600" />
                      <span className="text-xs text-muted-foreground">Cost</span>
                    </div>
                    <span className="text-sm font-semibold">
                      ${analyticsData.total_cost_usd.toFixed(2)}
                    </span>
                  </div>
                  
                  {analyticsData.avg_consensus > 0 && (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-purple-600" />
                        <span className="text-xs text-muted-foreground">Avg Consensus</span>
                      </div>
                      <span className="text-sm font-semibold">
                        {(analyticsData.avg_consensus * 100).toFixed(0)}%
                      </span>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
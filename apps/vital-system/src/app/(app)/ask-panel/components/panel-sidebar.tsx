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

import { Avatar, AvatarFallback, AvatarImage } from '@/lib/shared/components/ui/avatar';
import { Badge } from '@/lib/shared/components/ui/badge';
import { Button } from '@/lib/shared/components/ui/button';
import { Card } from '@/lib/shared/components/ui/card';
import { Input } from '@/lib/shared/components/ui/input';
import { ScrollArea } from '@/lib/shared/components/ui/scroll-area';
import { Skeleton } from '@/lib/shared/components/ui/skeleton';
import { cn } from '@/lib/shared/utils';

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
    <div className={cn("flex flex-col h-full bg-sidebar", className)}>
      {/* Header with premium styling */}
      <div className="p-4 border-b border-border/40 relative">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none" />

        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Users className="h-5 w-5 text-primary" />
            </div>
            <h2 className="font-bold text-foreground">Advisory Panels</h2>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggleCollapse}
              className="h-8 w-8 hover:bg-accent/50 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Search with premium styling */}
        <div className="relative mb-3">
          <div className="relative group">
            {/* Gradient border effect on focus */}
            <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 opacity-0 group-focus-within:opacity-100 blur-sm transition-opacity duration-300 pointer-events-none" />

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors duration-200" />
              <Input
                placeholder="Search panels..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9 rounded-lg bg-muted/50 border-border/40 focus-visible:ring-primary/20 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* New Panel Button with premium styling */}
        <Button className="group relative w-full rounded-lg transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 overflow-hidden" size="sm">
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 group-hover:from-primary/90 group-hover:to-primary transition-all duration-300" />

          <div className="relative flex items-center gap-2">
            <div className="p-1 rounded-md bg-white/10">
              <Plus className="h-4 w-4 transition-transform duration-200 group-hover:scale-110 group-hover:rotate-90" />
            </div>
            <span className="font-semibold">New Advisory Panel</span>
          </div>
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-4">
          {/* Panel Templates */}
          <div>
            <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent/30 to-accent/10">
              <div className="p-1 rounded-md bg-accent/30">
                <Star className="h-3.5 w-3.5 text-foreground" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">Quick Start Templates</h3>
            </div>
            <div className="space-y-2">
              {templates.slice(0, 3).map((template) => (
                <Card key={template.id} className="group relative p-3 cursor-pointer transition-all duration-200 hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 hover:shadow-md hover:-translate-y-0.5 border-border/40">
                  {/* Subtle gradient overlay */}
                  <div className="absolute inset-0 rounded-lg bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

                  <div className="relative space-y-2">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate group-hover:text-primary transition-colors">{template.name}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {template.description}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs bg-primary/5 border-primary/20">
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
            <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-primary/10 to-primary/5">
              <div className="p-1 rounded-md bg-primary/10">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Recent Panels</h3>
            </div>

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
                        "group relative p-3 cursor-pointer transition-all duration-200 border-border/40",
                        isActive
                          ? "bg-gradient-to-r from-primary/15 to-primary/5 border-l-2 border-l-primary shadow-md"
                          : "hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 hover:shadow-md hover:-translate-y-0.5"
                      )}
                      onClick={() => selectPanel(panel.id)}
                    >
                      {/* Subtle gradient overlay */}
                      <div className={cn(
                        "absolute inset-0 rounded-lg transition-all duration-300 pointer-events-none",
                        isActive
                          ? "bg-gradient-to-br from-primary/5 to-transparent"
                          : "bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/5 group-hover:to-transparent"
                      )} />

                      <div className="relative space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              "text-sm truncate transition-colors duration-200",
                              isActive ? "font-semibold text-primary" : "font-medium group-hover:text-foreground"
                            )}>
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
                          <div className={cn(
                            "p-1 rounded-md transition-all duration-200",
                            isActive ? "bg-primary/20" : "bg-muted/50 group-hover:bg-accent/30"
                          )}>
                            <Users className={cn(
                              "h-3 w-3 transition-all duration-200",
                              isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {agentsCount} {agentsCount === 1 ? 'expert' : 'experts'}
                          </span>
                          {panel.panel_type && (
                            <Badge variant="outline" className="text-xs capitalize bg-primary/5 border-primary/20">
                              {panel.panel_type}
                            </Badge>
                          )}
                        </div>

                        {/* Panel Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground truncate flex-1">
                            {panel.query ? panel.query.slice(0, 40) + '...' : 'No query yet'}
                          </span>
                          <Badge
                            className={cn("text-xs ml-2", getPanelStatusColor(panel.status))}
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
              <div className="flex items-center gap-2 mb-3 px-3 py-1.5 rounded-lg bg-gradient-to-r from-secondary/10 to-secondary/5">
                <div className="p-1 rounded-md bg-secondary/10">
                  <TrendingUp className="h-3.5 w-3.5 text-secondary-foreground" />
                </div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-secondary-foreground">Usage This Month</h3>
              </div>

              <Card className="relative p-4 border-border/40 overflow-hidden">
                {/* Gradient background */}
                <div className="absolute inset-0 bg-gradient-to-br from-muted/30 via-transparent to-muted/20 pointer-events-none" />

                <div className="relative space-y-3">
                  <div className="group flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-accent/20">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-blue-500/10 group-hover:bg-blue-500/20 transition-all duration-200">
                        <Activity className="h-3.5 w-3.5 text-blue-600 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Panels</span>
                    </div>
                    <span className="text-sm font-bold">{analyticsData.total_panels}</span>
                  </div>

                  <div className="group flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-accent/20">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-green-500/10 group-hover:bg-green-500/20 transition-all duration-200">
                        <MessageSquare className="h-3.5 w-3.5 text-green-600 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Consultations</span>
                    </div>
                    <span className="text-sm font-bold">{analyticsData.total_consultations}</span>
                  </div>

                  <div className="group flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-accent/20">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 rounded-md bg-amber-500/10 group-hover:bg-amber-500/20 transition-all duration-200">
                        <DollarSign className="h-3.5 w-3.5 text-amber-600 transition-transform duration-200 group-hover:scale-110" />
                      </div>
                      <span className="text-xs font-medium text-muted-foreground">Cost</span>
                    </div>
                    <span className="text-sm font-bold">
                      ${analyticsData.total_cost_usd.toFixed(2)}
                    </span>
                  </div>

                  {analyticsData.avg_consensus > 0 && (
                    <div className="group flex items-center justify-between p-2 rounded-lg transition-all duration-200 hover:bg-accent/20">
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-md bg-purple-500/10 group-hover:bg-purple-500/20 transition-all duration-200">
                          <CheckCircle2 className="h-3.5 w-3.5 text-purple-600 transition-transform duration-200 group-hover:scale-110" />
                        </div>
                        <span className="text-xs font-medium text-muted-foreground">Avg Consensus</span>
                      </div>
                      <span className="text-sm font-bold">
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
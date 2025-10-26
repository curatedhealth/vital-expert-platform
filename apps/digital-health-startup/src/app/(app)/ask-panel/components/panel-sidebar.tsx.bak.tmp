'use client';

import {
  Search,
  Users,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Star
} from 'lucide-react';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import { Card } from '@/shared/components/ui/card';
import { Input } from '@/shared/components/ui/input';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { cn } from '@/shared/utils';

import { __usePanelStore as usePanelStore } from '../services/panel-store';

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

  // Filter panels based on search
  const filteredPanels = panels.filter((panel) =>
    panel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    panel.description.toLowerCase().includes(searchQuery.toLowerCase())
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

            {filteredPanels.length === 0 ? (
              <div className="text-center py-8">
                <Users className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No panels yet</p>
                <p className="text-xs text-muted-foreground">Create your first advisory panel</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredPanels.map((panel) => {
                  const isActive = currentPanel?.id === panel.id;

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
                            <p className="text-sm font-medium truncate">{panel.name}</p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                              {panel.description}
                            </p>
                          </div>
                          <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                            {new Date(panel.updated_at).toLocaleDateString()}
                          </span>
                        </div>

                        {/* Panel Members */}
                        <div className="flex items-center gap-2">
                          <div className="flex -space-x-1">
                            {panel.members.slice(0, 3).map((member, index) => (
                              <Avatar key={index} className="h-6 w-6 border-2 border-background">
                                <AvatarImage src={member.agent.avatar?.startsWith('http') ? member.agent.avatar : undefined} />
                                <AvatarFallback className="text-xs">
                                  {member.agent.name.split(' ').map(n => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                            ))}
                            {panel.members.length > 3 && (
                              <div className="h-6 w-6 rounded-full bg-muted border-2 border-background flex items-center justify-center">
                                <span className="text-xs text-muted-foreground">
                                  +{panel.members.length - 3}
                                </span>
                              </div>
                            )}
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {panel.members.length} experts
                          </span>
                        </div>

                        {/* Panel Status */}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">
                            {panel.messages.length} messages
                          </span>
                          <Badge
                            variant={panel.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {panel.status}
                          </Badge>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </ScrollArea>
    </div>
  );
}
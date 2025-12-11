'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  Users as UsersIcon,
  Briefcase,
  Wrench,
  BookOpen,
  Lightbulb,
  Workflow,
  Settings,
  Shield,
  Search,
  Star,
  Check,
  Hammer,
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarHeader,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAskExpert } from '@/contexts/ask-expert-context';
import { cn } from '@vital/ui/lib/utils';

const navigationItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
  },
  {
    title: 'Ask Expert',
    href: '/ask-expert',
    icon: MessageSquare,
  },
  {
    title: 'Ask Panel',
    href: '/ask-panel',
    icon: UsersIcon,
  },
  {
    title: 'Jobs-to-be-Done',
    href: '/jobs-to-be-done',
    icon: Briefcase,
  },
  {
    title: 'Build Solution',
    href: '/solution-builder',
    icon: Wrench,
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: UsersIcon,
  },
  {
    title: 'Tools',
    href: '/tools',
    icon: Hammer,
  },
  {
    title: 'Knowledge',
    href: '/knowledge',
    icon: BookOpen,
  },
  {
    title: 'Prompt PRISM',
    href: '/prompts',
    icon: Lightbulb,
  },
  {
    title: 'Capabilities',
    href: '/capabilities',
    icon: Shield,
  },
  {
    title: 'Workflows',
    href: '/workflows',
    icon: Workflow,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Settings,
    badge: 'Admin',
  },
];

// Ask Expert specific sidebar content
function AskExpertSidebarContent() {
  const { agents, selectedAgents, setSelectedAgents } = useAskExpert();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<number | null>(null);

  // Filter agents
  const filteredAgents = agents.filter(agent => {
    const matchesSearch =
      agent.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTier = filterTier === null || agent.tier === filterTier;
    return matchesSearch && matchesTier && agent.status === 'active';
  });

  const toggleAgent = (agentId: string) => {
    const newSelection = selectedAgents.includes(agentId)
      ? selectedAgents.filter(id => id !== agentId)
      : [...selectedAgents, agentId];
    setSelectedAgents(newSelection);
  };

  const getTierColor = (tier: number) => {
    switch (tier) {
      case 1:
        return 'bg-yellow-100 text-yellow-700';
      case 2:
        return 'bg-blue-100 text-blue-700';
      default:
        return 'bg-neutral-100 text-neutral-700';
    }
  };

  return (
    <SidebarContent>
      {/* Chat Management Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Chat Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MessageSquare className="w-4 h-4" />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BookOpen className="w-4 h-4" />
                <span>Chat History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Agents Management Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Agents Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 mb-3">
            {/* Search */}
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>

            {/* Tier Filters */}
            <div className="flex gap-1 mb-2">
              <Button
                variant={filterTier === null ? 'default' : 'outline'}
                size="sm"
                onClick={() => setFilterTier(null)}
                className="flex-1 h-7 text-xs"
              >
                All
              </Button>
              {[1, 2, 3].map(tier => (
                <Button
                  key={tier}
                  variant={filterTier === tier ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setFilterTier(tier)}
                  className="flex-1 h-7 text-xs"
                >
                  T{tier}
                </Button>
              ))}
            </div>

            <div className="text-xs text-neutral-500 mb-2">
              {selectedAgents.length} selected
            </div>
          </div>

          {/* Agents List */}
          <ScrollArea className="h-[300px]">
            <div className="space-y-1 px-2">
              {filteredAgents.slice(0, 10).map(agent => {
                const isSelected = selectedAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    onClick={() => toggleAgent(agent.id)}
                    className={cn(
                      'w-full text-left p-2 rounded-md text-xs transition-colors',
                      isSelected
                        ? 'bg-blue-50 text-blue-900'
                        : 'hover:bg-neutral-100'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {agent.avatar ? (
                        <img
                          src={agent.avatar}
                          alt={agent.displayName}
                          className="w-6 h-6 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                          <UsersIcon className="w-3 h-3 text-blue-600" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate">{agent.displayName}</div>
                      </div>
                      {isSelected && <Check className="w-3 h-3 text-blue-600 flex-shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>
          </ScrollArea>

          <div className="px-2 mt-2">
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/agents">
                <UsersIcon className="w-4 h-4 mr-2" />
                Browse Agent Store
              </a>
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Settings Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Settings</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="w-4 h-4" />
                <span>Chat Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// Default navigation sidebar content
function DefaultSidebarContent() {
  const pathname = usePathname();

  return (
    <SidebarContent>
      <SidebarGroup>
        <SidebarGroupLabel>Navigation</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {navigationItems.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild isActive={isActive}>
                    <Link href={item.href}>
                      <item.icon className="w-4 h-4" />
                      <span>{item.title}</span>
                      {item.badge && (
                        <span className="ml-auto text-xs bg-red-100 text-red-800 px-1.5 py-0.5 rounded-full">
                          {item.badge}
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

export function ShadcnDashboardSidebar() {
  const pathname = usePathname();
  const isAskExpertRoute = pathname === '/ask-expert';

  return (
    <Sidebar collapsible="icon">
      {isAskExpertRoute ? <AskExpertSidebarContent /> : <DefaultSidebarContent />}
    </Sidebar>
  );
}

// Wrapper with SidebarProvider for layout (AskExpertProvider is at layout level)
export function ShadcnDashboardSidebarWrapper() {
  return (
    <SidebarProvider>
      <ShadcnDashboardSidebar />
    </SidebarProvider>
  );
}

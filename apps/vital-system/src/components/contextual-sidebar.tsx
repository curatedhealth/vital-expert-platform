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
  Check,
  Plus,
  Upload,
  FolderOpen,
  FileText,
  BarChart,
  History,
  Star,
  Filter,
  Clock,
  TrendingUp,
  Activity,
  Database,
  Zap,
  Target,
  CheckCircle,
  AlertCircle,
  GitBranch,
  Code,
  Layers,
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
import { ScrollArea } from '@/components/ui/scroll-area';
import { useAskExpert } from '@/contexts/ask-expert-context';
// Removed import { cn } from '@vital/ui/lib/utils'; as it causes a module not found error
import { PANEL_TEMPLATES } from '@/features/ask-panel/constants/panel-templates';
import { Badge } from '@/components/ui/badge';
import { Bot, Stethoscope, FlaskConical, UserCog, HeartPulse } from 'lucide-react';

// ============================================================================
// DASHBOARD SIDEBAR
// ============================================================================
function DashboardSidebarContent() {
  return (
    <SidebarContent>
      {/* Overview Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Overview</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart className="w-4 h-4" />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Activity className="w-4 h-4" />
                <span>Recent Activity</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <TrendingUp className="w-4 h-4" />
                <span>Usage Trends</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Quick Actions */}
      <SidebarGroup>
        <SidebarGroupLabel>Quick Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/ask-expert">
                  <MessageSquare className="w-4 h-4" />
                  <span>New Conversation</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/knowledge">
                  <Upload className="w-4 h-4" />
                  <span>Upload Document</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <Link href="/agents">
                  <Plus className="w-4 h-4" />
                  <span>Create Agent</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Recent Items */}
      <SidebarGroup>
        <SidebarGroupLabel>Recent</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <History className="w-4 h-4" />
                <span>Recent Chats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FileText className="w-4 h-4" />
                <span>Recent Documents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Star className="w-4 h-4" />
                <span>Favorites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// ASK EXPERT SIDEBAR
// ============================================================================
function AskExpertSidebarContent() {
  const { agents, selectedAgents, setSelectedAgents } = useAskExpert();
  const [searchQuery, setSearchQuery] = useState('');
  const [filterTier, setFilterTier] = useState<number | null>(null);

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

  return (
    <SidebarContent>
      {/* Chat Management */}
      <SidebarGroup>
        <SidebarGroupLabel>Chat Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus className="w-4 h-4" />
                <span>New Chat</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <History className="w-4 h-4" />
                <span>Chat History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Agents Management */}
      <SidebarGroup>
        <SidebarGroupLabel>Agents Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <div className="px-2 mb-3">
            <div className="relative mb-2">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                type="text"
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-8 text-sm"
              />
            </div>

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

            <div className="text-xs text-gray-500 mb-2">
              {selectedAgents.length} selected
            </div>
          </div>

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
                      isSelected ? 'bg-blue-50 text-blue-900' : 'hover:bg-gray-100'
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
              <Link href="/agents">
                <UsersIcon className="w-4 h-4 mr-2" />
                Browse Agent Store
              </Link>
            </Button>
          </div>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Settings */}
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

// ============================================================================
// ASK PANEL SIDEBAR
// ============================================================================
function AskPanelSidebarContent() {
  return (
    <SidebarContent>
      {/* Conversations */}
      <SidebarGroup>
        <SidebarGroupLabel>Conversations</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <MessageSquare className="w-4 h-4" />
                <span>Active Threads</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Clock className="w-4 h-4" />
                <span>Pending Review</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <CheckCircle className="w-4 h-4" />
                <span>Approved</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Panel Management */}
      <SidebarGroup>
        <SidebarGroupLabel>Panel Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Target className="w-4 h-4" />
                <span>Risk Assessment</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <AlertCircle className="w-4 h-4" />
                <span>Flagged Items</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart className="w-4 h-4" />
                <span>Panel Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// AGENTS SIDEBAR
// ============================================================================
function AgentsSidebarContent() {
  return (
    <SidebarContent>
      {/* Browse */}
      <SidebarGroup>
        <SidebarGroupLabel>Browse Agents</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Star className="w-4 h-4" />
                <span>Featured</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <TrendingUp className="w-4 h-4" />
                <span>Popular</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Clock className="w-4 h-4" />
                <span>Recently Added</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon className="w-4 h-4" />
                <span>My Agents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Filter by Tier */}
      <SidebarGroup>
        <SidebarGroupLabel>Filter by Tier</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Filter className="w-4 h-4" />
                <span>Tier 1 (Expert)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Filter className="w-4 h-4" />
                <span>Tier 2 (Advanced)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Filter className="w-4 h-4" />
                <span>Tier 3 (Standard)</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Actions */}
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus className="w-4 h-4" />
                <span>Create New Agent</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="w-4 h-4" />
                <span>Manage Agents</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// KNOWLEDGE SIDEBAR
// ============================================================================
function KnowledgeSidebarContent() {
  return (
    <SidebarContent>
      {/* Actions */}
      <SidebarGroup>
        <SidebarGroupLabel>Actions</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Upload className="w-4 h-4" />
                <span>Upload Document</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus className="w-4 h-4" />
                <span>Create Collection</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Search className="w-4 h-4" />
                <span>Search Knowledge</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Categories */}
      <SidebarGroup>
        <SidebarGroupLabel>Categories</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FolderOpen className="w-4 h-4" />
                <span>Medical Guidelines</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FolderOpen className="w-4 h-4" />
                <span>Clinical Trials</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FolderOpen className="w-4 h-4" />
                <span>Research Papers</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FolderOpen className="w-4 h-4" />
                <span>Regulatory Docs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Analytics */}
      <SidebarGroup>
        <SidebarGroupLabel>Analytics</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart className="w-4 h-4" />
                <span>Usage Stats</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Database className="w-4 h-4" />
                <span>Storage Overview</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Activity className="w-4 h-4" />
                <span>Processing Queue</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// PROMPT PRISM SIDEBAR
// ============================================================================
function PromptPrismSidebarContent() {
  return (
    <SidebarContent>
      {/* Templates */}
      <SidebarGroup>
        <SidebarGroupLabel>Templates</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FileText className="w-4 h-4" />
                <span>Browse Templates</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus className="w-4 h-4" />
                <span>Create Template</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Star className="w-4 h-4" />
                <span>Favorites</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Performance */}
      <SidebarGroup>
        <SidebarGroupLabel>Performance</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart className="w-4 h-4" />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <TrendingUp className="w-4 h-4" />
                <span>A/B Testing</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Activity className="w-4 h-4" />
                <span>Monitoring</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Version Control */}
      <SidebarGroup>
        <SidebarGroupLabel>Version Control</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <GitBranch className="w-4 h-4" />
                <span>Version History</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Clock className="w-4 h-4" />
                <span>Recent Changes</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// WORKFLOWS SIDEBAR
// ============================================================================
function WorkflowsSidebarContent() {
  return (
    <SidebarContent>
      {/* Workflows */}
      <SidebarGroup>
        <SidebarGroupLabel>Workflows</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Workflow className="w-4 h-4" />
                <span>Active Workflows</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <FileText className="w-4 h-4" />
                <span>Templates</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus className="w-4 h-4" />
                <span>Create Workflow</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Monitoring */}
      <SidebarGroup>
        <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Activity className="w-4 h-4" />
                <span>Active Runs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <CheckCircle className="w-4 h-4" />
                <span>Completed</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <AlertCircle className="w-4 h-4" />
                <span>Failed</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Integration */}
      <SidebarGroup>
        <SidebarGroupLabel>Integration</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Zap className="w-4 h-4" />
                <span>Triggers</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Layers className="w-4 h-4" />
                <span>Integrations</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Code className="w-4 h-4" />
                <span>API Access</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// ADMIN SIDEBAR
// ============================================================================
function AdminSidebarContent() {
  return (
    <SidebarContent>
      {/* User Management */}
      <SidebarGroup>
        <SidebarGroupLabel>User Management</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <UsersIcon className="w-4 h-4" />
                <span>All Users</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Plus className="w-4 h-4" />
                <span>Add User</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Shield className="w-4 h-4" />
                <span>Roles & Permissions</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* System */}
      <SidebarGroup>
        <SidebarGroupLabel>System</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Settings className="w-4 h-4" />
                <span>General Settings</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Database className="w-4 h-4" />
                <span>Database</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <Activity className="w-4 h-4" />
                <span>System Health</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      {/* Monitoring */}
      <SidebarGroup>
        <SidebarGroupLabel>Monitoring</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <BarChart className="w-4 h-4" />
                <span>Analytics</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <AlertCircle className="w-4 h-4" />
                <span>Error Logs</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton>
                <History className="w-4 h-4" />
                <span>Audit Trail</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// DEFAULT NAVIGATION SIDEBAR (for routes without specific sidebar)
// ============================================================================
// Map category to icon
const CATEGORY_ICONS: Record<string, any> = {
  'clinical': Stethoscope,
  'clinical-trials': Stethoscope,
  'research': FlaskConical,
  'regulatory': Shield,
  'patient-care': HeartPulse,
  'operations': UserCog,
  'default': UsersIcon,
};

function getCategoryIcon(category: string) {
  const key = category.toLowerCase().replace(/\s+/g, '-');
  return CATEGORY_ICONS[key] || CATEGORY_ICONS['default'];
}

function DefaultNavigationContent() {
  const pathname = usePathname();
  const navigationItems = [
    { title: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { title: 'Ask Expert', href: '/ask-expert', icon: MessageSquare },
    { title: 'Ask Panel', href: '/ask-panel', icon: UsersIcon },
    { title: 'Jobs-to-be-Done', href: '/jobs-to-be-done', icon: Briefcase },
    { title: 'Build Solution', href: '/solution-builder', icon: Wrench },
    { title: 'Agents', href: '/agents', icon: UsersIcon },
    { title: 'Tools', href: '/tools', icon: Hammer },
    { title: 'Knowledge', href: '/knowledge', icon: BookOpen },
    { title: 'PROMPTS', href: '/prism', icon: Lightbulb },
    { title: 'Capabilities', href: '/capabilities', icon: Shield },
    { title: 'Workflows', href: '/workflows', icon: Workflow },
    { title: 'Admin', href: '/admin', icon: Settings, badge: 'Admin' },
  ];

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

      {/* Panel Workflows Section */}
      <SidebarGroup>
        <SidebarGroupLabel>Panel Workflows</SidebarGroupLabel>
        <SidebarGroupContent>
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2 pr-2">
              {PANEL_TEMPLATES.map((template) => {
                const IconComponent = getCategoryIcon(template.category);
                const isActive = pathname.startsWith('/ask-panel');
                
                return (
                  <SidebarMenuItem key={template.id}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      className="h-auto py-2 px-3 flex-col items-start gap-1"
                    >
                      <Link href="/ask-panel">
                        <div className="flex items-center gap-2 w-full">
                          <div className="w-8 h-8 rounded-md bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="w-4 h-4 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-sm font-medium truncate">
                              {template.name}
                            </div>
                            <div className="text-xs text-muted-foreground line-clamp-1 mt-0.5">
                              {template.description}
                            </div>
                            <div className="flex flex-wrap gap-1 mt-1.5">
                              <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4 capitalize">
                                {template.category}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                <Zap className="w-2.5 h-2.5 mr-0.5" />
                                {template.mode}
                              </Badge>
                              <Badge variant="outline" className="text-[10px] px-1 py-0 h-4">
                                <Bot className="w-2.5 h-2.5 mr-0.5" />
                                {template.suggestedAgents.length}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </div>
          </ScrollArea>
        </SidebarGroupContent>
      </SidebarGroup>
    </SidebarContent>
  );
}

// ============================================================================
// MAIN CONTEXTUAL SIDEBAR COMPONENT
// ============================================================================
export function ContextualSidebar() {
  const pathname = usePathname();

  // Determine which sidebar content to show based on route
  const getSidebarContent = () => {
    if (pathname === '/dashboard') return <DashboardSidebarContent />;
    if (pathname === '/ask-expert') return <AskExpertSidebarContent />;
    if (pathname.startsWith('/ask-panel')) return <AskPanelSidebarContent />;
    if (pathname.startsWith('/agents')) return <AgentsSidebarContent />;
    if (pathname.startsWith('/knowledge')) return <KnowledgeSidebarContent />;
    if (pathname.startsWith('/prism')) return <PromptPrismSidebarContent />;
    if (pathname.startsWith('/workflows')) return <WorkflowsSidebarContent />;
    if (pathname.startsWith('/admin')) return <AdminSidebarContent />;

    // Default navigation for other routes
    return <DefaultNavigationContent />;
  };

  return (
    <Sidebar collapsible="icon">
      {getSidebarContent()}
    </Sidebar>
  );
}

// Wrapper with SidebarProvider for layout
export function ContextualSidebarWrapper() {
  return (
    <SidebarProvider>
      <ContextualSidebar />
    </SidebarProvider>
  );
}

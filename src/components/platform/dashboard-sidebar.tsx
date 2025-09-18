'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Home,
  FolderOpen,
  MessageSquare,
  FileText,
  Settings,
  Users,
  BarChart3,
  Zap,
  ChevronLeft,
  ChevronRight,
  Brain,
  Target,
  TestTube,
  Play,
  BookOpen,
} from 'lucide-react';

const navigationItems = [
  {
    title: 'Overview',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Projects',
    href: '/dashboard/projects',
    icon: FolderOpen,
  },
  {
    title: 'AI Chat',
    href: '/dashboard/chat',
    icon: MessageSquare,
    badge: 'New',
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
  {
    title: 'Analytics',
    href: '/dashboard/analytics',
    icon: BarChart3,
  },
];

const vitalPhases = [
  {
    title: 'Vision',
    href: '/dashboard/vision',
    icon: Brain,
    color: 'text-trust-blue',
    bg: 'bg-trust-blue/10',
  },
  {
    title: 'Integrate',
    href: '/dashboard/integrate',
    icon: Target,
    color: 'text-progress-teal',
    bg: 'bg-progress-teal/10',
  },
  {
    title: 'Test',
    href: '/dashboard/test',
    icon: TestTube,
    color: 'text-clinical-green',
    bg: 'bg-clinical-green/10',
  },
  {
    title: 'Activate',
    href: '/dashboard/activate',
    icon: Play,
    color: 'text-regulatory-gold',
    bg: 'bg-regulatory-gold/10',
  },
  {
    title: 'Learn',
    href: '/dashboard/learn',
    icon: BookOpen,
    color: 'text-market-purple',
    bg: 'bg-market-purple/10',
  },
];

const settingsItems = [
  {
    title: 'Team',
    href: '/dashboard/team',
    icon: Users,
  },
  {
    title: 'Workflows',
    href: '/dashboard/workflows',
    icon: Zap,
  },
  {
    title: 'Settings',
    href: '/dashboard/settings',
    icon: Settings,
  },
];

export function DashboardSidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

  const NavItem = ({ item, isActive }: { item: any; isActive: boolean }) => (
    <Link
      href={item.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-progress-teal text-white'
          : 'text-medical-gray hover:text-deep-charcoal hover:bg-white/50',
        collapsed && 'justify-center px-2'
      )}
    >
      <item.icon className={cn('h-5 w-5 flex-shrink-0', item.color)} />
      {!collapsed && (
        <>
          <span className="flex-1">{item.title}</span>
          {item.badge && (
            <Badge variant="secondary" className="text-xs">
              {item.badge}
            </Badge>
          )}
        </>
      )}
    </Link>
  );

  const PhaseItem = ({ phase, isActive }: { phase: any; isActive: boolean }) => (
    <Link
      href={phase.href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
        isActive
          ? 'bg-white text-deep-charcoal shadow-sm'
          : 'text-medical-gray hover:text-deep-charcoal hover:bg-white/50',
        collapsed && 'justify-center px-2'
      )}
    >
      <div className={cn('p-1.5 rounded-md', phase.bg)}>
        <phase.icon className={cn('h-4 w-4', phase.color)} />
      </div>
      {!collapsed && <span className="flex-1">{phase.title}</span>}
    </Link>
  );

  return (
    <div
      className={cn(
        'bg-background-gray border-r border-gray-200 transition-all duration-300',
        collapsed ? 'w-16' : 'w-64'
      )}
    >
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            {!collapsed && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-gradient-to-br from-trust-blue to-progress-teal rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-sm">V</span>
                </div>
                <span className="font-bold text-deep-charcoal">VITALpath</span>
              </div>
            )}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setCollapsed(!collapsed)}
              className="h-8 w-8"
            >
              {collapsed ? (
                <ChevronRight className="h-4 w-4" />
              ) : (
                <ChevronLeft className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>

        {/* Main Navigation */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-1">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-medical-gray uppercase tracking-wider mb-3">
                Main
              </h3>
            )}
            {navigationItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>

          {/* VITAL Phases */}
          <div className="p-4 space-y-1">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-medical-gray uppercase tracking-wider mb-3">
                VITAL Framework
              </h3>
            )}
            {vitalPhases.map((phase) => (
              <PhaseItem
                key={phase.href}
                phase={phase}
                isActive={pathname === phase.href}
              />
            ))}
          </div>

          {/* Settings */}
          <div className="p-4 space-y-1 border-t border-gray-200">
            {!collapsed && (
              <h3 className="text-xs font-semibold text-medical-gray uppercase tracking-wider mb-3">
                Settings
              </h3>
            )}
            {settingsItems.map((item) => (
              <NavItem
                key={item.href}
                item={item}
                isActive={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
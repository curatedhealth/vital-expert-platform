'use client';

import React from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  SidebarProvider,
  SidebarInset,
  VitalAppSidebar,
  type SidebarRoute,
} from '@/components/dashboard/sidebar';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import {
  LayoutDashboard,
  MessageSquare,
  Bot,
  Building2,
  Database,
  Workflow,
  FileText,
  Briefcase,
  Settings,
} from 'lucide-react';

// ============================================================================
// VITAL DASHBOARD LAYOUT (NO Radix UI)
// ============================================================================

interface VitalDashboardLayoutProps {
  children: React.ReactNode;
}

export function VitalDashboardLayout({ children }: VitalDashboardLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, userProfile } = useAuth();

  // Get user information for sidebar
  const userName = userProfile?.full_name || user?.user_metadata?.name || user?.email || 'User';
  const userEmail = user?.email || userProfile?.email || 'user@example.com';
  const userInitials = userName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  // Define main navigation routes
  const routes: SidebarRoute[] = [
    {
      name: 'Dashboard',
      path: '/dashboard',
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: 'Ask Expert',
      path: '/ask-expert',
      icon: <MessageSquare className="h-5 w-5" />,
    },
    {
      name: 'Agents',
      path: '/agents',
      icon: <Bot className="h-5 w-5" />,
    },
    {
      name: 'Knowledge',
      path: '/knowledge',
      icon: <Database className="h-5 w-5" />,
    },
    {
      name: 'Workflows',
      path: '/workflows',
      icon: <Workflow className="h-5 w-5" />,
    },
    {
      name: 'JTBD',
      path: '/jobs-to-be-done',
      icon: <Briefcase className="h-5 w-5" />,
    },
    {
      name: 'Patterns',
      path: '/patterns',
      icon: <FileText className="h-5 w-5" />,
    },
    {
      name: 'Solution Builder',
      path: '/solution-builder',
      icon: <Building2 className="h-5 w-5" />,
    },
  ];

  const handleRouteChange = (path: string) => {
    router.push(path);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <VitalAppSidebar
        variant="inset"
        routes={routes}
        activeRoute={pathname}
        onRouteChange={handleRouteChange}
        user={{
          name: userName,
          email: userEmail,
          initials: userInitials,
        }}
      />
      <SidebarInset>
        <main className="flex-1">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

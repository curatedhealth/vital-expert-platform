'use client';

import React from 'react';
import { AgentsFilterProvider } from '@/contexts/agents-filter-context';
import { AskExpertProvider } from '@/contexts/ask-expert-context';
import { ContextualSidebarWrapper } from '@/components/contextual-sidebar';
import { SidebarInset } from '@/components/ui/sidebar';
import { DashboardHeader } from '@/components/dashboard-header';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { useRouter, usePathname } from 'next/navigation';

function AppLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading, userProfile } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  // Redirect to login if not authenticated (excluding auth routes)
  React.useEffect(() => {
    if (!loading && !user && !userProfile) {
      if (!pathname.startsWith('/login') && !pathname.startsWith('/auth')) {
        router.push('/login');
      }
    }
  }, [user, loading, userProfile, router, pathname]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Require authenticated user in production
  let displayUser = null;

  if (user) {
    displayUser = user;
  } else if (userProfile) {
    displayUser = {
      ...userProfile,
      email: userProfile.email || user?.email,
      user_metadata: { name: userProfile.full_name || userProfile.email }
    };
  } else if (process.env.NODE_ENV === 'development') {
    // Development fallback ONLY
    displayUser = {
      id: 'dev-user',
      email: 'dev@vitalexpert.com',
      user_metadata: { name: 'Development User' }
    };
  }

  // Block access if no user in production
  if (!displayUser && process.env.NODE_ENV === 'production') {
    return null;
  }

  return (
    <div className="flex min-h-screen">
      {/* Contextual Sidebar (wrapped with SidebarProvider inside) */}
      <ContextualSidebarWrapper />

      {/* Main Content Area with SidebarInset */}
      <SidebarInset className="flex flex-1 flex-col">
        {/* Header with Breadcrumbs and User Menu */}
        <DashboardHeader />

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AskExpertProvider>
      <AgentsFilterProvider>
        <AppLayoutContent>{children}</AppLayoutContent>
      </AgentsFilterProvider>
    </AskExpertProvider>
  );
}

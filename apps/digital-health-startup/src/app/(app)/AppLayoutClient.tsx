'use client';

import React, { useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { Toaster } from 'sonner';

import { AgentsFilterProvider } from '@/contexts/agents-filter-context';
import { AskExpertProvider } from '@/contexts/ask-expert-context';
import { AskPanelProvider } from '@/contexts/ask-panel-context';
import { DashboardProvider } from '@/contexts/dashboard-context';
import { UnifiedDashboardLayout } from '@/components/dashboard/unified-dashboard-layout';
import { useAuth } from '@/lib/auth/supabase-auth-context';
import { QueryProvider } from '@/lib/providers/query-provider';

interface AppLayoutClientProps {
  children: React.ReactNode;
  initialUser: User | null;
}

export function AppLayoutClient({ children, initialUser }: AppLayoutClientProps) {
  const { user, userProfile, loading } = useAuth();

  const hasInitialUser = Boolean(initialUser);

  const hasAuthContext = useMemo(() => Boolean(user || userProfile), [user, userProfile]);

  const shouldShowLoader = loading && !hasAuthContext && hasInitialUser;

  if (!hasAuthContext && !hasInitialUser) {
    return null;
  }

  return (
    <QueryProvider>
      {/* ✨ PHASE C: Toast notifications for optimistic updates */}
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={3000}
        toastOptions={{
          className: 'toast',
          style: {
            background: 'hsl(var(--background))',
            color: 'hsl(var(--foreground))',
            border: '1px solid hsl(var(--border))',
          },
        }}
      />
      
      <DashboardProvider>
        <AskExpertProvider>
          <AskPanelProvider>
            <AgentsFilterProvider>
              {shouldShowLoader ? (
                <div className="flex h-screen items-center justify-center">
                  <div className="text-center">
                    <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
                    <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              ) : (
                <UnifiedDashboardLayout>{children}</UnifiedDashboardLayout>
              )}
            </AgentsFilterProvider>
          </AskPanelProvider>
        </AskExpertProvider>
      </DashboardProvider>
    </QueryProvider>
  );
}

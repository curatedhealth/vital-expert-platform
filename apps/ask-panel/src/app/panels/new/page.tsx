/**
 * New Panel Page
 */

'use client';

import { PanelCreator } from '@/components/panels/panel-creator';
import { useRequireAuth } from '@/hooks/use-auth';

export default function NewPanelPage() {
  const { isAuthenticated, isLoading } = useRequireAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect
  }

  return (
    <div className="min-h-screen bg-background">
      <PanelCreator />
    </div>
  );
}


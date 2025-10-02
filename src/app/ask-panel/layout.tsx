'use client';

import {
  Menu,
  X,
  Users
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/shared/components/ui/button';
import { useAuth } from '@/shared/services/auth/auth-context';
import { cn } from '@/shared/utils';

import { PanelNavbar } from './components/panel-navbar';
import { PanelSidebar } from './components/panel-sidebar';

export default function AskPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const { user, loading, signOut, userProfile } = useAuth();

  return (
    <div className="min-h-screen w-full flex flex-col">
      {/* Panel Navigation Bar */}
      <PanelNavbar
        user={userProfile ? {
          name: userProfile.full_name || userProfile.email?.split('@')[0] || 'User',
          email: userProfile.email || '',
          avatar: userProfile.avatar_url
        } : undefined}
        onNewPanel={() => {
          router.push('/ask-panel');
        }}
        onSignOut={signOut}
        showUserMenu={true}
        showQuickActions={true}
      />

      {/* Main Content Grid */}
      <div className={cn(
        "grid flex-1",
        isCollapsed
          ? "md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]"
          : "md:grid-cols-[300px_1fr] lg:grid-cols-[350px_1fr]"
      )}>
        {/* Desktop Sidebar */}
        <div className="hidden border-r bg-muted/40 md:block">
          <div className="flex h-full max-h-screen flex-col">
            <PanelSidebar
              className="flex-1"
              isCollapsed={isCollapsed}
              onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            />
          </div>
        </div>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} onKeyDown={() => setSidebarOpen(false)} role="button" tabIndex={0} />
            <div className="fixed left-0 top-0 z-50 h-full w-72 bg-background shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Users className="h-6 w-6 text-primary" />
                  <span className="font-semibold">Ask Panel</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <PanelSidebar className="p-4" />
            </div>
          </div>
        )}

        <div className="flex flex-col">
          {/* Mobile Menu Button */}
          <div className="flex h-14 items-center gap-4 border-b bg-background px-4 md:hidden">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>
            <h1 className="text-lg font-semibold">Ask Panel</h1>
          </div>

          {/* Main Content */}
          <main className="flex flex-1 flex-col min-w-0 overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
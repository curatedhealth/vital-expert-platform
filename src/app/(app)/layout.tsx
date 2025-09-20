'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import {
  Menu,
  X,
  Package2,
} from 'lucide-react';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  // Removed agent state management - filters now handled directly in agents page

  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, userProfile } = useAuth();
  // Removed useAgentFilters - no longer needed in layout

  // Agent management callbacks
  const handleCreateAgent = () => {
    // Always navigate to agents page with create parameter
    router.push('/agents?create=true');
  };

  const handleUploadAgent = () => {
    // Navigate to agents page with upload parameter
    router.push('/agents?upload=true');
  };

  // Determine current view based on pathname
  const getCurrentView = () => {
    if (pathname.includes('/knowledge')) return 'knowledge';
    if (pathname.includes('/agents')) return 'agents';
    if (pathname.includes('/projects')) return 'projects';
    return 'default';
  };

  // Temporary bypass auth for debugging
  console.log('Layout state:', { loading, user: user?.email, userProfile: userProfile?.email });

  // Skip auth check temporarily
  // if (!loading && !user) {
  //   console.log('No user, redirecting to login');
  //   router.push('/login');
  //   return null;
  // }

  // Skip loading state temporarily
  // if (loading) {
  //   console.log('Still loading...');
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  return (
    <div className={cn(
      "grid min-h-screen w-full",
      isCollapsed
        ? "md:grid-cols-[60px_1fr] lg:grid-cols-[60px_1fr]"
        : "md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]"
    )}>
      {/* Desktop Sidebar */}
      <div className="hidden border-r bg-muted/40 md:block">
        <div className="flex h-full max-h-screen flex-col gap-2">
          <DashboardSidebar
            className="flex-1"
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            currentView={getCurrentView()}
            onCreateAgent={getCurrentView() === 'agents' ? handleCreateAgent : undefined}
            onUploadAgent={getCurrentView() === 'agents' ? handleUploadAgent : undefined}
          />
        </div>
      </div>

      <div className="flex flex-col">
        {/* Internal Navigation Header */}
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Button
            variant="outline"
            size="icon"
            className="shrink-0 md:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle navigation menu</span>
          </Button>
          <div className="w-full flex-1">
            <nav className="flex items-center space-x-6 text-sm font-medium">
              <Link
                href="/knowledge"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/knowledge") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Knowledge
              </Link>
              <Link
                href="/agents"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/agents") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Agents
              </Link>
              <Link
                href="/chat"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/chat") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Ask Expert
              </Link>
              <Link
                href="/workflows"
                className={cn(
                  "text-foreground/60 transition-colors hover:text-foreground/80 cursor-not-allowed"
                )}
              >
                Workflows <Badge variant="secondary" className="ml-1 text-xs">Coming Soon</Badge>
              </Link>
              {userProfile && (userProfile.role === 'admin' || userProfile.role === 'super_admin') && (
                <Link
                  href="/admin/batch-upload"
                  className={cn(
                    "transition-colors hover:text-foreground/80",
                    pathname.startsWith("/admin") ? "text-foreground" : "text-foreground/60"
                  )}
                >
                  Admin <Badge variant="outline" className="ml-1 text-xs">Pro</Badge>
                </Link>
              )}
            </nav>
          </div>
          <Button variant="outline" size="sm" onClick={signOut}>
            Sign Out
          </Button>
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} />
            <div className="fixed left-0 top-0 z-50 h-full w-72 bg-background shadow-lg">
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Package2 className="h-6 w-6" />
                  <span className="font-semibold">VITALpath</span>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
              <DashboardSidebar
                className="p-4"
                currentView={getCurrentView()}
                onCreateAgent={getCurrentView() === 'agents' ? handleCreateAgent : undefined}
                onUploadAgent={getCurrentView() === 'agents' ? handleUploadAgent : undefined}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
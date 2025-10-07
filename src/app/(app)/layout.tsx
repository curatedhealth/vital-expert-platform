'use client';

import {
  Menu,
  X,
  Package2,
  User,
  Settings,
  LogOut,
  ChevronDown,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { DashboardSidebarWithSuspense } from '@/features/dashboard/components/dashboard-sidebar';
import { AgentsFilterProvider, useAgentsFilter } from '@/contexts/agents-filter-context';
import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@/lib/utils';

function AppLayoutContent({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut, userProfile } = useAuth();

  // Use agents filter context
  const { searchQuery, setSearchQuery, filters, setFilters, viewMode, setViewMode } = useAgentsFilter();

  const [businessFunctions, setBusinessFunctions] = useState<Array<{ id: string; name: string }>>([]);
  const [departments, setDepartments] = useState<Array<{ id: string; name: string; business_function_id?: string }>>([]);
  const [roles, setRoles] = useState<Array<{ id: string; name: string; department_id?: string; business_function_id?: string }>>([]);

  // Load organizational structure for agents view
  useEffect(() => {
    if (pathname.includes('/agents')) {
      fetch('/api/organizational-structure')
        .then(res => res.json())
        .then(result => {
          if (result.success && result.data) {
            if (result.data.functions) setBusinessFunctions(result.data.functions);
            if (result.data.departments) setDepartments(result.data.departments);
            if (result.data.roles) setRoles(result.data.roles);
          }
        })
        .catch(console.error);
    }
  }, [pathname]);

  // Agent management callbacks
  const handleCreateAgent = () => {
    router.push('/agents?create=true');
  };

  const handleUploadAgent = () => {
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
  // Skip auth check temporarily
  // if (!loading && !user) {
  //   //   router.push('/login');
  //   return null;
  // }

  // Skip loading state temporarily
  // if (loading) {
  //   //   return (
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
          <DashboardSidebarWithSuspense
            className="flex-1"
            isCollapsed={isCollapsed}
            onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
            currentView={getCurrentView()}
            onCreateAgent={getCurrentView() === 'agents' ? handleCreateAgent : undefined}
            onUploadAgent={getCurrentView() === 'agents' ? handleUploadAgent : undefined}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
            filters={filters}
            onFilterChange={setFilters}
            viewMode={viewMode}
            onViewModeChange={setViewMode}
            businessFunctions={businessFunctions}
            departments={departments}
            organizationalRoles={roles}
          />
        </div>
      </div>

      <div className="flex flex-col">
        {/* Internal Navigation Header */}
        <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6 backdrop-blur-sm bg-background/95">
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
                href="/dashboard"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === "/dashboard" ? "text-foreground" : "text-foreground/60"
                )}
              >
                Dashboard
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
                href="/ask-panel"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/ask-panel") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Ask Panel
              </Link>
              <Link
                href="/jobs-to-be-done"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/jobs-to-be-done") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Jobs-to-be-Done
              </Link>
              <Link
                href="/solution-builder"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/solution-builder") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Build Solution
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
                href="/knowledge"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/knowledge") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Knowledge
              </Link>
              <Link
                href="/prism"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/prism") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Prompt PRISM
              </Link>
              <Link
                href="/capabilities"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/capabilities") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Capabilities
              </Link>
              <Link
                href="/workflows"
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname.startsWith("/workflows") ? "text-foreground" : "text-foreground/60"
                )}
              >
                Workflows
              </Link>
            </nav>
          </div>

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <User className="h-4 w-4 text-primary" />
                </div>
                <span className="hidden md:inline-block text-sm font-medium">
                  {user?.email?.split('@')[0] || 'User'}
                </span>
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {user?.email?.split('@')[0] || 'User'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <User className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={signOut} className="text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Mobile Sidebar */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <div className="fixed inset-0 bg-black/80" onClick={() => setSidebarOpen(false)} onKeyDown={() => setSidebarOpen(false)} role="button" tabIndex={0} />
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
              <DashboardSidebarWithSuspense
                className="p-4"
                currentView={getCurrentView()}
                onCreateAgent={getCurrentView() === 'agents' ? handleCreateAgent : undefined}
                onUploadAgent={getCurrentView() === 'agents' ? handleUploadAgent : undefined}
                searchQuery={searchQuery}
                onSearchChange={setSearchQuery}
                filters={filters}
                onFilterChange={setFilters}
                viewMode={viewMode}
                onViewModeChange={setViewMode}
                businessFunctions={businessFunctions}
                departments={departments}
                organizationalRoles={roles}
              />
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className={cn(
          "flex flex-1 flex-col overflow-hidden",
          pathname === '/chat' ? '' : 'gap-4 p-4 lg:gap-6 lg:p-6'
        )}>
          {children}
        </main>
      </div>
    </div>
  );
}

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AgentsFilterProvider>
      <AppLayoutContent>{children}</AppLayoutContent>
    </AgentsFilterProvider>
  );
}
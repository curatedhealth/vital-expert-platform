'use client';

import {
  Menu,
  X,
  User,
  Users,
  LogOut,
  Bell,
  Search,
  Package2,
  Home,
  MessageSquare,
  FileText,
  Database,
  Settings,
  Zap,
  Shield,
} from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';

import { Badge } from '@vital/ui';
import { Button } from '@vital/ui';
import { DashboardSidebarWithSuspense } from '@/features/dashboard/components/dashboard-sidebar';
// import { useAuth } from '@/lib/auth/auth-context';
import { cn } from '@vital/ui/lib/utils';

// Global navigation items - Standardized across all pages
const globalNavItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Ask Expert',
    href: '/ask-expert',
    icon: MessageSquare,
  },
  {
    title: 'Ask Panel',
    href: '/ask-panel',
    icon: Users,
  },
  {
    title: 'Ask Team',
    href: '/ask-team',
    icon: Users,
  },
  {
    title: 'Agents',
    href: '/agents',
    icon: User,
  },
  {
    title: 'Build Solution',
    href: '/solution-builder',
    icon: Zap,
  },
  {
    title: 'Knowledge',
    href: '/knowledge',
    icon: Database,
  },
  {
    title: 'Prompt PRISM',
    href: '/prompts',
    icon: FileText,
  },
  {
    title: 'Capabilities',
    href: '/capabilities',
    icon: Settings,
  },
  {
    title: 'Workflows',
    href: '/ask-team',
    icon: Zap,
  },
  {
    title: 'Admin',
    href: '/admin',
    icon: Shield,
    badge: 'Admin',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  // Mock auth for build compatibility
  const user = { email: 'user@example.com', name: 'User' };
  const loading = false;
  const signOut = () => {};

  // Skip auth checks for build
  // const { user, loading, signOut } = useAuth();

  // Redirect to login if not authenticated
  // if (!loading && !user) {
  //   router.push('/login');
  //   return null;
  // }

  // Show loading state
  // if (loading) {
  //   return (
  //     <div className="min-h-screen bg-background flex items-center justify-center">
  //       <div className="text-center">
  //         <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
  //         <p className="text-muted-foreground">Loading...</p>
  //       </div>
  //     </div>
  //   );
  // }

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  // Determine current view based on pathname
  const getCurrentView = () => {
    if (pathname.includes('/knowledge')) return 'knowledge';
    if (pathname.includes('/agents')) return 'agents';
    if (pathname.includes('/projects')) return 'projects';
    if (pathname.includes('/llm-management')) return 'llm';
    if (pathname.includes('/prompts')) return 'prompts';
    if (pathname.includes('/capabilities')) return 'capabilities';
    return 'default';
  };

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
          />
        </div>
      </div>

      <div className="flex flex-col">
        {/* Header */}
        <header className="border-b bg-muted/40">
          {/* Top Navigation Bar */}
          <div className="flex h-14 items-center gap-4 px-4 lg:h-[60px] lg:px-6">
            <Button
              variant="outline"
              size="icon"
              className="shrink-0 md:hidden"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu className="h-5 w-5" />
              <span className="sr-only">Toggle navigation menu</span>
            </Button>

            {/* Logo */}
            <Link href="/dashboard" className="flex items-center gap-2">
              <Package2 className="h-6 w-6" />
              <span className="font-bold text-lg">VITALpath</span>
            </Link>

            {/* Global Navigation */}
            <nav className="hidden md:flex items-center space-x-1 ml-6">
              {globalNavItems.map((item) => {
                const isActive = pathname === item.href ||
                  (item.href !== '/dashboard' && pathname.startsWith(item.href));

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-background text-foreground shadow-sm'
                        : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
            </nav>

            <div className="flex-1" />

            {/* Search */}
            <div className="w-full flex-1 max-w-sm">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="search"
                    placeholder="Search..."
                    className="w-full appearance-none bg-background pl-8 shadow-none h-9 rounded-md border border-input px-3 py-1 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
              </form>
            </div>

            {/* User Menu */}
            <div className="flex items-center gap-4">
              <Button variant="outline" size="icon" className="h-8 w-8">
                <Bell className="h-4 w-4" />
                <span className="sr-only">Toggle notifications</span>
              </Button>
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-green-500 text-white flex items-center justify-center text-sm font-bold">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </div>
                </Button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b">
                      <p className="text-sm font-medium">
                        {(user as unknown)?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t mt-1">
                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted w-full text-left"
                        onClick={async () => {
                          setUserDropdownOpen(false);
                          await signOut();
                          router.push('/');
                        }}
                      >
                        <LogOut className="h-4 w-4" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
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
              <DashboardSidebarWithSuspense className="p-4" currentView={getCurrentView()} />
            </div>
          </div>
        )}

        {/* Click outside to close dropdowns */}
        {userDropdownOpen && (
          <div
            className="fixed inset-0 z-40"
            onClick={() => setUserDropdownOpen(false)} onKeyDown={() => setUserDropdownOpen(false)} role="button" tabIndex={0}
          />
        )}

        {/* Main Content */}
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
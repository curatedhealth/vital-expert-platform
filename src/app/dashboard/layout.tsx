'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { useAuth } from '@/lib/auth/auth-context';
import {
  Menu,
  X,
  Home,
  FolderOpen,
  MessageSquare,
  FileText,
  Settings,
  User,
  LogOut,
  Bell,
  HelpCircle,
  Brain,
  Target,
  TestTube,
  Play,
  BookOpen,
  ChevronDown,
  Database,
} from 'lucide-react';

const mainNavItems = [
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
    title: 'Ask Expert',
    href: '/dashboard/chat',
    icon: MessageSquare,
    badge: 'New',
  },
  {
    title: 'Knowledge',
    href: '/dashboard/knowledge',
    icon: Database,
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
];

const vitalPhases = [
  {
    title: 'Vision',
    href: '/dashboard/vision',
    icon: Brain,
    color: 'text-trust-blue',
  },
  {
    title: 'Intelligence',
    href: '/dashboard/integrate',
    icon: Target,
    color: 'text-progress-teal',
  },
  {
    title: 'Trials',
    href: '/dashboard/test',
    icon: TestTube,
    color: 'text-clinical-green',
  },
  {
    title: 'Activation',
    href: '/dashboard/activate',
    icon: Play,
    color: 'text-regulatory-gold',
  },
  {
    title: 'Learning',
    href: '/dashboard/learn',
    icon: BookOpen,
    color: 'text-market-purple',
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [phasesDropdownOpen, setPhasesDropdownOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, signOut } = useAuth();

  // Redirect to login if not authenticated
  if (!loading && !user) {
    router.push('/login');
    return null;
  }

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background-gray flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-trust-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-medical-gray">Loading...</p>
        </div>
      </div>
    );
  }

  const getInitials = (email: string) => {
    return email
      .split('@')[0]
      .split('.')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <div className="min-h-screen bg-background-gray">
      {/* Top Navigation */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="h-5 w-5" />
              </Button>
              <Link href="/" className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                <span className="font-bold text-xl text-deep-charcoal">VITALpath</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-progress-teal/10 text-progress-teal'
                        : 'text-medical-gray hover:text-deep-charcoal hover:bg-background-gray'
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

              {/* VITAL Phases Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="text-medical-gray hover:text-deep-charcoal flex items-center gap-1"
                  onClick={() => setPhasesDropdownOpen(!phasesDropdownOpen)}
                >
                  VITAL Phases
                  <ChevronDown className="h-4 w-4" />
                </Button>

                {phasesDropdownOpen && (
                  <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 text-xs font-semibold text-medical-gray uppercase tracking-wider border-b border-gray-100">
                      Framework Phases
                    </div>
                    {vitalPhases.map((phase) => (
                      <Link
                        key={phase.href}
                        href={phase.href}
                        className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-gray"
                        onClick={() => setPhasesDropdownOpen(false)}
                      >
                        <phase.icon className={`h-4 w-4 ${phase.color}`} />
                        {phase.title}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Side */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-clinical-red rounded-full text-xs text-white flex items-center justify-center">
                  2
                </span>
              </Button>

              {/* Help */}
              <Button variant="ghost" size="icon">
                <HelpCircle className="h-5 w-5" />
              </Button>

              {/* User Menu */}
              <div className="relative">
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="h-8 w-8 rounded-full bg-gradient-to-br from-trust-blue to-progress-teal text-white flex items-center justify-center text-sm font-bold">
                    {user?.email ? getInitials(user.email) : 'U'}
                  </div>
                </Button>

                {userDropdownOpen && (
                  <div className="absolute top-full right-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50">
                    <div className="px-3 py-2 border-b border-gray-100">
                      <p className="text-sm font-medium text-deep-charcoal">
                        {user?.user_metadata?.full_name || 'User'}
                      </p>
                      <p className="text-xs text-medical-gray">{user?.email}</p>
                    </div>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-gray"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <User className="h-4 w-4" />
                      Profile
                    </Link>
                    <Link
                      href="/dashboard/settings"
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-background-gray"
                      onClick={() => setUserDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" />
                      Settings
                    </Link>
                    <div className="border-t border-gray-100 mt-1">
                      <button
                        className="flex items-center gap-2 px-3 py-2 text-sm text-clinical-red hover:bg-background-gray w-full text-left"
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
        </div>
      </nav>

      {/* Mobile Sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🧩</span>
                <span className="font-bold text-lg">VITALpath</span>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="p-4 space-y-2">
              {mainNavItems.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium',
                      isActive
                        ? 'bg-progress-teal/10 text-progress-teal'
                        : 'text-medical-gray hover:text-deep-charcoal hover:bg-background-gray'
                    )}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="h-5 w-5" />
                    {item.title}
                    {item.badge && (
                      <Badge variant="secondary" className="text-xs ml-1">
                        {item.badge}
                      </Badge>
                    )}
                  </Link>
                );
              })}
              <div className="border-t pt-4 mt-4">
                <p className="text-xs font-semibold text-medical-gray uppercase tracking-wider mb-2">
                  VITAL Phases
                </p>
                {vitalPhases.map((phase) => (
                  <Link
                    key={phase.href}
                    href={phase.href}
                    className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-medical-gray hover:text-deep-charcoal hover:bg-background-gray"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <phase.icon className={`h-5 w-5 ${phase.color}`} />
                    {phase.title}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close dropdowns */}
      {(phasesDropdownOpen || userDropdownOpen) && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => {
            setPhasesDropdownOpen(false);
            setUserDropdownOpen(false);
          }}
        />
      )}

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
    </div>
  );
}
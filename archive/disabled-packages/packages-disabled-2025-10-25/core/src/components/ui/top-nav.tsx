'use client';

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
  BookOpen
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { cn } from '@/shared/services/utils';

// import { useAuth } from '@/lib/supabase/auth-context';

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
    title: 'AI Queries',
    href: '/dashboard/queries',
    icon: MessageSquare,
    badge: 'New',
  },
  {
    title: 'Documents',
    href: '/dashboard/documents',
    icon: FileText,
  },
];

  {
    title: 'Vision',
    href: '/dashboard/vision',
    icon: Brain,
    color: 'text-trust-blue',
  },
  {
    title: 'Integrate',
    href: '/dashboard/integrate',
    icon: Target,
    color: 'text-progress-teal',
  },
  {
    title: 'Test',
    href: '/dashboard/test',
    icon: TestTube,
    color: 'text-clinical-green',
  },
  {
    title: 'Activate',
    href: '/dashboard/activate',
    icon: Play,
    color: 'text-regulatory-gold',
  },
  {
    title: 'Learn',
    href: '/dashboard/learn',
    icon: BookOpen,
    color: 'text-market-purple',
  },
];

export function TopNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // const { user, signOut } = useAuth();

  // Mock user for demo - in real app this would come from auth context

    return email
      .split('@')[0]
      .split('.')
      .map(name => name.charAt(0).toUpperCase())
      .slice(0, 2)
      .join('');
  };

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-br from-trust-blue to-progress-teal rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">V</span>
            </div>
            <span className="font-bold text-xl text-deep-charcoal">VITALpath</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {!isAuthenticated ? (
              /* Public Navigation */
              <>
                <Link
                  href="#features"
                  className="text-medical-gray hover:text-deep-charcoal transition-colors"
                >
                  Features
                </Link>
                <Link
                  href="#framework"
                  className="text-medical-gray hover:text-deep-charcoal transition-colors"
                >
                  VITAL Framework
                </Link>
                <Link
                  href="#pricing"
                  className="text-medical-gray hover:text-deep-charcoal transition-colors"
                >
                  Pricing
                </Link>
                <Link
                  href="#about"
                  className="text-medical-gray hover:text-deep-charcoal transition-colors"
                >
                  About
                </Link>
              </>
            ) : (
              /* Dashboard Navigation */
              <>
                {mainNavItems.map((item) => {

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className="text-medical-gray hover:text-deep-charcoal"
                    >
                      VITAL Phases
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56">
                    <DropdownMenuLabel>Framework Phases</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {vitalPhases.map((phase) => (
                      <DropdownMenuItem key={phase.href} asChild>
                        <Link href={phase.href} className="flex items-center gap-2">
                          <phase.icon className={`h-4 w-4 ${phase.color}`} />
                          {phase.title}
                        </Link>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}
          </div>

          {/* Right Side */}
          <div className="flex items-center gap-4">
            {!isAuthenticated ? (
              /* Public Actions */
              <>
                <Button variant="ghost" asChild className="hidden sm:inline-flex">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button asChild className="bg-progress-teal hover:bg-progress-teal/90">
                  <Link href="/auth/register">Get Started</Link>
                </Button>
              </>
            ) : (
              /* Dashboard Actions */
              <>
                {/* Demo Mode Badge */}
                <Badge variant="outline" className="text-xs font-medium hidden sm:inline-flex">
                  Demo Mode
                </Badge>

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
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-gradient-to-br from-trust-blue to-progress-teal text-white">
                          {user?.email ? getInitials(user.email) : 'U'}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">
                          {(user as unknown)?.user_metadata?.full_name || 'Demo User'}
                        </p>
                        <p className="text-xs leading-none text-medical-gray">
                          {user?.email || 'demo@vitalpath.com'}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        Profile
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="text-clinical-red focus:text-clinical-red"
                      onClick={() => signOut()}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            )}

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t border-gray-200">
            {!isAuthenticated ? (
              /* Public Mobile Menu */
              <>
                <Link
                  href="#features"
                  className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#framework"
                  className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  VITAL Framework
                </Link>
                <Link
                  href="#pricing"
                  className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#about"
                  className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  About
                </Link>
                <div className="border-t border-gray-200 pt-4">
                  <Link
                    href="/auth/login"
                    className="block px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/auth/register"
                    className="block px-3 py-2 text-base font-medium text-progress-teal hover:text-progress-teal/90"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    Get Started
                  </Link>
                </div>
              </>
            ) : (
              /* Dashboard Mobile Menu */
              <>
                {mainNavItems.map((item) => {

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2 text-base font-medium',
                        isActive
                          ? 'text-progress-teal bg-progress-teal/10'
                          : 'text-medical-gray hover:text-deep-charcoal'
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <item.icon className="h-5 w-5" />
                      {item.title}
                      {item.badge && (
                        <Badge variant="secondary" className="text-xs">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}

                <div className="border-t border-gray-200 pt-4">
                  <div className="px-3 py-2 text-xs font-semibold text-medical-gray uppercase tracking-wider">
                    VITAL Phases
                  </div>
                  {vitalPhases.map((phase) => (
                    <Link
                      key={phase.href}
                      href={phase.href}
                      className="flex items-center gap-3 px-3 py-2 text-base font-medium text-medical-gray hover:text-deep-charcoal"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <phase.icon className={`h-5 w-5 ${phase.color}`} />
                      {phase.title}
                    </Link>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/shared/services/utils'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { 
  UserCircle, 
  LogOut, 
  Settings as SettingsIcon,
  LayoutDashboard,
  MessageSquare,
  Users,
  GitBranch,
  Box,
  UsersRound,
  BookOpen,
  Sparkles,
  Hammer,
  ShieldCheck,
} from 'lucide-react'
import { useAuth } from '@/lib/auth/supabase-auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// Top navigation routes with icons
const topNavRoutes = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard, color: 'text-blue-600' },
  { label: 'Ask Expert', href: '/ask-expert', icon: MessageSquare, color: 'text-blue-600' },
  { label: 'Ask Panel', href: '/ask-panel', icon: Users, color: 'text-purple-600' },
  { label: 'Workflows', href: '/workflows', icon: GitBranch, color: 'text-green-600' },
  { label: 'Solution Builder', href: '/solution-builder', icon: Box, color: 'text-orange-600' },
  { label: 'Agents', href: '/agents', icon: UsersRound, color: 'text-indigo-600' },
  { label: 'Tools', href: '/tools', icon: Hammer, color: 'text-gray-600' },
  { label: 'Knowledge', href: '/knowledge', icon: BookOpen, color: 'text-teal-600' },
  { label: 'Prompt Prism', href: '/prism', icon: Sparkles, color: 'text-pink-600' },
  { label: 'Admin', href: '/admin', icon: ShieldCheck, color: 'text-red-600' },
];

function DashboardHeader() {
  const pathname = usePathname()
  const { user, userProfile, signOut } = useAuth()


  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-4 flex-1 overflow-x-auto">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />

        {/* Enhanced Navigation with Icons */}
        <nav className="flex items-center gap-1 min-w-max">
          {topNavRoutes.map((route) => {
            const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
            const Icon = route.icon;
            return (
              <Link key={route.href} href={route.href}>
                <Button
                  variant={isActive ? "default" : "ghost"}
                  size="sm"
                  className={cn(
                    'gap-2 transition-all',
                    isActive 
                      ? 'bg-primary text-primary-foreground shadow-sm' 
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  )}
                >
                  <Icon className={cn("w-4 h-4", !isActive && route.color)} />
                  <span className="whitespace-nowrap">{route.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Menu */}
      <div className="flex items-center gap-2">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <UserCircle className="h-5 w-5" />
              <span className="sr-only">User menu</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium">My Account</p>
                {user?.email && (
                  <p className="text-xs text-muted-foreground">{userProfile?.full_name || user.email}</p>
                )}
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/profile" className="cursor-pointer">
                <UserCircle className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href="/settings" className="cursor-pointer">
                <SettingsIcon className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Sign out</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export function UnifiedDashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />

        {/* Main Content Area */}
        <SidebarInset className="flex flex-1 flex-col">
          {/* Header with View Selector, Breadcrumbs, and User Menu */}
          <DashboardHeader />

          {/* Main Content */}
          <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            {children}
          </main>
        </SidebarInset>
      </div>
    </SidebarProvider>
  )
}

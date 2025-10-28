'use client'

import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/shared/services/utils'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { UserCircle, LogOut, Settings as SettingsIcon } from 'lucide-react'
import { useAuth } from '@/lib/auth/supabase-auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'

// Route label mapping for breadcrumbs
const topNavRoutes = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Ask Expert', href: '/ask-expert' },
  { label: 'Ask Panel', href: '/ask-panel' },
  { label: 'Workflows', href: '/workflows' },
  { label: 'Solution Builder', href: '/solution-builder' },
  { label: 'Agents', href: '/agents' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Prompt Prism', href: '/prism' },
];

const routeLabels: Record<string, string> = {
  dashboard: 'Dashboard',
  'ask-expert': 'Ask Expert',
  'ask-panel': 'Ask Panel',
  workflows: 'Workflows',
  'solution-builder': 'Solution Builder',
  agents: 'Agents',
  knowledge: 'Knowledge',
  prism: 'Prompt Prism',
  admin: 'Admin',
  settings: 'Settings',
  profile: 'Profile',
}

function DashboardHeader() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()

  // Generate breadcrumb items from pathname
  const getBreadcrumbs = () => {
    if (!pathname) return []

    const paths = pathname.split('/').filter(Boolean)
    const breadcrumbs = []

    let currentPath = ''
    for (const path of paths) {
      currentPath += `/${path}`
      breadcrumbs.push({
        label: routeLabels[path] || path,
        href: currentPath,
      })
    }

    return breadcrumbs
  }

  const breadcrumbs = getBreadcrumbs()

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

        <nav className="flex items-center gap-3 min-w-max">
          {topNavRoutes.map((route) => {
            const isActive = pathname === route.href || pathname?.startsWith(`${route.href}/`);
            return (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  'text-sm font-medium transition-colors whitespace-nowrap',
                  isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
                )}
              >
                {route.label}
              </Link>
            );
          })}
        </nav>

        {/* Breadcrumbs */}
        <Breadcrumb>
          <BreadcrumbList>
            {breadcrumbs.map((breadcrumb, index) => {
              const isLast = index === breadcrumbs.length - 1

              return (
                <div key={breadcrumb.href} className="flex items-center gap-2">
                  {index > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {isLast ? (
                      <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink asChild>
                        <Link href={breadcrumb.href}>{breadcrumb.label}</Link>
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </div>
              )
            })}
          </BreadcrumbList>
        </Breadcrumb>
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
                  <p className="text-xs text-muted-foreground">{user.email}</p>
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

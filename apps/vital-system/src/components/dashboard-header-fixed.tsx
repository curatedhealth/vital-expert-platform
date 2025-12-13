'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  SidebarTrigger,
} from '@/components/ui/sidebar'
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
import { Separator } from '@/components/ui/separator'
import { VitalBreadcrumb } from '@/components/shared/VitalBreadcrumb'

// Type for route breadcrumb configuration
type RouteBreadcrumb = { label: string; parent?: string }

// Route-to-breadcrumb mapping for automatic breadcrumb generation
const ROUTE_BREADCRUMBS: Record<string, RouteBreadcrumb> = {
  '/dashboard': { label: 'Dashboard' },
  '/ask-expert': { label: 'Ask Expert' },
  '/ask-expert/interactive': { label: 'Interactive Chat', parent: '/ask-expert' },
  '/ask-expert/autonomous': { label: 'Autonomous Mission', parent: '/ask-expert' },
  '/ask-expert/missions': { label: 'Mission History', parent: '/ask-expert' },
  '/ask-expert/templates': { label: 'Research Templates', parent: '/ask-expert' },
  '/agents': { label: 'Browse Agents' },
  '/discover': { label: 'Discover' },
  '/discover/tools': { label: 'Tools', parent: '/discover' },
  '/discover/skills': { label: 'Skills', parent: '/discover' },
  '/workflows': { label: 'Workflows' },
  '/profile': { label: 'Profile' },
  '/settings': { label: 'Settings' },
}

function generateBreadcrumbs(pathname: string) {
  // Remove query params and get base path
  const basePath = pathname.split('?')[0]

  // Check if route has a specific config
  const routeConfig = ROUTE_BREADCRUMBS[basePath]

  if (!routeConfig) {
    // For unknown routes, generate from path segments
    const segments = basePath.split('/').filter(Boolean)
    if (segments.length === 0) return []

    return segments.map((segment, index) => {
      const href = '/' + segments.slice(0, index + 1).join('/')
      const isLast = index === segments.length - 1
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      return { label, href: isLast ? undefined : href }
    })
  }

  // Build breadcrumb chain from parent relationships
  const items: Array<{ label: string; href?: string }> = []
  let currentPath: string | undefined = basePath

  while (currentPath) {
    const config: RouteBreadcrumb | undefined = ROUTE_BREADCRUMBS[currentPath]
    if (config) {
      // Insert at beginning to build from root to current
      items.unshift({
        label: config.label,
        href: currentPath === basePath ? undefined : currentPath,
      })
      currentPath = config.parent
    } else {
      break
    }
  }

  return items
}

interface DashboardHeaderProps {
  /** Optional breadcrumb component to display after the sidebar trigger (overrides auto-generated) */
  breadcrumb?: React.ReactNode;
}

export function DashboardHeader({ breadcrumb }: DashboardHeaderProps) {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  // Generate breadcrumbs from current route
  const autoBreadcrumbItems = generateBreadcrumbs(pathname)

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-4">
      <div className="flex items-center gap-2 flex-1">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        {/* Use custom breadcrumb if provided, otherwise auto-generate from route */}
        {breadcrumb || (autoBreadcrumbItems.length > 0 && (
          <VitalBreadcrumb
            showHome
            items={autoBreadcrumbItems}
            className="mb-0"
          />
        ))}
      </div>

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

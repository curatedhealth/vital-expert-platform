'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home } from 'lucide-react'
import { SidebarProvider, SidebarInset, SidebarTrigger } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { MainNavbar } from '@/components/navbar/MainNavbar'
import { Separator } from '@/components/ui/separator'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'

// Routes that should NOT show the global AppSidebar (they have their own navigation)
// Note: /value now uses the standard sidebar for consistency
const FULL_WIDTH_ROUTES: string[] = []

// Route label mappings for prettier breadcrumb display
const ROUTE_LABELS: Record<string, string> = {
  'discover': 'Discover',
  'skills': 'Skills',
  'tools': 'Tools',
  'agents': 'Agents',
  'knowledge': 'Knowledge',
  'prompts': 'Prompts',
  'workflows': 'Workflows',
  'ask-expert': 'Ask Expert',
  'ask-panel': 'Ask Panel',
  'chat': 'Chat',
  'admin': 'Admin',
  'settings': 'Settings',
  'dashboard': 'Dashboard',
  'value': 'Value View',
  'optimize': 'Optimize',
  'personas': 'Personas',
  'roles': 'Roles',
  'missions': 'Missions',
  'suites': 'Suites',
}

// Generate breadcrumb items from pathname
function generateBreadcrumbs(pathname: string): { label: string; href?: string }[] {
  if (!pathname || pathname === '/') return []

  // Remove leading slash and split by /
  const segments = pathname.replace(/^\//, '').split('/').filter(Boolean)

  // Filter out query params from last segment
  if (segments.length > 0) {
    segments[segments.length - 1] = segments[segments.length - 1].split('?')[0]
  }

  const items: { label: string; href?: string }[] = []
  let currentPath = ''

  segments.forEach((segment, index) => {
    currentPath += `/${segment}`
    const isLast = index === segments.length - 1

    // Get label from mapping or capitalize segment
    let label = ROUTE_LABELS[segment.toLowerCase()] ||
      segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')

    // For dynamic routes like [slug], try to make it readable
    if (segment.startsWith('[') && segment.endsWith(']')) {
      label = segment.slice(1, -1).charAt(0).toUpperCase() + segment.slice(2, -1)
    }

    items.push({
      label,
      href: isLast ? undefined : currentPath,
    })
  })

  return items
}

export function UnifiedDashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Check if current route should be full-width (no global sidebar)
  const isFullWidthRoute = FULL_WIDTH_ROUTES.some(route => pathname?.startsWith(route))

  // Generate breadcrumb items from current path
  const breadcrumbItems = useMemo(() => generateBreadcrumbs(pathname || ''), [pathname])

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent" />
          <p className="mt-2 text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  // Full-width layout for routes like /value that have their own sidebar
  if (isFullWidthRoute) {
    return (
      <div className="flex min-h-screen w-full flex-col">
        {/* Main Navbar - Keep consistent */}
        <MainNavbar />

        {/* Full-width Content Area (no global sidebar) */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    )
  }

  // Standard layout with global sidebar
  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        {/* Main Navbar - Above Everything */}
        <MainNavbar />

        {/* Sidebar and Content */}
        <div className="flex flex-1">
          <AppSidebar className="!top-16 !h-[calc(100vh-4rem)]" />

          {/* Main Content Area */}
          <SidebarInset className="flex flex-1 flex-col">
            {/* Sidebar Toggle Header with Breadcrumb */}
            <header className="flex h-10 shrink-0 items-center gap-2 border-b px-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <SidebarTrigger className="-ml-1" />
                </TooltipTrigger>
                <TooltipContent side="right">
                  Toggle sidebar (⌘B)
                </TooltipContent>
              </Tooltip>
              <Separator orientation="vertical" className="mr-2 h-4" />

              {/* Breadcrumb Navigation */}
              {breadcrumbItems.length > 0 && (
                <Breadcrumb>
                  <BreadcrumbList>
                    {/* Home link */}
                    <BreadcrumbItem>
                      <BreadcrumbLink asChild>
                        <Link href="/dashboard" className="flex items-center">
                          <Home className="h-4 w-4" />
                        </Link>
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />

                    {/* Path segments */}
                    {breadcrumbItems.map((item, index) => {
                      const isLast = index === breadcrumbItems.length - 1
                      return (
                        <React.Fragment key={item.label + index}>
                          <BreadcrumbItem>
                            {isLast || !item.href ? (
                              <BreadcrumbPage>{item.label}</BreadcrumbPage>
                            ) : (
                              <BreadcrumbLink asChild>
                                <Link href={item.href}>{item.label}</Link>
                              </BreadcrumbLink>
                            )}
                          </BreadcrumbItem>
                          {!isLast && item.href && <BreadcrumbSeparator />}
                        </React.Fragment>
                      )
                    })}
                  </BreadcrumbList>
                </Breadcrumb>
              )}
            </header>
            {/* Main Content */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </div>
    </SidebarProvider>
  )
}

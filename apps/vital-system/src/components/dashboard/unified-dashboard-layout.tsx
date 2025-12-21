'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Home, PanelLeftOpen, PanelLeftClose } from 'lucide-react'
import { AppSidebar } from '@/components/app-sidebar'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { HeaderActionsProvider, HeaderActionsSlot } from '@/contexts/header-actions-context'
import { SidebarProvider, useSidebar } from '@/contexts/sidebar-context'

// Routes that should NOT show the global AppSidebar (they have their own navigation)
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

// ============================================================================
// SIDEBAR TOGGLE BUTTON - For header
// ============================================================================

function SidebarToggleButton() {
  const { isExpanded, toggleSidebar } = useSidebar()

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="h-8 w-8 shrink-0"
        >
          {isExpanded ? (
            <PanelLeftClose className="h-4 w-4" />
          ) : (
            <PanelLeftOpen className="h-4 w-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// MAIN CONTENT - Uses sidebar context for margin
// ============================================================================

function DashboardContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { sidebarWidth } = useSidebar()

  // Generate breadcrumb items from current path
  const breadcrumbItems = useMemo(() => generateBreadcrumbs(pathname || ''), [pathname])

  return (
    <>
      {/* Fixed Sidebar */}
      <AppSidebar />

      {/* Main Content Area - offset by sidebar width */}
      <div
        className="min-h-screen flex flex-col transition-[margin-left] duration-200 ease-out"
        style={{ marginLeft: sidebarWidth }}
      >
        {/* Header with breadcrumb and actions */}
        <header className="flex h-10 shrink-0 items-center gap-2 border-b border-border/40 px-4 bg-background/80 backdrop-blur-sm sticky top-0 z-30">
          {/* Left side: Sidebar toggle + Breadcrumb Navigation */}
          <div className="flex items-center gap-2">
            {/* Sidebar Toggle Button */}
            <SidebarToggleButton />

            {/* Breadcrumb */}
            {breadcrumbItems.length > 0 ? (
              <Breadcrumb>
                <BreadcrumbList className="flex-nowrap items-center gap-1.5 sm:gap-2">
                  {/* Home link */}
                  <BreadcrumbItem>
                    <BreadcrumbLink asChild>
                      <Link href="/dashboard" className="flex items-center text-muted-foreground hover:text-foreground">
                        <Home className="h-4 w-4" />
                      </Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="[&>svg]:size-3.5" />

                  {/* Path segments */}
                  {breadcrumbItems.map((item, index) => {
                    const isLast = index === breadcrumbItems.length - 1
                    return (
                      <React.Fragment key={item.label + index}>
                        <BreadcrumbItem>
                          {isLast || !item.href ? (
                            <BreadcrumbPage className="text-sm font-medium">{item.label}</BreadcrumbPage>
                          ) : (
                            <BreadcrumbLink asChild>
                              <Link href={item.href} className="text-sm text-muted-foreground hover:text-foreground">{item.label}</Link>
                            </BreadcrumbLink>
                          )}
                        </BreadcrumbItem>
                        {!isLast && item.href && <BreadcrumbSeparator className="[&>svg]:size-3.5" />}
                      </React.Fragment>
                    )
                  })}
                </BreadcrumbList>
              </Breadcrumb>
            ) : null}
          </div>

          {/* Right side: Dynamic actions slot (always visible) */}
          <div className="flex-1 flex items-center justify-end gap-2">
            <HeaderActionsSlot />
          </div>
        </header>

        {/* Main Content */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    </>
  )
}

// ============================================================================
// MAIN LAYOUT EXPORT
// ============================================================================

export function UnifiedDashboardLayout({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()

  // Check if current route should be full-width (no global sidebar)
  const isFullWidthRoute = FULL_WIDTH_ROUTES.some(route => pathname?.startsWith(route))

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
        {/* Full-width Content Area (no global sidebar) */}
        <main className="flex flex-1 flex-col">
          {children}
        </main>
      </div>
    )
  }

  // Standard layout with fixed narrow sidebar
  return (
    <SidebarProvider>
      <HeaderActionsProvider>
        <DashboardContent>{children}</DashboardContent>
      </HeaderActionsProvider>
    </SidebarProvider>
  )
}

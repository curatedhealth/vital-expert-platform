'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { MainNavbar } from '@/components/navbar/MainNavbar'

// Routes that should NOT show the global AppSidebar (they have their own navigation)
// Note: /value now uses the standard sidebar for consistency
const FULL_WIDTH_ROUTES: string[] = []

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

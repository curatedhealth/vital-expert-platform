'use client'

/**
 * @deprecated This component is OBSOLETE and NOT USED.
 *
 * The app uses `AppLayoutClient` -> `UnifiedDashboardLayout` instead.
 * See: src/app/(app)/AppLayoutClient.tsx
 * See: src/components/dashboard/unified-dashboard-layout.tsx
 *
 * This file can be safely deleted after December 2025.
 * Last updated: December 15, 2025
 */

import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { DashboardHeader } from '@/components/dashboard-header-fixed'
import { HeaderActionsProvider } from '@/contexts/header-actions-context'

/**
 * @deprecated Use `UnifiedDashboardLayout` instead.
 */
export function ClientSideLayout({ children }: { children: React.ReactNode }) {
  console.warn('[DEPRECATED] ClientSideLayout is obsolete. Use UnifiedDashboardLayout instead.')
  return (
    <HeaderActionsProvider>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />

          {/* Main Content Area */}
          <SidebarInset className="flex flex-1 flex-col">
            {/* Header with Breadcrumbs and User Menu */}
            <DashboardHeader />

            {/* Main Content */}
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
              {children}
            </main>
          </SidebarInset>
        </div>
      </SidebarProvider>
    </HeaderActionsProvider>
  )
}

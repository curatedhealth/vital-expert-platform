'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'

export type DashboardView = 'ask-expert' | 'ask-panel' | 'workflows' | 'solution-builder'

interface DashboardContextType {
  currentView: DashboardView
  setCurrentView: (view: DashboardView) => void
  navigateToView: (view: DashboardView) => void
}

const DashboardContext = createContext<DashboardContextType | undefined>(undefined)

// Map routes to views
const routeToViewMap: Record<string, DashboardView> = {
  '/ask-expert': 'ask-expert',
  '/ask-panel': 'ask-panel',
  '/workflows': 'workflows',
  '/solution-builder': 'solution-builder',
}

// Map views to routes
const viewToRouteMap: Record<DashboardView, string> = {
  'ask-expert': '/ask-expert',
  'ask-panel': '/ask-panel',
  'workflows': '/workflows',
  'solution-builder': '/solution-builder',
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const [currentView, setCurrentView] = useState<DashboardView>('ask-expert')

  // Update current view based on pathname
  useEffect(() => {
    const view = routeToViewMap[pathname]
    if (view) {
      setCurrentView(view)
    }
  }, [pathname])

  // Navigate to a view
  const navigateToView = (view: DashboardView) => {
    const route = viewToRouteMap[view]
    if (route) {
      router.push(route)
    }
  }

  return (
    <DashboardContext.Provider value={{ currentView, setCurrentView, navigateToView }}>
      {children}
    </DashboardContext.Provider>
  )
}

export function useDashboard() {
  const context = useContext(DashboardContext)
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider')
  }
  return context
}

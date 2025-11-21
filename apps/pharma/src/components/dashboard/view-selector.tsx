'use client'

import React from 'react'
import { MessageSquare, Users, Workflow, Wand2, ChevronDown } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useDashboard, type DashboardView } from '@/contexts/dashboard-context'

interface ViewOption {
  value: DashboardView
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
}

const viewOptions: ViewOption[] = [
  {
    value: 'ask-expert',
    label: 'Ask Expert',
    icon: MessageSquare,
    description: 'AI-powered expert consultation',
  },
  {
    value: 'ask-panel',
    label: 'Ask Panel',
    icon: Users,
    description: 'Expert panel review system',
  },
  {
    value: 'workflows',
    label: 'Workflows',
    icon: Workflow,
    description: 'Automated process management',
  },
  {
    value: 'solution-builder',
    label: 'Solution Builder',
    icon: Wand2,
    description: 'Build custom solutions',
  },
]

export function ViewSelector() {
  const { currentView, navigateToView } = useDashboard()

  const selectedOption = viewOptions.find((option) => option.value === currentView)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="w-[200px] justify-between">
          {selectedOption ? (
            <div className="flex items-center gap-2">
              <selectedOption.icon className="h-4 w-4" />
              <span>{selectedOption.label}</span>
            </div>
          ) : (
            'Select view...'
          )}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-[250px]">
        <DropdownMenuLabel>Switch View</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {viewOptions.map((option) => (
          <DropdownMenuItem
            key={option.value}
            onClick={() => navigateToView(option.value)}
            className="flex items-start gap-2 cursor-pointer"
          >
            <option.icon className="h-4 w-4 mt-0.5" />
            <div className="flex flex-col">
              <span className="font-medium">{option.label}</span>
              <span className="text-xs text-muted-foreground">{option.description}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

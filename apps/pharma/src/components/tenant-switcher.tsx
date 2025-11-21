'use client'

import * as React from 'react'
import { ChevronsUpDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar'
import Image from 'next/image'

export function TenantSwitcher() {
  const [activeTenant, setActiveTenant] = React.useState({
    name: 'Vital Expert',
    logo: '/logos/vital-expert-logo.svg',
    plan: 'Enterprise',
  })

  const tenants = [
    {
      name: 'Vital Expert',
      logo: '/logos/vital-expert-logo.svg',
      plan: 'Enterprise',
    },
    {
      name: 'Vital Pharma',
      logo: '/logos/vital-pharma-logo.svg',
      plan: 'Pro',
    },
    {
      name: 'Vital Startup',
      logo: '/logos/vital-startup-logo.svg',
      plan: 'Free',
    },
  ]

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <SidebarMenuButton
              size="lg"
              className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
            >
              <div className="flex aspect-square size-10 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Image
                  src={activeTenant.logo}
                  alt={activeTenant.name}
                  width={40}
                  height={40}
                  className="size-10"
                />
              </div>
              <ChevronsUpDown className="ml-auto size-4" />
            </SidebarMenuButton>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side="bottom"
            sideOffset={4}
          >
            {tenants.map((tenant) => (
              <DropdownMenuItem
                key={tenant.name}
                onClick={() => setActiveTenant(tenant)}
                className="gap-2 p-2 cursor-pointer"
              >
                <div className="flex size-12 items-center justify-center rounded-sm border">
                  <Image
                    src={tenant.logo}
                    alt={tenant.name}
                    width={48}
                    height={48}
                    className="size-12"
                  />
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}

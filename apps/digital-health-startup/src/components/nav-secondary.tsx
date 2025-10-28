"use client"

import Link from "next/link"
import { LucideIcon } from "lucide-react"

import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { cn } from "@/shared/services/utils"

export function NavSecondary({
  items,
  ...props
}: {
  items: {
    title: string
    url: string
    icon: LucideIcon
    isActive?: boolean
  }[]
} & React.ComponentPropsWithoutRef<typeof SidebarGroup>) {
  return (
    <SidebarGroup {...props}>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild={Boolean(item.url)}
              data-active={item.isActive ? "true" : undefined}
              className={cn(
                item.isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              {item.url ? (
                <Link href={item.url}>
                  <item.icon />
                  <span>{item.title}</span>
                </Link>
              ) : (
                <div className="flex w-full items-center gap-2">
                  <item.icon />
                  <span>{item.title}</span>
                </div>
              )}
            </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
}

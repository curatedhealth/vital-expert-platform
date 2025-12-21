"use client"

import { useMemo, useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { useTheme } from "next-themes"

import { useAuth, sanitizeDisplayName } from "@/lib/auth/supabase-auth-context"
import { useSidebar, SIDEBAR_COLLAPSED_WIDTH, SIDEBAR_EXPANDED_WIDTH } from "@/contexts/sidebar-context"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  TooltipProvider,
} from "@/components/ui/tooltip"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

// Navigation config
import {
  consultItems,
  discoverItems,
  craftItems,
  optimizeItems,
} from "@/components/navbar/navigation-config"

// Icons
import {
  Sparkles,
  Plus,
  MessageSquare,
  Search,
  Palette,
  Layers,
  Bell,
  Settings,
  User,
  Shield,
  LayoutDashboard,
  ChevronRight,
  ChevronLeft,
} from "lucide-react"

// ============================================================================
// TOGGLE BUTTON - Expand/Collapse sidebar
// ============================================================================

interface ToggleButtonProps {
  isExpanded: boolean
  onToggle: () => void
}

function ToggleButton({ isExpanded, onToggle }: ToggleButtonProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          onClick={onToggle}
          className={cn(
            "absolute -right-3 top-1/2 -translate-y-1/2 z-50",
            "w-6 h-6 rounded-full",
            "bg-background border border-border/60 shadow-sm",
            "flex items-center justify-center",
            "hover:bg-accent hover:border-primary/30 transition-all duration-200",
            "focus:outline-none focus:ring-2 focus:ring-primary/20"
          )}
        >
          {isExpanded ? (
            <ChevronLeft className="w-3.5 h-3.5 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground" />
          )}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right" sideOffset={8}>
        {isExpanded ? 'Collapse sidebar' : 'Expand sidebar'}
      </TooltipContent>
    </Tooltip>
  )
}

// ============================================================================
// NAV ITEM - Icon with optional label
// ============================================================================

interface NavItemProps {
  icon: React.ElementType
  label: string
  href?: string
  onClick?: () => void
  isActive?: boolean
  badge?: boolean
  isExpanded?: boolean
  className?: string
}

function NavItem({
  icon: Icon,
  label,
  href,
  onClick,
  isActive,
  badge,
  isExpanded,
  className,
}: NavItemProps) {
  const content = (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex items-center gap-3 rounded-lg cursor-pointer transition-all",
            "hover:bg-accent/60 text-muted-foreground hover:text-foreground",
            isActive && "bg-accent/80 text-foreground",
            isExpanded ? "px-3 py-2" : "flex-col justify-center gap-0.5 py-2.5 px-2",
            className
          )}
          onClick={onClick}
        >
          <div className="relative flex-shrink-0">
            <Icon className="h-5 w-5" />
            {badge && (
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-500 rounded-full" />
            )}
          </div>
          {isExpanded ? (
            <span className="text-sm font-medium truncate">{label}</span>
          ) : (
            label && <span className="text-[10px] font-medium leading-tight">{label}</span>
          )}
        </div>
      </TooltipTrigger>
      {!isExpanded && (
        <TooltipContent side="right" className="ml-1">
          {label || 'Navigate'}
        </TooltipContent>
      )}
    </Tooltip>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}

// ============================================================================
// NAV SECTION WITH POPOVER - Shows submenu on hover/click
// ============================================================================

interface NavSectionProps {
  icon: React.ElementType
  label: string
  items: Array<{
    label: string
    href: string
    description: string
    icon: React.ElementType
  }>
  isActive?: boolean
  isExpanded?: boolean
}

function NavSection({ icon: Icon, label, items, isActive, isExpanded }: NavSectionProps) {
  const [open, setOpen] = useState(false)

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger asChild>
            <div
              className={cn(
                "flex items-center gap-3 rounded-lg cursor-pointer transition-all",
                "hover:bg-accent/60 text-muted-foreground hover:text-foreground",
                isActive && "bg-accent/80 text-foreground",
                isExpanded ? "px-3 py-2 justify-between" : "flex-col justify-center gap-0.5 py-2.5 px-2"
              )}
            >
              <div className={cn("flex items-center gap-3", !isExpanded && "flex-col gap-0.5")}>
                <Icon className="h-5 w-5 flex-shrink-0" />
                {isExpanded ? (
                  <span className="text-sm font-medium truncate">{label}</span>
                ) : (
                  <span className="text-[10px] font-medium leading-tight">{label}</span>
                )}
              </div>
              {isExpanded && (
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  open && "rotate-90"
                )} />
              )}
            </div>
          </PopoverTrigger>
        </TooltipTrigger>
        {!isExpanded && (
          <TooltipContent side="right" className="ml-1">
            {label}
          </TooltipContent>
        )}
      </Tooltip>

      <PopoverContent
        side="right"
        align="start"
        sideOffset={8}
        className="w-64 p-2"
      >
        <div className="space-y-1">
          <div className="px-3 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            {label}
          </div>
          {items.map((item) => {
            const ItemIcon = item.icon
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2 rounded-md hover:bg-accent transition-colors"
              >
                <ItemIcon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">{item.label}</div>
                  <div className="text-xs text-muted-foreground truncate">
                    {item.description}
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </PopoverContent>
    </Popover>
  )
}

// ============================================================================
// MAIN SIDEBAR COMPONENT - Toggle Collapse/Expand
// ============================================================================

export function AppSidebar({
  className,
}: {
  className?: string
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile } = useAuth()
  const { isExpanded, toggleSidebar, sidebarWidth } = useSidebar()
  const { resolvedTheme } = useTheme()
  const isDark = resolvedTheme === 'dark'

  // For hydration safety
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    requestAnimationFrame(() => {
      setMounted(true)
    })
  }, [])

  const sidebarUser = useMemo(() => ({
    name: sanitizeDisplayName(
      userProfile?.full_name ||
        user?.user_metadata?.full_name ||
        user?.user_metadata?.name,
      user?.email || userProfile?.email
    ),
    email: user?.email || "",
    avatar: ((userProfile as any)?.avatar_url || user?.user_metadata?.avatar_url || "") as string,
  }), [user, userProfile])

  const isPathActive = (href: string) => {
    const cleanHref = href.split('?')[0]
    return pathname === cleanHref || pathname?.startsWith(`${cleanHref}/`)
  }

  // Check if any item in a section is active
  const isSectionActive = (items: Array<{ href: string }>) => {
    return items.some(item => isPathActive(item.href))
  }

  // Don't render Sidebar until mounted
  if (!mounted) {
    return (
      <aside className={cn(
        "fixed left-0 top-0 bottom-0 bg-background border-r border-border/40",
        "flex flex-col items-center py-4",
        className
      )} style={{ width: SIDEBAR_COLLAPSED_WIDTH }}>
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <Sparkles className="w-5 h-5 text-primary" />
        </div>
      </aside>
    )
  }

  return (
    <TooltipProvider delayDuration={100}>
      <aside
        className={cn(
          "fixed left-0 top-0 bottom-0 bg-background border-r border-border/40",
          "flex flex-col z-40 transition-[width] duration-200 ease-out",
          className
        )}
        style={{ width: sidebarWidth }}
      >
        {/* Toggle Button - Always visible */}
        <ToggleButton isExpanded={isExpanded} onToggle={toggleSidebar} />

        {/* Header - Logo */}
        <div className={cn(
          "flex items-center py-4 border-b border-border/40",
          isExpanded ? "px-4 justify-start gap-3" : "justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Link
                href="/dashboard"
                className="flex items-center gap-3 hover:opacity-90 transition-opacity flex-shrink-0"
              >
                {isExpanded ? (
                  <Image
                    src={isDark ? "/assets/vital/logo/vital-wordmark-dark.svg" : "/assets/vital/logo/vital-wordmark-light.svg"}
                    alt="VITAL"
                    width={140}
                    height={44}
                    className="h-11 w-auto"
                    priority
                  />
                ) : (
                  <Image
                    src={isDark ? "/assets/vital/logo/vital-icon-outline-dark.svg" : "/assets/vital/logo/vital-icon-outline-light.svg"}
                    alt="VITAL"
                    width={40}
                    height={40}
                    className="h-10 w-10"
                    priority
                  />
                )}
              </Link>
            </TooltipTrigger>
            {!isExpanded && <TooltipContent side="right">VITAL Home</TooltipContent>}
          </Tooltip>
        </div>

        {/* New Chat Button */}
        <div className={cn(
          "flex py-3",
          isExpanded ? "px-3" : "items-center justify-center"
        )}>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size={isExpanded ? "default" : "icon"}
                className={cn(
                  "border-border hover:bg-accent hover:border-accent",
                  isExpanded ? "w-full justify-start gap-2" : "w-10 h-10 rounded-full"
                )}
                onClick={() => router.push('/ask')}
              >
                <Plus className="h-5 w-5 flex-shrink-0" />
                {isExpanded && <span>New Chat</span>}
              </Button>
            </TooltipTrigger>
            {!isExpanded && <TooltipContent side="right">New Chat</TooltipContent>}
          </Tooltip>
        </div>

        {/* Main Navigation */}
        <nav className={cn(
          "flex-1 flex flex-col py-2 space-y-1 overflow-y-auto",
          isExpanded ? "px-2" : "items-center px-1"
        )}>
          {/* Hub/Dashboard */}
          <NavItem
            icon={LayoutDashboard}
            label="Hub"
            href="/dashboard"
            isActive={isPathActive('/dashboard')}
            isExpanded={isExpanded}
          />

          {/* Services - Consult items */}
          <NavSection
            icon={MessageSquare}
            label="Services"
            items={consultItems}
            isActive={isSectionActive(consultItems)}
            isExpanded={isExpanded}
          />

          {/* Marketplace - Discover items */}
          <NavSection
            icon={Search}
            label="Discover"
            items={discoverItems}
            isActive={isSectionActive(discoverItems)}
            isExpanded={isExpanded}
          />

          {/* Designer - Craft items */}
          <NavSection
            icon={Palette}
            label="Designer"
            items={craftItems}
            isActive={isSectionActive(craftItems)}
            isExpanded={isExpanded}
          />

          {/* Navigator - Optimize items */}
          <NavSection
            icon={Layers}
            label="Navigator"
            items={optimizeItems}
            isActive={isSectionActive(optimizeItems)}
            isExpanded={isExpanded}
          />

          {/* Admin */}
          <NavItem
            icon={Shield}
            label="Admin"
            href="/admin"
            isActive={isPathActive('/admin')}
            isExpanded={isExpanded}
          />
        </nav>

        {/* Footer */}
        <div className={cn(
          "flex flex-col py-3 space-y-1 border-t border-border/40",
          isExpanded ? "px-2" : "items-center"
        )}>
          {/* Notifications */}
          <NavItem
            icon={Bell}
            label={isExpanded ? "Notifications" : ""}
            href="/notifications"
            badge={true}
            isExpanded={isExpanded}
          />

          {/* User Avatar */}
          {user && (
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/profile"
                  className={cn(
                    "flex items-center gap-3 rounded-lg hover:bg-accent/60 transition-colors",
                    isExpanded ? "px-3 py-2" : "flex-col gap-0.5 py-2 px-2"
                  )}
                >
                  <div className="relative flex-shrink-0">
                    {sidebarUser.avatar ? (
                      <img
                        src={sidebarUser.avatar}
                        alt={sidebarUser.name}
                        className="w-8 h-8 rounded-full object-cover border-2 border-border"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                        <User className="w-4 h-4 text-muted-foreground" />
                      </div>
                    )}
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 rounded-full border-2 border-background" />
                  </div>
                  {isExpanded ? (
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{sidebarUser.name}</div>
                      <div className="text-xs text-muted-foreground truncate">{sidebarUser.email}</div>
                    </div>
                  ) : (
                    <span className="text-[10px] font-medium text-muted-foreground">Account</span>
                  )}
                </Link>
              </TooltipTrigger>
              {!isExpanded && <TooltipContent side="right">{sidebarUser.name}</TooltipContent>}
            </Tooltip>
          )}

          {/* Settings */}
          <NavItem
            icon={Settings}
            label="Settings"
            href="/settings"
            isActive={isPathActive('/settings')}
            isExpanded={isExpanded}
          />
        </div>
      </aside>
    </TooltipProvider>
  )
}

// Export sidebar width for layout
export const SIDEBAR_WIDTH = SIDEBAR_COLLAPSED_WIDTH

'use client'

import * as React from 'react'
import Image from 'next/image'
import {
  ChevronsUpDown,
  UserCircle,
  LogOut,
  Settings as SettingsIcon,
  MessageSquare,
  Users,
  Workflow,
  Wrench,
  BookOpen,
  Brain,
  Target,
  Lightbulb,
  LayoutDashboard,
  Shield,
  Search,
  Bell,
  Plus,
  Command as CommandIcon,
  FileText,
  Zap,
  Palette
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from '@/components/ui/navigation-menu'
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/supabase-auth-context'
import { usePathname, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'
import { TenantSwitcher } from '@/components/tenant-switcher'
import { cn } from '@/lib/utils'

// Grouped navigation structure
const servicesItems = [
  {
    label: 'Ask Expert',
    href: '/ask-expert',
    description: '1:1 expert consultation with AI agents',
    icon: MessageSquare
  },
  {
    label: 'Ask Panel',
    href: '/ask-panel',
    description: 'Multi-expert panel discussions',
    icon: Users
  },
  {
    label: 'Workflows',
    href: '/workflows',
    description: 'Automated agent workflows',
    icon: Workflow
  },
  {
    label: 'Solution Builder',
    href: '/solution-builder',
    description: 'Build custom solutions',
    icon: Wrench
  },
]

const libraryItems = [
  {
    label: 'Agents',
    href: '/agents',
    description: 'Browse expert AI agents',
    icon: Brain
  },
  {
    label: 'Tools',
    href: '/tools',
    description: 'Explore available tools',
    icon: Wrench
  },
  {
    label: 'Knowledge',
    href: '/knowledge',
    description: 'Domain knowledge base',
    icon: BookOpen
  },
  {
    label: 'Personas',
    href: '/personas',
    description: 'User personas library',
    icon: UserCircle
  },
  {
    label: 'Jobs-to-be-Done',
    href: '/jobs-to-be-done',
    description: 'JTBD framework',
    icon: Target
  },
  {
    label: 'Prompt Prism',
    href: '/prism',
    description: 'Prompt templates',
    icon: Lightbulb
  },
]

// ListItem component for navigation menu items
const ListItem = React.forwardRef<
  React.ElementRef<'a'>,
  React.ComponentPropsWithoutRef<'a'> & {
    title: string
    icon?: React.ComponentType<{ className?: string }>
    description?: string
  }
>(({ className, title, children, icon: Icon, description, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <a
          ref={ref}
          className={cn(
            'group relative block select-none rounded-xl p-4 leading-none no-underline outline-none transition-all duration-200',
            'bg-background hover:bg-gradient-to-br hover:from-accent/50 hover:to-accent/30',
            'border border-transparent hover:border-primary/20',
            'hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1',
            'focus:bg-accent focus:text-accent-foreground focus:shadow-lg',
            className
          )}
          {...props}
        >
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-transparent transition-all duration-300 pointer-events-none" />

          <div className="relative space-y-2">
            <div className="flex items-center gap-3">
              {Icon && (
                <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-all duration-200">
                  <Icon className="h-4 w-4 text-primary transition-transform duration-200 group-hover:scale-110 group-hover:rotate-3" />
                </div>
              )}
              <div className="text-sm font-semibold leading-none group-hover:text-primary transition-colors">
                {title}
              </div>
            </div>
            {description && (
              <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground group-hover:text-foreground/80 transition-colors pl-11">
                {description}
              </p>
            )}
          </div>
        </a>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = 'ListItem'

export function MainNavbar() {
  const pathname = usePathname()
  const router = useRouter()
  const { user, userProfile, signOut } = useAuth()
  const [commandOpen, setCommandOpen] = React.useState(false)
  const [quickActionsOpen, setQuickActionsOpen] = React.useState(false)

  // Command palette keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandOpen((open) => !open)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [])

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  const isPathActive = (href: string) => {
    return pathname === href || pathname?.startsWith(`${href}/`)
  }

  const handleCommandSelect = (callback: () => void) => {
    setCommandOpen(false)
    callback()
  }

  // Mock notification count (replace with real data)
  const notificationCount = 3

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      {/* Fixed positioning to account for sidebar */}
      <div className="flex h-16 items-center px-6 gap-3">
        {/* Spacer for sidebar - 320px to move nav items further right */}
        <div className="w-[320px] shrink-0" />

        {/* Navigation Menu - Modern grouped design */}
        <NavigationMenu className="flex-1">
          <NavigationMenuList>
            {/* Dashboard - Standalone */}
            <NavigationMenuItem>
              <Link
                href="/dashboard"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isPathActive('/dashboard') && 'bg-accent text-accent-foreground'
                )}
              >
                <LayoutDashboard className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </NavigationMenuItem>

            {/* Services Group */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  servicesItems.some(item => isPathActive(item.href)) && 'bg-accent/50'
                )}
              >
                Services
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="relative w-[400px] md:w-[500px] lg:w-[600px]">
                  {/* Decorative gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 pointer-events-none rounded-lg" />

                  <ul className="relative grid gap-3 p-6 md:grid-cols-2">
                    {servicesItems.map((item) => (
                      <ListItem
                        key={item.href}
                        title={item.label}
                        href={item.href}
                        icon={item.icon}
                        description={item.description}
                      />
                    ))}
                  </ul>

                  {/* Bottom decorative border */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Library Group */}
            <NavigationMenuItem>
              <NavigationMenuTrigger
                className={cn(
                  libraryItems.some(item => isPathActive(item.href)) && 'bg-accent/50'
                )}
              >
                Library
              </NavigationMenuTrigger>
              <NavigationMenuContent>
                <div className="relative w-[400px] md:w-[600px]">
                  {/* Decorative gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 via-transparent to-primary/5 pointer-events-none rounded-lg" />

                  <ul className="relative grid gap-3 p-6 md:grid-cols-3">
                    {libraryItems.map((item) => (
                      <ListItem
                        key={item.href}
                        title={item.label}
                        href={item.href}
                        icon={item.icon}
                        description={item.description}
                      />
                    ))}
                  </ul>

                  {/* Bottom decorative border */}
                  <div className="h-1 w-full bg-gradient-to-r from-transparent via-secondary/20 to-transparent" />
                </div>
              </NavigationMenuContent>
            </NavigationMenuItem>

            {/* Designer - Standalone */}
            <NavigationMenuItem>
              <Link
                href="/designer"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isPathActive('/designer') && 'bg-accent text-accent-foreground'
                )}
              >
                <Palette className="mr-2 h-4 w-4" />
                Designer
              </Link>
            </NavigationMenuItem>

            {/* Admin - Standalone */}
            <NavigationMenuItem>
              <Link
                href="/admin"
                className={cn(
                  navigationMenuTriggerStyle(),
                  isPathActive('/admin') && 'bg-accent text-accent-foreground'
                )}
              >
                <Shield className="mr-2 h-4 w-4" />
                Admin
              </Link>
            </NavigationMenuItem>
          </NavigationMenuList>
        </NavigationMenu>

        {/* Right Side Actions */}
        <div className="ml-auto flex items-center gap-3 shrink-0">
          {/* Search / Command Palette */}
          <Button
            variant="outline"
            size="sm"
            className="relative h-9 w-9 p-0 md:w-40 md:justify-start md:px-3 transition-all hover:scale-105"
            onClick={() => setCommandOpen(true)}
          >
            <Search className="h-4 w-4 md:mr-2" />
            <span className="hidden md:inline-block text-sm text-muted-foreground">
              Search...
            </span>
            <kbd className="pointer-events-none absolute right-2 top-2 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 md:flex">
              <span className="text-xs">⌘</span>K
            </kbd>
          </Button>

          {/* Quick Actions */}
          <DropdownMenu open={quickActionsOpen} onOpenChange={setQuickActionsOpen}>
            <DropdownMenuTrigger asChild>
              <Button
                variant="default"
                size="icon"
                className="h-9 w-9 transition-all hover:scale-105 hover:shadow-lg hover:shadow-primary/25"
              >
                <Plus className="h-4 w-4" />
                <span className="sr-only">Quick actions</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                Quick Actions
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild>
                <Link
                  href="/ask-expert"
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">New Expert Chat</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/ask-panel"
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-secondary/10">
                      <Users className="h-4 w-4 text-secondary" />
                    </div>
                    <span className="font-medium">New Panel</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/workflows"
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Workflow className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">New Workflow</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild>
                <Link
                  href="/agents"
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <Brain className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Browse Agents</span>
                  </div>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 transition-transform hover:scale-105"
            onClick={() => router.push('/notifications')}
          >
            <Bell className="h-4 w-4" />
            {notificationCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-[10px] flex items-center justify-center"
              >
                {notificationCount}
              </Badge>
            )}
            <span className="sr-only">Notifications</span>
          </Button>

          {/* Theme Toggle */}
          <ThemeToggle />

          {/* User Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="transition-all hover:scale-105 hover:bg-accent/50"
              >
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-64 p-2">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1.5 px-2 py-2">
                  <p className="text-sm font-semibold">My Account</p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground truncate">
                      {userProfile?.full_name || user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem asChild>
                <Link
                  href="/profile"
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <UserCircle className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Profile</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link
                  href="/settings"
                  className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-accent hover:to-accent/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 rounded-md bg-primary/10">
                      <SettingsIcon className="h-4 w-4 text-primary" />
                    </div>
                    <span className="font-medium">Settings</span>
                  </div>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator className="my-2" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="cursor-pointer rounded-lg px-3 py-2.5 transition-all hover:bg-gradient-to-r hover:from-destructive/10 hover:to-destructive/5 text-destructive"
              >
                <div className="flex items-center gap-3">
                  <div className="p-1.5 rounded-md bg-destructive/10">
                    <LogOut className="h-4 w-4 text-destructive" />
                  </div>
                  <span className="font-medium">Sign out</span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Command Palette Dialog */}
      <CommandDialog open={commandOpen} onOpenChange={setCommandOpen}>
        <CommandInput placeholder="Type a command or search..." />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>

          {/* Services */}
          <CommandGroup heading="Services">
            {servicesItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleCommandSelect(() => router.push(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Library */}
          <CommandGroup heading="Library">
            {libraryItems.map((item) => (
              <CommandItem
                key={item.href}
                onSelect={() => handleCommandSelect(() => router.push(item.href))}
              >
                <item.icon className="mr-2 h-4 w-4" />
                <span>{item.label}</span>
              </CommandItem>
            ))}
          </CommandGroup>

          <CommandSeparator />

          {/* Quick Actions */}
          <CommandGroup heading="Actions">
            <CommandItem onSelect={() => handleCommandSelect(() => router.push('/ask-expert'))}>
              <MessageSquare className="mr-2 h-4 w-4" />
              <span>New Expert Chat</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect(() => router.push('/ask-panel'))}>
              <Users className="mr-2 h-4 w-4" />
              <span>New Panel</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect(() => router.push('/workflows'))}>
              <Workflow className="mr-2 h-4 w-4" />
              <span>New Workflow</span>
            </CommandItem>
          </CommandGroup>

          <CommandSeparator />

          {/* Navigation */}
          <CommandGroup heading="Navigation">
            <CommandItem onSelect={() => handleCommandSelect(() => router.push('/dashboard'))}>
              <LayoutDashboard className="mr-2 h-4 w-4" />
              <span>Dashboard</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect(() => router.push('/admin'))}>
              <Shield className="mr-2 h-4 w-4" />
              <span>Admin</span>
            </CommandItem>
            <CommandItem onSelect={() => handleCommandSelect(() => router.push('/settings'))}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              <span>Settings</span>
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>
    </header>
  )
}

'use client'

import * as React from 'react'
import Image from 'next/image'
import { ChevronsUpDown, UserCircle, LogOut, Settings as SettingsIcon } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { useAuth } from '@/lib/auth/supabase-auth-context'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Ask Expert', href: '/ask-expert' },
  { label: 'Ask Panel', href: '/ask-panel' },
  { label: 'Workflows', href: '/workflows' },
  { label: 'Solution Builder', href: '/solution-builder' },
  { label: 'Agents', href: '/agents' },
  { label: 'Tools', href: '/tools' },
  { label: 'Knowledge', href: '/knowledge' },
  { label: 'Personas', href: '/personas' },
  { label: 'JTBD', href: '/jobs-to-be-done' },
  { label: 'Prompt Prism', href: '/prism' },
  { label: 'Admin', href: '/admin' },
]

export function MainNavbar() {
  const pathname = usePathname()
  const { user, userProfile, signOut } = useAuth()

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

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Error signing out:', error)
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-16 items-center px-4">
        {/* Tenant Switcher - With Actual Logos */}
        <div className="flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-12 w-12 rounded-lg p-0 hover:bg-accent"
              >
                <div className="flex aspect-square size-12 items-center justify-center rounded-lg bg-white">
                  <Image
                    src={activeTenant.logo}
                    alt={activeTenant.name}
                    width={48}
                    height={48}
                    className="size-12 object-contain"
                  />
                </div>
                <ChevronsUpDown className="absolute -bottom-1 -right-1 size-3.5 bg-background rounded-full" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              className="w-auto min-w-[80px] rounded-lg"
              align="start"
              side="bottom"
              sideOffset={4}
            >
              {tenants.map((tenant) => (
                <DropdownMenuItem
                  key={tenant.name}
                  onClick={() => setActiveTenant(tenant)}
                  className="gap-2 p-3 cursor-pointer justify-center"
                >
                  <div className="flex size-14 items-center justify-center rounded-lg bg-white border">
                    <Image
                      src={tenant.logo}
                      alt={tenant.name}
                      width={56}
                      height={56}
                      className="size-14 object-contain"
                    />
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Navigation Items - Aligned to start after 16rem (sidebar width) */}
        <nav className="flex items-center gap-1 ml-[calc(16rem-4rem)]">
          {navItems.map((item) => {
            const isActive = pathname === item.href || pathname?.startsWith(`${item.href}/`)
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  className="transition-all"
                >
                  {item.label}
                </Button>
              </Link>
            )
          })}
        </nav>

        {/* User Menu - Right Side */}
        <div className="ml-auto flex items-center gap-2">
          {/* Theme Toggle */}
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <UserCircle className="h-5 w-5" />
                <span className="sr-only">User menu</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium">My Account</p>
                  {user?.email && (
                    <p className="text-xs text-muted-foreground">
                      {userProfile?.full_name || user.email}
                    </p>
                  )}
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <UserCircle className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/settings" className="cursor-pointer">
                  <SettingsIcon className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut} className="cursor-pointer">
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

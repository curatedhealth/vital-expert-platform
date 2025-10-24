'use client';

import {
  Users,
  User,
  Settings,
  LogOut,
  Plus,
} from 'lucide-react';
import Link from 'next/link';

import { Avatar, AvatarFallback, AvatarImage } from '@/shared/components/ui/avatar';
import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import { cn } from '@/shared/utils';

interface PanelNavbarProps {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
  onNewPanel?: () => void;
  onSignOut?: () => void;
  showUserMenu?: boolean;
  showQuickActions?: boolean;
  className?: string;
}

export function PanelNavbar({
  user,
  onNewPanel,
  onSignOut,
  showUserMenu = true,
  showQuickActions = true,
  className
}: PanelNavbarProps) {
  return (
    <div className={cn("border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60", className)}>
      <div className="flex h-14 items-center px-4">
        {/* Logo and Brand */}
        <div className="flex items-center gap-3 mr-6">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <Users className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold">Ask Panel</span>
              <span className="text-xs text-muted-foreground">VITAL AI</span>
            </div>
          </Link>
          <Badge variant="secondary" className="text-xs bg-purple-100 text-purple-700">
            Advisory Board
          </Badge>
        </div>

        {/* Navigation Links - Standardized */}
        <nav className="hidden md:flex items-center space-x-4 text-sm font-medium flex-1">
          <Link href="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors">
            Dashboard
          </Link>
          <Link href="/chat" className="text-muted-foreground hover:text-foreground transition-colors">
            Ask Expert
          </Link>
          <Link href="/ask-panel" className="text-foreground font-medium">
            Ask Panel
          </Link>
          <Link href="/ask-team" className="text-muted-foreground hover:text-foreground transition-colors">
            Ask Team
          </Link>
          <Link href="/agents" className="text-muted-foreground hover:text-foreground transition-colors">
            Agents
          </Link>
          <Link href="/solution-builder" className="text-muted-foreground hover:text-foreground transition-colors">
            Build Solution
          </Link>
          <Link href="/knowledge" className="text-muted-foreground hover:text-foreground transition-colors">
            Knowledge
          </Link>
          <Link href="/prompts" className="text-muted-foreground hover:text-foreground transition-colors">
            Prompt PRISM
          </Link>
          <Link href="/capabilities" className="text-muted-foreground hover:text-foreground transition-colors">
            Capabilities
          </Link>
          <Link href="/ask-team" className="text-muted-foreground hover:text-foreground transition-colors">
            Workflows
          </Link>
        </nav>

        {/* Quick Actions */}
        {showQuickActions && (
          <div className="flex items-center gap-2 mr-4">
            <Button
              variant="outline"
              size="sm"
              onClick={onNewPanel}
              className="hidden sm:flex"
            >
              <Plus className="h-4 w-4 mr-1" />
              New Panel
            </Button>
          </div>
        )}

        {/* User Menu */}
        {showUserMenu && user && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                <Avatar className="h-9 w-9">
                  <AvatarImage src={user.avatar} alt={user.name} />
                  <AvatarFallback>
                    {user.name?.charAt(0)?.toUpperCase() || <User className="h-4 w-4" />}
                  </AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.name}</p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Settings className="mr-2 h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Log out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* Sign In Button (when no user) */}
        {showUserMenu && !user && (
          <Button variant="outline" size="sm">
            Sign In
          </Button>
        )}
      </div>
    </div>
  );
}
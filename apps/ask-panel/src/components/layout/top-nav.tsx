/**
 * Global Top Navigation Bar
 * Appears across all pages in the application
 */

'use client';

import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Sparkles,
  LayoutDashboard,
  MessageSquare,
  Users,
  GitBranch,
  Box,
  Settings,
  Bell,
  User,
  Users as UsersIcon,
  BookOpen,
  FileText,
} from 'lucide-react';

export function TopNav() {
  const router = useRouter();
  const pathname = usePathname();

  // Port 3001 is digital-health-startup (Ask Expert)
  // Port 3002 could be ask-panel standalone
  const ASK_EXPERT_URL = 'http://localhost:3001';
  
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, external: false },
    { label: 'Ask Expert', path: ASK_EXPERT_URL, icon: MessageSquare, external: true },
    { label: 'Ask Panel', path: '/panels', icon: Users, external: false },
    { label: 'Workflows', path: '/workflows', icon: GitBranch, external: false },
    { label: 'Solution Builder', path: '/solution-builder', icon: Box, external: false },
    { label: 'Agents', path: '/agents', icon: UsersIcon, external: false },
    { label: 'Knowledge', path: '/knowledge', icon: BookOpen, external: false },
    { label: 'Prompts', path: '/prompts', icon: FileText, external: false },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard') return pathname === '/dashboard';
    return pathname?.startsWith(path);
  };

  return (
    <nav className="border-b bg-white sticky top-0 z-50 shadow-sm">
      <div className="max-w-full mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push('/dashboard')}>
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold leading-tight">VITAL Path</h1>
              <p className="text-xs text-muted-foreground leading-tight">Healthcare Technology Platform</p>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = !item.external && isActive(item.path);
              
              if (item.external) {
                // External link - open in new tab or same tab
                return (
                  <Button
                    key={item.path}
                    variant="ghost"
                    size="sm"
                    onClick={() => window.location.href = item.path}
                    className="gap-2 text-muted-foreground"
                  >
                    <Icon className="w-4 h-4" />
                    {item.label}
                  </Button>
                );
              }
              
              return (
                <Button
                  key={item.path}
                  variant={active ? "default" : "ghost"}
                  size="sm"
                  onClick={() => router.push(item.path)}
                  className={`gap-2 ${active ? '' : 'text-muted-foreground'}`}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Right Actions */}
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
            </Button>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-2 pl-2 border-l">
              <Badge variant="outline">Demo Tenant</Badge>
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}


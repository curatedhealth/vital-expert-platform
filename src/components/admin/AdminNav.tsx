'use client';

import { 
  FileText, 
  Users, 
  Key, 
  Settings,
  BarChart3,
  TestTube
} from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const adminNavItems = [
  {
    title: 'Overview',
    href: '/admin',
    icon: BarChart3,
    description: 'Admin dashboard overview'
  },
  {
    title: 'Audit Logs',
    href: '/admin/audit-logs',
    icon: FileText,
    description: 'View system audit logs'
  },
  {
    title: 'User Management',
    href: '/admin/users',
    icon: Users,
    description: 'Manage users and roles'
  },
  {
    title: 'API Keys',
    href: '/admin/api-keys',
    icon: Key,
    description: 'Manage API keys and tokens'
  },
  {
    title: 'LLM Management',
    href: '/dashboard/llm-management?view=admin',
    icon: Settings,
    description: 'LLM provider administration'
  },
  {
    title: 'RBAC Testing',
    href: '/admin/rbac-test',
    icon: TestTube,
    description: 'Test RBAC permissions and roles'
  },
  {
    title: 'User Switcher',
    href: '/admin/dev-user-switcher',
    icon: User,
    description: 'Switch between different user roles (Dev only)'
  }
];

interface AdminNavProps {
  className?: string;
}

export default function AdminNav({ className }: AdminNavProps) {
  const pathname = usePathname();

  return (
    <nav className={cn('space-y-1', className)}>
      {adminNavItems.map((item) => {
        const isActive = pathname === item.href || 
          (item.href.includes('?') && pathname === item.href.split('?')[0]);
        
        return (
          <Link
            key={item.href}
            href={item.href}
            className={cn(
              'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:text-foreground hover:bg-muted'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'
              )}
            />
            <div className="flex-1">
              <div className="font-medium">{item.title}</div>
              <div className="text-xs opacity-75">{item.description}</div>
            </div>
          </Link>
        );
      })}
    </nav>
  );
}

import { requireAdmin } from '@/lib/auth/requireAdmin';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { 
  FileText, 
  Users, 
  Key, 
  Settings,
  BarChart3,
  Activity,
  Shield,
  Building2,
  Cog,
  Database,
  DollarSign
} from 'lucide-react';

export default async function AdminPage() {
  const { user, isSuperAdmin } = await requireAdmin();

  const adminFeatures = [
    {
      title: 'Audit Logs',
      description: 'View system audit logs and security events',
      href: '/admin/audit-logs',
      icon: FileText,
      color: 'bg-blue-500'
    },
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      href: '/admin/users',
      icon: Users,
      color: 'bg-green-500'
    },
    {
      title: 'API Keys',
      description: 'Manage API keys and authentication tokens',
      href: '/admin/api-keys',
      icon: Key,
      color: 'bg-purple-500'
    },
    {
      title: 'Tenant Management',
      description: 'Manage organizations, departments, and quotas',
      href: '/admin/tenants',
      icon: Building2,
      color: 'bg-indigo-500'
    },
    {
      title: 'Health & Reliability',
      description: 'Monitor system health, SLOs, and incidents',
      href: '/admin/health',
      icon: Activity,
      color: 'bg-red-500'
    },
    {
      title: 'Compliance & Reports',
      description: 'HIPAA, SOC2, FDA compliance and incident playbooks',
      href: '/admin/compliance',
      icon: Shield,
      color: 'bg-amber-500'
    },
    {
      title: 'LLM Governance',
      description: 'Prompt policies, approval workflows, and change management',
      href: '/admin/governance',
      icon: FileText,
      color: 'bg-indigo-500'
    },
    {
      title: 'Identity & Access',
      description: 'SSO, MFA, access reviews, and session security',
      href: '/admin/identity',
      icon: Shield,
      color: 'bg-cyan-500'
    },
    {
      title: 'Immutable Audit',
      description: 'Hash-chained audit logs, WORM storage, and SIEM export',
      href: '/admin/audit-immutable',
      icon: FileText,
      color: 'bg-slate-500'
    },
    {
      title: 'System Settings',
      description: 'Feature flags, system config, and maintenance mode',
      href: '/admin/settings',
      icon: Cog,
      color: 'bg-gray-500'
    },
    {
      title: 'Backup & Recovery',
      description: 'Database backups, restore operations, and scheduling',
      href: '/admin/backup',
      icon: Database,
      color: 'bg-blue-500'
    },
    {
      title: 'Cost Management',
      description: 'Monitor costs, budgets, anomalies, and usage forecasting',
      href: '/admin/costs',
      icon: DollarSign,
      color: 'bg-emerald-500'
    },
    {
      title: 'LLM Management',
      description: 'Configure LLM providers and models',
      href: '/dashboard/llm-management?view=admin',
      icon: Settings,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-200 pb-5">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">
          Welcome back, {user.email}. Manage your platform settings and monitor system activity.
        </p>
        {isSuperAdmin && (
          <div className="mt-2 flex items-center text-sm text-amber-600">
            <Shield className="h-4 w-4 mr-1" />
            Super Admin privileges active
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Operational</div>
            <p className="text-xs text-muted-foreground">
              All systems running normally
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              View user management for details
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Security Events</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">-</div>
            <p className="text-xs text-muted-foreground">
              View audit logs for details
            </p>
          </CardContent>
        </Card>
      </div>

          {/* Admin Features */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Administrative Tools</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {adminFeatures.map((feature) => (
            <Card key={feature.href} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${feature.color} mb-2`}>
                  <feature.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{feature.title}</CardTitle>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="w-full">
                  <Link href={feature.href}>
                    Access Tool
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
